# State

## Current Phase
Phase 1: Waypoint elicitation engine + pilot data — not started

## Context
- Research survey complete (`research.md`) — covers embedding geometry, navigation/interpolation, compositionality, consistency/directionality, trajectory dynamics, cognitive science, cross-model comparison, closest benchmarks
- Word convergence game (575 games, 4 models) provides empirical foundation — characteristic gaits, semantic basins, direction-dependence, cross-model novelty
- Core thesis: nobody tests whether LLMs can *navigate* conceptual space consistently. Static embedding analysis ≠ behavioral navigation.

## Key Design Decisions
- **Exploration-first workflow** — phases follow the most interesting data signal, not a fixed plan
- **Reuse word-convergence anchor pairs** for cross-experiment comparability (formation, network, echo basins)
- **Distributional evaluation** — multiple runs per pair, compare distributions not single paths
- **OpenRouter for multi-model access** — same stack as word-convergence-game

## Blockers
None

## Next Steps
- Write phase 1 spec
- Build waypoint elicitation engine (prompt design, API calls, result storage)
- Curate initial concept pair set
- Run pilot experiments
