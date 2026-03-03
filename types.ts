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

  // Data quality
  extractionCountMismatch?: boolean; // True if extracted count != requested count
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

// ── Phase 2: Reversal & Asymmetry Types ─────────────────────────────

export interface AsymmetryMetrics {
  pairId: string;
  modelId: string;
  /** Mean Jaccard across all forward×reverse run pairs */
  meanCrossDirectionJaccard: number;
  /** Bootstrap 95% CI for mean cross-direction Jaccard */
  crossDirectionJaccardCI: [number, number];
  /** 1 - meanCrossDirectionJaccard; 0=symmetric, 1=asymmetric */
  asymmetryIndex: number;
  /** Bootstrap 95% CI for asymmetry index */
  asymmetryIndexCI: [number, number];
  /** Permutation test p-value (null: direction doesn't matter) */
  permutationPValue: number;
  /** Waypoints appearing >50% in forward only */
  forwardExclusiveWaypoints: string[];
  /** Waypoints appearing >50% in reverse only */
  reverseExclusiveWaypoints: string[];
  /** Normalized Levenshtein between characteristic forward/reverse sequences */
  normalizedEditDistance: number;
  /** Spearman's rho between forward and reverse orderings (-1=mirror, 0=unrelated, 1=same) */
  reversalOrderRho: number | null;
  /** Number of forward runs used */
  forwardRunCount: number;
  /** Number of reverse runs used */
  reverseRunCount: number;
}

export interface CategoryAsymmetry {
  category: PairCategory;
  meanAsymmetryIndex: number;
  asymmetryIndexCI: [number, number];
  pairCount: number;
  /** Prediction from spec: "high symmetry", "asymmetric", "unknown" */
  prediction: string;
  /** Whether observed matches prediction */
  predictionMatch: boolean | null;
}

export interface ModelDirectionSensitivity {
  modelId: string;
  displayName: string;
  meanAsymmetryIndex: number;
  asymmetryIndexCI: [number, number];
  /** Pairs ordered by asymmetry (most asymmetric first) */
  pairAsymmetries: Array<{ pairId: string; asymmetryIndex: number }>;
}

export interface ReversalAnalysisOutput {
  metadata: {
    timestamp: string;
    forwardResultCount: number;
    reverseResultCount: number;
    polysemySupplementaryCount: number;
    models: string[];
    pairs: string[];
  };
  pairModelMetrics: AsymmetryMetrics[];
  categoryAsymmetries: CategoryAsymmetry[];
  modelSensitivities: ModelDirectionSensitivity[];
  polysemyComparisons: Array<{
    group: string;
    pairs: Array<{ pairId: string; from: string; to: string }>;
    crossPairJaccard: number | null;
    hasDataForBothSenses: boolean;
  }>;
}

export interface SchedulerConfig {
  globalConcurrency: number;
  perModelConcurrency: Map<string, number>;
  throttleMs: number;
}

export interface SchedulerStatus {
  totalRequests: number;
  completed: number;
  failed: number;
  inFlight: number;
  startTime: string;
  lastUpdateTime: string;
  estimatedRemainingMs?: number;
}
