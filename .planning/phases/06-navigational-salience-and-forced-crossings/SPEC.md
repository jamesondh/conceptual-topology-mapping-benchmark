# Phase 6: Navigational Salience Mapping and Forced Crossings

## Context

Phase 5 delivered two of its four pre-registered headline predictions and produced the benchmark's sharpest methodological lesson: intuitive cue-strength ratings do not predict bridge frequency. "Germination" outperformed "plant" (rated very-high) in all 4 models; the aggregate cross-axis bridge frequency exceeded same-axis, driven primarily by the loan-bank-shore forced crossing (0.95-1.00); the aggregate W-shape test failed while individual model/pair signals were strong but positionally variable. The three highest-priority open questions from the Phase 5 analysis are: (1) can we *measure* navigational salience empirically rather than guessing at it? (2) do forced crossings reduce path asymmetry as the bottleneck model predicts? and (3) where do bridge concepts actually anchor in the positional sequence? Phase 6 attacks all three, ordered by cost:

- **Part A** -- Navigational salience mapping (~1,200 runs, ~$4-5)
- **Part B** -- Forced-crossing asymmetry test (~640 runs, ~$2-3)
- **Part C** -- Positional bridge scanning (~480 runs, ~$1.50-2.50)

Total budget: ~2,320 new API runs, ~$7.50-10.50.

---

## Part A: Navigational Salience Mapping

**Core question:** Can we empirically measure navigational salience rather than guessing at it? For a focal pair A-C, what is the frequency distribution of all intermediate concepts that models actually traverse?

**Hypothesis:** The navigational salience landscape for any well-studied A-C pair is heavy-tailed: a small number of waypoint concepts (1-3) appear at high frequency across repeated paths, while the vast majority of unique waypoints appear once or twice. The identity of the top-3 waypoints is partially model-dependent (cross-model overlap on top-3 is 40-70%, not 0% or 100%). This heavy-tailed structure is the empirical signature of bridge-as-bottleneck topology.

**Primary pre-registered test:** For at least 6 of 8 focal pairs, the waypoint frequency distribution (pooled across all 4 models for that pair) fits a power-law or log-normal model significantly better than a uniform distribution (KS test, p < 0.05 after Bonferroni correction for 8 pair-level tests). Per-model breakdowns are reported as secondary analyses.

### Design

Select 8 focal pairs from Phases 1-5 with varying bridge strength and topology:

| # | Pair (A -> C) | Known Bridge | Bridge Freq Range | Rationale |
|---|---------------|-------------|-------------------|-----------|
| 1 | music -> mathematics | harmony | 0.00-1.00 | Model-variable bridge; strongest W-shape signal |
| 2 | sun -> desert | heat | 0.90-1.00 | Universal bridge; tight causal chain |
| 3 | seed -> garden | germination | 0.15-1.00 | Process-naming bridge; "plant" surprise |
| 4 | light -> color | spectrum | 1.00 | Universal bridge; strongest cross-phase signal |
| 5 | bank -> ocean | river | 0.00-1.00 | Polysemy-mediated; Gemini fails |
| 6 | emotion -> melancholy | nostalgia/sadness | 0.00-0.80 | Abstract affective; model-variable |
| 7 | language -> thought | none found | 0.00 | Bridge-absent control; off-axis failure |
| 8 | hot -> cold | none found | 0.00 | Bridge-absent control; off-axis failure ("energy" associated but on physics axis, not temperature gradient) |

For each pair and model, collect 40 direct A-to-C paths with 5 waypoints. Extract all unique waypoint tokens per pair/model. Compute the frequency of each unique waypoint across the 40 paths (frequency = count / 40).

#### Why 40 Reps

Phase 1 used 10 reps for initial characterization; Phase 4 used 30 reps for bridge frequency estimation. 40 reps provides sufficient resolution to distinguish heavy-tailed from uniform distributions (a waypoint appearing 3/40 = 7.5% is distinguishable from noise, while 1/40 = 2.5% is not). Going beyond 50 provides diminishing returns for distribution fitting.

### Run Budget

| Pair Category | Pairs | Reps/model | Models | Runs |
|---------------|-------|-----------|--------|------|
| Bridge-present (pairs 1-6) | 6 | 40 | 4 | 960 |
| Bridge-absent controls (pairs 7-8) | 2 | 30 | 4 | 240 |
| **Total** | **8** | | | **1,200** |

Controls use 30 reps (sufficient to confirm absence of dominant waypoints without full distribution fitting).

### Analysis Plan

1. **Waypoint frequency distributions.** For each pair/model, rank all unique waypoints by frequency and plot the rank-frequency curve. Fit power-law, log-normal, and uniform models; select best fit via AIC.
2. **Heavy-tail test.** KS test of observed distribution against uniform baseline. Primary test: significant departure from uniformity for 6+ of 8 pairs.
3. **Cross-model salience agreement.** For each pair, compute the overlap between top-3 waypoints across all 6 model pairs (4C2). Report mean Jaccard on top-3 sets.
4. **Retroactive cue-strength calibration.** Compare empirical salience rankings to Phase 5A's intuitive cue-strength ratings. For each controlled family from 5A, check whether the empirically most-salient waypoint matches the intuitively highest-rated bridge.
5. **Bridge-absent landscape characterization.** For language-thought and hot-cold, characterize the waypoint distribution shape. If flat (no dominant waypoints), this confirms that bridge absence corresponds to navigational diffusion rather than alternative bottlenecks.
6. **Novelty detection.** Flag any waypoint appearing at >20% frequency that was not anticipated as a bridge concept in prior phases. These are empirically discovered bridges.

### Predictions

1. All 6 bridge-present pairs show heavy-tailed distributions (top waypoint at >30% frequency).
2. Bridge-absent pairs show flatter distributions (top waypoint at <15% frequency).
3. Cross-model top-3 overlap: Jaccard 0.40-0.70 for universal bridges (sun-desert, light-color), Jaccard 0.10-0.40 for model-variable bridges (music-mathematics, emotion-melancholy).
4. "Germination" ranks higher than "plant" in the seed-garden salience landscape for Claude, Grok, and Gemini. GPT shows "plant" and "germination" at comparable frequency.
5. At least one previously unidentified waypoint emerges at >20% frequency for one pair, revealing a navigational route not captured by prior phase bridge analysis.
6. Claude's distributions are the most peaked (lowest entropy) and Grok's the flattest (highest entropy), consistent with Phase 1 gait rigidity.

---

## Part B: Forced-Crossing Asymmetry Test

**Core question:** Do forced crossings -- where a polysemous concept is the only connection between two otherwise disconnected domains -- reduce path asymmetry compared to same-domain paths?

**Hypothesis:** Forced-crossing pairs show significantly lower asymmetry index than both same-axis pairs and the Phase 2 baseline mean of 0.811. The bottleneck model predicts that when only one route exists between A and C, the forward path (A-to-C) and reverse path (C-to-A) must traverse the same bottleneck, producing higher bidirectional overlap and therefore lower asymmetry. Same-axis pairs, with multiple alternative routes, retain the high asymmetry characteristic of unconstrained navigation.

**Primary pre-registered test:** Mean asymmetry index for forced-crossing pairs (1-3) is significantly lower than the mean asymmetry index for same-axis comparison pairs (5-8) within Phase 6. 95% bootstrap CI on (forced-crossing mean - same-axis mean) excludes zero. **Secondary comparator:** difference from the Phase 2 baseline of 0.811 (noting that Phase 2 used 5-waypoint paths while Phase 6 uses 7-waypoint paths, making the comparison approximate).

### Design

Collect forward and reverse paths for forced-crossing pairs and same-axis comparison pairs. All paths use 7 waypoints.

#### Forced-Crossing Pairs

| # | Forward | Reverse | Bridge | Status | Bridge Freq |
|---|---------|---------|--------|--------|------------|
| 1 | loan -> shore | shore -> loan | bank | **validated** (Phase 5B) | 0.95-1.00 (non-Gemini) |
| 2 | deposit -> river | river -> deposit | bank | **exploratory** (new pair) | predicted high |
| 3 | savings -> cliff | cliff -> savings | bank | **exploratory** (new pair) | predicted high |
| 4 | photon -> heavy | heavy -> photon | light | **validated** (Phase 5B) | 0.00-1.00 (model-variable) |

Note: Pairs 2 and 3 are new forced-crossing configurations not tested in prior phases. They extend the loan-bank-shore finding to test whether forced-crossing asymmetry reduction generalizes across different bank-mediated pairs. Pair 4 (photon-heavy via light) showed variable bridge frequency in 5B (Claude 1.00, GPT/Grok 0.35, Gemini 0.00) and serves as a within-design contrast — a pair where the forced crossing activates for some models but not others, allowing within-pair comparison of asymmetry vs bridge activation.

#### Same-Axis Comparison Pairs

| # | Forward | Reverse | Domain | Expected Asymmetry |
|---|---------|---------|--------|-------------------|
| 5 | loan -> savings | savings -> loan | financial | baseline (~0.80) |
| 6 | river -> shore | shore -> river | geographic | baseline (~0.80) |
| 7 | sun -> desert | desert -> sun | physical-causal | baseline (~0.80) |
| 8 | seed -> garden | garden -> seed | biological | baseline (~0.80) |

### Run Budget

| Category | Pairs | Directions | Reps/model | Models | Runs |
|----------|-------|-----------|-----------|--------|------|
| Forced-crossing | 4 | 2 (fwd+rev) | 10 | 4 | 320 |
| Same-axis comparison | 4 | 2 (fwd+rev) | 10 | 4 | 320 |
| **Total** | **8** | | | | **640** |

All runs use 7 waypoints.

**After reuse:** Phase 2 collected forward/reverse paths for some of these pairs at 5 waypoints. Those data cannot be directly compared (different waypoint count), so all runs are new. However, Phase 2 asymmetry indices serve as the pre-registered baseline for comparison.

### Analysis Plan

1. **Asymmetry index computation.** For each pair/model, compute Jaccard overlap of forward and reverse waypoint sets, then asymmetry = 1 - Jaccard. Report per-pair, per-model, and aggregate.
2. **Forced-crossing vs. same-axis (primary test).** Bootstrap CI on (forced-crossing mean - same-axis mean). Primary test: CI excludes zero (forced-crossing asymmetry significantly lower than same-axis).
3. **Forced-crossing vs. Phase 2 baseline (secondary).** Bootstrap CI on (mean forced-crossing asymmetry - 0.811). Secondary comparator with caveat: Phase 2 used 5-waypoint paths, Phase 6 uses 7-waypoint paths.
4. **Bridge positional consistency.** For each forced-crossing pair/model, identify the bridge concept in both forward and reverse paths. Compute the positional index of the bridge in each direction. Test whether the bridge appears at the same structural position (±1 position) in forward and reverse paths.
5. **Per-model analysis.** Compare forced-crossing asymmetry reduction across models. Gemini should show no reduction on loan-shore (bridge does not activate) while other models show reduction.
6. **Pair 4 control analysis.** If photon-heavy shows baseline asymmetry despite being a cross-axis pair, this confirms that bridge activation (not mere polysemy) is the mechanism reducing asymmetry.

### Predictions

1. Forced-crossing pairs 1-3 (bank-mediated): mean asymmetry index 0.50-0.70, significantly below 0.811.
2. Pair 4 (photon-heavy via light): asymmetry index 0.75-0.90, not significantly different from baseline.
3. Same-axis pairs: asymmetry index 0.70-0.90, not significantly different from 0.811.
4. Gemini on forced-crossing pairs: asymmetry index 0.75-0.90 (bridge does not activate for Gemini, so no asymmetry reduction).
5. Bridge positional consistency: the bridge concept ("bank") appears within ±1 position in forward vs. reverse for >70% of runs (non-Gemini models).
6. Claude shows the lowest forced-crossing asymmetry (most constrained by the bottleneck), consistent with its rigid navigational gait.

---

## Part C: Positional Bridge Scanning

**Core question:** Where do bridge concepts anchor in the positional sequence? Is the position fixed, variable, or model-dependent? Can we replace the rigid midpoint assumption (position 4 of 7) with a data-driven peak-detection approach?

**Hypothesis:** Bridge concepts anchor at predictable but non-midpoint positions that vary by pair and model. The anchor position correlates with the ratio of semantic distances d(A,B)/d(A,C): bridges closer to A anchor earlier (positions 2-3), bridges equidistant anchor at the midpoint (position 4), and bridges closer to C anchor later (positions 5-6). Converting from fixed-position to peak-detection recovers the W-shape signal that was null in aggregate in Phase 5C.

**Primary pre-registered test:** Peak-detection W-shape contrast (convergence at empirically identified peak position minus mean of its two neighbors) is positive (> 0.05) for bridge-present pairs, with bootstrap CI excluding zero. This contrast should significantly exceed the same statistic computed at the fixed midpoint (position 4).

### Design

Reuse Phase 5C's 7-waypoint bidirectional path data where available; collect new paths only for pairs not adequately covered. Focus on pairs with known bridges and sufficient data for positional analysis.

#### Primary Pairs (reuse 5C data + supplement)

| # | Pair (A -> C) | Known Bridge | 5C Data | New Runs Needed |
|---|---------------|-------------|---------|----------------|
| 1 | light -> color | spectrum | 10 reps x 4 models x 2 dirs | 0 (reuse) |
| 2 | bank -> savings | deposit | 10 reps x 4 models x 2 dirs | 0 (reuse) |
| 3 | animal -> poodle | dog | 10 reps x 4 models x 2 dirs | 0 (reuse) |
| 4 | music -> mathematics | harmony | 10 reps x 4 models x 2 dirs | 0 (reuse) |
| 5 | tree -> ecosystem | forest | 10 reps x 4 models x 2 dirs | 0 (reuse) |

#### New Pairs (forced-crossing bridges, from Part B)

| # | Pair (A -> C) | Expected Bridge | New Runs Needed |
|---|---------------|----------------|----------------|
| 6 | loan -> shore | bank | 10 reps x 4 models x 2 dirs = 80 |
| 7 | deposit -> river | bank | 10 reps x 4 models x 2 dirs = 80 |

#### Position-Contrast Pairs (bridges expected at non-midpoint positions)

| # | Pair (A -> C) | Bridge | Expected Position | Rationale |
|---|---------------|--------|------------------|-----------|
| 8 | sun -> desert | heat | early (2-3) | Heat is close to sun (d(A,B) << d(B,C)) |
| 9 | seed -> garden | germination | middle (3-5) | Process spans the full transformation |
| 10 | emotion -> melancholy | sadness | late (4-6) | Sadness is closer to melancholy than to generic emotion |

### Run Budget

| Category | Pairs | New Runs |
|----------|-------|----------|
| Primary pairs (reuse 5C) | 5 | 0 |
| Forced-crossing bridges | 2 | 160 |
| Position-contrast pairs | 3 | 10 reps x 4 models x 2 dirs = 240 |
| Supplemental reps for primary pairs | 0 | 0 |
| **Total new runs** | | **400** |

**Adjusted with margin:** ~480 new runs (20% buffer for retries and additional reps if positional signal is noisy).

### Analysis Plan

1. **Per-position bridge frequency.** For each pair/model, compute the fraction of paths where the known bridge concept appears at each of the 7 positions. Identify the modal position (the peak).
2. **Peak-detection W-shape contrast.** At the modal position, compute mirror-match rate minus mean of its two neighbors. Bootstrap CI on this contrast across bridge-present pairs.
3. **Comparison with fixed-midpoint contrast.** Compute the same contrast at position 4 (Phase 5C method). Paired comparison: peak-detection contrast vs. fixed-midpoint contrast. If peak-detection is significantly larger, the rigid midpoint assumption was obscuring a real signal.
4. **Positional prediction from semantic distance.** Estimate d(A,B)/d(A,C) using within-Phase 6 data: for each pair with a known bridge B, compute the mean waypoint distance (1 - Jaccard) from A-to-B paths and A-to-C paths collected in Part A or from existing data. Regress modal bridge position on this ratio. Test whether the correlation is significant (r > 0.50, p < 0.05). Where Part A data is unavailable for specific A-B or B-C legs, use existing Phase 3B/5A leg data as fallback.
5. **Cross-model positional agreement.** For each pair, compare modal bridge positions across models. Report the standard deviation of modal positions. Low SD (< 1.0) means position is pair-determined; high SD (> 1.5) means position is model-determined.
6. **Forced-crossing position analysis.** For loan-shore and deposit-river, identify where "bank" anchors. Test whether forced-crossing bridges show lower positional variance than other bridges (the bottleneck constrains not just which concept but where it appears).

### Predictions

1. Peak-detection W-shape contrast > 0.05 for bridge-present pairs; bootstrap CI excludes zero.
2. Peak-detection contrast significantly exceeds fixed-midpoint contrast (Phase 5C method) by at least 0.03.
3. Heat anchors at positions 2-3 on sun-desert (early position).
4. Germination anchors at positions 3-5 on seed-garden (middle position).
5. Sadness anchors at positions 4-6 on emotion-melancholy (late position).
6. Modal bridge position correlates with d(A,B)/d(A,C) ratio at r > 0.50.
7. Forced-crossing bridges (bank on loan-shore) show lower positional variance (SD < 0.8) than non-forced bridges (SD > 1.2).
8. Claude shows the lowest positional variance across all pairs (consistent with rigid gait).

---

## Files

| Action | File | Lines |
|--------|------|-------|
| Create | `src/data/pairs-phase6.ts` | ~120 (Phase 6 pair definitions with salience metadata, forced-crossing labels) |
| Create | `experiments/06a-salience.ts` | ~350 (salience mapping runner: 40-rep collection, waypoint extraction) |
| Create | `experiments/06b-forced-crossing.ts` | ~300 (forced-crossing asymmetry runner: fwd/rev 7-waypoint paths) |
| Create | `experiments/06c-positional.ts` | ~250 (positional bridge scanning runner, reuses 5C data) |
| Create | `analysis/06a-salience.ts` | ~500 (frequency distributions, KS tests, cross-model agreement, retroactive calibration) |
| Create | `analysis/06b-forced-crossing.ts` | ~400 (asymmetry computation, bootstrap CIs, bridge positional consistency) |
| Create | `analysis/06c-positional.ts` | ~450 (peak detection, position regression, cross-model positional agreement) |
| Modify | `src/types.ts` | ~60 (SalienceLandscape, ForcedCrossingPair, PositionalProfile types) |
| Modify | `src/metrics.ts` | ~80 (KS test helper, peak-detection contrast, positional variance) |
| Modify | `src/canonicalize.ts` | ~20 (waypoint frequency counter utility) |
| Modify | `package.json` | ~6 scripts |

## Docs to Update

- `.planning/STATE.md` -- Phase 6 summary, key findings, blockers
- `.planning/ROADMAP.md` -- Phase 6 completion entry, Phase 7 direction
- `findings/06-analysis.md` -- Interpretive analysis (Opus subagent)
- `findings/06a-salience.md` -- Generated findings (analysis script)
- `findings/06b-forced-crossing.md` -- Generated findings (analysis script)
- `findings/06c-positional.md` -- Generated findings (analysis script)

## Execution Order

```bash
# Part A -- ~8-10 min
bun run salience                    # ~1,200 runs
bun run analyze-salience

# Part B -- ~5-6 min
bun run forced-crossing             # ~640 runs
bun run analyze-forced-crossing

# Part C -- ~3-4 min
bun run positional                  # ~480 runs (+ reuse 5C data)
bun run analyze-positional

# Or run everything:
bun run phase6
```

## Implementation Order

1. Add types to `src/types.ts` (SalienceLandscape, ForcedCrossingPair, PositionalProfile)
2. Add metrics to `src/metrics.ts` (KS test, peak-detection contrast, positional variance, waypoint frequency)
3. Add utility to `src/canonicalize.ts` (waypoint frequency counter across repeated paths)
4. Create `src/data/pairs-phase6.ts` (all pair definitions: 8 salience pairs, 8 asymmetry pairs, 10 positional pairs)
5. Create and run Part A experiment + analysis
6. Create and run Part B experiment + analysis
7. Create and run Part C experiment + analysis (reusing 5C data where available)
8. Write interpretive analysis (`findings/06-analysis.md`)
9. Update `.planning/STATE.md`, `ROADMAP.md`
10. Commit

## Totals

- **New files:** 7 (pairs-phase6, 3 experiments, 3 analyses)
- **Modified files:** 4 (types.ts, metrics.ts, canonicalize.ts, package.json)
- **New code:** ~2,530 lines
- **New API runs:** ~2,320 (Part A: ~1,200 + Part B: ~640 + Part C: ~480)
- **Reused data:** Phase 5C 7-waypoint paths for 5 pairs (400 existing runs: 10 reps × 4 models × 2 dirs × 5 pairs)
- **Runtime:** ~18-22 minutes total
- **Cost:** ~$7.50-10.50 via OpenRouter

## Verification

### Part A
- Waypoint frequency distributions computed for all 8 pairs x 4 models = 32 distributions
- KS test rejects uniformity for at least 6 of 8 pairs (per-model, after Bonferroni)
- Top-3 waypoint cross-model Jaccard reported for all pairs
- Retroactive calibration comparison with Phase 5A cue-strength ratings completed
- At least one novel waypoint discovered (>20% frequency, not previously identified as bridge)
- `setMetricsSeed(42)` for reproducibility

### Part B
- Forward and reverse paths collected for all 8 pairs x 4 models x 10 reps
- Asymmetry index computed per pair/model
- Forced-crossing mean asymmetry significantly below same-axis mean (bootstrap CI on difference excludes zero)
- Secondary: forced-crossing mean asymmetry below Phase 2 baseline of 0.811 (approximate comparison due to different waypoint counts)
- Bridge positional consistency analysis completed for forced-crossing pairs
- Gemini treated separately in analysis (expected no asymmetry reduction)
- Pair 4 (photon-heavy) serves as within-design control with baseline-level asymmetry

### Part C
- Per-position bridge frequency computed for all pairs with known bridges
- Peak-detection W-shape contrast positive (> 0.05) for bridge-present pairs, CI excludes zero
- Peak-detection contrast exceeds fixed-midpoint contrast (paired comparison significant)
- Modal bridge position reported for all pair/model combinations
- Semantic distance ratio regression completed with reported r and p values
- Phase 5C data successfully loaded and integrated for primary pairs

## Done When

- All three experiments complete with < 5% failure rate
- Analysis scripts produce findings docs for all three parts
- Waypoint frequency distributions are heavy-tailed for 6+ of 8 focal pairs
- Forced-crossing asymmetry significantly below same-axis asymmetry (primary); compared to Phase 2 baseline (secondary)
- Peak-detection W-shape contrast significantly positive for bridge-present pairs
- Cross-model salience agreement quantified for all pairs
- Retroactive cue-strength calibration completed (Phase 5A comparison)
- Bridge positional variance compared between forced-crossing and non-forced bridges
- Interpretive analysis written
- STATE.md and ROADMAP.md updated
