#!/usr/bin/env bun
/**
 * Phase 11B: Control Pair Revision
 *
 * Screens 4 new control pair candidates and validates the ones that pass.
 * Two-stage design:
 *
 * Stage 1 (Screening): For each of 4 candidates, run 10 reps across 6 models
 *   (original 4 + 2 stress-test from Phase 11A). A candidate passes if top
 *   waypoint frequency < 0.15 AND entropy > 5.0 across at least 4/6 models.
 *
 * Stage 2 (Validation): For passing candidates (up to best 3), run 15 reps
 *   across 8 models (original 4 + 4 from Phase 11A). Validate that no single
 *   waypoint exceeds 0.10 for any model.
 *
 * Output directory: results/control-revision/
 *
 * Usage:
 *   bun run experiments/11b-control-revision.ts
 *   bun run experiments/11b-control-revision.ts --dry-run
 */

import { Command } from "commander";
import { writeFile, mkdir, readdir, readFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { MODELS, PHASE11_MODELS } from "../src/data/pairs.ts";
import {
  PHASE11B_CONTROL_CANDIDATES,
  CONTROL_SCREENING_THRESHOLDS,
} from "../src/data/pairs-phase11.ts";
import type {
  Phase11ControlCandidate,
  ControlScreeningResult,
  ConceptPair,
  ModelConfig,
  PromptFormat,
  ElicitationRequest,
  ElicitationResult,
} from "../src/types.ts";
import { buildPrompt, elicit } from "../src/index.ts";
import { extractWaypoints } from "../src/canonicalize.ts";
import { Scheduler, parseModelConcurrency } from "../src/scheduler.ts";
import { computeWaypointFrequencies, computeSalienceEntropy } from "../src/metrics.ts";

// -- Constants ----------------------------------------------------------------

const PROMPT_FORMAT: PromptFormat = "semantic";
const TEMPERATURE = 0.7;
const WAYPOINT_COUNT = 7;
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_OUTPUT_DIR = "results/control-revision";
const SCREENING_REPS = 10;
const VALIDATION_REPS = 15;
const VALIDATION_MAX_TOP_FREQ = 0.10;
const MAX_PASSING_FOR_VALIDATION = 3;

// -- Synthetic Pair Creation --------------------------------------------------

function makeSyntheticPair(candidate: Phase11ControlCandidate): ConceptPair {
  return {
    id: candidate.id,
    from: candidate.from,
    to: candidate.to,
    category: "control-random",
    concreteness: ["abstract", "abstract"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "reporting",
    notes: `Phase 11B control revision: "${candidate.from}" -> "${candidate.to}" | ${candidate.rationale}`,
  };
}

// -- Resume Support -----------------------------------------------------------

function runKey(pairId: string, modelId: string): string {
  return `${pairId}::${modelId}`;
}

async function loadExistingResults(
  resultsDir: string,
  prefix: string,
): Promise<{ counts: Map<string, number>; results: ElicitationResult[] }> {
  const counts = new Map<string, number>();
  const results: ElicitationResult[] = [];

  if (!existsSync(resultsDir)) return { counts, results };

  let files: string[];
  try {
    files = await readdir(resultsDir);
  } catch {
    return { counts, results };
  }

  for (const file of files) {
    if (!file.endsWith(".json") || !file.startsWith(prefix)) continue;
    try {
      const content = await readFile(path.join(resultsDir, file), "utf-8");
      const result = JSON.parse(content) as ElicitationResult;
      if (result.pair?.id && result.modelShortId) {
        results.push(result);
        if (!result.failureMode) {
          const key = runKey(result.pair.id, result.modelShortId);
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      }
    } catch {
      // Skip malformed
    }
  }

  return { counts, results };
}

// -- Utility ------------------------------------------------------------------

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// -- Main ---------------------------------------------------------------------

async function main() {
  const program = new Command();

  program
    .name("11b-control-revision")
    .description(
      "Run Phase 11B control pair revision: screen + validate new control candidates",
    )
    .option("--dry-run", "print the experiment plan without executing")
    .option("--output <dir>", "output directory", DEFAULT_OUTPUT_DIR)
    .option("--concurrency <n>", "global concurrency limit", String(DEFAULT_CONCURRENCY))
    .option(
      "--model-concurrency <spec>",
      'per-model concurrency, e.g., "deepseek=2,mistral=2"',
    )
    .option("--throttle <ms>", "per-model delay between requests", "0")
    .option("--patient", "tolerate slow models: 300s request timeout (default: ON)", true);

  program.parse();
  const opts = program.opts();

  const outputDir = opts.output as string;
  const screeningDir = path.join(outputDir, "screening");
  const validationDir = path.join(outputDir, "validation");
  const dryRun = opts.dryRun === true;

  const globalConcurrency = parseInt(opts.concurrency as string, 10) || DEFAULT_CONCURRENCY;
  const perModelConcurrency = opts.modelConcurrency
    ? parseModelConcurrency(opts.modelConcurrency as string)
    : new Map<string, number>();
  const throttleMs = parseInt(opts.throttle as string, 10) || 0;
  const patientMode = opts.patient !== false;

  // Patient mode ON by default: generous timeouts
  const requestTimeoutMs = patientMode ? 300_000 : 60_000;

  // Resolve screening models: original 4 + first 2 of PHASE11_MODELS (deepseek, mistral)
  const stressTestModels = PHASE11_MODELS.slice(0, 2);
  const screeningModels: ModelConfig[] = [...MODELS, ...stressTestModels];

  // Resolve validation models: original 4 + all 4 PHASE11_MODELS
  const validationModels: ModelConfig[] = [...MODELS, ...PHASE11_MODELS];

  const candidates = PHASE11B_CONTROL_CANDIDATES;

  // Print header
  console.log("=== Phase 11B: Control Pair Revision ===\n");
  if (patientMode) {
    console.log(`Mode:                    PATIENT (${requestTimeoutMs / 1000}s request timeout)`);
  }
  console.log(`Candidates:              ${candidates.length}`);
  console.log(`Screening models:        ${screeningModels.map((m) => m.displayName).join(", ")}`);
  console.log(`Validation models:       ${validationModels.map((m) => m.displayName).join(", ")}`);
  console.log(`Screening reps:          ${SCREENING_REPS}`);
  console.log(`Validation reps:         ${VALIDATION_REPS}`);
  console.log(`Screening budget:        ${candidates.length * screeningModels.length * SCREENING_REPS} runs`);
  console.log(`Max validation budget:   ${MAX_PASSING_FOR_VALIDATION * validationModels.length * VALIDATION_REPS} runs`);
  console.log("");

  console.log("Candidates:");
  for (const c of candidates) {
    console.log(`  ${c.id}: "${c.from}" -> "${c.to}"`);
    console.log(`    Rationale: ${c.rationale}`);
  }
  console.log("");

  console.log("Screening thresholds:");
  console.log(`  Max top waypoint frequency: ${CONTROL_SCREENING_THRESHOLDS.maxTopFrequency}`);
  console.log(`  Min Shannon entropy:        ${CONTROL_SCREENING_THRESHOLDS.minEntropy}`);
  console.log(`  Min models passing:         ${CONTROL_SCREENING_THRESHOLDS.minModelsPass}/${screeningModels.length}`);
  console.log(`  Validation max top freq:    ${VALIDATION_MAX_TOP_FREQ}`);
  console.log("");

  if (dryRun) {
    console.log("Stage 1 (Screening):");
    for (const c of candidates) {
      console.log(`  Would screen ${c.id} across ${screeningModels.length} models x ${SCREENING_REPS} reps`);
    }
    console.log("");
    console.log("Stage 2 (Validation):");
    console.log(`  Up to ${MAX_PASSING_FOR_VALIDATION} passing candidates x ${validationModels.length} models x ${VALIDATION_REPS} reps`);
    console.log("");
    console.log("(Dry run -- no API calls made.)");
    return;
  }

  // Ensure output directories
  await mkdir(screeningDir, { recursive: true });
  await mkdir(validationDir, { recursive: true });

  const experimentStartTime = Date.now();

  // ========================================================================
  // Stage 1: Screening
  // ========================================================================

  console.log("=== Stage 1: Screening ===\n");

  // Load existing screening results
  const existingScreening = await loadExistingResults(screeningDir, "");
  if (existingScreening.results.length > 0) {
    console.log(`Found ${existingScreening.results.length} existing screening results\n`);
  }

  // Build screening requests
  const screeningRequests: ElicitationRequest[] = [];

  for (const candidate of candidates) {
    const pair = makeSyntheticPair(candidate);
    for (const model of screeningModels) {
      const key = runKey(pair.id, model.id);
      const existingCount = existingScreening.counts.get(key) ?? 0;
      const needed = Math.max(0, SCREENING_REPS - existingCount);

      if (needed > 0 && existingCount > 0) {
        console.log(`  ${candidate.id} (${model.id}): have ${existingCount}, need ${needed} more`);
      }

      for (let r = 0; r < needed; r++) {
        screeningRequests.push({
          model,
          pair,
          waypointCount: WAYPOINT_COUNT,
          promptFormat: PROMPT_FORMAT,
          temperature: TEMPERATURE,
          ...(patientMode ? { requestTimeoutMs } : {}),
        });
      }
    }
  }

  console.log(`Screening runs needed: ${screeningRequests.length}\n`);

  const allScreeningResults: ElicitationResult[] = [...existingScreening.results];

  if (screeningRequests.length > 0) {
    let screeningCompleted = 0;

    const screeningScheduler = new Scheduler(
      { globalConcurrency, perModelConcurrency, throttleMs },
      {
        onResult: async (result: ElicitationResult) => {
          // Write result atomically
          const resultPath = path.join(screeningDir, `${result.runId}.json`);
          const tmpPath = `${resultPath}.tmp.${Date.now()}`;
          try {
            await writeFile(tmpPath, JSON.stringify(result, null, 2));
            await rename(tmpPath, resultPath);
          } catch (err: unknown) {
            console.error(
              `\nFailed to persist ${result.runId}:`,
              err instanceof Error ? err.message : err,
            );
          }
          allScreeningResults.push(result);
          screeningCompleted++;

          const pct = Math.round((screeningCompleted / screeningRequests.length) * 100);
          process.stdout.write(
            `\r  Screening: ${screeningCompleted}/${screeningRequests.length} (${pct}%)    `,
          );
        },
        onProgress: () => {},
      },
    );

    await screeningScheduler.run(screeningRequests);
    console.log("\n");
  }

  // Compute screening metrics
  const screeningResults: ControlScreeningResult[] = [];

  for (const candidate of candidates) {
    for (const model of screeningModels) {
      const runs = allScreeningResults
        .filter(
          (r) => r.pair.id === candidate.id && r.modelShortId === model.id && !r.failureMode,
        )
        .map((r) => r.canonicalizedWaypoints);

      if (runs.length === 0) continue;

      const freqs = computeWaypointFrequencies(runs);
      const topEntry = freqs.length > 0 ? freqs[0] : { waypoint: "(none)", frequency: 0 };
      const entropy = computeSalienceEntropy(freqs);

      screeningResults.push({
        candidateId: candidate.id,
        modelId: model.id,
        topWaypoint: topEntry.waypoint,
        topFrequency: topEntry.frequency,
        entropy,
        runCount: runs.length,
        passesFrequencyGate: topEntry.frequency < CONTROL_SCREENING_THRESHOLDS.maxTopFrequency,
        passesEntropyGate: entropy > CONTROL_SCREENING_THRESHOLDS.minEntropy,
      });
    }
  }

  // Write screening results
  const screeningResultsPath = path.join(outputDir, "screening-results.json");
  const tmpScreening = `${screeningResultsPath}.tmp.${Date.now()}`;
  await writeFile(tmpScreening, JSON.stringify(screeningResults, null, 2));
  await rename(tmpScreening, screeningResultsPath);

  // Print screening results table
  console.log("Screening Results:");
  console.log("-".repeat(100));
  console.log(
    `${"Candidate".padEnd(32)} ${"Model".padEnd(18)} ${"TopFreq".padEnd(8)} ${"Entropy".padEnd(8)} ${"Freq?".padEnd(6)} ${"Ent?".padEnd(6)} Runs`,
  );
  console.log("-".repeat(100));

  for (const sr of screeningResults) {
    const freqFlag = sr.passesFrequencyGate ? "PASS" : "FAIL";
    const entFlag = sr.passesEntropyGate ? "PASS" : "FAIL";
    console.log(
      `${sr.candidateId.padEnd(32)} ${sr.modelId.padEnd(18)} ${sr.topFrequency.toFixed(3).padEnd(8)} ${sr.entropy.toFixed(2).padEnd(8)} ${freqFlag.padEnd(6)} ${entFlag.padEnd(6)} ${sr.runCount}`,
    );
  }
  console.log("");

  // Classify candidates as pass/fail
  const candidatePassFail: Array<{
    candidateId: string;
    modelsPassingBoth: number;
    totalModels: number;
    overallPass: boolean;
    maxTopFrequency: number;
    minEntropy: number;
  }> = [];

  const passingCandidates: Phase11ControlCandidate[] = [];

  for (const candidate of candidates) {
    const candidateScreening = screeningResults.filter((sr) => sr.candidateId === candidate.id);
    const modelsPassingBoth = candidateScreening.filter(
      (sr) => sr.passesFrequencyGate && sr.passesEntropyGate,
    ).length;
    const maxTopFreq = Math.max(...candidateScreening.map((sr) => sr.topFrequency), 0);
    const minEnt = Math.min(...candidateScreening.map((sr) => sr.entropy), Infinity);
    const overallPass = modelsPassingBoth >= CONTROL_SCREENING_THRESHOLDS.minModelsPass;

    candidatePassFail.push({
      candidateId: candidate.id,
      modelsPassingBoth,
      totalModels: candidateScreening.length,
      overallPass,
      maxTopFrequency: maxTopFreq,
      minEntropy: minEnt === Infinity ? 0 : minEnt,
    });

    if (overallPass) {
      passingCandidates.push(candidate);
    }
  }

  console.log("Screening Summary:");
  for (const cpf of candidatePassFail) {
    const status = cpf.overallPass ? "PASS" : "FAIL";
    console.log(
      `  ${cpf.candidateId}: ${status} (${cpf.modelsPassingBoth}/${cpf.totalModels} models pass both gates, maxTopFreq=${cpf.maxTopFrequency.toFixed(3)}, minEntropy=${cpf.minEntropy.toFixed(2)})`,
    );
  }
  console.log(`\nPassing candidates: ${passingCandidates.length}`);
  console.log("");

  // ========================================================================
  // Stage 2: Validation
  // ========================================================================

  // Take up to best 3 passing candidates (sorted by lowest maxTopFreq)
  const validationCandidates = passingCandidates
    .map((c) => {
      const cpf = candidatePassFail.find((x) => x.candidateId === c.id)!;
      return { candidate: c, maxTopFreq: cpf.maxTopFrequency };
    })
    .sort((a, b) => a.maxTopFreq - b.maxTopFreq)
    .slice(0, MAX_PASSING_FOR_VALIDATION)
    .map((x) => x.candidate);

  interface ValidationEntry {
    candidateId: string;
    modelId: string;
    topWaypoint: string;
    topFrequency: number;
    entropy: number;
    uniqueWaypoints: number;
    runCount: number;
    passesControl: boolean;
  }

  let validationEntries: ValidationEntry[] = [];

  if (validationCandidates.length === 0) {
    console.log("=== Stage 2: Validation (SKIPPED -- no passing candidates) ===\n");
  } else {
    console.log("=== Stage 2: Validation ===\n");
    console.log(`Validating ${validationCandidates.length} candidate(s): ${validationCandidates.map((c) => c.id).join(", ")}`);
    console.log(`Models: ${validationModels.map((m) => m.displayName).join(", ")}`);
    console.log(`Reps: ${VALIDATION_REPS} per candidate per model`);
    console.log("");

    // Load existing validation results
    const existingValidation = await loadExistingResults(validationDir, "");
    if (existingValidation.results.length > 0) {
      console.log(`Found ${existingValidation.results.length} existing validation results\n`);
    }

    // Build validation requests
    const validationRequests: ElicitationRequest[] = [];

    for (const candidate of validationCandidates) {
      const pair = makeSyntheticPair(candidate);
      for (const model of validationModels) {
        const key = runKey(pair.id, model.id);
        const existingCount = existingValidation.counts.get(key) ?? 0;
        const needed = Math.max(0, VALIDATION_REPS - existingCount);

        if (needed > 0 && existingCount > 0) {
          console.log(`  ${candidate.id} (${model.id}): have ${existingCount}, need ${needed} more`);
        }

        for (let r = 0; r < needed; r++) {
          validationRequests.push({
            model,
            pair,
            waypointCount: WAYPOINT_COUNT,
            promptFormat: PROMPT_FORMAT,
            temperature: TEMPERATURE,
            ...(patientMode ? { requestTimeoutMs } : {}),
          });
        }
      }
    }

    console.log(`Validation runs needed: ${validationRequests.length}\n`);

    const allValidationResults: ElicitationResult[] = [...existingValidation.results];

    if (validationRequests.length > 0) {
      let validationCompleted = 0;

      const validationScheduler = new Scheduler(
        { globalConcurrency, perModelConcurrency, throttleMs },
        {
          onResult: async (result: ElicitationResult) => {
            const resultPath = path.join(validationDir, `${result.runId}.json`);
            const tmpPath = `${resultPath}.tmp.${Date.now()}`;
            try {
              await writeFile(tmpPath, JSON.stringify(result, null, 2));
              await rename(tmpPath, resultPath);
            } catch (err: unknown) {
              console.error(
                `\nFailed to persist ${result.runId}:`,
                err instanceof Error ? err.message : err,
              );
            }
            allValidationResults.push(result);
            validationCompleted++;

            const pct = Math.round((validationCompleted / validationRequests.length) * 100);
            process.stdout.write(
              `\r  Validation: ${validationCompleted}/${validationRequests.length} (${pct}%)    `,
            );
          },
          onProgress: () => {},
        },
      );

      await validationScheduler.run(validationRequests);
      console.log("\n");
    }

    // Compute validation metrics
    for (const candidate of validationCandidates) {
      for (const model of validationModels) {
        const runs = allValidationResults
          .filter(
            (r) => r.pair.id === candidate.id && r.modelShortId === model.id && !r.failureMode,
          )
          .map((r) => r.canonicalizedWaypoints);

        if (runs.length === 0) continue;

        const freqs = computeWaypointFrequencies(runs);
        const topEntry = freqs.length > 0 ? freqs[0] : { waypoint: "(none)", frequency: 0 };
        const entropy = computeSalienceEntropy(freqs);
        const uniqueWaypoints = freqs.length;

        validationEntries.push({
          candidateId: candidate.id,
          modelId: model.id,
          topWaypoint: topEntry.waypoint,
          topFrequency: topEntry.frequency,
          entropy,
          uniqueWaypoints,
          runCount: runs.length,
          passesControl: topEntry.frequency <= VALIDATION_MAX_TOP_FREQ,
        });
      }
    }

    // Write validation results
    const validationResultsPath = path.join(outputDir, "validation-results.json");
    const tmpValidation = `${validationResultsPath}.tmp.${Date.now()}`;
    await writeFile(tmpValidation, JSON.stringify(validationEntries, null, 2));
    await rename(tmpValidation, validationResultsPath);

    // Print validation summary
    console.log("Validation Results:");
    console.log("-".repeat(90));
    console.log(
      `${"Candidate".padEnd(32)} ${"Model".padEnd(18)} ${"TopFreq".padEnd(8)} ${"Entropy".padEnd(8)} ${"Pass?".padEnd(6)} Runs`,
    );
    console.log("-".repeat(90));

    for (const ve of validationEntries) {
      const passFlag = ve.passesControl ? "PASS" : "FAIL";
      console.log(
        `${ve.candidateId.padEnd(32)} ${ve.modelId.padEnd(18)} ${ve.topFrequency.toFixed(3).padEnd(8)} ${ve.entropy.toFixed(2).padEnd(8)} ${passFlag.padEnd(6)} ${ve.runCount}`,
      );
    }
    console.log("");

    // Per-candidate validation summary
    console.log("Validation Summary:");
    for (const candidate of validationCandidates) {
      const entries = validationEntries.filter((ve) => ve.candidateId === candidate.id);
      const passing = entries.filter((ve) => ve.passesControl).length;
      const meanTopFreq = entries.reduce((s, e) => s + e.topFrequency, 0) / (entries.length || 1);
      const meanEntropy = entries.reduce((s, e) => s + e.entropy, 0) / (entries.length || 1);
      const allPass = passing === entries.length;
      const status = allPass ? "RECOMMENDED" : `${passing}/${entries.length} models pass`;
      console.log(
        `  ${candidate.id}: ${status} (meanTopFreq=${meanTopFreq.toFixed(3)}, meanEntropy=${meanEntropy.toFixed(2)})`,
      );
    }
    console.log("");
  }

  // ========================================================================
  // Write Summary
  // ========================================================================

  const duration = Date.now() - experimentStartTime;

  const screeningSummary = candidatePassFail.map((cpf) => ({
    candidateId: cpf.candidateId,
    modelsPassingFrequency: screeningResults.filter(
      (sr) => sr.candidateId === cpf.candidateId && sr.passesFrequencyGate,
    ).length,
    modelsPassingEntropy: screeningResults.filter(
      (sr) => sr.candidateId === cpf.candidateId && sr.passesEntropyGate,
    ).length,
    totalModels: cpf.totalModels,
    overallPass: cpf.overallPass,
    maxTopFrequency: cpf.maxTopFrequency,
    minEntropy: cpf.minEntropy,
  }));

  const validationSummaryEntries = validationCandidates.map((c) => {
    const entries = validationEntries.filter((ve) => ve.candidateId === c.id);
    const passing = entries.filter((ve) => ve.passesControl).length;
    const meanTopFreq = entries.reduce((s, e) => s + e.topFrequency, 0) / (entries.length || 1);
    const meanEntropy = entries.reduce((s, e) => s + e.entropy, 0) / (entries.length || 1);
    return {
      candidateId: c.id,
      modelsPassingControl: passing,
      totalModels: entries.length,
      meanTopFrequency: meanTopFreq,
      meanEntropy,
      recommended: passing === entries.length,
    };
  });

  const recommendedControls = validationSummaryEntries
    .filter((vs) => vs.recommended)
    .map((vs) => vs.candidateId);

  const summary = {
    experiment: "control-revision",
    phase: "11B",
    startedAt: new Date(experimentStartTime).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: duration,
    metadata: {
      candidates: candidates.map((c) => c.id),
      screeningModels: screeningModels.map((m) => m.id),
      validationModels: validationModels.map((m) => m.id),
      totalScreeningRuns: allScreeningResults.length,
      totalValidationRuns: validationEntries.length > 0
        ? validationEntries.reduce((s, e) => s + e.runCount, 0)
        : 0,
    },
    screeningResults,
    screeningSummary,
    validationResults: validationEntries,
    validationSummary: validationSummaryEntries,
    r5Recommendation: {
      recommendedControls,
      rationale:
        recommendedControls.length > 0
          ? `${recommendedControls.length} candidate(s) passed both screening and validation. No single waypoint exceeds ${VALIDATION_MAX_TOP_FREQ} across all ${validationModels.length} models.`
          : "No candidates passed both screening and validation gates.",
      passingCandidateCount: recommendedControls.length,
    },
  };

  const summaryPath = path.join(outputDir, "control-revision-summary.json");
  const tmpSummary = `${summaryPath}.tmp.${Date.now()}`;
  await writeFile(tmpSummary, JSON.stringify(summary, null, 2));
  await rename(tmpSummary, summaryPath);

  // Final output
  console.log("=== Phase 11B: Control Pair Revision Complete ===\n");
  console.log(`Duration:               ${formatDuration(duration)}`);
  console.log(`Screening runs:         ${allScreeningResults.length}`);
  console.log(`Candidates screened:    ${candidates.length}`);
  console.log(`Candidates passing:     ${passingCandidates.length}`);
  console.log(`Candidates validated:   ${validationCandidates.length}`);
  console.log(`Recommended controls:   ${recommendedControls.length > 0 ? recommendedControls.join(", ") : "(none)"}`);
  console.log("");
  console.log(`Summary: ${summaryPath}`);
  console.log(`Results: ${outputDir}/`);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
