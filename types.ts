/**
 * Core type definitions for the Conceptual Topology Mapping Benchmark.
 */

// ── Concept Pairs ──────────────────────────────────────────────────

export type Concreteness = "concrete" | "abstract";
export type RelationalType =
  | "hierarchical"
  | "associative"
  | "cross-domain"
  | "near-synonym"
  | "antonym";
export type PolysemyLevel = "unambiguous" | "ambiguous";
export type PairCategory =
  | "anchor"
  | "hierarchy"
  | "cross-domain"
  | "polysemy"
  | "near-synonym"
  | "antonym"
  | "control-identity"
  | "control-random"
  | "control-nonsense";
export type SetType = "holdout" | "reporting";

export interface ConceptPair {
  id: string;
  from: string;
  to: string;
  category: PairCategory;
  concreteness: [Concreteness, Concreteness]; // [from, to]
  relationalType: RelationalType;
  polysemy: PolysemyLevel;
  set: SetType;
  notes?: string;
  /** For polysemy pairs, groups pairs that share an ambiguous word */
  polysemyGroup?: string;
  /** For anchor pairs, the known basin from word-convergence */
  basin?: string;
  basinDepth?: "deep" | "moderate" | "flat";
}

// ── Prompt Formats ─────────────────────────────────────────────────

export type PromptFormat = "direct" | "semantic";

// ── Model Configuration ────────────────────────────────────────────

export interface ModelConfig {
  id: string; // Short name: "claude", "gpt", "grok", "gemini"
  openRouterId: string; // Exact OpenRouter model string
  displayName: string;
}

// ── Elicitation Results ────────────────────────────────────────────

export interface ElicitationRequest {
  model: ModelConfig;
  pair: ConceptPair;
  waypointCount: number;
  promptFormat: PromptFormat;
  temperature: number;
}

export interface ElicitationResult {
  // Request metadata
  model: string; // Exact OpenRouter model string
  modelShortId: string; // Short name
  providerRoute?: string; // Provider info from response
  pair: { from: string; to: string; id: string };
  waypointCount: number;
  promptFormat: PromptFormat;
  promptText: string;
  temperature: number;

  // Response
  rawResponse: string;
  extractedWaypoints: string[]; // Raw extracted (before canonicalization)
  canonicalizedWaypoints: string[]; // After canonicalization pipeline

  // Metadata
  timestamp: string; // ISO 8601
  durationMs: number;
  retryCount: number;
  failureMode?: string;
  openRouterGenId?: string; // Generation ID from OpenRouter

  // Run context
  runId: string; // Unique run identifier
  batchId?: string; // If part of a batch
}

// ── Metrics ────────────────────────────────────────────────────────

export interface JaccardResult {
  similarity: number; // 0-1
  intersection: string[];
  union: string[];
}

export interface PositionalOverlap {
  /** Fraction of positions where same waypoint appears */
  exactPositionMatch: number;
  /** Per-position matches */
  positionMatches: boolean[];
}

export interface ConsistencyMetrics {
  /** Jaccard similarity across runs */
  jaccard: JaccardResult;
  /** Positional overlap across runs */
  positionalOverlap: PositionalOverlap;
  /** Average pairwise semantic similarity (embedding-based) */
  semanticSimilarity?: number;
  /** Entropy of waypoint distribution across runs */
  distributionalEntropy: number;
}

// ── Batch / Experiment Configuration ───────────────────────────────

export interface ExperimentConfig {
  name: string;
  description: string;
  pairs: ConceptPair[];
  models: ModelConfig[];
  waypointCounts: number[];
  promptFormats: PromptFormat[];
  repsPerCondition: number;
  temperature: number;
  outputDir: string;
}

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  startTime: string;
  estimatedRemaining?: number;
}
