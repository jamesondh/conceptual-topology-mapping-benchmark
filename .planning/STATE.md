# State

## Current Phase
Phase 10: Model Generality and Pre-Fill Relation Classes — **IMPLEMENTED, AWAITING EXECUTION**

## Context
- Research survey complete (`research.md`)
- Word convergence game (575 games, 4 models) provides empirical foundation
- Core thesis: no benchmark systematically evaluates whether LLMs can *navigate* conceptual space consistently
- **All 9 phases complete. ~18,000 total API runs across 4 models.**
- **Phase 10 code implemented and code-reviewed. Awaiting experiment execution.**

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
- **Code implemented and code-reviewed. Awaiting experiment execution.**
- **Part A — Model Generality:** Tests whether core structural findings (R1-R7) generalize to 5 new models (MiniMax M2.5, Kimi K2.5, GLM 5, Qwen 3.5, Llama 3.1 8B) via OpenRouter. Two-stage design: probe reliability → full elicitation. 8 forward pairs + 4 reverse pairs, 10 reps each. ~1200 API calls (if all 5 models pass probes).
- **Part B — Pre-Fill Relation Classes:** Tests three-way taxonomy (on-axis substitute, same-domain off-axis, unrelated) for predicting bridge survival under pre-fill. 8 pairs × 3 conditions × 4 original models × 10 reps = 960 API calls. Friedman test + Wilcoxon signed-rank for blocked non-parametric comparison.
- **New files:** `src/data/pairs-phase10.ts`, `experiments/10a-model-generality.ts`, `experiments/10b-relation-classes.ts`, `analysis/10a-model-generality.ts`, `analysis/10b-relation-classes.ts`
- **Codex review:** 7 issues identified, 6 fixed (data validity guards, probe resume, connectivity misreport, seeded bootstrap, batchId tagging, cohort granularity).

## Key Design Decisions
- Exploration-first workflow — phases follow the most interesting data signal
- Phases 8-9 establish that single-variable mechanistic models are inadequate (6/6 hypotheses fail)
- Dead ends tracked in `GRAVEYARD.md` (25 entries G1-G25 across Phases 1-9)
- All major claims cataloged in `findings/CLAIMS.md` ([robust], [observed], [hypothesis])

## Blockers
None

## Next Steps
- **Execute Phase 10** — Run `bun run model-generality` (probe stage first), then `bun run relation-classes`, then analysis scripts
- **Paper writing** — 10 phases of data support a four-act narrative (structure → topology → mechanism → limits), plus generality test
- Consider multiverse robustness analysis before paper (R1-R7 across different waypoint counts, prompts, temperatures)
- Consider embedding-based distance approach (may rescue cross-model geometry where path-based failed)
