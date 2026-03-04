# Phase 4: Cross-Model Bridge Topology + Targeted Gemini Investigation

## Context

Phase 3 established that LLM conceptual navigation has genuine compositional structure: hierarchical triples show 4.9x higher transitivity than random controls, bridge concepts appear systematically on direct paths, and the triangle inequality holds in 91% of cases. But the most striking signal is model-dependent bridge connectivity. Claude routes through "harmony" on music-to-mathematics 100% of the time; Gemini routes through it 0%. On emotion-to-melancholy, Grok finds "nostalgia" as a bridge 90% of the time; Gemini finds it 0%. Meanwhile, Gemini accounts for all substantial triangle inequality violations and shows the lowest transitivity across the board. Phase 4 directly investigates these two linked phenomena: (1) do models systematically agree or disagree on which concepts serve as navigational bridges, and (2) what specific conditions cause Gemini's topological fragmentation? This combines the two strongest current signals (cross-model bridge agreement and targeted Gemini anomalies) into a single phase that should produce the clearest publishable differentiation between model topologies.

Two sub-phases, ordered by cost:
- **Part A** -- pure analysis of existing Phase 3B data (zero new API calls)
- **Part B** -- new experiment with 8 targeted triples, 20 reps per condition (~1,400 runs, ~10 minutes)

### Reliability Note

Phase 3.5 reliability fixes have been applied to the metrics infrastructure: seeded PRNG (`mulberry32`), corrected permutation p-values using (k+1)/(N+1) (Phipson & Smyth), run-level bootstrap CIs (`bootstrapCIFromRuns`, `bootstrapCIFromTripleRuns`) to avoid pseudoreplication, fixed Spearman rho (proper rank conversion via `positionsToRanks`), and improved bridge detection (word-boundary fuzzy matching). All analysis scripts in Phase 4 should call `setMetricsSeed(42)` at initialization for full reproducibility.

---

## Part A: Cross-Model Bridge Agreement Analysis

**Hypothesis:** Models that agree on which concept serves as the navigational bridge between A and C will also show higher cross-model waypoint overlap on the direct A-to-C path. Bridge concept selection is the mechanism behind cross-model path divergence -- not just a symptom.

**Data:** All 8 triples from Phase 3B, across 4 models. Each triple has bridge concept frequency data per model, plus the full waypoint sets for every leg. Zero new runs.

**Metrics:**

1. **Per-triple bridge frequency vector.** For each triple, extract the 4-element vector of bridge frequencies [Claude, GPT, Grok, Gemini]. This is already computed in Phase 3B output but needs to be organized for pairwise model comparison.

2. **Inter-model bridge agreement (IBA).** For each model pair (6 pairs total: Claude-GPT, Claude-Grok, Claude-Gemini, GPT-Grok, GPT-Gemini, Grok-Gemini), compute:
   - **Pearson correlation** of bridge frequency vectors across the 6 non-control triples (controls have 0% bridge frequency for all models, so they contribute no discriminative information).
   - **Mean absolute bridge frequency difference** across triples -- a simpler, more interpretable measure.
   - **Binary bridge agreement rate** -- fraction of triples where both models either find the bridge (frequency > 0) or both miss it.

3. **Cross-model direct-path Jaccard.** For each triple's A-to-C leg, compute the cross-model Jaccard: pool all A-to-C waypoints from model X, pool all from model Y, compute Jaccard. This measures how similar two models' direct paths are, independent of bridge concept analysis.

4. **Bridge agreement vs. path similarity correlation.** The key test: across the 6 model pairs x 6 non-control triples (36 observations), correlate IBA (binary or continuous) with cross-model direct-path Jaccard. If bridge selection drives path divergence, high IBA should predict high cross-model Jaccard.

5. **Gemini isolation index.** Quantify how much Gemini diverges from the other three models on bridge connectivity:
   - Mean IBA for Gemini-paired comparisons (3 values) vs. non-Gemini pairs (3 values).
   - Formal test: is Gemini's mean IBA significantly lower than the other models' pairwise IBAs? Use bootstrap CI on the difference.

**Verification:**
- Random control triples should show near-zero bridge frequency for all models (already confirmed in Phase 3B, but verify the analysis pipeline handles this correctly).
- Cross-model Jaccard for the identity pair (apple-apple) should be high for Claude (known high consistency) and lower for others.
- The Gemini isolation index should be negative (Gemini diverges more) based on Phase 3 findings.

### Files

| Action | File | Lines |
|--------|------|-------|
| Modify | `types.ts` | +60 (BridgeAgreementMetrics, ModelPairBridgeAgreement, CrossModelJaccard, BridgeAgreementOutput) |
| Modify | `metrics.ts` | +80 (computeCrossModelJaccard, computeBridgeAgreement, pearsonCorrelation) |
| Create | `analysis/04a-bridge-agreement.ts` | ~500 (loads Phase 3B data, computes all Part A metrics, generates findings) |
| Modify | `package.json` | +1 script (`bridge-agreement`) |

---

## Part B: Targeted Bridge Topology Experiment

**Core question:** Can we predict and manipulate cross-model bridge divergence? Specifically: (1) Does Gemini's fragmentation extend to new polysemy and abstract-bridge triples, or was it specific to the Phase 3 stimuli? (2) Do higher reps (20 vs 10) tighten the bridge frequency confidence intervals enough to distinguish genuine model differences from noise? (3) Can we find triples where Gemini succeeds at bridging, to characterize the boundary of its fragmentation?

### Design Principles

- **20 reps per condition** (up from 10 in Phase 3B) for tighter 95% CIs on bridge frequency. With 10 reps, a bridge frequency of 0.10 has a wide CI; with 20, we can distinguish 0.05 from 0.20.
- **Forward-only legs** for new runs (no reverses needed -- this phase is about bridge topology, not asymmetry).
- **6 diagnostic triples + 2 controls** = 8 triples total.
- Each triple requires 3 forward legs (A-to-B, B-to-C, A-to-C). Some legs reuse existing data from Phase 1/2/3.

### 8 Concept Triples

| # | Triple (A, B, C) | Type | Rationale | Reusable Legs | New Legs | New Runs |
|---|-----------------|------|-----------|---------------|----------|----------|
| 1 | bank -> river -> ocean | polysemy-retest | **Gemini polysemy anomaly retest.** Phase 3B showed Gemini routes bank-to-ocean through "gold, treasure" (financial sense) while all other models use "river." Higher reps to tighten the CI on Gemini's 0% bridge frequency and see if this is a stable property or sampling noise. | AB (polysemy-bank-river), AC (Phase 3B) | BC | 80 |
| 2 | bank -> deposit -> savings | polysemy-financial | **Financial-sense polysemy control.** If Gemini defaults to the financial sense of "bank," it should find "deposit" as a bridge on bank-to-savings. Tests whether Gemini's bank sense is truly locked to financial, or if it simply ignores bridges. | none | AB, BC, AC | 240 |
| 3 | light -> spectrum -> color | cross-domain-concrete | **Concrete cross-domain bridge.** "Spectrum" bridges physics (light) and perception (color). Tests bridge agreement on a concrete, well-defined chain. Gemini may succeed here because the domains are concretely linked via physics, not abstract analogy. | none | AB, BC, AC | 240 |
| 4 | emotion -> nostalgia -> melancholy | abstract-retest | **Abstract bridge retest.** Phase 3B showed extreme model split: Gemini 0.00 vs Grok 0.90 bridge frequency. Higher reps to confirm this is a stable signal, not a 10-run artifact. | AB (hierarchy-emotion-nostalgia) | BC, AC | 160 |
| 5 | language -> metaphor -> thought | abstract-bridge | **Abstract bridge chain.** "Metaphor" bridges language (its domain) and thought (its function). Tests whether Gemini's 0% bridge pattern on abstract chains generalizes beyond emotion/music triples. All three concepts are abstract -- no concrete anchors. | none | AB, BC, AC | 240 |
| 6 | tree -> forest -> ecosystem | concrete-hierarchical | **Concrete hierarchical chain (Gemini-friendly).** Taxonomic and spatial part-whole chain. If Gemini's fragmentation is specific to abstract and cross-domain triples, it should show normal bridge frequency here. "Forest" should appear on tree-to-ecosystem paths. This is the Gemini success prediction. | none | AB, BC, AC | 240 |
| 7 | light -> chandelier -> color | random-control | **Random control.** "Chandelier" is associated with "light" but not on the conceptual path from light to color. Should show 0% bridge frequency for all models. | none | AB, BC, AC | 240 |
| 8 | emotion -> calendar -> melancholy | random-control | **Random control.** "Calendar" is unrelated to the emotion-to-melancholy pathway. Should show 0% bridge frequency for all models. Shares endpoints with triple 4 for direct comparison. | none | AB, BC, AC | 240 |

### Run Budget

Naive calculation (22 new legs x 80 runs each = 1,760) exceeds the $3-5 budget. The key optimization is **partial data reuse**: triples 1 and 4 share endpoints with Phase 3B data (10 reps already collected). For those legs, we only need 10 additional "top-up" reps to reach 20 total. Controls are reduced to 10 reps since they only need to confirm 0% bridge frequency.

**Detailed budget with reuse and top-ups:**

| Triple | Leg | Status | New Runs (4 models x reps) |
|--------|-----|--------|---------------------------|
| 1 (bank-river-ocean) | AB | Reuse (Phase 1: polysemy-bank-river, ~20 reps) | 0 |
| 1 | BC | New | 80 (4 x 20) |
| 1 | AC | Partial reuse (Phase 3B: 10 reps) | 40 (4 x 10 additional) |
| 2 (bank-deposit-savings) | AB, BC, AC | New | 240 (3 x 4 x 20) |
| 3 (light-spectrum-color) | AB, BC, AC | New | 240 |
| 4 (emotion-nostalgia-melancholy) | AB | Reuse (Phase 1: hierarchy-emotion-nostalgia, ~20 reps) | 0 |
| 4 | BC | Partial reuse (Phase 3B: 10 reps) | 40 (4 x 10 additional) |
| 4 | AC | Partial reuse (Phase 3B: 10 reps) | 40 (4 x 10 additional) |
| 5 (language-metaphor-thought) | AB, BC, AC | New | 240 |
| 6 (tree-forest-ecosystem) | AB, BC, AC | New | 240 |
| 7 (light-chandelier-color) | AB, BC, AC | New | 240 |
| 8 (emotion-calendar-melancholy) | AB, BC, AC | New | 240 |

**Total new runs: 1,400**

At ~$0.002-0.004 per run via OpenRouter (mixed model costs), this is approximately **$2.80 - $5.60**. Controls are reduced to 10 reps to stay within budget.

**Final run allocation by triple:**

| Triple | Reps | New Runs |
|--------|------|----------|
| 1 (bank-river-ocean) | 20 | 120 (80 new BC + 40 top-up AC) |
| 2 (bank-deposit-savings) | 20 | 240 |
| 3 (light-spectrum-color) | 20 | 240 |
| 4 (emotion-nostalgia-melancholy) | 20 | 80 (40 BC + 40 AC top-ups) |
| 5 (language-metaphor-thought) | 20 | 240 |
| 6 (tree-forest-ecosystem) | 20 | 240 |
| 7 (light-chandelier-color) | 10 | 120 |
| 8 (emotion-calendar-melancholy) | 10 | 120 |

**Totals:** 1,400 new forward-only runs across 8 triples x 4 models.

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
- **Gemini abstract failure** (triples 1, 4, 5): If the 0% bridge pattern replicates, it is a stable topological property, not sampling noise.
- **Controls at zero** (triples 7, 8): Validates the experimental design.

### Files

| Action | File | Lines |
|--------|------|-------|
| Modify | `types.ts` | +40 (Phase4Triple type extending ConceptTriple with targetReps, diagnosticType fields) |
| Create | `triples-phase4.ts` | ~200 (8 triple definitions with reuse mapping, helpers) |
| Create | `experiments/04b-targeted-bridges.ts` | ~500 (follows 03b-transitivity experiment pattern, supports --reps flag, resume, top-up logic for partial reuse) |
| Create | `analysis/04b-targeted-bridges.ts` | ~600 (loads all phase data, computes transitivity + bridge metrics for Phase 4 triples, generates findings) |
| Modify | `package.json` | +4 scripts (`bridge-agreement`, `targeted-bridges`, `analyze-targeted-bridges`, `phase4`) |

---

## Execution Order

```bash
# 1. Part A -- instant results, no API cost
bun run bridge-agreement

# 2. Part B experiment -- ~8-12 min with default concurrency
bun run targeted-bridges              # 1,400 runs (forward only)
bun run targeted-bridges --dry-run    # preview run plan

# 3. Part B analysis
bun run analyze-targeted-bridges

# 4. Or run everything:
bun run phase4
```

## Implementation Order

1. Add types to `types.ts` (Part A + Part B together -- bridge agreement types, Phase 4 triple extensions)
2. Add metrics to `metrics.ts` (Part A -- cross-model Jaccard, bridge agreement, Pearson correlation)
3. Create `analysis/04a-bridge-agreement.ts` -- run it -- review findings
4. Create `triples-phase4.ts` (8 triple definitions with reuse mapping)
5. Create `experiments/04b-targeted-bridges.ts` -- run it
6. Create `analysis/04b-targeted-bridges.ts` -- run it -- review findings
7. Write interpretive analysis (Opus subagent -- `findings/04-analysis.md`)
8. Update `.planning/STATE.md`, `ROADMAP.md`
9. Commit & push

## Totals

- **New files:** 4 (triples-phase4.ts, analysis/04a, experiments/04b, analysis/04b)
- **Modified files:** 3 (types.ts, metrics.ts, package.json)
- **New code:** ~1,900 lines
- **New API runs:** 1,400 (forward-only)
- **Runtime:** ~10-15 minutes total (Part A: instant, Part B experiment: ~8-12 min, Part B analysis: <1 min)
- **Cost:** ~$3-5 via OpenRouter

## Verification

### Part A
- Bridge frequency vectors extracted correctly from Phase 3B data (spot-check: Claude's harmony frequency for music-harmony-mathematics should be 1.00, Gemini's should be 0.00).
- Pearson correlation computable for all 6 model pairs (no NaN from zero-variance vectors -- exclude control triples from correlation to avoid this).
- Gemini isolation index is negative (Gemini's mean IBA is lower than non-Gemini pairs' mean IBA).
- Cross-model Jaccard for A-to-C legs matches expectations: higher for model pairs with similar bridge frequencies.
- `setMetricsSeed(42)` called at analysis start; running twice produces identical output.

### Part B
- All 1,400 runs complete with < 5% failure rate.
- Top-up runs for triples 1 and 4 correctly merge with existing Phase 3B data (total reps per leg per model = 20).
- Random controls (triples 7, 8) show 0% bridge frequency for all models.
- Gemini polysemy retest (triple 1): bridge frequency CI does not overlap with other models' CIs (confirms divergence is real, not noise).
- At least one Gemini-success prediction confirmed (triple 2, 3, or 6 shows Gemini bridge frequency > 0.30).
- At least one Gemini-failure prediction confirmed (triple 4 or 5 shows Gemini bridge frequency < 0.10 with 20-rep CI not overlapping other models).
- Bridge frequency CIs with 20 reps are visibly tighter than Phase 3B's 10-rep CIs (compare triple 1 and 4 against Phase 3B baselines).
- Findings report generated with all sections populated, including per-triple model comparison tables.
