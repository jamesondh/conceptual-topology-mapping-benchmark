# State

## Current Phase
Phase 2: Reversals & path consistency — **COMPLETE**

## Context
- Research survey complete (`research.md`)
- Word convergence game (575 games, 4 models) provides empirical foundation
- Core thesis: no benchmark systematically evaluates whether LLMs can *navigate* conceptual space consistently

## Phase 1 Summary

### Key Findings
1. **Models have distinct gaits** — Claude 0.578 avg Jaccard vs GPT 0.258 (2.2x gap)
2. **Polysemy → sense differentiation** — cross-pair Jaccard = 0.000 (artifact, fixed in Phase 2)
3. **Cross-model paths are genuinely different** — all pairs show ~0.17-0.20 Jaccard
4. **Controls validate cleanly** — nonsense near-zero, antonyms highest, random intermediate

## Phase 2 Summary

### Data Collected
- 960 runs: 840 reverse (21 pairs × 4 models × 10 reps) + 120 polysemy supplementary
- Combined with 1,240 forward results from Phase 1 (5wp/semantic only)
- 84 pair/model combinations analyzed

### Key Findings
1. **Navigation is fundamentally asymmetric** — Overall mean asymmetry 0.811 (CI: [0.772, 0.848]). Forward and reverse paths share <19% waypoints on average. 73/84 combinations significant at p<0.05.
2. **Starting-point hypothesis** — Control-random pairs show 0.908 asymmetry. When no semantic bridge exists, the path is almost entirely determined by the starting concept. Models don't find "the" path — they construct forward from wherever they start.
3. **Category predictions: 4/8 matched** — Anchor (0.911 ✅), polysemy (0.824 ✅), hierarchy (0.683 ✅), identity (0.456 ✅). Antonym (0.596 ❌), near-synonym (0.665 ❌), control-random (0.908 ❌), nonsense (0.986 ❌).
4. **Gemini most direction-sensitive** (0.867), Claude least (0.780) — two independent axes of navigational character: within-direction consistency vs cross-direction consistency.
5. **Polysemy vindicated** — Supplementary data confirms genuine sense differentiation (cross-pair Jaccard 0.011–0.062), fixing Phase 1 artifact.
6. **Conceptual space is quasimetric** — d(A,B) ≠ d(B,A). Asymmetry is structured, not random — it varies by category and model in interpretable ways.

### Infrastructure Built
- Scheduler (`scheduler.ts`) — ~4x faster than Phase 1
- Metrics module (`metrics.ts`) — asymmetry metrics, bootstrap CIs, permutation tests
- Resume-capable experiment scripts, atomic writes, extraction enforcement

## Key Design Decisions
- Exploration-first workflow — phases follow the most interesting data signal
- 5wp only for reversals — Phase 1 showed 5wp paths are reliable coarse representations
- Distributional comparison — permutation tests + bootstrap CIs, not just point estimates
- Lenient extraction enforcement — truncate overlong, keep underlong, flag mismatches

## Blockers
None

## Next Steps
- Decide Phase 3 direction based on asymmetry data. Top candidates:
  1. Triangle inequality testing — does d(A,C) ≤ d(A,B) + d(B,C)?
  2. Positional asymmetry analysis — direct test of starting-point hypothesis
  3. Model-specific asymmetry topology — which pairs are asymmetric for which models?
  4. The random-pair gradient — test more random pairs to map the baseline
