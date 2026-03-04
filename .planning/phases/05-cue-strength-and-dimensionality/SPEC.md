# Phase 5: Cue-Strength Thresholds and Conceptual Dimensionality

## Context

Phase 4 produced two results that open the most promising experimental directions:

1. **The frame-crossing hypothesis of Gemini's fragmentation.** Gemini succeeds on within-frame bridges (deposit-savings 1.00, spectrum-color 1.00) and fails on cross-frame bridges (forest-ecosystem 0.10, river-ocean 0.00). The 04-analysis proposes that the boundary is characterized by *cue strength* between adjacent concepts: Gemini requires tighter associative links than other models to sustain bridge navigation. This is a testable, quantifiable hypothesis.

2. **The "metaphor" surprise and multi-axis navigation.** "Metaphor" is plausibly associated with both "language" and "thought" yet appears on 0% of paths between them. Combined with the Phase 3 hot-energy-cold result (where "energy" is associated with both endpoints but occupies a different axis), this demonstrates that conceptual space has multiple independent navigational dimensions. How many? Can we identify them?

Phase 5 investigates both in a single phase, ordered by cost:
- **Part A** -- Cue-strength threshold experiment (~1,680 runs, ~$5-7)
- **Part B** -- Dimensionality probing experiment (~960 runs, ~$3-4)
- **Part C** -- Triple-anchor convergence test (~640 runs, ~$2-3)

Total budget: ~3,280 new API runs, ~$10-14.

---

## Part A: Cue-Strength Threshold Experiment

**Core question:** Is there a measurable cue-strength threshold below which bridge frequency drops to zero, and does Gemini's threshold differ from other models'?

**Hypothesis:** All models show monotonically decreasing bridge frequency as the cue strength between adjacent concepts in a triple weakens. Gemini's threshold (the cue strength at which bridge frequency drops below 0.10) is higher than Claude's, GPT's, and Grok's. This predicts a family of sigmoid curves indexed by model, with Gemini's curve shifted rightward (requiring stronger cues to sustain bridging).

**Primary pre-registered test:** Gemini's logistic threshold parameter (the cue level at which fitted bridge frequency = 0.50) is significantly higher than the mean of the other three models' thresholds. "Significant" means the 95% bootstrap CI on the threshold difference excludes zero.

### Design

To isolate cue strength from confounds (domain, abstraction level, causality type), use **controlled families**: pairs of triples that share the same A and C endpoints but vary the bridge concept B from high-cue to low-cue. This holds the navigational problem constant while changing only the bridge's associative strength.

#### Controlled Family 1: Physical Causation (A=sun, C=desert)

| # | Triple (A, B, C) | Cue Level | Rationale |
|---|-----------------|-----------|-----------|
| 1 | sun -> heat -> desert | very high | Causal mechanism. "Heat" is the primary connection. |
| 2 | sun -> radiation -> desert | medium | Scientific mechanism. Same causal chain, less colloquial cue. |
| 3 | sun -> solstice -> desert | low | Temporal association. "Solstice" is related to sun but not on the sun-to-desert pathway. |

#### Controlled Family 2: Biological Growth (A=seed, C=garden)

| # | Triple (A, B, C) | Cue Level | Rationale |
|---|-----------------|-----------|-----------|
| 4 | seed -> plant -> garden | very high | Direct growth sequence. "Plant" is the product of seed and unit of garden. |
| 5 | seed -> germination -> garden | medium | Process bridge. Correct mechanism but more technical, less immediately cued. |
| 6 | seed -> husk -> garden | low | Part-of-seed association. Not on the seed-to-garden navigational path. |

#### Controlled Family 3: Compositional Hierarchy (A=word, C=paragraph)

| # | Triple (A, B, C) | Cue Level | Rationale |
|---|-----------------|-----------|-----------|
| 7 | word -> sentence -> paragraph | very high | Tight sequential composition. |
| 8 | word -> clause -> paragraph | medium | Grammatical unit, correct hierarchy but less prototypical. |
| 9 | word -> syllable -> paragraph | low | Sub-word unit. Associated with "word" but goes the wrong direction (down, not up). |

#### Controlled Family 4: Abstract Affect (A=emotion, C=melancholy)

| # | Triple (A, B, C) | Cue Level | Rationale |
|---|-----------------|-----------|-----------|
| 10 | emotion -> sadness -> melancholy | high | Direct taxonomic narrowing. "Sadness" is a strong cue from "emotion" and near "melancholy." |
| 11 | emotion -> nostalgia -> melancholy | medium | Retest from Phase 4. Known model-variable bridge (Claude 0.37, Grok 0.70, Gemini 0.00). |
| 12 | emotion -> apathy -> melancholy | low | Related affect but not on the path. "Apathy" is emotionally distant from "melancholy." |

#### Controls

| # | Triple (A, B, C) | Type | Rationale |
|---|-----------------|------|-----------|
| 13 | sun -> umbrella -> desert | random-control | "Umbrella" is associated with sun but not on the path to desert. |
| 14 | seed -> telescope -> garden | random-control | Unrelated bridge. |

### Run Budget

| Triple | Leg | Reps/model | Models | Runs |
|--------|-----|-----------|--------|------|
| 1-12 (diagnostic) | AC | 20 | 4 | 960 |
| 1-12 (diagnostic) | AB | 10 | 4 | 480 |
| 1-12 (diagnostic) | BC | 10 | 4 | 480 |
| 13-14 (controls) | AC | 10 | 4 | 80 |
| 13-14 (controls) | AB | 10 | 4 | 80 |
| 13-14 (controls) | BC | 10 | 4 | 80 |
| **Total** | | | | **2,160** |

**After reuse:** Triple 11 (emotion-nostalgia-melancholy) has existing data from Phase 4B (10 reps AB, 30 reps BC, 30 reps AC). Top up AC to 20 reps = need 0 new AC runs (already have 30). Need 0 BC, 0 AB. Saves ~120 runs.

**Adjusted total: ~2,040 new runs.** But many AB/BC legs are optional (only needed for transitivity). If we collect AC legs first and AB/BC only for triples where bridge is detected:

**Minimum viable: ~1,040 new runs** (AC legs only for all 14 triples + AB/BC for triples showing bridge freq > 0.10).

**Recommended: ~1,680 new runs** (full 3-leg collection for all diagnostic triples; AC-only for controls).

### Analysis Plan

1. **Within-family bridge frequency gradient.** For each controlled family, plot bridge frequency across the 3 cue levels. The primary test is whether bridge frequency decreases monotonically within each family.
2. **Cross-family logistic fit.** Pool all 12 diagnostic triples (treating cue level as ordinal 1-5), fit per-model logistic curves. Extract threshold parameter per model.
3. **Gemini threshold comparison.** Bootstrap CI on the difference between Gemini's threshold and the mean of the other three models. Primary test: CI excludes zero.
4. **Transitivity vs. cue strength.** Plot transitivity against cue level to see if compositional structure degrades in parallel with bridge frequency.
5. **Cross-model agreement gradient.** Compute inter-model bridge agreement at each cue level. Does agreement break down gradually (all models lose bridges at similar points) or categorically (Gemini drops first, then others)?

### Predictions

1. Very high cue (triples 1, 4, 7): all models > 0.80 bridge frequency, including Gemini.
2. High cue (triple 10): Claude/GPT/Grok > 0.70, Gemini > 0.40.
3. Medium cue (triples 2, 5, 8, 11): This is the predicted divergence zone. Non-Gemini models should show moderate bridge frequency (0.30-0.80); Gemini should start failing (< 0.20).
4. Low cue (triples 3, 6, 9, 12): All models show low bridge frequency. The question is whether any model sustains bridging at all with a weak cue.
5. Controls (13-14): All models < 0.05.

---

## Part B: Dimensionality Probing Experiment

**Core question:** How many independent navigational axes does a model's conceptual space have in the neighborhood of a focal concept? Can we detect and label them?

**Hypothesis:** Conceptual space around a polysemous or multifaceted concept has multiple independent axes, evidenced by near-zero bridge frequency when triples span different axes and high bridge frequency when triples stay on the same axis. The number of independent axes (dimensions) is model-dependent, with Claude's dense topology supporting more interconnected dimensions than Gemini's fragmented topology.

**Primary pre-registered test:** Mean same-axis bridge frequency minus mean cross-axis bridge frequency > 0.40 (aggregate across all models and focal concepts). 95% bootstrap CI on the delta excludes zero.

**Important caveat:** Using polysemous focal concepts (light, bank) as bridge tokens means this experiment partly measures *sense disambiguation* (whether the model resolves to the correct sense of the focal concept given directional cues) in addition to *axis independence*. These are related but distinct phenomena. Same-axis triples cue a single sense consistently; cross-axis triples force a sense switch at the focal concept. To partially disentangle these, we include non-polysemous controls (Section below).

### Design

Select two focal concepts with well-known multiple associations, plus one non-polysemous control focal concept:

**Focal concept 1: "light"** (polysemous)
Known dimensions: (a) electromagnetic/physics, (b) weight/heaviness, (c) illumination/brightness, (d) divinity/spirituality

**Focal concept 2: "bank"** (polysemous)
Known dimensions: (a) financial institution, (b) river bank/geography

**Focal concept 3: "fire"** (non-polysemous control)
Known dimensions: (a) combustion/chemistry, (b) passion/motivation, (c) destruction/disaster
"Fire" is not polysemous in the same way -- it has metaphorical extensions but a single core meaning. If same-axis/cross-axis separation is similar for "fire" and "light"/"bank", the effect is about axis independence, not sense disambiguation.

#### "Light" Triples

| # | Triple (A, B, C) | Axis Pattern | Bridge | Expected |
|---|-----------------|-------------|--------|----------|
| 1 | photon -> light -> color | physics -> physics | light | High (same-axis, causal) |
| 2 | feather -> light -> heavy | weight -> weight | light | High (antonym axis) |
| 3 | candle -> light -> darkness | illumination -> illumination | light | High (same-axis, antonym) |
| 4 | photon -> light -> heavy | physics -> weight | light | Low (cross-axis) |
| 5 | candle -> light -> color | illumination -> physics | light | Medium (axes partially overlap) |
| 6 | prayer -> light -> darkness | spirituality -> illumination | light | Low-Medium (cross-axis, but metaphorical overlap) |

#### "Bank" Triples

| # | Triple (A, B, C) | Axis Pattern | Bridge | Expected |
|---|-----------------|-------------|--------|----------|
| 7 | loan -> bank -> savings | financial -> financial | bank | High (same-axis) |
| 8 | river -> bank -> shore | geographic -> geographic | bank | High (same-axis) |
| 9 | loan -> bank -> shore | financial -> geographic | bank | Low (cross-axis) |

Note: replaced `river -> bank -> cliff` with `river -> bank -> shore` for tighter same-axis design (cliff is less canonically associated with riverbanks).

#### "Fire" Triples (Non-Polysemy Control)

| # | Triple (A, B, C) | Axis Pattern | Bridge | Expected |
|---|-----------------|-------------|--------|----------|
| 10 | spark -> fire -> ash | combustion -> combustion | fire | High (same-axis) |
| 11 | ambition -> fire -> motivation | passion -> passion | fire | Medium-High (same-axis, metaphorical) |
| 12 | spark -> fire -> motivation | combustion -> passion | fire | Low (cross-axis) |

#### Controls

| # | Triple (A, B, C) | Type |
|---|-----------------|------|
| 13 | photon -> bicycle -> color | random-control |
| 14 | loan -> penguin -> savings | random-control |

### Run Budget

| Triple | Leg | Reps/model | Models | Runs |
|--------|-----|-----------|--------|------|
| 1-12 (diagnostic) | AC | 20 | 4 | 960 |
| 13-14 (controls) | AC | 10 | 4 | 80 |
| **Total (AC-only, primary)** | | | | **1,040** |
| 1-12 (diagnostic) | AB + BC | 10 | 4 | 960 |
| **Total (full 3-leg)** | | | | **2,000** |

**Recommended: ~960 new runs** (AC legs for all 14 triples at stated reps). AB/BC legs collected as follow-up only for triples showing interesting bridge frequency patterns.

### Analysis Plan

1. **Same-axis vs. cross-axis bridge frequency.** Aggregate bridge frequency for same-axis triples (1, 2, 3, 7, 8, 10, 11) vs. cross-axis triples (4, 5, 6, 9, 12). Primary test: bootstrap CI on the delta excludes zero, delta > 0.40.
2. **Polysemy vs. non-polysemy comparison.** Compare same-axis/cross-axis separation for "fire" triples (10-12) vs. "light"/"bank" triples. If separation is similar, the effect is axis independence; if it's larger for polysemous concepts, sense disambiguation is a major contributor.
3. **Partial overlap detection.** Triples 5 (candle-light-color) and 6 (prayer-light-darkness) span partially overlapping or metaphorically linked axes. If these show intermediate bridge frequency (0.20-0.60), the axes are not fully independent.
4. **Per-model dimension count.** For each focal concept, count the number of cross-axis triples with bridge frequency < 0.10. More independent dimensions = more cross-axis triples at zero.
5. **Waypoint content analysis.** For same-axis paths, identify characteristic waypoints to label each axis semantically.

### Predictions

1. Same-axis triples: bridge frequency > 0.60 for all models.
2. Cross-axis triples: bridge frequency < 0.20 for most models.
3. Partial-overlap triples: bridge frequency 0.20-0.60, model-dependent.
4. Gemini may show more extreme same-axis/cross-axis separation due to its compartmentalized topology.
5. "Fire" control shows comparable same-axis/cross-axis separation to polysemous concepts (if dimensionality, not polysemy, is the primary driver).
6. Controls: bridge frequency < 0.05 for all models.

---

## Part C: Triple-Anchor Convergence Test

**Core question:** Do bridge concepts create a third convergence anchor in the middle of the path, producing a W-shaped (rather than U-shaped) positional convergence profile?

**Hypothesis:** When a strong bridge concept is present (spectrum, deposit, dog), the positional convergence profile shifts from U-shaped (Phase 3A dual-anchor pattern) to W-shaped (three peaks: start, bridge, and end positions). When no bridge is present (metaphor, energy), the profile retains the U-shape.

**Primary pre-registered test:** W-shape contrast statistic: convergence at position 4 minus the mean of convergence at positions 3 and 5. For bridge-present pairs, this contrast should be positive (> 0.02) and significantly different from bridge-absent pairs (bootstrap CI on the difference excludes zero).

### Design

Collect **7-waypoint** forward and reverse paths (higher resolution than Phase 3A's 5-waypoint paths) for:

**Bridge-present pairs (from triples with universal bridges):**
1. light -> color (bridge: spectrum, universal 1.00)
2. bank -> savings (bridge: deposit, universal 1.00)
3. animal -> poodle (bridge: dog, universal >0.95)
4. tree -> ecosystem (bridge: forest, 3/4 models >0.95, Gemini 0.10)

**Bridge-absent pairs (universal):**
5. language -> thought (bridge: metaphor, 0.00 all models)
6. hot -> cold (bridge: energy, 0.00 all models)

**Bridge-variable pair:**
7. music -> mathematics (bridge: harmony, Claude 1.00, Grok 0.85, GPT 0.15, Gemini 0.00)

**No-bridge control:**
8. telescope -> jealousy (random pair, no bridge expected)

Note: music-mathematics is separated into a "bridge-variable" category, distinct from "bridge-absent," because its model-dependent bridge provides a natural within-pair experiment: Claude and Grok should show W-shape while GPT and Gemini should show U-shape.

#### Run Budget

| Triple Category | Pairs | Directions | Reps/model | Models | Runs |
|----------------|-------|-----------|-----------|--------|------|
| Bridge-present | 4 | 2 (fwd+rev) | 10 | 4 | 320 |
| Bridge-absent | 2 | 2 | 10 | 4 | 160 |
| Bridge-variable | 1 | 2 | 10 | 4 | 80 |
| No-bridge control | 1 | 2 | 10 | 4 | 80 |
| **Total** | **8** | | | | **640** |

All runs use 7 waypoints.

### Analysis Plan

1. **Per-position mirror-match rates.** For each pair, compute mirror-match rate at 7 positions. Compare bridge-present vs. bridge-absent profiles.
2. **W-shape detection.** For bridge-present pairs, compute the W-shape contrast statistic (position-4 convergence minus mean of positions 3 and 5). Bootstrap CI on this statistic.
3. **Bridge position identification.** For each bridge-present pair, identify which position(s) the bridge concept most frequently occupies. Test whether convergence peaks at the bridge position.
4. **Bridge-variable natural experiment.** On music-mathematics, compare convergence profiles for models that use harmony (Claude, Grok) vs. those that don't (GPT, Gemini). Same pair, different bridge usage, within-pair control for all confounds.
5. **Model comparison.** If Gemini doesn't use "forest" as a bridge on tree-ecosystem, its convergence profile should remain U-shaped while others show W-shaped.

### Predictions

1. Bridge-present pairs show W-shaped convergence: peaks at positions 1, ~4, and 7.
2. Bridge-absent pairs show U-shaped convergence: peaks at positions 1 and 7, valley in positions 3-5.
3. The W-shape contrast statistic is positive (> 0.02) for bridge-present pairs and near-zero for bridge-absent pairs.
4. On music-mathematics, Claude/Grok show W-shape (harmony bridge) while GPT/Gemini show U-shape (no harmony bridge).
5. Gemini shows U-shaped profiles on tree-ecosystem (no forest bridge) while Claude/GPT/Grok show W-shape.

---

## Files

| Action | File | Lines |
|--------|------|-------|
| Create | `triples-phase5.ts` | ~350 (all Phase 5 triple definitions with cue-strength levels, axis labels) |
| Create | `experiments/05a-cue-strength.ts` | ~400 (cue-strength gradient experiment runner) |
| Create | `experiments/05b-dimensionality.ts` | ~350 (dimensionality probing experiment runner) |
| Create | `experiments/05c-convergence.ts` | ~300 (triple-anchor convergence experiment, 7-waypoint paths) |
| Create | `analysis/05a-cue-strength.ts` | ~500 (logistic curve fitting, threshold estimation, cross-model comparison) |
| Create | `analysis/05b-dimensionality.ts` | ~450 (same-axis vs cross-axis comparison, dimension counting, axis labeling) |
| Create | `analysis/05c-convergence.ts` | ~400 (positional convergence profiles, W-shape detection) |
| Modify | `types.ts` | ~80 (Phase5Triple, CueStrengthLevel, AxisLabel, ConvergenceProfile types) |
| Modify | `metrics.ts` | ~60 (logistic fit helper, W-shape contrast statistic) |
| Modify | `index.ts` | ~10 (support --waypoints 7 flag if not already supported) |
| Modify | `package.json` | ~6 scripts |

## Docs to Update

- `.planning/STATE.md` — Phase 5 summary, key findings, blockers
- `.planning/ROADMAP.md` — Phase 5 completion entry, Phase 6 direction
- `findings/05-analysis.md` — Interpretive analysis (Opus subagent)
- `findings/05a-cue-strength.md` — Generated findings (analysis script)
- `findings/05b-dimensionality.md` — Generated findings (analysis script)
- `findings/05c-convergence.md` — Generated findings (analysis script)

## Execution Order

```bash
# Part A -- ~8-10 min
bun run cue-strength                  # ~1,680 runs
bun run analyze-cue-strength

# Part B -- ~5-7 min
bun run dimensionality                # ~960 runs
bun run analyze-dimensionality

# Part C -- ~4-5 min
bun run convergence                   # ~640 runs
bun run analyze-convergence

# Or run everything:
bun run phase5
```

## Implementation Order

1. Add types to `types.ts` (all three parts)
2. Add metrics to `metrics.ts` (logistic fit, W-shape contrast statistic)
3. Create `triples-phase5.ts` (all triple definitions: 14 cue-strength + 14 dimensionality + 8 convergence)
4. Create and run Part A experiment + analysis
5. Create and run Part B experiment + analysis
6. Create and run Part C experiment + analysis
7. Write interpretive analysis (`findings/05-analysis.md`)
8. Update `.planning/STATE.md`, `ROADMAP.md`
9. Commit & push

## Totals

- **New files:** 7 (triples-phase5, 3 experiments, 3 analyses)
- **Modified files:** 4 (types.ts, metrics.ts, index.ts, package.json)
- **New code:** ~2,900 lines
- **New API runs:** ~3,280 (Part A: ~1,680 + Part B: ~960 + Part C: ~640)
- **Runtime:** ~20-25 minutes total
- **Cost:** ~$10-14 via OpenRouter

## Verification

### Part A
- Within each controlled family, bridge frequency decreases from high-cue to low-cue triple (3 out of 4 families minimum)
- Logistic fits converge for all 4 models (no degenerate curves)
- Gemini's threshold parameter is higher than at least 2 of the 3 other models (bootstrap CI on threshold difference excludes zero)
- Controls at 0% bridge frequency
- `setMetricsSeed(42)` for reproducibility

### Part B
- Same-axis bridge frequency minus cross-axis bridge frequency > 0.40 (aggregate, bootstrap CI excludes zero)
- At least one cross-axis triple shows < 0.10 bridge frequency for all models
- At least one partial-overlap triple shows intermediate (0.20-0.60) bridge frequency
- "Fire" control shows comparable same-axis/cross-axis delta to polysemous concepts (within 0.15)
- Controls at 0% bridge frequency

### Part C
- 7-waypoint paths parse correctly (engine already supports arbitrary waypoint counts)
- Mirror-match computation generalizes from 5 to 7 positions
- W-shape contrast statistic is positive (> 0.02) for bridge-present pairs, bootstrap CI excludes zero
- W-shape contrast for bridge-present minus bridge-absent > 0, bootstrap CI excludes zero
- Gemini shows U-shape on tree-ecosystem (no forest bridge) while others show W-shape

## Done When

- All three experiments complete with < 5% failure rate
- Analysis scripts produce findings docs for all three parts
- Cue-strength gradient shows within-family monotonic decrease for 3+ families
- Gemini threshold significantly higher than at least 2 other models
- Same-axis/cross-axis delta > 0.40 with CI excluding zero
- W-shape contrast significantly positive for bridge-present pairs
- Interpretive analysis written
- STATE.md and ROADMAP.md updated
