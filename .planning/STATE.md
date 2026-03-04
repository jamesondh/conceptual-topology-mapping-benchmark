# State

## Current Phase
Phase 5: Cue-Strength Thresholds and Conceptual Dimensionality — **COMPLETE**
Phase 6: Navigational Salience and Forced Crossings — **SPEC READY** (awaiting implementation)

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
- **Cue-strength gradient is real but ragged** — 12/16 monotonic; biological-growth family inverted
- **Germination > plant** — Process-naming bridges outperform object-naming bridges (navigational salience ≠ associative strength)
- **Gemini threshold hypothesis FAILS** — Gemini threshold 1.79 not significantly different from others (mean 2.05, CI [-1.00, 1.07])
- **Forced crossing discovery** — loan-bank-shore at 0.95-1.00 (cross-axis > same-axis, driven by bank)
- **Fire is dead** — Near-zero bridge frequency in all configs (sole exception: GPT 0.15 on spark-fire-ash)
- **W-shape fails in aggregate** — But Claude shows 0.52 contrast on music→mathematics (strongest positional signal)
- **Prediction accuracy drops** — 64.6% (5A), 42.9% (5B) as experiments move from characterization to mechanism
- **Bridge frequency and transitivity are decoupled** — Different aspects of compositional structure
- See `findings/05-analysis.md` for full interpretive analysis

## Phase 6 Plan
Spec: `.planning/phases/06-navigational-salience-and-forced-crossings/SPEC.md`
- **Part A: Navigational salience mapping** (~1,200 runs) — Empirical waypoint frequency distributions for 8 well-studied pairs. Heavy-tail test. Cross-model agreement.
- **Part B: Forced-crossing asymmetry** (~640 runs) — Forward/reverse paths for 4 forced-crossing + 4 same-axis pairs. Test bottleneck asymmetry reduction.
- **Part C: Positional bridge scanning** (~480 runs) — Peak-detection replacement for fixed-midpoint W-shape test. Bridge position regression on semantic distance.
- Total: ~2,320 runs, ~$7.50-10.50, ~18-22 min

## Key Design Decisions
- Exploration-first workflow — phases follow the most interesting data signal
- Phase 5 revised bridge taxonomy: process-naming, forced-crossing, too-central (new categories)
- Phase 6 uses within-phase same-axis comparison as primary test (not cross-phase baseline)

## Blockers
None — Phase 6 spec ready, awaiting implementation

## Next Steps
- Implement Phase 6 (types, experiments, analyses)
- Run `bun run phase6` (~$7.50-10.50, ~18-22 min)
- Write interpretive analysis after data collected
