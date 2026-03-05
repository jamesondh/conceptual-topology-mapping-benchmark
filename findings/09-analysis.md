# Phase 9 Analysis: The Mechanism Ceiling

> Interpretive analysis of Phase 9: bridge dominance ratio (9A), Gemini transformation-chain blindness (9B), and pre-fill facilitation crossover (9C).
>
> 240 new runs (9A) + 1,197 new runs (9B) + 1,600 new runs (9C) = 3,037 new API runs + ~5,270 reused, across 4 models, 14 dominance pairs, 20 transformation/gradient pairs, 14 facilitation pairs.
>
> March 2026

## Executive Summary

**Phase 9 confirms Phase 8's central finding: single-variable mechanistic models of conceptual navigation fail.** All three primary hypotheses fail their pre-registered tests, matching Phase 8's historic-low 24% prediction accuracy. But Phase 9's failures are more diagnostic than Phase 8's because they close the loop on the entire mechanistic program that began in Phase 7, and they reveal something unexpected along the way.

The dominance ratio hypothesis (H9) — that bridge survival under pre-fill is predicted by the ratio of bridge frequency to strongest competitor frequency — passes its retrospective evaluability gate (rho = 0.548) but collapses in the combined test (rho = 0.157, CI includes zero). Warm (dominance ratio 1.00) is completely destroyed while fermentation (ratio 1.07) is bulletproof. Same dominance ratio, opposite outcomes. The controlling variable is not dominance.

The transformation-chain blindness hypothesis (H10) — that Gemini selectively fails on material/biological transformation intermediaries — is not just wrong but reversed. Gemini's transformation mean (0.667) exceeds its gradient mean (0.293). The Gemini interaction is -0.290, opposite the predicted direction. The pooled meta-analytic interaction combining Phases 8B and 9B is -0.113 (CI includes zero). Gemini's deficit is real but is not transformation-specific. And O17 — gradient bridges outperform causal-chain bridges, observed in Phases 7C and 8B — fails to replicate: Phase 9B finds transformation (0.699) > gradient (0.543).

The pre-fill facilitation crossover hypothesis (H11) — that pre-filling displaces dominant bridges and facilitates marginal ones, with a clean crossover regression — fails its primary test: slope = -3.355, CI [-6.748, 0.723] includes zero. But the facilitation effect for marginal bridges is massive and unambiguous: science-art "creativity" shows 8.0x survival under congruent pre-fill, student-professor "research" shows 4.0x. The Phase 7A comparison (now corrected to compare matched condition types: congruent-to-congruent) shows 5/8 pairs replicate within 0.15 when different congruent pre-fill concepts are used. Three pairs still show moderate non-replication (bank-ocean, music-mathematics, loan-shore), indicating that pre-fill content can modulate survival magnitude for some pairs, but does not typically reverse the direction of the effect.

Phase 9's prediction accuracy is 20% (5/25 evaluable predictions confirmed), slightly below Phase 8's 24%. The benchmark has hit a prediction floor: mechanistic hypotheses fail at approximately the same rate regardless of how the previous phase's failures are analyzed and refined. This is not a failure of experimental design but a discovery about the nature of conceptual navigation: it is governed by interaction effects (bridge × pair × model × pre-fill content) that no single-variable model can capture.

The benchmark's empirical program is now complete across nine phases: 3,037 new runs in Phase 9, bringing the total to approximately 18,000 API calls across four models. The robust claims (R1-R7) survive every phase. The 25 graveyard entries document a thorough empirical exploration. The paper's four-act narrative — structure, topology, mechanism, limits — finds its final chapter here.

---

## 1. Dominance Ratio: Retrospective Signal, Prospective Collapse

### The Hypothesis and Its Promise

Phase 8A's route exclusivity failure (G20) was supposed to be diagnostic: competitor count doesn't predict fragility, but the ratio of bridge frequency to strongest competitor frequency should. The logic was elegant. Sadness survives with 8 competitors because none approach its 0.950 frequency — it dominates the landscape. Harmony collapses with 7 competitors because rhythm and pattern match its frequency — it shares the landscape. H9 proposed that dominance ratio is the bridge fragility predictor that competitor count was not.

Phase 9A implements a two-stage test: retrospective validation on 8 pairs with existing data, then prospective validation on 6 new pairs with Phase 8B frequencies.

### Stage 1 Passes — Just Barely

The retrospective Spearman correlation between dominance ratio and pre-fill survival across 8 existing pairs is rho = 0.548 (CI [-0.190, 1.000]). This passes the evaluability gate (rho > 0.40), licensing the prospective stage. But note the confidence interval: it is enormous, spanning from negative to perfectly positive. With only 8 data points, the retrospective signal is fragile.

The retrospective data shows the expected pattern:

| Pair | Bridge | Dom. Ratio | Survival |
|------|--------|-----------|----------|
| bank-ocean | river | 1.62 | 0.778 |
| sun-desert | heat | 1.36 | 0.691 |
| emotion-melancholy | sadness | 1.25 | 0.807 |
| cause-effect | mechanism | 1.25 | 0.143 |
| seed-garden | germination | 1.19 | 0.000 |
| light-color | spectrum | 1.00 | 0.645 |
| brain-computer | algorithm | 0.73 | 0.426 |
| music-mathematics | harmony | 0.60 | 0.015 |

There is a rough trend: the highest-dominance bridges (river, heat, sadness) tend to survive, while the lowest-dominance bridges (harmony, germination) collapse. But the trend is noisy — cause-effect "mechanism" has dominance ratio 1.25 (same as sadness) yet shows survival of only 0.143.

### Stage 2: The Prospective Pairs Break It

The 6 new prospective pairs destroy the correlation:

| Pair | Bridge | Dom. Ratio | Survival |
|------|--------|-----------|----------|
| grape-wine | fermentation | 1.07 | 1.017 |
| hot-cold | warm | 1.00 | 0.000 |
| infant-elderly | adolescent | 1.04 | 0.429 |
| dawn-dusk | noon | 0.73 | 0.938 |
| whisper-shout | speak | 0.60 | 0.977 |
| caterpillar-butterfly | cocoon | 0.35 | 0.000 |

The combined Spearman rho across all 14 pairs is 0.157 (CI [-0.482, 0.691]). Not significant. Not close.

The critical anomaly: warm and fermentation have nearly identical dominance ratios (1.00 and 1.07) yet completely opposite survival rates (0.000 and 1.017). Warm is destroyed by every single model — Claude, GPT, Grok, and Gemini all drop to 0.000 under pre-fill. Fermentation is bulletproof — every model maintains it at 1.000 even under pre-fill.

### Why Warm Dies and Fermentation Lives

The answer is not in dominance ratio. It is in the relationship between the pre-fill concept and the bridge.

Warm's pre-fill is "cool." Cool sits on the same temperature gradient as warm — it is an alternative position on the identical dimension. When models receive "cool" as waypoint 1 on the path from hot to cold, they continue along the temperature gradient through cool → mild → chilly → cold without ever needing warm. Cool doesn't displace warm through competition; it provides an alternative entry point that makes warm unnecessary.

Fermentation's pre-fill is "harvest." Harvest is related to the grape domain but is not on the transformation chain (grape → fermentation → wine). It occupies a different stage of the wine production process. When models receive "harvest" as waypoint 1, they still need to traverse the fermentation step to reach wine. Harvest cannot substitute for fermentation because they name different transformations.

**[observed]** The pre-fill's semantic relationship to the bridge is the strongest determinant of survival — stronger than dominance ratio, stronger than competitor count. A pre-fill on the same dimension or transformation chain as the bridge destroys it; a pre-fill in a related but non-competing semantic space leaves it intact. This is a content effect, not a structural effect.

### The Dominance Ratio Joins the Graveyard

Combined with the retrospective signal being fragile (CI includes zero on 8 points) and the prospective data showing no correlation, H9 is falsified as a standalone predictor. **Graveyard entry: G23.** The threshold analysis confirms the failure: best accuracy is 0.571 at dominance ratio = 0.50, far below the 0.80 target. Competitor count (rho = 0.289) actually outperforms dominance ratio (rho = 0.157) — the simpler metric is better, though neither is adequate.

### Per-Model Dominance Patterns

One prediction survives: Claude produces the highest mean dominance ratios (0.93), followed by Grok (0.91), GPT (0.83), and Gemini (0.45). Claude's rigid gait concentrates traffic through dominant bridges. Gemini's low dominance reflects its fragmented topology — even its bridges face competition from alternative routing.

---

## 2. Transformation-Chain Blindness: The Hypothesis That Reversed

### The Hypothesis

Phase 8B's most striking finding was that Gemini's zeros concentrate on causal-chain pairs (6/10) rather than gradient pairs (1/10) — the opposite of what the gradient-blindness hypothesis predicted. H10 refined this: Gemini can't route through discrete transformation intermediaries (cocoon, pottery, metal) but handles continuous-dimension midpoints (warm, walk, lake). Phase 9B tests this with 10 new transformation pairs and 10 new gradient pairs, fully non-overlapping with Phase 8B.

### The Primary Test: Reversed Direction

The Gemini interaction is -0.290 (CI [-0.700, 0.110]), not significant and in the wrong direction. Gemini shows a *larger* gap favoring transformation over gradient (0.374) than non-Gemini models (0.084). H10 predicted the opposite.

The per-model breakdown:

| Model | Gradient | Transformation | Gap |
|-------|----------|---------------|-----|
| Claude | 0.607 | 0.760 | -0.153 |
| GPT | 0.673 | 0.700 | -0.027 |
| Grok | 0.600 | 0.670 | -0.070 |
| Gemini | 0.293 | 0.667 | -0.374 |

Every model shows transformation > gradient. Gemini shows the biggest gap. This is not a Gemini-specific deficit on transformation pairs — it is the opposite.

### O17 Fails to Replicate

Phase 7C found gradient > causal-chain (0.730 vs 0.496). Phase 8B found gradient > causal (0.770 vs 0.578). Phase 9B finds gradient < transformation (0.543 vs 0.699). The difference is -0.156, CI [-0.338, 0.032] — the CI barely includes zero, but the direction is opposite to the prior two replications.

O17 was a candidate for promotion to [robust] pending this third replication. Instead, it fails. The claim remains [observed] — the Phase 7C and 8B results are real — but the finding is pair-specific rather than type-general. The specific bridges chosen in each experiment matter more than the categorical distinction between "gradient" and "transformation."

### Why the Reversal: Bridge Specification Quality

The reversal is not a deep theoretical insight. It is a pair selection artifact. Phase 9B's gradient pairs include several bridges that are misspecified:

- **seedling-tree "sapling"**: 0.000 for all four models. Sapling is "too-central" for seedling-tree — both endpoints already imply it, just as fire is too-central for spark-ash.
- **whispering-screaming "speaking"**: near-zero for 3/4 models. This is the hypernym trap identified in Phase 8B — "speaking" names the category, not a midpoint.
- **crawling-running "walking"**: 0.000 for Claude and Grok. Another hypernym issue — "walking" is the default locomotion category, not a position between crawling and running.

Meanwhile, Phase 9B's transformation pairs include several that are strongly specified:

- **hide-shoe "leather"**: near 1.000 all models. The only route from animal hide to finished shoe.
- **log-paper "pulp"**: 1.000 all models. The obligatory transformation intermediate.
- **iron-bridge "steel"**: near 1.000 all models. Steel is the necessary material transformation.

The transformation pairs happen to include more well-specified bottleneck bridges (R6), while the gradient pairs include more misspecified bridges. This is not because transformation pairs are inherently better — it is because the specific bridges chosen for the gradient set include more failure modes (too-central, hypernym).

**[observed]** The gradient/transformation distinction does not predict bridge frequency. Bridge specification quality — whether the concept names an obligatory intermediate vs. a categorical label or too-central concept — predicts bridge frequency. This reframes O17: the original gradient > causal finding was driven by the specific bridges in those pair sets, not by a type-level property. When new pairs are chosen, the effect can reverse.

### Gemini Zero-Rate: Not Transformation-Specific

Gemini produces 2/10 zeros on transformation pairs and 5/10 zeros on gradient pairs — the opposite of H10's prediction (>= 5 transformation zeros, <= 2 gradient zeros). Gemini's zeros in Phase 9B cluster on the same misspecified bridges that other models also struggle with (sugarcane-rum "molasses" is 0.000 for all four models, not a Gemini-specific failure).

The meta-analytic combination with Phase 8B produces a pooled interaction of -0.113 (CI [-0.392, 0.165]), confirming the null. Across 40 pairs (20 from each phase), there is no evidence of a Gemini-specific transformation deficit.

### Gemini's Deficit: Still Real, Still Uncharacterized

Gemini's overall bridge frequency (0.480 across 20 pairs) remains lower than non-Gemini models (Claude 0.683, GPT 0.687, Grok 0.635). The three-plus-one structure (Claude/GPT/Grok cluster, Gemini diverges) persists. But the specific mechanism — frame-crossing (H1), gradient blindness (G21), transformation-chain blindness (H10/G24) — has now been falsified in three successive attempts. Gemini's deficit is a robust empirical observation that resists mechanistic characterization.

**Graveyard entry: G24.** Gemini transformation-chain blindness fails: the interaction is in the wrong direction, and Gemini shows more gradient zeros than transformation zeros.

---

## 3. Pre-Fill Facilitation: The Crossover That Isn't Clean

### The Hypothesis and Its Promise

Phase 8A discovered that pre-filling can *increase* bridge frequency for marginal bridges (science-art "creativity" at 5.2x survival). H11 proposed a clean crossover: pre-filling displaces dominant bridges and facilitates marginal ones, with the crossover at unconstrained frequency ~0.40-0.50. Phase 9C tests this with 14 pairs spanning unconstrained frequency 0.10-1.00, using congruent/incongruent/neutral pre-fills.

### The Primary Test: Slope Not Significant

The crossover regression shows slope = -3.355, but the CI [-6.748, 0.723] includes zero. The direction is correct (negative slope — higher unconstrained frequency means lower survival) but the effect is not significant.

The R-squared is 0.289 — unconstrained frequency explains 29% of the variance in survival. This is not trivial, but it is not the clean mechanistic predictor H11 promised.

### The Facilitation Effect Is Real

Despite the regression failing, the individual-level results are striking:

**Marginal bridges (unconstrained freq ≤ 0.30):**
- science-art "creativity": congruent survival **8.000**, incongruent 3.000, neutral 5.000
- student-professor "research": congruent survival **4.000**, incongruent 2.143, neutral 2.286
- recipe-meal "cooking": congruent survival 0.136, incongruent 0.000, neutral 0.000
- problem-solution "analysis": congruent survival **2.906**, incongruent 0.000, neutral 3.558
- sketch-painting "outline": congruent survival 0.500, incongruent 0.085, neutral 0.083

Mean marginal congruent survival: 3.761. This is not a small effect. Pre-filling with a concept related to the bridge can increase bridge frequency by nearly 4x when the bridge is marginal. But the effect is heterogeneous — cooking and outline show displacement despite being marginal, while creativity and research show massive facilitation.

**Dominant bridges (unconstrained freq > 0.60, n=8 including moderate and pilot pairs):**
- emotion-melancholy "sadness": congruent survival 1.000
- light-color "spectrum": congruent survival 0.755
- sun-desert "heat": congruent survival 1.019
- animal-poodle "dog": congruent survival 0.941
- bank-ocean "river": congruent survival 1.391
- seed-garden "germination": congruent survival 0.101
- loan-shore "bank": congruent survival 0.733
- note-symphony "melody": congruent survival 0.583

Mean dominant congruent survival: 0.815 (P2 not confirmed at the < 0.80 threshold). The taxonomic bridge "dog" shows strong survival (0.941), consistent with the Phase 7A finding that taxonomic bridges resist displacement (O15). The variance within dominant bridges is still notable — spectrum at 0.755 is the most displaced, while heat and sadness are fully preserved.

### The Crossover Point Is Higher Than Predicted

The estimated crossover (survival = 1.0) is at unconstrained frequency 0.790 (CI [0.228, 1.136]). The prediction was 0.40-0.50. The crossover, to the extent it exists, occurs much higher than expected — only bridges with very high unconstrained frequency (>0.79) are displaced, while bridges with moderate-to-low frequency tend to be facilitated.

But the CI on the crossover point is extremely wide (0.228 to 1.136), spanning nearly the entire frequency range. This means the crossover is not precisely estimated — it could be anywhere from near-marginal to above the maximum possible frequency.

### Pre-Fill Content: Moderate Effect, Not Primary Driver

The Phase 7A comparison tests whether survival rates replicate when different congruent pre-fill concepts are used. Both Phase 7A and 9C applied congruent pre-fills (semantically related to the bridge) but with different specific concepts. The corrected comparison (matching condition types: congruent-to-congruent) shows 5/8 pairs replicate within 0.15:

| Pair | Phase 7A | Phase 9C | Diff | Replicates |
|------|----------|----------|------|------------|
| emotion-melancholy | 1.026 | 1.000 | 0.026 | **YES** |
| light-color | 0.750 | 0.755 | 0.005 | **YES** |
| sun-desert | 1.053 | 1.019 | 0.034 | **YES** |
| animal-poodle | 1.017 | 0.941 | 0.076 | **YES** |
| bank-ocean | 1.667 | 1.391 | 0.275 | NO |
| music-mathematics | 0.000 | 0.359 | 0.359 | NO |
| seed-garden | 0.000 | 0.101 | 0.101 | **YES** |
| loan-shore | 0.453 | 0.733 | 0.279 | NO |

Five of eight pairs replicate, indicating that for most bridges, the condition type (congruent/incongruent) matters more than the specific concept chosen. The three non-replicating pairs (bank-ocean, music-mathematics, loan-shore) show moderate differences in survival magnitude, but notably no direction reversals — bank-ocean shows facilitation in both phases (1.667 and 1.391), just at different magnitudes. Music-mathematics and loan-shore show larger differences, suggesting that for moderate-dominance bridges, the specific congruent concept can shift survival magnitude by ~0.28-0.36.

**[observed]** Pre-fill content modulates survival magnitude for some pairs, but does not typically reverse the direction of the effect. The Phase 7A conclusion that pre-fill presence is the primary driver is largely upheld — 5/8 pairs replicate with different congruent concepts. For 3/8 pairs, the specific concept produces moderate magnitude differences. O15 (pre-filling causally displaces bridges) stands as originally stated, with the qualification that content produces secondary modulation of the displacement magnitude for moderate-dominance bridges.

### Congruent vs. Incongruent for Marginals

Marginal congruent mean survival (3.761) exceeds incongruent (1.286), difference 2.475. The CI [-0.398, 5.500] includes zero, so the difference is not significant. But the direction is consistent with content-dependent facilitation: congruent pre-fills prime the bridge cluster more effectively than incongruent ones.

### Model Generality

Three of four models show facilitation for at least one marginal bridge: Claude (1), GPT (2), Grok (2). Gemini shows 0 facilitation instances — consistent with its fragmented topology preventing the priming mechanism. P9 (facilitation is model-general for >=3/4 models) is confirmed.

---

## 4. Prediction Accuracy: Phase 9 Scorecard

### Phase 9A Predictions

| # | Prediction | Result | Verdict |
|---|------------|--------|---------|
| 1 | Retrospective rho > 0.40 (evaluability gate) | rho = 0.548 | **Confirmed** |
| 2 | Combined rho > 0.50, CI excludes zero | rho = 0.157, CI includes zero | Not confirmed |
| 3 | High-dominance survival > 0.60 | No pairs with ratio > 2.0 | Insufficient data |
| 4 | Low-dominance survival < 0.30 | Mean survival 0.468 | Not confirmed |
| 5 | Dominance outperforms competitor count | Dom rho 0.157 < Comp rho 0.289 | Not confirmed |
| 6 | Threshold accuracy > 0.70 | Accuracy 0.571 | Not confirmed |
| 7 | Claude highest dominance ratios | Claude 0.93 (highest) | **Confirmed** |
| 8 | Cross-model rho > 0.50 | Mean rho 0.157 | Not confirmed |

**9A accuracy: 2/7 evaluable (28.6%)**

*Note: Some 9A prediction thresholds were adjusted post-hoc from the pre-registered SPEC values (e.g., P1 evaluability gate at 0.40 vs pre-registered 0.50; P3 dominance ratio >= 2.0 vs pre-registered > 3.0). These adjustments were made because the observed dominance ratio distribution made the pre-registered thresholds untestable (no pairs exceeded ratio 2.0). No prediction outcomes would change under the original thresholds. See `09a-dominance.md` for details.*

### Phase 9B Predictions

| # | Prediction | Result | Verdict |
|---|------------|--------|---------|
| 1 | Gradient > transformation by >= 0.15, CI excludes zero | Diff = -0.156 (wrong direction) | Not confirmed |
| 2 | Gemini transformation mean < 0.30 | Gemini transformation = 0.667 | Not confirmed |
| 3 | Gemini gradient mean > 0.45 | Gemini gradient = 0.293 | Not confirmed |
| 4 | Gemini interaction CI excludes zero | Interaction = -0.290, CI includes zero | Not confirmed |
| 5 | Gemini >= 5/10 transformation zeros | 2/10 | Not confirmed |
| 6 | Gemini <= 2/10 gradient zeros | 5/10 | Not confirmed |
| 7 | Non-Gemini gap < 0.20 | Gap = -0.083 | **Confirmed** |
| 8 | Meta-analytic CI excludes zero | Pooled = -0.113, CI includes zero | Not confirmed |
| 9 | Gemini zeros span >= 3/4 process types | 2/4 | Not confirmed |

**9B accuracy: 1/9 (11.1%)**

Phase 9B is the worst-performing sub-experiment in the benchmark's history. Predictions 2 and 3 are not just wrong but reversed (predicted Gemini transformation < 0.30, observed 0.667; predicted gradient > 0.45, observed 0.293). Predictions 5 and 6 are similarly backward (predicted >= 5 transformation zeros, observed 2; predicted <= 2 gradient zeros, observed 5).

### Phase 9C Predictions

| # | Prediction | Result | Verdict |
|---|------------|--------|---------|
| 1 | Negative slope, CI excludes zero | slope = -3.355, CI includes zero | Not confirmed |
| 2 | Dominant survival < 0.80 | Mean 0.815 | Not confirmed |
| 3 | Marginal congruent survival > 1.20 | Mean 3.761 | **Confirmed** |
| 4 | Marginal incongruent survival 0.80-1.20 | Mean 1.286 | Not confirmed |
| 5 | Crossover at 0.40-0.50 | Crossover at 0.790 | Not confirmed |
| 6 | Congruent > incongruent for marginal, CI excludes zero | Diff 2.475, CI includes zero | Not confirmed |
| 7 | Dominant: congruent ≈ incongruent within 0.10 | Diff 0.685 | Not confirmed |
| 8 | Neutral pattern | Insufficient data | Insufficient data |
| 9 | Model-general facilitation (>= 3/4 models) | 3/4 models | **Confirmed** |
| 10 | Phase 7A replication within 0.15 | 5/8 replicate | Not confirmed |

**9C accuracy: 2/9 evaluable (22.2%)**

### Cumulative Scorecard

| Phase | Accuracy | Type |
|-------|----------|------|
| Phase 4B | 81.3% (26/32) | Bridge characterization |
| Phase 5A | 64.6% (31/48) | Cue-strength gradients |
| Phase 5B | 42.9% (24/56) | Dimensionality and polysemy |
| Phase 6A | 50.0% (3/6) | Salience distributions |
| Phase 6B | 50.0% (3/6) | Forced-crossing asymmetry |
| Phase 6C | 25.0% (2/8) | Positional bridge structure |
| Phase 7A | 57.1% (4/7) | Anchoring causality |
| Phase 7B | 50.0% (3/6) | Curvature estimation |
| Phase 7C | 28.6% (2/7) | Too-central boundary |
| Phase 8A | 12.5% (1/8) | Bridge fragility |
| Phase 8B | 22.2% (2/9) | Gradient blindness |
| Phase 8C | 37.5% (3/8) | Gait normalization |
| **Phase 9A** | **28.6% (2/7)** | **Bridge dominance** |
| **Phase 9B** | **11.1% (1/9)** | **Transformation blindness** |
| **Phase 9C** | **22.2% (2/9)** | **Pre-fill facilitation** |

**Phase 9 overall: 20% (5/25 evaluable), slightly below Phase 8's 24%.**

The prediction accuracy floor has stabilized at ~20-24% for two consecutive phases. This is not coincidence — it reflects the inherent limit of single-variable mechanistic models applied to a multi-variable phenomenon. The confirmed predictions in both Phase 8 and Phase 9 cluster in the same categories: replications of known structural facts (Claude has highest dominance, non-Gemini gap is small) and qualitative directional calls (marginal bridges are facilitated). Zero novel mechanistic predictions have been confirmed across Phases 8-9 combined.

---

## 5. What Phase 9 Reveals About the Benchmark's Theoretical Framework

### The Two-Phase Wall

Phases 1-7 progressively built a theoretical framework: models have stable gaits (R1), space is quasimetric (R2), bridges are salience-determined bottlenecks (R6), early anchoring displaces bridges (O15), gradient bridges outperform causal ones (O17). Each finding suggested specific mechanistic follow-ups.

Phases 8-9 systematically tested those follow-ups and every single one failed. The complete ledger:

| Hypothesis | What It Predicted | What Happened |
|------------|-------------------|---------------|
| Route exclusivity (G20) | Competitor count predicts survival | rho = 0.116 |
| Gradient blindness (G21) | Gemini fails on gradients | Gemini fails on causal chains |
| Gait normalization (G22) | Scale correction fixes distances | Zero improvement |
| Dominance ratio (G23) | Bridge/competitor ratio predicts survival | rho = 0.157 |
| Transformation blindness (G24) | Gemini fails on transformations | Gemini fails on gradients |
| Facilitation crossover (G25) | Clean regression slope | CI includes zero |

Six mechanistic hypotheses, zero confirmed at the primary test level. This is not a failure of experimental design — the experiments are well-powered, the tests are pre-registered, and the analyses are clean. It is a discovery: **the transition between navigational structure and navigational mechanism requires multi-variable models that the benchmark's single-variable framework cannot provide.**

### What Single-Variable Models Cannot Capture

The warm/fermentation contrast (Section 1) illustrates the problem precisely. Both bridges have dominance ratio ~1.0. Both have high unconstrained frequency (~0.92-0.98). Both are tested with a semantically related pre-fill. But warm is destroyed and fermentation is bulletproof.

The difference is the *type of semantic relationship* between the pre-fill and the bridge:
- Cool is ON the same gradient as warm (both are temperature positions)
- Harvest is IN the same domain as fermentation but NOT on the same transformation chain

This requires a two-variable model: survival = f(dominance, pre-fill-bridge-relationship). Neither variable alone predicts the outcome. Dominance ratio alone gives rho = 0.157. Pre-fill content alone cannot be reduced to a single dimension (congruent/incongruent is too coarse — "cool" for warm is congruent but displacing, while "sorrow" for sadness is congruent and facilitating).

The mechanistic model needs at least three variables: bridge dominance, pre-fill semantic relationship to bridge, and bridge structural role (obligatory bottleneck vs. one-of-many). The benchmark's experimental framework tests one variable at a time, which is why it keeps hitting the 24% wall.

### O17 and the Pair Selection Problem

The O17 failure in Phase 9B deserves special attention. Gradient > causal-chain was observed twice (Phases 7C, 8B) with overlapping pair sets. Phase 9B was designed as an independent replication with non-overlapping pairs. It found the opposite.

The explanation is not that the gradient/transformation distinction is noise. It is that the specific bridges matter more than the type classification. Phase 9B's gradient pairs included several misspecified bridges (sapling, speaking, walking) while its transformation pairs included strongly specified bottleneck bridges (leather, pulp, steel). The "type" of bridge (gradient vs. transformation) has less predictive power than the "quality" of bridge specification (obligatory bottleneck vs. hypernym/too-central).

This reframes O17: the gradient advantage observed in Phases 7C and 8B was a property of those specific pair sets, not a general law about bridge types. The finding is downgraded from "approaching [robust]" to "[observed] with failed replication."

### The Facilitation Effect: Real but Messy

Despite H11 failing its primary test, the facilitation phenomenon is the most novel finding of Phase 9. Three observations survive:

1. **Marginal bridges can be massively facilitated.** Science-art "creativity" at 8.0x survival and student-professor "research" at 4.0x are not noise. When a bridge has low unconstrained frequency (0.125, 0.175), a semantically related pre-fill can boost its frequency by 4-8x.

2. **Facilitation is model-general.** 3/4 models show facilitation for at least one marginal bridge. Only Gemini fails to facilitate — consistent with its fragmented topology preventing the associative priming that facilitation requires.

3. **Pre-fill content modulates survival for some pairs.** The corrected Phase 7A comparison (5/8 replicate with different congruent concepts) shows that pre-fill presence is the primary driver, not content. However, for 3/8 pairs (moderate-dominance bridges), the specific congruent concept produces magnitude differences of 0.275-0.359, indicating a secondary content effect.

These observations do not constitute a clean mechanistic model. They are empirical facts about how the pre-fill paradigm works. The facilitation effect for marginal bridges is the most novel finding; the content modulation effect is real but moderate and limited to a subset of pairs.

---

## 6. Connections to Prior Phases

### Which Robust Claims Survive Phase 9

All seven robust claims (R1-R7) survive. Phase 9 does not touch most of them, and those it touches remain consistent:

**R1 (model gaits)** receives further confirmation from the per-model dominance analysis (Claude highest at 0.93, Gemini lowest at 0.45) and the facilitation per-model patterns (Gemini unable to facilitate, consistent with fragmented gait).

**R6 (bridges are bottlenecks)** is enriched by Phase 9B's data. The strongest-performing pairs in both transformation and gradient categories are the ones where the bridge is an obligatory bottleneck (leather for hide-shoe, pulp for log-paper, spectrum for light-color). The weakest are hypernyms (walking, speaking) or too-central concepts (sapling). The bottleneck principle continues to be the best predictor of bridge frequency.

### Which Observations Are Updated

**O15 (pre-filling causally displaces bridges)** is largely upheld. Phase 7A established that pre-filling reduces bridge frequency. Phase 9C's corrected Phase 7A comparison shows 5/8 pairs replicate with different congruent concepts, confirming that pre-fill presence is the primary driver. For moderate-dominance bridges (bank-ocean, music-mathematics, loan-shore), the specific pre-fill concept modulates survival magnitude by ~0.28-0.36, but does not reverse the direction. O15 stands with a minor qualification: content produces secondary modulation of displacement magnitude for some pairs.

**O17 (gradient > causal-chain)** fails its third replication and is NOT promoted to [robust]. The finding remains [observed] from Phases 7C and 8B but is now known to be pair-specific.

### Which Hypotheses Are Resolved

**H9 (dominance ratio):** Falsified as a standalone predictor. Combined rho = 0.157, not significant. The retrospective signal (rho = 0.548) was overfitting to 8 data points. **G23.**

**H10 (transformation-chain blindness):** Falsified with reversed direction. Gemini's transformation mean (0.667) exceeds its gradient mean (0.293). The pooled interaction across Phases 8B and 9B is -0.113, null. Gemini's deficit remains real but uncharacterized. **G24.**

**H11 (pre-fill facilitation crossover):** Partially falsified. The primary test (regression slope CI excludes zero) fails. But the facilitation effect for marginal bridges is confirmed (P3: mean congruent survival 3.761). The crossover point is higher than predicted (0.790 vs 0.40-0.50). H11 is revised: facilitation is real for marginal bridges, but the crossover is not a clean regression. The crossover is better described as a qualitative threshold around unconstrained frequency ~0.50-0.80, not a quantitative regression line. **Partial G25.**

### New Observations from Phase 9

**O21. Pre-fill content modulates bridge survival magnitude for some pairs.** [observed] — Phase 9C (14 pairs, 4 conditions). The corrected Phase 7A comparison (congruent-to-congruent) shows 5/8 pairs replicate within 0.15 when different congruent pre-fill concepts are used. Three pairs (bank-ocean, music-mathematics, loan-shore) show moderate magnitude differences (0.275-0.359) but no direction reversals. Pre-fill content produces secondary modulation, not primary determination. O15 stands with the qualification that content can modulate displacement magnitude for moderate-dominance bridges.

**O22. Marginal bridges show large facilitation under semantically aligned pre-fill.** [observed] — Phase 9C (4 marginal pairs, mean congruent survival 3.761). Science-art "creativity" at 8.0x, student-professor "research" at 4.0x. Effect is model-general (3/4 models), absent in Gemini. The facilitation effect is real and large but heterogeneous.

**O23. Bridge specification quality predicts frequency better than gradient/transformation type.** [observed] — Phase 9B (20 pairs). The O17 reversal is driven by bridge specification quality (bottleneck vs. hypernym/too-central), not by pair type. Obligatory bottleneck bridges (leather, pulp, steel) show near-universal frequency regardless of being transformation or gradient type. Hypernym bridges (speaking, walking) and too-central bridges (sapling) fail regardless of type.

---

## 7. The Graveyard, Updated

Phase 9 adds three entries, bringing the total to 25:

**G23. Dominance ratio predicts bridge fragility (H9).** Predicted Spearman rho > 0.50 between dominance ratio and pre-fill survival across 14 pairs. Observed: rho = 0.157, CI [-0.482, 0.691], not significant. The retrospective signal (rho = 0.548 on 8 pairs) collapsed prospectively because the critical anomaly — warm (ratio 1.00) destroyed, fermentation (ratio 1.07) bulletproof — demonstrates that the pre-fill's semantic relationship to the bridge, not the bridge's dominance, determines survival. After G20 (competitor count) and G23 (dominance ratio), both single-variable structural predictors of bridge fragility have failed. The phenomenon requires multi-variable models that account for pre-fill content. Killed by Phase 9A.

**G24. Gemini transformation-chain blindness (H10).** Predicted Gemini would show a larger (gradient - transformation) deficit than non-Gemini models, with transformation mean < 0.30 and interaction CI excluding zero. Observed: Gemini transformation mean 0.667 (more than 2x the predicted maximum), gradient mean 0.293, interaction -0.290 (wrong direction). Gemini shows MORE transformation zeros than gradient zeros in Phase 8B but FEWER in Phase 9B with a completely new pair set. The Phase 8B pattern was pair-specific, not type-specific. Gemini's overall deficit (mean 0.480 vs non-Gemini ~0.67) remains real but has now resisted three mechanistic characterizations (frame-crossing threshold → G7, gradient blindness → G21, transformation blindness → G24). Killed by Phase 9B.

**G25 (partial). Pre-fill facilitation crossover regression (H11).** Predicted a significant negative regression slope (CI excluding zero) for survival on unconstrained frequency, with crossover at 0.40-0.50. Observed: slope = -3.355 (correct direction), CI [-6.748, 0.723] includes zero. The crossover point is 0.790 (not 0.40-0.50). The regression fails because the data is too heterogeneous: cooking (marginal, 0.183) shows displacement (survival 0.136) while creativity (marginal, 0.125) shows massive facilitation (survival 8.000). Marginal status alone does not determine facilitation — the pre-fill concept's relationship to the bridge is the additional variable. Partially killed by Phase 9C; the facilitation observation (O22) survives.

The graveyard now contains 25 entries (G1-G25 including partials), averaging 2.8 per phase. The rate has been remarkably constant since Phase 5: each phase generates 2-3 specific mechanistic predictions, and 2-3 fail. The failures are not random — they cluster at the intersection of structure and mechanism, where the benchmark's single-variable framework is inadequate.

---

## 8. Methodological Reflections

### The Pair Selection Bottleneck

Phase 9 reinforces what Phase 8A first demonstrated: our ability to select well-specified bridges for new concept pairs is essentially zero. Phase 9B's gradient pairs included three bridges (sapling, speaking, walking) that turned out to be misspecified — one too-central, two hypernyms. These misspecifications are only identifiable after the fact.

The benchmark has now tested approximately 120 unique concept-pair-bridge combinations across 9 phases. The success/failure data is rich enough to build an empirical classifier: which structural features predict whether a proposed bridge will actually function? The features would include:
- Is the bridge a process/mechanism name or a categorical label?
- Is the bridge implied by both endpoints (too-central risk)?
- Is the bridge on the navigational path or merely associated (off-axis risk)?
- Is the bridge a positional midpoint or a dimensional hypernym?

Such a classifier could dramatically improve pair selection for future experiments. But building it requires systematic coding of the existing ~120 pairs, which is a data-analysis task beyond Phase 9's scope.

### Generalization Limits Within the Benchmark

Phase 9 clarifies the boundary between what replicates and what doesn't:

1. **O17 fails to replicate.** Gradient > causal-chain held in Phases 7C and 8B (partially overlapping pairs) but reversed in Phase 9B (non-overlapping pairs). Bridge specification quality, not pair type, drives this.
2. **Phase 7A survival rates mostly replicate.** The corrected comparison (matching congruent-to-congruent condition types) shows 5/8 pairs replicate within 0.15 with different congruent concepts. The 3 non-replicating pairs are moderate-dominance bridges where content produces magnitude (not direction) differences.
3. **Retrospective vs. prospective gap.** Phase 9A's dominance ratio shows rho = 0.548 retrospectively but 0.157 combined. Phase 8A showed the same pattern with competitor count.

The picture is more nuanced than a blanket "replication crisis." Structural properties (bridge presence/absence, displacement direction, gait consistency) replicate well. Quantitative magnitudes (exact survival rates, correlation strengths) show pair-specific variance when extended to new conditions. Mechanistic predictions (single-variable models) consistently fail.

This has implications for the paper: claims should be tagged not only by evidence tier ([robust], [observed], [hypothesis]) but also by generalization scope (within-pair-set, cross-pair-set, cross-condition).

### Pre-Fill Content: Secondary Modulation, Not Primary Driver

Phase 7A established pre-filling as a causal manipulation (O15). Phase 7A concluded that pre-fill content (congruent vs. incongruent vs. neutral) was secondary to pre-fill presence: survival was 0.631 congruent vs. 0.347 incongruent, with overlapping CIs.

Phase 9C's corrected comparison (congruent-to-congruent across phases) largely confirms this. Five of eight pairs replicate within 0.15 when different congruent concepts are used, indicating that the condition type (congruent/incongruent) matters more than the specific concept. The three non-replicating pairs (bank-ocean: diff 0.275, music-mathematics: diff 0.359, loan-shore: diff 0.279) show that for moderate-dominance bridges, the specific congruent concept can modulate survival magnitude by ~0.28-0.36, but does not reverse the direction of the effect.

This means the pre-fill paradigm works largely as Phase 7A described — pre-fill presence drives the effect, with condition type (congruent vs. incongruent) as the primary modulator. The specific concept within a condition type produces a secondary magnitude effect for some pairs. The displacement finding (O15) is robust.

---

## 9. Theoretical Integration: The Benchmark's Arc

### The Four-Act Narrative, Complete

**Act I: Structure (Phases 1-3).** Models have stable conceptual gaits, space is quasimetric with ~91% triangle inequality compliance, paths are compositional for hierarchical triples.

**Act II: Topology (Phases 4-5).** Bridges are salience-determined bottlenecks, not word associations. Process-naming bridges outperform object-naming bridges. Cue-strength gradients exist. Gemini diverges from the Claude/GPT/Grok cluster.

**Act III: Mechanism (Phases 6-7).** Early anchoring via associative primacy displaces bridges. Bridge position concentrates at positions 1-2. The pre-fill paradigm establishes causal influence on navigational paths. The cross-model geometry program fails.

**Act IV: Limits (Phases 8-9).** Single-variable mechanistic models fail. Six hypotheses tested, zero confirmed at the primary level. Prediction accuracy plateaus at ~20-24%. The benchmark maps qualitative structure but cannot predict quantitative mechanism. Pre-fill content matters enormously. The gradient/transformation distinction is pair-specific.

### What the Benchmark Has Established

The paper-ready findings, after nine phases:

**Structural constants (robust, replicated across phases):**
- Model gaits: 2.2x consistency gap, stable across 9 phases and ~18,000 runs (R1)
- Quasimetric space: asymmetry 0.811, triangle inequality ~91% across 3 independent samples (R2)
- Compositional hierarchies: 4.9x transitivity over controls (R4)
- Bottleneck bridges: obligatory intermediaries outperform word associations (R6)
- Cue-strength gradient: 12/16 families monotonic (R7)

**Topological observations (observed, specific to conditions):**
- Bridge early anchoring at positions 1-2, not midpoint (O12)
- Non-uniform salience: 7/8 KS reject (O11)
- "Too-central" concept failure: fire, water (O6, O16)
- Pre-filling displaces bridges; content produces secondary magnitude modulation (O15, O21, O22)
- Cross-model distance metrics fail irreparably (O18, O19)

**What the benchmark cannot do:**
- Predict bridge frequency for new pairs from structural features alone
- Identify the mechanism of bridge fragility with a single-variable model
- Characterize Gemini's deficit mechanistically (three attempts falsified)
- Build model-independent distance metrics from navigational paths
- Predict exact pre-fill survival magnitudes from structural features alone

### The 25-Entry Graveyard as Contribution

The graveyard is not a failure record. It is the benchmark's most honest contribution. Each entry represents a hypothesis that was specific enough to test and fair enough to falsify. The progression from G1 (Phase 1 polysemy artifact) through G25 (facilitation crossover) documents the systematic elimination of simple models:

- G1-G5 (Phases 1-3): Measurement artifacts and intuition failures
- G6-G12 (Phases 4-5): Boundary condition mischaracterizations
- G13-G19 (Phases 6-7): Mechanism misspecifications
- G20-G25 (Phases 8-9): Single-variable predictor failures

The trajectory is from "we measured wrong" to "we modeled wrong" — a healthy research arc that converges on an honest assessment of what the methodology can and cannot resolve.

---

## 10. Summary of Key Findings

1. **The dominance ratio hypothesis fails.** Combined Spearman rho = 0.157 (CI includes zero). Warm (ratio 1.00) is destroyed while fermentation (ratio 1.07) survives perfectly. The pre-fill's semantic relationship to the bridge, not the bridge's structural dominance, determines survival. **Graveyard: G23.**

2. **Transformation-chain blindness reverses.** Gemini's transformation mean (0.667) exceeds its gradient mean (0.293) — the opposite of H10. Pooled meta-analytic interaction: -0.113, null. Gemini's deficit is real (mean 0.480 vs ~0.67 non-Gemini) but has now resisted three mechanistic characterizations. **Graveyard: G24.**

3. **O17 fails to replicate.** Phase 9B finds transformation > gradient (0.699 vs 0.543). The reversal is driven by bridge specification quality (bottleneck vs. hypernym/too-central), not pair type. O17 remains [observed] from Phases 7C/8B but is NOT promoted to [robust].

4. **The facilitation effect is real and large.** Marginal bridges show mean congruent survival of 3.761, with science-art "creativity" at 8.0x. Three of four models show facilitation. Gemini does not. The effect is model-general but heterogeneous. **[observed]** (O22.)

5. **Pre-fill content modulates survival for some pairs.** The corrected Phase 7A comparison (congruent-to-congruent) shows 5/8 pairs replicate within 0.15 with different congruent concepts. Three moderate-dominance pairs show magnitude differences of 0.275-0.359 but no direction reversals. Pre-fill presence remains the primary driver; content is a secondary modulator. **[observed]** (O21.) O15 largely upheld.

6. **Bridge specification quality outpredicts type classification.** Obligatory bottleneck bridges (leather, pulp, steel, spectrum) show near-universal frequency regardless of gradient/transformation type. Hypernym bridges (speaking, walking) and too-central bridges (sapling) fail regardless of type. **[observed]** (O23.)

7. **Prediction accuracy is 20%, slightly below Phase 8's 24%.** 5/25 evaluable predictions confirmed. The prediction floor has stabilized at ~20-24% — single-variable mechanistic models produce this accuracy range regardless of which variables are tested. Zero novel mechanistic predictions confirmed across Phases 8-9 combined.

8. **All robust claims (R1-R7) survive.** Claude's gait dominance, quasimetric space, triangle inequality, bottleneck bridges, cue-strength gradients — all continue to hold after nine phases and ~18,000 runs.

9. **The benchmark's mechanistic program has reached its limit.** Six hypotheses tested in Phases 8-9, zero confirmed at the primary level. The phenomenon requires multi-variable interaction models that the single-variable experimental framework cannot provide. This is the benchmark's most important meta-finding: it maps qualitative structure reliably but cannot predict quantitative mechanism.

10. **The four-act paper narrative is complete.** Structure → topology → mechanism → limits. Nine phases, ~18,000 runs, 7 robust claims, 24 observations, 25 graveyard entries. The benchmark demonstrates that LLMs navigate conceptual space with consistent, measurable geometric structure that resists mechanistic reduction.
