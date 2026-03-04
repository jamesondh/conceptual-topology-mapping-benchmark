# Phase 5A: Cue-Strength Gradient Findings

> Generated: 2026-03-04T15:17:45.991Z

## 1. Experiment Overview

- **Triples analyzed:** 14
- **Models:** claude, gpt, grok, gemini
- **Families:** physical-causation, biological-growth, compositional-hierarchy, abstract-affect
- **New API runs (Phase 5A):** 2040
- **Reused run usages:** 200
- **Total triple/model combinations:** 56

## 2. Per-Family Gradient Results

| Triple | Model | Cue Level | Bridge Freq | CI | Family |
|--------|-------|-----------|-------------|-----|--------|
| p5a-sun-heat-desert | claude | very-high (4) | 1.00 | [1.00, 1.00] | physical-causation |
| p5a-sun-radiation-desert | claude | medium (2) | 0.00 | [0.00, 0.00] | physical-causation |
| p5a-sun-solstice-desert | claude | low (1) | 0.00 | [0.00, 0.00] | physical-causation |
| p5a-sun-heat-desert | gpt | very-high (4) | 1.00 | [1.00, 1.00] | physical-causation |
| p5a-sun-radiation-desert | gpt | medium (2) | 0.00 | [0.00, 0.00] | physical-causation |
| p5a-sun-solstice-desert | gpt | low (1) | 0.00 | [0.00, 0.00] | physical-causation |
| p5a-sun-heat-desert | grok | very-high (4) | 0.90 | [0.75, 1.00] | physical-causation |
| p5a-sun-radiation-desert | grok | medium (2) | 0.00 | [0.00, 0.00] | physical-causation |
| p5a-sun-solstice-desert | grok | low (1) | 0.00 | [0.00, 0.00] | physical-causation |
| p5a-sun-heat-desert | gemini | very-high (4) | 1.00 | [1.00, 1.00] | physical-causation |
| p5a-sun-radiation-desert | gemini | medium (2) | 0.80 | [0.60, 0.95] | physical-causation |
| p5a-sun-solstice-desert | gemini | low (1) | 0.00 | [0.00, 0.00] | physical-causation |
| p5a-seed-plant-garden | claude | very-high (4) | 0.00 | [0.00, 0.00] | biological-growth |
| p5a-seed-germination-garden | claude | medium (2) | 1.00 | [1.00, 1.00] | biological-growth |
| p5a-seed-husk-garden | claude | low (1) | 0.00 | [0.00, 0.00] | biological-growth |
| p5a-seed-plant-garden | gpt | very-high (4) | 0.65 | [0.45, 0.85] | biological-growth |
| p5a-seed-germination-garden | gpt | medium (2) | 0.95 | [0.85, 1.00] | biological-growth |
| p5a-seed-husk-garden | gpt | low (1) | 0.00 | [0.00, 0.00] | biological-growth |
| p5a-seed-plant-garden | grok | very-high (4) | 0.00 | [0.00, 0.00] | biological-growth |
| p5a-seed-germination-garden | grok | medium (2) | 0.15 | [0.00, 0.30] | biological-growth |
| p5a-seed-husk-garden | grok | low (1) | 0.00 | [0.00, 0.00] | biological-growth |
| p5a-seed-plant-garden | gemini | very-high (4) | 0.00 | [0.00, 0.00] | biological-growth |
| p5a-seed-germination-garden | gemini | medium (2) | 1.00 | [1.00, 1.00] | biological-growth |
| p5a-seed-husk-garden | gemini | low (1) | 0.00 | [0.00, 0.00] | biological-growth |
| p5a-word-sentence-paragraph | claude | very-high (4) | 1.00 | [1.00, 1.00] | compositional-hierarchy |
| p5a-word-clause-paragraph | claude | medium (2) | 1.00 | [1.00, 1.00] | compositional-hierarchy |
| p5a-word-syllable-paragraph | claude | low (1) | 0.00 | [0.00, 0.00] | compositional-hierarchy |
| p5a-word-sentence-paragraph | gpt | very-high (4) | 1.00 | [1.00, 1.00] | compositional-hierarchy |
| p5a-word-clause-paragraph | gpt | medium (2) | 1.00 | [1.00, 1.00] | compositional-hierarchy |
| p5a-word-syllable-paragraph | gpt | low (1) | 0.00 | [0.00, 0.00] | compositional-hierarchy |
| p5a-word-sentence-paragraph | grok | very-high (4) | 1.00 | [1.00, 1.00] | compositional-hierarchy |
| p5a-word-clause-paragraph | grok | medium (2) | 0.90 | [0.75, 1.00] | compositional-hierarchy |
| p5a-word-syllable-paragraph | grok | low (1) | 0.00 | [0.00, 0.00] | compositional-hierarchy |
| p5a-word-sentence-paragraph | gemini | very-high (4) | 1.00 | [1.00, 1.00] | compositional-hierarchy |
| p5a-word-clause-paragraph | gemini | medium (2) | 1.00 | [1.00, 1.00] | compositional-hierarchy |
| p5a-word-syllable-paragraph | gemini | low (1) | 0.00 | [0.00, 0.00] | compositional-hierarchy |
| p5a-emotion-sadness-melancholy | claude | high (3) | 1.00 | [1.00, 1.00] | abstract-affect |
| p5a-emotion-nostalgia-melancholy | claude | medium (2) | 0.15 | [0.00, 0.35] | abstract-affect |
| p5a-emotion-apathy-melancholy | claude | low (1) | 0.00 | [0.00, 0.00] | abstract-affect |
| p5a-emotion-sadness-melancholy | gpt | high (3) | 1.00 | [1.00, 1.00] | abstract-affect |
| p5a-emotion-nostalgia-melancholy | gpt | medium (2) | 0.30 | [0.10, 0.50] | abstract-affect |
| p5a-emotion-apathy-melancholy | gpt | low (1) | 0.00 | [0.00, 0.00] | abstract-affect |
| p5a-emotion-sadness-melancholy | grok | high (3) | 0.97 | [0.90, 1.00] | abstract-affect |
| p5a-emotion-nostalgia-melancholy | grok | medium (2) | 0.80 | [0.60, 0.95] | abstract-affect |
| p5a-emotion-apathy-melancholy | grok | low (1) | 0.00 | [0.00, 0.00] | abstract-affect |
| p5a-emotion-sadness-melancholy | gemini | high (3) | 1.00 | [1.00, 1.00] | abstract-affect |
| p5a-emotion-nostalgia-melancholy | gemini | medium (2) | 0.00 | [0.00, 0.00] | abstract-affect |
| p5a-emotion-apathy-melancholy | gemini | low (1) | 0.00 | [0.00, 0.00] | abstract-affect |

## 3. Monotonicity Check

Does bridge frequency monotonically decrease as cue strength decreases?

| Family | Model | Monotonic Decrease? |
|--------|-------|---------------------|
| physical-causation | claude | YES |
| physical-causation | gpt | YES |
| physical-causation | grok | YES |
| physical-causation | gemini | YES |
| biological-growth | claude | NO |
| biological-growth | gpt | NO |
| biological-growth | grok | NO |
| biological-growth | gemini | NO |
| compositional-hierarchy | claude | YES |
| compositional-hierarchy | gpt | YES |
| compositional-hierarchy | grok | YES |
| compositional-hierarchy | gemini | YES |
| abstract-affect | claude | YES |
| abstract-affect | gpt | YES |
| abstract-affect | grok | YES |
| abstract-affect | gemini | YES |

**12/16** family/model combinations show monotonic decrease.

## 4. Logistic Fit Results

Cross-family logistic curve fit (pooling all diagnostic triples per model):

| Model | Threshold | Steepness | R-squared |
|-------|-----------|-----------|-----------|
| claude | 2.02 | 2.06 | 0.323 |
| gpt | 1.96 | 2.17 | 0.640 |
| grok | 2.16 | 1.97 | 0.311 |
| gemini | 1.79 | 2.22 | 0.370 |

## 5. Gemini Threshold Comparison

- **Gemini threshold:** 1.79
- **Other models mean threshold:** 2.05
- **Threshold difference:** -0.26
- **95% CI:** [-1.00, 1.07]
- **Significantly higher?** NO

Gemini's threshold is not significantly different from other models. The fragmentation hypothesis from Phase 4 is not supported by the cue-strength gradient.

## 6. Transitivity vs Cue Strength

| Triple | Model | Cue Level | Transitivity | Tri. Ineq. | Runs (AB/BC/AC) |
|--------|-------|-----------|-------------|------------|-----------------|
| p5a-sun-heat-desert | claude | very-high (4) | 0.256 | N | 10/10/20 |
| p5a-sun-heat-desert | gpt | very-high (4) | 0.251 | Y | 10/10/20 |
| p5a-sun-heat-desert | grok | very-high (4) | 0.158 | Y | 10/10/20 |
| p5a-sun-heat-desert | gemini | very-high (4) | 0.225 | Y | 10/10/20 |
| p5a-sun-radiation-desert | claude | medium (2) | 0.303 | Y | 10/10/20 |
| p5a-sun-radiation-desert | gpt | medium (2) | 0.081 | Y | 10/10/20 |
| p5a-sun-radiation-desert | grok | medium (2) | 0.171 | Y | 10/10/20 |
| p5a-sun-radiation-desert | gemini | medium (2) | 0.117 | Y | 10/10/20 |
| p5a-sun-solstice-desert | claude | low (1) | 0.322 | Y | 10/10/20 |
| p5a-sun-solstice-desert | gpt | low (1) | 0.202 | Y | 10/10/20 |
| p5a-sun-solstice-desert | grok | low (1) | 0.164 | Y | 10/10/20 |
| p5a-sun-solstice-desert | gemini | low (1) | 0.189 | N | 10/10/20 |
| p5a-seed-plant-garden | claude | very-high (4) | 0.517 | Y | 10/10/20 |
| p5a-seed-plant-garden | gpt | very-high (4) | 0.268 | Y | 10/10/20 |
| p5a-seed-plant-garden | grok | very-high (4) | 0.205 | Y | 10/10/20 |
| p5a-seed-plant-garden | gemini | very-high (4) | 0.227 | Y | 10/10/20 |
| p5a-seed-germination-garden | claude | medium (2) | 0.460 | Y | 10/10/20 |
| p5a-seed-germination-garden | gpt | medium (2) | 0.172 | Y | 10/10/20 |
| p5a-seed-germination-garden | grok | medium (2) | 0.120 | Y | 10/10/20 |
| p5a-seed-germination-garden | gemini | medium (2) | 0.223 | N | 10/10/20 |
| p5a-seed-husk-garden | claude | low (1) | 0.273 | Y | 10/10/20 |
| p5a-seed-husk-garden | gpt | low (1) | 0.292 | Y | 10/10/20 |
| p5a-seed-husk-garden | grok | low (1) | 0.261 | Y | 10/10/20 |
| p5a-seed-husk-garden | gemini | low (1) | 0.196 | Y | 10/10/20 |
| p5a-word-sentence-paragraph | claude | very-high (4) | 0.309 | Y | 10/10/20 |
| p5a-word-sentence-paragraph | gpt | very-high (4) | 0.187 | Y | 10/10/20 |
| p5a-word-sentence-paragraph | grok | very-high (4) | 0.175 | Y | 10/10/20 |
| p5a-word-sentence-paragraph | gemini | very-high (4) | 0.296 | Y | 10/10/20 |
| p5a-word-clause-paragraph | claude | medium (2) | 0.282 | Y | 10/10/20 |
| p5a-word-clause-paragraph | gpt | medium (2) | 0.182 | Y | 10/10/20 |
| p5a-word-clause-paragraph | grok | medium (2) | 0.138 | Y | 10/10/20 |
| p5a-word-clause-paragraph | gemini | medium (2) | 0.179 | Y | 10/10/20 |
| p5a-word-syllable-paragraph | claude | low (1) | 0.368 | Y | 10/10/20 |
| p5a-word-syllable-paragraph | gpt | low (1) | 0.271 | Y | 10/10/20 |
| p5a-word-syllable-paragraph | grok | low (1) | 0.217 | N | 10/10/20 |
| p5a-word-syllable-paragraph | gemini | low (1) | 0.413 | Y | 10/10/20 |
| p5a-emotion-sadness-melancholy | claude | high (3) | 0.314 | Y | 10/10/30 |
| p5a-emotion-sadness-melancholy | gpt | high (3) | 0.191 | Y | 10/10/30 |
| p5a-emotion-sadness-melancholy | grok | high (3) | 0.322 | Y | 10/10/30 |
| p5a-emotion-sadness-melancholy | gemini | high (3) | 0.094 | Y | 10/10/30 |
| p5a-emotion-nostalgia-melancholy | claude | medium (2) | 0.106 | Y | 10/10/20 |
| p5a-emotion-nostalgia-melancholy | gpt | medium (2) | 0.152 | Y | 10/10/20 |
| p5a-emotion-nostalgia-melancholy | grok | medium (2) | 0.130 | Y | 10/10/20 |
| p5a-emotion-nostalgia-melancholy | gemini | medium (2) | 0.005 | Y | 10/10/20 |
| p5a-emotion-apathy-melancholy | claude | low (1) | 0.274 | Y | 10/10/30 |
| p5a-emotion-apathy-melancholy | gpt | low (1) | 0.073 | Y | 10/10/30 |
| p5a-emotion-apathy-melancholy | grok | low (1) | 0.123 | Y | 10/10/30 |
| p5a-emotion-apathy-melancholy | gemini | low (1) | 0.109 | Y | 10/10/30 |
| p5a-sun-umbrella-desert | claude | low (0) | 0.099 | Y | 10/10/10 |
| p5a-sun-umbrella-desert | gpt | low (0) | 0.255 | Y | 10/10/10 |
| p5a-sun-umbrella-desert | grok | low (0) | 0.196 | Y | 10/10/10 |
| p5a-sun-umbrella-desert | gemini | low (0) | 0.105 | Y | 10/10/10 |
| p5a-seed-telescope-garden | claude | low (0) | 0.022 | Y | 10/10/10 |
| p5a-seed-telescope-garden | gpt | low (0) | 0.051 | Y | 10/10/10 |
| p5a-seed-telescope-garden | grok | low (0) | 0.020 | Y | 10/10/10 |
| p5a-seed-telescope-garden | gemini | low (0) | 0.034 | Y | 10/10/10 |

## 7. Controls Validation

Random control triples should show ~0% bridge frequency (<=0.05).

| Triple | Model | Bridge Freq | Expected | Pass? |
|--------|-------|-------------|----------|-------|
| p5a-sun-umbrella-desert | claude | 0.00 | <= 0.05 | PASS |
| p5a-sun-umbrella-desert | gpt | 0.00 | <= 0.05 | PASS |
| p5a-sun-umbrella-desert | grok | 0.00 | <= 0.05 | PASS |
| p5a-sun-umbrella-desert | gemini | 0.00 | <= 0.05 | PASS |
| p5a-seed-telescope-garden | claude | 0.00 | <= 0.05 | PASS |
| p5a-seed-telescope-garden | gpt | 0.00 | <= 0.05 | PASS |
| p5a-seed-telescope-garden | grok | 0.00 | <= 0.05 | PASS |
| p5a-seed-telescope-garden | gemini | 0.00 | <= 0.05 | PASS |

**All controls pass:** Random bridge concepts do not appear on direct paths.

## 8. Predictions Summary

**Prediction success rate:** 31/48 (64.6%)

| Triple | Model | Predicted | Observed | Match? |
|--------|-------|-----------|----------|--------|
| p5a-sun-heat-desert | claude | [0.80, 1.00] | 1.00 | YES |
| p5a-sun-heat-desert | gpt | [0.80, 1.00] | 1.00 | YES |
| p5a-sun-heat-desert | grok | [0.80, 1.00] | 0.90 | YES |
| p5a-sun-heat-desert | gemini | [0.80, 1.00] | 1.00 | YES |
| p5a-sun-radiation-desert | claude | [0.30, 0.80] | 0.00 | NO |
| p5a-sun-radiation-desert | gpt | [0.30, 0.80] | 0.00 | NO |
| p5a-sun-radiation-desert | grok | [0.30, 0.80] | 0.00 | NO |
| p5a-sun-radiation-desert | gemini | [0.00, 0.20] | 0.80 | NO |
| p5a-sun-solstice-desert | claude | [0.00, 0.30] | 0.00 | YES |
| p5a-sun-solstice-desert | gpt | [0.00, 0.30] | 0.00 | YES |
| p5a-sun-solstice-desert | grok | [0.00, 0.30] | 0.00 | YES |
| p5a-sun-solstice-desert | gemini | [0.00, 0.30] | 0.00 | YES |
| p5a-seed-plant-garden | claude | [0.80, 1.00] | 0.00 | NO |
| p5a-seed-plant-garden | gpt | [0.80, 1.00] | 0.65 | NO |
| p5a-seed-plant-garden | grok | [0.80, 1.00] | 0.00 | NO |
| p5a-seed-plant-garden | gemini | [0.80, 1.00] | 0.00 | NO |
| p5a-seed-germination-garden | claude | [0.30, 0.80] | 1.00 | NO |
| p5a-seed-germination-garden | gpt | [0.30, 0.80] | 0.95 | NO |
| p5a-seed-germination-garden | grok | [0.30, 0.80] | 0.15 | NO |
| p5a-seed-germination-garden | gemini | [0.00, 0.20] | 1.00 | NO |
| p5a-seed-husk-garden | claude | [0.00, 0.30] | 0.00 | YES |
| p5a-seed-husk-garden | gpt | [0.00, 0.30] | 0.00 | YES |
| p5a-seed-husk-garden | grok | [0.00, 0.30] | 0.00 | YES |
| p5a-seed-husk-garden | gemini | [0.00, 0.30] | 0.00 | YES |
| p5a-word-sentence-paragraph | claude | [0.80, 1.00] | 1.00 | YES |
| p5a-word-sentence-paragraph | gpt | [0.80, 1.00] | 1.00 | YES |
| p5a-word-sentence-paragraph | grok | [0.80, 1.00] | 1.00 | YES |
| p5a-word-sentence-paragraph | gemini | [0.80, 1.00] | 1.00 | YES |
| p5a-word-clause-paragraph | claude | [0.30, 0.80] | 1.00 | NO |
| p5a-word-clause-paragraph | gpt | [0.30, 0.80] | 1.00 | NO |
| p5a-word-clause-paragraph | grok | [0.30, 0.80] | 0.90 | NO |
| p5a-word-clause-paragraph | gemini | [0.00, 0.20] | 1.00 | NO |
| p5a-word-syllable-paragraph | claude | [0.00, 0.30] | 0.00 | YES |
| p5a-word-syllable-paragraph | gpt | [0.00, 0.30] | 0.00 | YES |
| p5a-word-syllable-paragraph | grok | [0.00, 0.30] | 0.00 | YES |
| p5a-word-syllable-paragraph | gemini | [0.00, 0.30] | 0.00 | YES |
| p5a-emotion-sadness-melancholy | claude | [0.70, 1.00] | 1.00 | YES |
| p5a-emotion-sadness-melancholy | gpt | [0.70, 1.00] | 1.00 | YES |
| p5a-emotion-sadness-melancholy | grok | [0.70, 1.00] | 0.97 | YES |
| p5a-emotion-sadness-melancholy | gemini | [0.40, 1.00] | 1.00 | YES |
| p5a-emotion-nostalgia-melancholy | claude | [0.30, 0.80] | 0.15 | NO |
| p5a-emotion-nostalgia-melancholy | gpt | [0.30, 0.80] | 0.30 | YES |
| p5a-emotion-nostalgia-melancholy | grok | [0.30, 0.80] | 0.80 | YES |
| p5a-emotion-nostalgia-melancholy | gemini | [0.00, 0.20] | 0.00 | YES |
| p5a-emotion-apathy-melancholy | claude | [0.00, 0.30] | 0.00 | YES |
| p5a-emotion-apathy-melancholy | gpt | [0.00, 0.30] | 0.00 | YES |
| p5a-emotion-apathy-melancholy | grok | [0.00, 0.30] | 0.00 | YES |
| p5a-emotion-apathy-melancholy | gemini | [0.00, 0.30] | 0.00 | YES |
