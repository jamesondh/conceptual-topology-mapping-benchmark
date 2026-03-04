# State

## Current Phase
Phase 5: Cue-Strength Thresholds and Conceptual Dimensionality — **IMPLEMENTATION COMPLETE** (awaiting experiment execution)

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

## Phase 5 Implementation

### Infrastructure Built
- `triples-phase5.ts` — 36 definitions: 14 cue-strength triples (4 families + 2 controls), 14 dimensionality triples (3 focal concepts + 2 controls), 8 convergence pairs
- `experiments/05a-cue-strength.ts` — Cue-strength gradient experiment (~1,680 runs), data reuse for emotion-nostalgia-melancholy triple
- `experiments/05b-dimensionality.ts` — Dimensionality probing experiment (~960 AC-only runs)
- `experiments/05c-convergence.ts` — Triple-anchor convergence experiment (~640 runs, 7-waypoint paths, bidirectional)
- `analysis/05a-cue-strength.ts` — Logistic curve fitting, threshold estimation, Gemini comparison, monotonicity check
- `analysis/05b-dimensionality.ts` — Same-axis vs cross-axis comparison, dimension counting, per-focal-concept breakdown
- `analysis/05c-convergence.ts` — Positional convergence profiles, W-shape detection, bridge-variable natural experiment
- New types in `types.ts` — Phase5CueStrengthTriple, Phase5DimensionalityTriple, Phase5ConvergencePair, LogisticFitResult, CueStrengthAnalysisOutput, DimensionalityAnalysisOutput, ConvergenceAnalysisOutput
- New metrics in `metrics.ts` — fitLogistic (gradient descent logistic curve fitting), computeWShapeContrast (W-shape detection)

### Codex Review Fixes Applied
1. Fixed logistic gradient sign in `fitLogistic` (was doing ascent, not descent)
2. Excluded random-control triples from same/cross-axis comparison in 05b analysis
3. Proper bootstrap for Gemini threshold CI (resample data and refit, not just resample point estimates)
4. Bridge-present aggregation in 05c respects `bridgeModels` (excludes Gemini from tree→ecosystem)
5. Replaced `Math.random()` with `seededRandom()` in 05b bootstrap for reproducibility

## Key Design Decisions
- Exploration-first workflow — phases follow the most interesting data signal
- Three-part phase: Part A (cue-strength), Part B (dimensionality), Part C (convergence)
- Data reuse for emotion-nostalgia-melancholy from Phase 1/3B
- AC-only collection for Part B (AB/BC optional follow-up)
- 7-waypoint paths for Part C (higher resolution than Phase 3A's 5-waypoint)

## Blockers
None — implementation complete, ready to run experiments

## Next Steps
- Run `bun run phase5` to execute all three experiments and analyses (~$10-14, ~20-25 min)
- Write interpretive analysis (`findings/05-analysis.md`) after experiment data collected
- Plan Phase 6 based on Phase 5 findings
