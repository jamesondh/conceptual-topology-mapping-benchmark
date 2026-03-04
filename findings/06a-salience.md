# Phase 6A: Navigational Salience Mapping Findings

> Generated: 2026-03-04T18:02:55.132Z

## 1. Experiment Overview

- **Pairs analyzed:** 8
- **Models:** claude, gpt, grok, gemini
- **Total runs loaded:** 0
- **Salience landscapes computed:** 0

## 2. Waypoint Frequency Distributions

| Pair | Model | Unique WPs | Top-1 (freq) | Top-2 (freq) | Top-3 (freq) | Entropy | KS p-value |
|------|-------|-----------|-------------|-------------|-------------|---------|-----------|

## 3. Heavy-Tail Test (KS vs Uniform)

- **Pairs rejecting uniformity (raw p < 0.05):** 0 / 8
- **Pairs rejecting uniformity (Bonferroni p < 0.0063):** 0 / 8
- **Primary test (>=6 of 8 reject):** **FAILS**

The primary pre-registered test does not pass. Fewer than 6 of 8 pairs show significantly non-uniform waypoint distributions after Bonferroni correction.

## 4. Cross-Model Top-3 Agreement

| Pair | Mean Jaccard (top-3) | Model Pairs |
|------|---------------------|-------------|
| p6a-music-mathematics | 0.000 |  |
| p6a-sun-desert | 0.000 |  |
| p6a-seed-garden | 0.000 |  |
| p6a-light-color | 0.000 |  |
| p6a-bank-ocean | 0.000 |  |
| p6a-emotion-melancholy | 0.000 |  |
| p6a-language-thought | 0.000 |  |
| p6a-hot-cold | 0.000 |  |

## 5. Retroactive Cue-Strength Calibration

_No calibration data available._

## 6. Novel Waypoint Discovery

No novel waypoints discovered at >20% frequency.

## 7. Predictions Summary

| # | Prediction | Result |
|---|------------|--------|
| 1 | Bridge-present pairs have top waypoint >30% freq | 0/0 (0%) |
| 2 | Bridge-absent pairs have top waypoint <15% freq | 0/0 |
| 3 | Universal bridge Jaccard 0.40-0.70, variable 0.10-0.40 | universal=0.00, variable=0.00 |
| 5 | At least one novel waypoint at >20% freq | NO |
| 6 | Claude lowest entropy, Grok highest | lowest=claude(0.00), highest=gemini(0.00) |
