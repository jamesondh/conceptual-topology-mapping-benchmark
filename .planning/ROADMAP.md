# Roadmap

Exploration-first project. Phases 1-4 are complete; phase 5 implementation ready. Same process as word-convergence-game's 5 rounds.

## Completed
- [x] **Phase 1: Waypoint elicitation engine + pilot data** — Engine built, 2,480 runs collected across 4 models and 21 pairs. Core finding: models have distinct conceptual gaits (2.2x consistency gap between Claude and GPT), clean control validation. See `findings/01-pilot-analysis.md`.
- [x] **Phase 2: Reversals & path consistency** — 960 runs (840 reverse + 120 polysemy supplementary). Core finding: navigation is fundamentally asymmetric (mean 0.811). Conceptual space is quasimetric. See `findings/02-reversals.md` and `findings/02-reversals-analysis.md`.
- [x] **Phase 3: Positional convergence + transitive path structure** — Part A: pure analysis showing dual-anchor effect (U-shaped convergence, refining starting-point hypothesis). Part B: 600 new runs across 8 concept triples showing hierarchical compositionality (4.9× over random), triangle inequality holding (91%), and model-dependent bridge concept connectivity. See `findings/03a-positional-convergence.md`, `findings/03b-transitivity.md`, and `findings/03-analysis.md`.
- [x] **Phase 4: Cross-model bridge topology + targeted Gemini investigation** — Part A: pure analysis of inter-model bridge agreement (Pearson r range 0.340-0.772, Gemini isolation index 0.136). Part B: 1,520 new runs across 8 targeted triples showing 81.3% prediction accuracy, universal concrete bridging (spectrum 100% all models), universal abstract bridge failure (metaphor 0% all models), and pervasive Gemini fragmentation beyond abstract/concrete divide. Interpretive analysis develops frame-crossing hypothesis and sharpens bridge concept definition (bottleneck vs association). See `findings/04a-bridge-agreement.md`, `findings/04b-targeted-bridges.md`, and `findings/04-analysis.md`.

## In Progress
- [ ] **Phase 5: Cue-strength thresholds and conceptual dimensionality** — Implementation complete, awaiting experiment execution. Three-part design following Phase 4's strongest signals. Spec: `.planning/phases/05-cue-strength-and-dimensionality/SPEC.md`.
  - **Part A: Cue-strength thresholds** (~1,680 runs) — 4 controlled families (fixed A/C, varied bridge B at 3-4 cue levels) + 2 random controls. Logistic curve fitting per model. Pre-registered test: Gemini's threshold significantly higher than other models'.
  - **Part B: Dimensionality probing** (~960 runs) — 3 focal concepts ("light", "bank", "fire") with same-axis vs cross-axis bridge frequency. First empirical dimensionality estimate. Pre-registered test: same-axis minus cross-axis delta > 0.40.
  - **Part C: Triple-anchor convergence** (~640 runs) — 8 pairs with 7-waypoint bidirectional paths testing W-shape hypothesis (bridge concepts as third convergence anchor). Natural within-pair experiment on music→mathematics. Pre-registered test: W-shape contrast > 0.02 for bridge-present pairs.
  - Total: ~3,280 runs, ~$10-14, ~20-25 min runtime.
  - Run: `bun run phase5`

## Deferred
- Semantic similarity optimization — refactor embedding analysis to embed-once/lookup-many (see `_deferred/semantic-similarity-optimization.md`)
- ConceptNet path comparison / external anchoring (see `_deferred/external-anchors.md`)
- Multi-agent waypoint negotiation (see `_deferred/multi-agent.md`)
- Embedding distance validation (see `_deferred/embedding-validation.md`)
- Multilingual conceptual topology (see `_deferred/multilingual.md`)
- Curvature estimation from path data (see `_deferred/curvature.md`)
- Paper writing & positioning (see `_deferred/paper.md`)
