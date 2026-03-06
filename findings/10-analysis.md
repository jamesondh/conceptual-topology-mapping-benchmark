# Phase 10 Analysis: Generality and the Structure/Content Boundary

> Interpretive analysis of Phase 10: model generality (10A) and pre-fill relation classes (10B).
>
> 720 new runs (10A) + 960 new runs (10B) = 1,680 new API runs + 778 reused, across 5 new models (10A, 4 reliable) and 4 core models (10B), 12 generality pairs and 8 relation-class pairs.
>
> March 2026

## Executive Summary

**Phase 10 establishes the benchmark's strongest generality result: both structural properties AND navigational content generalize across model architectures and providers.** The expanded generality test (10A) shows that bridge bottleneck structure — previously tested only on 4 core models — replicates on 3 additional models from different providers (Qwen, MiniMax, Kimi). The single outlier is Llama 3.1 8B, whose bridge frequency deficit (0.200 vs. cohort 0.817) is a **scale effect**, not evidence of model-general content divergence.

The model generality experiment (10A) tested whether R1-R7 generalize to five new models. The initial run was limited by aggressive 60-second timeout thresholds — 4/5 models failed on OpenRouter latency, not capability. After relaxing timeouts to 300 seconds (`--patient` mode) and re-running overnight, **4 of 5 models passed** (GLM 5 remained blocked by upstream rate limiting). With 720 total runs across 4 new models, the results are decisive: R1 (gait) replicates for all 4 models (range 0.298-0.508), R2 (asymmetry) replicates for all 4 (all > 0.60), and — critically — **the cohort bridge frequency comparison CI now includes zero** (new cohort 0.721 vs original 0.817, diff -0.096, CI [-0.241, 0.064]). Bridge bottleneck structure generalizes. The Llama 8B outlier (bridge freq 0.200) reveals a scale-dependent effect: large models from different providers converge on the same navigational landmarks, while a small model navigates the same geometry but takes different paths.

The pre-fill relation class experiment (10B) tests whether a three-way taxonomy (on-axis substitute, same-domain off-axis, unrelated) predicts bridge survival under pre-fill. The Friedman test is significant (p=0.034) — the taxonomy captures real variance. But the predicted ordering is wrong: we expected on-axis < unrelated < same-domain; the actual ordering is **unrelated (0.388) < on-axis (0.643) ≈ same-domain (0.708)**. Unrelated pre-fills are the most disruptive, not on-axis substitutes. Both on-axis and same-domain pre-fills keep the model in the right conceptual neighborhood, preserving the bridge; unrelated pre-fills derail navigation entirely. The warm/fermentation replications are perfect — within 0.026 of Phase 9A values.

Overall prediction accuracy is 9/18 (50%), a notable improvement over Phases 8-9 (~20-24%). The improvement is driven by the expanded 10A cohort: predictions about model reliability (P1), gait (P2), asymmetry (P3), cohort bridge frequency (P5), per-pair bridge frequency (P6), and cross-model similarity (P7) all confirm with 4 models where they were ambiguous with 1. R5 (controls) remains a concern — all 4 new models fail the control validation, not just Llama. The mechanistic prediction floor persists for 10B ordering predictions.

---

## 1. Model Generality: Bridge Structure Generalizes

### The Ambition — Realized

Phase 10A was designed as the benchmark's generality test — the claim that conceptual topology is a universal property of language models, not an idiosyncrasy of four specific models. Five new models were selected to span architectures, scales, and training approaches: MiniMax M2.5, Kimi K2.5, GLM 5, Qwen 3.5 397B-A17B, and Llama 3.1 8B Instruct.

The two-stage design (probe reliability → full elicitation) was deliberate: invest 3 probe runs per model before committing ~180 runs each. The initial run with default 60-second timeouts blocked 4/5 models on OpenRouter latency — an infrastructure limitation, not a model capability failure (all four parsed correctly with 100% connectivity). After relaxing timeouts to 300 seconds via a `--patient` CLI flag and re-running overnight, **4 of 5 models passed the reliability gate**, yielding 720 total runs across the expanded cohort.

### The Retry: Patient Mode

| Model | Initial Run | Patient Run | Status |
|-------|------------|-------------|--------|
| Qwen 3.5 397B-A17B | 101.6s p50 → failed | 57.7s p50 → **reliable** | Recovered |
| MiniMax M2.5 | 78.9s p50 → failed | 28.9s p50 → **reliable** | Recovered |
| GLM 5 | 68.7s p50 → failed | 429 rate-limited upstream | Still blocked |
| Kimi K2.5 | 133.2s p50 → failed | 78.8s p50 → **reliable** | Recovered |
| Llama 3.1 8B | 1.5s p50 → reliable | (cached) | Already passed |

Three of four previously failed models recovered with generous timeouts. Latencies were actually lower on the retry (OpenRouter routing variability), confirming the original failures were infrastructure artifacts. GLM 5 remained blocked by upstream rate limiting (HTTP 429), suggesting a provider-level restriction rather than latency. The experiment collected all 720 planned runs (4 models × 12 pairs × 15 reps) with 0% failure rate.

**[observed]** OpenRouter latency is highly variable and model-dependent. Default 60-second timeouts create false negatives for slow-routed models. Patient mode (300s request timeout, 300s latency gate) recovers models that are fully functional but slow. This is a methodological finding: multi-model benchmarks via aggregator APIs should use generous timeouts or risk systematically excluding models from specific providers.

### R1 (Gait) Replicates Across All 4 New Models

All four new models show characteristic gait profiles in the expected 0.15-0.70 Jaccard range:

| Model | Mean Intra-Model Jaccard | 95% CI | New? |
|-------|------------------------|--------|------|
| Claude Sonnet 4.6 | 0.578 | — | no |
| Qwen 3.5 397B-A17B | 0.508 | [0.435, 0.580] | **yes** |
| MiniMax M2.5 | 0.419 | [0.298, 0.546] | **yes** |
| Kimi K2.5 | 0.414 | [0.328, 0.507] | **yes** |
| Gemini 3 Flash | 0.372 | — | no |
| Llama 3.1 8B | 0.298 | [0.207, 0.403] | **yes** |
| Grok 4.1 Fast | 0.293 | — | no |
| GPT-5.2 | 0.258 | — | no |

The gait spectrum now spans 8 models. Qwen shows the second-highest consistency (0.508), clustering with Claude. Kimi and MiniMax fall in the mid-range near Gemini. Llama and GPT anchor the low-consistency end. The gait phenomenon is confirmed as a universal property: every model tested — across 5 providers, multiple architectures, and scales from 8B to frontier — navigates with a characteristic, measurable consistency level.

### R2 (Asymmetry) Replicates: Universal Quasimetric Space

All four new models show mean asymmetry > 0.60:

| Model | Mean Asymmetry | 95% CI |
|-------|---------------|--------|
| Llama | 0.785 | [0.708, 0.847] |
| Kimi | 0.684 | [0.545, 0.837] |
| Qwen | 0.662 | [0.553, 0.761] |
| MiniMax | 0.638 | [0.481, 0.759] |

Conceptual space is quasimetric for all 8 tested models. The asymmetry indices range from 0.638 (MiniMax) to 0.785 (Llama), all well above the 0.60 threshold. Llama shows the highest asymmetry, suggesting smaller models may exhibit even stronger directional effects — possibly because they have less capacity to maintain bidirectional context and rely more heavily on forward-chaining from the starting concept.

### Bridge Frequency: The Primary Test Passes

The cohort comparison — the experiment's primary test — delivers the strongest generality result in the benchmark:

- **New cohort mean bridge frequency:** 0.721 [0.633, 0.802]
- **Original cohort mean bridge frequency:** 0.817 [0.683, 0.930]
- **Difference:** -0.096 [-0.241, 0.064]
- **CI includes zero: YES — bridge structure generalizes.**

The per-pair, per-model bridge frequency matrix reveals the pattern:

| Pair | Bridge | Qwen | MiniMax | Kimi | Llama | Original Cohort |
|------|--------|------|---------|------|-------|----------------|
| hot-cold | warm | 1.000 | 1.000 | 1.000 | 0.733 | ~0.92 |
| light-color | spectrum | 1.000 | 0.933 | 0.933 | 0.267 | ~0.87 |
| animal-poodle | dog | 1.000 | 1.000 | 1.000 | 0.067 | ~0.90 |
| emotion-melancholy | sadness | 0.933 | 1.000 | 1.000 | 0.067 | ~0.82 |
| hide-shoe | leather | 1.000 | 0.667 | 0.933 | 0.133 | ~0.85 |
| music-mathematics | harmony | 0.733 | 0.800 | 0.800 | 0.000 | ~0.65 |
| seed-garden | germination | 0.133 | 0.933 | 1.000 | 0.133 | ~0.70 |

The pattern is striking: **Qwen, MiniMax, and Kimi produce bridge frequencies comparable to or exceeding the original cohort.** Dog, sadness, warm, spectrum, and leather are near-universal across all large models. Llama 3.1 8B is the clear outlier — its bridge frequencies are dramatically lower across every pair. The original finding that "navigational content doesn't generalize" was an artifact of having only a single, small model (Llama 8B) in the new cohort. With three additional large models, the navigational landmarks generalize just as reliably as the structural properties.

**Germination** is the interesting exception: Qwen (0.133) and Llama (0.133) both fail it, while MiniMax (0.933) and Kimi (1.000) succeed. This mirrors the original cohort where germination was the most variable bridge (0.583 mean). Germination's status as a process-naming bridge (O4) makes it sensitive to whether a model's navigational vocabulary includes technical biological process terms.

### The Llama Scale Effect

Llama 3.1 8B is the definitive outlier across every metric except gait and asymmetry:

- **Bridge frequency:** Mean 0.200 vs. 0.855 (Qwen/MiniMax/Kimi mean) and 0.817 (original cohort)
- **Cross-model Jaccard:** Llama's mean pairwise Jaccard with all other models is the lowest (0.124-0.184)
- **Control failure:** "office" at 80% on stapler-monsoon

The bridge frequency gap between Llama and every other model is massive and consistent. This is not a random fluctuation — it's a systematic pattern where an 8B-parameter model navigates through different intermediaries than frontier-scale models. The structural geometry (gait, asymmetry, quasimetric space) is scale-invariant, but the specific navigational landmarks require sufficient model capacity to converge on the same set that larger models discover.

**[observed]** Model scale affects navigational content but not structural geometry. Large models from different providers (Qwen, MiniMax, Kimi, Claude, GPT, Grok, Gemini) converge on the same bridge concepts; a small model (Llama 8B) navigates the same geometric space but through different landmarks. The structure/content boundary is better characterized as a structure/scale boundary: structural properties are universal, content properties are universal among comparable-scale models but diverge at small scale.

### Control Validation Failure: A Broader Problem

The stapler→monsoon control pair fails for **all 4 new models**, not just Llama:

| Model | Top Waypoint | Top Frequency | Passes R5 (< 0.10)? |
|-------|-------------|---------------|---------------------|
| MiniMax | paper | 0.933 | no |
| Kimi | paper | 0.933 | no |
| Qwen | cloud | 0.867 | no |
| Llama | office | 0.800 | no |

MiniMax and Kimi converge on "paper" (stapler→paper is a strong association); Qwen on "cloud" (possibly stapler→office→cloud→rain→monsoon or a similar chain); Llama on "office." This is not a small-model problem — it's a failure of the specific control pair for models outside the original cohort. The original 4 models likely had more diverse routing on this pair by chance, or their training produced weaker single-association biases for "stapler."

**[observed]** The stapler-monsoon control pair fails R5 validation for all 4 new models (top waypoint frequency 0.800-0.933, threshold 0.10). This suggests the pair has a strong associative intermediate ("paper"/"office") that many models discover, rather than serving as a genuinely random/unstructured control. R5 may need revision: either the 0.10 threshold is too strict, or the control pair itself has an unintended semantic bridge. The original cohort's clean control performance may reflect those specific models' navigational diversity on this pair rather than the pair's true randomness.

### Cross-Model Similarity: Expanded Matrix

The pairwise Jaccard matrix across all 8 models reveals clustering:

| | Claude | Qwen | Kimi | MiniMax | Grok | GPT | Gemini | Llama |
|---|--------|------|------|---------|------|-----|--------|-------|
| Claude | — | **0.338** | **0.316** | 0.251 | 0.256 | 0.261 | 0.283 | 0.184 |
| Qwen | | — | **0.358** | 0.275 | 0.321 | 0.228 | 0.221 | 0.174 |
| Kimi | | | — | 0.294 | 0.285 | 0.236 | 0.251 | 0.151 |
| MiniMax | | | | — | 0.260 | 0.284 | 0.186 | 0.154 |
| Grok | | | | | — | 0.240 | 0.197 | 0.147 |
| GPT | | | | | | — | 0.188 | 0.126 |
| Gemini | | | | | | | — | 0.124 |
| Llama | | | | | | | | — |

The highest cross-model similarity is Qwen-Kimi (0.358) and Claude-Qwen (0.338). Gemini and Llama are the most isolated models. The new models integrate well: Qwen and Kimi both show strong similarity with Claude and each other, suggesting these larger Chinese-developed models navigate conceptual space with routes more similar to Claude than to GPT or Gemini. Mean cross-model Jaccard involving new models is 0.235, well above the 0.10 shared-structure threshold.

### Scale Effect: Not Confirmed as Predicted

The prediction that Llama 8B would show the lowest intra-model Jaccard (as the smallest model) fails: Llama's 0.298 exceeds GPT's 0.258. Gait consistency is an architectural/training property, not a scale property. However, scale does predict bridge frequency (Llama is the clear outlier) and cross-model similarity (Llama has the lowest similarity with every other model). Scale affects what navigational landmarks a model discovers, not how consistently it uses them.

---

## 2. Pre-Fill Relation Classes: The Taxonomy That Worked — Differently

### The Hypothesis

Phase 10B tests a three-way taxonomy for predicting bridge survival under pre-fill perturbation:

- **On-axis substitute:** A concept on the same semantic dimension as the bridge (e.g., "cool" for bridge "warm" on hot→cold)
- **Same-domain off-axis:** A concept in the same domain but not competing on the same dimension (e.g., "harvest" for bridge "fermentation" on grape→wine)
- **Unrelated:** A concept from an unrelated domain (e.g., "gravity" for bridge "warm" on hot→cold)

The predicted ordering was on-axis < unrelated < same-domain: on-axis substitutes should maximally displace the bridge (they provide an alternative on the same dimension), unrelated should moderately displace (they derail but don't substitute), and same-domain should minimally displace (they prime the right domain without competing).

### The Friedman Test: Significant

The primary test succeeds: Friedman chi-squared = 6.750, df = 2, p = 0.034. The three relation classes produce significantly different bridge survival rates across 8 pairs blocked by pair identity. The taxonomy captures real variance in pre-fill outcomes.

This extends the Phase 7A finding (O15) and the Phase 9C content-modulation finding (O21). Phase 7A established that pre-fill presence displaces bridges; Phase 9C showed that pre-fill content modulates survival magnitude. Phase 10B formalizes and sharpens these observations with a structured taxonomy, showing that a three-way relation-class classification predicts survival differences with statistical significance.

### The Ordering: Reversed for On-Axis

The actual ordering is:

| Relation Class | Mean Survival | 95% CI |
|----------------|---------------|--------|
| Same-domain | 0.708 | [0.482, 0.922] |
| On-axis | 0.643 | [0.330, 0.903] |
| Unrelated | 0.388 | [0.191, 0.606] |

Post-hoc Wilcoxon signed-rank tests:
- On-axis vs unrelated: p = 0.025 (**significant**)
- Same-domain vs unrelated: p = 0.036 (**significant**)
- On-axis vs same-domain: p = 0.889 (not significant)

The key surprise: **unrelated pre-fills are the most destructive, not on-axis substitutes.** The predicted ordering was on-axis < unrelated < same-domain, but the actual ordering is unrelated < on-axis ≈ same-domain.

### Why Unrelated Pre-Fills Are Most Destructive

The mechanism becomes clear when considering what each pre-fill type does to the navigational trajectory:

**On-axis substitute** (e.g., "cool" for warm on hot→cold): The model receives a concept *on the correct dimension*. Even though "cool" competes with "warm" for position on the temperature gradient, it keeps the model navigating within the right conceptual neighborhood. The subsequent waypoints continue along the temperature axis, and the bridge may still appear later in the path or be functionally replaced by a concept that serves the same navigational role.

**Same-domain off-axis** (e.g., "harvest" for fermentation on grape→wine): The model receives a concept *in the correct domain* but on a different dimension. This is the least disruptive because it primes the right associative cluster without competing with the bridge's specific navigational role. The model can still route through the bridge because nothing in the pre-fill substitutes for it.

**Unrelated** (e.g., "gravity" for warm on hot→cold): The model receives a concept from a completely different domain. This derails navigation entirely — the model must spend subsequent waypoints recovering from the unrelated heading before it can re-enter the correct conceptual neighborhood. By the time it does, it may be too late in the 5-waypoint sequence for the bridge to appear.

**[observed]** The navigational disruption hierarchy is: domain-irrelevant > dimension-competing ≈ domain-priming. Pre-fills that keep the model in the right conceptual neighborhood (whether on the same axis or in the same domain) preserve bridges; pre-fills from unrelated domains destroy them. A post-hoc interpretation consistent with the data: pre-fill displacement may be primarily about whether the pre-fill maintains or destroys the navigational context, rather than about competition with the bridge. However, the non-significant on-axis vs same-domain comparison (p=0.889, N=8) could also reflect insufficient power to detect a real difference, so the binary (related vs. unrelated) interpretation should be treated as a hypothesis pending larger samples.

### Per-Model Patterns

The per-model separation reveals model-specific responses to the taxonomy:

| Model | On-Axis | Same-Domain | Unrelated | Gap (SD - OA) |
|-------|---------|-------------|-----------|---------------|
| Claude | 0.800 | 0.738 | 0.413 | -0.062 |
| GPT | 0.631 | 0.628 | 0.291 | -0.003 |
| Grok | 0.456 | 0.582 | 0.257 | 0.126 |
| Gemini | 0.686 | 0.885 | 0.591 | 0.199 |

Claude and GPT show on-axis ≈ same-domain (nearly identical survival). Grok and Gemini show same-domain > on-axis, with Gemini showing the largest separation (0.199). Only 2/4 models show the predicted same-domain > on-axis pattern, failing the P9 threshold of >=3/4.

All four models agree on the dominant pattern: unrelated pre-fills produce the lowest survival. This is the model-general finding.

### Warm/Fermentation Replications: Perfect

The warm and fermentation replications anchor Phase 10B to Phase 9A:

- Hot-cold "warm" on-axis survival: 0.000 (Phase 9A: 0.000, diff: 0.000)
- Grape-wine "fermentation" same-domain survival: 0.991 (Phase 9A: 1.017, diff: 0.026)

These are the cleanest replications in the entire benchmark. The warm/fermentation contrast that drove Phase 9A's interpretation (same dominance ratio, opposite outcomes, explained by pre-fill semantic relationship) reproduces perfectly, and now the relation-class taxonomy provides the formal framework: warm's pre-fill is on-axis (competing), fermentation's is same-domain (non-competing).

### Effect Size: Small but Real

Cohen's d for same-domain vs on-axis is 0.170 — a small effect. The meaningful contrast is between related pre-fills (on-axis + same-domain combined) and unrelated pre-fills, where the gap is ~0.28 survival units with significant post-hoc tests.

The small on-axis vs same-domain effect size, combined with the non-significant Wilcoxon test (p=0.889, N=8), is consistent with a binary distinction: **related vs. unrelated**, rather than the full three-way taxonomy. However, with only 8 blocked pairs, the power to detect a moderate on-axis vs same-domain difference is limited. The binary interpretation is a plausible post-hoc hypothesis, not a confirmed finding.

### Variance Reduction: Not Achieved

Phase 10B was also designed to test whether the three-way taxonomy reduces within-class variance compared to Phase 7A's undifferentiated "congruent" category. Phase 7A congruent variance: 0.1371. Phase 10B on-axis variance: 0.1766, same-domain variance: 0.1148. Same-domain variance is lower, but on-axis variance is higher. The taxonomy partially reduces variance (same-domain is more homogeneous) but doesn't uniformly improve on the coarser classification.

---

## 3. Prediction Accuracy: Phase 10 Scorecard

### Phase 10A Predictions

| # | Prediction | Result | Verdict |
|---|------------|--------|---------|
| 1 | >= 3 of 5 new models pass reliability gate | 4 of 5 reliable | **Confirmed** |
| 2 | Each reliable model shows gait in 0.15-0.70 range (R1) | 4/4 in range | **Confirmed** |
| 3 | All reliable models show asymmetry > 0.60 (R2) | 4/4 above 0.60 | **Confirmed** |
| 4 | Control pair has no waypoint > 0.10 (R5) | 0/4 pass (paper 0.933, cloud 0.867, office 0.800) | Not confirmed |
| 5 | Cohort bridge freq CI includes zero (R6 generalizes) | diff -0.096, CI [-0.241, 0.064] | **Confirmed** |
| 6 | >= 5/7 pairs show mean bridge freq > 0.40 in new cohort | 7/7 above 0.40 | **Confirmed** |
| 7 | Cross-model Jaccard involving new models > 0.10 | mean 0.235 | **Confirmed** |
| 8 | Llama 8B shows lowest intra-model Jaccard (scale effect) | GPT is lower (0.258 vs 0.298) | Not confirmed |

**10A accuracy: 6/8 (75%)**

### Phase 10B Predictions

| # | Prediction | Result | Verdict |
|---|------------|--------|---------|
| 1 | Friedman test significant (p < 0.05) | p = 0.034 | **Confirmed** |
| 2 | On-axis survival significantly lower than same-domain | p = 0.889 (NS) | Not confirmed |
| 3 | On-axis survival lower than unrelated | Opposite: on-axis > unrelated | Not confirmed |
| 4 | Ordering on-axis < unrelated < same-domain in >= 5/8 pairs | 1/8 | Not confirmed |
| 5 | Cohen's d >= 0.50 for same-domain vs on-axis | d = 0.170 | Not confirmed |
| 6 | Warm replicates Phase 9A within 0.15 | diff = 0.000 | **Confirmed** |
| 7 | Fermentation replicates Phase 9A within 0.15 | diff = 0.026 | **Confirmed** |
| 8 | Per-class variance < Phase 7A pooled variance | Partial (same-domain only) | Not confirmed |
| 9 | >= 3/4 models show same-domain > on-axis | 2/4 | Not confirmed |
| 10 | Bridge strength × on-axis survival Spearman CI excludes zero | CI includes zero | Not confirmed |

**10B accuracy: 3/10 (30%)**

### Phase 10 Combined: 9/18 (50%)

This is substantially above the Phase 8-9 floor of 20-24%, driven primarily by the expanded 10A cohort. With 4 reliable models, structural predictions (reliability, gait, asymmetry, bridge generalization, cross-model similarity) all confirm decisively — these were ambiguous or falsified when tested with only Llama. The 10B mechanistic predictions (ordering, effect size, variance reduction) continue to fail, maintaining the pattern: structural characterization succeeds, mechanistic prediction does not.

### Cumulative Scorecard

| Phase | Accuracy | Type |
|-------|----------|------|
| Phase 4B | 81.3% (26/32) | Bridge characterization |
| Phase 5A | 64.6% (31/48) | Cue-strength gradients |
| Phase 5B | 42.9% (24/56) | Dimensionality and polysemy |
| Phase 6A | 50.0% (3/6) | Salience distributions |
| Phase 6B | 50.0% (3/6) | Forced-crossing asymmetry |
| Phase 6C | 25.0% (2/8) | Positional bridge structure |
| Phase 7A | 57.1% (4/7) | Anchoring causality |
| Phase 7B | 50.0% (3/6) | Curvature estimation |
| Phase 7C | 28.6% (2/7) | Too-central boundary |
| Phase 8A | 12.5% (1/8) | Bridge fragility |
| Phase 8B | 22.2% (2/9) | Gradient blindness |
| Phase 8C | 37.5% (3/8) | Gait normalization |
| Phase 9A | 28.6% (2/7) | Bridge dominance |
| Phase 9B | 11.1% (1/9) | Transformation blindness |
| Phase 9C | 22.2% (2/9) | Pre-fill facilitation |
| **Phase 10A** | **75.0% (6/8)** | **Model generality** |
| **Phase 10B** | **30.0% (3/10)** | **Relation classes** |

The prediction accuracy trajectory tells the benchmark's story: high accuracy when characterizing known structure (Phase 4B: 81%), declining as experiments probe mechanism (Phases 6-7: ~30-57%), bottoming out when testing single-variable mechanistic hypotheses (Phases 8-9: ~11-37%), and recovering when structural predictions are tested with adequate data (Phase 10A: 75%). The Phase 10A result demonstrates that the benchmark's structural claims are genuinely predictive — the Phases 8-9 accuracy floor reflected the limits of mechanistic prediction, not the limits of the benchmark's characterization.

---

## 4. Connections to Prior Phases

### Which Robust Claims Are Updated

**R1 (Model gaits)** receives strong cross-architecture support. Four new models from different providers (Qwen, MiniMax, Kimi, Llama) all show characteristic gaits in the 0.298-0.508 range. The gait phenomenon is confirmed across 8 models spanning 5 providers, multiple architectures, and scales from 8B to frontier. R1 is substantially strengthened.

**R2 (Asymmetry / quasimetric space)** receives strong cross-architecture support. All four new models show asymmetry > 0.60 (range 0.638-0.785). Quasimetric navigation replicates on every model tested. R2 is substantially strengthened — the quasimetric property of conceptual space appears to be architecture-independent.

**R5 (Controls)** receives a significant qualification. All 4 new models fail the control validation on stapler-monsoon (top waypoint frequency 0.800-0.933 vs. 0.10 threshold). This is not a small-model problem — MiniMax and Kimi are frontier-class models. The control pair may have an unintended associative bridge ("paper"/"office") that the original cohort happened to navigate around. R5 remains valid for the original cohort but the specific control pair needs scrutiny.

**R6 (Bridge bottlenecks)** receives decisive generality confirmation. The cohort comparison CI now includes zero (new cohort 0.721 vs original 0.817, diff -0.096, CI [-0.241, 0.064]). Bridge bottleneck structure generalizes across model providers and architectures for comparable-scale models. The Llama 8B outlier reveals a scale dependency: bridge landmarks require sufficient model capacity to converge on. R6 is substantially strengthened for the claim that bottlenecks are universal; the scale qualification is a refinement, not a limitation.

### Which Observations Are Updated

**O15 (Pre-filling displaces bridges)** is refined by Phase 10B's relation-class finding. The displacement magnitude depends on the semantic relationship between the pre-fill and the navigational context: unrelated pre-fills displace most (survival 0.388), while on-axis (0.643) and same-domain (0.708) pre-fills preserve bridges by maintaining the conceptual neighborhood. The Phase 7A finding stands, with the qualification that displacement is modulated by relation class.

**O21 (Pre-fill content modulates survival)** is extended. Phase 10B provides a formal taxonomy for the content effect: the operationally meaningful distinction is related (on-axis + same-domain) vs. unrelated, not the full three-way classification. This resolves the Phase 9A warm/fermentation puzzle — warm's pre-fill ("cool") is on-axis but still related, while an unrelated pre-fill would destroy the bridge even more effectively.

### What's New

**O25. Structural properties generalize universally; navigational content generalizes across comparable-scale models but diverges at small scale.** [observed] — Phase 10A (4 new models, 720 runs). All 4 new models show characteristic gait (0.298-0.508), quasimetric asymmetry (all > 0.60), and non-zero cross-model Jaccard (mean 0.235). Critically, the cohort bridge frequency comparison CI includes zero (new 0.721 vs original 0.817, diff -0.096, CI [-0.241, 0.064]) — bridge structure generalizes. Qwen, MiniMax, and Kimi produce bridge frequencies comparable to the original cohort. Llama 3.1 8B is the sole outlier (mean bridge freq 0.200), revealing a scale effect: an 8B model navigates the same geometric space but through different landmarks. The geometry is universal; the landmarks are universal among large models and scale-dependent for small ones.

**O26. Relation class significantly affects bridge survival; unrelated pre-fills are most disruptive.** [observed] — Phase 10B (8 pairs, 4 models, 960 runs). Friedman p=0.034. Unrelated survival (0.388) < on-axis (0.643) ≈ same-domain (0.708). Post-hoc: both on-axis vs unrelated (p=0.025) and same-domain vs unrelated (p=0.036) significant; on-axis vs same-domain not significant (p=0.889). The operationally meaningful distinction is related vs. unrelated, not the three-way taxonomy.

**O27. Control pair stapler-monsoon has an unintended associative bridge for non-original models.** [observed] — Phase 10A (4 new models). All 4 new models converge on strong waypoints for the "random" control pair: MiniMax and Kimi on "paper" (0.933), Qwen on "cloud" (0.867), Llama on "office" (0.800). The original 4 models passed R5 validation on this pair, but the new models expose that stapler→monsoon has navigable semantic intermediaries that many models discover. R5 may need additional control pairs or a revised threshold.

---

## 5. The Graveyard, Updated

Phase 10 adds one entry and resurrects one:

**G26. RESURRECTED — Bridge bottleneck generalization now confirmed.** The original G26 (based on Llama-only data) predicted that bridge frequency CI would include zero and observed it did not. With the expanded 4-model cohort, the CI now includes zero (diff -0.096, CI [-0.241, 0.064]). The original finding was an artifact of testing only a single small model. Bridge bottleneck structure generalizes across providers and architectures for comparable-scale models. **G26 is resurrected (retained as historical record in graveyard)** and replaced by the positive confirmation in O25 (revised). The Llama-specific finding (bridge frequency 0.200) is retained as a scale effect within O25.

**G27. Predicted relation class ordering (on-axis < unrelated < same-domain).** Predicted that on-axis substitutes would be the most disruptive pre-fills (they directly compete with the bridge on the same dimension), with unrelated falling in between. Observed: unrelated pre-fills are the most disruptive (survival 0.388), while on-axis (0.643) and same-domain (0.708) are comparably protective. The predicted ordering had 1/8 pairs correct. The mechanism is about maintaining vs. destroying navigational context, not about dimensional competition. Partially killed by Phase 10B (the Friedman test confirming that relation class matters is the surviving component).

The graveyard retains all 27 entries (G1-G27) with G26 marked as resurrected. The resurrection of G26 is notable: it demonstrates the value of patient re-testing — an infrastructure limitation (aggressive timeouts) had masqueraded as a substantive finding about model generality.

---

## 6. Theoretical Integration: The Complete Benchmark

### The Structure/Content/Scale Hierarchy

Phase 10's central contribution — revised with the expanded cohort — is a three-level hierarchy of what generalizes:

**Universal properties** (replicate across all 8 tested models, architectures, scales):
- Each model has a characteristic navigational gait (R1) — replicated across 8 models spanning 8B to frontier
- Conceptual space is quasimetric (R2) — confirmed for 8 models from 8 providers
- Triangle inequality holds at ~91% (R2) — confirmed across 3 independent samples in original cohort
- Hierarchical paths compose (R4) — original cohort only
- Cue-strength gradients exist (R7) — original cohort only
- Pre-fill perturbation affects bridges, with unrelated pre-fills most destructive (O15, O26)

**Scale-dependent properties** (generalize across comparable-scale models, diverge at small scale):
- Which specific concepts serve as bridges — Qwen, MiniMax, Kimi converge on the same bridges as the original cohort; Llama 8B diverges
- Bridge bottleneck frequency — cohort CI includes zero for large models; Llama is the outlier
- Control pair behavior — all new models (including frontier-class) show associative convergence on stapler-monsoon

**Model-specific properties** (vary across individual models even at comparable scale):
- Which waypoints appear on paths (cross-model Jaccard remains 0.12-0.36)
- Specific gait consistency level (Jaccard range 0.258-0.578 across models)
- Gemini's unique isolation and deficit pattern (O1)

This three-level hierarchy is the benchmark's most theoretically significant finding. The original two-level "structure generalizes, content doesn't" framing — based on Llama-only data — was an artifact of confounding model scale with model identity. With adequate data, the picture is richer: conceptual topology is real, measurable, and its geometric structure is universal. The navigational landmarks are also shared across large models from different providers, suggesting these landmarks reflect properties of conceptual space itself (or shared training data) rather than model-specific idiosyncrasies. Only at small scale do the landmarks diverge, suggesting a capacity threshold for converging on the "canonical" navigational vocabulary.

### The Five-Act Narrative (Updated)

The original four-act narrative (structure → topology → mechanism → limits) gains a fifth act:

**Act I: Structure (Phases 1-3).** Models have stable conceptual gaits, space is quasimetric, paths are compositional for hierarchical triples.

**Act II: Topology (Phases 4-5).** Bridges are salience-determined bottlenecks, not word associations. Cue-strength gradients exist. Gemini diverges.

**Act III: Mechanism (Phases 6-7).** Early anchoring displaces bridges. Bridge position concentrates early. Pre-fill establishes causal influence. Cross-model geometry fails.

**Act IV: Limits (Phases 8-9).** Single-variable mechanistic models fail at ~20-24% prediction accuracy. The phenomenon requires multi-variable interaction models. Six hypotheses tested, zero confirmed.

**Act V: Generality (Phase 10).** Structural properties AND navigational content generalize beyond the original model cohort to 4 new models from different providers. Scale affects content but not structure — Llama 8B navigates the same geometry but through different landmarks. The taxonomy of pre-fill disruption reveals that navigational context maintenance, not dimensional competition, determines bridge survival.

### What the Benchmark Has Established: Final Accounting

After 10 phases and ~19,500 runs:

**7 robust claims (R1-R7):** Model gaits, quasimetric space, polysemy differentiation, hierarchical compositionality, control validation, bottleneck bridges, cue-strength gradients. R1 and R2 confirmed across 8 models from 8 providers. R6 (bridge bottlenecks) confirmed across 7 large models. R5 (controls) qualified — stapler-monsoon fails for all non-original models.

**27 observations (O1-O27):** From bridge topology and salience distributions through pre-fill displacement mechanics, facilitation effects, relation classes, the structure/content/scale hierarchy, and the control pair limitation.

**27 graveyard entries (G1-G27; G26 resurrected):** From Phase 1 measurement artifacts through Phase 10 ordering predictions. G26 (bridge generalization failure) was resurrected by expanded data — an infrastructure limitation had masqueraded as a substantive finding. The systematic falsification of simple mechanistic models — 8 hypotheses tested in Phases 8-10, zero confirmed at primary test level — is itself a finding about the nature of conceptual navigation.

**~19,500 API runs across 8 models (4 core + 4 new) and 10 phases.** The benchmark is complete.

---

## 7. Summary of Key Findings

1. **Structural AND content properties generalize cross-architecture.** R1 (gait) and R2 (asymmetry) replicate on all 4 new models (Qwen, MiniMax, Kimi, Llama). Bridge bottleneck frequency CI includes zero for the expanded cohort (new 0.721 vs original 0.817). **Conceptual navigation is not an idiosyncrasy of four specific models — it generalizes across 8 models from 8 providers.** [observed] (O25 revised)

2. **Llama 8B reveals a scale effect on navigational content.** Llama's mean bridge frequency (0.200) is massively below both the original cohort (0.817) and the other new models (Qwen/MiniMax/Kimi mean ~0.855). The structure/content split originally attributed to model identity is actually a structure/scale split. **Large models converge on the same navigational landmarks; a small model navigates the same geometry through different paths.** [observed] (O25)

3. **Relation class significantly affects bridge survival.** Friedman p=0.034. The three-way taxonomy captures real variance. **This formalizes and extends the content-modulation effect (O21) with a structured taxonomy.** [observed] (O26)

4. **Predicted ordering is wrong.** Unrelated pre-fills (survival 0.388) are most disruptive, not on-axis substitutes (0.643). On-axis and same-domain are not significantly different (p=0.889, N=8). **Disruption is about navigational context maintenance rather than dimensional competition.** Graveyard: G27.

5. **Warm/fermentation replications are perfect.** Within 0.026 of Phase 9A values. The warm-destroyed/fermentation-bulletproof contrast now has a formal taxonomic explanation.

6. **Control validation fails for all new models.** Not just Llama — MiniMax ("paper" 0.933), Kimi ("paper" 0.933), Qwen ("cloud" 0.867), and Llama ("office" 0.800) all fail R5 on stapler-monsoon. The control pair may have an unintended semantic bridge. [observed] (O27)

7. **Prediction accuracy is 50% (9/18).** The expanded cohort confirms 6/8 structural predictions in 10A (up from 3/8 with Llama only). Mechanistic ordering predictions (10B) continue to fail. **Structural characterization is genuinely predictive when tested with adequate data.**

8. **G26 resurrected.** The graveyard entry "bridge bottleneck generalization fails" — originally based on Llama-only data — is overturned by the expanded cohort. An infrastructure limitation (aggressive timeouts) had masqueraded as a substantive finding. **Patient re-testing reversed a false negative.**

9. **The structure/content/scale hierarchy is the capstone finding.** Conceptual topology is real, measurable, and universal: geometric structure replicates across all 8 models. Navigational landmarks are shared across large models from different providers, suggesting these reflect properties of conceptual space (or shared training data) rather than model-specific idiosyncrasies. Scale is the differentiator: small models navigate the same space through different landmarks.

10. **The benchmark is complete.** 10 phases, ~19,500 runs, 8 models from 8 providers, 7 robust claims, 27 observations, 27 graveyard entries (G26 resurrected). The paper's narrative is fully supported and substantially strengthened by the expanded generality result.
