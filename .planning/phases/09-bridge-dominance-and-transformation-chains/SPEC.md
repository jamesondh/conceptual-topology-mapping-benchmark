# Phase 9: Bridge Dominance Ratio, Transformation-Chain Blindness, and Pre-Fill Facilitation

## Context

Phase 8 was a triple negative -- all three primary hypotheses failed -- but the failures were diagnostic, not random. Each failure pointed to a more specific, more testable successor hypothesis. Phase 9 picks up these three threads and tests them directly.

**Thread 1: Bridge dominance ratio (from 8A).** The route exclusivity hypothesis (G20) predicted that competitor *count* would predict bridge fragility under pre-fill. It failed: sadness survives at 0.807 with 8 competitors while harmony collapses to 0.015 with 7. The Phase 8 analysis identified a replacement predictor -- dominance ratio (bridge frequency / strongest competitor frequency). Sadness is not merely one of several waypoints on the emotion-to-melancholy path; it is the gravitational center, appearing at 0.950 unconstrained while its strongest competitor may appear at 0.200. Harmony, by contrast, shares the music-to-mathematics landscape with rhythm, pattern, and frequency at comparable frequencies. H9 proposes that dominance ratio, not competitor count, predicts pre-fill survival. Phase 9A tests this directly using existing salience data to compute dominance ratios, then correlates with known pre-fill survival rates, supplemented by targeted new salience collection where gaps exist.

**Thread 2: Gemini transformation-chain blindness (from 8B).** The gradient-blindness hypothesis (G21) predicted Gemini would fail on gradient midpoints and succeed on causal chains. It failed backward: Gemini's zeros concentrate on causal-chain pairs (6/10 zeros) while it succeeds on gradient pairs (9/10). H10 proposes that Gemini's deficit is specifically transformation-chain blindness -- an inability to route through concepts that name intermediate states in material or biological processes (smelting, metamorphosis, baking, growth) while successfully navigating continuous-dimension positions (temperature, speed, size, age). Phase 8B's data provides a baseline, but its 10 causal pairs mixed genuine transformation chains with other process types. Phase 9B designs 10 new, carefully controlled transformation pairs matched to 10 gradient pairs, ensuring the transformation pairs are all material/biological state changes and avoiding overlap with Phase 8B pairs.

**Thread 3: Pre-fill facilitation (from 8A).** Phase 8A discovered that pre-filling can *increase* bridge frequency for marginal bridges (science-art "creativity" at survival 5.200, student-professor "research" at 2.429). H11 proposes a crossover interaction: pre-filling displaces dominant bridges (sadness, spectrum) and facilitates marginal ones (creativity, research), with the crossover point somewhere in the middle of the unconstrained frequency range. Phase 9C tests this by selecting pairs spanning the full range of unconstrained bridge frequency and applying congruent, incongruent, and neutral pre-fills to test for the crossover.

Phase 9 is designed as three experiments, ordered by priority and cost:

- **Part A** -- Bridge dominance ratio (~420 new runs + heavy reuse, ~$2-3)
- **Part B** -- Gemini transformation-chain test (~1,200 new runs, ~$4-5)
- **Part C** -- Pre-fill facilitation effect (~960 new runs after evaluability filtering, ~$3-4)

Total budget: ~2,640 new API runs (after evaluability filtering), ~$9-12.

---

## Part A: Bridge Dominance Ratio

**Core question:** Does the ratio of a bridge's unconstrained frequency to its strongest competitor's frequency predict whether the bridge survives pre-fill displacement?

**Background:** Phase 7A established that bridge fragility is bimodal (H8): some bridges survive pre-fill robustly (sadness 0.807, dog 0.900) while others collapse entirely (harmony 0.015, germination 0.000). Phase 8A attempted to explain this with competitor count and failed (G20, rho = 0.116). The Phase 8 analysis identified dominance ratio as the likely predictor -- sadness has 8 competitors but dominates them all, while harmony has 7 competitors at comparable frequency. The critical insight: it is not how many alternatives exist but how strongly the bridge dominates those alternatives.

Existing data available for reuse:
- **Phase 6A salience landscapes** (8 pairs, 40 reps/model): emotion-melancholy, music-mathematics, seed-garden, bank-ocean, light-color, sun-desert, animal-poodle, loan-shore. Full waypoint frequency distributions available.
- **Phase 7A pre-fill survival** (8 pairs, 3 conditions): same 6 pairs that overlap with Phase 6A, plus animal-poodle and loan-shore (bank).
- **Phase 8A salience landscapes** (8 new pairs, 20 reps/model): question-answer, parent-child, cause-effect, winter-summer, student-professor, science-art, ocean-mountain, brain-computer. Full waypoint frequency distributions available.
- **Phase 8A pre-fill survival** (8 pairs, 1 condition): same 8 pairs, but only 2 of 8 passed the evaluability gate (cause-effect at unconstrained freq 0.700, brain-computer at 0.588).

The total available pool for dominance ratio analysis: 6 pairs from Phase 6A/7A with both salience and pre-fill data, plus 2 evaluable pairs from Phase 8A, totaling 8 pairs. This is underpowered for a robust correlation. Phase 9A supplements with 4-6 new pairs that are specifically selected to fill gaps in the dominance ratio spectrum.

**Hypothesis (H9):** Bridge survival under pre-fill perturbation is predicted by dominance ratio (bridge unconstrained frequency / strongest competitor frequency). Pairs with dominance ratio > 3.0 will show survival > 0.50; pairs with dominance ratio < 2.0 will show survival < 0.30. Spearman correlation between dominance ratio and survival exceeds rho = 0.60.

**Primary pre-registered test:** Spearman rank correlation between dominance ratio and pre-fill survival rate across all evaluable pairs (target: 12-14 pairs) is positive and significant. 95% bootstrap CI on rho excludes zero.

### Design

#### Stage 1: Compute Dominance Ratios from Existing Data (0 new runs)

For each pair in the existing pool, compute dominance ratio from salience landscape data:

1. Identify the bridge concept and its unconstrained frequency (cross-model mean).
2. Identify the strongest non-bridge competitor (highest-frequency non-bridge waypoint, appearing at >10% frequency in at least 2 of 4 models).
3. Compute dominance ratio = bridge frequency / strongest competitor frequency.

**Competitor definition (revised from Phase 8A):** A competitor is any non-bridge waypoint that appears at >10% frequency in at least 2 of 4 models. The threshold is lowered from 8A's 20% to 10% because Phase 8A showed that even low-frequency competitors can be relevant when the bridge itself has moderate frequency. The 2-of-4-models requirement ensures the competitor is not a model-specific artifact.

Expected dominance ratios for the 6 Phase 6A/7A pairs (estimated from the analysis text):

| Pair | Bridge | Uncon. Freq | Est. Strongest Competitor | Est. Dominance Ratio | Pre-fill Survival |
|------|--------|-------------|--------------------------|---------------------|-------------------|
| emotion-melancholy | sadness | 0.950 | ~0.200 (affect/mood) | ~4.75 | 0.807 |
| light-color | spectrum | 0.917 | ~0.300 (wavelength) | ~3.06 | 0.645 |
| sun-desert | heat | 0.917 | ~0.350 (warmth/radiation) | ~2.62 | 0.691 |
| bank-ocean | river | 0.600 | ~0.250 (shore/current) | ~2.40 | 0.778 |
| music-mathematics | harmony | 0.550 | ~0.400 (rhythm/pattern) | ~1.38 | 0.015 |
| seed-garden | germination | 0.583 | ~0.350 (soil/plant/growth) | ~1.67 | 0.000 |

Note: The exact competitor frequencies will be computed from stored Phase 6A data. These estimates are based on the Phase 8 analysis descriptions and are approximate.

**Evaluability gate for Stage 1:** If the retrospective correlation across 6-8 pairs shows rho > 0.40 (positive trend in the predicted direction), proceed to Stage 2. If rho < 0.20, reassess whether dominance ratio is the right predictor before investing in new runs. This gate prevents a repeat of Phase 8A's disaster where 6/8 prospective pairs failed evaluability.

#### Stage 2: Targeted New Pairs to Fill the Dominance Ratio Spectrum (new runs)

The existing 8 pairs cluster at the extremes of the dominance ratio spectrum (high-dominance sadness/spectrum vs low-dominance harmony/germination). To test the correlation robustly, we need pairs in the middle range (dominance ratio 1.5-3.0). We also need to increase sample size to achieve reasonable statistical power.

**Selection strategy:** Choose 6 new pairs where Phase 8B data provides verified unconstrained bridge frequencies in the moderate range (0.40-0.80). These pairs have already been "piloted" by Phase 8B (15 reps/model), so their evaluability is established. No additional pilot phase is needed — the Phase 8B frequency data serves this purpose.

| # | Pair (A -> C) | Predicted Bridge | Why Moderate Dominance | Pre-fill Concept (X) | Data Source |
|---|---------------|-----------------|----------------------|---------------------|-------------|
| 1 | hot -> cold | warm | Universal gradient midpoint; but "temperature" may compete | cool | Phase 8B (reuse gradient data) |
| 2 | whisper -> shout | speak | Strong midpoint; but "voice," "volume" may compete | silence | Phase 8B (reuse gradient data) |
| 3 | grape -> wine | fermentation | Process bridge; "juice," "vineyard" may compete | harvest | Phase 8B (reuse causal data) |
| 4 | caterpillar -> butterfly | cocoon | Transformation bridge; "metamorphosis," "chrysalis" compete | wing | Phase 8B (reuse causal data) |
| 5 | dawn -> dusk | noon | Temporal midpoint; "morning," "afternoon," "day" compete | night | Phase 8B (reuse gradient data) |
| 6 | infant -> elderly | adolescent | Life stage; "adult," "child," "aging" compete | youth | Phase 8B (reuse gradient data) |

**Reuse strategy:** Pairs 1-6 all have Phase 8B unconstrained frequency data (15 reps/model). This provides bridge frequency and partial waypoint distributions. However, Phase 8B did not collect full salience landscapes (complete waypoint frequency distributions with competitor identification). For dominance ratio computation, we need to extract competitor frequencies from the Phase 8B raw path data, which contains 15 runs per model per pair -- sufficient for approximate competitor identification (>10% threshold at 15 reps has SE ~0.08).

For pairs where the Phase 8B data is insufficient to identify the strongest competitor (fewer than 10 reps showing the competitor, or the competitor frequency estimate has wide uncertainty), collect supplementary salience runs (10 additional reps/model).

For the pre-fill experiment on these 6 new pairs: collect 10 reps/model with incongruent pre-fill. Phase 7A demonstrated that pre-fill content (incongruent vs congruent vs neutral) does not significantly affect displacement magnitude, so a single pre-fill condition is sufficient for the survival measurement.

**Evaluability gate for new pairs:** A pair is evaluable for the dominance ratio analysis only if its bridge has unconstrained frequency >= 0.30 (cross-model mean). This is lower than Phase 8A's 0.40 threshold because we are now interested in the full dominance spectrum, including marginal bridges. Pairs below 0.30 are excluded from the correlation analysis but their data is retained for Part C (pre-fill facilitation).

### Run Budget

| Condition | Pairs | Reps/model | Models | Runs |
|-----------|-------|-----------|--------|------|
| Retrospective analysis (Phase 6A + 7A + 8A data) | 8 | (existing) | 4 | 0 |
| Supplementary salience (gap-filling for Phase 8B pairs) | ~4 | 10 | 4 | ~160 |
| Pre-fill displacement (new pairs) | 6 | 10 | 4 | 240 |
| **Subtotal** | | | | **~400** |

After 5% retry buffer: **~420 new runs.**

**Cost note:** Part A is the cheapest sub-experiment because it aggressively reuses Phase 6A, 7A, and 8B data. The 420 new runs are primarily the pre-fill conditions on the 6 new pairs plus gap-filling salience data. If the Phase 8B path data proves sufficient for competitor identification (all 6 pairs have identifiable competitors at 15 reps), the supplementary salience runs can be skipped, reducing the budget to ~250 new runs.

### Analysis Plan

1. **Dominance ratio computation (retrospective).** For each of the 6-8 existing pairs with salience + pre-fill data, compute bridge frequency, strongest competitor frequency, and dominance ratio from the Phase 6A/8A salience data. Report the full table with all values.

2. **Retrospective correlation (evaluability gate).** Compute Spearman rank correlation between dominance ratio and pre-fill survival across the existing pairs. Report rho and 95% bootstrap CI. If rho > 0.40, proceed to Stage 2. If rho < 0.20, halt and reassess.

3. **Dominance ratio computation (new pairs).** For each of the 6 new pairs, compute bridge frequency and strongest competitor frequency from Phase 8B data + supplementary salience runs. Report the dominance ratio table.

4. **Prospective survival measurement.** For each new pair, compute bridge frequency in the pre-fill condition. Compute survival rate = pre-fill bridge freq / unconstrained bridge freq.

5. **Combined correlation (primary test).** Compute Spearman rank correlation between dominance ratio and pre-fill survival across all evaluable pairs (target: 12-14). 95% bootstrap CI on rho. This is the definitive test of H9.

6. **Threshold analysis.** Test whether a dominance ratio threshold separates surviving from collapsed bridges. Test step function: survival = high if dominance > k, low if dominance <= k. Report the best-fitting threshold k and classification accuracy. Compare to the Phase 8A competitor-count threshold (k=5, accuracy 0.875).

7. **Dominance ratio vs competitor count.** Compute both dominance ratio and competitor count for all pairs. Report which predictor produces a stronger correlation with survival. If dominance ratio outperforms competitor count (higher |rho|, tighter CI), this validates the Phase 8 theoretical revision.

8. **Per-model analysis.** Compute dominance ratios separately per model. Test whether Claude's narrow vocabulary produces higher dominance ratios (fewer competitors at comparable frequency) than GPT's broad vocabulary. Report the model x dominance ratio interaction.

### Predictions

1. Retrospective Spearman correlation (6-8 pairs) between dominance ratio and pre-fill survival is rho > 0.50. Bootstrap CI on rho excludes zero.
2. Combined correlation (12-14 pairs) is rho > 0.60 and CI excludes zero.
3. High-dominance pairs (ratio > 3.0) show pre-fill survival > 0.50.
4. Low-dominance pairs (ratio < 2.0) show pre-fill survival < 0.30.
5. A step-function threshold exists at approximately dominance ratio = 2.5: pairs above survive, pairs below collapse. Classification accuracy > 0.80.
6. Dominance ratio produces a stronger correlation with survival than competitor count (|rho_dominance| > |rho_count| by at least 0.20).
7. Claude produces higher dominance ratios than GPT and Grok (narrower vocabulary concentrates traffic through dominant bridges).
8. At least 5 of 6 new pairs pass the evaluability gate (bridge unconstrained frequency >= 0.30). This is more conservative than Phase 8A's 2/8 pass rate because pairs are selected from Phase 8B's observed bridge frequencies, not from a priori predictions.

---

## Part B: Gemini Transformation-Chain Blindness

**Core question:** Does Gemini show a specific deficit on transformation-chain bridges (intermediate states in material/biological processes) while succeeding on gradient-midpoint bridges, and is this deficit larger than for other models?

**Background:** Phase 8B falsified the gradient-blindness hypothesis (G21) but revealed a more specific pattern: Gemini's zeros concentrate on causal-chain pairs that are specifically *transformation chains* -- where the bridge names an intermediate physical state in a manufacturing or biological process. Gemini fails on ore-jewelry "metal" (smelting), caterpillar-butterfly "cocoon" (metamorphosis), clay-vase "pottery" (crafting), seed-fruit "flower" (growth), acorn-timber "tree" (growth-harvest), and flour-bread "dough" (baking). It succeeds on 9/10 gradient pairs where the bridge names a position on a continuous dimension.

H10 proposes that Gemini's topology represents continuous dimensions (temperature, size, speed, age) as navigable gradients but represents causal processes (smelting, metamorphosis, firing, fermentation) as discrete endpoints without reliable intermediate representations. This is more specific than the original frame-crossing hypothesis (H1) and makes precise predictions about which new pairs Gemini will fail on.

Phase 8B data provides a baseline (10 gradient + 10 causal pairs, 15 reps/model), but the causal pairs mixed genuine transformation chains with other process types, and some pairs overlapped with Phase 7C. Phase 9B designs a fully new set that is more carefully controlled.

**Hypothesis (H10):** Gemini shows a significantly larger transformation-minus-gradient deficit than non-Gemini models. Specifically:
- Gemini's bridge frequency on transformation-chain pairs is at least 0.25 lower than its frequency on matched gradient pairs.
- This gap is at least 0.15 larger than the non-Gemini gap.
- The interaction CI excludes zero.

**Primary pre-registered test:** The interaction effect (model_group x pair_type) is significant: Gemini's (gradient - transformation) gap is larger than the non-Gemini mean (gradient - transformation) gap. 95% bootstrap CI on (Gemini interaction minus non-Gemini interaction) excludes zero.

### Design

#### Pair Construction: Transformation vs Gradient

Phase 9B uses 10 transformation-chain pairs and 10 gradient-midpoint pairs. All pairs are NEW -- no overlap with Phase 8B pairs, ensuring this is an independent replication/extension, not a re-test.

**Transformation-chain pairs:** The bridge names an intermediate *physical state* in a material or biological process connecting the endpoints. The bridge is a discrete stage, not a point on a continuum. Selection criteria: (a) the bridge names a tangible intermediate state, not a process label; (b) the transformation is physical/biological, not abstract; (c) the pair is single-frame (no polysemous pivot required).

| # | Pair (A -> C) | Transformation Bridge | Process | Domain |
|---|---------------|----------------------|---------|--------|
| 1 | sugarcane -> rum | molasses | sugar refining + distilling | food/drink |
| 2 | hide -> shoe | leather | tanning | leatherworking |
| 3 | cotton -> shirt | fabric | textile weaving | clothing |
| 4 | tadpole -> frog | legs | amphibian metamorphosis | biology |
| 5 | milk -> yogurt | culture | bacterial fermentation | dairy |
| 6 | iron -> bridge | steel | smelting + forging | metallurgy |
| 7 | egg -> chick | embryo | avian development | biology |
| 8 | log -> paper | pulp | papermaking | manufacturing |
| 9 | olive -> soap | oil | saponification | chemistry |
| 10 | wheat -> pasta | flour | milling + extrusion | food |

**Gradient-midpoint pairs:** The bridge names a position on a continuous dimension between the endpoints. The dimension is nameable and the bridge is a genuine positional midpoint, not a categorical label (avoiding the murmur-scream "speech" problem identified in Phase 8B). Selection criteria: (a) the bridge names a *position*, not the *dimension itself*; (b) the endpoints are at opposite ends or distant points on the continuum; (c) single-frame, no polysemy.

| # | Pair (A -> C) | Gradient Bridge | Dimension | Domain |
|---|---------------|----------------|-----------|--------|
| 1 | freezing -> boiling | warm | temperature | physics |
| 2 | crawling -> running | walking | locomotion speed | movement |
| 3 | hamlet -> capital | town | settlement size (positional: town is mid-scale, not the category label "settlement") | geography |
| 4 | puddle -> sea | pond | water body size | geography |
| 5 | whispering -> screaming | speaking | vocal volume (positional: "speaking" names a mid-volume position, avoiding the hypernym trap identified in Phase 8B murmur-scream "speech") | sound |
| 6 | amateur -> master | journeyman | skill level | profession |
| 7 | twilight -> noon | morning | time of day | temporal |
| 8 | seedling -> tree | sapling | plant size/age | biology |
| 9 | mild -> blazing | hot | temperature intensity | weather |
| 10 | stroll -> sprint | jog | locomotion speed | movement |

#### Matching Strategy

The pairs are matched across type on several dimensions to minimize confounds:

1. **Domain diversity:** Both sets span biology (tadpole-frog / seedling-tree), food (sugarcane-rum, wheat-pasta / stroll-sprint), manufacturing (log-paper, cotton-shirt / hamlet-capital), leatherworking (hide-shoe), and other physical processes. No single domain dominates either set.
2. **Bridge familiarity:** All bridge concepts are common English words (no technical jargon). Both sets use bridges of similar frequency in general English.
3. **Endpoint distance:** Pairs in both sets span similar semantic distances (both contain close pairs like milk-yogurt/stroll-sprint and distant pairs like iron-bridge/amateur-master).
4. **Single-frame constraint:** All 20 pairs operate within a single semantic frame. No polysemous pivot required.

#### Phase 8B Reuse and Non-Overlap

Phase 8B tested 10 gradient pairs (whisper-shout, hot-cold, dawn-dusk, infant-elderly, crawl-sprint, pond-ocean, pebble-boulder, drizzle-downpour, village-metropolis, murmur-scream) and 10 causal pairs (grape-wine, ore-jewelry, caterpillar-butterfly, clay-vase, wool-sweater, milk-cheese, seed-fruit, sand-glass, acorn-timber, flour-bread). Phase 9B uses entirely new pairs for independent replication. The Phase 8B data serves as a comparison baseline in the analysis (meta-analytic combination) but is not rerun.

If H10 is confirmed in Phase 9B's new pairs AND consistent with Phase 8B's existing data, the finding achieves [robust] status via two independent pair sets.

### Run Budget

| Condition | Pairs | Reps/model | Models | Runs |
|-----------|-------|-----------|--------|------|
| Transformation-chain pairs | 10 | 15 | 4 | 600 |
| Gradient-midpoint pairs | 10 | 15 | 4 | 600 |
| **Subtotal** | | | | **1,200** |

After 5% retry buffer: **~1,260 new runs.**

15 reps per model per pair matches Phase 8B's design, providing adequate power for the interaction test. At 15 reps, SE for a bridge frequency of 0.50 is ~0.13, sufficient to distinguish frequencies that differ by 0.25+.

**Evaluability gate:** After data collection, a pair is evaluable for the interaction analysis only if its candidate bridge has cross-model mean unconstrained frequency >= 0.20 (at least one model routes through it). Pairs below this threshold indicate a misspecified bridge and are excluded from the primary analysis but reported for completeness. Based on Phase 8B experience (where 6/20 pairs showed zero frequency for 2+ models), we expect 15-18 of 20 pairs to pass. If fewer than 12 pass, the interaction test is underpowered and results should be interpreted cautiously.

### Analysis Plan

1. **Bridge frequency matrix.** For each of the 20 pairs, compute bridge frequency (candidate bridge appears at any position) per model. Report as a 20 x 4 matrix.

2. **Gradient vs transformation comparison (O17 replication).** Aggregate bridge frequency for gradient pairs vs transformation pairs across all models. Test whether gradient > transformation (replicating Phase 7C O17 and Phase 8B). Bootstrap CI on difference. If confirmed with a third independent pair set, O17 is promoted to [robust].

3. **Gemini transformation-chain deficit (primary test).** Compute Gemini's gradient mean minus Gemini's transformation mean. Compute the same gap for non-Gemini models (pooled). Test whether Gemini's gap is larger than non-Gemini's gap. Bootstrap CI on the interaction (Gemini gap minus non-Gemini gap). Primary test: CI excludes zero.

4. **Gemini zero-rate analysis.** Count the number of pairs where Gemini shows 0.000 bridge frequency, separately for transformation and gradient pairs. Compare to non-Gemini zero rates. Prediction: Gemini shows >= 5/10 zeros on transformation pairs and <= 2/10 zeros on gradient pairs.

5. **Transformation-type analysis.** Within the 10 transformation pairs, categorize by process type (biological: tadpole-frog, egg-chick, seedling-tree; manufacturing: iron-bridge, log-paper, cotton-shirt; food: sugarcane-rum, milk-yogurt, wheat-pasta, olive-soap; leatherworking: hide-shoe). Test whether Gemini's zeros cluster in any particular process sub-type or are uniformly distributed across transformation types.

6. **Meta-analytic combination with Phase 8B.** Combine Phase 9B and Phase 8B interaction estimates using inverse-variance weighting. Report the pooled interaction effect and CI. This combines 20 gradient + 20 transformation pairs across two independent experiments for a total of 40 pairs -- the most powered test of Gemini's deficit in the benchmark.

7. **Non-Gemini zero analysis.** Examine whether Claude, GPT, or Grok show any systematic zeros on transformation pairs. Phase 8B found that non-Gemini zeros exist but are scattered. If non-Gemini models also show transformation-specific zeros (even at lower rates), the deficit is not Gemini-specific but Gemini-amplified.

8. **Gemini alternative routing.** For Gemini zero-frequency transformation pairs, examine which waypoints Gemini does use. Does Gemini skip the intermediate state entirely and jump to endpoints, or does it route through abstract process labels (e.g., "manufacturing" instead of "pulp" for log-paper)?

### Predictions

1. Gradient > transformation bridge frequency replicates: gradient mean > transformation mean by at least 0.15, CI excludes zero. Third independent replication promotes O17 to [robust].
2. Gemini's transformation mean bridge frequency is below 0.30 (across all 10 transformation pairs).
3. Gemini's gradient mean bridge frequency is above 0.45 (across all 10 gradient pairs).
4. Gemini's (gradient - transformation) gap is at least 0.15 larger than non-Gemini's gap. The interaction CI excludes zero.
5. Gemini produces 0.000 bridge frequency on at least 5 of 10 transformation-chain pairs.
6. Gemini produces 0.000 bridge frequency on at most 2 of 10 gradient-midpoint pairs.
7. Non-Gemini models (Claude, GPT, Grok) show gradient mean > 0.55 and transformation mean > 0.40, with gradient-transformation gap < 0.20.
8. Meta-analytic combination with Phase 8B produces an interaction CI that excludes zero, even if the Phase 9B-alone CI is marginal.
9. Gemini's zeros on transformation pairs span at least 3 of the 4 process sub-types (biological, manufacturing, food, leatherworking), indicating the deficit is general to transformation processes, not specific to one domain.

---

## Part C: Pre-Fill Facilitation Effect

**Core question:** Does pre-filling produce a crossover interaction -- displacing dominant bridges while facilitating marginal ones -- and does this depend on the semantic relationship between the pre-fill and the bridge?

**Background:** Phase 7A established that pre-filling causally displaces bridges (O15): mean displacement 0.515, survival drops from 0.807 to 0.460. But Phase 8A discovered anomalies where pre-filling *increases* bridge frequency: science-art "creativity" shows survival rate 5.200 (pre-fill frequency exceeds unconstrained by 5x), and student-professor "research" shows 2.429. Both of these are marginal bridges (unconstrained frequency 0.125 and 0.175 respectively). H11 proposes that the direction of the pre-fill effect depends on bridge dominance: pre-filling displaces bridges that would normally dominate position 1 (they lose their first-mover advantage) but facilitates bridges that would normally appear rarely (the pre-fill primes the relevant conceptual cluster, boosting the bridge's activation).

This is the most novel and theoretically important experiment in Phase 9. If confirmed, the crossover interaction would transform the pre-fill paradigm from a simple displacement test to a modulation test that reveals the activation dynamics of conceptual navigation. The facilitation effect is also the first evidence that pre-fill content (not just presence) matters -- contradicting the Phase 7A conclusion that only pre-fill presence is relevant.

**Hypothesis (H11):** Pre-filling produces a crossover interaction with bridge dominance:
- For bridges with unconstrained frequency > 0.60 (dominant), pre-filling reduces frequency (survival < 0.80, displacement effect).
- For bridges with unconstrained frequency < 0.30 (marginal), congruent pre-filling increases frequency (survival > 1.20, facilitation effect).
- The crossover point is at approximately unconstrained frequency 0.40-0.50.
- Facilitation is stronger for congruent pre-fills than incongruent ones.

**Primary pre-registered test:** The regression of pre-fill survival on unconstrained bridge frequency has a negative slope (high-frequency bridges show lower survival due to displacement, low-frequency bridges show higher survival due to facilitation). 95% bootstrap CI on slope excludes zero. Secondary test: congruent pre-fills produce higher survival than incongruent for marginal bridges (unconstrained freq < 0.30), with CI on the difference excluding zero.

### Design

#### Pair Selection Strategy

The critical design requirement is to sample pairs across the full range of unconstrained bridge frequency (0.10-1.00). We cannot predict unconstrained frequencies reliably from intuition (Phase 8A demonstrated this with 6/8 evaluability failures). Therefore, we use pairs where unconstrained bridge frequency is *already known* from prior phases.

**Pair pool from prior data:**

| # | Pair | Bridge | Uncon. Freq | Source | Dominance Level |
|---|------|--------|-------------|--------|----------------|
| 1 | emotion -> melancholy | sadness | 0.950 | Phase 6A | **Dominant** |
| 2 | light -> color | spectrum | 0.917 | Phase 6A | **Dominant** |
| 3 | sun -> desert | heat | 0.917 | Phase 6A | **Dominant** |
| 4 | animal -> poodle | dog | 0.970 | Phase 6A | **Dominant** |
| 5 | bank -> ocean | river | 0.600 | Phase 6A | **Moderate** |
| 6 | music -> mathematics | harmony | 0.550 | Phase 6A | **Moderate** |
| 7 | seed -> garden | germination | 0.583 | Phase 6A | **Moderate** |
| 8 | loan -> shore | bank | 0.717 | Phase 7A | **Moderate-high** |
| 9 | science -> art | creativity | 0.125 | Phase 8A | **Marginal** |
| 10 | student -> professor | research | 0.175 | Phase 8A | **Marginal** |

Pairs 1-8 have prior pre-fill data from Phase 7A (3 conditions: congruent, incongruent, neutral, 10 reps/model each). Pairs 9-10 have Phase 8A pre-fill data (1 condition: incongruent, 10 reps/model).

**Gap in the data:** We have no pairs in the 0.25-0.50 range ("low-moderate") where the crossover is predicted to occur. We need 2-4 pairs in this range to test the crossover hypothesis properly. These must be pairs where we have verified the unconstrained bridge frequency through prior data or a pilot phase.

**New pairs for the low-moderate range:** Phase 8B data shows that most tested pairs have cross-model mean bridge frequencies either very high (>0.70) or very low (<0.15), with few in the critical 0.25-0.50 range. The closest candidates from Phase 8B are:

- caterpillar-butterfly "cocoon": Claude 0.000, GPT 0.333, Grok 0.867, Gemini 0.000 → mean ~0.300 (high model variance)
- seed-fruit "flower": Claude 0.933, GPT 0.000, Grok 0.467, Gemini 0.000 → mean ~0.350 (high model variance)

These have extreme model-to-model variance, making them poor representatives of "moderate" bridge frequency. We therefore use 4 pairs where unconstrained frequency is genuinely unknown but structural reasoning suggests the low-moderate range. These require pilot verification:

| # | Pair | Predicted Bridge | Predicted Uncon. Freq | Rationale |
|---|------|-----------------|----------------------|-----------|
| 11 | recipe -> meal | cooking | 0.30-0.50 | Process name; "ingredient," "preparation" compete |
| 12 | problem -> solution | analysis | 0.20-0.40 | Cognitive process; "thinking," "method," "reasoning" compete |
| 13 | sketch -> painting | outline | 0.25-0.45 | Art process; "drawing," "canvas," "color" compete |
| 14 | note -> symphony | melody | 0.30-0.50 | Music composition; "chord," "harmony," "composition" compete |

**Pilot for pairs 11-14:** Collect 15 reps/model unconstrained to verify bridge frequency. Pairs with bridge frequency in the 0.20-0.50 range are retained. Pairs outside this range are replaced or dropped. We need at least 2 of 4 pilot pairs to land in the 0.20-0.50 range for adequate crossover coverage.

#### Pre-Fill Conditions

For each of the 14 pairs, collect paths under four conditions:

1. **Unconstrained** (baseline) -- no pre-fill. For pairs with existing unconstrained data (1-12), reuse. For pairs 13-14, the pilot phase provides this.
2. **Congruent pre-fill** -- position 1 pre-filled with a concept semantically related to the bridge. The congruent concept is a close associate or near-synonym of the bridge.
3. **Incongruent pre-fill** -- position 1 pre-filled with a concept unrelated to both the bridge and the destination. Semantically orthogonal.
4. **Neutral pre-fill** -- position 1 pre-filled with a concept related to the source but not to the bridge. Associated with the starting concept but directionally uninformative about the bridge.

Pre-fill selection for each pair:

| Pair | Bridge | Congruent | Incongruent | Neutral |
|------|--------|-----------|-------------|---------|
| emotion-melancholy | sadness | sorrow | velocity | feeling |
| light-color | spectrum | rainbow | gravity | beam |
| sun-desert | heat | warmth | language | star |
| animal-poodle | dog | puppy | equation | creature |
| bank-ocean | river | stream | algebra | deposit |
| music-mathematics | harmony | melody | volcano | rhythm |
| seed-garden | germination | sprouting | battery | soil |
| loan-shore | bank | finance | purple | mortgage |
| science-art | creativity | imagination | concrete | experiment |
| student-professor | research | study | glacier | university |
| recipe-meal | cooking | baking | asteroid | ingredient |
| problem-solution | analysis | examination | rainfall | question |
| sketch-painting | outline | drawing | glacier | pencil |
| note-symphony | melody | chord | concrete | sound |

For pairs 1-8 with existing Phase 7A pre-fill data: Phase 7A used different pre-fill concepts (selected for the directional-heading test, not the facilitation test). We reuse the Phase 7A survival rates as existing data points but also collect new runs with the above pre-fills for comparability. However, to save budget, for the 4 dominant pairs (1-4) where displacement is well-established, we collect only the congruent condition (the novel test of whether congruent pre-fills facilitate even dominant bridges). For moderate pairs (5-8), we collect all three conditions. For marginal pairs (9-10) and pilot pairs (11-14), we collect all three conditions.

#### Reuse Summary

| Pairs | Unconstrained Data | Pre-fill Data | New Runs Needed |
|-------|-------------------|---------------|-----------------|
| 1-4 (dominant) | Phase 6A (reuse) | Phase 7A partial (reuse); new congruent only | 4 pairs x 10 reps x 4 models x 1 condition = 160 |
| 5-8 (moderate) | Phase 6A (reuse) | Phase 7A partial (reuse); new 3 conditions | 4 pairs x 10 reps x 4 models x 3 conditions = 480 |
| 9-10 (marginal) | Phase 8A (reuse) | Phase 8A incongruent (reuse); new congruent + neutral | 2 pairs x 10 reps x 4 models x 2 conditions = 160 |
| 11-14 (pilot) | New: pilot 15 reps | New: 3 conditions | Pilot: 4 x 15 x 4 = 240; Pre-fill: 4 x 10 x 4 x 3 = 480 |

**Note:** The Phase 7A pre-fill data uses different pre-fill concepts than those above. The Phase 7A survival rates are included in the analysis as separate data points (labeled "7A pre-fill") alongside the new "9C pre-fill" data. This tests whether the facilitation effect is robust to different pre-fill concept choices.

### Run Budget

| Condition | Runs |
|-----------|------|
| Dominant pairs (1-4): congruent pre-fill only | 160 |
| Moderate pairs (5-8): 3 pre-fill conditions | 480 |
| Marginal pairs (9-10): congruent + neutral pre-fill | 160 |
| Pilot pairs (11-14): unconstrained | 240 |
| Pilot pairs (11-14): 3 pre-fill conditions (if evaluable) | 480 |
| **Subtotal** | **~1,520** |

After evaluability filter (expect 2 of 4 pilot pairs to land in the 0.20-0.50 range, others dropped) and 5% retry buffer: **~960 new runs** (conservative estimate assuming 2 pilot pairs fail and are dropped, saving ~360 pre-fill runs).

### Analysis Plan

1. **Unconstrained frequency verification.** For all 14 pairs, report the unconstrained bridge frequency (from prior data or pilot). Verify the frequency range spans 0.10-1.00. If the range is narrower than 0.10-0.80, the crossover test is underpowered.

2. **Survival rate computation.** For each pair and each pre-fill condition, compute survival rate = pre-fill bridge frequency / unconstrained bridge frequency. Report the full table. Values > 1.0 indicate facilitation; values < 1.0 indicate displacement.

3. **Crossover regression (primary test).** Regress survival rate (pooled across all pre-fill conditions) on unconstrained bridge frequency. The predicted pattern is a negative slope: high-frequency bridges have low survival (displacement), low-frequency bridges have high survival (facilitation). Report slope, intercept, and 95% bootstrap CI on slope. Primary test: CI on slope excludes zero.

4. **Crossover point estimation.** Estimate the unconstrained frequency at which survival rate = 1.0 (neither facilitation nor displacement). Report with 95% CI. Predicted: 0.40-0.50.

5. **Congruent vs incongruent facilitation (secondary test).** For marginal bridges (unconstrained freq < 0.30), compare congruent pre-fill survival to incongruent pre-fill survival. If congruent > incongruent and CI excludes zero, facilitation is content-dependent (congruent pre-fills prime the bridge cluster more effectively). For dominant bridges (unconstrained freq > 0.60), compare the same. If congruent > incongruent for dominant bridges too, content always matters and the Phase 7A null was underpowered, not genuine.

6. **Neutral pre-fill baseline.** Report neutral pre-fill survival rates across the full frequency range. If neutral pre-fills show displacement for dominant bridges (survival < 1.0) and neither facilitation nor displacement for marginal bridges (survival ~ 1.0), then facilitation is specifically driven by congruent semantic content, not by any pre-fill presence.

7. **Phase 7A comparison.** For pairs 1-8, compare Phase 7A survival rates (different pre-fill concepts) to Phase 9C survival rates (new pre-fill concepts). If the survival rates are similar despite different pre-fill concepts, facilitation/displacement is content-independent (presence effect). If rates differ, content matters.

8. **Per-model facilitation.** Report survival rates per model across the frequency range. Test whether facilitation is model-general (all models show facilitation for marginal bridges) or model-specific (only some models facilitate). If Claude's rigid gait prevents facilitation (pre-fill always displaces regardless of bridge dominance), this would indicate that facilitation requires navigational flexibility.

### Predictions

1. The regression of survival rate on unconstrained frequency has a negative slope (high frequency → low survival, low frequency → high survival). CI on slope excludes zero. (Primary test of H11.)
2. Dominant bridges (unconstrained freq > 0.60) show mean survival < 0.80 across all pre-fill conditions (displacement).
3. Marginal bridges (unconstrained freq < 0.30) show mean survival > 1.20 under congruent pre-fill (facilitation).
4. Marginal bridges show survival ~ 1.0 (0.80-1.20) under incongruent pre-fill (no facilitation from unrelated concepts).
5. The crossover point (survival = 1.0) is at unconstrained frequency approximately 0.40-0.50.
6. Congruent pre-fills produce higher survival than incongruent for marginal bridges. CI on the difference excludes zero.
7. For dominant bridges, congruent and incongruent pre-fills produce similar survival rates (within 0.10), replicating the Phase 7A null on content effects for strong bridges.
8. Neutral pre-fills produce displacement for dominant bridges and near-unity survival for marginal bridges (intermediate between congruent and incongruent).
9. Facilitation is model-general: at least 3 of 4 models show survival > 1.0 for at least one marginal bridge under congruent pre-fill.
10. Phase 7A survival rates for pairs 1-8 are within 0.15 of Phase 9C survival rates for the matched pre-fill type (replication check).

---

## Files

| Action | File | Lines |
|--------|------|-------|
| Create | `src/data/pairs-phase9.ts` | ~300 (Phase 9 pair definitions: dominance pairs, transformation/gradient pairs, facilitation pairs with pre-fill concepts) |
| Create | `experiments/09a-dominance.ts` | ~350 (two-stage runner: gap-filling salience collection, pre-fill displacement for new pairs) |
| Create | `experiments/09b-transformation.ts` | ~250 (transformation vs gradient bridge frequency collection, all 20 pairs) |
| Create | `experiments/09c-facilitation.ts` | ~400 (multi-condition pre-fill runner: pilot phase, congruent/incongruent/neutral, reuse management) |
| Create | `analysis/09a-dominance.ts` | ~500 (dominance ratio computation from 6A/8A/8B data, retrospective + combined correlation, threshold analysis, dominance vs competitor count comparison) |
| Create | `analysis/09b-transformation.ts` | ~400 (bridge frequency matrix, transformation vs gradient comparison, Gemini interaction test, zero-rate analysis, meta-analytic combination with Phase 8B, alternative routing characterization) |
| Create | `analysis/09c-facilitation.ts` | ~550 (survival computation, crossover regression, crossover point estimation, congruent vs incongruent comparison, per-model facilitation analysis, Phase 7A comparison) |
| Modify | `src/types.ts` | ~100 (Phase9DominancePair, Phase9TransformationPair, Phase9GradientPair, Phase9FacilitationPair, Phase9DominanceOutput, Phase9TransformationOutput, Phase9FacilitationOutput types) |
| Modify | `src/metrics.ts` | ~80 (dominance ratio computation from salience data, crossover regression with bootstrap, transformation interaction bootstrap, meta-analytic combination helper) |
| Modify | `package.json` | ~10 scripts |

## Docs to Update

- `.planning/STATE.md` -- Phase 9 summary, key findings, blockers
- `.planning/ROADMAP.md` -- Phase 8 completion entry, Phase 9 implementation
- `findings/CLAIMS.md` -- Update H9 (confirmed or falsified), update H10, update H11, add new observations from Phase 9, potentially promote O17 to [robust]
- `findings/09-analysis.md` -- Interpretive analysis (Opus subagent)
- `findings/09a-dominance.md` -- Generated findings (analysis script)
- `findings/09b-transformation.md` -- Generated findings (analysis script)
- `findings/09c-facilitation.md` -- Generated findings (analysis script)
- `.planning/GRAVEYARD.md` -- Add any new dead ends from Phase 9

## Execution Order

```bash
# Part A -- Stage 1: Retrospective analysis (no new runs)
bun run analyze-dominance-retro          # Compute dominance ratios from Phase 6A/8A data

# Part A -- Stage 2: New pair collection + full analysis (~4-5 min)
bun run dominance                        # ~420 runs (gap-filling salience + pre-fill)
bun run analyze-dominance

# Part B -- (~8-10 min)
bun run transformation                   # ~1,260 runs
bun run analyze-transformation

# Part C -- (~7-9 min, includes pilot)
bun run facilitation                     # ~960 runs (pilot + multi-condition pre-fill)
bun run analyze-facilitation

# Or run everything:
bun run phase9
```

## Implementation Order

1. Add types to `src/types.ts` (Phase9DominancePair, Phase9TransformationPair, Phase9GradientPair, Phase9FacilitationPair, analysis output types)
2. Add metrics to `src/metrics.ts` (dominance ratio computation from salience landscape data, crossover regression with bootstrap CI, transformation interaction bootstrap, meta-analytic combination with inverse-variance weighting)
3. Create `src/data/pairs-phase9.ts` (all pair definitions: 6 dominance pairs with pre-fill concepts, 20 transformation/gradient pairs, 14 facilitation pairs with 3 pre-fill concepts each)
4. Run Part A Stage 1: retrospective dominance ratio analysis on existing Phase 6A/7A/8A data (no new runs; validates the dominance ratio predictor before investing in new data)
5. Assess Stage 1 result: if retrospective rho > 0.40, proceed to Stage 2. If rho < 0.20, reconsider the predictor variable before proceeding.
6. Create and run Part A Stage 2 experiment + analysis (gap-filling salience + new pre-fill runs)
7. Create and run Part B experiment + analysis (independent of Part A; can run in parallel)
8. Create and run Part C experiment + analysis (depends on knowing which pairs pass the pilot evaluability gate)
9. Write interpretive analysis (`findings/09-analysis.md`)
10. Update `.planning/STATE.md`, `ROADMAP.md`, `findings/CLAIMS.md`, `.planning/GRAVEYARD.md`
11. Commit

## Totals

- **New files:** 7 (pairs-phase9, 3 experiments, 3 analyses)
- **Modified files:** 3 (types.ts, metrics.ts, package.json)
- **New code:** ~2,930 lines
- **New API runs:** ~2,640 after evaluability filtering (Part A: ~420 + Part B: ~1,260 + Part C: ~960 post-filter)
- **Reused data:**
  - Phase 6A salience landscapes (8 pairs, 40 reps/model) -- for dominance ratio computation
  - Phase 7A pre-fill survival data (8 pairs, 3 conditions) -- for dominance analysis + facilitation baseline
  - Phase 8A salience landscapes (8 pairs, 20 reps/model) -- for dominance ratio computation on new pairs
  - Phase 8A pre-fill data (2 evaluable pairs: cause-effect, brain-computer) -- for dominance analysis
  - Phase 8B bridge frequency data (20 pairs, 15 reps/model) -- for dominance ratio computation (new pairs) + meta-analytic combination (transformation analysis)
  - Total reused: ~3,400 existing data points across Phases 6A, 7A, 8A, 8B
- **Runtime:** ~20-25 minutes total
- **Cost:** ~$9-12 via OpenRouter

## Verification

### Part A
- Stage 1 retrospective analysis produces dominance ratios for 6-8 pairs from existing data
- Evaluability gate evaluated: if rho > 0.40, Stage 2 proceeds
- Retrospective correlation (rho, CI) computed and reported
- Stage 2 gap-filling salience runs collected (where needed) for 4-6 pairs
- Stage 2 pre-fill paths collected for 6 new pairs x 4 models x 10 reps = 240 new runs
- Dominance ratios computed for all new pairs
- Combined correlation (12-14 pairs) computed with bootstrap CI
- Threshold analysis completed (dominance ratio step function)
- Dominance ratio vs competitor count comparison reported
- Per-model dominance analysis reported
- `setMetricsSeed(42)` for reproducibility

### Part B
- All 20 pairs x 4 models x 15 reps collected = 1,200 runs (+ retry buffer)
- 20 x 4 bridge frequency matrix computed and reported
- Gradient vs transformation aggregate comparison completed (O17 third replication)
- Gemini interaction test completed with bootstrap CI
- Gemini zero-rate counted and compared to non-Gemini zero-rate, separately for transformation and gradient
- Transformation-type analysis completed (biological vs manufacturing vs food vs leatherworking)
- Meta-analytic combination with Phase 8B completed (pooled interaction estimate)
- Non-Gemini zero analysis reported
- Gemini alternative routing characterized for zero-frequency pairs

### Part C
- Pilot phase completed for pairs 13-14 (15 reps/model unconstrained)
- Evaluability assessment: pairs with bridge freq 0.20-0.50 retained, others replaced or dropped
- Pre-fill conditions collected for all evaluable pairs (10 reps/model per condition)
- Survival rates computed for all pairs x conditions
- Crossover regression completed with bootstrap CI on slope (primary test)
- Crossover point estimated with 95% CI
- Congruent vs incongruent comparison for marginal bridges (secondary test)
- Neutral pre-fill baseline analysis completed
- Phase 7A comparison completed for pairs 1-8
- Per-model facilitation analysis reported
- All data sources (reuse vs new) documented

## Done When

- All three experiments complete with < 5% failure rate
- Analysis scripts produce findings docs for all three parts
- Part A delivers a quantitative predictor of bridge fragility
  - Dominance ratio correlates positively with pre-fill survival (rho > 0.50, CI excludes zero), confirming H9, OR
  - Null result with tight CIs rules out correlation > 0.30, rejecting the dominance ratio mechanism and exhausting single-variable predictors of bridge fragility (competitor count failed in Phase 8A, dominance ratio fails now -- the phenomenon may require a multi-variable model)
- Part B characterizes Gemini's transformation-chain blindness
  - Gemini shows a significantly larger (gradient - transformation) gap than other models (interaction CI excludes zero), confirming H10 and achieving [robust] status via meta-analytic combination with Phase 8B, OR
  - Gemini's gap is not significantly larger (interaction CI includes zero), indicating the Phase 8B causal-chain pattern was pair-specific rather than transformation-specific. Gemini's deficit remains real but uncharacterized at the mechanism level.
- Part C establishes the pre-fill facilitation effect
  - Crossover regression slope is positive and CI excludes zero, confirming H11. The pre-fill paradigm is transformed from a displacement test to a modulation test with dual mechanisms (displacement for dominant bridges, facilitation for marginal ones), OR
  - Slope is not significant -- the Phase 8A facilitation anomalies were pair-specific flukes, not a general phenomenon. Pre-fill effects are purely displacement regardless of bridge dominance.
- O17 is either promoted to [robust] (if Part B replicates gradient > transformation for the third time) or remains [observed]
- Interpretive analysis written connecting all three parts to the benchmark's theoretical framework
- Graveyard updated with any new dead ends (potential entries: G23 if dominance ratio fails, G24 if transformation-chain specificity fails, G25 if facilitation crossover fails)
- CLAIMS.md updated with Phase 9's new observations, hypothesis updates (H9/H10/H11 confirmed or revised), any new graveyard entries, and O17 status
- STATE.md and ROADMAP.md updated
