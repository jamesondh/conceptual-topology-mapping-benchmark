# State

## Current Phase
Phase 3: Positional Convergence + Transitive Path Structure — **COMPLETE**

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

### Key Findings
1. **Navigation is fundamentally asymmetric** — Overall mean asymmetry 0.811 (CI: [0.772, 0.848]). 73/84 significant at p<0.05.
2. **Starting-point hypothesis** — Models construct forward from wherever they start.
3. **Category predictions: 4/8 matched** — Conceptual space is quasimetric: d(A,B) ≠ d(B,A).
4. **Gemini most direction-sensitive** (0.867), Claude least (0.780).

## Phase 3 Summary

### Data Collected
- **Part A (positional convergence)**: Pure analysis of existing data (0 new API calls). 84 pair/model combinations.
- **Part B (transitivity)**: 600 new runs across 8 concept triples × 4 models × 10 reps. 15 new legs, 9 reused legs from Phase 1/2.

### Key Findings
1. **Dual-anchor hypothesis** — Positional convergence shows U-shaped pattern (match rates 0.102 → 0.057 → 0.065 → 0.085 → 0.129). Both endpoints anchor the path, not just the start. Refines Phase 2's starting-point hypothesis.
2. **Overall convergence slope near zero** (0.0082, CI crosses zero). Only 50% of combos show positive convergence. The starting-point hypothesis needs nuance.
3. **Hierarchical triples are compositional** — Transitivity 0.175 vs random controls 0.036 (4.9× difference). "dog" appears on animal→poodle path 50-100% of the time; random bridges never appear.
4. **Triangle inequality holds** — 29/32 cases (91%). All violations in Gemini. Conceptual space satisfies a key metric axiom.
5. **Bridge concept frequency is model-dependent** — Claude: "harmony" appears 100% on music→math; Gemini: 0%. Models have different navigational connectivity.
6. **Semantic chains partially compositional** (0.073) but "energy" is NOT on hot→cold (0.036). Association ≠ being on-route.
7. **Polysemy-extend confirms compositionality** — bank→river→ocean shows 0.150 transitivity, "river" appears 72.5% as bridge.
8. **Claude-Gemini axis persists** — Claude: dense, globally connected, rigid. Gemini: fragmented, locally specialized, direction-sensitive.

### Infrastructure Built
- `triples.ts` — 8 concept triple definitions with data reuse mapping
- `analysis/03a-positional-convergence.ts` — positional convergence metrics
- `experiments/03b-transitivity.ts` — transitivity experiment with scheduler
- `analysis/03b-transitivity.ts` — transitivity analysis and findings
- New metrics in `metrics.ts` — positional convergence, linear regression, waypoint transitivity, navigational distance, shortcuts/detours

## Key Design Decisions
- Exploration-first workflow — phases follow the most interesting data signal
- Two-part phase: Part A (free analysis, 0 API cost) → Part B (new experiment, ~$3)
- Data reuse strategy: 18 of 48 legs reused from Phase 1/2
- Consistency-based navigational distance: d(X→Y) = 1 - mean within-direction Jaccard

## Blockers
None

## Next Steps
- Phase 4 candidates (from analysis):
  1. Dimensionality probing — how many independent axes structure each model's space?
  2. Chain length scaling — how does transitivity change with 3-hop, 5-hop, 7-hop chains?
  3. Cross-model bridge agreement — do models agree on which concepts are bridges?
  4. Higher-resolution convergence — 7wp or 9wp paths for finer positional analysis
  5. Targeted Gemini investigation — why all 3 triangle inequality violations?
