#!/usr/bin/env bun
/**
 * Phase 4B: Targeted Bridge Topology Experiment
 *
 * For each of 8 Phase 4 concept triples (A, B, C), collects waypoint paths
 * for forward legs: A→B, B→C, A→C. Reuses existing Phase 1/2/3B data where
 * available, topping up to the per-triple target rep count (20 for diagnostic
 * triples, 10 for controls).
 *
 * Top-up logic:
 * - Legs marked as fully reusable via reusableLegs are skipped entirely
 * - Legs with partial data from earlier phases (reusableLegsWithSource) are
 *   topped up: existing runs across all result dirs count toward targetReps
 * - Fully new legs get targetReps new runs per model
 *
 * Usage:
 *   bun run experiments/04b-targeted-bridges.ts
 *   bun run experiments/04b-targeted-bridges.ts --dry-run
 *   bun run experiments/04b-targeted-bridges.ts --models claude,gemini
 */

import { Command } from "commander";
import { writeFile, mkdir, readdir, readFile, rename, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { MODELS } from "../pairs.ts";
import { PHASE4_TRIPLES } from "../triples-phase4.ts";
import { Scheduler, parseModelConcurrency } from "../scheduler.ts";
import type {
  PromptFormat,
  ModelConfig,
  ConceptPair,
  ElicitationRequest,
  ElicitationResult,
  SchedulerStatus,
  Phase4Triple,
} from "../types.ts";

// -- Constants ----------------------------------------------------------------

const PROMPT_FORMAT: PromptFormat = "semantic";
const TEMPERATURE = 0.7;
const WAYPOINT_COUNT = 5;
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_MODEL_CONCURRENCY = "claude=2,gpt=2,grok=2,gemini=2";
const DEFAULT_OUTPUT_DIR = "results";

/** Directories that may contain reusable runs from earlier phases. */
const REUSE_SUBDIRS = ["pilot", "reversals", "transitivity", "targeted-bridges"];

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
    category: "cross-domain",
    concreteness: ["abstract", "abstract"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "reporting",
    notes: `Phase 4 targeted bridge leg: ${from} → ${to} (triple: ${tripleId})`,
  };
}

// -- Recursive JSON reader ----------------------------------------------------

/**
 * Recursively find all JSON result files under a directory.
 * Skips files containing "summary" or "status" in their name.
 */
async function readJsonFilesRecursive(dir: string): Promise<string[]> {
  const paths: string[] = [];
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return paths;
  }
  for (const name of names) {
    const fullPath = path.join(dir, name);
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

/**
 * Load all ElicitationResult objects from a directory (recursively).
 */
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

// -- Resume / Reuse Support ---------------------------------------------------

function runKey(pairId: string, modelId: string): string {
  return `${pairId}::${modelId}`;
}

/**
 * Count successful runs per (pairId, modelId) across a set of results.
 */
function countSuccessfulRuns(results: ElicitationResult[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const r of results) {
    if (r.failureMode) continue;
    if (!r.pair?.id || !r.modelShortId) continue;
    const key = runKey(r.pair.id, r.modelShortId);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/**
 * Load existing results from the targeted-bridges output directory.
 * Returns both the results array and a per-(pair, model) success count map.
 */
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
    if (!file.endsWith(".json") || file.startsWith("targeted-bridges-")) continue;

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

/**
 * Load all results from prior-phase directories (pilot, reversals, transitivity)
 * and count successful runs per (pairId, modelId). Used for top-up accounting.
 */
async function loadPriorPhaseCounts(
  baseOutputDir: string,
): Promise<Map<string, number>> {
  const allCounts = new Map<string, number>();

  for (const subdir of REUSE_SUBDIRS) {
    const dir = path.join(baseOutputDir, subdir);
    if (!existsSync(dir)) continue;

    const results = await loadResultsFromDir(dir);
    for (const r of results) {
      if (r.failureMode) continue;
      if (!r.pair?.id || !r.modelShortId) continue;
      const key = runKey(r.pair.id, r.modelShortId);
      allCounts.set(key, (allCounts.get(key) ?? 0) + 1);
    }
  }

  return allCounts;
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
    .name("04b-targeted-bridges")
    .description(
      "Run Phase 4B targeted bridge topology experiment: forward legs for Phase 4 triples",
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
  const targetedBridgesDir = path.join(outputDir, "targeted-bridges");
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

  // Print header
  console.log("=== Phase 4B: Targeted Bridge Topology Experiment ===\n");
  console.log(`Triples:              ${PHASE4_TRIPLES.length}`);
  console.log(`Models:               ${models.map((m) => m.displayName).join(", ")}`);
  console.log(`Legs per triple:      3 (forward only: AB, BC, AC)`);
  console.log("");

  // Load prior-phase run counts for top-up accounting
  console.log("Scanning prior-phase results for reusable runs...");
  const priorCounts = await loadPriorPhaseCounts(outputDir);
  if (priorCounts.size > 0) {
    console.log(`  Found ${priorCounts.size} unique (pair, model) keys across prior phases`);
  } else {
    console.log("  No prior-phase results found");
  }
  console.log("");

  // Load existing results from this experiment's output dir for resume support
  const existing = await loadExistingResults(targetedBridgesDir);
  if (existing.results.length > 0) {
    console.log(`Found ${existing.results.length} existing results in ${targetedBridgesDir}/`);
    console.log("");
  }

  // Build the run manifest
  // For each triple, determine which forward legs need new runs
  const FORWARD_LEGS: Array<{ legId: string; fromKey: "A" | "B" | "A"; toKey: "B" | "C" | "C" }> = [
    { legId: "AB", fromKey: "A", toKey: "B" },
    { legId: "BC", fromKey: "B", toKey: "C" },
    { legId: "AC", fromKey: "A", toKey: "C" },
  ];

  interface LegPlan {
    tripleId: string;
    legId: string;
    from: string;
    to: string;
    pairId: string;
    targetReps: number;
    /** Pair ID to search in prior-phase data for top-up accounting */
    reusePairId: string | null;
    /** Whether this leg is fully reusable (skip entirely) */
    fullyReusable: boolean;
  }

  const legPlans: LegPlan[] = [];

  for (const triple of PHASE4_TRIPLES) {
    const reuse = triple.reusableLegs ?? {};
    const topUp = triple.reusableLegsWithSource ?? {};

    for (const fwd of FORWARD_LEGS) {
      const legId = fwd.legId as "AB" | "BC" | "AC";
      const from = triple[fwd.fromKey];
      const to = triple[fwd.toKey];

      // Check if fully reusable from existing data (skip entirely)
      const reusablePairId = reuse[legId] ?? null;
      if (reusablePairId) {
        legPlans.push({
          tripleId: triple.id,
          legId,
          from,
          to,
          pairId: `${triple.id}--${legId}`,
          targetReps: triple.targetReps,
          reusePairId: reusablePairId,
          fullyReusable: true,
        });
        continue;
      }

      // Check if there is a top-up source
      const topUpSource = topUp[legId] ?? null;
      const reusePairId = topUpSource?.pairId ?? null;

      legPlans.push({
        tripleId: triple.id,
        legId,
        from,
        to,
        pairId: `${triple.id}--${legId}`,
        targetReps: triple.targetReps,
        reusePairId,
        fullyReusable: false,
      });
    }
  }

  // Summarize the plan per triple
  console.log("Leg plan per triple:");
  let totalFullyReusable = 0;
  let totalTopUp = 0;
  let totalNew = 0;

  for (const triple of PHASE4_TRIPLES) {
    const tripleLegs = legPlans.filter((l) => l.tripleId === triple.id);
    console.log(`  ${triple.id} (target: ${triple.targetReps} reps, type: ${triple.diagnosticType})`);
    for (const leg of tripleLegs) {
      if (leg.fullyReusable) {
        console.log(`    ${leg.legId}: fully reusable from "${leg.reusePairId}"`);
        totalFullyReusable++;
      } else if (leg.reusePairId) {
        console.log(`    ${leg.legId}: top-up (reuse from "${leg.reusePairId}")`);
        totalTopUp++;
      } else {
        console.log(`    ${leg.legId}: new ("${leg.from}" -> "${leg.to}")`);
        totalNew++;
      }
    }
  }
  console.log("");
  console.log(`Legs: ${totalFullyReusable} fully reusable, ${totalTopUp} top-up, ${totalNew} new`);
  console.log("");

  // Build requests: for each non-fully-reusable leg, compute how many new runs are needed
  const allRequests: ElicitationRequest[] = [];
  const requestsToRun: ElicitationRequest[] = [];
  const queuedPerKey = new Map<string, number>();

  let totalSkippedExisting = 0;
  let totalSkippedReuse = 0;

  for (const leg of legPlans) {
    // Skip fully reusable legs
    if (leg.fullyReusable) continue;

    const pair = makeLegPair(leg.tripleId, leg.legId, leg.from, leg.to);

    for (const model of models) {
      // Count existing runs toward this leg's target:
      // 1. Runs from this experiment (targeted-bridges dir) using the synthetic pair ID
      const thisExpKey = runKey(leg.pairId, model.id);
      const thisExpCount = existing.counts.get(thisExpKey) ?? 0;

      // 2. Runs from prior phases using the reuse pair ID (if any)
      let priorCount = 0;
      if (leg.reusePairId) {
        const priorKey = runKey(leg.reusePairId, model.id);
        priorCount = priorCounts.get(priorKey) ?? 0;
      }

      const totalExisting = thisExpCount + priorCount;
      const needed = Math.max(0, leg.targetReps - totalExisting);

      // Track all theoretical requests for reporting
      for (let r = 0; r < leg.targetReps; r++) {
        const request: ElicitationRequest = {
          model,
          pair,
          waypointCount: WAYPOINT_COUNT,
          promptFormat: PROMPT_FORMAT,
          temperature: TEMPERATURE,
        };
        allRequests.push(request);
      }

      // Only queue the runs we actually need
      const alreadyQueued = queuedPerKey.get(thisExpKey) ?? 0;
      for (let r = 0; r < needed - alreadyQueued; r++) {
        const request: ElicitationRequest = {
          model,
          pair,
          waypointCount: WAYPOINT_COUNT,
          promptFormat: PROMPT_FORMAT,
          temperature: TEMPERATURE,
        };
        requestsToRun.push(request);
      }
      queuedPerKey.set(thisExpKey, Math.max(alreadyQueued, needed));

      if (thisExpCount > 0) totalSkippedExisting += thisExpCount;
      if (priorCount > 0) totalSkippedReuse += Math.min(priorCount, leg.targetReps);
    }
  }

  const skippedCount = allRequests.length - requestsToRun.length;

  console.log(`Total runs (target):  ${allRequests.length}`);
  if (totalSkippedReuse > 0) {
    console.log(`Prior-phase reuse:    ${totalSkippedReuse}`);
  }
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
  await mkdir(targetedBridgesDir, { recursive: true });

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
        const resultPath = path.join(targetedBridgesDir, `${result.runId}.json`);
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

  console.log("=== Phase 4B: Targeted Bridge Topology Complete ===\n");
  console.log(`Duration:       ${formatDuration(duration)}`);
  console.log(`New runs:       ${results.length}`);
  console.log(`Successful:     ${successful.length}`);
  console.log(`Failed:         ${failed.length}`);
  if (skippedCount > 0) console.log(`Skipped:        ${skippedCount} (reused + pre-existing)`);
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
  const summaryPath = path.join(targetedBridgesDir, "targeted-bridges-summary.json");
  const summary = {
    experiment: "targeted-bridges",
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: duration,
    triples: PHASE4_TRIPLES.map((t) => t.id),
    models: models.map((m) => m.id),
    repsPerTriple: Object.fromEntries(PHASE4_TRIPLES.map((t) => [t.id, t.targetReps])),
    legsFullyReusable: totalFullyReusable,
    legsTopUp: totalTopUp,
    legsNew: totalNew,
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
  console.log(`Results: ${targetedBridgesDir}/`);

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
