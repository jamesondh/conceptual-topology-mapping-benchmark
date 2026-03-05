#!/usr/bin/env bun
/**
 * Phase 8C: Gait-Normalized Distance Analysis
 *
 * Analyzes whether dividing raw navigational distances by per-model baselines
 * rescues cross-model distance correlation. If models have different "gait
 * lengths" (i.e., systematic differences in path dissimilarity), normalization
 * should compress that variance and reveal shared geometric structure.
 *
 * Data sources:
 *   results/gait-norm/   (dedicated 7-waypoint distance collection)
 *   results/fragility/   (Phase 8A salience data, 7 waypoints, shared pairs)
 *
 * Note: results/salience/ (Phase 6A) uses 5 waypoints and is NOT usable
 * for 7-waypoint distance computation. Skipped.
 *
 * Usage:
 *   bun run analysis/08c-gait-norm.ts
 *   bun run analysis/08c-gait-norm.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  seededRandom,
  bootstrapCI,
  mean,
  computeCrossRunDistance,
  pearsonCorrelation,
  spearmanCorrelation,
  bootstrapSpearmanCI,
  fisherZAggregate,
  computeTriangleExcess,
} from "../src/metrics.ts";
import { MODELS } from "../src/data/pairs.ts";
import {
  PHASE8C_REFERENCE_PAIRS,
  PHASE8C_TEST_PAIRS,
  PHASE8C_ALL_PAIRS,
} from "../src/data/pairs-phase8.ts";
import type {
  GaitNormAnalysisOutput,
  ElicitationResult,
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

// ── Pair Key Resolution ────────────────────────────────────────────

/**
 * Resolution map for Phase 8C pairs.
 *
 * Some Phase 8C pairs share data with Phase 8A (fragility) salience runs.
 * This map specifies which alternate lookup keys to try for each pair.
 *
 * Phase 8B pairs use 5 waypoints, so they cannot be used for 7wp distance.
 * Phase 6A (salience) also uses 5 waypoints -- skipped.
 */
const PAIR_KEY_ALTERNATES: Record<string, string[]> = {
  // Reference pairs with Phase 8A overlap
  "p8c-ref-science-art": ["p8a-science-art--salience", "p8a-science-art"],
  "p8c-ref-brain-computer": ["p8a-brain-computer--salience", "p8a-brain-computer"],
  // Test pairs with Phase 8A overlap
  "p8c-test-question-answer": ["p8a-question-answer--salience", "p8a-question-answer"],
  "p8c-test-winter-summer": ["p8a-winter-summer--salience", "p8a-winter-summer"],
  "p8c-test-ocean-mountain": ["p8a-ocean-mountain--salience", "p8a-ocean-mountain"],
};

/**
 * Try multiple key patterns for looking up runs.
 * Returns the first non-empty match from the unified lookup.
 *
 * Key patterns tried in order:
 * 1. Direct Phase 8C key: `p8c-ref-hot-cold--dist::<model>`
 * 2. Direct Phase 8C key without suffix: `p8c-ref-hot-cold::<model>`
 * 3. Alternate keys from PAIR_KEY_ALTERNATES (Phase 8A shared data)
 */
function resolvePairRuns(
  lookup: Map<string, ElicitationResult[]>,
  pairId: string,
  modelId: string,
): ElicitationResult[] {
  // Try direct key with --dist suffix
  const distKey = `${pairId}--dist::${modelId}`;
  if (lookup.has(distKey)) return lookup.get(distKey)!;

  // Try direct key without suffix
  const directKey = `${pairId}::${modelId}`;
  if (lookup.has(directKey)) return lookup.get(directKey)!;

  // Try alternate keys (Phase 8A shared data)
  const alternates = PAIR_KEY_ALTERNATES[pairId];
  if (alternates) {
    for (const altBase of alternates) {
      const altKey = `${altBase}::${modelId}`;
      if (lookup.has(altKey)) return lookup.get(altKey)!;
    }
  }

  return [];
}

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: GaitNormAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 8C: Gait-Normalized Distance Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Experiment Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Reference pairs:** ${output.metadata.referencePairs.length} (${output.metadata.referencePairs.join(", ")})`);
  lines.push(`- **Test pairs:** ${output.metadata.testPairs.length} (${output.metadata.testPairs.join(", ")})`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **New runs:** ${output.metadata.totalNewRuns}`);
  lines.push(`- **Reused runs:** ${output.metadata.totalReusedRuns}`);
  lines.push("");
  lines.push("Data sources:");
  lines.push("- `results/gait-norm/` (dedicated 7-waypoint distance collection)");
  lines.push("- `results/fragility/` (Phase 8A salience data, shared pairs)");
  lines.push("- Note: `results/salience/` (Phase 6A, 5 waypoints) NOT used -- incompatible waypoint count");
  lines.push("");

  // 2. Raw Distance Matrix
  lines.push("## 2. Raw Distance Matrix");
  lines.push("");
  lines.push("| Pair | Role | " + output.metadata.models.map(m => `${m} d(raw)`).join(" | ") + " | " + output.metadata.models.map(m => `${m} runs`).join(" | ") + " |");
  lines.push("|------|------|" + output.metadata.models.map(() => "--------|").join("") + output.metadata.models.map(() => "--------|").join("") + "");

  // Group by pair
  const allPairIds = [...output.metadata.referencePairs, ...output.metadata.testPairs];
  for (const pairId of allPairIds) {
    const entries = output.rawDistanceMatrix.filter(e => e.pairId === pairId);
    const role = entries.length > 0 ? entries[0].role : "?";
    const distCells = output.metadata.models.map(m => {
      const entry = entries.find(e => e.modelId === m);
      return entry ? entry.rawDistance.toFixed(3) : "N/A";
    });
    const runCells = output.metadata.models.map(m => {
      const entry = entries.find(e => e.modelId === m);
      return entry ? String(entry.runCount) : "0";
    });
    lines.push(`| ${pairId} | ${role} | ${distCells.join(" | ")} | ${runCells.join(" | ")} |`);
  }
  lines.push("");

  // 3. Model Baselines
  lines.push("## 3. Model Baselines");
  lines.push("");
  lines.push("Each model's baseline is the mean raw distance across the 8 reference pairs.");
  lines.push("Lower baseline = tighter waypoint agreement = shorter \"gait length\".");
  lines.push("");
  lines.push("| Model | Baseline | Interpretation |");
  lines.push("|-------|----------|----------------|");

  const sortedBaselines = [...output.modelBaselines].sort((a, b) => a.baseline - b.baseline);
  for (const mb of sortedBaselines) {
    let interp = "";
    if (mb.baseline < 0.40) interp = "Short gait (high within-run consistency)";
    else if (mb.baseline < 0.55) interp = "Medium gait";
    else if (mb.baseline < 0.70) interp = "Long gait (lower consistency)";
    else interp = "Very long gait (low consistency)";
    lines.push(`| ${mb.modelId} | ${mb.baseline.toFixed(3)} | ${interp} |`);
  }
  lines.push("");

  // 4. Raw Cross-Model Correlation
  lines.push("## 4. Raw Cross-Model Correlation");
  lines.push("");
  lines.push("Pearson r on raw test distances between model pairs:");
  lines.push("");
  lines.push("| Model A | Model B | r (raw) |");
  lines.push("|---------|---------|---------|");
  for (const pr of output.rawCorrelation.pairwiseR) {
    lines.push(`| ${pr.modelA} | ${pr.modelB} | ${pr.r.toFixed(3)} |`);
  }
  lines.push("");
  lines.push(`**Fisher-z aggregate r (raw):** ${output.rawCorrelation.aggregateR.toFixed(3)}`);
  lines.push("");

  // 5. Normalized Cross-Model Correlation (PRIMARY TEST)
  lines.push("## 5. Normalized Cross-Model Correlation (PRIMARY TEST)");
  lines.push("");
  lines.push("After dividing each test distance by the model's baseline:");
  lines.push("");
  lines.push("| Model A | Model B | r (normalized) |");
  lines.push("|---------|---------|----------------|");
  for (const pr of output.normalizedCorrelation.pairwiseR) {
    lines.push(`| ${pr.modelA} | ${pr.modelB} | ${pr.r.toFixed(3)} |`);
  }
  lines.push("");
  lines.push(`**Fisher-z aggregate r (normalized):** ${output.normalizedCorrelation.aggregateR.toFixed(3)} [${output.normalizedCorrelation.aggregateCI[0].toFixed(3)}, ${output.normalizedCorrelation.aggregateCI[1].toFixed(3)}]`);
  lines.push("");
  lines.push(`**Primary test passes:** ${output.normalizedCorrelation.primaryTestPasses ? "**YES** (r > 0.50 and CI lower > 0.30)" : "**NO**"}`);
  lines.push("");

  if (output.normalizedCorrelation.primaryTestPasses) {
    lines.push("Gait normalization successfully rescues cross-model distance correlation.");
    lines.push("Models agree on relative navigational distances once systematic gait differences are removed.");
  } else if (output.normalizedCorrelation.aggregateR > output.rawCorrelation.aggregateR) {
    lines.push("Normalization improves cross-model agreement but not enough to reach the primary threshold.");
    lines.push("Model-independent geometry is partially present but weak.");
  } else {
    lines.push("Normalization does not improve cross-model agreement.");
    lines.push("Model-independent geometry is definitively blocked -- the disagreement is structural, not merely a gait artifact.");
  }
  lines.push("");

  // 6. Per-Model-Pair Correlations (before and after normalization)
  lines.push("## 6. Per-Model-Pair Correlations (Before and After Normalization)");
  lines.push("");
  lines.push("| Model A | Model B | r (raw) | r (normalized) | Improvement |");
  lines.push("|---------|---------|---------|----------------|-------------|");
  for (const rawPr of output.rawCorrelation.pairwiseR) {
    const normPr = output.normalizedCorrelation.pairwiseR.find(
      p => p.modelA === rawPr.modelA && p.modelB === rawPr.modelB,
    );
    const normR = normPr ? normPr.r : 0;
    const improvement = normR - rawPr.r;
    lines.push(`| ${rawPr.modelA} | ${rawPr.modelB} | ${rawPr.r.toFixed(3)} | ${normR.toFixed(3)} | ${improvement >= 0 ? "+" : ""}${improvement.toFixed(3)} |`);
  }
  lines.push("");

  // 7. Rank-Order Stability
  lines.push("## 7. Rank-Order Stability");
  lines.push("");
  const ros = output.rankOrderStability;
  lines.push(`- **Raw Spearman aggregate:** ${ros.rawSpearmanAggregate.toFixed(3)}`);
  lines.push(`- **Normalized Spearman aggregate:** ${ros.normalizedSpearmanAggregate.toFixed(3)}`);
  lines.push(`- **Improvement from normalization:** ${ros.improvementFromNormalization >= 0 ? "+" : ""}${ros.improvementFromNormalization.toFixed(3)}`);
  lines.push("");
  if (ros.improvementFromNormalization > 0) {
    lines.push("Rank-order stability improves after normalization, meaning models agree better on which pairs are \"closer\" vs \"farther\" after gait correction.");
  } else {
    lines.push("Rank-order stability does not improve after normalization.");
  }
  lines.push("");

  // 8. Residual Analysis
  lines.push("## 8. Residual Analysis");
  lines.push("");
  lines.push("Test pairs ranked by maximum model disagreement in normalized distance:");
  lines.push("");
  lines.push("| Pair | Max Disagreement | Models |");
  lines.push("|------|-----------------|--------|");
  const sortedResiduals = [...output.residualAnalysis].sort(
    (a, b) => b.maxModelDisagreement - a.maxModelDisagreement,
  );
  for (const res of sortedResiduals) {
    lines.push(`| ${res.pairId} | ${res.maxModelDisagreement.toFixed(3)} | ${res.disagreementModels.join(" vs ")} |`);
  }
  lines.push("");

  // 9. Conditional Curvature Re-estimation
  lines.push("## 9. Conditional Curvature Re-estimation");
  lines.push("");
  const cc = output.conditionalCurvature;
  if (!cc.attempted) {
    lines.push("Curvature re-estimation was **not attempted** because the primary test did not pass (normalized r <= 0.50) or curvature data was unavailable.");
  } else {
    lines.push("Since the primary test passed, we re-estimate curvature using normalized distances.");
    lines.push("");
    if (cc.normalizedPolysemousExcess !== null && cc.normalizedNonPolysemousExcess !== null) {
      lines.push(`- **Normalized polysemous excess:** ${cc.normalizedPolysemousExcess.toFixed(4)}`);
      lines.push(`- **Normalized non-polysemous excess:** ${cc.normalizedNonPolysemousExcess.toFixed(4)}`);
      if (cc.differenceCI) {
        lines.push(`- **Difference CI:** [${cc.differenceCI[0].toFixed(4)}, ${cc.differenceCI[1].toFixed(4)}]`);
      }
      lines.push(`- **Null replicates:** ${cc.nullReplicates !== null ? (cc.nullReplicates ? "YES (polysemous excess remains non-significant)" : "NO (polysemous excess becomes significant)") : "N/A"}`);
    } else {
      lines.push("Insufficient curvature data for re-estimation.");
    }
  }
  lines.push("");

  // 10. Predictions Summary
  lines.push("## 10. Predictions Summary");
  lines.push("");
  lines.push("| # | Prediction | Result | Value |");
  lines.push("|---|------------|--------|-------|");

  for (const pred of output.predictions) {
    lines.push(`| ${pred.id} | ${pred.description} | ${pred.result} | ${pred.value} |`);
  }
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

  console.log("Conceptual Topology Mapping Benchmark - Gait-Normalized Distance Analysis");
  console.log("=========================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data from multiple sources ─────────────────────────────

  console.log("Loading data from multiple sources...");

  // Phase 8C dedicated gait-norm data (7 waypoints)
  const gaitNormDir = join(inputDir, "gait-norm");
  const gaitNormResults = await loadResultsFromDir(gaitNormDir);
  console.log(`  Gait-norm (8C):       ${gaitNormResults.length} results`);

  // Phase 8A fragility data (7 waypoints, shared pairs)
  const fragilityDir = join(inputDir, "fragility");
  const fragilityResults = await loadResultsFromDir(fragilityDir);
  console.log(`  Fragility (8A):       ${fragilityResults.length} results`);

  // Phase 6A salience data (5 waypoints -- NOT usable for 7wp distance)
  // Skipped intentionally
  console.log(`  Salience (6A):        SKIPPED (5 waypoints, incompatible with 7wp distance)`);
  console.log("");

  // Build unified lookup
  const allResults = [
    ...gaitNormResults,
    ...fragilityResults,
  ];
  const lookup = buildWaypointLookup(allResults);
  console.log(`  Total lookup keys: ${lookup.size}`);

  // Debug: print all lookup keys
  if (lookup.size > 0) {
    console.log("  Sample keys:");
    let keyCount = 0;
    for (const key of lookup.keys()) {
      if (keyCount < 10) {
        console.log(`    ${key} (${lookup.get(key)!.length} runs)`);
        keyCount++;
      }
    }
    if (lookup.size > 10) console.log(`    ... and ${lookup.size - 10} more`);
  }
  console.log("");

  // ── Compute raw distances for all 16 pairs ─────────────────────

  const modelIds = MODELS.map(m => m.id);
  let totalNewRuns = gaitNormResults.length;
  let totalReusedRuns = fragilityResults.length;

  console.log("Computing raw distances for all pairs...");

  type RawDistanceEntry = GaitNormAnalysisOutput["rawDistanceMatrix"][number];
  const rawDistanceMatrix: RawDistanceEntry[] = [];

  // Track which pairs have complete data across all models
  const pairModelDistances = new Map<string, Map<string, number>>();

  for (const pair of PHASE8C_ALL_PAIRS) {
    if (!pairModelDistances.has(pair.id)) {
      pairModelDistances.set(pair.id, new Map());
    }

    for (const modelId of modelIds) {
      const runs = resolvePairRuns(lookup, pair.id, modelId);
      const waypoints = waypointsOnly(runs);

      if (waypoints.length < 2) {
        console.log(`  SKIP ${pair.id} (${modelId}): insufficient runs (${waypoints.length})`);
        continue;
      }

      const rawDist = computeCrossRunDistance(waypoints);
      rawDistanceMatrix.push({
        pairId: pair.id,
        role: pair.role,
        modelId,
        rawDistance: rawDist,
        runCount: waypoints.length,
      });

      pairModelDistances.get(pair.id)!.set(modelId, rawDist);

      console.log(
        `  ${pair.id} (${modelId}): d=${rawDist.toFixed(3)} (${waypoints.length} runs)`,
      );
    }
  }
  console.log("");
  console.log(`Computed ${rawDistanceMatrix.length} raw distances`);
  console.log("");

  // ── Compute model baselines from reference pairs ────────────────

  console.log("Computing model baselines from reference pairs...");

  type BaselineEntry = GaitNormAnalysisOutput["modelBaselines"][number];
  const modelBaselines: BaselineEntry[] = [];

  for (const modelId of modelIds) {
    const refDistances: number[] = [];
    for (const refPair of PHASE8C_REFERENCE_PAIRS) {
      const dist = pairModelDistances.get(refPair.id)?.get(modelId);
      if (dist !== undefined) {
        refDistances.push(dist);
      }
    }

    const baseline = refDistances.length > 0 ? mean(refDistances) : 1;
    modelBaselines.push({ modelId, baseline });

    console.log(
      `  ${modelId}: baseline=${baseline.toFixed(3)} (from ${refDistances.length}/${PHASE8C_REFERENCE_PAIRS.length} reference pairs)`,
    );
  }
  console.log("");

  // ── Normalize test distances ────────────────────────────────────

  console.log("Normalizing test distances...");

  type NormDistEntry = GaitNormAnalysisOutput["normalizedDistanceMatrix"][number];
  const normalizedDistanceMatrix: NormDistEntry[] = [];

  // Also track normalized distances in a structure for correlation computation
  const testPairNormDistances = new Map<string, Map<string, number>>();

  for (const testPair of PHASE8C_TEST_PAIRS) {
    if (!testPairNormDistances.has(testPair.id)) {
      testPairNormDistances.set(testPair.id, new Map());
    }

    for (const modelId of modelIds) {
      const rawDist = pairModelDistances.get(testPair.id)?.get(modelId);
      const baseline = modelBaselines.find(b => b.modelId === modelId)?.baseline ?? 1;

      if (rawDist === undefined) continue;

      const normalizedDist = baseline > 0 ? rawDist / baseline : rawDist;
      normalizedDistanceMatrix.push({
        pairId: testPair.id,
        modelId,
        normalizedDistance: normalizedDist,
      });

      testPairNormDistances.get(testPair.id)!.set(modelId, normalizedDist);

      console.log(
        `  ${testPair.id} (${modelId}): raw=${rawDist.toFixed(3)} / baseline=${baseline.toFixed(3)} = norm=${normalizedDist.toFixed(3)}`,
      );
    }
  }
  console.log("");

  // ── Raw Cross-Model Correlation (on test pairs) ─────────────────

  console.log("Computing raw cross-model correlations on test pairs...");

  type PairwiseR = { modelA: string; modelB: string; r: number };
  const rawPairwiseR: PairwiseR[] = [];
  const rawCorrelations: number[] = [];

  for (let i = 0; i < modelIds.length; i++) {
    for (let j = i + 1; j < modelIds.length; j++) {
      const modelA = modelIds[i];
      const modelB = modelIds[j];
      const distA: number[] = [];
      const distB: number[] = [];

      for (const testPair of PHASE8C_TEST_PAIRS) {
        const dA = pairModelDistances.get(testPair.id)?.get(modelA);
        const dB = pairModelDistances.get(testPair.id)?.get(modelB);
        if (dA !== undefined && dB !== undefined) {
          distA.push(dA);
          distB.push(dB);
        }
      }

      if (distA.length >= 3) {
        const r = pearsonCorrelation(distA, distB);
        if (r !== null) {
          rawPairwiseR.push({ modelA, modelB, r });
          rawCorrelations.push(r);
          console.log(`  Raw r(${modelA}, ${modelB}): ${r.toFixed(3)} (n=${distA.length})`);
        }
      }
    }
  }

  const rawAggregateR = rawCorrelations.length > 0 ? fisherZAggregate(rawCorrelations) : 0;
  console.log(`  Raw aggregate r: ${rawAggregateR.toFixed(3)}`);
  console.log("");

  // ── Normalized Cross-Model Correlation (PRIMARY TEST) ───────────

  console.log("Computing normalized cross-model correlations on test pairs...");

  const normPairwiseR: PairwiseR[] = [];
  const normCorrelations: number[] = [];

  for (let i = 0; i < modelIds.length; i++) {
    for (let j = i + 1; j < modelIds.length; j++) {
      const modelA = modelIds[i];
      const modelB = modelIds[j];
      const distA: number[] = [];
      const distB: number[] = [];

      for (const testPair of PHASE8C_TEST_PAIRS) {
        const dA = testPairNormDistances.get(testPair.id)?.get(modelA);
        const dB = testPairNormDistances.get(testPair.id)?.get(modelB);
        if (dA !== undefined && dB !== undefined) {
          distA.push(dA);
          distB.push(dB);
        }
      }

      if (distA.length >= 3) {
        const r = pearsonCorrelation(distA, distB);
        if (r !== null) {
          normPairwiseR.push({ modelA, modelB, r });
          normCorrelations.push(r);
          console.log(`  Norm r(${modelA}, ${modelB}): ${r.toFixed(3)} (n=${distA.length})`);
        }
      }
    }
  }

  const normAggregateR = normCorrelations.length > 0 ? fisherZAggregate(normCorrelations) : 0;

  // Bootstrap CI on the aggregate by resampling test pairs
  console.log("  Computing bootstrap CI on normalized aggregate...");

  const nBootstrap = 1000;
  const bootstrapAggregates: number[] = [];
  const testPairIds = PHASE8C_TEST_PAIRS.map(p => p.id);

  for (let b = 0; b < nBootstrap; b++) {
    // Resample test pair indices
    const resampledIndices = Array.from(
      { length: testPairIds.length },
      () => Math.floor(seededRandom() * testPairIds.length),
    );

    const bCorrelations: number[] = [];

    for (let i = 0; i < modelIds.length; i++) {
      for (let j = i + 1; j < modelIds.length; j++) {
        const modelA = modelIds[i];
        const modelB = modelIds[j];
        const bDistA: number[] = [];
        const bDistB: number[] = [];

        for (const idx of resampledIndices) {
          const pairId = testPairIds[idx];
          const dA = testPairNormDistances.get(pairId)?.get(modelA);
          const dB = testPairNormDistances.get(pairId)?.get(modelB);
          if (dA !== undefined && dB !== undefined) {
            bDistA.push(dA);
            bDistB.push(dB);
          }
        }

        if (bDistA.length >= 3) {
          const r = pearsonCorrelation(bDistA, bDistB);
          if (r !== null) {
            bCorrelations.push(r);
          }
        }
      }
    }

    if (bCorrelations.length > 0) {
      bootstrapAggregates.push(fisherZAggregate(bCorrelations));
    }
  }

  bootstrapAggregates.sort((a, b) => a - b);
  const normAggregateCI: [number, number] = bootstrapAggregates.length >= 40
    ? [
        bootstrapAggregates[Math.floor(bootstrapAggregates.length * 0.025)],
        bootstrapAggregates[Math.floor(bootstrapAggregates.length * 0.975)],
      ]
    : [normAggregateR, normAggregateR];

  const primaryTestPasses = normAggregateR > 0.50 && normAggregateCI[0] > 0.30;

  console.log(`  Normalized aggregate r: ${normAggregateR.toFixed(3)} [${normAggregateCI[0].toFixed(3)}, ${normAggregateCI[1].toFixed(3)}]`);
  console.log(`  Primary test passes: ${primaryTestPasses}`);
  console.log("");

  // ── Rank-Order Stability ────────────────────────────────────────

  console.log("Computing rank-order stability (Spearman)...");

  const rawSpearmanCorrelations: number[] = [];
  const normSpearmanCorrelations: number[] = [];

  for (let i = 0; i < modelIds.length; i++) {
    for (let j = i + 1; j < modelIds.length; j++) {
      const modelA = modelIds[i];
      const modelB = modelIds[j];

      // Raw test distances
      const rawDistA: number[] = [];
      const rawDistB: number[] = [];
      const normDistA: number[] = [];
      const normDistB: number[] = [];

      for (const testPair of PHASE8C_TEST_PAIRS) {
        const rA = pairModelDistances.get(testPair.id)?.get(modelA);
        const rB = pairModelDistances.get(testPair.id)?.get(modelB);
        const nA = testPairNormDistances.get(testPair.id)?.get(modelA);
        const nB = testPairNormDistances.get(testPair.id)?.get(modelB);

        if (rA !== undefined && rB !== undefined) {
          rawDistA.push(rA);
          rawDistB.push(rB);
        }
        if (nA !== undefined && nB !== undefined) {
          normDistA.push(nA);
          normDistB.push(nB);
        }
      }

      if (rawDistA.length >= 3) {
        rawSpearmanCorrelations.push(spearmanCorrelation(rawDistA, rawDistB));
      }
      if (normDistA.length >= 3) {
        normSpearmanCorrelations.push(spearmanCorrelation(normDistA, normDistB));
      }
    }
  }

  const rawSpearmanAggregate = rawSpearmanCorrelations.length > 0
    ? fisherZAggregate(rawSpearmanCorrelations)
    : 0;
  const normSpearmanAggregate = normSpearmanCorrelations.length > 0
    ? fisherZAggregate(normSpearmanCorrelations)
    : 0;
  const spearmanImprovement = normSpearmanAggregate - rawSpearmanAggregate;

  console.log(`  Raw Spearman aggregate: ${rawSpearmanAggregate.toFixed(3)}`);
  console.log(`  Normalized Spearman aggregate: ${normSpearmanAggregate.toFixed(3)}`);
  console.log(`  Improvement: ${spearmanImprovement >= 0 ? "+" : ""}${spearmanImprovement.toFixed(3)}`);
  console.log("");

  // ── Residual Analysis ──────────────────────────────────────────

  console.log("Computing residual analysis (max model disagreement per test pair)...");

  type ResidualEntry = GaitNormAnalysisOutput["residualAnalysis"][number];
  const residualAnalysis: ResidualEntry[] = [];

  for (const testPair of PHASE8C_TEST_PAIRS) {
    let maxDisagreement = 0;
    let maxModels: [string, string] = ["", ""];

    for (let i = 0; i < modelIds.length; i++) {
      for (let j = i + 1; j < modelIds.length; j++) {
        const dA = testPairNormDistances.get(testPair.id)?.get(modelIds[i]);
        const dB = testPairNormDistances.get(testPair.id)?.get(modelIds[j]);
        if (dA !== undefined && dB !== undefined) {
          const disagreement = Math.abs(dA - dB);
          if (disagreement > maxDisagreement) {
            maxDisagreement = disagreement;
            maxModels = [modelIds[i], modelIds[j]];
          }
        }
      }
    }

    residualAnalysis.push({
      pairId: testPair.id,
      maxModelDisagreement: maxDisagreement,
      disagreementModels: maxModels,
    });

    console.log(
      `  ${testPair.id}: max disagreement=${maxDisagreement.toFixed(3)} (${maxModels.join(" vs ")})`,
    );
  }
  console.log("");

  // ── Conditional Curvature Re-estimation ─────────────────────────

  console.log("Checking conditional curvature re-estimation...");

  let conditionalCurvature: GaitNormAnalysisOutput["conditionalCurvature"] = {
    attempted: false,
    normalizedPolysemousExcess: null,
    normalizedNonPolysemousExcess: null,
    differenceCI: null,
    nullReplicates: null,
  };

  if (primaryTestPasses) {
    console.log("  Primary test passed -- attempting curvature re-estimation...");

    // Try to load Phase 7B curvature data
    const curvatureDir = join(inputDir, "curvature");
    let curvatureResults: ElicitationResult[] = [];
    try {
      curvatureResults = await loadResultsFromDir(curvatureDir);
    } catch {
      // Curvature data not available
    }

    if (curvatureResults.length > 0) {
      console.log(`  Loaded ${curvatureResults.length} curvature results`);

      // Import Phase 7B triangles for vertex type classification
      let PHASE7B_TRIANGLES: Array<{
        id: string;
        vertexType: "polysemous" | "non-polysemous";
        reusableLegs: Partial<Record<"AB" | "BC" | "AC", string>>;
      }> = [];

      try {
        const phase7Module = await import("../src/data/pairs-phase7.ts");
        PHASE7B_TRIANGLES = phase7Module.PHASE7B_TRIANGLES;
      } catch {
        console.log("  Could not load Phase 7B triangle definitions");
      }

      if (PHASE7B_TRIANGLES.length > 0) {
        const curvatureLookup = buildWaypointLookup(curvatureResults);

        // Also load supporting data for reusable legs
        const supportDirs = ["dimensionality", "salience", "cue-strength"];
        for (const dir of supportDirs) {
          const supportResults = await loadResultsFromDir(join(inputDir, dir));
          for (const r of supportResults) {
            if (r.failureMode || r.canonicalizedWaypoints.length === 0) continue;
            const key = `${r.pair.id}::${r.modelShortId}`;
            if (!curvatureLookup.has(key)) curvatureLookup.set(key, []);
            curvatureLookup.get(key)!.push(r);
          }
        }

        // Re-compute curvature with normalized distances
        const polyExcesses: number[] = [];
        const nonPolyExcesses: number[] = [];

        for (const triangle of PHASE7B_TRIANGLES) {
          for (const modelId of modelIds) {
            const baseline = modelBaselines.find(b => b.modelId === modelId)?.baseline ?? 1;

            // Look up legs using same logic as 07b-curvature.ts
            const getLegPairId = (leg: "AB" | "BC" | "AC"): string => {
              if (triangle.reusableLegs[leg]) return triangle.reusableLegs[leg]!;
              return `${triangle.id}--${leg}`;
            };

            const lookupCurvatureRuns = (pairId: string, mid: string): ElicitationResult[] => {
              const exactKey = `${pairId}::${mid}`;
              if (curvatureLookup.has(exactKey)) return curvatureLookup.get(exactKey)!;
              const fwdKey = `${pairId}--fwd::${mid}`;
              if (curvatureLookup.has(fwdKey)) return curvatureLookup.get(fwdKey)!;
              return [];
            };

            const abPairId = getLegPairId("AB");
            const bcPairId = getLegPairId("BC");
            const acPairId = getLegPairId("AC");

            const abRuns = waypointsOnly(lookupCurvatureRuns(abPairId, modelId));
            const bcRuns = waypointsOnly(lookupCurvatureRuns(bcPairId, modelId));
            const acRuns = waypointsOnly(lookupCurvatureRuns(acPairId, modelId));

            if (abRuns.length < 2 || bcRuns.length < 2 || acRuns.length < 2) continue;

            // Compute normalized distances
            const dAB = computeCrossRunDistance(abRuns) / baseline;
            const dBC = computeCrossRunDistance(bcRuns) / baseline;
            const dAC = computeCrossRunDistance(acRuns) / baseline;
            const excess = computeTriangleExcess(dAB, dBC, dAC);

            if (triangle.vertexType === "polysemous") {
              polyExcesses.push(excess);
            } else {
              nonPolyExcesses.push(excess);
            }
          }
        }

        if (polyExcesses.length > 0 && nonPolyExcesses.length > 0) {
          const polyMean = mean(polyExcesses);
          const nonPolyMean = mean(nonPolyExcesses);

          // Bootstrap CI on difference
          const diffs: number[] = [];
          for (let b = 0; b < nBootstrap; b++) {
            const polySample = Array.from(
              { length: polyExcesses.length },
              () => polyExcesses[Math.floor(seededRandom() * polyExcesses.length)],
            );
            const nonPolySample = Array.from(
              { length: nonPolyExcesses.length },
              () => nonPolyExcesses[Math.floor(seededRandom() * nonPolyExcesses.length)],
            );
            diffs.push(mean(polySample) - mean(nonPolySample));
          }
          diffs.sort((a, b) => a - b);
          const diffCI: [number, number] = [
            diffs[Math.floor(nBootstrap * 0.025)],
            diffs[Math.floor(nBootstrap * 0.975)],
          ];

          // Null replicates: does the CI include zero?
          const nullReplicates = diffCI[0] <= 0;

          conditionalCurvature = {
            attempted: true,
            normalizedPolysemousExcess: polyMean,
            normalizedNonPolysemousExcess: nonPolyMean,
            differenceCI: diffCI,
            nullReplicates,
          };

          console.log(`  Normalized polysemous excess: ${polyMean.toFixed(4)}`);
          console.log(`  Normalized non-polysemous excess: ${nonPolyMean.toFixed(4)}`);
          console.log(`  Difference CI: [${diffCI[0].toFixed(4)}, ${diffCI[1].toFixed(4)}]`);
          console.log(`  Null replicates: ${nullReplicates}`);
        } else {
          console.log("  Insufficient curvature data after resolution");
        }
      }
    } else {
      console.log("  No curvature data available -- skipping re-estimation");
    }
  } else {
    console.log("  Primary test did not pass -- skipping curvature re-estimation");
  }
  console.log("");

  // ── Predictions Evaluation ─────────────────────────────────────

  console.log("Evaluating predictions...");

  const predictions: GaitNormAnalysisOutput["predictions"] = [];

  // P1: Raw cross-model correlation r < 0.30 (replicates Phase 7B)
  const p1Pass = rawAggregateR < 0.30;
  predictions.push({
    id: 1,
    description: "Raw cross-model correlation r < 0.30 (replicates Phase 7B)",
    result: rawPairwiseR.length === 0 ? "insufficient data" : p1Pass ? "confirmed" : "not confirmed",
    value: `r=${rawAggregateR.toFixed(3)}`,
  });

  // P2: Claude baseline lowest (< 0.40), GPT/Grok highest (> 0.60)
  const claudeBaseline = modelBaselines.find(b => b.modelId === "claude")?.baseline ?? 0;
  const gptBaseline = modelBaselines.find(b => b.modelId === "gpt")?.baseline ?? 0;
  const grokBaseline = modelBaselines.find(b => b.modelId === "grok")?.baseline ?? 0;
  const claudeLowest = modelBaselines.every(b => b.modelId === "claude" || b.baseline >= claudeBaseline);
  const gptGrokHighest = gptBaseline > 0.60 || grokBaseline > 0.60;
  const p2Pass = claudeLowest && claudeBaseline < 0.40 && gptGrokHighest;
  predictions.push({
    id: 2,
    description: "Claude baseline lowest (< 0.40), GPT/Grok highest (> 0.60)",
    result: modelBaselines.length === 0
      ? "insufficient data"
      : p2Pass ? "confirmed" : "not confirmed",
    value: `claude=${claudeBaseline.toFixed(3)}, gpt=${gptBaseline.toFixed(3)}, grok=${grokBaseline.toFixed(3)}, claude_lowest=${claudeLowest}`,
  });

  // P3: Normalized cross-model correlation r > 0.50, CI lower > 0.30
  predictions.push({
    id: 3,
    description: "Normalized cross-model correlation r > 0.50, CI lower > 0.30 (PRIMARY)",
    result: normPairwiseR.length === 0
      ? "insufficient data"
      : primaryTestPasses ? "confirmed" : "not confirmed",
    value: `r=${normAggregateR.toFixed(3)} [${normAggregateCI[0].toFixed(3)}, ${normAggregateCI[1].toFixed(3)}]`,
  });

  // P4: Normalization improvement >= 0.25 (normalized r - raw r)
  const normImprovement = normAggregateR - rawAggregateR;
  const p4Pass = normImprovement >= 0.25;
  predictions.push({
    id: 4,
    description: "Normalization improvement >= 0.25 (normalized r - raw r)",
    result: rawPairwiseR.length === 0 || normPairwiseR.length === 0
      ? "insufficient data"
      : p4Pass ? "confirmed" : "not confirmed",
    value: `improvement=${normImprovement.toFixed(3)} (${rawAggregateR.toFixed(3)} -> ${normAggregateR.toFixed(3)})`,
  });

  // P5: Claude-GPT raw correlation is lowest; normalization improves it most
  const claudeGptRaw = rawPairwiseR.find(p =>
    (p.modelA === "claude" && p.modelB === "gpt") ||
    (p.modelA === "gpt" && p.modelB === "claude"),
  );
  const claudeGptNorm = normPairwiseR.find(p =>
    (p.modelA === "claude" && p.modelB === "gpt") ||
    (p.modelA === "gpt" && p.modelB === "claude"),
  );

  let p5Pass = false;
  let p5Value = "N/A";
  if (claudeGptRaw && claudeGptNorm) {
    const isLowestRaw = rawPairwiseR.every(p => p === claudeGptRaw || p.r >= claudeGptRaw.r);
    const claudeGptImprovement = claudeGptNorm.r - claudeGptRaw.r;
    const maxImprovement = Math.max(
      ...rawPairwiseR.map(rp => {
        const np = normPairwiseR.find(p => p.modelA === rp.modelA && p.modelB === rp.modelB);
        return np ? np.r - rp.r : -Infinity;
      }),
    );
    const mostImproved = claudeGptImprovement >= maxImprovement - 0.001;
    p5Pass = isLowestRaw && mostImproved;
    p5Value = `claude-gpt raw r=${claudeGptRaw.r.toFixed(3)}, norm r=${claudeGptNorm.r.toFixed(3)}, improvement=${claudeGptImprovement.toFixed(3)}, lowest_raw=${isLowestRaw}, most_improved=${mostImproved}`;
  }

  predictions.push({
    id: 5,
    description: "Claude-GPT raw correlation lowest; normalization improves it most",
    result: !claudeGptRaw || !claudeGptNorm
      ? "insufficient data"
      : p5Pass ? "confirmed" : "not confirmed",
    value: p5Value,
  });

  // P6: Spearman rank correlation improves after normalization
  const p6Pass = spearmanImprovement > 0;
  predictions.push({
    id: 6,
    description: "Spearman rank correlation improves after normalization",
    result: rawSpearmanCorrelations.length === 0 || normSpearmanCorrelations.length === 0
      ? "insufficient data"
      : p6Pass ? "confirmed" : "not confirmed",
    value: `raw_spearman=${rawSpearmanAggregate.toFixed(3)}, norm_spearman=${normSpearmanAggregate.toFixed(3)}, improvement=${spearmanImprovement.toFixed(3)}`,
  });

  // P7: If primary passes: polysemous excess remains non-significant under normalization
  if (primaryTestPasses) {
    predictions.push({
      id: 7,
      description: "If primary passes: polysemous excess remains non-significant under normalization",
      result: conditionalCurvature.attempted
        ? (conditionalCurvature.nullReplicates ? "confirmed" : "not confirmed")
        : "insufficient data",
      value: conditionalCurvature.attempted
        ? `poly_excess=${conditionalCurvature.normalizedPolysemousExcess?.toFixed(4)}, CI=${conditionalCurvature.differenceCI ? `[${conditionalCurvature.differenceCI[0].toFixed(4)}, ${conditionalCurvature.differenceCI[1].toFixed(4)}]` : "N/A"}`
        : "curvature data not available",
    });
  } else {
    predictions.push({
      id: 7,
      description: "If primary passes: polysemous excess remains non-significant under normalization",
      result: "insufficient data",
      value: "primary test did not pass; prediction is conditional",
    });
  }

  // P8: If primary fails: model-independent geometry definitively blocked
  if (!primaryTestPasses) {
    const geometryBlocked = normAggregateR <= 0.50 || normAggregateCI[0] <= 0.30;
    predictions.push({
      id: 8,
      description: "If primary fails: model-independent geometry definitively blocked",
      result: normPairwiseR.length === 0
        ? "insufficient data"
        : geometryBlocked ? "confirmed" : "not confirmed",
      value: `norm_r=${normAggregateR.toFixed(3)}, CI_lower=${normAggregateCI[0].toFixed(3)}`,
    });
  } else {
    predictions.push({
      id: 8,
      description: "If primary fails: model-independent geometry definitively blocked",
      result: "insufficient data",
      value: "primary test passed; this prediction applies only if it fails",
    });
  }

  for (const pred of predictions) {
    console.log(`  P${pred.id}: ${pred.result} -- ${pred.value}`);
  }
  console.log("");

  // ── Build Output ───────────────────────────────────────────────────

  const analysisOutput: GaitNormAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      referencePairs: PHASE8C_REFERENCE_PAIRS.map(p => p.id),
      testPairs: PHASE8C_TEST_PAIRS.map(p => p.id),
      models: modelIds,
      totalNewRuns: totalNewRuns,
      totalReusedRuns: totalReusedRuns,
    },
    rawDistanceMatrix,
    modelBaselines,
    normalizedDistanceMatrix,
    rawCorrelation: {
      aggregateR: rawAggregateR,
      pairwiseR: rawPairwiseR,
    },
    normalizedCorrelation: {
      aggregateR: normAggregateR,
      aggregateCI: normAggregateCI,
      pairwiseR: normPairwiseR,
      primaryTestPasses,
    },
    rankOrderStability: {
      rawSpearmanAggregate,
      normalizedSpearmanAggregate: normSpearmanAggregate,
      improvementFromNormalization: spearmanImprovement,
    },
    residualAnalysis,
    conditionalCurvature,
    predictions,
  };

  // ── Write Outputs ──────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "gait-norm-metrics.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Gait-normalized distance analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("gait-norm-analysis")
    .description("Analyze gait-normalized distance metric from Phase 8C data")
    .option("--input <dir>", "base results directory", "results")
    .option("--output <dir>", "output directory for analysis JSON", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/08c-gait-norm.md");

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
