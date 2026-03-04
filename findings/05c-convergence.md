# Phase 5C: Triple-Anchor Convergence Findings

> Generated: 2026-03-04T16:39:11.602Z

## 1. Experiment Overview

- **Pairs analyzed:** 8
- **Models:** claude, gpt, grok, gemini
- **Waypoint count:** 7
- **Total runs loaded:** 640
- **Profile entries:** 32

## 2. Per-Pair Convergence Profiles

| Pair | Model | P1 | P2 | P3 | P4 | P5 | P6 | P7 | W-Shape Contrast |
|------|-------|----|----|----|----|----|----|----|-----------------|
| p5c-light-color | claude | 0.000 | 0.000 | 0.200 | 0.500 | 0.100 | 0.100 | 0.000 | 0.3500 |
| p5c-light-color | gpt | 0.210 | 0.130 | 0.080 | 0.090 | 0.040 | 0.010 | 0.320 | 0.0300 |
| p5c-light-color | grok | 0.020 | 0.030 | 0.030 | 0.060 | 0.000 | 0.000 | 0.000 | 0.0450 |
| p5c-light-color | gemini | 0.000 | 0.030 | 0.100 | 0.000 | 0.000 | 0.000 | 0.310 | -0.0500 |
| p5c-bank-savings | claude | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.0000 |
| p5c-bank-savings | gpt | 0.140 | 0.000 | 0.130 | 0.090 | 0.000 | 0.000 | 0.000 | 0.0250 |
| p5c-bank-savings | grok | 0.000 | 0.000 | 0.000 | 0.050 | 0.000 | 0.020 | 0.000 | 0.0500 |
| p5c-bank-savings | gemini | 0.200 | 0.000 | 0.900 | 0.000 | 0.020 | 0.140 | 0.010 | -0.4600 |
| p5c-animal-poodle | claude | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.0000 |
| p5c-animal-poodle | gpt | 0.280 | 0.280 | 0.280 | 0.290 | 0.410 | 0.310 | 0.280 | -0.0550 |
| p5c-animal-poodle | grok | 0.120 | 0.120 | 0.080 | 0.020 | 0.010 | 0.090 | 0.300 | -0.0250 |
| p5c-animal-poodle | gemini | 0.180 | 0.730 | 0.450 | 0.370 | 0.000 | 0.000 | 0.000 | 0.1450 |
| p5c-tree-ecosystem | claude | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.100 | 0.0000 |
| p5c-tree-ecosystem | gpt | 0.000 | 0.000 | 0.040 | 0.020 | 0.030 | 0.000 | 0.020 | -0.0150 |
| p5c-tree-ecosystem | grok | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.010 | 0.020 | 0.0000 |
| p5c-tree-ecosystem | gemini | 0.000 | 0.000 | 0.000 | 0.000 | 0.010 | 0.000 | 0.000 | -0.0050 |
| p5c-language-thought | claude | 0.000 | 0.030 | 0.040 | 0.090 | 0.080 | 0.000 | 0.200 | 0.0300 |
| p5c-language-thought | gpt | 0.000 | 0.000 | 0.000 | 0.030 | 0.000 | 0.010 | 0.000 | 0.0300 |
| p5c-language-thought | grok | 0.000 | 0.000 | 0.030 | 0.000 | 0.020 | 0.040 | 0.020 | -0.0250 |
| p5c-language-thought | gemini | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.0000 |
| p5c-hot-cold | claude | 0.000 | 0.000 | 0.000 | 0.040 | 0.000 | 0.000 | 0.000 | 0.0400 |
| p5c-hot-cold | gpt | 0.120 | 0.210 | 0.290 | 0.070 | 0.120 | 0.440 | 0.360 | -0.1350 |
| p5c-hot-cold | grok | 0.000 | 0.000 | 0.020 | 0.110 | 0.020 | 0.010 | 0.030 | 0.0900 |
| p5c-hot-cold | gemini | 0.100 | 0.000 | 0.000 | 0.010 | 0.000 | 0.000 | 0.000 | 0.0100 |
| p5c-music-mathematics | claude | 0.000 | 0.100 | 0.100 | 0.600 | 0.060 | 0.090 | 0.000 | 0.5200 |
| p5c-music-mathematics | gpt | 0.180 | 0.040 | 0.010 | 0.120 | 0.070 | 0.000 | 0.000 | 0.0800 |
| p5c-music-mathematics | grok | 0.370 | 0.180 | 0.180 | 0.100 | 0.110 | 0.000 | 0.000 | -0.0450 |
| p5c-music-mathematics | gemini | 0.000 | 0.000 | 0.010 | 0.060 | 0.000 | 0.000 | 0.030 | 0.0550 |
| p5c-telescope-jealousy | claude | 0.000 | 0.000 | 0.000 | 0.200 | 0.000 | 0.060 | 0.050 | 0.2000 |
| p5c-telescope-jealousy | gpt | 0.280 | 0.040 | 0.100 | 0.030 | 0.050 | 0.130 | 0.280 | -0.0450 |
| p5c-telescope-jealousy | grok | 0.250 | 0.060 | 0.000 | 0.000 | 0.000 | 0.080 | 0.250 | 0.0000 |
| p5c-telescope-jealousy | gemini | 0.000 | 0.000 | 0.010 | 0.000 | 0.000 | 0.000 | 0.070 | -0.0050 |

## 3. W-Shape Detection

- **Bridge-present mean W-shape contrast:** 0.0027
  - 95% CI: [-0.0787, 0.0797]
- **Bridge-absent mean W-shape contrast:** 0.0050
  - 95% CI: [-0.0387, 0.0425]
- **Difference (present - absent):** -0.0023
  - 95% CI: [-0.0983, 0.0887]
- **Significantly positive:** NO

**W-shape not confirmed:** The difference in W-shape contrast between bridge-present and bridge-absent pairs is not statistically significant. The 95% CI on the difference includes zero.

## 4. Bridge-Variable Natural Experiment

**Pair:** p5c-music-mathematics (music -> mathematics)

| Model | W-Shape Contrast | Has Bridge? |
|-------|-----------------|-------------|
| claude | 0.5200 | YES |
| gpt | 0.0800 | NO |
| grok | -0.0450 | YES |
| gemini | 0.0550 | NO |

- **Models with bridge (claude, grok) mean contrast:** 0.2375
- **Models without bridge (gpt, gemini) mean contrast:** 0.0675
- **Difference:** 0.1700

Models expected to discover a 'harmony' bridge show higher W-shape contrast than models without the bridge, consistent with the triple-anchor hypothesis.

## 5. Gemini-Specific Analysis

**Pair: tree -> ecosystem** (Gemini not expected to produce 'forest' bridge)

| Model | W-Shape Contrast | Expected Pattern |
|-------|-----------------|------------------|
| claude | 0.0000 | W-shape (bridge) |
| gpt | -0.0150 | W-shape (bridge) |
| grok | 0.0000 | W-shape (bridge) |
| gemini | -0.0050 | U-shape (no bridge) |

- **Gemini W-shape contrast:** -0.0050
- **Other models mean W-shape contrast:** -0.0050

Contrary to prediction, Gemini does not show lower W-shape contrast than other models on this pair.

## 6. Predictions Summary

| Prediction | Result |
|------------|--------|
| Bridge-present pairs have higher W-shape contrast than bridge-absent | NOT CONFIRMED |
| music->mathematics: bridge-models show higher W-shape | CONFIRMED |
| Gemini shows U-shape (lower contrast) on tree->ecosystem | NOT CONFIRMED |
| No-bridge-control pairs show near-zero W-shape contrast | CONFIRMED (mean: 0.0375) |
