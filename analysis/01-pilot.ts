/**
 * Pilot Experiment Analysis Script
 *
 * Reads pilot results from results/pilot/, computes all spec'd metrics,
 * and produces both a JSON analysis output and a human-readable findings
 * summary.
 *
 * Usage:
 *   bun run analysis/01-pilot.ts
 *   bun run analysis/01-pilot.ts --input results --output results/analysis
 *   bun run analysis/01-pilot.ts --skip-embeddings
 *   bun run analysis/01-pilot.ts --findings findings/01-pilot.md
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  computeJaccard,
  computePositionalOverlap,
  computeDistributionalEntropy,
  averageSemanticSimilarity,
} from "../canonicalize.ts";
import { REPORTING_PAIRS, MODELS, getPairsByCategory } from "../pairs.ts";
import type {
  ElicitationResult,
  PairCategory,
  ConceptPair,
} from "../types.ts";

// ── Types for Analysis Output ──────────────────────────────────────

interface ConditionKey {
  model: string;
  pairId: string;
  waypointCount: number;
  promptFormat: string;
}

interface ConditionMetrics {
  key: ConditionKey;
  runCount: number;
  avgJaccard: number;
  avgPositionalOverlap: number;
  distributionalEntropy: number;
  semanticSimilarity?: number;
  extractionAccuracy: number;
  avgExtractedCount: number;
  requestedCount: number;
  characteristicWaypoints: Array<{ waypoint: string; frequency: number }>;
}

interface ModelProfile {
  modelId: string;
  displayName: string;
  avgJaccard: number;
  avgPositionalOverlap: number;
  avgEntropy: number;
  avgSemanticSimilarity?: number;
  conditionCount: number;
  totalRuns: number;
  mostStablePairs: Array<{ pairId: string; jaccard: number }>;
  leastStablePairs: Array<{ pairId: string; jaccard: number }>;
}

interface CrossModelComparison {
  modelA: string;
  modelB: string;
  pairId: string;
  jaccard: number;
}

interface WaypointCountEffect {
  model: string;
  pairId: string;
  fiveWaypointSet: string[];
  tenWaypointSet: string[];
  sharedFraction: number;
  isSubsequence: boolean;
}

interface CategoryAnalysis {
  category: PairCategory;
  avgJaccard: number;
  avgPositionalOverlap: number;
  avgEntropy: number;
  pairCount: number;
  conditionCount: number;
}

interface PolysemyComparison {
  group: string;
  pairs: Array<{ pairId: string; from: string; to: string }>;
  waypointSets: Map<string, string[]>;
  crossPairJaccard: number;
}

interface AnalysisOutput {
  metadata: {
    timestamp: string;
    inputDir: string;
    totalResults: number;
    uniqueModels: string[];
    uniquePairs: string[];
    waypointCounts: number[];
    promptFormats: string[];
    skippedEmbeddings: boolean;
  };
  conditionMetrics: ConditionMetrics[];
  modelProfiles: ModelProfile[];
  crossModelComparisons: CrossModelComparison[];
  waypointCountEffects: WaypointCountEffect[];
  categoryAnalyses: CategoryAnalysis[];
  polysemyComparisons: Array<{
    group: string;
    pairs: Array<{ pairId: string; from: string; to: string }>;
    crossPairJaccard: number | null;
  }>;
}

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

  const { stat } = await import("node:fs/promises");

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
 * Load all ElicitationResult objects from the pilot results directory.
 */
async function loadResults(inputDir: string): Promise<ElicitationResult[]> {
  const pilotDir = join(inputDir, "pilot");
  const jsonPaths = await readJsonFilesRecursive(pilotDir);

  const results: ElicitationResult[] = [];
  for (const path of jsonPaths) {
    try {
      const content = await readFile(path, "utf-8");
      const parsed = JSON.parse(content) as ElicitationResult;
      // Basic validation: must have model, pair, and waypoints fields
      if (parsed.model && parsed.pair && Array.isArray(parsed.canonicalizedWaypoints)) {
        results.push(parsed);
      }
    } catch {
      // Skip malformed files silently
    }
  }

  return results;
}

// ── Grouping Utilities ─────────────────────────────────────────────

function conditionKeyStr(key: ConditionKey): string {
  return `${key.model}|${key.pairId}|${key.waypointCount}|${key.promptFormat}`;
}

function groupByCondition(
  results: ElicitationResult[],
): Map<string, ElicitationResult[]> {
  const groups = new Map<string, ElicitationResult[]>();

  for (const r of results) {
    const key = conditionKeyStr({
      model: r.modelShortId,
      pairId: r.pair.id,
      waypointCount: r.waypointCount,
      promptFormat: r.promptFormat,
    });
    const group = groups.get(key) ?? [];
    group.push(r);
    groups.set(key, group);
  }

  return groups;
}

function groupByModel(
  results: ElicitationResult[],
): Map<string, ElicitationResult[]> {
  const groups = new Map<string, ElicitationResult[]>();
  for (const r of results) {
    const group = groups.get(r.modelShortId) ?? [];
    group.push(r);
    groups.set(r.modelShortId, group);
  }
  return groups;
}

function groupByPair(
  results: ElicitationResult[],
): Map<string, ElicitationResult[]> {
  const groups = new Map<string, ElicitationResult[]>();
  for (const r of results) {
    const group = groups.get(r.pair.id) ?? [];
    group.push(r);
    groups.set(r.pair.id, group);
  }
  return groups;
}

// ── Pairwise Metric Averaging ──────────────────────────────────────

/**
 * Compute average pairwise Jaccard across all C(n,2) pairs of runs.
 */
function averagePairwiseJaccard(runs: string[][]): number {
  if (runs.length < 2) return 0;

  let total = 0;
  let count = 0;

  for (let i = 0; i < runs.length; i++) {
    for (let j = i + 1; j < runs.length; j++) {
      const result = computeJaccard(runs[i], runs[j]);
      total += result.similarity;
      count++;
    }
  }

  return count > 0 ? total / count : 0;
}

/**
 * Compute average pairwise positional overlap across all C(n,2) pairs.
 */
function averagePairwisePositionalOverlap(runs: string[][]): number {
  if (runs.length < 2) return 0;

  let total = 0;
  let count = 0;

  for (let i = 0; i < runs.length; i++) {
    for (let j = i + 1; j < runs.length; j++) {
      const result = computePositionalOverlap(runs[i], runs[j]);
      total += result.exactPositionMatch;
      count++;
    }
  }

  return count > 0 ? total / count : 0;
}

/**
 * Compute average pairwise semantic similarity across all C(n,2) pairs.
 * Returns undefined if any embedding call fails.
 */
async function averagePairwiseSemanticSimilarity(
  runs: string[][],
): Promise<number | undefined> {
  if (runs.length < 2) return undefined;

  let total = 0;
  let count = 0;

  for (let i = 0; i < runs.length; i++) {
    for (let j = i + 1; j < runs.length; j++) {
      try {
        const sim = await averageSemanticSimilarity(runs[i], runs[j]);
        total += sim;
        count++;
      } catch {
        return undefined;
      }
    }
  }

  return count > 0 ? total / count : undefined;
}

// ── Characteristic Waypoints ───────────────────────────────────────

/**
 * Find the most commonly occurring waypoints across runs for a condition.
 */
function computeCharacteristicWaypoints(
  runs: string[][],
): Array<{ waypoint: string; frequency: number }> {
  const freqMap = new Map<string, number>();

  for (const run of runs) {
    // Count each unique waypoint per run (so a waypoint appearing twice
    // in a single run still only counts as 1 for that run)
    const unique = new Set(run);
    for (const wp of unique) {
      freqMap.set(wp, (freqMap.get(wp) ?? 0) + 1);
    }
  }

  const totalRuns = runs.length;
  const entries = Array.from(freqMap.entries())
    .map(([waypoint, count]) => ({
      waypoint,
      frequency: count / totalRuns,
    }))
    .sort((a, b) => b.frequency - a.frequency);

  return entries;
}

// ── Per-Condition Metrics ──────────────────────────────────────────

async function computeConditionMetrics(
  key: ConditionKey,
  results: ElicitationResult[],
  skipEmbeddings: boolean,
  strictExtraction = false,
): Promise<ConditionMetrics> {
  const runs = results
    .filter((r) => !r.failureMode)
    .filter((r) => !strictExtraction || !r.extractionCountMismatch)
    .map((r) => r.canonicalizedWaypoints);

  const avgJaccard = averagePairwiseJaccard(runs);
  const avgPositionalOverlap = averagePairwisePositionalOverlap(runs);
  const distributionalEntropy =
    runs.length > 0 ? computeDistributionalEntropy(runs) : 0;

  let semanticSimilarity: number | undefined;
  if (!skipEmbeddings && runs.length >= 2) {
    semanticSimilarity = await averagePairwiseSemanticSimilarity(runs);
  }

  // Extraction quality
  const successfulResults = results.filter((r) => !r.failureMode);
  const matchingCount = successfulResults.filter(
    (r) => r.canonicalizedWaypoints.length === r.waypointCount,
  ).length;
  const extractionAccuracy =
    successfulResults.length > 0
      ? matchingCount / successfulResults.length
      : 0;
  const avgExtractedCount =
    successfulResults.length > 0
      ? successfulResults.reduce(
          (sum, r) => sum + r.canonicalizedWaypoints.length,
          0,
        ) / successfulResults.length
      : 0;

  const characteristicWaypoints = computeCharacteristicWaypoints(runs);

  return {
    key,
    runCount: results.length,
    avgJaccard,
    avgPositionalOverlap,
    distributionalEntropy,
    semanticSimilarity,
    extractionAccuracy,
    avgExtractedCount,
    requestedCount: key.waypointCount,
    characteristicWaypoints,
  };
}

// ── Model Profiles ─────────────────────────────────────────────────

function computeModelProfile(
  modelId: string,
  conditions: ConditionMetrics[],
  modelResults: ElicitationResult[],
): ModelProfile {
  const model = MODELS.find((m) => m.id === modelId);
  const displayName = model?.displayName ?? modelId;

  if (conditions.length === 0) {
    return {
      modelId,
      displayName,
      avgJaccard: 0,
      avgPositionalOverlap: 0,
      avgEntropy: 0,
      conditionCount: 0,
      totalRuns: modelResults.length,
      mostStablePairs: [],
      leastStablePairs: [],
    };
  }

  const avgJaccard =
    conditions.reduce((sum, c) => sum + c.avgJaccard, 0) / conditions.length;
  const avgPositionalOverlap =
    conditions.reduce((sum, c) => sum + c.avgPositionalOverlap, 0) /
    conditions.length;
  const avgEntropy =
    conditions.reduce((sum, c) => sum + c.distributionalEntropy, 0) /
    conditions.length;

  const semSimValues = conditions
    .filter((c) => c.semanticSimilarity !== undefined)
    .map((c) => c.semanticSimilarity!);
  const avgSemanticSimilarity =
    semSimValues.length > 0
      ? semSimValues.reduce((sum, v) => sum + v, 0) / semSimValues.length
      : undefined;

  // Per-pair stability (aggregate across waypoint counts and prompt formats)
  const pairJaccards = new Map<string, number[]>();
  for (const c of conditions) {
    const existing = pairJaccards.get(c.key.pairId) ?? [];
    existing.push(c.avgJaccard);
    pairJaccards.set(c.key.pairId, existing);
  }

  const pairAvgJaccards = Array.from(pairJaccards.entries()).map(
    ([pairId, jaccards]) => ({
      pairId,
      jaccard:
        jaccards.reduce((sum, j) => sum + j, 0) / jaccards.length,
    }),
  );

  pairAvgJaccards.sort((a, b) => b.jaccard - a.jaccard);

  const mostStablePairs = pairAvgJaccards.slice(0, 5);
  const leastStablePairs = pairAvgJaccards
    .slice(-5)
    .reverse();

  return {
    modelId,
    displayName,
    avgJaccard,
    avgPositionalOverlap,
    avgEntropy,
    avgSemanticSimilarity,
    conditionCount: conditions.length,
    totalRuns: modelResults.length,
    mostStablePairs,
    leastStablePairs,
  };
}

// ── Cross-Model Comparison ─────────────────────────────────────────

function computeCrossModelComparisons(
  results: ElicitationResult[],
): CrossModelComparison[] {
  const comparisons: CrossModelComparison[] = [];

  const byPair = groupByPair(results);
  const modelIds = [...new Set(results.map((r) => r.modelShortId))].sort();

  for (const [pairId, pairResults] of byPair) {
    const modelWaypoints = new Map<string, Set<string>>();

    for (const r of pairResults) {
      if (r.failureMode) continue;
      const existing = modelWaypoints.get(r.modelShortId) ?? new Set<string>();
      for (const wp of r.canonicalizedWaypoints) {
        existing.add(wp);
      }
      modelWaypoints.set(r.modelShortId, existing);
    }

    for (let i = 0; i < modelIds.length; i++) {
      for (let j = i + 1; j < modelIds.length; j++) {
        const setA = modelWaypoints.get(modelIds[i]);
        const setB = modelWaypoints.get(modelIds[j]);

        if (setA && setB && setA.size > 0 && setB.size > 0) {
          const jaccardResult = computeJaccard(
            Array.from(setA),
            Array.from(setB),
          );
          comparisons.push({
            modelA: modelIds[i],
            modelB: modelIds[j],
            pairId,
            jaccard: jaccardResult.similarity,
          });
        }
      }
    }
  }

  return comparisons;
}

// ── Waypoint Count Effect ──────────────────────────────────────────

/**
 * Check if `sub` appears as a subsequence of `sup` (order preserved,
 * not necessarily contiguous).
 */
function isSubsequence(sub: string[], sup: string[]): boolean {
  let si = 0;
  for (let i = 0; i < sup.length && si < sub.length; i++) {
    if (sup[i] === sub[si]) {
      si++;
    }
  }
  return si === sub.length;
}

function computeWaypointCountEffects(
  results: ElicitationResult[],
): WaypointCountEffect[] {
  const effects: WaypointCountEffect[] = [];

  const modelIds = [...new Set(results.map((r) => r.modelShortId))];
  const pairIds = [...new Set(results.map((r) => r.pair.id))];

  for (const modelId of modelIds) {
    for (const pairId of pairIds) {
      const modelPairResults = results.filter(
        (r) =>
          r.modelShortId === modelId &&
          r.pair.id === pairId &&
          !r.failureMode,
      );

      const fiveResults = modelPairResults.filter(
        (r) => r.waypointCount === 5,
      );
      const tenResults = modelPairResults.filter(
        (r) => r.waypointCount === 10,
      );

      if (fiveResults.length === 0 || tenResults.length === 0) continue;

      // Pool unique waypoints per count
      const fiveSet = new Set<string>();
      for (const r of fiveResults) {
        for (const wp of r.canonicalizedWaypoints) fiveSet.add(wp);
      }
      const tenSet = new Set<string>();
      for (const r of tenResults) {
        for (const wp of r.canonicalizedWaypoints) tenSet.add(wp);
      }

      const fiveArr = Array.from(fiveSet);
      const tenArr = Array.from(tenSet);

      // Shared fraction: how many 5-waypoint concepts appear in 10-waypoint set
      const sharedCount = fiveArr.filter((wp) => tenSet.has(wp)).length;
      const sharedFraction =
        fiveArr.length > 0 ? sharedCount / fiveArr.length : 0;

      // Check if ANY 5-waypoint run path appears as a subsequence
      // in ANY 10-waypoint run path (existence test, not canonical)
      const fivePaths = fiveResults.map((r) => r.canonicalizedWaypoints);
      const tenPaths = tenResults.map((r) => r.canonicalizedWaypoints);

      let subseqFound = false;
      for (const fivePath of fivePaths) {
        for (const tenPath of tenPaths) {
          if (isSubsequence(fivePath, tenPath)) {
            subseqFound = true;
            break;
          }
        }
        if (subseqFound) break;
      }

      effects.push({
        model: modelId,
        pairId,
        fiveWaypointSet: fiveArr,
        tenWaypointSet: tenArr,
        sharedFraction,
        isSubsequence: subseqFound,
      });
    }
  }

  return effects;
}

// ── Category Analysis ──────────────────────────────────────────────

function computeCategoryAnalyses(
  conditionMetrics: ConditionMetrics[],
  results: ElicitationResult[],
): CategoryAnalysis[] {
  const categories: PairCategory[] = [
    "anchor",
    "hierarchy",
    "cross-domain",
    "polysemy",
    "near-synonym",
    "antonym",
    "control-identity",
    "control-random",
    "control-nonsense",
  ];

  const analyses: CategoryAnalysis[] = [];

  for (const category of categories) {
    const categoryPairIds = new Set(
      getPairsByCategory(category).map((p) => p.id),
    );

    const categoryConditions = conditionMetrics.filter((c) =>
      categoryPairIds.has(c.key.pairId),
    );

    if (categoryConditions.length === 0) continue;

    const avgJaccard =
      categoryConditions.reduce((sum, c) => sum + c.avgJaccard, 0) /
      categoryConditions.length;
    const avgPositionalOverlap =
      categoryConditions.reduce((sum, c) => sum + c.avgPositionalOverlap, 0) /
      categoryConditions.length;
    const avgEntropy =
      categoryConditions.reduce((sum, c) => sum + c.distributionalEntropy, 0) /
      categoryConditions.length;

    const pairCount = new Set(
      categoryConditions.map((c) => c.key.pairId),
    ).size;

    analyses.push({
      category,
      avgJaccard,
      avgPositionalOverlap,
      avgEntropy,
      pairCount,
      conditionCount: categoryConditions.length,
    });
  }

  return analyses;
}

// ── Polysemy Analysis ──────────────────────────────────────────────

function computePolysemyComparisons(
  results: ElicitationResult[],
): Array<{
  group: string;
  pairs: Array<{ pairId: string; from: string; to: string }>;
  crossPairJaccard: number | null;
}> {
  // Find all polysemy pairs from the pair definitions
  const polysemyPairs = [
    ...getPairsByCategory("polysemy"),
  ];

  // Group by polysemy group
  const groups = new Map<string, ConceptPair[]>();
  for (const pair of polysemyPairs) {
    if (!pair.polysemyGroup) continue;
    const group = groups.get(pair.polysemyGroup) ?? [];
    group.push(pair);
    groups.set(pair.polysemyGroup, group);
  }

  const comparisons: Array<{
    group: string;
    pairs: Array<{ pairId: string; from: string; to: string }>;
    crossPairJaccard: number | null;
  }> = [];

  for (const [groupName, pairs] of groups) {
    if (pairs.length < 2) continue;

    // For each pair in the group, pool all successful waypoints
    const pairWaypoints = new Map<string, Set<string>>();
    for (const pair of pairs) {
      const pairResults = results.filter(
        (r) => r.pair.id === pair.id && !r.failureMode,
      );
      const wpSet = new Set<string>();
      for (const r of pairResults) {
        for (const wp of r.canonicalizedWaypoints) wpSet.add(wp);
      }
      pairWaypoints.set(pair.id, wpSet);
    }

    // Check if any side has an empty waypoint set
    const hasEmptySet = Array.from(pairWaypoints.values()).some((s) => s.size === 0);

    // Compute average pairwise Jaccard across the polysemy group
    const pairIds = Array.from(pairWaypoints.keys());
    let totalJaccard = 0;
    let pairCount = 0;

    if (!hasEmptySet) {
      for (let i = 0; i < pairIds.length; i++) {
        for (let j = i + 1; j < pairIds.length; j++) {
          const setA = pairWaypoints.get(pairIds[i])!;
          const setB = pairWaypoints.get(pairIds[j])!;

          if (setA.size > 0 && setB.size > 0) {
            const jaccardResult = computeJaccard(
              Array.from(setA),
              Array.from(setB),
            );
            totalJaccard += jaccardResult.similarity;
            pairCount++;
          }
        }
      }
    }

    const crossPairJaccard = hasEmptySet ? null : (pairCount > 0 ? totalJaccard / pairCount : null);

    comparisons.push({
      group: groupName,
      pairs: pairs.map((p) => ({
        pairId: p.id,
        from: p.from,
        to: p.to,
      })),
      crossPairJaccard,
    });
  }

  return comparisons;
}

// ── Findings Report Generation ─────────────────────────────────────

function generateFindings(analysis: AnalysisOutput): string {
  const {
    metadata,
    conditionMetrics,
    modelProfiles,
    crossModelComparisons,
    waypointCountEffects,
    categoryAnalyses,
    polysemyComparisons,
  } = analysis;

  const lines: string[] = [];

  // Header
  lines.push("# Pilot Experiment Findings");
  lines.push("");
  lines.push(`> Generated: ${metadata.timestamp}`);
  lines.push("");

  // ── Experiment Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Total result files loaded:** ${metadata.totalResults}`);
  lines.push(`- **Models tested:** ${metadata.uniqueModels.join(", ")}`);
  lines.push(`- **Unique concept pairs:** ${metadata.uniquePairs.length}`);
  lines.push(`- **Waypoint counts:** ${metadata.waypointCounts.join(", ")}`);
  lines.push(`- **Prompt formats:** ${metadata.promptFormats.join(", ")}`);
  lines.push(
    `- **Embeddings:** ${metadata.skippedEmbeddings ? "skipped" : "computed"}`,
  );
  lines.push("");

  // ── Prompt Format Selection
  lines.push("## 2. Prompt Format Selection Rationale");
  lines.push("");

  const formatGroups = new Map<string, ConditionMetrics[]>();
  for (const c of conditionMetrics) {
    const key = c.key.promptFormat;
    const group = formatGroups.get(key) ?? [];
    group.push(c);
    formatGroups.set(key, group);
  }

  if (formatGroups.size > 1) {
    lines.push(
      "Consistency metrics by prompt format (averaged across all conditions):",
    );
    lines.push("");
    lines.push(
      "| Format | Avg Jaccard | Avg Positional | Avg Entropy | Conditions |",
    );
    lines.push("|--------|-------------|----------------|-------------|------------|");
    for (const [format, conditions] of formatGroups) {
      const avgJ =
        conditions.reduce((s, c) => s + c.avgJaccard, 0) / conditions.length;
      const avgP =
        conditions.reduce((s, c) => s + c.avgPositionalOverlap, 0) /
        conditions.length;
      const avgE =
        conditions.reduce((s, c) => s + c.distributionalEntropy, 0) /
        conditions.length;
      lines.push(
        `| ${format} | ${avgJ.toFixed(3)} | ${avgP.toFixed(3)} | ${avgE.toFixed(3)} | ${conditions.length} |`,
      );
    }
    lines.push("");
    lines.push(
      "The format with higher Jaccard and lower entropy indicates more consistent model responses.",
    );
  } else if (formatGroups.size === 1) {
    const format = Array.from(formatGroups.keys())[0];
    lines.push(
      `Only one prompt format was used in the pilot: **${format}**. ` +
        "See prompt-selection experiment results for format comparison rationale.",
    );
  } else {
    lines.push("No prompt format data available.");
  }
  lines.push("");

  // ── Per-Model Consistency Profiles
  lines.push("## 3. Per-Model Consistency Profiles");
  lines.push("");

  if (modelProfiles.length > 0) {
    lines.push(
      "| Model | Avg Jaccard | Avg Positional | Avg Entropy | Semantic Sim | Runs |",
    );
    lines.push(
      "|-------|-------------|----------------|-------------|--------------|------|",
    );
    for (const profile of modelProfiles) {
      const semSim =
        profile.avgSemanticSimilarity !== undefined
          ? profile.avgSemanticSimilarity.toFixed(3)
          : "n/a";
      lines.push(
        `| ${profile.displayName} | ${profile.avgJaccard.toFixed(3)} | ${profile.avgPositionalOverlap.toFixed(3)} | ${profile.avgEntropy.toFixed(3)} | ${semSim} | ${profile.totalRuns} |`,
      );
    }
    lines.push("");

    for (const profile of modelProfiles) {
      lines.push(`### ${profile.displayName}`);
      lines.push("");

      if (profile.mostStablePairs.length > 0) {
        lines.push("**Most stable pairs:**");
        for (const p of profile.mostStablePairs) {
          lines.push(`- \`${p.pairId}\` (Jaccard: ${p.jaccard.toFixed(3)})`);
        }
        lines.push("");
      }

      if (profile.leastStablePairs.length > 0) {
        lines.push("**Least stable pairs:**");
        for (const p of profile.leastStablePairs) {
          lines.push(`- \`${p.pairId}\` (Jaccard: ${p.jaccard.toFixed(3)})`);
        }
        lines.push("");
      }
    }
  } else {
    lines.push("No model profiles computed (insufficient data).");
    lines.push("");
  }

  // ── Control Results
  lines.push("## 4. Control Results");
  lines.push("");

  const controlCategories: PairCategory[] = [
    "control-identity",
    "control-random",
    "control-nonsense",
  ];
  const controlAnalyses = categoryAnalyses.filter((a) =>
    controlCategories.includes(a.category),
  );

  if (controlAnalyses.length > 0) {
    lines.push(
      "| Control Type | Avg Jaccard | Avg Positional | Avg Entropy | Pairs |",
    );
    lines.push(
      "|--------------|-------------|----------------|-------------|-------|",
    );
    for (const ca of controlAnalyses) {
      lines.push(
        `| ${ca.category} | ${ca.avgJaccard.toFixed(3)} | ${ca.avgPositionalOverlap.toFixed(3)} | ${ca.avgEntropy.toFixed(3)} | ${ca.pairCount} |`,
      );
    }
    lines.push("");
    lines.push("**Expected behavior:**");
    lines.push(
      "- **Identity pairs:** Should produce trivial/degenerate paths (high consistency but possibly low waypoint diversity).",
    );
    lines.push(
      "- **Random pairs:** Should produce noisy, inconsistent paths (low Jaccard, high entropy).",
    );
    lines.push(
      "- **Nonsense pairs:** Should show hallucinated structure or refusals.",
    );
  } else {
    lines.push(
      "No control pair results available. Run the pilot experiment to populate control data.",
    );
  }
  lines.push("");

  // ── Cross-Model Comparison
  lines.push("## 5. Cross-Model Comparison");
  lines.push("");

  if (crossModelComparisons.length > 0) {
    // Build a model-pair similarity matrix
    const modelPairSim = new Map<string, number[]>();
    for (const cmc of crossModelComparisons) {
      const key = `${cmc.modelA} vs ${cmc.modelB}`;
      const existing = modelPairSim.get(key) ?? [];
      existing.push(cmc.jaccard);
      modelPairSim.set(key, existing);
    }

    lines.push("Average cross-model Jaccard similarity (across all pairs):");
    lines.push("");
    lines.push("| Model Pair | Avg Jaccard | Pair Count |");
    lines.push("|------------|-------------|------------|");
    for (const [key, jaccards] of modelPairSim) {
      const avg = jaccards.reduce((s, j) => s + j, 0) / jaccards.length;
      lines.push(`| ${key} | ${avg.toFixed(3)} | ${jaccards.length} |`);
    }
    lines.push("");

    // Find most and least similar model pairs
    const modelPairAvgs = Array.from(modelPairSim.entries()).map(
      ([key, jaccards]) => ({
        key,
        avg: jaccards.reduce((s, j) => s + j, 0) / jaccards.length,
      }),
    );
    modelPairAvgs.sort((a, b) => b.avg - a.avg);

    if (modelPairAvgs.length > 0) {
      lines.push(
        `**Most similar models:** ${modelPairAvgs[0].key} (avg Jaccard: ${modelPairAvgs[0].avg.toFixed(3)})`,
      );
      lines.push(
        `**Least similar models:** ${modelPairAvgs[modelPairAvgs.length - 1].key} (avg Jaccard: ${modelPairAvgs[modelPairAvgs.length - 1].avg.toFixed(3)})`,
      );
    }
  } else {
    lines.push(
      "No cross-model comparisons available (need results from multiple models).",
    );
  }
  lines.push("");

  // ── Waypoint Count Effect
  lines.push("## 6. Waypoint Count Effect");
  lines.push("");

  if (waypointCountEffects.length > 0) {
    const avgSharedFraction =
      waypointCountEffects.reduce((s, e) => s + e.sharedFraction, 0) /
      waypointCountEffects.length;
    const subseqRate =
      waypointCountEffects.filter((e) => e.isSubsequence).length /
      waypointCountEffects.length;

    lines.push(
      `Comparing 5-waypoint and 10-waypoint paths for the same model/pair:`,
    );
    lines.push("");
    lines.push(`- **Conditions compared:** ${waypointCountEffects.length}`);
    lines.push(
      `- **Average shared waypoint fraction:** ${avgSharedFraction.toFixed(3)} (fraction of 5-waypoint concepts that also appear in the 10-waypoint set)`,
    );
    lines.push(
      `- **Subsequence rate:** ${(subseqRate * 100).toFixed(1)}% of 5-waypoint paths appear as subsequences of 10-waypoint paths`,
    );
    lines.push("");

    lines.push("| Model | Pair | Shared Fraction | Subsequence? |");
    lines.push("|-------|------|-----------------|--------------|");
    for (const e of waypointCountEffects.slice(0, 20)) {
      lines.push(
        `| ${e.model} | ${e.pairId} | ${e.sharedFraction.toFixed(3)} | ${e.isSubsequence ? "yes" : "no"} |`,
      );
    }
    if (waypointCountEffects.length > 20) {
      lines.push(
        `| ... | ... | ... | ... | (${waypointCountEffects.length - 20} more rows) |`,
      );
    }
  } else {
    lines.push(
      "No waypoint count comparison data available (need both 5 and 10 waypoint results for the same model/pair).",
    );
  }
  lines.push("");

  // ── Polysemy Observations
  lines.push("## 7. Polysemy Observations");
  lines.push("");

  if (polysemyComparisons.length > 0) {
    lines.push(
      "For polysemy pair groups, comparing the waypoint sets produced when the ambiguous word is paired with different sense-steering targets:",
    );
    lines.push("");

    for (const pc of polysemyComparisons) {
      lines.push(`### Group: "${pc.group}"`);
      lines.push("");
      for (const p of pc.pairs) {
        lines.push(`- \`${p.pairId}\`: ${p.from} -> ${p.to}`);
      }
      lines.push("");
      if (pc.crossPairJaccard === null) {
        lines.push(
          `**Cross-pair Jaccard:** n/a`,
        );
        lines.push(
          `> ⚠️ Incomplete data — one or more sense-steering pairs had no results. Cross-pair comparison not possible.`,
        );
      } else {
        lines.push(
          `**Cross-pair Jaccard:** ${pc.crossPairJaccard.toFixed(3)} (lower = more distinct paths = better sense differentiation)`,
        );
      }
      lines.push("");
    }
  } else {
    lines.push("No polysemy comparison data available.");
  }
  lines.push("");

  // ── Category-Level Patterns
  lines.push("## 8. Category-Level Patterns");
  lines.push("");

  const nonControlAnalyses = categoryAnalyses.filter(
    (a) => !a.category.startsWith("control-"),
  );

  if (nonControlAnalyses.length > 0) {
    lines.push("| Category | Avg Jaccard | Avg Positional | Avg Entropy | Pairs |");
    lines.push("|----------|-------------|----------------|-------------|-------|");
    for (const ca of nonControlAnalyses) {
      lines.push(
        `| ${ca.category} | ${ca.avgJaccard.toFixed(3)} | ${ca.avgPositionalOverlap.toFixed(3)} | ${ca.avgEntropy.toFixed(3)} | ${ca.pairCount} |`,
      );
    }
    lines.push("");

    // Sort by Jaccard to identify patterns
    const sorted = [...nonControlAnalyses].sort(
      (a, b) => b.avgJaccard - a.avgJaccard,
    );
    if (sorted.length > 0) {
      lines.push(
        `**Most consistent category:** ${sorted[0].category} (Jaccard: ${sorted[0].avgJaccard.toFixed(3)})`,
      );
      lines.push(
        `**Least consistent category:** ${sorted[sorted.length - 1].category} (Jaccard: ${sorted[sorted.length - 1].avgJaccard.toFixed(3)})`,
      );
    }
  } else {
    lines.push("No category-level data available.");
  }
  lines.push("");

  // ── Anomalies and Surprises
  lines.push("## 9. Anomalies and Surprises");
  lines.push("");

  if (conditionMetrics.length > 0) {
    // Find conditions with very high or very low consistency
    const sorted = [...conditionMetrics].sort(
      (a, b) => a.avgJaccard - b.avgJaccard,
    );
    const lowestConsistency = sorted.slice(0, 5);
    const highestConsistency = sorted.slice(-5).reverse();

    lines.push("**Lowest consistency conditions:**");
    lines.push("");
    for (const c of lowestConsistency) {
      lines.push(
        `- ${c.key.model} / \`${c.key.pairId}\` / ${c.key.waypointCount}wp / ${c.key.promptFormat}: Jaccard=${c.avgJaccard.toFixed(3)}, Entropy=${c.distributionalEntropy.toFixed(3)}`,
      );
    }
    lines.push("");

    lines.push("**Highest consistency conditions:**");
    lines.push("");
    for (const c of highestConsistency) {
      lines.push(
        `- ${c.key.model} / \`${c.key.pairId}\` / ${c.key.waypointCount}wp / ${c.key.promptFormat}: Jaccard=${c.avgJaccard.toFixed(3)}, Entropy=${c.distributionalEntropy.toFixed(3)}`,
      );
    }
    lines.push("");

    // Extraction quality anomalies
    const poorExtraction = conditionMetrics
      .filter((c) => c.extractionAccuracy < 0.5 && c.runCount >= 2)
      .sort((a, b) => a.extractionAccuracy - b.extractionAccuracy);

    if (poorExtraction.length > 0) {
      lines.push("**Poor extraction accuracy (< 50%):**");
      lines.push("");
      for (const c of poorExtraction.slice(0, 10)) {
        lines.push(
          `- ${c.key.model} / \`${c.key.pairId}\`: ${(c.extractionAccuracy * 100).toFixed(0)}% match (avg ${c.avgExtractedCount.toFixed(1)} extracted vs ${c.requestedCount} requested)`,
        );
      }
      lines.push("");
    }
  } else {
    lines.push("No anomaly analysis possible with empty dataset.");
  }
  lines.push("");

  // ── Recommendations for Phase 2
  lines.push("## 10. Recommendations for Phase 2");
  lines.push("");

  if (conditionMetrics.length > 0) {
    lines.push("Based on the pilot results:");
    lines.push("");
    lines.push(
      "1. **Prompt format:** Select the format yielding higher consistency (see Section 2).",
    );
    lines.push(
      "2. **Waypoint count:** Evaluate whether 5 or 10 waypoints provides better signal (see Section 6). If 5-waypoint paths reliably appear as subsequences of 10-waypoint paths, the 5-waypoint condition may be sufficient and more efficient.",
    );
    lines.push(
      "3. **Repetitions:** If intra-model consistency (Jaccard) is generally above 0.5, 10 repetitions may suffice for stable estimates. If below, consider 20+ repetitions.",
    );
    lines.push(
      "4. **Control calibration:** Verify that control baselines behave as expected before interpreting experimental pairs.",
    );
    lines.push(
      "5. **Polysemy pairs:** If cross-pair Jaccard within polysemy groups is close to the overall average, the sense-steering effect may be weak, and additional pairs or prompt refinement may be needed.",
    );
    lines.push(
      "6. **Category coverage:** Identify any categories with insufficient data and plan additional pairs if needed.",
    );
  } else {
    lines.push(
      "No pilot data available yet. Run the pilot experiment first:",
    );
    lines.push("");
    lines.push("```bash");
    lines.push("bun run pilot");
    lines.push("```");
    lines.push("");
    lines.push("Then re-run this analysis:");
    lines.push("");
    lines.push("```bash");
    lines.push("bun run analyze");
    lines.push("```");
  }
  lines.push("");

  return lines.join("\n");
}

// ── Main Analysis Pipeline ─────────────────────────────────────────

async function analyze(opts: {
  input: string;
  output: string;
  skipEmbeddings: boolean;
  strictExtraction: boolean;
  findings: string;
}): Promise<void> {
  const inputDir = resolve(opts.input);
  const outputDir = resolve(opts.output);
  const findingsPath = resolve(opts.findings);

  console.log("Conceptual Topology Mapping Benchmark - Pilot Analysis");
  console.log("======================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log(`Skip embeddings:  ${opts.skipEmbeddings}`);
  console.log(`Strict extraction: ${opts.strictExtraction}`);
  console.log("");

  // ── Load data
  console.log("Loading results...");
  const results = await loadResults(inputDir);

  if (results.length === 0) {
    console.log("");
    console.log("No pilot results found in " + join(inputDir, "pilot") + "/");
    console.log("");
    console.log("Run the pilot experiment first:");
    console.log("  bun run pilot");
    console.log("");
    console.log("Then re-run this analysis:");
    console.log("  bun run analyze");

    // Still generate empty findings file as a placeholder
    await mkdir(outputDir, { recursive: true });
    const parentDir = findingsPath.substring(
      0,
      findingsPath.lastIndexOf("/"),
    );
    if (parentDir) await mkdir(parentDir, { recursive: true });

    const emptyAnalysis: AnalysisOutput = {
      metadata: {
        timestamp: new Date().toISOString(),
        inputDir,
        totalResults: 0,
        uniqueModels: [],
        uniquePairs: [],
        waypointCounts: [],
        promptFormats: [],
        skippedEmbeddings: opts.skipEmbeddings,
      },
      conditionMetrics: [],
      modelProfiles: [],
      crossModelComparisons: [],
      waypointCountEffects: [],
      categoryAnalyses: [],
      polysemyComparisons: [],
    };

    await writeFile(
      join(outputDir, "pilot-metrics.json"),
      JSON.stringify(emptyAnalysis, null, 2),
    );
    await writeFile(findingsPath, generateFindings(emptyAnalysis));

    console.log(`Wrote empty analysis to ${join(outputDir, "pilot-metrics.json")}`);
    console.log(`Wrote placeholder findings to ${findingsPath}`);
    return;
  }

  const successfulResults = results.filter((r) => !r.failureMode);
  const failedResults = results.filter((r) => r.failureMode);

  console.log(`  Total results:     ${results.length}`);
  console.log(`  Successful:        ${successfulResults.length}`);
  console.log(`  Failed:            ${failedResults.length}`);
  console.log("");

  // ── Gather metadata
  const uniqueModels = [...new Set(results.map((r) => r.modelShortId))].sort();
  const uniquePairs = [...new Set(results.map((r) => r.pair.id))].sort();
  const waypointCounts = [
    ...new Set(results.map((r) => r.waypointCount)),
  ].sort((a, b) => a - b);
  const promptFormats = [
    ...new Set(results.map((r) => r.promptFormat)),
  ].sort();

  console.log(`  Models:            ${uniqueModels.join(", ")}`);
  console.log(`  Pairs:             ${uniquePairs.length}`);
  console.log(`  Waypoint counts:   ${waypointCounts.join(", ")}`);
  console.log(`  Prompt formats:    ${promptFormats.join(", ")}`);
  console.log("");

  // ── Compute per-condition metrics
  console.log("Computing per-condition metrics...");
  const conditionGroups = groupByCondition(results);
  const conditionMetrics: ConditionMetrics[] = [];

  let condIdx = 0;
  const totalConditions = conditionGroups.size;

  for (const [keyStr, group] of conditionGroups) {
    condIdx++;
    const parts = keyStr.split("|");
    const key: ConditionKey = {
      model: parts[0],
      pairId: parts[1],
      waypointCount: parseInt(parts[2], 10),
      promptFormat: parts[3],
    };

    if (condIdx % 10 === 0 || condIdx === totalConditions) {
      process.stdout.write(
        `\r  Condition ${condIdx}/${totalConditions}...`,
      );
    }

    const metrics = await computeConditionMetrics(
      key,
      group,
      opts.skipEmbeddings,
      opts.strictExtraction,
    );
    conditionMetrics.push(metrics);
  }
  console.log(
    `\r  Computed metrics for ${conditionMetrics.length} conditions.          `,
  );
  console.log("");

  // ── Compute model profiles
  console.log("Computing model profiles...");
  const modelGroups = groupByModel(results);
  const modelProfiles: ModelProfile[] = [];

  for (const modelId of uniqueModels) {
    const modelConditions = conditionMetrics.filter(
      (c) => c.key.model === modelId,
    );
    const modelResults = modelGroups.get(modelId) ?? [];
    const profile = computeModelProfile(modelId, modelConditions, modelResults);
    modelProfiles.push(profile);
    console.log(
      `  ${profile.displayName}: Jaccard=${profile.avgJaccard.toFixed(3)}, Entropy=${profile.avgEntropy.toFixed(3)}, Runs=${profile.totalRuns}`,
    );
  }
  console.log("");

  // ── Cross-model comparisons
  console.log("Computing cross-model comparisons...");
  const crossModelComparisons = computeCrossModelComparisons(results);
  console.log(
    `  ${crossModelComparisons.length} model-pair comparisons computed.`,
  );
  console.log("");

  // ── Waypoint count effects
  console.log("Computing waypoint count effects...");
  const waypointCountEffects = computeWaypointCountEffects(results);
  console.log(
    `  ${waypointCountEffects.length} model-pair count comparisons computed.`,
  );
  if (waypointCountEffects.length > 0) {
    const avgShared =
      waypointCountEffects.reduce((s, e) => s + e.sharedFraction, 0) /
      waypointCountEffects.length;
    const subseqRate =
      waypointCountEffects.filter((e) => e.isSubsequence).length /
      waypointCountEffects.length;
    console.log(`  Avg shared fraction: ${avgShared.toFixed(3)}`);
    console.log(`  Subsequence rate:    ${(subseqRate * 100).toFixed(1)}%`);
  }
  console.log("");

  // ── Category analyses
  console.log("Computing category analyses...");
  const categoryAnalyses = computeCategoryAnalyses(conditionMetrics, results);
  for (const ca of categoryAnalyses) {
    console.log(
      `  ${ca.category}: Jaccard=${ca.avgJaccard.toFixed(3)}, Entropy=${ca.avgEntropy.toFixed(3)}, Pairs=${ca.pairCount}`,
    );
  }
  console.log("");

  // ── Polysemy comparisons
  console.log("Computing polysemy comparisons...");
  const polysemyComparisons = computePolysemyComparisons(results);
  for (const pc of polysemyComparisons) {
    const jaccardStr = pc.crossPairJaccard !== null ? pc.crossPairJaccard.toFixed(3) : "n/a (incomplete data)";
    console.log(
      `  Group "${pc.group}": cross-pair Jaccard=${jaccardStr}`,
    );
  }
  console.log("");

  // ── Build analysis output
  const analysisOutput: AnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      inputDir,
      totalResults: results.length,
      uniqueModels,
      uniquePairs,
      waypointCounts,
      promptFormats,
      skippedEmbeddings: opts.skipEmbeddings,
    },
    conditionMetrics,
    modelProfiles,
    crossModelComparisons,
    waypointCountEffects,
    categoryAnalyses,
    polysemyComparisons,
  };

  // ── Write outputs
  console.log("Writing outputs...");

  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "pilot-metrics.json");
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
    .name("pilot-analysis")
    .description(
      "Analyze pilot experiment results for the Conceptual Topology Mapping Benchmark",
    )
    .option("--input <dir>", "input directory containing results/pilot/", "results")
    .option(
      "--output <dir>",
      "output directory for analysis JSON",
      "results/analysis",
    )
    .option(
      "--skip-embeddings",
      "skip semantic similarity computation (requires API calls)",
      false,
    )
    .option(
      "--strict-extraction",
      "exclude runs where extracted waypoint count doesn't match requested count",
      false,
    )
    .option(
      "--findings <path>",
      "path for findings markdown output",
      "findings/01-pilot.md",
    );

  program.parse();
  const opts = program.opts();

  analyze({
    input: opts.input,
    output: opts.output,
    skipEmbeddings: opts.skipEmbeddings,
    strictExtraction: opts.strictExtraction,
    findings: opts.findings,
  }).catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
