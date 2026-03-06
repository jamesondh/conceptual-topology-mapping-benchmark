# Claims Registry

All major claims from the benchmark, tagged by evidence tier. This is the canonical reference for what we've established, what we've observed, and what remains hypothesis.

## Evidence Tiers

- **[robust]** — Replicated across multiple phases or models, survived prediction testing, withstood scrutiny. These are the claims you'd lead a paper with.
- **[observed]** — Directly measured with statistical support, but specific to conditions tested. May not generalize beyond the tested pairs/models/configurations.
- **[hypothesis]** — Explanatory model consistent with the data, but not directly tested or supported by limited evidence. Could be falsified by future phases.

---

## Tier 1: Robust Claims

### R1. Models have distinct, stable conceptual gaits
**[robust]** — Phase 1, replicated across Phases 2-5.

Claude navigates with 2.2x higher consistency than GPT (avg Jaccard 0.578 vs 0.258). This gap is stable across 5 phases and 9,500+ runs. Grok (0.293) and Gemini (0.372) fall between. The consistency profile predicts downstream behavior: Claude's rigidity produces the strongest positional signals (Phase 5C W-shape), GPT's variability produces the broadest bridge exploration, Gemini's fragmentation produces systematic cross-frame failures. Phase 10A (expanded) confirms cross-architecture generality across 4 new models: Qwen 0.508, MiniMax 0.419, Kimi 0.414, Llama 0.298 — all within the expected range. Gait is confirmed as a universal property across 8 models from 8 providers, spanning 8B to frontier scale.

Phase 11A extends the gait spectrum to 12 models from 11 families: Mistral sets the record at 0.747, followed by Claude 0.578, DeepSeek 0.540, Llama 4 Maverick 0.539, Qwen 0.508, Cohere 0.502, MiniMax 0.419, Kimi 0.414, Gemini 0.372, Llama 8B 0.298, Grok 0.293, GPT 0.258. Phase 11C robustness: gait rank ordering is largely stable across waypoint count and temperature variations (Kendall's W = 0.840), though not perfectly preserved (GPT and DeepSeek swap in some conditions).

**Sources:** `01-pilot-analysis.md` §2, `05-analysis.md` §7, `10-analysis.md` §1, `11a-expanded-generality.md`, `11c-robustness.md`, `11-analysis.md`

### R2. Conceptual navigation is fundamentally asymmetric (quasimetric)
**[robust]** — Phase 2 (primary), Phase 3B (triangle inequality), Phases 4-5 (consistent with).

Mean directional asymmetry 0.811 across 84 pair/model combinations. 87% show statistically significant asymmetry (permutation test, p < 0.05). The symmetry axiom fails comprehensively. Triangle inequality holds in 91% of cases (Phase 3B), 93.8% (Phase 4B), and 90.6% (Phase 7B) — a structural constant across three independent samples. Conceptual space satisfies all metric axioms *except* symmetry — the formal definition of a quasimetric space. Phase 10A (expanded) confirms cross-architecture generality across all 4 new models: Llama 0.785, Kimi 0.684, Qwen 0.662, MiniMax 0.638 — all well above the 0.60 threshold. Quasimetric navigation is confirmed across 8 models from 8 providers.

Phase 11A: all 4 new models exceed the 0.60 threshold (Mistral 0.729, DeepSeek 0.722, Cohere 0.718, Llama4 0.673). Asymmetry is confirmed across 12 models. Phase 11C qualification: asymmetry detectability is waypoint-count sensitive — at 5 waypoints, mean asymmetry falls to 0.594 (below 0.60 threshold); at 9 waypoints, 0.669-0.684. The quasimetric property is real but its detectability is resolution-dependent.

**Sources:** `02-reversals-analysis.md` §1, `03-analysis.md` §3, `04-analysis.md` §6, `07b-curvature.md`, `10-analysis.md` §1, `11a-expanded-generality.md`, `11c-robustness.md`

### R3. Polysemy sense differentiation is genuine
**[robust]** — Phase 1 (original, corrected in Phase 2), Phase 5B (extended).

Cross-pair Jaccard of 0.011-0.062 for bank/bat/crane polysemy groups (Phase 2 corrected values). Different sense targets produce genuinely different paths. Phase 5B extends this: polysemous concepts create forced crossing points, and the routing is clean — cross-axis bridge frequency can be *higher* than same-axis when the polysemous concept is the only connection.

**Sources:** `02-reversals-analysis.md` §5, `05-analysis.md` §3

### R4. Hierarchical paths are compositional
**[robust]** — Phase 3B (primary), replicated in Phases 4-5.

Hierarchical triples show 4.9x higher waypoint transitivity than random controls (0.175 vs 0.036, non-overlapping CIs). Bridge concepts appear systematically for taxonomic triples (dog at 15-100% for animal-dog-poodle) and never for random controls (stapler at 0%, flamingo at 0%). This is the strongest evidence that conceptual navigation reflects genuine geometric structure, not word association.

**Sources:** `03-analysis.md` §2, `03b-transitivity.md`

### R5. Controls validate cleanly (qualified)
**[robust]** — Phases 1-5. **Qualified in Phase 10A.**

Nonsense controls show near-zero consistency (Jaccard 0.062, entropy 6.37). Random bridge concepts never appear on paths (0% bridge frequency across all phases for original 4 models). This eliminates artifact explanations: the structure we measure in experimental conditions is not an artifact of the elicitation task, limited vocabulary, or formulaic responses.

**Qualification (Phase 10A):** The stapler-monsoon control pair fails R5 for all 4 new models — MiniMax ("paper" 0.933), Kimi ("paper" 0.933), Qwen ("cloud" 0.867), Llama ("office" 0.800). This suggests the pair has an unintended semantic bridge that many models discover. R5 holds for the original cohort but the specific control pair needs revision for broader generality testing. See O27.

**Qualification (Phase 11B):** Phase 11B demonstrates that R5 validation with a single control pair is fundamentally inadequate. All 4 new candidate controls fail screening (0/24 cells pass). Retrospective analysis shows stapler-monsoon itself fails R5 for ALL 12 models (top freq 0.650-1.000). LLMs find navigable semantic routes between any concept pair at 7 waypoints. The R5 evidence supporting the benchmark rests on the original cohort's relative performance (lower consistency on control vs experimental pairs), not on the absolute R5 threshold. R5 is retained but qualified as the weakest robust claim.

**Sources:** `01-pilot-analysis.md` §3, `03-analysis.md` §2, `10-analysis.md` §1, `11b-control-revision.md`, `11-analysis.md`

### R6. Bridge concepts are bottlenecks, not associations
**[robust]** — Phases 3-5 (converging evidence from multiple findings).

A concept serves as a navigational bridge when it is the *necessary intermediate step* in the most natural decomposition of the endpoint relationship, not merely when it is associated with both endpoints. Converging evidence: "spectrum" works (names the mechanism, 1.00 all models), "metaphor" fails (associated but off-axis, 0.00 all models), "germination" outperforms "plant" (process-naming > object-naming), "fire" fails (too-central, skipped), loan-bank-shore succeeds (only connection, 0.95-1.00).

Phase 11A extends to 12 models. Combined 8-model new cohort bridge freq CI includes zero (new 0.717 vs original 0.817, diff -0.100, CI [-0.286, 0.089]). Phase 11C: bridge frequency is the MOST protocol-robust property (>0.97 across all waypoint/temperature conditions, ANOVA interaction p=0.886).

**Sources:** `04-analysis.md` §1+§3, `05-analysis.md` §2+§3+§4, `11a-expanded-generality.md`, `11c-robustness.md`

### R7. Cue-strength gradient exists
**[robust]** — Phase 5A.

12 of 16 family/model combinations show monotonic decrease in bridge frequency from highest to lowest cue level. All 4 failures are in one anomalous family (biological-growth). For three well-behaved families (physical-causation, compositional-hierarchy, abstract-affect), the gradient is perfect across all models.

**Sources:** `05-analysis.md` §1, `05a-cue-strength.md`

---

## Tier 2: Observed Claims

### O1. Three models share qualitatively similar bridge topology; Gemini diverges
**[observed]** — Phase 4A (6 triples, 4 models).

Claude, GPT, and Grok show 100% binary bridge agreement (they agree on presence/absence of every bridge). Gemini disagrees on 50%. Pairwise correlations: Claude-GPT r=0.772, Claude-Grok r=0.768, Grok-Gemini r=0.340. Sample is 6 non-control triples — the binary agreement is clean but the correlation matrix is computed over a limited set. Two universal-zero triples inflate pairwise correlations.

**Sources:** `04-analysis.md` §4

### O2. Dual-anchor effect shapes paths (U-shaped convergence)
**[observed]** — Phase 3A (pure analysis of Phase 1+2 data).

Both endpoints exert gravitational pull on waypoint selection. Mirror-match rates show U-shape: positions 1 and 5 elevated (0.102, 0.129), valley in middle (0.057-0.085). Category-dependent signatures: antonyms show late convergence (axis-as-funnel), identity shows middle domination, random controls show pure U-shape, nonsense is flat near zero.

**Sources:** `03-analysis.md` §1

### O3. Prediction accuracy degrades from characterization to mechanism
**[observed]** — Phases 4-5.

Phase 4B: 81.3% (26/32). Phase 5A: 64.6% (31/48). Phase 5B: 42.9% (24/56). The decline tracks the shift from characterizing which models find bridges (where prior phase data is directly informative) to predicting which concepts function as bridges in novel configurations (where intuition fails). Correct predictions cluster at extremes (low-cue controls at 0.00, high-cue universals at 1.00); failures cluster in the middle.

**Sources:** `05-analysis.md` §6, `04-analysis.md` §5

### O4. Process-naming bridges outperform object-naming bridges
**[observed]** — Phase 5A (biological-growth family, 4 models).

"Germination" (process) outperforms "plant" (object) as seed→garden bridge in all 4 models. Claude: 1.00 vs 0.00. GPT: 0.95 vs 0.65. Grok: 0.15 vs 0.00. Gemini: 1.00 vs 0.00. Consistent with spectrum (process: light decomposes into colors) and deposit (action: money goes into savings). Currently observed in a single family; generality to other process/object pairs is untested.

**Sources:** `05-analysis.md` §2

### O5. Forced crossings produce the highest bridge frequencies
**[observed]** — Phase 5B (loan-bank-shore, 4 models).

Loan-bank-shore at 0.95-1.00 for Claude, GPT, Grok (Gemini 0.05). Higher than any same-axis triple in the same experiment. The mechanism: "bank" is the only semantic connection between "loan" and "shore," making it obligatory. But the aggregate cross-axis > same-axis result is almost entirely bank-driven. "Light" shows the opposite pattern (same-axis > cross-axis, delta +0.083). Generality beyond bank is not yet established.

**Sources:** `05-analysis.md` §3

### O6. "Fire" is too-central to serve as a bridge
**[observed]** — Phase 5B (3 fire triples, 4 models).

Near-zero bridge frequency across all configurations (sole exception: GPT 0.15 on spark-fire-ash). Fire is navigable *to* but almost never *through*. Both endpoints (spark, ash) already imply fire, making it informationally redundant as a waypoint. Establishes "too-central" as a distinct failure mode. Observed for fire only — generality to other too-central concepts (e.g., "water" for rain-to-ocean?) is untested.

**Sources:** `05-analysis.md` §4

### O7. Claude shows individual W-shape signal on music-mathematics
**[observed]** — Phase 5C (single model-pair combination).

Claude's W-shape contrast of 0.52 on music-mathematics (P4 = 0.600) is the strongest positional convergence signal in the benchmark. "Harmony" likely occupies a fixed middle position in Claude's bidirectional paths. Claude also shows 0.35 on light-color. But: Grok has the bridge (harmony 80%) yet shows -0.045 contrast — the effect requires both bridge presence *and* positional stability. N=1 model for the strong signal; aggregate is null.

**Sources:** `05-analysis.md` §5

### O8. Bridge frequency and transitivity are decoupled
**[observed]** — Phase 5A (across 16 triples).

High-cue triples show transitivity comparable to medium- and low-cue triples despite much higher bridge frequency. The direct path A→C can share many waypoints with A→B and B→C without including the specific bridge concept. Bridge frequency and transitivity measure different aspects of compositional structure.

**Sources:** `05-analysis.md` §7 (Phase 3 compositionality and the transitivity disconnect)

### O9. No temporal drift detected
**[observed]** — Phase 4B (cross-batch comparison).

Cross-batch Jaccard within 0.05 of within-batch Jaccard for all tested legs. Models' navigational behavior on tested pairs is stable across the multi-day collection period. Validates data pooling across phases and suggests topological properties are stable model features, not transient API-version artifacts.

**Sources:** `04-analysis.md` §7

### O10. 5-waypoint paths are genuine coarse-graining of 10-waypoint paths
**[observed]** — Phase 1 (21 pairs, 4 models).

70.5% average shared waypoint fraction, 67.9% subsequence rate. The 5wp path typically appears as a proper subsequence of the 10wp path with additional waypoints interpolated between.

**Sources:** `01-pilot-analysis.md` §7

---

## Tier 3: Hypotheses

### H1. Frame-crossing hypothesis for Gemini's fragmentation
**[hypothesis]** — Phase 4 (proposed), Phase 5 (partially tested).

Gemini's fragmentation boundary is characterized by whether navigation requires crossing between conceptual frames (tightly coupled associative clusters). Within-frame: succeeds (deposit-savings 1.00, spectrum-color 1.00, germination 1.00). Cross-frame: fails (river-ocean 0.00, forest-ecosystem 0.10, nostalgia-melancholy 0.00).

**Status:** The qualitative frame-crossing model is consistent with all data across Phases 3-5. The quantitative version (Gemini has a higher cue-strength threshold) was falsified in Phase 5A. "Frames" are not formally defined — the hypothesis relies on post-hoc categorization of which bridges are within-frame vs cross-frame. A pre-registered test would need an operationalized definition of frame membership.

**What would falsify it:** Gemini succeeding on a clearly cross-frame bridge, or failing on a clearly within-frame bridge with tight cue strength.

**Sources:** `04-analysis.md` §2, `05-analysis.md` §1

### H2. Models navigate by greedy forward search, not global route planning
**[hypothesis]** — Phase 2 (proposed from starting-point data).

When there's no semantic bridge, the path is almost entirely determined by the starting concept (control-random asymmetry 0.908). Models chain forward from A's neighborhood, gradually bending toward B's neighborhood. They don't plan routes globally.

**Status:** Consistent with the asymmetry data (Phase 2) and the dual-anchor refinement (Phase 3A). But the dual-anchor finding (target also influences early waypoints) and the polysemy data (target determines sense activation from wp1) complicate the pure greedy-forward model. A mixed model — primarily forward-chaining with target-influenced frame activation — is more accurate but not directly tested.

**Sources:** `02-reversals-analysis.md` §3

### H3. Navigational salience is determined by directional information content
**[hypothesis]** — Phase 5 (proposed from germination finding).

A bridge concept's navigational salience (how often models route through it) is determined by how much directional information it adds — whether it tells you *where you're going*, not just *where you are*. "Germination" tells you the direction (from dormant seed toward growing garden). "Plant" tells you what you're near. "Spectrum" tells you the mechanism (light decomposes). "Fire" tells you what's already implied.

**Status:** Consistent with all bridge success/failure patterns across Phases 3-5. But "directional information content" is not operationally defined or measured. Phase 6A (navigational salience mapping) should provide empirical frequency distributions that could ground this hypothesis in data rather than post-hoc reasoning.

**Sources:** `05-analysis.md` §2

### H4. Forced crossings reduce path asymmetry
**[falsified]** — Phase 5 (predicted), Phase 6B (tested and falsified).

Predicted that polysemous bottlenecks would constrain both directions equally, reducing the quasimetric asymmetry. Observed: forced-crossing mean asymmetry (0.817) is indistinguishable from same-axis (0.810) and Phase 2 baseline (0.811). The bottleneck constrains which concepts appear but not the directional structure.

**Sources:** `05-analysis.md` §7, `06-analysis.md` §2. **Graveyard entry: G13.**

### H5. Bridge position correlates with semantic distance ratios
**[falsified]** — Phase 5C (inferred), Phase 6C (tested and falsified).

Predicted that d(A,bridge)/d(A,C) would predict bridge position. Observed: r = 0.239 (p = 0.486). Bridges overwhelmingly anchor at positions 1-2 (0-indexed) regardless of distance ratio, making distance irrelevant to position.

**Sources:** `05-analysis.md` §5, `06-analysis.md` §3. **Graveyard entry: G14.**

### H6. Waypoint frequency distributions are heavy-tailed
**[confirmed → O11]** — Phase 5 (predicted), Phase 6A (confirmed).

7/8 pairs reject uniformity at Bonferroni-corrected significance (KS test). Traffic concentrates in a small number of high-frequency waypoints. Upgraded to observed claim O11; formal distribution fitting (power-law vs log-normal) deferred.

**Sources:** `06-analysis.md` §1, `06a-salience.md`

### H7. Claude's rigid gait is architectural, not just decoding temperature
**[hypothesis]** — Phases 1-5 (consistent but untested directly).

Claude's high consistency (Jaccard 0.578) is pair-dependent — it still shows low consistency on random/nonsense pairs — so it's not purely a decoding artifact. But the relative contribution of architecture vs. training vs. inference parameters is unknown. Testing across Claude model sizes or temperatures would isolate the variables.

**Sources:** `01-pilot-analysis.md` §2

---

### O11. Waypoint frequency distributions are non-uniform and concentrated
**[observed]** — Phase 6A (8 pairs, 4 models, 1,200 runs).

7/8 pairs reject uniformity at Bonferroni-corrected significance (KS test, p < 0.0063). Navigational traffic concentrates in a small number of high-frequency waypoints per pair/model. Claude shows the lowest entropy (mean 2.59, near-deterministic waypoint selection); GPT the highest (3.44, broadest exploration). Formal distribution fitting (power-law vs log-normal vs other families) is deferred.

**Sources:** `06-analysis.md` §1, `06a-salience.md`

### O12. Bridge concepts anchor early (position 1-2), not at the midpoint
**[observed]** — Phase 6C (10 pairs, 40 positional profiles).

Cross-model modal bridge position is 1-2 (0-indexed; 2nd-3rd waypoint) for 8 of 10 pairs. Peak-detection contrast 0.345 (CI [0.224, 0.459]) is robustly positive; fixed-midpoint contrast is -0.080. The Phase 5C W-shape null was a methodological artifact of the rigid midpoint assumption. Exception: animal-poodle (taxonomic bridge "dog" at position 4-5).

**Sources:** `06-analysis.md` §3, `06c-positional.md`

### O13. Forced-crossing bridges are positionally unstable
**[observed]** — Phase 6C (2 forced-crossing pairs vs 8 non-forced).

Positional SD for forced-crossing pairs (1.71) is 3.3x higher than non-forced (0.52). Loan-shore and deposit-river are the only "model-dependent" pairs in the positional analysis (SD > 1.0). The polysemous pivot sits at a frame junction where timing of frame-crossing is model-dependent.

**Sources:** `06-analysis.md` §4, `06c-positional.md`

### O14. Forced crossings standardize inter-model asymmetry without reducing it
**[observed]** — Phase 6B (4 forced-crossing + 4 same-axis pairs).

Loan-shore asymmetry range is 0.026 across 4 models (0.826-0.852), while deposit-river shows range 0.500 (0.422-0.922). The bottleneck homogenizes model-to-model variance on highly constrained pairs without shifting the mean asymmetry below baseline.

**Sources:** `06-analysis.md` §2, `06b-forced-crossing.md`

### O15. Pre-filling a waypoint causally displaces bridge concepts
**[observed]** — Phase 7A (8 pairs, 4 models, 4 conditions, 1,240 new runs).

Mean bridge displacement under pre-fill is 0.515 (CI [0.357, 0.664], excludes zero). Bridges are genuinely vulnerable to early anchoring — mean survival rate drops to 0.460 under pre-fill conditions (vs 0.807 unconstrained). Taxonomic bridges resist displacement (animal-poodle "dog" at 0.140 vs 0.515 heading-bridges), confirming hierarchical paths are structurally distinct. Claude shows the highest displacement (0.567), consistent with rigid gaits producing the strongest anchoring effects. The incongruent vs congruent distinction is not cleanly separated (displacement: 0.515 vs 0.436, overlapping CIs; but survival: incongruent 0.347 vs congruent 0.631), suggesting the mechanism is primarily associative primacy with a possible secondary congruence modulation. The directional-heading theory is largely falsified in its strong form.

**Sources:** `07a-anchoring.md`

### O16. "Water" for rain-ocean is universally too-central
**[observed]** — Phase 7C (10 pairs, 4 models).

Rain-ocean "water" frequency is 0.000 across all 4 models — the only pair with perfect cross-model agreement at zero. Generalizes the too-central phenomenon (O6) beyond "fire" to a second domain. Both cases share the same mechanism: both endpoints already imply the bridge, making it informationally redundant.

**Sources:** `07c-too-central.md`

### O17. Gradient-spectrum pairs show higher bridge frequency than causal-chain pairs
**[observed]** — Phase 7C (6 gradient + 4 causal-chain pairs).

Gradient pairs (continuous spectrum midpoints like warm, adolescent, speak) show mean bridge frequency 0.730 vs causal-chain pairs (sequential process intermediaries like fire, tree, dough) at 0.496. Continuous dimension midpoints are more navigational than process intermediaries, suggesting models prefer bridges that name a position on a spectrum over bridges that name a step in a causal sequence.

**Sources:** `07c-too-central.md`

### O18. Navigational distance metrics fail cross-model validity
**[observed]** — Phase 7B (8 triangles, 4 models, 800 new runs).

Cross-model distance correlation r = 0.170, far below the 0.50 validity threshold. Models' waypoint-based navigational distances are not comparable across models, undermining the curvature estimation approach. Claude (mean excess 0.225) and GPT/Grok (mean excess 0.680-0.689) occupy different ranges entirely. This is a methodological finding: curvature claims require within-model interpretation only.

**Sources:** `07b-curvature.md`

---

## Tier 3 Updates from Phase 7

### H8. Bridge fragility is bimodal: "robust" vs "fragile" bridges
**[hypothesis]** — Phase 7A.

Some bridges survive pre-filling (emotion-melancholy "sadness" at 0.750 survival, light-color "spectrum" at 0.575) while others collapse entirely (music-mathematics "harmony" at 0.000 survival, seed-garden "germination" at 0.000). The pattern suggests two modes: bridges that represent the only navigational route (robust under perturbation) vs bridges that represent one of several routes (displaced by any alternative heading). Consistent with R6 (bottleneck > association) but not directly tested as a bimodal distribution.

**Sources:** `07a-anchoring.md`

---

## Falsified (Phase 7)

### ~~Polysemous curvature exceeds non-polysemous~~
**[falsified]** — Phase 7B.

Predicted polysemous-vertex triangles would show higher triangle excess (curvature) than non-polysemous. Observed: 0.499 vs 0.446, CI [-0.157, 0.263] includes zero. No significant difference. Polysemy does not systematically warp local geometry. **Graveyard entry: G16.**

### ~~Cross-model distance metrics are valid (r > 0.50)~~
**[falsified]** — Phase 7B.

Predicted navigational Jaccard distances would correlate across models at r > 0.50, reflecting a shared underlying geometry. Observed: r = 0.170. Claude's distances are incomparable with GPT's because their gaits (R1) produce fundamentally different scales. The distance metric is contaminated by model-specific navigational gait. **Graveyard entry: G17.**

### ~~Too-central is a clean binary category~~
**[falsified]** — Phase 7C.

Predicted too-central bridges would have frequency < 0.15 and obvious-useful > 0.40, with a gap > 0.35. Observed gap 0.287, CI [-0.063, 0.587] includes zero. The too-central/obvious-useful distinction is not a binary; it's a gradient with substantial overlap. Acorn-timber "tree" is categorized as too-central but has 1.00 frequency for 3/4 models. **Graveyard entry: G18.**

### ~~Forced-crossing "bank" resists displacement (survival > 0.90)~~
**[falsified]** — Phase 7A.

Predicted the forced-crossing bottleneck "bank" on loan-shore would survive pre-filling at > 0.90 frequency because it is the only connection between financial and geographic domains. Observed: survival 0.267, shift 0.791 positions. The forced-crossing bottleneck is maintained by associative primacy, not topological necessity. **Graveyard entry: G19.**

---

---

## New Observations from Phase 8

### O19. Gait normalization produces zero improvement on cross-model distance correlation
**[observed]** — Phase 8C (8 reference + 8 test pairs, 4 models).

Raw Fisher-z aggregate r = 0.212, normalized r = 0.212. Improvement = 0.000 on all six model pairs. Spearman rank correlation also unchanged (0.287 → 0.287). The gait difference is structural (ordinal-level, involving rank inversions and anti-correlations) rather than scalar (simple scale factor). Some model pairs actively anti-correlate: Grok-Gemini r = -0.580, GPT-Gemini r = -0.210. Model-independent geometry cannot be rescued through normalization. Extends O18.

**Sources:** `08c-gait-norm.md`, `08-analysis.md` §3

### O20. Prediction accuracy reaches minimum on single-variable mechanistic hypotheses
**[observed]** — Phase 8 (25 predictions across 3 sub-experiments).

Phase 8 prediction accuracy is 24% (6/25), the lowest in benchmark history. Replication predictions succeed at ~80%, structural predictions at ~50%, mechanistic predictions at ~15%. Zero novel mechanistic predictions confirmed. The benchmark maps coarse geometry reliably but cannot predict fine-grained mechanisms with single-variable models.

**Sources:** `08-analysis.md` §5

### O21. Pre-fill content modulates bridge survival magnitude for some pairs
**[observed]** — Phase 9C (14 pairs, 4 pre-fill conditions, 1,600 new runs).

Corrected Phase 7A comparison (congruent-to-congruent matching) shows 5/8 pairs replicate within 0.15 when different congruent pre-fill concepts are used. Three moderate-dominance pairs (bank-ocean, music-mathematics, loan-shore) show magnitude differences of 0.275-0.359 but no direction reversals. Pre-fill presence remains the primary driver of displacement; content produces a secondary modulation of survival magnitude for some pairs. O15 largely upheld.

**Sources:** `09c-facilitation.md`, `09-analysis.md` §3

### O22. Marginal bridges show large facilitation under semantically aligned pre-fill
**[observed]** — Phase 9C (4 marginal pairs, mean congruent survival 3.761).

Science-art "creativity" at 8.0x survival, student-professor "research" at 4.0x, problem-solution "analysis" at 2.9x. For bridges with low unconstrained frequency (0.125-0.267), congruent pre-fills can boost frequency by 3-8x. Effect is model-general (3/4 models show facilitation) but absent in Gemini. The facilitation effect is real and large but heterogeneous — cooking and outline show displacement despite being marginal.

**Sources:** `09c-facilitation.md`, `09-analysis.md` §3

### O23. Bridge specification quality predicts frequency better than gradient/transformation type
**[observed]** — Phase 9B (20 pairs, 4 models, 1,197 runs).

The O17 reversal (Phase 9B finds transformation 0.699 > gradient 0.543) is driven by bridge specification quality, not pair type. Obligatory bottleneck bridges (leather, pulp, steel, spectrum) show near-universal frequency regardless of being transformation or gradient type. Hypernym bridges (speaking, walking) and too-central bridges (sapling) fail regardless of type. The gradient/transformation distinction has less predictive power than whether the bridge is a genuine navigational bottleneck.

**Sources:** `09b-transformation.md`, `09-analysis.md` §2

### O24. Prediction accuracy plateaus at ~20-24% for mechanistic hypotheses
**[observed]** — Phases 8-9 (50 evaluable predictions, 11 confirmed = 22%).

Phase 8 hit 24% prediction accuracy (6/25) and Phase 9 hit 20% (5/25). The floor is stable at ~20-24% across two consecutive phases testing different variables. Confirmed predictions cluster as replications of known structural facts and qualitative directional calls. Zero novel mechanistic predictions confirmed across Phases 8-9 combined. The benchmark maps qualitative structure reliably but cannot predict quantitative mechanism with single-variable models.

**Sources:** `08-analysis.md` §5, `09-analysis.md` §4

---

## Updated Hypotheses from Phase 8

### H8. Bridge fragility is bimodal (DESCRIPTIVE component survives; MECHANISTIC component falsified)
**[hypothesis → partially falsified]** — Phase 7A (descriptive bimodality), Phase 8A (route exclusivity mechanism fails).

The bimodal pattern survives: bridges are either robust or collapsed under pre-fill. But the proposed mechanism (competitor count predicts survival) fails: Spearman rho = 0.116, not significant (G20). The descriptive component (bimodality) remains [observed]; the mechanistic component is replaced by H9.

**Sources:** `07a-anchoring.md`, `08a-fragility.md`, `08-analysis.md` §1

### ~~H9. Bridge survival is predicted by dominance ratio, not competitor count~~
**[falsified]** — Phase 8A (proposed), Phase 9A (tested and falsified).

Retrospective rho = 0.548 (CI [-0.190, 1.000], passed evaluability gate) but combined rho = 0.157 (CI [-0.482, 0.691], not significant). The critical anomaly: warm (ratio 1.00) is destroyed while fermentation (ratio 1.07) survives perfectly — same dominance ratio, opposite outcomes. The pre-fill's semantic relationship to the bridge, not the bridge's dominance, determines survival. **Graveyard entry: G23.**

**Sources:** `09a-dominance.md`, `09-analysis.md` §1

### ~~H10. Gemini's deficit is transformation-chain blindness~~
**[falsified]** — Phase 8B (proposed), Phase 9B (tested and reversed).

Gemini transformation mean (0.667) exceeds gradient mean (0.293) — the opposite of the hypothesis. Interaction = -0.290 (wrong direction, CI includes zero). Pooled meta-analytic interaction combining Phases 8B and 9B: -0.113, not significant. Gemini's overall deficit (mean 0.480 vs ~0.67 non-Gemini) remains real but has now resisted three mechanistic characterizations: frame-crossing threshold (Phase 5), gradient blindness (Phase 8B/G21), transformation blindness (Phase 9B/G24). **Graveyard entry: G24.**

**Sources:** `09b-transformation.md`, `09-analysis.md` §2

### H11. Pre-filling can facilitate marginal bridges when semantically aligned
**[partially confirmed / partially falsified]** — Phase 8A (discovered), Phase 9C (tested).

The primary test (crossover regression slope CI excludes zero) fails: slope = -3.355, CI [-6.748, 0.723] includes zero. The crossover point is 0.790 (not 0.40-0.50 as predicted). **The regression does not confirm a clean crossover.** The facilitation effect for marginal bridges is confirmed: mean congruent survival 3.761 (P3 confirmed). Dominant bridge displacement is marginally not confirmed: mean survival 0.815 (P2 threshold < 0.80 not met, primarily due to the corrected animal-poodle "dog" showing 0.941 survival). The facilitation phenomenon is real (O22) but the crossover is not a clean regression — it is better described as a qualitative threshold with enormous pair-to-pair variance. **Partial graveyard entry: G25.**

**Sources:** `09c-facilitation.md`, `09-analysis.md` §3

---

## Falsified (Phase 8)

### ~~Route exclusivity (competitor count) predicts bridge fragility~~
**[falsified]** — Phase 8A.

Predicted Spearman rho < -0.70 between competitor count and pre-fill survival. Observed: rho = 0.116 (retrospective), -0.121 (combined), neither significant. Sadness (8 competitors) survives at 0.807; harmony (7 competitors) collapses to 0.015. **Graveyard entry: G20.**

### ~~Gemini shows selective gradient-midpoint deficit~~
**[falsified]** — Phase 8B.

Predicted Gemini interaction (gradient - causal gap) at least 0.20 more negative than non-Gemini. Observed: interaction = 0.046, CI includes zero. Gemini zeros concentrate on causal pairs (6/10), not gradient pairs (1/10) — the opposite of predicted. **Graveyard entry: G21.**

### ~~Gait normalization rescues cross-model distance metrics~~
**[falsified]** — Phase 8C.

Predicted normalized cross-model r > 0.50. Observed: r = 0.212, identical to raw r. Zero improvement on every model pair. The disagreement is ordinal, not scalar. **Graveyard entry: G22.**

---

## Falsified (Phase 9)

### ~~Dominance ratio predicts bridge fragility (H9)~~
**[falsified]** — Phase 9A.

Predicted combined Spearman rho > 0.50 between dominance ratio and pre-fill survival. Observed: rho = 0.157, CI includes zero. Warm (ratio 1.00) destroyed, fermentation (ratio 1.07) bulletproof. The pre-fill's semantic relationship to the bridge, not structural dominance, determines survival. After G20 (competitor count) and G23 (dominance ratio), both single-variable structural predictors of bridge fragility have failed. **Graveyard entry: G23.**

### ~~Gemini transformation-chain blindness (H10)~~
**[falsified]** — Phase 9B.

Predicted Gemini (gradient - transformation) gap at least 0.15 larger than non-Gemini, interaction CI excludes zero. Observed: Gemini transformation mean 0.667, gradient mean 0.293 — the opposite direction. Interaction = -0.290, CI includes zero. Pooled meta-analytic interaction with Phase 8B: -0.113, null. Gemini's deficit is real but has resisted three mechanistic characterizations (frame-crossing threshold, gradient blindness, transformation blindness). **Graveyard entry: G24.**

### ~~Pre-fill facilitation crossover regression (H11 primary test)~~
**[partially falsified]** — Phase 9C.

Predicted significant negative regression slope for survival on unconstrained frequency. Observed: slope = -3.355 (correct direction), CI [-6.748, 0.723] includes zero. Crossover at 0.790 (not 0.40-0.50). The regression fails because the data is too heterogeneous: cooking (marginal, 0.183) shows displacement while creativity (marginal, 0.125) shows massive facilitation. The facilitation observation (O22) survives individually; dominant displacement (P2) marginally fails at 0.815 > 0.80 threshold. **Partial graveyard entry: G25.**

### O17 fails third replication (not promoted to [robust])
**[replication failure]** — Phase 9B.

Phase 9B finds transformation 0.699 > gradient 0.543, opposite to Phase 7C (0.730 vs 0.496) and Phase 8B (0.770 vs 0.578). Reversal is driven by bridge specification quality (bottleneck vs hypernym/too-central), not pair type. O17 remains [observed] from Phases 7C/8B but is pair-specific, not type-general. NOT promoted to [robust].

---

## New Observations from Phase 10

### O25. Structure and content generalize; scale differentiates navigational landmarks
**[observed]** — Phase 10A (4 new models, 720 runs).

All 4 new models (Qwen, MiniMax, Kimi, Llama) show characteristic gaits (0.298-0.508), quasimetric asymmetry (all > 0.60), and non-zero cross-model Jaccard (mean 0.235, above 0.10 threshold), confirming R1, R2, and shared structure. Critically, the cohort bridge frequency comparison CI now includes zero (new cohort 0.721 vs original 0.817, diff -0.096, CI [-0.241, 0.064]) — bridge bottleneck structure generalizes. Qwen, MiniMax, and Kimi produce bridge frequencies comparable to the original cohort. Llama 3.1 8B is the sole outlier (mean bridge freq 0.200), revealing a scale effect: large models from different providers converge on the same navigational landmarks, while an 8B model navigates the same geometry through different landmarks. The structure/content boundary is better characterized as a structure/content/scale hierarchy.

**Sources:** `10a-model-generality.md`, `10-analysis.md` §1

### O26. Relation class significantly affects bridge survival; unrelated pre-fills are most disruptive
**[observed]** — Phase 10B (8 pairs, 4 models, 960 new runs).

Friedman chi-squared = 6.750, df = 2, p = 0.034. The three relation classes produce systematically different survival rates: unrelated (0.388) < on-axis (0.643) ≈ same-domain (0.708). Post-hoc Wilcoxon: on-axis vs unrelated p=0.025 (significant), same-domain vs unrelated p=0.036 (significant), on-axis vs same-domain p=0.889 (not significant). The operationally meaningful distinction is related (on-axis + same-domain) vs. unrelated, not the full three-way taxonomy. Unrelated pre-fills derail navigation entirely; related pre-fills (whether competing on the same axis or in the same domain) maintain the navigational context, preserving the bridge. Cohen's d for same-domain vs on-axis = 0.170 (small). The predicted ordering (on-axis < unrelated < same-domain) was wrong — only 1/8 pairs showed the predicted order.

**Sources:** `10b-relation-classes.md`, `10-analysis.md` §2

### O27. Control pair stapler-monsoon has an unintended associative bridge for non-original models
**[observed]** — Phase 10A (4 new models, 720 runs).

All 4 new models converge on strong waypoints for the "random" control pair stapler-monsoon: MiniMax and Kimi on "paper" (0.933 frequency), Qwen on "cloud" (0.867), Llama on "office" (0.800). All fail the R5 threshold of < 0.10 top-waypoint frequency. This is not a small-model phenomenon — MiniMax and Kimi are frontier-class models. The stapler→paper association is strong and predictable; the original 4 models' clean control performance may reflect their specific navigational diversity on this pair rather than the pair's inherent randomness. R5 remains valid for the original cohort but the control pair needs revision for broader generality testing.

**Sources:** `10a-model-generality.md`, `10-analysis.md` §1

---

## New Observations from Phase 11

### O28. Mistral shows record gait consistency (0.747), extending the gait range beyond the previously observed ceiling
**[observed]** — Phase 11A (720 runs).

Mistral achieves 0.936 Jaccard on music-mathematics (near-deterministic paths) and 0.934 on hot-cold. The 12-model gait spectrum now ranges from 0.258 (GPT) to 0.747 (Mistral), a 2.9x span. Gait is not bounded at ~0.58 (Claude's level) — architectural/training differences can produce even more rigid conceptual navigation.

**Sources:** `11a-expanded-generality.md`, `11-analysis.md`

### O29. All 4 control candidates fail screening — LLMs find navigable routes between any concept pair
**[observed]** — Phase 11B (240 runs, 6 models).

Turmeric-trigonometry, barnacle-sonnet, magnesium-ballet, and accordion-stalactite all fail both frequency (<0.15) and entropy (>5.0) gates for every model tested. Models find strong intermediate concepts for every pair: "bellow" for accordion-stalactite (5/6 models at 0.60-1.00), "choreography"/"movement" for magnesium-ballet, etc. The retrospective analysis shows stapler-monsoon also fails R5 for all 12 models. Single-pair control validation is not viable.

**Sources:** `11b-control-revision.md`, `11-analysis.md`

### O30. ANOVA confirms model identity drives navigational structure, not elicitation protocol
**[observed]** — Phase 11C (1,080 runs, 2×2 grid, 3 models).

Model identity η²=0.242 (p≈0.001). Waypoint count η²=0.008 (p≈0.520). Temperature η²=0.002 (p≈0.743). Interaction η²≈0.000 (p≈0.886). p-values are approximate (chi-squared approximation ignoring denominator df; per-pair cells treated as independent). Effect sizes are more reliable than exact p-values. The benchmark's structural claims are not artifacts of the 7-waypoint, 0.7-temperature protocol.

**Sources:** `11c-robustness.md`, `11-analysis.md`

### O31. Bridge frequency is the most protocol-robust structural property
**[observed]** — Phase 11C.

Mean bridge frequency exceeds 0.97 across all 5 conditions (7wp/t0.7, 5wp/t0.5, 5wp/t0.9, 9wp/t0.5, 9wp/t0.9). The range is 0.978-0.993. Bridge bottleneck behavior is insensitive to both waypoint count and temperature.

**Sources:** `11c-robustness.md`

### O32. Asymmetry detectability is waypoint-count sensitive
**[observed]** — Phase 11C.

At 5 waypoints, mean asymmetry is 0.594 (below the 0.60 threshold). At 9 waypoints, 0.669-0.684 (above). Asymmetry requires sufficient path length to manifest directional differences. The quasimetric property is real but resolution-dependent — not a protocol artifact, but a measurement sensitivity finding.

**Sources:** `11c-robustness.md`, `11-analysis.md`

---

## Falsified (Phase 10)

### ~~Bridge bottleneck generalization to new models~~ — RESURRECTED
**[resurrected]** — Phase 10A (expanded).

Originally falsified based on Llama-only data (1 model, 180 runs): new cohort mean 0.200, original 0.817, CI excluded zero. After relaxing timeout thresholds and retesting with 3 additional models (Qwen, MiniMax, Kimi), the expanded cohort (4 models, 720 runs) shows: new cohort mean 0.721, original 0.817, diff -0.096, **CI [-0.241, 0.064] includes zero**. Bridge bottleneck structure DOES generalize across providers and architectures for comparable-scale models. The original finding was an artifact of testing only a single small model (Llama 8B). **G26 resurrected (retained as historical record in graveyard).** The Llama-specific finding is retained within O25 as a scale effect.

### ~~Predicted relation class ordering (on-axis < unrelated < same-domain)~~
**[falsified]** — Phase 10B.

Predicted that on-axis substitutes would be the most disruptive pre-fills, with ordering on-axis < unrelated < same-domain in >= 5/8 pairs. Observed: 1/8 pairs showed the predicted ordering. Actual ordering: unrelated (0.388) < on-axis (0.643) ≈ same-domain (0.708). The Friedman test confirming that relation class matters survives; the predicted mechanism (dimensional competition) does not. The disruption mechanism is about maintaining vs. destroying navigational context, not about competing on the same semantic dimension. **Graveyard entry: G27.**

---

## Falsified (Phase 11)

### ~~Control pair revision — all candidates pass screening~~
**[falsified]** — Phase 11B.

Predicted at least 2/4 new control candidates would pass both frequency (<0.15) and entropy (>5.0) screening gates. 0/4 passed. LLMs are creative enough to find navigable routes between any two concepts. The single-pair, strict-threshold control design is fundamentally inadequate. **Graveyard entry: G28.**

### ~~R2 asymmetry universal across all waypoint/temperature conditions~~
**[falsified]** — Phase 11C.

Predicted mean asymmetry > 0.60 for all waypoint count and temperature conditions. Observed: 5-waypoint conditions fall below the threshold (0.594, 0.593). Asymmetry is resolution-dependent — detectable at 9 waypoints but not reliably at 5. **Graveyard entry: G29.**

---

## Deferred Claims

- **Cross-model bridge agreement as mechanism for path convergence** — Phase 4A found r=-0.283 between bridge frequency difference and cross-model Jaccard. Suggestive but limited sample. Needs larger triple set. Phase 10A's expanded cross-model matrix (28 pairs) may enable re-analysis.
- **Gemini's mechanistic deficit** — Real (mean 0.480 vs ~0.67 non-Gemini) but three mechanistic characterizations falsified. May require multi-variable model or different experimental paradigm to characterize.
- **Multi-variable bridge fragility model** — Both competitor count (G20) and dominance ratio (G23) fail as single-variable predictors. A model incorporating pre-fill content, bridge structural role, and dominance jointly may succeed.
- **Scale-dependent bridge convergence threshold** — Phase 10A suggests large models converge on the same bridges while Llama 8B diverges. What's the threshold? Is it parameter count, training data volume, or capability level? Would a 70B Llama show the same bridges as frontier models?
- **Control pair revision** — All 4 new candidates and stapler-monsoon fail R5 for all 12 models (O27, O29). Single-pair strict-threshold validation is not viable. Needs fundamentally different approach — e.g., relative consistency ratios, pair batteries, or redefinition of the control criterion.
