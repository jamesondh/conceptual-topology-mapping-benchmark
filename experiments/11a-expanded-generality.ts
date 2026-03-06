#!/usr/bin/env bun
/**
 * Phase 11A: Expanded Model Generality Experiment
 *
 * Tests whether the benchmark's core structural findings generalize to
 * 4 new models beyond the original 4 + Phase 10A cohort. Two-stage design:
 *
 * Stage 1 (Probe): For each of 4 new models, run 3 probe requests to
 *   test connectivity, parse success, and latency. Models that fail
 *   probes are skipped. If "semantic" format fails, retries with "direct".
 *   Classification: reliable / slow / unparseable / unavailable.
 *
 * Stage 2 (Full-Run): For models that pass probes (status "reliable"
 *   or "slow"), collect 15 reps x 12 pairs (8 forward + 4 reverse)
 *   using standard waypoint elicitation via Scheduler.
 *
 * Patient mode is ON by default (300s timeouts).
 *
 * Total budget: ~720 runs across all 4 models.
 *
 * Output directory: results/expanded-generality/
 *
 * Usage:
 *   bun run experiments/11a-expanded-generality.ts
 *   bun run experiments/11a-expanded-generality.ts --dry-run
 *   bun run experiments/11a-expanded-generality.ts --models deepseek,mistral
 */

import { Command } from "commander";
import { writeFile, mkdir, readdir, readFile, rename, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { PHASE11_MODELS } from "../src/data/pairs.ts";
import { PHASE11A_ALL_PAIRS, PHASE11A_PROBE_PAIRS } from "../src/data/pairs-phase11.ts";
import { buildPrompt, elicit } from "../src/index.ts";
import { extractWaypoints, canonicalizeAll } from "../src/canonicalize.ts";
import { Scheduler, parseModelConcurrency } from "../src/scheduler.ts";
import type {
  PromptFormat,
  ModelConfig,
  ConceptPair,
  ElicitationRequest,
  ElicitationResult,
  Phase10CorePair,
  Phase10ModelReliabilityResult,
  ModelReliabilityStatus,
} from "../src/types.ts";

// -- Constants ----------------------------------------------------------------

const PROMPT_FORMAT: PromptFormat = "semantic";
const TEMPERATURE = 0.7;
const WAYPOINT_COUNT = 7;
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_MODEL_CONCURRENCY = "deepseek=2,mistral=2,cohere=2,llama4=2";
const DEFAULT_OUTPUT_DIR = "results/expanded-generality";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_RETRIES = 3;
const FULL_RUN_REPS = 15;
const PROBE_COUNT = 3;
const LATENCY_DISCARD_MS = 60_000; // p50 > 60s -> unavailable
const LATENCY_SLOW_MS = 30_000;    // p50 > 30s -> slow (concurrency 1)
const MIN_WAYPOINTS_FOR_PARSE = 5;  // need 5+ waypoints to count as parsed

// -- OpenRouter Direct Call ---------------------------------------------------

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

// -- Synthetic Pair Creation --------------------------------------------------

function makeSyntheticPair(pair: Phase10CorePair): ConceptPair {
  return {
    id: pair.id,
    from: pair.from,
    to: pair.to,
    category: pair.direction === "forward" ? "cross-domain" : "cross-domain",
    concreteness: ["abstract", "abstract"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "reporting",
    notes: `Phase 11A expanded generality: "${pair.from}" -> "${pair.to}" (${pair.direction})`,
  };
}

// -- Probe Logic --------------------------------------------------------------

interface ProbeResult {
  pairId: string;
  success: boolean;
  parsed: boolean;
  waypointCount: number;
  latencyMs: number;
  error?: string;
  promptFormat: PromptFormat;
}

async function runSingleProbe(
  model: ModelConfig,
  pair: Phase10CorePair,
  format: PromptFormat,
  requestTimeoutMs: number = 60_000,
): Promise<ProbeResult> {
  const prompt = buildPrompt(pair.from, pair.to, WAYPOINT_COUNT, format);
  const startTime = Date.now();

  try {
    const result = await callOpenRouter(model.openRouterId, prompt, TEMPERATURE, requestTimeoutMs);
    const latencyMs = Date.now() - startTime;
    const waypoints = extractWaypoints(result.text, WAYPOINT_COUNT);
    const parsed = waypoints.length >= MIN_WAYPOINTS_FOR_PARSE;

    return {
      pairId: pair.id,
      success: true,
      parsed,
      waypointCount: waypoints.length,
      latencyMs,
      promptFormat: format,
    };
  } catch (error: unknown) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      pairId: pair.id,
      success: false,
      parsed: false,
      waypointCount: 0,
      latencyMs,
      error: errorMessage,
      promptFormat: format,
    };
  }
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

async function probeModel(
  model: ModelConfig,
  probePairs: Phase10CorePair[],
  options: { requestTimeoutMs: number; latencyDiscardMs: number; latencySlowMs: number } = {
    requestTimeoutMs: 60_000,
    latencyDiscardMs: LATENCY_DISCARD_MS,
    latencySlowMs: LATENCY_SLOW_MS,
  },
): Promise<Phase10ModelReliabilityResult> {
  console.log(`  Probing ${model.displayName} (${model.openRouterId})...`);

  // Run probes with "semantic" format
  const semanticProbes: ProbeResult[] = [];
  for (const pair of probePairs) {
    const result = await runSingleProbe(model, pair, "semantic", options.requestTimeoutMs);
    semanticProbes.push(result);

    const statusStr = result.success
      ? result.parsed
        ? `OK (${result.waypointCount} waypoints, ${result.latencyMs}ms)`
        : `PARSE FAIL (${result.waypointCount} waypoints, ${result.latencyMs}ms)`
      : `FAIL: ${result.error}`;
    console.log(`    ${pair.id}: ${statusStr}`);
  }

  // Check connectivity
  let successCount = semanticProbes.filter((p) => p.success).length;
  if (successCount === 0) {
    console.log(`    -> UNAVAILABLE (0/${PROBE_COUNT} connected)`);
    return {
      modelId: model.id,
      openRouterId: model.openRouterId,
      displayName: model.displayName,
      probeResults: semanticProbes,
      connectivityRate: 0,
      parseRate: 0,
      medianLatencyMs: 0,
      usesDirectFormat: false,
      status: "unavailable",
      statusReason: "No successful connections",
    };
  }

  // Check parse success with semantic format
  const semanticParseCount = semanticProbes.filter((p) => p.success && p.parsed).length;
  let usesDirectFormat = false;
  let allProbes = semanticProbes;

  // If semantic fails on >=2/3 probes, try "direct" format as fallback
  if (semanticParseCount < 2) {
    console.log(`    Semantic parse rate ${semanticParseCount}/${PROBE_COUNT}, trying "direct" format...`);

    const directProbes: ProbeResult[] = [];
    for (const pair of probePairs) {
      const result = await runSingleProbe(model, pair, "direct", options.requestTimeoutMs);
      directProbes.push(result);

      const statusStr = result.success
        ? result.parsed
          ? `OK (${result.waypointCount} waypoints, ${result.latencyMs}ms)`
          : `PARSE FAIL (${result.waypointCount} waypoints, ${result.latencyMs}ms)`
        : `FAIL: ${result.error}`;
      console.log(`    [direct] ${pair.id}: ${statusStr}`);
    }

    const directParseCount = directProbes.filter((p) => p.success && p.parsed).length;

    if (directParseCount < 2) {
      // Both formats fail
      console.log(`    -> UNPARSEABLE (semantic: ${semanticParseCount}/${PROBE_COUNT}, direct: ${directParseCount}/${PROBE_COUNT})`);
      return {
        modelId: model.id,
        openRouterId: model.openRouterId,
        displayName: model.displayName,
        probeResults: [...semanticProbes, ...directProbes],
        connectivityRate: successCount / PROBE_COUNT,
        parseRate: Math.max(semanticParseCount, directParseCount) / PROBE_COUNT,
        medianLatencyMs: median(semanticProbes.filter((p) => p.success).map((p) => p.latencyMs)),
        usesDirectFormat: false,
        status: "unparseable",
        statusReason: `Parse rate too low: semantic=${semanticParseCount}/${PROBE_COUNT}, direct=${directParseCount}/${PROBE_COUNT}`,
      };
    }

    // Direct format works -- use it
    usesDirectFormat = true;
    allProbes = directProbes;
    // Recompute connectivity from direct probes so the rate reflects the format actually used
    successCount = directProbes.filter((p) => p.success).length;
    console.log(`    Using "direct" format (${directParseCount}/${PROBE_COUNT} parsed)`);
  }

  // Compute latency from the working probes
  const successfulLatencies = allProbes
    .filter((p) => p.success)
    .map((p) => p.latencyMs);
  const p50 = median(successfulLatencies);
  const parseRate = allProbes.filter((p) => p.success && p.parsed).length / PROBE_COUNT;

  // Classify based on latency
  if (p50 > options.latencyDiscardMs) {
    console.log(`    -> UNAVAILABLE (p50 latency ${p50}ms > ${options.latencyDiscardMs}ms)`);
    return {
      modelId: model.id,
      openRouterId: model.openRouterId,
      displayName: model.displayName,
      probeResults: usesDirectFormat ? [...semanticProbes, ...allProbes] : allProbes,
      connectivityRate: successCount / PROBE_COUNT,
      parseRate,
      medianLatencyMs: p50,
      usesDirectFormat,
      status: "unavailable",
      statusReason: `Latency too high: p50=${p50}ms > ${options.latencyDiscardMs}ms`,
    };
  }

  if (p50 > options.latencySlowMs) {
    console.log(`    -> SLOW (p50 latency ${p50}ms > ${options.latencySlowMs}ms, concurrency=1)`);
    return {
      modelId: model.id,
      openRouterId: model.openRouterId,
      displayName: model.displayName,
      probeResults: usesDirectFormat ? [...semanticProbes, ...allProbes] : allProbes,
      connectivityRate: successCount / PROBE_COUNT,
      parseRate,
      medianLatencyMs: p50,
      usesDirectFormat,
      status: "slow",
      statusReason: `High latency: p50=${p50}ms > ${options.latencySlowMs}ms`,
    };
  }

  console.log(`    -> RELIABLE (p50 latency ${p50}ms, parse rate ${(parseRate * 100).toFixed(0)}%)`);
  return {
    modelId: model.id,
    openRouterId: model.openRouterId,
    displayName: model.displayName,
    probeResults: usesDirectFormat ? [...semanticProbes, ...allProbes] : allProbes,
    connectivityRate: successCount / PROBE_COUNT,
    parseRate,
    medianLatencyMs: p50,
    usesDirectFormat,
    status: "reliable",
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
    if (!file.endsWith(".json") || file.startsWith("expanded-generality-")) continue;
    // Skip probe result files
    if (file.startsWith("probe-")) continue;

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
    .name("11a-expanded-generality")
    .description(
      "Run Phase 11A expanded model generality experiment: probe new models + full-run replication",
    )
    .option("--dry-run", "print the experiment plan without executing")
    .option("--output <dir>", "output directory", DEFAULT_OUTPUT_DIR)
    .option("--concurrency <n>", "global concurrency limit", String(DEFAULT_CONCURRENCY))
    .option(
      "--model-concurrency <spec>",
      'per-model concurrency, e.g., "deepseek=2,cohere=2"',
      DEFAULT_MODEL_CONCURRENCY,
    )
    .option("--throttle <ms>", "per-model delay between requests", "0")
    .option("--models <ids>", "comma-separated model short IDs (default: all Phase 11 models)")
    .option("--patient", "tolerate slow models: 300s request timeout, 300s latency gate (on by default)", true);

  program.parse();
  const opts = program.opts();

  const outputDir = opts.output as string;
  const probesDir = path.join(outputDir, "probes");
  const dryRun = opts.dryRun === true;

  const globalConcurrency = parseInt(opts.concurrency as string, 10) || DEFAULT_CONCURRENCY;
  const perModelConcurrency = parseModelConcurrency(opts.modelConcurrency as string);
  const throttleMs = parseInt(opts.throttle as string, 10) || 0;
  const patientMode = opts.patient === true;

  // Patient mode: generous timeouts for slow models (on by default)
  const requestTimeoutMs = patientMode ? 300_000 : 60_000;
  const latencyDiscardMs = patientMode ? 300_000 : LATENCY_DISCARD_MS;
  const latencySlowMs = patientMode ? 120_000 : LATENCY_SLOW_MS;

  // Resolve models (from PHASE11_MODELS)
  let models: ModelConfig[];
  if (opts.models) {
    const ids = (opts.models as string).split(",").map((s) => s.trim());
    models = [];
    for (const id of ids) {
      const model = PHASE11_MODELS.find((m) => m.id === id);
      if (!model) {
        console.error(`Unknown model "${id}". Valid: ${PHASE11_MODELS.map((m) => m.id).join(", ")}`);
        process.exit(1);
      }
      models.push(model);
    }
  } else {
    models = [...PHASE11_MODELS];
  }

  // Print header
  console.log("=== Phase 11A: Expanded Model Generality Experiment ===\n");
  if (patientMode) {
    console.log(`Mode:                    PATIENT (${requestTimeoutMs / 1000}s request timeout, ${latencyDiscardMs / 1000}s latency gate)`);
  }
  console.log(`New models:              ${models.map((m) => m.displayName).join(", ")}`);
  console.log(`Total pairs:             ${PHASE11A_ALL_PAIRS.length} (8 forward + 4 reverse)`);
  console.log(`Probe pairs:             ${PHASE11A_PROBE_PAIRS.length}`);
  console.log(`Reps per pair/model:     ${FULL_RUN_REPS}`);
  console.log(`Max budget:              ${models.length * PHASE11A_ALL_PAIRS.length * FULL_RUN_REPS} runs`);
  console.log("");

  // Summarize pairs
  console.log("Pair plan:");
  for (const pair of PHASE11A_ALL_PAIRS) {
    const bridgeStr = pair.expectedBridge ?? "none";
    const freqStr = pair.priorFreq !== null ? pair.priorFreq.toFixed(3) : "n/a";
    console.log(
      `  ${pair.id} (${pair.direction}): "${pair.from}" -> "${pair.to}" | ` +
      `expected bridge: "${bridgeStr}" prior freq: ${freqStr} | ` +
      `tests: [${pair.tests.join(", ")}]`,
    );
  }
  console.log("");

  if (dryRun) {
    console.log("Probe stage:");
    for (const model of models) {
      console.log(`  Would probe ${model.displayName} with ${PHASE11A_PROBE_PAIRS.length} pairs`);
    }
    console.log("");
    console.log("Full-run stage (depends on probe results):");
    console.log(`  Up to ${models.length} models x ${PHASE11A_ALL_PAIRS.length} pairs x ${FULL_RUN_REPS} reps = ${models.length * PHASE11A_ALL_PAIRS.length * FULL_RUN_REPS} runs`);
    console.log("");
    console.log("(Dry run -- no API calls made.)");
    return;
  }

  // Ensure output directories
  await mkdir(outputDir, { recursive: true });
  await mkdir(probesDir, { recursive: true });

  const experimentStartTime = Date.now();

  // ========================================================================
  // Stage 1: Probe all models
  // ========================================================================

  console.log("=== Stage 1: Model Probing ===\n");

  const reliabilityResults: Phase10ModelReliabilityResult[] = [];

  for (const model of models) {
    // Check for existing probe report (resume support)
    const probeReportPath = path.join(probesDir, `probe-${model.id}.json`);
    if (existsSync(probeReportPath)) {
      const existingReport = JSON.parse(await readFile(probeReportPath, "utf-8")) as Phase10ModelReliabilityResult;

      // In patient mode, re-probe models that were previously unavailable
      // (they may have been gated by the stricter default thresholds)
      if (patientMode && existingReport.status === "unavailable") {
        console.log(`  ${model.displayName}: Re-probing (was unavailable, now in patient mode)`);
      } else {
        reliabilityResults.push(existingReport);
        console.log(`  ${model.displayName}: Loaded existing probe report (status: ${existingReport.status})`);
        continue;
      }
    }

    const reliability = await probeModel(model, PHASE11A_PROBE_PAIRS, {
      requestTimeoutMs,
      latencyDiscardMs,
      latencySlowMs,
    });
    reliabilityResults.push(reliability);

    // Save probe result atomically
    const probePath = path.join(probesDir, `probe-${model.id}.json`);
    const tmpProbe = `${probePath}.tmp.${Date.now()}`;
    await writeFile(tmpProbe, JSON.stringify(reliability, null, 2));
    await rename(tmpProbe, probePath);

    console.log("");
  }

  // Summarize probe results
  console.log("Probe summary:");
  for (const r of reliabilityResults) {
    const formatStr = r.usesDirectFormat ? " [direct format]" : "";
    console.log(
      `  ${r.displayName}: ${r.status}` +
      ` (connectivity: ${(r.connectivityRate * 100).toFixed(0)}%,` +
      ` parse: ${(r.parseRate * 100).toFixed(0)}%,` +
      ` p50: ${r.medianLatencyMs}ms)${formatStr}`,
    );
  }
  console.log("");

  // Determine which models proceed to full collection
  const eligibleModels = reliabilityResults.filter(
    (r) => r.status === "reliable" || r.status === "slow",
  );
  const skippedModels = reliabilityResults.filter(
    (r) => r.status !== "reliable" && r.status !== "slow",
  );

  if (skippedModels.length > 0) {
    console.log("Skipped models:");
    for (const r of skippedModels) {
      console.log(`  ${r.displayName}: ${r.status} - ${r.statusReason}`);
    }
    console.log("");
  }

  if (eligibleModels.length === 0) {
    console.log("No models passed probing. Nothing to collect.");

    // Write summary even if no models pass
    const summaryPath = path.join(outputDir, "expanded-generality-summary.json");
    const summary = {
      experiment: "expanded-generality",
      phase: "11A",
      startedAt: new Date(experimentStartTime).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - experimentStartTime,
      stages: { probe: reliabilityResults.length, fullRun: 0 },
      reliabilityResults,
      models: models.map((m) => m.id),
      totalNewRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      successRate: 0,
      perModel: {},
    };
    const tmpSummary = `${summaryPath}.tmp.${Date.now()}`;
    await writeFile(tmpSummary, JSON.stringify(summary, null, 2));
    await rename(tmpSummary, summaryPath);

    console.log(`Summary: ${summaryPath}`);
    return;
  }

  console.log(`Proceeding with ${eligibleModels.length} model(s): ${eligibleModels.map((r) => r.displayName).join(", ")}`);
  console.log("");

  // ========================================================================
  // Stage 2: Full-run collection
  // ========================================================================

  console.log("=== Stage 2: Full-Run Collection ===\n");

  // Resolve eligible ModelConfig objects and their prompt formats
  const eligibleModelConfigs: Array<{ model: ModelConfig; format: PromptFormat; isSlow: boolean }> = [];
  for (const r of eligibleModels) {
    const model = models.find((m) => m.id === r.modelId);
    if (!model) continue;
    eligibleModelConfigs.push({
      model,
      format: r.usesDirectFormat ? "direct" : PROMPT_FORMAT,
      isSlow: r.status === "slow",
    });
  }

  // Adjust per-model concurrency for slow models
  const adjustedPerModelConcurrency = new Map(perModelConcurrency);
  for (const { model, isSlow } of eligibleModelConfigs) {
    if (isSlow) {
      adjustedPerModelConcurrency.set(model.id, 1);
      console.log(`  ${model.displayName}: concurrency set to 1 (slow)`);
    }
  }

  // Load existing results for resume support
  const existing = await loadExistingResults(outputDir);
  if (existing.results.length > 0) {
    console.log(`Found ${existing.results.length} existing results in ${outputDir}/`);
    console.log("");
  }

  // Build the run manifest
  const requests: ElicitationRequest[] = [];

  for (const pair of PHASE11A_ALL_PAIRS) {
    const syntheticPair = makeSyntheticPair(pair);

    for (const { model, format } of eligibleModelConfigs) {
      const key = runKey(syntheticPair.id, model.id);
      const existingCount = existing.counts.get(key) ?? 0;
      const needed = Math.max(0, FULL_RUN_REPS - existingCount);

      if (needed > 0 && existingCount > 0) {
        console.log(`  ${pair.id} (${model.id}): have ${existingCount}, need ${needed} more`);
      }

      for (let r = 0; r < needed; r++) {
        requests.push({
          model,
          pair: syntheticPair,
          waypointCount: WAYPOINT_COUNT,
          promptFormat: format,
          temperature: TEMPERATURE,
          ...(patientMode ? { requestTimeoutMs } : {}),
        });
      }
    }
  }

  const totalNewRuns = requests.length;

  console.log("");
  console.log("Run budget:");
  console.log(`  Eligible models:        ${eligibleModelConfigs.length}`);
  console.log(`  Pairs:                  ${PHASE11A_ALL_PAIRS.length}`);
  console.log(`  Target reps/pair/model: ${FULL_RUN_REPS}`);
  console.log(`  Existing results:       ${existing.results.length}`);
  console.log(`  Total new runs:         ${totalNewRuns}`);
  console.log("");

  // Time estimate
  if (totalNewRuns > 0) {
    const estLow = Math.round((totalNewRuns * 2) / globalConcurrency);
    const estHigh = Math.round((totalNewRuns * 4) / globalConcurrency);
    console.log(`Estimated time:           ${formatDuration(estLow * 1000)} - ${formatDuration(estHigh * 1000)}`);
    console.log("");
  }

  if (totalNewRuns === 0) {
    console.log("All runs already completed. Nothing to do.");
  } else {
    // Per-model progress counters
    const perModelCompleted = new Map<string, number>();
    const perModelFailed = new Map<string, number>();
    for (const { model } of eligibleModelConfigs) {
      perModelCompleted.set(model.id, 0);
      perModelFailed.set(model.id, 0);
    }

    const allNewResults: ElicitationResult[] = [];
    let totalCompleted = 0;
    let writeFailures = 0;

    // Helper: write a result atomically
    async function writeResult(result: ElicitationResult): Promise<boolean> {
      const resultPath = path.join(outputDir, `${result.runId}.json`);
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
      const modelParts = eligibleModelConfigs.map(({ model }) => {
        const done = perModelCompleted.get(model.id) ?? 0;
        const fail = perModelFailed.get(model.id) ?? 0;
        return `${model.id}:${done}${fail > 0 ? `(${fail}f)` : ""}`;
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

    console.log("Starting full-run collection...\n");

    const scheduler = new Scheduler(
      { globalConcurrency, perModelConcurrency: adjustedPerModelConcurrency, throttleMs },
      {
        onResult: async (result: ElicitationResult) => {
          const modelId = result.modelShortId;
          perModelCompleted.set(modelId, (perModelCompleted.get(modelId) ?? 0) + 1);
          if (result.failureMode) {
            perModelFailed.set(modelId, (perModelFailed.get(modelId) ?? 0) + 1);
          }
          const written = await writeResult(result);
          if (!written) writeFailures++;
          allNewResults.push(result);
          totalCompleted++;
          reportProgress();
        },
        onProgress: () => {},
      },
    );

    const schedulerResults = await scheduler.run(requests);
    console.log(`\n  Full-run collection complete: ${schedulerResults.length} results\n`);

    // Summary
    const successful = allNewResults.filter((r) => !r.failureMode);
    const failed = allNewResults.filter((r) => r.failureMode);

    console.log("");
    const duration = Date.now() - experimentStartTime;

    console.log("=== Phase 11A: Expanded Model Generality Experiment Complete ===\n");
    console.log(`Duration:       ${formatDuration(duration)}`);
    console.log(`New runs:       ${allNewResults.length}`);
    console.log(`Successful:     ${successful.length}`);
    console.log(`Failed:         ${failed.length}`);
    console.log(`Success rate:   ${allNewResults.length > 0 ? ((successful.length / allNewResults.length) * 100).toFixed(1) : 0}%`);
    if (writeFailures > 0) {
      console.log(`\u26a0 Write failures: ${writeFailures} (results may need re-collection)`);
    }
    console.log("");

    console.log("Per-model breakdown:");
    for (const { model } of eligibleModelConfigs) {
      const done = perModelCompleted.get(model.id) ?? 0;
      const fail = perModelFailed.get(model.id) ?? 0;
      console.log(`  ${model.displayName}: ${done - fail}/${done} successful`);
    }
    console.log("");

    // Per-pair breakdown
    const pairCounts = new Map<string, { total: number; failed: number }>();
    for (const result of allNewResults) {
      const pairId = result.pair.id;
      const entry = pairCounts.get(pairId) ?? { total: 0, failed: 0 };
      entry.total++;
      if (result.failureMode) entry.failed++;
      pairCounts.set(pairId, entry);
    }
    console.log("Per-pair breakdown:");
    for (const [pairId, counts] of pairCounts) {
      const successCount = counts.total - counts.failed;
      console.log(`  ${pairId}: ${successCount}/${counts.total} successful`);
    }
    console.log("");

    // Write summary
    const summaryPath = path.join(outputDir, "expanded-generality-summary.json");
    const summary = {
      experiment: "expanded-generality",
      phase: "11A",
      startedAt: new Date(experimentStartTime).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: duration,
      stages: {
        probe: reliabilityResults.length,
        fullRun: allNewResults.length,
      },
      reliabilityResults,
      models: models.map((m) => m.id),
      eligibleModels: eligibleModelConfigs.map(({ model }) => model.id),
      skippedModels: skippedModels.map((r) => ({ id: r.modelId, status: r.status, reason: r.statusReason })),
      pairs: PHASE11A_ALL_PAIRS.map((p) => p.id),
      waypointCount: WAYPOINT_COUNT,
      totalNewRuns: allNewResults.length,
      successfulRuns: successful.length,
      failedRuns: failed.length,
      successRate: allNewResults.length > 0 ? successful.length / allNewResults.length : 0,
      perModel: Object.fromEntries(
        eligibleModelConfigs.map(({ model }) => [
          model.id,
          {
            completed: perModelCompleted.get(model.id) ?? 0,
            failed: perModelFailed.get(model.id) ?? 0,
          },
        ]),
      ),
    };
    const tmpSummary = `${summaryPath}.tmp.${Date.now()}`;
    await writeFile(tmpSummary, JSON.stringify(summary, null, 2));
    await rename(tmpSummary, summaryPath);

    console.log(`Summary: ${summaryPath}`);
    console.log(`Results: ${outputDir}/`);

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
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
