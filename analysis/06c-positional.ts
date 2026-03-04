#!/usr/bin/env bun
/**
 * Phase 6C: Positional Bridge Scanning Analysis
 *
 * For each Phase 6C pair x model, computes:
 * - Per-position bridge frequency (7 positions)
 * - Peak-detection W-shape contrast (vs fixed midpoint)
 * - Modal bridge position
 * - Cross-model positional agreement
 * - Forced-crossing vs non-forced positional variance
 *
 * Loads data from:
 *   results/convergence/     (Phase 5C reuse pairs)
 *   results/positional/      (new Phase 6C pairs)
 *   results/forced-crossing/ (forced-crossing pairs from Part B)
 *
 * Usage:
 *   bun run analysis/06c-positional.ts
 *   bun run analysis/06c-positional.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  seededRandom,
  bootstrapCI,
  mean,
  computePerPositionBridgeFreq,
  computePeakDetectionContrast,
  computePositionalVariance,
  pearsonCorrelation,
} from "../src/metrics.ts";
import { MODELS } from "../src/data/pairs.ts";
import { PHASE6C_PAIRS, PHASE6C_TO_5C_MAP } from "../src/data/pairs-phase6.ts";
import type {
  PositionalAnalysisOutput,
  PositionalBridgeProfile,
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

// ── Expected position to numeric ──────────────────────────────────

function expectedPositionToNumeric(pos: string): number {
  // "early (2-3)" → 1.5, "middle (3-5)" → 3, "late (4-6)" → 4
  // Positions in the spec are 1-indexed; convert to 0-indexed to match modalPosition
  const match = pos.match(/\((\d+)-(\d+)\)/);
  if (match) {
    return (parseInt(match[1]) + parseInt(match[2])) / 2 - 1; // subtract 1 for 0-indexing
  }
  return 3; // default to middle (0-indexed position 3 of 7)
}

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: PositionalAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 6C: Positional Bridge Scanning Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Pairs analyzed:** ${output.metadata.pairs.length}`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **New runs:** ${output.metadata.totalNewRuns}`);
  lines.push(`- **Reused runs:** ${output.metadata.totalReusedRuns}`);
  lines.push(`- **Positional profiles computed:** ${output.profiles.length}`);
  lines.push("");

  // 2. Per-Pair Positional Profiles
  lines.push("## 2. Per-Pair Positional Bridge Profiles");
  lines.push("");
  lines.push("| Pair | Model | Bridge | Modal Pos | Modal Freq | Peak Contrast | Fixed-Mid Contrast | Runs |");
  lines.push("|------|-------|--------|-----------|-----------|--------------|-------------------|------|");

  for (const profile of output.profiles) {
    lines.push(
      `| ${profile.pairId} | ${profile.modelId} | ${profile.knownBridge} | ${profile.modalPosition} | ${profile.modalFrequency.toFixed(3)} | ${profile.peakDetectionContrast.toFixed(4)} | ${profile.fixedMidpointContrast.toFixed(4)} | ${profile.runCount} |`,
    );
  }
  lines.push("");

  // 3. Primary Test
  lines.push("## 3. Primary Test: Peak-Detection vs Fixed-Midpoint Contrast");
  lines.push("");
  const pt = output.primaryTest;
  lines.push(`- **Peak-detection mean contrast:** ${pt.peakDetectionMeanContrast.toFixed(4)} [${pt.peakDetectionContrastCI[0].toFixed(4)}, ${pt.peakDetectionContrastCI[1].toFixed(4)}]`);
  lines.push(`- **Fixed-midpoint mean contrast:** ${pt.fixedMidpointMeanContrast.toFixed(4)} [${pt.fixedMidpointContrastCI[0].toFixed(4)}, ${pt.fixedMidpointContrastCI[1].toFixed(4)}]`);
  lines.push(`- **Difference (peak - fixed):** ${pt.difference.toFixed(4)} [${pt.differenceCI[0].toFixed(4)}, ${pt.differenceCI[1].toFixed(4)}]`);
  lines.push(`- **Peak-detection significantly positive:** ${pt.significantlyPositive ? "**YES**" : "**NO**"}`);
  lines.push("");

  if (pt.significantlyPositive) {
    lines.push("**[observed]** Peak-detection W-shape contrast is significantly positive for bridge-present " +
      "pairs, and exceeds the fixed-midpoint contrast. The rigid midpoint assumption in Phase 5C was " +
      "obscuring a real positional signal.");
  } else {
    lines.push("The primary pre-registered test does not pass. Peak-detection contrast is not " +
      "significantly positive or does not exceed fixed-midpoint contrast.");
  }
  lines.push("");

  // 4. Positional Prediction
  lines.push("## 4. Positional Prediction from Expected Position");
  lines.push("");
  const pp = output.positionalPrediction;
  if (pp.correlationR !== null) {
    lines.push(`- **Correlation (r):** ${pp.correlationR.toFixed(3)}`);
    lines.push(`- **p-value:** ${pp.correlationP !== null ? pp.correlationP.toFixed(4) : "N/A"}`);
    lines.push("");
    lines.push("| Pair | Expected Position Ratio | Modal Position |");
    lines.push("|------|------------------------|----------------|");
    for (const dp of pp.dataPoints) {
      lines.push(`| ${dp.pairId} | ${dp.semanticDistanceRatio.toFixed(2)} | ${dp.modalPosition} |`);
    }
  } else {
    lines.push("_Insufficient data for positional prediction regression._");
  }
  lines.push("");

  // 5. Cross-Model Agreement
  lines.push("## 5. Cross-Model Positional Agreement");
  lines.push("");
  lines.push("| Pair | Modal Positions | SD | Determination |");
  lines.push("|------|-----------------|-----|---------------|");

  for (const agreement of output.crossModelPositionalAgreement) {
    const posStr = agreement.modalPositions.map(mp => `${mp.modelId}:${mp.position}`).join(", ");
    const determination = agreement.pairDetermined ? "pair-determined" : "model-dependent";
    lines.push(`| ${agreement.pairId} | ${posStr} | ${agreement.positionSD.toFixed(2)} | ${determination} |`);
  }
  lines.push("");

  // 6. Forced-Crossing Positional Analysis
  lines.push("## 6. Forced-Crossing Positional Analysis");
  lines.push("");
  if (output.forcedCrossingPositional) {
    const fcp = output.forcedCrossingPositional;
    lines.push(`- **Forced-crossing positional SD:** ${fcp.forcedCrossingPositionSD.toFixed(2)}`);
    lines.push(`- **Non-forced positional SD:** ${fcp.nonForcedPositionSD.toFixed(2)}`);
    lines.push(`- **Forced lower variance:** ${fcp.forcedLowerVariance ? "**YES**" : "**NO**"}`);
    lines.push("");

    if (fcp.forcedLowerVariance) {
      lines.push("**[observed]** Forced-crossing bridges show lower positional variance than non-forced bridges, " +
        "consistent with the bottleneck constraining not just which concept but where it appears.");
    }
  } else {
    lines.push("_Insufficient data for forced-crossing positional analysis._");
  }
  lines.push("");

  // 7. Predictions
  lines.push("## 7. Predictions Summary");
  lines.push("");
  lines.push("| # | Prediction | Result |");
  lines.push("|---|------------|--------|");

  // P1: Peak contrast > 0.05
  lines.push(`| 1 | Peak-detection contrast > 0.05, CI excludes zero | ${pt.peakDetectionMeanContrast > 0.05 && pt.peakDetectionContrastCI[0] > 0 ? "CONFIRMED" : "NOT CONFIRMED"} (${pt.peakDetectionMeanContrast.toFixed(4)}) |`);

  // P2: Peak > fixed by 0.03
  lines.push(`| 2 | Peak exceeds fixed-midpoint by >=0.03 | ${pt.difference >= 0.03 ? "CONFIRMED" : "NOT CONFIRMED"} (diff=${pt.difference.toFixed(4)}) |`);

  // P3-P5: Position predictions
  const sunDesertProfile = output.profiles.find(p => p.pairId === "p6c-sun-desert" || p.pairId === "p5c-sun-desert");
  if (sunDesertProfile) {
    lines.push(`| 3 | Heat at positions 2-3 on sun->desert | modal=${sunDesertProfile.modalPosition} (${sunDesertProfile.modalPosition >= 1 && sunDesertProfile.modalPosition <= 2 ? "IN RANGE" : "OUT"}) |`);
  }

  const seedGardenProfile = output.profiles.find(p => p.pairId === "p6c-seed-garden");
  if (seedGardenProfile) {
    lines.push(`| 4 | Germination at positions 3-5 on seed->garden | modal=${seedGardenProfile.modalPosition} (${seedGardenProfile.modalPosition >= 2 && seedGardenProfile.modalPosition <= 4 ? "IN RANGE" : "OUT"}) |`);
  }

  const emotionProfile = output.profiles.find(p => p.pairId === "p6c-emotion-melancholy");
  if (emotionProfile) {
    lines.push(`| 5 | Sadness at positions 4-6 on emotion->melancholy | modal=${emotionProfile.modalPosition} (${emotionProfile.modalPosition >= 3 && emotionProfile.modalPosition <= 5 ? "IN RANGE" : "OUT"}) |`);
  }

  // P6: Correlation > 0.50
  lines.push(`| 6 | Modal position correlates with distance ratio (r > 0.50) | ${pp.correlationR !== null ? `r=${pp.correlationR.toFixed(3)}` : "N/A"} |`);

  // P7: Forced-crossing SD < 0.8
  if (output.forcedCrossingPositional) {
    lines.push(`| 7 | FC bridge SD < 0.8 | SD=${output.forcedCrossingPositional.forcedCrossingPositionSD.toFixed(2)} (${output.forcedCrossingPositional.forcedCrossingPositionSD < 0.8 ? "CONFIRMED" : "NOT CONFIRMED"}) |`);
  }

  // P8: Claude lowest positional variance
  const modelVariances = MODELS.map(m => {
    const modelProfiles = output.profiles.filter(p => p.modelId === m.id);
    const positions = modelProfiles.map(p => p.modalPosition);
    return { modelId: m.id, variance: positions.length >= 2 ? computePositionalVariance(positions) : 999 };
  }).filter(mv => mv.variance < 999).sort((a, b) => a.variance - b.variance);
  if (modelVariances.length > 0) {
    lines.push(`| 8 | Claude lowest positional variance | lowest=${modelVariances[0].modelId} (${modelVariances[0].variance.toFixed(2)}) |`);
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

  console.log("Conceptual Topology Mapping Benchmark - Positional Bridge Scanning Analysis");
  console.log("===========================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data from multiple sources ─────────────────────────────

  console.log("Loading data from multiple sources...");

  // Phase 5C convergence data (for reuse pairs)
  const convergenceDir = join(inputDir, "convergence");
  const convergenceResults = await loadResultsFromDir(convergenceDir);
  console.log(`  Convergence (5C): ${convergenceResults.length} results`);

  // Phase 6C positional data (new runs)
  const positionalDir = join(inputDir, "positional");
  const positionalResults = await loadResultsFromDir(positionalDir);
  console.log(`  Positional (6C):  ${positionalResults.length} results`);

  // Phase 6B forced-crossing data (for forced-crossing pairs)
  const fcDir = join(inputDir, "forced-crossing");
  const fcResults = await loadResultsFromDir(fcDir);
  console.log(`  Forced-crossing (6B): ${fcResults.length} results`);
  console.log("");

  // Build unified lookup
  const allResults = [...convergenceResults, ...positionalResults, ...fcResults];
  const lookup = buildWaypointLookup(allResults);
  console.log(`  Total lookup keys: ${lookup.size}`);
  console.log("");

  // ── Compute positional profiles per pair x model ────────────────

  const WAYPOINT_COUNT = 7;
  const modelIds = MODELS.map(m => m.id);

  console.log("Computing positional bridge profiles...");
  const profiles: PositionalBridgeProfile[] = [];
  let totalReusedRuns = 0;
  const totalNewRuns = positionalResults.length;

  for (const pair of PHASE6C_PAIRS) {
    if (!pair.knownBridge) continue; // Skip pairs without known bridges

    for (const modelId of modelIds) {
      // Determine the lookup key based on data source
      let fwdKey: string;

      if (pair.source === "reuse-5c") {
        // Map to Phase 5C pair ID
        const p5cId = PHASE6C_TO_5C_MAP[pair.id];
        if (!p5cId) {
          console.log(`  SKIP ${pair.id}: no 5C mapping`);
          continue;
        }
        fwdKey = `${p5cId}--fwd::${modelId}`;
      } else if (pair.source === "forced-crossing") {
        // Merge Phase 6C positional data with 6B forced-crossing data
        const p6cKey = `${pair.id}--fwd::${modelId}`;
        const p6bKey = `${pair.id.replace("p6c-", "p6b-")}--fwd::${modelId}`;
        const p6cResults = lookup.get(p6cKey) ?? [];
        const p6bResults = lookup.get(p6bKey) ?? [];

        // Merge both sources into the lookup under the p6c key
        if (p6bResults.length > 0 && p6cResults.length === 0) {
          lookup.set(p6cKey, p6bResults);
        } else if (p6bResults.length > 0) {
          lookup.set(p6cKey, [...p6cResults, ...p6bResults]);
        }
        fwdKey = p6cKey;
      } else {
        // position-contrast: use Phase 6C pair IDs
        fwdKey = `${pair.id}--fwd::${modelId}`;
      }

      const fwdResults = lookup.get(fwdKey) ?? [];

      if (fwdResults.length === 0) {
        console.log(`  SKIP ${pair.id} (${modelId}): no forward data (tried key: ${fwdKey})`);
        continue;
      }

      if (pair.source === "reuse-5c" || pair.source === "forced-crossing") {
        totalReusedRuns += fwdResults.length;
      }

      const fwdRuns = waypointsOnly(fwdResults);

      // Compute per-position bridge frequency
      const perPosBridgeFreq = computePerPositionBridgeFreq(fwdRuns, pair.knownBridge, WAYPOINT_COUNT);

      // Compute peak-detection contrast
      const { peakContrast, peakPosition, fixedMidpointContrast } = computePeakDetectionContrast(perPosBridgeFreq);

      // Modal frequency
      const modalFrequency = perPosBridgeFreq[peakPosition] ?? 0;

      const profile: PositionalBridgeProfile = {
        pairId: pair.id,
        modelId,
        knownBridge: pair.knownBridge,
        perPositionBridgeFreq: perPosBridgeFreq,
        modalPosition: peakPosition,
        modalFrequency,
        peakDetectionContrast: peakContrast,
        fixedMidpointContrast,
        runCount: fwdRuns.length,
      };

      profiles.push(profile);

      const posFreqStr = perPosBridgeFreq.map((f, i) => `${i}:${f.toFixed(2)}`).join(" ");
      console.log(
        `  ${pair.id} (${modelId}): modal=${peakPosition} freq=${modalFrequency.toFixed(3)} ` +
        `peak=${peakContrast.toFixed(4)} fixed=${fixedMidpointContrast.toFixed(4)} ` +
        `runs=${fwdRuns.length} [${posFreqStr}]`
      );
    }
  }
  console.log("");
  console.log(`Computed ${profiles.length} positional profiles`);
  console.log("");

  // ── Primary test: peak-detection vs fixed-midpoint ────────────────

  console.log("Computing primary test (peak vs fixed-midpoint)...");

  const peakContrasts = profiles.map(p => p.peakDetectionContrast);
  const fixedContrasts = profiles.map(p => p.fixedMidpointContrast);

  const peakMean = mean(peakContrasts);
  const fixedMean = mean(fixedContrasts);
  const peakCI = bootstrapCI(peakContrasts);
  const fixedCI = bootstrapCI(fixedContrasts);

  // Paired difference bootstrap
  const pairedDiffs = profiles.map(p => p.peakDetectionContrast - p.fixedMidpointContrast);
  const diffMean = mean(pairedDiffs);

  const nBootstrap = 1000;
  const bootstrapPairedDiffs: number[] = [];
  for (let i = 0; i < nBootstrap; i++) {
    const sample: number[] = [];
    for (let j = 0; j < pairedDiffs.length; j++) {
      sample.push(pairedDiffs[Math.floor(seededRandom() * pairedDiffs.length)]);
    }
    bootstrapPairedDiffs.push(mean(sample));
  }
  bootstrapPairedDiffs.sort((a, b) => a - b);
  const diffCI: [number, number] = [
    bootstrapPairedDiffs[Math.floor(nBootstrap * 0.025)],
    bootstrapPairedDiffs[Math.floor(nBootstrap * 0.975)],
  ];

  const significantlyPositive = peakCI[0] > 0 && diffCI[0] > 0;

  console.log(`  Peak mean: ${peakMean.toFixed(4)} [${peakCI[0].toFixed(4)}, ${peakCI[1].toFixed(4)}]`);
  console.log(`  Fixed mean: ${fixedMean.toFixed(4)} [${fixedCI[0].toFixed(4)}, ${fixedCI[1].toFixed(4)}]`);
  console.log(`  Difference: ${diffMean.toFixed(4)} [${diffCI[0].toFixed(4)}, ${diffCI[1].toFixed(4)}]`);
  console.log(`  Significantly positive: ${significantlyPositive}`);
  console.log("");

  // ── Positional prediction ────────────────────────────────────────

  console.log("Computing positional prediction...");

  // Use expected position as semantic distance ratio proxy
  // For each pair, compute the mean modal position across models
  const pairMeanPositions = new Map<string, number>();
  const pairExpectedPositions = new Map<string, number>();

  for (const pair of PHASE6C_PAIRS) {
    if (!pair.knownBridge) continue;
    const pairProfiles = profiles.filter(p => p.pairId === pair.id);
    if (pairProfiles.length === 0) continue;

    const meanPos = mean(pairProfiles.map(p => p.modalPosition));
    pairMeanPositions.set(pair.id, meanPos);
    pairExpectedPositions.set(pair.id, expectedPositionToNumeric(pair.expectedPosition));
  }

  const dataPoints: PositionalAnalysisOutput["positionalPrediction"]["dataPoints"] = [];
  const xValues: number[] = [];
  const yValues: number[] = [];

  for (const [pairId, expectedPos] of pairExpectedPositions) {
    const modalPos = pairMeanPositions.get(pairId);
    if (modalPos !== undefined) {
      // Use expected position as the semantic distance ratio proxy
      const ratio = expectedPos / (WAYPOINT_COUNT - 1); // normalize to 0-1
      dataPoints.push({
        pairId,
        semanticDistanceRatio: ratio,
        modalPosition: modalPos,
      });
      xValues.push(ratio);
      yValues.push(modalPos);
    }
  }

  const correlationR = xValues.length >= 3 ? pearsonCorrelation(xValues, yValues) : null;
  // Approximate p-value for Pearson r using t-distribution
  let correlationP: number | null = null;
  if (correlationR !== null && xValues.length >= 3) {
    const n = xValues.length;
    const t = correlationR * Math.sqrt((n - 2) / (1 - correlationR * correlationR));
    // Approximate two-tailed p-value using normal approximation for large n
    correlationP = 2 * (1 - normalCdf(Math.abs(t)));
  }

  console.log(`  Data points: ${dataPoints.length}`);
  console.log(`  Correlation r: ${correlationR?.toFixed(3) ?? "N/A"}`);
  console.log(`  p-value: ${correlationP?.toFixed(4) ?? "N/A"}`);
  console.log("");

  // ── Cross-model positional agreement ──────────────────────────────

  console.log("Computing cross-model positional agreement...");

  const crossModelAgreement: PositionalAnalysisOutput["crossModelPositionalAgreement"] = [];

  for (const pair of PHASE6C_PAIRS) {
    if (!pair.knownBridge) continue;
    const pairProfiles = profiles.filter(p => p.pairId === pair.id);
    if (pairProfiles.length < 2) continue;

    const modalPositions = pairProfiles.map(p => ({
      modelId: p.modelId,
      position: p.modalPosition,
    }));

    const positionValues = modalPositions.map(mp => mp.position);
    const positionSD = computePositionalVariance(positionValues);
    const pairDetermined = positionSD < 1.0;

    crossModelAgreement.push({
      pairId: pair.id,
      modalPositions,
      positionSD,
      pairDetermined,
    });

    console.log(`  ${pair.id}: SD=${positionSD.toFixed(2)} ${pairDetermined ? "pair-determined" : "model-dependent"}`);
  }
  console.log("");

  // ── Forced-crossing positional analysis ───────────────────────────

  console.log("Computing forced-crossing positional analysis...");

  const forcedCrossingPairs = PHASE6C_PAIRS.filter(p => p.source === "forced-crossing");
  const nonForcedPairs = PHASE6C_PAIRS.filter(p => p.source !== "forced-crossing" && p.knownBridge);

  let forcedCrossingPositional: PositionalAnalysisOutput["forcedCrossingPositional"] = null;

  const fcPositionSDs: number[] = [];
  const nonFCPositionSDs: number[] = [];

  for (const pair of forcedCrossingPairs) {
    const pairProfiles = profiles.filter(p => p.pairId === pair.id);
    if (pairProfiles.length < 2) continue;
    const positions = pairProfiles.map(p => p.modalPosition);
    fcPositionSDs.push(computePositionalVariance(positions));
  }

  for (const pair of nonForcedPairs) {
    const pairProfiles = profiles.filter(p => p.pairId === pair.id);
    if (pairProfiles.length < 2) continue;
    const positions = pairProfiles.map(p => p.modalPosition);
    nonFCPositionSDs.push(computePositionalVariance(positions));
  }

  if (fcPositionSDs.length > 0 && nonFCPositionSDs.length > 0) {
    const fcMeanSD = mean(fcPositionSDs);
    const nonFCMeanSD = mean(nonFCPositionSDs);

    forcedCrossingPositional = {
      forcedCrossingPositionSD: fcMeanSD,
      nonForcedPositionSD: nonFCMeanSD,
      forcedLowerVariance: fcMeanSD < nonFCMeanSD,
    };

    console.log(`  FC mean SD: ${fcMeanSD.toFixed(2)}, non-FC mean SD: ${nonFCMeanSD.toFixed(2)}`);
    console.log(`  Forced lower variance: ${fcMeanSD < nonFCMeanSD}`);
  } else {
    console.log("  Insufficient data for forced-crossing positional comparison");
  }
  console.log("");

  // ── Build Output ───────────────────────────────────────────────────

  const analysisOutput: PositionalAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      pairs: PHASE6C_PAIRS.map(p => p.id),
      models: MODELS.map(m => m.id),
      totalNewRuns: totalNewRuns,
      totalReusedRuns: totalReusedRuns,
    },
    profiles,
    primaryTest: {
      peakDetectionMeanContrast: peakMean,
      peakDetectionContrastCI: peakCI,
      fixedMidpointMeanContrast: fixedMean,
      fixedMidpointContrastCI: fixedCI,
      difference: diffMean,
      differenceCI: diffCI,
      significantlyPositive,
    },
    positionalPrediction: {
      correlationR,
      correlationP,
      dataPoints,
    },
    crossModelPositionalAgreement: crossModelAgreement,
    forcedCrossingPositional,
  };

  // ── Write Outputs ──────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "positional-metrics.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Positional bridge scanning analysis complete.");
}

// ── Helper: Normal CDF approximation ────────────────────────────────

function normalCdf(x: number): number {
  // Abramowitz and Stegun approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("positional-analysis")
    .description("Analyze positional bridge scanning from Phase 6C data")
    .option("--input <dir>", "base results directory", "results")
    .option("--output <dir>", "output directory for analysis JSON", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/06c-positional.md");

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
