# State

## Current Phase
Phase 1: Waypoint elicitation engine + pilot data — not started

## Context
- Research survey complete (`research.md`) — covers embedding geometry, navigation/interpolation, compositionality, consistency/directionality, trajectory dynamics, cognitive science, cross-model comparison, closest benchmarks
- Word convergence game (575 games, 4 models) provides empirical foundation — characteristic gaits, semantic basins, direction-dependence, cross-model novelty
- Core thesis: to our knowledge, no benchmark systematically evaluates whether LLMs can *navigate* conceptual space consistently. Static embedding analysis ≠ behavioral navigation.
- Phase 1 spec reviewed by Codex (GPT) — incorporated feedback on controls, stratified pair design, metric validity, prompt format confounds, reproducibility metadata, and sample size

## Key Design Decisions
- **Exploration-first workflow** — phases follow the most interesting data signal, not a fixed plan
- **Reuse word-convergence anchor pairs** for cross-experiment comparability (formation, network, echo basins)
- **Distributional evaluation** — multiple runs per pair (10-20 reps), compare distributions not single paths
- **Controls from day one** — identity, random, nonsense pairs establish baselines before claiming geometry
- **Holdout split** — prompt format selected on holdout pairs, findings reported on separate set
- **Small external anchor subset** — ConceptNet comparison on ~10 pairs to check self-grounding circularity early
- **OpenRouter for multi-model access** — log exact model IDs, provider routes, full decoding params

## Blockers
None

## Next Steps
- Build waypoint elicitation engine (prompt design, API calls, result storage, canonicalization)
- Implement stratified concept pair set with metadata
- Run prompt format selection on holdout pairs
- Run main pilot experiments
