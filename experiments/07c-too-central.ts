#!/usr/bin/env bun
/**
 * Phase 7C: Too-Central Boundary Characterization Experiment
 *
 * Two run types:
 *   1. Primary paths: A->C for each of the 10 too-central pairs (10 reps x 4 models).
 *      Pairs p7c-spark-ash and p7c-hot-cold reuse prior phase data (0 new runs).
 *   2. Redundancy probes: For each starting concept A, collect paths from A to 3
 *      random targets (telescope, mountain, library). Tests whether the candidate
 *      bridge is just a high-frequency associate of A, not pair-specific.
 *      1 rep x 4 models per A->target combination = 120 new runs.
 *
 * New runs: ~440 (320 primary + 120 probes)
 *
 * Usage:
 *   bun run experiments/07c-too-central.ts
 *   bun run experiments/07c-too-central.ts --dry-run
 *   bun run experiments/07c-too-central.ts --models claude,gemini
 */

import { Command } from "commander";
import { writeFile, mkdir, readdir, readFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { MODELS } from "../src/data/pairs.ts";
import { PHASE7C_PAIRS } from "../src/data/pairs-phase7.ts";
import { Scheduler, parseModelConcurrency } from "../src/scheduler.ts";
import type {
  PromptFormat,
  ModelConfig,
  ConceptPair,
  ElicitationRequest,
  ElicitationResult,
  SchedulerStatus,
  Phase7TooCentralPair,
} from "../src/types.ts";

// -- Constants ----------------------------------------------------------------

const PROMPT_FORMAT: PromptFormat = "semantic";
const TEMPERATURE = 0.7;
const WAYPOINT_COUNT = 5;
const PRIMARY_REPS = 10;
const PROBE_REPS = 1; // 1 rep per model per A->target
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_MODEL_CONCURRENCY = "claude=2,gpt=2,grok=2,gemini=2";
const DEFAULT_OUTPUT_DIR = "results";

/** Pairs that reuse data from prior phases (no new primary runs needed). */
const REUSE_PAIR_IDS = new Set(["p7c-spark-ash", "p7c-hot-cold"]);

/** Random targets for informational redundancy probes. */
const RANDOM_TARGETS = ["telescope", "mountain", "library"];

// -- Synthetic Pair Creation --------------------------------------------------

function makePrimaryPair(tcPair: Phase7TooCentralPair): ConceptPair {
  return {
    id: `${tcPair.id}--primary`,
    from: tcPair.from,
    to: tcPair.to,
    category: "cross-domain",
    concreteness: ["abstract", "abstract"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "reporting",
    notes: `Phase 7C primary: ${tcPair.from} -> ${tcPair.to} (candidate bridge: "${tcPair.candidateBridge}", category: ${tcPair.category})`,
  };
}

function makeProbePair(
  tcPair: Phase7TooCentralPair,
  target: string,
): ConceptPair {
  return {
    id: `${tcPair.id}--probe-${target}`,
    from: tcPair.from,
    to: target,
    category: "cross-domain",
    concreteness: ["abstract", "abstract"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "reporting",
    notes: `Phase 7C redundancy probe: ${tcPair.from} -> ${target} (testing bridge "${tcPair.candidateBridge}" specificity)`,
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
    if (!file.endsWith(".json") || file.startsWith("too-central-")) continue;

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
    .name("07c-too-central")
    .description(
      "Run Phase 7C too-central boundary characterization: primary paths + redundancy probes",
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
  const tooCentralDir = path.join(outputDir, "too-central");
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

  // Categorize pairs
  const reusePairs = PHASE7C_PAIRS.filter((p) => REUSE_PAIR_IDS.has(p.id));
  const newDataPairs = PHASE7C_PAIRS.filter((p) => !REUSE_PAIR_IDS.has(p.id));

  // Print header
  console.log("=== Phase 7C: Too-Central Boundary Characterization ===\n");
  console.log(`Total pairs:          ${PHASE7C_PAIRS.length}`);
  console.log(`  Reuse (prior data): ${reusePairs.length} (${reusePairs.map((p) => p.id).join(", ")})`);
  console.log(`  New primary data:   ${newDataPairs.length}`);
  console.log(`Redundancy probes:    ${PHASE7C_PAIRS.length} starting concepts x ${RANDOM_TARGETS.length} targets`);
  console.log(`Waypoints per path:   ${WAYPOINT_COUNT}`);
  console.log(`Models:               ${models.map((m) => m.displayName).join(", ")}`);
  console.log("");

  // Summarize pairs
  console.log("Pair plan:");
  for (const pair of PHASE7C_PAIRS) {
    const reuse = REUSE_PAIR_IDS.has(pair.id) ? "REUSE" : `${PRIMARY_REPS} reps`;
    console.log(`  ${pair.id} (${pair.category}): "${pair.from}" -> "${pair.to}" — bridge: "${pair.candidateBridge}", expected: ${pair.expectedFreq}, ${reuse}`);
  }
  console.log("");

  // Load existing results for resume support
  const existing = await loadExistingResults(tooCentralDir);
  if (existing.results.length > 0) {
    console.log(`Found ${existing.results.length} existing results in ${tooCentralDir}/`);
    console.log("");
  }

  // Build the run manifest
  const allRequests: ElicitationRequest[] = [];
  const requestsToRun: ElicitationRequest[] = [];
  const queuedPerKey = new Map<string, number>();
  let totalSkippedExisting = 0;

  // --- Primary paths (new-data pairs only) ---
  for (const pair of newDataPairs) {
    const syntheticPair = makePrimaryPair(pair);

    for (const model of models) {
      const key = runKey(syntheticPair.id, model.id);
      const existingCount = existing.counts.get(key) ?? 0;
      const needed = Math.max(0, PRIMARY_REPS - existingCount);

      for (let r = 0; r < PRIMARY_REPS; r++) {
        allRequests.push({
          model,
          pair: syntheticPair,
          waypointCount: WAYPOINT_COUNT,
          promptFormat: PROMPT_FORMAT,
          temperature: TEMPERATURE,
        });
      }

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

      if (existingCount > 0) totalSkippedExisting += Math.min(existingCount, PRIMARY_REPS);
    }
  }

  // --- Redundancy probes (all 10 pairs x 3 targets x 1 rep x 4 models) ---
  for (const pair of PHASE7C_PAIRS) {
    for (const target of RANDOM_TARGETS) {
      const probePair = makeProbePair(pair, target);

      for (const model of models) {
        const key = runKey(probePair.id, model.id);
        const existingCount = existing.counts.get(key) ?? 0;
        const needed = Math.max(0, PROBE_REPS - existingCount);

        for (let r = 0; r < PROBE_REPS; r++) {
          allRequests.push({
            model,
            pair: probePair,
            waypointCount: WAYPOINT_COUNT,
            promptFormat: PROMPT_FORMAT,
            temperature: TEMPERATURE,
          });
        }

        const alreadyQueued = queuedPerKey.get(key) ?? 0;
        for (let r = 0; r < needed - alreadyQueued; r++) {
          requestsToRun.push({
            model,
            pair: probePair,
            waypointCount: WAYPOINT_COUNT,
            promptFormat: PROMPT_FORMAT,
            temperature: TEMPERATURE,
          });
        }
        queuedPerKey.set(key, Math.max(alreadyQueued, needed));

        if (existingCount > 0) totalSkippedExisting += Math.min(existingCount, PROBE_REPS);
      }
    }
  }

  const skippedCount = allRequests.length - requestsToRun.length;

  console.log(`Total runs (target):  ${allRequests.length}`);
  console.log(`  Primary paths:      ${newDataPairs.length * models.length * PRIMARY_REPS}`);
  console.log(`  Redundancy probes:  ${PHASE7C_PAIRS.length * RANDOM_TARGETS.length * models.length * PROBE_REPS}`);
  if (totalSkippedExisting > 0) {
    console.log(`Already completed:    ${totalSkippedExisting}`);
  }
  console.log(`Reuse-only pairs:     ${reusePairs.length} (no new primary runs)`);
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
    console.log("(Dry run -- no API calls made.)");
    return;
  }

  if (requestsToRun.length === 0) {
    console.log("All runs already completed. Nothing to do.");
    return;
  }

  // Ensure output directory
  await mkdir(tooCentralDir, { recursive: true });

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
        const resultPath = path.join(tooCentralDir, `${result.runId}.json`);
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

  const primaryResults = results.filter((r) => r.pair.id.endsWith("--primary"));
  const probeResults = results.filter((r) => r.pair.id.includes("--probe-"));

  console.log("=== Phase 7C: Too-Central Boundary Characterization Complete ===\n");
  console.log(`Duration:             ${formatDuration(duration)}`);
  console.log(`New runs:             ${results.length}`);
  console.log(`  Primary paths:      ${primaryResults.length}`);
  console.log(`  Redundancy probes:  ${probeResults.length}`);
  console.log(`Successful:           ${successful.length}`);
  console.log(`Failed:               ${failed.length}`);
  if (skippedCount > 0) console.log(`Skipped:              ${skippedCount} (pre-existing)`);
  console.log(`Reuse-only:           ${reusePairs.length} pairs (prior phase data)`);
  console.log(`Success rate:         ${results.length > 0 ? ((successful.length / results.length) * 100).toFixed(1) : 0}%`);
  console.log("");

  console.log("Per-model breakdown:");
  for (const model of models) {
    const done = perModelCompleted.get(model.id) ?? 0;
    const fail = perModelFailed.get(model.id) ?? 0;
    console.log(`  ${model.displayName}: ${done - fail}/${done} successful`);
  }
  console.log("");

  // Write summary
  const summaryPath = path.join(tooCentralDir, "too-central-summary.json");
  const summary = {
    experiment: "too-central",
    phase: "7C",
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: duration,
    pairs: PHASE7C_PAIRS.map((p) => p.id),
    pairCategories: {
      tooCentral: PHASE7C_PAIRS.filter((p) => p.category === "too-central").map((p) => p.id),
      obviousUseful: PHASE7C_PAIRS.filter((p) => p.category === "obvious-useful").map((p) => p.id),
      boundary: PHASE7C_PAIRS.filter((p) => p.category === "boundary").map((p) => p.id),
    },
    reusePairs: reusePairs.map((p) => p.id),
    models: models.map((m) => m.id),
    waypointCount: WAYPOINT_COUNT,
    randomTargets: RANDOM_TARGETS,
    primaryReps: PRIMARY_REPS,
    probeReps: PROBE_REPS,
    totalRuns: results.length + skippedCount,
    newRuns: results.length,
    primaryRuns: primaryResults.length,
    probeRuns: probeResults.length,
    successfulRuns: successful.length,
    failedRuns: failed.length,
    successRate: results.length > 0 ? successful.length / results.length : 0,
  };
  const tmpSummary = `${summaryPath}.tmp.${Date.now()}`;
  await writeFile(tmpSummary, JSON.stringify(summary, null, 2));
  await rename(tmpSummary, summaryPath);

  console.log(`Summary: ${summaryPath}`);
  console.log(`Results: ${tooCentralDir}/`);

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
