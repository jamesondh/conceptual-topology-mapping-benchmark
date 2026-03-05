# Phase 9C: Pre-Fill Facilitation Analysis Findings

> Generated: 2026-03-05T18:05:57.278Z

## 1. Experiment Overview

- **Total pairs analyzed:** 14
- **Models:** claude, gpt, grok, gemini
- **Conditions:** unconstrained, congruent, incongruent, neutral
- **New runs:** 1600
- **Reused runs:** 1560

## 2. Pilot Pair Verification

| Pair | Bridge Freq | In Range (0.20-0.50) | Retained |
|------|------------|---------------------|----------|
| p9c-recipe-meal | 0.183 | NO | YES |
| p9c-problem-solution | 0.267 | YES | YES |
| p9c-sketch-painting | 0.300 | YES | YES |
| p9c-note-symphony | 0.900 | NO | YES |

## 3. Per-Pair Facilitation Results

### Unconstrained Bridge Frequency & Survival Rates

| Pair | Bridge | Dominance | Uncon. Freq | Cong. Surv. | Incong. Surv. | Neutral Surv. |
|------|--------|-----------|-------------|-------------|---------------|---------------|
| p9c-emotion-melancholy | sadness | dominant | 0.975 | 1.000 | -- | -- |
| p9c-light-color | spectrum | dominant | 0.994 | 0.755 | -- | -- |
| p9c-sun-desert | heat | dominant | 0.981 | 1.019 | -- | -- |
| p9c-animal-poodle | dog | dominant | 0.983 | 0.941 | -- | -- |
| p9c-bank-ocean | river | moderate | 0.719 | 1.391 | 0.070 | 0.313 |
| p9c-music-mathematics | harmony | moderate | 0.487 | 0.359 | 0.000 | 0.000 |
| p9c-seed-garden | germination | moderate | 0.744 | 0.101 | 0.034 | 0.370 |
| p9c-loan-shore | bank | moderate-high | 0.717 | 0.733 | 0.000 | 0.349 |
| p9c-science-art | creativity | marginal | 0.125 | 8.000 | 3.000 | 5.000 |
| p9c-student-professor | research | marginal | 0.175 | 4.000 | 2.143 | 2.286 |
| p9c-recipe-meal | cooking | pilot | 0.183 | 0.136 | 0.000 | 0.000 |
| p9c-problem-solution | analysis | pilot | 0.267 | 2.906 | 0.000 | 3.558 |
| p9c-sketch-painting | outline | pilot | 0.300 | 0.500 | 0.085 | 0.083 |
| p9c-note-symphony | melody | pilot | 0.900 | 0.583 | 0.417 | 1.056 |

## 4. Crossover Regression (PRIMARY TEST)

- **Slope:** -3.3554 [-6.7483, 0.7230]
- **Intercept:** 3.6509
- **R-squared:** 0.2886
- **Significant negative slope (CI excludes zero):** **NO**

The crossover regression does not show a significant negative slope. The crossover interaction between dominance and pre-fill facilitation is not confirmed.

## 5. Crossover Point Estimation

- **Unconstrained frequency at survival = 1.0:** 0.790 [0.228, 1.136]

The crossover point is the unconstrained bridge frequency at which pre-fill transitions from facilitation (survival > 1.0) to displacement (survival < 1.0).

## 6. Congruent vs Incongruent for Marginal Bridges

- **Marginal congruent mean survival:** 3.761
- **Marginal incongruent mean survival:** 1.286
- **Difference (congruent - incongruent):** 2.475 [-0.398, 5.643]
- **Significantly higher:** **NO**

## 7. Neutral Pre-Fill Baseline

- **Dominant neutral survival:** 0.000
- **Marginal neutral survival:** 3.643

## 8. Phase 7A Comparison (pairs 1-8)

| Pair | Phase 7A Survival | Phase 9C Survival | Difference | Replicates (within 0.15)? |
|------|-------------------|-------------------|------------|---------------------------|
| p9c-emotion-melancholy | 1.026 | 1.000 | 0.026 | YES |
| p9c-light-color | 0.750 | 0.755 | 0.005 | YES |
| p9c-sun-desert | 1.053 | 1.019 | 0.034 | YES |
| p9c-animal-poodle | 1.017 | 0.941 | 0.076 | YES |
| p9c-bank-ocean | 1.667 | 1.391 | 0.275 | NO |
| p9c-music-mathematics | 0.000 | 0.359 | 0.359 | NO |
| p9c-seed-garden | 0.000 | 0.101 | 0.101 | YES |
| p9c-loan-shore | 0.453 | 0.733 | 0.279 | NO |

## 9. Per-Model Facilitation

| Model | Marginal Facilitation Count (survival > 1.0) | Dominant Displacement Count (survival < 1.0) |
|-------|----------------------------------------------|----------------------------------------------|
| claude | 1 | 2 |
| gpt | 2 | 3 |
| grok | 2 | 5 |
| gemini | 0 | 2 |

## 10. Predictions Summary

| # | Prediction | Result | Value |
|---|------------|--------|-------|
| 1 | Regression slope negative, CI excludes zero (primary test of H11) | not confirmed | slope=-3.355 [-6.748, 0.723] |
| 2 | Dominant bridges (freq >0.60) show mean congruent survival < 0.80 | not confirmed | mean survival=0.815, n=8 |
| 3 | Marginal bridges (freq <0.30) show mean congruent survival >1.20 | confirmed | mean survival=3.761, n=4 |
| 4 | Marginal bridges show incongruent survival in 0.80-1.20 range | not confirmed | mean survival=1.286, n=4 |
| 5 | Crossover point at approx 0.40-0.50 | not confirmed | crossover=0.790 [0.228, 1.136] |
| 6 | Congruent > incongruent survival for marginal bridges, CI excludes zero | not confirmed | diff=2.475 [-0.398, 5.643] |
| 7 | Dominant bridges: congruent approx equal to incongruent (within 0.10) | not confirmed | cong=0.815, incong=0.130, diff=0.685 |
| 8 | Neutral pre-fills: displacement for dominant (<1.0), near-unity for marginal (0.80-1.20) | insufficient data | dominant=0.000, marginal=3.643 |
| 9 | Facilitation is model-general: >=3/4 models show survival >1.0 for >=1 marginal bridge | confirmed | 3/4 models show facilitation |
| 10 | Phase 7A survival within 0.15 of Phase 9C for pairs 1-8 | not confirmed | 5/8 replicate |
