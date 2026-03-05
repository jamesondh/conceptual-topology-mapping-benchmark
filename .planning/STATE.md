# State

## Current Phase
Phase 7: Early Anchoring and Navigational Mechanics — **COMPLETE** (analysis written)
Phase 8: Bridge Fragility and Gemini Gradient Blindness — **SPEC WRITTEN**, awaiting implementation

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

## Phase 7 Summary
- **2,360 new runs + 920 reused** across 8 anchoring pairs (4 conditions each), 8 curvature triangles, 10 too-central pairs, 4 models
- **Pre-filling causally displaces bridges** — Mean displacement 0.515, CI excludes zero; taxonomic control resists (0.140 vs 0.515); bridge survival 0.460 under pre-fill
- **Mechanism is primarily associative primacy** — Incongruent 0.515 vs congruent 0.436 vs neutral 0.536; CIs overlap; survival rates show some sensitivity (congruent 0.631 > incongruent 0.347)
- **Bridge fragility is bimodal** — Harmony/germination collapse (0.000-0.025); sadness/dog survive (0.750-0.900); route exclusivity proposed as mechanism (H8)
- **Claude shows highest displacement** (0.567), consistent with rigidity producing strongest anchoring effects
- **Triangle inequality replicates at 90.6%** — Phase 3B was 91%, Phase 4B was 93.8%; structural constant of conceptual space
- **Polysemous ≈ non-polysemous curvature** — Excess 0.499 vs 0.446, CI includes zero; polysemous curvature hypothesis falsified
- **Cross-model distance validity FAILS** — r = 0.170, far below 0.50 threshold; navigational distances are not cross-model comparable
- **Too-central categorization was wrong** — Tree/dough are obvious-useful, not too-central; only fire and water qualify
- **Rain-ocean "water" universally too-central** (0.000 all models) — Generalizes O6 beyond fire
- **Gradient > causal-chain** (0.730 vs 0.496) — Spectrum midpoints more navigational than process intermediaries
- **Gemini systematic zeros on "obvious" bridges** — tree, dough, speak, water, noon all 0.000 for Gemini while other models ≥ 0.80
- **Prediction accuracy 45%** (9/20) — Structural predictions ~75%, mechanistic predictions ~25%
- See `findings/07-analysis.md` for full interpretive analysis

## Key Design Decisions
- Exploration-first workflow — phases follow the most interesting data signal
- Phase 6 revised bridge model: "launching pad" not "narrow passage"
- Phase 7 Part A adds 3 control conditions per Codex review recommendations
- Phase 7 Part B includes distance-metric validity checks before curvature interpretation
- Phase 7 analysis identifies associative primacy as primary mechanism, with possible congruence modulation
- Dead ends tracked in `GRAVEYARD.md` (19 entries G1-G19 across Phases 1-7)
- All major claims cataloged in `findings/CLAIMS.md` ([robust], [observed], [hypothesis])

## Blockers
None

## Next Steps
- Implement Phase 8 (bridge fragility mechanism, Gemini gradient blindness, gait-normalized distance)
- Consider paper writing (see `_deferred/paper.md`)
