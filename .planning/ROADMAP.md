# Roadmap

Exploration-first project. Phases 1-3 are complete; phase 4+ follows the most interesting signal. Same process as word-convergence-game's 5 rounds.

## Completed
- [x] **Phase 1: Waypoint elicitation engine + pilot data** — Engine built, 2,480 runs collected across 4 models and 21 pairs. Core finding: models have distinct conceptual gaits (2.2x consistency gap between Claude and GPT), clean control validation. See `findings/01-pilot-analysis.md`.
- [x] **Phase 2: Reversals & path consistency** — 960 runs (840 reverse + 120 polysemy supplementary). Core finding: navigation is fundamentally asymmetric (mean 0.811). Conceptual space is quasimetric. See `findings/02-reversals.md` and `findings/02-reversals-analysis.md`.
- [x] **Phase 3: Positional convergence + transitive path structure** — Part A: pure analysis showing dual-anchor effect (U-shaped convergence, refining starting-point hypothesis). Part B: 600 new runs across 8 concept triples showing hierarchical compositionality (4.9× over random), triangle inequality holding (91%), and model-dependent bridge concept connectivity. See `findings/03a-positional-convergence.md`, `findings/03b-transitivity.md`, and `findings/03-analysis.md`.

## Planned
- [ ] **Phase 4: [Follow the data]** — Direction determined by Phase 3 findings. Top candidates ranked by signal strength:
  1. **Dimensionality probing** — How many independent axes structure each model's conceptual space? Use MDS on pairwise navigational distances to estimate dimensionality.
  2. **Chain length scaling** — Does transitivity scale with chain length? Test 3-hop and 5-hop chains to see if compositionality degrades or holds.
  3. **Cross-model bridge agreement** — Do models agree on which concepts are navigational bridges? Correlate bridge frequencies across model pairs.
  4. **Higher-resolution convergence** — 7wp or 9wp paths for finer-grained positional analysis of the dual-anchor effect.
  5. **Targeted Gemini investigation** — All 3 triangle inequality violations occur in Gemini. Why? Test more triples with Gemini to characterize its fragmented topology.

## Deferred
- Semantic similarity optimization — refactor embedding analysis to embed-once/lookup-many (see `_deferred/semantic-similarity-optimization.md`)
- ConceptNet path comparison / external anchoring (see `_deferred/external-anchors.md`)
- Multi-agent waypoint negotiation (see `_deferred/multi-agent.md`)
- Embedding distance validation (see `_deferred/embedding-validation.md`)
- Multilingual conceptual topology (see `_deferred/multilingual.md`)
- Curvature estimation from path data (see `_deferred/curvature.md`)
- Paper writing & positioning (see `_deferred/paper.md`)
