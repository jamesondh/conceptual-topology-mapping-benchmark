# Graveyard: Dead Ends, Failed Hypotheses, and Deprecated Approaches

Things we tried that didn't work, and why. Prevents re-treading and provides honest accounting of the benchmark's learning curve. Ordered chronologically by phase.

---

## Phase 1: Polysemy Cross-Pair Jaccard of 0.000 (Artifact)

**What:** Reported "perfect sense differentiation" with cross-pair Jaccard of 0.000 for all three polysemy groups (bank, bat, crane).

**Why it failed:** Holdout pairs had no pilot data — the zero Jaccard was comparing real data against empty sets.

**Resolution:** Phase 2 supplementary runs (120 forward runs across 3 holdout polysemy pairs). Corrected values: 0.011-0.062. Sense differentiation is still genuine and strong, but not literally perfect.

**Lesson:** Always verify denominator. Zero is suspicious.

---

## Phase 2: Monotonic Convergence Prediction

**What:** Predicted that mirror-matching forward position i against reverse position (5-i) would show monotonically increasing overlap from position 1 to 5, based on the starting-point hypothesis (starting concept dominates early waypoints, target influences late waypoints).

**Why it failed:** Got U-shape instead — positions 1 and 5 both elevated (0.102, 0.129), with a valley in the middle (0.057-0.085). Both endpoints act as anchors.

**Resolution:** Replaced starting-point hypothesis with dual-anchor hypothesis. Target concept also influences path from the beginning (especially for polysemous pairs where sense disambiguation requires knowing the target). Starting-point effect is real but attenuated.

**Lesson:** Simple unidirectional models underestimate the influence of the target concept on path construction.

---

## Phase 2: Category Symmetry Predictions (4 of 8 Failed)

**What:** Predicted several categories would show high path symmetry (low asymmetry) between forward and reverse directions.

**Failures:**
- **Antonyms** — predicted high symmetry, observed 0.596 asymmetry. Even the temperature axis has directional landmarks ("tepid" pulls toward the hot end).
- **Near-synonyms** — predicted high symmetry, observed 0.665. Dense neighborhoods constrain differently depending on entry point.
- **Control-random** — predicted symmetric (no inherent directionality), observed 0.908. The *most important* failure: when there's no semantic bridge, the starting point completely determines the trajectory.
- **Control-nonsense** — predicted symmetric, observed 0.986.

**Resolution:** Established that asymmetry is pervasive and structural, not relationship-dependent. The magnitude (0.811 mean) was far higher than anyone would have predicted. Led to quasimetric characterization of conceptual space.

**Lesson:** Asymmetry is the default. Symmetry is the exception, produced only by strong semantic bridges that constrain both directions.

---

## Phase 3: "Energy" as Hot-Cold Bridge

**What:** "Energy" is associated with both "hot" and "cold" and was included in the semantic chain triple type (hot-energy-cold).

**Why it failed:** Near-zero transitivity (0.036 average). "Energy" never appears as a bridge concept. Hot-to-cold paths traverse the experiential temperature gradient (warm, tepid, cool, chilly); hot-to-energy and energy-to-cold paths traverse physics terms (thermodynamics, work, heat).

**Resolution:** Established that the temperature axis and the physics-of-energy axis are parallel non-intersecting conceptual dimensions. Association is not the same as being on-route. This finding was later echoed by the Phase 4 "metaphor" result and the Phase 5 "plant" result.

**Lesson:** Semantic association between a concept and two endpoints does not guarantee that concept lies on the navigational path between them.

---

## Phase 4: "Metaphor" as Language-Thought Bridge

**What:** Predicted bridge frequency of [0.50, 1.00] for Claude, GPT, and Grok on language-metaphor-thought. Rationale: metaphor is arguably the quintessential bridge between language and thought (Lakoff & Johnson's entire research program).

**Why it failed:** 0.00 for ALL four models. Zero. Not one run out of 80 produced "metaphor" as a waypoint. Yet transitivity was high (Claude 0.437) — the paths compose through shared waypoints like "communication," "meaning," "cognition," just not through "metaphor" itself.

**Resolution:** Sharpened the definition of bridge concepts. A bridge must name the *primary axis of connection* between endpoints, not merely be associated with both. "Metaphor" names a specific device; the language-thought connection goes through general functions (meaning, communication, expression). Led to the "association is not navigation" principle.

**Lesson:** The biggest single prediction miss in the benchmark. Intuitive semantic importance (metaphor *should* bridge language and thought) has no predictive power for navigational bridge behavior.

---

## Phase 4: Concrete/Abstract as Gemini's Fragmentation Boundary

**What:** Used concrete vs. abstract distinction to predict Gemini's bridge behavior. Predicted Gemini would succeed on tree-forest-ecosystem (concrete, hierarchical, part-whole) with bridge frequency > 0.40.

**Why it failed:** Gemini observed at 0.10 on tree-forest-ecosystem. The concrete/abstract axis doesn't explain Gemini's fragmentation pattern — bank-deposit-savings (abstract/financial) succeeds at 1.00 while tree-forest-ecosystem (concrete/ecological) fails.

**Resolution:** Replaced with the frame-crossing hypothesis: Gemini succeeds on within-frame bridges (tight cue chains within a single domain) and fails on cross-frame bridges (requiring integration across loosely coupled conceptual clusters). Forest-to-ecosystem requires crossing from the botanical/spatial frame to the ecological/systems frame. This is a scale transition, not an abstractness gradient.

**Lesson:** The concrete/abstract distinction is too coarse. Frame membership and cue-chain tightness are the relevant variables for Gemini's topology.

---

## Phase 5: Gemini Cue-Strength Threshold Hypothesis

**What:** Phase 4's frame-crossing hypothesis predicted that Gemini should have a measurably higher cue-strength threshold than other models — it succeeds on high-cue bridges and fails on low-cue bridges, so there should be a threshold that's shifted rightward.

**Why it failed:** Logistic fit shows Gemini's threshold (1.79) is the *lowest*, not the highest. 95% CI on the difference: [-1.00, 1.07], comfortably including zero. Gemini responds to cue strength at approximately the same sensitivity as other models.

**Resolution:** The quantitative threshold model of frame-crossing is not supported. Gemini's fragmentation is about frame *membership* (which frame does it activate?), not about cue *sensitivity* (how strong does the cue need to be?). The qualitative frame-crossing model survives; the quantitative version does not.

**Lesson:** A correct qualitative model (frame-crossing) can still generate incorrect quantitative predictions (threshold). These should be treated as separate claims.

---

## Phase 5: Intuitive Cue-Strength Ratings (Plant > Germination)

**What:** Rated "plant" as very-high cue strength (4/4) and "germination" as medium (2/4) for the biological-growth family (seed-B-garden). Predicted plant would bridge at near-100% frequency.

**Why it failed:** Complete inversion. Germination outperforms plant in all 4 models: Claude 1.00 vs 0.00, GPT 0.95 vs 0.65, Grok 0.15 vs 0.00, Gemini 1.00 vs 0.00.

**Resolution:** Discovered the distinction between associative strength and navigational salience. "Plant" is strongly associated with both endpoints but is a *neighbor* of both, not a waypoint between them. "Germination" names the *process* that transforms seed into garden — it adds directional information. Process-naming bridges outperform object-naming bridges.

**Lesson:** Human intuition about "which concept is most related" does not predict which concept models route through. Future experiments should calibrate empirically via pilot runs, not via intuitive ratings.

---

## Phase 5: Dimensional Independence Model of Polysemy

**What:** Pre-registered test predicting same-axis bridge frequency would exceed cross-axis by at least 0.40. Rationale: if "bank" has independent financial and geographic dimensions, crossing between them should be harder.

**Why it failed:** Cross-axis mean (0.291) is *higher* than same-axis mean (0.220). Delta is -0.071, wrong direction. 42.9% prediction accuracy — worst in the benchmark. Driven by loan-bank-shore at 0.95-1.00 for non-Gemini models.

**Resolution:** Polysemy doesn't create dimensional walls — it creates **forced crossing points**. When a polysemous concept is the *only* semantic connection between two otherwise unrelated domains (loan and shore share nothing except through "bank"), the bridge becomes obligatory. Same-axis paths have alternatives (loan-to-savings can go through interest, account, credit); cross-axis paths have no alternative that avoids "bank."

**Lesson:** The most reliable bridges are bottlenecks, not associations. Constraint produces reliability. This is probably the single most important mechanistic finding in the benchmark.

---

## Phase 5: "Fire" as Non-Polysemous Control Bridge

**What:** Included "fire" as a control in the dimensionality experiment. Expected reliable same-axis bridging (spark-fire-ash) to establish a baseline for comparing polysemous concepts.

**Why it failed:** Near-zero bridge frequency across all configurations for all models. Sole exception: GPT at 0.15 on spark-fire-ash. Fire is navigable *to* but almost never *through*.

**Resolution:** "Fire" is "too central" — so implied by both endpoints that models skip it entirely. Spark already implies fire; ash already implies fire. Naming fire adds no navigational information. This established "too-central" as a new bridge failure mode, distinct from "off-axis" (metaphor) and "fragmentation" (Gemini).

**Lesson:** The control was uninformative because it didn't bridge at all. Future dimensionality experiments need non-polysemous controls that actually function as bridges (e.g., water for liquid-water-steam).

---

## Phase 5: W-Shape Aggregate Prediction

**What:** Pre-registered test: bridge-present pairs should show higher W-shape contrast (elevated convergence at midpoint) than bridge-absent pairs, aggregated across all models and pairs.

**Why it failed:** Bridge-present mean W-shape contrast: 0.0027 (CI [-0.0787, 0.0797]). Bridge-absent: 0.0050. Difference: -0.0023 (CI [-0.0983, 0.0887]). No signal in aggregate.

**Resolution:** The effect exists but is model-dependent and position-variable. Claude shows 0.52 contrast on music-mathematics (strongest positional signal in the benchmark, P4 = 0.600). Grok shows -0.045 on the same pair despite having the bridge — bridge presence alone isn't sufficient, positional stability is also required. Gemini shows a displaced anchor at P3 = 0.900 on bank-savings, meaning the W-shape test's assumption of midpoint bridging is too rigid.

**What survived:** The restricted version: for models with rigid navigational gaits (Claude) and bridge concepts with fixed positional placement, the bridge creates a genuine third convergence anchor. Phase 6C redesigns the test as peak-detection rather than fixed-position.

**Lesson:** Aggregation can kill real signals when the effect is interaction-dependent (model x pair). Individual-level analysis is essential for positional phenomena.

---

## Phase 6: Forced-Crossing Asymmetry Reduction (H4)

**What:** Predicted that forced crossings (where a polysemous concept is the only route between two domains) would reduce path asymmetry below the Phase 2 baseline of 0.811. Bank-mediated pairs predicted at 0.50-0.70 asymmetry.

**Why it failed:** Forced-crossing mean asymmetry is 0.817 (CI [0.743, 0.877]), indistinguishable from same-axis mean (0.810) and Phase 2 baseline (0.811). The bottleneck constrains *which concepts* appear on the path but not the *surrounding navigational context*. Two paths that both pass through "bank" but differ in every other waypoint still show high asymmetry.

**Resolution:** Path asymmetry is a global property of navigational structure, not modulated by local bottlenecks. The 0.811 baseline appears to be a structural constant. Forced crossings standardize inter-model asymmetry variance (loan-shore range 0.026 across models) without reducing the mean.

**Lesson:** The bottleneck metaphor is about traffic concentration, not directional constraint. A shared waypoint does not produce shared paths.

---

## Phase 6: Semantic Distance Predicts Bridge Position (H5)

**What:** Predicted that bridge position in the waypoint sequence correlates with the semantic distance ratio d(A,bridge)/d(A,C). Bridges closer to A should anchor earlier; bridges equidistant should anchor at the midpoint.

**Why it failed:** Correlation r = 0.239 (p = 0.486), far from significant. The distance ratio is irrelevant because bridges overwhelmingly anchor at positions 1-2 (0-indexed) regardless of semantic distance. The early-anchoring discovery means there's almost no positional variance to predict.

**Resolution:** Bridge position is determined by the directional-heading mechanism (bridges are selected early as the first step orienting toward the target), not by semantic geometry. Exception: taxonomic bridges (animal-dog-poodle) anchor at hierarchically appropriate positions.

**Lesson:** The geometric intuition (distance determines position) is wrong for navigation. Navigational mechanics (heading selection) override geometry.

---

## Phase 6: Forced-Crossing Bridges Are Positionally Stable

**What:** Predicted that forced-crossing bridges should have low positional variance (SD < 0.8) because their obligatory nature should fix their position.

**Why it failed:** Forced-crossing positional SD = 1.71, vs 0.52 for non-forced. The two forced-crossing pairs (loan-shore, deposit-river) are the only "model-dependent" pairs in the positional analysis.

**Resolution:** Forced-crossing bridges sit at frame junctions, and the timing of frame-crossing is model-dependent. Claude may cross early, GPT may cross late. The obligatory nature constrains *presence* (bridge always appears) but not *position* (bridge floats).

**Lesson:** Obligatory ≠ stable. A concept can be mandatory on every path while still occupying different positions depending on the model's frame-activation sequence.

---

## G16 — Phase 7: Polysemous Curvature Hypothesis

**What:** Predicted that polysemous-vertex triangles (loan-bank-river, deposit-bank-shore, photon-light-heavy, candle-light-feather) would show significantly higher triangle excess (curvature) than non-polysemous-vertex triangles, because polysemy should locally warp navigational geometry.

**Why it failed:** Polysemous mean excess 0.499, non-polysemous mean excess 0.446. Difference 0.053, CI [-0.157, 0.263] comfortably includes zero. The two categories are indistinguishable. Additionally, the cross-model distance validity check failed (r = 0.170), meaning the distance metric itself is not reliable enough to support curvature claims.

**Resolution:** Polysemy affects *which concepts appear* on paths (forced crossings, sense differentiation) but does not systematically warp *how far apart* concepts are. The triangle excess is high for all triangles (~0.47 mean), suggesting paths are generally "longer" than direct connections, but this is a universal property, not a polysemy-specific one.

**Lesson:** A metric that fails validity checks (cross-model r = 0.170) cannot support the claims built on it. Always validate the measuring instrument before interpreting the measurements.

---

## G17 — Phase 7: Cross-Model Distance Validity

**What:** Expected cross-model correlation of navigational distances to exceed r = 0.50, establishing that the waypoint-based distance metric measures something real and model-independent. This was a pre-condition for interpreting curvature differences.

**Why it failed:** Mean cross-model distance correlation r = 0.170 — models assign wildly different navigational distances to the same concept pairs. Claude sees photon-light as 0.000 while GPT sees it as 0.729. Claude sees seed-germination-garden as having a zero-distance leg while Grok sees 0.788.

**Resolution:** Navigational distances are fundamentally model-dependent quantities, not objective properties of concept pairs. This rules out cross-model curvature comparison. Within-model curvature profiles may still be interpretable (Gemini does show the most TI violations), but the strong claim — that polysemy warps geometry — requires a metric that agrees across observers.

**Lesson:** The gait differences (R1) contaminate any attempt to build a shared distance metric. Models don't just navigate differently — they *measure* conceptual space differently.

---

## G18 — Phase 7: Too-Central as Binary Category

**What:** Predicted that "too-central" bridges (fire, tree, dough) would show frequency < 0.15, clearly separated from "obvious-useful" bridges (warm, adolescent, speak) at > 0.40, with a gap > 0.35 and CI excluding zero.

**Why it failed:** Too-central mean 0.496, obvious-useful mean 0.783. Difference 0.287 but CI [-0.063, 0.587] includes zero. The problem: acorn-timber "tree" has frequency 1.000 for Claude, GPT, and Grok (only Gemini at 0.000), and flour-bread "dough" is similarly high for 3/4 models. Only spark-ash "fire" is genuinely too-central.

**Resolution:** "Too-central" is not a category of bridges — it's a property of specific bridge-pair combinations. "Fire" is too-central for spark-ash because both endpoints *directly imply* fire. "Tree" is NOT too-central for acorn-timber because acorn implies potential (not tree specifically) and timber implies processed wood (not tree specifically). The original categorization was based on intuition rather than the operational definition (both endpoints directly imply the bridge).

**Lesson:** The most interesting finding is what it tells us about categorization itself: human intuition about which concepts are "too obvious" doesn't match model navigation. Only rain-ocean/water and spark-ash/fire meet the strict operational definition of too-central.

---

## G19 — Phase 7: Forced-Crossing "Bank" Resists Displacement

**What:** Predicted that the forced-crossing bridge "bank" on loan-shore would survive pre-filling at > 0.90 frequency and shift only ~1 position, because bank is the obligatory bottleneck with no alternative route.

**Why it failed:** Bank survival under pre-fill is 0.267 (far below 0.90). Mean positional shift is 0.791. Pre-filling with an alternative heading is enough to derail even obligatory bottleneck navigation.

**Resolution:** Forced crossings are obligatory only in *unconstrained* navigation. When the first waypoint is pre-filled with a concept from a different semantic direction, models often fail to route back to the bottleneck. The pre-filled heading creates an alternative navigational trajectory that avoids the bottleneck entirely. This means "forced crossing" is about the *default* route, not an inescapable constraint.

**Lesson:** Obligatory ≠ robust under perturbation. The bank bottleneck is the default navigational solution, but models can be pushed off this default by early anchoring. Confirms that waypoint 1 has outsized influence on the entire trajectory (consistent with early-anchoring mechanism).

---

## G20 — Phase 8: Route Exclusivity (Competitor Count) Predicts Bridge Fragility

**What:** Predicted that bridges with more alternative waypoints (competitors at >20% frequency in salience landscapes) would show lower pre-fill survival, with Spearman rho < -0.70 retrospectively and < -0.60 combined across 14 pairs.

**Why it failed:** Retrospective rho = 0.116 (slightly positive, opposite direction), combined rho = -0.121 (non-significant). The critical anomaly: sadness has 8 competitors yet survives at 0.807 (highest survival in the sample), while harmony has 7 competitors and collapses to 0.015. Competitor *count* is irrelevant because it does not distinguish between a bridge that dominates its alternatives (sadness towers over affect, mood, sentiment) and one that shares the landscape equally (harmony competes with rhythm, pattern, frequency at comparable frequencies).

**Resolution:** The controlling variable is likely dominance ratio (bridge frequency / strongest competitor frequency), not raw competitor count. H9 proposes this replacement predictor. Additionally, 6 of 8 prospective pairs failed the evaluability gate (unconstrained bridge frequency < 0.40), confirming that a priori bridge prediction remains unreliable after 8 phases.

**Lesson:** Counting alternatives ignores the distribution of traffic among them. A bridge with 8 weak competitors is more robust than one with 3 strong competitors. Quantity ≠ quality in the competitive landscape.

---

## G21 — Phase 8: Gemini Gradient Blindness

**What:** Predicted that Gemini shows a selective deficit on gradient-midpoint bridges relative to causal-chain bridges, with the Gemini interaction (gradient - causal gap difference) at least 0.20 more negative than non-Gemini models, CI excluding zero. Predicted Gemini would produce zeros on >= 5/10 gradient pairs and <= 2/10 causal pairs.

**Why it failed:** The result was backward. Gemini's zeros concentrate on causal-chain pairs (6/10), not gradient pairs (1/10). The interaction is 0.046 (CI [-0.339, 0.450]), statistically null. Gemini's proportional gradient advantage (gap = 0.227) is actually the largest of any model. Gemini succeeds on 9/10 gradient midpoints (warm, walk, lake, rock, rain, city, speak, adolescent, pebble-boulder) while failing on transformation intermediaries (cocoon, pottery, metal, flower, tree, dough).

**Resolution:** Gemini's deficit is transformation-chain blindness (H10), not gradient blindness. Gemini handles continuous dimensions but cannot route through discrete transformation states in material/biological processes. This refines H1 (frame-crossing) by specifying the type of frame boundary that Gemini cannot cross.

**Lesson:** When testing a specific mechanism, the opposite result is more informative than a null. Gemini's causal zeros (6/10) were the actual signal hiding in the Phase 7C data, but our framing focused on the wrong pair type.

---

## G22 — Phase 8: Gait Normalization Rescues Cross-Model Distance Metrics

**What:** Predicted that dividing raw Jaccard distances by model-specific baselines (mean distance across 8 reference pairs) would raise cross-model correlation from r ~0.17 to r > 0.50, CI lower bound > 0.30.

**Why it failed:** Normalization produces exactly zero improvement. Raw r = 0.212, normalized r = 0.212. Every pairwise model correlation is identical before and after normalization. The mathematical reason: dividing both variables by constants does not change Pearson correlation (r(X/a, Y/b) = r(X, Y)). The substantive reason: the cross-model disagreement is ordinal — models rank-order concept pair distances differently (Spearman = 0.287, also unchanged by normalization). Some model pairs actively anti-correlate (Grok-Gemini r = -0.580).

**Resolution:** Model-independent geometry is definitively blocked with path-based measurements. The gait difference is not a scale factor but a structural reorganization of how each model measures conceptual space. Remaining options: embedding-based distances (different measurement modality), within-model-only analysis, or abandoning cross-model geometry entirely.

**Lesson:** When a normalization has no effect, the diagnosis is that the problem is not what you thought. The disagreement was never about scale — it was about ordinal structure. Always check whether your proposed fix is mathematically capable of addressing the actual pattern in the data.

---

## G23 — Phase 9: Dominance Ratio Predicts Bridge Fragility (H9)

**What:** Predicted that the ratio of bridge unconstrained frequency to strongest competitor frequency would predict pre-fill survival, with Spearman rho > 0.50 across 14 combined pairs and CI excluding zero. Retrospective evaluability gate (rho > 0.40 on 8 existing pairs) passed at rho = 0.548.

**Why it failed:** Combined rho = 0.157 (CI [-0.482, 0.691]), far from significant. The critical anomaly: warm (dominance ratio 1.00) is completely destroyed by all four models (0.000 survival) while fermentation (ratio 1.07) is bulletproof (1.017 survival). Virtually identical dominance ratios, completely opposite outcomes. The retrospective signal (rho = 0.548) collapsed prospectively because the 8-point retrospective sample was overfitting — cause-effect "mechanism" already violated the trend (ratio 1.25 but survival only 0.143).

**Resolution:** The controlling variable is not dominance ratio but the semantic relationship between the pre-fill concept and the bridge. Warm's pre-fill ("cool") is on the same temperature gradient — it provides an alternative entry point that makes warm unnecessary. Fermentation's pre-fill ("harvest") is in the same domain but not on the same transformation chain — it cannot substitute for fermentation. After G20 (competitor count) and G23 (dominance ratio), both single-variable structural predictors of bridge fragility have failed. The phenomenon requires multi-variable models that account for pre-fill content and bridge structural role jointly.

**Lesson:** Retrospective signals on small samples (N=8) do not generalize. The evaluability gate (rho > 0.40) was correctly designed to prevent over-commitment, but even passing the gate at rho = 0.548 wasn't enough — the combined sample showed the retrospective trend was illusory. Future work should require N >= 15 for retrospective validation before investing in prospective collection.

---

## G24 — Phase 9: Gemini Transformation-Chain Blindness (H10)

**What:** Predicted that Gemini would show a significantly larger (gradient - transformation) deficit than non-Gemini models, with transformation mean < 0.30, gradient mean > 0.45, and interaction CI excluding zero. This was the most specific mechanistic characterization of Gemini's deficit attempted in the benchmark: Gemini can navigate continuous dimensions but cannot route through discrete transformation states.

**Why it failed:** The result was reversed. Gemini transformation mean = 0.667 (vs predicted < 0.30), gradient mean = 0.293 (vs predicted > 0.45). Gemini shows a *larger* gap favoring transformation over gradient (0.374) than non-Gemini models (0.084). The interaction is -0.290, opposite direction. Gemini's zeros in Phase 9B cluster on gradient pairs (5/10), not transformation pairs (2/10) — the reverse of Phase 8B's pattern (6/10 causal zeros, 1/10 gradient zeros). The meta-analytic combination with Phase 8B gives pooled interaction = -0.113, firmly null.

**Resolution:** Gemini's deficit is real (mean 0.480 vs ~0.67 non-Gemini, a ~30% reduction that persists across all phases) but has now resisted three successive mechanistic characterizations: (1) frame-crossing threshold (Phase 5, falsified — Gemini's threshold is lowest, not highest), (2) gradient blindness (Phase 8B/G21, falsified backward — zeros on causal pairs, not gradient), (3) transformation-chain blindness (Phase 9B/G24, falsified backward — better on transformation than gradient). The pattern across Phase 8B and Phase 9B is instructive: whatever pair type is designed to be "hard" for Gemini, Gemini does relatively better on it. This suggests the pair-type dimension is simply not where Gemini's deficit lives. It may be a bridge-specificity issue (Gemini fails on specific concepts regardless of type) or a stochasticity issue (Gemini has higher variance, and its zeros are distributed randomly across types).

**Lesson:** When a hypothesis fails backward in two successive tests (G21: predicted gradient zeros, got causal zeros; G24: predicted transformation zeros, got gradient zeros), the pair-type classification itself is not capturing the relevant dimension. Abandon the type-based approach to Gemini characterization. The deficit is model-level, not type-level.

---

## G25 (partial) — Phase 9: Pre-Fill Facilitation Crossover Regression (H11)

**What:** Predicted that regressing pre-fill survival on unconstrained bridge frequency would produce a significant negative slope (CI excluding zero), with a crossover point at approximately unconstrained frequency 0.40-0.50 where pre-filling transitions from facilitation to displacement.

**Why it partially failed:** Slope = -3.355 (correct direction) but CI [-6.748, 0.723] includes zero. R-squared = 0.289 — 29% of variance explained, non-trivial but not the clean predictor promised. The crossover point is estimated at 0.790 (CI [0.228, 1.136]), far from the predicted 0.40-0.50 and with a CI spanning nearly the entire frequency range.

The regression fails because the data is too heterogeneous to support a single-variable model. Within the marginal bridge category (unconstrained freq < 0.30), cooking (0.183) shows displacement (survival 0.136) while creativity (0.125) shows massive facilitation (survival 8.000). Same frequency range, opposite outcomes. The hidden variable is the pre-fill concept's relationship to the bridge — exactly the same finding as G23 for the dominance ratio.

**What survived:** The facilitation effect itself is real and large (O22: mean congruent survival 3.761 for marginal bridges). The displacement effect for dominant bridges is present but marginally fails the pre-registered threshold (mean survival 0.815 > 0.80 cutoff, largely due to corrected animal-poodle "dog" at 0.941). The qualitative distinction (marginal bridges can be facilitated, dominant bridges are generally displaced) holds. What fails is the regression model that predicts the crossover quantitatively.

**Lesson:** The benchmark keeps finding that qualitative directional predictions succeed (~50% accuracy for structure) while quantitative predictions fail (~0% for mechanism). This is not coincidence — it reflects that the phenomenon has qualitative structure (bridges are either robust or fragile, facilitation or displacement) that is captured by coarse categories, but the specific outcome for any given pair depends on interaction effects (bridge × pre-fill content × model) that no single-variable regression can capture.
