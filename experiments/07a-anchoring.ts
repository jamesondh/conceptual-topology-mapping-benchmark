#!/usr/bin/env bun
/**
 * Phase 7A: Early-Anchoring Causal Test
 *
 * Tests whether a pre-filled heading waypoint biases the subsequent path.
 * Collects waypoint paths under 4 conditions:
 *
 * 1. Unconstrained (control): Standard 7-waypoint prompt.
 *    - Pairs 1-6: reuse Phase 6C data + 5 supplemental new reps per model.
 *    - Pairs 7-8: collect 15 fresh reps per model.
 * 2. Incongruent pre-fill: first waypoint forced to a concept that pulls
 *    away from the known bridge direction.
 * 3. Congruent pre-fill: first waypoint forced to a concept similar to
 *    the known bridge.
 * 4. Neutral pre-fill: first waypoint forced to "element" (generic).
 *
 * Run budget:
 *   Incongruent:   8 pairs x 10 reps x 4 models = 320
 *   Congruent:     8 pairs x 10 reps x 4 models = 320
 *   Neutral:       8 pairs x 10 reps x 4 models = 320
 *   Unconstrained new (pairs 7-8): 2 x 15 reps x 4 models = 120
 *   Supplemental unconstrained (pairs 1-6): 6 x 5 reps x 4 models = 120
 *   Total new: ~1,200 runs
 *
 * Usage:
 *   bun run experiments/07a-anchoring.ts
 *   bun run experiments/07a-anchoring.ts --dry-run
 *   bun run experiments/07a-anchoring.ts --models claude,gemini
 */

import { Command } from "commander";
import { writeFile, mkdir, readdir, readFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { MODELS } from "../src/data/pairs.ts";
import { PHASE7A_PAIRS } from "../src/data/pairs-phase7.ts";
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
  Phase7AnchoringPair,
  PreFillCondition,
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
  pair: Phase7AnchoringPair,
  condition: PreFillCondition,
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
  anchorPair: Phase7AnchoringPair,
  condition: PreFillCondition,
): ConceptPair {
  return {
    id: `${anchorPair.id}--${condition}`,
    from: anchorPair.from,
    to: anchorPair.to,
    category: "cross-domain",
    concreteness: ["abstract", "abstract"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "reporting",
    notes: `Phase 7A anchoring: "${anchorPair.from}" -> "${anchorPair.to}" (condition: ${condition}, bridge: ${anchorPair.bridge})`,
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
    if (!file.endsWith(".json") || file.startsWith("anchoring-")) continue;

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

function getPreFilledConcept(
  pair: Phase7AnchoringPair,
  condition: PreFillCondition,
): string {
  switch (condition) {
    case "incongruent":
      return pair.incongruentPreFill;
    case "congruent":
      return pair.congruentPreFill;
    case "neutral":
      return pair.neutralPreFill;
    default:
      throw new Error(`No pre-fill concept for condition: ${condition}`);
  }
}

// -- Main ---------------------------------------------------------------------

async function main() {
  const program = new Command();

  program
    .name("07a-anchoring")
    .description(
      "Run Phase 7A early-anchoring causal test: pre-filled heading waypoint bias",
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
  const anchoringDir = path.join(outputDir, "anchoring");
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
  const reusePairs = PHASE7A_PAIRS.slice(0, 6);   // Pairs 1-6: reuse 6C + supplemental
  const freshPairs = PHASE7A_PAIRS.slice(6);        // Pairs 7-8: fresh unconstrained
  const preFilledConditions: PreFillCondition[] = ["incongruent", "congruent", "neutral"];

  // Print header
  console.log("=== Phase 7A: Early-Anchoring Causal Test ===\n");
  console.log(`Total pairs:             ${PHASE7A_PAIRS.length}`);
  console.log(`  Reuse 6C + supplement: ${reusePairs.length} (5 supplemental unconstrained reps/model)`);
  console.log(`  Fresh unconstrained:   ${freshPairs.length} (15 reps/model)`);
  console.log(`Pre-fill conditions:     ${preFilledConditions.join(", ")}`);
  console.log(`Waypoints per path:      ${WAYPOINT_COUNT}`);
  console.log(`Models:                  ${models.map((m) => m.displayName).join(", ")}`);
  console.log("");

  // Summarize pairs
  console.log("Pair plan:");
  for (const pair of PHASE7A_PAIRS) {
    const idx = PHASE7A_PAIRS.indexOf(pair);
    const isReuse = idx < 6;
    const unconLabel = isReuse
      ? `unconstrained: reuse 6C + ${pair.targetReps.unconstrained > 10 ? 5 : pair.targetReps.unconstrained} supplemental`
      : `unconstrained: ${pair.targetReps.unconstrained} fresh reps`;
    console.log(
      `  ${pair.id} (${pair.role}): "${pair.from}" -> "${pair.to}" | ` +
      `bridge: "${pair.bridge}", modal pos: ${pair.unconstrainedModalPosition} | ` +
      `${unconLabel} | pre-filled: ${pair.targetReps.preFilled} reps/condition`,
    );
  }
  console.log("");

  // Load existing results for resume support
  const existing = await loadExistingResults(anchoringDir);
  if (existing.results.length > 0) {
    console.log(`Found ${existing.results.length} existing results in ${anchoringDir}/`);
    console.log("");
  }

  // ── Build the run manifest ──

  // 1. Unconstrained runs (use Scheduler with standard elicit)
  const unconstrainedRequests: ElicitationRequest[] = [];

  // Pairs 1-6: 5 supplemental unconstrained reps per model
  for (const pair of reusePairs) {
    const syntheticPair = makeSyntheticPair(pair, "unconstrained");
    const supplementalReps = 5;
    for (const model of models) {
      const key = runKey(syntheticPair.id, model.id);
      const existingCount = existing.counts.get(key) ?? 0;
      const needed = Math.max(0, supplementalReps - existingCount);
      for (let r = 0; r < needed; r++) {
        unconstrainedRequests.push({
          model,
          pair: syntheticPair,
          waypointCount: WAYPOINT_COUNT,
          promptFormat: PROMPT_FORMAT,
          temperature: TEMPERATURE,
        });
      }
    }
  }

  // Pairs 7-8: 15 fresh unconstrained reps per model
  for (const pair of freshPairs) {
    const syntheticPair = makeSyntheticPair(pair, "unconstrained");
    const targetReps = pair.targetReps.unconstrained;
    for (const model of models) {
      const key = runKey(syntheticPair.id, model.id);
      const existingCount = existing.counts.get(key) ?? 0;
      const needed = Math.max(0, targetReps - existingCount);
      for (let r = 0; r < needed; r++) {
        unconstrainedRequests.push({
          model,
          pair: syntheticPair,
          waypointCount: WAYPOINT_COUNT,
          promptFormat: PROMPT_FORMAT,
          temperature: TEMPERATURE,
        });
      }
    }
  }

  // 2. Pre-filled runs (custom elicitation, managed separately)
  interface PreFilledRun {
    model: ModelConfig;
    pair: Phase7AnchoringPair;
    condition: PreFillCondition;
    preFilledConcept: string;
    syntheticPairId: string;
  }

  const preFilledRuns: PreFilledRun[] = [];

  for (const pair of PHASE7A_PAIRS) {
    for (const condition of preFilledConditions) {
      const syntheticPairId = `${pair.id}--${condition}`;
      const preFilledConcept = getPreFilledConcept(pair, condition);
      const targetReps = pair.targetReps.preFilled;

      for (const model of models) {
        const key = runKey(syntheticPairId, model.id);
        const existingCount = existing.counts.get(key) ?? 0;
        const needed = Math.max(0, targetReps - existingCount);
        for (let r = 0; r < needed; r++) {
          preFilledRuns.push({
            model,
            pair,
            condition,
            preFilledConcept,
            syntheticPairId,
          });
        }
      }
    }
  }

  const totalNewRuns = unconstrainedRequests.length + preFilledRuns.length;

  // Budget breakdown
  const targetUnconstrained =
    reusePairs.length * 5 * models.length +
    freshPairs.length * 15 * models.length;
  const targetPreFilled =
    PHASE7A_PAIRS.length * preFilledConditions.length * 10 * models.length;

  console.log("Run budget:");
  console.log(`  Pre-filled (incongruent): ${PHASE7A_PAIRS.length} pairs x ${PHASE7A_PAIRS[0].targetReps.preFilled} reps x ${models.length} models = ${PHASE7A_PAIRS.length * 10 * models.length}`);
  console.log(`  Pre-filled (congruent):   ${PHASE7A_PAIRS.length} pairs x ${PHASE7A_PAIRS[0].targetReps.preFilled} reps x ${models.length} models = ${PHASE7A_PAIRS.length * 10 * models.length}`);
  console.log(`  Pre-filled (neutral):     ${PHASE7A_PAIRS.length} pairs x ${PHASE7A_PAIRS[0].targetReps.preFilled} reps x ${models.length} models = ${PHASE7A_PAIRS.length * 10 * models.length}`);
  console.log(`  Unconstrained (fresh):    ${freshPairs.length} pairs x 15 reps x ${models.length} models = ${freshPairs.length * 15 * models.length}`);
  console.log(`  Unconstrained (suppl):    ${reusePairs.length} pairs x 5 reps x ${models.length} models = ${reusePairs.length * 5 * models.length}`);
  console.log(`  Target total:             ${targetUnconstrained + targetPreFilled}`);
  console.log("");
  console.log(`Existing results:         ${existing.results.length}`);
  console.log(`Unconstrained to run:     ${unconstrainedRequests.length}`);
  console.log(`Pre-filled to run:        ${preFilledRuns.length}`);
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
  await mkdir(anchoringDir, { recursive: true });

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
    const resultPath = path.join(anchoringDir, `${result.runId}.json`);
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

  // ── Phase 1: Run unconstrained requests via Scheduler ──

  if (unconstrainedRequests.length > 0) {
    console.log(`Running ${unconstrainedRequests.length} unconstrained requests...`);

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

    const unconstrainedResults = await scheduler.run(unconstrainedRequests);
    console.log(`\n  Unconstrained phase complete: ${unconstrainedResults.length} results\n`);
  }

  // ── Phase 2: Run pre-filled requests with custom elicitation ──

  if (preFilledRuns.length > 0) {
    console.log(`Running ${preFilledRuns.length} pre-filled requests...`);

    // Use semaphore-style concurrency control for pre-filled runs
    const modelInFlight = new Map<string, number>();
    const modelLastRequest = new Map<string, number>();
    let globalInFlight = 0;

    function getModelInFlight(modelId: string): number {
      return modelInFlight.get(modelId) ?? 0;
    }

    function getModelMaxConcurrency(modelId: string): number {
      return perModelConcurrency.get(modelId) ?? 2;
    }

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
            run.condition,
            run.preFilledConcept,
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
            promptText: buildPreFilledPrompt(run.pair.from, run.pair.to, run.preFilledConcept),
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

    console.log(`\n  Pre-filled phase complete: ${preFilledResults.length} results\n`);
  }

  console.log("");
  const duration = Date.now() - experimentStartTime;

  // Summary
  const successful = allNewResults.filter((r) => !r.failureMode);
  const failed = allNewResults.filter((r) => r.failureMode);

  console.log("=== Phase 7A: Early-Anchoring Causal Test Complete ===\n");
  console.log(`Duration:       ${formatDuration(duration)}`);
  console.log(`New runs:       ${allNewResults.length}`);
  console.log(`Successful:     ${successful.length}`);
  console.log(`Failed:         ${failed.length}`);
  console.log(`Success rate:   ${allNewResults.length > 0 ? ((successful.length / allNewResults.length) * 100).toFixed(1) : 0}%`);
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
  const summaryPath = path.join(anchoringDir, "anchoring-summary.json");
  const summary = {
    experiment: "anchoring",
    phase: "7A",
    startedAt: new Date(experimentStartTime).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: duration,
    pairs: PHASE7A_PAIRS.map((p) => p.id),
    pairCategories: {
      reuse6cPlusSupplement: reusePairs.map((p) => p.id),
      freshUnconstrained: freshPairs.map((p) => p.id),
    },
    conditions: ["unconstrained", ...preFilledConditions],
    models: models.map((m) => m.id),
    waypointCount: WAYPOINT_COUNT,
    totalNewRuns: allNewResults.length,
    successfulRuns: successful.length,
    failedRuns: failed.length,
    successRate: allNewResults.length > 0 ? successful.length / allNewResults.length : 0,
    perCondition: Object.fromEntries(conditionCounts),
  };
  const tmpSummary = `${summaryPath}.tmp.${Date.now()}`;
  await writeFile(tmpSummary, JSON.stringify(summary, null, 2));
  await rename(tmpSummary, summaryPath);

  console.log(`Summary: ${summaryPath}`);
  console.log(`Results: ${anchoringDir}/`);

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
