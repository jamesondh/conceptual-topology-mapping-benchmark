/**
 * Experiment 01: Prompt Format Selection
 *
 * Runs holdout pairs across 4 models x 2 prompt formats (direct, semantic)
 * x 10 reps to select the best prompt format based on intra-model consistency
 * and extraction quality.
 *
 * Total: ~15 pairs x 4 models x 2 formats x 10 reps = ~1200 runs
 *
 * Usage:
 *   bun run experiments/01-prompt-selection.ts
 *   bun run experiments/01-prompt-selection.ts --dry-run
 *   bun run experiments/01-prompt-selection.ts --output results --concurrency 2
 */

import { parseArgs } from "node:util";
import { mkdir, writeFile } from "node:fs/promises";
import { runBatch } from "../index.ts";
import { HOLDOUT_PAIRS, MODELS } from "../pairs.ts";
import {
  computeJaccard,
  computePositionalOverlap,
  computeDistributionalEntropy,
} from "../canonicalize.ts";
import type {
  PromptFormat,
  ModelConfig,
  ConceptPair,
  ElicitationRequest,
  ElicitationResult,
} from "../types.ts";

// ── Constants ────────────────────────────────────────────────────────

const REPS_PER_CONDITION = 10;
const WAYPOINT_COUNT = 5;
const TEMPERATURE = 0.7;
const PROMPT_FORMATS: PromptFormat[] = ["direct", "semantic"];

// ── CLI Argument Parsing ─────────────────────────────────────────────

interface CliOptions {
  dryRun: boolean;
  outputDir: string;
  concurrency: number;
}

function parseCli(): CliOptions {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      "dry-run": { type: "boolean", default: false },
      output: { type: "string", default: "results" },
      concurrency: { type: "string", default: "2" },
    },
    strict: true,
  });

  return {
    dryRun: values["dry-run"] ?? false,
    outputDir: values.output ?? "results",
    concurrency: parseInt(values.concurrency ?? "2", 10),
  };
}

// ── Experiment Plan ──────────────────────────────────────────────────

interface BatchPlan {
  batchId: string;
  model: ModelConfig;
  format: PromptFormat;
  requests: ElicitationRequest[];
}

function buildExperimentPlan(): BatchPlan[] {
  const plans: BatchPlan[] = [];

  for (const model of MODELS) {
    for (const format of PROMPT_FORMATS) {
      const batchId = `prompt-selection-${model.id}-${format}`;
      const requests: ElicitationRequest[] = [];

      for (const pair of HOLDOUT_PAIRS) {
        for (let rep = 0; rep < REPS_PER_CONDITION; rep++) {
          requests.push({
            model,
            pair,
            waypointCount: WAYPOINT_COUNT,
            promptFormat: format,
            temperature: TEMPERATURE,
          });
        }
      }

      plans.push({ batchId, model, format, requests });
    }
  }

  return plans;
}

function printExperimentPlan(plans: BatchPlan[]): void {
  const totalRequests = plans.reduce((sum, p) => sum + p.requests.length, 0);

  console.log("=== Experiment 01: Prompt Format Selection ===\n");
  console.log(`Holdout pairs:       ${HOLDOUT_PAIRS.length}`);
  console.log(`Models:              ${MODELS.map((m) => m.id).join(", ")}`);
  console.log(`Prompt formats:      ${PROMPT_FORMATS.join(", ")}`);
  console.log(`Reps per condition:  ${REPS_PER_CONDITION}`);
  console.log(`Waypoints per run:   ${WAYPOINT_COUNT}`);
  console.log(`Temperature:         ${TEMPERATURE}`);
  console.log(`Total batches:       ${plans.length}`);
  console.log(`Total requests:      ${totalRequests}`);
  console.log("");

  console.log("Batch breakdown:");
  for (const plan of plans) {
    console.log(
      `  ${plan.batchId}: ${plan.requests.length} requests ` +
        `(${plan.model.displayName}, ${plan.format})`,
    );
  }
  console.log("");

  console.log("Holdout pairs:");
  for (const pair of HOLDOUT_PAIRS) {
    console.log(
      `  ${pair.id}: "${pair.from}" -> "${pair.to}" [${pair.category}]`,
    );
  }
}

// ── Analysis ─────────────────────────────────────────────────────────

/**
 * Group results by pair ID for a single model x format condition.
 * Returns a map of pairId -> array of results (one per rep).
 */
function groupResultsByPair(
  results: ElicitationResult[],
): Map<string, ElicitationResult[]> {
  const groups = new Map<string, ElicitationResult[]>();
  for (const result of results) {
    const key = result.pair.id;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(result);
  }
  return groups;
}

interface ConditionMetrics {
  modelId: string;
  modelDisplayName: string;
  format: PromptFormat;
  pairCount: number;
  totalRuns: number;
  meanJaccard: number;
  meanPositionalOverlap: number;
  meanEntropy: number;
  extractionSuccessRate: number;
  perPairMetrics: PairMetrics[];
}

interface PairMetrics {
  pairId: string;
  from: string;
  to: string;
  repsCompleted: number;
  extractionSuccesses: number;
  meanJaccard: number;
  meanPositionalOverlap: number;
  entropy: number;
}

/**
 * Compute metrics for a single model x format condition.
 * For Jaccard and positional overlap, we compute the average across
 * all unique pairs of reps for each concept pair.
 */
function computeConditionMetrics(
  model: ModelConfig,
  format: PromptFormat,
  results: ElicitationResult[],
): ConditionMetrics {
  const grouped = groupResultsByPair(results);
  const perPairMetrics: PairMetrics[] = [];

  let totalJaccard = 0;
  let totalPositional = 0;
  let totalEntropy = 0;
  let totalExtractionSuccesses = 0;
  let totalRuns = 0;
  let pairCount = 0;

  for (const [pairId, pairResults] of grouped) {
    const firstResult = pairResults[0];
    const runs = pairResults.map((r) => r.canonicalizedWaypoints);
    const successfulRuns = runs.filter((r) => r.length === WAYPOINT_COUNT);
    const extractionSuccesses = successfulRuns.length;

    totalExtractionSuccesses += extractionSuccesses;
    totalRuns += pairResults.length;

    // Compute pairwise Jaccard and positional overlap across all rep pairs
    let pairJaccardSum = 0;
    let pairPositionalSum = 0;
    let pairwiseCount = 0;

    for (let i = 0; i < runs.length; i++) {
      for (let j = i + 1; j < runs.length; j++) {
        if (runs[i].length > 0 && runs[j].length > 0) {
          const jaccard = computeJaccard(runs[i], runs[j]);
          const positional = computePositionalOverlap(runs[i], runs[j]);
          pairJaccardSum += jaccard.similarity;
          pairPositionalSum += positional.exactPositionMatch;
          pairwiseCount++;
        }
      }
    }

    const meanJaccard = pairwiseCount > 0 ? pairJaccardSum / pairwiseCount : 0;
    const meanPositional =
      pairwiseCount > 0 ? pairPositionalSum / pairwiseCount : 0;

    // Entropy across all runs for this pair
    const entropy = computeDistributionalEntropy(runs);

    perPairMetrics.push({
      pairId,
      from: firstResult.pair.from,
      to: firstResult.pair.to,
      repsCompleted: pairResults.length,
      extractionSuccesses,
      meanJaccard,
      meanPositionalOverlap: meanPositional,
      entropy,
    });

    totalJaccard += meanJaccard;
    totalPositional += meanPositional;
    totalEntropy += entropy;
    pairCount++;
  }

  return {
    modelId: model.id,
    modelDisplayName: model.displayName,
    format,
    pairCount,
    totalRuns,
    meanJaccard: pairCount > 0 ? totalJaccard / pairCount : 0,
    meanPositionalOverlap: pairCount > 0 ? totalPositional / pairCount : 0,
    meanEntropy: pairCount > 0 ? totalEntropy / pairCount : 0,
    extractionSuccessRate: totalRuns > 0 ? totalExtractionSuccesses / totalRuns : 0,
    perPairMetrics,
  };
}

// ── Comparison & Selection ───────────────────────────────────────────

interface FormatComparison {
  modelId: string;
  modelDisplayName: string;
  direct: ConditionMetrics;
  semantic: ConditionMetrics;
  jaccardDelta: number; // semantic - direct (positive = semantic better)
  positionalDelta: number;
  entropyDelta: number; // semantic - direct (negative = semantic better, lower entropy)
  extractionDelta: number; // semantic - direct (positive = semantic better)
}

interface FormatSelection {
  selectedFormat: PromptFormat;
  rationale: string;
  aggregateMetrics: {
    direct: {
      meanJaccard: number;
      meanPositionalOverlap: number;
      meanEntropy: number;
      meanExtractionSuccessRate: number;
    };
    semantic: {
      meanJaccard: number;
      meanPositionalOverlap: number;
      meanEntropy: number;
      meanExtractionSuccessRate: number;
    };
  };
  perModelComparisons: FormatComparison[];
  timestamp: string;
}

function buildComparisons(
  allMetrics: ConditionMetrics[],
): FormatComparison[] {
  const comparisons: FormatComparison[] = [];

  for (const model of MODELS) {
    const direct = allMetrics.find(
      (m) => m.modelId === model.id && m.format === "direct",
    );
    const semantic = allMetrics.find(
      (m) => m.modelId === model.id && m.format === "semantic",
    );

    if (!direct || !semantic) continue;

    comparisons.push({
      modelId: model.id,
      modelDisplayName: model.displayName,
      direct,
      semantic,
      jaccardDelta: semantic.meanJaccard - direct.meanJaccard,
      positionalDelta:
        semantic.meanPositionalOverlap - direct.meanPositionalOverlap,
      entropyDelta: semantic.meanEntropy - direct.meanEntropy,
      extractionDelta:
        semantic.extractionSuccessRate - direct.extractionSuccessRate,
    });
  }

  return comparisons;
}

function selectFormat(comparisons: FormatComparison[]): FormatSelection {
  // Aggregate across all models
  const directMetrics = comparisons.map((c) => c.direct);
  const semanticMetrics = comparisons.map((c) => c.semantic);

  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const directAgg = {
    meanJaccard: avg(directMetrics.map((m) => m.meanJaccard)),
    meanPositionalOverlap: avg(
      directMetrics.map((m) => m.meanPositionalOverlap),
    ),
    meanEntropy: avg(directMetrics.map((m) => m.meanEntropy)),
    meanExtractionSuccessRate: avg(
      directMetrics.map((m) => m.extractionSuccessRate),
    ),
  };

  const semanticAgg = {
    meanJaccard: avg(semanticMetrics.map((m) => m.meanJaccard)),
    meanPositionalOverlap: avg(
      semanticMetrics.map((m) => m.meanPositionalOverlap),
    ),
    meanEntropy: avg(semanticMetrics.map((m) => m.meanEntropy)),
    meanExtractionSuccessRate: avg(
      semanticMetrics.map((m) => m.extractionSuccessRate),
    ),
  };

  // Selection logic:
  // (1) Higher mean Jaccard across all models
  // (2) Higher extraction success rate
  // (3) Lower entropy (more stable)
  let directScore = 0;
  let semanticScore = 0;
  const reasons: string[] = [];

  // Criterion 1: Mean Jaccard
  if (directAgg.meanJaccard > semanticAgg.meanJaccard) {
    directScore += 3;
    reasons.push(
      `Direct has higher mean Jaccard (${directAgg.meanJaccard.toFixed(4)} vs ${semanticAgg.meanJaccard.toFixed(4)})`,
    );
  } else if (semanticAgg.meanJaccard > directAgg.meanJaccard) {
    semanticScore += 3;
    reasons.push(
      `Semantic has higher mean Jaccard (${semanticAgg.meanJaccard.toFixed(4)} vs ${directAgg.meanJaccard.toFixed(4)})`,
    );
  } else {
    reasons.push(
      `Mean Jaccard tied (${directAgg.meanJaccard.toFixed(4)})`,
    );
  }

  // Criterion 2: Extraction success rate
  if (
    directAgg.meanExtractionSuccessRate >
    semanticAgg.meanExtractionSuccessRate
  ) {
    directScore += 2;
    reasons.push(
      `Direct has higher extraction success rate (${(directAgg.meanExtractionSuccessRate * 100).toFixed(1)}% vs ${(semanticAgg.meanExtractionSuccessRate * 100).toFixed(1)}%)`,
    );
  } else if (
    semanticAgg.meanExtractionSuccessRate >
    directAgg.meanExtractionSuccessRate
  ) {
    semanticScore += 2;
    reasons.push(
      `Semantic has higher extraction success rate (${(semanticAgg.meanExtractionSuccessRate * 100).toFixed(1)}% vs ${(directAgg.meanExtractionSuccessRate * 100).toFixed(1)}%)`,
    );
  } else {
    reasons.push(
      `Extraction success rate tied (${(directAgg.meanExtractionSuccessRate * 100).toFixed(1)}%)`,
    );
  }

  // Criterion 3: Lower entropy (more stable)
  if (directAgg.meanEntropy < semanticAgg.meanEntropy) {
    directScore += 1;
    reasons.push(
      `Direct has lower entropy (${directAgg.meanEntropy.toFixed(4)} vs ${semanticAgg.meanEntropy.toFixed(4)})`,
    );
  } else if (semanticAgg.meanEntropy < directAgg.meanEntropy) {
    semanticScore += 1;
    reasons.push(
      `Semantic has lower entropy (${semanticAgg.meanEntropy.toFixed(4)} vs ${directAgg.meanEntropy.toFixed(4)})`,
    );
  } else {
    reasons.push(
      `Entropy tied (${directAgg.meanEntropy.toFixed(4)})`,
    );
  }

  const selectedFormat: PromptFormat =
    semanticScore > directScore ? "semantic" : "direct";

  const rationale =
    `Selected "${selectedFormat}" format (score: direct=${directScore}, semantic=${semanticScore}). ` +
    reasons.join(". ") +
    ".";

  return {
    selectedFormat,
    rationale,
    aggregateMetrics: {
      direct: directAgg,
      semantic: semanticAgg,
    },
    perModelComparisons: comparisons,
    timestamp: new Date().toISOString(),
  };
}

// ── Display ──────────────────────────────────────────────────────────

function printComparisonTable(comparisons: FormatComparison[]): void {
  console.log("\n=== Format Comparison Results ===\n");

  // Header
  const header = [
    "Model".padEnd(18),
    "Format".padEnd(10),
    "Jaccard".padEnd(10),
    "Positional".padEnd(12),
    "Entropy".padEnd(10),
    "Extr. %".padEnd(10),
  ].join(" | ");

  const separator = "-".repeat(header.length);

  console.log(header);
  console.log(separator);

  for (const comp of comparisons) {
    // Direct row
    console.log(
      [
        comp.modelDisplayName.padEnd(18),
        "direct".padEnd(10),
        comp.direct.meanJaccard.toFixed(4).padEnd(10),
        comp.direct.meanPositionalOverlap.toFixed(4).padEnd(12),
        comp.direct.meanEntropy.toFixed(4).padEnd(10),
        `${(comp.direct.extractionSuccessRate * 100).toFixed(1)}%`.padEnd(10),
      ].join(" | "),
    );

    // Semantic row
    console.log(
      [
        "".padEnd(18),
        "semantic".padEnd(10),
        comp.semantic.meanJaccard.toFixed(4).padEnd(10),
        comp.semantic.meanPositionalOverlap.toFixed(4).padEnd(12),
        comp.semantic.meanEntropy.toFixed(4).padEnd(10),
        `${(comp.semantic.extractionSuccessRate * 100).toFixed(1)}%`.padEnd(10),
      ].join(" | "),
    );

    // Delta row
    const deltaSign = (v: number) => (v >= 0 ? "+" : "") + v.toFixed(4);
    const deltaPctSign = (v: number) =>
      (v >= 0 ? "+" : "") + (v * 100).toFixed(1) + "%";

    console.log(
      [
        "".padEnd(18),
        "delta".padEnd(10),
        deltaSign(comp.jaccardDelta).padEnd(10),
        deltaSign(comp.positionalDelta).padEnd(12),
        deltaSign(comp.entropyDelta).padEnd(10),
        deltaPctSign(comp.extractionDelta).padEnd(10),
      ].join(" | "),
    );

    console.log(separator);
  }
}

function printSelection(selection: FormatSelection): void {
  console.log("\n=== Format Selection ===\n");
  console.log(`Recommended format: ${selection.selectedFormat}`);
  console.log(`Rationale: ${selection.rationale}`);
  console.log("");

  console.log("Aggregate metrics across all models:");
  console.log("  Direct:");
  console.log(
    `    Mean Jaccard:            ${selection.aggregateMetrics.direct.meanJaccard.toFixed(4)}`,
  );
  console.log(
    `    Mean Positional Overlap: ${selection.aggregateMetrics.direct.meanPositionalOverlap.toFixed(4)}`,
  );
  console.log(
    `    Mean Entropy:            ${selection.aggregateMetrics.direct.meanEntropy.toFixed(4)}`,
  );
  console.log(
    `    Mean Extraction Success: ${(selection.aggregateMetrics.direct.meanExtractionSuccessRate * 100).toFixed(1)}%`,
  );
  console.log("  Semantic:");
  console.log(
    `    Mean Jaccard:            ${selection.aggregateMetrics.semantic.meanJaccard.toFixed(4)}`,
  );
  console.log(
    `    Mean Positional Overlap: ${selection.aggregateMetrics.semantic.meanPositionalOverlap.toFixed(4)}`,
  );
  console.log(
    `    Mean Entropy:            ${selection.aggregateMetrics.semantic.meanEntropy.toFixed(4)}`,
  );
  console.log(
    `    Mean Extraction Success: ${(selection.aggregateMetrics.semantic.meanExtractionSuccessRate * 100).toFixed(1)}%`,
  );
}

// ── Main Execution ───────────────────────────────────────────────────

export async function runPromptSelectionExperiment(
  options: CliOptions,
): Promise<FormatSelection> {
  const plans = buildExperimentPlan();
  const experimentOutputDir = `${options.outputDir}/prompt-selection`;

  // Always print the plan
  printExperimentPlan(plans);

  if (options.dryRun) {
    console.log("[DRY RUN] Exiting without executing requests.");
    return {
      selectedFormat: "direct",
      rationale: "Dry run -- no data collected.",
      aggregateMetrics: {
        direct: {
          meanJaccard: 0,
          meanPositionalOverlap: 0,
          meanEntropy: 0,
          meanExtractionSuccessRate: 0,
        },
        semantic: {
          meanJaccard: 0,
          meanPositionalOverlap: 0,
          meanEntropy: 0,
          meanExtractionSuccessRate: 0,
        },
      },
      perModelComparisons: [],
      timestamp: new Date().toISOString(),
    };
  }

  // Ensure output directory exists
  await mkdir(experimentOutputDir, { recursive: true });

  // Execute all batches sequentially (each batch runs internally with concurrency)
  const allResults = new Map<string, ElicitationResult[]>();

  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i];
    console.log(
      `\n--- Batch ${i + 1}/${plans.length}: ${plan.batchId} ---`,
    );
    console.log(
      `    ${plan.model.displayName} / ${plan.format} / ${plan.requests.length} requests`,
    );

    const results = await runBatch({
      requests: plan.requests,
      batchId: plan.batchId,
      outputDir: experimentOutputDir,
      concurrency: options.concurrency,
      onProgress: (progress) => {
        const pct = Math.round(
          (progress.completed / progress.total) * 100,
        );
        const eta =
          progress.estimatedRemaining != null
            ? ` (~${progress.estimatedRemaining}s remaining)`
            : "";
        const failStr =
          progress.failed > 0 ? ` [${progress.failed} failed]` : "";
        process.stdout.write(
          `\r    Progress: ${progress.completed}/${progress.total} (${pct}%)${eta}${failStr}    `,
        );
      },
    });

    const key = `${plan.model.id}-${plan.format}`;
    allResults.set(key, results);

    const successful = results.filter((r) => !r.failureMode).length;
    console.log(
      `\n    Completed: ${successful}/${results.length} successful`,
    );
  }

  // ── Analysis ─────────────────────────────────────────────────────

  console.log("\n\n=== Analyzing Results ===\n");

  const allMetrics: ConditionMetrics[] = [];

  for (const plan of plans) {
    const key = `${plan.model.id}-${plan.format}`;
    const results = allResults.get(key);
    if (!results) continue;

    const metrics = computeConditionMetrics(plan.model, plan.format, results);
    allMetrics.push(metrics);

    console.log(
      `${plan.model.displayName} / ${plan.format}: ` +
        `Jaccard=${metrics.meanJaccard.toFixed(4)}, ` +
        `Positional=${metrics.meanPositionalOverlap.toFixed(4)}, ` +
        `Entropy=${metrics.meanEntropy.toFixed(4)}, ` +
        `Extraction=${(metrics.extractionSuccessRate * 100).toFixed(1)}%`,
    );
  }

  // Build comparisons and select format
  const comparisons = buildComparisons(allMetrics);
  printComparisonTable(comparisons);

  const selection = selectFormat(comparisons);
  printSelection(selection);

  // ── Save Results ─────────────────────────────────────────────────

  // Save full comparison data
  const comparisonOutput = {
    experiment: "01-prompt-selection",
    timestamp: new Date().toISOString(),
    config: {
      holdoutPairCount: HOLDOUT_PAIRS.length,
      models: MODELS.map((m) => m.id),
      formats: PROMPT_FORMATS,
      repsPerCondition: REPS_PER_CONDITION,
      waypointCount: WAYPOINT_COUNT,
      temperature: TEMPERATURE,
    },
    conditionMetrics: allMetrics,
    comparisons: comparisons.map((c) => ({
      modelId: c.modelId,
      modelDisplayName: c.modelDisplayName,
      jaccardDelta: c.jaccardDelta,
      positionalDelta: c.positionalDelta,
      entropyDelta: c.entropyDelta,
      extractionDelta: c.extractionDelta,
      direct: {
        meanJaccard: c.direct.meanJaccard,
        meanPositionalOverlap: c.direct.meanPositionalOverlap,
        meanEntropy: c.direct.meanEntropy,
        extractionSuccessRate: c.direct.extractionSuccessRate,
      },
      semantic: {
        meanJaccard: c.semantic.meanJaccard,
        meanPositionalOverlap: c.semantic.meanPositionalOverlap,
        meanEntropy: c.semantic.meanEntropy,
        extractionSuccessRate: c.semantic.extractionSuccessRate,
      },
    })),
    selection: {
      selectedFormat: selection.selectedFormat,
      rationale: selection.rationale,
    },
  };

  const comparisonPath = `${experimentOutputDir}/format-comparison.json`;
  await writeFile(comparisonPath, JSON.stringify(comparisonOutput, null, 2));
  console.log(`\nSaved comparison data to ${comparisonPath}`);

  // Save selected format
  const selectionOutput = {
    selectedFormat: selection.selectedFormat,
    rationale: selection.rationale,
    aggregateMetrics: selection.aggregateMetrics,
    timestamp: selection.timestamp,
  };

  const selectionPath = `${experimentOutputDir}/selected-format.json`;
  await writeFile(selectionPath, JSON.stringify(selectionOutput, null, 2));
  console.log(`Saved format selection to ${selectionPath}`);

  return selection;
}

// ── Entry Point ──────────────────────────────────────────────────────

if (import.meta.main) {
  const options = parseCli();
  runPromptSelectionExperiment(options).catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
