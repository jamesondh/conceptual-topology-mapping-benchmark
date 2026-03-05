#!/usr/bin/env bun
/**
 * Phase 9C: Pre-Fill Facilitation Analysis
 *
 * Tests whether pre-filling produces a crossover interaction: displacing
 * dominant bridges but facilitating marginal ones. Primary test is a
 * regression of survival rate on unconstrained bridge frequency; a
 * negative slope confirms the crossover hypothesis (H11).
 *
 * Loads data from:
 *   results/salience/       (Phase 6A unconstrained data, pair IDs: p6a-*)
 *   results/anchoring/      (Phase 7A data, pair IDs: p7a-*--unconstrained, etc.)
 *   results/fragility/      (Phase 8A data, pair IDs: p8a-*--salience, etc.)
 *   results/facilitation/   (Phase 9C new data)
 *
 * Analyses:
 *   1. Unconstrained frequency verification (14 pairs)
 *   2. Survival rate computation per pair/condition
 *   3. Crossover regression (PRIMARY TEST): survival ~ unconstrained freq
 *   4. Crossover point estimation (where survival = 1.0)
 *   5. Congruent vs incongruent for marginal bridges
 *   6. Neutral pre-fill baseline
 *   7. Phase 7A comparison for pairs 1-8
 *   8. Per-model facilitation count
 *   9. Pilot pair verification
 *   10. Predictions evaluation (10 predictions)
 *
 * Usage:
 *   bun run analysis/09c-facilitation.ts
 *   bun run analysis/09c-facilitation.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  seededRandom,
  bootstrapCI,
  mean,
  computeBridgeFrequency,
  bootstrapBridgeFrequencyCI,
  linearRegression,
  bootstrapSlopeCI,
} from "../src/metrics.ts";
import { MODELS } from "../src/data/pairs.ts";
import { PHASE9C_PAIRS } from "../src/data/pairs-phase9.ts";
import type {
  FacilitationAnalysisOutput,
  FacilitationPairResult,
  ElicitationResult,
  Phase9FacilitationPair,
  Phase9PreFillCondition,
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

// ── Unconstrained Source Mapping ──────────────────────────────────────

/**
 * Maps Phase 9C pair IDs to the prior-phase pair ID and data directory
 * used for unconstrained baseline data.
 */
const UNCONSTRAINED_SOURCE_MAP: Record<string, { pairId: string; dir: string }> = {
  // Phase 6A pairs (unconstrained from salience collection)
  "p9c-emotion-melancholy": { pairId: "p6a-emotion-melancholy", dir: "salience" },
  "p9c-light-color": { pairId: "p6a-light-color", dir: "salience" },
  "p9c-sun-desert": { pairId: "p6a-sun-desert", dir: "salience" },
  "p9c-animal-poodle": { pairId: "p6a-animal-poodle", dir: "salience" },
  "p9c-bank-ocean": { pairId: "p6a-bank-ocean", dir: "salience" },
  "p9c-music-mathematics": { pairId: "p6a-music-mathematics", dir: "salience" },
  "p9c-seed-garden": { pairId: "p6a-seed-garden", dir: "salience" },
  // Phase 7A pair (unconstrained from anchoring collection)
  "p9c-loan-shore": { pairId: "p7a-loan-shore", dir: "anchoring" },
  // Phase 8A pairs (unconstrained from fragility salience stage)
  "p9c-science-art": { pairId: "p8a-science-art--salience", dir: "fragility" },
  "p9c-student-professor": { pairId: "p8a-student-professor--salience", dir: "fragility" },
  // Pilot pairs (unconstrained from Phase 9C pilot stage)
  "p9c-recipe-meal": { pairId: "p9c-recipe-meal--pilot", dir: "facilitation" },
  "p9c-problem-solution": { pairId: "p9c-problem-solution--pilot", dir: "facilitation" },
  "p9c-sketch-painting": { pairId: "p9c-sketch-painting--pilot", dir: "facilitation" },
  "p9c-note-symphony": { pairId: "p9c-note-symphony--pilot", dir: "facilitation" },
};

/**
 * Maps Phase 9C pair IDs to Phase 7A pair IDs for survival comparison.
 * Only the first 8 pairs have Phase 7A equivalents.
 */
const PHASE7A_COMPARISON_MAP: Record<string, string> = {
  "p9c-emotion-melancholy": "p7a-emotion-melancholy",
  "p9c-light-color": "p7a-light-color",
  "p9c-sun-desert": "p7a-sun-desert",
  "p9c-animal-poodle": "p7a-animal-poodle",
  "p9c-bank-ocean": "p7a-bank-ocean",
  "p9c-music-mathematics": "p7a-music-mathematics",
  "p9c-seed-garden": "p7a-seed-garden",
  "p9c-loan-shore": "p7a-loan-shore",
};

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: FacilitationAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 9C: Pre-Fill Facilitation Analysis Findings");
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

  // 2. Pilot Pair Verification
  lines.push("## 2. Pilot Pair Verification");
  lines.push("");
  if (output.pilotVerification.length > 0) {
    lines.push("| Pair | Bridge Freq | In Range (0.20-0.50) | Retained |");
    lines.push("|------|------------|---------------------|----------|");
    for (const pv of output.pilotVerification) {
      lines.push(
        `| ${pv.pairId} | ${pv.unconstrainedBridgeFreq.toFixed(3)} | ${pv.inRange ? "YES" : "NO"} | ${pv.retained ? "YES" : "NO"} |`,
      );
    }
  } else {
    lines.push("_No pilot pairs to verify._");
  }
  lines.push("");

  // 3. Per-Pair Facilitation Results
  lines.push("## 3. Per-Pair Facilitation Results");
  lines.push("");
  lines.push("### Unconstrained Bridge Frequency & Survival Rates");
  lines.push("");
  lines.push("| Pair | Bridge | Dominance | Uncon. Freq | Cong. Surv. | Incong. Surv. | Neutral Surv. |");
  lines.push("|------|--------|-----------|-------------|-------------|---------------|---------------|");

  for (const pr of output.pairResults) {
    const congSurv = pr.perCondition.find((c) => c.condition === "congruent");
    const incongSurv = pr.perCondition.find((c) => c.condition === "incongruent");
    const neutralSurv = pr.perCondition.find((c) => c.condition === "neutral");

    const congStr = congSurv ? congSurv.survivalRate.toFixed(3) : "--";
    const incongStr = incongSurv ? incongSurv.survivalRate.toFixed(3) : "--";
    const neutralStr = neutralSurv ? neutralSurv.survivalRate.toFixed(3) : "--";

    lines.push(
      `| ${pr.pairId} | ${pr.bridge} | ${pr.dominanceLevel} | ${pr.unconstrainedFreq.toFixed(3)} | ${congStr} | ${incongStr} | ${neutralStr} |`,
    );
  }
  lines.push("");

  // 4. Crossover Regression (PRIMARY TEST)
  lines.push("## 4. Crossover Regression (PRIMARY TEST)");
  lines.push("");
  const cr = output.crossoverRegression;
  lines.push(`- **Slope:** ${cr.slope.toFixed(4)} [${cr.slopeCI[0].toFixed(4)}, ${cr.slopeCI[1].toFixed(4)}]`);
  lines.push(`- **Intercept:** ${cr.intercept.toFixed(4)}`);
  lines.push(`- **R-squared:** ${cr.r2.toFixed(4)}`);
  lines.push(`- **Significant negative slope (CI excludes zero):** ${cr.significantNegativeSlope ? "**YES**" : "**NO**"}`);
  lines.push("");

  if (cr.significantNegativeSlope) {
    lines.push(
      "**[observed]** The crossover regression confirms H11: pre-filling displaces dominant " +
        "bridges (high unconstrained freq -> survival < 1.0) but facilitates marginal bridges " +
        "(low unconstrained freq -> survival > 1.0). The negative slope indicates that as " +
        "unconstrained bridge frequency increases, the survival rate under pre-fill decreases.",
    );
  } else {
    lines.push(
      "The crossover regression does not show a significant negative slope. The crossover " +
        "interaction between dominance and pre-fill facilitation is not confirmed.",
    );
  }
  lines.push("");

  // 5. Crossover Point Estimation
  lines.push("## 5. Crossover Point Estimation");
  lines.push("");
  const cp = output.crossoverPoint;
  lines.push(`- **Unconstrained frequency at survival = 1.0:** ${cp.unconstrainedFreqAtUnity.toFixed(3)} [${cp.crossoverCI[0].toFixed(3)}, ${cp.crossoverCI[1].toFixed(3)}]`);
  lines.push("");
  lines.push(
    "The crossover point is the unconstrained bridge frequency at which pre-fill " +
      "transitions from facilitation (survival > 1.0) to displacement (survival < 1.0).",
  );
  lines.push("");

  // 6. Congruent vs Incongruent for Marginal Bridges
  lines.push("## 6. Congruent vs Incongruent for Marginal Bridges");
  lines.push("");
  const cvi = output.congruentVsIncongruent;
  lines.push(`- **Marginal congruent mean survival:** ${cvi.marginalCongruentMeanSurvival.toFixed(3)}`);
  lines.push(`- **Marginal incongruent mean survival:** ${cvi.marginalIncongruentMeanSurvival.toFixed(3)}`);
  lines.push(`- **Difference (congruent - incongruent):** ${cvi.difference.toFixed(3)} [${cvi.differenceCI[0].toFixed(3)}, ${cvi.differenceCI[1].toFixed(3)}]`);
  lines.push(`- **Significantly higher:** ${cvi.significantlyHigher ? "**YES**" : "**NO**"}`);
  lines.push("");

  // 7. Neutral Pre-Fill Baseline
  lines.push("## 7. Neutral Pre-Fill Baseline");
  lines.push("");
  const nb = output.neutralBaseline;
  lines.push(`- **Dominant neutral survival:** ${nb.dominantNeutralSurvival.toFixed(3)}`);
  lines.push(`- **Marginal neutral survival:** ${nb.marginalNeutralSurvival.toFixed(3)}`);
  lines.push("");

  // 8. Phase 7A Comparison
  lines.push("## 8. Phase 7A Comparison (pairs 1-8)");
  lines.push("");
  if (output.phase7AComparison.length > 0) {
    lines.push("| Pair | Phase 7A Survival | Phase 9C Survival | Difference | Replicates (within 0.15)? |");
    lines.push("|------|-------------------|-------------------|------------|---------------------------|");
    for (const comp of output.phase7AComparison) {
      lines.push(
        `| ${comp.pairId} | ${comp.phase7ASurvival.toFixed(3)} | ${comp.phase9CSurvival.toFixed(3)} | ${comp.difference.toFixed(3)} | ${comp.replicates ? "YES" : "NO"} |`,
      );
    }
  } else {
    lines.push("_No Phase 7A comparison data available._");
  }
  lines.push("");

  // 9. Per-Model Facilitation
  lines.push("## 9. Per-Model Facilitation");
  lines.push("");
  lines.push("| Model | Marginal Facilitation Count (survival > 1.0) | Dominant Displacement Count (survival < 1.0) |");
  lines.push("|-------|----------------------------------------------|----------------------------------------------|");
  for (const pmf of output.perModelFacilitation) {
    lines.push(
      `| ${pmf.modelId} | ${pmf.marginalFacilitationCount} | ${pmf.dominantDisplacementCount} |`,
    );
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

  console.log("Conceptual Topology Mapping Benchmark - Pre-Fill Facilitation Analysis");
  console.log("=====================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data from multiple sources ─────────────────────────────

  console.log("Loading data from multiple sources...");

  // Phase 6A salience data
  const salienceDir = join(inputDir, "salience");
  const salienceResults = await loadResultsFromDir(salienceDir);
  console.log(`  Salience (6A):      ${salienceResults.length} results`);

  // Phase 7A anchoring data
  const anchoringDir = join(inputDir, "anchoring");
  const anchoringResults = await loadResultsFromDir(anchoringDir);
  console.log(`  Anchoring (7A):     ${anchoringResults.length} results`);

  // Phase 8A fragility data
  const fragilityDir = join(inputDir, "fragility");
  const fragilityResults = await loadResultsFromDir(fragilityDir);
  console.log(`  Fragility (8A):     ${fragilityResults.length} results`);

  // Phase 9C facilitation data
  const facilitationDir = join(inputDir, "facilitation");
  const facilitationResults = await loadResultsFromDir(facilitationDir);
  console.log(`  Facilitation (9C):  ${facilitationResults.length} results`);
  console.log("");

  // Build lookups
  const salienceLookup = buildWaypointLookup(salienceResults);
  const anchoringLookup = buildWaypointLookup(anchoringResults);
  const fragilityLookup = buildWaypointLookup(fragilityResults);
  const facilitationLookup = buildWaypointLookup(facilitationResults);

  console.log(`  Salience lookup keys:      ${salienceLookup.size}`);
  console.log(`  Anchoring lookup keys:     ${anchoringLookup.size}`);
  console.log(`  Fragility lookup keys:     ${fragilityLookup.size}`);
  console.log(`  Facilitation lookup keys:  ${facilitationLookup.size}`);
  console.log("");

  const modelIds = MODELS.map((m) => m.id);

  // Helper to resolve the correct lookup for a directory name
  function getLookup(dirName: string): Map<string, ElicitationResult[]> {
    switch (dirName) {
      case "salience":
        return salienceLookup;
      case "anchoring":
        return anchoringLookup;
      case "fragility":
        return fragilityLookup;
      case "facilitation":
        return facilitationLookup;
      default:
        return new Map();
    }
  }

  let totalNewRuns = facilitationResults.length;
  let totalReusedRuns = 0;

  // ── 1. Unconstrained Frequency Verification ───────────────────────

  console.log("1. Unconstrained frequency verification...");
  console.log("");

  // For each pair, gather unconstrained runs from the appropriate source
  const pairUnconstrainedFreqs = new Map<string, number>();
  const pairUnconstrainedRuns = new Map<string, string[][]>();

  for (const pair of PHASE9C_PAIRS) {
    const source = UNCONSTRAINED_SOURCE_MAP[pair.id];
    if (!source) {
      console.log(`  SKIP ${pair.id}: no source mapping`);
      pairUnconstrainedFreqs.set(pair.id, 0);
      pairUnconstrainedRuns.set(pair.id, []);
      continue;
    }

    const lookup = getLookup(source.dir);
    const allRuns: string[][] = [];

    for (const modelId of modelIds) {
      // Try direct key
      const key = `${source.pairId}::${modelId}`;
      const results = lookup.get(key) ?? [];
      if (results.length > 0) {
        allRuns.push(...waypointsOnly(results));
        if (source.dir !== "facilitation") {
          totalReusedRuns += results.length;
        }
      }

      // For Phase 7A unconstrained, also try --unconstrained suffix
      if (source.dir === "anchoring") {
        const unconKey = `${source.pairId}--unconstrained::${modelId}`;
        const unconResults = lookup.get(unconKey) ?? [];
        if (unconResults.length > 0) {
          allRuns.push(...waypointsOnly(unconResults));
          totalReusedRuns += unconResults.length;
        }
      }
    }

    const freq = allRuns.length > 0 ? computeBridgeFrequency(allRuns, pair.bridge) : 0;
    pairUnconstrainedFreqs.set(pair.id, freq);
    pairUnconstrainedRuns.set(pair.id, allRuns);

    const expectedStr = pair.unconstrainedFreq !== null
      ? pair.unconstrainedFreq.toFixed(3)
      : "pilot";
    console.log(
      `  ${pair.id}: bridge="${pair.bridge}" freq=${freq.toFixed(3)} (expected: ${expectedStr}) [${allRuns.length} runs]`,
    );
  }
  console.log("");

  // ── 2. Survival Rate Computation ──────────────────────────────────

  console.log("2. Computing survival rates per pair/condition...");
  console.log("");

  const pairResults: FacilitationPairResult[] = [];

  for (const pair of PHASE9C_PAIRS) {
    const unconstrainedFreq = pairUnconstrainedFreqs.get(pair.id) ?? 0;

    const perCondition: FacilitationPairResult["perCondition"] = [];
    const preFillConditions = pair.newConditions.filter((c) => c !== "unconstrained");

    for (const condition of preFillConditions) {
      const condPairId = `${pair.id}--${condition}`;
      const condRuns: string[][] = [];

      for (const modelId of modelIds) {
        const key = `${condPairId}::${modelId}`;
        const results = facilitationLookup.get(key) ?? [];
        condRuns.push(...waypointsOnly(results));
      }

      const bridgeFreq = condRuns.length > 0
        ? computeBridgeFrequency(condRuns, pair.bridge)
        : 0;
      const bridgeFreqCI = condRuns.length > 0
        ? bootstrapBridgeFrequencyCI(condRuns, pair.bridge)
        : [0, 0] as [number, number];
      const survivalRate = unconstrainedFreq > 0
        ? bridgeFreq / unconstrainedFreq
        : 0;

      perCondition.push({
        condition: condition as Phase9PreFillCondition,
        bridgeFreq,
        bridgeFreqCI,
        survivalRate,
      });

      console.log(
        `  ${pair.id} [${condition}]: bridgeFreq=${bridgeFreq.toFixed(3)} survival=${survivalRate.toFixed(3)} (${condRuns.length} runs)`,
      );
    }

    // Per-model metrics
    const perModel: FacilitationPairResult["perModel"] = [];
    for (const modelId of modelIds) {
      // Unconstrained freq for this model
      const source = UNCONSTRAINED_SOURCE_MAP[pair.id];
      let modelUnconRuns: string[][] = [];
      if (source) {
        const lookup = getLookup(source.dir);
        const key = `${source.pairId}::${modelId}`;
        const results = lookup.get(key) ?? [];
        modelUnconRuns = waypointsOnly(results);

        if (source.dir === "anchoring") {
          const unconKey = `${source.pairId}--unconstrained::${modelId}`;
          const unconResults = lookup.get(unconKey) ?? [];
          modelUnconRuns.push(...waypointsOnly(unconResults));
        }
      }
      const modelUnconFreq = modelUnconRuns.length > 0
        ? computeBridgeFrequency(modelUnconRuns, pair.bridge)
        : 0;

      // Per-condition survival for this model
      let congruentSurvival: number | null = null;
      let incongruentSurvival: number | null = null;
      let neutralSurvival: number | null = null;

      for (const condition of preFillConditions) {
        const condPairId = `${pair.id}--${condition}`;
        const key = `${condPairId}::${modelId}`;
        const results = facilitationLookup.get(key) ?? [];
        const runs = waypointsOnly(results);

        if (runs.length > 0 && modelUnconFreq > 0) {
          const condFreq = computeBridgeFrequency(runs, pair.bridge);
          const survival = condFreq / modelUnconFreq;

          switch (condition) {
            case "congruent":
              congruentSurvival = survival;
              break;
            case "incongruent":
              incongruentSurvival = survival;
              break;
            case "neutral":
              neutralSurvival = survival;
              break;
          }
        }
      }

      perModel.push({
        modelId,
        unconstrainedFreq: modelUnconFreq,
        congruentSurvival,
        incongruentSurvival,
        neutralSurvival,
      });
    }

    pairResults.push({
      pairId: pair.id,
      bridge: pair.bridge,
      unconstrainedFreq,
      dominanceLevel: pair.dominanceLevel,
      perCondition,
      perModel,
    });
  }
  console.log("");

  // ── 3. Crossover Regression (PRIMARY TEST) ────────────────────────

  console.log("3. Crossover regression (survival ~ unconstrained freq)...");

  // Pool congruent survival rates across all pairs for regression
  // (congruent is the condition present for all pairs)
  const regressionX: number[] = [];
  const regressionY: number[] = [];

  for (const pr of pairResults) {
    if (pr.unconstrainedFreq <= 0) continue;
    const congCondition = pr.perCondition.find((c) => c.condition === "congruent");
    if (!congCondition) continue;
    regressionX.push(pr.unconstrainedFreq);
    regressionY.push(congCondition.survivalRate);
  }

  const { slope, intercept, r2 } = regressionX.length >= 2
    ? linearRegression(regressionX, regressionY)
    : { slope: 0, intercept: 0, r2: 0 };

  const slopeCI = regressionX.length >= 3
    ? bootstrapSlopeCI(regressionX, regressionY)
    : [0, 0] as [number, number];

  const significantNegativeSlope = slopeCI[1] < 0;

  console.log(`  Data points: ${regressionX.length}`);
  console.log(`  Slope: ${slope.toFixed(4)} [${slopeCI[0].toFixed(4)}, ${slopeCI[1].toFixed(4)}]`);
  console.log(`  Intercept: ${intercept.toFixed(4)}`);
  console.log(`  R-squared: ${r2.toFixed(4)}`);
  console.log(`  Significant negative slope: ${significantNegativeSlope}`);
  console.log("");

  const crossoverRegression: FacilitationAnalysisOutput["crossoverRegression"] = {
    slope,
    slopeCI,
    intercept,
    r2,
    significantNegativeSlope,
  };

  // ── 4. Crossover Point Estimation ─────────────────────────────────

  console.log("4. Crossover point estimation...");

  // Crossover: survival = 1.0 => intercept + slope * x = 1.0 => x = (1.0 - intercept) / slope
  let crossoverFreq = 0;
  if (slope !== 0) {
    crossoverFreq = (1.0 - intercept) / slope;
  }

  // Bootstrap CI for crossover point
  const nBootstrap = 1000;
  const crossoverBootstrap: number[] = [];
  if (regressionX.length >= 3 && slope !== 0) {
    for (let b = 0; b < nBootstrap; b++) {
      const indices = Array.from({ length: regressionX.length }, () =>
        Math.floor(seededRandom() * regressionX.length));
      const bx = indices.map((i) => regressionX[i]);
      const by = indices.map((i) => regressionY[i]);
      const { slope: bs, intercept: bi } = linearRegression(bx, by);
      if (bs !== 0) {
        crossoverBootstrap.push((1.0 - bi) / bs);
      }
    }
    crossoverBootstrap.sort((a, b) => a - b);
  }

  const crossoverCI: [number, number] = crossoverBootstrap.length >= 20
    ? [
        crossoverBootstrap[Math.floor(crossoverBootstrap.length * 0.025)],
        crossoverBootstrap[Math.floor(crossoverBootstrap.length * 0.975)],
      ]
    : [crossoverFreq, crossoverFreq];

  console.log(`  Crossover at unconstrained freq: ${crossoverFreq.toFixed(3)} [${crossoverCI[0].toFixed(3)}, ${crossoverCI[1].toFixed(3)}]`);
  console.log("");

  const crossoverPoint: FacilitationAnalysisOutput["crossoverPoint"] = {
    unconstrainedFreqAtUnity: crossoverFreq,
    crossoverCI,
  };

  // ── 5. Congruent vs Incongruent for Marginal Bridges ──────────────
  // Marginal pairs (p9c-science-art, p9c-student-professor) now collect all
  // three conditions (congruent, incongruent, neutral), enabling P4 and P6
  // predictions for marginal bridges.

  console.log("5. Congruent vs incongruent for marginal bridges (freq < 0.30)...");

  const marginalCongruentSurvivals: number[] = [];
  const marginalIncongruentSurvivals: number[] = [];

  for (const pr of pairResults) {
    if (pr.unconstrainedFreq >= 0.30) continue;
    if (pr.unconstrainedFreq <= 0) continue;

    const congCond = pr.perCondition.find((c) => c.condition === "congruent");
    const incongCond = pr.perCondition.find((c) => c.condition === "incongruent");

    if (congCond) marginalCongruentSurvivals.push(congCond.survivalRate);
    if (incongCond) marginalIncongruentSurvivals.push(incongCond.survivalRate);
  }

  const marginalCongMean = marginalCongruentSurvivals.length > 0
    ? mean(marginalCongruentSurvivals)
    : 0;
  const marginalIncongMean = marginalIncongruentSurvivals.length > 0
    ? mean(marginalIncongruentSurvivals)
    : 0;
  const congVsIncongDiff = marginalCongMean - marginalIncongMean;

  // Bootstrap CI for the difference
  let congVsIncongCI: [number, number] = [0, 0];
  if (marginalCongruentSurvivals.length > 0 && marginalIncongruentSurvivals.length > 0) {
    const diffs: number[] = [];
    for (let b = 0; b < nBootstrap; b++) {
      const congSample: number[] = [];
      for (let j = 0; j < marginalCongruentSurvivals.length; j++) {
        congSample.push(
          marginalCongruentSurvivals[Math.floor(seededRandom() * marginalCongruentSurvivals.length)],
        );
      }
      const incongSample: number[] = [];
      for (let j = 0; j < marginalIncongruentSurvivals.length; j++) {
        incongSample.push(
          marginalIncongruentSurvivals[Math.floor(seededRandom() * marginalIncongruentSurvivals.length)],
        );
      }
      diffs.push(mean(congSample) - mean(incongSample));
    }
    diffs.sort((a, b) => a - b);
    congVsIncongCI = [
      diffs[Math.floor(nBootstrap * 0.025)],
      diffs[Math.floor(nBootstrap * 0.975)],
    ];
  }

  const significantlyHigherCong = congVsIncongCI[0] > 0;

  console.log(`  Marginal congruent mean survival: ${marginalCongMean.toFixed(3)}`);
  console.log(`  Marginal incongruent mean survival: ${marginalIncongMean.toFixed(3)}`);
  console.log(`  Difference: ${congVsIncongDiff.toFixed(3)} [${congVsIncongCI[0].toFixed(3)}, ${congVsIncongCI[1].toFixed(3)}]`);
  console.log(`  Significantly higher: ${significantlyHigherCong}`);
  console.log("");

  const congruentVsIncongruent: FacilitationAnalysisOutput["congruentVsIncongruent"] = {
    marginalCongruentMeanSurvival: marginalCongMean,
    marginalIncongruentMeanSurvival: marginalIncongMean,
    difference: congVsIncongDiff,
    differenceCI: congVsIncongCI,
    significantlyHigher: significantlyHigherCong,
  };

  // ── 6. Neutral Pre-Fill Baseline ──────────────────────────────────

  console.log("6. Neutral pre-fill baseline...");

  const dominantNeutralSurvivals: number[] = [];
  const marginalNeutralSurvivals: number[] = [];

  for (const pr of pairResults) {
    const neutralCond = pr.perCondition.find((c) => c.condition === "neutral");
    if (!neutralCond || pr.unconstrainedFreq <= 0) continue;

    if (pr.dominanceLevel === "dominant") {
      dominantNeutralSurvivals.push(neutralCond.survivalRate);
    } else if (pr.dominanceLevel === "marginal") {
      marginalNeutralSurvivals.push(neutralCond.survivalRate);
    }
  }

  const dominantNeutralSurvival = dominantNeutralSurvivals.length > 0
    ? mean(dominantNeutralSurvivals)
    : 0;
  const marginalNeutralSurvival = marginalNeutralSurvivals.length > 0
    ? mean(marginalNeutralSurvivals)
    : 0;

  console.log(`  Dominant neutral survival: ${dominantNeutralSurvival.toFixed(3)} (${dominantNeutralSurvivals.length} pairs)`);
  console.log(`  Marginal neutral survival: ${marginalNeutralSurvival.toFixed(3)} (${marginalNeutralSurvivals.length} pairs)`);
  console.log("");

  const neutralBaseline: FacilitationAnalysisOutput["neutralBaseline"] = {
    dominantNeutralSurvival,
    marginalNeutralSurvival,
  };

  // ── 7. Phase 7A Comparison ────────────────────────────────────────

  console.log("7. Phase 7A comparison (pairs 1-8)...");

  const phase7AComparison: FacilitationAnalysisOutput["phase7AComparison"] = [];

  for (const pair of PHASE9C_PAIRS) {
    const p7aPairId = PHASE7A_COMPARISON_MAP[pair.id];
    if (!p7aPairId) continue;

    // Phase 7A survival: gather incongruent pre-fill data from Phase 7A
    const p7aPreFillRuns: string[][] = [];
    for (const modelId of modelIds) {
      const incongKey = `${p7aPairId}--incongruent::${modelId}`;
      const incongResults = anchoringLookup.get(incongKey) ?? [];
      p7aPreFillRuns.push(...waypointsOnly(incongResults));
      if (incongResults.length > 0) {
        totalReusedRuns += incongResults.length;
      }
    }

    // Phase 7A unconstrained frequency
    const p7aUnconRuns: string[][] = [];
    for (const modelId of modelIds) {
      const unconKey = `${p7aPairId}--unconstrained::${modelId}`;
      const unconResults = anchoringLookup.get(unconKey) ?? [];
      p7aUnconRuns.push(...waypointsOnly(unconResults));
    }

    const p7aUnconFreq = p7aUnconRuns.length > 0
      ? computeBridgeFrequency(p7aUnconRuns, pair.bridge)
      : 0;
    const p7aPreFillFreq = p7aPreFillRuns.length > 0
      ? computeBridgeFrequency(p7aPreFillRuns, pair.bridge)
      : 0;
    const p7aSurvival = p7aUnconFreq > 0 ? p7aPreFillFreq / p7aUnconFreq : 0;

    // Phase 9C congruent survival (most comparable)
    const p9cResult = pairResults.find((pr) => pr.pairId === pair.id);
    const p9cCongCond = p9cResult?.perCondition.find((c) => c.condition === "congruent");
    const p9cSurvival = p9cCongCond?.survivalRate ?? 0;

    const difference = Math.abs(p7aSurvival - p9cSurvival);
    const replicates = difference <= 0.15;

    phase7AComparison.push({
      pairId: pair.id,
      phase7ASurvival: p7aSurvival,
      phase9CSurvival: p9cSurvival,
      difference,
      replicates,
    });

    console.log(
      `  ${pair.id}: 7A=${p7aSurvival.toFixed(3)}, 9C=${p9cSurvival.toFixed(3)}, diff=${difference.toFixed(3)}, replicates=${replicates}`,
    );
  }
  console.log("");

  // ── 8. Per-Model Facilitation ─────────────────────────────────────

  console.log("8. Per-model facilitation...");

  const perModelFacilitation: FacilitationAnalysisOutput["perModelFacilitation"] = [];

  // Marginal pairs: freq < 0.30
  const marginalPairIds = PHASE9C_PAIRS
    .filter((p) => {
      const freq = pairUnconstrainedFreqs.get(p.id) ?? 0;
      return freq > 0 && freq < 0.30;
    })
    .map((p) => p.id);

  // Dominant pairs: freq > 0.60
  const dominantPairIds = PHASE9C_PAIRS
    .filter((p) => {
      const freq = pairUnconstrainedFreqs.get(p.id) ?? 0;
      return freq > 0.60;
    })
    .map((p) => p.id);

  for (const modelId of modelIds) {
    let marginalFacilitationCount = 0;
    let dominantDisplacementCount = 0;

    for (const pairId of marginalPairIds) {
      const pr = pairResults.find((p) => p.pairId === pairId);
      const modelData = pr?.perModel.find((pm) => pm.modelId === modelId);
      if (modelData?.congruentSurvival !== null && modelData?.congruentSurvival !== undefined) {
        if (modelData.congruentSurvival > 1.0) {
          marginalFacilitationCount++;
        }
      }
    }

    for (const pairId of dominantPairIds) {
      const pr = pairResults.find((p) => p.pairId === pairId);
      const modelData = pr?.perModel.find((pm) => pm.modelId === modelId);
      if (modelData?.congruentSurvival !== null && modelData?.congruentSurvival !== undefined) {
        if (modelData.congruentSurvival < 1.0) {
          dominantDisplacementCount++;
        }
      }
    }

    perModelFacilitation.push({
      modelId,
      marginalFacilitationCount,
      dominantDisplacementCount,
    });

    console.log(
      `  ${modelId}: marginal facilitation=${marginalFacilitationCount}/${marginalPairIds.length}, dominant displacement=${dominantDisplacementCount}/${dominantPairIds.length}`,
    );
  }
  console.log("");

  // ── 9. Pilot Pair Verification ────────────────────────────────────

  console.log("9. Pilot pair verification...");

  const pilotVerification: FacilitationAnalysisOutput["pilotVerification"] = [];

  const pilotPairs = PHASE9C_PAIRS.filter((p) => p.dominanceLevel === "pilot");
  for (const pair of pilotPairs) {
    const unconFreq = pairUnconstrainedFreqs.get(pair.id) ?? 0;
    const inRange = unconFreq >= 0.20 && unconFreq <= 0.50;
    // Retained even if out of range -- data is still informative
    const retained = true;

    pilotVerification.push({
      pairId: pair.id,
      unconstrainedBridgeFreq: unconFreq,
      inRange,
      retained,
    });

    console.log(
      `  ${pair.id}: freq=${unconFreq.toFixed(3)} inRange=${inRange} retained=${retained}`,
    );
  }
  console.log("");

  // ── 10. Predictions Evaluation ────────────────────────────────────

  console.log("Evaluating predictions...");

  const predictions: FacilitationAnalysisOutput["predictions"] = [];

  // P1: Regression slope negative, CI excludes zero (primary test of H11)
  const p1Pass = significantNegativeSlope;
  predictions.push({
    id: 1,
    description: "Regression slope negative, CI excludes zero (primary test of H11)",
    result: regressionX.length >= 3
      ? (p1Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `slope=${slope.toFixed(3)} [${slopeCI[0].toFixed(3)}, ${slopeCI[1].toFixed(3)}]`,
  });

  // P2: Dominant bridges (freq >0.60) show mean survival < 0.80
  const dominantSurvivals = pairResults
    .filter((pr) => pr.unconstrainedFreq > 0.60)
    .map((pr) => pr.perCondition.find((c) => c.condition === "congruent")?.survivalRate)
    .filter((s): s is number => s !== undefined);
  const dominantMeanSurvival = dominantSurvivals.length > 0 ? mean(dominantSurvivals) : 0;
  const p2Pass = dominantSurvivals.length > 0 && dominantMeanSurvival < 0.80;
  predictions.push({
    id: 2,
    description: "Dominant bridges (freq >0.60) show mean congruent survival < 0.80",
    result: dominantSurvivals.length > 0
      ? (p2Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `mean survival=${dominantMeanSurvival.toFixed(3)}, n=${dominantSurvivals.length}`,
  });

  // P3: Marginal bridges (freq <0.30) show mean survival >1.20 under congruent pre-fill
  const p3Pass = marginalCongruentSurvivals.length > 0 && marginalCongMean > 1.20;
  predictions.push({
    id: 3,
    description: "Marginal bridges (freq <0.30) show mean congruent survival >1.20",
    result: marginalCongruentSurvivals.length > 0
      ? (p3Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `mean survival=${marginalCongMean.toFixed(3)}, n=${marginalCongruentSurvivals.length}`,
  });

  // P4: Marginal bridges show survival ~1.0 (0.80-1.20) under incongruent pre-fill
  const p4Pass =
    marginalIncongruentSurvivals.length > 0 &&
    marginalIncongMean >= 0.80 &&
    marginalIncongMean <= 1.20;
  predictions.push({
    id: 4,
    description: "Marginal bridges show incongruent survival in 0.80-1.20 range",
    result: marginalIncongruentSurvivals.length > 0
      ? (p4Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `mean survival=${marginalIncongMean.toFixed(3)}, n=${marginalIncongruentSurvivals.length}`,
  });

  // P5: Crossover point at approx 0.40-0.50
  const p5Pass = crossoverFreq >= 0.40 && crossoverFreq <= 0.50;
  predictions.push({
    id: 5,
    description: "Crossover point at approx 0.40-0.50",
    result: regressionX.length >= 3 && slope !== 0
      ? (p5Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `crossover=${crossoverFreq.toFixed(3)} [${crossoverCI[0].toFixed(3)}, ${crossoverCI[1].toFixed(3)}]`,
  });

  // P6: Congruent > incongruent survival for marginal bridges, CI excludes zero
  const p6Pass = significantlyHigherCong;
  predictions.push({
    id: 6,
    description: "Congruent > incongruent survival for marginal bridges, CI excludes zero",
    result:
      marginalCongruentSurvivals.length > 0 && marginalIncongruentSurvivals.length > 0
        ? (p6Pass ? "confirmed" : "not confirmed")
        : "insufficient data",
    value: `diff=${congVsIncongDiff.toFixed(3)} [${congVsIncongCI[0].toFixed(3)}, ${congVsIncongCI[1].toFixed(3)}]`,
  });

  // P7: Dominant bridges: congruent approx equal to incongruent (within 0.10)
  const dominantCongSurvivals: number[] = [];
  const dominantIncongSurvivals: number[] = [];
  for (const pr of pairResults) {
    if (pr.unconstrainedFreq <= 0.60) continue;
    const cong = pr.perCondition.find((c) => c.condition === "congruent");
    const incong = pr.perCondition.find((c) => c.condition === "incongruent");
    if (cong) dominantCongSurvivals.push(cong.survivalRate);
    if (incong) dominantIncongSurvivals.push(incong.survivalRate);
  }
  const domCongMean = dominantCongSurvivals.length > 0 ? mean(dominantCongSurvivals) : 0;
  const domIncongMean = dominantIncongSurvivals.length > 0 ? mean(dominantIncongSurvivals) : 0;
  const domDiff = Math.abs(domCongMean - domIncongMean);
  const p7Pass =
    dominantCongSurvivals.length > 0 &&
    dominantIncongSurvivals.length > 0 &&
    domDiff <= 0.10;
  predictions.push({
    id: 7,
    description: "Dominant bridges: congruent approx equal to incongruent (within 0.10)",
    result:
      dominantCongSurvivals.length > 0 && dominantIncongSurvivals.length > 0
        ? (p7Pass ? "confirmed" : "not confirmed")
        : "insufficient data",
    value: `cong=${domCongMean.toFixed(3)}, incong=${domIncongMean.toFixed(3)}, diff=${domDiff.toFixed(3)}`,
  });

  // P8: Neutral pre-fills: displacement for dominant, near-unity for marginal
  const p8DominantDisplacement = dominantNeutralSurvival < 1.0;
  const p8MarginalNearUnity =
    marginalNeutralSurvival >= 0.80 && marginalNeutralSurvival <= 1.20;
  const p8Pass = p8DominantDisplacement && p8MarginalNearUnity;
  predictions.push({
    id: 8,
    description: "Neutral pre-fills: displacement for dominant (<1.0), near-unity for marginal (0.80-1.20)",
    result:
      dominantNeutralSurvivals.length > 0 && marginalNeutralSurvivals.length > 0
        ? (p8Pass ? "confirmed" : "not confirmed")
        : "insufficient data",
    value: `dominant=${dominantNeutralSurvival.toFixed(3)}, marginal=${marginalNeutralSurvival.toFixed(3)}`,
  });

  // P9: Facilitation is model-general: >=3/4 models show survival >1.0 for >=1 marginal bridge under congruent
  const modelsWithFacilitation = perModelFacilitation.filter(
    (pmf) => pmf.marginalFacilitationCount >= 1,
  ).length;
  const p9Pass = modelsWithFacilitation >= 3;
  predictions.push({
    id: 9,
    description: "Facilitation is model-general: >=3/4 models show survival >1.0 for >=1 marginal bridge",
    result: marginalPairIds.length > 0 && modelIds.length >= 4
      ? (p9Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `${modelsWithFacilitation}/${modelIds.length} models show facilitation`,
  });

  // P10: Phase 7A survival within 0.15 of Phase 9C for pairs 1-8
  const replicatingCount = phase7AComparison.filter((c) => c.replicates).length;
  const totalComparisons = phase7AComparison.length;
  const p10Pass = totalComparisons > 0 && replicatingCount === totalComparisons;
  predictions.push({
    id: 10,
    description: "Phase 7A survival within 0.15 of Phase 9C for pairs 1-8",
    result: totalComparisons > 0
      ? (p10Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `${replicatingCount}/${totalComparisons} replicate`,
  });

  for (const pred of predictions) {
    console.log(`  P${pred.id}: ${pred.result} -- ${pred.value}`);
  }
  console.log("");

  // ── Build Output ───────────────────────────────────────────────────

  const analysisOutput: FacilitationAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      pairs: PHASE9C_PAIRS.map((p) => p.id),
      models: MODELS.map((m) => m.id),
      conditions: ["unconstrained", "congruent", "incongruent", "neutral"],
      totalNewRuns: totalNewRuns,
      totalReusedRuns: totalReusedRuns,
    },
    pairResults,
    crossoverRegression,
    crossoverPoint,
    congruentVsIncongruent,
    neutralBaseline,
    phase7AComparison,
    perModelFacilitation,
    pilotVerification,
    predictions,
  };

  // ── Write Outputs ──────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "09c-facilitation.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Pre-fill facilitation analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("facilitation-analysis")
    .description("Analyze pre-fill facilitation crossover from Phase 9C data")
    .option("--input <dir>", "base results directory", "results")
    .option("--output <dir>", "output directory for analysis JSON", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/09c-facilitation.md");

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
