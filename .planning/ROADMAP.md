# Roadmap

Exploration-first project. Phases 1-2 are concrete; phase 3+ follows the most interesting signal. Same process as word-convergence-game's 5 rounds.

## Completed
- [x] **Phase 1: Waypoint elicitation engine + pilot data** — Engine built, 2,480 runs collected across 4 models and 21 pairs. Core finding: models have distinct conceptual gaits (2.2x consistency gap between Claude and GPT), perfect polysemy sense differentiation, clean control validation. See `findings/01-pilot-analysis.md`.

## In Progress
- [ ] **Phase 2: Reversals & path consistency** — Run every pair in both directions (A→B, B→A). Compute path overlap, edit distance, asymmetry structure. Correlate with word-convergence direction findings and reversal curse predictions.

## Planned
- [ ] **Phase 3: [Follow the data]** — Direction determined by phases 1-2 findings. Candidates: triangle inequality testing, asymmetry topology deep dive, PRH behavioral test (cross-model geodesic comparison), scale-dependent topology.

## Deferred
- Semantic similarity optimization — refactor embedding analysis to embed-once/lookup-many (see `_deferred/semantic-similarity-optimization.md`)
- ConceptNet path comparison / external anchoring (see `_deferred/external-anchors.md`)
- Multi-agent waypoint negotiation (see `_deferred/multi-agent.md`)
- Embedding distance validation (see `_deferred/embedding-validation.md`)
- Multilingual conceptual topology (see `_deferred/multilingual.md`)
- Curvature estimation from path data (see `_deferred/curvature.md`)
- Paper writing & positioning (see `_deferred/paper.md`)
