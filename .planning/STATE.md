# State

## Current Phase
Phase 1: Waypoint elicitation engine + pilot data — **complete**

## Context
- Research survey complete (`research.md`)
- Word convergence game (575 games, 4 models) provides empirical foundation
- Core thesis: no benchmark systematically evaluates whether LLMs can *navigate* conceptual space consistently

## Phase 1 Summary

### What We Built
- OpenRouter engine with retry logic, batch runner, CLI (`index.ts`)
- 36 concept pairs across 9 categories, holdout/reporting split (`pairs.ts`)
- Multi-strategy canonicalization pipeline (`canonicalize.ts`)
- Prompt selection experiment on 15 holdout pairs → selected "semantic" format
- Pilot experiment: 2,480 runs (21 pairs × 4 models × 2 waypoint counts × 10-20 reps)
- Analysis pipeline with metrics computation and findings generation (`analysis/01-pilot.ts`)

### Key Findings
1. **Models have distinct gaits** — Claude 0.578 avg Jaccard vs GPT 0.258 (2.2x gap)
2. **Polysemy → perfect sense differentiation** — cross-pair Jaccard = 0.000 for all 3 groups
3. **Cross-model paths are genuinely different** — all pairs show ~0.17-0.20 Jaccard
4. **Controls validate cleanly** — nonsense near-zero, antonyms highest, random intermediate
5. **Waypoint scaling is coherent** — 70.5% shared, 67.9% subsequence rate (5→10wp)
6. **Category hierarchy** — antonym > hierarchy > near-synonym > cross-domain > polysemy > anchor

### What Was Skipped
- Embedding-based semantic similarity (see `_deferred/semantic-similarity-optimization.md`)

### Artifacts
- `findings/01-pilot.md` — auto-generated metrics report
- `findings/01-pilot-analysis.md` — detailed interpretive analysis
- `results/analysis/pilot-metrics.json` — full metrics data (716KB)

## Key Design Decisions
- Exploration-first workflow — phases follow the most interesting data signal
- Reuse word-convergence anchor pairs for cross-experiment comparability
- Distributional evaluation — 10-20 reps per pair, compare distributions not single paths
- Controls from day one — identity, random, nonsense baselines
- Holdout split — prompt format selected on holdout, findings on reporting set

## Blockers
None

## Next Steps
- Phase 2: Reversals & path consistency (A→B vs B→A)
