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

// ── Phase 3A: Positional Convergence Types ─────────────────────────

export interface PositionalConvergenceMetrics {
  pairId: string;
  modelId: string;
  /** Per-position mirror-match rate (fwd pos i vs rev pos 5-i) */
  perPositionMatchRate: number[];
  /** Per-position pooled Jaccard (vocabulary overlap at each mirror position) */
  perPositionJaccard: number[];
  /** Linear regression slope of match rate across positions (positive = convergence) */
  convergenceSlope: number;
  /** R² of the linear regression */
  convergenceR2: number;
  /** Number of forward runs used */
  forwardRunCount: number;
  /** Number of reverse runs used */
  reverseRunCount: number;
}

export interface CategoryConvergence {
  category: PairCategory;
  /** Mean convergence slope across all pair/model combos in this category */
  meanConvergenceSlope: number;
  convergenceSlopeCI: [number, number];
  /** Mean per-position match rates (averaged across combos) */
  meanPerPositionMatchRate: number[];
  pairModelCount: number;
}

export interface ModelConvergence {
  modelId: string;
  displayName: string;
  /** Mean convergence slope across all pairs for this model */
  meanConvergenceSlope: number;
  convergenceSlopeCI: [number, number];
  /** Mean per-position match rates (averaged across pairs) */
  meanPerPositionMatchRate: number[];
  pairCount: number;
}

export interface PositionalConvergenceOutput {
  metadata: {
    timestamp: string;
    forwardResultCount: number;
    reverseResultCount: number;
    models: string[];
    pairs: string[];
    waypointCount: number;
  };
  pairModelMetrics: PositionalConvergenceMetrics[];
  categoryConvergences: CategoryConvergence[];
  modelConvergences: ModelConvergence[];
  /** Overall summary stats */
  overall: {
    meanConvergenceSlope: number;
    convergenceSlopeCI: [number, number];
    meanPerPositionMatchRate: number[];
    /** Fraction of combos with positive convergence slope */
    positiveConvergenceFraction: number;
  };
}

// ── Phase 3B: Transitive Path Structure Types ──────────────────────

export type TripleType =
  | "hierarchical"
  | "semantic-chain"
  | "existing-pair"
  | "polysemy-extend"
  | "random-control";

export interface ConceptTriple {
  id: string;
  A: string;
  B: string;
  C: string;
  type: TripleType;
  notes?: string;
  /** Pair IDs from existing data that can be reused (e.g. "cross-music-mathematics") */
  reusableLegs?: {
    /** existing pair ID for A→C leg */
    AC?: string;
    /** existing pair ID for C→A leg (reverse) */
    CA?: string;
    /** existing pair ID for A→B leg */
    AB?: string;
    /** existing pair ID for B→A leg (reverse) */
    BA?: string;
    /** existing pair ID for B→C leg */
    BC?: string;
    /** existing pair ID for C→B leg (reverse) */
    CB?: string;
  };
}

export interface TransitivityMetrics {
  tripleId: string;
  modelId: string;
  /** Jaccard(waypoints(A→C), waypoints(A→B) ∪ waypoints(B→C)) */
  waypointTransitivity: number;
  waypointTransitivityCI: [number, number];
  /** Navigational distance: d(X→Y) = 1 - mean within-direction Jaccard */
  distanceAB: number;
  distanceBC: number;
  distanceAC: number;
  /** Whether triangle inequality holds: d(A→C) ≤ d(A→B) + d(B→C) */
  triangleInequalityHolds: boolean;
  /** Triangle inequality slack: d(A→B) + d(B→C) - d(A→C) */
  triangleSlack: number;
  /** Waypoints on A→C but NOT on A→B ∪ B→C ("shortcuts") */
  shortcuts: string[];
  /** Waypoints on A→B ∪ B→C but NOT on A→C ("detours") */
  detours: string[];
  /** Whether B appears as a waypoint on any A→C run */
  bridgeConceptAppears: boolean;
  /** Fraction of A→C runs where B appears */
  bridgeConceptFrequency: number;
  /** Run counts */
  runCountAB: number;
  runCountBC: number;
  runCountAC: number;
}

export interface TripleTypeAggregation {
  type: TripleType;
  meanWaypointTransitivity: number;
  waypointTransitivityCI: [number, number];
  meanTriangleSlack: number;
  triangleInequalityHoldsFraction: number;
  meanBridgeConceptFrequency: number;
  tripleCount: number;
}

export interface TransitivityAnalysisOutput {
  metadata: {
    timestamp: string;
    triples: string[];
    models: string[];
    totalNewRuns: number;
    totalReusedRuns: number;
  };
  tripleModelMetrics: TransitivityMetrics[];
  tripleTypeAggregations: TripleTypeAggregation[];
  modelAggregations: Array<{
    modelId: string;
    displayName: string;
    meanWaypointTransitivity: number;
    waypointTransitivityCI: [number, number];
    meanTriangleSlack: number;
    triangleInequalityHoldsFraction: number;
  }>;
}
