#!/usr/bin/env bun
/**
 * Phase 9A: Bridge Dominance Ratio Analysis
 *
 * Tests whether dominance ratio (bridge freq / strongest competitor freq)
 * predicts bridge survival under pre-fill perturbation. Two-stage design:
 *
 * Stage 1 (Retrospective): Reuses Phase 6A salience + Phase 7A anchoring +
 *   Phase 8A fragility data for 8 overlapping pairs. Zero new API calls.
 *
 * Stage 2 (Prospective): Loads Phase 8B gradient + Phase 9A dominance data
 *   for 6 new pairs. Computes dominance ratio from salience landscapes and
 *   pre-fill survival from Phase 9A displacement runs.
 *
 * Combined: Merges all evaluable pairs for Spearman correlation (primary test),
 *   threshold analysis, dominance-vs-competitor-count comparison, and
 *   prediction evaluation.
 *
 * Loads data from:
 *   results/salience/     (Phase 6A salience data)
 *   results/anchoring/    (Phase 7A anchoring data)
 *   results/fragility/    (Phase 8A fragility data)
 *   results/gradient/     (Phase 8B gradient/causal data)
 *   results/dominance/    (Phase 9A dominance data)
 *
 * Usage:
 *   bun run analysis/09a-dominance.ts
 *   bun run analysis/09a-dominance.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  mean,
  computeWaypointFrequencies,
  computeDominanceRatio,
  computeCompetitorCount,
  computeBridgeFrequency,
  bootstrapBridgeFrequencyCI,
  spearmanCorrelation,
  bootstrapSpearmanCI,
  linearRegression,
} from "../src/metrics.ts";
import { MODELS } from "../src/data/pairs.ts";
import { PHASE7A_PAIRS } from "../src/data/pairs-phase7.ts";
import { PHASE8A_PAIRS, PHASE8A_RETROSPECTIVE_PAIRS } from "../src/data/pairs-phase8.ts";
import {
  PHASE9A_PAIRS,
  PHASE9A_RETROSPECTIVE_PAIRS,
  PHASE9A_RETRO_8A_PAIRS,
  PHASE9A_TO_8B_MAP,
} from "../src/data/pairs-phase9.ts";
import type {
  DominanceAnalysisOutput,
  DominancePairResult,
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

/**
 * Try multiple key patterns to find results in a lookup map.
 * Returns the first non-empty result set found, or empty array.
 */
function lookupWithPatterns(
  lookup: Map<string, ElicitationResult[]>,
  patterns: string[],
): ElicitationResult[] {
  for (const key of patterns) {
    const results = lookup.get(key);
    if (results && results.length > 0) return results;
  }
  return [];
}

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: DominanceAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 9A: Bridge Dominance Ratio Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Experiment Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Retrospective pairs:** ${output.metadata.retrospectivePairs.length}`);
  lines.push(`- **Prospective pairs:** ${output.metadata.prospectivePairs.length}`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **New runs:** ${output.metadata.totalNewRuns}`);
  lines.push(`- **Reused runs:** ${output.metadata.totalReusedRuns}`);
  lines.push("");

  // 2. Retrospective Dominance Ratio Table
  lines.push("## 2. Retrospective Dominance Ratio Analysis");
  lines.push("");
  lines.push("| Pair | Bridge | Dom. Ratio | Bridge Freq | Strongest Comp. | Comp. Freq | Comp. Count | Pre-Fill Survival | Source |");
  lines.push("|------|--------|-----------|-------------|-----------------|-----------|-------------|-------------------|--------|");

  for (const p of output.retrospective.pairResults) {
    lines.push(
      `| ${p.pairId} | ${p.bridge} | ${p.dominanceRatio.toFixed(2)} | ${p.unconstrainedBridgeFreq.toFixed(3)} | ${p.strongestCompetitor || "none"} | ${p.strongestCompetitorFreq.toFixed(3)} | ${p.competitorCount} | ${p.preFillSurvival.toFixed(3)} | ${p.source} |`,
    );
  }
  lines.push("");

  // 3. Retrospective Correlation
  lines.push("## 3. Retrospective Correlation");
  lines.push("");
  lines.push(`- **Spearman rho (dominance ratio vs survival):** ${output.retrospective.spearmanRho.toFixed(3)} [${output.retrospective.spearmanCI[0].toFixed(3)}, ${output.retrospective.spearmanCI[1].toFixed(3)}]`);
  lines.push(`- **Evaluability gate (rho > 0.40):** ${output.retrospective.evaluabilityGatePasses ? "**PASSES**" : "**FAILS**"}`);
  lines.push("");

  if (output.retrospective.evaluabilityGatePasses) {
    lines.push(
      "The retrospective dominance ratio shows a positive correlation with pre-fill survival, " +
        "meeting the evaluability gate threshold. Proceeding to prospective validation.",
    );
  } else {
    lines.push(
      "The retrospective correlation does not meet the evaluability gate (rho > 0.40). " +
        "Prospective results should be interpreted with caution.",
    );
  }
  lines.push("");

  // 4. Prospective Dominance Ratio Table
  lines.push("## 4. Prospective Dominance Ratio Analysis");
  lines.push("");
  lines.push("| Pair | Bridge | Dom. Ratio | Bridge Freq | Strongest Comp. | Comp. Freq | Comp. Count | Pre-Fill Survival |");
  lines.push("|------|--------|-----------|-------------|-----------------|-----------|-------------|-------------------|");

  for (const p of output.prospective.pairResults) {
    lines.push(
      `| ${p.pairId} | ${p.bridge} | ${p.dominanceRatio.toFixed(2)} | ${p.unconstrainedBridgeFreq.toFixed(3)} | ${p.strongestCompetitor || "none"} | ${p.strongestCompetitorFreq.toFixed(3)} | ${p.competitorCount} | ${p.preFillSurvival.toFixed(3)} |`,
    );
  }
  lines.push("");
  lines.push(`- **Evaluable prospective pairs:** ${output.prospective.evaluablePairCount} of ${output.metadata.prospectivePairs.length}`);
  lines.push("");

  // 5. Combined Correlation (Primary Test)
  lines.push("## 5. Combined Correlation (PRIMARY TEST)");
  lines.push("");
  lines.push(`- **Spearman rho (dominance ratio vs survival):** ${output.combined.spearmanRho.toFixed(3)} [${output.combined.spearmanCI[0].toFixed(3)}, ${output.combined.spearmanCI[1].toFixed(3)}]`);
  lines.push(`- **N pairs:** ${output.combined.nPairs}`);
  lines.push(`- **Significant positive (CI lower > 0):** ${output.combined.significantPositive ? "**YES**" : "**NO**"}`);
  lines.push("");

  if (output.combined.significantPositive) {
    lines.push(
      "**[observed]** Higher dominance ratio (bridge frequency relative to strongest competitor) " +
        "predicts higher bridge survival under pre-fill displacement. Bridges that dominate their " +
        "salience landscape are structurally entrenched and resist perturbation.",
    );
  } else {
    lines.push(
      "The combined Spearman correlation does not reach significance. The relationship " +
        "between dominance ratio and bridge survival may be weaker than predicted.",
    );
  }
  lines.push("");

  // 6. Threshold Analysis
  lines.push("## 6. Threshold Analysis");
  lines.push("");
  lines.push(`- **Best dominance ratio threshold:** ${output.thresholdAnalysis.bestThreshold.toFixed(2)}`);
  lines.push(`- **Classification accuracy:** ${output.thresholdAnalysis.classificationAccuracy.toFixed(3)}`);
  lines.push(`- **High-dominance mean survival:** ${output.thresholdAnalysis.highDominanceSurvivalMean.toFixed(3)}`);
  lines.push(`- **Low-dominance mean survival:** ${output.thresholdAnalysis.lowDominanceSurvivalMean.toFixed(3)}`);
  lines.push("");

  // 7. Dominance Ratio vs Competitor Count
  lines.push("## 7. Dominance Ratio vs Competitor Count Comparison");
  lines.push("");
  lines.push(`- **Dominance ratio rho (with survival):** ${output.dominanceVsCompetitorCount.dominanceRho.toFixed(3)}`);
  lines.push(`- **Competitor count rho (with survival):** ${output.dominanceVsCompetitorCount.competitorCountRho.toFixed(3)}`);
  lines.push(`- **Dominance ratio is better predictor:** ${output.dominanceVsCompetitorCount.dominanceBetter ? "**YES**" : "**NO**"}`);
  lines.push("");

  if (output.dominanceVsCompetitorCount.dominanceBetter) {
    lines.push(
      "Dominance ratio (continuous, ratio-scale) outperforms raw competitor count (discrete, ordinal) " +
        "as a predictor of bridge survival, confirming that relative bridge strength matters more than " +
        "the number of alternatives.",
    );
  } else {
    lines.push(
      "Competitor count performs at least as well as dominance ratio. The simpler metric " +
        "(counting alternatives) may be sufficient.",
    );
  }
  lines.push("");

  // 8. Per-Model Analysis
  lines.push("## 8. Per-Model Dominance Analysis");
  lines.push("");
  lines.push("| Model | Mean Dominance Ratio | Mean Competitor Count |");
  lines.push("|-------|---------------------|----------------------|");

  for (const pm of output.perModelDominance) {
    lines.push(`| ${pm.modelId} | ${pm.meanDominanceRatio.toFixed(2)} | ${pm.meanCompetitorCount.toFixed(1)} |`);
  }
  lines.push("");

  // 9. Predictions Summary
  lines.push("## 9. Predictions Summary");
  lines.push("");
  lines.push("| # | Prediction | Result | Value |");
  lines.push("|---|------------|--------|-------|");

  for (const pred of output.predictions) {
    lines.push(`| ${pred.id} | ${pred.description} | ${pred.result} | ${pred.value} |`);
  }
  lines.push("");

  // 10. Raw Data Tables
  lines.push("## 10. Combined Pair Data");
  lines.push("");
  lines.push("| Pair | Source | Bridge | Dom. Ratio | Comp. Count | Survival |");
  lines.push("|------|--------|--------|-----------|-------------|----------|");

  for (const p of output.combined.allPairResults) {
    lines.push(
      `| ${p.pairId} | ${p.source} | ${p.bridge} | ${p.dominanceRatio.toFixed(2)} | ${p.competitorCount} | ${p.preFillSurvival.toFixed(3)} |`,
    );
  }
  lines.push("");

  // Per-model detail for prospective pairs
  lines.push("## 11. Per-Model Prospective Detail");
  lines.push("");
  lines.push("| Pair | Model | Uncon. Freq | Pre-Fill Freq | Survival | Dom. Ratio |");
  lines.push("|------|-------|-------------|---------------|----------|-----------|");

  for (const p of output.prospective.pairResults) {
    for (const pm of p.perModelFreqs) {
      lines.push(
        `| ${p.pairId} | ${pm.modelId} | ${pm.unconstrainedFreq.toFixed(3)} | ${pm.preFillFreq.toFixed(3)} | ${pm.survival.toFixed(3)} | ${pm.dominanceRatio.toFixed(2)} |`,
      );
    }
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

  console.log("Conceptual Topology Mapping Benchmark - Bridge Dominance Ratio Analysis");
  console.log("=======================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data from multiple sources ─────────────────────────────

  console.log("Loading data from multiple sources...");

  // Phase 6A salience data (for retrospective dominance ratios)
  const salienceDir = join(inputDir, "salience");
  const salienceResults = await loadResultsFromDir(salienceDir);
  console.log(`  Salience (6A):   ${salienceResults.length} results`);

  // Phase 7A anchoring data (for retrospective survival rates)
  const anchoringDir = join(inputDir, "anchoring");
  const anchoringResults = await loadResultsFromDir(anchoringDir);
  console.log(`  Anchoring (7A):  ${anchoringResults.length} results`);

  // Phase 6C positional data (unconstrained baselines for Phase 7A pairs)
  const positionalDir = join(inputDir, "positional");
  const positionalResults = await loadResultsFromDir(positionalDir);
  console.log(`  Positional (6C): ${positionalResults.length} results`);

  // Phase 5C convergence data (for pairs that overlap)
  const convergenceDir = join(inputDir, "convergence");
  const convergenceResults = await loadResultsFromDir(convergenceDir);
  console.log(`  Convergence (5C): ${convergenceResults.length} results`);

  // Phase 8A fragility data (for retrospective 8A pairs)
  const fragilityDir = join(inputDir, "fragility");
  const fragilityResults = await loadResultsFromDir(fragilityDir);
  console.log(`  Fragility (8A):  ${fragilityResults.length} results`);

  // Phase 8B gradient data (for prospective unconstrained frequencies)
  const gradientDir = join(inputDir, "gradient");
  const gradientResults = await loadResultsFromDir(gradientDir);
  console.log(`  Gradient (8B):   ${gradientResults.length} results`);

  // Phase 9A dominance data (supplementary salience + pre-fill displacement)
  const dominanceDir = join(inputDir, "dominance");
  const dominanceResults = await loadResultsFromDir(dominanceDir);
  console.log(`  Dominance (9A):  ${dominanceResults.length} results`);
  console.log("");

  // Build lookups
  const salienceLookup = buildWaypointLookup(salienceResults);
  const anchoringLookup = buildWaypointLookup([
    ...anchoringResults,
    ...positionalResults,
    ...convergenceResults,
  ]);
  const fragilityLookup = buildWaypointLookup(fragilityResults);
  const gradientLookup = buildWaypointLookup(gradientResults);
  const dominanceLookup = buildWaypointLookup(dominanceResults);

  console.log(`  Salience lookup keys:   ${salienceLookup.size}`);
  console.log(`  Anchoring lookup keys:  ${anchoringLookup.size}`);
  console.log(`  Fragility lookup keys:  ${fragilityLookup.size}`);
  console.log(`  Gradient lookup keys:   ${gradientLookup.size}`);
  console.log(`  Dominance lookup keys:  ${dominanceLookup.size}`);
  console.log("");

  const modelIds = MODELS.map((m) => m.id);

  let totalReusedRuns = 0;
  const totalNewRuns = dominanceResults.length;

  // ── Stage 1: Retrospective Analysis ─────────────────────────────

  console.log("Stage 1: Retrospective analysis (8 pairs, 0 new API calls)...");
  console.log("");

  const retroPairResults: DominancePairResult[] = [];

  // -- 6 pairs from Phase 6A/7A overlap --
  for (const retro of PHASE9A_RETROSPECTIVE_PAIRS) {
    console.log(`  Processing ${retro.pairId} (bridge: ${retro.bridge})...`);

    // 1. Get Phase 6A salience data to compute dominance ratio
    const perModelLandscapes: Array<{ rankedWaypoints: Array<{ waypoint: string; frequency: number }> }> = [];

    for (const modelId of modelIds) {
      const salienceKey = `${retro.pairId}::${modelId}`;
      const salienceRuns = salienceLookup.get(salienceKey) ?? [];

      if (salienceRuns.length > 0) {
        totalReusedRuns += salienceRuns.length;
        const runs = waypointsOnly(salienceRuns);
        const freqs = computeWaypointFrequencies(runs);
        perModelLandscapes.push({
          rankedWaypoints: freqs.map((f) => ({ waypoint: f.waypoint, frequency: f.frequency })),
        });
      }
    }

    // Compute dominance ratio using the metrics function
    const domResult = computeDominanceRatio(perModelLandscapes, retro.bridge, 0.10, 2);

    // 2. Get Phase 7A pre-fill survival rates
    const unconstrainedRuns: string[][] = [];
    const preFillRuns: string[][] = [];

    const p7aPair = PHASE7A_PAIRS.find((p) => p.id === retro.phase7AId);
    if (!p7aPair) {
      console.log(`    WARNING: No Phase 7A pair found for ${retro.phase7AId}`);
      continue;
    }

    const perModelFreqs: DominancePairResult["perModelFreqs"] = [];

    for (const modelId of modelIds) {
      // Unconstrained baseline: check Phase 7A, 6C, and 5C data
      const p7aUnconKey = `${retro.phase7AId}--unconstrained::${modelId}`;
      const p6cKey = `${retro.phase7AId.replace("p7a-", "p6c-")}--fwd::${modelId}`;
      const p5cKey = `${retro.phase7AId.replace("p7a-", "p5c-")}--fwd::${modelId}`;

      const p7aUnconResults = anchoringLookup.get(p7aUnconKey) ?? [];
      const p6cResults = anchoringLookup.get(p6cKey) ?? [];
      const p5cResults = anchoringLookup.get(p5cKey) ?? [];

      const mergedUncon = [...p7aUnconResults, ...p6cResults, ...p5cResults];
      const modelUnconRuns = waypointsOnly(mergedUncon);
      unconstrainedRuns.push(...modelUnconRuns);

      if (p6cResults.length > 0 || p5cResults.length > 0) {
        totalReusedRuns += p6cResults.length + p5cResults.length;
      }

      // Pre-fill runs: incongruent, congruent, neutral conditions
      const modelPreFillRuns: string[][] = [];
      for (const cond of ["incongruent", "congruent", "neutral"] as const) {
        const condKey = `${retro.phase7AId}--${cond}::${modelId}`;
        const condResults = anchoringLookup.get(condKey) ?? [];
        const condRuns = waypointsOnly(condResults);
        modelPreFillRuns.push(...condRuns);
        preFillRuns.push(...condRuns);
        totalReusedRuns += condResults.length;
      }

      // Per-model frequencies
      const modelUnconFreq = computeBridgeFrequency(modelUnconRuns, retro.bridge);
      const modelPreFillFreq = computeBridgeFrequency(modelPreFillRuns, retro.bridge);
      const modelSurvival = modelUnconFreq > 0 ? modelPreFillFreq / modelUnconFreq : 0;

      // Per-model dominance ratio from salience data
      const modelSalienceKey = `${retro.pairId}::${modelId}`;
      const modelSalienceRuns = salienceLookup.get(modelSalienceKey) ?? [];
      let modelDomRatio = 0;
      if (modelSalienceRuns.length > 0) {
        const runs = waypointsOnly(modelSalienceRuns);
        const freqs = computeWaypointFrequencies(runs);
        const singleLandscape = [{ rankedWaypoints: freqs.map((f) => ({ waypoint: f.waypoint, frequency: f.frequency })) }];
        const modelDom = computeDominanceRatio(singleLandscape, retro.bridge, 0.10, 1);
        modelDomRatio = modelDom.dominanceRatio;
      }

      perModelFreqs.push({
        modelId,
        unconstrainedFreq: modelUnconFreq,
        preFillFreq: modelPreFillFreq,
        survival: modelSurvival,
        dominanceRatio: modelDomRatio,
      });
    }

    // Compute aggregate survival
    const unconstrainedFreq = computeBridgeFrequency(unconstrainedRuns, retro.bridge);
    const preFillFreq = computeBridgeFrequency(preFillRuns, retro.bridge);
    const preFillSurvival = unconstrainedFreq > 0 ? preFillFreq / unconstrainedFreq : 0;

    const { count: competitorCount, competitors } = computeCompetitorCount(
      perModelLandscapes,
      retro.bridge,
      0.20,
      2,
    );

    retroPairResults.push({
      pairId: retro.phase7AId,
      bridge: retro.bridge,
      unconstrainedBridgeFreq: domResult.bridgeFreq,
      strongestCompetitor: domResult.strongestCompetitor,
      strongestCompetitorFreq: domResult.strongestCompetitorFreq,
      dominanceRatio: domResult.dominanceRatio,
      competitorCount,
      competitors,
      preFillSurvival,
      preFillBridgeFreq: preFillFreq,
      source: "retrospective-6a-7a",
      perModelFreqs,
    });

    console.log(`    Dominance ratio: ${domResult.dominanceRatio.toFixed(2)} (bridge freq: ${domResult.bridgeFreq.toFixed(3)}, strongest: "${domResult.strongestCompetitor}" at ${domResult.strongestCompetitorFreq.toFixed(3)})`);
    console.log(`    Competitors: ${competitorCount} [${competitors.join(", ")}]`);
    console.log(`    Pre-fill survival: ${preFillSurvival.toFixed(3)}`);
  }

  // -- 2 evaluable Phase 8A pairs --
  for (const retro8a of PHASE9A_RETRO_8A_PAIRS) {
    console.log(`  Processing ${retro8a.pairId} (bridge: ${retro8a.bridge})...`);

    const p8aPair = PHASE8A_PAIRS.find((p) => p.id === retro8a.pairId);
    if (!p8aPair) {
      console.log(`    WARNING: No Phase 8A pair found for ${retro8a.pairId}`);
      continue;
    }

    // Get salience data from Phase 8A fragility results
    const perModelLandscapes: Array<{ rankedWaypoints: Array<{ waypoint: string; frequency: number }> }> = [];
    const allSalienceRuns: string[][] = [];
    const allPreFillRuns: string[][] = [];
    const perModelFreqs: DominancePairResult["perModelFreqs"] = [];

    for (const modelId of modelIds) {
      const salienceKey = `${retro8a.pairId}--salience::${modelId}`;
      const salienceRunResults = fragilityLookup.get(salienceKey) ?? [];
      const bareKey = `${retro8a.pairId}::${modelId}`;
      const bareResults = fragilityLookup.get(bareKey) ?? [];
      const salienceAll = salienceRunResults.length > 0 ? salienceRunResults : bareResults;

      const salienceRunsWp = waypointsOnly(salienceAll);
      allSalienceRuns.push(...salienceRunsWp);
      totalReusedRuns += salienceAll.length;

      if (salienceRunsWp.length > 0) {
        const freqs = computeWaypointFrequencies(salienceRunsWp);
        perModelLandscapes.push({
          rankedWaypoints: freqs.map((f) => ({ waypoint: f.waypoint, frequency: f.frequency })),
        });
      }

      // Pre-fill runs
      const preFillKey = `${retro8a.pairId}--prefill::${modelId}`;
      const preFillResults = fragilityLookup.get(preFillKey) ?? [];
      const preFillRunsWp = waypointsOnly(preFillResults);
      allPreFillRuns.push(...preFillRunsWp);
      totalReusedRuns += preFillResults.length;

      // Per-model
      const modelUnconFreq = computeBridgeFrequency(salienceRunsWp, retro8a.bridge);
      const modelPreFillFreq = computeBridgeFrequency(preFillRunsWp, retro8a.bridge);
      const modelSurvival = modelUnconFreq > 0 ? modelPreFillFreq / modelUnconFreq : 0;

      let modelDomRatio = 0;
      if (salienceRunsWp.length > 0) {
        const freqs = computeWaypointFrequencies(salienceRunsWp);
        const singleLandscape = [{ rankedWaypoints: freqs.map((f) => ({ waypoint: f.waypoint, frequency: f.frequency })) }];
        const modelDom = computeDominanceRatio(singleLandscape, retro8a.bridge, 0.10, 1);
        modelDomRatio = modelDom.dominanceRatio;
      }

      perModelFreqs.push({
        modelId,
        unconstrainedFreq: modelUnconFreq,
        preFillFreq: modelPreFillFreq,
        survival: modelSurvival,
        dominanceRatio: modelDomRatio,
      });
    }

    const domResult = computeDominanceRatio(perModelLandscapes, retro8a.bridge, 0.10, 2);

    const unconstrainedFreq = computeBridgeFrequency(allSalienceRuns, retro8a.bridge);
    const preFillFreq = computeBridgeFrequency(allPreFillRuns, retro8a.bridge);
    const preFillSurvival = unconstrainedFreq > 0 ? preFillFreq / unconstrainedFreq : 0;

    const { count: competitorCount, competitors } = computeCompetitorCount(
      perModelLandscapes,
      retro8a.bridge,
      0.20,
      2,
    );

    retroPairResults.push({
      pairId: retro8a.pairId,
      bridge: retro8a.bridge,
      unconstrainedBridgeFreq: domResult.bridgeFreq,
      strongestCompetitor: domResult.strongestCompetitor,
      strongestCompetitorFreq: domResult.strongestCompetitorFreq,
      dominanceRatio: domResult.dominanceRatio,
      competitorCount,
      competitors,
      preFillSurvival,
      preFillBridgeFreq: preFillFreq,
      source: "retrospective-8a",
      perModelFreqs,
    });

    console.log(`    Dominance ratio: ${domResult.dominanceRatio.toFixed(2)} (bridge freq: ${domResult.bridgeFreq.toFixed(3)}, strongest: "${domResult.strongestCompetitor}" at ${domResult.strongestCompetitorFreq.toFixed(3)})`);
    console.log(`    Competitors: ${competitorCount} [${competitors.join(", ")}]`);
    console.log(`    Pre-fill survival: ${preFillSurvival.toFixed(3)}`);
  }
  console.log("");

  // Retrospective Spearman correlation (dominance ratio vs survival)
  const retroDominanceRatios = retroPairResults.map((p) => p.dominanceRatio);
  const retroSurvivals = retroPairResults.map((p) => p.preFillSurvival);

  const retroRho = retroPairResults.length >= 3
    ? spearmanCorrelation(retroDominanceRatios, retroSurvivals)
    : 0;
  const retroRhoCI = retroPairResults.length >= 3
    ? bootstrapSpearmanCI(retroDominanceRatios, retroSurvivals)
    : [0, 0] as [number, number];
  const evaluabilityGatePasses = retroRho > 0.40;

  console.log(`  Retrospective Spearman rho: ${retroRho.toFixed(3)} [${retroRhoCI[0].toFixed(3)}, ${retroRhoCI[1].toFixed(3)}]`);
  console.log(`  Evaluability gate (rho > 0.40): ${evaluabilityGatePasses ? "PASSES" : "FAILS"}`);
  console.log("");

  // ── Stage 2: Prospective Analysis ───────────────────────────────

  console.log("Stage 2: Prospective analysis (6 new pairs)...");
  console.log("");

  const prospectivePairResults: DominancePairResult[] = [];

  for (const pair of PHASE9A_PAIRS) {
    console.log(`  Processing ${pair.id} (predicted bridge: ${pair.predictedBridge})...`);

    const phase8bPairId = PHASE9A_TO_8B_MAP[pair.id];

    // 1. Get unconstrained/salience data from Phase 8B + Phase 9A supplementary
    const perModelLandscapes: Array<{ rankedWaypoints: Array<{ waypoint: string; frequency: number }> }> = [];
    const allSalienceRuns: string[][] = [];
    const allPreFillRuns: string[][] = [];
    const perModelFreqs: DominancePairResult["perModelFreqs"] = [];

    for (const modelId of modelIds) {
      // Phase 8B unconstrained runs
      const p8bResults = lookupWithPatterns(gradientLookup, [
        `${phase8bPairId}::${modelId}`,
        `${phase8bPairId}--primary::${modelId}`,
        `${phase8bPairId}--fwd::${modelId}`,
      ]);
      totalReusedRuns += p8bResults.length;

      // Phase 9A supplementary salience runs
      const p9aSalienceKey = `${pair.id}--salience::${modelId}`;
      const p9aSalienceResults = dominanceLookup.get(p9aSalienceKey) ?? [];

      // Merge all unconstrained runs for this pair/model
      const allModelUncon = [...p8bResults, ...p9aSalienceResults];
      const modelUnconRuns = waypointsOnly(allModelUncon);
      allSalienceRuns.push(...modelUnconRuns);

      if (modelUnconRuns.length > 0) {
        const freqs = computeWaypointFrequencies(modelUnconRuns);
        perModelLandscapes.push({
          rankedWaypoints: freqs.map((f) => ({ waypoint: f.waypoint, frequency: f.frequency })),
        });
      }

      // Phase 9A pre-fill displacement runs
      const p9aPreFillKey = `${pair.id}--prefill::${modelId}`;
      const p9aPreFillResults = dominanceLookup.get(p9aPreFillKey) ?? [];
      const modelPreFillRuns = waypointsOnly(p9aPreFillResults);
      allPreFillRuns.push(...modelPreFillRuns);

      // Per-model bridge frequencies
      const modelUnconFreq = computeBridgeFrequency(modelUnconRuns, pair.predictedBridge);
      const modelPreFillFreq = computeBridgeFrequency(modelPreFillRuns, pair.predictedBridge);
      const modelSurvival = modelUnconFreq > 0 ? modelPreFillFreq / modelUnconFreq : 0;

      // Per-model dominance ratio
      let modelDomRatio = 0;
      if (modelUnconRuns.length > 0) {
        const freqs = computeWaypointFrequencies(modelUnconRuns);
        const singleLandscape = [{ rankedWaypoints: freqs.map((f) => ({ waypoint: f.waypoint, frequency: f.frequency })) }];
        const modelDom = computeDominanceRatio(singleLandscape, pair.predictedBridge, 0.10, 1);
        modelDomRatio = modelDom.dominanceRatio;
      }

      perModelFreqs.push({
        modelId,
        unconstrainedFreq: modelUnconFreq,
        preFillFreq: modelPreFillFreq,
        survival: modelSurvival,
        dominanceRatio: modelDomRatio,
      });
    }

    // Compute dominance ratio
    const domResult = computeDominanceRatio(perModelLandscapes, pair.predictedBridge, 0.10, 2);

    // Compute aggregate bridge frequencies
    const unconstrainedFreq = computeBridgeFrequency(allSalienceRuns, pair.predictedBridge);
    const preFillFreq = computeBridgeFrequency(allPreFillRuns, pair.predictedBridge);
    const preFillSurvival = unconstrainedFreq > 0 ? preFillFreq / unconstrainedFreq : 0;

    const { count: competitorCount, competitors } = computeCompetitorCount(
      perModelLandscapes,
      pair.predictedBridge,
      0.20,
      2,
    );

    prospectivePairResults.push({
      pairId: pair.id,
      bridge: pair.predictedBridge,
      unconstrainedBridgeFreq: domResult.bridgeFreq,
      strongestCompetitor: domResult.strongestCompetitor,
      strongestCompetitorFreq: domResult.strongestCompetitorFreq,
      dominanceRatio: domResult.dominanceRatio,
      competitorCount,
      competitors,
      preFillSurvival,
      preFillBridgeFreq: preFillFreq,
      source: "prospective-9a",
      perModelFreqs,
    });

    console.log(`    Dominance ratio: ${domResult.dominanceRatio.toFixed(2)} (bridge freq: ${domResult.bridgeFreq.toFixed(3)}, strongest: "${domResult.strongestCompetitor}" at ${domResult.strongestCompetitorFreq.toFixed(3)})`);
    console.log(`    Competitors: ${competitorCount} [${competitors.join(", ")}]`);
    console.log(`    Unconstrained freq: ${unconstrainedFreq.toFixed(3)} (${allSalienceRuns.length} runs)`);
    console.log(`    Pre-fill freq: ${preFillFreq.toFixed(3)} (${allPreFillRuns.length} runs)`);
    console.log(`    Survival: ${preFillSurvival.toFixed(3)}`);
  }
  console.log("");

  // Evaluable prospective pairs: those with unconstrained bridge freq >= 0.20
  const evaluableProspective = prospectivePairResults.filter((p) => p.unconstrainedBridgeFreq >= 0.20);
  const evaluablePairCount = evaluableProspective.length;
  console.log(`  Evaluable prospective pairs: ${evaluablePairCount} of ${PHASE9A_PAIRS.length}`);
  console.log("");

  // ── Combined Correlation (Primary Test) ────────────────────────

  console.log("Computing combined correlation (primary test)...");

  // Build combined arrays: retrospective + evaluable prospective
  const allPairResults: DominancePairResult[] = [
    ...retroPairResults,
    ...evaluableProspective,
  ];

  const combinedDominanceRatios = allPairResults.map((p) => p.dominanceRatio);
  const combinedSurvivals = allPairResults.map((p) => p.preFillSurvival);

  const combinedRho = combinedDominanceRatios.length >= 3
    ? spearmanCorrelation(combinedDominanceRatios, combinedSurvivals)
    : 0;
  const combinedRhoCI = combinedDominanceRatios.length >= 3
    ? bootstrapSpearmanCI(combinedDominanceRatios, combinedSurvivals)
    : [0, 0] as [number, number];
  const combinedSignificantPositive = combinedRhoCI[0] > 0;

  console.log(`  Combined Spearman rho: ${combinedRho.toFixed(3)} [${combinedRhoCI[0].toFixed(3)}, ${combinedRhoCI[1].toFixed(3)}]`);
  console.log(`  N pairs: ${allPairResults.length}`);
  console.log(`  Significant positive (CI lower > 0): ${combinedSignificantPositive}`);
  console.log("");

  // ── Threshold Analysis ──────────────────────────────────────────

  console.log("Computing threshold analysis...");

  // Test dominance ratio thresholds from 0.5 to 10.0 in steps of 0.5
  let bestThreshold = 1.0;
  let bestAccuracy = 0;

  for (let threshold = 0.5; threshold <= 10.0; threshold += 0.5) {
    let correct = 0;
    for (let i = 0; i < combinedDominanceRatios.length; i++) {
      const predictedHigh = combinedDominanceRatios[i] >= threshold;
      const actualHigh = combinedSurvivals[i] >= 0.50;
      if (predictedHigh === actualHigh) correct++;
    }
    const accuracy = combinedDominanceRatios.length > 0
      ? correct / combinedDominanceRatios.length
      : 0;
    if (accuracy > bestAccuracy) {
      bestAccuracy = accuracy;
      bestThreshold = threshold;
    }
  }

  // Compute mean survival for high vs low dominance
  const highDominanceSurvivals = allPairResults
    .filter((p) => p.dominanceRatio >= bestThreshold)
    .map((p) => p.preFillSurvival);
  const lowDominanceSurvivals = allPairResults
    .filter((p) => p.dominanceRatio < bestThreshold)
    .map((p) => p.preFillSurvival);

  const highDominanceSurvivalMean = highDominanceSurvivals.length > 0
    ? mean(highDominanceSurvivals)
    : 0;
  const lowDominanceSurvivalMean = lowDominanceSurvivals.length > 0
    ? mean(lowDominanceSurvivals)
    : 0;

  console.log(`  Best threshold: ${bestThreshold.toFixed(2)}`);
  console.log(`  Classification accuracy: ${bestAccuracy.toFixed(3)}`);
  console.log(`  High-dominance mean survival: ${highDominanceSurvivalMean.toFixed(3)} (${highDominanceSurvivals.length} pairs)`);
  console.log(`  Low-dominance mean survival: ${lowDominanceSurvivalMean.toFixed(3)} (${lowDominanceSurvivals.length} pairs)`);
  console.log("");

  // ── Dominance Ratio vs Competitor Count Comparison ────────────

  console.log("Computing dominance ratio vs competitor count comparison...");

  const combinedCompetitorCounts = allPairResults.map((p) => p.competitorCount);

  const dominanceRho = combinedDominanceRatios.length >= 3
    ? spearmanCorrelation(combinedDominanceRatios, combinedSurvivals)
    : 0;

  // Competitor count: negative correlation expected (more competitors -> lower survival)
  // We negate to make comparable: higher competitor count -> lower survival
  const competitorCountRho = combinedCompetitorCounts.length >= 3
    ? spearmanCorrelation(
        combinedCompetitorCounts.map((c) => -c),
        combinedSurvivals,
      )
    : 0;

  // Dominance is "better" if |dominance rho| > |competitor count rho|
  const dominanceBetter = Math.abs(dominanceRho) > Math.abs(competitorCountRho);

  console.log(`  Dominance ratio rho: ${dominanceRho.toFixed(3)}`);
  console.log(`  Competitor count rho (negated): ${competitorCountRho.toFixed(3)}`);
  console.log(`  Dominance better: ${dominanceBetter}`);
  console.log("");

  // ── Per-Model Dominance Analysis ──────────────────────────────

  console.log("Computing per-model dominance analysis...");

  const perModelDominance: DominanceAnalysisOutput["perModelDominance"] = [];

  for (const modelId of modelIds) {
    const modelDomRatios: number[] = [];
    const modelCompCounts: number[] = [];

    for (const p of allPairResults) {
      const modelData = p.perModelFreqs.find((pm) => pm.modelId === modelId);
      if (modelData) {
        modelDomRatios.push(modelData.dominanceRatio);
      }
      // Use aggregate competitor count (per-pair, not per-model)
      modelCompCounts.push(p.competitorCount);
    }

    const meanDomRatio = modelDomRatios.length > 0 ? mean(modelDomRatios) : 0;
    const meanCompCount = modelCompCounts.length > 0 ? mean(modelCompCounts) : 0;

    perModelDominance.push({
      modelId,
      meanDominanceRatio: meanDomRatio,
      meanCompetitorCount: meanCompCount,
    });

    console.log(`  ${modelId}: mean dominance ratio = ${meanDomRatio.toFixed(2)}, mean competitor count = ${meanCompCount.toFixed(1)}`);
  }
  console.log("");

  // ── Predictions Evaluation ──────────────────────────────────────

  console.log("Evaluating predictions...");

  const predictions: DominanceAnalysisOutput["predictions"] = [];

  // P1: Retrospective rho > 0.40 (evaluability gate)
  predictions.push({
    id: 1,
    description: "Retrospective rho > 0.40 (evaluability gate)",
    result: retroPairResults.length >= 3
      ? (evaluabilityGatePasses ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `rho=${retroRho.toFixed(3)} [${retroRhoCI[0].toFixed(3)}, ${retroRhoCI[1].toFixed(3)}]`,
  });

  // P2: Combined rho > 0.50, CI excludes zero
  const p2Pass = combinedRho > 0.50 && combinedSignificantPositive;
  predictions.push({
    id: 2,
    description: "Combined rho > 0.50, CI excludes zero (positive)",
    result: allPairResults.length >= 3
      ? (p2Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `rho=${combinedRho.toFixed(3)} [${combinedRhoCI[0].toFixed(3)}, ${combinedRhoCI[1].toFixed(3)}], n=${allPairResults.length}`,
  });

  // P3: High-dominance pairs (ratio >= 2.0) mean survival > 0.60
  const highDomPairs = allPairResults.filter((p) => p.dominanceRatio >= 2.0);
  const highDomMeanSurvival = highDomPairs.length > 0
    ? mean(highDomPairs.map((p) => p.preFillSurvival))
    : 0;
  const p3Pass = highDomPairs.length > 0 && highDomMeanSurvival > 0.60;
  predictions.push({
    id: 3,
    description: "High-dominance pairs (ratio >= 2.0) mean survival > 0.60",
    result: highDomPairs.length > 0
      ? (p3Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `mean survival=${highDomMeanSurvival.toFixed(3)}, n=${highDomPairs.length}`,
  });

  // P4: Low-dominance pairs (ratio < 1.5) mean survival < 0.40
  const lowDomPairs = allPairResults.filter((p) => p.dominanceRatio < 1.5);
  const lowDomMeanSurvival = lowDomPairs.length > 0
    ? mean(lowDomPairs.map((p) => p.preFillSurvival))
    : 0;
  const p4Pass = lowDomPairs.length > 0 && lowDomMeanSurvival < 0.40;
  predictions.push({
    id: 4,
    description: "Low-dominance pairs (ratio < 1.5) mean survival < 0.40",
    result: lowDomPairs.length > 0
      ? (p4Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `mean survival=${lowDomMeanSurvival.toFixed(3)}, n=${lowDomPairs.length}`,
  });

  // P5: Dominance ratio outperforms raw competitor count as predictor
  predictions.push({
    id: 5,
    description: "Dominance ratio outperforms competitor count as survival predictor",
    result: allPairResults.length >= 3
      ? (dominanceBetter ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `dom_rho=${dominanceRho.toFixed(3)}, comp_rho=${competitorCountRho.toFixed(3)}`,
  });

  // P6: Threshold classification accuracy > 0.70
  const p6Pass = bestAccuracy > 0.70;
  predictions.push({
    id: 6,
    description: "Threshold classification accuracy > 0.70",
    result: allPairResults.length >= 3
      ? (p6Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `accuracy=${bestAccuracy.toFixed(3)}, threshold=${bestThreshold.toFixed(2)}`,
  });

  // P7: High-dominance mean survival significantly higher than low-dominance
  const p7Pass = highDominanceSurvivalMean > lowDominanceSurvivalMean + 0.15;
  predictions.push({
    id: 7,
    description: "High-dominance mean survival > low-dominance + 0.15",
    result: highDominanceSurvivals.length > 0 && lowDominanceSurvivals.length > 0
      ? (p7Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `high=${highDominanceSurvivalMean.toFixed(3)}, low=${lowDominanceSurvivalMean.toFixed(3)}, diff=${(highDominanceSurvivalMean - lowDominanceSurvivalMean).toFixed(3)}`,
  });

  // P8: Cross-model consistency: dominance ratio rank-order consistent across models
  const perModelDomCorrelations: number[] = [];
  for (let i = 0; i < modelIds.length; i++) {
    for (let j = i + 1; j < modelIds.length; j++) {
      const modelA = modelIds[i];
      const modelB = modelIds[j];
      const ratiosA: number[] = [];
      const ratiosB: number[] = [];

      for (const p of allPairResults) {
        const a = p.perModelFreqs.find((pm) => pm.modelId === modelA);
        const b = p.perModelFreqs.find((pm) => pm.modelId === modelB);
        if (a && b) {
          ratiosA.push(a.dominanceRatio);
          ratiosB.push(b.dominanceRatio);
        }
      }

      if (ratiosA.length >= 3) {
        const rho = spearmanCorrelation(ratiosA, ratiosB);
        perModelDomCorrelations.push(rho);
      }
    }
  }
  const meanCrossModelRho = perModelDomCorrelations.length > 0
    ? mean(perModelDomCorrelations)
    : 0;
  const p8Pass = perModelDomCorrelations.length > 0 && meanCrossModelRho > 0.50;
  predictions.push({
    id: 8,
    description: "Cross-model dominance ratio rank-order correlation > 0.50",
    result: perModelDomCorrelations.length > 0
      ? (p8Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `mean cross-model rho=${meanCrossModelRho.toFixed(3)}, n_pairs=${perModelDomCorrelations.length}`,
  });

  for (const pred of predictions) {
    console.log(`  P${pred.id}: ${pred.result} -- ${pred.value}`);
  }
  console.log("");

  // ── Build Output ───────────────────────────────────────────────────

  const analysisOutput: DominanceAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      retrospectivePairs: retroPairResults.map((p) => p.pairId),
      prospectivePairs: prospectivePairResults.map((p) => p.pairId),
      models: MODELS.map((m) => m.id),
      totalNewRuns: totalNewRuns,
      totalReusedRuns: totalReusedRuns,
    },
    retrospective: {
      pairResults: retroPairResults,
      spearmanRho: retroRho,
      spearmanCI: retroRhoCI,
      evaluabilityGatePasses,
    },
    prospective: {
      pairResults: prospectivePairResults,
      evaluablePairCount,
    },
    combined: {
      allPairResults,
      spearmanRho: combinedRho,
      spearmanCI: combinedRhoCI,
      significantPositive: combinedSignificantPositive,
      nPairs: allPairResults.length,
    },
    thresholdAnalysis: {
      bestThreshold,
      classificationAccuracy: bestAccuracy,
      highDominanceSurvivalMean,
      lowDominanceSurvivalMean,
    },
    dominanceVsCompetitorCount: {
      dominanceRho,
      competitorCountRho,
      dominanceBetter,
    },
    perModelDominance,
    predictions,
  };

  // ── Write Outputs ──────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "09a-dominance.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Bridge dominance ratio analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("dominance-analysis")
    .description("Analyze bridge dominance ratio from Phase 9A data")
    .option("--input <dir>", "base results directory", "results")
    .option("--output <dir>", "output directory for analysis JSON", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/09a-dominance.md");

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
