/**
 * Concept triple definitions for Phase 3B: Transitive Path Structure.
 *
 * 8 triples covering hierarchical chains, semantic chains, polysemy extensions,
 * and random controls. Each triple specifies reusable legs from Phase 1/2 data
 * to minimize new API calls.
 *
 * A triple (A, B, C) requires 6 legs: A→B, B→A, B→C, C→B, A→C, C→A
 * Some legs already exist as Phase 1 forward or Phase 2 reverse data.
 */

import type { ConceptTriple, TripleType } from "../types.ts";

// ── Triple Definitions ─────────────────────────────────────────────

export const TRIPLES: ConceptTriple[] = [
  // 1. Hierarchical: taxonomic chain
  {
    id: "triple-animal-dog-poodle",
    A: "animal",
    B: "dog",
    C: "poodle",
    type: "hierarchical",
    notes: "Taxonomic chain. 'dog' should be on the A→C route. Reuses animal→poodle (fwd+rev).",
    reusableLegs: {
      AC: "hierarchy-animal-poodle",       // Phase 1 forward
      CA: "rev-hierarchy-animal-poodle",   // Phase 2 reverse
    },
  },

  // 2. Hierarchical: emotional specificity
  {
    id: "triple-emotion-nostalgia-melancholy",
    A: "emotion",
    B: "nostalgia",
    C: "melancholy",
    type: "hierarchical",
    notes: "Emotional specificity chain. Reuses emotion→nostalgia (fwd+rev).",
    reusableLegs: {
      AB: "hierarchy-emotion-nostalgia",       // Phase 1 forward
      BA: "rev-hierarchy-emotion-nostalgia",   // Phase 2 reverse
    },
  },

  // 3. Semantic chain: music→harmony→mathematics
  {
    id: "triple-music-harmony-mathematics",
    A: "music",
    B: "harmony",
    C: "mathematics",
    type: "semantic-chain",
    notes: "'harmony' bridges music & math domains. Reuses music→mathematics (fwd+rev).",
    reusableLegs: {
      AC: "cross-music-mathematics",       // Phase 1 forward
      CA: "rev-cross-music-mathematics",   // Phase 2 reverse
    },
  },

  // 4. Semantic chain: hot→energy→cold
  {
    id: "triple-hot-energy-cold",
    A: "hot",
    B: "energy",
    C: "cold",
    type: "semantic-chain",
    notes: "Physical concept chain through antonym pair. Reuses hot→cold (fwd+rev).",
    reusableLegs: {
      AC: "antonym-hot-cold",       // Phase 1 forward
      CA: "rev-antonym-hot-cold",   // Phase 2 reverse
    },
  },

  // 5. Max-reuse: Beyoncé→justice→erosion
  {
    id: "triple-beyonce-justice-erosion",
    A: "Beyoncé",
    B: "justice",
    C: "erosion",
    type: "existing-pair",
    notes: "Maximum data reuse — 4 of 6 legs exist. Tests whether justice is 'on the route' between Beyoncé and erosion.",
    reusableLegs: {
      BC: "cross-justice-erosion",             // Phase 1 forward
      CB: "rev-cross-justice-erosion",         // Phase 2 reverse
      AC: "anchor-beyonce-erosion",            // Phase 1 forward
      CA: "rev-anchor-beyonce-erosion",        // Phase 2 reverse
    },
  },

  // 6. Polysemy extension: bank→river→ocean
  {
    id: "triple-bank-river-ocean",
    A: "bank",
    B: "river",
    C: "ocean",
    type: "polysemy-extend",
    notes: "Geographic chain extending polysemy pair. Reuses bank→river (fwd+rev).",
    reusableLegs: {
      AB: "polysemy-bank-river",       // Phase 1 forward
      BA: "rev-polysemy-bank-river",   // Phase 2 reverse
    },
  },

  // 7. Random control: music→stapler→mathematics
  {
    id: "triple-music-stapler-mathematics",
    A: "music",
    B: "stapler",
    C: "mathematics",
    type: "random-control",
    notes: "Random B inserted into existing pair. Stapler should NOT be on-route. Reuses music→mathematics (fwd+rev).",
    reusableLegs: {
      AC: "cross-music-mathematics",       // Phase 1 forward
      CA: "rev-cross-music-mathematics",   // Phase 2 reverse
    },
  },

  // 8. Random control: hot→flamingo→cold
  {
    id: "triple-hot-flamingo-cold",
    A: "hot",
    B: "flamingo",
    C: "cold",
    type: "random-control",
    notes: "Random B inserted into antonym pair. Flamingo should NOT be on-route. Reuses hot→cold (fwd+rev).",
    reusableLegs: {
      AC: "antonym-hot-cold",       // Phase 1 forward
      CA: "rev-antonym-hot-cold",   // Phase 2 reverse
    },
  },
];

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Get all triples of a given type.
 */
export function getTriplesByType(type: TripleType): ConceptTriple[] {
  return TRIPLES.filter((t) => t.type === type);
}

/**
 * For a given triple, return the 6 leg descriptors:
 * Each leg has: from, to, legId (e.g. "A→B"), and an optional
 * reusable pair ID if existing data can be used.
 */
export interface LegDescriptor {
  from: string;
  to: string;
  legId: string; // "AB", "BA", "BC", "CB", "AC", "CA"
  reusablePairId: string | null;
  /** For forward reuse, the pair.id to look for; for reverse, the rev- prefixed ID */
  isReverse: boolean;
}

export function getTripleLegs(triple: ConceptTriple): LegDescriptor[] {
  const reuse = triple.reusableLegs ?? {};
  return [
    {
      from: triple.A, to: triple.B, legId: "AB",
      reusablePairId: reuse.AB ?? null,
      isReverse: false,
    },
    {
      from: triple.B, to: triple.A, legId: "BA",
      reusablePairId: reuse.BA ?? null,
      isReverse: reuse.BA?.startsWith("rev-") ?? false,
    },
    {
      from: triple.B, to: triple.C, legId: "BC",
      reusablePairId: reuse.BC ?? null,
      isReverse: false,
    },
    {
      from: triple.C, to: triple.B, legId: "CB",
      reusablePairId: reuse.CB ?? null,
      isReverse: reuse.CB?.startsWith("rev-") ?? false,
    },
    {
      from: triple.A, to: triple.C, legId: "AC",
      reusablePairId: reuse.AC ?? null,
      isReverse: false,
    },
    {
      from: triple.C, to: triple.A, legId: "CA",
      reusablePairId: reuse.CA ?? null,
      isReverse: reuse.CA?.startsWith("rev-") ?? false,
    },
  ];
}

/**
 * Count how many legs need new runs vs can be reused.
 */
export function countLegs(): { newLegs: number; reusedLegs: number; totalLegs: number } {
  let newLegs = 0;
  let reusedLegs = 0;

  for (const triple of TRIPLES) {
    const legs = getTripleLegs(triple);
    for (const leg of legs) {
      if (leg.reusablePairId) {
        reusedLegs++;
      } else {
        newLegs++;
      }
    }
  }

  return { newLegs, reusedLegs, totalLegs: newLegs + reusedLegs };
}
