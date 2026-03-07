# 8. Act V — Generality: Structure Scales Across Architectures

The structural findings in Sections 4–6 were established on four models from four providers. A natural concern is that the properties might reflect idiosyncrasies of those specific models rather than general features of language model navigation. Phases 10A and 11A addressed this by testing 8 additional models from 7 independent training pipelines, bringing the total to 12 models from 11 independent training pipelines. The central result is that both navigational structure and navigational content generalize across architectures — with one scale-dependent exception in content generalization, alongside separate measurement caveats discussed in Sections 5 and 9.

## 8.1 Replication Across 12 Models

Phase 10A tested 5 models (Qwen 3.5 397B-A17B, MiniMax M2.5, Kimi K2.5, GLM 5, Llama 3.1 8B Instruct) across the same 12 concept pairs used in earlier phases. Four passed the reliability gate; GLM 5 was blocked by upstream rate limiting and excluded. Phase 11A tested 4 additional models (DeepSeek V3.2, Mistral Large 3, Cohere Command A, Llama 4 Maverick), all of which passed reliability.

**Methodological note.** The initial Phase 10A run used 60-second timeouts and blocked 4 of 5 models on OpenRouter latency, not model capability — all four parsed correctly with 100% connectivity. After relaxing timeouts to 300 seconds via a `--patient` CLI flag and re-running overnight, 4 of 5 models passed. This infrastructure episode is instructive: aggressive timeout thresholds can masquerade as model failures, and a consequential methodological change for the benchmark's generality results was a timeout relaxation, not a prompt revision.

**R1 (gait) replicates universally.** All 12 models show characteristic conceptual gaits — stable, model-specific consistency levels measured by intra-model Jaccard similarity. The full spectrum:

| Model | Gait (Mean Jaccard) | Cohort |
|-------|--------------------:|--------|
| Mistral Large 3 | 0.747 | Phase 11A |
| Claude Sonnet 4.6 | 0.578 | Original |
| DeepSeek V3.2 | 0.540 | Phase 11A |
| Llama 4 Maverick | 0.539 | Phase 11A |
| Qwen 3.5 397B-A17B | 0.508 | Phase 10A |
| Cohere Command A | 0.502 | Phase 11A |
| MiniMax M2.5 | 0.419 | Phase 10A |
| Kimi K2.5 | 0.414 | Phase 10A |
| Gemini 3 Flash | 0.372 | Original |
| Llama 3.1 8B Instruct | 0.298 | Phase 10A |
| Grok 4.1 Fast | 0.293 | Original |
| GPT-5.2 | 0.258 | Original |

The range spans 2.9× from GPT (0.258) to Mistral (0.747). Gait is not bounded at Claude's level (~0.58); architectural and training differences can produce substantially more rigid navigation. The property is universal — every model tested has a measurable, characteristic gait — but the specific value is model-specific.

**R2 (asymmetry) replicates universally.** All 12 models exceed the 0.60 directional asymmetry threshold: Phase 10A models ranged from 0.638 (MiniMax) to 0.785 (Llama 8B); Phase 11A models from 0.673 (Llama 4 Maverick) to 0.729 (Mistral). The quasimetric property — that forward and reverse paths share few waypoints — is universal across models from 11 independent training pipelines. The resolution-dependence caveat from Section 5.1 (asymmetry falls below threshold at 5 waypoints in the Phase 11C robustness subset) applies to the measurement, not the phenomenon.

<!-- See writeup/figures/fig12-gait-asymmetry.pdf -->

## 8.2 The Structure/Content/Scale Hierarchy

The most informative result from the generality phases is not that structure replicates — that was expected — but that navigational *content* (which specific bridge concepts models use) also mostly generalizes. The hierarchy:

**Structure generalizes across tested models under the primary elicitation protocol.** Gait and asymmetry are universal properties across all 12 models from 11 independent training pipelines. No model fails either property, though asymmetry detectability requires sufficient waypoint count (Section 5.1).

**Content mostly generalizes among large models.** Aggregate bridge frequency for the benchmark's pre-specified bridges is statistically indistinguishable between cohorts, with some bridges near-universal and others remaining model-dependent. Phase 10A: new cohort mean 0.721 vs original 0.817, diff −0.096, CI including zero. Phase 11A combined: new cohort 0.717 vs original 0.817, diff −0.100, CI including zero. The strongest bridges — "spectrum" for light→color, "dog" for animal→poodle, "warm" for hot→cold — appear consistently across providers, but others show substantial heterogeneity: "sadness" ranges from 0.000 to 1.000 across models, "harmony" from 0.133 to 0.600, and "leather" from 0.267 to 1.000. The aggregate pattern is convergence; the bridge-level pattern is a mixture of universal and model-dependent landmarks.

**Scale differentiates.** Llama 3.1 8B Instruct is the sole outlier in bridge frequency: mean 0.200, compared to 0.717–0.817 for all frontier-scale models. Phase 11A provides a within-family comparison: Llama 4 Maverick (frontier-scale) shows bridge frequency of 0.724, while Llama 3.1 8B shows 0.200 — a 3.6× difference within the same model family. Both models have navigational structure (gait and asymmetry are present), but the small model navigates through different landmarks. Scale is the clearest observed differentiator in current data, though the threshold and the role of architecture remain open.

<!-- See writeup/figures/fig13-scale-effect.pdf -->

**Connection to Karkada et al. (2025).** Karkada et al. proved that geometric structure in LLM representations arises inevitably from translation symmetry in co-occurrence statistics — structure that all models share because they train on similar data distributions. Our empirical finding of structure/content generality is consistent with this prediction: if geometric structure is determined by data statistics, then navigational structure derived from that geometry should also generalize. The scale effect suggests a minimum capacity threshold for extracting the full navigational structure from shared data statistics.

**Connection to the Platonic Representation Hypothesis.** The Platonic Representation Hypothesis (Huh et al., 2024) predicts that larger models converge toward shared representations, supported by measures like CKA alignment. Our behavioral test partially confirms this: navigational *structure* converges (all models have gait and asymmetry), navigational *landmarks* converge for large models (same bridge concepts), but navigational *gaits* remain model-specific (the 2.9× gait range does not collapse with scale). The models share a map but prefer different routes — partial confirmation of representational convergence, with a clear boundary where convergence stops.

## 8.3 Gait Profiles of New Models

Phase 11A extended the gait spectrum beyond the original four models, revealing that the range is wider than initially characterized.

**Mistral sets the record at 0.747.** Mistral Large 3 showed near-deterministic navigation on several pairs: 0.936 on music→mathematics (producing nearly identical waypoint sets across all repetitions) and 0.934 on hot→cold. This exceeds Claude's 0.578 by a substantial margin and demonstrates that rigid, near-deterministic navigation is an achievable endpoint of the gait spectrum.

**DeepSeek, Cohere, and Llama 4 Maverick cluster at moderate consistency.** DeepSeek V3.2 at 0.540, Llama 4 Maverick at 0.539, and Cohere Command A at 0.502 occupy the middle of the gait spectrum — more consistent than GPT/Grok but less rigid than Claude/Mistral. The Llama within-family comparison is particularly informative: Maverick (0.539) vs 8B (0.298) shows that gait increases with scale within a model family, suggesting that scale may contribute to navigational consistency within the Llama family, though broader causal attribution remains open.

The 12-model gait spectrum reveals that architectural and training differences produce qualitatively different navigation strategies. This is not merely quantitative variation — a model with gait 0.747 (Mistral) generates near-identical paths across runs, while a model with gait 0.258 (GPT) explores broadly across a large waypoint vocabulary. The gait metric captures a genuine behavioral dimension that spans the full range from near-deterministic to broadly exploratory.

---

The generality results establish that the benchmark's structural claims are not artifacts of the original four-model cohort. Gait and asymmetry are universal across 12 models from 11 independent training pipelines. Frontier-scale models share the benchmark's strongest bridges and similar aggregate bridge frequencies, but several bridges remain model-dependent. The scale effect provides a meaningful boundary condition: frontier-scale models converge on the same geometric structure and share the strongest navigational landmarks, while small models retain the structure but navigate through different waypoints. The next section tests whether these findings are also robust to protocol variation.
