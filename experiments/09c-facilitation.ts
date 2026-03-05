#!/usr/bin/env bun
/**
 * Phase 9C: Pre-Fill Facilitation Experiment
 *
 * Tests whether pre-filling produces a crossover interaction: displacing
 * dominant bridges but facilitating marginal ones.
 *
 * Multi-stage design:
 *
 * Stage 1 (Pilot): Collect 15 reps/model unconstrained for 4 pilot pairs
 *   to verify bridge frequency. Via Scheduler (semantic format, 7 waypoints).
 *   4 pairs x 15 reps x 4 models = 240 runs
 *
 * Stage 2 (Evaluability Check): For pilot pairs, compute bridge frequency
 *   and report whether each falls in the 0.20-0.50 evaluable range.
 *
 * Stage 3 (Pre-Fill Collection): Custom elicitation for each pair's
 *   newConditions. 14 pairs x conditions x targetReps x 4 models.
 *   Dominant (4 pairs): congruent only = 4 x 10 x 4 = 160 runs
 *   Moderate (4 pairs): congruent + incongruent + neutral = 4 x 3 x 10 x 4 = 480 runs
 *   Marginal (2 pairs): congruent + neutral = 2 x 2 x 10 x 4 = 160 runs
 *   Pilot (4 pairs): congruent + incongruent + neutral = 4 x 3 x 10 x 4 = 480 runs
 *   Total pre-fill: ~1,280 runs
 *
 * Grand total: ~1,520 new runs + retry buffer ~ 1,600
 *
 * Output directory: results/facilitation/
 *
 * Usage:
 *   bun run experiments/09c-facilitation.ts
 *   bun run experiments/09c-facilitation.ts --dry-run
 *   bun run experiments/09c-facilitation.ts --models claude,gemini
 */

import { Command } from "commander";
import { writeFile, mkdir, readdir, readFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { MODELS } from "../src/data/pairs.ts";
import { PHASE9C_PAIRS } from "../src/data/pairs-phase9.ts";
import { buildPrompt, elicit } from "../src/index.ts";
import { extractWaypoints, canonicalizeAll } from "../src/canonicalize.ts";
import { Scheduler, parseModelConcurrency } from "../src/scheduler.ts";
import { computeBridgeFrequency } from "../src/metrics.ts";
import type {
  PromptFormat,
  ModelConfig,
  ConceptPair,
  ElicitationRequest,
  ElicitationResult,
  SchedulerStatus,
  Phase9FacilitationPair,
  Phase9PreFillCondition,
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
const PILOT_REPS = 15;

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
  pair: Phase9FacilitationPair,
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
  pair: Phase9FacilitationPair,
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
    notes: `Phase 9C facilitation: "${pair.from}" -> "${pair.to}" (stage: ${suffix}, bridge: ${pair.bridge}, dominance: ${pair.dominanceLevel})`,
  };
}

// -- Get Pre-Fill Concept for a Condition ------------------------------------

function getPreFillConcept(
  pair: Phase9FacilitationPair,
  condition: Phase9PreFillCondition,
): string {
  switch (condition) {
    case "congruent":
      return pair.congruentPreFill;
    case "incongruent":
      return pair.incongruentPreFill;
    case "neutral":
      return pair.neutralPreFill;
    default:
      throw new Error(`Unexpected condition "${condition}" for pre-fill concept lookup`);
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
    if (!file.endsWith(".json") || file.startsWith("facilitation-")) continue;

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
    .name("09c-facilitation")
    .description(
      "Run Phase 9C pre-fill facilitation experiment: pilot + multi-condition pre-fill collection",
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
  const facilitationDir = path.join(outputDir, "facilitation");
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

  // Identify pilot and non-pilot pairs
  const pilotPairs = PHASE9C_PAIRS.filter((p) => p.dominanceLevel === "pilot");
  const nonPilotPairs = PHASE9C_PAIRS.filter((p) => p.dominanceLevel !== "pilot");

  // Print header
  console.log("=== Phase 9C: Pre-Fill Facilitation Experiment ===\n");
  console.log(`Total pairs:             ${PHASE9C_PAIRS.length}`);
  console.log(`  Dominant (freq >0.90): ${PHASE9C_PAIRS.filter((p) => p.dominanceLevel === "dominant").length} (congruent only)`);
  console.log(`  Moderate (freq 0.55-0.72): ${PHASE9C_PAIRS.filter((p) => p.dominanceLevel === "moderate" || p.dominanceLevel === "moderate-high").length} (all 3 conditions)`);
  console.log(`  Marginal (freq <0.20): ${PHASE9C_PAIRS.filter((p) => p.dominanceLevel === "marginal").length} (congruent + neutral)`);
  console.log(`  Pilot (freq unknown):  ${pilotPairs.length} (unconstrained + all 3 conditions)`);
  console.log(`Models:                  ${models.map((m) => m.displayName).join(", ")}`);
  console.log("");

  // Summarize pairs
  console.log("Pair plan:");
  for (const pair of PHASE9C_PAIRS) {
    const freqStr = pair.unconstrainedFreq !== null
      ? pair.unconstrainedFreq.toFixed(3)
      : "unknown";
    console.log(
      `  ${pair.id} (${pair.dominanceLevel}): "${pair.from}" -> "${pair.to}" | ` +
      `bridge: "${pair.bridge}" freq: ${freqStr} | ` +
      `conditions: [${pair.newConditions.join(", ")}] x ${pair.targetReps} reps`,
    );
  }
  console.log("");

  // Load existing results for resume support
  const existing = await loadExistingResults(facilitationDir);
  if (existing.results.length > 0) {
    console.log(`Found ${existing.results.length} existing results in ${facilitationDir}/`);
    console.log("");
  }

  // -- Build the run manifest --

  // Stage 1: Pilot runs (unconstrained, via Scheduler)
  const pilotRequests: ElicitationRequest[] = [];

  for (const pair of pilotPairs) {
    const syntheticPair = makeSyntheticPair(pair, "pilot");

    for (const model of models) {
      const key = runKey(syntheticPair.id, model.id);
      const existingCount = existing.counts.get(key) ?? 0;
      const needed = Math.max(0, PILOT_REPS - existingCount);
      for (let r = 0; r < needed; r++) {
        pilotRequests.push({
          model,
          pair: syntheticPair,
          waypointCount: WAYPOINT_COUNT,
          promptFormat: PROMPT_FORMAT,
          temperature: TEMPERATURE,
        });
      }
    }
  }

  // Stage 3: Pre-fill runs (custom elicitation)
  interface PreFilledRun {
    model: ModelConfig;
    pair: Phase9FacilitationPair;
    condition: Phase9PreFillCondition;
    preFillConcept: string;
    syntheticPairId: string;
  }

  const preFilledRuns: PreFilledRun[] = [];

  for (const pair of PHASE9C_PAIRS) {
    for (const condition of pair.newConditions) {
      // "unconstrained" is handled by pilot stage, not pre-fill
      if (condition === "unconstrained") continue;

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

  const totalNewRuns = pilotRequests.length + preFilledRuns.length;

  // Budget breakdown
  const targetPilot = pilotPairs.length * PILOT_REPS * models.length;

  let targetPreFill = 0;
  for (const pair of PHASE9C_PAIRS) {
    const preFillConditions = pair.newConditions.filter((c) => c !== "unconstrained");
    targetPreFill += preFillConditions.length * pair.targetReps * models.length;
  }

  console.log("Run budget:");
  console.log(`  Stage 1 (pilot):        ${pilotPairs.length} pairs x ${PILOT_REPS} reps x ${models.length} models = ${targetPilot}`);
  console.log(`  Stage 3 (pre-fill):     ${targetPreFill} (varies by pair/condition)`);
  console.log(`  Target total:           ${targetPilot + targetPreFill}`);
  console.log("");
  console.log(`Existing results:         ${existing.results.length}`);
  console.log(`Pilot to run:             ${pilotRequests.length}`);
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
  await mkdir(facilitationDir, { recursive: true });

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
    const resultPath = path.join(facilitationDir, `${result.runId}.json`);
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

  // -- Stage 1: Run pilot requests via Scheduler --

  if (pilotRequests.length > 0) {
    console.log(`Running ${pilotRequests.length} pilot requests (Stage 1)...`);

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

    const pilotResults = await scheduler.run(pilotRequests);
    console.log(`\n  Stage 1 (pilot) complete: ${pilotResults.length} results\n`);

    // -- Stage 2: Evaluability Check --
    console.log("Stage 2: Evaluability check for pilot pairs...\n");

    for (const pair of pilotPairs) {
      const pilotPairId = `${pair.id}--pilot`;
      const allPilotRuns: string[][] = [];

      for (const model of models) {
        const key = runKey(pilotPairId, model.id);

        // Gather pilot runs from existing + newly collected
        const pilotRunsForKey = [
          ...existing.results.filter(
            (r) => r.pair.id === pilotPairId && r.modelShortId === model.id && !r.failureMode,
          ),
          ...allNewResults.filter(
            (r) => r.pair.id === pilotPairId && r.modelShortId === model.id && !r.failureMode,
          ),
        ];
        for (const r of pilotRunsForKey) {
          if (r.canonicalizedWaypoints.length > 0) {
            allPilotRuns.push(r.canonicalizedWaypoints);
          }
        }
      }

      const bridgeFreq = computeBridgeFrequency(allPilotRuns, pair.bridge);
      const inRange = bridgeFreq >= 0.20 && bridgeFreq <= 0.50;
      const status = inRange ? "EVALUABLE" : bridgeFreq < 0.20 ? "TOO LOW" : "TOO HIGH";

      console.log(
        `  ${pair.id}: bridge="${pair.bridge}" freq=${bridgeFreq.toFixed(3)} ` +
        `(${allPilotRuns.length} runs) [${status}]`,
      );
    }
    console.log("");
  }

  // -- Stage 3: Run pre-filled requests with custom elicitation --

  if (preFilledRuns.length > 0) {
    console.log(`Running ${preFilledRuns.length} pre-fill requests (Stage 3)...`);

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

    console.log(`\n  Stage 3 (pre-fill) complete: ${preFilledResults.length} results\n`);
  }

  console.log("");
  const duration = Date.now() - experimentStartTime;

  // Summary
  const successful = allNewResults.filter((r) => !r.failureMode);
  const failed = allNewResults.filter((r) => r.failureMode);

  console.log("=== Phase 9C: Pre-Fill Facilitation Experiment Complete ===\n");
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
  const summaryPath = path.join(facilitationDir, "facilitation-summary.json");
  const summary = {
    experiment: "facilitation",
    phase: "9C",
    startedAt: new Date(experimentStartTime).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: duration,
    pairs: PHASE9C_PAIRS.map((p) => p.id),
    stages: ["pilot", "evaluability-check", "pre-fill"],
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
  console.log(`Results: ${facilitationDir}/`);

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
