# Roadmap

Exploration-first project. Phases 1-2 are concrete; phase 3+ follows the most interesting signal. Same process as word-convergence-game's 5 rounds.

## Completed
<!-- Completed phases move here -->

## In Progress
- [ ] **Phase 1: Waypoint elicitation engine + pilot data** — Build the core primitive (prompt model with concept pair, get ordered waypoints). Run across 4+ models on curated pairs (reusing word-convergence anchors + new). Test prompt formats, waypoint counts, variance across repeated runs.

## Planned
- [ ] **Phase 2: Reversals & path consistency** — Run every pair in both directions (A→B, B→A). Compute path overlap, edit distance, asymmetry structure. Correlate with word-convergence direction findings and reversal curse predictions.
- [ ] **Phase 3: [Follow the data]** — Direction determined by phases 1-2 findings. Candidates: triangle inequality testing, asymmetry topology deep dive, PRH behavioral test (cross-model geodesic comparison), scale-dependent topology.

## Deferred
- ConceptNet path comparison / external anchoring (see `_deferred/external-anchors.md`)
- Multi-agent waypoint negotiation (see `_deferred/multi-agent.md`)
- Embedding distance validation (see `_deferred/embedding-validation.md`)
- Multilingual conceptual topology (see `_deferred/multilingual.md`)
- Curvature estimation from path data (see `_deferred/curvature.md`)
- Paper writing & positioning (see `_deferred/paper.md`)
