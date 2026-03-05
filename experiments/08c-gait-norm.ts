#!/usr/bin/env bun
/**
 * Phase 8C: Gait-Normalized Distance Experiment
 *
 * Collects unconstrained 7-waypoint paths for 16 pairs (8 reference + 8 test)
 * to build a gait-normalized distance metric. Some pairs share data with
 * Phase 8A fragility (7 waypoints) and can be reused during analysis; this
 * experiment only collects DEDICATED runs for pairs that have no 7-waypoint
 * source in other phase directories.
 *
 * Data reuse strategy:
 *   - 5 pairs reuse Phase 8A fragility salience data (7wp): science-art,
 *     brain-computer, question-answer, winter-summer, ocean-mountain
 *   - 11 pairs need dedicated 7-waypoint collection here because prior
 *     phase data is either at 5 waypoints or does not exist
 *
 * Dedicated collection pairs (11):
 *   Reference: hot-cold (15), cat-dog (15), music-mathematics (10),
 *              loan-shore (10), spark-telescope (15), mountain-library (15)
 *   Test:      sun-desert (10), seed-garden (10), emotion-melancholy (10),
 *              light-color (10), caterpillar-butterfly (10)
 *
 * Total dedicated runs: 11 pairs x targetReps x 4 models = ~500 runs
 *
 * Usage:
 *   bun run experiments/08c-gait-norm.ts
 *   bun run experiments/08c-gait-norm.ts --dry-run
 *   bun run experiments/08c-gait-norm.ts --models claude,gemini
 */

import { Command } from "commander";
import { writeFile, mkdir, readdir, readFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { MODELS } from "../src/data/pairs.ts";
import {
  PHASE8C_ALL_PAIRS,
  PHASE8C_REFERENCE_PAIRS,
  PHASE8C_TEST_PAIRS,
} from "../src/data/pairs-phase8.ts";
import { Scheduler, parseModelConcurrency } from "../src/scheduler.ts";
import type {
  PromptFormat,
  ModelConfig,
  ConceptPair,
  ElicitationRequest,
  ElicitationResult,
  SchedulerStatus,
  Phase8DistancePair,
} from "../src/types.ts";

// -- Constants ----------------------------------------------------------------

const PROMPT_FORMAT: PromptFormat = "semantic";
const TEMPERATURE = 0.7;
const WAYPOINT_COUNT = 7;
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_MODEL_CONCURRENCY = "claude=2,gpt=2,grok=2,gemini=2";
const DEFAULT_OUTPUT_DIR = "results";

// -- Data Reuse Classification ------------------------------------------------
//
// Phase 8A fragility salience runs use 7 waypoints and can be reused directly
// for gait-norm distance computation. The analysis script loads those runs from
// results/fragility/. This experiment only collects dedicated runs for pairs
// that lack a 7-waypoint data source.
//
// Pairs that CAN reuse Phase 8A fragility salience (7 waypoints):
//   p8c-ref-science-art      -> p8a-science-art salience
//   p8c-ref-brain-computer   -> p8a-brain-computer salience
//   p8c-test-question-answer -> p8a-question-answer salience
//   p8c-test-winter-summer   -> p8a-winter-summer salience
//   p8c-test-ocean-mountain  -> p8a-ocean-mountain salience
//
// Pairs that MUST have dedicated collection (no 7wp source):
//   p8c-ref-hot-cold            (Phase 8B gradient is 5wp)
//   p8c-ref-cat-dog             (new pair)
//   p8c-ref-music-mathematics   (Phase 6A is 5wp)
//   p8c-ref-loan-shore          (prior phases at 5wp or different context)
//   p8c-ref-spark-telescope     (new pair)
//   p8c-ref-mountain-library    (new pair)
//   p8c-test-sun-desert         (Phase 6A is 5wp)
//   p8c-test-seed-garden        (Phase 6A is 5wp)
//   p8c-test-emotion-melancholy (Phase 6A is 5wp)
//   p8c-test-light-color        (Phase 6A is 5wp)
//   p8c-test-caterpillar-butterfly (Phase 8B causal is 5wp)

/** Pair IDs that can reuse Phase 8A fragility salience data at 7 waypoints. */
const REUSABLE_FROM_FRAGILITY: Set<string> = new Set([
  "p8c-ref-science-art",
  "p8c-ref-brain-computer",
  "p8c-test-question-answer",
  "p8c-test-winter-summer",
  "p8c-test-ocean-mountain",
]);

/** Returns true if the pair needs dedicated runs collected by this experiment. */
function needsDedicatedCollection(pair: Phase8DistancePair): boolean {
  return !REUSABLE_FROM_FRAGILITY.has(pair.id);
}

// -- Synthetic Pair Creation --------------------------------------------------

function makeDistancePair(pair: Phase8DistancePair): ConceptPair {
  return {
    id: `${pair.id}--dist`,
    from: pair.from,
    to: pair.to,
    category: "cross-domain",
    concreteness: ["abstract", "abstract"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "reporting",
    notes: `Phase 8C gait-norm distance: ${pair.from} -> ${pair.to} (${pair.role}, expected: ${pair.expectedDistance})`,
  };
}

// -- Resume Support -----------------------------------------------------------

function runKey(pairId: string, modelId: string): string {
  return `${pairId}::${modelId}`;
}

async function loadExistingResults(
  resultsDir: string,
): Promise<{ counts: Map<string, number>; results: ElicitationResult[] }> {
  const counts = new Map<string, number>();
  const results: ElicitationResult[] = [];

  if (!existsSync(resultsDir)) return { counts, results };

  let files: string[];
  try {
    files = await readdir(resultsDir);
  } catch {
    return { counts, results };
  }

  for (const file of files) {
    if (!file.endsWith(".json") || file.startsWith("gait-norm-")) continue;

    try {
      const content = await readFile(path.join(resultsDir, file), "utf-8");
      const result = JSON.parse(content) as ElicitationResult;
      if (result.pair?.id && result.modelShortId) {
        results.push(result);
        if (!result.failureMode) {
          const key = runKey(result.pair.id, result.modelShortId);
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      }
    } catch {
      // Skip malformed
    }
  }

  return { counts, results };
}

// -- Utility ------------------------------------------------------------------

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// -- Main ---------------------------------------------------------------------

async function main() {
  const program = new Command();

  program
    .name("08c-gait-norm")
    .description(
      "Run Phase 8C gait-normalized distance experiment: 7-waypoint unconstrained paths for distance measurement",
    )
    .option("--dry-run", "print the experiment plan without executing")
    .option("--output <dir>", "output directory", DEFAULT_OUTPUT_DIR)
    .option("--concurrency <n>", "global concurrency limit", String(DEFAULT_CONCURRENCY))
    .option(
      "--model-concurrency <spec>",
      'per-model concurrency, e.g., "claude=2,gpt=3"',
      DEFAULT_MODEL_CONCURRENCY,
    )
    .option("--throttle <ms>", "per-model delay between requests", "0")
    .option("--models <ids>", "comma-separated model short IDs (default: all)");

  program.parse();
  const opts = program.opts();

  const outputDir = opts.output as string;
  const gaitNormDir = path.join(outputDir, "gait-norm");
  const dryRun = opts.dryRun === true;

  const globalConcurrency = parseInt(opts.concurrency as string, 10) || DEFAULT_CONCURRENCY;
  const perModelConcurrency = parseModelConcurrency(opts.modelConcurrency as string);
  const throttleMs = parseInt(opts.throttle as string, 10) || 0;

  // Resolve models
  let models: ModelConfig[];
  if (opts.models) {
    const ids = (opts.models as string).split(",").map((s) => s.trim());
    models = [];
    for (const id of ids) {
      const model = MODELS.find((m) => m.id === id);
      if (!model) {
        console.error(`Unknown model "${id}". Valid: ${MODELS.map((m) => m.id).join(", ")}`);
        process.exit(1);
      }
      models.push(model);
    }
  } else {
    models = [...MODELS];
  }

  // Classify pairs
  const dedicatedPairs = PHASE8C_ALL_PAIRS.filter(needsDedicatedCollection);
  const reusablePairs = PHASE8C_ALL_PAIRS.filter((p) => !needsDedicatedCollection(p));

  // Print header
  console.log("=== Phase 8C: Gait-Normalized Distance Experiment ===\n");
  console.log(`Total pairs:          ${PHASE8C_ALL_PAIRS.length} (${PHASE8C_REFERENCE_PAIRS.length} reference, ${PHASE8C_TEST_PAIRS.length} test)`);
  console.log(`Dedicated collection: ${dedicatedPairs.length} pairs (no 7wp reuse source)`);
  console.log(`Reusable from 8A:     ${reusablePairs.length} pairs (7wp fragility salience)`);
  console.log(`Waypoints per path:   ${WAYPOINT_COUNT}`);
  console.log(`Models:               ${models.map((m) => m.displayName).join(", ")}`);
  console.log("");

  // Summarize pair plan
  console.log("Pair plan:");
  console.log("  -- Dedicated collection (this experiment) --");
  for (const pair of dedicatedPairs) {
    const roleTag = pair.role === "reference" ? "REF" : "TEST";
    console.log(`  ${pair.id}--dist [${roleTag}]: "${pair.from}" -> "${pair.to}" — ${pair.targetReps} reps, expected: ${pair.expectedDistance}`);
  }
  console.log("");
  console.log("  -- Reusable from Phase 8A fragility (loaded during analysis) --");
  for (const pair of reusablePairs) {
    const roleTag = pair.role === "reference" ? "REF" : "TEST";
    console.log(`  ${pair.id} [${roleTag}]: "${pair.from}" -> "${pair.to}" — reuse from ${pair.reusableFrom ?? "Phase 8A"}`);
  }
  console.log("");

  // Load existing results for resume support
  const existing = await loadExistingResults(gaitNormDir);
  if (existing.results.length > 0) {
    console.log(`Found ${existing.results.length} existing results in ${gaitNormDir}/`);
    console.log("");
  }

  // Build the run manifest (only for dedicated-collection pairs)
  const allRequests: ElicitationRequest[] = [];
  const requestsToRun: ElicitationRequest[] = [];
  const queuedPerKey = new Map<string, number>();
  let totalSkippedExisting = 0;
  let totalSkippedReuse = 0;

  // Count reusable pair runs for reporting
  for (const pair of reusablePairs) {
    totalSkippedReuse += pair.targetReps * models.length;
  }

  // Queue dedicated-collection pairs
  for (const pair of dedicatedPairs) {
    const syntheticPair = makeDistancePair(pair);

    for (const model of models) {
      const key = runKey(syntheticPair.id, model.id);
      const existingCount = existing.counts.get(key) ?? 0;
      const needed = Math.max(0, pair.targetReps - existingCount);

      // Track all theoretical requests for reporting
      for (let r = 0; r < pair.targetReps; r++) {
        allRequests.push({
          model,
          pair: syntheticPair,
          waypointCount: WAYPOINT_COUNT,
          promptFormat: PROMPT_FORMAT,
          temperature: TEMPERATURE,
        });
      }

      // Only queue the runs we actually need
      const alreadyQueued = queuedPerKey.get(key) ?? 0;
      for (let r = 0; r < needed - alreadyQueued; r++) {
        requestsToRun.push({
          model,
          pair: syntheticPair,
          waypointCount: WAYPOINT_COUNT,
          promptFormat: PROMPT_FORMAT,
          temperature: TEMPERATURE,
        });
      }
      queuedPerKey.set(key, Math.max(alreadyQueued, needed));

      if (existingCount > 0) totalSkippedExisting += existingCount;
    }
  }

  const skippedCount = allRequests.length - requestsToRun.length;

  console.log(`Total dedicated runs: ${allRequests.length}`);
  if (totalSkippedReuse > 0) {
    console.log(`Reusable (8A):        ${totalSkippedReuse} (loaded during analysis from results/fragility/)`);
  }
  if (totalSkippedExisting > 0) {
    console.log(`Already completed:    ${totalSkippedExisting}`);
  }
  console.log(`Runs to execute:      ${requestsToRun.length}`);
  console.log("");

  // Per-pair/model detail
  if (totalSkippedExisting > 0 || requestsToRun.length < allRequests.length) {
    console.log("Per-pair resume status:");
    for (const pair of dedicatedPairs) {
      const syntheticId = `${pair.id}--dist`;
      for (const model of models) {
        const key = runKey(syntheticId, model.id);
        const done = existing.counts.get(key) ?? 0;
        if (done > 0) {
          console.log(`  ${syntheticId} / ${model.id}: ${done}/${pair.targetReps} complete`);
        }
      }
    }
    console.log("");
  }

  // Time estimate
  if (requestsToRun.length > 0) {
    const estLow = Math.round((requestsToRun.length * 2) / globalConcurrency);
    const estHigh = Math.round((requestsToRun.length * 4) / globalConcurrency);
    console.log(`Estimated time:       ${formatDuration(estLow * 1000)} - ${formatDuration(estHigh * 1000)}`);
    console.log("");
  }

  if (dryRun) {
    console.log("(Dry run -- no API calls made.)");
    return;
  }

  if (requestsToRun.length === 0) {
    console.log("All dedicated runs already completed. Nothing to do.");
    return;
  }

  // Ensure output directory
  await mkdir(gaitNormDir, { recursive: true });

  // Per-model progress counters
  const perModelCompleted = new Map<string, number>();
  const perModelFailed = new Map<string, number>();
  for (const model of models) {
    perModelCompleted.set(model.id, 0);
    perModelFailed.set(model.id, 0);
  }

  const newResults: ElicitationResult[] = [];

  // Create scheduler
  const scheduler = new Scheduler(
    { globalConcurrency, perModelConcurrency, throttleMs },
    {
      onResult: async (result: ElicitationResult) => {
        const modelId = result.modelShortId;
        perModelCompleted.set(modelId, (perModelCompleted.get(modelId) ?? 0) + 1);
        if (result.failureMode) {
          perModelFailed.set(modelId, (perModelFailed.get(modelId) ?? 0) + 1);
        }

        // Atomic write
        const resultPath = path.join(gaitNormDir, `${result.runId}.json`);
        try {
          const tmpPath = `${resultPath}.tmp.${Date.now()}`;
          await writeFile(tmpPath, JSON.stringify(result, null, 2));
          await rename(tmpPath, resultPath);
        } catch (writeError: unknown) {
          console.error(
            `Failed to write ${result.runId}:`,
            writeError instanceof Error ? writeError.message : writeError,
          );
        }

        newResults.push(result);
      },

      onProgress: (status: SchedulerStatus) => {
        const batchPct = Math.round(
          (status.completed / status.totalRequests) * 100,
        );

        const modelParts = models.map((m) => {
          const done = perModelCompleted.get(m.id) ?? 0;
          const fail = perModelFailed.get(m.id) ?? 0;
          return `${m.id}:${done}${fail > 0 ? `(${fail}f)` : ""}`;
        });

        let etaStr = "";
        if (status.estimatedRemainingMs != null) {
          etaStr = ` | ETA: ${formatDuration(status.estimatedRemainingMs)}`;
        }

        process.stdout.write(
          `\r  ${status.completed}/${status.totalRequests} (${batchPct}%) | ${modelParts.join(" ")}${etaStr}    `,
        );
      },
    },
  );

  console.log("Starting experiment...\n");
  const startTime = Date.now();

  const results = await scheduler.run(requestsToRun);

  console.log("\n");
  const duration = Date.now() - startTime;

  // Summary
  const successful = results.filter((r) => !r.failureMode);
  const failed = results.filter((r) => r.failureMode);

  console.log("=== Phase 8C: Gait-Normalized Distance Complete ===\n");
  console.log(`Duration:       ${formatDuration(duration)}`);
  console.log(`New runs:       ${results.length}`);
  console.log(`Successful:     ${successful.length}`);
  console.log(`Failed:         ${failed.length}`);
  if (skippedCount > 0) console.log(`Skipped:        ${skippedCount} (pre-existing)`);
  if (totalSkippedReuse > 0) console.log(`Reusable:       ${totalSkippedReuse} (Phase 8A fragility, loaded at analysis)`);
  console.log(`Success rate:   ${results.length > 0 ? ((successful.length / results.length) * 100).toFixed(1) : 0}%`);
  console.log("");

  console.log("Per-model breakdown:");
  for (const model of models) {
    const done = perModelCompleted.get(model.id) ?? 0;
    const fail = perModelFailed.get(model.id) ?? 0;
    console.log(`  ${model.displayName}: ${done - fail}/${done} successful`);
  }
  console.log("");

  // Write summary
  const summaryPath = path.join(gaitNormDir, "gait-norm-summary.json");
  const summary = {
    experiment: "gait-norm",
    phase: "8C",
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: duration,
    allPairs: PHASE8C_ALL_PAIRS.map((p) => ({
      id: p.id,
      role: p.role,
      expectedDistance: p.expectedDistance,
      distanceType: p.distanceType,
    })),
    dedicatedPairs: dedicatedPairs.map((p) => p.id),
    reusablePairs: reusablePairs.map((p) => ({
      id: p.id,
      reusableFrom: p.reusableFrom,
    })),
    models: models.map((m) => m.id),
    waypointCount: WAYPOINT_COUNT,
    repsPerPair: Object.fromEntries(
      dedicatedPairs.map((p) => [`${p.id}--dist`, p.targetReps]),
    ),
    totalDedicatedRuns: results.length + skippedCount,
    newRuns: results.length,
    successfulRuns: successful.length,
    failedRuns: failed.length,
    successRate: results.length > 0 ? successful.length / results.length : 0,
    dataReuse: {
      fragilityDir: "results/fragility/",
      reusablePairIds: [...REUSABLE_FROM_FRAGILITY],
      note: "Analysis script merges data from gait-norm/ and fragility/ directories",
    },
  };
  const tmpSummary = `${summaryPath}.tmp.${Date.now()}`;
  await writeFile(tmpSummary, JSON.stringify(summary, null, 2));
  await rename(tmpSummary, summaryPath);

  console.log(`Summary: ${summaryPath}`);
  console.log(`Results: ${gaitNormDir}/`);

  if (failed.length > 0) {
    console.log("\nFailed runs:");
    for (const r of failed) {
      console.log(`  ${r.pair.id} (${r.modelShortId}): ${r.failureMode}`);
    }
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
