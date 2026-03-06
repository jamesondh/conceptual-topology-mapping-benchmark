#!/usr/bin/env bun
/**
 * Phase 11A: Expanded Model Generality Analysis
 *
 * Tests whether core structural findings (R1 gait, R2 asymmetry, R5 controls,
 * R6 bridge bottlenecks) generalize to 4 additional models (DeepSeek, Mistral,
 * Cohere, Llama 4 Maverick), building a 12-model cross-model similarity matrix.
 *
 * Loads data from:
 *   results/expanded-generality/         (Phase 11A new model elicitation data)
 *   results/expanded-generality/probes/  (Phase 11A model reliability probe results)
 *   results/model-generality/            (Phase 10A new model data, for combined cohort)
 *   results/model-generality/probes/     (Phase 10A probe reports, for 10A model IDs)
 *   results/pilot/                       (Phase 1 original model data)
 *   results/reversals/                   (Phase 2 original model data)
 *   results/salience/                    (Phase 6A original model data)
 *
 * Zero API calls — pure offline analysis.
 *
 * Usage:
 *   bun run analysis/11a-expanded-generality.ts
 *   bun run analysis/11a-expanded-generality.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  seededRandom,
  mean,
  bootstrapCI,
  bootstrapCIFromRuns,
  crossDirectionJaccards,
  computeWaypointFrequencies,
  computeBridgeFrequency,
  bootstrapBridgeFrequencyCI,
} from "../src/metrics.ts";
import { computeJaccard } from "../src/canonicalize.ts";
import { MODELS, NEW_MODELS, PHASE11_MODELS } from "../src/data/pairs.ts";
import {
  PHASE11A_ALL_PAIRS,
  PHASE11A_FORWARD_PAIRS,
  PHASE11A_REVERSE_PAIRS,
  PHASE11A_ASYMMETRY_PAIRS,
  PHASE11A_NON_CONTROL_FORWARD_PAIRS,
} from "../src/data/pairs-phase11.ts";
import type {
  ElicitationResult,
  Phase11ExpandedGeneralityOutput,
  Phase10ModelReliabilityResult,
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

// ── Pair ID Mapping ──────────────────────────────────────────────────

/**
 * Map Phase 11A pair IDs to original pair IDs used in Phases 1-9.
 * Returns null if no mapping exists.
 */
function mapPhase11ToOriginalPairId(pair: { id: string }): string | null {
  const pairMap: Record<string, string> = {
    "p11a-music-mathematics": "cross-music-mathematics",
    "p11a-light-color": "p6a-light-color",
    "p11a-animal-poodle": "hierarchy-animal-poodle",
    "p11a-emotion-melancholy": "p6a-emotion-melancholy",
    "p11a-hot-cold": "antonym-hot-cold",
    "p11a-hide-shoe": "p6a-hide-shoe",
    "p11a-seed-garden": "p6a-seed-garden",
    "p11a-stapler-monsoon": "control-random-stapler-monsoon",
    // Reverse pairs
    "p11a-mathematics-music": "cross-mathematics-music",
    "p11a-color-light": "p6a-color-light",
    "p11a-poodle-animal": "hierarchy-poodle-animal",
    "p11a-melancholy-emotion": "p6a-melancholy-emotion",
  };
  return pairMap[pair.id] ?? null;
}

/**
 * Map Phase 10A pair IDs to original pair IDs used in Phases 1-9.
 * Returns null if no mapping exists.
 */
function mapPhase10ToOriginalPairId(pair: { id: string }): string | null {
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

/**
 * Map Phase 11A pair IDs to Phase 10A equivalents (same concept pairs, different prefix).
 */
function mapPhase11ToPhase10PairId(phase11Id: string): string {
  return phase11Id.replace("p11a-", "p10a-");
}

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: Phase11ExpandedGeneralityOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 11A: Expanded Model Generality Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Experiment Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Phase 11A new models tested:** ${output.metadata.newModels.join(", ")}`);
  lines.push(`- **Phase 10A models:** ${output.metadata.phase10AModels.join(", ")}`);
  lines.push(`- **Original models:** ${output.metadata.originalModels.join(", ")}`);
  lines.push(`- **Pairs:** ${output.metadata.pairs.length}`);
  lines.push(`- **Total new runs (Phase 11A):** ${output.metadata.totalNewRuns}`);
  lines.push(`- **Reliable Phase 11A models:** ${output.metadata.reliableModelCount}`);
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
  lines.push("| Model | Mean Intra-Model Jaccard | 95% CI | Cohort |");
  lines.push("|-------|------------------------|--------|--------|");

  for (const g of output.gaitProfiles) {
    const ciStr = `[${g.jaccardCI[0].toFixed(3)}, ${g.jaccardCI[1].toFixed(3)}]`;
    lines.push(
      `| ${g.displayName} | ${g.meanIntraModelJaccard.toFixed(3)} | ${ciStr} | ${g.cohort} |`,
    );
  }
  lines.push("");

  // Per-pair gait detail for Phase 11A models
  lines.push("### Gait per pair (Phase 11A models)");
  lines.push("");
  const gaitModels = output.gaitProfiles.filter((g) => g.cohort === "phase11a" && g.perPairJaccard.length > 0);
  if (gaitModels.length > 0) {
    const pairIds = gaitModels[0].perPairJaccard.map((pp) => pp.pairId);
    const header = `| Model | ${pairIds.map((p) => p.replace("p11a-", "")).join(" | ")} |`;
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

  // 7. Llama Scale Test
  lines.push("## 7. Llama Scale Test (Maverick vs 8B)");
  lines.push("");

  if (output.llamaScaleTest) {
    const ls = output.llamaScaleTest;
    lines.push("| Metric | Llama 4 Maverick | Llama 3.1 8B |");
    lines.push("|--------|-----------------|-------------|");
    lines.push(`| Gait Jaccard | ${ls.maverick.gaitJaccard?.toFixed(3) ?? "N/A"} | ${ls.llama8b.gaitJaccard?.toFixed(3) ?? "N/A"} |`);
    lines.push(`| Mean Bridge Freq | ${ls.maverick.meanBridgeFreq?.toFixed(3) ?? "N/A"} | ${ls.llama8b.meanBridgeFreq?.toFixed(3) ?? "N/A"} |`);
    lines.push(`| Mean Asymmetry | ${ls.maverick.meanAsymmetry?.toFixed(3) ?? "N/A"} | ${ls.llama8b.meanAsymmetry?.toFixed(3) ?? "N/A"} |`);
    lines.push("");
    lines.push(`- **Scale effect confirmed:** ${ls.scaleConfirmed === true ? "**YES**" : ls.scaleConfirmed === false ? "no" : "insufficient data"}`);
  } else {
    lines.push("Llama scale test not performed (insufficient data for one or both models).");
  }
  lines.push("");

  // 8. Combined Cohort Comparison
  lines.push("## 8. Combined Cohort Comparison (PRIMARY TEST)");
  lines.push("");
  const cc = output.cohortComparison;
  lines.push(`- **New cohort (10A+11A) mean bridge frequency:** ${cc.newCohortMeanBridgeFreq.toFixed(3)} [${cc.newCohortCI[0].toFixed(3)}, ${cc.newCohortCI[1].toFixed(3)}] (${cc.newCohortModelCount} models)`);
  lines.push(`- **Original cohort mean bridge frequency:** ${cc.originalCohortMeanBridgeFreq.toFixed(3)} [${cc.originalCohortCI[0].toFixed(3)}, ${cc.originalCohortCI[1].toFixed(3)}]`);
  lines.push(`- **Difference (new - original):** ${cc.difference.toFixed(3)} [${cc.differenceCI[0].toFixed(3)}, ${cc.differenceCI[1].toFixed(3)}]`);
  lines.push(`- **CI includes zero:** ${cc.ciIncludesZero ? "**YES** (no significant difference)" : "**NO** (significant difference)"}`);
  lines.push("");

  if (cc.ciIncludesZero) {
    lines.push(
      "The combined 8-model new cohort (Phases 10A + 11A) produces bridge frequencies " +
        "statistically indistinguishable from the original 4-model cohort. Core bridge " +
        "bottleneck structure (R6) generalizes across 12 models.",
    );
  } else {
    lines.push(
      "The combined new model cohort shows a statistically significant difference from the original cohort. " +
        "The direction and magnitude of this difference should be examined carefully.",
    );
  }
  lines.push("");

  // 9. 12-Model Similarity Matrix
  lines.push("## 9. 12-Model Pairwise Similarity");
  lines.push("");
  lines.push("| Model A | Model B | Mean Pairwise Jaccard |");
  lines.push("|---------|---------|----------------------|");

  for (const ms of output.modelSimilarityMatrix) {
    lines.push(`| ${ms.modelA} | ${ms.modelB} | ${ms.meanPairwiseJaccard.toFixed(3)} |`);
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
  const newGaits = output.gaitProfiles.filter((g) => g.cohort === "phase11a");
  if (newGaits.length > 0) {
    const gaitRange = `${Math.min(...newGaits.map((g) => g.meanIntraModelJaccard)).toFixed(3)}-${Math.max(...newGaits.map((g) => g.meanIntraModelJaccard)).toFixed(3)}`;
    lines.push(`- **R1 (Gait):** Phase 11A models show intra-model Jaccard range ${gaitRange}. Each model has a characteristic consistency level.`);
  }

  // R2 asymmetry summary
  const asymAbove = output.perModelAsymmetry.filter((a) => a.aboveThreshold).length;
  lines.push(`- **R2 (Asymmetry):** ${asymAbove} of ${output.perModelAsymmetry.length} reliable Phase 11A models show asymmetry index > 0.60.`);

  // R5 control summary
  const controlPass = output.controlValidation.filter((cv) => cv.passesControl).length;
  lines.push(`- **R5 (Controls):** ${controlPass} of ${output.controlValidation.length} models pass the random control validation.`);

  // R6 bridge summary
  lines.push(`- **R6 (Bridge bottlenecks):** Combined cohort comparison CI includes zero: ${cc.ciIncludesZero}. Bridge structure ${cc.ciIncludesZero ? "generalizes across 12 models" : "may not fully generalize"}.`);
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

  console.log("Conceptual Topology Mapping Benchmark - Expanded Model Generality Analysis (Phase 11A)");
  console.log("======================================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data from multiple sources ─────────────────────────────

  console.log("Loading data from multiple sources...");

  // Phase 11A new model data
  const expandedDir = join(inputDir, "expanded-generality");
  const expandedResults = await loadResultsFromDir(expandedDir);
  console.log(`  Expanded generality (11A): ${expandedResults.length} results`);

  // Phase 11A probe reliability reports
  const probesDir = join(inputDir, "expanded-generality", "probes");
  const reliabilityReports = await loadReliabilityReports(probesDir);
  console.log(`  Reliability reports (11A): ${reliabilityReports.length} reports`);

  // Phase 10A new model data (for combined cohort and similarity matrix)
  const generalityDir = join(inputDir, "model-generality");
  const generalityResults = await loadResultsFromDir(generalityDir);
  console.log(`  Model generality (10A):   ${generalityResults.length} results`);

  // Phase 10A probe reports (for 10A model IDs)
  const probes10aDir = join(inputDir, "model-generality", "probes");
  const reliability10aReports = await loadReliabilityReports(probes10aDir);
  console.log(`  Reliability reports (10A): ${reliability10aReports.length} reports`);

  // Prior phase data for original 4 models
  const pilotDir = join(inputDir, "pilot");
  const pilotResults = await loadResultsFromDir(pilotDir);
  console.log(`  Pilot (Phase 1):          ${pilotResults.length} results`);

  const reversalsDir = join(inputDir, "reversals");
  const reversalResults = await loadResultsFromDir(reversalsDir);
  console.log(`  Reversals (Phase 2):      ${reversalResults.length} results`);

  const salienceDir = join(inputDir, "salience");
  const salienceResults = await loadResultsFromDir(salienceDir);
  console.log(`  Salience (Phase 6A):      ${salienceResults.length} results`);
  console.log("");

  // Build lookups
  const expandedLookup = buildWaypointLookup(expandedResults);
  const generalityLookup = buildWaypointLookup(generalityResults);
  const originalLookup = buildWaypointLookup([
    ...pilotResults,
    ...reversalResults,
    ...salienceResults,
  ]);

  console.log(`  Expanded (11A) lookup keys:  ${expandedLookup.size}`);
  console.log(`  Generality (10A) lookup keys: ${generalityLookup.size}`);
  console.log(`  Original merged keys:         ${originalLookup.size}`);
  console.log("");

  const originalModelIds = MODELS.map((m) => m.id);
  const phase10aModelIds = NEW_MODELS.map((m) => m.id);
  const phase11aModelIds = PHASE11_MODELS.map((m) => m.id);
  const totalNewRuns = expandedResults.length;

  // ── Step 1: Process Reliability Reports ─────────────────────────

  console.log("Step 1: Processing model reliability reports...");

  // Determine which Phase 11A models are reliable or slow (usable for analysis)
  const reliableStatuses = new Set(["reliable", "slow"]);
  const reliableReports = reliabilityReports.filter((r) => reliableStatuses.has(r.status));
  const reliableNewModelIds = reliableReports.map((r) => r.modelId);
  const reliableModelCount = reliableNewModelIds.length;

  // Also determine reliable Phase 10A models for combined cohort
  const reliable10aReports = reliability10aReports.filter((r) => reliableStatuses.has(r.status));
  const reliable10aModelIds = reliable10aReports.map((r) => r.modelId);

  console.log(`  Reliable/slow Phase 11A models: ${reliableNewModelIds.join(", ") || "(none)"}`);
  console.log(`  Reliable/slow Phase 10A models: ${reliable10aModelIds.join(", ") || "(none)"}`);
  console.log(`  Excluded 11A models: ${reliabilityReports.filter((r) => !reliableStatuses.has(r.status)).map((r) => `${r.modelId} (${r.status})`).join(", ") || "(none)"}`);
  console.log("");

  // ── Step 2: Gait Profiles (R1) ─────────────────────────────────

  console.log("Step 2: Computing gait profiles (R1 replication)...");

  type GaitProfile = Phase11ExpandedGeneralityOutput["gaitProfiles"][number];
  const gaitProfiles: GaitProfile[] = [];

  // Hardcoded original model gait data from prior phases
  const originalGaitData: Record<string, number> = {
    claude: 0.578,
    gpt: 0.258,
    grok: 0.293,
    gemini: 0.372,
  };

  // Original models: use hardcoded values
  for (const model of MODELS) {
    const hardcodedJaccard = originalGaitData[model.id] ?? 0;
    gaitProfiles.push({
      modelId: model.id,
      displayName: model.displayName,
      meanIntraModelJaccard: hardcodedJaccard,
      jaccardCI: [hardcodedJaccard, hardcodedJaccard] as [number, number],
      isNewModel: false,
      cohort: "original",
      perPairJaccard: [],
    });
    console.log(`  ${model.id}: ${hardcodedJaccard.toFixed(3)} (hardcoded from prior phases, original)`);
  }

  // Phase 10A reliable models: compute from model-generality data using p10a- pair IDs
  for (const modelId of reliable10aModelIds) {
    const model = NEW_MODELS.find((m) => m.id === modelId);
    if (!model) continue;

    const perPairJaccards: Array<{ pairId: string; jaccard: number }> = [];
    const allJaccards: number[] = [];

    // Phase 10A data uses p10a- prefixed pair IDs
    const phase10aForwardPairIds = PHASE11A_FORWARD_PAIRS.map((p) => mapPhase11ToPhase10PairId(p.id));
    for (const p10aPairId of phase10aForwardPairIds) {
      const key = `${p10aPairId}::${modelId}`;
      const results = generalityLookup.get(key) ?? [];
      const runs = waypointsOnly(results);
      const jaccard = computeIntraModelJaccard(runs);
      perPairJaccards.push({ pairId: p10aPairId, jaccard });
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
      cohort: "phase10a",
      perPairJaccard: perPairJaccards,
    });

    console.log(`  ${model.id}: ${meanJaccard.toFixed(3)} [${jaccardCI[0].toFixed(3)}, ${jaccardCI[1].toFixed(3)}] (phase10a)`);
  }

  // Phase 11A reliable models: compute from expanded-generality data using p11a- pair IDs
  for (const modelId of reliableNewModelIds) {
    const model = PHASE11_MODELS.find((m) => m.id === modelId);
    if (!model) continue;

    const perPairJaccards: Array<{ pairId: string; jaccard: number }> = [];
    const allJaccards: number[] = [];

    for (const pair of PHASE11A_FORWARD_PAIRS) {
      const key = `${pair.id}::${modelId}`;
      const results = expandedLookup.get(key) ?? [];
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
      cohort: "phase11a",
      perPairJaccard: perPairJaccards,
    });

    console.log(`  ${model.id}: ${meanJaccard.toFixed(3)} [${jaccardCI[0].toFixed(3)}, ${jaccardCI[1].toFixed(3)}] (phase11a)`);
  }
  console.log("");

  // ── Step 3: Asymmetry (R2) ─────────────────────────────────────

  console.log("Step 3: Computing asymmetry (R2 replication) for Phase 11A models...");

  const asymmetryResults: Phase11ExpandedGeneralityOutput["asymmetryResults"] = [];
  const perModelAsymmetry: Phase11ExpandedGeneralityOutput["perModelAsymmetry"] = [];

  for (const modelId of reliableNewModelIds) {
    const modelAsymmetries: number[] = [];

    for (const ap of PHASE11A_ASYMMETRY_PAIRS) {
      const fwdKey = `${ap.forward}::${modelId}`;
      const revKey = `${ap.reverse}::${modelId}`;

      const fwdResults = expandedLookup.get(fwdKey) ?? [];
      const revResults = expandedLookup.get(revKey) ?? [];

      const fwdRuns = waypointsOnly(fwdResults);
      const revRuns = waypointsOnly(revResults);

      // Cross-direction Jaccard: all forward x reverse pairs
      const crossJaccard = computeCrossGroupJaccard(fwdRuns, revRuns);
      const asymmetryIndex = 1 - crossJaccard;

      // Bootstrap CI for asymmetry — resample runs independently to avoid pseudoreplication
      const asymmetryCIValues = fwdRuns.length > 0 && revRuns.length > 0
        ? bootstrapCIFromRuns(fwdRuns, revRuns, (fwd, rev) => 1 - mean(crossDirectionJaccards(fwd, rev)))
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

  console.log("Step 4: Computing bridge frequency matrix (R6 replication) for Phase 11A models...");

  const bridgeFrequencyMatrix: Phase11ExpandedGeneralityOutput["bridgeFrequencyMatrix"] = [];

  for (const pair of PHASE11A_FORWARD_PAIRS) {
    for (const modelId of reliableNewModelIds) {
      const key = `${pair.id}::${modelId}`;
      const results = expandedLookup.get(key) ?? [];
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

  console.log("Step 5: Control validation (R5: stapler-monsoon) for Phase 11A models...");

  const controlValidation: Phase11ExpandedGeneralityOutput["controlValidation"] = [];
  const controlPair = PHASE11A_FORWARD_PAIRS.find((p) => p.id === "p11a-stapler-monsoon");

  if (controlPair) {
    for (const modelId of reliableNewModelIds) {
      const key = `${controlPair.id}::${modelId}`;
      const results = expandedLookup.get(key) ?? [];
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

  // ── Step 6: Llama Scale Test ────────────────────────────────────

  console.log("Step 6: Llama scale test (Maverick vs 8B)...");

  let llamaScaleTest: Phase11ExpandedGeneralityOutput["llamaScaleTest"] = null;

  const maverickModelId = "llama4";
  const llama8bModelId = "llama";
  const maverickIsReliable = reliableNewModelIds.includes(maverickModelId);
  const llama8bIsReliable = reliable10aModelIds.includes(llama8bModelId);

  // Maverick metrics (from Phase 11A data)
  const maverickGait = gaitProfiles.find((g) => g.modelId === maverickModelId);
  const maverickGaitJaccard = maverickGait?.meanIntraModelJaccard ?? null;

  const maverickBridgeFreqs: number[] = [];
  if (maverickIsReliable) {
    for (const pair of PHASE11A_NON_CONTROL_FORWARD_PAIRS) {
      const entry = bridgeFrequencyMatrix.find(
        (bf) => bf.pairId === pair.id && bf.modelId === maverickModelId,
      );
      if (entry) maverickBridgeFreqs.push(entry.bridgeFrequency);
    }
  }
  const maverickMeanBridgeFreq = maverickBridgeFreqs.length > 0 ? mean(maverickBridgeFreqs) : null;

  const maverickAsym = perModelAsymmetry.find((a) => a.modelId === maverickModelId);
  const maverickMeanAsymmetry = maverickAsym?.meanAsymmetry ?? null;

  // Llama 8B metrics (from Phase 10A data)
  const llama8bGait = gaitProfiles.find((g) => g.modelId === llama8bModelId);
  const llama8bGaitJaccard = llama8bGait?.meanIntraModelJaccard ?? null;

  // Compute llama 8B bridge freq from 10A data
  const llama8bBridgeFreqs: number[] = [];
  if (llama8bIsReliable) {
    for (const pair of PHASE11A_NON_CONTROL_FORWARD_PAIRS) {
      const p10aPairId = mapPhase11ToPhase10PairId(pair.id);
      const key = `${p10aPairId}::${llama8bModelId}`;
      const results = generalityLookup.get(key) ?? [];
      const runs = waypointsOnly(results);
      if (pair.expectedBridge && runs.length > 0) {
        llama8bBridgeFreqs.push(computeBridgeFrequency(runs, pair.expectedBridge));
      }
    }
  }
  const llama8bMeanBridgeFreq = llama8bBridgeFreqs.length > 0 ? mean(llama8bBridgeFreqs) : null;

  // Llama 8B asymmetry: compute from 10A data
  let llama8bMeanAsymmetry: number | null = null;
  if (llama8bIsReliable) {
    const llama8bAsymmetries: number[] = [];
    for (const ap of PHASE11A_ASYMMETRY_PAIRS) {
      const fwdP10a = mapPhase11ToPhase10PairId(ap.forward);
      const revP10a = mapPhase11ToPhase10PairId(ap.reverse);
      const fwdResults = generalityLookup.get(`${fwdP10a}::${llama8bModelId}`) ?? [];
      const revResults = generalityLookup.get(`${revP10a}::${llama8bModelId}`) ?? [];
      const fwdRuns = waypointsOnly(fwdResults);
      const revRuns = waypointsOnly(revResults);
      if (fwdRuns.length > 0 && revRuns.length > 0) {
        const crossJ = computeCrossGroupJaccard(fwdRuns, revRuns);
        llama8bAsymmetries.push(1 - crossJ);
      }
    }
    if (llama8bAsymmetries.length > 0) {
      llama8bMeanAsymmetry = mean(llama8bAsymmetries);
    }
  }

  // Scale confirmed if Maverick bridge freq > 0.60 (vs 8B baseline at ~0.200)
  let scaleConfirmed: boolean | null = null;
  if (maverickMeanBridgeFreq !== null && llama8bMeanBridgeFreq !== null) {
    scaleConfirmed = maverickMeanBridgeFreq > 0.60;
  } else if (maverickMeanBridgeFreq !== null) {
    scaleConfirmed = maverickMeanBridgeFreq > 0.60;
  }

  if (maverickIsReliable || llama8bIsReliable) {
    llamaScaleTest = {
      maverick: {
        gaitJaccard: maverickIsReliable ? maverickGaitJaccard : null,
        meanBridgeFreq: maverickMeanBridgeFreq,
        meanAsymmetry: maverickIsReliable ? maverickMeanAsymmetry : null,
      },
      llama8b: {
        gaitJaccard: llama8bIsReliable ? llama8bGaitJaccard : null,
        meanBridgeFreq: llama8bMeanBridgeFreq,
        meanAsymmetry: llama8bMeanAsymmetry,
      },
      scaleConfirmed,
    };
    console.log(`  Maverick gait:      ${maverickGaitJaccard?.toFixed(3) ?? "N/A"}`);
    console.log(`  Maverick bridge:    ${maverickMeanBridgeFreq?.toFixed(3) ?? "N/A"}`);
    console.log(`  Maverick asymmetry: ${maverickMeanAsymmetry?.toFixed(3) ?? "N/A"}`);
    console.log(`  Llama 8B gait:      ${llama8bGaitJaccard?.toFixed(3) ?? "N/A"}`);
    console.log(`  Llama 8B bridge:    ${llama8bMeanBridgeFreq?.toFixed(3) ?? "N/A"}`);
    console.log(`  Llama 8B asymmetry: ${llama8bMeanAsymmetry?.toFixed(3) ?? "N/A"}`);
    console.log(`  Scale confirmed:    ${scaleConfirmed}`);
  } else {
    console.log("  Neither Llama model passed reliability gate. Skipping scale test.");
  }
  console.log("");

  // ── Step 7: Combined Cohort Comparison (Primary Test) ───────────

  console.log("Step 7: Combined cohort comparison (10A + 11A new models vs original 4)...");

  // Pool all reliable new models from both phases
  const allReliableNewModelIds = [...reliable10aModelIds, ...reliableNewModelIds];
  const newCohortModelCount = allReliableNewModelIds.length;

  // New cohort: per-pair mean bridge frequency across all reliable new models
  const newCohortFreqs: number[] = [];
  for (const pair of PHASE11A_NON_CONTROL_FORWARD_PAIRS) {
    const pairModelFreqs: number[] = [];

    // Phase 10A models: look up with p10a- prefix
    for (const modelId of reliable10aModelIds) {
      const p10aPairId = mapPhase11ToPhase10PairId(pair.id);
      const key = `${p10aPairId}::${modelId}`;
      const results = generalityLookup.get(key) ?? [];
      const runs = waypointsOnly(results);
      if (pair.expectedBridge && runs.length > 0) {
        pairModelFreqs.push(computeBridgeFrequency(runs, pair.expectedBridge));
      }
    }

    // Phase 11A models: look up with p11a- prefix
    for (const modelId of reliableNewModelIds) {
      const key = `${pair.id}::${modelId}`;
      const results = expandedLookup.get(key) ?? [];
      const runs = waypointsOnly(results);
      if (pair.expectedBridge && runs.length > 0) {
        pairModelFreqs.push(computeBridgeFrequency(runs, pair.expectedBridge));
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

  // Original cohort: use hardcoded prior means from PHASE11A_FORWARD_PAIRS priorFreq
  const originalCohortFreqs: number[] = [];
  for (const pair of PHASE11A_NON_CONTROL_FORWARD_PAIRS) {
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

  let differenceCI: [number, number] = [difference, difference];
  if (newCohortFreqs.length >= 2 && originalCohortFreqs.length >= 2) {
    const diffs: number[] = [];
    const nBoot = 1000;
    for (let b = 0; b < nBoot; b++) {
      const newSample: number[] = [];
      for (let i = 0; i < newCohortFreqs.length; i++) {
        newSample.push(newCohortFreqs[Math.floor(seededRandom() * newCohortFreqs.length)]);
      }
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

  console.log(`  New cohort mean:      ${newCohortMeanBridgeFreq.toFixed(3)} [${newCohortCI[0].toFixed(3)}, ${newCohortCI[1].toFixed(3)}] (n=${newCohortFreqs.length}, ${newCohortModelCount} models)`);
  console.log(`  Original cohort mean: ${originalCohortMeanBridgeFreq.toFixed(3)} [${originalCohortCI[0].toFixed(3)}, ${originalCohortCI[1].toFixed(3)}] (n=${originalCohortFreqs.length})`);
  console.log(`  Difference:           ${difference.toFixed(3)} [${differenceCI[0].toFixed(3)}, ${differenceCI[1].toFixed(3)}]`);
  console.log(`  CI includes zero:     ${ciIncludesZero}`);
  console.log("");

  // ── Step 8: 12-Model Similarity Matrix ────────────────────────

  console.log("Step 8: Computing 12-model pairwise similarity matrix...");

  const modelSimilarityMatrix: Phase11ExpandedGeneralityOutput["modelSimilarityMatrix"] = [];
  const allAnalyzedModelIds = [...originalModelIds, ...reliable10aModelIds, ...reliableNewModelIds];

  for (let i = 0; i < allAnalyzedModelIds.length; i++) {
    for (let j = i + 1; j < allAnalyzedModelIds.length; j++) {
      const modelA = allAnalyzedModelIds[i];
      const modelB = allAnalyzedModelIds[j];
      const pairJaccards: number[] = [];

      // Use Phase 11A forward pairs as the reference set
      for (const pair of PHASE11A_FORWARD_PAIRS) {
        // Get runs for model A
        let runsA: string[][] = [];
        // Try Phase 11A data
        const keyA11 = `${pair.id}::${modelA}`;
        const resultsA11 = expandedLookup.get(keyA11) ?? [];
        if (resultsA11.length > 0) {
          runsA = waypointsOnly(resultsA11);
        } else {
          // Try Phase 10A data (same pair concept, different prefix)
          const p10aPairId = mapPhase11ToPhase10PairId(pair.id);
          const keyA10 = `${p10aPairId}::${modelA}`;
          const resultsA10 = generalityLookup.get(keyA10) ?? [];
          if (resultsA10.length > 0) {
            runsA = waypointsOnly(resultsA10);
          } else {
            // Try original-model lookup (Phases 1-9)
            const origPairId = mapPhase11ToOriginalPairId(pair);
            if (origPairId) {
              const keyAOrig = `${origPairId}::${modelA}`;
              const resultsAOrig = originalLookup.get(keyAOrig) ?? [];
              runsA = waypointsOnly(resultsAOrig);
            }
          }
        }

        // Get runs for model B
        let runsB: string[][] = [];
        const keyB11 = `${pair.id}::${modelB}`;
        const resultsB11 = expandedLookup.get(keyB11) ?? [];
        if (resultsB11.length > 0) {
          runsB = waypointsOnly(resultsB11);
        } else {
          const p10aPairId = mapPhase11ToPhase10PairId(pair.id);
          const keyB10 = `${p10aPairId}::${modelB}`;
          const resultsB10 = generalityLookup.get(keyB10) ?? [];
          if (resultsB10.length > 0) {
            runsB = waypointsOnly(resultsB10);
          } else {
            const origPairId = mapPhase11ToOriginalPairId(pair);
            if (origPairId) {
              const keyBOrig = `${origPairId}::${modelB}`;
              const resultsBOrig = originalLookup.get(keyBOrig) ?? [];
              runsB = waypointsOnly(resultsBOrig);
            }
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

  // ── Step 9: Predictions Evaluation ─────────────────────────────

  console.log("Step 9: Evaluating predictions...");

  const predictions: Phase11ExpandedGeneralityOutput["predictions"] = [];

  // P1: All 4 new models pass probe reliability gate
  const p1Pass = reliableModelCount === phase11aModelIds.length;
  predictions.push({
    id: 1,
    description: "All 4 Phase 11A models pass reliability gate",
    result: reliabilityReports.length > 0
      ? (p1Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `${reliableModelCount} of ${phase11aModelIds.length} reliable`,
  });

  // P2: All 4 show distinct gaits (Jaccard 0.15-0.70)
  const newGaitProfiles = gaitProfiles.filter((g) => g.cohort === "phase11a");
  const gaitInRange = newGaitProfiles.filter(
    (g) => g.meanIntraModelJaccard >= 0.15 && g.meanIntraModelJaccard <= 0.70,
  );
  const p2Pass = newGaitProfiles.length > 0 && gaitInRange.length === newGaitProfiles.length;
  predictions.push({
    id: 2,
    description: "All Phase 11A models show characteristic gait (Jaccard 0.15-0.70)",
    result: newGaitProfiles.length > 0
      ? (p2Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `${gaitInRange.length} of ${newGaitProfiles.length} in range`,
  });

  // P3: All 4 show asymmetry > 0.60
  const asymAboveThreshold = perModelAsymmetry.filter((a) => a.aboveThreshold);
  const p3Pass = perModelAsymmetry.length > 0 &&
    asymAboveThreshold.length === perModelAsymmetry.length;
  predictions.push({
    id: 3,
    description: "All Phase 11A models show asymmetry index > 0.60",
    result: perModelAsymmetry.length > 0
      ? (p3Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `${asymAboveThreshold.length} of ${perModelAsymmetry.length} above 0.60`,
  });

  // P4: DeepSeek/Mistral/Cohere bridge frequencies comparable to original cohort (mean within 0.20)
  const comparableModelIds = ["deepseek", "mistral", "cohere"];
  const comparableFreqs: number[] = [];
  for (const modelId of comparableModelIds) {
    if (!reliableNewModelIds.includes(modelId)) continue;
    const modelBridgeFreqs: number[] = [];
    for (const pair of PHASE11A_NON_CONTROL_FORWARD_PAIRS) {
      const entry = bridgeFrequencyMatrix.find(
        (bf) => bf.pairId === pair.id && bf.modelId === modelId,
      );
      if (entry) modelBridgeFreqs.push(entry.bridgeFrequency);
    }
    if (modelBridgeFreqs.length > 0) {
      comparableFreqs.push(mean(modelBridgeFreqs));
    }
  }
  const comparableMean = comparableFreqs.length > 0 ? mean(comparableFreqs) : 0;
  const p4Pass = comparableFreqs.length > 0 &&
    Math.abs(comparableMean - originalCohortMeanBridgeFreq) <= 0.20;
  predictions.push({
    id: 4,
    description: "DeepSeek/Mistral/Cohere bridge freq within 0.20 of original cohort",
    result: comparableFreqs.length > 0
      ? (p4Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `comparable mean=${comparableMean.toFixed(3)}, original=${originalCohortMeanBridgeFreq.toFixed(3)}, diff=${Math.abs(comparableMean - originalCohortMeanBridgeFreq).toFixed(3)}`,
  });

  // P5: Llama 4 Maverick bridge freq > 0.60 (vs 8B at 0.200)
  const p5Pass = maverickMeanBridgeFreq !== null && maverickMeanBridgeFreq > 0.60;
  predictions.push({
    id: 5,
    description: "Llama 4 Maverick bridge freq > 0.60 (vs 8B at ~0.200)",
    result: maverickMeanBridgeFreq !== null
      ? (p5Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `Maverick=${maverickMeanBridgeFreq?.toFixed(3) ?? "N/A"}, 8B=${llama8bMeanBridgeFreq?.toFixed(3) ?? "N/A"}`,
  });

  // P6: Stapler-monsoon fails R5 for all 4 new models
  const controlAllPass = controlValidation.length > 0 &&
    controlValidation.every((cv) => cv.passesControl);
  predictions.push({
    id: 6,
    description: "Control pair stapler-monsoon passes R5 for all Phase 11A models",
    result: controlValidation.length > 0
      ? (controlAllPass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `${controlValidation.filter((cv) => cv.passesControl).length} of ${controlValidation.length} pass`,
  });

  // P7: DeepSeek clusters with Claude/Qwen in similarity matrix
  const deepseekClaudeEntry = modelSimilarityMatrix.find(
    (ms) =>
      (ms.modelA === "deepseek" && ms.modelB === "claude") ||
      (ms.modelA === "claude" && ms.modelB === "deepseek"),
  );
  const deepseekQwenEntry = modelSimilarityMatrix.find(
    (ms) =>
      (ms.modelA === "deepseek" && ms.modelB === "qwen") ||
      (ms.modelA === "qwen" && ms.modelB === "deepseek"),
  );
  const deepseekClaudeJaccard = deepseekClaudeEntry?.meanPairwiseJaccard ?? 0;
  const deepseekQwenJaccard = deepseekQwenEntry?.meanPairwiseJaccard ?? 0;

  // DeepSeek "clusters with" Claude/Qwen if its similarity to them is above median
  const allNewModelJaccards = modelSimilarityMatrix
    .filter((ms) => ms.modelA === "deepseek" || ms.modelB === "deepseek")
    .map((ms) => ms.meanPairwiseJaccard);
  const medianJaccard = allNewModelJaccards.length > 0
    ? [...allNewModelJaccards].sort((a, b) => a - b)[Math.floor(allNewModelJaccards.length / 2)]
    : 0;
  const p7Pass = deepseekClaudeJaccard >= medianJaccard && deepseekQwenJaccard >= medianJaccard;
  predictions.push({
    id: 7,
    description: "DeepSeek clusters with Claude/Qwen in similarity matrix",
    result: allNewModelJaccards.length > 0
      ? (p7Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `deepseek-claude=${deepseekClaudeJaccard.toFixed(3)}, deepseek-qwen=${deepseekQwenJaccard.toFixed(3)}, median=${medianJaccard.toFixed(3)}`,
  });

  for (const pred of predictions) {
    console.log(`  P${pred.id}: ${pred.result} -- ${pred.value}`);
  }
  console.log("");

  // ── Build Output ───────────────────────────────────────────────────

  const analysisOutput: Phase11ExpandedGeneralityOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      newModels: reliableNewModelIds,
      originalModels: originalModelIds,
      phase10AModels: reliable10aModelIds,
      pairs: PHASE11A_ALL_PAIRS.map((p) => p.id),
      totalNewRuns: totalNewRuns,
      reliableModelCount,
    },
    reliabilityReports,
    gaitProfiles,
    asymmetryResults,
    perModelAsymmetry,
    bridgeFrequencyMatrix,
    controlValidation,
    llamaScaleTest,
    cohortComparison: {
      newCohortMeanBridgeFreq,
      newCohortCI,
      originalCohortMeanBridgeFreq,
      originalCohortCI,
      difference,
      differenceCI,
      ciIncludesZero,
      newCohortModelCount,
    },
    modelSimilarityMatrix,
    predictions,
  };

  // ── Write Outputs ──────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "11a-expanded-generality.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Expanded model generality analysis (Phase 11A) complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("11a-expanded-generality-analysis")
    .description("Analyze Phase 11A expanded model generality data")
    .option("--input <dir>", "input directory", "results")
    .option("--output <dir>", "output directory", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/11a-expanded-generality.md");

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
