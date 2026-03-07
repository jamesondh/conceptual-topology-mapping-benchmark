# Conceptual Topology Mapping Benchmark

A novel LLM benchmark testing whether models have consistent, measurable geometric structure in how they navigate between concepts.

## The Idea

Give models two concepts, ask for intermediate waypoints, and test whether the resulting paths reveal consistent topological structure. Unlike static embedding analysis, this benchmark evaluates *behavioral navigation* — do models traverse conceptual space with predictable "gaits"?

**Builds on:** [Word convergence game](https://github.com/jamesondh/word-convergence-game) — 575 games across 4 models showing characteristic navigational patterns, semantic basins of attraction, and direction-dependent behavior.

## Key Findings

Across ~21,540 elicitation runs, 12 models from 11 independent training pipelines, and 11 phases, the benchmark has established 7 robust claims about how LLMs navigate conceptual space:

### R1. Models have distinct "conceptual gaits"
Each model navigates the same conceptual terrain with a characteristic consistency level — not just different vocabulary, but structurally different paths. The 12-model gait spectrum spans from GPT-5.2 (0.258) to Mistral Large 3 (0.747, the record). Claude (0.578) was previously the ceiling until Phase 11A. Mistral achieves 0.936 Jaccard on music→mathematics — 15 independent runs produce nearly identical paths. Cross-model agreement is strikingly low (~0.18 Jaccard), suggesting each LLM has its own "conceptual geography." Gait rank order is stable under protocol variation (Kendall's W = 0.840, Phase 11C).

### R2. Conceptual space is quasimetric, not metric
The path from A→B is fundamentally different from B→A. Mean directional asymmetry is 0.811 across all pairs, and 87% of conditions show statistically significant asymmetry. Even supposedly "symmetric" relationships like synonyms are directional. Triangle inequality holds at ~91% across three independent samples. Confirmed across all 12 models (all > 0.60). Conceptual space satisfies all metric axioms *except* symmetry. Phase 11C qualification: asymmetry is waypoint-count-sensitive (5-waypoint conditions fall to 0.594, below 0.60 threshold).

### R3. Polysemy routing is remarkably clean
When the same ambiguous word (e.g., "bank") is steered toward different senses via its endpoint (river vs. mortgage), the resulting paths diverge completely (0.011-0.062 cross-pair Jaccard). LLMs don't just pick different words — they route through entirely distinct intermediate concept spaces.

### R4. Hierarchical paths compose like a metric space
Paths along taxonomic chains (animal→dog→poodle) show 4.9× more waypoint overlap than random concept triples. The triangle inequality holds in 91% of cases. Conceptual navigation has genuine mathematical structure, not just surface associations.

### R5. Controls validate cleanly (with qualification)
Nonsense controls show near-zero consistency (Jaccard 0.062, entropy 6.37). Random bridge concepts never appear on paths (0% bridge frequency across all phases). However, Phase 11B reveals a fundamental limitation: the single-pair control design (stapler-monsoon) fails R5 criteria for all 12 models, and all 4 replacement candidates fail screening (0/24 cells pass). At 7 waypoints, LLMs find navigable semantic routes between *any* two concrete concepts. The control-pair approach needs redesign (multi-pair batteries or non-binary criteria), but the core validation — that experimental structure is not an artifact — remains supported by the nonsense and random controls.

### R6. Bridge concepts are bottlenecks, not associations
A concept serves as a navigational bridge when it is the *necessary intermediate step* in the most natural decomposition of the endpoint relationship, not merely when it is associated with both endpoints. "Spectrum" works (names the mechanism), "metaphor" fails (associated but off-axis), "germination" outperforms "plant" (process-naming > object-naming). Bridge bottleneck structure generalizes across all 12 models (combined cohort bridge freq CI includes zero: 0.717 vs 0.817, diff -0.100). Bridge frequency is the most protocol-robust property in the benchmark (>0.97 across all Phase 11C conditions). Universal bridges (dog, spectrum, warm) remain universal; model-dependent bridges (sadness, germination, harmony) remain model-dependent. Llama 3.1 8B is the sole outlier (0.200) — a scale effect, not a model-general one.

### R7. Cue-strength gradient exists
12 of 16 family/model combinations show monotonic decrease in bridge frequency from highest to lowest cue level. For three well-behaved families (physical-causation, compositional-hierarchy, abstract-affect), the gradient is perfect across all models.

### The structure/content boundary (Phases 10-11 capstone)
Structural properties (gait, asymmetry, compositionality) are universal across model architectures and scales — now confirmed across 12 models from 11 independent training pipelines. But navigational content (which specific bridges get used, which waypoints appear) is model-specific. A small model navigates the same geometric space but takes completely different paths. Phase 11C confirms this is not a protocol artifact: model identity is the only substantial factor in an ANOVA of gait variation (η²=0.242, p≈0.001), while waypoint count, temperature, and their interaction are all null. This is analogous to all models navigating a Riemannian manifold with consistent curvature but different coordinate charts.

## Quick Start

```bash
# Install dependencies
bun install

# Copy and configure environment
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env

# Single waypoint elicitation
bun run src/index.ts --model claude --from music --to mathematics --waypoints 5

# Run with multiple repetitions
bun run src/index.ts --model gpt --from "Beyoncé" --to erosion --reps 10 --format semantic
```

## Experiment Pipeline

```bash
# 1. Select prompt format (runs on holdout pairs)
bun run prompt-selection          # ~1200 API calls
bun run prompt-selection --dry-run  # Preview without running

# 2. Run main pilot experiment (runs on reporting pairs)
bun run pilot                     # ~2480 API calls
bun run pilot --dry-run           # Preview

# 3. Analyze results and generate findings
bun run analyze
bun run analyze --skip-embeddings  # Skip semantic similarity (no API calls)

# 4. Phase 2: Reversal experiment (runs reporting pairs in reverse + polysemy supplementary)
bun run reversals                 # ~960 API calls
bun run reversals --dry-run       # Preview
bun run reversals --concurrency 12  # Faster with higher concurrency

# 5. Analyze reversal results
bun run analyze-reversals

# 6. Phase 3: Positional convergence + transitivity
bun run analysis/03a-positional-convergence.ts  # Part A: 0 API calls
bun run experiments/03b-transitivity.ts         # Part B: ~600 API calls
bun run analysis/03b-transitivity.ts            # Analyze transitivity

# 7. Phase 4: Cross-model bridge topology
bun run bridge-agreement         # Part A: 0 API calls (analyzes Phase 3 data)
bun run targeted-bridges         # Part B: ~1520 API calls
bun run analyze-targeted-bridges # Analyze targeted bridge results
bun run phase4                   # Run all Phase 4 in sequence

# 8. Phase 5: Cue-strength, dimensionality, and convergence
bun run cue-strength             # Part A: ~1680 API calls
bun run analyze-cue-strength     # Analyze cue-strength gradient results
bun run dimensionality           # Part B: ~960 API calls
bun run analyze-dimensionality   # Analyze dimensionality probing results
bun run convergence-5c           # Part C: ~640 API calls (7-waypoint paths)
bun run analyze-convergence      # Analyze convergence profiles + W-shape
bun run phase5                   # Run all Phase 5 in sequence

# 9. Phase 6: Navigational salience, forced crossings, and positional scanning
bun run salience                 # Part A: ~1200 API calls
bun run analyze-salience         # Analyze salience landscapes
bun run forced-crossing          # Part B: ~640 API calls
bun run analyze-forced-crossing  # Analyze forced-crossing asymmetry
bun run positional               # Part C: ~480 API calls (+ reuse 5C data)
bun run analyze-positional       # Analyze positional bridge results
bun run phase6                   # Run all Phase 6 in sequence

# 10. Phase 7: Early anchoring, curvature, and too-central boundary
bun run anchoring                # Part A: ~1260 API calls (pre-filled waypoint manipulation)
bun run analyze-anchoring        # Analyze anchoring results
bun run curvature                # Part B: ~760 API calls (triangle inequality excess)
bun run analyze-curvature        # Analyze curvature results
bun run too-central              # Part C: ~480 API calls (informational redundancy)
bun run analyze-too-central      # Analyze too-central results
bun run phase7                   # Run all Phase 7 in sequence

# 11. Phase 8: Bridge fragility, gradient blindness, and gait-normalized distance
bun run fragility                # Part A: ~1010 API calls (salience + pre-fill survival)
bun run analyze-fragility        # Analyze fragility results
bun run gradient                 # Part B: ~1280 API calls (gradient vs causal pairs)
bun run analyze-gradient         # Analyze gradient blindness results
bun run gait-norm                # Part C: ~640 API calls (dedicated 7-waypoint runs)
bun run analyze-gait-norm        # Analyze gait-normalized distance results
bun run phase8                   # Run all Phase 8 in sequence

# 12. Phase 9: Bridge dominance, transformation chains, and pre-fill facilitation
bun run dominance                # Part A: ~420 API calls (dominance ratio + pre-fill survival)
bun run analyze-dominance        # Analyze dominance results
bun run transformation           # Part B: ~1260 API calls (transformation vs gradient pairs)
bun run analyze-transformation   # Analyze transformation results
bun run facilitation             # Part C: ~1040 API calls (pre-fill facilitation crossover)
bun run analyze-facilitation     # Analyze facilitation results
bun run phase9                   # Run all Phase 9 in sequence

# 13. Phase 10: Model generality and pre-fill relation classes
bun run model-generality         # Part A: ~1200 API calls (probe reliability + elicitation on 5 new models)
bun run analyze-model-generality # Analyze model generality results
bun run relation-classes         # Part B: ~960 API calls (on-axis/same-domain/unrelated pre-fill)
bun run analyze-relation-classes # Analyze relation class results
bun run phase10                  # Run all Phase 10 in sequence

# 14. Phase 11: Expanded generality, control revision, and robustness
bun run expanded-generality      # Part A: ~720 API calls (4 new models on 12-pair battery)
bun run analyze-expanded-generality # Analyze expanded generality results
bun run control-revision         # Part B: ~640 API calls (screening + validation of new controls)
bun run analyze-control-revision # Analyze control revision results
bun run robustness               # Part C: ~1080 API calls (2×2 waypoint × temperature grid)
bun run analyze-robustness       # Analyze robustness results
bun run phase11                  # Run all Phase 11 in sequence
```

## What It Measures

- **Intra-model consistency** — How stable are waypoints across repeated runs? (Jaccard, positional overlap, distributional entropy)
- **Cross-model comparison** — Do different models produce structurally different paths?
- **Waypoint count effect** — Do 5-waypoint and 10-waypoint paths share structure at different resolutions?
- **Control baselines** — Identity pairs (trivial), random pairs (noise floor), nonsense (hallucination detection)
- **Polysemy steering** — Do ambiguous words (bank↔river vs bank↔mortgage) produce clearly different paths?
- **Directional asymmetry** — Is the path from A→B the same as B→A? (Phase 2: permutation tests, bootstrap CIs, direction-exclusive waypoints)
- **Positional convergence** — Do forward and reverse paths converge at specific positions? (Phase 3A: dual-anchor hypothesis)
- **Transitivity** — Do paths A→B→C compose into A→C? (Phase 3B: triangle inequality, bridge concept frequency)
- **Cross-model bridge agreement** — Do models agree on which concepts are navigational bridges? (Phase 4A: inter-model correlation, Gemini isolation)
- **Targeted bridge topology** — Do predicted bridge concepts appear on direct paths? (Phase 4B: concrete vs abstract bridging, Gemini fragmentation characterization)
- **Cue-strength thresholds** — Is there a measurable cue-strength threshold below which bridge frequency drops to zero? (Phase 5A: logistic curve fitting, Gemini threshold comparison)
- **Conceptual dimensionality** — How many independent navigational axes does conceptual space have? (Phase 5B: same-axis vs cross-axis bridge frequency, polysemy vs non-polysemy)
- **Triple-anchor convergence** — Do bridge concepts create a third convergence anchor in paths? (Phase 5C: W-shape detection in 7-waypoint paths)
- **Navigational salience** — What is the empirical frequency distribution of waypoint concepts? (Phase 6A: heavy-tail testing, cross-model agreement)
- **Forced-crossing asymmetry** — Do polysemous bottlenecks reduce path asymmetry? (Phase 6B: forward/reverse comparison for forced-crossing pairs)
- **Positional bridge scanning** — Where do bridge concepts anchor in the positional sequence? (Phase 6C: peak-detection W-shape, semantic distance regression)
- **Early anchoring** — Does a pre-filled heading waypoint bias the subsequent path? (Phase 7A: incongruent/congruent/neutral pre-fill conditions, bridge displacement test)
- **Curvature estimation** — Do polysemous concepts create regions of high curvature? (Phase 7B: triangle inequality excess, polysemous vs non-polysemous vertex comparison)
- **Too-central boundary** — What separates "too central to bridge" from "obvious and useful"? (Phase 7C: informational redundancy gradient, random-target probes)
- **Bridge fragility** — Does route exclusivity (competitor count) predict bridge survival under pre-fill displacement? (Phase 8A: retrospective + prospective Spearman correlation, LOO cross-validation)
- **Gradient blindness** — Does Gemini systematically fail on gradient-midpoint bridges while succeeding on causal-chain bridges? (Phase 8B: gradient vs causal bridge frequency, Gemini interaction effect)
- **Gait-normalized distance** — Can per-model normalization rescue cross-model distance comparability? (Phase 8C: raw vs normalized inter-model correlation, residual analysis)
- **Bridge dominance ratio** — Does the ratio of bridge frequency to strongest competitor frequency predict bridge fragility? (Phase 9A: retrospective + prospective Spearman correlation, threshold analysis)
- **Transformation-chain blindness** — Does Gemini selectively fail on transformation-chain bridges (material/biological processes) while succeeding on gradient-midpoint bridges? (Phase 9B: interaction test, meta-analytic combination with Phase 8B)
- **Pre-fill facilitation** — Can pre-filling the first waypoint with a congruent concept *increase* bridge frequency for marginal bridges? (Phase 9C: crossover regression, congruent vs incongruent vs neutral conditions)
- **Model generality** — Do core structural findings (distinct gaits, asymmetry, compositionality, bridge topology) generalize beyond the original 4 models to 5 new models? (Phase 10A: probe reliability protocol, gait/asymmetry/bridge comparison)
- **Pre-fill relation classes** — Does the semantic relationship between a pre-fill concept and the target bridge predict survival? (Phase 10B: on-axis substitute vs same-domain off-axis vs unrelated, Friedman test)
- **Expanded model generality** — Do core structural findings generalize to 12 models from 11 independent training pipelines? (Phase 11A: 4 new models on 12-pair battery, Llama within-family scale comparison)
- **Control pair revision** — Can we find concept pairs with no dominant navigational bridge? (Phase 11B: 4 candidate pairs screened on 6 models, stapler-monsoon retrospective across 12 models)
- **Multiverse robustness** — Are structural properties invariant under elicitation protocol variation? (Phase 11C: 2×2 waypoint × temperature ANOVA, gait rank stability via Kendall's W)

## Concept Pairs

36 pairs across a stratified matrix:

| Category | Example | What it tests |
|----------|---------|---------------|
| Anchor | Beyoncé↔erosion | Known basin structure from word-convergence |
| Hierarchy | animal↔poodle | Hypernym↔hyponym navigation |
| Cross-domain | music↔mathematics | Bridging unrelated fields |
| Polysemy | bank↔river vs bank↔mortgage | Sense disambiguation via context |
| Near-synonym | cemetery↔graveyard | Dense neighborhood friction |
| Antonym | hot↔cold | Continuum navigation |
| Controls | apple↔apple, nonsense strings | Baselines |

## Models

12 models from 11 independent training pipelines via OpenRouter:

- **Original 4:** Claude Sonnet 4.6, GPT-5.2, Grok 4.1 Fast, Gemini 3 Flash
- **Phase 10A:** MiniMax M2.5, Kimi K2.5, Qwen 3.5 397B-A17B, Llama 3.1 8B Instruct (+ GLM 5, rate-limited)
- **Phase 11A:** DeepSeek V3.2, Mistral Large 3, Cohere Command A, Llama 4 Maverick

## Project Structure

```
src/
  index.ts                        # Waypoint elicitation engine + CLI
  types.ts                        # Type definitions
  canonicalize.ts                 # Extraction, canonicalization, metrics
  scheduler.ts                    # Global request scheduler with per-model rate limiting
  metrics.ts                      # Asymmetry metrics, permutation tests, bootstrap CIs
  data/
    pairs.ts                      # Curated concept pairs with metadata + model configs
    triples.ts                    # Phase 3B concept triple definitions
    triples-phase4.ts             # Phase 4 triple definitions with predictions
    triples-phase5.ts             # Phase 5 triple/pair definitions (cue-strength, dimensionality, convergence)
    pairs-phase6.ts               # Phase 6 pair definitions (salience, forced-crossing, positional)
    pairs-phase7.ts               # Phase 7 pair definitions (anchoring, curvature, too-central)
    pairs-phase8.ts               # Phase 8 pair definitions (fragility, gradient, gait-norm)
    pairs-phase9.ts               # Phase 9 pair definitions (dominance, transformation, facilitation)
    pairs-phase10.ts              # Phase 10 pair definitions (model generality, relation classes)
    pairs-phase11.ts              # Phase 11 pair definitions (expanded generality, control revision, robustness)
experiments/                      # Batch experiment runners per phase
analysis/                         # Analysis scripts per phase
results/                          # Experiment output (gitignored)
findings/                         # Markdown analysis writeups per phase
research.md                       # Literature survey
.planning/                        # Project management (STATE, ROADMAP, specs)
```

## Stack

- **Runtime:** [Bun](https://bun.sh) (TypeScript)
- **LLM API:** [OpenRouter](https://openrouter.ai) (multi-model access)
- **NLP:** [compromise](https://github.com/spencermountain/compromise) (lemmatization)
- **Embeddings:** OpenAI text-embedding-3-large via OpenRouter

### Bridge concepts require navigational salience, not just association
"Germination" outperforms "plant" as a bridge from seed to garden despite being rated as a weaker associative cue. Process-naming bridges (spectrum, germination, deposit) outperform object-naming bridges (plant, fire) — what matters is whether the concept *moves the path forward*, not how strongly it's associated with the endpoints.

### Polysemy creates forced crossings, not dimensional barriers
Loan-bank-shore shows 0.95-1.00 bridge frequency (non-Gemini) — *higher* than same-axis paths. When a polysemous concept is the only connection between two domains, it becomes an obligatory navigational waypoint, producing the most reliable bridges in the benchmark.

### Bridge concepts anchor early, not at the midpoint
Bridges overwhelmingly appear at position 1-2 (the beginning of the path), not at the midpoint as previously assumed. Peak-detection contrast is 0.345 vs -0.080 for fixed-midpoint — the Phase 5 "W-shape null" was a methodological artifact. Bridges function as directional headings (establishing trajectory from the start), not as crossing points (connecting middles).

### Navigational salience is heavy-tailed and model-specific
The waypoint frequency distribution for any concept pair concentrates in a small number of high-frequency concepts. Claude navigates near-deterministically (entropy 2.59, often only 5-8 unique waypoints); GPT explores broadly (entropy 3.44, up to 36 unique waypoints). Gemini routes bank→ocean through a financial frame (vault-treasure-gold) while all other models use a geographic frame (river-estuary-shore).

### Pre-filling causally displaces bridge concepts
Pre-filling the first waypoint with an alternative concept causes mean bridge displacement of 0.515 (CI excludes zero). Bridge fragility is bimodal: harmony and germination collapse under any pre-fill, while sadness and dog survive at >0.80. Taxonomic bridges resist displacement (0.140 vs 0.515 overall), suggesting hierarchical structure is more robust than associative routing.

### Navigational distance is model-dependent, not objective
Cross-model correlation of navigational distances is only r = 0.170 — models don't just navigate differently, they *measure* conceptual space differently. Claude sees photon→light as distance 0.000 while GPT sees 0.729. Gait normalization produces zero improvement (r stays at 0.212), proving the disagreement is ordinal, not scalar. Some model pairs actively anti-correlate (Grok-Gemini r = -0.580). Model-independent geometry is definitively blocked with path-based measurements, though the triangle inequality still holds at 90.6%, replicating as a structural constant.

### Single-variable mechanistic models fail
Eight phases of experiments show that navigational phenomena resist simple explanations. Competitor count doesn't predict bridge fragility. Gradient type doesn't predict Gemini's failures. Scale normalization doesn't rescue cross-model distances. The benchmark reliably discovers *what* happens (structural predictions succeed at ~75%) but cannot yet predict *why* (mechanistic predictions succeed at ~15%). Phase 8's prediction accuracy of 24% is the lowest in the benchmark, marking the transition from simple to complex models of conceptual navigation.

## Status

**All 11 phases complete.** Cumulative: ~21,540 API runs across 12 models from 11 independent training pipelines.

- **Phase 1:** 2,480 runs. Models have distinct conceptual gaits (2.2x consistency gap).
- **Phase 2:** 960 runs. Navigation is fundamentally asymmetric (quasimetric space).
- **Phase 3:** 600 runs. Dual-anchor effect, hierarchical compositionality (4.9× over random), triangle inequality holds 91%.
- **Phase 4:** 1,520 runs. 81.3% prediction accuracy on bridge frequencies, universal concrete bridging, universal abstract bridge failure, pervasive Gemini fragmentation.
- **Phase 5:** 3,720 runs. Cue-strength gradient real but ragged (12/16 monotonic). Germination outperforms plant. Forced crossing discovery. Prediction accuracy drops to 42.9%.
- **Phase 6:** 2,080 runs + 280 reused. Salience distributions non-uniform. Bridge concepts anchor early (position 1-2, not midpoint). GPT highest entropy navigator.
- **Phase 7:** 2,360 runs + 920 reused. Pre-filling causally displaces bridges (0.515, CI excludes zero). Bridge fragility is bimodal. Triangle inequality replicates at 90.6%. Cross-model distance validity fails (r=0.170).
- **Phase 8:** 2,690 runs + 2,960 reused. All three primary hypotheses fail. Single-variable mechanistic models are inadequate. Prediction accuracy 24%.
- **Phase 9:** 3,037 runs + ~5,270 reused. All three primary hypotheses fail. Marginal facilitation real (3.761× survival). Bridge specification > type classification. Prediction accuracy 20%.
- **Phase 10:** 1,680 runs + 778 reused. R1/R2 replicate cross-architecture. Bridge frequency generalizes (CI includes zero). Llama 8B sole outlier (scale effect). Relation class affects bridge survival (Friedman p=0.034). Prediction accuracy 50%.
- **Phase 11:** 2,040 runs + ~340 reused. Part A: 4 new models all pass reliability, R1/R2 replicate, bridge freq CI includes zero. Mistral record gait 0.747. Llama scale confirmed. Part B: All 4 control candidates fail screening; single-pair control design inadequate. Part C: Model identity is the only substantial ANOVA factor (η²=0.242, p≈0.001). Bridge frequency most protocol-robust (>0.97 all conditions). Prediction accuracy 44%.

## Paper Writeup

The paper writeup is in `writeup/`, with Python scripts for reproducible figure/table generation:

```bash
bun run manifest   # Build paper_manifest.json from 26 analysis JSONs
bun run figures    # Generate all figures (PDF + PNG) → writeup/figures/
bun run tables     # Generate all LaTeX tables → writeup/tables/
```

See `findings/` for detailed analysis writeups per phase and `.planning/ROADMAP.md` for the full plan.
