# Phase 3A: Positional Convergence Findings

> Generated: 2026-03-04T01:21:01.726Z

## 1. Experiment Overview

- **Forward results loaded (5wp/semantic):** 1240
- **Reverse results loaded:** 840
- **Models:** claude, gemini, gpt, grok
- **Unique pairs analyzed:** 21
- **Total pair/model combinations:** 84
- **Waypoint count:** 5
- **New API calls:** 0 (pure analysis of existing data)

## 2. Overall Positional Convergence

**Mean convergence slope:** 0.0082 (95% CI: [-0.0030, 0.0198])

**Positive convergence fraction:** 50.0% of pair/model combinations show increasing overlap from start → end

**Per-position mirror-match rates (overall):**

| Position | Fwd→ | ←Rev (mirror) | Match Rate |
|----------|------|---------------|------------|
| 1 | wp1 | wp5 | 0.1018 |
| 2 | wp2 | wp4 | 0.0568 |
| 3 | wp3 | wp3 | 0.0651 |
| 4 | wp4 | wp2 | 0.0851 |
| 5 | wp5 | wp1 | 0.1288 |

The positive convergence slope supports the **starting-point hypothesis**: paths diverge most at their starting points (position 1) and converge toward their endpoints (position 5). This is consistent with models constructing paths forward from the starting concept.

## 3. Category-Level Convergence

| Category | Mean Slope | 95% CI | Per-Position Rates | Combos |
|----------|-----------|--------|-------------------|--------|
| antonym | 0.0882 | [0.0025, 0.1740] | 0.054 → 0.035 → 0.215 → 0.338 → 0.344 | 4 |
| hierarchy | 0.0043 | [-0.0334, 0.0426] | 0.230 → 0.177 → 0.175 → 0.354 → 0.163 | 8 |
| near-synonym | 0.0125 | [-0.0334, 0.0621] | 0.176 → 0.078 → 0.087 → 0.092 → 0.231 | 8 |
| cross-domain | 0.0009 | [-0.0221, 0.0248] | 0.062 → 0.035 → 0.019 → 0.024 → 0.072 | 8 |
| polysemy | 0.0042 | [-0.0183, 0.0287] | 0.069 → 0.114 → 0.052 → 0.053 → 0.121 | 12 |
| anchor | 0.0004 | [-0.0223, 0.0242] | 0.115 → 0.013 → 0.015 → 0.039 → 0.104 | 12 |
| control-identity | 0.0039 | [-0.0005, 0.0096] | 0.000 → 0.044 → 0.319 → 0.048 → 0.018 | 4 |
| control-random | 0.0049 | [-0.0113, 0.0204] | 0.099 → 0.025 → 0.010 → 0.031 → 0.121 | 24 |
| control-nonsense | 0.0014 | [-0.0003, 0.0037] | 0.001 → 0.003 → 0.008 → 0.001 → 0.009 | 4 |

## 4. Per-Model Convergence

| Model | Mean Slope | 95% CI | Per-Position Rates | Pairs |
|-------|-----------|--------|-------------------|-------|
| Gemini 3 Flash | 0.0060 | [-0.0072, 0.0196] | 0.060 → 0.035 → 0.043 → 0.054 → 0.081 | 21 |
| GPT-5.2 | 0.0154 | [-0.0083, 0.0468] | 0.157 → 0.068 → 0.090 → 0.139 → 0.199 | 21 |
| Grok 4.1 Fast | 0.0163 | [-0.0060, 0.0430] | 0.138 → 0.076 → 0.085 → 0.095 → 0.210 | 21 |
| Claude Sonnet 4.6 | -0.0049 | [-0.0213, 0.0116] | 0.053 → 0.048 → 0.042 → 0.053 → 0.026 | 21 |

## 5. Notable Cases

### Strongest Positive Convergence (top 5)

- **antonym-hot-cold (gpt)**: slope=0.2255, R²=0.861, rates=[0.115 → 0.065 → 0.350 → 0.850 → 0.850]
- **synonym-cemetery-graveyard (grok)**: slope=0.1335, R²=0.547, rates=[0.060 → 0.045 → 0.050 → 0.100 → 0.700]
- **antonym-hot-cold (grok)**: slope=0.1225, R²=0.877, rates=[0.100 → 0.075 → 0.320 → 0.500 → 0.500]
- **control-random-telescope-jealousy (grok)**: slope=0.1160, R²=0.500, rates=[0.000 → 0.000 → 0.000 → 0.000 → 0.580]
- **synonym-cemetery-graveyard (gpt)**: slope=0.0970, R²=0.570, rates=[0.015 → 0.040 → 0.145 → 0.040 → 0.500]

### Strongest Negative Convergence (top 5)

- **synonym-happy-joyful (claude)**: slope=-0.1000, R²=0.500, rates=[0.500 → 0.000 → 0.000 → 0.000 → 0.000]
- **control-random-umbrella-photosynthesis (grok)**: slope=-0.0980, R²=0.295, rates=[0.700 → 0.040 → 0.000 → 0.100 → 0.180]
- **anchor-tesla-mycelium (gpt)**: slope=-0.0920, R²=0.510, rates=[0.490 → 0.090 → 0.000 → 0.010 → 0.070]
- **hierarchy-animal-poodle (gemini)**: slope=-0.0840, R²=0.692, rates=[0.430 → 0.145 → 0.100 → 0.165 → 0.000]
- **polysemy-bat-baseball (claude)**: slope=-0.0610, R²=0.442, rates=[0.350 → 0.000 → 0.160 → 0.090 → 0.000]

### Identity Controls

- **control-identity-apple (gemini)**: rates=[0.000 → 0.030 → 0.270 → 0.000 → 0.070], slope=0.0110
- **control-identity-apple (gpt)**: rates=[0.000 → 0.100 → 0.260 → 0.090 → 0.000], slope=-0.0010
- **control-identity-apple (grok)**: rates=[0.000 → 0.045 → 0.165 → 0.100 → 0.000], slope=0.0055
- **control-identity-apple (claude)**: rates=[0.000 → 0.000 → 0.580 → 0.000 → 0.000], slope=0.0000

## 6. Appendix: All Pair/Model Metrics

| Pair | Model | Slope | R² | Pos1 | Pos2 | Pos3 | Pos4 | Pos5 | Fwd | Rev |
|------|-------|-------|----|------|------|------|------|------|-----|-----|
| anchor-beyonce-erosion | claude | 0.0700 | 0.500 | 0.000 | 0.000 | 0.000 | 0.000 | 0.350 | 20 | 10 |
| anchor-beyonce-erosion | gemini | 0.0050 | 0.500 | 0.000 | 0.000 | 0.000 | 0.000 | 0.025 | 20 | 10 |
| anchor-beyonce-erosion | gpt | 0.0180 | 0.500 | 0.000 | 0.000 | 0.000 | 0.000 | 0.090 | 20 | 10 |
| anchor-beyonce-erosion | grok | -0.0280 | 0.167 | 0.265 | 0.010 | 0.005 | 0.040 | 0.110 | 20 | 10 |
| anchor-skull-garden | claude | 0.0100 | 0.125 | 0.000 | 0.000 | 0.000 | 0.100 | 0.000 | 10 | 10 |
| anchor-skull-garden | gemini | -0.0060 | 0.014 | 0.160 | 0.000 | 0.000 | 0.000 | 0.130 | 10 | 10 |
| anchor-skull-garden | gpt | -0.0450 | 0.287 | 0.360 | 0.030 | 0.060 | 0.080 | 0.110 | 10 | 10 |
| anchor-skull-garden | grok | 0.0030 | 0.012 | 0.100 | 0.030 | 0.060 | 0.020 | 0.120 | 10 | 10 |
| anchor-tesla-mycelium | claude | 0.0000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 10 | 10 |
| anchor-tesla-mycelium | gemini | 0.0000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 10 | 10 |
| anchor-tesla-mycelium | gpt | -0.0920 | 0.510 | 0.490 | 0.090 | 0.000 | 0.010 | 0.070 | 10 | 10 |
| anchor-tesla-mycelium | grok | 0.0700 | 0.883 | 0.000 | 0.000 | 0.060 | 0.220 | 0.240 | 10 | 10 |
| antonym-hot-cold | claude | 0.0000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 20 | 10 |
| antonym-hot-cold | gemini | 0.0050 | 0.009 | 0.000 | 0.000 | 0.190 | 0.000 | 0.025 | 20 | 10 |
| antonym-hot-cold | gpt | 0.2255 | 0.861 | 0.115 | 0.065 | 0.350 | 0.850 | 0.850 | 20 | 10 |
| antonym-hot-cold | grok | 0.1225 | 0.877 | 0.100 | 0.075 | 0.320 | 0.500 | 0.500 | 20 | 10 |
| control-identity-apple | claude | 0.0000 | 0.000 | 0.000 | 0.000 | 0.580 | 0.000 | 0.000 | 20 | 10 |
| control-identity-apple | gemini | 0.0110 | 0.024 | 0.000 | 0.030 | 0.270 | 0.000 | 0.070 | 20 | 10 |
| control-identity-apple | gpt | -0.0010 | 0.000 | 0.000 | 0.100 | 0.260 | 0.090 | 0.000 | 20 | 10 |
| control-identity-apple | grok | 0.0055 | 0.015 | 0.000 | 0.045 | 0.165 | 0.100 | 0.000 | 20 | 10 |
| control-nonsense-xkplm-qrvzt | claude | 0.0012 | 0.500 | 0.000 | 0.000 | 0.000 | 0.000 | 0.006 | 17 | 10 |
| control-nonsense-xkplm-qrvzt | gemini | 0.0000 | 0.000 | 0.000 | 0.000 | 0.005 | 0.000 | 0.000 | 20 | 10 |
| control-nonsense-xkplm-qrvzt | gpt | -0.0005 | 0.125 | 0.000 | 0.005 | 0.000 | 0.000 | 0.000 | 20 | 10 |
| control-nonsense-xkplm-qrvzt | grok | 0.0050 | 0.403 | 0.005 | 0.005 | 0.025 | 0.005 | 0.030 | 20 | 10 |
| control-random-flamingo-calculus | claude | 0.0000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 10 | 10 |
| control-random-flamingo-calculus | gemini | -0.0080 | 0.042 | 0.130 | 0.000 | 0.000 | 0.000 | 0.090 | 10 | 10 |
| control-random-flamingo-calculus | gpt | 0.0130 | 0.295 | 0.030 | 0.000 | 0.000 | 0.010 | 0.090 | 10 | 10 |
| control-random-flamingo-calculus | grok | 0.0220 | 0.435 | 0.010 | 0.000 | 0.000 | 0.000 | 0.120 | 10 | 10 |
| control-random-origami-gravity | claude | 0.0000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 10 | 10 |
| control-random-origami-gravity | gemini | 0.0260 | 0.278 | 0.110 | 0.060 | 0.000 | 0.180 | 0.180 | 10 | 10 |
| control-random-origami-gravity | gpt | 0.0420 | 0.420 | 0.090 | 0.000 | 0.020 | 0.080 | 0.260 | 10 | 10 |
| control-random-origami-gravity | grok | -0.0170 | 0.466 | 0.090 | 0.000 | 0.000 | 0.010 | 0.000 | 10 | 10 |
| control-random-shoelace-democracy | claude | -0.0390 | 0.486 | 0.200 | 0.000 | 0.000 | 0.010 | 0.000 | 10 | 10 |
| control-random-shoelace-democracy | gemini | -0.0390 | 0.486 | 0.200 | 0.000 | 0.000 | 0.010 | 0.000 | 10 | 10 |
| control-random-shoelace-democracy | gpt | -0.0100 | 0.028 | 0.210 | 0.040 | 0.000 | 0.020 | 0.170 | 10 | 10 |
| control-random-shoelace-democracy | grok | 0.0280 | 0.449 | 0.010 | 0.000 | 0.000 | 0.000 | 0.150 | 10 | 10 |
| control-random-stapler-monsoon | claude | 0.0000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 20 | 10 |
| control-random-stapler-monsoon | gemini | 0.0020 | 0.500 | 0.000 | 0.000 | 0.000 | 0.000 | 0.010 | 20 | 10 |
| control-random-stapler-monsoon | gpt | -0.0005 | 0.000 | 0.010 | 0.085 | 0.000 | 0.000 | 0.050 | 20 | 10 |
| control-random-stapler-monsoon | grok | 0.0180 | 0.153 | 0.095 | 0.005 | 0.010 | 0.025 | 0.175 | 20 | 10 |
| control-random-telescope-jealousy | claude | 0.0460 | 0.925 | 0.000 | 0.000 | 0.060 | 0.100 | 0.180 | 10 | 10 |
| control-random-telescope-jealousy | gemini | 0.0100 | 0.500 | 0.000 | 0.000 | 0.000 | 0.000 | 0.050 | 10 | 10 |
| control-random-telescope-jealousy | gpt | -0.0040 | 0.004 | 0.300 | 0.080 | 0.080 | 0.140 | 0.250 | 10 | 10 |
| control-random-telescope-jealousy | grok | 0.1160 | 0.500 | 0.000 | 0.000 | 0.000 | 0.000 | 0.580 | 10 | 10 |
| control-random-umbrella-photosynthesis | claude | -0.0300 | 0.125 | 0.000 | 0.300 | 0.000 | 0.000 | 0.000 | 10 | 10 |
| control-random-umbrella-photosynthesis | gemini | 0.0360 | 0.500 | 0.000 | 0.000 | 0.000 | 0.000 | 0.180 | 10 | 10 |
| control-random-umbrella-photosynthesis | gpt | 0.0050 | 0.007 | 0.200 | 0.000 | 0.060 | 0.050 | 0.200 | 10 | 10 |
| control-random-umbrella-photosynthesis | grok | -0.0980 | 0.295 | 0.700 | 0.040 | 0.000 | 0.100 | 0.180 | 10 | 10 |
| cross-justice-erosion | claude | 0.0000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 20 | 10 |
| cross-justice-erosion | gemini | 0.0060 | 0.500 | 0.000 | 0.000 | 0.000 | 0.000 | 0.030 | 20 | 10 |
| cross-justice-erosion | gpt | 0.0600 | 0.500 | 0.000 | 0.000 | 0.000 | 0.000 | 0.300 | 20 | 10 |
| cross-justice-erosion | grok | 0.0220 | 0.519 | 0.000 | 0.000 | 0.010 | 0.000 | 0.110 | 20 | 10 |
| cross-music-mathematics | claude | -0.0045 | 0.263 | 0.010 | 0.035 | 0.005 | 0.000 | 0.005 | 20 | 10 |
| cross-music-mathematics | gemini | 0.0165 | 0.307 | 0.000 | 0.045 | 0.080 | 0.000 | 0.105 | 20 | 10 |
| cross-music-mathematics | gpt | -0.0330 | 0.365 | 0.200 | 0.000 | 0.005 | 0.070 | 0.000 | 20 | 10 |
| cross-music-mathematics | grok | -0.0600 | 0.792 | 0.285 | 0.200 | 0.055 | 0.120 | 0.025 | 20 | 10 |
| hierarchy-animal-poodle | claude | 0.0000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 20 | 10 |
| hierarchy-animal-poodle | gemini | -0.0840 | 0.692 | 0.430 | 0.145 | 0.100 | 0.165 | 0.000 | 20 | 10 |
| hierarchy-animal-poodle | gpt | 0.0280 | 0.048 | 0.250 | 0.300 | 0.430 | 0.700 | 0.190 | 20 | 10 |
| hierarchy-animal-poodle | grok | -0.0450 | 0.103 | 0.850 | 0.950 | 0.850 | 0.400 | 0.900 | 20 | 10 |
| hierarchy-emotion-nostalgia | claude | 0.0800 | 0.125 | 0.000 | 0.000 | 0.000 | 0.800 | 0.000 | 10 | 10 |
| hierarchy-emotion-nostalgia | gemini | 0.0760 | 0.540 | 0.000 | 0.000 | 0.000 | 0.360 | 0.200 | 10 | 10 |
| hierarchy-emotion-nostalgia | gpt | -0.0390 | 0.166 | 0.310 | 0.020 | 0.000 | 0.250 | 0.000 | 10 | 10 |
| hierarchy-emotion-nostalgia | grok | 0.0180 | 0.172 | 0.000 | 0.000 | 0.020 | 0.160 | 0.010 | 10 | 10 |
| polysemy-bank-river | claude | -0.0240 | 0.117 | 0.000 | 0.260 | 0.040 | 0.020 | 0.000 | 20 | 10 |
| polysemy-bank-river | gemini | 0.0680 | 0.761 | 0.000 | 0.000 | 0.120 | 0.080 | 0.300 | 20 | 10 |
| polysemy-bank-river | gpt | 0.0220 | 0.771 | 0.000 | 0.025 | 0.025 | 0.035 | 0.105 | 20 | 10 |
| polysemy-bank-river | grok | 0.0220 | 0.439 | 0.020 | 0.090 | 0.005 | 0.100 | 0.125 | 20 | 10 |
| polysemy-bat-baseball | claude | -0.0610 | 0.442 | 0.350 | 0.000 | 0.160 | 0.090 | 0.000 | 10 | 10 |
| polysemy-bat-baseball | gemini | -0.0130 | 0.060 | 0.160 | 0.190 | 0.070 | 0.000 | 0.190 | 10 | 10 |
| polysemy-bat-baseball | gpt | -0.0130 | 0.068 | 0.020 | 0.210 | 0.040 | 0.040 | 0.040 | 10 | 10 |
| polysemy-bat-baseball | grok | 0.0110 | 0.026 | 0.200 | 0.040 | 0.040 | 0.030 | 0.260 | 10 | 10 |
| polysemy-crane-construction | claude | -0.0500 | 0.205 | 0.050 | 0.400 | 0.000 | 0.000 | 0.000 | 10 | 10 |
| polysemy-crane-construction | gemini | -0.0040 | 0.024 | 0.020 | 0.080 | 0.000 | 0.080 | 0.000 | 10 | 10 |
| polysemy-crane-construction | gpt | 0.0880 | 0.818 | 0.000 | 0.070 | 0.090 | 0.150 | 0.400 | 10 | 10 |
| polysemy-crane-construction | grok | 0.0050 | 0.231 | 0.010 | 0.000 | 0.040 | 0.010 | 0.030 | 10 | 10 |
| synonym-cemetery-graveyard | claude | -0.0010 | 0.008 | 0.000 | 0.010 | 0.040 | 0.000 | 0.000 | 20 | 10 |
| synonym-cemetery-graveyard | gemini | 0.0275 | 0.369 | 0.045 | 0.085 | 0.075 | 0.230 | 0.110 | 20 | 10 |
| synonym-cemetery-graveyard | gpt | 0.0970 | 0.570 | 0.015 | 0.040 | 0.145 | 0.040 | 0.500 | 20 | 10 |
| synonym-cemetery-graveyard | grok | 0.1335 | 0.547 | 0.060 | 0.045 | 0.050 | 0.100 | 0.700 | 20 | 10 |
| synonym-happy-joyful | claude | -0.1000 | 0.500 | 0.500 | 0.000 | 0.000 | 0.000 | 0.000 | 10 | 10 |
| synonym-happy-joyful | gemini | -0.0080 | 0.085 | 0.000 | 0.100 | 0.000 | 0.020 | 0.000 | 10 | 10 |
| synonym-happy-joyful | gpt | -0.0370 | 0.105 | 0.700 | 0.270 | 0.330 | 0.300 | 0.500 | 10 | 10 |
| synonym-happy-joyful | grok | -0.0120 | 0.973 | 0.090 | 0.070 | 0.060 | 0.050 | 0.040 | 10 | 10 |
