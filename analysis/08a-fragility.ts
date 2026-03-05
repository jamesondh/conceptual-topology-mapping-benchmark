#!/usr/bin/env bun
/**
 * Phase 8A: Bridge Fragility Analysis
 *
 * Tests whether the number of navigational competitors predicts bridge
 * survival under pre-fill displacement. Two-stage design:
 *
 * Stage 1 (Retrospective): Reuses Phase 6A salience + Phase 7A anchoring data
 *   for 6 overlapping pairs. Zero new API calls.
 *
 * Stage 2 (Prospective): Loads Phase 8A experiment data for 8 new pairs
 *   spanning the competitor-count spectrum.
 *
 * Combined: Merges all 14 pairs for Spearman correlation, threshold
 *   analysis, cross-validation, and prediction evaluation.
 *
 * Usage:
 *   bun run analysis/08a-fragility.ts
 *   bun run analysis/08a-fragility.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  bootstrapCI,
  mean,
  computeWaypointFrequencies,
  computeCompetitorCount,
  computeBridgeFrequency,
  bootstrapBridgeFrequencyCI,
  computeBridgeSurvivalRate,
  spearmanCorrelation,
  bootstrapSpearmanCI,
  linearRegression,
} from "../src/metrics.ts";
import { MODELS } from "../src/data/pairs.ts";
import { PHASE6A_PAIRS } from "../src/data/pairs-phase6.ts";
import { PHASE7A_PAIRS } from "../src/data/pairs-phase7.ts";
import { PHASE8A_PAIRS, PHASE8A_RETROSPECTIVE_PAIRS } from "../src/data/pairs-phase8.ts";
import type { FragilityAnalysisOutput, ElicitationResult, SalienceLandscape } from "../src/types.ts";

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

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: FragilityAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 8A: Bridge Fragility Analysis Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Experiment Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Pairs analyzed:** ${output.metadata.pairs.length}`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **New runs:** ${output.metadata.totalNewRuns}`);
  lines.push(`- **Reused runs:** ${output.metadata.totalReusedRuns}`);
  lines.push("");

  // 2. Retrospective Analysis
  lines.push("## 2. Retrospective Analysis (6 pairs from Phase 6A + 7A)");
  lines.push("");
  lines.push("| Pair | Bridge | Competitor Count | Competitors | Pre-Fill Survival |");
  lines.push("|------|--------|-----------------|-------------|-------------------|");

  for (const p of output.retrospective.pairCompetitorCounts) {
    lines.push(
      `| ${p.pairId} | ${p.bridge} | ${p.competitorCount} | ${p.competitors.join(", ") || "none"} | ${p.preFillSurvival.toFixed(3)} |`,
    );
  }
  lines.push("");
  lines.push(`- **Spearman rho:** ${output.retrospective.spearmanRho.toFixed(3)} [${output.retrospective.spearmanCI[0].toFixed(3)}, ${output.retrospective.spearmanCI[1].toFixed(3)}]`);
  lines.push(`- **Significant negative:** ${output.retrospective.significantNegative ? "**YES**" : "**NO**"}`);
  lines.push("");

  // 3. Prospective Analysis
  lines.push("## 3. Prospective Analysis (8 new pairs)");
  lines.push("");
  lines.push("| Pair | Bridge | Pred. Comp. | Obs. Comp. | Match | Uncon. Freq | Pre-Fill Freq | Survival | Evaluable |");
  lines.push("|------|--------|-------------|------------|-------|-------------|---------------|----------|-----------|");

  for (const m of output.prospective.pairMetrics) {
    lines.push(
      `| ${m.pairId} | ${m.predictedBridge} | ${m.predictedCompetitorCount} | ${m.observedCompetitorCount} | ${m.competitorCountAccurate ? "Yes" : "No"} | ${m.unconstrainedBridgeFreq.toFixed(3)} | ${m.preFillBridgeFreq.toFixed(3)} | ${m.bridgeSurvival.toFixed(3)} | ${m.evaluable ? "Yes" : "No"} |`,
    );
  }
  lines.push("");
  lines.push(`- **Evaluable pairs:** ${output.prospective.evaluablePairCount} of 8`);
  lines.push("");

  // 4. Combined Correlation
  lines.push("## 4. Combined Correlation (all evaluable pairs)");
  lines.push("");
  lines.push(`- **Spearman rho:** ${output.combinedCorrelation.spearmanRho.toFixed(3)} [${output.combinedCorrelation.spearmanCI[0].toFixed(3)}, ${output.combinedCorrelation.spearmanCI[1].toFixed(3)}]`);
  lines.push(`- **N pairs:** ${output.combinedCorrelation.nPairs}`);
  lines.push(`- **Significant negative:** ${output.combinedCorrelation.significantNegative ? "**YES**" : "**NO**"}`);
  lines.push("");

  if (output.combinedCorrelation.significantNegative) {
    lines.push("**[observed]** More navigational competitors predict lower bridge survival under ");
    lines.push("pre-fill displacement, supporting the fragility hypothesis: bridges with fewer ");
    lines.push("alternatives are structurally entrenched and resist displacement.");
  } else {
    lines.push("The combined Spearman correlation does not reach significance. The relationship ");
    lines.push("between competitor count and bridge survival may be weaker than predicted.");
  }
  lines.push("");

  // 5. Threshold Analysis
  lines.push("## 5. Threshold Analysis (Step Function vs Linear)");
  lines.push("");
  lines.push(`- **Best threshold k:** ${output.thresholdAnalysis.bestThreshold}`);
  lines.push(`- **Classification accuracy:** ${output.thresholdAnalysis.classificationAccuracy.toFixed(3)}`);
  lines.push(`- **Step function better than linear:** ${output.thresholdAnalysis.stepFunctionBetterThanLinear ? "**YES**" : "**NO**"}`);
  lines.push("");

  // 6. Per-Model Competitor Counts
  lines.push("## 6. Per-Model Competitor Counts");
  lines.push("");
  lines.push("| Model | Mean Competitor Count |");
  lines.push("|-------|---------------------|");

  for (const mc of output.perModelCompetitorCounts) {
    lines.push(`| ${mc.modelId} | ${mc.meanCompetitorCount.toFixed(2)} |`);
  }
  lines.push("");

  // 7. Leave-One-Out Cross-Validation
  lines.push("## 7. Leave-One-Out Cross-Validation");
  lines.push("");
  lines.push(`- **Mean prediction error:** ${output.crossValidation.meanPredictionError.toFixed(4)}`);
  lines.push("");
  lines.push("| Pair | Predicted Survival | Actual Survival | Error |");
  lines.push("|------|--------------------|-----------------|-------|");

  for (const loo of output.crossValidation.leaveOneOutErrors) {
    lines.push(
      `| ${loo.pairId} | ${loo.predicted.toFixed(3)} | ${loo.actual.toFixed(3)} | ${loo.error.toFixed(3)} |`,
    );
  }
  lines.push("");

  // 8. Predictions Summary
  lines.push("## 8. Predictions Summary");
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

  console.log("Conceptual Topology Mapping Benchmark - Bridge Fragility Analysis");
  console.log("===================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data from multiple sources ─────────────────────────────

  console.log("Loading data from multiple sources...");

  // Phase 6A salience data (for retrospective competitor counts)
  const salienceDir = join(inputDir, "salience");
  const salienceResults = await loadResultsFromDir(salienceDir);
  console.log(`  Salience (6A):   ${salienceResults.length} results`);

  // Phase 7A anchoring data (for retrospective survival rates)
  const anchoringDir = join(inputDir, "anchoring");
  const anchoringResults = await loadResultsFromDir(anchoringDir);
  console.log(`  Anchoring (7A):  ${anchoringResults.length} results`);

  // Phase 6C positional data (unconstrained baselines for pairs 1-6)
  const positionalDir = join(inputDir, "positional");
  const positionalResults = await loadResultsFromDir(positionalDir);
  console.log(`  Positional (6C): ${positionalResults.length} results`);

  // Phase 5C convergence data (for pairs that overlap)
  const convergenceDir = join(inputDir, "convergence");
  const convergenceResults = await loadResultsFromDir(convergenceDir);
  console.log(`  Convergence (5C): ${convergenceResults.length} results`);

  // Phase 8A fragility data (prospective experiment)
  const fragilityDir = join(inputDir, "fragility");
  const fragilityResults = await loadResultsFromDir(fragilityDir);
  console.log(`  Fragility (8A):  ${fragilityResults.length} results`);
  console.log("");

  // Build lookups
  const salienceLookup = buildWaypointLookup(salienceResults);
  const anchoringLookup = buildWaypointLookup([
    ...anchoringResults,
    ...positionalResults,
    ...convergenceResults,
  ]);
  const fragilityLookup = buildWaypointLookup(fragilityResults);

  console.log(`  Salience lookup keys:   ${salienceLookup.size}`);
  console.log(`  Anchoring lookup keys:  ${anchoringLookup.size}`);
  console.log(`  Fragility lookup keys:  ${fragilityLookup.size}`);
  console.log("");

  const modelIds = MODELS.map(m => m.id);

  // ── Stage 1: Retrospective Analysis ─────────────────────────────

  console.log("Stage 1: Retrospective analysis (6 pairs, 0 new API calls)...");
  console.log("");

  const retroPairCompetitorCounts: FragilityAnalysisOutput["retrospective"]["pairCompetitorCounts"] = [];

  let totalReusedRuns = 0;

  for (const retro of PHASE8A_RETROSPECTIVE_PAIRS) {
    console.log(`  Processing ${retro.pairId6A} / ${retro.pairId7A} (bridge: ${retro.bridge})...`);

    // 1. Get Phase 6A salience data to compute competitor count
    const perModelLandscapes: Array<{ rankedWaypoints: Array<{ waypoint: string; frequency: number }> }> = [];

    for (const modelId of modelIds) {
      const salienceKey = `${retro.pairId6A}::${modelId}`;
      const salienceRuns = salienceLookup.get(salienceKey) ?? [];

      if (salienceRuns.length > 0) {
        totalReusedRuns += salienceRuns.length;
        const runs = waypointsOnly(salienceRuns);
        const freqs = computeWaypointFrequencies(runs);
        perModelLandscapes.push({
          rankedWaypoints: freqs.map(f => ({ waypoint: f.waypoint, frequency: f.frequency })),
        });
      }
    }

    const { count: competitorCount, competitors } = computeCompetitorCount(
      perModelLandscapes,
      retro.bridge,
      0.20,
      2,
    );

    // 2. Get Phase 7A pre-fill survival rates
    // Collect unconstrained runs for this pair across all models
    const unconstrainedRuns: string[][] = [];
    const preFillRuns: string[][] = [];

    const p7aPair = PHASE7A_PAIRS.find(p => p.id === retro.pairId7A);
    if (!p7aPair) {
      console.log(`    WARNING: No Phase 7A pair found for ${retro.pairId7A}`);
      continue;
    }

    for (const modelId of modelIds) {
      // Unconstrained baseline: check Phase 7A, 6C, and 5C data
      const p7aUnconKey = `${retro.pairId7A}--unconstrained::${modelId}`;
      const p6cKey = `${retro.pairId7A.replace("p7a-", "p6c-")}--fwd::${modelId}`;
      const p5cKey = `${retro.pairId7A.replace("p7a-", "p5c-")}--fwd::${modelId}`;

      const p7aUnconResults = anchoringLookup.get(p7aUnconKey) ?? [];
      const p6cResults = anchoringLookup.get(p6cKey) ?? [];
      const p5cResults = anchoringLookup.get(p5cKey) ?? [];

      const mergedUncon = [...p7aUnconResults, ...p6cResults, ...p5cResults];
      unconstrainedRuns.push(...waypointsOnly(mergedUncon));

      if (p6cResults.length > 0 || p5cResults.length > 0) {
        totalReusedRuns += p6cResults.length + p5cResults.length;
      }

      // Pre-fill runs: incongruent, congruent, neutral conditions
      for (const cond of ["incongruent", "congruent", "neutral"] as const) {
        const condKey = `${retro.pairId7A}--${cond}::${modelId}`;
        const condResults = anchoringLookup.get(condKey) ?? [];
        preFillRuns.push(...waypointsOnly(condResults));
        totalReusedRuns += condResults.length;
      }
    }

    // Compute survival = preFill bridge freq / unconstrained bridge freq
    const unconstrainedFreq = computeBridgeFrequency(unconstrainedRuns, retro.bridge);
    const preFillFreq = computeBridgeFrequency(preFillRuns, retro.bridge);
    const preFillSurvival = unconstrainedFreq > 0
      ? preFillFreq / unconstrainedFreq
      : 0;

    retroPairCompetitorCounts.push({
      pairId: retro.pairId7A,
      bridge: retro.bridge,
      competitorCount,
      competitors,
      preFillSurvival,
    });

    console.log(`    Competitors: ${competitorCount} [${competitors.join(", ")}]`);
    console.log(`    Unconstrained freq: ${unconstrainedFreq.toFixed(3)} (${unconstrainedRuns.length} runs)`);
    console.log(`    Pre-fill freq: ${preFillFreq.toFixed(3)} (${preFillRuns.length} runs)`);
    console.log(`    Survival: ${preFillSurvival.toFixed(3)}`);
  }
  console.log("");

  // Retrospective Spearman correlation
  const retroCompetitors = retroPairCompetitorCounts.map(p => p.competitorCount);
  const retroSurvivals = retroPairCompetitorCounts.map(p => p.preFillSurvival);

  const retroRho = retroPairCompetitorCounts.length >= 3
    ? spearmanCorrelation(retroCompetitors, retroSurvivals)
    : 0;
  const retroRhoCI = retroPairCompetitorCounts.length >= 3
    ? bootstrapSpearmanCI(retroCompetitors, retroSurvivals)
    : [0, 0] as [number, number];
  const retroSignificant = retroRhoCI[1] < 0;

  console.log(`  Retrospective Spearman rho: ${retroRho.toFixed(3)} [${retroRhoCI[0].toFixed(3)}, ${retroRhoCI[1].toFixed(3)}]`);
  console.log(`  Significant negative: ${retroSignificant}`);
  console.log("");

  // ── Stage 2: Prospective Analysis ───────────────────────────────

  console.log("Stage 2: Prospective analysis (8 new pairs)...");
  console.log("");

  const prospectiveMetrics: FragilityAnalysisOutput["prospective"]["pairMetrics"] = [];
  const totalNewRuns = fragilityResults.length;

  for (const pair of PHASE8A_PAIRS) {
    console.log(`  Processing ${pair.id} (predicted bridge: ${pair.predictedBridge})...`);

    // 1. Get salience runs (unconstrained) from Phase 8A data
    const perModelLandscapes: Array<{ rankedWaypoints: Array<{ waypoint: string; frequency: number }> }> = [];
    const perModelFreqs: Array<{ modelId: string; unconstrainedFreq: number; preFillFreq: number; survival: number }> = [];

    const allSalienceRuns: string[][] = [];
    const allPreFillRuns: string[][] = [];

    for (const modelId of modelIds) {
      // Salience/unconstrained runs
      const salienceKey = `${pair.id}--salience::${modelId}`;
      const salienceRunResults = fragilityLookup.get(salienceKey) ?? [];

      // Also try without suffix in case data uses bare pair ID
      const bareKey = `${pair.id}::${modelId}`;
      const bareResults = fragilityLookup.get(bareKey) ?? [];

      const salienceAll = salienceRunResults.length > 0 ? salienceRunResults : bareResults;
      const salienceRunsWp = waypointsOnly(salienceAll);
      allSalienceRuns.push(...salienceRunsWp);

      if (salienceRunsWp.length > 0) {
        const freqs = computeWaypointFrequencies(salienceRunsWp);
        perModelLandscapes.push({
          rankedWaypoints: freqs.map(f => ({ waypoint: f.waypoint, frequency: f.frequency })),
        });
      }

      // Pre-fill runs
      const preFillKey = `${pair.id}--prefill::${modelId}`;
      const preFillResults = fragilityLookup.get(preFillKey) ?? [];
      const preFillRunsWp = waypointsOnly(preFillResults);
      allPreFillRuns.push(...preFillRunsWp);

      // Per-model bridge frequencies
      const modelUnconFreq = computeBridgeFrequency(salienceRunsWp, pair.predictedBridge);
      const modelPreFillFreq = computeBridgeFrequency(preFillRunsWp, pair.predictedBridge);
      const modelSurvival = modelUnconFreq > 0 ? modelPreFillFreq / modelUnconFreq : 0;

      perModelFreqs.push({
        modelId,
        unconstrainedFreq: modelUnconFreq,
        preFillFreq: modelPreFillFreq,
        survival: modelSurvival,
      });
    }

    // Compute competitor count
    const { count: observedCompetitorCount, competitors } = computeCompetitorCount(
      perModelLandscapes,
      pair.predictedBridge,
      0.20,
      2,
    );

    // Compute bridge frequencies
    const unconstrainedBridgeFreq = computeBridgeFrequency(allSalienceRuns, pair.predictedBridge);
    const unconstrainedBridgeFreqCI = bootstrapBridgeFrequencyCI(allSalienceRuns, pair.predictedBridge);
    const preFillBridgeFreq = computeBridgeFrequency(allPreFillRuns, pair.predictedBridge);
    const preFillBridgeFreqCI = bootstrapBridgeFrequencyCI(allPreFillRuns, pair.predictedBridge);

    // Bridge survival
    const bridgeSurvival = unconstrainedBridgeFreq > 0
      ? preFillBridgeFreq / unconstrainedBridgeFreq
      : 0;

    // Evaluability gate
    const evaluable = unconstrainedBridgeFreq >= 0.40;

    // Check if predicted competitor count is accurate
    const predRange = pair.predictedCompetitorCount.split("-").map(Number);
    const predLow = predRange[0];
    const predHigh = predRange.length > 1 ? predRange[1] : predRange[0];
    const competitorCountAccurate =
      observedCompetitorCount >= predLow && observedCompetitorCount <= predHigh;

    prospectiveMetrics.push({
      pairId: pair.id,
      predictedBridge: pair.predictedBridge,
      observedCompetitorCount,
      predictedCompetitorCount: pair.predictedCompetitorCount,
      competitorCountAccurate,
      competitors,
      unconstrainedBridgeFreq,
      unconstrainedBridgeFreqCI,
      preFillBridgeFreq,
      preFillBridgeFreqCI,
      bridgeSurvival,
      evaluable,
      perModelFreqs,
    });

    console.log(`    Observed competitors: ${observedCompetitorCount} (predicted: ${pair.predictedCompetitorCount}) ${competitorCountAccurate ? "MATCH" : "MISMATCH"}`);
    console.log(`    Unconstrained freq: ${unconstrainedBridgeFreq.toFixed(3)} [${unconstrainedBridgeFreqCI[0].toFixed(3)}, ${unconstrainedBridgeFreqCI[1].toFixed(3)}]`);
    console.log(`    Pre-fill freq: ${preFillBridgeFreq.toFixed(3)} [${preFillBridgeFreqCI[0].toFixed(3)}, ${preFillBridgeFreqCI[1].toFixed(3)}]`);
    console.log(`    Survival: ${bridgeSurvival.toFixed(3)} | Evaluable: ${evaluable}`);
  }
  console.log("");

  const evaluablePairCount = prospectiveMetrics.filter(m => m.evaluable).length;
  console.log(`  Evaluable prospective pairs: ${evaluablePairCount} of ${PHASE8A_PAIRS.length}`);
  console.log("");

  // ── Combined Correlation ────────────────────────────────────────

  console.log("Computing combined correlation...");

  // Build combined arrays: 6 retrospective + evaluable prospective
  const combinedCompetitors: number[] = [...retroCompetitors];
  const combinedSurvivals: number[] = [...retroSurvivals];
  const combinedPairIds: string[] = [...retroPairCompetitorCounts.map(p => p.pairId)];

  for (const m of prospectiveMetrics) {
    if (m.evaluable) {
      combinedCompetitors.push(m.observedCompetitorCount);
      combinedSurvivals.push(m.bridgeSurvival);
      combinedPairIds.push(m.pairId);
    }
  }

  const combinedRho = combinedCompetitors.length >= 3
    ? spearmanCorrelation(combinedCompetitors, combinedSurvivals)
    : 0;
  const combinedRhoCI = combinedCompetitors.length >= 3
    ? bootstrapSpearmanCI(combinedCompetitors, combinedSurvivals)
    : [0, 0] as [number, number];
  const combinedSignificant = combinedRhoCI[1] < 0;

  console.log(`  Combined Spearman rho: ${combinedRho.toFixed(3)} [${combinedRhoCI[0].toFixed(3)}, ${combinedRhoCI[1].toFixed(3)}]`);
  console.log(`  N pairs: ${combinedCompetitors.length}`);
  console.log(`  Significant negative: ${combinedSignificant}`);
  console.log("");

  // ── Threshold Analysis ──────────────────────────────────────────

  console.log("Computing threshold analysis...");

  const maxCompetitorCount = combinedCompetitors.length > 0
    ? Math.max(...combinedCompetitors)
    : 0;

  let bestThreshold = 0;
  let bestAccuracy = 0;

  for (let k = 1; k <= Math.max(maxCompetitorCount, 1); k++) {
    let correct = 0;
    for (let i = 0; i < combinedCompetitors.length; i++) {
      const predictedHigh = combinedCompetitors[i] <= k;
      const actualHigh = combinedSurvivals[i] >= 0.50;
      if (predictedHigh === actualHigh) correct++;
    }
    const accuracy = combinedCompetitors.length > 0 ? correct / combinedCompetitors.length : 0;
    if (accuracy > bestAccuracy) {
      bestAccuracy = accuracy;
      bestThreshold = k;
    }
  }

  // Compare with linear fit R^2
  const linFit = combinedCompetitors.length >= 2
    ? linearRegression(combinedCompetitors, combinedSurvivals)
    : { slope: 0, intercept: 0, r2: 0 };

  // Step function is "better" if classification accuracy exceeds linear R^2
  const stepFunctionBetterThanLinear = bestAccuracy > linFit.r2;

  console.log(`  Best threshold k: ${bestThreshold}`);
  console.log(`  Classification accuracy: ${bestAccuracy.toFixed(3)}`);
  console.log(`  Linear R2: ${linFit.r2.toFixed(3)}`);
  console.log(`  Step function better: ${stepFunctionBetterThanLinear}`);
  console.log("");

  // ── Per-Model Competitor Counts ─────────────────────────────────

  console.log("Computing per-model competitor counts...");

  const perModelCompetitorCounts: FragilityAnalysisOutput["perModelCompetitorCounts"] = [];

  for (const modelId of modelIds) {
    const modelCompetitorCounts: number[] = [];

    // Retrospective: per-model competitor count from salience data
    for (const retro of PHASE8A_RETROSPECTIVE_PAIRS) {
      const salienceKey = `${retro.pairId6A}::${modelId}`;
      const salienceRuns = salienceLookup.get(salienceKey) ?? [];
      if (salienceRuns.length > 0) {
        const runs = waypointsOnly(salienceRuns);
        const freqs = computeWaypointFrequencies(runs);
        // Per-model: count non-bridge waypoints above threshold
        const nonBridgeAboveThreshold = freqs.filter(f => {
          if (f.frequency <= 0.20) return false;
          const wpLower = f.waypoint.toLowerCase();
          const bridgeLower = retro.bridge.toLowerCase();
          // Exclude the bridge concept itself
          if (wpLower === bridgeLower) return false;
          if (wpLower.includes(bridgeLower) || bridgeLower.includes(wpLower)) return false;
          return true;
        });
        modelCompetitorCounts.push(nonBridgeAboveThreshold.length);
      }
    }

    // Prospective: per-model competitor count from Phase 8A salience data
    for (const pair of PHASE8A_PAIRS) {
      const salienceKey = `${pair.id}--salience::${modelId}`;
      const salienceRunResults = fragilityLookup.get(salienceKey) ?? [];
      const bareKey = `${pair.id}::${modelId}`;
      const bareResults = fragilityLookup.get(bareKey) ?? [];
      const salienceAll = salienceRunResults.length > 0 ? salienceRunResults : bareResults;

      if (salienceAll.length > 0) {
        const runs = waypointsOnly(salienceAll);
        const freqs = computeWaypointFrequencies(runs);
        const nonBridgeAboveThreshold = freqs.filter(f => {
          if (f.frequency <= 0.20) return false;
          const wpLower = f.waypoint.toLowerCase();
          const bridgeLower = pair.predictedBridge.toLowerCase();
          if (wpLower === bridgeLower) return false;
          if (wpLower.includes(bridgeLower) || bridgeLower.includes(wpLower)) return false;
          return true;
        });
        modelCompetitorCounts.push(nonBridgeAboveThreshold.length);
      }
    }

    const meanCount = modelCompetitorCounts.length > 0 ? mean(modelCompetitorCounts) : 0;
    perModelCompetitorCounts.push({ modelId, meanCompetitorCount: meanCount });

    console.log(`  ${modelId}: mean competitor count = ${meanCount.toFixed(2)} (${modelCompetitorCounts.length} pairs)`);
  }
  console.log("");

  // ── Cross-Validation ────────────────────────────────────────────

  console.log("Computing leave-one-out cross-validation...");

  const leaveOneOutErrors: FragilityAnalysisOutput["crossValidation"]["leaveOneOutErrors"] = [];

  for (let i = 0; i < combinedCompetitors.length; i++) {
    // Train on all except i
    const trainX = combinedCompetitors.filter((_, j) => j !== i);
    const trainY = combinedSurvivals.filter((_, j) => j !== i);

    if (trainX.length < 2) {
      leaveOneOutErrors.push({
        pairId: combinedPairIds[i],
        predicted: 0,
        actual: combinedSurvivals[i],
        error: combinedSurvivals[i],
      });
      continue;
    }

    const fit = linearRegression(trainX, trainY);
    const predicted = fit.slope * combinedCompetitors[i] + fit.intercept;
    // Clamp predicted to [0, 2] range (survival can theoretically exceed 1)
    const clampedPredicted = Math.max(0, Math.min(2, predicted));
    const error = Math.abs(clampedPredicted - combinedSurvivals[i]);

    leaveOneOutErrors.push({
      pairId: combinedPairIds[i],
      predicted: clampedPredicted,
      actual: combinedSurvivals[i],
      error,
    });
  }

  const meanPredictionError = leaveOneOutErrors.length > 0
    ? mean(leaveOneOutErrors.map(e => e.error))
    : 0;

  console.log(`  Mean prediction error: ${meanPredictionError.toFixed(4)}`);
  for (const loo of leaveOneOutErrors) {
    console.log(`    ${loo.pairId}: predicted=${loo.predicted.toFixed(3)} actual=${loo.actual.toFixed(3)} error=${loo.error.toFixed(3)}`);
  }
  console.log("");

  // ── Predictions Evaluation ──────────────────────────────────────

  console.log("Evaluating predictions...");

  const predictions: FragilityAnalysisOutput["predictions"] = [];

  // P1: Retrospective rho < -0.70, CI excludes zero
  const p1Pass = retroRho < -0.70 && retroSignificant;
  predictions.push({
    id: 1,
    description: "Retrospective rho < -0.70, CI excludes zero",
    result: retroPairCompetitorCounts.length >= 3
      ? (p1Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `rho=${retroRho.toFixed(3)} [${retroRhoCI[0].toFixed(3)}, ${retroRhoCI[1].toFixed(3)}]`,
  });

  // P2: Prospective rho < -0.60 (14 pairs), CI excludes zero
  const p2Pass = combinedRho < -0.60 && combinedSignificant;
  predictions.push({
    id: 2,
    description: "Prospective rho < -0.60 (combined 14 pairs), CI excludes zero",
    result: combinedCompetitors.length >= 3
      ? (p2Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `rho=${combinedRho.toFixed(3)} [${combinedRhoCI[0].toFixed(3)}, ${combinedRhoCI[1].toFixed(3)}], n=${combinedCompetitors.length}`,
  });

  // P3: Low-competitor pairs (question-answer, parent-child, cause-effect) survival > 0.60
  const lowPairIds = PHASE8A_PAIRS.filter(p => p.competitorLevel === "low").map(p => p.id);
  const lowCompMetrics = prospectiveMetrics.filter(m => m.evaluable && lowPairIds.includes(m.pairId));
  const lowCompSurvivals = lowCompMetrics.map(m => m.bridgeSurvival);
  const lowCompMeanSurvival = lowCompSurvivals.length > 0 ? mean(lowCompSurvivals) : 0;
  const p3Pass = lowCompSurvivals.length > 0 && lowCompMeanSurvival > 0.60;
  predictions.push({
    id: 3,
    description: "Low-competitor pairs (question-answer, parent-child, cause-effect) survival > 0.60",
    result: lowCompSurvivals.length > 0
      ? (p3Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `mean survival=${lowCompMeanSurvival.toFixed(3)}, n=${lowCompSurvivals.length}`,
  });

  // P4: High-competitor pairs (science-art, ocean-mountain, brain-computer) survival < 0.30
  const highPairIds = PHASE8A_PAIRS.filter(p => p.competitorLevel === "high").map(p => p.id);
  const highCompMetrics = prospectiveMetrics.filter(m => m.evaluable && highPairIds.includes(m.pairId));
  const highCompSurvivals = highCompMetrics.map(m => m.bridgeSurvival);
  const highCompMeanSurvival = highCompSurvivals.length > 0 ? mean(highCompSurvivals) : 0;
  const p4Pass = highCompSurvivals.length > 0 && highCompMeanSurvival < 0.30;
  predictions.push({
    id: 4,
    description: "High-competitor pairs (science-art, ocean-mountain, brain-computer) survival < 0.30",
    result: highCompSurvivals.length > 0
      ? (p4Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `mean survival=${highCompMeanSurvival.toFixed(3)}, n=${highCompSurvivals.length}`,
  });

  // P5: Medium-competitor pairs (winter-summer, student-professor) survival 0.25-0.60
  const medPairIds = PHASE8A_PAIRS.filter(p => p.competitorLevel === "medium").map(p => p.id);
  const medCompMetrics = prospectiveMetrics.filter(m => m.evaluable && medPairIds.includes(m.pairId));
  const medCompSurvivals = medCompMetrics.map(m => m.bridgeSurvival);
  const medCompMeanSurvival = medCompSurvivals.length > 0 ? mean(medCompSurvivals) : 0;
  const p5Pass = medCompSurvivals.length > 0 && medCompMeanSurvival >= 0.25 && medCompMeanSurvival <= 0.60;
  predictions.push({
    id: 5,
    description: "Medium-competitor pairs (winter-summer, student-professor) survival 0.25-0.60",
    result: medCompSurvivals.length > 0
      ? (p5Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `mean survival=${medCompMeanSurvival.toFixed(3)}, n=${medCompSurvivals.length}`,
  });

  // P6: Step-function threshold at k = 3-4
  const p6Pass = bestThreshold >= 3 && bestThreshold <= 4;
  predictions.push({
    id: 6,
    description: "Step-function threshold at k = 3-4",
    result: combinedCompetitors.length >= 3
      ? (p6Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `best k=${bestThreshold}, accuracy=${bestAccuracy.toFixed(3)}`,
  });

  // P7: Predicted competitor counts correlate with observed at r > 0.60
  // Compare predicted competitor ranges (midpoint) with observed counts for prospective pairs
  const predMidpoints: number[] = [];
  const obsCompCounts: number[] = [];
  for (const m of prospectiveMetrics) {
    const range = m.predictedCompetitorCount.split("-").map(Number);
    const midpoint = range.length > 1 ? (range[0] + range[1]) / 2 : range[0];
    predMidpoints.push(midpoint);
    obsCompCounts.push(m.observedCompetitorCount);
  }

  const predObsRho = predMidpoints.length >= 3
    ? spearmanCorrelation(predMidpoints, obsCompCounts)
    : 0;
  const p7Pass = predObsRho > 0.60;
  predictions.push({
    id: 7,
    description: "Predicted competitor counts correlate with observed at r > 0.60",
    result: predMidpoints.length >= 3
      ? (p7Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `rho=${predObsRho.toFixed(3)}, n=${predMidpoints.length}`,
  });

  // P8: Claude produces fewest competitors per pair
  const claudeModel = perModelCompetitorCounts.find(m => m.modelId === "claude");
  const nonClaudeModels = perModelCompetitorCounts.filter(m => m.modelId !== "claude");
  const claudeFewest = claudeModel
    ? nonClaudeModels.every(m => claudeModel.meanCompetitorCount <= m.meanCompetitorCount)
    : false;
  predictions.push({
    id: 8,
    description: "Claude produces fewest competitors per pair",
    result: claudeModel && perModelCompetitorCounts.length > 1
      ? (claudeFewest ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: claudeModel
      ? `claude=${claudeModel.meanCompetitorCount.toFixed(2)}, others=[${nonClaudeModels.map(m => `${m.modelId}:${m.meanCompetitorCount.toFixed(2)}`).join(", ")}]`
      : "N/A",
  });

  for (const pred of predictions) {
    console.log(`  P${pred.id}: ${pred.result} -- ${pred.value}`);
  }
  console.log("");

  // ── Build Output ───────────────────────────────────────────────────

  const analysisOutput: FragilityAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      pairs: [
        ...retroPairCompetitorCounts.map(p => p.pairId),
        ...prospectiveMetrics.map(m => m.pairId),
      ],
      models: MODELS.map(m => m.id),
      totalNewRuns: totalNewRuns,
      totalReusedRuns: totalReusedRuns,
    },
    retrospective: {
      pairCompetitorCounts: retroPairCompetitorCounts,
      spearmanRho: retroRho,
      spearmanCI: retroRhoCI,
      significantNegative: retroSignificant,
    },
    prospective: {
      pairMetrics: prospectiveMetrics,
      evaluablePairCount,
    },
    combinedCorrelation: {
      spearmanRho: combinedRho,
      spearmanCI: combinedRhoCI,
      significantNegative: combinedSignificant,
      nPairs: combinedCompetitors.length,
    },
    thresholdAnalysis: {
      bestThreshold,
      classificationAccuracy: bestAccuracy,
      stepFunctionBetterThanLinear,
    },
    perModelCompetitorCounts,
    crossValidation: {
      meanPredictionError,
      leaveOneOutErrors,
    },
    predictions,
  };

  // ── Write Outputs ──────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "fragility-metrics.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Bridge fragility analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("fragility-analysis")
    .description("Analyze bridge fragility mechanism from Phase 8A data")
    .option("--input <dir>", "base results directory", "results")
    .option("--output <dir>", "output directory for analysis JSON", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/08a-fragility.md");

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
