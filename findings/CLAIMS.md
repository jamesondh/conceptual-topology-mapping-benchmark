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

Claude navigates with 2.2x higher consistency than GPT (avg Jaccard 0.578 vs 0.258). This gap is stable across 5 phases and 9,500+ runs. Grok (0.293) and Gemini (0.372) fall between. The consistency profile predicts downstream behavior: Claude's rigidity produces the strongest positional signals (Phase 5C W-shape), GPT's variability produces the broadest bridge exploration, Gemini's fragmentation produces systematic cross-frame failures.

**Sources:** `01-pilot-analysis.md` §2, `05-analysis.md` §7 (Phase 1 gaits and Phase 5 predictions)

### R2. Conceptual navigation is fundamentally asymmetric (quasimetric)
**[robust]** — Phase 2 (primary), Phase 3B (triangle inequality), Phases 4-5 (consistent with).

Mean directional asymmetry 0.811 across 84 pair/model combinations. 87% show statistically significant asymmetry (permutation test, p < 0.05). The symmetry axiom fails comprehensively. Triangle inequality holds in 91% of cases (Phase 3B), 93.8% (Phase 4B), and 90.6% (Phase 7B) — a structural constant across three independent samples. Conceptual space satisfies all metric axioms *except* symmetry — the formal definition of a quasimetric space.

**Sources:** `02-reversals-analysis.md` §1, `03-analysis.md` §3, `04-analysis.md` §6, `07b-curvature.md`

### R3. Polysemy sense differentiation is genuine
**[robust]** — Phase 1 (original, corrected in Phase 2), Phase 5B (extended).

Cross-pair Jaccard of 0.011-0.062 for bank/bat/crane polysemy groups (Phase 2 corrected values). Different sense targets produce genuinely different paths. Phase 5B extends this: polysemous concepts create forced crossing points, and the routing is clean — cross-axis bridge frequency can be *higher* than same-axis when the polysemous concept is the only connection.

**Sources:** `02-reversals-analysis.md` §5, `05-analysis.md` §3

### R4. Hierarchical paths are compositional
**[robust]** — Phase 3B (primary), replicated in Phases 4-5.

Hierarchical triples show 4.9x higher waypoint transitivity than random controls (0.175 vs 0.036, non-overlapping CIs). Bridge concepts appear systematically for taxonomic triples (dog at 15-100% for animal-dog-poodle) and never for random controls (stapler at 0%, flamingo at 0%). This is the strongest evidence that conceptual navigation reflects genuine geometric structure, not word association.

**Sources:** `03-analysis.md` §2, `03b-transitivity.md`

### R5. Controls validate cleanly
**[robust]** — Phases 1-5.

Nonsense controls show near-zero consistency (Jaccard 0.062, entropy 6.37). Random bridge concepts never appear on paths (0% bridge frequency across all phases). This eliminates artifact explanations: the structure we measure in experimental conditions is not an artifact of the elicitation task, limited vocabulary, or formulaic responses.

**Sources:** `01-pilot-analysis.md` §3, `03-analysis.md` §2

### R6. Bridge concepts are bottlenecks, not associations
**[robust]** — Phases 3-5 (converging evidence from multiple findings).

A concept serves as a navigational bridge when it is the *necessary intermediate step* in the most natural decomposition of the endpoint relationship, not merely when it is associated with both endpoints. Converging evidence: "spectrum" works (names the mechanism, 1.00 all models), "metaphor" fails (associated but off-axis, 0.00 all models), "germination" outperforms "plant" (process-naming > object-naming), "fire" fails (too-central, skipped), loan-bank-shore succeeds (only connection, 0.95-1.00).

**Sources:** `04-analysis.md` §1+§3, `05-analysis.md` §2+§3+§4

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

Mean bridge displacement under pre-fill is 0.515 (CI [0.357, 0.664], excludes zero). Bridges are genuinely vulnerable to early anchoring — mean survival rate drops to 0.460 under pre-fill conditions (vs 0.807 unconstrained). Taxonomic bridges resist displacement (animal-poodle "dog" at 0.140 vs 0.515 heading-bridges), confirming hierarchical paths are structurally distinct. Claude shows the highest displacement (0.567), consistent with rigid gaits producing the strongest anchoring effects. However, the incongruent vs congruent distinction is not cleanly separated (0.515 vs 0.436, overlapping CIs), leaving the directional-heading vs associative-primacy mechanism unresolved.

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

### ~~Too-central is a clean binary category~~
**[falsified]** — Phase 7C.

Predicted too-central bridges would have frequency < 0.15 and obvious-useful > 0.40, with a gap > 0.35. Observed gap 0.287, CI [-0.063, 0.587] includes zero. The too-central/obvious-useful distinction is not a binary; it's a gradient with substantial overlap. Acorn-timber "tree" is categorized as too-central but has 1.00 frequency for 3/4 models. **Graveyard entry: G18.**

---

## Deferred Claims (Awaiting Phase 8+ Data)

- **Multiverse robustness** — How robust are R1-R7 across different waypoint counts, prompt formats, and temperature settings? Deferred to pre-paper robustness phase.
- **Cross-model bridge agreement as mechanism for path convergence** — Phase 4A found r=-0.283 between bridge frequency difference and cross-model Jaccard. Suggestive but limited sample. Needs larger triple set.
- **Bridge fragility mechanism** — What determines whether a bridge survives pre-filling? H8 identifies the bimodal pattern but the underlying variable (route exclusivity? semantic distance? cue strength?) is unknown.
