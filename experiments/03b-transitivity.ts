#!/usr/bin/env bun
/**
 * Phase 3B: Transitive Path Structure Experiment
 *
 * For each of 8 concept triples (A, B, C), collects waypoint paths for
 * all 6 legs: A→B, B→A, B→C, C→B, A→C, C→A. Reuses existing Phase 1/2
 * data where available, only making new API calls for missing legs.
 *
 * Total: ~600 new forward-only runs (30 new legs × 4 models × 5 reps)
 * Optional: --reps 10 for more statistical power
 * Optional: --with-reverses to also collect reverse legs (doubles run count)
 *
 * Usage:
 *   bun run experiments/03b-transitivity.ts
 *   bun run experiments/03b-transitivity.ts --dry-run
 *   bun run experiments/03b-transitivity.ts --reps 10
 */

import { Command } from "commander";
import { writeFile, mkdir, readdir, readFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { MODELS } from "../src/data/pairs.ts";
import { TRIPLES, getTripleLegs, countLegs } from "../src/data/triples.ts";
import { Scheduler, parseModelConcurrency } from "../src/scheduler.ts";
import type {
  PromptFormat,
  ModelConfig,
  ConceptPair,
  ElicitationRequest,
  ElicitationResult,
  SchedulerStatus,
} from "../src/types.ts";

// -- Constants ----------------------------------------------------------------

const PROMPT_FORMAT: PromptFormat = "semantic";
const TEMPERATURE = 0.7;
const WAYPOINT_COUNT = 5;
const DEFAULT_REPS = 10;
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_MODEL_CONCURRENCY = "claude=2,gpt=2,grok=2,gemini=2";
const DEFAULT_OUTPUT_DIR = "results";

// -- Synthetic Pair Creation --------------------------------------------------

/**
 * Create a synthetic ConceptPair for a triple leg.
 * The pair ID encodes the triple ID and leg direction.
 */
function makeLegPair(
  tripleId: string,
  legId: string,
  from: string,
  to: string,
): ConceptPair {
  return {
    id: `${tripleId}--${legId}`,
    from,
    to,
    category: "cross-domain", // Doesn't matter for experiment, just needs a valid value
    concreteness: ["abstract", "abstract"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "reporting",
    notes: `Transitivity experiment leg: ${from} → ${to} (triple: ${tripleId})`,
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
    if (!file.endsWith(".json") || file.startsWith("transitivity-")) continue;

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
    .name("03b-transitivity")
    .description("Run Phase 3B transitivity experiment: waypoint paths for concept triples")
    .option("--dry-run", "print the experiment plan without executing")
    .option("--output <dir>", "output directory", DEFAULT_OUTPUT_DIR)
    .option("--reps <n>", "repetitions per condition", String(DEFAULT_REPS))
    .option("--concurrency <n>", "global concurrency limit", String(DEFAULT_CONCURRENCY))
    .option(
      "--model-concurrency <spec>",
      'per-model concurrency, e.g., "claude=2,gpt=3"',
      DEFAULT_MODEL_CONCURRENCY,
    )
    .option("--throttle <ms>", "per-model delay between requests", "0")
    .option("--models <ids>", "comma-separated model short IDs (default: all)")
    .option("--with-reverses", "also run reverse legs (doubles run count)");

  program.parse();
  const opts = program.opts();

  const outputDir = opts.output as string;
  const transitivityDir = path.join(outputDir, "transitivity");
  const dryRun = opts.dryRun === true;
  const withReverses = opts.withReverses === true;
  const repsPerCondition = parseInt(opts.reps as string, 10) || DEFAULT_REPS;

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

  // Determine which legs need new runs
  const legCounts = countLegs();
  console.log("=== Phase 3B: Transitive Path Structure Experiment ===\n");
  console.log(`Triples:              ${TRIPLES.length}`);
  console.log(`Total legs:           ${legCounts.totalLegs} (${legCounts.reusedLegs} reused, ${legCounts.newLegs} new)`);
  console.log(`Reps per condition:   ${repsPerCondition}`);
  console.log(`Models:               ${models.map((m) => m.displayName).join(", ")}`);
  console.log(`With reverses:        ${withReverses ? "yes (all 6 legs)" : "no (forward legs only: AB, BC, AC)"}`);
  console.log("");

  // Build the run manifest
  // For each triple, determine which legs need new runs
  const legsToRun: Array<{
    tripleId: string;
    legId: string;
    from: string;
    to: string;
    pairId: string;
  }> = [];

  for (const triple of TRIPLES) {
    const legs = getTripleLegs(triple);
    for (const leg of legs) {
      // Skip reverse legs unless --with-reverses
      if (!withReverses && (leg.legId === "BA" || leg.legId === "CB" || leg.legId === "CA")) {
        continue;
      }

      // Skip if reusable from existing data
      if (leg.reusablePairId) continue;

      const pairId = `${triple.id}--${leg.legId}`;
      legsToRun.push({
        tripleId: triple.id,
        legId: leg.legId,
        from: leg.from,
        to: leg.to,
        pairId,
      });
    }
  }

  console.log(`New legs to run: ${legsToRun.length}`);
  for (const leg of legsToRun) {
    console.log(`  ${leg.tripleId} ${leg.legId}: "${leg.from}" → "${leg.to}"`);
  }
  console.log("");

  // Load existing results for resume support
  const existing = await loadExistingResults(transitivityDir);
  if (existing.results.length > 0) {
    console.log(`Found ${existing.results.length} existing results in ${transitivityDir}/`);
  }

  // Build requests
  const allRequests: ElicitationRequest[] = [];
  const requestsToRun: ElicitationRequest[] = [];
  const queuedPerKey = new Map<string, number>();

  for (const leg of legsToRun) {
    const pair = makeLegPair(leg.tripleId, leg.legId, leg.from, leg.to);

    for (const model of models) {
      const key = runKey(leg.pairId, model.id);
      const existingCount = existing.counts.get(key) ?? 0;

      for (let r = 0; r < repsPerCondition; r++) {
        const request: ElicitationRequest = {
          model,
          pair,
          waypointCount: WAYPOINT_COUNT,
          promptFormat: PROMPT_FORMAT,
          temperature: TEMPERATURE,
        };
        allRequests.push(request);

        const alreadyQueued = queuedPerKey.get(key) ?? 0;
        if (existingCount + alreadyQueued < repsPerCondition) {
          requestsToRun.push(request);
          queuedPerKey.set(key, alreadyQueued + 1);
        }
      }
    }
  }

  const skippedCount = allRequests.length - requestsToRun.length;

  console.log(`Total runs (full):    ${allRequests.length}`);
  if (skippedCount > 0) {
    console.log(`Already completed:    ${skippedCount}`);
  }
  console.log(`Runs to execute:      ${requestsToRun.length}`);
  console.log("");

  // Time estimate
  if (requestsToRun.length > 0) {
    const estLow = Math.round((requestsToRun.length * 2) / globalConcurrency);
    const estHigh = Math.round((requestsToRun.length * 4) / globalConcurrency);
    console.log(`Estimated time:       ${formatDuration(estLow * 1000)} - ${formatDuration(estHigh * 1000)}`);
    console.log("");
  }

  if (dryRun) {
    console.log("(Dry run — no API calls made.)");
    return;
  }

  if (requestsToRun.length === 0) {
    console.log("All runs already completed. Nothing to do.");
    return;
  }

  // Ensure output directory
  await mkdir(transitivityDir, { recursive: true });

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
        const resultPath = path.join(transitivityDir, `${result.runId}.json`);
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

  console.log("=== Phase 3B: Transitivity Experiment Complete ===\n");
  console.log(`Duration:       ${formatDuration(duration)}`);
  console.log(`New runs:       ${results.length}`);
  console.log(`Successful:     ${successful.length}`);
  console.log(`Failed:         ${failed.length}`);
  if (skippedCount > 0) console.log(`Resumed:        ${skippedCount} pre-existing`);
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
  const summaryPath = path.join(transitivityDir, "transitivity-summary.json");
  const summary = {
    experiment: "transitivity",
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: duration,
    triples: TRIPLES.map((t) => t.id),
    models: models.map((m) => m.id),
    repsPerCondition,
    withReverses,
    totalRuns: results.length + skippedCount,
    newRuns: results.length,
    successfulRuns: successful.length,
    failedRuns: failed.length,
    successRate: results.length > 0 ? successful.length / results.length : 0,
  };
  const tmpSummary = `${summaryPath}.tmp.${Date.now()}`;
  await writeFile(tmpSummary, JSON.stringify(summary, null, 2));
  await rename(tmpSummary, summaryPath);

  console.log(`Summary: ${summaryPath}`);
  console.log(`Results: ${transitivityDir}/`);

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
