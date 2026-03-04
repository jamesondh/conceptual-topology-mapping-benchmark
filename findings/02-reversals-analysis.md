# Phase 2 Analysis: Navigation Is Directional, and That Changes Everything

> Interpretive analysis of the Phase 2 reversal experiment.
>
> 840 reverse runs + 120 polysemy supplementary across 4 models, 21 concept pairs.
>
> March 2026

## Executive Summary

**Conceptual navigation in LLMs is fundamentally asymmetric.** The overall mean asymmetry index of 0.811 means that, on average, the path from A to B shares less than 19% of its waypoints with the path from B to A. This is not a subtle effect, and it is not what we predicted.

Going in, we expected a mixed profile: some categories symmetric (antonyms, near-synonyms, controls), others asymmetric (hierarchies, polysemy, anchors). Instead, we found pervasive asymmetry across nearly every category. Four of our eight category-level predictions failed. The two most instructive failures — control-random (0.908 asymmetry) and control-nonsense (0.986) — reveal something about how models navigate that we did not anticipate: **when there is no semantic bridge between concepts, the path is almost entirely determined by the starting point.** Models do not find "the" path between two concepts. They construct a path forward from wherever they start.

This is Phase 2's headline contribution: asymmetry is not a defect or an artifact. It is a measurable, robust structural property of conceptual navigation. It differentiates models, differentiates categories, and tells us something fundamental about the geometry of these spaces — they are not metric spaces in the classical sense. Direction matters.

---

## 1. The Asymmetry Surprise

We expected a mean asymmetry somewhere around 0.4-0.6 — meaningful but moderate, with clear category-dependent variation. We got 0.811 (95% CI: [0.772, 0.848]). The distribution is heavily right-skewed: 54 of 84 pair/model combinations (64%) have asymmetry above 0.8. Only 5 (6%) fall below 0.5.

This is not just "paths differ." This is "paths share almost nothing." When Claude navigates from origami to gravity, it produces waypoints like *paper airplane, flight, atmosphere, mass, weight*. Reverse the direction — gravity to origami — and it produces *tension, fold, paper, geometry, structure*. Cross-direction Jaccard: 0.000. Perfectly non-overlapping. The same model, the same concepts, but the starting point completely determines the trajectory.

Why is this surprising? Because if conceptual space had roughly metric geometry — if the "distance" from A to B were approximately equal to the distance from B to A — we would expect the navigational paths to be at least partially overlapping, perhaps traversing similar intermediate territory in opposite directions. A hiker going from town A to town B over a mountain pass traverses the same pass regardless of direction. Our models are not doing this. They are taking completely different routes depending on which town they start from.

### Connection to the Reversal Curse

The reversal curse literature (Berglund et al., 2023) established that LLMs trained on "A is B" fail to learn "B is A." Our findings extend this from factual recall to conceptual navigation: models trained on the same corpus navigate from A to B through completely different conceptual territory than from B to A. But the extension is not a simple replication. The reversal curse is typically framed as a failure — the model "should" be able to reverse the association but cannot. Our asymmetry data suggests this framing may be incomplete.

The asymmetry we observe is not random failure. It is structured — it varies by category, by model, by concept pair, in ways that track semantic properties of the pairs. The directional optimization asymmetry literature (2025) provides a mechanistic account: even under symmetric training, transformers exhibit a pronounced forward-vs-inverse optimization gap. Our behavioral data is consistent with this: the asymmetry we observe may reflect something fundamental about how autoregressive architectures process directional relationships, not just a training data artifact.

### What Kind of Space Is This?

A true metric space satisfies d(A,B) = d(B,A). Our asymmetry data strongly suggests that whatever "distance" models implicitly compute between concepts does not satisfy this axiom. This is not unprecedented — Tversky (1977) showed that human similarity judgments are asymmetric too (North Korea is judged more similar to China than China is to North Korea). But the magnitude of asymmetry in our data (0.811) is much larger than typical Tversky-style effects.

This puts us in the territory of quasimetric spaces — spaces where d(A,B) is not necessarily equal to d(B,A). Quasimetric spaces have well-developed mathematical theory, and the asymmetry patterns in our data could potentially be used to characterize the specific quasimetric properties of each model's conceptual space. This is a Phase 3 candidate.

---

## 2. The Category Prediction Scorecard

We made eight category-level predictions before running the experiment. Four matched, four failed. The pattern of failures is more interesting than the successes.

### Predictions That Matched

**Anchor pairs: predicted asymmetric, observed 0.911.** The highest asymmetry of any experimental category. Pairs like beyonce-erosion and tesla-mycelium connect concepts from wildly different domains. The word convergence game had already shown that these pairs have deep basin structure — "formation" attracts 78-82% of beyonce+erosion games. But that basin may only be accessible from certain directions. Starting from "beyonce" activates a music/culture frame; starting from "erosion" activates a geology/process frame. The conceptual bridge exists (it is the same basin), but the on-ramp differs completely depending on your starting position.

**Polysemy: predicted asymmetric, observed 0.824.** Sense activation is directional, and now we have the data to prove it properly (see Section 5 below). "bank" navigated toward "river" activates geographic/hydrological concepts; "river" navigated toward "bank" might still activate geography, but the path structure is different because the starting frame differs.

**Hierarchy: predicted asymmetric, observed 0.683.** The lowest asymmetry among the correctly-predicted categories, which makes sense. Hierarchical relationships have strong taxonomic structure that constrains navigation in both directions — you almost have to pass through "dog" or "mammal" whether going from animal to poodle or from poodle to animal. But specialization (animal to poodle: narrowing) and generalization (poodle to animal: broadening) are still different navigational operations. The Grok result on animal-poodle is notable: 0.271 asymmetry, the second-lowest in the entire dataset (after identity). Grok found nearly the same path in both directions. GPT was at 0.535, Claude at 0.818, Gemini at 0.771. This is a huge model-dependent spread for the same pair — hierarchy asymmetry is not a property of the pair alone but of the pair-model interaction.

**Control-identity: predicted symmetric, observed 0.456.** apple-to-apple is the most symmetric experimental condition, as expected. Claude achieves near-perfect symmetry (0.017) — its characteristic waypoints for apple (*fruit, tree, harvest, orchard, seed*) are so rigid that direction literally cannot matter. But Grok shows 0.704 asymmetry even for the identity pair. This is revealing: Grok's higher entropy (more variable waypoint vocabulary from Phase 1) means that even when the "path" is trivially defined, different runs sample different associations, and forward and reverse samples diverge. The identity pair is a clean test of whether model-level variance alone produces asymmetry — and for Grok, it substantially does.

### Predictions That Failed

**Antonym (hot-cold): predicted high symmetry, observed 0.596.** This is a moderate failure. We expected the temperature axis to be traversable in both directions with the same intermediate waypoints — warm, tepid, cool, chilly should appear whether going hot-to-cold or cold-to-hot. And for some models, they do: GPT shows 0.361 asymmetry (its second-lowest), Grok shows 0.420. But Gemini shows 0.887 and Claude shows 0.714.

What is happening? The GPT deep dive is instructive: its forward-exclusive waypoint is "tepid" — present in hot-to-cold but absent from cold-to-hot. This makes cognitive sense. "Tepid" is an asymmetric concept: it describes something that *was* hot and has *become* lukewarm. Its conceptual gravity pulls toward the hot end of the axis. Starting from cold and moving toward hot, you might pass through "chilly, cool, mild, warm" — a different set of milestones on the same axis. The axis itself is symmetric, but the *landmarks* along it are not equidistantly spaced in both directions.

This is a genuinely interesting finding. Even for the most symmetric conceptual relationship in our dataset (temperature gradation), the paths are not mirror images. The specific intermediate concepts that a model generates depend on whether it is conceptually "warming up" or "cooling down." **Antonyms define a shared axis, but navigation along that axis is still directional.**

**Near-synonym (cemetery-graveyard, happy-joyful): predicted high symmetry, observed 0.665.** We expected dense semantic neighborhoods to constrain paths similarly in both directions. The data partially supports this — near-synonyms are the third-lowest asymmetry category — but 0.665 is still substantial. For cemetery-graveyard, the path from "cemetery" might go through *burial, headstone, mourning, memorial* while the path from "graveyard" might go through *tombstone, churchyard, death, remembrance*. The neighborhoods are dense, but they are dense with *different* near-synonyms depending on which end you start from. This connects to the Phase 1 observation about synonym friction in concrete nouns: there are many near-synonyms, and the model's starting position determines which ones it passes through.

**Control-random: predicted symmetric, observed 0.908.** This is arguably the most important finding in Phase 2, discussed in depth in Section 3 below.

**Control-nonsense: predicted symmetric, observed 0.986.** Near-perfect asymmetry for xkplm-to-qrvzt versus qrvzt-to-xkplm. This is less surprising once you think about it carefully: nonsense strings have no shared semantic content, so whatever pattern-matching the model does is entirely driven by the surface features of the starting string. "xkplm" might evoke consonant-cluster associations; "qrvzt" might evoke different ones. With no semantic content to provide a bridge, the only determinant of the path is the starting point. This is the extreme case of the starting-point hypothesis.

---

## 3. The Starting Point Hypothesis

The control-random result is the most intellectually significant finding of Phase 2.

**Prediction:** Random pairs (stapler-monsoon, telescope-jealousy, etc.) should show moderate-to-low asymmetry. The concepts are unrelated, so there is no inherent directionality. A path constructed from stapler to monsoon should be about as arbitrary as one from monsoon to stapler — no semantic gradient to privilege one direction.

**Observation:** 0.908 asymmetry (95% CI: [0.878, 0.935]). Control-random pairs are *more* asymmetric than almost every experimental category. Only anchor pairs (0.911) and nonsense (0.986) exceed them.

**Interpretation:** This result inverts our causal model. We had been thinking about asymmetry as arising from the *relationship* between concepts — hierarchies are directional because specialization differs from generalization, polysemy is directional because sense activation is one-way, etc. But control-random pairs have no meaningful relationship. Their extreme asymmetry suggests a different mechanism: **when there is no semantic bridge constraining the path, the starting concept alone determines the trajectory.**

Consider stapler-to-monsoon versus monsoon-to-stapler. Starting from "stapler," the model enters an office/school-supplies frame and begins navigating outward: *office, build, architecture, climate*. Starting from "monsoon," it enters a weather/natural-disaster frame: *flood, infrastructure, office building*. Both paths eventually reach overlapping territory (office/architecture), but the early waypoints are entirely determined by the starting concept's semantic neighborhood. By the time the paths converge on shared territory, they have already committed to different intermediate concepts.

The deep dive confirms this. For origami-gravity (Claude), the paths are perfectly non-overlapping (Jaccard 0.000). Forward: *paper airplane, flight, atmosphere, mass, weight*. Reverse: *tension, fold, paper, geometry, structure*. The origami frame activates paper/folding; the gravity frame activates physics/mass. These are not "two paths to the same destination" — they are two different navigational strategies, each generated by forward-chaining from the starting concept rather than planning a route to the target.

### What This Tells Us About How Models Navigate

This finding has a clear implication for the mechanistic picture of conceptual navigation: **models do not plan paths.** They do not look at A and B, identify a midpoint, and trace a route. Instead, they start from A, generate a "next step" that is locally plausible, then generate the next step from there, and so on, eventually arriving in the neighborhood of B. This is greedy forward search, not global path planning.

If this interpretation is correct, it explains the full pattern of asymmetry we observe:

- **High asymmetry for unrelated pairs (control-random, anchor):** No semantic bridge constrains the path, so the starting point dominates. The model chains forward from A through A's neighborhood, then gradually bends toward B's neighborhood. Starting from B, it chains through B's neighborhood toward A's. These are completely different paths.

- **Lower asymmetry for tightly related pairs (hierarchy, antonym, near-synonym):** The semantic bridge constrains the intermediate territory. hot-to-cold must pass through temperature-related concepts regardless of direction. The bridge acts as a bottleneck that both directions must traverse, creating forced overlap.

- **Intermediate asymmetry for polysemy and cross-domain:** These have partial bridges — conceptual connections that constrain some waypoints but leave others to the starting-point effect.

This is a strong and testable hypothesis. Phase 3 could test it directly by examining the positional distribution of asymmetry: if the starting-point effect is real, we should see the *first* 1-2 waypoints diverge most strongly, with convergence increasing toward the end of the path as both directions approach the target concept's neighborhood.

### A Speculation

*[Marked as speculation.]* The starting-point effect might explain an otherwise puzzling aspect of the word convergence game: why cross-model games take longer to converge (4.1 rounds vs. 2.3-2.8 for same-model). If each model's "first step" is determined by its specific neighborhood structure around the starting concept, different models will begin in different sub-neighborhoods and take longer to find shared territory. Same-model games converge faster because both instances start from the same neighborhood representation.

---

## 4. Model Direction Sensitivity

| Model | Mean Asymmetry | Phase 1 Within-Model Jaccard | Interpretation |
|-------|----------------|------------------------------|----------------|
| Gemini | 0.867 | 0.372 | High asymmetry, moderate consistency |
| Grok | 0.803 | 0.293 | High asymmetry, variable explorer |
| GPT | 0.794 | 0.258 | High asymmetry, most variable |
| Claude | 0.780 | 0.578 | Lowest asymmetry, most consistent |

### Does Rigid Navigation Correlate with Direction Sensitivity?

Phase 1 established that Claude is the most rigid navigator (highest within-model Jaccard at 0.578). Phase 2 shows Claude is also the least direction-sensitive (lowest mean asymmetry at 0.780). This is a suggestive inverse correlation: **the more rigid a model's navigation, the less it is affected by direction reversal.**

But the correlation is imperfect. Gemini (0.372 within-model Jaccard, so moderately consistent) has the highest direction sensitivity (0.867), while Grok (0.293 Jaccard, variable) and GPT (0.258, most variable) cluster in the middle of the asymmetry range (0.803 and 0.794). If rigidity simply suppressed asymmetry, we would expect GPT to be most asymmetric — but Gemini is.

A better interpretation: **Claude's rigidity is not just consistency across runs — it is consistency across directions.** Claude's conceptual paths are highly determined by the pair itself, not by the direction. Its strong internal topology means the "map" between two concepts is largely fixed, and starting from either end leads to overlapping waypoints. Gemini, by contrast, has weaker path determination: the same pair traversed in opposite directions produces quite different intermediate concepts.

This suggests two independent axes of navigational character:
1. **Within-direction consistency** (Phase 1 Jaccard): How similar are repeated forward runs?
2. **Cross-direction consistency** (Phase 2 asymmetry index): How similar are forward vs. reverse paths?

Claude is high on both. GPT is low on within-direction but moderate on cross-direction. Gemini is moderate on within-direction but low on cross-direction (high asymmetry). These are different "personality" dimensions, and a model can be consistent-but-directional (hypothetically) or inconsistent-but-symmetric (hypothetically).

### Gemini's Anomalous Sensitivity

Gemini's position as the most direction-sensitive model (0.867) deserves closer attention. In Phase 1, Gemini was described as "fast like Claude but with stranger word choices" — technically correct associations drawn from a different knowledge organization (*"thorax" for hammer+butterfly, "hamlet" for skull+garden*). Phase 2 suggests that Gemini's "strange" knowledge organization is also *highly directional*. When Gemini traverses a pair in one direction, it commits to a particular associative frame; reversing the direction activates a different frame entirely.

Look at Gemini's individual pair results. For hot-cold (an antonym pair with a single obvious axis), Gemini shows 0.887 asymmetry — the highest of any model on this pair, dramatically higher than GPT (0.361) or Grok (0.420). Gemini is navigating the temperature axis *differently* depending on direction, while GPT and Grok traverse essentially the same landmarks. Similarly, for happy-joyful, Gemini shows 0.895 asymmetry while Claude shows 0.568 and GPT shows 0.411.

*[Speculation:]* Gemini may have a more fragmented or compartmentalized conceptual topology — rich local structure within each semantic neighborhood, but weaker global connections between neighborhoods. This would produce high direction sensitivity: entering from the "happy" side activates one local cluster, entering from the "joyful" side activates a different one, with insufficient global structure to force convergence onto shared waypoints. This is the topological opposite of Claude, whose strong global structure produces consistent paths regardless of direction.

---

## 5. Polysemy Vindicated

Phase 1 reported "perfect sense differentiation" with cross-pair Jaccard of 0.000 for all three polysemy groups (bank, bat, crane). Phase 2 revealed this was an artifact: the holdout pairs had no pilot data, so the zero Jaccard was comparing real data against empty sets.

The supplementary runs (120 forward runs across the 3 holdout polysemy pairs) fix this properly. The corrected results:

| Group | Cross-Pair Jaccard | Interpretation |
|-------|-------------------|----------------|
| bank (river vs mortgage) | 0.062 | Near-zero: strong sense differentiation |
| bat (cave vs baseball) | 0.059 | Near-zero: strong sense differentiation |
| crane (construction vs wetland) | 0.011 | Near-zero: strong sense differentiation |

The headline finding survives correction: **polysemy sense differentiation is genuine, not artifactual.** Cross-pair Jaccard values of 0.011-0.062 are not zero, but they are far below any within-pair or within-category Jaccard we observe elsewhere in the data. The word "crane" paired with "construction" and the word "crane" paired with "wetland" produce almost entirely non-overlapping waypoint sets, confirming that the target concept (not the source word) determines which sense is activated and which conceptual territory is traversed.

The crane group (0.011) is particularly clean — essentially just one shared waypoint across all models and runs between the construction-crane and bird-crane paths. This is strong evidence that LLMs genuinely differentiate word senses through their conceptual navigation, not merely through surface associations.

### Polysemy and the Starting-Point Hypothesis

The polysemy finding is actually a specific case of the starting-point hypothesis from Section 3. The starting concept ("crane") is the same in both directions, but the *target* concept differs (construction vs. wetland). The near-zero cross-pair Jaccard shows that the target exerts strong gravitational pull on the path — the model is not just chaining forward from "crane" indiscriminately, but navigating *toward* the target from the very first waypoint.

This partially complicates the pure starting-point hypothesis. If paths were entirely determined by the starting concept, both crane-construction and crane-wetland would produce similar initial waypoints (both starting from "crane"). The fact that they do not means the target concept also influences the path, at least when the starting concept is polysemous. The resolution may be that both starting and target concepts contribute to the initial frame activation, but the starting concept contributes more strongly in most cases — strong enough to dominate for unrelated pairs (control-random), but not strong enough to override sense disambiguation when the target provides clear directional signal.

---

## 6. What This Means for the Benchmark

### Directional Asymmetry as a Measurement

Phase 2 establishes that directional asymmetry is:

1. **Measurable** — The asymmetry index is well-defined, has tight confidence intervals (typical CI width ~0.08), and is robustly estimated from 10 reps per condition.

2. **Robust** — 73 of 84 pair/model combinations (86.9%) show statistically significant asymmetry (p < 0.05 by permutation test). This is not noise.

3. **Discriminative** — Asymmetry varies meaningfully by category (0.456 for identity to 0.986 for nonsense), by model (0.780 for Claude to 0.867 for Gemini), and by individual pair. It captures real structure.

4. **Interpretable** — The patterns connect to known properties of the concepts (hierarchy, polysemy, semantic relatedness) and to known properties of the models (consistency, gait). The results are not arbitrary.

### Metric Space Properties

The asymmetry data has direct implications for the geometric properties of conceptual space:

**Symmetry axiom: violated.** d(A,B) is not equal to d(B,A) in any meaningful sense. If we define "distance" as the dissimilarity of forward-path waypoints to reverse-path waypoints, the asymmetry index directly measures this violation. Mean violation magnitude of 0.811 is massive.

**Triangle inequality: unknown but suspect.** If the symmetry axiom fails this badly, the triangle inequality likely fails too. This is a Phase 3 question, but the asymmetry data gives us reason to expect interesting violations. If the path from A to B goes through completely different territory than the path from B to A, there is no reason to expect that d(A,B) + d(B,C) >= d(A,C) — the "intermediate" concepts may not form a coherent chain.

**Identity axiom: approximately holds.** The control-identity pair (apple-to-apple) shows low asymmetry (0.456 mean, 0.017 for Claude), and the forward/reverse paths are essentially identical for at least some models. This is the one metric axiom that seems to hold.

The emerging picture is of a **quasimetric space** — a space with well-defined but asymmetric distances. Quasimetric spaces are standard mathematical objects (they arise naturally in many contexts, including computation complexity and directed graphs), and the framework may be useful for formalizing the geometry of conceptual navigation.

### The Category Hierarchy, Revisited

Phase 1 ranked categories by within-model consistency (antonym > hierarchy > near-synonym > cross-domain > polysemy > anchor). Phase 2 adds a second ranking by directional asymmetry:

| Rank by Asymmetry | Category | Asymmetry | Phase 1 Consistency Rank |
|-------------------|----------|-----------|--------------------------|
| 1 (most symmetric) | control-identity | 0.456 | n/a (control) |
| 2 | antonym | 0.596 | 1 (most consistent) |
| 3 | near-synonym | 0.665 | 3 |
| 4 | hierarchy | 0.683 | 2 |
| 5 | cross-domain | 0.822 | 4 |
| 6 | polysemy | 0.824 | 5 |
| 7 | control-random | 0.908 | n/a (control) |
| 8 | anchor | 0.911 | 6 (least consistent) |
| 9 | control-nonsense | 0.986 | n/a (control) |

There is a clear correlation: **categories with higher within-direction consistency tend to show lower directional asymmetry.** Antonyms, the most consistent category from Phase 1, are the most symmetric in Phase 2. Anchor pairs, the least consistent, are the most asymmetric. This makes sense under the starting-point hypothesis: strong semantic structure (antonyms, hierarchies) constrains the path regardless of direction, producing both high consistency and high symmetry. Weak or absent semantic structure (random, anchor) leaves the path unconstrained, amplifying both run-to-run variance and direction-dependent divergence.

The anchor pairs are the most telling case. They are the least consistent within-direction *and* the most asymmetric across-direction (among experimental categories). This double instability suggests their conceptual topology is genuinely complex — multiple viable paths with no dominant one, and different paths activated depending on direction. The word convergence game already showed this: beyonce+erosion has the deep "formation" basin, but reaching it requires navigating through model-specific and direction-specific conceptual territory.

---

## 7. The Deeper Questions

### Is Asymmetry a Bug or a Feature?

The reversal curse literature frames directional asymmetry as a failure of autoregressive architectures. Our data complicates this framing. Yes, models cannot navigate A-to-B the same way as B-to-A. But humans cannot either — Tversky's work established that human similarity judgments are asymmetric, and spreading activation theory (Collins & Loftus, 1975) predicts that conceptual activation patterns depend on the starting node. The question is not whether asymmetry is "correct" or "incorrect" but whether it is *structured* — and our data shows it is.

Structured asymmetry is information. It tells us about the shape of conceptual space in a way that symmetric distance measures cannot. A map with one-way streets reveals more about the terrain than a map with only two-way roads. Each model's asymmetry profile is a fingerprint of its directional topology — how its conceptual space is organized with respect to traversal direction.

### What Would Symmetry Even Mean?

*[Speculation.]* If a model navigated perfectly symmetrically — identical paths in both directions — what would that imply about its conceptual space? It would mean the model has a single, globally accessible path between any two concepts that can be traversed in either direction. This would require either: (a) a very simple, low-dimensional conceptual space with few possible paths, or (b) a very strong path-planning capability that identifies the globally optimal route regardless of starting position.

Neither of these seems desirable. A simple space lacks expressive power. A strong path planner would be computationally expensive and architecturally complex. The asymmetry we observe may be the natural consequence of efficient conceptual navigation: local, greedy, starting-point-dependent, and good enough for most purposes even if not globally optimal.

### Connecting to the Platonic Representation Hypothesis

The PRH (Huh et al., 2024) predicts that model representations are converging toward a shared structure. Our cross-model Jaccard data from Phase 1 (~0.17-0.20) showed that models share *some* structure but navigate differently. Phase 2 adds a directional dimension: if the PRH is correct and representations are converging, we might expect asymmetry profiles to also converge across models — similar pairs should be asymmetric in similar ways.

The data partially supports this. The category-level rankings are similar across models: all four models show high asymmetry for control-random and anchor pairs, lower for antonyms and near-synonyms. But the magnitudes differ substantially (Claude at 0.780 mean vs. Gemini at 0.867), and individual pair results show strong model dependence (hot-cold: GPT 0.361 vs. Gemini 0.887). The shared representation may determine *which* pairs are more asymmetric, while the model-specific gait determines *how much* asymmetry manifests.

---

## 8. Phase 3 Directions

Phase 2 opens several compelling lines of investigation. Ranked by expected information value:

### 8a. The Triangle Inequality Test

The most natural next step. We have established that d(A,B) is not equal to d(B,A). The next metric axiom to test is the triangle inequality: does d(A,C) <= d(A,B) + d(B,C)? Given the magnitude of directional asymmetry, violations are likely. The interesting question is whether violations are systematic — do they track semantic properties of the concept triple?

**Design:** Select 10-15 concept triples (A, B, C) where each pair has Phase 1+2 data. Compute "distances" (1 - Jaccard overlap) for all three legs. Test the triangle inequality. Look for triples where the "direct" path A-to-C is *shorter* (more overlapping waypoints) than the "detour" through B.

**Prediction:** Triples involving concept B that lies "between" A and C in semantic space (e.g., A=animal, B=dog, C=poodle) should satisfy the triangle inequality. Triples where B is semantically distant from the A-C axis should show violations.

### 8b. Positional Asymmetry Analysis

A direct test of the starting-point hypothesis. For each pair/model with high asymmetry, examine *where* in the waypoint sequence the divergence occurs. If the starting-point effect is real, the first 1-2 waypoints should show near-zero overlap between forward and reverse paths, with overlap increasing toward the end as both directions converge on the target's neighborhood.

**Design:** For each pair with sufficient overlap (Jaccard > 0.1), compute position-specific overlap: what fraction of forward runs' first waypoint matches any reverse run's last waypoint? Second-to-first? And so on. Build a "convergence profile" showing how overlap changes along the path.

**Expected outcome:** An asymmetric U-shape — high match at the endpoints (trivially, since the endpoints are the given concepts), low match for early/mid waypoints, with the specific shape of the curve depending on whether the pair has strong semantic bridges (early convergence) or weak ones (late convergence).

### 8c. Model-Specific Asymmetry Topology

Gemini's anomalous direction sensitivity warrants a focused investigation. Why does Gemini show 0.887 asymmetry on hot-cold when GPT shows 0.361? What is different about Gemini's conceptual topology that makes even well-constrained axes directional?

**Design:** Select 5 pairs where models disagree most on asymmetry. Collect additional runs (20 reps per direction) to get tighter estimates. Examine the actual waypoint sequences to identify what "frame" each model activates in each direction. Map the model-specific asymmetry profiles to see if they cluster by architecture family.

### 8d. Scaling Effects on Asymmetry

Does asymmetry decrease with model scale? The reversal curse literature suggests it might — larger models with more training data have more opportunity to learn both directions of an association. Testing smaller and larger variants of the same model family (e.g., different Claude or Gemini sizes) could reveal whether asymmetry is an architectural constant or a capacity-dependent variable.

### 8e. The Random-Pair Gradient

The control-random result (0.908 asymmetry) is an average across 6 pairs. But these pairs vary in their semantic distance — "umbrella-photosynthesis" has an obvious bridge (rain-water-plants) while "shoelace-democracy" does not. Is asymmetry correlated with the availability of semantic bridges? If so, we can calibrate the starting-point effect: high asymmetry for pairs with no bridge, decreasing as the bridge becomes stronger.

**Design:** Rank the 6 random pairs by their asymmetry. Check: umbrella-photosynthesis (0.825 mean) vs. flamingo-calculus (0.965 mean) vs. telescope-jealousy (0.835 mean). Cross-reference with Phase 1 consistency data: do pairs with higher forward consistency (more bridge structure) show lower asymmetry?

Looking at the data: flamingo-calculus (0.965 mean asymmetry across models) and origami-gravity (0.934) are the most asymmetric random pairs. Umbrella-photosynthesis (0.825) and telescope-jealousy (0.835) are the least. This gradient is consistent with the hypothesis — pairs with weaker bridges show stronger starting-point effects — but the sample is too small to be conclusive.

---

## 9. Methodological Notes

### What the Asymmetry Index Captures and Misses

The asymmetry index (1 - mean cross-direction Jaccard) measures set-level overlap between forward and reverse waypoint pools. It captures *what* concepts appear in the path but not *where* they appear. Two paths that share 4 of 5 waypoints but in completely different order would show asymmetry = 0.2 (low), even though the navigational experience is very different. The edit distance and Spearman's rho metrics partially address this, but for most pairs, the overlap is so low that ordering metrics are not meaningful — you cannot order concepts that do not overlap.

### The 5-Waypoint Window

All Phase 2 comparisons use 5-waypoint paths only. This is appropriate — Phase 1 showed 5wp paths are coarse-grained versions of 10wp paths (70.5% shared waypoint fraction). But 5 waypoints is a very short path. With only 5 intermediate concepts, the probability of two independently-generated paths sharing any waypoint by chance is low even without true asymmetry. We should be cautious about attributing all of the observed asymmetry to genuine directional effects — some of it may reflect the sparsity of 5-waypoint representations.

That said, the permutation test controls for this. 86.9% of pair/model combinations show significant asymmetry by permutation test, meaning the observed asymmetry exceeds what would be expected if forward and reverse runs were drawn from the same distribution. The effect is real, not just a sampling artifact.

### Limitations

- **Single prompt format.** All runs use the "semantic" prompt. Different prompt framings might elicit different levels of asymmetry.
- **Temperature fixed at 0.7.** Lower temperature might reduce asymmetry by making paths more deterministic; higher temperature might increase it. The temperature-asymmetry relationship is worth exploring.
- **Lexical matching only.** The Jaccard metric treats "tepid" and "lukewarm" as completely different waypoints. An embedding-based similarity metric would likely reduce apparent asymmetry by recognizing near-synonyms. The deferred semantic similarity optimization (see `_deferred/semantic-similarity-optimization.md`) would address this.
- **10 reps per reverse condition** (vs. 10-20 forward) produces slightly wider CIs for reverse estimates. Not a major concern given the effect sizes we observe.

---

## 10. Summary of Key Findings

1. **Navigation is fundamentally directional.** Mean asymmetry of 0.811 is far higher than expected. Forward and reverse paths typically share less than 20% of their waypoints.

2. **The starting point dominates.** Control-random pairs (0.908 asymmetry) show that when there is no semantic bridge, the path is almost entirely determined by the starting concept. Models construct paths forward, not plan routes globally.

3. **Semantic bridges reduce asymmetry.** Categories with strong bidirectional structure (antonyms, hierarchies, near-synonyms) show lower asymmetry than categories without it. The strength of the semantic bridge predicts how symmetric the path will be.

4. **Claude navigates most symmetrically.** The most rigid navigator (highest within-model Jaccard) is also the least direction-sensitive (lowest asymmetry). Rigid topology resists directional perturbation.

5. **Gemini is anomalously directional.** The highest direction sensitivity despite moderate within-direction consistency suggests fragmented or compartmentalized conceptual topology.

6. **Polysemy sense differentiation is real.** Corrected cross-pair Jaccard of 0.011-0.062 confirms that different sense targets produce genuinely different paths, fixing the Phase 1 artifact.

7. **Conceptual space is quasimetric.** The symmetry axiom fails comprehensively. Whatever geometry these spaces have, it is not a metric geometry. Quasimetric frameworks may be appropriate.

8. **Asymmetry is structured information.** The pattern of asymmetries tracks semantic properties and model characteristics. It is signal, not noise, and a viable basis for model fingerprinting and conceptual topology mapping.
