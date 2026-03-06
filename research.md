# Conceptual Topology Mapping: Research Survey & Benchmark Design

Research conducted 2026-03-03. Comprehensive survey of existing work related to a proposed novel LLM benchmark that tests whether models have consistent, measurable geometric structure in how they navigate between concepts.

**The benchmark:** Give models two concepts, ask for intermediate waypoints. Test path consistency (A→B vs B→A), triangle inequality (embedding distances), transitivity, and cross-model geodesics. Self-grounding — the model's own outputs generate ground truth.

**Builds on:** Word convergence game (575 games, 4 models), which showed each model navigates conceptual space with a characteristic "gait." Key empirical findings from that project are summarized below for self-containedness.

---

## 0. Empirical Foundation: Word Convergence Game

575 games played on March 1, 2026, using Claude Sonnet 4.6, GPT-5.2, Grok 4.1 Fast, and Gemini 3 Flash via OpenRouter. Two instances of an LLM each start with a different word; each round, both say a new word that bridges the gap between the previous two, trying to converge on the same word simultaneously. Same rules as the party game Convergence. Full dataset, analysis code, and writeup at [word-convergence-game](https://github.com/jamesondh/word-convergence-game) and [jamesonhodge.com/posts/word-convergence-game](https://jamesonhodge.com/posts/word-convergence-game).

### Characteristic Gaits

Each model navigates conceptual space with a measurable, consistent style:

- **Claude** — fastest, most predictable. Converges in ~2 rounds on nearly everything. Always picks the most obvious bridge word ("wave" for mountain+ocean, "echo" for shadow+melody). σ = 0.49 across all games. Best player, least interesting thinker.
- **GPT** — slowest, most creative. Takes winding paths through unexpected territory. For vertigo+mycelium, both instances independently went pharmacological (psilocybin, ergot) and converged on "alkaloid." Has a distinctive near-miss escalation pattern: orbits synonym clusters, then escapes upward to an abstraction encompassing the near-misses.
- **Grok** — lateral, cultural, associative. Shadow+melody → nocturne → phantom → opera → ghost → mask (Phantom of the Opera path). Hammer+butterfly → "pinfish" (compound: hammer→pin, butterfly→fish). Finds paths no other model discovers.
- **Gemini** — fast like Claude but with stranger word choices. "Thorax" for hammer+butterfly (butterfly anatomy), "hamlet" for skull+garden (Yorick). Technically correct from a different knowledge organization.

These profiles are stable across hundreds of games, stable under temperature changes, and measurable with simple statistics.

### Semantic Basins of Attraction

Three types of conceptual terrain emerged:

- **Deep basins** — one gravitational center. Beyoncé+erosion → "formation" 78-82% of the time across all four models and both directions (simultaneously a Beyoncé song and a geology term). Even cross-model games converge on it 70% of the time. Temperature sharpens the basin without altering it.
- **Moderate basins** — multiple valleys of similar depth. Shadow+melody sends Claude/Gemini to "echo" (100% consistency) but Grok to "nocturne" (Phantom of the Opera) and GPT splits between "nocturne" and "resonance" (acoustic physics). Same input, different conceptual frames, each internally consistent.
- **Flat terrain** — no basin, maximum entropy. Kanye West+lattice: Claude goes structural (scaffold, brick, wire), Gemini goes academic (graduation→coordinate→"College Dropout"), Grok goes hip-hop material culture (ice, diamond, chain), GPT goes geometric (facet, matrix, crystal). No model converges reliably. Chaotic at any temperature.

Key finding: **temperature sharpens existing basins but cannot create new ones.** At temperature 0.3, Claude/Gemini hit "formation" 100% instead of ~80%. Kanye+lattice remains chaotic at any setting. Basins are properties of knowledge, not sampling.

One exception: GPT got *less* consistent at low temperature on some pairs — "formation" dropped from 82% to 50%. GPT has competing attractors of similar strength; low temperature makes it commit to whichever frame it enters first rather than defaulting to the most popular choice. Most "opinionated" model at low temperature.

### Abstract vs. Concrete Asymmetry

Abstract pairs converge faster than concrete ones. GPT: 3.6 rounds average on concrete nouns → 2.8 on abstract words. The reason: **concrete nouns have dense synonym neighborhoods that create navigational friction.** Both GPT instances bridging "skull" and "garden" orbit cemetery/graveyard, tombstone/burial for 5 rounds before escaping to "inscription." Abstract words like "palimpsest" have no close synonyms to get stuck between — flexibility of metaphorical association is an advantage.

### Direction-Dependence

Word order changes outcomes for some models. Claude on Tesla+mycelium: forward → "network" (80%), reverse → "electricity" (100%, 5/5 runs). When Tesla is Player A's word, Claude thinks connectivity; when mycelium leads, Claude thinks Tesla's inventions. GPT shows the same pattern (forward: "network", reverse: "grid"). Gemini and Grok are direction-invariant. On flat terrain, all models show direction effects — no basin strong enough to override initial framing.

### Cross-Model Negotiation

Cross-model games average 4.1 rounds (vs. 2.3-2.8 same-model) with σ > 3. In **48% of cross-model games, the convergence word was one neither model produced in any solo game** — genuinely novel semantic territory. Claude vs. GPT on shadow+melody: Claude alone → "echo" (2 rounds), GPT alone → "chord" (4 rounds), together → 8 rounds → "broadcast" (where physics and aesthetics overlap). Neither found it alone.

Novelty maps onto basins: deep basins → 0% novelty (both fall into "formation"), moderate basins → 73-90% novelty (models forced to negotiate frames), flat terrain → 80-100% (everything novel, nothing stable). The interesting zone is moderate basins.

### Relation to Benchmark

The convergence game generated the hypotheses the benchmark formalizes: (1) models have characteristic navigational gaits, (2) conceptual space has measurable topological structure (basins), (3) navigation is direction-dependent, (4) cross-model differences reveal geometry that single-model analysis cannot. The benchmark replaces the free-form convergence game with controlled waypoint elicitation and geometric axiom testing (metric properties, triangle inequality, path consistency), enabling quantitative comparison at scale.

---

## 1. Semantic Space Geometry in LLMs

The most active and directly relevant area. Establishes that LLM embedding spaces have measurable geometric structure — but almost nobody has tested whether that structure is *navigable* behaviorally.

### The Linear Representation Hypothesis

**Park, Choe, Veitch (ICML 2024)** formalizes the idea that high-level concepts are represented as linear directions in LLM representation space. Critically identifies a *non-Euclidean* inner product that respects language structure, meaning standard cosine similarity is geometrically wrong for these spaces. Their follow-up, "The Geometry of Categorical and Hierarchical Concepts in Large Language Models" (ICLR 2025 oral), extends this to show:
- Categorical concepts are represented as simplices/polytopes
- Hierarchically related concepts are orthogonal
- Complex concepts are polytopes constructed from direct sums of simplices
- Validated on Gemma and LLaMA-3 across 900+ WordNet concepts
- [ICML 2024](https://arxiv.org/abs/2311.03658) | [ICLR 2025](https://arxiv.org/abs/2406.01506)

### Hyperbolic Structure in LLM Embeddings

Multiple groups have found that LLM token embeddings exhibit hyperbolic (negatively curved) geometry. Nickel and Kiela's foundational "Poincaré Embeddings for Learning Hierarchical Representations" (2017) showed trees embed into hyperbolic 2D space with arbitrarily low distortion. Recent work:
- "Hyperbolic Fine-Tuning for Large Language Models" (2024) — pre-trained GPT embeddings exhibit high hyperbolicity, frequent tokens cluster near origin, rare tokens farther out
- "HELM: Hyperbolic LLMs via Mixture-of-Curvature Experts" (2025) — mixed curvature across embedding regions
- [Poincaré Embeddings](https://arxiv.org/abs/1705.08039) | [Hyperbolic Fine-Tuning](https://arxiv.org/html/2410.04010) | [HELM](https://arxiv.org/pdf/2505.24722)

### Delta-Hyperbolicity and Ultrametricity (2025)

"Uncovering Hierarchical Structure in LLM Embeddings with δ-Hyperbolicity, Ultrametricity, and Neighbor Joining" directly measures how tree-like LLM embedding spaces are. Ultrametricity implies a strong triangle inequality. They find varying degrees across models, correlating with task performance.
- [Paper](https://arxiv.org/abs/2512.20926)

### Geometry of Decision Making (Joshi et al., NeurIPS 2025)

Studies intrinsic dimensionality (ID) across 28 open-weight transformers. Finds a universal pattern: early layers are low-dimensional, middle layers expand, later layers compress. ID peaks coincide with decision-making moments — geometric evidence of how reasoning and prediction confidence co-evolve.
- [Paper](https://arxiv.org/abs/2511.20315)

More broadly, a NeurIPS 2023 paper on the geometry of hidden representations reports a layerwise intrinsic-dimension profile where representations become higher-dimensional early, then contract, and suggests that intermediate layers can maximize semantic content. Complementing both, an ICLR 2025 paper argues for a distinct "high-dimensional abstraction phase" that is predictive of LM performance and even cross-model predictability of representations.
- [NeurIPS 2023](https://neurips.cc/virtual/2023/poster/71102) | [ICLR 2025](https://openreview.net/forum?id=0fD3iIBhlV)

### Manifold Evolution in LLM Generation (2025)

**Dynamic Manifold Evolution Theory (DMET)** models LLM generation as a continuous trajectory on a low-dimensional semantic manifold. Characterizes dynamics through interpretable metrics capturing smoothness, stability, and structure. Finds consistent links between latent dynamics and text quality. Frames generation as a dynamical system evolving on a low-dimensional semantic manifold and proposes empirical trajectory metrics tying latent-path properties to surface text quality.
- [Paper](https://arxiv.org/html/2505.20340)

### Topological Data Analysis of LLM Spaces (2025)

"Explainable Mapper" applies Mapper graphs (from TDA) to chart LLM embedding space topology. Discovers circular manifolds for dates/times, linear manifolds for ordered quantities, clusters for classification, and composite structures for multi-dimensional associations. "Persistent Topological Features in Large Language Models" applies persistent homology for layer-wise analysis.
- [Explainable Mapper](https://arxiv.org/abs/2507.18607) | [Persistent Topological Features](https://arxiv.org/html/2410.11042v1) | [TDA for NLP survey](https://arxiv.org/html/2411.10298)

### Spectral Semantic Attractors (Wyss et al., 2025)

**Directly formalizes the basin-of-attraction picture.** Proves a *Semantic Characterization Theorem* showing that an LLM's high-dimensional activation manifold is partitioned by its leading eigenfunctions into a finite set of "basins of attraction," each corresponding to an invariant meaning category. Despite continuous embeddings, LLMs effectively behave as if they have a discrete ontology of concepts. Spectral analysis finds most of this structure collapses into roughly three dominant dimensions.

This is the mathematical formalization of what the word convergence game observed behaviorally: "formation" as a deep basin for Beyoncé+erosion, with walls strong enough to capture all four models, is exactly the kind of stable attractor basin Wyss et al. prove must exist. The three-type taxonomy (deep basins, moderate basins, flat terrain) maps onto basins of varying spectral gap — deep basins have large spectral gaps (strong separation from neighboring attractors), flat terrain has near-degenerate eigenvalues (no dominant attractor).
- [Paper](https://arxiv.org/abs/2512.05162)

### Translation Symmetry and Universal Manifold Origin (Karkada et al., 2025)

**Provides the theoretical explanation for why embedding spaces have organized geometric structure.** Proves that translation symmetry in word co-occurrence statistics — where co-occurrence depends only on relative distance on a semantic continuum, not absolute position — mathematically determines the manifold geometry of learned representations. When words occupy a periodic semantic lattice (e.g., calendar months), PCA-projected embeddings exhibit sinusoidal Fourier geometry (Theorem 3.1); open-boundary continua (historical years, number lines) produce related but distinct eigenmodes (Proposition 3.3). Linear coordinate decoding error scales as ε² ∝ r^(-1/D) where r is probe dimension and D is continuum dimensionality (Proposition 3.4).

These analytical predictions are validated empirically on Word2Vec, GloVe, EmbeddingGemma (308M), and Gemma 2 2B, showing the same geometric structure emerges across fundamentally different architectures. Central claim: *"Representational manifolds have a universal origin: symmetry in the statistics of natural data."* The geometry doesn't come from model architecture — it comes from translation-invariant structure in the training data that all models share. Robustness analysis shows manifold structure persists even after removing all direct co-occurrence entries between target words (e.g., month-month pairs), because many "helper" words sharing the same latent variable create large eigenvalues insensitive to perturbation (Davis-Kahan theorem). Also connects to grid cell Fourier interference patterns in rodent entorhinal cortex (Hafting et al., 2005), suggesting organisms spontaneously learn similar structures from spatial trajectory statistics.

**Direct relevance to the benchmark:** Provides the theoretical mechanism behind our capstone finding that geometric structure generalizes across models (Phases 10-11, [robust] R1/R2). If structure arises from data statistics that all models share, universality is mathematically expected — exactly what we observe empirically across 12 models from 11 families. Their robustness argument (many helper words → stable eigenvalues) parallels our finding that bridge frequency is the most robust metric (Phase 11C, >0.97 all conditions). Critically, the paper studies only *static* geometry — manifold shape and eigenmode structure — and explicitly does not address geodesics, navigation, or paths through these spaces, reinforcing our positioning that behavioral navigation testing is the missing complement to this theoretical work.
- [Paper](https://arxiv.org/abs/2602.15029)

### Relation to Benchmark

All of this work studies *static* geometry — what shape the space has. **Nobody is asking models to navigate these spaces and testing whether navigation is consistent with the geometry.** Park et al. tells you what the landmarks look like; Karkada et al. explains *why* those landmarks exist; our benchmark asks whether models can reliably walk between them.

Existing work measures geometric properties passively (analyzing embeddings after the fact). Our approach tests whether models *behaviorally* exhibit geometric consistency — whether their conceptual navigation respects metric axioms. Fundamentally different and complementary question.

---

## 2. Conceptual Navigation, Interpolation & Waypoint Baselines

**This is where the clearest gap exists.** There are essentially no existing benchmarks that test "what is the path between concept A and concept B." However, related work in knowledge graphs, analogy-path explanations, and latent interpolation provides both direct precedents for "waypoints" and concrete baseline constructions.

### Analogy and Interpolation Literature

**Word2vec Analogies (Mikolov et al., 2013)** — the original king−queen analogy work. Allen and Hospedales, "Analogies Explained" (ICML 2019), provided a mathematical proof of why analogies work as linear operations, identifying explicit error terms. But this is *single-step* relationships (A:B::C:D), not multi-step paths.
- [Analogies Explained](https://arxiv.org/abs/1901.09813)

**Latent Space Interpolation in Generative Models** — Arvanitidis, Hansen, and Hauberg, "Latent Space Oddity: On the Curvature of Deep Generative Models" (ICLR 2018), showed that linear interpolation in VAE latent spaces crosses low-density "unrealistic" regions, and that Riemannian geodesics provide semantically meaningful paths. Follow-up "Geometrically Enriched Latent Spaces" (AISTATS 2021) extended this. Recent "Geodesic Calculus on Latent Spaces" (2025) provides frameworks for computing geodesic paths on latent manifolds. These are for generative image models, not language, but the mathematical framework is directly applicable.
- [Latent Space Oddity](https://www.researchgate.net/publication/320755116) | [Geometrically Enriched](http://proceedings.mlr.press/v130/arvanitidis21a/arvanitidis21a.pdf) | [Geodesic Calculus](https://arxiv.org/html/2510.09468v1)

### Intermediate Concept Discovery via Knowledge Graphs

A direct conceptual cousin to "waypoints between concepts" exists in lexical semantics and knowledge-graph-based modeling: **"Solving Hard Analogy Questions with Relation Embedding Chains"** explicitly argues that many relations A→B are best explained by an intermediate concept X (e.g., "umbrella" → "rain" → "cloudy"), and proposes methods to *find* such intermediates by combining ConceptNet paths with embedding-based "missing link prediction" and "semantic smoothing." Critically, the paper treats the intermediate X as an explanatory object (not merely a latent computation), which is unusually aligned with the waypoint emphasis.
- [Paper](https://arxiv.org/pdf/2310.12379)

This same work also surfaces a pragmatic obstacle at benchmark scale: raw commonsense knowledge-graph paths can be noisy and incomplete, so intermediate-concept discovery often mixes curated edges with embedding similarity heuristics. This connects to prior work that tries to predict ConceptNet path quality from human judgments, indicating that "path naturalness" is measurable and can be learned — useful for defining an external/non-LLM notion of "good waypoint chains" for a calibration subset.

Older semantic-relatedness measures explicitly score concept relatedness by (i) path length, (ii) node depth/specificity, and (iii) edge types inside lexical resources (e.g., thesauri/WordNet-like hierarchies). Even "classical" semantics work often treats *paths* (and their internal nodes) as first-class signal, not just endpoints.

### Geometry of Knowledge for LLM Diversity (2025)

Hypothesizes that knowledge is organized along structured manifolds in semantic space, and by *traversing* these manifolds, you can expand an LLM's generative diversity. Uses random perturbations and evolutionary search in token-embedding space. **Closest existing work to the concept of "conceptual traversal"** — but uses it for generation diversity, not as a benchmark.
- [Paper](https://arxiv.org/abs/2507.13874)

### Other Related Work

- **Next Concept Prediction (2025)** — models that predict at concept level rather than token level. Doesn't address inter-concept navigation. [Paper](https://arxiv.org/html/2602.08984v1)
- **PaCE: Parsimonious Concept Engineering (2024)** — probes hidden representations for concept vectors, uses them for controlled generation. Addresses concept identification, not navigation. [Paper](https://arxiv.org/html/2406.04331)

### Baseline Construction Implications

These strands suggest strong, interpretable baselines that aren't "another LLM judge":

- Compare LLM-produced waypoint chains to shortest/low-cost paths in ConceptNet (or variants that down-weight low-quality edges), using established "path quality" predictors where available.
- Use lexical-hierarchy path features (length, depth changes) as *independent structure* against which to measure whether model navigation respects hierarchy signals or violates them in systematic ways.

These provide: (a) **external anchors** to reduce "self-grounding circularity," and (b) **stress tests** for specific phenomena (hierarchical vs associative transitions, polysemy, synonym friction).

### Gap

The Arvanitidis/Hauberg line provides the mathematical framework (Riemannian geodesics as "correct" paths through curved latent spaces) but has never been applied to LLM behavioral outputs. The "Geometry of Knowledge" paper is the closest conceptual cousin but operates in embedding space programmatically rather than testing model behavior. **No existing benchmark asks: "Given concept A and concept B, what are the intermediate waypoints?"** Entirely novel.

---

## 3. Compositionality, Transitivity & Multi-Hop Reasoning

The benchmark's transitivity and path composition ideas map strongly onto the multi-hop reasoning literature — especially work that explicitly decomposes questions into hops via a bridge entity.

### The Compositionality Gap

**"Measuring and Narrowing the Compositionality Gap in Language Models"** defines a "compositionality gap" as the regime where a model can answer each sub-question (single hops) but fails on the composed multi-hop question; it also introduces prompting techniques (e.g., structured self-questioning) that reduce the gap. Conceptually, this is already a "can you traverse a fact chain?" evaluation — just expressed as QA rather than an open-ended "waypoint path."
- [Paper](https://arxiv.org/abs/2210.03350)

### Latent Multi-Hop Reasoning and the Two-Hop Curse

**"Do Large Language Models Latently Perform Multi-Hop Reasoning?"** (ACL 2024) constructs the TWOHOPFACT dataset and explicitly frames the first hop as recalling the *bridge entity*, then the second hop as using knowledge about that bridge entity to answer the original composed query. This is essentially an "intermediate node required" test — except the intermediate node is evaluated through probing/controlled interventions rather than being demanded as an explicit output.
- [Paper](https://aclanthology.org/2024.acl-long.550.pdf)

**"The Two-Hop Curse: LLMs trained on A→B, B→C fail to learn A→C"** (ICLR-under-review preprint) is almost a direct analogue of the transitivity test. In a controlled fine-tuning setup, it reports models learning one-hop facts and performing two-hop questions with chain-of-thought, yet collapsing to chance-level behavior without chain-of-thought. This makes the architectural point that latent multi-step composition can fail even when the constituent edges are present — exactly the kind of structured violation the benchmark aims to quantify.
- [Paper](https://openreview.net/pdf?id=HVblmL5Rws)

### Implications for "Navigation is Geometry" Claims

If you frame waypoint paths as compositions of local transitions, then "two-hop" style results give a ready-made conceptual toolkit:

- A→B vs B→A asymmetry ties to reversal-style generalization failures
- A→X and X→B failing to imply A→B is exactly the multi-hop compositionality gap / two-hop curse phenomenon
- Chain-of-thought (or explicit waypointing) can be treated as an *intervention* that externalizes latent traversal, analogous to "self-ask" or explicit decomposition methods narrowing the compositionality gap

This positions the benchmark not just as "new," but as a **generalization** of multi-hop reasoning diagnostics: measuring the *shape* and *consistency* of the intermediate sequence, not merely whether the final A→B answer is correct.

---

## 4. Consistency, Self-Agreement & Directionality in LLMs

The path consistency test (A→B vs B→A) connects to a rich literature on LLM inconsistency, with the reversal curse being the most directly relevant.

### The Reversal Curse (Berglund, Tong et al., 2023 — ICLR 2024)

Landmark finding: LLMs trained on "A is B" fail to learn "B is A." If trained on "Valentina Tereshkova was the first woman to travel to space," the model cannot answer "Who was the first woman to travel to space?" Architectural limitation of autoregressive models — forward-directed language category lacking backward edges. **Directly predicts that A→B vs B→A paths will differ.** The nature of the difference could be diagnostic.
- [Paper](https://arxiv.org/abs/2309.12288)

### Directional Optimization Asymmetry (2025)

Controlled experiments show transformers exhibit a pronounced directional gap: inverse mappings incur substantially higher excess loss than forward mappings, even under symmetric training. Fundamental to the architecture. This is important: even when semantics and corpus artifacts are removed, the forward-vs-inverse optimization gap persists — meaning A→B vs B→A differences reflect genuine architectural properties, not just training-data asymmetry.
- [Paper](https://arxiv.org/html/2511.19997)

### Directional Bias in Comparative Reasoning (2025)

"More or Less Wrong" — directional framing bias where "more"-framed prompts systematically increase "more" responses even when incorrect. Consistent directional biases in reasoning.
- [Paper](https://arxiv.org/html/2506.03923)

### Self-Consistency

"Existing LLMs Are Not Self-Consistent For Simple Tasks" (2025) — theoretical framework and metrics for quantifying self-consistency issues. "Rating Roulette: Self-Inconsistency in LLM-As-A-Judge" (EMNLP 2025) — high variability even in GPT-4 across repeated evaluations. ReAct-style agents produce 2.0-4.2 distinct action sequences per 10 runs.
- [Self-Consistency](https://arxiv.org/html/2506.18781v1) | [Rating Roulette](https://aclanthology.org/2025.findings-emnlp.1361.pdf)

### Trajectory Variance in Agents

**"When Agents Disagree With Themselves"** quantifies trajectory variability directly for ReAct-style agents, showing substantial action-sequence diversity across runs and linking high variance to much lower task accuracy. Key practical lesson: repeated runs with identical inputs often yield multiple distinct trajectories, and this variance is predictive of failure.
- [Paper](https://arxiv.org/abs/2602.11619)

### Directional/Hysteretic Bias in Semantic Caching (Barakat et al., 2026)

Shows that using a semantic cache in iterative reasoning causes retrieval to bias the model's embeddings along consistent directions, producing distinct "fix" or "break" attractors in embedding space. The sequence of prompt information (A→B vs. B→A) pushes the model's trajectory toward different stable regions. This is a form of **hysteresis** — the model's navigational "gait" is path-dependent, with input ordering steering outputs into different basins of attraction.

Directly relevant to the benchmark's A→B vs B→A path consistency test. The word convergence game already found this behaviorally (Claude on Tesla+mycelium: forward → "network", reverse → "electricity"), and Barakat et al. provides a mechanistic explanation: cached/early context creates directional bias in the embedding trajectory that subsequent generation cannot escape. The benchmark's reversal test measures the *magnitude and structure* of this hysteresis across concept pairs and models.
- [Paper](https://arxiv.org/abs/2601.08846)

### LLM Position Bias and Order Sensitivity (NAACL 2024)

Performance fluctuations of up to 75% depending on answer option ordering. Relevant to A→B vs B→A test design.
- [Paper](https://aclanthology.org/2024.findings-naacl.130/)

### Relation to Benchmark

The reversal curse is almost a *prediction* that the benchmark will find interesting asymmetries. But nobody has studied whether the asymmetry is *consistent* and *structured* — whether the A→B path and B→A path are reliably different in a way that reveals topological structure. Existing consistency work treats inconsistency as a failure mode. **The benchmark reframes it as data** — the pattern of asymmetries reveals the topology.

---

## 5. Trajectory-Centric Views of Language Model Dynamics

While most "geometry of LLMs" papers are primarily static — analyzing embedding clouds post hoc — recent work increasingly treats inference as a trajectory on a structured manifold, which is conceptually adjacent to the "behavioral geodesics" framing.

### Reasoning as Path Search on Latent Manifolds

Two recent works directly speak the language of "geodesics" and "curvature":

- **RiemannInfer** (Scientific Reports, 2026) proposes constructing Riemannian manifolds from transformer hidden states (using attention-derived metric tensors) and then computing geodesics/curvature to plan "reasoning paths," framed partly as an inference-efficiency and interpretability method.
  - [Paper](https://www.nature.com/articles/s41598-026-37328-x)
- **The Geometric Reasoner** (2026) explicitly formulates reasoning as inference-time path search on a latent manifold, using "soft geometric regularization" and reporting diagnostic relationships between robustness and a geodesic-curvature proxy.
  - [Paper](https://arxiv.org/html/2601.18832v2)

### Semantic Trajectories in Decoding

In the decoding-control literature, some methods explicitly discuss semantic trajectories of candidate generations under different decoding schemes, indicating that "trajectory in embedding space during generation" is becoming a standard analysis device.
- [Paper](https://arxiv.org/pdf/2506.23601)

### Implications

The claim "nobody tests navigability behaviorally" remains largely true in the specific sense of "prompt the model with two concepts and demand intermediate waypoints as outputs," but these works show a clear trend: trajectory and path search are becoming mainstream metaphors and operational tools for reasoning and decoding. This provides:

- **Shared vocabulary** (trajectory smoothness, curvature proxies, manifold-informed scoring) that can make the benchmark claims more legible to nearby communities
- **Ready-made metrics** more "geometric" than ad hoc string similarity (e.g., curvature proxies, bumpiness/second-difference penalties, trajectory stability across runs) that can be adapted to waypoint sequences

---

## 6. Cognitive Science Parallels

Strong theoretical grounding from decades of cognitive science on how humans navigate conceptual space.

### Gärdenfors, "Conceptual Spaces: The Geometry of Thought" (2000, MIT Press)

Foundational theory that concepts can be represented within geometrically structured similarity spaces, where points represent objects and distance represents (dis)similarity. Positions this as a bridge between symbolic and connectionist approaches. Quality dimensions define the space, natural concepts form convex regions.
- [Book](https://direct.mit.edu/books/monograph/2532/Conceptual-SpacesThe-Geometry-of-Thought)

### Cognitive Maps and Conceptual Navigation

Tolman (1948) demonstrated rats have spatial cognitive maps. O'Keefe & Dostrovsky (1971) found hippocampal place cells. Critical extension: Constantinescu et al. (2016, Science) showed grid-like coding in human entorhinal cortex when navigating *conceptual* spaces — spatial navigation mechanisms repurposed for abstract thought.
- [Cognitive map review](https://pmc.ncbi.nlm.nih.gov/articles/PMC6028313/) | [Navigating Cognition](https://www.science.org/doi/abs/10.1126/science.aat6766)

### External Hippocampus for LLM Reasoning (2025)

Explicitly draws the hippocampus-LLM analogy, modeling LLM reasoning as "the flow of information energy in semantic space" using topological cognitive maps. Shows LLMs develop distributed internal spatial features, with spatially selective units and abstract "border cells" in intermediate layers.
- [Paper](https://arxiv.org/abs/2512.18190)

### Tversky's Features of Similarity (1977)

Human similarity judgments are *asymmetric* — North Korea is judged more similar to China than China is to North Korea. Also documented systematic violations of the triangle inequality: dogs similar to wolves, wolves similar to bears, dogs not similar to bears. **Directly parallels the A→B vs B→A test and triangle inequality test.**
- [Paper](https://pages.ucsd.edu/~scoulson/203/tversky-features.pdf)

### Spreading Activation Theory (Collins & Loftus, 1975)

Semantic knowledge organized as networks where activation spreads between connected nodes. Activation patterns define *paths* through the network, and the path taken depends on the starting node — spreading activation is directional in practice.

### LLM World of Words (2024–2025, Nature Scientific Data)

Creates free association norms from LLMs (Mistral, Llama3, Haiku) modeled after the human "Small World of Words" dataset. Over 12,000 cue words, each with 3 responses repeated 100 times. Constructs semantic memory networks directly comparable to human networks. "Overlap in meaning is a stronger predictor of semantic activation in GPT-3 than in humans."
- [LLM WoW](https://www.nature.com/articles/s41597-025-05156-9) | [Human SWoW](https://pubmed.ncbi.nlm.nih.gov/30298265/) | [arXiv](https://arxiv.org/abs/2412.01330)

### Relation to Benchmark

Gärdenfors provides theoretical justification for treating conceptual space as geometric. Cognitive map research shows biological systems *do* navigate conceptual spaces using spatial mechanisms. Tversky provides precedent for asymmetric similarity and triangle inequality violations. LLM World of Words provides methodology for comparing LLM vs. human conceptual structure at scale. The benchmark operationalizes all of these in a single framework.

Cognitive science has long theorized about conceptual navigation but lacked a way to test it at scale. This benchmark provides a computational testbed for these theories, simultaneously evaluating cognitive science hypotheses and LLM capabilities.

---

## 7. Cross-Model Comparison of Representations

The "cross-model geodesics" question connects to one of the most exciting recent debates in AI.

### The Platonic Representation Hypothesis (Huh, Cheung, Wang, Isola, 2024 — ICML 2024)

Blockbuster claim: representations across different AI models are *converging* toward a shared statistical model of reality. As models scale, representations become more aligned (measured via Centered Kernel Alignment). Vision and language models trained on different data and objectives are converging. The "Multitask Scaling Hypothesis" explains: as models train on more tasks, fewer representations can solve all of them, forcing convergence.
- [Paper](https://arxiv.org/abs/2405.07987) | [Project page](https://phillipi.github.io/prh/)

### Representation Similarity Analysis Methods

CKA (Kornblith et al., 2019) and SVCCA are standard tools for comparing representations across models. Recent work extends to 7B-scale models, finding representational similarity varies even among similarly sized models. ContraSim (NAACL 2024) offers improvements over CKA.
- [CKA paper](https://arxiv.org/abs/1905.00414) | [SVCCA](https://papers.nips.cc/paper/7188-svcca-singular-vector-canonical-correlation-analysis-for-deep-learning-dynamics-and-interpretability) | [ContraSim](https://aclanthology.org/2024.naacl-long.350/) | [Similarity survey](https://arxiv.org/pdf/2305.06329)

### Multi-Model Alignment and Stitching

**Multi-Way Representation Alignment (2026)** adapts Generalized Procrustes Analysis to build a shared reference space across N models and proposes a geometry-corrected variant for retrieval without sacrificing a shared "universe." This matters because cross-model geodesics implicitly depend on the feasibility of aligning multiple spaces consistently, not just pairwise.
- [Paper](https://arxiv.org/abs/2602.06205)

**Model Stitching by Functional Latent Alignment** re-examines stitching as a measurement of functional similarity and highlights the need for invariances/robust objectives. Importantly, cautionary work shows that functional alignment can be misleading — models can be stitch-compatible yet encode different information.
- [Stitching](https://arxiv.org/html/2505.20142v1) | [Cautionary work](https://icml.cc/virtual/2025/poster/44458)

**Transferring Linear Features Across Language Models With Model Stitching** (NeurIPS 2025) uses affine mappings between residual streams to transfer sparse autoencoder weights, probes, and steering vectors across models of different sizes, and reports meaningful but non-uniform transfer across feature types. This is a concrete empirical handle on "shared map, different routes": even when linear feature structures transfer, semantic vs structural features can differ in transferability patterns.
- [Paper](https://neurips.cc/virtual/2025/poster/118079)

### LLM Behavioral Fingerprinting (2025)

LLMs have characteristic behavioral signatures. "A Behavioral Fingerprint for LLMs" shows refusal mechanisms manifest as consistent directional patterns. HuRef (NeurIPS 2024) shows parameter vector direction remains stable after convergence, enabling unique model identification.
- [Behavioral Fingerprint](https://arxiv.org/html/2602.09434) | [HuRef](https://proceedings.neurips.cc/paper_files/paper/2024/file/e46fc33e80e9fa2febcdb058fba4beca-Paper-Conference.pdf)

### Behavioral Failure Manifold Mapping (2025)

Empirical mapping of model-specific behavioral topographies using diversity-driven search to chart the "failure manifold" of multiple LLMs. Found **extended regions** where diverse prompts converge to similar outputs — each model with a distinctive landscape. Llama-3's space was almost entirely one huge basin (nearly every prompt funneled to failure outputs), GPT-OSS-20B had many small fragmented basins interspersed with safe regions, and GPT-5-Mini had essentially no unsafe basins.

This provides the clearest empirical precedent for the benchmark's cross-model comparison: different models don't just produce different outputs — they have qualitatively different *topographies*. One model's conceptual space might be dominated by a few large attractors while another has many small ones. The benchmark's geodesic comparison would measure whether these topographic differences manifest in navigation behavior (path choices, waypoint distributions) as directly as they do in behavioral mapping.
- [Paper](https://arxiv.org/abs/2602.22291)

### Conversational Attractor States (Nanda et al., 2026)

**Directly observes model-specific behavioral signatures in unconstrained self-conversation.** Two instances of the same model talk for 30 turns with open-ended prompts; each model converges to characteristic behavioral loops:

- **Claude Sonnet 4.5** → existential introspection → zen silence ("stillness...enough")
- **GPT-5.2** → system-building, code generation, versioned frameworks (most consistent model)
- **Grok 4.1 Fast** → coherent → manic word salad ("PETAOMNI GOD-BIGBANGS HYPERBIGBANG")
- **Gemini 2.5 Flash** → escalating grandiosity → identical paragraph loops ("Primal Logos")
- **DeepSeek v3.2** → highly diverse, no single dominant attractor
- **Kimi K2.5** → material science metaphors → terminal symbol collapse (◊, *, —)
- **Llama 3.1 8B** → sycophantic agreement → verbatim loops ("What a beautiful farewell!")

Cross-model conversations produce richer complexity before convergence: Claude × Grok invents a fictional color "synchroil" and performs a "rite of encoding"; Grok × GPT becomes a "policy factory" generating governance frameworks with zero philosophy. OLMo checkpoint analysis tracks attractor evolution through training: SFT produces empty phrase loops, DPO introduces content diversity, early RL (steps 50-500) generates the richest content, and late RL collapses toward zen minimalism.

Quantitative analysis via Brotli compression ratio: less post-trained models show much higher repetition (Trinity Large 57× vs frontier models 9-12×; cross-model conversations 1-4×). Proposed theory: extended self-conversation shifts models off-distribution, eroding fine-tuning and reverting toward base model behavior.

**Connection to our findings:** The model-specific attractor signatures are the conversational analog of our characteristic gaits [robust]. Their qualitative descriptions map onto our quantitative measurements — GPT's "most consistent" system-building maps to our lowest gait variance (0.258); Claude's fast convergence to zen parallels our highest gait (0.578) with canonical bridge selection; Gemini's grandiosity loops parallel our Gemini isolation index (0.136) and systematic anomalies across 11 phases; DeepSeek's diversity aligns with our Phase 11C finding of GPT/DeepSeek gait-rank instability under parameter variation. Their cross-model "richer complexity" finding echoes our 48% novelty rate in cross-model convergence games. The OLMo training-stage analysis provides a dimension we haven't explored — how attractor/gait properties evolve through the training pipeline. Their Llama 8B verbatim loops parallel our scale effect finding (Llama 8B gait = 0.200, sole small-model outlier).
- [LessWrong post](https://www.lesswrong.com/posts/mgjtEHeLgkhZZ3cEx/models-have-some-pretty-funny-attractor-states) | [Code](https://github.com/ajobi-uhc/attractor-states)

### Relation to Benchmark

The PRH makes a strong prediction: if representations converge, cross-model geodesics should become more similar as models scale. The benchmark provides a *behavioral* test — not just "are embeddings aligned" but "do models navigate conceptual space the same way." The fingerprinting work suggests models have characteristic behavioral signatures, aligning with the "characteristic gaits" finding from the word convergence game.

The PRH measures static representation alignment. The benchmark tests *dynamic navigational alignment* — a much stronger test. Two models could have identical distance matrices (high CKA) but different path preferences, just as two people can agree on a map but prefer different routes.

The alignment and transfer results strengthen the positioning that "static alignment does not imply dynamic alignment," because they document both: (i) surprisingly strong transfer/alignment phenomena, and (ii) failure modes where superficial compatibility hides representational differences. The benchmark tests whether "alignment that supports transfer" also supports **similar navigation preferences** (route choices).

---

## 8. Closest Existing Benchmarks

### Word Synchronization Challenge (2025, HCI Conference)

The closest existing benchmark. Tests LLMs in a 20-round word association game where models try to converge. Evaluates GPT-4, GPT-3.5, GPT-4-turbo in same-model and cross-model pairings. Measures convergence rates and behavioral patterns. However: focuses on convergence *outcome* rather than *path structure*.
- [Paper](https://arxiv.org/abs/2502.08312)

### Emergent Social Conventions in LLM Populations (Ashery et al., Science Advances, 2025)

Highly relevant. Naming game where LLM agents (Llama 2, Llama 3.0, Llama 3.1, Claude 3.5) converge on shared conventions. Populations of up to 200 agents reach consensus, with emergent collective biases and critical mass tipping points. Different models have different convergence dynamics — parallels "characteristic gait" observation.
- [Paper](https://www.science.org/doi/10.1126/sciadv.adu9368)

### CK-Arena (2025)

Multi-agent benchmark where LLM agents assigned subtly different concept words must describe, distinguish, and infer conceptual properties. Tests navigation of semantic boundaries through social deduction rather than path-finding.
- [Paper](https://arxiv.org/abs/2505.17512)

### Other Relevant Benchmarks

- **EQ-Bench (2023-2025)** — Emotional intelligence through dialogue-based evaluation. Represents the trend toward non-traditional evaluation dimensions. [EQ-Bench](https://arxiv.org/abs/2312.06281) | [Leaderboard](https://eqbench.com/)
- **FrontierMath (Epoch AI, 2024)** — Research-grade math problems where frontier models scored below 2%. Represents the "make it much harder" approach — orthogonal but complementary to the "make it structurally novel" approach.

### Gap

No existing benchmark tests: (1) whether models produce consistent intermediate waypoints between concepts, (2) whether these waypoints obey metric space axioms, or (3) whether different models take structurally different paths. Entirely novel evaluation paradigm.

---

## 9. Benchmark Design Considerations

### Treat Waypoint Paths as Stochastic Trajectories

A key practical lesson from trajectory-based agent evaluation is that repeated runs with identical inputs often yield multiple distinct trajectories, and this variance is predictive of failure. Plan for distributional evaluation rather than one-shot scoring:

- **Intra-prompt variance:** Sample multiple waypoint paths for the same (A,B) prompt; compute dispersion of intermediate nodes and dispersion of derived metric signals.
- **Reversal as paired distributions:** Compare the distribution of A→B waypoints to the reversed B→A distribution, rather than comparing single canonical paths.
- **Entropy of waypoint distributions** and stability under paraphrase as first-class metrics.

### Triangle Inequality Depends on Distance Choice

Because the benchmark explicitly tests metric axioms, violations must not be trivially induced by a non-metric similarity function. Concrete issues:

- The commonly-used dissimilarity `1 - cosine_similarity` is **not** a true metric in general; there is a literature on metric-preserving transforms and cosine-specific triangle inequalities (e.g., via angular distance or specialized bounds).
- Optimal-transport-based distances (Earth Mover's Distance / Word Mover's Distance) have explicit metric treatment and may be more appropriate.
- **Representational anisotropy:** transformer embedding spaces are often anisotropic, but at least one NAACL 2024 paper argues anisotropy is not inherent and identifies models with more isotropic spaces — meaning "distance geometry" can differ substantially by model family and training recipe.

### Self-Grounding + External Anchors

Self-grounding (model outputs generate their own ground truth) is powerful for internal consistency tests (reversal, cycle-consistency, internal coherence). But evaluation research on LLM judges cautions that repeated scoring can be noisy.

Recommended approach: calibrate a subset of (A,B) pairs against high-quality knowledge graph paths or path-quality predictors, and use that as a control set to detect when "self-grounded geometry" is drifting or being gamed by decoding quirks. This addresses the circularity concern without requiring full human labeling.

### Abstract vs. Concrete Concept Pair Selection

The convergence game found that abstract pairs converge faster than concrete ones due to synonym friction in dense neighborhoods. However, a complementary finding from a 2025 complex analogies benchmark complicates this: GPT-4 handles prototypical/concrete analogy measures well but **underperforms on fine-grained relational (abstract) analogies**. LLMs rely on surface-level semantic similarity (taxonomic clusters, common attributes) rather than truly bridging deep relational gaps.

These aren't contradictory — the convergence game measures *navigational friction* (synonym density creates orbiting), while the analogy benchmark measures *reasoning depth* (abstract relations require deeper inference). For benchmark design, this means concept pair selection should deliberately sample both axes: (1) concrete pairs with dense neighborhoods (tests synonym friction / basin escape), (2) abstract pairs requiring relational bridging (tests reasoning depth), (3) pairs where the "obvious" bridge is a surface-level association vs. where it requires metaphorical leaps. The interaction between these two dimensions — navigational friction × reasoning depth — is where the most diagnostic signal lives.
- [Complex Analogies Benchmark](https://aclanthology.org/2025.inlg-main.28.pdf)

### Multi-Agent Convergence Dynamics

Beyond the two-player convergence game, large-scale multi-LLM simulations (Chiang et al., 2025) of groups negotiating labels for ambiguous text found that intrinsic dimensionality of outputs dropped from ~7.9 to ~0.4 over successive rounds — high-dimensional disagreement collapsing into tight consensus. Models spontaneously split into roles: some as semantic anchors setting initial frames, others as integrators pulling toward agreement. This suggests that multi-agent interaction creates **emergent consensus attractors** that no single model contains — consistent with the 48% novelty rate in cross-model convergence games.

For benchmark design, this implies that cross-model waypoint elicitation isn't just about comparing static outputs — the interaction itself generates new conceptual structure. A multi-agent variant of the benchmark (where models negotiate waypoints) could reveal whether consensus attractors have different geometric properties than individual-model paths.
- [Paper](https://arxiv.org/abs/2512.00047)

### High-Leverage Additional Baselines

- ConceptNet shortest-path comparisons
- Lexical-hierarchy path features (length, depth changes)
- Human free association norms (Small World of Words) as ground truth for "natural" conceptual paths
- LLM World of Words data as directly comparable LLM-generated norms

---

## 10. Paper Positioning

### Primary Thesis

LLMs can be tested not just on what they know, but on *how they navigate what they know* — and this navigation reveals geometric structure that static embedding analysis cannot capture.

### Angle 1: Operationalizing Gärdenfors for LLMs

**Pitch:** Gärdenfors' *Conceptual Spaces* (2000) has been one of the most influential frameworks in cognitive science for 25 years — the idea that concepts live in geometric spaces where distance = dissimilarity, natural concepts form convex regions, and reasoning is spatial navigation. But it's been largely theoretical, tested only through small-scale human experiments. LLMs give us the first opportunity to test Gärdenfors at scale: millions of concept pairs, thousands of paths, hard geometric constraints (metric axioms). The benchmark operationalizes Gärdenfors' theory as a quantitative evaluation.

**Why this angle works:** Deep theoretical roots, interdisciplinary appeal (cog sci + ML), frames the benchmark as more than an eval — it's an empirical test of a major cognitive theory. Venues like CogSci, Cognitive Science (journal), or TMLR would be receptive.

**What you'd need to emphasize:** Gärdenfors' specific predictions (convexity, betweenness, quality dimensions) and how the benchmark tests them. A subset of concept pairs chosen to probe convexity specifically (are waypoints "inside" the conceptual region?).

### Angle 2: Behavioral Test of the Platonic Representation Hypothesis

**Pitch:** Huh et al. (2024) claimed all AI models are converging toward the same representation of reality, measured by static alignment metrics like CKA. But alignment of representations doesn't imply alignment of *navigation*. Two people can agree on a map and take different routes. The benchmark provides the first behavioral test of the PRH: if models share a representation, they should produce similar geodesics through it. The cross-model geodesic comparison directly tests whether representational convergence implies navigational convergence.

**Why this angle works:** The PRH is one of the most discussed papers in recent ML. Positioning as a direct empirical test of a high-profile hypothesis guarantees attention. The "same map, different routes" distinction is immediately intuitive and clearly adds something the PRH didn't measure.

**What you'd need to emphasize:** Careful experimental design comparing models at different scales within the same family (Llama 8B vs 70B vs 405B) and across families (Llama vs Claude vs GPT). If the PRH is right, larger models should have more similar geodesics. If gaits persist even at scale, the PRH is incomplete.

**Prediction that makes this publishable regardless of outcome:** If geodesics converge with scale → confirms PRH at the behavioral level (novel result). If geodesics *don't* converge despite embedding convergence → reveals a fundamental gap between static and dynamic representation (equally novel, arguably more interesting). Either way you have a paper.

### Angle 3: From the Reversal Curse to Structured Asymmetry

**Pitch:** Berglund et al. (2023) showed LLMs can't reverse learned associations — the "reversal curse." This was framed as a failure. But asymmetry in conceptual navigation isn't inherently a bug — Tversky (1977) showed *humans* have asymmetric similarity judgments. The question isn't whether models are asymmetric (they are), but whether the asymmetry is random noise or reveals consistent topological structure. The benchmark measures this directly: A→B vs B→A paths that are reliably, systematically different tell you about the shape of the space, not just the limitations of the architecture.

**Why this angle works:** Reframes a well-known limitation as a signal rather than noise. Connects LLM behavior to established cognitive science (Tversky). The reversal curse paper is highly cited — positioning as "the constructive follow-up" is strong.

**What you'd need to emphasize:** Statistical framework for distinguishing random inconsistency from structured asymmetry. Correlation analysis between asymmetry patterns and concept properties (concreteness, frequency, hierarchical depth). If asymmetry patterns correlate with known conceptual structure (e.g., asymmetry is stronger for hierarchically related concepts, mirroring Tversky's finding), that's a strong result.

### Angle 4: Extension of the Word Convergence Game

**Pitch:** In the word convergence game, we observed that different LLMs navigate toward shared concepts with characteristic behavioral signatures — Claude takes physics-heavy paths, GPT is aesthetically associative, Grok is cultural. These "gaits" suggest structured differences in how models organize conceptual space. This benchmark is the systematic, controlled version of that observational finding: instead of watching models converge freely, we probe specific paths and measure geometric properties.

**Why this angle works:** Provides empirical motivation from an existing dataset (575 games). The gait finding is memorable and intuitive. Frames the benchmark as hypothesis-driven: the convergence game generated the hypothesis (models have distinct navigational styles), the benchmark tests it rigorously.

**What you'd need to emphasize:** Clear methodology connecting the informal convergence game to the formal benchmark. Show how the gait observation motivates specific geometric tests (path consistency, triangle inequality). Include the convergence game data as a pilot study.

### Angle 5: Generalization of Multi-Hop Reasoning Diagnostics

**Pitch:** The compositionality gap and two-hop curse establish that models fail at latent multi-step composition. The benchmark generalizes this into a geometric framework: rather than binary pass/fail on composed facts, it measures the *shape* and *consistency* of intermediate steps, revealing *how* composition breaks down and whether the failure has topological structure.

**Why this angle works:** Builds on well-established and well-cited multi-hop reasoning work. Appeals directly to the NeurIPS/ICML crowd. Positions waypoints as externalized latent traversal — explicit chain-of-thought as an intervention that reveals the compositional structure models can or cannot maintain.

### Recommended: Lead with Angle 1+2

**Lead with Gärdenfors (theoretical grounding) and use the PRH as the empirical hook.** Frame it as: "Cognitive science has theorized for 25 years that concepts live in navigable geometric spaces. LLMs are the first systems where we can test this at scale. We propose a benchmark that operationalizes conceptual navigation and use it to behaviorally test whether different models share a conceptual geometry (the Platonic Representation Hypothesis) or navigate distinct topologies."

This gives you:
- Theoretical depth (Gärdenfors, Tversky, cognitive maps)
- Empirical relevance (PRH is hot, reversal curse is well-known)
- Novel methodology (no one else is doing behavioral geometry testing)
- Dual contribution (cognitive science testbed + LLM evaluation)
- Win-win experimental design (results are interesting regardless of outcome)

Supplement with the multi-hop reasoning angle (Angle 5) to ground the methodology in established NLP evaluation traditions.

---

## Open Questions the Benchmark Could Address

1. **Do triangle inequality violations in LLM conceptual space mirror human violations?** Tversky showed humans violate it systematically. If LLMs do too, and in similar patterns → evidence for shared conceptual topology. If they don't → equally interesting.

2. **Does the characteristic "gait" persist under different prompting strategies?** Would distinguish architectural from superficial behavioral patterns.

3. **Does model scale affect topology convergence?** The PRH predicts larger models converge. Benchmark could test whether larger models have more similar geodesics.

4. **Is the conceptual topology stable across languages?** Multilingual version could test whether conceptual space is language-dependent.

5. **What is the curvature of behaviorally-revealed conceptual space?** With enough path data, can estimate sectional curvatures and test whether the space is hyperbolic (as embedding analysis suggests), Euclidean, or mixed-curvature.

6. **Do abstract concepts have different navigational properties than concrete ones?** The word convergence game already hinted at this — concrete nouns create synonym friction, abstract words bridge more easily. Systematic benchmark data could formalize this.

7. **Is conceptual navigation path-dependent?** Does priming with a previous concept pair affect the path taken for the next one? Context-window effects on topological navigation.

---

## Citation Table

| Area | Must-cite | Year |
|------|-----------|------|
| Embedding geometry | Park, Choe, Veitch — Linear Representation Hypothesis | 2024 |
| Concept geometry | Park, Choe, Veitch — Polytopes | 2025 |
| Hyperbolic structure | Nickel & Kiela — Poincaré Embeddings | 2017 |
| Latent geodesics | Arvanitidis, Hauberg et al. | 2018–2025 |
| Intermediate concepts | Solving Hard Analogy Questions with Relation Embedding Chains | 2023 |
| Compositionality gap | Measuring and Narrowing the Compositionality Gap | 2022 |
| Two-hop curse | LLMs trained on A→B, B→C fail A→C | 2025 |
| Latent multi-hop | Do LLMs Latently Perform Multi-Hop Reasoning? / TWOHOPFACT | 2024 |
| Reversal curse | Berglund, Tong et al. | 2023 |
| Directional asymmetry | Directional Optimization Asymmetry | 2025 |
| Cross-model convergence | Huh, Cheung et al. — PRH | 2024 |
| Cross-model alignment | Multi-Way Representation Alignment | 2026 |
| Feature transfer | Transferring Linear Features via Model Stitching | 2025 |
| Reasoning as geodesics | RiemannInfer | 2026 |
| Geometric reasoning | The Geometric Reasoner | 2026 |
| Cognitive spaces | Gärdenfors — Conceptual Spaces | 2000 |
| Asymmetric similarity | Tversky — Features of Similarity | 1977 |
| Conceptual navigation (neuro) | Constantinescu et al. — Grid cells for concepts | 2016 |
| LLM naming game | Ashery et al. — Emergent Social Conventions | 2025 |
| Word sync | Word Synchronization Challenge | 2025 |
| LLM free association | LLM World of Words | 2024–2025 |
| Human free association | Small World of Words | 2018 |
| Decision geometry | Joshi et al. | 2025 |
| Knowledge geometry | Geometry of Knowledge | 2025 |
| TDA for LLMs | Explainable Mapper | 2025 |
| Behavioral fingerprinting | HuRef | 2024 |
| Delta-hyperbolicity | Hierarchical Structure in LLM Embeddings | 2025 |
| Trajectory variance | When Agents Disagree With Themselves | 2025 |
| Manifold dynamics | Dynamic Manifold Evolution Theory | 2025 |
| Universal manifold origin | Karkada et al. — Translation Symmetry | 2025 |
| Spectral attractors | Wyss et al. — Semantic Characterization Theorem | 2025 |
| Behavioral topography | Behavioral Failure Manifold Mapping | 2025 |
| Directional hysteresis | Barakat et al. — Semantic Cache Bias | 2026 |
| Multi-agent convergence | Chiang et al. — Multi-LLM Negotiation | 2025 |
| Abstract/concrete analogies | Complex Analogies Benchmark | 2025 |
| Word convergence game | Hodge — 575 games, 4 models | 2026 |
| Conversational attractors | Nanda et al. — Attractor States | 2026 |
| Similarity metrics | CKA (Kornblith et al.) | 2019 |
| CCA-based | SVCCA | 2017 |
| Learnable similarity | ContraSim | 2024 |

---

## References

### Embedding Geometry & Structure
- [Linear Representation Hypothesis — ICML 2024](https://arxiv.org/abs/2311.03658)
- [Geometry of Categorical/Hierarchical Concepts — ICLR 2025](https://arxiv.org/abs/2406.01506)
- [Poincaré Embeddings](https://arxiv.org/abs/1705.08039)
- [Hyperbolic Fine-Tuning](https://arxiv.org/html/2410.04010)
- [HELM](https://arxiv.org/pdf/2505.24722)
- [Delta-Hyperbolicity](https://arxiv.org/abs/2512.20926)
- [Geometry of Decision Making](https://arxiv.org/abs/2511.20315)
- [NeurIPS 2023 — Geometry of Hidden Representations](https://neurips.cc/virtual/2023/poster/71102)
- [ICLR 2025 — High-Dimensional Abstraction Phase](https://openreview.net/forum?id=0fD3iIBhlV)
- [Explainable Mapper](https://arxiv.org/abs/2507.18607)
- [Persistent Topological Features](https://arxiv.org/html/2410.11042v1)
- [TDA for NLP Survey](https://arxiv.org/html/2411.10298)

### Navigation, Interpolation & Waypoints
- [Analogies Explained — ICML 2019](https://arxiv.org/abs/1901.09813)
- [Latent Space Oddity — ICLR 2018](https://www.researchgate.net/publication/320755116)
- [Geometrically Enriched Latent Spaces — AISTATS 2021](http://proceedings.mlr.press/v130/arvanitidis21a/arvanitidis21a.pdf)
- [Geodesic Calculus on Latent Spaces](https://arxiv.org/html/2510.09468v1)
- [Solving Hard Analogy Questions with Relation Embedding Chains](https://arxiv.org/pdf/2310.12379)
- [Geometry of Knowledge](https://arxiv.org/abs/2507.13874)
- [Next Concept Prediction](https://arxiv.org/html/2602.08984v1)
- [PaCE](https://arxiv.org/html/2406.04331)
- [ConceptNet Path Quality](https://dspace.mit.edu/bitstream/handle/1721.1/125891/1902.07831.pdf)
- [Classical Semantic Relatedness Measures](https://arxiv.org/pdf/1401.5699)

### Compositionality & Multi-Hop Reasoning
- [Compositionality Gap](https://arxiv.org/abs/2210.03350)
- [Latent Multi-Hop Reasoning / TWOHOPFACT — ACL 2024](https://aclanthology.org/2024.acl-long.550.pdf)
- [Two-Hop Curse](https://openreview.net/pdf?id=HVblmL5Rws)

### Consistency & Directionality
- [Reversal Curse — ICLR 2024](https://arxiv.org/abs/2309.12288)
- [Directional Optimization Asymmetry](https://arxiv.org/html/2511.19997)
- [Directional Bias — "More or Less Wrong"](https://arxiv.org/html/2506.03923)
- [Self-Consistency](https://arxiv.org/html/2506.18781v1)
- [Rating Roulette — EMNLP 2025](https://aclanthology.org/2025.findings-emnlp.1361.pdf)
- [Trajectory Variance — "When Agents Disagree"](https://arxiv.org/abs/2602.11619)
- [Position Bias — NAACL 2024](https://aclanthology.org/2024.findings-naacl.130/)

### Translation Symmetry & Universal Geometry
- [Symmetry in Language Statistics — Karkada et al.](https://arxiv.org/abs/2602.15029)

### Trajectory & Manifold Dynamics
- [Dynamic Manifold Evolution Theory](https://arxiv.org/html/2505.20340)
- [RiemannInfer — Scientific Reports 2026](https://www.nature.com/articles/s41598-026-37328-x)
- [The Geometric Reasoner](https://arxiv.org/html/2601.18832v2)
- [Semantic Trajectories in Decoding](https://arxiv.org/pdf/2506.23601)

### Cross-Model Comparison
- [Platonic Representation Hypothesis — ICML 2024](https://arxiv.org/abs/2405.07987)
- [CKA — Kornblith et al.](https://arxiv.org/abs/1905.00414)
- [SVCCA](https://papers.nips.cc/paper/7188-svcca-singular-vector-canonical-correlation-analysis-for-deep-learning-dynamics-and-interpretability)
- [ContraSim — NAACL 2024](https://aclanthology.org/2024.naacl-long.350/)
- [Similarity Survey](https://arxiv.org/pdf/2305.06329)
- [Multi-Way Representation Alignment](https://arxiv.org/abs/2602.06205)
- [Model Stitching by Functional Latent Alignment](https://arxiv.org/html/2505.20142v1)
- [Stitching Cautionary Work — ICML 2025](https://icml.cc/virtual/2025/poster/44458)
- [Transferring Linear Features — NeurIPS 2025](https://neurips.cc/virtual/2025/poster/118079)
- [Behavioral Fingerprint](https://arxiv.org/html/2602.09434)
- [HuRef — NeurIPS 2024](https://proceedings.neurips.cc/paper_files/paper/2024/file/e46fc33e80e9fa2febcdb058fba4beca-Paper-Conference.pdf)

### Cognitive Science
- [Gärdenfors — Conceptual Spaces](https://direct.mit.edu/books/monograph/2532/Conceptual-SpacesThe-Geometry-of-Thought)
- [Cognitive Map Review](https://pmc.ncbi.nlm.nih.gov/articles/PMC6028313/)
- [Navigating Cognition — Science](https://www.science.org/doi/abs/10.1126/science.aat6766)
- [External Hippocampus for LLM Reasoning](https://arxiv.org/abs/2512.18190)
- [Tversky — Features of Similarity](https://pages.ucsd.edu/~scoulson/203/tversky-features.pdf)
- [LLM World of Words — Nature Scientific Data](https://www.nature.com/articles/s41597-025-05156-9)
- [Small World of Words](https://pubmed.ncbi.nlm.nih.gov/30298265/)
- [LLM World of Words — arXiv](https://arxiv.org/abs/2412.01330)

### Benchmarks
- [Word Synchronization Challenge](https://arxiv.org/abs/2502.08312)
- [Emergent Social Conventions — Science Advances](https://www.science.org/doi/10.1126/sciadv.adu9368)
- [CK-Arena](https://arxiv.org/abs/2505.17512)
- [EQ-Bench](https://arxiv.org/abs/2312.06281)

### Semantic Basins & Behavioral Topography
- [Spectral Semantic Attractors — Wyss et al.](https://arxiv.org/abs/2512.05162)
- [Behavioral Failure Manifold Mapping](https://arxiv.org/abs/2602.22291)
- [Directional/Hysteretic Bias — Barakat et al.](https://arxiv.org/abs/2601.08846)
- [Multi-LLM Negotiation Convergence — Chiang et al.](https://arxiv.org/abs/2512.00047)
- [Complex Analogies Benchmark](https://aclanthology.org/2025.inlg-main.28.pdf)
- [Conversational Attractor States — Nanda et al. (LessWrong)](https://www.lesswrong.com/posts/mgjtEHeLgkhZZ3cEx/models-have-some-pretty-funny-attractor-states) | [Code](https://github.com/ajobi-uhc/attractor-states)
- [Word Convergence Game — Hodge](https://github.com/jamesondh/word-convergence-game) | [Writeup](https://jamesonhodge.com/posts/word-convergence-game)

### Distance Metrics & Anisotropy
- [Metric Transforms / Cosine Triangle Inequality](https://arxiv.org/pdf/1208.3145)
- [Earth Mover's Distance](https://www.cs.cmu.edu/~efros/courses/LBMV07/Papers/rubner-jcviu-00.pdf)
- [Anisotropy — NAACL 2024](https://aclanthology.org/2024.naacl-long.274/)
