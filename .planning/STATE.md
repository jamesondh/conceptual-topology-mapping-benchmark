# State

## Current Phase
Phase 8: Bridge Fragility and Gemini Gradient Blindness — **COMPLETE** (experiments run, analysis written)
Phase 9: Bridge Dominance, Transformation Chains, and Pre-Fill Facilitation — **SPEC WRITTEN**, awaiting implementation

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

## Phase 5-7 Summary (Condensed)
- **Phase 5:** Cue-strength gradient real (12/16 monotonic); germination > plant; forced crossing discovery; fire dead; prediction accuracy drops to 42.9%
- **Phase 6:** Salience non-uniform (7/8 KS reject); forced-crossing asymmetry falsified; bridges anchor early (position 1-2); GPT highest entropy
- **Phase 7:** Pre-filling causally displaces bridges (0.515, CI excludes zero); bridge fragility bimodal; triangle inequality replicates at 90.6%; cross-model distance fails (r=0.170); gradient > causal-chain (0.730 vs 0.496)

## Phase 8 Summary
- **2,690 new runs + 2,960 reused** across 14 fragility pairs, 20 gradient/causal pairs, 16 distance pairs, 4 models
- **Route exclusivity hypothesis FAILS (G20)** — Competitor count does not predict bridge survival (rho = 0.116); sadness survives with 8 competitors, harmony collapses with 7
- **Gemini gradient blindness FAILS BACKWARD (G21)** — Gemini zeros concentrate on causal-chain pairs (6/10), not gradient pairs (1/10); interaction 0.046 (CI includes zero)
- **Gait normalization produces ZERO improvement (G22)** — Normalized r = 0.212 = raw r; disagreement is structural (ordinal), not scalar; model-independent geometry definitively blocked
- **O17 replicates** — Gradient 0.770 vs causal 0.578, diff 0.193 (CI [0.010, 0.360])
- **6/8 prospective pairs fail evaluability** — A priori bridge prediction remains unreliable after 8 phases
- **Pre-fill facilitation discovered** — science-art "creativity" survival 5.200; pre-filling can INCREASE marginal bridge frequency (H11)
- **Gemini's deficit is transformation-chain specific (H10)** — Fails on material/biological process intermediaries, succeeds on gradient midpoints
- **New hypotheses:** H9 (dominance ratio predicts fragility), H10 (transformation-chain blindness), H11 (pre-fill facilitation crossover)
- **Prediction accuracy 24%** (6/25) — Worst in benchmark history; single-variable mechanistic models fail
- See `findings/08-analysis.md` for full interpretive analysis

## Key Design Decisions
- Exploration-first workflow — phases follow the most interesting data signal
- Phase 8 establishes that single-variable mechanistic models are inadequate
- Dead ends tracked in `GRAVEYARD.md` (22 entries G1-G22 across Phases 1-8)
- All major claims cataloged in `findings/CLAIMS.md` ([robust], [observed], [hypothesis])

## Blockers
None

## Next Steps
- Implement Phase 9 (spec at `.planning/phases/09-bridge-dominance-and-transformation-chains/SPEC.md`)
- Execute Phase 9 experiments (dominance, transformation, facilitation)
- Write Phase 9 findings and analysis
- Consider paper writing — 8 phases of data support a four-act narrative (structure → topology → mechanism → limits)
