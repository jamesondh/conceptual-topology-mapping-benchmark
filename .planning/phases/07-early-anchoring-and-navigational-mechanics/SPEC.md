# Phase 7: Early Anchoring and Navigational Mechanics

## Context

Phase 6 delivered one landmark discovery, one landmark failure, and one distributional vindication -- and together they rewrite the navigational model of bridge concepts. The landmark discovery is **early anchoring**: bridge concepts overwhelmingly anchor at positions 1 or 2 in 7-waypoint paths (8 of 10 pairs), not at the midpoint as Phase 5C assumed. The landmark failure is the **forced-crossing asymmetry hypothesis** (H4): polysemous bottlenecks do not reduce path asymmetry, establishing 0.811 as a structural constant resistant to topological manipulation. The vindication is the **heavy-tailed salience landscape** (R8): navigational traffic concentrates through a small number of high-frequency waypoints, grounding bridge-as-bottleneck in distributional data.

Phase 6's most important open question is causal: **why do bridges anchor early?** The directional-heading hypothesis says bridges are selected first because they establish the trajectory toward the target. But this is consistent with, not distinguished from, an alternative: bridges anchor early because they are the highest-frequency associates of the starting concept (associative primacy). Phase 7's primary experiment directly tests between these two accounts by manipulating the starting conditions.

Phase 7 also pursues two high-priority questions that Phase 6 elevated: **curvature estimation around polysemous hubs** (where forced-crossing positional instability, SD 1.71 vs 0.52, suggests genuine geometric singularity) and **the too-central boundary** (what separates "obvious and useful" bridges like warm/cool on hot-cold from "obvious and redundant" ones like fire on spark-ash?).

Phase 7 is designed as three experiments, ordered by priority and cost:

- **Part A** -- Early-anchoring causal test (~1,260 runs, ~$4-5)
- **Part B** -- Curvature estimation around polysemous hubs (~760 runs, ~$2.50-3.50)
- **Part C** -- Too-central boundary characterization (~480 runs, ~$1.50-2.50)

Total budget: ~2,500 new API runs, ~$8-12.

---

## Part A: Early-Anchoring Causal Test

**Core question:** Is early anchoring caused by the bridge functioning as a directional heading (steering mechanism), or by the bridge being the strongest associate of the starting concept (associative primacy)?

**Background:** Phase 6C found that 8 of 10 pairs show cross-model modal bridge position at 1-2 in a 7-waypoint path. The sole exception is animal-poodle, where the taxonomic bridge "dog" anchors at position 4-5. The directional-heading hypothesis (Section 3 of 06-analysis.md) proposes that the bridge is selected first because it is the concept that most efficiently establishes the trajectory from A toward C. If this is correct, the bridge's early position is contingent on the model's need for directional information at the start. If the bridge is instead simply a high-frequency associate of A (associative primacy), its position should be independent of navigational context.

**Hypothesis:** Bridge concepts anchor early because they serve as directional headings, not because they are the strongest associates of the starting concept. When a non-bridge first waypoint is pre-filled (removing the need for the bridge to establish direction), the bridge should either (a) disappear from the path entirely, (b) shift to a later position, or (c) decrease in frequency. If the bridge is merely a high-frequency associate of A, pre-filling a different first waypoint should not affect bridge presence or position -- the bridge should still appear at position 2 (one position later than its unconstrained modal position of 1).

**Primary pre-registered test:** For pairs where the unconstrained modal bridge position is 1, the bridge frequency at position 2 in the pre-filled condition is significantly lower than the bridge frequency at position 1 in the unconstrained condition. 95% bootstrap CI on (unconstrained position-1 frequency minus pre-filled position-2 frequency) excludes zero. Secondary: the bridge's mean position in the pre-filled condition is significantly later than its mean position + 1 in the unconstrained condition (the +1 accounts for the mechanical shift from pre-filling).

### Design

The experiment uses a **pre-filled first waypoint** manipulation. For each focal pair A-C with known bridge B, we collect four conditions:

1. **Unconstrained (control):** "List 7 intermediate concepts between A and C." (Standard prompt, reuse Phase 6C data where available.)
2. **Incongruent pre-fill:** "The first concept between A and C is [X]. List the remaining 6 intermediate concepts." The pre-filled concept X is a plausible but directionally incongruent waypoint -- it does not point toward the target in the same way the bridge does.
3. **Congruent pre-fill:** Same format, but X is a concept directionally similar to the bridge (establishes a similar heading). This distinguishes the "heading already set" from "heading blocked" scenarios.
4. **Neutral pre-fill (sham control):** Same format, but X is a generic, weakly related concept (e.g., "concept" or "idea" for any pair). This controls for the mechanical effect of pre-filling any concept at position 1 -- if the bridge shifts simply because a slot is occupied, the neutral and incongruent conditions should show equal displacement.

The pre-filled manipulation tests whether the bridge anchors early because it steers (in which case incongruent pre-fills should suppress/displace the bridge more than congruent or neutral pre-fills) or because it is activated first by association with A (in which case all pre-fill conditions should show equal displacement -- the bridge simply shifts to position 2). The congruent vs. incongruent comparison is the critical discriminator: if heading direction matters, incongruent > congruent displacement.

#### Focal Pairs and Pre-Fill Selections

| # | Pair (A -> C) | Bridge | Unconstrained Modal Pos | Pre-Fill Concept (X) | X Source | X Phase 6A Freq |
|---|---------------|--------|-------------------------|---------------------|----------|----------------|
| 1 | music -> mathematics | harmony | 1-2 | symmetry | Claude 6A landscape | 0.875 |
| 2 | sun -> desert | heat | 1 | drought | Claude/GPT 6A landscape | 0.875-1.00 |
| 3 | seed -> garden | germination | 1 | sprout | Grok/GPT 6A landscape | 0.625-0.875 |
| 4 | light -> color | spectrum | 1-2 | wavelength | GPT/Grok 6A landscape | 0.925-0.950 |
| 5 | bank -> ocean | river | 1 | estuary | GPT/Grok 6A landscape | 0.850-0.925 |
| 6 | emotion -> melancholy | sadness | 2 | mood | GPT/Grok 6A landscape | 0.925-1.00 |
| 7 | loan -> shore | bank | 1-2 | interest | new (financial associate of loan) | predicted 0.30-0.60 |
| 8 | animal -> poodle | dog | 4-5 | mammal | new (taxonomic intermediate) | predicted 0.30-0.60 |

Pair 8 (animal-poodle) serves as a critical control. Since "dog" anchors at position 4-5 rather than position 1-2, the directional-heading hypothesis predicts that pre-filling "mammal" at position 1 should have little effect on dog's position -- it is already late because it is a taxonomic intermediate, not a directional heading. If pre-filling shifts dog's position on animal-poodle as much as it shifts bridges on other pairs, the associative-primacy account is favored.

Pair 7 (loan-shore) tests the forced-crossing variant. "Bank" is obligatory on this path (0.95-1.00 frequency for non-Gemini models). If bank is a directional heading, pre-filling "interest" (a financial concept that does not point toward "shore") should disrupt the path. If bank is obligatory regardless, it should appear at position 2 with unchanged frequency.

#### Pre-Fill Selection Criteria

**Incongruent pre-fills** are selected to satisfy three constraints:
1. **Plausible as a first waypoint.** The concept appeared at >20% frequency somewhere in the pair's 6A salience landscape, establishing that models do sometimes route through it.
2. **Not the bridge.** The concept is not the primary bridge and does not name the same mechanism.
3. **Directionally incongruent with the bridge.** The concept should not establish the same heading as the bridge. "Drought" establishes a different heading than "heat" on sun-desert (drought is endpoint-adjacent to desert; heat is the mechanistic connection). Some pre-fills in the table above have high 6A frequency (0.875-1.00); these are acceptable because they are frequent *and* directionally distinct from the bridge. The selection criterion is directional incongruence, not rarity.

**Congruent pre-fills** are selected to establish the same directional heading as the bridge. For example, "wavelength" on light-color is scientifically adjacent to "spectrum" and establishes a similar physics-of-light heading. If congruent pre-fills produce similar displacement to incongruent ones, the heading mechanism is not responsible.

**Neutral pre-fills** are semantically generic concepts with weak directional commitment: "element," "aspect," "phenomenon," or "thing." These control for the mechanical effect of occupying position 1.

### Run Budget

| Condition | Pairs | Reps/model | Models | Runs |
|-----------|-------|-----------|--------|------|
| Incongruent pre-fill (new) | 8 | 10 | 4 | 320 |
| Congruent pre-fill (new) | 8 | 10 | 4 | 320 |
| Neutral pre-fill (sham control, new) | 8 | 10 | 4 | 320 |
| Unconstrained control (new, for pairs 7-8 only) | 2 | 15 | 4 | 120 |
| Unconstrained control (reuse Phase 6C data, pairs 1-6) | 6 | 10 (existing) | 4 | 0 |
| Supplemental unconstrained (pairs 1-6, top up to 15 reps) | 6 | 5 | 4 | 120 |
| **Total new runs** | | | | **1,200** |

Adjusted with 5% retry buffer: **~1,260 new runs.**

Note: The three pre-fill conditions (incongruent, congruent, neutral) are necessary to distinguish directional-heading from associative-primacy from mechanical-slot-shift explanations. Using 10 reps per condition (down from 15) keeps total cost manageable while providing sufficient power for the primary bootstrap comparison across 8 pairs x 4 models.

#### Why 15 Reps

The effect of interest is bridge presence/absence and positional shift. Phase 6C used 10 reps per pair/model, which was sufficient to identify modal positions but produced noisy frequency estimates (SE ~ 0.15 for bridge frequency 0.50). 15 reps reduces SE to ~0.13 and provides better power for the primary bootstrap test comparing conditions. Going beyond 20 provides diminishing returns for this binary-outcome variable.

### Analysis Plan

1. **Bridge displacement test (primary).** For each pair/model, compute bridge frequency at its modal position in the unconstrained condition. Compare to bridge frequency at (modal position + 1) in the pre-filled condition. If the bridge simply shifts one slot mechanically, these should be equal. If the bridge is suppressed or displaced further, the pre-filled frequency should be lower. Bootstrap CI on the paired difference across all 8 pairs x 4 models.

2. **Bridge survival rate.** For each pair/model in the pre-filled condition, compute the fraction of paths that contain the bridge concept at any position. Compare to bridge frequency (any position) in the unconstrained condition. If the bridge is a directional heading, pre-filling an alternative heading should reduce bridge survival. If it is a high-frequency associate, survival should remain high.

3. **Positional shift analysis.** For paths where the bridge survives in the pre-filled condition, compute its mean position. Compare to (mean unconstrained position + 1). If the bridge shifts more than 1 position, the pre-fill is displacing it beyond mechanical shift -- the bridge does not simply "slide right" when another concept occupies position 1.

4. **Animal-poodle control comparison.** Compare the magnitude of bridge displacement on animal-poodle (taxonomic, non-heading bridge) to the mean displacement on heading-bridge pairs (pairs 1-6). If heading bridges show larger displacement than the taxonomic bridge, this supports the directional-heading account. If displacement is comparable, associative primacy is favored.

5. **Forced-crossing robustness (pair 7).** Test whether the obligatory bridge "bank" on loan-shore resists displacement. If bank survives pre-filling at >90% frequency and shifts by exactly 1 position, forced-crossing bridges are mechanistically different from heading bridges. If bank is suppressed, the directional-heading mechanism overrides even obligatory bottlenecks.

6. **Pre-fill heading congruence.** For pairs where the pre-fill concept establishes a heading similar to the bridge (e.g., wavelength on light-color may point in the same direction as spectrum), check whether bridge displacement is reduced compared to pairs with incongruent pre-fills. If heading congruence reduces displacement, this confirms the directional mechanism: a heading-compatible pre-fill reduces the need for the bridge less than an incompatible one.

7. **Per-model analysis.** Test whether Claude (rigid gait) shows different displacement patterns than GPT (broad explorer). The directional-heading hypothesis predicts Claude's bridges are more displaceable because its deterministic navigation depends more on the initial heading; GPT's broader exploration should be more resilient to pre-fill manipulation.

### Predictions

1. Bridge frequency at (modal position + 1) in the pre-filled condition is at least 0.15 lower than bridge frequency at modal position in the unconstrained condition, across the aggregate of 8 pairs. Bootstrap CI on the difference excludes zero.
2. Bridge survival rate (any position) drops by at least 0.10 in the pre-filled condition for heading-bridge pairs (pairs 1-6), but not for the taxonomic pair (pair 8, animal-poodle).
3. For paths where the bridge survives, mean position shift is greater than 1.5 positions (more than the mechanical +1 from pre-filling), indicating genuine displacement rather than slot-shifting.
4. On loan-shore (pair 7), "bank" survives at >85% frequency in the pre-filled condition, showing that forced-crossing bridges are more resistant to displacement than heading bridges. Bank shifts by approximately 1.0 positions (mechanical shift only).
5. Animal-poodle shows <0.05 bridge displacement (dog stays at position 4-5 regardless of pre-fill), confirming that taxonomic positioning operates by a different mechanism.
6. Claude shows the largest bridge displacement effect (highest sensitivity to pre-fill manipulation), consistent with its deterministic reliance on initial heading.
7. Pairs where the pre-fill concept is directionally congruent with the bridge (light-color with wavelength) show weaker displacement than pairs with incongruent pre-fills (sun-desert with drought).

---

## Part B: Curvature Estimation Around Polysemous Hubs

**Core question:** Do polysemous concepts create regions of high navigational curvature -- singular points where the local geometry deviates sharply from the flat space that describes most of the navigational landscape?

**Background:** Phase 6B showed that forced crossings do not reduce asymmetry, but Phase 6C showed that forced-crossing bridges are positionally unstable (SD 1.71 vs 0.52 for non-forced bridges). The positional instability concentrated at polysemous pivot points suggests these concepts sit at frame junctions where the navigational geometry is irregular. The deferred curvature estimation proposal (`.planning/_deferred/curvature.md`) outlined the Gauss-Bonnet approach: excess triangle inequality slack as a proxy for curvature. Phase 7B implements this with a targeted design.

**Hypothesis:** Triangles with a polysemous concept at one vertex show significantly greater triangle inequality excess (positive curvature proxy) than triangles with non-polysemous concepts at all vertices. Polysemous hubs bend the navigational space around them, producing higher curvature in their neighborhood.

**Primary pre-registered test:** Mean triangle inequality excess for polysemous-vertex triangles is significantly greater than for non-polysemous-vertex triangles. 95% bootstrap CI on (polysemous excess minus non-polysemous excess) excludes zero.

### Design

#### Curvature Estimation Method

For a triangle with vertices A, B, C, the triangle inequality states:

    d(A,C) <= d(A,B) + d(B,C)

The **excess** is defined as:

    excess = d(A,B) + d(B,C) - d(A,C)

In flat (Euclidean) space, the excess is positive but small -- the direct route is nearly as long as the two-leg route. In positively curved space (like a sphere), the excess is large -- the two-leg route is much longer than the direct route because the legs bulge outward. In negatively curved space (hyperbolic), the excess can be very small or even negative (triangle inequality violations).

**Distance metric:** We estimate d(A,B) as the mean pairwise Jaccard *between* A-to-B paths from different runs: for each pair of runs (i,j) where i≠j, compute the Jaccard overlap of their waypoint sets, then d(A,B) = 1 minus the mean of these pairwise overlaps. This is a cross-run distance metric that captures how consistently models navigate between two concepts, not the consistency of repeated runs on the same leg.

**Methodological caveat:** This distance metric conflates navigational geometry with run-to-run stochasticity. A "long" distance could mean A and B are genuinely far apart in conceptual space, or it could mean the model explores different routes on each run. The excess therefore reflects a mixture of geometric curvature and navigational variance. To mitigate this, we include a pre-registered validity check: the distance should correlate with intuitive semantic distance (r > 0.30 across the 24 legs), and the per-model distances for the same leg should correlate across models (mean r > 0.50). If these checks fail, the curvature estimates are uninterpretable and Part B should be treated as a distance-metric validation rather than a curvature measurement.

**Alternative distance metric (fallback):** If the Jaccard-based distance fails validity checks, compute embedding-space distances using a lightweight sentence embedding model (e.g., all-MiniLM-L6-v2) on the concept words. This provides a model-independent distance but loses the behavioral-navigation signal. Report both metrics if the primary fails validity checks.

#### Triangle Selection

**Polysemous-vertex triangles (the polysemous concept is at vertex B):**

| # | A | B (polysemous) | C | Polysemy Type | Senses |
|---|---|----------------|---|--------------|--------|
| 1 | loan | bank | river | Homonym | financial / geographic |
| 2 | deposit | bank | shore | Homonym | financial / geographic |
| 3 | photon | light | heavy | Homonym | electromagnetic / weight |
| 4 | candle | light | feather | Homonym | illumination / weight |

**Non-polysemous-vertex triangles (control):**

| # | A | B (non-polysemous) | C | Relationship |
|---|---|---------------------|---|-------------|
| 5 | sun | heat | desert | Causal chain |
| 6 | seed | germination | garden | Process chain |
| 7 | music | harmony | mathematics | Cross-domain |
| 8 | word | sentence | paragraph | Compositional |

#### Leg Collection Strategy

Each triangle requires three legs: A-B, B-C, and A-C. Some legs are available from prior phases:

| Triangle | Leg | Prior Data | New Runs Needed |
|----------|-----|-----------|----------------|
| 1 (loan-bank-river) | All 3 legs | loan-shore from 6B (partial) | 3 legs x 10 reps x 4 models = 120 |
| 2 (deposit-bank-shore) | All 3 legs | deposit-river from 6B (partial) | 3 legs x 10 reps x 4 models = 120 |
| 3 (photon-light-heavy) | AC leg | photon-heavy from 5B | 2 new legs x 10 reps x 4 models = 80 |
| 4 (candle-light-feather) | None | None | 3 legs x 10 reps x 4 models = 120 |
| 5 (sun-heat-desert) | AC leg | sun-desert from 6A | 2 new legs x 10 reps x 4 models = 80 |
| 6 (seed-germination-garden) | AC leg | seed-garden from 6A | Partial reuse; estimate 1 new leg = 40 |
| 7 (music-harmony-mathematics) | AC leg | music-mathematics from 6A | 2 new legs x 10 reps x 4 models = 80 |
| 8 (word-sentence-paragraph) | AC leg | 5A data | 2 new legs x 10 reps x 4 models = 80 |

**Note on reuse:** Prior phase data used 5-waypoint paths (Phases 1-5) or varied between 5 and 7 waypoints. For consistency, all new runs use 5 waypoints. Where prior AC-leg data exists at 5 waypoints, it is reused directly. Where only 7-waypoint data exists (Phase 6), the 5-waypoint subset is extracted or new 5-waypoint runs are collected.

### Run Budget

Per-triangle breakdown (each leg = 10 reps x 4 models = 40 runs):

| Triangle | New Legs Needed | New Runs |
|----------|----------------|----------|
| 1 (loan-bank-river) | 3 legs | 120 |
| 2 (deposit-bank-shore) | 3 legs | 120 |
| 3 (photon-light-heavy) | 2 legs (AC reuse 5B) | 80 |
| 4 (candle-light-feather) | 3 legs | 120 |
| 5 (sun-heat-desert) | 2 legs (AC reuse 6A) | 80 |
| 6 (seed-germination-garden) | ~1 leg (partial reuse) | 40 |
| 7 (music-harmony-mathematics) | 2 legs (AC reuse 6A) | 80 |
| 8 (word-sentence-paragraph) | 2 legs (AC reuse 5A) | 80 |
| **Subtotal** | | **720** |

After 5% retry buffer: **~760 new runs.**

Note: the leg table sums to 720 raw runs. Prior estimate of ~640 was based on more aggressive reuse assumptions that do not hold after verifying which prior data is at 5 vs 7 waypoints.

### Analysis Plan

1. **Path dissimilarity distances.** For each leg of each triangle, compute d(X,Y) = 1 - mean Jaccard overlap across 10 runs per model. Report all 24 distances (8 triangles x 3 legs) per model.

2. **Triangle inequality check.** For each triangle and model, verify d(A,C) <= d(A,B) + d(B,C). Report violation rate. Phase 3B found 91% compliance; this should replicate.

3. **Excess computation.** For each triangle and model, compute excess = d(A,B) + d(B,C) - d(A,C). Report per-triangle, per-model, and aggregate.

4. **Polysemous vs. non-polysemous comparison (primary test).** Bootstrap CI on (mean polysemous excess minus mean non-polysemous excess). Primary test: CI excludes zero, polysemous excess is greater.

5. **Cross-axis vs. same-axis curvature.** Within polysemous triangles, compare excess when A and C are on different semantic axes (loan-bank-river: financial-geographic) vs. same axis (loan-bank-savings: financial-financial, data from Phase 5B). Cross-axis should show higher excess if curvature reflects frame-junction geometry.

6. **Gemini curvature divergence.** Test whether Gemini shows different curvature profiles from other models. Gemini's frame-crossing failure (vault-treasure-gold on bank-ocean) suggests its polysemous curvature is extreme -- it navigates around the polysemous hub rather than through it, which should produce higher excess.

7. **Per-model curvature profiles.** Report excess for each model separately. If curvature is a property of the conceptual space (pair-determined), models should show similar excess profiles. If curvature is a property of navigational strategy (model-determined), excess should vary by model.

### Predictions

1. Polysemous-vertex triangles show mean excess at least 0.10 higher than non-polysemous-vertex triangles. Bootstrap CI on the difference excludes zero.
2. Triangle inequality holds for >85% of triangle/model combinations (replicating Phase 3B).
3. Cross-axis polysemous triangles (loan-bank-river, photon-light-heavy) show higher excess than same-axis triangles from the same focal concept (if comparable data is available), indicating that frame-crossing curvature exceeds within-frame curvature.
4. Gemini shows the highest mean polysemous excess among the four models, consistent with its frame-crossing difficulty (navigating around the polysemous hub produces longer indirect paths).
5. Non-polysemous-vertex triangles show low excess (< 0.15), consistent with approximately flat navigational geometry in single-frame regions.
6. The excess for bank-mediated triangles (1-2) is higher than for light-mediated triangles (3-4), reflecting bank's higher polysemous distinctness (Jaccard 0.011-0.062 between senses vs. light's potentially more overlapping senses).

---

## Part C: Too-Central Boundary Characterization

**Core question:** What separates bridge concepts that are "obvious and useful" (warm, cool, chilly on hot-cold) from those that are "obvious and redundant" (fire on spark-ash)?

**Background:** Phase 5 discovered the too-central phenomenon: "fire" bridges spark-to-ash at near-zero frequency despite being causally implied by both endpoints. Phase 6A then revealed that hot-cold -- a pair also classified as bridge-absent -- produces warm, cool, and chilly at 100% frequency across models. These are equally "obvious" intermediate concepts, yet one set is skipped and the other is used universally. The distinction cannot be explained by associative strength (both fire and warm are strongly associated with their respective endpoints) or by navigational salience theory alone (both name intermediates in a gradient or chain).

**Hypothesis:** The too-central boundary is determined by **informational non-redundancy**: a concept bridges successfully when it adds navigational information that the endpoints do not already specify. "Warm" adds non-redundant information between hot and cold (it specifies a region of the temperature continuum that is distinct from both endpoints). "Fire" adds redundant information between spark and ash (both endpoints already fully imply fire; naming fire tells you nothing about where in the spark-to-ash process you are). The operational test: too-central concepts have high mutual information with both endpoints independently, while successful "obvious" bridges have high mutual information with one endpoint but contribute unique directional information toward the other.

**Primary pre-registered test:** For pairs constructed to have a putatively too-central bridge, the bridge frequency is below 0.15 (mean across models). For pairs with an "obvious but useful" bridge of comparable associative strength, bridge frequency is above 0.50. The difference is significant (bootstrap CI excludes zero). Secondary: too-central pairs show higher navigational entropy (more diverse waypoints, flatter salience distribution) than obvious-useful pairs.

### Design

#### Constructing the Too-Central Gradient

We need pairs that span the boundary between too-central and obvious-useful. The key variables are (a) how much the bridge is implied by both endpoints and (b) whether the bridge adds directional information.

**Category 1: Known Too-Central (fire-like)**

| # | Pair (A -> C) | Candidate Bridge | Why Too-Central | Expected Bridge Freq |
|---|---------------|-----------------|-----------------|---------------------|
| 1 | spark -> ash | fire | Both endpoints fully imply fire | < 0.15 (replicate Phase 5B) |
| 2 | acorn -> timber | tree | Both endpoints fully imply tree | < 0.15 (predicted analog) |
| 3 | flour -> bread | dough | Both endpoints strongly imply dough in baking | < 0.20 (predicted, less extreme) |

**Category 2: Known Obvious-Useful (warm/cool-like)**

| # | Pair (A -> C) | Candidate Bridge | Why Obvious-Useful | Expected Bridge Freq |
|---|---------------|-----------------|-------------------|---------------------|
| 4 | hot -> cold | warm/cool | Gradient intermediates; each specifies a distinct region | > 0.50 (replicate Phase 6A) |
| 5 | infant -> elderly | adolescent/adult | Life-stage intermediates; each names a distinct period | > 0.50 (predicted analog) |
| 6 | whisper -> shout | speak/talk | Volume-gradient intermediates | > 0.40 (predicted) |

**Category 3: Boundary Cases (diagnostic)**

| # | Pair (A -> C) | Candidate Bridge | Boundary Question | Expected Bridge Freq |
|---|---------------|-----------------|------------------|---------------------|
| 7 | rain -> ocean | water | Water implied by both, but names the medium/substance | 0.10-0.40 (uncertain) |
| 8 | egg -> chicken | embryo | Implied by both, but names a developmental stage | 0.10-0.40 (uncertain) |
| 9 | ice -> steam | water/liquid | Phase-transition intermediates; water is implied but also the substance | 0.15-0.50 (uncertain) |
| 10 | dawn -> dusk | noon/midday | Time-gradient intermediate; names a distinct temporal region | 0.30-0.60 (predicted obvious-useful) |

The boundary cases (7-10) are deliberately chosen to be ambiguous: the candidate bridge is implied by both endpoints (like fire) but also names a distinct intermediate state or substance (like warm). Where these pairs land -- above or below the too-central threshold -- will define the boundary operationally.

### Run Budget

| Category | Pairs | Reps/model | Models | Runs |
|----------|-------|-----------|--------|------|
| Too-central (1-3) | 3 | 10 | 4 | 120 |
| Obvious-useful (4-6) | 3 | 10 | 4 | 120 |
| Boundary cases (7-10) | 4 | 10 | 4 | 160 |
| **Total new runs** | | | | **400** |

Pair 1 (spark-ash) and pair 4 (hot-cold) partially overlap with Phase 5B and Phase 6A data. Phase 5B spark-fire-ash data (20 AC-leg runs per model) can be reused for pair 1. Phase 6A hot-cold data (40 runs per model) can be reused for pair 4. This reduces new runs by ~240 but we collect fresh data at 10 reps for consistency with the other pairs in the design.

After reuse assessment and 5% buffer: **~480 new runs.**

**Reconciled run budget with reuse:**

| Category | Pairs | Calculation | New Runs |
|----------|-------|------------|----------|
| Too-central pair 1 (reuse 5B AC-leg) | 1 | 0 (bridge freq from existing data) | 0 |
| Too-central pairs 2-3 (new) | 2 | 2 × 10 reps × 4 models | 80 |
| Obvious-useful pair 4 (reuse 6A) | 1 | 0 (bridge freq from existing data) | 0 |
| Obvious-useful pairs 5-6 (new) | 2 | 2 × 10 reps × 4 models | 80 |
| Boundary cases 7-10 (new) | 4 | 4 × 10 reps × 4 models | 160 |
| Informational redundancy probes (A→random, 3+ random targets per A) | 10 | 10 pairs × 3 targets × 10 reps × 4 models | 120* |
| **Total new runs** | | | **440** |

*Redundancy probes use 3 fixed random targets per starting concept (not 1) to reduce target-dependency noise — e.g., for spark: spark→telescope, spark→mountain, spark→library. This addresses the underpowered single-probe issue.

After 5% retry buffer: **~480 new runs.** |

### Analysis Plan

1. **Bridge frequency measurement.** For each pair, compute the frequency of the candidate bridge concept across all runs per model. Report per-pair, per-model frequencies. For pairs 1 and 4, verify consistency with prior phase data.

2. **Too-central vs. obvious-useful comparison (primary test).** Bootstrap CI on (mean obvious-useful frequency minus mean too-central frequency). Primary test: CI excludes zero, difference > 0.35.

3. **Boundary case classification.** For each boundary pair, classify as too-central (bridge freq < 0.15), obvious-useful (bridge freq > 0.50), or intermediate (0.15-0.50). The distribution of boundary cases across these categories defines the sharpness of the too-central boundary: if all land in the intermediate zone, the boundary is gradual; if they split cleanly between too-central and obvious-useful, the boundary is sharp.

4. **Navigational entropy comparison.** For each pair category, compute mean navigational entropy (from the waypoint frequency distribution). Too-central pairs should show higher entropy (more diverse waypoints, because no single concept dominates). Obvious-useful pairs should show lower entropy (the gradient intermediates dominate).

5. **Informational redundancy metric.** For each pair/bridge, estimate informational redundancy as the proportion of runs where the bridge concept appears on paths from A to unrelated targets. A bridge that appears regardless of the target is informationally redundant (it is a high-frequency associate of A, not a navigational bridge). Operationally: for each starting concept A, collect 10 paths to each of 3 fixed random targets (e.g., spark→telescope, spark→mountain, spark→library) and compute the mean frequency of the candidate bridge across all 30 target-agnostic paths. Multiple targets reduce single-target noise. Report 95% CI on the baseline bridge rate. If fire appears at >10% frequency on spark→random paths, it is associatively activated by spark regardless of target, and its absence from spark→ash is not due to too-centrality but to some other mechanism.

6. **Gradient vs. causal-chain distinction.** Test whether the too-central boundary aligns with the gradient/causal-chain distinction. Gradient pairs (hot-cold, infant-elderly, dawn-dusk) have multiple intermediates that tile the space. Causal-chain pairs (spark-ash, acorn-timber) have a single implied intermediate. If gradient pairs are systematically obvious-useful and causal-chain pairs are systematically too-central, the mechanism is about gradient decomposability, not informational redundancy per se.

7. **Cross-model agreement.** Compute cross-model bridge frequency agreement for each pair. Too-central pairs should show high cross-model agreement (all models skip fire). Obvious-useful pairs should also show high agreement (all models use warm/cool). Boundary cases may show model-dependent classification.

### Predictions

1. Too-central pairs (1-3) show mean bridge frequency < 0.15 across models. Specifically: fire on spark-ash replicates at < 0.10 (Phase 5B confirmation); tree on acorn-timber < 0.15; dough on flour-bread < 0.20.
2. Obvious-useful pairs (4-6) show mean bridge frequency > 0.50 across models. Specifically: warm/cool on hot-cold > 0.80 (Phase 6A confirmation); adolescent/adult on infant-elderly > 0.40; speak/talk on whisper-shout > 0.40.
3. The too-central vs. obvious-useful difference exceeds 0.35 (bootstrap CI excludes zero).
4. Boundary cases split: water on rain-ocean and water on ice-steam land in the too-central zone (< 0.20) because "water" is fully implied by both endpoints. Embryo on egg-chicken and noon on dawn-dusk land in the obvious-useful zone (> 0.30) because they name distinct intermediate states.
5. Too-central pairs show higher navigational entropy than obvious-useful pairs (by at least 0.30 nats), because the skipped bridge leaves no dominant waypoint.
6. Gradient pairs are more likely to produce obvious-useful bridges than causal-chain pairs. At least 4 of the 5 gradient-type pairs (hot-cold, infant-elderly, whisper-shout, dawn-dusk, ice-steam) show bridge frequency > 0.30.
7. Fire appears on spark-to-random-target paths at < 0.10 frequency (it is not merely a high-frequency associate of spark being suppressed by the too-central mechanism; it simply is not routed through).

---

## Files

| Action | File | Lines |
|--------|------|-------|
| Create | `src/data/pairs-phase7.ts` | ~180 (Phase 7 pair definitions: pre-fill conditions, triangle vertices, too-central gradient) |
| Create | `experiments/07a-anchoring.ts` | ~400 (early-anchoring experiment runner: pre-filled prompt variant, unconstrained control collection) |
| Create | `experiments/07b-curvature.ts` | ~300 (curvature estimation runner: triangle leg collection, reuse management) |
| Create | `experiments/07c-too-central.ts` | ~250 (too-central experiment runner: bridge frequency + entropy + redundancy test paths) |
| Create | `analysis/07a-anchoring.ts` | ~550 (bridge displacement test, survival rate, positional shift, heading congruence analysis) |
| Create | `analysis/07b-curvature.ts` | ~400 (path dissimilarity distances, triangle inequality, excess computation, polysemous vs. non-polysemous comparison) |
| Create | `analysis/07c-too-central.ts` | ~450 (bridge frequency, entropy comparison, informational redundancy, gradient vs. causal-chain analysis) |
| Modify | `src/types.ts` | ~50 (PreFilledCondition, TriangleCurvature, TooCentralPair types) |
| Modify | `src/metrics.ts` | ~70 (triangle excess computation, informational redundancy scorer, pre-fill positional shift) |
| Modify | `src/canonicalize.ts` | ~15 (pre-filled prompt handler for 6-waypoint extraction) |
| Modify | `package.json` | ~6 scripts |

## Docs to Update

- `.planning/STATE.md` -- Phase 7 summary, key findings, blockers
- `.planning/ROADMAP.md` -- Phase 6 completion entry, Phase 7 implementation
- `findings/CLAIMS.md` -- Update H4 (falsified), add R8, add new observations from Phase 6
- `findings/07-analysis.md` -- Interpretive analysis (Opus subagent)
- `findings/07a-anchoring.md` -- Generated findings (analysis script)
- `findings/07b-curvature.md` -- Generated findings (analysis script)
- `findings/07c-too-central.md` -- Generated findings (analysis script)

## Execution Order

```bash
# Part A -- ~6-8 min
bun run anchoring                    # ~800 runs
bun run analyze-anchoring

# Part B -- ~5-6 min
bun run curvature                    # ~640 runs
bun run analyze-curvature

# Part C -- ~4-5 min
bun run too-central                  # ~480 runs
bun run analyze-too-central

# Or run everything:
bun run phase7
```

## Implementation Order

1. Add types to `src/types.ts` (PreFilledCondition, TriangleCurvature, TooCentralPair)
2. Add metrics to `src/metrics.ts` (triangle excess, informational redundancy, pre-fill positional shift)
3. Add utility to `src/canonicalize.ts` (pre-filled prompt handler: parse 6-waypoint responses when position 1 is pre-specified)
4. Create `src/data/pairs-phase7.ts` (all pair definitions: 8 anchoring pairs with pre-fill specs, 8 curvature triangles, 10 too-central pairs)
5. Create and run Part A experiment + analysis (depends on Phase 6C data for unconstrained baselines)
6. Create and run Part B experiment + analysis (depends on prior phase data for some triangle legs)
7. Create and run Part C experiment + analysis (depends on Phase 5B and 6A data for reuse pairs)
8. Write interpretive analysis (`findings/07-analysis.md`)
9. Update `.planning/STATE.md`, `ROADMAP.md`, `findings/CLAIMS.md`
10. Commit

## Totals

- **New files:** 7 (pairs-phase7, 3 experiments, 3 analyses)
- **Modified files:** 4 (types.ts, metrics.ts, canonicalize.ts, package.json)
- **New code:** ~2,670 lines
- **New API runs:** ~2,500 (Part A: ~1,260 + Part B: ~760 + Part C: ~480)
- **Reused data:** Phase 6C positional data (pairs 1-6 unconstrained baselines), Phase 5B spark-fire-ash data, Phase 6A hot-cold data, Phase 5B photon-heavy data, various AC-leg data from Phases 5-6
- **Runtime:** ~20-25 minutes total
- **Cost:** ~$8-12 via OpenRouter

## Verification

### Part A
- Pre-filled paths collected for all 8 pairs x 4 models x 10 reps x 3 conditions = 960 new runs
- Unconstrained baselines available for all 8 pairs (6 from Phase 6C + 2 new)
- Congruent vs incongruent comparison computed for all pairs
- Bridge displacement test: bootstrap CI on (unconstrained modal freq minus pre-filled shifted freq) computed for all pairs
- Bridge survival rate compared between conditions for all pairs
- Positional shift analysis completed for paths where bridge survives
- Animal-poodle control shows qualitatively different displacement pattern from heading-bridge pairs
- Forced-crossing pair (loan-shore) analyzed separately
- Per-model displacement comparison reported
- `setMetricsSeed(42)` for reproducibility

### Part B
- All 24 triangle legs collected (8 triangles x 3 legs) with prior data reuse where available
- Distance metric validity checks completed (semantic correlation r > 0.30, cross-model correlation r > 0.50)
- Path dissimilarity distances computed for all legs per model
- Triangle inequality holds in >85% of triangle/model combinations
- Triangle excess computed for all 32 triangle/model combinations (8 x 4)
- Polysemous vs. non-polysemous excess comparison: bootstrap CI computed, primary test evaluated
- Per-model curvature profiles reported
- Cross-axis vs. same-axis curvature comparison completed for polysemous triangles

### Part C
- Bridge frequency measured for all 10 pairs x 4 models
- Too-central pairs (1-3) show bridge freq < 0.15 (mean across models)
- Obvious-useful pairs (4-6) show bridge freq > 0.50 (mean across models)
- Boundary cases (7-10) classified as too-central, obvious-useful, or intermediate
- Navigational entropy computed and compared across pair categories
- Informational redundancy test completed (bridge frequency on paths from A to random targets)
- Gradient vs. causal-chain distinction tested
- Phase 5B and 6A data successfully integrated for pairs 1 and 4

## Done When

- All three experiments complete with < 5% failure rate
- Analysis scripts produce findings docs for all three parts
- Part A delivers a clear verdict on directional-heading vs. associative-primacy accounts of early anchoring
  - Bridge displacement test shows significant difference between conditions, OR
  - Null result with tight CIs rules out displacement effects > 0.10, rejecting the directional-heading hypothesis
- Part B produces the first curvature estimates for conceptual navigation
  - Polysemous-vertex excess is either significantly greater than non-polysemous (supporting the singular-point hypothesis) or statistically indistinguishable (rejecting it)
- Part C operationally defines the too-central boundary
  - Too-central vs. obvious-useful difference is significant, with boundary cases classified
  - At least one of the two proposed mechanisms (informational redundancy vs. gradient decomposability) receives discriminating evidence
- Interpretive analysis written connecting all three parts to the revised navigational model from Phase 6
- Graveyard updated with any new dead ends
- CLAIMS.md updated with Phase 6's new robust claims and observations
- STATE.md and ROADMAP.md updated
