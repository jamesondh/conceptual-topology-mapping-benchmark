#!/usr/bin/env bun
/**
 * Phase 6B: Forced-Crossing Asymmetry Test
 *
 * For each of 8 pairs (4 forced-crossing + 4 same-axis comparison),
 * collects 7-waypoint paths in BOTH forward and reverse directions.
 * Tests whether forced crossings reduce path asymmetry compared to
 * same-domain paths.
 *
 * Each pair is run in two directions:
 *   - Forward: pair.from -> pair.to  (pair ID: ${pair.id}--fwd)
 *   - Reverse: pair.to -> pair.from  (pair ID: ${pair.id}--rev)
 *
 * Total runs: 8 pairs x 2 directions x 10 reps x 4 models = 640
 *
 * Usage:
 *   bun run experiments/06b-forced-crossing.ts
 *   bun run experiments/06b-forced-crossing.ts --dry-run
 *   bun run experiments/06b-forced-crossing.ts --models claude,gemini
 */

import { Command } from "commander";
import { writeFile, mkdir, readdir, readFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { MODELS } from "../src/data/pairs.ts";
import { PHASE6B_PAIRS } from "../src/data/pairs-phase6.ts";
import { Scheduler, parseModelConcurrency } from "../src/scheduler.ts";
import type {
  PromptFormat,
  ModelConfig,
  ConceptPair,
  ElicitationRequest,
  ElicitationResult,
  SchedulerStatus,
  Phase6ForcedCrossingPair,
} from "../src/types.ts";

// -- Constants ----------------------------------------------------------------

const PROMPT_FORMAT: PromptFormat = "semantic";
const TEMPERATURE = 0.7;
const WAYPOINT_COUNT = 7;
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_MODEL_CONCURRENCY = "claude=2,gpt=2,grok=2,gemini=2";
const DEFAULT_OUTPUT_DIR = "results";

// -- Synthetic Pair Creation --------------------------------------------------

function makeDirectionPair(
  fcPair: Phase6ForcedCrossingPair,
  direction: "fwd" | "rev",
): ConceptPair {
  const from = direction === "fwd" ? fcPair.from : fcPair.to;
  const to = direction === "fwd" ? fcPair.to : fcPair.from;

  return {
    id: `${fcPair.id}--${direction}`,
    from,
    to,
    category: "cross-domain",
    concreteness: ["abstract", "abstract"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "reporting",
    notes: `Phase 6B forced-crossing: ${from} -> ${to} (pair: ${fcPair.id}, direction: ${direction}, type: ${fcPair.pairType})`,
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
    if (!file.endsWith(".json") || file.startsWith("forced-crossing-")) continue;

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
    .name("06b-forced-crossing")
    .description(
      "Run Phase 6B forced-crossing asymmetry test: 7-waypoint forward + reverse paths",
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
  const forcedCrossingDir = path.join(outputDir, "forced-crossing");
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

  // Count pair types
  const forcedCrossingPairs = PHASE6B_PAIRS.filter(p => p.pairType === "forced-crossing");
  const sameAxisPairs = PHASE6B_PAIRS.filter(p => p.pairType === "same-axis");

  // Print header
  console.log("=== Phase 6B: Forced-Crossing Asymmetry Test ===\n");
  console.log(`Pairs:                ${PHASE6B_PAIRS.length} (${forcedCrossingPairs.length} forced-crossing, ${sameAxisPairs.length} same-axis)`);
  console.log(`Directions:           2 (forward + reverse)`);
  console.log(`Waypoints per path:   ${WAYPOINT_COUNT}`);
  console.log(`Models:               ${models.map((m) => m.displayName).join(", ")}`);
  console.log("");

  // Summarize pairs
  console.log("Pair plan:");
  for (const pair of PHASE6B_PAIRS) {
    const bridgeInfo = pair.bridge
      ? `bridge: "${pair.bridge}" (freq: ${pair.bridgeFreq})`
      : "no bridge (comparison)";
    console.log(`  ${pair.id} (${pair.pairType}, ${pair.status}): "${pair.from}" <-> "${pair.to}" — ${bridgeInfo}, ${pair.targetReps} reps/dir`);
  }
  console.log("");

  // Load existing results for resume support
  const existing = await loadExistingResults(forcedCrossingDir);
  if (existing.results.length > 0) {
    console.log(`Found ${existing.results.length} existing results in ${forcedCrossingDir}/`);
    console.log("");
  }

  // Build the run manifest
  const allRequests: ElicitationRequest[] = [];
  const requestsToRun: ElicitationRequest[] = [];
  const queuedPerKey = new Map<string, number>();
  let totalSkippedExisting = 0;

  for (const pair of PHASE6B_PAIRS) {
    for (const direction of ["fwd", "rev"] as const) {
      const syntheticPair = makeDirectionPair(pair, direction);

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
  }

  const skippedCount = allRequests.length - requestsToRun.length;

  console.log(`Total runs (target):  ${allRequests.length}`);
  if (totalSkippedExisting > 0) {
    console.log(`Already completed:    ${totalSkippedExisting}`);
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
  await mkdir(forcedCrossingDir, { recursive: true });

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
        const resultPath = path.join(forcedCrossingDir, `${result.runId}.json`);
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

  console.log("=== Phase 6B: Forced-Crossing Asymmetry Test Complete ===\n");
  console.log(`Duration:       ${formatDuration(duration)}`);
  console.log(`New runs:       ${results.length}`);
  console.log(`Successful:     ${successful.length}`);
  console.log(`Failed:         ${failed.length}`);
  if (skippedCount > 0) console.log(`Skipped:        ${skippedCount} (pre-existing)`);
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
  const summaryPath = path.join(forcedCrossingDir, "forced-crossing-summary.json");
  const summary = {
    experiment: "forced-crossing",
    phase: "6B",
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: duration,
    pairs: PHASE6B_PAIRS.map((p) => p.id),
    pairTypes: {
      forcedCrossing: forcedCrossingPairs.map(p => p.id),
      sameAxis: sameAxisPairs.map(p => p.id),
    },
    models: models.map((m) => m.id),
    waypointCount: WAYPOINT_COUNT,
    directions: ["fwd", "rev"],
    repsPerDirection: Object.fromEntries(PHASE6B_PAIRS.map((p) => [p.id, p.targetReps])),
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
  console.log(`Results: ${forcedCrossingDir}/`);

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
