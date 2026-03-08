# Appendix B: Phase-by-Phase Results Summary

This appendix provides a condensed summary of each phase's design, findings, predictions, and prediction accuracy. It is intended for readers who want to trace the exploration-first methodology in detail.

## Phase 1: Pilot and Prompt Selection

**Runs:** ~2,480 (4 models, 36 pairs, 20 runs each)

**Key question:** Do models produce consistent waypoint paths?

**Design:** Evaluated two prompt formats (semantic, direct) on 15 holdout pairs. Collected 20-run batches on 21 reporting pairs across 4 models (Claude Sonnet 4.6, GPT-5.2, Grok 4.1 Fast, Gemini 3 Flash). Tested both 5-waypoint and 10-waypoint conditions.

**Primary findings:**
- Models have distinct conceptual gaits: Claude 0.578 vs GPT 0.258 (2.2x gap) [R1].
- Control validation: nonsense pairs produce near-zero Jaccard (0.062).
- Polysemy sense differentiation: cross-pair Jaccard 0.011--0.062 [R3].
- 5-waypoint paths are genuine coarse-grainings of 10-waypoint paths (70.5% shared, 67.9% subsequence rate) [O10].
- Semantic prompt format selected over direct format.

**Prediction accuracy:** N/A (exploratory phase).

---

## Phase 2: Reversals and Path Consistency

**Runs:** ~960 (840 reverse + 120 polysemy supplementary)

**Key question:** Is A-to-B navigation symmetric with B-to-A?

**Design:** Reversed all 21 reporting pairs across 4 models (20 runs each). Added 120 supplementary runs to correct the Phase 1 polysemy artifact (G1).

**Primary findings:**
- Navigation is fundamentally asymmetric: mean directional asymmetry 0.811 [R2].
- 87% of 84 pair/model combinations show significant asymmetry (permutation test, p < 0.05).
- Dual-anchor effect: U-shaped convergence profile [O2].
- Category symmetry predictions failed for 4 of 8 categories [G3].

**Prediction accuracy:** N/A (exploratory phase).

---

## Phase 3: Positional Convergence and Transitive Path Structure

**Runs:** ~1,260 (~660 Phase 3B new runs; Phase 3A was pure analysis)

**Key question:** Do paths compose? Does the triangle inequality hold?

**Design:** Part A: pure analysis of Phase 2 reversal data for positional convergence. Part B: 8 concept triples (hierarchical, semantic-chain, polysemy-extend, random-control) with 10 runs per leg, testing transitivity and triangle inequality.

**Primary findings:**
- Hierarchical transitivity 0.175 vs random 0.036 (4.9x, non-overlapping CIs) [R4].
- Triangle inequality holds in 90.6% of cases (29/32 triple/model combinations).
- Bridge frequency model-dependent: "dog" 15--100%, "harmony" 0--100%.
- "Energy" fails as hot--cold bridge [G4].

**Prediction accuracy:** N/A (exploratory phase).

---

## Phase 4: Cross-Model Bridge Topology

**Runs:** ~1,600 (Part A: 0 new runs, pure analysis; Part B: ~1,520 new runs)

**Key question:** Do models agree on bridge concepts?

**Design:** Part A: analyzed inter-model bridge agreement across 6 non-control triples from Phase 3B. Part B: 8 targeted triples with 20 runs per leg across 4 models, testing specific bridge predictions.

**Primary findings:**
- Three models agree, Gemini diverges (isolation index 0.136) [O1].
- Bridges are structural bottlenecks: "spectrum" 1.00 all models [R6].
- "Metaphor" fails at 0.00 all models [G5].
- Universal concrete bridging (spectrum 100%), universal abstract failure (metaphor 0%).
- Triangle inequality replicates at 93.8%.

**Prediction accuracy:** 81.3% (26/32). The highest in the benchmark --- characterization questions.

---

## Phase 5: Cue-Strength and Dimensionality

**Runs:** ~3,720 new + 200 reused

**Key question:** Is bridge frequency graded by semantic cue strength?

**Design:** Part A: 4 concept families x 3 cue levels x 4 models. Part B: polysemy dimensionality with same-axis vs cross-axis triples. Part C: triple-anchor convergence (W-shape test).

**Primary findings:**
- Cue-strength gradient real: 12/16 monotonic [R7]. All 4 failures in biological-growth family.
- "Germination" > "plant": process > object [O4, G8].
- Forced crossing discovery (loan--bank--shore) [O5].
- "Fire" dead as bridge (too-central) [O6, G10].
- W-shape aggregate null [G11]. Gemini threshold hypothesis fails [G7].

**Prediction accuracy:** 42.9% (Phase 5A: 64.6%; Phase 5B: 31/48 but overall combined lower).

---

## Phase 6: Navigational Salience and Bridge Position

**Runs:** ~2,080 new + 280 reused

**Key question:** Where do bridges appear in paths, and how does salience vary?

**Design:** Part A: salience mapping (40 runs/condition, 8 pairs, 4 models). Part B: forced-crossing asymmetry test (8 pairs). Part C: positional bridge scanning (10 pairs, 4 models).

**Primary findings:**
- Salience distributions non-uniform: 31/32 conditions reject uniformity [O11].
- Forced-crossing asymmetry matches baseline (0.817 vs 0.811) [G12].
- Bridges anchor early (positions 1--2), not midpoint [O12].
- Peak-detection contrast 0.345 (CI excludes zero) [O13].
- Forced-crossing bridges positionally unstable (SD 1.71 vs 0.52) [G14].
- GPT highest entropy (3.44); Claude lowest (2.59).

**Prediction accuracy:** ~50% (structural predictions mixed).

---

## Phase 7: Early Anchoring and Navigational Mechanics

**Runs:** ~2,360 new + 920 reused

**Key question:** Does pre-filling a waypoint causally affect the path?

**Design:** Part A: 8 pairs x 3 pre-fill conditions (incongruent, congruent, neutral) x 4 models. Part B: 8 curvature triangles. Part C: 10 too-central pairs.

**Primary findings:**
- Pre-filling causally displaces bridges: mean 0.515, CI excludes zero [O15].
- Mechanism is associative primacy, not directional heading [G15].
- Bridge survival is bimodal: sadness/dog survive; harmony/germination collapse.
- Taxonomic bridges resist displacement (0.140).
- Triangle inequality replicates at 90.6%.
- Cross-model distance fails (r = 0.170) [O18, G17].
- Gradient > causal-chain bridges (0.730 vs 0.496).

**Prediction accuracy:** ~50% (structural replications succeed, mechanistic novel predictions fail).

---

## Phase 8: Bridge Fragility and Gemini Deficit

**Runs:** ~2,690 new + 2,960 reused

**Key question:** Can bridge fragility be predicted from single variables?

**Design:** Part A: 14 fragility pairs testing route exclusivity (competitor count). Part B: 20 gradient/causal pairs testing Gemini gradient blindness. Part C: 16 distance pairs testing gait normalization.

**Primary findings:**
- Route exclusivity fails: $\rho$ = 0.116, opposite direction [G20].
- Gemini gradient blindness fails: interaction 0.046, null [G21].
- Gait normalization: zero improvement (r = 0.212 before and after) [G22].
- O17 replicates: gradient 0.770 vs causal 0.578.
- New hypotheses proposed: H9 (dominance ratio), H10 (transformation blindness), H11 (facilitation).

**Prediction accuracy:** 24% (6/25). The benchmark's lowest --- all novel mechanistic predictions fail.

---

## Phase 9: Dominance, Transformation, and Facilitation

**Runs:** ~3,037 new + ~5,270 reused

**Key question:** Can bridge survival be explained by dominance ratio, transformation type, or facilitation crossover?

**Design:** Part A: 14 pairs testing dominance ratio as fragility predictor. Part B: 20 transformation/gradient pairs retesting Gemini. Part C: 14 facilitation pairs testing the crossover regression.

**Primary findings:**
- Dominance ratio fails: $\rho$ = 0.157 [G23].
- Transformation blindness fails with reversal: Gemini transformation mean 0.667 vs gradient 0.293 [G24].
- Crossover regression: slope correct direction but CI includes zero [G25].
- Pre-fill content is secondary modulator; 5/8 Phase 7A pairs replicate.
- Marginal bridges show massive facilitation: mean 3.761x [O22].

**Prediction accuracy:** 20% (5/25). Mechanism ceiling confirmed.

---

## Phase 10: Model Generality and Relation Classes

**Runs:** ~1,680 new + 778 reused

**Key question:** Do structural findings generalize to new models?

**Design:** Part A: 5 new models (Qwen, MiniMax, Kimi, GLM, Llama 8B) on 12 pairs with reliability probing. Part B: 4 core models on 8 pairs with 3 pre-fill relation classes.

**Primary findings:**
- R1 replicates: new model gaits 0.298--0.508 [R1 extended].
- R2 replicates: all new models exceed 0.60 asymmetry threshold [R2 extended].
- Bridge frequency CI includes zero (0.721 vs 0.817): bridge structure generalizes.
- Llama 8B sole outlier (bridge freq 0.200): scale effect [O25].
- Relation class matters (Friedman p = 0.034): unrelated < related [O26].
- Predicted relation class ordering wrong [G27]. G26 resurrected.

**Prediction accuracy:** 50% (9/18). Recovery from mechanism floor --- more replication/structural predictions.

---

## Phase 11: Expanded Generality, Control Revision, and Robustness

**Runs:** ~2,040 new + ~340 reused

**Key question:** Do findings survive more models and protocol variation?

**Design:** Part A: 4 new models (DeepSeek, Mistral, Cohere, Llama 4 Maverick) on 12 pairs. Part B: 4 control pair candidates across 6 models. Part C: 3 models x 2x2 waypoint/temperature grid.

**Primary findings:**
- R1/R2 universal across all 12 models. Mistral record gait (0.747) [O28].
- Llama scale confirmed: Maverick 0.724 vs 8B 0.200.
- All 4 control candidates fail (0/24 cells pass). Stapler-monsoon fails for all 12 models [G28].
- ANOVA: model identity $\eta^2$ = 0.242; protocol $\approx$ 0 [O30].
- Bridge frequency most robust (> 0.97 all conditions) [O31].
- Asymmetry resolution-dependent: 5wp 0.594, 9wp 0.669 [O32, G29].

**Prediction accuracy:** 44% (8/18). Intermediate --- mix of replication and structural predictions.

---

## Cumulative Statistics

| Phase | New Runs | Prediction Accuracy | Dominant Prediction Type |
|-------|---------|--------------------|-----------------------|
| 1--3 | ~4,700 | N/A (exploratory) | --- |
| 4 | ~1,600 | 81.3% | Characterization |
| 5 | ~3,720 | 42.9% | Characterization + structure |
| 6 | ~2,080 | ~50% | Structure |
| 7 | ~2,360 | ~50% | Structure + mechanism |
| 8 | ~2,690 | 24% | Mechanism |
| 9 | ~3,037 | 20% | Mechanism |
| 10 | ~1,680 | 50% | Replication + structure |
| 11 | ~2,040 | 44% | Replication + robustness |
| **Total** | **~21,540** | | |

The prediction accuracy trajectory --- 81.3% $\to$ 42.9% $\to$ ~50% $\to$ ~50% $\to$ 24% $\to$ 20% $\to$ 50% $\to$ 44% --- tracks the shift between prediction types. Replication predictions succeed at ~80%; structural predictions at ~50%; mechanistic predictions at 0--15%.
