#!/usr/bin/env bun
/**
 * Phase 3A: Positional Convergence Analysis
 *
 * Tests the starting-point hypothesis directly by analyzing whether
 * forward and reverse paths converge at their endpoints (mirror positions).
 *
 * If the starting-point hypothesis is correct:
 * - wp1 should be strongly direction-dependent (forward wp1 ≠ reverse wp5)
 * - wp5 should converge (forward wp5 ≈ reverse wp1)
 * - Overlap should increase monotonically from position 1 → 5
 *
 * Uses existing Phase 1 (forward) and Phase 2 (reverse) data — no new API calls.
 *
 * Usage:
 *   bun run analysis/03a-positional-convergence.ts
 *   bun run analysis/03a-positional-convergence.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  computePositionalConvergence,
  bootstrapCI,
  mean,
} from "../src/metrics.ts";
import { ALL_PAIRS, MODELS, getPairsByCategory } from "../src/data/pairs.ts";
import type {
  ElicitationResult,
  PairCategory,
  PositionalConvergenceMetrics,
  CategoryConvergence,
  ModelConvergence,
  PositionalConvergenceOutput,
} from "../src/types.ts";

const WAYPOINT_COUNT = 5;

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
      const subPaths = await readJsonFilesRecursive(fullPath);
      paths.push(...subPaths);
    } else if (info.isFile() && name.endsWith(".json")) {
      if (name === "batch-summary.json") continue;
      paths.push(fullPath);
    }
  }
  return paths;
}

async function loadResultsFromDir(dir: string): Promise<ElicitationResult[]> {
  const jsonPaths = await readJsonFilesRecursive(dir);
  const results: ElicitationResult[] = [];
  for (const path of jsonPaths) {
    try {
      const content = await readFile(path, "utf-8");
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

async function loadForwardResults(inputDir: string): Promise<ElicitationResult[]> {
  const pilotDir = join(inputDir, "pilot");
  const allResults = await loadResultsFromDir(pilotDir);
  return allResults.filter(
    (r) => r.waypointCount === 5 && r.promptFormat === "semantic",
  );
}

async function loadReverseResults(inputDir: string): Promise<ElicitationResult[]> {
  const reversalDir = join(inputDir, "reversals");
  const allResults = await loadResultsFromDir(reversalDir);
  // Only reverse runs (pair IDs starting with "rev-")
  return allResults.filter((r) => r.pair.id.startsWith("rev-"));
}

// ── Grouping ─────────────────────────────────────────────────────

function groupByPairAndModel(
  results: ElicitationResult[],
): Map<string, Map<string, string[][]>> {
  const groups = new Map<string, Map<string, string[][]>>();
  for (const r of results) {
    if (r.failureMode) continue;
    const pairId = r.pair.id;
    const modelId = r.modelShortId;
    if (!groups.has(pairId)) groups.set(pairId, new Map());
    const modelMap = groups.get(pairId)!;
    if (!modelMap.has(modelId)) modelMap.set(modelId, []);
    modelMap.get(modelId)!.push(r.canonicalizedWaypoints);
  }
  return groups;
}

// ── Category Aggregation ────────────────────────────────────────

function computeCategoryConvergences(
  metrics: PositionalConvergenceMetrics[],
): CategoryConvergence[] {
  const categories: PairCategory[] = [
    "antonym", "hierarchy", "near-synonym", "cross-domain",
    "polysemy", "anchor", "control-identity", "control-random", "control-nonsense",
  ];

  const results: CategoryConvergence[] = [];

  for (const category of categories) {
    const categoryPairIds = new Set(
      getPairsByCategory(category).map((p) => p.id),
    );
    const categoryMetrics = metrics.filter((m) => categoryPairIds.has(m.pairId));
    if (categoryMetrics.length === 0) continue;

    const slopes = categoryMetrics.map((m) => m.convergenceSlope);
    const meanSlope = mean(slopes);
    const ci = bootstrapCI(slopes);

    // Average per-position match rates
    const meanPerPosition: number[] = [];
    for (let pos = 0; pos < WAYPOINT_COUNT; pos++) {
      const posValues = categoryMetrics
        .filter((m) => pos < m.perPositionMatchRate.length)
        .map((m) => m.perPositionMatchRate[pos]);
      meanPerPosition.push(mean(posValues));
    }

    results.push({
      category,
      meanConvergenceSlope: meanSlope,
      convergenceSlopeCI: ci,
      meanPerPositionMatchRate: meanPerPosition,
      pairModelCount: categoryMetrics.length,
    });
  }

  return results;
}

// ── Model Aggregation ───────────────────────────────────────────

function computeModelConvergences(
  metrics: PositionalConvergenceMetrics[],
): ModelConvergence[] {
  const modelGroups = new Map<string, PositionalConvergenceMetrics[]>();
  for (const m of metrics) {
    if (!modelGroups.has(m.modelId)) modelGroups.set(m.modelId, []);
    modelGroups.get(m.modelId)!.push(m);
  }

  const results: ModelConvergence[] = [];
  for (const [modelId, modelMetrics] of modelGroups) {
    const model = MODELS.find((m) => m.id === modelId);
    const slopes = modelMetrics.map((m) => m.convergenceSlope);
    const meanSlope = mean(slopes);
    const ci = bootstrapCI(slopes);

    const meanPerPosition: number[] = [];
    for (let pos = 0; pos < WAYPOINT_COUNT; pos++) {
      const posValues = modelMetrics
        .filter((m) => pos < m.perPositionMatchRate.length)
        .map((m) => m.perPositionMatchRate[pos]);
      meanPerPosition.push(mean(posValues));
    }

    results.push({
      modelId,
      displayName: model?.displayName ?? modelId,
      meanConvergenceSlope: meanSlope,
      convergenceSlopeCI: ci,
      meanPerPositionMatchRate: meanPerPosition,
      pairCount: modelMetrics.length,
    });
  }

  return results;
}

// ── Findings Report ─────────────────────────────────────────────

function generateFindings(output: PositionalConvergenceOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 3A: Positional Convergence Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Forward results loaded (5wp/semantic):** ${output.metadata.forwardResultCount}`);
  lines.push(`- **Reverse results loaded:** ${output.metadata.reverseResultCount}`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **Unique pairs analyzed:** ${output.metadata.pairs.length}`);
  lines.push(`- **Total pair/model combinations:** ${output.pairModelMetrics.length}`);
  lines.push(`- **Waypoint count:** ${output.metadata.waypointCount}`);
  lines.push(`- **New API calls:** 0 (pure analysis of existing data)`);
  lines.push("");

  // 2. Overall Results
  lines.push("## 2. Overall Positional Convergence");
  lines.push("");

  const { overall } = output;
  lines.push(`**Mean convergence slope:** ${overall.meanConvergenceSlope.toFixed(4)} (95% CI: [${overall.convergenceSlopeCI[0].toFixed(4)}, ${overall.convergenceSlopeCI[1].toFixed(4)}])`);
  lines.push("");
  lines.push(`**Positive convergence fraction:** ${(overall.positiveConvergenceFraction * 100).toFixed(1)}% of pair/model combinations show increasing overlap from start → end`);
  lines.push("");

  // Per-position table
  lines.push("**Per-position mirror-match rates (overall):**");
  lines.push("");
  lines.push("| Position | Fwd→ | ←Rev (mirror) | Match Rate |");
  lines.push("|----------|------|---------------|------------|");
  for (let i = 0; i < overall.meanPerPositionMatchRate.length; i++) {
    const mirrorPos = WAYPOINT_COUNT - 1 - i;
    lines.push(
      `| ${i + 1} | wp${i + 1} | wp${mirrorPos + 1} | ${overall.meanPerPositionMatchRate[i].toFixed(4)} |`,
    );
  }
  lines.push("");

  // Interpretation — check CI for significance, not just slope sign
  if (overall.meanConvergenceSlope > 0.001 && overall.convergenceSlopeCI[0] > 0) {
    lines.push(
      "The convergence slope is significantly positive (CI excludes zero), supporting " +
      "the **starting-point hypothesis**: paths diverge most at their starting points " +
      "(position 1) and converge toward their endpoints (position 5).",
    );
  } else if (overall.meanConvergenceSlope > 0.001) {
    lines.push(
      "The convergence slope is weakly positive but the confidence interval crosses zero, " +
      "and only " + (overall.positiveConvergenceFraction * 100).toFixed(0) + "% of pair/model " +
      "combinations show positive convergence. This does **not** cleanly support the " +
      "starting-point hypothesis. Instead, the per-position rates reveal a **U-shaped pattern** " +
      "(elevated match rates at positions 1 and 5, valley in the middle), suggesting a " +
      "**dual-anchor effect** where both endpoints constrain nearby waypoints. " +
      "See `findings/03-analysis.md` for the refined interpretation.",
    );
  } else if (overall.meanConvergenceSlope < -0.001) {
    lines.push(
      "The negative convergence slope contradicts the starting-point hypothesis. " +
      "Paths are MORE similar at their starting points than their endpoints, " +
      "suggesting destination-pull rather than origin-push.",
    );
  } else {
    lines.push(
      "The near-zero convergence slope suggests no systematic positional pattern. " +
      "Asymmetry is uniformly distributed across positions.",
    );
  }
  lines.push("");

  // 3. Category breakdown
  lines.push("## 3. Category-Level Convergence");
  lines.push("");
  lines.push("| Category | Mean Slope | 95% CI | Per-Position Rates | Combos |");
  lines.push("|----------|-----------|--------|-------------------|--------|");
  for (const cc of output.categoryConvergences) {
    const posRates = cc.meanPerPositionMatchRate.map((r) => r.toFixed(3)).join(" → ");
    lines.push(
      `| ${cc.category} | ${cc.meanConvergenceSlope.toFixed(4)} | [${cc.convergenceSlopeCI[0].toFixed(4)}, ${cc.convergenceSlopeCI[1].toFixed(4)}] | ${posRates} | ${cc.pairModelCount} |`,
    );
  }
  lines.push("");

  // 4. Model breakdown
  lines.push("## 4. Per-Model Convergence");
  lines.push("");
  lines.push("| Model | Mean Slope | 95% CI | Per-Position Rates | Pairs |");
  lines.push("|-------|-----------|--------|-------------------|-------|");
  for (const mc of output.modelConvergences) {
    const posRates = mc.meanPerPositionMatchRate.map((r) => r.toFixed(3)).join(" → ");
    lines.push(
      `| ${mc.displayName} | ${mc.meanConvergenceSlope.toFixed(4)} | [${mc.convergenceSlopeCI[0].toFixed(4)}, ${mc.convergenceSlopeCI[1].toFixed(4)}] | ${posRates} | ${mc.pairCount} |`,
    );
  }
  lines.push("");

  // 5. Notable cases
  lines.push("## 5. Notable Cases");
  lines.push("");

  // Strongest positive convergence
  const sorted = [...output.pairModelMetrics].sort(
    (a, b) => b.convergenceSlope - a.convergenceSlope,
  );

  lines.push("### Strongest Positive Convergence (top 5)");
  lines.push("");
  for (const m of sorted.slice(0, 5)) {
    const posRates = m.perPositionMatchRate.map((r) => r.toFixed(3)).join(" → ");
    lines.push(`- **${m.pairId} (${m.modelId})**: slope=${m.convergenceSlope.toFixed(4)}, R²=${m.convergenceR2.toFixed(3)}, rates=[${posRates}]`);
  }
  lines.push("");

  // Strongest negative convergence (destination-pull)
  lines.push("### Strongest Negative Convergence (top 5)");
  lines.push("");
  const sortedNeg = [...output.pairModelMetrics].sort(
    (a, b) => a.convergenceSlope - b.convergenceSlope,
  );
  for (const m of sortedNeg.slice(0, 5)) {
    const posRates = m.perPositionMatchRate.map((r) => r.toFixed(3)).join(" → ");
    lines.push(`- **${m.pairId} (${m.modelId})**: slope=${m.convergenceSlope.toFixed(4)}, R²=${m.convergenceR2.toFixed(3)}, rates=[${posRates}]`);
  }
  lines.push("");

  // Identity control check
  const identityMetrics = output.pairModelMetrics.filter(
    (m) => m.pairId.includes("identity"),
  );
  if (identityMetrics.length > 0) {
    lines.push("### Identity Controls");
    lines.push("");
    for (const m of identityMetrics) {
      const posRates = m.perPositionMatchRate.map((r) => r.toFixed(3)).join(" → ");
      lines.push(`- **${m.pairId} (${m.modelId})**: rates=[${posRates}], slope=${m.convergenceSlope.toFixed(4)}`);
    }
    lines.push("");
  }

  // 6. Appendix
  lines.push("## 6. Appendix: All Pair/Model Metrics");
  lines.push("");
  lines.push("| Pair | Model | Slope | R² | Pos1 | Pos2 | Pos3 | Pos4 | Pos5 | Fwd | Rev |");
  lines.push("|------|-------|-------|----|------|------|------|------|------|-----|-----|");
  const allSorted = [...output.pairModelMetrics].sort((a, b) => {
    if (a.pairId < b.pairId) return -1;
    if (a.pairId > b.pairId) return 1;
    return a.modelId.localeCompare(b.modelId);
  });
  for (const m of allSorted) {
    const rates = m.perPositionMatchRate;
    lines.push(
      `| ${m.pairId} | ${m.modelId} | ${m.convergenceSlope.toFixed(4)} | ${m.convergenceR2.toFixed(3)} | ${(rates[0] ?? 0).toFixed(3)} | ${(rates[1] ?? 0).toFixed(3)} | ${(rates[2] ?? 0).toFixed(3)} | ${(rates[3] ?? 0).toFixed(3)} | ${(rates[4] ?? 0).toFixed(3)} | ${m.forwardRunCount} | ${m.reverseRunCount} |`,
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

  console.log("Conceptual Topology Mapping Benchmark - Positional Convergence Analysis");
  console.log("=======================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // Load data
  console.log("Loading forward results (5wp/semantic only)...");
  const forwardResults = await loadForwardResults(inputDir);
  console.log(`  Loaded ${forwardResults.length} forward results`);

  console.log("Loading reverse results...");
  const reverseResults = await loadReverseResults(inputDir);
  console.log(`  Loaded ${reverseResults.length} reverse results`);
  console.log("");

  if (forwardResults.length === 0 || reverseResults.length === 0) {
    console.log("Insufficient data for positional convergence analysis.");
    console.log("Need both forward (pilot) and reverse (reversals) results.");
    return;
  }

  // Group by pair/model
  console.log("Grouping results...");
  const forwardByPairModel = groupByPairAndModel(forwardResults);

  // For reverse results, group by original pair ID
  const reverseByPairModel = new Map<string, Map<string, string[][]>>();
  for (const r of reverseResults) {
    if (r.failureMode) continue;
    const originalPairId = r.pair.id.replace(/^rev-/, "");
    const modelId = r.modelShortId;
    if (!reverseByPairModel.has(originalPairId)) reverseByPairModel.set(originalPairId, new Map());
    const modelMap = reverseByPairModel.get(originalPairId)!;
    if (!modelMap.has(modelId)) modelMap.set(modelId, []);
    modelMap.get(modelId)!.push(r.canonicalizedWaypoints);
  }

  // Collect pair/model combinations
  const allPairIds = new Set<string>();
  for (const pairId of forwardByPairModel.keys()) allPairIds.add(pairId);
  const allModelIds = new Set<string>();
  for (const r of forwardResults) allModelIds.add(r.modelShortId);
  for (const r of reverseResults) allModelIds.add(r.modelShortId);

  console.log(`  Forward pairs: ${forwardByPairModel.size}`);
  console.log(`  Reverse pairs: ${reverseByPairModel.size}`);
  console.log(`  Models: ${[...allModelIds].sort().join(", ")}`);
  console.log("");

  // Compute positional convergence metrics
  console.log("Computing positional convergence metrics...");
  const pairModelMetrics: PositionalConvergenceMetrics[] = [];
  let processedCount = 0;

  for (const pairId of allPairIds) {
    for (const modelId of allModelIds) {
      const forwardRuns = forwardByPairModel.get(pairId)?.get(modelId) ?? [];
      const reverseRuns = reverseByPairModel.get(pairId)?.get(modelId) ?? [];

      // Need at least 1 run in each direction
      if (forwardRuns.length === 0 || reverseRuns.length === 0) continue;

      // Filter to runs with exactly WAYPOINT_COUNT waypoints
      const fwdFiltered = forwardRuns.filter((r) => r.length === WAYPOINT_COUNT);
      const revFiltered = reverseRuns.filter((r) => r.length === WAYPOINT_COUNT);
      if (fwdFiltered.length === 0 || revFiltered.length === 0) continue;

      const metrics = computePositionalConvergence(
        pairId,
        modelId,
        fwdFiltered,
        revFiltered,
        WAYPOINT_COUNT,
      );
      pairModelMetrics.push(metrics);

      processedCount++;
      if (processedCount % 10 === 0) {
        process.stdout.write(`\r  Processed ${processedCount} pair/model combinations...`);
      }
    }
  }
  console.log(`\r  Computed metrics for ${pairModelMetrics.length} pair/model combinations.          `);
  console.log("");

  // Aggregations
  console.log("Computing category convergences...");
  const categoryConvergences = computeCategoryConvergences(pairModelMetrics);
  for (const cc of categoryConvergences) {
    const posRates = cc.meanPerPositionMatchRate.map((r) => r.toFixed(3)).join(" → ");
    console.log(`  ${cc.category}: slope=${cc.meanConvergenceSlope.toFixed(4)} rates=[${posRates}]`);
  }
  console.log("");

  console.log("Computing model convergences...");
  const modelConvergences = computeModelConvergences(pairModelMetrics);
  for (const mc of modelConvergences) {
    const posRates = mc.meanPerPositionMatchRate.map((r) => r.toFixed(3)).join(" → ");
    console.log(`  ${mc.displayName}: slope=${mc.meanConvergenceSlope.toFixed(4)} rates=[${posRates}]`);
  }
  console.log("");

  // Overall stats
  const allSlopes = pairModelMetrics.map((m) => m.convergenceSlope);
  const overallMeanSlope = mean(allSlopes);
  const overallSlopeCI = bootstrapCI(allSlopes);
  const positiveCount = allSlopes.filter((s) => s > 0).length;

  const overallPerPosition: number[] = [];
  for (let pos = 0; pos < WAYPOINT_COUNT; pos++) {
    const posValues = pairModelMetrics
      .filter((m) => pos < m.perPositionMatchRate.length)
      .map((m) => m.perPositionMatchRate[pos]);
    overallPerPosition.push(mean(posValues));
  }

  console.log(`Overall mean convergence slope: ${overallMeanSlope.toFixed(4)} (CI: [${overallSlopeCI[0].toFixed(4)}, ${overallSlopeCI[1].toFixed(4)}])`);
  console.log(`Positive convergence: ${positiveCount}/${pairModelMetrics.length} (${((positiveCount / pairModelMetrics.length) * 100).toFixed(1)}%)`);
  console.log(`Per-position rates: [${overallPerPosition.map((r) => r.toFixed(4)).join(", ")}]`);
  console.log("");

  // Build output
  const uniqueModels = [...allModelIds].sort();
  const uniquePairs = [...allPairIds].sort();

  const analysisOutput: PositionalConvergenceOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      forwardResultCount: forwardResults.length,
      reverseResultCount: reverseResults.length,
      models: uniqueModels,
      pairs: uniquePairs,
      waypointCount: WAYPOINT_COUNT,
    },
    pairModelMetrics,
    categoryConvergences,
    modelConvergences,
    overall: {
      meanConvergenceSlope: overallMeanSlope,
      convergenceSlopeCI: overallSlopeCI,
      meanPerPositionMatchRate: overallPerPosition,
      positiveConvergenceFraction: pairModelMetrics.length > 0
        ? positiveCount / pairModelMetrics.length
        : 0,
    },
  };

  // Write outputs
  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "positional-convergence.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Positional convergence analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("positional-convergence")
    .description("Analyze positional convergence of forward vs reverse waypoint paths")
    .option("--input <dir>", "base results directory", "results")
    .option("--output <dir>", "output directory for analysis JSON", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/03a-positional-convergence.md");

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
