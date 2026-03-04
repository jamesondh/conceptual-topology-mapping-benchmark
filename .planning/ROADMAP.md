# Roadmap

Exploration-first project. Phases 1-6 complete; Phase 7 specified, awaiting implementation. Same process as word-convergence-game's 5 rounds.

## Completed
- [x] **Phase 1: Waypoint elicitation engine + pilot data** — Engine built, 2,480 runs collected across 4 models and 21 pairs. Core finding: models have distinct conceptual gaits (2.2x consistency gap between Claude and GPT), clean control validation. See `findings/01-pilot-analysis.md`.
- [x] **Phase 2: Reversals & path consistency** — 960 runs (840 reverse + 120 polysemy supplementary). Core finding: navigation is fundamentally asymmetric (mean 0.811). Conceptual space is quasimetric. See `findings/02-reversals.md` and `findings/02-reversals-analysis.md`.
- [x] **Phase 3: Positional convergence + transitive path structure** — Part A: pure analysis showing dual-anchor effect (U-shaped convergence, refining starting-point hypothesis). Part B: 600 new runs across 8 concept triples showing hierarchical compositionality (4.9× over random), triangle inequality holding (91%), and model-dependent bridge concept connectivity. See `findings/03a-positional-convergence.md`, `findings/03b-transitivity.md`, and `findings/03-analysis.md`.
- [x] **Phase 4: Cross-model bridge topology + targeted Gemini investigation** — Part A: pure analysis of inter-model bridge agreement (Pearson r range 0.340-0.772, Gemini isolation index 0.136). Part B: 1,520 new runs across 8 targeted triples showing 81.3% prediction accuracy, universal concrete bridging (spectrum 100% all models), universal abstract bridge failure (metaphor 0% all models), and pervasive Gemini fragmentation beyond abstract/concrete divide. See `findings/04a-bridge-agreement.md`, `findings/04b-targeted-bridges.md`, and `findings/04-analysis.md`.
- [x] **Phase 5: Cue-strength thresholds and conceptual dimensionality** — 3,720 new runs + 200 reused across 36 triples and 8 convergence pairs. Core findings: cue-strength gradient real but ragged; germination outperforms plant; Gemini threshold hypothesis fails; forced crossing discovery; fire dead as bridge; W-shape null in aggregate. See `findings/05a-cue-strength.md`, `findings/05b-dimensionality.md`, `findings/05c-convergence.md`, and `findings/05-analysis.md`.
- [x] **Phase 6: Navigational salience mapping and forced crossings** — 2,080 new runs + 280 reused across 8 salience pairs, 8 asymmetry pairs, 10 positional pairs. Core findings: salience distributions non-uniform (7/8 KS reject); forced-crossing asymmetry hypothesis falsified (0.817 ≈ 0.811 baseline); bridge concepts anchor early (position 1-2, not midpoint); peak-detection contrast 0.345 vindicates Phase 5C; forced-crossing bridges positionally unstable (SD 1.71 vs 0.52); GPT highest entropy (3.44); Gemini financial-frame routing on bank-ocean. See `findings/06a-salience.md`, `findings/06b-forced-crossing.md`, `findings/06c-positional.md`, and `findings/06-analysis.md`.

## In Progress
- [ ] **Phase 7: Early anchoring and navigational mechanics** — Specification complete, awaiting implementation. Three-part design following Phase 6's strongest signals. Spec: `.planning/phases/07-early-anchoring-and-navigational-mechanics/SPEC.md`.
  - **Part A: Early-anchoring causal test** (~1,260 runs) — Pre-filled waypoint manipulation with 3 conditions (incongruent, congruent, neutral) to distinguish directional-heading from associative-primacy accounts. 8 focal pairs including animal-poodle (taxonomic control) and loan-shore (forced-crossing control).
  - **Part B: Curvature estimation around polysemous hubs** (~760 runs) — Triangle inequality excess for 4 polysemous-vertex vs 4 non-polysemous-vertex triangles. Includes distance-metric validity checks.
  - **Part C: Too-central boundary characterization** (~480 runs) — 10-pair gradient from known too-central (spark-ash, acorn-timber) to known obvious-useful (hot-cold, infant-elderly) with 4 boundary cases.
  - Total: ~2,500 new runs, ~$8-12, ~20-25 min runtime.

## Deferred
- Semantic similarity optimization — refactor embedding analysis to embed-once/lookup-many (see `_deferred/semantic-similarity-optimization.md`)
- ConceptNet path comparison / external anchoring (see `_deferred/external-anchors.md`)
- Multi-agent waypoint negotiation (see `_deferred/multi-agent.md`)
- Embedding distance validation (see `_deferred/embedding-validation.md`)
- Multilingual conceptual topology (see `_deferred/multilingual.md`)
- Curvature estimation from path data — partially addressed by Phase 7B (see `_deferred/curvature.md`)
- Paper writing & positioning (see `_deferred/paper.md`)
- Chain length scaling (from Phase 4 recommendations)
- Full-resolution cross-model agreement (from Phase 6 analysis)
- Temporal stability replication (from Phase 6 analysis)
