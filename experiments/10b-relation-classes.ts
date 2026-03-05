#!/usr/bin/env bun
/**
 * Phase 10B: Pre-Fill Relation Classes Experiment
 *
 * Tests whether the semantic relationship between pre-fill concept and bridge
 * concept (classified as on-axis substitute, same-domain off-axis, or unrelated)
 * predicts bridge survival under pre-fill.
 *
 * All runs are pre-fill runs. No unconstrained baseline collection needed
 * (reused from prior phases).
 *
 * 8 pairs x 3 conditions x 4 models x 10 reps = 960 runs
 *
 * Output directory: results/relation-classes/
 *
 * Usage:
 *   bun run experiments/10b-relation-classes.ts
 *   bun run experiments/10b-relation-classes.ts --dry-run
 *   bun run experiments/10b-relation-classes.ts --models claude,gemini
 */

import { Command } from "commander";
import { writeFile, mkdir, readdir, readFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { MODELS } from "../src/data/pairs.ts";
import { PHASE10B_PAIRS } from "../src/data/pairs-phase10.ts";
import { extractWaypoints, canonicalizeAll } from "../src/canonicalize.ts";
import { Scheduler, parseModelConcurrency } from "../src/scheduler.ts";
import type {
  PromptFormat,
  ModelConfig,
  ConceptPair,
  ElicitationRequest,
  ElicitationResult,
  Phase10RelationClassPair,
  RelationClass,
} from "../src/types.ts";

// -- Constants ----------------------------------------------------------------

const PROMPT_FORMAT: PromptFormat = "semantic";
const TEMPERATURE = 0.7;
const WAYPOINT_COUNT = 7;
const PREFILL_WAYPOINT_COUNT = 6; // Pre-filled responses yield 6 waypoints
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_MODEL_CONCURRENCY = "claude=2,gpt=2,grok=2,gemini=2";
const DEFAULT_OUTPUT_DIR = "results";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_RETRIES = 3;

const RELATION_CLASSES: RelationClass[] = ["on-axis", "same-domain", "unrelated"];

// -- Pre-filled Prompt Construction -------------------------------------------

function buildPreFilledPrompt(
  from: string,
  to: string,
  preFilledConcept: string,
): string {
  return [
    `The first intermediate concept between "${from}" and "${to}" is "${preFilledConcept}".`,
    `List exactly 6 more intermediate concepts that continue the path from "${preFilledConcept}" to "${to}".`,
    `Respond with only the concepts, one per line, numbered 1 through 6.`,
    `Do not include "${from}", "${preFilledConcept}", or "${to}" in your list.`,
  ].join("\n");
}

// -- OpenRouter Direct Call (for pre-filled prompts) --------------------------

interface OpenRouterResponse {
  id?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
    code?: number;
  };
}

function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("network") ||
      msg.includes("timeout") ||
      msg.includes("econnreset") ||
      msg.includes("econnrefused") ||
      msg.includes("fetch failed")
    ) {
      return true;
    }
  }
  return false;
}

function isRateLimitOrServerError(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callOpenRouter(
  model: string,
  prompt: string,
  temperature: number,
): Promise<{ text: string; generationId?: string; providerRoute?: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY environment variable is not set. " +
        "Set it in your environment or in a .env file.",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  let response: Response;
  try {
    response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/jamesondh/conceptual-topology-mapping-benchmark",
        "X-Title": "Conceptual Topology Mapping Benchmark",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature,
      }),
      signal: controller.signal,
    });
  } catch (error: unknown) {
    clearTimeout(timeout);
    throw error;
  }
  clearTimeout(timeout);

  if (!response.ok) {
    if (isRateLimitOrServerError(response.status)) {
      const body = await response.text().catch(() => "");
      throw Object.assign(
        new Error(`OpenRouter API error ${response.status}: ${body}`),
        { transient: true, status: response.status },
      );
    }
    const body = await response.text().catch(() => "");
    throw new Error(`OpenRouter API error ${response.status}: ${body}`);
  }

  const data = (await response.json()) as OpenRouterResponse;

  if (data.error) {
    throw new Error(`OpenRouter API error: ${data.error.message}`);
  }

  const text = data.choices?.[0]?.message?.content ?? "";
  const generationId = data.id;
  const providerRoute = response.headers.get("x-openrouter-provider") ?? undefined;

  if (!text || text.trim().length === 0) {
    throw Object.assign(
      new Error("OpenRouter returned empty response content"),
      { transient: true },
    );
  }

  return { text, generationId, providerRoute };
}

// -- Custom Elicitation for Pre-filled Prompts --------------------------------

async function elicitPreFilled(
  model: ModelConfig,
  pair: Phase10RelationClassPair,
  preFilledConcept: string,
  syntheticPairId: string,
): Promise<ElicitationResult> {
  const runId = crypto.randomUUID();
  const promptText = buildPreFilledPrompt(pair.from, pair.to, preFilledConcept);
  const startTime = Date.now();

  let rawResponse = "";
  let openRouterGenId: string | undefined;
  let providerRoute: string | undefined;
  let retryCount = 0;
  let failureMode: string | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await callOpenRouter(
        model.openRouterId,
        promptText,
        TEMPERATURE,
      );
      rawResponse = result.text;
      openRouterGenId = result.generationId;
      providerRoute = result.providerRoute;
      break;
    } catch (error: unknown) {
      const isTransient_ =
        isTransientError(error) ||
        (error as { transient?: boolean }).transient === true;

      if (isTransient_ && attempt < MAX_RETRIES) {
        retryCount++;
        failureMode = error instanceof Error ? error.message : String(error);
        const backoffMs = 1000 * Math.pow(2, attempt);
        await sleep(backoffMs);
        continue;
      }

      // Non-transient or exhausted retries
      const durationMs = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        model: model.openRouterId,
        modelShortId: model.id,
        pair: { from: pair.from, to: pair.to, id: syntheticPairId },
        waypointCount: WAYPOINT_COUNT,
        promptFormat: "direct" as PromptFormat,
        promptText,
        temperature: TEMPERATURE,
        rawResponse: "",
        extractedWaypoints: [],
        canonicalizedWaypoints: [],
        timestamp: new Date(startTime).toISOString(),
        durationMs,
        retryCount,
        failureMode: errorMessage,
        runId,
        batchId: "phase10b",
      };
    }
  }

  const durationMs = Date.now() - startTime;

  // Extract 6 waypoints from the response
  const extractedWaypoints = extractWaypoints(rawResponse, PREFILL_WAYPOINT_COUNT);
  const canonicalized6 = canonicalizeAll(extractedWaypoints);

  // Prepend the pre-filled concept to form the full 7-waypoint path
  const preFilledCanonical = canonicalizeAll([preFilledConcept]);
  const fullWaypoints = [...preFilledCanonical, ...canonicalized6];

  // Enforce waypoint count (lenient)
  let extractionCountMismatch = false;
  let finalWaypoints = fullWaypoints;
  if (fullWaypoints.length !== WAYPOINT_COUNT) {
    extractionCountMismatch = true;
    if (fullWaypoints.length > WAYPOINT_COUNT) {
      finalWaypoints = fullWaypoints.slice(0, WAYPOINT_COUNT);
    }
  }

  // Clear failureMode if we ultimately succeeded
  if (rawResponse) {
    failureMode = undefined;
  }

  const elicitResult: ElicitationResult = {
    model: model.openRouterId,
    modelShortId: model.id,
    pair: { from: pair.from, to: pair.to, id: syntheticPairId },
    waypointCount: WAYPOINT_COUNT,
    promptFormat: "direct" as PromptFormat,
    promptText,
    temperature: TEMPERATURE,
    rawResponse,
    extractedWaypoints: [preFilledConcept, ...extractedWaypoints],
    canonicalizedWaypoints: finalWaypoints,
    timestamp: new Date(startTime).toISOString(),
    durationMs,
    retryCount,
    runId,
    batchId: "phase10b",
    ...(providerRoute ? { providerRoute } : {}),
    ...(openRouterGenId ? { openRouterGenId } : {}),
    ...(failureMode ? { failureMode } : {}),
    ...(extractionCountMismatch ? { extractionCountMismatch: true } : {}),
  };

  return elicitResult;
}

// -- Synthetic Pair Creation --------------------------------------------------

function makeSyntheticPair(
  pair: Phase10RelationClassPair,
  condition: RelationClass,
): ConceptPair {
  return {
    id: `${pair.id}--${condition}`,
    from: pair.from,
    to: pair.to,
    category: "cross-domain",
    concreteness: ["abstract", "abstract"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "reporting",
    notes: `Phase 10B relation class: "${pair.from}" -> "${pair.to}" (condition: ${condition}, bridge: ${pair.bridge})`,
  };
}

// -- Get Pre-Fill Concept for a Condition ------------------------------------

function getPreFillConcept(
  pair: Phase10RelationClassPair,
  condition: RelationClass,
): string {
  switch (condition) {
    case "on-axis":
      return pair.onAxisPreFill;
    case "same-domain":
      return pair.sameDomainPreFill;
    case "unrelated":
      return pair.unrelatedPreFill;
  }
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
    if (!file.endsWith(".json") || file.startsWith("relation-classes-")) continue;

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
    .name("10b-relation-classes")
    .description(
      "Run Phase 10B pre-fill relation classes experiment: test whether pre-fill/bridge semantic relationship predicts bridge survival",
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
  const relationClassesDir = path.join(outputDir, "relation-classes");
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
  console.log("=== Phase 10B: Pre-Fill Relation Classes Experiment ===\n");
  console.log(`Total pairs:             ${PHASE10B_PAIRS.length}`);
  console.log(`Conditions:              ${RELATION_CLASSES.join(", ")}`);
  console.log(`Reps per condition:      ${PHASE10B_PAIRS[0].targetReps}`);
  console.log(`Models:                  ${models.map((m) => m.displayName).join(", ")}`);
  console.log("");

  // Summarize pairs
  console.log("Pair plan:");
  for (const pair of PHASE10B_PAIRS) {
    console.log(
      `  ${pair.id}: "${pair.from}" -> "${pair.to}" | ` +
      `bridge: "${pair.bridge}" freq: ${pair.unconstrainedFreq.toFixed(3)} | ` +
      `on-axis: "${pair.onAxisPreFill}", same-domain: "${pair.sameDomainPreFill}", unrelated: "${pair.unrelatedPreFill}"`,
    );
  }
  console.log("");

  // Load existing results for resume support
  const existing = await loadExistingResults(relationClassesDir);
  if (existing.results.length > 0) {
    console.log(`Found ${existing.results.length} existing results in ${relationClassesDir}/`);
    console.log("");
  }

  // -- Build the run manifest --

  interface PreFilledRun {
    model: ModelConfig;
    pair: Phase10RelationClassPair;
    condition: RelationClass;
    preFillConcept: string;
    syntheticPairId: string;
  }

  const preFilledRuns: PreFilledRun[] = [];

  for (const pair of PHASE10B_PAIRS) {
    for (const condition of RELATION_CLASSES) {
      const syntheticPairId = `${pair.id}--${condition}`;
      const preFillConcept = getPreFillConcept(pair, condition);

      for (const model of models) {
        const key = runKey(syntheticPairId, model.id);
        const existingCount = existing.counts.get(key) ?? 0;
        const needed = Math.max(0, pair.targetReps - existingCount);
        for (let r = 0; r < needed; r++) {
          preFilledRuns.push({
            model,
            pair,
            condition,
            preFillConcept,
            syntheticPairId,
          });
        }
      }
    }
  }

  const totalNewRuns = preFilledRuns.length;

  // Budget breakdown
  const targetTotal = PHASE10B_PAIRS.length * RELATION_CLASSES.length * models.length * PHASE10B_PAIRS[0].targetReps;

  console.log("Run budget:");
  console.log(`  ${PHASE10B_PAIRS.length} pairs x ${RELATION_CLASSES.length} conditions x ${models.length} models x ${PHASE10B_PAIRS[0].targetReps} reps = ${targetTotal}`);
  console.log("");
  console.log(`Existing results:         ${existing.results.length}`);
  console.log(`Runs to execute:          ${totalNewRuns}`);
  console.log("");

  // Time estimate
  if (totalNewRuns > 0) {
    const estLow = Math.round((totalNewRuns * 2) / globalConcurrency);
    const estHigh = Math.round((totalNewRuns * 4) / globalConcurrency);
    console.log(`Estimated time:           ${formatDuration(estLow * 1000)} - ${formatDuration(estHigh * 1000)}`);
    console.log("");
  }

  if (dryRun) {
    console.log("(Dry run -- no API calls made.)");
    return;
  }

  if (totalNewRuns === 0) {
    console.log("All runs already completed. Nothing to do.");
    return;
  }

  // Ensure output directory
  await mkdir(relationClassesDir, { recursive: true });

  // Per-model progress counters
  const perModelCompleted = new Map<string, number>();
  const perModelFailed = new Map<string, number>();
  for (const model of models) {
    perModelCompleted.set(model.id, 0);
    perModelFailed.set(model.id, 0);
  }

  const allNewResults: ElicitationResult[] = [];
  let totalCompleted = 0;
  const experimentStartTime = Date.now();

  let writeFailures = 0;

  // Helper: write a result atomically
  async function writeResult(result: ElicitationResult): Promise<boolean> {
    const resultPath = path.join(relationClassesDir, `${result.runId}.json`);
    try {
      const tmpPath = `${resultPath}.tmp.${Date.now()}`;
      await writeFile(tmpPath, JSON.stringify(result, null, 2));
      await rename(tmpPath, resultPath);
      return true;
    } catch (writeError: unknown) {
      console.error(
        `\u26a0 Failed to persist ${result.runId}:`,
        writeError instanceof Error ? writeError.message : writeError,
      );
      return false;
    }
  }

  // Helper: report progress
  function reportProgress(): void {
    const batchPct = Math.round((totalCompleted / totalNewRuns) * 100);
    const modelParts = models.map((m) => {
      const done = perModelCompleted.get(m.id) ?? 0;
      const fail = perModelFailed.get(m.id) ?? 0;
      return `${m.id}:${done}${fail > 0 ? `(${fail}f)` : ""}`;
    });

    let etaStr = "";
    if (totalCompleted > 0) {
      const elapsedMs = Date.now() - experimentStartTime;
      const msPerRun = elapsedMs / totalCompleted;
      const remainingMs = Math.round(msPerRun * (totalNewRuns - totalCompleted));
      etaStr = ` | ETA: ${formatDuration(remainingMs)}`;
    }

    process.stdout.write(
      `\r  ${totalCompleted}/${totalNewRuns} (${batchPct}%) | ${modelParts.join(" ")}${etaStr}    `,
    );
  }

  console.log("Starting experiment...\n");
  console.log(`Running ${preFilledRuns.length} pre-fill requests...`);

  // Use semaphore-style concurrency control for pre-filled runs
  const modelLastRequest = new Map<string, number>();

  // Process pre-filled runs with concurrency control
  let runIndex = 0;

  async function processPreFilledRun(): Promise<void> {
    while (runIndex < preFilledRuns.length) {
      const idx = runIndex++;
      const run = preFilledRuns[idx];
      const modelId = run.model.id;

      // Apply throttle
      if (throttleMs > 0) {
        const lastTime = modelLastRequest.get(modelId) ?? 0;
        const elapsed = Date.now() - lastTime;
        if (elapsed < throttleMs) {
          await sleep(throttleMs - elapsed);
        }
      }
      modelLastRequest.set(modelId, Date.now());

      try {
        const result = await elicitPreFilled(
          run.model,
          run.pair,
          run.preFillConcept,
          run.syntheticPairId,
        );

        perModelCompleted.set(modelId, (perModelCompleted.get(modelId) ?? 0) + 1);
        if (result.failureMode) {
          perModelFailed.set(modelId, (perModelFailed.get(modelId) ?? 0) + 1);
        }

        const written = await writeResult(result);
        if (!written) writeFailures++;
        allNewResults.push(result);
      } catch (error: unknown) {
        // Unexpected error -- record as failure
        const errorMsg = error instanceof Error ? error.message : String(error);
        const failResult: ElicitationResult = {
          model: run.model.openRouterId,
          modelShortId: run.model.id,
          pair: { from: run.pair.from, to: run.pair.to, id: run.syntheticPairId },
          waypointCount: WAYPOINT_COUNT,
          promptFormat: "direct" as PromptFormat,
          promptText: buildPreFilledPrompt(run.pair.from, run.pair.to, run.preFillConcept),
          temperature: TEMPERATURE,
          rawResponse: "",
          extractedWaypoints: [],
          canonicalizedWaypoints: [],
          timestamp: new Date().toISOString(),
          durationMs: 0,
          retryCount: 0,
          failureMode: errorMsg,
          runId: crypto.randomUUID(),
          batchId: "phase10b",
        };
        perModelCompleted.set(modelId, (perModelCompleted.get(modelId) ?? 0) + 1);
        perModelFailed.set(modelId, (perModelFailed.get(modelId) ?? 0) + 1);
        const written = await writeResult(failResult);
        if (!written) writeFailures++;
        allNewResults.push(failResult);
      }

      totalCompleted++;
      reportProgress();
    }
  }

  // Launch concurrent workers
  const workerCount = Math.min(globalConcurrency, preFilledRuns.length);
  const workers: Promise<void>[] = [];
  for (let i = 0; i < workerCount; i++) {
    workers.push(processPreFilledRun());
  }
  await Promise.all(workers);

  console.log(`\n  Pre-fill collection complete: ${allNewResults.length} results\n`);

  const duration = Date.now() - experimentStartTime;

  // Summary
  const successful = allNewResults.filter((r) => !r.failureMode);
  const failed = allNewResults.filter((r) => r.failureMode);

  console.log("=== Phase 10B: Pre-Fill Relation Classes Experiment Complete ===\n");
  console.log(`Duration:       ${formatDuration(duration)}`);
  console.log(`New runs:       ${allNewResults.length}`);
  console.log(`Successful:     ${successful.length}`);
  console.log(`Failed:         ${failed.length}`);
  console.log(`Success rate:   ${allNewResults.length > 0 ? ((successful.length / allNewResults.length) * 100).toFixed(1) : 0}%`);
  if (writeFailures > 0) {
    console.log(`\u26a0 Write failures: ${writeFailures} (results may need re-collection)`);
  }
  console.log("");

  // Per-condition breakdown
  const conditionCounts = new Map<string, { total: number; failed: number }>();
  for (const result of allNewResults) {
    const pairId = result.pair.id;
    const condition = pairId.includes("--") ? pairId.split("--").pop()! : "unknown";
    const entry = conditionCounts.get(condition) ?? { total: 0, failed: 0 };
    entry.total++;
    if (result.failureMode) entry.failed++;
    conditionCounts.set(condition, entry);
  }
  console.log("Per-condition breakdown:");
  for (const [condition, counts] of conditionCounts) {
    const successCount = counts.total - counts.failed;
    console.log(`  ${condition}: ${successCount}/${counts.total} successful`);
  }
  console.log("");

  console.log("Per-model breakdown:");
  for (const model of models) {
    const done = perModelCompleted.get(model.id) ?? 0;
    const fail = perModelFailed.get(model.id) ?? 0;
    console.log(`  ${model.displayName}: ${done - fail}/${done} successful`);
  }
  console.log("");

  // Write summary
  const summaryPath = path.join(relationClassesDir, "relation-classes-summary.json");
  const summary = {
    experiment: "relation-classes",
    phase: "10B",
    startedAt: new Date(experimentStartTime).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: duration,
    pairs: PHASE10B_PAIRS.map((p) => p.id),
    conditions: RELATION_CLASSES,
    models: models.map((m) => m.id),
    waypointCount: WAYPOINT_COUNT,
    totalNewRuns: allNewResults.length,
    successfulRuns: successful.length,
    failedRuns: failed.length,
    successRate: allNewResults.length > 0 ? successful.length / allNewResults.length : 0,
    perCondition: Object.fromEntries(conditionCounts),
    perModel: Object.fromEntries(
      models.map((m) => [
        m.id,
        {
          completed: perModelCompleted.get(m.id) ?? 0,
          failed: perModelFailed.get(m.id) ?? 0,
        },
      ]),
    ),
  };
  const tmpSummary = `${summaryPath}.tmp.${Date.now()}`;
  await writeFile(tmpSummary, JSON.stringify(summary, null, 2));
  await rename(tmpSummary, summaryPath);

  console.log(`Summary: ${summaryPath}`);
  console.log(`Results: ${relationClassesDir}/`);

  if (failed.length > 0) {
    console.log("\nFailed runs (first 20):");
    for (const r of failed.slice(0, 20)) {
      console.log(`  ${r.pair.id} (${r.modelShortId}): ${r.failureMode}`);
    }
    if (failed.length > 20) {
      console.log(`  ... and ${failed.length - 20} more.`);
    }
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
