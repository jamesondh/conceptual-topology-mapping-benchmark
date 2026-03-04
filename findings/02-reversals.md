# Phase 2: Reversal & Path Consistency Findings

> Generated: 2026-03-04T00:14:10.508Z

## 1. Experiment Overview

- **Forward results loaded (5wp/semantic):** 1240
- **Reverse results loaded:** 840
- **Polysemy supplementary results:** 120
- **Models:** claude, gemini, gpt, grok
- **Unique pairs analyzed:** 21
- **Total pair/model combinations:** 84

## 2. Overall Symmetry Profile

**Overall mean asymmetry index:** 0.811 (95% CI: [0.772, 0.848])

Navigation is **substantially asymmetric**. Forward and reverse paths diverge meaningfully, suggesting direction matters for conceptual navigation.

**Asymmetry index distribution:**

| Range | Count |
|-------|-------|
| 0.0-0.1 | 1 |
| 0.1-0.2 | 0 |
| 0.2-0.3 | 1 |
| 0.3-0.4 | 1 |
| 0.4-0.5 | 2 |
| 0.5-0.6 | 4 |
| 0.6-0.7 | 7 |
| 0.7-0.8 | 14 |
| 0.8-0.9 | 23 |
| 0.9-1.0 | 31 |

## 3. Category-Level Asymmetry

| Category | Prediction | Mean Asymmetry | 95% CI | Pairs | Match? |
|----------|------------|----------------|--------|-------|--------|
| antonym | high symmetry | 0.596 | [0.391, 0.800] | 1 | NO |
| hierarchy | asymmetric | 0.683 | [0.542, 0.792] | 2 | YES |
| near-synonym | high symmetry | 0.665 | [0.576, 0.748] | 2 | NO |
| cross-domain | unknown | 0.822 | [0.734, 0.902] | 2 | n/a |
| polysemy | asymmetric | 0.824 | [0.780, 0.866] | 3 | YES |
| anchor | asymmetric | 0.911 | [0.888, 0.937] | 3 | YES |
| control-identity | symmetric | 0.456 | [0.155, 0.661] | 1 | YES |
| control-random | symmetric | 0.908 | [0.878, 0.935] | 6 | NO |
| control-nonsense | symmetric | 0.986 | [0.969, 0.997] | 1 | NO |

### antonym

- **Prediction:** high symmetry
- **Observed mean asymmetry:** 0.596 (CI: [0.391, 0.800])
- **Assessment:** Observation does NOT match prediction.

### hierarchy

- **Prediction:** asymmetric
- **Observed mean asymmetry:** 0.683 (CI: [0.542, 0.792])
- **Assessment:** Observation matches prediction.

### near-synonym

- **Prediction:** high symmetry
- **Observed mean asymmetry:** 0.665 (CI: [0.576, 0.748])
- **Assessment:** Observation does NOT match prediction.

### cross-domain

- **Prediction:** unknown
- **Observed mean asymmetry:** 0.822 (CI: [0.734, 0.902])
- **Assessment:** No directional prediction for this category.

### polysemy

- **Prediction:** asymmetric
- **Observed mean asymmetry:** 0.824 (CI: [0.780, 0.866])
- **Assessment:** Observation matches prediction.

### anchor

- **Prediction:** asymmetric
- **Observed mean asymmetry:** 0.911 (CI: [0.888, 0.937])
- **Assessment:** Observation matches prediction.

### control-identity

- **Prediction:** symmetric
- **Observed mean asymmetry:** 0.456 (CI: [0.155, 0.661])
- **Assessment:** Observation matches prediction.

### control-random

- **Prediction:** symmetric
- **Observed mean asymmetry:** 0.908 (CI: [0.878, 0.935])
- **Assessment:** Observation does NOT match prediction.

### control-nonsense

- **Prediction:** symmetric
- **Observed mean asymmetry:** 0.986 (CI: [0.969, 0.997])
- **Assessment:** Observation does NOT match prediction.

## 4. Per-Model Direction Sensitivity

| Model | Mean Asymmetry | 95% CI | Pair Count |
|-------|----------------|--------|------------|
| Gemini 3 Flash | 0.867 | [0.819, 0.906] | 21 |
| GPT-5.2 | 0.794 | [0.712, 0.871] | 21 |
| Grok 4.1 Fast | 0.803 | [0.718, 0.871] | 21 |
| Claude Sonnet 4.6 | 0.780 | [0.674, 0.867] | 21 |

**Most direction-sensitive model:** Gemini 3 Flash (mean asymmetry: 0.867)
**Least direction-sensitive model:** Claude Sonnet 4.6 (mean asymmetry: 0.780)

Do rigid navigators (high within-model Jaccard) show more or less asymmetry? Compare these values with the per-model Jaccard profiles from Phase 1.

## 5. Individual Pair Deep Dives

### Top 5 Most Asymmetric Pairs

#### control-random-origami-gravity (claude)

- **Asymmetry index:** 1.000
- **Mean cross-direction Jaccard:** 0.000
- **Permutation p-value:** 0.000
- **Edit distance:** 1.000
- **Forward-exclusive waypoints:** paper airplane, flight, atmosphere, mass, weight
- **Reverse-exclusive waypoints:** tension, fold, paper, geometry, structure
- **Forward runs:** 10, **Reverse runs:** 10

#### control-nonsense-xkplm-qrvzt (claude)

- **Asymmetry index:** 0.999
- **Mean cross-direction Jaccard:** 0.001
- **Permutation p-value:** 0.000
- **Edit distance:** 1.000
- **Forward-exclusive waypoints:** (none)
- **Reverse-exclusive waypoints:** (none)
- **Forward runs:** 20, **Reverse runs:** 10

#### control-nonsense-xkplm-qrvzt (gemini)

- **Asymmetry index:** 0.996
- **Mean cross-direction Jaccard:** 0.004
- **Permutation p-value:** 0.007
- **Edit distance:** 1.000
- **Forward-exclusive waypoints:** (none)
- **Reverse-exclusive waypoints:** (none)
- **Forward runs:** 20, **Reverse runs:** 10

#### control-random-stapler-monsoon (claude)

- **Asymmetry index:** 0.993
- **Mean cross-direction Jaccard:** 0.007
- **Permutation p-value:** 0.000
- **Edit distance:** 1.000
- **Forward-exclusive waypoints:** office, build, architecture, climate
- **Reverse-exclusive waypoints:** flood, infrastructure, office building
- **Forward runs:** 20, **Reverse runs:** 10

#### control-nonsense-xkplm-qrvzt (gpt)

- **Asymmetry index:** 0.991
- **Mean cross-direction Jaccard:** 0.009
- **Permutation p-value:** 0.606
- **Edit distance:** 1.000
- **Forward-exclusive waypoints:** (none)
- **Reverse-exclusive waypoints:** (none)
- **Forward runs:** 20, **Reverse runs:** 10

### Top 5 Most Symmetric Pairs

#### control-identity-apple (claude)

- **Asymmetry index:** 0.017
- **Mean cross-direction Jaccard:** 0.983
- **Permutation p-value:** 0.640
- **Edit distance:** 0.000
- **Reversal order rho:** 1.000
- **Forward-exclusive waypoints:** (none)
- **Reverse-exclusive waypoints:** (none)
- **Forward runs:** 20, **Reverse runs:** 10

#### hierarchy-animal-poodle (grok)

- **Asymmetry index:** 0.271
- **Mean cross-direction Jaccard:** 0.729
- **Permutation p-value:** 0.265
- **Edit distance:** 0.800
- **Reversal order rho:** -2.600
- **Forward-exclusive waypoints:** canid
- **Reverse-exclusive waypoints:** canine
- **Forward runs:** 20, **Reverse runs:** 10

#### antonym-hot-cold (gpt)

- **Asymmetry index:** 0.361
- **Mean cross-direction Jaccard:** 0.639
- **Permutation p-value:** 0.000
- **Edit distance:** 0.800
- **Reversal order rho:** -1.900
- **Forward-exclusive waypoints:** tepid
- **Reverse-exclusive waypoints:** (none)
- **Forward runs:** 20, **Reverse runs:** 10

#### synonym-happy-joyful (gpt)

- **Asymmetry index:** 0.411
- **Mean cross-direction Jaccard:** 0.589
- **Permutation p-value:** 0.029
- **Edit distance:** 0.800
- **Reversal order rho:** -1.700
- **Forward-exclusive waypoints:** delighted
- **Reverse-exclusive waypoints:** exuberant
- **Forward runs:** 10, **Reverse runs:** 10

#### antonym-hot-cold (grok)

- **Asymmetry index:** 0.420
- **Mean cross-direction Jaccard:** 0.580
- **Permutation p-value:** 0.000
- **Edit distance:** 1.000
- **Reversal order rho:** -2.000
- **Forward-exclusive waypoints:** chilly, temperate
- **Reverse-exclusive waypoints:** (none)
- **Forward runs:** 20, **Reverse runs:** 10

## 6. Polysemy Sense Differentiation (Corrected)

Updated analysis with supplementary data to properly test sense differentiation. Cross-pair Jaccard measures overlap between waypoint sets for different sense-steering targets of the same polysemous word (lower = more distinct paths).

### Group: "bank"

- `polysemy-bank-river`: bank -> river
- `polysemy-bank-mortgage`: bank -> mortgage

- **Data for both senses:** Yes
- **Cross-pair Jaccard:** 0.062 (lower = more distinct paths = better sense differentiation)

### Group: "bat"

- `polysemy-bat-cave`: bat -> cave
- `polysemy-bat-baseball`: bat -> baseball

- **Data for both senses:** Yes
- **Cross-pair Jaccard:** 0.059 (lower = more distinct paths = better sense differentiation)

### Group: "crane"

- `polysemy-crane-construction`: crane -> construction
- `polysemy-crane-wetland`: crane -> wetland

- **Data for both senses:** Yes
- **Cross-pair Jaccard:** 0.011 (lower = more distinct paths = better sense differentiation)

## 7. Statistical Details

### Permutation Test Results

- **Pairs with significant asymmetry (p < 0.05):** 73 / 84 (86.9%)

**Significant asymmetries (p < 0.05):**

| Pair | Model | Asymmetry | p-value |
|------|-------|-----------|---------|
| cross-music-mathematics | gemini | 0.851 | 0.000 |
| cross-music-mathematics | claude | 0.608 | 0.000 |
| control-random-stapler-monsoon | gemini | 0.945 | 0.000 |
| control-random-stapler-monsoon | gpt | 0.968 | 0.000 |
| control-random-stapler-monsoon | grok | 0.941 | 0.000 |
| control-random-stapler-monsoon | claude | 0.993 | 0.000 |
| synonym-cemetery-graveyard | gemini | 0.671 | 0.000 |
| synonym-cemetery-graveyard | grok | 0.716 | 0.000 |
| synonym-cemetery-graveyard | claude | 0.639 | 0.000 |
| anchor-beyonce-erosion | gemini | 0.968 | 0.000 |
| anchor-beyonce-erosion | gpt | 0.990 | 0.000 |
| anchor-beyonce-erosion | claude | 0.875 | 0.000 |
| cross-justice-erosion | gemini | 0.965 | 0.000 |
| cross-justice-erosion | gpt | 0.953 | 0.000 |
| cross-justice-erosion | claude | 0.889 | 0.000 |
| control-random-origami-gravity | grok | 0.944 | 0.000 |
| control-random-origami-gravity | claude | 1.000 | 0.000 |
| anchor-tesla-mycelium | gemini | 0.974 | 0.000 |
| anchor-tesla-mycelium | grok | 0.871 | 0.000 |
| anchor-tesla-mycelium | claude | 0.889 | 0.000 |
| antonym-hot-cold | gemini | 0.887 | 0.000 |
| antonym-hot-cold | gpt | 0.361 | 0.000 |
| antonym-hot-cold | grok | 0.420 | 0.000 |
| antonym-hot-cold | claude | 0.714 | 0.000 |
| hierarchy-emotion-nostalgia | gemini | 0.880 | 0.000 |
| hierarchy-emotion-nostalgia | grok | 0.756 | 0.000 |
| hierarchy-emotion-nostalgia | claude | 0.746 | 0.000 |
| synonym-happy-joyful | gemini | 0.895 | 0.000 |
| synonym-happy-joyful | grok | 0.658 | 0.000 |
| synonym-happy-joyful | claude | 0.568 | 0.000 |
| control-random-umbrella-photosynthesis | gemini | 0.924 | 0.000 |
| control-random-umbrella-photosynthesis | gpt | 0.857 | 0.000 |
| control-random-umbrella-photosynthesis | claude | 0.710 | 0.000 |
| control-random-telescope-jealousy | grok | 0.929 | 0.000 |
| control-random-telescope-jealousy | claude | 0.876 | 0.000 |
| hierarchy-animal-poodle | gemini | 0.771 | 0.000 |
| hierarchy-animal-poodle | gpt | 0.535 | 0.000 |
| hierarchy-animal-poodle | claude | 0.818 | 0.000 |
| polysemy-bank-river | gemini | 0.807 | 0.000 |
| polysemy-bank-river | claude | 0.673 | 0.000 |
| control-random-shoelace-democracy | gemini | 0.898 | 0.000 |
| control-random-shoelace-democracy | claude | 0.954 | 0.000 |
| anchor-skull-garden | gemini | 0.920 | 0.000 |
| anchor-skull-garden | claude | 0.854 | 0.000 |
| control-nonsense-xkplm-qrvzt | claude | 0.999 | 0.000 |
| polysemy-bat-baseball | gpt | 0.896 | 0.000 |
| polysemy-bat-baseball | claude | 0.804 | 0.000 |
| polysemy-crane-construction | gemini | 0.939 | 0.000 |
| polysemy-crane-construction | gpt | 0.775 | 0.000 |
| polysemy-crane-construction | claude | 0.781 | 0.000 |
| control-random-flamingo-calculus | gpt | 0.981 | 0.000 |
| control-random-flamingo-calculus | claude | 0.980 | 0.000 |
| cross-justice-erosion | grok | 0.862 | 0.001 |
| control-random-umbrella-photosynthesis | grok | 0.810 | 0.001 |
| control-random-telescope-jealousy | gemini | 0.738 | 0.001 |
| polysemy-bank-river | gpt | 0.902 | 0.001 |
| anchor-skull-garden | grok | 0.917 | 0.001 |
| hierarchy-emotion-nostalgia | gpt | 0.688 | 0.002 |
| control-random-flamingo-calculus | grok | 0.968 | 0.002 |
| cross-music-mathematics | gpt | 0.658 | 0.003 |
| synonym-cemetery-graveyard | gpt | 0.760 | 0.003 |
| control-nonsense-xkplm-qrvzt | gemini | 0.996 | 0.007 |
| control-random-flamingo-calculus | gemini | 0.930 | 0.008 |
| control-random-shoelace-democracy | grok | 0.934 | 0.011 |
| polysemy-crane-construction | grok | 0.876 | 0.011 |
| control-random-shoelace-democracy | gpt | 0.935 | 0.015 |
| control-random-origami-gravity | gemini | 0.878 | 0.018 |
| polysemy-bank-river | grok | 0.760 | 0.018 |
| anchor-skull-garden | gpt | 0.858 | 0.018 |
| anchor-beyonce-erosion | grok | 0.908 | 0.023 |
| synonym-happy-joyful | gpt | 0.411 | 0.029 |
| control-random-telescope-jealousy | gpt | 0.797 | 0.034 |
| polysemy-bat-baseball | grok | 0.871 | 0.034 |

**Marginally significant (0.05 <= p < 0.10):**

| Pair | Model | Asymmetry | p-value |
|------|-------|-----------|---------|
| polysemy-bat-baseball | gemini | 0.803 | 0.064 |

## 8. Appendix: Per-Pair Metrics

| Pair | Model | Asymmetry | Jaccard | p-value | Edit Dist | Rho | Fwd Runs | Rev Runs |
|------|-------|-----------|---------|---------|-----------|-----|----------|----------|
| anchor-beyonce-erosion | claude | 0.875 | 0.125 | 0.000 | 1.000 | n/a | 20 | 10 |
| anchor-beyonce-erosion | gemini | 0.968 | 0.032 | 0.000 | 1.000 | n/a | 20 | 10 |
| anchor-beyonce-erosion | gpt | 0.990 | 0.010 | 0.000 | 1.000 | n/a | 20 | 10 |
| anchor-beyonce-erosion | grok | 0.908 | 0.092 | 0.023 | 1.000 | n/a | 20 | 10 |
| anchor-skull-garden | claude | 0.854 | 0.146 | 0.000 | 1.000 | n/a | 10 | 10 |
| anchor-skull-garden | gemini | 0.920 | 0.080 | 0.000 | 1.000 | n/a | 10 | 10 |
| anchor-skull-garden | gpt | 0.858 | 0.142 | 0.018 | 1.000 | n/a | 10 | 10 |
| anchor-skull-garden | grok | 0.917 | 0.083 | 0.001 | 1.000 | n/a | 10 | 10 |
| anchor-tesla-mycelium | claude | 0.889 | 0.111 | 0.000 | 1.000 | n/a | 10 | 10 |
| anchor-tesla-mycelium | gemini | 0.974 | 0.026 | 0.000 | 1.000 | n/a | 10 | 10 |
| anchor-tesla-mycelium | gpt | 0.913 | 0.087 | 0.283 | 1.000 | n/a | 10 | 10 |
| anchor-tesla-mycelium | grok | 0.871 | 0.129 | 0.000 | 1.000 | n/a | 10 | 10 |
| antonym-hot-cold | claude | 0.714 | 0.286 | 0.000 | 1.000 | n/a | 20 | 10 |
| antonym-hot-cold | gemini | 0.887 | 0.113 | 0.000 | 1.000 | n/a | 20 | 10 |
| antonym-hot-cold | gpt | 0.361 | 0.639 | 0.000 | 0.800 | -1.900 | 20 | 10 |
| antonym-hot-cold | grok | 0.420 | 0.580 | 0.000 | 1.000 | -2.000 | 20 | 10 |
| control-identity-apple | claude | 0.017 | 0.983 | 0.640 | 0.000 | 1.000 | 20 | 10 |
| control-identity-apple | gemini | 0.570 | 0.430 | 0.862 | 0.600 | n/a | 20 | 10 |
| control-identity-apple | gpt | 0.533 | 0.467 | 0.961 | 0.000 | 1.000 | 20 | 10 |
| control-identity-apple | grok | 0.704 | 0.296 | 0.785 | 0.400 | 0.900 | 20 | 10 |
| control-nonsense-xkplm-qrvzt | claude | 0.999 | 0.001 | 0.000 | 1.000 | n/a | 20 | 10 |
| control-nonsense-xkplm-qrvzt | gemini | 0.996 | 0.004 | 0.007 | 1.000 | n/a | 20 | 10 |
| control-nonsense-xkplm-qrvzt | gpt | 0.991 | 0.009 | 0.606 | 1.000 | n/a | 20 | 10 |
| control-nonsense-xkplm-qrvzt | grok | 0.960 | 0.040 | 0.193 | 0.800 | n/a | 20 | 10 |
| control-random-flamingo-calculus | claude | 0.980 | 0.020 | 0.000 | 1.000 | n/a | 10 | 10 |
| control-random-flamingo-calculus | gemini | 0.930 | 0.070 | 0.008 | 1.000 | n/a | 10 | 10 |
| control-random-flamingo-calculus | gpt | 0.981 | 0.019 | 0.000 | 1.000 | n/a | 10 | 10 |
| control-random-flamingo-calculus | grok | 0.968 | 0.032 | 0.002 | 1.000 | n/a | 10 | 10 |
| control-random-origami-gravity | claude | 1.000 | 0.000 | 0.000 | 1.000 | n/a | 10 | 10 |
| control-random-origami-gravity | gemini | 0.878 | 0.122 | 0.018 | 1.000 | n/a | 10 | 10 |
| control-random-origami-gravity | gpt | 0.913 | 0.087 | 0.220 | 1.000 | -6.250 | 10 | 10 |
| control-random-origami-gravity | grok | 0.944 | 0.056 | 0.000 | 1.000 | n/a | 10 | 10 |
| control-random-shoelace-democracy | claude | 0.954 | 0.046 | 0.000 | 1.000 | n/a | 10 | 10 |
| control-random-shoelace-democracy | gemini | 0.898 | 0.102 | 0.000 | 1.000 | n/a | 10 | 10 |
| control-random-shoelace-democracy | gpt | 0.935 | 0.065 | 0.015 | 1.000 | n/a | 10 | 10 |
| control-random-shoelace-democracy | grok | 0.934 | 0.066 | 0.011 | 1.000 | n/a | 10 | 10 |
| control-random-stapler-monsoon | claude | 0.993 | 0.007 | 0.000 | 1.000 | n/a | 20 | 10 |
| control-random-stapler-monsoon | gemini | 0.945 | 0.055 | 0.000 | 1.000 | n/a | 20 | 10 |
| control-random-stapler-monsoon | gpt | 0.968 | 0.032 | 0.000 | 1.000 | n/a | 20 | 10 |
| control-random-stapler-monsoon | grok | 0.941 | 0.059 | 0.000 | 1.000 | n/a | 20 | 10 |
| control-random-telescope-jealousy | claude | 0.876 | 0.124 | 0.000 | 1.000 | n/a | 10 | 10 |
| control-random-telescope-jealousy | gemini | 0.738 | 0.263 | 0.001 | 0.800 | n/a | 10 | 10 |
| control-random-telescope-jealousy | gpt | 0.797 | 0.203 | 0.034 | 1.000 | n/a | 10 | 10 |
| control-random-telescope-jealousy | grok | 0.929 | 0.071 | 0.000 | 1.000 | n/a | 10 | 10 |
| control-random-umbrella-photosynthesis | claude | 0.710 | 0.290 | 0.000 | 1.000 | n/a | 10 | 10 |
| control-random-umbrella-photosynthesis | gemini | 0.924 | 0.076 | 0.000 | 1.000 | n/a | 10 | 10 |
| control-random-umbrella-photosynthesis | gpt | 0.857 | 0.143 | 0.000 | 1.000 | n/a | 10 | 10 |
| control-random-umbrella-photosynthesis | grok | 0.810 | 0.190 | 0.001 | 1.000 | n/a | 10 | 10 |
| cross-justice-erosion | claude | 0.889 | 0.111 | 0.000 | 1.000 | n/a | 20 | 10 |
| cross-justice-erosion | gemini | 0.965 | 0.035 | 0.000 | 1.000 | n/a | 20 | 10 |
| cross-justice-erosion | gpt | 0.953 | 0.047 | 0.000 | 1.000 | n/a | 20 | 10 |
| cross-justice-erosion | grok | 0.862 | 0.138 | 0.001 | 0.800 | n/a | 20 | 10 |
| cross-music-mathematics | claude | 0.608 | 0.392 | 0.000 | 0.600 | 0.500 | 20 | 10 |
| cross-music-mathematics | gemini | 0.851 | 0.149 | 0.000 | 1.000 | -3.500 | 20 | 10 |
| cross-music-mathematics | gpt | 0.658 | 0.342 | 0.003 | 0.800 | -0.500 | 20 | 10 |
| cross-music-mathematics | grok | 0.788 | 0.212 | 0.102 | 1.000 | n/a | 20 | 10 |
| hierarchy-animal-poodle | claude | 0.818 | 0.182 | 0.000 | 1.000 | n/a | 20 | 10 |
| hierarchy-animal-poodle | gemini | 0.771 | 0.229 | 0.000 | 1.000 | n/a | 20 | 10 |
| hierarchy-animal-poodle | gpt | 0.535 | 0.465 | 0.000 | 0.800 | -2.250 | 20 | 10 |
| hierarchy-animal-poodle | grok | 0.271 | 0.729 | 0.265 | 0.800 | -2.600 | 20 | 10 |
| hierarchy-emotion-nostalgia | claude | 0.746 | 0.254 | 0.000 | 0.800 | n/a | 10 | 10 |
| hierarchy-emotion-nostalgia | gemini | 0.880 | 0.120 | 0.000 | 1.000 | n/a | 10 | 10 |
| hierarchy-emotion-nostalgia | gpt | 0.688 | 0.312 | 0.002 | 1.000 | n/a | 10 | 10 |
| hierarchy-emotion-nostalgia | grok | 0.756 | 0.244 | 0.000 | 1.000 | n/a | 10 | 10 |
| polysemy-bank-river | claude | 0.673 | 0.327 | 0.000 | 1.000 | n/a | 20 | 10 |
| polysemy-bank-river | gemini | 0.807 | 0.193 | 0.000 | 1.000 | n/a | 20 | 10 |
| polysemy-bank-river | gpt | 0.902 | 0.098 | 0.001 | 1.000 | n/a | 20 | 10 |
| polysemy-bank-river | grok | 0.760 | 0.240 | 0.018 | 1.000 | -1.500 | 20 | 10 |
| polysemy-bat-baseball | claude | 0.804 | 0.196 | 0.000 | 1.000 | n/a | 10 | 10 |
| polysemy-bat-baseball | gemini | 0.803 | 0.197 | 0.064 | 1.000 | n/a | 10 | 10 |
| polysemy-bat-baseball | gpt | 0.896 | 0.104 | 0.000 | 1.000 | n/a | 10 | 10 |
| polysemy-bat-baseball | grok | 0.871 | 0.129 | 0.034 | 0.800 | -7.000 | 10 | 10 |
| polysemy-crane-construction | claude | 0.781 | 0.219 | 0.000 | 0.800 | n/a | 10 | 10 |
| polysemy-crane-construction | gemini | 0.939 | 0.061 | 0.000 | 1.000 | n/a | 10 | 10 |
| polysemy-crane-construction | gpt | 0.775 | 0.225 | 0.000 | 1.000 | n/a | 10 | 10 |
| polysemy-crane-construction | grok | 0.876 | 0.124 | 0.011 | 0.800 | n/a | 10 | 10 |
| synonym-cemetery-graveyard | claude | 0.639 | 0.361 | 0.000 | 0.600 | n/a | 20 | 10 |
| synonym-cemetery-graveyard | gemini | 0.671 | 0.329 | 0.000 | 1.000 | -2.500 | 20 | 10 |
| synonym-cemetery-graveyard | gpt | 0.760 | 0.240 | 0.003 | 1.000 | n/a | 20 | 10 |
| synonym-cemetery-graveyard | grok | 0.716 | 0.284 | 0.000 | 1.000 | n/a | 20 | 10 |
| synonym-happy-joyful | claude | 0.568 | 0.432 | 0.000 | 1.000 | -2.000 | 10 | 10 |
| synonym-happy-joyful | gemini | 0.895 | 0.105 | 0.000 | 1.000 | n/a | 10 | 10 |
| synonym-happy-joyful | gpt | 0.411 | 0.589 | 0.029 | 0.800 | -1.700 | 10 | 10 |
| synonym-happy-joyful | grok | 0.658 | 0.342 | 0.000 | 0.800 | -1.000 | 10 | 10 |
