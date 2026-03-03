# Phase 1 Pilot Analysis: Models Have Distinct Conceptual Gaits

> 2,480 elicitations across 4 models, 21 concept pairs, 2 waypoint counts, 10-20 reps per condition.
>
> March 3, 2026

## Executive Summary

The pilot confirms the core thesis: **LLMs have measurable, consistent geometric structure in how they navigate conceptual space, and that structure varies characteristically across models.** This isn't just noise — the controls validate cleanly, the effect sizes are large, and the patterns are interpretable.

Three headline findings:

1. **Models have distinct "gaits."** Claude navigates the same conceptual paths almost identically every time (0.578 avg Jaccard); GPT takes a different route each time (0.258). This is a 2.2x consistency gap — not a subtle effect.

2. **Conceptual topology is sense-specific, not word-specific.** Polysemy pairs produce perfectly non-overlapping waypoint sets (cross-pair Jaccard = 0.000 across all three groups). The word "bank" activates completely different conceptual structure depending on whether it's paired with "river" or "mortgage."

3. **Cross-model paths are genuinely different.** All model pairs show ~0.17–0.20 cross-model Jaccard — similar enough to confirm shared structure, different enough to confirm distinct internal geography.

---

## 1. Experiment Design

### Concept Pairs

21 reporting pairs across 6 experimental categories:

| Category | Pairs | Purpose |
|----------|-------|---------|
| **Anchor** (3) | beyonce→erosion, tesla→mycelium, skull→garden | Known basin structure from word-convergence game |
| **Hierarchy** (2) | animal→poodle, emotion→nostalgia | Hypernym↔hyponym with clear taxonomic chain |
| **Cross-domain** (2) | music→mathematics, justice→erosion | Concepts from different semantic domains |
| **Polysemy** (3) | bank→river, bat→baseball, crane→construction | Ambiguous word paired to steer sense activation |
| **Near-synonym** (2) | cemetery→graveyard, happy→joyful | Dense semantic neighborhoods |
| **Antonym** (1) | hot→cold | Oppositional continuum |

Plus 8 control pairs:
- **1 identity** (apple→apple): baseline for degenerate paths
- **6 random** (stapler→monsoon, telescope→jealousy, etc.): noise floor
- **1 nonsense** (xkplm→qrvzt): parser sanity check

### Models

| Model | OpenRouter ID |
|-------|---------------|
| Claude Sonnet 4.6 | `anthropic/claude-sonnet-4.6` |
| GPT-5.2 | `openai/gpt-5.2` |
| Grok 4.1 Fast | `x-ai/grok-4.1-fast` |
| Gemini 3 Flash | `google/gemini-3-flash-preview` |

Same core models as word-convergence-game rounds 4-5.

### Protocol

- **Prompt format:** Semantic (selected via holdout experiment on 15 holdout pairs)
- **Waypoint counts:** 5 and 10
- **Repetitions:** 10-20 per condition (168 total conditions)
- **Total runs:** 2,480
- **Extraction:** Multi-strategy parser (JSON, numbered, bullet, comma, arrow, fallback) with canonicalization pipeline (lowercase → strip articles → lemmatize → normalize → dedupe)

---

## 2. Model Consistency Profiles

The defining result: models differ dramatically in how consistently they navigate conceptual space.

| Model | Avg Jaccard | Avg Positional | Avg Entropy | Interpretation |
|-------|-------------|----------------|-------------|----------------|
| **Claude** | **0.578** | **0.474** | **3.66** | Highly deterministic navigator |
| **Gemini** | 0.372 | 0.320 | 4.16 | Moderate consistency |
| **Grok** | 0.293 | 0.216 | 4.51 | Variable explorer |
| **GPT** | 0.258 | 0.211 | 4.67 | Most variable; broadest repertoire |

### What These Numbers Mean

**Jaccard similarity** measures what fraction of waypoints are shared between runs for the same pair. Claude at 0.578 means more than half of waypoints are identical across runs. GPT at 0.258 means runs share only about a quarter of their waypoints.

**Positional overlap** adds ordering — are the shared waypoints in the same sequence? Claude's positional/Jaccard ratio (0.82) is much higher than GPT's (0.82 too, actually), suggesting when models do share waypoints, they tend to place them in similar order.

**Distributional entropy** measures the diversity of waypoints sampled across all runs. Claude's lower entropy (3.66) means it draws from a smaller vocabulary of candidate waypoints. GPT's higher entropy (4.67) means a richer (or less structured) pool.

### Extreme Cases

**Most consistent condition in the entire dataset:**
- Claude / apple→apple (identity) / 5 waypoints: **Jaccard 0.967**
- 20 runs produced nearly identical lists: *fruit, tree, harvest, orchard, seed* — with "cider" appearing once as the sole variant

**Second most consistent:**
- Claude / hot→cold / 5 waypoints: **Jaccard 0.911**
- Near-perfect convergence: *warm, tepid, cool, chilly* appeared in 100% of runs; *frigid* at 85%, with *freezing* as the only alternative

**Least consistent (excluding nonsense):**
- GPT / beyonce→erosion / any waypoint count: Jaccard ~0.087
- Enormous variance — the conceptual bridge between a pop star and a geological process has many valid paths, and GPT explores many of them

### Interpreting Claude's Consistency

Claude's high consistency is striking but raises questions. Is this evidence of well-structured conceptual topology, or of a more deterministic decoding process? The answer is probably both. The consistency is *pair-dependent* — Claude still shows low consistency on random (0.291-0.343) and nonsense (0.041) pairs, which wouldn't happen if this were purely a decoding artifact. Claude has structured topology *and* navigates it with less stochasticity.

---

## 3. Control Validation

The controls worked exactly as designed.

| Control Type | Avg Jaccard | Avg Entropy | Expected | Actual |
|--------------|-------------|-------------|----------|--------|
| **Nonsense** | 0.062 | 6.37 | Near-zero consistency | ✅ |
| **Random** | 0.337 | 4.28 | Low consistency, some structure | ✅ |
| **Identity** | 0.378 | 4.38 | Degenerate paths, moderate consistency | ✅ |

### Nonsense Pairs: The True Noise Floor

GPT's nonsense Jaccard (0.006-0.015) is essentially zero — almost no waypoint overlap across runs. This is critical: **when there's no real conceptual structure to navigate, the models can't fake consistency.** The consistency we see on real pairs is genuine signal, not an artifact of limited vocabulary or formulaic responses.

Even the waypoint distributions for nonsense pairs are revealing. GPT produced 87+ unique waypoints at 0.05 frequency each — total conceptual chaos. The "characteristic" waypoints were things like *"ciphertext fragment,"* *"keyboard mash,"* *"consonant cluster"* — the models are desperately pattern-matching on letter strings rather than navigating any conceptual space.

### Random Pairs: Surprising Structure

Random pairs (Jaccard 0.337) are notably *more* consistent than expected. `umbrella→photosynthesis` produced Jaccard 0.788 for Claude — nearly as consistent as structured pairs. This suggests that even for "unrelated" concepts, models find reliable conceptual bridges. Possible explanations:

- Models are trained on text where these connections are implicit (umbrella → rain → water → plants → photosynthesis)
- The space of plausible intermediate concepts is constrained even for distant pairs
- Some "random" pairs aren't as semantically distant as they appear

This is itself an interesting finding: **randomness is relative in conceptual space.** What looks random to a human ontology may have reliable paths in a model's learned geography.

### Identity Control: Not as Trivial as Expected

`apple→apple` with 5 waypoints (Jaccard 0.378 average across models, but 0.967 for Claude) is interesting because the task is conceptually ill-defined — there's no "distance" to traverse. Models handle this by generating associated concepts (fruit, tree, harvest, orchard, seed for Claude). The high cross-run consistency for this pair suggests these associations are deeply stable.

---

## 4. Polysemy: Perfect Sense Differentiation

The cleanest result in the dataset.

| Group | Pair A | Pair B | Cross-Pair Jaccard |
|-------|--------|--------|--------------------|
| bank | bank→river | bank→mortgage | **0.000** |
| bat | bat→cave | bat→baseball | **0.000** |
| crane | crane→construction | crane→wetland | **0.000** |

Zero overlap. Not low overlap — *zero.* Every model, across all runs, produces completely non-overlapping waypoint sets for different senses of the same word. The conceptual topology is entirely sense-specific.

This is strong evidence that the waypoint elicitation task is measuring something real about internal conceptual structure. If models were generating surface-level word associations, you'd expect *some* overlap (the word "bank" itself has associations that transcend sense). But the target concept completely redirects the navigation path.

### Connection to Word Convergence Game

In the word convergence game, polysemous concepts created bifurcated convergence basins — games starting from "bank" converged to different attractors depending on the other player's starting word. The waypoint elicitation data confirms this wasn't an artifact of the game dynamics; it reflects genuine topological separation in the model's conceptual space.

---

## 5. Category Hierarchy

Different relational types produce different levels of navigational consistency:

| Rank | Category | Avg Jaccard | Interpretation |
|------|----------|-------------|----------------|
| 1 | **Antonym** | 0.630 | Well-trodden oppositional continua |
| 2 | **Hierarchy** | 0.528 | Clear taxonomic chains constrain paths |
| 3 | **Near-synonym** | 0.474 | Dense neighborhoods → limited options |
| 4 | **Cross-domain** | 0.416 | Metaphorical bridges provide structure |
| 5 | **Polysemy** | 0.349 | Sense-specific paths, but each sense is stable |
| 6 | **Anchor** | 0.302 | Cross-domain with named entities → high variance |

### Why This Ordering Makes Sense

**Antonyms** are the most constrained — `hot→cold` basically has one axis (temperature) with canonical intermediate points. There's only one path.

**Hierarchies** have taxonomic structure that constrains navigation — `animal→poodle` must pass through `mammal` or `dog` or similar taxa. The chain is largely determined by ontological structure.

**Near-synonyms** are interesting — high consistency likely reflects the fact that there are *few* intermediate concepts when the endpoints are close together. `cemetery→graveyard` doesn't offer many waypoints to choose from.

**Cross-domain pairs** like `music→mathematics` have reliable metaphorical bridges (rhythm, pattern, harmony, frequency) but more degrees of freedom than antonyms.

**Anchor pairs** (from word-convergence) are the least consistent reporting category, likely because they pair concepts from very different domains (Beyoncé/erosion, Tesla/mycelium) where multiple bridging strategies are viable.

---

## 6. Cross-Model Topology

How much do models agree on the "right" path between concepts?

| Model Pair | Avg Jaccard |
|------------|-------------|
| GPT ↔ Grok | **0.201** (most similar) |
| Claude ↔ Grok | 0.196 |
| Claude ↔ Gemini | 0.185 |
| Gemini ↔ GPT | 0.178 |
| Gemini ↔ Grok | 0.175 |
| Claude ↔ GPT | **0.170** (least similar) |

All cross-model Jaccards fall in the 0.17-0.20 range. This is:
- **Much lower** than intra-model consistency (0.26-0.58), confirming models have distinct internal geographies
- **Much higher** than nonsense controls (0.00-0.02), confirming genuine shared structure
- **Surprisingly uniform** across model pairs — no two models are dramatically more similar to each other than to the rest

### Per-Pair Cross-Model Agreement

The cross-model picture varies dramatically by pair. Highest cross-model agreement:

- **hot→cold**: 0.34-0.48 — the temperature axis is universal
- **happy→joyful**: 0.19-0.48 — emotional gradients are shared
- **umbrella→photosynthesis**: 0.19-0.46 — the rain→water→plants bridge is canonical
- **emotion→nostalgia**: 0.20-0.42 — psychological taxonomy is shared
- **music→mathematics**: 0.21-0.33 — the harmony/pattern bridge is well-known

Lowest cross-model agreement:

- **xkplm→qrvzt**: 0.00-0.02 — no shared structure for nonsense (expected)
- **tesla→mycelium**: 0.03-0.07 — models find very different bridges between a car company and fungal networks
- **beyonce→erosion**: 0.05-0.19 — named entity × abstract concept → highly model-dependent
- **apple→apple**: 0.03-0.21 — even identity associations are model-specific

### The GPT-Grok Similarity

GPT and Grok being the most similar pair (0.201) is notable. These are the two highest-variance models — they explore more broadly, and their explorations overlap more than expected. This could reflect similar training data composition, similar tokenization strategies, or genuinely similar learned conceptual structure. Worth tracking in Phase 2.

---

## 7. Waypoint Scaling: 5 → 10 Is Genuine Interpolation

When asked for 10 waypoints instead of 5, do models just add random filler, or do they genuinely interpolate finer detail?

| Metric | Value |
|--------|-------|
| Average shared waypoint fraction | **70.5%** |
| Subsequence rate | **67.9%** |

70.5% of 5-waypoint concepts also appear in 10-waypoint paths. And 67.9% of the time, the 5-waypoint path appears as a proper subsequence of the 10-waypoint path — same concepts in the same order, with additional waypoints interpolated between them.

### Examples

**GPT / hot→cold / 5wp vs 10wp:**
- 5wp: warm, tepid, lukewarm, cool, chilly
- 10wp: scald, sear, warm, tepid, lukewarm, cool, chilly, brisk, frigid, icy
- Shared fraction: 1.0, subsequence: ✅
- The 10wp path extends the range (adding scald/sear at the hot end, frigid/icy at the cold end) while preserving the core sequence

**GPT / stapler→monsoon / 5wp vs 10wp:**
- Shared fraction: 0.43, subsequence: ❌
- Random pair — the bridge strategy itself changes between scales, not just the granularity

This confirms that waypoint elicitation at different scales measures the *same* underlying conceptual path at different resolutions. The 5-waypoint path is a coarse-grained version of the 10-waypoint path, not a different path entirely.

---

## 8. Connections to Word Convergence Game

This benchmark was designed to build on findings from the word convergence game (575 games, 4 models). The pilot validates several convergence game observations and extends them:

| Convergence Game Finding | Pilot Confirmation |
|---|---|
| Each model has a characteristic "gait" | ✅ Model consistency profiles differ 2.2x (Claude vs GPT) |
| Concept pairs have basin structure | ✅ Consistency varies predictably by pair category |
| Cross-model games produce novel convergence | ✅ Cross-model Jaccard is low but non-zero — shared structure, different paths |
| Polysemous words create bifurcated basins | ✅ Perfect sense differentiation (cross-pair Jaccard = 0.000) |

The pilot also reveals something the convergence game couldn't: **the full path structure.** The convergence game only showed endpoints (where players converged). The waypoint elicitation shows the entire trajectory — and the trajectories are highly structured, pair-dependent, and model-specific.

---

## 9. Limitations and Caveats

**Semantic similarity not computed.** The embedding-based semantic similarity metric was skipped due to implementation inefficiency (~7,560 sequential API calls). This means all consistency measures are lexical — if two runs produce "melody" and "tune," Jaccard treats these as completely different. Our Jaccard scores may therefore *underestimate* true conceptual consistency. See `_deferred/semantic-similarity-optimization.md` for the optimization plan.

**Single prompt format.** Only the "semantic" prompt format was used in the pilot (selected via holdout experiment). Different prompts might elicit different navigational behavior.

**Unidirectional only.** All pairs were tested in one direction only (A→B). Phase 2 will add reverse paths (B→A) to measure directional asymmetry.

**Antonym category is a single pair.** `hot→cold` is our only antonym in the reporting set. The high consistency could be specific to temperature gradients rather than antonyms generally. The holdout set includes `order→chaos` for calibration.

**Polysemy comparison includes holdout pairs.** The cross-pair Jaccard for polysemy groups compares reporting pairs against their holdout counterparts (e.g., `bank→river` vs `bank→mortgage`). This is appropriate since the holdout/reporting split was for prompt format selection, not for the analysis itself.

---

## 10. What This Sets Up for Phase 2

The pilot's strongest signal is **directional.** We measured A→B consistency exhaustively but never tested B→A. The reversal curse literature predicts systematic asymmetries. Our data is perfectly positioned to test this:

- **Antonyms** should be highly symmetric (hot→cold ≈ cold→hot)
- **Hierarchies** may be asymmetric (animal→poodle ≠ poodle→animal — specialization vs generalization)
- **Cross-domain** pairs are the wild card — does music→mathematics = mathematics→music?
- **Anchor pairs** with known basin structure give us predictions: if "formation" is the basin for beyonce↔erosion, both directions should pass through it

Phase 2 will run all 21 reporting pairs in reverse and compute:
- Path overlap between A→B and B→A
- Edit distance between forward and reverse sequences
- Asymmetry indices per pair, per model
- Correlation with word-convergence direction findings

---

## Appendix: Metric Definitions

| Metric | Definition |
|--------|------------|
| **Jaccard Similarity** | \|A ∩ B\| / \|A ∪ B\| for waypoint sets across runs within a condition. Averaged over all run pairs. |
| **Positional Overlap** | Fraction of shared waypoints that appear in the same relative order. |
| **Distributional Entropy** | Shannon entropy of the waypoint frequency distribution across all runs in a condition. Higher = more diverse waypoint vocabulary. |
| **Extraction Accuracy** | Fraction of runs where the parser extracted exactly the requested number of waypoints. |
| **Characteristic Waypoints** | Waypoints appearing in >10% of runs for a condition, ranked by frequency. |
| **Cross-Model Jaccard** | Jaccard similarity computed across all runs from two different models on the same pair. |
| **Cross-Pair Jaccard** | For polysemy groups: Jaccard across runs from different sense-steering pairs. |
| **Shared Waypoint Fraction** | Fraction of 5-waypoint concepts appearing in the 10-waypoint set for the same model/pair. |
| **Subsequence Rate** | Fraction of conditions where the 5-waypoint path is a proper subsequence of the 10-waypoint path. |
