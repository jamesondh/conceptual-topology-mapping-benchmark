#!/usr/bin/env bun
/**
 * Phase 3B: Transitive Path Structure Analysis
 *
 * For each triple (A, B, C) × model, computes:
 * - Waypoint transitivity: overlap between direct A→C and composed A→B+B→C paths
 * - Navigational distances and triangle inequality testing
 * - Shortcuts (A→C waypoints not in A→B∪B→C) and detours (vice versa)
 * - Bridge concept analysis: does B appear on the A→C path?
 *
 * Loads data from results/pilot/ (Phase 1), results/reversals/ (Phase 2),
 * and results/transitivity/ (Phase 3B new runs).
 *
 * Usage:
 *   bun run analysis/03b-transitivity.ts
 *   bun run analysis/03b-transitivity.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  computeTransitivityMetrics,
  bootstrapCI,
  mean,
} from "../metrics.ts";
import { MODELS } from "../pairs.ts";
import { TRIPLES, getTripleLegs } from "../triples.ts";
import type {
  ElicitationResult,
  TransitivityMetrics,
  TripleType,
  TripleTypeAggregation,
  TransitivityAnalysisOutput,
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
      paths.push(...await readJsonFilesRecursive(fullPath));
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

/**
 * Build a lookup: pairId::modelId → string[][] (successful canonicalized waypoints)
 */
function buildWaypointLookup(results: ElicitationResult[]): Map<string, string[][]> {
  const lookup = new Map<string, string[][]>();
  for (const r of results) {
    if (r.failureMode) continue;
    if (r.canonicalizedWaypoints.length === 0) continue;
    const key = `${r.pair.id}::${r.modelShortId}`;
    if (!lookup.has(key)) lookup.set(key, []);
    lookup.get(key)!.push(r.canonicalizedWaypoints);
  }
  return lookup;
}

/**
 * Lookup waypoint runs for a leg, trying both the synthetic pair ID
 * and the reusable pair ID.
 */
function getRunsForLeg(
  tripleId: string,
  legId: string,
  reusablePairId: string | null,
  modelId: string,
  lookups: Map<string, string[][]>,
): string[][] {
  // Try synthetic pair ID first (from new transitivity data)
  const syntheticKey = `${tripleId}--${legId}::${modelId}`;
  const syntheticRuns = lookups.get(syntheticKey);
  if (syntheticRuns && syntheticRuns.length > 0) return syntheticRuns;

  // Try reusable pair ID from Phase 1/2
  if (reusablePairId) {
    const reusableKey = `${reusablePairId}::${modelId}`;
    const reusableRuns = lookups.get(reusableKey);
    if (reusableRuns && reusableRuns.length > 0) return reusableRuns;
  }

  return [];
}

// ── Findings Report ─────────────────────────────────────────────

function generateFindings(output: TransitivityAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 3B: Transitive Path Structure Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Triples analyzed:** ${output.metadata.triples.length}`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **New API runs:** ${output.metadata.totalNewRuns}`);
  lines.push(`- **Reused runs from Phase 1/2:** ${output.metadata.totalReusedRuns}`);
  lines.push(`- **Total triple/model combinations:** ${output.tripleModelMetrics.length}`);
  lines.push("");

  // 2. Overall Transitivity
  lines.push("## 2. Overall Transitivity Results");
  lines.push("");

  if (output.tripleModelMetrics.length > 0) {
    const allTransitivities = output.tripleModelMetrics.map((m) => m.waypointTransitivity);
    const overallMean = mean(allTransitivities);
    const overallCI = bootstrapCI(allTransitivities);

    lines.push(`**Overall mean waypoint transitivity:** ${overallMean.toFixed(3)} (95% CI: [${overallCI[0].toFixed(3)}, ${overallCI[1].toFixed(3)}])`);
    lines.push("");

    const triHolds = output.tripleModelMetrics.filter((m) => m.triangleInequalityHolds).length;
    lines.push(`**Triangle inequality holds:** ${triHolds}/${output.tripleModelMetrics.length} (${((triHolds / output.tripleModelMetrics.length) * 100).toFixed(1)}%)`);
    lines.push("");

    const bridgeAppears = output.tripleModelMetrics.filter((m) => m.bridgeConceptAppears).length;
    lines.push(`**Bridge concept appears on direct path:** ${bridgeAppears}/${output.tripleModelMetrics.length} (${((bridgeAppears / output.tripleModelMetrics.length) * 100).toFixed(1)}%)`);
    lines.push("");
  }

  // 3. By Triple Type
  lines.push("## 3. By Triple Type");
  lines.push("");
  lines.push("| Type | Mean Transitivity | 95% CI | Tri. Ineq. Holds | Bridge Freq | Triples |");
  lines.push("|------|-------------------|--------|-------------------|-------------|---------|");
  for (const agg of output.tripleTypeAggregations) {
    lines.push(
      `| ${agg.type} | ${agg.meanWaypointTransitivity.toFixed(3)} | [${agg.waypointTransitivityCI[0].toFixed(3)}, ${agg.waypointTransitivityCI[1].toFixed(3)}] | ${(agg.triangleInequalityHoldsFraction * 100).toFixed(0)}% | ${agg.meanBridgeConceptFrequency.toFixed(3)} | ${agg.tripleCount} |`,
    );
  }
  lines.push("");

  // Interpretation
  const hierAgg = output.tripleTypeAggregations.find((a) => a.type === "hierarchical");
  const randomAgg = output.tripleTypeAggregations.find((a) => a.type === "random-control");
  if (hierAgg && randomAgg) {
    if (hierAgg.meanWaypointTransitivity > randomAgg.meanWaypointTransitivity + 0.05) {
      lines.push(
        `**Prediction confirmed:** Hierarchical triples (${hierAgg.meanWaypointTransitivity.toFixed(3)}) show higher ` +
        `transitivity than random controls (${randomAgg.meanWaypointTransitivity.toFixed(3)}), ` +
        `suggesting taxonomic chains have compositional structure.`,
      );
    } else {
      lines.push(
        `**Prediction not confirmed:** Hierarchical triples (${hierAgg.meanWaypointTransitivity.toFixed(3)}) ` +
        `show similar transitivity to random controls (${randomAgg.meanWaypointTransitivity.toFixed(3)}).`,
      );
    }
    lines.push("");
  }

  // 4. By Model
  lines.push("## 4. By Model");
  lines.push("");
  lines.push("| Model | Mean Transitivity | 95% CI | Tri. Ineq. Holds | Mean Slack |");
  lines.push("|-------|-------------------|--------|-------------------|------------|");
  for (const agg of output.modelAggregations) {
    lines.push(
      `| ${agg.displayName} | ${agg.meanWaypointTransitivity.toFixed(3)} | [${agg.waypointTransitivityCI[0].toFixed(3)}, ${agg.waypointTransitivityCI[1].toFixed(3)}] | ${(agg.triangleInequalityHoldsFraction * 100).toFixed(0)}% | ${agg.meanTriangleSlack.toFixed(3)} |`,
    );
  }
  lines.push("");

  // 5. Individual Triple Deep Dives
  lines.push("## 5. Individual Triple Details");
  lines.push("");

  for (const triple of TRIPLES) {
    const metrics = output.tripleModelMetrics.filter((m) => m.tripleId === triple.id);
    if (metrics.length === 0) continue;

    lines.push(`### ${triple.id} (${triple.A} → ${triple.B} → ${triple.C})`);
    lines.push(`Type: ${triple.type}${triple.notes ? ` — ${triple.notes}` : ""}`);
    lines.push("");

    lines.push("| Model | Transitivity | d(A→B) | d(B→C) | d(A→C) | Tri.Ineq | Slack | Bridge Freq | Shortcuts | Detours |");
    lines.push("|-------|-------------|--------|--------|--------|----------|-------|-------------|-----------|---------|");
    for (const m of metrics) {
      lines.push(
        `| ${m.modelId} | ${m.waypointTransitivity.toFixed(3)} | ${m.distanceAB.toFixed(3)} | ${m.distanceBC.toFixed(3)} | ${m.distanceAC.toFixed(3)} | ${m.triangleInequalityHolds ? "✓" : "✗"} | ${m.triangleSlack.toFixed(3)} | ${m.bridgeConceptFrequency.toFixed(2)} | ${m.shortcuts.length > 0 ? m.shortcuts.join(", ") : "—"} | ${m.detours.length > 0 ? m.detours.join(", ") : "—"} |`,
      );
    }
    lines.push("");
  }

  // 6. Appendix: All metrics
  lines.push("## 6. Appendix: All Triple/Model Metrics");
  lines.push("");
  lines.push("| Triple | Model | Transitivity | CI | d(AB) | d(BC) | d(AC) | Tri.Ineq | Slack | Bridge | Runs(AB) | Runs(BC) | Runs(AC) |");
  lines.push("|--------|-------|--------------|----|-------|-------|-------|----------|-------|--------|----------|----------|----------|");
  for (const m of output.tripleModelMetrics) {
    lines.push(
      `| ${m.tripleId} | ${m.modelId} | ${m.waypointTransitivity.toFixed(3)} | [${m.waypointTransitivityCI[0].toFixed(3)},${m.waypointTransitivityCI[1].toFixed(3)}] | ${m.distanceAB.toFixed(3)} | ${m.distanceBC.toFixed(3)} | ${m.distanceAC.toFixed(3)} | ${m.triangleInequalityHolds ? "✓" : "✗"} | ${m.triangleSlack.toFixed(3)} | ${m.bridgeConceptFrequency.toFixed(2)} | ${m.runCountAB} | ${m.runCountBC} | ${m.runCountAC} |`,
    );
  }
  lines.push("");

  return lines.join("\n");
}

// ── Main Pipeline ───────────────────────────────────────────────

async function analyze(opts: {
  input: string;
  output: string;
  findings: string;
}): Promise<void> {
  const inputDir = resolve(opts.input);
  const outputDir = resolve(opts.output);
  const findingsPath = resolve(opts.findings);

  console.log("Conceptual Topology Mapping Benchmark - Transitivity Analysis");
  console.log("=============================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // Load all data sources
  console.log("Loading data from all phases...");

  // Phase 1: forward results (pilot, 5wp/semantic only)
  const pilotDir = join(inputDir, "pilot");
  const pilotResults = (await loadResultsFromDir(pilotDir)).filter(
    (r) => r.waypointCount === 5 && r.promptFormat === "semantic",
  );
  console.log(`  Phase 1 forward: ${pilotResults.length} results`);

  // Phase 2: reverse results
  const reversalDir = join(inputDir, "reversals");
  const reversalResults = await loadResultsFromDir(reversalDir);
  console.log(`  Phase 2 reverse: ${reversalResults.length} results`);

  // Phase 3B: new transitivity results
  const transitivityDir = join(inputDir, "transitivity");
  const transitivityResults = await loadResultsFromDir(transitivityDir);
  console.log(`  Phase 3B new:    ${transitivityResults.length} results`);
  console.log("");

  // Build unified lookup
  const allResults = [...pilotResults, ...reversalResults, ...transitivityResults];
  const lookup = buildWaypointLookup(allResults);

  console.log(`  Total lookup keys: ${lookup.size}`);
  console.log("");

  // Get model IDs
  const modelIds = MODELS.map((m) => m.id);

  // Compute metrics for each triple × model
  console.log("Computing transitivity metrics...");
  const tripleModelMetrics: TransitivityMetrics[] = [];
  let totalNewRuns = 0;
  let totalReusedRuns = 0;

  for (const triple of TRIPLES) {
    const legs = getTripleLegs(triple);
    const legMap: Record<string, { reusablePairId: string | null }> = {};
    for (const leg of legs) {
      legMap[leg.legId] = { reusablePairId: leg.reusablePairId };
    }

    for (const modelId of modelIds) {
      // Get runs for each of the 3 forward legs: AB, BC, AC
      const runsAB = getRunsForLeg(
        triple.id, "AB", legMap["AB"]?.reusablePairId ?? null, modelId, lookup,
      );
      const runsBC = getRunsForLeg(
        triple.id, "BC", legMap["BC"]?.reusablePairId ?? null, modelId, lookup,
      );
      const runsAC = getRunsForLeg(
        triple.id, "AC", legMap["AC"]?.reusablePairId ?? null, modelId, lookup,
      );

      // Track reuse
      for (const [legId, runs] of [["AB", runsAB], ["BC", runsBC], ["AC", runsAC]] as [string, string[][]][]) {
        const reusable = legMap[legId]?.reusablePairId;
        if (reusable && runs.length > 0) {
          totalReusedRuns += runs.length;
        } else {
          totalNewRuns += runs.length;
        }
      }

      if (runsAB.length === 0 || runsBC.length === 0 || runsAC.length === 0) {
        console.log(`  SKIP ${triple.id} (${modelId}): missing legs — AB:${runsAB.length} BC:${runsBC.length} AC:${runsAC.length}`);
        continue;
      }

      const metrics = computeTransitivityMetrics(
        triple.id,
        modelId,
        triple.B,
        runsAB,
        runsBC,
        runsAC,
      );
      tripleModelMetrics.push(metrics);

      console.log(
        `  ${triple.id} (${modelId}): transitivity=${metrics.waypointTransitivity.toFixed(3)} ` +
        `tri=${metrics.triangleInequalityHolds ? "✓" : "✗"} bridge=${metrics.bridgeConceptFrequency.toFixed(2)} ` +
        `runs=${runsAB.length}/${runsBC.length}/${runsAC.length}`,
      );
    }
  }
  console.log("");
  console.log(`Computed ${tripleModelMetrics.length} triple/model combinations`);
  console.log("");

  // Triple type aggregations
  console.log("Computing type aggregations...");
  const tripleTypes: TripleType[] = [
    "hierarchical", "semantic-chain", "existing-pair", "polysemy-extend", "random-control",
  ];
  const tripleTypeAggregations: TripleTypeAggregation[] = [];

  for (const type of tripleTypes) {
    const typeTripleIds = new Set(TRIPLES.filter((t) => t.type === type).map((t) => t.id));
    const typeMetrics = tripleModelMetrics.filter((m) => typeTripleIds.has(m.tripleId));
    if (typeMetrics.length === 0) continue;

    const transitivities = typeMetrics.map((m) => m.waypointTransitivity);
    const slacks = typeMetrics.map((m) => m.triangleSlack);
    const triHolds = typeMetrics.filter((m) => m.triangleInequalityHolds).length;
    const bridgeFreqs = typeMetrics.map((m) => m.bridgeConceptFrequency);

    const agg: TripleTypeAggregation = {
      type,
      meanWaypointTransitivity: mean(transitivities),
      waypointTransitivityCI: bootstrapCI(transitivities),
      meanTriangleSlack: mean(slacks),
      triangleInequalityHoldsFraction: triHolds / typeMetrics.length,
      meanBridgeConceptFrequency: mean(bridgeFreqs),
      tripleCount: typeMetrics.length,
    };
    tripleTypeAggregations.push(agg);

    console.log(
      `  ${type}: transitivity=${agg.meanWaypointTransitivity.toFixed(3)} ` +
      `tri=${(agg.triangleInequalityHoldsFraction * 100).toFixed(0)}% ` +
      `bridge=${agg.meanBridgeConceptFrequency.toFixed(3)} ` +
      `n=${agg.tripleCount}`,
    );
  }
  console.log("");

  // Model aggregations
  console.log("Computing model aggregations...");
  const modelAggregations: TransitivityAnalysisOutput["modelAggregations"] = [];

  for (const model of MODELS) {
    const modelMetrics = tripleModelMetrics.filter((m) => m.modelId === model.id);
    if (modelMetrics.length === 0) continue;

    const transitivities = modelMetrics.map((m) => m.waypointTransitivity);
    const slacks = modelMetrics.map((m) => m.triangleSlack);
    const triHolds = modelMetrics.filter((m) => m.triangleInequalityHolds).length;

    modelAggregations.push({
      modelId: model.id,
      displayName: model.displayName,
      meanWaypointTransitivity: mean(transitivities),
      waypointTransitivityCI: bootstrapCI(transitivities),
      meanTriangleSlack: mean(slacks),
      triangleInequalityHoldsFraction: triHolds / modelMetrics.length,
    });

    console.log(
      `  ${model.displayName}: transitivity=${mean(transitivities).toFixed(3)} ` +
      `tri=${((triHolds / modelMetrics.length) * 100).toFixed(0)}%`,
    );
  }
  console.log("");

  // Build output
  const analysisOutput: TransitivityAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      triples: TRIPLES.map((t) => t.id),
      models: MODELS.map((m) => m.id),
      totalNewRuns,
      totalReusedRuns,
    },
    tripleModelMetrics,
    tripleTypeAggregations,
    modelAggregations,
  };

  // Write outputs
  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "transitivity-metrics.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Transitivity analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("transitivity-analysis")
    .description("Analyze transitive path structure across concept triples")
    .option("--input <dir>", "base results directory", "results")
    .option("--output <dir>", "output directory for analysis JSON", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/03b-transitivity.md");

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
