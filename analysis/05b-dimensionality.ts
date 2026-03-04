#!/usr/bin/env bun
/**
 * Phase 5B: Dimensionality Probing Analysis
 *
 * For each Phase 5B dimensionality triple (A, B, C) x model, computes:
 * - Bridge frequency: how often focal concept B appears on A->C paths
 * - Bootstrap CI on bridge frequency
 * - Same-axis vs cross-axis aggregate comparison with bootstrap delta CI
 * - Per focal concept breakdown (light, bank, fire)
 * - Partial overlap detection
 * - Per-model dimension count estimates
 * - Control validation
 *
 * Loads data from:
 *   results/dimensionality/   (Phase 5B)
 *
 * Usage:
 *   bun run analysis/05b-dimensionality.ts
 *   bun run analysis/05b-dimensionality.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  seededRandom,
  computeBridgeFrequency,
  bootstrapBridgeFrequencyCI,
  bootstrapCI,
  mean,
} from "../metrics.ts";
import { MODELS } from "../pairs.ts";
import { PHASE5B_TRIPLES } from "../triples-phase5.ts";
import type {
  DimensionalityAnalysisOutput,
  AxisPattern,
  Phase5DimensionalityTriple,
  ElicitationResult,
} from "../types.ts";

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
      if (
        parsed.model &&
        parsed.pair &&
        Array.isArray(parsed.canonicalizedWaypoints)
      ) {
        results.push(parsed);
      }
    } catch {
      // Skip malformed
    }
  }
  return results;
}

/**
 * Build a lookup: pairId::modelId -> ElicitationResult[] (successful runs).
 */
function buildWaypointLookup(
  results: ElicitationResult[],
): Map<string, ElicitationResult[]> {
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

/**
 * Extract just the waypoint arrays from results.
 */
function waypointsOnly(results: ElicitationResult[]): string[][] {
  return results.map((r) => r.canonicalizedWaypoints);
}

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: DimensionalityAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 5B: Dimensionality Probing Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // ── 1. Experiment Overview ──────────────────────────────────────
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Triples analyzed:** ${output.metadata.triples.length}`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **Focal concepts:** ${output.metadata.focalConcepts.join(", ")}`);
  lines.push(`- **Total new runs:** ${output.metadata.totalNewRuns}`);
  lines.push(`- **Total reused runs:** ${output.metadata.totalReusedRuns}`);
  lines.push(
    `- **Total triple/model observations:** ${output.tripleModelBridgeFreqs.length}`,
  );
  lines.push("");

  // ── 2. Per-Triple Bridge Frequency ──────────────────────────────
  lines.push("## 2. Per-Triple Bridge Frequency");
  lines.push("");
  lines.push(
    "| Triple | Focal Concept | Axis Pattern | Model | Bridge Freq | CI | Runs |",
  );
  lines.push(
    "|--------|---------------|-------------|-------|-------------|-----|------|",
  );

  for (const triple of PHASE5B_TRIPLES) {
    const metrics = output.tripleModelBridgeFreqs.filter(
      (m) => m.tripleId === triple.id,
    );
    for (const m of metrics) {
      lines.push(
        `| ${m.tripleId} | ${m.focalConcept} | ${m.axisPattern} | ${m.modelId} | ` +
          `${m.bridgeFrequency.toFixed(2)} | ` +
          `[${m.bridgeFrequencyCI[0].toFixed(2)}, ${m.bridgeFrequencyCI[1].toFixed(2)}] | ` +
          `${m.runCount} |`,
      );
    }
  }
  lines.push("");

  // ── 3. Same-Axis vs Cross-Axis Comparison ──────────────────────
  lines.push("## 3. Same-Axis vs Cross-Axis Comparison");
  lines.push("");

  const ac = output.axisComparison;
  lines.push(`- **Same-axis mean bridge frequency:** ${ac.sameAxisMeanFreq.toFixed(3)}`);
  lines.push(`- **Cross-axis mean bridge frequency:** ${ac.crossAxisMeanFreq.toFixed(3)}`);
  lines.push(`- **Delta (same - cross):** ${ac.delta.toFixed(3)}`);
  lines.push(
    `- **Delta 95% CI:** [${ac.deltaCI[0].toFixed(3)}, ${ac.deltaCI[1].toFixed(3)}]`,
  );
  lines.push(
    `- **Significantly positive (delta > 0.40, CI excludes 0):** ${ac.significantlyPositive ? "YES" : "NO"}`,
  );
  lines.push("");

  if (ac.significantlyPositive) {
    lines.push(
      "**Conclusion:** Same-axis triples show substantially higher bridge frequency than cross-axis " +
        "triples, confirming that LLM semantic spaces encode multiple independent dimensions for " +
        "polysemous concepts.",
    );
  } else {
    lines.push(
      "**Conclusion:** The same-axis vs cross-axis difference does not meet the significance " +
        "threshold (delta > 0.40 with CI excluding zero). Further investigation needed.",
    );
  }
  lines.push("");

  // ── 4. Per Focal Concept Breakdown ──────────────────────────────
  lines.push("## 4. Per Focal Concept Breakdown");
  lines.push("");

  const polysemousFocals = ["light", "bank"];
  const nonPolysemousFocals = ["fire"];

  lines.push("### Polysemous Focal Concepts");
  lines.push("");
  lines.push(
    "| Focal Concept | Same-Axis Mean | Cross-Axis Mean | Delta | Polysemous |",
  );
  lines.push(
    "|---------------|---------------|----------------|-------|------------|",
  );

  for (const fc of output.perFocalConcept) {
    lines.push(
      `| ${fc.focalConcept} | ${fc.sameAxisMeanFreq.toFixed(3)} | ` +
        `${fc.crossAxisMeanFreq.toFixed(3)} | ${fc.delta.toFixed(3)} | ` +
        `${fc.isPolysemous ? "yes" : "no"} |`,
    );
  }
  lines.push("");

  // Polysemy comparison
  const polysemousDeltas = output.perFocalConcept
    .filter((fc) => fc.isPolysemous)
    .map((fc) => fc.delta);
  const nonPolysemousDeltas = output.perFocalConcept
    .filter((fc) => !fc.isPolysemous)
    .map((fc) => fc.delta);

  if (polysemousDeltas.length > 0 && nonPolysemousDeltas.length > 0) {
    const polysemousMeanDelta = mean(polysemousDeltas);
    const nonPolysemousMeanDelta = mean(nonPolysemousDeltas);

    lines.push(
      `**Polysemous focal concepts mean delta:** ${polysemousMeanDelta.toFixed(3)}`,
    );
    lines.push(
      `**Non-polysemous focal concepts mean delta:** ${nonPolysemousMeanDelta.toFixed(3)}`,
    );
    lines.push("");

    if (polysemousMeanDelta > nonPolysemousMeanDelta) {
      lines.push(
        "Polysemous focal concepts (light, bank) show a larger same-axis vs cross-axis gap " +
          "than non-polysemous focal concepts (fire), consistent with the prediction that " +
          "polysemy creates stronger dimensional separation.",
      );
    } else {
      lines.push(
        "Non-polysemous focal concept (fire) shows a comparable or larger gap than polysemous " +
          "concepts. This may indicate that even metaphorical extension creates semantic " +
          "dimensional structure.",
      );
    }
  }
  lines.push("");

  // ── 5. Partial Overlap Analysis ──────────────────────────────────
  lines.push("## 5. Partial Overlap Analysis");
  lines.push("");

  const partialTriples = output.tripleModelBridgeFreqs.filter(
    (m) => m.axisPattern === "partial-overlap",
  );

  if (partialTriples.length === 0) {
    lines.push("_No partial-overlap triples found in results._");
  } else {
    lines.push(
      "Partial-overlap triples should show intermediate bridge frequency (0.20-0.60).",
    );
    lines.push("");
    lines.push("| Triple | Model | Bridge Freq | In Range? |");
    lines.push("|--------|-------|-------------|-----------|");

    let inRangeCount = 0;
    for (const m of partialTriples) {
      const inRange = m.bridgeFrequency >= 0.2 && m.bridgeFrequency <= 0.6;
      if (inRange) inRangeCount++;
      lines.push(
        `| ${m.tripleId} | ${m.modelId} | ${m.bridgeFrequency.toFixed(2)} | ` +
          `${inRange ? "YES" : "NO"} |`,
      );
    }
    lines.push("");
    lines.push(
      `**${inRangeCount}/${partialTriples.length}** partial-overlap observations fall in the ` +
        `predicted 0.20-0.60 range.`,
    );
  }
  lines.push("");

  // ── 6. Per-Model Dimension Estimates ────────────────────────────
  lines.push("## 6. Per-Model Dimension Estimates");
  lines.push("");
  lines.push(
    "For each focal concept, count cross-axis triples with bridge freq < 0.10 " +
      "as evidence of independent semantic axes.",
  );
  lines.push("");
  lines.push(
    "| Model | Focal Concept | Independent Axes | Total Cross-Axis Triples |",
  );
  lines.push(
    "|-------|---------------|-----------------|--------------------------|",
  );

  for (const dim of output.perModelDimensions) {
    lines.push(
      `| ${dim.modelId} | ${dim.focalConcept} | ${dim.independentAxes} | ` +
        `${dim.totalCrossAxisTriples} |`,
    );
  }
  lines.push("");

  // Summarize per model
  const modelDimSummary = new Map<string, number[]>();
  for (const dim of output.perModelDimensions) {
    if (!modelDimSummary.has(dim.modelId)) modelDimSummary.set(dim.modelId, []);
    modelDimSummary.get(dim.modelId)!.push(dim.independentAxes);
  }

  lines.push("### Summary");
  lines.push("");
  for (const [modelId, axes] of modelDimSummary) {
    const totalIndependent = axes.reduce((a, b) => a + b, 0);
    const totalPossible = output.perModelDimensions
      .filter((d) => d.modelId === modelId)
      .reduce((a, d) => a + d.totalCrossAxisTriples, 0);
    lines.push(
      `- **${modelId}:** ${totalIndependent}/${totalPossible} cross-axis triples show ` +
        `bridge freq < 0.10 (full dimensional independence)`,
    );
  }
  lines.push("");

  // ── 7. Controls Validation ──────────────────────────────────────
  lines.push("## 7. Controls Validation");
  lines.push("");

  if (output.controlValidation.length === 0) {
    lines.push("_No control triple data available._");
  } else {
    lines.push(
      "Random control triples should show ~0% bridge frequency.",
    );
    lines.push("");
    lines.push("| Triple | Model | Bridge Freq | Expected |");
    lines.push("|--------|-------|-------------|----------|");

    let controlsPass = true;
    for (const cv of output.controlValidation) {
      const pass = cv.pass;
      if (!pass) controlsPass = false;
      lines.push(
        `| ${cv.tripleId} | ${cv.modelId} | ${cv.bridgeFrequency.toFixed(2)} | ` +
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

  // ── 8. Predictions Summary ──────────────────────────────────────
  lines.push("## 8. Predictions Summary");
  lines.push("");

  // Evaluate predictions
  let totalPredictions = 0;
  let matchedPredictions = 0;

  lines.push("| Triple | Model | Predicted Range | Observed | Match? |");
  lines.push("|--------|-------|----------------|----------|--------|");

  for (const triple of PHASE5B_TRIPLES) {
    if (!triple.predictedBridgeFreq) continue;
    const metrics = output.tripleModelBridgeFreqs.filter(
      (m) => m.tripleId === triple.id,
    );
    for (const m of metrics) {
      const predicted = triple.predictedBridgeFreq[m.modelId];
      if (!predicted) continue;

      totalPredictions++;
      const match =
        m.bridgeFrequency >= predicted[0] && m.bridgeFrequency <= predicted[1];
      if (match) matchedPredictions++;

      lines.push(
        `| ${triple.id} | ${m.modelId} | ` +
          `[${predicted[0].toFixed(2)}, ${predicted[1].toFixed(2)}] | ` +
          `${m.bridgeFrequency.toFixed(2)} | ${match ? "YES" : "NO"} |`,
      );
    }
  }
  lines.push("");

  if (totalPredictions > 0) {
    lines.push(
      `**Overall prediction success rate:** ${matchedPredictions}/${totalPredictions} ` +
        `(${((matchedPredictions / totalPredictions) * 100).toFixed(1)}%)`,
    );
  } else {
    lines.push("_No predictions could be evaluated (missing data)._");
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
    "Conceptual Topology Mapping Benchmark - Dimensionality Probing Analysis",
  );
  console.log(
    "=======================================================================",
  );
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data ────────────────────────────────────────────────────

  console.log("Loading data from dimensionality experiment...");

  const dimensionalityDir = join(inputDir, "dimensionality");
  const allResults = await loadResultsFromDir(dimensionalityDir);
  console.log(`  Phase 5B dimensionality: ${allResults.length} results`);
  console.log("");

  // Build unified lookup
  const lookup = buildWaypointLookup(allResults);
  console.log(`  Total lookup keys: ${lookup.size}`);
  console.log("");

  // ── Compute metrics per triple x model ───────────────────────────

  const modelIds = MODELS.map((m) => m.id);

  console.log("Computing dimensionality bridge metrics...");

  const tripleModelBridgeFreqs: DimensionalityAnalysisOutput["tripleModelBridgeFreqs"] = [];
  const controlValidation: DimensionalityAnalysisOutput["controlValidation"] = [];
  let totalNewRuns = 0;
  let totalReusedRuns = 0;

  for (const triple of PHASE5B_TRIPLES) {
    for (const modelId of modelIds) {
      const pairId = `${triple.id}--AC`;
      const key = `${pairId}::${modelId}`;
      const runs = lookup.get(key) ?? [];
      const wpAC = waypointsOnly(runs);

      totalNewRuns += runs.length;

      if (wpAC.length === 0) {
        console.log(
          `  SKIP ${triple.id} (${modelId}): no AC runs`,
        );
        continue;
      }

      // Compute bridge frequency
      const bridgeFreq = computeBridgeFrequency(wpAC, triple.bridgeConcept);
      const bridgeCI = bootstrapBridgeFrequencyCI(wpAC, triple.bridgeConcept);

      tripleModelBridgeFreqs.push({
        tripleId: triple.id,
        modelId,
        focalConcept: triple.focalConcept,
        axisPattern: triple.axisPattern,
        bridgeFrequency: bridgeFreq,
        bridgeFrequencyCI: bridgeCI,
        runCount: wpAC.length,
      });

      // Track control triples
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
          `CI=[${bridgeCI[0].toFixed(2)}, ${bridgeCI[1].toFixed(2)}] ` +
          `runs=${wpAC.length} pattern=${triple.axisPattern}`,
      );
    }
  }

  console.log("");
  console.log(`Computed ${tripleModelBridgeFreqs.length} triple/model observations`);
  console.log(`  Total runs: ${totalNewRuns}`);
  console.log("");

  // ── Same-axis vs cross-axis comparison ────────────────────────────

  console.log("Computing same-axis vs cross-axis comparison...");

  // Exclude controls and partial-overlap for the primary comparison
  // Also filter out random-control diagnosticType to prevent controls from contaminating cross-axis
  const diagnosticTripleIds = new Set(
    PHASE5B_TRIPLES.filter((t) => t.diagnosticType !== "random-control").map((t) => t.id),
  );
  const sameAxisFreqs = tripleModelBridgeFreqs
    .filter((m) => m.axisPattern === "same-axis" && diagnosticTripleIds.has(m.tripleId))
    .map((m) => m.bridgeFrequency);
  const crossAxisFreqs = tripleModelBridgeFreqs
    .filter((m) => m.axisPattern === "cross-axis" && diagnosticTripleIds.has(m.tripleId))
    .map((m) => m.bridgeFrequency);

  const sameAxisMean = sameAxisFreqs.length > 0 ? mean(sameAxisFreqs) : 0;
  const crossAxisMean = crossAxisFreqs.length > 0 ? mean(crossAxisFreqs) : 0;
  const delta = sameAxisMean - crossAxisMean;

  // Bootstrap CI on the delta
  let deltaCI: [number, number] = [0, 0];
  if (sameAxisFreqs.length > 0 && crossAxisFreqs.length > 0) {
    // Bootstrap the delta directly by resampling both groups
    const nBootstrap = 2000;
    const deltas: number[] = [];
    for (let b = 0; b < nBootstrap; b++) {
      const sameBootstrap: number[] = [];
      for (let i = 0; i < sameAxisFreqs.length; i++) {
        sameBootstrap.push(
          sameAxisFreqs[Math.floor(seededRandom() * sameAxisFreqs.length)],
        );
      }
      const crossBootstrap: number[] = [];
      for (let i = 0; i < crossAxisFreqs.length; i++) {
        crossBootstrap.push(
          crossAxisFreqs[Math.floor(seededRandom() * crossAxisFreqs.length)],
        );
      }
      deltas.push(mean(sameBootstrap) - mean(crossBootstrap));
    }
    deltas.sort((a, b) => a - b);
    deltaCI = [
      deltas[Math.floor(nBootstrap * 0.025)],
      deltas[Math.floor(nBootstrap * 0.975)],
    ];
  }

  const significantlyPositive = delta > 0.4 && deltaCI[0] > 0;

  const axisComparison: DimensionalityAnalysisOutput["axisComparison"] = {
    sameAxisMeanFreq: sameAxisMean,
    crossAxisMeanFreq: crossAxisMean,
    delta,
    deltaCI,
    significantlyPositive,
  };

  console.log(
    `  Same-axis mean: ${sameAxisMean.toFixed(3)}, Cross-axis mean: ${crossAxisMean.toFixed(3)}`,
  );
  console.log(
    `  Delta: ${delta.toFixed(3)}, CI: [${deltaCI[0].toFixed(3)}, ${deltaCI[1].toFixed(3)}]`,
  );
  console.log(`  Significantly positive: ${significantlyPositive}`);
  console.log("");

  // ── Per focal concept comparison ──────────────────────────────────

  console.log("Computing per focal concept breakdown...");

  const focalConcepts = [...new Set(PHASE5B_TRIPLES.map((t) => t.focalConcept))].filter(
    (fc) => fc !== "none",
  );
  const polysemousConcepts = new Set(["light", "bank"]);

  const perFocalConcept: DimensionalityAnalysisOutput["perFocalConcept"] = [];

  for (const focal of focalConcepts) {
    const sameFreqs = tripleModelBridgeFreqs
      .filter((m) => m.focalConcept === focal && m.axisPattern === "same-axis")
      .map((m) => m.bridgeFrequency);
    const crossFreqs = tripleModelBridgeFreqs
      .filter((m) => m.focalConcept === focal && m.axisPattern === "cross-axis")
      .map((m) => m.bridgeFrequency);

    const sameMean = sameFreqs.length > 0 ? mean(sameFreqs) : 0;
    const crossMean = crossFreqs.length > 0 ? mean(crossFreqs) : 0;
    const focalDelta = sameMean - crossMean;

    perFocalConcept.push({
      focalConcept: focal,
      sameAxisMeanFreq: sameMean,
      crossAxisMeanFreq: crossMean,
      delta: focalDelta,
      isPolysemous: polysemousConcepts.has(focal),
    });

    console.log(
      `  ${focal}: same=${sameMean.toFixed(3)} cross=${crossMean.toFixed(3)} ` +
        `delta=${focalDelta.toFixed(3)} polysemous=${polysemousConcepts.has(focal)}`,
    );
  }
  console.log("");

  // ── Per-model dimension count ─────────────────────────────────────

  console.log("Computing per-model dimension estimates...");

  const perModelDimensions: DimensionalityAnalysisOutput["perModelDimensions"] = [];

  for (const modelId of modelIds) {
    for (const focal of focalConcepts) {
      const crossTriples = tripleModelBridgeFreqs.filter(
        (m) =>
          m.modelId === modelId &&
          m.focalConcept === focal &&
          m.axisPattern === "cross-axis",
      );
      const independentAxes = crossTriples.filter(
        (m) => m.bridgeFrequency < 0.1,
      ).length;

      perModelDimensions.push({
        modelId,
        focalConcept: focal,
        independentAxes,
        totalCrossAxisTriples: crossTriples.length,
      });

      console.log(
        `  ${modelId} / ${focal}: ${independentAxes}/${crossTriples.length} independent axes`,
      );
    }
  }
  console.log("");

  // ── Build Output ─────────────────────────────────────────────────

  const analysisOutput: DimensionalityAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      triples: PHASE5B_TRIPLES.map((t) => t.id),
      models: MODELS.map((m) => m.id),
      focalConcepts: [...new Set(PHASE5B_TRIPLES.map((t) => t.focalConcept))],
      totalNewRuns,
      totalReusedRuns,
    },
    tripleModelBridgeFreqs,
    axisComparison,
    perFocalConcept,
    perModelDimensions,
    controlValidation,
  };

  // ── Write Outputs ────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "dimensionality-metrics.json");
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
  console.log("Dimensionality probing analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("dimensionality-analysis")
    .description(
      "Analyze dimensionality probing across Phase 5B concept triples",
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
      "findings/05b-dimensionality.md",
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
