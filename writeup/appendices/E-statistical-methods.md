# Appendix E: Statistical Methods

This appendix documents the statistical procedures used throughout the benchmark. All analyses were implemented in TypeScript (Bun runtime) unless otherwise noted.

## E.1 Bootstrap Confidence Intervals

Confidence intervals for Jaccard-based metrics (gait consistency, path asymmetry, bridge frequency, transitivity) are 95% percentile bootstrap intervals computed from 1,000 resamples with a seeded PRNG (seed = 42) for reproducibility.

**Procedure.** For a metric computed over *n* independent runs:

1. Resample *n* runs with replacement (1,000 times).
2. Recompute the metric on each resample.
3. Report the 2.5th and 97.5th percentiles as the 95% CI.

**Limitation.** Efron and Tibshirani (1993) recommend 5,000--10,000 resamples for publication-quality confidence intervals. The benchmark uses 1,000 for computational efficiency during the exploration-first workflow. CIs should be interpreted as approximate; the qualitative conclusions (whether a CI includes zero) are robust to resample count, but exact CI bounds may shift slightly with more resamples.

## E.2 Permutation Tests for Asymmetry

Statistical significance of path asymmetry is assessed via permutation test. For a given (model, pair) combination with *n_f* forward runs and *n_r* reverse runs:

1. Pool all *n_f + n_r* runs.
2. Randomly assign *n_f* to "forward" and *n_r* to "reverse" (1,000 permutations).
3. Compute the mean cross-direction Jaccard for each permutation.
4. The *p*-value is the fraction of permutations producing a cross-direction Jaccard as low or lower than the observed value, using the Phipson and Smyth (2010) correction to avoid exact-zero *p*-values:

$$p = \frac{b + 1}{m + 1}$$

where *b* is the count of permutations with test statistic as extreme as observed and *m* is the total number of permutations.

**Limitation.** With 1,000 permutations, the minimum achievable *p*-value is approximately 0.001 (after the Phipson--Smyth correction). This limits resolution for Bonferroni-corrected thresholds. The 87% significance rate reported in Section 5.1 (73 of 84 combinations at p < 0.05) was computed without multiple-comparison correction. With Bonferroni correction (threshold 0.05/84 $\approx$ 0.0006), the percentage would be lower, and the permutation test's resolution is insufficient to distinguish near this corrected threshold. The qualitative conclusion --- that the vast majority of combinations show genuine asymmetry --- is robust, but the specific percentage should be interpreted conservatively.

## E.3 Friedman Test and Post-Hoc Comparisons

The effect of pre-fill relation class on bridge survival (Section 6.3) was tested using the Friedman test, a non-parametric repeated-measures alternative to one-way ANOVA. The 8 concept pairs serve as blocks, and the 3 relation classes (on-axis, same-domain, unrelated) serve as treatments.

**Procedure:**

1. For each pair, rank the 3 survival rates.
2. Compute the Friedman chi-squared statistic from the rank sums.
3. Assess significance against the chi-squared distribution with *k - 1* = 2 degrees of freedom.

**Result:** $\chi^2$ = 6.750, *df* = 2, *p* = 0.034.

**Post-hoc comparisons.** Pairwise Wilcoxon signed-rank tests:

| Comparison | *p*-value | Survives Bonferroni (0.05/3 = 0.017)? |
|-----------|----------|---------------------------------------|
| On-axis vs. unrelated | 0.025 | No |
| Same-domain vs. unrelated | 0.036 | No |
| On-axis vs. same-domain | 0.889 | N/A |

Neither pairwise comparison survives Bonferroni correction for 3 comparisons. The qualitative conclusion --- unrelated pre-fills are more disruptive than related ones --- is supported by the omnibus Friedman test but the specific pairwise *p*-values are suggestive rather than confirmatory.

## E.4 ANOVA for Multiverse Robustness

The Phase 11C robustness analysis used a factorial ANOVA decomposing gait variance across model identity, waypoint count, and temperature.

**Design:** 3 models (Claude, GPT, DeepSeek) $\times$ 2 waypoint counts (5, 9) $\times$ 2 temperatures (0.5, 0.9), plus the 7-waypoint / 0.7-temperature baseline assembled from prior-phase data.

**Procedure:**

1. Compute cell means: mean Jaccard for each (model, waypoint count, temperature, pair) combination.
2. Compute sum of squares for each factor and interaction.
3. Express as eta-squared ($\eta^2$ = SS$_{\text{factor}}$ / SS$_{\text{total}}$).
4. Approximate *p*-values using the chi-squared distribution (ignoring denominator degrees of freedom).

**Results:**

| Factor | $\eta^2$ | Approx. *p* |
|--------|---------|------------|
| Model identity | 0.242 | $\approx$ 0.001 |
| Waypoint count | 0.008 | $\approx$ 0.520 |
| Temperature | 0.002 | $\approx$ 0.743 |
| Waypoint $\times$ Temperature | $\approx$ 0.000 | $\approx$ 0.886 |

**Limitations:**

1. *P*-value approximation.* The chi-squared approximation ignores denominator degrees of freedom. Exact F-test *p*-values would require a proper mean squares decomposition. The eta-squared effect sizes are more reliable than the exact *p*-values.
2. *Independence assumption.* Per-pair cells are treated as independent observations without repeated-measures modeling. A mixed-effects model with pair as a random effect would be more appropriate for confirmatory inference.
3. *Coverage.* Only 3 models were tested. The conclusion that model identity dominates protocol variation is supported within this subset but should be extended with caution.
4. *Baseline sparsity.* DeepSeek has no prior-phase data; its 7wp-t0.7 baseline cells are empty. This affects the baseline condition but not the four new conditions.

The analysis should be understood as descriptive/exploratory rather than confirmatory. The qualitative conclusion --- that model identity accounts for far more variance than protocol parameters --- is robust to these approximations, as the effect size gap (0.242 vs. 0.008 and 0.002) is large.

## E.5 Chi-Squared Goodness-of-Fit Test

Departure from uniform waypoint distributions (Section 5.6) is assessed via chi-squared goodness-of-fit test.

**Procedure.** For each (model, pair) condition:

1. Count unique waypoints across all runs, treating each waypoint as appearing once per run.
2. Compute expected frequencies under the null hypothesis that all waypoints are equally likely.
3. Compute the chi-squared statistic: $\chi^2 = \sum (O_i - E_i)^2 / E_i$.
4. Compute *p*-value using the Wilson--Hilferty normal approximation.
5. Apply Bonferroni correction at the pair level (dividing the significance threshold by the number of pairs tested).

**Note on naming.** The codebase function implementing this test is named `ksTestUniform` (after Kolmogorov--Smirnov), but the implementation is chi-squared goodness-of-fit, which is more appropriate for categorical frequency data. The paper uses the correct name (chi-squared).

## E.6 Kendall's W (Coefficient of Concordance)

Gait rank stability across protocol conditions (Section 9.3) is assessed via Kendall's W:

$$W = \frac{12 \sum_{i=1}^{n} (R_i - \bar{R})^2}{k^2(n^3 - n)}$$

where $R_i$ is the rank sum for model *i* across *k* conditions, and *n* is the number of models. W = 1 indicates perfect agreement across conditions; W = 0 indicates no agreement. The observed W = 0.840 indicates strong but imperfect rank stability.

## E.7 Bridge Frequency Comparison (Confidence Interval on Difference)

The structure/content/scale hierarchy (Section 8.2) compares aggregate bridge frequency between the original cohort and expanded cohorts using bootstrap CIs on the difference:

1. For each cohort, compute mean bridge frequency across all (model, pair) conditions.
2. Bootstrap the difference (original mean $-$ new mean) with 1,000 resamples.
3. If the 95% CI includes zero, the cohorts are statistically indistinguishable.

Phase 10A: diff = $-0.096$, CI [$-0.241$, 0.064] (includes zero).
Phase 11A combined: diff = $-0.100$, CI [$-0.286$, 0.089] (includes zero).

## E.8 Canonicalization and Its Statistical Implications

All metrics operate on canonicalized waypoint tokens. The canonicalization pipeline (Section 2.3) handles morphological variants but not synonyms. This has systematic statistical implications:

- **Jaccard similarity** is computed on token identity after canonicalization. Semantically equivalent but lexically distinct waypoints ("melody" vs. "tune," "cemetery" vs. "graveyard") are treated as completely different. All Jaccard-based metrics therefore *underestimate* true conceptual overlap.
- **Gait consistency** is a lower bound on true navigational consistency.
- **Path asymmetry** is an upper bound on true conceptual asymmetry.
- **Bridge frequency** may miss bridges expressed through synonyms rather than exact (or morphologically related) tokens.

The magnitude of this bias is bounded by the canonicalization (which collapses morphological variants) but is otherwise unknown. Embedding-based semantic similarity would help bound this effect but was deferred due to API cost.

## E.9 Multiple Comparison Corrections

The benchmark applies Bonferroni correction in two contexts:

1. **Uniformity tests** (Section 5.6): 8 pairs tested per model; threshold adjusted to 0.05/8 = 0.00625.
2. **Asymmetry significance** (Section 5.1): 84 pair/model combinations; the 87% significance rate is reported without correction. With Bonferroni (0.05/84 $\approx$ 0.0006), the percentage would be lower.

No correction is applied to the phase-level prediction accuracy tracking (Sections 7.1, 7.2), which is descriptive rather than inferential.

For the Friedman post-hoc comparisons (Section 6.3, Appendix E.3), Bonferroni correction for 3 pairwise comparisons (threshold 0.017) is documented but results in neither surviving comparison reaching significance. The paper reports both corrected and uncorrected results for transparency.
