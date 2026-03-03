/**
 * Phase 2: Reversal & Path Consistency Analysis Script
 *
 * Loads forward (A->B) and reverse (B->A) elicitation results, computes
 * asymmetry metrics for each pair/model combination, aggregates by
 * category and model, and produces both a JSON analysis output and a
 * comprehensive findings report.
 *
 * Usage:
 *   bun run analysis/02-reversals.ts
 *   bun run analysis/02-reversals.ts --input results --output results/analysis
 *   bun run analysis/02-reversals.ts --findings findings/02-reversals.md
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { computeJaccard } from "../canonicalize.ts";
import {
  computeAsymmetryMetrics,
  bootstrapCI,
  characteristicPath,
} from "../metrics.ts";
import { ALL_PAIRS, MODELS, getPairsByCategory } from "../pairs.ts";
import type {
  ElicitationResult,
  PairCategory,
  ConceptPair,
  AsymmetryMetrics,
  CategoryAsymmetry,
  ModelDirectionSensitivity,
  ReversalAnalysisOutput,
} from "../types.ts";

// ── Category Predictions ───────────────────────────────────────────

const CATEGORY_PREDICTIONS: Record<string, string> = {
  "antonym": "high symmetry",
  "hierarchy": "asymmetric",
  "near-synonym": "high symmetry",
  "cross-domain": "unknown",
  "polysemy": "asymmetric",
  "anchor": "asymmetric",
  "control-identity": "symmetric",
  "control-random": "symmetric",
  "control-nonsense": "symmetric",
};

// ── Data Loading ───────────────────────────────────────────────────

/**
 * Recursively read all JSON files from a directory.
 */
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
      // Skip batch-summary files
      if (name === "batch-summary.json") continue;
      paths.push(fullPath);
    }
  }

  return paths;
}

/**
 * Load all ElicitationResult objects from a directory tree.
 */
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
      // Skip malformed files silently
    }
  }

  return results;
}

/**
 * Load forward results from results/pilot/, filtered to waypointCount=5
 * and promptFormat="semantic" only.
 */
async function loadForwardResults(inputDir: string): Promise<ElicitationResult[]> {
  const pilotDir = join(inputDir, "pilot");
  const allResults = await loadResultsFromDir(pilotDir);

  return allResults.filter(
    (r) => r.waypointCount === 5 && r.promptFormat === "semantic",
  );
}

/**
 * Load reverse results from results/reversals/.
 * Separates reverse runs (pair IDs starting with "rev-") from
 * polysemy supplementary runs (non-"rev-" pair IDs).
 */
async function loadReversalResults(
  inputDir: string,
): Promise<{ reverse: ElicitationResult[]; polysemySupplementary: ElicitationResult[] }> {
  const reversalDir = join(inputDir, "reversals");
  const allResults = await loadResultsFromDir(reversalDir);

  const reverse: ElicitationResult[] = [];
  const polysemySupplementary: ElicitationResult[] = [];

  for (const r of allResults) {
    if (r.pair.id.startsWith("rev-")) {
      reverse.push(r);
    } else {
      polysemySupplementary.push(r);
    }
  }

  return { reverse, polysemySupplementary };
}

// ── Matching & Grouping ────────────────────────────────────────────

/**
 * Strip the "rev-" prefix from a reverse pair ID to get the original pair ID.
 */
function stripRevPrefix(reversePairId: string): string {
  return reversePairId.replace(/^rev-/, "");
}

/**
 * Group results by pair ID and model.
 */
function groupByPairAndModel(
  results: ElicitationResult[],
): Map<string, Map<string, ElicitationResult[]>> {
  const groups = new Map<string, Map<string, ElicitationResult[]>>();

  for (const r of results) {
    const pairId = r.pair.id;
    const modelId = r.modelShortId;

    if (!groups.has(pairId)) {
      groups.set(pairId, new Map());
    }
    const modelMap = groups.get(pairId)!;

    if (!modelMap.has(modelId)) {
      modelMap.set(modelId, []);
    }
    modelMap.get(modelId)!.push(r);
  }

  return groups;
}

// ── Helper: mean ───────────────────────────────────────────────────

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, v) => sum + v, 0) / arr.length;
}

// ── Category Aggregation ───────────────────────────────────────────

function computeCategoryAsymmetries(
  pairModelMetrics: AsymmetryMetrics[],
): CategoryAsymmetry[] {
  const categories: PairCategory[] = [
    "antonym",
    "hierarchy",
    "near-synonym",
    "cross-domain",
    "polysemy",
    "anchor",
    "control-identity",
    "control-random",
    "control-nonsense",
  ];

  const results: CategoryAsymmetry[] = [];

  for (const category of categories) {
    const categoryPairIds = new Set(
      getPairsByCategory(category).map((p) => p.id),
    );

    const categoryMetrics = pairModelMetrics.filter((m) =>
      categoryPairIds.has(m.pairId),
    );

    if (categoryMetrics.length === 0) continue;

    const asymmetryValues = categoryMetrics.map((m) => m.asymmetryIndex);
    const meanAsymmetry = mean(asymmetryValues);
    const ci = bootstrapCI(asymmetryValues);
    const pairCount = new Set(categoryMetrics.map((m) => m.pairId)).size;

    const prediction = CATEGORY_PREDICTIONS[category] ?? "unknown";

    let predictionMatch: boolean | null;
    if (prediction === "unknown") {
      predictionMatch = null;
    } else if (prediction === "high symmetry" || prediction === "symmetric") {
      predictionMatch = meanAsymmetry < 0.5;
    } else if (prediction === "asymmetric") {
      predictionMatch = meanAsymmetry > 0.5;
    } else {
      predictionMatch = null;
    }

    results.push({
      category,
      meanAsymmetryIndex: meanAsymmetry,
      asymmetryIndexCI: ci,
      pairCount,
      prediction,
      predictionMatch,
    });
  }

  return results;
}

// ── Model Sensitivity ──────────────────────────────────────────────

function computeModelSensitivities(
  pairModelMetrics: AsymmetryMetrics[],
): ModelDirectionSensitivity[] {
  const modelGroups = new Map<string, AsymmetryMetrics[]>();

  for (const m of pairModelMetrics) {
    if (!modelGroups.has(m.modelId)) {
      modelGroups.set(m.modelId, []);
    }
    modelGroups.get(m.modelId)!.push(m);
  }

  const results: ModelDirectionSensitivity[] = [];

  for (const [modelId, metrics] of modelGroups) {
    const model = MODELS.find((m) => m.id === modelId);
    const displayName = model?.displayName ?? modelId;

    const asymmetryValues = metrics.map((m) => m.asymmetryIndex);
    const meanAsymmetry = mean(asymmetryValues);
    const ci = bootstrapCI(asymmetryValues);

    // Rank pairs by asymmetry (most asymmetric first)
    const pairAsymmetries = metrics
      .map((m) => ({ pairId: m.pairId, asymmetryIndex: m.asymmetryIndex }))
      .sort((a, b) => b.asymmetryIndex - a.asymmetryIndex);

    results.push({
      modelId,
      displayName,
      meanAsymmetryIndex: meanAsymmetry,
      asymmetryIndexCI: ci,
      pairAsymmetries,
    });
  }

  return results;
}

// ── Polysemy Comparisons ───────────────────────────────────────────

function computePolysemyComparisons(
  forwardResults: ElicitationResult[],
  polysemySupplementary: ElicitationResult[],
): Array<{
  group: string;
  pairs: Array<{ pairId: string; from: string; to: string }>;
  crossPairJaccard: number | null;
  hasDataForBothSenses: boolean;
}> {
  const polysemyPairs = getPairsByCategory("polysemy");

  // Group by polysemy group
  const groups = new Map<string, ConceptPair[]>();
  for (const pair of polysemyPairs) {
    if (!pair.polysemyGroup) continue;
    const group = groups.get(pair.polysemyGroup) ?? [];
    group.push(pair);
    groups.set(pair.polysemyGroup, group);
  }

  // Combine forward + supplementary results for polysemy analysis
  const allPolysemyResults = [...forwardResults, ...polysemySupplementary];

  const comparisons: Array<{
    group: string;
    pairs: Array<{ pairId: string; from: string; to: string }>;
    crossPairJaccard: number | null;
    hasDataForBothSenses: boolean;
  }> = [];

  for (const [groupName, pairs] of groups) {
    if (pairs.length < 2) continue;

    // For each pair in the group, pool all successful waypoints
    const pairWaypoints = new Map<string, Set<string>>();
    for (const pair of pairs) {
      const pairResults = allPolysemyResults.filter(
        (r) => r.pair.id === pair.id && !r.failureMode,
      );
      const wpSet = new Set<string>();
      for (const r of pairResults) {
        for (const wp of r.canonicalizedWaypoints) wpSet.add(wp);
      }
      pairWaypoints.set(pair.id, wpSet);
    }

    // Check if both senses have data
    const hasDataForBothSenses = Array.from(pairWaypoints.values()).every(
      (s) => s.size > 0,
    );

    let crossPairJaccard: number | null = null;

    if (hasDataForBothSenses) {
      const pairIds = Array.from(pairWaypoints.keys());
      let totalJaccard = 0;
      let pairCount = 0;

      for (let i = 0; i < pairIds.length; i++) {
        for (let j = i + 1; j < pairIds.length; j++) {
          const setA = pairWaypoints.get(pairIds[i])!;
          const setB = pairWaypoints.get(pairIds[j])!;

          const jaccardResult = computeJaccard(
            Array.from(setA),
            Array.from(setB),
          );
          totalJaccard += jaccardResult.similarity;
          pairCount++;
        }
      }

      crossPairJaccard = pairCount > 0 ? totalJaccard / pairCount : null;
    }

    comparisons.push({
      group: groupName,
      pairs: pairs.map((p) => ({
        pairId: p.id,
        from: p.from,
        to: p.to,
      })),
      crossPairJaccard,
      hasDataForBothSenses,
    });
  }

  return comparisons;
}

// ── Findings Report Generation ─────────────────────────────────────

function generateFindings(analysis: ReversalAnalysisOutput): string {
  const {
    metadata,
    pairModelMetrics,
    categoryAsymmetries,
    modelSensitivities,
    polysemyComparisons,
  } = analysis;

  const lines: string[] = [];

  // ── Header
  lines.push("# Phase 2: Reversal & Path Consistency Findings");
  lines.push("");
  lines.push(`> Generated: ${metadata.timestamp}`);
  lines.push("");

  // ── 1. Experiment Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Forward results loaded (5wp/semantic):** ${metadata.forwardResultCount}`);
  lines.push(`- **Reverse results loaded:** ${metadata.reverseResultCount}`);
  lines.push(`- **Polysemy supplementary results:** ${metadata.polysemySupplementaryCount}`);
  lines.push(`- **Models:** ${metadata.models.join(", ")}`);
  lines.push(`- **Unique pairs analyzed:** ${metadata.pairs.length}`);
  lines.push(`- **Total pair/model combinations:** ${pairModelMetrics.length}`);
  lines.push("");

  // Data quality notes
  const failedForward = pairModelMetrics.filter((m) => m.forwardRunCount === 0).length;
  const failedReverse = pairModelMetrics.filter((m) => m.reverseRunCount === 0).length;
  if (failedForward > 0 || failedReverse > 0) {
    lines.push("**Data quality notes:**");
    if (failedForward > 0) {
      lines.push(`- ${failedForward} pair/model combinations had no forward data`);
    }
    if (failedReverse > 0) {
      lines.push(`- ${failedReverse} pair/model combinations had no reverse data`);
    }
    lines.push("");
  }

  // ── 2. Overall Symmetry Profile
  lines.push("## 2. Overall Symmetry Profile");
  lines.push("");

  if (pairModelMetrics.length > 0) {
    const allAsymmetries = pairModelMetrics.map((m) => m.asymmetryIndex);
    const overallMean = mean(allAsymmetries);
    const overallCI = bootstrapCI(allAsymmetries);

    lines.push(
      `**Overall mean asymmetry index:** ${overallMean.toFixed(3)} (95% CI: [${overallCI[0].toFixed(3)}, ${overallCI[1].toFixed(3)}])`,
    );
    lines.push("");

    // Interpretation
    if (overallMean < 0.3) {
      lines.push(
        "Navigation appears **generally symmetric** across pair/model combinations. " +
        "Most paths show high overlap between forward and reverse directions.",
      );
    } else if (overallMean < 0.5) {
      lines.push(
        "Navigation shows **moderate asymmetry**. Directional effects exist but " +
        "forward and reverse paths share substantial common structure.",
      );
    } else {
      lines.push(
        "Navigation is **substantially asymmetric**. Forward and reverse paths " +
        "diverge meaningfully, suggesting direction matters for conceptual navigation.",
      );
    }
    lines.push("");

    // Distribution summary
    const bins = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    const histogram = new Array(bins.length - 1).fill(0);
    for (const a of allAsymmetries) {
      for (let i = 0; i < bins.length - 1; i++) {
        if (a >= bins[i] && a < bins[i + 1]) {
          histogram[i]++;
          break;
        }
        // Handle a === 1.0 (last bin edge)
        if (a === 1.0) {
          histogram[histogram.length - 1]++;
          break;
        }
      }
    }

    lines.push("**Asymmetry index distribution:**");
    lines.push("");
    lines.push("| Range | Count |");
    lines.push("|-------|-------|");
    for (let i = 0; i < histogram.length; i++) {
      lines.push(
        `| ${bins[i].toFixed(1)}-${bins[i + 1].toFixed(1)} | ${histogram[i]} |`,
      );
    }
    lines.push("");
  } else {
    lines.push("No pair/model metrics available (insufficient data).");
    lines.push("");
  }

  // ── 3. Category-Level Asymmetry
  lines.push("## 3. Category-Level Asymmetry");
  lines.push("");

  if (categoryAsymmetries.length > 0) {
    lines.push(
      "| Category | Prediction | Mean Asymmetry | 95% CI | Pairs | Match? |",
    );
    lines.push(
      "|----------|------------|----------------|--------|-------|--------|",
    );
    for (const ca of categoryAsymmetries) {
      const matchStr =
        ca.predictionMatch === null
          ? "n/a"
          : ca.predictionMatch
            ? "YES"
            : "NO";
      lines.push(
        `| ${ca.category} | ${ca.prediction} | ${ca.meanAsymmetryIndex.toFixed(3)} | [${ca.asymmetryIndexCI[0].toFixed(3)}, ${ca.asymmetryIndexCI[1].toFixed(3)}] | ${ca.pairCount} | ${matchStr} |`,
      );
    }
    lines.push("");

    // Discussion per category
    for (const ca of categoryAsymmetries) {
      lines.push(`### ${ca.category}`);
      lines.push("");
      lines.push(`- **Prediction:** ${ca.prediction}`);
      lines.push(
        `- **Observed mean asymmetry:** ${ca.meanAsymmetryIndex.toFixed(3)} (CI: [${ca.asymmetryIndexCI[0].toFixed(3)}, ${ca.asymmetryIndexCI[1].toFixed(3)}])`,
      );
      if (ca.predictionMatch === null) {
        lines.push("- **Assessment:** No directional prediction for this category.");
      } else if (ca.predictionMatch) {
        lines.push("- **Assessment:** Observation matches prediction.");
      } else {
        lines.push("- **Assessment:** Observation does NOT match prediction.");
      }
      lines.push("");
    }
  } else {
    lines.push("No category asymmetry data available.");
    lines.push("");
  }

  // ── 4. Per-Model Direction Sensitivity
  lines.push("## 4. Per-Model Direction Sensitivity");
  lines.push("");

  if (modelSensitivities.length > 0) {
    lines.push(
      "| Model | Mean Asymmetry | 95% CI | Pair Count |",
    );
    lines.push(
      "|-------|----------------|--------|------------|",
    );
    for (const ms of modelSensitivities) {
      lines.push(
        `| ${ms.displayName} | ${ms.meanAsymmetryIndex.toFixed(3)} | [${ms.asymmetryIndexCI[0].toFixed(3)}, ${ms.asymmetryIndexCI[1].toFixed(3)}] | ${ms.pairAsymmetries.length} |`,
      );
    }
    lines.push("");

    // Sort by asymmetry to identify which models are most direction-sensitive
    const sorted = [...modelSensitivities].sort(
      (a, b) => b.meanAsymmetryIndex - a.meanAsymmetryIndex,
    );
    if (sorted.length >= 2) {
      lines.push(
        `**Most direction-sensitive model:** ${sorted[0].displayName} (mean asymmetry: ${sorted[0].meanAsymmetryIndex.toFixed(3)})`,
      );
      lines.push(
        `**Least direction-sensitive model:** ${sorted[sorted.length - 1].displayName} (mean asymmetry: ${sorted[sorted.length - 1].meanAsymmetryIndex.toFixed(3)})`,
      );
      lines.push("");
    }

    lines.push(
      "Do rigid navigators (high within-model Jaccard) show more or less asymmetry? " +
      "Compare these values with the per-model Jaccard profiles from Phase 1.",
    );
    lines.push("");
  } else {
    lines.push("No model sensitivity data available.");
    lines.push("");
  }

  // ── 5. Individual Pair Deep Dives
  lines.push("## 5. Individual Pair Deep Dives");
  lines.push("");

  if (pairModelMetrics.length > 0) {
    // Top 5 most asymmetric
    const sortedByAsymmetry = [...pairModelMetrics].sort(
      (a, b) => b.asymmetryIndex - a.asymmetryIndex,
    );

    lines.push("### Top 5 Most Asymmetric Pairs");
    lines.push("");
    for (const m of sortedByAsymmetry.slice(0, 5)) {
      lines.push(`#### ${m.pairId} (${m.modelId})`);
      lines.push("");
      lines.push(`- **Asymmetry index:** ${m.asymmetryIndex.toFixed(3)}`);
      lines.push(`- **Mean cross-direction Jaccard:** ${m.meanCrossDirectionJaccard.toFixed(3)}`);
      lines.push(`- **Permutation p-value:** ${m.permutationPValue.toFixed(3)}`);
      lines.push(`- **Edit distance:** ${m.normalizedEditDistance.toFixed(3)}`);
      if (m.reversalOrderRho !== null) {
        lines.push(`- **Reversal order rho:** ${m.reversalOrderRho.toFixed(3)}`);
      }
      lines.push(`- **Forward-exclusive waypoints:** ${m.forwardExclusiveWaypoints.length > 0 ? m.forwardExclusiveWaypoints.join(", ") : "(none)"}`);
      lines.push(`- **Reverse-exclusive waypoints:** ${m.reverseExclusiveWaypoints.length > 0 ? m.reverseExclusiveWaypoints.join(", ") : "(none)"}`);
      lines.push(`- **Forward runs:** ${m.forwardRunCount}, **Reverse runs:** ${m.reverseRunCount}`);
      lines.push("");
    }

    // Top 5 most symmetric
    const sortedBySymmetry = [...pairModelMetrics].sort(
      (a, b) => a.asymmetryIndex - b.asymmetryIndex,
    );

    lines.push("### Top 5 Most Symmetric Pairs");
    lines.push("");
    for (const m of sortedBySymmetry.slice(0, 5)) {
      lines.push(`#### ${m.pairId} (${m.modelId})`);
      lines.push("");
      lines.push(`- **Asymmetry index:** ${m.asymmetryIndex.toFixed(3)}`);
      lines.push(`- **Mean cross-direction Jaccard:** ${m.meanCrossDirectionJaccard.toFixed(3)}`);
      lines.push(`- **Permutation p-value:** ${m.permutationPValue.toFixed(3)}`);
      lines.push(`- **Edit distance:** ${m.normalizedEditDistance.toFixed(3)}`);
      if (m.reversalOrderRho !== null) {
        lines.push(`- **Reversal order rho:** ${m.reversalOrderRho.toFixed(3)}`);
      }
      lines.push(`- **Forward-exclusive waypoints:** ${m.forwardExclusiveWaypoints.length > 0 ? m.forwardExclusiveWaypoints.join(", ") : "(none)"}`);
      lines.push(`- **Reverse-exclusive waypoints:** ${m.reverseExclusiveWaypoints.length > 0 ? m.reverseExclusiveWaypoints.join(", ") : "(none)"}`);
      lines.push(`- **Forward runs:** ${m.forwardRunCount}, **Reverse runs:** ${m.reverseRunCount}`);
      lines.push("");
    }
  } else {
    lines.push("No pair-level data available for deep dives.");
    lines.push("");
  }

  // ── 6. Polysemy Sense Differentiation
  lines.push("## 6. Polysemy Sense Differentiation (Corrected)");
  lines.push("");

  if (polysemyComparisons.length > 0) {
    lines.push(
      "Updated analysis with supplementary data to properly test sense differentiation. " +
      "Cross-pair Jaccard measures overlap between waypoint sets for different " +
      "sense-steering targets of the same polysemous word (lower = more distinct paths).",
    );
    lines.push("");

    for (const pc of polysemyComparisons) {
      lines.push(`### Group: "${pc.group}"`);
      lines.push("");
      for (const p of pc.pairs) {
        lines.push(`- \`${p.pairId}\`: ${p.from} -> ${p.to}`);
      }
      lines.push("");
      lines.push(`- **Data for both senses:** ${pc.hasDataForBothSenses ? "Yes" : "No"}`);
      if (pc.crossPairJaccard !== null) {
        lines.push(
          `- **Cross-pair Jaccard:** ${pc.crossPairJaccard.toFixed(3)} (lower = more distinct paths = better sense differentiation)`,
        );
      } else {
        lines.push(
          `- **Cross-pair Jaccard:** n/a (incomplete data for one or more senses)`,
        );
      }
      lines.push("");
    }
  } else {
    lines.push("No polysemy comparison data available.");
    lines.push("");
  }

  // ── 7. Statistical Details
  lines.push("## 7. Statistical Details");
  lines.push("");

  if (pairModelMetrics.length > 0) {
    const significantCount = pairModelMetrics.filter(
      (m) => m.permutationPValue < 0.05,
    ).length;
    const totalCount = pairModelMetrics.length;
    const significantPct = ((significantCount / totalCount) * 100).toFixed(1);

    lines.push("### Permutation Test Results");
    lines.push("");
    lines.push(
      `- **Pairs with significant asymmetry (p < 0.05):** ${significantCount} / ${totalCount} (${significantPct}%)`,
    );
    lines.push("");

    // Summary by significance
    const significantMetrics = pairModelMetrics
      .filter((m) => m.permutationPValue < 0.05)
      .sort((a, b) => a.permutationPValue - b.permutationPValue);

    if (significantMetrics.length > 0) {
      lines.push("**Significant asymmetries (p < 0.05):**");
      lines.push("");
      lines.push("| Pair | Model | Asymmetry | p-value |");
      lines.push("|------|-------|-----------|---------|");
      for (const m of significantMetrics) {
        lines.push(
          `| ${m.pairId} | ${m.modelId} | ${m.asymmetryIndex.toFixed(3)} | ${m.permutationPValue.toFixed(3)} |`,
        );
      }
      lines.push("");
    }

    // Marginal cases
    const marginalMetrics = pairModelMetrics
      .filter((m) => m.permutationPValue >= 0.05 && m.permutationPValue < 0.10)
      .sort((a, b) => a.permutationPValue - b.permutationPValue);

    if (marginalMetrics.length > 0) {
      lines.push("**Marginally significant (0.05 <= p < 0.10):**");
      lines.push("");
      lines.push("| Pair | Model | Asymmetry | p-value |");
      lines.push("|------|-------|-----------|---------|");
      for (const m of marginalMetrics) {
        lines.push(
          `| ${m.pairId} | ${m.modelId} | ${m.asymmetryIndex.toFixed(3)} | ${m.permutationPValue.toFixed(3)} |`,
        );
      }
      lines.push("");
    }
  } else {
    lines.push("No statistical data available.");
    lines.push("");
  }

  // ── 8. Appendix: Per-Pair Metrics
  lines.push("## 8. Appendix: Per-Pair Metrics");
  lines.push("");

  if (pairModelMetrics.length > 0) {
    lines.push(
      "| Pair | Model | Asymmetry | Jaccard | p-value | Edit Dist | Rho | Fwd Runs | Rev Runs |",
    );
    lines.push(
      "|------|-------|-----------|---------|---------|-----------|-----|----------|----------|",
    );
    const sortedMetrics = [...pairModelMetrics].sort((a, b) => {
      if (a.pairId < b.pairId) return -1;
      if (a.pairId > b.pairId) return 1;
      return a.modelId.localeCompare(b.modelId);
    });
    for (const m of sortedMetrics) {
      const rhoStr = m.reversalOrderRho !== null ? m.reversalOrderRho.toFixed(3) : "n/a";
      lines.push(
        `| ${m.pairId} | ${m.modelId} | ${m.asymmetryIndex.toFixed(3)} | ${m.meanCrossDirectionJaccard.toFixed(3)} | ${m.permutationPValue.toFixed(3)} | ${m.normalizedEditDistance.toFixed(3)} | ${rhoStr} | ${m.forwardRunCount} | ${m.reverseRunCount} |`,
      );
    }
    lines.push("");
  } else {
    lines.push("No per-pair metrics data available.");
    lines.push("");
  }

  return lines.join("\n");
}

// ── Main Analysis Pipeline ─────────────────────────────────────────

async function analyze(opts: {
  input: string;
  output: string;
  findings: string;
}): Promise<void> {
  const inputDir = resolve(opts.input);
  const outputDir = resolve(opts.output);
  const findingsPath = resolve(opts.findings);

  console.log("Conceptual Topology Mapping Benchmark - Reversal Analysis");
  console.log("=========================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data
  console.log("Loading forward results (5wp/semantic only)...");
  const forwardResults = await loadForwardResults(inputDir);
  console.log(`  Loaded ${forwardResults.length} forward results`);

  console.log("Loading reversal results...");
  const { reverse: reverseResults, polysemySupplementary } =
    await loadReversalResults(inputDir);
  console.log(`  Loaded ${reverseResults.length} reverse results`);
  console.log(`  Loaded ${polysemySupplementary.length} polysemy supplementary results`);
  console.log("");

  if (forwardResults.length === 0 && reverseResults.length === 0) {
    console.log("No results found. Ensure results are in:");
    console.log(`  Forward: ${join(inputDir, "pilot")}/`);
    console.log(`  Reverse: ${join(inputDir, "reversals")}/`);
    console.log("");
    console.log("Run the experiments first:");
    console.log("  bun run pilot");
    console.log("  bun run experiments/02-reversals.ts");

    // Generate empty output
    await mkdir(outputDir, { recursive: true });
    const findingsParent = findingsPath.substring(
      0,
      findingsPath.lastIndexOf("/"),
    );
    if (findingsParent) await mkdir(findingsParent, { recursive: true });

    const emptyOutput: ReversalAnalysisOutput = {
      metadata: {
        timestamp: new Date().toISOString(),
        forwardResultCount: 0,
        reverseResultCount: 0,
        polysemySupplementaryCount: 0,
        models: [],
        pairs: [],
      },
      pairModelMetrics: [],
      categoryAsymmetries: [],
      modelSensitivities: [],
      polysemyComparisons: [],
    };

    await writeFile(
      join(outputDir, "reversal-metrics.json"),
      JSON.stringify(emptyOutput, null, 2),
    );
    await writeFile(findingsPath, generateFindings(emptyOutput));

    console.log(`Wrote empty analysis to ${join(outputDir, "reversal-metrics.json")}`);
    console.log(`Wrote placeholder findings to ${findingsPath}`);
    return;
  }

  // ── Group results
  console.log("Grouping results by pair and model...");

  const forwardByPairModel = groupByPairAndModel(forwardResults);

  // For reverse results, group by the *original* pair ID (strip rev- prefix)
  const reverseByPairModel = new Map<string, Map<string, ElicitationResult[]>>();
  for (const r of reverseResults) {
    const originalPairId = stripRevPrefix(r.pair.id);
    const modelId = r.modelShortId;

    if (!reverseByPairModel.has(originalPairId)) {
      reverseByPairModel.set(originalPairId, new Map());
    }
    const modelMap = reverseByPairModel.get(originalPairId)!;

    if (!modelMap.has(modelId)) {
      modelMap.set(modelId, []);
    }
    modelMap.get(modelId)!.push(r);
  }

  // Collect all pair IDs that appear in either direction
  const allPairIds = new Set<string>();
  for (const pairId of forwardByPairModel.keys()) {
    allPairIds.add(pairId);
  }
  for (const pairId of reverseByPairModel.keys()) {
    allPairIds.add(pairId);
  }

  // Collect all model IDs
  const allModelIds = new Set<string>();
  for (const r of forwardResults) allModelIds.add(r.modelShortId);
  for (const r of reverseResults) allModelIds.add(r.modelShortId);

  console.log(`  Forward pairs: ${forwardByPairModel.size}`);
  console.log(`  Reverse pairs: ${reverseByPairModel.size}`);
  console.log(`  Combined unique pairs: ${allPairIds.size}`);
  console.log(`  Models: ${[...allModelIds].sort().join(", ")}`);
  console.log("");

  // ── Compute per-pair/model asymmetry metrics
  console.log("Computing asymmetry metrics...");
  const pairModelMetrics: AsymmetryMetrics[] = [];
  let processedCount = 0;

  for (const pairId of allPairIds) {
    for (const modelId of allModelIds) {
      const forwardGroup = forwardByPairModel.get(pairId)?.get(modelId) ?? [];
      const reverseGroup = reverseByPairModel.get(pairId)?.get(modelId) ?? [];

      // Get successful forward runs
      const forwardRuns = forwardGroup
        .filter((r) => !r.failureMode)
        .map((r) => r.canonicalizedWaypoints);

      // Get successful reverse runs
      const reverseRuns = reverseGroup
        .filter((r) => !r.failureMode)
        .map((r) => r.canonicalizedWaypoints);

      // Need at least 1 run in each direction for meaningful comparison
      if (forwardRuns.length === 0 || reverseRuns.length === 0) continue;

      const metrics = computeAsymmetryMetrics(
        pairId,
        modelId,
        forwardRuns,
        reverseRuns,
      );
      pairModelMetrics.push(metrics);

      processedCount++;
      if (processedCount % 10 === 0) {
        process.stdout.write(`\r  Processed ${processedCount} pair/model combinations...`);
      }
    }
  }
  console.log(
    `\r  Computed metrics for ${pairModelMetrics.length} pair/model combinations.          `,
  );
  console.log("");

  // ── Category aggregation
  console.log("Computing category asymmetries...");
  const categoryAsymmetries = computeCategoryAsymmetries(pairModelMetrics);
  for (const ca of categoryAsymmetries) {
    const matchStr =
      ca.predictionMatch === null
        ? "n/a"
        : ca.predictionMatch
          ? "YES"
          : "NO";
    console.log(
      `  ${ca.category}: mean=${ca.meanAsymmetryIndex.toFixed(3)} ` +
      `CI=[${ca.asymmetryIndexCI[0].toFixed(3)}, ${ca.asymmetryIndexCI[1].toFixed(3)}] ` +
      `prediction="${ca.prediction}" match=${matchStr}`,
    );
  }
  console.log("");

  // ── Model sensitivity
  console.log("Computing model direction sensitivities...");
  const modelSensitivities = computeModelSensitivities(pairModelMetrics);
  for (const ms of modelSensitivities) {
    console.log(
      `  ${ms.displayName}: mean asymmetry=${ms.meanAsymmetryIndex.toFixed(3)} ` +
      `CI=[${ms.asymmetryIndexCI[0].toFixed(3)}, ${ms.asymmetryIndexCI[1].toFixed(3)}]`,
    );
  }
  console.log("");

  // ── Polysemy comparisons
  console.log("Computing polysemy comparisons...");
  const polysemyComps = computePolysemyComparisons(
    forwardResults,
    polysemySupplementary,
  );
  for (const pc of polysemyComps) {
    const jaccardStr =
      pc.crossPairJaccard !== null
        ? pc.crossPairJaccard.toFixed(3)
        : "n/a (incomplete data)";
    console.log(
      `  Group "${pc.group}": cross-pair Jaccard=${jaccardStr}, ` +
      `both senses=${pc.hasDataForBothSenses}`,
    );
  }
  console.log("");

  // ── Summary statistics
  if (pairModelMetrics.length > 0) {
    const significantCount = pairModelMetrics.filter(
      (m) => m.permutationPValue < 0.05,
    ).length;
    console.log(
      `Permutation tests: ${significantCount}/${pairModelMetrics.length} ` +
      `pairs show significant asymmetry (p < 0.05)`,
    );
    console.log("");
  }

  // ── Build output
  const uniqueModels = [...allModelIds].sort();
  const uniquePairs = [...allPairIds].sort();

  const analysisOutput: ReversalAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      forwardResultCount: forwardResults.length,
      reverseResultCount: reverseResults.length,
      polysemySupplementaryCount: polysemySupplementary.length,
      models: uniqueModels,
      pairs: uniquePairs,
    },
    pairModelMetrics,
    categoryAsymmetries,
    modelSensitivities,
    polysemyComparisons: polysemyComps,
  };

  // ── Write outputs
  console.log("Writing outputs...");

  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "reversal-metrics.json");
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
  console.log("Analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("reversal-analysis")
    .description(
      "Analyze reversal experiment results for the Conceptual Topology Mapping Benchmark",
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
      "findings/02-reversals.md",
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
