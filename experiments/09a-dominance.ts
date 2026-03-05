#!/usr/bin/env bun
/**
 * Phase 9A: Bridge Dominance Ratio Experiment
 *
 * Tests whether dominance ratio (bridge freq / strongest competitor freq)
 * predicts bridge survival under pre-fill perturbation. Two-stage design:
 *
 * Stage 1 (Gap-filling salience): Collect supplementary unconstrained runs
 *   for pairs where Phase 8B data has fewer than 10 reps per model.
 *   Only needed if Phase 8B data is insufficient.
 *   Via Scheduler (unconstrained, 7 waypoints).
 *
 * Stage 2 (Pre-fill displacement): Collect pre-filled paths for all 6 new
 *   pairs to measure bridge survival under incongruent perturbation.
 *   6 pairs x 10 reps x 4 models = 240 runs (custom elicitation).
 *
 * Total: ~240-400 new runs depending on Phase 8B data coverage.
 *
 * Usage:
 *   bun run experiments/09a-dominance.ts
 *   bun run experiments/09a-dominance.ts --dry-run
 *   bun run experiments/09a-dominance.ts --models claude,gemini
 */

import { Command } from "commander";
import { writeFile, mkdir, readdir, readFile, rename, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { MODELS } from "../src/data/pairs.ts";
import { PHASE9A_PAIRS, PHASE9A_TO_8B_MAP } from "../src/data/pairs-phase9.ts";
import { buildPrompt, elicit } from "../src/index.ts";
import { extractWaypoints, canonicalizeAll } from "../src/canonicalize.ts";
import { Scheduler, parseModelConcurrency } from "../src/scheduler.ts";
import type {
  PromptFormat,
  ModelConfig,
  ConceptPair,
  ElicitationRequest,
  ElicitationResult,
  SchedulerStatus,
  Phase9DominancePair,
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
  pair: Phase9DominancePair,
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
        promptFormat: "direct" as PromptFormat, // Pre-filled uses custom format
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
    ...(providerRoute ? { providerRoute } : {}),
    ...(openRouterGenId ? { openRouterGenId } : {}),
    ...(failureMode ? { failureMode } : {}),
    ...(extractionCountMismatch ? { extractionCountMismatch: true } : {}),
  };

  return elicitResult;
}

// -- Synthetic Pair Creation --------------------------------------------------

function makeSyntheticPair(
  pair: Phase9DominancePair,
  suffix: string,
): ConceptPair {
  return {
    id: `${pair.id}--${suffix}`,
    from: pair.from,
    to: pair.to,
    category: "cross-domain",
    concreteness: ["abstract", "abstract"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "reporting",
    notes: `Phase 9A dominance: "${pair.from}" -> "${pair.to}" (stage: ${suffix}, predicted bridge: ${pair.predictedBridge})`,
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
    if (!file.endsWith(".json") || file.startsWith("dominance-")) continue;

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

// -- Phase 8B Data Loading ----------------------------------------------------

/**
 * Count existing Phase 8B runs per pair/model from results/gradient/.
 * Returns a Map keyed by "phase8bPairId::modelId" -> run count.
 */
async function countPhase8BRuns(
  gradientDir: string,
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (!existsSync(gradientDir)) return counts;

  const jsonFiles = await readJsonFilesRecursive(gradientDir);

  for (const filePath of jsonFiles) {
    try {
      const content = await readFile(filePath, "utf-8");
      const result = JSON.parse(content) as ElicitationResult;
      if (result.pair?.id && result.modelShortId && !result.failureMode) {
        if (result.canonicalizedWaypoints && result.canonicalizedWaypoints.length > 0) {
          const key = runKey(result.pair.id, result.modelShortId);
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      }
    } catch {
      // Skip malformed
    }
  }

  return counts;
}

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
    .name("09a-dominance")
    .description(
      "Run Phase 9A bridge dominance ratio experiment: gap-filling salience + pre-fill displacement",
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
  const dominanceDir = path.join(outputDir, "dominance");
  const gradientDir = path.join(outputDir, "gradient");
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
  console.log("=== Phase 9A: Bridge Dominance Ratio Experiment ===\n");
  console.log(`Total pairs:             ${PHASE9A_PAIRS.length}`);
  console.log(`Stage 1 (gap-fill):      up to ${PHASE9A_PAIRS[0].targetReps.salience} reps/model (unconstrained, ${WAYPOINT_COUNT} waypoints)`);
  console.log(`Stage 2 (pre-fill):      ${PHASE9A_PAIRS[0].targetReps.preFill} reps/model (pre-filled, ${WAYPOINT_COUNT} total waypoints)`);
  console.log(`Models:                  ${models.map((m) => m.displayName).join(", ")}`);
  console.log("");

  // Summarize pairs
  console.log("Pair plan:");
  for (const pair of PHASE9A_PAIRS) {
    const phase8bId = PHASE9A_TO_8B_MAP[pair.id] ?? "unknown";
    console.log(
      `  ${pair.id} (8B: ${phase8bId}): "${pair.from}" -> "${pair.to}" | ` +
      `predicted bridge: "${pair.predictedBridge}" | ` +
      `salience: ${pair.targetReps.salience} reps, pre-fill: ${pair.targetReps.preFill} reps (concept: "${pair.preFillConcept}")`,
    );
  }
  console.log("");

  // Load existing Phase 9A results for resume support
  const existing = await loadExistingResults(dominanceDir);
  if (existing.results.length > 0) {
    console.log(`Found ${existing.results.length} existing Phase 9A results in ${dominanceDir}/`);
    console.log("");
  }

  // Load Phase 8B run counts to determine gap-filling needs
  console.log("Checking Phase 8B data coverage...");
  const phase8BCounts = await countPhase8BRuns(gradientDir);

  // -- Build the run manifest --

  // Stage 1: Gap-filling salience runs (unconstrained, via Scheduler)
  // Only collect if Phase 8B has fewer than targetReps for a pair/model
  const salienceRequests: ElicitationRequest[] = [];

  for (const pair of PHASE9A_PAIRS) {
    const phase8bPairId = PHASE9A_TO_8B_MAP[pair.id];
    const syntheticPair = makeSyntheticPair(pair, "salience");
    const targetReps = pair.targetReps.salience;

    for (const model of models) {
      // Check Phase 8B data under multiple key patterns
      const phase8bKeyPatterns = [
        `${phase8bPairId}::${model.id}`,
        `${phase8bPairId}--primary::${model.id}`,
        `${phase8bPairId}--fwd::${model.id}`,
      ];

      let phase8bCount = 0;
      for (const key of phase8bKeyPatterns) {
        const count = phase8BCounts.get(key) ?? 0;
        if (count > phase8bCount) phase8bCount = count;
      }

      // Also check existing Phase 9A salience data
      const p9aKey = runKey(syntheticPair.id, model.id);
      const p9aCount = existing.counts.get(p9aKey) ?? 0;

      const totalExisting = phase8bCount + p9aCount;
      const needed = Math.max(0, targetReps - totalExisting);

      if (needed > 0) {
        console.log(
          `  ${pair.id} (${model.id}): Phase 8B has ${phase8bCount}, Phase 9A has ${p9aCount}, need ${needed} more salience runs`,
        );
      }

      for (let r = 0; r < needed; r++) {
        salienceRequests.push({
          model,
          pair: syntheticPair,
          waypointCount: WAYPOINT_COUNT,
          promptFormat: PROMPT_FORMAT,
          temperature: TEMPERATURE,
        });
      }
    }
  }
  console.log("");

  // Stage 2: Pre-fill runs (custom elicitation)
  interface PreFilledRun {
    model: ModelConfig;
    pair: Phase9DominancePair;
    preFillConcept: string;
    syntheticPairId: string;
  }

  const preFilledRuns: PreFilledRun[] = [];

  for (const pair of PHASE9A_PAIRS) {
    const syntheticPairId = `${pair.id}--prefill`;
    const targetReps = pair.targetReps.preFill;

    for (const model of models) {
      const key = runKey(syntheticPairId, model.id);
      const existingCount = existing.counts.get(key) ?? 0;
      const needed = Math.max(0, targetReps - existingCount);
      for (let r = 0; r < needed; r++) {
        preFilledRuns.push({
          model,
          pair,
          preFillConcept: pair.preFillConcept,
          syntheticPairId,
        });
      }
    }
  }

  const totalNewRuns = salienceRequests.length + preFilledRuns.length;

  // Budget breakdown
  const targetSalience = salienceRequests.length; // Dynamic based on Phase 8B coverage
  const targetPreFill = PHASE9A_PAIRS.length * PHASE9A_PAIRS[0].targetReps.preFill * models.length;

  console.log("Run budget:");
  console.log(`  Stage 1 (gap-fill):     ${salienceRequests.length} supplementary salience runs needed`);
  console.log(`  Stage 2 (pre-fill):     ${PHASE9A_PAIRS.length} pairs x ${PHASE9A_PAIRS[0].targetReps.preFill} reps x ${models.length} models = ${targetPreFill} target`);
  console.log("");
  console.log(`Existing Phase 9A results: ${existing.results.length}`);
  console.log(`Salience to run:          ${salienceRequests.length}`);
  console.log(`Pre-fill to run:          ${preFilledRuns.length}`);
  console.log(`Total new runs:           ${totalNewRuns}`);
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
  await mkdir(dominanceDir, { recursive: true });

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

  // Helper: write a result atomically
  async function writeResult(result: ElicitationResult): Promise<void> {
    const resultPath = path.join(dominanceDir, `${result.runId}.json`);
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

  // -- Stage 1: Run gap-filling salience requests via Scheduler --

  if (salienceRequests.length > 0) {
    console.log(`Running ${salienceRequests.length} gap-filling salience requests (Stage 1)...`);

    const scheduler = new Scheduler(
      { globalConcurrency, perModelConcurrency, throttleMs },
      {
        onResult: async (result: ElicitationResult) => {
          const modelId = result.modelShortId;
          perModelCompleted.set(modelId, (perModelCompleted.get(modelId) ?? 0) + 1);
          if (result.failureMode) {
            perModelFailed.set(modelId, (perModelFailed.get(modelId) ?? 0) + 1);
          }
          await writeResult(result);
          allNewResults.push(result);
          totalCompleted++;
          reportProgress();
        },
        onProgress: () => {},
      },
    );

    const salienceResults = await scheduler.run(salienceRequests);
    console.log(`\n  Stage 1 (gap-fill salience) complete: ${salienceResults.length} results\n`);
  }

  // -- Stage 2: Run pre-filled requests with custom elicitation --

  if (preFilledRuns.length > 0) {
    console.log(`Running ${preFilledRuns.length} pre-fill requests (Stage 2)...`);

    // Use semaphore-style concurrency control for pre-filled runs
    const modelLastRequest = new Map<string, number>();

    // Process pre-filled runs with concurrency control
    let runIndex = 0;
    const preFilledResults: ElicitationResult[] = [];

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

          await writeResult(result);
          preFilledResults.push(result);
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
          };
          perModelCompleted.set(modelId, (perModelCompleted.get(modelId) ?? 0) + 1);
          perModelFailed.set(modelId, (perModelFailed.get(modelId) ?? 0) + 1);
          await writeResult(failResult);
          preFilledResults.push(failResult);
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

    console.log(`\n  Stage 2 (pre-fill) complete: ${preFilledResults.length} results\n`);
  }

  console.log("");
  const duration = Date.now() - experimentStartTime;

  // Summary
  const successful = allNewResults.filter((r) => !r.failureMode);
  const failed = allNewResults.filter((r) => r.failureMode);

  console.log("=== Phase 9A: Bridge Dominance Ratio Experiment Complete ===\n");
  console.log(`Duration:       ${formatDuration(duration)}`);
  console.log(`New runs:       ${allNewResults.length}`);
  console.log(`Successful:     ${successful.length}`);
  console.log(`Failed:         ${failed.length}`);
  console.log(`Success rate:   ${allNewResults.length > 0 ? ((successful.length / allNewResults.length) * 100).toFixed(1) : 0}%`);
  console.log("");

  // Per-stage breakdown
  const stageCounts = new Map<string, { total: number; failed: number }>();
  for (const result of allNewResults) {
    const pairId = result.pair.id;
    const stage = pairId.includes("--") ? pairId.split("--").pop()! : "unknown";
    const entry = stageCounts.get(stage) ?? { total: 0, failed: 0 };
    entry.total++;
    if (result.failureMode) entry.failed++;
    stageCounts.set(stage, entry);
  }
  console.log("Per-stage breakdown:");
  for (const [stage, counts] of stageCounts) {
    const successCount = counts.total - counts.failed;
    console.log(`  ${stage}: ${successCount}/${counts.total} successful`);
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
  const summaryPath = path.join(dominanceDir, "dominance-summary.json");
  const summary = {
    experiment: "dominance",
    phase: "9A",
    startedAt: new Date(experimentStartTime).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: duration,
    pairs: PHASE9A_PAIRS.map((p) => p.id),
    stages: ["salience", "prefill"],
    models: models.map((m) => m.id),
    waypointCount: WAYPOINT_COUNT,
    totalNewRuns: allNewResults.length,
    successfulRuns: successful.length,
    failedRuns: failed.length,
    successRate: allNewResults.length > 0 ? successful.length / allNewResults.length : 0,
    perStage: Object.fromEntries(stageCounts),
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
  console.log(`Results: ${dominanceDir}/`);

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
