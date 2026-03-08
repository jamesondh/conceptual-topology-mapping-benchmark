# Appendix C: The Graveyard --- Dead Ends, Failed Hypotheses, and Deprecated Approaches

This appendix documents 29 dead ends across 11 experimental phases. These entries are ordered chronologically and represent an honest accounting of the benchmark's learning curve. One entry (G26) was subsequently resurrected with additional data.

## Summary Table

| ID | Phase | Hypothesis | Predicted | Observed | Type |
|----|-------|-----------|-----------|----------|------|
| G1 | 1 | Perfect polysemy differentiation | Jaccard = 0.000 | Artifact (empty data) | Data error |
| G2 | 2 | Monotonic convergence | Increasing overlap | U-shape (dual-anchor) | Model too simple |
| G3 | 2 | Category symmetry (4 of 8) | High symmetry for antonyms, near-synonyms, controls | Asymmetry 0.596--0.986 | Asymmetry is universal |
| G4 | 3 | "Energy" as hot--cold bridge | Bridge frequency > 0 | Near-zero (0.036 transitivity) | Association $\neq$ navigation |
| G5 | 4 | "Metaphor" as language--thought bridge | Frequency 0.50--1.00 | 0.00 all models | Intuition $\neq$ navigation |
| G6 | 4 | Concrete/abstract predicts Gemini | tree--forest--ecosystem > 0.40 | Gemini 0.10 | Category too coarse |
| G7 | 5 | Gemini cue-strength threshold | Threshold highest | Threshold lowest (1.79) | Quantitative model fails |
| G8 | 5 | Plant > germination (intuitive cue) | Plant near 100% | Germination wins (process > object) | Human intuition fails |
| G9 | 5 | Dimensional independence of polysemy | Same-axis > cross-axis by 0.40 | Cross-axis higher (forced crossings) | Constraint > association |
| G10 | 5 | Fire as reliable control bridge | Reliable same-axis bridging | Near-zero all models | Too-central failure mode |
| G11 | 5 | W-shape aggregate prediction | Bridge-present > bridge-absent | No aggregate signal | Aggregation kills signal |
| G12 | 6 | Forced-crossing reduces asymmetry | 0.50--0.70 asymmetry | 0.817 (= baseline) | Asymmetry is structural |
| G13 | 6 | Semantic distance predicts position | r significant | r = 0.239, p = 0.486 | Early-anchoring overrides geometry |
| G14 | 6 | Forced-crossing positional stability | SD < 0.8 | SD = 1.71 | Obligatory $\neq$ stable |
| G15 | 7 | Directional-heading theory (strong form) | Incongruent > congruent displacement | Indistinguishable (0.515 vs 0.436) | Associative primacy dominates |
| G16 | 7 | Polysemous curvature | Higher triangle excess | Difference 0.053, CI includes zero | Distance metric invalid |
| G17 | 7 | Cross-model distance validity | r > 0.50 | r = 0.170 | Distances are model-dependent |
| G18 | 7 | Too-central as binary category | Clean separation | CI includes zero; only fire/water qualify | Category based on intuition |
| G19 | 7 | Forced-crossing resists pre-fill | Survival > 0.90 | Survival 0.267 | Obligatory $\neq$ robust |
| G20 | 8 | Route exclusivity (competitor count) | $\rho$ < --0.70 | $\rho$ = 0.116 | Single variable fails |
| G21 | 8 | Gemini gradient blindness | Gradient zeros $\geq$ 5/10 | Causal zeros 6/10 (reversed) | Type-based approach wrong |
| G22 | 8 | Gait normalization rescues distance | Normalized r > 0.50 | r = 0.212 (0.000 improvement) | Ordinal disagreement |
| G23 | 9 | Dominance ratio predicts fragility | $\rho$ > 0.50 | $\rho$ = 0.157 | Retrospective overfitting |
| G24 | 9 | Gemini transformation blindness | Transformation deficit | Transformation advantage (reversed) | Third type-based failure |
| G25 | 9 | Pre-fill crossover regression | Significant slope | CI includes zero (partial) | Too heterogeneous |
| G26 | 10 | Bridge generalization fails | CI excludes zero | **Resurrected**: CI includes zero | Infrastructure artifact |
| G27 | 10 | Relation class ordering | On-axis < unrelated < same-domain | Unrelated < on-axis $\approx$ same-domain | Related vs. unrelated is binary |
| G28 | 11 | Control pair revision | $\geq$ 2/4 candidates pass | 0/24 cells pass | LLMs navigate between anything |
| G29 | 11 | Asymmetry universality across protocol | Mean > 0.60 all conditions | 5wp: 0.594; 9wp: 0.669 | Resolution-dependent |

## Detailed Entries

### G1 --- Phase 1: Polysemy Cross-Pair Jaccard of 0.000 (Artifact)

**Hypothesis:** Perfect sense differentiation with cross-pair Jaccard of 0.000 for all three polysemy groups.

**What happened:** Holdout pairs had no pilot data --- the zero Jaccard was comparing real data against empty sets.

**Resolution:** Phase 2 supplementary runs (120 forward runs) corrected values to 0.011--0.062. Sense differentiation is genuine and strong, but not perfect.

**Lesson:** Always verify the denominator. Zero is suspicious.

### G2 --- Phase 2: Monotonic Convergence Prediction

**Hypothesis:** Mirror-matching forward position *i* against reverse position *(5-i)* would show monotonically increasing overlap, based on the starting-point hypothesis.

**What happened:** U-shape instead --- positions 1 and 5 both elevated (0.102, 0.129), valley in the middle (0.057--0.085). Both endpoints act as anchors.

**Resolution:** Replaced starting-point hypothesis with dual-anchor hypothesis (O2).

**Lesson:** Simple unidirectional models underestimate the influence of the target concept.

### G3 --- Phase 2: Category Symmetry Predictions

**Hypothesis:** Several categories would show high path symmetry: antonyms, near-synonyms, random controls, nonsense controls.

**What happened:** Observed asymmetry of 0.596 (antonyms), 0.665 (near-synonyms), 0.908 (random), 0.986 (nonsense). Four of eight category symmetry predictions failed.

**Resolution:** Established that asymmetry is pervasive and structural (R2). The 0.811 mean was far higher than predicted.

**Lesson:** Asymmetry is the default. Symmetry is the exception, produced only by strong semantic bridges.

### G4 --- Phase 3: "Energy" as Hot--Cold Bridge

**Hypothesis:** "Energy," associated with both "hot" and "cold," would appear as a bridge concept.

**What happened:** Near-zero transitivity (0.036). Hot--cold paths traverse the temperature gradient (warm, tepid, cool); hot--energy paths traverse physics terminology.

**Resolution:** Established that the temperature axis and physics-of-energy axis are parallel non-intersecting dimensions. Association is not navigation.

**Lesson:** Semantic association does not guarantee navigational intermediacy.

### G5 --- Phase 4: "Metaphor" as Language--Thought Bridge

**Hypothesis:** Bridge frequency of 0.50--1.00 for metaphor on language--thought. Metaphor is arguably the quintessential bridge between language and thought.

**What happened:** 0.00 for all four models. Zero appearances out of 80 runs. Yet transitivity was high (Claude 0.437) through "communication," "meaning," "cognition."

**Resolution:** Sharpened the bridge definition: bridges must name the primary axis of connection, not merely be associated with both endpoints.

**Lesson:** The biggest single prediction miss in the benchmark. Intuitive semantic importance has zero predictive power for navigational bridge behavior.

### G6 --- Phase 4: Concrete/Abstract as Gemini's Fragmentation Boundary

**Hypothesis:** The concrete/abstract axis predicts Gemini's bridge failures. Predicted Gemini success on tree--forest--ecosystem (concrete, hierarchical).

**What happened:** Gemini observed at 0.10. Bank--deposit--savings (abstract/financial) succeeds at 1.00.

**Resolution:** Replaced with frame-crossing hypothesis. Forest-to-ecosystem requires a scale transition (botanical to ecological), not an abstractness gradient.

**Lesson:** Concrete/abstract is too coarse. Frame membership is the relevant variable.

### G7 --- Phase 5: Gemini Cue-Strength Threshold

**Hypothesis:** Gemini has a measurably higher cue-strength threshold than other models.

**What happened:** Gemini's logistic threshold (1.79) is the lowest, not highest. CI on difference includes zero.

**Resolution:** The quantitative threshold model is falsified. The qualitative frame-crossing model survives.

**Lesson:** A correct qualitative model can generate incorrect quantitative predictions.

### G8 --- Phase 5: Plant > Germination (Intuitive Cue Strength)

**Hypothesis:** "Plant" (rated very-high cue strength) would bridge seed--garden at near-100%.

**What happened:** Complete inversion. Germination outperforms plant in all 4 models. Claude: 1.00 vs 0.00.

**Resolution:** Discovered the distinction between associative strength and navigational salience. Process-naming ("germination") outperforms object-naming ("plant").

**Lesson:** Human intuition about "most related" does not predict navigational routing. Calibrate empirically.

### G9 --- Phase 5: Dimensional Independence of Polysemy

**Hypothesis:** Same-axis bridge frequency would exceed cross-axis by at least 0.40.

**What happened:** Cross-axis mean (0.291) *higher* than same-axis (0.220). Driven by loan--bank--shore at 0.95--1.00.

**Resolution:** Polysemy creates forced crossing points, not dimensional walls. Cross-axis paths have no alternative to the polysemous bridge.

**Lesson:** The most reliable bridges are bottlenecks, not associations. Constraint produces reliability.

### G10 --- Phase 5: "Fire" as Control Bridge

**Hypothesis:** "Fire" would reliably bridge spark--ash as a non-polysemous control.

**What happened:** Near-zero frequency across all models. Fire is too central --- both endpoints already imply it.

**Resolution:** Established "too-central" as a new bridge failure mode (O6), distinct from off-axis (G5) and fragmentation.

**Lesson:** When both endpoints directly imply the candidate bridge, naming it adds no navigational information.

### G11 --- Phase 5: W-Shape Aggregate Prediction

**Hypothesis:** Bridge-present pairs show higher W-shape contrast than bridge-absent pairs in aggregate.

**What happened:** Bridge-present mean 0.0027, bridge-absent 0.0050. No aggregate signal.

**Resolution:** Effect is model-dependent and position-variable. Phase 6C redesigned the test as peak-detection.

**Lesson:** Aggregation can kill real signals when the effect is interaction-dependent.

### G12 --- Phase 6: Forced-Crossing Reduces Asymmetry

**Hypothesis:** Forced crossings would reduce asymmetry below the 0.811 baseline to 0.50--0.70.

**What happened:** Forced-crossing asymmetry 0.817, indistinguishable from baseline.

**Resolution:** Asymmetry is a global structural property, not modulated by local bottlenecks.

**Lesson:** A shared waypoint does not produce shared paths.

### G13 --- Phase 6: Semantic Distance Predicts Bridge Position

**Hypothesis:** Bridge position correlates with semantic distance ratio d(A,bridge)/d(A,C).

**What happened:** r = 0.239, p = 0.486. Irrelevant because bridges overwhelmingly anchor at positions 1--2.

**Resolution:** Position is determined by heading selection, not geometry.

**Lesson:** Navigational mechanics override geometric intuition.

### G14 --- Phase 6: Forced-Crossing Positional Stability

**Hypothesis:** Forced-crossing bridges have low positional variance (SD < 0.8).

**What happened:** SD = 1.71 vs 0.52 for non-forced. Forced crossings are the most positionally unstable.

**Resolution:** Frame-crossing timing is model-dependent. Obligatory bridges are mandatory but not positionally fixed.

**Lesson:** Obligatory $\neq$ stable.

### G15 --- Phase 7: Directional-Heading Theory (Strong Form)

**Hypothesis:** Incongruent pre-fills would produce more displacement than congruent pre-fills.

**What happened:** Displacement magnitudes indistinguishable: incongruent 0.515, congruent 0.436, neutral 0.536. CIs overlap.

**Resolution:** The mechanism is primarily associative primacy (whatever occupies position 1 anchors the trajectory) with secondary content modulation.

**Lesson:** Position matters more than content for displacement magnitude.

### G16 --- Phase 7: Polysemous Curvature

**Hypothesis:** Polysemous-vertex triangles show higher curvature (triangle excess) than non-polysemous triangles.

**What happened:** Difference 0.053, CI includes zero. Categories indistinguishable.

**Resolution:** Polysemy affects *which* concepts appear, not *how far apart* they are. Also, the cross-model distance metric failed validity (G17).

**Lesson:** Always validate the instrument before interpreting measurements.

### G17 --- Phase 7: Cross-Model Distance Validity

**Hypothesis:** Cross-model navigational distance correlation would exceed r = 0.50.

**What happened:** r = 0.170. Models assign wildly different distances to the same pairs. Some anti-correlate (Grok--Gemini r = --0.580).

**Resolution:** Navigational distances are fundamentally model-dependent. Blocks cross-model curvature comparison.

**Lesson:** Gait differences (R1) contaminate all attempts at shared distance metrics.

### G18 --- Phase 7: Too-Central as Binary Category

**Hypothesis:** "Too-central" bridges (fire, tree, dough) would show frequency < 0.15, cleanly separated from "obvious-useful" bridges.

**What happened:** Too-central mean 0.496. "Tree" has frequency 1.000 for 3/4 models.

**Resolution:** Only fire/water meet the strict operational definition. The original categorization was based on intuition.

**Lesson:** Human intuition about "too obvious" does not match model navigation.

### G19 --- Phase 7: Forced-Crossing Resists Pre-Fill

**Hypothesis:** "Bank" on loan--shore would survive pre-filling at > 0.90 frequency.

**What happened:** Survival 0.267, positional shift 0.791.

**Resolution:** Forced crossings are obligatory only under unconstrained navigation. Pre-filling displaces even "obligatory" bottlenecks.

**Lesson:** Obligatory $\neq$ robust under perturbation.

### G20 --- Phase 8: Route Exclusivity (Competitor Count)

**Hypothesis:** Bridges with more competitors show lower pre-fill survival ($\rho$ < --0.70).

**What happened:** $\rho$ = 0.116 (opposite direction). Sadness has 8 competitors yet highest survival.

**Resolution:** Competitor count ignores the distribution of traffic. A bridge with 8 weak competitors is more robust than one with 3 strong competitors.

**Lesson:** Quantity $\neq$ quality in the competitive landscape.

### G21 --- Phase 8: Gemini Gradient Blindness

**Hypothesis:** Gemini selectively fails on gradient-midpoint bridges (interaction $\geq$ 0.20).

**What happened:** Interaction 0.046 (null). Gemini's zeros concentrate on causal-chain pairs (6/10), not gradient pairs (1/10).

**Resolution:** Proposed transformation-chain blindness (G24).

**Lesson:** When the result is opposite to prediction, the categorization itself may be wrong.

### G22 --- Phase 8: Gait Normalization Rescues Distance

**Hypothesis:** Normalizing by model-specific baselines would raise cross-model distance correlation to r > 0.50.

**What happened:** Raw r = 0.212, normalized r = 0.212. Zero improvement. Pearson correlation is invariant to scalar division.

**Resolution:** Cross-model disagreement is ordinal, not scalar. Model-independent geometry is blocked.

**Lesson:** Always check whether a proposed fix is mathematically capable of addressing the pattern.

### G23 --- Phase 9: Dominance Ratio Predicts Fragility

**Hypothesis:** Bridge-to-competitor frequency ratio predicts survival ($\rho$ > 0.50).

**What happened:** $\rho$ = 0.157. Warm (ratio 1.00) is destroyed; fermentation (ratio 1.07) is bulletproof.

**Resolution:** Pre-fill content matters more than dominance ratio. Both single-variable structural predictors (G20, G23) have failed.

**Lesson:** Retrospective signals on small samples (N = 8) do not generalize.

### G24 --- Phase 9: Gemini Transformation-Chain Blindness

**Hypothesis:** Gemini shows a transformation deficit (mean < 0.30).

**What happened:** Gemini transformation mean 0.667 (vs predicted < 0.30). Result reversed from prediction.

**Resolution:** Third type-based Gemini characterization fails. Whatever pair type is designated as "hard," Gemini does relatively better on it.

**Lesson:** When a hypothesis fails backward in two successive tests, the classification itself is wrong. Abandon the type-based approach.

### G25 (partial) --- Phase 9: Pre-Fill Crossover Regression

**Hypothesis:** Significant negative slope predicting survival from unconstrained frequency; crossover at 0.40--0.50.

**What happened:** Slope --3.355 (correct direction) but CI includes zero. Crossover at 0.790 (far from predicted).

**Resolution:** Qualitative threshold survives (marginal facilitation, dominant displacement). Quantitative regression fails.

**Lesson:** Qualitative predictions succeed; quantitative predictions fail. The benchmark's defining pattern.

### G26 --- Phase 10: Bridge Generalization Fails (RESURRECTED)

**Hypothesis:** Bridge frequency CI would include zero for new models.

**What happened initially:** With Llama 8B only (1 model), CI excluded zero. Entered graveyard.

**What happened after:** Timeout relaxation (60s $\to$ 300s) recovered 3 additional models. With 4-model cohort, CI includes zero. Bridge structure generalizes.

**Resolution:** The original finding was an infrastructure artifact. Llama 8B's low bridge frequency (0.200) is a scale effect, not a generalization failure.

**Lesson:** Infrastructure limitations can masquerade as substantive findings. The sole resurrection in the graveyard.

### G27 --- Phase 10: Relation Class Ordering

**Hypothesis:** On-axis < unrelated < same-domain in $\geq$ 5/8 pairs.

**What happened:** Unrelated (0.388) < on-axis (0.643) $\approx$ same-domain (0.708). Only 1/8 pairs showed predicted ordering.

**Resolution:** The distinction is binary (related vs. unrelated), not three-way. Related pre-fills maintain navigational context.

**Lesson:** Coarse categorical distinctions capture phenomena; fine-grained orderings fail.

### G28 --- Phase 11: Control Pair Revision

**Hypothesis:** At least 2/4 new control candidates would pass screening.

**What happened:** 0/24 cells pass. Top frequencies 0.60--1.00. Retrospective: stapler--monsoon fails for all 12 models.

**Resolution:** R5 single-pair strict-threshold validation is fundamentally inadequate. LLMs navigate between any two concepts.

**Lesson:** LLMs have richer associative connectivity than human intuition predicts.

### G29 --- Phase 11: Asymmetry Universality Across Protocol

**Hypothesis:** Mean asymmetry > 0.60 under all protocol conditions.

**What happened:** 5-waypoint conditions: 0.594 (below threshold). 9-waypoint conditions: 0.669--0.684 (above).

**Resolution:** Asymmetry is resolution-dependent. R2 qualified: robust at $\geq$ 7 waypoints.

**Lesson:** Path length affects measurement sensitivity. Threshold calibration is resolution-dependent.
