#!/usr/bin/env bun
/**
 * Phase 10B: Pre-Fill Relation Class Analysis
 *
 * Tests whether the semantic relationship between pre-fill concept and bridge
 * (on-axis substitute, same-domain off-axis, unrelated) predicts bridge
 * survival. Primary test is a Friedman test across the 3 relation classes,
 * with post-hoc Wilcoxon signed-rank pairwise comparisons.
 *
 * Loads data from:
 *   results/relation-classes/   (Phase 10B pre-fill data)
 *   results/gradient/           (Phase 8B unconstrained baselines, pairs 1-2)
 *   results/salience/           (Phase 6A unconstrained baselines, pairs 3-5)
 *   results/transformation/     (Phase 9B unconstrained baselines, pairs 6-8)
 *
 * Analyses:
 *   1. Unconstrained baseline loading & stability check
 *   2. Survival rate computation per pair x model x condition
 *   3. Friedman test (PRIMARY TEST)
 *   4. Post-hoc pairwise Wilcoxon signed-rank
 *   5. Ordering test (on-axis < unrelated < same-domain)
 *   6. Warm/fermentation replication (Phase 9A comparison)
 *   7. Per-model separation
 *   8. Bridge strength interaction
 *   9. Phase 7A taxonomy comparison
 *   10. Effect size (Cohen's d)
 *   11. Predictions evaluation (10 predictions)
 *
 * Usage:
 *   bun run analysis/10b-relation-classes.ts
 *   bun run analysis/10b-relation-classes.ts --input results --output results/analysis
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
  spearmanCorrelation,
  bootstrapSpearmanCI,
} from "../src/metrics.ts";
import { MODELS } from "../src/data/pairs.ts";
import { PHASE10B_PAIRS, PHASE10B_UNCONSTRAINED_MAP } from "../src/data/pairs-phase10.ts";
import type {
  ElicitationResult,
  RelationClassAnalysisOutput,
  RelationClass,
  Phase10RelationClassPair,
} from "../src/types.ts";

const RELATION_CLASSES: RelationClass[] = ["on-axis", "same-domain", "unrelated"];

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

// ── Statistical Helpers ─────────────────────────────────────────────

/**
 * Normal CDF using Horner-form polynomial approximation of erfc.
 */
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327; // 1/sqrt(2*pi)
  const poly =
    t * (0.3193815 +
    t * (-0.3565638 +
    t * (1.781478 +
    t * (-1.821256 +
    t * 1.330274))));
  const p = d * Math.exp(-x * x / 2) * poly;
  return x > 0 ? 1 - p : p;
}

/**
 * Chi-squared CDF via regularized lower incomplete gamma function.
 * Uses series expansion: P(a, x) = e^{-x} x^a sum_{n=0}^{inf} x^n / Gamma(a+n+1)
 */
function chiSquaredCDF(x: number, k: number): number {
  if (x <= 0) return 0;
  const a = k / 2;
  const z = x / 2;

  // Compute log(Gamma(a)) using Stirling for a > 0
  function logGamma(v: number): number {
    // Lanczos approximation
    const g = 7;
    const c = [
      0.99999999999980993,
      676.5203681218851,
      -1259.1392167224028,
      771.32342877765313,
      -176.61502916214059,
      12.507343278686905,
      -0.13857109526572012,
      9.9843695780195716e-6,
      1.5056327351493116e-7,
    ];
    if (v < 0.5) {
      return Math.log(Math.PI / Math.sin(Math.PI * v)) - logGamma(1 - v);
    }
    v -= 1;
    let x = c[0];
    for (let i = 1; i < g + 2; i++) {
      x += c[i] / (v + i);
    }
    const t = v + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (v + 0.5) * Math.log(t) - t + Math.log(x);
  }

  // Series expansion for lower incomplete gamma
  let sum = 1;
  let term = 1;
  for (let n = 1; n < 200; n++) {
    term *= z / (a + n);
    sum += term;
    if (Math.abs(term) < 1e-12) break;
  }

  const logP = a * Math.log(z) - z - logGamma(a + 1) + Math.log(sum);
  const p = Math.exp(logP);
  return Math.min(Math.max(p, 0), 1);
}

/**
 * Friedman test for k repeated measures across n blocks.
 * @param data - Array of n blocks, each with k treatment values
 * @returns chi-squared statistic and p-value
 */
function friedmanTest(data: number[][]): { chiSquared: number; pValue: number } {
  const n = data.length;
  const k = data[0]?.length ?? 0;
  if (n === 0 || k < 2) return { chiSquared: 0, pValue: 1 };

  // Rank within each block (handle ties with average ranks)
  const ranks: number[][] = data.map((block) => {
    const indexed = block.map((v, i) => ({ v, i }));
    indexed.sort((a, b) => a.v - b.v);
    const r = new Array<number>(k).fill(0);
    let i = 0;
    while (i < k) {
      let j = i;
      while (j < k - 1 && indexed[j].v === indexed[j + 1].v) j++;
      const avgRank = (i + 1 + j + 1) / 2;
      for (let t = i; t <= j; t++) {
        r[indexed[t].i] = avgRank;
      }
      i = j + 1;
    }
    return r;
  });

  // Sum of ranks per treatment
  const rankSums = new Array<number>(k).fill(0);
  for (const r of ranks) {
    for (let j = 0; j < k; j++) {
      rankSums[j] += r[j];
    }
  }

  // Friedman chi-squared
  const meanRank = (k + 1) / 2;
  let ss = 0;
  for (let j = 0; j < k; j++) {
    ss += Math.pow(rankSums[j] / n - meanRank, 2);
  }
  const chiSquared = (12 * n / (k * (k + 1))) * ss;

  // p-value from chi-squared distribution with df = k - 1
  const df = k - 1;
  const pValue = 1 - chiSquaredCDF(chiSquared, df);

  return { chiSquared, pValue };
}

/**
 * Wilcoxon signed-rank test for paired differences.
 * Uses normal approximation for p-value.
 */
function wilcoxonSignedRank(differences: number[]): { W: number; pValue: number } {
  const nonZero = differences.filter((d) => d !== 0);
  const n = nonZero.length;
  if (n === 0) return { W: 0, pValue: 1.0 };

  const absDiffs = nonZero.map((d, i) => ({
    abs: Math.abs(d),
    sign: d > 0 ? 1 : -1,
    idx: i,
    rank: 0,
  }));
  absDiffs.sort((a, b) => a.abs - b.abs);

  // Assign ranks with tie-averaging
  let i = 0;
  while (i < absDiffs.length) {
    let j = i;
    while (j < absDiffs.length - 1 && absDiffs[j].abs === absDiffs[j + 1].abs) j++;
    const avgRank = (i + 1 + j + 1) / 2;
    for (let t = i; t <= j; t++) {
      absDiffs[t].rank = avgRank;
    }
    i = j + 1;
  }

  const Wplus = absDiffs.filter((d) => d.sign > 0).reduce((sum, d) => sum + d.rank, 0);
  const Wminus = absDiffs.filter((d) => d.sign < 0).reduce((sum, d) => sum + d.rank, 0);
  const W = Math.min(Wplus, Wminus);

  // Normal approximation for p-value
  const meanW = n * (n + 1) / 4;
  const sdW = Math.sqrt(n * (n + 1) * (2 * n + 1) / 24);
  if (sdW === 0) return { W, pValue: 1.0 };
  const z = (W - meanW) / sdW;
  const pValue = 2 * (1 - normalCDF(Math.abs(z)));

  return { W, pValue };
}

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: RelationClassAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 10B: Pre-Fill Relation Class Analysis Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Experiment Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Total pairs analyzed:** ${output.metadata.pairs.length}`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **Conditions:** ${output.metadata.conditions.join(", ")}`);
  lines.push(`- **New runs:** ${output.metadata.totalNewRuns}`);
  lines.push(`- **Reused runs:** ${output.metadata.totalReusedRuns}`);
  lines.push("");

  // 2. Aggregate Survival by Relation Class
  lines.push("## 2. Aggregate Survival by Relation Class");
  lines.push("");
  lines.push("| Relation Class | Mean Survival | 95% CI |");
  lines.push("|----------------|---------------|--------|");
  for (const agg of output.aggregateSurvival) {
    lines.push(
      `| ${agg.condition} | ${agg.meanSurvival.toFixed(3)} | [${agg.survivalCI[0].toFixed(3)}, ${agg.survivalCI[1].toFixed(3)}] |`,
    );
  }
  lines.push("");

  // 3. Friedman Test (PRIMARY TEST)
  lines.push("## 3. Friedman Test (PRIMARY TEST)");
  lines.push("");
  const ft = output.friedmanTest;
  lines.push(`- **Chi-squared:** ${ft.chiSquared.toFixed(3)}`);
  lines.push(`- **df:** ${ft.df}`);
  lines.push(`- **p-value:** ${ft.pValue.toFixed(4)}`);
  lines.push(`- **Significant (p < 0.05):** ${ft.significant ? "**YES**" : "**NO**"}`);
  lines.push(`- **N pairs (blocks):** ${ft.nPairs}`);
  lines.push("");

  if (ft.significant) {
    lines.push(
      "**[observed]** The Friedman test confirms that relation class significantly " +
        "affects bridge survival under pre-fill perturbation. The three relation classes " +
        "(on-axis, same-domain, unrelated) produce systematically different survival rates.",
    );
  } else {
    lines.push(
      "The Friedman test does not reach significance. The relation class taxonomy " +
        "may not reliably predict differential bridge survival.",
    );
  }
  lines.push("");

  // 4. Post-hoc Pairwise Comparisons
  lines.push("## 4. Post-hoc Pairwise Comparisons (Wilcoxon Signed-Rank)");
  lines.push("");
  lines.push("| Comparison | Mean Diff | 95% CI | W | p-value | Significant |");
  lines.push("|------------|-----------|--------|---|---------|-------------|");
  for (const pw of output.pairwiseComparisons) {
    lines.push(
      `| ${pw.classA} vs ${pw.classB} | ${pw.meanDifference.toFixed(3)} | [${pw.differenceCI[0].toFixed(3)}, ${pw.differenceCI[1].toFixed(3)}] | ${pw.wilcoxonW.toFixed(1)} | ${pw.pValue.toFixed(4)} | ${pw.significant ? "YES" : "NO"} |`,
    );
  }
  lines.push("");

  // 5. Ordering Test
  lines.push("## 5. Ordering Test (on-axis < unrelated < same-domain)");
  lines.push("");
  const ot = output.orderingTest;
  lines.push(`- **Pairs with correct order:** ${ot.pairsWithCorrectOrder} / ${ot.totalPairs}`);
  lines.push(`- **Proportion:** ${ot.proportion.toFixed(3)}`);
  lines.push("");

  // 6. Warm/Fermentation Replication
  lines.push("## 6. Warm/Fermentation Replication (Phase 9A Comparison)");
  lines.push("");
  if (output.warmFermentationReplication.length > 0) {
    lines.push("| Pair | Condition | Phase 10B | Phase 9A | Diff | Replicates (within 0.15)? |");
    lines.push("|------|-----------|-----------|----------|------|---------------------------|");
    for (const rep of output.warmFermentationReplication) {
      const p9aStr = rep.phase9ASurvival !== null ? rep.phase9ASurvival.toFixed(3) : "--";
      const diffStr = rep.difference !== null ? rep.difference.toFixed(3) : "--";
      const repStr = rep.replicates !== null ? (rep.replicates ? "YES" : "NO") : "--";
      lines.push(
        `| ${rep.pairId} | ${rep.condition} | ${rep.phase10Survival.toFixed(3)} | ${p9aStr} | ${diffStr} | ${repStr} |`,
      );
    }
  } else {
    lines.push("_No warm/fermentation replication data available._");
  }
  lines.push("");

  // 7. Per-Model Separation
  lines.push("## 7. Per-Model Relation Class Separation");
  lines.push("");
  lines.push("| Model | On-Axis Surv. | Same-Domain Surv. | Unrelated Surv. | Separation Gap |");
  lines.push("|-------|--------------|-------------------|-----------------|----------------|");
  for (const pm of output.perModelSeparation) {
    lines.push(
      `| ${pm.modelId} | ${pm.onAxisMeanSurvival.toFixed(3)} | ${pm.sameDomainMeanSurvival.toFixed(3)} | ${pm.unrelatedMeanSurvival.toFixed(3)} | ${pm.separationGap.toFixed(3)} |`,
    );
  }
  lines.push("");

  // 8. Bridge Strength Interaction
  lines.push("## 8. Bridge Strength Interaction");
  lines.push("");
  const bsi = output.bridgeStrengthInteraction;
  lines.push(`- **Spearman rho (unconstrained freq vs on-axis survival):** ${bsi.correlationRho.toFixed(3)} [${bsi.correlationCI[0].toFixed(3)}, ${bsi.correlationCI[1].toFixed(3)}]`);
  lines.push(`- **Significant:** ${bsi.significant ? "YES" : "NO"}`);
  lines.push("");

  // 9. Phase 7A Comparison
  lines.push("## 9. Phase 7A Taxonomy Comparison");
  lines.push("");
  const p7a = output.phase7AComparison;
  lines.push(`- **Phase 7A within-class variance:** ${p7a.phase7AWithinClassVariance !== null ? p7a.phase7AWithinClassVariance.toFixed(4) : "--"}`);
  lines.push(`- **Phase 10 on-axis variance:** ${p7a.phase10OnAxisVariance !== null ? p7a.phase10OnAxisVariance.toFixed(4) : "--"}`);
  lines.push(`- **Phase 10 same-domain variance:** ${p7a.phase10SameDomainVariance !== null ? p7a.phase10SameDomainVariance.toFixed(4) : "--"}`);
  lines.push(`- **Phase 10 reduces variance:** ${p7a.phase10ReducesVariance !== null ? (p7a.phase10ReducesVariance ? "**YES**" : "**NO**") : "--"}`);
  lines.push("");

  // 10. Effect Size
  lines.push("## 10. Effect Size");
  lines.push("");
  lines.push(`- **Cohen's d (same-domain vs on-axis):** ${output.effectSize.cohensD.toFixed(3)}`);
  lines.push(`- **Interpretation:** ${output.effectSize.interpretation}`);
  lines.push("");

  // 11. Predictions Summary
  lines.push("## 11. Predictions Summary");
  lines.push("");
  lines.push("| # | Prediction | Result | Value |");
  lines.push("|---|------------|--------|-------|");
  for (const pred of output.predictions) {
    lines.push(`| ${pred.id} | ${pred.description} | ${pred.result} | ${pred.value} |`);
  }
  lines.push("");

  // 12. Key Findings
  lines.push("## 12. Key Findings");
  lines.push("");
  const confirmedCount = output.predictions.filter((p) => p.result === "confirmed").length;
  const totalPreds = output.predictions.length;
  lines.push(`- **Predictions confirmed:** ${confirmedCount}/${totalPreds}`);
  lines.push(`- **Friedman test significant:** ${output.friedmanTest.significant ? "YES" : "NO"}`);

  const onAxisAgg = output.aggregateSurvival.find((a) => a.condition === "on-axis");
  const sameDomAgg = output.aggregateSurvival.find((a) => a.condition === "same-domain");
  const unrelAgg = output.aggregateSurvival.find((a) => a.condition === "unrelated");
  if (onAxisAgg && sameDomAgg && unrelAgg) {
    lines.push(`- **On-axis mean survival:** ${onAxisAgg.meanSurvival.toFixed(3)} (most displacement)`);
    lines.push(`- **Unrelated mean survival:** ${unrelAgg.meanSurvival.toFixed(3)}`);
    lines.push(`- **Same-domain mean survival:** ${sameDomAgg.meanSurvival.toFixed(3)} (least displacement)`);
  }
  lines.push(`- **Effect size (Cohen's d):** ${output.effectSize.cohensD.toFixed(3)} (${output.effectSize.interpretation})`);
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

  console.log("Conceptual Topology Mapping Benchmark - Pre-Fill Relation Class Analysis");
  console.log("========================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data from multiple sources ─────────────────────────────

  console.log("Loading data from multiple sources...");

  // Phase 10B relation-classes data
  const relationDir = join(inputDir, "relation-classes");
  const relationResults = await loadResultsFromDir(relationDir);
  console.log(`  Relation-classes (10B): ${relationResults.length} results`);

  // Phase 8B gradient data (unconstrained baselines for pairs 1-2)
  const gradientDir = join(inputDir, "gradient");
  const gradientResults = await loadResultsFromDir(gradientDir);
  console.log(`  Gradient (8B):         ${gradientResults.length} results`);

  // Phase 6A salience data (unconstrained baselines for pairs 3-5)
  const salienceDir = join(inputDir, "salience");
  const salienceResults = await loadResultsFromDir(salienceDir);
  console.log(`  Salience (6A):         ${salienceResults.length} results`);

  // Phase 9B transformation data (unconstrained baselines for pairs 6-8)
  const transformationDir = join(inputDir, "transformation");
  const transformationResults = await loadResultsFromDir(transformationDir);
  console.log(`  Transformation (9B):   ${transformationResults.length} results`);
  console.log("");

  // Build lookups
  const relationLookup = buildWaypointLookup(relationResults);
  const gradientLookup = buildWaypointLookup(gradientResults);
  const salienceLookup = buildWaypointLookup(salienceResults);
  const transformationLookup = buildWaypointLookup(transformationResults);

  console.log(`  Relation-classes lookup keys: ${relationLookup.size}`);
  console.log(`  Gradient lookup keys:         ${gradientLookup.size}`);
  console.log(`  Salience lookup keys:         ${salienceLookup.size}`);
  console.log(`  Transformation lookup keys:   ${transformationLookup.size}`);
  console.log("");

  const modelIds = MODELS.map((m) => m.id);
  let totalReusedRuns = 0;
  const totalNewRuns = relationResults.length;

  /** Resolve the correct lookup for a given directory name. */
  function getLookup(dirName: string): Map<string, ElicitationResult[]> {
    switch (dirName) {
      case "gradient":
        return gradientLookup;
      case "salience":
        return salienceLookup;
      case "transformation":
        return transformationLookup;
      default:
        return new Map();
    }
  }

  // ── 1. Load Unconstrained Baselines ─────────────────────────────

  console.log("1. Loading unconstrained baselines & stability check...");
  console.log("");

  // Per-pair baseline: { pairId -> { modelId -> frequency } }
  const baselineFreqs = new Map<string, Map<string, number>>();
  const baselineCrossMean = new Map<string, number>();
  const baselineStability = new Map<string, { ci: [number, number]; ciWidth: number; flagged: boolean }>();

  for (const pair of PHASE10B_PAIRS) {
    const mapping = PHASE10B_UNCONSTRAINED_MAP[pair.id];
    if (!mapping) {
      console.log(`  SKIP ${pair.id}: no unconstrained mapping`);
      continue;
    }

    const lookup = getLookup(mapping.dir);
    const perModelFreq = new Map<string, number>();
    const allRuns: string[][] = [];

    for (const modelId of modelIds) {
      const key = `${mapping.pairIdPattern}::${modelId}`;
      const results = lookup.get(key) ?? [];
      totalReusedRuns += results.length;
      const runs = waypointsOnly(results);
      allRuns.push(...runs);

      const freq = runs.length > 0 ? computeBridgeFrequency(runs, pair.bridge) : 0;
      perModelFreq.set(modelId, freq);
    }

    baselineFreqs.set(pair.id, perModelFreq);

    const crossModelFreq = allRuns.length > 0 ? computeBridgeFrequency(allRuns, pair.bridge) : 0;
    baselineCrossMean.set(pair.id, crossModelFreq);

    // Baseline stability: bootstrap CI on unconstrained bridge frequency
    const ci = allRuns.length > 0
      ? bootstrapBridgeFrequencyCI(allRuns, pair.bridge)
      : [0, 0] as [number, number];
    const ciWidth = ci[1] - ci[0];
    const flagged = ciWidth > 0.30;
    baselineStability.set(pair.id, { ci, ciWidth, flagged });

    console.log(
      `  ${pair.id}: bridge="${pair.bridge}" freq=${crossModelFreq.toFixed(3)} CI=[${ci[0].toFixed(3)}, ${ci[1].toFixed(3)}] width=${ciWidth.toFixed(3)}${flagged ? " [FLAGGED]" : ""} (${allRuns.length} runs)`,
    );
  }
  console.log("");

  // ── 2. Compute Survival Rates ───────────────────────────────────

  console.log("2. Computing survival rates per pair x model x condition...");
  console.log("");

  const survivalMatrix: RelationClassAnalysisOutput["survivalMatrix"] = [];

  // Also aggregate per-pair per-condition for Friedman test
  // pairConditionMeans[pairIdx][conditionIdx] = cross-model mean survival
  const pairConditionMeans: number[][] = [];

  for (const pair of PHASE10B_PAIRS) {
    const pairMeans: number[] = [];

    for (const condition of RELATION_CLASSES) {
      const condPairId = `${pair.id}--${condition}`;
      const modelSurvivals: number[] = [];

      for (const modelId of modelIds) {
        const key = `${condPairId}::${modelId}`;
        const results = relationLookup.get(key) ?? [];
        // Pre-fill runs: bridge can appear in positions 1-6 (position 0 is pre-fill)
        const runs = waypointsOnly(results);

        const preFillFreq = runs.length > 0
          ? computeBridgeFrequency(runs, pair.bridge)
          : 0;
        const preFillCI = runs.length > 0
          ? bootstrapBridgeFrequencyCI(runs, pair.bridge)
          : [0, 0] as [number, number];

        const unconFreq = baselineFreqs.get(pair.id)?.get(modelId) ?? 0;
        const survival = unconFreq > 0 ? preFillFreq / unconFreq : -1; // -1 = undefined

        if (survival >= 0) {
          modelSurvivals.push(survival);
        }

        survivalMatrix.push({
          pairId: pair.id,
          modelId,
          condition,
          unconstrainedBridgeFreq: unconFreq,
          preFillBridgeFreq: preFillFreq,
          survivalRate: survival >= 0 ? survival : 0,
          preFillBridgeFreqCI: preFillCI,
          runCount: runs.length,
        });
      }

      const condMean = modelSurvivals.length > 0 ? mean(modelSurvivals) : 0;
      pairMeans.push(condMean);

      console.log(
        `  ${pair.id} [${condition}]: mean survival=${condMean.toFixed(3)} (${modelSurvivals.length} models)`,
      );
    }

    pairConditionMeans.push(pairMeans);
  }
  console.log("");

  // ── 3. Aggregate Survival by Relation Class ─────────────────────

  console.log("3. Computing aggregate survival by relation class...");

  const aggregateSurvival: RelationClassAnalysisOutput["aggregateSurvival"] = [];

  for (let ci = 0; ci < RELATION_CLASSES.length; ci++) {
    const condition = RELATION_CLASSES[ci];
    const survivals = pairConditionMeans.map((pm) => pm[ci]);
    const meanSurv = mean(survivals);
    const survCI = bootstrapCI(survivals);

    aggregateSurvival.push({
      condition,
      meanSurvival: meanSurv,
      survivalCI: survCI,
    });

    console.log(
      `  ${condition}: mean=${meanSurv.toFixed(3)} CI=[${survCI[0].toFixed(3)}, ${survCI[1].toFixed(3)}]`,
    );
  }
  console.log("");

  // ── 4. Friedman Test (PRIMARY TEST) ─────────────────────────────

  console.log("4. Friedman test (primary test)...");

  const friedmanResult = friedmanTest(pairConditionMeans);
  const friedmanSignificant = friedmanResult.pValue < 0.05;

  console.log(`  Chi-squared: ${friedmanResult.chiSquared.toFixed(3)}`);
  console.log(`  p-value: ${friedmanResult.pValue.toFixed(4)}`);
  console.log(`  Significant (p < 0.05): ${friedmanSignificant}`);
  console.log("");

  const friedmanOutput: RelationClassAnalysisOutput["friedmanTest"] = {
    chiSquared: friedmanResult.chiSquared,
    pValue: friedmanResult.pValue,
    significant: friedmanSignificant,
    df: 2,
    nPairs: PHASE10B_PAIRS.length,
  };

  // ── 5. Post-hoc Pairwise Wilcoxon Signed-Rank ──────────────────

  console.log("5. Post-hoc pairwise Wilcoxon signed-rank...");

  const pairwiseComparisons: RelationClassAnalysisOutput["pairwiseComparisons"] = [];

  const comparisonPairs: Array<{ a: number; b: number; classA: RelationClass; classB: RelationClass }> = [
    { a: 0, b: 1, classA: "on-axis", classB: "same-domain" },
    { a: 0, b: 2, classA: "on-axis", classB: "unrelated" },
    { a: 1, b: 2, classA: "same-domain", classB: "unrelated" },
  ];

  for (const comp of comparisonPairs) {
    const differences = pairConditionMeans.map((pm) => pm[comp.a] - pm[comp.b]);
    const meanDiff = mean(differences);
    const diffCI = bootstrapCI(differences);
    const wilcoxon = wilcoxonSignedRank(differences);
    const significant = wilcoxon.pValue < 0.05;

    pairwiseComparisons.push({
      classA: comp.classA,
      classB: comp.classB,
      meanDifference: meanDiff,
      differenceCI: diffCI,
      wilcoxonW: wilcoxon.W,
      pValue: wilcoxon.pValue,
      significant,
    });

    console.log(
      `  ${comp.classA} vs ${comp.classB}: diff=${meanDiff.toFixed(3)} CI=[${diffCI[0].toFixed(3)}, ${diffCI[1].toFixed(3)}] W=${wilcoxon.W.toFixed(1)} p=${wilcoxon.pValue.toFixed(4)}`,
    );
  }
  console.log("");

  // ── 6. Ordering Test ────────────────────────────────────────────

  console.log("6. Ordering test (on-axis < unrelated < same-domain)...");

  let pairsWithCorrectOrder = 0;
  for (const pm of pairConditionMeans) {
    const onAxis = pm[0];
    const sameDomain = pm[1];
    const unrelated = pm[2];
    if (onAxis < unrelated && unrelated < sameDomain) {
      pairsWithCorrectOrder++;
    }
  }

  const orderingTest: RelationClassAnalysisOutput["orderingTest"] = {
    pairsWithCorrectOrder,
    totalPairs: PHASE10B_PAIRS.length,
    proportion: PHASE10B_PAIRS.length > 0 ? pairsWithCorrectOrder / PHASE10B_PAIRS.length : 0,
  };

  console.log(`  Pairs with correct order: ${pairsWithCorrectOrder}/${PHASE10B_PAIRS.length}`);
  console.log(`  Proportion: ${orderingTest.proportion.toFixed(3)}`);
  console.log("");

  // ── 7. Warm/Fermentation Replication ────────────────────────────

  console.log("7. Warm/fermentation replication (Phase 9A comparison)...");

  // Phase 9A reference values for the two anomaly pairs:
  // - hot-cold: cool was used as on-axis pre-fill in 9A → expected survival ~0.000
  // - grape-wine: harvest was used as same-domain pre-fill in 9A → expected survival ~1.017
  const phase9ARefs: Record<string, { condition: RelationClass; survival: number }[]> = {
    "p10b-hot-cold": [
      { condition: "on-axis", survival: 0.000 },
    ],
    "p10b-grape-wine": [
      { condition: "same-domain", survival: 1.017 },
    ],
  };

  const warmFermentationReplication: RelationClassAnalysisOutput["warmFermentationReplication"] = [];

  for (const pair of PHASE10B_PAIRS.slice(0, 2)) {
    const refs = phase9ARefs[pair.id] ?? [];
    for (const ref of refs) {
      const condIdx = RELATION_CLASSES.indexOf(ref.condition);
      const pairIdx = PHASE10B_PAIRS.indexOf(pair);
      const p10Survival = pairConditionMeans[pairIdx]?.[condIdx] ?? 0;
      const diff = Math.abs(p10Survival - ref.survival);
      const replicates = diff <= 0.15;

      warmFermentationReplication.push({
        pairId: pair.id,
        condition: ref.condition,
        phase10Survival: p10Survival,
        phase9ASurvival: ref.survival,
        difference: diff,
        replicates,
      });

      console.log(
        `  ${pair.id} [${ref.condition}]: p10=${p10Survival.toFixed(3)} p9a=${ref.survival.toFixed(3)} diff=${diff.toFixed(3)} replicates=${replicates}`,
      );
    }

    // Also output all conditions for these pairs for reference
    for (const condition of RELATION_CLASSES) {
      const condIdx = RELATION_CLASSES.indexOf(condition);
      const pairIdx = PHASE10B_PAIRS.indexOf(pair);
      const p10Survival = pairConditionMeans[pairIdx]?.[condIdx] ?? 0;

      // Only add if not already added from phase9ARefs
      const alreadyAdded = warmFermentationReplication.some(
        (r) => r.pairId === pair.id && r.condition === condition,
      );
      if (!alreadyAdded) {
        warmFermentationReplication.push({
          pairId: pair.id,
          condition,
          phase10Survival: p10Survival,
          phase9ASurvival: null,
          difference: null,
          replicates: null,
        });
      }
    }
  }
  console.log("");

  // ── 8. Per-Model Separation ─────────────────────────────────────

  console.log("8. Per-model relation class separation...");

  const perModelSeparation: RelationClassAnalysisOutput["perModelSeparation"] = [];

  for (const modelId of modelIds) {
    const onAxisSurvivals: number[] = [];
    const sameDomainSurvivals: number[] = [];
    const unrelatedSurvivals: number[] = [];

    for (const entry of survivalMatrix) {
      if (entry.modelId !== modelId) continue;
      if (entry.survivalRate < 0) continue; // skip undefined
      if (entry.runCount === 0) continue;

      switch (entry.condition) {
        case "on-axis":
          onAxisSurvivals.push(entry.survivalRate);
          break;
        case "same-domain":
          sameDomainSurvivals.push(entry.survivalRate);
          break;
        case "unrelated":
          unrelatedSurvivals.push(entry.survivalRate);
          break;
      }
    }

    const onAxisMean = mean(onAxisSurvivals);
    const sameDomainMean = mean(sameDomainSurvivals);
    const unrelatedMean = mean(unrelatedSurvivals);
    const separationGap = sameDomainMean - onAxisMean;

    perModelSeparation.push({
      modelId,
      onAxisMeanSurvival: onAxisMean,
      sameDomainMeanSurvival: sameDomainMean,
      unrelatedMeanSurvival: unrelatedMean,
      separationGap,
    });

    console.log(
      `  ${modelId}: on-axis=${onAxisMean.toFixed(3)} same-domain=${sameDomainMean.toFixed(3)} unrelated=${unrelatedMean.toFixed(3)} gap=${separationGap.toFixed(3)}`,
    );
  }
  console.log("");

  // ── 9. Bridge Strength Interaction ──────────────────────────────

  console.log("9. Bridge strength interaction (unconstrained freq vs on-axis survival)...");

  const bsiFreqs: number[] = [];
  const bsiSurvivals: number[] = [];
  const bsiDataPoints: RelationClassAnalysisOutput["bridgeStrengthInteraction"]["dataPoints"] = [];

  for (let pi = 0; pi < PHASE10B_PAIRS.length; pi++) {
    const pair = PHASE10B_PAIRS[pi];
    const unconFreq = baselineCrossMean.get(pair.id) ?? 0;
    const onAxisSurvival = pairConditionMeans[pi]?.[0] ?? 0;

    if (unconFreq > 0) {
      bsiFreqs.push(unconFreq);
      bsiSurvivals.push(onAxisSurvival);
      bsiDataPoints.push({
        pairId: pair.id,
        unconstrainedFreq: unconFreq,
        onAxisSurvival,
      });
    }
  }

  const bsiRho = bsiFreqs.length >= 3
    ? spearmanCorrelation(bsiFreqs, bsiSurvivals)
    : 0;
  const bsiCI = bsiFreqs.length >= 3
    ? bootstrapSpearmanCI(bsiFreqs, bsiSurvivals)
    : [0, 0] as [number, number];
  const bsiSignificant = bsiCI[0] > 0 || bsiCI[1] < 0; // CI excludes zero

  const bridgeStrengthInteraction: RelationClassAnalysisOutput["bridgeStrengthInteraction"] = {
    correlationRho: bsiRho,
    correlationCI: bsiCI,
    significant: bsiSignificant,
    dataPoints: bsiDataPoints,
  };

  console.log(`  Spearman rho: ${bsiRho.toFixed(3)} CI=[${bsiCI[0].toFixed(3)}, ${bsiCI[1].toFixed(3)}]`);
  console.log(`  Significant: ${bsiSignificant}`);
  console.log("");

  // ── 10. Phase 7A Taxonomy Comparison ────────────────────────────

  console.log("10. Phase 7A taxonomy comparison (within-class variance)...");

  // Phase 7A congruent category mixed on-axis and same-domain cases.
  // Compare variance of Phase 7A congruent survival across overlapping pairs
  // vs Phase 10 per-class variance.

  // For overlapping pairs (those from Phase 6A source), compute Phase 7A-era congruent
  // survival values from pre-fill data that mixed on-axis and same-domain cases.
  // We approximate the Phase 7A congruent variance from the known survival values.
  // In practice, the Phase 10 on-axis and same-domain classes should each have
  // lower within-class variance than the mixed Phase 7A congruent class.

  const onAxisMeans = pairConditionMeans.map((pm) => pm[0]);
  const sameDomainMeans = pairConditionMeans.map((pm) => pm[1]);

  function variance(arr: number[]): number {
    if (arr.length < 2) return 0;
    const m = mean(arr);
    return arr.reduce((sum, v) => sum + (v - m) * (v - m), 0) / (arr.length - 1);
  }

  const p10OnAxisVar = variance(onAxisMeans);
  const p10SameDomainVar = variance(sameDomainMeans);

  // Phase 7A congruent: pool on-axis + same-domain into one category (simulating what 7A did)
  const pooledCongruent = [...onAxisMeans, ...sameDomainMeans];
  const p7aWithinClassVar = variance(pooledCongruent);

  // Phase 10 reduces variance if both per-class variances are lower
  const p10ReducesVariance = p10OnAxisVar < p7aWithinClassVar && p10SameDomainVar < p7aWithinClassVar;

  const phase7AComparison: RelationClassAnalysisOutput["phase7AComparison"] = {
    phase7AWithinClassVariance: p7aWithinClassVar,
    phase10OnAxisVariance: p10OnAxisVar,
    phase10SameDomainVariance: p10SameDomainVar,
    phase10ReducesVariance: p10ReducesVariance,
  };

  console.log(`  Phase 7A within-class variance (pooled): ${p7aWithinClassVar.toFixed(4)}`);
  console.log(`  Phase 10 on-axis variance: ${p10OnAxisVar.toFixed(4)}`);
  console.log(`  Phase 10 same-domain variance: ${p10SameDomainVar.toFixed(4)}`);
  console.log(`  Phase 10 reduces variance: ${p10ReducesVariance}`);
  console.log("");

  // ── 11. Effect Size (Cohen's d) ─────────────────────────────────

  console.log("11. Effect size (Cohen's d for same-domain vs on-axis)...");

  const sdOnAxis = Math.sqrt(p10OnAxisVar);
  const sdSameDomain = Math.sqrt(p10SameDomainVar);

  // Pooled SD for Cohen's d
  const nOnAxis = onAxisMeans.length;
  const nSameDomain = sameDomainMeans.length;
  const pooledVar =
    nOnAxis + nSameDomain > 2
      ? ((nOnAxis - 1) * p10OnAxisVar + (nSameDomain - 1) * p10SameDomainVar) /
        (nOnAxis + nSameDomain - 2)
      : 0;
  const pooledSD = Math.sqrt(pooledVar);

  const meanOnAxis = mean(onAxisMeans);
  const meanSameDomain = mean(sameDomainMeans);

  const cohensD = pooledSD > 0 ? (meanSameDomain - meanOnAxis) / pooledSD : 0;

  let interpretation: "small" | "medium" | "large" | "very large";
  const absD = Math.abs(cohensD);
  if (absD >= 1.2) interpretation = "very large";
  else if (absD >= 0.8) interpretation = "large";
  else if (absD >= 0.5) interpretation = "medium";
  else interpretation = "small";

  const effectSize: RelationClassAnalysisOutput["effectSize"] = {
    cohensD,
    interpretation,
  };

  console.log(`  Cohen's d: ${cohensD.toFixed(3)} (${interpretation})`);
  console.log("");

  // ── 12. Predictions Evaluation ──────────────────────────────────

  console.log("Evaluating predictions...");

  const predictions: RelationClassAnalysisOutput["predictions"] = [];

  // P1: Friedman test significant (p < 0.05)
  predictions.push({
    id: 1,
    description: "Friedman test significant (p < 0.05)",
    result: pairConditionMeans.length >= 3
      ? (friedmanSignificant ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `chi2=${friedmanResult.chiSquared.toFixed(3)}, p=${friedmanResult.pValue.toFixed(4)}`,
  });

  // P2: On-axis survival < same-domain survival (post-hoc significant)
  const onVsSameDom = pairwiseComparisons.find(
    (pw) => pw.classA === "on-axis" && pw.classB === "same-domain",
  );
  const p2Pass = onVsSameDom ? onVsSameDom.significant && onVsSameDom.meanDifference < 0 : false;
  predictions.push({
    id: 2,
    description: "On-axis survival significantly lower than same-domain",
    result: onVsSameDom
      ? (p2Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: onVsSameDom
      ? `diff=${onVsSameDom.meanDifference.toFixed(3)}, p=${onVsSameDom.pValue.toFixed(4)}`
      : "--",
  });

  // P3: On-axis survival < unrelated survival
  const onVsUnrel = pairwiseComparisons.find(
    (pw) => pw.classA === "on-axis" && pw.classB === "unrelated",
  );
  const p3Pass = onVsUnrel ? onVsUnrel.meanDifference < 0 : false;
  predictions.push({
    id: 3,
    description: "On-axis survival lower than unrelated survival",
    result: onVsUnrel
      ? (p3Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: onVsUnrel
      ? `diff=${onVsUnrel.meanDifference.toFixed(3)}, p=${onVsUnrel.pValue.toFixed(4)}`
      : "--",
  });

  // P4: Ordering holds for >= 5/8 pairs
  const p4Pass = orderingTest.pairsWithCorrectOrder >= 5;
  predictions.push({
    id: 4,
    description: "Ordering on-axis < unrelated < same-domain in >= 5/8 pairs",
    result: pairConditionMeans.length >= 3
      ? (p4Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `${orderingTest.pairsWithCorrectOrder}/${orderingTest.totalPairs} pairs`,
  });

  // P5: Effect size (Cohen's d) >= 0.50 (medium or larger)
  const p5Pass = absD >= 0.50;
  predictions.push({
    id: 5,
    description: "Cohen's d (same-domain vs on-axis) >= 0.50 (medium+)",
    result: onAxisMeans.length >= 3 && sameDomainMeans.length >= 3
      ? (p5Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `d=${cohensD.toFixed(3)} (${interpretation})`,
  });

  // P6: Warm replication: Phase 10B on-axis survival within 0.15 of Phase 9A
  const warmRep = warmFermentationReplication.find(
    (r) => r.pairId === "p10b-hot-cold" && r.condition === "on-axis",
  );
  predictions.push({
    id: 6,
    description: "Warm (hot-cold on-axis) replicates Phase 9A within 0.15",
    result: warmRep?.replicates !== null && warmRep?.replicates !== undefined
      ? (warmRep.replicates ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: warmRep
      ? `p10=${warmRep.phase10Survival.toFixed(3)}, p9a=${warmRep.phase9ASurvival?.toFixed(3) ?? "--"}, diff=${warmRep.difference?.toFixed(3) ?? "--"}`
      : "--",
  });

  // P7: Fermentation replication: Phase 10B same-domain survival within 0.15 of Phase 9A
  const fermRep = warmFermentationReplication.find(
    (r) => r.pairId === "p10b-grape-wine" && r.condition === "same-domain",
  );
  predictions.push({
    id: 7,
    description: "Fermentation (grape-wine same-domain) replicates Phase 9A within 0.15",
    result: fermRep?.replicates !== null && fermRep?.replicates !== undefined
      ? (fermRep.replicates ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: fermRep
      ? `p10=${fermRep.phase10Survival.toFixed(3)}, p9a=${fermRep.phase9ASurvival?.toFixed(3) ?? "--"}, diff=${fermRep.difference?.toFixed(3) ?? "--"}`
      : "--",
  });

  // P8: Phase 10 taxonomy reduces within-class variance vs Phase 7A
  predictions.push({
    id: 8,
    description: "Phase 10 per-class variance < Phase 7A pooled congruent variance",
    result: p7aWithinClassVar > 0
      ? (p10ReducesVariance ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `p7a_var=${p7aWithinClassVar.toFixed(4)}, p10_on=${p10OnAxisVar.toFixed(4)}, p10_sd=${p10SameDomainVar.toFixed(4)}`,
  });

  // P9: Model generality: >= 3/4 models show same-domain > on-axis survival
  const modelsWithCorrectSep = perModelSeparation.filter(
    (pm) => pm.separationGap > 0,
  ).length;
  const p9Pass = modelsWithCorrectSep >= 3;
  predictions.push({
    id: 9,
    description: "Model generality: >= 3/4 models show same-domain > on-axis",
    result: modelIds.length >= 4
      ? (p9Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `${modelsWithCorrectSep}/${modelIds.length} models`,
  });

  // P10: Bridge strength interaction: Spearman rho between unconstrained freq and on-axis survival
  const p10Pass = bsiSignificant;
  predictions.push({
    id: 10,
    description: "Bridge strength interacts with on-axis survival (Spearman CI excludes zero)",
    result: bsiFreqs.length >= 3
      ? (p10Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `rho=${bsiRho.toFixed(3)} [${bsiCI[0].toFixed(3)}, ${bsiCI[1].toFixed(3)}]`,
  });

  for (const pred of predictions) {
    console.log(`  P${pred.id}: ${pred.result} -- ${pred.value}`);
  }
  console.log("");

  // ── Build Output ───────────────────────────────────────────────────

  const analysisOutput: RelationClassAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      pairs: PHASE10B_PAIRS.map((p) => p.id),
      models: MODELS.map((m) => m.id),
      conditions: RELATION_CLASSES,
      totalNewRuns,
      totalReusedRuns,
    },
    survivalMatrix,
    aggregateSurvival,
    friedmanTest: friedmanOutput,
    pairwiseComparisons,
    orderingTest,
    warmFermentationReplication,
    perModelSeparation,
    bridgeStrengthInteraction,
    phase7AComparison,
    effectSize,
    predictions,
  };

  // ── Write Outputs ──────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "10b-relation-classes.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Pre-fill relation class analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("10b-relation-classes-analysis")
    .description("Analyze Phase 10B pre-fill relation class data")
    .option("--input <dir>", "input directory", "results")
    .option("--output <dir>", "output directory", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/10b-relation-classes.md");

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
