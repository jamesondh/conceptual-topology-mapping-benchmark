#!/usr/bin/env bun
/**
 * Phase 7A: Early-Anchoring Causal Test Analysis
 *
 * For each Phase 7A pair x model x condition, computes:
 * - Bridge displacement (modal position shift under pre-fill)
 * - Bridge survival rate (fraction of paths containing bridge at any position)
 * - Positional shift analysis (mean bridge position in pre-filled vs unconstrained)
 * - Animal-poodle taxonomic control comparison
 * - Forced-crossing robustness (loan-shore "bank" survival)
 * - Pre-fill heading congruence (incongruent vs congruent displacement)
 * - Per-model displacement comparison
 *
 * Loads data from:
 *   results/anchoring/       (new Phase 7A pre-filled + supplemental unconstrained)
 *   results/positional/      (Phase 6C unconstrained baselines for pairs 1-6)
 *   results/convergence/     (Phase 5C data for overlapping pairs)
 *
 * Usage:
 *   bun run analysis/07a-anchoring.ts
 *   bun run analysis/07a-anchoring.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  bootstrapCI,
  mean,
  computePerPositionBridgeFreq,
  computePeakDetectionContrast,
  computeMeanBridgePosition,
  computeBridgeFrequency,
  bootstrapBridgeFrequencyCI,
} from "../src/metrics.ts";
import { MODELS } from "../src/data/pairs.ts";
import { PHASE7A_PAIRS } from "../src/data/pairs-phase7.ts";
import type {
  AnchoringAnalysisOutput,
  PreFillCondition,
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

// ── Condition key helpers ──────────────────────────────────────────

const CONDITIONS: PreFillCondition[] = ["unconstrained", "incongruent", "congruent", "neutral"];

function conditionKey(pairId: string, condition: PreFillCondition, modelId: string): string {
  if (condition === "unconstrained") {
    return `${pairId}--unconstrained::${modelId}`;
  }
  return `${pairId}--${condition}::${modelId}`;
}

/**
 * Phase 6C unconstrained baselines are keyed as p6c-<pair>--fwd::<model>.
 * Map Phase 7A pair IDs to potential Phase 6C keys.
 */
function p6cBaselineKey(pairId: string, modelId: string): string {
  const base = pairId.replace("p7a-", "p6c-");
  return `${base}--fwd::${modelId}`;
}

/**
 * Phase 5C baselines are keyed as p5c-<pair>--fwd::<model>.
 */
function p5cBaselineKey(pairId: string, modelId: string): string {
  const base = pairId.replace("p7a-", "p5c-");
  return `${base}--fwd::${modelId}`;
}

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: AnchoringAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 7A: Early-Anchoring Causal Test Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Experiment Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Pairs analyzed:** ${output.metadata.pairs.length}`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **Conditions:** ${output.metadata.conditions.join(", ")}`);
  lines.push(`- **New runs:** ${output.metadata.totalNewRuns}`);
  lines.push(`- **Reused runs:** ${output.metadata.totalReusedRuns}`);
  lines.push(`- **Pair-model-condition metrics:** ${output.pairModelConditionMetrics.length}`);
  lines.push("");

  // 2. Bridge Displacement by Condition
  lines.push("## 2. Bridge Displacement by Condition");
  lines.push("");
  lines.push("| Pair | Model | Condition | Bridge Freq | Modal Pos | Mean Pos | Runs |");
  lines.push("|------|-------|-----------|-------------|-----------|----------|------|");

  for (const m of output.pairModelConditionMetrics) {
    lines.push(
      `| ${m.pairId} | ${m.modelId} | ${m.condition} | ${m.bridgeFrequency.toFixed(3)} | ${m.modalBridgePosition} | ${m.meanBridgePosition !== null ? m.meanBridgePosition.toFixed(2) : "N/A"} | ${m.runCount} |`,
    );
  }
  lines.push("");

  // 3. Primary Test Results
  lines.push("## 3. Primary Test: Bridge Displacement");
  lines.push("");
  const dt = output.bridgeDisplacementTest;
  lines.push(`- **Incongruent displacement:** ${dt.incongruentDisplacement.toFixed(4)} [${dt.incongruentDisplacementCI[0].toFixed(4)}, ${dt.incongruentDisplacementCI[1].toFixed(4)}]`);
  lines.push(`- **Congruent displacement:** ${dt.congruentDisplacement.toFixed(4)} [${dt.congruentDisplacementCI[0].toFixed(4)}, ${dt.congruentDisplacementCI[1].toFixed(4)}]`);
  lines.push(`- **Neutral displacement:** ${dt.neutralDisplacement.toFixed(4)} [${dt.neutralDisplacementCI[0].toFixed(4)}, ${dt.neutralDisplacementCI[1].toFixed(4)}]`);
  lines.push(`- **Incongruent > congruent:** ${dt.incongruentGreaterThanCongruent ? "**YES** (supports directional-heading)" : "**NO**"}`);
  lines.push(`- **Incongruent > neutral:** ${dt.incongruentGreaterThanNeutral ? "**YES** (supports directional-heading over mechanical shift)" : "**NO**"}`);
  lines.push("");

  if (dt.incongruentGreaterThanCongruent && dt.incongruentGreaterThanNeutral) {
    lines.push("**[observed]** Incongruent pre-fills produce significantly larger bridge displacement than " +
      "congruent or neutral pre-fills, supporting the directional-heading hypothesis: the first waypoint " +
      "sets a navigational heading that biases subsequent path topology.");
  } else {
    lines.push("The primary pre-registered test does not fully pass. Displacement differences do not " +
      "clearly separate incongruent from congruent/neutral conditions.");
  }
  lines.push("");

  // 4. Bridge Survival Rates
  lines.push("## 4. Bridge Survival Rates by Condition");
  lines.push("");
  lines.push("| Condition | Mean Survival | 95% CI |");
  lines.push("|-----------|---------------|--------|");

  for (const sr of output.bridgeSurvivalRate) {
    lines.push(
      `| ${sr.condition} | ${sr.meanSurvivalRate.toFixed(3)} | [${sr.survivalRateCI[0].toFixed(3)}, ${sr.survivalRateCI[1].toFixed(3)}] |`,
    );
  }
  lines.push("");

  // 5. Positional Shift Analysis
  lines.push("## 5. Positional Shift Analysis");
  lines.push("");
  const ps = output.positionalShift;
  lines.push(`- **Mean shift (incongruent):** ${ps.meanShiftIncongruent.toFixed(3)} positions`);
  lines.push(`- **Mean shift (congruent):** ${ps.meanShiftCongruent.toFixed(3)} positions`);
  lines.push(`- **Mean shift (neutral):** ${ps.meanShiftNeutral.toFixed(3)} positions`);
  lines.push(`- **Exceeds mechanical +1 shift:** ${ps.exceedsMechanicalShift ? "**YES** (genuine displacement, not just +1 bump)" : "**NO**"}`);
  lines.push("");

  if (ps.exceedsMechanicalShift) {
    lines.push("**[observed]** Pre-filling causes a positional shift exceeding the mechanical +1 " +
      "position expected from simply inserting a waypoint before the bridge. This indicates genuine " +
      "topological displacement, not mere position arithmetic.");
  }
  lines.push("");

  // 6. Animal-Poodle Control
  lines.push("## 6. Animal-Poodle Taxonomic Control");
  lines.push("");
  if (output.taxonomicControl) {
    const tc = output.taxonomicControl;
    lines.push(`- **Taxonomic displacement (animal-poodle):** ${tc.taxonomicDisplacement.toFixed(4)}`);
    lines.push(`- **Mean heading-bridge displacement:** ${tc.headingMeanDisplacement.toFixed(4)}`);
    lines.push(`- **Taxonomic < heading:** ${tc.taxonomicLowerThanHeading ? "**YES** (control passes)" : "**NO**"}`);
    lines.push("");

    if (tc.taxonomicLowerThanHeading) {
      lines.push("**[observed]** The taxonomic control pair (animal-poodle) shows lower displacement than " +
        "heading-bridge pairs, confirming that the anchoring effect is specific to navigational topology " +
        "rather than a generic positional artifact.");
    }
  } else {
    lines.push("_Insufficient data for animal-poodle control analysis._");
  }
  lines.push("");

  // 7. Forced-Crossing Robustness
  lines.push("## 7. Forced-Crossing Robustness (loan-shore)");
  lines.push("");
  if (output.forcedCrossingRobustness) {
    const fc = output.forcedCrossingRobustness;
    lines.push(`- **Bank survival rate under pre-fill:** ${fc.bankSurvivalRate.toFixed(3)}`);
    lines.push(`- **Bank mean positional shift:** ${fc.bankMeanPositionShift.toFixed(3)} positions`);
    lines.push(`- **Bank resists displacement:** ${fc.bankResistsDisplacement ? "**YES** (survival > 0.90, shift ~ 1)" : "**NO**"}`);
    lines.push("");

    if (fc.bankResistsDisplacement) {
      lines.push("**[observed]** The forced-crossing bridge 'bank' survives pre-filling at a high rate " +
        "and shifts by approximately one position. Forced crossings resist the anchoring effect, " +
        "consistent with their structurally mandatory role in the conceptual path.");
    }
  } else {
    lines.push("_Insufficient data for forced-crossing robustness analysis._");
  }
  lines.push("");

  // 8. Per-Model Displacement
  lines.push("## 8. Per-Model Displacement");
  lines.push("");
  lines.push("| Model | Incongruent | Congruent | Neutral |");
  lines.push("|-------|-------------|-----------|---------|");

  for (const pm of output.perModelDisplacement) {
    lines.push(
      `| ${pm.modelId} | ${pm.incongruentDisplacement.toFixed(4)} | ${pm.congruentDisplacement.toFixed(4)} | ${pm.neutralDisplacement.toFixed(4)} |`,
    );
  }
  lines.push("");

  // 9. Congruent vs Incongruent Comparison
  lines.push("## 9. Congruent vs Incongruent Comparison");
  lines.push("");
  if (dt.incongruentGreaterThanCongruent) {
    const diff = dt.incongruentDisplacement - dt.congruentDisplacement;
    lines.push(`- **Incongruent - congruent difference:** ${diff.toFixed(4)}`);
    lines.push("- **Interpretation:** Incongruent pre-fills cause larger displacement, consistent with ");
    lines.push("  the directional-heading model: the pre-fill sets a heading away from the bridge, ");
    lines.push("  pushing it further down (or off) the path.");
  } else {
    const diff = dt.incongruentDisplacement - dt.congruentDisplacement;
    lines.push(`- **Incongruent - congruent difference:** ${diff.toFixed(4)}`);
    lines.push("- The incongruent vs congruent difference is not in the predicted direction.");
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

  console.log("Conceptual Topology Mapping Benchmark - Early-Anchoring Causal Test Analysis");
  console.log("=============================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data from multiple sources ─────────────────────────────

  console.log("Loading data from multiple sources...");

  // Phase 7A anchoring data (new pre-filled + supplemental unconstrained)
  const anchoringDir = join(inputDir, "anchoring");
  const anchoringResults = await loadResultsFromDir(anchoringDir);
  console.log(`  Anchoring (7A): ${anchoringResults.length} results`);

  // Phase 6C positional data (unconstrained baselines for pairs 1-6)
  const positionalDir = join(inputDir, "positional");
  const positionalResults = await loadResultsFromDir(positionalDir);
  console.log(`  Positional (6C):  ${positionalResults.length} results`);

  // Phase 5C convergence data (for pairs that overlap)
  const convergenceDir = join(inputDir, "convergence");
  const convergenceResults = await loadResultsFromDir(convergenceDir);
  console.log(`  Convergence (5C): ${convergenceResults.length} results`);
  console.log("");

  // Build unified lookup
  const allResults = [...anchoringResults, ...positionalResults, ...convergenceResults];
  const lookup = buildWaypointLookup(allResults);
  console.log(`  Total lookup keys: ${lookup.size}`);
  console.log("");

  // ── Compute per-pair/model/condition bridge metrics ─────────────

  const WAYPOINT_COUNT = 7;
  const modelIds = MODELS.map(m => m.id);

  console.log("Computing per-pair/model/condition bridge metrics...");

  const pairModelConditionMetrics: AnchoringAnalysisOutput["pairModelConditionMetrics"] = [];
  let totalReusedRuns = 0;
  const totalNewRuns = anchoringResults.length;

  for (const pair of PHASE7A_PAIRS) {
    for (const modelId of modelIds) {
      for (const condition of CONDITIONS) {
        // Resolve the lookup key for this condition
        let runs: string[][] = [];

        if (condition === "unconstrained") {
          // For unconstrained: merge Phase 7A supplemental with 6C/5C baselines
          const p7aKey = conditionKey(pair.id, condition, modelId);
          const p7aResults = lookup.get(p7aKey) ?? [];

          // Also check Phase 6C baselines (pairs 1-6 reuse 6C forward data)
          const p6cKey = p6cBaselineKey(pair.id, modelId);
          const p6cResults = lookup.get(p6cKey) ?? [];

          // Also check Phase 5C baselines
          const p5cKey = p5cBaselineKey(pair.id, modelId);
          const p5cResults = lookup.get(p5cKey) ?? [];

          const mergedResults = [...p7aResults, ...p6cResults, ...p5cResults];

          if (p6cResults.length > 0 || p5cResults.length > 0) {
            totalReusedRuns += p6cResults.length + p5cResults.length;
          }

          runs = waypointsOnly(mergedResults);
        } else {
          // Pre-filled conditions: only Phase 7A data
          const key = conditionKey(pair.id, condition, modelId);
          const results = lookup.get(key) ?? [];
          runs = waypointsOnly(results);
        }

        if (runs.length === 0) {
          console.log(`  SKIP ${pair.id} (${modelId}, ${condition}): no data`);
          continue;
        }

        // Per-position bridge frequency
        const perPosBridgeFreq = computePerPositionBridgeFreq(runs, pair.bridge, WAYPOINT_COUNT);

        // Peak detection for modal position
        const { peakPosition } = computePeakDetectionContrast(perPosBridgeFreq);

        // Bridge frequency and survival
        const bridgeFrequency = computeBridgeFrequency(runs, pair.bridge);

        // Mean bridge position (across runs where bridge appears)
        const meanBridgePos = computeMeanBridgePosition(runs, pair.bridge);

        pairModelConditionMetrics.push({
          pairId: pair.id,
          modelId,
          condition,
          bridgeFrequency,
          bridgeFrequencyCI: bootstrapBridgeFrequencyCI(runs, pair.bridge),
          perPositionBridgeFreq: perPosBridgeFreq,
          modalBridgePosition: peakPosition,
          meanBridgePosition: meanBridgePos,
          runCount: runs.length,
        });

        console.log(
          `  ${pair.id} (${modelId}, ${condition}): freq=${bridgeFrequency.toFixed(3)} ` +
          `modal=${peakPosition} mean=${meanBridgePos?.toFixed(2) ?? "N/A"} runs=${runs.length}`,
        );
      }
    }
  }
  console.log("");
  console.log(`Computed ${pairModelConditionMetrics.length} pair-model-condition metrics`);
  console.log("");

  // ── Primary test: bridge displacement ────────────────────────────

  console.log("Computing bridge displacement test...");

  // For each pair/model, compute displacement = unconstrained modal freq - pre-filled freq at (modal+1)
  // Only use heading-bridge pairs (1-6) for the primary test
  const headingBridgePairs = PHASE7A_PAIRS.filter(p => p.role === "heading-bridge");

  function computeDisplacementValues(cond: PreFillCondition): number[] {
    const displacements: number[] = [];
    for (const pair of headingBridgePairs) {
      for (const modelId of modelIds) {
        const unconMetric = pairModelConditionMetrics.find(
          m => m.pairId === pair.id && m.modelId === modelId && m.condition === "unconstrained",
        );
        const condMetric = pairModelConditionMetrics.find(
          m => m.pairId === pair.id && m.modelId === modelId && m.condition === cond,
        );
        if (!unconMetric || !condMetric) continue;

        const modalPos = unconMetric.modalBridgePosition;
        const unconFreqAtModal = unconMetric.perPositionBridgeFreq[modalPos] ?? 0;

        // In the pre-filled condition, check freq at modal+1 (the displaced position)
        const displacedPos = Math.min(modalPos + 1, WAYPOINT_COUNT - 1);
        const condFreqAtDisplaced = condMetric.perPositionBridgeFreq[displacedPos] ?? 0;

        // Displacement = unconstrained modal freq minus pre-filled freq at displaced position
        // Positive displacement means the bridge is less frequent at its expected position
        const displacement = unconFreqAtModal - condFreqAtDisplaced;
        displacements.push(displacement);
      }
    }
    return displacements;
  }

  const incongruentDisplacements = computeDisplacementValues("incongruent");
  const congruentDisplacements = computeDisplacementValues("congruent");
  const neutralDisplacements = computeDisplacementValues("neutral");

  const incongruentMean = mean(incongruentDisplacements);
  const congruentMean = mean(congruentDisplacements);
  const neutralMean = mean(neutralDisplacements);

  const incongruentCI = bootstrapCI(incongruentDisplacements);
  const congruentCI = bootstrapCI(congruentDisplacements);
  const neutralCI = bootstrapCI(neutralDisplacements);

  // Test: incongruent > congruent?
  const incongVsCong = incongruentDisplacements.map(
    (d, i) => d - (congruentDisplacements[i] ?? 0),
  );
  const incongVsCongCI = bootstrapCI(incongVsCong);
  const incongruentGreaterThanCongruent = incongVsCongCI[0] > 0;

  // Test: incongruent > neutral?
  const incongVsNeut = incongruentDisplacements.map(
    (d, i) => d - (neutralDisplacements[i] ?? 0),
  );
  const incongVsNeutCI = bootstrapCI(incongVsNeut);
  const incongruentGreaterThanNeutral = incongVsNeutCI[0] > 0;

  console.log(`  Incongruent: ${incongruentMean.toFixed(4)} [${incongruentCI[0].toFixed(4)}, ${incongruentCI[1].toFixed(4)}]`);
  console.log(`  Congruent:   ${congruentMean.toFixed(4)} [${congruentCI[0].toFixed(4)}, ${congruentCI[1].toFixed(4)}]`);
  console.log(`  Neutral:     ${neutralMean.toFixed(4)} [${neutralCI[0].toFixed(4)}, ${neutralCI[1].toFixed(4)}]`);
  console.log(`  Incongruent > congruent: ${incongruentGreaterThanCongruent}`);
  console.log(`  Incongruent > neutral:   ${incongruentGreaterThanNeutral}`);
  console.log("");

  // ── Bridge survival rate ──────────────────────────────────────────

  console.log("Computing bridge survival rates...");

  const bridgeSurvivalRates: AnchoringAnalysisOutput["bridgeSurvivalRate"] = [];

  for (const condition of CONDITIONS) {
    const survivalValues: number[] = [];

    for (const pair of PHASE7A_PAIRS) {
      for (const modelId of modelIds) {
        const metric = pairModelConditionMetrics.find(
          m => m.pairId === pair.id && m.modelId === modelId && m.condition === condition,
        );
        if (!metric) continue;
        survivalValues.push(metric.bridgeFrequency); // bridgeFrequency is the survival rate
      }
    }

    const meanSurvival = mean(survivalValues);
    const survivalCI = bootstrapCI(survivalValues);

    bridgeSurvivalRates.push({
      condition,
      meanSurvivalRate: meanSurvival,
      survivalRateCI: survivalCI,
    });

    console.log(`  ${condition}: ${meanSurvival.toFixed(3)} [${survivalCI[0].toFixed(3)}, ${survivalCI[1].toFixed(3)}]`);
  }
  console.log("");

  // ── Positional shift analysis ─────────────────────────────────────

  console.log("Computing positional shift analysis...");

  function computeMeanPositionalShift(cond: PreFillCondition): number {
    const shifts: number[] = [];
    for (const pair of headingBridgePairs) {
      for (const modelId of modelIds) {
        const unconMetric = pairModelConditionMetrics.find(
          m => m.pairId === pair.id && m.modelId === modelId && m.condition === "unconstrained",
        );
        const condMetric = pairModelConditionMetrics.find(
          m => m.pairId === pair.id && m.modelId === modelId && m.condition === cond,
        );
        if (!unconMetric || !condMetric) continue;
        if (unconMetric.meanBridgePosition === null || condMetric.meanBridgePosition === null) continue;

        // Shift = pre-filled mean position - unconstrained mean position
        const shift = condMetric.meanBridgePosition - unconMetric.meanBridgePosition;
        shifts.push(shift);
      }
    }
    return shifts.length > 0 ? mean(shifts) : 0;
  }

  const meanShiftIncongruent = computeMeanPositionalShift("incongruent");
  const meanShiftCongruent = computeMeanPositionalShift("congruent");
  const meanShiftNeutral = computeMeanPositionalShift("neutral");

  // Exceeds mechanical shift if any shift > 1.5 positions
  const exceedsMechanicalShift =
    meanShiftIncongruent > 1.5 || meanShiftCongruent > 1.5 || meanShiftNeutral > 1.5;

  console.log(`  Incongruent shift: ${meanShiftIncongruent.toFixed(3)}`);
  console.log(`  Congruent shift:   ${meanShiftCongruent.toFixed(3)}`);
  console.log(`  Neutral shift:     ${meanShiftNeutral.toFixed(3)}`);
  console.log(`  Exceeds mechanical +1: ${exceedsMechanicalShift}`);
  console.log("");

  // ── Animal-poodle control ─────────────────────────────────────────

  console.log("Computing animal-poodle taxonomic control...");

  let taxonomicControl: AnchoringAnalysisOutput["taxonomicControl"] = null;

  const animalPoodlePair = PHASE7A_PAIRS.find(p => p.role === "taxonomic-control");

  if (animalPoodlePair) {
    // Compute displacement for the taxonomic control pair
    const taxDisplacements: number[] = [];
    for (const modelId of modelIds) {
      const unconMetric = pairModelConditionMetrics.find(
        m => m.pairId === animalPoodlePair.id && m.modelId === modelId && m.condition === "unconstrained",
      );
      const incongMetric = pairModelConditionMetrics.find(
        m => m.pairId === animalPoodlePair.id && m.modelId === modelId && m.condition === "incongruent",
      );
      if (!unconMetric || !incongMetric) continue;

      const modalPos = unconMetric.modalBridgePosition;
      const unconFreq = unconMetric.perPositionBridgeFreq[modalPos] ?? 0;
      const displacedPos = Math.min(modalPos + 1, WAYPOINT_COUNT - 1);
      const condFreq = incongMetric.perPositionBridgeFreq[displacedPos] ?? 0;
      taxDisplacements.push(unconFreq - condFreq);
    }

    const taxMeanDisplacement = mean(taxDisplacements);
    const headingMeanDisplacement = mean(incongruentDisplacements);

    taxonomicControl = {
      taxonomicDisplacement: taxMeanDisplacement,
      headingMeanDisplacement,
      taxonomicLowerThanHeading: taxMeanDisplacement < headingMeanDisplacement,
    };

    console.log(`  Taxonomic displacement: ${taxMeanDisplacement.toFixed(4)}`);
    console.log(`  Heading mean displacement: ${headingMeanDisplacement.toFixed(4)}`);
    console.log(`  Taxonomic < heading: ${taxMeanDisplacement < headingMeanDisplacement}`);
  } else {
    console.log("  No taxonomic control pair found");
  }
  console.log("");

  // ── Forced-crossing robustness (loan-shore) ──────────────────────

  console.log("Computing forced-crossing robustness...");

  let forcedCrossingRobustness: AnchoringAnalysisOutput["forcedCrossingRobustness"] = null;

  const loanShorePair = PHASE7A_PAIRS.find(p => p.role === "forced-crossing-control");

  if (loanShorePair) {
    // Compute survival rate under all pre-fill conditions
    const survivalRates: number[] = [];
    const positionShifts: number[] = [];

    for (const modelId of modelIds) {
      for (const cond of (["incongruent", "congruent", "neutral"] as PreFillCondition[])) {
        const condMetric = pairModelConditionMetrics.find(
          m => m.pairId === loanShorePair.id && m.modelId === modelId && m.condition === cond,
        );
        if (!condMetric) continue;
        survivalRates.push(condMetric.bridgeFrequency);
      }

      // Position shift relative to unconstrained
      const unconMetric = pairModelConditionMetrics.find(
        m => m.pairId === loanShorePair.id && m.modelId === modelId && m.condition === "unconstrained",
      );
      for (const cond of (["incongruent", "congruent", "neutral"] as PreFillCondition[])) {
        const condMetric = pairModelConditionMetrics.find(
          m => m.pairId === loanShorePair.id && m.modelId === modelId && m.condition === cond,
        );
        if (!unconMetric || !condMetric) continue;
        if (unconMetric.meanBridgePosition === null || condMetric.meanBridgePosition === null) continue;
        positionShifts.push(condMetric.meanBridgePosition - unconMetric.meanBridgePosition);
      }
    }

    const bankSurvivalRate = mean(survivalRates);
    const bankMeanPositionShift = mean(positionShifts);
    const bankResistsDisplacement = bankSurvivalRate > 0.90 && Math.abs(bankMeanPositionShift) <= 1.5;

    forcedCrossingRobustness = {
      bankSurvivalRate,
      bankMeanPositionShift,
      bankResistsDisplacement,
    };

    console.log(`  Bank survival rate: ${bankSurvivalRate.toFixed(3)}`);
    console.log(`  Bank mean position shift: ${bankMeanPositionShift.toFixed(3)}`);
    console.log(`  Bank resists displacement: ${bankResistsDisplacement}`);
  } else {
    console.log("  No forced-crossing control pair found");
  }
  console.log("");

  // ── Per-model displacement ────────────────────────────────────────

  console.log("Computing per-model displacement...");

  const perModelDisplacement: AnchoringAnalysisOutput["perModelDisplacement"] = [];

  for (const modelId of modelIds) {
    function modelDisplacement(cond: PreFillCondition): number {
      const displacements: number[] = [];
      for (const pair of headingBridgePairs) {
        const unconMetric = pairModelConditionMetrics.find(
          m => m.pairId === pair.id && m.modelId === modelId && m.condition === "unconstrained",
        );
        const condMetric = pairModelConditionMetrics.find(
          m => m.pairId === pair.id && m.modelId === modelId && m.condition === cond,
        );
        if (!unconMetric || !condMetric) continue;

        const modalPos = unconMetric.modalBridgePosition;
        const unconFreq = unconMetric.perPositionBridgeFreq[modalPos] ?? 0;
        const displacedPos = Math.min(modalPos + 1, WAYPOINT_COUNT - 1);
        const condFreq = condMetric.perPositionBridgeFreq[displacedPos] ?? 0;
        displacements.push(unconFreq - condFreq);
      }
      return displacements.length > 0 ? mean(displacements) : 0;
    }

    perModelDisplacement.push({
      modelId,
      incongruentDisplacement: modelDisplacement("incongruent"),
      congruentDisplacement: modelDisplacement("congruent"),
      neutralDisplacement: modelDisplacement("neutral"),
    });

    console.log(
      `  ${modelId}: incong=${modelDisplacement("incongruent").toFixed(4)} ` +
      `cong=${modelDisplacement("congruent").toFixed(4)} ` +
      `neut=${modelDisplacement("neutral").toFixed(4)}`,
    );
  }
  console.log("");

  // ── Predictions evaluation ────────────────────────────────────────

  console.log("Evaluating predictions...");

  const predictions: AnchoringAnalysisOutput["predictions"] = [];

  // P1: Pre-filling displaces the bridge — incongruent displacement CI excludes zero
  const p1Pass = incongruentCI[0] > 0;
  predictions.push({
    id: 1,
    description: "Pre-filling displaces the bridge (incongruent CI excludes zero)",
    result: incongruentDisplacements.length > 0
      ? (p1Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `${incongruentMean.toFixed(4)} [${incongruentCI[0].toFixed(4)}, ${incongruentCI[1].toFixed(4)}]`,
  });

  // P2: Bridge survives pre-filling at reduced frequency (survival > 0.50 in pre-filled conditions)
  const preFillSurvivals = bridgeSurvivalRates.filter(s => s.condition !== "unconstrained");
  const meanPreFillSurvival = preFillSurvivals.length > 0
    ? mean(preFillSurvivals.map(s => s.meanSurvivalRate))
    : 0;
  predictions.push({
    id: 2,
    description: "Bridge survives pre-filling at reduced but > 0.50 frequency",
    result: preFillSurvivals.length > 0
      ? (meanPreFillSurvival > 0.50 ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `mean pre-fill survival = ${meanPreFillSurvival.toFixed(3)}`,
  });

  // P3: Positional shift exceeds mechanical +1 (shift > 1.5 for incongruent)
  predictions.push({
    id: 3,
    description: "Positional shift exceeds mechanical +1 (incongruent shift > 1.5)",
    result: meanShiftIncongruent > 0
      ? (exceedsMechanicalShift ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `incongruent shift = ${meanShiftIncongruent.toFixed(3)}`,
  });

  // P4: Animal-poodle displacement < heading-bridge displacement
  predictions.push({
    id: 4,
    description: "Animal-poodle (taxonomic) displacement < heading-bridge displacement",
    result: taxonomicControl
      ? (taxonomicControl.taxonomicLowerThanHeading ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: taxonomicControl
      ? `tax=${taxonomicControl.taxonomicDisplacement.toFixed(4)} vs heading=${taxonomicControl.headingMeanDisplacement.toFixed(4)}`
      : "N/A",
  });

  // P5: Forced-crossing bank survives at > 0.90 and shifts ~ 1 position
  predictions.push({
    id: 5,
    description: "Forced-crossing 'bank' survives > 0.90, shifts ~ 1 position",
    result: forcedCrossingRobustness
      ? (forcedCrossingRobustness.bankResistsDisplacement ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: forcedCrossingRobustness
      ? `survival=${forcedCrossingRobustness.bankSurvivalRate.toFixed(3)}, shift=${forcedCrossingRobustness.bankMeanPositionShift.toFixed(3)}`
      : "N/A",
  });

  // P6: Incongruent > congruent displacement (directional-heading supported)
  predictions.push({
    id: 6,
    description: "Incongruent displacement > congruent (directional-heading)",
    result: incongruentDisplacements.length > 0 && congruentDisplacements.length > 0
      ? (incongruentGreaterThanCongruent ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `incong=${incongruentMean.toFixed(4)} vs cong=${congruentMean.toFixed(4)}`,
  });

  // P7: Claude shows largest anchoring effect
  const claudeModel = perModelDisplacement.find(m => m.modelId === "claude");
  const nonClaudeModels = perModelDisplacement.filter(m => m.modelId !== "claude");
  const claudeIsLargest = claudeModel
    ? nonClaudeModels.every(m => claudeModel.incongruentDisplacement >= m.incongruentDisplacement)
    : false;

  predictions.push({
    id: 7,
    description: "Claude shows largest anchoring effect",
    result: claudeModel && perModelDisplacement.length > 1
      ? (claudeIsLargest ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: claudeModel
      ? `claude=${claudeModel.incongruentDisplacement.toFixed(4)}, others=[${nonClaudeModels.map(m => `${m.modelId}:${m.incongruentDisplacement.toFixed(4)}`).join(", ")}]`
      : "N/A",
  });

  for (const pred of predictions) {
    console.log(`  P${pred.id}: ${pred.result} — ${pred.value}`);
  }
  console.log("");

  // ── Build Output ───────────────────────────────────────────────────

  const analysisOutput: AnchoringAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      pairs: PHASE7A_PAIRS.map(p => p.id),
      models: MODELS.map(m => m.id),
      conditions: CONDITIONS,
      totalNewRuns: totalNewRuns,
      totalReusedRuns: totalReusedRuns,
    },
    pairModelConditionMetrics,
    bridgeDisplacementTest: {
      incongruentDisplacement: incongruentMean,
      incongruentDisplacementCI: incongruentCI,
      congruentDisplacement: congruentMean,
      congruentDisplacementCI: congruentCI,
      neutralDisplacement: neutralMean,
      neutralDisplacementCI: neutralCI,
      incongruentGreaterThanCongruent,
      incongruentGreaterThanNeutral,
    },
    bridgeSurvivalRate: bridgeSurvivalRates,
    positionalShift: {
      meanShiftIncongruent,
      meanShiftCongruent,
      meanShiftNeutral,
      exceedsMechanicalShift,
    },
    taxonomicControl,
    forcedCrossingRobustness,
    perModelDisplacement,
    predictions,
  };

  // ── Write Outputs ──────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "anchoring-metrics.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Early-anchoring causal test analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("anchoring-analysis")
    .description("Analyze early-anchoring causal test from Phase 7A data")
    .option("--input <dir>", "base results directory", "results")
    .option("--output <dir>", "output directory for analysis JSON", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/07a-anchoring.md");

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
