# Roadmap

Exploration-first project. Phases 1-5 complete; Phase 6 implemented, awaiting data collection. Same process as word-convergence-game's 5 rounds.

## Completed
- [x] **Phase 1: Waypoint elicitation engine + pilot data** — Engine built, 2,480 runs collected across 4 models and 21 pairs. Core finding: models have distinct conceptual gaits (2.2x consistency gap between Claude and GPT), clean control validation. See `findings/01-pilot-analysis.md`.
- [x] **Phase 2: Reversals & path consistency** — 960 runs (840 reverse + 120 polysemy supplementary). Core finding: navigation is fundamentally asymmetric (mean 0.811). Conceptual space is quasimetric. See `findings/02-reversals.md` and `findings/02-reversals-analysis.md`.
- [x] **Phase 3: Positional convergence + transitive path structure** — Part A: pure analysis showing dual-anchor effect (U-shaped convergence, refining starting-point hypothesis). Part B: 600 new runs across 8 concept triples showing hierarchical compositionality (4.9× over random), triangle inequality holding (91%), and model-dependent bridge concept connectivity. See `findings/03a-positional-convergence.md`, `findings/03b-transitivity.md`, and `findings/03-analysis.md`.
- [x] **Phase 4: Cross-model bridge topology + targeted Gemini investigation** — Part A: pure analysis of inter-model bridge agreement (Pearson r range 0.340-0.772, Gemini isolation index 0.136). Part B: 1,520 new runs across 8 targeted triples showing 81.3% prediction accuracy, universal concrete bridging (spectrum 100% all models), universal abstract bridge failure (metaphor 0% all models), and pervasive Gemini fragmentation beyond abstract/concrete divide. Interpretive analysis develops frame-crossing hypothesis and sharpens bridge concept definition (bottleneck vs association). See `findings/04a-bridge-agreement.md`, `findings/04b-targeted-bridges.md`, and `findings/04-analysis.md`.
- [x] **Phase 5: Cue-strength thresholds and conceptual dimensionality** — 3,720 new runs + 200 reused across 36 triples and 8 convergence pairs. Core findings: cue-strength gradient is real but ragged (12/16 monotonic); germination outperforms plant (process-naming > object-naming); Gemini threshold hypothesis fails; forced crossing discovery (loan-bank-shore at 0.95-1.00); fire is dead as bridge concept; W-shape fails in aggregate but Claude shows 0.52 contrast on music→mathematics; prediction accuracy drops to 42.9% as experiments shift from characterization to mechanism. Revised bridge taxonomy adds process-naming, forced-crossing, and too-central categories. See `findings/05a-cue-strength.md`, `findings/05b-dimensionality.md`, `findings/05c-convergence.md`, and `findings/05-analysis.md`.

## In Progress
- [ ] **Phase 6: Navigational salience mapping and forced crossings** — Implementation complete, awaiting data collection. Three-part design following Phase 5's strongest signals. Spec: `.planning/phases/06-navigational-salience-and-forced-crossings/SPEC.md`.
  - **Part A: Navigational salience mapping** (~1,200 runs) — `experiments/06a-salience.ts` + `analysis/06a-salience.ts`. Empirical waypoint frequency distributions for 8 pairs. KS test, cross-model agreement, retroactive calibration.
  - **Part B: Forced-crossing asymmetry test** (~640 runs) — `experiments/06b-forced-crossing.ts` + `analysis/06b-forced-crossing.ts`. Forward/reverse paths for 4 forced-crossing + 4 same-axis pairs. Bootstrap CI on asymmetry difference.
  - **Part C: Positional bridge scanning** (~400 new + reuse) — `experiments/06c-positional.ts` + `analysis/06c-positional.ts`. Peak-detection contrast, positional prediction, cross-model agreement. Reuses Phase 5C data for 5 primary pairs.
  - Total: ~2,240 new runs + Phase 5C reuse, ~$7.50-10.50, ~18-22 min runtime.
  - Run: `bun run phase6`

## Deferred
- Semantic similarity optimization — refactor embedding analysis to embed-once/lookup-many (see `_deferred/semantic-similarity-optimization.md`)
- ConceptNet path comparison / external anchoring (see `_deferred/external-anchors.md`)
- Multi-agent waypoint negotiation (see `_deferred/multi-agent.md`)
- Embedding distance validation (see `_deferred/embedding-validation.md`)
- Multilingual conceptual topology (see `_deferred/multilingual.md`)
- Curvature estimation from path data (see `_deferred/curvature.md`)
- Paper writing & positioning (see `_deferred/paper.md`)
- Chain length scaling (from Phase 4 recommendations)
- "Too-central" phenomenon investigation (from Phase 5 analysis)
