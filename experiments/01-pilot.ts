/**
 * Pilot Batch Runner — Main experiment on the reporting pair set.
 *
 * Runs AFTER prompt format selection (01-prompt-selection.ts) has identified
 * the best format. Executes the full pilot experiment across all 4 models,
 * 2 waypoint counts, with a diagnostic subset receiving extra repetitions.
 *
 * Usage:
 *   bun run experiments/01-pilot.ts
 *   bun run experiments/01-pilot.ts --format semantic --dry-run
 *   bun run experiments/01-pilot.ts --models claude,gpt --waypoints 5
 *   bun run experiments/01-pilot.ts --concurrency 3 --output results
 */

import { Command } from "commander";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { elicit, runBatch } from "../src/index.ts";
import { REPORTING_PAIRS, MODELS } from "../src/data/pairs.ts";
import type {
  PromptFormat,
  ModelConfig,
  ConceptPair,
  ElicitationRequest,
  ElicitationResult,
  PairCategory,
} from "../src/types.ts";

// ── Constants ────────────────────────────────────────────────────────

const TEMPERATURE = 0.7;
const DIAGNOSTIC_REPS = 20;
const STANDARD_REPS = 10;
const DEFAULT_WAYPOINT_COUNTS = [5, 10];
const DEFAULT_CONCURRENCY = 2;
const DEFAULT_OUTPUT_DIR = "results";

// ── Diagnostic Subset Selection ──────────────────────────────────────

/**
 * Select ~10 pairs from reporting pairs that cover each category axis.
 * Picks one pair from each category type when possible to ensure
 * broad coverage with the extra repetitions.
 */
function selectDiagnosticSubset(pairs: ConceptPair[]): Set<string> {
  const diagnosticIds = new Set<string>();

  // Group by category
  const byCategory = new Map<PairCategory, ConceptPair[]>();
  for (const pair of pairs) {
    const existing = byCategory.get(pair.category) ?? [];
    existing.push(pair);
    byCategory.set(pair.category, existing);
  }

  // Pick one from each category
  for (const [_category, categoryPairs] of byCategory) {
    if (categoryPairs.length > 0) {
      diagnosticIds.add(categoryPairs[0].id);
    }
  }

  // If we have fewer than 10, add more pairs to improve coverage
  // across concreteness and relational type axes
  const concretenessPatterns = new Set<string>();
  for (const id of diagnosticIds) {
    const pair = pairs.find((p) => p.id === id)!;
    concretenessPatterns.add(`${pair.concreteness[0]}-${pair.concreteness[1]}`);
  }

  // Try to fill gaps in concreteness coverage
  for (const pair of pairs) {
    if (diagnosticIds.size >= 10) break;
    const pattern = `${pair.concreteness[0]}-${pair.concreteness[1]}`;
    if (!concretenessPatterns.has(pattern) && !diagnosticIds.has(pair.id)) {
      diagnosticIds.add(pair.id);
      concretenessPatterns.add(pattern);
    }
  }

  // Fill up to ~10 from remaining pairs for relational type coverage
  const relationalTypes = new Set<string>();
  for (const id of diagnosticIds) {
    const pair = pairs.find((p) => p.id === id)!;
    relationalTypes.add(pair.relationalType);
  }

  for (const pair of pairs) {
    if (diagnosticIds.size >= 10) break;
    if (!relationalTypes.has(pair.relationalType) && !diagnosticIds.has(pair.id)) {
      diagnosticIds.add(pair.id);
      relationalTypes.add(pair.relationalType);
    }
  }

  // If still under 10, add more to round out
  for (const pair of pairs) {
    if (diagnosticIds.size >= 10) break;
    if (!diagnosticIds.has(pair.id)) {
      diagnosticIds.add(pair.id);
    }
  }

  return diagnosticIds;
}

// ── Resume Support ───────────────────────────────────────────────────

/**
 * Count existing results for a given batch to support resuming.
 * Groups results by pair ID and counts how many successful runs exist.
 */
interface ExistingResultsInfo {
  counts: Map<string, number>;
  results: ElicitationResult[];
}

async function loadExistingResults(
  batchDir: string,
): Promise<ExistingResultsInfo> {
  const counts = new Map<string, number>();
  const results: ElicitationResult[] = [];

  if (!existsSync(batchDir)) {
    return { counts, results };
  }

  let files: string[];
  try {
    files = await readdir(batchDir);
  } catch {
    return { counts, results };
  }

  for (const file of files) {
    if (!file.endsWith(".json") || file === "batch-summary.json") continue;

    try {
      const content = await readFile(path.join(batchDir, file), "utf-8");
      const result = JSON.parse(content) as ElicitationResult;
      if (result.pair?.id) {
        results.push(result);
        if (!result.failureMode) {
          const current = counts.get(result.pair.id) ?? 0;
          counts.set(result.pair.id, current + 1);
        }
      }
    } catch {
      // Skip malformed files
    }
  }

  return { counts, results };
}

// ── Prompt Format Resolution ─────────────────────────────────────────

/**
 * Read the selected prompt format from the prompt-selection results,
 * or fall back to "direct" if not available.
 */
async function readSelectedFormat(outputDir: string): Promise<PromptFormat> {
  const formatPath = path.join(
    outputDir,
    "prompt-selection",
    "selected-format.json",
  );

  try {
    const content = await readFile(formatPath, "utf-8");
    const data = JSON.parse(content) as { selectedFormat?: string; format?: string };
    const format = data.selectedFormat ?? data.format;
    if (format === "direct" || format === "semantic") {
      return format;
    }
    console.warn(
      `Warning: Invalid format in ${formatPath}: "${format}". Falling back to "direct".`,
    );
    return "direct";
  } catch {
    console.warn(
      `Warning: Could not read ${formatPath}. Falling back to "direct".`,
    );
    console.warn(
      '  Run 01-prompt-selection.ts first, or use --format to specify explicitly.\n',
    );
    return "direct";
  }
}

// ── Status File Management ───────────────────────────────────────────

interface PilotStatus {
  startedAt: string;
  lastUpdatedAt: string;
  promptFormat: PromptFormat;
  models: string[];
  waypointCounts: number[];
  totalBatches: number;
  completedBatches: number;
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  batchStatuses: Array<{
    batchId: string;
    model: string;
    waypointCount: number;
    status: "pending" | "running" | "completed";
    runs: number;
    completed: number;
    failed: number;
  }>;
}

async function writeStatus(
  statusPath: string,
  status: PilotStatus,
): Promise<void> {
  try {
    const { rename } = await import("node:fs/promises");
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

// ── Summary Generation ───────────────────────────────────────────────

interface PilotSummary {
  experiment: "pilot";
  startedAt: string;
  completedAt: string;
  durationMs: number;
  promptFormat: PromptFormat;
  temperature: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  successRate: number;
  averageDurationMs: number;
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
      averageDurationMs: number;
    }
  >;
  perWaypointCount: Record<
    number,
    {
      totalRuns: number;
      successfulRuns: number;
      failedRuns: number;
      successRate: number;
      averageDurationMs: number;
    }
  >;
  diagnosticSubsetIds: string[];
  diagnosticReps: number;
  standardReps: number;
}

function buildSummary(
  allResults: ElicitationResult[],
  diagnosticIds: Set<string>,
  promptFormat: PromptFormat,
  startTime: Date,
  endTime: Date,
  pairCategoryMap: Map<string, PairCategory>,
): PilotSummary {
  const successful = allResults.filter((r) => !r.failureMode);
  const failed = allResults.filter((r) => r.failureMode);
  const totalDuration = successful.reduce((sum, r) => sum + r.durationMs, 0);

  // Per-model breakdown
  const perModel: PilotSummary["perModel"] = {};
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
  const perCategory: PilotSummary["perCategory"] = {};
  for (const result of allResults) {
    const category = pairCategoryMap.get(result.pair.id) ?? "unknown";
    if (!perCategory[category]) {
      perCategory[category] = {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        successRate: 0,
        averageDurationMs: 0,
      };
    }
    perCategory[category].totalRuns++;
    if (result.failureMode) {
      perCategory[category].failedRuns++;
    } else {
      perCategory[category].successfulRuns++;
      perCategory[category].averageDurationMs += result.durationMs;
    }
  }
  for (const entry of Object.values(perCategory)) {
    entry.successRate =
      entry.totalRuns > 0 ? entry.successfulRuns / entry.totalRuns : 0;
    entry.averageDurationMs =
      entry.successfulRuns > 0
        ? entry.averageDurationMs / entry.successfulRuns
        : 0;
  }

  // Per-waypoint-count breakdown
  const perWaypointCount: PilotSummary["perWaypointCount"] = {};
  for (const result of allResults) {
    const wc = result.waypointCount;
    if (!perWaypointCount[wc]) {
      perWaypointCount[wc] = {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        successRate: 0,
        averageDurationMs: 0,
      };
    }
    perWaypointCount[wc].totalRuns++;
    if (result.failureMode) {
      perWaypointCount[wc].failedRuns++;
    } else {
      perWaypointCount[wc].successfulRuns++;
      perWaypointCount[wc].averageDurationMs += result.durationMs;
    }
  }
  for (const entry of Object.values(perWaypointCount)) {
    entry.successRate =
      entry.totalRuns > 0 ? entry.successfulRuns / entry.totalRuns : 0;
    entry.averageDurationMs =
      entry.successfulRuns > 0
        ? entry.averageDurationMs / entry.successfulRuns
        : 0;
  }

  return {
    experiment: "pilot",
    startedAt: startTime.toISOString(),
    completedAt: endTime.toISOString(),
    durationMs: endTime.getTime() - startTime.getTime(),
    promptFormat,
    temperature: TEMPERATURE,
    totalRuns: allResults.length,
    successfulRuns: successful.length,
    failedRuns: failed.length,
    successRate:
      allResults.length > 0 ? successful.length / allResults.length : 0,
    averageDurationMs:
      successful.length > 0 ? totalDuration / successful.length : 0,
    perModel,
    perCategory,
    perWaypointCount,
    diagnosticSubsetIds: [...diagnosticIds],
    diagnosticReps: DIAGNOSTIC_REPS,
    standardReps: STANDARD_REPS,
  };
}

// ── Plan Display ─────────────────────────────────────────────────────

interface BatchPlan {
  batchId: string;
  model: ModelConfig;
  waypointCount: number;
  requests: ElicitationRequest[];
  pairsWithReps: Array<{ pairId: string; reps: number; isDiagnostic: boolean }>;
}

function printPlan(
  batches: BatchPlan[],
  diagnosticIds: Set<string>,
  promptFormat: PromptFormat,
  pairs: ConceptPair[],
): void {
  const totalRuns = batches.reduce((sum, b) => sum + b.requests.length, 0);
  const diagnosticPairs = pairs.filter((p) => diagnosticIds.has(p.id));
  const standardPairs = pairs.filter((p) => !diagnosticIds.has(p.id));

  console.log("=== Pilot Experiment Plan ===\n");
  console.log(`Prompt format:     ${promptFormat}`);
  console.log(`Temperature:       ${TEMPERATURE}`);
  console.log(`Reporting pairs:   ${pairs.length}`);
  console.log(`Diagnostic subset: ${diagnosticPairs.length} pairs (${DIAGNOSTIC_REPS} reps each)`);
  console.log(`Standard pairs:    ${standardPairs.length} pairs (${STANDARD_REPS} reps each)`);
  console.log(`Total batches:     ${batches.length}`);
  console.log(`Total runs:        ${totalRuns}`);
  console.log("");

  // Estimate time (~2-4s per run with concurrency 2)
  const estimatedSecondsLow = Math.round((totalRuns * 2) / 2);
  const estimatedSecondsHigh = Math.round((totalRuns * 4) / 2);
  console.log(
    `Estimated time:    ${formatDuration(estimatedSecondsLow * 1000)} - ${formatDuration(estimatedSecondsHigh * 1000)}`,
  );
  console.log("");

  console.log("Diagnostic subset pairs:");
  for (const pair of diagnosticPairs) {
    console.log(`  [${pair.category}] "${pair.from}" -> "${pair.to}" (${pair.id})`);
  }
  console.log("");

  console.log("Batch breakdown:");
  for (const batch of batches) {
    console.log(
      `  ${batch.batchId}: ${batch.model.displayName} w=${batch.waypointCount} (${batch.requests.length} runs)`,
    );
  }
  console.log("");
}

// ── Utility ──────────────────────────────────────────────────────────

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

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  const program = new Command();

  program
    .name("01-pilot")
    .description(
      "Run the main pilot experiment on reporting pairs across all models and waypoint counts",
    )
    .option(
      "--format <type>",
      'override prompt format (skip reading selected-format.json): "direct" or "semantic"',
    )
    .option("--dry-run", "print the experiment plan without executing")
    .option("--output <dir>", "output directory", DEFAULT_OUTPUT_DIR)
    .option(
      "--concurrency <n>",
      "concurrent API requests per batch",
      String(DEFAULT_CONCURRENCY),
    )
    .option(
      "--models <ids>",
      "comma-separated model short IDs to run (default: all)",
    )
    .option(
      "--waypoints <counts>",
      "comma-separated waypoint counts",
      DEFAULT_WAYPOINT_COUNTS.join(","),
    );

  program.parse();
  const opts = program.opts();

  const outputDir = opts.output as string;
  const pilotDir = path.join(outputDir, "pilot");
  const concurrency = parseInt(opts.concurrency as string, 10);
  const dryRun = opts.dryRun === true;

  if (isNaN(concurrency) || concurrency < 1) {
    console.error("Concurrency must be a positive integer.");
    process.exit(1);
  }

  // Parse waypoint counts
  const waypointCounts = (opts.waypoints as string)
    .split(",")
    .map((s) => parseInt(s.trim(), 10));
  for (const wc of waypointCounts) {
    if (isNaN(wc) || wc < 1) {
      console.error(`Invalid waypoint count: ${wc}`);
      process.exit(1);
    }
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

  // Resolve prompt format
  let promptFormat: PromptFormat;
  if (opts.format) {
    const fmt = opts.format as string;
    if (fmt !== "direct" && fmt !== "semantic") {
      console.error(
        `Invalid format "${fmt}". Must be "direct" or "semantic".`,
      );
      process.exit(1);
    }
    promptFormat = fmt;
  } else {
    promptFormat = await readSelectedFormat(outputDir);
  }

  // Use all reporting pairs
  const pairs = REPORTING_PAIRS;

  // Build category lookup map for summary
  const pairCategoryMap = new Map<string, PairCategory>();
  for (const pair of pairs) {
    pairCategoryMap.set(pair.id, pair.category);
  }

  // Select diagnostic subset
  const diagnosticIds = selectDiagnosticSubset(pairs);

  // Build batch plans: one batch per model x waypoint count
  const batchPlans: BatchPlan[] = [];

  for (const model of models) {
    for (const waypointCount of waypointCounts) {
      const batchId = `pilot-${model.id}-w${waypointCount}`;
      const pairsWithReps: BatchPlan["pairsWithReps"] = [];
      const requests: ElicitationRequest[] = [];

      for (const pair of pairs) {
        const isDiagnostic = diagnosticIds.has(pair.id);
        const reps = isDiagnostic ? DIAGNOSTIC_REPS : STANDARD_REPS;

        pairsWithReps.push({
          pairId: pair.id,
          reps,
          isDiagnostic,
        });

        for (let r = 0; r < reps; r++) {
          requests.push({
            model,
            pair,
            waypointCount,
            promptFormat,
            temperature: TEMPERATURE,
          });
        }
      }

      batchPlans.push({
        batchId,
        model,
        waypointCount,
        requests,
        pairsWithReps,
      });
    }
  }

  // Print the plan
  printPlan(batchPlans, diagnosticIds, promptFormat, pairs);

  if (dryRun) {
    console.log("(Dry run — no API calls made.)");
    return;
  }

  // Ensure output directory exists
  await mkdir(pilotDir, { recursive: true });

  // Initialize status tracking
  const statusPath = path.join(pilotDir, "pilot-status.json");
  const experimentStart = new Date();

  const status: PilotStatus = {
    startedAt: experimentStart.toISOString(),
    lastUpdatedAt: experimentStart.toISOString(),
    promptFormat,
    models: models.map((m) => m.id),
    waypointCounts,
    totalBatches: batchPlans.length,
    completedBatches: 0,
    totalRuns: batchPlans.reduce((sum, b) => sum + b.requests.length, 0),
    completedRuns: 0,
    failedRuns: 0,
    batchStatuses: batchPlans.map((b) => ({
      batchId: b.batchId,
      model: b.model.id,
      waypointCount: b.waypointCount,
      status: "pending" as const,
      runs: b.requests.length,
      completed: 0,
      failed: 0,
    })),
  };

  await writeStatus(statusPath, status);

  // Execute batches
  const allResults: ElicitationResult[] = [];
  let overallCompleted = 0;
  let overallFailed = 0;

  for (let i = 0; i < batchPlans.length; i++) {
    const batch = batchPlans[i];
    const batchDir = path.join(pilotDir, batch.batchId);

    console.log(
      `\n--- Batch ${i + 1}/${batchPlans.length}: ${batch.batchId} ---`,
    );
    console.log(
      `    ${batch.model.displayName}, ${batch.waypointCount} waypoints, ${batch.requests.length} runs`,
    );

    // Check for existing results to support resuming
    const existing = await loadExistingResults(batchDir);
    const existingCounts = existing.counts;

    // Build the filtered request list — skip pairs with enough reps
    const filteredRequests: ElicitationRequest[] = [];
    const pairRepTracker = new Map<string, number>();

    for (const request of batch.requests) {
      const pairId = request.pair.id;
      const isDiagnostic = diagnosticIds.has(pairId);
      const targetReps = isDiagnostic ? DIAGNOSTIC_REPS : STANDARD_REPS;

      const existingCount = existingCounts.get(pairId) ?? 0;
      const alreadyQueued = pairRepTracker.get(pairId) ?? 0;
      const totalSoFar = existingCount + alreadyQueued;

      if (totalSoFar < targetReps) {
        filteredRequests.push(request);
        pairRepTracker.set(pairId, alreadyQueued + 1);
      }
    }

    const skippedCount = batch.requests.length - filteredRequests.length;
    if (skippedCount > 0) {
      console.log(
        `    Resuming: skipping ${skippedCount} runs with existing results`,
      );
    }

    if (filteredRequests.length === 0) {
      console.log("    All runs already completed. Skipping batch.");
      // Load existing results so summary statistics are correct
      allResults.push(...existing.results);
      status.batchStatuses[i].status = "completed";
      status.batchStatuses[i].completed = batch.requests.length;
      status.completedBatches++;
      overallCompleted += skippedCount;
      status.completedRuns = overallCompleted;
      status.lastUpdatedAt = new Date().toISOString();
      await writeStatus(statusPath, status);
      continue;
    }

    // Also load existing results for partially completed batches
    allResults.push(...existing.results);

    // Update status to running
    status.batchStatuses[i].status = "running";
    status.lastUpdatedAt = new Date().toISOString();
    await writeStatus(statusPath, status);

    // Track timing for ETA estimates
    let batchCompleted = 0;
    let batchFailed = 0;
    const batchStartTime = Date.now();

    const results = await runBatch({
      requests: filteredRequests,
      batchId: batch.batchId,
      outputDir: pilotDir,
      concurrency,
      onProgress: (progress) => {
        batchCompleted = progress.completed;
        batchFailed = progress.failed;

        const batchPct = Math.round(
          (progress.completed / progress.total) * 100,
        );

        // Calculate overall progress
        const currentOverallCompleted =
          overallCompleted + skippedCount + progress.completed;
        const overallPct = Math.round(
          (currentOverallCompleted / status.totalRuns) * 100,
        );

        // Estimate time remaining
        let etaStr = "";
        if (progress.completed > 0) {
          const elapsedMs = Date.now() - batchStartTime;
          const msPerRun = elapsedMs / progress.completed;
          const remainingInBatch = progress.total - progress.completed;

          // Remaining in current batch + all future batches
          let remainingTotal = remainingInBatch;
          for (let j = i + 1; j < batchPlans.length; j++) {
            remainingTotal += batchPlans[j].requests.length;
          }

          const etaMs = msPerRun * remainingTotal;
          etaStr = ` | ETA: ${formatDuration(etaMs)}`;
        }

        process.stdout.write(
          `\r    Batch: ${progress.completed}/${progress.total} (${batchPct}%) | Overall: ${currentOverallCompleted}/${status.totalRuns} (${overallPct}%)${etaStr}    `,
        );

        // Update status file periodically (every 10 completions)
        if (progress.completed % 10 === 0 || progress.completed === progress.total) {
          status.batchStatuses[i].completed = skippedCount + progress.completed;
          status.batchStatuses[i].failed = progress.failed;
          status.completedRuns = overallCompleted + skippedCount + progress.completed;
          status.failedRuns = overallFailed + progress.failed;
          status.lastUpdatedAt = new Date().toISOString();
          // Fire and forget — don't block progress on status write
          writeStatus(statusPath, status).catch(() => {});
        }
      },
    });

    // Newline after progress
    console.log("");

    allResults.push(...results);
    overallCompleted += skippedCount + batchCompleted;
    overallFailed += batchFailed;

    // Update status
    status.batchStatuses[i].status = "completed";
    status.batchStatuses[i].completed = skippedCount + batchCompleted;
    status.batchStatuses[i].failed = batchFailed;
    status.completedBatches++;
    status.completedRuns = overallCompleted;
    status.failedRuns = overallFailed;
    status.lastUpdatedAt = new Date().toISOString();
    await writeStatus(statusPath, status);

    const batchSuccessful = results.filter((r) => !r.failureMode).length;
    console.log(
      `    Completed: ${batchSuccessful}/${results.length} successful` +
        (batchFailed > 0 ? ` (${batchFailed} failed)` : ""),
    );
  }

  // Generate and write summary
  const experimentEnd = new Date();
  const summary = buildSummary(
    allResults,
    diagnosticIds,
    promptFormat,
    experimentStart,
    experimentEnd,
    pairCategoryMap,
  );

  const summaryPath = path.join(pilotDir, "pilot-summary.json");
  const { rename } = await import("node:fs/promises");
  const tmpSummaryPath = `${summaryPath}.tmp.${Date.now()}`;
  await writeFile(tmpSummaryPath, JSON.stringify(summary, null, 2));
  await rename(tmpSummaryPath, summaryPath);

  // Print final summary
  console.log("\n=== Pilot Experiment Complete ===\n");
  console.log(`Duration:       ${formatDuration(summary.durationMs)}`);
  console.log(`Total runs:     ${summary.totalRuns}`);
  console.log(`Successful:     ${summary.successfulRuns}`);
  console.log(`Failed:         ${summary.failedRuns}`);
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

  console.log("Per-waypoint-count breakdown:");
  for (const [wc, stats] of Object.entries(summary.perWaypointCount)) {
    console.log(
      `  w=${wc}: ${stats.successfulRuns}/${stats.totalRuns} (${(stats.successRate * 100).toFixed(1)}%)`,
    );
  }
  console.log("");

  console.log(`Summary written to: ${summaryPath}`);
  console.log(`Status file:        ${statusPath}`);
  console.log(`Results directory:   ${pilotDir}/`);
}

// Run when executed directly
if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
