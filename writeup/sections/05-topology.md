# 5. Act II — Topology: Navigational Geometry Is Consistent with Quasimetric Structure

Section 4 established that waypoint elicitation measures real navigational structure. This section characterizes the *geometry* of that structure. The central finding is that LLM conceptual spaces exhibit properties consistent with a quasimetric space — satisfying non-negativity and triangle inequality while systematically violating symmetry. We present the evidence for each property, then show that the space exhibits compositional structure (hierarchical paths compose), selective bottleneck routing (bridge concepts are not mere associations), and non-uniform navigational traffic.

**Methodological caveat.** The asymmetry result (Section 5.1) and the triangle inequality result (Section 5.2) use different operationalizations of "distance." Asymmetry is measured via cross-direction Jaccard (comparing A→B paths against B→A paths), while the triangle inequality uses within-direction Jaccard (consistency of repeated runs on a single direction) to define navigational distance. The quasimetric characterization is therefore *consistent with* the data rather than formally established on a single unified distance function. We present this as convergent evidence from two complementary distance measures, not as a deductive proof.

## 5.1 Asymmetry Is Fundamental

Phase 2 reversed all 21 reporting pairs across 4 models (840 runs) and computed the directional asymmetry index: 1 minus the mean Jaccard similarity between forward (A→B) and reverse (B→A) waypoint sets. A value of 0 indicates perfect symmetry (identical paths in both directions); a value of 1 indicates complete non-overlap.

**The symmetry axiom fails comprehensively.** The mean directional asymmetry across all 84 pair/model combinations was 0.811 (95% CI [0.772, 0.848]). Of 84 combinations, 73 (87%) showed statistically significant asymmetry by permutation test (p < 0.05, 1,000 resamples). The distribution was heavily right-skewed: 54 of 84 combinations (64%) exceeded 0.8, and only 5 (6%) fell below 0.5. Forward and reverse paths typically shared less than 19% of their waypoints.

**Contextualizing the 0.811 mean.** The Phase 2 asymmetry was computed on the original 4-model cohort at 5 waypoints, and the 0.811 mean includes control pairs — nonsense controls (0.986) and random controls (0.908) — which inflate the overall average. Experimental-category means were lower but still substantial (antonym 0.596, hierarchy 0.683, cross-domain 0.822, polysemy 0.824, anchor 0.911). The 0.811 figure should be understood as characterizing the full distribution rather than as a universal constant.

Phase 11A confirmed asymmetry across 4 additional models, all exceeding the 0.60 threshold: Mistral 0.729, DeepSeek 0.722, Cohere 0.718, Llama 4 Maverick 0.673. Phase 11C revealed a resolution-dependence qualification in the 3-model robustness subset (Claude, GPT, DeepSeek): only the 9-waypoint conditions cleared the 0.60 threshold (0.669–0.684); the 5-waypoint conditions (0.593–0.594) and the 7-waypoint baseline (0.599) did not. The asymmetry property is real but requires sufficient path length to manifest reliably — a measurement sensitivity finding, not a protocol artifact.

> [FIGURE 5: Asymmetry Distribution] — Histogram of directional asymmetry values across all 84 pair/model combinations (Phase 2, 5 waypoints). Vertical line at 0.811 (mean). Almost no mass near 0.0. Annotated with the resolution-dependence finding from Phase 11C.

**Statistical caveat.** The 87% significance rate was computed at α = 0.05 across 84 independent tests with no explicit multiple-comparison correction. With Bonferroni correction (threshold ≈ 0.0006), the percentage would be lower, and the permutation test's resolution (1,000 resamples, minimum achievable p = 0.001) limits precision at corrected thresholds. The qualitative conclusion — that the vast majority of pair/model combinations show genuine asymmetry — is robust, but the specific 87% figure should be interpreted conservatively.

**Theoretical connection.** Tversky (1977) established that human similarity judgments are asymmetric: North Korea is judged more similar to China than China is to North Korea. Berglund et al. (2023) showed that autoregressive models exhibit a reversal curse — training on "A is B" does not teach "B is A." Our finding connects these: the reversal curse is not merely a failure mode but produces structured asymmetry consistent with quasimetric topology. The asymmetry patterns track semantic properties of the concept pairs (Section 4.3) and model-specific navigational styles (Section 4.1), indicating systematic structure rather than noise.

## 5.2 Triangle Inequality Shows Stable Replication

The triangle inequality — d(A,C) ≤ d(A,B) + d(B,C) — was tested across three independent samples using navigational distance defined as 1 minus mean within-direction Jaccard similarity.

> [TABLE 4: Triangle Inequality Replication]

| Phase | N Triangles | Models | % Holding | Violations |
|-------|-------------|--------|-----------|------------|
| 3B | 8 | 4 | 90.6% (29/32) | Gemini ×2 (music-harmony-math, bank-river-ocean), Claude ×1 marginal (hot-energy-cold) |
| 4B | 8 | 4 | 93.8% (30/32) | Claude ×1 (tree-forest-ecosystem), Grok ×1 (light-chandelier-color, a random-control triple) |
| 7B | 8 | 4 | 90.6% (29/32) | Claude ×1 (deposit-bank-shore), Gemini ×2 (seed-germination-garden, music-harmony-math) |

The satisfaction rate shows a stable replication pattern around 91% across three independent triple sets. This is remarkably high given the magnitude of the asymmetry violations: a space where forward and reverse distances differ by 0.811 on average might be expected to show widespread triangle inequality failures, yet the directional distances compose properly in over 90% of cases.

The violations in Phase 3B were concentrated in Gemini: the music→harmony→mathematics triple showed a slack of −0.319 (the direct path was much longer than the sum of the two legs), and bank→river→ocean showed −0.061. Claude's hot→energy→cold violation was marginal (−0.023). GPT and Grok satisfied the triangle inequality in all 32 cases across Phase 3B.

**Quasimetric characterization.** Combined with the asymmetry data, the metric-axiom profile of LLM conceptual space is:
- *Identity:* not directly testable with Jaccard-based distance (identity controls show low directional divergence for some models — Claude 0.017 — but mean cross-direction asymmetry was 0.456, and within-direction distance was not measured for identity pairs)
- *Non-negativity:* holds trivially
- *Symmetry:* **fails comprehensively** (mean violation 0.811)
- *Triangle inequality:* holds in ~91% of cases

This profile is consistent with a quasimetric space — a space satisfying all metric axioms except symmetry. Quasimetric spaces are standard mathematical objects arising in directed graphs, asymmetric norms, and computational complexity theory. The characterization provides a useful framework for interpreting the navigational geometry observed throughout the benchmark, though it rests on convergent evidence from two complementary distance operationalizations rather than a single unified metric (see methodological caveat above).

## 5.3 Hierarchical Paths Are Compositional

If conceptual navigation merely produces plausible-sounding word chains, there is no reason to expect that the path from A to C should systematically include the concept B that lies "between" them in a taxonomic hierarchy. Phase 3B tested this directly with 8 concept triples across 4 models.

**Hierarchical triples showed 4.9× higher waypoint transitivity than random controls.** Mean transitivity for hierarchical triples was 0.175 (95% CI [0.112, 0.238]); for random controls, 0.036 (95% CI [0.011, 0.070]). The confidence intervals do not overlap. Bridge concepts appeared systematically for taxonomic triples — "dog" at 15–100% frequency on the animal→poodle path — and never for random controls ("stapler" at 0% on music→mathematics, "flamingo" at 0% on hot→cold).

> [FIGURE 6: Compositional Structure] — (Left) Transitivity scores for hierarchical vs random triples, showing the 4.9× gap with non-overlapping CIs. (Right) Bridge frequency for taxonomic bridges vs random controls.

**Polysemy-extend triples** (bank→river→ocean) showed even higher bridge frequency (0.725) than hierarchical triples (0.456), reflecting the bottleneck effect of sense-mediated routing: once "bank" resolves to its geographic sense, "river" is the only natural waypoint en route to "ocean." Semantic-chain triples (music→harmony→mathematics, hot→energy→cold) showed intermediate transitivity (0.073) with strong model dependence — "harmony" appeared on 100% of Claude's music→mathematics paths but 0% of Gemini's.

The key negative result was hot→energy→cold, where "energy" never appeared as a bridge despite being associated with both endpoints. The hot→cold paths traversed the experiential temperature gradient (warm, tepid, cool, chilly); the hot→energy and energy→cold paths traversed physics terminology (thermodynamics, work, heat). Association with both endpoints is necessary but not sufficient for bridge function — the concept must lie *on the navigational path* between the endpoints, not merely in their shared associative neighborhood.

## 5.4 Bridge Concepts Are Bottlenecks, Not Associations

Phases 4 and 5 converged on a characterization of what makes a concept function as a navigational bridge. Associative strength alone is insufficient; structural role — whether the concept names the primary axis of connection between the endpoints — can override it (though cue strength remains a real contributing factor; see Section 5.5).

**Bottleneck bridges succeed universally.** "Spectrum" (the mechanism by which light produces color) appeared at 1.00 frequency across all four models on the light→color path. "Deposit" (the action connecting bank to savings) appeared at 0.95–1.00. "Sentence" (the compositional unit between word and paragraph) appeared at 1.00. These bridges name the *mechanism* or *transformation* that connects the endpoints.

**Off-axis associations fail universally.** "Metaphor" (associated with both language and thought) appeared at 0.00 on the language→thought path. "Energy" appeared at 0.00 on hot→cold. These concepts are associated with both endpoints but do not name the primary axis of connection.

> [FIGURE 7: Bridge Taxonomy] — 2×2 grid showing bridge frequency by model for: bottleneck bridges (spectrum, deposit, sentence), off-axis associations (metaphor, energy), process vs object (germination vs plant), and too-central concepts (fire, water).

**Process-naming outperforms object-naming.** "Germination" (the process connecting seed to garden) outperformed "plant" (the object that inhabits both) in all four models: Claude 1.00 vs 0.00, GPT 0.95 vs 0.65, Grok 0.15 vs 0.00, Gemini 1.00 vs 0.00 (O4). The explanation parallels the spectrum/deposit pattern: "germination" names the *transformation* from seed to garden, adding directional information; "plant" names something already implied by both endpoints, adding no navigational value. Navigational salience depends on directional information content, not solely on generic associative strength.

**Too-central concepts are skipped.** "Fire" appeared at near-zero frequency across all configurations in Phase 5B — 0.00 on spark→ash (except GPT 0.15), 0.00 on ambition→motivation, 0.00 on spark→motivation (O6). Both "spark" and "ash" already imply fire; naming it explicitly adds no information. Phase 7C extended this finding: "water" for rain→ocean was 0.00 across all four models (O16). Too-central concepts are navigable *to* but not *through* — a distinct failure mode from off-axis associations.

**Forced crossings create near-obligatory bottlenecks.** When a polysemous concept is the sole connection between two domains, it becomes a near-obligatory waypoint under unconstrained elicitation. Loan→bank→shore produced bridge frequency of 0.95–1.00 for Claude, GPT, and Grok (O5); Gemini showed 0.05, consistent with its apparent topological disconnection between senses. This is a bank-specific result — the benchmark's strongest forced-crossing case — and generality beyond "bank" remains untested. The forced-crossing mechanism is the inverse of the too-central phenomenon: instead of being redundantly implied, the bridge is the *only* route between otherwise disconnected domains.

**A major failed prediction** was "metaphor" as the language→thought bridge (graveyard entry G5). Intuitive semantic importance had zero predictive power for navigational bridge behavior. This failure sharpened the operational definition: bridges must name the primary axis of connection between endpoints, not merely be associated with both.

## 5.5 Cue-Strength Gradient

Phase 5A tested whether bridge frequency decreases monotonically with the bridge concept's cue strength — its associative proximity to both endpoints. Four concept families were constructed, each with three bridge candidates at varying cue levels (very-high, medium, low), and bridge frequency was measured across 4 models (2,040 new runs).

**The gradient is real.** Twelve of 16 family/model combinations showed monotonic decrease in bridge frequency from highest to lowest cue level. All four failures occurred in a single anomalous family (biological-growth: seed→B→garden), where the "medium" cue bridge ("germination") outperformed the "very-high" bridge ("plant") — the process-naming effect described in Section 5.4. The three well-behaved families — physical-causation (sun→B→desert), compositional-hierarchy (word→B→paragraph), and abstract-affect (emotion→B→melancholy) — showed perfect monotonic gradients across all four models.

Logistic regression revealed similar cue-strength thresholds across models (Claude 2.02, GPT 1.96, Grok 2.16, Gemini 1.79), with the difference CI [−1.00, 1.07] including zero. This falsified the Phase 4 hypothesis that Gemini's bridge failures stemmed from a higher cue-strength threshold. Gemini responds to cue strength at approximately the same threshold as other models; its failures must be driven by something other than associative sensitivity. R² values ranged from 0.311 to 0.640, indicating that cue strength is a real but incomplete predictor — bridge selection is closer to a threshold phenomenon than a smooth gradient.

## 5.6 Waypoint Distributions Are Non-Uniform

Phase 6A collected 1,200 runs across 8 concept pairs and 4 models to characterize the full waypoint frequency distribution for each (pair, model) condition.

**Navigational traffic concentrates in a small number of high-frequency waypoints.** Of 32 pair-model conditions (8 pairs × 4 models), 31 rejected the null hypothesis of uniform waypoint frequency at Bonferroni-corrected significance (chi-squared goodness-of-fit test, threshold p < 0.0063). The sole non-rejection was Claude on seed→garden, where only 5 unique waypoints were observed — near-deterministic navigation leaving insufficient diversity to distinguish from uniform.

Entropy varied systematically with gait: Claude showed the lowest mean entropy (2.59), reflecting near-deterministic waypoint selection from a small vocabulary; GPT showed the highest (3.44), reflecting broad exploration across a larger candidate set. This mirrors the gait spectrum from Section 4.1 — high-gait models concentrate traffic on a few landmarks, while low-gait models distribute it across many.

The non-uniformity finding is important because it rules out a class of null models. If waypoints were drawn approximately uniformly from a large vocabulary, the consistency metrics throughout the benchmark could reflect sampling noise rather than navigational structure. The non-uniform, concentrated distributions confirm that models navigate through preferred waypoints, not through arbitrary word generation.

## 5.7 Bridge Positioning: Early Anchoring, Not Midpoint

Phase 5C tested whether bridge concepts create a convergence peak at the midpoint of waypoint paths (the W-shape hypothesis). The aggregate result was null — bridge-present pairs showed no significant midpoint convergence signal when averaged across models and pairs. Phase 6C revised the approach: instead of assuming the bridge occupies the midpoint, it scanned all positions for bridge frequency peaks.

**Bridges anchor early, not at the midpoint.** Across 10 pairs and 4 models (40 positional profiles), the cross-model modal bridge position was 1–2 (0-indexed; the 2nd–3rd waypoint out of 7) for 8 of 10 pairs. The peak-detection contrast — bridge frequency at the modal position minus the mean of non-modal positions — was 0.345 (95% CI [0.224, 0.459]), significantly positive. The fixed-midpoint contrast was −0.080 (95% CI [−0.141, −0.024]), confirming that the Phase 5C W-shape null was a methodological artifact of the rigid midpoint assumption, not evidence against bridge positional structure.

> [FIGURE 8: Bridge Position Profiles] — Heatmap or small-multiples showing bridge position distributions for 10 pairs across 4 models. Early-anchoring pattern highlighted, with the taxonomic exception annotated.

**The taxonomic exception.** The sole departure from early anchoring was the hierarchical pair animal→poodle, where "dog" anchored at positions 4–5 across models. This late positioning reflects the structure of the taxonomic chain: the path from animal to poodle narrows progressively (mammal → carnivore → canine → dog → breed), and "dog" is the penultimate step, not an early waypoint. Taxonomic bridges reflect their position in the hierarchy rather than a universal early-anchoring tendency.

**Forced-crossing bridges are positionally unstable.** The two forced-crossing pairs (loan→shore, deposit→river) showed positional standard deviation of 1.71, compared to 0.52 for the 8 non-forced pairs (O13). The polysemous pivot sits at a frame junction where the timing of sense-crossing is model-dependent: Claude places "bank" at position 1 on loan→shore; Gemini places it at position 4. The bridge is obligatory (it must appear somewhere) but its position is not fixed — a contrast with non-forced bridges like "spectrum" or "sadness," which reliably anchor at positions 1–2.

---

The seven findings in this section collectively support a characterization of LLM conceptual space as consistent with quasimetric geometry, exhibiting compositional structure and non-uniform navigational traffic. Distances are asymmetric but compose properly (triangle inequality ~91%); hierarchical relationships preserve transitivity; bridge concepts function as structural bottlenecks, not associative co-occurrences; and navigational traffic concentrates at preferred waypoints that anchor early in the path sequence. This geometric characterization provides the foundation for the causal intervention experiments in the next section, which probe whether the observed structure is merely statistical regularity or reflects genuine causal dependencies in the navigation process.
