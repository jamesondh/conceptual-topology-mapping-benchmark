# Conceptual Topology Mapping Benchmark

A novel LLM benchmark testing whether models have consistent, measurable geometric structure in how they navigate between concepts.

## The Idea

Give models two concepts, ask for intermediate waypoints, and test whether the resulting paths reveal consistent topological structure. Unlike static embedding analysis, this benchmark evaluates *behavioral navigation* — do models traverse conceptual space with predictable "gaits"?

**Builds on:** [Word convergence game](https://github.com/jamesondh/word-convergence-game) — 575 games across 4 models showing characteristic navigational patterns, semantic basins of attraction, and direction-dependent behavior.

## Key Findings

Across 5,800+ elicitation runs and 4 models, the benchmark has uncovered several surprising properties of how LLMs navigate conceptual space:

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

## Status

**Phase 4 complete. Phase 5 implementation ready.** Cumulative: 5,800+ API runs across 4 models.

- **Phase 1:** 2,480 runs. Models have distinct conceptual gaits (2.2x consistency gap).
- **Phase 2:** 960 runs. Navigation is fundamentally asymmetric (quasimetric space).
- **Phase 3:** 600 runs. Dual-anchor effect, hierarchical compositionality (4.9× over random), triangle inequality holds 91%.
- **Phase 4:** 1,520 runs. 81.3% prediction accuracy on bridge frequencies, universal concrete bridging, universal abstract bridge failure, pervasive Gemini fragmentation. Frame-crossing hypothesis: Gemini fails at conceptual frame boundaries, not at abstract concepts per se.
- **Phase 5 (ready):** Implementation complete. Cue-strength thresholds (logistic fitting), conceptual dimensionality probing (same-axis vs cross-axis), triple-anchor convergence (W-shape detection). ~3,280 planned runs. Run: `bun run phase5`.

See `findings/` for detailed analysis writeups per phase and `.planning/ROADMAP.md` for the full plan.
