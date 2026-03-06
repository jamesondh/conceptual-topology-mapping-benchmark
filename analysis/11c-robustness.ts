#!/usr/bin/env bun
/**
 * Phase 11C: Multiverse Robustness Analysis
 *
 * Tests whether R1 (gait), R2 (asymmetry), and bridge frequency are robust
 * across waypoint count x temperature variations (2x2 grid + baseline).
 *
 * Loads data from:
 *   results/robustness/{conditionLabel}/  (Phase 11C new condition data)
 *   results/pilot/                        (Phase 1 baseline data, 7wp 0.7)
 *   results/reversals/                    (Phase 2 baseline data, 7wp 0.7)
 *   results/salience/                     (Phase 6A baseline data, 7wp 0.7)
 *
 * Zero API calls — pure offline analysis.
 *
 * Usage:
 *   bun run analysis/11c-robustness.ts
 *   bun run analysis/11c-robustness.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  mean,
  bootstrapCI,
  computeBridgeFrequency,
  bootstrapBridgeFrequencyCI,
  computeWaypointFrequencies,
} from "../src/metrics.ts";
import { computeJaccard } from "../src/canonicalize.ts";
import { MODELS, PHASE11_MODELS } from "../src/data/pairs.ts";
import {
  PHASE11C_ALL_PAIRS,
  PHASE11C_FORWARD_PAIRS,
  PHASE11C_REVERSE_PAIRS,
  PHASE11C_ASYMMETRY_PAIRS,
  PHASE11C_MODEL_IDS,
  ROBUSTNESS_CONDITIONS,
  ROBUSTNESS_BASELINE,
} from "../src/data/pairs-phase11.ts";
import type {
  ElicitationResult,
  Phase11RobustnessOutput,
  RobustnessCellResult,
  RobustnessCondition,
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

/**
 * Map Phase 11C pair IDs to original pair IDs used in Phases 1-9.
 */
function mapPhase11CToOriginalPairId(pairId: string): string | null {
  const pairMap: Record<string, string> = {
    "p11c-light-color": "p6a-light-color",
    "p11c-hot-cold": "antonym-hot-cold",
    "p11c-emotion-melancholy": "p6a-emotion-melancholy",
    "p11c-stapler-monsoon": "control-random-stapler-monsoon",
    "p11c-cold-hot": "antonym-cold-hot",
    "p11c-melancholy-emotion": "p6a-melancholy-emotion",
  };
  return pairMap[pairId] ?? null;
}

/**
 * Kendall's W (coefficient of concordance).
 * k = number of judges (conditions), n = number of items (models).
 * W = 12 * S / (k^2 * (n^3 - n))
 * where S = sum of squared deviations of rank sums from the mean rank sum.
 */
function kendallW(rankings: number[][]): number {
  const k = rankings.length; // number of judges
  if (k < 2) return 1;
  const n = rankings[0].length; // number of items
  if (n < 2) return 1;

  // Compute rank sums for each item
  const rankSums: number[] = new Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < k; i++) {
      rankSums[j] += rankings[i][j];
    }
  }

  const meanRankSum = mean(rankSums);
  let S = 0;
  for (let j = 0; j < n; j++) {
    S += (rankSums[j] - meanRankSum) ** 2;
  }

  return (12 * S) / (k * k * (n * n * n - n));
}

/**
 * Convert values to ranks (1-based, ties averaged).
 * Higher value gets higher rank (descending).
 */
function rankDescending(values: number[]): number[] {
  const indexed = values.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => b.v - a.v); // descending
  const ranks = new Array<number>(values.length);
  let i = 0;
  while (i < indexed.length) {
    let j = i;
    while (j < indexed.length && indexed[j].v === indexed[i].v) j++;
    const avgRank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) {
      ranks[indexed[k].i] = avgRank;
    }
    i = j;
  }
  return ranks;
}

/**
 * Approximate chi-squared p-value using Wilson-Hilferty transformation.
 * P(X^2 > chiSq) where X^2 ~ chi^2(df).
 */
function chiSquaredPValue(chiSq: number, df: number): number {
  if (df <= 0) return 1;
  if (chiSq <= 0) return 1;

  const z = Math.pow(chiSq / df, 1 / 3) - (1 - 2 / (9 * df));
  const se = Math.sqrt(2 / (9 * df));
  const zScore = z / se;

  // Normal CDF approximation (Abramowitz-Stegun)
  const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
  const d = 0.3989422804014327; // 1/sqrt(2*pi)
  const poly =
    t *
    (0.31938153 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const normalCdf =
    zScore >= 0
      ? 1 - d * Math.exp(-0.5 * zScore * zScore) * poly
      : d * Math.exp(-0.5 * zScore * zScore) * poly;

  return Math.max(0, Math.min(1, 1 - normalCdf));
}

/**
 * Approximate F-distribution p-value using Abramowitz-Stegun approach.
 * Converts F to chi-squared approximation: X ~ F(df1, df2)
 * Use Wilson-Hilferty: if df2 is large, F*df1 ~ chi^2(df1).
 */
function fTestPValue(fStat: number, df1: number, df2: number): number {
  if (df1 <= 0 || df2 <= 0 || fStat <= 0) return 1;
  // For small df2 values, use the chi-squared approximation on F*df1
  const chiSq = fStat * df1;
  return chiSquaredPValue(chiSq, df1);
}

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: Phase11RobustnessOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 11C: Multiverse Robustness Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Conditions:** ${output.metadata.conditions.map((c) => c.label).join(", ")} + baseline (${ROBUSTNESS_BASELINE.label})`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **Pairs:** ${output.metadata.pairs.length}`);
  lines.push(`- **Total new runs:** ${output.metadata.totalNewRuns}`);
  lines.push(`- **Total reused baseline runs:** ${output.metadata.totalReusedRuns}`);
  lines.push("");

  // 2. Gait Robustness (R1)
  lines.push("## 2. Gait Robustness (R1)");
  lines.push("");
  lines.push("| Model | Condition | Mean Intra-Model Jaccard | 95% CI |");
  lines.push("|-------|-----------|------------------------|--------|");
  for (const g of output.gaitRobustness) {
    const ciStr = `[${g.jaccardCI[0].toFixed(3)}, ${g.jaccardCI[1].toFixed(3)}]`;
    lines.push(`| ${g.modelId} | ${g.conditionLabel} | ${g.meanIntraModelJaccard.toFixed(3)} | ${ciStr} |`);
  }
  lines.push("");

  lines.push("### Rank-Order Stability");
  lines.push("");
  lines.push(`- **Kendall's W:** ${output.gaitRankStability.kendallW.toFixed(3)}`);
  lines.push(`- **Rank order preserved:** ${output.gaitRankStability.rankOrderPreserved ? "**YES**" : "no"}`);
  lines.push("");
  for (const ro of output.gaitRankStability.modelRankOrder) {
    lines.push(`  - ${ro.conditionLabel}: ${ro.rankedModels.join(" > ")}`);
  }
  lines.push("");

  // 3. Asymmetry Robustness (R2)
  lines.push("## 3. Asymmetry Robustness (R2)");
  lines.push("");
  lines.push("| Model | Condition | Pair | Asymmetry Index | 95% CI |");
  lines.push("|-------|-----------|------|----------------|--------|");
  for (const a of output.asymmetryRobustness) {
    const ciStr = `[${a.asymmetryCI[0].toFixed(3)}, ${a.asymmetryCI[1].toFixed(3)}]`;
    lines.push(`| ${a.modelId} | ${a.conditionLabel} | ${a.pairLabel} | ${a.asymmetryIndex.toFixed(3)} | ${ciStr} |`);
  }
  lines.push("");

  lines.push("### Mean Asymmetry per Condition");
  lines.push("");
  lines.push("| Condition | Mean Asymmetry | 95% CI | > 0.60? |");
  lines.push("|-----------|---------------|--------|---------|");
  for (const ma of output.meanAsymmetryPerCondition) {
    const ciStr = `[${ma.asymmetryCI[0].toFixed(3)}, ${ma.asymmetryCI[1].toFixed(3)}]`;
    lines.push(`| ${ma.conditionLabel} | ${ma.meanAsymmetry.toFixed(3)} | ${ciStr} | ${ma.aboveThreshold ? "**YES**" : "no"} |`);
  }
  lines.push("");

  // 4. Bridge Frequency Robustness
  lines.push("## 4. Bridge Frequency Robustness");
  lines.push("");
  lines.push("| Pair | Bridge | Model | Condition | Freq | 95% CI |");
  lines.push("|------|--------|-------|-----------|------|--------|");
  for (const bf of output.bridgeFrequencyRobustness) {
    const ciStr = `[${bf.bridgeFrequencyCI[0].toFixed(3)}, ${bf.bridgeFrequencyCI[1].toFixed(3)}]`;
    lines.push(`| ${bf.pairId} | ${bf.bridgeConcept} | ${bf.modelId} | ${bf.conditionLabel} | ${bf.bridgeFrequency.toFixed(3)} | ${ciStr} |`);
  }
  lines.push("");

  lines.push("### Mean Bridge Frequency per Condition");
  lines.push("");
  lines.push("| Condition | Mean Bridge Freq | 95% CI | Above thresholds? |");
  lines.push("|-----------|-----------------|--------|-------------------|");
  for (const mb of output.meanBridgeFreqPerCondition) {
    const ciStr = `[${mb.bridgeFreqCI[0].toFixed(3)}, ${mb.bridgeFreqCI[1].toFixed(3)}]`;
    lines.push(`| ${mb.conditionLabel} | ${mb.meanBridgeFreq.toFixed(3)} | ${ciStr} | ${mb.aboveThreshold ? "**YES**" : "no"} |`);
  }
  lines.push("");

  // 5. ANOVA Interaction Test
  lines.push("## 5. ANOVA-like Interaction Test");
  lines.push("");
  const anova = output.anovaInteraction;
  lines.push(`- **Waypoint main effect (SS proportion):** ${anova.waypointMainEffect.toFixed(4)} (p=${anova.waypointMainEffectP.toFixed(4)})`);
  lines.push(`- **Temperature main effect (SS proportion):** ${anova.temperatureMainEffect.toFixed(4)} (p=${anova.temperatureMainEffectP.toFixed(4)})`);
  lines.push(`- **Interaction effect (SS proportion):** ${anova.interactionEffect.toFixed(4)} (p=${anova.interactionEffectP.toFixed(4)})`);
  lines.push(`- **Model main effect (SS proportion):** ${anova.modelMainEffect.toFixed(4)} (p=${anova.modelMainEffectP.toFixed(4)})`);
  lines.push(`- **Null interaction:** ${anova.nullInteraction ? "**YES** (model identity drives structure, not parameter interaction)" : "no"}`);
  lines.push("");

  // 6. Waypoint Scaling
  lines.push("## 6. Waypoint Count Scaling");
  lines.push("");
  if (output.waypointScaling) {
    const ws = output.waypointScaling;
    lines.push(`- **Shared waypoint fraction (5wp vs 7wp):** ${ws.sharedFraction5to7.toFixed(3)}`);
    lines.push(`- **Shared waypoint fraction (7wp vs 9wp):** ${ws.sharedFraction7to9.toFixed(3)}`);
    lines.push(`- **Shared waypoint fraction (5wp vs 9wp):** ${ws.sharedFraction5to9.toFixed(3)}`);
    lines.push(`- **Reference: O10 (5wp vs 10wp):** 0.705`);
  } else {
    lines.push("Waypoint scaling analysis not performed (insufficient data).");
  }
  lines.push("");

  // 7. Predictions
  lines.push("## 7. Predictions Summary");
  lines.push("");
  lines.push("| # | Prediction | Result | Value |");
  lines.push("|---|------------|--------|-------|");
  for (const pred of output.predictions) {
    lines.push(`| ${pred.id} | ${pred.description} | ${pred.result} | ${pred.value} |`);
  }
  lines.push("");

  // 8. Summary
  const confirmed = output.predictions.filter((p) => p.result === "confirmed").length;
  const notConfirmed = output.predictions.filter((p) => p.result === "not confirmed").length;
  const insufficient = output.predictions.filter((p) => p.result === "insufficient data").length;

  lines.push("## 8. Summary");
  lines.push("");
  lines.push(`- **Predictions confirmed:** ${confirmed} of ${output.predictions.length}`);
  lines.push(`- **Predictions not confirmed:** ${notConfirmed}`);
  lines.push(`- **Insufficient data:** ${insufficient}`);
  lines.push("");

  if (anova.nullInteraction && output.gaitRankStability.rankOrderPreserved) {
    lines.push("Core structural findings (gait, asymmetry, bridge bottlenecks) are robust across ");
    lines.push("waypoint count and temperature variations. Model identity drives topological structure, ");
    lines.push("not elicitation parameters.");
  } else {
    lines.push("Some findings show sensitivity to elicitation parameters. See individual results above.");
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

  console.log("Conceptual Topology Mapping Benchmark - Multiverse Robustness Analysis (Phase 11C)");
  console.log("==================================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data from multiple sources ─────────────────────────────

  console.log("Loading data from multiple sources...");

  // Phase 11C condition data: results/robustness/{conditionLabel}/
  const conditionLookups = new Map<string, Map<string, ElicitationResult[]>>();
  let totalNewRuns = 0;

  for (const cond of ROBUSTNESS_CONDITIONS) {
    const condDir = join(inputDir, "robustness", cond.label);
    const results = await loadResultsFromDir(condDir);
    totalNewRuns += results.length;
    const lookup = buildWaypointLookup(results);
    conditionLookups.set(cond.label, lookup);
    console.log(`  Robustness ${cond.label}: ${results.length} results (${lookup.size} keys)`);
  }

  // Baseline data from prior phases (7wp, 0.7 temp)
  const pilotResults = await loadResultsFromDir(join(inputDir, "pilot"));
  const reversalResults = await loadResultsFromDir(join(inputDir, "reversals"));
  const salienceResults = await loadResultsFromDir(join(inputDir, "salience"));
  const baselineResults = [...pilotResults, ...reversalResults, ...salienceResults];
  const baselineLookup = buildWaypointLookup(baselineResults);
  const totalReusedRuns = baselineResults.length;

  console.log(`  Pilot (Phase 1):     ${pilotResults.length} results`);
  console.log(`  Reversals (Phase 2): ${reversalResults.length} results`);
  console.log(`  Salience (Phase 6A): ${salienceResults.length} results`);
  console.log(`  Baseline merged:     ${baselineLookup.size} keys`);
  console.log("");

  // Include baseline in conditionLookups for unified iteration
  // For baseline, we map p11c pair IDs to their original equivalents
  const baselineMapped = new Map<string, ElicitationResult[]>();
  for (const pair of PHASE11C_ALL_PAIRS) {
    const origId = mapPhase11CToOriginalPairId(pair.id);
    if (!origId) continue;
    for (const modelId of PHASE11C_MODEL_IDS) {
      const origKey = `${origId}::${modelId}`;
      const newKey = `${pair.id}::${modelId}`;
      const results = baselineLookup.get(origKey);
      if (results) {
        baselineMapped.set(newKey, results);
      }
    }
  }
  conditionLookups.set(ROBUSTNESS_BASELINE.label, baselineMapped);

  const allConditions: RobustnessCondition[] = [ROBUSTNESS_BASELINE, ...ROBUSTNESS_CONDITIONS];
  const modelIds = [...PHASE11C_MODEL_IDS];

  // ── Step 1: Cell Results ─────────────────────────────────────────

  console.log("Step 1: Computing cell results (condition x pair x model)...");

  const cellResults: RobustnessCellResult[] = [];

  for (const cond of allConditions) {
    const lookup = conditionLookups.get(cond.label)!;
    for (const pair of PHASE11C_ALL_PAIRS) {
      for (const modelId of modelIds) {
        const key = `${pair.id}::${modelId}`;
        const results = lookup.get(key) ?? [];
        const runs = waypointsOnly(results);

        const intraJaccard = computeIntraModelJaccard(runs);

        let bridgeFreq: number | null = null;
        let bridgeCI: [number, number] | null = null;
        if (pair.expectedBridge && runs.length > 0) {
          bridgeFreq = computeBridgeFrequency(runs, pair.expectedBridge);
          bridgeCI = bootstrapBridgeFrequencyCI(runs, pair.expectedBridge);
        }

        cellResults.push({
          conditionLabel: cond.label,
          waypoints: cond.waypoints,
          temperature: cond.temperature,
          pairId: pair.id,
          modelId,
          intraModelJaccard: intraJaccard,
          bridgeFrequency: bridgeFreq,
          bridgeFrequencyCI: bridgeCI,
          runCount: runs.length,
        });
      }
    }
  }
  console.log(`  Total cells: ${cellResults.length}`);
  console.log("");

  // ── Step 2: Gait Robustness (R1) ────────────────────────────────

  console.log("Step 2: Computing gait robustness (R1)...");

  const gaitRobustness: Phase11RobustnessOutput["gaitRobustness"] = [];
  const forwardPairIds = new Set(PHASE11C_FORWARD_PAIRS.map((p) => p.id));

  for (const modelId of modelIds) {
    for (const cond of allConditions) {
      const cells = cellResults.filter(
        (c) => c.modelId === modelId && c.conditionLabel === cond.label && forwardPairIds.has(c.pairId),
      );
      const jaccards = cells.filter((c) => c.runCount >= 2).map((c) => c.intraModelJaccard);
      const meanJaccard = jaccards.length > 0 ? mean(jaccards) : 0;
      const jaccardCI =
        jaccards.length >= 2
          ? bootstrapCI(jaccards)
          : ([meanJaccard, meanJaccard] as [number, number]);

      gaitRobustness.push({
        modelId,
        conditionLabel: cond.label,
        meanIntraModelJaccard: meanJaccard,
        jaccardCI,
      });

      console.log(`  ${modelId} / ${cond.label}: ${meanJaccard.toFixed(3)} [${jaccardCI[0].toFixed(3)}, ${jaccardCI[1].toFixed(3)}]`);
    }
  }
  console.log("");

  // ── Step 3: Gait Rank-Order Stability ───────────────────────────

  console.log("Step 3: Computing rank-order stability (Kendall's W)...");

  // For each condition, rank models by mean intra-model Jaccard
  const rankings: number[][] = [];
  const modelRankOrder: Phase11RobustnessOutput["gaitRankStability"]["modelRankOrder"] = [];

  for (const cond of allConditions) {
    const condGaits = gaitRobustness.filter((g) => g.conditionLabel === cond.label);
    const values = modelIds.map(
      (mId) => condGaits.find((g) => g.modelId === mId)?.meanIntraModelJaccard ?? 0,
    );
    const ranks = rankDescending(values);
    rankings.push(ranks);

    // Build sorted model list for display
    const indexed = modelIds.map((mId, i) => ({ mId, jaccard: values[i] }));
    indexed.sort((a, b) => b.jaccard - a.jaccard);
    modelRankOrder.push({
      conditionLabel: cond.label,
      rankedModels: indexed.map((x) => x.mId),
    });
  }

  const W = kendallW(rankings);

  // Check if rank ordering is exactly preserved across all conditions
  const firstOrder = modelRankOrder[0].rankedModels.join(",");
  const rankOrderPreserved = modelRankOrder.every(
    (ro) => ro.rankedModels.join(",") === firstOrder,
  );

  console.log(`  Kendall's W: ${W.toFixed(3)}`);
  console.log(`  Rank order preserved: ${rankOrderPreserved}`);
  for (const ro of modelRankOrder) {
    console.log(`    ${ro.conditionLabel}: ${ro.rankedModels.join(" > ")}`);
  }
  console.log("");

  // ── Step 4: Asymmetry Robustness (R2) ───────────────────────────

  console.log("Step 4: Computing asymmetry robustness (R2)...");

  const asymmetryRobustness: Phase11RobustnessOutput["asymmetryRobustness"] = [];
  const meanAsymmetryPerCondition: Phase11RobustnessOutput["meanAsymmetryPerCondition"] = [];

  for (const cond of allConditions) {
    const lookup = conditionLookups.get(cond.label)!;
    const condAsymmetries: number[] = [];

    for (const modelId of modelIds) {
      for (const ap of PHASE11C_ASYMMETRY_PAIRS) {
        const fwdKey = `${ap.forward}::${modelId}`;
        const revKey = `${ap.reverse}::${modelId}`;
        const fwdRuns = waypointsOnly(lookup.get(fwdKey) ?? []);
        const revRuns = waypointsOnly(lookup.get(revKey) ?? []);

        const crossJaccard = computeCrossGroupJaccard(fwdRuns, revRuns);
        const asymmetryIndex = 1 - crossJaccard;

        // Bootstrap CI for asymmetry
        const crossJaccards: number[] = [];
        for (const fwd of fwdRuns) {
          for (const rev of revRuns) {
            crossJaccards.push(computeJaccard(fwd, rev).similarity);
          }
        }
        const asymmetryCI =
          crossJaccards.length >= 2
            ? (bootstrapCI(crossJaccards.map((j) => 1 - j)) as [number, number])
            : ([asymmetryIndex, asymmetryIndex] as [number, number]);

        asymmetryRobustness.push({
          modelId,
          conditionLabel: cond.label,
          pairLabel: ap.pairLabel,
          asymmetryIndex,
          asymmetryCI,
        });

        if (fwdRuns.length > 0 && revRuns.length > 0) {
          condAsymmetries.push(asymmetryIndex);
        }

        console.log(`  ${modelId} / ${cond.label} / ${ap.pairLabel}: ${asymmetryIndex.toFixed(3)}`);
      }
    }

    const meanAsym = condAsymmetries.length > 0 ? mean(condAsymmetries) : 0;
    const asymCI =
      condAsymmetries.length >= 2
        ? (bootstrapCI(condAsymmetries) as [number, number])
        : ([meanAsym, meanAsym] as [number, number]);

    meanAsymmetryPerCondition.push({
      conditionLabel: cond.label,
      meanAsymmetry: meanAsym,
      asymmetryCI: asymCI,
      aboveThreshold: meanAsym > 0.6,
    });

    console.log(`  ${cond.label} mean asymmetry: ${meanAsym.toFixed(3)} ${meanAsym > 0.6 ? "> 0.60" : "<= 0.60"}`);
  }
  console.log("");

  // ── Step 5: Bridge Frequency Robustness ─────────────────────────

  console.log("Step 5: Computing bridge frequency robustness...");

  const bridgeFrequencyRobustness: Phase11RobustnessOutput["bridgeFrequencyRobustness"] = [];
  const meanBridgeFreqPerCondition: Phase11RobustnessOutput["meanBridgeFreqPerCondition"] = [];

  const bridgePairs = PHASE11C_FORWARD_PAIRS.filter((p) => p.expectedBridge !== null);

  for (const cond of allConditions) {
    const lookup = conditionLookups.get(cond.label)!;
    const condBridgeFreqs: number[] = [];

    for (const pair of bridgePairs) {
      for (const modelId of modelIds) {
        const key = `${pair.id}::${modelId}`;
        const runs = waypointsOnly(lookup.get(key) ?? []);

        let bridgeFreq = 0;
        let bridgeCI: [number, number] = [0, 0];
        if (pair.expectedBridge && runs.length > 0) {
          bridgeFreq = computeBridgeFrequency(runs, pair.expectedBridge);
          bridgeCI = bootstrapBridgeFrequencyCI(runs, pair.expectedBridge);
          condBridgeFreqs.push(bridgeFreq);
        }

        bridgeFrequencyRobustness.push({
          pairId: pair.id,
          bridgeConcept: pair.expectedBridge!,
          modelId,
          conditionLabel: cond.label,
          bridgeFrequency: bridgeFreq,
          bridgeFrequencyCI: bridgeCI,
        });

        console.log(`  ${pair.id} / ${modelId} / ${cond.label}: ${bridgeFreq.toFixed(3)}`);
      }
    }

    const meanFreq = condBridgeFreqs.length > 0 ? mean(condBridgeFreqs) : 0;
    const freqCI =
      condBridgeFreqs.length >= 2
        ? (bootstrapCI(condBridgeFreqs) as [number, number])
        : ([meanFreq, meanFreq] as [number, number]);

    // Check per-pair thresholds: spectrum > 0.50, warm > 0.30
    const spectrumFreqs = bridgeFrequencyRobustness
      .filter((b) => b.conditionLabel === cond.label && b.bridgeConcept === "spectrum")
      .map((b) => b.bridgeFrequency);
    const warmFreqs = bridgeFrequencyRobustness
      .filter((b) => b.conditionLabel === cond.label && b.bridgeConcept === "warm")
      .map((b) => b.bridgeFrequency);
    const spectrumMean = spectrumFreqs.length > 0 ? mean(spectrumFreqs) : 0;
    const warmMean = warmFreqs.length > 0 ? mean(warmFreqs) : 0;
    const aboveThreshold = spectrumMean > 0.5 && warmMean > 0.3;

    meanBridgeFreqPerCondition.push({
      conditionLabel: cond.label,
      meanBridgeFreq: meanFreq,
      bridgeFreqCI: freqCI,
      aboveThreshold,
    });

    console.log(`  ${cond.label} mean bridge freq: ${meanFreq.toFixed(3)}, spectrum=${spectrumMean.toFixed(3)}, warm=${warmMean.toFixed(3)}`);
  }
  console.log("");

  // ── Step 6: ANOVA-like Interaction Test ─────────────────────────

  console.log("Step 6: Computing ANOVA interaction test (waypoints x temperature)...");

  // Collect intra-model Jaccard values for the 2x2 design (excluding baseline)
  // DV: intra-model Jaccard; factors: waypoints (5/9), temperature (0.5/0.9), model
  type AnovaRow = { jaccard: number; wp: number; temp: number; model: string };
  const anovaData: AnovaRow[] = [];

  for (const cond of ROBUSTNESS_CONDITIONS) {
    for (const modelId of modelIds) {
      const cells = cellResults.filter(
        (c) =>
          c.modelId === modelId &&
          c.conditionLabel === cond.label &&
          forwardPairIds.has(c.pairId) &&
          c.runCount >= 2,
      );
      for (const cell of cells) {
        anovaData.push({
          jaccard: cell.intraModelJaccard,
          wp: cond.waypoints,
          temp: cond.temperature,
          model: modelId,
        });
      }
    }
  }

  const grandMean = anovaData.length > 0 ? mean(anovaData.map((r) => r.jaccard)) : 0;

  // Total SS
  let ssTot = 0;
  for (const r of anovaData) {
    ssTot += (r.jaccard - grandMean) ** 2;
  }

  // Waypoint main effect: group by waypoint count
  const wpLevels = [...new Set(anovaData.map((r) => r.wp))];
  let ssWp = 0;
  for (const wp of wpLevels) {
    const group = anovaData.filter((r) => r.wp === wp);
    const groupMean = mean(group.map((r) => r.jaccard));
    ssWp += group.length * (groupMean - grandMean) ** 2;
  }

  // Temperature main effect: group by temperature
  const tempLevels = [...new Set(anovaData.map((r) => r.temp))];
  let ssTemp = 0;
  for (const temp of tempLevels) {
    const group = anovaData.filter((r) => r.temp === temp);
    const groupMean = mean(group.map((r) => r.jaccard));
    ssTemp += group.length * (groupMean - grandMean) ** 2;
  }

  // Model main effect: group by model
  const modelLevels = [...new Set(anovaData.map((r) => r.model))];
  let ssModel = 0;
  for (const m of modelLevels) {
    const group = anovaData.filter((r) => r.model === m);
    const groupMean = mean(group.map((r) => r.jaccard));
    ssModel += group.length * (groupMean - grandMean) ** 2;
  }

  // Interaction: group by wp x temp cell
  let ssInteraction = 0;
  for (const wp of wpLevels) {
    for (const temp of tempLevels) {
      const group = anovaData.filter((r) => r.wp === wp && r.temp === temp);
      if (group.length === 0) continue;
      const cellMean = mean(group.map((r) => r.jaccard));
      // Expected cell mean from main effects = grandMean + (wpEffect) + (tempEffect)
      const wpGroup = anovaData.filter((r) => r.wp === wp);
      const tempGroup = anovaData.filter((r) => r.temp === temp);
      const wpMean = mean(wpGroup.map((r) => r.jaccard));
      const tempMean = mean(tempGroup.map((r) => r.jaccard));
      const expectedCellMean = grandMean + (wpMean - grandMean) + (tempMean - grandMean);
      ssInteraction += group.length * (cellMean - expectedCellMean) ** 2;
    }
  }

  // Residual SS
  const ssResidual = Math.max(0, ssTot - ssWp - ssTemp - ssModel - ssInteraction);

  // Degrees of freedom
  const n = anovaData.length;
  const dfWp = Math.max(1, wpLevels.length - 1);
  const dfTemp = Math.max(1, tempLevels.length - 1);
  const dfModel = Math.max(1, modelLevels.length - 1);
  const dfInteraction = dfWp * dfTemp;
  const dfResidual = Math.max(1, n - dfWp - dfTemp - dfModel - dfInteraction - 1);

  // Mean squares and F ratios
  const msWp = ssWp / dfWp;
  const msTemp = ssTemp / dfTemp;
  const msModel = ssModel / dfModel;
  const msInteraction = ssInteraction / dfInteraction;
  const msResidual = ssResidual / dfResidual;

  const fWp = msResidual > 0 ? msWp / msResidual : 0;
  const fTemp = msResidual > 0 ? msTemp / msResidual : 0;
  const fModel = msResidual > 0 ? msModel / msResidual : 0;
  const fInteraction = msResidual > 0 ? msInteraction / msResidual : 0;

  const pWp = fTestPValue(fWp, dfWp, dfResidual);
  const pTemp = fTestPValue(fTemp, dfTemp, dfResidual);
  const pModel = fTestPValue(fModel, dfModel, dfResidual);
  const pInteraction = fTestPValue(fInteraction, dfInteraction, dfResidual);

  // SS proportions (eta-squared)
  const safeSsTot = ssTot > 0 ? ssTot : 1;

  const anovaInteraction: Phase11RobustnessOutput["anovaInteraction"] = {
    waypointMainEffect: ssWp / safeSsTot,
    waypointMainEffectP: pWp,
    temperatureMainEffect: ssTemp / safeSsTot,
    temperatureMainEffectP: pTemp,
    interactionEffect: ssInteraction / safeSsTot,
    interactionEffectP: pInteraction,
    modelMainEffect: ssModel / safeSsTot,
    modelMainEffectP: pModel,
    nullInteraction: pInteraction > 0.05,
  };

  console.log(`  SS Total: ${ssTot.toFixed(4)}`);
  console.log(`  Waypoint:    eta^2=${(ssWp / safeSsTot).toFixed(4)}, F=${fWp.toFixed(2)}, p=${pWp.toFixed(4)}`);
  console.log(`  Temperature: eta^2=${(ssTemp / safeSsTot).toFixed(4)}, F=${fTemp.toFixed(2)}, p=${pTemp.toFixed(4)}`);
  console.log(`  Model:       eta^2=${(ssModel / safeSsTot).toFixed(4)}, F=${fModel.toFixed(2)}, p=${pModel.toFixed(4)}`);
  console.log(`  Interaction: eta^2=${(ssInteraction / safeSsTot).toFixed(4)}, F=${fInteraction.toFixed(2)}, p=${pInteraction.toFixed(4)}`);
  console.log(`  Null interaction: ${pInteraction > 0.05}`);
  console.log("");

  // ── Step 7: Waypoint Count Scaling ──────────────────────────────

  console.log("Step 7: Computing waypoint count scaling...");

  let waypointScaling: Phase11RobustnessOutput["waypointScaling"] = null;

  // Compare characteristic waypoints between waypoint count conditions
  // Use temperature 0.5 for cleaner comparison (lower noise)
  const wp5Lookup = conditionLookups.get("5wp-t0.5");
  const wp7Lookup = conditionLookups.get(ROBUSTNESS_BASELINE.label);
  const wp9Lookup = conditionLookups.get("9wp-t0.5");

  if (wp5Lookup && wp7Lookup && wp9Lookup) {
    const sharedFractions5to7: number[] = [];
    const sharedFractions7to9: number[] = [];
    const sharedFractions5to9: number[] = [];

    for (const pair of bridgePairs) {
      for (const modelId of modelIds) {
        const key = `${pair.id}::${modelId}`;
        const runs5 = waypointsOnly(wp5Lookup.get(key) ?? []);
        const runs7 = waypointsOnly(wp7Lookup.get(key) ?? []);
        const runs9 = waypointsOnly(wp9Lookup.get(key) ?? []);

        if (runs5.length > 0 && runs7.length > 0) {
          const freqs5 = computeWaypointFrequencies(runs5);
          const freqs7 = computeWaypointFrequencies(runs7);
          const set5 = new Set(freqs5.filter((f) => f.frequency > 0.3).map((f) => f.waypoint));
          const set7 = new Set(freqs7.filter((f) => f.frequency > 0.3).map((f) => f.waypoint));
          const union = new Set([...set5, ...set7]);
          const inter = new Set([...set5].filter((w) => set7.has(w)));
          if (union.size > 0) {
            sharedFractions5to7.push(inter.size / union.size);
          }
        }

        if (runs7.length > 0 && runs9.length > 0) {
          const freqs7 = computeWaypointFrequencies(runs7);
          const freqs9 = computeWaypointFrequencies(runs9);
          const set7 = new Set(freqs7.filter((f) => f.frequency > 0.3).map((f) => f.waypoint));
          const set9 = new Set(freqs9.filter((f) => f.frequency > 0.3).map((f) => f.waypoint));
          const union = new Set([...set7, ...set9]);
          const inter = new Set([...set7].filter((w) => set9.has(w)));
          if (union.size > 0) {
            sharedFractions7to9.push(inter.size / union.size);
          }
        }

        if (runs5.length > 0 && runs9.length > 0) {
          const freqs5 = computeWaypointFrequencies(runs5);
          const freqs9 = computeWaypointFrequencies(runs9);
          const set5 = new Set(freqs5.filter((f) => f.frequency > 0.3).map((f) => f.waypoint));
          const set9 = new Set(freqs9.filter((f) => f.frequency > 0.3).map((f) => f.waypoint));
          const union = new Set([...set5, ...set9]);
          const inter = new Set([...set5].filter((w) => set9.has(w)));
          if (union.size > 0) {
            sharedFractions5to9.push(inter.size / union.size);
          }
        }
      }
    }

    if (sharedFractions5to7.length > 0 || sharedFractions7to9.length > 0) {
      waypointScaling = {
        sharedFraction5to7: sharedFractions5to7.length > 0 ? mean(sharedFractions5to7) : 0,
        sharedFraction7to9: sharedFractions7to9.length > 0 ? mean(sharedFractions7to9) : 0,
        sharedFraction5to9: sharedFractions5to9.length > 0 ? mean(sharedFractions5to9) : 0,
      };
      console.log(`  5wp vs 7wp shared: ${waypointScaling.sharedFraction5to7.toFixed(3)}`);
      console.log(`  7wp vs 9wp shared: ${waypointScaling.sharedFraction7to9.toFixed(3)}`);
      console.log(`  5wp vs 9wp shared: ${waypointScaling.sharedFraction5to9.toFixed(3)}`);
    } else {
      console.log("  Insufficient data for waypoint scaling analysis.");
    }
  } else {
    console.log("  Missing condition data for waypoint scaling analysis.");
  }
  console.log("");

  // ── Step 8: Predictions Evaluation ──────────────────────────────

  console.log("Step 8: Evaluating predictions...");

  const predictions: Phase11RobustnessOutput["predictions"] = [];

  // P1: R1 survives — Kendall's W > 0.70
  const p1Pass = W > 0.7;
  predictions.push({
    id: 1,
    description: "R1 gait rank-order survives (Kendall's W > 0.70)",
    result: gaitRobustness.length > 0 ? (p1Pass ? "confirmed" : "not confirmed") : "insufficient data",
    value: `W = ${W.toFixed(3)}`,
  });

  // P2: R2 survives — mean asymmetry > 0.60 all conditions
  const allAsymAbove = meanAsymmetryPerCondition.every((ma) => ma.aboveThreshold);
  const anyAsymData = meanAsymmetryPerCondition.some((ma) => ma.meanAsymmetry > 0);
  predictions.push({
    id: 2,
    description: "R2 asymmetry survives (mean > 0.60 all conditions)",
    result: anyAsymData ? (allAsymAbove ? "confirmed" : "not confirmed") : "insufficient data",
    value: meanAsymmetryPerCondition.map((ma) => `${ma.conditionLabel}=${ma.meanAsymmetry.toFixed(3)}`).join(", "),
  });

  // P3: Bridge bottleneck survives — spectrum > 0.50, warm > 0.30 all conditions
  const allBridgeAbove = meanBridgeFreqPerCondition.every((mb) => mb.aboveThreshold);
  const anyBridgeData = meanBridgeFreqPerCondition.some((mb) => mb.meanBridgeFreq > 0);
  predictions.push({
    id: 3,
    description: "Bridge bottleneck survives (spectrum > 0.50, warm > 0.30 all conditions)",
    result: anyBridgeData ? (allBridgeAbove ? "confirmed" : "not confirmed") : "insufficient data",
    value: meanBridgeFreqPerCondition.map((mb) => `${mb.conditionLabel}=${mb.meanBridgeFreq.toFixed(3)}`).join(", "),
  });

  // P4: Temperature 0.5 increases Jaccard by 0.05-0.15 (relative to baseline 0.7)
  const baselineGaits = gaitRobustness.filter((g) => g.conditionLabel === ROBUSTNESS_BASELINE.label);
  const t05Gaits = gaitRobustness.filter((g) => g.conditionLabel === "5wp-t0.5" || g.conditionLabel === "9wp-t0.5");
  const baselineMeanJ = baselineGaits.length > 0 ? mean(baselineGaits.map((g) => g.meanIntraModelJaccard)) : 0;
  const t05MeanJ = t05Gaits.length > 0 ? mean(t05Gaits.map((g) => g.meanIntraModelJaccard)) : 0;
  const t05Diff = t05MeanJ - baselineMeanJ;
  const p4Pass = t05Diff >= 0.05 && t05Diff <= 0.15;
  predictions.push({
    id: 4,
    description: "Temperature 0.5 increases Jaccard by 0.05-0.15 vs baseline",
    result: baselineGaits.length > 0 && t05Gaits.length > 0 ? (p4Pass ? "confirmed" : "not confirmed") : "insufficient data",
    value: `delta = ${t05Diff.toFixed(3)} (baseline=${baselineMeanJ.toFixed(3)}, t0.5=${t05MeanJ.toFixed(3)})`,
  });

  // P5: Temperature 0.9 decreases Jaccard but all models > 0.10
  const t09Gaits = gaitRobustness.filter((g) => g.conditionLabel === "5wp-t0.9" || g.conditionLabel === "9wp-t0.9");
  const t09MeanJ = t09Gaits.length > 0 ? mean(t09Gaits.map((g) => g.meanIntraModelJaccard)) : 0;
  const t09Diff = t09MeanJ - baselineMeanJ;
  const t09AllAbove010 = t09Gaits.every((g) => g.meanIntraModelJaccard > 0.10);
  const p5Pass = t09Diff < 0 && t09AllAbove010;
  predictions.push({
    id: 5,
    description: "Temperature 0.9 decreases Jaccard but all models > 0.10",
    result: t09Gaits.length > 0 ? (p5Pass ? "confirmed" : "not confirmed") : "insufficient data",
    value: `delta = ${t09Diff.toFixed(3)}, all > 0.10: ${t09AllAbove010}`,
  });

  // P6: 5-waypoint paths show higher bridge frequency than 9-waypoint
  const wp5BridgeFreqs = bridgeFrequencyRobustness.filter(
    (b) => b.conditionLabel === "5wp-t0.5" || b.conditionLabel === "5wp-t0.9",
  );
  const wp9BridgeFreqs = bridgeFrequencyRobustness.filter(
    (b) => b.conditionLabel === "9wp-t0.5" || b.conditionLabel === "9wp-t0.9",
  );
  const wp5MeanBridge = wp5BridgeFreqs.length > 0 ? mean(wp5BridgeFreqs.map((b) => b.bridgeFrequency)) : 0;
  const wp9MeanBridge = wp9BridgeFreqs.length > 0 ? mean(wp9BridgeFreqs.map((b) => b.bridgeFrequency)) : 0;
  const p6Pass = wp5MeanBridge > wp9MeanBridge;
  predictions.push({
    id: 6,
    description: "5-waypoint paths show higher bridge frequency than 9-waypoint",
    result: wp5BridgeFreqs.length > 0 && wp9BridgeFreqs.length > 0 ? (p6Pass ? "confirmed" : "not confirmed") : "insufficient data",
    value: `5wp=${wp5MeanBridge.toFixed(3)}, 9wp=${wp9MeanBridge.toFixed(3)}`,
  });

  // P7: Control pair remains unstructured across all conditions
  const controlCells = cellResults.filter((c) => c.pairId === "p11c-stapler-monsoon");
  let controlUnstructured = true;
  for (const cond of allConditions) {
    const condControlCells = controlCells.filter((c) => c.conditionLabel === cond.label);
    for (const cc of condControlCells) {
      // Get the runs to check waypoint frequencies
      const lookup = conditionLookups.get(cond.label)!;
      const runs = waypointsOnly(lookup.get(`p11c-stapler-monsoon::${cc.modelId}`) ?? []);
      if (runs.length > 0) {
        const freqs = computeWaypointFrequencies(runs);
        const topFreq = freqs.length > 0 ? freqs[0].frequency : 0;
        if (topFreq > 0.15) {
          controlUnstructured = false;
        }
      }
    }
  }
  predictions.push({
    id: 7,
    description: "Control pair (stapler-monsoon) remains unstructured across all conditions",
    result: controlCells.length > 0 ? (controlUnstructured ? "confirmed" : "not confirmed") : "insufficient data",
    value: `unstructured: ${controlUnstructured}`,
  });

  for (const pred of predictions) {
    console.log(`  P${pred.id}: ${pred.result} -- ${pred.value}`);
  }
  console.log("");

  // ── Build Output ───────────────────────────────────────────────────

  const analysisOutput: Phase11RobustnessOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      conditions: allConditions,
      pairs: PHASE11C_ALL_PAIRS.map((p) => p.id),
      models: [...modelIds],
      totalNewRuns,
      totalReusedRuns,
    },
    cellResults,
    gaitRobustness,
    gaitRankStability: {
      kendallW: W,
      modelRankOrder,
      rankOrderPreserved,
    },
    asymmetryRobustness,
    meanAsymmetryPerCondition,
    bridgeFrequencyRobustness,
    meanBridgeFreqPerCondition,
    anovaInteraction,
    waypointScaling,
    predictions,
  };

  // ── Write Outputs ──────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "11c-robustness.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Multiverse robustness analysis (Phase 11C) complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("11c-robustness-analysis")
    .description("Analyze Phase 11C multiverse robustness data")
    .option("--input <dir>", "input directory", "results")
    .option("--output <dir>", "output directory", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/11c-robustness.md");

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
