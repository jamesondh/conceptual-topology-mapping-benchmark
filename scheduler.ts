/**
 * Global request scheduler with per-model rate limiting.
 *
 * Replaces sequential batch execution with a scheduler that respects
 * both global and per-model concurrency limits. Supports resume by
 * diffing the run manifest against existing results.
 */

import { elicit } from "./index.ts";
import type {
  ElicitationRequest,
  ElicitationResult,
  SchedulerConfig,
  SchedulerStatus,
} from "./types.ts";

interface SchedulerCallbacks {
  onProgress?: (status: SchedulerStatus) => void;
  onResult?: (result: ElicitationResult) => void;
}

export class Scheduler {
  private config: SchedulerConfig;
  private queue: Array<{ request: ElicitationRequest; index: number }> = [];
  private results: ElicitationResult[] = [];
  private inFlight = 0;
  private perModelInFlight = new Map<string, number>();
  private perModelLastRequest = new Map<string, number>();
  private completed = 0;
  private failed = 0;
  private startTime = "";
  private resolveAll?: () => void;
  private callbacks: SchedulerCallbacks;

  constructor(config: Partial<SchedulerConfig> = {}, callbacks: SchedulerCallbacks = {}) {
    this.config = {
      globalConcurrency: config.globalConcurrency ?? 8,
      perModelConcurrency: config.perModelConcurrency ?? new Map(),
      throttleMs: config.throttleMs ?? 0,
    };
    this.callbacks = callbacks;
  }

  /**
   * Run all requests through the scheduler, respecting concurrency limits.
   * Returns results in the same order as the input requests.
   */
  async run(requests: ElicitationRequest[]): Promise<ElicitationResult[]> {
    if (requests.length === 0) return [];

    this.startTime = new Date().toISOString();
    this.results = new Array(requests.length);
    this.completed = 0;
    this.failed = 0;
    this.inFlight = 0;
    this.perModelInFlight.clear();
    this.perModelLastRequest.clear();

    // Enqueue all requests
    this.queue = requests.map((request, index) => ({ request, index }));

    // Start dispatching
    return new Promise((resolve) => {
      this.resolveAll = () => resolve(this.results);
      this.dispatch();
    });
  }

  private getModelConcurrency(modelId: string): number {
    return this.config.perModelConcurrency.get(modelId) ?? 2;
  }

  private getModelInFlight(modelId: string): number {
    return this.perModelInFlight.get(modelId) ?? 0;
  }

  private async dispatch(): Promise<void> {
    while (this.queue.length > 0) {
      // Find next eligible request
      const eligibleIdx = this.queue.findIndex(({ request }) => {
        const modelId = request.model.id;
        return (
          this.inFlight < this.config.globalConcurrency &&
          this.getModelInFlight(modelId) < this.getModelConcurrency(modelId)
        );
      });

      if (eligibleIdx === -1) break; // No eligible requests, wait for completions

      const item = this.queue.splice(eligibleIdx, 1)[0];
      const modelId = item.request.model.id;

      // Update counters BEFORE throttle sleep to prevent concurrent
      // dispatch() calls from over-filling concurrency during await
      this.inFlight++;
      this.perModelInFlight.set(modelId, this.getModelInFlight(modelId) + 1);

      // Apply throttle
      if (this.config.throttleMs > 0) {
        const lastTime = this.perModelLastRequest.get(modelId) ?? 0;
        const elapsed = Date.now() - lastTime;
        if (elapsed < this.config.throttleMs) {
          await new Promise((r) => setTimeout(r, this.config.throttleMs - elapsed));
        }
      }
      this.perModelLastRequest.set(modelId, Date.now());

      // Fire and don't await — let it complete asynchronously
      this.executeRequest(item.request, item.index).catch(() => {});
    }
  }

  private async executeRequest(
    request: ElicitationRequest,
    index: number,
  ): Promise<void> {
    const modelId = request.model.id;

    try {
      const result = await elicit(request);
      this.results[index] = result;

      if (result.failureMode) {
        this.failed++;
      }

      this.callbacks.onResult?.(result);
    } catch (error: unknown) {
      // Should not happen since elicit handles errors internally
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.results[index] = {
        model: request.model.openRouterId,
        modelShortId: request.model.id,
        pair: { from: request.pair.from, to: request.pair.to, id: request.pair.id },
        waypointCount: request.waypointCount,
        promptFormat: request.promptFormat,
        promptText: "",
        temperature: request.temperature,
        rawResponse: "",
        extractedWaypoints: [],
        canonicalizedWaypoints: [],
        timestamp: new Date().toISOString(),
        durationMs: 0,
        retryCount: 0,
        failureMode: errorMsg,
        runId: crypto.randomUUID(),
      };
      this.failed++;
    }

    this.completed++;
    this.inFlight--;
    this.perModelInFlight.set(modelId, this.getModelInFlight(modelId) - 1);

    // Report progress
    const status: SchedulerStatus = {
      totalRequests: this.results.length,
      completed: this.completed,
      failed: this.failed,
      inFlight: this.inFlight,
      startTime: this.startTime,
      lastUpdateTime: new Date().toISOString(),
    };

    if (this.completed > 0) {
      const elapsedMs = Date.now() - new Date(this.startTime).getTime();
      const msPerRequest = elapsedMs / this.completed;
      const remaining = this.results.length - this.completed;
      status.estimatedRemainingMs = Math.round(msPerRequest * remaining);
    }

    this.callbacks.onProgress?.(status);

    // Check if done
    if (this.completed === this.results.length) {
      this.resolveAll?.();
      return;
    }

    // Try to dispatch more
    this.dispatch();
  }
}

/**
 * Parse a model concurrency spec string like "claude=2,gpt=3,grok=3,gemini=3"
 * into a Map.
 */
export function parseModelConcurrency(spec: string): Map<string, number> {
  const map = new Map<string, number>();
  for (const part of spec.split(",")) {
    const [model, count] = part.trim().split("=");
    if (model && count) {
      const n = parseInt(count, 10);
      if (!isNaN(n) && n > 0) {
        map.set(model.trim(), n);
      }
    }
  }
  return map;
}
