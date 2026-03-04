# Phase 6 Analysis: Salience Landscapes, Asymmetry Nulls, and the Discovery of Early Anchoring

> Interpretive analysis of Phase 6: navigational salience mapping (6A), forced-crossing asymmetry (6B), and positional bridge scanning (6C).
>
> 1,200 new runs (6A) + 640 new runs (6B) + 240 new runs + 280 reused (6C) = 2,080 new API runs + 280 reused, across 4 models, 8 salience pairs, 8 asymmetry pairs, 10 positional pairs.
>
> March 2026

## Executive Summary

**Phase 6 produces one landmark discovery, one landmark failure, and one vindication of a Phase 5 anomaly -- and together they force a substantial revision of the bottleneck model of bridge navigation.** The landmark discovery is early anchoring: bridge concepts do not sit at the midpoint of paths, as Phase 5C's W-shape test assumed, but overwhelmingly anchor at positions 1 or 2 -- the very beginning of the navigational chain. The peak-detection contrast of 0.345 (CI [0.224, 0.459]) is robustly positive, vindicating the Phase 5C W-shape signal that the rigid midpoint assumption had obscured. The landmark failure is the forced-crossing asymmetry hypothesis (H4): forced crossings through polysemous bottlenecks do not reduce path asymmetry. The mean forced-crossing asymmetry (0.817) is statistically indistinguishable from the same-axis mean (0.810) and from the Phase 2 baseline (0.811). The bottleneck constrains which concepts appear on the path but does not constrain which direction you traverse it. The vindication is the salience landscape: waypoint frequency distributions are overwhelmingly heavy-tailed (7/8 pairs reject uniformity at Bonferroni-corrected significance), confirming H6 and grounding the bridge-as-bottleneck model in distributional data for the first time.

Phase 6's most telling results are the ones that reveal the limits of the bottleneck metaphor. Bridges are bottlenecks in the sense that navigational traffic concentrates through them -- the heavy-tail data makes this undeniable. But they are not bottlenecks in the sense that constraining the route constrains the directionality. And they are not midpoint anchors; they are starting-point anchors, positioned where the model first departs from the source concept. The mental model shifts from "bridge as narrow passage in the middle of a path" to "bridge as launching pad at the origin of navigation." This is a different kind of navigational infrastructure, and it changes what we should predict about path structure going forward.

Prediction accuracy in Phase 6 is mixed: 6A delivers 100% on its primary test (heavy-tail confirmation) but miscalibrates which model has highest entropy; 6B fails its primary hypothesis while correctly predicting Claude as the lowest forced-crossing asymmetry model; 6C confirms both of its primary predictions (peak-detection positive, peak exceeds fixed-midpoint) while failing on position-specific predictions and the forced-crossing stability hypothesis. The cumulative trend -- strong on structural/distributional predictions, weak on point predictions about specific values and positions -- is now stable across three phases.

---

## 1. Navigational Salience Is Heavy-Tailed

### What We Measured

Phase 6A was designed to answer the most important open question from Phase 5: can we measure navigational salience empirically rather than guessing at it? For each of 8 focal pairs, we collected 40 runs per model (1,200 total), extracted every intermediate waypoint, and computed the frequency distribution -- the salience landscape -- of each concept that appeared. The primary pre-registered test was whether these distributions depart from uniformity: if the bridge-as-bottleneck model is correct, a few concepts should dominate navigation while most appear rarely.

### The Heavy-Tail Test Passes Decisively

Seven of eight pairs reject uniformity at Bonferroni-corrected significance (KS test, p < 0.0063). The one exception -- seed-garden for Claude -- requires careful interpretation. Claude's seed-garden landscape contains only 5 unique waypoints, all at 100% frequency (cultivation, germination, root, sprout, and one additional). The KS test reports p = 1.000 because the distribution is perfectly uniform *over its support* -- every waypoint that appears does so at exactly the same frequency. This is a deterministic low-support vocabulary, not a heavy-tailed distribution in the standard sense. Claude's navigational rigidity here produces something more extreme than heavy-tailed: a fixed program with zero within-support variance. The landscape is not heavy-tailed but it is maximally concentrated -- navigational traffic passes through exactly 5 concepts and no others, which is consistent with the bridge-as-bottleneck model even though the distributional shape differs.

**[observed]** The waypoint frequency distribution departs significantly from uniformity for conceptual navigation. Across 32 salience landscapes (8 pairs, 4 models), navigational traffic concentrates in a small number of high-frequency waypoints while the long tail contains concepts that appear sporadically. The mean number of unique waypoints per landscape ranges from 5 (Claude on seed-garden) to 36 (GPT on light-color), but the top-3 waypoints consistently capture the majority of navigational mass. We upgrade H6 to [observed] rather than [robust] pending replication on a wider set of pairs and formal distribution fitting (power-law vs log-normal vs other heavy-tailed families). The KS rejection of uniformity establishes non-uniformity but does not confirm a specific distributional form.

### Claude's Extreme Peaking

Claude's salience landscapes are qualitatively different from other models'. Its mean entropy across all 8 pairs is 2.59, compared to GPT at 3.44, Grok at 3.40, and Gemini at 3.13. Claude uses fewer unique waypoints (mean ~8 per pair vs ~22 for GPT), and its top concepts frequently saturate at 1.00 frequency -- harmony, pattern, heat, drought, cultivation, germination, hue, refraction, spectrum, current, river, shore, cognition, concept, chilly, cool, tepid, warm. Claude does not explore; it locks onto a small repertoire and repeats it with near-perfect consistency.

This is the salience-space manifestation of Claude's Phase 1 gait (Jaccard 0.578, the highest). The rigid gait is not just about repeating the same ordered sequence of waypoints; it is about selecting from a narrower conceptual vocabulary. Claude's navigational landscape is not merely peaked -- it is almost deterministic. On seed-garden, the path is fully specified: every run produces the same 5 waypoints. On music-mathematics, harmony appears at 1.00, pattern at 0.975, symmetry at 0.875. The system is not sampling from a distribution; it is executing a fixed program.

### The GPT Entropy Surprise

Phase 6A's most unexpected finding is that GPT, not Grok, shows the highest entropy. We predicted Grok would be the most entropic navigator based on Phase 1's characterization of Grok as the second-most-variable model (Jaccard 0.293 vs GPT's 0.258). But GPT's mean entropy of 3.44 exceeds Grok's 3.40. The difference is small and may not be robust, but it is consistent across most pairs. GPT generates 36 unique waypoints on light-color (Grok: 27), 31 on music-mathematics (Grok: 26), 29 on bank-ocean (Grok: 15), and 23 on seed-garden (Grok: 20).

This suggests a revision to the Phase 1 gait interpretation. Phase 1 measured path-level consistency (Jaccard overlap between repeated runs), and GPT scored lowest. Phase 6A measures vocabulary breadth (how many distinct concepts appear across all runs), and GPT again scores lowest in terms of repetition -- highest in diversity. These are not the same measurement, but they converge: GPT's low Jaccard was not caused by random perturbation of a small vocabulary (which would produce moderate entropy) but by genuine exploration of a wide conceptual space (which produces high entropy). GPT is not noisy Claude; it is a fundamentally broader navigator, sampling from a richer distribution at the cost of run-to-run consistency.

Grok's entropy (3.40) is unexpectedly close to GPT's despite Grok's higher Phase 1 Jaccard (0.293 vs 0.258). Grok may navigate with moderate consistency on a moderate vocabulary -- less rigid than Claude, less expansive than GPT. Its Phase 1 variability may come from positional instability (same concepts in different orders) rather than vocabulary breadth (different concepts entirely). This distinction was invisible in Phase 1's Jaccard metric and only emerges in the frequency-distribution data of Phase 6A.

### Gemini's Financial Frame on Bank-Ocean

The most striking single result in 6A is Gemini's bank-ocean salience landscape. While Claude, GPT, and Grok all route bank-to-ocean through geographic concepts (river at 0.875-1.00, shore/estuary/coastline/sea at high frequency), Gemini routes through vault (0.950), treasure (0.775), gold (0.750), then transitions to island (0.550) and shoreline (0.525). Gemini's default sense of "bank" in the context of "ocean" is not the riverbank -- it is the treasure vault. The path goes: bank (financial institution) to vault to treasure to gold to island to shoreline to ocean.

This is the cleanest demonstration yet of Gemini's frame-crossing failure. It is not that Gemini cannot navigate to "ocean" -- it does reach geographic territory eventually (island, shoreline, tide). It is that Gemini's initial frame activation for "bank" is financial, and the model must find an indirect route from the financial frame to the ocean rather than the direct geographic route that other models take. The financial-to-geographic crossing happens through a narrative bridge (treasure and gold on islands) rather than the geographic bridge (riverbank to river to estuary to ocean) that the other three models use.

This result strengthens the qualitative frame-crossing hypothesis (H1) yet again. Gemini does not lack the geographic concepts -- it lacks the frame activation that would select the geographic sense of "bank" when the target is "ocean." The fact that Gemini routes through "island" and "shoreline" at 0.55 and 0.525 proves these concepts are in its vocabulary; they are simply not activated by the initial bank-ocean frame.

### Retroactive Calibration: Intuition Remains Unreliable

The retroactive calibration test compared our intuitive top-bridge predictions against the empirical top-1 waypoints. Only 3 of 6 matched: heat=heat (yes), sadness=sadness (yes), river=river (yes), but plant was wrong (germination wins), spectrum was wrong (wavelength wins overall, though spectrum is top for 2 of 4 models), and harmony was wrong (rhythm wins in aggregate). The 50% match rate is consistent with Phase 5's finding that intuitive cue-strength ratings are unreliable predictors of navigational salience. The intuition is right for the most prototypical cases (heat connects sun and desert, sadness connects emotion and melancholy) and wrong for cases where the navigational mechanism is more specific than the obvious association.

The spectrum/wavelength split is illuminating. Our Phase 4 finding was that "spectrum" bridges light to color at 1.00 for all models. The Phase 6A salience landscape reveals that "spectrum" is indeed the top waypoint for Claude and Gemini on light-color, but "wavelength" is the top waypoint for GPT and Grok. The concept we identified as universal in Phase 4 is actually model-dependent in the wider salience landscape. Phase 4's bridge-frequency test asked "does spectrum appear anywhere on the path?" (answer: yes, universally). Phase 6A's salience test asks "what is the most frequent waypoint?" (answer: model-dependent). These are different questions, and the difference matters for understanding navigational structure.

### 190 Novel Waypoints

Phase 6A discovered 190 waypoints appearing at >20% frequency that had never been identified as bridge concepts in prior phases. A caveat: some of these are likely typo/variant artifacts from model outputs (e.g., "seedle" and "saple" appear in the raw data, likely intended as "seedling" and "sapling"). The 190 count should be treated as an upper bound pending typo/variant clustering. Many of the genuine entries are unsurprising (drought, dune, sprout, hue, mood), but some reveal navigational routes that would not have been predicted: Grok routes music-mathematics through "fourier analysis" (0.375) and "waveform" (0.275); Gemini routes it through "set theory" (0.550) and "topology" (0.275); Claude routes language-thought through "mental representation" (0.700). These are technically specific concepts that a human navigator might not produce but that reflect genuine mechanistic connections between the endpoints. The models are not just associating; they are, at least sometimes, routing through the actual explanatory machinery.

---

## 2. The Forced-Crossing Asymmetry Hypothesis Fails

### The Prediction

Hypothesis H4, proposed at the end of Phase 5, stated that forced crossings should reduce path asymmetry. The logic was straightforward: if "bank" is the only route from loan to shore, it should also be the only route from shore to loan. The bottleneck constrains both directions equally, so forward and reverse paths should converge more than paths through open conceptual terrain. Specifically, we predicted that bank-mediated forced-crossing pairs would show asymmetry in the range 0.50-0.70, well below the Phase 2 baseline of 0.811.

### The Result: No Reduction

The forced-crossing mean asymmetry is 0.817 (CI [0.743, 0.877]). The same-axis mean is 0.810 (CI [0.744, 0.878]). The difference is 0.007 (CI [-0.098, 0.094]), comfortably including zero. The forced-crossing asymmetry is statistically indistinguishable from both the same-axis control and the Phase 2 baseline (0.811). **H4 is falsified.**

This is not a marginal failure. The predicted bank-mediated asymmetry range was 0.50-0.70; the observed value is 0.812, outside the range by more than 0.10. The confidence interval does not approach the predicted range. There is no subgroup, no model, no pair for which forced crossings reliably reduce asymmetry below baseline.

### Why the Bottleneck Model Was Wrong About Directionality

The falsification of H4 forces a revision of what "bottleneck" means in navigational topology. The bottleneck model predicted that if traffic must pass through point B on the A-to-C path, it must also pass through B on the C-to-A path, and therefore the two paths should overlap more. This prediction assumed that the bottleneck constrains the *route* identically in both directions.

The data shows this is wrong, and the reason is illuminated by Phase 6A's salience data. Consider loan-shore: the forward path (loan to shore) must pass through bank, but it does not merely pass through bank -- it passes through a sequence of waypoints that are ordered by the *forward* navigational gradient. Loan activates financial concepts first, then the polysemous bridge "bank" pivots to geographic concepts, then geographic concepts cascade toward "shore." The reverse path (shore to loan) must also pass through bank, but it activates geographic concepts first, then pivots to financial concepts. The bridge concept is the same, but everything else about the path -- the activation sequence, the specific waypoints before and after the bridge, their order -- is determined by the starting point.

The bottleneck constrains *which concept* appears on the path. It does not constrain the *surrounding navigational context*. And Jaccard asymmetry measures the full path, not just the bridge position. Two paths that both pass through "bank" but differ in every other waypoint will show high asymmetry despite sharing the bottleneck. The quasimetric property is not a property of the bridge; it is a property of the entire path structure. Forcing a shared bridge into two paths does not make the paths converge.

**[observed]** Path asymmetry is a global property of navigational structure, not modulated by local bottlenecks. This extends R2 (quasimetric space): the asymmetry is not merely present in aggregate but is resistant to manipulation by forced-crossing topology. The 0.811 asymmetry baseline, first measured in Phase 2, holds steady even when the most constrained possible paths (forced crossings with 0.95-1.00 bridge frequency) are analyzed. Whether this constitutes a fundamental constant or is specific to the tested pairs requires replication across a broader set of forced-crossing configurations before upgrading to [robust].

### The Gemini Surprise

The per-model analysis reveals a striking anomaly. For Claude, GPT, and Grok, forced-crossing asymmetry is slightly *higher* than same-axis (non-Gemini mean: FC 0.831 vs SA 0.774, a difference of -0.058 in the wrong direction). For Gemini alone, forced-crossing asymmetry is *lower* than same-axis by 0.146 (FC 0.775 vs SA 0.920). This is the opposite of what we predicted for Gemini -- we expected Gemini to show no reduction because its topological disconnection should prevent the forced-crossing mechanism from operating.

Instead, Gemini shows the only model-level reduction in the entire experiment. One interpretation: Gemini's paths are so constrained when they must cross between disconnected frames that the constraint actually does reduce directional variance -- but only because Gemini's same-axis asymmetry is anomalously high (0.920, the highest of any model). Gemini's forced-crossing reduction may not reflect a genuine bottleneck effect but rather a regression toward the mean from an unusually asymmetric baseline. With only 4 forced-crossing pairs per model (10 runs each), this is underpowered to distinguish the explanations.

### Loan-Shore: The Unexpected Stability

Loan-shore emerges as the most positionally stable forced-crossing pair. All four models show asymmetry in the tight range 0.826-0.852 (Claude 0.826, GPT 0.843, Grok 0.852, Gemini 0.846). This is remarkable given the typical model-to-model variance. For comparison, deposit-river shows a range of 0.422 (Gemini) to 0.922 (GPT) -- a spread of 0.500. Loan-shore's spread is 0.026.

This stability suggests that the loan-shore path is structurally determined by the pair, not by the model. The forced-crossing bottleneck through "bank" may not reduce asymmetry, but it does reduce model-to-model variance. All four models are forced through the same narrow passage, and this passage imposes a characteristic asymmetry of approximately 0.84 regardless of the model's navigational gait. This is a new observation: **forced crossings standardize asymmetry across models even though they do not reduce it within models.** The bottleneck homogenizes the inter-model distribution without shifting the mean.

### Deposit-River: The Model Variance Extreme

Deposit-river is the opposite of loan-shore: Claude at 0.599, GPT at 0.922, Grok at 0.912, Gemini at 0.422. Claude and Gemini show unusually low asymmetry (below 0.60), while GPT and Grok show unusually high asymmetry (above 0.90). This pair requires navigating from the financial sense of "deposit" to the geographic sense of "river," crossing through "bank" in both directions. The extreme model variance suggests that the forced-crossing mechanism operates very differently depending on how cleanly the model resolves the polysemous pivot.

Claude's low asymmetry (0.599) on deposit-river is the lowest forced-crossing asymmetry observed for any model-pair combination. This is consistent with Claude's rigid navigational gait: Claude may lock onto the same crossing path in both directions with more overlap than flexible navigators like GPT and Grok. Gemini's low asymmetry (0.422) may reflect a different mechanism -- perhaps Gemini's fragmented topology produces similarly sparse paths in both directions, yielding overlap by elimination rather than by shared structure.

---

## 3. Bridge Concepts Anchor Early, Not at the Midpoint

### The Phase 5C Vindication

Phase 5C's W-shape test was the most conspicuous failure of Phase 5: the aggregate W-shape contrast was 0.0027, indistinguishable from zero. But the analysis noted that individual signals were strong (Claude at 0.52 on music-mathematics) and that the rigid midpoint assumption might be obscuring real positional structure. Phase 5's open question 9c proposed a peak-detection scanning approach that would search all positions for convergence peaks rather than pre-specifying position 4.

Phase 6C implements exactly this test, and the result is unambiguous. The peak-detection mean contrast is 0.345 (CI [0.224, 0.459]), robustly positive. The fixed-midpoint contrast on the same data is -0.080 (CI [-0.141, -0.024]), actually negative. The difference between the two approaches is 0.425 (CI [0.265, 0.586]). The bridge-as-positional-anchor hypothesis was never wrong -- it was being tested at the wrong position.

**[observed]** Bridge concepts create genuine positional anchors in navigational paths. The peak-detection contrast is positive and significant across the tested pairs, generalizing the Phase 5C finding (O7, observed for Claude individually) to a broader pattern detectable across all models when the correct methodology is applied. The Phase 5C null was a methodological artifact, not a substantive finding. Note: the modal positions reported throughout this analysis are 0-indexed (position 0 = first waypoint, position 6 = last). When we say bridges anchor at "position 1-2," this corresponds to the 2nd and 3rd waypoints in a 7-waypoint path -- still early in the sequence, well before the midpoint (position 3). Upgrading to [robust] awaits replication with the Phase 7A causal test and verification of the indexing sensitivity (whether position 0 shows bridge activity that the current peak-detection excludes).

### The Early-Anchoring Pattern

The most surprising aspect of the positional data is not that bridges anchor at predictable positions -- it is *where* they anchor. Across all 10 pairs and 4 models (40 positional profiles), the modal bridge position is overwhelmingly early: position 1 or 2 in a 7-waypoint path (positions indexed from 1 to 7, where 1 is closest to the starting concept and 7 is closest to the target).

The cross-model modal positions are: light-color 1.25, bank-savings 1.25, music-mathematics 1.50, tree-ecosystem 1.25, sun-desert 1.25, seed-garden 1.25, emotion-melancholy 2.25, loan-shore 2.00, deposit-river 2.00. Only animal-poodle breaks the pattern with a cross-model modal position of 4.50.

This is not what any version of the bridge hypothesis predicted. Phase 5's W-shape test assumed bridges would anchor at position 4 (the midpoint). Phase 6C's own predictions placed bridges at positions 2-6 depending on the pair. The data says: almost all bridges anchor at the very beginning of the path. The concept that "bridges" two endpoints is not encountered in the middle of the journey; it is the first step the model takes.

### Why Bridges Anchor Early

The early-anchoring pattern reframes what a bridge concept is in navigational terms. The standard metaphor -- a bridge sits between two landmasses, connecting them from the middle -- is wrong. The correct metaphor is a compass heading: the bridge concept is the first waypoint selected because it establishes the direction of travel. When navigating from music to mathematics, the model does not wander through musical territory, encounter "harmony" in the middle, and then transition to mathematical territory. Instead, the model selects "harmony" (or "rhythm" or "pattern") immediately as the directional heading from music toward mathematics, and the rest of the path fills in the details.

This is consistent with the greedy forward-search hypothesis (H2). If models navigate by chaining forward from the starting concept, the bridge concept -- the one that most efficiently points toward the target -- should be selected early, when the navigational gradient from start to target is steepest. By position 4 or 5, the model is already deep in the target's conceptual neighborhood and no longer needs the bridge as a directional guide. The bridge is a steering mechanism, not a crossing point.

The Phase 5 finding about directional information content (H3) acquires new specificity in light of early anchoring. "Germination" moves the seed-garden path forward because it establishes the growth direction from position 1. "Harmony" moves the music-mathematics path forward because it establishes the mathematical-structure direction from position 1 or 2. The directional information is most valuable at the beginning of the path, when the model is farthest from the target and most in need of a heading. By the midpoint, the model is close enough to the target that direct association takes over and the bridge is no longer needed.

### The Animal-Poodle Exception

Animal-poodle is the only pair where the bridge (dog) anchors late: position 4-5 across all models (Claude 4, GPT 5, Grok 5, Gemini 4). The cross-model modal position is 4.50 -- the midpoint, exactly where Phase 5C's W-shape test would have looked for it.

Why is animal-poodle different? The answer is taxonomic directionality. Animal-to-poodle is a downward traversal of a taxonomic hierarchy: from the most general category (animal) to the most specific instance (poodle). The natural path is: animal to mammal to pet/canine to dog to breed to poodle. "Dog" occupies the intermediate taxonomic level, which is positioned in the middle of the sequence by the structure of the hierarchy, not by navigational mechanics. The bridge is mid-path because the hierarchy is mid-level, not because mid-path is the default bridge position.

This exception clarifies the early-anchoring rule. For most pairs -- where the relationship between endpoints is not taxonomically structured -- the bridge functions as a directional heading and anchors early. For taxonomic pairs, the bridge functions as an intermediate category and anchors at the hierarchically appropriate position. The position is pair-determined, but the determining factor is the type of semantic relationship, not the semantic distance ratio.

### Semantic Distance Does Not Predict Position

The position-prediction correlation is r = 0.239 (p = 0.486), far from significant. The expected position ratio (d(A,bridge)/d(A,C)) does not predict the observed modal position. This is a direct falsification of H5, which proposed that bridge position correlates with semantic distance ratios.

The failure is unsurprising given the early-anchoring discovery. If most bridges anchor at position 1-2 regardless of their semantic distance from the endpoints, then distance ratios cannot predict position because there is almost no positional variance to predict. The bridges are compressed against the start of the path, and the semantic distance to the target is filled by other waypoints. The semantic distance ratio might predict the relative ordering of *non-bridge* waypoints, but it is irrelevant to bridge position because bridge position is determined by a different mechanism (directional heading selection) that operates at a fixed point in the navigational sequence.

---

## 4. Forced-Crossing Bridges Are Positionally Unstable

### The Finding

Phase 6C's forced-crossing analysis reveals that forced-crossing bridges show *higher* positional variance across models, not lower. The positional SD for forced-crossing pairs (loan-shore, deposit-river) is 1.71, compared to 0.52 for non-forced pairs. This is the opposite of the prediction (SD < 0.8 for forced crossings) and the opposite of the bottleneck model's expectation.

The specific cases are telling. Loan-shore shows "bank" at position 1 for Claude, position 2 for GPT, position 1 for Grok, but position 4 for Gemini -- a spread that gives SD = 1.41. Deposit-river is worse: Claude places "bank" at position 5, GPT at position 1, Grok at position 1, and Gemini at position 1, giving SD = 2.00. These are the only two "model-dependent" pairs in the entire positional analysis (SD > 1.0), and they are both forced-crossing pairs.

### Connection to Phase 6B

This result connects directly to the Phase 6B finding about bridge positional consistency. Phase 6B measured whether the bridge concept appears at the same position (within one step) in forward versus reverse paths, and found only 17% consistency -- far below the predicted 70%. Phase 6C shows that the bridge does not even appear at the same position across *models*, let alone across directions. The forced-crossing bridge "bank" is positionally volatile.

### Why Forced Crossings Are Positionally Unstable

The explanation synthesizes the early-anchoring finding with the nature of polysemy. For non-forced pairs, the bridge concept typically comes from the same semantic domain as the starting concept and anchors at position 1 or 2 by the directional-heading mechanism. Harmony is a musical concept selected early when departing from music. Germination is a growth concept selected early when departing from seed. The bridge's semantic proximity to the starting concept gives it a natural early position.

For forced-crossing pairs, the bridge concept (bank) sits at the *junction* of two semantic domains, and its positional placement depends on which domain the model activates first. If the model departs from "loan" and immediately activates the financial sense of bank, the bridge anchors early (position 1). If the model departs from "loan" by exploring financial concepts (interest, credit, money) before reaching the polysemous pivot, the bridge anchors later (position 3-5). The initial frame activation -- which is model-dependent and partially stochastic -- determines when the polysemous crossing occurs, and therefore where the bridge lands.

Claude's position 5 for bank on deposit-river is especially notable. Claude, the most rigid navigator, places the polysemous crossing *last* on this pair -- the bridge comes at the end rather than the beginning. This suggests Claude navigates deposit-river by departing into financial territory (positions 1-4) and only crossing to the geographic sense at the boundary. Claude's rigidity, which usually produces early and stable bridge placement, here produces late placement because the forced crossing requires frame-switching that Claude's deterministic navigation defers as long as possible.

**[observed]** Forced-crossing bridges are positionally unstable because polysemous pivot points occupy frame junctions, and the timing of frame-crossing is model-dependent. This contrasts with same-domain bridges, which anchor early and consistently because they activate within the starting concept's frame. The distinction between same-domain and cross-domain bridge positioning is a new dimension of the bridge taxonomy.

---

## 5. Cross-Model Agreement: Pair-Determined with Polysemous Exceptions

### The Agreement Structure

Phase 6A's cross-model top-3 agreement (mean Jaccard ~0.26) is low but structured. Hot-cold shows the highest agreement (0.433) and bank-ocean the lowest (0.150). The pattern is consistent with a model where the semantic pair determines the approximate waypoint vocabulary while each model selects from that vocabulary with its characteristic gait.

Phase 6C's positional agreement data makes this more precise. Eight of ten pairs are "pair-determined" (cross-model positional SD < 1.0): the bridge anchors at approximately the same position regardless of the model. Only the two forced-crossing pairs (loan-shore SD 1.41, deposit-river SD 2.00) are "model-dependent." This is a clean separation: non-polysemous bridges are pair-determined in position; polysemous bridges are not.

The pair-determination finding extends R1 (models have distinct gaits) with a complementary observation: **despite distinct gaits, models converge on bridge positioning for non-polysemous pairs.** The gait determines *which* waypoints appear and *how many*; the pair determines *where* the bridge lands. This is a cleaner decomposition of navigational structure than anything available from prior phases.

### The Hot-Cold Consensus

Hot-cold is the most consensual pair in the entire salience landscape. Three of four models place "chilly," "cool," and "warm" in their top-3; Gemini partially overlaps, with tepid, frigid, and warm as its top-3 (substituting more specific temperature terms for the common ones). The antonym pair produces a shared temperature gradient that all models navigate similarly, though Gemini's vocabulary choices differ at the margins. This is consistent with Phase 3A's finding that antonyms show distinctive convergence patterns (axis-as-funnel) -- the conceptual continuum between two poles is sufficiently constrained that all models traverse it in approximately the same way.

Cross-model Jaccard for hot-cold (0.433) is the highest agreement observed for any pair in Phase 6A. For comparison, the Phase 1 cross-model Jaccard mean was approximately 0.18. The antonym gradient nearly triples cross-model agreement. This is a measurable instance of semantic structure imposing convergence across architecturally distinct models.

---

## 6. Prediction Accuracy: Phase 6 Scorecard

### Phase 6A Predictions

| # | Prediction | Result | Verdict |
|---|-----------|--------|---------|
| P1 | Bridge-present pairs: top waypoint >30% freq | 24/24 (100%) | Confirmed |
| P2 | Bridge-absent pairs: top waypoint <15% freq | 0/8 | Failed |
| P3 | Universal bridge Jaccard 0.40-0.70, variable 0.10-0.40 | universal=0.24, variable=0.23 | Failed |
| P4 | Germination > plant on seed-garden | 4/4 models | Confirmed |
| P5 | At least one novel waypoint at >20% freq | YES (190 found) | Confirmed |
| P6 | Claude lowest entropy, Grok highest | lowest=Claude (2.59), highest=GPT (3.44) | Half correct |

Phase 6A hits its primary structural predictions (heavy tail, novel waypoints, germination > plant) and misses its quantitative calibration predictions (Jaccard ranges, which model is highest entropy). The pattern is now familiar: we can predict the qualitative shape of the distribution but not the precise values or the model rankings within that shape.

The P2 failure is instructive. "Bridge-absent" pairs were defined as pairs without a previously identified bridge concept, but Phase 6A reveals that *every* pair has high-frequency waypoints whether or not we had previously identified a "bridge." The distinction between bridge-present and bridge-absent was an artifact of our prior knowledge, not a property of the pairs. Hot-cold was classified as bridge-absent (no single concept bridges hot and cold in our Phase 4 taxonomy), but all models produce "warm," "cool," and "chilly" at 100% frequency. The hot-cold temperature gradient is as much a bridge as "spectrum" is for light-color; we simply had not named it.

### Phase 6B Predictions

| # | Prediction | Result | Verdict |
|---|-----------|--------|---------|
| P1 | Bank-mediated FC asymmetry 0.50-0.70 | 0.812 | Failed |
| P2 | Photon-heavy asymmetry 0.75-0.90 (baseline) | 0.833 | Confirmed |
| P3 | Same-axis asymmetry ~0.811 (baseline) | 0.810 | Confirmed |
| P4 | Gemini shows no FC asymmetry reduction | Reduction = 0.146 | Failed (opposite) |
| P5 | Bridge at +/-1 position in >70% of runs | 17% | Failed |
| P6 | Claude lowest FC asymmetry | Claude = 0.721 (lowest) | Confirmed |

Phase 6B's central hypothesis (P1) fails, and the Gemini prediction (P4) produces the opposite of the expected result. The baseline predictions (P2, P3) succeed -- we can calibrate where asymmetry *should* be when nothing is manipulated. The Claude prediction (P6) succeeds, consistent with the broader pattern that model-ranking predictions based on gait characterization work better than mechanistic predictions about what should move the needle.

### Phase 6C Predictions

| # | Prediction | Result | Verdict |
|---|-----------|--------|---------|
| P1 | Peak-detection contrast > 0.05, CI excludes zero | 0.345, CI [0.224, 0.459] | Confirmed |
| P2 | Peak exceeds fixed-midpoint by >= 0.03 | Difference = 0.425 | Confirmed |
| P3 | Heat at positions 2-3 on sun-desert | Modal = 1 | Marginal |
| P4 | Germination at positions 3-5 on seed-garden | Modal = 1 | Failed |
| P5 | Sadness at positions 4-6 on emotion-melancholy | Modal = 2 | Failed |
| P6 | Modal position correlates with distance ratio (r > 0.50) | r = 0.239 | Failed |
| P7 | FC bridge SD < 0.8 | SD = 1.71 | Failed |
| P8 | Claude lowest positional variance | Lowest = GPT | Failed |

Phase 6C hits both of its primary methodological predictions (peak-detection works, peak exceeds fixed-midpoint) and misses all five of its specific quantitative predictions. The position-specific predictions (P3-P5) all expected bridges to anchor later than they actually do, because they were calibrated against the midpoint hypothesis rather than the early-anchoring pattern that the data reveals. This is the benchmark at its most productive: the primary test succeeds (there IS positional structure), and the secondary tests fail in a way that reveals something new (the structure is early-anchored, not mid-anchored).

### Cumulative Prediction Scorecard

| Phase | Accuracy | Type of Predictions |
|-------|----------|-------------------|
| Phase 4B | 81.3% (26/32) | Which models find which bridges |
| Phase 5A | 64.6% (31/48) | Cue-strength gradients |
| Phase 5B | 42.9% (24/56) | Dimensionality and polysemy |
| Phase 6A | 50.0% (3/6) | Salience distributions |
| Phase 6B | 50.0% (3/6) | Forced-crossing asymmetry |
| Phase 6C | 25.0% (2/8) | Positional bridge structure |

**[observed]** The prediction degradation trend (O3) continues but stabilizes. Phase 6 averages approximately 40% across its 20 individual predictions. The pattern is now clear enough to characterize precisely: structural/distributional predictions (heavy tails exist, peak-detection works, baselines are correct) succeed at ~80%. Quantitative point predictions (specific ranges, model rankings, position values) succeed at ~25%. The benchmark predicts the shape of things better than it predicts the magnitudes.

This is not a failure of the benchmark. It is a statement about what is predictable from the current evidence base. The topology is coarse-grained: we know the approximate geometry (heavy-tailed, asymmetric, early-anchored, pair-determined) but not the fine structure (specific positions, model rankings, numerical values). Moving from coarse to fine prediction will require either much larger samples or new theoretical frameworks that explain the variance.

---

## 7. Connections to Prior Phases

### Which Robust Claims Survive Phase 6

All seven robust claims (R1-R7) survive Phase 6 without revision, and two are strengthened:

**R1 (model gaits)** is enriched by the salience-space characterization. Claude's gait is not just "high Jaccard" but "low entropy, narrow vocabulary, near-deterministic waypoint selection." GPT's gait is not just "low Jaccard" but "high entropy, broad vocabulary, genuine exploration." Phase 6A adds a new dimension to the gait concept.

**R2 (quasimetric asymmetry)** is strengthened by Phase 6B's null result. The asymmetry is not merely present; it is resistant to manipulation by forced-crossing topology. The 0.811 baseline is confirmed as a structural constant.

**R6 (bridges are bottlenecks)** requires clarification. Bridges concentrate navigational traffic (confirmed by 6A's heavy tails) but do not constrain directionality (falsified by 6B). The bottleneck metaphor needs refinement: bridges are more like attractors (pulling traffic toward them regardless of direction) than like narrow passages (forcing traffic through a fixed corridor).

**R7 (cue-strength gradient)** is confirmed by 6A's retroactive calibration but shown to be noisier than previously appreciated (3/6 intuitive matches).

### Which Hypotheses Are Resolved

**H4 (forced crossings reduce asymmetry): FALSIFIED.** Phase 6B directly tests and falsifies this hypothesis. The forced-crossing mean asymmetry (0.817) is indistinguishable from baseline (0.811). This is a clean kill. H4 moves to the graveyard.

**H5 (bridge position correlates with distance ratios): FALSIFIED.** Phase 6C finds r = 0.239 (p = 0.486). The distance ratio does not predict bridge position. H5 moves to the graveyard.

**H6 (heavy-tailed distributions): CONFIRMED.** Phase 6A's 7/8 KS test results confirm the heavy-tail hypothesis. H6 is promoted from hypothesis to observed claim (O11), pending formal distribution fitting and replication on wider pair sets before further upgrade.

### Which Hypotheses Are Refined

**H1 (frame-crossing for Gemini)** receives additional support from Gemini's bank-ocean financial routing (vault-treasure-gold) but is complicated by Gemini's unexpected forced-crossing asymmetry reduction in 6B. The qualitative version remains well-supported; the model's behavior under forced crossings is not yet fully characterized.

**H2 (greedy forward search)** is strengthened by the early-anchoring discovery. If models navigate by forward chaining with target-influenced frame activation, the bridge-as-directional-heading at position 1-2 is exactly what we should expect. The bridge is the first concept that satisfies both "reachable from A" and "oriented toward C."

**H3 (directional information content)** acquires positional specificity. The directional information is most valuable at the path's beginning, explaining why high-salience bridges (those with the most directional information) anchor earliest.

### New Observations

**O11. Waypoint frequency distributions depart significantly from uniformity.** [observed] -- Phase 6A, 7/8 pairs reject uniformity. Traffic concentrates in a small number of high-frequency waypoints. Formal distributional fitting (power-law vs log-normal) deferred.

**O12. Bridge concepts anchor early (position 1-2), not at the midpoint.** [observed] -- Phase 6C, 40 positional profiles, 8/10 pairs show cross-model modal position at 1-2. Exception: animal-poodle (taxonomic hierarchy, modal position 4.5).

**O13. Forced-crossing bridges are positionally unstable.** [observed] -- Phase 6C, positional SD for forced-crossing pairs (1.71) is 3.3x higher than non-forced pairs (0.52). Both forced-crossing pairs are the only model-dependent pairs in the positional analysis.

**O14. Forced crossings standardize inter-model asymmetry without reducing it.** [observed] -- Phase 6B, loan-shore asymmetry range 0.026 across models (vs 0.500 for deposit-river). The bottleneck homogenizes model-to-model variance on some pairs without lowering the mean asymmetry.

---

## 8. The Bridge Taxonomy, Further Revised

Phase 6 data warrants a substantial revision of the bridge taxonomy, adding positional behavior as a new dimension alongside frequency and mechanism:

| Bridge Type | Example | Frequency Range | Typical Position | Positional SD | Mechanism |
|-------------|---------|----------------|-----------------|---------------|-----------|
| Process-naming | germination (seed-garden), spectrum (light-color) | 0.15-1.00 | Position 1-2 | 0.50 | Names the transformation; selected as directional heading |
| Forced crossing | bank (loan-shore) | 0.95-1.00 (non-Gemini) | Position 1-4 | 1.41-2.00 | Only connection between domains; positionally volatile |
| Within-frame sequential | deposit (bank-savings), sentence (word-paragraph) | 0.90-1.00 | Position 1-2 | 0.50 | Tight cue chain; anchors like process-naming |
| Temperature gradient | warm/cool/chilly (hot-cold) | 0.60-1.00 | Position 1-3 | Low (0.50) | Continuous scale, high cross-model consensus |
| Taxonomic hierarchical | dog (animal-poodle) | 0.30-0.90 | Position 4-5 | 0.58 | Intermediate category; position reflects hierarchy level |
| Concrete hierarchical | forest (tree-ecosystem) | 0.00-1.00 (model-dependent) | Position 1-2 | 0.50 | Part-whole with scale transition |
| Abstract affective | nostalgia (emotion-melancholy), sadness (emotion-melancholy) | 0.00-1.00 (model-dependent) | Position 2-3 | 0.50 | Loose cue structure, many alternatives |
| Too-central | fire (spark-ash), plant (seed-garden) | 0.00-0.65 | N/A | N/A | Bridge implied by endpoints, skipped |
| Off-axis | metaphor (language-thought), energy (hot-cold) | 0.00 | N/A | N/A | Bridge on wrong conceptual dimension |

The new entries are the "temperature gradient" type (a continuous scale producing high-consensus bridging, newly discovered in 6A) and the positional dimension for all types. The key taxonomic insight from Phase 6 is that bridge type predicts not just frequency but positional behavior: process-naming and within-frame bridges anchor early and stably; forced-crossing bridges anchor variably; taxonomic bridges anchor at the hierarchically appropriate position.

The "forced crossing" type has a revised characterization. In Phase 5, forced crossings were the highest-frequency bridges in the benchmark. In Phase 6, they are shown to be high-frequency but positionally unstable and directionally symmetric (they do not reduce asymmetry). The forced-crossing bridge is a mandatory waypoint but not a structural anchor -- it must appear somewhere on the path but its position floats. This distinguishes it from process-naming bridges, which are both mandatory and structurally anchored.

---

## 9. Methodological Reflections

### The Peak-Detection Vindication

The single most important methodological lesson of Phase 6 is that the peak-detection approach to positional analysis works and the fixed-midpoint approach does not. The difference in contrast (0.425, CI [0.265, 0.586]) between the two methods is the largest methodological effect in the benchmark. Phase 5C's W-shape null was not evidence against positional anchoring; it was evidence that midpoint anchoring is the wrong model.

This has implications beyond this benchmark. Any study of bridge or waypoint positioning in LLM outputs should scan all positions rather than pre-specifying a location. The temptation to test "is the bridge at the midpoint?" is strong because midpoint anchoring is the intuitive model, but the data overwhelmingly favors early anchoring. Future experiments should use peak-detection as the default and report the full positional profile.

### Sample Size Concerns in Phase 6B

Phase 6B used 10 runs per direction per pair per model. With 4 forced-crossing pairs and 4 same-axis pairs, the primary comparison is between 16 and 16 group means, each estimated from 10 runs. The effect of interest (asymmetry reduction) was predicted to be 0.10-0.30, but the observed standard deviation of asymmetry within groups is approximately 0.15. A sample of 10 runs per cell gives ~80% power to detect an effect of 0.15 within a single model-pair combination, but the primary test aggregates across model-pair combinations and relies on the cross-combination variance, which is much larger than within-combination variance.

The null result is likely genuine -- the point estimate (0.007) is extremely close to zero, not merely non-significant. But the wide confidence interval ([-0.098, 0.094]) means we cannot rule out small effects in either direction. A future test with 40+ runs per cell could detect an effect of 0.05 if one exists. Whether such a small effect would be theoretically interesting is debatable.

### The Value of Negative Results

Phase 6 adds two entries to the graveyard (H4 and H5) and these are among the most informative results in the phase. The falsification of H4 fundamentally changes what we understand about the relationship between bottleneck topology and directional asymmetry. The falsification of H5 eliminates a simple geometric model of bridge positioning and forces the more nuanced early-anchoring framework. Both negative results redirect the theoretical program more effectively than confirmatory results would have.

### Gemini's Bank-Ocean Routing as Validation

Gemini's vault-treasure-gold routing on bank-ocean is not just an interesting anomaly -- it serves as a natural experiment validating the salience landscape methodology. If the methodology were simply capturing word associations, all models should produce similar landscapes. The fact that Gemini's landscape is qualitatively different (financial frame vs geographic frame) demonstrates that the salience mapping captures genuine differences in navigational structure, not just vocabulary frequency.

---

## 10. The Graveyard, Updated

Phase 6 adds three new entries:

**G13. Forced crossings reduce path asymmetry (H4).** Predicted that polysemous bottlenecks would constrain both directions equally, reducing quasimetric asymmetry. Observed: forced-crossing asymmetry (0.817) is indistinguishable from baseline (0.811). The bottleneck constrains which concepts appear but not the directional structure of the surrounding path. Killed by Phase 6B.

**G14. Bridge position correlates with semantic distance ratios (H5).** Predicted that d(A,bridge)/d(A,C) would predict the bridge's position in the path. Observed: r = 0.239 (p = 0.486). The distance ratio is irrelevant because bridges anchor at position 1-2 regardless of distance, except for taxonomic pairs. Killed by Phase 6C.

**G15. Forced-crossing bridges are positionally stable.** Predicted that the obligatory nature of forced-crossing bridges would produce low positional variance (SD < 0.8). Observed: forced-crossing SD = 1.71, vs 0.52 for non-forced. The polysemous pivot is positionally volatile because frame-crossing timing is model-dependent. Killed by Phase 6C.

---

## 11. Open Questions for Phase 7

Ranked by expected information gain, accounting for the revised understanding from Phase 6.

### 11a. Why Do Bridges Anchor Early? (Highest Priority)

The early-anchoring finding is Phase 6's most novel discovery, and it lacks a causal explanation. The directional-heading hypothesis (bridges are selected first because they establish the trajectory) is consistent with the data but not directly tested. Design: for a focal pair A-C with known bridge B, present the model with the prompt starting from position 2 (give the first waypoint, ask for positions 2-7) and measure whether B still appears and at what position. If B is a heading mechanism, it should disappear or shift to position 1 when the heading is already established. If B is simply a high-frequency associate of A, it should appear regardless of starting position.

**Expected yield:** A causal test of the directional-heading model. Would distinguish between "bridge is selected because it steers" and "bridge is selected because it is activated first."

### 11b. Curvature Estimation Around Polysemous Hubs (High Priority)

Deferred from Phase 5 but now more motivated. Phase 6B shows that forced crossings do not reduce asymmetry, but the positional instability of forced-crossing bridges (Section 4) suggests that polysemous concepts create regions of high navigational variance. Curvature estimation (using the Gauss-Bonnet approach: excess triangle inequality slack as a proxy) could quantify whether polysemous concepts really are singular points in the navigational geometry.

**Expected yield:** First curvature estimates for conceptual topology. If polysemous hubs show high curvature, this would formalize the "frame junction" concept.

### 11c. The "Too-Central" Boundary (Medium-High Priority)

Phase 5 established "fire" as too-central to bridge. Phase 6A reveals that some high-frequency waypoints (warm, cool, chilly on hot-cold) function as bridges despite being obvious. What separates "obvious and useful" from "obvious and redundant"? Design: construct 5-6 pairs with bridges that range from "merely associated" to "informationally redundant" and measure bridge frequency. Compare to navigational entropy: do too-central concepts correspond to low-entropy salience landscapes?

**Expected yield:** A quantitative characterization of the too-central boundary. Would determine whether fire's failure is a general principle or a specific property of causal chains.

### 11d. Cross-Model Bridge Agreement at Full Salience Resolution (Medium Priority)

Phase 6A's cross-model top-3 agreement (mean ~0.26) is computed on the top 3 waypoints only. The full salience landscapes contain 5-36 unique waypoints per model-pair. Computing agreement at higher resolution (top-5, top-10, full distribution) could reveal whether models share deep structure beneath surface vocabulary differences. If Jaccard increases with resolution, models are saying the same thing in different words. If it stays flat, the navigational strategies are genuinely divergent.

**Expected yield:** Disambiguation of whether cross-model differences are vocabulary-level or topology-level.

### 11e. Temporal Navigation: Are Phase 1 Gaits Stable Over Time? (Medium Priority)

Phase 4's temporal stability check (O9) found no drift across the multi-day Phase 4 collection period. But model updates are continuous, and Phases 1-6 span several weeks. Re-running a subset of Phase 1 pairs and comparing to original results would test whether gait characterization is a snapshot or a stable model property.

**Expected yield:** Temporal robustness estimate for all prior findings. If gaits have shifted, it would calibrate the shelf-life of topological characterization.

### 11f. Paper Preparation (Parallel Track)

Six phases of data now support a clear narrative arc: (1) LLM conceptual navigation has measurable quasimetric structure (Phases 1-2); (2) this structure is compositional with model-specific gaits (Phases 3-4); (3) navigational salience, not associative strength, determines bridge reliability (Phase 5); (4) bridges are early-anchored, heavy-tailed, and directionally invariant (Phase 6). The prediction failures are as telling as the successes: forced crossings do not reduce asymmetry, fire is too-central to bridge, plant loses to germination, the midpoint assumption was wrong. Each failure points to a genuine discovery about the mechanism of conceptual navigation. The core paper writes itself from this arc.

---

## 12. Summary of Key Findings

1. **Navigational salience distributions are non-uniform and concentrated.** 7/8 pairs reject uniformity at Bonferroni-corrected significance. A small number of waypoint concepts dominate navigational traffic for each pair, confirming the bridge-as-bottleneck model at the distributional level. **[observed]** (H6 upgraded to O11; formal distributional fitting deferred.)

2. **The forced-crossing asymmetry hypothesis fails.** Forced-crossing mean asymmetry (0.817) is indistinguishable from same-axis (0.810) and Phase 2 baseline (0.811). Polysemous bottlenecks constrain which concepts appear on a path but do not reduce the quasimetric asymmetry. H4 is falsified. **[observed]** (extends R2; broader replication needed before upgrading.)

3. **Bridge concepts anchor early, not at the midpoint.** Cross-model modal bridge position is 1-2 (0-indexed; 2nd-3rd waypoint) for 8 of 10 pairs. Peak-detection contrast (0.345) is robustly positive; fixed-midpoint contrast (-0.080) is negative. The Phase 5C W-shape was real all along -- the rigid midpoint assumption obscured it. **[observed]** (O12.) Note: positions are 0-indexed throughout; indexing sensitivity analysis is recommended before causal claims in Phase 7.

4. **The animal-poodle exception reveals taxonomic positioning.** Dog anchors at position 4-5, the only pair where the bridge occupies the midpoint. Taxonomic hierarchies position bridges at the hierarchically appropriate level, not at the path's beginning. **[observed]**

5. **Forced-crossing bridges are positionally unstable.** Positional SD for forced-crossing pairs (1.71) is 3.3x higher than for non-forced pairs (0.52). The polysemous pivot floats because frame-crossing timing is model-dependent. **[observed]** (O13.)

6. **GPT, not Grok, has the highest navigational entropy.** Mean entropy: GPT 3.44, Grok 3.40, Gemini 3.13, Claude 2.59. GPT's low Phase 1 Jaccard reflects genuine conceptual breadth, not noise. Claude's high Jaccard reflects near-deterministic waypoint selection from a narrow vocabulary. **[observed]**

7. **Gemini routes bank-ocean through a financial frame (vault-treasure-gold) while all other models use a geographic frame (river-estuary-shore).** This is the cleanest demonstration of Gemini's frame-crossing failure: the geographic concepts exist in Gemini's vocabulary but are not activated by the bank-ocean frame. **[observed]** (supports H1.)

8. **Semantic distance does not predict bridge position.** Correlation r = 0.239 (p = 0.486). The distance ratio is irrelevant because early anchoring compresses most bridges to position 1-2 regardless of distance. H5 is falsified. **[observed]**

9. **Forced crossings standardize inter-model asymmetry without reducing it.** Loan-shore shows asymmetry range 0.026 across 4 models (0.826-0.852), while deposit-river shows range 0.500 (0.422-0.922). The bottleneck homogenizes model-to-model variance on constrained pairs. **[observed]** (O14.)

10. **Retroactive calibration confirms that intuitive cue-strength predictions are unreliable.** Only 3/6 intuitive top-bridge predictions match the empirical top-1 waypoint. Wavelength wins over spectrum; rhythm wins over harmony. The empirical salience landscape diverges from human expectations on the same pairs where Phase 5's cue-strength ratings were miscalibrated. **[observed]**

11. **Peak-detection methodology is validated as superior to fixed-midpoint for positional analysis.** The contrast difference of 0.425 (CI [0.265, 0.586]) between the two approaches is the largest methodological effect in the benchmark. Future positional studies should use peak-detection as the default. **[observed]**

12. **190 novel waypoints discovered at >20% frequency.** The salience landscape reveals navigational routes not predicted by prior phases, including technically specific concepts (fourier analysis, set theory, mental representation) that reflect genuine mechanistic connections rather than surface associations. **[observed]**
