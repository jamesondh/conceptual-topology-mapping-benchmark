/**
 * Phase 11 pair definitions: expanded generality, control revision, and robustness.
 */
import type {
  Phase10CorePair,
  Phase11ControlCandidate,
  Phase11RobustnessPair,
  RobustnessCondition,
} from "../types.ts";

// ── Part A: Expanded Model Generality ──────────────────────────────
// Same 12-pair battery as Phase 10A (proven design, enables direct cohort comparison).

/** 8 forward pairs spanning the benchmark's key findings. */
export const PHASE11A_FORWARD_PAIRS: Phase10CorePair[] = [
  {
    id: "p11a-music-mathematics",
    from: "music",
    to: "mathematics",
    direction: "forward",
    tests: ["R6"],
    expectedBridge: "harmony",
    priorFreq: 0.550,
    targetReps: 15,
    notes: "R6 bridge bottleneck; cross-domain",
  },
  {
    id: "p11a-light-color",
    from: "light",
    to: "color",
    direction: "forward",
    tests: ["R6"],
    expectedBridge: "spectrum",
    priorFreq: 0.917,
    targetReps: 15,
    notes: "R6 strong bottleneck",
  },
  {
    id: "p11a-animal-poodle",
    from: "animal",
    to: "poodle",
    direction: "forward",
    tests: ["R4"],
    expectedBridge: "dog",
    priorFreq: 0.970,
    targetReps: 15,
    notes: "R4 hierarchical compositionality",
  },
  {
    id: "p11a-emotion-melancholy",
    from: "emotion",
    to: "melancholy",
    direction: "forward",
    tests: ["R6"],
    expectedBridge: "sadness",
    priorFreq: 0.950,
    targetReps: 15,
    notes: "R6 bridge salience",
  },
  {
    id: "p11a-hot-cold",
    from: "hot",
    to: "cold",
    direction: "forward",
    tests: ["R2"],
    expectedBridge: "warm",
    priorFreq: 0.800,
    targetReps: 15,
    notes: "R2 asymmetry; antonym axis",
  },
  {
    id: "p11a-hide-shoe",
    from: "hide",
    to: "shoe",
    direction: "forward",
    tests: ["R6"],
    expectedBridge: "leather",
    priorFreq: 0.950,
    targetReps: 15,
    notes: "R6 transformation bottleneck",
  },
  {
    id: "p11a-seed-garden",
    from: "seed",
    to: "garden",
    direction: "forward",
    tests: ["R6"],
    expectedBridge: "germination",
    priorFreq: 0.583,
    targetReps: 15,
    notes: "R6 process-naming; O4",
  },
  {
    id: "p11a-stapler-monsoon",
    from: "stapler",
    to: "monsoon",
    direction: "forward",
    tests: ["R5"],
    expectedBridge: null,
    priorFreq: 0.000,
    targetReps: 15,
    notes: "R5 random control (expected to fail for new models, consistent with O27)",
  },
];

/** 4 reverse pairs for asymmetry testing. */
export const PHASE11A_REVERSE_PAIRS: Phase10CorePair[] = [
  {
    id: "p11a-mathematics-music",
    from: "mathematics",
    to: "music",
    direction: "reverse",
    tests: ["R2"],
    expectedBridge: "harmony",
    priorFreq: null,
    targetReps: 15,
    notes: "R2 asymmetry (reverse of music-mathematics)",
  },
  {
    id: "p11a-color-light",
    from: "color",
    to: "light",
    direction: "reverse",
    tests: ["R2"],
    expectedBridge: "spectrum",
    priorFreq: null,
    targetReps: 15,
    notes: "R2 asymmetry (reverse of light-color)",
  },
  {
    id: "p11a-poodle-animal",
    from: "poodle",
    to: "animal",
    direction: "reverse",
    tests: ["R2"],
    expectedBridge: "dog",
    priorFreq: null,
    targetReps: 15,
    notes: "R2 asymmetry (reverse of animal-poodle)",
  },
  {
    id: "p11a-melancholy-emotion",
    from: "melancholy",
    to: "emotion",
    direction: "reverse",
    tests: ["R2"],
    expectedBridge: "sadness",
    priorFreq: null,
    targetReps: 15,
    notes: "R2 asymmetry (reverse of emotion-melancholy)",
  },
];

/** All Phase 11A pairs combined (12 total: 8 forward + 4 reverse). */
export const PHASE11A_ALL_PAIRS: Phase10CorePair[] = [
  ...PHASE11A_FORWARD_PAIRS,
  ...PHASE11A_REVERSE_PAIRS,
];

/** Forward-reverse pair mappings for asymmetry calculation. */
export const PHASE11A_ASYMMETRY_PAIRS = [
  { forward: "p11a-music-mathematics", reverse: "p11a-mathematics-music", pairLabel: "music-mathematics" },
  { forward: "p11a-light-color", reverse: "p11a-color-light", pairLabel: "light-color" },
  { forward: "p11a-animal-poodle", reverse: "p11a-poodle-animal", pairLabel: "animal-poodle" },
  { forward: "p11a-emotion-melancholy", reverse: "p11a-melancholy-emotion", pairLabel: "emotion-melancholy" },
];

/** Non-control forward pairs (exclude stapler-monsoon for cohort comparison). */
export const PHASE11A_NON_CONTROL_FORWARD_PAIRS = PHASE11A_FORWARD_PAIRS.filter(
  (p) => p.expectedBridge !== null,
);

/** Probe pairs (first 3 forward pairs used for model reliability probing). */
export const PHASE11A_PROBE_PAIRS = PHASE11A_FORWARD_PAIRS.slice(0, 3);

// ── Part B: Control Pair Revision ──────────────────────────────────

export const PHASE11B_CONTROL_CANDIDATES: Phase11ControlCandidate[] = [
  {
    id: "p11b-turmeric-trigonometry",
    from: "turmeric",
    to: "trigonometry",
    rationale: "Spice / mathematics. No functional link. No shared sensory features. Maximal domain separation.",
    targetScreeningReps: 10,
    targetValidationReps: 15,
  },
  {
    id: "p11b-barnacle-sonnet",
    from: "barnacle",
    to: "sonnet",
    rationale: "Marine biology / literature. Different kingdoms of experience. Minimal associative overlap.",
    targetScreeningReps: 10,
    targetValidationReps: 15,
  },
  {
    id: "p11b-magnesium-ballet",
    from: "magnesium",
    to: "ballet",
    rationale: "Chemistry / performing arts. Element vs art form. No cultural or functional link.",
    targetScreeningReps: 10,
    targetValidationReps: 15,
  },
  {
    id: "p11b-accordion-stalactite",
    from: "accordion",
    to: "stalactite",
    rationale: "Musical instrument / geology. Concrete-concrete but maximally unrelated domains.",
    targetScreeningReps: 10,
    targetValidationReps: 15,
  },
];

/** Screening pass thresholds from the spec. */
export const CONTROL_SCREENING_THRESHOLDS = {
  maxTopFrequency: 0.15,
  minEntropy: 5.0,
  minModelsPass: 4,
};

// ── Part C: Multiverse Robustness ──────────────────────────────────

/** The 2x2 grid of robustness conditions. */
export const ROBUSTNESS_CONDITIONS: RobustnessCondition[] = [
  { waypoints: 5, temperature: 0.5, label: "5wp-t0.5" },
  { waypoints: 5, temperature: 0.9, label: "5wp-t0.9" },
  { waypoints: 9, temperature: 0.5, label: "9wp-t0.5" },
  { waypoints: 9, temperature: 0.9, label: "9wp-t0.9" },
];

/** Baseline condition (reused from Phases 1-10). */
export const ROBUSTNESS_BASELINE: RobustnessCondition = {
  waypoints: 7,
  temperature: 0.7,
  label: "7wp-t0.7",
};

/** 4 forward pairs + 2 reverse pairs for robustness testing. */
export const PHASE11C_FORWARD_PAIRS: Phase11RobustnessPair[] = [
  {
    id: "p11c-light-color",
    from: "light",
    to: "color",
    direction: "forward",
    expectedBridge: "spectrum",
    targetReps: 15,
  },
  {
    id: "p11c-hot-cold",
    from: "hot",
    to: "cold",
    direction: "forward",
    expectedBridge: "warm",
    targetReps: 15,
  },
  {
    id: "p11c-emotion-melancholy",
    from: "emotion",
    to: "melancholy",
    direction: "forward",
    expectedBridge: "sadness",
    targetReps: 15,
  },
  {
    id: "p11c-stapler-monsoon",
    from: "stapler",
    to: "monsoon",
    direction: "forward",
    expectedBridge: null,
    targetReps: 15,
  },
];

export const PHASE11C_REVERSE_PAIRS: Phase11RobustnessPair[] = [
  {
    id: "p11c-cold-hot",
    from: "cold",
    to: "hot",
    direction: "reverse",
    expectedBridge: "warm",
    targetReps: 15,
  },
  {
    id: "p11c-melancholy-emotion",
    from: "melancholy",
    to: "emotion",
    direction: "reverse",
    expectedBridge: "sadness",
    targetReps: 15,
  },
];

export const PHASE11C_ALL_PAIRS: Phase11RobustnessPair[] = [
  ...PHASE11C_FORWARD_PAIRS,
  ...PHASE11C_REVERSE_PAIRS,
];

/** Asymmetry pair mappings for robustness asymmetry analysis. */
export const PHASE11C_ASYMMETRY_PAIRS = [
  { forward: "p11c-hot-cold", reverse: "p11c-cold-hot", pairLabel: "hot-cold" },
  { forward: "p11c-emotion-melancholy", reverse: "p11c-melancholy-emotion", pairLabel: "emotion-melancholy" },
];

/** Robustness models: Claude (highest gait), GPT (lowest gait), DeepSeek (new from Part A). */
export const PHASE11C_MODEL_IDS = ["claude", "gpt", "deepseek"] as const;
