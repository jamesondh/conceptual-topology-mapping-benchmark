#!/usr/bin/env bun
/**
 * Phase 5A: Cue-Strength Gradient Analysis
 *
 * For each Phase 5A triple (A, B, C) x model, computes:
 * - Waypoint transitivity (reusing computeTransitivityMetrics)
 * - Bridge frequency with bootstrap CI per cue level
 * - Per-family monotonicity check (bridge freq decreases with cue strength)
 * - Cross-family logistic fit via fitLogistic()
 * - Gemini threshold comparison (bootstrap CI on threshold difference)
 * - Control validation
 * - Prediction evaluation
 *
 * Loads data from:
 *   results/pilot/           (Phase 1)
 *   results/reversals/       (Phase 2)
 *   results/transitivity/    (Phase 3B)
 *   results/targeted-bridges/ (Phase 4B)
 *   results/cue-strength/    (Phase 5A)
 *
 * Usage:
 *   bun run analysis/05a-cue-strength.ts
 *   bun run analysis/05a-cue-strength.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  seededRandom,
  computeTransitivityMetrics,
  computeBridgeFrequency,
  bootstrapBridgeFrequencyCI,
  bootstrapCI,
  mean,
  fitLogistic,
} from "../metrics.ts";
import { MODELS } from "../pairs.ts";
import { PHASE5A_TRIPLES } from "../triples-phase5.ts";
import { TRIPLES as PHASE3_TRIPLES } from "../triples.ts";
import type {
  ElicitationResult,
  TransitivityMetrics,
  CueStrengthAnalysisOutput,
  CueStrengthFamilyResult,
} from "../types.ts";

// -- Data Loading -------------------------------------------------------------

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

interface TaggedResult extends ElicitationResult {
  /** Which source directory this result came from */
  sourcePhase: "pilot" | "reversals" | "transitivity" | "targeted-bridges" | "cue-strength";
}

async function loadResultsFromDir(
  dir: string,
  sourcePhase: TaggedResult["sourcePhase"],
): Promise<TaggedResult[]> {
  const jsonPaths = await readJsonFilesRecursive(dir);
  const results: TaggedResult[] = [];
  for (const p of jsonPaths) {
    try {
      const content = await readFile(p, "utf-8");
      const parsed = JSON.parse(content) as ElicitationResult;
      if (
        parsed.model &&
        parsed.pair &&
        Array.isArray(parsed.canonicalizedWaypoints)
      ) {
        results.push({ ...parsed, sourcePhase });
      }
    } catch {
      // Skip malformed
    }
  }
  return results;
}

/**
 * Build a lookup: pairId::modelId -> TaggedResult[] (successful runs with source tagging).
 */
function buildWaypointLookup(
  results: TaggedResult[],
): Map<string, TaggedResult[]> {
  const lookup = new Map<string, TaggedResult[]>();
  for (const r of results) {
    if (r.failureMode) continue;
    if (r.canonicalizedWaypoints.length === 0) continue;
    const key = `${r.pair.id}::${r.modelShortId}`;
    if (!lookup.has(key)) lookup.set(key, []);
    lookup.get(key)!.push(r);
  }
  return lookup;
}

/**
 * Lookup waypoint runs for a leg, trying multiple key strategies:
 * 1. Phase 5A synthetic pair ID: `${tripleId}--${legId}`
 * 2. The reusable pair ID from the triple's reusableLegsWithSource
 * 3. Phase 3B synthetic pair IDs -- only for Phase 3 triples whose concepts match
 *
 * All added runs are filtered to ensure pair.from/pair.to match the expected
 * direction (canonicalized to lowercase), preventing cross-contamination from
 * reversed runs or unrelated concept pairs sharing the same leg suffix.
 */
function getRunsForLeg(
  tripleId: string,
  legId: string,
  from: string,
  to: string,
  topUpPairId: string | null,
  modelId: string,
  lookup: Map<string, TaggedResult[]>,
): TaggedResult[] {
  const candidates: TaggedResult[] = [];
  const seen = new Set<string>();
  const fromLower = from.toLowerCase();
  const toLower = to.toLowerCase();

  function addFromKey(key: string): void {
    const runs = lookup.get(key);
    if (!runs) return;
    for (const r of runs) {
      // Filter to matching direction only
      if (
        r.pair.from.toLowerCase() !== fromLower ||
        r.pair.to.toLowerCase() !== toLower
      ) {
        continue;
      }
      const uid = r.runId ?? `${r.timestamp}-${r.pair.id}`;
      if (!seen.has(uid)) {
        seen.add(uid);
        candidates.push(r);
      }
    }
  }

  // 1. Phase 5A synthetic pair ID
  addFromKey(`${tripleId}--${legId}::${modelId}`);

  // 2. Top-up source pair ID from reusableLegsWithSource
  if (topUpPairId) {
    addFromKey(`${topUpPairId}::${modelId}`);
  }

  // 3. Phase 3B synthetic pair IDs -- only check triples whose leg concepts match
  for (const p3Triple of PHASE3_TRIPLES) {
    const legConcepts: Record<string, [string, string]> = {
      AB: [p3Triple.A, p3Triple.B],
      BC: [p3Triple.B, p3Triple.C],
      AC: [p3Triple.A, p3Triple.C],
    };
    const [p3From, p3To] = legConcepts[legId] ?? ["", ""];
    if (
      p3From.toLowerCase() === fromLower &&
      p3To.toLowerCase() === toLower
    ) {
      addFromKey(`${p3Triple.id}--${legId}::${modelId}`);
    }
  }

  return candidates;
}

/**
 * Extract just the waypoint arrays from tagged results.
 */
function waypointsOnly(results: TaggedResult[]): string[][] {
  return results.map((r) => r.canonicalizedWaypoints);
}

// -- Findings Report ----------------------------------------------------------

function generateFindings(output: CueStrengthAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 5A: Cue-Strength Gradient Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // -- 1. Experiment Overview -------------------------------------------------
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Triples analyzed:** ${output.metadata.triples.length}`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **Families:** ${output.metadata.families.join(", ")}`);
  lines.push(`- **New API runs (Phase 5A):** ${output.metadata.totalNewRuns}`);
  lines.push(`- **Reused run usages:** ${output.metadata.totalReusedRuns}`);
  lines.push(`- **Total triple/model combinations:** ${output.tripleModelMetrics.length}`);
  lines.push("");

  // -- 2. Per-Family Gradient Results -----------------------------------------
  lines.push("## 2. Per-Family Gradient Results");
  lines.push("");
  lines.push(
    "| Triple | Model | Cue Level | Bridge Freq | CI | Family |",
  );
  lines.push(
    "|--------|-------|-----------|-------------|-----|--------|",
  );

  for (const famResult of output.familyResults) {
    for (const clf of famResult.cueLevelFrequencies) {
      lines.push(
        `| ${clf.tripleId} | ${famResult.modelId} | ${clf.cueLevel} (${clf.cueLevelNumeric}) | ` +
          `${clf.bridgeFrequency.toFixed(2)} | ` +
          `[${clf.bridgeFrequencyCI[0].toFixed(2)}, ${clf.bridgeFrequencyCI[1].toFixed(2)}] | ` +
          `${famResult.family} |`,
      );
    }
  }
  lines.push("");

  // -- 3. Monotonicity Check --------------------------------------------------
  lines.push("## 3. Monotonicity Check");
  lines.push("");
  lines.push("Does bridge frequency monotonically decrease as cue strength decreases?");
  lines.push("");
  lines.push("| Family | Model | Monotonic Decrease? |");
  lines.push("|--------|-------|---------------------|");

  // Group family results by family+model
  const familyModelKeys = new Set(
    output.familyResults.map((fr) => `${fr.family}::${fr.modelId}`),
  );
  for (const key of familyModelKeys) {
    const [family, modelId] = key.split("::");
    const famResult = output.familyResults.find(
      (fr) => fr.family === family && fr.modelId === modelId,
    );
    if (!famResult) continue;
    lines.push(
      `| ${family} | ${modelId} | ${famResult.monotonicDecrease ? "YES" : "NO"} |`,
    );
  }
  lines.push("");

  let totalFamilyModel = familyModelKeys.size;
  let monotonicCount = output.familyResults.filter((fr) => fr.monotonicDecrease).length;
  // Deduplicate: familyResults may have one entry per family+model already
  // (since we build one entry per family per model)
  monotonicCount = output.familyResults.filter((fr) => fr.monotonicDecrease).length;
  lines.push(
    `**${monotonicCount}/${totalFamilyModel}** family/model combinations show monotonic decrease.`,
  );
  lines.push("");

  // -- 4. Logistic Fit Results ------------------------------------------------
  lines.push("## 4. Logistic Fit Results");
  lines.push("");
  lines.push("Cross-family logistic curve fit (pooling all diagnostic triples per model):");
  lines.push("");
  lines.push("| Model | Threshold | Steepness | R-squared |");
  lines.push("|-------|-----------|-----------|-----------|");

  for (const lf of output.logisticFits) {
    lines.push(
      `| ${lf.modelId} | ${lf.fit.threshold.toFixed(2)} | ${lf.fit.steepness.toFixed(2)} | ${lf.fit.r2.toFixed(3)} |`,
    );
  }
  lines.push("");

  // -- 5. Gemini Threshold Comparison -----------------------------------------
  lines.push("## 5. Gemini Threshold Comparison");
  lines.push("");

  if (output.geminiThresholdComparison) {
    const gc = output.geminiThresholdComparison;
    lines.push(`- **Gemini threshold:** ${gc.geminiThreshold.toFixed(2)}`);
    lines.push(`- **Other models mean threshold:** ${gc.otherMeanThreshold.toFixed(2)}`);
    lines.push(`- **Threshold difference:** ${gc.thresholdDifference.toFixed(2)}`);
    lines.push(
      `- **95% CI:** [${gc.thresholdDifferenceCI[0].toFixed(2)}, ${gc.thresholdDifferenceCI[1].toFixed(2)}]`,
    );
    lines.push(
      `- **Significantly higher?** ${gc.significantlyHigher ? "YES" : "NO"}`,
    );
    lines.push("");

    if (gc.significantlyHigher) {
      lines.push(
        "Gemini requires significantly stronger cue strength to achieve equivalent bridge frequency, " +
          "consistent with the fragmentation hypothesis from Phase 4.",
      );
    } else {
      lines.push(
        "Gemini's threshold is not significantly different from other models. " +
          "The fragmentation hypothesis from Phase 4 is not supported by the cue-strength gradient.",
      );
    }
  } else {
    lines.push("_Insufficient data to compute Gemini threshold comparison._");
  }
  lines.push("");

  // -- 6. Transitivity vs Cue Strength ---------------------------------------
  lines.push("## 6. Transitivity vs Cue Strength");
  lines.push("");
  lines.push(
    "| Triple | Model | Cue Level | Transitivity | Tri. Ineq. | Runs (AB/BC/AC) |",
  );
  lines.push(
    "|--------|-------|-----------|-------------|------------|-----------------|",
  );

  for (const triple of PHASE5A_TRIPLES) {
    const metrics = output.tripleModelMetrics.filter(
      (m) => m.tripleId === triple.id,
    );
    for (const m of metrics) {
      lines.push(
        `| ${m.tripleId} | ${m.modelId} | ${triple.cueLevel} (${triple.cueLevelNumeric}) | ` +
          `${m.waypointTransitivity.toFixed(3)} | ` +
          `${m.triangleInequalityHolds ? "Y" : "N"} | ` +
          `${m.runCountAB}/${m.runCountBC}/${m.runCountAC} |`,
      );
    }
  }
  lines.push("");

  // -- 7. Controls Validation -------------------------------------------------
  lines.push("## 7. Controls Validation");
  lines.push("");

  if (output.controlValidation.length === 0) {
    lines.push("_No control triple data available._");
  } else {
    lines.push(
      "Random control triples should show ~0% bridge frequency (<=0.05).",
    );
    lines.push("");
    lines.push("| Triple | Model | Bridge Freq | Expected | Pass? |");
    lines.push("|--------|-------|-------------|----------|-------|");

    let controlsPass = true;
    for (const cv of output.controlValidation) {
      if (!cv.pass) controlsPass = false;
      lines.push(
        `| ${cv.tripleId} | ${cv.modelId} | ${cv.bridgeFrequency.toFixed(2)} | <= 0.05 | ${cv.pass ? "PASS" : "FAIL"} |`,
      );
    }
    lines.push("");
    lines.push(
      controlsPass
        ? "**All controls pass:** Random bridge concepts do not appear on direct paths."
        : "**Some controls fail:** Unexpected bridge concept appearances on control triples.",
    );
  }
  lines.push("");

  // -- 8. Predictions Summary -------------------------------------------------
  lines.push("## 8. Predictions Summary");
  lines.push("");

  let totalPredictions = 0;
  let matchedPredictions = 0;
  const predictionDetails: Array<{
    tripleId: string;
    modelId: string;
    predicted: string;
    observed: number;
    match: boolean;
  }> = [];

  for (const triple of PHASE5A_TRIPLES) {
    if (!triple.predictedBridgeFreq) continue;
    for (const modelId of output.metadata.models) {
      const predictedRange = triple.predictedBridgeFreq[modelId];
      if (!predictedRange) continue;

      // Find actual bridge frequency from family results
      const famResult = output.familyResults.find(
        (fr) => fr.modelId === modelId && fr.family === triple.family,
      );
      if (!famResult) continue;
      const clf = famResult.cueLevelFrequencies.find(
        (c) => c.tripleId === triple.id,
      );
      if (!clf) continue;

      const observed = clf.bridgeFrequency;
      const match =
        observed >= predictedRange[0] && observed <= predictedRange[1];
      totalPredictions++;
      if (match) matchedPredictions++;
      predictionDetails.push({
        tripleId: triple.id,
        modelId,
        predicted: `[${predictedRange[0].toFixed(2)}, ${predictedRange[1].toFixed(2)}]`,
        observed,
        match,
      });
    }
  }

  if (totalPredictions > 0) {
    lines.push(
      `**Prediction success rate:** ${matchedPredictions}/${totalPredictions} ` +
        `(${((matchedPredictions / totalPredictions) * 100).toFixed(1)}%)`,
    );
    lines.push("");
    lines.push("| Triple | Model | Predicted | Observed | Match? |");
    lines.push("|--------|-------|-----------|----------|--------|");

    for (const pd of predictionDetails) {
      lines.push(
        `| ${pd.tripleId} | ${pd.modelId} | ${pd.predicted} | ${pd.observed.toFixed(2)} | ${pd.match ? "YES" : "NO"} |`,
      );
    }
  } else {
    lines.push("_No predictions to evaluate._");
  }
  lines.push("");

  return lines.join("\n");
}

// -- Main Pipeline ------------------------------------------------------------

async function analyze(opts: {
  input: string;
  output: string;
  findings: string;
}): Promise<void> {
  const inputDir = resolve(opts.input);
  const outputDir = resolve(opts.output);
  const findingsPath = resolve(opts.findings);

  setMetricsSeed(42);

  console.log(
    "Conceptual Topology Mapping Benchmark - Cue-Strength Gradient Analysis",
  );
  console.log(
    "======================================================================",
  );
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // -- Load all data sources --------------------------------------------------

  console.log("Loading data from all phases...");

  // Phase 1: forward results (pilot, 5wp/semantic only)
  const pilotDir = join(inputDir, "pilot");
  const pilotResults = (await loadResultsFromDir(pilotDir, "pilot")).filter(
    (r) => r.waypointCount === 5 && r.promptFormat === "semantic",
  );
  console.log(`  Phase 1 forward:      ${pilotResults.length} results`);

  // Phase 2: reverse results
  const reversalDir = join(inputDir, "reversals");
  const reversalResults = await loadResultsFromDir(reversalDir, "reversals");
  console.log(`  Phase 2 reverse:      ${reversalResults.length} results`);

  // Phase 3B: transitivity results
  const transitivityDir = join(inputDir, "transitivity");
  const transitivityResults = await loadResultsFromDir(
    transitivityDir,
    "transitivity",
  );
  console.log(`  Phase 3B transitivity: ${transitivityResults.length} results`);

  // Phase 4B: targeted bridge results
  const targetedDir = join(inputDir, "targeted-bridges");
  const targetedResults = await loadResultsFromDir(
    targetedDir,
    "targeted-bridges",
  );
  console.log(`  Phase 4B targeted:    ${targetedResults.length} results`);

  // Phase 5A: cue-strength results
  const cueStrengthDir = join(inputDir, "cue-strength");
  const cueStrengthResults = await loadResultsFromDir(
    cueStrengthDir,
    "cue-strength",
  );
  console.log(`  Phase 5A cue-strength: ${cueStrengthResults.length} results`);
  console.log("");

  // Build unified lookup
  const allResults = [
    ...pilotResults,
    ...reversalResults,
    ...transitivityResults,
    ...targetedResults,
    ...cueStrengthResults,
  ];
  const lookup = buildWaypointLookup(allResults);

  console.log(`  Total lookup keys: ${lookup.size}`);
  console.log("");

  // -- Compute metrics per triple x model -------------------------------------

  const modelIds = MODELS.map((m) => m.id);
  const families = [...new Set(PHASE5A_TRIPLES.map((t) => t.family))];

  console.log("Computing cue-strength gradient metrics...");
  const tripleModelMetrics: TransitivityMetrics[] = [];
  const familyResults: CueStrengthFamilyResult[] = [];
  const controlValidation: CueStrengthAnalysisOutput["controlValidation"] = [];
  let totalNewRuns = 0;
  let totalReusedRuns = 0;

  // Collect bridge frequency per (tripleId, modelId) for logistic fitting
  const bridgeFreqMap = new Map<string, number>(); // `${tripleId}::${modelId}` -> freq
  const bridgeFreqCIMap = new Map<string, [number, number]>();

  for (const triple of PHASE5A_TRIPLES) {
    const topUp = triple.reusableLegsWithSource ?? {};

    for (const modelId of modelIds) {
      // Get runs for each forward leg: AB, BC, AC
      const runsAB = getRunsForLeg(
        triple.id,
        "AB",
        triple.A,
        triple.B,
        topUp["AB"]?.pairId ?? null,
        modelId,
        lookup,
      );
      const runsBC = getRunsForLeg(
        triple.id,
        "BC",
        triple.B,
        triple.C,
        topUp["BC"]?.pairId ?? null,
        modelId,
        lookup,
      );
      const runsAC = getRunsForLeg(
        triple.id,
        "AC",
        triple.A,
        triple.C,
        topUp["AC"]?.pairId ?? null,
        modelId,
        lookup,
      );

      // Track run counts
      for (const [, runs] of [
        ["AB", runsAB],
        ["BC", runsBC],
        ["AC", runsAC],
      ] as [string, TaggedResult[]][]) {
        for (const r of runs) {
          if (r.sourcePhase === "cue-strength") {
            totalNewRuns++;
          } else {
            totalReusedRuns++;
          }
        }
      }

      const wpAB = waypointsOnly(runsAB);
      const wpBC = waypointsOnly(runsBC);
      const wpAC = waypointsOnly(runsAC);

      if (wpAB.length === 0 || wpBC.length === 0 || wpAC.length === 0) {
        console.log(
          `  SKIP ${triple.id} (${modelId}): missing legs -- ` +
            `AB:${wpAB.length} BC:${wpBC.length} AC:${wpAC.length}`,
        );
        continue;
      }

      // Compute transitivity metrics
      const metrics = computeTransitivityMetrics(
        triple.id,
        modelId,
        triple.bridgeConcept,
        wpAB,
        wpBC,
        wpAC,
      );
      tripleModelMetrics.push(metrics);

      // Compute bridge frequency with CI for AC leg
      const bridgeFreq = computeBridgeFrequency(wpAC, triple.bridgeConcept);
      const bridgeCI = bootstrapBridgeFrequencyCI(wpAC, triple.bridgeConcept);

      const bfKey = `${triple.id}::${modelId}`;
      bridgeFreqMap.set(bfKey, bridgeFreq);
      bridgeFreqCIMap.set(bfKey, bridgeCI);

      // Control validation
      if (triple.diagnosticType === "random-control") {
        controlValidation.push({
          tripleId: triple.id,
          modelId,
          bridgeFrequency: bridgeFreq,
          pass: bridgeFreq <= 0.05,
        });
      }

      console.log(
        `  ${triple.id} (${modelId}): bridgeFreq=${bridgeFreq.toFixed(2)} ` +
          `transitivity=${metrics.waypointTransitivity.toFixed(3)} ` +
          `tri=${metrics.triangleInequalityHolds ? "Y" : "N"} ` +
          `runs=${wpAB.length}/${wpBC.length}/${wpAC.length}`,
      );
    }
  }

  console.log("");
  console.log(
    `Computed ${tripleModelMetrics.length} triple/model combinations`,
  );
  console.log(`  New runs:    ${totalNewRuns}`);
  console.log(`  Reused runs: ${totalReusedRuns}`);
  console.log("");

  // -- Per-family gradient results --------------------------------------------

  console.log("Computing per-family gradient results...");

  for (const family of families) {
    const familyTriples = PHASE5A_TRIPLES.filter(
      (t) => t.family === family && t.diagnosticType === "cue-strength",
    );

    for (const modelId of modelIds) {
      const cueLevelFrequencies: CueStrengthFamilyResult["cueLevelFrequencies"] = [];

      // Sort by cueLevelNumeric descending (very-high first)
      const sorted = [...familyTriples].sort(
        (a, b) => b.cueLevelNumeric - a.cueLevelNumeric,
      );

      for (const triple of sorted) {
        const bfKey = `${triple.id}::${modelId}`;
        const freq = bridgeFreqMap.get(bfKey);
        const ci = bridgeFreqCIMap.get(bfKey);
        if (freq === undefined || ci === undefined) continue;

        cueLevelFrequencies.push({
          tripleId: triple.id,
          cueLevel: triple.cueLevel,
          cueLevelNumeric: triple.cueLevelNumeric,
          bridgeFrequency: freq,
          bridgeFrequencyCI: ci,
        });
      }

      if (cueLevelFrequencies.length === 0) continue;

      // Check monotonic decrease: bridge freq should decrease as cue level decreases
      // (cueLevelFrequencies is sorted descending by cueLevelNumeric)
      let monotonicDecrease = true;
      for (let i = 1; i < cueLevelFrequencies.length; i++) {
        if (cueLevelFrequencies[i].bridgeFrequency > cueLevelFrequencies[i - 1].bridgeFrequency) {
          monotonicDecrease = false;
          break;
        }
      }

      familyResults.push({
        family,
        modelId,
        cueLevelFrequencies,
        monotonicDecrease,
      });

      console.log(
        `  ${family} (${modelId}): monotonic=${monotonicDecrease ? "Y" : "N"} ` +
          `levels=${cueLevelFrequencies.map((c) => `${c.cueLevel}:${c.bridgeFrequency.toFixed(2)}`).join(", ")}`,
      );
    }
  }
  console.log("");

  // -- Cross-family logistic fit ----------------------------------------------

  console.log("Computing cross-family logistic fits...");

  const logisticFits: CueStrengthAnalysisOutput["logisticFits"] = [];

  for (const modelId of modelIds) {
    // Pool all diagnostic triples for this model
    const diagnosticTriples = PHASE5A_TRIPLES.filter(
      (t) => t.diagnosticType === "cue-strength",
    );

    const dataPoints: Array<{ cueLevel: number; bridgeFrequency: number }> = [];
    for (const triple of diagnosticTriples) {
      const bfKey = `${triple.id}::${modelId}`;
      const freq = bridgeFreqMap.get(bfKey);
      if (freq === undefined) continue;
      dataPoints.push({
        cueLevel: triple.cueLevelNumeric,
        bridgeFrequency: freq,
      });
    }

    if (dataPoints.length < 2) {
      console.log(`  ${modelId}: insufficient data for logistic fit (${dataPoints.length} points)`);
      continue;
    }

    const fit = fitLogistic(dataPoints);
    logisticFits.push({ modelId, fit });

    console.log(
      `  ${modelId}: threshold=${fit.threshold.toFixed(2)} steepness=${fit.steepness.toFixed(2)} R2=${fit.r2.toFixed(3)}`,
    );
  }
  console.log("");

  // -- Gemini threshold comparison --------------------------------------------

  console.log("Computing Gemini threshold comparison...");

  let geminiThresholdComparison: CueStrengthAnalysisOutput["geminiThresholdComparison"] = null;

  const geminiFit = logisticFits.find((lf) => lf.modelId === "gemini");
  const otherFits = logisticFits.filter((lf) => lf.modelId !== "gemini");

  if (geminiFit && otherFits.length > 0) {
    const geminiThreshold = geminiFit.fit.threshold;
    const otherThresholds = otherFits.map((lf) => lf.fit.threshold);
    const otherMeanThreshold = mean(otherThresholds);
    const thresholdDifference = geminiThreshold - otherMeanThreshold;

    // Gather all data points per model for bootstrapping
    const diagnosticTriples = PHASE5A_TRIPLES.filter(
      (t) => t.diagnosticType === "cue-strength",
    );
    const perModelData = new Map<string, Array<{ cueLevel: number; bridgeFrequency: number }>>();
    for (const modelId of modelIds) {
      const points: Array<{ cueLevel: number; bridgeFrequency: number }> = [];
      for (const triple of diagnosticTriples) {
        const bfKey = `${triple.id}::${modelId}`;
        const freq = bridgeFreqMap.get(bfKey);
        if (freq !== undefined) {
          points.push({ cueLevel: triple.cueLevelNumeric, bridgeFrequency: freq });
        }
      }
      perModelData.set(modelId, points);
    }

    // Bootstrap CI on threshold difference by resampling data points and refitting
    const nBootstrap = 1000;
    const bootstrapDiffs: number[] = [];

    for (let b = 0; b < nBootstrap; b++) {
      // Refit logistic for each model using bootstrap-resampled data points
      const bootThresholds = new Map<string, number>();
      for (const [mid, points] of perModelData.entries()) {
        if (points.length < 2) continue;
        // Resample data points with replacement using seeded PRNG
        const sample: typeof points = [];
        for (let i = 0; i < points.length; i++) {
          sample.push(points[Math.floor(seededRandom() * points.length)]);
        }
        const bootFit = fitLogistic(sample);
        bootThresholds.set(mid, bootFit.threshold);
      }
      const bootGemini = bootThresholds.get("gemini");
      const bootOthers = modelIds
        .filter((m) => m !== "gemini" && bootThresholds.has(m))
        .map((m) => bootThresholds.get(m)!);
      if (bootGemini !== undefined && bootOthers.length > 0) {
        bootstrapDiffs.push(bootGemini - mean(bootOthers));
      }
    }
    bootstrapDiffs.sort((a, b) => a - b);
    const thresholdDifferenceCI: [number, number] = bootstrapDiffs.length > 0
      ? [
          bootstrapDiffs[Math.floor(bootstrapDiffs.length * 0.025)],
          bootstrapDiffs[Math.floor(bootstrapDiffs.length * 0.975)],
        ]
      : [0, 0];
    const significantlyHigher = thresholdDifferenceCI[0] > 0;

    geminiThresholdComparison = {
      geminiThreshold,
      otherMeanThreshold,
      thresholdDifference,
      thresholdDifferenceCI,
      significantlyHigher,
    };

    console.log(
      `  Gemini threshold: ${geminiThreshold.toFixed(2)}, ` +
        `other mean: ${otherMeanThreshold.toFixed(2)}, ` +
        `diff: ${thresholdDifference.toFixed(2)} ` +
        `CI: [${thresholdDifferenceCI[0].toFixed(2)}, ${thresholdDifferenceCI[1].toFixed(2)}] ` +
        `significant: ${significantlyHigher}`,
    );
  } else {
    console.log("  Insufficient data for Gemini threshold comparison");
  }
  console.log("");

  // -- Build Output -----------------------------------------------------------

  const analysisOutput: CueStrengthAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      triples: PHASE5A_TRIPLES.map((t) => t.id),
      models: MODELS.map((m) => m.id),
      families,
      totalNewRuns,
      totalReusedRuns,
    },
    tripleModelMetrics,
    familyResults,
    logisticFits,
    geminiThresholdComparison,
    controlValidation,
  };

  // -- Write Outputs ----------------------------------------------------------

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "cue-strength-metrics.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(
    0,
    findingsPath.lastIndexOf("/"),
  );
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Cue-strength gradient analysis complete.");
}

// -- CLI ----------------------------------------------------------------------

if (import.meta.main) {
  const program = new Command();

  program
    .name("cue-strength-analysis")
    .description(
      "Analyze cue-strength gradient across Phase 5A concept triples",
    )
    .option("--input <dir>", "base results directory", "results")
    .option(
      "--output <dir>",
      "output directory for analysis JSON",
      "results/analysis",
    )
    .option(
      "--findings <path>",
      "path for findings markdown output",
      "findings/05a-cue-strength.md",
    );

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
