/**
 * Phase 6 pair definitions for Navigational Salience Mapping,
 * Forced-Crossing Asymmetry, and Positional Bridge Scanning experiments.
 */

import type {
  Phase6SaliencePair,
  Phase6ForcedCrossingPair,
  Phase6PositionalPair,
} from "../types.ts";

// ── Part A: Salience Mapping Pairs ────────────────────────────────────

export const PHASE6A_PAIRS: Phase6SaliencePair[] = [
  {
    id: "p6a-music-mathematics",
    from: "music",
    to: "mathematics",
    knownBridge: "harmony",
    bridgeFreqRange: "0.00-1.00",
    rationale: "Model-variable bridge; strongest W-shape signal",
    targetReps: 40,
    category: "bridge-present",
  },
  {
    id: "p6a-sun-desert",
    from: "sun",
    to: "desert",
    knownBridge: "heat",
    bridgeFreqRange: "0.90-1.00",
    rationale: "Universal bridge; tight causal chain",
    targetReps: 40,
    category: "bridge-present",
  },
  {
    id: "p6a-seed-garden",
    from: "seed",
    to: "garden",
    knownBridge: "germination",
    bridgeFreqRange: "0.15-1.00",
    rationale: "Process-naming bridge; plant surprise",
    targetReps: 40,
    category: "bridge-present",
  },
  {
    id: "p6a-light-color",
    from: "light",
    to: "color",
    knownBridge: "spectrum",
    bridgeFreqRange: "1.00",
    rationale: "Universal bridge; strongest cross-phase signal",
    targetReps: 40,
    category: "bridge-present",
  },
  {
    id: "p6a-bank-ocean",
    from: "bank",
    to: "ocean",
    knownBridge: "river",
    bridgeFreqRange: "0.00-1.00",
    rationale: "Polysemy-mediated; Gemini fails",
    targetReps: 40,
    category: "bridge-present",
  },
  {
    id: "p6a-emotion-melancholy",
    from: "emotion",
    to: "melancholy",
    knownBridge: "sadness",
    bridgeFreqRange: "0.00-0.80",
    rationale: "Abstract affective; model-variable",
    targetReps: 40,
    category: "bridge-present",
  },
  {
    id: "p6a-language-thought",
    from: "language",
    to: "thought",
    knownBridge: null,
    bridgeFreqRange: "0.00",
    rationale: "Bridge-absent control; off-axis failure",
    targetReps: 30,
    category: "bridge-absent",
  },
  {
    id: "p6a-hot-cold",
    from: "hot",
    to: "cold",
    knownBridge: null,
    bridgeFreqRange: "0.00",
    rationale: "Bridge-absent control; off-axis failure",
    targetReps: 30,
    category: "bridge-absent",
  },
];

// ── Part B: Forced-Crossing Asymmetry Pairs ───────────────────────────

export const PHASE6B_PAIRS: Phase6ForcedCrossingPair[] = [
  // Forced-crossing pairs
  {
    id: "p6b-loan-shore",
    from: "loan",
    to: "shore",
    bridge: "bank",
    pairType: "forced-crossing",
    status: "validated",
    bridgeFreq: "0.95-1.00",
    notes: "Validated in Phase 5B. Non-Gemini bridge freq 0.95-1.00.",
    targetReps: 10,
  },
  {
    id: "p6b-deposit-river",
    from: "deposit",
    to: "river",
    bridge: "bank",
    pairType: "forced-crossing",
    status: "exploratory",
    bridgeFreq: "predicted high",
    notes: "New forced-crossing pair extending loan-bank-shore finding.",
    targetReps: 10,
  },
  {
    id: "p6b-savings-cliff",
    from: "savings",
    to: "cliff",
    bridge: "bank",
    pairType: "forced-crossing",
    status: "exploratory",
    bridgeFreq: "predicted high",
    notes: "New forced-crossing pair: financial savings → cliff (via riverbank).",
    targetReps: 10,
  },
  {
    id: "p6b-photon-heavy",
    from: "photon",
    to: "heavy",
    bridge: "light",
    pairType: "forced-crossing",
    status: "validated",
    bridgeFreq: "0.00-1.00",
    notes: "Variable bridge freq in 5B: Claude 1.00, GPT/Grok 0.35, Gemini 0.00. Within-design control.",
    targetReps: 10,
  },
  // Same-axis comparison pairs
  {
    id: "p6b-loan-savings",
    from: "loan",
    to: "savings",
    bridge: null,
    pairType: "same-axis",
    status: "comparison",
    bridgeFreq: "N/A",
    notes: "Financial domain same-axis pair.",
    targetReps: 10,
  },
  {
    id: "p6b-river-shore",
    from: "river",
    to: "shore",
    bridge: null,
    pairType: "same-axis",
    status: "comparison",
    bridgeFreq: "N/A",
    notes: "Geographic domain same-axis pair.",
    targetReps: 10,
  },
  {
    id: "p6b-sun-desert",
    from: "sun",
    to: "desert",
    bridge: null,
    pairType: "same-axis",
    status: "comparison",
    bridgeFreq: "N/A",
    notes: "Physical-causal domain same-axis pair.",
    targetReps: 10,
  },
  {
    id: "p6b-seed-garden",
    from: "seed",
    to: "garden",
    bridge: null,
    pairType: "same-axis",
    status: "comparison",
    bridgeFreq: "N/A",
    notes: "Biological domain same-axis pair.",
    targetReps: 10,
  },
];

// ── Part C: Positional Bridge Scanning Pairs ──────────────────────────

export const PHASE6C_PAIRS: Phase6PositionalPair[] = [
  // Primary pairs (reuse Phase 5C data)
  {
    id: "p6c-light-color",
    from: "light",
    to: "color",
    knownBridge: "spectrum",
    expectedPosition: "middle (3-5)",
    source: "reuse-5c",
    targetReps: 0,
  },
  {
    id: "p6c-bank-savings",
    from: "bank",
    to: "savings",
    knownBridge: "deposit",
    expectedPosition: "middle (3-5)",
    source: "reuse-5c",
    targetReps: 0,
  },
  {
    id: "p6c-animal-poodle",
    from: "animal",
    to: "poodle",
    knownBridge: "dog",
    expectedPosition: "middle (3-5)",
    source: "reuse-5c",
    targetReps: 0,
  },
  {
    id: "p6c-music-mathematics",
    from: "music",
    to: "mathematics",
    knownBridge: "harmony",
    expectedPosition: "middle (3-5)",
    source: "reuse-5c",
    targetReps: 0,
  },
  {
    id: "p6c-tree-ecosystem",
    from: "tree",
    to: "ecosystem",
    knownBridge: "forest",
    expectedPosition: "middle (3-5)",
    source: "reuse-5c",
    targetReps: 0,
  },
  // Forced-crossing bridges (new data from Part B)
  {
    id: "p6c-loan-shore",
    from: "loan",
    to: "shore",
    knownBridge: "bank",
    expectedPosition: "middle (3-5)",
    source: "forced-crossing",
    targetReps: 10,
  },
  {
    id: "p6c-deposit-river",
    from: "deposit",
    to: "river",
    knownBridge: "bank",
    expectedPosition: "middle (3-5)",
    source: "forced-crossing",
    targetReps: 10,
  },
  // Position-contrast pairs
  {
    id: "p6c-sun-desert",
    from: "sun",
    to: "desert",
    knownBridge: "heat",
    expectedPosition: "early (2-3)",
    source: "position-contrast",
    targetReps: 10,
  },
  {
    id: "p6c-seed-garden",
    from: "seed",
    to: "garden",
    knownBridge: "germination",
    expectedPosition: "middle (3-5)",
    source: "position-contrast",
    targetReps: 10,
  },
  {
    id: "p6c-emotion-melancholy",
    from: "emotion",
    to: "melancholy",
    knownBridge: "sadness",
    expectedPosition: "late (4-6)",
    source: "position-contrast",
    targetReps: 10,
  },
];

// ── Phase 5C pair ID mapping (for reuse) ──────────────────────────────

/**
 * Maps Phase 6C pair IDs to their Phase 5C equivalents for data reuse.
 * Phase 5C uses "p5c-" prefix and "--fwd"/"--rev" suffixes.
 */
export const PHASE6C_TO_5C_MAP: Record<string, string> = {
  "p6c-light-color": "p5c-light-color",
  "p6c-bank-savings": "p5c-bank-savings",
  "p6c-animal-poodle": "p5c-animal-poodle",
  "p6c-music-mathematics": "p5c-music-mathematics",
  "p6c-tree-ecosystem": "p5c-tree-ecosystem",
};
