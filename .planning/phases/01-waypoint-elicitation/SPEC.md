# Phase 1: Waypoint Elicitation Engine + Pilot Data

## Goal
Build the core primitive — prompt a model with two concepts, get back ordered intermediate waypoints — and generate enough pilot data to validate the approach, establish baselines via controls, and surface initial patterns.

## Tasks

### 1. Waypoint elicitation engine
- Prompt design: test 2 single-shot prompt formats and compare output quality
  - Direct: "List N intermediate concepts that form a path from A to B"
  - Semantic: "Imagine walking through conceptual space from A to B. What landmarks do you pass?"
  - Note: iterative prompting (ask for one bridge, then another) is a fundamentally different task class — defer to a separate experiment, don't compare directly against single-shot formats
- Support configurable waypoint count (3, 5, 7, 10)
- Multi-model via OpenRouter (same models as word-convergence: Claude, GPT, Grok, Gemini)
- JSON result output with full metadata:
  - model ID (exact OpenRouter model string, not alias)
  - provider route
  - concept pair, waypoint count, temperature
  - prompt format, prompt text
  - timestamp, retry count, failure mode (if any)
  - raw response (full text before waypoint extraction)
  - extracted waypoints (post-processing)
- Waypoint extraction pipeline: parse model response → lemmatize → lowercase → dedupe near-synonyms
- CLI interface: `bun run index.ts --model X --from A --to B --waypoints N`

### 2. Concept pair curation — stratified matrix

Design pairs along controlled axes, not just curated intuition. Cover the interaction between navigational friction and reasoning depth.

**Axis 1: Concreteness**
- Concrete: physical objects, places, organisms
- Abstract: qualities, processes, relations

**Axis 2: Relational type**
- Hierarchical: hypernym↔hyponym
- Associative: thematically related, no taxonomic link
- Cross-domain: concepts from unrelated fields
- Near-synonym: dense neighborhood, high friction

**Axis 3: Polysemy**
- Unambiguous: single clear sense
- Ambiguous: multiple senses that could steer different paths

#### Pair sets

**Anchor pairs** (from word-convergence, known basin structure — for cross-experiment comparison):
- Deep basin: Beyoncé↔erosion ("formation"), Tesla↔mycelium ("network")
- Moderate basin: shadow↔melody ("echo"), skull↔garden
- Flat terrain: Kanye West↔lattice

**Hierarchy pairs** (concrete + abstract):
- animal↔poodle, vehicle↔skateboard (concrete hypernym↔hyponym)
- emotion↔nostalgia, structure↔lattice (abstract hypernym↔hyponym)

**Cross-domain pairs:**
- music↔mathematics, cooking↔architecture
- justice↔erosion, time↔crystal

**Polysemy pairs** (same word, different pairing steers different sense):
- bank↔river vs bank↔mortgage
- bat↔cave vs bat↔baseball
- crane↔construction vs crane↔wetland

**Near-synonym / dense neighborhood pairs** (friction test):
- cemetery↔graveyard, forest↔woods
- happy↔joyful, anger↔rage

**Antonym continua:**
- hot↔cold, order↔chaos

**Control pairs:**
- Identity: apple↔apple, justice↔justice (should produce empty/trivial paths — baseline for "no distance")
- Random unrelated: 5-10 pairs sampled randomly per batch (noise floor — what does a path look like when there's no natural bridge?)
- Shuffled token strings: nonsense↔nonsense (do models hallucinate structure where none exists?)

**Holdout set:** Reserve ~5 pairs from each category for prompt format selection. Report findings on the remaining pairs — don't pick prompt format and evaluate on the same data.

~35-40 pairs total (including controls), split into prompt-selection holdout (~15) and reporting set (~20-25).

### 3. Metrics & canonicalization

Raw waypoint strings need processing before any comparison:

**Canonicalization pipeline:**
- Lowercase
- Lemmatize (e.g., "running" → "run", "cities" → "city")
- Strip determiners/articles if models include them
- Phrase normalization (multi-word → canonical form)

**Consistency metrics (intra-model, same pair across runs):**
- Jaccard similarity on canonicalized waypoint sets
- Positional overlap (are the same waypoints appearing at the same positions?)
- Semantic similarity: embed waypoints (text-embedding-3-large or similar), compute pairwise cosine → average. Catches "cemetery" ≈ "graveyard" that string match misses.
- Distributional entropy of waypoint sets across runs (high entropy = unstable, low = consistent)

**Distance metric considerations (for later geometric claims):**
- `1 - cosine_similarity` is NOT a true metric (violates triangle inequality in general). Note this now.
- Angular distance (`arccos(cosine_sim) / π`) is metric-safe.
- Word Mover's Distance is explicitly metric. Consider for path-level comparison.
- Document which distance is used and why — predeclare before running experiments.

**Small external anchor subset (anti-circularity):**
- For ~10 pairs, compute ConceptNet shortest paths as independent comparison
- Not full external validation (that's deferred), but enough to detect if self-grounded patterns are artifacts

### 4. Pilot experiments

**Prompt format selection** (on holdout pairs):
- Run holdout pairs across 4 models × 2 formats × 10 reps
- Pick format with highest intra-model consistency and cleanest extraction
- Lock format for all subsequent experiments

**Main pilot** (on reporting pairs):
- Run each pair across 4 models × 2 waypoint counts (5 and 10) × 10-20 repetitions
  - Use 20 reps on a smaller diagnostic subset (~10 pairs covering each axis)
  - Use 10 reps on remaining pairs
  - Total: ~2000-3000 runs
- Measure:
  - **Intra-model consistency**: how stable are waypoints across repeated runs?
  - **Waypoint count effect**: do 5-waypoint and 10-waypoint paths share the same structure at different resolutions?
  - **Cross-model comparison**: first look at whether models produce structurally different paths
  - **Control baselines**: what do identity, random, and nonsense pairs produce?
  - **Polysemy steering**: do paired-polysemy pairs (bank↔river vs bank↔mortgage) produce clearly different paths?

### 5. Pilot analysis & findings
- Analysis script computing all metrics above
- Findings writeup with:
  - Prompt format selection rationale
  - Consistency profiles per model (which models are stable? which are chaotic?)
  - Control results (do identity/random/nonsense pairs behave as expected?)
  - Cross-model differences (first look at "gaits")
  - Waypoint count effect (resolution-dependent structure?)
  - Polysemy and friction observations
  - Anomalies, surprises, rabbit holes
- Decision: what's the most interesting signal to chase in phase 2?

## Files
- `index.ts` — waypoint elicitation engine
- `pairs.ts` — curated concept pair sets (with metadata: category, axes, holdout flag)
- `canonicalize.ts` — waypoint extraction + canonicalization pipeline
- `experiments/01-prompt-selection.ts` — prompt format comparison on holdout set
- `experiments/01-pilot.ts` — main pilot batch runner
- `analysis/01-pilot.ts` — analysis script
- `findings/01-pilot.md` — findings writeup
- `results/` — JSON output (gitignored if large)

## Docs to update
- `AGENTS.md` if conventions change
- `STATE.md` with completion summary
- `ROADMAP.md` to advance phase status

## Verify
- Engine runs cleanly across all 4 models
- Results JSON includes all metadata fields (exact model ID, raw response, etc.)
- Canonicalization handles edge cases (multi-word, plural, articles)
- Semantic similarity metric produces sensible scores on known-similar waypoints
- Control pairs produce expected baselines (identity → trivial, random → noisy)
- At least 1500 successful runs in pilot dataset
- Prompt format selected on holdout set, not reporting set

## Done when
- Engine is stable and produces clean waypoint data with full metadata
- Canonicalization pipeline handles model output reliably
- Prompt format is selected on holdout data
- Control baselines are established
- Small external anchor comparison exists for anti-circularity check
- Initial findings doc exists with observations across all dimensions
- Phase 2 direction is informed by data
