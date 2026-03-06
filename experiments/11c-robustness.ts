#!/usr/bin/env bun
/**
 * Phase 11C: Multiverse Robustness Experiment
 *
 * Tests whether R1 (gait), R2 (asymmetry), and bridge bottleneck behavior
 * survive variations in waypoint count (5, 9) and temperature (0.5, 0.9).
 *
 * Design: 2x2 grid across 3 models x 6 pairs x 15 reps per condition.
 *
 * Conditions (the 2x2 grid):
 *   - 5 waypoints, temp 0.5
 *   - 5 waypoints, temp 0.9
 *   - 9 waypoints, temp 0.5
 *   - 9 waypoints, temp 0.9
 *   - Baseline (7 waypoints, temp 0.7) is reused from prior phases -- no new runs.
 *
 * Models: Claude Sonnet 4.6, GPT-5.2, DeepSeek V3.2
 *
 * Pairs (6 total):
 *   Forward: light->color, hot->cold, emotion->melancholy, stapler->monsoon
 *   Reverse: cold->hot, melancholy->emotion (for asymmetry)
 *
 * Total budget: 4 conditions x 6 pairs x 15 reps x 3 models = 1,080 runs
 *
 * Output directory: results/robustness/
 *
 * Usage:
 *   bun run experiments/11c-robustness.ts
 *   bun run experiments/11c-robustness.ts --dry-run
 *   bun run experiments/11c-robustness.ts --patient
 */

import { Command } from "commander";
import { writeFile, mkdir, readdir, readFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { MODELS, PHASE11_MODELS } from "../src/data/pairs.ts";
import {
  PHASE11C_ALL_PAIRS,
  PHASE11C_MODEL_IDS,
  ROBUSTNESS_CONDITIONS,
} from "../src/data/pairs-phase11.ts";
import type {
  Phase11RobustnessPair,
  RobustnessCondition,
  ConceptPair,
  ElicitationRequest,
  ElicitationResult,
  PromptFormat,
  ModelConfig,
} from "../src/types.ts";
import { buildPrompt } from "../src/index.ts";
import { Scheduler, parseModelConcurrency } from "../src/scheduler.ts";

// -- Constants ----------------------------------------------------------------

const PROMPT_FORMAT: PromptFormat = "semantic";
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_MODEL_CONCURRENCY = "claude=3,gpt=3,deepseek=2";
const DEFAULT_OUTPUT_DIR = "results/robustness";
const FULL_RUN_REPS = 15;

// -- Resolve Models -----------------------------------------------------------

function resolveModels(): ModelConfig[] {
  const resolved: ModelConfig[] = [];
  for (const id of PHASE11C_MODEL_IDS) {
    // Claude and GPT come from MODELS; DeepSeek from PHASE11_MODELS
    const model =
      MODELS.find((m) => m.id === id) ??
      PHASE11_MODELS.find((m) => m.id === id);
    if (!model) {
      throw new Error(
        `Model "${id}" not found in MODELS or PHASE11_MODELS. ` +
          `Available: ${[...MODELS, ...PHASE11_MODELS].map((m) => m.id).join(", ")}`,
      );
    }
    resolved.push(model);
  }
  return resolved;
}

// -- Synthetic Pair Creation --------------------------------------------------

function makeSyntheticPair(
  pair: Phase11RobustnessPair,
  condition: RobustnessCondition,
): ConceptPair {
  return {
    id: pair.id,
    from: pair.from,
    to: pair.to,
    category: pair.expectedBridge === null ? "control-random" : "cross-domain",
    concreteness: ["abstract", "abstract"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "reporting",
    notes: `Phase 11C robustness: "${pair.from}" -> "${pair.to}" (${pair.direction}) [${condition.label}]`,
  };
}

// -- Resume Support -----------------------------------------------------------

function runKey(pairId: string, modelId: string): string {
  return `${pairId}::${modelId}`;
}

async function loadExistingResults(
  resultsDir: string,
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
    if (!file.endsWith(".json") || file.startsWith("robustness-")) continue;
    // Skip summary files
    if (file.startsWith("condition-summary-")) continue;

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

// -- Main ---------------------------------------------------------------------

async function main() {
  const program = new Command();

  program
    .name("11c-robustness")
    .description(
      "Run Phase 11C multiverse robustness experiment: test R1/R2/bridge across waypoint count and temperature variations",
    )
    .option("--dry-run", "print the experiment plan without executing")
    .option("--output <dir>", "output directory", DEFAULT_OUTPUT_DIR)
    .option("--concurrency <n>", "global concurrency limit", String(DEFAULT_CONCURRENCY))
    .option(
      "--model-concurrency <spec>",
      'per-model concurrency, e.g., "claude=3,gpt=3,deepseek=2"',
      DEFAULT_MODEL_CONCURRENCY,
    )
    .option("--throttle <ms>", "per-model delay between requests", "0")
    .option("--patient", "tolerate slow models: 300s request timeout (on by default)", true);

  program.parse();
  const opts = program.opts();

  const outputDir = opts.output as string;
  const dryRun = opts.dryRun === true;

  const globalConcurrency = parseInt(opts.concurrency as string, 10) || DEFAULT_CONCURRENCY;
  const perModelConcurrency = parseModelConcurrency(opts.modelConcurrency as string);
  const throttleMs = parseInt(opts.throttle as string, 10) || 0;

  // Patient mode ON by default
  const patientMode = opts.patient !== false;
  const requestTimeoutMs = patientMode ? 300_000 : 60_000;

  // Resolve the 3 robustness models
  const models = resolveModels();

  // Print header
  console.log("=== Phase 11C: Multiverse Robustness Experiment ===\n");
  if (patientMode) {
    console.log(`Mode:                    PATIENT (${requestTimeoutMs / 1000}s request timeout)`);
  }
  console.log(`Models:                  ${models.map((m) => m.displayName).join(", ")}`);
  console.log(`Pairs:                   ${PHASE11C_ALL_PAIRS.length} (4 forward + 2 reverse)`);
  console.log(`Conditions:              ${ROBUSTNESS_CONDITIONS.length} (2x2 grid)`);
  console.log(`Reps per cell:           ${FULL_RUN_REPS}`);
  console.log(`Total budget:            ${ROBUSTNESS_CONDITIONS.length * PHASE11C_ALL_PAIRS.length * FULL_RUN_REPS * models.length} runs`);
  console.log("");

  // Summarize conditions
  console.log("Conditions:");
  for (const cond of ROBUSTNESS_CONDITIONS) {
    console.log(`  ${cond.label}: ${cond.waypoints} waypoints, temperature ${cond.temperature}`);
  }
  console.log("");

  // Summarize pairs
  console.log("Pair plan:");
  for (const pair of PHASE11C_ALL_PAIRS) {
    const bridgeStr = pair.expectedBridge ?? "none (control)";
    console.log(
      `  ${pair.id} (${pair.direction}): "${pair.from}" -> "${pair.to}" | expected bridge: "${bridgeStr}"`,
    );
  }
  console.log("");

  if (dryRun) {
    console.log("Per-condition breakdown:");
    for (const cond of ROBUSTNESS_CONDITIONS) {
      const condRuns = PHASE11C_ALL_PAIRS.length * FULL_RUN_REPS * models.length;
      console.log(`  ${cond.label}: ${condRuns} runs -> ${outputDir}/${cond.label}/`);
    }
    console.log("");
    console.log("(Dry run -- no API calls made.)");
    return;
  }

  // Ensure output directory
  await mkdir(outputDir, { recursive: true });

  const experimentStartTime = Date.now();

  // ========================================================================
  // Build requests for all 4 conditions
  // ========================================================================

  console.log("=== Building Request Manifest ===\n");

  const allRequests: ElicitationRequest[] = [];
  let totalExisting = 0;

  for (const condition of ROBUSTNESS_CONDITIONS) {
    const condDir = path.join(outputDir, condition.label);
    await mkdir(condDir, { recursive: true });

    // Load existing results for this condition subdir (resume support)
    const existing = await loadExistingResults(condDir);
    if (existing.results.length > 0) {
      console.log(`  ${condition.label}: Found ${existing.results.length} existing results`);
      totalExisting += existing.results.length;
    }

    // Build requests for this condition
    let conditionNewRuns = 0;
    for (const pair of PHASE11C_ALL_PAIRS) {
      const syntheticPair = makeSyntheticPair(pair, condition);

      for (const model of models) {
        const key = runKey(syntheticPair.id, model.id);
        const existingCount = existing.counts.get(key) ?? 0;
        const needed = Math.max(0, FULL_RUN_REPS - existingCount);

        if (needed > 0 && existingCount > 0) {
          console.log(`    ${condition.label}/${pair.id} (${model.id}): have ${existingCount}, need ${needed} more`);
        }

        for (let r = 0; r < needed; r++) {
          allRequests.push({
            model,
            pair: syntheticPair,
            waypointCount: condition.waypoints,
            promptFormat: PROMPT_FORMAT,
            temperature: condition.temperature,
            ...(patientMode ? { requestTimeoutMs } : {}),
          });
        }
        conditionNewRuns += needed;
      }
    }

    console.log(`  ${condition.label}: ${conditionNewRuns} new runs needed`);
  }

  const totalNewRuns = allRequests.length;

  console.log("");
  console.log("Run budget:");
  console.log(`  Conditions:             ${ROBUSTNESS_CONDITIONS.length}`);
  console.log(`  Models:                 ${models.length}`);
  console.log(`  Pairs:                  ${PHASE11C_ALL_PAIRS.length}`);
  console.log(`  Target reps/cell:       ${FULL_RUN_REPS}`);
  console.log(`  Existing results:       ${totalExisting}`);
  console.log(`  Total new runs:         ${totalNewRuns}`);
  console.log("");

  // Time estimate
  if (totalNewRuns > 0) {
    const estLow = Math.round((totalNewRuns * 2) / globalConcurrency);
    const estHigh = Math.round((totalNewRuns * 4) / globalConcurrency);
    console.log(`Estimated time:           ${formatDuration(estLow * 1000)} - ${formatDuration(estHigh * 1000)}`);
    console.log("");
  }

  if (totalNewRuns === 0) {
    console.log("All runs already completed. Nothing to do.");

    // Write overall summary even when nothing to do
    const summaryPath = path.join(outputDir, "robustness-summary.json");
    const summary = {
      experiment: "multiverse-robustness",
      phase: "11C",
      startedAt: new Date(experimentStartTime).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - experimentStartTime,
      conditions: ROBUSTNESS_CONDITIONS.map((c) => c.label),
      models: models.map((m) => m.id),
      pairs: PHASE11C_ALL_PAIRS.map((p) => p.id),
      totalNewRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      successRate: 0,
      perCondition: {},
    };
    const tmpSummary = `${summaryPath}.tmp.${Date.now()}`;
    await writeFile(tmpSummary, JSON.stringify(summary, null, 2));
    await rename(tmpSummary, summaryPath);
    console.log(`Summary: ${summaryPath}`);
    return;
  }

  // ========================================================================
  // Run all conditions through the Scheduler
  // ========================================================================

  // Per-model and per-condition progress counters
  const perModelCompleted = new Map<string, number>();
  const perModelFailed = new Map<string, number>();
  for (const model of models) {
    perModelCompleted.set(model.id, 0);
    perModelFailed.set(model.id, 0);
  }

  // Track results per condition for writing to condition subdirs
  const conditionResults = new Map<string, ElicitationResult[]>();
  for (const cond of ROBUSTNESS_CONDITIONS) {
    conditionResults.set(cond.label, []);
  }

  const allNewResults: ElicitationResult[] = [];
  let totalCompleted = 0;
  let writeFailures = 0;

  // Map condition parameters back to condition label for result routing
  function findConditionLabel(waypointCount: number, temperature: number): string | undefined {
    const cond = ROBUSTNESS_CONDITIONS.find(
      (c) => c.waypoints === waypointCount && c.temperature === temperature,
    );
    return cond?.label;
  }

  // Helper: write a result atomically to its condition subdir
  async function writeResult(result: ElicitationResult): Promise<boolean> {
    const condLabel = findConditionLabel(result.waypointCount, result.temperature);
    if (!condLabel) {
      console.error(`\nWarning: Could not determine condition for result (wp=${result.waypointCount}, t=${result.temperature})`);
      return false;
    }

    const condDir = path.join(outputDir, condLabel);
    const resultPath = path.join(condDir, `${result.runId}.json`);
    try {
      const tmpPath = `${resultPath}.tmp.${Date.now()}`;
      await writeFile(tmpPath, JSON.stringify(result, null, 2));
      await rename(tmpPath, resultPath);
      return true;
    } catch (writeError: unknown) {
      console.error(
        `\nWarning: Failed to persist ${result.runId}:`,
        writeError instanceof Error ? writeError.message : writeError,
      );
      return false;
    }
  }

  // Helper: report progress
  function reportProgress(): void {
    const batchPct = Math.round((totalCompleted / totalNewRuns) * 100);
    const modelParts = models.map((model) => {
      const done = perModelCompleted.get(model.id) ?? 0;
      const fail = perModelFailed.get(model.id) ?? 0;
      return `${model.id}:${done}${fail > 0 ? `(${fail}f)` : ""}`;
    });

    let etaStr = "";
    if (totalCompleted > 0) {
      const elapsedMs = Date.now() - experimentStartTime;
      const msPerRun = elapsedMs / totalCompleted;
      const remainingMs = Math.round(msPerRun * (totalNewRuns - totalCompleted));
      etaStr = ` | ETA: ${formatDuration(remainingMs)}`;
    }

    process.stdout.write(
      `\r  ${totalCompleted}/${totalNewRuns} (${batchPct}%) | ${modelParts.join(" ")}${etaStr}    `,
    );
  }

  console.log("Starting robustness collection...\n");

  const scheduler = new Scheduler(
    { globalConcurrency, perModelConcurrency, throttleMs },
    {
      onResult: async (result: ElicitationResult) => {
        const modelId = result.modelShortId;
        perModelCompleted.set(modelId, (perModelCompleted.get(modelId) ?? 0) + 1);
        if (result.failureMode) {
          perModelFailed.set(modelId, (perModelFailed.get(modelId) ?? 0) + 1);
        }

        // Route result to its condition bucket
        const condLabel = findConditionLabel(result.waypointCount, result.temperature);
        if (condLabel) {
          conditionResults.get(condLabel)?.push(result);
        }

        const written = await writeResult(result);
        if (!written) writeFailures++;
        allNewResults.push(result);
        totalCompleted++;
        reportProgress();
      },
      onProgress: () => {},
    },
  );

  const schedulerResults = await scheduler.run(allRequests);
  console.log(`\n\n  Collection complete: ${schedulerResults.length} results\n`);

  // ========================================================================
  // Write per-condition summary JSONs
  // ========================================================================

  console.log("Writing per-condition summaries...\n");

  for (const condition of ROBUSTNESS_CONDITIONS) {
    const condLabel = condition.label;
    const condDir = path.join(outputDir, condLabel);
    const results = conditionResults.get(condLabel) ?? [];

    const successful = results.filter((r) => !r.failureMode);
    const failed = results.filter((r) => r.failureMode);

    const condSummary = {
      condition: condLabel,
      waypoints: condition.waypoints,
      temperature: condition.temperature,
      models: models.map((m) => m.id),
      pairs: PHASE11C_ALL_PAIRS.map((p) => p.id),
      targetReps: FULL_RUN_REPS,
      newRuns: results.length,
      successfulRuns: successful.length,
      failedRuns: failed.length,
      successRate: results.length > 0 ? successful.length / results.length : 0,
      perModel: Object.fromEntries(
        models.map((model) => {
          const modelResults = results.filter((r) => r.modelShortId === model.id);
          const modelFailed = modelResults.filter((r) => r.failureMode);
          return [model.id, { total: modelResults.length, failed: modelFailed.length }];
        }),
      ),
    };

    const condSummaryPath = path.join(condDir, `condition-summary-${condLabel}.json`);
    const tmpCondSummary = `${condSummaryPath}.tmp.${Date.now()}`;
    await writeFile(tmpCondSummary, JSON.stringify(condSummary, null, 2));
    await rename(tmpCondSummary, condSummaryPath);

    console.log(`  ${condLabel}: ${successful.length}/${results.length} successful -> ${condSummaryPath}`);
  }
  console.log("");

  // ========================================================================
  // Overall summary
  // ========================================================================

  const successful = allNewResults.filter((r) => !r.failureMode);
  const failed = allNewResults.filter((r) => r.failureMode);
  const duration = Date.now() - experimentStartTime;

  console.log("=== Phase 11C: Multiverse Robustness Experiment Complete ===\n");
  console.log(`Duration:       ${formatDuration(duration)}`);
  console.log(`New runs:       ${allNewResults.length}`);
  console.log(`Successful:     ${successful.length}`);
  console.log(`Failed:         ${failed.length}`);
  console.log(`Success rate:   ${allNewResults.length > 0 ? ((successful.length / allNewResults.length) * 100).toFixed(1) : 0}%`);
  if (writeFailures > 0) {
    console.log(`Write failures: ${writeFailures} (results may need re-collection)`);
  }
  console.log("");

  console.log("Per-model breakdown:");
  for (const model of models) {
    const done = perModelCompleted.get(model.id) ?? 0;
    const fail = perModelFailed.get(model.id) ?? 0;
    console.log(`  ${model.displayName}: ${done - fail}/${done} successful`);
  }
  console.log("");

  console.log("Per-condition breakdown:");
  for (const condition of ROBUSTNESS_CONDITIONS) {
    const results = conditionResults.get(condition.label) ?? [];
    const condSuccessful = results.filter((r) => !r.failureMode).length;
    console.log(`  ${condition.label}: ${condSuccessful}/${results.length} successful`);
  }
  console.log("");

  // Write overall summary
  const summaryPath = path.join(outputDir, "robustness-summary.json");
  const summary = {
    experiment: "multiverse-robustness",
    phase: "11C",
    startedAt: new Date(experimentStartTime).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: duration,
    conditions: ROBUSTNESS_CONDITIONS.map((c) => ({
      label: c.label,
      waypoints: c.waypoints,
      temperature: c.temperature,
    })),
    models: models.map((m) => ({ id: m.id, displayName: m.displayName })),
    pairs: PHASE11C_ALL_PAIRS.map((p) => ({
      id: p.id,
      from: p.from,
      to: p.to,
      direction: p.direction,
      expectedBridge: p.expectedBridge,
    })),
    targetReps: FULL_RUN_REPS,
    totalNewRuns: allNewResults.length,
    successfulRuns: successful.length,
    failedRuns: failed.length,
    successRate: allNewResults.length > 0 ? successful.length / allNewResults.length : 0,
    perCondition: Object.fromEntries(
      ROBUSTNESS_CONDITIONS.map((cond) => {
        const results = conditionResults.get(cond.label) ?? [];
        const condSuccessful = results.filter((r) => !r.failureMode).length;
        return [
          cond.label,
          {
            newRuns: results.length,
            successful: condSuccessful,
            failed: results.length - condSuccessful,
          },
        ];
      }),
    ),
    perModel: Object.fromEntries(
      models.map((model) => [
        model.id,
        {
          completed: perModelCompleted.get(model.id) ?? 0,
          failed: perModelFailed.get(model.id) ?? 0,
        },
      ]),
    ),
  };
  const tmpSummary = `${summaryPath}.tmp.${Date.now()}`;
  await writeFile(tmpSummary, JSON.stringify(summary, null, 2));
  await rename(tmpSummary, summaryPath);

  console.log(`Summary: ${summaryPath}`);
  console.log(`Results: ${outputDir}/`);

  if (failed.length > 0) {
    console.log("\nFailed runs (first 20):");
    for (const r of failed.slice(0, 20)) {
      const condLabel = findConditionLabel(r.waypointCount, r.temperature) ?? "unknown";
      console.log(`  [${condLabel}] ${r.pair.id} (${r.modelShortId}): ${r.failureMode}`);
    }
    if (failed.length > 20) {
      console.log(`  ... and ${failed.length - 20} more.`);
    }
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
