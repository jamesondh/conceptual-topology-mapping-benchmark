# Phase 7B: Curvature Estimation Findings

> Generated: 2026-03-04T23:58:58.651Z

## 1. Experiment Overview

- **Triangles analyzed:** 8
- **Models:** claude, gpt, grok, gemini
- **New runs:** 800
- **Reused runs:** 480
- **Triangle-model combinations:** 32

## 2. Distance Matrix

| Triangle | Model | d(A,B) | d(B,C) | d(A,C) | Runs AB | Runs BC | Runs AC |
|----------|-------|--------|--------|--------|---------|---------|---------|
| p7b-loan-bank-river | claude | 0.244 | 0.383 | 0.067 | 10 | 10 | 10 |
| p7b-loan-bank-river | gpt | 0.467 | 0.844 | 0.719 | 10 | 10 | 10 |
| p7b-loan-bank-river | grok | 0.596 | 0.683 | 0.580 | 10 | 10 | 10 |
| p7b-loan-bank-river | gemini | 0.457 | 0.170 | 0.067 | 10 | 10 | 10 |
| p7b-deposit-bank-shore | claude | 0.215 | 0.156 | 0.629 | 10 | 10 | 10 |
| p7b-deposit-bank-shore | gpt | 0.637 | 0.786 | 0.663 | 10 | 10 | 10 |
| p7b-deposit-bank-shore | grok | 0.783 | 0.641 | 0.603 | 10 | 10 | 10 |
| p7b-deposit-bank-shore | gemini | 0.375 | 0.384 | 0.308 | 10 | 10 | 10 |
| p7b-photon-light-heavy | claude | 0.000 | 0.317 | 0.307 | 10 | 10 | 20 |
| p7b-photon-light-heavy | gpt | 0.729 | 0.745 | 0.723 | 10 | 10 | 20 |
| p7b-photon-light-heavy | grok | 0.608 | 0.632 | 0.807 | 10 | 10 | 20 |
| p7b-photon-light-heavy | gemini | 0.306 | 0.749 | 0.490 | 10 | 10 | 20 |
| p7b-candle-light-feather | claude | 0.183 | 0.628 | 0.305 | 10 | 10 | 10 |
| p7b-candle-light-feather | gpt | 0.334 | 0.724 | 0.475 | 10 | 10 | 10 |
| p7b-candle-light-feather | grok | 0.612 | 0.646 | 0.604 | 10 | 10 | 10 |
| p7b-candle-light-feather | gemini | 0.170 | 0.383 | 0.262 | 10 | 10 | 10 |
| p7b-sun-heat-desert | claude | 0.215 | 0.181 | 0.302 | 10 | 10 | 40 |
| p7b-sun-heat-desert | gpt | 0.699 | 0.330 | 0.436 | 10 | 10 | 40 |
| p7b-sun-heat-desert | grok | 0.635 | 0.513 | 0.377 | 10 | 10 | 40 |
| p7b-sun-heat-desert | gemini | 0.472 | 0.290 | 0.358 | 10 | 10 | 40 |
| p7b-seed-germination-garden | claude | 0.423 | 0.000 | 0.000 | 10 | 10 | 10 |
| p7b-seed-germination-garden | gpt | 0.729 | 0.374 | 0.524 | 10 | 10 | 10 |
| p7b-seed-germination-garden | grok | 0.788 | 0.732 | 0.540 | 10 | 10 | 10 |
| p7b-seed-germination-garden | gemini | 0.000 | 0.335 | 0.382 | 10 | 10 | 10 |
| p7b-music-harmony-mathematics | claude | 0.335 | 0.200 | 0.407 | 10 | 10 | 40 |
| p7b-music-harmony-mathematics | gpt | 0.392 | 0.850 | 0.670 | 10 | 10 | 40 |
| p7b-music-harmony-mathematics | grok | 0.450 | 0.794 | 0.717 | 10 | 10 | 40 |
| p7b-music-harmony-mathematics | gemini | 0.170 | 0.178 | 0.530 | 10 | 10 | 40 |
| p7b-word-sentence-paragraph | claude | 0.316 | 0.368 | 0.352 | 10 | 10 | 20 |
| p7b-word-sentence-paragraph | gpt | 0.536 | 0.904 | 0.424 | 10 | 10 | 20 |
| p7b-word-sentence-paragraph | grok | 0.502 | 0.685 | 0.557 | 10 | 10 | 20 |
| p7b-word-sentence-paragraph | gemini | 0.248 | 0.305 | 0.242 | 10 | 10 | 20 |

## 3. Triangle Inequality Compliance

- **Total triangle-model combinations:** 32
- **Holding (d(A,C) <= d(A,B) + d(B,C)):** 29
- **Compliance rate:** 90.6%

Triangle inequality holds for the vast majority of combinations, consistent with Phase 3B (91%).

## 4. Curvature Estimates (Triangle Excess)

| Triangle | Vertex Type | Model | Excess | TI Holds |
|----------|-------------|-------|--------|----------|
| p7b-loan-bank-river | polysemous | claude | 0.5608 | yes |
| p7b-loan-bank-river | polysemous | gpt | 0.5917 | yes |
| p7b-loan-bank-river | polysemous | grok | 0.6994 | yes |
| p7b-loan-bank-river | polysemous | gemini | 0.5608 | yes |
| p7b-deposit-bank-shore | polysemous | claude | -0.2584 | NO |
| p7b-deposit-bank-shore | polysemous | gpt | 0.7595 | yes |
| p7b-deposit-bank-shore | polysemous | grok | 0.8207 | yes |
| p7b-deposit-bank-shore | polysemous | gemini | 0.4508 | yes |
| p7b-photon-light-heavy | polysemous | claude | 0.0103 | yes |
| p7b-photon-light-heavy | polysemous | gpt | 0.7514 | yes |
| p7b-photon-light-heavy | polysemous | grok | 0.4325 | yes |
| p7b-photon-light-heavy | polysemous | gemini | 0.5649 | yes |
| p7b-candle-light-feather | polysemous | claude | 0.5058 | yes |
| p7b-candle-light-feather | polysemous | gpt | 0.5838 | yes |
| p7b-candle-light-feather | polysemous | grok | 0.6541 | yes |
| p7b-candle-light-feather | polysemous | gemini | 0.2910 | yes |
| p7b-sun-heat-desert | non-polysemous | claude | 0.0940 | yes |
| p7b-sun-heat-desert | non-polysemous | gpt | 0.5928 | yes |
| p7b-sun-heat-desert | non-polysemous | grok | 0.7712 | yes |
| p7b-sun-heat-desert | non-polysemous | gemini | 0.4041 | yes |
| p7b-seed-germination-garden | non-polysemous | claude | 0.4233 | yes |
| p7b-seed-germination-garden | non-polysemous | gpt | 0.5780 | yes |
| p7b-seed-germination-garden | non-polysemous | grok | 0.9801 | yes |
| p7b-seed-germination-garden | non-polysemous | gemini | -0.0468 | NO |
| p7b-music-harmony-mathematics | non-polysemous | claude | 0.1285 | yes |
| p7b-music-harmony-mathematics | non-polysemous | gpt | 0.5710 | yes |
| p7b-music-harmony-mathematics | non-polysemous | grok | 0.5274 | yes |
| p7b-music-harmony-mathematics | non-polysemous | gemini | -0.1820 | NO |
| p7b-word-sentence-paragraph | non-polysemous | claude | 0.3330 | yes |
| p7b-word-sentence-paragraph | non-polysemous | gpt | 1.0162 | yes |
| p7b-word-sentence-paragraph | non-polysemous | grok | 0.6298 | yes |
| p7b-word-sentence-paragraph | non-polysemous | gemini | 0.3105 | yes |

## 5. Primary Test: Polysemous vs Non-Polysemous Excess

- **Polysemous mean excess:** 0.4987 [0.3492, 0.6143]
- **Non-polysemous mean excess:** 0.4457 [0.2825, 0.6066]
- **Difference (poly - non-poly):** 0.0530 [-0.1574, 0.2625]
- **Significantly greater:** **NO**

Polysemous triangles show higher excess than non-polysemous, but the difference is not statistically significant (CI includes zero).

## 6. Distance Metric Validity

- **Semantic distance correlation:** not computed (no ground-truth semantic distances)
- **Cross-model distance correlation:** r = 0.170 (FAIL, threshold r > 0.50)
- **Distance metric valid:** **NO**

## 7. Per-Model Curvature Profiles

| Model | Polysemous Mean Excess | Non-Polysemous Mean Excess | Overall Mean Excess |
|-------|------------------------|----------------------------|---------------------|
| claude | 0.2046 | 0.2447 | 0.2247 |
| gpt | 0.6716 | 0.6895 | 0.6805 |
| grok | 0.6517 | 0.7271 | 0.6894 |
| gemini | 0.4669 | 0.1215 | 0.2942 |

## 8. Predictions Summary

| # | Prediction | Result | Value |
|---|------------|--------|-------|
| 1 | Triangle inequality compliance >= 85% (replicating Phase 3B ~91%) | confirmed | 90.6% |
| 2 | Polysemous mean excess > non-polysemous mean excess (CI excludes zero) | not confirmed | diff=0.0530 [-0.1574, 0.2625] |
| 3 | Cross-model distance correlation r > 0.50 | not confirmed | r=0.170 |
| 4 | Mean polysemous excess > 0.10 (substantial curvature from homonyms) | confirmed | 0.4987 |
| 5 | At least one model shows polysemous excess > 2x non-polysemous excess | confirmed | gemini |
| 6 | Gemini shows highest overall mean excess (most curvature) | not confirmed | highest=grok (0.6894) |
