# Phase 8A: Bridge Fragility Analysis Findings

> Generated: 2026-03-05T03:01:02.587Z

## 1. Experiment Overview

- **Pairs analyzed:** 14
- **Models:** claude, gpt, grok, gemini
- **New runs:** 960
- **Reused runs:** 1880

## 2. Retrospective Analysis (6 pairs from Phase 6A + 7A)

| Pair | Bridge | Competitor Count | Competitors | Pre-Fill Survival |
|------|--------|-----------------|-------------|-------------------|
| p7a-music-mathematics | harmony | 7 | frequency, geometry, interval, pattern, proportion, rhythm, symmetry | 0.015 |
| p7a-seed-garden | germination | 6 | bloom, cultivation, root, seedle, soil, sprout | 0.000 |
| p7a-bank-ocean | river | 5 | coast, delta, estuary, sea, tide | 0.778 |
| p7a-light-color | spectrum | 4 | hue, perception, refraction, wavelength | 0.645 |
| p7a-sun-desert | heat | 5 | aridity, drought, dune, mirage, sand | 0.691 |
| p7a-emotion-melancholy | sadness | 8 | affect, feel, long, mood, nostalgia, sentiment, sorrow, wistfulness | 0.807 |

- **Spearman rho:** 0.116 [-0.866, 1.000]
- **Significant negative:** **NO**

## 3. Prospective Analysis (8 new pairs)

| Pair | Bridge | Pred. Comp. | Obs. Comp. | Match | Uncon. Freq | Pre-Fill Freq | Survival | Evaluable |
|------|--------|-------------|------------|-------|-------------|---------------|----------|-----------|
| p8a-question-answer | reasoning | 0-1 | 10 | No | 0.000 | 0.000 | 0.000 | No |
| p8a-parent-child | birth | 0-1 | 6 | No | 0.212 | 0.075 | 0.353 | No |
| p8a-cause-effect | mechanism | 1-2 | 8 | No | 0.700 | 0.100 | 0.143 | Yes |
| p8a-winter-summer | spring | 3-4 | 6 | No | 0.375 | 0.175 | 0.467 | No |
| p8a-student-professor | research | 3-5 | 7 | No | 0.175 | 0.425 | 2.429 | No |
| p8a-science-art | creativity | 6-10 | 8 | Yes | 0.125 | 0.650 | 5.200 | No |
| p8a-ocean-mountain | landscape | 6-10 | 9 | Yes | 0.000 | 0.000 | 0.000 | No |
| p8a-brain-computer | algorithm | 8-12 | 7 | No | 0.588 | 0.250 | 0.426 | Yes |

- **Evaluable pairs:** 2 of 8

## 4. Combined Correlation (all evaluable pairs)

- **Spearman rho:** -0.121 [-0.795, 0.781]
- **N pairs:** 8
- **Significant negative:** **NO**

The combined Spearman correlation does not reach significance. The relationship 
between competitor count and bridge survival may be weaker than predicted.

## 5. Threshold Analysis (Step Function vs Linear)

- **Best threshold k:** 5
- **Classification accuracy:** 0.875
- **Step function better than linear:** **YES**

## 6. Per-Model Competitor Counts

| Model | Mean Competitor Count |
|-------|---------------------|
| claude | 7.14 |
| gpt | 7.21 |
| grok | 7.79 |
| gemini | 8.07 |

## 7. Leave-One-Out Cross-Validation

- **Mean prediction error:** 0.3159

| Pair | Predicted Survival | Actual Survival | Error |
|------|--------------------|-----------------|-------|
| p7a-music-mathematics | 0.445 | 0.015 | 0.430 |
| p7a-seed-garden | 0.527 | 0.000 | 0.527 |
| p7a-bank-ocean | 0.474 | 0.778 | 0.304 |
| p7a-light-color | 0.610 | 0.645 | 0.035 |
| p7a-sun-desert | 0.499 | 0.691 | 0.192 |
| p7a-emotion-melancholy | 0.047 | 0.807 | 0.761 |
| p8a-cause-effect | 0.363 | 0.143 | 0.220 |
| p8a-brain-computer | 0.366 | 0.426 | 0.060 |

## 8. Predictions Summary

| # | Prediction | Result | Value |
|---|------------|--------|-------|
| 1 | Retrospective rho < -0.70, CI excludes zero | not confirmed | rho=0.116 [-0.866, 1.000] |
| 2 | Prospective rho < -0.60 (combined 14 pairs), CI excludes zero | not confirmed | rho=-0.121 [-0.795, 0.781], n=8 |
| 3 | Low-competitor pairs (question-answer, parent-child, cause-effect) survival > 0.60 | not confirmed | mean survival=0.143, n=1 |
| 4 | High-competitor pairs (science-art, ocean-mountain, brain-computer) survival < 0.30 | not confirmed | mean survival=0.426, n=1 |
| 5 | Medium-competitor pairs (winter-summer, student-professor) survival 0.25-0.60 | insufficient data | mean survival=0.000, n=0 |
| 6 | Step-function threshold at k = 3-4 | not confirmed | best k=5, accuracy=0.875 |
| 7 | Predicted competitor counts correlate with observed at r > 0.60 | not confirmed | rho=0.037, n=8 |
| 8 | Claude produces fewest competitors per pair | confirmed | claude=7.14, others=[gpt:7.21, grok:7.79, gemini:8.07] |
