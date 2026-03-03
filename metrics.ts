/**
 * Asymmetry metrics for Phase 2 reversal analysis.
 *
 * Implements distribution-level comparison, permutation tests,
 * bootstrap confidence intervals, edit distance, and reversal order
 * correlation for comparing forward vs reverse waypoint paths.
 */

import { computeJaccard } from "./canonicalize.ts";

// ── Bootstrap CI ────────────────────────────────────────────────────

/**
 * Compute bootstrap 95% confidence interval for a statistic.
 * @param data - Array of observed values
 * @param statFn - Function to compute the statistic (default: mean)
 * @param nBootstrap - Number of bootstrap resamples (default: 1000)
 * @returns [lower, upper] bounds of 95% CI
 */
export function bootstrapCI(
  data: number[],
  statFn: (arr: number[]) => number = mean,
  nBootstrap = 1000,
): [number, number] {
  if (data.length === 0) return [0, 0];
  if (data.length === 1) return [data[0], data[0]];

  const bootstrapStats: number[] = [];
  for (let i = 0; i < nBootstrap; i++) {
    const sample: number[] = [];
    for (let j = 0; j < data.length; j++) {
      sample.push(data[Math.floor(Math.random() * data.length)]);
    }
    bootstrapStats.push(statFn(sample));
  }

  bootstrapStats.sort((a, b) => a - b);
  const lower = bootstrapStats[Math.floor(nBootstrap * 0.025)];
  const upper = bootstrapStats[Math.floor(nBootstrap * 0.975)];
  return [lower, upper];
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, v) => sum + v, 0) / arr.length;
}

// ── Cross-Direction Jaccard ─────────────────────────────────────────

/**
 * Compute all pairwise Jaccard similarities between forward and reverse runs.
 * Returns the full distribution of cross-direction Jaccard values.
 */
export function crossDirectionJaccards(
  forwardRuns: string[][],
  reverseRuns: string[][],
): number[] {
  const jaccards: number[] = [];
  for (const fwd of forwardRuns) {
    for (const rev of reverseRuns) {
      const result = computeJaccard(fwd, rev);
      jaccards.push(result.similarity);
    }
  }
  return jaccards;
}

// ── Permutation Test ────────────────────────────────────────────────

/**
 * Permutation test for directional asymmetry.
 * Null hypothesis: forward and reverse runs are drawn from the same distribution.
 *
 * @param forwardRuns - Forward direction waypoint sets
 * @param reverseRuns - Reverse direction waypoint sets
 * @param nPermutations - Number of permutations (default: 1000)
 * @returns p-value (fraction of permuted stats <= observed stat)
 */
export function permutationTest(
  forwardRuns: string[][],
  reverseRuns: string[][],
  nPermutations = 1000,
): number {
  // Observed: mean cross-direction Jaccard
  const observedJaccards = crossDirectionJaccards(forwardRuns, reverseRuns);
  const observedMean = mean(observedJaccards);

  // Pool all runs
  const pooled = [...forwardRuns, ...reverseRuns];
  const nForward = forwardRuns.length;
  let countAsExtreme = 0;

  for (let i = 0; i < nPermutations; i++) {
    // Shuffle and split
    const shuffled = [...pooled].sort(() => Math.random() - 0.5);
    const permForward = shuffled.slice(0, nForward);
    const permReverse = shuffled.slice(nForward);

    // Compute cross-group Jaccard for permuted split
    const permJaccards = crossDirectionJaccards(permForward, permReverse);
    const permMean = mean(permJaccards);

    // Count how often permuted mean is as extreme as observed
    // (lower cross-direction Jaccard = more asymmetry)
    if (permMean <= observedMean) {
      countAsExtreme++;
    }
  }

  return countAsExtreme / nPermutations;
}

// ── Direction-Exclusive Waypoints ────────────────────────────────────

/**
 * Find characteristic waypoints (>50% frequency) exclusive to one direction.
 */
export function directionExclusiveWaypoints(
  forwardRuns: string[][],
  reverseRuns: string[][],
): { forwardExclusive: string[]; reverseExclusive: string[] } {
  const fwdCharacteristic = characteristicWaypoints(forwardRuns);
  const revCharacteristic = characteristicWaypoints(reverseRuns);

  const fwdSet = new Set(fwdCharacteristic);
  const revSet = new Set(revCharacteristic);

  const forwardExclusive = fwdCharacteristic.filter((wp) => !revSet.has(wp));
  const reverseExclusive = revCharacteristic.filter((wp) => !fwdSet.has(wp));

  return { forwardExclusive, reverseExclusive };
}

/**
 * Get waypoints appearing in >50% of runs.
 */
function characteristicWaypoints(runs: string[][]): string[] {
  const freqMap = new Map<string, number>();
  for (const run of runs) {
    const unique = new Set(run);
    for (const wp of unique) {
      freqMap.set(wp, (freqMap.get(wp) ?? 0) + 1);
    }
  }

  const threshold = runs.length * 0.5;
  return Array.from(freqMap.entries())
    .filter(([_, count]) => count > threshold)
    .sort((a, b) => b[1] - a[1])
    .map(([wp]) => wp);
}

/**
 * Get the characteristic (mode) path — the most common waypoint at each position.
 */
export function characteristicPath(runs: string[][]): string[] {
  if (runs.length === 0) return [];

  const maxLen = Math.max(...runs.map((r) => r.length));
  const path: string[] = [];

  for (let pos = 0; pos < maxLen; pos++) {
    const freqMap = new Map<string, number>();
    for (const run of runs) {
      if (pos < run.length) {
        freqMap.set(run[pos], (freqMap.get(run[pos]) ?? 0) + 1);
      }
    }

    // Find most common waypoint at this position
    let bestWp = "";
    let bestCount = 0;
    for (const [wp, count] of freqMap) {
      if (count > bestCount) {
        bestWp = wp;
        bestCount = count;
      }
    }
    if (bestWp) path.push(bestWp);
  }

  return path;
}

// ── Normalized Levenshtein ──────────────────────────────────────────

/**
 * Compute normalized Levenshtein edit distance between two sequences.
 * Returns value in [0, 1] where 0 = identical, 1 = completely different.
 */
export function normalizedLevenshtein(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  if (a.length === 0 || b.length === 0) return 1;

  const matrix: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return matrix[a.length][b.length] / Math.max(a.length, b.length);
}

// ── Spearman's Rho for Reversal Order ───────────────────────────────

/**
 * Compute Spearman's rank correlation between forward and reverse
 * characteristic waypoint orderings.
 *
 * Only computes for shared waypoints. Returns null if fewer than 3
 * shared waypoints (insufficient for meaningful correlation).
 *
 * rho ~ -1: mirror image paths
 * rho ~ 0: same landmarks, different route
 * rho ~ +1: same path same order
 */
export function reversalOrderRho(
  forwardPath: string[],
  reversePath: string[],
): number | null {
  // Find shared waypoints
  const fwdSet = new Set(forwardPath);
  const shared = reversePath.filter((wp) => fwdSet.has(wp));

  if (shared.length < 3) return null;

  // Get positions in each path
  const fwdRanks: number[] = [];
  const revRanks: number[] = [];

  for (const wp of shared) {
    fwdRanks.push(forwardPath.indexOf(wp));
    revRanks.push(reversePath.indexOf(wp));
  }

  // Spearman's rho = 1 - (6 * sum(d^2)) / (n * (n^2 - 1))
  const n = shared.length;
  let sumD2 = 0;
  for (let i = 0; i < n; i++) {
    const d = fwdRanks[i] - revRanks[i];
    sumD2 += d * d;
  }

  return 1 - (6 * sumD2) / (n * (n * n - 1));
}

// ── Aggregate Asymmetry Metrics ─────────────────────────────────────

import type { AsymmetryMetrics } from "./types.ts";

/**
 * Compute full asymmetry metrics for a single pair/model combination.
 */
export function computeAsymmetryMetrics(
  pairId: string,
  modelId: string,
  forwardRuns: string[][],
  reverseRuns: string[][],
): AsymmetryMetrics {
  // Cross-direction Jaccard distribution
  const jaccards = crossDirectionJaccards(forwardRuns, reverseRuns);
  const meanJaccard = mean(jaccards);
  const jaccardCI = bootstrapCI(jaccards);

  // Asymmetry index
  const asymmetry = 1 - meanJaccard;
  const asymmetryCI: [number, number] = [1 - jaccardCI[1], 1 - jaccardCI[0]];

  // Permutation test
  const pValue = permutationTest(forwardRuns, reverseRuns);

  // Direction-exclusive waypoints
  const { forwardExclusive, reverseExclusive } = directionExclusiveWaypoints(
    forwardRuns,
    reverseRuns,
  );

  // Characteristic paths
  const fwdPath = characteristicPath(forwardRuns);
  const revPath = characteristicPath(reverseRuns);

  // Edit distance
  const editDist = normalizedLevenshtein(fwdPath, revPath);

  // Reversal order correlation
  const rho = reversalOrderRho(fwdPath, revPath);

  return {
    pairId,
    modelId,
    meanCrossDirectionJaccard: meanJaccard,
    crossDirectionJaccardCI: jaccardCI,
    asymmetryIndex: asymmetry,
    asymmetryIndexCI: asymmetryCI,
    permutationPValue: pValue,
    forwardExclusiveWaypoints: forwardExclusive,
    reverseExclusiveWaypoints: reverseExclusive,
    normalizedEditDistance: editDist,
    reversalOrderRho: rho,
    forwardRunCount: forwardRuns.length,
    reverseRunCount: reverseRuns.length,
  };
}
