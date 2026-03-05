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
    /** Number of unique reused run sets (totalReusedRuns counts usages, which may double-count across triples) */
    totalUniqueReusedRuns?: number;
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

// ── Phase 4: Cross-Model Bridge Topology Types ─────────────────────

export type Phase4DiagnosticType =
  | "polysemy-retest"
  | "polysemy-financial"
  | "cross-domain-concrete"
  | "abstract-retest"
  | "abstract-bridge"
  | "concrete-hierarchical"
  | "random-control";

export interface Phase4Triple extends ConceptTriple {
  /** Target repetitions per model per leg */
  targetReps: number;
  /** Diagnostic category for Phase 4 analysis */
  diagnosticType: Phase4DiagnosticType;
  /** Bridge concept to test for on A→C path */
  bridgeConcept: string;
  /** Predicted bridge frequencies by model: { modelId: [low, high] } */
  predictedBridgeFreq?: Record<string, [number, number]>;
  /** Reusable legs with source phase info */
  reusableLegsWithSource?: Record<string, { pairId: string; phase: string; expectedReps: number }>;
}

export interface ModelPairBridgeAgreement {
  modelA: string;
  modelB: string;
  /** Per-triple absolute bridge frequency differences */
  perTripleBridgeDiffs: Array<{
    tripleId: string;
    freqA: number;
    freqB: number;
    absDiff: number;
  }>;
  /** Mean absolute bridge frequency difference across triples */
  meanAbsBridgeDiff: number;
  /** Binary agreement rate (both find bridge or both miss) */
  binaryAgreementRate: number;
  /** Pearson correlation of bridge frequency vectors */
  pearsonCorrelation: number | null;
}

export interface CrossModelJaccardResult {
  modelA: string;
  modelB: string;
  tripleId: string;
  /** Mean cross-model Jaccard on A→C path */
  crossModelJaccard: number;
  crossModelJaccardCI: [number, number];
  /** Bridge-removed Jaccard (circularity control) */
  bridgeRemovedJaccard: number;
  bridgeRemovedJaccardCI: [number, number];
}

export interface BridgeAgreementOutput {
  metadata: {
    timestamp: string;
    triples: string[];
    models: string[];
    nonControlTriples: string[];
    totalObservations: number;
  };
  /** Per model-pair bridge agreement metrics */
  modelPairAgreements: ModelPairBridgeAgreement[];
  /** Per (model-pair, triple) cross-model Jaccard */
  crossModelJaccards: CrossModelJaccardResult[];
  /** Correlation: bridge freq diff vs cross-model Jaccard */
  bridgeVsPathCorrelation: {
    pearsonR: number | null;
    /** After removing bridge concept from waypoints */
    bridgeRemovedPearsonR: number | null;
    observations: number;
  };
  /** Gemini isolation index */
  geminiIsolation: {
    geminiPairMeanDiff: number;
    nonGeminiPairMeanDiff: number;
    isolationIndex: number;
    isolationIndexCI: [number, number];
  };
}

export interface Phase4TargetedBridgesOutput {
  metadata: {
    timestamp: string;
    triples: string[];
    models: string[];
    totalNewRuns: number;
    totalReusedRuns: number;
  };
  /** Per triple/model bridge metrics (reuses TransitivityMetrics) */
  tripleModelMetrics: TransitivityMetrics[];
  /** Per triple prediction evaluation */
  predictions: Array<{
    tripleId: string;
    diagnosticType: Phase4DiagnosticType;
    bridgeConcept: string;
    perModel: Array<{
      modelId: string;
      bridgeFrequency: number;
      bridgeFrequencyCI: [number, number];
      predictedRange: [number, number] | null;
      matchesPrediction: boolean | null;
    }>;
  }>;
  /** Temporal drift check for top-up triples */
  temporalDrift: Array<{
    tripleId: string;
    legId: string;
    modelId: string;
    withinBatchJaccard: number;
    crossBatchJaccard: number;
    driftDetected: boolean;
  }>;
  /** Gemini fragmentation characterization */
  geminiCharacterization: {
    concreteTriples: Array<{ tripleId: string; bridgeFreq: number }>;
    abstractTriples: Array<{ tripleId: string; bridgeFreq: number }>;
    polysemyTriples: Array<{ tripleId: string; bridgeFreq: number }>;
    concreteSuccess: boolean;
    abstractFailure: boolean;
    fragmentationBoundary: string;
  };
}

// ── Phase 5: Cue-Strength, Dimensionality & Convergence Types ───────

export type CueStrengthLevel = "very-high" | "high" | "medium" | "low";

export type AxisLabel = string; // e.g., "physics", "weight", "illumination", "financial", "geographic"

export type AxisPattern = "same-axis" | "cross-axis" | "partial-overlap";

export type Phase5DiagnosticType =
  | "cue-strength"
  | "dimensionality"
  | "convergence"
  | "random-control";

export type ConvergencePairType =
  | "bridge-present"
  | "bridge-absent"
  | "bridge-variable"
  | "no-bridge-control";

export interface Phase5CueStrengthTriple {
  id: string;
  A: string;
  B: string;
  C: string;
  family: string; // e.g., "physical-causation", "biological-growth"
  cueLevel: CueStrengthLevel;
  /** Numeric cue level for logistic fitting (1=low, 2=medium, 3=high, 4=very-high) */
  cueLevelNumeric: number;
  diagnosticType: "cue-strength" | "random-control";
  bridgeConcept: string;
  notes?: string;
  /** Target reps per model per leg */
  targetReps: { AC: number; AB: number; BC: number };
  /** Predicted bridge frequency ranges by model */
  predictedBridgeFreq?: Record<string, [number, number]>;
  /** Reusable legs from prior phases */
  reusableLegsWithSource?: Record<string, { pairId: string; phase: string; expectedReps: number }>;
}

export interface Phase5DimensionalityTriple {
  id: string;
  A: string;
  B: string; // focal concept (bridge)
  C: string;
  focalConcept: string; // "light", "bank", or "fire"
  axisA: AxisLabel; // axis from A to B
  axisC: AxisLabel; // axis from B to C
  axisPattern: AxisPattern;
  diagnosticType: "dimensionality" | "random-control";
  bridgeConcept: string; // same as B — the focal concept IS the bridge
  notes?: string;
  targetReps: { AC: number; AB?: number; BC?: number };
  predictedBridgeFreq?: Record<string, [number, number]>;
}

export interface Phase5ConvergencePair {
  id: string;
  from: string;
  to: string;
  pairType: ConvergencePairType;
  /** Expected bridge concept (if any) */
  expectedBridge?: string;
  /** Which models are expected to show the bridge (for bridge-variable pairs) */
  bridgeModels?: string[];
  notes?: string;
  targetReps: number; // per model per direction
}

export interface LogisticFitResult {
  /** Threshold parameter: cue level at which bridge freq = 0.50 */
  threshold: number;
  /** Steepness parameter (slope at threshold) */
  steepness: number;
  /** R² of the fit */
  r2: number;
  /** Fitted values at each cue level */
  fittedValues: Array<{ cueLevel: number; fitted: number; observed: number }>;
}

export interface CueStrengthFamilyResult {
  family: string;
  modelId: string;
  /** Bridge frequencies at each cue level within this family */
  cueLevelFrequencies: Array<{
    tripleId: string;
    cueLevel: CueStrengthLevel;
    cueLevelNumeric: number;
    bridgeFrequency: number;
    bridgeFrequencyCI: [number, number];
  }>;
  /** Whether bridge frequency monotonically decreases across cue levels */
  monotonicDecrease: boolean;
}

export interface CueStrengthAnalysisOutput {
  metadata: {
    timestamp: string;
    triples: string[];
    models: string[];
    families: string[];
    totalNewRuns: number;
    totalReusedRuns: number;
  };
  /** Per-triple/model bridge metrics */
  tripleModelMetrics: TransitivityMetrics[];
  /** Per-family results */
  familyResults: CueStrengthFamilyResult[];
  /** Per-model logistic fit */
  logisticFits: Array<{
    modelId: string;
    fit: LogisticFitResult;
  }>;
  /** Gemini threshold comparison */
  geminiThresholdComparison: {
    geminiThreshold: number;
    otherMeanThreshold: number;
    thresholdDifference: number;
    thresholdDifferenceCI: [number, number];
    significantlyHigher: boolean;
  } | null;
  /** Control validation */
  controlValidation: Array<{
    tripleId: string;
    modelId: string;
    bridgeFrequency: number;
    pass: boolean;
  }>;
}

export interface DimensionalityAnalysisOutput {
  metadata: {
    timestamp: string;
    triples: string[];
    models: string[];
    focalConcepts: string[];
    totalNewRuns: number;
    totalReusedRuns: number;
  };
  /** Per-triple/model bridge frequency */
  tripleModelBridgeFreqs: Array<{
    tripleId: string;
    modelId: string;
    focalConcept: string;
    axisPattern: AxisPattern;
    bridgeFrequency: number;
    bridgeFrequencyCI: [number, number];
    runCount: number;
  }>;
  /** Same-axis vs cross-axis comparison */
  axisComparison: {
    sameAxisMeanFreq: number;
    crossAxisMeanFreq: number;
    delta: number;
    deltaCI: [number, number];
    significantlyPositive: boolean;
  };
  /** Per focal concept comparison */
  perFocalConcept: Array<{
    focalConcept: string;
    sameAxisMeanFreq: number;
    crossAxisMeanFreq: number;
    delta: number;
    isPolysemous: boolean;
  }>;
  /** Per-model dimension count estimate */
  perModelDimensions: Array<{
    modelId: string;
    focalConcept: string;
    /** Number of cross-axis triples with bridge freq < 0.10 */
    independentAxes: number;
    totalCrossAxisTriples: number;
  }>;
  /** Control validation */
  controlValidation: Array<{
    tripleId: string;
    modelId: string;
    bridgeFrequency: number;
    pass: boolean;
  }>;
}

export interface ConvergenceProfileMetrics {
  pairId: string;
  modelId: string;
  direction: "forward" | "reverse";
  /** Per-position mirror-match rate (7 positions for 7-waypoint paths) */
  perPositionMatchRate: number[];
  /** W-shape contrast: convergence at pos 4 minus mean of pos 3 and 5 (0-indexed: pos 3 minus mean of pos 2 and 4) */
  wShapeContrast: number;
  runCount: number;
}

export interface ConvergenceAnalysisOutput {
  metadata: {
    timestamp: string;
    pairs: string[];
    models: string[];
    waypointCount: number;
    totalNewRuns: number;
  };
  /** Per-pair/model convergence profiles */
  profiles: ConvergenceProfileMetrics[];
  /** W-shape comparison: bridge-present vs bridge-absent */
  wShapeComparison: {
    bridgePresentMeanContrast: number;
    bridgePresentContrastCI: [number, number];
    bridgeAbsentMeanContrast: number;
    bridgeAbsentContrastCI: [number, number];
    difference: number;
    differenceCI: [number, number];
    significantlyPositive: boolean;
  };
  /** Bridge-variable pair analysis (music→mathematics) */
  bridgeVariableAnalysis: {
    pairId: string;
    perModel: Array<{
      modelId: string;
      wShapeContrast: number;
      hasBridge: boolean;
    }>;
  } | null;
}

// ── Phase 6: Navigational Salience & Forced Crossings Types ──────

export type Phase6PairCategory =
  | "bridge-present"
  | "bridge-absent"
  | "forced-crossing"
  | "same-axis";

export interface Phase6SaliencePair {
  id: string;
  from: string;
  to: string;
  knownBridge: string | null;
  bridgeFreqRange: string; // e.g. "0.00-1.00"
  rationale: string;
  targetReps: number;
  category: "bridge-present" | "bridge-absent";
}

export interface Phase6ForcedCrossingPair {
  id: string;
  from: string;
  to: string;
  bridge: string | null;
  pairType: "forced-crossing" | "same-axis";
  status: "validated" | "exploratory" | "comparison";
  bridgeFreq: string; // e.g. "0.95-1.00"
  notes?: string;
  targetReps: number; // per model per direction
}

export interface Phase6PositionalPair {
  id: string;
  from: string;
  to: string;
  knownBridge: string | null;
  expectedPosition: string; // e.g. "early (2-3)", "middle (3-5)"
  source: "reuse-5c" | "forced-crossing" | "position-contrast";
  targetReps: number; // per model per direction (0 = reuse only)
}

export interface WaypointFrequencyEntry {
  waypoint: string;
  count: number;
  frequency: number; // count / totalRuns
}

export interface SalienceLandscape {
  pairId: string;
  modelId: string;
  totalRuns: number;
  uniqueWaypoints: number;
  /** Waypoints ranked by frequency (descending) */
  rankedWaypoints: WaypointFrequencyEntry[];
  /** Shannon entropy of the waypoint frequency distribution */
  entropy: number;
  /** Top-3 waypoints by frequency */
  top3: string[];
  /** Whether the distribution significantly departs from uniform (KS test) */
  ksTestPValue: number;
  ksTestRejectsUniform: boolean;
}

export interface SalienceAnalysisOutput {
  metadata: {
    timestamp: string;
    pairs: string[];
    models: string[];
    totalRuns: number;
  };
  /** Per-pair/model salience landscapes */
  landscapes: SalienceLandscape[];
  /** KS test summary: how many pairs reject uniformity */
  ksTestSummary: {
    totalPairs: number;
    rejectingPairs: number;
    /** After Bonferroni correction */
    rejectingPairsBonferroni: number;
    primaryTestPasses: boolean; // ≥6 of 8 pairs reject uniformity
  };
  /** Cross-model top-3 agreement per pair */
  crossModelAgreement: Array<{
    pairId: string;
    /** All 4C2=6 model pair Jaccard values on top-3 sets */
    pairwiseJaccards: Array<{
      modelA: string;
      modelB: string;
      jaccard: number;
    }>;
    meanJaccard: number;
  }>;
  /** Retroactive cue-strength calibration */
  retroactiveCalibration: Array<{
    family: string;
    pairId: string;
    intuitiveTopBridge: string;
    empiricalTopBridge: string;
    match: boolean;
  }>;
  /** Novel waypoints discovered (>20% frequency, not previously identified) */
  novelWaypoints: Array<{
    pairId: string;
    modelId: string;
    waypoint: string;
    frequency: number;
  }>;
}

export interface ForcedCrossingAsymmetryResult {
  pairId: string;
  modelId: string;
  pairType: "forced-crossing" | "same-axis";
  asymmetryIndex: number;
  asymmetryIndexCI: [number, number];
  forwardRunCount: number;
  reverseRunCount: number;
  /** Bridge concept identified in forward paths */
  bridgeInForward: string[];
  /** Bridge concept identified in reverse paths */
  bridgeInReverse: string[];
  /** Position of bridge in forward paths (mean position index) */
  bridgePositionForward: number | null;
  /** Position of bridge in reverse paths (mean position index) */
  bridgePositionReverse: number | null;
  /** Whether bridge appears at same structural position (±1) in fwd vs rev */
  bridgePositionConsistent: boolean | null;
}

export interface ForcedCrossingAnalysisOutput {
  metadata: {
    timestamp: string;
    pairs: string[];
    models: string[];
    totalRuns: number;
  };
  /** Per-pair/model asymmetry results */
  pairModelResults: ForcedCrossingAsymmetryResult[];
  /** Primary test: forced-crossing vs same-axis mean asymmetry */
  primaryTest: {
    forcedCrossingMeanAsymmetry: number;
    forcedCrossingAsymmetryCI: [number, number];
    sameAxisMeanAsymmetry: number;
    sameAxisAsymmetryCI: [number, number];
    difference: number;
    differenceCI: [number, number];
    significantlyLower: boolean; // CI on difference excludes zero
  };
  /** Secondary: comparison with Phase 2 baseline (0.811) */
  secondaryBaseline: {
    forcedCrossingMeanAsymmetry: number;
    phase2Baseline: number;
    difference: number;
    differenceCI: [number, number];
  };
  /** Per-model analysis */
  perModelAnalysis: Array<{
    modelId: string;
    forcedCrossingMeanAsymmetry: number;
    sameAxisMeanAsymmetry: number;
    reduction: number;
  }>;
  /** Bridge positional consistency */
  bridgePositionalConsistency: {
    consistentFraction: number; // fraction with ±1 match
    totalPairsAnalyzed: number;
  };
}

export interface PositionalBridgeProfile {
  pairId: string;
  modelId: string;
  knownBridge: string;
  /** Per-position bridge frequency (7 positions for 7-waypoint paths) */
  perPositionBridgeFreq: number[];
  /** Modal position (0-indexed) where bridge appears most often */
  modalPosition: number;
  /** Bridge frequency at modal position */
  modalFrequency: number;
  /** Peak-detection W-shape contrast: modal freq - mean of neighbors */
  peakDetectionContrast: number;
  /** Fixed-midpoint (position 3) W-shape contrast for comparison */
  fixedMidpointContrast: number;
  runCount: number;
}

export interface PositionalAnalysisOutput {
  metadata: {
    timestamp: string;
    pairs: string[];
    models: string[];
    totalNewRuns: number;
    totalReusedRuns: number;
  };
  /** Per-pair/model positional profiles */
  profiles: PositionalBridgeProfile[];
  /** Primary test: peak-detection vs fixed-midpoint contrast */
  primaryTest: {
    peakDetectionMeanContrast: number;
    peakDetectionContrastCI: [number, number];
    fixedMidpointMeanContrast: number;
    fixedMidpointContrastCI: [number, number];
    difference: number;
    differenceCI: [number, number];
    significantlyPositive: boolean;
  };
  /** Positional prediction from semantic distance ratios */
  positionalPrediction: {
    correlationR: number | null;
    correlationP: number | null;
    dataPoints: Array<{
      pairId: string;
      semanticDistanceRatio: number;
      modalPosition: number;
    }>;
  };
  /** Cross-model positional agreement */
  crossModelPositionalAgreement: Array<{
    pairId: string;
    modalPositions: Array<{ modelId: string; position: number }>;
    positionSD: number;
    pairDetermined: boolean; // SD < 1.0
  }>;
  /** Forced-crossing position analysis */
  forcedCrossingPositional: {
    forcedCrossingPositionSD: number;
    nonForcedPositionSD: number;
    forcedLowerVariance: boolean;
  } | null;
}

// ── Phase 7: Early Anchoring & Navigational Mechanics Types ──────

// --- Part A: Early-Anchoring Causal Test ---

// Pre-fill condition type
export type PreFillCondition = "unconstrained" | "incongruent" | "congruent" | "neutral";

// Anchoring pair definition
export interface Phase7AnchoringPair {
  id: string;
  from: string;
  to: string;
  bridge: string;
  unconstrainedModalPosition: string; // e.g. "1-2", "4-5"
  incongruentPreFill: string;
  congruentPreFill: string;
  neutralPreFill: string;
  role: "heading-bridge" | "taxonomic-control" | "forced-crossing-control";
  targetReps: { preFilled: number; unconstrained: number };
  notes?: string;
}

// Analysis output for Part A
export interface AnchoringAnalysisOutput {
  metadata: {
    timestamp: string;
    pairs: string[];
    models: string[];
    conditions: PreFillCondition[];
    totalNewRuns: number;
    totalReusedRuns: number;
  };
  /** Per-pair/model/condition bridge metrics */
  pairModelConditionMetrics: Array<{
    pairId: string;
    modelId: string;
    condition: PreFillCondition;
    bridgeFrequency: number;
    bridgeFrequencyCI: [number, number];
    /** Frequency of bridge at each position (7 positions) */
    perPositionBridgeFreq: number[];
    /** Modal bridge position (0-indexed) */
    modalBridgePosition: number;
    /** Mean bridge position (across runs where bridge appears) */
    meanBridgePosition: number | null;
    runCount: number;
  }>;
  /** Primary test: bridge displacement */
  bridgeDisplacementTest: {
    /** Mean bridge freq at modal position (unconstrained) minus freq at modal+1 (pre-filled) */
    incongruentDisplacement: number;
    incongruentDisplacementCI: [number, number];
    congruentDisplacement: number;
    congruentDisplacementCI: [number, number];
    neutralDisplacement: number;
    neutralDisplacementCI: [number, number];
    /** Incongruent > congruent? (supports directional-heading) */
    incongruentGreaterThanCongruent: boolean;
    /** Incongruent > neutral? (supports directional-heading over mechanical-shift) */
    incongruentGreaterThanNeutral: boolean;
  };
  /** Bridge survival rate per condition */
  bridgeSurvivalRate: Array<{
    condition: PreFillCondition;
    meanSurvivalRate: number;
    survivalRateCI: [number, number];
  }>;
  /** Positional shift analysis */
  positionalShift: {
    /** Mean position shift for bridges that survive pre-fill */
    meanShiftIncongruent: number;
    meanShiftCongruent: number;
    meanShiftNeutral: number;
    /** Whether shift exceeds mechanical +1 */
    exceedsMechanicalShift: boolean;
  };
  /** Animal-poodle control comparison */
  taxonomicControl: {
    taxonomicDisplacement: number;
    headingMeanDisplacement: number;
    taxonomicLowerThanHeading: boolean;
  } | null;
  /** Forced-crossing (loan-shore) robustness */
  forcedCrossingRobustness: {
    bankSurvivalRate: number;
    bankMeanPositionShift: number;
    bankResistsDisplacement: boolean;
  } | null;
  /** Per-model displacement comparison */
  perModelDisplacement: Array<{
    modelId: string;
    incongruentDisplacement: number;
    congruentDisplacement: number;
    neutralDisplacement: number;
  }>;
  /** Predictions evaluation */
  predictions: Array<{
    id: number;
    description: string;
    result: "confirmed" | "not confirmed" | "insufficient data";
    value: string;
  }>;
}

// --- Part B: Curvature Estimation ---

// Triangle definition for curvature estimation
export interface Phase7CurvatureTriangle {
  id: string;
  A: string;
  B: string; // vertex of interest (polysemous or non-polysemous)
  C: string;
  vertexType: "polysemous" | "non-polysemous";
  polysemyType: string | null; // e.g. "homonym" or null
  polysemyLabel?: string | null; // e.g. "financial/geographic"
  relationship?: string; // e.g. "causal-chain", "cross-domain"
  /** Reusable legs from prior phases: maps leg label to prior pair ID */
  reusableLegs: Partial<Record<"AB" | "BC" | "AC", string>>;
  targetReps: number; // per model per leg
  waypointCount: number; // typically 5
  notes?: string;
}

// Curvature analysis output
export interface CurvatureAnalysisOutput {
  metadata: {
    timestamp: string;
    triangles: string[];
    models: string[];
    totalNewRuns: number;
    totalReusedRuns: number;
  };
  /** Distance metric validity checks */
  validityChecks: {
    /** Correlation between Jaccard distance and intuitive semantic distance */
    semanticCorrelation: number | null;
    semanticCorrelationPass: boolean; // r > 0.30
    /** Mean cross-model distance correlation */
    crossModelCorrelation: number | null;
    crossModelCorrelationPass: boolean; // r > 0.50
    /** Overall validity */
    distanceMetricValid: boolean;
  };
  /** Per-triangle/model distance and excess */
  triangleModelMetrics: Array<{
    triangleId: string;
    modelId: string;
    distanceAB: number;
    distanceBC: number;
    distanceAC: number;
    excess: number; // d(A,B) + d(B,C) - d(A,C)
    triangleInequalityHolds: boolean;
    runCountAB: number;
    runCountBC: number;
    runCountAC: number;
  }>;
  /** Primary test: polysemous vs non-polysemous excess */
  primaryTest: {
    polysemousMeanExcess: number;
    polysemousExcessCI: [number, number];
    nonPolysemousMeanExcess: number;
    nonPolysemousExcessCI: [number, number];
    difference: number;
    differenceCI: [number, number];
    significantlyGreater: boolean;
  };
  /** Triangle inequality compliance */
  triangleInequalityCompliance: {
    totalCombinations: number;
    holdingCount: number;
    complianceRate: number;
  };
  /** Per-model curvature profiles */
  perModelProfiles: Array<{
    modelId: string;
    polysemousMeanExcess: number;
    nonPolysemousMeanExcess: number;
    overallMeanExcess: number;
  }>;
  /** Predictions evaluation */
  predictions: Array<{
    id: number;
    description: string;
    result: "confirmed" | "not confirmed" | "insufficient data";
    value: string;
  }>;
}

// --- Part C: Too-Central Boundary ---

// Too-central category
export type TooCentralCategory = "too-central" | "obvious-useful" | "boundary";

// Too-central pair definition
export interface Phase7TooCentralPair {
  id: string;
  from: string;
  to: string;
  candidateBridge: string;
  category: TooCentralCategory;
  expectedFreq: string; // e.g. "< 0.15", "> 0.50", "0.10-0.40"
  /** Random targets for informational redundancy probing */
  randomTargets?: string[];
  targetReps: number;
  notes?: string;
}

// Too-central analysis output
export interface TooCentralAnalysisOutput {
  metadata: {
    timestamp: string;
    pairs: string[];
    models: string[];
    totalNewRuns: number;
    totalReusedRuns: number;
  };
  /** Per-pair/model bridge frequency */
  pairModelBridgeFreqs: Array<{
    pairId: string;
    modelId: string;
    category: TooCentralCategory;
    candidateBridge: string;
    bridgeFrequency: number;
    bridgeFrequencyCI: [number, number];
    runCount: number;
  }>;
  /** Primary test: too-central vs obvious-useful */
  primaryTest: {
    tooCentralMeanFreq: number;
    tooCentralFreqCI: [number, number];
    obviousUsefulMeanFreq: number;
    obviousUsefulFreqCI: [number, number];
    difference: number;
    differenceCI: [number, number];
    significantlyDifferent: boolean;
  };
  /** Boundary case classification */
  boundaryClassification: Array<{
    pairId: string;
    candidateBridge: string;
    meanBridgeFreq: number;
    classification: "too-central" | "obvious-useful" | "intermediate";
  }>;
  /** Navigational entropy comparison */
  entropyComparison: {
    tooCentralMeanEntropy: number;
    obviousUsefulMeanEntropy: number;
    difference: number;
    differenceCI: [number, number];
    tooCentralHigher: boolean;
  };
  /** Informational redundancy test */
  informationalRedundancy: Array<{
    pairId: string;
    candidateBridge: string;
    baselineFreqOnRandomPaths: number;
    baselineFreqCI: [number, number];
    isRedundant: boolean; // freq > 0.10
  }> | null;
  /** Gradient vs causal-chain analysis */
  gradientVsCausalChain: {
    gradientPairsMeanFreq: number;
    causalChainPairsMeanFreq: number;
    gradientHigher: boolean;
  } | null;
  /** Cross-model agreement per pair */
  crossModelAgreement: Array<{
    pairId: string;
    perModelFreq: Array<{ modelId: string; frequency: number }>;
    agreementSD: number;
  }>;
  /** Predictions evaluation */
  predictions: Array<{
    id: number;
    description: string;
    result: "confirmed" | "not confirmed" | "insufficient data";
    value: string;
  }>;
}

// --- Phase 8: Bridge Fragility, Gemini Gradient Blindness, Gait-Normalized Distance ---

// Part A: Bridge Fragility

export type FragilityCompetitorLevel = "low" | "medium" | "high";

export interface Phase8FragilityPair {
  id: string;
  from: string;
  to: string;
  predictedBridge: string;
  predictedCompetitorCount: string; // e.g. "0-1", "3-4", "6-10"
  competitorLevel: FragilityCompetitorLevel;
  preFillConcept: string; // incongruent pre-fill
  targetReps: {
    salience: number;  // unconstrained runs for salience landscape
    preFill: number;   // pre-filled runs for survival measurement
  };
  notes?: string;
}

export interface FragilityAnalysisOutput {
  metadata: {
    timestamp: string;
    pairs: string[];
    models: string[];
    totalNewRuns: number;
    totalReusedRuns: number;
  };
  /** Retrospective analysis (6 pairs from Phase 6A + 7A overlap) */
  retrospective: {
    pairCompetitorCounts: Array<{
      pairId: string;
      bridge: string;
      competitorCount: number;
      competitors: string[];
      preFillSurvival: number;
    }>;
    spearmanRho: number;
    spearmanCI: [number, number];
    significantNegative: boolean;
  };
  /** Prospective analysis (8 new pairs) */
  prospective: {
    pairMetrics: Array<{
      pairId: string;
      predictedBridge: string;
      observedCompetitorCount: number;
      predictedCompetitorCount: string;
      competitorCountAccurate: boolean;
      competitors: string[];
      unconstrainedBridgeFreq: number;
      unconstrainedBridgeFreqCI: [number, number];
      preFillBridgeFreq: number;
      preFillBridgeFreqCI: [number, number];
      bridgeSurvival: number;
      evaluable: boolean; // unconstrained freq >= 0.40
      perModelFreqs: Array<{ modelId: string; unconstrainedFreq: number; preFillFreq: number; survival: number }>;
    }>;
    evaluablePairCount: number;
  };
  /** Combined correlation (14 pairs: 6 retrospective + 8 prospective) */
  combinedCorrelation: {
    spearmanRho: number;
    spearmanCI: [number, number];
    significantNegative: boolean;
    nPairs: number;
  };
  /** Threshold analysis */
  thresholdAnalysis: {
    bestThreshold: number;
    classificationAccuracy: number;
    stepFunctionBetterThanLinear: boolean;
  };
  /** Per-model competitor counts */
  perModelCompetitorCounts: Array<{
    modelId: string;
    meanCompetitorCount: number;
  }>;
  /** Cross-validation */
  crossValidation: {
    meanPredictionError: number;
    leaveOneOutErrors: Array<{ pairId: string; predicted: number; actual: number; error: number }>;
  };
  /** Predictions evaluation */
  predictions: Array<{
    id: number;
    description: string;
    result: "confirmed" | "not confirmed" | "insufficient data";
    value: string;
  }>;
}

// Part B: Gemini Gradient Blindness

export type GradientPairType = "gradient-midpoint" | "causal-chain";

export interface Phase8GradientPair {
  id: string;
  from: string;
  to: string;
  candidateBridge: string;
  pairType: GradientPairType;
  dimension?: string; // for gradient pairs: temperature, vocal intensity, etc.
  process?: string;   // for causal pairs: winemaking, metamorphosis, etc.
  isPhase7CReplication: boolean;
  targetReps: number;
  notes?: string;
}

export interface GradientAnalysisOutput {
  metadata: {
    timestamp: string;
    pairs: string[];
    models: string[];
    totalNewRuns: number;
    totalReusedRuns: number;
  };
  /** Bridge frequency matrix: 20 pairs x 4 models */
  bridgeFreqMatrix: Array<{
    pairId: string;
    pairType: GradientPairType;
    modelId: string;
    bridgeFrequency: number;
    bridgeFrequencyCI: [number, number];
    runCount: number;
    isZero: boolean;
  }>;
  /** Gradient vs causal-chain comparison (replication of O17) */
  gradientVsCausal: {
    gradientMean: number;
    gradientCI: [number, number];
    causalMean: number;
    causalCI: [number, number];
    difference: number;
    differenceCI: [number, number];
    gradientHigher: boolean;
  };
  /** Gemini interaction test (primary test) */
  geminiInteraction: {
    geminiGradientMean: number;
    geminiCausalMean: number;
    geminiGap: number;
    nonGeminiGradientMean: number;
    nonGeminiCausalMean: number;
    nonGeminiGap: number;
    interactionDifference: number; // geminiGap - nonGeminiGap
    interactionCI: [number, number];
    significantInteraction: boolean;
  };
  /** Per-model gradient performance */
  perModelGradient: Array<{
    modelId: string;
    gradientMean: number;
    causalMean: number;
    gap: number;
  }>;
  /** Gemini zero-rate analysis */
  geminiZeroRate: {
    geminiGradientZeros: number;
    geminiGradientTotal: number;
    geminiCausalZeros: number;
    geminiCausalTotal: number;
    nonGeminiGradientZeros: number;
    nonGeminiCausalZeros: number;
  };
  /** Phase 7C replication check */
  phase7CReplication: Array<{
    pairId: string;
    modelId: string;
    phase7CFreq: number | null;
    phase8BFreq: number;
    difference: number | null;
    replicates: boolean | null; // within 0.15
  }>;
  /** Gemini alternative routing for zero-freq pairs */
  geminiAlternativeRouting: Array<{
    pairId: string;
    topWaypoints: Array<{ waypoint: string; frequency: number }>;
    routingType: "related-non-midpoint" | "unrelated" | "mixed";
  }>;
  /** Predictions evaluation */
  predictions: Array<{
    id: number;
    description: string;
    result: "confirmed" | "not confirmed" | "insufficient data";
    value: string;
  }>;
}

// Part C: Gait-Normalized Distance

export type DistancePairRole = "reference" | "test";

export interface Phase8DistancePair {
  id: string;
  from: string;
  to: string;
  role: DistancePairRole;
  expectedDistance: string; // e.g. "short", "medium", "long"
  distanceType: string; // e.g. "tight-continuum", "taxonomic", "cross-domain"
  reusableFrom?: string; // phase/dir to reuse data from
  targetReps: number;
  notes?: string;
}

export interface GaitNormAnalysisOutput {
  metadata: {
    timestamp: string;
    referencePairs: string[];
    testPairs: string[];
    models: string[];
    totalNewRuns: number;
    totalReusedRuns: number;
  };
  /** Raw distance matrix: 16 pairs x 4 models */
  rawDistanceMatrix: Array<{
    pairId: string;
    role: DistancePairRole;
    modelId: string;
    rawDistance: number;
    runCount: number;
  }>;
  /** Baseline per model */
  modelBaselines: Array<{
    modelId: string;
    baseline: number; // mean reference distance
  }>;
  /** Normalized distance matrix: 8 test pairs x 4 models */
  normalizedDistanceMatrix: Array<{
    pairId: string;
    modelId: string;
    normalizedDistance: number;
  }>;
  /** Raw cross-model correlation */
  rawCorrelation: {
    aggregateR: number;
    pairwiseR: Array<{ modelA: string; modelB: string; r: number }>;
  };
  /** Normalized cross-model correlation (primary test) */
  normalizedCorrelation: {
    aggregateR: number;
    aggregateCI: [number, number];
    pairwiseR: Array<{ modelA: string; modelB: string; r: number }>;
    primaryTestPasses: boolean; // r > 0.50 and CI lower > 0.30
  };
  /** Rank-order stability */
  rankOrderStability: {
    rawSpearmanAggregate: number;
    normalizedSpearmanAggregate: number;
    improvementFromNormalization: number;
  };
  /** Residual analysis */
  residualAnalysis: Array<{
    pairId: string;
    maxModelDisagreement: number;
    disagreementModels: [string, string];
  }>;
  /** Conditional curvature re-estimation (only if primary test passes) */
  conditionalCurvature: {
    attempted: boolean;
    normalizedPolysemousExcess: number | null;
    normalizedNonPolysemousExcess: number | null;
    differenceCI: [number, number] | null;
    nullReplicates: boolean | null;
  };
  /** Predictions evaluation */
  predictions: Array<{
    id: number;
    description: string;
    result: "confirmed" | "not confirmed" | "insufficient data";
    value: string;
  }>;
}

// --- Phase 9: Bridge Dominance, Transformation Chains, Pre-Fill Facilitation ---

// Part A: Bridge Dominance Ratio

export interface Phase9DominancePair {
  id: string;
  from: string;
  to: string;
  predictedBridge: string;
  preFillConcept: string;
  /** Source for unconstrained data ("phase8b" | "new") */
  unconstrainedSource: string;
  targetReps: {
    salience: number;   // Gap-filling salience runs (0 if Phase 8B data sufficient)
    preFill: number;    // Pre-fill displacement runs
  };
  notes?: string;
}

// Part B: Transformation-Chain Blindness

export type TransformationPairType = "transformation-chain" | "gradient-midpoint";

export interface Phase9TransformationPair {
  id: string;
  from: string;
  to: string;
  candidateBridge: string;
  pairType: TransformationPairType;
  /** For transformation: process name; for gradient: dimension name */
  processOrDimension: string;
  domain: string;
  targetReps: number;
  notes?: string;
}

// Part C: Pre-Fill Facilitation

export type Phase9PreFillCondition = "unconstrained" | "congruent" | "incongruent" | "neutral";

export interface Phase9FacilitationPair {
  id: string;
  from: string;
  to: string;
  bridge: string;
  unconstrainedFreq: number | null;  // Known from prior data, null for pilot pairs
  dominanceLevel: "dominant" | "moderate" | "moderate-high" | "marginal" | "pilot";
  congruentPreFill: string;
  incongruentPreFill: string;
  neutralPreFill: string;
  /** Which prior phase provides unconstrained data */
  unconstrainedSource: string;
  /** Which conditions need new data collection */
  newConditions: Phase9PreFillCondition[];
  targetReps: number;  // per model per condition
  notes?: string;
}

// Part A: Dominance Analysis Output

export interface DominancePairResult {
  pairId: string;
  bridge: string;
  unconstrainedBridgeFreq: number;
  strongestCompetitor: string;
  strongestCompetitorFreq: number;
  dominanceRatio: number;
  competitorCount: number;
  competitors: string[];
  preFillSurvival: number;
  preFillBridgeFreq: number;
  source: string;  // "retrospective-6a-7a" | "retrospective-8a" | "prospective-9a"
  perModelFreqs: Array<{
    modelId: string;
    unconstrainedFreq: number;
    preFillFreq: number;
    survival: number;
    dominanceRatio: number;
  }>;
}

export interface DominanceAnalysisOutput {
  metadata: {
    timestamp: string;
    retrospectivePairs: string[];
    prospectivePairs: string[];
    models: string[];
    totalNewRuns: number;
    totalReusedRuns: number;
  };
  /** Retrospective analysis (Stage 1) */
  retrospective: {
    pairResults: DominancePairResult[];
    spearmanRho: number;
    spearmanCI: [number, number];
    evaluabilityGatePasses: boolean;  // rho > 0.40
  };
  /** Prospective analysis (Stage 2 new pairs) */
  prospective: {
    pairResults: DominancePairResult[];
    evaluablePairCount: number;
  };
  /** Combined analysis (primary test) */
  combined: {
    allPairResults: DominancePairResult[];
    spearmanRho: number;
    spearmanCI: [number, number];
    significantPositive: boolean;
    nPairs: number;
  };
  /** Threshold analysis */
  thresholdAnalysis: {
    bestThreshold: number;
    classificationAccuracy: number;
    highDominanceSurvivalMean: number;
    lowDominanceSurvivalMean: number;
  };
  /** Dominance ratio vs competitor count comparison */
  dominanceVsCompetitorCount: {
    dominanceRho: number;
    competitorCountRho: number;
    dominanceBetter: boolean;
  };
  /** Per-model dominance ratios */
  perModelDominance: Array<{
    modelId: string;
    meanDominanceRatio: number;
    meanCompetitorCount: number;
  }>;
  /** Predictions evaluation */
  predictions: Array<{
    id: number;
    description: string;
    result: "confirmed" | "not confirmed" | "insufficient data";
    value: string;
  }>;
}

// Part B: Transformation Analysis Output

export interface TransformationAnalysisOutput {
  metadata: {
    timestamp: string;
    transformationPairs: string[];
    gradientPairs: string[];
    models: string[];
    totalNewRuns: number;
    totalReusedRuns: number;
  };
  /** Bridge frequency matrix: 20 pairs x 4 models */
  bridgeFreqMatrix: Array<{
    pairId: string;
    pairType: TransformationPairType;
    modelId: string;
    bridgeFrequency: number;
    bridgeFrequencyCI: [number, number];
    runCount: number;
    isZero: boolean;
  }>;
  /** Gradient vs transformation comparison (O17 third replication) */
  gradientVsTransformation: {
    gradientMean: number;
    gradientCI: [number, number];
    transformationMean: number;
    transformationCI: [number, number];
    difference: number;
    differenceCI: [number, number];
    gradientHigher: boolean;
  };
  /** Gemini interaction test (primary test) */
  geminiInteraction: {
    geminiGradientMean: number;
    geminiTransformationMean: number;
    geminiGap: number;
    nonGeminiGradientMean: number;
    nonGeminiTransformationMean: number;
    nonGeminiGap: number;
    interactionDifference: number;
    interactionCI: [number, number];
    significantInteraction: boolean;
  };
  /** Gemini zero-rate analysis */
  geminiZeroRate: {
    geminiTransformationZeros: number;
    geminiTransformationTotal: number;
    geminiGradientZeros: number;
    geminiGradientTotal: number;
    nonGeminiTransformationZeros: number;
    nonGeminiGradientZeros: number;
  };
  /** Transformation-type analysis (biological vs manufacturing vs food vs leatherworking) */
  transformationTypeAnalysis: Array<{
    processType: string;
    pairs: string[];
    geminiMeanFreq: number;
    geminiZeroCount: number;
    nonGeminiMeanFreq: number;
  }>;
  /** Meta-analytic combination with Phase 8B */
  metaAnalytic: {
    phase9BInteraction: number;
    phase9BCI: [number, number];
    phase8BInteraction: number;
    phase8BCI: [number, number];
    pooledInteraction: number;
    pooledCI: [number, number];
    pooledSignificant: boolean;
  };
  /** Per-model gradient performance */
  perModelGradient: Array<{
    modelId: string;
    gradientMean: number;
    transformationMean: number;
    gap: number;
  }>;
  /** Non-Gemini zero analysis */
  nonGeminiZeroAnalysis: Array<{
    modelId: string;
    transformationZeros: number;
    gradientZeros: number;
  }>;
  /** Gemini alternative routing for zero-freq transformation pairs */
  geminiAlternativeRouting: Array<{
    pairId: string;
    topWaypoints: Array<{ waypoint: string; frequency: number }>;
    routingType: "endpoint-jump" | "process-label" | "mixed";
  }>;
  /** Predictions evaluation */
  predictions: Array<{
    id: number;
    description: string;
    result: "confirmed" | "not confirmed" | "insufficient data";
    value: string;
  }>;
}

// Part C: Facilitation Analysis Output

export interface FacilitationPairResult {
  pairId: string;
  bridge: string;
  unconstrainedFreq: number;
  dominanceLevel: string;
  perCondition: Array<{
    condition: Phase9PreFillCondition;
    bridgeFreq: number;
    bridgeFreqCI: [number, number];
    survivalRate: number;  // preFillFreq / unconstrainedFreq
  }>;
  perModel: Array<{
    modelId: string;
    unconstrainedFreq: number;
    congruentSurvival: number | null;
    incongruentSurvival: number | null;
    neutralSurvival: number | null;
  }>;
}

export interface FacilitationAnalysisOutput {
  metadata: {
    timestamp: string;
    pairs: string[];
    models: string[];
    conditions: Phase9PreFillCondition[];
    totalNewRuns: number;
    totalReusedRuns: number;
  };
  /** Per-pair facilitation results */
  pairResults: FacilitationPairResult[];
  /** Primary test: crossover regression */
  crossoverRegression: {
    slope: number;
    slopeCI: [number, number];
    intercept: number;
    r2: number;
    significantNegativeSlope: boolean;
  };
  /** Crossover point estimation */
  crossoverPoint: {
    unconstrainedFreqAtUnity: number;
    crossoverCI: [number, number];
  };
  /** Congruent vs incongruent for marginal bridges */
  congruentVsIncongruent: {
    marginalCongruentMeanSurvival: number;
    marginalIncongruentMeanSurvival: number;
    difference: number;
    differenceCI: [number, number];
    significantlyHigher: boolean;
  };
  /** Neutral pre-fill baseline */
  neutralBaseline: {
    dominantNeutralSurvival: number;
    marginalNeutralSurvival: number;
  };
  /** Phase 7A comparison (pairs 1-8) */
  phase7AComparison: Array<{
    pairId: string;
    phase7ASurvival: number;
    phase9CSurvival: number;
    difference: number;
    replicates: boolean;  // within 0.15
  }>;
  /** Per-model facilitation */
  perModelFacilitation: Array<{
    modelId: string;
    marginalFacilitationCount: number;  // how many marginal pairs show survival > 1.0
    dominantDisplacementCount: number;  // how many dominant pairs show survival < 1.0
  }>;
  /** Pilot pair verification */
  pilotVerification: Array<{
    pairId: string;
    unconstrainedBridgeFreq: number;
    inRange: boolean;  // 0.20-0.50
    retained: boolean;
  }>;
  /** Predictions evaluation */
  predictions: Array<{
    id: number;
    description: string;
    result: "confirmed" | "not confirmed" | "insufficient data";
    value: string;
  }>;
}
