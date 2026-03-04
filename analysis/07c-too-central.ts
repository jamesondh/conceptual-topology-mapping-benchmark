#!/usr/bin/env bun
/**
 * Phase 7C: Too-Central Boundary Characterization Analysis
 *
 * For each Phase 7C pair x model, computes:
 * - Bridge frequency of candidateBridge
 * - Bootstrap CI on bridge frequency
 * - Too-central vs obvious-useful comparison (primary test)
 * - Boundary case classification
 * - Navigational entropy comparison by category
 * - Informational redundancy test (probe runs on random targets)
 * - Gradient vs causal-chain analysis
 * - Cross-model agreement per pair
 * - Predictions evaluation (7 predictions)
 *
 * Loads data from:
 *   results/too-central/     (new Phase 7C data)
 *   results/dimensionality/  (Phase 5B reuse for spark-ash)
 *   results/salience/        (Phase 6A reuse for hot-cold)
 *
 * Usage:
 *   bun run analysis/07c-too-central.ts
 *   bun run analysis/07c-too-central.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  seededRandom,
  bootstrapCI,
  mean,
  computeBridgeFrequency,
  bootstrapBridgeFrequencyCI,
  computeWaypointFrequencies,
  computeSalienceEntropy,
  computeInformationalRedundancy,
} from "../src/metrics.ts";
import { MODELS } from "../src/data/pairs.ts";
import { PHASE7C_PAIRS } from "../src/data/pairs-phase7.ts";
import type {
  TooCentralAnalysisOutput,
  TooCentralCategory,
  Phase7TooCentralPair,
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

// ── Gradient vs Causal-Chain classification ─────────────────────────

const GRADIENT_PAIR_IDS = new Set([
  "p7c-hot-cold",
  "p7c-infant-elderly",
  "p7c-whisper-shout",
  "p7c-dawn-dusk",
  "p7c-ice-steam",
]);

const CAUSAL_CHAIN_PAIR_IDS = new Set([
  "p7c-spark-ash",
  "p7c-acorn-timber",
  "p7c-flour-bread",
]);

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: TooCentralAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 7C: Too-Central Boundary Characterization Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Pairs analyzed:** ${output.metadata.pairs.length}`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **New runs:** ${output.metadata.totalNewRuns}`);
  lines.push(`- **Reused runs:** ${output.metadata.totalReusedRuns}`);
  lines.push(`- **Bridge frequency observations:** ${output.pairModelBridgeFreqs.length}`);
  lines.push("");

  // 2. Bridge Frequency Table
  lines.push("## 2. Bridge Frequency Table (Pair x Model)");
  lines.push("");
  lines.push("| Pair | Model | Category | Bridge | Freq | CI Low | CI High | Runs |");
  lines.push("|------|-------|----------|--------|------|--------|---------|------|");

  for (const entry of output.pairModelBridgeFreqs) {
    lines.push(
      `| ${entry.pairId} | ${entry.modelId} | ${entry.category} | ${entry.candidateBridge} ` +
      `| ${entry.bridgeFrequency.toFixed(3)} | ${entry.bridgeFrequencyCI[0].toFixed(3)} ` +
      `| ${entry.bridgeFrequencyCI[1].toFixed(3)} | ${entry.runCount} |`,
    );
  }
  lines.push("");

  // 3. Primary Test
  lines.push("## 3. Primary Test: Too-Central vs Obvious-Useful");
  lines.push("");
  const pt = output.primaryTest;
  lines.push(`- **Too-central mean freq:** ${pt.tooCentralMeanFreq.toFixed(4)} [${pt.tooCentralFreqCI[0].toFixed(4)}, ${pt.tooCentralFreqCI[1].toFixed(4)}]`);
  lines.push(`- **Obvious-useful mean freq:** ${pt.obviousUsefulMeanFreq.toFixed(4)} [${pt.obviousUsefulFreqCI[0].toFixed(4)}, ${pt.obviousUsefulFreqCI[1].toFixed(4)}]`);
  lines.push(`- **Difference (obvious - too-central):** ${pt.difference.toFixed(4)} [${pt.differenceCI[0].toFixed(4)}, ${pt.differenceCI[1].toFixed(4)}]`);
  lines.push(`- **Significantly different:** ${pt.significantlyDifferent ? "**YES**" : "**NO**"}`);
  lines.push("");

  if (pt.significantlyDifferent) {
    lines.push("**[observed]** Obvious-useful bridges have significantly higher frequency than " +
      "too-central bridges, confirming that the too-central category captures concepts that " +
      "are genuinely less navigational despite being semantically proximate.");
  } else {
    lines.push("The primary pre-registered test does not pass. The frequency difference " +
      "between too-central and obvious-useful categories is not significant.");
  }
  lines.push("");

  // 4. Boundary Case Classification
  lines.push("## 4. Boundary Case Classification");
  lines.push("");
  lines.push("| Pair | Bridge | Mean Freq | Classification |");
  lines.push("|------|--------|-----------|----------------|");

  for (const bc of output.boundaryClassification) {
    lines.push(`| ${bc.pairId} | ${bc.candidateBridge} | ${bc.meanBridgeFreq.toFixed(3)} | ${bc.classification} |`);
  }
  lines.push("");

  // 5. Navigational Entropy
  lines.push("## 5. Navigational Entropy by Category");
  lines.push("");
  const ec = output.entropyComparison;
  lines.push(`- **Too-central mean entropy:** ${ec.tooCentralMeanEntropy.toFixed(4)}`);
  lines.push(`- **Obvious-useful mean entropy:** ${ec.obviousUsefulMeanEntropy.toFixed(4)}`);
  lines.push(`- **Difference (too-central - obvious-useful):** ${ec.difference.toFixed(4)} [${ec.differenceCI[0].toFixed(4)}, ${ec.differenceCI[1].toFixed(4)}]`);
  lines.push(`- **Too-central higher entropy:** ${ec.tooCentralHigher ? "**YES**" : "**NO**"}`);
  lines.push("");

  if (ec.tooCentralHigher) {
    lines.push("**[observed]** Too-central pairs show higher navigational entropy, indicating " +
      "more diverse/uniform waypoint distributions without a dominant concept anchoring paths.");
  }
  lines.push("");

  // 6. Informational Redundancy
  lines.push("## 6. Informational Redundancy Results");
  lines.push("");
  if (output.informationalRedundancy && output.informationalRedundancy.length > 0) {
    lines.push("| Pair | Bridge | Baseline Freq (Random Paths) | CI | Redundant? |");
    lines.push("|------|--------|------------------------------|-----|------------|");

    for (const ir of output.informationalRedundancy) {
      lines.push(
        `| ${ir.pairId} | ${ir.candidateBridge} | ${ir.baselineFreqOnRandomPaths.toFixed(3)} ` +
        `| [${ir.baselineFreqCI[0].toFixed(3)}, ${ir.baselineFreqCI[1].toFixed(3)}] ` +
        `| ${ir.isRedundant ? "YES" : "NO"} |`,
      );
    }
  } else {
    lines.push("_No informational redundancy probe data available._");
  }
  lines.push("");

  // 7. Gradient vs Causal-Chain
  lines.push("## 7. Gradient vs Causal-Chain Analysis");
  lines.push("");
  if (output.gradientVsCausalChain) {
    const gc = output.gradientVsCausalChain;
    lines.push(`- **Gradient pairs mean freq:** ${gc.gradientPairsMeanFreq.toFixed(4)}`);
    lines.push(`- **Causal-chain pairs mean freq:** ${gc.causalChainPairsMeanFreq.toFixed(4)}`);
    lines.push(`- **Gradient higher:** ${gc.gradientHigher ? "**YES**" : "**NO**"}`);
    lines.push("");

    if (gc.gradientHigher) {
      lines.push("Gradient pairs (continuous spectrum) show higher bridge frequency than " +
        "causal-chain pairs (sequential process), suggesting spectrum midpoints are more " +
        "navigational than process intermediaries.");
    }
  } else {
    lines.push("_Insufficient data for gradient vs causal-chain comparison._");
  }
  lines.push("");

  // 8. Cross-Model Agreement
  lines.push("## 8. Cross-Model Agreement");
  lines.push("");
  lines.push("| Pair | Model Frequencies | SD |");
  lines.push("|------|-------------------|-----|");

  for (const cma of output.crossModelAgreement) {
    const freqStr = cma.perModelFreq.map(mf => `${mf.modelId}:${mf.frequency.toFixed(2)}`).join(", ");
    lines.push(`| ${cma.pairId} | ${freqStr} | ${cma.agreementSD.toFixed(3)} |`);
  }
  lines.push("");

  // 9. Predictions
  lines.push("## 9. Predictions Summary");
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

  console.log("Conceptual Topology Mapping Benchmark - Too-Central Boundary Analysis");
  console.log("=====================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data from multiple sources ─────────────────────────────

  console.log("Loading data from multiple sources...");

  // Phase 7C too-central data (new runs)
  const tooCentralDir = join(inputDir, "too-central");
  const tooCentralResults = await loadResultsFromDir(tooCentralDir);
  console.log(`  Too-central (7C):    ${tooCentralResults.length} results`);

  // Phase 5B dimensionality data (for spark-ash reuse)
  const dimensionalityDir = join(inputDir, "dimensionality");
  const dimensionalityResults = await loadResultsFromDir(dimensionalityDir);
  console.log(`  Dimensionality (5B): ${dimensionalityResults.length} results`);

  // Phase 6A salience data (for hot-cold reuse)
  const salienceDir = join(inputDir, "salience");
  const salienceResults = await loadResultsFromDir(salienceDir);
  console.log(`  Salience (6A):       ${salienceResults.length} results`);
  console.log("");

  // Build per-source lookups
  const tooCentralLookup = buildWaypointLookup(tooCentralResults);
  const dimensionalityLookup = buildWaypointLookup(dimensionalityResults);
  const salienceLookup = buildWaypointLookup(salienceResults);

  // Also build a unified lookup for the new 7C runs
  const allResults = [...tooCentralResults, ...dimensionalityResults, ...salienceResults];
  const unifiedLookup = buildWaypointLookup(allResults);
  console.log(`  Too-central lookup keys:    ${tooCentralLookup.size}`);
  console.log(`  Dimensionality lookup keys: ${dimensionalityLookup.size}`);
  console.log(`  Salience lookup keys:       ${salienceLookup.size}`);
  console.log(`  Unified lookup keys:        ${unifiedLookup.size}`);
  console.log("");

  // ── Resolve runs for each pair × model ──────────────────────────

  const modelIds = MODELS.map(m => m.id);

  console.log("Resolving runs per pair x model...");

  interface ResolvedRuns {
    pair: Phase7TooCentralPair;
    modelId: string;
    runs: string[][];
    isReused: boolean;
  }

  const resolvedRuns: ResolvedRuns[] = [];
  let totalReusedRuns = 0;
  let totalNewRuns = 0;

  for (const pair of PHASE7C_PAIRS) {
    for (const modelId of modelIds) {
      // First try the primary 7C lookup
      const primaryKey = `${pair.id}--fwd::${modelId}`;
      let results = tooCentralLookup.get(primaryKey) ?? [];
      let isReused = false;

      if (results.length === 0) {
        // Try alternate key without direction suffix
        const altKey = `${pair.id}::${modelId}`;
        results = tooCentralLookup.get(altKey) ?? [];
      }

      // For reuse pairs, look in prior phase data
      if (results.length === 0) {
        if (pair.id === "p7c-spark-ash") {
          // Look for runs with pair IDs containing "spark" and "ash" in Phase 5B
          for (const [key, runs] of dimensionalityLookup) {
            const pairId = key.split("::")[0];
            if (pairId.includes("spark") && pairId.includes("ash") && key.endsWith(`::${modelId}`)) {
              results = runs;
              isReused = true;
              break;
            }
          }
          // Also try direct pair ID patterns
          if (results.length === 0) {
            const dimKey = `p5b-spark-ash--fwd::${modelId}`;
            results = dimensionalityLookup.get(dimKey) ?? [];
            if (results.length > 0) isReused = true;
          }
          if (results.length === 0) {
            const dimKey2 = `p5b-spark-ash::${modelId}`;
            results = dimensionalityLookup.get(dimKey2) ?? [];
            if (results.length > 0) isReused = true;
          }
        } else if (pair.id === "p7c-hot-cold") {
          // Look for runs with pair IDs containing "hot" and "cold" in Phase 6A
          for (const [key, runs] of salienceLookup) {
            const pairId = key.split("::")[0];
            if (pairId.includes("hot") && pairId.includes("cold") && key.endsWith(`::${modelId}`)) {
              results = runs;
              isReused = true;
              break;
            }
          }
          if (results.length === 0) {
            const salKey = `p6a-hot-cold--fwd::${modelId}`;
            results = salienceLookup.get(salKey) ?? [];
            if (results.length > 0) isReused = true;
          }
          if (results.length === 0) {
            const salKey2 = `p6a-hot-cold::${modelId}`;
            results = salienceLookup.get(salKey2) ?? [];
            if (results.length > 0) isReused = true;
          }
        }
      }

      if (results.length === 0) {
        console.log(`  SKIP ${pair.id} (${modelId}): no data found`);
        continue;
      }

      const runs = waypointsOnly(results);
      if (isReused) {
        totalReusedRuns += runs.length;
      } else {
        totalNewRuns += runs.length;
      }

      resolvedRuns.push({ pair, modelId, runs, isReused });
      console.log(`  ${pair.id} (${modelId}): ${runs.length} runs${isReused ? " [reused]" : ""}`);
    }
  }
  console.log("");
  console.log(`Resolved ${resolvedRuns.length} pair x model combinations`);
  console.log(`  New runs: ${totalNewRuns}, Reused runs: ${totalReusedRuns}`);
  console.log("");

  // ── 2. Bridge Frequency per Pair/Model ────────────────────────────

  console.log("Computing bridge frequencies...");

  const pairModelBridgeFreqs: TooCentralAnalysisOutput["pairModelBridgeFreqs"] = [];

  for (const { pair, modelId, runs } of resolvedRuns) {
    const freq = computeBridgeFrequency(runs, pair.candidateBridge);
    const ci = bootstrapBridgeFrequencyCI(runs, pair.candidateBridge);

    pairModelBridgeFreqs.push({
      pairId: pair.id,
      modelId,
      category: pair.category,
      candidateBridge: pair.candidateBridge,
      bridgeFrequency: freq,
      bridgeFrequencyCI: ci,
      runCount: runs.length,
    });

    console.log(
      `  ${pair.id} (${modelId}): freq=${freq.toFixed(3)} [${ci[0].toFixed(3)}, ${ci[1].toFixed(3)}] runs=${runs.length}`,
    );
  }
  console.log("");

  // ── 3. Primary Test: Too-Central vs Obvious-Useful ────────────────

  console.log("Computing primary test (too-central vs obvious-useful)...");

  const tooCentralFreqs = pairModelBridgeFreqs
    .filter(e => e.category === "too-central")
    .map(e => e.bridgeFrequency);
  const obviousUsefulFreqs = pairModelBridgeFreqs
    .filter(e => e.category === "obvious-useful")
    .map(e => e.bridgeFrequency);

  const tooCentralMeanFreq = mean(tooCentralFreqs);
  const obviousUsefulMeanFreq = mean(obviousUsefulFreqs);
  const tooCentralFreqCI = bootstrapCI(tooCentralFreqs);
  const obviousUsefulFreqCI = bootstrapCI(obviousUsefulFreqs);

  // Bootstrap CI on difference (obvious-useful mean - too-central mean)
  const nBootstrap = 1000;
  const bootstrapDiffs: number[] = [];
  for (let i = 0; i < nBootstrap; i++) {
    const sampleTC: number[] = [];
    for (let j = 0; j < tooCentralFreqs.length; j++) {
      sampleTC.push(tooCentralFreqs[Math.floor(seededRandom() * tooCentralFreqs.length)]);
    }
    const sampleOU: number[] = [];
    for (let j = 0; j < obviousUsefulFreqs.length; j++) {
      sampleOU.push(obviousUsefulFreqs[Math.floor(seededRandom() * obviousUsefulFreqs.length)]);
    }
    bootstrapDiffs.push(mean(sampleOU) - mean(sampleTC));
  }
  bootstrapDiffs.sort((a, b) => a - b);
  const differenceCI: [number, number] = [
    bootstrapDiffs[Math.floor(nBootstrap * 0.025)],
    bootstrapDiffs[Math.floor(nBootstrap * 0.975)],
  ];
  const difference = obviousUsefulMeanFreq - tooCentralMeanFreq;

  // Significant if CI on difference excludes zero and exceeds 0.35
  const significantlyDifferent = differenceCI[0] > 0;

  console.log(`  Too-central mean: ${tooCentralMeanFreq.toFixed(4)} [${tooCentralFreqCI[0].toFixed(4)}, ${tooCentralFreqCI[1].toFixed(4)}]`);
  console.log(`  Obvious-useful mean: ${obviousUsefulMeanFreq.toFixed(4)} [${obviousUsefulFreqCI[0].toFixed(4)}, ${obviousUsefulFreqCI[1].toFixed(4)}]`);
  console.log(`  Difference: ${difference.toFixed(4)} [${differenceCI[0].toFixed(4)}, ${differenceCI[1].toFixed(4)}]`);
  console.log(`  Significantly different: ${significantlyDifferent}`);
  console.log("");

  // ── 4. Boundary Case Classification ─────────────────────────────

  console.log("Classifying boundary cases...");

  const boundaryPairs = PHASE7C_PAIRS.filter(p => p.category === "boundary");
  const boundaryClassification: TooCentralAnalysisOutput["boundaryClassification"] = [];

  for (const pair of boundaryPairs) {
    const pairFreqs = pairModelBridgeFreqs
      .filter(e => e.pairId === pair.id)
      .map(e => e.bridgeFrequency);

    if (pairFreqs.length === 0) {
      console.log(`  SKIP ${pair.id}: no data`);
      continue;
    }

    const meanFreq = mean(pairFreqs);
    let classification: "too-central" | "obvious-useful" | "intermediate";
    if (meanFreq < 0.15) {
      classification = "too-central";
    } else if (meanFreq > 0.50) {
      classification = "obvious-useful";
    } else {
      classification = "intermediate";
    }

    boundaryClassification.push({
      pairId: pair.id,
      candidateBridge: pair.candidateBridge,
      meanBridgeFreq: meanFreq,
      classification,
    });

    console.log(`  ${pair.id} (${pair.candidateBridge}): freq=${meanFreq.toFixed(3)} -> ${classification}`);
  }
  console.log("");

  // ── 5. Navigational Entropy Comparison ──────────────────────────

  console.log("Computing navigational entropy by category...");

  const tooCentralEntropies: number[] = [];
  const obviousUsefulEntropies: number[] = [];

  for (const { pair, modelId, runs } of resolvedRuns) {
    const frequencies = computeWaypointFrequencies(runs);
    const entropy = computeSalienceEntropy(frequencies);

    if (pair.category === "too-central") {
      tooCentralEntropies.push(entropy);
    } else if (pair.category === "obvious-useful") {
      obviousUsefulEntropies.push(entropy);
    }
  }

  const tooCentralMeanEntropy = mean(tooCentralEntropies);
  const obviousUsefulMeanEntropy = mean(obviousUsefulEntropies);
  const entropyDifference = tooCentralMeanEntropy - obviousUsefulMeanEntropy;

  // Bootstrap CI on entropy difference
  const bootstrapEntropyDiffs: number[] = [];
  for (let i = 0; i < nBootstrap; i++) {
    const sampleTC: number[] = [];
    for (let j = 0; j < tooCentralEntropies.length; j++) {
      sampleTC.push(tooCentralEntropies[Math.floor(seededRandom() * tooCentralEntropies.length)]);
    }
    const sampleOU: number[] = [];
    for (let j = 0; j < obviousUsefulEntropies.length; j++) {
      sampleOU.push(obviousUsefulEntropies[Math.floor(seededRandom() * obviousUsefulEntropies.length)]);
    }
    bootstrapEntropyDiffs.push(mean(sampleTC) - mean(sampleOU));
  }
  bootstrapEntropyDiffs.sort((a, b) => a - b);
  const entropyDiffCI: [number, number] = [
    bootstrapEntropyDiffs[Math.floor(nBootstrap * 0.025)],
    bootstrapEntropyDiffs[Math.floor(nBootstrap * 0.975)],
  ];
  const tooCentralHigher = entropyDiffCI[0] > 0;

  console.log(`  Too-central mean entropy: ${tooCentralMeanEntropy.toFixed(4)}`);
  console.log(`  Obvious-useful mean entropy: ${obviousUsefulMeanEntropy.toFixed(4)}`);
  console.log(`  Difference: ${entropyDifference.toFixed(4)} [${entropyDiffCI[0].toFixed(4)}, ${entropyDiffCI[1].toFixed(4)}]`);
  console.log(`  Too-central higher: ${tooCentralHigher}`);
  console.log("");

  // ── 6. Informational Redundancy Test ──────────────────────────────

  console.log("Computing informational redundancy...");

  const informationalRedundancy: TooCentralAnalysisOutput["informationalRedundancy"] = [];

  for (const pair of PHASE7C_PAIRS) {
    if (!pair.randomTargets || pair.randomTargets.length === 0) continue;

    // Collect probe runs: A→telescope, A→mountain, A→library
    const probeRuns: string[][] = [];

    for (const target of pair.randomTargets) {
      for (const modelId of modelIds) {
        // Look for probe runs in the too-central directory
        // Probe pair IDs follow the pattern: p7c-{from}-{target}
        const probePatterns = [
          `${pair.id}-probe-${target}--fwd::${modelId}`,
          `${pair.id}-probe-${target}::${modelId}`,
          `p7c-${pair.from}-${target}--fwd::${modelId}`,
          `p7c-${pair.from}-${target}::${modelId}`,
        ];

        for (const probeKey of probePatterns) {
          const probeResults = tooCentralLookup.get(probeKey);
          if (probeResults && probeResults.length > 0) {
            probeRuns.push(...waypointsOnly(probeResults));
            break;
          }
        }
      }
    }

    if (probeRuns.length > 0) {
      const redundancy = computeInformationalRedundancy(probeRuns, pair.candidateBridge);
      informationalRedundancy.push({
        pairId: pair.id,
        candidateBridge: pair.candidateBridge,
        baselineFreqOnRandomPaths: redundancy.frequency,
        baselineFreqCI: redundancy.ci,
        isRedundant: redundancy.frequency > 0.10,
      });

      console.log(
        `  ${pair.id} (${pair.candidateBridge}): baseline=${redundancy.frequency.toFixed(3)} ` +
        `[${redundancy.ci[0].toFixed(3)}, ${redundancy.ci[1].toFixed(3)}] ` +
        `redundant=${redundancy.frequency > 0.10} probeRuns=${probeRuns.length}`,
      );
    } else {
      console.log(`  ${pair.id}: no probe runs found`);
    }
  }
  console.log("");

  // ── 7. Gradient vs Causal-Chain Analysis ──────────────────────────

  console.log("Computing gradient vs causal-chain comparison...");

  const gradientFreqs = pairModelBridgeFreqs
    .filter(e => GRADIENT_PAIR_IDS.has(e.pairId))
    .map(e => e.bridgeFrequency);
  const causalChainFreqs = pairModelBridgeFreqs
    .filter(e => CAUSAL_CHAIN_PAIR_IDS.has(e.pairId))
    .map(e => e.bridgeFrequency);

  let gradientVsCausalChain: TooCentralAnalysisOutput["gradientVsCausalChain"] = null;

  if (gradientFreqs.length > 0 && causalChainFreqs.length > 0) {
    const gradientMean = mean(gradientFreqs);
    const causalChainMean = mean(causalChainFreqs);

    gradientVsCausalChain = {
      gradientPairsMeanFreq: gradientMean,
      causalChainPairsMeanFreq: causalChainMean,
      gradientHigher: gradientMean > causalChainMean,
    };

    console.log(`  Gradient mean: ${gradientMean.toFixed(4)} (n=${gradientFreqs.length})`);
    console.log(`  Causal-chain mean: ${causalChainMean.toFixed(4)} (n=${causalChainFreqs.length})`);
    console.log(`  Gradient higher: ${gradientMean > causalChainMean}`);
  } else {
    console.log("  Insufficient data for gradient vs causal-chain comparison");
  }
  console.log("");

  // ── 8. Cross-Model Agreement ──────────────────────────────────────

  console.log("Computing cross-model agreement...");

  const crossModelAgreement: TooCentralAnalysisOutput["crossModelAgreement"] = [];

  for (const pair of PHASE7C_PAIRS) {
    const pairEntries = pairModelBridgeFreqs.filter(e => e.pairId === pair.id);
    if (pairEntries.length < 2) continue;

    const perModelFreq = pairEntries.map(e => ({
      modelId: e.modelId,
      frequency: e.bridgeFrequency,
    }));

    const freqValues = perModelFreq.map(mf => mf.frequency);
    const freqMean = mean(freqValues);
    const variance = freqValues.reduce((sum, f) => sum + (f - freqMean) ** 2, 0) / (freqValues.length - 1);
    const agreementSD = Math.sqrt(Math.max(0, variance));

    crossModelAgreement.push({
      pairId: pair.id,
      perModelFreq,
      agreementSD,
    });

    const freqStr = perModelFreq.map(mf => `${mf.modelId}:${mf.frequency.toFixed(2)}`).join(", ");
    console.log(`  ${pair.id}: SD=${agreementSD.toFixed(3)} [${freqStr}]`);
  }
  console.log("");

  // ── 9. Predictions Evaluation ─────────────────────────────────────

  console.log("Evaluating predictions...");

  const predictions: TooCentralAnalysisOutput["predictions"] = [];

  // P1: Too-central pairs have bridge freq < 0.15 (mean across models)
  const tcPairMeans = PHASE7C_PAIRS
    .filter(p => p.category === "too-central")
    .map(p => {
      const freqs = pairModelBridgeFreqs.filter(e => e.pairId === p.id).map(e => e.bridgeFrequency);
      return freqs.length > 0 ? mean(freqs) : null;
    })
    .filter((v): v is number => v !== null);

  const p1AllBelow015 = tcPairMeans.length > 0 && tcPairMeans.every(f => f < 0.15);
  predictions.push({
    id: 1,
    description: "Too-central pairs have bridge freq < 0.15",
    result: tcPairMeans.length === 0 ? "insufficient data" : p1AllBelow015 ? "confirmed" : "not confirmed",
    value: tcPairMeans.length > 0 ? `mean=${mean(tcPairMeans).toFixed(3)}` : "no data",
  });

  // P2: Obvious-useful pairs have bridge freq > 0.40
  const ouPairMeans = PHASE7C_PAIRS
    .filter(p => p.category === "obvious-useful")
    .map(p => {
      const freqs = pairModelBridgeFreqs.filter(e => e.pairId === p.id).map(e => e.bridgeFrequency);
      return freqs.length > 0 ? mean(freqs) : null;
    })
    .filter((v): v is number => v !== null);

  const p2AllAbove040 = ouPairMeans.length > 0 && ouPairMeans.every(f => f > 0.40);
  predictions.push({
    id: 2,
    description: "Obvious-useful pairs have bridge freq > 0.40",
    result: ouPairMeans.length === 0 ? "insufficient data" : p2AllAbove040 ? "confirmed" : "not confirmed",
    value: ouPairMeans.length > 0 ? `mean=${mean(ouPairMeans).toFixed(3)}` : "no data",
  });

  // P3: Difference (obvious - too-central) exceeds 0.35
  const p3Exceeds = difference > 0.35 && differenceCI[0] > 0;
  predictions.push({
    id: 3,
    description: "Obvious-useful - too-central difference > 0.35, CI excludes zero",
    result: (tooCentralFreqs.length === 0 || obviousUsefulFreqs.length === 0)
      ? "insufficient data"
      : p3Exceeds ? "confirmed" : "not confirmed",
    value: `diff=${difference.toFixed(3)} [${differenceCI[0].toFixed(3)}, ${differenceCI[1].toFixed(3)}]`,
  });

  // P4: Too-central pairs have higher entropy than obvious-useful
  predictions.push({
    id: 4,
    description: "Too-central pairs have higher entropy than obvious-useful",
    result: (tooCentralEntropies.length === 0 || obviousUsefulEntropies.length === 0)
      ? "insufficient data"
      : tooCentralHigher ? "confirmed" : "not confirmed",
    value: `TC=${tooCentralMeanEntropy.toFixed(3)}, OU=${obviousUsefulMeanEntropy.toFixed(3)}`,
  });

  // P5: At least 2 of 3 too-central bridges are informationally redundant (>0.10 on random paths)
  const tcRedundant = informationalRedundancy
    ? informationalRedundancy
        .filter(ir => PHASE7C_PAIRS.find(p => p.id === ir.pairId)?.category === "too-central")
        .filter(ir => ir.isRedundant)
    : [];
  const tcTotalProbed = informationalRedundancy
    ? informationalRedundancy
        .filter(ir => PHASE7C_PAIRS.find(p => p.id === ir.pairId)?.category === "too-central")
    : [];
  predictions.push({
    id: 5,
    description: "At least 2 of 3 too-central bridges are informationally redundant",
    result: tcTotalProbed.length === 0 ? "insufficient data"
      : tcRedundant.length >= 2 ? "confirmed" : "not confirmed",
    value: `${tcRedundant.length}/${tcTotalProbed.length} redundant`,
  });

  // P6: Gradient pairs have higher bridge freq than causal-chain pairs
  predictions.push({
    id: 6,
    description: "Gradient pairs have higher bridge freq than causal-chain pairs",
    result: gradientVsCausalChain === null ? "insufficient data"
      : gradientVsCausalChain.gradientHigher ? "confirmed" : "not confirmed",
    value: gradientVsCausalChain
      ? `gradient=${gradientVsCausalChain.gradientPairsMeanFreq.toFixed(3)}, causal=${gradientVsCausalChain.causalChainPairsMeanFreq.toFixed(3)}`
      : "no data",
  });

  // P7: Cross-model agreement SD < 0.15 for at least 6 of 10 pairs
  const pairsWithLowSD = crossModelAgreement.filter(cma => cma.agreementSD < 0.15).length;
  predictions.push({
    id: 7,
    description: "Cross-model agreement SD < 0.15 for >= 6 of 10 pairs",
    result: crossModelAgreement.length < 6 ? "insufficient data"
      : pairsWithLowSD >= 6 ? "confirmed" : "not confirmed",
    value: `${pairsWithLowSD}/${crossModelAgreement.length} pairs with SD < 0.15`,
  });

  for (const pred of predictions) {
    console.log(`  P${pred.id}: ${pred.result} (${pred.value})`);
  }
  console.log("");

  // ── Build Output ───────────────────────────────────────────────────

  const analysisOutput: TooCentralAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      pairs: PHASE7C_PAIRS.map(p => p.id),
      models: MODELS.map(m => m.id),
      totalNewRuns: totalNewRuns,
      totalReusedRuns: totalReusedRuns,
    },
    pairModelBridgeFreqs,
    primaryTest: {
      tooCentralMeanFreq,
      tooCentralFreqCI,
      obviousUsefulMeanFreq,
      obviousUsefulFreqCI,
      difference,
      differenceCI,
      significantlyDifferent,
    },
    boundaryClassification,
    entropyComparison: {
      tooCentralMeanEntropy,
      obviousUsefulMeanEntropy,
      difference: entropyDifference,
      differenceCI: entropyDiffCI,
      tooCentralHigher,
    },
    informationalRedundancy: informationalRedundancy.length > 0 ? informationalRedundancy : null,
    gradientVsCausalChain,
    crossModelAgreement,
    predictions,
  };

  // ── Write Outputs ──────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "too-central-metrics.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Too-central boundary characterization analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("too-central-analysis")
    .description("Analyze too-central boundary characterization from Phase 7C data")
    .option("--input <dir>", "base results directory", "results")
    .option("--output <dir>", "output directory for analysis JSON", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/07c-too-central.md");

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
