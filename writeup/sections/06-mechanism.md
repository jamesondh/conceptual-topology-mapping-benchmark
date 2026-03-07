# 6. Act III — Mechanism: Pre-Filling Reveals Causal Structure

Sections 4 and 5 established that waypoint elicitation measures real navigational structure with consistent geometric properties. But those findings are correlational — they characterize the structure without establishing how it arises. This section presents the benchmark's causal intervention results. By pre-filling the first waypoint position with a specified concept and measuring the downstream effect on bridge concept appearance, we test whether early anchoring causally determines path structure (Phase 7A), whether the semantic relationship between the pre-fill and the bridge modulates the effect (Phase 10B), and whether pre-filling can facilitate rather than displace marginal bridges (Phase 9C).

## 6.1 Pre-Filling Causally Displaces Bridges

The early-anchoring pattern from Section 5.7 — bridge concepts cluster at positions 1–2 — could reflect either a causal mechanism (the first-generated concept steers the trajectory) or an epiphenomenon (the bridge concept is inherently early in the conceptual path regardless of generation order). Phase 7A distinguished these by pre-filling position 1 with a specified concept, forcing the model to generate waypoints 2–7 with the pre-fill already occupying the first slot.

**Pre-filling causally displaces bridge concepts.** In the primary incongruent condition, mean displacement across 8 pairs and 4 models was 0.515 (95% CI [0.357, 0.664], excluding zero); congruent and neutral conditions showed comparable magnitudes (0.436 and 0.536 respectively; see Section 6.2 for condition-level analysis). Bridge frequency dropped from 0.807 under unconstrained elicitation to 0.460 under pre-fill conditions — a 43% relative decline. The positional shift exceeded the mechanical +1 that would result from merely inserting a waypoint before the bridge, confirming genuine topological displacement rather than arithmetic position-bumping.

<!-- See writeup/figures/fig09-prefill-displacement.pdf -->

**Taxonomic bridges resist displacement.** The animal→poodle pair, where "dog" occupies a hierarchically determined mid-path position (Section 5.7), showed displacement of only 0.140 — less than a third of the 0.515 mean for heading-bridge pairs. The taxonomic bridge resists pre-fill perturbation because its position is structurally determined by the hierarchy (mammal → carnivore → canine → dog → breed), not by generation-order primacy. This confirms the distinction from Section 5.7: taxonomic bridges and heading bridges respond to different causal mechanisms.

**Forced-crossing bridges do not resist displacement.** The forced-crossing bridge "bank" on loan→shore, which appeared at 0.95–1.00 for Claude, GPT, and Grok under unconstrained elicitation in earlier phases (Section 5.4), showed pre-fill survival of only 0.267 in Phase 7A (aggregate unconstrained baseline 0.717), with a positional shift of 0.791. This falsified the pre-registered prediction that the forced-crossing bottleneck would survive at > 0.90 because it is the only semantic connection between the financial and geographic domains (graveyard entry G19). The forced-crossing bottleneck is maintained by associative primacy — "bank" normally wins position 1 because it is the most strongly cued concept — not by topological necessity. When position 1 is occupied, a bridge that behaved as a near-obligatory bottleneck under unconstrained elicitation can still be displaced.

**Bridge survival is bimodal.** The pair-level survival rates under pre-fill reveal two distinct modes rather than a continuous distribution:

| Pair | Bridge | Unconstrained | Pre-fill Survival | Pattern |
|------|--------|---------------|-------------------|---------|
| emotion→melancholy | sadness | 0.950 | 0.750 | Robust |
| animal→poodle | dog | 0.970 | 0.900 | Robust |
| light→color | spectrum | 0.917 | 0.575 | Partially robust |
| sun→desert | heat | 0.917 | 0.567 | Partially robust |
| bank→ocean | river | 0.600 | 0.300 | Fragile |
| loan→shore | bank | 0.717 | 0.267 | Fragile |
| music→math | harmony | 0.550 | 0.025 | Collapsed |
| seed→garden | germination | 0.833 | 0.000 | Collapsed |

"Harmony" and "germination" collapse to near-zero under any pre-fill condition; "sadness" and "dog" survive robustly. The pattern is consistent with route exclusivity: "sadness" has no navigational competitors on the emotion→melancholy path, while "harmony" competes with rhythm, pattern, ratio, and frequency on music→mathematics. When the bridge has no competitors, pre-filling merely delays its appearance; when it has competitors, pre-filling creates an opening for alternative routes (H8). This characterization remained descriptive throughout the benchmark — the mechanistic follow-up (route exclusivity as competitor count, G20; dominance ratio, G23) failed in both attempts (Section 7).

## 6.2 The Mechanism Is Primarily Associative Primacy

Phase 7A tested three pre-fill conditions — incongruent (pointing away from the target), congruent (pointing toward the target), and neutral (semantically unrelated) — to distinguish between two mechanistic theories. The directional-heading theory predicted that incongruent pre-fills would produce the most displacement (they steer away from the bridge), congruent the least (they align with the bridge's heading), and neutral in between. The associative-primacy theory predicted that all pre-fills would produce similar displacement (whatever occupies position 1 anchors the trajectory regardless of its semantic content).

**The directional-heading theory fails in its strong form.** Displacement magnitudes were statistically indistinguishable across conditions:

| Condition | Mean Displacement | 95% CI |
|-----------|-------------------|--------|
| Incongruent | 0.515 | [0.357, 0.664] |
| Congruent | 0.436 | [0.278, 0.599] |
| Neutral | 0.536 | [0.378, 0.692] |

The critical comparison — incongruent vs congruent — showed a difference of only 0.079, with overlapping confidence intervals. Neutral pre-fills produced displacement as large as incongruent ones (0.536 vs 0.515), contradicting the prediction that content-free pre-fills should displace less than actively misdirecting ones.

**Bridge survival shows a secondary content effect.** While displacement magnitudes did not differentiate conditions, survival rates showed a suggestive pattern: incongruent 0.347 vs congruent 0.631 vs neutral 0.403. The congruent survival advantage (0.631 vs 0.347) suggests that pre-fill content modulates whether the bridge eventually recovers, even though displacement magnitude is similar. The mechanism appears to be primarily associative primacy (occupying position 1 has outsized causal influence on the trajectory) with a possible secondary modulation by content alignment — a weaker claim than the directional-heading theory, but not pure position-driven displacement either.

**Per-model displacement.** Claude showed the highest displacement (0.567), consistent with the rigid-gait interpretation from Section 4.1: high consistency means the first-generated concept exerts stronger anchoring because subsequent generation follows a more constrained path. GPT showed lower displacement (0.483), consistent with its exploratory gait allowing more recovery after perturbation.

## 6.3 Relation Class Affects Bridge Survival

Phase 10B refined the content-modulation finding from Section 6.2 by systematically varying the semantic relationship between the pre-fill and the target bridge. Eight pairs were tested under three pre-fill conditions: on-axis substitutes (concepts competing on the same semantic dimension as the bridge), same-domain off-axis (concepts in the same broad domain but not competing on the bridge's dimension), and unrelated (semantically unconnected to both endpoints).

**The relation class taxonomy captures real variance.** A Friedman test across 8 pairs confirmed that relation class significantly affects bridge survival (chi-squared = 6.750, df = 2, p = 0.034).

| Relation Class | Mean Survival | 95% CI |
|----------------|---------------|--------|
| On-axis | 0.643 | [0.330, 0.903] |
| Same-domain | 0.708 | [0.482, 0.922] |
| Unrelated | 0.388 | [0.191, 0.606] |

**The predicted ordering was wrong.** We expected on-axis substitutes to be most disruptive (competing directly for the bridge's navigational niche), with ordering on-axis < unrelated < same-domain. The observed ordering was unrelated (0.388) < on-axis (0.643) ≈ same-domain (0.708). Only 1 of 8 pairs showed the predicted ordering (graveyard entry G27). The data suggest a coarse related-vs-unrelated split as the operationally meaningful distinction (though the pairwise comparisons do not survive multiple-comparison correction; see caveat below): related pre-fills (whether on-axis or same-domain) appear to maintain the navigational context and preserve the bridge, while unrelated pre-fills destroy the context. On-axis and same-domain pre-fills keep the model in the right conceptual neighborhood, making bridge recovery possible; unrelated pre-fills derail navigation to an entirely different region of conceptual space.

**Statistical caveat.** The Friedman test is significant at p = 0.034 with N = 8 pairs as blocks. Post-hoc Wilcoxon signed-rank tests show on-axis vs unrelated at p = 0.025 and same-domain vs unrelated at p = 0.036, but neither survives Bonferroni correction for 3 pairwise comparisons (threshold p < 0.017). The on-axis vs same-domain comparison was not significant (p = 0.889, Cohen's d = 0.170). The qualitative conclusion — unrelated pre-fills are more disruptive than related ones — is sound; the specific pairwise p-values should be interpreted as suggestive rather than confirmatory.

**Replication of Phase 9C results.** Two pairs with direct Phase 9C comparisons showed near-perfect replication: warm (hot→cold on-axis) at 0.000 survival in both phases (diff = 0.000), and fermentation (grape→wine same-domain) at 0.991 vs 1.017 (diff = 0.026). This provides cross-phase validation of the pre-fill paradigm's measurement reliability.

<!-- See writeup/figures/fig10-relation-class.pdf -->

## 6.4 Marginal Bridge Facilitation

The causal intervention paradigm revealed an unexpected bidirectional effect. While pre-filling displaces dominant bridges (Sections 6.1–6.3), it can massively facilitate marginal ones — bridges that appear at low frequency under unconstrained elicitation.

**Marginal bridges show large facilitation under aligned pre-fill.** Across four marginal pairs (unconstrained frequency 0.125–0.267), mean congruent survival was 3.761×, driven by three strong cases:

| Pair | Bridge | Unconstrained Freq | Congruent Survival |
|------|--------|--------------------|--------------------|
| science→art | creativity | 0.125 | 8.000× |
| student→professor | research | 0.175 | 4.000× |
| problem→solution | analysis (pilot pair) | 0.267 | 2.906× |
| recipe→meal | cooking | 0.183 | 0.136× (displaced) |

The facilitation effect is not universal: recipe→meal "cooking" showed displacement (0.136×) rather than facilitation, indicating that bridge marginality is necessary but not sufficient. The effect is large and model-general for the facilitating cases: 3 of 4 models showed facilitation for the two core marginal pairs (science→art, student→professor). The exception was Gemini, which showed no facilitation — consistent with its overall deficit in bridge generation (Section 4.4) but not with any specific mechanistic characterization of that deficit.

**The crossover is qualitative, not a clean regression.** Phase 9C tested whether the relationship between unconstrained bridge frequency and pre-fill survival follows a smooth crossover function (H11). The regression slope was in the expected direction (−3.355) but the CI [−6.748, 0.723] included zero, and the crossover point (0.790) was far above the predicted 0.40–0.50 (graveyard entry G25, partial). The data are better described as a qualitative threshold: marginal bridges can be facilitated, dominant bridges are generally displaced, but the transition between regimes is too heterogeneous for a single regression to capture. Beyond the cooking counterexample above, the near-threshold pilot pair sketch→painting ("outline," unconstrained frequency 0.300) also showed displacement rather than facilitation (0.500×), further demonstrating that low unconstrained frequency alone does not guarantee facilitation — the pre-fill must be semantically aligned with the bridge's navigational role.

**Theoretical significance.** The facilitation finding has implications for the associative-primacy mechanism described in Section 6.2. If position 1 merely anchored the trajectory through recency-weighted attention, all pre-fills should displace all bridges — the mechanism would be purely positional. The fact that congruent pre-fills can *increase* bridge frequency for marginal bridges suggests that position 1 does not just anchor; it primes. A congruent pre-fill activates the same conceptual frame that the marginal bridge occupies, making the bridge more accessible in subsequent generation. This is a content-mediated effect layered on top of the position-driven mechanism — consistent with the secondary content signal observed in Section 6.2 and the related/unrelated distinction in Section 6.3.

---

The four findings in this section establish that navigational structure is not merely a statistical regularity but reflects genuine causal dependencies in the generation process. Pre-filling position 1 causally determines which bridge concepts appear (Section 6.1), the mechanism is primarily associative primacy with secondary content modulation (Section 6.2), the semantic relationship between pre-fill and bridge systematically affects survival (Section 6.3), and the effect is bidirectional — displacement for dominant bridges, facilitation for marginal ones (Section 6.4). These results also reveal the limits of the causal approach: the bimodal survival pattern (Section 6.1) and the failed crossover regression (Section 6.4) indicate that bridge behavior under perturbation is too heterogeneous for single-variable mechanistic models. The next section pursues this observation to its conclusion.
