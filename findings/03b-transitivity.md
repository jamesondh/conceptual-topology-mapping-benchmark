# Phase 3B: Transitive Path Structure Findings

> Generated: 2026-03-04T01:51:25.923Z

## 1. Experiment Overview

- **Triples analyzed:** 8
- **Models:** claude, gpt, grok, gemini
- **New API runs:** 600
- **Reused runs from Phase 1/2:** 680
- **Total triple/model combinations:** 32

## 2. Overall Transitivity Results

**Overall mean waypoint transitivity:** 0.095 (95% CI: [0.066, 0.125])

**Triangle inequality holds:** 29/32 (90.6%)

**Bridge concept appears on direct path:** 13/32 (40.6%)

## 3. By Triple Type

| Type | Mean Transitivity | 95% CI | Tri. Ineq. Holds | Bridge Freq | Triples |
|------|-------------------|--------|-------------------|-------------|---------|
| hierarchical | 0.175 | [0.112, 0.238] | 100% | 0.456 | 8 |
| semantic-chain | 0.073 | [0.032, 0.122] | 75% | 0.244 | 8 |
| existing-pair | 0.043 | [0.013, 0.077] | 100% | 0.000 | 4 |
| polysemy-extend | 0.150 | [0.104, 0.188] | 75% | 0.725 | 4 |
| random-control | 0.036 | [0.011, 0.070] | 100% | 0.000 | 8 |

**Prediction confirmed:** Hierarchical triples (0.175) show higher transitivity than random controls (0.036), suggesting taxonomic chains have compositional structure.

## 4. By Model

| Model | Mean Transitivity | 95% CI | Tri. Ineq. Holds | Mean Slack |
|-------|-------------------|--------|-------------------|------------|
| Claude Sonnet 4.6 | 0.112 | [0.054, 0.166] | 88% | 0.369 |
| GPT-5.2 | 0.101 | [0.044, 0.164] | 100% | 0.836 |
| Grok 4.1 Fast | 0.106 | [0.042, 0.185] | 100% | 0.717 |
| Gemini 3 Flash | 0.062 | [0.020, 0.108] | 75% | 0.265 |

## 5. Individual Triple Details

### triple-animal-dog-poodle (animal → dog → poodle)
Type: hierarchical — Taxonomic chain. 'dog' should be on the A→C route. Reuses animal→poodle (fwd+rev).

| Model | Transitivity | d(A→B) | d(B→C) | d(A→C) | Tri.Ineq | Slack | Bridge Freq | Shortcuts | Detours |
|-------|-------------|--------|--------|--------|----------|-------|-------------|-----------|---------|
| claude | 0.223 | 0.178 | 0.637 | 0.528 | ✓ | 0.286 | 0.50 | — | vertebrate, canine, domesticate, breed |
| gpt | 0.275 | 0.503 | 0.867 | 0.411 | ✓ | 0.960 | 0.15 | domestic dog, carnivoran | vertebrate, curly coated breed |
| grok | 0.312 | 0.247 | 0.715 | 0.327 | ✓ | 0.635 | 0.90 | dog | wolf, pet, lapdog, purebred, show dog |
| gemini | 0.217 | 0.404 | 0.592 | 0.550 | ✓ | 0.447 | 1.00 | dog, carnivoran | vertebrate, canid, carnivore, purebred, domesticate, curly coat, does not non shed, water retriever |

### triple-emotion-nostalgia-melancholy (emotion → nostalgia → melancholy)
Type: hierarchical — Emotional specificity chain. Reuses emotion→nostalgia (fwd+rev).

| Model | Transitivity | d(A→B) | d(B→C) | d(A→C) | Tri.Ineq | Slack | Bridge Freq | Shortcuts | Detours |
|-------|-------------|--------|--------|--------|----------|-------|-------------|-----------|---------|
| claude | 0.106 | 0.299 | 0.413 | 0.215 | ✓ | 0.497 | 0.10 | feel, sadness, wistfulness, reflection | memory, loss, time, bittersweet, absence, bittersweet remembrance, quiet grief, fading warmth |
| gpt | 0.149 | 0.629 | 0.464 | 0.546 | ✓ | 0.547 | 0.10 | sadness, mood, affect | reminiscence, long, feel, memory, bittersweetness |
| grok | 0.109 | 0.540 | 0.492 | 0.262 | ✓ | 0.770 | 0.90 | mood, sadness, nostalgia, feel | sentiment, memory, reminiscence, long, melancholy, regret, wistfulness, yearn |
| gemini | 0.006 | 0.571 | 0.430 | 0.279 | ✓ | 0.721 | 0.00 | sadness, sorrow, wistfulness, sentiment, pensive | memory, sentimentality, temporality, long, bittersweetness, absence, forlornness, yearn |

### triple-music-harmony-mathematics (music → harmony → mathematics)
Type: semantic-chain — 'harmony' bridges music & math domains. Reuses music→mathematics (fwd+rev).

| Model | Transitivity | d(A→B) | d(B→C) | d(A→C) | Tri.Ineq | Slack | Bridge Freq | Shortcuts | Detours |
|-------|-------------|--------|--------|--------|----------|-------|-------------|-----------|---------|
| claude | 0.224 | 0.330 | 0.200 | 0.337 | ✓ | 0.194 | 1.00 | harmony | melody, chord, sound, consonance, proportion, ratio |
| gpt | 0.069 | 0.446 | 0.737 | 0.529 | ✓ | 0.654 | 0.15 | pattern, ratio | melody, chord, consonance, sound, frequency ratio, music theory |
| grok | 0.061 | 0.561 | 0.764 | 0.743 | ✓ | 0.583 | 0.80 | harmony, rhythm, frequency | chord, interval, melody, ratio, proportion |
| gemini | 0.090 | 0.168 | 0.119 | 0.606 | ✗ | -0.319 | 0.00 | rhythm, set theory | sound, pitch, interval, chord, polyphony, symmetry, pattern, logic, axiom |

### triple-hot-energy-cold (hot → energy → cold)
Type: semantic-chain — Physical concept chain through antonym pair. Reuses hot→cold (fwd+rev).

| Model | Transitivity | d(A→B) | d(B→C) | d(A→C) | Tri.Ineq | Slack | Bridge Freq | Shortcuts | Detours |
|-------|-------------|--------|--------|--------|----------|-------|-------------|-----------|---------|
| claude | 0.000 | 0.067 | 0.000 | 0.089 | ✗ | -0.023 | 0.00 | warm, tepid, cool, chilly, frigid | temperature, heat, thermodynamics, work, physics, entropy, stillness |
| gpt | 0.084 | 0.594 | 0.379 | 0.214 | ✓ | 0.759 | 0.00 | warm, chilly, tepid, lukewarm | temperature, heat, work, warmth |
| grok | 0.058 | 0.765 | 0.516 | 0.239 | ✓ | 1.042 | 0.00 | warm, cool, chilly, lukewarm, temperate | heat, power, warmth, chill, tepid |
| gemini | 0.000 | 0.410 | 0.517 | 0.584 | ✓ | 0.342 | 0.00 | tepid, cool, warm | thermodynamics, vibration, kineticism, potential, work, motion, friction, stasis |

### triple-beyonce-justice-erosion (Beyoncé → justice → erosion)
Type: existing-pair — Maximum data reuse — 4 of 6 legs exist. Tests whether justice is 'on the route' between Beyoncé and erosion.

| Model | Transitivity | d(A→B) | d(B→C) | d(A→C) | Tri.Ineq | Slack | Bridge Freq | Shortcuts | Detours |
|-------|-------------|--------|--------|--------|----------|-------|-------------|-----------|---------|
| claude | 0.097 | 0.617 | 0.185 | 0.358 | ✓ | 0.444 | 0.00 | destiny, geology, layer, gradual change | civil right, lemonade, equity, punishment, decay, time, gradual |
| gpt | 0.050 | 0.779 | 0.673 | 0.924 | ✓ | 0.528 | 0.00 | — | civil right, social activism, law, weather, decay |
| grok | 0.011 | 0.643 | 0.736 | 0.871 | ✓ | 0.508 | 0.00 | weather, formation | feminism, civil right, empowerment, equality, decay, corruption |
| gemini | 0.016 | 0.220 | 0.639 | 0.769 | ✓ | 0.090 | 0.00 | weather | empowerment, representation, civil right, equity, restorative law, attrition, decay, neglect |

### triple-bank-river-ocean (bank → river → ocean)
Type: polysemy-extend — Geographic chain extending polysemy pair. Reuses bank→river (fwd+rev).

| Model | Transitivity | d(A→B) | d(B→C) | d(A→C) | Tri.Ineq | Slack | Bridge Freq | Shortcuts | Detours |
|-------|-------------|--------|--------|--------|----------|-------|-------------|-----------|---------|
| claude | 0.142 | 0.372 | 0.389 | 0.274 | ✓ | 0.488 | 1.00 | river, tide, shore | flow, stream, channel, water, delta, estuary, tributary, bay, strait |
| gpt | 0.174 | 0.869 | 0.439 | 0.609 | ✓ | 0.699 | 0.90 | river, coastline | money, tributary, stream |
| grok | 0.203 | 0.690 | 0.446 | 0.515 | ✓ | 0.621 | 1.00 | river | current, flow, stream, deposit, delta, bay, gulf |
| gemini | 0.080 | 0.558 | 0.000 | 0.619 | ✗ | -0.061 | 0.00 | gold, treasure | current, deposit, silt, tributary, estuary, delta, coastline, horizon |

### triple-music-stapler-mathematics (music → stapler → mathematics)
Type: random-control — Random B inserted into existing pair. Stapler should NOT be on-route. Reuses music→mathematics (fwd+rev).

| Model | Transitivity | d(A→B) | d(B→C) | d(A→C) | Tri.Ineq | Slack | Bridge Freq | Shortcuts | Detours |
|-------|-------------|--------|--------|--------|----------|-------|-------------|-----------|---------|
| claude | 0.100 | 0.353 | 0.506 | 0.337 | ✓ | 0.522 | 0.00 | harmony, pattern, symmetry | binding, percussion, mechanical repetition, office supply, count, geometry, logic, measurement |
| gpt | 0.010 | 0.784 | 0.872 | 0.529 | ✓ | 1.127 | 0.00 | rhythm, pattern, ratio | sheet music, document |
| grok | 0.002 | 0.735 | 0.735 | 0.743 | ✓ | 0.727 | 0.00 | harmony, rhythm, frequency | paper, piano, keyboard, notebook, calculator, equation |
| gemini | 0.085 | 0.638 | 0.299 | 0.606 | ✓ | 0.332 | 0.00 | proportion, set theory | repetition, mechanical action, document, logic, axiom, paper |

### triple-hot-flamingo-cold (hot → flamingo → cold)
Type: random-control — Random B inserted into antonym pair. Flamingo should NOT be on-route. Reuses hot→cold (fwd+rev).

| Model | Transitivity | d(A→B) | d(B→C) | d(A→C) | Tri.Ineq | Slack | Bridge Freq | Shortcuts | Detours |
|-------|-------------|--------|--------|--------|----------|-------|-------------|-----------|---------|
| claude | 0.000 | 0.364 | 0.266 | 0.089 | ✓ | 0.541 | 0.00 | warm, tepid, cool, chilly, frigid | fire, tropical, pink, feather, bird, heat, temperature, ice |
| gpt | 0.000 | 0.762 | 0.870 | 0.214 | ✓ | 1.418 | 0.00 | warm, cool, chilly, tepid, lukewarm | pink plumage, wade bird, pink |
| grok | 0.094 | 0.215 | 0.873 | 0.239 | ✓ | 0.849 | 0.00 | warm, cool, chilly, lukewarm, temperate | fire, flame, pink, bird, flaming |
| gemini | 0.000 | 0.398 | 0.758 | 0.584 | ✓ | 0.572 | 0.00 | tepid, cool, warm | tropical, lagoon, pink, iceberg, tropical lagoon, saltwater |

## 6. Appendix: All Triple/Model Metrics

| Triple | Model | Transitivity | CI | d(AB) | d(BC) | d(AC) | Tri.Ineq | Slack | Bridge | Runs(AB) | Runs(BC) | Runs(AC) |
|--------|-------|--------------|----|-------|-------|-------|----------|-------|--------|----------|----------|----------|
| triple-animal-dog-poodle | claude | 0.223 | [0.220,0.226] | 0.178 | 0.637 | 0.528 | ✓ | 0.286 | 0.50 | 10 | 10 | 20 |
| triple-animal-dog-poodle | gpt | 0.275 | [0.271,0.279] | 0.503 | 0.867 | 0.411 | ✓ | 0.960 | 0.15 | 10 | 10 | 20 |
| triple-animal-dog-poodle | grok | 0.312 | [0.310,0.315] | 0.247 | 0.715 | 0.327 | ✓ | 0.635 | 0.90 | 10 | 10 | 20 |
| triple-animal-dog-poodle | gemini | 0.217 | [0.214,0.221] | 0.404 | 0.592 | 0.550 | ✓ | 0.447 | 1.00 | 10 | 10 | 20 |
| triple-emotion-nostalgia-melancholy | claude | 0.106 | [0.104,0.109] | 0.299 | 0.413 | 0.215 | ✓ | 0.497 | 0.10 | 10 | 10 | 10 |
| triple-emotion-nostalgia-melancholy | gpt | 0.149 | [0.143,0.155] | 0.629 | 0.464 | 0.546 | ✓ | 0.547 | 0.10 | 10 | 10 | 10 |
| triple-emotion-nostalgia-melancholy | grok | 0.109 | [0.106,0.113] | 0.540 | 0.492 | 0.262 | ✓ | 0.770 | 0.90 | 10 | 10 | 10 |
| triple-emotion-nostalgia-melancholy | gemini | 0.006 | [0.005,0.008] | 0.571 | 0.430 | 0.279 | ✓ | 0.721 | 0.00 | 10 | 10 | 10 |
| triple-music-harmony-mathematics | claude | 0.224 | [0.221,0.227] | 0.330 | 0.200 | 0.337 | ✓ | 0.194 | 1.00 | 10 | 10 | 20 |
| triple-music-harmony-mathematics | gpt | 0.069 | [0.068,0.070] | 0.446 | 0.737 | 0.529 | ✓ | 0.654 | 0.15 | 10 | 10 | 20 |
| triple-music-harmony-mathematics | grok | 0.061 | [0.058,0.063] | 0.561 | 0.764 | 0.743 | ✓ | 0.583 | 0.80 | 10 | 10 | 20 |
| triple-music-harmony-mathematics | gemini | 0.090 | [0.088,0.092] | 0.168 | 0.119 | 0.606 | ✗ | -0.319 | 0.00 | 10 | 10 | 20 |
| triple-hot-energy-cold | claude | 0.000 | [0.000,0.000] | 0.067 | 0.000 | 0.089 | ✗ | -0.023 | 0.00 | 10 | 10 | 20 |
| triple-hot-energy-cold | gpt | 0.084 | [0.084,0.084] | 0.594 | 0.379 | 0.214 | ✓ | 0.759 | 0.00 | 10 | 10 | 20 |
| triple-hot-energy-cold | grok | 0.058 | [0.055,0.060] | 0.765 | 0.516 | 0.239 | ✓ | 1.042 | 0.00 | 10 | 10 | 20 |
| triple-hot-energy-cold | gemini | 0.000 | [0.000,0.000] | 0.410 | 0.517 | 0.584 | ✓ | 0.342 | 0.00 | 10 | 10 | 20 |
| triple-beyonce-justice-erosion | claude | 0.097 | [0.096,0.099] | 0.617 | 0.185 | 0.358 | ✓ | 0.444 | 0.00 | 10 | 20 | 20 |
| triple-beyonce-justice-erosion | gpt | 0.050 | [0.048,0.051] | 0.779 | 0.673 | 0.924 | ✓ | 0.528 | 0.00 | 10 | 20 | 20 |
| triple-beyonce-justice-erosion | grok | 0.011 | [0.010,0.012] | 0.643 | 0.736 | 0.871 | ✓ | 0.508 | 0.00 | 10 | 20 | 20 |
| triple-beyonce-justice-erosion | gemini | 0.016 | [0.015,0.017] | 0.220 | 0.639 | 0.769 | ✓ | 0.090 | 0.00 | 10 | 20 | 20 |
| triple-bank-river-ocean | claude | 0.142 | [0.138,0.146] | 0.372 | 0.389 | 0.274 | ✓ | 0.488 | 1.00 | 20 | 10 | 10 |
| triple-bank-river-ocean | gpt | 0.174 | [0.171,0.177] | 0.869 | 0.439 | 0.609 | ✓ | 0.699 | 0.90 | 20 | 10 | 10 |
| triple-bank-river-ocean | grok | 0.203 | [0.198,0.208] | 0.690 | 0.446 | 0.515 | ✓ | 0.621 | 1.00 | 20 | 10 | 10 |
| triple-bank-river-ocean | gemini | 0.080 | [0.078,0.083] | 0.558 | 0.000 | 0.619 | ✗ | -0.061 | 0.00 | 20 | 10 | 10 |
| triple-music-stapler-mathematics | claude | 0.100 | [0.098,0.103] | 0.353 | 0.506 | 0.337 | ✓ | 0.522 | 0.00 | 10 | 10 | 20 |
| triple-music-stapler-mathematics | gpt | 0.010 | [0.008,0.011] | 0.784 | 0.872 | 0.529 | ✓ | 1.127 | 0.00 | 10 | 10 | 20 |
| triple-music-stapler-mathematics | grok | 0.002 | [0.001,0.002] | 0.735 | 0.735 | 0.743 | ✓ | 0.727 | 0.00 | 10 | 10 | 20 |
| triple-music-stapler-mathematics | gemini | 0.085 | [0.084,0.086] | 0.638 | 0.299 | 0.606 | ✓ | 0.332 | 0.00 | 10 | 10 | 20 |
| triple-hot-flamingo-cold | claude | 0.000 | [0.000,0.000] | 0.364 | 0.266 | 0.089 | ✓ | 0.541 | 0.00 | 10 | 10 | 20 |
| triple-hot-flamingo-cold | gpt | 0.000 | [0.000,0.000] | 0.762 | 0.870 | 0.214 | ✓ | 1.418 | 0.00 | 10 | 10 | 20 |
| triple-hot-flamingo-cold | grok | 0.094 | [0.088,0.099] | 0.215 | 0.873 | 0.239 | ✓ | 0.849 | 0.00 | 10 | 10 | 20 |
| triple-hot-flamingo-cold | gemini | 0.000 | [0.000,0.000] | 0.398 | 0.758 | 0.584 | ✓ | 0.572 | 0.00 | 10 | 10 | 20 |
