/**
 * Metrics for Phase 2 reversal analysis and Phase 3 positional/transitivity analysis.
 *
 * Phase 2: distribution-level comparison, permutation tests, bootstrap CIs,
 * edit distance, reversal order correlation.
 *
 * Phase 3A: positional convergence (mirror-match rates, per-position Jaccard,
 * convergence gradient via linear regression).
 *
 * Phase 3B: waypoint transitivity, navigational distance, shortcuts/detours.
 */

import { computeJaccard } from "./canonicalize.ts";

// ── Seeded PRNG ─────────────────────────────────────────────────────

/**
 * Mulberry32: a fast, seedable 32-bit PRNG.
 * Returns a function that produces values in [0, 1).
 */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Default seed for reproducible analysis. Override via setMetricsSeed(). */
let _rng = mulberry32(42);

/**
 * Reset the metrics PRNG with a new seed for reproducibility.
 */
export function setMetricsSeed(seed: number): void {
  _rng = mulberry32(seed);
}

/**
 * Fisher-Yates shuffle (unbiased, uses seeded PRNG).
 */
function fisherYatesShuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(_rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

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
      sample.push(data[Math.floor(_rng() * data.length)]);
    }
    bootstrapStats.push(statFn(sample));
  }

  bootstrapStats.sort((a, b) => a - b);
  const lower = bootstrapStats[Math.floor(nBootstrap * 0.025)];
  const upper = bootstrapStats[Math.floor(nBootstrap * 0.975)];
  return [lower, upper];
}

export function mean(arr: number[]): number {
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
    // Unbiased Fisher-Yates shuffle with seeded PRNG
    const shuffled = fisherYatesShuffle(pooled);
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

  // Use (k+1)/(N+1) to avoid exact zero p-values
  // (Phipson & Smyth, 2010: "Permutation P-values Should Never Be Zero")
  return (countAsExtreme + 1) / (nPermutations + 1);
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
export function characteristicWaypoints(runs: string[][]): string[] {
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

  // Get raw positions in each path, then convert to proper 1..n ranks
  // among the shared subset. The Spearman closed-form formula requires
  // ranks, not raw indices — using raw indices produces out-of-range rho values.
  const fwdPositions: number[] = [];
  const revPositions: number[] = [];

  for (const wp of shared) {
    fwdPositions.push(forwardPath.indexOf(wp));
    revPositions.push(reversePath.indexOf(wp));
  }

  // Convert raw positions to ranks (1-based, handling ties via average rank)
  const fwdRanks = positionsToRanks(fwdPositions);
  const revRanks = positionsToRanks(revPositions);

  // Spearman's rho = 1 - (6 * sum(d^2)) / (n * (n^2 - 1))
  const n = shared.length;
  let sumD2 = 0;
  for (let i = 0; i < n; i++) {
    const d = fwdRanks[i] - revRanks[i];
    sumD2 += d * d;
  }

  return 1 - (6 * sumD2) / (n * (n * n - 1));
}

/**
 * Convert raw position values to ranks (1-based).
 * Ties get average rank, e.g. [10, 5, 5, 20] → [3, 1.5, 1.5, 4].
 */
function positionsToRanks(positions: number[]): number[] {
  const indexed = positions.map((val, idx) => ({ val, idx }));
  indexed.sort((a, b) => a.val - b.val);

  const ranks = new Array<number>(positions.length);
  let i = 0;
  while (i < indexed.length) {
    // Find group of ties
    let j = i;
    while (j < indexed.length && indexed[j].val === indexed[i].val) {
      j++;
    }
    // Average rank for tied group (1-based)
    const avgRank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) {
      ranks[indexed[k].idx] = avgRank;
    }
    i = j;
  }

  return ranks;
}

// ── Aggregate Asymmetry Metrics ─────────────────────────────────────

import type { AsymmetryMetrics, PositionalConvergenceMetrics, TransitivityMetrics } from "./types.ts";

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

// ── Phase 3A: Positional Convergence ──────────────────────────────

/**
 * Compute positional convergence metrics between forward and reverse runs.
 *
 * Mirror indexing: forward position i compares to reverse position (n-1-i),
 * because forward wp1 is near concept A and reverse wp_last is also near A
 * (since reverse swaps from/to).
 *
 * @param forwardRuns - Forward direction runs (ordered waypoints)
 * @param reverseRuns - Reverse direction runs (ordered waypoints)
 * @param waypointCount - Number of waypoints per path (default: 5)
 */
export function computePositionalConvergence(
  pairId: string,
  modelId: string,
  forwardRuns: string[][],
  reverseRuns: string[][],
  waypointCount = 5,
): PositionalConvergenceMetrics {
  const perPositionMatchRate: number[] = [];
  const perPositionJaccard: number[] = [];

  for (let pos = 0; pos < waypointCount; pos++) {
    const mirrorPos = waypointCount - 1 - pos;

    // Collect all forward waypoints at position `pos`
    // and all reverse waypoints at mirror position `mirrorPos`
    let matchCount = 0;
    let totalPairs = 0;

    const fwdWaypointsAtPos: string[] = [];
    const revWaypointsAtMirror: string[] = [];

    for (const fwd of forwardRuns) {
      if (pos < fwd.length) fwdWaypointsAtPos.push(fwd[pos]);
    }
    for (const rev of reverseRuns) {
      if (mirrorPos < rev.length) revWaypointsAtMirror.push(rev[mirrorPos]);
    }

    // Exact mirror-match rate: for each fwd×rev pair, does fwd[pos] === rev[mirrorPos]?
    for (const fwdWp of fwdWaypointsAtPos) {
      for (const revWp of revWaypointsAtMirror) {
        totalPairs++;
        if (fwdWp === revWp) matchCount++;
      }
    }
    perPositionMatchRate.push(totalPairs > 0 ? matchCount / totalPairs : 0);

    // Pooled Jaccard at this position: vocabulary overlap
    const fwdSet = new Set(fwdWaypointsAtPos);
    const revSet = new Set(revWaypointsAtMirror);
    const intersection = new Set([...fwdSet].filter((w) => revSet.has(w)));
    const union = new Set([...fwdSet, ...revSet]);
    perPositionJaccard.push(union.size > 0 ? intersection.size / union.size : 0);
  }

  // Linear regression: match rate as a function of position
  const { slope, r2 } = linearRegression(
    perPositionMatchRate.map((_, i) => i),
    perPositionMatchRate,
  );

  return {
    pairId,
    modelId,
    perPositionMatchRate,
    perPositionJaccard,
    convergenceSlope: slope,
    convergenceR2: r2,
    forwardRunCount: forwardRuns.length,
    reverseRunCount: reverseRuns.length,
  };
}

/**
 * Simple linear regression: y = slope * x + intercept.
 * Returns slope and R² (coefficient of determination).
 */
export function linearRegression(
  x: number[],
  y: number[],
): { slope: number; intercept: number; r2: number } {
  const n = x.length;
  if (n < 2) return { slope: 0, intercept: y[0] ?? 0, r2: 0 };

  const meanX = mean(x);
  const meanY = mean(y);

  let ssXY = 0;
  let ssXX = 0;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    ssXY += (x[i] - meanX) * (y[i] - meanY);
    ssXX += (x[i] - meanX) * (x[i] - meanX);
    ssTot += (y[i] - meanY) * (y[i] - meanY);
  }

  const slope = ssXX > 0 ? ssXY / ssXX : 0;
  const intercept = meanY - slope * meanX;

  // R² = 1 - SS_res / SS_tot
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const predicted = slope * x[i] + intercept;
    ssRes += (y[i] - predicted) * (y[i] - predicted);
  }
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  return { slope, intercept, r2 };
}

// ── Phase 3B: Transitivity Metrics ───────────────────────────────

/**
 * Compute waypoint transitivity: how much does the direct A→C path overlap
 * with the composed A→B + B→C path?
 *
 * transitivity = Jaccard(waypoints(A→C), waypoints(A→B) ∪ waypoints(B→C))
 *
 * Returns the mean transitivity across all run combinations, plus bootstrap CI.
 */
export function computeWaypointTransitivity(
  runsAB: string[][],
  runsBC: string[][],
  runsAC: string[][],
): { mean: number; ci: [number, number]; values: number[] } {
  const values: number[] = [];

  for (const ac of runsAC) {
    for (const ab of runsAB) {
      for (const bc of runsBC) {
        // Union of A→B and B→C waypoints
        const composedSet = new Set([...ab, ...bc]);
        const acSet = new Set(ac);

        // Jaccard between direct and composed
        const intersection = new Set([...acSet].filter((w) => composedSet.has(w)));
        const union = new Set([...acSet, ...composedSet]);
        const jaccard = union.size > 0 ? intersection.size / union.size : 0;
        values.push(jaccard);
      }
    }
  }

  const meanVal = mean(values);
  const ci = values.length > 1 ? bootstrapCI(values) : [meanVal, meanVal] as [number, number];
  return { mean: meanVal, ci, values };
}

/**
 * Compute navigational distance for a set of runs in the same direction.
 * d(X→Y) = 1 - mean within-direction Jaccard
 *
 * High within-direction consistency → low distance (easy navigation).
 * Low consistency → high distance (difficult/unstable navigation).
 */
export function computeNavigationalDistance(runs: string[][]): number {
  if (runs.length < 2) return 1; // Can't measure consistency with <2 runs

  const jaccards: number[] = [];
  for (let i = 0; i < runs.length; i++) {
    for (let j = i + 1; j < runs.length; j++) {
      const result = computeJaccard(runs[i], runs[j]);
      jaccards.push(result.similarity);
    }
  }

  return 1 - mean(jaccards);
}

/**
 * Find shortcuts (waypoints on A→C but NOT on A→B ∪ B→C) and
 * detours (waypoints on A→B ∪ B→C but NOT on A→C).
 *
 * Uses characteristic waypoints (>50% frequency) for each leg.
 */
export function findShortcutsAndDetours(
  runsAB: string[][],
  runsBC: string[][],
  runsAC: string[][],
): { shortcuts: string[]; detours: string[] } {
  const charAB = characteristicWaypoints(runsAB);
  const charBC = characteristicWaypoints(runsBC);
  const charAC = characteristicWaypoints(runsAC);

  const composedSet = new Set([...charAB, ...charBC]);
  const directSet = new Set(charAC);

  const shortcuts = charAC.filter((wp) => !composedSet.has(wp));
  const detours = [...charAB, ...charBC].filter(
    (wp) => !directSet.has(wp) && composedSet.has(wp), // deduplicate via composedSet check
  );

  // Deduplicate detours
  const uniqueDetours = [...new Set(detours)];

  return { shortcuts, detours: uniqueDetours };
}

/**
 * Compute full transitivity metrics for a single triple/model combination.
 */
export function computeTransitivityMetrics(
  tripleId: string,
  modelId: string,
  bridgeConcept: string,
  runsAB: string[][],
  runsBC: string[][],
  runsAC: string[][],
): TransitivityMetrics {
  // Waypoint transitivity
  const transitivity = computeWaypointTransitivity(runsAB, runsBC, runsAC);

  // Navigational distances
  const distanceAB = computeNavigationalDistance(runsAB);
  const distanceBC = computeNavigationalDistance(runsBC);
  const distanceAC = computeNavigationalDistance(runsAC);

  // Triangle inequality
  const triangleSlack = distanceAB + distanceBC - distanceAC;
  const triangleInequalityHolds = triangleSlack >= -0.001; // small epsilon for floating point

  // Shortcuts and detours
  const { shortcuts, detours } = findShortcutsAndDetours(runsAB, runsBC, runsAC);

  // Bridge concept analysis: does B appear in A→C paths?
  const bridgeLower = bridgeConcept.toLowerCase();
  let bridgeAppearCount = 0;
  for (const ac of runsAC) {
    if (ac.some((wp) => wp.toLowerCase() === bridgeLower)) {
      bridgeAppearCount++;
    }
  }
  const bridgeConceptFrequency = runsAC.length > 0 ? bridgeAppearCount / runsAC.length : 0;

  return {
    tripleId,
    modelId,
    waypointTransitivity: transitivity.mean,
    waypointTransitivityCI: transitivity.ci,
    distanceAB,
    distanceBC,
    distanceAC,
    triangleInequalityHolds,
    triangleSlack,
    shortcuts,
    detours,
    bridgeConceptAppears: bridgeAppearCount > 0,
    bridgeConceptFrequency,
    runCountAB: runsAB.length,
    runCountBC: runsBC.length,
    runCountAC: runsAC.length,
  };
}
