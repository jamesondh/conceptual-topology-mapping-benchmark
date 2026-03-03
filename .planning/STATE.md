# State

## Current Phase
Phase 2: Reversals & path consistency — **implemented, ready to run**

## Context
- Research survey complete (`research.md`)
- Word convergence game (575 games, 4 models) provides empirical foundation
- Core thesis: no benchmark systematically evaluates whether LLMs can *navigate* conceptual space consistently

## Phase 1 Summary

### Key Findings
1. **Models have distinct gaits** — Claude 0.578 avg Jaccard vs GPT 0.258 (2.2x gap)
2. **Polysemy → sense differentiation** — cross-pair Jaccard = 0.000 (but see errata below)
3. **Cross-model paths are genuinely different** — all pairs show ~0.17-0.20 Jaccard
4. **Controls validate cleanly** — nonsense near-zero, antonyms highest, random intermediate

### Phase 1 Errata (fixed in Phase 2)
- Polysemy "perfect sense differentiation" was an artifact — holdout pairs had no pilot data, producing false zeros. Supplementary runs added in Phase 2 to properly test.
- Extraction count not enforced — overlong extractions included in metrics. Now truncated (lenient mode) with optional strict filtering.
- File writes were non-atomic — now use write-then-rename pattern.

## Phase 2 Implementation

### What We Built
- **Scheduler** (`scheduler.ts`) — global + per-model concurrency control, replacing sequential batch execution. Default 8 global / 2 per-model. ~4x faster than Phase 1.
- **Metrics module** (`metrics.ts`) — asymmetry metrics: cross-direction Jaccard, bootstrap CIs, permutation tests, direction-exclusive waypoints, normalized Levenshtein, Spearman's rho.
- **Experiment script** (`experiments/02-reversals.ts`) — 960 runs: 840 reverse (21 pairs × 4 models × 10 reps) + 120 polysemy supplementary (3 holdout pairs × 4 models × 10 reps). Resume support, atomic writes.
- **Analysis script** (`analysis/02-reversals.ts`) — loads forward (5wp/semantic only) + reverse data, computes per-pair/model asymmetry, tests category-level predictions, generates findings report.
- **Data quality fixes** — extraction count enforcement, atomic writes, polysemy false-zero fix, pair count doc fix.

### Category Predictions Being Tested
| Category | Prediction | Rationale |
|----------|-----------|-----------|
| Antonym | High symmetry | Same axis both directions |
| Hierarchy | Asymmetric | Specialization ≠ generalization |
| Near-synonym | High symmetry | Dense neighborhood |
| Cross-domain | Unknown | The interesting case |
| Polysemy | Asymmetric | Sense activation is directional |
| Anchor | Asymmetric | Basin structure may attract unidirectionally |

## Key Design Decisions
- Exploration-first workflow — phases follow the most interesting data signal
- 5wp only for reversals — Phase 1 showed 5wp paths are reliable coarse representations
- Distributional comparison — permutation tests + bootstrap CIs, not just point estimates
- Lenient extraction enforcement — truncate overlong, keep underlong, flag mismatches

## Blockers
None

## Next Steps
- Run `bun run reversals` to collect 960 reverse + supplementary runs
- Run `bun run analyze-reversals` to generate findings
- Write interpretive analysis (`findings/02-reversals-analysis.md`)
- Phase 3 direction informed by asymmetry data
