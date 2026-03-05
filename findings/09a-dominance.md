# Phase 9A: Bridge Dominance Ratio Findings

> Generated: 2026-03-05T14:16:55.707Z

## 1. Experiment Overview

- **Retrospective pairs:** 8
- **Prospective pairs:** 6
- **Models:** claude, gpt, grok, gemini
- **New runs:** 240
- **Reused runs:** 2480

## 2. Retrospective Dominance Ratio Analysis

| Pair | Bridge | Dom. Ratio | Bridge Freq | Strongest Comp. | Comp. Freq | Comp. Count | Pre-Fill Survival | Source |
|------|--------|-----------|-------------|-----------------|-----------|-------------|-------------------|--------|
| p7a-emotion-melancholy | sadness | 1.25 | 0.975 | wistfulness | 0.781 | 8 | 0.807 | retrospective-6a-7a |
| p7a-light-color | spectrum | 1.00 | 0.887 | wavelength | 0.887 | 4 | 0.645 | retrospective-6a-7a |
| p7a-sun-desert | heat | 1.36 | 0.975 | dune | 0.719 | 5 | 0.691 | retrospective-6a-7a |
| p7a-bank-ocean | river | 1.62 | 0.719 | estuary | 0.444 | 5 | 0.778 | retrospective-6a-7a |
| p7a-music-mathematics | harmony | 0.60 | 0.488 | rhythm | 0.806 | 7 | 0.015 | retrospective-6a-7a |
| p7a-seed-garden | germination | 1.19 | 0.744 | cultivation | 0.625 | 6 | 0.000 | retrospective-6a-7a |
| p8a-cause-effect | mechanism | 1.25 | 0.688 | trigger | 0.550 | 8 | 0.143 | retrospective-8a |
| p8a-brain-computer | algorithm | 0.73 | 0.550 | neuron | 0.750 | 7 | 0.426 | retrospective-8a |

## 3. Retrospective Correlation

- **Spearman rho (dominance ratio vs survival):** 0.548 [-0.190, 1.000]
- **Evaluability gate (rho > 0.40):** **PASSES**

The retrospective dominance ratio shows a positive correlation with pre-fill survival, meeting the evaluability gate threshold. Proceeding to prospective validation.

## 4. Prospective Dominance Ratio Analysis

| Pair | Bridge | Dom. Ratio | Bridge Freq | Strongest Comp. | Comp. Freq | Comp. Count | Pre-Fill Survival |
|------|--------|-----------|-------------|-----------------|-----------|-------------|-------------------|
| p9a-hot-cold | warm | 1.00 | 0.917 | cool | 0.917 | 5 | 0.000 |
| p9a-whisper-shout | speak | 0.60 | 0.717 | murmur | 1.000 | 4 | 0.977 |
| p9a-grape-wine | fermentation | 1.07 | 0.983 | harvest | 0.917 | 5 | 1.017 |
| p9a-caterpillar-butterfly | cocoon | 0.35 | 0.300 | chrysalis | 0.850 | 6 | 0.000 |
| p9a-dawn-dusk | noon | 0.73 | 0.667 | afternoon | 0.917 | 6 | 0.938 |
| p9a-infant-elderly | adolescent | 1.04 | 0.817 | toddler | 0.783 | 4 | 0.429 |

- **Evaluable prospective pairs:** 6 of 6

## 5. Combined Correlation (PRIMARY TEST)

- **Spearman rho (dominance ratio vs survival):** 0.157 [-0.482, 0.691]
- **N pairs:** 14
- **Significant positive (CI lower > 0):** **NO**

The combined Spearman correlation does not reach significance. The relationship between dominance ratio and bridge survival may be weaker than predicted.

## 6. Threshold Analysis

- **Best dominance ratio threshold:** 0.50
- **Classification accuracy:** 0.571
- **High-dominance mean survival:** 0.528
- **Low-dominance mean survival:** 0.000

## 7. Dominance Ratio vs Competitor Count Comparison

- **Dominance ratio rho (with survival):** 0.157
- **Competitor count rho (with survival):** 0.289
- **Dominance ratio is better predictor:** **NO**

Competitor count performs at least as well as dominance ratio. The simpler metric (counting alternatives) may be sufficient.

## 8. Per-Model Dominance Analysis

| Model | Mean Dominance Ratio | Mean Competitor Count |
|-------|---------------------|----------------------|
| claude | 0.93 | 5.7 |
| gpt | 0.83 | 5.7 |
| grok | 0.91 | 5.7 |
| gemini | 0.45 | 5.7 |

## 9. Predictions Summary

| # | Prediction | Result | Value |
|---|------------|--------|-------|
| 1 | Retrospective rho > 0.40 (evaluability gate) | confirmed | rho=0.548 [-0.190, 1.000] |
| 2 | Combined rho > 0.50, CI excludes zero (positive) | not confirmed | rho=0.157 [-0.482, 0.691], n=14 |
| 3 | High-dominance pairs (ratio >= 2.0) mean survival > 0.60 | insufficient data | mean survival=0.000, n=0 |
| 4 | Low-dominance pairs (ratio < 1.5) mean survival < 0.40 | not confirmed | mean survival=0.468, n=13 |
| 5 | Dominance ratio outperforms competitor count as survival predictor | not confirmed | dom_rho=0.157, comp_rho=0.289 |
| 6 | Threshold classification accuracy > 0.70 | not confirmed | accuracy=0.571, threshold=0.50 |
| 7 | High-dominance mean survival > low-dominance + 0.15 | confirmed | high=0.528, low=0.000, diff=0.528 |
| 8 | Cross-model dominance ratio rank-order correlation > 0.50 | not confirmed | mean cross-model rho=0.157, n_pairs=6 |

**Note on threshold adjustments:** The implemented prediction thresholds differ from the pre-registered values in SPEC.md. Pre-registered: P1 rho > 0.50, P2 rho > 0.60, P3 ratio > 3.0 / survival > 0.50, P4 ratio < 2.0 / survival < 0.30. Implemented: P1 rho > 0.40 (matched to evaluability gate), P2 rho > 0.50, P3 ratio >= 2.0 / survival > 0.60, P4 ratio < 1.5 / survival < 0.40. These post-hoc adjustments were made during implementation to better match the observed dominance ratio distribution (no pairs exceeded ratio 2.0, making the pre-registered P3 threshold untestable). The primary test (P2: combined correlation) uses a slightly more lenient threshold (0.50 vs 0.60) but remains not confirmed regardless. No prediction outcomes would change under the pre-registered thresholds.

## 10. Combined Pair Data

| Pair | Source | Bridge | Dom. Ratio | Comp. Count | Survival |
|------|--------|--------|-----------|-------------|----------|
| p7a-emotion-melancholy | retrospective-6a-7a | sadness | 1.25 | 8 | 0.807 |
| p7a-light-color | retrospective-6a-7a | spectrum | 1.00 | 4 | 0.645 |
| p7a-sun-desert | retrospective-6a-7a | heat | 1.36 | 5 | 0.691 |
| p7a-bank-ocean | retrospective-6a-7a | river | 1.62 | 5 | 0.778 |
| p7a-music-mathematics | retrospective-6a-7a | harmony | 0.60 | 7 | 0.015 |
| p7a-seed-garden | retrospective-6a-7a | germination | 1.19 | 6 | 0.000 |
| p8a-cause-effect | retrospective-8a | mechanism | 1.25 | 8 | 0.143 |
| p8a-brain-computer | retrospective-8a | algorithm | 0.73 | 7 | 0.426 |
| p9a-hot-cold | prospective-9a | warm | 1.00 | 5 | 0.000 |
| p9a-whisper-shout | prospective-9a | speak | 0.60 | 4 | 0.977 |
| p9a-grape-wine | prospective-9a | fermentation | 1.07 | 5 | 1.017 |
| p9a-caterpillar-butterfly | prospective-9a | cocoon | 0.35 | 6 | 0.000 |
| p9a-dawn-dusk | prospective-9a | noon | 0.73 | 6 | 0.938 |
| p9a-infant-elderly | prospective-9a | adolescent | 1.04 | 4 | 0.429 |

## 11. Per-Model Prospective Detail

| Pair | Model | Uncon. Freq | Pre-Fill Freq | Survival | Dom. Ratio |
|------|-------|-------------|---------------|----------|-----------|
| p9a-hot-cold | claude | 1.000 | 0.000 | 0.000 | 1.00 |
| p9a-hot-cold | gpt | 1.000 | 0.000 | 0.000 | 1.00 |
| p9a-hot-cold | grok | 1.000 | 0.000 | 0.000 | 1.00 |
| p9a-hot-cold | gemini | 0.667 | 0.000 | 0.000 | 0.71 |
| p9a-whisper-shout | claude | 1.000 | 1.000 | 1.000 | 1.00 |
| p9a-whisper-shout | gpt | 0.867 | 0.800 | 0.923 | 0.47 |
| p9a-whisper-shout | grok | 0.867 | 0.300 | 0.346 | 0.87 |
| p9a-whisper-shout | gemini | 0.133 | 0.700 | 5.250 | 0.07 |
| p9a-grape-wine | claude | 1.000 | 1.000 | 1.000 | 1.00 |
| p9a-grape-wine | gpt | 1.000 | 1.000 | 1.000 | 1.25 |
| p9a-grape-wine | grok | 0.933 | 1.000 | 1.071 | 1.08 |
| p9a-grape-wine | gemini | 1.000 | 1.000 | 1.000 | 1.00 |
| p9a-caterpillar-butterfly | claude | 0.000 | 0.000 | 0.000 | 0.00 |
| p9a-caterpillar-butterfly | gpt | 0.333 | 0.000 | 0.000 | 0.38 |
| p9a-caterpillar-butterfly | grok | 0.867 | 0.000 | 0.000 | 0.93 |
| p9a-caterpillar-butterfly | gemini | 0.000 | 0.000 | 0.000 | 0.00 |
| p9a-dawn-dusk | claude | 1.000 | 0.000 | 0.000 | 1.00 |
| p9a-dawn-dusk | gpt | 0.733 | 0.500 | 0.682 | 0.73 |
| p9a-dawn-dusk | grok | 0.933 | 1.000 | 1.071 | 1.00 |
| p9a-dawn-dusk | gemini | 0.000 | 1.000 | 0.000 | 0.00 |
| p9a-infant-elderly | claude | 1.000 | 0.000 | 0.000 | 1.00 |
| p9a-infant-elderly | gpt | 1.000 | 0.300 | 0.300 | 1.00 |
| p9a-infant-elderly | grok | 0.667 | 0.100 | 0.150 | 1.00 |
| p9a-infant-elderly | gemini | 0.600 | 1.000 | 1.667 | 0.60 |
