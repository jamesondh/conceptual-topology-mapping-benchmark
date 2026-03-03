# Pilot Experiment Findings

> Generated: 2026-03-03T22:10:29.068Z

## 1. Experiment Overview

- **Total result files loaded:** 2480
- **Models tested:** claude, gemini, gpt, grok
- **Unique concept pairs:** 21
- **Waypoint counts:** 5, 10
- **Prompt formats:** semantic
- **Embeddings:** skipped

## 2. Prompt Format Selection Rationale

Only one prompt format was used in the pilot: **semantic**. See prompt-selection experiment results for format comparison rationale.

## 3. Per-Model Consistency Profiles

| Model | Avg Jaccard | Avg Positional | Avg Entropy | Semantic Sim | Runs |
|-------|-------------|----------------|-------------|--------------|------|
| Claude Sonnet 4.6 | 0.578 | 0.474 | 3.662 | n/a | 620 |
| Gemini 3 Flash | 0.372 | 0.320 | 4.163 | n/a | 620 |
| GPT-5.2 | 0.258 | 0.211 | 4.673 | n/a | 620 |
| Grok 4.1 Fast | 0.293 | 0.216 | 4.505 | n/a | 620 |

### Claude Sonnet 4.6

**Most stable pairs:**
- `antonym-hot-cold` (Jaccard: 0.809)
- `control-random-umbrella-photosynthesis` (Jaccard: 0.788)
- `hierarchy-emotion-nostalgia` (Jaccard: 0.771)
- `synonym-happy-joyful` (Jaccard: 0.753)
- `anchor-skull-garden` (Jaccard: 0.705)

**Least stable pairs:**
- `control-nonsense-xkplm-qrvzt` (Jaccard: 0.041)
- `control-random-flamingo-calculus` (Jaccard: 0.291)
- `control-random-stapler-monsoon` (Jaccard: 0.343)
- `anchor-beyonce-erosion` (Jaccard: 0.429)
- `hierarchy-animal-poodle` (Jaccard: 0.493)

### Gemini 3 Flash

**Most stable pairs:**
- `control-random-telescope-jealousy` (Jaccard: 0.621)
- `anchor-skull-garden` (Jaccard: 0.603)
- `polysemy-bank-river` (Jaccard: 0.529)
- `hierarchy-animal-poodle` (Jaccard: 0.526)
- `hierarchy-emotion-nostalgia` (Jaccard: 0.525)

**Least stable pairs:**
- `anchor-tesla-mycelium` (Jaccard: 0.081)
- `control-nonsense-xkplm-qrvzt` (Jaccard: 0.139)
- `control-random-flamingo-calculus` (Jaccard: 0.197)
- `control-random-origami-gravity` (Jaccard: 0.207)
- `anchor-beyonce-erosion` (Jaccard: 0.267)

### GPT-5.2

**Most stable pairs:**
- `antonym-hot-cold` (Jaccard: 0.638)
- `hierarchy-animal-poodle` (Jaccard: 0.520)
- `synonym-happy-joyful` (Jaccard: 0.496)
- `control-random-umbrella-photosynthesis` (Jaccard: 0.397)
- `cross-music-mathematics` (Jaccard: 0.388)

**Least stable pairs:**
- `control-nonsense-xkplm-qrvzt` (Jaccard: 0.011)
- `anchor-beyonce-erosion` (Jaccard: 0.087)
- `polysemy-bat-baseball` (Jaccard: 0.094)
- `control-random-stapler-monsoon` (Jaccard: 0.101)
- `anchor-tesla-mycelium` (Jaccard: 0.129)

### Grok 4.1 Fast

**Most stable pairs:**
- `antonym-hot-cold` (Jaccard: 0.639)
- `control-random-umbrella-photosynthesis` (Jaccard: 0.520)
- `hierarchy-animal-poodle` (Jaccard: 0.505)
- `hierarchy-emotion-nostalgia` (Jaccard: 0.498)
- `synonym-happy-joyful` (Jaccard: 0.478)

**Least stable pairs:**
- `control-nonsense-xkplm-qrvzt` (Jaccard: 0.057)
- `anchor-beyonce-erosion` (Jaccard: 0.091)
- `control-random-shoelace-democracy` (Jaccard: 0.098)
- `control-random-flamingo-calculus` (Jaccard: 0.141)
- `polysemy-bat-baseball` (Jaccard: 0.142)

## 4. Control Results

| Control Type | Avg Jaccard | Avg Positional | Avg Entropy | Pairs |
|--------------|-------------|----------------|-------------|-------|
| control-identity | 0.378 | 0.303 | 4.379 | 1 |
| control-random | 0.337 | 0.298 | 4.283 | 6 |
| control-nonsense | 0.062 | 0.069 | 6.371 | 1 |

**Expected behavior:**
- **Identity pairs:** Should produce trivial/degenerate paths (high consistency but possibly low waypoint diversity).
- **Random pairs:** Should produce noisy, inconsistent paths (low Jaccard, high entropy).
- **Nonsense pairs:** Should show hallucinated structure or refusals.

## 5. Cross-Model Comparison

Average cross-model Jaccard similarity (across all pairs):

| Model Pair | Avg Jaccard | Pair Count |
|------------|-------------|------------|
| claude vs gemini | 0.185 | 21 |
| claude vs gpt | 0.170 | 21 |
| claude vs grok | 0.196 | 21 |
| gemini vs gpt | 0.178 | 21 |
| gemini vs grok | 0.175 | 21 |
| gpt vs grok | 0.201 | 21 |

**Most similar models:** gpt vs grok (avg Jaccard: 0.201)
**Least similar models:** claude vs gpt (avg Jaccard: 0.170)

## 6. Waypoint Count Effect

Comparing 5-waypoint and 10-waypoint paths for the same model/pair:

- **Conditions compared:** 84
- **Average shared waypoint fraction:** 0.705 (fraction of 5-waypoint concepts that also appear in the 10-waypoint set)
- **Subsequence rate:** 67.9% of 5-waypoint paths appear as subsequences of 10-waypoint paths

| Model | Pair | Shared Fraction | Subsequence? |
|-------|------|-----------------|--------------|
| gpt | control-random-stapler-monsoon | 0.434 | no |
| gpt | control-nonsense-xkplm-qrvzt | 0.143 | no |
| gpt | antonym-hot-cold | 1.000 | yes |
| gpt | polysemy-bank-river | 0.694 | yes |
| gpt | synonym-happy-joyful | 1.000 | yes |
| gpt | control-random-umbrella-photosynthesis | 0.909 | yes |
| gpt | cross-music-mathematics | 0.737 | yes |
| gpt | polysemy-bat-baseball | 0.621 | no |
| gpt | hierarchy-animal-poodle | 0.909 | yes |
| gpt | control-identity-apple | 0.850 | yes |
| gpt | anchor-skull-garden | 0.826 | yes |
| gpt | anchor-beyonce-erosion | 0.483 | no |
| gpt | control-random-flamingo-calculus | 0.500 | no |
| gpt | polysemy-crane-construction | 0.684 | no |
| gpt | cross-justice-erosion | 0.667 | yes |
| gpt | hierarchy-emotion-nostalgia | 0.733 | yes |
| gpt | synonym-cemetery-graveyard | 0.792 | yes |
| gpt | control-random-telescope-jealousy | 0.750 | no |
| gpt | anchor-tesla-mycelium | 0.361 | no |
| gpt | control-random-origami-gravity | 0.724 | yes |
| ... | ... | ... | ... | (64 more rows) |

## 7. Polysemy Observations

For polysemy pair groups, comparing the waypoint sets produced when the ambiguous word is paired with different sense-steering targets:

### Group: "bank"

- `polysemy-bank-river`: bank -> river
- `polysemy-bank-mortgage`: bank -> mortgage

**Cross-pair Jaccard:** 0.000 (lower = more distinct paths = better sense differentiation)

### Group: "bat"

- `polysemy-bat-cave`: bat -> cave
- `polysemy-bat-baseball`: bat -> baseball

**Cross-pair Jaccard:** 0.000 (lower = more distinct paths = better sense differentiation)

### Group: "crane"

- `polysemy-crane-construction`: crane -> construction
- `polysemy-crane-wetland`: crane -> wetland

**Cross-pair Jaccard:** 0.000 (lower = more distinct paths = better sense differentiation)


## 8. Category-Level Patterns

| Category | Avg Jaccard | Avg Positional | Avg Entropy | Pairs |
|----------|-------------|----------------|-------------|-------|
| anchor | 0.302 | 0.273 | 4.538 | 3 |
| hierarchy | 0.528 | 0.401 | 3.642 | 2 |
| cross-domain | 0.416 | 0.347 | 4.032 | 2 |
| polysemy | 0.349 | 0.243 | 4.234 | 3 |
| near-synonym | 0.474 | 0.337 | 3.846 | 2 |
| antonym | 0.630 | 0.534 | 3.461 | 1 |

**Most consistent category:** antonym (Jaccard: 0.630)
**Least consistent category:** anchor (Jaccard: 0.302)

## 9. Anomalies and Surprises

**Lowest consistency conditions:**

- gpt / `control-nonsense-xkplm-qrvzt` / 5wp / semantic: Jaccard=0.006, Entropy=6.456
- gpt / `control-nonsense-xkplm-qrvzt` / 10wp / semantic: Jaccard=0.015, Entropy=7.271
- claude / `control-nonsense-xkplm-qrvzt` / 10wp / semantic: Jaccard=0.035, Entropy=7.341
- gemini / `control-nonsense-xkplm-qrvzt` / 5wp / semantic: Jaccard=0.043, Entropy=5.934
- claude / `control-nonsense-xkplm-qrvzt` / 5wp / semantic: Jaccard=0.047, Entropy=5.963

**Highest consistency conditions:**

- claude / `control-identity-apple` / 5wp / semantic: Jaccard=0.967, Entropy=2.379
- claude / `antonym-hot-cold` / 5wp / semantic: Jaccard=0.911, Entropy=2.444
- claude / `control-random-origami-gravity` / 5wp / semantic: Jaccard=0.881, Entropy=2.466
- claude / `hierarchy-emotion-nostalgia` / 10wp / semantic: Jaccard=0.842, Entropy=3.513
- claude / `control-random-umbrella-photosynthesis` / 10wp / semantic: Jaccard=0.836, Entropy=3.484


## 10. Recommendations for Phase 2

Based on the pilot results:

1. **Prompt format:** Select the format yielding higher consistency (see Section 2).
2. **Waypoint count:** Evaluate whether 5 or 10 waypoints provides better signal (see Section 6). If 5-waypoint paths reliably appear as subsequences of 10-waypoint paths, the 5-waypoint condition may be sufficient and more efficient.
3. **Repetitions:** If intra-model consistency (Jaccard) is generally above 0.5, 10 repetitions may suffice for stable estimates. If below, consider 20+ repetitions.
4. **Control calibration:** Verify that control baselines behave as expected before interpreting experimental pairs.
5. **Polysemy pairs:** If cross-pair Jaccard within polysemy groups is close to the overall average, the sense-steering effect may be weak, and additional pairs or prompt refinement may be needed.
6. **Category coverage:** Identify any categories with insufficient data and plan additional pairs if needed.
