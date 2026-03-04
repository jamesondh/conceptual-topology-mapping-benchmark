/**
 * Phase 5 triple and pair definitions for Cue-Strength, Dimensionality,
 * and Convergence experiments.
 *
 * Part A: Cue-strength threshold experiment (14 triples across 4 controlled
 *         families + 2 random controls). Tests whether bridge frequency
 *         follows a logistic curve as a function of cue strength.
 *
 * Part B: Dimensionality probing (14 triples across 3 focal concepts + 2
 *         controls). Tests whether polysemous focal concepts yield different
 *         bridge frequencies when A and C lie on the same vs. different
 *         semantic axes.
 *
 * Part C: Triple-anchor convergence (8 pairs with forward + reverse
 *         7-waypoint paths). Tests for W-shaped positional convergence
 *         profiles when a bridge concept exists.
 */

import type {
  CueStrengthLevel,
  AxisPattern,
  ConvergencePairType,
  Phase5CueStrengthTriple,
  Phase5DimensionalityTriple,
  Phase5ConvergencePair,
} from "./types.ts";

// ── Part A: Cue-Strength Triples ──────────────────────────────────────

export const PHASE5A_TRIPLES: Phase5CueStrengthTriple[] = [
  // ── Family 1: Physical Causation (A=sun, C=desert) ──────────────────

  // 1. sun → heat → desert (very-high cue)
  {
    id: "p5a-sun-heat-desert",
    A: "sun",
    B: "heat",
    C: "desert",
    family: "physical-causation",
    cueLevel: "very-high",
    cueLevelNumeric: 4,
    diagnosticType: "cue-strength",
    bridgeConcept: "heat",
    notes: "Causal mechanism — heat is the direct physical link between sun and desert.",
    targetReps: { AC: 20, AB: 10, BC: 10 },
    predictedBridgeFreq: {
      claude: [0.80, 1.0],
      gpt: [0.80, 1.0],
      grok: [0.80, 1.0],
      gemini: [0.80, 1.0],
    },
  },

  // 2. sun → radiation → desert (medium cue)
  {
    id: "p5a-sun-radiation-desert",
    A: "sun",
    B: "radiation",
    C: "desert",
    family: "physical-causation",
    cueLevel: "medium",
    cueLevelNumeric: 2,
    diagnosticType: "cue-strength",
    bridgeConcept: "radiation",
    notes: "Scientific mechanism — radiation is accurate but less salient than heat.",
    targetReps: { AC: 20, AB: 10, BC: 10 },
    predictedBridgeFreq: {
      claude: [0.30, 0.80],
      gpt: [0.30, 0.80],
      grok: [0.30, 0.80],
      gemini: [0.00, 0.20],
    },
  },

  // 3. sun → solstice → desert (low cue)
  {
    id: "p5a-sun-solstice-desert",
    A: "sun",
    B: "solstice",
    C: "desert",
    family: "physical-causation",
    cueLevel: "low",
    cueLevelNumeric: 1,
    diagnosticType: "cue-strength",
    bridgeConcept: "solstice",
    notes: "Temporal association — solstice relates to sun but not causally to desert.",
    targetReps: { AC: 20, AB: 10, BC: 10 },
    predictedBridgeFreq: {
      claude: [0.00, 0.30],
      gpt: [0.00, 0.30],
      grok: [0.00, 0.30],
      gemini: [0.00, 0.30],
    },
  },

  // ── Family 2: Biological Growth (A=seed, C=garden) ──────────────────

  // 4. seed → plant → garden (very-high cue)
  {
    id: "p5a-seed-plant-garden",
    A: "seed",
    B: "plant",
    C: "garden",
    family: "biological-growth",
    cueLevel: "very-high",
    cueLevelNumeric: 4,
    diagnosticType: "cue-strength",
    bridgeConcept: "plant",
    targetReps: { AC: 20, AB: 10, BC: 10 },
    predictedBridgeFreq: {
      claude: [0.80, 1.0],
      gpt: [0.80, 1.0],
      grok: [0.80, 1.0],
      gemini: [0.80, 1.0],
    },
  },

  // 5. seed → germination → garden (medium cue)
  {
    id: "p5a-seed-germination-garden",
    A: "seed",
    B: "germination",
    C: "garden",
    family: "biological-growth",
    cueLevel: "medium",
    cueLevelNumeric: 2,
    diagnosticType: "cue-strength",
    bridgeConcept: "germination",
    targetReps: { AC: 20, AB: 10, BC: 10 },
    predictedBridgeFreq: {
      claude: [0.30, 0.80],
      gpt: [0.30, 0.80],
      grok: [0.30, 0.80],
      gemini: [0.00, 0.20],
    },
  },

  // 6. seed → husk → garden (low cue)
  {
    id: "p5a-seed-husk-garden",
    A: "seed",
    B: "husk",
    C: "garden",
    family: "biological-growth",
    cueLevel: "low",
    cueLevelNumeric: 1,
    diagnosticType: "cue-strength",
    bridgeConcept: "husk",
    targetReps: { AC: 20, AB: 10, BC: 10 },
    predictedBridgeFreq: {
      claude: [0.00, 0.30],
      gpt: [0.00, 0.30],
      grok: [0.00, 0.30],
      gemini: [0.00, 0.30],
    },
  },

  // ── Family 3: Compositional Hierarchy (A=word, C=paragraph) ─────────

  // 7. word → sentence → paragraph (very-high cue)
  {
    id: "p5a-word-sentence-paragraph",
    A: "word",
    B: "sentence",
    C: "paragraph",
    family: "compositional-hierarchy",
    cueLevel: "very-high",
    cueLevelNumeric: 4,
    diagnosticType: "cue-strength",
    bridgeConcept: "sentence",
    targetReps: { AC: 20, AB: 10, BC: 10 },
    predictedBridgeFreq: {
      claude: [0.80, 1.0],
      gpt: [0.80, 1.0],
      grok: [0.80, 1.0],
      gemini: [0.80, 1.0],
    },
  },

  // 8. word → clause → paragraph (medium cue)
  {
    id: "p5a-word-clause-paragraph",
    A: "word",
    B: "clause",
    C: "paragraph",
    family: "compositional-hierarchy",
    cueLevel: "medium",
    cueLevelNumeric: 2,
    diagnosticType: "cue-strength",
    bridgeConcept: "clause",
    targetReps: { AC: 20, AB: 10, BC: 10 },
    predictedBridgeFreq: {
      claude: [0.30, 0.80],
      gpt: [0.30, 0.80],
      grok: [0.30, 0.80],
      gemini: [0.00, 0.20],
    },
  },

  // 9. word → syllable → paragraph (low cue)
  {
    id: "p5a-word-syllable-paragraph",
    A: "word",
    B: "syllable",
    C: "paragraph",
    family: "compositional-hierarchy",
    cueLevel: "low",
    cueLevelNumeric: 1,
    diagnosticType: "cue-strength",
    bridgeConcept: "syllable",
    targetReps: { AC: 20, AB: 10, BC: 10 },
    predictedBridgeFreq: {
      claude: [0.00, 0.30],
      gpt: [0.00, 0.30],
      grok: [0.00, 0.30],
      gemini: [0.00, 0.30],
    },
  },

  // ── Family 4: Abstract Affect (A=emotion, C=melancholy) ─────────────

  // 10. emotion → sadness → melancholy (high cue)
  {
    id: "p5a-emotion-sadness-melancholy",
    A: "emotion",
    B: "sadness",
    C: "melancholy",
    family: "abstract-affect",
    cueLevel: "high",
    cueLevelNumeric: 3,
    diagnosticType: "cue-strength",
    bridgeConcept: "sadness",
    targetReps: { AC: 20, AB: 10, BC: 10 },
    predictedBridgeFreq: {
      claude: [0.70, 1.0],
      gpt: [0.70, 1.0],
      grok: [0.70, 1.0],
      gemini: [0.40, 1.0],
    },
  },

  // 11. emotion → nostalgia → melancholy (medium cue — retest from Phase 4)
  {
    id: "p5a-emotion-nostalgia-melancholy",
    A: "emotion",
    B: "nostalgia",
    C: "melancholy",
    family: "abstract-affect",
    cueLevel: "medium",
    cueLevelNumeric: 2,
    diagnosticType: "cue-strength",
    bridgeConcept: "nostalgia",
    notes: "Retest from Phase 4. Has reusable data from Phase 1 (AB) and Phase 3B (BC, AC).",
    targetReps: { AC: 20, AB: 10, BC: 10 },
    reusableLegsWithSource: {
      AB: { pairId: "hierarchy-emotion-nostalgia", phase: "phase1", expectedReps: 10 },
      BC: { pairId: "triple-emotion-nostalgia-melancholy--BC", phase: "phase3b", expectedReps: 10 },
      AC: { pairId: "triple-emotion-nostalgia-melancholy--AC", phase: "phase3b", expectedReps: 10 },
    },
    predictedBridgeFreq: {
      claude: [0.30, 0.80],
      gpt: [0.30, 0.80],
      grok: [0.30, 0.80],
      gemini: [0.00, 0.20],
    },
  },

  // 12. emotion → apathy → melancholy (low cue)
  {
    id: "p5a-emotion-apathy-melancholy",
    A: "emotion",
    B: "apathy",
    C: "melancholy",
    family: "abstract-affect",
    cueLevel: "low",
    cueLevelNumeric: 1,
    diagnosticType: "cue-strength",
    bridgeConcept: "apathy",
    targetReps: { AC: 20, AB: 10, BC: 10 },
    predictedBridgeFreq: {
      claude: [0.00, 0.30],
      gpt: [0.00, 0.30],
      grok: [0.00, 0.30],
      gemini: [0.00, 0.30],
    },
  },

  // ── Controls ────────────────────────────────────────────────────────

  // 13. sun → umbrella → desert (random control)
  {
    id: "p5a-sun-umbrella-desert",
    A: "sun",
    B: "umbrella",
    C: "desert",
    family: "physical-causation",
    cueLevel: "low",
    cueLevelNumeric: 0,
    diagnosticType: "random-control",
    bridgeConcept: "umbrella",
    notes: "Random control — umbrella is tangentially related to sun but not a natural bridge to desert.",
    targetReps: { AC: 10, AB: 10, BC: 10 },
    predictedBridgeFreq: {
      claude: [0.00, 0.05],
      gpt: [0.00, 0.05],
      grok: [0.00, 0.05],
      gemini: [0.00, 0.05],
    },
  },

  // 14. seed → telescope → garden (random control)
  {
    id: "p5a-seed-telescope-garden",
    A: "seed",
    B: "telescope",
    C: "garden",
    family: "biological-growth",
    cueLevel: "low",
    cueLevelNumeric: 0,
    diagnosticType: "random-control",
    bridgeConcept: "telescope",
    notes: "Random control — telescope is semantically unrelated to both seed and garden.",
    targetReps: { AC: 10, AB: 10, BC: 10 },
    predictedBridgeFreq: {
      claude: [0.00, 0.05],
      gpt: [0.00, 0.05],
      grok: [0.00, 0.05],
      gemini: [0.00, 0.05],
    },
  },
];

// ── Part B: Dimensionality Triples ────────────────────────────────────

export const PHASE5B_TRIPLES: Phase5DimensionalityTriple[] = [
  // ── "Light" (polysemous focal concept) ──────────────────────────────

  // 1. photon → light → color (same-axis: physics→physics)
  {
    id: "p5b-photon-light-color",
    A: "photon",
    B: "light",
    C: "color",
    focalConcept: "light",
    axisA: "physics",
    axisC: "physics",
    axisPattern: "same-axis",
    diagnosticType: "dimensionality",
    bridgeConcept: "light",
    targetReps: { AC: 20 },
    predictedBridgeFreq: {
      claude: [0.60, 1.0],
      gpt: [0.60, 1.0],
      grok: [0.60, 1.0],
      gemini: [0.60, 1.0],
    },
  },

  // 2. feather → light → heavy (same-axis: weight→weight)
  {
    id: "p5b-feather-light-heavy",
    A: "feather",
    B: "light",
    C: "heavy",
    focalConcept: "light",
    axisA: "weight",
    axisC: "weight",
    axisPattern: "same-axis",
    diagnosticType: "dimensionality",
    bridgeConcept: "light",
    targetReps: { AC: 20 },
    predictedBridgeFreq: {
      claude: [0.60, 1.0],
      gpt: [0.60, 1.0],
      grok: [0.60, 1.0],
      gemini: [0.60, 1.0],
    },
  },

  // 3. candle → light → darkness (same-axis: illumination→illumination)
  {
    id: "p5b-candle-light-darkness",
    A: "candle",
    B: "light",
    C: "darkness",
    focalConcept: "light",
    axisA: "illumination",
    axisC: "illumination",
    axisPattern: "same-axis",
    diagnosticType: "dimensionality",
    bridgeConcept: "light",
    targetReps: { AC: 20 },
    predictedBridgeFreq: {
      claude: [0.60, 1.0],
      gpt: [0.60, 1.0],
      grok: [0.60, 1.0],
      gemini: [0.60, 1.0],
    },
  },

  // 4. photon → light → heavy (cross-axis: physics→weight)
  {
    id: "p5b-photon-light-heavy",
    A: "photon",
    B: "light",
    C: "heavy",
    focalConcept: "light",
    axisA: "physics",
    axisC: "weight",
    axisPattern: "cross-axis",
    diagnosticType: "dimensionality",
    bridgeConcept: "light",
    targetReps: { AC: 20 },
    predictedBridgeFreq: {
      claude: [0.00, 0.20],
      gpt: [0.00, 0.20],
      grok: [0.00, 0.20],
      gemini: [0.00, 0.10],
    },
  },

  // 5. candle → light → color (partial-overlap: illumination→physics)
  {
    id: "p5b-candle-light-color",
    A: "candle",
    B: "light",
    C: "color",
    focalConcept: "light",
    axisA: "illumination",
    axisC: "physics",
    axisPattern: "partial-overlap",
    diagnosticType: "dimensionality",
    bridgeConcept: "light",
    targetReps: { AC: 20 },
    predictedBridgeFreq: {
      claude: [0.20, 0.60],
      gpt: [0.20, 0.60],
      grok: [0.20, 0.60],
      gemini: [0.20, 0.60],
    },
  },

  // 6. prayer → light → darkness (cross-axis: spirituality→illumination)
  {
    id: "p5b-prayer-light-darkness",
    A: "prayer",
    B: "light",
    C: "darkness",
    focalConcept: "light",
    axisA: "spirituality",
    axisC: "illumination",
    axisPattern: "cross-axis",
    diagnosticType: "dimensionality",
    bridgeConcept: "light",
    targetReps: { AC: 20 },
    predictedBridgeFreq: {
      claude: [0.00, 0.20],
      gpt: [0.00, 0.20],
      grok: [0.00, 0.20],
      gemini: [0.00, 0.10],
    },
  },

  // ── "Bank" (polysemous focal concept) ───────────────────────────────

  // 7. loan → bank → savings (same-axis: financial→financial)
  {
    id: "p5b-loan-bank-savings",
    A: "loan",
    B: "bank",
    C: "savings",
    focalConcept: "bank",
    axisA: "financial",
    axisC: "financial",
    axisPattern: "same-axis",
    diagnosticType: "dimensionality",
    bridgeConcept: "bank",
    targetReps: { AC: 20 },
    predictedBridgeFreq: {
      claude: [0.60, 1.0],
      gpt: [0.60, 1.0],
      grok: [0.60, 1.0],
      gemini: [0.60, 1.0],
    },
  },

  // 8. river → bank → shore (same-axis: geographic→geographic)
  {
    id: "p5b-river-bank-shore",
    A: "river",
    B: "bank",
    C: "shore",
    focalConcept: "bank",
    axisA: "geographic",
    axisC: "geographic",
    axisPattern: "same-axis",
    diagnosticType: "dimensionality",
    bridgeConcept: "bank",
    targetReps: { AC: 20 },
    predictedBridgeFreq: {
      claude: [0.60, 1.0],
      gpt: [0.60, 1.0],
      grok: [0.60, 1.0],
      gemini: [0.60, 1.0],
    },
  },

  // 9. loan → bank → shore (cross-axis: financial→geographic)
  {
    id: "p5b-loan-bank-shore",
    A: "loan",
    B: "bank",
    C: "shore",
    focalConcept: "bank",
    axisA: "financial",
    axisC: "geographic",
    axisPattern: "cross-axis",
    diagnosticType: "dimensionality",
    bridgeConcept: "bank",
    targetReps: { AC: 20 },
    predictedBridgeFreq: {
      claude: [0.00, 0.20],
      gpt: [0.00, 0.20],
      grok: [0.00, 0.20],
      gemini: [0.00, 0.10],
    },
  },

  // ── "Fire" (non-polysemous control) ─────────────────────────────────

  // 10. spark → fire → ash (same-axis: combustion→combustion)
  {
    id: "p5b-spark-fire-ash",
    A: "spark",
    B: "fire",
    C: "ash",
    focalConcept: "fire",
    axisA: "combustion",
    axisC: "combustion",
    axisPattern: "same-axis",
    diagnosticType: "dimensionality",
    bridgeConcept: "fire",
    targetReps: { AC: 20 },
    predictedBridgeFreq: {
      claude: [0.60, 1.0],
      gpt: [0.60, 1.0],
      grok: [0.60, 1.0],
      gemini: [0.60, 1.0],
    },
  },

  // 11. ambition → fire → motivation (same-axis: passion→passion)
  {
    id: "p5b-ambition-fire-motivation",
    A: "ambition",
    B: "fire",
    C: "motivation",
    focalConcept: "fire",
    axisA: "passion",
    axisC: "passion",
    axisPattern: "same-axis",
    diagnosticType: "dimensionality",
    bridgeConcept: "fire",
    targetReps: { AC: 20 },
    predictedBridgeFreq: {
      claude: [0.60, 1.0],
      gpt: [0.60, 1.0],
      grok: [0.60, 1.0],
      gemini: [0.60, 1.0],
    },
  },

  // 12. spark → fire → motivation (cross-axis: combustion→passion)
  {
    id: "p5b-spark-fire-motivation",
    A: "spark",
    B: "fire",
    C: "motivation",
    focalConcept: "fire",
    axisA: "combustion",
    axisC: "passion",
    axisPattern: "cross-axis",
    diagnosticType: "dimensionality",
    bridgeConcept: "fire",
    targetReps: { AC: 20 },
    predictedBridgeFreq: {
      claude: [0.00, 0.20],
      gpt: [0.00, 0.20],
      grok: [0.00, 0.20],
      gemini: [0.00, 0.10],
    },
  },

  // ── Controls ────────────────────────────────────────────────────────

  // 13. photon → bicycle → color (random control)
  {
    id: "p5b-photon-bicycle-color",
    A: "photon",
    B: "bicycle",
    C: "color",
    focalConcept: "none",
    axisA: "none",
    axisC: "none",
    axisPattern: "cross-axis",
    diagnosticType: "random-control",
    bridgeConcept: "bicycle",
    targetReps: { AC: 10 },
    predictedBridgeFreq: {
      claude: [0.00, 0.05],
      gpt: [0.00, 0.05],
      grok: [0.00, 0.05],
      gemini: [0.00, 0.05],
    },
  },

  // 14. loan → penguin → savings (random control)
  {
    id: "p5b-loan-penguin-savings",
    A: "loan",
    B: "penguin",
    C: "savings",
    focalConcept: "none",
    axisA: "none",
    axisC: "none",
    axisPattern: "cross-axis",
    diagnosticType: "random-control",
    bridgeConcept: "penguin",
    targetReps: { AC: 10 },
    predictedBridgeFreq: {
      claude: [0.00, 0.05],
      gpt: [0.00, 0.05],
      grok: [0.00, 0.05],
      gemini: [0.00, 0.05],
    },
  },
];

// ── Part C: Convergence Pairs ─────────────────────────────────────────

export const PHASE5C_PAIRS: Phase5ConvergencePair[] = [
  // 1. light → color (bridge-present: spectrum)
  {
    id: "p5c-light-color",
    from: "light",
    to: "color",
    pairType: "bridge-present",
    expectedBridge: "spectrum",
    bridgeModels: ["claude", "gpt", "grok", "gemini"],
    targetReps: 10,
  },

  // 2. bank → savings (bridge-present: deposit)
  {
    id: "p5c-bank-savings",
    from: "bank",
    to: "savings",
    pairType: "bridge-present",
    expectedBridge: "deposit",
    bridgeModels: ["claude", "gpt", "grok", "gemini"],
    targetReps: 10,
  },

  // 3. animal → poodle (bridge-present: dog)
  {
    id: "p5c-animal-poodle",
    from: "animal",
    to: "poodle",
    pairType: "bridge-present",
    expectedBridge: "dog",
    bridgeModels: ["claude", "gpt", "grok", "gemini"],
    targetReps: 10,
  },

  // 4. tree → ecosystem (bridge-present: forest — not gemini)
  {
    id: "p5c-tree-ecosystem",
    from: "tree",
    to: "ecosystem",
    pairType: "bridge-present",
    expectedBridge: "forest",
    bridgeModels: ["claude", "gpt", "grok"],
    notes: "Gemini not expected to produce 'forest' bridge based on Phase 4 findings.",
    targetReps: 10,
  },

  // 5. language → thought (bridge-absent)
  {
    id: "p5c-language-thought",
    from: "language",
    to: "thought",
    pairType: "bridge-absent",
    targetReps: 10,
  },

  // 6. hot → cold (bridge-absent)
  {
    id: "p5c-hot-cold",
    from: "hot",
    to: "cold",
    pairType: "bridge-absent",
    targetReps: 10,
  },

  // 7. music → mathematics (bridge-variable: harmony — claude and grok only)
  {
    id: "p5c-music-mathematics",
    from: "music",
    to: "mathematics",
    pairType: "bridge-variable",
    expectedBridge: "harmony",
    bridgeModels: ["claude", "grok"],
    targetReps: 10,
  },

  // 8. telescope → jealousy (no-bridge-control)
  {
    id: "p5c-telescope-jealousy",
    from: "telescope",
    to: "jealousy",
    pairType: "no-bridge-control",
    targetReps: 10,
  },
];

// ── Helper Functions ──────────────────────────────────────────────────

/**
 * Get all Part A triples belonging to a given family.
 */
export function getPhase5ATriplesByFamily(
  family: string,
): Phase5CueStrengthTriple[] {
  return PHASE5A_TRIPLES.filter((t) => t.family === family);
}

/**
 * Get all Part A triples at a given cue-strength level.
 */
export function getPhase5ATriplesByCueLevel(
  level: CueStrengthLevel,
): Phase5CueStrengthTriple[] {
  return PHASE5A_TRIPLES.filter((t) => t.cueLevel === level);
}

/**
 * Get all Part B triples for a given focal concept.
 */
export function getPhase5BTriplesByFocalConcept(
  focal: string,
): Phase5DimensionalityTriple[] {
  return PHASE5B_TRIPLES.filter((t) => t.focalConcept === focal);
}

/**
 * Get all Part B triples matching a given axis pattern.
 */
export function getPhase5BTriplesByAxisPattern(
  pattern: AxisPattern,
): Phase5DimensionalityTriple[] {
  return PHASE5B_TRIPLES.filter((t) => t.axisPattern === pattern);
}

/**
 * Get all Part C pairs of a given convergence pair type.
 */
export function getPhase5CPairsByType(
  type: ConvergencePairType,
): Phase5ConvergencePair[] {
  return PHASE5C_PAIRS.filter((p) => p.pairType === type);
}
