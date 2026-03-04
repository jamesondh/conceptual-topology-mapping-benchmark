# Roadmap

Exploration-first project. Phases 1-2 are concrete; phase 3+ follows the most interesting signal. Same process as word-convergence-game's 5 rounds.

## Completed
- [x] **Phase 1: Waypoint elicitation engine + pilot data** — Engine built, 2,480 runs collected across 4 models and 21 pairs. Core finding: models have distinct conceptual gaits (2.2x consistency gap between Claude and GPT), clean control validation. See `findings/01-pilot-analysis.md`.
- [x] **Phase 2: Reversals & path consistency** — 960 runs (840 reverse + 120 polysemy supplementary). Core finding: navigation is fundamentally asymmetric (mean 0.811). 4/8 category predictions matched. The "starting-point hypothesis" — models construct paths forward from the starting concept rather than finding "the" path — explains the full asymmetry gradient. Polysemy sense differentiation confirmed with supplementary data. Conceptual space is quasimetric. See `findings/02-reversals.md` and `findings/02-reversals-analysis.md`.

## Planned
- [ ] **Phase 3: [Follow the data]** — Direction determined by Phase 2 findings. Top candidates ranked by signal strength:
  1. **Triangle inequality testing** — Does d(A,C) ≤ d(A,B) + d(B,C)? Tests whether the quasimetric structure has triangle inequality. Would establish stronger geometric claims.
  2. **Positional asymmetry analysis** — Direct test of starting-point hypothesis. Analyze which waypoints appear at each position (wp1-wp5) across directions. If starting point dominates, wp1 should be strongly direction-dependent while wp5 converges.
  3. **Model-specific asymmetry topology** — Which pairs are asymmetric for which models? The hierarchy result (Grok 0.271 vs Claude 0.818 on animal-poodle) suggests model-dependent topology.
  4. **Random-pair gradient** — Test more random pairs to map the baseline asymmetry distribution.
  5. **Scale-dependent topology** — Compare 3wp, 5wp, 7wp paths for scale effects on asymmetry.

## Deferred
- Semantic similarity optimization — refactor embedding analysis to embed-once/lookup-many (see `_deferred/semantic-similarity-optimization.md`)
- ConceptNet path comparison / external anchoring (see `_deferred/external-anchors.md`)
- Multi-agent waypoint negotiation (see `_deferred/multi-agent.md`)
- Embedding distance validation (see `_deferred/embedding-validation.md`)
- Multilingual conceptual topology (see `_deferred/multilingual.md`)
- Curvature estimation from path data (see `_deferred/curvature.md`)
- Paper writing & positioning (see `_deferred/paper.md`)
