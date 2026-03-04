# Phase 3: Positional Convergence + Transitive Path Structure

## Context

Phase 2 established that conceptual navigation is fundamentally asymmetric (mean 0.811) and proposed the **starting-point hypothesis**: models construct paths forward from the starting concept rather than finding "the" path. Phase 3 directly tests this hypothesis and pushes the geometric characterization further by testing whether navigation has compositional/transitive structure.

Two sub-phases, ordered by cost:
- **Part A** — pure analysis of existing data (zero new API calls)
- **Part B** — new experiment with 8 concept triples (~600 runs, ~5 minutes)

---

## Part A: Positional Convergence Analysis

**Hypothesis:** If the starting-point hypothesis is correct:
- wp1 should be strongly direction-dependent (forward wp1 ≠ reverse wp5)
- wp5 should converge (forward wp5 ≈ reverse wp1)
- Overlap should increase monotonically from position 1 → 5

**Data:** All 84 pair/model combinations already have forward (Phase 1) and reverse (Phase 2) paths with 5 ordered waypoints each. Zero new runs.

**Mirror indexing:** Forward position i compares to reverse position (6−i), because forward wp1 is near the "from" concept and reverse wp5 is also near that same concept (since reverse swaps from/to).

**Metrics:**
1. Per-position mirror-match rate (exact waypoint match across all fwd×rev run pairs)
2. Per-position pooled Jaccard (vocabulary overlap at each mirror position)
3. Convergence gradient (linear regression slope, R²)
4. Breakdowns by category and model

**Verification:** apple→apple (identity) should show ~1.0 match at all positions for Claude. Overall pooled match should approximate the Phase 2 mean Jaccard (0.189).

### Files

| Action | File | Lines |
|--------|------|-------|
| Modify | `types.ts` | +40 (PositionalConvergenceMetrics, CategoryConvergence, ModelConvergence, PositionalConvergenceOutput) |
| Modify | `metrics.ts` | +60 (computePositionalConvergence, linearRegression) |
| Create | `analysis/03a-positional-convergence.ts` | ~400 (follows 02-reversals analysis pattern) |
| Modify | `package.json` | +1 script (`convergence`) |

---

## Part B: Transitive Path Structure

**Core question:** When you navigate A→C directly, do the waypoints overlap with the composed path A→B + B→C?

### Why not standard triangle inequality?

With asymmetry-as-distance bounded [0,1], the sum d(A→B) + d(B→C) can reach 2, so d(A→C) ≤ d(A→B) + d(B→C) trivially holds for most combinations. Instead, we test two more meaningful properties:

1. **Waypoint transitivity** — Jaccard(waypoints(A→C), waypoints(A→B) ∪ waypoints(B→C))
   - High = B is "on the route," composed path covers similar territory
   - Low = direct path takes completely different territory

2. **Navigational triangle inequality** (consistency-based) — d(X→Y) = 1 − mean within-direction Jaccard
   - Test: d(A→C) ≤ d(A→B) + d(B→C)
   - Meaningful: if both legs are highly consistent, the direct path "should" also be consistent
   - Violation = easy sub-legs don't compose into an easy direct path

3. **Bridge concept analysis** — waypoints on A→C but NOT on A→B ∪ B→C ("shortcuts" that bypass B)

### 8 Concept Triples

| # | Triple (A, B, C) | Type | Rationale | Reusable Legs | New Legs | New Runs |
|---|-----------------|------|-----------|---------------|----------|----------|
| 1 | animal → dog → poodle | Hierarchical | Taxonomic chain. "dog" should be on-route. | A→C, rev-A→C | 4 | 160 |
| 2 | emotion → nostalgia → melancholy | Hierarchical | Emotional specificity. Reuses emotion→nostalgia. | A→B, rev-A→B | 4 | 160 |
| 3 | music → harmony → mathematics | Semantic chain | "harmony" bridges music & math domains. | A→C, rev-A→C | 4 | 160 |
| 4 | hot → energy → cold | Semantic chain | Physical concept chain through antonym pair. | A→C, rev-A→C | 4 | 160 |
| 5 | Beyoncé → justice → erosion | Max-reuse | 4 of 6 legs exist! Tests if justice is "on the route." | B→C, rev-B→C, A→C, rev-A→C | 2 | 80 |
| 6 | bank → river → ocean | Polysemy-extend | Geographic chain extending polysemy pair. | A→B, rev-A→B | 4 | 160 |
| 7 | music → stapler → mathematics | Random control | Random B in existing pair. Should NOT be on-route. | A→C, rev-A→C | 4 | 160 |
| 8 | hot → flamingo → cold | Random control | Random B in antonym pair. Should NOT be on-route. | A→C, rev-A→C | 4 | 160 |

**Totals:** 30 new legs, 18 reused legs → **600 forward-only runs** (optional `--with-reverses` for 1,200)

**Prediction:** Hierarchical triples (1, 2) should show high transitivity (>0.3). Random controls (7, 8) should show near-zero (<0.1). Semantic chains (3, 4) are the interesting unknown.

### Files

| Action | File | Lines |
|--------|------|-------|
| Modify | `types.ts` | +80 (ConceptTriple, TransitivityMetrics, TripleTypeAggregation, TransitivityAnalysisOutput) |
| Modify | `metrics.ts` | +80 (computeWaypointTransitivity, computeNavigationalDistance, findShortcutsAndDetours) |
| Create | `triples.ts` | ~120 (triple definitions + helpers, mirrors pairs.ts pattern) |
| Create | `experiments/03b-transitivity.ts` | ~500 (follows 02-reversals experiment pattern) |
| Create | `analysis/03b-transitivity.ts` | ~550 (follows 02-reversals analysis pattern) |
| Modify | `package.json` | +3 scripts (`transitivity`, `analyze-transitivity`, `phase3`) |

---

## Execution Order

```bash
# 1. Part A — instant results, no API cost
bun run convergence

# 2. Part B experiment — ~5 min with default concurrency
bun run transitivity              # 600 runs (forward only)
bun run transitivity --with-reverses  # 1,200 runs (optional)

# 3. Part B analysis
bun run analyze-transitivity

# 4. Or run everything:
bun run phase3
```

## Implementation Order

1. Add types to `types.ts` (Part A + Part B together)
2. Add metrics to `metrics.ts` (Part A + Part B together)
3. Create `analysis/03a-positional-convergence.ts` → run it → review findings
4. Create `triples.ts`
5. Create `experiments/03b-transitivity.ts` → run it
6. Create `analysis/03b-transitivity.ts` → run it → review findings
7. Write interpretive analysis (Opus subagent → `findings/03-analysis.md`)
8. Update `.planning/STATE.md`, `ROADMAP.md`
9. Commit & push

## Totals

- **New files:** 4 (triples.ts, analysis/03a, experiments/03b, analysis/03b)
- **Modified files:** 3 (types.ts, metrics.ts, package.json)
- **New code:** ~1,500 lines
- **New API runs:** 600 (forward-only) to 1,200 (with reverses)
- **Runtime:** <15 minutes total
- **Cost:** ~$3-6 via OpenRouter

## Verification

- **Part A:** Identity pair shows ~1.0 overlap for Claude at all positions. Overall pooled match ≈ Phase 2 mean Jaccard (0.189). Positive convergence slope in majority of pair/model combos.
- **Part B:** Hierarchical triples show transitivity >0.3. Random controls show <0.1. All runs complete with <5% failure rate. Reused data spot-checked against expected pair IDs.
