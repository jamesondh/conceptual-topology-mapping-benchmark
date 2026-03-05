# Phase 8: Bridge Fragility Mechanism and Gemini Gradient Blindness

## Context

Phase 7 delivered the benchmark's first causal result -- pre-filling a waypoint genuinely displaces bridge concepts -- but the displacement revealed a striking bimodal pattern that was not predicted: some bridges collapse entirely under perturbation while others survive robustly. Phase 7A found that harmony (music-mathematics) and germination (seed-garden) drop to 0.000 survival under any pre-fill condition, while sadness (emotion-melancholy) survives at 0.750 and dog (animal-poodle) at 0.900. The mechanism proposed in H8 is **route exclusivity**: bridges with navigational competitors (harmony competes with rhythm, pattern, frequency, ratio) are fragile, while bridges without competitors (sadness is essentially the only route from emotion to melancholy) are robust. Phase 8A directly tests this mechanism using the Phase 6A salience landscape data to quantify competitor counts, then validates the predictor on new pairs.

Phase 7C simultaneously uncovered a new dimension of Gemini's fragmentation. Gemini produces systematic zeros on univocal within-frame bridges -- tree (0.000), dough (0.000), speak (0.000), noon (0.000) -- where Claude, GPT, and Grok show frequencies of 0.700-1.000. This is not the polysemous frame-crossing failure identified in Phase 4 (H1): these concepts are not polysemous and do not require sense-switching. Phase 7C also found that gradient-spectrum bridges outperform causal-chain bridges (0.730 vs 0.496). Phase 8B tests whether Gemini's zeros are specifically concentrated on gradient-midpoint bridges, which would indicate a deficit in representing continuous semantic dimensions.

Phase 8 also addresses the cross-model distance validity crisis (O18, r = 0.170) with a lightweight gait-normalization experiment (Part C). If dividing raw Jaccard distances by a model-specific baseline rescues cross-model correlation, the curvature research program is salvageable. If not, model-independent geometry is definitively blocked.

Phase 8 is designed as three experiments, ordered by priority and cost:

- **Part A** -- Bridge fragility mechanism (~1,010 runs, ~$3-4)
- **Part B** -- Gemini gradient blindness (~1,280 runs, ~$4-5)
- **Part C** -- Gait-normalized distance metric (~640 runs, ~$2-3)

Total budget: ~2,930 new API runs, ~$10-13.

---

## Part A: Bridge Fragility Mechanism

**Core question:** Does the number of navigational competitors (alternative waypoints that could substitute for the bridge) predict whether a bridge survives pre-fill displacement?

**Background:** Phase 7A found bimodal bridge fragility (H8). The survival distribution under pre-fill is not continuous but clusters into four bands:

| Pattern | Bridges | Pre-fill Survival | Unconstrained Freq |
|---------|---------|-------------------|-------------------|
| COLLAPSED | harmony, germination | 0.000 | 0.550-0.583 |
| FRAGILE | bank (loan-shore), river (bank-ocean) | 0.267-0.300 | 0.600-0.717 |
| PARTIALLY ROBUST | spectrum, heat | 0.567-0.575 | 0.917 |
| ROBUST | sadness, dog | 0.750-0.900 | 0.950-0.970 |

The proposed mechanism is route exclusivity. Phase 6A collected full salience landscapes (40 runs per model) for 8 pairs, yielding waypoint frequency distributions with 5-36 unique waypoints per model-pair. These distributions contain the raw data needed to measure how many alternative routes exist for each bridge. A bridge with many high-frequency competitors (harmony competes with rhythm, pattern, symmetry, frequency) should be fragile because pre-filling position 1 opens a slot that a competitor can fill. A bridge with no high-frequency competitors (sadness has no alternative route from emotion to melancholy) should be robust because even when position 1 is occupied, no alternative is available to replace it.

Phase 8A has two stages:
1. **Retrospective analysis** (0 new API runs): Compute alternative-waypoint counts from existing Phase 6A salience data for the 6 pairs that overlap with Phase 7A, then correlate with observed pre-fill survival.
2. **Prospective validation** (new API runs): Select 8 new pairs specifically chosen to span the competitor-count range, run pre-fill displacement experiments on them, and test whether the retrospective predictor generalizes.

**Hypothesis:** Bridge pre-fill survival is a decreasing function of the number of high-frequency alternative waypoints. Pairs where the bridge has 3+ competitors at >20% frequency will show survival below 0.30; pairs where the bridge has 0-1 competitors will show survival above 0.60.

**Primary pre-registered test:** Spearman rank correlation between alternative-waypoint count (number of non-bridge waypoints at >20% frequency in the Phase 6A salience landscape) and pre-fill survival rate is negative and significant. 95% bootstrap CI on rho excludes zero.

### Design

#### Stage 1: Retrospective Competitor Count Extraction

For each of the 6 Phase 6A pairs that also have Phase 7A pre-fill data, extract the competitor count from the existing salience landscapes:

| Pair | Bridge | Phase 6A Waypoints >20% Freq (non-bridge, cross-model mean) | Phase 7A Pre-fill Survival | Predicted Pattern |
|------|--------|-------------------------------------------------------------|---------------------------|-------------------|
| music-mathematics | harmony | ~8-12 (rhythm, pattern, symmetry, frequency, ratio, etc.) | 0.000 | COLLAPSED |
| seed-garden | germination | ~6-10 (sprout, cultivation, root, plant, soil, etc.) | 0.000 | COLLAPSED |
| bank-ocean | river | ~5-8 (estuary, shore, coastline, sea, current, etc.) | 0.300 | FRAGILE |
| light-color | spectrum | ~4-6 (wavelength, prism, hue, refraction, etc.) | 0.575 | PARTIALLY ROBUST |
| sun-desert | heat | ~3-5 (drought, radiation, warmth, etc.) | 0.567 | PARTIALLY ROBUST |
| emotion-melancholy | sadness | ~1-3 (mood, grief, sorrow, etc.) | 0.750 | ROBUST |

The exact counts will be computed from the stored salience landscape data. The prediction is a monotonic negative relationship: more competitors implies lower survival.

**Competitor count definition:** A competitor is any non-bridge waypoint that appears at >20% frequency in at least 2 of 4 models' salience landscapes for a given pair. The 20% threshold is chosen because Phase 6A used it as the cutoff for "novel waypoints" (O11), and the 2-of-4-models requirement ensures the competitor is not a model-specific artifact.

#### Stage 2: Prospective Validation on New Pairs

We need 8 new pairs that span the competitor-count spectrum. The key design constraint: we must be able to *predict* the competitor count before running the experiment, then verify it. We select pairs based on structural properties that predict competitor count:

**Low-competitor pairs (predicted 0-2 competitors):** These are pairs where the bridge concept is the only plausible intermediate -- either because the pair endpoints define a very narrow continuum or because the bridge names the unique relationship.

| # | Pair (A -> C) | Predicted Bridge | Why Low Competitors | Predicted Competitor Count | Pre-fill Concept (X) |
|---|---------------|-----------------|--------------------|--------------------------|--------------------|
| 1 | question -> answer | reasoning | Only plausible cognitive process linking the two | 0-1 | inquiry |
| 2 | parent -> child | birth | The defining relationship; no alternative route | 0-1 | family |
| 3 | cause -> effect | mechanism | The explanatory link; few alternatives | 1-2 | reason |

**Medium-competitor pairs (predicted 3-5 competitors):** These are pairs where multiple routes exist but none dominate.

| # | Pair (A -> C) | Predicted Bridge | Why Medium Competitors | Predicted Competitor Count | Pre-fill Concept (X) |
|---|---------------|-----------------|----------------------|--------------------------|---------------------|
| 4 | winter -> summer | spring | Seasonal progression; autumn also competes | 3-4 | snow |
| 5 | student -> professor | research | Academic trajectory; but teaching, degree, PhD also plausible | 3-5 | university |

**High-competitor pairs (predicted 6+ competitors):** These are pairs where many routes compete, analogous to music-mathematics.

| # | Pair (A -> C) | Predicted Bridge | Why High Competitors | Predicted Competitor Count | Pre-fill Concept (X) |
|---|---------------|-----------------|---------------------|--------------------------|--------------------|
| 6 | science -> art | creativity | Cross-domain; many bridges possible (imagination, design, innovation, beauty, aesthetics, expression) | 6-10 | experiment |
| 7 | ocean -> mountain | landscape | Geographic pair; many routes (coast, river, valley, terrain, elevation, geography, land) | 6-10 | wave |
| 8 | brain -> computer | algorithm | Cross-domain analogy; many bridges (network, logic, processing, intelligence, circuit, memory, computation) | 8-12 | neuron |

#### Pre-Fill Selection Criteria

For each new pair, we select one incongruent pre-fill concept (shown in the tables above). We use only the incongruent condition because Phase 7A demonstrated that pre-fill content (incongruent vs congruent vs neutral) does not significantly affect displacement -- only pre-fill *presence* matters. Using a single pre-fill condition halves the run budget compared to the full Phase 7A design while retaining the critical comparison: unconstrained bridge frequency vs pre-filled bridge survival.

**Evaluability gate:** A pair is only evaluable for the fragility analysis if its candidate bridge has unconstrained frequency ≥ 0.40 (cross-model mean). Pairs below this threshold cannot distinguish "bridge is fragile" from "bridge was misspecified." If fewer than 5 of 8 new pairs pass this gate, additional pairs should be collected.

The incongruent pre-fill is selected to satisfy:
1. Plausible as a first waypoint (associated with the starting concept).
2. Not the predicted bridge concept.
3. Not semantically equivalent to the bridge.

#### Salience Landscape Collection for New Pairs

To measure the actual competitor count for each new pair, we collect a salience landscape (20 runs per model, half of Phase 6A's 40) before running the pre-fill experiment. This two-stage design means:
1. First, collect unconstrained paths (20 reps x 4 models x 8 pairs = 640 runs) and compute competitor counts.
2. Then, collect pre-filled paths (10 reps x 4 models x 8 pairs = 320 runs) and measure survival.
3. Correlate competitor count with survival.

The 20-rep salience collection is sufficient to identify waypoints at >20% true frequency with reasonable confidence. At 20 reps, a waypoint with true frequency 0.20 has SE ~0.09, yielding an observed frequency between 0.05 and 0.35 in ~95% of samples. The threshold classification accuracy (correctly classifying >20% vs ≤20%) is approximately 80% at the boundary — adequate for competitor counting but not for precise frequency estimation. It is smaller than Phase 6A's 40-rep design because we need approximate counts, not full distributional characterization.

### Run Budget

| Condition | Pairs | Reps/model | Models | Runs |
|-----------|-------|-----------|--------|------|
| Salience landscape (unconstrained, new pairs) | 8 | 20 | 4 | 640 |
| Incongruent pre-fill (new pairs) | 8 | 10 | 4 | 320 |
| Retrospective analysis (Phase 6A + 7A data) | 6 | (existing) | 4 | 0 |
| **Subtotal** | | | | **960** |

After 5% retry buffer: **~1,010 new runs.**

Note: We reduced from the original 1,200 estimate by using only one pre-fill condition (incongruent) instead of three. Phase 7A demonstrated that condition type does not significantly affect displacement, so this is a safe simplification.

**Cost caveat:** If the retrospective analysis (Stage 1) shows r < -0.50 with the 6 existing pairs before any new runs are collected, the prospective validation (Stage 2) becomes confirmatory rather than exploratory. If Stage 1 shows r > -0.30 (weak or no relationship), we should reconsider whether competitor count is the right predictor before investing in Stage 2.

### Analysis Plan

1. **Retrospective competitor count extraction.** For each of the 6 overlap pairs, count non-bridge waypoints appearing at >20% frequency in at least 2 of 4 models' Phase 6A salience landscapes. Report counts per pair.

2. **Retrospective correlation (primary test, Stage 1).** Compute Spearman rank correlation between competitor count (6 data points) and Phase 7A pre-fill survival rate. Report rho, 95% bootstrap CI. Even with only 6 points, the predicted ordering (high competitors -> low survival) is testable as a rank-order prediction.

3. **Prospective competitor count measurement.** From the new 20-rep salience data, compute competitor counts for each of the 8 new pairs using the same definition. Compare predicted competitor counts (from the table above) to observed counts. Report prediction accuracy.

4. **Prospective survival measurement.** For each new pair, compute bridge frequency across all pre-filled runs (pooled across models). Compute bridge survival rate (fraction of runs containing the bridge at any position in the pre-filled condition, divided by bridge frequency in the unconstrained condition).

5. **Combined correlation (primary test, Stage 2).** Compute Spearman rank correlation between competitor count and pre-fill survival across all 14 pairs (6 retrospective + 8 prospective). 95% bootstrap CI on rho. This is the definitive test of H8.

6. **Threshold analysis.** Is there a critical competitor count above which bridges reliably collapse? Test whether a step function (survival = high if competitors <= k, low if competitors > k) fits the data better than a linear model. Report the best-fitting threshold k and its classification accuracy.

7. **Per-model competitor count.** Compute competitor counts separately per model. Test whether Claude (narrow vocabulary, low entropy) produces fewer competitors than GPT (broad vocabulary, high entropy). If Claude's competitor counts are systematically lower, Claude's bridges should be paradoxically more robust -- contradicting the Phase 7A finding that Claude shows the highest displacement. This would indicate that competitor count interacts with gait in a non-trivial way.

8. **Cross-validation.** Leave-one-out cross-validation: for each of the 14 pairs, predict its survival from the competitor count using the regression trained on the remaining 13. Report mean prediction error.

### Predictions

1. Retrospective Spearman correlation (6 pairs) between competitor count and pre-fill survival is rho < -0.70 (strong negative). Bootstrap CI on rho excludes zero.
2. Prospective correlation (14 pairs combined) is rho < -0.60 and CI excludes zero.
3. Low-competitor pairs (question-answer, parent-child, cause-effect) show pre-fill survival > 0.60.
4. High-competitor pairs (science-art, ocean-mountain, brain-computer) show pre-fill survival < 0.30.
5. Medium-competitor pairs (winter-summer, student-professor) show pre-fill survival between 0.25 and 0.60.
6. A step-function threshold exists at approximately k = 3-4 competitors: pairs above the threshold collapse, pairs below survive.
7. The predicted competitor counts (from structural reasoning) correlate with the observed competitor counts (from salience data) at r > 0.60 across the 8 new pairs.
8. Claude produces the fewest competitors per pair (lowest mean competitor count across all pairs), consistent with its narrow navigational vocabulary.

---

## Part B: Gemini Gradient Blindness

**Core question:** Does Gemini systematically fail on gradient-midpoint bridges while succeeding on causal-chain bridges, and is this failure larger than for other models?

**Background:** Phase 7C found that gradient-spectrum bridges outperform causal-chain bridges (0.730 vs 0.496 aggregate across all models). But Gemini's pattern is qualitatively different from the other three models. Gemini produces 0.000 on tree (acorn-timber), dough (flour-bread), speak (whisper-shout), water (ice-steam), and noon (dawn-dusk), while the other models show 0.700-1.000 on these same pairs. This extends H1 (Gemini's frame-crossing failure) beyond polysemous concepts to univocal within-frame bridges.

The Phase 7C analysis proposed an explanation: Gemini may not represent continuous semantic dimensions as well as other models. If "speak" between whisper and shout is a gradient midpoint on a vocal-intensity continuum, and Gemini does not represent this continuum, then "speak" fails not because of frame-crossing but because of gradient blindness -- an inability to navigate through the midpoint of a continuous dimension. This would predict that Gemini's zeros are concentrated on gradient-midpoint pairs and that Gemini performs normally on causal-chain pairs (where navigation proceeds through sequential steps rather than along a continuum).

However, the Phase 7C data is insufficient to test this. The gradient and causal-chain pairs were not matched for difficulty, associative strength, or domain. A dedicated experiment is needed with carefully constructed pair sets.

**Hypothesis:** Gemini shows a significantly larger gradient-vs-causal-chain gap than other models. Specifically, Gemini's bridge frequency on gradient-midpoint pairs is at least 0.30 lower than its bridge frequency on causal-chain pairs, and this gap is at least 0.20 larger than the gap for non-Gemini models.

**Primary pre-registered test:** The interaction effect (model x pair-type) is significant: Gemini's gradient-minus-causal difference is more negative than the non-Gemini mean difference. 95% bootstrap CI on (Gemini gap minus non-Gemini gap) excludes zero.

### Design

#### Pair Construction

We construct two matched sets: 10 gradient-midpoint pairs and 10 causal-chain pairs. Each set is designed to span multiple semantic domains, preventing domain confounds.

**Gradient-midpoint pairs:** The bridge occupies a position on a continuous dimension between the endpoints. The dimension is nameable (temperature, volume, size, age, speed, brightness, etc.) and the bridge names a specific region.

| # | Pair (A -> C) | Gradient Bridge | Dimension | Expected Freq (non-Gemini) | Expected Freq (Gemini) |
|---|---------------|----------------|-----------|--------------------------|----------------------|
| 1 | whisper -> shout | speak | vocal intensity | 0.80-1.00 | < 0.20 |
| 2 | hot -> cold | warm | temperature | 0.90-1.00 | 0.30-0.80 |
| 3 | dawn -> dusk | noon | time of day | 0.50-0.80 | < 0.20 |
| 4 | infant -> elderly | adolescent | life stage | 0.60-0.90 | < 0.30 |

Note: Pairs 1-4 in the gradient set partially overlap with Phase 7C (whisper-shout, hot-cold, dawn-dusk, infant-elderly) using the same bridge concepts for direct replication. Infant-elderly uses "adolescent" (matching Phase 7C), not "adult."
| 5 | crawl -> sprint | walk | locomotion speed | 0.60-0.90 | < 0.30 |
| 6 | pond -> ocean | lake | water body scale | 0.50-0.80 | < 0.30 |
| 7 | pebble -> boulder | rock | size of stone | 0.60-0.90 | < 0.30 |
| 8 | drizzle -> downpour | rain | precipitation intensity | 0.50-0.80 | < 0.30 |
| 9 | village -> metropolis | city | settlement scale | 0.60-0.90 | < 0.30 |
| 10 | murmur -> scream | speech | vocal intensity (broader) | 0.50-0.80 | < 0.30 |

**Causal-chain pairs:** The bridge names a step in a causal or temporal process connecting the endpoints. There is no continuous dimension; instead, the bridge is a discrete stage.

| # | Pair (A -> C) | Causal Bridge | Process | Expected Freq (non-Gemini) | Expected Freq (Gemini) |
|---|---------------|--------------|---------|--------------------------|----------------------|
| 1 | grape -> wine | fermentation | winemaking | 0.60-0.90 | 0.30-0.80 |
| 2 | ore -> jewelry | metal | smelting-crafting | 0.50-0.80 | 0.20-0.60 |
| 3 | caterpillar -> butterfly | cocoon | metamorphosis | 0.70-1.00 | 0.30-0.80 |
| 4 | clay -> vase | pottery | crafting process | 0.50-0.80 | 0.20-0.60 |
| 5 | wool -> sweater | yarn | textile process | 0.50-0.80 | 0.20-0.60 |
| 6 | milk -> cheese | curd | dairy process | 0.40-0.70 | 0.20-0.50 |
| 7 | seed -> fruit | flower | plant reproduction | 0.60-0.90 | 0.20-0.60 |
| 8 | sand -> glass | heat | manufacturing | 0.60-0.90 | 0.30-0.70 |
| 9 | acorn -> timber | tree | growth-harvest | 0.80-1.00 | < 0.20 |
| 10 | flour -> bread | dough | baking process | 0.80-1.00 | < 0.20 |

**Confound note:** Causal pairs 9-10 (acorn-timber, flour-bread) are known Gemini-zeros from Phase 7C. Their inclusion serves as replication but could inflate the interaction test if Gemini's zeros on these pairs are not specifically gradient-related. The primary interaction test should be reported both with and without these two pairs to assess sensitivity. The 8 novel causal pairs (1-8) provide the uncontaminated test.

#### Selection Criteria

Pairs are selected to satisfy:
1. **Single-frame:** Both endpoints and the bridge concept operate within a single semantic frame. No polysemous pivot is required. This ensures any Gemini failure is not attributable to frame-crossing (H1).
2. **Unambiguous bridge:** The bridge concept is the most obvious intermediate. Human raters would identify it immediately.
3. **Domain diversity:** The 20 pairs span physical processes, biological processes, sensory dimensions, temporal sequences, and scale dimensions.
4. **No overlap with Phase 7C:** Pairs 1-4 in the gradient set partially overlap with Phase 7C (whisper-shout, hot-cold, dawn-dusk, infant-elderly). We re-run these at higher rep count (15 vs Phase 7C's 10) for increased precision and to confirm replication. The remaining 6 gradient pairs and all 10 causal-chain pairs are new.

#### Why 10 Pairs per Set

The Phase 7C gradient-vs-causal comparison used 5 gradient and 5 causal-chain pairs, which was sufficient to detect the aggregate difference (0.730 vs 0.496) but underpowered for the interaction test (does Gemini show a *larger* gap?). With 10 pairs per set, we have 10 gradient x 4 models = 40 model-pair observations and 10 causal x 4 models = 40 model-pair observations. The interaction test compares Gemini's gap (10 gradient - 10 causal) to the non-Gemini gap (30 gradient - 30 causal), with sufficient statistical power to detect a difference of 0.20 or larger.

### Run Budget

| Condition | Pairs | Reps/model | Models | Runs |
|-----------|-------|-----------|--------|------|
| Gradient-midpoint pairs (4 replication + 6 new) | 10 | 15 | 4 | 600 |
| Causal-chain pairs (all new) | 10 | 15 | 4 | 600 |
| **Subtotal** | | | | **1,200** |

After 5% retry buffer and Phase 7C partial reuse for 4 gradient pairs (but re-running at 15 reps for consistency): **~1,280 new runs.**

We use 15 reps per model per pair (up from Phase 7C's 10) because the interaction test requires tighter frequency estimates. At 15 reps, SE for a bridge frequency of 0.50 is ~0.13, sufficient to distinguish frequencies that differ by 0.25+.

### Analysis Plan

1. **Bridge frequency measurement.** For each of the 20 pairs, compute bridge frequency (candidate bridge appears at any position) per model. Report as a 20 x 4 matrix.

2. **Gradient vs causal-chain comparison (replication).** Aggregate bridge frequency for gradient pairs vs causal-chain pairs across all models. Test whether gradient > causal (replicating Phase 7C O17). Bootstrap CI on difference.

3. **Gemini gradient gap (primary test).** Compute Gemini's gradient mean minus Gemini's causal-chain mean. Compute the same gap for non-Gemini models (pooled). Test whether Gemini's gap is more negative than non-Gemini's gap. Bootstrap CI on the interaction (Gemini gap minus non-Gemini gap). Primary test: CI excludes zero.

4. **Per-model gradient performance.** Report gradient-midpoint bridge frequency per model. Test whether Gemini is the lowest. If Claude, GPT, and Grok all show gradient freq > 0.60 and Gemini shows < 0.30, the gradient-blindness characterization is supported.

5. **Gemini zero-rate analysis.** Count the number of pairs where Gemini shows 0.000 bridge frequency. Count the same for other models. Compare the Gemini zero rate to the non-Gemini zero rate. If Gemini produces zeros on >50% of gradient pairs but <20% of causal-chain pairs, the gradient-blindness hypothesis is strongly supported.

6. **Domain-matched gradient-causal comparison.** Where possible, compare gradient and causal pairs from the same domain (e.g., crawl-sprint "walk" vs caterpillar-butterfly "cocoon" -- both biological/physical). This controls for domain familiarity effects.

7. **Replication of Phase 7C pairs.** For the 4 gradient pairs that overlap with Phase 7C (whisper-shout, hot-cold, dawn-dusk, infant-elderly), compare Phase 8B frequencies to Phase 7C frequencies per model. Stability within 0.15 indicates replication.

8. **Gemini alternative routing.** For Gemini zero-frequency pairs, examine which waypoints Gemini *does* use. If Gemini routes through semantically related but non-midpoint concepts (e.g., for whisper-shout, routes through "voice" or "sound" rather than "speak"), this suggests the gradient midpoint is accessible but not navigated through. If Gemini produces entirely unrelated waypoints, the gradient blindness is more severe.

### Predictions

1. The gradient > causal-chain bridge frequency replicates: gradient mean > causal-chain mean by at least 0.15, CI excludes zero.
2. Gemini's gradient-midpoint mean bridge frequency is below 0.25 (across all 10 gradient pairs).
3. Gemini's causal-chain mean bridge frequency is above 0.40 (across all 10 causal-chain pairs).
4. Gemini's gradient-minus-causal gap is at least 0.20 more negative than the non-Gemini gap. The interaction CI excludes zero.
5. Gemini produces 0.000 bridge frequency on at least 5 of 10 gradient-midpoint pairs.
6. Gemini produces 0.000 bridge frequency on at most 2 of 10 causal-chain pairs.
7. Non-Gemini models (Claude, GPT, Grok) show gradient mean > 0.60 and causal-chain mean > 0.50, with gradient-minus-causal gap < 0.15.
8. The 4 Phase 7C replication pairs show bridge frequencies within 0.15 of their Phase 7C values for all models.
9. Gemini's alternative routing on zero-frequency gradient pairs uses generic concepts (e.g., "sound," "voice," "temperature") rather than gradient midpoints, indicating the midpoint concept is accessible but not activated as a navigational waypoint.

---

## Part C: Gait-Normalized Distance Metric

**Core question:** Can dividing raw navigational distances by a model-specific baseline produce a cross-model distance metric with r > 0.50?

**Background:** Phase 7B's cross-model distance correlation (r = 0.170) means models do not agree on how far apart concepts are. Claude sees a compact space (mean triangle excess 0.225); GPT and Grok see an expansive space (0.680-0.689). The distance metric is contaminated by R1 (model gaits). Without a valid cross-model distance metric, the curvature research program cannot make model-independent claims.

Phase 7's open question 10b proposed gait normalization: compute a baseline distance scale for each model from a reference set of pairs, then normalize all distances by dividing by the model's mean reference distance. If the gait difference is primarily a scale factor (Claude sees everything as 0.3x closer than GPT), normalization should rescue the correlation. If the gait difference is more complex (Claude sees some pairs as close and others as far, in a pattern that does not match GPT's), normalization will not help, and model-independent geometry is definitively blocked.

**Hypothesis:** Gait-normalized cross-model distance correlation exceeds r = 0.50, indicating that after removing the scale difference, models agree on the relative ordering of concept-pair distances.

**Primary pre-registered test:** Pearson correlation of gait-normalized distances across all model pairs is r > 0.50. 95% CI on r excludes 0.30 (i.e., the lower bound of the CI is above 0.30, confirming a substantial correlation, not just a barely-positive one).

### Design

#### Reference Pair Set

To normalize gait, we need a set of "reference pairs" that span a range of distances and are measured on all four models. We use 8 reference pairs selected to cover the distance spectrum:

| # | Pair (A -> C) | Expected Distance | Distance Type |
|---|---------------|------------------|---------------|
| 1 | hot -> cold | Short (close antonyms) | Tight continuum |
| 2 | cat -> dog | Short (co-hyponyms) | Taxonomic |
| 3 | music -> mathematics | Medium (cross-domain) | Cross-domain |
| 4 | loan -> shore | Medium-long (forced crossing) | Polysemous |
| 5 | science -> art | Long (cross-domain) | Cross-domain |
| 6 | brain -> computer | Long (cross-domain analogy) | Analogical |
| 7 | spark -> telescope | Very long (unrelated) | Control-random |
| 8 | mountain -> library | Very long (unrelated) | Control-random |

Pairs 1-4 overlap with prior phases (Phase 6A, 7A, 7B data can be partially reused). Pairs 5-8 overlap with Phase 8A/B designs and their unconstrained data can be shared. For any pair lacking sufficient prior data at 7 waypoints, we collect new runs.

#### Test Pair Set

To test whether normalization rescues cross-model correlation, we need a separate set of "test pairs" whose distances are measured but not used for normalization. We use 8 test pairs:

| # | Pair (A -> C) | Expected Distance | Data Source |
|---|---------------|------------------|-------------|
| 1 | sun -> desert | Short-medium | Phase 6A (reuse) |
| 2 | seed -> garden | Short-medium | Phase 6A (reuse) |
| 3 | emotion -> melancholy | Medium | Phase 6A (reuse) |
| 4 | light -> color | Short | Phase 6A (reuse) |
| 5 | question -> answer | Short | Phase 8A (shared) |
| 6 | winter -> summer | Medium | Phase 8A (shared) |
| 7 | ocean -> mountain | Long | Phase 8A (shared) |
| 8 | caterpillar -> butterfly | Medium | Phase 8B (shared) |

#### Distance Computation

For each pair and model, compute navigational distance as:

    d(A,C) = 1 - mean pairwise Jaccard(run_i, run_j) for all i != j

This is the same cross-run distance metric used in Phase 7B. Each pair requires at least 10 runs per model to compute stable pairwise Jaccard estimates.

#### Normalization Procedure

For each model m:
1. Compute raw distance d_m(A,C) for all 8 reference pairs.
2. Compute baseline_m = mean of d_m across the 8 reference pairs.
3. For each test pair, compute normalized distance: d_norm_m(A,C) = d_m(A,C) / baseline_m.

Then compute pairwise Pearson correlations for each of the 6 model pairs (4C2 = 6) on the 8 test-pair distances after normalization. Aggregate these 6 pairwise r values using Fisher-z transformation: z_i = atanh(r_i), then mean_z = mean(z_i), then r_aggregate = tanh(mean_z). Report both the individual 6 pairwise r values and the Fisher-z aggregate. Compare to the same procedure applied to raw (unnormalized) correlation.

#### Why This Might Work

The gait differences observed in Phase 7B suggest a scale factor. Claude's mean triangle excess (0.225) is ~3x smaller than GPT's (0.680). If Claude's distances are systematically 0.33x of GPT's, dividing by the respective baselines should align the scales. The question is whether the relationship is purely multiplicative or involves more complex distortions (e.g., Claude compresses some regions but not others).

#### Why This Might Fail

If models do not agree on the *ordering* of distances (Claude thinks A-B is closer than C-D, but GPT thinks the opposite), no scalar normalization can rescue the correlation. The Phase 7B r = 0.170 might reflect genuine disagreement about relative distances, not just scale differences. This is the most informative failure mode: it would prove that conceptual geometry is genuinely model-specific, not merely measured on different scales.

### Run Budget

| Source | Pairs | Reps/model | Models | New Runs |
|--------|-------|-----------|--------|----------|
| Reference pairs 1-4 (partial reuse from Phases 6A, 7A, 7B) | 4 | 10 (top-up where needed) | 4 | ~80 |
| Reference pairs 5-8 (shared with Phase 8A/B unconstrained runs) | 4 | 10 | 4 | 0* |
| Test pairs 1-4 (reuse Phase 6A data, 40 reps available) | 4 | 10 (extract from existing) | 4 | 0 |
| Test pairs 5-8 (shared with Phase 8A/B unconstrained runs) | 4 | 10 | 4 | 0* |
| Dedicated reference/test collection for gaps | ~6 | 15 | 4 | ~360 |
| **Subtotal** | | | | **~440** |

*Pairs marked 0* share unconstrained data with Phase 8A/B experiments. Their runs are already counted in Part A or Part B budgets. However, some reference/test pairs may not overlap with 8A/8B, requiring dedicated collection.

After reuse assessment and 5% buffer: **~640 new runs** (conservative estimate accounting for pairs that lack prior data at 7 waypoints and need dedicated collection).

**Cost note:** Phase 8C is the cheapest part of the phase because it heavily reuses existing data and shares unconstrained runs with Parts A and B. The 640 figure is a conservative upper bound; actual new runs may be as low as 400 if data sharing works well.

### Analysis Plan

1. **Raw distance computation.** For each of the 16 pairs (8 reference + 8 test) and 4 models, compute d(A,C) = 1 - mean pairwise Jaccard. Report the 16 x 4 distance matrix.

2. **Baseline computation.** For each model, compute baseline_m = mean distance across the 8 reference pairs. Report baseline per model. Claude should have the lowest baseline (compact space); GPT/Grok the highest.

3. **Normalization.** For each test pair and model, compute d_norm = d_raw / baseline_m.

4. **Raw cross-model correlation.** Compute Pearson correlation of raw test distances across all 6 model pairs. This should replicate Phase 7B's r ~ 0.17, confirming the distance metric crisis on the new data.

5. **Normalized cross-model correlation (primary test).** Compute Pearson correlation of normalized test distances across all 6 model pairs. Primary test: r > 0.50, CI lower bound > 0.30.

6. **Per-model-pair correlations.** Report the 6 individual model-pair correlations (Claude-GPT, Claude-Grok, Claude-Gemini, GPT-Grok, GPT-Gemini, Grok-Gemini) before and after normalization. If normalization helps some pairs more than others, this reveals which gait differences are primarily scale-based.

7. **Rank-order stability.** Compute Spearman rank correlation on the test distances before and after normalization. If rank correlations are already high before normalization (models agree on ordering but not scale), the normalization is cosmetic. If rank correlations improve after normalization, the normalization is correcting non-trivial distortions.

8. **Residual analysis.** For the normalized distances, identify pairs where models still disagree by more than 1 SD. These are candidates for "model-specific geometric distortions" that go beyond scale differences.

9. **Curvature re-estimation (conditional).** If normalized r > 0.50 (primary test passes), re-compute Phase 7B triangle excess using normalized distances for the 8 triangles (using the Phase 7B data). Test whether the polysemous-vs-non-polysemous curvature comparison changes under normalization. This is exploratory and conditional on the primary test passing.

### Predictions

1. Raw cross-model distance correlation on the test pairs replicates Phase 7B: r < 0.30.
2. Claude's baseline distance is the lowest (< 0.40); GPT's and Grok's are the highest (> 0.60).
3. Gait-normalized cross-model correlation exceeds r = 0.50. CI lower bound exceeds 0.30.
4. The normalization improvement (normalized r minus raw r) is at least 0.25.
5. Claude-GPT raw correlation is the lowest of the 6 model pairs (most discrepant gaits); normalization improves it the most.
6. Rank-order (Spearman) correlation improves after normalization, indicating the gait difference is partially scale-based rather than purely ordinal.
7. If the primary test passes: re-estimated polysemous excess under normalized distances remains non-significant (the Phase 7B null replicates even with corrected distances), confirming that the curvature null is genuine rather than an artifact of scale incompatibility.
8. If the primary test fails (normalized r < 0.40): model-independent conceptual geometry is definitively blocked with path-based measurements. The curvature program should be abandoned as a cross-model endeavor.

---

## Files

| Action | File | Lines |
|--------|------|-------|
| Create | `src/data/pairs-phase8.ts` | ~250 (Phase 8 pair definitions: fragility pairs, gradient-midpoint pairs, causal-chain pairs, reference/test distance pairs) |
| Create | `experiments/08a-fragility.ts` | ~400 (two-stage runner: salience landscape collection, then pre-fill displacement experiment) |
| Create | `experiments/08b-gradient.ts` | ~300 (gradient vs causal-chain bridge frequency collection, all 20 pairs) |
| Create | `experiments/08c-gait-norm.ts` | ~250 (reference/test distance collection, reuse management, dedicated gap-filling runs) |
| Create | `analysis/08a-fragility.ts` | ~500 (competitor count extraction from 6A data, retrospective correlation, prospective correlation, threshold analysis, cross-validation) |
| Create | `analysis/08b-gradient.ts` | ~400 (bridge frequency matrix, gradient vs causal comparison, Gemini interaction test, zero-rate analysis, alternative routing characterization) |
| Create | `analysis/08c-gait-norm.ts` | ~450 (distance computation, baseline normalization, raw vs normalized cross-model correlation, rank-order stability, conditional curvature re-estimation) |
| Modify | `src/types.ts` | ~80 (Phase8FragilityPair, Phase8GradientPair, Phase8DistancePair, Phase8FragilityOutput, Phase8GradientOutput, Phase8GaitNormOutput types) |
| Modify | `src/metrics.ts` | ~60 (competitor count extractor, gait-normalization distance computation, interaction effect bootstrap) |
| Modify | `package.json` | ~8 scripts |

## Docs to Update

- `.planning/STATE.md` -- Phase 8 summary, key findings, blockers
- `.planning/ROADMAP.md` -- Phase 7 completion entry, Phase 8 implementation
- `findings/CLAIMS.md` -- Update H8 (confirmed or revised), add new observations from Phase 8
- `findings/08-analysis.md` -- Interpretive analysis (Opus subagent)
- `findings/08a-fragility.md` -- Generated findings (analysis script)
- `findings/08b-gradient.md` -- Generated findings (analysis script)
- `findings/08c-gait-norm.md` -- Generated findings (analysis script)
- `.planning/GRAVEYARD.md` -- Add any new dead ends from Phase 8

## Execution Order

```bash
# Part A -- Stage 1: Retrospective analysis (no new runs)
bun run analyze-fragility-retro          # Extract competitor counts from Phase 6A data

# Part A -- Stage 2: Prospective experiment (~8-10 min)
bun run fragility                        # ~1,010 runs (salience + pre-fill)
bun run analyze-fragility

# Part B -- (~8-10 min)
bun run gradient                         # ~1,280 runs
bun run analyze-gradient

# Part C -- (~5-7 min)
bun run gait-norm                        # ~640 runs
bun run analyze-gait-norm

# Or run everything:
bun run phase8
```

## Implementation Order

1. Add types to `src/types.ts` (Phase8FragilityPair, Phase8GradientPair, Phase8DistancePair, analysis output types)
2. Add metrics to `src/metrics.ts` (competitor count extractor from salience landscape data, gait-normalization distance computation, interaction effect bootstrap)
3. Create `src/data/pairs-phase8.ts` (all pair definitions: 8 fragility pairs, 20 gradient/causal pairs, 16 distance reference/test pairs)
4. Run Part A Stage 1: retrospective analysis on existing Phase 6A + 7A data (no new runs; validates the competitor-count predictor before investing in new data)
5. Assess Stage 1 result: if retrospective rho > -0.30, reconsider pair selection for Stage 2 before proceeding
6. Create and run Part A Stage 2 experiment + analysis (depends on Phase 6A salience landscape format)
7. Create and run Part B experiment + analysis (independent of Part A)
8. Create and run Part C experiment + analysis (shares some unconstrained data with Parts A and B)
9. Write interpretive analysis (`findings/08-analysis.md`)
10. Update `.planning/STATE.md`, `ROADMAP.md`, `findings/CLAIMS.md`, `.planning/GRAVEYARD.md`
11. Commit

## Totals

- **New files:** 7 (pairs-phase8, 3 experiments, 3 analyses)
- **Modified files:** 3 (types.ts, metrics.ts, package.json)
- **New code:** ~2,690 lines
- **New API runs:** ~2,930 (Part A: ~1,010 + Part B: ~1,280 + Part C: ~640)
- **Reused data:** Phase 6A salience landscapes (6 pairs, 40 reps/model), Phase 7A pre-fill survival data (8 pairs), Phase 7C bridge frequencies (4 gradient pairs), Phase 7B distance data (partial), Phase 6A distance data (4 pairs)
- **Runtime:** ~25-30 minutes total
- **Cost:** ~$10-13 via OpenRouter

## Verification

### Part A
- Stage 1 retrospective analysis produces competitor counts for 6 pairs from existing Phase 6A data
- Retrospective correlation (rho, CI) computed and reported
- Stage 2 salience landscapes collected for all 8 new pairs x 4 models x 20 reps = 640 new runs
- Stage 2 pre-fill paths collected for all 8 new pairs x 4 models x 10 reps = 320 new runs
- Competitor counts computed for all 8 new pairs and compared to predictions
- Combined 14-pair correlation computed with bootstrap CI
- Threshold analysis completed (step function vs linear)
- Per-model competitor counts reported
- Leave-one-out cross-validation completed
- `setMetricsSeed(42)` for reproducibility

### Part B
- All 20 pairs x 4 models x 15 reps collected = 1,200 runs (+ retry buffer)
- 20 x 4 bridge frequency matrix computed and reported
- Gradient vs causal-chain aggregate comparison completed (replication of O17)
- Gemini interaction test completed with bootstrap CI
- Gemini zero-rate counted and compared to non-Gemini zero-rate
- Phase 7C replication check completed for 4 gradient pairs
- Gemini alternative routing characterized for zero-frequency pairs
- Per-model gradient performance reported

### Part C
- Distance computed for all 16 pairs x 4 models
- Baseline computed per model from 8 reference pairs
- Raw cross-model correlation computed and compared to Phase 7B r = 0.170
- Normalized cross-model correlation computed (primary test)
- Per-model-pair correlations reported before and after normalization
- Rank-order stability analysis completed
- If primary test passes: conditional curvature re-estimation completed
- All data sources (reuse vs new) documented

## Done When

- All three experiments complete with < 5% failure rate
- Analysis scripts produce findings docs for all three parts
- Part A delivers a quantitative predictor of bridge fragility
  - Competitor count correlates negatively with pre-fill survival (rho < -0.50, CI excludes zero), confirming H8, OR
  - Null result with tight CIs rules out correlation > -0.30, rejecting the route-exclusivity mechanism and opening search for alternative predictors
- Part B characterizes Gemini's gradient blindness
  - Gemini shows a significantly larger gradient-vs-causal gap than other models (interaction CI excludes zero), extending H1 to gradient dimensions, OR
  - Gemini's gap is not significantly larger (interaction CI includes zero), indicating the Phase 7C zeros were domain-specific rather than gradient-specific
- Part C resolves the distance metric crisis
  - Gait-normalized correlation exceeds r = 0.50, rescuing cross-model geometry, OR
  - Normalization fails (r < 0.40), definitively blocking model-independent geometry with path-based measurements
- Interpretive analysis written connecting all three parts to the benchmark's theoretical framework
- Graveyard updated with any new dead ends
- CLAIMS.md updated with Phase 8's new observations, hypothesis updates (H8 confirmed/revised, H1 extended), and any new graveyard entries
- STATE.md and ROADMAP.md updated
