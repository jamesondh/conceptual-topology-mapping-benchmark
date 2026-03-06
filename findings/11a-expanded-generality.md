# Phase 11A: Expanded Model Generality Findings

> Generated: 2026-03-06T18:58:35.188Z

## 1. Experiment Overview

- **Phase 11A new models tested:** mistral, deepseek, llama4, cohere
- **Phase 10A models:** qwen, minimax, llama, kimi
- **Original models:** claude, gpt, grok, gemini
- **Pairs:** 12
- **Total new runs (Phase 11A):** 720
- **Reliable Phase 11A models:** 4

## 2. Model Reliability Reports

| Model | Status | Connectivity | Parse Rate | Median Latency (ms) | Format | Reason |
|-------|--------|-------------|------------|--------------------|---------|---------| 
| Mistral Large 3 | reliable | 1.00 | 1.00 | 934 | semantic | - |
| DeepSeek V3.2 | reliable | 1.00 | 1.00 | 2542 | semantic | - |
| Llama 4 Maverick | reliable | 1.00 | 1.00 | 419 | semantic | - |
| Cohere Command A | reliable | 1.00 | 1.00 | 3147 | semantic | - |

## 3. Gait Profiles (R1 Replication)

| Model | Mean Intra-Model Jaccard | 95% CI | Cohort |
|-------|------------------------|--------|--------|
| Claude Sonnet 4.6 | 0.578 | [0.578, 0.578] | original |
| GPT-5.2 | 0.258 | [0.258, 0.258] | original |
| Grok 4.1 Fast | 0.293 | [0.293, 0.293] | original |
| Gemini 3 Flash | 0.372 | [0.372, 0.372] | original |
| Qwen 3.5 397B-A17B | 0.508 | [0.435, 0.580] | phase10a |
| MiniMax M2.5 | 0.419 | [0.298, 0.546] | phase10a |
| Llama 3.1 8B Instruct | 0.298 | [0.207, 0.403] | phase10a |
| Moonshot Kimi K2.5 | 0.414 | [0.328, 0.507] | phase10a |
| Mistral Large 3 | 0.747 | [0.667, 0.841] | phase11a |
| DeepSeek V3.2 | 0.540 | [0.408, 0.670] | phase11a |
| Llama 4 Maverick | 0.539 | [0.436, 0.646] | phase11a |
| Cohere Command A | 0.502 | [0.377, 0.633] | phase11a |

### Gait per pair (Phase 11A models)

| Model | music-mathematics | light-color | animal-poodle | emotion-melancholy | hot-cold | hide-shoe | seed-garden | stapler-monsoon |
|-------|------|------|------|------|------|------|------|------|
| mistral | 0.936 | 0.642 | 0.762 | 0.734 | 0.934 | 0.740 | 0.649 | 0.577 |
| deepseek | 0.574 | 0.883 | 0.417 | 0.618 | 0.694 | 0.564 | 0.369 | 0.201 |
| llama4 | 0.497 | 0.517 | 0.679 | 0.753 | 0.676 | 0.378 | 0.543 | 0.272 |
| cohere | 0.432 | 0.309 | 0.286 | 0.664 | 0.762 | 0.620 | 0.660 | 0.283 |

## 4. Asymmetry Results (R2 Replication)

| Model | Mean Asymmetry | 95% CI | > 0.60? |
|-------|---------------|--------|---------|
| mistral | 0.729 | [0.613, 0.844] | **YES** |
| deepseek | 0.722 | [0.660, 0.816] | **YES** |
| llama4 | 0.673 | [0.651, 0.698] | **YES** |
| cohere | 0.718 | [0.608, 0.853] | **YES** |

### Asymmetry per pair

| Model | Pair | Asymmetry Index | 95% CI |
|-------|------|----------------|--------|
| mistral | music-mathematics | 0.595 | [0.575, 0.607] |
| mistral | light-color | 0.873 | [0.823, 0.905] |
| mistral | animal-poodle | 0.631 | [0.599, 0.663] |
| mistral | emotion-melancholy | 0.815 | [0.765, 0.862] |
| deepseek | music-mathematics | 0.718 | [0.638, 0.803] |
| deepseek | light-color | 0.603 | [0.570, 0.635] |
| deepseek | animal-poodle | 0.849 | [0.833, 0.867] |
| deepseek | emotion-melancholy | 0.718 | [0.689, 0.741] |
| llama4 | music-mathematics | 0.640 | [0.586, 0.686] |
| llama4 | light-color | 0.702 | [0.668, 0.735] |
| llama4 | animal-poodle | 0.688 | [0.639, 0.739] |
| llama4 | emotion-melancholy | 0.662 | [0.592, 0.723] |
| cohere | music-mathematics | 0.615 | [0.513, 0.737] |
| cohere | light-color | 0.878 | [0.784, 0.961] |
| cohere | animal-poodle | 0.778 | [0.693, 0.861] |
| cohere | emotion-melancholy | 0.601 | [0.531, 0.673] |

## 5. Bridge Frequency Matrix (R6 Replication)

| Pair | Model | Expected Bridge | Bridge Freq | 95% CI | Runs |
|------|-------|-----------------|------------|--------|------|
| p11a-music-mathematics | mistral | harmony | 0.133 | [0.000, 0.333] | 15 |
| p11a-music-mathematics | deepseek | harmony | 0.267 | [0.067, 0.533] | 15 |
| p11a-music-mathematics | llama4 | harmony | 0.600 | [0.333, 0.800] | 15 |
| p11a-music-mathematics | cohere | harmony | 0.200 | [0.000, 0.400] | 15 |
| p11a-light-color | mistral | spectrum | 1.000 | [1.000, 1.000] | 15 |
| p11a-light-color | deepseek | spectrum | 1.000 | [1.000, 1.000] | 15 |
| p11a-light-color | llama4 | spectrum | 0.933 | [0.800, 1.000] | 15 |
| p11a-light-color | cohere | spectrum | 1.000 | [1.000, 1.000] | 15 |
| p11a-animal-poodle | mistral | dog | 1.000 | [1.000, 1.000] | 15 |
| p11a-animal-poodle | deepseek | dog | 1.000 | [1.000, 1.000] | 15 |
| p11a-animal-poodle | llama4 | dog | 1.000 | [1.000, 1.000] | 15 |
| p11a-animal-poodle | cohere | dog | 1.000 | [1.000, 1.000] | 15 |
| p11a-emotion-melancholy | mistral | sadness | 0.000 | [0.000, 0.000] | 15 |
| p11a-emotion-melancholy | deepseek | sadness | 1.000 | [1.000, 1.000] | 15 |
| p11a-emotion-melancholy | llama4 | sadness | 0.000 | [0.000, 0.000] | 15 |
| p11a-emotion-melancholy | cohere | sadness | 0.933 | [0.800, 1.000] | 15 |
| p11a-hot-cold | mistral | warm | 1.000 | [1.000, 1.000] | 15 |
| p11a-hot-cold | deepseek | warm | 1.000 | [1.000, 1.000] | 15 |
| p11a-hot-cold | llama4 | warm | 0.867 | [0.667, 1.000] | 15 |
| p11a-hot-cold | cohere | warm | 1.000 | [1.000, 1.000] | 15 |
| p11a-hide-shoe | mistral | leather | 0.267 | [0.067, 0.533] | 15 |
| p11a-hide-shoe | deepseek | leather | 1.000 | [1.000, 1.000] | 15 |
| p11a-hide-shoe | llama4 | leather | 0.867 | [0.667, 1.000] | 15 |
| p11a-hide-shoe | cohere | leather | 1.000 | [1.000, 1.000] | 15 |
| p11a-seed-garden | mistral | germination | 1.000 | [1.000, 1.000] | 15 |
| p11a-seed-garden | deepseek | germination | 0.000 | [0.000, 0.000] | 15 |
| p11a-seed-garden | llama4 | germination | 0.800 | [0.600, 1.000] | 15 |
| p11a-seed-garden | cohere | germination | 0.067 | [0.000, 0.200] | 15 |
| p11a-stapler-monsoon | mistral | none | 0.000 | [0.000, 0.000] | 15 |
| p11a-stapler-monsoon | deepseek | none | 0.000 | [0.000, 0.000] | 15 |
| p11a-stapler-monsoon | llama4 | none | 0.000 | [0.000, 0.000] | 15 |
| p11a-stapler-monsoon | cohere | none | 0.000 | [0.000, 0.000] | 15 |

## 6. Control Validation (R5: stapler-monsoon)

| Model | Top Waypoint | Top Frequency | Unique Waypoints | Passes? |
|-------|-------------|---------------|------------------|---------|
| mistral | workplace | 1.000 | 18 | no |
| deepseek | paperclip | 0.600 | 35 | no |
| llama4 | paperweight | 1.000 | 29 | no |
| cohere | office supply | 1.000 | 40 | no |

## 7. Llama Scale Test (Maverick vs 8B)

| Metric | Llama 4 Maverick | Llama 3.1 8B |
|--------|-----------------|-------------|
| Gait Jaccard | 0.539 | 0.298 |
| Mean Bridge Freq | 0.724 | 0.200 |
| Mean Asymmetry | 0.673 | 0.785 |

- **Scale effect confirmed:** **YES**

## 8. Combined Cohort Comparison (PRIMARY TEST)

- **New cohort (10A+11A) mean bridge frequency:** 0.717 [0.581, 0.849] (8 models)
- **Original cohort mean bridge frequency:** 0.817 [0.683, 0.930]
- **Difference (new - original):** -0.100 [-0.284, 0.096]
- **CI includes zero:** **YES** (no significant difference)

The combined 8-model new cohort (Phases 10A + 11A) produces bridge frequencies statistically indistinguishable from the original 4-model cohort. Core bridge bottleneck structure (R6) generalizes across 12 models.

## 9. 12-Model Pairwise Similarity

| Model A | Model B | Mean Pairwise Jaccard |
|---------|---------|----------------------|
| claude | gpt | 0.261 |
| claude | grok | 0.256 |
| claude | gemini | 0.283 |
| claude | qwen | 0.338 |
| claude | minimax | 0.251 |
| claude | llama | 0.184 |
| claude | kimi | 0.316 |
| claude | mistral | 0.278 |
| claude | deepseek | 0.300 |
| claude | llama4 | 0.274 |
| claude | cohere | 0.250 |
| gpt | grok | 0.240 |
| gpt | gemini | 0.188 |
| gpt | qwen | 0.228 |
| gpt | minimax | 0.284 |
| gpt | llama | 0.126 |
| gpt | kimi | 0.236 |
| gpt | mistral | 0.214 |
| gpt | deepseek | 0.208 |
| gpt | llama4 | 0.215 |
| gpt | cohere | 0.192 |
| grok | gemini | 0.197 |
| grok | qwen | 0.321 |
| grok | minimax | 0.260 |
| grok | llama | 0.147 |
| grok | kimi | 0.285 |
| grok | mistral | 0.201 |
| grok | deepseek | 0.213 |
| grok | llama4 | 0.228 |
| grok | cohere | 0.200 |
| gemini | qwen | 0.221 |
| gemini | minimax | 0.186 |
| gemini | llama | 0.124 |
| gemini | kimi | 0.251 |
| gemini | mistral | 0.207 |
| gemini | deepseek | 0.191 |
| gemini | llama4 | 0.185 |
| gemini | cohere | 0.133 |
| qwen | minimax | 0.275 |
| qwen | llama | 0.174 |
| qwen | kimi | 0.358 |
| qwen | mistral | 0.203 |
| qwen | deepseek | 0.279 |
| qwen | llama4 | 0.268 |
| qwen | cohere | 0.257 |
| minimax | llama | 0.154 |
| minimax | kimi | 0.294 |
| minimax | mistral | 0.252 |
| minimax | deepseek | 0.244 |
| minimax | llama4 | 0.241 |
| minimax | cohere | 0.194 |
| llama | kimi | 0.151 |
| llama | mistral | 0.220 |
| llama | deepseek | 0.195 |
| llama | llama4 | 0.236 |
| llama | cohere | 0.177 |
| kimi | mistral | 0.234 |
| kimi | deepseek | 0.272 |
| kimi | llama4 | 0.233 |
| kimi | cohere | 0.217 |
| mistral | deepseek | 0.264 |
| mistral | llama4 | 0.296 |
| mistral | cohere | 0.253 |
| deepseek | llama4 | 0.271 |
| deepseek | cohere | 0.227 |
| llama4 | cohere | 0.271 |

## 10. Predictions Summary

| # | Prediction | Result | Value |
|---|------------|--------|-------|
| 1 | All 4 Phase 11A models pass reliability gate | confirmed | 4 of 4 reliable |
| 2 | All Phase 11A models show characteristic gait (Jaccard 0.15-0.70) | not confirmed | 3 of 4 in range |
| 3 | All Phase 11A models show asymmetry index > 0.60 | confirmed | 4 of 4 above 0.60 |
| 4 | DeepSeek/Mistral/Cohere bridge freq within 0.20 of original cohort | confirmed | comparable mean=0.708, original=0.817, diff=0.109 |
| 5 | Llama 4 Maverick bridge freq > 0.60 (vs 8B at ~0.200) | confirmed | Maverick=0.724, 8B=0.200 |
| 6 | Control pair stapler-monsoon passes R5 for all Phase 11A models | not confirmed | 0 of 4 pass |
| 7 | DeepSeek clusters with Claude/Qwen in similarity matrix | confirmed | deepseek-claude=0.300, deepseek-qwen=0.279, median=0.244 |

## 11. Summary of Key Findings

- **Predictions confirmed:** 5 of 7
- **Predictions not confirmed:** 2
- **Insufficient data:** 0

### Core structural findings generality:

- **R1 (Gait):** Phase 11A models show intra-model Jaccard range 0.502-0.747. Each model has a characteristic consistency level.
- **R2 (Asymmetry):** 4 of 4 reliable Phase 11A models show asymmetry index > 0.60.
- **R5 (Controls):** 0 of 4 models pass the random control validation.
- **R6 (Bridge bottlenecks):** Combined cohort comparison CI includes zero: true. Bridge structure generalizes across 12 models.
