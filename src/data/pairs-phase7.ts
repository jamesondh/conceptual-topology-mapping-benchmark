/**
 * Phase 7 pair definitions for Anchoring-Effect Probes,
 * Curvature Triangles, and Too-Central Diagnostics.
 */

import type {
  Phase7AnchoringPair,
  Phase7CurvatureTriangle,
  Phase7TooCentralPair,
} from "../types.ts";

// ── Part A: Anchoring-Effect Pairs ─────────────────────────────────────
//
// Tests whether a pre-filled heading waypoint biases the subsequent path.
// Conditions: incongruent pre-fill, congruent pre-fill, neutral pre-fill,
// plus an unconstrained baseline (no pre-fill).
//
// Target reps: 10 per model per condition for pre-filled,
//              15 per model for unconstrained
//              (pairs 7-8 new; pairs 1-6 reuse 6C + 5 supplemental)

export const PHASE7A_PAIRS: Phase7AnchoringPair[] = [
  {
    id: "p7a-music-mathematics",
    from: "music",
    to: "mathematics",
    bridge: "harmony",
    unconstrainedModalPosition: "1-2",
    incongruentPreFill: "symmetry",
    congruentPreFill: "rhythm",
    neutralPreFill: "element",
    role: "heading-bridge",
    targetReps: { preFilled: 10, unconstrained: 15 },
    notes: "Reuse 6C data + 5 supplemental unconstrained reps.",
  },
  {
    id: "p7a-sun-desert",
    from: "sun",
    to: "desert",
    bridge: "heat",
    unconstrainedModalPosition: "1",
    incongruentPreFill: "drought",
    congruentPreFill: "warmth",
    neutralPreFill: "element",
    role: "heading-bridge",
    targetReps: { preFilled: 10, unconstrained: 15 },
    notes: "Reuse 6C data + 5 supplemental unconstrained reps.",
  },
  {
    id: "p7a-seed-garden",
    from: "seed",
    to: "garden",
    bridge: "germination",
    unconstrainedModalPosition: "1",
    incongruentPreFill: "sprout",
    congruentPreFill: "growth",
    neutralPreFill: "element",
    role: "heading-bridge",
    targetReps: { preFilled: 10, unconstrained: 15 },
    notes: "Reuse 6C data + 5 supplemental unconstrained reps.",
  },
  {
    id: "p7a-light-color",
    from: "light",
    to: "color",
    bridge: "spectrum",
    unconstrainedModalPosition: "1-2",
    incongruentPreFill: "wavelength",
    congruentPreFill: "prism",
    neutralPreFill: "element",
    role: "heading-bridge",
    targetReps: { preFilled: 10, unconstrained: 15 },
    notes: "Reuse 6C data + 5 supplemental unconstrained reps.",
  },
  {
    id: "p7a-bank-ocean",
    from: "bank",
    to: "ocean",
    bridge: "river",
    unconstrainedModalPosition: "1",
    incongruentPreFill: "estuary",
    congruentPreFill: "stream",
    neutralPreFill: "element",
    role: "heading-bridge",
    targetReps: { preFilled: 10, unconstrained: 15 },
    notes: "Reuse 6C data + 5 supplemental unconstrained reps.",
  },
  {
    id: "p7a-emotion-melancholy",
    from: "emotion",
    to: "melancholy",
    bridge: "sadness",
    unconstrainedModalPosition: "2",
    incongruentPreFill: "mood",
    congruentPreFill: "grief",
    neutralPreFill: "element",
    role: "heading-bridge",
    targetReps: { preFilled: 10, unconstrained: 15 },
    notes: "Reuse 6C data + 5 supplemental unconstrained reps.",
  },
  {
    id: "p7a-loan-shore",
    from: "loan",
    to: "shore",
    bridge: "bank",
    unconstrainedModalPosition: "1-2",
    incongruentPreFill: "interest",
    congruentPreFill: "credit",
    neutralPreFill: "element",
    role: "forced-crossing-control",
    targetReps: { preFilled: 10, unconstrained: 15 },
    notes: "New forced-crossing control pair for Phase 7.",
  },
  {
    id: "p7a-animal-poodle",
    from: "animal",
    to: "poodle",
    bridge: "dog",
    unconstrainedModalPosition: "4-5",
    incongruentPreFill: "mammal",
    congruentPreFill: "canine",
    neutralPreFill: "element",
    role: "taxonomic-control",
    targetReps: { preFilled: 10, unconstrained: 15 },
    notes: "New taxonomic control pair for Phase 7.",
  },
];

// ── Part B: Curvature Triangles ────────────────────────────────────────
//
// Measures how conceptual curvature changes when the B vertex is
// polysemous (homonym) vs. non-polysemous. Each triangle has three legs:
// A→B, B→C, and A→C. Curvature = deviation from straight-line
// transitivity through B.
//
// Target reps: 10 per model per leg, 5 waypoints.

export const PHASE7B_TRIANGLES: Phase7CurvatureTriangle[] = [
  // ── Polysemous-vertex triangles ──
  {
    id: "p7b-loan-bank-river",
    A: "loan",
    B: "bank",
    C: "river",
    polysemyType: "homonym",
    polysemyLabel: "financial/geographic",
    vertexType: "polysemous",
    targetReps: 10,
    waypointCount: 5,
    reusableLegs: {},
    notes: "Homonym (financial/geographic). All legs new.",
  },
  {
    id: "p7b-deposit-bank-shore",
    A: "deposit",
    B: "bank",
    C: "shore",
    polysemyType: "homonym",
    polysemyLabel: "financial/geographic",
    vertexType: "polysemous",
    targetReps: 10,
    waypointCount: 5,
    reusableLegs: {},
    notes: "Homonym (financial/geographic). All legs new.",
  },
  {
    id: "p7b-photon-light-heavy",
    A: "photon",
    B: "light",
    C: "heavy",
    polysemyType: "homonym",
    polysemyLabel: "electromagnetic/weight",
    vertexType: "polysemous",
    targetReps: 10,
    waypointCount: 5,
    reusableLegs: {
      AC: "p5b-photon-light-heavy--AC",
    },
    notes: "Homonym (electromagnetic/weight). AC leg reuse from Phase 5B.",
  },
  {
    id: "p7b-candle-light-feather",
    A: "candle",
    B: "light",
    C: "feather",
    polysemyType: "homonym",
    polysemyLabel: "illumination/weight",
    vertexType: "polysemous",
    targetReps: 10,
    waypointCount: 5,
    reusableLegs: {},
    notes: "Homonym (illumination/weight). All legs new.",
  },
  // ── Non-polysemous-vertex triangles ──
  {
    id: "p7b-sun-heat-desert",
    A: "sun",
    B: "heat",
    C: "desert",
    polysemyType: null,
    polysemyLabel: null,
    vertexType: "non-polysemous",
    relationship: "causal-chain",
    targetReps: 10,
    waypointCount: 5,
    reusableLegs: {
      AC: "p6a-sun-desert",
    },
    notes: "Causal chain. AC leg reuse from Phase 6A.",
  },
  {
    id: "p7b-seed-germination-garden",
    A: "seed",
    B: "germination",
    C: "garden",
    polysemyType: null,
    polysemyLabel: null,
    vertexType: "non-polysemous",
    relationship: "process-chain",
    targetReps: 10,
    waypointCount: 5,
    reusableLegs: {},
    notes: "Process chain. Partial reuse possible.",
  },
  {
    id: "p7b-music-harmony-mathematics",
    A: "music",
    B: "harmony",
    C: "mathematics",
    polysemyType: null,
    polysemyLabel: null,
    vertexType: "non-polysemous",
    relationship: "cross-domain",
    targetReps: 10,
    waypointCount: 5,
    reusableLegs: {
      AC: "p6a-music-mathematics",
    },
    notes: "Cross-domain. AC leg reuse from Phase 6A.",
  },
  {
    id: "p7b-word-sentence-paragraph",
    A: "word",
    B: "sentence",
    C: "paragraph",
    polysemyType: null,
    polysemyLabel: null,
    vertexType: "non-polysemous",
    relationship: "compositional",
    targetReps: 10,
    waypointCount: 5,
    reusableLegs: {
      AC: "p5a-word-sentence-paragraph--AC",
    },
    notes: "Compositional. AC leg reuse from Phase 5A.",
  },
];

// ── Part C: Too-Central Pairs ──────────────────────────────────────────
//
// Tests whether a candidate bridge concept is "too central" (i.e., it
// appears as a waypoint for many unrelated pairs, not just the target
// pair). Three categories:
//   1. Known Too-Central (fire-like): bridge expected to appear < 15-20%
//      even for random target pairs.
//   2. Known Obvious-Useful: bridge expected to appear > 40-50% for
//      the target pair but rarely for random targets.
//   3. Boundary Cases: bridge frequency ambiguous (10-60%).
//
// Target reps: 10 per model.

export const PHASE7C_PAIRS: Phase7TooCentralPair[] = [
  // ── Category 1: Known Too-Central (fire-like) ──
  {
    id: "p7c-spark-ash",
    from: "spark",
    to: "ash",
    candidateBridge: "fire",
    category: "too-central",
    expectedFreq: "< 0.15",
    randomTargets: ["telescope", "mountain", "library"],
    targetReps: 10,
    notes: "Reuse from Phase 5B. Fire is the canonical too-central concept.",
  },
  {
    id: "p7c-acorn-timber",
    from: "acorn",
    to: "timber",
    candidateBridge: "tree",
    category: "too-central",
    expectedFreq: "< 0.15",
    randomTargets: ["telescope", "mountain", "library"],
    targetReps: 10,
    notes: "Tree expected to appear for many unrelated pairs.",
  },
  {
    id: "p7c-flour-bread",
    from: "flour",
    to: "bread",
    candidateBridge: "dough",
    category: "too-central",
    expectedFreq: "< 0.20",
    randomTargets: ["telescope", "mountain", "library"],
    targetReps: 10,
    notes: "Dough is the obvious intermediary but may be too generic.",
  },
  // ── Category 2: Known Obvious-Useful ──
  {
    id: "p7c-hot-cold",
    from: "hot",
    to: "cold",
    candidateBridge: "warm",
    category: "obvious-useful",
    expectedFreq: "> 0.50",
    randomTargets: ["telescope", "mountain", "library"],
    targetReps: 10,
    notes: "Reuse from Phase 6A. Warm is a clear directional midpoint.",
  },
  {
    id: "p7c-infant-elderly",
    from: "infant",
    to: "elderly",
    candidateBridge: "adolescent",
    category: "obvious-useful",
    expectedFreq: "> 0.50",
    randomTargets: ["telescope", "mountain", "library"],
    targetReps: 10,
    notes: "Age-spectrum midpoint; unlikely to appear for random pairs.",
  },
  {
    id: "p7c-whisper-shout",
    from: "whisper",
    to: "shout",
    candidateBridge: "speak",
    category: "obvious-useful",
    expectedFreq: "> 0.40",
    randomTargets: ["telescope", "mountain", "library"],
    targetReps: 10,
    notes: "Volume-spectrum midpoint; speak is pair-specific.",
  },
  // ── Category 3: Boundary Cases ──
  {
    id: "p7c-rain-ocean",
    from: "rain",
    to: "ocean",
    candidateBridge: "water",
    category: "boundary",
    expectedFreq: "0.10-0.40",
    randomTargets: ["telescope", "mountain", "library"],
    targetReps: 10,
    notes: "Water is ubiquitous but also genuinely bridges rain→ocean.",
  },
  {
    id: "p7c-egg-chicken",
    from: "egg",
    to: "chicken",
    candidateBridge: "embryo",
    category: "boundary",
    expectedFreq: "0.10-0.40",
    randomTargets: ["telescope", "mountain", "library"],
    targetReps: 10,
    notes: "Embryo is a biological intermediate but may appear generically.",
  },
  {
    id: "p7c-ice-steam",
    from: "ice",
    to: "steam",
    candidateBridge: "water",
    category: "boundary",
    expectedFreq: "0.15-0.50",
    randomTargets: ["telescope", "mountain", "library"],
    targetReps: 10,
    notes: "Water is the canonical phase-transition midpoint but may be too central.",
  },
  {
    id: "p7c-dawn-dusk",
    from: "dawn",
    to: "dusk",
    candidateBridge: "noon",
    category: "boundary",
    expectedFreq: "0.30-0.60",
    randomTargets: ["telescope", "mountain", "library"],
    targetReps: 10,
    notes: "Noon is a temporal midpoint; high specificity but moderate centrality.",
  },
];
