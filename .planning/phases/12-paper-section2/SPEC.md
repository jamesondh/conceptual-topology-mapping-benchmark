# Phase 12: Paper Section 2 — The Benchmark

## Goal
Write Section 2 of the paper (`writeup/sections/02-benchmark.md`), the methodology section that defines the evaluation paradigm precisely enough for replication. This is the load-bearing section — all terms, metrics, and procedures referenced throughout the paper are established here.

## Risk Level
Medium — text-heavy, touches many details spread across the codebase, but no experiments or API calls.

## Files

### Create
- `writeup/sections/02-benchmark.md` — The full Section 2 draft

### Read (reference)
- `writeup/outline.md` — Section 2 spec (lines 62-123)
- `src/index.ts` — Prompt templates (`buildPrompt` function)
- `src/canonicalize.ts` — Canonicalization pipeline
- `src/metrics.ts` — All metric implementations
- `src/types.ts` — Type definitions (ConceptPair, ElicitationResult, etc.)
- `src/data/pairs.ts` — MODELS, NEW_MODELS, PHASE11_MODELS + pair definitions
- `findings/CLAIMS.md` — Claim registry for cross-referencing
- Various `src/data/pairs-phase*.ts` files for pair counts per phase

### Update
- `.planning/STATE.md` — Add Phase 12 entry

## Structure (per outline)

### 2.1 Waypoint Elicitation
- Task definition: given A and B, produce N intermediate waypoints
- Exact prompt text (both "semantic" and "direct" formats, from `buildPrompt`)
- Default parameters: 7 waypoints, temperature 0.7, 20 runs per condition (10 in later phases)
- Self-grounding explanation
- Comparison to prior paradigms (word analogy, free association, convergence games)
- Why this is not free association (endpoint-conditioned navigation vs local spreading activation)

### 2.2 Derived Metrics
- **Gait consistency (Jaccard):** Formal definition from `computeJaccard`. Pairwise across runs, averaged. Range [0,1]. Include the lexical limitation caveat prominently.
- **Path asymmetry:** Cross-direction Jaccard from `crossDirectionJaccards`. Asymmetry = 1 - mean cross-Jaccard.
- **Bridge frequency:** From `computeBridgeFrequency`. Fraction of A→C runs containing bridge B. Uses fuzzy matching (word boundary, token).
- **Triangle inequality:** From `computeTransitivityMetrics`. Navigational distance d(X→Y) = 1 - mean within-direction Jaccard. Test: d(A,C) ≤ d(A,B) + d(B,C).
- **Transitivity:** From `computeWaypointTransitivity`. Jaccard(waypoints(A→C), waypoints(A→B) ∪ waypoints(B→C)).
- **Positional profile:** From `computePerPositionBridgeFreq`. Distribution of bridge position across N-waypoint sequence.
- **Pre-fill displacement:** Change in bridge frequency when waypoint 1 is pre-filled. Survival rate = pre-fill freq / unconstrained freq.

> Table 1: Metric Definitions — columns: Metric, Formal Definition, Range, Interpretation, Key Limitation

### 2.3 Concept Pair Selection
- Categories with examples: antonym (hot-cold), hierarchical (animal-poodle), polysemous (bank-river vs bank-loan), near-synonym (happy-joyful), cross-domain (music-mathematics), control-random, control-nonsense
- Bridge concept types: bottleneck, gradient midpoint, causal-chain, too-central
- Scale: 36 Phase 1 pairs (15 holdout + 21 reporting), expanding to 100+ unique pairs across 11 phases
- Canonicalization pipeline from `canonicalize.ts`: lowercase → strip articles → lemmatize (compromise NLP) → normalize whitespace → strip trailing punctuation → deduplicate

### 2.4 Model Selection
- Table with all 12 models: id, OpenRouter model string, display name, approximate scale, cohort, phases included
- Accessed via OpenRouter API; uniform interface for all models
- Note on Llama 3.1 8B as the sole small-scale model

> Table 2: Model Summary — columns: Model, Provider, Approx Scale, Cohort, Phases, Total Runs

### 2.5 Experimental Phases
- Brief overview of the 11-phase exploration-first workflow
- Each phase followed the most interesting signal from the previous one

> Table 3: Phase Summary — columns: Phase, Name, New Runs, Key Question, Primary Finding

### 2.6 Validity and Evidential Strategy
- What this is NOT measuring
- Why waypoint elicitation measures navigation (not association)
- Self-grounding and circularity mitigation (metric axioms, cross-model comparison, causal intervention)
- Paradigm limitations: lexical metrics, prompt sensitivity, API-mediated access

## Writing Approach

1. Write in academic paper style (third person, past tense for methods, present tense for definitions)
2. Use precise numbers from the codebase — no approximations
3. Include placeholder markers for tables: `[TABLE 1]`, `[TABLE 2]`, `[TABLE 3]`
4. Include statistical caveat boxes where the outline flags them (especially lexical Jaccard limitation, ksTestUniform naming)
5. Target ~3,000-4,000 words (appropriate for a methodology section in a 12,000-15,000 word paper)

## Docs to Update
- `.planning/STATE.md` — add Phase 12 status

## Verify
1. All metric definitions match the actual code implementations
2. Prompt templates match `buildPrompt` exactly
3. Model list matches `MODELS`, `NEW_MODELS`, `PHASE11_MODELS`
4. Canonicalization pipeline matches `canonicalize()` exactly
5. Run Codex CLI review on the drafted section

## Done When
- `writeup/sections/02-benchmark.md` exists with complete Section 2 draft
- Codex review completed and recommended fixes applied
- Committed and pushed
