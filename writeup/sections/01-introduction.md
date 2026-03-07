# 1. Introduction

## 1.1 The Navigation Gap

LLM embedding spaces have rich geometric structure. Linear directions encode concepts (Park et al., 2024). Hierarchies form polytopes (Park et al., 2025). Hyperbolic geometry captures tree-like relations (Nickel & Kiela, 2017). Most fundamentally, Karkada et al. (2025) proved that this geometry arises inevitably from translation symmetry in data statistics — the manifold shape is determined by co-occurrence structure, not architectural choices.

The static geometry of LLM representations is increasingly well-characterized, and theoretically grounded. What remains uncharacterized is the *dynamic* behavior on that geometry.

But geometry is not navigation.

A map is not a route.

Static analysis tells us what landmarks look like; it does not tell us whether models can reliably walk between them. Embedding probes reveal that "warm" sits between "hot" and "cold" in representational space, but they do not test whether a model traversing from hot to cold will actually pass through warm — or whether it will take a different route entirely, through "tepid" and "chilly" and "brisk." The distinction matters: two agents can share an identical map and prefer entirely different paths.

The gap is not merely philosophical. Static geometry answers questions about structure — what is near what, which directions encode which features, what the curvature looks like. Navigation answers questions about behavior — which routes models actually take, whether those routes are consistent across repeated traversals, whether they differ by direction, and whether they compose when chained through intermediate concepts. A model might have perfect geometric representations and still navigate erratically, or conversely, navigate with rigid consistency through a geometry that embedding analysis would not predict. The static and dynamic questions are logically independent, and neither entails the other.

This paper asks the dynamic question directly: **Do LLMs have consistent, measurable geometric structure in how they *navigate* between concepts?**

Not what their representations look like, but how they behaviorally traverse conceptual space when asked to produce intermediate waypoints between two endpoints.

The answer, across approximately 21,540 runs, 12 models from 11 independent training pipelines, and 11 experimental phases, is yes — with substantial qualifications about what that structure can and cannot explain. Navigation is structured (gait consistency spanning a 2.9x range across models), asymmetric (mean directional asymmetry 0.811), organized around bottleneck landmarks (bridge frequencies exceeding 0.97 under robustness testing), and consistent with quasimetric topology (triangle inequality holding at approximately 91%). But 7 of 8 follow-up hypotheses were falsified (one later resurrected), and 29 documented dead ends attest to the gap between characterizing structure and explaining it.

**Theoretical complement.** Karkada et al. (2025) proved *why* static geometry exists: translation symmetry in co-occurrence statistics determines manifold shape. We test *whether that geometry supports behavioral navigation* — whether the geometric structure that arises inevitably from data statistics produces consistent, structured, asymmetric paths when models are asked to walk between concepts. Their contribution explains the map; ours probes the routes. The two contributions are complementary: static geometry is necessary for navigation to be structured, but not sufficient — the dynamics could still be noisy, inconsistent, or model-independent. They are none of these.

## 1.2 Why Navigation Matters

Four independent lines of research motivate the navigation question.

**Cognitive science predicts navigable conceptual spaces.** Gardenfors (2000) theorized that concepts live in geometric spaces with measurable distance — spaces that support not just representation but traversal. Constantinescu et al. (2016) provided neural evidence: grid cells in the human entorhinal cortex, originally characterized for spatial navigation, fire during *conceptual* navigation, suggesting that spatial mechanisms have been repurposed for abstract thought. If human conceptual spaces are navigable, the question of whether LLM conceptual spaces share this property is natural and testable.

Our benchmark provides a large-scale computational probe: 12 models, 100+ concept pairs, and over 21,000 runs testing the navigability prediction directly.

**Representational convergence does not imply navigational convergence.** The Platonic Representation Hypothesis (Huh et al., 2024) claims that models trained on similar data converge toward shared representations, supported by measures like CKA alignment. But representational alignment is not navigational alignment. Two agents can agree perfectly on a map — identical embeddings, identical similarity structures — and still prefer different routes.

Our benchmark tests the behavioral complement: do models that share representations also share navigational behavior? The answer requires distinguishing three levels. Navigational *structure* converges — all 12 models exhibit gait consistency, directional asymmetry, and bridge bottleneck topology. Navigational *content* converges among frontier-scale models — the same bridge concepts ("spectrum," "dog," "warm") appear across providers, with aggregate bridge frequency differences whose confidence intervals include zero. But navigational *dynamics* diversify: the 2.9x gait range from GPT (0.258) to Mistral (0.747) does not collapse with scale.

Same map, different routes. The Platonic Representation Hypothesis receives partial confirmation with a clear boundary: structure and content converge, but gaits remain model-specific.

**The reversal curse reveals directional structure.** Berglund et al. (2023) demonstrated that autoregressive models cannot reverse learned associations: training on "A is B" does not teach "B is A." This has been framed as a failure mode. We reframe it as a structural signal.

Tversky (1977) established decades earlier that human similarity judgments are inherently asymmetric — North Korea is judged more similar to China than China is to North Korea. Our benchmark finds pervasive directional asymmetry in LLM navigation (mean 0.811 in the Phase 2 cohort, all 12 tested models exceeding the 0.60 threshold), consistent with quasimetric topology. Forward and reverse paths between the same two concepts share less than 19% of their waypoints on average. The asymmetry is not noise — it tracks semantic properties of the concept pairs and model-specific navigational styles.

The connection across these three findings is thematic: all concern directional asymmetry in conceptual structure. We do not claim that the reversal curse mechanistically causes our observed asymmetry; rather, both phenomena reflect a shared property of directed conceptual spaces in which the path from A to B traverses fundamentally different intermediate territory than the path from B to A.

**Multi-hop reasoning failures call for richer diagnostics.** The compositionality gap (Press et al., 2022) and the two-hop curse (2025) document that models struggle with latent multi-step reasoning. These findings use binary pass/fail evaluation: the model either retrieves the composed fact or it does not.

Our benchmark generalizes the diagnostic. Rather than asking whether a model can compose two facts, we ask what *shape* the composition takes — which intermediate concepts appear, how consistently they appear across repeated runs, whether they compose properly (the triangle inequality holds at approximately 91%), and whether they differ by direction. This produces a geometric characterization of compositional structure rather than a scalar accuracy measure.

The characterization is informative even when the model "fails." Asymmetry and bridge fragility are structured phenomena, not random noise. A model that produces different paths in opposite directions is not failing at composition — it is revealing the directional structure of its conceptual space.

## 1.3 Contributions

This paper makes six contributions, spanning paradigm design, empirical findings, and methodological transparency:

1. **A novel evaluation paradigm** — waypoint elicitation as behavioral probe for conceptual geometry, distinct from static embedding analysis, factual QA, and free association. The paradigm is self-grounding: model outputs generate their own ground truth, enabling scalable evaluation without human annotation. This introduces a circularity concern addressed through external mathematical tests (metric axioms), cross-model validation (12 independent models), and causal intervention (pre-fill experiments).

2. **Six robust empirical claims** about navigational structure, replicated across multiple phases and models, plus one qualified claim (R5, control validation) that reveals a fundamental paradigm limitation (Section 9.5):
   - Models have characteristic conceptual gaits spanning a 2.9x range [robust] R1.
   - Navigation is consistent with quasimetric structure: systematically asymmetric (mean 0.811) with the triangle inequality holding at approximately 91% [robust] R2.
   - Polysemy sense differentiation is genuine, with cross-pair Jaccard of 0.011-0.062 for different senses [robust] R3.
   - Hierarchical paths are compositional with 4.9x higher transitivity than random controls [robust] R4.
   - Control validation supports the paradigm, though stapler-monsoon fails strict criteria for all 12 models [robust, qualified] R5.
   - Bridge concepts function as structural bottlenecks with frequencies exceeding 0.97 under robustness testing [robust] R6.
   - Cue-strength gradient exists: 12/16 family-model combinations show monotonic decrease [robust] R7.
   - R3, R4, and R7 are untested beyond the original 4-model cohort.

3. **A mechanism ceiling result** — 7 follow-up hypotheses fail across Phases 8--10 — spanning mechanistic, model-deficit, methodological, and effect-direction types — with one additional hypothesis initially falsified then resurrected with more data, establishing that conceptual navigation resists simple explanations (Section 7). Prediction accuracy descended from 81.3% for characterization questions to 20--24% for mechanistic ones — tracking a systematic shift in prediction type, not random degradation.

4. **Cross-architecture generality** — navigational structure and content generalize across 12 models from 11 independent training pipelines; scale differentiates (Section 8). Llama 3.1 8B retains gait and asymmetry but navigates through different landmarks (bridge frequency 0.200 vs 0.717--0.817 for frontier models). The within-family Llama comparison (Maverick 0.724 vs 8B 0.200) provides the sharpest evidence.

5. **Protocol robustness** — bridge frequency insensitive to waypoint count and temperature (exceeding 0.97 across all conditions); gait rankings largely stable (W = 0.840); model identity dominates protocol variation (eta-squared = 0.242 vs approximately 0 for protocol factors) (Section 9). Asymmetry is resolution-dependent — a measurement sensitivity finding that qualifies R2 without undermining it.

6. **29 documented dead ends** as honest accounting of the benchmark's learning curve. Failed predictions — "metaphor" at frequency 0.00 for language-to-thought, gait normalization producing 0.000 improvement, three successive Gemini deficit characterizations all falsified — contain more methodological information than several of the successful findings. The graveyard is a methodological contribution, not a failure record.

> [TABLE 0: Headline Claims at a Glance] — Claim, evidence tier ([robust]/[observed]/[qualified]), models and phases supporting, core statistic, key qualification. One row per major claim (R1-R7 + O15, O25, O30).

> [FIGURE 0: "Same Map, Different Routes"] — For 2-3 canonical pairs (e.g., music-mathematics, love-death), show the full waypoint trajectories for all 12 models side by side. Same endpoints, divergent paths. Central visual claim.

> [FIGURE 1: Overview] — Schematic of the benchmark paradigm. Left: waypoint elicitation prompt. Center: example paths from 4 models for music-mathematics. Right: derived metrics (gait, asymmetry, bridge frequency, triangle inequality).

## 1.4 Paper Structure

The paper follows a six-act narrative structure, tracing the benchmark from initial characterization through mechanism and generality to robustness.

**Section 2: The Benchmark.** Defines the waypoint elicitation paradigm, derived metrics (gait consistency, path asymmetry, bridge frequency, navigational distance, triangle inequality), concept pair selection across 9 categories, the 12-model cohort accessed via OpenRouter, and the evidential strategy including self-grounding circularity mitigations.

**Section 3: Related Work.** Positions the benchmark against existing work on LLM geometry, conceptual spaces, compositionality, and evaluation methodology.

**Section 4: Act I -- Structure.** Establishes that models have distinct, stable conceptual gaits spanning a 2.9x range; paths are self-consistent across time (no temporal drift) and resolution (5-waypoint paths appear as subsequences of 10-waypoint paths 67.9% of the time); both endpoints shape the trajectory via a dual-anchor effect; and polysemy sense differentiation (cross-pair Jaccard near zero for "bank," "bat," "crane") confirms that paths reflect conceptual structure rather than surface word statistics.

**Section 5: Act II -- Topology.** Characterizes navigational geometry as consistent with quasimetric structure: systematically asymmetric (mean 0.811), with the triangle inequality holding at approximately 91% across three independent samples, compositional hierarchy at 4.9x over random controls, bottleneck bridge topology where navigational salience depends on directional information content rather than associative strength, and non-uniform navigational traffic concentrated at preferred waypoints.

**Section 6: Act III -- Mechanism.** Pre-filling the first waypoint causally displaces bridges (mean displacement 0.515, CI excluding zero), revealing associative primacy as the primary mechanism with secondary content modulation. The relation class of the pre-fill systematically affects bridge survival (Friedman p = 0.034), and the effect is bidirectional — displacement for dominant bridges, facilitation up to 8x for marginal bridges under semantically aligned pre-fills.

**Section 7: Act IV -- Limits.** Seven mechanistic hypotheses fail across three phases; prediction accuracy descends from 81.3% to 20%; cross-model distance is fundamentally model-dependent (r = 0.170, gait normalization produces 0.000 improvement); the Gemini mystery survives three successive characterization attempts; and the mechanism ceiling establishes that navigation resists single-variable explanation.

**Section 8: Act V -- Generality.** Gait and asymmetry replicate universally across 12 models from 11 independent training pipelines. Bridge content generalizes among frontier-scale models but not to Llama 3.1 8B (bridge frequency 0.200 vs 0.717--0.817). The structure/content/scale hierarchy emerges as the organizing framework for cross-architecture comparison.

**Section 9: Act VI -- Robustness.** Model identity dominates protocol variation (eta-squared = 0.242 vs approximately 0 for protocol factors). Bridge frequency is the most robust property, exceeding 0.97 across all tested conditions. Asymmetry is resolution-dependent: 9-waypoint conditions clear the 0.60 threshold; 5-waypoint conditions fall just short. The control pair problem — 0 of 24 replacement cells passing strict criteria — is real and acknowledged directly.

**Section 10: Discussion.** Synthesizes the six-act narrative, states nine limitations directly (six benchmark design, three phenomenon), connects findings to Karkada et al.'s geometric inevitability, Gardenfors's conceptual spaces, the Platonic Representation Hypothesis, and spectral semantic attractors (Wyss et al., 2025), and identifies ten future directions from multi-variable mechanism models to human comparison.

**Section 11: Conclusion.** Distills the central empirical contribution: LLMs navigate conceptual space with structured, asymmetric, model-specific geometry that generalizes across architectures and resists mechanistic decomposition — structure is detectable before it is explainable.
