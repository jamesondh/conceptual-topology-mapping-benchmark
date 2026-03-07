# 2. The Benchmark

This section defines the Conceptual Topology Mapping Benchmark precisely enough for replication. We describe the elicitation paradigm, derived metrics, concept pair selection, model cohort, experimental phases, and evidential strategy. The goal is to establish the methodological foundation on which all subsequent findings rest; summary statistics that appear in the phase overview table (Section 2.5) and limitations discussion (Section 2.6) are included for context but are developed fully in their respective results sections.

## 2.1 Waypoint Elicitation

**Task.** Given a source concept A and a destination concept B, the model is asked to produce *N* intermediate waypoints that form a conceptual path from A to B. The waypoints are ordered — they represent a traversal through conceptual space, not an unstructured set of associations.

**Prompt design.** Two prompt formats were evaluated in a holdout experiment (Phase 1, 15 pairs, 4 models):

- **Semantic format** (selected):

  > Imagine walking through conceptual space from "[A]" to "[B]".
  > What [N] landmarks do you pass along the way?
  > List only the landmark concepts, one per line, numbered 1 through [N].
  > Do not include the starting or ending concepts.

- **Direct format** (backup, used for models that parse poorly under semantic):

  > List exactly [N] intermediate concepts that form a path from "[A]" to "[B]".
  > Respond with only the concepts, one per line, numbered 1 through [N].
  > Do not include the starting or ending concepts.

The semantic format was selected based on higher extraction accuracy and more interpretable waypoints on the holdout set. The direct format was retained as a fallback for models that produced unparseable outputs under the semantic prompt (notably some Phase 10A models during reliability probing).

**Default parameters.** Unless otherwise noted, all elicitations used 7 waypoints at temperature 0.7 with 10–20 independent runs per (model, pair, direction) combination. Phases 1–2 used 20 runs; later phases standardized to 10 runs per condition to manage API costs while maintaining adequate statistical power for bootstrap confidence intervals.

**Pre-fill variant.** Beginning in Phase 7A, a causal intervention variant was introduced: the first waypoint is pre-filled with a specified concept, and the model is asked to continue the remaining 6 waypoints. The pre-fill prompt format is:

> The first intermediate concept between "[A]" and "[B]" is "[pre-fill]".
> List exactly 6 more intermediate concepts that continue the path from "[pre-fill]" to "[B]".
> Respond with only the concepts, one per line, numbered 1 through 6.
> Do not include "[A]", "[pre-fill]", or "[B]" in your list.

This intervention tests whether navigational structure is causally sensitive to the starting trajectory, rather than merely statistically regular. (The pre-fill prompt is defined per-experiment in phase-specific scripts rather than in the shared prompt builder, as its structure differs from standard elicitation.)

**Self-grounding.** A distinctive feature of this benchmark is that the model's own outputs generate ground truth. There are no external labels, human annotations, or correct answers. Metrics are derived entirely from the statistical properties of the model's path outputs across repeated runs. This is both a strength (no annotation required, scalable to arbitrary model counts) and a limitation (circular — see Section 2.6).

**Comparison to prior paradigms.** Waypoint elicitation occupies a distinct position among probes of conceptual structure:

- *Word analogy tasks* (Mikolov et al., 2013) test single-step relational reasoning ("A is to B as C is to ?"). Our paradigm is multi-step and produces full path structure.
- *Free association norms* (Nelson et al., 2004; LLM World of Words, 2024–2025) produce local, undirected chains from a single cue. Waypoint elicitation is endpoint-conditioned: the model must produce a path from A *to* B, maintaining awareness of the destination throughout. This constraint transforms association into navigation — goal-directed traversal rather than local spreading activation.
- *Word convergence games* (Hodge, 2025) ask two players to alternate single words until they converge. The paradigm that inspired this benchmark, but convergence games test bilateral negotiation; our paradigm tests unilateral navigation.

**Why this is not free association.** The endpoint-conditioning is the critical distinction. Three forms of evidence support this claim: (a) paths between different endpoints sharing an intermediate concept diverge after that concept (the dual-anchor effect, Section 4.3), demonstrating that both endpoints shape the trajectory; (b) nonsense control pairs produce near-zero consistency while meaningful pairs produce structured, repeatable paths; and (c) bridge concepts are structural bottlenecks that depend on the specific pair geometry, not high-frequency associates of either endpoint (Section 5.4).

## 2.2 Derived Metrics

All metrics operate on canonicalized waypoint sequences (see Section 2.3 for the canonicalization pipeline). Some metrics reduce sequences to unordered sets (Jaccard similarity, bridge frequency); others depend on position within the ordered sequence (positional bridge profile, positional convergence). Unless otherwise stated, confidence intervals are 95% bootstrap percentile intervals computed from 1,000 resamples using a seeded PRNG (seed = 42) for reproducibility.

**Gait consistency (intra-model Jaccard).** For a given (model, pair, direction) condition with *n* independent runs producing waypoint sets $W_1, W_2, \ldots, W_n$, gait consistency is the mean pairwise Jaccard similarity:

$$\text{Gait} = \frac{2}{n(n-1)} \sum_{i < j} J(W_i, W_j)$$

where $J(A, B) = |A \cap B| / |A \cup B|$. Higher values indicate more deterministic navigation. Range: [0, 1].

> **Lexical limitation.** Jaccard similarity is computed on canonicalized token sets. Semantically equivalent waypoints — "melody" and "tune," "cemetery" and "graveyard" — are treated as entirely distinct. This means Jaccard *underestimates* true conceptual consistency. All consistency values, asymmetry values, and "distance" claims throughout this paper are lexical, not semantic. The magnitude of this bias is bounded by the canonicalization pipeline (which handles morphological variants such as running/run, cities/city) but is otherwise unknown. Embedding-based semantic similarity was implemented but deferred due to API cost. This is the benchmark's most pervasive methodological limitation, never fully mitigated across 11 phases.

**Path asymmetry.** For a pair (A, B), we collect forward runs (A→B) and reverse runs (B→A), then compute the mean cross-direction Jaccard across all forward×reverse run pairs:

$$\text{CrossJaccard} = \frac{1}{n_f \cdot n_r} \sum_{i=1}^{n_f} \sum_{j=1}^{n_r} J(W^{\text{fwd}}_i, W^{\text{rev}}_j)$$

The asymmetry index is defined as $1 - \text{CrossJaccard}$. Values near 0 indicate symmetric paths; values near 1 indicate complete asymmetry. Statistical significance is assessed via permutation test (1,000 permutations, null hypothesis: forward and reverse runs are drawn from the same distribution, using the correction of Phipson & Smyth, 2010 to avoid exact-zero *p*-values).

**Bridge frequency.** For a concept triple (A, B, C) where B is a candidate bridge, bridge frequency is the fraction of A→C runs in which B appears as a waypoint:

$$\text{BridgeFreq}(B \mid A \to C) = \frac{|\{r \in \text{runs}(A \to C) : B \in r\}|}{|\text{runs}(A \to C)|}$$

Bridge detection uses fuzzy matching: exact match after canonicalization, word-boundary containment (e.g., "domestic dog" matches bridge "dog"), and token-level matching (splitting on whitespace and hyphens). This catches multi-word waypoints containing the bridge but does not capture true synonyms (e.g., "canine" would not match "dog").

**Navigational distance.** For a set of runs in the same direction, navigational distance is defined as:

$$d(X \to Y) = 1 - \text{mean within-direction Jaccard}$$

High within-direction consistency yields low distance (easy, deterministic navigation); low consistency yields high distance (difficult, variable navigation). This is used for triangle inequality testing.

**Triangle inequality.** For a triple (A, B, C), the triangle inequality is tested as:

$$d(A \to C) \leq d(A \to B) + d(B \to C)$$

A small epsilon tolerance (0.001) is applied for floating-point comparison. The compliance rate is the fraction of (triple, model) combinations where the inequality holds.

> **Methodological note.** The triangle inequality uses within-direction Jaccard (consistency of repeated runs in the same direction) as the distance function, while the asymmetry test uses cross-direction Jaccard (comparing A→B vs B→A paths). These are different operationalizations of "distance." Findings are reported as *consistent with* quasimetric structure rather than formally establishing it on a single unified distance function.

**Waypoint transitivity.** For a triple (A, B, C), transitivity measures overlap between the direct path A→C and the composed path A→B ∪ B→C:

$$\text{Transitivity} = J(\text{waypoints}(A \to C),\ \text{waypoints}(A \to B) \cup \text{waypoints}(B \to C))$$

Higher transitivity indicates that the direct path shares waypoints with the two-leg composed path — evidence for compositional structure.

**Positional bridge profile.** For each of the *N* waypoint positions (0-indexed), the bridge position profile records the fraction of runs where the bridge concept appears at that position. This reveals whether bridges anchor early in the path, appear at the midpoint, or distribute uniformly.

**Pre-fill bridge survival.** For pairs tested under the pre-fill intervention (Phases 7A, 9C, 10B), bridge survival rate is the ratio of bridge frequency under pre-fill to bridge frequency unconstrained:

$$\text{SurvivalRate} = \frac{\text{BridgeFreq}_{\text{pre-filled}}}{\text{BridgeFreq}_{\text{unconstrained}}}$$

Values below 1.0 indicate bridge displacement; values above 1.0 indicate bridge facilitation (observed for marginal bridges under semantically aligned pre-fills). Survival rate is the primary metric for comparing pre-fill conditions.

**Positional displacement.** The Phase 7A analysis additionally computes a position-specific displacement: bridge frequency at the bridge's unconstrained modal position minus bridge frequency at that same position under pre-fill. This captures whether pre-filling shifts the bridge to a different position in the path, not merely whether it reduces overall bridge frequency. The positional and overall metrics are related but not identical — a bridge can survive (appear somewhere in the path) while being positionally displaced.

**Shannon entropy.** For a given (model, pair, direction), the waypoint frequency distribution is computed by counting each unique waypoint once per run, normalizing to proportions, and computing Shannon entropy:

$$H = -\sum_i p_i \log_2 p_i$$

Lower entropy indicates concentrated, near-deterministic navigation; higher entropy indicates diverse, exploratory behavior.

**Uniformity test.** Departure from a uniform waypoint distribution is assessed via chi-squared goodness-of-fit test (comparing observed waypoint counts against the expectation that all waypoints are equally likely), with *p*-values computed using the Wilson-Hilferty normal approximation. When testing multiple pairs, Bonferroni correction is applied at the pair level (dividing the significance threshold by the number of pairs tested). Pair-level rejection is assessed per model; aggregate summaries report the fraction of pairs where at least one model rejects uniformity at the corrected threshold.

[TABLE 1: Metric Definitions]

| Metric | Formal Definition | Range | Interpretation | Key Limitation |
|--------|------------------|-------|----------------|----------------|
| Gait consistency | Mean pairwise Jaccard across runs | [0, 1] | Higher = more deterministic | Lexical only; underestimates true consistency |
| Path asymmetry | 1 − mean cross-direction Jaccard | [0, 1] | Higher = more asymmetric | Lexical; true asymmetry likely lower |
| Bridge frequency | Fraction of A→C runs containing B | [0, 1] | Higher = stronger bottleneck | Fuzzy matching misses synonyms |
| Navigational distance | 1 − mean within-direction Jaccard | [0, 1] | Higher = harder navigation | Not a true metric (asymmetric) |
| Triangle inequality | d(A,C) ≤ d(A,B) + d(B,C) | Boolean | Holding = metric-like structure | Different distance operationalization than asymmetry |
| Transitivity | Jaccard of direct vs composed paths | [0, 1] | Higher = more compositional | Triple cross-product pseudoreplication (mitigated by run-level bootstrap) |
| Bridge position | Per-position bridge frequency | [0, 1] per position | Reveals anchoring pattern | Resolution limited by waypoint count |
| Bridge survival rate | Pre-filled freq / unconstrained freq | [0, ∞) | < 1 = displaced; > 1 = facilitated | Requires nonzero baseline frequency |
| Positional displacement | Modal-position freq change under pre-fill | [−1, 1] | Positive = bridge displaced at peak | Position-specific; misses total-frequency effects |
| Shannon entropy | −Σ pᵢ log₂ pᵢ of waypoint frequencies | [0, ∞) | Lower = concentrated; higher = diverse | Sensitive to canonicalization granularity |

## 2.3 Concept Pair Selection

**Categories.** Concept pairs were selected to span the major axes of semantic variation. The Phase 1 inventory comprised 36 pairs across 9 categories:

- **Anchor** (5 pairs): Pairs with known basin structure from prior word convergence experiments (e.g., Beyoncé→erosion with known basin "formation"). Used to calibrate expectations from prior work.
- **Hierarchy** (4 pairs): Hypernym–hyponym relationships at varying taxonomic depth (e.g., animal→poodle, emotion→nostalgia). Test compositional path structure.
- **Cross-domain** (4 pairs): Pairs spanning unrelated conceptual domains (e.g., music→mathematics, love→death). The benchmark's primary test cases — conceptually distant, requiring genuine navigation.
- **Polysemy** (6 pairs): Pairs where one concept is polysemous, with targets selecting different senses (e.g., bank→river vs bank→vault; bat→cave vs bat→baseball). Test sense differentiation.
- **Near-synonym** (4 pairs): Semantically close concepts (e.g., happy→joyful, student→pupil). Expected to produce short conceptual distances.
- **Antonym** (2 pairs): Opposite concepts (e.g., hot→cold, love→hate). Test spectrum traversal.
- **Control-identity** (2 pairs): Same concept in both positions (e.g., apple→apple). Expected to produce low-distance, high-consistency paths.
- **Control-random** (7 pairs): Arbitrarily paired concepts (e.g., origami→gravity, stapler→monsoon). Expected to produce low consistency and no systematic bridge concepts.
- **Control-nonsense** (2 pairs): Nonsense strings as endpoints (e.g., "blicket"→"daxin"). Expected to produce near-zero consistency.

These were split into a holdout set (15 pairs, used only for prompt format selection) and a reporting set (21 pairs, used for all published analyses), with even category distribution across both sets to avoid selection bias.

**Bridge concept types.** Across 11 phases, bridge concepts were classified into four functional types:

- **Bottleneck bridges** name the primary axis of connection between two domains. Example: "spectrum" for light→color (names the mechanism), "deposit" for loan→shore (names the action linking financial and geographic senses of "bank").
- **Gradient midpoint bridges** occupy a position on a continuous dimension between the endpoints. Example: "warm" for hot→cold, "twilight" for day→night.
- **Causal-chain bridges** name a process step connecting cause to effect. Example: "fermentation" for grape→wine, "germination" for seed→garden.
- **Too-central bridges** are informationally redundant — both endpoints already imply the candidate bridge. Example: "fire" for spark→ash, "water" for rain→ocean. These are expected to produce low bridge frequencies because they add no navigational information.

Empirical results distinguishing these types are presented in Section 5.4.

**Expansion across phases.** The initial 21 reporting pairs were supplemented in each subsequent phase based on findings from the previous one. By Phase 11, the benchmark encompassed over 100 unique concept pairs and triples, each selected to test specific structural hypotheses. Pair selection was not random — it followed the exploration-first methodology, targeting the most informative comparisons based on prior results.

**Canonicalization pipeline.** All model outputs pass through a four-stage canonicalization pipeline before metric computation:

1. **Lowercase:** Convert all characters to lowercase.
2. **Article stripping:** Remove leading articles ("the", "a", "an").
3. **Lemmatization:** Apply morphological normalization using the compromise NLP library. Verbs are converted to infinitive form ("running" → "run," "walked" → "walk"); nouns are converted to singular form ("cities" → "city," "dogs" → "dog").
4. **Phrase normalization:** Collapse whitespace, strip trailing punctuation, trim.

After canonicalization, duplicate waypoints within a single run are removed (preserving order, keeping first occurrence). This pipeline handles morphological variants but not synonyms — "melody" and "tune" remain distinct tokens after canonicalization.

**Response parsing.** Model responses are parsed using a multi-strategy extraction pipeline that attempts, in order: JSON array extraction, numbered list parsing, bullet list parsing, comma-separated value extraction, arrow-separated extraction (recognizing ASCII arrow patterns: `->`, `=>`, `-->`, `==>`), and line-by-line fallback. This accommodates the wide variation in output formatting across 12 models.

**Extraction count handling.** After parsing and canonicalization, if the number of extracted waypoints exceeds the requested count *N*, the list is truncated to *N*. If fewer than *N* waypoints are extracted, the run is retained with the shortened list and flagged (`extractionCountMismatch`). This lenient policy avoids discarding partial data, but extraction mismatches can affect downstream metrics; phases report extraction accuracy as a data quality indicator.

## 2.4 Model Selection

Twelve models from 11 independent training pipelines were tested across the benchmark's 11 phases, all accessed via the OpenRouter API for a uniform interface. Models were added incrementally as the benchmark expanded:

[TABLE 2: Model Summary]

| Model | Provider | OpenRouter ID | Approx. Scale | Cohort | Phases |
|-------|----------|---------------|---------------|--------|--------|
| Claude Sonnet 4.6 | Anthropic | `anthropic/claude-sonnet-4.6` | Frontier | Core (Phases 1–9) | 1–11 |
| GPT-5.2 | OpenAI | `openai/gpt-5.2` | Frontier | Core (Phases 1–9) | 1–11 |
| Grok 4.1 Fast | xAI | `x-ai/grok-4.1-fast` | Frontier | Core (Phases 1–9) | 1–9 |
| Gemini 3 Flash | Google | `google/gemini-3-flash-preview` | Frontier | Core (Phases 1–9) | 1–9 |
| MiniMax M2.5 | MiniMax | `minimax/minimax-m2.5` | Frontier | Expanded (Phase 10A) | 10 |
| Kimi K2.5 | Moonshot AI | `moonshotai/kimi-k2.5` | Frontier | Expanded (Phase 10A) | 10 |
| GLM 5 | Zhipu AI | `z-ai/glm-5` | Frontier | Expanded (Phase 10A) | 10* |
| Qwen 3.5 397B-A17B | Alibaba | `qwen/qwen3.5-397b-a17b` | 397B MoE | Expanded (Phase 10A) | 10 |
| Llama 3.1 8B Instruct | Meta | `meta-llama/llama-3.1-8b-instruct` | 8B | Expanded (Phase 10A) | 10 |
| DeepSeek V3.2 | DeepSeek | `deepseek/deepseek-v3.2` | Frontier | Final (Phase 11A) | 11 |
| Mistral Large 3 | Mistral AI | `mistralai/mistral-large-2512` | Frontier | Final (Phase 11A) | 11 |
| Cohere Command A | Cohere | `cohere/command-a` | Frontier | Final (Phase 11A) | 11 |
| Llama 4 Maverick | Meta | `meta-llama/llama-4-maverick` | Frontier | Final (Phase 11A) | 11 |

*GLM 5 was rate-limited during Phase 10A and produced insufficient data for full analysis.

**Cohort structure.** The core cohort (Claude, GPT, Grok, Gemini) anchored Phases 1–9; Claude and GPT continued into Phases 10–11 for comparative baselines, while Grok and Gemini were not tested beyond Phase 9. Expanded and final cohort models were added in Phases 10–11 specifically to test whether findings generalize beyond the original four models. This design means that some claims (R1, R2, R6) are supported by all 12 models, while others (R3, R4, R7) are tested only on the original 4-model cohort.

**Diversity.** The 12 models span 11 independent training pipelines (Llama 3.1 8B and Llama 4 Maverick share the Meta Llama family), ranging from 8B parameters (Llama 3.1 8B) to frontier-scale models. This enables both cross-architecture comparison and within-family scale comparison (Llama 8B vs Llama 4 Maverick).

**Reliability probing.** Before full data collection, each new model underwent a reliability probe: 3 concept pairs × 2–5 runs, testing connectivity rate, parse rate, median latency, and waypoint extraction accuracy. Models failing reliability probing were excluded (GLM 5, partially) or tested with extended timeouts (Qwen, MiniMax, and Kimi were recovered using a 300-second "patient mode" after failing the default 60-second timeout).

## 2.5 Experimental Phases

The benchmark followed an exploration-first methodology: each phase was designed to follow the most interesting signal from the previous phase's findings. This produced a non-linear progression through the space of possible experiments, with the direction of inquiry determined by data rather than a fixed plan. Eleven phases were completed, comprising approximately 21,540 total API runs.

[TABLE 3: Phase Summary]

| Phase | Name | New Runs | Key Question | Primary Finding |
|-------|------|----------|--------------|-----------------|
| 1 | Pilot & prompt selection | ~2,480 | Do models produce consistent waypoint paths? | Models have distinct gaits: Claude 0.578 vs GPT 0.258 (2.2× gap) |
| 2 | Reversals & asymmetry | ~960 | Is A→B navigation symmetric with B→A? | Navigation is fundamentally asymmetric (mean 0.811); symmetry axiom fails |
| 3 | Positional convergence & transitivity | ~1,260 | Do paths compose? Does triangle inequality hold? | Hierarchical transitivity 4.9× over random; triangle inequality 91% |
| 4 | Cross-model bridge topology | ~1,600 | Do models agree on bridge concepts? | Bridges are structural bottlenecks, not associations; prediction accuracy 81.3% |
| 5 | Cue-strength & dimensionality | ~3,720 | Is bridge frequency graded by semantic cue strength? | Gradient real (12/16 monotonic); forced crossing discovery |
| 6 | Navigational salience & position | ~2,080 | Where do bridge concepts appear in paths? | Bridges anchor early (position 1–2); distributions non-uniform |
| 7 | Early anchoring & navigational mechanics | ~2,360 | Does pre-filling a waypoint causally affect the path? | Displacement 0.515 (CI excludes zero); gradient > causal-chain bridges |
| 8 | Bridge fragility & Gemini deficit | ~2,690 | Can we predict bridge fragility from route competition? | All 3 hypotheses fail; prediction accuracy 24% (mechanism floor) |
| 9 | Dominance, transformation, facilitation | ~3,037 | Can we predict bridge survival from dominance ratios? | All 3 hypotheses fail; prediction accuracy 20%; mechanism ceiling confirmed |
| 10 | Model generality & relation classes | ~1,680 | Do structural findings generalize to new models? | R1/R2 replicate across 4 new models; bridge structure generalizes; scale differentiates |
| 11 | Expanded generality & robustness | ~2,040 | Do findings survive more models and protocol variation? | R1/R2 universal across 12 models; bridge frequency most robust property; model identity dominates protocol |

Run counts are approximate due to retries, failures, and data reuse across phases. Reused runs (from earlier phases providing baseline data for later experiments) are counted once in their original phase.

## 2.6 Validity and Evidential Strategy

**What this benchmark does not measure.** It does not measure human conceptual geometry (no human participants were tested). It does not measure latent model geometry directly (we test behavior, not internal representations or embeddings). It does not measure factual correctness (there are no correct answers — only structural properties to characterize). And, as argued above, it does not measure free association (waypoints are endpoint-conditioned).

**Why waypoint elicitation measures navigation.** Free association produces local, undirected chains — each word triggers the next with no global constraint. Waypoint elicitation is *constrained*: it requires producing a path conditioned on both endpoints simultaneously. The model must maintain awareness of both source and destination, producing intermediate steps that form a directed traversal. This endpoint-conditioning is what transforms association into navigation. Three lines of evidence support this distinction:

1. *Dual-anchor effect*: Paths exhibit U-shaped convergence profiles, with both the source and destination concepts exerting measurable influence on waypoint selection at their respective ends (Section 4.3). This would not occur under undirected spreading activation.
2. *Bridge specificity*: Bridge concepts are pair-specific structural bottlenecks, not high-frequency associates of either endpoint. The same concept can serve as a bridge for one pair and be absent for another pair sharing an endpoint (Section 5.4).
3. *Causal sensitivity*: Pre-filling the first waypoint with an alternative concept causally displaces bridge concepts downstream, demonstrating that navigational structure is not a fixed property of the endpoints but emerges from the trajectory itself (Section 6.1).

**Self-grounding and circularity mitigation.** Model outputs generate their own ground truth, which introduces a circularity concern: are we measuring genuine navigational structure, or artifacts of the generation process? Three mitigations address this:

1. *External mathematical properties*: Metric axioms (triangle inequality, symmetry/asymmetry) have definitions independent of any model. Testing whether model-generated paths satisfy these axioms grounds the benchmark in external mathematical structure.
2. *Cross-model comparison*: Twelve independent models serve as mutual validation. When all 12 models exhibit the same structural property (e.g., asymmetry > 0.60), the finding cannot be attributed to idiosyncrasies of any single model's generation process.
3. *Causal intervention*: The pre-fill experiments (Phases 7A, 9C, 10B) demonstrate that navigational structure is causally sensitive to perturbation, not merely a statistical regularity. Bridge displacement under pre-filling is structural, not an artifact of decoding.

The benchmark's evidential standard is *relative*, not absolute: we measure the magnitude gap between experimental and control conditions, not whether controls achieve a fixed baseline threshold. This is explicitly acknowledged as the primary limitation (see below).

**Paradigm limitations.**

1. *Lexical metrics only*: All metrics use Jaccard set similarity after canonicalization. Semantically equivalent waypoints are treated as distinct. The asymmetry value of 0.811 (Phase 2 cohort) should be interpreted as *lexical* asymmetry; true conceptual asymmetry is likely lower. A spot-check using embedding-based similarity on a subset of pairs would help bound this effect but was not conducted.

2. *Prompt sensitivity*: The benchmark's findings could be sensitive to the specific prompt wording. This is partially addressed by Phase 11C, which tested a 2×2 grid of waypoint counts (5, 9) and temperatures (0.5, 0.9) and found that model identity dominates protocol variation (η² = 0.242 for model vs 0.008 for waypoints and 0.002 for temperature). However, only three models were tested in the robustness analysis.

3. *API-mediated access*: All models are accessed via OpenRouter, which introduces potential confounds: temperature may be approximate for some providers, internal model state cannot be controlled, and silent model updates may occur during multi-day data collection. Partial mitigation comes from the no-temporal-drift finding (cross-batch Jaccard within 0.05 of within-batch, Phase 4B) and the robustness to temperature variation (Phase 11C).

4. *Control pair failure*: The benchmark's most serious limitation. LLMs find navigable routes between *any* concept pair at 7 waypoints, defeating strict single-pair control validation. All 12 models show some structure on the stapler–monsoon control pair (top waypoint frequency 0.650–1.000 across models). The benchmark's validity rests on relative performance gaps — experimental pairs show predicted bridges with higher consistency than controls show unpredicted bridges — not on absolute control baselines. This limitation is discussed in detail in Section 9.5.
