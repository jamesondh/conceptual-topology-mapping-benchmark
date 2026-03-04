# Phase 4A: Cross-Model Bridge Agreement Findings

> Generated: 2026-03-04T02:53:04.297Z

## 1. Overview

This analysis examines whether different LLMs agree on how bridge
concepts function in transitive conceptual paths. Using existing
Phase 3B data (zero new API calls), we measure inter-model bridge
agreement, cross-model path similarity, and test whether Gemini
exhibits systematic isolation from the other models.

- **Triples analyzed:** 8 total (6 non-control)
- **Models:** claude, gpt, grok, gemini
- **Model pairs:** 6
- **Total observations (model-pair x triple):** 36
- **New API calls:** 0

## 2. Bridge Frequency Vectors

Bridge frequency = fraction of A→C runs where the bridge concept B appears as a waypoint.

| Triple | B | claude | gpt | grok | gemini |
|--------|---|---|---|---|---|
| triple-animal-dog-poodle | dog | 1.00 | 1.00 | 0.95 | 1.00 |
| triple-emotion-nostalgia-melancholy | nostalgia | 0.10 | 0.10 | 0.90 | 0.00 |
| triple-music-harmony-mathematics | harmony | 1.00 | 0.15 | 0.85 | 0.00 |
| triple-hot-energy-cold | energy | 0.00 | 0.00 | 0.00 | 0.00 |
| triple-beyonce-justice-erosion | justice | 0.00 | 0.00 | 0.00 | 0.00 |
| triple-bank-river-ocean | river | 1.00 | 0.90 | 1.00 | 0.00 |
| triple-music-stapler-mathematics | stapler | — | — | — | — |
| triple-hot-flamingo-cold | flamingo | — | — | — | — |

## 3. Inter-Model Bridge Agreement

For each model pair, computed across the 6 non-control triples:
- **Mean |Δfreq|**: mean absolute difference in bridge frequency
- **Binary agree**: fraction where both find bridge (freq > 0) or both miss
- **Pearson r**: correlation of 6-element bridge frequency vectors

| Model Pair | Mean |Δfreq| | Binary Agree | Pearson r |
|------------|---------------|--------------|-----------|
| claude-gpt | 0.158 | 100% | 0.772 |
| claude-grok | 0.167 | 100% | 0.768 |
| claude-gemini | 0.350 | 50% | 0.446 |
| gpt-grok | 0.275 | 100% | 0.667 |
| gpt-gemini | 0.192 | 50% | 0.679 |
| grok-gemini | 0.467 | 50% | 0.340 |

## 4. Cross-Model Path Similarity

Cross-model Jaccard on A→C paths, with bridge-removed control:

| Model Pair | Triple | Cross-Model Jaccard | 95% CI | Bridge-Removed Jaccard | 95% CI |
|------------|--------|---------------------|--------|------------------------|--------|
| claude-gpt | triple-animal-dog-poodle | 0.223 | [0.184, 0.262] | 0.217 | [0.173, 0.267] |
| claude-gpt | triple-emotion-nostalgia-melancholy | 0.416 | [0.330, 0.524] | 0.425 | [0.341, 0.518] |
| claude-gpt | triple-music-harmony-mathematics | 0.324 | [0.274, 0.379] | 0.351 | [0.291, 0.405] |
| claude-gpt | triple-hot-energy-cold | 0.655 | [0.631, 0.667] | 0.655 | [0.631, 0.667] |
| claude-gpt | triple-beyonce-justice-erosion | 0.034 | [0.014, 0.056] | 0.034 | [0.012, 0.056] |
| claude-gpt | triple-bank-river-ocean | 0.124 | [0.096, 0.156] | 0.025 | [0.001, 0.058] |
| claude-grok | triple-animal-dog-poodle | 0.319 | [0.282, 0.358] | 0.335 | [0.300, 0.367] |
| claude-grok | triple-emotion-nostalgia-melancholy | 0.291 | [0.222, 0.363] | 0.313 | [0.241, 0.395] |
| claude-grok | triple-music-harmony-mathematics | 0.167 | [0.130, 0.207] | 0.082 | [0.050, 0.117] |
| claude-grok | triple-hot-energy-cold | 0.524 | [0.476, 0.583] | 0.524 | [0.476, 0.571] |
| claude-grok | triple-beyonce-justice-erosion | 0.077 | [0.052, 0.102] | 0.077 | [0.052, 0.101] |
| claude-grok | triple-bank-river-ocean | 0.208 | [0.156, 0.263] | 0.100 | [0.046, 0.161] |
| claude-gemini | triple-animal-dog-poodle | 0.252 | [0.205, 0.300] | 0.258 | [0.217, 0.301] |
| claude-gemini | triple-emotion-nostalgia-melancholy | 0.257 | [0.250, 0.279] | 0.261 | [0.250, 0.279] |
| claude-gemini | triple-music-harmony-mathematics | 0.161 | [0.125, 0.200] | 0.184 | [0.138, 0.227] |
| claude-gemini | triple-hot-energy-cold | 0.461 | [0.380, 0.542] | 0.461 | [0.377, 0.540] |
| claude-gemini | triple-beyonce-justice-erosion | 0.077 | [0.046, 0.109] | 0.077 | [0.047, 0.111] |
| claude-gemini | triple-bank-river-ocean | 0.033 | [0.000, 0.067] | 0.037 | [0.000, 0.075] |
| gpt-grok | triple-animal-dog-poodle | 0.327 | [0.249, 0.418] | 0.412 | [0.323, 0.504] |
| gpt-grok | triple-emotion-nostalgia-melancholy | 0.398 | [0.310, 0.486] | 0.442 | [0.336, 0.552] |
| gpt-grok | triple-music-harmony-mathematics | 0.114 | [0.082, 0.153] | 0.111 | [0.076, 0.147] |
| gpt-grok | triple-hot-energy-cold | 0.660 | [0.591, 0.736] | 0.660 | [0.589, 0.732] |
| gpt-grok | triple-beyonce-justice-erosion | 0.027 | [0.012, 0.044] | 0.027 | [0.012, 0.045] |
| gpt-grok | triple-bank-river-ocean | 0.293 | [0.233, 0.389] | 0.203 | [0.142, 0.286] |
| gpt-gemini | triple-animal-dog-poodle | 0.232 | [0.195, 0.277] | 0.332 | [0.275, 0.406] |
| gpt-gemini | triple-emotion-nostalgia-melancholy | 0.284 | [0.229, 0.357] | 0.289 | [0.230, 0.357] |
| gpt-gemini | triple-music-harmony-mathematics | 0.152 | [0.132, 0.175] | 0.155 | [0.136, 0.178] |
| gpt-gemini | triple-hot-energy-cold | 0.464 | [0.326, 0.611] | 0.464 | [0.316, 0.605] |
| gpt-gemini | triple-beyonce-justice-erosion | 0.018 | [0.006, 0.035] | 0.018 | [0.005, 0.034] |
| gpt-gemini | triple-bank-river-ocean | 0.021 | [0.000, 0.044] | 0.024 | [0.000, 0.046] |
| grok-gemini | triple-animal-dog-poodle | 0.384 | [0.325, 0.451] | 0.322 | [0.267, 0.381] |
| grok-gemini | triple-emotion-nostalgia-melancholy | 0.311 | [0.266, 0.362] | 0.351 | [0.301, 0.414] |
| grok-gemini | triple-music-harmony-mathematics | 0.098 | [0.069, 0.126] | 0.109 | [0.079, 0.143] |
| grok-gemini | triple-hot-energy-cold | 0.400 | [0.282, 0.535] | 0.400 | [0.281, 0.524] |
| grok-gemini | triple-beyonce-justice-erosion | 0.050 | [0.028, 0.076] | 0.050 | [0.028, 0.076] |
| grok-gemini | triple-bank-river-ocean | 0.004 | [0.000, 0.013] | 0.005 | [0.000, 0.016] |

## 5. Bridge Agreement vs Path Similarity Correlation

Across 36 (model-pair, triple) observations:

- **Pearson r (bridge freq diff vs cross-model Jaccard):** -0.283
- **Pearson r (bridge-removed):** -0.217

Higher bridge frequency differences are associated with **lower** path similarity,
suggesting that bridge agreement contributes to overall path convergence.

The bridge-removed correlation persists at a similar magnitude, suggesting
the relationship is not an artifact of shared bridge tokens.

## 6. Gemini Isolation Index

Compares bridge agreement for Gemini-paired model pairs vs non-Gemini pairs.

- **Gemini-paired mean |Δfreq|:** 0.336
- **Non-Gemini mean |Δfreq|:** 0.200
- **Isolation index (difference):** 0.136
- **95% CI:** [-0.131, 0.381]

Gemini shows a **modest isolation trend**, though the confidence interval
includes zero, so the effect may not be reliable.

## 7. Verification Checks

- [x] Zero new API calls — all data from Phase 1/2/3B
- [x] Seeded PRNG (seed=42) for reproducible bootstrap CIs
- [x] Random-control bridge freq is low (mean=0.000)
- [x] Non-control bridge freq higher than control (0.415 vs 0.000)
- [x] All 6 model pairs analyzed (found 6)
- [x] Cross-model Jaccard computed for 36 observations
