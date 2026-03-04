# Phase 5B: Dimensionality Probing Findings

> Generated: 2026-03-04T16:06:24.975Z

## 1. Experiment Overview

- **Triples analyzed:** 14
- **Models:** claude, gpt, grok, gemini
- **Focal concepts:** light, bank, fire, none
- **Total new runs:** 1040
- **Total reused runs:** 0
- **Total triple/model observations:** 56

## 2. Per-Triple Bridge Frequency

| Triple | Focal Concept | Axis Pattern | Model | Bridge Freq | CI | Runs |
|--------|---------------|-------------|-------|-------------|-----|------|
| p5b-photon-light-color | light | same-axis | claude | 0.25 | [0.10, 0.45] | 20 |
| p5b-photon-light-color | light | same-axis | gpt | 0.00 | [0.00, 0.00] | 20 |
| p5b-photon-light-color | light | same-axis | grok | 0.45 | [0.25, 0.65] | 20 |
| p5b-photon-light-color | light | same-axis | gemini | 0.10 | [0.00, 0.25] | 20 |
| p5b-feather-light-heavy | light | same-axis | claude | 0.00 | [0.00, 0.00] | 20 |
| p5b-feather-light-heavy | light | same-axis | gpt | 0.45 | [0.25, 0.65] | 20 |
| p5b-feather-light-heavy | light | same-axis | grok | 0.90 | [0.75, 1.00] | 20 |
| p5b-feather-light-heavy | light | same-axis | gemini | 0.00 | [0.00, 0.00] | 20 |
| p5b-candle-light-darkness | light | same-axis | claude | 0.00 | [0.00, 0.00] | 20 |
| p5b-candle-light-darkness | light | same-axis | gpt | 0.70 | [0.50, 0.90] | 20 |
| p5b-candle-light-darkness | light | same-axis | grok | 0.70 | [0.45, 0.90] | 20 |
| p5b-candle-light-darkness | light | same-axis | gemini | 0.00 | [0.00, 0.00] | 20 |
| p5b-photon-light-heavy | light | cross-axis | claude | 1.00 | [1.00, 1.00] | 20 |
| p5b-photon-light-heavy | light | cross-axis | gpt | 0.35 | [0.15, 0.55] | 20 |
| p5b-photon-light-heavy | light | cross-axis | grok | 0.35 | [0.15, 0.55] | 20 |
| p5b-photon-light-heavy | light | cross-axis | gemini | 0.00 | [0.00, 0.00] | 20 |
| p5b-candle-light-color | light | partial-overlap | claude | 1.00 | [1.00, 1.00] | 20 |
| p5b-candle-light-color | light | partial-overlap | gpt | 1.00 | [1.00, 1.00] | 20 |
| p5b-candle-light-color | light | partial-overlap | grok | 0.95 | [0.85, 1.00] | 20 |
| p5b-candle-light-color | light | partial-overlap | gemini | 1.00 | [1.00, 1.00] | 20 |
| p5b-prayer-light-darkness | light | cross-axis | claude | 0.00 | [0.00, 0.00] | 20 |
| p5b-prayer-light-darkness | light | cross-axis | gpt | 0.00 | [0.00, 0.00] | 20 |
| p5b-prayer-light-darkness | light | cross-axis | grok | 0.00 | [0.00, 0.00] | 20 |
| p5b-prayer-light-darkness | light | cross-axis | gemini | 0.00 | [0.00, 0.00] | 20 |
| p5b-loan-bank-savings | bank | same-axis | claude | 0.00 | [0.00, 0.00] | 20 |
| p5b-loan-bank-savings | bank | same-axis | gpt | 0.00 | [0.00, 0.00] | 20 |
| p5b-loan-bank-savings | bank | same-axis | grok | 0.65 | [0.45, 0.85] | 20 |
| p5b-loan-bank-savings | bank | same-axis | gemini | 0.00 | [0.00, 0.00] | 20 |
| p5b-river-bank-shore | bank | same-axis | claude | 0.90 | [0.75, 1.00] | 20 |
| p5b-river-bank-shore | bank | same-axis | gpt | 0.00 | [0.00, 0.00] | 20 |
| p5b-river-bank-shore | bank | same-axis | grok | 0.90 | [0.75, 1.00] | 20 |
| p5b-river-bank-shore | bank | same-axis | gemini | 0.00 | [0.00, 0.00] | 20 |
| p5b-loan-bank-shore | bank | cross-axis | claude | 1.00 | [1.00, 1.00] | 20 |
| p5b-loan-bank-shore | bank | cross-axis | gpt | 0.95 | [0.85, 1.00] | 20 |
| p5b-loan-bank-shore | bank | cross-axis | grok | 0.95 | [0.85, 1.00] | 20 |
| p5b-loan-bank-shore | bank | cross-axis | gemini | 0.05 | [0.00, 0.20] | 20 |
| p5b-spark-fire-ash | fire | same-axis | claude | 0.00 | [0.00, 0.00] | 20 |
| p5b-spark-fire-ash | fire | same-axis | gpt | 0.15 | [0.00, 0.30] | 20 |
| p5b-spark-fire-ash | fire | same-axis | grok | 0.00 | [0.00, 0.00] | 20 |
| p5b-spark-fire-ash | fire | same-axis | gemini | 0.00 | [0.00, 0.00] | 20 |
| p5b-ambition-fire-motivation | fire | same-axis | claude | 0.00 | [0.00, 0.00] | 20 |
| p5b-ambition-fire-motivation | fire | same-axis | gpt | 0.00 | [0.00, 0.00] | 20 |
| p5b-ambition-fire-motivation | fire | same-axis | grok | 0.00 | [0.00, 0.00] | 20 |
| p5b-ambition-fire-motivation | fire | same-axis | gemini | 0.00 | [0.00, 0.00] | 20 |
| p5b-spark-fire-motivation | fire | cross-axis | claude | 0.00 | [0.00, 0.00] | 20 |
| p5b-spark-fire-motivation | fire | cross-axis | gpt | 0.00 | [0.00, 0.00] | 20 |
| p5b-spark-fire-motivation | fire | cross-axis | grok | 0.00 | [0.00, 0.00] | 20 |
| p5b-spark-fire-motivation | fire | cross-axis | gemini | 0.00 | [0.00, 0.00] | 20 |
| p5b-photon-bicycle-color | none | cross-axis | claude | 0.00 | [0.00, 0.00] | 10 |
| p5b-photon-bicycle-color | none | cross-axis | gpt | 0.00 | [0.00, 0.00] | 10 |
| p5b-photon-bicycle-color | none | cross-axis | grok | 0.00 | [0.00, 0.00] | 10 |
| p5b-photon-bicycle-color | none | cross-axis | gemini | 0.00 | [0.00, 0.00] | 10 |
| p5b-loan-penguin-savings | none | cross-axis | claude | 0.00 | [0.00, 0.00] | 10 |
| p5b-loan-penguin-savings | none | cross-axis | gpt | 0.00 | [0.00, 0.00] | 10 |
| p5b-loan-penguin-savings | none | cross-axis | grok | 0.00 | [0.00, 0.00] | 10 |
| p5b-loan-penguin-savings | none | cross-axis | gemini | 0.00 | [0.00, 0.00] | 10 |

## 3. Same-Axis vs Cross-Axis Comparison

- **Same-axis mean bridge frequency:** 0.220
- **Cross-axis mean bridge frequency:** 0.291
- **Delta (same - cross):** -0.071
- **Delta 95% CI:** [-0.313, 0.159]
- **Significantly positive (delta > 0.40, CI excludes 0):** NO

**Conclusion:** The same-axis vs cross-axis difference does not meet the significance threshold (delta > 0.40 with CI excluding zero). Further investigation needed.

## 4. Per Focal Concept Breakdown

### Polysemous Focal Concepts

| Focal Concept | Same-Axis Mean | Cross-Axis Mean | Delta | Polysemous |
|---------------|---------------|----------------|-------|------------|
| light | 0.296 | 0.213 | 0.083 | yes |
| bank | 0.306 | 0.737 | -0.431 | yes |
| fire | 0.019 | 0.000 | 0.019 | no |

**Polysemous focal concepts mean delta:** -0.174
**Non-polysemous focal concepts mean delta:** 0.019

Non-polysemous focal concept (fire) shows a comparable or larger gap than polysemous concepts. This may indicate that even metaphorical extension creates semantic dimensional structure.

## 5. Partial Overlap Analysis

Partial-overlap triples should show intermediate bridge frequency (0.20-0.60).

| Triple | Model | Bridge Freq | In Range? |
|--------|-------|-------------|-----------|
| p5b-candle-light-color | claude | 1.00 | NO |
| p5b-candle-light-color | gpt | 1.00 | NO |
| p5b-candle-light-color | grok | 0.95 | NO |
| p5b-candle-light-color | gemini | 1.00 | NO |

**0/4** partial-overlap observations fall in the predicted 0.20-0.60 range.

## 6. Per-Model Dimension Estimates

For each focal concept, count cross-axis triples with bridge freq < 0.10 as evidence of independent semantic axes.

| Model | Focal Concept | Independent Axes | Total Cross-Axis Triples |
|-------|---------------|-----------------|--------------------------|
| claude | light | 1 | 2 |
| claude | bank | 0 | 1 |
| claude | fire | 1 | 1 |
| gpt | light | 1 | 2 |
| gpt | bank | 0 | 1 |
| gpt | fire | 1 | 1 |
| grok | light | 1 | 2 |
| grok | bank | 0 | 1 |
| grok | fire | 1 | 1 |
| gemini | light | 2 | 2 |
| gemini | bank | 1 | 1 |
| gemini | fire | 1 | 1 |

### Summary

- **claude:** 2/4 cross-axis triples show bridge freq < 0.10 (full dimensional independence)
- **gpt:** 2/4 cross-axis triples show bridge freq < 0.10 (full dimensional independence)
- **grok:** 2/4 cross-axis triples show bridge freq < 0.10 (full dimensional independence)
- **gemini:** 4/4 cross-axis triples show bridge freq < 0.10 (full dimensional independence)

## 7. Controls Validation

Random control triples should show ~0% bridge frequency.

| Triple | Model | Bridge Freq | Expected |
|--------|-------|-------------|----------|
| p5b-photon-bicycle-color | claude | 0.00 | <= 0.05 (PASS) |
| p5b-photon-bicycle-color | gpt | 0.00 | <= 0.05 (PASS) |
| p5b-photon-bicycle-color | grok | 0.00 | <= 0.05 (PASS) |
| p5b-photon-bicycle-color | gemini | 0.00 | <= 0.05 (PASS) |
| p5b-loan-penguin-savings | claude | 0.00 | <= 0.05 (PASS) |
| p5b-loan-penguin-savings | gpt | 0.00 | <= 0.05 (PASS) |
| p5b-loan-penguin-savings | grok | 0.00 | <= 0.05 (PASS) |
| p5b-loan-penguin-savings | gemini | 0.00 | <= 0.05 (PASS) |

**All controls pass:** Random bridge concepts do not appear on direct paths.

## 8. Predictions Summary

| Triple | Model | Predicted Range | Observed | Match? |
|--------|-------|----------------|----------|--------|
| p5b-photon-light-color | claude | [0.60, 1.00] | 0.25 | NO |
| p5b-photon-light-color | gpt | [0.60, 1.00] | 0.00 | NO |
| p5b-photon-light-color | grok | [0.60, 1.00] | 0.45 | NO |
| p5b-photon-light-color | gemini | [0.60, 1.00] | 0.10 | NO |
| p5b-feather-light-heavy | claude | [0.60, 1.00] | 0.00 | NO |
| p5b-feather-light-heavy | gpt | [0.60, 1.00] | 0.45 | NO |
| p5b-feather-light-heavy | grok | [0.60, 1.00] | 0.90 | YES |
| p5b-feather-light-heavy | gemini | [0.60, 1.00] | 0.00 | NO |
| p5b-candle-light-darkness | claude | [0.60, 1.00] | 0.00 | NO |
| p5b-candle-light-darkness | gpt | [0.60, 1.00] | 0.70 | YES |
| p5b-candle-light-darkness | grok | [0.60, 1.00] | 0.70 | YES |
| p5b-candle-light-darkness | gemini | [0.60, 1.00] | 0.00 | NO |
| p5b-photon-light-heavy | claude | [0.00, 0.20] | 1.00 | NO |
| p5b-photon-light-heavy | gpt | [0.00, 0.20] | 0.35 | NO |
| p5b-photon-light-heavy | grok | [0.00, 0.20] | 0.35 | NO |
| p5b-photon-light-heavy | gemini | [0.00, 0.10] | 0.00 | YES |
| p5b-candle-light-color | claude | [0.20, 0.60] | 1.00 | NO |
| p5b-candle-light-color | gpt | [0.20, 0.60] | 1.00 | NO |
| p5b-candle-light-color | grok | [0.20, 0.60] | 0.95 | NO |
| p5b-candle-light-color | gemini | [0.20, 0.60] | 1.00 | NO |
| p5b-prayer-light-darkness | claude | [0.00, 0.20] | 0.00 | YES |
| p5b-prayer-light-darkness | gpt | [0.00, 0.20] | 0.00 | YES |
| p5b-prayer-light-darkness | grok | [0.00, 0.20] | 0.00 | YES |
| p5b-prayer-light-darkness | gemini | [0.00, 0.10] | 0.00 | YES |
| p5b-loan-bank-savings | claude | [0.60, 1.00] | 0.00 | NO |
| p5b-loan-bank-savings | gpt | [0.60, 1.00] | 0.00 | NO |
| p5b-loan-bank-savings | grok | [0.60, 1.00] | 0.65 | YES |
| p5b-loan-bank-savings | gemini | [0.60, 1.00] | 0.00 | NO |
| p5b-river-bank-shore | claude | [0.60, 1.00] | 0.90 | YES |
| p5b-river-bank-shore | gpt | [0.60, 1.00] | 0.00 | NO |
| p5b-river-bank-shore | grok | [0.60, 1.00] | 0.90 | YES |
| p5b-river-bank-shore | gemini | [0.60, 1.00] | 0.00 | NO |
| p5b-loan-bank-shore | claude | [0.00, 0.20] | 1.00 | NO |
| p5b-loan-bank-shore | gpt | [0.00, 0.20] | 0.95 | NO |
| p5b-loan-bank-shore | grok | [0.00, 0.20] | 0.95 | NO |
| p5b-loan-bank-shore | gemini | [0.00, 0.10] | 0.05 | YES |
| p5b-spark-fire-ash | claude | [0.60, 1.00] | 0.00 | NO |
| p5b-spark-fire-ash | gpt | [0.60, 1.00] | 0.15 | NO |
| p5b-spark-fire-ash | grok | [0.60, 1.00] | 0.00 | NO |
| p5b-spark-fire-ash | gemini | [0.60, 1.00] | 0.00 | NO |
| p5b-ambition-fire-motivation | claude | [0.60, 1.00] | 0.00 | NO |
| p5b-ambition-fire-motivation | gpt | [0.60, 1.00] | 0.00 | NO |
| p5b-ambition-fire-motivation | grok | [0.60, 1.00] | 0.00 | NO |
| p5b-ambition-fire-motivation | gemini | [0.60, 1.00] | 0.00 | NO |
| p5b-spark-fire-motivation | claude | [0.00, 0.20] | 0.00 | YES |
| p5b-spark-fire-motivation | gpt | [0.00, 0.20] | 0.00 | YES |
| p5b-spark-fire-motivation | grok | [0.00, 0.20] | 0.00 | YES |
| p5b-spark-fire-motivation | gemini | [0.00, 0.10] | 0.00 | YES |
| p5b-photon-bicycle-color | claude | [0.00, 0.05] | 0.00 | YES |
| p5b-photon-bicycle-color | gpt | [0.00, 0.05] | 0.00 | YES |
| p5b-photon-bicycle-color | grok | [0.00, 0.05] | 0.00 | YES |
| p5b-photon-bicycle-color | gemini | [0.00, 0.05] | 0.00 | YES |
| p5b-loan-penguin-savings | claude | [0.00, 0.05] | 0.00 | YES |
| p5b-loan-penguin-savings | gpt | [0.00, 0.05] | 0.00 | YES |
| p5b-loan-penguin-savings | grok | [0.00, 0.05] | 0.00 | YES |
| p5b-loan-penguin-savings | gemini | [0.00, 0.05] | 0.00 | YES |

**Overall prediction success rate:** 24/56 (42.9%)
