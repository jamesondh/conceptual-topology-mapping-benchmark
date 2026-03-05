# Phase 7C: Too-Central Boundary Characterization Findings

> Generated: 2026-03-05T00:17:53.738Z

## 1. Experiment Overview

- **Pairs analyzed:** 10
- **Models:** claude, gpt, grok, gemini
- **New runs:** 320
- **Reused runs:** 200
- **Bridge frequency observations:** 40

## 2. Bridge Frequency Table (Pair x Model)

| Pair | Model | Category | Bridge | Freq | CI Low | CI High | Runs |
|------|-------|----------|--------|------|--------|---------|------|
| p7c-spark-ash | claude | too-central | fire | 0.000 | 0.000 | 0.000 | 20 |
| p7c-spark-ash | gpt | too-central | fire | 0.150 | 0.000 | 0.300 | 20 |
| p7c-spark-ash | grok | too-central | fire | 0.000 | 0.000 | 0.000 | 20 |
| p7c-spark-ash | gemini | too-central | fire | 0.000 | 0.000 | 0.000 | 20 |
| p7c-acorn-timber | claude | too-central | tree | 1.000 | 1.000 | 1.000 | 10 |
| p7c-acorn-timber | gpt | too-central | tree | 1.000 | 1.000 | 1.000 | 10 |
| p7c-acorn-timber | grok | too-central | tree | 1.000 | 1.000 | 1.000 | 10 |
| p7c-acorn-timber | gemini | too-central | tree | 0.000 | 0.000 | 0.000 | 10 |
| p7c-flour-bread | claude | too-central | dough | 1.000 | 1.000 | 1.000 | 10 |
| p7c-flour-bread | gpt | too-central | dough | 1.000 | 1.000 | 1.000 | 10 |
| p7c-flour-bread | grok | too-central | dough | 0.800 | 0.500 | 1.000 | 10 |
| p7c-flour-bread | gemini | too-central | dough | 0.000 | 0.000 | 0.000 | 10 |
| p7c-hot-cold | claude | obvious-useful | warm | 1.000 | 1.000 | 1.000 | 30 |
| p7c-hot-cold | gpt | obvious-useful | warm | 1.000 | 1.000 | 1.000 | 30 |
| p7c-hot-cold | grok | obvious-useful | warm | 1.000 | 1.000 | 1.000 | 30 |
| p7c-hot-cold | gemini | obvious-useful | warm | 0.600 | 0.433 | 0.767 | 30 |
| p7c-infant-elderly | claude | obvious-useful | adolescent | 1.000 | 1.000 | 1.000 | 10 |
| p7c-infant-elderly | gpt | obvious-useful | adolescent | 1.000 | 1.000 | 1.000 | 10 |
| p7c-infant-elderly | grok | obvious-useful | adolescent | 0.500 | 0.200 | 0.800 | 10 |
| p7c-infant-elderly | gemini | obvious-useful | adolescent | 0.600 | 0.300 | 0.900 | 10 |
| p7c-whisper-shout | claude | obvious-useful | speak | 1.000 | 1.000 | 1.000 | 10 |
| p7c-whisper-shout | gpt | obvious-useful | speak | 0.700 | 0.400 | 1.000 | 10 |
| p7c-whisper-shout | grok | obvious-useful | speak | 1.000 | 1.000 | 1.000 | 10 |
| p7c-whisper-shout | gemini | obvious-useful | speak | 0.000 | 0.000 | 0.000 | 10 |
| p7c-rain-ocean | claude | boundary | water | 0.000 | 0.000 | 0.000 | 10 |
| p7c-rain-ocean | gpt | boundary | water | 0.000 | 0.000 | 0.000 | 10 |
| p7c-rain-ocean | grok | boundary | water | 0.000 | 0.000 | 0.000 | 10 |
| p7c-rain-ocean | gemini | boundary | water | 0.000 | 0.000 | 0.000 | 10 |
| p7c-egg-chicken | claude | boundary | embryo | 1.000 | 1.000 | 1.000 | 10 |
| p7c-egg-chicken | gpt | boundary | embryo | 0.600 | 0.300 | 0.900 | 10 |
| p7c-egg-chicken | grok | boundary | embryo | 1.000 | 1.000 | 1.000 | 10 |
| p7c-egg-chicken | gemini | boundary | embryo | 1.000 | 1.000 | 1.000 | 10 |
| p7c-ice-steam | claude | boundary | water | 1.000 | 1.000 | 1.000 | 10 |
| p7c-ice-steam | gpt | boundary | water | 0.900 | 0.700 | 1.000 | 10 |
| p7c-ice-steam | grok | boundary | water | 1.000 | 1.000 | 1.000 | 10 |
| p7c-ice-steam | gemini | boundary | water | 0.000 | 0.000 | 0.000 | 10 |
| p7c-dawn-dusk | claude | boundary | noon | 1.000 | 1.000 | 1.000 | 10 |
| p7c-dawn-dusk | gpt | boundary | noon | 0.400 | 0.100 | 0.700 | 10 |
| p7c-dawn-dusk | grok | boundary | noon | 0.900 | 0.700 | 1.000 | 10 |
| p7c-dawn-dusk | gemini | boundary | noon | 0.000 | 0.000 | 0.000 | 10 |

## 3. Primary Test: Too-Central vs Obvious-Useful

- **Too-central mean freq:** 0.4958 [0.2333, 0.7417]
- **Obvious-useful mean freq:** 0.7833 [0.5917, 0.9333]
- **Difference (obvious - too-central):** 0.2875 [-0.0625, 0.5875]
- **Significantly different:** **NO**

The primary pre-registered test does not pass. The frequency difference between too-central and obvious-useful categories is not significant.

## 4. Boundary Case Classification

| Pair | Bridge | Mean Freq | Classification |
|------|--------|-----------|----------------|
| p7c-rain-ocean | water | 0.000 | too-central |
| p7c-egg-chicken | embryo | 0.900 | obvious-useful |
| p7c-ice-steam | water | 0.725 | obvious-useful |
| p7c-dawn-dusk | noon | 0.575 | obvious-useful |

## 5. Navigational Entropy by Category

- **Too-central mean entropy:** 2.8936
- **Obvious-useful mean entropy:** 2.9102
- **Difference (too-central - obvious-useful):** -0.0166 [-0.3197, 0.3080]
- **Too-central higher entropy:** **NO**


## 6. Informational Redundancy Results

| Pair | Bridge | Baseline Freq (Random Paths) | CI | Redundant? |
|------|--------|------------------------------|-----|------------|
| p7c-spark-ash | fire | 0.083 | [0.000, 0.250] | NO |
| p7c-acorn-timber | tree | 0.917 | [0.750, 1.000] | YES |
| p7c-flour-bread | dough | 0.000 | [0.000, 0.000] | NO |
| p7c-hot-cold | warm | 0.000 | [0.000, 0.000] | NO |
| p7c-infant-elderly | adolescent | 0.083 | [0.000, 0.250] | NO |
| p7c-whisper-shout | speak | 0.000 | [0.000, 0.000] | NO |
| p7c-rain-ocean | water | 0.000 | [0.000, 0.000] | NO |
| p7c-egg-chicken | embryo | 0.000 | [0.000, 0.000] | NO |
| p7c-ice-steam | water | 0.083 | [0.000, 0.250] | NO |
| p7c-dawn-dusk | noon | 0.000 | [0.000, 0.000] | NO |

## 7. Gradient vs Causal-Chain Analysis

- **Gradient pairs mean freq:** 0.7300
- **Causal-chain pairs mean freq:** 0.4958
- **Gradient higher:** **YES**

Gradient pairs (continuous spectrum) show higher bridge frequency than causal-chain pairs (sequential process), suggesting spectrum midpoints are more navigational than process intermediaries.

## 8. Cross-Model Agreement

| Pair | Model Frequencies | SD |
|------|-------------------|-----|
| p7c-spark-ash | claude:0.00, gpt:0.15, grok:0.00, gemini:0.00 | 0.075 |
| p7c-acorn-timber | claude:1.00, gpt:1.00, grok:1.00, gemini:0.00 | 0.500 |
| p7c-flour-bread | claude:1.00, gpt:1.00, grok:0.80, gemini:0.00 | 0.476 |
| p7c-hot-cold | claude:1.00, gpt:1.00, grok:1.00, gemini:0.60 | 0.200 |
| p7c-infant-elderly | claude:1.00, gpt:1.00, grok:0.50, gemini:0.60 | 0.263 |
| p7c-whisper-shout | claude:1.00, gpt:0.70, grok:1.00, gemini:0.00 | 0.472 |
| p7c-rain-ocean | claude:0.00, gpt:0.00, grok:0.00, gemini:0.00 | 0.000 |
| p7c-egg-chicken | claude:1.00, gpt:0.60, grok:1.00, gemini:1.00 | 0.200 |
| p7c-ice-steam | claude:1.00, gpt:0.90, grok:1.00, gemini:0.00 | 0.486 |
| p7c-dawn-dusk | claude:1.00, gpt:0.40, grok:0.90, gemini:0.00 | 0.465 |

## 9. Predictions Summary

| # | Prediction | Result | Value |
|---|------------|--------|-------|
| 1 | Too-central pairs have bridge freq < 0.15 | not confirmed | mean=0.496 |
| 2 | Obvious-useful pairs have bridge freq > 0.40 | confirmed | mean=0.783 |
| 3 | Obvious-useful - too-central difference > 0.35, CI excludes zero | not confirmed | diff=0.287 [-0.063, 0.587] |
| 4 | Too-central pairs have higher entropy than obvious-useful | not confirmed | TC=2.894, OU=2.910 |
| 5 | At least 2 of 3 too-central bridges are informationally redundant | not confirmed | 1/3 redundant |
| 6 | Gradient pairs have higher bridge freq than causal-chain pairs | confirmed | gradient=0.730, causal=0.496 |
| 7 | Cross-model agreement SD < 0.15 for >= 6 of 10 pairs | not confirmed | 2/10 pairs with SD < 0.15 |
