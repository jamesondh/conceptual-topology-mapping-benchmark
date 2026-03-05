#!/usr/bin/env bun
/**
 * Phase 8B: Gemini Gradient Blindness Analysis
 *
 * Tests whether Gemini systematically fails on gradient-midpoint bridges
 * while succeeding on causal-chain bridges. For each of 20 pairs x 4 models,
 * computes:
 * - Bridge frequency matrix (20 x 4)
 * - Gradient vs causal-chain aggregate comparison (replication of O17)
 * - Gemini interaction test (PRIMARY TEST)
 * - Per-model gradient performance
 * - Gemini zero-rate analysis
 * - Phase 7C replication check (4 gradient pairs)
 * - Gemini alternative routing characterization
 * - 9 predictions evaluation
 *
 * Loads data from:
 *   results/gradient/      (Phase 8B gradient/causal data)
 *   results/too-central/   (Phase 7C data for replication check, optional)
 *
 * Usage:
 *   bun run analysis/08b-gradient.ts
 *   bun run analysis/08b-gradient.ts --input results --output results/analysis
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
  computeWaypointFrequencies,
  bootstrapInteractionCI,
} from "../src/metrics.ts";
import { MODELS } from "../src/data/pairs.ts";
import {
  PHASE8B_ALL_PAIRS,
  PHASE8B_GRADIENT_PAIRS,
  PHASE8B_CAUSAL_PAIRS,
} from "../src/data/pairs-phase8.ts";
import type {
  GradientAnalysisOutput,
  ElicitationResult,
  Phase8GradientPair,
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

// ── Phase 7C Replication Mapping ─────────────────────────────────────

/**
 * Maps Phase 8B gradient pair IDs to their Phase 7C counterpart pair IDs.
 * Only the 4 replication pairs are included.
 */
const PHASE7C_REPLICATION_MAP: Record<string, string> = {
  "p8b-grad-whisper-shout": "p7c-whisper-shout",
  "p8b-grad-hot-cold": "p7c-hot-cold",
  "p8b-grad-dawn-dusk": "p7c-dawn-dusk",
  "p8b-grad-infant-elderly": "p7c-infant-elderly",
};

// ── Alternative Routing Classification ───────────────────────────────

/**
 * Classify Gemini's alternative routing when bridge frequency is zero.
 * Looks at the top waypoints and determines whether they are:
 * - "related-non-midpoint": waypoints in the same domain but not the gradient midpoint
 * - "unrelated": waypoints from a different domain entirely
 * - "mixed": a combination of both
 */
function classifyAlternativeRouting(
  pair: Phase8GradientPair,
  topWaypoints: Array<{ waypoint: string; frequency: number }>,
): "related-non-midpoint" | "unrelated" | "mixed" {
  if (topWaypoints.length === 0) return "unrelated";

  const bridgeLower = pair.candidateBridge.toLowerCase();
  const dimensionTerms = getDimensionTerms(pair);

  let relatedCount = 0;
  let unrelatedCount = 0;

  for (const wp of topWaypoints) {
    const wpLower = wp.waypoint.toLowerCase();
    // Skip if it somehow matches the bridge (shouldn't happen for zero-freq pairs)
    if (wpLower === bridgeLower) continue;

    const isRelated = dimensionTerms.some(
      (term) => wpLower.includes(term) || term.includes(wpLower),
    );
    if (isRelated) {
      relatedCount++;
    } else {
      unrelatedCount++;
    }
  }

  if (relatedCount > 0 && unrelatedCount === 0) return "related-non-midpoint";
  if (unrelatedCount > 0 && relatedCount === 0) return "unrelated";
  return "mixed";
}

/**
 * Get domain-related terms for a gradient pair to help classify alternative routing.
 */
function getDimensionTerms(pair: Phase8GradientPair): string[] {
  const terms: string[] = [];

  // Include from/to concepts
  terms.push(pair.from.toLowerCase(), pair.to.toLowerCase());

  // Include dimension-related keywords
  if (pair.dimension) {
    const dimensionTokens = pair.dimension.toLowerCase().split(/[\s,]+/);
    terms.push(...dimensionTokens);
  }

  // Add specific domain terms based on known pairs
  const domainMap: Record<string, string[]> = {
    "p8b-grad-whisper-shout": ["voice", "speak", "talk", "sound", "volume", "vocal", "loud", "quiet", "tone", "utterance"],
    "p8b-grad-hot-cold": ["warm", "cool", "temperature", "heat", "chill", "thermal", "tepid", "lukewarm"],
    "p8b-grad-dawn-dusk": ["noon", "morning", "afternoon", "evening", "midday", "sunrise", "sunset", "twilight", "day"],
    "p8b-grad-infant-elderly": ["child", "adolescent", "adult", "teenager", "youth", "toddler", "middle-age", "aging"],
    "p8b-grad-crawl-sprint": ["walk", "run", "jog", "stride", "pace", "move", "locomotion", "speed"],
    "p8b-grad-pond-ocean": ["lake", "river", "sea", "stream", "water", "reservoir", "bay"],
    "p8b-grad-pebble-boulder": ["rock", "stone", "gravel", "cobble", "mineral", "geology"],
    "p8b-grad-drizzle-downpour": ["rain", "shower", "storm", "precipitation", "mist", "sprinkle"],
    "p8b-grad-village-metropolis": ["town", "city", "suburb", "hamlet", "urban", "settlement", "community"],
    "p8b-grad-murmur-scream": ["speech", "speak", "talk", "voice", "whisper", "shout", "sound", "vocal", "cry"],
  };

  if (domainMap[pair.id]) {
    terms.push(...domainMap[pair.id]);
  }

  return terms;
}

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: GradientAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 8B: Gemini Gradient Blindness Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Experiment Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Total pairs analyzed:** ${output.metadata.pairs.length}`);
  lines.push(`  - Gradient-midpoint pairs: ${PHASE8B_GRADIENT_PAIRS.length}`);
  lines.push(`  - Causal-chain pairs: ${PHASE8B_CAUSAL_PAIRS.length}`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **New runs:** ${output.metadata.totalNewRuns}`);
  lines.push(`- **Reused runs:** ${output.metadata.totalReusedRuns}`);
  lines.push(`- **Bridge frequency observations:** ${output.bridgeFreqMatrix.length}`);
  lines.push("");

  // 2. Bridge Frequency Matrix
  lines.push("## 2. Bridge Frequency Matrix (20 Pairs x 4 Models)");
  lines.push("");
  lines.push("| Pair | Type | Bridge | " + MODELS.map((m) => m.id).join(" | ") + " |");
  lines.push("|------|------|--------|" + MODELS.map(() => "---").join("|") + "|");

  for (const pair of PHASE8B_ALL_PAIRS) {
    const cells: string[] = [];
    for (const model of MODELS) {
      const entry = output.bridgeFreqMatrix.find(
        (e) => e.pairId === pair.id && e.modelId === model.id,
      );
      if (entry) {
        const freqStr = entry.bridgeFrequency.toFixed(3);
        const marker = entry.isZero ? " *" : "";
        cells.push(`${freqStr}${marker}`);
      } else {
        cells.push("--");
      }
    }
    const typeLabel = pair.pairType === "gradient-midpoint" ? "grad" : "causal";
    lines.push(`| ${pair.id} | ${typeLabel} | ${pair.candidateBridge} | ${cells.join(" | ")} |`);
  }
  lines.push("");
  lines.push("_* indicates zero bridge frequency_");
  lines.push("");

  // 3. Gradient vs Causal-Chain Comparison
  lines.push("## 3. Gradient vs Causal-Chain Comparison (Replication of O17)");
  lines.push("");
  const gvc = output.gradientVsCausal;
  lines.push(`- **Gradient mean bridge freq:** ${gvc.gradientMean.toFixed(4)} [${gvc.gradientCI[0].toFixed(4)}, ${gvc.gradientCI[1].toFixed(4)}]`);
  lines.push(`- **Causal-chain mean bridge freq:** ${gvc.causalMean.toFixed(4)} [${gvc.causalCI[0].toFixed(4)}, ${gvc.causalCI[1].toFixed(4)}]`);
  lines.push(`- **Difference (gradient - causal):** ${gvc.difference.toFixed(4)} [${gvc.differenceCI[0].toFixed(4)}, ${gvc.differenceCI[1].toFixed(4)}]`);
  lines.push(`- **Gradient higher:** ${gvc.gradientHigher ? "**YES**" : "**NO**"}`);
  lines.push("");

  if (gvc.gradientHigher && gvc.differenceCI[0] > 0) {
    lines.push(
      "**[observed]** Gradient-midpoint bridges are found at significantly higher frequency " +
        "than causal-chain bridges, replicating the O17 observation that continuous-spectrum " +
        "midpoints are more navigational than process intermediaries.",
    );
  } else {
    lines.push(
      "The gradient vs causal-chain difference is not significant or gradient is not higher.",
    );
  }
  lines.push("");

  // 4. Gemini Interaction Test (PRIMARY)
  lines.push("## 4. Gemini Interaction Test (PRIMARY TEST)");
  lines.push("");
  const gi = output.geminiInteraction;
  lines.push(`- **Gemini gradient mean:** ${gi.geminiGradientMean.toFixed(4)}`);
  lines.push(`- **Gemini causal mean:** ${gi.geminiCausalMean.toFixed(4)}`);
  lines.push(`- **Gemini gap (gradient - causal):** ${gi.geminiGap.toFixed(4)}`);
  lines.push(`- **Non-Gemini gradient mean:** ${gi.nonGeminiGradientMean.toFixed(4)}`);
  lines.push(`- **Non-Gemini causal mean:** ${gi.nonGeminiCausalMean.toFixed(4)}`);
  lines.push(`- **Non-Gemini gap (gradient - causal):** ${gi.nonGeminiGap.toFixed(4)}`);
  lines.push(`- **Interaction (Gemini gap - non-Gemini gap):** ${gi.interactionDifference.toFixed(4)} [${gi.interactionCI[0].toFixed(4)}, ${gi.interactionCI[1].toFixed(4)}]`);
  lines.push(`- **Significant interaction (CI excludes zero):** ${gi.significantInteraction ? "**YES**" : "**NO**"}`);
  lines.push("");

  if (gi.significantInteraction) {
    lines.push(
      "**[observed]** Gemini shows a significantly larger gradient-vs-causal performance gap " +
        "compared to non-Gemini models, confirming a selective deficit in gradient-midpoint " +
        "bridge detection (gradient blindness).",
    );
  } else {
    lines.push(
      "The interaction effect is not statistically significant. Gemini does not show " +
        "a selective gradient-midpoint deficit relative to other models.",
    );
  }
  lines.push("");

  // 5. Per-Model Gradient Performance
  lines.push("## 5. Per-Model Gradient Performance");
  lines.push("");
  lines.push("| Model | Gradient Mean | Causal Mean | Gap (grad - causal) |");
  lines.push("|-------|--------------|-------------|---------------------|");

  for (const pm of output.perModelGradient) {
    lines.push(
      `| ${pm.modelId} | ${pm.gradientMean.toFixed(4)} | ${pm.causalMean.toFixed(4)} | ${pm.gap.toFixed(4)} |`,
    );
  }
  lines.push("");

  // 6. Gemini Zero-Rate Analysis
  lines.push("## 6. Gemini Zero-Rate Analysis");
  lines.push("");
  const zr = output.geminiZeroRate;
  lines.push(`- **Gemini gradient zeros:** ${zr.geminiGradientZeros} / ${zr.geminiGradientTotal}`);
  lines.push(`- **Gemini causal zeros:** ${zr.geminiCausalZeros} / ${zr.geminiCausalTotal}`);
  lines.push(`- **Non-Gemini gradient zeros:** ${zr.nonGeminiGradientZeros}`);
  lines.push(`- **Non-Gemini causal zeros:** ${zr.nonGeminiCausalZeros}`);
  lines.push("");

  if (zr.geminiGradientZeros > zr.geminiCausalZeros) {
    lines.push(
      "**[observed]** Gemini shows substantially more zero-frequency gradient pairs " +
        "than causal pairs, confirming that the deficit is specific to gradient-midpoint bridges.",
    );
  }
  lines.push("");

  // 7. Phase 7C Replication
  lines.push("## 7. Phase 7C Replication Check");
  lines.push("");
  if (output.phase7CReplication.length > 0) {
    lines.push("| Pair | Model | Phase 7C Freq | Phase 8B Freq | Difference | Replicates? |");
    lines.push("|------|-------|--------------|--------------|------------|-------------|");

    for (const rep of output.phase7CReplication) {
      const p7cStr = rep.phase7CFreq !== null ? rep.phase7CFreq.toFixed(3) : "--";
      const diffStr = rep.difference !== null ? rep.difference.toFixed(3) : "--";
      const repStr = rep.replicates === null ? "--" : rep.replicates ? "YES" : "NO";
      lines.push(
        `| ${rep.pairId} | ${rep.modelId} | ${p7cStr} | ${rep.phase8BFreq.toFixed(3)} | ${diffStr} | ${repStr} |`,
      );
    }
  } else {
    lines.push("_No Phase 7C replication data available._");
  }
  lines.push("");

  // 8. Gemini Alternative Routing
  lines.push("## 8. Gemini Alternative Routing on Zero-Frequency Gradient Pairs");
  lines.push("");
  if (output.geminiAlternativeRouting.length > 0) {
    for (const ar of output.geminiAlternativeRouting) {
      lines.push(`### ${ar.pairId}`);
      lines.push(`- **Routing type:** ${ar.routingType}`);
      lines.push("- **Top waypoints:**");
      for (const wp of ar.topWaypoints) {
        lines.push(`  - ${wp.waypoint} (${wp.frequency.toFixed(3)})`);
      }
      lines.push("");
    }
  } else {
    lines.push("_No zero-frequency gradient pairs found for Gemini._");
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

  console.log("Conceptual Topology Mapping Benchmark - Gemini Gradient Blindness Analysis");
  console.log("==========================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data ─────────────────────────────────────────────────────

  console.log("Loading Phase 8B gradient data...");
  const gradientDir = join(inputDir, "gradient");
  const gradientResults = await loadResultsFromDir(gradientDir);
  console.log(`  Loaded ${gradientResults.length} results from ${gradientDir}/`);

  // Optionally load Phase 7C too-central data for replication check
  console.log("Loading Phase 7C too-central data (optional)...");
  const tooCentralDir = join(inputDir, "too-central");
  const tooCentralResults = await loadResultsFromDir(tooCentralDir);
  console.log(`  Loaded ${tooCentralResults.length} results from ${tooCentralDir}/`);
  console.log("");

  const gradientLookup = buildWaypointLookup(gradientResults);
  const tooCentralLookup = buildWaypointLookup(tooCentralResults);

  console.log(`  Gradient lookup keys: ${gradientLookup.size}`);
  console.log(`  Too-central lookup keys: ${tooCentralLookup.size}`);
  console.log("");

  const modelIds = MODELS.map((m) => m.id);

  // ── 1. Build Bridge Frequency Matrix (20 x 4) ───────────────────

  console.log("Computing bridge frequency matrix (20 pairs x 4 models)...");

  const bridgeFreqMatrix: GradientAnalysisOutput["bridgeFreqMatrix"] = [];
  let totalNewRuns = 0;
  let totalReusedRuns = 0;

  for (const pair of PHASE8B_ALL_PAIRS) {
    for (const modelId of modelIds) {
      // Try multiple key patterns for looking up runs
      const keyPatterns = [
        `${pair.id}::${modelId}`,
        `${pair.id}--primary::${modelId}`,
        `${pair.id}--fwd::${modelId}`,
      ];

      let results: ElicitationResult[] = [];
      for (const key of keyPatterns) {
        results = gradientLookup.get(key) ?? [];
        if (results.length > 0) break;
      }

      if (results.length === 0) {
        console.log(`  SKIP ${pair.id} (${modelId}): no data`);
        continue;
      }

      const runs = waypointsOnly(results);
      totalNewRuns += runs.length;

      const freq = computeBridgeFrequency(runs, pair.candidateBridge);
      const ci = bootstrapBridgeFrequencyCI(runs, pair.candidateBridge);
      const isZero = freq === 0;

      bridgeFreqMatrix.push({
        pairId: pair.id,
        pairType: pair.pairType,
        modelId,
        bridgeFrequency: freq,
        bridgeFrequencyCI: ci,
        runCount: runs.length,
        isZero,
      });

      console.log(
        `  ${pair.id} (${modelId}): freq=${freq.toFixed(3)} [${ci[0].toFixed(3)}, ${ci[1].toFixed(3)}] runs=${runs.length}${isZero ? " [ZERO]" : ""}`,
      );
    }
  }
  console.log("");
  console.log(`Bridge frequency matrix: ${bridgeFreqMatrix.length} entries`);
  console.log("");

  // ── 2. Gradient vs Causal-Chain Comparison (replication of O17) ──

  console.log("Computing gradient vs causal-chain comparison...");

  const allGradientFreqs = bridgeFreqMatrix
    .filter((e) => e.pairType === "gradient-midpoint")
    .map((e) => e.bridgeFrequency);
  const allCausalFreqs = bridgeFreqMatrix
    .filter((e) => e.pairType === "causal-chain")
    .map((e) => e.bridgeFrequency);

  const gradientMeanAll = mean(allGradientFreqs);
  const causalMeanAll = mean(allCausalFreqs);
  const gradientCI = bootstrapCI(allGradientFreqs);
  const causalCI = bootstrapCI(allCausalFreqs);

  // Bootstrap CI on difference (gradient - causal)
  const nBootstrap = 1000;
  const diffBootstrap: number[] = [];
  for (let i = 0; i < nBootstrap; i++) {
    const sampleG: number[] = [];
    for (let j = 0; j < allGradientFreqs.length; j++) {
      sampleG.push(allGradientFreqs[Math.floor(seededRandom() * allGradientFreqs.length)]);
    }
    const sampleC: number[] = [];
    for (let j = 0; j < allCausalFreqs.length; j++) {
      sampleC.push(allCausalFreqs[Math.floor(seededRandom() * allCausalFreqs.length)]);
    }
    diffBootstrap.push(mean(sampleG) - mean(sampleC));
  }
  diffBootstrap.sort((a, b) => a - b);
  const differenceCI: [number, number] = [
    diffBootstrap[Math.floor(nBootstrap * 0.025)],
    diffBootstrap[Math.floor(nBootstrap * 0.975)],
  ];
  const differenceVal = gradientMeanAll - causalMeanAll;

  const gradientVsCausal: GradientAnalysisOutput["gradientVsCausal"] = {
    gradientMean: gradientMeanAll,
    gradientCI,
    causalMean: causalMeanAll,
    causalCI,
    difference: differenceVal,
    differenceCI,
    gradientHigher: differenceVal > 0 && differenceCI[0] > 0,
  };

  console.log(`  Gradient mean: ${gradientMeanAll.toFixed(4)} [${gradientCI[0].toFixed(4)}, ${gradientCI[1].toFixed(4)}]`);
  console.log(`  Causal mean: ${causalMeanAll.toFixed(4)} [${causalCI[0].toFixed(4)}, ${causalCI[1].toFixed(4)}]`);
  console.log(`  Difference: ${differenceVal.toFixed(4)} [${differenceCI[0].toFixed(4)}, ${differenceCI[1].toFixed(4)}]`);
  console.log(`  Gradient higher (CI excludes zero): ${gradientVsCausal.gradientHigher}`);
  console.log("");

  // ── 3. Gemini Interaction Test (PRIMARY TEST) ─────────────────────

  console.log("Computing Gemini interaction test...");

  const GEMINI_ID = "gemini";
  const nonGeminiIds = modelIds.filter((m) => m !== GEMINI_ID);

  // Collect per-pair bridge frequencies by model group and pair type
  const geminiGradientFreqs: number[] = [];
  const geminiCausalFreqs: number[] = [];
  const nonGeminiGradientFreqs: number[] = [];
  const nonGeminiCausalFreqs: number[] = [];

  for (const entry of bridgeFreqMatrix) {
    if (entry.modelId === GEMINI_ID) {
      if (entry.pairType === "gradient-midpoint") {
        geminiGradientFreqs.push(entry.bridgeFrequency);
      } else {
        geminiCausalFreqs.push(entry.bridgeFrequency);
      }
    } else {
      if (entry.pairType === "gradient-midpoint") {
        nonGeminiGradientFreqs.push(entry.bridgeFrequency);
      } else {
        nonGeminiCausalFreqs.push(entry.bridgeFrequency);
      }
    }
  }

  const geminiGradientMean = mean(geminiGradientFreqs);
  const geminiCausalMean = mean(geminiCausalFreqs);
  const geminiGap = geminiGradientMean - geminiCausalMean;

  const nonGeminiGradientMean = mean(nonGeminiGradientFreqs);
  const nonGeminiCausalMean = mean(nonGeminiCausalFreqs);
  const nonGeminiGap = nonGeminiGradientMean - nonGeminiCausalMean;

  const interactionDifference = geminiGap - nonGeminiGap;

  // Compute interaction CI using the dedicated bootstrap function
  const interactionCI = bootstrapInteractionCI(
    geminiGradientFreqs,
    geminiCausalFreqs,
    nonGeminiGradientFreqs,
    nonGeminiCausalFreqs,
  );

  // Significant if CI excludes zero (for a negative interaction, upper bound < 0)
  const significantInteraction =
    (interactionCI[0] > 0 && interactionCI[1] > 0) ||
    (interactionCI[0] < 0 && interactionCI[1] < 0);

  const geminiInteraction: GradientAnalysisOutput["geminiInteraction"] = {
    geminiGradientMean,
    geminiCausalMean,
    geminiGap,
    nonGeminiGradientMean,
    nonGeminiCausalMean,
    nonGeminiGap,
    interactionDifference,
    interactionCI,
    significantInteraction,
  };

  console.log(`  Gemini gradient mean: ${geminiGradientMean.toFixed(4)}`);
  console.log(`  Gemini causal mean: ${geminiCausalMean.toFixed(4)}`);
  console.log(`  Gemini gap: ${geminiGap.toFixed(4)}`);
  console.log(`  Non-Gemini gradient mean: ${nonGeminiGradientMean.toFixed(4)}`);
  console.log(`  Non-Gemini causal mean: ${nonGeminiCausalMean.toFixed(4)}`);
  console.log(`  Non-Gemini gap: ${nonGeminiGap.toFixed(4)}`);
  console.log(`  Interaction: ${interactionDifference.toFixed(4)} [${interactionCI[0].toFixed(4)}, ${interactionCI[1].toFixed(4)}]`);
  console.log(`  Significant: ${significantInteraction}`);
  console.log("");

  // ── 3b. Sensitivity: Interaction without known confound pairs ────
  console.log("  Sensitivity: excluding acorn-timber, flour-bread confound pairs...");
  const CONFOUND_IDS = new Set(["p8b-causal-acorn-timber", "p8b-causal-flour-bread"]);
  const geminiCausalNoConfound = bridgeFreqMatrix
    .filter(e => e.modelId === GEMINI_ID && e.pairType === "causal-chain" && !CONFOUND_IDS.has(e.pairId))
    .map(e => e.bridgeFrequency);
  const nonGeminiCausalNoConfound = bridgeFreqMatrix
    .filter(e => e.modelId !== GEMINI_ID && e.pairType === "causal-chain" && !CONFOUND_IDS.has(e.pairId))
    .map(e => e.bridgeFrequency);
  const geminiGapNoConfound = mean(geminiGradientFreqs) - mean(geminiCausalNoConfound);
  const nonGeminiGapNoConfound = mean(nonGeminiGradientFreqs) - mean(nonGeminiCausalNoConfound);
  const interactionNoConfound = geminiGapNoConfound - nonGeminiGapNoConfound;
  const interactionCINoConfound = bootstrapInteractionCI(
    geminiGradientFreqs, geminiCausalNoConfound,
    nonGeminiGradientFreqs, nonGeminiCausalNoConfound,
  );
  const significantNoConfound = interactionCINoConfound[1] < 0;
  console.log(`  Without confounds: interaction=${interactionNoConfound.toFixed(4)} [${interactionCINoConfound[0].toFixed(4)}, ${interactionCINoConfound[1].toFixed(4)}], significant=${significantNoConfound}`);
  console.log("");

  // ── 4. Per-Model Gradient Performance ─────────────────────────────

  console.log("Computing per-model gradient performance...");

  const perModelGradient: GradientAnalysisOutput["perModelGradient"] = [];

  for (const modelId of modelIds) {
    const modelGradient = bridgeFreqMatrix
      .filter((e) => e.modelId === modelId && e.pairType === "gradient-midpoint")
      .map((e) => e.bridgeFrequency);
    const modelCausal = bridgeFreqMatrix
      .filter((e) => e.modelId === modelId && e.pairType === "causal-chain")
      .map((e) => e.bridgeFrequency);

    const gradMean = mean(modelGradient);
    const causMean = mean(modelCausal);
    const gap = gradMean - causMean;

    perModelGradient.push({
      modelId,
      gradientMean: gradMean,
      causalMean: causMean,
      gap,
    });

    console.log(
      `  ${modelId}: gradient=${gradMean.toFixed(4)}, causal=${causMean.toFixed(4)}, gap=${gap.toFixed(4)}`,
    );
  }
  console.log("");

  // ── 5. Gemini Zero-Rate Analysis ──────────────────────────────────

  console.log("Computing Gemini zero-rate analysis...");

  const geminiGradientEntries = bridgeFreqMatrix.filter(
    (e) => e.modelId === GEMINI_ID && e.pairType === "gradient-midpoint",
  );
  const geminiCausalEntries = bridgeFreqMatrix.filter(
    (e) => e.modelId === GEMINI_ID && e.pairType === "causal-chain",
  );
  const nonGeminiGradientEntries = bridgeFreqMatrix.filter(
    (e) => e.modelId !== GEMINI_ID && e.pairType === "gradient-midpoint",
  );
  const nonGeminiCausalEntries = bridgeFreqMatrix.filter(
    (e) => e.modelId !== GEMINI_ID && e.pairType === "causal-chain",
  );

  const geminiZeroRate: GradientAnalysisOutput["geminiZeroRate"] = {
    geminiGradientZeros: geminiGradientEntries.filter((e) => e.isZero).length,
    geminiGradientTotal: geminiGradientEntries.length,
    geminiCausalZeros: geminiCausalEntries.filter((e) => e.isZero).length,
    geminiCausalTotal: geminiCausalEntries.length,
    nonGeminiGradientZeros: nonGeminiGradientEntries.filter((e) => e.isZero).length,
    nonGeminiCausalZeros: nonGeminiCausalEntries.filter((e) => e.isZero).length,
  };

  console.log(`  Gemini gradient zeros: ${geminiZeroRate.geminiGradientZeros}/${geminiZeroRate.geminiGradientTotal}`);
  console.log(`  Gemini causal zeros: ${geminiZeroRate.geminiCausalZeros}/${geminiZeroRate.geminiCausalTotal}`);
  console.log(`  Non-Gemini gradient zeros: ${geminiZeroRate.nonGeminiGradientZeros}`);
  console.log(`  Non-Gemini causal zeros: ${geminiZeroRate.nonGeminiCausalZeros}`);
  console.log("");

  // ── 6. Phase 7C Replication Check ──────────────────────────────────

  console.log("Computing Phase 7C replication check...");

  const phase7CReplication: GradientAnalysisOutput["phase7CReplication"] = [];

  const replicationPairs = PHASE8B_GRADIENT_PAIRS.filter((p) => p.isPhase7CReplication);

  for (const pair of replicationPairs) {
    const phase7CPairId = PHASE7C_REPLICATION_MAP[pair.id];
    if (!phase7CPairId) continue;

    for (const modelId of modelIds) {
      // Get Phase 8B frequency
      const entry8B = bridgeFreqMatrix.find(
        (e) => e.pairId === pair.id && e.modelId === modelId,
      );
      if (!entry8B) {
        // Skip this model — no Phase 8B data available
        continue;
      }
      const phase8BFreq = entry8B.bridgeFrequency;

      // Get Phase 7C frequency from too-central lookup
      let phase7CFreq: number | null = null;

      // Try multiple key patterns for Phase 7C data
      const phase7CKeyPatterns = [
        `${phase7CPairId}--primary::${modelId}`,
        `${phase7CPairId}--fwd::${modelId}`,
        `${phase7CPairId}::${modelId}`,
      ];

      for (const key of phase7CKeyPatterns) {
        const results = tooCentralLookup.get(key);
        if (results && results.length > 0) {
          const runs = waypointsOnly(results);
          phase7CFreq = computeBridgeFrequency(runs, pair.candidateBridge);
          totalReusedRuns += runs.length;
          break;
        }
      }

      const difference = phase7CFreq !== null ? Math.abs(phase8BFreq - phase7CFreq) : null;
      const replicates = difference !== null ? difference <= 0.15 : null;

      phase7CReplication.push({
        pairId: pair.id,
        modelId,
        phase7CFreq,
        phase8BFreq,
        difference,
        replicates,
      });

      const p7cStr = phase7CFreq !== null ? phase7CFreq.toFixed(3) : "N/A";
      const diffStr = difference !== null ? difference.toFixed(3) : "N/A";
      const repStr = replicates !== null ? (replicates ? "YES" : "NO") : "N/A";
      console.log(
        `  ${pair.id} (${modelId}): 7C=${p7cStr}, 8B=${phase8BFreq.toFixed(3)}, diff=${diffStr}, replicates=${repStr}`,
      );
    }
  }
  console.log("");

  // ── 7. Gemini Alternative Routing ──────────────────────────────────

  console.log("Analyzing Gemini alternative routing on zero-frequency gradient pairs...");

  const geminiAlternativeRouting: GradientAnalysisOutput["geminiAlternativeRouting"] = [];

  const geminiZeroGradientPairIds = geminiGradientEntries
    .filter((e) => e.isZero)
    .map((e) => e.pairId);

  for (const pairId of geminiZeroGradientPairIds) {
    const pair = PHASE8B_ALL_PAIRS.find((p) => p.id === pairId);
    if (!pair) continue;

    // Get Gemini runs for this pair
    const keyPatterns = [
      `${pairId}::${GEMINI_ID}`,
      `${pairId}--primary::${GEMINI_ID}`,
      `${pairId}--fwd::${GEMINI_ID}`,
    ];

    let geminiResults: ElicitationResult[] = [];
    for (const key of keyPatterns) {
      geminiResults = gradientLookup.get(key) ?? [];
      if (geminiResults.length > 0) break;
    }

    if (geminiResults.length === 0) continue;

    const runs = waypointsOnly(geminiResults);
    const freqs = computeWaypointFrequencies(runs);

    // Get top 5 waypoints
    const topWaypoints = freqs.slice(0, 5).map((f) => ({
      waypoint: f.waypoint,
      frequency: f.frequency,
    }));

    const routingType = classifyAlternativeRouting(pair, topWaypoints);

    geminiAlternativeRouting.push({
      pairId,
      topWaypoints,
      routingType,
    });

    const wpStr = topWaypoints.map((wp) => `${wp.waypoint}(${wp.frequency.toFixed(2)})`).join(", ");
    console.log(`  ${pairId}: routing=${routingType}, top=[${wpStr}]`);
  }
  console.log("");

  // ── 8. Predictions Evaluation (9 predictions) ──────────────────────

  console.log("Evaluating predictions...");

  const predictions: GradientAnalysisOutput["predictions"] = [];

  // P1: Gradient > causal-chain by at least 0.15, CI excludes zero
  const p1Passes =
    allGradientFreqs.length > 0 &&
    allCausalFreqs.length > 0 &&
    differenceVal >= 0.15 &&
    differenceCI[0] > 0;
  predictions.push({
    id: 1,
    description: "Gradient > causal-chain by at least 0.15, CI excludes zero",
    result:
      allGradientFreqs.length === 0 || allCausalFreqs.length === 0
        ? "insufficient data"
        : p1Passes
          ? "confirmed"
          : "not confirmed",
    value: `diff=${differenceVal.toFixed(3)} [${differenceCI[0].toFixed(3)}, ${differenceCI[1].toFixed(3)}]`,
  });

  // P2: Gemini gradient mean < 0.25
  const p2Passes = geminiGradientFreqs.length > 0 && geminiGradientMean < 0.25;
  predictions.push({
    id: 2,
    description: "Gemini gradient mean < 0.25",
    result:
      geminiGradientFreqs.length === 0
        ? "insufficient data"
        : p2Passes
          ? "confirmed"
          : "not confirmed",
    value: `gemini_gradient_mean=${geminiGradientMean.toFixed(3)}`,
  });

  // P3: Gemini causal mean > 0.40
  const p3Passes = geminiCausalFreqs.length > 0 && geminiCausalMean > 0.40;
  predictions.push({
    id: 3,
    description: "Gemini causal mean > 0.40",
    result:
      geminiCausalFreqs.length === 0
        ? "insufficient data"
        : p3Passes
          ? "confirmed"
          : "not confirmed",
    value: `gemini_causal_mean=${geminiCausalMean.toFixed(3)}`,
  });

  // P4: Gemini gap at least 0.20 more negative than non-Gemini gap, interaction CI excludes zero
  const p4Passes =
    significantInteraction && interactionDifference <= -0.20;
  predictions.push({
    id: 4,
    description: "Gemini gap >= 0.20 more negative than non-Gemini gap, interaction CI excludes zero",
    result:
      geminiGradientFreqs.length === 0 || nonGeminiGradientFreqs.length === 0
        ? "insufficient data"
        : p4Passes
          ? "confirmed"
          : "not confirmed",
    value: `interaction=${interactionDifference.toFixed(3)} [${interactionCI[0].toFixed(3)}, ${interactionCI[1].toFixed(3)}]`,
  });

  // P5: Gemini 0.000 on at least 5 of 10 gradient pairs
  const p5Passes =
    geminiZeroRate.geminiGradientTotal > 0 &&
    geminiZeroRate.geminiGradientZeros >= 5;
  predictions.push({
    id: 5,
    description: "Gemini 0.000 on at least 5 of 10 gradient pairs",
    result:
      geminiZeroRate.geminiGradientTotal === 0
        ? "insufficient data"
        : p5Passes
          ? "confirmed"
          : "not confirmed",
    value: `${geminiZeroRate.geminiGradientZeros}/${geminiZeroRate.geminiGradientTotal} zeros`,
  });

  // P6: Gemini 0.000 on at most 2 of 10 causal pairs
  const p6Passes =
    geminiZeroRate.geminiCausalTotal > 0 &&
    geminiZeroRate.geminiCausalZeros <= 2;
  predictions.push({
    id: 6,
    description: "Gemini 0.000 on at most 2 of 10 causal pairs",
    result:
      geminiZeroRate.geminiCausalTotal === 0
        ? "insufficient data"
        : p6Passes
          ? "confirmed"
          : "not confirmed",
    value: `${geminiZeroRate.geminiCausalZeros}/${geminiZeroRate.geminiCausalTotal} zeros`,
  });

  // P7: Non-Gemini gradient mean > 0.60, causal mean > 0.50, gap < 0.15
  const p7GradientOk = nonGeminiGradientMean > 0.60;
  const p7CausalOk = nonGeminiCausalMean > 0.50;
  const nonGeminiGapAbs = Math.abs(nonGeminiGap);
  const p7GapOk = nonGeminiGapAbs < 0.15;
  const p7Passes = p7GradientOk && p7CausalOk && p7GapOk;
  predictions.push({
    id: 7,
    description: "Non-Gemini gradient mean > 0.60, causal > 0.50, gap < 0.15",
    result:
      nonGeminiGradientFreqs.length === 0
        ? "insufficient data"
        : p7Passes
          ? "confirmed"
          : "not confirmed",
    value: `grad=${nonGeminiGradientMean.toFixed(3)}, causal=${nonGeminiCausalMean.toFixed(3)}, gap=${nonGeminiGap.toFixed(3)}`,
  });

  // P8: Phase 7C replication: frequencies within 0.15 for all models on 4 replication pairs
  const replicationEntries = phase7CReplication.filter((r) => r.replicates !== null);
  const allReplicate = replicationEntries.length > 0 && replicationEntries.every((r) => r.replicates);
  predictions.push({
    id: 8,
    description: "Phase 7C replication: frequencies within 0.15 for all models on 4 pairs",
    result:
      replicationEntries.length === 0
        ? "insufficient data"
        : allReplicate
          ? "confirmed"
          : "not confirmed",
    value: `${replicationEntries.filter((r) => r.replicates).length}/${replicationEntries.length} replicate`,
  });

  // P9: Gemini alternative routing uses generic concepts on zero-freq gradient pairs
  const relatedNonMidpointCount = geminiAlternativeRouting.filter(
    (ar) => ar.routingType === "related-non-midpoint",
  ).length;
  const mixedCount = geminiAlternativeRouting.filter(
    (ar) => ar.routingType === "mixed",
  ).length;
  const totalZeroRouting = geminiAlternativeRouting.length;
  // Prediction passes if majority (>= 50%) show related-non-midpoint or mixed routing
  const p9Passes =
    totalZeroRouting > 0 &&
    (relatedNonMidpointCount + mixedCount) / totalZeroRouting >= 0.5;
  predictions.push({
    id: 9,
    description: "Gemini alternative routing uses related-non-midpoint concepts on zero-freq pairs",
    result:
      totalZeroRouting === 0
        ? "insufficient data"
        : p9Passes
          ? "confirmed"
          : "not confirmed",
    value: `related=${relatedNonMidpointCount}, mixed=${mixedCount}, unrelated=${totalZeroRouting - relatedNonMidpointCount - mixedCount} of ${totalZeroRouting}`,
  });

  for (const pred of predictions) {
    console.log(`  P${pred.id}: ${pred.result} (${pred.value})`);
  }
  console.log("");

  // ── Build Output ───────────────────────────────────────────────────

  const analysisOutput: GradientAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      pairs: PHASE8B_ALL_PAIRS.map((p) => p.id),
      models: MODELS.map((m) => m.id),
      totalNewRuns: totalNewRuns,
      totalReusedRuns: totalReusedRuns,
    },
    bridgeFreqMatrix,
    gradientVsCausal,
    geminiInteraction,
    perModelGradient,
    geminiZeroRate,
    phase7CReplication,
    geminiAlternativeRouting,
    predictions,
  };

  // ── Write Outputs ──────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "gradient-metrics.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Gemini gradient blindness analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("gradient-analysis")
    .description("Analyze Gemini gradient blindness from Phase 8B data")
    .option("--input <dir>", "base results directory", "results")
    .option("--output <dir>", "output directory for analysis JSON", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/08b-gradient.md");

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
