#!/usr/bin/env bun
/**
 * Phase 7B: Curvature Estimation Experiment
 *
 * Collects 5-waypoint paths for each leg of curvature triangles (A->B, B->C,
 * A->C). Triangles compare polysemous-vertex vs non-polysemous-vertex
 * curvature (excess = d(A,B) + d(B,C) - d(A,C)).
 *
 * Where `reusableLegs` specifies a prior pair ID for a leg, that leg is
 * skipped (data loaded from prior results during analysis).
 *
 * New runs: ~760 (8 triangles, ~19 new legs, 10 reps x 4 models)
 *
 * Usage:
 *   bun run experiments/07b-curvature.ts
 *   bun run experiments/07b-curvature.ts --dry-run
 *   bun run experiments/07b-curvature.ts --models claude,gemini
 */

import { Command } from "commander";
import { writeFile, mkdir, readdir, readFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { MODELS } from "../src/data/pairs.ts";
import { PHASE7B_TRIANGLES } from "../src/data/pairs-phase7.ts";
import { Scheduler, parseModelConcurrency } from "../src/scheduler.ts";
import type {
  PromptFormat,
  ModelConfig,
  ConceptPair,
  ElicitationRequest,
  ElicitationResult,
  SchedulerStatus,
  Phase7CurvatureTriangle,
} from "../src/types.ts";

// -- Constants ----------------------------------------------------------------

const PROMPT_FORMAT: PromptFormat = "semantic";
const TEMPERATURE = 0.7;
const WAYPOINT_COUNT = 5;
const TARGET_REPS = 10;
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_MODEL_CONCURRENCY = "claude=2,gpt=2,grok=2,gemini=2";
const DEFAULT_OUTPUT_DIR = "results";

// -- Leg types ----------------------------------------------------------------

type LegLabel = "AB" | "BC" | "AC";

interface TriangleLeg {
  label: LegLabel;
  from: string;
  to: string;
}

function getLegs(tri: Phase7CurvatureTriangle): TriangleLeg[] {
  return [
    { label: "AB", from: tri.A, to: tri.B },
    { label: "BC", from: tri.B, to: tri.C },
    { label: "AC", from: tri.A, to: tri.C },
  ];
}

// -- Synthetic Pair Creation --------------------------------------------------

function makeLegPair(tri: Phase7CurvatureTriangle, leg: TriangleLeg): ConceptPair {
  return {
    id: `${tri.id}--${leg.label}`,
    from: leg.from,
    to: leg.to,
    category: "cross-domain",
    concreteness: ["abstract", "abstract"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "reporting",
    notes: `Phase 7B curvature: ${leg.from} -> ${leg.to} (triangle: ${tri.id}, leg: ${leg.label})`,
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
    if (!file.endsWith(".json") || file.startsWith("curvature-")) continue;

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
    .name("07b-curvature")
    .description(
      "Run Phase 7B curvature estimation experiment: 5-waypoint triangle leg paths",
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
  const curvatureDir = path.join(outputDir, "curvature");
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

  // Categorize legs across all triangles
  let totalLegs = 0;
  let reusableLegsCount = 0;
  let newLegsCount = 0;

  for (const tri of PHASE7B_TRIANGLES) {
    for (const leg of getLegs(tri)) {
      totalLegs++;
      if (tri.reusableLegs[leg.label]) {
        reusableLegsCount++;
      } else {
        newLegsCount++;
      }
    }
  }

  // Print header
  console.log("=== Phase 7B: Curvature Estimation Experiment ===\n");
  console.log(`Triangles:            ${PHASE7B_TRIANGLES.length}`);
  console.log(`  Polysemous vertex:  ${PHASE7B_TRIANGLES.filter((t) => t.vertexType === "polysemous").length}`);
  console.log(`  Non-polysemous:     ${PHASE7B_TRIANGLES.filter((t) => t.vertexType === "non-polysemous").length}`);
  console.log(`Total legs:           ${totalLegs}`);
  console.log(`  Reusable legs:      ${reusableLegsCount} (data from prior phases)`);
  console.log(`  New legs:           ${newLegsCount}`);
  console.log(`Waypoints per path:   ${WAYPOINT_COUNT}`);
  console.log(`Reps per model/leg:   ${TARGET_REPS}`);
  console.log(`Models:               ${models.map((m) => m.displayName).join(", ")}`);
  console.log("");

  // Summarize triangles
  console.log("Triangle plan:");
  for (const tri of PHASE7B_TRIANGLES) {
    const legs = getLegs(tri);
    const legDetails = legs.map((leg) => {
      const reuse = tri.reusableLegs[leg.label];
      return `${leg.label}${reuse ? ` [reuse: ${reuse}]` : ""}`;
    });
    const vertexInfo = tri.vertexType === "polysemous"
      ? `polysemous (${tri.polysemyLabel})`
      : `non-polysemous (${tri.relationship ?? "unspecified"})`;
    console.log(`  ${tri.id}: ${tri.A}-${tri.B}-${tri.C} — ${vertexInfo}`);
    console.log(`    Legs: ${legDetails.join(", ")}`);
  }
  console.log("");

  // Load existing results for resume support
  const existing = await loadExistingResults(curvatureDir);
  if (existing.results.length > 0) {
    console.log(`Found ${existing.results.length} existing results in ${curvatureDir}/`);
    console.log("");
  }

  // Build the run manifest (only for new legs)
  const allRequests: ElicitationRequest[] = [];
  const requestsToRun: ElicitationRequest[] = [];
  const queuedPerKey = new Map<string, number>();
  let totalSkippedExisting = 0;
  let totalSkippedReuse = 0;

  for (const tri of PHASE7B_TRIANGLES) {
    for (const leg of getLegs(tri)) {
      // Check if this leg is reusable from a prior phase
      if (tri.reusableLegs[leg.label]) {
        totalSkippedReuse += TARGET_REPS * models.length;
        console.log(
          `  Skipping ${tri.id}--${leg.label}: reuse from ${tri.reusableLegs[leg.label]}`,
        );
        continue;
      }

      const syntheticPair = makeLegPair(tri, leg);

      for (const model of models) {
        const key = runKey(syntheticPair.id, model.id);
        const existingCount = existing.counts.get(key) ?? 0;
        const needed = Math.max(0, TARGET_REPS - existingCount);

        // Track all theoretical requests for reporting
        for (let r = 0; r < TARGET_REPS; r++) {
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
  console.log("");

  const skippedCount = allRequests.length - requestsToRun.length;

  console.log(`Total new-leg runs:   ${allRequests.length}`);
  if (totalSkippedReuse > 0) {
    console.log(`Reusable (prior):     ${totalSkippedReuse} (loaded during analysis)`);
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
    console.log("(Dry run -- no API calls made.)");
    return;
  }

  if (requestsToRun.length === 0) {
    console.log("All runs already completed. Nothing to do.");
    return;
  }

  // Ensure output directory
  await mkdir(curvatureDir, { recursive: true });

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
        const resultPath = path.join(curvatureDir, `${result.runId}.json`);
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

  console.log("=== Phase 7B: Curvature Estimation Complete ===\n");
  console.log(`Duration:       ${formatDuration(duration)}`);
  console.log(`New runs:       ${results.length}`);
  console.log(`Successful:     ${successful.length}`);
  console.log(`Failed:         ${failed.length}`);
  if (skippedCount > 0) console.log(`Skipped:        ${skippedCount} (pre-existing)`);
  if (totalSkippedReuse > 0) console.log(`Reusable:       ${totalSkippedReuse} (prior phases, loaded at analysis)`);
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
  const summaryPath = path.join(curvatureDir, "curvature-summary.json");
  const reusableLegsList: Array<{ triangleId: string; leg: string; priorPairId: string }> = [];
  for (const tri of PHASE7B_TRIANGLES) {
    for (const [leg, priorId] of Object.entries(tri.reusableLegs)) {
      reusableLegsList.push({ triangleId: tri.id, leg, priorPairId: priorId });
    }
  }

  const summary = {
    experiment: "curvature",
    phase: "7B",
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: duration,
    triangles: PHASE7B_TRIANGLES.map((t) => ({
      id: t.id,
      vertexType: t.vertexType,
      vertices: [t.A, t.B, t.C],
    })),
    reusableLegs: reusableLegsList,
    models: models.map((m) => m.id),
    waypointCount: WAYPOINT_COUNT,
    targetReps: TARGET_REPS,
    totalNewLegRuns: results.length + skippedCount,
    newRuns: results.length,
    successfulRuns: successful.length,
    failedRuns: failed.length,
    successRate: results.length > 0 ? successful.length / results.length : 0,
  };
  const tmpSummary = `${summaryPath}.tmp.${Date.now()}`;
  await writeFile(tmpSummary, JSON.stringify(summary, null, 2));
  await rename(tmpSummary, summaryPath);

  console.log(`Summary: ${summaryPath}`);
  console.log(`Results: ${curvatureDir}/`);

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
