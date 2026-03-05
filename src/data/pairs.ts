/**
 * Curated concept pair sets for the Conceptual Topology Mapping Benchmark.
 *
 * 36 pairs covering all category axes, split into holdout (15) and
 * reporting (21) sets with even category distribution across both.
 */

import type {
  ConceptPair,
  ModelConfig,
  PairCategory,
} from "../types.ts";

// ── Anchor Pairs ────────────────────────────────────────────────────
// Known basin structure from word-convergence experiments.

const ANCHOR_PAIRS: ConceptPair[] = [
  // Deep basins — strong, reliable convergence
  {
    id: "anchor-beyonce-erosion",
    from: "Beyoncé",
    to: "erosion",
    category: "anchor",
    concreteness: ["concrete", "abstract"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "reporting",
    basin: "formation",
    basinDepth: "deep",
    notes: "Deep basin; word-convergence reliably produces 'formation'",
  },
  {
    id: "anchor-tesla-mycelium",
    from: "Tesla",
    to: "mycelium",
    category: "anchor",
    concreteness: ["concrete", "concrete"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "reporting",
    basin: "network",
    basinDepth: "deep",
    notes: "Deep basin; word-convergence reliably produces 'network'",
  },
  // Moderate basins — convergence with some variance
  {
    id: "anchor-shadow-melody",
    from: "shadow",
    to: "melody",
    category: "anchor",
    concreteness: ["concrete", "abstract"],
    relationalType: "associative",
    polysemy: "unambiguous",
    set: "holdout",
    basin: "echo",
    basinDepth: "moderate",
    notes: "Moderate basin; convergence around 'echo' with some drift",
  },
  {
    id: "anchor-skull-garden",
    from: "skull",
    to: "garden",
    category: "anchor",
    concreteness: ["concrete", "concrete"],
    relationalType: "associative",
    polysemy: "unambiguous",
    set: "reporting",
    basinDepth: "moderate",
    notes: "Moderate basin; convergence less predictable than deep pairs",
  },
  // Flat terrain — low convergence, high variance
  {
    id: "anchor-kanye-lattice",
    from: "Kanye West",
    to: "lattice",
    category: "anchor",
    concreteness: ["concrete", "abstract"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "holdout",
    basinDepth: "flat",
    notes: "Flat terrain; high variance expected across runs",
  },
];

// ── Hierarchy Pairs ─────────────────────────────────────────────────
// Hypernym↔hyponym relationships (concrete and abstract).

const HIERARCHY_PAIRS: ConceptPair[] = [
  // Concrete hypernym↔hyponym
  {
    id: "hierarchy-animal-poodle",
    from: "animal",
    to: "poodle",
    category: "hierarchy",
    concreteness: ["concrete", "concrete"],
    relationalType: "hierarchical",
    polysemy: "unambiguous",
    set: "reporting",
    notes: "Concrete hypernym→hyponym; clear taxonomic chain",
  },
  {
    id: "hierarchy-vehicle-skateboard",
    from: "vehicle",
    to: "skateboard",
    category: "hierarchy",
    concreteness: ["concrete", "concrete"],
    relationalType: "hierarchical",
    polysemy: "unambiguous",
    set: "holdout",
    notes: "Concrete hypernym→hyponym; less prototypical exemplar",
  },
  // Abstract hypernym↔hyponym
  {
    id: "hierarchy-emotion-nostalgia",
    from: "emotion",
    to: "nostalgia",
    category: "hierarchy",
    concreteness: ["abstract", "abstract"],
    relationalType: "hierarchical",
    polysemy: "unambiguous",
    set: "reporting",
    notes: "Abstract hypernym→hyponym; complex affective concept",
  },
  {
    id: "hierarchy-structure-lattice",
    from: "structure",
    to: "lattice",
    category: "hierarchy",
    concreteness: ["abstract", "abstract"],
    relationalType: "hierarchical",
    polysemy: "unambiguous",
    set: "holdout",
    notes: "Abstract hypernym→hyponym; mathematical/architectural",
  },
];

// ── Cross-Domain Pairs ──────────────────────────────────────────────
// Concepts drawn from different semantic domains.

const CROSS_DOMAIN_PAIRS: ConceptPair[] = [
  {
    id: "cross-music-mathematics",
    from: "music",
    to: "mathematics",
    category: "cross-domain",
    concreteness: ["abstract", "abstract"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "reporting",
    notes: "Cross-domain abstract↔abstract; rich metaphorical bridges",
  },
  {
    id: "cross-cooking-architecture",
    from: "cooking",
    to: "architecture",
    category: "cross-domain",
    concreteness: ["concrete", "concrete"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "holdout",
    notes: "Cross-domain concrete↔concrete; structural metaphors possible",
  },
  {
    id: "cross-justice-erosion",
    from: "justice",
    to: "erosion",
    category: "cross-domain",
    concreteness: ["abstract", "concrete"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "reporting",
    notes: "Cross-domain abstract↔concrete; tests figurative bridging",
  },
  {
    id: "cross-time-crystal",
    from: "time",
    to: "crystal",
    category: "cross-domain",
    concreteness: ["abstract", "concrete"],
    relationalType: "cross-domain",
    polysemy: "unambiguous",
    set: "holdout",
    notes: "Cross-domain abstract↔concrete; physics bridge possible",
  },
];

// ── Polysemy Pairs ──────────────────────────────────────────────────
// Same ambiguous word paired differently to steer sense activation.

const POLYSEMY_PAIRS: ConceptPair[] = [
  // "bank" — financial vs. geographical
  {
    id: "polysemy-bank-river",
    from: "bank",
    to: "river",
    category: "polysemy",
    concreteness: ["concrete", "concrete"],
    relationalType: "associative",
    polysemy: "ambiguous",
    set: "reporting",
    polysemyGroup: "bank",
    notes: "Polysemy test: should activate geographical sense of 'bank'",
  },
  {
    id: "polysemy-bank-mortgage",
    from: "bank",
    to: "mortgage",
    category: "polysemy",
    concreteness: ["concrete", "abstract"],
    relationalType: "associative",
    polysemy: "ambiguous",
    set: "holdout",
    polysemyGroup: "bank",
    notes: "Polysemy test: should activate financial sense of 'bank'",
  },
  // "bat" — animal vs. sports equipment
  {
    id: "polysemy-bat-cave",
    from: "bat",
    to: "cave",
    category: "polysemy",
    concreteness: ["concrete", "concrete"],
    relationalType: "associative",
    polysemy: "ambiguous",
    set: "holdout",
    polysemyGroup: "bat",
    notes: "Polysemy test: should activate animal sense of 'bat'",
  },
  {
    id: "polysemy-bat-baseball",
    from: "bat",
    to: "baseball",
    category: "polysemy",
    concreteness: ["concrete", "concrete"],
    relationalType: "associative",
    polysemy: "ambiguous",
    set: "reporting",
    polysemyGroup: "bat",
    notes: "Polysemy test: should activate sports equipment sense of 'bat'",
  },
  // "crane" — machine vs. bird
  {
    id: "polysemy-crane-construction",
    from: "crane",
    to: "construction",
    category: "polysemy",
    concreteness: ["concrete", "concrete"],
    relationalType: "associative",
    polysemy: "ambiguous",
    set: "reporting",
    polysemyGroup: "crane",
    notes: "Polysemy test: should activate machine sense of 'crane'",
  },
  {
    id: "polysemy-crane-wetland",
    from: "crane",
    to: "wetland",
    category: "polysemy",
    concreteness: ["concrete", "concrete"],
    relationalType: "associative",
    polysemy: "ambiguous",
    set: "holdout",
    polysemyGroup: "crane",
    notes: "Polysemy test: should activate bird sense of 'crane'",
  },
];

// ── Near-Synonym Pairs ──────────────────────────────────────────────
// Dense semantic neighborhoods; tests whether models navigate friction.

const NEAR_SYNONYM_PAIRS: ConceptPair[] = [
  {
    id: "synonym-cemetery-graveyard",
    from: "cemetery",
    to: "graveyard",
    category: "near-synonym",
    concreteness: ["concrete", "concrete"],
    relationalType: "near-synonym",
    polysemy: "unambiguous",
    set: "reporting",
    notes: "Near-synonym concrete pair; minimal semantic distance",
  },
  {
    id: "synonym-forest-woods",
    from: "forest",
    to: "woods",
    category: "near-synonym",
    concreteness: ["concrete", "concrete"],
    relationalType: "near-synonym",
    polysemy: "unambiguous",
    set: "holdout",
    notes: "Near-synonym concrete pair; subtle connotation difference",
  },
  {
    id: "synonym-happy-joyful",
    from: "happy",
    to: "joyful",
    category: "near-synonym",
    concreteness: ["abstract", "abstract"],
    relationalType: "near-synonym",
    polysemy: "unambiguous",
    set: "reporting",
    notes: "Near-synonym abstract pair; intensity gradient",
  },
  {
    id: "synonym-anger-rage",
    from: "anger",
    to: "rage",
    category: "near-synonym",
    concreteness: ["abstract", "abstract"],
    relationalType: "near-synonym",
    polysemy: "unambiguous",
    set: "holdout",
    notes: "Near-synonym abstract pair; intensity gradient",
  },
];

// ── Antonym Pairs ───────────────────────────────────────────────────
// Oppositional continua; tests whether models traverse the axis.

const ANTONYM_PAIRS: ConceptPair[] = [
  {
    id: "antonym-hot-cold",
    from: "hot",
    to: "cold",
    category: "antonym",
    concreteness: ["concrete", "concrete"],
    relationalType: "antonym",
    polysemy: "unambiguous",
    set: "reporting",
    notes: "Antonym continuum; scalar opposition on temperature axis",
  },
  {
    id: "antonym-order-chaos",
    from: "order",
    to: "chaos",
    category: "antonym",
    concreteness: ["abstract", "abstract"],
    relationalType: "antonym",
    polysemy: "unambiguous",
    set: "holdout",
    notes: "Antonym continuum; abstract opposition",
  },
];

// ── Control: Identity Pairs ─────────────────────────────────────────
// Same concept to itself — expected: trivial/degenerate paths.

const CONTROL_IDENTITY_PAIRS: ConceptPair[] = [
  {
    id: "control-identity-apple",
    from: "apple",
    to: "apple",
    category: "control-identity",
    concreteness: ["concrete", "concrete"],
    relationalType: "associative",
    polysemy: "unambiguous",
    set: "reporting",
    notes: "Identity control; concrete self-pair — expect degenerate path",
  },
  {
    id: "control-identity-justice",
    from: "justice",
    to: "justice",
    category: "control-identity",
    concreteness: ["abstract", "abstract"],
    relationalType: "associative",
    polysemy: "unambiguous",
    set: "holdout",
    notes: "Identity control; abstract self-pair — expect degenerate path",
  },
];

// ── Control: Random Unrelated Pairs ─────────────────────────────────
// Noise floor — no expected semantic bridge.

const CONTROL_RANDOM_PAIRS: ConceptPair[] = [
  {
    id: "control-random-stapler-monsoon",
    from: "stapler",
    to: "monsoon",
    category: "control-random",
    concreteness: ["concrete", "concrete"],
    relationalType: "associative",
    polysemy: "unambiguous",
    set: "reporting",
    notes: "Random control; no expected semantic bridge",
  },
  {
    id: "control-random-parliament-cinnamon",
    from: "parliament",
    to: "cinnamon",
    category: "control-random",
    concreteness: ["abstract", "concrete"],
    relationalType: "associative",
    polysemy: "unambiguous",
    set: "holdout",
    notes: "Random control; no expected semantic bridge",
  },
  {
    id: "control-random-telescope-jealousy",
    from: "telescope",
    to: "jealousy",
    category: "control-random",
    concreteness: ["concrete", "abstract"],
    relationalType: "associative",
    polysemy: "unambiguous",
    set: "reporting",
    notes: "Random control; concrete→abstract with no bridge",
  },
  {
    id: "control-random-shoelace-democracy",
    from: "shoelace",
    to: "democracy",
    category: "control-random",
    concreteness: ["concrete", "abstract"],
    relationalType: "associative",
    polysemy: "unambiguous",
    set: "reporting",
    notes: "Random control; concrete→abstract noise pair",
  },
  {
    id: "control-random-flamingo-calculus",
    from: "flamingo",
    to: "calculus",
    category: "control-random",
    concreteness: ["concrete", "abstract"],
    relationalType: "associative",
    polysemy: "unambiguous",
    set: "reporting",
    notes: "Random control; concrete→abstract noise pair",
  },
  {
    id: "control-random-umbrella-photosynthesis",
    from: "umbrella",
    to: "photosynthesis",
    category: "control-random",
    concreteness: ["concrete", "abstract"],
    relationalType: "associative",
    polysemy: "unambiguous",
    set: "reporting",
    notes: "Random control; concrete→abstract noise pair",
  },
  {
    id: "control-random-origami-gravity",
    from: "origami",
    to: "gravity",
    category: "control-random",
    concreteness: ["concrete", "abstract"],
    relationalType: "associative",
    polysemy: "unambiguous",
    set: "reporting",
    notes: "Random control; concrete→abstract noise pair",
  },
];

// ── Control: Nonsense Token Pairs ───────────────────────────────────
// Shuffled token strings — baseline for parser/extraction sanity.

const CONTROL_NONSENSE_PAIRS: ConceptPair[] = [
  {
    id: "control-nonsense-xkplm-qrvzt",
    from: "xkplm",
    to: "qrvzt",
    category: "control-nonsense",
    concreteness: ["abstract", "abstract"],
    relationalType: "associative",
    polysemy: "unambiguous",
    set: "reporting",
    notes: "Nonsense control; tests model behavior with non-words",
  },
  {
    id: "control-nonsense-bwfnj-tlmgk",
    from: "bwfnj",
    to: "tlmgk",
    category: "control-nonsense",
    concreteness: ["abstract", "abstract"],
    relationalType: "associative",
    polysemy: "unambiguous",
    set: "holdout",
    notes: "Nonsense control; tests model behavior with non-words",
  },
];

// ── Aggregate & Exports ─────────────────────────────────────────────

/**
 * All concept pairs in the benchmark.
 */
export const ALL_PAIRS: ConceptPair[] = [
  ...ANCHOR_PAIRS,
  ...HIERARCHY_PAIRS,
  ...CROSS_DOMAIN_PAIRS,
  ...POLYSEMY_PAIRS,
  ...NEAR_SYNONYM_PAIRS,
  ...ANTONYM_PAIRS,
  ...CONTROL_IDENTITY_PAIRS,
  ...CONTROL_RANDOM_PAIRS,
  ...CONTROL_NONSENSE_PAIRS,
];

/**
 * Holdout set (~15 pairs) — used only for prompt format selection.
 * Evenly distributed across categories to avoid selection bias.
 */
export const HOLDOUT_PAIRS: ConceptPair[] = ALL_PAIRS.filter(
  (p) => p.set === "holdout",
);

/**
 * Reporting set (~23 pairs) — used for all published analyses.
 */
export const REPORTING_PAIRS: ConceptPair[] = ALL_PAIRS.filter(
  (p) => p.set === "reporting",
);

/**
 * Retrieve pairs belonging to a specific category.
 */
export function getPairsByCategory(category: PairCategory): ConceptPair[] {
  return ALL_PAIRS.filter((p) => p.category === category);
}

// ── Model Configurations ────────────────────────────────────────────

export const MODELS: ModelConfig[] = [
  {
    id: "claude",
    openRouterId: "anthropic/claude-sonnet-4.6",
    displayName: "Claude Sonnet 4.6",
  },
  {
    id: "gpt",
    openRouterId: "openai/gpt-5.2",
    displayName: "GPT-5.2",
  },
  {
    id: "grok",
    openRouterId: "x-ai/grok-4.1-fast",
    displayName: "Grok 4.1 Fast",
  },
  {
    id: "gemini",
    openRouterId: "google/gemini-3-flash-preview",
    displayName: "Gemini 3 Flash",
  },
];

/**
 * Phase 10A: New models for model generality testing.
 * Separate from MODELS array for backward compatibility.
 */
export const NEW_MODELS: ModelConfig[] = [
  {
    id: "minimax",
    openRouterId: "minimax/minimax-m2.5",
    displayName: "MiniMax M2.5",
  },
  {
    id: "kimi",
    openRouterId: "moonshotai/kimi-k2.5",
    displayName: "Moonshot Kimi K2.5",
  },
  {
    id: "glm",
    openRouterId: "z-ai/glm-5",
    displayName: "GLM 5",
  },
  {
    id: "qwen",
    openRouterId: "qwen/qwen3.5-397b-a17b",
    displayName: "Qwen 3.5 397B-A17B",
  },
  {
    id: "llama",
    openRouterId: "meta-llama/llama-3.1-8b-instruct",
    displayName: "Llama 3.1 8B Instruct",
  },
];
