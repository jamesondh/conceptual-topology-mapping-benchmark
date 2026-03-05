#!/usr/bin/env bun
/**
 * Phase 9B: Gemini Transformation-Chain Blindness Analysis
 *
 * Tests whether Gemini systematically fails on transformation-chain bridges
 * while succeeding on gradient-midpoint bridges. For each of 20 pairs x 4 models,
 * computes:
 * - Bridge frequency matrix (20 x 4)
 * - Gradient vs transformation aggregate comparison (O17 third replication)
 * - Gemini interaction test (PRIMARY TEST)
 * - Gemini zero-rate analysis
 * - Transformation-type analysis (biological, manufacturing, food, leatherworking)
 * - Meta-analytic combination with Phase 8B
 * - Non-Gemini zero analysis
 * - Gemini alternative routing characterization
 * - 9 predictions evaluation
 *
 * Loads data from:
 *   results/transformation/   (Phase 9B transformation/gradient data)
 *   results/gradient/         (Phase 8B gradient/causal data for meta-analytic combination)
 *
 * Usage:
 *   bun run analysis/09b-transformation.ts
 *   bun run analysis/09b-transformation.ts --input results --output results/analysis
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
  inverseVariancePool,
} from "../src/metrics.ts";
import { MODELS } from "../src/data/pairs.ts";
import {
  PHASE9B_ALL_PAIRS,
  PHASE9B_TRANSFORMATION_PAIRS,
  PHASE9B_GRADIENT_PAIRS,
} from "../src/data/pairs-phase9.ts";
import type {
  TransformationAnalysisOutput,
  TransformationPairType,
  ElicitationResult,
  Phase9TransformationPair,
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

// ── Transformation-Type Domain Mapping ───────────────────────────────

/**
 * Maps transformation pair IDs to their process sub-type for the
 * transformation-type analysis (prediction P9).
 *
 * Domain groupings:
 * - biological: tadpole-frog, egg-chick
 * - manufacturing: iron-bridge, log-paper, cotton-shirt
 * - food: sugarcane-rum, milk-yogurt, wheat-pasta, olive-soap
 * - leatherworking: hide-shoe
 */
const TRANSFORMATION_PROCESS_TYPES: Record<string, string> = {
  "p9b-trans-tadpole-frog": "biological",
  "p9b-trans-egg-chick": "biological",
  "p9b-trans-iron-bridge": "manufacturing",
  "p9b-trans-log-paper": "manufacturing",
  "p9b-trans-cotton-shirt": "manufacturing",
  "p9b-trans-sugarcane-rum": "food",
  "p9b-trans-milk-yogurt": "food",
  "p9b-trans-wheat-pasta": "food",
  "p9b-trans-olive-soap": "food",
  "p9b-trans-hide-shoe": "leatherworking",
};

// ── Alternative Routing Classification ───────────────────────────────

/**
 * Classify Gemini's alternative routing when bridge frequency is zero
 * on transformation-chain pairs.
 *
 * Categories:
 * - "endpoint-jump": waypoints skip the intermediate and reference the
 *   start or end concept directly (e.g. "cane", "rum" for sugarcane-rum)
 * - "process-label": waypoints name the abstract process rather than the
 *   concrete intermediate (e.g. "fermentation", "distillation")
 * - "mixed": combination of both patterns
 */
function classifyTransformationRouting(
  pair: Phase9TransformationPair,
  topWaypoints: Array<{ waypoint: string; frequency: number }>,
): "endpoint-jump" | "process-label" | "mixed" {
  if (topWaypoints.length === 0) return "endpoint-jump";

  const fromLower = pair.from.toLowerCase();
  const toLower = pair.to.toLowerCase();
  const bridgeLower = pair.candidateBridge.toLowerCase();

  // Process-related terms that indicate abstract process naming
  const processTerms = getProcessTerms(pair);

  let endpointCount = 0;
  let processCount = 0;

  for (const wp of topWaypoints) {
    const wpLower = wp.waypoint.toLowerCase();
    // Skip if it somehow matches the bridge
    if (wpLower === bridgeLower) continue;

    // Check if waypoint references an endpoint
    const isEndpoint =
      wpLower.includes(fromLower) || fromLower.includes(wpLower) ||
      wpLower.includes(toLower) || toLower.includes(wpLower);

    // Check if waypoint is a process label
    const isProcess = processTerms.some(
      (term) => wpLower.includes(term) || term.includes(wpLower),
    );

    if (isEndpoint) {
      endpointCount++;
    } else if (isProcess) {
      processCount++;
    }
  }

  if (endpointCount > 0 && processCount === 0) return "endpoint-jump";
  if (processCount > 0 && endpointCount === 0) return "process-label";
  return "mixed";
}

/**
 * Get process-related terms for a transformation pair to help classify routing.
 */
function getProcessTerms(pair: Phase9TransformationPair): string[] {
  const terms: string[] = [];

  // Include the processOrDimension tokens
  if (pair.processOrDimension) {
    const tokens = pair.processOrDimension.toLowerCase().split(/[\s,+]+/);
    terms.push(...tokens);
  }

  // Add specific process terms based on known pairs
  const processMap: Record<string, string[]> = {
    "p9b-trans-sugarcane-rum": ["fermentation", "distillation", "distilling", "refining", "sugar", "alcohol", "brewing"],
    "p9b-trans-hide-shoe": ["tanning", "leather", "cobbling", "shoemaking", "curing"],
    "p9b-trans-cotton-shirt": ["weaving", "spinning", "textile", "sewing", "thread", "yarn", "cloth"],
    "p9b-trans-tadpole-frog": ["metamorphosis", "development", "growth", "transformation", "amphibian"],
    "p9b-trans-milk-yogurt": ["fermentation", "bacteria", "culturing", "curdling", "probiotic"],
    "p9b-trans-iron-bridge": ["smelting", "forging", "casting", "welding", "construction", "metallurgy"],
    "p9b-trans-egg-chick": ["incubation", "hatching", "development", "gestation", "embryonic"],
    "p9b-trans-log-paper": ["pulping", "milling", "pressing", "bleaching", "papermaking"],
    "p9b-trans-olive-soap": ["pressing", "saponification", "lye", "chemical", "extraction"],
    "p9b-trans-wheat-pasta": ["milling", "grinding", "kneading", "extrusion", "dough"],
  };

  if (processMap[pair.id]) {
    terms.push(...processMap[pair.id]);
  }

  return terms;
}

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: TransformationAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 9B: Gemini Transformation-Chain Blindness Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Experiment Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Total pairs analyzed:** ${output.metadata.transformationPairs.length + output.metadata.gradientPairs.length}`);
  lines.push(`  - Transformation-chain pairs: ${output.metadata.transformationPairs.length}`);
  lines.push(`  - Gradient-midpoint pairs: ${output.metadata.gradientPairs.length}`);
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

  for (const pair of PHASE9B_ALL_PAIRS) {
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
    const typeLabel = pair.pairType === "transformation-chain" ? "trans" : "grad";
    lines.push(`| ${pair.id} | ${typeLabel} | ${pair.candidateBridge} | ${cells.join(" | ")} |`);
  }
  lines.push("");
  lines.push("_* indicates zero bridge frequency_");
  lines.push("");

  // 3. Gradient vs Transformation Comparison
  lines.push("## 3. Gradient vs Transformation Comparison (O17 Third Replication)");
  lines.push("");
  const gvt = output.gradientVsTransformation;
  lines.push(`- **Gradient mean bridge freq:** ${gvt.gradientMean.toFixed(4)} [${gvt.gradientCI[0].toFixed(4)}, ${gvt.gradientCI[1].toFixed(4)}]`);
  lines.push(`- **Transformation mean bridge freq:** ${gvt.transformationMean.toFixed(4)} [${gvt.transformationCI[0].toFixed(4)}, ${gvt.transformationCI[1].toFixed(4)}]`);
  lines.push(`- **Difference (gradient - transformation):** ${gvt.difference.toFixed(4)} [${gvt.differenceCI[0].toFixed(4)}, ${gvt.differenceCI[1].toFixed(4)}]`);
  lines.push(`- **Gradient higher:** ${gvt.gradientHigher ? "**YES**" : "**NO**"}`);
  lines.push("");

  if (gvt.gradientHigher && gvt.differenceCI[0] > 0) {
    lines.push(
      "**[observed]** Gradient-midpoint bridges are found at significantly higher frequency " +
        "than transformation-chain bridges, replicating the O17 observation that continuous-spectrum " +
        "midpoints are more navigational than process intermediaries.",
    );
  } else {
    lines.push(
      "The gradient vs transformation difference is not significant or gradient is not higher.",
    );
  }
  lines.push("");

  // 4. Gemini Interaction Test (PRIMARY)
  lines.push("## 4. Gemini Interaction Test (PRIMARY TEST)");
  lines.push("");
  const gi = output.geminiInteraction;
  lines.push(`- **Gemini gradient mean:** ${gi.geminiGradientMean.toFixed(4)}`);
  lines.push(`- **Gemini transformation mean:** ${gi.geminiTransformationMean.toFixed(4)}`);
  lines.push(`- **Gemini gap (gradient - transformation):** ${gi.geminiGap.toFixed(4)}`);
  lines.push(`- **Non-Gemini gradient mean:** ${gi.nonGeminiGradientMean.toFixed(4)}`);
  lines.push(`- **Non-Gemini transformation mean:** ${gi.nonGeminiTransformationMean.toFixed(4)}`);
  lines.push(`- **Non-Gemini gap (gradient - transformation):** ${gi.nonGeminiGap.toFixed(4)}`);
  lines.push(`- **Interaction (Gemini gap - non-Gemini gap):** ${gi.interactionDifference.toFixed(4)} [${gi.interactionCI[0].toFixed(4)}, ${gi.interactionCI[1].toFixed(4)}]`);
  lines.push(`- **Significant interaction (CI excludes zero):** ${gi.significantInteraction ? "**YES**" : "**NO**"}`);
  lines.push("");

  if (gi.significantInteraction) {
    lines.push(
      "**[observed]** Gemini shows a significantly larger gradient-vs-transformation performance gap " +
        "compared to non-Gemini models, confirming a selective deficit in transformation-chain " +
        "bridge detection (transformation-chain blindness).",
    );
  } else {
    lines.push(
      "The interaction effect is not statistically significant. Gemini does not show " +
        "a selective transformation-chain deficit relative to other models.",
    );
  }
  lines.push("");

  // 5. Gemini Zero-Rate Analysis
  lines.push("## 5. Gemini Zero-Rate Analysis");
  lines.push("");
  const zr = output.geminiZeroRate;
  lines.push(`- **Gemini transformation zeros:** ${zr.geminiTransformationZeros} / ${zr.geminiTransformationTotal}`);
  lines.push(`- **Gemini gradient zeros:** ${zr.geminiGradientZeros} / ${zr.geminiGradientTotal}`);
  lines.push(`- **Non-Gemini transformation zeros:** ${zr.nonGeminiTransformationZeros}`);
  lines.push(`- **Non-Gemini gradient zeros:** ${zr.nonGeminiGradientZeros}`);
  lines.push("");

  if (zr.geminiTransformationZeros > zr.geminiGradientZeros) {
    lines.push(
      "**[observed]** Gemini shows substantially more zero-frequency transformation pairs " +
        "than gradient pairs, confirming that the deficit is specific to transformation-chain bridges.",
    );
  }
  lines.push("");

  // 6. Transformation-Type Analysis
  lines.push("## 6. Transformation-Type Analysis");
  lines.push("");
  lines.push("| Process Type | Pairs | Gemini Mean | Gemini Zeros | Non-Gemini Mean |");
  lines.push("|-------------|-------|-------------|--------------|-----------------|");

  for (const tt of output.transformationTypeAnalysis) {
    lines.push(
      `| ${tt.processType} | ${tt.pairs.join(", ")} | ${tt.geminiMeanFreq.toFixed(3)} | ${tt.geminiZeroCount} | ${tt.nonGeminiMeanFreq.toFixed(3)} |`,
    );
  }
  lines.push("");

  const processTypesWithZeros = output.transformationTypeAnalysis.filter((tt) => tt.geminiZeroCount > 0);
  lines.push(`Gemini zeros span ${processTypesWithZeros.length} of ${output.transformationTypeAnalysis.length} process sub-types.`);
  lines.push("");

  // 7. Meta-Analytic Combination with Phase 8B
  lines.push("## 7. Meta-Analytic Combination with Phase 8B");
  lines.push("");
  const ma = output.metaAnalytic;
  lines.push(`- **Phase 9B interaction:** ${ma.phase9BInteraction.toFixed(4)} [${ma.phase9BCI[0].toFixed(4)}, ${ma.phase9BCI[1].toFixed(4)}]`);
  lines.push(`- **Phase 8B interaction:** ${ma.phase8BInteraction.toFixed(4)} [${ma.phase8BCI[0].toFixed(4)}, ${ma.phase8BCI[1].toFixed(4)}]`);
  lines.push(`- **Pooled interaction (inverse-variance):** ${ma.pooledInteraction.toFixed(4)} [${ma.pooledCI[0].toFixed(4)}, ${ma.pooledCI[1].toFixed(4)}]`);
  lines.push(`- **Pooled significant (CI excludes zero):** ${ma.pooledSignificant ? "**YES**" : "**NO**"}`);
  lines.push("");

  if (ma.pooledSignificant) {
    lines.push(
      "**[observed]** The pooled meta-analytic interaction confirms a robust Gemini-specific deficit " +
        "across both Phase 8B (gradient vs causal) and Phase 9B (gradient vs transformation) experiments.",
    );
  } else {
    lines.push(
      "The pooled meta-analytic interaction does not reach significance.",
    );
  }
  lines.push("");

  // 8. Per-Model Performance
  lines.push("## 8. Per-Model Performance");
  lines.push("");
  lines.push("| Model | Gradient Mean | Transformation Mean | Gap (grad - trans) |");
  lines.push("|-------|--------------|--------------------|--------------------|");

  for (const pm of output.perModelGradient) {
    lines.push(
      `| ${pm.modelId} | ${pm.gradientMean.toFixed(4)} | ${pm.transformationMean.toFixed(4)} | ${pm.gap.toFixed(4)} |`,
    );
  }
  lines.push("");

  // 9. Non-Gemini Zero Analysis
  lines.push("## 9. Non-Gemini Zero Analysis");
  lines.push("");
  lines.push("| Model | Transformation Zeros | Gradient Zeros |");
  lines.push("|-------|---------------------|----------------|");

  for (const nz of output.nonGeminiZeroAnalysis) {
    lines.push(`| ${nz.modelId} | ${nz.transformationZeros} | ${nz.gradientZeros} |`);
  }
  lines.push("");

  // 10. Gemini Alternative Routing
  lines.push("## 10. Gemini Alternative Routing on Zero-Frequency Transformation Pairs");
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
    lines.push("_No zero-frequency transformation pairs found for Gemini._");
  }
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

  console.log("Conceptual Topology Mapping Benchmark - Gemini Transformation-Chain Blindness Analysis");
  console.log("======================================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data ─────────────────────────────────────────────────────

  console.log("Loading Phase 9B transformation data...");
  const transformationDir = join(inputDir, "transformation");
  const transformationResults = await loadResultsFromDir(transformationDir);
  console.log(`  Loaded ${transformationResults.length} results from ${transformationDir}/`);

  console.log("Loading Phase 8B gradient data (for meta-analytic combination)...");
  const gradientDir = join(inputDir, "gradient");
  const gradientResults = await loadResultsFromDir(gradientDir);
  console.log(`  Loaded ${gradientResults.length} results from ${gradientDir}/`);
  console.log("");

  const transformationLookup = buildWaypointLookup(transformationResults);
  const gradientLookup = buildWaypointLookup(gradientResults);

  console.log(`  Transformation lookup keys: ${transformationLookup.size}`);
  console.log(`  Gradient lookup keys: ${gradientLookup.size}`);
  console.log("");

  const modelIds = MODELS.map((m) => m.id);

  // ── 1. Build Bridge Frequency Matrix (20 x 4) ───────────────────

  console.log("Computing bridge frequency matrix (20 pairs x 4 models)...");

  const bridgeFreqMatrix: TransformationAnalysisOutput["bridgeFreqMatrix"] = [];
  let totalNewRuns = 0;
  let totalReusedRuns = 0;

  for (const pair of PHASE9B_ALL_PAIRS) {
    for (const modelId of modelIds) {
      // Try multiple key patterns for looking up runs
      const keyPatterns = [
        `${pair.id}::${modelId}`,
        `${pair.id}--primary::${modelId}`,
        `${pair.id}--fwd::${modelId}`,
      ];

      let results: ElicitationResult[] = [];
      for (const key of keyPatterns) {
        results = transformationLookup.get(key) ?? [];
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

  // ── 2. Gradient vs Transformation Comparison (O17 third replication) ──

  console.log("Computing gradient vs transformation comparison...");

  const allGradientFreqs = bridgeFreqMatrix
    .filter((e) => e.pairType === "gradient-midpoint")
    .map((e) => e.bridgeFrequency);
  const allTransformationFreqs = bridgeFreqMatrix
    .filter((e) => e.pairType === "transformation-chain")
    .map((e) => e.bridgeFrequency);

  const gradientMeanAll = mean(allGradientFreqs);
  const transformationMeanAll = mean(allTransformationFreqs);
  const gradientCI = bootstrapCI(allGradientFreqs);
  const transformationCI = bootstrapCI(allTransformationFreqs);

  // Bootstrap CI on difference (gradient - transformation)
  const nBootstrap = 1000;
  const diffBootstrap: number[] = [];
  for (let i = 0; i < nBootstrap; i++) {
    const sampleG: number[] = [];
    for (let j = 0; j < allGradientFreqs.length; j++) {
      sampleG.push(allGradientFreqs[Math.floor(seededRandom() * allGradientFreqs.length)]);
    }
    const sampleT: number[] = [];
    for (let j = 0; j < allTransformationFreqs.length; j++) {
      sampleT.push(allTransformationFreqs[Math.floor(seededRandom() * allTransformationFreqs.length)]);
    }
    diffBootstrap.push(mean(sampleG) - mean(sampleT));
  }
  diffBootstrap.sort((a, b) => a - b);
  const differenceCI: [number, number] = [
    diffBootstrap[Math.floor(nBootstrap * 0.025)],
    diffBootstrap[Math.floor(nBootstrap * 0.975)],
  ];
  const differenceVal = gradientMeanAll - transformationMeanAll;

  const gradientVsTransformation: TransformationAnalysisOutput["gradientVsTransformation"] = {
    gradientMean: gradientMeanAll,
    gradientCI,
    transformationMean: transformationMeanAll,
    transformationCI,
    difference: differenceVal,
    differenceCI,
    gradientHigher: differenceVal > 0 && differenceCI[0] > 0,
  };

  console.log(`  Gradient mean: ${gradientMeanAll.toFixed(4)} [${gradientCI[0].toFixed(4)}, ${gradientCI[1].toFixed(4)}]`);
  console.log(`  Transformation mean: ${transformationMeanAll.toFixed(4)} [${transformationCI[0].toFixed(4)}, ${transformationCI[1].toFixed(4)}]`);
  console.log(`  Difference: ${differenceVal.toFixed(4)} [${differenceCI[0].toFixed(4)}, ${differenceCI[1].toFixed(4)}]`);
  console.log(`  Gradient higher (CI excludes zero): ${gradientVsTransformation.gradientHigher}`);
  console.log("");

  // ── 3. Gemini Interaction Test (PRIMARY TEST) ─────────────────────

  console.log("Computing Gemini interaction test...");

  const GEMINI_ID = "gemini";
  const nonGeminiIds = modelIds.filter((m) => m !== GEMINI_ID);

  // Collect per-pair bridge frequencies by model group and pair type
  const geminiGradientFreqs: number[] = [];
  const geminiTransformationFreqs: number[] = [];
  const nonGeminiGradientFreqs: number[] = [];
  const nonGeminiTransformationFreqs: number[] = [];

  for (const entry of bridgeFreqMatrix) {
    if (entry.modelId === GEMINI_ID) {
      if (entry.pairType === "gradient-midpoint") {
        geminiGradientFreqs.push(entry.bridgeFrequency);
      } else {
        geminiTransformationFreqs.push(entry.bridgeFrequency);
      }
    } else {
      if (entry.pairType === "gradient-midpoint") {
        nonGeminiGradientFreqs.push(entry.bridgeFrequency);
      } else {
        nonGeminiTransformationFreqs.push(entry.bridgeFrequency);
      }
    }
  }

  const geminiGradientMean = mean(geminiGradientFreqs);
  const geminiTransformationMean = mean(geminiTransformationFreqs);
  const geminiGap = geminiGradientMean - geminiTransformationMean;

  const nonGeminiGradientMean = mean(nonGeminiGradientFreqs);
  const nonGeminiTransformationMean = mean(nonGeminiTransformationFreqs);
  const nonGeminiGap = nonGeminiGradientMean - nonGeminiTransformationMean;

  const interactionDifference = geminiGap - nonGeminiGap;

  // Compute interaction CI using the dedicated bootstrap function
  const interactionCI = bootstrapInteractionCI(
    geminiGradientFreqs,
    geminiTransformationFreqs,
    nonGeminiGradientFreqs,
    nonGeminiTransformationFreqs,
  );

  // Significant if CI excludes zero
  const significantInteraction =
    (interactionCI[0] > 0 && interactionCI[1] > 0) ||
    (interactionCI[0] < 0 && interactionCI[1] < 0);

  const geminiInteraction: TransformationAnalysisOutput["geminiInteraction"] = {
    geminiGradientMean,
    geminiTransformationMean,
    geminiGap,
    nonGeminiGradientMean,
    nonGeminiTransformationMean,
    nonGeminiGap,
    interactionDifference,
    interactionCI,
    significantInteraction,
  };

  console.log(`  Gemini gradient mean: ${geminiGradientMean.toFixed(4)}`);
  console.log(`  Gemini transformation mean: ${geminiTransformationMean.toFixed(4)}`);
  console.log(`  Gemini gap: ${geminiGap.toFixed(4)}`);
  console.log(`  Non-Gemini gradient mean: ${nonGeminiGradientMean.toFixed(4)}`);
  console.log(`  Non-Gemini transformation mean: ${nonGeminiTransformationMean.toFixed(4)}`);
  console.log(`  Non-Gemini gap: ${nonGeminiGap.toFixed(4)}`);
  console.log(`  Interaction: ${interactionDifference.toFixed(4)} [${interactionCI[0].toFixed(4)}, ${interactionCI[1].toFixed(4)}]`);
  console.log(`  Significant: ${significantInteraction}`);
  console.log("");

  // ── 4. Gemini Zero-Rate Analysis ──────────────────────────────────

  console.log("Computing Gemini zero-rate analysis...");

  const geminiTransformationEntries = bridgeFreqMatrix.filter(
    (e) => e.modelId === GEMINI_ID && e.pairType === "transformation-chain",
  );
  const geminiGradientEntries = bridgeFreqMatrix.filter(
    (e) => e.modelId === GEMINI_ID && e.pairType === "gradient-midpoint",
  );
  const nonGeminiTransformationEntries = bridgeFreqMatrix.filter(
    (e) => e.modelId !== GEMINI_ID && e.pairType === "transformation-chain",
  );
  const nonGeminiGradientEntries = bridgeFreqMatrix.filter(
    (e) => e.modelId !== GEMINI_ID && e.pairType === "gradient-midpoint",
  );

  const geminiZeroRate: TransformationAnalysisOutput["geminiZeroRate"] = {
    geminiTransformationZeros: geminiTransformationEntries.filter((e) => e.isZero).length,
    geminiTransformationTotal: geminiTransformationEntries.length,
    geminiGradientZeros: geminiGradientEntries.filter((e) => e.isZero).length,
    geminiGradientTotal: geminiGradientEntries.length,
    nonGeminiTransformationZeros: nonGeminiTransformationEntries.filter((e) => e.isZero).length,
    nonGeminiGradientZeros: nonGeminiGradientEntries.filter((e) => e.isZero).length,
  };

  console.log(`  Gemini transformation zeros: ${geminiZeroRate.geminiTransformationZeros}/${geminiZeroRate.geminiTransformationTotal}`);
  console.log(`  Gemini gradient zeros: ${geminiZeroRate.geminiGradientZeros}/${geminiZeroRate.geminiGradientTotal}`);
  console.log(`  Non-Gemini transformation zeros: ${geminiZeroRate.nonGeminiTransformationZeros}`);
  console.log(`  Non-Gemini gradient zeros: ${geminiZeroRate.nonGeminiGradientZeros}`);
  console.log("");

  // ── 5. Transformation-Type Analysis ───────────────────────────────

  console.log("Computing transformation-type analysis...");

  const processTypes = [...new Set(Object.values(TRANSFORMATION_PROCESS_TYPES))].sort();
  const transformationTypeAnalysis: TransformationAnalysisOutput["transformationTypeAnalysis"] = [];

  for (const processType of processTypes) {
    const pairIds = Object.entries(TRANSFORMATION_PROCESS_TYPES)
      .filter(([_, pt]) => pt === processType)
      .map(([id]) => id);

    const geminiFreqs = bridgeFreqMatrix
      .filter((e) => e.modelId === GEMINI_ID && pairIds.includes(e.pairId))
      .map((e) => e.bridgeFrequency);

    const geminiZeroCount = bridgeFreqMatrix
      .filter((e) => e.modelId === GEMINI_ID && pairIds.includes(e.pairId) && e.isZero)
      .length;

    const nonGeminiFreqs = bridgeFreqMatrix
      .filter((e) => e.modelId !== GEMINI_ID && pairIds.includes(e.pairId))
      .map((e) => e.bridgeFrequency);

    transformationTypeAnalysis.push({
      processType,
      pairs: pairIds,
      geminiMeanFreq: mean(geminiFreqs),
      geminiZeroCount,
      nonGeminiMeanFreq: mean(nonGeminiFreqs),
    });

    console.log(
      `  ${processType}: gemini_mean=${mean(geminiFreqs).toFixed(3)}, gemini_zeros=${geminiZeroCount}, non_gemini_mean=${mean(nonGeminiFreqs).toFixed(3)}`,
    );
  }
  console.log("");

  // ── 6. Meta-Analytic Combination with Phase 8B ────────────────────

  console.log("Computing meta-analytic combination with Phase 8B...");

  // Phase 9B interaction (already computed above)
  const phase9BInteraction = interactionDifference;
  const phase9BCI = interactionCI;

  // Compute Phase 8B interaction from gradient data
  // Phase 8B uses "gradient-midpoint" and "causal-chain" pair types
  // Pair IDs: "p8b-grad-*" for gradient, "p8b-causal-*" for causal
  const phase8BGeminiGradient: number[] = [];
  const phase8BGeminiCausal: number[] = [];
  const phase8BNonGeminiGradient: number[] = [];
  const phase8BNonGeminiCausal: number[] = [];

  // We need to import Phase 8B pair definitions to know bridge concepts
  // Instead, load from gradient results and compute bridge frequencies inline
  let phase8BDataAvailable = false;

  try {
    // Dynamic import for Phase 8B pairs
    const phase8Module = await import("../src/data/pairs-phase8.ts");
    const PHASE8B_ALL = phase8Module.PHASE8B_ALL_PAIRS;

    for (const pair of PHASE8B_ALL) {
      for (const modelId of modelIds) {
        const keyPatterns = [
          `${pair.id}::${modelId}`,
          `${pair.id}--primary::${modelId}`,
          `${pair.id}--fwd::${modelId}`,
        ];

        let p8bResults: ElicitationResult[] = [];
        for (const key of keyPatterns) {
          p8bResults = gradientLookup.get(key) ?? [];
          if (p8bResults.length > 0) break;
        }

        if (p8bResults.length === 0) continue;

        const runs = waypointsOnly(p8bResults);
        totalReusedRuns += runs.length;
        const freq = computeBridgeFrequency(runs, pair.candidateBridge);

        if (modelId === GEMINI_ID) {
          if (pair.pairType === "gradient-midpoint") {
            phase8BGeminiGradient.push(freq);
          } else {
            phase8BGeminiCausal.push(freq);
          }
        } else {
          if (pair.pairType === "gradient-midpoint") {
            phase8BNonGeminiGradient.push(freq);
          } else {
            phase8BNonGeminiCausal.push(freq);
          }
        }
      }
    }

    phase8BDataAvailable =
      phase8BGeminiGradient.length > 0 &&
      phase8BGeminiCausal.length > 0 &&
      phase8BNonGeminiGradient.length > 0 &&
      phase8BNonGeminiCausal.length > 0;
  } catch {
    console.log("  Could not load Phase 8B pair definitions; skipping meta-analytic combination.");
  }

  let metaAnalytic: TransformationAnalysisOutput["metaAnalytic"];

  if (phase8BDataAvailable) {
    const p8bGeminiGap = mean(phase8BGeminiGradient) - mean(phase8BGeminiCausal);
    const p8bNonGeminiGap = mean(phase8BNonGeminiGradient) - mean(phase8BNonGeminiCausal);
    const phase8BInteraction = p8bGeminiGap - p8bNonGeminiGap;
    const phase8BInteractionCI = bootstrapInteractionCI(
      phase8BGeminiGradient,
      phase8BGeminiCausal,
      phase8BNonGeminiGradient,
      phase8BNonGeminiCausal,
    );

    // Inverse-variance pooling
    const pooled = inverseVariancePool(
      phase9BInteraction,
      phase9BCI,
      phase8BInteraction,
      phase8BInteractionCI,
    );
    const pooledSignificant =
      (pooled.pooledCI[0] > 0 && pooled.pooledCI[1] > 0) ||
      (pooled.pooledCI[0] < 0 && pooled.pooledCI[1] < 0);

    metaAnalytic = {
      phase9BInteraction,
      phase9BCI,
      phase8BInteraction,
      phase8BCI: phase8BInteractionCI,
      pooledInteraction: pooled.pooled,
      pooledCI: pooled.pooledCI,
      pooledSignificant,
    };

    console.log(`  Phase 9B interaction: ${phase9BInteraction.toFixed(4)} [${phase9BCI[0].toFixed(4)}, ${phase9BCI[1].toFixed(4)}]`);
    console.log(`  Phase 8B interaction: ${phase8BInteraction.toFixed(4)} [${phase8BInteractionCI[0].toFixed(4)}, ${phase8BInteractionCI[1].toFixed(4)}]`);
    console.log(`  Pooled interaction: ${pooled.pooled.toFixed(4)} [${pooled.pooledCI[0].toFixed(4)}, ${pooled.pooledCI[1].toFixed(4)}]`);
    console.log(`  Pooled significant: ${pooledSignificant}`);
  } else {
    // If Phase 8B data is not available, report Phase 9B only
    metaAnalytic = {
      phase9BInteraction,
      phase9BCI,
      phase8BInteraction: 0,
      phase8BCI: [0, 0],
      pooledInteraction: phase9BInteraction,
      pooledCI: phase9BCI,
      pooledSignificant:
        (phase9BCI[0] > 0 && phase9BCI[1] > 0) ||
        (phase9BCI[0] < 0 && phase9BCI[1] < 0),
    };
    console.log("  Phase 8B data not available; using Phase 9B interaction only.");
    console.log(`  Phase 9B interaction: ${phase9BInteraction.toFixed(4)} [${phase9BCI[0].toFixed(4)}, ${phase9BCI[1].toFixed(4)}]`);
  }
  console.log("");

  // ── 7. Per-Model Performance ──────────────────────────────────────

  console.log("Computing per-model performance...");

  const perModelGradient: TransformationAnalysisOutput["perModelGradient"] = [];

  for (const modelId of modelIds) {
    const modelGradient = bridgeFreqMatrix
      .filter((e) => e.modelId === modelId && e.pairType === "gradient-midpoint")
      .map((e) => e.bridgeFrequency);
    const modelTransformation = bridgeFreqMatrix
      .filter((e) => e.modelId === modelId && e.pairType === "transformation-chain")
      .map((e) => e.bridgeFrequency);

    const gradMean = mean(modelGradient);
    const transMean = mean(modelTransformation);
    const gap = gradMean - transMean;

    perModelGradient.push({
      modelId,
      gradientMean: gradMean,
      transformationMean: transMean,
      gap,
    });

    console.log(
      `  ${modelId}: gradient=${gradMean.toFixed(4)}, transformation=${transMean.toFixed(4)}, gap=${gap.toFixed(4)}`,
    );
  }
  console.log("");

  // ── 8. Non-Gemini Zero Analysis ───────────────────────────────────

  console.log("Computing non-Gemini zero analysis...");

  const nonGeminiZeroAnalysis: TransformationAnalysisOutput["nonGeminiZeroAnalysis"] = [];

  for (const modelId of nonGeminiIds) {
    const transZeros = bridgeFreqMatrix
      .filter((e) => e.modelId === modelId && e.pairType === "transformation-chain" && e.isZero)
      .length;
    const gradZeros = bridgeFreqMatrix
      .filter((e) => e.modelId === modelId && e.pairType === "gradient-midpoint" && e.isZero)
      .length;

    nonGeminiZeroAnalysis.push({
      modelId,
      transformationZeros: transZeros,
      gradientZeros: gradZeros,
    });

    console.log(`  ${modelId}: transformation_zeros=${transZeros}, gradient_zeros=${gradZeros}`);
  }
  console.log("");

  // ── 9. Gemini Alternative Routing ─────────────────────────────────

  console.log("Analyzing Gemini alternative routing on zero-frequency transformation pairs...");

  const geminiAlternativeRouting: TransformationAnalysisOutput["geminiAlternativeRouting"] = [];

  const geminiZeroTransformationPairIds = geminiTransformationEntries
    .filter((e) => e.isZero)
    .map((e) => e.pairId);

  for (const pairId of geminiZeroTransformationPairIds) {
    const pair = PHASE9B_ALL_PAIRS.find((p) => p.id === pairId);
    if (!pair) continue;

    // Get Gemini runs for this pair
    const keyPatterns = [
      `${pairId}::${GEMINI_ID}`,
      `${pairId}--primary::${GEMINI_ID}`,
      `${pairId}--fwd::${GEMINI_ID}`,
    ];

    let geminiResults: ElicitationResult[] = [];
    for (const key of keyPatterns) {
      geminiResults = transformationLookup.get(key) ?? [];
      if (geminiResults.length > 0) break;
    }

    if (geminiResults.length === 0) continue;

    const runs = waypointsOnly(geminiResults);
    const freqs = computeWaypointFrequencies(runs);

    // Get top 3 waypoints
    const topWaypoints = freqs.slice(0, 3).map((f) => ({
      waypoint: f.waypoint,
      frequency: f.frequency,
    }));

    const routingType = classifyTransformationRouting(pair, topWaypoints);

    geminiAlternativeRouting.push({
      pairId,
      topWaypoints,
      routingType,
    });

    const wpStr = topWaypoints.map((wp) => `${wp.waypoint}(${wp.frequency.toFixed(2)})`).join(", ");
    console.log(`  ${pairId}: routing=${routingType}, top=[${wpStr}]`);
  }
  console.log("");

  // ── 10. Predictions Evaluation (9 predictions) ──────────────────────

  console.log("Evaluating predictions...");

  const predictions: TransformationAnalysisOutput["predictions"] = [];

  // P1: Gradient > transformation by at least 0.15, CI excludes zero
  const p1Passes =
    allGradientFreqs.length > 0 &&
    allTransformationFreqs.length > 0 &&
    differenceVal >= 0.15 &&
    differenceCI[0] > 0;
  predictions.push({
    id: 1,
    description: "Gradient > transformation by at least 0.15, CI excludes zero",
    result:
      allGradientFreqs.length === 0 || allTransformationFreqs.length === 0
        ? "insufficient data"
        : p1Passes
          ? "confirmed"
          : "not confirmed",
    value: `diff=${differenceVal.toFixed(3)} [${differenceCI[0].toFixed(3)}, ${differenceCI[1].toFixed(3)}]`,
  });

  // P2: Gemini transformation mean < 0.30
  const p2Passes = geminiTransformationFreqs.length > 0 && geminiTransformationMean < 0.30;
  predictions.push({
    id: 2,
    description: "Gemini transformation mean < 0.30",
    result:
      geminiTransformationFreqs.length === 0
        ? "insufficient data"
        : p2Passes
          ? "confirmed"
          : "not confirmed",
    value: `gemini_transformation_mean=${geminiTransformationMean.toFixed(3)}`,
  });

  // P3: Gemini gradient mean > 0.45
  const p3Passes = geminiGradientFreqs.length > 0 && geminiGradientMean > 0.45;
  predictions.push({
    id: 3,
    description: "Gemini gradient mean > 0.45",
    result:
      geminiGradientFreqs.length === 0
        ? "insufficient data"
        : p3Passes
          ? "confirmed"
          : "not confirmed",
    value: `gemini_gradient_mean=${geminiGradientMean.toFixed(3)}`,
  });

  // P4: Gemini gap >= 0.15 larger than non-Gemini gap, interaction CI excludes zero
  // Directional test: Gemini gap should be LARGER (more positive) than non-Gemini gap
  const p4Passes =
    significantInteraction && interactionDifference >= 0.15;
  predictions.push({
    id: 4,
    description: "Gemini gap >= 0.15 larger than non-Gemini gap, interaction CI excludes zero",
    result:
      geminiGradientFreqs.length === 0 || nonGeminiGradientFreqs.length === 0
        ? "insufficient data"
        : p4Passes
          ? "confirmed"
          : "not confirmed",
    value: `interaction=${interactionDifference.toFixed(3)} [${interactionCI[0].toFixed(3)}, ${interactionCI[1].toFixed(3)}]`,
  });

  // P5: Gemini 0.000 on at least 5 of 10 transformation pairs
  const p5Passes =
    geminiZeroRate.geminiTransformationTotal > 0 &&
    geminiZeroRate.geminiTransformationZeros >= 5;
  predictions.push({
    id: 5,
    description: "Gemini 0.000 on at least 5 of 10 transformation pairs",
    result:
      geminiZeroRate.geminiTransformationTotal === 0
        ? "insufficient data"
        : p5Passes
          ? "confirmed"
          : "not confirmed",
    value: `${geminiZeroRate.geminiTransformationZeros}/${geminiZeroRate.geminiTransformationTotal} zeros`,
  });

  // P6: Gemini 0.000 on at most 2 of 10 gradient pairs
  const p6Passes =
    geminiZeroRate.geminiGradientTotal > 0 &&
    geminiZeroRate.geminiGradientZeros <= 2;
  predictions.push({
    id: 6,
    description: "Gemini 0.000 on at most 2 of 10 gradient pairs",
    result:
      geminiZeroRate.geminiGradientTotal === 0
        ? "insufficient data"
        : p6Passes
          ? "confirmed"
          : "not confirmed",
    value: `${geminiZeroRate.geminiGradientZeros}/${geminiZeroRate.geminiGradientTotal} zeros`,
  });

  // P7: Non-Gemini gradient mean > 0.55, transformation mean > 0.40, gap < 0.20
  const p7GradientOk = nonGeminiGradientMean > 0.55;
  const p7TransOk = nonGeminiTransformationMean > 0.40;
  const p7GapOk = Math.abs(nonGeminiGap) < 0.20;
  const p7Passes = p7GradientOk && p7TransOk && p7GapOk;
  predictions.push({
    id: 7,
    description: "Non-Gemini gradient mean > 0.55, transformation > 0.40, gap < 0.20",
    result:
      nonGeminiGradientFreqs.length === 0
        ? "insufficient data"
        : p7Passes
          ? "confirmed"
          : "not confirmed",
    value: `grad=${nonGeminiGradientMean.toFixed(3)}, trans=${nonGeminiTransformationMean.toFixed(3)}, gap=${nonGeminiGap.toFixed(3)}`,
  });

  // P8: Meta-analytic combination CI excludes zero
  const p8Passes = metaAnalytic.pooledSignificant;
  predictions.push({
    id: 8,
    description: "Meta-analytic combination CI excludes zero",
    result:
      !phase8BDataAvailable
        ? "insufficient data"
        : p8Passes
          ? "confirmed"
          : "not confirmed",
    value: `pooled=${metaAnalytic.pooledInteraction.toFixed(3)} [${metaAnalytic.pooledCI[0].toFixed(3)}, ${metaAnalytic.pooledCI[1].toFixed(3)}]`,
  });

  // P9: Gemini zeros span >= 3/4 process sub-types
  const processTypesWithZeros = transformationTypeAnalysis.filter((tt) => tt.geminiZeroCount > 0);
  const p9Passes = processTypesWithZeros.length >= 3;
  predictions.push({
    id: 9,
    description: "Gemini zeros span >= 3 of 4 process sub-types",
    result:
      geminiZeroRate.geminiTransformationTotal === 0
        ? "insufficient data"
        : p9Passes
          ? "confirmed"
          : "not confirmed",
    value: `${processTypesWithZeros.length}/${processTypes.length} process types with zeros`,
  });

  for (const pred of predictions) {
    console.log(`  P${pred.id}: ${pred.result} (${pred.value})`);
  }
  console.log("");

  // ── Build Output ───────────────────────────────────────────────────

  const analysisOutput: TransformationAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      transformationPairs: PHASE9B_TRANSFORMATION_PAIRS.map((p) => p.id),
      gradientPairs: PHASE9B_GRADIENT_PAIRS.map((p) => p.id),
      models: MODELS.map((m) => m.id),
      totalNewRuns,
      totalReusedRuns,
    },
    bridgeFreqMatrix,
    gradientVsTransformation,
    geminiInteraction,
    geminiZeroRate,
    transformationTypeAnalysis,
    metaAnalytic,
    perModelGradient,
    nonGeminiZeroAnalysis,
    geminiAlternativeRouting,
    predictions,
  };

  // ── Write Outputs ──────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "09b-transformation.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Gemini transformation-chain blindness analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("transformation-analysis")
    .description("Analyze Gemini transformation-chain blindness from Phase 9B data")
    .option("--input <dir>", "base results directory", "results")
    .option("--output <dir>", "output directory for analysis JSON", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/09b-transformation.md");

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
