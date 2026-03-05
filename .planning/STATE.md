# State

## Current Phase
Phase 10: Model Generality and Pre-Fill Relation Classes — **COMPLETE**

## Context
- Research survey complete (`research.md`)
- Word convergence game (575 games, 4 models) provides empirical foundation
- Core thesis: no benchmark systematically evaluates whether LLMs can *navigate* conceptual space consistently
- **All 10 phases complete. ~19,000 total API runs across 5 models.**
- **Benchmark empirical program is complete. Paper writing is the next priority.**

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

## Phase 8 Summary (Condensed)
- All three primary hypotheses fail: route exclusivity (G20), gradient blindness (G21), gait normalization (G22)
- O17 replicates (gradient 0.770 vs causal 0.578)
- Prediction accuracy 24% — single-variable mechanistic models fail

## Phase 9 Summary
- **3,037 new runs + ~5,270 reused** across 14 dominance pairs, 20 transformation/gradient pairs, 14 facilitation pairs, 4 models
- **Dominance ratio hypothesis FAILS (G23)** — Combined rho=0.157, CI includes zero. Warm (ratio 1.00) destroyed, fermentation (ratio 1.07) bulletproof.
- **Transformation-chain blindness FAILS BACKWARD (G24)** — Gemini transformation mean 0.667 > gradient mean 0.293. Interaction -0.290, wrong direction.
- **Facilitation crossover FAILS primary test (G25 partial)** — Slope -3.355, CI includes zero. But facilitation for marginal bridges is real (mean 3.761x survival).
- **O17 FAILS third replication** — Transformation 0.699 > gradient 0.543 (reversed). Pair-specific, not type-general.
- **Pre-fill content modulates survival for some pairs (O21)** — Corrected Phase 7A comparison (congruent-to-congruent) shows 5/8 replicate. Content is secondary modulator, not primary driver.
- **Prediction accuracy 20%** (5/25) — Slightly below Phase 8's 24%. Mechanism ceiling confirmed.
- **New observations:** O21 (pre-fill content modulates magnitude), O22 (marginal facilitation), O23 (bridge specification > type), O24 (prediction plateau at ~20-24%)

## Phase 10 Summary
- **1,140 new runs + 778 reused** across 5 new models (10A) and 4 core models (10B), 12 generality pairs and 8 relation-class pairs
- **Part A — Model Generality (180 runs, Llama only):** 4/5 new models failed on OpenRouter latency (69-133s). Only Llama 3.1 8B passed (1.5s). R1 (gait) replicates at 0.298, R2 (asymmetry) replicates at 0.785, cross-model Jaccard 0.145 confirms shared structure. But bridge frequency gap is massive: Llama 0.200 vs original cohort 0.817 (CI excludes zero). **Structural universals confirmed; navigational content is model-specific.**
- **Part B — Pre-Fill Relation Classes (960 runs):** Friedman test significant (p=0.034) — taxonomy captures real variance. Predicted ordering WRONG: actual is unrelated (0.388) < on-axis (0.643) ≈ same-domain (0.708). Unrelated pre-fills most disruptive. Warm/fermentation replications perfect (within 0.026 of Phase 9A).
- **Prediction accuracy 33% (6/18)** — structural replications succeed, mechanism predictions fail. Consistent with benchmark pattern.
- **New observations:** O25 (structure generalizes, content doesn't), O26 (relation class affects survival — unrelated most destructive)
- **Graveyard:** G26 (bridge generalization fails), G27 (predicted ordering wrong)

## Key Design Decisions
- Exploration-first workflow — phases follow the most interesting data signal
- Phases 8-10 establish that single-variable mechanistic models are inadequate (8/8 hypotheses fail at primary test level)
- Dead ends tracked in `GRAVEYARD.md` (27 entries G1-G27 across Phases 1-10)
- All major claims cataloged in `findings/CLAIMS.md` ([robust], [observed], [hypothesis])
- Structure/content boundary is the capstone finding: geometric structure is universal, navigational landmarks are model-specific

## Blockers
None

## Next Steps
- **Paper writing** — 10 phases of data support a five-act narrative (structure → topology → mechanism → limits → generality). 7 robust claims, 26 observations, 27 graveyard entries.
- Consider multiverse robustness analysis before paper (R1-R7 across different waypoint counts, prompts, temperatures)
- Consider embedding-based distance approach (may rescue cross-model geometry where path-based failed)
- Consider retesting failed probe models via native APIs (bypassing OpenRouter latency bottleneck)
