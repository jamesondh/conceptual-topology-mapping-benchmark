#!/usr/bin/env bun
/**
 * Phase 7B: Curvature Estimation Analysis
 *
 * For each Phase 7B triangle x model, computes:
 * - Path dissimilarity distances for each leg (AB, BC, AC)
 * - Triangle inequality compliance
 * - Triangle excess (curvature estimate)
 * - Polysemous vs non-polysemous excess comparison (primary test)
 * - Distance metric validity checks (cross-model correlation)
 * - Per-model curvature profiles
 *
 * Loads data from:
 *   results/curvature/       (new Phase 7B legs)
 *   results/dimensionality/  (Phase 5B reuse: e.g. photon-heavy)
 *   results/salience/        (Phase 6A reuse: e.g. sun-desert, music-mathematics)
 *   results/cue-strength/    (Phase 5A reuse: e.g. word-paragraph)
 *
 * Usage:
 *   bun run analysis/07b-curvature.ts
 *   bun run analysis/07b-curvature.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  seededRandom,
  bootstrapCI,
  mean,
  computeCrossRunDistance,
  computeTriangleExcess,
  pearsonCorrelation,
} from "../src/metrics.ts";
import { MODELS } from "../src/data/pairs.ts";
import { PHASE7B_TRIANGLES } from "../src/data/pairs-phase7.ts";
import type {
  CurvatureAnalysisOutput,
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

// ── Leg Key Resolution ────────────────────────────────────────────

/**
 * For a given triangle, determine the pair IDs for each leg.
 * Legs are: AB (A->B), BC (B->C), AC (A->C).
 *
 * New legs use the triangle ID with a suffix (e.g. "p7b-loan-bank-river--AB").
 * Reusable legs use the prior pair ID from triangle.reusableLegs.
 *
 * Returns the lookup key pattern: pairId::modelId
 */
function getLegPairId(
  triangle: typeof PHASE7B_TRIANGLES[number],
  leg: "AB" | "BC" | "AC",
): string {
  // Check if this leg has a reusable prior pair ID
  if (triangle.reusableLegs[leg]) {
    return triangle.reusableLegs[leg];
  }
  // New leg: use triangle ID with leg suffix
  return `${triangle.id}--${leg}`;
}

/**
 * Try multiple key patterns for looking up runs in the unified lookup.
 * Different phases use different key conventions:
 *   - Phase 7B new legs: "p7b-loan-bank-river--AB::claude"
 *   - Phase 5B reuse:    "p5b-photon-heavy--fwd::claude" or "p5b-photon-heavy::claude"
 *   - Phase 6A reuse:    "p6a-sun-desert--fwd::claude" or "p6a-sun-desert::claude"
 *   - Phase 5A reuse:    "p5a-word-paragraph--fwd::claude" or "p5a-word-paragraph::claude"
 */
function lookupRuns(
  lookup: Map<string, ElicitationResult[]>,
  pairId: string,
  modelId: string,
): ElicitationResult[] {
  // Try exact key first
  const exactKey = `${pairId}::${modelId}`;
  if (lookup.has(exactKey)) return lookup.get(exactKey)!;

  // Try with --fwd suffix (common for reused legs from prior phases)
  const fwdKey = `${pairId}--fwd::${modelId}`;
  if (lookup.has(fwdKey)) return lookup.get(fwdKey)!;

  return [];
}

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: CurvatureAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 7B: Curvature Estimation Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Triangles analyzed:** ${output.metadata.triangles.length}`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **New runs:** ${output.metadata.totalNewRuns}`);
  lines.push(`- **Reused runs:** ${output.metadata.totalReusedRuns}`);
  lines.push(`- **Triangle-model combinations:** ${output.triangleModelMetrics.length}`);
  lines.push("");

  // 2. Distance Matrix
  lines.push("## 2. Distance Matrix");
  lines.push("");
  lines.push("| Triangle | Model | d(A,B) | d(B,C) | d(A,C) | Runs AB | Runs BC | Runs AC |");
  lines.push("|----------|-------|--------|--------|--------|---------|---------|---------|");

  for (const m of output.triangleModelMetrics) {
    lines.push(
      `| ${m.triangleId} | ${m.modelId} | ${m.distanceAB.toFixed(3)} | ${m.distanceBC.toFixed(3)} | ${m.distanceAC.toFixed(3)} | ${m.runCountAB} | ${m.runCountBC} | ${m.runCountAC} |`,
    );
  }
  lines.push("");

  // 3. Triangle Inequality Compliance
  lines.push("## 3. Triangle Inequality Compliance");
  lines.push("");
  const tic = output.triangleInequalityCompliance;
  lines.push(`- **Total triangle-model combinations:** ${tic.totalCombinations}`);
  lines.push(`- **Holding (d(A,C) <= d(A,B) + d(B,C)):** ${tic.holdingCount}`);
  lines.push(`- **Compliance rate:** ${(tic.complianceRate * 100).toFixed(1)}%`);
  lines.push("");
  if (tic.complianceRate > 0.85) {
    lines.push("Triangle inequality holds for the vast majority of combinations, consistent with Phase 3B (91%).");
  } else if (tic.complianceRate > 0.50) {
    lines.push("Triangle inequality holds for most combinations but with notable violations.");
  } else {
    lines.push("Triangle inequality frequently violated, suggesting the distance metric may not behave metrically.");
  }
  lines.push("");

  // 4. Curvature Estimates
  lines.push("## 4. Curvature Estimates (Triangle Excess)");
  lines.push("");
  lines.push("| Triangle | Vertex Type | Model | Excess | TI Holds |");
  lines.push("|----------|-------------|-------|--------|----------|");

  for (const m of output.triangleModelMetrics) {
    const triangle = PHASE7B_TRIANGLES.find(t => t.id === m.triangleId);
    const vType = triangle?.vertexType ?? "unknown";
    lines.push(
      `| ${m.triangleId} | ${vType} | ${m.modelId} | ${m.excess.toFixed(4)} | ${m.triangleInequalityHolds ? "yes" : "NO"} |`,
    );
  }
  lines.push("");

  // 5. Primary Test
  lines.push("## 5. Primary Test: Polysemous vs Non-Polysemous Excess");
  lines.push("");
  const pt = output.primaryTest;
  lines.push(`- **Polysemous mean excess:** ${pt.polysemousMeanExcess.toFixed(4)} [${pt.polysemousExcessCI[0].toFixed(4)}, ${pt.polysemousExcessCI[1].toFixed(4)}]`);
  lines.push(`- **Non-polysemous mean excess:** ${pt.nonPolysemousMeanExcess.toFixed(4)} [${pt.nonPolysemousExcessCI[0].toFixed(4)}, ${pt.nonPolysemousExcessCI[1].toFixed(4)}]`);
  lines.push(`- **Difference (poly - non-poly):** ${pt.difference.toFixed(4)} [${pt.differenceCI[0].toFixed(4)}, ${pt.differenceCI[1].toFixed(4)}]`);
  lines.push(`- **Significantly greater:** ${pt.significantlyGreater ? "**YES**" : "**NO**"}`);
  lines.push("");

  if (pt.significantlyGreater) {
    lines.push("**[observed]** Polysemous-vertex triangles show significantly higher excess than " +
      "non-polysemous triangles, indicating that polysemous B vertices introduce greater " +
      "navigational curvature. The detour through a polysemous concept bends the path more " +
      "than transiting through an unambiguous intermediate.");
  } else if (pt.difference > 0) {
    lines.push("Polysemous triangles show higher excess than non-polysemous, but the difference " +
      "is not statistically significant (CI includes zero).");
  } else {
    lines.push("No evidence that polysemous vertices produce higher curvature than non-polysemous ones.");
  }
  lines.push("");

  // 6. Distance Metric Validity
  lines.push("## 6. Distance Metric Validity");
  lines.push("");
  const vc = output.validityChecks;
  if (vc.semanticCorrelation !== null) {
    lines.push(`- **Semantic distance correlation:** r = ${vc.semanticCorrelation.toFixed(3)} (${vc.semanticCorrelationPass ? "PASS" : "FAIL"}, threshold r > 0.30)`);
  } else {
    lines.push("- **Semantic distance correlation:** not computed (no ground-truth semantic distances)");
  }
  if (vc.crossModelCorrelation !== null) {
    lines.push(`- **Cross-model distance correlation:** r = ${vc.crossModelCorrelation.toFixed(3)} (${vc.crossModelCorrelationPass ? "PASS" : "FAIL"}, threshold r > 0.50)`);
  } else {
    lines.push("- **Cross-model distance correlation:** not computed (insufficient data)");
  }
  lines.push(`- **Distance metric valid:** ${vc.distanceMetricValid ? "**YES**" : "**NO**"}`);
  lines.push("");

  // 7. Per-Model Curvature Profiles
  lines.push("## 7. Per-Model Curvature Profiles");
  lines.push("");
  lines.push("| Model | Polysemous Mean Excess | Non-Polysemous Mean Excess | Overall Mean Excess |");
  lines.push("|-------|------------------------|----------------------------|---------------------|");

  for (const profile of output.perModelProfiles) {
    lines.push(
      `| ${profile.modelId} | ${profile.polysemousMeanExcess.toFixed(4)} | ${profile.nonPolysemousMeanExcess.toFixed(4)} | ${profile.overallMeanExcess.toFixed(4)} |`,
    );
  }
  lines.push("");

  // 8. Predictions
  lines.push("## 8. Predictions Summary");
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

  console.log("Conceptual Topology Mapping Benchmark - Curvature Estimation Analysis");
  console.log("=====================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data from multiple sources ─────────────────────────────

  console.log("Loading data from multiple sources...");

  // Phase 7B curvature data (new runs)
  const curvatureDir = join(inputDir, "curvature");
  const curvatureResults = await loadResultsFromDir(curvatureDir);
  console.log(`  Curvature (7B):       ${curvatureResults.length} results`);

  // Phase 5B dimensionality data (reuse: e.g. photon-heavy)
  const dimensionalityDir = join(inputDir, "dimensionality");
  const dimensionalityResults = await loadResultsFromDir(dimensionalityDir);
  console.log(`  Dimensionality (5B):  ${dimensionalityResults.length} results`);

  // Phase 6A salience data (reuse: e.g. sun-desert, music-mathematics)
  const salienceDir = join(inputDir, "salience");
  const salienceResults = await loadResultsFromDir(salienceDir);
  console.log(`  Salience (6A):        ${salienceResults.length} results`);

  // Phase 5A cue-strength data (reuse: e.g. word-paragraph)
  const cueStrengthDir = join(inputDir, "cue-strength");
  const cueStrengthResults = await loadResultsFromDir(cueStrengthDir);
  console.log(`  Cue-strength (5A):    ${cueStrengthResults.length} results`);
  console.log("");

  // Build unified lookup
  const allResults = [
    ...curvatureResults,
    ...dimensionalityResults,
    ...salienceResults,
    ...cueStrengthResults,
  ];
  const lookup = buildWaypointLookup(allResults);
  console.log(`  Total lookup keys: ${lookup.size}`);
  console.log("");

  // ── Compute distances for each triangle leg ────────────────────

  const modelIds = MODELS.map(m => m.id);
  let totalNewRuns = curvatureResults.length;
  let totalReusedRuns = 0;

  console.log("Computing path dissimilarity distances...");

  type TriangleModelRecord = CurvatureAnalysisOutput["triangleModelMetrics"][number];
  const triangleModelMetrics: TriangleModelRecord[] = [];

  // Track distances per leg for cross-model correlation
  // Key: "triangleId--leg", value: { modelId: distance }
  const legDistances = new Map<string, Map<string, number>>();

  for (const triangle of PHASE7B_TRIANGLES) {
    const abPairId = getLegPairId(triangle, "AB");
    const bcPairId = getLegPairId(triangle, "BC");
    const acPairId = getLegPairId(triangle, "AC");

    for (const modelId of modelIds) {
      const abResults = lookupRuns(lookup, abPairId, modelId);
      const bcResults = lookupRuns(lookup, bcPairId, modelId);
      const acResults = lookupRuns(lookup, acPairId, modelId);

      const abRuns = waypointsOnly(abResults);
      const bcRuns = waypointsOnly(bcResults);
      const acRuns = waypointsOnly(acResults);

      // Count reused runs
      if (triangle.reusableLegs.AB) totalReusedRuns += abResults.length;
      if (triangle.reusableLegs.BC) totalReusedRuns += bcResults.length;
      if (triangle.reusableLegs.AC) totalReusedRuns += acResults.length;

      if (abRuns.length < 2 || bcRuns.length < 2 || acRuns.length < 2) {
        console.log(
          `  SKIP ${triangle.id} (${modelId}): insufficient runs ` +
          `(AB=${abRuns.length}, BC=${bcRuns.length}, AC=${acRuns.length})`,
        );
        continue;
      }

      // Compute distances
      const dAB = computeCrossRunDistance(abRuns);
      const dBC = computeCrossRunDistance(bcRuns);
      const dAC = computeCrossRunDistance(acRuns);
      const excess = computeTriangleExcess(dAB, dBC, dAC);
      const triangleInequalityHolds = dAC <= dAB + dBC + 0.001; // small epsilon

      const record: TriangleModelRecord = {
        triangleId: triangle.id,
        modelId,
        distanceAB: dAB,
        distanceBC: dBC,
        distanceAC: dAC,
        excess,
        triangleInequalityHolds,
        runCountAB: abRuns.length,
        runCountBC: bcRuns.length,
        runCountAC: acRuns.length,
      };
      triangleModelMetrics.push(record);

      // Store per-leg distances for cross-model correlation
      for (const [legLabel, dist] of [["AB", dAB], ["BC", dBC], ["AC", dAC]] as const) {
        const legKey = `${triangle.id}--${legLabel}`;
        if (!legDistances.has(legKey)) legDistances.set(legKey, new Map());
        legDistances.get(legKey)!.set(modelId, dist as number);
      }

      console.log(
        `  ${triangle.id} (${modelId}): d(AB)=${dAB.toFixed(3)} d(BC)=${dBC.toFixed(3)} ` +
        `d(AC)=${dAC.toFixed(3)} excess=${excess.toFixed(4)} TI=${triangleInequalityHolds}`,
      );
    }
  }
  console.log("");
  console.log(`Computed ${triangleModelMetrics.length} triangle-model metrics`);
  console.log("");

  // ── Triangle Inequality Compliance ──────────────────────────────

  console.log("Computing triangle inequality compliance...");

  const totalCombinations = triangleModelMetrics.length;
  const holdingCount = triangleModelMetrics.filter(m => m.triangleInequalityHolds).length;
  const complianceRate = totalCombinations > 0 ? holdingCount / totalCombinations : 0;

  console.log(`  Compliance: ${holdingCount}/${totalCombinations} = ${(complianceRate * 100).toFixed(1)}%`);
  console.log("");

  // ── Primary Test: Polysemous vs Non-Polysemous Excess ──────────

  console.log("Computing primary test (polysemous vs non-polysemous excess)...");

  const polysemousTriangleIds = new Set(
    PHASE7B_TRIANGLES.filter(t => t.vertexType === "polysemous").map(t => t.id),
  );
  const nonPolysemousTriangleIds = new Set(
    PHASE7B_TRIANGLES.filter(t => t.vertexType === "non-polysemous").map(t => t.id),
  );

  const polysemousExcesses = triangleModelMetrics
    .filter(m => polysemousTriangleIds.has(m.triangleId))
    .map(m => m.excess);
  const nonPolysemousExcesses = triangleModelMetrics
    .filter(m => nonPolysemousTriangleIds.has(m.triangleId))
    .map(m => m.excess);

  const polysemousMeanExcess = mean(polysemousExcesses);
  const nonPolysemousMeanExcess = mean(nonPolysemousExcesses);
  const polysemousExcessCI = bootstrapCI(polysemousExcesses);
  const nonPolysemousExcessCI = bootstrapCI(nonPolysemousExcesses);

  // Bootstrap CI on difference (polysemous - non-polysemous)
  const nBootstrap = 1000;
  const bootstrapDiffs: number[] = [];
  for (let i = 0; i < nBootstrap; i++) {
    const polySample: number[] = [];
    for (let j = 0; j < polysemousExcesses.length; j++) {
      polySample.push(polysemousExcesses[Math.floor(seededRandom() * polysemousExcesses.length)]);
    }
    const nonPolySample: number[] = [];
    for (let j = 0; j < nonPolysemousExcesses.length; j++) {
      nonPolySample.push(nonPolysemousExcesses[Math.floor(seededRandom() * nonPolysemousExcesses.length)]);
    }
    bootstrapDiffs.push(mean(polySample) - mean(nonPolySample));
  }
  bootstrapDiffs.sort((a, b) => a - b);
  const differenceCI: [number, number] = [
    bootstrapDiffs[Math.floor(nBootstrap * 0.025)],
    bootstrapDiffs[Math.floor(nBootstrap * 0.975)],
  ];
  const difference = polysemousMeanExcess - nonPolysemousMeanExcess;
  const significantlyGreater = differenceCI[0] > 0;

  console.log(`  Polysemous mean excess:     ${polysemousMeanExcess.toFixed(4)} [${polysemousExcessCI[0].toFixed(4)}, ${polysemousExcessCI[1].toFixed(4)}]`);
  console.log(`  Non-polysemous mean excess: ${nonPolysemousMeanExcess.toFixed(4)} [${nonPolysemousExcessCI[0].toFixed(4)}, ${nonPolysemousExcessCI[1].toFixed(4)}]`);
  console.log(`  Difference: ${difference.toFixed(4)} [${differenceCI[0].toFixed(4)}, ${differenceCI[1].toFixed(4)}]`);
  console.log(`  Significantly greater: ${significantlyGreater}`);
  console.log("");

  // ── Distance Metric Validity Checks ────────────────────────────

  console.log("Computing distance metric validity checks...");

  // Semantic correlation: skip (no ground-truth semantic distances)
  const semanticCorrelation: number | null = null;
  const semanticCorrelationPass = false;
  console.log("  Semantic correlation: skipped (no ground-truth distances)");

  // Cross-model distance correlation:
  // For each leg, we have a distance per model. Compute pairwise Pearson r
  // between models' distance vectors across all legs, then report mean r.
  const modelPairCorrelations: number[] = [];

  for (let i = 0; i < modelIds.length; i++) {
    for (let j = i + 1; j < modelIds.length; j++) {
      const modelA = modelIds[i];
      const modelB = modelIds[j];
      const distancesA: number[] = [];
      const distancesB: number[] = [];

      for (const [_legKey, modelDistMap] of legDistances) {
        const dA = modelDistMap.get(modelA);
        const dB = modelDistMap.get(modelB);
        if (dA !== undefined && dB !== undefined) {
          distancesA.push(dA);
          distancesB.push(dB);
        }
      }

      if (distancesA.length >= 3) {
        const r = pearsonCorrelation(distancesA, distancesB);
        if (r !== null) {
          modelPairCorrelations.push(r);
          console.log(`  Cross-model r(${modelA}, ${modelB}): ${r.toFixed(3)} (n=${distancesA.length})`);
        }
      }
    }
  }

  const crossModelCorrelation = modelPairCorrelations.length > 0
    ? mean(modelPairCorrelations)
    : null;
  const crossModelCorrelationPass = crossModelCorrelation !== null && crossModelCorrelation > 0.50;

  if (crossModelCorrelation !== null) {
    console.log(`  Mean cross-model r: ${crossModelCorrelation.toFixed(3)} (${crossModelCorrelationPass ? "PASS" : "FAIL"})`);
  } else {
    console.log("  Cross-model correlation: insufficient data");
  }

  // Overall validity: cross-model passes (semantic skipped)
  const distanceMetricValid = crossModelCorrelationPass;
  console.log(`  Distance metric valid: ${distanceMetricValid}`);
  console.log("");

  // ── Per-Model Curvature Profiles ───────────────────────────────

  console.log("Computing per-model curvature profiles...");

  const perModelProfiles: CurvatureAnalysisOutput["perModelProfiles"] = [];

  for (const modelId of modelIds) {
    const modelMetrics = triangleModelMetrics.filter(m => m.modelId === modelId);
    const polyMetrics = modelMetrics.filter(m => polysemousTriangleIds.has(m.triangleId));
    const nonPolyMetrics = modelMetrics.filter(m => nonPolysemousTriangleIds.has(m.triangleId));

    const polyMeanExcess = polyMetrics.length > 0 ? mean(polyMetrics.map(m => m.excess)) : 0;
    const nonPolyMeanExcess = nonPolyMetrics.length > 0 ? mean(nonPolyMetrics.map(m => m.excess)) : 0;
    const overallMeanExcess = modelMetrics.length > 0 ? mean(modelMetrics.map(m => m.excess)) : 0;

    perModelProfiles.push({
      modelId,
      polysemousMeanExcess: polyMeanExcess,
      nonPolysemousMeanExcess: nonPolyMeanExcess,
      overallMeanExcess,
    });

    console.log(
      `  ${modelId}: poly=${polyMeanExcess.toFixed(4)} nonPoly=${nonPolyMeanExcess.toFixed(4)} ` +
      `overall=${overallMeanExcess.toFixed(4)}`,
    );
  }
  console.log("");

  // ── Predictions Evaluation ─────────────────────────────────────

  console.log("Evaluating predictions...");

  const predictions: CurvatureAnalysisOutput["predictions"] = [];

  // P1: Triangle inequality compliance >= 85%
  const p1Pass = complianceRate >= 0.85;
  predictions.push({
    id: 1,
    description: "Triangle inequality compliance >= 85% (replicating Phase 3B ~91%)",
    result: totalCombinations === 0 ? "insufficient data" : p1Pass ? "confirmed" : "not confirmed",
    value: `${(complianceRate * 100).toFixed(1)}%`,
  });

  // P2: Polysemous excess > non-polysemous excess (CI excludes zero)
  predictions.push({
    id: 2,
    description: "Polysemous mean excess > non-polysemous mean excess (CI excludes zero)",
    result: polysemousExcesses.length === 0 || nonPolysemousExcesses.length === 0
      ? "insufficient data"
      : significantlyGreater ? "confirmed" : "not confirmed",
    value: `diff=${difference.toFixed(4)} [${differenceCI[0].toFixed(4)}, ${differenceCI[1].toFixed(4)}]`,
  });

  // P3: Cross-model distance correlation > 0.50
  predictions.push({
    id: 3,
    description: "Cross-model distance correlation r > 0.50",
    result: crossModelCorrelation === null
      ? "insufficient data"
      : crossModelCorrelationPass ? "confirmed" : "not confirmed",
    value: crossModelCorrelation !== null ? `r=${crossModelCorrelation.toFixed(3)}` : "N/A",
  });

  // P4: Mean excess for polysemous triangles > 0.10
  const p4MeanPoly = polysemousMeanExcess;
  predictions.push({
    id: 4,
    description: "Mean polysemous excess > 0.10 (substantial curvature from homonyms)",
    result: polysemousExcesses.length === 0
      ? "insufficient data"
      : p4MeanPoly > 0.10 ? "confirmed" : "not confirmed",
    value: `${p4MeanPoly.toFixed(4)}`,
  });

  // P5: At least one model shows polysemous excess > 2x non-polysemous excess
  const modelsWith2xExcess = perModelProfiles.filter(
    p => p.nonPolysemousMeanExcess > 0 && p.polysemousMeanExcess / p.nonPolysemousMeanExcess > 2.0,
  );
  predictions.push({
    id: 5,
    description: "At least one model shows polysemous excess > 2x non-polysemous excess",
    result: perModelProfiles.length === 0
      ? "insufficient data"
      : modelsWith2xExcess.length > 0 ? "confirmed" : "not confirmed",
    value: modelsWith2xExcess.length > 0
      ? modelsWith2xExcess.map(m => m.modelId).join(", ")
      : "none",
  });

  // P6: Gemini shows highest overall curvature (most excess)
  const sortedByExcess = [...perModelProfiles].sort(
    (a, b) => b.overallMeanExcess - a.overallMeanExcess,
  );
  const highestExcessModel = sortedByExcess.length > 0 ? sortedByExcess[0].modelId : "N/A";
  predictions.push({
    id: 6,
    description: "Gemini shows highest overall mean excess (most curvature)",
    result: perModelProfiles.length === 0
      ? "insufficient data"
      : highestExcessModel === "gemini" ? "confirmed" : "not confirmed",
    value: `highest=${highestExcessModel} (${sortedByExcess.length > 0 ? sortedByExcess[0].overallMeanExcess.toFixed(4) : "N/A"})`,
  });

  for (const pred of predictions) {
    console.log(`  P${pred.id}: ${pred.result} — ${pred.value}`);
  }
  console.log("");

  // ── Build Output ───────────────────────────────────────────────────

  const analysisOutput: CurvatureAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      triangles: PHASE7B_TRIANGLES.map(t => t.id),
      models: MODELS.map(m => m.id),
      totalNewRuns: totalNewRuns,
      totalReusedRuns: totalReusedRuns,
    },
    validityChecks: {
      semanticCorrelation,
      semanticCorrelationPass,
      crossModelCorrelation,
      crossModelCorrelationPass,
      distanceMetricValid,
    },
    triangleModelMetrics,
    primaryTest: {
      polysemousMeanExcess,
      polysemousExcessCI,
      nonPolysemousMeanExcess,
      nonPolysemousExcessCI,
      difference,
      differenceCI,
      significantlyGreater,
    },
    triangleInequalityCompliance: {
      totalCombinations,
      holdingCount,
      complianceRate,
    },
    perModelProfiles,
    predictions,
  };

  // ── Write Outputs ──────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "curvature-metrics.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Curvature estimation analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("curvature-analysis")
    .description("Analyze curvature estimation from Phase 7B triangle data")
    .option("--input <dir>", "base results directory", "results")
    .option("--output <dir>", "output directory for analysis JSON", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/07b-curvature.md");

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
