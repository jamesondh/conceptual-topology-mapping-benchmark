# Phase 6A: Navigational Salience Mapping Findings

> Generated: 2026-03-04T18:58:20.742Z

## 1. Experiment Overview

- **Pairs analyzed:** 8
- **Models:** claude, gpt, grok, gemini
- **Total runs loaded:** 1200
- **Salience landscapes computed:** 32

## 2. Waypoint Frequency Distributions

| Pair | Model | Unique WPs | Top-1 (freq) | Top-2 (freq) | Top-3 (freq) | Entropy | KS p-value |
|------|-------|-----------|-------------|-------------|-------------|---------|-----------|
| p6a-music-mathematics | claude | 11 | harmony (1.000) | pattern (0.975) | symmetry (0.875) | 3.018 | 0.0000 |
| p6a-music-mathematics | gpt | 31 | rhythm (0.975) | pattern (0.700) | ratio (0.650) | 3.937 | 0.0000 |
| p6a-music-mathematics | grok | 26 | harmony (0.850) | frequency (0.650) | rhythm (0.475) | 3.967 | 0.0000 |
| p6a-music-mathematics | gemini | 17 | rhythm (1.000) | proportion (0.975) | harmonic (0.600) | 3.373 | 0.0000 |
| p6a-sun-desert | claude | 8 | drought (1.000) | heat (1.000) | dune (0.950) | 2.733 | 0.0000 |
| p6a-sun-desert | gpt | 11 | heat (0.950) | drought (0.875) | sunlight (0.775) | 2.992 | 0.0000 |
| p6a-sun-desert | grok | 13 | heat (1.000) | dune (0.925) | sand (0.875) | 2.967 | 0.0000 |
| p6a-sun-desert | gemini | 12 | aridity (0.975) | heat (0.950) | radiation (0.850) | 2.928 | 0.0000 |
| p6a-seed-garden | claude | 5 | cultivation (1.000) | germination (1.000) | root (1.000) | 2.322 | 1.0000 |
| p6a-seed-garden | gpt | 23 | seedle (0.975) | germination (0.900) | sprout (0.625) | 3.503 | 0.0000 |
| p6a-seed-garden | grok | 20 | sprout (0.875) | stem (0.750) | soil (0.475) | 3.650 | 0.0000 |
| p6a-seed-garden | gemini | 13 | cultivation (1.000) | germination (1.000) | root (1.000) | 2.990 | 0.0000 |
| p6a-light-color | claude | 6 | hue (1.000) | refraction (1.000) | spectrum (1.000) | 2.356 | 0.0000 |
| p6a-light-color | gpt | 36 | wavelength (0.925) | visible spectrum (0.850) | electromagnetic radiation (0.775) | 4.016 | 0.0000 |
| p6a-light-color | grok | 27 | wavelength (0.950) | spectrum (0.700) | cone cell (0.575) | 3.850 | 0.0000 |
| p6a-light-color | gemini | 10 | spectrum (1.000) | frequency (0.975) | refraction (0.750) | 2.913 | 0.0000 |
| p6a-bank-ocean | claude | 9 | current (1.000) | river (1.000) | shore (1.000) | 2.705 | 0.0000 |
| p6a-bank-ocean | gpt | 29 | river (0.875) | coastline (0.850) | estuary (0.850) | 3.587 | 0.0000 |
| p6a-bank-ocean | grok | 15 | river (1.000) | sea (0.975) | estuary (0.925) | 3.136 | 0.0000 |
| p6a-bank-ocean | gemini | 19 | vault (0.950) | treasure (0.775) | gold (0.750) | 3.446 | 0.0000 |
| p6a-emotion-melancholy | claude | 10 | feel (1.000) | long (1.000) | sadness (1.000) | 2.622 | 0.0000 |
| p6a-emotion-melancholy | gpt | 17 | mood (1.000) | sadness (0.975) | feel (0.825) | 3.156 | 0.0000 |
| p6a-emotion-melancholy | grok | 11 | sadness (0.950) | mood (0.925) | nostalgia (0.775) | 3.004 | 0.0000 |
| p6a-emotion-melancholy | gemini | 8 | wistfulness (1.000) | sadness (0.975) | sorrow (0.925) | 2.738 | 0.0000 |
| p6a-language-thought | claude | 7 | cognition (1.000) | concept (1.000) | mean (1.000) | 2.528 | 0.0000 |
| p6a-language-thought | gpt | 19 | semantic (1.000) | syntax (0.667) | symbol (0.600) | 3.578 | 0.0000 |
| p6a-language-thought | grok | 26 | semantic (0.900) | concept (0.733) | syntax (0.500) | 3.961 | 0.0000 |
| p6a-language-thought | gemini | 17 | semantic (1.000) | syntax (1.000) | intentionality (0.633) | 3.336 | 0.0000 |
| p6a-hot-cold | claude | 6 | chilly (1.000) | cool (1.000) | tepid (1.000) | 2.416 | 0.0003 |
| p6a-hot-cold | gpt | 11 | chilly (1.000) | cool (1.000) | warm (1.000) | 2.785 | 0.0000 |
| p6a-hot-cold | grok | 8 | chilly (1.000) | cool (1.000) | warm (1.000) | 2.670 | 0.0000 |
| p6a-hot-cold | gemini | 14 | tepid (1.000) | frigid (0.633) | warm (0.600) | 3.331 | 0.0000 |

## 3. Heavy-Tail Test (KS vs Uniform)

- **Pairs rejecting uniformity (raw p < 0.05):** 7 / 8
- **Pairs rejecting uniformity (Bonferroni p < 0.0063):** 7 / 8
- **Primary test (>=6 of 8 reject):** **PASSES**

**[observed]** The waypoint frequency distribution for the majority of focal pairs significantly departs from uniform, confirming heavy-tailed navigational salience structure.

## 4. Cross-Model Top-3 Agreement

| Pair | Mean Jaccard (top-3) | Model Pairs |
|------|---------------------|-------------|
| p6a-music-mathematics | 0.167 | claude-gpt:0.20, claude-grok:0.20, claude-gemini:0.00, gpt-grok:0.20, gpt-gemini:0.20, grok-gemini:0.20 |
| p6a-sun-desert | 0.300 | claude-gpt:0.50, claude-grok:0.50, claude-gemini:0.20, gpt-grok:0.20, gpt-gemini:0.20, grok-gemini:0.20 |
| p6a-seed-garden | 0.267 | claude-gpt:0.20, claude-grok:0.00, claude-gemini:1.00, gpt-grok:0.20, gpt-gemini:0.20, grok-gemini:0.00 |
| p6a-light-color | 0.183 | claude-gpt:0.00, claude-grok:0.20, claude-gemini:0.50, gpt-grok:0.20, gpt-gemini:0.00, grok-gemini:0.20 |
| p6a-bank-ocean | 0.150 | claude-gpt:0.20, claude-grok:0.20, claude-gemini:0.00, gpt-grok:0.50, gpt-gemini:0.00, grok-gemini:0.00 |
| p6a-emotion-melancholy | 0.300 | claude-gpt:0.50, claude-grok:0.20, claude-gemini:0.20, gpt-grok:0.50, gpt-gemini:0.20, grok-gemini:0.20 |
| p6a-language-thought | 0.283 | claude-gpt:0.00, claude-grok:0.20, claude-gemini:0.00, gpt-grok:0.50, gpt-gemini:0.50, grok-gemini:0.50 |
| p6a-hot-cold | 0.433 | claude-gpt:0.50, claude-grok:0.50, claude-gemini:0.20, gpt-grok:1.00, gpt-gemini:0.20, grok-gemini:0.20 |

## 5. Retroactive Cue-Strength Calibration

| Pair | Family | Intuitive Top | Empirical Top | Match? |
|------|--------|--------------|---------------|--------|
| p6a-sun-desert | physical-causation | heat | heat | YES |
| p6a-seed-garden | biological-growth | plant | germination | NO |
| p6a-light-color | optical | spectrum | wavelength | NO |
| p6a-music-mathematics | cross-domain | harmony | rhythm | NO |
| p6a-bank-ocean | polysemy | river | river | YES |
| p6a-emotion-melancholy | abstract-affect | sadness | sadness | YES |

## 6. Novel Waypoint Discovery

| Pair | Model | Waypoint | Frequency |
|------|-------|----------|-----------|
| p6a-music-mathematics | claude | pattern | 0.975 |
| p6a-music-mathematics | claude | symmetry | 0.875 |
| p6a-music-mathematics | claude | rhythm | 0.775 |
| p6a-music-mathematics | claude | geometry | 0.325 |
| p6a-music-mathematics | claude | frequency ratio | 0.225 |
| p6a-music-mathematics | claude | interval | 0.225 |
| p6a-music-mathematics | claude | tune system | 0.225 |
| p6a-music-mathematics | gpt | rhythm | 0.975 |
| p6a-music-mathematics | gpt | pattern | 0.700 |
| p6a-music-mathematics | gpt | ratio | 0.650 |
| p6a-music-mathematics | gpt | symmetry | 0.400 |
| p6a-music-mathematics | gpt | harmonic series | 0.375 |
| p6a-music-mathematics | gpt | meter | 0.300 |
| p6a-music-mathematics | gpt | proportion | 0.225 |
| p6a-music-mathematics | grok | frequency | 0.650 |
| p6a-music-mathematics | grok | rhythm | 0.475 |
| p6a-music-mathematics | grok | acoustics | 0.450 |
| p6a-music-mathematics | grok | fourier analysis | 0.375 |
| p6a-music-mathematics | grok | interval | 0.300 |
| p6a-music-mathematics | grok | waveform | 0.275 |
| p6a-music-mathematics | grok | scale | 0.250 |
| p6a-music-mathematics | grok | wave | 0.225 |
| p6a-music-mathematics | gemini | rhythm | 1.000 |
| p6a-music-mathematics | gemini | proportion | 0.975 |
| p6a-music-mathematics | gemini | harmonic | 0.600 |
| p6a-music-mathematics | gemini | set theory | 0.550 |
| p6a-music-mathematics | gemini | geometry | 0.500 |
| p6a-music-mathematics | gemini | topology | 0.275 |
| p6a-music-mathematics | gemini | frequency | 0.225 |
| p6a-sun-desert | claude | drought | 1.000 |
| p6a-sun-desert | claude | dune | 0.950 |
| p6a-sun-desert | claude | arid | 0.800 |
| p6a-sun-desert | claude | mirage | 0.525 |
| p6a-sun-desert | claude | oasis | 0.425 |
| p6a-sun-desert | claude | sand | 0.250 |
| p6a-sun-desert | gpt | drought | 0.875 |
| p6a-sun-desert | gpt | sunlight | 0.775 |
| p6a-sun-desert | gpt | evaporation | 0.725 |
| p6a-sun-desert | gpt | sand dune | 0.625 |
| p6a-sun-desert | gpt | aridity | 0.375 |
| p6a-sun-desert | gpt | sand | 0.375 |
| p6a-sun-desert | grok | dune | 0.925 |
| p6a-sun-desert | grok | sand | 0.875 |
| p6a-sun-desert | grok | cactus | 0.825 |
| p6a-sun-desert | grok | drought | 0.500 |
| p6a-sun-desert | grok | dryness | 0.375 |
| p6a-sun-desert | gemini | aridity | 0.975 |
| p6a-sun-desert | gemini | dune | 0.825 |
| p6a-sun-desert | gemini | sand | 0.625 |
| p6a-sun-desert | gemini | mirage | 0.300 |
| p6a-seed-garden | claude | cultivation | 1.000 |
| p6a-seed-garden | claude | root | 1.000 |
| p6a-seed-garden | claude | sprout | 1.000 |
| p6a-seed-garden | gpt | seedle | 0.975 |
| p6a-seed-garden | gpt | sprout | 0.625 |
| p6a-seed-garden | gpt | cultivation | 0.500 |
| p6a-seed-garden | gpt | mature plant | 0.275 |
| p6a-seed-garden | grok | sprout | 0.875 |
| p6a-seed-garden | grok | stem | 0.750 |
| p6a-seed-garden | grok | bud | 0.425 |
| p6a-seed-garden | grok | seedle | 0.425 |
| p6a-seed-garden | grok | blossom | 0.400 |
| p6a-seed-garden | grok | leaf | 0.375 |
| p6a-seed-garden | grok | bloom | 0.250 |
| p6a-seed-garden | gemini | cultivation | 1.000 |
| p6a-seed-garden | gemini | root | 1.000 |
| p6a-seed-garden | gemini | flourish | 0.525 |
| p6a-seed-garden | gemini | saple | 0.475 |
| p6a-seed-garden | gemini | bloom | 0.425 |
| p6a-light-color | claude | hue | 1.000 |
| p6a-light-color | claude | refraction | 1.000 |
| p6a-light-color | claude | wavelength | 1.000 |
| p6a-light-color | claude | perception | 0.975 |
| p6a-light-color | gpt | wavelength | 0.925 |
| p6a-light-color | gpt | visible spectrum | 0.850 |
| p6a-light-color | gpt | electromagnetic radiation | 0.775 |
| p6a-light-color | gpt | photon | 0.275 |
| p6a-light-color | gpt | visual perception | 0.250 |
| p6a-light-color | gpt | cone photoreceptor | 0.225 |
| p6a-light-color | grok | wavelength | 0.950 |
| p6a-light-color | grok | cone cell | 0.575 |
| p6a-light-color | grok | perception | 0.475 |
| p6a-light-color | grok | visible spectrum | 0.300 |
| p6a-light-color | grok | electromagnetic spectrum | 0.275 |
| p6a-light-color | grok | trichromacy | 0.275 |
| p6a-light-color | grok | visible light | 0.250 |
| p6a-light-color | grok | visible range | 0.225 |
| p6a-light-color | gemini | frequency | 0.975 |
| p6a-light-color | gemini | refraction | 0.750 |
| p6a-light-color | gemini | wavelength | 0.675 |
| p6a-light-color | gemini | perception | 0.650 |
| p6a-light-color | gemini | hue | 0.325 |
| p6a-light-color | gemini | wave | 0.325 |
| p6a-light-color | gemini | prism | 0.250 |
| p6a-bank-ocean | claude | current | 1.000 |
| p6a-bank-ocean | claude | shore | 1.000 |
| p6a-bank-ocean | claude | tide | 1.000 |
| p6a-bank-ocean | claude | sea | 0.425 |
| p6a-bank-ocean | claude | coast | 0.275 |
| p6a-bank-ocean | gpt | coastline | 0.850 |
| p6a-bank-ocean | gpt | estuary | 0.850 |
| p6a-bank-ocean | gpt | delta | 0.725 |
| p6a-bank-ocean | gpt | tributary | 0.375 |
| p6a-bank-ocean | gpt | sea | 0.275 |
| p6a-bank-ocean | grok | sea | 0.975 |
| p6a-bank-ocean | grok | estuary | 0.925 |
| p6a-bank-ocean | grok | bay | 0.500 |
| p6a-bank-ocean | grok | coast | 0.425 |
| p6a-bank-ocean | grok | delta | 0.425 |
| p6a-bank-ocean | grok | beach | 0.275 |
| p6a-bank-ocean | gemini | vault | 0.950 |
| p6a-bank-ocean | gemini | treasure | 0.775 |
| p6a-bank-ocean | gemini | gold | 0.750 |
| p6a-bank-ocean | gemini | island | 0.550 |
| p6a-bank-ocean | gemini | shoreline | 0.525 |
| p6a-bank-ocean | gemini | shipwreck | 0.225 |
| p6a-bank-ocean | gemini | tide | 0.225 |
| p6a-emotion-melancholy | claude | feel | 1.000 |
| p6a-emotion-melancholy | claude | long | 1.000 |
| p6a-emotion-melancholy | claude | wistfulness | 1.000 |
| p6a-emotion-melancholy | claude | reflection | 0.675 |
| p6a-emotion-melancholy | gpt | mood | 1.000 |
| p6a-emotion-melancholy | gpt | feel | 0.825 |
| p6a-emotion-melancholy | gpt | wistfulness | 0.500 |
| p6a-emotion-melancholy | gpt | long | 0.475 |
| p6a-emotion-melancholy | gpt | affect | 0.300 |
| p6a-emotion-melancholy | gpt | sorrow | 0.225 |
| p6a-emotion-melancholy | grok | mood | 0.925 |
| p6a-emotion-melancholy | grok | wistfulness | 0.625 |
| p6a-emotion-melancholy | grok | feel | 0.600 |
| p6a-emotion-melancholy | grok | sorrow | 0.450 |
| p6a-emotion-melancholy | grok | sentiment | 0.350 |
| p6a-emotion-melancholy | gemini | wistfulness | 1.000 |
| p6a-emotion-melancholy | gemini | sorrow | 0.925 |
| p6a-emotion-melancholy | gemini | sentiment | 0.750 |
| p6a-emotion-melancholy | gemini | pensiveness | 0.600 |
| p6a-emotion-melancholy | gemini | pensive | 0.400 |
| p6a-emotion-melancholy | gemini | affect | 0.325 |
| p6a-language-thought | claude | cognition | 1.000 |
| p6a-language-thought | claude | concept | 1.000 |
| p6a-language-thought | claude | mean | 1.000 |
| p6a-language-thought | claude | symbol | 1.000 |
| p6a-language-thought | claude | mental representation | 0.700 |
| p6a-language-thought | claude | representation | 0.267 |
| p6a-language-thought | gpt | semantic | 1.000 |
| p6a-language-thought | gpt | syntax | 0.667 |
| p6a-language-thought | gpt | symbol | 0.600 |
| p6a-language-thought | gpt | pragmatic | 0.533 |
| p6a-language-thought | gpt | mental representation | 0.467 |
| p6a-language-thought | gpt | mental model | 0.367 |
| p6a-language-thought | gpt | grammar | 0.267 |
| p6a-language-thought | gpt | concept | 0.233 |
| p6a-language-thought | grok | semantic | 0.900 |
| p6a-language-thought | grok | concept | 0.733 |
| p6a-language-thought | grok | syntax | 0.500 |
| p6a-language-thought | grok | symbol | 0.433 |
| p6a-language-thought | grok | pragmatic | 0.400 |
| p6a-language-thought | grok | cognition | 0.267 |
| p6a-language-thought | gemini | semantic | 1.000 |
| p6a-language-thought | gemini | syntax | 1.000 |
| p6a-language-thought | gemini | intentionality | 0.633 |
| p6a-language-thought | gemini | mentalese | 0.500 |
| p6a-language-thought | gemini | abstraction | 0.467 |
| p6a-language-thought | gemini | symbolism | 0.367 |
| p6a-language-thought | gemini | mental representation | 0.300 |
| p6a-hot-cold | claude | chilly | 1.000 |
| p6a-hot-cold | claude | cool | 1.000 |
| p6a-hot-cold | claude | tepid | 1.000 |
| p6a-hot-cold | claude | warm | 1.000 |
| p6a-hot-cold | claude | frigid | 0.900 |
| p6a-hot-cold | gpt | chilly | 1.000 |
| p6a-hot-cold | gpt | cool | 1.000 |
| p6a-hot-cold | gpt | warm | 1.000 |
| p6a-hot-cold | gpt | lukewarm | 0.900 |
| p6a-hot-cold | gpt | tepid | 0.567 |
| p6a-hot-cold | grok | chilly | 1.000 |
| p6a-hot-cold | grok | cool | 1.000 |
| p6a-hot-cold | grok | warm | 1.000 |
| p6a-hot-cold | grok | temperate | 0.800 |
| p6a-hot-cold | grok | lukewarm | 0.700 |
| p6a-hot-cold | grok | tepid | 0.333 |
| p6a-hot-cold | gemini | tepid | 1.000 |
| p6a-hot-cold | gemini | frigid | 0.633 |
| p6a-hot-cold | gemini | warm | 0.600 |
| p6a-hot-cold | gemini | sear | 0.567 |
| p6a-hot-cold | gemini | chilly | 0.533 |
| p6a-hot-cold | gemini | cool | 0.533 |
| p6a-hot-cold | gemini | brisk | 0.300 |
| p6a-hot-cold | gemini | lukewarm | 0.267 |
| p6a-hot-cold | gemini | temperate | 0.233 |

**[observed]** 190 novel waypoint(s) discovered at >20% frequency that were not previously identified as bridge concepts.

## 7. Predictions Summary

| # | Prediction | Result |
|---|------------|--------|
| 1 | Bridge-present pairs have top waypoint >30% freq | 24/24 (100%) |
| 2 | Bridge-absent pairs have top waypoint <15% freq | 0/8 |
| 3 | Universal bridge Jaccard 0.40-0.70, variable 0.10-0.40 | universal=0.24, variable=0.23 |
| 4 | Germination > plant on seed->garden | 4/4 models |
| 5 | At least one novel waypoint at >20% freq | YES |
| 6 | Claude lowest entropy, Grok highest | lowest=claude(2.59), highest=gpt(3.44) |
