#!/usr/bin/env bun
/**
 * Phase 4B: Targeted Bridge Topology Analysis
 *
 * For each Phase 4 triple (A, B, C) × model, computes:
 * - Waypoint transitivity (reusing computeTransitivityMetrics)
 * - Bridge frequency with bootstrap CI
 * - Prediction evaluation against Phase 4 predicted ranges
 * - Temporal drift check for top-up triples
 * - Gemini fragmentation characterization
 *
 * Loads data from:
 *   results/pilot/         (Phase 1)
 *   results/reversals/     (Phase 2)
 *   results/transitivity/  (Phase 3B)
 *   results/targeted-bridges/ (Phase 4B)
 *
 * Usage:
 *   bun run analysis/04b-targeted-bridges.ts
 *   bun run analysis/04b-targeted-bridges.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  computeTransitivityMetrics,
  computeBridgeFrequency,
  bootstrapBridgeFrequencyCI,
  computeCrossModelJaccard,
  bootstrapCI,
  mean,
} from "../metrics.ts";
import { MODELS } from "../pairs.ts";
import { PHASE4_TRIPLES, getPhase4TripleLegs } from "../triples-phase4.ts";
import { TRIPLES as PHASE3_TRIPLES } from "../triples.ts";
import type {
  ElicitationResult,
  TransitivityMetrics,
  Phase4TargetedBridgesOutput,
  Phase4DiagnosticType,
} from "../types.ts";
import { computeJaccard } from "../canonicalize.ts";

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

interface TaggedResult extends ElicitationResult {
  /** Which source directory this result came from */
  sourcePhase: "pilot" | "reversals" | "transitivity" | "targeted-bridges";
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
 * Build a lookup: pairId::modelId → TaggedResult[] (successful runs with source tagging).
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
 * 1. Phase 4 synthetic pair ID: `${tripleId}--${legId}`
 * 2. The reusable pair ID from the triple's reusableLegs
 * 3. Phase 3B synthetic pair IDs (e.g. "triple-bank-river-ocean--AC")
 * 4. Top-up source pair ID from reusableLegsWithSource
 */
function getRunsForLeg(
  tripleId: string,
  legId: string,
  reusablePairId: string | null,
  topUpPairId: string | null,
  modelId: string,
  lookup: Map<string, TaggedResult[]>,
): TaggedResult[] {
  const candidates: TaggedResult[] = [];
  const seen = new Set<string>();

  function addFromKey(key: string): void {
    const runs = lookup.get(key);
    if (!runs) return;
    for (const r of runs) {
      const uid = r.runId ?? `${r.timestamp}-${r.pair.id}`;
      if (!seen.has(uid)) {
        seen.add(uid);
        candidates.push(r);
      }
    }
  }

  // 1. Phase 4 synthetic pair ID
  addFromKey(`${tripleId}--${legId}::${modelId}`);

  // 2. Reusable pair ID from Phase 1/2
  if (reusablePairId) {
    addFromKey(`${reusablePairId}::${modelId}`);
  }

  // 3. Phase 3B synthetic pair IDs — look for matching Phase 3 triples
  for (const p3Triple of PHASE3_TRIPLES) {
    addFromKey(`${p3Triple.id}--${legId}::${modelId}`);
  }

  // 4. Top-up source pair ID
  if (topUpPairId) {
    addFromKey(`${topUpPairId}::${modelId}`);
  }

  return candidates;
}

/**
 * Extract just the waypoint arrays from tagged results.
 */
function waypointsOnly(results: TaggedResult[]): string[][] {
  return results.map((r) => r.canonicalizedWaypoints);
}

/**
 * Split runs into "old" (from prior phases) and "new" (from targeted-bridges).
 */
function splitByBatch(
  results: TaggedResult[],
): { old: TaggedResult[]; new_: TaggedResult[] } {
  const old: TaggedResult[] = [];
  const new_: TaggedResult[] = [];
  for (const r of results) {
    if (r.sourcePhase === "targeted-bridges") {
      new_.push(r);
    } else {
      old.push(r);
    }
  }
  return { old, new_ };
}

// ── Temporal Drift ─────────────────────────────────────────────────

interface TemporalDriftResult {
  tripleId: string;
  legId: string;
  modelId: string;
  withinBatchJaccard: number;
  crossBatchJaccard: number;
  driftDetected: boolean;
}

/**
 * Compute within-batch and cross-batch Jaccard for temporal drift detection.
 * Flag drift if cross-batch Jaccard is >0.1 lower than within-batch mean.
 */
function computeTemporalDrift(
  tripleId: string,
  legId: string,
  modelId: string,
  oldRuns: string[][],
  newRuns: string[][],
): TemporalDriftResult | null {
  if (oldRuns.length < 2 && newRuns.length < 2) return null;

  // Within-batch Jaccard: average of old-only and new-only pairwise Jaccards
  const withinOld = computeMeanPairwiseJaccard(oldRuns);
  const withinNew = computeMeanPairwiseJaccard(newRuns);

  // Average within-batch (take mean of available batches)
  const withinValues: number[] = [];
  if (withinOld !== null) withinValues.push(withinOld);
  if (withinNew !== null) withinValues.push(withinNew);
  if (withinValues.length === 0) return null;

  const withinBatchJaccard = mean(withinValues);

  // Cross-batch Jaccard: old × new pairwise
  if (oldRuns.length === 0 || newRuns.length === 0) return null;

  const crossJaccards: number[] = [];
  for (const o of oldRuns) {
    for (const n of newRuns) {
      crossJaccards.push(computeJaccard(o, n).similarity);
    }
  }
  const crossBatchJaccard = mean(crossJaccards);

  const driftDetected = crossBatchJaccard < withinBatchJaccard - 0.1;

  return {
    tripleId,
    legId,
    modelId,
    withinBatchJaccard,
    crossBatchJaccard,
    driftDetected,
  };
}

function computeMeanPairwiseJaccard(runs: string[][]): number | null {
  if (runs.length < 2) return null;
  const jaccards: number[] = [];
  for (let i = 0; i < runs.length; i++) {
    for (let j = i + 1; j < runs.length; j++) {
      jaccards.push(computeJaccard(runs[i], runs[j]).similarity);
    }
  }
  return mean(jaccards);
}

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: Phase4TargetedBridgesOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 4B: Targeted Bridge Topology Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // ── 1. Overview ──────────────────────────────────────────────────
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Triples analyzed:** ${output.metadata.triples.length}`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **New API runs (Phase 4B):** ${output.metadata.totalNewRuns}`);
  lines.push(`- **Reused run usages:** ${output.metadata.totalReusedRuns}`);
  lines.push(
    `- **Total triple/model combinations:** ${output.tripleModelMetrics.length}`,
  );

  // Prediction success rate
  let totalPredictions = 0;
  let matchedPredictions = 0;
  for (const pred of output.predictions) {
    for (const pm of pred.perModel) {
      if (pm.matchesPrediction !== null) {
        totalPredictions++;
        if (pm.matchesPrediction) matchedPredictions++;
      }
    }
  }
  if (totalPredictions > 0) {
    lines.push(
      `- **Prediction success rate:** ${matchedPredictions}/${totalPredictions} ` +
        `(${((matchedPredictions / totalPredictions) * 100).toFixed(1)}%)`,
    );
  }
  lines.push("");

  // ── 2. Per-Triple Results Table ──────────────────────────────────
  lines.push("## 2. Per-Triple Results");
  lines.push("");
  lines.push(
    "| Triple | Model | Bridge Freq | 95% CI | Transitivity | Tri. Ineq. | Runs (AB/BC/AC) |",
  );
  lines.push(
    "|--------|-------|-------------|--------|-------------|------------|-----------------|",
  );

  for (const triple of PHASE4_TRIPLES) {
    const metrics = output.tripleModelMetrics.filter(
      (m) => m.tripleId === triple.id,
    );
    for (const m of metrics) {
      lines.push(
        `| ${m.tripleId} | ${m.modelId} | ${m.bridgeConceptFrequency.toFixed(2)} | ` +
          `[${m.waypointTransitivityCI[0].toFixed(2)}, ${m.waypointTransitivityCI[1].toFixed(2)}] | ` +
          `${m.waypointTransitivity.toFixed(3)} | ` +
          `${m.triangleInequalityHolds ? "Y" : "N"} | ` +
          `${m.runCountAB}/${m.runCountBC}/${m.runCountAC} |`,
      );
    }
  }
  lines.push("");

  // ── 3. Prediction Evaluation ─────────────────────────────────────
  lines.push("## 3. Prediction Evaluation");
  lines.push("");
  lines.push(
    "| Triple | Diagnostic Type | Bridge | Model | Predicted | Observed | Match? |",
  );
  lines.push(
    "|--------|----------------|--------|-------|-----------|----------|--------|",
  );

  for (const pred of output.predictions) {
    for (const pm of pred.perModel) {
      const predictedStr = pm.predictedRange
        ? `[${pm.predictedRange[0].toFixed(2)}, ${pm.predictedRange[1].toFixed(2)}]`
        : "—";
      const matchStr =
        pm.matchesPrediction === null
          ? "—"
          : pm.matchesPrediction
            ? "YES"
            : "NO";
      lines.push(
        `| ${pred.tripleId} | ${pred.diagnosticType} | ${pred.bridgeConcept} | ` +
          `${pm.modelId} | ${predictedStr} | ${pm.bridgeFrequency.toFixed(2)} | ${matchStr} |`,
      );
    }
  }
  lines.push("");

  // ── 4. Temporal Drift Assessment ─────────────────────────────────
  lines.push("## 4. Temporal Drift Assessment");
  lines.push("");
  if (output.temporalDrift.length === 0) {
    lines.push(
      "_No top-up triples had sufficient old + new runs for drift analysis._",
    );
  } else {
    lines.push(
      "| Triple | Leg | Model | Within-Batch Jaccard | Cross-Batch Jaccard | Drift? |",
    );
    lines.push(
      "|--------|-----|-------|---------------------|--------------------|---------| ",
    );
    for (const d of output.temporalDrift) {
      lines.push(
        `| ${d.tripleId} | ${d.legId} | ${d.modelId} | ` +
          `${d.withinBatchJaccard.toFixed(3)} | ${d.crossBatchJaccard.toFixed(3)} | ` +
          `${d.driftDetected ? "YES" : "no"} |`,
      );
    }

    const driftCount = output.temporalDrift.filter(
      (d) => d.driftDetected,
    ).length;
    lines.push("");
    if (driftCount === 0) {
      lines.push(
        "**No temporal drift detected.** Cross-batch Jaccard is within 0.1 of within-batch " +
          "for all top-up legs, supporting data pooling across phases.",
      );
    } else {
      lines.push(
        `**Temporal drift detected in ${driftCount}/${output.temporalDrift.length} leg/model combinations.** ` +
          "Interpret pooled results for these legs with caution.",
      );
    }
  }
  lines.push("");

  // ── 5. Gemini Fragmentation Characterization ─────────────────────
  lines.push("## 5. Gemini Fragmentation Characterization");
  lines.push("");
  const gc = output.geminiCharacterization;

  if (gc.concreteTriples.length > 0) {
    lines.push("### Concrete Triples (Gemini)");
    lines.push("");
    for (const ct of gc.concreteTriples) {
      lines.push(`- **${ct.tripleId}:** bridge freq = ${ct.bridgeFreq.toFixed(2)}`);
    }
    lines.push("");
    lines.push(
      gc.concreteSuccess
        ? "**Concrete bridging success:** Gemini achieves >0.30 bridge frequency on concrete triples."
        : "**Concrete bridging failure:** Gemini does NOT achieve >0.30 bridge frequency on concrete triples.",
    );
    lines.push("");
  }

  if (gc.abstractTriples.length > 0) {
    lines.push("### Abstract Triples (Gemini)");
    lines.push("");
    for (const at of gc.abstractTriples) {
      lines.push(`- **${at.tripleId}:** bridge freq = ${at.bridgeFreq.toFixed(2)}`);
    }
    lines.push("");
    lines.push(
      gc.abstractFailure
        ? "**Abstract bridging failure confirmed:** Gemini stays below 0.10 bridge frequency on abstract triples."
        : "**Abstract bridging failure NOT confirmed:** Gemini exceeds 0.10 on some abstract triples.",
    );
    lines.push("");
  }

  if (gc.polysemyTriples.length > 0) {
    lines.push("### Polysemy Triples (Gemini)");
    lines.push("");
    for (const pt of gc.polysemyTriples) {
      lines.push(`- **${pt.tripleId}:** bridge freq = ${pt.bridgeFreq.toFixed(2)}`);
    }
    lines.push("");
  }

  lines.push(`### Fragmentation Boundary`);
  lines.push("");
  lines.push(gc.fragmentationBoundary);
  lines.push("");

  // ── 6. Model Comparison Summary ──────────────────────────────────
  lines.push("## 6. Model Comparison Summary");
  lines.push("");

  // Compute per-model average bridge frequency across non-control triples
  const nonControlTriples = PHASE4_TRIPLES.filter(
    (t) => t.diagnosticType !== "random-control",
  );
  const nonControlIds = new Set(nonControlTriples.map((t) => t.id));

  lines.push(
    "| Model | Mean Bridge Freq (non-control) | 95% CI | Triples with Bridge >0.50 |",
  );
  lines.push(
    "|-------|-------------------------------|--------|---------------------------|",
  );

  for (const model of MODELS) {
    const modelMetrics = output.tripleModelMetrics.filter(
      (m) => m.modelId === model.id && nonControlIds.has(m.tripleId),
    );
    if (modelMetrics.length === 0) continue;

    const freqs = modelMetrics.map((m) => m.bridgeConceptFrequency);
    const meanFreq = mean(freqs);
    const ci = bootstrapCI(freqs);
    const highBridge = modelMetrics.filter(
      (m) => m.bridgeConceptFrequency > 0.5,
    ).length;

    lines.push(
      `| ${model.displayName} | ${meanFreq.toFixed(3)} | ` +
        `[${ci[0].toFixed(3)}, ${ci[1].toFixed(3)}] | ` +
        `${highBridge}/${modelMetrics.length} |`,
    );
  }
  lines.push("");

  // ── 7. Controls Validation ───────────────────────────────────────
  lines.push("## 7. Controls Validation");
  lines.push("");

  const controlTriples = PHASE4_TRIPLES.filter(
    (t) => t.diagnosticType === "random-control",
  );
  const controlIds = new Set(controlTriples.map((t) => t.id));
  const controlMetrics = output.tripleModelMetrics.filter((m) =>
    controlIds.has(m.tripleId),
  );

  if (controlMetrics.length === 0) {
    lines.push("_No control triple data available._");
  } else {
    lines.push(
      "Random control triples (7 and 8) should show ~0% bridge frequency.",
    );
    lines.push("");
    lines.push("| Triple | Model | Bridge Freq | Expected |");
    lines.push("|--------|-------|-------------|----------|");

    let controlsPass = true;
    for (const m of controlMetrics) {
      const pass = m.bridgeConceptFrequency <= 0.05;
      if (!pass) controlsPass = false;
      lines.push(
        `| ${m.tripleId} | ${m.modelId} | ${m.bridgeConceptFrequency.toFixed(2)} | ` +
          `<= 0.05 ${pass ? "(PASS)" : "(FAIL)"} |`,
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

  console.log(
    "Conceptual Topology Mapping Benchmark - Targeted Bridge Topology Analysis",
  );
  console.log(
    "=========================================================================",
  );
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load all data sources ────────────────────────────────────────

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
  console.log("");

  // Build unified lookup
  const allResults = [
    ...pilotResults,
    ...reversalResults,
    ...transitivityResults,
    ...targetedResults,
  ];
  const lookup = buildWaypointLookup(allResults);

  console.log(`  Total lookup keys: ${lookup.size}`);
  console.log("");

  // ── Compute metrics per triple × model ───────────────────────────

  const modelIds = MODELS.map((m) => m.id);

  console.log("Computing targeted bridge metrics...");
  const tripleModelMetrics: TransitivityMetrics[] = [];
  const predictions: Phase4TargetedBridgesOutput["predictions"] = [];
  const temporalDriftResults: TemporalDriftResult[] = [];
  let totalNewRuns = 0;
  let totalReusedRuns = 0;

  // Top-up triple IDs (triples 1 and 4 — have reusableLegsWithSource)
  const topUpTripleIds = new Set(
    PHASE4_TRIPLES.filter(
      (t) => t.reusableLegsWithSource && Object.keys(t.reusableLegsWithSource).length > 0,
    ).map((t) => t.id),
  );

  for (const triple of PHASE4_TRIPLES) {
    const legs = getPhase4TripleLegs(triple);
    const legMap: Record<
      string,
      { reusablePairId: string | null; topUpPairId: string | null }
    > = {};
    for (const leg of legs) {
      legMap[leg.legId] = {
        reusablePairId: leg.reusablePairId,
        topUpPairId: leg.topUpSource?.pairId ?? null,
      };
    }

    const predictionEntry: (typeof predictions)[number] = {
      tripleId: triple.id,
      diagnosticType: triple.diagnosticType,
      bridgeConcept: triple.bridgeConcept,
      perModel: [],
    };

    for (const modelId of modelIds) {
      // Get runs for each forward leg: AB, BC, AC
      const runsAB = getRunsForLeg(
        triple.id,
        "AB",
        legMap["AB"]?.reusablePairId ?? null,
        legMap["AB"]?.topUpPairId ?? null,
        modelId,
        lookup,
      );
      const runsBC = getRunsForLeg(
        triple.id,
        "BC",
        legMap["BC"]?.reusablePairId ?? null,
        legMap["BC"]?.topUpPairId ?? null,
        modelId,
        lookup,
      );
      const runsAC = getRunsForLeg(
        triple.id,
        "AC",
        legMap["AC"]?.reusablePairId ?? null,
        legMap["AC"]?.topUpPairId ?? null,
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
          if (r.sourcePhase === "targeted-bridges") {
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
          `  SKIP ${triple.id} (${modelId}): missing legs — ` +
            `AB:${wpAB.length} BC:${wpBC.length} AC:${wpAC.length}`,
        );
        continue;
      }

      // Compute transitivity metrics
      const metrics = computeTransitivityMetrics(
        triple.id,
        modelId,
        triple.B,
        wpAB,
        wpBC,
        wpAC,
      );
      tripleModelMetrics.push(metrics);

      // Compute bridge frequency with CI
      const bridgeFreq = computeBridgeFrequency(wpAC, triple.bridgeConcept);
      const bridgeCI = bootstrapBridgeFrequencyCI(wpAC, triple.bridgeConcept);

      // Prediction evaluation
      const predictedRange = triple.predictedBridgeFreq?.[modelId] ?? null;
      let matchesPrediction: boolean | null = null;
      if (predictedRange) {
        matchesPrediction =
          bridgeFreq >= predictedRange[0] && bridgeFreq <= predictedRange[1];
      }

      predictionEntry.perModel.push({
        modelId,
        bridgeFrequency: bridgeFreq,
        bridgeFrequencyCI: bridgeCI,
        predictedRange,
        matchesPrediction,
      });

      console.log(
        `  ${triple.id} (${modelId}): bridgeFreq=${bridgeFreq.toFixed(2)} ` +
          `transitivity=${metrics.waypointTransitivity.toFixed(3)} ` +
          `tri=${metrics.triangleInequalityHolds ? "Y" : "N"} ` +
          `runs=${wpAB.length}/${wpBC.length}/${wpAC.length}` +
          (matchesPrediction !== null
            ? ` pred=${matchesPrediction ? "MATCH" : "MISS"}`
            : ""),
      );

      // ── Temporal drift check for top-up triples ──────────────────
      if (topUpTripleIds.has(triple.id)) {
        for (const legId of ["AB", "BC", "AC"] as const) {
          const legRuns =
            legId === "AB" ? runsAB : legId === "BC" ? runsBC : runsAC;
          const { old, new_ } = splitByBatch(legRuns);

          if (old.length >= 2 && new_.length >= 2) {
            const drift = computeTemporalDrift(
              triple.id,
              legId,
              modelId,
              waypointsOnly(old),
              waypointsOnly(new_),
            );
            if (drift) {
              temporalDriftResults.push(drift);
            }
          }
        }
      }
    }

    predictions.push(predictionEntry);
  }

  console.log("");
  console.log(
    `Computed ${tripleModelMetrics.length} triple/model combinations`,
  );
  console.log(`  New runs:    ${totalNewRuns}`);
  console.log(`  Reused runs: ${totalReusedRuns}`);
  console.log("");

  // ── Gemini Fragmentation Characterization ────────────────────────

  console.log("Computing Gemini fragmentation characterization...");

  const geminiConcreteTypes: Phase4DiagnosticType[] = [
    "cross-domain-concrete",
    "concrete-hierarchical",
  ];
  const geminiAbstractTypes: Phase4DiagnosticType[] = [
    "abstract-retest",
    "abstract-bridge",
  ];
  const geminiPolysemyTypes: Phase4DiagnosticType[] = [
    "polysemy-retest",
    "polysemy-financial",
  ];

  function getGeminiTriplesByDiagTypes(
    types: Phase4DiagnosticType[],
  ): Array<{ tripleId: string; bridgeFreq: number }> {
    const result: Array<{ tripleId: string; bridgeFreq: number }> = [];
    for (const pred of predictions) {
      if (!types.includes(pred.diagnosticType)) continue;
      const geminiEntry = pred.perModel.find((pm) => pm.modelId === "gemini");
      if (geminiEntry) {
        result.push({
          tripleId: pred.tripleId,
          bridgeFreq: geminiEntry.bridgeFrequency,
        });
      }
    }
    return result;
  }

  const concreteTriples = getGeminiTriplesByDiagTypes(geminiConcreteTypes);
  const abstractTriples = getGeminiTriplesByDiagTypes(geminiAbstractTypes);
  const polysemyTriples = getGeminiTriplesByDiagTypes(geminiPolysemyTypes);

  // Concrete success: Gemini bridge freq > 0.30 on ALL concrete triples
  const concreteSuccess =
    concreteTriples.length > 0 &&
    concreteTriples.every((ct) => ct.bridgeFreq > 0.3);

  // Abstract failure: Gemini bridge freq < 0.10 on ALL abstract triples
  const abstractFailure =
    abstractTriples.length > 0 &&
    abstractTriples.every((at) => at.bridgeFreq < 0.1);

  // Characterize the fragmentation boundary
  let fragmentationBoundary: string;
  if (concreteSuccess && abstractFailure) {
    fragmentationBoundary =
      "Gemini shows a clear concrete/abstract fragmentation boundary: " +
      "it successfully bridges concrete conceptual chains (>0.30 bridge frequency) " +
      "but fails to bridge abstract chains (<0.10 bridge frequency). " +
      "This suggests Gemini's semantic topology fragments at the abstract concept level.";
  } else if (concreteSuccess && !abstractFailure) {
    fragmentationBoundary =
      "Gemini bridges concrete chains successfully but shows mixed results on abstract chains. " +
      "The fragmentation boundary is less clear-cut than predicted.";
  } else if (!concreteSuccess && abstractFailure) {
    fragmentationBoundary =
      "Gemini fails on both concrete and abstract bridge detection. " +
      "The fragmentation may be more pervasive than a simple concrete/abstract divide.";
  } else if (
    concreteTriples.length === 0 &&
    abstractTriples.length === 0
  ) {
    fragmentationBoundary =
      "Insufficient Gemini data to characterize the fragmentation boundary.";
  } else {
    fragmentationBoundary =
      "Gemini shows unexpected patterns that do not align with the predicted " +
      "concrete/abstract fragmentation boundary. Further investigation needed.";
  }

  console.log(`  Concrete triples: ${concreteTriples.length}`);
  console.log(`  Abstract triples: ${abstractTriples.length}`);
  console.log(`  Polysemy triples: ${polysemyTriples.length}`);
  console.log(
    `  Concrete success: ${concreteSuccess}, Abstract failure: ${abstractFailure}`,
  );
  console.log("");

  const geminiCharacterization: Phase4TargetedBridgesOutput["geminiCharacterization"] =
    {
      concreteTriples,
      abstractTriples,
      polysemyTriples,
      concreteSuccess,
      abstractFailure,
      fragmentationBoundary,
    };

  // ── Build Output ─────────────────────────────────────────────────

  const analysisOutput: Phase4TargetedBridgesOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      triples: PHASE4_TRIPLES.map((t) => t.id),
      models: MODELS.map((m) => m.id),
      totalNewRuns,
      totalReusedRuns,
    },
    tripleModelMetrics,
    predictions,
    temporalDrift: temporalDriftResults,
    geminiCharacterization,
  };

  // ── Write Outputs ────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "targeted-bridges-metrics.json");
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
  console.log("Targeted bridge topology analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("targeted-bridges-analysis")
    .description(
      "Analyze targeted bridge topology across Phase 4 concept triples",
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
      "findings/04b-targeted-bridges.md",
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
