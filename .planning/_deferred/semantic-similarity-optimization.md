# Deferred: Semantic Similarity Analysis (Embedding-Based)

## What It Is

The analysis pipeline includes an optional semantic similarity metric that uses `openai/text-embedding-3-large` (via OpenRouter) to measure whether waypoint sets from different runs converge semantically, even when they differ lexically (e.g., "melody" vs "tune").

## Current Status

**Skipped in Phase 1 pilot** (`--skip-embeddings`). The analysis ran for 10+ minutes on embedding API calls before being killed. All semantic similarity fields in `pilot-metrics.json` are `undefined`.

## Why It's Slow

The implementation in `canonicalize.ts` (`averageSemanticSimilarity()`) makes one API call per pairwise run comparison:
- 168 conditions x C(10-20, 2) comparisons = ~7,560 API calls
- No caching — same waypoint strings re-embedded across conditions
- No deduplication — "music" embedded hundreds of times
- Sequential execution — each comparison blocks on the previous

## Optimization Plan

Refactor to **embed-once, lookup-many**:

1. **Collect** all unique waypoint strings across all results (~500-1,000 unique terms)
2. **Batch embed** them in a single API call (or a few batched calls)
3. **Cache** embeddings in a Map<string, number[]>
4. **Compute** pairwise similarities from cache — pure math, no API calls

This reduces ~7,560 API calls to ~5-10 batched calls. Computation time drops from hours to seconds.

## Value Assessment

**Marginal for Phase 1 conclusions** — Jaccard + entropy already tell the story:
- Model gait differences are clear (Claude 0.578 vs GPT 0.258 Jaccard)
- Polysemy differentiation is perfect (cross-pair Jaccard = 0.000)
- Controls validate cleanly

**Potentially useful for later phases:**
- Phase 2 reversals: do A→B and B→A produce semantically similar but lexically distinct paths?
- Could reveal cases where Jaccard underestimates true consistency
- Park et al. (NAACL 2024) note that cosine similarity may produce artifacts due to non-Euclidean inner product structure — angular distance or WMD may be more appropriate

## Related

See `embedding-validation.md` for the broader question of whether behavioral paths correlate with embedding-space geometry.
