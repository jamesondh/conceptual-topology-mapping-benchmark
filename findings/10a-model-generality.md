# Phase 10A: Model Generality Findings

> Generated: 2026-03-06T13:04:52.272Z

## 1. Experiment Overview

- **New models tested:** qwen, minimax, llama, kimi
- **Original models:** claude, gpt, grok, gemini
- **Pairs:** 12
- **Total new runs:** 720
- **Reliable new models:** 4

## 2. Model Reliability Reports

| Model | Status | Connectivity | Parse Rate | Median Latency (ms) | Format | Reason |
|-------|--------|-------------|------------|--------------------|---------|---------| 
| Qwen 3.5 397B-A17B | reliable | 1.00 | 1.00 | 57667 | semantic | - |
| MiniMax M2.5 | reliable | 1.00 | 1.00 | 28882 | semantic | - |
| Llama 3.1 8B Instruct | reliable | 1.00 | 1.00 | 1455 | semantic | - |
| GLM 5 | unavailable | 0.67 | 0.67 | 68732 | semantic | Latency too high: p50=68732ms > 60000ms (initial run); upstream 429 rate-limited on patient retry |
| Moonshot Kimi K2.5 | reliable | 1.00 | 1.00 | 78784 | semantic | - |

## 3. Gait Profiles (R1 Replication)

| Model | Mean Intra-Model Jaccard | 95% CI | New? |
|-------|------------------------|--------|------|
| Claude Sonnet 4.6 | 0.578 | [0.578, 0.578] | no |
| GPT-5.2 | 0.258 | [0.258, 0.258] | no |
| Grok 4.1 Fast | 0.293 | [0.293, 0.293] | no |
| Gemini 3 Flash | 0.372 | [0.372, 0.372] | no |
| Qwen 3.5 397B-A17B | 0.508 | [0.435, 0.580] | yes |
| MiniMax M2.5 | 0.419 | [0.298, 0.546] | yes |
| Llama 3.1 8B Instruct | 0.298 | [0.207, 0.403] | yes |
| Moonshot Kimi K2.5 | 0.414 | [0.328, 0.507] | yes |

### Gait per pair

| Model | music-mathematics | light-color | animal-poodle | emotion-melancholy | hot-cold | hide-shoe | seed-garden | stapler-monsoon |
|-------|------|------|------|------|------|------|------|------|
| qwen | 0.374 | 0.473 | 0.626 | 0.641 | 0.541 | 0.560 | 0.520 | 0.331 |
| minimax | 0.267 | 0.285 | 0.431 | 0.643 | 0.711 | 0.201 | 0.547 | 0.266 |
| llama | 0.403 | 0.322 | 0.501 | 0.466 | 0.170 | 0.101 | 0.223 | 0.194 |
| kimi | 0.270 | 0.324 | 0.500 | 0.660 | 0.543 | 0.301 | 0.398 | 0.317 |

## 4. Asymmetry Results (R2 Replication)

| Model | Mean Asymmetry | 95% CI | > 0.60? |
|-------|---------------|--------|---------|
| qwen | 0.662 | [0.553, 0.761] | **YES** |
| minimax | 0.638 | [0.481, 0.759] | **YES** |
| llama | 0.785 | [0.708, 0.847] | **YES** |
| kimi | 0.684 | [0.545, 0.837] | **YES** |

### Asymmetry per pair

| Model | Pair | Asymmetry Index | 95% CI |
|-------|------|----------------|--------|
| qwen | music-mathematics | 0.691 | [0.673, 0.711] |
| qwen | light-color | 0.784 | [0.771, 0.796] |
| qwen | animal-poodle | 0.476 | [0.468, 0.485] |
| qwen | emotion-melancholy | 0.696 | [0.686, 0.705] |
| minimax | music-mathematics | 0.754 | [0.735, 0.773] |
| minimax | light-color | 0.765 | [0.749, 0.780] |
| minimax | animal-poodle | 0.642 | [0.615, 0.671] |
| minimax | emotion-melancholy | 0.390 | [0.366, 0.414] |
| llama | music-mathematics | 0.667 | [0.650, 0.684] |
| llama | light-color | 0.865 | [0.853, 0.878] |
| llama | animal-poodle | 0.830 | [0.816, 0.843] |
| llama | emotion-melancholy | 0.778 | [0.760, 0.795] |
| kimi | music-mathematics | 0.851 | [0.840, 0.864] |
| kimi | light-color | 0.795 | [0.785, 0.805] |
| kimi | animal-poodle | 0.468 | [0.451, 0.486] |
| kimi | emotion-melancholy | 0.622 | [0.610, 0.634] |

## 5. Bridge Frequency Matrix (R6 Replication)

| Pair | Model | Expected Bridge | Bridge Freq | 95% CI | Runs |
|------|-------|-----------------|------------|--------|------|
| p10a-music-mathematics | qwen | harmony | 0.733 | [0.533, 0.933] | 15 |
| p10a-music-mathematics | minimax | harmony | 0.800 | [0.533, 1.000] | 15 |
| p10a-music-mathematics | llama | harmony | 0.000 | [0.000, 0.000] | 15 |
| p10a-music-mathematics | kimi | harmony | 0.800 | [0.600, 1.000] | 15 |
| p10a-light-color | qwen | spectrum | 1.000 | [1.000, 1.000] | 15 |
| p10a-light-color | minimax | spectrum | 0.933 | [0.800, 1.000] | 15 |
| p10a-light-color | llama | spectrum | 0.267 | [0.067, 0.533] | 15 |
| p10a-light-color | kimi | spectrum | 0.933 | [0.800, 1.000] | 15 |
| p10a-animal-poodle | qwen | dog | 1.000 | [1.000, 1.000] | 15 |
| p10a-animal-poodle | minimax | dog | 1.000 | [1.000, 1.000] | 15 |
| p10a-animal-poodle | llama | dog | 0.067 | [0.000, 0.200] | 15 |
| p10a-animal-poodle | kimi | dog | 1.000 | [1.000, 1.000] | 15 |
| p10a-emotion-melancholy | qwen | sadness | 0.933 | [0.800, 1.000] | 15 |
| p10a-emotion-melancholy | minimax | sadness | 1.000 | [1.000, 1.000] | 15 |
| p10a-emotion-melancholy | llama | sadness | 0.067 | [0.000, 0.200] | 15 |
| p10a-emotion-melancholy | kimi | sadness | 1.000 | [1.000, 1.000] | 15 |
| p10a-hot-cold | qwen | warm | 1.000 | [1.000, 1.000] | 15 |
| p10a-hot-cold | minimax | warm | 1.000 | [1.000, 1.000] | 15 |
| p10a-hot-cold | llama | warm | 0.733 | [0.467, 0.933] | 15 |
| p10a-hot-cold | kimi | warm | 1.000 | [1.000, 1.000] | 15 |
| p10a-hide-shoe | qwen | leather | 1.000 | [1.000, 1.000] | 15 |
| p10a-hide-shoe | minimax | leather | 0.667 | [0.400, 0.867] | 15 |
| p10a-hide-shoe | llama | leather | 0.133 | [0.000, 0.333] | 15 |
| p10a-hide-shoe | kimi | leather | 0.933 | [0.800, 1.000] | 15 |
| p10a-seed-garden | qwen | germination | 0.133 | [0.000, 0.333] | 15 |
| p10a-seed-garden | minimax | germination | 0.933 | [0.800, 1.000] | 15 |
| p10a-seed-garden | llama | germination | 0.133 | [0.000, 0.333] | 15 |
| p10a-seed-garden | kimi | germination | 1.000 | [1.000, 1.000] | 15 |
| p10a-stapler-monsoon | qwen | none | 0.000 | [0.000, 0.000] | 15 |
| p10a-stapler-monsoon | minimax | none | 0.000 | [0.000, 0.000] | 15 |
| p10a-stapler-monsoon | llama | none | 0.000 | [0.000, 0.000] | 15 |
| p10a-stapler-monsoon | kimi | none | 0.000 | [0.000, 0.000] | 15 |

## 6. Control Validation (R5: stapler-monsoon)

| Model | Top Waypoint | Top Frequency | Unique Waypoints | Passes? |
|-------|-------------|---------------|------------------|---------|
| qwen | cloud | 0.867 | 27 | no |
| minimax | paper | 0.933 | 38 | no |
| llama | office | 0.800 | 47 | no |
| kimi | paper | 0.933 | 30 | no |

## 7. Cohort Comparison (PRIMARY TEST)

- **New cohort mean bridge frequency:** 0.721 [0.633, 0.802]
- **Original cohort mean bridge frequency:** 0.817 [0.683, 0.930]
- **Difference (new - original):** -0.096 [-0.241, 0.064]
- **CI includes zero:** **YES** (no significant difference)

The new model cohort produces bridge frequencies statistically indistinguishable from the original 4-model cohort. Core bridge bottleneck structure (R6) generalizes to new models.

## 8. Pairwise Model Similarity

| Model A | Model B | Mean Pairwise Jaccard |
|---------|---------|----------------------|
| claude | gpt | 0.261 |
| claude | grok | 0.256 |
| claude | gemini | 0.283 |
| claude | qwen | 0.338 |
| claude | minimax | 0.251 |
| claude | llama | 0.184 |
| claude | kimi | 0.316 |
| gpt | grok | 0.240 |
| gpt | gemini | 0.188 |
| gpt | qwen | 0.228 |
| gpt | minimax | 0.284 |
| gpt | llama | 0.126 |
| gpt | kimi | 0.236 |
| grok | gemini | 0.197 |
| grok | qwen | 0.321 |
| grok | minimax | 0.260 |
| grok | llama | 0.147 |
| grok | kimi | 0.285 |
| gemini | qwen | 0.221 |
| gemini | minimax | 0.186 |
| gemini | llama | 0.124 |
| gemini | kimi | 0.251 |
| qwen | minimax | 0.275 |
| qwen | llama | 0.174 |
| qwen | kimi | 0.358 |
| minimax | llama | 0.154 |
| minimax | kimi | 0.294 |
| llama | kimi | 0.151 |

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
| 1 | >= 3 of 5 new models pass reliability gate | confirmed | 4 of 5 reliable |
| 2 | Each reliable new model shows characteristic gait (Jaccard 0.15-0.70) | confirmed | 4 of 4 in range |
| 3 | All reliable new models show asymmetry index > 0.60 | confirmed | 4 of 4 above 0.60 |
| 4 | Control pair stapler-monsoon has no waypoint > 0.10 for any model | not confirmed | 0 of 4 pass |
| 5 | Cohort comparison CI includes zero (bridge structure generalizes) | confirmed | diff=-0.096 [-0.241, 0.064] |
| 6 | >= 5 of 7 non-control pairs show mean bridge freq > 0.40 in new cohort | confirmed | 7 of 7 pairs above 0.40 |
| 7 | Cross-model Jaccard involving new models > 0.10 | confirmed | mean cross-model Jaccard = 0.235 |
| 8 | Llama 8B shows lowest intra-model Jaccard (scale effect) | not confirmed | Llama gait=0.298, lowest=false |

## 11. Summary of Key Findings

- **Predictions confirmed:** 6 of 8
- **Predictions not confirmed:** 2
- **Insufficient data:** 0

### Core structural findings generality:

- **R1 (Gait):** New models show intra-model Jaccard range 0.298-0.508. Each model has a characteristic consistency level.
- **R2 (Asymmetry):** 4 of 4 reliable new models show asymmetry index > 0.60.
- **R5 (Controls):** 0 of 4 models pass the random control validation.
- **R6 (Bridge bottlenecks):** Cohort comparison CI includes zero: true. Bridge structure generalizes.
