# Phase 6C: Positional Bridge Scanning Findings

> Generated: 2026-03-04T20:27:59.194Z

## 1. Experiment Overview

- **Pairs analyzed:** 10
- **Models:** claude, gpt, grok, gemini
- **New runs:** 240
- **Reused runs:** 280
- **Positional profiles computed:** 40

## 2. Per-Pair Positional Bridge Profiles

| Pair | Model | Bridge | Modal Pos | Modal Freq | Peak Contrast | Fixed-Mid Contrast | Runs |
|------|-------|--------|-----------|-----------|--------------|-------------------|------|
| p6c-light-color | claude | spectrum | 1 | 0.800 | 0.6000 | -0.2000 | 10 |
| p6c-light-color | gpt | spectrum | 1 | 0.500 | 0.3500 | 0.2500 | 10 |
| p6c-light-color | grok | spectrum | 1 | 0.100 | -0.1000 | 0.0500 | 10 |
| p6c-light-color | gemini | spectrum | 2 | 0.900 | 0.8500 | -0.4500 | 10 |
| p6c-bank-savings | claude | deposit | 1 | 1.000 | 1.0000 | 0.0000 | 10 |
| p6c-bank-savings | gpt | deposit | 2 | 0.600 | 0.4000 | -0.3000 | 10 |
| p6c-bank-savings | grok | deposit | 1 | 0.100 | 0.0500 | 0.0000 | 10 |
| p6c-bank-savings | gemini | deposit | 1 | 1.000 | 1.0000 | 0.0000 | 10 |
| p6c-animal-poodle | claude | dog | 4 | 0.800 | 0.7000 | -0.2000 | 10 |
| p6c-animal-poodle | gpt | dog | 5 | 0.700 | 0.1500 | -0.0500 | 10 |
| p6c-animal-poodle | grok | dog | 5 | 0.300 | 0.0500 | 0.0000 | 10 |
| p6c-animal-poodle | gemini | dog | 4 | 0.900 | 0.6500 | -0.3500 | 10 |
| p6c-music-mathematics | claude | harmony | 2 | 1.000 | 1.0000 | -0.5000 | 10 |
| p6c-music-mathematics | gpt | harmony | 2 | 0.100 | 0.0500 | 0.0000 | 10 |
| p6c-music-mathematics | grok | harmony | 1 | 0.500 | 0.3500 | 0.1000 | 10 |
| p6c-music-mathematics | gemini | harmony | 1 | 0.000 | 0.0000 | 0.0000 | 10 |
| p6c-tree-ecosystem | claude | forest | 1 | 0.200 | 0.2000 | 0.0000 | 10 |
| p6c-tree-ecosystem | gpt | forest | 2 | 0.200 | 0.0500 | 0.0500 | 10 |
| p6c-tree-ecosystem | grok | forest | 1 | 0.200 | -0.2000 | 0.2000 | 10 |
| p6c-tree-ecosystem | gemini | forest | 1 | 0.000 | 0.0000 | 0.0000 | 10 |
| p6c-loan-shore | claude | bank | 1 | 1.000 | 1.0000 | 0.0000 | 10 |
| p6c-loan-shore | gpt | bank | 2 | 0.700 | 0.6000 | -0.2500 | 10 |
| p6c-loan-shore | grok | bank | 1 | 0.200 | -0.3000 | 0.0000 | 10 |
| p6c-loan-shore | gemini | bank | 4 | 0.300 | 0.3000 | -0.1500 | 10 |
| p6c-deposit-river | claude | bank | 5 | 0.200 | 0.2000 | -0.0500 | 10 |
| p6c-deposit-river | gpt | bank | 1 | 0.300 | -0.0000 | 0.0000 | 10 |
| p6c-deposit-river | grok | bank | 1 | 0.600 | -0.1000 | -0.0500 | 10 |
| p6c-deposit-river | gemini | bank | 1 | 0.000 | 0.0000 | 0.0000 | 10 |
| p6c-sun-desert | claude | heat | 1 | 0.400 | 0.1000 | 0.0000 | 10 |
| p6c-sun-desert | gpt | heat | 1 | 0.700 | 0.6000 | -0.0500 | 10 |
| p6c-sun-desert | grok | heat | 1 | 0.000 | -0.5000 | 0.0000 | 10 |
| p6c-sun-desert | gemini | heat | 2 | 0.400 | 0.3000 | -0.2000 | 10 |
| p6c-seed-garden | claude | germination | 1 | 0.900 | 0.8500 | 0.0000 | 10 |
| p6c-seed-garden | gpt | germination | 2 | 0.700 | 0.5500 | -0.2500 | 10 |
| p6c-seed-garden | grok | germination | 1 | 0.200 | 0.1000 | 0.0000 | 10 |
| p6c-seed-garden | gemini | germination | 1 | 0.600 | 0.4000 | 0.0000 | 10 |
| p6c-emotion-melancholy | claude | sadness | 2 | 1.000 | 1.0000 | -0.5000 | 10 |
| p6c-emotion-melancholy | gpt | sadness | 3 | 0.500 | 0.3500 | 0.3500 | 10 |
| p6c-emotion-melancholy | grok | sadness | 2 | 0.600 | 0.5000 | -0.2500 | 10 |
| p6c-emotion-melancholy | gemini | sadness | 2 | 0.800 | 0.7000 | -0.4000 | 10 |

## 3. Primary Test: Peak-Detection vs Fixed-Midpoint Contrast

- **Peak-detection mean contrast:** 0.3450 [0.2237, 0.4588]
- **Fixed-midpoint mean contrast:** -0.0800 [-0.1412, -0.0238]
- **Difference (peak - fixed):** 0.4250 [0.2650, 0.5862]
- **Peak-detection significantly positive:** **YES**

**[observed]** Peak-detection W-shape contrast is significantly positive for bridge-present pairs, and exceeds the fixed-midpoint contrast. The rigid midpoint assumption in Phase 5C was obscuring a real positional signal.

## 4. Positional Prediction from Expected Position

- **Correlation (r):** 0.239
- **p-value:** 0.4857

| Pair | Expected Position Ratio | Modal Position |
|------|------------------------|----------------|
| p6c-light-color | 0.50 | 1.25 |
| p6c-bank-savings | 0.50 | 1.25 |
| p6c-animal-poodle | 0.50 | 4.5 |
| p6c-music-mathematics | 0.50 | 1.5 |
| p6c-tree-ecosystem | 0.50 | 1.25 |
| p6c-loan-shore | 0.50 | 2 |
| p6c-deposit-river | 0.50 | 2 |
| p6c-sun-desert | 0.25 | 1.25 |
| p6c-seed-garden | 0.50 | 1.25 |
| p6c-emotion-melancholy | 0.67 | 2.25 |

## 5. Cross-Model Positional Agreement

| Pair | Modal Positions | SD | Determination |
|------|-----------------|-----|---------------|
| p6c-light-color | claude:1, gpt:1, grok:1, gemini:2 | 0.50 | pair-determined |
| p6c-bank-savings | claude:1, gpt:2, grok:1, gemini:1 | 0.50 | pair-determined |
| p6c-animal-poodle | claude:4, gpt:5, grok:5, gemini:4 | 0.58 | pair-determined |
| p6c-music-mathematics | claude:2, gpt:2, grok:1, gemini:1 | 0.58 | pair-determined |
| p6c-tree-ecosystem | claude:1, gpt:2, grok:1, gemini:1 | 0.50 | pair-determined |
| p6c-loan-shore | claude:1, gpt:2, grok:1, gemini:4 | 1.41 | model-dependent |
| p6c-deposit-river | claude:5, gpt:1, grok:1, gemini:1 | 2.00 | model-dependent |
| p6c-sun-desert | claude:1, gpt:1, grok:1, gemini:2 | 0.50 | pair-determined |
| p6c-seed-garden | claude:1, gpt:2, grok:1, gemini:1 | 0.50 | pair-determined |
| p6c-emotion-melancholy | claude:2, gpt:3, grok:2, gemini:2 | 0.50 | pair-determined |

## 6. Forced-Crossing Positional Analysis

- **Forced-crossing positional SD:** 1.71
- **Non-forced positional SD:** 0.52
- **Forced lower variance:** **NO**


## 7. Predictions Summary

| # | Prediction | Result |
|---|------------|--------|
| 1 | Peak-detection contrast > 0.05, CI excludes zero | CONFIRMED (0.3450) |
| 2 | Peak exceeds fixed-midpoint by >=0.03 | CONFIRMED (diff=0.4250) |
| 3 | Heat at positions 2-3 on sun->desert | modal=1 (IN RANGE) |
| 4 | Germination at positions 3-5 on seed->garden | modal=1 (OUT) |
| 5 | Sadness at positions 4-6 on emotion->melancholy | modal=2 (OUT) |
| 6 | Modal position correlates with distance ratio (r > 0.50) | r=0.239 |
| 7 | FC bridge SD < 0.8 | SD=1.71 (NOT CONFIRMED) |
| 8 | Claude lowest positional variance | lowest=gpt (1.20) |
