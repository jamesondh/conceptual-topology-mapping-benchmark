# Phase 4 Analysis: Bridge Topology, Fragmentation Boundaries, and the Limits of Prediction

> Interpretive analysis of Phase 4: cross-model bridge agreement (4A) and targeted bridge topology (4B).
>
> 0 new API runs (4A, pure analysis of Phase 3B data) + 1,520 new runs + 320 reused (4B), across 4 models, 8 triples.
>
> March 2026

## Executive Summary

**Phase 4 reveals that bridge concepts are not merely associated with endpoints -- they are navigational infrastructure, and models differ sharply in which infrastructure they build.** The targeted bridge experiment (4B) confirms that some bridges are universal: "spectrum" routes light to color for all four models, and "deposit" routes bank to savings for all four, including Gemini. Other bridges fail universally: "metaphor" was predicted by all three non-Gemini models' prior behavior to bridge language and thought, yet no model routes through it -- the single largest prediction miss in the benchmark. Gemini's topological fragmentation, first observed in Phase 3, is confirmed as a stable property but with a newly characterized boundary: Gemini succeeds on bridges that operate within a single tight cue-response frame (deposit-savings, spectrum-color) and fails on bridges that require integration across loosely coupled conceptual domains (river-ocean via geographic bank, forest-ecosystem via ecological scaling). The cross-model agreement analysis (4A) reveals a topology-family structure: Claude-GPT and Claude-Grok correlate at r=0.77, forming a "connected navigators" cluster, while Grok-Gemini correlate at only r=0.34, confirming that bridge topology is not converging toward a single shared structure. Prediction accuracy of 81.3% (26/32) validates the benchmark's ability to characterize model topology -- and the 6 misses are more informative than the 26 hits.

---

## 1. The Bridge Topology Landscape

### When Bridges Are Universal

Phase 4B tested six diagnostic triples designed to probe the boundary conditions of bridge concept usage. Two produced perfect unanimity:

**Light-spectrum-color:** Bridge frequency 1.00 for all four models. This is the cleanest bridge result in the entire benchmark. Every model, on every run, routes from "light" to "color" through "spectrum." The transitivity scores are correspondingly high (Claude 0.400, Gemini 0.346), meaning the A-to-C path shares substantial waypoint overlap with the A-to-B and B-to-C legs. Why does this bridge work so reliably? "Spectrum" is not merely associated with both "light" and "color" -- it is the *mechanism* connecting them. Light produces color *via* its spectrum. The bridge concept names the causal process, not a correlated attribute. This makes it unavoidable in navigation: you cannot explain how light relates to color without invoking the spectral decomposition.

**Bank-deposit-savings:** Bridge frequency 1.00 for all four models, including Gemini. This is particularly significant because it is a polysemy triple -- "bank" must resolve to its financial sense for "deposit" to serve as a bridge. In Phase 3B, Gemini showed 0% bridge frequency for bank-river-ocean, routing through financial associations ("gold," "treasure") instead of geographic ones. Here, when the chain stays within the financial frame, Gemini performs identically to every other model. The financial bank-deposit-savings chain operates within a single, tightly coupled domain where each concept cues the next with high associative strength.

### When Bridges Fail Universally

**Language-metaphor-thought:** Bridge frequency 0.00 for all four models. This is the biggest surprise in Phase 4 and warrants its own section (Section 3 below), but the headline is stark: "metaphor" is strongly associated with both "language" and "thought," yet no model routes through it when navigating between the two. This is the purest demonstration to date that *association is not navigation*. A concept can be semantically proximate to both endpoints and still not lie on the path between them.

**Hot-energy-cold** (from Phase 3B, replicated conceptually): Bridge frequency 0.00 for all models. The temperature gradient operates on the experiential axis (warm, tepid, cool, chilly); "energy" lives on the physics axis. Same lesson: being related to both endpoints is necessary but not sufficient for bridging.

### When Bridges Are Model-Dependent

The remaining triples reveal the space where models diverge most:

**Bank-river-ocean:** Claude 1.00, GPT 0.90, Grok 1.00, Gemini 0.00. Three models resolve "bank" to its geographic sense and route through "river"; Gemini resolves to the financial sense and never encounters "river" at all. This is polysemy-driven fragmentation -- Gemini's default sense for "bank" in the context of ocean navigation is not the same as the other three models' default.

**Emotion-nostalgia-melancholy:** Claude 0.37, GPT 0.20, Grok 0.70, Gemini 0.00. The bridge is unreliable even for models that sometimes find it. This is a gradient, not a binary: Grok uses "nostalgia" more than two-thirds of the time; Claude uses it about a third; GPT only a fifth; Gemini never. The abstract-affect domain produces the widest model-to-model spread, suggesting that emotional concept topology is the least convergent across architectures.

**Tree-forest-ecosystem:** Claude 1.00, GPT 0.95, Grok 1.00, Gemini 0.10. This was designed as a "Gemini success prediction" -- a concrete, hierarchical, part-whole chain where Gemini was predicted to succeed (bridge frequency > 0.40). Gemini's observed 0.10 is the second-largest prediction miss for any single model-triple combination in Phase 4. It means that Gemini's fragmentation is *not* limited to abstract or cross-domain bridges. Even a straightforward ecological scaling chain (tree is part of forest, forest is part of ecosystem) fails to route through "forest" in Gemini's topology.

### What Separates Bridges That Work from Bridges That Fail

The pattern across all Phase 4 triples suggests a hierarchy of bridge reliability:

| Bridge Type | Example | All-Model Agreement | Interpretation |
|-------------|---------|---------------------|----------------|
| Causal-mechanistic | spectrum (light-to-color) | 4/4 models at 1.00 | The bridge names the mechanism |
| Within-frame sequential | deposit (bank-to-savings) | 4/4 models at 1.00 | Same domain, tight cue chain |
| Polysemy-mediated geographic | river (bank-to-ocean) | 3/4 at 0.90+ | Requires correct sense resolution |
| Concrete hierarchical | forest (tree-to-ecosystem) | 3/4 at 0.95+ | Part-whole, but spans scale levels |
| Abstract affective | nostalgia (emotion-to-melancholy) | Gradient: 0.00-0.70 | No forced bottleneck |
| Abstract functional | metaphor (language-to-thought) | 0/4 models | Association without routing |

The key distinction is not concrete vs. abstract -- it is whether the bridge concept names something that *must* be traversed versus something that *could* be traversed. "Spectrum" is obligatory: there is no path from light to color that does not invoke spectral decomposition. "Deposit" is obligatory within the financial frame: bank-to-savings necessarily passes through transactional operations. "Metaphor" is optional: there are many paths from language to thought (grammar, communication, cognition, expression, meaning, semantics) that bypass metaphor entirely. The bridge works when it is the bottleneck, not when it is one of many possible waypoints.

---

## 2. Gemini's Fragmentation Boundary

### The Puzzle

Gemini's bridge frequency profile in Phase 4B is the most interpretively rich result of the phase:

| Triple | Gemini Bridge Freq | Other Models' Range |
|--------|-------------------|---------------------|
| bank-deposit-savings | **1.00** | 1.00 - 1.00 |
| light-spectrum-color | **1.00** | 1.00 - 1.00 |
| bank-river-ocean | **0.00** | 0.90 - 1.00 |
| tree-forest-ecosystem | **0.10** | 0.95 - 1.00 |
| emotion-nostalgia-melancholy | **0.00** | 0.20 - 0.70 |
| language-metaphor-thought | **0.00** | 0.00 - 0.00 |

Gemini succeeds spectacularly on two triples and fails spectacularly on three (with the sixth being a universal failure). The question is: what separates the 1.00s from the 0.00s?

### Ruling Out the Obvious Hypotheses

**Concreteness alone does not explain it.** Tree-forest-ecosystem is concrete, spatial, and hierarchical. It should be Gemini's strong suit. Yet Gemini scores 0.10. If concreteness were sufficient, this triple would succeed. Conversely, bank-deposit-savings is abstract (financial transactions are not physical objects) yet Gemini scores 1.00.

**Abstractness alone does not explain it.** Gemini fails on both abstract triples (emotion-nostalgia-melancholy at 0.00, language-metaphor-thought at 0.00). But it also fails on the concrete geographic triple (bank-river-ocean at 0.00) and the concrete ecological triple (tree-forest-ecosystem at 0.10). Abstract failure is real, but it is a subset of a broader pattern.

**Hierarchical structure alone does not explain it.** Tree-forest-ecosystem is a clean part-whole hierarchy (a tree is part of a forest, a forest is part of an ecosystem). Bank-deposit-savings is arguably less hierarchical (a deposit is an *action* related to banking, not a part of it). Yet the non-hierarchical triple succeeds and the hierarchical one fails.

### The Cue-Strength Hypothesis

The pattern becomes clearer when we focus on the *associative strength* between adjacent concepts in the chain:

**Triples where Gemini succeeds (1.00):**
- Bank-deposit-savings: "bank" strongly cues "deposit" in the financial frame. The association is tight, domain-internal, and high-frequency in training data. "Deposit" strongly cues "savings" for the same reasons.
- Light-spectrum-color: "light" strongly cues "spectrum" in the physics frame. "Spectrum" strongly cues "color" (the rainbow is perhaps the most canonical instance of a spectrum).

**Triples where Gemini fails (0.00-0.10):**
- Bank-river-ocean: "bank" must first resolve to its geographic sense, then "river" must bridge to "ocean." The first link requires polysemy resolution that Gemini handles differently; the second link (river-to-ocean) is strong, but the chain is broken at the first link.
- Tree-forest-ecosystem: "tree" cues "forest" strongly (0.95-1.00 for other models), but "forest" to "ecosystem" requires a conceptual scale shift from a concrete spatial collection to an abstract systems concept. The second link is where Gemini's chain breaks. This is the critical clue: Gemini can navigate *within* a tightly coupled associative frame but fails when the chain requires *crossing* between frames -- even when the crossing involves concrete concepts.
- Emotion-nostalgia-melancholy: "emotion" to "nostalgia" requires selecting a specific emotion from a vast space of possibilities. "Nostalgia" to "melancholy" requires recognizing the affective overlap between two related-but-distinct emotions. Both links are loose: many emotions are valid first steps, and many affective states neighbor melancholy.

### The Frame-Crossing Model

Gemini's fragmentation boundary is best characterized not by concreteness or abstractness but by **whether the bridge requires crossing between conceptual frames**. A frame, in this context, is a tightly coupled cluster of concepts with strong mutual cue associations -- the financial operations frame (bank, deposit, withdrawal, savings, account), the electromagnetic spectrum frame (light, spectrum, wavelength, color, frequency), the temperature sensation frame (hot, warm, tepid, cool, cold).

Gemini navigates *within* frames with perfect reliability. Bank-deposit-savings stays entirely within the financial operations frame. Light-spectrum-color stays within the electromagnetic/perceptual frame. Both succeed at 1.00.

Gemini fails when navigation requires *crossing between frames*:
- Bank-river-ocean requires crossing from the financial frame to the geographic frame (or never entering the financial frame -- which the other models accomplish by resolving "bank" to its geographic sense).
- Tree-forest-ecosystem requires crossing from the botanical/spatial frame ("trees make up forests") to the ecological/systems frame ("forests are components of ecosystems"). This is a scale transition: from objects to collections to systems.
- Emotion-nostalgia-melancholy requires navigating through a loosely structured affective space with no tight frame boundaries at all.

This is consistent with the Phase 2 characterization of Gemini as having "fragmented, compartmentalized topology -- rich local structure within each semantic neighborhood, but weaker global connections between neighborhoods." Phase 4 refines this into the **frame-crossing hypothesis**: the fragmentation is specifically at *frame boundaries*. Within-frame navigation is intact; cross-frame integration is impaired.

This hypothesis is plausible but should be treated as exploratory rather than established. The evidence comes from a limited set of triples, and claims like "the second link is where the chain breaks" on tree-forest-ecosystem are inferred from the pattern of bridge frequencies rather than directly measured (we do not observe which specific link Gemini fails on, only that the overall bridge is absent). **What would falsify this?** If Phase 5's cue-strength experiment shows that Gemini fails on within-frame bridges with weak cue strength (e.g., a tightly-scoped financial chain with an uncommon intermediate), the frame-crossing model would be incomplete -- cue strength, not frame membership, would be the primary variable. Alternatively, if Gemini succeeds on a cross-frame bridge with sufficiently strong cues, the hypothesis would need revision toward a cue-strength threshold model rather than a categorical frame-crossing model.

### Gemini's Transitivity Tells the Same Story

The transitivity scores reinforce the frame-crossing interpretation:

| Triple | Gemini Transitivity | Next-Lowest Model |
|--------|--------------------|--------------------|
| bank-deposit-savings | 0.165 | GPT 0.121 |
| light-spectrum-color | 0.346 | GPT 0.185 |
| bank-river-ocean | 0.089 | Claude 0.135 |
| tree-forest-ecosystem | 0.080 | Grok 0.171 |
| emotion-nostalgia-melancholy | 0.011 | Claude 0.101 |

On triples where Gemini finds the bridge (deposit-savings, spectrum-color), its transitivity is competitive -- sometimes even the highest (0.346 on light-spectrum-color is second only to Claude's 0.400). On triples where it misses the bridge, its transitivity collapses to near-baseline levels (0.011 for emotion-nostalgia-melancholy is essentially indistinguishable from random). The bridge is not decorative; it is load-bearing. When Gemini routes through the bridge, its path composes properly. When it does not, its direct A-to-C path shares almost nothing with the component legs.

### Implications for the Isolation Index

The Phase 4A Gemini isolation index (0.136, 95% CI: [-0.092, 0.378]) failed to reach significance, but this is misleading. The confidence interval crosses zero because of the six-triple sample size and because Gemini agrees perfectly on two of the six triples (deposit-savings and spectrum-color), pulling its mean difference down. The isolation is real but *conditional*: Gemini is isolated specifically on frame-crossing bridges, not on within-frame bridges. A future analysis that separates within-frame and cross-frame triples would likely show a significant isolation effect for the cross-frame subset.

---

## 3. The "Metaphor" Surprise

### The Prediction

Language-metaphor-thought was designed as an abstract bridge chain. "Metaphor" is arguably the quintessential bridge between language and thought -- it is a linguistic device (firmly in the language domain) that structures cognition (firmly in the thought domain). Lakoff and Johnson's *Metaphors We Live By* built an entire research program on the claim that metaphor is the primary mechanism by which language shapes thought. If any abstract concept should serve as a navigational bridge, this one should.

The Phase 4 predictions reflected this confidence: Claude was predicted at [0.50, 1.00], GPT at [0.30, 1.00], Grok at [0.50, 1.00]. Only Gemini was predicted to fail ([0.00, 0.20]), consistent with its pattern of abstract bridge failure.

### The Result

Bridge frequency 0.00 across all four models. Not low. Zero. No model, on any of its 20 runs, produced "metaphor" as a waypoint on the path from "language" to "thought."

Yet the transitivity scores are not zero. Claude shows 0.437 -- the *highest* transitivity of any triple-model combination in Phase 4B. GPT shows 0.122, Grok 0.156, Gemini 0.100. These are not trivially small. The A-to-C paths share substantial waypoint overlap with the A-to-B and B-to-C legs, even though the bridge concept itself never appears.

### What This Means

This result makes a sharp distinction between three things that are easy to conflate:

1. **Association:** "Metaphor" is plausibly associated with both "language" and "thought" -- we would expect it to appear in free-association lists for both concepts, though this has not been directly measured in the benchmark. The assumed bidirectional association is based on semantic intuition, not empirical observation from our data.

2. **Bridge concept presence:** "Metaphor" never appears on the direct language-to-thought path. Despite its associations, it is not a waypoint that models select when navigating between these endpoints.

3. **Path compositionality:** The language-to-thought path *does* share substantial waypoints with the language-to-metaphor and metaphor-to-thought legs (transitivity 0.100 - 0.437). The paths compose in the sense that they traverse overlapping conceptual territory. But the specific concept "metaphor" is not the shared element -- other concepts are.

What is on the language-to-thought path? Based on the high transitivity, the shared waypoints are likely concepts like "communication," "meaning," "cognition," "expression," "understanding," "semantics" -- concepts that describe the *functional connection* between language and thought rather than a specific device. This is conjecture based on the transitivity scores (the raw waypoint lists for the language-to-thought AC leg have not been analyzed here for frequency distributions). If confirmed by waypoint frequency analysis, it would suggest that models navigate through general functions, not specific devices. "Metaphor" is a specific literary/cognitive device; "meaning" is the general function that language serves in relation to thought.

This is the same pattern we see with hot-energy-cold from Phase 3B. "Energy" is associated with both "hot" and "cold" but occupies a different conceptual axis (physics) from the temperature gradient (sensation). "Metaphor" is associated with both "language" and "thought" but occupies a different conceptual position (specific device) from the direct pathway (general function). In both cases, the associated concept is *adjacent* to the path but not *on* it.

### A Refinement of the Bridge Concept

The metaphor result, combined with the spectrum result, suggests a tighter definition of what makes a concept function as a navigational bridge. It is not enough to be associated with both endpoints. It is not even enough to be semantically "between" them in some intuitive sense. A concept functions as a bridge when it is the **necessary intermediate step** in the most natural decomposition of the endpoint relationship.

"Spectrum" is a bridge because the relationship between light and color *is* spectral decomposition. There is no more direct way to relate them.

"Metaphor" is not a bridge because the relationship between language and thought is not metaphorical in the first instance -- it is communicative, semantic, expressive. Metaphor is one *aspect* of the language-thought relationship, but not the primary axis of connection.

This distinction -- between concepts that name the primary axis of connection and concepts that name a secondary or derivative aspect -- may be the most precise characterization of bridge topology that the benchmark has produced.

---

## 4. Cross-Model Agreement Structure

### The Correlation Matrix

Phase 4A computed Pearson correlations of bridge frequency vectors across the six non-control triples:

| | Claude | GPT | Grok | Gemini |
|--------|--------|-----|------|--------|
| Claude | -- | 0.772 | 0.768 | 0.446 |
| GPT | 0.772 | -- | 0.667 | 0.679 |
| Grok | 0.768 | 0.667 | -- | 0.340 |
| Gemini | 0.446 | 0.679 | 0.340 | -- |

### Topology Families

The correlation matrix reveals a structure that is not simply "Gemini is different." There are two overlapping clusters:

**The Connected Navigators:** Claude, GPT, and Grok form a cluster with pairwise correlations between 0.667 and 0.772. These three models agree on bridge topology -- when one finds a bridge, the others usually do too, and their frequencies correlate positively. The Claude-GPT and Claude-Grok pairs are the tightest (r = 0.772 and 0.768), with GPT-Grok slightly looser (r = 0.667). Claude anchors this cluster.

**Gemini's Partial Alignment:** Gemini correlates moderately with GPT (r = 0.679) but weakly with Claude (r = 0.446) and very weakly with Grok (r = 0.340). The GPT-Gemini correlation is surprisingly high -- higher than GPT-Grok. This means GPT and Gemini share more bridge topology structure than Grok and Gemini do, even though GPT is more similar to Grok on other metrics (Phase 1 cross-model Jaccard: GPT-Grok 0.201 vs. GPT-Gemini 0.178).

Why does Gemini correlate better with GPT than with Grok? Look at the bridge frequency vectors (note: these correlations are computed over only 6 non-control triples, and two of those -- hot-energy-cold and beyonce-justice-erosion -- show universal zeros, which inflates correlations for pairs that both miss the same bridges; treat the clustering as exploratory):

| Triple | Claude | GPT | Grok | Gemini |
|--------|--------|-----|------|--------|
| animal-dog-poodle | 1.00 | 1.00 | 0.95 | 1.00 |
| emotion-nostalgia-melancholy | 0.10 | 0.10 | 0.90 | 0.00 |
| music-harmony-mathematics | 1.00 | 0.15 | 0.85 | 0.00 |
| hot-energy-cold | 0.00 | 0.00 | 0.00 | 0.00 |
| beyonce-justice-erosion | 0.00 | 0.00 | 0.00 | 0.00 |
| bank-river-ocean | 1.00 | 0.90 | 1.00 | 0.00 |

Grok's profile is distinctive: it finds bridges at high frequency on triples where other models are mixed (nostalgia at 0.90 vs. Claude/GPT at 0.10; harmony at 0.85 vs. GPT at 0.15). This makes Grok maximally different from Gemini (which shows 0.00 on those same triples) and only moderately aligned with GPT (which also shows low frequencies). GPT and Gemini, by contrast, agree on the triples where neither finds the bridge -- their correlation is boosted by shared zeros on hot-energy-cold, beyonce-justice-erosion, and by Gemini's partial agreement on the universally-high animal-dog-poodle triple.

### Binary Agreement Reveals the Real Structure

The binary agreement metric (do both models agree on whether a bridge is present or absent?) tells a cleaner story:

- Claude-GPT: 100% binary agreement
- Claude-Grok: 100%
- GPT-Grok: 100%
- Claude-Gemini: 50%
- GPT-Gemini: 50%
- Grok-Gemini: 50%

The non-Gemini models agree *perfectly* on the binary question of whether each bridge is present or absent. They may disagree on frequency (Claude finds harmony 100% vs. GPT's 15%), but they agree on presence vs. absence. Gemini disagrees with every other model on exactly half the triples -- the three where it shows 0% and others show > 0% (nostalgia, harmony, river).

This binary agreement pattern is the strongest evidence for two distinct topology families. Claude, GPT, and Grok share a qualitatively similar bridge topology: the same concepts serve as bridges, even if they are used at different rates. Gemini has a qualitatively different topology where three of the six bridges do not exist as navigational infrastructure at all.

### The Bridge-Path Correlation

The Phase 4A analysis found a Pearson r of -0.283 between bridge frequency difference and cross-model Jaccard across 36 (model-pair, triple) observations. This is a modest negative correlation: larger bridge frequency disagreements are associated with lower path similarity. The bridge-removed correlation (-0.217) is somewhat weaker, suggesting that roughly a quarter of the bridge-path correlation is mechanically driven by shared bridge tokens inflating Jaccard, while the remaining three-quarters reflects genuine topological alignment.

The -0.283 correlation is not large, but 36 observations with substantial variance in both variables is a limited sample. The correlation's sign is consistent with the hypothesis that bridge agreement is a *mechanism* behind cross-model path convergence, not merely a symptom. When two models route through the same bridge concept, their broader paths tend to share more waypoints -- not just the bridge term itself but the surrounding conceptual territory that the bridge activates.

---

## 5. Prediction Accuracy as Methodology Validation

### The Scorecard

Phase 4B pre-registered predictions for all 32 triple-model combinations. 26 of 32 (81.3%) were correct. The 6 misses:

| Triple | Model | Predicted | Observed | Miss Type |
|--------|-------|-----------|----------|-----------|
| emotion-nostalgia-melancholy | GPT | [0.30, 1.00] | 0.20 | Slight overshoot |
| emotion-nostalgia-melancholy | Grok | [0.80, 1.00] | 0.70 | Slight overshoot |
| language-metaphor-thought | Claude | [0.50, 1.00] | 0.00 | Categorical miss |
| language-metaphor-thought | GPT | [0.30, 1.00] | 0.00 | Categorical miss |
| language-metaphor-thought | Grok | [0.50, 1.00] | 0.00 | Categorical miss |
| tree-forest-ecosystem | Gemini | [0.40, 1.00] | 0.10 | Substantial miss |

### What the Hits Tell Us

The 26 correct predictions span every diagnostic type: polysemy retest, financial polysemy, cross-domain concrete, abstract retest, controls. The prediction framework -- using Phase 3 bridge frequencies as baselines and adjusting for model-specific fragmentation patterns -- successfully characterizes bridge topology for the large majority of novel triples.

Notably, the correct predictions include several non-trivial cases:
- Gemini at 0.00 on bank-river-ocean (replicated from Phase 3B with 20 reps -- stable, not sampling noise)
- Gemini at 0.00 on emotion-nostalgia-melancholy (replicated)
- Gemini at 1.00 on bank-deposit-savings (correctly predicted that financial-frame bridging would succeed)
- Gemini at 1.00 on light-spectrum-color (correctly predicted that concrete-mechanistic bridging would succeed)

The framework correctly predicted both Gemini's successes and its failures on previously untested triples, which is a strong validation that the topological characterization from Phases 1-3 captures genuine model properties rather than stimulus-specific artifacts.

### What the Misses Tell Us

The 6 misses fall into two categories, and the second is far more interesting than the first.

**Category 1: Slight overshoot on emotion-nostalgia-melancholy (2 misses).** GPT was predicted at [0.30, 1.00] and observed at 0.20; Grok was predicted at [0.80, 1.00] and observed at 0.70. Both are close to the prediction boundary. Phase 3B showed GPT and Grok at 0.10 and 0.90 respectively (with 10 reps); Phase 4B with 20 reps showed 0.20 and 0.70. The higher-rep estimates are more moderate in both cases, suggesting the Phase 3B values were somewhat extreme samples. These misses are informative about confidence interval calibration -- predictions based on 10-rep baselines should use wider intervals -- but they do not challenge the topological framework.

**Category 2: Universal metaphor failure (3 misses) + Gemini forest failure (1 miss).** These are genuine surprises that reveal limitations of the prediction framework. The metaphor failure (Section 3) shows that the framework cannot distinguish "associated with both endpoints" from "on the navigational path between them" when making predictions for novel bridges. The forest failure shows that the concrete/abstract distinction we used to predict Gemini's behavior is insufficient -- frame-crossing, not abstractness, is the relevant variable.

### 81.3% as a Benchmark

Is 81.3% good? The relevant comparison is against a naive baseline. A predictor that always guessed "bridge present" for non-Gemini models and "bridge absent" for Gemini would achieve approximately 62.5% accuracy (correctly predicting 20/32 cases: the 15 non-Gemini hits on non-metaphor triples, plus the 5 Gemini-absent cases, missing on 3 metaphor misses for non-Gemini models, 2 Gemini successes, and other boundary cases). Our 81.3% is substantially better than this naive model-identity baseline, indicating that the topological characterization adds predictive value beyond simply knowing which model is being tested.

A predictor that also accounted for triple type (using the within-frame/cross-frame distinction developed in Section 2) would have correctly predicted the metaphor failure and the forest-ecosystem Gemini failure, potentially reaching 30/32 (93.8%). This post-hoc estimate should be treated cautiously, but it suggests that Phase 4's findings materially improve the prediction framework for future phases.

---

## 6. Connections to Prior Phases

### Phase 1: Gaits Revisited

Phase 1 established that models have distinct navigational gaits -- characteristic consistency profiles measured by within-model Jaccard (Claude 0.578, Gemini 0.372, Grok 0.293, GPT 0.258). Phase 4 adds a new dimension: **bridge usage frequency** as a gait characteristic.

| Model | Phase 1 Consistency | Phase 4 Mean Bridge Freq | Interpretation |
|-------|--------------------|--------------------------|----|
| Grok | 0.293 (3rd) | 0.783 (highest) | Low run consistency, high bridge usage |
| Claude | 0.578 (1st) | 0.728 (2nd) | High run consistency, high bridge usage |
| GPT | 0.258 (4th) | 0.675 (3rd) | Low run consistency, moderate bridge usage |
| Gemini | 0.372 (2nd) | 0.350 (4th) | Moderate run consistency, low bridge usage |

The gait characterization is not a single axis. Grok and Claude share high bridge usage but differ dramatically in run-to-run consistency (0.293 vs. 0.578). This means Grok explores widely within a run but reliably hits the bridge concept, while Claude produces near-identical runs that also reliably hit the bridge. Gemini is moderate in consistency but systematically avoids bridges -- a qualitatively different navigational strategy, not just a noisier version of the same one.

### Phase 2: Asymmetry and the Bridge Bottleneck

Phase 2's starting-point hypothesis -- that models construct paths by greedy forward search from the starting concept -- predicted that semantic bridges reduce asymmetry by acting as bottlenecks that both directions must traverse. Phase 4 provides indirect support for this mechanism via transitivity as a proxy (reverse paths were not collected in Phase 4's forward-only design).

On triples where the bridge is universal (spectrum, deposit), we would expect both A-to-C and C-to-A paths to pass through the bridge concept, producing lower asymmetry. On triples where the bridge is absent (metaphor) or model-dependent (nostalgia, forest), asymmetry should be higher because the path through the open middle is unconstrained. This remains an untested prediction.

The Phase 4B transitivity scores serve as an indirect proxy: high transitivity implies the A-to-C path is well-aligned with the A-to-B and B-to-C legs, which constrains the navigational space and would reduce asymmetry. Claude's transitivity on light-spectrum-color (0.400) versus emotion-nostalgia-melancholy (0.101) is consistent with the bridge-as-bottleneck hypothesis: stronger bridges produce tighter compositional structure.

### Phase 3A: Dual Anchors and Bridge Position

Phase 3A revealed the dual-anchor effect: both starting and ending concepts exert gravitational pull on waypoint selection, producing a U-shaped convergence profile. Phase 4's bridge topology results suggest a refinement: **bridge concepts, when present, create a third anchor in the middle of the path**.

Consider a universal bridge like "spectrum" on light-to-color. If the dual-anchor model from Phase 3A applies, positions 1 and 5 are constrained by "light" and "color" respectively, with the middle positions free. But "spectrum" appearing at 100% frequency means one of the middle positions is also constrained -- by the bridge concept. This would flatten the U-shaped convergence profile for triples with strong bridges, converting the dual-anchor topology to a triple-anchor topology.

This is a testable prediction for Phase 5: collect reverse paths for bridge triples and compute positional convergence. If the triple-anchor hypothesis holds, bridge triples should show elevated convergence at position 3 (the middle) in addition to positions 1 and 5 -- a W-shape rather than a U-shape.

### Phase 3B: Triangle Inequality Stability

Phase 3B found the triangle inequality held in 91% of cases (29/32), with Gemini responsible for both substantial violations. Phase 4B extends this: the triangle inequality holds for 30 of 32 triple-model combinations in the new data (93.8%). The two violations are Claude on tree-forest-ecosystem and Grok on light-chandelier-color (a random-control triple) -- both boundary cases rather than dramatic failures. The Phase 3B rate (91%) and Phase 4B rate (93.8%) are consistent, suggesting that triangle inequality violations occur in roughly 5-10% of cases and are not concentrated in any single model or triple type in Phase 4 (unlike Phase 3B where Gemini accounted for both substantial violations).

This strengthens the quasimetric characterization. Conceptual space is asymmetric (Phase 2) but composable (Phases 3-4). Distances violate symmetry but respect the triangle inequality. The algebra of conceptual navigation is orderly even when the geometry is directional.

---

## 7. Temporal Stability

A methodological result worth highlighting: Phase 4B's temporal drift assessment found no drift on any leg for any model. Cross-batch Jaccard (comparing Phase 1/3B runs collected earlier against Phase 4B runs collected later) was within 0.05 of within-batch Jaccard for all tested legs. This is important for two reasons:

1. **Data pooling is valid.** Combining historical runs with top-up runs does not introduce bias. The models' navigational behavior on these pairs is stable across the collection period.

2. **The topology is not ephemeral.** Model APIs can change between data collection periods (version updates, infrastructure changes, etc.). The absence of drift suggests that the topological properties we measure -- gait, asymmetry, bridge usage -- are stable features of the models, not transient artifacts of a particular API snapshot. This is a prerequisite for treating the results as characterizing model *architecture* rather than model *moment*.

---

## 8. Open Questions for Phase 5

Phase 4's results open several research directions, ranked by expected information gain.

### 8a. Gemini Cue-Strength Threshold Investigation (Highest Priority)

The frame-crossing model of Gemini's fragmentation (Section 2) makes specific predictions: Gemini should succeed on bridges with high cue strength (tight within-frame association) and fail on bridges requiring frame transitions. This can be tested directly.

**Design:** Construct 8-10 triples that systematically vary cue strength between adjacent concepts while holding other properties constant. For example, vary the specificity of the bridge concept: "animal - dog - poodle" (high cue strength at each link) vs. "animal - vertebrate - poodle" (lower cue strength at the first link, since "vertebrate" is more technical and less immediately cued by "animal"). Measure whether there is a cue-strength threshold below which Gemini's bridge frequency drops to zero.

**Expected yield:** A quantitative characterization of Gemini's fragmentation boundary, potentially generalizable to other models at different thresholds. If the cue-strength hypothesis is correct, all models should show decreasing bridge frequency as cue strength decreases, with Gemini's threshold being higher than the others'.

### 8b. Dimensionality Probing (High Priority)

The metaphor-surprise and the hot-energy-cold result both demonstrate that conceptual space has more than one dimension: concepts can be associated with both endpoints but occupy a different axis. How many axes are there, and can we identify them?

**Design:** Select a focal concept with multiple associated dimensions -- "light" is ideal (brightness/intensity, weight/heaviness, divinity/enlightenment, knowledge/understanding, electromagnetic radiation). Construct triples that traverse each dimension separately. Measure whether cross-dimension paths show zero bridge frequency (fully independent dimensions) or partial bridge frequency (correlated dimensions). The number of independent dimensions accessible from a single focal concept gives a lower bound on the local dimensionality of conceptual space.

**Expected yield:** The first empirical estimate of conceptual space dimensionality, per model. If Claude's dense topology produces higher dimensionality estimates than Gemini's fragmented topology, this would connect bridge fragmentation to a fundamental geometric property.

### 8c. The Triple-Anchor Convergence Test (Medium-High Priority)

Phase 3A's U-shaped convergence profile was measured for generic concept pairs. Phase 4 predicts that pairs with strong bridge concepts should show a modified convergence profile -- elevated convergence at bridge positions, not just endpoints.

**Design:** Collect 10-waypoint forward and reverse paths for 4-6 triples where the bridge is universal (spectrum, deposit, dog) and 4-6 where it is absent (metaphor, energy, chandelier). Compare positional convergence profiles. If the bridge creates a third anchor, the profile for bridge-present triples should show a W-shape (three peaks) while bridge-absent triples show the standard U-shape (two peaks).

**Expected yield:** Direct evidence for or against the bridge-as-anchor hypothesis, connecting Phase 3A's positional analysis to Phase 4's bridge topology.

### 8d. Chain Length Scaling (Medium Priority)

Phase 3-4 tested triples (3-concept chains). Does bridge composition scale to longer chains? For a 4-concept chain A-B-C-D, does the path from A to D pass through B and C? If compositionality is genuine, bridge frequency should remain high at each link. If it degrades, the degradation rate characterizes the "reach" of compositional structure.

**Design:** Extend animal-dog-poodle to animal-mammal-dog-poodle (4 steps) and tree-forest-biome-ecosystem (4 steps). Measure bridge frequency at each intermediate point. Plot cumulative bridge survival (fraction of A-to-D paths that hit all intermediates) as a function of chain length.

**Expected yield:** A scaling law for compositional navigation. If bridge frequency degrades exponentially with chain length, the decay constant characterizes the "compositional horizon" of each model's topology.

### 8e. Higher-Resolution Convergence (Medium Priority)

Phase 3A used 5-waypoint paths, giving only 5 positions for convergence analysis. The U-shape was suggestive but coarsely sampled. With 10 waypoints, finer structure in the convergence profile might emerge.

**Design:** Collect 10-waypoint forward and reverse paths for 10 concept pairs spanning multiple categories. Compute per-position mirror-match rates at 10 positions. Test whether the dual-anchor effect is confined to the first and last 1-2 positions or extends deeper.

### 8f. Paper Preparation (Parallel Track)

The benchmark now has four phases of data with internally consistent findings, validated controls, and a geometric framework (quasimetric space with model-dependent bridge topology) that organizes the results. The findings are sufficient for a research paper structured around three core claims: (1) LLM conceptual navigation has measurable geometric structure (quasimetric, compositional, dual-anchored); (2) this structure is model-specific (gaits, bridge profiles, fragmentation patterns); and (3) the structure is predictive (81.3% accuracy on novel bridge predictions). Phases 5 and paper writing can proceed in parallel -- additional experiments strengthen the claims but are not prerequisites for the paper.

---

## 9. Summary of Key Findings

1. **Bridge concepts are navigational infrastructure, not just associations.** "Spectrum" bridges light and color for all models (1.00 frequency) because it names the mechanism. "Metaphor" fails to bridge language and thought (0.00 frequency for all models) despite strong bidirectional association, because it names a specific device rather than the primary axis of connection.

2. **Gemini's fragmentation is real, stable, and characterized by a frame-crossing boundary.** Gemini succeeds on within-frame bridges (deposit-savings 1.00, spectrum-color 1.00) and fails on cross-frame bridges (river-ocean 0.00, forest-ecosystem 0.10, nostalgia-melancholy 0.00). The boundary is not concrete vs. abstract -- it is whether the bridge requires crossing between tightly coupled conceptual clusters.

3. **Three models share a qualitatively similar bridge topology.** Claude, GPT, and Grok show 100% binary bridge agreement -- they agree on which concepts serve as bridges, even when they disagree on frequency. Gemini disagrees on 50% of bridges, forming a distinct topology family.

4. **The Claude-GPT alignment is the strongest pairwise topology correlation.** At r = 0.772, Claude and GPT share more bridge topology structure than any other pair. Grok-Gemini at r = 0.340 is the weakest. The model-pair correlation matrix is not simply "Gemini vs. everyone" -- there is internal structure within the connected-navigator cluster.

5. **Prediction accuracy of 81.3% validates the topological framework.** The benchmark's characterization of model topology from Phases 1-3 successfully predicted novel bridge behavior for 26 of 32 cases. The 6 misses are informative: they reveal the limits of the concrete/abstract distinction (Gemini on forest-ecosystem) and the difference between association and navigation (all models on metaphor).

6. **The "metaphor" surprise sharpens the definition of bridge concepts.** A bridge must name the *primary axis of connection* between endpoints, not merely be associated with both. This distinguishes causal-mechanistic bridges (spectrum, deposit) from derivative-associative concepts (metaphor, energy) that are proximate to the path but not on it.

7. **No temporal drift detected.** Cross-batch consistency validates data pooling across phases and confirms that topological properties are stable model features.

8. **The triangle inequality continues to hold.** Phase 4B's results reinforce the quasimetric characterization: conceptual space is asymmetric but composable, with bridge concepts serving as the compositional joints.
