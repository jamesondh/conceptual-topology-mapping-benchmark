# State

## Current Phase
Phase 4: Cross-Model Bridge Topology + Targeted Gemini Investigation — **COMPLETE**

## Context
- Research survey complete (`research.md`)
- Word convergence game (575 games, 4 models) provides empirical foundation
- Core thesis: no benchmark systematically evaluates whether LLMs can *navigate* conceptual space consistently

## Phase 1-3 Summary (Condensed)
1. **Models have distinct gaits** — Claude 0.578 avg Jaccard vs GPT 0.258 (2.2x gap)
2. **Navigation is fundamentally asymmetric** — Mean asymmetry 0.811. Conceptual space is quasimetric.
3. **Dual-anchor hypothesis** — Both endpoints anchor paths (U-shaped convergence pattern)
4. **Hierarchical triples are compositional** — Transitivity 0.175 vs random controls 0.036 (4.9×)
5. **Triangle inequality holds** — 91% of cases. Violations concentrated in Gemini.
6. **Bridge concept frequency is model-dependent** — Claude: "harmony" 100% on music→math; Gemini: 0%.

## Phase 4 Summary

### Data Collected
- **Part A (bridge agreement)**: Pure analysis of Phase 3B data (0 new API calls). 6 model pairs × 8 triples.
- **Part B (targeted bridges)**: 1,520 new runs across 8 concept triples × 4 models × 10-20 reps. 320 reused runs from prior phases.

### Key Findings
1. **Prediction accuracy 81.3%** — 26/32 model×triple bridge frequency predictions matched. Misses concentrated on abstract triples and Gemini.
2. **Concrete bridges are universal** — "spectrum" on light→color: 100% across all 4 models. "forest" on tree→ecosystem: 95-100% for 3 models.
3. **Abstract bridges fail universally** — "metaphor" on language→thought: 0% for ALL models. Association ≠ navigational bridging.
4. **Gemini fragmentation is pervasive** — Not limited to abstract concepts. Gemini misses "forest" (0.10) and "river" (0.00) even for concrete/polysemy triples. Only succeeds with strongly-cued bridges (deposit→savings: 1.00, spectrum→color: 1.00).
5. **Inter-model bridge agreement** — Claude-GPT highest (r=0.772), Grok-Gemini lowest (r=0.340). Gemini isolation index: 0.136.
6. **Controls validate perfectly** — Random bridge concepts never appear (0% across all 8 random-control observations).
7. **No temporal drift** — Cross-batch Jaccard within 0.1 of within-batch for all top-up legs, validating data pooling across phases.
8. **Polysemy sense consistency** — Financial sense of "bank" (deposit→savings) shows 100% bridge frequency across ALL models including Gemini, while geographic sense shows Gemini-specific failure.

### Interpretive Analysis
- `findings/04-analysis.md` — Deep interpretive analysis covering bridge topology landscape, frame-crossing hypothesis for Gemini fragmentation, the "metaphor" surprise (association ≠ navigation), cross-model topology families, and prediction accuracy validation. Reviewed by Codex; all critical/important fixes applied.

### Infrastructure Built
- `triples-phase4.ts` — 8 Phase 4 triple definitions with predictions and diagnostic types
- `analysis/04a-bridge-agreement.ts` — cross-model bridge agreement analysis
- `experiments/04b-targeted-bridges.ts` — targeted bridge experiment with top-up logic
- `analysis/04b-targeted-bridges.ts` — targeted bridge analysis with prediction evaluation
- New metrics in `metrics.ts` — cross-model Jaccard, bridge-removed Jaccard, Pearson correlation, bridge frequency bootstrap CI, seededRandom

## Key Design Decisions
- Exploration-first workflow — phases follow the most interesting data signal
- Two-part phase: Part A (free analysis, 0 API cost) → Part B (new experiment, ~$5)
- Data reuse strategy with direction-filtered lookups (fixed cross-contamination bug from Phase 3 triple iteration)
- Phase 3B pair ID format uses double-dash (`triple-id--legId`); Phase 4 triples reference this correctly

## Blockers
None

## Next Steps
- **Phase 5: Cue-Strength Thresholds and Conceptual Dimensionality** — Spec complete (`.planning/phases/05-cue-strength-and-dimensionality/SPEC.md`). Three-part design:
  1. **Part A: Cue-strength thresholds** (~1,680 runs) — Controlled families with fixed endpoints, varied bridge cue strength. Tests whether Gemini's fragmentation boundary is a cue-strength threshold (logistic curve fitting per model).
  2. **Part B: Dimensionality probing** (~960 runs) — Same-axis vs cross-axis bridge frequency around polysemous ("light", "bank") and non-polysemous ("fire") focal concepts. First empirical estimate of conceptual space dimensionality.
  3. **Part C: Triple-anchor convergence** (~640 runs) — 7-waypoint paths testing W-shape hypothesis: do bridge concepts create a third convergence anchor? Natural within-pair experiment on music→mathematics (model-dependent bridge).
