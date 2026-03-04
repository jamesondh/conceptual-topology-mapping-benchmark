#!/usr/bin/env bun
/**
 * Phase 6B: Forced-Crossing Asymmetry Analysis
 *
 * For each Phase 6B pair x model, computes:
 * - Asymmetry index (1 - mean cross-direction Jaccard)
 * - Forced-crossing vs same-axis comparison (primary test)
 * - Comparison with Phase 2 baseline (0.811)
 * - Bridge positional consistency in forward vs reverse paths
 * - Per-model analysis (Gemini expected no reduction)
 *
 * Loads data from:
 *   results/forced-crossing/   (Phase 6B forward + reverse 7-waypoint runs)
 *
 * Usage:
 *   bun run analysis/06b-forced-crossing.ts
 *   bun run analysis/06b-forced-crossing.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  seededRandom,
  bootstrapCI,
  mean,
  crossDirectionJaccards,
  bootstrapCIFromRuns,
  bridgeConceptMatchesExported,
} from "../src/metrics.ts";
import { computeJaccard } from "../src/canonicalize.ts";
import { MODELS } from "../src/data/pairs.ts";
import { PHASE6B_PAIRS } from "../src/data/pairs-phase6.ts";
import type {
  ForcedCrossingAnalysisOutput,
  ForcedCrossingAsymmetryResult,
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

// ── Bridge Position Analysis ──────────────────────────────────────

/**
 * Find the mean position of a bridge concept across a set of runs.
 * Returns null if bridge never appears.
 */
function meanBridgePosition(
  runs: string[][],
  bridge: string,
): number | null {
  const bridgeLower = bridge.toLowerCase();
  const positions: number[] = [];

  for (const run of runs) {
    for (let pos = 0; pos < run.length; pos++) {
      if (bridgeConceptMatchesExported(run[pos].toLowerCase(), bridgeLower)) {
        positions.push(pos);
        break; // First occurrence in this run
      }
    }
  }

  if (positions.length === 0) return null;
  return mean(positions);
}

/**
 * Find which bridge concepts appear in a set of runs.
 */
function findBridgesInRuns(
  runs: string[][],
  bridge: string,
): string[] {
  const bridgeLower = bridge.toLowerCase();
  const found = new Set<string>();

  for (const run of runs) {
    for (const wp of run) {
      if (bridgeConceptMatchesExported(wp.toLowerCase(), bridgeLower)) {
        found.add(wp);
      }
    }
  }

  return Array.from(found);
}

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: ForcedCrossingAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 6B: Forced-Crossing Asymmetry Test Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Pairs analyzed:** ${output.metadata.pairs.length}`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **Total runs loaded:** ${output.metadata.totalRuns}`);
  lines.push(`- **Asymmetry results computed:** ${output.pairModelResults.length}`);
  lines.push("");

  // 2. Per-Pair Asymmetry
  lines.push("## 2. Per-Pair Asymmetry Index");
  lines.push("");
  lines.push("| Pair | Type | Model | Asymmetry | 95% CI | Fwd Runs | Rev Runs |");
  lines.push("|------|------|-------|-----------|--------|----------|----------|");

  for (const result of output.pairModelResults) {
    lines.push(
      `| ${result.pairId} | ${result.pairType} | ${result.modelId} | ${result.asymmetryIndex.toFixed(3)} | [${result.asymmetryIndexCI[0].toFixed(3)}, ${result.asymmetryIndexCI[1].toFixed(3)}] | ${result.forwardRunCount} | ${result.reverseRunCount} |`,
    );
  }
  lines.push("");

  // 3. Primary Test
  lines.push("## 3. Primary Test: Forced-Crossing vs Same-Axis");
  lines.push("");
  const pt = output.primaryTest;
  lines.push(`- **Forced-crossing mean asymmetry:** ${pt.forcedCrossingMeanAsymmetry.toFixed(3)} [${pt.forcedCrossingAsymmetryCI[0].toFixed(3)}, ${pt.forcedCrossingAsymmetryCI[1].toFixed(3)}]`);
  lines.push(`- **Same-axis mean asymmetry:** ${pt.sameAxisMeanAsymmetry.toFixed(3)} [${pt.sameAxisAsymmetryCI[0].toFixed(3)}, ${pt.sameAxisAsymmetryCI[1].toFixed(3)}]`);
  lines.push(`- **Difference (FC - SA):** ${pt.difference.toFixed(3)} [${pt.differenceCI[0].toFixed(3)}, ${pt.differenceCI[1].toFixed(3)}]`);
  lines.push(`- **Significantly lower:** ${pt.significantlyLower ? "**YES**" : "**NO**"}`);
  lines.push("");

  if (pt.significantlyLower) {
    lines.push("**[observed]** Forced-crossing pairs show significantly lower asymmetry than same-axis " +
      "pairs, consistent with the bottleneck model: when only one route exists between A and C, " +
      "forward and reverse paths must traverse the same bottleneck, producing higher bidirectional overlap.");
  } else {
    lines.push("The primary pre-registered test does not pass. The difference in asymmetry between " +
      "forced-crossing and same-axis pairs is not statistically significant (95% CI includes zero).");
  }
  lines.push("");

  // 4. Secondary Test
  lines.push("## 4. Secondary Test: vs Phase 2 Baseline (0.811)");
  lines.push("");
  const sb = output.secondaryBaseline;
  lines.push(`- **Forced-crossing mean asymmetry:** ${sb.forcedCrossingMeanAsymmetry.toFixed(3)}`);
  lines.push(`- **Phase 2 baseline:** ${sb.phase2Baseline.toFixed(3)}`);
  lines.push(`- **Difference:** ${sb.difference.toFixed(3)} [${sb.differenceCI[0].toFixed(3)}, ${sb.differenceCI[1].toFixed(3)}]`);
  lines.push(`- **Note:** Phase 2 used 5 waypoints; Phase 6 uses 7 waypoints (approximate comparison)`);
  lines.push("");

  // 5. Per-Model Analysis
  lines.push("## 5. Per-Model Analysis");
  lines.push("");
  lines.push("| Model | FC Mean Asymmetry | SA Mean Asymmetry | Reduction |");
  lines.push("|-------|-------------------|-------------------|-----------|");

  for (const pm of output.perModelAnalysis) {
    lines.push(
      `| ${pm.modelId} | ${pm.forcedCrossingMeanAsymmetry.toFixed(3)} | ${pm.sameAxisMeanAsymmetry.toFixed(3)} | ${pm.reduction.toFixed(3)} |`,
    );
  }
  lines.push("");

  // Gemini-specific analysis
  const geminiAnalysis = output.perModelAnalysis.find(pm => pm.modelId === "gemini");
  const nonGeminiAnalyses = output.perModelAnalysis.filter(pm => pm.modelId !== "gemini");
  if (geminiAnalysis && nonGeminiAnalyses.length > 0) {
    const nonGeminiMeanReduction = mean(nonGeminiAnalyses.map(pm => pm.reduction));
    lines.push(`- **Gemini reduction:** ${geminiAnalysis.reduction.toFixed(3)}`);
    lines.push(`- **Non-Gemini mean reduction:** ${nonGeminiMeanReduction.toFixed(3)}`);
    lines.push("");

    if (Math.abs(geminiAnalysis.reduction) < Math.abs(nonGeminiMeanReduction) * 0.5) {
      lines.push("**[observed]** Gemini shows minimal asymmetry reduction on forced-crossing pairs, " +
        "consistent with the prediction that bridge activation (not mere polysemy) drives asymmetry reduction.");
    }
  }
  lines.push("");

  // 6. Bridge Positional Consistency
  lines.push("## 6. Bridge Positional Consistency");
  lines.push("");
  const bpc = output.bridgePositionalConsistency;
  lines.push(`- **Consistent fraction (+/-1 position):** ${bpc.consistentFraction.toFixed(3)} (${bpc.totalPairsAnalyzed} pair/model combos analyzed)`);
  lines.push("");

  // 7. Predictions
  lines.push("## 7. Predictions Summary");
  lines.push("");
  lines.push("| # | Prediction | Result |");
  lines.push("|---|------------|--------|");

  // P1: FC pairs 1-3 mean asymmetry 0.50-0.70
  const bankFCResults = output.pairModelResults.filter(r =>
    ["p6b-loan-shore", "p6b-deposit-river", "p6b-savings-cliff"].includes(r.pairId) &&
    r.pairType === "forced-crossing"
  );
  const bankFCMean = bankFCResults.length > 0 ? mean(bankFCResults.map(r => r.asymmetryIndex)) : 0;
  lines.push(`| 1 | Bank-mediated FC asymmetry 0.50-0.70 | ${bankFCMean.toFixed(3)} (${bankFCMean >= 0.50 && bankFCMean <= 0.70 ? "IN RANGE" : "OUT OF RANGE"}) |`);

  // P2: Pair 4 (photon-heavy) baseline asymmetry
  const photonResults = output.pairModelResults.filter(r => r.pairId === "p6b-photon-heavy");
  const photonMean = photonResults.length > 0 ? mean(photonResults.map(r => r.asymmetryIndex)) : 0;
  lines.push(`| 2 | Photon-heavy asymmetry 0.75-0.90 (baseline) | ${photonMean.toFixed(3)} (${photonMean >= 0.75 && photonMean <= 0.90 ? "IN RANGE" : "OUT OF RANGE"}) |`);

  // P3: Same-axis asymmetry not different from 0.811
  const saResults = output.pairModelResults.filter(r => r.pairType === "same-axis");
  const saMean = saResults.length > 0 ? mean(saResults.map(r => r.asymmetryIndex)) : 0;
  lines.push(`| 3 | Same-axis asymmetry ~0.811 (baseline) | ${saMean.toFixed(3)} |`);

  // P4: Gemini no FC reduction
  if (geminiAnalysis) {
    lines.push(`| 4 | Gemini shows no FC asymmetry reduction | reduction=${geminiAnalysis.reduction.toFixed(3)} (${Math.abs(geminiAnalysis.reduction) < 0.05 ? "CONFIRMED" : "NOT CONFIRMED"}) |`);
  }

  // P5: Bridge position consistent
  lines.push(`| 5 | Bridge at +/-1 position in >70% of runs | ${(bpc.consistentFraction * 100).toFixed(0)}% (${bpc.consistentFraction > 0.70 ? "CONFIRMED" : "NOT CONFIRMED"}) |`);

  // P6: Claude lowest FC asymmetry
  const claudeFC = output.perModelAnalysis.find(pm => pm.modelId === "claude");
  const lowestFC = output.perModelAnalysis.reduce((min, pm) =>
    pm.forcedCrossingMeanAsymmetry < min.forcedCrossingMeanAsymmetry ? pm : min
  );
  lines.push(`| 6 | Claude lowest FC asymmetry | lowest=${lowestFC.modelId} (${lowestFC.forcedCrossingMeanAsymmetry.toFixed(3)}) |`);

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

  console.log("Conceptual Topology Mapping Benchmark - Forced-Crossing Asymmetry Analysis");
  console.log("==========================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data ─────────────────────────────────────────────────────

  console.log("Loading forced-crossing data...");
  const fcDir = join(inputDir, "forced-crossing");
  const allResults = await loadResultsFromDir(fcDir);
  console.log(`  Loaded ${allResults.length} results from ${fcDir}/`);
  console.log("");

  const lookup = buildWaypointLookup(allResults);
  console.log(`  Lookup keys: ${lookup.size}`);
  console.log("");

  // ── Compute asymmetry per pair x model ────────────────────────────

  console.log("Computing asymmetry metrics...");
  const pairModelResults: ForcedCrossingAsymmetryResult[] = [];
  const modelIds = MODELS.map(m => m.id);

  for (const pair of PHASE6B_PAIRS) {
    for (const modelId of modelIds) {
      const fwdKey = `${pair.id}--fwd::${modelId}`;
      const revKey = `${pair.id}--rev::${modelId}`;

      const fwdResults = lookup.get(fwdKey) ?? [];
      const revResults = lookup.get(revKey) ?? [];

      if (fwdResults.length === 0 || revResults.length === 0) {
        console.log(`  SKIP ${pair.id} (${modelId}): missing directions — fwd:${fwdResults.length} rev:${revResults.length}`);
        continue;
      }

      const fwdRuns = waypointsOnly(fwdResults);
      const revRuns = waypointsOnly(revResults);

      // Compute cross-direction Jaccard
      const jaccards = crossDirectionJaccards(fwdRuns, revRuns);
      const meanJaccard = mean(jaccards);
      const asymmetryIndex = 1 - meanJaccard;

      // Bootstrap CI at the run level to avoid pseudoreplication
      const jaccardCI = bootstrapCIFromRuns(fwdRuns, revRuns, (fwd, rev) => {
        return mean(crossDirectionJaccards(fwd, rev));
      });
      const asymmetryCI: [number, number] = [1 - jaccardCI[1], 1 - jaccardCI[0]];

      // Bridge analysis
      let bridgeInForward: string[] = [];
      let bridgeInReverse: string[] = [];
      let bridgePositionForward: number | null = null;
      let bridgePositionReverse: number | null = null;
      let bridgePositionConsistent: boolean | null = null;

      if (pair.bridge) {
        bridgeInForward = findBridgesInRuns(fwdRuns, pair.bridge);
        bridgeInReverse = findBridgesInRuns(revRuns, pair.bridge);
        bridgePositionForward = meanBridgePosition(fwdRuns, pair.bridge);
        bridgePositionReverse = meanBridgePosition(revRuns, pair.bridge);

        if (bridgePositionForward !== null && bridgePositionReverse !== null) {
          bridgePositionConsistent = Math.abs(bridgePositionForward - bridgePositionReverse) <= 1.0;
        }
      }

      const result: ForcedCrossingAsymmetryResult = {
        pairId: pair.id,
        modelId,
        pairType: pair.pairType,
        asymmetryIndex,
        asymmetryIndexCI: asymmetryCI,
        forwardRunCount: fwdRuns.length,
        reverseRunCount: revRuns.length,
        bridgeInForward,
        bridgeInReverse,
        bridgePositionForward,
        bridgePositionReverse,
        bridgePositionConsistent,
      };

      pairModelResults.push(result);

      console.log(
        `  ${pair.id} (${modelId}, ${pair.pairType}): asymmetry=${asymmetryIndex.toFixed(3)} ` +
        `[${asymmetryCI[0].toFixed(3)}, ${asymmetryCI[1].toFixed(3)}] ` +
        `runs=${fwdRuns.length}fwd+${revRuns.length}rev` +
        (pair.bridge ? ` bridge_pos_fwd=${bridgePositionForward?.toFixed(1) ?? 'N/A'} rev=${bridgePositionReverse?.toFixed(1) ?? 'N/A'}` : "")
      );
    }
  }
  console.log("");
  console.log(`Computed ${pairModelResults.length} asymmetry results`);
  console.log("");

  // ── Primary test: forced-crossing vs same-axis ────────────────────

  console.log("Computing primary test (forced-crossing vs same-axis)...");

  const fcAsymmetries = pairModelResults
    .filter(r => r.pairType === "forced-crossing")
    .map(r => r.asymmetryIndex);
  const saAsymmetries = pairModelResults
    .filter(r => r.pairType === "same-axis")
    .map(r => r.asymmetryIndex);

  const fcMean = mean(fcAsymmetries);
  const saMean = mean(saAsymmetries);
  const fcCI = bootstrapCI(fcAsymmetries);
  const saCI = bootstrapCI(saAsymmetries);

  // Bootstrap CI on difference
  const nBootstrap = 1000;
  const bootstrapDiffs: number[] = [];
  for (let i = 0; i < nBootstrap; i++) {
    const sampleFC: number[] = [];
    for (let j = 0; j < fcAsymmetries.length; j++) {
      sampleFC.push(fcAsymmetries[Math.floor(seededRandom() * fcAsymmetries.length)]);
    }
    const sampleSA: number[] = [];
    for (let j = 0; j < saAsymmetries.length; j++) {
      sampleSA.push(saAsymmetries[Math.floor(seededRandom() * saAsymmetries.length)]);
    }
    bootstrapDiffs.push(mean(sampleFC) - mean(sampleSA));
  }
  bootstrapDiffs.sort((a, b) => a - b);
  const differenceCI: [number, number] = [
    bootstrapDiffs[Math.floor(nBootstrap * 0.025)],
    bootstrapDiffs[Math.floor(nBootstrap * 0.975)],
  ];
  const difference = fcMean - saMean;
  const significantlyLower = differenceCI[1] < 0; // Upper bound below zero

  console.log(`  FC mean: ${fcMean.toFixed(3)} [${fcCI[0].toFixed(3)}, ${fcCI[1].toFixed(3)}]`);
  console.log(`  SA mean: ${saMean.toFixed(3)} [${saCI[0].toFixed(3)}, ${saCI[1].toFixed(3)}]`);
  console.log(`  Difference: ${difference.toFixed(3)} [${differenceCI[0].toFixed(3)}, ${differenceCI[1].toFixed(3)}]`);
  console.log(`  Significantly lower: ${significantlyLower}`);
  console.log("");

  // ── Secondary: vs Phase 2 baseline ────────────────────────────────

  console.log("Computing secondary test (vs Phase 2 baseline 0.811)...");
  const phase2Baseline = 0.811;
  const baselineDiffs = fcAsymmetries.map(a => a - phase2Baseline);
  const baselineDiffCI = bootstrapCI(baselineDiffs);
  const baselineDifference = fcMean - phase2Baseline;

  console.log(`  FC mean: ${fcMean.toFixed(3)}, baseline: ${phase2Baseline}`);
  console.log(`  Difference: ${baselineDifference.toFixed(3)} [${baselineDiffCI[0].toFixed(3)}, ${baselineDiffCI[1].toFixed(3)}]`);
  console.log("");

  // ── Per-model analysis ────────────────────────────────────────────

  console.log("Computing per-model analysis...");
  const perModelAnalysis: ForcedCrossingAnalysisOutput["perModelAnalysis"] = [];

  for (const model of MODELS) {
    const modelFC = pairModelResults.filter(r => r.modelId === model.id && r.pairType === "forced-crossing");
    const modelSA = pairModelResults.filter(r => r.modelId === model.id && r.pairType === "same-axis");

    // Skip models with no data in either category (avoid zero-filling bias)
    if (modelFC.length === 0 && modelSA.length === 0) {
      console.log(`  ${model.id}: SKIP (no data)`);
      continue;
    }

    const modelFCMean = modelFC.length > 0 ? mean(modelFC.map(r => r.asymmetryIndex)) : NaN;
    const modelSAMean = modelSA.length > 0 ? mean(modelSA.map(r => r.asymmetryIndex)) : NaN;
    const reduction = (!isNaN(modelFCMean) && !isNaN(modelSAMean)) ? modelSAMean - modelFCMean : NaN;

    perModelAnalysis.push({
      modelId: model.id,
      forcedCrossingMeanAsymmetry: isNaN(modelFCMean) ? 0 : modelFCMean,
      sameAxisMeanAsymmetry: isNaN(modelSAMean) ? 0 : modelSAMean,
      reduction: isNaN(reduction) ? 0 : reduction,
    });

    console.log(`  ${model.id}: FC=${isNaN(modelFCMean) ? "N/A" : modelFCMean.toFixed(3)}, SA=${isNaN(modelSAMean) ? "N/A" : modelSAMean.toFixed(3)}, reduction=${isNaN(reduction) ? "N/A" : reduction.toFixed(3)}`);
  }
  console.log("");

  // ── Bridge positional consistency ─────────────────────────────────

  console.log("Computing bridge positional consistency...");
  const fcWithBridge = pairModelResults.filter(r =>
    r.pairType === "forced-crossing" && r.bridgePositionConsistent !== null
  );
  const consistentCount = fcWithBridge.filter(r => r.bridgePositionConsistent === true).length;
  const consistentFraction = fcWithBridge.length > 0 ? consistentCount / fcWithBridge.length : 0;

  console.log(`  Consistent: ${consistentCount}/${fcWithBridge.length} = ${(consistentFraction * 100).toFixed(0)}%`);
  console.log("");

  // ── Build Output ───────────────────────────────────────────────────

  const analysisOutput: ForcedCrossingAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      pairs: PHASE6B_PAIRS.map(p => p.id),
      models: MODELS.map(m => m.id),
      totalRuns: allResults.length,
    },
    pairModelResults,
    primaryTest: {
      forcedCrossingMeanAsymmetry: fcMean,
      forcedCrossingAsymmetryCI: fcCI,
      sameAxisMeanAsymmetry: saMean,
      sameAxisAsymmetryCI: saCI,
      difference,
      differenceCI,
      significantlyLower,
    },
    secondaryBaseline: {
      forcedCrossingMeanAsymmetry: fcMean,
      phase2Baseline,
      difference: baselineDifference,
      differenceCI: baselineDiffCI,
    },
    perModelAnalysis,
    bridgePositionalConsistency: {
      consistentFraction,
      totalPairsAnalyzed: fcWithBridge.length,
    },
  };

  // ── Write Outputs ──────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "forced-crossing-metrics.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Forced-crossing asymmetry analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("forced-crossing-analysis")
    .description("Analyze forced-crossing asymmetry from Phase 6B data")
    .option("--input <dir>", "base results directory", "results")
    .option("--output <dir>", "output directory for analysis JSON", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/06b-forced-crossing.md");

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
