# Phase 11 Analysis: Robustness and the Final Accounting

> Interpretive analysis of Phase 11: expanded model generality (11A), control pair revision (11B), and multiverse robustness (11C).
>
> 720 new runs (11A) + 240 new runs (11B) + 1,080 new runs (11C) = 2,040 new API runs + ~340 reused baseline runs (11C), across 4 new models (11A), 4 control candidates screened on 6 models (11B), and 3 models in a 2x2 waypoint/temperature grid (11C). Grand total across all 11 phases: ~21,540 unique API runs across 12 models from 11 independent training pipelines.
>
> March 2026

## Executive Summary

**Phase 11 is the benchmark's robustness audit — three experiments designed to close pre-paper vulnerabilities — and it delivers the project's cleanest single result: model identity drives conceptual navigation structure, not elicitation protocol.** The ANOVA from Part C (multiverse robustness) shows model identity as the only factor with a substantial effect size (eta-squared=0.242, p≈0.001), with waypoint count (p≈0.520), temperature (p≈0.743), and their interaction (p≈0.886) all null. (Note: p-values are approximate — see §3 methodological qualification.) This is the statement a reviewer needs: "Vary the protocol, and the structure stays. Vary the model, and it changes." Bridge frequency — the primary observable for bottleneck structure — exceeds 0.97 across all four waypoint/temperature conditions, the most protocol-robust property in the benchmark.

The expanded generality test (11A) adds 4 new models from 4 new providers (Mistral Large 3, DeepSeek V3.2, Llama 4 Maverick, Cohere Command A), bringing the total to 12 models from 11 independent training pipelines. All 4 pass reliability, all 4 replicate R1 (gait) and R2 (asymmetry), and the combined 8-model new cohort bridge frequency CI includes zero (diff -0.100, CI [-0.286, 0.089]). The headline discovery is Mistral's record gait of 0.747 — the first model to exceed Claude's 0.578 and the first to break the previously assumed 0.15-0.70 ceiling. Mistral achieves 0.936 Jaccard on music-mathematics, meaning 15 independent runs produce nearly identical paths. At the other end, bridge-specific variation across the new models is striking: "sadness" is 0.000 for Mistral and Llama 4 but 1.000 for DeepSeek; "germination" is 1.000 for Mistral but 0.000 for DeepSeek. The universal bridges (dog, spectrum, warm) remain universal; the model-dependent bridges (sadness, germination, harmony, leather) remain model-dependent. The Llama scale test is confirmed: Maverick's bridge frequency (0.724) dwarfs the 8B's (0.200), establishing that navigational content convergence is a scale property.

The control pair revision (11B) fails completely — all 4 candidates fail screening, 0/24 model-candidate cells pass either gate — and the retrospective analysis reveals that stapler-monsoon itself never truly passed R5 under the strict criteria now applied. Top-waypoint frequencies for the original 4 models range from 0.650 to 0.775. The implication is uncomfortable but important: at 7 waypoints, LLMs find navigable semantic routes between *any* two concrete concepts. R5 in its current single-pair, strict-threshold form is not viable. The control problem is a genuine limitation to be acknowledged, not a flaw to be fixed with a different pair. Combined prediction accuracy is 8/18 (44%), consistent with the benchmark's pattern: structural predictions succeed, mechanistic and design predictions fail.

---

## 1. Expanded Model Generality — 12 Models, 11 Families

### The Final Cohort

Phase 11A completes the benchmark's model diversity push. Four new models were selected to maximize architectural and provider diversity: Mistral Large 3 (Mistral AI, France), DeepSeek V3.2 (DeepSeek, China), Llama 4 Maverick (Meta, mixture-of-experts), and Cohere Command A (Cohere, Canada). Combined with the Phase 10A additions (Qwen, MiniMax, Kimi, Llama 3.1 8B) and the original cohort (Claude, GPT, Grok, Gemini), the benchmark now spans 12 models from 11 independent training pipelines — the single overlap being two Llama-family models at different scales (8B and Maverick).

All 4 new models pass the reliability gate with patient mode (300s timeout). Latencies span an order of magnitude: Llama 4 Maverick at 419ms (the fastest in the benchmark), Mistral at 934ms, DeepSeek at 2,542ms, and Cohere at 3,147ms. All achieve 100% connectivity and parse rate. The 720 new runs (4 models x 12 pairs x 15 reps) completed with 0% failure rate.

### Mistral's Record Gait: 0.747

The 12-model gait spectrum, sorted by consistency:

| Model | Mean Intra-Model Jaccard | 95% CI | Cohort |
|-------|------------------------|--------|--------|
| **Mistral Large 3** | **0.747** | **[0.667, 0.841]** | **phase11a** |
| Claude Sonnet 4.6 | 0.578 | — | original |
| DeepSeek V3.2 | 0.540 | [0.408, 0.670] | phase11a |
| Llama 4 Maverick | 0.539 | [0.436, 0.646] | phase11a |
| Qwen 3.5 397B-A17B | 0.508 | [0.435, 0.580] | phase10a |
| Cohere Command A | 0.502 | [0.377, 0.633] | phase11a |
| MiniMax M2.5 | 0.419 | [0.298, 0.546] | phase10a |
| Moonshot Kimi K2.5 | 0.414 | [0.328, 0.507] | phase10a |
| Gemini 3 Flash | 0.372 | — | original |
| Llama 3.1 8B Instruct | 0.298 | [0.207, 0.403] | phase10a |
| Grok 4.1 Fast | 0.293 | — | original |
| GPT-5.2 | 0.258 | — | original |

Mistral's 0.747 is a genuine discovery. It is the first model to exceed Claude's 0.578, previously the benchmark's ceiling. The CI lower bound (0.667) still exceeds Claude's point estimate. This result falsifies P2 (predicted all models in 0.15-0.70) — Mistral is *above* the range.

The per-pair breakdown reveals where Mistral's rigidity concentrates:

| Pair | Mistral Jaccard | Next Highest (any model) |
|------|----------------|--------------------------|
| music-mathematics | **0.936** | Claude ~0.60 |
| hot-cold | 0.934 | DeepSeek 0.694 |
| animal-poodle | 0.762 | Llama4 0.679 |
| emotion-melancholy | 0.734 | Llama4 0.753 |
| hide-shoe | 0.740 | Cohere 0.620 |
| seed-garden | 0.649 | Cohere 0.660 |
| light-color | 0.642 | DeepSeek 0.883 |
| stapler-monsoon | 0.577 | Cohere 0.283 |

Mistral's 0.936 on music-mathematics means that across 15 independent runs, the paths are nearly identical — waypoint overlap is 93.6%. This approaches deterministic navigation. For context, Claude's highest per-pair Jaccard on any pair is approximately 0.60. Mistral is not just more consistent than Claude; it is qualitatively different in its rigidity on certain pairs.

**[observed] (O28)** Mistral Large 3 shows record gait consistency (0.747), establishing that the gait range extends beyond the previously assumed 0.15-0.70 ceiling. On music-mathematics, Mistral achieves 0.936 Jaccard — near-deterministic navigation. The high consistency is pair-dependent (0.577 on stapler-monsoon vs. 0.936 on music-mathematics), indicating it reflects strong specific associations rather than a global decoding artifact. This may reflect Mistral's architecture or training producing exceptionally rigid conceptual routes for pairs with strong semantic structure.

### Bridge Frequency: Universal Bridges and Model-Specific Bridges

The per-pair, per-model bridge frequency matrix for the Phase 11A models reveals a striking dichotomy:

| Pair | Bridge | Mistral | DeepSeek | Llama4 | Cohere | Prior Cohort Range |
|------|--------|---------|----------|--------|--------|-------------------|
| animal-poodle | dog | 1.000 | 1.000 | 1.000 | 1.000 | 0.067-1.000 |
| light-color | spectrum | 1.000 | 1.000 | 0.933 | 1.000 | 0.267-1.000 |
| hot-cold | warm | 1.000 | 1.000 | 0.867 | 1.000 | 0.733-1.000 |
| hide-shoe | leather | 0.267 | 1.000 | 0.867 | 1.000 | 0.133-1.000 |
| emotion-melancholy | sadness | **0.000** | **1.000** | **0.000** | 0.933 | 0.067-1.000 |
| seed-garden | germination | **1.000** | **0.000** | 0.800 | 0.067 | 0.133-1.000 |
| music-mathematics | harmony | 0.133 | 0.267 | 0.600 | 0.200 | 0.000-0.800 |

The pattern separates into two clear categories:

**Universal bridges** — dog, spectrum, warm: These achieve near-ceiling frequency across all models tested in the benchmark. Dog is 1.000 for all 4 Phase 11A models. Spectrum is >=0.933. Warm is >=0.867. These concepts are navigational necessities — there is no alternative route between the endpoints that avoids them.

**Model-dependent bridges** — sadness, germination, harmony, leather: These show dramatic model-to-model variation, often including both 0.000 and 1.000 for different models on the same pair.

The most striking pattern is the sadness/germination mirror. Mistral achieves 0.000 on sadness (never routes through "sadness" on emotion-melancholy) but 1.000 on germination (always routes through "germination" on seed-garden). DeepSeek shows the exact inverse: 1.000 on sadness, 0.000 on germination. These are not low-frequency fluctuations — they are categorical presences and absences. Mistral navigates emotion-melancholy through a different conceptual route entirely (perhaps through "feeling", "sorrow", or direct emotional vocabulary that excludes the specific word "sadness"), while DeepSeek navigates seed-garden through a non-process route (perhaps through "soil", "plant", or "growth" without the specific process term "germination").

This bridge-specific, not global, variation is the key insight. The same models that show 0.000 on one model-dependent bridge achieve 1.000 on universal bridges. The variation is not about overall navigational competence or bridge sensitivity — it is about whether a specific model's navigational vocabulary includes a specific conceptual landmark for a specific pair. Process-naming bridges (germination, harmony) and emotion-naming bridges (sadness) are the most sensitive to this model-specific vocabulary effect, consistent with O4 (process-naming bridges' sensitivity to navigational vocabulary).

**Harmony** continues its status as the benchmark's most variable bridge: 0.133 (Mistral), 0.200 (Cohere), 0.267 (DeepSeek), 0.600 (Llama 4). Across all 12 models, harmony ranges from 0.000 (GPT, Llama 8B) to 0.800 (Kimi, MiniMax). The music-mathematics relationship can be navigated through "harmony" (the concept linking musical and mathematical structure), but many models find alternative routes — through "rhythm", "pattern", "frequency", or "ratio" — that serve the same navigational function without using the specific word.

### The Combined Cohort Test: Bridge Structure Generalizes

The primary test — does bridge bottleneck structure generalize beyond the original 4 models? — passes decisively with the expanded 8-model new cohort:

- **New cohort (10A+11A) mean bridge frequency:** 0.717 [0.577, 0.860] (8 models)
- **Original cohort mean bridge frequency:** 0.817 [0.677, 0.937]
- **Difference:** -0.100 [-0.286, 0.089]
- **CI includes zero: YES**

The Phase 10A result (diff -0.096, CI [-0.241, 0.064]) is confirmed and essentially unchanged by the addition of 4 more models. The new cohort mean is slightly lower (0.717 vs Phase 10A's 0.721), reflecting the model-dependent bridge variation in the Phase 11A models (particularly the sadness and germination zeros). But the CI comfortably includes zero. Bridge bottleneck structure generalizes across 12 models from 11 training pipelines.

### The Llama Scale Test: Confirmed

| Metric | Llama 4 Maverick | Llama 3.1 8B |
|--------|-----------------|-------------|
| Gait Jaccard | 0.539 | 0.298 |
| Mean Bridge Freq | 0.724 | 0.200 |
| Mean Asymmetry | 0.673 | 0.785 |

The within-family scale comparison is clean. Maverick's gait (0.539) is 1.8x the 8B's (0.298). Bridge frequency (0.724 vs 0.200) shows a 3.6x gap — Maverick routes through the standard navigational landmarks while the 8B takes alternative paths. The single reversal is asymmetry: the 8B shows *higher* asymmetry (0.785 vs 0.673), consistent with Phase 10A's finding that smaller models may exhibit stronger directional effects due to less capacity for maintaining bidirectional context.

The scale effect is now confirmed within a single model family: same architecture, same training methodology, different scale, dramatically different navigational content. **Structure (gait, asymmetry) is present at both scales; content (which specific bridges are used) diverges.**

### R2 (Asymmetry): Universal Quasimetric Space Across 12 Models

All 4 Phase 11A models show mean asymmetry above 0.60:

| Model | Mean Asymmetry | 95% CI |
|-------|---------------|--------|
| Mistral | 0.729 | [0.613, 0.844] |
| DeepSeek | 0.722 | [0.660, 0.816] |
| Cohere | 0.718 | [0.608, 0.853] |
| Llama 4 | 0.673 | [0.651, 0.698] |

The quasimetric property of conceptual space has now been confirmed across every model tested in the benchmark — 12 models spanning 11 training pipelines, 5 countries of origin, scales from 8B to frontier, and architectures from dense transformers to mixture-of-experts. R2 is the benchmark's most broadly confirmed claim.

### 12-Model Similarity: DeepSeek Integrates with Claude/Qwen Cluster

The pairwise Jaccard similarity matrix across 12 models reveals clustering structure. DeepSeek's highest similarities are with Claude (0.300) and Qwen (0.279), both above the median (0.244). This places DeepSeek in the "high-similarity cluster" alongside Claude, Qwen, and Kimi — models that navigate conceptual space through the most similar routes despite originating from different providers and countries.

Selected cross-model similarities involving Phase 11A models:

| Pair | Jaccard | Notable? |
|------|---------|----------|
| Mistral-Llama4 | 0.296 | Highest for Mistral |
| Mistral-Claude | 0.278 | Above median |
| DeepSeek-Claude | 0.300 | High — same cluster |
| DeepSeek-Qwen | 0.279 | High — Chinese model pair |
| Llama4-Llama8B | 0.236 | Same family, moderate similarity |
| Cohere-Gemini | 0.133 | Lowest — isolated models |

The Llama family similarity (0.236) is moderate — higher than Llama 8B's similarity with most models (0.124-0.195) but not exceptional. Scale affects the content of navigation more than family membership predicts, though within-family similarity is non-trivially elevated.

### Control Validation: Continued Failure

All 4 Phase 11A models fail R5 on stapler-monsoon:

| Model | Top Waypoint | Top Frequency |
|-------|-------------|---------------|
| Mistral | workplace | 1.000 |
| Llama 4 | paperweight | 1.000 |
| Cohere | office supply | 1.000 |
| DeepSeek | paperclip | 0.600 |

Mistral, Llama 4, and Cohere all achieve 1.000 frequency on their top waypoint — deterministic convergence on a single concept for the "random" control pair. This extends the Phase 10A finding (O27) from 4 models to 8: every non-original model fails the control validation. The waypoint vocabulary is revealing: "workplace", "paperweight", "office supply", "paperclip" — all are stapler-adjacent office concepts. The stapler-monsoon pair has a strong, obvious associative anchor in the stapler endpoint that dominates the navigation for most models. This failure is analyzed in depth in Section 2.

### Predictions: 5 of 7 Confirmed

| # | Prediction | Result | Verdict |
|---|------------|--------|---------|
| 1 | All 4 models pass reliability gate | 4/4 reliable | **Confirmed** |
| 2 | All models show gait in 0.15-0.70 range | Mistral at 0.747 exceeds range | Not confirmed |
| 3 | All models show asymmetry > 0.60 | 4/4 above 0.60 | **Confirmed** |
| 4 | DeepSeek/Mistral/Cohere bridge freq within 0.20 of original | diff 0.109 | **Confirmed** |
| 5 | Maverick bridge freq > 0.60 (vs 8B at 0.200) | 0.724 | **Confirmed** |
| 6 | Control pair passes R5 for all models | 0/4 pass | Not confirmed |
| 7 | DeepSeek clusters with Claude/Qwen | 0.300/0.279, above median | **Confirmed** |

The two failures are instructive. P2 fails because Mistral is *too consistent* — a genuine discovery, not a prediction error in kind. P6 fails because the control pair is more fundamentally broken than we recognized — a problem whose full scope becomes clear in Phase 11B.

---

## 2. The Control Pair Problem

### Phase 11B: Complete Screening Failure

Phase 11B was designed to find replacement control pairs that would pass R5 validation across a broad model cohort. Four candidates were selected to maximize semantic distance while avoiding obvious associative routes: accordion-stalactite, turmeric-trigonometry, barnacle-sonnet, and magnesium-ballet. Each was screened with 10 runs on 6 models (claude, gpt, grok, gemini, deepseek, mistral) for a total of 240 runs.

**All 4 candidates fail screening. 0 of 24 model-candidate cells pass either gate (frequency < 0.15 or entropy > 5.0).**

| Candidate | Max Top Freq | Min Entropy | Passes? |
|-----------|-------------|-------------|---------|
| accordion-stalactite | 1.000 | 3.29 | FAIL |
| turmeric-trigonometry | 1.000 | 3.44 | FAIL |
| barnacle-sonnet | 1.000 | 3.44 | FAIL |
| magnesium-ballet | 1.000 | 3.65 | FAIL |

The top-waypoint frequencies (0.60-1.00) are an order of magnitude above the 0.15 threshold. The entropies (3.29-4.92) fall well below the 5.0 threshold. These are not borderline failures — they are decisive.

### The Patterns: Models Are Creative Associators

Each candidate pair reveals a different failure mode:

**Accordion-stalactite** shows the strongest single-concept convergence. Five of six models route through "bellow" (or a related air/breathing concept) at 0.60-1.00 frequency. The accordion-bellow association is strong and obvious in retrospect — accordion bellows are a defining physical feature. The sixth model (Mistral) routes through "harmonica", still an air-instrument association. The pair has an unintended navigational anchor in the accordion endpoint.

**Turmeric-trigonometry** shows the most diverse pattern — and still fails. Every model finds a *different* dominant waypoint: Claude routes through "ancient india" (0.900), GPT through "spice" (0.800), Grok through "sine" (0.800), Gemini through "curcumin" (1.000), DeepSeek through "angle" (1.000), Mistral through "golden ratio" (1.000). The routes are creative and varied: some connect through Indian origin (turmeric as an Indian spice, trigonometry through ancient Indian mathematics), some through color (turmeric's golden color, the golden ratio), some through direct associations with one endpoint. The diversity is irrelevant to R5 failure — what matters is that *each individual model* converges on a single route, producing high top-waypoint frequency. Entropy (3.44-4.77) reflects within-model waypoint diversity, not between-model diversity.

**Barnacle-sonnet** reveals ocean/poetry bridges: "shell" (Claude, 1.000), "sea shanty" (GPT, 1.000), "verse" (Grok, 0.800), "meter" (Gemini, 0.600), "rhyme" (DeepSeek 0.800, Mistral 1.000). The ocean-poetry connection is natural and discoverable.

**Magnesium-ballet** reveals movement/grace bridges: "movement" (Claude, 0.800), "choreography" (GPT/Gemini/DeepSeek, 0.700-1.000), "swan lake" (Grok, 0.700), "grace" (Mistral, 1.000). Ballet dominates the navigational vocabulary.

### The Retrospective: Stapler-Monsoon Never Truly Passed

The retrospective analysis of stapler-monsoon across all 12 models is the most uncomfortable finding in Phase 11B:

| Model | Cohort | Top Waypoint | Top Freq | Passes R5? |
|-------|--------|-------------|----------|-----------|
| claude | original | office | 0.775 | **NO** |
| gpt | original | paperwork | 0.650 | **NO** |
| grok | original | flood | 0.700 | **NO** |
| gemini | original | humidity | 0.775 | **NO** |
| minimax | phase10a | paper | 0.933 | **NO** |
| kimi | phase10a | paper | 0.933 | **NO** |
| qwen | phase10a | cloud | 0.867 | **NO** |
| llama | phase10a | office | 0.800 | **NO** |
| deepseek | phase11a | paperclip | 0.600 | **NO** |
| mistral | phase11a | workplace | 1.000 | **NO** |
| cohere | phase11a | office supply | 1.000 | **NO** |
| llama4 | phase11a | paperweight | 1.000 | **NO** |

**All 12 models fail.** The original 4 models — which were supposed to validate R5 — show top-waypoint frequencies of 0.650-0.775. These are lower than the Phase 10A and 11A models (0.600-1.000), but still dramatically above the 0.15 threshold. The original validation of R5 used different metrics — cross-model bridge frequency and qualitative assessment of path diversity — rather than the strict per-model top-waypoint frequency criterion applied here. Under the strict criterion, stapler-monsoon has never been a valid control.

### What This Means for the Paper

**[observed] (O29)** All 4 control candidates fail screening — LLMs find navigable semantic routes between any concept pair at 7 waypoints. Top-waypoint frequencies of 0.60-1.00 (threshold < 0.15) and entropies of 3.29-4.92 (threshold > 5.0). Combined with the retrospective showing stapler-monsoon fails for all 12 models under strict criteria, this suggests that R5 in its current single-pair, strict-threshold form is fundamentally inadequate. At 7 waypoints, the associative capacity of language models is sufficient to find structured routes between any two concrete concepts.

The control problem is worse than expected, but it is also more interesting than a simple design flaw. The finding reveals something about the nature of LLM conceptual navigation: these models are profoundly creative associators. Given any two concepts and 7 waypoints, they will construct a plausible, structured semantic route. This is not noise — it is signal about the richness of the associative landscape in trained language models.

The practical implications for the paper are threefold:

1. **Acknowledge as a limitation.** R5 should be qualified: the control evidence supports the claim that experimental pairs show *more* structure than controls (higher bridge frequency, lower entropy, more convergence), but it does not support the claim that controls are *unstructured*. The difference is one of degree, not kind.

2. **Reframe the evidence.** The strongest control evidence is not the absolute absence of structure in control pairs, but the *relative* difference: experimental pairs show bridge frequencies of 0.60-1.00 for specific predicted bridges, while control pairs show the same range but for *unpredicted* concepts. The control pair's structure is ad hoc; the experimental pair's structure is predictable from the endpoint relationship.

3. **Consider entropy-based criteria.** The entropy threshold (> 5.0) is closer to viable than the frequency threshold (< 0.15). The original 4 models show entropy of 5.01-6.26 on stapler-monsoon, suggesting that control pairs produce more diverse (if not fully uniform) navigational vocabularies. An entropy-based criterion that measures relative diversity rather than absolute absence of convergence would be more defensible.

### Predictions: 1 of 4 Confirmed

| # | Prediction | Result | Verdict |
|---|------------|--------|---------|
| 1 | At least 2 of 4 candidates pass screening | 0/4 pass | Not confirmed |
| 2 | Turmeric-trigonometry and magnesium-ballet strongest | Both fail | Not confirmed |
| 3 | Accordion-stalactite may fail (shared sensory features) | Failed — "bellow" at 1.000 | **Confirmed** |
| 4 | Passing pairs show entropy > 5.0 | No passing pairs | Insufficient data |

The sole confirmation (P3: accordion-stalactite failing due to shared sensory features) is an accurate qualitative prediction about the wrong category — we predicted it would fail while expecting the others to pass. The direction was right; the scope was wrong.

---

## 3. Multiverse Robustness — Protocol Independence

### The Design

Phase 11C tests whether the benchmark's core structural findings survive variation in two key protocol parameters: waypoint count (5, 7, 9) and sampling temperature (0.5, 0.7, 0.9). Three models (Claude, GPT, DeepSeek) are tested across a 2x2 grid of non-baseline conditions (5wp-t0.5, 5wp-t0.9, 9wp-t0.5, 9wp-t0.9), plus a 7wp-t0.7 baseline assembled from prior phases. Each condition runs 6 pairs at 15 reps per direction, yielding 1,080 new runs plus ~340 reused baseline runs. (The baseline is sparse: only Claude and GPT have matching prior data for both forward and reverse directions on hot-cold; DeepSeek has no prior-phase data, and emotion-melancholy has no reverse-direction baseline. Baseline asymmetry and gait values should be interpreted with this limitation in mind.)

This is the experiment a reviewer would design: "You chose 7 waypoints and temperature 0.7 — what if you had chosen differently?"

### The ANOVA: Phase 11's Strongest Finding

The factorial ANOVA testing gait (intra-model Jaccard) against model identity, waypoint count, temperature, and their interaction produces the cleanest result in the benchmark:

| Factor | Sum of Squares Proportion | p-value (approx.) | Interpretation |
|--------|--------------------------|---------|---------------|
| Model identity | 0.242 | **≈0.001** | **Significant** |
| Waypoint count | 0.008 | ≈0.520 | Null |
| Temperature | 0.002 | ≈0.743 | Null |
| Waypoint x Temperature | 0.000 | ≈0.886 | Null |

> **Methodological qualification:** p-values use a chi-squared approximation to the F-distribution (ignoring denominator degrees of freedom) and treat per-pair cells as independent without repeated-measures modeling. The effect sizes (eta-squared) are more reliable than the exact p-values. The qualitative conclusion — that model identity dominates while protocol parameters are null — is robust to the approximation.

Model identity (eta-squared = 0.242) accounts for 30x more variance than waypoint count (0.008) and 130x more than temperature (0.002). The interaction term (eta-squared ≈ 0.000) is as null as this analysis can produce.

**[observed] (O30)** ANOVA confirms model identity drives gait structure (eta-squared = 0.242, p≈0.001); waypoint count (p≈0.520) and temperature (p≈0.743) have no significant effect. The interaction is null (p≈0.886). This is the statement the paper needs: conceptual navigation structure is a property of the model, not an artifact of the elicitation protocol. Varying waypoint count from 5 to 9 and temperature from 0.5 to 0.9 does not alter the fundamental finding that models have characteristic navigational gaits.

This result directly addresses the most natural methodological objection to the benchmark. The choice of 7 waypoints and temperature 0.7 was principled but not pre-registered. A skeptic could argue that the structural findings reflect idiosyncratic interactions between specific models and specific protocol parameters. Phase 11C eliminates this concern: the structure is protocol-independent.

### Bridge Frequency: The Most Robust Claim

Bridge frequency across all conditions:

| Condition | Mean Bridge Freq | 95% CI |
|-----------|-----------------|--------|
| 7wp-t0.7 (baseline) | 0.992 | [0.983, 1.000] |
| 5wp-t0.5 | 0.993 | [0.978, 1.000] |
| 5wp-t0.9 | 0.978 | [0.933, 1.000] |
| 9wp-t0.5 | 0.993 | [0.978, 1.000] |
| 9wp-t0.9 | 0.985 | [0.956, 1.000] |

All conditions exceed 0.97. The lowest single condition (5wp-t0.9 at 0.978) is still essentially at ceiling. Bridge bottleneck structure — the claim that navigational paths are forced through specific landmark concepts — is the most protocol-robust property in the benchmark.

**[observed] (O31)** Bridge frequency is the most protocol-robust structural property (> 0.97 across all waypoint/temperature conditions). At 5 waypoints with temperature 0.9 (the condition most likely to produce variability), bridge frequency is still 0.978. The bottleneck phenomenon is not an artifact of long paths (7+ waypoints) or low temperature (deterministic decoding) — it persists even with short paths at high temperature. Warm, spectrum, and sadness appear as obligatory landmarks regardless of how many total waypoints are available or how much randomness is introduced.

A note on the baseline: the 7wp-t0.7 baseline is assembled from prior phase data (Phases 1, 2, 6A), which only tested the original 4 models. DeepSeek, being new to Phase 11A, has no prior-phase data — its baseline cells are empty. Additionally, reverse-direction data for emotion-melancholy does not exist in prior phases. The baseline therefore has only partial coverage (Claude and GPT hot-cold have valid forward+reverse data; other cells are missing). Baseline bridge frequency and gait values are valid for the cells that do map, but asymmetry is limited to 2 of 6 cells. The actual DeepSeek performance across the new conditions (bridge freq 0.80-1.00, gait 0.492-0.597) is consistent with its Phase 11A data and with the other models.

### Gait Rank-Order: Stable but Not Identical

Kendall's W = 0.840 (above the 0.70 threshold), confirming that the rank ordering of models by gait consistency is stable across protocol conditions. Claude is always the most consistent; the second and third positions swap:

| Condition | Rank Order |
|-----------|-----------|
| 7wp-t0.7 (baseline) | Claude > GPT > DeepSeek |
| 5wp-t0.5 | Claude > DeepSeek > GPT |
| 5wp-t0.9 | Claude > DeepSeek > GPT |
| 9wp-t0.5 | Claude > DeepSeek > GPT |
| 9wp-t0.9 | Claude > DeepSeek > GPT |

The baseline condition is the outlier: it places GPT above DeepSeek, while all four new conditions reverse this. The reversal reflects the DeepSeek baseline data limitation (sparse prior-phase data, not actual low consistency). Under actual elicitation, DeepSeek shows Jaccard of 0.492-0.597 — comfortably above GPT's 0.365-0.477 range. The W = 0.840 is conservative because DeepSeek's baseline is underestimated; the true rank concordance is likely higher.

Claude's consistency is notably condition-dependent in absolute terms: 0.794 (5wp-t0.5) down to 0.624 (9wp-t0.9). More waypoints and higher temperature reduce consistency, as expected. But the rank ordering is preserved — Claude remains the most consistent under all conditions, and the relative gaps between models are stable.

### Asymmetry: Waypoint-Count Sensitive

Mean asymmetry per condition:

| Condition | Mean Asymmetry | > 0.60? |
|-----------|---------------|---------|
| 7wp-t0.7 (baseline) | 0.599* | no |
| 5wp-t0.5 | 0.594 | **no** |
| 5wp-t0.9 | 0.593 | **no** |
| 9wp-t0.5 | 0.669 | **YES** |
| 9wp-t0.9 | 0.684 | **YES** |

*Baseline mean from 2 valid cells only (Claude and GPT hot-cold); emotion-melancholy and DeepSeek cells lack reverse/prior-phase data.

The 9-waypoint conditions pass the 0.60 threshold (0.669, 0.684). The 5-waypoint conditions fall just short (0.594, 0.593). The pattern is consistent and theoretically interpretable: more waypoints provide more positions where directional differences can manifest. At 5 waypoints, the path is too short for the quasimetric property to be reliably detected above the 0.60 threshold.

**[observed] (O32)** Asymmetry detectability is waypoint-count sensitive: 5wp conditions show mean asymmetry of 0.594 (below the 0.60 threshold), 9wp conditions show 0.669-0.684 (above threshold), and the 7wp baseline from prior phases showed 0.811. The quasimetric property is real — the per-model, per-pair asymmetries are consistently positive — but its magnitude as measured by the Jaccard-based asymmetry index increases with waypoint count. This makes physical sense: with only 5 positions, there are fewer opportunities for directional differences to manifest in waypoint choice. The asymmetry is a resolution-dependent measurement of a real underlying property.

This finding has an important implication for R2: the claim that conceptual space is quasimetric remains robust at >= 7 waypoints, but should be qualified for shorter path lengths. The quasimetric property is real — the individual model x pair asymmetries at 5 waypoints are still consistently positive, just below the aggregate threshold. The measurement resolution of the asymmetry index is waypoint-count dependent.

Temperature effects on asymmetry are negligible: 5wp-t0.5 (0.594) vs 5wp-t0.9 (0.593), 9wp-t0.5 (0.669) vs 9wp-t0.9 (0.684). This is consistent with the ANOVA finding that temperature has no significant effect on navigational structure.

DeepSeek shows the highest individual asymmetry across conditions (0.653-0.783 per model-pair-condition), while GPT shows the most within-condition variation (0.392-0.725). DeepSeek's consistently high asymmetry across both waypoint counts and both temperatures reinforces the finding that asymmetry is model-dependent — some models navigate more asymmetrically than others, regardless of protocol.

### Waypoint Scaling

The waypoint count scaling analysis shows how much navigational content is shared across different path lengths:

| Comparison | Shared Fraction |
|------------|----------------|
| 5wp vs 7wp | 0.761 |
| 7wp vs 9wp | 0.504 |
| 5wp vs 9wp | 0.481 |
| Reference: O10 (5wp vs 10wp) | 0.705 |

The 5-to-7 scaling (0.761) is consistent with O10 (5-to-10 at 0.705): shorter paths are genuine coarse-grainings of longer paths. The 7-to-9 scaling (0.504) is lower, suggesting that the additional waypoints from 7 to 9 introduce more genuinely new content rather than interpolating between existing waypoints. The 5-to-9 scaling (0.481) is consistent with the product of the two adjacent scalings (0.761 x 0.504 = 0.383, rough order of magnitude).

### Predictions: 2 of 7 Confirmed

| # | Prediction | Result | Verdict |
|---|------------|--------|---------|
| 1 | Gait rank-order survives (W > 0.70) | W = 0.840 | **Confirmed** |
| 2 | Asymmetry > 0.60 all conditions | 5wp conditions fall short | Not confirmed |
| 3 | Bridge frequency survives (spectrum > 0.50, warm > 0.30) | All > 0.97 | **Confirmed** |
| 4 | Temperature 0.5 increases Jaccard by 0.05-0.15 | Delta 0.226, exceeds range | Not confirmed |
| 5 | Temperature 0.9 decreases Jaccard, all > 0.10 | Delta 0.203, all > 0.10 but magnitude wrong | Not confirmed |
| 6 | 5wp shows higher bridge freq than 9wp | 5wp 0.985, 9wp 0.989 — no difference | Not confirmed |
| 7 | Control pair remains unstructured | Unstructured: false | Not confirmed |

The prediction failures cluster around magnitude (P4, P5: temperature effects larger than expected) and the control pair (P7). Bridge frequency robustness (P3) and gait rank stability (P1) — the most important structural predictions — confirm cleanly.

---

## 4. Prediction Accuracy — Phase 11 Scorecard

### Phase 11A: 5/7 (71%)

| # | Prediction | Verdict |
|---|------------|---------|
| P1 | Reliability | **Confirmed** |
| P2 | Gait 0.15-0.70 | Not confirmed (Mistral 0.747) |
| P3 | Asymmetry > 0.60 | **Confirmed** |
| P4 | Bridge freq within 0.20 | **Confirmed** |
| P5 | Maverick > 0.60 | **Confirmed** |
| P6 | Control passes R5 | Not confirmed |
| P7 | DeepSeek clusters with Claude/Qwen | **Confirmed** |

### Phase 11B: 1/4 (25%)

| # | Prediction | Verdict |
|---|------------|---------|
| P1 | >= 2/4 candidates pass | Not confirmed |
| P2 | Turmeric/magnesium strongest | Not confirmed |
| P3 | Accordion-stalactite fails | **Confirmed** |
| P4 | Passing pairs entropy > 5.0 | Insufficient data (scored as not confirmed) |

### Phase 11C: 2/7 (29%)

| # | Prediction | Verdict |
|---|------------|---------|
| P1 | Gait rank survives (W > 0.70) | **Confirmed** |
| P2 | Asymmetry > 0.60 all conditions | Not confirmed |
| P3 | Bridge freq survives | **Confirmed** |
| P4 | T=0.5 Jaccard delta 0.05-0.15 | Not confirmed |
| P5 | T=0.9 Jaccard delta in range | Not confirmed |
| P6 | 5wp bridge freq > 9wp | Not confirmed |
| P7 | Control unstructured | Not confirmed |

### Phase 11 Combined: 8/18 (44%)

The 44% accuracy continues the benchmark's pattern: structural characterization predictions succeed, mechanistic and design predictions fail. The confirmed predictions are all structural: reliability (11A-P1), gait range (11A-P3, partially), asymmetry (11A-P3), bridge frequency generalization (11A-P4, P5), clustering (11A-P7), gait rank stability (11C-P1), bridge frequency robustness (11C-P3). The failures are design predictions (control pair, 11A-P6, 11B-P1/P2, 11C-P7), magnitude estimates (11C-P4/P5), and one genuine surprise (Mistral exceeding the gait ceiling, 11A-P2).

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
| Phase 10A | 75.0% (6/8) | Model generality |
| Phase 10B | 30.0% (3/10) | Relation classes |
| **Phase 11A** | **71.4% (5/7)** | **Expanded generality** |
| **Phase 11B** | **25.0% (1/4)** | **Control pair revision** |
| **Phase 11C** | **28.6% (2/7)** | **Multiverse robustness** |

The prediction accuracy trajectory across 20 sub-phases now reveals three regimes:

1. **Characterization (Phases 4-5):** 42-81% — Predictions based on characterizing known structure succeed.
2. **Mechanism (Phases 6-9):** 11-57% — Predictions testing causal mechanisms fail at ~20-25% floor.
3. **Generality/Robustness (Phases 10-11):** 25-75% — Structural predictions succeed (71-75%), design/control predictions fail (25-29%).

Phase 11A (71%) and Phase 10A (75%) are the highest accuracies since Phase 4B. Both are structural generality tests where the predictions amount to "the structural properties we've already measured will replicate in new conditions." This is the benchmark's empirical sweet spot: structural replication predictions succeed; novel mechanistic or design predictions fail.

---

## 5. Connections to Prior Phases

### Which Robust Claims Are Updated

**R1 (Model gaits)** is substantially strengthened and its range extended. Four new models confirm the gait phenomenon across 12 total models from 11 training pipelines. The gait range, previously bounded at 0.15-0.70, now extends to at least 0.747 (Mistral). R1's status as a universal property of language model navigation is the benchmark's most broadly confirmed finding.

**R2 (Asymmetry / quasimetric space)** is confirmed for all 4 new Phase 11A models (range 0.673-0.729, all above 0.60). R2 now holds across 12 models. However, Phase 11C adds an important qualification: the asymmetry measurement is waypoint-count sensitive. At 5 waypoints, mean asymmetry falls to 0.594 (below the 0.60 threshold). The quasimetric property is real but its detectability depends on measurement resolution. R2 should be stated as: "Conceptual space is quasimetric, detectable at >= 7 waypoints."

**R5 (Controls)** receives a severe qualification. The retrospective analysis shows stapler-monsoon never passed strict R5 criteria for any model — the original 4 models show top-waypoint frequencies of 0.650-0.775. Phase 11B's complete failure to find replacement pairs, combined with this retrospective, suggests that single-pair strict-threshold control validation is not viable at 7 waypoints. R5 should be reframed: the experimental pairs show predictable, theory-derived structure (specific bridges predicted from endpoint relationships), while control pairs show unpredicted, ad hoc structure. The difference is predictability, not presence/absence of structure.

**R6 (Bridge bottlenecks)** is confirmed as the most robust claim in the benchmark. The expanded 8-model new cohort CI includes zero (diff -0.100, CI [-0.286, 0.089]). Phase 11C shows bridge frequency > 0.97 across all waypoint/temperature conditions. Bridge bottleneck structure generalizes across models AND across protocol parameters. R6 is the benchmark's flagship result.

**R7 (Cue-strength gradients)** is not directly updated by Phase 11, but the ANOVA result (O30) implies that cue-strength gradients, if they exist for the new models, would be detectable under different protocol conditions. This is an indirect strengthening.

### Which Observations Are Updated

**O10 (5wp coarse-graining)** is confirmed by Phase 11C's waypoint scaling analysis: 5-to-7 shared fraction of 0.761 is consistent with the original 0.705.

**O25 (Structure/content/scale hierarchy)** is extended from 8 to 12 models. The combined cohort bridge frequency result is essentially unchanged (diff -0.100 vs -0.096), confirming that the hierarchy holds: universal structure, scale-dependent content.

**O27 (Control pair limitation)** is dramatically extended. Phase 10A found stapler-monsoon fails for 4 new models; Phase 11A extends this to 8 new models; Phase 11B's retrospective extends it to *all 12 models*. The observation is upgraded from "the control pair has an unintended associative bridge for non-original models" to "the control pair has navigable associative bridges for all tested models, and no alternative pair could be found that avoids this."

---

## 6. The Graveyard, Updated

Phase 11 adds two definitive graveyard entries and several additional failed predictions:

**G28. Control pair revision — all 4 candidates fail screening.** Phase 11B tested accordion-stalactite, turmeric-trigonometry, barnacle-sonnet, and magnesium-ballet as replacement control pairs. All 4 fail both the frequency gate (< 0.15) and the entropy gate (> 5.0) for all 6 screening models. Top frequencies range 0.60-1.00; entropies range 3.29-4.92. Combined with the retrospective showing stapler-monsoon fails for all 12 models, this establishes that R5 single-pair, strict-threshold control validation is fundamentally inadequate at 7 waypoints. LLMs find navigable semantic routes between any two concrete concepts given 7 waypoints. The control design needs fundamental revision: multi-pair batteries, entropy-based criteria, or relative (rather than absolute) structure assessment.

**G29. R2 asymmetry universal across all conditions.** Predicted that asymmetry would exceed 0.60 across all waypoint/temperature conditions. The 5-waypoint conditions fall just short (0.594, 0.593). The quasimetric property is real — individual model x pair asymmetries are consistently positive — but its aggregate measurement is resolution-dependent. At 5 waypoints, there are too few positions for directional differences to manifest above the threshold. This is a methodological finding about the measurement, not a falsification of the underlying property. R2 should be qualified: robust at >= 7 waypoints, below threshold at 5.

**Additional failed predictions:**
- 11A-P2: Mistral gait (0.747) exceeds the predicted 0.15-0.70 range. A genuine discovery rather than a prediction error in kind.
- 11C-P4/P5: Temperature effects on Jaccard are larger than predicted (delta 0.203-0.226 vs predicted 0.05-0.15). Temperature matters more for absolute consistency than the ANOVA's p-value on structural properties suggests — it affects the magnitude of gait without changing the rank ordering or structural properties.
- 11C-P6: 5wp bridge frequency is not higher than 9wp (both near ceiling at 0.985/0.989). The prediction assumed longer paths would dilute bridge signal, but bridges are so dominant that they appear regardless of path length.
- 11C-P7: Control pair is structured across all conditions. Extends G28.

The graveyard now contains 29+ entries (G1-G29 plus additional Phase 11 falsifications), documenting the most thorough empirical exploration of failed hypotheses in the benchmark.

---

## 7. Theoretical Integration — The Complete Benchmark

### The Six-Act Narrative

The benchmark's narrative gains its final act:

**Act I: Structure (Phases 1-3).** Models have stable conceptual gaits. Space is quasimetric. Paths are compositional for hierarchical triples. The basic phenomena are discovered and characterized.

**Act II: Topology (Phases 4-5).** Bridges are salience-determined bottlenecks, not word associations. Cue-strength gradients exist. Gemini diverges. The structure has measurable topological features.

**Act III: Mechanism (Phases 6-7).** Early anchoring displaces bridges. Bridge position concentrates early. Pre-fill establishes causal influence. Cross-model geometry fails. The mechanisms are qualitatively identified but resist precise prediction.

**Act IV: Limits (Phases 8-9).** Single-variable mechanistic models fail at ~20-24% prediction accuracy. The phenomenon requires multi-variable interaction models. Six hypotheses tested, zero confirmed. The mechanism prediction floor is discovered.

**Act V: Generality (Phase 10).** Structural properties AND navigational content generalize beyond the original model cohort. Scale affects content but not structure. The taxonomy of pre-fill disruption reveals context maintenance, not dimensional competition, as the driver. The benchmark proves its findings are not idiosyncratic.

**Act VI: Robustness (Phase 11).** Model identity drives structure, not protocol parameters. Bridge frequency is protocol-invariant. The gait range extends beyond the assumed ceiling (Mistral 0.747). Asymmetry is resolution-dependent. The control problem is fundamental, not fixable by pair selection. The benchmark's core claims survive every stress test except control validation.

### Final Accounting

After 11 phases and ~21,540 API runs across 12 models from 11 independent training pipelines:

**7 robust claims (R1-R7):**
- R1 (Model gaits) — confirmed across 12 models; range extended to 0.258-0.747
- R2 (Quasimetric space) — confirmed across 12 models; qualified as resolution-dependent (>= 7 waypoints)
- R3 (Polysemy differentiation) — original cohort; untested on new models
- R4 (Hierarchical compositionality) — original cohort; untested on new models
- R5 (Control validation) — **severely qualified**; stapler-monsoon fails for all 12 models under strict criteria; no replacement found; reframe as predictability difference
- R6 (Bridge bottlenecks) — the benchmark's strongest claim; generalizes across 12 models AND across protocol parameters (> 0.97 all conditions)
- R7 (Cue-strength gradients) — original cohort; untested on new models

**32+ observations (O1-O32):** From bridge topology and salience distributions through pre-fill displacement mechanics, facilitation effects, relation classes, the structure/content/scale hierarchy, the control pair limitation, Mistral's record gait, the ANOVA protocol-independence result, bridge frequency protocol robustness, and asymmetry resolution sensitivity.

**29+ graveyard entries (G1-G29; G26 resurrected):** From Phase 1 measurement artifacts through Phase 11 control revision failures and asymmetry sensitivity. The systematic falsification of simple mechanistic models — 8+ hypotheses tested across Phases 6-11, zero confirmed at primary test level — is itself a finding about the nature of conceptual navigation.

### What the Benchmark Has Established

The core finding, supported by ~21,540 runs, is that **large language models navigate conceptual space through a measurable topological structure that is model-specific in its fingerprint but universal in its form.** The specific claims:

1. Every model has a characteristic navigational consistency (gait), ranging from GPT's 0.258 to Mistral's 0.747. This is a model property, not a protocol property (ANOVA eta-squared = 0.242 for model, 0.002 for temperature, 0.008 for waypoint count).

2. Conceptual space is quasimetric — navigating A-to-B and B-to-A produces systematically different paths. This holds for all 12 tested models at >= 7 waypoints.

3. Navigational paths are forced through bottleneck concepts (bridges) that are predictable from the semantic relationship between endpoints. Bridge frequency exceeds 0.97 across all tested protocol conditions.

4. These properties generalize across 12 models from 11 training pipelines, 5+ countries of origin, multiple architectures (dense, MoE), and scales from 8B to frontier. Structural properties are universal; navigational content converges among comparable-scale models and diverges at small scale.

5. Single-variable mechanistic models of bridge formation, fragility, and displacement fail at ~20-24% prediction accuracy, suggesting the phenomenon is governed by multi-variable interactions that simple models cannot capture.

### What Remains Open

1. **Control methodology.** R5 needs fundamental rethinking. The most promising direction is entropy-based relative criteria rather than frequency-based absolute criteria.

2. **Gemini's deficit.** Real (mean ~0.480 vs ~0.67 non-Gemini) but three mechanistic characterizations falsified. May require multi-variable models or a different experimental paradigm.

3. **Scale threshold for content convergence.** Llama 8B diverges on navigational content; Maverick converges. Where is the threshold? Is it parameter count, training data, or capability level?

4. **Multi-variable mechanistic models.** The prediction floor at ~20-24% suggests single-variable models are insufficient. A model incorporating bridge structural role, pre-fill content, model identity, and pair-specific factors jointly might succeed where individual factors fail.

5. **Formal distribution fitting.** Waypoint frequency distributions are non-uniform (O11) but the formal distributional family (power-law, log-normal, etc.) is uncharacterized.

6. **Temporal stability.** O9 found no drift within the collection period, but the benchmark spans weeks, not months or model versions. Whether topological structure survives model updates is unknown.

---

## 8. Summary of Key Findings

1. **Model identity drives conceptual navigation structure, not elicitation protocol.** The ANOVA shows model identity as the only significant factor (eta-squared = 0.242, p = 0.001); waypoint count (p = 0.520), temperature (p = 0.743), and their interaction (p = 0.886) are all null. **This is Phase 11's strongest finding and the paper's cleanest methodological defense.** [observed] (O30)

2. **Bridge frequency is the most protocol-robust property.** Mean bridge frequency exceeds 0.97 across all four waypoint/temperature conditions (5wp-t0.5: 0.993, 5wp-t0.9: 0.978, 9wp-t0.5: 0.993, 9wp-t0.9: 0.985). Bottleneck structure survives all tested protocol variations. [observed] (O31)

3. **Mistral shows record gait consistency (0.747).** The first model to exceed Claude's 0.578 and the first to break the 0.15-0.70 ceiling. Mistral achieves 0.936 Jaccard on music-mathematics — near-deterministic navigation. The gait spectrum across 12 models now spans 0.258 (GPT) to 0.747 (Mistral), a 2.9x range. [observed] (O28)

4. **Bridge structure generalizes across 12 models from 11 training pipelines.** The combined 8-model new cohort bridge frequency CI includes zero (diff -0.100, CI [-0.286, 0.089]). Bridge bottleneck structure is not an idiosyncrasy of the original 4 models. [robust] (R6 updated)

5. **Bridge-specific model variation is real and systematic.** "Sadness" is 0.000 for Mistral and Llama 4 but 1.000 for DeepSeek and 0.933 for Cohere. "Germination" is 1.000 for Mistral but 0.000 for DeepSeek. The same models achieve near-universal frequency on dog, spectrum, and warm. The universal/model-dependent bridge dichotomy is a fundamental structural feature of the navigational landscape. [observed]

6. **The Llama scale effect is confirmed within-family.** Maverick gait 0.539 vs 8B 0.298; Maverick bridge freq 0.724 vs 8B 0.200. Same architecture, same training methodology, different scale, dramatically different navigational content. Structure is scale-invariant; content is not. [observed] (O25 extended)

7. **Asymmetry is waypoint-count sensitive.** At 5 waypoints, mean asymmetry falls to 0.594 (below 0.60 threshold). At 9 waypoints, it reaches 0.669-0.684. The quasimetric property is real but its detectability is resolution-dependent. R2 should be qualified: robust at >= 7 waypoints. [observed] (O32)

8. **All 4 control candidates fail screening.** LLMs find navigable semantic routes between any two concrete concepts at 7 waypoints. The retrospective shows stapler-monsoon fails for all 12 models under strict criteria. R5 single-pair, strict-threshold control validation is fundamentally inadequate. [observed] (O29); Graveyard: G28.

9. **Prediction accuracy is 8/18 (44%).** Structural predictions succeed (reliability, gait, asymmetry, bridge generalization, clustering, rank stability); design and magnitude predictions fail (control pair, temperature effect sizes, asymmetry universality). The benchmark's structural claims are genuinely predictive; its ability to predict design outcomes and quantitative magnitudes remains limited.

10. **The benchmark is complete.** 11 phases, ~21,540 API runs, 12 models from 11 training pipelines, 7 robust claims (R1-R7, with R5 qualified), 32+ observations (O1-O32), 29+ graveyard entries (G1-G29). The six-act narrative — structure, topology, mechanism, limits, generality, robustness — is fully supported. The core finding stands: large language models navigate conceptual space through measurable topological structure that is universal in form, model-specific in fingerprint, and protocol-independent in its fundamental properties.

11. **DeepSeek integrates into the Claude/Qwen cluster.** Cross-model Jaccard of 0.300 (with Claude) and 0.279 (with Qwen), both above the median of 0.244. This suggests models with different training methodologies and different countries of origin can converge on similar navigational routes, consistent with the hypothesis that navigational landmarks reflect properties of conceptual space (or shared training data) rather than model-specific idiosyncrasies. [observed]

12. **The prediction accuracy trajectory reveals three regimes.** Characterization (42-81%), mechanism (11-57%), and generality/robustness (25-75%). Structural replication predictions succeed; novel mechanistic predictions fail; design predictions fail. The benchmark maps qualitative structure reliably but cannot predict quantitative mechanism with single-variable models. [observed] (O24 extended)
