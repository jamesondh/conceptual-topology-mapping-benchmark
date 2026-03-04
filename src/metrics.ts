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
 * Get a seeded random number in [0, 1) using the metrics PRNG.
 * Use this instead of Math.random() for reproducibility.
 */
export function seededRandom(): number {
  return _rng();
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

/**
 * Bootstrap CI by resampling runs (not cross-product pairs) to avoid
 * pseudoreplication. The statistic is computed on each resample of the
 * run arrays, producing correctly-widened confidence intervals.
 */
export function bootstrapCIFromRuns(
  groupA: string[][],
  groupB: string[][],
  statFn: (a: string[][], b: string[][]) => number,
  nBootstrap = 1000,
): [number, number] {
  if (groupA.length === 0 || groupB.length === 0) return [0, 0];

  const bootstrapStats: number[] = [];
  for (let i = 0; i < nBootstrap; i++) {
    // Resample each group independently with replacement
    const sampleA: string[][] = [];
    for (let j = 0; j < groupA.length; j++) {
      sampleA.push(groupA[Math.floor(_rng() * groupA.length)]);
    }
    const sampleB: string[][] = [];
    for (let j = 0; j < groupB.length; j++) {
      sampleB.push(groupB[Math.floor(_rng() * groupB.length)]);
    }
    bootstrapStats.push(statFn(sampleA, sampleB));
  }

  bootstrapStats.sort((a, b) => a - b);
  const lower = bootstrapStats[Math.floor(nBootstrap * 0.025)];
  const upper = bootstrapStats[Math.floor(nBootstrap * 0.975)];
  return [lower, upper];
}

/**
 * Bootstrap CI by resampling three groups of runs (for transitivity metrics).
 * Avoids pseudoreplication from the triple cross-product.
 */
export function bootstrapCIFromTripleRuns(
  groupA: string[][],
  groupB: string[][],
  groupC: string[][],
  statFn: (a: string[][], b: string[][], c: string[][]) => number,
  nBootstrap = 1000,
): [number, number] {
  if (groupA.length === 0 || groupB.length === 0 || groupC.length === 0) return [0, 0];

  const bootstrapStats: number[] = [];
  for (let i = 0; i < nBootstrap; i++) {
    const sampleA: string[][] = [];
    for (let j = 0; j < groupA.length; j++) {
      sampleA.push(groupA[Math.floor(_rng() * groupA.length)]);
    }
    const sampleB: string[][] = [];
    for (let j = 0; j < groupB.length; j++) {
      sampleB.push(groupB[Math.floor(_rng() * groupB.length)]);
    }
    const sampleC: string[][] = [];
    for (let j = 0; j < groupC.length; j++) {
      sampleC.push(groupC[Math.floor(_rng() * groupC.length)]);
    }
    bootstrapStats.push(statFn(sampleA, sampleB, sampleC));
  }

  bootstrapStats.sort((a, b) => a - b);
  const lower = bootstrapStats[Math.floor(nBootstrap * 0.025)];
  const upper = bootstrapStats[Math.floor(nBootstrap * 0.975)];
  return [lower, upper];
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
  // Bootstrap at the run level to avoid pseudoreplication:
  // resample forward and reverse runs independently, then compute cross-Jaccard
  const jaccardCI = bootstrapCIFromRuns(forwardRuns, reverseRuns, (fwd, rev) => {
    return mean(crossDirectionJaccards(fwd, rev));
  });

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

  // Bootstrap CI at the run level (resample runs, not cross-product pairs)
  // to avoid pseudoreplication from the triple cross-product
  const ci = (runsAB.length > 1 || runsBC.length > 1 || runsAC.length > 1)
    ? bootstrapCIFromTripleRuns(runsAB, runsBC, runsAC, (ab, bc, ac) => {
        const resampled: number[] = [];
        for (const acRun of ac) {
          for (const abRun of ab) {
            for (const bcRun of bc) {
              const composed = new Set([...abRun, ...bcRun]);
              const direct = new Set(acRun);
              const inter = new Set([...direct].filter((w) => composed.has(w)));
              const union = new Set([...direct, ...composed]);
              resampled.push(union.size > 0 ? inter.size / union.size : 0);
            }
          }
        }
        return mean(resampled);
      })
    : [meanVal, meanVal] as [number, number];

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
  // Uses fuzzy matching: exact match, substring containment (either direction),
  // or multi-word token containment. This catches "domestic dog" for bridge "dog",
  // "riverbank" for bridge "river", etc.
  // Limitation: true synonyms (e.g. "canine" for "dog") are still not matched.
  const bridgeLower = bridgeConcept.toLowerCase();
  let bridgeAppearCount = 0;
  for (const ac of runsAC) {
    if (ac.some((wp) => bridgeConceptMatches(wp.toLowerCase(), bridgeLower))) {
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

/**
 * Check if a waypoint matches a bridge concept using fuzzy matching.
 * Both inputs should be lowercased.
 *
 * Matches when:
 * 1. Exact match: "dog" === "dog"
 * 2. Waypoint contains bridge as a word boundary: "domestic dog" contains "dog"
 * 3. Bridge contains waypoint as a word boundary: rare, but handles abbreviations
 * 4. Waypoint tokens include the bridge: "domestic dog" split by spaces includes "dog"
 */
function bridgeConceptMatches(waypoint: string, bridge: string): boolean {
  // Exact match
  if (waypoint === bridge) return true;

  // Word-boundary containment: bridge appears as a whole word in waypoint
  // Use word boundary regex to avoid "dogma" matching "dog"
  const bridgeRegex = new RegExp(`\\b${escapeRegex(bridge)}\\b`);
  if (bridgeRegex.test(waypoint)) return true;

  // Token match: any token in the waypoint exactly matches the bridge
  const tokens = waypoint.split(/[\s\-\/]+/);
  if (tokens.includes(bridge)) return true;

  return false;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── Phase 4: Cross-Model Bridge Topology Metrics ─────────────────

/**
 * Compute cross-model Jaccard: for all pairs of runs (one from model X, one from model Y),
 * compute Jaccard and return the mean. Measures how similar two models' paths are.
 */
export function computeCrossModelJaccard(
  runsModelA: string[][],
  runsModelB: string[][],
): { mean: number; ci: [number, number] } {
  if (runsModelA.length === 0 || runsModelB.length === 0) {
    return { mean: 0, ci: [0, 0] };
  }

  const meanVal = meanCrossJaccard(runsModelA, runsModelB);
  const ci = bootstrapCIFromRuns(runsModelA, runsModelB, (a, b) => meanCrossJaccard(a, b));

  return { mean: meanVal, ci };
}

function meanCrossJaccard(groupA: string[][], groupB: string[][]): number {
  const jaccards: number[] = [];
  for (const a of groupA) {
    for (const b of groupB) {
      const result = computeJaccard(a, b);
      jaccards.push(result.similarity);
    }
  }
  return mean(jaccards);
}

/**
 * Compute bridge-removed Jaccard: recompute cross-model Jaccard after removing
 * the bridge concept token from all waypoint sets. If the correlation between
 * bridge agreement and path similarity persists after removal, it's not an artifact
 * of shared bridge tokens mechanically inflating Jaccard.
 */
export function computeBridgeRemovedJaccard(
  runsModelA: string[][],
  runsModelB: string[][],
  bridgeConcept: string,
): { mean: number; ci: [number, number] } {
  const bridgeLower = bridgeConcept.toLowerCase();
  
  // Remove bridge concept from all runs using same fuzzy matching as bridgeConceptMatches
  const cleanA = runsModelA.map(run => 
    run.filter(wp => !bridgeConceptMatchesExported(wp.toLowerCase(), bridgeLower))
  );
  const cleanB = runsModelB.map(run => 
    run.filter(wp => !bridgeConceptMatchesExported(wp.toLowerCase(), bridgeLower))
  );

  return computeCrossModelJaccard(cleanA, cleanB);
}

/**
 * Exported version of bridge concept matching for use in Phase 4 metrics.
 * Check if a waypoint matches a bridge concept using fuzzy matching.
 * Both inputs should be lowercased.
 */
export function bridgeConceptMatchesExported(waypoint: string, bridge: string): boolean {
  if (waypoint === bridge) return true;
  const bridgeRegex = new RegExp(`\\b${escapeRegex(bridge)}\\b`);
  if (bridgeRegex.test(waypoint)) return true;
  const tokens = waypoint.split(/[\s\-\/]+/);
  if (tokens.includes(bridge)) return true;
  return false;
}

/**
 * Compute Pearson correlation coefficient between two numeric arrays.
 * Returns null if either array has zero variance (all identical values).
 */
export function pearsonCorrelation(x: number[], y: number[]): number | null {
  if (x.length !== y.length || x.length < 2) return null;

  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);

  let ssXY = 0;
  let ssXX = 0;
  let ssYY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    ssXY += dx * dy;
    ssXX += dx * dx;
    ssYY += dy * dy;
  }

  if (ssXX === 0 || ssYY === 0) return null; // Zero variance
  return ssXY / Math.sqrt(ssXX * ssYY);
}

/**
 * Compute bridge concept frequency for a set of A→C runs.
 * Returns the fraction of runs where the bridge concept appears.
 * Uses fuzzy matching (word boundary, token matching).
 */
export function computeBridgeFrequency(
  runsAC: string[][],
  bridgeConcept: string,
): number {
  if (runsAC.length === 0) return 0;
  const bridgeLower = bridgeConcept.toLowerCase();
  let count = 0;
  for (const run of runsAC) {
    if (run.some(wp => bridgeConceptMatchesExported(wp.toLowerCase(), bridgeLower))) {
      count++;
    }
  }
  return count / runsAC.length;
}

/**
 * Compute bootstrap CI for a bridge frequency (binomial proportion).
 * Resamples runs and recomputes the proportion each time.
 */
export function bootstrapBridgeFrequencyCI(
  runsAC: string[][],
  bridgeConcept: string,
  nBootstrap = 1000,
): [number, number] {
  if (runsAC.length === 0) return [0, 0];

  const bridgeLower = bridgeConcept.toLowerCase();
  const bootstrapStats: number[] = [];

  for (let i = 0; i < nBootstrap; i++) {
    const sample: string[][] = [];
    for (let j = 0; j < runsAC.length; j++) {
      sample.push(runsAC[Math.floor(_rng() * runsAC.length)]);
    }
    let count = 0;
    for (const run of sample) {
      if (run.some(wp => bridgeConceptMatchesExported(wp.toLowerCase(), bridgeLower))) {
        count++;
      }
    }
    bootstrapStats.push(count / sample.length);
  }

  bootstrapStats.sort((a, b) => a - b);
  const lower = bootstrapStats[Math.floor(nBootstrap * 0.025)];
  const upper = bootstrapStats[Math.floor(nBootstrap * 0.975)];
  return [lower, upper];
}

// ── Phase 5: Logistic Fit & W-Shape Metrics ──────────────────────────

/**
 * Fit a logistic curve to (cueLevel, bridgeFrequency) data points.
 * Uses iterative gradient descent to find threshold and steepness parameters.
 *
 * Model: f(x) = 1 / (1 + exp(-steepness * (x - threshold)))
 *
 * @param data - Array of { cueLevel: number, bridgeFrequency: number } points
 * @returns LogisticFitResult with threshold, steepness, R², and fitted values
 */
export function fitLogistic(
  data: Array<{ cueLevel: number; bridgeFrequency: number }>,
): import("./types.ts").LogisticFitResult {
  if (data.length < 2) {
    return {
      threshold: 0,
      steepness: 0,
      r2: 0,
      fittedValues: data.map((d) => ({
        cueLevel: d.cueLevel,
        fitted: d.bridgeFrequency,
        observed: d.bridgeFrequency,
      })),
    };
  }

  // Initialize parameters
  let threshold = mean(data.map((d) => d.cueLevel));
  let steepness = 2.0;
  const learningRate = 0.01;
  const iterations = 5000;

  // Logistic function
  const logistic = (x: number, t: number, s: number) =>
    1 / (1 + Math.exp(-s * (x - t)));

  // Gradient descent
  for (let iter = 0; iter < iterations; iter++) {
    let gradT = 0;
    let gradS = 0;

    for (const d of data) {
      const predicted = logistic(d.cueLevel, threshold, steepness);
      const error = predicted - d.bridgeFrequency;
      const sigmoidDeriv = predicted * (1 - predicted);

      // For f(x) = 1/(1+exp(-s*(x-t))):
      //   df/dt = -s * sigmoid' (derivative of sigmoid w.r.t. threshold)
      //   df/ds = (x-t) * sigmoid' (derivative of sigmoid w.r.t. steepness)
      // MSE gradient: dL/dparam = error * df/dparam
      gradT += error * (-steepness) * sigmoidDeriv;
      gradS += error * (d.cueLevel - threshold) * sigmoidDeriv;
    }

    threshold -= learningRate * gradT / data.length;
    steepness -= learningRate * gradS / data.length;

    // Clamp steepness to prevent divergence
    steepness = Math.max(0.01, Math.min(50, steepness));
  }

  // Compute R²
  const meanY = mean(data.map((d) => d.bridgeFrequency));
  let ssTot = 0;
  let ssRes = 0;
  const fittedValues: import("./types.ts").LogisticFitResult["fittedValues"] = [];

  for (const d of data) {
    const fitted = logistic(d.cueLevel, threshold, steepness);
    ssTot += (d.bridgeFrequency - meanY) ** 2;
    ssRes += (d.bridgeFrequency - fitted) ** 2;
    fittedValues.push({
      cueLevel: d.cueLevel,
      fitted,
      observed: d.bridgeFrequency,
    });
  }

  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  return { threshold, steepness, r2, fittedValues };
}

/**
 * Compute the W-shape contrast statistic for a convergence profile.
 *
 * For a 7-waypoint path, the W-shape hypothesis predicts convergence peaks
 * at positions 1, ~4, and 7 (1-indexed). The contrast measures whether
 * the middle position (4, 0-indexed: 3) has higher convergence than its
 * neighbors (3 and 5, 0-indexed: 2 and 4).
 *
 * contrast = matchRate[3] - mean(matchRate[2], matchRate[4])
 *
 * Positive contrast = W-shape evidence (bridge creates third anchor)
 * Near-zero or negative = U-shape (standard dual-anchor pattern)
 *
 * @param perPositionMatchRate - Array of 7 match rates (one per waypoint position)
 * @returns W-shape contrast statistic
 */
export function computeWShapeContrast(perPositionMatchRate: number[]): number {
  if (perPositionMatchRate.length < 5) return 0;

  // For 7-waypoint paths: middle = position 3 (0-indexed), neighbors = positions 2 and 4
  const midIdx = Math.floor(perPositionMatchRate.length / 2);
  const leftIdx = midIdx - 1;
  const rightIdx = midIdx + 1;

  if (rightIdx >= perPositionMatchRate.length) return 0;

  const midValue = perPositionMatchRate[midIdx];
  const neighborMean = (perPositionMatchRate[leftIdx] + perPositionMatchRate[rightIdx]) / 2;

  return midValue - neighborMean;
}

// ── Phase 6: KS Test, Peak Detection, Positional Variance ────────────

/**
 * Compute waypoint frequency distribution from a set of runs.
 * Returns waypoints ranked by frequency (descending).
 */
export function computeWaypointFrequencies(
  runs: string[][],
): Array<{ waypoint: string; count: number; frequency: number }> {
  const freqMap = new Map<string, number>();
  for (const run of runs) {
    // Count each unique waypoint once per run
    const unique = new Set(run);
    for (const wp of unique) {
      freqMap.set(wp, (freqMap.get(wp) ?? 0) + 1);
    }
  }

  const totalRuns = runs.length;
  const entries = Array.from(freqMap.entries())
    .map(([waypoint, count]) => ({
      waypoint,
      count,
      frequency: totalRuns > 0 ? count / totalRuns : 0,
    }))
    .sort((a, b) => b.frequency - a.frequency || a.waypoint.localeCompare(b.waypoint));

  return entries;
}

/**
 * Compute Shannon entropy of a waypoint frequency distribution.
 * Uses the frequency (proportion of runs) for each waypoint.
 * Higher entropy = more uniform/diverse; lower entropy = more peaked/concentrated.
 */
export function computeSalienceEntropy(
  frequencies: Array<{ frequency: number }>,
): number {
  if (frequencies.length === 0) return 0;

  // Normalize frequencies to a proper probability distribution
  const totalFreq = frequencies.reduce((sum, f) => sum + f.frequency, 0);
  if (totalFreq === 0) return 0;

  let entropy = 0;
  for (const f of frequencies) {
    const p = f.frequency / totalFreq;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}

/**
 * Kolmogorov-Smirnov test against a uniform distribution.
 *
 * Tests whether the observed waypoint frequency distribution significantly
 * departs from uniform using a chi-squared goodness-of-fit test.
 *
 * This is more appropriate than KS for categorical frequency data.
 * Compares observed waypoint counts against the expectation that all
 * waypoints are equally likely.
 *
 * @param frequencies - Array of waypoint frequencies (each has count and frequency)
 * @param totalRuns - Total number of runs (sample size for chi-squared)
 * @returns { chiSquared: test statistic, pValue: approximate p-value, df: degrees of freedom }
 */
export function ksTestUniform(
  frequencies: Array<{ frequency: number; count?: number }>,
  totalRuns?: number,
): { d: number; pValue: number } {
  if (frequencies.length <= 1) return { d: 0, pValue: 1 };

  const k = frequencies.length; // number of categories
  const df = k - 1;

  // Determine total sample size from counts if available, else from totalRuns param
  const totalFreq = frequencies.reduce((sum, f) => sum + f.frequency, 0);
  if (totalFreq === 0) return { d: 0, pValue: 1 };

  // If we have counts, use them directly; otherwise reconstruct from frequencies
  let observedCounts: number[];
  let n: number;
  if (frequencies[0]?.count !== undefined && frequencies[0].count > 0) {
    observedCounts = frequencies.map(f => (f as { count: number }).count);
    n = observedCounts.reduce((s, c) => s + c, 0);
  } else if (totalRuns && totalRuns > 0) {
    n = totalRuns;
    observedCounts = frequencies.map(f => Math.round(f.frequency * n));
  } else {
    // Fall back: normalize frequencies to probabilities and use category count
    n = k * 10; // rough approximation
    const probs = frequencies.map(f => f.frequency / totalFreq);
    observedCounts = probs.map(p => Math.round(p * n));
  }

  // Expected count under uniform: n / k
  const expected = n / k;

  // Chi-squared statistic: sum((O_i - E_i)^2 / E_i)
  let chiSquared = 0;
  for (const obs of observedCounts) {
    chiSquared += (obs - expected) * (obs - expected) / expected;
  }

  // Approximate p-value using Wilson-Hilferty chi-squared approximation
  // P(X^2 > chiSquared) where X^2 ~ chi^2(df)
  // Using the cube-root transformation: Z ≈ ((chiSquared/df)^(1/3) - (1 - 2/(9*df))) / sqrt(2/(9*df))
  let pValue: number;
  if (df <= 0) {
    pValue = 1;
  } else {
    const z = Math.pow(chiSquared / df, 1 / 3) - (1 - 2 / (9 * df));
    const se = Math.sqrt(2 / (9 * df));
    const zScore = z / se;

    // Normal CDF approximation (Abramowitz-Stegun)
    const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
    const d = 0.3989422804014327; // 1/sqrt(2*pi)
    const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    const normalCdf = zScore >= 0
      ? 1 - d * Math.exp(-0.5 * zScore * zScore) * poly
      : d * Math.exp(-0.5 * zScore * zScore) * poly;

    pValue = 1 - normalCdf;
  }

  pValue = Math.max(0, Math.min(1, pValue));

  // Return chi-squared as 'd' for interface compatibility
  return { d: chiSquared, pValue };
}

/**
 * Compute peak-detection W-shape contrast.
 *
 * Instead of checking only the fixed midpoint (position 3 of 7),
 * finds the empirically highest bridge frequency position and computes
 * the contrast there: peakFreq - mean(leftNeighbor, rightNeighbor).
 *
 * @param perPositionBridgeFreq - Bridge frequency at each of 7 positions
 * @returns { peakContrast, peakPosition, fixedMidpointContrast }
 */
export function computePeakDetectionContrast(
  perPositionBridgeFreq: number[],
): { peakContrast: number; peakPosition: number; fixedMidpointContrast: number } {
  if (perPositionBridgeFreq.length < 3) {
    return { peakContrast: 0, peakPosition: 0, fixedMidpointContrast: 0 };
  }

  const n = perPositionBridgeFreq.length;

  // Find peak position (excluding first and last positions, which are endpoint-dominated)
  let peakPosition = 1; // start from position 1
  let peakValue = perPositionBridgeFreq[1];
  for (let i = 2; i < n - 1; i++) {
    if (perPositionBridgeFreq[i] > peakValue) {
      peakValue = perPositionBridgeFreq[i];
      peakPosition = i;
    }
  }

  // Peak contrast: peak value minus mean of neighbors
  const leftNeighbor = peakPosition > 0 ? perPositionBridgeFreq[peakPosition - 1] : 0;
  const rightNeighbor = peakPosition < n - 1 ? perPositionBridgeFreq[peakPosition + 1] : 0;
  const peakContrast = peakValue - (leftNeighbor + rightNeighbor) / 2;

  // Fixed midpoint contrast (position 3 for 7-waypoint paths)
  const midIdx = Math.floor(n / 2);
  const midValue = perPositionBridgeFreq[midIdx];
  const midLeft = midIdx > 0 ? perPositionBridgeFreq[midIdx - 1] : 0;
  const midRight = midIdx < n - 1 ? perPositionBridgeFreq[midIdx + 1] : 0;
  const fixedMidpointContrast = midValue - (midLeft + midRight) / 2;

  return { peakContrast, peakPosition, fixedMidpointContrast };
}

/**
 * Compute per-position bridge frequency for a set of runs.
 * For each position (0 to waypointCount-1), counts what fraction of runs
 * have the bridge concept at that position.
 *
 * Uses fuzzy matching (same as bridgeConceptMatchesExported).
 */
export function computePerPositionBridgeFreq(
  runs: string[][],
  bridgeConcept: string,
  waypointCount: number = 7,
): number[] {
  const bridgeLower = bridgeConcept.toLowerCase();
  const perPositionFreq: number[] = new Array(waypointCount).fill(0);

  for (const run of runs) {
    for (let pos = 0; pos < Math.min(run.length, waypointCount); pos++) {
      if (bridgeConceptMatchesExported(run[pos].toLowerCase(), bridgeLower)) {
        perPositionFreq[pos]++;
      }
    }
  }

  // Convert counts to frequencies
  const totalRuns = runs.length;
  if (totalRuns > 0) {
    for (let i = 0; i < perPositionFreq.length; i++) {
      perPositionFreq[i] /= totalRuns;
    }
  }

  return perPositionFreq;
}

/**
 * Compute positional variance (standard deviation) of modal bridge positions
 * across models for a single pair.
 */
export function computePositionalVariance(
  modalPositions: number[],
): number {
  if (modalPositions.length < 2) return 0;
  const m = mean(modalPositions);
  const variance = modalPositions.reduce((sum, pos) => sum + (pos - m) ** 2, 0) / (modalPositions.length - 1);
  return Math.sqrt(variance);
}

// ── Phase 7: Early Anchoring, Curvature, Too-Central Metrics ──────

export function computeTriangleExcess(dAB: number, dBC: number, dAC: number): number {
  return dAB + dBC - dAC;
}

/**
 * Compute cross-run distance: d(X,Y) = 1 - mean pairwise Jaccard
 * between runs (i,j) where i≠j. This is the distance metric for
 * curvature estimation — it measures how consistently models navigate
 * between two concepts.
 */
export function computeCrossRunDistance(runs: string[][]): number {
  if (runs.length < 2) return 1;
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
 * Compute bridge survival rate: fraction of runs where the bridge concept
 * appears at ANY position. Used for Part A anchoring analysis.
 */
export function computeBridgeSurvivalRate(
  runs: string[][],
  bridgeConcept: string,
): number {
  if (runs.length === 0) return 0;
  const bridgeLower = bridgeConcept.toLowerCase();
  let count = 0;
  for (const run of runs) {
    if (run.some(wp => bridgeConceptMatchesExported(wp.toLowerCase(), bridgeLower))) {
      count++;
    }
  }
  return count / runs.length;
}

/**
 * Compute mean bridge position across runs where the bridge appears.
 * Returns null if bridge never appears.
 */
export function computeMeanBridgePosition(
  runs: string[][],
  bridgeConcept: string,
): number | null {
  const bridgeLower = bridgeConcept.toLowerCase();
  const positions: number[] = [];
  for (const run of runs) {
    for (let pos = 0; pos < run.length; pos++) {
      if (bridgeConceptMatchesExported(run[pos].toLowerCase(), bridgeLower)) {
        positions.push(pos);
        break; // only first occurrence per run
      }
    }
  }
  if (positions.length === 0) return null;
  return mean(positions);
}

/**
 * Compute informational redundancy: frequency of a candidate bridge
 * on paths from A to random targets. If the bridge appears frequently
 * regardless of target, it's a high-frequency associate (informationally
 * redundant), not a navigational bridge.
 */
export function computeInformationalRedundancy(
  randomTargetRuns: string[][],
  candidateBridge: string,
): { frequency: number; ci: [number, number] } {
  if (randomTargetRuns.length === 0) return { frequency: 0, ci: [0, 0] };
  const freq = computeBridgeFrequency(randomTargetRuns, candidateBridge);
  const ci = bootstrapBridgeFrequencyCI(randomTargetRuns, candidateBridge);
  return { frequency: freq, ci };
}
