# Phase 8C: Gait-Normalized Distance Findings

> Generated: 2026-03-05T04:23:07.686Z

## 1. Experiment Overview

- **Reference pairs:** 8 (p8c-ref-hot-cold, p8c-ref-cat-dog, p8c-ref-music-mathematics, p8c-ref-loan-shore, p8c-ref-science-art, p8c-ref-brain-computer, p8c-ref-spark-telescope, p8c-ref-mountain-library)
- **Test pairs:** 8 (p8c-test-sun-desert, p8c-test-seed-garden, p8c-test-emotion-melancholy, p8c-test-light-color, p8c-test-question-answer, p8c-test-winter-summer, p8c-test-ocean-mountain, p8c-test-caterpillar-butterfly)
- **Models:** claude, gpt, grok, gemini
- **New runs:** 500
- **Reused runs:** 960

Data sources:
- `results/gait-norm/` (dedicated 7-waypoint distance collection)
- `results/fragility/` (Phase 8A salience data, shared pairs)
- Note: `results/salience/` (Phase 6A, 5 waypoints) NOT used -- incompatible waypoint count

## 2. Raw Distance Matrix

| Pair | Role | claude d(raw) | gpt d(raw) | grok d(raw) | gemini d(raw) | claude runs | gpt runs | grok runs | gemini runs |
|------|------|--------|--------|--------|--------|--------|--------|--------|--------|
| p8c-ref-hot-cold | reference | 0.089 | 0.498 | 0.393 | 0.290 | 10 | 10 | 10 | 10 |
| p8c-ref-cat-dog | reference | 0.343 | 0.792 | 0.638 | 0.915 | 15 | 15 | 15 | 15 |
| p8c-ref-music-mathematics | reference | 0.428 | 0.754 | 0.520 | 0.401 | 10 | 10 | 10 | 10 |
| p8c-ref-loan-shore | reference | 0.089 | 0.648 | 0.684 | 0.381 | 10 | 10 | 10 | 10 |
| p8c-ref-science-art | reference | 0.471 | 0.738 | 0.641 | 0.741 | 20 | 20 | 20 | 20 |
| p8c-ref-brain-computer | reference | 0.342 | 0.580 | 0.498 | 0.605 | 20 | 20 | 20 | 20 |
| p8c-ref-spark-telescope | reference | 0.515 | 0.685 | 0.802 | 0.624 | 15 | 15 | 15 | 15 |
| p8c-ref-mountain-library | reference | 0.697 | 0.838 | 0.774 | 0.353 | 15 | 15 | 15 | 15 |
| p8c-test-sun-desert | test | 0.206 | 0.345 | 0.615 | 0.375 | 10 | 10 | 10 | 10 |
| p8c-test-seed-garden | test | 0.129 | 0.532 | 0.497 | 0.368 | 10 | 10 | 10 | 10 |
| p8c-test-emotion-melancholy | test | 0.050 | 0.332 | 0.382 | 0.389 | 10 | 10 | 10 | 10 |
| p8c-test-light-color | test | 0.158 | 0.628 | 0.816 | 0.225 | 10 | 10 | 10 | 10 |
| p8c-test-question-answer | test | 0.550 | 0.747 | 0.741 | 0.461 | 20 | 20 | 20 | 20 |
| p8c-test-winter-summer | test | 0.468 | 0.748 | 0.925 | 0.273 | 20 | 20 | 20 | 20 |
| p8c-test-ocean-mountain | test | 0.429 | 0.441 | 0.449 | 0.664 | 20 | 20 | 20 | 20 |
| p8c-test-caterpillar-butterfly | test | 0.172 | 0.881 | 0.707 | 0.423 | 10 | 10 | 10 | 10 |

## 3. Model Baselines

Each model's baseline is the mean raw distance across the 8 reference pairs.
Lower baseline = tighter waypoint agreement = shorter "gait length".

| Model | Baseline | Interpretation |
|-------|----------|----------------|
| claude | 0.372 | Short gait (high within-run consistency) |
| gemini | 0.539 | Medium gait |
| grok | 0.619 | Long gait (lower consistency) |
| gpt | 0.692 | Long gait (lower consistency) |

## 4. Raw Cross-Model Correlation

Pearson r on raw test distances between model pairs:

| Model A | Model B | r (raw) |
|---------|---------|---------|
| claude | gpt | 0.381 |
| claude | grok | 0.437 |
| claude | gemini | 0.350 |
| gpt | grok | 0.732 |
| gpt | gemini | -0.210 |
| grok | gemini | -0.580 |

**Fisher-z aggregate r (raw):** 0.212

## 5. Normalized Cross-Model Correlation (PRIMARY TEST)

After dividing each test distance by the model's baseline:

| Model A | Model B | r (normalized) |
|---------|---------|----------------|
| claude | gpt | 0.381 |
| claude | grok | 0.437 |
| claude | gemini | 0.350 |
| gpt | grok | 0.732 |
| gpt | gemini | -0.210 |
| grok | gemini | -0.580 |

**Fisher-z aggregate r (normalized):** 0.212 [-0.167, 0.705]

**Primary test passes:** **NO**

Normalization does not improve cross-model agreement.
Model-independent geometry is definitively blocked -- the disagreement is structural, not merely a gait artifact.

## 6. Per-Model-Pair Correlations (Before and After Normalization)

| Model A | Model B | r (raw) | r (normalized) | Improvement |
|---------|---------|---------|----------------|-------------|
| claude | gpt | 0.381 | 0.381 | -0.000 |
| claude | grok | 0.437 | 0.437 | -0.000 |
| claude | gemini | 0.350 | 0.350 | +0.000 |
| gpt | grok | 0.732 | 0.732 | -0.000 |
| gpt | gemini | -0.210 | -0.210 | +0.000 |
| grok | gemini | -0.580 | -0.580 | +0.000 |

## 7. Rank-Order Stability

- **Raw Spearman aggregate:** 0.287
- **Normalized Spearman aggregate:** 0.287
- **Improvement from normalization:** +0.000

Rank-order stability does not improve after normalization.

## 8. Residual Analysis

Test pairs ranked by maximum model disagreement in normalized distance:

| Pair | Max Disagreement | Models |
|------|-----------------|--------|
| p8c-test-winter-summer | 0.988 | grok vs gemini |
| p8c-test-light-color | 0.902 | grok vs gemini |
| p8c-test-caterpillar-butterfly | 0.810 | claude vs gpt |
| p8c-test-question-answer | 0.623 | claude vs gemini |
| p8c-test-ocean-mountain | 0.596 | gpt vs gemini |
| p8c-test-emotion-melancholy | 0.588 | claude vs gemini |
| p8c-test-sun-desert | 0.496 | gpt vs grok |
| p8c-test-seed-garden | 0.457 | claude vs grok |

## 9. Conditional Curvature Re-estimation

Curvature re-estimation was **not attempted** because the primary test did not pass (normalized r <= 0.50) or curvature data was unavailable.

## 10. Predictions Summary

| # | Prediction | Result | Value |
|---|------------|--------|-------|
| 1 | Raw cross-model correlation r < 0.30 (replicates Phase 7B) | confirmed | r=0.212 |
| 2 | Claude baseline lowest (< 0.40), GPT/Grok highest (> 0.60) | confirmed | claude=0.372, gpt=0.692, grok=0.619, claude_lowest=true |
| 3 | Normalized cross-model correlation r > 0.50, CI lower > 0.30 (PRIMARY) | not confirmed | r=0.212 [-0.167, 0.705] |
| 4 | Normalization improvement >= 0.25 (normalized r - raw r) | not confirmed | improvement=-0.000 (0.212 -> 0.212) |
| 5 | Claude-GPT raw correlation lowest; normalization improves it most | not confirmed | claude-gpt raw r=0.381, norm r=0.381, improvement=-0.000, lowest_raw=false, most_improved=true |
| 6 | Spearman rank correlation improves after normalization | not confirmed | raw_spearman=0.287, norm_spearman=0.287, improvement=0.000 |
| 7 | If primary passes: polysemous excess remains non-significant under normalization | insufficient data | primary test did not pass; prediction is conditional |
| 8 | If primary fails: model-independent geometry definitively blocked | confirmed | norm_r=0.212, CI_lower=-0.167 |
