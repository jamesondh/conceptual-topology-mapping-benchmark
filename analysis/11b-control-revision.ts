#!/usr/bin/env bun
/**
 * Phase 11B: Control Pair Revision Analysis
 *
 * Analyzes screening and validation results for 4 control pair candidates
 * to replace or supplement stapler-monsoon (which failed R5 for new models).
 *
 * Loads data from:
 *   results/control-revision/    (Phase 11B screening + validation data)
 *   results/pilot/               (Phase 1 original stapler-monsoon data)
 *   results/model-generality/    (Phase 10A stapler-monsoon data)
 *   results/expanded-generality/ (Phase 11A stapler-monsoon data)
 *
 * Zero API calls — pure offline analysis.
 *
 * Usage:
 *   bun run analysis/11b-control-revision.ts
 *   bun run analysis/11b-control-revision.ts --input results --output results/analysis
 */

import { Command } from "commander";
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  setMetricsSeed,
  mean,
  bootstrapCI,
  computeWaypointFrequencies,
  computeSalienceEntropy,
} from "../src/metrics.ts";
import {
  PHASE11B_CONTROL_CANDIDATES,
  CONTROL_SCREENING_THRESHOLDS,
} from "../src/data/pairs-phase11.ts";
import { MODELS, NEW_MODELS, PHASE11_MODELS } from "../src/data/pairs.ts";
import type {
  ElicitationResult,
  Phase11ControlRevisionOutput,
  ControlScreeningResult,
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

// ── Findings Report ─────────────────────────────────────────────────

function generateFindings(output: Phase11ControlRevisionOutput): string {
  const lines: string[] = [];

  lines.push("# Phase 11B: Control Pair Revision Findings");
  lines.push("");
  lines.push(`> Generated: ${output.metadata.timestamp}`);
  lines.push("");

  // 1. Experiment Overview
  lines.push("## 1. Experiment Overview");
  lines.push("");
  lines.push(`- **Candidates tested:** ${output.metadata.candidates.join(", ")}`);
  lines.push(`- **Screening models:** ${output.metadata.screeningModels.join(", ")}`);
  lines.push(`- **Total screening runs:** ${output.metadata.totalScreeningRuns}`);
  lines.push(`- **Total validation runs:** ${output.metadata.totalValidationRuns}`);
  lines.push("");

  // 2. Screening Results
  lines.push("## 2. Screening Results");
  lines.push("");
  lines.push("### Per candidate x model");
  lines.push("");
  lines.push("| Candidate | Model | Top Waypoint | Top Freq | Entropy | Freq Gate | Entropy Gate |");
  lines.push("|-----------|-------|-------------|----------|---------|-----------|--------------|");

  for (const sr of output.screeningResults) {
    lines.push(
      `| ${sr.candidateId} | ${sr.modelId} | ${sr.topWaypoint} | ${sr.topFrequency.toFixed(3)} | ${sr.entropy.toFixed(2)} | ${sr.passesFrequencyGate ? "PASS" : "FAIL"} | ${sr.passesEntropyGate ? "PASS" : "FAIL"} |`,
    );
  }
  lines.push("");

  // 3. Screening Summary
  lines.push("## 3. Screening Summary");
  lines.push("");
  lines.push("| Candidate | Models Pass Freq | Models Pass Entropy | Overall Pass | Max Top Freq | Min Entropy |");
  lines.push("|-----------|-----------------|--------------------|--------------|--------------|-----------| ");

  for (const ss of output.screeningSummary) {
    lines.push(
      `| ${ss.candidateId} | ${ss.modelsPassingFrequency}/${ss.totalModels} | ${ss.modelsPassingEntropy}/${ss.totalModels} | ${ss.overallPass ? "**PASS**" : "FAIL"} | ${ss.maxTopFrequency.toFixed(3)} | ${ss.minEntropy.toFixed(2)} |`,
    );
  }
  lines.push("");

  // 4. Validation Results
  if (output.validationResults.length > 0) {
    lines.push("## 4. Validation Results");
    lines.push("");
    lines.push("| Candidate | Model | Top Waypoint | Top Freq | Entropy | Unique WPs | Passes |");
    lines.push("|-----------|-------|-------------|----------|---------|------------|--------|");

    for (const vr of output.validationResults) {
      lines.push(
        `| ${vr.candidateId} | ${vr.modelId} | ${vr.topWaypoint} | ${vr.topFrequency.toFixed(3)} | ${vr.entropy.toFixed(2)} | ${vr.uniqueWaypoints} | ${vr.passesControl ? "**YES**" : "no"} |`,
      );
    }
    lines.push("");

    // 5. Validation Summary
    lines.push("## 5. Validation Summary");
    lines.push("");
    lines.push("| Candidate | Models Passing | Mean Top Freq | Mean Entropy | Recommended |");
    lines.push("|-----------|--------------|--------------|--------------|-------------|");

    for (const vs of output.validationSummary) {
      lines.push(
        `| ${vs.candidateId} | ${vs.modelsPassingControl}/${vs.totalModels} | ${vs.meanTopFrequency.toFixed(3)} | ${vs.meanEntropy.toFixed(2)} | ${vs.recommended ? "**YES**" : "no"} |`,
      );
    }
    lines.push("");
  }

  // 6. Stapler-Monsoon Retrospective
  lines.push("## 6. Stapler-Monsoon Retrospective");
  lines.push("");
  lines.push("| Model | Cohort | Top Waypoint | Top Freq | Entropy | Passes R5 |");
  lines.push("|-------|--------|-------------|----------|---------|-----------|");

  for (const sm of output.staplerMonsoonRetrospective) {
    lines.push(
      `| ${sm.modelId} | ${sm.cohort} | ${sm.topWaypoint} | ${sm.topFrequency.toFixed(3)} | ${sm.entropy.toFixed(2)} | ${sm.passesR5 ? "YES" : "**NO**"} |`,
    );
  }
  lines.push("");

  // 7. R5 Recommendation
  lines.push("## 7. R5 Revision Recommendation");
  lines.push("");
  lines.push(`- **Recommended controls:** ${output.r5Recommendation.recommendedControls.join(", ") || "(none)"}`);
  lines.push(`- **Passing candidates:** ${output.r5Recommendation.passingCandidateCount}`);
  lines.push(`- **Rationale:** ${output.r5Recommendation.rationale}`);
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

  const confirmed = output.predictions.filter((p) => p.result === "confirmed").length;
  lines.push(`**Predictions confirmed:** ${confirmed} of ${output.predictions.length}`);
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

  console.log("Conceptual Topology Mapping Benchmark - Control Pair Revision Analysis (Phase 11B)");
  console.log("==================================================================================");
  console.log("");
  console.log(`Input directory:  ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Findings output:  ${findingsPath}`);
  console.log("");

  // ── Load data from multiple sources ─────────────────────────────

  console.log("Loading data from multiple sources...");

  const screeningDir = join(inputDir, "control-revision", "screening");
  const screeningRawResults = await loadResultsFromDir(screeningDir);
  console.log(`  Screening (11B):        ${screeningRawResults.length} results`);

  const validationDir = join(inputDir, "control-revision", "validation");
  const validationRawResults = await loadResultsFromDir(validationDir);
  console.log(`  Validation (11B):       ${validationRawResults.length} results`);

  const pilotDir = join(inputDir, "pilot");
  const pilotResults = await loadResultsFromDir(pilotDir);
  console.log(`  Pilot (Phase 1):        ${pilotResults.length} results`);

  const generalityDir = join(inputDir, "model-generality");
  const generalityResults = await loadResultsFromDir(generalityDir);
  console.log(`  Model generality (10A): ${generalityResults.length} results`);

  const expandedDir = join(inputDir, "expanded-generality");
  const expandedResults = await loadResultsFromDir(expandedDir);
  console.log(`  Expanded gen. (11A):    ${expandedResults.length} results`);
  console.log("");

  // Build lookups — screening and validation loaded separately to avoid data contamination
  const screeningLookup = buildWaypointLookup(screeningRawResults);
  const validationLookup = buildWaypointLookup(validationRawResults);
  const pilotLookup = buildWaypointLookup(pilotResults);
  const generalityLookup = buildWaypointLookup(generalityResults);
  const expandedLookup = buildWaypointLookup(expandedResults);

  console.log(`  Screening lookup keys:  ${screeningLookup.size}`);
  console.log(`  Validation lookup keys: ${validationLookup.size}`);
  console.log(`  Pilot lookup keys:      ${pilotLookup.size}`);
  console.log(`  Generality lookup keys: ${generalityLookup.size}`);
  console.log(`  Expanded lookup keys:   ${expandedLookup.size}`);
  console.log("");

  // All models that participate in screening (original 4 + Phase 10A + Phase 11A)
  const allModels = [...MODELS, ...NEW_MODELS, ...PHASE11_MODELS];
  const allModelIds = allModels.map((m) => m.id);
  const candidateIds = PHASE11B_CONTROL_CANDIDATES.map((c) => c.id);

  // ── Step 1: Screening analysis per candidate x model ──────────

  console.log("Step 1: Screening analysis per candidate x model...");

  const screeningResults: ControlScreeningResult[] = [];

  for (const candidate of PHASE11B_CONTROL_CANDIDATES) {
    for (const modelId of allModelIds) {
      const key = `${candidate.id}::${modelId}`;
      const results = screeningLookup.get(key) ?? [];
      const runs = waypointsOnly(results);

      if (runs.length === 0) continue;

      const freqs = computeWaypointFrequencies(runs);
      const topWaypoint = freqs.length > 0 ? freqs[0].waypoint : "(none)";
      const topFrequency = freqs.length > 0 ? freqs[0].frequency : 0;
      const entropy = computeSalienceEntropy(freqs);

      const passesFrequencyGate = topFrequency < CONTROL_SCREENING_THRESHOLDS.maxTopFrequency;
      const passesEntropyGate = entropy > CONTROL_SCREENING_THRESHOLDS.minEntropy;

      screeningResults.push({
        candidateId: candidate.id,
        modelId,
        topWaypoint,
        topFrequency,
        entropy,
        runCount: runs.length,
        passesFrequencyGate,
        passesEntropyGate,
      });

      console.log(
        `  ${candidate.id} / ${modelId}: top="${topWaypoint}" freq=${topFrequency.toFixed(3)} entropy=${entropy.toFixed(2)} freqGate=${passesFrequencyGate} entropyGate=${passesEntropyGate} (${runs.length} runs)`,
      );
    }
  }
  console.log("");

  // ── Step 2: Screening summary per candidate ───────────────────

  console.log("Step 2: Screening summary per candidate...");

  const screeningSummary: Phase11ControlRevisionOutput["screeningSummary"] = [];

  for (const candidate of PHASE11B_CONTROL_CANDIDATES) {
    const candidateScreening = screeningResults.filter((sr) => sr.candidateId === candidate.id);
    const totalModels = candidateScreening.length;
    const modelsPassingFrequency = candidateScreening.filter((sr) => sr.passesFrequencyGate).length;
    const modelsPassingEntropy = candidateScreening.filter((sr) => sr.passesEntropyGate).length;
    const modelsPassingBoth = candidateScreening.filter(
      (sr) => sr.passesFrequencyGate && sr.passesEntropyGate,
    ).length;
    const overallPass = modelsPassingBoth >= CONTROL_SCREENING_THRESHOLDS.minModelsPass;
    const maxTopFrequency = candidateScreening.length > 0
      ? Math.max(...candidateScreening.map((sr) => sr.topFrequency))
      : 0;
    const minEntropy = candidateScreening.length > 0
      ? Math.min(...candidateScreening.map((sr) => sr.entropy))
      : 0;

    screeningSummary.push({
      candidateId: candidate.id,
      modelsPassingFrequency,
      modelsPassingEntropy,
      totalModels,
      overallPass,
      maxTopFrequency,
      minEntropy,
    });

    console.log(
      `  ${candidate.id}: freq=${modelsPassingFrequency}/${totalModels} entropy=${modelsPassingEntropy}/${totalModels} both=${modelsPassingBoth} overall=${overallPass ? "PASS" : "FAIL"}`,
    );
  }
  console.log("");

  const passingCandidateIds = screeningSummary
    .filter((ss) => ss.overallPass)
    .map((ss) => ss.candidateId);

  // ── Step 3: Validation analysis for passing candidates ────────

  console.log("Step 3: Validation analysis for passing candidates...");

  const validationResults: Phase11ControlRevisionOutput["validationResults"] = [];

  for (const candidateId of passingCandidateIds) {
    for (const modelId of allModelIds) {
      const key = `${candidateId}::${modelId}`;
      const results = validationLookup.get(key) ?? [];
      const runs = waypointsOnly(results);

      if (runs.length === 0) continue;

      const freqs = computeWaypointFrequencies(runs);
      const topWaypoint = freqs.length > 0 ? freqs[0].waypoint : "(none)";
      const topFrequency = freqs.length > 0 ? freqs[0].frequency : 0;
      const entropy = computeSalienceEntropy(freqs);
      const uniqueWaypoints = freqs.length;

      // Strict validation: no single waypoint > 0.10
      const passesControl = topFrequency <= 0.10;

      validationResults.push({
        candidateId,
        modelId,
        topWaypoint,
        topFrequency,
        entropy,
        uniqueWaypoints,
        runCount: runs.length,
        passesControl,
      });

      console.log(
        `  ${candidateId} / ${modelId}: top="${topWaypoint}" freq=${topFrequency.toFixed(3)} entropy=${entropy.toFixed(2)} unique=${uniqueWaypoints} passes=${passesControl}`,
      );
    }
  }
  console.log("");

  // ── Step 4: Validation summary per passing candidate ──────────

  console.log("Step 4: Validation summary...");

  const validationSummary: Phase11ControlRevisionOutput["validationSummary"] = [];

  for (const candidateId of passingCandidateIds) {
    const candidateValidation = validationResults.filter((vr) => vr.candidateId === candidateId);
    const totalModels = candidateValidation.length;
    const modelsPassingControl = candidateValidation.filter((vr) => vr.passesControl).length;
    const meanTopFrequency = totalModels > 0
      ? mean(candidateValidation.map((vr) => vr.topFrequency))
      : 0;
    const meanEntropy = totalModels > 0
      ? mean(candidateValidation.map((vr) => vr.entropy))
      : 0;
    // Recommend only if ALL models pass strict validation (matches experiment script)
    const recommended = totalModels > 0 && modelsPassingControl === totalModels;

    validationSummary.push({
      candidateId,
      modelsPassingControl,
      totalModels,
      meanTopFrequency,
      meanEntropy,
      recommended,
    });

    console.log(
      `  ${candidateId}: passing=${modelsPassingControl}/${totalModels} meanTopFreq=${meanTopFrequency.toFixed(3)} meanEntropy=${meanEntropy.toFixed(2)} recommended=${recommended}`,
    );
  }
  console.log("");

  // ── Step 5: Retrospective stapler-monsoon analysis ────────────

  console.log("Step 5: Retrospective stapler-monsoon analysis...");

  const staplerMonsoonRetrospective: Phase11ControlRevisionOutput["staplerMonsoonRetrospective"] = [];

  // Stapler-monsoon pair IDs across phases
  const staplerPairIds: Array<{ pairId: string; lookup: Map<string, ElicitationResult[]>; cohort: string; modelIds: string[] }> = [
    { pairId: "control-random-stapler-monsoon", lookup: pilotLookup, cohort: "original", modelIds: MODELS.map((m) => m.id) },
    { pairId: "p10a-stapler-monsoon", lookup: generalityLookup, cohort: "phase10a", modelIds: NEW_MODELS.map((m) => m.id) },
    { pairId: "p11a-stapler-monsoon", lookup: expandedLookup, cohort: "phase11a", modelIds: PHASE11_MODELS.map((m) => m.id) },
  ];

  for (const { pairId, lookup, cohort, modelIds } of staplerPairIds) {
    for (const modelId of modelIds) {
      const key = `${pairId}::${modelId}`;
      const results = lookup.get(key) ?? [];
      const runs = waypointsOnly(results);

      if (runs.length === 0) continue;

      const freqs = computeWaypointFrequencies(runs);
      const topWaypoint = freqs.length > 0 ? freqs[0].waypoint : "(none)";
      const topFrequency = freqs.length > 0 ? freqs[0].frequency : 0;
      const entropy = computeSalienceEntropy(freqs);
      const passesR5 = topFrequency <= 0.10;

      staplerMonsoonRetrospective.push({
        modelId,
        topWaypoint,
        topFrequency,
        entropy,
        passesR5,
        cohort,
      });

      console.log(
        `  ${modelId} (${cohort}): top="${topWaypoint}" freq=${topFrequency.toFixed(3)} entropy=${entropy.toFixed(2)} passes=${passesR5}`,
      );
    }
  }
  console.log("");

  // ── Step 6: R5 revision recommendation ────────────────────────

  console.log("Step 6: R5 revision recommendation...");

  const recommendedControls = validationSummary
    .filter((vs) => vs.recommended)
    .map((vs) => vs.candidateId);

  const passingCount = passingCandidateIds.length;

  let rationale: string;
  if (recommendedControls.length >= 2) {
    rationale =
      `${recommendedControls.length} candidates pass both screening and validation. ` +
      `Recommend adopting these as a multi-control battery with distributional validation ` +
      `(no single waypoint > 0.10, entropy > 5.0) to replace the single stapler-monsoon control.`;
  } else if (recommendedControls.length === 1) {
    rationale =
      `Only 1 candidate passes full validation. Recommend adopting it alongside stapler-monsoon ` +
      `(which still works for original 4 models) as a dual-control design.`;
  } else if (passingCount > 0) {
    rationale =
      `${passingCount} candidates pass screening but none pass strict validation. ` +
      `Consider relaxing the validation threshold or testing additional candidates.`;
  } else {
    rationale =
      `No candidates pass screening. Control pair design needs fundamental revision. ` +
      `Consider using multi-pair control batteries or non-binary control criteria.`;
  }

  const r5Recommendation: Phase11ControlRevisionOutput["r5Recommendation"] = {
    recommendedControls,
    rationale,
    passingCandidateCount: passingCount,
  };

  console.log(`  Recommended: ${recommendedControls.join(", ") || "(none)"}`);
  console.log(`  Rationale: ${rationale}`);
  console.log("");

  // ── Step 7: Predictions evaluation ────────────────────────────

  console.log("Step 7: Evaluating predictions...");

  const predictions: Phase11ControlRevisionOutput["predictions"] = [];
  const hasScreeningData = screeningResults.length > 0;

  // P1: At least 2 of 4 candidates pass screening
  const p1Pass = passingCount >= 2;
  predictions.push({
    id: 1,
    description: "At least 2 of 4 candidates pass screening",
    result: hasScreeningData
      ? (p1Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `${passingCount} of ${candidateIds.length} pass screening`,
  });

  // P2: Turmeric-trigonometry and magnesium-ballet are strongest
  const turmericPasses = passingCandidateIds.includes("p11b-turmeric-trigonometry");
  const magnesiumPasses = passingCandidateIds.includes("p11b-magnesium-ballet");
  const p2Pass = turmericPasses && magnesiumPasses;
  predictions.push({
    id: 2,
    description: "Turmeric-trigonometry and magnesium-ballet are strongest candidates",
    result: hasScreeningData
      ? (p2Pass ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `turmeric=${turmericPasses ? "pass" : "fail"}, magnesium=${magnesiumPasses ? "pass" : "fail"}`,
  });

  // P3: Accordion-stalactite may fail (shared sensory features)
  const accordionFails = !passingCandidateIds.includes("p11b-accordion-stalactite");
  predictions.push({
    id: 3,
    description: "Accordion-stalactite may fail screening (shared sensory features)",
    result: hasScreeningData
      ? (accordionFails ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: `accordion-stalactite ${accordionFails ? "failed" : "passed"} screening`,
  });

  // P4: Passing pairs show entropy > 5.0 for all models
  const passingEntropyCheck = screeningResults
    .filter((sr) => passingCandidateIds.includes(sr.candidateId))
    .every((sr) => sr.entropy > 5.0);
  predictions.push({
    id: 4,
    description: "Passing pairs show entropy > 5.0 for all models",
    result: passingCandidateIds.length > 0
      ? (passingEntropyCheck ? "confirmed" : "not confirmed")
      : "insufficient data",
    value: passingCandidateIds.length > 0
      ? `all screening entropies > 5.0: ${passingEntropyCheck}`
      : "no passing candidates to evaluate",
  });

  for (const pred of predictions) {
    console.log(`  P${pred.id}: ${pred.result} -- ${pred.value}`);
  }
  console.log("");

  // ── Build Output ──────────────────────────────────────────────────

  // Determine which model IDs actually appear in screening data
  const screeningModelIds = [...new Set(screeningResults.map((sr) => sr.modelId))];
  const validationModelIds = [...new Set(validationResults.map((vr) => vr.modelId))];

  const analysisOutput: Phase11ControlRevisionOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      candidates: candidateIds,
      screeningModels: screeningModelIds,
      validationModels: validationModelIds,
      totalScreeningRuns: screeningResults.reduce((sum, sr) => sum + sr.runCount, 0),
      totalValidationRuns: validationResults.reduce((sum, vr) => sum + vr.runCount, 0),
    },
    screeningResults,
    screeningSummary,
    validationResults,
    validationSummary,
    staplerMonsoonRetrospective,
    r5Recommendation,
    predictions,
  };

  // ── Write Outputs ─────────────────────────────────────────────────

  console.log("Writing outputs...");
  await mkdir(outputDir, { recursive: true });
  const metricsPath = join(outputDir, "11b-control-revision.json");
  await writeFile(metricsPath, JSON.stringify(analysisOutput, null, 2));
  console.log(`  Metrics:  ${metricsPath}`);

  const findingsParent = findingsPath.substring(0, findingsPath.lastIndexOf("/"));
  if (findingsParent) await mkdir(findingsParent, { recursive: true });
  const findingsContent = generateFindings(analysisOutput);
  await writeFile(findingsPath, findingsContent);
  console.log(`  Findings: ${findingsPath}`);
  console.log("");
  console.log("Control pair revision analysis (Phase 11B) complete.");
}

// ── CLI ────────────────────────────────────────────────────────────

if (import.meta.main) {
  const program = new Command();

  program
    .name("11b-control-revision-analysis")
    .description("Analyze Phase 11B control pair revision data")
    .option("--input <dir>", "input directory", "results")
    .option("--output <dir>", "output directory", "results/analysis")
    .option("--findings <path>", "path for findings markdown output", "findings/11b-control-revision.md");

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
