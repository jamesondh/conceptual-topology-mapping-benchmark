# Phase 4: Cross-Model Bridge Topology + Targeted Gemini Investigation

## Context

Phase 3 established that LLM conceptual navigation has genuine compositional structure: hierarchical triples show 4.9x higher transitivity than random controls, bridge concepts appear systematically on direct paths, and the triangle inequality holds in 91% of cases. But the most striking signal is model-dependent bridge connectivity. Claude routes through "harmony" on music-to-mathematics 100% of the time; Gemini routes through it 0%. On emotion-to-melancholy, Grok finds "nostalgia" as a bridge 90% of the time; Gemini finds it 0%. Meanwhile, Gemini accounts for all substantial triangle inequality violations and shows the lowest transitivity across the board. Phase 4 directly investigates these two linked phenomena: (1) do models systematically agree or disagree on which concepts serve as navigational bridges, and (2) what specific conditions cause Gemini's topological fragmentation? This combines the two strongest current signals (cross-model bridge agreement and targeted Gemini anomalies) into a single phase that should produce the clearest publishable differentiation between model topologies.

Two sub-phases, ordered by cost:
- **Part A** -- pure analysis of existing Phase 3B data (zero new API calls)
- **Part B** -- new experiment with 8 targeted triples, 20 reps per diagnostic condition (~1,480 runs, ~10 minutes)

### Reliability Note

Phase 3.5 reliability fixes have been applied to the metrics infrastructure: seeded PRNG (`mulberry32`), corrected permutation p-values using (k+1)/(N+1) (Phipson & Smyth), run-level bootstrap CIs (`bootstrapCIFromRuns`, `bootstrapCIFromTripleRuns`) to avoid pseudoreplication, fixed Spearman rho (proper rank conversion via `positionsToRanks`), and improved bridge detection (word-boundary fuzzy matching). All analysis scripts in Phase 4 should call `setMetricsSeed(42)` at initialization for full reproducibility.

---

## Part A: Cross-Model Bridge Agreement Analysis

**Hypothesis:** Models that agree on which concept serves as the navigational bridge between A and C will also show higher cross-model waypoint overlap on the direct A-to-C path. Bridge concept selection is the mechanism behind cross-model path divergence -- not just a symptom.

**Data:** All 8 triples from Phase 3B, across 4 models. Raw waypoint data loaded from `results/pilot/`, `results/reversals/`, and `results/transitivity/` JSON files (not the summary metrics JSON, which lacks run-level waypoint arrays). Uses the same data-loading pipeline as `analysis/03b-transitivity.ts`. Zero new runs.

**Metrics:**

1. **Per-triple bridge frequency vector.** For each triple, extract the 4-element vector of bridge frequencies [Claude, GPT, Grok, Gemini]. This is already computed in Phase 3B output but needs to be organized for pairwise model comparison.

2. **Inter-model bridge agreement (IBA).** For each model pair (6 pairs total: Claude-GPT, Claude-Grok, Claude-Gemini, GPT-Grok, GPT-Gemini, Grok-Gemini), compute per-triple:
   - **Absolute bridge frequency difference** |freq_X - freq_Y| for that triple.
   - **Binary bridge agreement** -- 1 if both models find the bridge (frequency > 0) or both miss it; 0 otherwise.

   Then aggregate across the 6 non-control triples (controls have 0% bridge frequency for all models, so they contribute no discriminative information):
   - **Mean absolute bridge frequency difference** across triples -- a simple, interpretable measure.
   - **Binary bridge agreement rate** -- fraction of triples with agreement.
   - **Pearson correlation** of the 6-element bridge frequency vectors (one value per model pair).

   Note: The analysis unit is the (model-pair, triple) observation. IBA aggregates are pair-level summaries over triples; the correlation in metric 4 treats (model-pair, triple) as the observation unit, with 36 observations (6 pairs × 6 non-control triples).

3. **Cross-model direct-path Jaccard.** For each (model-pair, triple) combination on the A-to-C leg, compute cross-model Jaccard: for all pairs of runs (one from model X, one from model Y), compute Jaccard and take the mean. This measures how similar two models' direct paths are, independent of bridge concept analysis.

4. **Bridge agreement vs. path similarity correlation.** The key test: across the 36 (model-pair, triple) observations, correlate per-observation bridge frequency difference with cross-model direct-path Jaccard. If bridge selection drives path divergence, smaller bridge frequency differences should predict higher cross-model Jaccard.

   **Circularity control:** Also compute a **bridge-removed Jaccard**: recompute cross-model Jaccard after removing the bridge concept token from all waypoint sets. If the correlation persists after removing the bridge term, it is not an artifact of shared bridge tokens mechanically inflating Jaccard.

5. **Gemini isolation index.** Quantify how much Gemini diverges from the other three models on bridge connectivity:
   - Mean IBA (absolute frequency difference) for Gemini-paired comparisons (3 pairs × 6 triples = 18 values) vs. non-Gemini pairs (3 pairs × 6 triples = 18 values).
   - Report the difference with bootstrap CI. **Caveat:** with only 6 non-control triples contributing to each model pair's IBA, this comparison is exploratory/descriptive rather than a well-powered formal test. The model pairs also share models (e.g., Claude-Gemini and GPT-Gemini both include Gemini), creating dependence. Interpret the index as a descriptive summary, not a hypothesis test.

**Verification:**
- Random control triples should show near-zero bridge frequency for all models (already confirmed in Phase 3B, but verify the analysis pipeline handles this correctly).
- The Gemini isolation index should be positive (Gemini diverges more, i.e., larger bridge frequency differences) based on Phase 3 findings.
- Bridge-removed Jaccard should be lower than full Jaccard for triples where bridge concepts appear frequently, confirming the removal works.
- `setMetricsSeed(42)` called at analysis start; running twice produces identical output.

### Files

| Action | File | Lines |
|--------|------|-------|
| Modify | `types.ts` | +60 (BridgeAgreementMetrics, ModelPairBridgeAgreement, CrossModelJaccard, BridgeAgreementOutput) |
| Modify | `metrics.ts` | +100 (computeCrossModelJaccard, computeBridgeRemovedJaccard, computeBridgeAgreement, pearsonCorrelation) |
| Create | `analysis/04a-bridge-agreement.ts` | ~550 (loads Phase 3B raw data, computes all Part A metrics including circularity control, generates findings) |
| Modify | `package.json` | +1 script (`bridge-agreement`) |

---

## Part B: Targeted Bridge Topology Experiment

**Core question:** Can we predict and manipulate cross-model bridge divergence? Specifically: (1) Does Gemini's fragmentation extend to new polysemy and abstract-bridge triples, or was it specific to the Phase 3 stimuli? (2) Do higher reps (20 vs 10) tighten the bridge frequency confidence intervals enough to improve separation of genuine model differences from noise? (3) Can we find triples where Gemini succeeds at bridging, to characterize the boundary of its fragmentation?

### Design Principles

- **20 reps per diagnostic condition** (up from 10 in Phase 3B) for tighter 95% CIs on bridge frequency. Note: at n=20, a binomial proportion of 0.10 has a 95% CI of roughly [0.01, 0.32], while 0.80 has [0.56, 0.94]. CIs for values near 0 or 1 will be meaningfully tighter than at n=10, but values near 0.50 will still have wide intervals. The primary gain is better separation of near-zero vs. moderate bridge frequencies.
- **10 reps for controls** -- only need to confirm 0% bridge frequency, so fewer reps suffice.
- **Forward-only legs** for new runs (no reverses needed -- this phase is about bridge topology, not asymmetry).
- **6 diagnostic triples + 2 controls** = 8 triples total.
- Each triple requires 3 forward legs (A-to-B, B-to-C, A-to-C). Some legs reuse existing data from Phase 1/2/3.

### Temporal Drift Caveat

Triples 1 and 4 mix historical runs (Phase 1/3B, collected earlier) with new top-up runs. Model endpoints may drift between collection periods, especially for preview models like Gemini 3 Flash. The analysis should compare within-batch consistency (old-only vs new-only Jaccard) to detect drift. If significant drift is detected, report historical and new runs separately rather than pooling.

### 8 Concept Triples

| # | Triple (A, B, C) | Type | Rationale | Reusable Legs | New Legs | New Runs |
|---|-----------------|------|-----------|---------------|----------|----------|
| 1 | bank -> river -> ocean | polysemy-retest | **Gemini polysemy anomaly retest.** Phase 3B showed Gemini routes bank-to-ocean through "gold, treasure" (financial sense) while all other models use "river." Higher reps to tighten the CI on Gemini's 0% bridge frequency and see if this is a stable property or sampling noise. | AB (polysemy-bank-river, ~20 reps) | BC, AC top-up | 120 |
| 2 | bank -> deposit -> savings | polysemy-financial | **Financial-sense polysemy control.** If Gemini defaults to the financial sense of "bank," it should find "deposit" as a bridge on bank-to-savings. Tests whether Gemini's bank sense is truly locked to financial, or if it simply ignores bridges. | none | AB, BC, AC | 240 |
| 3 | light -> spectrum -> color | cross-domain-concrete | **Concrete cross-domain bridge.** "Spectrum" bridges physics (light) and perception (color). Tests bridge agreement on a concrete, well-defined chain. Gemini may succeed here because the domains are concretely linked via physics, not abstract analogy. | none | AB, BC, AC | 240 |
| 4 | emotion -> nostalgia -> melancholy | abstract-retest | **Abstract bridge retest.** Phase 3B showed extreme model split: Gemini 0.00 vs Grok 0.90 bridge frequency. Higher reps to confirm this is a stable signal, not a 10-run artifact. | none (AB has ~10 reps from Phase 1, need 10 more) | AB top-up, BC, AC | 120 |
| 5 | language -> metaphor -> thought | abstract-bridge | **Abstract bridge chain.** "Metaphor" bridges language (its domain) and thought (its function). Tests whether Gemini's 0% bridge pattern on abstract chains generalizes beyond emotion/music triples. All three concepts are abstract -- no concrete anchors. | none | AB, BC, AC | 240 |
| 6 | tree -> forest -> ecosystem | concrete-hierarchical | **Concrete hierarchical chain (Gemini-friendly).** Taxonomic and spatial part-whole chain. If Gemini's fragmentation is specific to abstract and cross-domain triples, it should show normal bridge frequency here. "Forest" should appear on tree-to-ecosystem paths. This is the Gemini success prediction. | none | AB, BC, AC | 240 |
| 7 | light -> chandelier -> color | random-control | **Random control.** "Chandelier" is associated with "light" but not on the conceptual path from light to color. Should show 0% bridge frequency for all models. | none | AB, BC, AC | 120 |
| 8 | emotion -> calendar -> melancholy | random-control | **Random control.** "Calendar" is unrelated to the emotion-to-melancholy pathway. Should show 0% bridge frequency for all models. Shares endpoints with triple 4 for direct comparison. | none | AB, BC, AC | 120 |

### Run Budget

**Detailed budget with reuse and top-ups:**

| Triple | Leg | Status | New Runs (4 models × reps) |
|--------|-----|--------|---------------------------|
| 1 (bank-river-ocean) | AB | Reuse (Phase 1: polysemy-bank-river, ~20 reps) | 0 |
| 1 | BC | New | 80 (4 × 20) |
| 1 | AC | Partial reuse (Phase 3B: 10 reps) + top-up | 40 (4 × 10 additional) |
| 2 (bank-deposit-savings) | AB, BC, AC | New | 240 (3 × 4 × 20) |
| 3 (light-spectrum-color) | AB, BC, AC | New | 240 |
| 4 (emotion-nostalgia-melancholy) | AB | Partial reuse (Phase 1: ~10 reps) + top-up | 40 (4 × 10 additional) |
| 4 | BC | Partial reuse (Phase 3B: 10 reps) + top-up | 40 (4 × 10 additional) |
| 4 | AC | Partial reuse (Phase 3B: 10 reps) + top-up | 40 (4 × 10 additional) |
| 5 (language-metaphor-thought) | AB, BC, AC | New | 240 |
| 6 (tree-forest-ecosystem) | AB, BC, AC | New | 240 |
| 7 (light-chandelier-color) | AB, BC, AC | New (10 reps) | 120 (3 × 4 × 10) |
| 8 (emotion-calendar-melancholy) | AB, BC, AC | New (10 reps) | 120 (3 × 4 × 10) |

**Total new runs: 1,480**

At ~$0.002-0.004 per run via OpenRouter (mixed model costs), this is approximately **$3.00 - $5.90**.

**Final run allocation by triple:**

| Triple | Target Reps | New Runs |
|--------|-------------|----------|
| 1 (bank-river-ocean) | 20 | 120 (80 new BC + 40 top-up AC) |
| 2 (bank-deposit-savings) | 20 | 240 |
| 3 (light-spectrum-color) | 20 | 240 |
| 4 (emotion-nostalgia-melancholy) | 20 | 120 (40 AB top-up + 40 BC top-up + 40 AC top-up) |
| 5 (language-metaphor-thought) | 20 | 240 |
| 6 (tree-forest-ecosystem) | 20 | 240 |
| 7 (light-chandelier-color) | 10 | 120 |
| 8 (emotion-calendar-melancholy) | 10 | 120 |

**Totals:** 1,480 new forward-only runs across 8 triples × 4 models.

### Predictions

| Triple | Bridge | Predicted Bridge Freq | Rationale |
|--------|--------|-----------------------|-----------|
| 1 bank-river-ocean | river | Claude/GPT/Grok > 0.80; **Gemini < 0.10** | Replicates Phase 3B polysemy anomaly |
| 2 bank-deposit-savings | deposit | All models > 0.30; **Gemini > 0.50** | Financial sense should be Gemini's strong suit |
| 3 light-spectrum-color | spectrum | All models > 0.40 | Concrete chain, well-defined physical bridge |
| 4 emotion-nostalgia-melancholy | nostalgia | Grok > 0.80; **Gemini < 0.10** | Replicates Phase 3B abstract bridge anomaly |
| 5 language-metaphor-thought | metaphor | Claude/Grok > 0.50; **Gemini < 0.20** | Abstract bridge, predicts Gemini fragmentation |
| 6 tree-forest-ecosystem | forest | All models > 0.50; **Gemini > 0.40** | Concrete hierarchical -- Gemini success prediction |
| 7 light-chandelier-color | chandelier | All models < 0.05 | Random control |
| 8 emotion-calendar-melancholy | calendar | All models < 0.05 | Random control |

The critical predictions:
- **Gemini concrete/financial success** (triples 2, 3, 6): If Gemini shows normal bridge frequencies here, its fragmentation is specific to abstract cross-domain bridges.
- **Gemini polysemy/abstract failure** (triples 1, 4, 5): If the 0% bridge pattern replicates, it is a stable topological property, not sampling noise. Triple 1 is a polysemy-driven failure (wrong sense), while triples 4 and 5 are abstract-bridge failures (no bridge found).
- **Controls at zero** (triples 7, 8): Validates the experimental design.

### Files

| Action | File | Lines |
|--------|------|-------|
| Modify | `types.ts` | +40 (Phase4Triple type extending ConceptTriple with targetReps, diagnosticType fields) |
| Create | `triples-phase4.ts` | ~200 (8 triple definitions with reuse mapping, helpers) |
| Create | `experiments/04b-targeted-bridges.ts` | ~500 (follows 03b-transitivity experiment pattern, supports --reps flag, resume, top-up logic for partial reuse) |
| Create | `analysis/04b-targeted-bridges.ts` | ~600 (loads all phase data, computes transitivity + bridge metrics for Phase 4 triples, generates findings, includes temporal drift check for top-up triples) |
| Modify | `package.json` | +4 scripts (`bridge-agreement`, `targeted-bridges`, `analyze-targeted-bridges`, `phase4`) |

---

## Execution Order

```bash
# 1. Part A -- instant results, no API cost
bun run bridge-agreement

# 2. Part B experiment -- ~8-12 min with default concurrency
bun run targeted-bridges              # 1,480 runs (forward only)
bun run targeted-bridges --dry-run    # preview run plan

# 3. Part B analysis
bun run analyze-targeted-bridges

# 4. Or run everything:
bun run phase4
```

## Implementation Order

1. Add types to `types.ts` (Part A + Part B together -- bridge agreement types, Phase 4 triple extensions)
2. Add metrics to `metrics.ts` (Part A -- cross-model Jaccard, bridge-removed Jaccard, bridge agreement, Pearson correlation)
3. Create `analysis/04a-bridge-agreement.ts` -- run it -- review findings
4. Create `triples-phase4.ts` (8 triple definitions with reuse mapping)
5. Create `experiments/04b-targeted-bridges.ts` -- run it
6. Create `analysis/04b-targeted-bridges.ts` -- run it -- review findings (include temporal drift check)
7. Write interpretive analysis (Opus subagent -- `findings/04-analysis.md`)
8. Update `.planning/STATE.md`, `ROADMAP.md`
9. Commit & push

## Totals

- **New files:** 4 (triples-phase4.ts, analysis/04a, experiments/04b, analysis/04b)
- **Modified files:** 3 (types.ts, metrics.ts, package.json)
- **New code:** ~2,000 lines
- **New API runs:** 1,480 (forward-only)
- **Runtime:** ~10-15 minutes total (Part A: instant, Part B experiment: ~8-12 min, Part B analysis: <1 min)
- **Cost:** ~$3-6 via OpenRouter

## Verification

### Part A
- Bridge frequency vectors extracted correctly from Phase 3B raw data (spot-check: Claude's harmony frequency for music-harmony-mathematics should be 1.00, Gemini's should be 0.00).
- Pearson correlation computable for all 6 model pairs (no NaN from zero-variance vectors -- exclude control triples from correlation to avoid this).
- Gemini isolation index is positive (Gemini's mean bridge frequency difference is larger than non-Gemini pairs' mean difference).
- Cross-model Jaccard for A-to-C legs matches expectations: higher for model pairs with smaller bridge frequency differences.
- Bridge-removed Jaccard is lower than full Jaccard for triples with high bridge frequency, confirming the removal is working.
- Correlation between bridge agreement and path similarity persists (or weakens) after bridge removal -- distinguishes mechanism from artifact.
- `setMetricsSeed(42)` called at analysis start; running twice produces identical output.

### Part B
- All 1,480 runs complete with < 5% failure rate.
- Top-up runs for triples 1 and 4 correctly merge with existing data (total reps per leg per model = 20).
- For top-up triples, temporal drift check: within-batch Jaccard (old-only, new-only) vs. cross-batch Jaccard. Flag if cross-batch is >0.1 lower than within-batch.
- Random controls (triples 7, 8) show 0% bridge frequency for all models.
- Gemini polysemy retest (triple 1): bridge frequency CI does not overlap with other models' CIs (confirms divergence is real, not noise).
- At least one Gemini-success prediction confirmed (triple 2, 3, or 6 shows Gemini bridge frequency > 0.30).
- At least one Gemini-failure prediction confirmed (triple 4 or 5 shows Gemini bridge frequency < 0.10 with 20-rep CI not overlapping other models).
- Bridge frequency CIs with 20 reps are visibly tighter than Phase 3B's 10-rep CIs (compare triple 1 and 4 against Phase 3B baselines).
- Findings report generated with all sections populated, including per-triple model comparison tables.
