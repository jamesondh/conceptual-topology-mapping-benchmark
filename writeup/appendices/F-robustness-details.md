# Appendix F: Robustness Analysis Details

This appendix provides the full per-model, per-pair, per-condition breakdown from the Phase 11C multiverse robustness experiment. Section 9 of the main text presents aggregated results; this appendix provides the underlying data.

## F.1 Experimental Design

**Models:** Claude Sonnet 4.6, GPT-5.2, DeepSeek V3.2

**Pairs (forward + reverse):**
- light $\to$ color / color $\to$ light (bridge: spectrum)
- hot $\to$ cold / cold $\to$ hot (bridge: warm)
- emotion $\to$ melancholy / melancholy $\to$ emotion (bridge: sadness)

**Conditions (2$\times$2 grid + baseline):**

| Condition | Waypoints | Temperature |
|-----------|-----------|-------------|
| Baseline (7wp-t0.7) | 7 | 0.7 |
| 5wp-t0.5 | 5 | 0.5 |
| 5wp-t0.9 | 5 | 0.9 |
| 9wp-t0.5 | 9 | 0.5 |
| 9wp-t0.9 | 9 | 0.9 |

**Runs:** 1,080 new (4 conditions $\times$ 3 models $\times$ 6 pairs $\times$ 15 reps) + $\sim$340 reused baseline runs from prior phases.

**Baseline data limitation:** The 7wp-t0.7 baseline is assembled from prior-phase data (Phases 1, 2, 6A). DeepSeek, added in Phase 11A, has no prior-phase data --- its baseline cells are empty. Additionally, reverse-direction data for some pairs is missing from prior phases. Baseline values for DeepSeek should be treated as missing, not zero.

---

## F.2 Gait (Intra-Model Jaccard) by Model and Condition

| Model | 7wp-t0.7 | 5wp-t0.5 | 5wp-t0.9 | 9wp-t0.5 | 9wp-t0.9 |
|-------|----------|----------|----------|----------|----------|
| Claude | 0.676 | 0.794 | 0.772 | 0.699 | 0.624 |
| GPT | 0.378 | 0.413 | 0.477 | 0.382 | 0.365 |
| DeepSeek | 0.000* | 0.582 | 0.492 | 0.592 | 0.597 |

*DeepSeek baseline is empty (no prior-phase data); reported as 0.000 by the analysis script.

**Observations:**
- Claude shows the highest gait in every condition (0.624--0.794).
- GPT shows the lowest gait in all new conditions (0.365--0.477).
- DeepSeek occupies the middle position in all new conditions (0.492--0.597).
- 5wp-t0.5 produces the highest gait for both Claude (0.794) and DeepSeek (0.582) --- fewer waypoints and lower temperature reduce navigational variability.
- 9wp-t0.9 produces the lowest gait for Claude (0.624) --- more waypoints and higher temperature maximize variability.

### Gait Rank-Order Stability

| Condition | Rank 1 | Rank 2 | Rank 3 |
|-----------|--------|--------|--------|
| 7wp-t0.7 (baseline) | Claude (0.676) | GPT (0.378) | DeepSeek (0.000*) |
| 5wp-t0.5 | Claude (0.794) | DeepSeek (0.582) | GPT (0.413) |
| 5wp-t0.9 | Claude (0.772) | DeepSeek (0.492) | GPT (0.477) |
| 9wp-t0.5 | Claude (0.699) | DeepSeek (0.592) | GPT (0.382) |
| 9wp-t0.9 | Claude (0.624) | DeepSeek (0.597) | GPT (0.365) |

Kendall's W = 0.840. Claude is always first. The baseline anomaly (GPT > DeepSeek) reflects DeepSeek's missing baseline data, not genuinely lower consistency.

---

## F.3 Asymmetry by Model, Pair, and Condition

### Full Breakdown

| Model | Condition | Pair | Asymmetry | 95\% CI |
|-------|-----------|------|-----------|---------|
| Claude | 7wp-t0.7 | hot--cold | 0.726 | [0.697, 0.750] |
| Claude | 7wp-t0.7 | emotion--melancholy | 1.000 | [1.000, 1.000] |
| GPT | 7wp-t0.7 | hot--cold | 0.471 | [0.414, 0.522] |
| GPT | 7wp-t0.7 | emotion--melancholy | 1.000 | [1.000, 1.000] |
| DeepSeek | 7wp-t0.7 | hot--cold | 1.000 | [1.000, 1.000] |
| DeepSeek | 7wp-t0.7 | emotion--melancholy | 1.000 | [1.000, 1.000] |
| Claude | 5wp-t0.5 | hot--cold | 0.750 | [0.750, 0.750] |
| Claude | 5wp-t0.5 | emotion--melancholy | 0.512 | [0.466, 0.550] |
| GPT | 5wp-t0.5 | hot--cold | 0.434 | [0.372, 0.503] |
| GPT | 5wp-t0.5 | emotion--melancholy | 0.520 | [0.461, 0.568] |
| DeepSeek | 5wp-t0.5 | hot--cold | 0.665 | [0.641, 0.689] |
| DeepSeek | 5wp-t0.5 | emotion--melancholy | 0.684 | [0.644, 0.719] |
| Claude | 5wp-t0.9 | hot--cold | 0.726 | [0.690, 0.750] |
| Claude | 5wp-t0.9 | emotion--melancholy | 0.519 | [0.473, 0.562] |
| GPT | 5wp-t0.9 | hot--cold | 0.392 | [0.354, 0.435] |
| GPT | 5wp-t0.9 | emotion--melancholy | 0.555 | [0.445, 0.654] |
| DeepSeek | 5wp-t0.9 | hot--cold | 0.653 | [0.621, 0.684] |
| DeepSeek | 5wp-t0.9 | emotion--melancholy | 0.712 | [0.667, 0.760] |
| Claude | 9wp-t0.5 | hot--cold | 0.671 | [0.647, 0.696] |
| Claude | 9wp-t0.5 | emotion--melancholy | 0.625 | [0.583, 0.662] |
| GPT | 9wp-t0.5 | hot--cold | 0.514 | [0.460, 0.562] |
| GPT | 9wp-t0.5 | emotion--melancholy | 0.682 | [0.645, 0.717] |
| DeepSeek | 9wp-t0.5 | hot--cold | 0.783 | [0.760, 0.804] |
| DeepSeek | 9wp-t0.5 | emotion--melancholy | 0.740 | [0.708, 0.766] |
| Claude | 9wp-t0.9 | hot--cold | 0.655 | [0.620, 0.690] |
| Claude | 9wp-t0.9 | emotion--melancholy | 0.612 | [0.565, 0.656] |
| GPT | 9wp-t0.9 | hot--cold | 0.596 | [0.555, 0.638] |
| GPT | 9wp-t0.9 | emotion--melancholy | 0.725 | [0.684, 0.769] |
| DeepSeek | 9wp-t0.9 | hot--cold | 0.760 | [0.732, 0.785] |
| DeepSeek | 9wp-t0.9 | emotion--melancholy | 0.754 | [0.720, 0.784] |

### Condition Means

| Condition | Mean Asymmetry | 95\% CI | $>$ 0.60? |
|-----------|---------------|---------|-----------|
| 7wp-t0.7 (baseline)* | 0.599 | [0.471, 0.726] | no |
| 5wp-t0.5 | 0.594 | [0.512, 0.675] | no |
| 5wp-t0.9 | 0.593 | [0.502, 0.688] | no |
| 9wp-t0.5 | 0.669 | [0.597, 0.733] | **yes** |
| 9wp-t0.9 | 0.684 | [0.631, 0.736] | **yes** |

*Baseline from 2 valid cells only (Claude and GPT on hot--cold).

**Key pattern:** The waypoint-count effect is consistent across all three models. At 9 waypoints, every model$\times$pair combination shows asymmetry $\geq$ 0.514; at 5 waypoints, GPT hot--cold drops to 0.392--0.434. Temperature has negligible effect: within each waypoint count, 5wp-t0.5 (0.594) $\approx$ 5wp-t0.9 (0.593) and 9wp-t0.5 (0.669) $\approx$ 9wp-t0.9 (0.684).

---

## F.4 Bridge Frequency by Pair, Model, and Condition

### Full Breakdown

**light $\to$ color (bridge: spectrum)**

| Model | 7wp-t0.7 | 5wp-t0.5 | 5wp-t0.9 | 9wp-t0.5 | 9wp-t0.9 |
|-------|----------|----------|----------|----------|----------|
| Claude | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
| GPT | 0.975 | 1.000 | 1.000 | 1.000 | 1.000 |
| DeepSeek | 0.000* | 0.933 | 0.800 | 1.000 | 1.000 |

**hot $\to$ cold (bridge: warm)**

| Model | 7wp-t0.7 | 5wp-t0.5 | 5wp-t0.9 | 9wp-t0.5 | 9wp-t0.9 |
|-------|----------|----------|----------|----------|----------|
| Claude | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
| GPT | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
| DeepSeek | 0.000* | 1.000 | 1.000 | 1.000 | 1.000 |

**emotion $\to$ melancholy (bridge: sadness)**

| Model | 7wp-t0.7 | 5wp-t0.5 | 5wp-t0.9 | 9wp-t0.5 | 9wp-t0.9 |
|-------|----------|----------|----------|----------|----------|
| Claude | 1.000 | 1.000 | 1.000 | 0.933 | 1.000 |
| GPT | 0.975 | 1.000 | 1.000 | 1.000 | 0.867 |
| DeepSeek | 0.000* | 1.000 | 1.000 | 1.000 | 1.000 |

*DeepSeek 7wp-t0.7 entries are 0.000 due to missing baseline data, not actual zero bridge frequency.

### Condition Means (Excluding DeepSeek Baseline)

| Condition | Mean Bridge Freq | 95\% CI |
|-----------|-----------------|---------|
| 7wp-t0.7 (baseline) | 0.992 | [0.983, 1.000] |
| 5wp-t0.5 | 0.993 | [0.978, 1.000] |
| 5wp-t0.9 | 0.978 | [0.933, 1.000] |
| 9wp-t0.5 | 0.993 | [0.978, 1.000] |
| 9wp-t0.9 | 0.985 | [0.956, 1.000] |

All conditions exceed 0.97. The two lowest individual cells are DeepSeek's spectrum at 5wp-t0.9 (0.800) and GPT's sadness at 9wp-t0.9 (0.867). Even these represent only minor dips from ceiling.

---

## F.5 ANOVA Interaction Test

Factorial analysis testing gait (intra-model Jaccard) against model identity, waypoint count, temperature, and their interaction. Data from the four new conditions only (baseline excluded due to DeepSeek sparsity).

| Factor | $\eta^2$ (SS Proportion) | p-value (approx.) |
|--------|------------------------:|-------------------:|
| Model identity | 0.242 | $\approx$ 0.001 |
| Waypoint count | 0.008 | $\approx$ 0.520 |
| Temperature | 0.002 | $\approx$ 0.743 |
| Waypoint $\times$ Temperature | $\approx$ 0.000 | $\approx$ 0.886 |

**Methodological note:** p-values use a chi-squared approximation to the F-distribution (ignoring denominator degrees of freedom) and treat per-pair cells as independent without repeated-measures modeling. Only 3 models were tested. The effect sizes ($\eta^2$) are more reliable than the exact p-values. The qualitative conclusion --- that model identity dominates while protocol parameters are null --- is robust to the approximation, but the analysis should be understood as descriptive/exploratory rather than confirmatory.

---

## F.6 Waypoint Scaling

Fraction of waypoints shared across different path lengths, computed as mean Jaccard similarity between the waypoint sets of matched pairs at different waypoint counts.

| Comparison | Shared Fraction |
|------------|:--------------:|
| 5wp vs 7wp | 0.761 |
| 7wp vs 9wp | 0.504 |
| 5wp vs 9wp | 0.481 |
| Reference: O10 (5wp vs 10wp, Phase 1) | 0.705 |

The 5-to-7 scaling (0.761) is consistent with O10 (Phase 1's 5-to-10 at 0.705): shorter paths are genuine coarse-grainings of longer paths. The 7-to-9 scaling (0.504) is lower, suggesting that additional waypoints from 7 to 9 introduce genuinely new content rather than interpolating between existing waypoints.

---

## F.7 Control Pair Screening (Phase 11B)

### Candidate Results

4 candidates screened across 6 models (Claude, GPT, Grok, Gemini, DeepSeek, Mistral), 10 runs each. Frequency gate: top-waypoint frequency $<$ 0.15. Entropy gate: waypoint entropy $>$ 5.0.

| Candidate | Max Top Freq | Min Entropy | Best Model Entropy | Passes? |
|-----------|:-----------:|:-----------:|:-----------------:|:-------:|
| accordion--stalactite | 1.000 | 3.29 | Gemini (4.92) | fail |
| turmeric--trigonometry | 1.000 | 3.44 | DeepSeek (4.77) | fail |
| barnacle--sonnet | 1.000 | 3.44 | Gemini (4.57) | fail |
| magnesium--ballet | 1.000 | 3.65 | Gemini (4.92) | fail |

0 of 24 model$\times$candidate cells pass either gate.

### Retrospective: Stapler--Monsoon Across 12 Models

| Model | Cohort | Top Waypoint | Top Frequency |
|-------|--------|-------------|:------------:|
| Claude | original | office | 0.775 |
| GPT | original | paperwork | 0.650 |
| Grok | original | flood | 0.700 |
| Gemini | original | humidity | 0.775 |
| MiniMax | phase10a | paper | 0.933 |
| Kimi | phase10a | paper | 0.933 |
| Qwen | phase10a | cloud | 0.867 |
| Llama 8B | phase10a | office | 0.800 |
| DeepSeek | phase11a | paperclip | 0.600 |
| Mistral | phase11a | workplace | 1.000 |
| Cohere | phase11a | office supply | 1.000 |
| Llama 4 | phase11a | paperweight | 1.000 |

All 12 models fail R5 under strict criteria (top frequency $<$ 0.15). The original 4 models show frequencies of 0.650--0.775; the Phase 10A and 11A models show 0.600--1.000. Under these criteria, stapler--monsoon has never been a valid control for any model.

---

## F.8 Phase 11C Predictions Summary

| \# | Prediction | Result | Value | Verdict |
|----|-----------|--------|-------|---------|
| 1 | Gait rank-order survives (W $>$ 0.70) | W = 0.840 | above threshold | confirmed |
| 2 | Asymmetry $>$ 0.60 all conditions | 5wp: 0.594, 0.593 | below threshold | not confirmed |
| 3 | Bridge freq survives (spectrum $>$ 0.50, warm $>$ 0.30) | all $>$ 0.97 | far above threshold | confirmed |
| 4 | Temperature 0.5 increases Jaccard by 0.05--0.15 | $\Delta$ = 0.226 | exceeds range | not confirmed |
| 5 | Temperature 0.9 decreases Jaccard, all $>$ 0.10 | $\Delta$ = 0.203 | magnitude wrong | not confirmed |
| 6 | 5wp bridge freq $>$ 9wp | 5wp = 0.985, 9wp = 0.989 | no difference | not confirmed |
| 7 | Control pair unstructured all conditions | structured | --- | not confirmed |
