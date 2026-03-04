# Roadmap

Exploration-first project. Phases 1-3 are complete; phase 4+ follows the most interesting signal. Same process as word-convergence-game's 5 rounds.

## Completed
- [x] **Phase 1: Waypoint elicitation engine + pilot data** — Engine built, 2,480 runs collected across 4 models and 21 pairs. Core finding: models have distinct conceptual gaits (2.2x consistency gap between Claude and GPT), clean control validation. See `findings/01-pilot-analysis.md`.
- [x] **Phase 2: Reversals & path consistency** — 960 runs (840 reverse + 120 polysemy supplementary). Core finding: navigation is fundamentally asymmetric (mean 0.811). Conceptual space is quasimetric. See `findings/02-reversals.md` and `findings/02-reversals-analysis.md`.
- [x] **Phase 3: Positional convergence + transitive path structure** — Part A: pure analysis showing dual-anchor effect (U-shaped convergence, refining starting-point hypothesis). Part B: 600 new runs across 8 concept triples showing hierarchical compositionality (4.9× over random), triangle inequality holding (91%), and model-dependent bridge concept connectivity. See `findings/03a-positional-convergence.md`, `findings/03b-transitivity.md`, and `findings/03-analysis.md`.
- [x] **Phase 4: Cross-model bridge topology + targeted Gemini investigation** — Part A: pure analysis of inter-model bridge agreement (Pearson r range 0.340-0.772, Gemini isolation index 0.136). Part B: 1,520 new runs across 8 targeted triples showing 81.3% prediction accuracy, universal concrete bridging (spectrum 100% all models), universal abstract bridge failure (metaphor 0% all models), and pervasive Gemini fragmentation beyond abstract/concrete divide. See `findings/04a-bridge-agreement.md` and `findings/04b-targeted-bridges.md`.

## Planned
- [ ] **Phase 5: [Follow the data]** — Direction determined by Phase 4 findings. Top candidates ranked by signal strength:
  1. **Dimensionality probing** — How many independent axes structure each model's conceptual space? Use MDS on pairwise navigational distances to estimate dimensionality.
  2. **Chain length scaling** — Does transitivity scale with chain length? Test 3-hop and 5-hop chains to see if compositionality degrades or holds.
  3. **Gemini cue threshold** — What makes a bridge "strong enough" for Gemini? Test gradient from concrete→abstract bridges.
  4. **Higher-resolution convergence** — 7wp or 9wp paths for finer-grained positional analysis of the dual-anchor effect.
  5. **Paper writing** — Four phases of findings now provide enough material for a comprehensive paper.

## Deferred
- Semantic similarity optimization — refactor embedding analysis to embed-once/lookup-many (see `_deferred/semantic-similarity-optimization.md`)
- ConceptNet path comparison / external anchoring (see `_deferred/external-anchors.md`)
- Multi-agent waypoint negotiation (see `_deferred/multi-agent.md`)
- Embedding distance validation (see `_deferred/embedding-validation.md`)
- Multilingual conceptual topology (see `_deferred/multilingual.md`)
- Curvature estimation from path data (see `_deferred/curvature.md`)
- Paper writing & positioning (see `_deferred/paper.md`)
