# Phase 10B: Pre-Fill Relation Class Analysis Findings

> Generated: 2026-03-05T22:19:52.973Z

## 1. Experiment Overview

- **Total pairs analyzed:** 8
- **Models:** claude, gpt, grok, gemini
- **Conditions:** on-axis, same-domain, unrelated
- **New runs:** 960
- **Reused runs:** 778

## 2. Aggregate Survival by Relation Class

| Relation Class | Mean Survival | 95% CI |
|----------------|---------------|--------|
| on-axis | 0.643 | [0.330, 0.903] |
| same-domain | 0.708 | [0.482, 0.922] |
| unrelated | 0.388 | [0.191, 0.606] |

## 3. Friedman Test (PRIMARY TEST)

- **Chi-squared:** 6.750
- **df:** 2
- **p-value:** 0.0342
- **Significant (p < 0.05):** **YES**
- **N pairs (blocks):** 8

**[observed]** The Friedman test confirms that relation class significantly affects bridge survival under pre-fill perturbation. The three relation classes (on-axis, same-domain, unrelated) produce systematically different survival rates.

## 4. Post-hoc Pairwise Comparisons (Wilcoxon Signed-Rank)

| Comparison | Mean Diff | 95% CI | W | p-value | Significant |
|------------|-----------|--------|---|---------|-------------|
| on-axis vs same-domain | -0.065 | [-0.247, 0.094] | 17.0 | 0.8886 | NO |
| on-axis vs unrelated | 0.255 | [0.122, 0.411] | 2.0 | 0.0251 | YES |
| same-domain vs unrelated | 0.320 | [0.123, 0.544] | 3.0 | 0.0357 | YES |

## 5. Ordering Test (on-axis < unrelated < same-domain)

- **Pairs with correct order:** 1 / 8
- **Proportion:** 0.125

## 6. Warm/Fermentation Replication (Phase 9A Comparison)

| Pair | Condition | Phase 10B | Phase 9A | Diff | Replicates (within 0.15)? |
|------|-----------|-----------|----------|------|---------------------------|
| p10b-hot-cold | on-axis | 0.000 | 0.000 | 0.000 | YES |
| p10b-hot-cold | same-domain | 0.225 | -- | -- | -- |
| p10b-hot-cold | unrelated | 0.050 | -- | -- | -- |
| p10b-grape-wine | same-domain | 0.991 | 1.017 | 0.026 | YES |
| p10b-grape-wine | on-axis | 1.018 | -- | -- | -- |
| p10b-grape-wine | unrelated | 0.834 | -- | -- | -- |

## 7. Per-Model Relation Class Separation

| Model | On-Axis Surv. | Same-Domain Surv. | Unrelated Surv. | Separation Gap |
|-------|--------------|-------------------|-----------------|----------------|
| claude | 0.800 | 0.738 | 0.413 | -0.062 |
| gpt | 0.631 | 0.628 | 0.291 | -0.003 |
| grok | 0.456 | 0.582 | 0.257 | 0.126 |
| gemini | 0.686 | 0.885 | 0.591 | 0.199 |

## 8. Bridge Strength Interaction

- **Spearman rho (unconstrained freq vs on-axis survival):** 0.643 [-0.215, 0.923]
- **Significant:** NO

## 9. Phase 7A Taxonomy Comparison

- **Phase 7A within-class variance:** 0.1371
- **Phase 10 on-axis variance:** 0.1766
- **Phase 10 same-domain variance:** 0.1148
- **Phase 10 reduces variance:** **NO**

## 10. Effect Size

- **Cohen's d (same-domain vs on-axis):** 0.170
- **Interpretation:** small

## 11. Predictions Summary

| # | Prediction | Result | Value |
|---|------------|--------|-------|
| 1 | Friedman test significant (p < 0.05) | confirmed | chi2=6.750, p=0.0342 |
| 2 | On-axis survival significantly lower than same-domain | not confirmed | diff=-0.065, p=0.8886 |
| 3 | On-axis survival lower than unrelated survival | not confirmed | diff=0.255, p=0.0251 |
| 4 | Ordering on-axis < unrelated < same-domain in >= 5/8 pairs | not confirmed | 1/8 pairs |
| 5 | Cohen's d (same-domain vs on-axis) >= 0.50 (medium+) | not confirmed | d=0.170 (small) |
| 6 | Warm (hot-cold on-axis) replicates Phase 9A within 0.15 | confirmed | p10=0.000, p9a=0.000, diff=0.000 |
| 7 | Fermentation (grape-wine same-domain) replicates Phase 9A within 0.15 | confirmed | p10=0.991, p9a=1.017, diff=0.026 |
| 8 | Phase 10 per-class variance < Phase 7A pooled congruent variance | not confirmed | p7a_var=0.1371, p10_on=0.1766, p10_sd=0.1148 |
| 9 | Model generality: >= 3/4 models show same-domain > on-axis | not confirmed | 2/4 models |
| 10 | Bridge strength interacts with on-axis survival (Spearman CI excludes zero) | not confirmed | rho=0.643 [-0.215, 0.923] |

## 12. Key Findings

- **Predictions confirmed:** 3/10
- **Friedman test significant:** YES
- **On-axis mean survival:** 0.643 (most displacement)
- **Unrelated mean survival:** 0.388
- **Same-domain mean survival:** 0.708 (least displacement)
- **Effect size (Cohen's d):** 0.170 (small)
