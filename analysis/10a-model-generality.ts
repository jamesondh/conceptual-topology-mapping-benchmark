#!/usr/bin/env bun
/**
 * Phase 10A: Model Generality Analysis
 *
 * Tests whether core structural findings (R1 gait, R2 asymmetry, R5 controls,
 * R6 bridge bottlenecks) generalize beyond the original 4 models to 5 new models.
 *
 * Loads data from:
 *   results/model-generality/         (Phase 10A new model elicitation data)
 *   results/model-generality/probes/  (Phase 10A model reliability probe results)
 *   results/pilot/                    (Phase 1 original model data)
 *   results/reversals/                (Phase 2 original model data)
 *   results/salience/                 (Phase 6A original model data)
 *
 * Zero API calls — pure offline analysis.
 *
 * Usage:
 *   bun run analysis/10a-model-generality.ts
 *   bun run analysis/10a-model-generality.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  seededRandom,
  mean,
  bootstrapCI,
  computeWaypointFrequencies,
  computeBridgeFrequency,
  bootstrapBridgeFrequencyCI,
  spearmanCorrelation,
  bootstrapSpearmanCI,
} from "../src/metrics.ts";
import { computeJaccard } from "../src/canonicalize.ts";
import { MODELS, NEW_MODELS } from "../src/data/pairs.ts";
import {
  PHASE10A_ALL_PAIRS,
  PHASE10A_FORWARD_PAIRS,
  PHASE10A_REVERSE_PAIRS,
  PHASE10A_ASYMMETRY_PAIRS,
  PHASE10A_NON_CONTROL_FORWARD_PAIRS,
} from "../src/data/pairs-phase10.ts";
import type {
  ElicitationResult,
  ModelGeneralityAnalysisOutput,
  Phase10ModelReliabilityResult,
  ModelConfig,
} from "../src/types.ts";

// ── Data Loading ───────────────────────────────────────────────────

async function readJsonFilesRecursive(dir: string): Promise<string[]> {
  const paths: string[] = [];
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return paths;
  }
  for (const name of names) {
    const fullPath = join(dir, name);
    let info;
    try {
      info = await stat(fullPath);
    } catch {
      continue;
    }
    if (info.isDirectory()) {
      paths.push(...(await readJsonFilesRecursive(fullPath)));
    } else if (info.isFile() && name.endsWith(".json")) {
      if (name.includes("summary") || name.includes("status")) continue;
      paths.push(fullPath);
    }
  }
  return paths;
}

async function loadResultsFromDir(dir: string): Promise<ElicitationResult[]> {
  const jsonPaths = await readJsonFilesRecursive(dir);
  const results: ElicitationResult[] = [];
  for (const p of jsonPaths) {
    try {
      const content = await readFile(p, "utf-8");
      const parsed = JSON.parse(content) as ElicitationResult;
      if (parsed.model && parsed.pair && Array.isArray(parsed.canonicalizedWaypoints)) {
        results.push(parsed);
      }
    } catch {
      // Skip malformed
    }
  }
  return results;
}

async function loadReliabilityReports(dir: string): Promise<Phase10ModelReliabilityResult[]> {
  const reports: Phase10ModelReliabilityResult[] = [];
  const jsonPaths = await readJsonFilesRecursive(dir);
  for (const p of jsonPaths) {
    try {
      const content = await readFile(p, "utf-8");
      const parsed = JSON.parse(content) as Phase10ModelReliabilityResult;
      if (parsed.modelId && parsed.status) {
        reports.push(parsed);
      }
    } catch {
      // Skip malformed
    }
  }
  return reports;
}

function buildWaypointLookup(results: ElicitationResult[]): Map<string, ElicitationResult[]> {
  const lookup = new Map<string, ElicitationResult[]>();
  for (const r of results) {
    if (r.failureMode) continue;
    if (r.canonicalizedWaypoints.length === 0) continue;
    const key = `${r.pair.id}::${r.modelShortId}`;
    if (!lookup.has(key)) lookup.set(key, []);
    lookup.get(key)!.push(r);
  }
  return lookup;
}

function waypointsOnly(results: ElicitationResult[]): string[][] {
  return results.map((r) => r.canonicalizedWaypoints);
}

// ── Helpers ────────────────────────────────────────────────────────

function computeIntraModelJaccard(runs: string[][]): number {
  if (runs.length < 2) return 0;
  const jaccards: number[] = [];
  for (let i = 0; i < runs.length; i++) {
    for (let j = i + 1; j < runs.length; j++) {
      jaccards.push(computeJaccard(runs[i], runs[j]).similarity);
    }
  }
  return mean(jaccards);
}

function computeCrossGroupJaccard(groupA: string[][], groupB: string[][]): number {
  if (groupA.length === 0 || groupB.length === 0) return 0;
  const jaccards: number[] = [];
  for (const a of groupA) {
    for (const b of groupB) {
      jaccards.push(computeJaccard(a, b).similarity);
    }
  }
  return mean(jaccards);
}

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: ModelGeneralityAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 10A: Model Generality Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Experiment Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **New models tested:** ${output.metadata.newModels.join(", ")}`);
  lines.push(`- **Original models:** ${output.metadata.originalModels.join(", ")}`);
  lines.push(`- **Pairs:** ${output.metadata.pairs.length}`);
  lines.push(`- **Total new runs:** ${output.metadata.totalNewRuns}`);
  lines.push(`- **Reliable new models:** ${output.metadata.reliableModelCount}`);
  lines.push("");

  // 2. Model Reliability
  lines.push("## 2. Model Reliability Reports");
  lines.push("");
  lines.push("| Model | Status | Connectivity | Parse Rate | Median Latency (ms) | Format | Reason |");
  lines.push("|-------|--------|-------------|------------|--------------------|---------|---------| ");

  for (const r of output.reliabilityReports) {
    const reason = r.statusReason ?? "-";
    const fmt = r.usesDirectFormat ? "direct" : "semantic";
    lines.push(
      `| ${r.displayName} | ${r.status} | ${r.connectivityRate.toFixed(2)} | ${r.parseRate.toFixed(2)} | ${r.medianLatencyMs.toFixed(0)} | ${fmt} | ${reason} |`,
    );
  }
  lines.push("");

  // 3. Gait Profiles (R1)
  lines.push("## 3. Gait Profiles (R1 Replication)");
  lines.push("");
  lines.push("| Model | Mean Intra-Model Jaccard | 95% CI | New? |");
  lines.push("|-------|------------------------|--------|------|");

  for (const g of output.gaitProfiles) {
    const ciStr = `[${g.jaccardCI[0].toFixed(3)}, ${g.jaccardCI[1].toFixed(3)}]`;
    lines.push(
      `| ${g.displayName} | ${g.meanIntraModelJaccard.toFixed(3)} | ${ciStr} | ${g.isNewModel ? "yes" : "no"} |`,
    );
  }
  lines.push("");

  // Per-pair gait detail
  lines.push("### Gait per pair");
  lines.push("");
  const gaitModels = output.gaitProfiles.filter((g) => g.perPairJaccard.length > 0);
  if (gaitModels.length > 0) {
    const pairIds = gaitModels[0].perPairJaccard.map((pp) => pp.pairId);
    const header = `| Model | ${pairIds.map((p) => p.replace("p10a-", "")).join(" | ")} |`;
    const sep = `|-------|${pairIds.map(() => "------").join("|")}|`;
    lines.push(header);
    lines.push(sep);
    for (const g of gaitModels) {
      const vals = g.perPairJaccard.map((pp) => pp.jaccard.toFixed(3)).join(" | ");
      lines.push(`| ${g.modelId} | ${vals} |`);
    }
    lines.push("");
  }

  // 4. Asymmetry (R2)
  lines.push("## 4. Asymmetry Results (R2 Replication)");
  lines.push("");
  lines.push("| Model | Mean Asymmetry | 95% CI | > 0.60? |");
  lines.push("|-------|---------------|--------|---------|");

  for (const a of output.perModelAsymmetry) {
    const ciStr = `[${a.asymmetryCI[0].toFixed(3)}, ${a.asymmetryCI[1].toFixed(3)}]`;
    lines.push(
      `| ${a.modelId} | ${a.meanAsymmetry.toFixed(3)} | ${ciStr} | ${a.aboveThreshold ? "**YES**" : "no"} |`,
    );
  }
  lines.push("");

  // Per-pair asymmetry detail
  lines.push("### Asymmetry per pair");
  lines.push("");
  lines.push("| Model | Pair | Asymmetry Index | 95% CI |");
  lines.push("|-------|------|----------------|--------|");
  for (const a of output.asymmetryResults) {
    const ciStr = `[${a.asymmetryCI[0].toFixed(3)}, ${a.asymmetryCI[1].toFixed(3)}]`;
    lines.push(`| ${a.modelId} | ${a.pairId} | ${a.asymmetryIndex.toFixed(3)} | ${ciStr} |`);
  }
  lines.push("");

  // 5. Bridge Frequency Matrix (R6)
  lines.push("## 5. Bridge Frequency Matrix (R6 Replication)");
  lines.push("");
  lines.push("| Pair | Model | Expected Bridge | Bridge Freq | 95% CI | Runs |");
  lines.push("|------|-------|-----------------|------------|--------|------|");

  for (const bf of output.bridgeFrequencyMatrix) {
    const bridge = bf.expectedBridge ?? "none";
    const ciStr = `[${bf.bridgeFrequencyCI[0].toFixed(3)}, ${bf.bridgeFrequencyCI[1].toFixed(3)}]`;
    lines.push(
      `| ${bf.pairId} | ${bf.modelId} | ${bridge} | ${bf.bridgeFrequency.toFixed(3)} | ${ciStr} | ${bf.runCount} |`,
    );
  }
  lines.push("");

  // 6. Control Validation (R5)
  lines.push("## 6. Control Validation (R5: stapler-monsoon)");
  lines.push("");
  lines.push("| Model | Top Waypoint | Top Frequency | Unique Waypoints | Passes? |");
  lines.push("|-------|-------------|---------------|------------------|---------|");

  for (const cv of output.controlValidation) {
    lines.push(
      `| ${cv.modelId} | ${cv.topWaypoint} | ${cv.topFrequency.toFixed(3)} | ${cv.uniqueWaypoints} | ${cv.passesControl ? "**YES**" : "no"} |`,
    );
  }
  lines.push("");

  // 7. Cohort Comparison (Primary Test)
  lines.push("## 7. Cohort Comparison (PRIMARY TEST)");
  lines.push("");
  const cc = output.cohortComparison;
  lines.push(`- **New cohort mean bridge frequency:** ${cc.newCohortMeanBridgeFreq.toFixed(3)} [${cc.newCohortCI[0].toFixed(3)}, ${cc.newCohortCI[1].toFixed(3)}]`);
  lines.push(`- **Original cohort mean bridge frequency:** ${cc.originalCohortMeanBridgeFreq.toFixed(3)} [${cc.originalCohortCI[0].toFixed(3)}, ${cc.originalCohortCI[1].toFixed(3)}]`);
  lines.push(`- **Difference (new - original):** ${cc.difference.toFixed(3)} [${cc.differenceCI[0].toFixed(3)}, ${cc.differenceCI[1].toFixed(3)}]`);
  lines.push(`- **CI includes zero:** ${cc.ciIncludesZero ? "**YES** (no significant difference)" : "**NO** (significant difference)"}`);
  lines.push("");

  if (cc.ciIncludesZero) {
    lines.push(
      "The new model cohort produces bridge frequencies statistically indistinguishable from " +
        "the original 4-model cohort. Core bridge bottleneck structure (R6) generalizes to new models.",
    );
  } else {
    lines.push(
      "The new model cohort shows a statistically significant difference from the original cohort. " +
        "The direction and magnitude of this difference should be examined carefully.",
    );
  }
  lines.push("");

  // 8. Model Similarity Matrix
  lines.push("## 8. Pairwise Model Similarity");
  lines.push("");
  lines.push("| Model A | Model B | Mean Pairwise Jaccard |");
  lines.push("|---------|---------|----------------------|");

  for (const ms of output.modelSimilarityMatrix) {
    lines.push(`| ${ms.modelA} | ${ms.modelB} | ${ms.meanPairwiseJaccard.toFixed(3)} |`);
  }
  lines.push("");

  // 9. Scale Effect
  lines.push("## 9. Scale Effect (Llama 8B)");
  lines.push("");

  if (output.scaleEffect) {
    const se = output.scaleEffect;
    lines.push(`- **Llama reliable:** ${se.llamaReliable ? "yes" : "no"}`);
    if (se.llamaReliable) {
      lines.push(`- **Llama gait Jaccard:** ${se.llamaGaitJaccard?.toFixed(3) ?? "N/A"}`);
      lines.push(`- **Llama mean bridge freq:** ${se.llamaMeanBridgeFreq?.toFixed(3) ?? "N/A"}`);
      lines.push(`- **Llama mean asymmetry:** ${se.llamaMeanAsymmetry?.toFixed(3) ?? "N/A"}`);
      lines.push(`- **Lowest gait among all models:** ${se.lowestGaitAmongAll ? "**YES**" : "no"}`);
      lines.push(`- **Highest entropy among all models:** ${se.highestEntropyAmongAll ? "**YES**" : "no"}`);
    } else {
      lines.push("Llama 3.1 8B did not pass the reliability gate. Scale effect cannot be assessed.");
    }
  } else {
    lines.push("Scale effect analysis not performed (no Llama model in configuration).");
  }
  lines.push("");

  // 10. Predictions
  lines.push("## 10. Predictions Summary");
  lines.push("");
  lines.push("| # | Prediction | Result | Value |");
  lines.push("|---|------------|--------|-------|");

  for (const pred of output.predictions) {
    lines.push(`| ${pred.id} | ${pred.description} | ${pred.result} | ${pred.value} |`);
  }
  lines.push("");

  // 11. Summary
  const confirmed = output.predictions.filter((p) => p.result === "confirmed").length;
  const notConfirmed = output.predictions.filter((p) => p.result === "not confirmed").length;
  const insufficient = output.predictions.filter((p) => p.result === "insufficient data").length;

  lines.push("## 11. Summary of Key Findings");
  lines.push("");
  lines.push(`- **Predictions confirmed:** ${confirmed} of ${output.predictions.length}`);
  lines.push(`- **Predictions not confirmed:** ${notConfirmed}`);
  lines.push(`- **Insufficient data:** ${insufficient}`);
  lines.push("");
  lines.push("### Core structural findings generality:");
  lines.push("");

  // R1 gait summary
  const newGaits = output.gaitProfiles.filter((g) => g.isNewModel);
  if (newGaits.length > 0) {
    const gaitRange = `${Math.min(...newGaits.map((g) => g.meanIntraModelJaccard)).toFixed(3)}-${Math.max(...newGaits.map((g) => g.meanIntraModelJaccard)).toFixed(3)}`;
    lines.push(`- **R1 (Gait):** New models show intra-model Jaccard range ${gaitRange}. Each model has a characteristic consistency level.`);
  }

  // R2 asymmetry summary
  const asymAbove = output.perModelAsymmetry.filter((a) => a.aboveThreshold).length;
  lines.push(`- **R2 (Asymmetry):** ${asymAbove} of ${output.perModelAsymmetry.length} reliable new models show asymmetry index > 0.60.`);

  // R5 control summary
  const controlPass = output.controlValidation.filter((cv) => cv.passesControl).length;
  lines.push(`- **R5 (Controls):** ${controlPass} of ${output.controlValidation.length} models pass the random control validation.`);

  // R6 bridge summary
  lines.push(`- **R6 (Bridge bottlenecks):** Cohort comparison CI includes zero: ${cc.ciIncludesZero}. Bridge structure ${cc.ciIncludesZero ? "generalizes" : "may not fully generalize"}.`);
  lines.push("");

  return lines.join("\n");
}

// ── Main Pipeline ───────────────────────────────────────────────────

async function analyze(opts: {
  input: string;
  output: string;
  findings: string;
}): Promise<void> {
  const inputDir = resolve(opts.input);
  const outputDir = resolve(opts.output);
  const findingsPath = resolve(opts.findings);

  setMetricsSeed(42);

  console.log("Conceptual Topology Mapping Benchmark - Model Generality Analysis (Phase 10A)");
  console.log("=============================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data from multiple sources ─────────────────────────────

  console.log("Loading data from multiple sources...");

  // Phase 10A new model data
  const generalityDir = join(inputDir, "model-generality");
  const generalityResults = await loadResultsFromDir(generalityDir);
  console.log(`  Model generality (10A): ${generalityResults.length} results`);

  // Phase 10A probe reliability reports
  const probesDir = join(inputDir, "model-generality", "probes");
  const reliabilityReports = await loadReliabilityReports(probesDir);
  console.log(`  Reliability reports:    ${reliabilityReports.length} reports`);

  // Prior phase data for original 4 models (for cohort comparison)
  const pilotDir = join(inputDir, "pilot");
  const pilotResults = await loadResultsFromDir(pilotDir);
  console.log(`  Pilot (Phase 1):        ${pilotResults.length} results`);

  const reversalsDir = join(inputDir, "reversals");
  const reversalResults = await loadResultsFromDir(reversalsDir);
  console.log(`  Reversals (Phase 2):    ${reversalResults.length} results`);

  const salienceDir = join(inputDir, "salience");
  const salienceResults = await loadResultsFromDir(salienceDir);
  console.log(`  Salience (Phase 6A):    ${salienceResults.length} results`);
  console.log("");

  // Build lookups
  const generalityLookup = buildWaypointLookup(generalityResults);
  const pilotLookup = buildWaypointLookup(pilotResults);
  const reversalLookup = buildWaypointLookup(reversalResults);
  const salienceLookup = buildWaypointLookup(salienceResults);

  // Merged original-model lookup (pilot + reversals + salience)
  const originalLookup = buildWaypointLookup([
    ...pilotResults,
    ...reversalResults,
    ...salienceResults,
  ]);

  console.log(`  Generality lookup keys: ${generalityLookup.size}`);
  console.log(`  Pilot lookup keys:      ${pilotLookup.size}`);
  console.log(`  Reversal lookup keys:   ${reversalLookup.size}`);
  console.log(`  Salience lookup keys:   ${salienceLookup.size}`);
  console.log(`  Original merged keys:   ${originalLookup.size}`);
  console.log("");

  const originalModelIds = MODELS.map((m) => m.id);
  const newModelIds = NEW_MODELS.map((m) => m.id);
  const totalNewRuns = generalityResults.length;

  // ── Step 1: Process Reliability Reports ─────────────────────────

  console.log("Step 1: Processing model reliability reports...");

  // Determine which new models are reliable or slow (usable for analysis)
  const reliableStatuses = new Set(["reliable", "slow"]);
  const reliableReports = reliabilityReports.filter((r) => reliableStatuses.has(r.status));
  const reliableNewModelIds = reliableReports.map((r) => r.modelId);
  const reliableModelCount = reliableNewModelIds.length;

  console.log(`  Reliable/slow new models: ${reliableNewModelIds.join(", ") || "(none)"}`);
  console.log(`  Excluded models: ${reliabilityReports.filter((r) => !reliableStatuses.has(r.status)).map((r) => `${r.modelId} (${r.status})`).join(", ") || "(none)"}`);
  console.log("");

  // ── Step 2: Gait Profiles (R1) ─────────────────────────────────

  console.log("Step 2: Computing gait profiles (R1 replication)...");

  const gaitProfiles: ModelGeneralityAnalysisOutput["gaitProfiles"] = [];

  // Hardcoded original model gait data from prior phases
  const originalGaitData: Record<string, number> = {
    claude: 0.578,
    gpt: 0.258,
    grok: 0.293,
    gemini: 0.372,
  };

  // Original models: use hardcoded values with empty per-pair data
  for (const model of MODELS) {
    const hardcodedJaccard = originalGaitData[model.id] ?? 0;
    gaitProfiles.push({
      modelId: model.id,
      displayName: model.displayName,
      meanIntraModelJaccard: hardcodedJaccard,
      jaccardCI: [hardcodedJaccard, hardcodedJaccard] as [number, number],
      isNewModel: false,
      perPairJaccard: [],
    });
    console.log(`  ${model.id}: ${hardcodedJaccard.toFixed(3)} (hardcoded from prior phases)`);
  }

  // New reliable models: compute from Phase 10A data
  for (const modelId of reliableNewModelIds) {
    const model = NEW_MODELS.find((m) => m.id === modelId);
    if (!model) continue;

    const perPairJaccards: Array<{ pairId: string; jaccard: number }> = [];
    const allJaccards: number[] = [];

    for (const pair of PHASE10A_FORWARD_PAIRS) {
      const key = `${pair.id}::${modelId}`;
      const results = generalityLookup.get(key) ?? [];
      const runs = waypointsOnly(results);
      const jaccard = computeIntraModelJaccard(runs);
      perPairJaccards.push({ pairId: pair.id, jaccard });
      if (runs.length >= 2) {
        allJaccards.push(jaccard);
      }
    }

    const meanJaccard = allJaccards.length > 0 ? mean(allJaccards) : 0;
    const jaccardCI = allJaccards.length >= 2
      ? bootstrapCI(allJaccards)
      : [meanJaccard, meanJaccard] as [number, number];

    gaitProfiles.push({
      modelId: model.id,
      displayName: model.displayName,
      meanIntraModelJaccard: meanJaccard,
      jaccardCI,
      isNewModel: true,
      perPairJaccard: perPairJaccards,
    });

    console.log(`  ${model.id}: ${meanJaccard.toFixed(3)} [${jaccardCI[0].toFixed(3)}, ${jaccardCI[1].toFixed(3)}]`);
  }
  console.log("");

  // ── Step 3: Asymmetry (R2) ─────────────────────────────────────

  console.log("Step 3: Computing asymmetry (R2 replication)...");

  const asymmetryResults: ModelGeneralityAnalysisOutput["asymmetryResults"] = [];
  const perModelAsymmetry: ModelGeneralityAnalysisOutput["perModelAsymmetry"] = [];

  for (const modelId of reliableNewModelIds) {
    const modelAsymmetries: number[] = [];

    for (const ap of PHASE10A_ASYMMETRY_PAIRS) {
      const fwdKey = `${ap.forward}::${modelId}`;
      const revKey = `${ap.reverse}::${modelId}`;

      const fwdResults = generalityLookup.get(fwdKey) ?? [];
      const revResults = generalityLookup.get(revKey) ?? [];

      const fwdRuns = waypointsOnly(fwdResults);
      const revRuns = waypointsOnly(revResults);

      // Cross-direction Jaccard: all forward x reverse pairs
      const crossJaccard = computeCrossGroupJaccard(fwdRuns, revRuns);
      const asymmetryIndex = 1 - crossJaccard;

      // Bootstrap CI for asymmetry
      const crossJaccards: number[] = [];
      for (const fwd of fwdRuns) {
        for (const rev of revRuns) {
          crossJaccards.push(computeJaccard(fwd, rev).similarity);
        }
      }
      const asymmetryCIValues = crossJaccards.length >= 2
        ? bootstrapCI(crossJaccards.map((j) => 1 - j))
        : [asymmetryIndex, asymmetryIndex] as [number, number];

      asymmetryResults.push({
        modelId,
        pairId: ap.pairLabel,
        forwardPairId: ap.forward,
        reversePairId: ap.reverse,
        asymmetryIndex,
        asymmetryCI: asymmetryCIValues,
      });

      if (fwdRuns.length > 0 && revRuns.length > 0) {
        modelAsymmetries.push(asymmetryIndex);
      }

      console.log(`  ${modelId} / ${ap.pairLabel}: asymmetry=${asymmetryIndex.toFixed(3)} (fwd=${fwdRuns.length}, rev=${revRuns.length})`);
    }

    const meanAsym = modelAsymmetries.length > 0 ? mean(modelAsymmetries) : 0;
    const asymCI = modelAsymmetries.length >= 2
      ? bootstrapCI(modelAsymmetries)
      : [meanAsym, meanAsym] as [number, number];

    perModelAsymmetry.push({
      modelId,
      meanAsymmetry: meanAsym,
      asymmetryCI: asymCI,
      aboveThreshold: meanAsym > 0.60,
    });

    console.log(`  ${modelId} overall: ${meanAsym.toFixed(3)} [${asymCI[0].toFixed(3)}, ${asymCI[1].toFixed(3)}] ${meanAsym > 0.60 ? "> 0.60" : "<= 0.60"}`);
  }
  console.log("");

  // ── Step 4: Bridge Frequency (R6) ──────────────────────────────

  console.log("Step 4: Computing bridge frequency matrix (R6 replication)...");

  const bridgeFrequencyMatrix: ModelGeneralityAnalysisOutput["bridgeFrequencyMatrix"] = [];

  for (const pair of PHASE10A_FORWARD_PAIRS) {
    for (const modelId of reliableNewModelIds) {
      const key = `${pair.id}::${modelId}`;
      const results = generalityLookup.get(key) ?? [];
      const runs = waypointsOnly(results);

      let bridgeFreq = 0;
      let bridgeCI: [number, number] = [0, 0];

      if (pair.expectedBridge && runs.length > 0) {
        bridgeFreq = computeBridgeFrequency(runs, pair.expectedBridge);
        bridgeCI = bootstrapBridgeFrequencyCI(runs, pair.expectedBridge);
      }

      bridgeFrequencyMatrix.push({
        pairId: pair.id,
        modelId,
        expectedBridge: pair.expectedBridge,
        bridgeFrequency: bridgeFreq,
        bridgeFrequencyCI: bridgeCI,
        runCount: runs.length,
      });

      if (pair.expectedBridge) {
        console.log(`  ${pair.id} / ${modelId}: bridge="${pair.expectedBridge}" freq=${bridgeFreq.toFixed(3)} (${runs.length} runs)`);
      }
    }
  }
  console.log("");

  // ── Step 5: Control Validation (R5) ────────────────────────────

  console.log("Step 5: Control validation (R5: stapler-monsoon)...");

  const controlValidation: ModelGeneralityAnalysisOutput["controlValidation"] = [];
  const controlPair = PHASE10A_FORWARD_PAIRS.find((p) => p.id === "p10a-stapler-monsoon");

  if (controlPair) {
    for (const modelId of reliableNewModelIds) {
      const key = `${controlPair.id}::${modelId}`;
      const results = generalityLookup.get(key) ?? [];
      const runs = waypointsOnly(results);

      if (runs.length > 0) {
        const freqs = computeWaypointFrequencies(runs);
        const topWaypoint = freqs.length > 0 ? freqs[0].waypoint : "(none)";
        const topFrequency = freqs.length > 0 ? freqs[0].frequency : 0;
        const uniqueWaypoints = freqs.length;
        const passesControl = topFrequency <= 0.10;

        controlValidation.push({
          modelId,
          topWaypoint,
          topFrequency,
          passesControl,
          uniqueWaypoints,
        });

        console.log(`  ${modelId}: top="${topWaypoint}" freq=${topFrequency.toFixed(3)}, unique=${uniqueWaypoints}, passes=${passesControl}`);
      } else {
        controlValidation.push({
          modelId,
          topWaypoint: "(no data)",
          topFrequency: 0,
          passesControl: false,
          uniqueWaypoints: 0,
        });
        console.log(`  ${modelId}: no data`);
      }
    }
  }
  console.log("");

  // ── Step 6: Cohort Comparison (Primary Test) ───────────────────

  console.log("Step 6: Cohort comparison (primary test)...");

  // New cohort: per-pair mean bridge frequency (averaging across reliable models),
  // producing one value per non-control pair to match the original cohort's pair-level structure.
  const newCohortFreqs: number[] = [];
  for (const pair of PHASE10A_NON_CONTROL_FORWARD_PAIRS) {
    const pairModelFreqs: number[] = [];
    for (const modelId of reliableNewModelIds) {
      const key = `${pair.id}::${modelId}`;
      const results = generalityLookup.get(key) ?? [];
      const runs = waypointsOnly(results);
      if (pair.expectedBridge && runs.length > 0) {
        const freq = computeBridgeFrequency(runs, pair.expectedBridge);
        pairModelFreqs.push(freq);
      }
    }
    if (pairModelFreqs.length > 0) {
      newCohortFreqs.push(mean(pairModelFreqs));
    }
  }

  const newCohortMeanBridgeFreq = newCohortFreqs.length > 0 ? mean(newCohortFreqs) : 0;
  const newCohortCI = newCohortFreqs.length >= 2
    ? bootstrapCI(newCohortFreqs)
    : [newCohortMeanBridgeFreq, newCohortMeanBridgeFreq] as [number, number];

  // Original cohort: use hardcoded prior means from PHASE10A_FORWARD_PAIRS priorFreq
  const originalCohortFreqs: number[] = [];
  for (const pair of PHASE10A_NON_CONTROL_FORWARD_PAIRS) {
    if (pair.priorFreq !== null) {
      originalCohortFreqs.push(pair.priorFreq);
    }
  }

  const originalCohortMeanBridgeFreq = originalCohortFreqs.length > 0 ? mean(originalCohortFreqs) : 0;
  const originalCohortCI = originalCohortFreqs.length >= 2
    ? bootstrapCI(originalCohortFreqs)
    : [originalCohortMeanBridgeFreq, originalCohortMeanBridgeFreq] as [number, number];

  // Difference and its CI
  const difference = newCohortMeanBridgeFreq - originalCohortMeanBridgeFreq;

  // Bootstrap CI on the difference
  let differenceCI: [number, number] = [difference, difference];
  if (newCohortFreqs.length >= 2 && originalCohortFreqs.length >= 2) {
    const diffs: number[] = [];
    const nBoot = 1000;
    for (let b = 0; b < nBoot; b++) {
      // Resample new cohort
      const newSample: number[] = [];
      for (let i = 0; i < newCohortFreqs.length; i++) {
        newSample.push(newCohortFreqs[Math.floor(seededRandom() * newCohortFreqs.length)]);
      }
      // Resample original cohort
      const origSample: number[] = [];
      for (let i = 0; i < originalCohortFreqs.length; i++) {
        origSample.push(originalCohortFreqs[Math.floor(seededRandom() * originalCohortFreqs.length)]);
      }
      diffs.push(mean(newSample) - mean(origSample));
    }
    diffs.sort((a, b) => a - b);
    differenceCI = [
      diffs[Math.floor(nBoot * 0.025)],
      diffs[Math.floor(nBoot * 0.975)],
    ];
  }

  const ciIncludesZero = differenceCI[0] <= 0 && differenceCI[1] >= 0;

  console.log(`  New cohort mean:      ${newCohortMeanBridgeFreq.toFixed(3)} [${newCohortCI[0].toFixed(3)}, ${newCohortCI[1].toFixed(3)}] (n=${newCohortFreqs.length})`);
  console.log(`  Original cohort mean: ${originalCohortMeanBridgeFreq.toFixed(3)} [${originalCohortCI[0].toFixed(3)}, ${originalCohortCI[1].toFixed(3)}] (n=${originalCohortFreqs.length})`);
  console.log(`  Difference:           ${difference.toFixed(3)} [${differenceCI[0].toFixed(3)}, ${differenceCI[1].toFixed(3)}]`);
  console.log(`  CI includes zero:     ${ciIncludesZero}`);
  console.log("");

  // ── Step 7: Model Similarity Matrix ────────────────────────────

  console.log("Step 7: Computing pairwise model similarity matrix...");

  const modelSimilarityMatrix: ModelGeneralityAnalysisOutput["modelSimilarityMatrix"] = [];
  const allAnalyzedModelIds = [...originalModelIds, ...reliableNewModelIds];

  for (let i = 0; i < allAnalyzedModelIds.length; i++) {
    for (let j = i + 1; j < allAnalyzedModelIds.length; j++) {
      const modelA = allAnalyzedModelIds[i];
      const modelB = allAnalyzedModelIds[j];
      const pairJaccards: number[] = [];

      for (const pair of PHASE10A_FORWARD_PAIRS) {
        // Get runs for model A
        let runsA: string[][] = [];
        const keyA10 = `${pair.id}::${modelA}`;
        const resultsA10 = generalityLookup.get(keyA10) ?? [];
        if (resultsA10.length > 0) {
          runsA = waypointsOnly(resultsA10);
        } else {
          // Try original-model lookup for Phase 1-9 data
          // Map Phase 10A pair IDs back to original pair IDs for lookup
          const origPairId = mapPhase10ToOriginalPairId(pair);
          if (origPairId) {
            const keyAOrig = `${origPairId}::${modelA}`;
            const resultsAOrig = originalLookup.get(keyAOrig) ?? [];
            runsA = waypointsOnly(resultsAOrig);
          }
        }

        // Get runs for model B
        let runsB: string[][] = [];
        const keyB10 = `${pair.id}::${modelB}`;
        const resultsB10 = generalityLookup.get(keyB10) ?? [];
        if (resultsB10.length > 0) {
          runsB = waypointsOnly(resultsB10);
        } else {
          const origPairId = mapPhase10ToOriginalPairId(pair);
          if (origPairId) {
            const keyBOrig = `${origPairId}::${modelB}`;
            const resultsBOrig = originalLookup.get(keyBOrig) ?? [];
            runsB = waypointsOnly(resultsBOrig);
          }
        }

        if (runsA.length > 0 && runsB.length > 0) {
          const crossJaccard = computeCrossGroupJaccard(runsA, runsB);
          pairJaccards.push(crossJaccard);
        }
      }

      const meanPairwiseJaccard = pairJaccards.length > 0 ? mean(pairJaccards) : 0;

      modelSimilarityMatrix.push({
        modelA,
        modelB,
        meanPairwiseJaccard,
      });

      console.log(`  ${modelA} x ${modelB}: ${meanPairwiseJaccard.toFixed(3)} (${pairJaccards.length} pairs)`);
    }
  }
  console.log("");

  // ── Step 8: Scale Effect (Llama 8B) ────────────────────────────

  console.log("Step 8: Scale effect analysis (Llama 8B)...");

  let scaleEffect: ModelGeneralityAnalysisOutput["scaleEffect"] = null;
  const llamaModelId = "llama";
  const llamaIsReliable = reliableNewModelIds.includes(llamaModelId);

  if (llamaIsReliable) {
    // Gait
    const llamaGait = gaitProfiles.find((g) => g.modelId === llamaModelId);
    const llamaGaitJaccard = llamaGait?.meanIntraModelJaccard ?? null;

    // Bridge frequency
    const llamaBridgeFreqs: number[] = [];
    for (const pair of PHASE10A_NON_CONTROL_FORWARD_PAIRS) {
      const entry = bridgeFrequencyMatrix.find(
        (bf) => bf.pairId === pair.id && bf.modelId === llamaModelId,
      );
      if (entry) {
        llamaBridgeFreqs.push(entry.bridgeFrequency);
      }
    }
    const llamaMeanBridgeFreq = llamaBridgeFreqs.length > 0 ? mean(llamaBridgeFreqs) : null;

    // Asymmetry
    const llamaAsym = perModelAsymmetry.find((a) => a.modelId === llamaModelId);
    const llamaMeanAsymmetry = llamaAsym?.meanAsymmetry ?? null;

    // Compare gait to all models
    const allGaits = gaitProfiles.map((g) => g.meanIntraModelJaccard);
    const lowestGaitAmongAll = llamaGaitJaccard !== null
      ? llamaGaitJaccard <= Math.min(...allGaits)
      : null;

    // Compare entropy (higher entropy = lower consistency = more waypoint diversity)
    // We approximate "highest entropy" as "lowest gait" since intra-model Jaccard is inversely
    // related to waypoint diversity/entropy
    const highestEntropyAmongAll = lowestGaitAmongAll;

    scaleEffect = {
      llamaReliable: true,
      llamaGaitJaccard,
      llamaMeanBridgeFreq,
      llamaMeanAsymmetry,
      lowestGaitAmongAll,
      highestEntropyAmongAll,
    };

    console.log(`  Llama gait Jaccard:      ${llamaGaitJaccard?.toFixed(3) ?? "N/A"}`);
    console.log(`  Llama mean bridge freq:  ${llamaMeanBridgeFreq?.toFixed(3) ?? "N/A"}`);
    console.log(`  Llama mean asymmetry:    ${llamaMeanAsymmetry?.toFixed(3) ?? "N/A"}`);
    console.log(`  Lowest gait among all:   ${lowestGaitAmongAll}`);
    console.log(`  Highest entropy:         ${highestEntropyAmongAll}`);
  } else {
    scaleEffect = {
      llamaReliable: false,
      llamaGaitJaccard: null,
      llamaMeanBridgeFreq: null,
      llamaMeanAsymmetry: null,
      lowestGaitAmongAll: null,
      highestEntropyAmongAll: null,
    };
    console.log("  Llama did not pass reliability gate. Skipping scale effect analysis.");
  }
  console.log("");

  // ── Step 9: Predictions Evaluation ─────────────────────────────

  console.log("Step 9: Evaluating predictions...");

  const predictions: ModelGeneralityAnalysisOutput["predictions"] = [];

  // P1: >= 3 of 5 new models pass reliability gate
  const p1Pass = reliableModelCount >= 3;
  predictions.push({
    id: 1,
    description: ">= 3 of 5 new models pass reliability gate",
    result: reliabilityReports.length > 0
      ? (p1Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `${reliableModelCount} of ${newModelIds.length} reliable`,
  });

  // P2: Each new model shows characteristic gait (intra-model Jaccard 0.15-0.70)
  const newGaitProfiles = gaitProfiles.filter((g) => g.isNewModel);
  const gaitInRange = newGaitProfiles.filter(
    (g) => g.meanIntraModelJaccard >= 0.15 && g.meanIntraModelJaccard <= 0.70,
  );
  const p2Pass = newGaitProfiles.length > 0 && gaitInRange.length === newGaitProfiles.length;
  predictions.push({
    id: 2,
    description: "Each reliable new model shows characteristic gait (Jaccard 0.15-0.70)",
    result: newGaitProfiles.length > 0
      ? (p2Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `${gaitInRange.length} of ${newGaitProfiles.length} in range`,
  });

  // P3: All reliable new models show asymmetry index > 0.60
  const asymAboveThreshold = perModelAsymmetry.filter((a) => a.aboveThreshold);
  const p3Pass = perModelAsymmetry.length > 0 &&
    asymAboveThreshold.length === perModelAsymmetry.length;
  predictions.push({
    id: 3,
    description: "All reliable new models show asymmetry index > 0.60",
    result: perModelAsymmetry.length > 0
      ? (p3Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `${asymAboveThreshold.length} of ${perModelAsymmetry.length} above 0.60`,
  });

  // P4: Control pair (stapler-monsoon) has no waypoint > 0.10 for any new model
  const controlAllPass = controlValidation.length > 0 &&
    controlValidation.every((cv) => cv.passesControl);
  predictions.push({
    id: 4,
    description: "Control pair stapler-monsoon has no waypoint > 0.10 for any model",
    result: controlValidation.length > 0
      ? (controlAllPass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `${controlValidation.filter((cv) => cv.passesControl).length} of ${controlValidation.length} pass`,
  });

  // P5: Cohort comparison CI includes zero (bridge structure generalizes)
  predictions.push({
    id: 5,
    description: "Cohort comparison CI includes zero (bridge structure generalizes)",
    result: newCohortFreqs.length > 0
      ? (ciIncludesZero ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `diff=${difference.toFixed(3)} [${differenceCI[0].toFixed(3)}, ${differenceCI[1].toFixed(3)}]`,
  });

  // P6: At least 5 of 7 non-control pairs show bridge freq > 0.40 for new cohort
  const pairsAbove040: number[] = [];
  for (const pair of PHASE10A_NON_CONTROL_FORWARD_PAIRS) {
    const pairFreqs: number[] = [];
    for (const modelId of reliableNewModelIds) {
      const entry = bridgeFrequencyMatrix.find(
        (bf) => bf.pairId === pair.id && bf.modelId === modelId,
      );
      if (entry) pairFreqs.push(entry.bridgeFrequency);
    }
    if (pairFreqs.length > 0) {
      const pairMean = mean(pairFreqs);
      if (pairMean > 0.40) pairsAbove040.push(pairMean);
    }
  }
  const p6Pass = pairsAbove040.length >= 5;
  predictions.push({
    id: 6,
    description: ">= 5 of 7 non-control pairs show mean bridge freq > 0.40 in new cohort",
    result: reliableNewModelIds.length > 0
      ? (p6Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `${pairsAbove040.length} of 7 pairs above 0.40`,
  });

  // P7: New model similarity matrix shows cross-model Jaccard > intra-model variation
  const crossModelJaccards = modelSimilarityMatrix
    .filter((ms) => {
      const aIsNew = reliableNewModelIds.includes(ms.modelA);
      const bIsNew = reliableNewModelIds.includes(ms.modelB);
      return aIsNew || bIsNew;
    })
    .map((ms) => ms.meanPairwiseJaccard);
  const meanCrossModelJaccard = crossModelJaccards.length > 0 ? mean(crossModelJaccards) : 0;
  const p7Pass = meanCrossModelJaccard > 0.10;
  predictions.push({
    id: 7,
    description: "Cross-model Jaccard involving new models > 0.10",
    result: crossModelJaccards.length > 0
      ? (p7Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `mean cross-model Jaccard = ${meanCrossModelJaccard.toFixed(3)}`,
  });

  // P8: If Llama 8B is reliable, it shows lowest intra-model Jaccard
  if (scaleEffect && scaleEffect.llamaReliable) {
    const p8Pass = scaleEffect.lowestGaitAmongAll === true;
    predictions.push({
      id: 8,
      description: "Llama 8B shows lowest intra-model Jaccard (scale effect)",
      result: p8Pass ? "confirmed" : "not confirmed",
      value: `Llama gait=${scaleEffect.llamaGaitJaccard?.toFixed(3) ?? "N/A"}, lowest=${scaleEffect.lowestGaitAmongAll}`,
    });
  } else {
    predictions.push({
      id: 8,
      description: "Llama 8B shows lowest intra-model Jaccard (scale effect)",
      result: "insufficient data",
      value: "Llama not reliable",
    });
  }

  for (const pred of predictions) {
    console.log(`  P${pred.id}: ${pred.result} -- ${pred.value}`);
  }
  console.log("");

  // ── Build Output ───────────────────────────────────────────────────

  const analysisOutput: ModelGeneralityAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      newModels: reliableNewModelIds,
      originalModels: originalModelIds,
      pairs: PHASE10A_ALL_PAIRS.map((p) => p.id),
      totalNewRuns: totalNewRuns,
      reliableModelCount,
    },
    reliabilityReports,
    gaitProfiles,
    asymmetryResults,
    perModelAsymmetry,
    bridgeFrequencyMatrix,
    controlValidation,
    cohortComparison: {
      newCohortMeanBridgeFreq,
      newCohortCI,
      originalCohortMeanBridgeFreq,
      originalCohortCI,
      difference,
      differenceCI,
      ciIncludesZero,
    },
    modelSimilarityMatrix,
    scaleEffect,
    predictions,
  };

  // ── Write Outputs ──────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "10a-model-generality.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Model generality analysis (Phase 10A) complete.");
}

// ── Pair ID Mapping ──────────────────────────────────────────────────

/**
 * Map Phase 10A pair IDs to original pair IDs used in Phases 1-9.
 * Returns null if no mapping exists.
 */
function mapPhase10ToOriginalPairId(pair: { id: string; from: string; to: string }): string | null {
  const pairMap: Record<string, string> = {
    "p10a-music-mathematics": "cross-music-mathematics",
    "p10a-light-color": "p6a-light-color",
    "p10a-animal-poodle": "hierarchy-animal-poodle",
    "p10a-emotion-melancholy": "p6a-emotion-melancholy",
    "p10a-hot-cold": "antonym-hot-cold",
    "p10a-hide-shoe": "p6a-hide-shoe",
    "p10a-seed-garden": "p6a-seed-garden",
    "p10a-stapler-monsoon": "control-random-stapler-monsoon",
    // Reverse pairs
    "p10a-mathematics-music": "cross-mathematics-music",
    "p10a-color-light": "p6a-color-light",
    "p10a-poodle-animal": "hierarchy-poodle-animal",
    "p10a-melancholy-emotion": "p6a-melancholy-emotion",
  };
  return pairMap[pair.id] ?? null;
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("10a-model-generality-analysis")
    .description("Analyze Phase 10A model generality data")
    .option("--input <dir>", "input directory", "results")
    .option("--output <dir>", "output directory", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/10a-model-generality.md");

  program.parse();
  const opts = program.opts();

  analyze({
    input: opts.input,
    output: opts.output,
    findings: opts.findings,
  }).catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
