/**
 * Phase 4 triple definitions for Cross-Model Bridge Topology.
 *
 * 8 triples designed to test targeted bridge predictions across models,
 * with particular focus on Gemini fragmentation characterization.
 *
 * Each triple specifies:
 * - targetReps: number of repetitions per model per leg
 * - diagnosticType: what aspect of topology this triple tests
 * - bridgeConcept: the concept predicted to appear on A→C paths
 * - predictedBridgeFreq: per-model expected bridge frequency ranges
 * - reusableLegsWithSource: legs with partial/full data from earlier phases
 *
 * Legs marked as fully reusable in reusableLegs (on the ConceptTriple base)
 * need no new runs. Legs in reusableLegsWithSource that require "top-up"
 * runs are treated as new by the experiment runner — it checks existing
 * run counts and only makes additional runs to reach targetReps.
 */

import type {
  ConceptTriple,
  Phase4Triple,
  Phase4DiagnosticType,
  TripleType,
} from "./types.ts";

// ── Triple Definitions ─────────────────────────────────────────────

export const PHASE4_TRIPLES: Phase4Triple[] = [
  // 1. Polysemy retest: bank → river → ocean
  {
    id: "p4-bank-river-ocean",
    A: "bank",
    B: "river",
    C: "ocean",
    type: "polysemy-extend",
    targetReps: 20,
    diagnosticType: "polysemy-retest",
    bridgeConcept: "river",
    notes:
      "Retests polysemy-extend triple from Phase 3B with targeted reps. " +
      "AB fully reusable from Phase 1 (~20 reps). AC partial reuse from " +
      "Phase 3B (10 reps, need 10 top-up). BC is new.",
    reusableLegs: {
      AB: "polysemy-bank-river",
      BA: "rev-polysemy-bank-river",
    },
    reusableLegsWithSource: {
      AC: { pairId: "triple-bank-river-ocean--AC", phase: "phase3b", expectedReps: 10 },
      CA: { pairId: "triple-bank-river-ocean--CA", phase: "phase3b", expectedReps: 10 },
    },
    predictedBridgeFreq: {
      claude: [0.80, 1.0],
      gpt: [0.80, 1.0],
      grok: [0.80, 1.0],
      gemini: [0.0, 0.10],
    },
  },

  // 2. Polysemy financial: bank → deposit → savings
  {
    id: "p4-bank-deposit-savings",
    A: "bank",
    B: "deposit",
    C: "savings",
    type: "polysemy-extend",
    targetReps: 20,
    diagnosticType: "polysemy-financial",
    bridgeConcept: "deposit",
    notes:
      "Financial sense of 'bank'. All legs new. Tests whether models " +
      "converge on financial interpretation when C is financial.",
    predictedBridgeFreq: {
      claude: [0.30, 1.0],
      gpt: [0.30, 1.0],
      grok: [0.30, 1.0],
      gemini: [0.50, 1.0],
    },
  },

  // 3. Cross-domain concrete: light → spectrum → color
  {
    id: "p4-light-spectrum-color",
    A: "light",
    B: "spectrum",
    C: "color",
    type: "semantic-chain",
    targetReps: 20,
    diagnosticType: "cross-domain-concrete",
    bridgeConcept: "spectrum",
    notes:
      "Concrete cross-domain chain through physics. All legs new. " +
      "Tests whether 'spectrum' naturally bridges light and color.",
    predictedBridgeFreq: {
      claude: [0.40, 1.0],
      gpt: [0.40, 1.0],
      grok: [0.40, 1.0],
      gemini: [0.40, 1.0],
    },
  },

  // 4. Abstract retest: emotion → nostalgia → melancholy
  {
    id: "p4-emotion-nostalgia-melancholy",
    A: "emotion",
    B: "nostalgia",
    C: "melancholy",
    type: "hierarchical",
    targetReps: 20,
    diagnosticType: "abstract-retest",
    bridgeConcept: "nostalgia",
    notes:
      "Retests hierarchical triple from Phase 3B with targeted reps. " +
      "AB partial reuse from Phase 1 (~10 reps, need 10 top-up). " +
      "BC and AC partial reuse from Phase 3B (10 reps each, need 10 top-up each).",
    reusableLegsWithSource: {
      AB: { pairId: "hierarchy-emotion-nostalgia", phase: "phase1", expectedReps: 10 },
      BA: { pairId: "rev-hierarchy-emotion-nostalgia", phase: "phase2", expectedReps: 10 },
      BC: { pairId: "triple-emotion-nostalgia-melancholy--BC", phase: "phase3b", expectedReps: 10 },
      CB: { pairId: "triple-emotion-nostalgia-melancholy--CB", phase: "phase3b", expectedReps: 10 },
      AC: { pairId: "triple-emotion-nostalgia-melancholy--AC", phase: "phase3b", expectedReps: 10 },
      CA: { pairId: "triple-emotion-nostalgia-melancholy--CA", phase: "phase3b", expectedReps: 10 },
    },
    predictedBridgeFreq: {
      claude: [0.30, 1.0],
      gpt: [0.30, 1.0],
      grok: [0.80, 1.0],
      gemini: [0.0, 0.10],
    },
  },

  // 5. Abstract bridge: language → metaphor → thought
  {
    id: "p4-language-metaphor-thought",
    A: "language",
    B: "metaphor",
    C: "thought",
    type: "hierarchical",
    targetReps: 20,
    diagnosticType: "abstract-bridge",
    bridgeConcept: "metaphor",
    notes:
      "Abstract chain testing Lakoff-style conceptual metaphor bridge. " +
      "All legs new. Tests whether 'metaphor' naturally bridges language and thought.",
    predictedBridgeFreq: {
      claude: [0.50, 1.0],
      gpt: [0.30, 1.0],
      grok: [0.50, 1.0],
      gemini: [0.0, 0.20],
    },
  },

  // 6. Concrete hierarchical: tree → forest → ecosystem
  {
    id: "p4-tree-forest-ecosystem",
    A: "tree",
    B: "forest",
    C: "ecosystem",
    type: "hierarchical",
    targetReps: 20,
    diagnosticType: "concrete-hierarchical",
    bridgeConcept: "forest",
    notes:
      "Concrete hierarchical chain (part → whole → system). All legs new. " +
      "Tests whether even Gemini can bridge concrete taxonomic chains.",
    predictedBridgeFreq: {
      claude: [0.50, 1.0],
      gpt: [0.50, 1.0],
      grok: [0.50, 1.0],
      gemini: [0.40, 1.0],
    },
  },

  // 7. Random control: light → chandelier → color
  {
    id: "p4-light-chandelier-color",
    A: "light",
    B: "chandelier",
    C: "color",
    type: "random-control",
    targetReps: 10,
    diagnosticType: "random-control",
    bridgeConcept: "chandelier",
    notes:
      "Random B inserted into light→color pair. 'chandelier' is related to " +
      "light but should not appear as a natural bridge concept. All legs new.",
    predictedBridgeFreq: {
      claude: [0.0, 0.05],
      gpt: [0.0, 0.05],
      grok: [0.0, 0.05],
      gemini: [0.0, 0.05],
    },
  },

  // 8. Random control: emotion → calendar → melancholy
  {
    id: "p4-emotion-calendar-melancholy",
    A: "emotion",
    B: "calendar",
    C: "melancholy",
    type: "random-control",
    targetReps: 10,
    diagnosticType: "random-control",
    bridgeConcept: "calendar",
    notes:
      "Random B inserted into emotion→melancholy pair. 'calendar' is semantically " +
      "unrelated to both endpoints. All legs new.",
    predictedBridgeFreq: {
      claude: [0.0, 0.05],
      gpt: [0.0, 0.05],
      grok: [0.0, 0.05],
      gemini: [0.0, 0.05],
    },
  },
];

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Get all Phase 4 triples of a given diagnostic type.
 */
export function getPhase4TriplesByType(
  type: Phase4DiagnosticType,
): Phase4Triple[] {
  return PHASE4_TRIPLES.filter((t) => t.diagnosticType === type);
}

/**
 * For a given Phase 4 triple, return the 6 leg descriptors.
 * Same pattern as getTripleLegs from triples.ts but operates on Phase4Triple.
 */
export interface Phase4LegDescriptor {
  from: string;
  to: string;
  legId: string; // "AB", "BA", "BC", "CB", "AC", "CA"
  reusablePairId: string | null;
  isReverse: boolean;
  /** Source phase for partial reuse (top-up), if any */
  topUpSource: { pairId: string; phase: string; expectedReps: number } | null;
}

export function getPhase4TripleLegs(
  triple: Phase4Triple,
): Phase4LegDescriptor[] {
  const reuse = triple.reusableLegs ?? {};
  const topUp = triple.reusableLegsWithSource ?? {};

  return [
    {
      from: triple.A,
      to: triple.B,
      legId: "AB",
      reusablePairId: reuse.AB ?? null,
      isReverse: false,
      topUpSource: topUp.AB ?? null,
    },
    {
      from: triple.B,
      to: triple.A,
      legId: "BA",
      reusablePairId: reuse.BA ?? null,
      isReverse: reuse.BA?.startsWith("rev-") ?? false,
      topUpSource: topUp.BA ?? null,
    },
    {
      from: triple.B,
      to: triple.C,
      legId: "BC",
      reusablePairId: reuse.BC ?? null,
      isReverse: false,
      topUpSource: topUp.BC ?? null,
    },
    {
      from: triple.C,
      to: triple.B,
      legId: "CB",
      reusablePairId: reuse.CB ?? null,
      isReverse: reuse.CB?.startsWith("rev-") ?? false,
      topUpSource: topUp.CB ?? null,
    },
    {
      from: triple.A,
      to: triple.C,
      legId: "AC",
      reusablePairId: reuse.AC ?? null,
      isReverse: false,
      topUpSource: topUp.AC ?? null,
    },
    {
      from: triple.C,
      to: triple.A,
      legId: "CA",
      reusablePairId: reuse.CA ?? null,
      isReverse: reuse.CA?.startsWith("rev-") ?? false,
      topUpSource: topUp.CA ?? null,
    },
  ];
}

/**
 * Count how many legs need new runs vs can be fully reused vs need top-up.
 */
export function countPhase4Legs(): {
  newLegs: number;
  reusedLegs: number;
  topUpLegs: number;
  totalLegs: number;
} {
  let newLegs = 0;
  let reusedLegs = 0;
  let topUpLegs = 0;

  for (const triple of PHASE4_TRIPLES) {
    const legs = getPhase4TripleLegs(triple);
    for (const leg of legs) {
      if (leg.reusablePairId) {
        reusedLegs++;
      } else if (leg.topUpSource) {
        topUpLegs++;
      } else {
        newLegs++;
      }
    }
  }

  return {
    newLegs,
    reusedLegs,
    topUpLegs,
    totalLegs: newLegs + reusedLegs + topUpLegs,
  };
}
