#!/usr/bin/env bun
/**
 * Phase 6A: Navigational Salience Mapping Analysis
 *
 * For each Phase 6A pair x model, computes:
 * - Waypoint frequency distributions (rank-frequency curves)
 * - KS test against uniform distribution (heavy-tail test)
 * - Cross-model top-3 waypoint agreement (Jaccard on top-3 sets)
 * - Retroactive cue-strength calibration (Phase 5A comparison)
 * - Novel waypoint detection (>20% frequency, not previously identified)
 *
 * Loads data from:
 *   results/salience/   (Phase 6A waypoint paths)
 *
 * Usage:
 *   bun run analysis/06a-salience.ts
 *   bun run analysis/06a-salience.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  bootstrapCI,
  mean,
  computeWaypointFrequencies,
  computeSalienceEntropy,
  ksTestUniform,
} from "../src/metrics.ts";
import { computeJaccard } from "../src/canonicalize.ts";
import { MODELS } from "../src/data/pairs.ts";
import { PHASE6A_PAIRS } from "../src/data/pairs-phase6.ts";
import type {
  SalienceAnalysisOutput,
  SalienceLandscape,
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

// ── Known bridges for retroactive calibration ──────────────────────

const KNOWN_BRIDGES: Record<string, { intuitive: string; family: string }> = {
  "p6a-sun-desert": { intuitive: "heat", family: "physical-causation" },
  "p6a-seed-garden": { intuitive: "plant", family: "biological-growth" },
  "p6a-light-color": { intuitive: "spectrum", family: "optical" },
  "p6a-music-mathematics": { intuitive: "harmony", family: "cross-domain" },
  "p6a-bank-ocean": { intuitive: "river", family: "polysemy" },
  "p6a-emotion-melancholy": { intuitive: "sadness", family: "abstract-affect" },
};

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: SalienceAnalysisOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 6A: Navigational Salience Mapping Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Pairs analyzed:** ${output.metadata.pairs.length}`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **Total runs loaded:** ${output.metadata.totalRuns}`);
  lines.push(`- **Salience landscapes computed:** ${output.landscapes.length}`);
  lines.push("");

  // 2. Waypoint Frequency Distributions
  lines.push("## 2. Waypoint Frequency Distributions");
  lines.push("");
  lines.push("| Pair | Model | Unique WPs | Top-1 (freq) | Top-2 (freq) | Top-3 (freq) | Entropy | KS p-value |");
  lines.push("|------|-------|-----------|-------------|-------------|-------------|---------|-----------|");

  for (const landscape of output.landscapes) {
    const top1 = landscape.rankedWaypoints[0];
    const top2 = landscape.rankedWaypoints[1];
    const top3 = landscape.rankedWaypoints[2];
    lines.push(
      `| ${landscape.pairId} | ${landscape.modelId} | ${landscape.uniqueWaypoints} | ${top1?.waypoint ?? "\u2014"} (${top1?.frequency.toFixed(3) ?? "\u2014"}) | ${top2?.waypoint ?? "\u2014"} (${top2?.frequency.toFixed(3) ?? "\u2014"}) | ${top3?.waypoint ?? "\u2014"} (${top3?.frequency.toFixed(3) ?? "\u2014"}) | ${landscape.entropy.toFixed(3)} | ${landscape.ksTestPValue.toFixed(4)} |`,
    );
  }
  lines.push("");

  // 3. Heavy-Tail Test (KS)
  lines.push("## 3. Heavy-Tail Test (KS vs Uniform)");
  lines.push("");
  const ks = output.ksTestSummary;
  lines.push(`- **Pairs rejecting uniformity (raw p < 0.05):** ${ks.rejectingPairs} / ${ks.totalPairs}`);
  lines.push(`- **Pairs rejecting uniformity (Bonferroni p < ${(0.05 / ks.totalPairs).toFixed(4)}):** ${ks.rejectingPairsBonferroni} / ${ks.totalPairs}`);
  lines.push(`- **Primary test (>=6 of 8 reject):** ${ks.primaryTestPasses ? "**PASSES**" : "**FAILS**"}`);
  lines.push("");

  if (ks.primaryTestPasses) {
    lines.push("**[observed]** The waypoint frequency distribution for the majority of focal pairs " +
      "significantly departs from uniform, confirming heavy-tailed navigational salience structure.");
  } else {
    lines.push("The primary pre-registered test does not pass. Fewer than 6 of 8 pairs show " +
      "significantly non-uniform waypoint distributions after Bonferroni correction.");
  }
  lines.push("");

  // 4. Cross-Model Agreement
  lines.push("## 4. Cross-Model Top-3 Agreement");
  lines.push("");
  lines.push("| Pair | Mean Jaccard (top-3) | Model Pairs |");
  lines.push("|------|---------------------|-------------|");

  for (const agreement of output.crossModelAgreement) {
    const pairDetails = agreement.pairwiseJaccards
      .map(pj => `${pj.modelA}-${pj.modelB}:${pj.jaccard.toFixed(2)}`)
      .join(", ");
    lines.push(`| ${agreement.pairId} | ${agreement.meanJaccard.toFixed(3)} | ${pairDetails} |`);
  }
  lines.push("");

  // 5. Retroactive Calibration
  lines.push("## 5. Retroactive Cue-Strength Calibration");
  lines.push("");
  if (output.retroactiveCalibration.length > 0) {
    lines.push("| Pair | Family | Intuitive Top | Empirical Top | Match? |");
    lines.push("|------|--------|--------------|---------------|--------|");
    for (const cal of output.retroactiveCalibration) {
      lines.push(`| ${cal.pairId} | ${cal.family} | ${cal.intuitiveTopBridge} | ${cal.empiricalTopBridge} | ${cal.match ? "YES" : "NO"} |`);
    }
  } else {
    lines.push("_No calibration data available._");
  }
  lines.push("");

  // 6. Novel Waypoints
  lines.push("## 6. Novel Waypoint Discovery");
  lines.push("");
  if (output.novelWaypoints.length > 0) {
    lines.push("| Pair | Model | Waypoint | Frequency |");
    lines.push("|------|-------|----------|-----------|");
    for (const nw of output.novelWaypoints) {
      lines.push(`| ${nw.pairId} | ${nw.modelId} | ${nw.waypoint} | ${nw.frequency.toFixed(3)} |`);
    }
    lines.push("");
    lines.push(`**[observed]** ${output.novelWaypoints.length} novel waypoint(s) discovered at >20% frequency ` +
      "that were not previously identified as bridge concepts.");
  } else {
    lines.push("No novel waypoints discovered at >20% frequency.");
  }
  lines.push("");

  // 7. Predictions Summary
  lines.push("## 7. Predictions Summary");
  lines.push("");
  lines.push("| # | Prediction | Result |");
  lines.push("|---|------------|--------|");

  // P1: Bridge-present pairs show heavy-tailed (top wp > 30%)
  const bridgePresentLandscapes = output.landscapes.filter(l => {
    const pair = PHASE6A_PAIRS.find(p => p.id === l.pairId);
    return pair?.category === "bridge-present";
  });
  const heavyTailCount = bridgePresentLandscapes.filter(l =>
    l.rankedWaypoints.length > 0 && l.rankedWaypoints[0].frequency > 0.30
  ).length;
  const totalBridgePresent = bridgePresentLandscapes.length;
  lines.push(`| 1 | Bridge-present pairs have top waypoint >30% freq | ${heavyTailCount}/${totalBridgePresent} (${((heavyTailCount / Math.max(1, totalBridgePresent)) * 100).toFixed(0)}%) |`);

  // P2: Bridge-absent pairs have top wp < 15%
  const bridgeAbsentLandscapes = output.landscapes.filter(l => {
    const pair = PHASE6A_PAIRS.find(p => p.id === l.pairId);
    return pair?.category === "bridge-absent";
  });
  const flatCount = bridgeAbsentLandscapes.filter(l =>
    l.rankedWaypoints.length > 0 && l.rankedWaypoints[0].frequency < 0.15
  ).length;
  lines.push(`| 2 | Bridge-absent pairs have top waypoint <15% freq | ${flatCount}/${bridgeAbsentLandscapes.length} |`);

  // P3: Cross-model Jaccard ranges
  const universalPairs = output.crossModelAgreement.filter(a =>
    ["p6a-sun-desert", "p6a-light-color"].includes(a.pairId)
  );
  const variablePairs = output.crossModelAgreement.filter(a =>
    ["p6a-music-mathematics", "p6a-emotion-melancholy"].includes(a.pairId)
  );
  const universalMean = universalPairs.length > 0 ? mean(universalPairs.map(a => a.meanJaccard)) : 0;
  const variableMean = variablePairs.length > 0 ? mean(variablePairs.map(a => a.meanJaccard)) : 0;
  lines.push(`| 3 | Universal bridge Jaccard 0.40-0.70, variable 0.10-0.40 | universal=${universalMean.toFixed(2)}, variable=${variableMean.toFixed(2)} |`);

  // P4: Germination > plant on seed-garden
  const seedGardenLandscapes = output.landscapes.filter(l => l.pairId === "p6a-seed-garden");
  if (seedGardenLandscapes.length > 0) {
    const germinationWins = seedGardenLandscapes.filter(l => {
      const germFreq = l.rankedWaypoints.find(w => w.waypoint.includes("germination"))?.frequency ?? 0;
      const plantFreq = l.rankedWaypoints.find(w => w.waypoint === "plant")?.frequency ?? 0;
      return germFreq > plantFreq;
    }).length;
    lines.push(`| 4 | Germination > plant on seed->garden | ${germinationWins}/${seedGardenLandscapes.length} models |`);
  }

  // P5: Novel waypoint discovered
  lines.push(`| 5 | At least one novel waypoint at >20% freq | ${output.novelWaypoints.length > 0 ? "YES" : "NO"} |`);

  // P6: Claude most peaked, Grok flattest
  const modelEntropies = MODELS.map(m => {
    const modelLandscapes = output.landscapes.filter(l => l.modelId === m.id);
    return { modelId: m.id, meanEntropy: modelLandscapes.length > 0 ? mean(modelLandscapes.map(l => l.entropy)) : 0 };
  }).sort((a, b) => a.meanEntropy - b.meanEntropy);
  if (modelEntropies.length > 0) {
    const lowestEntropy = modelEntropies[0];
    const highestEntropy = modelEntropies[modelEntropies.length - 1];
    lines.push(`| 6 | Claude lowest entropy, Grok highest | lowest=${lowestEntropy.modelId}(${lowestEntropy.meanEntropy.toFixed(2)}), highest=${highestEntropy.modelId}(${highestEntropy.meanEntropy.toFixed(2)}) |`);
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

  console.log("Conceptual Topology Mapping Benchmark - Navigational Salience Analysis");
  console.log("======================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data ─────────────────────────────────────────────────────

  console.log("Loading salience data...");
  const salienceDir = join(inputDir, "salience");
  const allResults = await loadResultsFromDir(salienceDir);
  console.log(`  Loaded ${allResults.length} results from ${salienceDir}/`);
  console.log("");

  const lookup = buildWaypointLookup(allResults);
  console.log(`  Lookup keys: ${lookup.size}`);
  console.log("");

  // ── Compute salience landscapes per pair x model ────────────────

  console.log("Computing salience landscapes...");
  const landscapes: SalienceLandscape[] = [];
  const modelIds = MODELS.map((m) => m.id);

  // Bonferroni correction: 8 pair-level tests
  const bonferroniAlpha = 0.05 / PHASE6A_PAIRS.length;

  for (const pair of PHASE6A_PAIRS) {
    for (const modelId of modelIds) {
      const key = `${pair.id}::${modelId}`;
      const results = lookup.get(key) ?? [];

      if (results.length === 0) {
        console.log(`  SKIP ${pair.id} (${modelId}): no data`);
        continue;
      }

      const runs = waypointsOnly(results);
      const freqs = computeWaypointFrequencies(runs);
      const entropy = computeSalienceEntropy(freqs);
      const ksResult = ksTestUniform(freqs, runs.length);
      const top3 = freqs.slice(0, 3).map(f => f.waypoint);

      const landscape: SalienceLandscape = {
        pairId: pair.id,
        modelId,
        totalRuns: runs.length,
        uniqueWaypoints: freqs.length,
        rankedWaypoints: freqs,
        entropy,
        top3,
        ksTestPValue: ksResult.pValue,
        ksTestRejectsUniform: ksResult.pValue < bonferroniAlpha,
      };

      landscapes.push(landscape);

      console.log(
        `  ${pair.id} (${modelId}): ${runs.length} runs, ${freqs.length} unique wps, ` +
        `top="${freqs[0]?.waypoint ?? "N/A"}" (${freqs[0]?.frequency.toFixed(3) ?? "N/A"}), ` +
        `entropy=${entropy.toFixed(3)}, KS p=${ksResult.pValue.toFixed(4)}`
      );
    }
  }
  console.log("");
  console.log(`Computed ${landscapes.length} salience landscapes`);
  console.log("");

  // ── KS test summary ──────────────────────────────────────────────

  console.log("Computing KS test summary...");

  // Per-pair: A pair rejects uniformity only if ALL models with data
  // for that pair reject (conservative/pooled approach — avoids inflating
  // rejection count from a single model's spurious result)
  const pairRejections = new Map<string, boolean>();
  const pairRejectionsBonferroni = new Map<string, boolean>();

  for (const pair of PHASE6A_PAIRS) {
    const pairLandscapes = landscapes.filter(l => l.pairId === pair.id);
    if (pairLandscapes.length === 0) {
      pairRejections.set(pair.id, false);
      pairRejectionsBonferroni.set(pair.id, false);
      continue;
    }
    // Conservative: ALL models must reject for pair-level rejection
    const allReject = pairLandscapes.every(l => l.ksTestPValue < 0.05);
    const allRejectBonferroni = pairLandscapes.every(l => l.ksTestRejectsUniform);
    pairRejections.set(pair.id, allReject);
    pairRejectionsBonferroni.set(pair.id, allRejectBonferroni);
  }

  const rejectingPairs = Array.from(pairRejections.values()).filter(v => v).length;
  const rejectingPairsBonferroni = Array.from(pairRejectionsBonferroni.values()).filter(v => v).length;
  const primaryTestPasses = rejectingPairsBonferroni >= 6;

  console.log(`  Pairs rejecting uniformity (raw): ${rejectingPairs}/${PHASE6A_PAIRS.length}`);
  console.log(`  Pairs rejecting uniformity (Bonferroni): ${rejectingPairsBonferroni}/${PHASE6A_PAIRS.length}`);
  console.log(`  Primary test passes: ${primaryTestPasses}`);
  console.log("");

  // ── Cross-model top-3 agreement ─────────────────────────────────

  console.log("Computing cross-model top-3 agreement...");

  const crossModelAgreement: SalienceAnalysisOutput["crossModelAgreement"] = [];

  for (const pair of PHASE6A_PAIRS) {
    const pairLandscapes = landscapes.filter(l => l.pairId === pair.id);
    const pairwiseJaccards: Array<{ modelA: string; modelB: string; jaccard: number }> = [];

    for (let i = 0; i < pairLandscapes.length; i++) {
      for (let j = i + 1; j < pairLandscapes.length; j++) {
        const la = pairLandscapes[i];
        const lb = pairLandscapes[j];
        const jaccardResult = computeJaccard(la.top3, lb.top3);
        pairwiseJaccards.push({
          modelA: la.modelId,
          modelB: lb.modelId,
          jaccard: jaccardResult.similarity,
        });
      }
    }

    const meanJaccard = pairwiseJaccards.length > 0 ? mean(pairwiseJaccards.map(pj => pj.jaccard)) : 0;

    crossModelAgreement.push({
      pairId: pair.id,
      pairwiseJaccards,
      meanJaccard,
    });

    console.log(`  ${pair.id}: mean top-3 Jaccard = ${meanJaccard.toFixed(3)} (${pairwiseJaccards.length} pairs)`);
  }
  console.log("");

  // ── Retroactive cue-strength calibration ─────────────────────────

  console.log("Computing retroactive cue-strength calibration...");

  const retroactiveCalibration: SalienceAnalysisOutput["retroactiveCalibration"] = [];

  for (const [pairId, info] of Object.entries(KNOWN_BRIDGES)) {
    const pairLandscapes = landscapes.filter(l => l.pairId === pairId);
    if (pairLandscapes.length === 0) continue;

    // Pool top waypoints across all models to find empirical top bridge
    const pooledFreqs = new Map<string, number>();
    for (const landscape of pairLandscapes) {
      for (const wp of landscape.rankedWaypoints) {
        pooledFreqs.set(wp.waypoint, (pooledFreqs.get(wp.waypoint) ?? 0) + wp.frequency);
      }
    }
    // Average across models
    for (const [wp, totalFreq] of pooledFreqs) {
      pooledFreqs.set(wp, totalFreq / pairLandscapes.length);
    }

    const sorted = Array.from(pooledFreqs.entries()).sort((a, b) => b[1] - a[1]);
    const empiricalTop = sorted[0]?.[0] ?? "unknown";

    retroactiveCalibration.push({
      family: info.family,
      pairId,
      intuitiveTopBridge: info.intuitive,
      empiricalTopBridge: empiricalTop,
      match: empiricalTop.includes(info.intuitive.toLowerCase()) ||
             info.intuitive.toLowerCase().includes(empiricalTop),
    });

    console.log(`  ${pairId}: intuitive="${info.intuitive}", empirical="${empiricalTop}", match=${empiricalTop.includes(info.intuitive.toLowerCase())}`);
  }
  console.log("");

  // ── Novel waypoint detection ─────────────────────────────────────

  console.log("Detecting novel waypoints...");

  const knownBridgeSet = new Set(
    PHASE6A_PAIRS.filter(p => p.knownBridge).map(p => p.knownBridge!.toLowerCase())
  );
  // Also add common known bridges from prior phases
  const additionalKnown = new Set([
    "heat", "spectrum", "harmony", "river", "sadness", "nostalgia",
    "germination", "plant", "dog", "forest", "deposit", "bank",
    "sentence", "radiation", "light", "fire", "energy", "temperature",
    "warmth", "growth", "flower", "soil",
  ]);
  for (const k of additionalKnown) knownBridgeSet.add(k);

  const novelWaypoints: SalienceAnalysisOutput["novelWaypoints"] = [];

  for (const landscape of landscapes) {
    for (const wp of landscape.rankedWaypoints) {
      if (wp.frequency > 0.20 && !knownBridgeSet.has(wp.waypoint.toLowerCase())) {
        novelWaypoints.push({
          pairId: landscape.pairId,
          modelId: landscape.modelId,
          waypoint: wp.waypoint,
          frequency: wp.frequency,
        });
      }
    }
  }

  console.log(`  Found ${novelWaypoints.length} novel waypoints at >20% frequency`);
  for (const nw of novelWaypoints.slice(0, 10)) {
    console.log(`    ${nw.pairId} (${nw.modelId}): "${nw.waypoint}" at ${nw.frequency.toFixed(3)}`);
  }
  console.log("");

  // ── Build Output ───────────────────────────────────────────────────

  const analysisOutput: SalienceAnalysisOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      pairs: PHASE6A_PAIRS.map(p => p.id),
      models: MODELS.map(m => m.id),
      totalRuns: allResults.length,
    },
    landscapes,
    ksTestSummary: {
      totalPairs: PHASE6A_PAIRS.length,
      rejectingPairs,
      rejectingPairsBonferroni,
      primaryTestPasses,
    },
    crossModelAgreement,
    retroactiveCalibration,
    novelWaypoints,
  };

  // ── Write Outputs ──────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "salience-metrics.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Navigational salience analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("salience-analysis")
    .description("Analyze navigational salience landscapes from Phase 6A data")
    .option("--input <dir>", "base results directory", "results")
    .option("--output <dir>", "output directory for analysis JSON", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/06a-salience.md");

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
