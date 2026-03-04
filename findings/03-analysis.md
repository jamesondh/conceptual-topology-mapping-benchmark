# Phase 3 Analysis: Anchors, Bridges, and the Geometry of Compositional Navigation

> Interpretive analysis of Phase 3: positional convergence (3A) and transitive path structure (3B).
>
> 1,240 forward + 840 reverse runs reanalyzed (3A), 600 new API runs + 680 reused (3B), across 4 models.
>
> March 2026

## Executive Summary

**Phase 3 delivers the strongest evidence yet that LLM conceptual spaces have genuine geometric structure -- and the clearest picture of what kind of geometry it is.** The transitivity experiment (3B) is the headline: hierarchical concept triples show 4.9x higher waypoint transitivity than random controls (0.175 vs. 0.036), the triangle inequality holds in 91% of cases, and bridge concepts appear with high frequency on direct paths when they are semantically "between" the endpoints -- but never for random controls. This is not something a model that merely generates plausible-sounding word chains would produce. It is evidence of compositional structure in conceptual navigation.

The positional convergence experiment (3A) complicates the clean story we told in Phase 2. The starting-point hypothesis -- that models construct paths forward from the starting concept, producing the massive asymmetries we observed -- predicted increasing overlap from position 1 to position 5 when comparing forward and reverse paths. We got a U-shape instead: positions 1 and 5 both show elevated mirror-match rates (0.102 and 0.129), with a valley in the middle (0.057-0.085). Both endpoints act as anchors; the middle of the path is where models diverge most.

Three findings that matter:

1. **The dual-anchor effect.** Positional convergence is not monotonically increasing. Both the starting and ending concepts exert gravitational pull on waypoint selection. The starting-point hypothesis from Phase 2 needs refinement: models do chain forward from the start, but they also chain backward from the target, and the middle of the path is the least constrained region.

2. **Conceptual space is compositional -- for the right relationships.** Hierarchical and polysemy-extend triples show high transitivity and frequent bridge concept appearance. The path from animal to poodle really does pass through "dog." But this compositionality is relationship-dependent: semantic chains show intermediate transitivity, and the temperature axis (hot-energy-cold) shows near-zero transitivity because "energy" is not on the temperature gradient.

3. **The triangle inequality mostly holds.** 29 of 32 triple/model combinations satisfy d(A,C) <= d(A,B) + d(B,C). Two substantial violations occur in Gemini (the model with the most fragmented topology), plus one marginal violation in Claude (hot-energy-cold, slack -0.023). This is remarkably close to metric behavior for a space we know violates the symmetry axiom.

---

## 1. The Starting-Point Hypothesis, Revised

### What We Predicted

Phase 2 established that conceptual navigation is fundamentally asymmetric (mean asymmetry index 0.811) and proposed the starting-point hypothesis: models construct paths by greedy forward search from the starting concept, not by global route planning. The prediction for Phase 3A was straightforward. If the starting concept dominates early waypoints and the target concept only influences the path toward the end, then mirror-matching forward position i against reverse position (5-i) should show monotonically increasing overlap. Position 1 (start of both paths = most starting-point-determined) should have the lowest match rate; position 5 (end of both paths = closest to target) should have the highest.

### What We Got

The overall per-position mirror-match rates are:

| Position | Match Rate | Expectation |
|----------|-----------|-------------|
| 1 (fwd wp1 vs rev wp5) | 0.102 | Predicted: lowest |
| 2 (fwd wp2 vs rev wp4) | 0.057 | -- |
| 3 (fwd wp3 vs rev wp3) | 0.065 | -- |
| 4 (fwd wp4 vs rev wp2) | 0.085 | -- |
| 5 (fwd wp5 vs rev wp1) | 0.129 | Predicted: highest |

The overall slope is weakly positive (0.0082) but the confidence interval crosses zero ([-0.0030, 0.0198]). Only 50% of pair/model combinations show positive convergence. This is not the clear confirmation we predicted.

More telling is the shape: not a monotonic increase but a U-curve. Positions 1 and 5 have elevated match rates; the middle positions (2-4) form a valley. The first waypoint after the starting concept (position 1 in the forward path, mirrored against position 5 in reverse) has *higher* overlap than position 2 or 3.

### The Dual-Anchor Hypothesis

The U-shape suggests a revision of the starting-point hypothesis. Both endpoints -- start and target -- exert "gravitational pull" on the waypoints near them. The starting concept constrains the first 1-2 waypoints; the target concept constrains the last 1-2 waypoints. The middle of the path is the region of maximum freedom, where the model's trajectory is least constrained by either endpoint and most dependent on idiosyncratic run-to-run choices.

This dual-anchor model explains several patterns in the data:

**Why position 1 is elevated.** The first waypoint after the start is strongly constrained by the starting concept's immediate semantic neighborhood. When navigating from A to B, wp1 is the nearest neighbor of A in the direction of B. When navigating from B to A (reverse), wp5 (the last waypoint before arriving at A) is also a near neighbor of A, because the path must arrive in A's neighborhood. These are not the same waypoint -- the reverse path's final waypoint approaches A from a different angle -- but they are drawn from the same constrained neighborhood. Overlap is therefore elevated by neighborhood effects, not by path convergence.

**Why position 5 is the true peak.** Position 5 (forward wp5 vs reverse wp1) shows the highest match rate (0.129). This is the same neighborhood effect operating on the target concept: the forward path's last waypoint and the reverse path's first waypoint are both constrained by B's immediate neighborhood. The fact that position 5 exceeds position 1 (0.129 > 0.102) suggests the target-side anchor is slightly stronger than the start-side anchor -- consistent with the original starting-point hypothesis holding in attenuated form.

**Why the middle collapses.** Positions 2-4 are in the "open field" between the two anchoring neighborhoods. Here the model has maximum freedom, and run-to-run variance dominates. The forward and reverse paths traverse different intermediate territory, exactly as Phase 2's asymmetry data would predict.

### Category Signatures in the U-Shape

The dual-anchor pattern is not uniform across categories. The category-level positional profiles are revealing:

**Antonyms (hot-cold) show extreme late convergence:** 0.054 -> 0.035 -> 0.215 -> 0.338 -> 0.344. The slope is strongly positive (0.0882, CI above zero), and the convergence is concentrated at positions 3-5. This makes sense: the temperature axis is a single gradient, and once either direction has traversed 2-3 waypoints, both paths enter the same tightly constrained central region. The antonym result is the one category that cleanly supports the original starting-point hypothesis: the middle and late positions converge because the axis itself acts as a funnel.

**Identity controls show the middle domination:** 0.000 -> 0.044 -> 0.319 -> 0.048 -> 0.018. For apple-to-apple, the middle waypoint (position 3) is the most constrained -- because both forward and reverse paths must pass through the same core associations (fruit, tree, harvest, etc.), and the middle is where they are most likely to align. The endpoints show lower overlap because the first and last waypoints are the "on-ramp" and "off-ramp" from the identity loop, and there are multiple ways to enter and exit the apple concept cluster.

**Random controls show a pure U-shape:** 0.099 -> 0.025 -> 0.010 -> 0.031 -> 0.121. Positions 1 and 5 are elevated; the middle is near-zero. This is the dual-anchor effect in its purest form: both endpoints exert local pull, but there is no semantic bridge to constrain the middle. The path between telescope and jealousy wanders freely through whatever intermediate territory the model enters, constrained only at the edges by the neighborhoods of the endpoint concepts.

**Nonsense controls are flat near zero:** 0.001 -> 0.003 -> 0.008 -> 0.001 -> 0.009. No anchoring effect at all, because nonsense strings have no semantic neighborhoods to constrain anything. Good control validation.

### Claude's Negative Slope

Claude shows the only negative convergence slope (-0.0049) among the four models. GPT (0.0154) and Grok (0.0163) are positive; Gemini (0.0060) is weakly positive. Claude's negative slope does not mean it shows *reverse* convergence -- it means its U-shape is slightly tilted toward the start-side anchor. Claude's rigid navigational style (highest within-model Jaccard from Phase 1) produces strong starting-point anchoring and relatively weak target-side anchoring. It commits early and follows through, rather than bending its trajectory toward the target at the end. This is consistent with Phase 2's characterization of Claude as the least direction-sensitive model: its paths are so determined by the pair topology that neither direction of traversal bends them much.

---

## 2. Transitivity and Compositional Structure

### The Core Result

Phase 3B tests whether conceptual paths compose: if B lies "between" A and C, does the path from A to C pass through B? The answer is strongly relationship-dependent.

| Triple Type | Mean Transitivity | Bridge Frequency | Interpretation |
|-------------|-------------------|------------------|----------------|
| Hierarchical | 0.175 | 45.6% | Strong compositionality |
| Polysemy-extend | 0.150 | 72.5% | Strong compositionality (sense-mediated) |
| Semantic chain | 0.073 | 24.4% | Partial compositionality |
| Existing-pair (control) | 0.043 | 0.0% | Near-baseline |
| Random control | 0.036 | 0.0% | Baseline (no compositionality) |

The hierarchical-vs-random comparison is the most important result in the benchmark to date. The 4.9x difference (0.175 vs 0.036) with non-overlapping confidence intervals ([0.112, 0.238] vs [0.011, 0.070]) establishes that taxonomic chains have genuine compositional structure in LLM conceptual navigation. When you ask a model to navigate from "animal" to "poodle," it passes through "dog" (or an equivalent taxonomic intermediate) far more often than chance. When you insert a random concept like "stapler" between "music" and "mathematics," the model ignores it entirely -- the bridge concept appears 0% of the time.

This is the result that distinguishes conceptual topology from sophisticated word association. A model that merely generates plausible-sounding chains would not systematically route through taxonomic intermediates. The routing reflects something about the organization of the model's representation space -- something that preserves hierarchical structure.

### Polysemy-Extend: The River Flows Through

The bank-river-ocean triple (polysemy-extend type) shows transitivity of 0.150 with the bridge concept "river" appearing in 72.5% of direct bank-to-ocean paths. This is striking because "bank" is polysemous -- the model must first resolve to the geographic sense of "bank" and then navigate through "river" to reach "ocean." The high bridge frequency means that the polysemy resolution from Phase 1 (where bank-river activated the geographic sense cluster) genuinely routes subsequent navigation: once the model is in the geographic-bank neighborhood, "river" is not just associated with "bank" but is *on the path* to "ocean."

The 72.5% bridge frequency for polysemy-extend is actually higher than the 45.6% for hierarchical triples. This may reflect the strength of the sense-resolution bottleneck: once "bank" resolves to a riverbank, the path to "ocean" is tightly channeled through river/water concepts. Hierarchical chains have more viable intermediates (animal-to-poodle could go through mammal, pet, dog, canine, domesticated animal, etc.), so the specific bridge concept "dog" appears less reliably.

### Semantic Chains: Partial Compositionality

The semantic chain triples (music-harmony-mathematics, hot-energy-cold) show intermediate transitivity (0.073) and bridge frequency (24.4%). The two chains tell very different stories:

**Music-harmony-mathematics** shows genuine compositional structure. "Harmony" appears on 100% of Claude's direct music-to-mathematics paths, 80% for Grok, 15% for GPT, and 0% for Gemini. Claude and Grok route through the concept that semantically bridges the two domains; GPT and Gemini find alternative bridges (pattern, ratio, rhythm). The transitivity is real but model-dependent -- different models find different compositional decompositions of the same conceptual journey.

**Hot-energy-cold** shows near-zero transitivity (0.036 average). "Energy" never appears as a bridge concept. The hot-to-cold paths go through temperature gradient terms (warm, tepid, cool, chilly); the hot-to-energy and energy-to-cold paths go through physics terms (thermodynamics, work, heat). The temperature axis and the physics-of-energy axis are parallel but non-intersecting conceptual dimensions. Navigating from hot to cold stays on the experiential temperature gradient and never enters the physics domain where "energy" lives.

This is an important negative result. It tells us that compositional structure is not universal -- it depends on whether B actually lies on the conceptual pathway between A and C, not just whether B is associated with both. "Energy" is associated with both "hot" and "cold," but it occupies a different conceptual dimension (physics/thermodynamics) than the temperature gradient (experiential sensation). Association is not the same as being on-route.

### The Bridge Concept as Diagnostic

The bridge concept frequency is perhaps the most intuitive metric in the entire benchmark. It answers a simple question: when navigating from A to C, does the model pass through B?

| Triple | Bridge | Claude | GPT | Grok | Gemini |
|--------|--------|--------|-----|------|--------|
| animal-dog-poodle | dog | 50% | 15% | 90% | 100% |
| emotion-nostalgia-melancholy | nostalgia | 10% | 10% | 90% | 0% |
| music-harmony-mathematics | harmony | 100% | 15% | 80% | 0% |
| bank-river-ocean | river | 100% | 90% | 100% | 0% |
| music-stapler-mathematics | stapler | 0% | 0% | 0% | 0% |
| hot-flamingo-cold | flamingo | 0% | 0% | 0% | 0% |

The random controls (stapler, flamingo) show 0% bridge frequency across all models -- the clearest possible validation. Nobody routes through an irrelevant concept. Meanwhile, the semantically appropriate bridges show high but model-variable frequencies.

The model differences here are striking. Gemini consistently shows 0% bridge frequency on non-hierarchical triples, even when other models show high frequencies. For bank-river-ocean, Gemini routes from bank to ocean without ever mentioning "river" -- it finds an entirely different path (gold, treasure, as listed in its shortcuts column). This is consistent with Phase 2's characterization of Gemini as having fragmented, compartmentalized topology: the bank-to-ocean path in Gemini's conceptual space does not pass through the river subspace that other models traverse.

GPT shows an interesting split: high bridge frequency for concrete/geographic triples (90% for bank-river-ocean, 100% for animal-dog-poodle if we count "domestic dog") but low for abstract chains (15% for music-harmony-mathematics, 15% for animal-dog-poodle by strict match). GPT may have stronger compositional structure for concrete domains than for abstract ones.

---

## 3. The Triangle Inequality and Quasimetric Structure

### What We Found

Phase 2 established that symmetry fails: d(A,B) is not equal to d(B,A). Phase 3B tests the triangle inequality: d(A,C) <= d(A,B) + d(B,C). Using waypoint distance (1 - Jaccard overlap) as the metric:

**29 of 32 triple/model combinations satisfy the triangle inequality (90.6%).**

The three violations involve two models — Gemini (2 substantial) and Claude (1 marginal):
- music-harmony-mathematics (Gemini): d(AC)=0.606 > d(AB)+d(BC) = 0.168+0.119 = 0.287, slack = -0.319
- bank-river-ocean (Gemini): d(AC)=0.619 > d(AB)+d(BC) = 0.558+0.000 = 0.558, slack = -0.061
- hot-energy-cold (Claude): d(AC)=0.089 > d(AB)+d(BC) = 0.067+0.000 = 0.067, slack = -0.023

The Claude violation on hot-energy-cold is marginal (slack of -0.023) and driven by the near-zero distances in that triple. The Gemini violations are more substantial, particularly music-harmony-mathematics where the slack is -0.319. Gemini finds that the direct path from music to mathematics is very dissimilar to the indirect path through harmony, even though both legs (music-to-harmony and harmony-to-mathematics) show high internal consistency (low distance). This is the topological fragmentation we keep seeing in Gemini's data: the parts do not add up to the whole.

### What This Means for Quasimetric Characterization

Phase 2 proposed that conceptual space is quasimetric -- a space with asymmetric but well-behaved distances. The triangle inequality data strengthens this characterization considerably. A quasimetric space satisfies:

1. d(A,A) = 0 (identity) -- approximately holds (Phase 2)
2. d(A,B) >= 0 (non-negativity) -- holds trivially
3. d(A,B) = 0 implies A = B (separation) -- approximately holds
4. d(A,C) <= d(A,B) + d(B,C) (triangle inequality) -- **holds in 91% of cases**

The symmetry axiom (d(A,B) = d(B,A)) is the one that fails comprehensively. All other metric axioms hold approximately. This is precisely the definition of a quasimetric space: a space satisfying all metric axioms except symmetry.

The 91% satisfaction rate for the triangle inequality is remarkably high given the magnitude of the asymmetry violations (mean asymmetry 0.811). One might have expected that a space where forward and reverse distances differ so dramatically would also show widespread triangle inequality violations. Instead, the directional distance function is well-behaved in the compositional sense: going from A to B to C really does involve more "conceptual distance" than going directly from A to C. The space has direction-dependent distances, but those distances compose properly.

This is the formal justification for calling these spaces "quasimetric" rather than just "non-metric." The structure is not chaotic -- it has the algebraic regularity of a well-characterized mathematical object.

### Gemini's Violations as Fragmentation Evidence

That both substantial triangle inequality violations occur in Gemini (with the only other violation being a marginal Claude case) is consistent with the fragmentation hypothesis from Phase 2. If Gemini's conceptual topology is compartmentalized -- strong local structure within neighborhoods but weak global connections -- then the triangle inequality would fail precisely when the three concepts span different neighborhoods. Going from music to mathematics directly might activate a completely different set of bridges than going through harmony, because Gemini's topology does not support smooth interpolation across domain boundaries.

GPT and Grok satisfy the triangle inequality in all cases, and Claude has only one marginal violation. These three models have sufficiently connected conceptual topologies that going through an intermediate concept almost always produces a path that is at least as "long" as the direct route. Their spaces are navigable in the triangle inequality sense, even if direction-dependent.

---

## 4. Model Differences as Topological Signatures

### The Claude-Gemini Axis

Across all three phases, Claude and Gemini consistently anchor opposite ends of the topological spectrum:

| Property | Claude | Gemini |
|----------|--------|--------|
| Within-model Jaccard (Phase 1) | 0.578 (highest) | 0.372 |
| Directional asymmetry (Phase 2) | 0.780 (lowest) | 0.867 (highest) |
| Convergence slope (Phase 3A) | -0.005 (negative) | 0.006 (weakly positive) |
| Mean transitivity (Phase 3B) | 0.112 (highest) | 0.062 (lowest) |
| Triangle inequality violations | 1 (marginal) | 2 (substantial) |
| Bridge concept frequency | High for abstract triples | 0% for non-hierarchical triples |

Claude's topology is dense, globally connected, and rigid. It finds the same paths repeatedly, maintains direction-insensitive routes, shows high transitivity, and satisfies the triangle inequality. Its negative convergence slope (Phase 3A) reflects that its rigid paths are determined more by the pair's global topology than by either endpoint's local pull.

Gemini's topology is fragmented, locally rich, and globally inconsistent. It finds different paths depending on direction, shows low transitivity, violates the triangle inequality, and fails to route through bridge concepts even when they are semantically appropriate. Its conceptual space appears to have strong within-domain structure but weak cross-domain connectivity.

This is a topological characterization, not a quality judgment. Gemini's fragmentation may reflect a different tradeoff in representation learning -- stronger specialization within domains at the cost of weaker integration across them. The practical implications depend on the task: for within-domain reasoning, Gemini's strong local structure might be advantageous; for cross-domain analogical reasoning, Claude's global connectivity is clearly stronger.

### GPT and Grok: The Variable Middle

GPT and Grok occupy the middle ground on most metrics, but they diverge on bridge concept behavior. GPT shows strong bridges for concrete triples (90% for bank-river-ocean) but weak ones for abstract triples (15% for music-harmony-mathematics). Grok shows consistently high bridge frequencies across both concrete and abstract domains (90-100% for hierarchical, 80% for music-harmony-mathematics).

This suggests GPT's compositional structure is domain-specific -- strong for concrete taxonomies where the training data contains explicit hierarchical relationships, weaker for abstract analogies where the bridge must be inferred. Grok's compositional structure appears more uniform across domains, possibly reflecting a more balanced representation of concrete and abstract relationships in its training data or architecture.

---

## 5. Implications for Conceptual Topology

### The Emerging Geometric Picture

After three phases, the geometric characterization of LLM conceptual space is coming into focus:

1. **Quasimetric structure.** Distances are asymmetric but satisfy the triangle inequality. This is a well-characterized mathematical structure with developed theory (directed graphs, asymmetric norms, Smyth completions). The space is not a metric space, but it is the next best thing.

2. **Compositional hierarchy.** Paths compose for taxonomic and sense-mediated relationships. The path from A to C through B is a genuine decomposition, not just three independent paths stitched together. This compositionality is relationship-dependent (strong for hierarchies, absent for arbitrary chains) and model-dependent (strong for Claude, weak for Gemini).

3. **Dual-anchor topology.** Navigation paths are shaped by gravitational pull from both endpoints. The starting concept constrains the first waypoints; the target constrains the last; the middle is the region of maximum freedom and divergence. This is more nuanced than the simple forward-chaining model from Phase 2.

4. **Model-specific connectivity.** Each model has a characteristic connectivity profile -- how tightly its conceptual regions are linked. Claude has dense, uniform connectivity. Gemini has fragmented, domain-specialized connectivity. GPT and Grok fall between these extremes.

### What This Is Not

It is worth stating explicitly what these results do not establish:

- **This is not evidence that models "understand" concepts.** The geometric structure we measure is a property of the model's output behavior on a specific task (waypoint elicitation). It is consistent with genuine conceptual understanding but also consistent with sophisticated pattern matching over well-structured training data.

- **This is not a claim about model quality.** Higher transitivity or lower asymmetry is not "better." These are descriptive measurements of topological properties, not evaluative judgments.

- **This is not a complete characterization.** We have tested 21 concept pairs, 8 triples, and 4 models. The space of possible relationships and concepts is vast. Our measurements sample this space, but they do not exhaust it.

### Connection to the Platonic Representation Hypothesis

The transitivity results add a new dimension to the PRH question (whether model representations are converging to shared structure). The category-level rankings are similar across models: all four show hierarchical > semantic-chain > random for transitivity, and all four show non-zero bridge frequencies for appropriate triples and zero for controls. This suggests the *structure* of compositionality is shared -- all models route through taxonomic intermediates.

But the magnitudes differ substantially (Claude 0.112 vs Gemini 0.062 mean transitivity), and the specific bridge concepts differ (harmony vs pattern vs rhythm for the music-mathematics route). The shared structure is the skeleton; the model-specific flesh varies. Representations may be converging in topology (which regions connect to which) while remaining divergent in geography (the specific path between regions).

---

## 6. Methodological Reflections

### The Value of Controls

Phase 3B's random controls may be the most scientifically important element of the experiment. Without them, the hierarchical transitivity result (0.175) would be uninterpretable -- is 0.175 high or low? Compared to random controls (0.036), it is nearly 5x higher. Compared to a theoretical maximum of 1.0, it is modest. The control comparison gives the number meaning.

Similarly, the bridge concept frequency of 0% for random controls eliminates the possibility that models simply tend to route through intermediate concepts regardless of semantic appropriateness. The routing through "dog" on the animal-to-poodle path is not an artifact of the waypoint elicitation task -- it is a real compositional structure.

### Limitations Specific to Phase 3

**Sample size for transitivity.** 8 triples with 4 models gives 32 observations, enough for overall patterns but not enough for fine-grained category comparisons. The polysemy-extend category has only 4 observations (one triple across four models). The existing-pair category (Beyonce-justice-erosion) tests a somewhat arbitrary concept triple. Expanding to 20-30 triples would give more robust category-level estimates.

**Lexical matching for bridge concepts.** The bridge concept frequency counts exact lexical matches. When Gemini's animal-to-poodle path includes "canid" and "carnivoran" instead of "dog," this counts as 100% bridge frequency because "dog" also appears, but a model that routed through "canine" without "dog" would score 0%. The bridge frequency metric underestimates compositional structure when models use synonyms or near-synonyms of the bridge concept.

**Convergence slope sensitivity.** The overall convergence slope (0.0082) is very close to zero, and its confidence interval crosses zero. With only 5 waypoint positions, the slope is estimated from 5 data points, making it sensitive to noise at any single position. The U-shape is more informative than the slope as a summary statistic. Future work should use the full positional profile rather than a linear fit.

**Asymmetric run counts.** Forward and reverse data come from different phases with different repetition counts (10-20 forward, 10 reverse). This creates unequal precision in the two legs of the mirror comparison. The effect is small but could bias the convergence estimates slightly.

---

## 7. Phase 4 Directions

Phase 3 opens several promising lines for Phase 4, ranked by expected information value.

### 7a. Dimensionality Probing

The hot-energy-cold result -- where "energy" is associated with both "hot" and "cold" but occupies a different conceptual axis -- raises a direct question: how many dimensions does conceptual space have, and can we identify them? If temperature is one axis and physics/thermodynamics is another, and these axes are navigated independently, then we can design experiments to probe the dimensionality of specific conceptual regions.

**Design:** Select a focal concept (e.g., "light") with multiple associated dimensions (brightness, weight, divinity, enlightenment). Construct triples that traverse each dimension separately and across dimensions. Measure whether cross-dimension paths show near-zero transitivity (as hot-energy-cold does) or partial transitivity (suggesting the dimensions are not fully independent).

### 7b. Chain Length Scaling

We tested triples (3-concept chains). How does transitivity scale with chain length? For a 4-concept chain A-B-C-D, does the path from A to D pass through B, C, or both? If compositionality is genuine, longer chains should maintain transitivity at each link. If it is approximate, longer chains should show degradation as errors compound.

**Design:** Extend the animal-dog-poodle chain to animal-mammal-dog-poodle (4 steps) and animal-vertebrate-mammal-dog-poodle (5 steps). Measure bridge concept frequency at each intermediate point. Plot transitivity as a function of chain length.

### 7c. Cross-Model Bridge Agreement

The music-harmony-mathematics result shows that Claude routes through "harmony" 100% of the time while Gemini routes through completely different concepts. Do cross-model bridge disagreements predict cross-model Jaccard? If Claude's path goes through "harmony" and GPT's goes through "pattern," do their direct music-to-mathematics paths share fewer waypoints than pairs where they agree on the bridge?

**Design:** For each triple where models disagree on bridge concept, compute cross-model Jaccard for the direct A-to-C path. Compare against triples where models agree on the bridge. This tests whether bridge concept selection is the mechanism behind cross-model path divergence.

### 7d. The Convergence Profile at Higher Resolution

The U-shaped positional convergence from Phase 3A is estimated from 5 waypoints -- 5 data points per profile. With 10 waypoints, we would get 10 positions, enough to see whether the U-shape is smooth or contains finer structure. Do positions 4-7 in a 10-waypoint path show a flat valley, or is there substructure?

**Design:** Collect 10-waypoint forward and reverse paths for a subset of pairs. Compute per-position mirror-match rates at 10 positions instead of 5. Test whether the dual-anchor effect is confined to the first and last 1-2 waypoints or extends deeper into the path.

### 7e. Targeted Gemini Investigation

Gemini's consistent position as the most fragmented model -- highest asymmetry, lowest transitivity, sole triangle inequality violator, zero bridge frequency on abstract triples -- warrants focused investigation. Is this fragmentation a property of the specific model version (Gemini 3 Flash Preview), or does it characterize the Gemini architecture more broadly?

**Design:** Run a subset of the benchmark (5-10 pairs, forward + reverse + 2 triples) on Gemini Pro or a different Gemini variant if available. Compare topological properties to Flash. If fragmentation persists across variants, it is architectural; if it varies, it is a training/scale effect.

---

## 8. Summary of Key Findings

1. **Positional convergence is U-shaped, not monotonic.** Both endpoints anchor the path; the middle is the region of maximum divergence. The starting-point hypothesis requires refinement to a dual-anchor model.

2. **Hierarchical transitivity is 4.9x random controls.** The strongest evidence to date that conceptual navigation reflects genuine geometric structure, not mere word association. Bridge concepts appear systematically for taxonomic triples and never for random controls.

3. **Polysemy extends compositionally.** The bank-river-ocean chain shows that sense resolution (Phase 1) feeds directly into compositional navigation: once "bank" resolves to its geographic sense, "river" is on the path to "ocean" 72.5% of the time.

4. **The triangle inequality holds in 91% of cases.** Combined with the symmetry violation (Phase 2), this formally characterizes conceptual space as quasimetric -- asymmetric but composable.

5. **"Energy" is not on the temperature axis.** The hot-energy-cold result shows that association is not the same as being on-route. Compositional structure is relationship-specific, not merely correlation-based.

6. **Claude has the highest transitivity; Gemini has the lowest.** This extends the topological characterization from Phases 1-2: Claude = dense and globally connected, Gemini = fragmented and locally specialized.

7. **Bridge concept frequency is model-specific.** "Harmony" bridges music and mathematics for Claude (100%) and Grok (80%), but not for GPT (15%) or Gemini (0%). Models find different compositional decompositions of the same conceptual journey.

8. **The dual-anchor effect is category-dependent.** Antonyms show late convergence (axis-as-funnel); identity shows middle dominance; random controls show a pure U-shape; nonsense shows nothing. The shape of the convergence profile encodes the type of semantic relationship.
