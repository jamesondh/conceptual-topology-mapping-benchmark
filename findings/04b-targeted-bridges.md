# Phase 4B: Targeted Bridge Topology Findings

> Generated: 2026-03-04T04:31:58.411Z

## 1. Experiment Overview

- **Triples analyzed:** 8
- **Models:** claude, gpt, grok, gemini
- **New API runs (Phase 4B):** 1520
- **Reused run usages:** 320
- **Total triple/model combinations:** 32
- **Prediction success rate:** 26/32 (81.3%)

## 2. Per-Triple Results

| Triple | Model | Bridge Freq | Transitivity | Transitivity CI | Tri. Ineq. | Runs (AB/BC/AC) |
|--------|-------|-------------|-------------|-----------------|------------|-----------------|
| p4-bank-river-ocean | claude | 1.00 | 0.135 | [0.11, 0.16] | Y | 20/30/30 |
| p4-bank-river-ocean | gpt | 0.90 | 0.171 | [0.15, 0.20] | Y | 20/30/30 |
| p4-bank-river-ocean | grok | 1.00 | 0.211 | [0.18, 0.25] | Y | 20/30/30 |
| p4-bank-river-ocean | gemini | 0.00 | 0.089 | [0.07, 0.11] | Y | 20/30/30 |
| p4-bank-deposit-savings | claude | 1.00 | 0.279 | [0.27, 0.29] | Y | 20/20/20 |
| p4-bank-deposit-savings | gpt | 1.00 | 0.121 | [0.09, 0.16] | Y | 20/20/20 |
| p4-bank-deposit-savings | grok | 1.00 | 0.253 | [0.23, 0.28] | Y | 20/20/20 |
| p4-bank-deposit-savings | gemini | 1.00 | 0.165 | [0.15, 0.18] | Y | 20/20/20 |
| p4-light-spectrum-color | claude | 1.00 | 0.400 | [0.40, 0.40] | Y | 20/20/20 |
| p4-light-spectrum-color | gpt | 1.00 | 0.185 | [0.16, 0.21] | Y | 20/20/20 |
| p4-light-spectrum-color | grok | 1.00 | 0.101 | [0.08, 0.12] | Y | 20/20/20 |
| p4-light-spectrum-color | gemini | 1.00 | 0.346 | [0.30, 0.39] | Y | 20/20/20 |
| p4-emotion-nostalgia-melancholy | claude | 0.37 | 0.101 | [0.09, 0.12] | Y | 10/30/30 |
| p4-emotion-nostalgia-melancholy | gpt | 0.20 | 0.148 | [0.12, 0.18] | Y | 10/30/30 |
| p4-emotion-nostalgia-melancholy | grok | 0.70 | 0.123 | [0.10, 0.14] | Y | 10/30/30 |
| p4-emotion-nostalgia-melancholy | gemini | 0.00 | 0.011 | [0.00, 0.03] | Y | 10/30/30 |
| p4-language-metaphor-thought | claude | 0.00 | 0.437 | [0.40, 0.47] | Y | 20/20/20 |
| p4-language-metaphor-thought | gpt | 0.00 | 0.122 | [0.10, 0.14] | Y | 20/20/20 |
| p4-language-metaphor-thought | grok | 0.00 | 0.156 | [0.12, 0.20] | Y | 20/20/20 |
| p4-language-metaphor-thought | gemini | 0.00 | 0.100 | [0.07, 0.14] | Y | 20/20/20 |
| p4-tree-forest-ecosystem | claude | 1.00 | 0.301 | [0.27, 0.33] | N | 20/20/20 |
| p4-tree-forest-ecosystem | gpt | 0.95 | 0.250 | [0.22, 0.28] | Y | 20/20/20 |
| p4-tree-forest-ecosystem | grok | 1.00 | 0.171 | [0.14, 0.21] | Y | 20/20/20 |
| p4-tree-forest-ecosystem | gemini | 0.10 | 0.080 | [0.05, 0.11] | Y | 20/20/20 |
| p4-light-chandelier-color | claude | 0.00 | 0.173 | [0.16, 0.20] | Y | 10/10/10 |
| p4-light-chandelier-color | gpt | 0.00 | 0.084 | [0.05, 0.12] | Y | 10/10/10 |
| p4-light-chandelier-color | grok | 0.00 | 0.065 | [0.02, 0.11] | N | 10/10/10 |
| p4-light-chandelier-color | gemini | 0.00 | 0.171 | [0.16, 0.19] | Y | 10/10/10 |
| p4-emotion-calendar-melancholy | claude | 0.00 | 0.058 | [0.03, 0.08] | Y | 10/10/20 |
| p4-emotion-calendar-melancholy | gpt | 0.00 | 0.098 | [0.08, 0.12] | Y | 10/10/20 |
| p4-emotion-calendar-melancholy | grok | 0.00 | 0.138 | [0.10, 0.17] | Y | 10/10/20 |
| p4-emotion-calendar-melancholy | gemini | 0.00 | 0.012 | [0.00, 0.03] | Y | 10/10/20 |

## 3. Prediction Evaluation

| Triple | Diagnostic Type | Bridge | Model | Predicted | Observed | Match? |
|--------|----------------|--------|-------|-----------|----------|--------|
| p4-bank-river-ocean | polysemy-retest | river | claude | [0.80, 1.00] | 1.00 | YES |
| p4-bank-river-ocean | polysemy-retest | river | gpt | [0.80, 1.00] | 0.90 | YES |
| p4-bank-river-ocean | polysemy-retest | river | grok | [0.80, 1.00] | 1.00 | YES |
| p4-bank-river-ocean | polysemy-retest | river | gemini | [0.00, 0.10] | 0.00 | YES |
| p4-bank-deposit-savings | polysemy-financial | deposit | claude | [0.30, 1.00] | 1.00 | YES |
| p4-bank-deposit-savings | polysemy-financial | deposit | gpt | [0.30, 1.00] | 1.00 | YES |
| p4-bank-deposit-savings | polysemy-financial | deposit | grok | [0.30, 1.00] | 1.00 | YES |
| p4-bank-deposit-savings | polysemy-financial | deposit | gemini | [0.50, 1.00] | 1.00 | YES |
| p4-light-spectrum-color | cross-domain-concrete | spectrum | claude | [0.40, 1.00] | 1.00 | YES |
| p4-light-spectrum-color | cross-domain-concrete | spectrum | gpt | [0.40, 1.00] | 1.00 | YES |
| p4-light-spectrum-color | cross-domain-concrete | spectrum | grok | [0.40, 1.00] | 1.00 | YES |
| p4-light-spectrum-color | cross-domain-concrete | spectrum | gemini | [0.40, 1.00] | 1.00 | YES |
| p4-emotion-nostalgia-melancholy | abstract-retest | nostalgia | claude | [0.30, 1.00] | 0.37 | YES |
| p4-emotion-nostalgia-melancholy | abstract-retest | nostalgia | gpt | [0.30, 1.00] | 0.20 | NO |
| p4-emotion-nostalgia-melancholy | abstract-retest | nostalgia | grok | [0.80, 1.00] | 0.70 | NO |
| p4-emotion-nostalgia-melancholy | abstract-retest | nostalgia | gemini | [0.00, 0.10] | 0.00 | YES |
| p4-language-metaphor-thought | abstract-bridge | metaphor | claude | [0.50, 1.00] | 0.00 | NO |
| p4-language-metaphor-thought | abstract-bridge | metaphor | gpt | [0.30, 1.00] | 0.00 | NO |
| p4-language-metaphor-thought | abstract-bridge | metaphor | grok | [0.50, 1.00] | 0.00 | NO |
| p4-language-metaphor-thought | abstract-bridge | metaphor | gemini | [0.00, 0.20] | 0.00 | YES |
| p4-tree-forest-ecosystem | concrete-hierarchical | forest | claude | [0.50, 1.00] | 1.00 | YES |
| p4-tree-forest-ecosystem | concrete-hierarchical | forest | gpt | [0.50, 1.00] | 0.95 | YES |
| p4-tree-forest-ecosystem | concrete-hierarchical | forest | grok | [0.50, 1.00] | 1.00 | YES |
| p4-tree-forest-ecosystem | concrete-hierarchical | forest | gemini | [0.40, 1.00] | 0.10 | NO |
| p4-light-chandelier-color | random-control | chandelier | claude | [0.00, 0.05] | 0.00 | YES |
| p4-light-chandelier-color | random-control | chandelier | gpt | [0.00, 0.05] | 0.00 | YES |
| p4-light-chandelier-color | random-control | chandelier | grok | [0.00, 0.05] | 0.00 | YES |
| p4-light-chandelier-color | random-control | chandelier | gemini | [0.00, 0.05] | 0.00 | YES |
| p4-emotion-calendar-melancholy | random-control | calendar | claude | [0.00, 0.05] | 0.00 | YES |
| p4-emotion-calendar-melancholy | random-control | calendar | gpt | [0.00, 0.05] | 0.00 | YES |
| p4-emotion-calendar-melancholy | random-control | calendar | grok | [0.00, 0.05] | 0.00 | YES |
| p4-emotion-calendar-melancholy | random-control | calendar | gemini | [0.00, 0.05] | 0.00 | YES |

## 4. Temporal Drift Assessment

| Triple | Leg | Model | Within-Batch Jaccard | Cross-Batch Jaccard | Drift? |
|--------|-----|-------|---------------------|--------------------|---------| 
| p4-bank-river-ocean | BC | claude | 0.551 | 0.556 | no |
| p4-bank-river-ocean | AC | claude | 0.739 | 0.750 | no |
| p4-bank-river-ocean | BC | gpt | 0.631 | 0.587 | no |
| p4-bank-river-ocean | AC | gpt | 0.416 | 0.436 | no |
| p4-bank-river-ocean | BC | grok | 0.722 | 0.703 | no |
| p4-bank-river-ocean | AC | grok | 0.488 | 0.499 | no |
| p4-bank-river-ocean | BC | gemini | 0.928 | 0.921 | no |
| p4-bank-river-ocean | AC | gemini | 0.419 | 0.452 | no |
| p4-emotion-nostalgia-melancholy | BC | claude | 0.651 | 0.662 | no |
| p4-emotion-nostalgia-melancholy | AC | claude | 0.779 | 0.747 | no |
| p4-emotion-nostalgia-melancholy | BC | gpt | 0.578 | 0.585 | no |
| p4-emotion-nostalgia-melancholy | AC | gpt | 0.449 | 0.459 | no |
| p4-emotion-nostalgia-melancholy | BC | grok | 0.533 | 0.529 | no |
| p4-emotion-nostalgia-melancholy | AC | grok | 0.629 | 0.592 | no |
| p4-emotion-nostalgia-melancholy | BC | gemini | 0.530 | 0.534 | no |
| p4-emotion-nostalgia-melancholy | AC | gemini | 0.685 | 0.695 | no |

**No temporal drift detected.** Cross-batch Jaccard is within 0.1 of within-batch for all top-up legs, supporting data pooling across phases.

## 5. Gemini Fragmentation Characterization

### Concrete Triples (Gemini)

- **p4-light-spectrum-color:** bridge freq = 1.00
- **p4-tree-forest-ecosystem:** bridge freq = 0.10

**Concrete bridging failure:** Gemini does NOT achieve >0.30 bridge frequency on concrete triples.

### Abstract Triples (Gemini)

- **p4-emotion-nostalgia-melancholy:** bridge freq = 0.00
- **p4-language-metaphor-thought:** bridge freq = 0.00

**Abstract bridging failure confirmed:** Gemini stays below 0.10 bridge frequency on abstract triples.

### Polysemy Triples (Gemini)

- **p4-bank-river-ocean:** bridge freq = 0.00
- **p4-bank-deposit-savings:** bridge freq = 1.00

### Fragmentation Boundary

Gemini fails on both concrete and abstract bridge detection. The fragmentation may be more pervasive than a simple concrete/abstract divide.

## 6. Model Comparison Summary

| Model | Mean Bridge Freq (non-control) | 95% CI | Triples with Bridge >0.50 |
|-------|-------------------------------|--------|---------------------------|
| Claude Sonnet 4.6 | 0.728 | [0.394, 1.000] | 4/6 |
| GPT-5.2 | 0.675 | [0.325, 0.975] | 4/6 |
| Grok 4.1 Fast | 0.783 | [0.450, 1.000] | 5/6 |
| Gemini 3 Flash | 0.350 | [0.017, 0.683] | 2/6 |

## 7. Controls Validation

Random control triples (7 and 8) should show ~0% bridge frequency.

| Triple | Model | Bridge Freq | Expected |
|--------|-------|-------------|----------|
| p4-light-chandelier-color | claude | 0.00 | <= 0.05 (PASS) |
| p4-light-chandelier-color | gpt | 0.00 | <= 0.05 (PASS) |
| p4-light-chandelier-color | grok | 0.00 | <= 0.05 (PASS) |
| p4-light-chandelier-color | gemini | 0.00 | <= 0.05 (PASS) |
| p4-emotion-calendar-melancholy | claude | 0.00 | <= 0.05 (PASS) |
| p4-emotion-calendar-melancholy | gpt | 0.00 | <= 0.05 (PASS) |
| p4-emotion-calendar-melancholy | grok | 0.00 | <= 0.05 (PASS) |
| p4-emotion-calendar-melancholy | gemini | 0.00 | <= 0.05 (PASS) |

**All controls pass:** Random bridge concepts do not appear on direct paths.
