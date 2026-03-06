/**
 * Waypoint Elicitation Engine + CLI Interface
 *
 * Core primitive for the Conceptual Topology Mapping Benchmark:
 * prompt a model with two concepts via OpenRouter, get back ordered
 * intermediate waypoints, canonicalize, and store results with full metadata.
 *
 * Usage:
 *   bun run index.ts --model claude --from music --to mathematics --waypoints 5
 *
 * Also exports core functions for experiment scripts:
 *   import { elicit, runBatch, buildPrompt } from "./index.ts";
 */

import { Command } from "commander";
import { extractWaypoints, canonicalizeAll } from "./canonicalize.ts";
import { MODELS } from "./data/pairs.ts";
import type {
  PromptFormat,
  ModelConfig,
  ConceptPair,
  ElicitationRequest,
  ElicitationResult,
  BatchProgress,
} from "./types.ts";

// ── Constants ────────────────────────────────────────────────────────

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_RETRIES = 3;
const DEFAULT_CONCURRENCY = 2;

// ── Prompt Construction ──────────────────────────────────────────────

/**
 * Build the user prompt for a waypoint elicitation request.
 */
export function buildPrompt(
  from: string,
  to: string,
  waypointCount: number,
  format: PromptFormat,
): string {
  if (format === "semantic") {
    return [
      `Imagine walking through conceptual space from "${from}" to "${to}".`,
      `What ${waypointCount} landmarks do you pass along the way?`,
      `List only the landmark concepts, one per line, numbered 1 through ${waypointCount}.`,
      `Do not include the starting or ending concepts.`,
    ].join("\n");
  }

  // Default: direct format
  return [
    `List exactly ${waypointCount} intermediate concepts that form a path from "${from}" to "${to}".`,
    `Respond with only the concepts, one per line, numbered 1 through ${waypointCount}.`,
    `Do not include the starting or ending concepts.`,
  ].join("\n");
}

// ── OpenRouter API Call ──────────────────────────────────────────────

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

/**
 * Determine whether an error is transient and should be retried.
 * Covers rate limits (429), server errors (5xx), and network failures.
 */
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

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call the OpenRouter chat completions API.
 * Returns the raw response text and generation ID.
 * Throws on non-transient errors; returns failure info for retries.
 */
async function callOpenRouter(
  model: string,
  prompt: string,
  temperature: number,
  requestTimeoutMs: number = 60_000,
): Promise<{ text: string; generationId?: string; providerRoute?: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY environment variable is not set. " +
        "Set it in your environment or in a .env file.",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

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

// ── Core Elicitation Function ────────────────────────────────────────

/**
 * Elicit waypoints from a model for a given concept pair.
 *
 * Calls the OpenRouter API, extracts and canonicalizes waypoints,
 * and records all metadata. Retries up to 3 times on transient failures.
 */
export async function elicit(
  request: ElicitationRequest,
): Promise<ElicitationResult> {
  const {
    model,
    pair,
    waypointCount,
    promptFormat,
    temperature,
    requestTimeoutMs,
  } = request;

  const runId = crypto.randomUUID();
  const promptText = buildPrompt(pair.from, pair.to, waypointCount, promptFormat);
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
        temperature,
        requestTimeoutMs,
      );
      rawResponse = result.text;
      openRouterGenId = result.generationId;
      providerRoute = result.providerRoute;
      break;
    } catch (error: unknown) {
      const isTransient =
        isTransientError(error) ||
        (error as { transient?: boolean }).transient === true;

      if (isTransient && attempt < MAX_RETRIES) {
        retryCount++;
        failureMode = error instanceof Error ? error.message : String(error);
        // Exponential backoff: 1s, 2s, 4s
        const backoffMs = 1000 * Math.pow(2, attempt);
        await sleep(backoffMs);
        continue;
      }

      // Non-transient or exhausted retries — record the failure
      const durationMs = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        model: model.openRouterId,
        modelShortId: model.id,
        pair: { from: pair.from, to: pair.to, id: pair.id },
        waypointCount,
        promptFormat,
        promptText,
        temperature,
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

  // Extract and canonicalize waypoints
  const extractedWaypoints = extractWaypoints(rawResponse, waypointCount);
  const canonicalizedWaypoints = canonicalizeAll(extractedWaypoints);

  // Extraction count enforcement (Option B: lenient)
  let extractionCountMismatch = false;
  let finalWaypoints = canonicalizedWaypoints;
  if (canonicalizedWaypoints.length !== waypointCount) {
    extractionCountMismatch = true;
    if (canonicalizedWaypoints.length > waypointCount) {
      // Truncate to requested count
      finalWaypoints = canonicalizedWaypoints.slice(0, waypointCount);
    }
    // If underlong, keep as-is (soft warning)
  }

  // Clear failureMode if we ultimately succeeded
  if (rawResponse) {
    failureMode = undefined;
  }

  const result: ElicitationResult = {
    model: model.openRouterId,
    modelShortId: model.id,
    pair: { from: pair.from, to: pair.to, id: pair.id },
    waypointCount,
    promptFormat,
    promptText,
    temperature,
    rawResponse,
    extractedWaypoints,
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

  return result;
}

// ── Batch Runner ─────────────────────────────────────────────────────

interface BatchConfig {
  requests: ElicitationRequest[];
  batchId: string;
  outputDir: string;
  concurrency?: number;
  onProgress?: (progress: BatchProgress) => void;
}

interface BatchSummary {
  batchId: string;
  totalRequests: number;
  completed: number;
  failed: number;
  startTime: string;
  endTime: string;
  durationMs: number;
  results: Array<{
    runId: string;
    modelShortId: string;
    pairId: string;
    success: boolean;
    failureMode?: string;
  }>;
}

/**
 * Run a batch of elicitation requests with configurable concurrency.
 *
 * Saves each result as JSON to {outputDir}/{batchId}/{runId}.json
 * and a batch summary to {outputDir}/{batchId}/batch-summary.json.
 * Handles individual failures gracefully — logs and continues.
 */
export async function runBatch(config: BatchConfig): Promise<ElicitationResult[]> {
  const {
    requests,
    batchId,
    outputDir,
    concurrency = DEFAULT_CONCURRENCY,
    onProgress,
  } = config;

  const batchDir = `${outputDir}/${batchId}`;

  // Ensure output directory exists
  const { mkdir, writeFile, rename } = await import("node:fs/promises");
  await mkdir(batchDir, { recursive: true });

  const results: ElicitationResult[] = [];
  const startTime = new Date();
  let completed = 0;
  let failed = 0;

  const progress: BatchProgress = {
    total: requests.length,
    completed: 0,
    failed: 0,
    startTime: startTime.toISOString(),
  };

  // Concurrency control via shared index
  let requestIndex = 0;

  async function processNext(): Promise<void> {
    while (requestIndex < requests.length) {
      const idx = requestIndex++;
      const request = requests[idx];

      let result: ElicitationResult;
      try {
        result = await elicit(request);
        result.batchId = batchId;
      } catch (error: unknown) {
        // This shouldn't happen since elicit handles errors internally,
        // but guard against unexpected failures.
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        result = {
          model: request.model.openRouterId,
          modelShortId: request.model.id,
          pair: {
            from: request.pair.from,
            to: request.pair.to,
            id: request.pair.id,
          },
          waypointCount: request.waypointCount,
          promptFormat: request.promptFormat,
          promptText: buildPrompt(
            request.pair.from,
            request.pair.to,
            request.waypointCount,
            request.promptFormat,
          ),
          temperature: request.temperature,
          rawResponse: "",
          extractedWaypoints: [],
          canonicalizedWaypoints: [],
          timestamp: new Date().toISOString(),
          durationMs: 0,
          retryCount: 0,
          failureMode: errorMessage,
          runId: crypto.randomUUID(),
          batchId,
        };
      }

      results.push(result);

      // Save individual result (atomic write)
      const resultPath = `${batchDir}/${result.runId}.json`;
      try {
        const tmpPath = `${resultPath}.tmp.${Date.now()}`;
        await writeFile(tmpPath, JSON.stringify(result, null, 2));
        await rename(tmpPath, resultPath);
      } catch (writeError: unknown) {
        console.error(
          `Failed to write result ${result.runId}:`,
          writeError instanceof Error ? writeError.message : writeError,
        );
      }

      // Update progress
      completed++;
      if (result.failureMode) {
        failed++;
      }

      progress.completed = completed;
      progress.failed = failed;

      if (completed < requests.length) {
        const elapsedMs = Date.now() - startTime.getTime();
        const msPerRequest = elapsedMs / completed;
        const remaining = requests.length - completed;
        progress.estimatedRemaining = Math.round(
          (msPerRequest * remaining) / 1000,
        );
      }

      onProgress?.(progress);
    }
  }

  // Launch concurrent workers
  const safeConcurrency = Number.isFinite(concurrency) && concurrency > 0 ? concurrency : DEFAULT_CONCURRENCY;
  const workers: Promise<void>[] = [];
  const workerCount = Math.min(safeConcurrency, requests.length);
  for (let i = 0; i < workerCount; i++) {
    workers.push(processNext());
  }
  await Promise.all(workers);

  // Write batch summary
  const endTime = new Date();
  const summary: BatchSummary = {
    batchId,
    totalRequests: requests.length,
    completed,
    failed,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    durationMs: endTime.getTime() - startTime.getTime(),
    results: results.map((r) => ({
      runId: r.runId,
      modelShortId: r.modelShortId,
      pairId: r.pair.id,
      success: !r.failureMode,
      ...(r.failureMode ? { failureMode: r.failureMode } : {}),
    })),
  };

  const summaryPath = `${batchDir}/batch-summary.json`;
  try {
    const tmpSummaryPath = `${summaryPath}.tmp.${Date.now()}`;
    await writeFile(tmpSummaryPath, JSON.stringify(summary, null, 2));
    await rename(tmpSummaryPath, summaryPath);
  } catch (writeError: unknown) {
    console.error(
      "Failed to write batch summary:",
      writeError instanceof Error ? writeError.message : writeError,
    );
  }

  return results;
}

// ── CLI ──────────────────────────────────────────────────────────────

function findModel(shortId: string): ModelConfig {
  const model = MODELS.find((m) => m.id === shortId);
  if (!model) {
    const valid = MODELS.map((m) => m.id).join(", ");
    console.error(`Unknown model "${shortId}". Valid options: ${valid}`);
    process.exit(1);
  }
  return model;
}

function formatResultForDisplay(result: ElicitationResult): string {
  const lines: string[] = [];

  lines.push(`Model:       ${result.modelShortId} (${result.model})`);
  lines.push(`Pair:        "${result.pair.from}" -> "${result.pair.to}"`);
  lines.push(`Format:      ${result.promptFormat}`);
  lines.push(`Temperature: ${result.temperature}`);
  lines.push(`Waypoints:   ${result.waypointCount} requested`);
  lines.push(`Duration:    ${result.durationMs}ms`);
  if (result.retryCount > 0) {
    lines.push(`Retries:     ${result.retryCount}`);
  }
  if (result.failureMode) {
    lines.push(`Failure:     ${result.failureMode}`);
  }
  lines.push("");

  if (result.canonicalizedWaypoints.length > 0) {
    lines.push("Waypoints:");
    result.canonicalizedWaypoints.forEach((w, i) => {
      lines.push(`  ${i + 1}. ${w}`);
    });
  } else if (result.extractedWaypoints.length > 0) {
    lines.push("Extracted waypoints (not canonicalized):");
    result.extractedWaypoints.forEach((w, i) => {
      lines.push(`  ${i + 1}. ${w}`);
    });
  } else {
    lines.push("No waypoints extracted.");
  }

  lines.push("");
  lines.push(`Run ID: ${result.runId}`);

  return lines.join("\n");
}

async function main() {
  const program = new Command();

  program
    .name("waypoint-elicit")
    .description(
      "Elicit conceptual waypoints between two concepts from an LLM via OpenRouter",
    )
    .requiredOption(
      "--model <id>",
      "model short ID (claude, gpt, grok, gemini)",
    )
    .requiredOption("--from <concept>", "starting concept")
    .requiredOption("--to <concept>", "ending concept")
    .option("--waypoints <n>", "number of waypoints", "5")
    .option(
      "--format <type>",
      'prompt format: "direct" or "semantic"',
      "direct",
    )
    .option("--temperature <n>", "temperature", "0.7")
    .option("--reps <n>", "number of repetitions", "1")
    .option("--output <dir>", "output directory", "results");

  program.parse();
  const opts = program.opts();

  const model = findModel(opts.model);
  const waypointCount = parseInt(opts.waypoints, 10);
  const temperature = parseFloat(opts.temperature);
  const reps = parseInt(opts.reps, 10);
  const outputDir = opts.output;
  const promptFormat = opts.format as PromptFormat;

  if (!["direct", "semantic"].includes(promptFormat)) {
    console.error(
      `Invalid format "${promptFormat}". Must be "direct" or "semantic".`,
    );
    process.exit(1);
  }

  if (isNaN(waypointCount) || waypointCount < 1) {
    console.error("Waypoint count must be a positive integer.");
    process.exit(1);
  }

  if (isNaN(temperature) || temperature < 0 || temperature > 2) {
    console.error("Temperature must be a number between 0 and 2.");
    process.exit(1);
  }

  if (isNaN(reps) || reps < 1) {
    console.error("Reps must be a positive integer.");
    process.exit(1);
  }

  // Build a synthetic ConceptPair for CLI usage
  const pair: ConceptPair = {
    id: `cli-${opts.from}-${opts.to}`.toLowerCase().replace(/\s+/g, "-"),
    from: opts.from,
    to: opts.to,
    category: "anchor", // Default for CLI; experiment scripts use real metadata
    concreteness: ["abstract", "abstract"],
    relationalType: "associative",
    polysemy: "unambiguous",
    set: "reporting",
  };

  const request: ElicitationRequest = {
    model,
    pair,
    waypointCount,
    promptFormat,
    temperature,
  };

  if (reps === 1) {
    // Single run — print result directly
    console.log(
      `Eliciting ${waypointCount} waypoints from ${model.displayName}...`,
    );
    console.log(`  "${opts.from}" -> "${opts.to}" [${promptFormat}]\n`);

    const result = await elicit(request);

    console.log(formatResultForDisplay(result));

    // Save to file
    const { mkdir, writeFile } = await import("node:fs/promises");
    const outDir = `${outputDir}/cli`;
    await mkdir(outDir, { recursive: true });
    const outPath = `${outDir}/${result.runId}.json`;
    await writeFile(outPath, JSON.stringify(result, null, 2));
    console.log(`\nSaved to ${outPath}`);
  } else {
    // Multiple reps — use batch runner
    const requests: ElicitationRequest[] = Array.from(
      { length: reps },
      () => ({ ...request }),
    );
    const batchId = `cli-${Date.now()}`;

    console.log(
      `Running ${reps} repetitions with ${model.displayName}...`,
    );
    console.log(`  "${opts.from}" -> "${opts.to}" [${promptFormat}]\n`);

    const results = await runBatch({
      requests,
      batchId,
      outputDir,
      concurrency: DEFAULT_CONCURRENCY,
      onProgress: (progress) => {
        const pct = Math.round((progress.completed / progress.total) * 100);
        const eta =
          progress.estimatedRemaining != null
            ? ` (~${progress.estimatedRemaining}s remaining)`
            : "";
        process.stdout.write(
          `\r  Progress: ${progress.completed}/${progress.total} (${pct}%)${eta}    `,
        );
      },
    });

    console.log("\n");

    // Print summary of all runs
    const successful = results.filter((r) => !r.failureMode);
    const failures = results.filter((r) => r.failureMode);

    console.log(`Completed: ${successful.length}/${results.length}`);
    if (failures.length > 0) {
      console.log(`Failed:    ${failures.length}`);
    }
    console.log("");

    // Print waypoints from each run
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.failureMode) {
        console.log(`Run ${i + 1}: FAILED - ${r.failureMode}`);
      } else {
        const waypoints = r.canonicalizedWaypoints.join(", ");
        console.log(`Run ${i + 1}: ${waypoints}`);
      }
    }

    console.log(
      `\nResults saved to ${outputDir}/${batchId}/`,
    );
  }
}

// Run CLI when executed directly
// Bun sets import.meta.main to true when the file is the entry point.
if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
