# 7. Act IV — Limits: The Mechanism Ceiling

Section 6 established that pre-filling causally displaces bridges and that the mechanism involves associative primacy with secondary content modulation. But Section 6 also exposed limits: bridge survival under perturbation is bimodal and heterogeneous (Section 6.1), the directional-heading theory failed (Section 6.2), and the facilitation crossover regression did not reach significance (Section 6.4). This section follows those limits to their conclusion. Phases 8 and 9 tested six single-variable mechanistic hypotheses, and all six failed at the primary-test level. Phase 10 added one additional falsification (G27, effect direction) and one initially falsified result later resurrected with more data (G26). The mechanism ceiling — the finding that conceptual navigation has qualitative geometric structure that current tools can characterize but cannot yet explain through simple mechanistic models — is itself the central result of these two phases.

## 7.1 The Mechanistic Prediction Collapse

Prediction accuracy across the benchmark follows a distinctive trajectory. The early characterization phases achieved high accuracy: Phase 4 at 81.3% (26/32), Phase 5A at 64.6% (31/48). These predictions asked whether known structural patterns would replicate in new configurations — "will spectrum appear as a bridge for light→color?" — and the answer was usually yes. As the benchmark shifted from characterization to mechanism, accuracy collapsed.

Phase 8 achieved 24% (6/25 evaluable predictions), the lowest in the benchmark's history. Phase 9 achieved 20% (5/25). Combined across 50 evaluable predictions in the two most mechanism-focused phases, accuracy was 22%, with zero novel mechanistic predictions confirmed. The confirmed predictions clustered as replications of established structural facts (known bridges appeared at known frequencies, cross-model distance correlation remained low) and qualitative directional calls (Claude retained the most compact navigational profile, marginal bridges showed facilitation under congruent pre-fill). Every prediction that required a specific variable to explain a specific pattern — competitor count predicts fragility, gradient type predicts Gemini's deficit, gait normalization rescues cross-model distance — failed.

> [FIGURE 11: Prediction Accuracy by Phase] — Line plot showing prediction accuracy across Phases 4–11. Annotate the descent from 81.3% (Phase 4, characterization) to 20–24% (Phases 8–9, mechanism). Include horizontal reference lines for replication (~80%), structural (~50%), and mechanistic (~15%) prediction types.

The decline is not random degradation. It tracks a systematic shift in prediction type. Replication predictions — "will X hold in new data?" — succeed at approximately 80% across all phases. Structural predictions — "will X pattern generalize to new pairs/models?" — succeed at approximately 50%. Mechanistic predictions — "will variable Y explain pattern X?" — succeed at approximately 0–15%. The benchmark maps coarse geometry reliably but cannot predict fine-grained mechanism with single-variable models.

## 7.2 The Falsified Hypotheses

Across Phases 8–10, seven major follow-up predictions were falsified and one early false negative was later resurrected with additional data. These span different types — genuinely mechanistic (predicting which variable explains a pattern), model-deficit characterizations (predicting the mechanism behind Gemini's divergence), methodological (attempting to rescue a measurement approach), structural (testing whether a finding generalizes), and effect-direction (predicting the ordering of a known effect). Presenting them as a uniform class of "failed mechanism predictions" would be misleading; they failed for different reasons and teach different lessons.

> [TABLE 5: Hypothesis Outcomes]

| # | Hypothesis | Phase | Predicted | Observed | Type |
|---|-----------|-------|-----------|----------|------|
| 1 | Route exclusivity predicts fragility (G20) | 8A | rho < −0.70 | rho = 0.116 | Mechanistic |
| 2 | Gemini gradient blindness (G21) | 8B | interaction ≥ 0.20 | 0.046 | Model deficit |
| 3 | Gait normalization rescues distance (G22) | 8C | normalized r > 0.50 | r = 0.212 (0.000 improvement) | Methodological |
| 4 | Dominance ratio predicts fragility (G23) | 9A | rho > 0.50 | rho = 0.157 | Mechanistic |
| 5 | Gemini transformation blindness (G24) | 9B | transformation deficit | transformation *advantage* | Model deficit |
| 6 | Pre-fill crossover regression (G25) | 9C | significant slope | CI includes zero | Mechanistic (partial) |
| 7 | Bridge generalization fails (G26) | 10A | CI excludes zero | **Resurrected** — CI included zero with more data | Structural |
| 8 | Predicted relation class ordering (G27) | 10B | on-axis < unrelated < same-domain | unrelated < on-axis ≈ same-domain | Effect direction |

**Honest accounting.** G26 (bridge bottleneck generalization) was initially falsified based on data from a single model (Llama 3.1 8B) under aggressive 60-second timeouts that excluded 4 of 5 new models on infrastructure latency, not capability. When timeouts were relaxed to 300 seconds and 3 additional models were tested, the bridge frequency CI shifted from excluding zero to including it — the structural finding generalized. This is the benchmark's strongest example of infrastructure limitations masquerading as substantive findings. G26 is retained in the graveyard as a historical record but is functionally resurrected, reducing the clean falsification count to 7.

**The two mechanistic predictors.** G20 (competitor count) and G23 (dominance ratio) represent two successive attempts to explain the bimodal bridge survival pattern from Section 6.1. Both failed: competitor count showed rho = 0.116 (the bridge with the most competitors — "sadness" at 8 — showed the highest survival), and dominance ratio showed rho = 0.157 (warm at ratio 1.00 was destroyed while fermentation at ratio 1.07 was bulletproof). After two attempts, both single-variable structural predictors of bridge fragility are falsified. The strongest surviving lesson is that survival depends on an interaction between pre-fill content and bridge structural role; content appears more predictive than raw competitor count or dominance ratio, but no single-variable explanation has succeeded (Sections 6.3, 6.4).

**The two Gemini characterizations.** G21 (gradient blindness) and G24 (transformation-chain blindness) represent two successive attempts to characterize Gemini's overall deficit (mean bridge frequency 0.480 vs ~0.67 for non-Gemini models). Both produced results opposite to the predicted direction: G21 found Gemini's zeros concentrated on causal-chain pairs (6/10) rather than gradient pairs (1/10); G24 found Gemini's transformation mean (0.667) exceeded its gradient mean (0.293). The pooled meta-analytic interaction combining Phases 8B and 9B was −0.113 (CI includes zero). See Section 7.5 for the broader implications.

## 7.3 The Pattern: Qualitative Structure, Quantitative Opacity

The prediction-type analysis reveals a characteristic pattern in the data. Conceptual navigation has robust qualitative structure that replicates across models, phases, and experimental designs. Bridges exist, asymmetry is high, hierarchical triples compose, triangle inequality holds at ~91%. These properties are discoverable, confirmable, and consistent with a quasimetric interpretation (though based on two complementary distance operationalizations rather than a single unified metric; see Section 5). But the quantitative mechanisms behind that structure — which specific variable explains bridge fragility, what interaction accounts for Gemini's deficit, how gait differences relate to distance metrics — resist single-variable models with mathematical consistency.

This is not a failure of the benchmark. It is a finding about the phenomenon. Conceptual navigation is governed by interaction effects between bridge type, pair semantics, model architecture, and pre-fill content that no single variable can capture. The mechanism ceiling does not mean the phenomenon is random or unexplainable; it means the explanation is multi-variable, and the benchmark's experimental framework (testing one variable at a time) has reached its resolving power. Future work would need to test joint models — bridge role × pre-fill content × dominance, for instance — but the combinatorial explosion of such designs exceeds the benchmark's current scope.

The mechanism ceiling also provides a calibration for the benchmark's claims. The repeated gap between strong replication performance (~80%) and weak mechanistic prediction performance (~15%) suggests that the benchmark captures real coarse structure while leaving the underlying mechanism unresolved. The robust findings (R1–R7) are genuine structural properties of navigational geometry; the mechanism that produces them is multi-variable and beyond the resolving power of single-factor designs.

## 7.4 Cross-Model Distance Is Fundamentally Model-Dependent

A separate line of failure concerns the navigational distance metric itself. Phase 7B computed pairwise distances (1 minus mean within-direction Jaccard similarity) across 8 concept triangles and 4 models, then tested whether models agree on which concepts are "near" and which are "far."

**Models do not agree.** The cross-model distance correlation was r = 0.170, far below the 0.50 validity threshold. Claude and GPT/Grok occupy very different quantitative regimes — Phase 7B showed Claude's overall mean triangle excess at 0.225 vs GPT's at 0.680, reflecting the gait difference from Section 4.1. The gait difference is not merely a consistency metric — it contaminates all distance-based measurements, placing models on incomparable scales.

**Gait normalization produces zero improvement.** Phase 8C attempted to rescue cross-model geometry by dividing raw Jaccard distances by model-specific baselines. The result was mathematically definitive: normalized r = 0.212, identical to the raw r = 0.212, with 0.000 improvement on every model pair. The gait difference is not a scalar factor that can be divided out; it is a structural reorganization of conceptual space. Some model pairs actively anti-correlate: Grok-Gemini at r = −0.580, GPT-Gemini at r = −0.210. When Grok says winter and summer are far apart (d = 0.925), Gemini says they are close (d = 0.273).

**Implication.** Model-independent navigational geometry cannot be recovered from path-based measurements. The distance metric is model-specific, not a property of the concept pair. This finding blocks the cross-model curvature program proposed in Phase 5 and first attempted in Phase 7B. Within-model distance analysis remains viable in principle — across the three tested samples, the triangle inequality (under within-direction Jaccard distance) holds in about 91% of triangle-model combinations, though compliance is heterogeneous across models (Gemini accounts for most violations; see Section 5.2). Individual gait profiles are interpretable. But cross-model distance comparisons are fundamentally contaminated by gait.

## 7.5 The Gemini Mystery

Gemini's overall deficit in bridge generation is one of the benchmark's most consistent observations. Across the Phases 8–9 pair sets, Gemini's mean bridge frequency was 0.480 compared to approximately 0.67 for non-Gemini models — a roughly 30% reduction. The deficit is real and stable across phases. In Phase 8B specifically, Gemini also produced more zero-frequency pairs (7/20 vs 6/60 for non-Gemini models combined), with zeros concentrated on causal-chain pairs rather than distributed across types. But despite three successive mechanistic characterizations, the deficit remains unexplained.

**Three failed characterizations:**

1. **Frame-crossing threshold (Phase 5A):** Hypothesized that Gemini has a higher cue-strength threshold for activating bridges that cross between conceptual frames. Falsified: Gemini's logistic threshold (1.79) was indistinguishable from other models (CI includes zero).

2. **Gradient blindness (Phase 8B, G21):** Hypothesized that Gemini selectively fails on gradient-midpoint bridges. Falsified with a reversal: Gemini's zeros concentrated on causal-chain pairs (6/10 causal zeros vs 1/10 gradient zeros), the opposite of the prediction.

3. **Transformation-chain blindness (Phase 9B, G24):** Hypothesized that Gemini selectively fails on material/biological transformation intermediaries. Falsified with a reversal: Gemini's transformation mean (0.667) exceeded its gradient mean (0.293), the opposite of the prediction. The pooled interaction across Phases 8B and 9B was −0.113, null.

The pattern across these three attempts is telling. Each hypothesized a type-based deficit: Gemini fails specifically on X-type bridges. Each found that Gemini's performance on the targeted type was either comparable to or better than its performance on the control type. Whatever pair type is designated as "hard" for Gemini, Gemini does relatively better on it. The deficit is model-level — Gemini shows lower bridge frequency across the board — not type-level. A type-based approach to characterizing the deficit may be fundamentally misguided.

The distance-metric anti-correlations from Section 7.4 provide additional context. Gemini's distance structure is not merely different from the other three models; it is inversely related to Grok's (r = −0.580) and weakly inverse to GPT's (r = −0.210). This suggests that Gemini may organize conceptual space with different salience weightings, producing systematically different navigational priorities rather than a deficit on any particular bridge type.

The Gemini mystery remains open. The divergence is documented empirically in Section 4.4 and confirmed across Phases 8–9, but remains mechanistically unexplained. Future work might approach it through representational analysis (comparing Gemini's internal embeddings to other models) rather than the behavioral type-classification approach that has failed three times.

---

The five findings in this section collectively establish a mechanism ceiling for the waypoint elicitation paradigm. Single-variable mechanistic models fail with mathematical consistency (6 of 6 Phases 8–9 hypotheses falsified, plus 1 effect-direction failure in Phase 10; Section 7.2); the failure follows a systematic pattern where qualitative structure replicates but quantitative mechanism does not (Section 7.3); cross-model distance is fundamentally model-dependent (Section 7.4); and model-specific deficits resist type-based characterization (Section 7.5). These limits are not failures of the benchmark — they are findings about the nature of conceptual navigation. The qualitative geometric structure documented in Sections 4–6 is real and replicable; the mechanism that produces it is multi-variable and beyond the resolving power of single-factor experimental designs. The next two sections show that this structure generalizes across architectures (Section 8) and survives protocol variation (Section 9).
