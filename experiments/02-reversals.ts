#!/usr/bin/env bun
/**
 * Phase 2: Reverse Elicitation Experiment
 *
 * Runs all 21 reporting pairs in reverse (B->A) and 3 holdout polysemy
 * pairs in forward direction (supplementary data for sense differentiation).
 *
 * Uses the new Scheduler for global + per-model concurrency control.
 *
 * Total: 840 reverse runs (21 pairs x 4 models x 10 reps)
 *      + 120 polysemy supplementary (3 pairs x 4 models x 10 reps)
 *      = 960 runs
 *
 * Usage:
 *   bun run experiments/02-reversals.ts
 *   bun run experiments/02-reversals.ts --dry-run
 *   bun run experiments/02-reversals.ts --concurrency 12 --model-concurrency "claude=3,gpt=3,grok=3,gemini=3"
 */

import { Command } from "commander";
import { writeFile, mkdir, readdir, readFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { REPORTING_PAIRS, ALL_PAIRS, MODELS } from "../pairs.ts";
import { Scheduler, parseModelConcurrency } from "../scheduler.ts";
import type {
  PromptFormat,
  ModelConfig,
  ConceptPair,
  ElicitationRequest,
  ElicitationResult,
  PairCategory,
  SchedulerStatus,
} from "../types.ts";

// -- Constants ----------------------------------------------------------------

const PROMPT_FORMAT: PromptFormat = "semantic";
const TEMPERATURE = 0.7;
const WAYPOINT_COUNT = 5;
const REPS_PER_CONDITION = 10;
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_MODEL_CONCURRENCY = "claude=2,gpt=2,grok=2,gemini=2";
const DEFAULT_OUTPUT_DIR = "results";
const STATUS_WRITE_INTERVAL = 10;

// -- Reverse Pair Generation --------------------------------------------------

/**
 * Create reversed versions of the reporting pairs.
 * Swaps `from` and `to`, prefixes the ID with `rev-`,
 * and keeps all other metadata intact.
 */
function generateReversedPairs(pairs: ConceptPair[]): ConceptPair[] {
  return pairs.map((pair) => ({
    ...pair,
    id: `rev-${pair.id}`,
    from: pair.to,
    to: pair.from,
    // Swap concreteness to match the new from/to order
    concreteness: [pair.concreteness[1], pair.concreteness[0]] as [
      ConceptPair["concreteness"][0],
      ConceptPair["concreteness"][1],
    ],
  }));
}

/**
 * Get the 3 holdout polysemy pairs for supplementary forward runs.
 * These fill the data gap identified in Task 0a.
 */
function getPolysemySupplementaryPairs(): ConceptPair[] {
  return ALL_PAIRS.filter(
    (p) => p.set === "holdout" && p.category === "polysemy",
  );
}

// -- Resume Support -----------------------------------------------------------

/**
 * A completed run is identified by its pair ID + model short ID.
 * We track how many successful runs exist for each combo.
 */
interface CompletedRunKey {
  pairId: string;
  modelId: string;
}

function runKey(pairId: string, modelId: string): string {
  return `${pairId}::${modelId}`;
}

interface ExistingResultsInfo {
  /** Count of successful results per pairId::modelId key */
  counts: Map<string, number>;
  /** All loaded results (for summary statistics) */
  results: ElicitationResult[];
}

async function loadExistingResults(
  resultsDir: string,
): Promise<ExistingResultsInfo> {
  const counts = new Map<string, number>();
  const results: ElicitationResult[] = [];

  if (!existsSync(resultsDir)) {
    return { counts, results };
  }

  let files: string[];
  try {
    files = await readdir(resultsDir);
  } catch {
    return { counts, results };
  }

  for (const file of files) {
    if (
      !file.endsWith(".json") ||
      file === "reversal-status.json" ||
      file === "reversal-summary.json"
    ) {
      continue;
    }

    try {
      const content = await readFile(path.join(resultsDir, file), "utf-8");
      const result = JSON.parse(content) as ElicitationResult;
      if (result.pair?.id && result.modelShortId) {
        results.push(result);
        if (!result.failureMode) {
          const key = runKey(result.pair.id, result.modelShortId);
          const current = counts.get(key) ?? 0;
          counts.set(key, current + 1);
        }
      }
    } catch {
      // Skip malformed or corrupt files
    }
  }

  return { counts, results };
}

// -- Status & Summary ---------------------------------------------------------

interface ReversalStatus {
  startedAt: string;
  lastUpdatedAt: string;
  promptFormat: PromptFormat;
  temperature: number;
  waypointCount: number;
  models: string[];
  reversePairCount: number;
  polysemySupplementaryCount: number;
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  skippedRuns: number;
  perModel: Record<string, { completed: number; failed: number }>;
}

async function writeStatusFile(
  statusPath: string,
  status: ReversalStatus,
): Promise<void> {
  try {
    const tmpPath = `${statusPath}.tmp.${Date.now()}`;
    await writeFile(tmpPath, JSON.stringify(status, null, 2));
    await rename(tmpPath, statusPath);
  } catch (error) {
    console.error(
      "Failed to write status file:",
      error instanceof Error ? error.message : error,
    );
  }
}

interface ReversalSummary {
  experiment: "reversals";
  startedAt: string;
  completedAt: string;
  durationMs: number;
  promptFormat: PromptFormat;
  temperature: number;
  waypointCount: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  successRate: number;
  averageDurationMs: number;
  reversePairs: number;
  polysemySupplementaryPairs: number;
  perModel: Record<
    string,
    {
      totalRuns: number;
      successfulRuns: number;
      failedRuns: number;
      successRate: number;
      averageDurationMs: number;
    }
  >;
  perCategory: Record<
    string,
    {
      totalRuns: number;
      successfulRuns: number;
      failedRuns: number;
      successRate: number;
    }
  >;
}

function buildSummary(
  allResults: ElicitationResult[],
  reversePairCount: number,
  polysemyPairCount: number,
  startTime: Date,
  endTime: Date,
  pairCategoryMap: Map<string, PairCategory>,
): ReversalSummary {
  const successful = allResults.filter((r) => !r.failureMode);
  const failed = allResults.filter((r) => r.failureMode);
  const totalDuration = successful.reduce((sum, r) => sum + r.durationMs, 0);

  // Per-model breakdown
  const perModel: ReversalSummary["perModel"] = {};
  for (const result of allResults) {
    const key = result.modelShortId;
    if (!perModel[key]) {
      perModel[key] = {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        successRate: 0,
        averageDurationMs: 0,
      };
    }
    perModel[key].totalRuns++;
    if (result.failureMode) {
      perModel[key].failedRuns++;
    } else {
      perModel[key].successfulRuns++;
      perModel[key].averageDurationMs += result.durationMs;
    }
  }
  for (const entry of Object.values(perModel)) {
    entry.successRate =
      entry.totalRuns > 0 ? entry.successfulRuns / entry.totalRuns : 0;
    entry.averageDurationMs =
      entry.successfulRuns > 0
        ? entry.averageDurationMs / entry.successfulRuns
        : 0;
  }

  // Per-category breakdown
  const perCategory: ReversalSummary["perCategory"] = {};
  for (const result of allResults) {
    // Strip rev- prefix to map back to original category
    const basePairId = result.pair.id.startsWith("rev-")
      ? result.pair.id.slice(4)
      : result.pair.id;
    const category = pairCategoryMap.get(basePairId) ?? "unknown";
    if (!perCategory[category]) {
      perCategory[category] = {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        successRate: 0,
      };
    }
    perCategory[category].totalRuns++;
    if (result.failureMode) {
      perCategory[category].failedRuns++;
    } else {
      perCategory[category].successfulRuns++;
    }
  }
  for (const entry of Object.values(perCategory)) {
    entry.successRate =
      entry.totalRuns > 0 ? entry.successfulRuns / entry.totalRuns : 0;
  }

  return {
    experiment: "reversals",
    startedAt: startTime.toISOString(),
    completedAt: endTime.toISOString(),
    durationMs: endTime.getTime() - startTime.getTime(),
    promptFormat: PROMPT_FORMAT,
    temperature: TEMPERATURE,
    waypointCount: WAYPOINT_COUNT,
    totalRuns: allResults.length,
    successfulRuns: successful.length,
    failedRuns: failed.length,
    successRate:
      allResults.length > 0 ? successful.length / allResults.length : 0,
    averageDurationMs:
      successful.length > 0 ? totalDuration / successful.length : 0,
    reversePairs: reversePairCount,
    polysemySupplementaryPairs: polysemyPairCount,
    perModel,
    perCategory,
  };
}

// -- Utility ------------------------------------------------------------------

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function findModel(shortId: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === shortId);
}

// -- Plan Display -------------------------------------------------------------

interface RunPlan {
  pairs: ConceptPair[];
  models: ModelConfig[];
  requests: ElicitationRequest[];
  reversePairCount: number;
  polysemyPairCount: number;
  skippedCount: number;
}

function printPlan(plan: RunPlan): void {
  const totalBeforeResume =
    (plan.reversePairCount + plan.polysemyPairCount) *
    plan.models.length *
    REPS_PER_CONDITION;

  console.log("=== Phase 2: Reverse Elicitation Experiment ===\n");
  console.log(`Prompt format:          ${PROMPT_FORMAT}`);
  console.log(`Temperature:            ${TEMPERATURE}`);
  console.log(`Waypoint count:         ${WAYPOINT_COUNT}`);
  console.log(`Reps per condition:     ${REPS_PER_CONDITION}`);
  console.log(`Models:                 ${plan.models.map((m) => m.displayName).join(", ")}`);
  console.log("");
  console.log(`Reverse pairs:          ${plan.reversePairCount}`);
  console.log(`Polysemy supplementary: ${plan.polysemyPairCount}`);
  console.log(`Total pairs:            ${plan.reversePairCount + plan.polysemyPairCount}`);
  console.log("");
  console.log(`Total runs (full):      ${totalBeforeResume}`);
  if (plan.skippedCount > 0) {
    console.log(`Already completed:      ${plan.skippedCount}`);
    console.log(`Remaining to run:       ${plan.requests.length}`);
  } else {
    console.log(`Runs to execute:        ${plan.requests.length}`);
  }
  console.log("");

  // Time estimate (~2-4s per run with default concurrency)
  if (plan.requests.length > 0) {
    const estimatedSecondsLow = Math.round((plan.requests.length * 2) / 8);
    const estimatedSecondsHigh = Math.round((plan.requests.length * 4) / 8);
    console.log(
      `Estimated time:         ${formatDuration(estimatedSecondsLow * 1000)} - ${formatDuration(estimatedSecondsHigh * 1000)}`,
    );
    console.log("");
  }

  console.log("Reverse pairs:");
  const reversePairs = plan.pairs.filter((p) => p.id.startsWith("rev-"));
  for (const pair of reversePairs) {
    console.log(`  "${pair.from}" -> "${pair.to}" (${pair.id})`);
  }
  console.log("");

  const polysemyPairs = plan.pairs.filter((p) => !p.id.startsWith("rev-"));
  if (polysemyPairs.length > 0) {
    console.log("Polysemy supplementary pairs (forward):");
    for (const pair of polysemyPairs) {
      console.log(`  "${pair.from}" -> "${pair.to}" (${pair.id})`);
    }
    console.log("");
  }

  console.log("Per-model run counts:");
  for (const model of plan.models) {
    const modelRuns = plan.requests.filter(
      (r) => r.model.id === model.id,
    ).length;
    console.log(`  ${model.displayName}: ${modelRuns} runs`);
  }
  console.log("");
}

// -- Main ---------------------------------------------------------------------

async function main() {
  const program = new Command();

  program
    .name("02-reversals")
    .description(
      "Run Phase 2 reverse elicitation experiment: all reporting pairs in reverse + polysemy supplementary",
    )
    .option("--dry-run", "print the experiment plan without executing")
    .option("--output <dir>", "output directory", DEFAULT_OUTPUT_DIR)
    .option(
      "--concurrency <n>",
      "global concurrency limit",
      String(DEFAULT_CONCURRENCY),
    )
    .option(
      "--model-concurrency <spec>",
      'per-model concurrency, e.g., "claude=2,gpt=3,grok=3,gemini=3"',
      DEFAULT_MODEL_CONCURRENCY,
    )
    .option("--throttle <ms>", "per-model delay between requests", "0")
    .option(
      "--models <ids>",
      "comma-separated model short IDs to run (default: all)",
    );

  program.parse();
  const opts = program.opts();

  const outputDir = opts.output as string;
  const reversalsDir = path.join(outputDir, "reversals");
  const dryRun = opts.dryRun === true;

  // Parse concurrency
  const globalConcurrency = parseInt(opts.concurrency as string, 10);
  if (isNaN(globalConcurrency) || globalConcurrency < 1) {
    console.error("Concurrency must be a positive integer.");
    process.exit(1);
  }

  // Parse model concurrency
  const perModelConcurrency = parseModelConcurrency(
    opts.modelConcurrency as string,
  );

  // Parse throttle
  const throttleMs = parseInt(opts.throttle as string, 10);
  if (isNaN(throttleMs) || throttleMs < 0) {
    console.error("Throttle must be a non-negative integer.");
    process.exit(1);
  }

  // Resolve models
  let models: ModelConfig[];
  if (opts.models) {
    const ids = (opts.models as string).split(",").map((s) => s.trim());
    models = [];
    for (const id of ids) {
      const model = findModel(id);
      if (!model) {
        const valid = MODELS.map((m) => m.id).join(", ");
        console.error(`Unknown model "${id}". Valid options: ${valid}`);
        process.exit(1);
      }
      models.push(model);
    }
  } else {
    models = [...MODELS];
  }

  // Generate pairs
  const reversedPairs = generateReversedPairs(REPORTING_PAIRS);
  const polysemyPairs = getPolysemySupplementaryPairs();
  const allPairs = [...reversedPairs, ...polysemyPairs];

  // Build category lookup map (using original pair IDs)
  const pairCategoryMap = new Map<string, PairCategory>();
  for (const pair of REPORTING_PAIRS) {
    pairCategoryMap.set(pair.id, pair.category);
  }
  for (const pair of polysemyPairs) {
    pairCategoryMap.set(pair.id, pair.category);
  }

  // Load existing results for resume support
  const existing = await loadExistingResults(reversalsDir);

  if (existing.results.length > 0) {
    console.log(
      `Found ${existing.results.length} existing result files in ${reversalsDir}/`,
    );
  }

  // Build the full run manifest
  const allRequests: ElicitationRequest[] = [];
  const requestsToRun: ElicitationRequest[] = [];

  // Track how many we are queuing per key for the diff
  const queuedPerKey = new Map<string, number>();

  for (const pair of allPairs) {
    for (const model of models) {
      const key = runKey(pair.id, model.id);
      const existingCount = existing.counts.get(key) ?? 0;

      for (let r = 0; r < REPS_PER_CONDITION; r++) {
        const request: ElicitationRequest = {
          model,
          pair,
          waypointCount: WAYPOINT_COUNT,
          promptFormat: PROMPT_FORMAT,
          temperature: TEMPERATURE,
        };

        allRequests.push(request);

        // Only queue if we need more runs for this key
        const alreadyQueued = queuedPerKey.get(key) ?? 0;
        if (existingCount + alreadyQueued < REPS_PER_CONDITION) {
          requestsToRun.push(request);
          queuedPerKey.set(key, alreadyQueued + 1);
        }
      }
    }
  }

  const skippedCount = allRequests.length - requestsToRun.length;

  // Build and print plan
  const plan: RunPlan = {
    pairs: allPairs,
    models,
    requests: requestsToRun,
    reversePairCount: reversedPairs.length,
    polysemyPairCount: polysemyPairs.length,
    skippedCount,
  };

  printPlan(plan);

  if (dryRun) {
    console.log("(Dry run -- no API calls made.)");
    return;
  }

  if (requestsToRun.length === 0) {
    console.log("All runs already completed. Nothing to do.");

    // Still write the summary from existing data
    const endTime = new Date();
    const summary = buildSummary(
      existing.results,
      reversedPairs.length,
      polysemyPairs.length,
      endTime, // Use now as start (no actual work done)
      endTime,
      pairCategoryMap,
    );
    const summaryPath = path.join(reversalsDir, "reversal-summary.json");
    const tmpSummaryPath = `${summaryPath}.tmp.${Date.now()}`;
    await writeFile(tmpSummaryPath, JSON.stringify(summary, null, 2));
    await rename(tmpSummaryPath, summaryPath);
    console.log(`Summary written to: ${summaryPath}`);
    return;
  }

  // Ensure output directory exists
  await mkdir(reversalsDir, { recursive: true });

  // Initialize status tracking
  const statusPath = path.join(reversalsDir, "reversal-status.json");
  const experimentStart = new Date();

  const status: ReversalStatus = {
    startedAt: experimentStart.toISOString(),
    lastUpdatedAt: experimentStart.toISOString(),
    promptFormat: PROMPT_FORMAT,
    temperature: TEMPERATURE,
    waypointCount: WAYPOINT_COUNT,
    models: models.map((m) => m.id),
    reversePairCount: reversedPairs.length,
    polysemySupplementaryCount: polysemyPairs.length,
    totalRuns: allRequests.length,
    completedRuns: skippedCount,
    failedRuns: 0,
    skippedRuns: skippedCount,
    perModel: Object.fromEntries(
      models.map((m) => [m.id, { completed: 0, failed: 0 }]),
    ),
  };

  await writeStatusFile(statusPath, status);

  // Collect new results for the summary
  const newResults: ElicitationResult[] = [];
  let completionsSinceLastStatus = 0;

  // Per-model progress counters for display
  const perModelCompleted = new Map<string, number>();
  const perModelFailed = new Map<string, number>();
  for (const model of models) {
    perModelCompleted.set(model.id, 0);
    perModelFailed.set(model.id, 0);
  }

  // Create the scheduler
  const scheduler = new Scheduler(
    {
      globalConcurrency,
      perModelConcurrency,
      throttleMs,
    },
    {
      onResult: async (result: ElicitationResult) => {
        // Track per-model stats
        const modelId = result.modelShortId;
        const prevCompleted = perModelCompleted.get(modelId) ?? 0;
        perModelCompleted.set(modelId, prevCompleted + 1);
        if (result.failureMode) {
          const prevFailed = perModelFailed.get(modelId) ?? 0;
          perModelFailed.set(modelId, prevFailed + 1);
        }

        // Atomic file write: write to .tmp then rename
        const resultPath = path.join(reversalsDir, `${result.runId}.json`);
        try {
          const tmpPath = `${resultPath}.tmp.${Date.now()}`;
          await writeFile(tmpPath, JSON.stringify(result, null, 2));
          await rename(tmpPath, resultPath);
        } catch (writeError: unknown) {
          console.error(
            `Failed to write result ${result.runId}:`,
            writeError instanceof Error ? writeError.message : writeError,
          );
        }

        newResults.push(result);

        // Update status file periodically
        completionsSinceLastStatus++;
        if (completionsSinceLastStatus >= STATUS_WRITE_INTERVAL) {
          completionsSinceLastStatus = 0;
          status.completedRuns = skippedCount + newResults.length;
          status.failedRuns = newResults.filter((r) => r.failureMode).length;
          status.lastUpdatedAt = new Date().toISOString();
          for (const model of models) {
            status.perModel[model.id] = {
              completed: perModelCompleted.get(model.id) ?? 0,
              failed: perModelFailed.get(model.id) ?? 0,
            };
          }
          // Fire and forget
          writeStatusFile(statusPath, status).catch(() => {});
        }
      },

      onProgress: (schedulerStatus: SchedulerStatus) => {
        const totalWithSkipped = skippedCount + schedulerStatus.completed;
        const overallPct = Math.round(
          (totalWithSkipped / allRequests.length) * 100,
        );
        const batchPct = Math.round(
          (schedulerStatus.completed / schedulerStatus.totalRequests) * 100,
        );

        // Build per-model display
        const modelParts = models.map((m) => {
          const done = perModelCompleted.get(m.id) ?? 0;
          const fail = perModelFailed.get(m.id) ?? 0;
          return `${m.id}:${done}${fail > 0 ? `(${fail}f)` : ""}`;
        });

        // ETA
        let etaStr = "";
        if (schedulerStatus.estimatedRemainingMs != null) {
          etaStr = ` | ETA: ${formatDuration(schedulerStatus.estimatedRemainingMs)}`;
        }

        process.stdout.write(
          `\r  ${schedulerStatus.completed}/${schedulerStatus.totalRequests} (${batchPct}%) | Overall: ${totalWithSkipped}/${allRequests.length} (${overallPct}%) | ${modelParts.join(" ")}${etaStr}    `,
        );
      },
    },
  );

  console.log("Starting experiment...\n");

  // Run all requests through the scheduler
  const results = await scheduler.run(requestsToRun);

  // Final newline after progress
  console.log("\n");

  // Final status update
  status.completedRuns = skippedCount + results.length;
  status.failedRuns = results.filter((r) => r.failureMode).length;
  status.lastUpdatedAt = new Date().toISOString();
  for (const model of models) {
    status.perModel[model.id] = {
      completed: perModelCompleted.get(model.id) ?? 0,
      failed: perModelFailed.get(model.id) ?? 0,
    };
  }
  await writeStatusFile(statusPath, status);

  // Combine existing + new results for the summary
  const allResultsForSummary = [...existing.results, ...results];

  // Generate and write summary
  const experimentEnd = new Date();
  const summary = buildSummary(
    allResultsForSummary,
    reversedPairs.length,
    polysemyPairs.length,
    experimentStart,
    experimentEnd,
    pairCategoryMap,
  );

  const summaryPath = path.join(reversalsDir, "reversal-summary.json");
  const tmpSummaryPath = `${summaryPath}.tmp.${Date.now()}`;
  await writeFile(tmpSummaryPath, JSON.stringify(summary, null, 2));
  await rename(tmpSummaryPath, summaryPath);

  // Print final summary
  const successful = results.filter((r) => !r.failureMode);
  const failed = results.filter((r) => r.failureMode);

  console.log("=== Phase 2: Reverse Elicitation Complete ===\n");
  console.log(`Duration:       ${formatDuration(summary.durationMs)}`);
  console.log(`New runs:       ${results.length}`);
  console.log(`Successful:     ${successful.length}`);
  console.log(`Failed:         ${failed.length}`);
  if (skippedCount > 0) {
    console.log(`Resumed:        ${skippedCount} pre-existing`);
  }
  console.log(
    `Total results:  ${allResultsForSummary.length}`,
  );
  console.log(
    `Success rate:   ${(summary.successRate * 100).toFixed(1)}%`,
  );
  console.log(
    `Avg duration:   ${Math.round(summary.averageDurationMs)}ms per run`,
  );
  console.log("");

  console.log("Per-model breakdown:");
  for (const [modelId, stats] of Object.entries(summary.perModel)) {
    console.log(
      `  ${modelId}: ${stats.successfulRuns}/${stats.totalRuns} (${(stats.successRate * 100).toFixed(1)}%) avg ${Math.round(stats.averageDurationMs)}ms`,
    );
  }
  console.log("");

  console.log("Per-category breakdown:");
  for (const [category, stats] of Object.entries(summary.perCategory)) {
    console.log(
      `  ${category}: ${stats.successfulRuns}/${stats.totalRuns} (${(stats.successRate * 100).toFixed(1)}%)`,
    );
  }
  console.log("");

  console.log(`Summary written to: ${summaryPath}`);
  console.log(`Status file:        ${statusPath}`);
  console.log(`Results directory:   ${reversalsDir}/`);
}

// Run when executed directly
if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
