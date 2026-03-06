# Phase 11C: Multiverse Robustness Findings

> Generated: 2026-03-06T19:04:53.981Z

## 1. Experiment Overview

- **Conditions:** 7wp-t0.7, 5wp-t0.5, 5wp-t0.9, 9wp-t0.5, 9wp-t0.9 + baseline (7wp-t0.7)
- **Models:** claude, gpt, deepseek
- **Pairs:** 6
- **Total new runs:** 1080
- **Total reused baseline runs:** 340

## 2. Gait Robustness (R1)

| Model | Condition | Mean Intra-Model Jaccard | 95% CI |
|-------|-----------|------------------------|--------|
| claude | 7wp-t0.7 | 0.676 | [0.396, 0.905] |
| claude | 5wp-t0.5 | 0.794 | [0.532, 1.000] |
| claude | 5wp-t0.9 | 0.772 | [0.486, 0.978] |
| claude | 9wp-t0.5 | 0.699 | [0.389, 0.923] |
| claude | 9wp-t0.9 | 0.624 | [0.351, 0.860] |
| gpt | 7wp-t0.7 | 0.378 | [0.197, 0.537] |
| gpt | 5wp-t0.5 | 0.413 | [0.193, 0.633] |
| gpt | 5wp-t0.9 | 0.477 | [0.252, 0.684] |
| gpt | 9wp-t0.5 | 0.382 | [0.184, 0.555] |
| gpt | 9wp-t0.9 | 0.365 | [0.180, 0.528] |
| deepseek | 7wp-t0.7 | 0.000 | [0.000, 0.000] |
| deepseek | 5wp-t0.5 | 0.582 | [0.419, 0.738] |
| deepseek | 5wp-t0.9 | 0.492 | [0.320, 0.613] |
| deepseek | 9wp-t0.5 | 0.592 | [0.358, 0.718] |
| deepseek | 9wp-t0.9 | 0.597 | [0.392, 0.706] |

### Rank-Order Stability

- **Kendall's W:** 0.840
- **Rank order preserved:** no

  - 7wp-t0.7: claude > gpt > deepseek
  - 5wp-t0.5: claude > deepseek > gpt
  - 5wp-t0.9: claude > deepseek > gpt
  - 9wp-t0.5: claude > deepseek > gpt
  - 9wp-t0.9: claude > deepseek > gpt

## 3. Asymmetry Robustness (R2)

| Model | Condition | Pair | Asymmetry Index | 95% CI |
|-------|-----------|------|----------------|--------|
| claude | 7wp-t0.7 | hot-cold | 0.726 | [0.697, 0.750] |
| claude | 7wp-t0.7 | emotion-melancholy | 1.000 | [1.000, 1.000] |
| gpt | 7wp-t0.7 | hot-cold | 0.471 | [0.414, 0.522] |
| gpt | 7wp-t0.7 | emotion-melancholy | 1.000 | [1.000, 1.000] |
| deepseek | 7wp-t0.7 | hot-cold | 1.000 | [1.000, 1.000] |
| deepseek | 7wp-t0.7 | emotion-melancholy | 1.000 | [1.000, 1.000] |
| claude | 5wp-t0.5 | hot-cold | 0.750 | [0.750, 0.750] |
| claude | 5wp-t0.5 | emotion-melancholy | 0.512 | [0.466, 0.550] |
| gpt | 5wp-t0.5 | hot-cold | 0.434 | [0.372, 0.503] |
| gpt | 5wp-t0.5 | emotion-melancholy | 0.520 | [0.461, 0.568] |
| deepseek | 5wp-t0.5 | hot-cold | 0.665 | [0.641, 0.689] |
| deepseek | 5wp-t0.5 | emotion-melancholy | 0.684 | [0.644, 0.719] |
| claude | 5wp-t0.9 | hot-cold | 0.726 | [0.690, 0.750] |
| claude | 5wp-t0.9 | emotion-melancholy | 0.519 | [0.473, 0.562] |
| gpt | 5wp-t0.9 | hot-cold | 0.392 | [0.354, 0.435] |
| gpt | 5wp-t0.9 | emotion-melancholy | 0.555 | [0.445, 0.654] |
| deepseek | 5wp-t0.9 | hot-cold | 0.653 | [0.621, 0.684] |
| deepseek | 5wp-t0.9 | emotion-melancholy | 0.712 | [0.667, 0.760] |
| claude | 9wp-t0.5 | hot-cold | 0.671 | [0.647, 0.696] |
| claude | 9wp-t0.5 | emotion-melancholy | 0.625 | [0.583, 0.662] |
| gpt | 9wp-t0.5 | hot-cold | 0.514 | [0.460, 0.562] |
| gpt | 9wp-t0.5 | emotion-melancholy | 0.682 | [0.645, 0.717] |
| deepseek | 9wp-t0.5 | hot-cold | 0.783 | [0.760, 0.804] |
| deepseek | 9wp-t0.5 | emotion-melancholy | 0.740 | [0.708, 0.766] |
| claude | 9wp-t0.9 | hot-cold | 0.655 | [0.620, 0.690] |
| claude | 9wp-t0.9 | emotion-melancholy | 0.612 | [0.565, 0.656] |
| gpt | 9wp-t0.9 | hot-cold | 0.596 | [0.555, 0.638] |
| gpt | 9wp-t0.9 | emotion-melancholy | 0.725 | [0.684, 0.769] |
| deepseek | 9wp-t0.9 | hot-cold | 0.760 | [0.732, 0.785] |
| deepseek | 9wp-t0.9 | emotion-melancholy | 0.754 | [0.720, 0.784] |

### Mean Asymmetry per Condition

| Condition | Mean Asymmetry | 95% CI | > 0.60? |
|-----------|---------------|--------|---------|
| 7wp-t0.7 | 0.599 | [0.471, 0.726] | no |
| 5wp-t0.5 | 0.594 | [0.512, 0.675] | no |
| 5wp-t0.9 | 0.593 | [0.502, 0.688] | no |
| 9wp-t0.5 | 0.669 | [0.597, 0.733] | **YES** |
| 9wp-t0.9 | 0.684 | [0.631, 0.736] | **YES** |

## 4. Bridge Frequency Robustness

| Pair | Bridge | Model | Condition | Freq | 95% CI |
|------|--------|-------|-----------|------|--------|
| p11c-light-color | spectrum | claude | 7wp-t0.7 | 1.000 | [1.000, 1.000] |
| p11c-light-color | spectrum | gpt | 7wp-t0.7 | 0.975 | [0.925, 1.000] |
| p11c-light-color | spectrum | deepseek | 7wp-t0.7 | 0.000 | [0.000, 0.000] |
| p11c-hot-cold | warm | claude | 7wp-t0.7 | 1.000 | [1.000, 1.000] |
| p11c-hot-cold | warm | gpt | 7wp-t0.7 | 1.000 | [1.000, 1.000] |
| p11c-hot-cold | warm | deepseek | 7wp-t0.7 | 0.000 | [0.000, 0.000] |
| p11c-emotion-melancholy | sadness | claude | 7wp-t0.7 | 1.000 | [1.000, 1.000] |
| p11c-emotion-melancholy | sadness | gpt | 7wp-t0.7 | 0.975 | [0.925, 1.000] |
| p11c-emotion-melancholy | sadness | deepseek | 7wp-t0.7 | 0.000 | [0.000, 0.000] |
| p11c-light-color | spectrum | claude | 5wp-t0.5 | 1.000 | [1.000, 1.000] |
| p11c-light-color | spectrum | gpt | 5wp-t0.5 | 1.000 | [1.000, 1.000] |
| p11c-light-color | spectrum | deepseek | 5wp-t0.5 | 0.933 | [0.800, 1.000] |
| p11c-hot-cold | warm | claude | 5wp-t0.5 | 1.000 | [1.000, 1.000] |
| p11c-hot-cold | warm | gpt | 5wp-t0.5 | 1.000 | [1.000, 1.000] |
| p11c-hot-cold | warm | deepseek | 5wp-t0.5 | 1.000 | [1.000, 1.000] |
| p11c-emotion-melancholy | sadness | claude | 5wp-t0.5 | 1.000 | [1.000, 1.000] |
| p11c-emotion-melancholy | sadness | gpt | 5wp-t0.5 | 1.000 | [1.000, 1.000] |
| p11c-emotion-melancholy | sadness | deepseek | 5wp-t0.5 | 1.000 | [1.000, 1.000] |
| p11c-light-color | spectrum | claude | 5wp-t0.9 | 1.000 | [1.000, 1.000] |
| p11c-light-color | spectrum | gpt | 5wp-t0.9 | 1.000 | [1.000, 1.000] |
| p11c-light-color | spectrum | deepseek | 5wp-t0.9 | 0.800 | [0.600, 1.000] |
| p11c-hot-cold | warm | claude | 5wp-t0.9 | 1.000 | [1.000, 1.000] |
| p11c-hot-cold | warm | gpt | 5wp-t0.9 | 1.000 | [1.000, 1.000] |
| p11c-hot-cold | warm | deepseek | 5wp-t0.9 | 1.000 | [1.000, 1.000] |
| p11c-emotion-melancholy | sadness | claude | 5wp-t0.9 | 1.000 | [1.000, 1.000] |
| p11c-emotion-melancholy | sadness | gpt | 5wp-t0.9 | 1.000 | [1.000, 1.000] |
| p11c-emotion-melancholy | sadness | deepseek | 5wp-t0.9 | 1.000 | [1.000, 1.000] |
| p11c-light-color | spectrum | claude | 9wp-t0.5 | 1.000 | [1.000, 1.000] |
| p11c-light-color | spectrum | gpt | 9wp-t0.5 | 1.000 | [1.000, 1.000] |
| p11c-light-color | spectrum | deepseek | 9wp-t0.5 | 1.000 | [1.000, 1.000] |
| p11c-hot-cold | warm | claude | 9wp-t0.5 | 1.000 | [1.000, 1.000] |
| p11c-hot-cold | warm | gpt | 9wp-t0.5 | 1.000 | [1.000, 1.000] |
| p11c-hot-cold | warm | deepseek | 9wp-t0.5 | 1.000 | [1.000, 1.000] |
| p11c-emotion-melancholy | sadness | claude | 9wp-t0.5 | 0.933 | [0.800, 1.000] |
| p11c-emotion-melancholy | sadness | gpt | 9wp-t0.5 | 1.000 | [1.000, 1.000] |
| p11c-emotion-melancholy | sadness | deepseek | 9wp-t0.5 | 1.000 | [1.000, 1.000] |
| p11c-light-color | spectrum | claude | 9wp-t0.9 | 1.000 | [1.000, 1.000] |
| p11c-light-color | spectrum | gpt | 9wp-t0.9 | 1.000 | [1.000, 1.000] |
| p11c-light-color | spectrum | deepseek | 9wp-t0.9 | 1.000 | [1.000, 1.000] |
| p11c-hot-cold | warm | claude | 9wp-t0.9 | 1.000 | [1.000, 1.000] |
| p11c-hot-cold | warm | gpt | 9wp-t0.9 | 1.000 | [1.000, 1.000] |
| p11c-hot-cold | warm | deepseek | 9wp-t0.9 | 1.000 | [1.000, 1.000] |
| p11c-emotion-melancholy | sadness | claude | 9wp-t0.9 | 1.000 | [1.000, 1.000] |
| p11c-emotion-melancholy | sadness | gpt | 9wp-t0.9 | 0.867 | [0.667, 1.000] |
| p11c-emotion-melancholy | sadness | deepseek | 9wp-t0.9 | 1.000 | [1.000, 1.000] |

### Mean Bridge Frequency per Condition

| Condition | Mean Bridge Freq | 95% CI | Above thresholds? |
|-----------|-----------------|--------|-------------------|
| 7wp-t0.7 | 0.992 | [0.983, 1.000] | **YES** |
| 5wp-t0.5 | 0.993 | [0.978, 1.000] | **YES** |
| 5wp-t0.9 | 0.978 | [0.933, 1.000] | **YES** |
| 9wp-t0.5 | 0.993 | [0.978, 1.000] | **YES** |
| 9wp-t0.9 | 0.985 | [0.956, 1.000] | **YES** |

## 5. ANOVA-like Interaction Test

> **Methodological note:** p-values are approximate (chi-squared approximation to F-distribution, ignoring denominator df). Per-pair cells are treated as independent without repeated-measures modeling. Effect sizes (eta-squared) are more reliable than exact p-values.

- **Waypoint main effect (SS proportion):** 0.0076 (p≈0.5201)
- **Temperature main effect (SS proportion):** 0.0018 (p≈0.7431)
- **Interaction effect (SS proportion):** 0.0002 (p≈0.8863)
- **Model main effect (SS proportion):** 0.2421 (p≈0.0013)
- **Null interaction:** **YES** (model identity drives structure, not parameter interaction)

## 6. Waypoint Count Scaling

- **Shared waypoint fraction (5wp vs 7wp):** 0.761
- **Shared waypoint fraction (7wp vs 9wp):** 0.504
- **Shared waypoint fraction (5wp vs 9wp):** 0.481
- **Reference: O10 (5wp vs 10wp):** 0.705

## 7. Predictions Summary

| # | Prediction | Result | Value |
|---|------------|--------|-------|
| 1 | R1 gait rank-order survives (Kendall's W > 0.70) | confirmed | W = 0.840 |
| 2 | R2 asymmetry survives (mean > 0.60 all conditions) | not confirmed | 7wp-t0.7=0.599, 5wp-t0.5=0.594, 5wp-t0.9=0.593, 9wp-t0.5=0.669, 9wp-t0.9=0.684 |
| 3 | Bridge bottleneck survives (spectrum > 0.50, warm > 0.30 all conditions) | confirmed | 7wp-t0.7=0.992, 5wp-t0.5=0.993, 5wp-t0.9=0.978, 9wp-t0.5=0.993, 9wp-t0.9=0.985 |
| 4 | Temperature 0.5 increases Jaccard by 0.05-0.15 vs baseline | not confirmed | delta = 0.226 (baseline=0.351, t0.5=0.577) |
| 5 | Temperature 0.9 decreases Jaccard but all models > 0.10 | not confirmed | delta = 0.203, all > 0.10: true |
| 6 | 5-waypoint paths show higher bridge frequency than 9-waypoint | not confirmed | 5wp=0.985, 9wp=0.989 |
| 7 | Control pair (stapler-monsoon) remains unstructured across all conditions | not confirmed | unstructured: false |

## 8. Summary

- **Predictions confirmed:** 2 of 7
- **Predictions not confirmed:** 5
- **Insufficient data:** 0

Some findings show sensitivity to elicitation parameters. See individual results above.
