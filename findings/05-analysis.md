# Phase 5 Analysis: Cue Gradients, Semantic Dimensions, and the Limits of Geometric Prediction

> Interpretive analysis of Phase 5: cue-strength gradients (5A), dimensionality probing (5B), and triple-anchor convergence (5C).
>
> 2,040 new runs + 200 reused (5A), 1,040 new runs (5B), 640 new runs (5C) = 3,720 new API runs + 200 reused, across 4 models, 36 diagnostic triples, 8 convergence pairs.
>
> March 2026

## Executive Summary

**Phase 5 is the humbling phase.** Prediction accuracy drops from 81.3% in Phase 4 to 64.6% in 5A and 42.9% in 5B -- the worst in the benchmark's history -- and the headline pre-registered test in 5B fails outright, with cross-axis bridge frequency *higher* than same-axis. The Gemini frame-crossing hypothesis from Phase 4, which seemed to cleanly explain Gemini's fragmentation boundary, is not supported by the cue-strength threshold data: Gemini's threshold (1.79) is not significantly different from other models' (mean 2.05, CI [-1.00, 1.07]). The aggregate W-shape prediction from 5C fails to reach significance. Phase 5 delivered exactly two of its four pre-registered headline predictions. This is not a crisis for the benchmark -- it is the benchmark working as intended. The failures are more informative than the successes, and they point toward a substantially revised understanding of how polysemy, navigational salience, and bridge topology actually operate.

The findings that survive scrutiny are these: (1) bridge frequency does decrease monotonically with cue strength for 12 of 16 family/model combinations, establishing that the gradient exists even if it is noisier than expected; (2) the biological-growth family reveals that our intuitive cue-strength ratings are wrong -- "germination" outperforms "plant" as a bridge from seed to garden, which is a finding about navigational salience, not cue strength; (3) the loan-bank-shore result in 5B demolishes the simple dimensional independence model of polysemy and replaces it with something far more interesting; (4) Claude's 0.52 W-shape contrast on music-to-mathematics in 5C provides the single strongest piece of evidence yet that bridge concepts create navigational anchors in the middle of paths; and (5) "fire" is nearly dead as a bridge concept -- it fails in all but one configuration (GPT shows 0.15 on spark-fire-ash), establishing the first clear case of a concept that is navigable *to* but almost never *through*.

---

## 1. The Cue-Strength Gradient: Real but Ragged

### What We Predicted

Phase 4's frame-crossing hypothesis proposed that Gemini succeeds on bridges with high associative cue strength and fails on bridges requiring integration across loosely coupled conceptual domains. The natural test: construct families of triples where the bridge concept varies in cue strength while the endpoints remain fixed. If cue strength is the controlling variable, bridge frequency should decrease monotonically as cue strength decreases, and Gemini's threshold should be measurably higher than other models'.

### What We Got

The monotonicity prediction holds reasonably well: 12 of 16 family/model combinations show monotonic decrease in bridge frequency from the highest to lowest cue level. All 4 failures are in the biological-growth family (seed-B-garden), which is an anomalous family for reasons discussed in Section 2. For the three well-behaved families -- physical-causation, compositional-hierarchy, and abstract-affect -- the gradient is perfect: every model shows monotonic decline.

| Family | Bridge (high) | Bridge (medium) | Bridge (low) | Pattern |
|--------|--------------|----------------|-------------|---------|
| Physical-causation | heat: 0.90-1.00 | radiation: 0.00-0.80 | solstice: 0.00 | Monotonic (all 4) |
| Biological-growth | plant: 0.00-0.65 | germination: 0.15-1.00 | husk: 0.00 | **Inverted** (all 4) |
| Compositional-hierarchy | sentence: 1.00 | clause: 0.90-1.00 | syllable: 0.00 | Monotonic (all 4) |
| Abstract-affect | sadness: 0.97-1.00 | nostalgia: 0.00-0.80 | apathy: 0.00 | Monotonic (all 4) |

The gradient exists. Bridge concepts with higher cue strength are more likely to appear on direct A-to-C paths. This is unsurprising but important to establish empirically: the bridge concept is not randomly selected from the set of concepts associated with both endpoints. There is a selection pressure that favors concepts with stronger navigational pull.

### The Threshold Is Universal, Not Gemini-Specific

The logistic fit reveals that all four models have similar thresholds:

| Model | Threshold | Steepness | R-squared |
|-------|-----------|-----------|-----------|
| Claude | 2.02 | 2.06 | 0.323 |
| GPT | 1.96 | 2.17 | 0.640 |
| Grok | 2.16 | 1.97 | 0.311 |
| Gemini | 1.79 | 2.22 | 0.370 |

Gemini's threshold of 1.79 is the lowest, not the highest. The 95% CI on the difference ([-1.00, 1.07]) comfortably includes zero. **The Phase 4 frame-crossing hypothesis, in its cue-strength-threshold form, is not supported.** Gemini's fragmentation boundary is not explained by a higher activation threshold for bridge concepts.

This is an important negative result. It means Gemini's bridge failures (river-ocean 0.00, forest-ecosystem 0.10) cannot be attributed to generally weaker cue sensitivity. Gemini responds to cue strength at approximately the same threshold as other models. Its failures must be driven by something else -- sense resolution, domain connectivity, or frame structure -- that the cue-strength gradient does not capture.

The R-squared values deserve comment. They range from 0.311 (Grok) to 0.640 (GPT). A logistic fit explaining only 31-64% of variance means that cue strength, while a real predictor, is far from the only variable controlling bridge frequency. The residual variance is large, and much of it is driven by the biological-growth anomaly and by the sharp nonlinearity in the data (many bridge frequencies are either 0.00 or 1.00, with few intermediate values). Bridge selection appears to be closer to a threshold phenomenon than a smooth gradient -- you are either on the path or you are not, with a narrow transition zone.

---

## 2. The Germination Surprise: Navigational Salience Is Not Intuitive Cue Strength

### The Anomaly

The biological-growth family (seed-B-garden) was designed with three cue levels: "plant" (very high), "germination" (medium), and "husk" (low). The prediction was straightforward: "plant" should bridge seed and garden at near-100% frequency because it is the most obvious intermediate concept in the growth sequence.

The result is the opposite:

| Bridge | Cue Rating | Claude | GPT | Grok | Gemini |
|--------|-----------|--------|-----|------|--------|
| plant | very-high (4) | 0.00 | 0.65 | 0.00 | 0.00 |
| germination | medium (2) | 1.00 | 0.95 | 0.15 | 1.00 |
| husk | low (1) | 0.00 | 0.00 | 0.00 | 0.00 |

"Germination" outperforms "plant" in all 4 models: Claude routes through "germination" 100% of the time but through "plant" 0%; GPT shows germination 0.95 vs. plant 0.65; Grok shows germination 0.15 vs. plant 0.00; Gemini shows germination 1.00 vs. plant 0.00. This is a complete inversion of the predicted gradient.

### Why "Germination" Wins

The explanation lies in the distinction between *associative strength* (how strongly A cues B in isolation) and *navigational salience* (how strongly B functions as a waypoint between A and C specifically). "Plant" is strongly associated with both "seed" and "garden" in isolation -- it is the prototypical product of a seed and the prototypical inhabitant of a garden. But "plant" is also a *neighbor* of both endpoints rather than a *waypoint between* them. If you are already at "seed" and heading toward "garden," saying "plant" does not move you forward -- it names the thing you are already talking about. "Plant" is too close to the A-C axis itself to serve as a distinct navigational step.

"Germination," by contrast, names the *process* that connects seed to garden. It is the mechanism, the transformation, the verb that turns the starting state into the ending state. This is exactly the pattern we identified in Phase 4 with "spectrum" (the mechanism connecting light to color) and "deposit" (the operation connecting bank to savings). Bridge concepts that name *processes* or *mechanisms* outperform those that name *objects* or *categories*, even when the object is more strongly associated with the endpoints in raw associative terms.

This reframes the cue-strength hypothesis entirely. What matters is not the generic association between bridge and endpoints but the *navigational specificity* -- whether the bridge concept adds directional information that moves the path forward. "Germination" tells you where you are going (from dormant seed toward growing garden). "Plant" tells you what you are already near.

### The GPT Exception

GPT is the only model that gives "plant" substantial bridge frequency (0.65). This is consistent with GPT's Phase 1 profile as the least consistent navigator (Jaccard 0.258) -- it explores more widely and sometimes takes the "obvious" associative route rather than the navigationally optimal one. Even for GPT, "germination" (0.95) outperforms "plant" (0.65), but the gap is narrower. GPT's navigational strategy is noisier, finding bridges by breadth rather than by precision.

### Implications for Cue-Strength Methodology

The germination result exposes a methodological limitation: our cue-strength ratings were assigned by intuition (what a human would judge as the strongest association), not by empirical measurement of navigational salience in LLM outputs. The ratings were wrong for the biological-growth family, and they may be wrong for other families in ways that the monotonic gradient happened to mask. Future experiments should either (a) calibrate cue-strength ratings empirically using pilot runs or (b) abandon ordinal ratings entirely in favor of continuous bridge-frequency measurements that let the data reveal the ordering.

---

## 3. Polysemy Is Not Dimensional Independence

### The Pre-Registered Test

Phase 5B was designed to test whether polysemous concepts create independent semantic dimensions. The prediction: if "light" has a physics axis (photon-light-color) and a weight axis (feather-light-heavy), then cross-axis triples (photon-light-heavy) should show lower bridge frequency than same-axis triples, because the bridge concept must transit between unrelated senses. Same-axis mean should exceed cross-axis mean by at least 0.40.

### The Result: Opposite of Predicted

Same-axis mean bridge frequency is 0.220. Cross-axis mean is 0.291. The delta is -0.071 -- negative, not positive. The confidence interval ([-0.313, 0.159]) includes zero, but the direction is wrong. Cross-axis bridge frequency is *higher* than same-axis.

This is the worst prediction failure in the benchmark's history (42.9% accuracy overall in 5B), and it deserves careful analysis rather than dismissal.

### The Loan-Bank-Shore Result

The single most informative result in Phase 5B is the cross-axis triple loan-bank-shore:

| Triple | Type | Claude | GPT | Grok | Gemini |
|--------|------|--------|-----|------|--------|
| loan-bank-savings | same-axis (financial) | 0.00 | 0.00 | 0.65 | 0.00 |
| river-bank-shore | same-axis (geographic) | 0.90 | 0.00 | 0.90 | 0.00 |
| loan-bank-shore | **cross-axis** | **1.00** | **0.95** | **0.95** | 0.05 |

The cross-axis triple (loan-bank-shore) shows *higher* bridge frequency than either same-axis triple for three of four models. Claude, GPT, and Grok route through "bank" nearly 100% of the time when navigating from "loan" to "shore" -- a path that requires crossing from the financial sense to the geographic sense of "bank."

Why? Because "bank" is the *only* connection between "loan" and "shore." When A and C share no semantic territory except through the polysemous bridge B, that bridge becomes obligatory. There is no route from loan to shore that does not pass through something bank-related. The bottleneck is total.

Contrast this with the same-axis triples. Loan-bank-savings stays within the financial domain, and there are many financial concepts that connect loans and savings without requiring "bank" as a waypoint (interest, account, deposit, credit, investment). River-bank-shore stays within the geographic domain, and there are geographic concepts connecting rivers to shores without routing through "bank" (water, coast, edge, tributary, estuary). Same-axis paths have *alternatives*; the cross-axis path does not.

This completely inverts the dimensional independence model. Polysemy does not create walls between senses -- it creates *forced crossing points*. When a polysemous concept is the only semantic bridge between two otherwise unconnected domains, it becomes the most reliable bridge in the entire system. The cross-axis path is not harder; it is *more constrained*, and constraint produces reliability.

### Sensitivity: The Aggregate Is Bank-Driven

A critical caveat: the aggregate cross-axis > same-axis result is almost entirely driven by the loan-bank-shore triple. Per-focal-concept deltas tell a more nuanced story: "light" shows same-axis > cross-axis (delta +0.083), "bank" shows the massive cross-axis advantage (delta -0.431), and "fire" is near-zero on both axes (delta +0.019). Removing bank from the aggregate would likely flip the sign of the overall delta. The forced-crossing mechanism is real for bank, but it should not be generalized to all polysemous concepts without further evidence. "Light" shows no forced-crossing advantage, likely because photon-light-heavy has alternative routes that bypass "light" as a bridge (e.g., physics → mass → weight), whereas loan-to-shore has no alternative that avoids "bank."

### Gemini's Cross-Axis Behavior Revisited

Gemini shows 0.05 on loan-bank-shore versus 0.00 for the same-axis financial path and 0.00 for the same-axis geographic path. This is the only model that does not show the cross-axis advantage, and it is consistent with Gemini's established fragmentation: if the two senses of "bank" are not connected in Gemini's topology, the forced crossing point does not exist. For Gemini, the cross-axis path really is blocked -- not because of dimensional independence but because of topological disconnection.

This distinction matters. Dimensional independence (the senses are separate axes in a shared space) would predict low but non-zero cross-axis bridge frequency. Topological disconnection (the senses are in separate spaces entirely) predicts near-zero. Gemini's 0.05 is consistent with disconnection; the other models' 0.95-1.00 is consistent with a single connected space where polysemy creates obligatory crossings.

### Why Same-Axis Bridge Frequencies Are Low

The same-axis results are surprisingly poor. Loan-bank-savings shows 0.00 for Claude, GPT, and Gemini; only Grok routes through "bank" (0.65). Photon-light-color shows 0.00-0.45. Candle-light-darkness shows 0.00-0.70. These are all same-axis triples where "light" or "bank" should be an obvious intermediate.

The explanation is the same as the germination finding: same-axis paths have alternatives. Photon-to-color can go through "spectrum," "wavelength," "frequency," "prism" -- all of which are more specific and navigationally informative than the generic "light." The bridge concept is competing with more precise alternatives, and the more precise concept wins. The polysemous term is too broad to be the preferred waypoint when you are already within its dominant sense.

### Candle-Light-Color: The Partial-Overlap Triumph

The partial-overlap triple candle-light-color was predicted to show intermediate bridge frequency (0.20-0.60), on the theory that "candle" activates the illumination sense of "light" and "color" draws on the spectral sense, creating partial but incomplete dimensional overlap. All four models scored 0.95-1.00. The prediction was wrong by a factor of two.

Why? "Candle" and "color" are connected through "light" in a way that does not require sense-switching at all. A candle produces light; light has color (candlelight is warm-toned). The illumination sense and the spectral sense are not independent dimensions -- they are aspects of the same physical phenomenon. What we labeled "partial overlap" is actually "same underlying physics," and models correctly route through "light" as the unifying concept.

This is a useful corrective. Our dimensional axis assignments (physics, weight, illumination) were based on lexicographic sense distinctions, but models do not navigate by dictionary definitions. They navigate by conceptual proximity, and the physics of electromagnetic radiation unifies what the dictionary separates into distinct senses.

---

## 4. Fire Is (Nearly) Dead

### The Pattern

"Fire" was included in 5B as a non-polysemous control -- a concept expected to bridge reliably within its primary axis (combustion: spark-fire-ash) and potentially across to its metaphorical axis (passion: ambition-fire-motivation).

| Triple | Type | Claude | GPT | Grok | Gemini |
|--------|------|--------|-----|------|--------|
| spark-fire-ash | same-axis | 0.00 | 0.15 | 0.00 | 0.00 |
| ambition-fire-motivation | same-axis (metaphorical) | 0.00 | 0.00 | 0.00 | 0.00 |
| spark-fire-motivation | cross-axis | 0.00 | 0.00 | 0.00 | 0.00 |

Nearly every cell is 0.00, with the sole exception of GPT showing 0.15 on spark-fire-ash. "Fire" is effectively not a navigational bridge. It almost never routes spark to ash. It does not route ambition to motivation. It does not route anything to anything with reliability.

### Why Fire Fails

Compare fire to the successful bridges: "light" routes candle to color (0.95-1.00), "bank" routes loan to shore (0.95-1.00), "spectrum" routes light to color (1.00), "germination" routes seed to garden (0.15-1.00). What do these have in common that fire lacks?

The successful bridges occupy a *mediating position* in the conceptual chain. "Light" is the medium through which candle produces color. "Bank" is the institution through which loans connect to financial products. "Germination" is the process through which seeds become gardens. Each bridge names something that *transforms* the starting concept into the ending concept.

"Fire" does not mediate between spark and ash in the same way. Spark *causes* fire and fire *produces* ash, but models apparently navigate from spark to ash without needing to explicitly route through fire -- the causal chain is so tight that spark and ash are directly connected. This is the opposite of the loan-bank-shore situation: instead of being the *only* connection, fire is a *redundant* connection. Spark already implies fire; ash already implies fire. Naming fire explicitly adds no navigational information.

This is a new category of bridge failure distinct from the Phase 4 taxonomy. "Metaphor" failed because it was a secondary aspect rather than the primary axis of connection (language-to-thought goes through communication, not metaphor). "Fire" fails because it is *too central* -- so implied by both endpoints that it is skipped over rather than routed through. The bridge concept is load-bearing only when it adds information; when it is already implied, the model treats it as unnecessary.

### Fire vs. Light: A Direct Comparison

"Light" and "fire" are both physical phenomena with metaphorical extensions. Both are monosyllabic, high-frequency English words. Both have clear same-axis triples (candle-light-darkness, spark-fire-ash). Yet "light" functions as a bridge (variably, 0.00-1.00 depending on the triple and model) while "fire" categorically does not (0.00-0.15).

The difference: "light" is polysemous in a way that creates dimensional structure. It has genuinely distinct senses (electromagnetic radiation, low weight, spiritual illumination) that models can navigate between. "Fire" has metaphorical extension (passion, motivation) but not genuine polysemy -- the metaphorical uses are transparently derived from the physical sense and do not create independent navigational axes. Models can route *through* "light" because it sits at the intersection of multiple semantic pathways. They cannot route through "fire" because it occupies a single, tightly clustered region with no branching.

---

## 5. The W-Shape: Dead in Aggregate, Alive in Individuals

### The Aggregate Failure

Phase 5C tested the triple-anchor convergence hypothesis from Phase 4: if bridge concepts create a third navigational anchor in the middle of paths, then 7-waypoint bidirectional paths should show a W-shape (elevated convergence at positions 1, 4, and 7) rather than the U-shape found in Phase 3A.

The aggregate result is null. Bridge-present pairs show mean W-shape contrast of 0.0027 (CI [-0.0787, 0.0797]). Bridge-absent pairs show 0.0050 (CI [-0.0387, 0.0425]). The difference is -0.0023 (CI [-0.0983, 0.0887]). No signal.

### Why the Aggregate Fails

The aggregate is destroyed by two forces: variance and heterogeneity. Individual pair/model combinations range from -0.46 (Gemini on bank-savings) to +0.52 (Claude on music-mathematics). Averaging across this range produces near-zero. The W-shape is not a universal property of bridge-present paths; it is a property of *specific* model/pair combinations where the bridge is both present and uniquely constraining.

The tree-ecosystem pair is instructive. This pair has a strong bridge (forest) for three models but shows near-zero W-shape contrast for all four (Claude 0.000, GPT -0.015, Grok 0.000, Gemini -0.005). The bridge is present but does not produce a convergence peak at the midpoint. Why? Because "forest" may not occupy a fixed position in the 7-waypoint path -- it may appear at position 2 or 3 or 5 depending on the run, smearing the positional convergence signal. The W-shape test assumes the bridge creates a convergence peak at position 4 (the midpoint); if the bridge appears at varying positions, the peak is diluted.

### The Music-Mathematics Natural Experiment

The music-mathematics pair provides the strongest individual signal and a natural experiment. From Phase 3B, Claude and Grok route through "harmony" (100% and 80% respectively), while GPT and Gemini do not. If the W-shape is caused by bridge concepts, models with the bridge should show higher W-shape contrast than models without.

| Model | Has Bridge | W-Shape Contrast | P4 Value |
|-------|-----------|-----------------|----------|
| Claude | Yes (harmony 100%) | **0.5200** | 0.600 |
| Grok | Yes (harmony 80%) | -0.0450 | 0.100 |
| GPT | No | 0.0800 | 0.120 |
| Gemini | No | 0.0550 | 0.060 |

Bridge-present mean: 0.2375. Bridge-absent mean: 0.0675. Difference: 0.1700. The direction is correct, and the magnitude is substantial, though with only 2 models per group the statistics are necessarily weak.

Claude's 0.52 is the standout. Position 4 shows 0.600 mirror-match rate -- meaning 60% of forward-path waypoint-4 entries match the corresponding reverse-path entry. This is an enormous convergence peak, far exceeding any positional convergence rate observed in Phase 3A (where the maximum was ~0.34 for antonyms at position 5). Claude's music-to-mathematics path and its mathematics-to-music path both pass through the same concept at the same structural position. That concept is almost certainly "harmony."

But Grok complicates the story. Grok also routes through "harmony" 80% of the time, yet shows -0.045 W-shape contrast. Grok finds the bridge but not at a fixed position, or finds different harmonics of the bridge (different related concepts like "rhythm," "pattern," "ratio" at position 4). The W-shape requires both bridge presence *and* bridge positional stability, and only Claude's rigid navigational gait (Phase 1 Jaccard 0.578, highest of all models) produces both.

### Claude's Light-Color Signal

Claude also shows 0.35 W-shape contrast on light-color (P4 = 0.500). This is the second-strongest individual signal. From Phase 4, we know Claude routes light-to-color through "spectrum" at 100% frequency. The W-shape on this pair confirms that "spectrum" (or a closely related concept) occupies a fixed middle position in Claude's bidirectional paths.

### The Gemini Bank-Savings Anomaly

Gemini shows -0.460 on bank-savings, with a massive P3 spike (0.900). This means 90% of Gemini's forward-path and reverse-path entries match at position 3 -- not the midpoint (position 4) but one position earlier. This is not a W-shape; it is a displaced anchor. Gemini's bank-to-savings path has a powerful convergence point, but it is not where the W-shape test looks for it. The bridge concept (or whatever concept creates this convergence) occupies position 3, not position 4.

This suggests the W-shape test's assumption of midpoint bridging is too rigid. Bridge concepts may anchor at different positions depending on the path length, the model, and the specific semantic distance between endpoints. A more flexible test would scan all positions for convergence peaks rather than pre-specifying position 4.

### The Revised Triple-Anchor Hypothesis

The Phase 5C data does not confirm the triple-anchor hypothesis in its original aggregate form. But it does confirm a restricted version: **for models with rigid navigational gaits (Claude) and bridge concepts with fixed positional placement, the bridge creates a genuine third convergence anchor that is visible as elevated positional mirror-matching.** The effect is real but model-dependent and position-variable, making it invisible in aggregate statistics.

---

## 6. Prediction Accuracy: An Honest Assessment

### The Scorecard Across Phases

| Phase | Accuracy | Best Prediction | Worst Prediction |
|-------|----------|----------------|-----------------|
| Phase 4B | 81.3% (26/32) | Universal bridges (spectrum, deposit) | Universal metaphor failure |
| Phase 5A | 64.6% (31/48) | Low-cue controls (solstice, husk, apathy) | Germination inversion |
| Phase 5B | 42.9% (24/56) | Cross-axis zeros (prayer-light-darkness) | Loan-bank-shore at 1.00 |

The decline is real and diagnostic. Phase 4 predictions were based on 3 phases of accumulated data about bridge topology. Phase 5A predictions attempted to extend that understanding to cue-strength gradients -- a new dimension -- and suffered from miscalibrated intuitive ratings. Phase 5B predictions attempted to reason about dimensional structure from first principles (same-axis should exceed cross-axis), and the first principles were wrong.

The lesson: topological characterization from prior phases predicts *which models will find bridges* reasonably well (Gemini's failures, universal successes on tight chains). It does not predict *which specific concepts will function as bridges* in novel configurations, because navigational salience is not intuitive and polysemy does not create dimensional independence.

### What the Predictions Got Right

The correct predictions cluster in two categories:

1. **Low-cue and control triples** (all models at 0.00): solstice, husk, apathy, syllable, umbrella, telescope, prayer-light-darkness, spark-fire-motivation, bicycle, penguin. When the bridge concept is semantically distant from the A-C pathway, no model routes through it. This is consistent across 5 phases and is the most robust finding in the benchmark.

2. **High-cue universal bridges** (all models at ~1.00): heat, sentence, sadness. When the bridge concept names the obvious causal or compositional intermediate, all models find it. This too is stable across phases.

The prediction framework succeeds at the extremes and fails in the middle -- exactly where the interesting bridge topology lives.

### What the Predictions Got Wrong

The failures cluster around three misconceptions:

1. **Intuitive cue strength does not equal navigational salience.** "Plant" was rated very-high but observed at 0.00-0.65. "Germination" was rated medium but observed at 0.15-1.00. "Clause" was rated medium but observed at 0.90-1.00. "Radiation" was rated medium but observed at 0.00 (except Gemini 0.80). The human intuition about which concept is "most related" to the endpoints does not align with which concept models actually route through.

2. **Cross-axis does not mean cross-barrier.** Loan-bank-shore was predicted at [0.00, 0.20] for all non-Gemini models and observed at 0.95-1.00. The prediction assumed that crossing between bank senses would reduce bridge frequency; the data shows it increases bridge frequency by eliminating alternatives.

3. **Same-axis does not guarantee routing.** Loan-bank-savings, photon-light-color, spark-fire-ash were all predicted at [0.60, 1.00] for non-Gemini models and observed well below. Same-axis paths have too many alternatives for the focal concept to be the preferred waypoint.

---

## 7. Connections to Prior Phases

### The Bridge Concept Taxonomy, Revised

Phases 3-5 have now produced enough bridge successes and failures to propose a revised taxonomy. The Phase 4 hierarchy (causal-mechanistic > within-frame sequential > polysemy-mediated > concrete hierarchical > abstract affective > abstract functional) needs updating:

| Bridge Type | Example | Frequency Range | Mechanism |
|-------------|---------|----------------|-----------|
| Process-naming | germination (seed-garden), spectrum (light-color) | 0.15-1.00 | Bridge names the transformation |
| Forced crossing | bank (loan-shore) | 0.95-1.00 (non-Gemini) | Bridge is only connection between domains |
| Within-frame sequential | deposit (bank-savings), sentence (word-paragraph) | 0.90-1.00 | Tight cue chain, no alternatives |
| Concrete hierarchical | forest (tree-ecosystem), dog (animal-poodle) | 0.00-1.00 (model-dependent) | Part-whole with scale transition |
| Abstract affective | nostalgia (emotion-melancholy) | 0.00-0.80 (model-dependent) | Loose cue structure, many alternatives |
| Too-central | fire (spark-ash), plant (seed-garden) | 0.00-0.65 | Bridge implied by endpoints, skipped |
| Off-axis | metaphor (language-thought), energy (hot-cold) | 0.00 | Bridge on wrong conceptual dimension |

The new entries -- "forced crossing" and "too-central" -- come directly from Phase 5. Forced crossings are the most surprising: polysemous concepts at the junction of otherwise disconnected domains produce the *highest* bridge frequencies in the benchmark. Too-central concepts are the complement: concepts so tightly integrated with the endpoints that models skip over them, treating them as noise rather than navigation.

### Phase 1 Gaits and Phase 5 Predictions

The gait characterization from Phase 1 continues to predict Phase 5 behavior with remarkable precision:

- **Claude (Jaccard 0.578, most rigid):** Shows the strongest W-shape signals (0.52 on music-mathematics, 0.35 on light-color) because its positional stability lets the bridge anchor emerge clearly. Shows binary bridge behavior (mostly 0.00 or 1.00, rarely intermediate) because its rigid paths either find the bridge or do not, with little run-to-run variation.

- **Grok (Jaccard 0.293, variable):** Shows the highest same-axis bridge frequency for bank (0.65 on loan-bank-savings, 0.90 on river-bank-shore) but negative W-shape contrast on music-mathematics despite having the bridge. Grok explores widely enough to find bridges from many angles, but its positional instability prevents the bridge from anchoring at a fixed midpoint.

- **GPT (Jaccard 0.258, most variable):** Shows intermediate bridge frequencies across the board. The only model to give "plant" substantial bridge frequency (0.65), consistent with its exploratory style that sometimes takes the "obvious" route.

- **Gemini (Jaccard 0.372, fragmented):** Shows the Gemini-specific pattern in every sub-experiment: succeeds on tight within-frame chains (sentence 1.00, sadness 1.00, germination 1.00), fails on same-axis bridges where sense resolution is required (river-bank-shore 0.00, loan-bank-savings 0.00). The one Phase 5 surprise: Gemini routes through "radiation" at 0.80 on sun-radiation-desert, which is a within-frame physics chain. This is consistent with the frame-crossing model even as the cue-strength threshold version fails.

### Phase 2 Asymmetry and the Bottleneck Model

Phase 2 proposed that navigation is fundamentally asymmetric because forward-chaining from the start produces different paths than forward-chaining from the target. Phase 5's forced-crossing result (loan-bank-shore) suggests a refinement: **forced crossings should reduce asymmetry**. If "bank" is the only route from loan to shore, it should also be the only route from shore to loan. The path is constrained in both directions by the same bottleneck.

This prediction connects to Phase 5C's convergence data. The bridge-as-bottleneck model predicts that forced crossings should show *both* high bridge frequency (confirmed: 0.95-1.00) *and* high positional convergence at the bridge position (not directly tested for loan-bank-shore, but consistent with Claude's W-shape signals on other pairs). A forced crossing is the limiting case of bridge-as-anchor: the anchor is so strong that the entire path must pass through it, eliminating alternative routes and reducing asymmetry.

### Phase 3 Compositionality and the Transitivity Disconnect

Phase 5A measured transitivity alongside cue strength and found no clear monotonic relationship. High-cue triples (heat, sentence, sadness) show transitivity scores of 0.094-0.322, which are comparable to medium-cue triples (radiation 0.081-0.303, germination 0.120-0.460) and even low-cue triples (solstice 0.164-0.322, syllable 0.217-0.413). Bridge frequency and transitivity are decoupled.

This is an important clarification. Bridge frequency measures whether the bridge concept *appears* on the direct A-to-C path. Transitivity measures whether the A-to-C path *overlaps* with the A-to-B and B-to-C paths. These can diverge: the direct path may share many waypoints with the component legs without including the specific bridge concept. The compositional structure is broader than the bridge concept -- the paths share territory even when they do not share the named waypoint.

This was hinted at in Phase 4's metaphor result (high transitivity, zero bridge frequency for language-metaphor-thought) and is now confirmed as a general pattern. Bridge frequency and transitivity measure different aspects of compositional structure, and Phase 5 establishes that they are not simply proxies for each other.

---

## 8. Methodological Reflections

### The Value of Failed Predictions

Phase 5's low prediction accuracy is methodologically valuable precisely because the predictions were pre-registered. Post-hoc, it is easy to explain why germination outperforms plant, why cross-axis exceeds same-axis, why fire is dead. Pre-registration reveals that these explanations were not available before the data came in. The benchmark is learning things that were not predictable from first principles or from prior data, which is the definition of genuine empirical discovery.

The alternative -- adjusting predictions until they match the data -- would produce higher accuracy but lower scientific value. Phase 5's 42.9% accuracy in 5B is a feature, not a bug.

### The Gemini Radiation Outlier

Gemini shows 0.80 bridge frequency on sun-radiation-desert while all other models show 0.00. This is the single largest model-specific outlier in Phase 5A. "Radiation" is a physics-domain concept strongly associated with both "sun" and "desert" (solar radiation, desert heat from radiation). The other three models skip "radiation" in favor of more experiential intermediates (heat, temperature, warmth). Gemini routes through "radiation" because -- consistent with the frame-crossing model -- "radiation" operates within the same physics frame as "sun" and "desert" for Gemini, while other models use an experiential frame where "radiation" is a technical detour.

This is actually *support* for the qualitative frame-crossing model, even though the quantitative threshold version failed. Gemini does not have a higher cue-strength threshold; it has *different frames*. When Gemini's default frame includes "radiation" (as it does for sun-desert in the physics frame), the bridge works. When other models' default frame is experiential, "radiation" is off-route.

### Sample Size Limitations

Phase 5C's 8 pairs with 4 models give 32 observations for the W-shape test. With the variance observed (standard deviation ~0.17 for W-shape contrast), the test has low power to detect a true difference of 0.10 between bridge-present and bridge-absent means. The null result should be interpreted as "insufficient evidence" rather than "no effect." The individual signals (Claude's 0.52) suggest the effect exists but is visible only in high-powered subsets.

### The Fire Problem for Dimensionality

The 5B dimensionality analysis was designed around three focal concepts: "light" (polysemous), "bank" (polysemous), and "fire" (non-polysemous control). "Fire" was expected to show reliable same-axis bridging as a baseline against which to compare the polysemous concepts' cross-axis behavior. With "fire" at near-zero bridge frequency on all triples, the control is uninformative -- it does not establish a same-axis baseline because it does not bridge at all. Future dimensionality experiments need a non-polysemous control that actually functions as a bridge concept (e.g., "water" for liquid-water-steam, where the concept is univocal but the chain is navigable).

---

## 9. Open Questions for Phase 6

Ranked by expected information gain, accounting for the revised understanding from Phase 5.

### 9a. Navigational Salience Calibration (Highest Priority)

Phase 5's biggest lesson is that intuitive cue-strength ratings do not predict bridge frequency. The immediate question: can we *measure* navigational salience rather than guessing at it? Design: for a focal pair A-C, collect 50-100 direct A-to-C paths and compute the frequency of every intermediate concept. The frequency distribution is the empirical navigational salience landscape. Use this to calibrate future cue-strength predictions and to discover new bridge concepts that intuition would not identify.

**Expected yield:** An empirical alternative to human-rated cue strength. If the frequency distribution is heavy-tailed (a few concepts appear at high frequency, most at near-zero), this confirms the bridge-as-bottleneck model. If it is flat, navigational structure is weaker than we think.

### 9b. Forced-Crossing Asymmetry Test (High Priority)

The loan-bank-shore result predicts that forced crossings should reduce path asymmetry. Design: collect reverse paths (shore-to-loan) for the forced-crossing triples and compare asymmetry to same-axis triples and to Phase 2 baselines. If forced crossings really constrain navigation in both directions, the forward/reverse Jaccard should be substantially higher than the Phase 2 mean (which showed 0.811 asymmetry).

**Expected yield:** A direct test of whether bridge topology modulates the quasimetric property. If confirmed, the asymmetry index becomes a function of bridge structure, not a fixed property of the concept pair.

### 9c. Positional Bridge Scanning (High Priority)

Phase 5C's rigid assumption (bridge at position 4) missed signals at other positions (Gemini's P3 = 0.900 on bank-savings). Design: for bridge-present pairs, compute per-position convergence at all 7 positions and identify the peak. Test whether the peak position correlates with the bridge concept's position in the path. This converts the W-shape test from a fixed-position test to a peak-detection test.

**Expected yield:** A more sensitive measure of bridge-as-anchor that is not confounded by positional variability. If bridges anchor at variable but predictable positions, the positional distribution itself is informative.

### 9d. Curvature Estimation from Path Data (Medium-High Priority)

Deferred from Phase 4 but increasingly motivated by Phase 5's results. The forced-crossing topology (loan-bank-shore) suggests regions of high curvature around polysemous concepts, where paths from different domains are forced to converge. Design: use the existing path data to estimate local curvature via the Gauss-Bonnet approach (excess triangle inequality slack as a proxy for curvature). Compare curvature estimates around polysemous hubs (bank, light) vs. univocal concepts (fire, tree).

**Expected yield:** The first curvature estimates for conceptual topology. If polysemous concepts show higher curvature, it connects the forced-crossing phenomenon to differential geometry.

### 9e. The "Too-Central" Phenomenon (Medium Priority)

"Fire" and "plant" both fail as bridges despite strong association with their endpoints. Is this a general property of concepts that are "too central" to a chain? Design: construct 5-6 triples where the bridge is the most prototypical category member (e.g., robin-bird-nest, water-liquid-ice) and compare bridge frequency to triples with less prototypical bridges (e.g., eagle-bird-nest, mercury-liquid-ice). If prototypicality suppresses bridge usage, this would establish "too-central" as a systematic phenomenon.

**Expected yield:** A quantitative characterization of when high association suppresses rather than promotes bridge usage. The threshold between "too obvious to navigate through" and "obvious enough to be a reliable waypoint" is a key parameter of the navigation mechanism.

### 9f. Paper Preparation (Parallel Track)

Five phases of data now support three core claims with increasing nuance: (1) LLM conceptual navigation has measurable quasimetric structure with compositional properties; (2) this structure is model-specific in ways that are stable, predictable, and topologically characterizable; (3) the determinants of bridge reliability include navigational salience, forced-crossing topology, and process-naming -- not raw associative strength. Phase 5's prediction failures strengthen rather than weaken the paper by demonstrating that the findings are genuinely empirical rather than confirmations of prior assumptions. The germination surprise and the loan-bank-shore result are both independently publishable findings.

---

## 10. Summary of Key Findings

1. **Bridge frequency decreases with cue strength, but the gradient is noisier than expected.** 12/16 family/model combinations show monotonic decrease. The 4 failures are all in biological-growth, where our cue-strength ratings were wrong.

2. **"Germination" outperforms "plant" as a bridge from seed to garden.** Navigational salience (does the concept move the path forward?) is not the same as associative strength (how strongly is the concept linked to the endpoints?). Process-naming bridges outperform object-naming bridges.

3. **The Gemini cue-strength threshold hypothesis fails.** Gemini's threshold (1.79) is not significantly different from other models' (mean 2.05). Gemini's fragmentation is not about sensitivity -- it is about frame membership. The qualitative frame-crossing model survives; the quantitative threshold model does not.

4. **Cross-axis bridge frequency exceeds same-axis in aggregate, driven primarily by bank.** The pre-registered dimensionality test fails in the wrong direction. The aggregate result is dominated by loan-bank-shore (0.95-1.00), which shows that polysemy can create forced crossing points producing the *highest* bridge frequencies in the benchmark. However, this is not universal: "light" shows the opposite pattern (same-axis delta +0.083), and "fire" shows near-zero bridging on all axes. The forced-crossing mechanism is specific to cases where the polysemous concept is the only semantic connection between A and C.

5. **"Fire" is nearly dead as a bridge concept.** Near-zero bridge frequency in all configurations for all models (sole exception: GPT at 0.15 on spark-fire-ash). Fire is navigable *to* but almost never *through*, establishing "too-central" as a new bridge failure mode distinct from "off-axis" (metaphor) or "fragmentation" (Gemini).

6. **The W-shape fails in aggregate but succeeds for Claude individually.** Claude's 0.52 contrast on music-mathematics (P4 = 0.600) is the strongest positional convergence signal in the benchmark. The effect requires both bridge presence and positional stability, making it visible only for the most rigid navigator.

7. **Prediction accuracy drops sharply (81.3% to 64.6% to 42.9%) as experiments move from characterization to mechanism.** Phases 1-4 characterized bridge topology; Phase 5 attempted to identify the *mechanisms* controlling it. The drop in accuracy is diagnostic: our mechanistic models (cue strength, dimensional independence) were wrong. The correct mechanisms appear to be navigational salience, forced-crossing topology, and process-naming.

8. **Bridge frequency and transitivity are decoupled.** High transitivity (path overlap) does not require bridge presence, and bridge presence does not guarantee high transitivity. The two metrics measure different aspects of compositional structure.

9. **Gemini's "radiation" outlier supports the qualitative frame model.** Gemini routes through "radiation" (0.80) where other models show 0.00, because Gemini's default frame for sun-desert is physics, not experiential sensation. The frames are real; the threshold is not.

10. **The benchmark's prediction failures are its most valuable output.** Every Phase 5 surprise -- germination, loan-bank-shore, fire's death, the W-shape aggregate null -- reveals something that was not predictable from first principles. This is the benchmark working as designed: an MRI, not an exam.
