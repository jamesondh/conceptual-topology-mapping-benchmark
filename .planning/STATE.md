# State

## Current Phase
Phase 6: Navigational Salience and Forced Crossings — **COMPLETE**
Phase 7: Early Anchoring and Navigational Mechanics — **IMPLEMENTED** (awaiting experiment run)

## Context
- Research survey complete (`research.md`)
- Word convergence game (575 games, 4 models) provides empirical foundation
- Core thesis: no benchmark systematically evaluates whether LLMs can *navigate* conceptual space consistently

## Phase 1-4 Summary (Condensed)
1. **Models have distinct gaits** — Claude 0.578 avg Jaccard vs GPT 0.258 (2.2x gap)
2. **Navigation is fundamentally asymmetric** — Mean asymmetry 0.811. Conceptual space is quasimetric.
3. **Dual-anchor hypothesis** — Both endpoints anchor paths (U-shaped convergence pattern)
4. **Hierarchical triples are compositional** — Transitivity 0.175 vs random controls 0.036 (4.9×)
5. **Triangle inequality holds** — 91% of cases. Violations concentrated in Gemini.
6. **Bridge concept frequency is model-dependent** — Claude: "harmony" 100% on music→math; Gemini: 0%.
7. **Prediction accuracy 81.3%** — Concrete bridges universal, abstract bridges fail universally.
8. **Gemini fragmentation pervasive** — Frame-crossing hypothesis: Gemini fails at conceptual frame boundaries.

## Phase 5 Summary
- **3,720 new runs + 200 reused** across 36 triples, 8 convergence pairs, 4 models
- Cue-strength gradient real but ragged (12/16 monotonic); germination > plant; Gemini threshold fails
- Forced crossing discovery (loan-bank-shore at 0.95-1.00); fire is dead; W-shape aggregate null
- Prediction accuracy drops to 42.9% as experiments shift from characterization to mechanism
- See `findings/05-analysis.md` for full interpretive analysis

## Phase 6 Summary
- **2,080 new runs + 280 reused** across 8 salience pairs, 8 asymmetry pairs, 10 positional pairs, 4 models
- **Navigational salience distributions are non-uniform** — 7/8 pairs reject uniformity (KS test); H6 upgraded to O11
- **Forced-crossing asymmetry hypothesis FAILS** — FC mean 0.817 ≈ SA mean 0.810 ≈ Phase 2 baseline 0.811; H4 falsified
- **Bridge concepts anchor early (position 1-2, 0-indexed)** — Peak-detection contrast 0.345 vs fixed-midpoint -0.080; vindicates Phase 5C
- **Animal-poodle exception** — Taxonomic bridges anchor at hierarchically appropriate position (4-5)
- **Forced-crossing bridges are positionally unstable** — SD 1.71 vs 0.52 for non-forced
- **GPT has highest entropy** (3.44), not Grok as predicted; Claude near-deterministic (2.59)
- **Gemini routes bank-ocean through financial frame** — vault/treasure/gold, not geographic concepts
- **Prediction accuracy ~40%** — Structural predictions succeed (~80%), point predictions fail (~25%)
- See `findings/06-analysis.md` for full interpretive analysis

## Phase 7 Implementation
Spec: `.planning/phases/07-early-anchoring-and-navigational-mechanics/SPEC.md`
- **Part A: Early-anchoring causal test** (~1,260 runs) — Pre-filled waypoint manipulation with 3 conditions (incongruent, congruent, neutral)
- **Part B: Curvature estimation** (~760 runs) — Triangle inequality excess around polysemous vs non-polysemous hubs
- **Part C: Too-central boundary** (~480 runs) — Gradient from "obvious and useful" to "obvious and redundant" bridges
- Total: ~2,500 new runs, ~$8-12, ~20-25 min runtime
- **Implementation:** Types, data definitions, experiment scripts (07a/07b/07c), analysis scripts (07a/07b/07c), package.json scripts all complete
- **Codex review:** 10 issues found (2 critical, 3 high, 4 medium, 1 low). Critical and high issues fixed: pair-ID mismatches in 7C analysis, wrong reusable leg IDs in 7B, peak detection excluding position 0, index-aligned condition comparison, bank-ocean undersampling

## Key Design Decisions
- Exploration-first workflow — phases follow the most interesting data signal
- Phase 6 revised bridge model: "launching pad" not "narrow passage"
- Phase 7 Part A adds 3 control conditions per Codex review recommendations
- Phase 7 Part B includes distance-metric validity checks before curvature interpretation
- Dead ends tracked in `GRAVEYARD.md` (15 entries across Phases 1-6)
- All major claims cataloged in `findings/CLAIMS.md` ([robust], [observed], [hypothesis])

## Blockers
None

## Next Steps
- Run Phase 7 experiments (`bun run phase7` or individual sub-experiments)
- Write interpretive analysis (findings/07-analysis.md)
- Update CLAIMS.md with Phase 7 findings
