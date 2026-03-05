# Phase 10A: Model Generality Findings

> Generated: 2026-03-05T22:19:50.018Z

## 1. Experiment Overview

- **New models tested:** llama
- **Original models:** claude, gpt, grok, gemini
- **Pairs:** 12
- **Total new runs:** 180
- **Reliable new models:** 1

## 2. Model Reliability Reports

| Model | Status | Connectivity | Parse Rate | Median Latency (ms) | Format | Reason |
|-------|--------|-------------|------------|--------------------|---------|---------| 
| Qwen 3.5 397B-A17B | unavailable | 1.00 | 1.00 | 101582 | semantic | Latency too high: p50=101582ms > 60000ms |
| MiniMax M2.5 | unavailable | 1.00 | 1.00 | 78899 | semantic | Latency too high: p50=78899ms > 60000ms |
| Llama 3.1 8B Instruct | reliable | 1.00 | 1.00 | 1455 | semantic | - |
| GLM 5 | unavailable | 0.67 | 0.67 | 68732 | semantic | Latency too high: p50=68732ms > 60000ms |
| Moonshot Kimi K2.5 | unavailable | 1.00 | 1.00 | 133200 | semantic | Latency too high: p50=133200ms > 60000ms |

## 3. Gait Profiles (R1 Replication)

| Model | Mean Intra-Model Jaccard | 95% CI | New? |
|-------|------------------------|--------|------|
| Claude Sonnet 4.6 | 0.578 | [0.578, 0.578] | no |
| GPT-5.2 | 0.258 | [0.258, 0.258] | no |
| Grok 4.1 Fast | 0.293 | [0.293, 0.293] | no |
| Gemini 3 Flash | 0.372 | [0.372, 0.372] | no |
| Llama 3.1 8B Instruct | 0.298 | [0.202, 0.390] | yes |

### Gait per pair

| Model | music-mathematics | light-color | animal-poodle | emotion-melancholy | hot-cold | hide-shoe | seed-garden | stapler-monsoon |
|-------|------|------|------|------|------|------|------|------|
| llama | 0.403 | 0.322 | 0.501 | 0.466 | 0.170 | 0.101 | 0.223 | 0.194 |

## 4. Asymmetry Results (R2 Replication)

| Model | Mean Asymmetry | 95% CI | > 0.60? |
|-------|---------------|--------|---------|
| llama | 0.785 | [0.708, 0.847] | **YES** |

### Asymmetry per pair

| Model | Pair | Asymmetry Index | 95% CI |
|-------|------|----------------|--------|
| llama | music-mathematics | 0.667 | [0.651, 0.684] |
| llama | light-color | 0.865 | [0.852, 0.877] |
| llama | animal-poodle | 0.830 | [0.817, 0.842] |
| llama | emotion-melancholy | 0.778 | [0.760, 0.795] |

## 5. Bridge Frequency Matrix (R6 Replication)

| Pair | Model | Expected Bridge | Bridge Freq | 95% CI | Runs |
|------|-------|-----------------|------------|--------|------|
| p10a-music-mathematics | llama | harmony | 0.000 | [0.000, 0.000] | 15 |
| p10a-light-color | llama | spectrum | 0.267 | [0.067, 0.533] | 15 |
| p10a-animal-poodle | llama | dog | 0.067 | [0.000, 0.200] | 15 |
| p10a-emotion-melancholy | llama | sadness | 0.067 | [0.000, 0.200] | 15 |
| p10a-hot-cold | llama | warm | 0.733 | [0.467, 0.933] | 15 |
| p10a-hide-shoe | llama | leather | 0.133 | [0.000, 0.333] | 15 |
| p10a-seed-garden | llama | germination | 0.133 | [0.000, 0.333] | 15 |
| p10a-stapler-monsoon | llama | none | 0.000 | [0.000, 0.000] | 15 |

## 6. Control Validation (R5: stapler-monsoon)

| Model | Top Waypoint | Top Frequency | Unique Waypoints | Passes? |
|-------|-------------|---------------|------------------|---------|
| llama | office | 0.800 | 47 | no |

## 7. Cohort Comparison (PRIMARY TEST)

- **New cohort mean bridge frequency:** 0.200 [0.067, 0.390]
- **Original cohort mean bridge frequency:** 0.817 [0.681, 0.937]
- **Difference (new - original):** -0.617 [-0.805, -0.383]
- **CI includes zero:** **NO** (significant difference)

The new model cohort shows a statistically significant difference from the original cohort. The direction and magnitude of this difference should be examined carefully.

## 8. Pairwise Model Similarity

| Model A | Model B | Mean Pairwise Jaccard |
|---------|---------|----------------------|
| claude | gpt | 0.261 |
| claude | grok | 0.256 |
| claude | gemini | 0.283 |
| claude | llama | 0.184 |
| gpt | grok | 0.240 |
| gpt | gemini | 0.188 |
| gpt | llama | 0.126 |
| grok | gemini | 0.197 |
| grok | llama | 0.147 |
| gemini | llama | 0.124 |

## 9. Scale Effect (Llama 8B)

- **Llama reliable:** yes
- **Llama gait Jaccard:** 0.298
- **Llama mean bridge freq:** 0.200
- **Llama mean asymmetry:** 0.785
- **Lowest gait among all models:** no
- **Highest entropy among all models:** no

## 10. Predictions Summary

| # | Prediction | Result | Value |
|---|------------|--------|-------|
| 1 | >= 3 of 5 new models pass reliability gate | not confirmed | 1 of 5 reliable |
| 2 | Each reliable new model shows characteristic gait (Jaccard 0.15-0.70) | confirmed | 1 of 1 in range |
| 3 | All reliable new models show asymmetry index > 0.60 | confirmed | 1 of 1 above 0.60 |
| 4 | Control pair stapler-monsoon has no waypoint > 0.10 for any model | not confirmed | 0 of 1 pass |
| 5 | Cohort comparison CI includes zero (bridge structure generalizes) | not confirmed | diff=-0.617 [-0.805, -0.383] |
| 6 | >= 5 of 7 non-control pairs show mean bridge freq > 0.40 in new cohort | not confirmed | 1 of 7 pairs above 0.40 |
| 7 | Cross-model Jaccard involving new models > 0.10 | confirmed | mean cross-model Jaccard = 0.145 |
| 8 | Llama 8B shows lowest intra-model Jaccard (scale effect) | not confirmed | Llama gait=0.298, lowest=false |

## 11. Summary of Key Findings

- **Predictions confirmed:** 3 of 8
- **Predictions not confirmed:** 5
- **Insufficient data:** 0

### Core structural findings generality:

- **R1 (Gait):** New models show intra-model Jaccard range 0.298-0.298. Each model has a characteristic consistency level.
- **R2 (Asymmetry):** 1 of 1 reliable new models show asymmetry index > 0.60.
- **R5 (Controls):** 0 of 1 models pass the random control validation.
- **R6 (Bridge bottlenecks):** Cohort comparison CI includes zero: false. Bridge structure may not fully generalize.
