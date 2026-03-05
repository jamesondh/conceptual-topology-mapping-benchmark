# Conceptual Topology Mapping Benchmark

A novel LLM benchmark testing whether models have consistent, measurable geometric structure in how they navigate between concepts.

## The Idea

Give models two concepts, ask for intermediate waypoints, and test whether the resulting paths reveal consistent topological structure. Unlike static embedding analysis, this benchmark evaluates *behavioral navigation* — do models traverse conceptual space with predictable "gaits"?

**Builds on:** [Word convergence game](https://github.com/jamesondh/word-convergence-game) — 575 games across 4 models showing characteristic navigational patterns, semantic basins of attraction, and direction-dependent behavior.

## Key Findings

Across 14,000+ elicitation runs and 4 models across 7 phases, the benchmark has uncovered several surprising properties of how LLMs navigate conceptual space:

### Models have distinct "conceptual gaits"
Claude produces 2.2× more consistent waypoints than GPT (avg Jaccard 0.578 vs 0.258). Each model navigates the same conceptual terrain with a characteristic style — not just different vocabulary, but structurally different paths. Cross-model agreement is strikingly low (~0.18 Jaccard), suggesting each LLM has its own "conceptual geography."

### Conceptual space is quasimetric, not metric
The path from A→B is fundamentally different from B→A. Mean directional asymmetry is 0.811 across all pairs, and 87% of conditions show statistically significant asymmetry. Even supposedly "symmetric" relationships like synonyms are directional. This means LLM conceptual space has a consistent orientation — direction matters semantically.

### Polysemy routing is remarkably clean
When the same ambiguous word (e.g., "bank") is steered toward different senses via its endpoint (river vs. mortgage), the resulting paths diverge completely (0.000 cross-pair Jaccard). LLMs don't just pick different words — they route through entirely distinct intermediate concept spaces.

### Hierarchical paths compose like a metric space
Paths along taxonomic chains (animal→dog→poodle) show 4.9× more waypoint overlap than random concept triples. The triangle inequality holds in 91% of cases. Conceptual navigation has genuine mathematical structure, not just surface associations.

### Bridge concepts are predictable — but model-dependent
When two concepts share an obvious intermediary (music→*harmony*→mathematics), that bridge concept appears on the direct path with 81.3% prediction accuracy for concrete bridges. But abstract bridges fail universally (0% for "metaphor"). Claude uses "harmony" 100% of the time on music→mathematics; Gemini uses it 0%.

### Gemini fragments at conceptual frame boundaries
Gemini shows systematic isolation from other models (mean bridge frequency delta: 0.336 vs 0.200 for non-Gemini pairs). This isn't just about abstract vs. concrete — Gemini fails specifically when navigation requires crossing between conceptual frames, suggesting a fundamentally different internal organization of semantic space.

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

Four models via OpenRouter: Claude Sonnet 4.6, GPT-5.2, Grok 4.1 Fast, Gemini 3 Flash. Same core models as word-convergence-game rounds 4-5.

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
Cross-model correlation of navigational distances is only r = 0.170 — models don't just navigate differently, they *measure* conceptual space differently. Claude sees photon→light as distance 0.000 while GPT sees 0.729. This rules out cross-model curvature comparison but the triangle inequality still holds at 90.6%, replicating as a structural constant.

## Status

**Phase 8 implemented, awaiting experiment execution.** Cumulative: 14,000+ API runs across 4 models and 7 phases (Phase 8 adds ~2,930 new runs).

- **Phase 1:** 2,480 runs. Models have distinct conceptual gaits (2.2x consistency gap).
- **Phase 2:** 960 runs. Navigation is fundamentally asymmetric (quasimetric space).
- **Phase 3:** 600 runs. Dual-anchor effect, hierarchical compositionality (4.9× over random), triangle inequality holds 91%.
- **Phase 4:** 1,520 runs. 81.3% prediction accuracy on bridge frequencies, universal concrete bridging, universal abstract bridge failure, pervasive Gemini fragmentation. Frame-crossing hypothesis: Gemini fails at conceptual frame boundaries, not at abstract concepts per se.
- **Phase 5:** 3,720 runs. Cue-strength gradient real but ragged (12/16 monotonic). Germination outperforms plant (process-naming > object-naming). Gemini threshold hypothesis fails. Forced crossing discovery (loan-bank-shore at 0.95-1.00). Fire dead as bridge concept. W-shape fails in aggregate but Claude shows 0.52 on music→mathematics. Prediction accuracy drops to 42.9% as experiments shift from characterization to mechanism.
- **Phase 6:** 2,080 runs + 280 reused. Salience distributions non-uniform (7/8 KS reject). Forced-crossing asymmetry hypothesis falsified (0.817 ≈ baseline). Bridge concepts anchor early (position 1-2, not midpoint). Peak-detection contrast 0.345 vindicates Phase 5C. GPT highest entropy navigator. Gemini routes bank-ocean through financial frame (vault-treasure-gold).
- **Phase 7:** 2,360 runs + 920 reused. Pre-filling causally displaces bridges (0.515, CI excludes zero). Bridge fragility is bimodal (harmony/germination collapse, sadness/dog survive). Taxonomic bridges resist displacement (0.140). Triangle inequality replicates at 90.6%. Cross-model distance validity fails (r=0.170). Too-central categorization was wrong — only fire/water qualify. Gradient > causal-chain bridges (0.730 vs 0.496). Gemini systematic zeros on obvious univocal bridges.

- **Phase 8:** ~2,930 runs (pending execution). Bridge fragility mechanism (route exclusivity as predictor), Gemini gradient blindness (gradient-midpoint vs causal-chain), gait-normalized distance (rescuing cross-model geometry). Codex-reviewed implementation.

See `findings/` for detailed analysis writeups per phase and `.planning/ROADMAP.md` for the full plan.
