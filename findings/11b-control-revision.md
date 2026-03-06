# Phase 11B: Control Pair Revision Findings

> Generated: 2026-03-06T18:38:31.599Z

## 1. Experiment Overview

- **Candidates tested:** p11b-turmeric-trigonometry, p11b-barnacle-sonnet, p11b-magnesium-ballet, p11b-accordion-stalactite
- **Screening models:** claude, gpt, grok, gemini, deepseek, mistral
- **Total screening runs:** 240
- **Total validation runs:** 0

## 2. Screening Results

### Per candidate x model

| Candidate | Model | Top Waypoint | Top Freq | Entropy | Freq Gate | Entropy Gate |
|-----------|-------|-------------|----------|---------|-----------|--------------|
| p11b-turmeric-trigonometry | claude | ancient india | 0.900 | 3.81 | FAIL | FAIL |
| p11b-turmeric-trigonometry | gpt | spice | 0.800 | 4.74 | FAIL | FAIL |
| p11b-turmeric-trigonometry | grok | sine | 0.800 | 4.77 | FAIL | FAIL |
| p11b-turmeric-trigonometry | gemini | curcumin | 1.000 | 4.55 | FAIL | FAIL |
| p11b-turmeric-trigonometry | deepseek | angle | 1.000 | 3.44 | FAIL | FAIL |
| p11b-turmeric-trigonometry | mistral | golden ratio | 1.000 | 4.20 | FAIL | FAIL |
| p11b-barnacle-sonnet | claude | shell | 1.000 | 3.44 | FAIL | FAIL |
| p11b-barnacle-sonnet | gpt | sea shanty | 1.000 | 3.88 | FAIL | FAIL |
| p11b-barnacle-sonnet | grok | verse | 0.800 | 4.72 | FAIL | FAIL |
| p11b-barnacle-sonnet | gemini | meter | 0.600 | 4.76 | FAIL | FAIL |
| p11b-barnacle-sonnet | deepseek | rhyme | 0.800 | 4.53 | FAIL | FAIL |
| p11b-barnacle-sonnet | mistral | rhyme | 1.000 | 3.61 | FAIL | FAIL |
| p11b-magnesium-ballet | claude | movement | 0.800 | 4.24 | FAIL | FAIL |
| p11b-magnesium-ballet | gpt | choreography | 1.000 | 4.78 | FAIL | FAIL |
| p11b-magnesium-ballet | grok | swan lake | 0.700 | 4.71 | FAIL | FAIL |
| p11b-magnesium-ballet | gemini | choreography | 1.000 | 3.75 | FAIL | FAIL |
| p11b-magnesium-ballet | deepseek | choreography | 0.700 | 4.26 | FAIL | FAIL |
| p11b-magnesium-ballet | mistral | grace | 1.000 | 3.65 | FAIL | FAIL |
| p11b-accordion-stalactite | claude | bellow | 1.000 | 3.49 | FAIL | FAIL |
| p11b-accordion-stalactite | gpt | bellow | 0.600 | 4.92 | FAIL | FAIL |
| p11b-accordion-stalactite | grok | bellow | 1.000 | 4.61 | FAIL | FAIL |
| p11b-accordion-stalactite | gemini | bellow | 1.000 | 4.13 | FAIL | FAIL |
| p11b-accordion-stalactite | deepseek | bellow | 1.000 | 3.29 | FAIL | FAIL |
| p11b-accordion-stalactite | mistral | harmonica | 1.000 | 3.72 | FAIL | FAIL |

## 3. Screening Summary

| Candidate | Models Pass Freq | Models Pass Entropy | Overall Pass | Max Top Freq | Min Entropy |
|-----------|-----------------|--------------------|--------------|--------------|-----------| 
| p11b-turmeric-trigonometry | 0/6 | 0/6 | FAIL | 1.000 | 3.44 |
| p11b-barnacle-sonnet | 0/6 | 0/6 | FAIL | 1.000 | 3.44 |
| p11b-magnesium-ballet | 0/6 | 0/6 | FAIL | 1.000 | 3.65 |
| p11b-accordion-stalactite | 0/6 | 0/6 | FAIL | 1.000 | 3.29 |

## 6. Stapler-Monsoon Retrospective

| Model | Cohort | Top Waypoint | Top Freq | Entropy | Passes R5 |
|-------|--------|-------------|----------|---------|-----------|
| claude | original | office | 0.775 | 5.17 | **NO** |
| gpt | original | paperwork | 0.650 | 6.26 | **NO** |
| grok | original | flood | 0.700 | 5.28 | **NO** |
| gemini | original | humidity | 0.775 | 5.01 | **NO** |
| minimax | phase10a | paper | 0.933 | 4.60 | **NO** |
| kimi | phase10a | paper | 0.933 | 4.28 | **NO** |
| qwen | phase10a | cloud | 0.867 | 4.15 | **NO** |
| llama | phase10a | office | 0.800 | 4.94 | **NO** |
| deepseek | phase11a | paperclip | 0.600 | 4.69 | **NO** |
| mistral | phase11a | workplace | 1.000 | 3.55 | **NO** |
| cohere | phase11a | office supply | 1.000 | 4.55 | **NO** |
| llama4 | phase11a | paperweight | 1.000 | 4.36 | **NO** |

## 7. R5 Revision Recommendation

- **Recommended controls:** (none)
- **Passing candidates:** 0
- **Rationale:** No candidates pass screening. Control pair design needs fundamental revision. Consider using multi-pair control batteries or non-binary control criteria.

## 8. Predictions Summary

| # | Prediction | Result | Value |
|---|------------|--------|-------|
| 1 | At least 2 of 4 candidates pass screening | not confirmed | 0 of 4 pass screening |
| 2 | Turmeric-trigonometry and magnesium-ballet are strongest candidates | not confirmed | turmeric=fail, magnesium=fail |
| 3 | Accordion-stalactite may fail screening (shared sensory features) | confirmed | accordion-stalactite failed screening |
| 4 | Passing pairs show entropy > 5.0 for all models | insufficient data | no passing candidates to evaluate |

**Predictions confirmed:** 1 of 4
