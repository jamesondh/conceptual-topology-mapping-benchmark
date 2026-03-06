# Conceptual Topology Mapping: A Benchmark for Navigational Geometry in Large Language Models

## Paper Outline

---

## Abstract

~250 words. Frame the contribution in three beats:

1. **Gap:** Static geometric structure in LLM representations is well-characterized (linear representation hypothesis, hyperbolic embeddings, polytope structure). But no work tests whether models can *navigate* these spaces consistently — whether the geometry supports reliable behavioral traversal.

2. **Contribution:** We introduce the Conceptual Topology Mapping Benchmark, a waypoint-elicitation paradigm that probes navigational geometry across ~21,540 API runs, 12 models from 11 independent training pipelines, and 11 experimental phases. Models are given concept pairs (A, B) and asked for intermediate waypoints; the resulting paths are tested against metric axioms, compositional structure, and causal perturbation.

3. **Findings:** Models exhibit distinct "conceptual gaits" (consistency ranging 0.258-0.747 across 12 models), navigation is fundamentally asymmetric (mean 0.811, consistent with quasimetric structure), bridge concepts are structural bottlenecks (not mere associations), and these properties generalize across architectures while resisting protocol variation. Single-variable mechanistic explanations universally fail (8/8 hypotheses falsified), revealing a mechanism ceiling: conceptual navigation has qualitative geometric structure that current tools can characterize but cannot yet explain.

**Key statistics for abstract:** 21,540 runs, 12 models, 11 families, 11 phases, 6 robust claims + 1 qualified (R5), 29 graveyard entries, 8/8 mechanistic hypotheses falsified. Note: do NOT lead with "7 robust claims" — immediately note R5 is qualified.

---

## 1. Introduction

**Goal:** Motivate the gap between static geometry and navigational geometry. Establish that this benchmark asks a fundamentally different question from prior work.

### 1.1 The Navigation Gap

- LLM embedding spaces have rich geometric structure: linear directions encode concepts (Park et al., 2024), hierarchies form polytopes (Park et al., 2025), hyperbolic geometry captures tree-like relations (Nickel & Kiela, 2017), and Karkada et al. (2025) proved that this geometry arises inevitably from translation symmetry in data statistics.
- But geometry is not navigation. A map is not a route. Static analysis tells us what the landmarks look like; it does not tell us whether models can reliably walk between them.
- The question: Do LLMs have consistent, measurable geometric structure in how they *navigate* between concepts?
- **The theoretical complement:** Karkada et al. (2025) proved *why* static geometry exists (translation symmetry in co-occurrence statistics determines manifold shape). We test *whether that geometry supports behavioral navigation* — the dynamic complement to their static theory.

### 1.2 Why Navigation Matters

- Cognitive science has long theorized that concepts live in navigable geometric spaces (Gardenfors, 2000). Grid cells in human entorhinal cortex fire during *conceptual* navigation (Constantinescu et al., 2016), suggesting spatial mechanisms are repurposed for abstract thought.
- The Platonic Representation Hypothesis (Huh et al., 2024) claims models are converging toward shared representations. But representational alignment does not imply navigational alignment — two people can agree on a map and prefer different routes.
- The reversal curse (Berglund et al., 2023) established that LLMs cannot reverse learned associations. We reframe this: asymmetry is not a bug but a signal that reveals topological structure, paralleling Tversky's (1977) finding that human similarity judgments are inherently asymmetric.
- Multi-hop reasoning failures (compositionality gap, two-hop curse) show models struggle with latent composition. Our benchmark generalizes this: rather than binary pass/fail on composed facts, we measure the *shape* and *consistency* of intermediate steps.

### 1.3 Contributions

Bulleted list:

1. **A novel evaluation paradigm** — waypoint elicitation as a behavioral probe for conceptual geometry, distinct from static embedding analysis, factual QA, and free association.
2. **Six robust empirical claims** about navigational structure, replicated across multiple phases and models, plus one qualified claim (R5, control validation) that reveals a fundamental limitation of the paradigm (Section 4-5).
3. **A mechanism ceiling result** — 8/8 single-variable mechanistic hypotheses fail across two dedicated phases, establishing that conceptual navigation resists simple explanations (Section 7).
4. **Cross-architecture generality** — navigational structure and content generalize across 12 models from 11 families; scale differentiates (Section 8).
5. **Protocol robustness** — bridge frequency is insensitive to waypoint count and temperature; gait rankings are largely stable; model identity dominates protocol variation (Section 9).
6. **29 documented dead ends** as an honest accounting of the benchmark's learning curve.

### 1.4 Paper Structure

One-sentence summary of each subsequent section, following the six-act narrative: structure, topology, mechanism, limits, generality, robustness.

> **[Table 0: Headline Claims at a Glance]** — Claim, evidence tier ([robust]/[observed]/[qualified]), models and phases supporting, core statistic, key qualification. One row per major claim (R1-R7 + O15, O25, O30). This gives reviewers the full picture on page 2.

> **[Figure 0: "Same Map, Different Routes"]** — For 2-3 canonical pairs (e.g., music-mathematics, love-death), show the full waypoint trajectories for all 12 models side by side. Same endpoints, divergent paths. This is the paper's central visual claim — shared geometry, model-specific navigation. Must be in the introduction.

> **[Figure 1: Overview]** — Schematic of the benchmark paradigm. Left: waypoint elicitation prompt (concept A, concept B, 7 waypoints). Center: example paths from 4 models for music-mathematics. Right: derived metrics (gait consistency, asymmetry, bridge frequency, triangle inequality). This figure anchors the entire paper.

---

## 2. The Benchmark

**Goal:** Define the evaluation paradigm precisely enough for replication. No results yet — pure methodology.

### 2.1 Waypoint Elicitation

- **Task:** Given concept A and concept B, produce 7 intermediate waypoints that form a natural conceptual path from A to B.
- **Prompt design:** System prompt instructs single-word or short-phrase waypoints. Temperature 0.7 (default). 20 independent runs per (model, pair, direction) combination.
- **Self-grounding:** The model's own outputs generate ground truth. No external labels required.
- Comparison to prior paradigms: word analogy (single-step, Mikolov et al. 2013), free association norms (LLM World of Words, 2024-2025), convergence games (Word Synchronization Challenge, 2025). Our paradigm is multi-step, directional, and produces full path structure.
- **Why this is not free association:** Free association produces local, undirected chains (word A → associate → associate → ...). Waypoint elicitation is endpoint-conditioned: the model must produce a path from A *to B*, maintaining awareness of the destination throughout. This is navigation (goal-directed traversal), not association (local spreading activation).

### 2.2 Derived Metrics

Define each metric formally:

- **Gait consistency (Jaccard similarity):** For a given (model, pair, direction), compute pairwise Jaccard similarity across 20 runs. Higher = more deterministic navigation.
- **Path asymmetry:** Compare A-to-B waypoint set vs B-to-A waypoint set via Jaccard. Low Jaccard = high asymmetry.
- **Bridge frequency:** For a triple (A, B, C), what fraction of A-to-C paths include bridge concept B as a waypoint?
- **Triangle inequality:** For a triple (A, B, C), does d(A,C) <= d(A,B) + d(B,C) using waypoint-based navigational distance?
- **Transitivity:** Fraction of waypoints on the A-to-C path that also appear on A-to-B or B-to-C paths.
- **Positional profile:** Distribution of bridge concept position across the 7-waypoint sequence.
- **Pre-fill displacement:** Change in bridge frequency when waypoint 1 is pre-filled with an alternative concept.

> **[Table 1: Metric Definitions]** — Formal definitions, ranges, and interpretation for each metric.

### 2.3 Concept Pair Selection

- **Categories:** Antonyms, hierarchical (animal-dog-poodle), polysemous (bank), near-synonyms, abstract-abstract, concrete-concrete, cross-domain, control-random, control-nonsense.
- **Bridge concept types:** Bottleneck (only connection), gradient midpoint (position on a spectrum), causal-chain intermediate (process step), too-central (informationally redundant).
- **Scale:** 21 initial pairs (Phase 1), expanding to 100+ unique pairs across 11 phases.

### 2.4 Model Selection

- **12 models from 11 independent training pipelines:**
  - Core cohort (Phases 1-9): Claude Sonnet 4.6, GPT-5.2, Grok 4.1 Fast, Gemini 3 Flash
  - Expanded cohort (Phase 10): Qwen, MiniMax, Kimi, Llama 3.1 8B
  - Final expansion (Phase 11): DeepSeek, Mistral, Cohere, Llama 4 Maverick
- **Diversity:** Ranges from 8B (Llama 3.1) to frontier-scale models, spanning 11 distinct training pipelines.
- All accessed via OpenRouter API for uniform interface.

> **[Table 2: Model Summary]** — Model name, provider, approximate scale, total runs, phases included.

### 2.5 Experimental Phases

Brief overview of the 11-phase structure as an exploration-first workflow. Each phase followed the most interesting signal from the previous one.

> **[Table 3: Phase Summary]** — Phase number, name, new runs, key question, primary finding. 11 rows.

### 2.6 Validity and Evidential Strategy

**What this benchmark is NOT measuring:** Not human conceptual geometry directly (no human participants). Not latent model geometry directly (we test behavior, not embeddings). Not factual correctness (no ground truth answers). Not free association (waypoints are endpoint-conditioned, not open-ended).

**Why waypoint elicitation measures navigation rather than mere association:** Free association produces local, undirected chains. Waypoint elicitation is *constrained*: it requires producing a path conditioned on both endpoints simultaneously. The endpoint-conditioning is what turns association into navigation — the model must maintain awareness of both source and destination, producing intermediate steps that form a directed traversal. Evidence: (a) paths between different endpoints sharing an intermediate concept diverge after that concept (dual-anchor effect, O2), (b) nonsense controls produce low consistency while meaningful pairs produce high consistency (R5 qualification notwithstanding), (c) bridge concepts are structural bottlenecks (R6), not high-frequency associates.

**Self-grounding and the validity strategy:** Model outputs generate their own ground truth. This is a feature (no annotation required, scalable) and a limitation (circular). We mitigate circularity three ways: (1) testing against external mathematical properties (metric axioms have definitions independent of any model), (2) cross-model comparison (12 independent models as mutual validation), (3) causal intervention (pre-fill experiments demonstrate structural sensitivity, not just statistical regularity). The benchmark's evidential standard is relative, not absolute: we measure the *magnitude gap* between experimental and control conditions, not whether controls achieve a fixed threshold. This is explicitly acknowledged as the primary limitation (Section 9.5).

**Additional paradigm limitations:**
- Prompt sensitivity: addressed by Phase 11C multiverse robustness analysis.
- API-mediated access: cannot control internal model state, temperature is approximate, potential for silent model updates.

---

## 3. Related Work

**Goal:** Position the benchmark against six distinct literatures. Use the "Relation to Benchmark" framing from research.md throughout.

### 3.1 Static Geometry of LLM Representations

- Linear representation hypothesis (Park et al., 2024, 2025): concepts as linear directions and polytopes.
- Hyperbolic structure (Nickel & Kiela, 2017; HELM, 2025): tree-like hierarchies in embedding spaces.
- Delta-hyperbolicity and ultrametricity (2025): direct measurement of tree-likeness.
- Topological data analysis (Explainable Mapper, 2025; Persistent Topological Features, 2025): circular manifolds for temporal concepts, linear manifolds for ordered quantities.
- Spectral semantic attractors (Wyss et al., 2025): mathematical proof that LLM activation manifolds partition into discrete basins of attraction — the formal analog of our empirically observed "deep basins" from the word convergence game.
- Intrinsic dimensionality profiles (Joshi et al., NeurIPS 2025): universal early-expand-late-compress pattern.
- **Gap we fill:** All of this is *static* — what shape the space has. We probe whether models can *navigate* it consistently.

### 3.2 Theoretical Origin of Geometric Structure

- **Karkada et al. (2025):** Translation symmetry in word co-occurrence statistics mathematically determines manifold geometry. Universal across architectures (Word2Vec, GloVe, Gemma). Geometry comes from data, not architecture.
- **Connection:** Their theory predicts our empirical finding that geometric structure generalizes across models (R1, R2 universal). They study static manifold shape; we test dynamic navigation on those manifolds. Theoretical complement to our empirical work.

### 3.3 Conceptual Navigation and Interpolation

- Latent space geodesics (Arvanitidis et al., 2018-2025): Riemannian geodesics as semantically meaningful paths in generative models. Mathematical framework directly applicable but never applied to LLM behavioral outputs.
- Intermediate concept discovery (Relation Embedding Chains, 2023): A-to-B via intermediate X using knowledge graph paths — the closest precedent for waypoints.
- Geometry of Knowledge (2025): traversing semantic manifolds for generative diversity — closest to "conceptual traversal" but used for generation, not evaluation.
- Reasoning as path search (RiemannInfer, 2026; Geometric Reasoner, 2026): trajectory and geodesic metaphors becoming mainstream in reasoning literature.
- **Gap we fill:** To our knowledge, no work asks models to produce intermediate waypoints and tests whether the resulting paths have consistent geometric structure.

### 3.4 Consistency, Directionality, and the Reversal Curse

- Reversal curse (Berglund et al., 2023): LLMs trained on "A is B" fail to learn "B is A." Architectural limitation of autoregressive models.
- Directional optimization asymmetry (2025): inverse mappings incur higher excess loss even under symmetric training. The A-to-B vs B-to-A gap is architectural, not just training-data asymmetry.
- Directional hysteresis in semantic caching (Barakat et al., 2026): input ordering steers trajectories into different basins of attraction.
- Self-consistency failures (2025): high variability even in GPT-4 across repeated evaluations.
- Trajectory variance in agents (2025): substantial action-sequence diversity across runs.
- **Our reframing:** Existing work treats inconsistency and asymmetry as failure modes. We reframe asymmetry as data — the pattern reveals topology. The 0.811 mean asymmetry is a structural constant of navigational space, not a bug.

> **Defensive positioning (address explicitly in this section):** Reviewers will ask why this isn't just "self-consistency / stochastic decoding work with a geometry gloss." Key contrast: self-consistency work measures variance across samples; we test whether the *structure* of that variance satisfies formal geometric axioms (metric properties, compositionality, causal sensitivity). Variance is our data, not our failure mode.

### 3.5 Multi-Hop Reasoning and Compositionality

- Compositionality gap (2022): models answer sub-questions but fail composed questions.
- Two-hop curse (2025): models trained on A-to-B and B-to-C fail A-to-C without chain-of-thought.
- Latent multi-hop reasoning / TWOHOPFACT (ACL 2024): bridge entity as required intermediate step.
- **Our generalization:** We measure the *shape* of the intermediate sequence, not just whether the final answer is correct. Waypoints externalize latent composition.

> **Defensive positioning:** Reviewers will ask why this isn't just "chain-of-thought / intermediate reasoning elicitation." Key contrast: CoT elicits reasoning steps toward a *correct answer*. We elicit navigational waypoints toward a *destination concept* — there is no correct answer, only geometric structure to characterize. CoT is evaluated by task accuracy; our paradigm is evaluated by structural consistency.

### 3.6 Cross-Model Comparison and the Platonic Representation Hypothesis

- PRH (Huh et al., 2024): representations converge across models with scale, measured by CKA.
- Multi-way alignment (2026): shared reference space across N models.
- Model stitching and feature transfer (NeurIPS 2025): meaningful but non-uniform transfer across models.
- LLM behavioral fingerprinting (2025): characteristic behavioral signatures.
- Conversational attractor states (Nanda et al., 2026): model-specific behavioral loops (Claude-to-zen, GPT-to-system-building) — the conversational analog of our quantitative gaits.
- Behavioral failure manifold mapping (2025): model-specific topographies with qualitatively different basin structures.
- **Our test:** PRH measures static alignment. We test *dynamic navigational alignment* — whether shared representations imply shared routes. Our finding: structure generalizes, content mostly generalizes, but gaits (route preferences) diverge. Same map, different routes.

### 3.7 Cognitive Science Foundations

- Gardenfors (2000): Conceptual Spaces as geometric similarity spaces. Quality dimensions, convex natural concepts, betweenness.
- Cognitive maps: Tolman (1948), O'Keefe & Dostrovsky (1971), Constantinescu et al. (2016) — grid cells for conceptual navigation.
- Tversky (1977): Asymmetric similarity judgments in humans. North Korea more similar to China than China to North Korea. Direct parallel to our quasimetric finding.
- Spreading activation (Collins & Loftus, 1975): directional activation spread through semantic networks.
- LLM World of Words (2024-2025): free association norms from LLMs, directly comparable to human norms.
- **Our operationalization:** Gardenfors theorized; cognitive neuroscience found biological mechanisms; we provide a computational probe at scale. Note: we do not claim LLMs replicate human conceptual navigation — only that they exhibit analogous geometric regularities testable by similar methods.

---

## 4. Act I — Structure: Models Have Navigational Geometry

**Goal:** Establish the basic structural findings. This is the foundation everything else builds on.

**Phases covered:** 1, 2, 3A

### 4.1 Conceptual Gaits Are Distinct and Stable

**Claims:** [robust] R1

- 12 models span a 2.9x gait range: Mistral 0.747 to GPT 0.258.
- Gait is stable across 5+ phases and 9,500+ runs for the core cohort.
- Phase 10A: 4 new models fall within the expected range (0.298-0.508).
- Phase 11A: 4 more models extend the range (Mistral 0.747 record).
- Control validation: all models show low consistency on nonsense pairs (Jaccard 0.062), confirming gait is content-driven, not a decoding artifact.

> **[Figure 2: Gait Spectrum]** — Horizontal bar chart showing Jaccard consistency for all 12 models, ordered by gait value. Color-code by provider family. Annotate Mistral (highest) and GPT (lowest). Include error bars (cross-pair variance).

> **[Figure 3: Gait Stability]** — For the 4 core models, show gait consistency across Phases 1-9 (x-axis: phase, y-axis: mean Jaccard). Demonstrates temporal stability.

**Key statistic:** Claude 0.578 vs GPT 0.258 = 2.2x gap, stable across 5 phases.

### 4.2 Paths Are Self-Consistent Within Models

**Claims:** [observed] O9, O10

- No temporal drift detected across multi-day collection (O9). Cross-batch Jaccard within 0.05 of within-batch.
- 5-waypoint paths are genuine coarse-graining of 10-waypoint paths (O10): 70.5% shared waypoints, 67.9% subsequence rate.
- Establishes that the paths we measure are stable model properties, not transient API artifacts.

### 4.3 The Dual-Anchor Effect

**Claims:** [observed] O2

- Both endpoints exert gravitational pull: U-shaped convergence across positions.
- Positions 1 and 5 elevated (0.102, 0.129), valley in middle (0.057-0.085).
- Category-dependent signatures: antonyms show late convergence, identity shows middle domination, controls show pure U-shape.
- Refutes the simple starting-point hypothesis; establishes dual-anchor model.

> **[Figure 4: Dual-Anchor U-Shape]** — Line plot of mirror-match rate by position, broken out by category (antonym, identity, random, nonsense). The U-shape is the paper's first geometric claim.

### 4.4 Three Models Agree, Gemini Diverges

**Claims:** [observed] O1

- Claude, GPT, and Grok show converging navigational patterns for most pairs; Gemini systematically diverges.
- Gemini isolation index 0.136 (Phase 4A) — the lowest inter-model agreement in the cohort.
- Sets up the later "Gemini mystery" thread (Section 7.5): the deficit is real, persistent, and uncharacterized after three mechanistic attempts.

### 4.5 Polysemy Sense Differentiation

**Claims:** [robust] R3

- Cross-pair Jaccard 0.011-0.062 for bank/bat/crane polysemy groups.
- Different sense targets produce genuinely different paths.
- Establishes that navigational structure reflects semantic content, not surface statistics.

---

## 5. Act II — Topology: Conceptual Space Is Quasimetric

**Goal:** Establish the metric-axiom results that characterize the topology of navigational space.

**Phases covered:** 2, 3B, 4, 5

### 5.1 Asymmetry Is Fundamental

**Claims:** [robust] R2

- Mean directional asymmetry 0.811 across 84 pair/model combinations.
- 87% of combinations show statistically significant asymmetry (permutation test, p < 0.05).
- Symmetry axiom fails comprehensively. This is not noise — it is the dominant property.
- Phase 11C qualification: asymmetry is resolution-dependent (0.594 at 5 waypoints, 0.684 at 9 waypoints). The property is real but requires sufficient path length to manifest. [observed] O32

> **[Figure 5: Asymmetry Distribution]** — Histogram of directional asymmetry values across all 84 pair/model combinations. Vertical line at 0.811 (mean). Almost no mass near 1.0 (perfect symmetry). Compare to what a metric space would predict (all values at 1.0).

**Theoretical connection:** Tversky (1977) showed human similarity is asymmetric. Berglund et al. (2023) showed autoregressive models have a reversal curse. Our finding connects these: the reversal curse is not a bug — it produces structured asymmetry that reveals quasimetric topology.

### 5.2 Triangle Inequality Holds as a Structural Constant

**Claims:** [robust] R2 (triangle inequality component)

- Phase 3B: 91%. Phase 4B: 93.8%. Phase 7B: 90.6%.
- Three independent samples converge on ~91% — a structural constant.
- Conceptual space satisfies all metric axioms except symmetry: the formal definition of a quasimetric space.

> **[Table 4: Triangle Inequality Replication]** — Three rows (Phase 3B, 4B, 7B), columns: N triangles, % holding, mean excess, 95% CI.

### 5.3 Hierarchical Paths Are Compositional

**Claims:** [robust] R4

- 4.9x higher waypoint transitivity for hierarchical triples vs random (0.175 vs 0.036, non-overlapping CIs).
- Bridge concepts appear systematically for taxonomic triples: "dog" at 15-100% for animal-dog-poodle.
- Never for random controls: "stapler" at 0%, "flamingo" at 0%.
- Strongest evidence that navigation reflects genuine geometric structure, not word association.

> **[Figure 6: Compositional Structure]** — Side-by-side: (Left) Transitivity scores for hierarchical vs random triples. (Right) Bridge frequency for taxonomic bridges vs random controls.

### 5.4 Bridge Concepts Are Bottlenecks, Not Associations

**Claims:** [robust] R6

- "Spectrum" works (1.00 all models): names the mechanism.
- "Metaphor" fails (0.00 all models): associated but off-axis.
- "Germination" > "plant": process-naming > object-naming (O4).
- "Fire" fails: too-central, informationally redundant (O6).
- "Bank" as forced crossing: only connection between loan and shore, obligatory bottleneck (O5).

> **[Figure 7: Bridge Taxonomy]** — 2x2 grid showing bridge frequency for: (top-left) bottleneck bridges (spectrum, deposit, bank), (top-right) off-axis associations (metaphor, energy), (bottom-left) process vs object (germination vs plant), (bottom-right) too-central (fire, water). Each panel shows frequency by model.

**Key insight (from Graveyard):** The biggest prediction miss in the benchmark was "metaphor" as language-thought bridge (G5). Intuitive semantic importance has zero predictive power for navigational bridge behavior. This sharpened the definition: bridges must name the primary axis of connection, not merely be associated with both endpoints.

### 5.5 Cue-Strength Gradient

**Claims:** [robust] R7

- 12/16 family/model combinations show monotonic decrease from highest to lowest cue level.
- All 4 failures in one anomalous family (biological-growth).
- Three well-behaved families show perfect gradient across all models.

### 5.6 Waypoint Distributions Are Non-Uniform

**Claims:** [observed] O11

- 7/8 pairs reject uniformity (Bonferroni-corrected KS test).
- Claude lowest entropy (2.59, near-deterministic); GPT highest (3.44, broadest exploration).
- Navigational traffic concentrates in a small number of high-frequency waypoints.

### 5.7 Bridge Positioning: Early Anchoring, Not Midpoint

**Claims:** [observed] O12, O13

- Modal bridge position is 1-2 (0-indexed) for 8/10 pairs.
- Peak-detection contrast 0.345 (CI [0.224, 0.459]) robustly positive; fixed-midpoint contrast -0.080.
- Exception: taxonomic bridges anchor hierarchically (animal-poodle "dog" at position 4-5).
- Forced-crossing bridges are positionally unstable (SD 1.71 vs 0.52 non-forced).

> **[Figure 8: Bridge Position Profiles]** — Heatmap or small-multiples showing bridge position distributions for 10 pairs across 4 models. Highlight the early-anchoring pattern and the taxonomic exception.

---

## 6. Act III — Mechanism: Pre-Filling Reveals Causal Structure

**Goal:** Establish what we can say about *how* navigational structure arises. The causal intervention results.

**Phases covered:** 7A, 10B

### 6.1 Pre-Filling Causally Displaces Bridges

**Claims:** [observed] O15

- Mean displacement 0.515 (CI [0.357, 0.664], excludes zero).
- Survival drops from 0.807 (unconstrained) to 0.460 (pre-filled).
- The first waypoint has outsized causal influence on the entire trajectory.
- Taxonomic bridges resist displacement (0.140) — hierarchical paths are structurally distinct.

> **[Figure 9: Pre-Fill Displacement]** — Paired bar chart: unconstrained vs pre-filled bridge frequency for 8 pairs, grouped by bridge type (heading, taxonomic, forced-crossing). Error bars show cross-model variance.

### 6.2 The Mechanism Is Primarily Associative Primacy

**Claims:** [observed] O15 (mechanism component)

- Incongruent vs congruent distinction is not cleanly separated for displacement (0.515 vs 0.436, overlapping CIs).
- But survival shows a pattern: incongruent 0.347 vs congruent 0.631.
- The directional-heading theory fails in its strong form.
- Mechanism is primarily associative primacy (whatever occupies position 1 anchors the trajectory) with possible secondary congruence modulation.

### 6.3 Relation Class Affects Bridge Survival

**Claims:** [observed] O26

- Friedman chi-squared = 6.750, p = 0.034. Significant.
- Unrelated pre-fills most disruptive (0.388) < on-axis (0.643) ~ same-domain (0.708).
- The operationally meaningful distinction is binary: related vs unrelated.
- Related pre-fills maintain navigational context; unrelated pre-fills destroy it.

> **[Figure 10: Relation Class Survival]** — Boxplot or violin plot showing bridge survival by relation class (unrelated, on-axis, same-domain). Include the Friedman p-value.

### 6.4 Marginal Bridge Facilitation

**Claims:** [observed] O22

- Marginal bridges (unconstrained freq 0.125-0.267) show massive facilitation under aligned pre-fill: mean 3.761x survival.
- Science-art "creativity" at 8.0x, student-professor "research" at 4.0x.
- Effect is model-general (3/4 models) but absent in Gemini.
- Qualitative threshold: marginal bridges can be facilitated, dominant bridges are generally displaced.

---

## 7. Act IV — Limits: The Mechanism Ceiling

**Goal:** Present the 8/8 hypothesis failure as a *finding*, not a negative result. Single-variable mechanistic models are inadequate for conceptual navigation.

**Phases covered:** 8, 9

### 7.1 The Mechanistic Prediction Collapse

**Claims:** [observed] O20, O24

- Phase 8 prediction accuracy: 24% (6/25). Phase 9: 20% (5/25).
- Combined Phases 8-9: 22% (11/50).
- Zero novel mechanistic predictions confirmed across both phases.
- Replication predictions succeed at ~80%, structural predictions at ~50%, mechanistic predictions at ~15%.

> **[Figure 11: Prediction Accuracy by Phase]** — Line plot showing prediction accuracy across Phases 4-11. Annotate the descent from 81.3% (Phase 4, characterization) to 20-24% (Phases 8-9, mechanism). Include horizontal reference lines for different prediction types.

### 7.2 The Eight Falsified Hypotheses

Present as a structured catalog:

| # | Hypothesis | Phase | Predicted | Observed | Graveyard |
|---|-----------|-------|-----------|----------|-----------|
| 1 | Route exclusivity (competitor count) | 8A | rho < -0.70 | rho = 0.116 | G20 |
| 2 | Gemini gradient blindness | 8B | Gemini interaction >= 0.20 | interaction = 0.046 | G21 |
| 3 | Gait normalization rescues cross-model distance | 8C | normalized r > 0.50 | r = 0.212 (0.000 improvement) | G22 |
| 4 | Dominance ratio predicts fragility | 9A | rho > 0.50 | rho = 0.157 | G23 |
| 5 | Gemini transformation-chain blindness | 9B | transformation deficit | transformation *advantage* | G24 |
| 6 | Pre-fill facilitation crossover regression | 9C | significant slope | CI includes zero | G25 |
| 7 | Bridge bottleneck generalization (initial) | 10A | CI includes zero | CI excluded zero (resurrected with more data) | G26* |
| 8 | Predicted relation class ordering | 10B | on-axis < unrelated < same-domain | unrelated < on-axis ~ same-domain | G27 |

> **[Table 5: Falsified Mechanistic Hypotheses]** — The table above, formatted for the paper. Include predicted effect size, observed effect size, and CI for each.

*Note: G26 was resurrected — include in discussion as an honest accounting case.

### 7.3 The Pattern: Qualitative Structure, Quantitative Opacity

- Qualitative directional predictions succeed (~50%): "bridges exist," "asymmetry is high," "hierarchical triples are compositional."
- Quantitative mechanistic predictions fail (~0-15%): "this specific variable predicts bridge fragility," "this interaction explains Gemini's deficit."
- The benchmark maps coarse geometry reliably but cannot predict fine-grained mechanism with single-variable models.
- This is not a failure of the benchmark — it is a finding about the phenomenon. Conceptual navigation has qualitative structure that resists simple explanations.

### 7.4 Cross-Model Distance Is Fundamentally Model-Dependent

**Claims:** [observed] O18, O19

- Cross-model distance correlation r = 0.170 (Phase 7B).
- Gait normalization produces zero improvement: raw r = 0.212, normalized r = 0.212 (Phase 8C, O19).
- Some model pairs anti-correlate: Grok-Gemini r = -0.580.
- The disagreement is ordinal, not scalar — models rank-order distances differently.
- Model-independent geometry cannot be recovered from path-based measurements.

### 7.5 The Gemini Mystery

- Gemini's overall deficit is real (mean 0.480 vs ~0.67 non-Gemini, ~30% reduction).
- Three mechanistic characterizations falsified: frame-crossing threshold (Phase 5), gradient blindness (G21), transformation blindness (G24).
- The deficit reverses direction between Phase 8B (causal zeros) and Phase 9B (gradient zeros).
- Whatever pair type is designed to be "hard" for Gemini, Gemini does relatively better on it.
- The type-based approach to characterizing Gemini is wrong. The deficit is model-level, not type-level.

---

## 8. Act V — Generality: Structure Scales Across Architectures

**Goal:** Show that the structural findings are not artifacts of the original 4-model cohort.

**Phases covered:** 10A, 11A

### 8.1 Replication Across 12 Models

**Claims:** [robust] R1, R2 (extended)

- R1 (gait): All 12 models show characteristic gaits. Range 0.258-0.747.
- R2 (asymmetry): All 12 models exceed the 0.60 threshold.
- Both properties are universal across models from 11 independent training pipelines.

> **[Figure 12: 12-Model Gait and Asymmetry]** — Two-panel figure. Left: gait by model (12 bars). Right: asymmetry by model (12 bars). Both sorted by gait value. Horizontal line at asymmetry threshold 0.60.

### 8.2 The Structure/Content/Scale Hierarchy

**Claims:** [observed] O25

- **Structure generalizes:** Gait and asymmetry are universal. All models have navigational geometry.
- **Content mostly generalizes:** Bridge frequency CI includes zero for large models (new cohort 0.717 vs original 0.817, CI [-0.286, 0.089]). Large models from different providers converge on the same navigational landmarks.
- **Scale differentiates:** Llama 3.1 8B is the sole outlier (bridge freq 0.200). Phase 11A: Llama 4 Maverick (frontier) at 0.724 vs Llama 3.1 8B at 0.200 — same family, 3.6x difference. Scale, not architecture, determines whether a model finds the same bridges.

> **[Figure 13: Scale Effect]** — Scatterplot of bridge frequency vs approximate model scale (log axis). Llama 8B is the clear outlier. All frontier-scale models cluster together.

**Connection to Karkada et al. (2025):** If geometric structure arises from data statistics that all models share, universality is mathematically expected. Our empirical finding of structure/content generality confirms this prediction. The scale effect suggests a minimum capacity threshold for extracting the full navigational structure from shared data statistics.

**Connection to PRH:** Static representational alignment (CKA) predicts that larger models converge. Our behavioral test partially confirms: navigational *structure* converges, navigational *landmarks* converge for large models, but navigational *gaits* (route preferences) remain model-specific. Same map, different routes — the PRH is partially right.

### 8.3 Gait Profiles of New Models

**Claims:** [observed] O28

- Mistral: record 0.747, near-deterministic on some pairs (0.936 on music-mathematics).
- DeepSeek: 0.540, moderate consistency.
- Cohere: 0.502, moderate consistency.
- Llama 4 Maverick: 0.539, confirming scale matters within a family.
- The gait spectrum ranges 2.9x — architectural/training differences produce qualitatively different navigation.

---

## 9. Act VI — Robustness: The Benchmark Survives Its Own Tests

**Goal:** Show that the claims are not artifacts of specific protocol choices.

**Phases covered:** 11B, 11C

### 9.1 Multiverse Robustness Analysis

**Claims:** [observed] O30, O31, O32

- **ANOVA results:** Model identity eta-squared = 0.242 (p ~ 0.001). Waypoint count eta-squared = 0.008 (p ~ 0.520). Temperature eta-squared = 0.002 (p ~ 0.743). Interaction ~ 0.000.
- Model identity is the dominant driver. Protocol variation is negligible.
- The benchmark's structural claims are not artifacts of the 7-waypoint, 0.7-temperature protocol.

> **[Table 6: ANOVA Results]** — Factor, eta-squared, approximate p-value for each main effect and interaction.

### 9.2 Bridge Frequency Is the Most Robust Property

**Claims:** [observed] O31

- Mean bridge frequency > 0.97 across all 5 conditions (7wp/t0.7, 5wp/t0.5, 5wp/t0.9, 9wp/t0.5, 9wp/t0.9).
- Range 0.978-0.993.
- Bridge bottleneck behavior is insensitive to both waypoint count and temperature.

> **[Figure 14: Robustness Heatmap]** — 5x3 heatmap (conditions x metrics: gait, asymmetry, bridge frequency). Color intensity = metric value. Bridge frequency row is uniformly dark (high). Asymmetry row shows the resolution effect at 5 waypoints.

### 9.3 Gait Rankings Are Largely Stable

- Kendall's W = 0.840 across conditions.
- Not perfectly preserved: GPT and DeepSeek swap in some conditions.
- But the overall ordering is robust to protocol variation.

### 9.4 Asymmetry Is Resolution-Dependent

**Claims:** [observed] O32, Graveyard G29

- At 5 waypoints: 0.594 (below 0.60 threshold).
- At 9 waypoints: 0.669-0.684 (above).
- The quasimetric property is real but requires sufficient path length to manifest.
- This is a measurement sensitivity finding, not a refutation of R2.

### 9.5 The Control Pair Problem

**Claims:** [robust, qualified] R5; [observed] O27, O29

- All 4 new control candidates fail screening (0/24 cells pass). G28.
- Retrospective: stapler-monsoon fails R5 for all 12 models (top freq 0.650-1.000).
- LLMs find navigable routes between *any* concept pair at 7 waypoints.
- R5 is retained but qualified as the weakest robust claim.
- **Reframing:** The benchmark's validity rests on the magnitude gap between experimental and control conditions, not on controls being truly random. The finding that models can navigate between any two concepts is itself informative — it reveals the density of LLM associative connectivity.

> **[Table 7: Control Pair Analysis]** — Control pair, top waypoint, top frequency, entropy for all 12 models. Shows universal failure of strict-threshold validation.

---

## 10. Discussion

### 10.1 Summary of the Six-Act Narrative

Compact recapitulation:
1. **Structure:** Models have distinct, stable conceptual gaits (R1). Navigation is self-consistent (O9, O10) and shaped by dual-anchor effects (O2).
2. **Topology:** Conceptual space is quasimetric — asymmetric (R2, 0.811) with triangle inequality holding at ~91%. Bridges are structural bottlenecks (R6), not associations. Hierarchical paths are compositional (R4).
3. **Mechanism:** Pre-filling causally displaces bridges (O15, 0.515 displacement). The mechanism is associative primacy. Relation class matters (O26): related pre-fills preserve context, unrelated destroy it.
4. **Limits:** 8/8 single-variable mechanistic hypotheses fail. Prediction accuracy plateaus at 20-24% for mechanism (O24). Qualitative structure is characterizable; quantitative mechanism is opaque.
5. **Generality:** Structure and content generalize across 12 models from 11 families (R1, R2, R6 extended). Scale differentiates (Llama 8B outlier). The hierarchy is structure > content > scale.
6. **Robustness:** Model identity dominates protocol variation (O30). Bridge frequency is the most robust property (O31, >0.97 all conditions). Asymmetry is resolution-dependent (O32).

### 10.2 What the Benchmark Reveals About Conceptual Space

- **Quasimetric, not metric:** Symmetry fails; all other axioms hold. This is the formal signature of a directed space, consistent with autoregressive architecture (reversal curse) and human cognition (Tversky's asymmetry).
- **Bottleneck topology:** The most reliable navigational landmarks are obligatory intermediaries, not strongly associated concepts. This echoes the knowledge graph finding that shortest-path intermediaries are more informative than high-degree hubs.
- **Model-specific gaits on shared geometry:** All models navigate the same basic geometry (structure is universal) through the same landmarks (content converges for large models) but with different route preferences (gaits diverge). This is the behavioral analog of the PRH: representations converge, but behavior diversifies.
- **Navigational structure is not compositional from simple variables:** The mechanism ceiling (8/8 failures) suggests that conceptual navigation emerges from the interaction of multiple factors (bridge identity, pre-fill content, model gait, pair semantics) that cannot be captured by single-variable models. This parallels findings in neuroscience where spatial navigation is multi-factorial.

### 10.3 Limitations

**Separate benchmark limitations (design issues we control) from phenomenon limitations (findings about the thing we're studying).**

#### Benchmark Limitations (in order of severity)

1. **Control pair failure (R5):** The most serious limitation. LLMs find navigable routes between any two concepts, defeating single-pair control validation. The benchmark's validity rests on relative performance gaps, not absolute control baselines. Future work needs a fundamentally different control design (e.g., pair batteries, relative consistency ratios).

2. **Self-grounding circularity:** Model outputs generate their own ground truth. Mitigated by testing external mathematical properties (metric axioms) and cross-model comparison, but never fully eliminated. External anchors (ConceptNet paths, human free association norms) would strengthen validity.

3. **API-mediated access:** Cannot control internal model state, temperature is approximate for some providers, model updates may occur silently during data collection. Partially addressed by O9 (no temporal drift detected) and Phase 11C (robustness to temperature variation).

4. **Concept pair selection bias:** Pairs were selected by the experimenters, not sampled from a principled distribution. Some findings may be pair-specific rather than general. Partially addressed by the large number of pairs (100+) and by the generality analysis.

5. **Resolution dependence:** Asymmetry requires 7+ waypoints to detect reliably (O32). Other properties may similarly have resolution thresholds that the benchmark's default settings happen to satisfy.

#### Phenomenon Limitations (findings about what we're studying)

6. **Mechanism ceiling:** 8/8 single-variable hypotheses fail. The benchmark characterizes structure but cannot yet explain it. Multi-variable models and different experimental paradigms (e.g., embedding-level interventions, activation patching) may be needed. This is not a design flaw — it is the paper's most informative negative result.

7. **Cross-model distance failure (O18, O19):** Models rank-order conceptual distances differently. Model-independent navigational geometry cannot be recovered from path-based measurements alone. This limits the benchmark's ability to define a universal distance function.

8. **Gemini characterization failure:** Gemini's ~30% deficit is real but uncharacterized after three mechanistic attempts (G7, G21, G24). The type-based approach to explaining model-level deficits is wrong. This is an honest gap — the benchmark can detect the anomaly but not explain it.

### 10.4 The Graveyard as Methodology

- 29 documented dead ends across 11 phases.
- The graveyard is not a failure record — it is the benchmark's most honest contribution.
- Key lessons: (a) intuitive semantic importance has zero predictive power for navigational behavior (G5, "metaphor"), (b) qualitative models can be correct while their quantitative predictions fail (G7, Gemini threshold), (c) retrospective signals on small samples do not generalize (G23, dominance ratio at N=8), (d) infrastructure limitations can masquerade as substantive findings (G26, resurrected).
- Recommend that future benchmarking work adopt similar transparent dead-end documentation.

### 10.5 Connections to Theory

- **Karkada et al. (2025) as theoretical complement:** They proved why static geometry exists; we show it supports (structured, asymmetric, model-specific) navigation. Together: geometry arises from data statistics (their contribution) and supports behavioral navigation that is structurally universal but dynamically model-specific (our contribution).
- **Gardenfors operationalized:** The benchmark provides a large-scale computational probe of conceptual spaces theory in LLMs. Findings partially confirm Gardenfors: concepts do live in navigable geometric spaces with measurable distance structure. But the quasimetric finding challenges the standard metric assumption.
- **PRH refined:** Representations may converge (Huh et al.), but navigation diversifies. The PRH captures structure but misses dynamics.
- **Wyss et al. (2025) confirmed behaviorally:** Spectral semantic attractors predict discrete basins — our bridge bottlenecks and "deep basins" from the word convergence game are the behavioral manifestation.

### 10.6 Future Work

1. **Multi-variable bridge fragility model:** Both single-variable predictors failed. Need joint model of pre-fill content, bridge role, and dominance.
2. **Embedding-based distance validation:** May rescue cross-model geometry where path-based failed (O18, O19).
3. **Multilingual conceptual topology:** Is navigational structure language-dependent?
4. **Scale threshold investigation:** What parameter count / capability level is needed for bridge convergence? Llama 8B/70B/405B comparison.
5. **Temporal stability under model updates:** Do gaits change across model versions?
6. **Human waypoint comparison:** Collect human paths for a calibration subset. Compare to LLM paths.
7. **External anchoring:** ConceptNet paths, Small World of Words norms as non-LLM baselines.
8. **Control pair redesign:** Relative consistency metrics, pair batteries, or fundamentally different control paradigms.
9. **Chain-of-thought as intervention:** Does explicit reasoning change navigational paths? Connects to compositionality gap.
10. **Curvature estimation:** Within-model only (cross-model blocked by O18/O19). Hyperbolic vs Euclidean vs mixed curvature.

---

## 11. Conclusion

~300 words. Three paragraphs:

1. **What we showed:** LLMs have consistent, measurable geometric structure in how they navigate between concepts. This structure is quasimetric (asymmetric with triangle inequality), populated by bottleneck bridges (not associations), and organized into model-specific gaits on a shared geometry. These findings hold across 12 models from 11 families and resist protocol variation.

2. **What we learned:** The mechanism ceiling — 8/8 single-variable hypotheses fail — is itself the most important finding. Conceptual navigation has qualitative geometric structure (characterizable) but resists quantitative mechanistic explanation (opaque to simple models). This parallels the broader challenge in interpretability: structure is detectable before it is explainable.

3. **What it means:** Static geometry is well-studied; navigation is not. Karkada et al. proved why the geometry exists; we showed what it supports. The Conceptual Topology Mapping Benchmark provides a new evaluation paradigm — not testing what models know, but how they navigate what they know. The 29 dead ends and the mechanism ceiling are not failures but honest accounting of where the field needs to go next.

---

## Appendices

### Appendix A: Full Concept Pair Inventory

- Complete list of all concept pairs used across 11 phases.
- Categorized by type (antonym, hierarchical, polysemous, cross-domain, control, etc.).
- Bridge concept(s) for each pair where applicable.

### Appendix B: Detailed Phase-by-Phase Results

- Condensed summary of each phase's findings, predictions, and prediction accuracy.
- Useful for readers who want to trace the exploration-first methodology.

### Appendix C: The Graveyard

- Full 29-entry graveyard with lessons learned.
- G1-G29, including G26 resurrection.

### Appendix D: Prompt Templates

- Exact system prompts used for waypoint elicitation.
- Pre-fill prompt format.
- Any prompt variations across phases.

### Appendix E: Statistical Methods

- Bootstrap confidence intervals for Jaccard comparisons.
- Permutation tests for asymmetry significance.
- Friedman test and post-hoc Wilcoxon for relation classes.
- ANOVA for multiverse robustness.
- Notes on multiple comparison corrections (Bonferroni, etc.).

### Appendix F: Robustness Analysis Details

- Full 2x2 grid (waypoint count x temperature) results from Phase 11C.
- Per-pair, per-model breakdown.
- ANOVA interaction tables.

---

## Figure and Table Index

| ID | Type | Description | Section | Source Phase(s) |
|----|------|-------------|---------|----------------|
| Fig 0 | Synthesis | "Same map, different routes": 2-3 canonical pairs showing waypoint trajectories for all 12 models, same endpoints but divergent paths | 1 | 1-11 |
| Fig 1 | Schematic | Benchmark overview: elicitation, paths, metrics | 1 | N/A |
| Fig 2 | Bar chart | 12-model gait spectrum | 4.1 | 1-11 |
| Fig 3 | Line plot | Gait stability across phases (core 4 models) | 4.1 | 1-9 |
| Fig 4 | Line plot | Dual-anchor U-shape by category | 4.3 | 3A |
| Fig 5 | Histogram | Asymmetry distribution across 84 combinations | 5.1 | 2 |
| Fig 6 | Bar chart | Compositional structure: transitivity + bridge freq | 5.3 | 3B |
| Fig 7 | 2x2 grid | Bridge taxonomy: bottleneck, off-axis, process/object, too-central | 5.4 | 3-5 |
| Fig 8 | Heatmap | Bridge position profiles (10 pairs x 4 models) | 5.7 | 6C |
| Fig 9 | Bar chart | Pre-fill displacement by bridge type | 6.1 | 7A |
| Fig 10 | Boxplot | Relation class survival (unrelated, on-axis, same-domain) | 6.3 | 10B |
| Fig 11 | Line plot | Prediction accuracy descent across phases | 7.1 | 4-11 |
| Fig 12 | Two-panel | 12-model gait and asymmetry | 8.1 | 10-11 |
| Fig 13 | Scatter | Bridge frequency vs model scale | 8.2 | 10-11 |
| Fig 14 | Heatmap | Robustness: metrics across 5 protocol conditions | 9.2 | 11C |
| Table 0 | Synthesis | Headline Claims at a Glance: claim, evidence tier, models/phases supporting, core statistic, qualification | 1.3 | All |
| Table 1 | Definitions | Metric definitions, ranges, interpretation | 2.2 | N/A |
| Table 2 | Summary | Model name, provider, scale, runs, phases | 2.4 | All |
| Table 3 | Summary | Phase overview: runs, question, finding | 2.5 | All |
| Table 4 | Replication | Triangle inequality across 3 phases | 5.2 | 3B, 4B, 7B |
| Table 5 | Catalog | 8 falsified mechanistic hypotheses | 7.2 | 8-10 |
| Table 6 | ANOVA | Multiverse robustness results | 9.1 | 11C |
| Table 7 | Analysis | Control pair failure for 12 models | 9.5 | 11B |

---

## Claim-to-Section Mapping

### Robust Claims (R1-R7)

| Claim | Primary Section | Also Appears In |
|-------|----------------|-----------------|
| R1. Distinct stable gaits | 4.1, 8.1 | 9.3 |
| R2. Quasimetric asymmetry | 5.1, 5.2, 8.1 | 9.4 |
| R3. Polysemy sense differentiation | 4.4 | |
| R4. Hierarchical compositionality | 5.3 | |
| R5. Control validation (qualified) | 9.5 | 10.3 |
| R6. Bridges are bottlenecks | 5.4 | 9.2 |
| R7. Cue-strength gradient | 5.5 | |

### Key Observed Claims (selected)

| Claim | Primary Section |
|-------|----------------|
| O1. Three agree, Gemini diverges | 4.4 |
| O2. Dual-anchor effect | 4.3 |
| O4. Process > object bridges | 5.4 |
| O5. Forced crossings | 5.4 |
| O6. Too-central failure mode | 5.4 |
| O11. Non-uniform distributions | 5.6 |
| O12. Early bridge anchoring | 5.7 |
| O15. Pre-fill displacement | 6.1 |
| O18. Cross-model distance failure | 7.4 |
| O20/O24. Prediction accuracy floor | 7.1 |
| O22. Marginal bridge facilitation | 6.4 |
| O25. Structure/content/scale hierarchy | 8.2 |
| O26. Relation class effects | 6.3 |
| O29. LLMs navigate between any concepts | 9.5 |
| O30. Model identity drives structure | 9.1 |
| O31. Bridge frequency most robust | 9.2 |
| O32. Asymmetry resolution-dependent | 9.4 |

### Graveyard Entries Referenced in Main Text

| Entry | Section | Purpose |
|-------|---------|---------|
| G5. "Metaphor" as bridge | 5.4 | Sharpened bridge definition |
| G13. Forced-crossing reduces asymmetry | 5.1 footnote | Asymmetry is structural constant |
| G16-G18. Curvature and too-central | 7.4, 5.4 | Metric validity and categorization limits |
| G20-G25. Mechanistic failures | 7.2 | The mechanism ceiling |
| G26. Resurrected | 8.2, 10.4 | Infrastructure vs substance |
| G27. Relation class ordering | 6.3 | Predicted ordering wrong |
| G28. Control candidates | 9.5 | Fundamental control limitation |
| G29. Asymmetry universality | 9.4 | Resolution dependence |

---

## Estimated Paper Length

- **Main text:** ~12,000-15,000 words (30-38 pages double-spaced)
- **Figures:** 14
- **Tables:** 7
- **Appendices:** 6 (could add ~5,000-8,000 words)
- **Target venue considerations:**
  - NeurIPS/ICML: Would need compression to ~8-10 pages main text + appendix. Prioritize Acts I-II and V-VI; condense Acts III-IV.
  - TMLR/JMLR: No page limit. Full narrative.
  - Cognitive Science / CogSci: Emphasize Gardenfors angle and cognitive parallels. ~6,000 words.
  - Nature Machine Intelligence: Emphasize the "same map, different routes" finding and scale hierarchy. ~5,000 words.

---

## Writing Order Recommendation

1. **Section 2 (Benchmark)** — Write first. Defines all terms and metrics. Everything else depends on this.
2. **Section 4 (Structure)** — Core findings. Easiest to write because the data is cleanest.
3. **Section 5 (Topology)** — The quasimetric result and bridge taxonomy. The paper's main intellectual contribution.
4. **Section 8 (Generality)** — The 12-model result. High impact, straightforward presentation.
5. **Section 7 (Limits)** — The mechanism ceiling. Requires careful framing as a finding, not a failure.
6. **Section 9 (Robustness)** — ANOVA and multiverse. Strengthens everything that came before.
7. **Section 6 (Mechanism)** — Pre-fill results. More nuanced, benefits from having Sections 4-5 as context.
8. **Section 3 (Related Work)** — Write after the results sections so positioning is precise.
9. **Section 10 (Discussion)** — Write last (except abstract/introduction).
10. **Section 1 (Introduction)** — Write second-to-last. Needs to promise exactly what the paper delivers.
11. **Abstract** — Write last.
