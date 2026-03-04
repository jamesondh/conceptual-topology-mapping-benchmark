# Phase 6B: Forced-Crossing Asymmetry Test Findings

> Generated: 2026-03-04T20:17:25.418Z

## 1. Experiment Overview

- **Pairs analyzed:** 8
- **Models:** claude, gpt, grok, gemini
- **Total runs loaded:** 640
- **Asymmetry results computed:** 32

## 2. Per-Pair Asymmetry Index

| Pair | Type | Model | Asymmetry | 95% CI | Fwd Runs | Rev Runs |
|------|------|-------|-----------|--------|----------|----------|
| p6b-loan-shore | forced-crossing | claude | 0.826 | [0.759, 0.888] | 10 | 10 |
| p6b-loan-shore | forced-crossing | gpt | 0.843 | [0.800, 0.883] | 10 | 10 |
| p6b-loan-shore | forced-crossing | grok | 0.852 | [0.775, 0.911] | 10 | 10 |
| p6b-loan-shore | forced-crossing | gemini | 0.846 | [0.816, 0.878] | 10 | 10 |
| p6b-deposit-river | forced-crossing | claude | 0.599 | [0.526, 0.665] | 10 | 10 |
| p6b-deposit-river | forced-crossing | gpt | 0.922 | [0.888, 0.960] | 10 | 10 |
| p6b-deposit-river | forced-crossing | grok | 0.912 | [0.797, 0.981] | 10 | 10 |
| p6b-deposit-river | forced-crossing | gemini | 0.422 | [0.380, 0.471] | 10 | 10 |
| p6b-savings-cliff | forced-crossing | claude | 0.829 | [0.791, 0.863] | 10 | 10 |
| p6b-savings-cliff | forced-crossing | gpt | 0.898 | [0.857, 0.936] | 10 | 10 |
| p6b-savings-cliff | forced-crossing | grok | 0.872 | [0.798, 0.925] | 10 | 10 |
| p6b-savings-cliff | forced-crossing | gemini | 0.919 | [0.890, 0.946] | 10 | 10 |
| p6b-photon-heavy | forced-crossing | claude | 0.629 | [0.577, 0.687] | 10 | 10 |
| p6b-photon-heavy | forced-crossing | gpt | 0.872 | [0.832, 0.911] | 10 | 10 |
| p6b-photon-heavy | forced-crossing | grok | 0.922 | [0.850, 0.973] | 10 | 10 |
| p6b-photon-heavy | forced-crossing | gemini | 0.911 | [0.817, 0.985] | 10 | 10 |
| p6b-loan-savings | same-axis | claude | 0.896 | [0.830, 0.960] | 10 | 10 |
| p6b-loan-savings | same-axis | gpt | 0.952 | [0.920, 0.977] | 10 | 10 |
| p6b-loan-savings | same-axis | grok | 0.687 | [0.605, 0.770] | 10 | 10 |
| p6b-loan-savings | same-axis | gemini | 0.874 | [0.828, 0.918] | 10 | 10 |
| p6b-river-shore | same-axis | claude | 0.444 | [0.444, 0.444] | 10 | 10 |
| p6b-river-shore | same-axis | gpt | 0.910 | [0.841, 0.974] | 10 | 10 |
| p6b-river-shore | same-axis | grok | 0.858 | [0.782, 0.922] | 10 | 10 |
| p6b-river-shore | same-axis | gemini | 0.948 | [0.917, 0.977] | 10 | 10 |
| p6b-sun-desert | same-axis | claude | 0.701 | [0.654, 0.747] | 10 | 10 |
| p6b-sun-desert | same-axis | gpt | 0.750 | [0.676, 0.823] | 10 | 10 |
| p6b-sun-desert | same-axis | grok | 0.743 | [0.636, 0.827] | 10 | 10 |
| p6b-sun-desert | same-axis | gemini | 0.869 | [0.841, 0.896] | 10 | 10 |
| p6b-seed-garden | same-axis | claude | 0.708 | [0.668, 0.740] | 10 | 10 |
| p6b-seed-garden | same-axis | gpt | 0.800 | [0.736, 0.860] | 10 | 10 |
| p6b-seed-garden | same-axis | grok | 0.833 | [0.747, 0.908] | 10 | 10 |
| p6b-seed-garden | same-axis | gemini | 0.991 | [0.977, 1.000] | 10 | 10 |

## 3. Primary Test: Forced-Crossing vs Same-Axis

- **Forced-crossing mean asymmetry:** 0.817 [0.743, 0.877]
- **Same-axis mean asymmetry:** 0.810 [0.744, 0.878]
- **Difference (FC - SA):** 0.007 [-0.098, 0.094]
- **Significantly lower:** **NO**

The primary pre-registered test does not pass. The difference in asymmetry between forced-crossing and same-axis pairs is not statistically significant (95% CI includes zero).

## 4. Secondary Test: vs Phase 2 Baseline (0.811)

- **Forced-crossing mean asymmetry:** 0.817
- **Phase 2 baseline:** 0.811
- **Difference:** 0.006 [-0.073, 0.065]
- **Note:** Phase 2 used 5 waypoints; Phase 6 uses 7 waypoints (approximate comparison)

## 5. Per-Model Analysis

| Model | FC Mean Asymmetry | SA Mean Asymmetry | Reduction |
|-------|-------------------|-------------------|-----------|
| claude | 0.721 | 0.688 | -0.034 |
| gpt | 0.884 | 0.853 | -0.031 |
| grok | 0.889 | 0.780 | -0.109 |
| gemini | 0.775 | 0.920 | 0.146 |

- **Gemini reduction:** 0.146
- **Non-Gemini mean reduction:** -0.058


## 6. Bridge Positional Consistency

- **Consistent fraction (+/-1 position):** 0.167 (12 pair/model combos analyzed)

## 7. Predictions Summary

| # | Prediction | Result |
|---|------------|--------|
| 1 | Bank-mediated FC asymmetry 0.50-0.70 | 0.812 (OUT OF RANGE) |
| 2 | Photon-heavy asymmetry 0.75-0.90 (baseline) | 0.833 (IN RANGE) |
| 3 | Same-axis asymmetry ~0.811 (baseline) | 0.810 |
| 4 | Gemini shows no FC asymmetry reduction | reduction=0.146 (NOT CONFIRMED) |
| 5 | Bridge at +/-1 position in >70% of runs | 17% (NOT CONFIRMED) |
| 6 | Claude lowest FC asymmetry | lowest=claude (0.721) |
