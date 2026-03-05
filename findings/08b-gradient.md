# Phase 8B: Gemini Gradient Blindness Findings

> Generated: 2026-03-05T03:58:12.809Z

## 1. Experiment Overview

- **Total pairs analyzed:** 20
  - Gradient-midpoint pairs: 10
  - Causal-chain pairs: 10
- **Models:** claude, gpt, grok, gemini
- **New runs:** 1230
- **Reused runs:** 120
- **Bridge frequency observations:** 80

## 2. Bridge Frequency Matrix (20 Pairs x 4 Models)

| Pair | Type | Bridge | claude | gpt | grok | gemini |
|------|------|--------|---|---|---|---|
| p8b-grad-whisper-shout | grad | speak | 1.000 | 0.867 | 0.867 | 0.133 |
| p8b-grad-hot-cold | grad | warm | 1.000 | 1.000 | 1.000 | 0.667 |
| p8b-grad-dawn-dusk | grad | noon | 1.000 | 0.733 | 0.933 | 0.000 * |
| p8b-grad-infant-elderly | grad | adolescent | 1.000 | 1.000 | 0.667 | 0.600 |
| p8b-grad-crawl-sprint | grad | walk | 1.000 | 1.000 | 1.000 | 1.000 |
| p8b-grad-pond-ocean | grad | lake | 1.000 | 0.933 | 1.000 | 1.000 |
| p8b-grad-pebble-boulder | grad | rock | 1.000 | 1.000 | 1.000 | 1.000 |
| p8b-grad-drizzle-downpour | grad | rain | 1.000 | 1.000 | 0.867 | 0.333 |
| p8b-grad-village-metropolis | grad | city | 1.000 | 1.000 | 0.733 | 0.200 |
| p8b-grad-murmur-scream | grad | speech | 0.000 * | 0.200 | 0.000 * | 0.067 |
| p8b-causal-grape-wine | causal | fermentation | 1.000 | 1.000 | 0.933 | 1.000 |
| p8b-causal-ore-jewelry | causal | metal | 1.000 | 0.467 | 0.000 * | 0.000 * |
| p8b-causal-caterpillar-butterfly | causal | cocoon | 0.000 * | 0.333 | 0.867 | 0.000 * |
| p8b-causal-clay-vase | causal | pottery | 0.067 | 0.267 | 0.067 | 0.000 * |
| p8b-causal-wool-sweater | causal | yarn | 1.000 | 1.000 | 1.000 | 0.467 |
| p8b-causal-milk-cheese | causal | curd | 0.333 | 0.800 | 1.000 | 1.000 |
| p8b-causal-seed-fruit | causal | flower | 0.933 | 0.000 * | 0.467 | 0.000 * |
| p8b-causal-sand-glass | causal | heat | 1.000 | 0.867 | 0.000 * | 0.267 |
| p8b-causal-acorn-timber | causal | tree | 1.000 | 1.000 | 1.000 | 0.000 * |
| p8b-causal-flour-bread | causal | dough | 1.000 | 1.000 | 0.967 | 0.000 * |

_* indicates zero bridge frequency_

## 3. Gradient vs Causal-Chain Comparison (Replication of O17)

- **Gradient mean bridge freq:** 0.7700 [0.6483, 0.8767]
- **Causal-chain mean bridge freq:** 0.5775 [0.4317, 0.7083]
- **Difference (gradient - causal):** 0.1925 [0.0100, 0.3600]
- **Gradient higher:** **YES**

**[observed]** Gradient-midpoint bridges are found at significantly higher frequency than causal-chain bridges, replicating the O17 observation that continuous-spectrum midpoints are more navigational than process intermediaries.

## 4. Gemini Interaction Test (PRIMARY TEST)

- **Gemini gradient mean:** 0.5000
- **Gemini causal mean:** 0.2733
- **Gemini gap (gradient - causal):** 0.2267
- **Non-Gemini gradient mean:** 0.8600
- **Non-Gemini causal mean:** 0.6789
- **Non-Gemini gap (gradient - causal):** 0.1811
- **Interaction (Gemini gap - non-Gemini gap):** 0.0456 [-0.3389, 0.4500]
- **Significant interaction (CI excludes zero):** **NO**

The interaction effect is not statistically significant. Gemini does not show a selective gradient-midpoint deficit relative to other models.

## 5. Per-Model Gradient Performance

| Model | Gradient Mean | Causal Mean | Gap (grad - causal) |
|-------|--------------|-------------|---------------------|
| claude | 0.9000 | 0.7333 | 0.1667 |
| gpt | 0.8733 | 0.6733 | 0.2000 |
| grok | 0.8067 | 0.6300 | 0.1767 |
| gemini | 0.5000 | 0.2733 | 0.2267 |

## 6. Gemini Zero-Rate Analysis

- **Gemini gradient zeros:** 1 / 10
- **Gemini causal zeros:** 6 / 10
- **Non-Gemini gradient zeros:** 2
- **Non-Gemini causal zeros:** 4


## 7. Phase 7C Replication Check

| Pair | Model | Phase 7C Freq | Phase 8B Freq | Difference | Replicates? |
|------|-------|--------------|--------------|------------|-------------|
| p8b-grad-whisper-shout | claude | 1.000 | 1.000 | 0.000 | YES |
| p8b-grad-whisper-shout | gpt | 0.700 | 0.867 | 0.167 | NO |
| p8b-grad-whisper-shout | grok | 1.000 | 0.867 | 0.133 | YES |
| p8b-grad-whisper-shout | gemini | 0.000 | 0.133 | 0.133 | YES |
| p8b-grad-hot-cold | claude | -- | 1.000 | -- | -- |
| p8b-grad-hot-cold | gpt | -- | 1.000 | -- | -- |
| p8b-grad-hot-cold | grok | -- | 1.000 | -- | -- |
| p8b-grad-hot-cold | gemini | -- | 0.667 | -- | -- |
| p8b-grad-dawn-dusk | claude | 1.000 | 1.000 | 0.000 | YES |
| p8b-grad-dawn-dusk | gpt | 0.400 | 0.733 | 0.333 | NO |
| p8b-grad-dawn-dusk | grok | 0.900 | 0.933 | 0.033 | YES |
| p8b-grad-dawn-dusk | gemini | 0.000 | 0.000 | 0.000 | YES |
| p8b-grad-infant-elderly | claude | 1.000 | 1.000 | 0.000 | YES |
| p8b-grad-infant-elderly | gpt | 1.000 | 1.000 | 0.000 | YES |
| p8b-grad-infant-elderly | grok | 0.500 | 0.667 | 0.167 | NO |
| p8b-grad-infant-elderly | gemini | 0.600 | 0.600 | 0.000 | YES |

## 8. Gemini Alternative Routing on Zero-Frequency Gradient Pairs

### p8b-grad-dawn-dusk
- **Routing type:** mixed
- **Top waypoints:**
  - meridian (0.933)
  - zenith (0.933)
  - golden hour (0.867)
  - afternoon (0.733)
  - twilight (0.733)


## 9. Predictions Summary

| # | Prediction | Result | Value |
|---|------------|--------|-------|
| 1 | Gradient > causal-chain by at least 0.15, CI excludes zero | confirmed | diff=0.193 [0.010, 0.360] |
| 2 | Gemini gradient mean < 0.25 | not confirmed | gemini_gradient_mean=0.500 |
| 3 | Gemini causal mean > 0.40 | not confirmed | gemini_causal_mean=0.273 |
| 4 | Gemini gap >= 0.20 more negative than non-Gemini gap, interaction CI excludes zero | not confirmed | interaction=0.046 [-0.339, 0.450] |
| 5 | Gemini 0.000 on at least 5 of 10 gradient pairs | not confirmed | 1/10 zeros |
| 6 | Gemini 0.000 on at most 2 of 10 causal pairs | not confirmed | 6/10 zeros |
| 7 | Non-Gemini gradient mean > 0.60, causal > 0.50, gap < 0.15 | not confirmed | grad=0.860, causal=0.679, gap=0.181 |
| 8 | Phase 7C replication: frequencies within 0.15 for all models on 4 pairs | not confirmed | 9/12 replicate |
| 9 | Gemini alternative routing uses related-non-midpoint concepts on zero-freq pairs | confirmed | related=0, mixed=1, unrelated=0 of 1 |
