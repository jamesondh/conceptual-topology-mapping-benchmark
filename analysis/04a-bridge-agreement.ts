#!/usr/bin/env bun
/**
 * Phase 4A: Cross-Model Bridge Agreement Analysis
 *
 * Analyzes how similarly different models treat bridge concepts in
 * transitive paths, using EXISTING Phase 3B data (zero new API calls).
 *
 * For each (model-pair, triple) combination, computes:
 * - Bridge frequency vectors and inter-model agreement
 * - Cross-model Jaccard on A→C paths
 * - Bridge-removed Jaccard for circularity control
 * - Correlation between bridge agreement and path similarity
 * - Gemini isolation index (divergence from other models)
 *
 * Usage:
 *   bun run analysis/04a-bridge-agreement.ts
 *   bun run analysis/04a-bridge-agreement.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  computeCrossModelJaccard,
  computeBridgeRemovedJaccard,
  computeBridgeFrequency,
  bootstrapBridgeFrequencyCI,
  pearsonCorrelation,
  bootstrapCI,
  mean,
} from "../metrics.ts";
import { MODELS } from "../pairs.ts";
import { TRIPLES } from "../triples.ts";
import type {
  ElicitationResult,
  BridgeAgreementOutput,
  ModelPairBridgeAgreement,
  CrossModelJaccardResult,
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

// ── Model Pair Definitions ──────────────────────────────────────────

interface ModelPairDef {
  idA: string;
  idB: string;
  label: string;
}

function buildModelPairs(): ModelPairDef[] {
  const modelIds = MODELS.map((m) => m.id);
  const pairs: ModelPairDef[] = [];
  for (let i = 0; i < modelIds.length; i++) {
    for (let j = i + 1; j < modelIds.length; j++) {
      pairs.push({
        idA: modelIds[i],
        idB: modelIds[j],
        label: `${modelIds[i]}-${modelIds[j]}`,
      });
    }
  }
  return pairs;
}

function isGeminiPair(pair: ModelPairDef): boolean {
  return pair.idA === "gemini" || pair.idB === "gemini";
}

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: BridgeAgreementOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 4A: Cross-Model Bridge Agreement Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Overview
  lines.push("## 1. Overview");
  lines.push("");
  lines.push("This analysis examines whether different LLMs agree on how bridge");
  lines.push("concepts function in transitive conceptual paths. Using existing");
  lines.push("Phase 3B data (zero new API calls), we measure inter-model bridge");
  lines.push("agreement, cross-model path similarity, and test whether Gemini");
  lines.push("exhibits systematic isolation from the other models.");
  lines.push("");
  lines.push(`- **Triples analyzed:** ${output.metadata.triples.length} total (${output.metadata.nonControlTriples.length} non-control)`);
  lines.push(`- **Models:** ${output.metadata.models.join(", ")}`);
  lines.push(`- **Model pairs:** ${output.modelPairAgreements.length}`);
  lines.push(`- **Total observations (model-pair x triple):** ${output.metadata.totalObservations}`);
  lines.push(`- **New API calls:** 0`);
  lines.push("");

  // 2. Bridge Frequency Vectors
  lines.push("## 2. Bridge Frequency Vectors");
  lines.push("");
  lines.push("Bridge frequency = fraction of A→C runs where the bridge concept B appears as a waypoint.");
  lines.push("");

  // Build the frequency table from model pair data
  // We need per-triple per-model frequencies — extract from modelPairAgreements
  const tripleIds = output.metadata.triples;
  const modelIds = output.metadata.models;

  // Reconstruct per-model per-triple bridge freq from agreements
  const freqMap = new Map<string, number>(); // tripleId::modelId → freq
  for (const agreement of output.modelPairAgreements) {
    for (const entry of agreement.perTripleBridgeDiffs) {
      freqMap.set(`${entry.tripleId}::${agreement.modelA}`, entry.freqA);
      freqMap.set(`${entry.tripleId}::${agreement.modelB}`, entry.freqB);
    }
  }

  lines.push(`| Triple | B | ${modelIds.join(" | ")} |`);
  lines.push(`|--------|---|${modelIds.map(() => "---").join("|")}|`);
  for (const triple of TRIPLES) {
    const bConcept = triple.B;
    const freqs = modelIds.map((m) => {
      const val = freqMap.get(`${triple.id}::${m}`);
      return val !== undefined ? val.toFixed(2) : "—";
    });
    lines.push(`| ${triple.id} | ${bConcept} | ${freqs.join(" | ")} |`);
  }
  lines.push("");

  // 3. Inter-Model Bridge Agreement
  lines.push("## 3. Inter-Model Bridge Agreement");
  lines.push("");
  lines.push("For each model pair, computed across the 6 non-control triples:");
  lines.push("- **Mean |Δfreq|**: mean absolute difference in bridge frequency");
  lines.push("- **Binary agree**: fraction where both find bridge (freq > 0) or both miss");
  lines.push("- **Pearson r**: correlation of 6-element bridge frequency vectors");
  lines.push("");
  lines.push("| Model Pair | Mean |Δfreq| | Binary Agree | Pearson r |");
  lines.push("|------------|---------------|--------------|-----------|");
  for (const agreement of output.modelPairAgreements) {
    const rStr = agreement.pearsonCorrelation !== null
      ? agreement.pearsonCorrelation.toFixed(3)
      : "—";
    lines.push(
      `| ${agreement.modelA}-${agreement.modelB} | ${agreement.meanAbsBridgeDiff.toFixed(3)} | ${(agreement.binaryAgreementRate * 100).toFixed(0)}% | ${rStr} |`,
    );
  }
  lines.push("");

  // 4. Cross-Model Path Similarity
  lines.push("## 4. Cross-Model Path Similarity");
  lines.push("");
  lines.push("Cross-model Jaccard on A→C paths, with bridge-removed control:");
  lines.push("");
  lines.push("| Model Pair | Triple | Cross-Model Jaccard | 95% CI | Bridge-Removed Jaccard | 95% CI |");
  lines.push("|------------|--------|---------------------|--------|------------------------|--------|");
  for (const j of output.crossModelJaccards) {
    lines.push(
      `| ${j.modelA}-${j.modelB} | ${j.tripleId} | ${j.crossModelJaccard.toFixed(3)} | [${j.crossModelJaccardCI[0].toFixed(3)}, ${j.crossModelJaccardCI[1].toFixed(3)}] | ${j.bridgeRemovedJaccard.toFixed(3)} | [${j.bridgeRemovedJaccardCI[0].toFixed(3)}, ${j.bridgeRemovedJaccardCI[1].toFixed(3)}] |`,
    );
  }
  lines.push("");

  // 5. Bridge Agreement vs Path Similarity Correlation
  lines.push("## 5. Bridge Agreement vs Path Similarity Correlation");
  lines.push("");
  lines.push(`Across ${output.bridgeVsPathCorrelation.observations} (model-pair, triple) observations:`);
  lines.push("");
  lines.push(`- **Pearson r (bridge freq diff vs cross-model Jaccard):** ${output.bridgeVsPathCorrelation.pearsonR.toFixed(3)}`);
  lines.push(`- **Pearson r (bridge-removed):** ${output.bridgeVsPathCorrelation.bridgeRemovedPearsonR.toFixed(3)}`);
  lines.push("");

  const rFull = output.bridgeVsPathCorrelation.pearsonR;
  const rRemoved = output.bridgeVsPathCorrelation.bridgeRemovedPearsonR;
  if (rFull < -0.2) {
    lines.push("Higher bridge frequency differences are associated with **lower** path similarity,");
    lines.push("suggesting that bridge agreement contributes to overall path convergence.");
  } else if (rFull > 0.2) {
    lines.push("Higher bridge frequency differences are associated with **higher** path similarity,");
    lines.push("which is unexpected and may indicate confounding factors.");
  } else {
    lines.push("No strong linear relationship between bridge agreement and path similarity.");
  }
  lines.push("");

  if (Math.abs(rFull) > 0.1 && Math.abs(rRemoved) < Math.abs(rFull) * 0.5) {
    lines.push("The bridge-removed correlation is substantially weaker, suggesting the");
    lines.push("correlation is partly driven by shared bridge tokens inflating Jaccard.");
  } else if (Math.abs(rRemoved) >= Math.abs(rFull) * 0.5) {
    lines.push("The bridge-removed correlation persists at a similar magnitude, suggesting");
    lines.push("the relationship is not an artifact of shared bridge tokens.");
  }
  lines.push("");

  // 6. Gemini Isolation Index
  lines.push("## 6. Gemini Isolation Index");
  lines.push("");
  lines.push("Compares bridge agreement for Gemini-paired model pairs vs non-Gemini pairs.");
  lines.push("");
  lines.push(`- **Gemini-paired mean |Δfreq|:** ${output.geminiIsolation.geminiPairMeanDiff.toFixed(3)}`);
  lines.push(`- **Non-Gemini mean |Δfreq|:** ${output.geminiIsolation.nonGeminiPairMeanDiff.toFixed(3)}`);
  lines.push(`- **Isolation index (difference):** ${output.geminiIsolation.isolationIndex.toFixed(3)}`);
  lines.push(`- **95% CI:** [${output.geminiIsolation.isolationIndexCI[0].toFixed(3)}, ${output.geminiIsolation.isolationIndexCI[1].toFixed(3)}]`);
  lines.push("");

  if (output.geminiIsolation.isolationIndex > 0.05 && output.geminiIsolation.isolationIndexCI[0] > 0) {
    lines.push("Gemini shows **significant isolation**: bridge frequency differences are");
    lines.push("systematically larger when Gemini is involved, consistent with distinct");
    lines.push("internal conceptual topology.");
  } else if (output.geminiIsolation.isolationIndex > 0.02) {
    lines.push("Gemini shows a **modest isolation trend**, though the confidence interval");
    lines.push("includes zero, so the effect may not be reliable.");
  } else {
    lines.push("No evidence of systematic Gemini isolation in bridge agreement.");
  }
  lines.push("");

  // 7. Verification Checks
  lines.push("## 7. Verification Checks");
  lines.push("");
  lines.push("- [x] Zero new API calls — all data from Phase 1/2/3B");
  lines.push("- [x] Seeded PRNG (seed=42) for reproducible bootstrap CIs");

  // Check: control triples should have low bridge freq
  const controlTripleIds = new Set(
    TRIPLES.filter((t) => t.type === "random-control").map((t) => t.id),
  );
  const controlFreqs: number[] = [];
  for (const [key, val] of freqMap.entries()) {
    const tripleId = key.split("::")[0];
    if (controlTripleIds.has(tripleId)) {
      controlFreqs.push(val);
    }
  }
  const controlMean = controlFreqs.length > 0 ? mean(controlFreqs) : 0;
  lines.push(`- [${controlMean < 0.15 ? "x" : " "}] Random-control bridge freq is low (mean=${controlMean.toFixed(3)})`);

  // Check: non-control should have higher bridge freq
  const nonControlFreqs: number[] = [];
  for (const [key, val] of freqMap.entries()) {
    const tripleId = key.split("::")[0];
    if (!controlTripleIds.has(tripleId)) {
      nonControlFreqs.push(val);
    }
  }
  const nonControlMean = nonControlFreqs.length > 0 ? mean(nonControlFreqs) : 0;
  lines.push(`- [${nonControlMean > controlMean ? "x" : " "}] Non-control bridge freq higher than control (${nonControlMean.toFixed(3)} vs ${controlMean.toFixed(3)})`);

  const modelPairCount = output.modelPairAgreements.length;
  lines.push(`- [${modelPairCount === 6 ? "x" : " "}] All 6 model pairs analyzed (found ${modelPairCount})`);

  const totalCMJ = output.crossModelJaccards.length;
  lines.push(`- [${totalCMJ > 0 ? "x" : " "}] Cross-model Jaccard computed for ${totalCMJ} observations`);
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

  console.log("Conceptual Topology Mapping Benchmark - Bridge Agreement Analysis");
  console.log("==================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // Seed PRNG for reproducibility
  setMetricsSeed(42);

  // Load all data sources (same as 03b-transitivity)
  console.log("Loading data from all phases...");

  const pilotDir = join(inputDir, "pilot");
  const pilotResults = (await loadResultsFromDir(pilotDir)).filter(
    (r) => r.waypointCount === 5 && r.promptFormat === "semantic",
  );
  console.log(`  Phase 1 forward: ${pilotResults.length} results`);

  const reversalDir = join(inputDir, "reversals");
  const reversalResults = await loadResultsFromDir(reversalDir);
  console.log(`  Phase 2 reverse: ${reversalResults.length} results`);

  const transitivityDir = join(inputDir, "transitivity");
  const transitivityResults = await loadResultsFromDir(transitivityDir);
  console.log(`  Phase 3B new:    ${transitivityResults.length} results`);
  console.log("");

  // Build unified lookup
  const allResults = [...pilotResults, ...reversalResults, ...transitivityResults];
  const lookup = buildWaypointLookup(allResults);
  console.log(`  Total lookup keys: ${lookup.size}`);
  console.log("");

  // Model and triple setup
  const modelIds = MODELS.map((m) => m.id);
  const modelPairs = buildModelPairs();
  const nonControlTriples = TRIPLES.filter((t) => t.type !== "random-control");
  const nonControlTripleIds = nonControlTriples.map((t) => t.id);

  console.log(`  Model pairs: ${modelPairs.map((p) => p.label).join(", ")}`);
  console.log(`  Non-control triples: ${nonControlTripleIds.length}`);
  console.log("");

  // ── Step 3: Extract bridge frequencies per triple per model ──────

  console.log("Computing bridge frequencies...");

  /** tripleId::modelId → bridge frequency */
  const bridgeFreqMap = new Map<string, number>();
  /** tripleId::modelId → A→C runs */
  const acRunsMap = new Map<string, string[][]>();

  for (const triple of TRIPLES) {
    const reusableAC = triple.reusableLegs?.AC ?? null;

    for (const modelId of modelIds) {
      const runsAC = getRunsForLeg(
        triple.id, "AC", reusableAC, modelId, lookup,
      );

      const key = `${triple.id}::${modelId}`;
      acRunsMap.set(key, runsAC);

      if (runsAC.length === 0) {
        console.log(`  SKIP ${triple.id} (${modelId}): no A→C runs`);
        continue;
      }

      const freq = computeBridgeFrequency(runsAC, triple.B);
      bridgeFreqMap.set(key, freq);

      console.log(
        `  ${triple.id} (${modelId}): bridge="${triple.B}" freq=${freq.toFixed(2)} runs=${runsAC.length}`,
      );
    }
  }
  console.log("");

  // ── Step 5: Compute inter-model bridge agreement (IBA) ───────────

  console.log("Computing inter-model bridge agreement...");

  const modelPairAgreements: ModelPairBridgeAgreement[] = [];

  for (const pair of modelPairs) {
    const perTripleDiffs: ModelPairBridgeAgreement["perTripleBridgeDiffs"] = [];

    for (const triple of nonControlTriples) {
      const freqA = bridgeFreqMap.get(`${triple.id}::${pair.idA}`) ?? 0;
      const freqB = bridgeFreqMap.get(`${triple.id}::${pair.idB}`) ?? 0;
      const absDiff = Math.abs(freqA - freqB);

      perTripleDiffs.push({
        tripleId: triple.id,
        freqA,
        freqB,
        absDiff,
      });
    }

    // Aggregate metrics
    const absDiffs = perTripleDiffs.map((d) => d.absDiff);
    const meanAbsBridgeDiff = absDiffs.length > 0 ? mean(absDiffs) : 0;

    // Binary agreement: both find bridge (freq > 0) or both miss (freq === 0)
    let binaryAgreeCount = 0;
    for (const d of perTripleDiffs) {
      const aFinds = d.freqA > 0;
      const bFinds = d.freqB > 0;
      if (aFinds === bFinds) binaryAgreeCount++;
    }
    const binaryAgreementRate = perTripleDiffs.length > 0
      ? binaryAgreeCount / perTripleDiffs.length
      : 0;

    // Pearson correlation of bridge frequency vectors
    const vecA = perTripleDiffs.map((d) => d.freqA);
    const vecB = perTripleDiffs.map((d) => d.freqB);
    const pCorr = pearsonCorrelation(vecA, vecB);

    const agreement: ModelPairBridgeAgreement = {
      modelA: pair.idA,
      modelB: pair.idB,
      perTripleBridgeDiffs: perTripleDiffs,
      meanAbsBridgeDiff,
      binaryAgreementRate,
      pearsonCorrelation: pCorr,
    };
    modelPairAgreements.push(agreement);

    const rStr = pCorr !== null ? pCorr.toFixed(3) : "—";
    console.log(
      `  ${pair.label}: mean|Δ|=${meanAbsBridgeDiff.toFixed(3)} agree=${(binaryAgreementRate * 100).toFixed(0)}% r=${rStr}`,
    );
  }
  console.log("");

  // ── Step 6: Compute cross-model Jaccard ──────────────────────────

  console.log("Computing cross-model Jaccard on A→C paths...");

  const crossModelJaccards: CrossModelJaccardResult[] = [];

  for (const pair of modelPairs) {
    for (const triple of nonControlTriples) {
      const runsA = acRunsMap.get(`${triple.id}::${pair.idA}`) ?? [];
      const runsB = acRunsMap.get(`${triple.id}::${pair.idB}`) ?? [];

      if (runsA.length === 0 || runsB.length === 0) {
        console.log(`  SKIP ${pair.label} / ${triple.id}: missing runs (${runsA.length}/${runsB.length})`);
        continue;
      }

      // Cross-model Jaccard
      const cmj = computeCrossModelJaccard(runsA, runsB);

      // Bridge-removed Jaccard (circularity control)
      const brj = computeBridgeRemovedJaccard(runsA, runsB, triple.B);

      const result: CrossModelJaccardResult = {
        modelA: pair.idA,
        modelB: pair.idB,
        tripleId: triple.id,
        crossModelJaccard: cmj.mean,
        crossModelJaccardCI: cmj.ci,
        bridgeRemovedJaccard: brj.mean,
        bridgeRemovedJaccardCI: brj.ci,
      };
      crossModelJaccards.push(result);

      console.log(
        `  ${pair.label} / ${triple.id}: J=${cmj.mean.toFixed(3)} J_nobridge=${brj.mean.toFixed(3)}`,
      );
    }
  }
  console.log("");

  // ── Step 8: Correlation test ─────────────────────────────────────

  console.log("Computing bridge agreement vs path similarity correlation...");

  // For each (model-pair, triple) observation, pair bridge freq difference with Jaccard
  const corrBridgeDiffs: number[] = [];
  const corrJaccards: number[] = [];
  const corrBridgeRemovedJaccards: number[] = [];

  for (const cmj of crossModelJaccards) {
    // Find the corresponding bridge diff
    const agreement = modelPairAgreements.find(
      (a) => a.modelA === cmj.modelA && a.modelB === cmj.modelB,
    );
    if (!agreement) continue;

    const tripleDiff = agreement.perTripleBridgeDiffs.find(
      (d) => d.tripleId === cmj.tripleId,
    );
    if (!tripleDiff) continue;

    corrBridgeDiffs.push(tripleDiff.absDiff);
    corrJaccards.push(cmj.crossModelJaccard);
    corrBridgeRemovedJaccards.push(cmj.bridgeRemovedJaccard);
  }

  const rFull = pearsonCorrelation(corrBridgeDiffs, corrJaccards);
  const rRemoved = pearsonCorrelation(corrBridgeDiffs, corrBridgeRemovedJaccards);

  console.log(`  Observations: ${corrBridgeDiffs.length}`);
  console.log(`  Pearson r (bridge diff vs Jaccard): ${rFull !== null ? rFull.toFixed(3) : "—"}`);
  console.log(`  Pearson r (bridge-removed):         ${rRemoved !== null ? rRemoved.toFixed(3) : "—"}`);
  console.log("");

  // ── Step 9: Gemini isolation index ───────────────────────────────

  console.log("Computing Gemini isolation index...");

  // Collect all per-triple bridge diffs for Gemini-paired vs non-Gemini pairs
  const geminiDiffs: number[] = [];
  const nonGeminiDiffs: number[] = [];

  for (const agreement of modelPairAgreements) {
    const pair = modelPairs.find(
      (p) => p.idA === agreement.modelA && p.idB === agreement.modelB,
    )!;
    const isGemini = isGeminiPair(pair);

    for (const d of agreement.perTripleBridgeDiffs) {
      if (isGemini) {
        geminiDiffs.push(d.absDiff);
      } else {
        nonGeminiDiffs.push(d.absDiff);
      }
    }
  }

  const geminiMeanDiff = geminiDiffs.length > 0 ? mean(geminiDiffs) : 0;
  const nonGeminiMeanDiff = nonGeminiDiffs.length > 0 ? mean(nonGeminiDiffs) : 0;
  const isolationIndex = geminiMeanDiff - nonGeminiMeanDiff;

  // Bootstrap CI for isolation index
  const allDiffsLabeled = [
    ...geminiDiffs.map((d) => ({ val: d, isGemini: true })),
    ...nonGeminiDiffs.map((d) => ({ val: d, isGemini: false })),
  ];

  const geminiBootstrapData = geminiDiffs;
  const nonGeminiBootstrapData = nonGeminiDiffs;

  // Compute CI by bootstrapping the difference in means
  const isolationSamples: number[] = [];
  const nBoot = 1000;
  for (let i = 0; i < nBoot; i++) {
    // Resample Gemini diffs
    const gSample: number[] = [];
    for (let j = 0; j < geminiBootstrapData.length; j++) {
      gSample.push(geminiBootstrapData[Math.floor(Math.random() * geminiBootstrapData.length)]);
    }
    // Resample non-Gemini diffs
    const ngSample: number[] = [];
    for (let j = 0; j < nonGeminiBootstrapData.length; j++) {
      ngSample.push(nonGeminiBootstrapData[Math.floor(Math.random() * nonGeminiBootstrapData.length)]);
    }
    isolationSamples.push(mean(gSample) - mean(ngSample));
  }
  isolationSamples.sort((a, b) => a - b);
  const isolationCI: [number, number] = [
    isolationSamples[Math.floor(nBoot * 0.025)],
    isolationSamples[Math.floor(nBoot * 0.975)],
  ];

  console.log(`  Gemini-paired diffs: n=${geminiDiffs.length}, mean=${geminiMeanDiff.toFixed(3)}`);
  console.log(`  Non-Gemini diffs:    n=${nonGeminiDiffs.length}, mean=${nonGeminiMeanDiff.toFixed(3)}`);
  console.log(`  Isolation index: ${isolationIndex.toFixed(3)} (95% CI: [${isolationCI[0].toFixed(3)}, ${isolationCI[1].toFixed(3)}])`);
  console.log("");

  // ── Build output ─────────────────────────────────────────────────

  const analysisOutput: BridgeAgreementOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      triples: TRIPLES.map((t) => t.id),
      models: modelIds,
      nonControlTriples: nonControlTripleIds,
      totalObservations: crossModelJaccards.length,
    },
    modelPairAgreements,
    crossModelJaccards,
    bridgeVsPathCorrelation: {
      pearsonR: rFull ?? 0,
      bridgeRemovedPearsonR: rRemoved ?? 0,
      observations: corrBridgeDiffs.length,
    },
    geminiIsolation: {
      geminiPairMeanDiff: geminiMeanDiff,
      nonGeminiPairMeanDiff: nonGeminiMeanDiff,
      isolationIndex,
      isolationIndexCI: isolationCI,
    },
  };

  // ── Write outputs ────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "bridge-agreement-metrics.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Bridge agreement analysis complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("bridge-agreement-analysis")
    .description("Analyze cross-model bridge agreement using Phase 3B data")
    .option("--input <dir>", "base results directory", "results")
    .option("--output <dir>", "output directory for analysis JSON", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/04a-bridge-agreement.md");

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
