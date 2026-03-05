# Phase 8 Analysis: Three Hypotheses Walk Into the Data and None Walk Out

> Interpretive analysis of Phase 8: bridge fragility and route exclusivity (8A), Gemini gradient blindness (8B), and gait-normalized cross-model distance (8C).
>
> 960 new runs + 1,880 reused (8A) + 1,230 new runs + 120 reused (8B) + 500 new runs + 960 reused (8C) = 2,690 new API runs + 2,960 reused, across 4 models, 14 fragility pairs, 20 gradient/causal pairs, 16 distance pairs.
>
> March 2026

## Executive Summary

**Phase 8 is the phase where the benchmark's theoretical ambitions collide with the stubbornness of the data, and the data wins all three rounds.** The route exclusivity hypothesis (H8) -- that bridge fragility under pre-fill is predicted by the number of competitor waypoints -- fails: Spearman rho = 0.116 retrospectively and -0.121 combined, neither significant, with the most devastating anomaly being that sadness (8 competitors) survives at 0.807 while harmony (7 competitors) collapses to 0.015. The Gemini gradient-blindness hypothesis -- that Gemini shows a selective deficit on gradient-midpoint pairs relative to causal-chain pairs -- fails in the opposite direction from predicted: Gemini's zeros concentrate on causal-chain pairs (6/10) rather than gradient pairs (1/10), and the Gemini interaction term is 0.046 (CI [-0.339, 0.450]), statistically null. The gait-normalization rescue -- that dividing raw Jaccard distances by model-specific baselines would recover cross-model geometry -- fails with mathematical finality: normalized correlation is identical to raw correlation at r = 0.212, with zero improvement on every single model pair, meaning the gait difference is not a scale factor but a structural reorganization of conceptual space.

Phase 8's prediction accuracy is 24% (6/25 across all three sub-experiments -- 8A: 1/8, 8B: 2/9, 8C: 3/8), the worst in the benchmark's history and a precipitous drop from Phase 7's 45%. But the failures are not random -- they cluster around a single theme: the benchmark has been trying to explain variance in LLM navigation with single-variable models (competitor count predicts fragility, gradient type predicts Gemini failure, scale factor predicts distance disagreement), and single-variable models are inadequate. Bridge fragility is real but its predictor is not competitor count. Gemini's deficit is real but its mechanism is not gradient blindness. Cross-model distance disagreement is real but its structure is not a rescalable gait artifact. Each failure points to a deeper, multi-variable mechanism that Phase 8 exposes but cannot yet characterize. The phase is a triple negative that clears the theoretical underbrush and forces the benchmark toward more honest, more complex models of what is happening.

Three new graveyard entries join the growing cemetery of falsified predictions, bringing the total to 22 -- nearly three per phase, a rate that has held constant since Phase 5. The graveyard is not evidence of a failing research program; it is evidence of a program that tests its hypotheses rather than protecting them.

---

## 1. Bridge Fragility: The Route Exclusivity Model Collapses

### The Hypothesis and Its Logic

Phase 7A discovered that bridge fragility under pre-fill is bimodal (H8): sadness and dog survive robustly (0.750+), while harmony and germination collapse to near-zero. The proposed explanatory variable was route exclusivity -- the number of alternative waypoints that could substitute for the bridge on the unconstrained path. The logic was compelling: if sadness is essentially the only route from emotion to melancholy, pre-filling position 1 merely delays its appearance; if harmony competes with rhythm, pattern, symmetry, and frequency for the music-to-mathematics route, pre-filling creates an opening for an alternative that displaces the bridge permanently.

Phase 8A tests this directly. Using Phase 6A salience data, we count the number of competitor waypoints (concepts appearing at >20% frequency on the unconstrained path) for each bridge, then correlate competitor count with pre-fill survival.

### The Retrospective Test Fails

The six pairs from Phase 6A + 7A with both salience and pre-fill data give a Spearman rho of 0.116 (CI [-0.866, 1.000]). This is not merely non-significant negative -- it is slightly positive, opposite the predicted direction. Competitor count does not predict bridge survival.

The failure is driven by two anomalies that no single-variable model can accommodate:

| Pair | Bridge | Competitors | Survival | Predicted | Problem |
|------|--------|------------|----------|-----------|---------|
| emotion-melancholy | sadness | 8 | 0.807 | Low (many competitors) | **Highest competitors, highest survival** |
| music-mathematics | harmony | 7 | 0.015 | Low (many competitors) | Consistent |
| seed-garden | germination | 6 | 0.000 | Medium | Consistent |
| bank-ocean | river | 5 | 0.778 | Medium-high | **Few competitors, high survival** |
| sun-desert | heat | 5 | 0.691 | Medium-high | Roughly consistent |
| light-color | spectrum | 4 | 0.645 | High (few competitors) | Consistent |

Sadness has the most competitors of any bridge in the sample -- affect, feel, long, mood, nostalgia, sentiment, sorrow, wistfulness -- yet shows the highest survival rate (0.807). This single data point breaks the route exclusivity model beyond repair. If 8 competitors cannot bring down sadness, competitor count is not the controlling variable.

### Why Sadness Survives and Harmony Collapses

The variable is not how many alternatives exist but *how dominant the bridge is relative to those alternatives*. Sadness is not merely one of several waypoints on the emotion-to-melancholy path -- it is the gravitational center of the entire navigational landscape. The 8 "competitors" (affect, mood, sentiment, sorrow, etc.) are not truly alternatives to sadness; they are satellites of the same affective cluster, weaker variants that orbit the same conceptual core. Pre-filling position 1 with an unrelated concept does not dislodge sadness because sadness is not at position 1 by accident -- it is at position 1 because it is overwhelmingly the strongest activation in the entire emotion-melancholy field. No competitor can displace what no competitor can match.

Harmony, by contrast, is not the gravitational center of the music-to-mathematics landscape. It is one of several equally viable bridges -- rhythm, pattern, frequency, proportion, symmetry all offer genuine alternative navigational routes. Pre-filling position 1 does not dislodge a dominant waypoint; it creates an opening for one of several equally competitive alternatives, and once the path has departed through rhythm or pattern, there is no navigational reason to return to harmony.

**[hypothesis]** Bridge survival under perturbation is predicted not by the number of competitors but by the *dominance ratio* -- the bridge's unconstrained frequency relative to the strongest alternative. Sadness at 0.950 unconstrained frequency is a near-monopoly (its 0.807 pre-fill survival reflects this dominance); harmony at 0.550 shares its path with multiple concepts at comparable frequency. This hypothesis is consistent with the data but untested: we do not have the second-strongest competitor frequencies for all pairs to compute dominance ratios directly.

### The Prospective Validation Is a Methodological Catastrophe

Phase 8A's prospective arm -- 8 new pairs with predicted competitor counts -- fails almost entirely, but not because the route exclusivity model is wrong. It fails because 6 of 8 prospective bridges do not pass the evaluability gate (unconstrained bridge frequency >= 0.40).

The worst cases are instructive:

- **question-answer "reasoning"** shows 0.000 unconstrained frequency. "Reasoning" is not a bridge from question to answer -- it is a meta-description of the process, not a navigational waypoint. Models route from question to answer through concepts like "inquiry," "analysis," "logic," and "response" without ever passing through "reasoning" as an intermediate.
- **ocean-mountain "landscape"** shows 0.000. "Landscape" describes the endpoint context, not the navigational route between ocean and mountain. Models find terrain-specific intermediaries (coastline, plateau, elevation) rather than the abstract container.
- **science-art "creativity"** shows the bizarre inverted pattern: pre-fill frequency (0.650) exceeds unconstrained frequency (0.125), giving a "survival rate" of 5.200. Pre-filling appears to *help* rather than hinder.
- **student-professor "research"** shows the same inversion: survival 2.429.

The predicted competitor counts do not match observed counts (rho = 0.037 between predicted and observed). Our a priori ability to predict the navigational landscape of a new pair is essentially zero.

### The Inverted Survival Anomaly

The science-art and student-professor results deserve special attention because they reveal something genuinely unexpected about the pre-fill mechanism. On these pairs, pre-filling position 1 *increases* the bridge's frequency rather than decreasing it.

How is this possible? The most likely explanation involves the nature of the pre-fill concepts used. If the pre-fill is semantically related to the bridge (e.g., a congruent pre-fill for science-art might activate the creativity cluster), then pre-filling does not displace the bridge -- it primes it. This would be consistent with the Phase 7A finding that congruent pre-fills produce marginally higher bridge survival (0.631) than incongruent or neutral. For pairs where the bridge has low unconstrained frequency (science-art "creativity" at 0.125), the bridge is not being displaced from a dominant position; it is being boosted from a marginal one by a semantically aligned pre-fill.

**[hypothesis]** Pre-filling can be either displacing or facilitating depending on the bridge's unconstrained dominance and the semantic relationship between the pre-fill and the bridge. For dominant bridges (sadness, dog), pre-filling displaces. For marginal bridges (creativity, research), pre-filling may facilitate by priming the relevant conceptual cluster. This would reconcile the Phase 7A displacement finding with the Phase 8A inversion anomaly, but it requires a dedicated test with controlled pre-fill semantics across bridge-dominance levels.

### The Step Function Finding

One result partially survives the wreckage: the threshold analysis shows that a step function (survival = high if competitors < k, low if competitors >= k) fits better than a linear model, with the best threshold at k=5 and classification accuracy of 0.875. This is consistent with bridge fragility being bimodal (H8 from Phase 7) -- bridges are either robust or collapsed, with a sharp transition rather than a smooth gradient. But the threshold is at 5 competitors, not the predicted 3-4, and the classification accuracy is based on only 8 evaluable pairs. The step-function pattern is suggestive but not definitive.

### Per-Model Competitor Counts

Claude produces the fewest competitors per pair (7.14), confirming the Phase 1 gait characterization yet again. Gemini produces the most (8.07). This is the only confirmed prediction in 8A (1/8). Claude's narrow vocabulary extends to its competitive landscape: when Claude navigates, it produces fewer alternative waypoints because its rigid gait concentrates traffic through a smaller set of concepts. Gemini's high competitor count is consistent with its fragmented topology -- Gemini explores more alternatives precisely because it lacks the strong attractor structure that concentrates traffic through dominant bridges.

---

## 2. Gemini's Deficit Is Real but Backward

### The Gradient-Blindness Hypothesis

Phase 7C discovered that Gemini shows systematic zeros on univocal within-frame bridges: tree (acorn-timber), dough (flour-bread), speak (whisper-shout), water (ice-steam), noon (dawn-dusk). One possible explanation: Gemini fails to represent continuous semantic gradients as well as other models, making it selectively impaired on gradient-midpoint bridges while preserving causal-chain bridges where the intermediate is a discrete transformation stage.

Phase 8B tests this directly with 10 gradient-midpoint pairs (warm for hot-cold, speak for whisper-shout, noon for dawn-dusk, adolescent for infant-elderly, etc.) and 10 causal-chain pairs (fermentation for grape-wine, cocoon for caterpillar-butterfly, pottery for clay-vase, etc.). The primary test is the Gemini interaction: does Gemini show a larger gradient-minus-causal deficit than non-Gemini models?

### The Primary Test Fails

The interaction is 0.046 (CI [-0.339, 0.450]). Gemini's gradient-minus-causal gap (0.227) is almost identical to the non-Gemini gap (0.181). Gemini is not selectively impaired on gradients. It shows the same proportional advantage for gradient pairs as every other model, just at lower absolute frequency.

The per-model breakdown makes this concrete:

| Model | Gradient Mean | Causal Mean | Gap |
|-------|--------------|-------------|-----|
| Claude | 0.900 | 0.733 | 0.167 |
| GPT | 0.873 | 0.673 | 0.200 |
| Grok | 0.807 | 0.630 | 0.177 |
| Gemini | 0.500 | 0.273 | 0.227 |

All four models show the same pattern: gradient bridges outperform causal-chain bridges. The gap is remarkably consistent (0.167-0.227) despite the large differences in absolute levels. Gemini's gap (0.227) is actually the largest, not the smallest -- the precise opposite of what gradient blindness would predict. If Gemini were selectively gradient-blind, its gap should be negative or at least smaller than other models'.

### O17 Replicates Robustly

**[observed]** The gradient-vs-causal distinction replicates with a larger sample. Gradient mean 0.770 vs causal mean 0.578, difference 0.193 (CI [0.010, 0.360]). The confidence interval excludes zero. O17 -- that continuous-spectrum midpoints are more navigational than process intermediaries -- is now confirmed across Phase 7C and Phase 8B. Note: the two experiments share 4 overlapping gradient pairs (whisper-shout, hot-cold, dawn-dusk, infant-elderly), so this is a partial rather than fully independent replication. The 6 novel gradient pairs and all 10 causal pairs in 8B provide new evidence. This moves toward [robust] status pending one more replication with a fully non-overlapping pair set.

### The Real Story: Gemini's Causal-Chain Collapse

The gradient-blindness hypothesis was not just wrong -- it was backward. Gemini's zeros concentrate on causal-chain pairs, not gradient pairs:

**Gemini zeros:**
- Gradient: 1/10 (dawn-dusk "noon")
- Causal: 6/10 (ore-jewelry "metal", caterpillar-butterfly "cocoon", clay-vase "pottery", seed-fruit "flower", acorn-timber "tree", flour-bread "dough")

Gemini succeeds on 9/10 gradient pairs but fails on 6/10 causal pairs. The pattern is the opposite of what the gradient-blindness hypothesis predicted.

What distinguishes the causal-chain pairs where Gemini fails? They are all *material transformation* processes: ore becomes metal, caterpillar becomes cocoon, clay becomes pottery, seed becomes flower, acorn becomes tree, flour becomes dough. The bridge concept names an intermediate physical state in a manufacturing or biological process. Gemini apparently cannot route through these transformation intermediaries despite having no trouble finding continuous-dimension midpoints like warm, walk, lake, rock, and rain.

This connects back to H1 (frame-crossing) in a revised form. The original frame-crossing hypothesis explained Gemini's failures as an inability to cross between polysemous senses (bank-financial vs bank-geographic). Phase 7C extended this to univocal within-frame bridges. Phase 8B further specifies the pattern: Gemini fails specifically on *transformation bridges* -- concepts that name an intermediate stage in a causal sequence -- while succeeding on *position bridges* -- concepts that name a point on a continuous scale.

**[hypothesis]** Gemini's navigational deficit is not frame-crossing failure or gradient blindness but *transformation-chain blindness*: an inability to route through concepts that name intermediate states in material or biological processes. The mechanism may be that Gemini's topology represents continuous dimensions (temperature, size, speed, age) as navigable gradients but represents causal processes (smelting, metamorphosis, firing, fermentation) as discrete endpoints without reliable intermediate representations.

### Non-Gemini Models Also Show Zeros

A critical finding that tempers the Gemini focus: non-Gemini models also produce zeros, including on gradient pairs.

- Claude: caterpillar-butterfly "cocoon" (0.000), clay-vase "pottery" (0.067), murmur-scream "speech" (0.000)
- GPT: seed-fruit "flower" (0.000)
- Grok: ore-jewelry "metal" (0.000), sand-glass "heat" (0.000), murmur-scream "speech" (0.000)

The murmur-scream "speech" result is especially notable. This is a gradient pair -- murmur and scream sit at opposite ends of a vocal-intensity spectrum, and "speech" names the ordinary midpoint. Yet Claude shows 0.000 and Grok shows 0.000 (GPT shows 0.200, Gemini shows 0.067). This is the first gradient pair where non-Gemini models systematically fail.

Why does "speech" fail? Unlike warm (hot-cold), walk (crawl-sprint), or lake (pond-ocean), "speech" does not name a *position on the intensity gradient* between murmur and scream. It names the *category* that contains both murmur and scream. "Speech" is to murmur-scream what "temperature" is to hot-cold -- a hypernym, not a midpoint. The models that fail on murmur-scream are correctly identifying that "speech" is not a navigational intermediate; it is a categorical label. Models that succeed (GPT at 0.200) are using the categorical label as a waypoint anyway, consistent with GPT's broader, less precise navigational style.

This suggests a refinement of O17: gradient midpoints outperform causal-chain bridges specifically when the midpoint names a *position on the dimension* rather than the *dimension itself*. Warm is a temperature position; speech is the vocal dimension. The distinction matters because positional midpoints are genuinely intermediate (warm is between hot and cold) while dimensional labels are superordinate (speech contains both murmur and scream).

### Phase 7C Replication

Nine of twelve model-pair combinations from Phase 7C replicate within 0.15 in Phase 8B. The three failures are: GPT on whisper-shout (0.700 to 0.867, +0.167), GPT on dawn-dusk (0.400 to 0.733, +0.333), and Grok on infant-elderly (0.500 to 0.667, +0.167). All three failures show Phase 8B *higher* than Phase 7C. This could represent genuine temporal drift (model updates between phases) or sampling noise in Phase 7C's smaller sample size. The direction is consistent: GPT and Grok appear slightly more capable in Phase 8B than Phase 7C, while Claude and Gemini are unchanged. This is a data point for temporal stability (Section 8) but not conclusive.

---

## 3. Gait Normalization Fails With Mathematical Finality

### The Rescue Attempt

Phase 7B discovered the distance metric crisis: cross-model navigational distance correlation is r = 0.170, meaning models do not agree on how far apart concepts are. Phase 7's analysis proposed gait normalization as a possible rescue: divide each model's raw Jaccard distance by its characteristic baseline (mean distance across a reference set), producing a "gait-normalized" distance that should remove the scale factor contributed by navigational style.

The logic was straightforward: if Claude shows short distances because of its rigid, overlapping paths, and GPT shows long distances because of its exploratory, diverse paths, then dividing by each model's mean distance should rescale them to a common reference frame. Claude's 0.10 and GPT's 0.50 for the same pair would both become ~0.27 after normalization, revealing the shared underlying distance.

### The Primary Test: Zero Improvement

Phase 8C's primary result is as clean as a negative result can be. The normalized cross-model correlation is 0.212 -- identical to the raw correlation of 0.212. The improvement is exactly 0.000 on every single model pair:

| Model Pair | r (raw) | r (normalized) | Improvement |
|------------|---------|----------------|-------------|
| Claude-GPT | 0.381 | 0.381 | 0.000 |
| Claude-Grok | 0.437 | 0.437 | 0.000 |
| Claude-Gemini | 0.350 | 0.350 | 0.000 |
| GPT-Grok | 0.732 | 0.732 | 0.000 |
| GPT-Gemini | -0.210 | -0.210 | 0.000 |
| Grok-Gemini | -0.580 | -0.580 | 0.000 |

This is not "normalization did not help much." This is "normalization had literally no effect." The Pearson correlations are identical to three decimal places before and after normalization. The Spearman rank correlations are also identical (0.287 raw, 0.287 normalized). This means the gait baseline -- the model's characteristic mean distance -- is a *multiplicative constant* that divides out of the Pearson correlation coefficient without changing it. The formula r(X/a, Y/b) = r(X, Y) when a and b are constants. The normalization was doomed by construction.

### Why This Result Is Profound

The mathematical triviality of the normalization failure is itself the finding. What the result demonstrates is that **the cross-model distance disagreement is not a scale problem at all.** If the disagreement were merely that Claude measures distances on a 0-0.5 scale while GPT measures on a 0-0.8 scale, then normalization would trivially fix it (and in fact any correlation coefficient already ignores linear scaling). The disagreement is that Claude and GPT *rank-order pairs differently*. When Claude says A-B is closer than C-D, GPT sometimes says the opposite. No normalization can fix a disagreement about ordinal structure.

The Spearman rank correlation of 0.287 (unchanged by normalization) makes this explicit. Models agree on the rank ordering of conceptual distances only 28.7% more than chance. This is not a measurement calibration problem. It is a disagreement about the topology of conceptual space.

### The Anti-Correlation Structure

The most striking finding in the distance matrix is the anti-correlations:

- **Grok-Gemini: r = -0.580.** When Grok says two concepts are close, Gemini says they are far, and vice versa. This is not noise -- it is a systematic inversion of the distance metric.
- **GPT-Gemini: r = -0.210.** A weaker inversion between GPT and Gemini.

The positive correlations form a recognizable cluster:
- **GPT-Grok: r = 0.732.** These two models largely agree on relative distances.
- **Claude-Grok: r = 0.437.** Moderate agreement.
- **Claude-GPT: r = 0.381.** Moderate agreement.

The structure is: {Claude, GPT, Grok} form a loosely agreeing cluster with pairwise r between 0.38 and 0.73, while Gemini anti-correlates with two of the three. This echoes the Phase 4A finding of a "connected navigators" cluster (Claude-GPT-Grok) versus Gemini's fragmented topology. The distance metric crisis is not uniform -- it is specifically a Gemini divergence.

### Residual Analysis: Which Pairs Cause the Disagreement

The residual analysis reveals that disagreement concentrates on specific pairs:

| Pair | Max Disagreement | Models |
|------|-----------------|--------|
| winter-summer | 0.988 | Grok vs Gemini |
| light-color | 0.902 | Grok vs Gemini |
| caterpillar-butterfly | 0.810 | Claude vs GPT |
| question-answer | 0.623 | Claude vs Gemini |

Winter-summer shows near-maximal disagreement: Grok measures it as very far (d = 0.925) while Gemini measures it as close (d = 0.273). This 3.4x ratio in raw distance produces a normalized disagreement of 0.988. The pair represents temporal/seasonal opposition -- models apparently differ sharply in whether seasonal antonyms create navigational distance (Grok: yes, the paths diverge widely) or proximity (Gemini: no, the paths are similar).

Light-color shows a similar pattern: Grok at 0.816, Gemini at 0.225. This pair has been studied since Phase 3, and the bridge "spectrum" is universal. But universal bridge agreement does not imply distance agreement -- models can route through the same bridge while disagreeing on how much of the path overlaps.

### Model Baselines Confirm Gait Characterization

The model baselines replicate the Phase 7B pattern:

| Model | Baseline | Phase 7B Analogue |
|-------|----------|-------------------|
| Claude | 0.372 | 0.225 (mean excess) |
| Gemini | 0.539 | 0.294 |
| Grok | 0.619 | 0.689 |
| GPT | 0.692 | 0.680 |

Claude remains the most compact navigator (lowest mean distance), GPT the most expansive (highest). The ordering Claude < Gemini < Grok < GPT is stable across phases and measurement methods. This consistency is reassuring -- the gait characterization (R1) continues to replicate -- but it also means the gait difference is not going away. It is a persistent structural feature of the models, not a transient artifact.

### Implications for the Curvature Program

The curvature re-estimation was not attempted because the primary test failed. This is the correct decision but the consequence is severe: the curvature research program proposed in Phase 5 and first attempted in Phase 7B is now definitively stalled. The program required a model-independent distance metric; Phase 7B showed we did not have one; Phase 8C shows we cannot construct one through gait normalization. The only remaining options are:

1. **Embedding-based distances:** Use the models' internal representations (token embeddings, hidden-state geometry) rather than their generated paths to compute distances. This moves from behavioral to representational measurement, which is a different research program.

2. **Within-model curvature only:** Accept that curvature is model-specific and report within-model results without cross-model comparison. Phase 7B's within-model curvature profiles are interpretable (Claude: low excess, GPT/Grok: high excess) but not generalizable.

3. **Abandon cross-model geometry entirely.** Accept that each model inhabits its own conceptual space with its own metric. This is the most honest interpretation of the data, and it does not prevent useful analysis -- it just limits generality claims.

**[observed]** Gait normalization produces zero improvement on cross-model distance correlation (O19). The cross-model disagreement is structural (ordinal-level, involving rank inversions) rather than scalar (a simple scale factor). Model-independent geometry is blocked by the navigational measurement framework. This extends O18 from "models disagree on distance" to "the disagreement is irreducible by simple normalization and involves anti-correlations for some model pairs."

---

## 4. Cross-Model Patterns: The Gemini Divergence Deepens

### The Three-Plus-One Structure

Phase 8 sharpens a pattern that has been building since Phase 4: Claude, GPT, and Grok form a loosely similar cluster while Gemini diverges in a distinctive way. The evidence now spans multiple dimensions:

**Bridge frequencies (8B):** Claude, GPT, and Grok show gradient means of 0.807-0.900 and causal means of 0.630-0.733. Gemini shows gradient mean 0.500 and causal mean 0.273. The absolute gap is large (Gemini is roughly half the others' frequency), but the proportional structure is the same (gradient > causal for all four).

**Distance correlations (8C):** Claude-GPT (0.381), Claude-Grok (0.437), GPT-Grok (0.732) are all positive. GPT-Gemini (-0.210) and Grok-Gemini (-0.580) are negative. Gemini does not merely disagree with the cluster -- it sees the opposite distance structure.

**Zero patterns (8B):** Gemini produces 7/20 zeros (1 gradient, 6 causal). Non-Gemini models produce 6/60 zeros distributed across both types. Gemini's zeros are concentrated and systematic; non-Gemini zeros are scattered and pair-specific.

### What Gemini's Anti-Correlation Means

The Grok-Gemini anti-correlation of -0.580 is not a minor discrepancy. It means that when Grok navigates from winter to summer using diverse, far-flung waypoints (d = 0.925), Gemini navigates the same pair using similar, repetitive waypoints (d = 0.273). And when Grok navigates ocean-to-mountain with moderate diversity (d = 0.449), Gemini shows high diversity (d = 0.664).

One interpretation: Gemini's waypoint diversity is driven by different factors than the other models'. For pairs where the endpoints share a clear conceptual frame (winter-summer share seasonality, light-color share physics), Gemini navigates efficiently within the frame, producing low diversity. For pairs where the endpoints occupy different frames (ocean-mountain require terrain bridging), Gemini's fragmented topology forces it into diverse, frame-crossing routes that other models accomplish more directly.

This is consistent with the transformation-chain blindness hypothesis from Section 2. Gemini navigates well within conceptual frames (gradients, within-frame relationships) but poorly across frames (transformations, process intermediaries), and the pattern of distance diversity reflects this: low diversity within frames (efficient navigation), high diversity across frames (inefficient exploration).

---

## 5. Prediction Accuracy: Phase 8 Scorecard

### Phase 8A Predictions

| # | Prediction | Result | Verdict |
|---|------------|--------|---------|
| 1 | Retrospective rho < -0.70, CI excludes zero | rho = 0.116 | Not confirmed |
| 2 | Prospective rho < -0.60, CI excludes zero | rho = -0.121, CI includes zero | Not confirmed |
| 3 | Low-competitor pairs survival > 0.60 | Mean 0.143 (n=1 evaluable) | Not confirmed |
| 4 | High-competitor pairs survival < 0.30 | Mean 0.426 (n=1 evaluable) | Not confirmed |
| 5 | Medium-competitor pairs survival 0.25-0.60 | No evaluable pairs | Insufficient data |
| 6 | Step-function threshold at k = 3-4 | Best k = 5 | Not confirmed |
| 7 | Predicted competitor counts correlate with observed (r > 0.60) | rho = 0.037 | Not confirmed |
| 8 | Claude produces fewest competitors per pair | Claude = 7.14 (lowest) | **Confirmed** |

**8A accuracy: 1/8 (12.5%)**

The sole confirmed prediction is that Claude's rigid gait produces the narrowest competitor landscape. Every mechanistic prediction fails. The prospective arm is devastated by evaluability failures (6/8 pairs have bridges below the 0.40 threshold). Our ability to predict navigational landscapes a priori is essentially nil.

### Phase 8B Predictions

| # | Prediction | Result | Verdict |
|---|------------|--------|---------|
| 1 | Gradient > causal by >= 0.15, CI excludes zero | Diff = 0.193, CI [0.010, 0.360] | **Confirmed** |
| 2 | Gemini gradient mean < 0.25 | Gemini gradient = 0.500 | Not confirmed |
| 3 | Gemini causal mean > 0.40 | Gemini causal = 0.273 | Not confirmed |
| 4 | Gemini interaction >= 0.20 negative, CI excludes zero | Interaction = 0.046, CI includes zero | Not confirmed |
| 5 | Gemini 0.000 on >= 5/10 gradient pairs | 1/10 zeros | Not confirmed |
| 6 | Gemini 0.000 on <= 2/10 causal pairs | 6/10 zeros | Not confirmed |
| 7 | Non-Gemini gap < 0.15 | Gap = 0.181 | Not confirmed |
| 8 | Phase 7C replication within 0.15 for all 12 combinations | 9/12 replicate | Partially confirmed |
| 9 | Gemini alternative routing uses related concepts | 1/1 mixed | **Confirmed** |

**8B accuracy: 2/9 (22.2%), with 1 partial**

The O17 replication succeeds. Everything specifically about Gemini gradient blindness fails. Predictions 5 and 6 are not just wrong -- they are backward (predicted Gemini gradient zeros >= 5, observed 1; predicted Gemini causal zeros <= 2, observed 6). The Phase 7C replication is close but not exact (9/12 rather than 12/12).

### Phase 8C Predictions

| # | Prediction | Result | Verdict |
|---|------------|--------|---------|
| 1 | Raw cross-model r < 0.30 (replicates Phase 7B) | r = 0.212 | **Confirmed** |
| 2 | Claude baseline lowest, GPT/Grok highest | Claude 0.372 (lowest), GPT 0.692 (highest) | **Confirmed** |
| 3 | Normalized r > 0.50, CI lower > 0.30 (PRIMARY) | r = 0.212, CI [-0.167, 0.705] | Not confirmed |
| 4 | Normalization improvement >= 0.25 | Improvement = 0.000 | Not confirmed |
| 5 | Claude-GPT raw r lowest; normalization improves it most | Claude-GPT r = 0.381 (not lowest) | Not confirmed |
| 6 | Spearman rank correlation improves after normalization | Improvement = 0.000 | Not confirmed |
| 7 | If primary passes: polysemous excess remains non-significant | Primary failed, conditional | Insufficient data |
| 8 | If primary fails: model-independent geometry blocked | Normalization failed, geometry blocked | **Confirmed** |

**8C accuracy: 3/8 (37.5%)**

The replication predictions succeed (raw correlation is low, Claude is compact, GPT is expansive -- all known facts). The rescue predictions fail completely. The conditional prediction about geometry being blocked is confirmed by the failure of the primary test.

### Cumulative Prediction Scorecard

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

**Phase 8 overall: 24% (6/25), the lowest in the benchmark's history.**

The structural/mechanistic split in prediction success identified in Phase 7 continues and deepens. The three confirmed predictions in 8C are all replications of known facts (low cross-model r, Claude compact, geometry blocked if normalization fails). The two confirmed predictions in 8B are a known replication (gradient > causal) and a descriptive observation (Gemini alternative routing). The one confirmed prediction in 8A is a gait characterization already established in Phase 1. Zero novel mechanistic predictions confirmed in Phase 8.

**[observed]** Prediction accuracy reaches its nadir when the benchmark attempts single-variable causal explanations of complex phenomena (O20). The pattern is now unmistakable: replication predictions succeed at approximately 80%, structural/qualitative predictions at approximately 50%, and mechanistic/quantitative predictions at approximately 15%. The benchmark can replicate its own findings and predict qualitative directions but cannot identify the specific mechanism behind any phenomenon from the current theoretical framework.

---

## 6. Connections to Prior Phases

### Which Robust Claims Survive Phase 8

All seven robust claims (R1-R7) survive Phase 8, and two receive significant new evidence:

**R1 (model gaits)** receives its most definitive characterization yet. Phase 8C's model baselines (Claude 0.372, Gemini 0.539, Grok 0.619, GPT 0.692) replicate the Phase 7B pattern and demonstrate that the gait difference is *structural*, not scalar. Normalization cannot remove it because the models do not merely disagree on scale -- they disagree on ordinal distance rankings. R1 now encompasses three levels: (a) navigational consistency (Phase 1 Jaccard), (b) vocabulary breadth (Phase 6A entropy), and (c) distance topology (Phase 8C anti-correlations). The gait is not a single parameter but a multi-dimensional navigational personality.

**R7 (cue-strength gradient)** is extended by Phase 8B. The gradient-vs-causal distinction replicates (0.770 vs 0.578, CI excludes zero), and the new 20-pair sample shows the pattern holds across a wider range of pairs than Phase 7C's 10. The distinction between positional midpoints and categorical labels (Section 2, murmur-scream analysis) adds specificity: R7 applies to within-dimension positional bridges, not to superordinate labels.

### Which Observations Are Extended

**O17 (gradient > causal-chain bridges)** replicates with a larger sample and excludes zero on the CI. This is now the strongest specific quantitative finding about bridge type effects in the benchmark. O17 is a candidate for promotion to [robust] after one more independent replication.

**O18 (cross-model distance metrics fail)** is extended by O19 to show that the failure is irreducible by simple normalization. The distance disagreement is not a calibration problem but a structural incompatibility.

### Which Hypotheses Are Resolved

**H8 (bridge fragility is bimodal / route exclusivity predicts survival):** The bimodal pattern survives -- bridges are either robust or collapsed. But the proposed mechanism (route exclusivity, measured by competitor count) fails. H8's descriptive component (bimodality) remains [observed]; its mechanistic component (competitor count correlation) is falsified and moves to the graveyard (G20).

**H1 (frame-crossing for Gemini):** Phase 8B provides a more specific characterization. Gemini's deficit is not gradient blindness but transformation-chain failure. H1 is not falsified -- frame-crossing remains the broad umbrella -- but the specific gradient-blindness instantiation is falsified (G21), and the new H10 refines H1 by specifying that Gemini fails on transformation intermediaries and polysemous frame crossings while succeeding on continuous-dimension gradients. H1 remains [hypothesis] with H10 as its most specific, testable sub-hypothesis.

### New Observations from Phase 8

**O19. Gait normalization produces zero improvement on cross-model distance correlation.** [observed] -- Raw r = 0.212, normalized r = 0.212, improvement = 0.000 on all six model pairs. The gait difference is structural (ordinal-level disagreement), not scalar (simple scale factor). Model-independent geometry cannot be rescued through normalization.

**O20. Prediction accuracy reaches minimum on single-variable mechanistic hypotheses.** [observed] -- Phase 8 hits 24% overall (6/25). The pattern: replication predictions ~80%, structural predictions ~50%, mechanistic predictions ~15%. The benchmark maps coarse geometry but cannot predict fine-grained mechanisms with single-variable models.

### New Hypotheses from Phase 8

**H9. Bridge survival is predicted by dominance ratio, not competitor count.** [hypothesis] -- Sadness survives despite 8 competitors because its unconstrained frequency dominates the landscape. Harmony collapses with 7 competitors because it shares frequency with alternatives. The controlling variable is the ratio of bridge frequency to the strongest alternative's frequency. Untested: requires per-pair measurement of the second-strongest competitor's frequency.

**H10. Gemini's deficit is specifically transformation-chain blindness within the broader frame-crossing pattern.** [hypothesis] -- Gemini fails specifically on material/biological transformation intermediaries (cocoon, pottery, metal, flower, tree, dough) while succeeding on continuous-dimension midpoints (warm, walk, lake, rock, rain). H10 refines H1 (frame-crossing) by specifying the *type* of frame boundary Gemini cannot cross: it handles continuous within-frame gradients but cannot route through discrete transformation states. The broad frame-crossing characterization (H1) remains valid as an umbrella; H10 adds mechanistic specificity about which types of frame transitions fail.

**H11. Pre-filling can facilitate marginal bridges when semantically aligned.** [hypothesis] -- science-art "creativity" and student-professor "research" show survival rates >1.0 (pre-fill frequency exceeds unconstrained frequency). For bridges with low unconstrained dominance, congruent pre-fills may prime rather than displace. This would create a crossover interaction: pre-filling displaces dominant bridges and facilitates marginal ones.

---

## 7. The Graveyard, Updated

Phase 8 adds three new entries:

**G20. Route exclusivity (competitor count) predicts bridge fragility.** Predicted that bridges with more alternative waypoints would show lower pre-fill survival, with Spearman rho < -0.70. Observed: rho = 0.116 (retrospective), -0.121 (combined), neither significant. The critical anomaly: sadness has 8 competitors yet survives at 0.807 (highest), while harmony has 7 competitors and collapses to 0.015. Competitor count is not the controlling variable; dominance ratio may be (H9). Killed by Phase 8A.

**G21. Gemini gradient blindness.** Predicted that Gemini shows a selective deficit on gradient-midpoint bridges relative to causal-chain bridges, with interaction CI excluding zero and Gemini gradient zeros >= 5/10. Observed: interaction = 0.046 (CI includes zero), Gemini gradient zeros = 1/10, Gemini causal zeros = 6/10. The result is backward -- Gemini's zeros concentrate on causal-chain pairs, not gradient pairs. Gemini's proportional gradient advantage (0.227 gap) is actually the largest of any model. Killed by Phase 8B.

**G22. Gait normalization rescues cross-model distance metrics.** Predicted that dividing raw Jaccard distances by model-specific baselines would raise cross-model correlation from r ~0.17 to r > 0.50. Observed: normalization produces exactly zero improvement (r = 0.212 before and after). The mathematical reason: dividing both variables by constants does not change their Pearson correlation. The substantive reason: the disagreement is ordinal (models rank pairs differently), not scalar (models use different scales). Killed by Phase 8C.

The cumulative graveyard now contains 22 entries (G1-G22), averaging 2.75 per phase. The rate has held approximately constant since Phase 5, suggesting that each phase generates and tests roughly the same number of mechanistic hypotheses, and roughly the same fraction (~2-3) fail. This consistency is a property of the experimental design: each phase proposes specific, testable mechanisms, and the data has no obligation to confirm them.

---

## 8. Methodological Reflections

### The Single-Variable Trap

Phase 8's overarching methodological lesson is that single-variable explanations of complex navigational phenomena fail. Competitor count does not predict bridge fragility. Gradient-vs-causal type does not predict Gemini-specific failure. Scale normalization does not rescue cross-model distances. In each case, the single-variable model captured a real signal (competitors exist, Gemini is impaired, gaits differ in scale) but missed the higher-order structure (dominance ratios, transformation-chain specificity, ordinal disagreement).

This is not a unique failing of this benchmark. It is the standard arc of empirical research: initial observations suggest simple models, initial experiments test and falsify those models, and the field moves toward multi-variable accounts that are harder to test but closer to the truth. Phase 8 is the benchmark's transition point from simple to complex models.

### The Evaluability Problem in 8A

The prospective arm of 8A was designed to test the route exclusivity model on new pairs, but 6 of 8 pairs failed the evaluability gate because their proposed bridges had near-zero unconstrained frequency. This is a design failure, not a data failure -- we selected bridges (reasoning, landscape, creativity, etc.) that seemed intuitively reasonable but turned out not to be bridges at all. The evaluability gate (unconstrained frequency >= 0.40) correctly identified the problem, but the fact that only 2 of 8 prospective pairs passed the gate reveals how unreliable our bridge predictions remain.

The lesson connects to Phase 5's germination surprise: intuitive bridge prediction is unreliable. Seven phases later, we still cannot predict which concepts will function as bridges for novel pairs. This is not a failure of the benchmark -- it is one of its most important findings. Bridge topology is an empirical discovery, not a theoretical prediction, and any future experiment that relies on a priori bridge identification for new pairs should include a pilot phase to verify evaluability.

### The Normalization Lesson

Phase 8C's normalization result is mathematically trivial (dividing by a constant does not change correlation) but scientifically important. The triviality reveals that we were asking the wrong question. We asked: "Can we rescale model distances to a common frame?" The correct question is: "Do models agree on which pairs are close and which are far?" The Spearman rank correlation of 0.287 directly answers this question, and the answer is: mostly not, and Gemini actively disagrees with Grok and GPT.

The next step cannot be more normalization. It must be either (a) abandoning cross-model distance comparison entirely, or (b) switching to a different measurement modality (embedding distances, activation patterns, or structured probes) that might produce model-comparable distances. Path-based Jaccard distances are inherently contaminated by navigational gait, and no post-hoc correction can separate gait from topology when the measurement instrument *is* the gait.

### Sample Size Considerations

Phase 8A's retrospective analysis has only 6 pairs, making the Spearman correlation essentially powerless (CI [-0.866, 1.000]). The combined analysis has 8 evaluable pairs, still underpowered. A genuine test of the route exclusivity model would require 20+ pairs with both salience data and pre-fill survival data, which is approximately 3x the current sample.

Phase 8B has adequate power for the primary tests (20 pairs, 4 models, 80 observations). The O17 replication CI [0.010, 0.360] barely excludes zero, suggesting the effect is real but modest. The Gemini interaction CI [-0.339, 0.450] is wide enough that a moderate interaction could exist but be undetectable at this sample size.

Phase 8C's 8 test pairs produce wide confidence intervals on the aggregate correlation ([-0.167, 0.705]). The aggregate r = 0.212 is consistent with anything from slight negative to substantial positive correlation. The zero-improvement result is unambiguous because it is mathematically determined, but the underlying correlation estimate has limited precision.

---

## 9. Theoretical Integration: What Phase 8 Changes

### The Bridge Fragility Model, Revised

Phase 7A established that bridge fragility is real: pre-filling displaces bridges causally, and the displacement is bimodal (some bridges survive, others collapse). Phase 8A was supposed to identify the mechanism. It did not -- but it narrowed the search space.

What we now know about bridge fragility:
1. It exists and is bimodal (Phase 7A, confirmed)
2. It is NOT predicted by competitor count (Phase 8A, G20)
3. It is NOT predicted by bridge type (gradient vs causal -- both types show both survival and collapse)
4. It MAY be predicted by dominance ratio (H9, untested)
5. It shows a step-function pattern at k=5 competitors with 0.875 accuracy (Phase 8A, suggestive)
6. Pre-filling can INCREASE bridge frequency for marginal bridges (Phase 8A, H11)

The bridge fragility mechanism is the most important open question for Phase 9. It is the only Phase 7 finding that Phase 8 was supposed to explain but could not.

### The Gemini Model, Revised

The cumulative picture of Gemini's deficit is now:
- Phase 4: fails on polysemous frame crossings (bank-river, forest-ecosystem)
- Phase 5: threshold model fails; frames, not sensitivity, are the issue
- Phase 6A: routes bank-ocean through financial frame (vault-treasure-gold)
- Phase 7C: fails on univocal within-frame bridges (tree, dough, speak, noon)
- Phase 8B: fails on causal-chain transformation bridges (6/10), succeeds on gradient midpoints (9/10)

The most parsimonious account: Gemini successfully represents *positions along continuous dimensions* (temperature, size, speed, age, intensity) but fails to represent *intermediate states in transformation processes* (smelting, metamorphosis, baking, growth). This is a more specific and more testable characterization than "frame-crossing failure," and it makes specific predictions about which new pairs Gemini will fail on.

### The Geometry Program, Revised

The curvature and cross-model geometry research program that began in Phase 5 and was first empirically tested in Phase 7B is now effectively terminated in its current form:
- Phase 7B: cross-model distance r = 0.170
- Phase 7B: polysemous curvature not significantly different from non-polysemous (G16)
- Phase 8C: normalization produces zero improvement (G22)
- Phase 8C: some model pairs anti-correlate (Grok-Gemini r = -0.580)

The path-based Jaccard approach to geometry has reached its limits. The approach successfully established qualitative structural properties (triangle inequality at ~91%, quasimetric asymmetry at ~0.81, heavy-tailed salience landscapes) that are stable across models and phases. But it cannot produce quantitative geometric measurements (distances, curvature, geodesics) that are comparable across models, because the measurement instrument (navigational gait) is inseparable from the measured quantity (conceptual distance).

This is not a failure of the benchmark. It is a genuine discovery: **the navigational topology of conceptual space is model-specific at the quantitative level, even though qualitative structural properties are shared.** All four models navigate quasimetrically with triangle inequality compliance and heavy-tailed bridge distributions. But the specific metric geometry -- which pairs are close, which are far, how curved the space is -- differs between models in ways that cannot be unified through normalization.

---

## 10. Open Questions for Phase 9

Ranked by expected information gain, accounting for Phase 8's revisions.

### 10a. Bridge Dominance Ratio (Highest Priority)

Phase 8A's route exclusivity failure points to dominance ratio as the likely predictor of bridge fragility. Design: for 10-15 pairs with known bridges and salience data, compute (a) bridge unconstrained frequency, (b) strongest competitor frequency, (c) dominance ratio = bridge freq / competitor freq. Correlate with pre-fill survival. This is the direct test of H9.

**Expected yield:** The mechanism behind bimodal bridge fragility. If dominance ratio predicts survival (predicted r > 0.60), we have the first quantitative predictor of bridge robustness under perturbation -- a genuine advance over Phase 7A's descriptive bimodality.

### 10b. Gemini Transformation-Chain Test (High Priority)

Phase 8B revealed that Gemini fails specifically on material/biological transformation intermediaries. Design: 10 transformation pairs (raw material to processed product) and 10 matched gradient pairs (dimension extremes), tested on all four models. Primary test: Gemini shows interaction (smaller transformation-gradient gap than non-Gemini models, CI excludes zero). This directly tests H10.

**Expected yield:** A precise characterization of Gemini's navigational deficit. If confirmed, transformation-chain blindness would be the most specific architectural characterization of any model's navigational topology in the benchmark.

### 10c. Pre-Fill Facilitation Effect (Medium-High Priority)

Phase 8A's inverted survival rates (science-art "creativity" at 5.200, student-professor "research" at 2.429) suggest that pre-filling can facilitate marginal bridges. Design: for 8-10 pairs, select bridges at varying unconstrained frequencies (0.10-1.00) and apply congruent vs incongruent vs neutral pre-fills. Test for crossover interaction: does pre-filling displace high-frequency bridges and facilitate low-frequency ones? This directly tests H11.

**Expected yield:** A unified model of pre-fill effects that reconciles Phase 7A's displacement finding with Phase 8A's facilitation anomaly. If the crossover exists, it would transform the pre-fill paradigm from a displacement test to a modulation test with richer interpretive power.

### 10d. Embedding-Based Distance (Medium Priority)

The path-based distance program is stalled (O18, O19, G17, G22). An alternative: compute conceptual distances using the models' token embeddings or hidden-state representations rather than their generated paths. If embedding distances correlate across models (r > 0.50) even when navigational distances do not, this would demonstrate that the distance disagreement is a property of the generation process, not of the underlying representations.

**Expected yield:** Either a model-comparable distance metric or a definitive demonstration that representational distances also diverge, which would close the door on cross-model geometry entirely.

### 10e. Temporal Stability (Medium Priority)

Phase 8B's replication data (9/12 Phase 7C combinations replicate, all three failures show Phase 8B higher) provides a first data point on temporal stability. A systematic replication of Phase 1 pairs would test whether gait characterization (R1) has drifted over the multi-phase collection period.

**Expected yield:** A temporal robustness estimate for all prior findings. If gaits have shifted, it calibrates the shelf-life of the benchmark's observations and determines which claims need re-measurement before publication.

### 10f. Paper Preparation (Parallel Track)

Eight phases of data now support a narrative arc with four acts: (1) structure -- Phases 1-3 establish that navigation is quasimetric, compositional, and model-specific; (2) topology -- Phases 4-5 show bridges are bottlenecks shaped by navigational salience; (3) mechanism -- Phases 6-7 discover early anchoring via associative primacy and the causal displacement paradigm; (4) limits -- Phase 8 demonstrates that single-variable mechanistic models fail and that cross-model geometry is irreducible. The core contribution is methodological: a behavioral probe that maps conceptual topology through navigational paths, with the prediction failures at each phase being as informative as the successes. The germination surprise, the forced-crossing asymmetry null, the directional-heading falsification, the distance metric crisis, and now the triple negative of Phase 8 -- each failure converts an assumption into a discovery.

The robust claims (R1-R7), 20 observed findings (O1-O20), and 22 graveyard entries (G1-G22) constitute a comprehensive empirical characterization of LLM conceptual topology. The paper-ready findings are: model gaits are persistent and multi-dimensional (R1); navigational space is quasimetric with ~91% triangle inequality compliance (R2); bridges are salience-determined bottlenecks (R6) that anchor early via associative primacy (O12, O15); gradient midpoints outperform transformation intermediaries (O17); and cross-model geometry fails at the metric level while succeeding at the structural level (O18, O19).

---

## 11. Summary of Key Findings

1. **The route exclusivity hypothesis fails.** Competitor count does not predict bridge survival under pre-fill (Spearman rho = 0.116 retrospective, -0.121 combined, neither significant). The critical anomaly: sadness survives at 0.807 with 8 competitors while harmony collapses to 0.015 with 7. The controlling variable is likely dominance ratio, not competitor count. **Graveyard: G20.**

2. **Prospective bridge prediction remains unreliable.** Six of eight new pairs fail the evaluability gate (unconstrained bridge frequency < 0.40). Our a priori ability to predict which concepts will function as bridges for novel pairs has not improved in eight phases. Bridge topology is an empirical discovery, not a theoretical prediction.

3. **Pre-filling can facilitate marginal bridges.** Science-art "creativity" shows survival 5.200 and student-professor "research" shows 2.429 -- pre-fill frequency exceeds unconstrained frequency. For bridges with low baseline dominance, pre-filling may prime rather than displace. **[hypothesis]** (H11.)

4. **The Gemini gradient-blindness hypothesis fails backward.** The Gemini interaction is 0.046 (CI [-0.339, 0.450]), not significant. Gemini's zeros concentrate on causal-chain pairs (6/10), not gradient pairs (1/10) -- the opposite of predicted. Gemini's proportional gradient advantage (0.227) is the largest of any model. **Graveyard: G21.**

5. **O17 replicates: gradient midpoints outperform causal-chain bridges.** Gradient mean 0.770 vs causal mean 0.578, difference 0.193 (CI [0.010, 0.360]), excludes zero. This holds for all four models with remarkably consistent gap sizes (0.167-0.227). **[observed]**, approaching [robust].

6. **Gemini's deficit is transformation-chain blindness.** Gemini fails on material/biological transformation intermediaries (cocoon, pottery, metal, flower, tree, dough) while succeeding on continuous-dimension midpoints (warm, walk, lake, rock, rain). This is more specific than frame-crossing failure (H1) and makes testable predictions about new pairs. **[hypothesis]** (H10.)

7. **Murmur-scream "speech" fails for non-Gemini models.** Claude (0.000) and Grok (0.000) fail on this gradient pair, the first systematic non-Gemini failure on a gradient-midpoint bridge. The explanation: "speech" is a categorical label (hypernym), not a positional midpoint. This refines O17: the gradient advantage applies to positional midpoints, not dimensional labels.

8. **Gait normalization produces exactly zero improvement.** Raw r = 0.212, normalized r = 0.212, improvement = 0.000 on all six model pairs. The mathematical reason is trivial (dividing by constants preserves correlation); the scientific reason is profound (the disagreement is ordinal, not scalar). **Graveyard: G22.** **[observed]** (O19.)

9. **Some model pairs actively anti-correlate on distance.** Grok-Gemini r = -0.580, GPT-Gemini r = -0.210. When one model says "close," the other says "far." The {Claude, GPT, Grok} cluster agrees loosely (r = 0.38-0.73); Gemini diverges. Model-independent geometry is blocked by structural disagreement, not mere noise.

10. **Model baselines replicate.** Claude 0.372 (compact), GPT 0.692 (expansive), Grok 0.619, Gemini 0.539. The Phase 1 gait characterization (R1) continues to hold across every measurement modality.

11. **Step-function fragility is suggestive.** A threshold at k=5 competitors classifies bridge survival with 0.875 accuracy, better than linear models. Bridge fragility may be binary (survive/collapse) with a sharp threshold, consistent with Phase 7A's bimodal observation (H8). But the sample is small (8 pairs) and the threshold is not at the predicted k=3-4.

12. **Prediction accuracy hits 24%, the benchmark's lowest.** Phase 8 confirms 6 of 25 predictions. Replication predictions succeed at ~80%; novel mechanistic predictions at ~0%. Single-variable causal models are inadequate for the complexity of navigational phenomena. **[observed]** (O20.)
