# Phase 9B: Gemini Transformation-Chain Blindness Findings

> Generated: 2026-03-05T15:26:58.164Z

## 1. Experiment Overview

- **Total pairs analyzed:** 20
  - Transformation-chain pairs: 10
  - Gradient-midpoint pairs: 10
- **Models:** claude, gpt, grok, gemini
- **New runs:** 1197
- **Reused runs:** 1230
- **Bridge frequency observations:** 80

## 2. Bridge Frequency Matrix (20 Pairs x 4 Models)

| Pair | Type | Bridge | claude | gpt | grok | gemini |
|------|------|--------|---|---|---|---|
| p9b-trans-sugarcane-rum | trans | molasses | 0.000 * | 0.000 * | 0.000 * | 0.000 * |
| p9b-trans-hide-shoe | trans | leather | 1.000 | 1.000 | 0.769 | 1.000 |
| p9b-trans-cotton-shirt | trans | fabric | 1.000 | 0.800 | 1.000 | 1.000 |
| p9b-trans-tadpole-frog | trans | legs | 0.000 * | 0.067 | 0.000 * | 0.000 * |
| p9b-trans-milk-yogurt | trans | culture | 0.600 | 1.000 | 0.267 | 0.200 |
| p9b-trans-iron-bridge | trans | steel | 1.000 | 1.000 | 1.000 | 0.867 |
| p9b-trans-egg-chick | trans | embryo | 1.000 | 0.467 | 1.000 | 0.933 |
| p9b-trans-log-paper | trans | pulp | 1.000 | 1.000 | 1.000 | 1.000 |
| p9b-trans-olive-soap | trans | oil | 1.000 | 1.000 | 0.667 | 1.000 |
| p9b-trans-wheat-pasta | trans | flour | 1.000 | 0.667 | 1.000 | 0.667 |
| p9b-grad-freezing-boiling | grad | warm | 1.000 | 0.333 | 1.000 | 0.000 * |
| p9b-grad-crawling-running | grad | walking | 0.000 * | 0.733 | 0.000 * | 0.000 * |
| p9b-grad-hamlet-capital | grad | town | 1.000 | 1.000 | 1.000 | 1.000 |
| p9b-grad-puddle-sea | grad | pond | 1.000 | 1.000 | 1.000 | 1.000 |
| p9b-grad-whispering-screaming | grad | speaking | 0.000 * | 0.000 * | 0.133 | 0.000 * |
| p9b-grad-amateur-master | grad | journeyman | 1.000 | 0.667 | 0.133 | 0.000 * |
| p9b-grad-twilight-noon | grad | morning | 1.000 | 1.000 | 1.000 | 0.400 |
| p9b-grad-seedling-tree | grad | sapling | 0.000 * | 0.000 * | 0.000 * | 0.000 * |
| p9b-grad-mild-blazing | grad | hot | 0.067 | 1.000 | 0.733 | 0.067 |
| p9b-grad-stroll-sprint | grad | jog | 1.000 | 1.000 | 1.000 | 0.467 |

_* indicates zero bridge frequency_

## 3. Gradient vs Transformation Comparison (O17 Third Replication)

- **Gradient mean bridge freq:** 0.5433 [0.4083, 0.6867]
- **Transformation mean bridge freq:** 0.6992 [0.5759, 0.8187]
- **Difference (gradient - transformation):** -0.1559 [-0.3385, 0.0323]
- **Gradient higher:** **NO**

The gradient vs transformation difference is not significant or gradient is not higher.

## 4. Gemini Interaction Test (PRIMARY TEST)

- **Gemini gradient mean:** 0.2933
- **Gemini transformation mean:** 0.6667
- **Gemini gap (gradient - transformation):** -0.3733
- **Non-Gemini gradient mean:** 0.6267
- **Non-Gemini transformation mean:** 0.7101
- **Non-Gemini gap (gradient - transformation):** -0.0834
- **Interaction (Gemini gap - non-Gemini gap):** -0.2899 [-0.7000, 0.1101]
- **Significant interaction (CI excludes zero):** **NO**

The interaction effect is not statistically significant. Gemini does not show a selective transformation-chain deficit relative to other models.

## 5. Gemini Zero-Rate Analysis

- **Gemini transformation zeros:** 2 / 10
- **Gemini gradient zeros:** 5 / 10
- **Non-Gemini transformation zeros:** 5
- **Non-Gemini gradient zeros:** 7


## 6. Transformation-Type Analysis

| Process Type | Pairs | Gemini Mean | Gemini Zeros | Non-Gemini Mean |
|-------------|-------|-------------|--------------|-----------------|
| biological | p9b-trans-tadpole-frog, p9b-trans-egg-chick | 0.467 | 1 | 0.422 |
| food | p9b-trans-sugarcane-rum, p9b-trans-milk-yogurt, p9b-trans-wheat-pasta, p9b-trans-olive-soap | 0.467 | 1 | 0.600 |
| leatherworking | p9b-trans-hide-shoe | 1.000 | 0 | 0.923 |
| manufacturing | p9b-trans-iron-bridge, p9b-trans-log-paper, p9b-trans-cotton-shirt | 0.956 | 0 | 0.978 |

Gemini zeros span 2 of 4 process sub-types.

## 7. Meta-Analytic Combination with Phase 8B

- **Phase 9B interaction:** -0.2899 [-0.7000, 0.1101]
- **Phase 8B interaction:** 0.0456 [-0.3333, 0.4344]
- **Pooled interaction (inverse-variance):** -0.1132 [-0.3918, 0.1654]
- **Pooled significant (CI excludes zero):** **NO**

The pooled meta-analytic interaction does not reach significance.

## 8. Per-Model Performance

| Model | Gradient Mean | Transformation Mean | Gap (grad - trans) |
|-------|--------------|--------------------|--------------------|
| claude | 0.6067 | 0.7600 | -0.1533 |
| gpt | 0.6733 | 0.7000 | -0.0267 |
| grok | 0.6000 | 0.6703 | -0.0703 |
| gemini | 0.2933 | 0.6667 | -0.3733 |

## 9. Non-Gemini Zero Analysis

| Model | Transformation Zeros | Gradient Zeros |
|-------|---------------------|----------------|
| claude | 2 | 3 |
| gpt | 1 | 2 |
| grok | 2 | 2 |

## 10. Gemini Alternative Routing on Zero-Frequency Transformation Pairs

### p9b-trans-sugarcane-rum
- **Routing type:** process-label
- **Top waypoints:**
  - distillation (1.000)
  - fermentation (1.000)
  - molass (1.000)

### p9b-trans-tadpole-frog
- **Routing type:** process-label
- **Top waypoints:**
  - hind limb bud (1.000)
  - tail resorption (0.933)
  - lung development (0.733)


## 11. Predictions Summary

| # | Prediction | Result | Value |
|---|------------|--------|-------|
| 1 | Gradient > transformation by at least 0.15, CI excludes zero | not confirmed | diff=-0.156 [-0.338, 0.032] |
| 2 | Gemini transformation mean < 0.30 | not confirmed | gemini_transformation_mean=0.667 |
| 3 | Gemini gradient mean > 0.45 | not confirmed | gemini_gradient_mean=0.293 |
| 4 | Gemini gap >= 0.15 larger than non-Gemini gap, interaction CI excludes zero | not confirmed | interaction=-0.290 [-0.700, 0.110] |
| 5 | Gemini 0.000 on at least 5 of 10 transformation pairs | not confirmed | 2/10 zeros |
| 6 | Gemini 0.000 on at most 2 of 10 gradient pairs | not confirmed | 5/10 zeros |
| 7 | Non-Gemini gradient mean > 0.55, transformation > 0.40, gap < 0.20 | confirmed | grad=0.627, trans=0.710, gap=-0.083 |
| 8 | Meta-analytic combination CI excludes zero | not confirmed | pooled=-0.113 [-0.392, 0.165] |
| 9 | Gemini zeros span >= 3 of 4 process sub-types | not confirmed | 2/4 process types with zeros |
