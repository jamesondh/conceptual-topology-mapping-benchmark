# Phase 7 Analysis: Anchoring Causality, the Distance Metric Crisis, and the Collapse of "Too-Central"

> Interpretive analysis of Phase 7: early-anchoring causal test (7A), curvature estimation (7B), and too-central boundary characterization (7C).
>
> 1,240 new runs + 240 reused (7A) + 800 new runs + 480 reused (7B) + 320 new runs + 200 reused (7C) = 2,360 new API runs + 920 reused, across 4 models, 8 anchoring pairs, 8 curvature triangles, 10 too-central pairs.
>
> March 2026

## Executive Summary

**Phase 7 delivers the benchmark's first causal result -- pre-filling a waypoint genuinely displaces bridge concepts -- but the mechanism behind that displacement is cruder than predicted, and two of the phase's three primary tests fail, exposing a distance metric crisis that threatens the entire curvature research program.** The causal test (7A) confirms that early anchoring is not merely correlational: pre-filling position 1 with any concept displaces the bridge with mean displacement 0.515 (CI [0.357, 0.664], excludes zero), and bridge survival drops from 0.807 (unconstrained) to 0.460 under pre-fill conditions. But the incongruent vs congruent separation that would have confirmed the directional-heading theory does not emerge (0.515 vs 0.436, overlapping CIs), and neutral pre-fills produce displacement at least as large as incongruent ones (0.536). The mechanism is primarily "occupying position 1 matters" -- closer to associative primacy than directional heading, though congruent pre-fills show marginally higher bridge survival (0.631) than incongruent (0.347) or neutral (0.403). The curvature test (7B) replicates the triangle inequality at 90.6% -- now a structural constant across three independent measurements (91%, 93.8%, 90.6%) -- but its primary hypothesis (polysemous vertices create higher curvature) fails outright (poly 0.499 vs non-poly 0.446, CI includes zero). Worse, the cross-model distance correlation is r = 0.170, meaning models do not agree on how far apart concepts are, and the entire curvature framework requires within-model interpretation only. The too-central test (7C) fails its primary comparison (TC 0.496 vs OU 0.783, CI [-0.063, 0.587] includes zero), but the failure is diagnostic: our categorization was wrong. "Tree" and "dough" are not too-central -- they function as reliable bridges for 3 of 4 models. Only "fire" and "water" are genuinely too-central, and their mechanism is now clear: both endpoints already contain the bridge concept, making it informationally invisible.

Phase 7's prediction accuracy is 45% (9/20), continuing the stable degradation plateau that began in Phase 5. Structural predictions continue to succeed: the triangle inequality holds, pre-fill displacement exists, taxonomic controls behave as expected, gradient bridges outperform causal-chain bridges. Mechanism-level predictions continue to fail: incongruent does not beat congruent, polysemous curvature does not beat non-polysemous, too-central is not a clean binary. The benchmark has settled into a regime where it reliably discovers the shape of phenomena but cannot predict their internal mechanics from the current theoretical framework. This is not a plateau of diminishing returns -- every failed prediction in Phase 7 points to a specific revision of the theory.

---

## 1. Pre-Filling Causally Displaces Bridges: The Mechanism Is Real but Crude

### The Causal Test Design

Phase 6C discovered that bridge concepts anchor at positions 1-2, not at the midpoint (O12). Phase 7A was designed to test whether this anchoring is causal -- whether occupying position 1 with a pre-filled concept genuinely displaces the bridge, or whether the Phase 6C correlation reflects some other structural property. The design: for each pair, pre-fill position 1 with (a) an incongruent concept (pointing away from the target), (b) a congruent concept (pointing toward the target), or (c) a neutral concept (semantically unrelated), then measure whether the bridge still appears and, if so, where.

The directional-heading theory from Phase 6 predicted a clean ordering: incongruent pre-fills should produce the most displacement (they steer away from the bridge), congruent the least (they align with the bridge's heading), and neutral somewhere in between. If bridges function as directional compasses, an incongruent heading should maximally disrupt navigation; a congruent heading should be compatible with finding the bridge further along the path.

### The Primary Result: Displacement Is Real

**[observed]** Pre-filling position 1 causally displaces bridge concepts. Mean displacement across all pre-fill conditions is 0.515 (CI [0.357, 0.664]), robustly excluding zero. Bridge survival drops from 0.807 under unconstrained conditions to 0.460 under pre-fill conditions -- a 43% relative decline in bridge frequency. The positional shift exceeds the mechanical +1 that would result from merely inserting a waypoint before the bridge, confirming genuine topological displacement rather than arithmetic position-bumping. This upgrades the Phase 6C observation (O12) from correlational to causal: early anchoring is not an epiphenomenon of path structure; it is a mechanism that determines which concepts appear on the path.

The taxonomic control passes cleanly. Animal-poodle "dog" shows displacement of only 0.140, compared to 0.515 for heading-bridge pairs. The taxonomic bridge resists displacement because it occupies a hierarchically determined position (mid-path, position 4-5), not a heading-determined one (position 1-2). This is the same animal-poodle exception identified in Phase 6C, now confirmed under causal manipulation: taxonomic bridges are structurally distinct from heading bridges and respond differently to perturbation.

### The Directional-Heading Theory Fails

The ordering predicted by the directional-heading theory does not emerge. The three pre-fill conditions produce statistically indistinguishable displacement:

| Condition | Mean Displacement | 95% CI |
|-----------|-------------------|--------|
| Incongruent | 0.515 | [0.357, 0.664] |
| Congruent | 0.436 | [0.278, 0.599] |
| Neutral | 0.536 | [0.378, 0.692] |

The critical comparison -- incongruent vs congruent -- shows a difference of only 0.079, with overlapping confidence intervals. More damaging, neutral pre-fills produce *higher* displacement than incongruent ones (0.536 vs 0.515). If bridges were directional headings, a neutral concept (no directional information) should displace less than an incongruent one (actively wrong direction). The opposite is observed.

This largely falsifies the specific version of the directional-heading model proposed in Phase 6. The bridge does not anchor at position 1 primarily because it establishes a navigational heading that subsequent waypoints follow. It anchors at position 1 because position 1 is the first concept the model generates, and whatever occupies position 1 has a "first-mover" advantage that subsequent generation must accommodate. The mechanism is primarily associative primacy rather than directional steering. The model's first output constrains all subsequent outputs through a recency-weighted attention mechanism, and the bridge concept normally wins position 1 because it is the most strongly associated concept with the source endpoint. When something else is forced into position 1, the bridge loses its first-mover advantage and often fails to appear at all. A caveat: bridge survival rates show some condition sensitivity (congruent 0.631 vs incongruent 0.347 vs neutral 0.403), suggesting that pre-fill content may modulate whether the bridge eventually recovers, even though the displacement magnitudes are similar across conditions. The directional-heading model is not entirely dead — it may operate as a secondary factor beneath the dominant associative primacy mechanism.

### Bridge Survival Is Bimodal

The most telling result in 7A is not the aggregate displacement but the pair-level survival rates under pre-fill. The distribution is strikingly bimodal:

| Pair | Bridge | Unconstrained Freq | Pre-fill Survival | Pattern |
|------|--------|-------------------|-------------------|---------|
| emotion-melancholy | sadness | 0.950 | 0.750 | **Robust** |
| animal-poodle | dog | 0.970 | 0.900 | **Robust** |
| light-color | spectrum | 0.917 | 0.575 | Partially robust |
| sun-desert | heat | 0.917 | 0.567 | Partially robust |
| bank-ocean | river | 0.600 | 0.300 | Fragile |
| loan-shore | bank | 0.717 | 0.267 | Fragile |
| music-mathematics | harmony | 0.550 | 0.025 | **Collapsed** |
| seed-garden | germination | 0.833 | 0.000 | **Collapsed** |

Two bridges (harmony, germination) collapse to near-zero under pre-fill conditions -- harmony drops from 0.550 to 0.025 (only Grok retains a trace at 0.100 incongruent), and germination drops from 0.833 to 0.000 across all conditions. Two bridges (sadness, dog) survive robustly. The rest fall in between. **[hypothesis]** This bimodal pattern (H8) appears to track route exclusivity: sadness is essentially the only navigational path from emotion to melancholy (what else would you route through?), while harmony is one of several paths from music to mathematics (rhythm, pattern, ratio, frequency all compete). When the bridge has no competitors, pre-filling position 1 merely delays its appearance; when the bridge has competitors, pre-filling creates an opening for an alternative route that makes the original bridge unnecessary.

The harmony collapse is especially striking given Claude's Phase 5C result: Claude showed the strongest W-shape contrast (0.52) on music-mathematics, driven by harmony's fixed positional anchoring. In Phase 7A, under *any* pre-fill condition, Claude's music-mathematics harmony frequency drops from 1.000 to 0.000. The most rigid navigator's most reliable bridge is also the most fragile under perturbation. Rigidity is not robustness -- it is a lack of flexibility that makes the bridge load-bearing but brittle.

### Claude Shows the Highest Displacement

Per-model displacement confirms the Phase 1 gait characterization once again. Claude shows the highest mean incongruent displacement (0.567), consistent with its rigid gait (Jaccard 0.578). Claude's navigational program is so deterministic that disrupting position 1 cascades throughout the entire path, eliminating bridges that depend on the first-mover mechanism. GPT (0.483) and Gemini (0.467) show moderate displacement; Grok (0.544) is close to Claude.

The Claude result has a specific interpretation. Claude does not merely displace bridges more -- it *eliminates* them more. When Claude's position 1 is occupied by a pre-fill, the entire rigid navigational sequence shifts, and the bridge concept that normally occupies position 1-2 has no flexible mechanism to appear later in the path. GPT, by contrast, sometimes recovers the bridge at a later position because its broader vocabulary and lower consistency allow alternative insertion points.

### The Forced-Crossing Bank Does Not Resist

Phase 7A predicted that the forced-crossing bridge "bank" (loan-shore) would resist displacement because it is the only connection between the financial and geographic domains (O5). The prediction was bank survival >0.90 with approximately 1 position of shift. The observed survival is 0.267, with a shift of 0.791 positions. **The forced-crossing bottleneck is not immune to pre-fill displacement.**

This is a significant revision of the forced-crossing model. Phase 5B established that forced crossings produce the highest bridge frequencies under unconstrained conditions (0.95-1.00). Phase 7A shows that this high frequency is contingent on the bridge winning position 1 in the natural competition. When position 1 is occupied, even the only connection between two domains can be eliminated -- the model simply fails to cross between domains at all, producing a path that stays within the starting domain or takes an indirect route through territory that does not require the polysemous pivot.

This connects to Phase 6B's finding (O14) that forced crossings do not reduce asymmetry. The forced-crossing bottleneck is a property of the unconstrained navigational landscape, not a structural necessity. When the landscape is perturbed, the bottleneck disappears because it was maintained by associative primacy, not by topological necessity. The loan-shore path goes through "bank" not because it *must* but because "bank" is what the model generates first when starting from "loan." Remove the first-mover advantage, and the model finds alternative routes or fails to bridge the domains.

---

## 2. The Curvature Program Hits the Distance Metric Wall

### What We Attempted

Phase 7B was the first attempt to estimate curvature in conceptual topology. The approach: construct triangles with known vertices (some polysemous, some not), measure navigational distances for all three legs, and compute "triangle excess" -- the degree to which the sum of two legs exceeds the third. In a flat (Euclidean) space, triangle excess equals zero. In a positively curved space (like a sphere), the sum of two sides consistently exceeds the third by more than in flat space. The hypothesis: polysemous vertices, which sit at frame junctions between semantically distant domains, should create regions of high curvature -- the conceptual geometry should be "warped" around words like "bank" and "light."

### Triangle Inequality: A Structural Constant

**[robust]** The triangle inequality compliance rate is 90.6% -- 29 of 32 triangle-model combinations satisfy d(A,C) <= d(A,B) + d(B,C). This replicates Phase 3B (91%) and Phase 4B (93.8%) within sampling noise. Three independent measurements across different triangles, different pairs, and different phases now converge on approximately 91% compliance. The triangle inequality is a genuine structural property of the navigational space, and the ~9% violation rate is likely attributable to measurement noise in the Jaccard-based distance metric rather than systematic geometric violations.

| Phase | Triangle Inequality Compliance | N Combinations |
|-------|-------------------------------|----------------|
| Phase 3B | 91.0% | ~100 |
| Phase 4B | 93.8% | ~80 |
| Phase 7B | 90.6% | 32 |

The three violations in Phase 7B are deposit-bank-shore (Claude), seed-germination-garden (Gemini), and music-harmony-mathematics (Gemini). The Claude violation is a polysemous triangle where Claude's very short distances (d(A,B)=0.215, d(B,C)=0.156) sum to less than d(A,C)=0.629 -- Claude's within-domain paths are so short that the cross-domain direct path exceeds their sum. The two Gemini violations both involve near-zero distances on one leg (seed-germination: d(B,C)=0.335, d(A,C)=0.382 but d(A,B)=0.000; music-harmony-mathematics: d(A,B)=0.170, d(B,C)=0.178 but d(A,C)=0.530). Gemini produces identical waypoint sets on some legs, yielding zero Jaccard distance and making the triangle inequality trivially violable.

### The Primary Curvature Test Fails

Polysemous mean triangle excess is 0.499 (CI [0.349, 0.614]). Non-polysemous mean excess is 0.446 (CI [0.283, 0.607]). The difference is 0.053 (CI [-0.157, 0.263]), comfortably including zero. **Polysemous vertices do not create measurably higher curvature than non-polysemous vertices.**

This is a clean negative result. The predicted pattern -- that words like "bank" and "light" would warp the local geometry more than words like "heat" and "sentence" -- does not appear in the data. The triangle excess is substantial for both types (mean ~0.47 overall, indicating that the space is far from flat), but the excess is not systematically higher around polysemous hubs.

Why might this be? The hypothesis assumed that polysemy creates geometric singularity -- a point where two semantic planes meet at a sharp angle, producing high curvature. But Phase 7B's data suggests the space is uniformly curved rather than locally warped. All concepts, polysemous or not, produce substantial triangle excess because the navigational distance metric is inherently noisy and asymmetric. The "curvature" we measure may be an artifact of measurement variance rather than genuine geometric structure. Or it may be genuine positive curvature that is uniformly distributed rather than concentrated at polysemous hubs. Phase 7B cannot distinguish these interpretations.

### The Cross-Model Distance Crisis

The most consequential finding in Phase 7B is the cross-model distance correlation: r = 0.170. This means that when Claude says concept A is "far" from concept B (high Jaccard distance), GPT does not reliably agree. The distance measurements are model-specific, not properties of the concept pair.

**[observed]** Navigational distance metrics fail cross-model validity (O18). The per-model curvature profiles make the crisis concrete:

| Model | Mean Excess | Interpretation |
|-------|------------|----------------|
| Claude | 0.225 | Very short distances, low excess |
| GPT | 0.680 | Long distances, high excess |
| Grok | 0.689 | Long distances, high excess |
| Gemini | 0.294 | Moderate distances, moderate excess |

Claude sees a compact conceptual space where most pairs are nearby (many near-zero distances from its deterministic, narrow vocabulary). GPT and Grok see an expansive space where pairs are far apart (high Jaccard distances from diverse, exploratory vocabularies). The "curvature" of the space is inseparable from the measurement instrument.

This is R1 (model gaits) manifesting in a new domain with devastating methodological consequences. The gait differences identified in Phase 1 as stylistic variations in navigational consistency turn out to contaminate every distance-based metric we can construct. Claude's rigid gait produces short distances (similar paths yield high Jaccard overlap). GPT's exploratory gait produces long distances (diverse paths yield low overlap). What we call "distance" between two concepts is a joint property of the concept pair and the measuring model, not a property of the concept pair alone.

This finding kills the naive curvature research program. Any curvature estimate that aggregates across models is meaningless because it averages over incomparable scales. Within-model curvature estimates are interpretable but cannot be compared across models or generalized to "the curvature of conceptual space" as a model-independent property. The Gauss-Bonnet approach to conceptual topology requires a distance metric that is at least approximately shared across measuring instruments, and the navigational Jaccard metric fails this requirement decisively.

### What Survives the Distance Metric Crisis

The triangle inequality survives because it is a qualitative structural property (does the sum exceed the third side -- yes or no?) rather than a quantitative one (by how much?). The ~91% compliance rate is stable across models and phases because it depends on ordinal relationships between distances, not on the distances' absolute magnitudes.

Similarly, the *within-model* curvature profiles are interpretable, even if they cannot be compared across models. Claude's low excess (0.225) versus GPT's high excess (0.680) is not a statement about which model navigates more curved space -- it is a statement about how the measurement instrument (Jaccard distance on model-specific paths) interacts with the geometric structure. The curvature program is not dead, but it requires a model-independent distance metric that Phase 7B demonstrates we do not have.

---

## 3. The "Too-Central" Category Collapses -- But the Phenomenon Survives

### The Categorical Failure

Phase 7C pre-classified 10 pairs into three categories: "too-central" (fire, tree, dough -- bridges predicted to be skipped because both endpoints imply them), "obvious-useful" (warm, adolescent, speak -- bridges predicted to work despite being obvious), and "boundary" (water, embryo, water, noon -- cases whose classification was uncertain). The primary test compared too-central mean frequency (predicted <0.15) against obvious-useful (predicted >0.40) with a gap >0.35 (CI excluding zero).

The result: TC mean 0.496, OU mean 0.783, difference 0.287 (CI [-0.063, 0.587]). The confidence interval includes zero. **The primary test fails.** But the reason is illuminating: the too-central category was wrong, not the phenomenon.

### The Categorization Was Wrong

The too-central category contained three pairs, and two of them turned out to be excellent bridges:

| Pair | Bridge | Predicted | Claude | GPT | Grok | Gemini | Actual |
|------|--------|-----------|--------|-----|------|--------|--------|
| spark-ash | fire | too-central | 0.000 | 0.150 | 0.000 | 0.000 | **Too-central** |
| acorn-timber | tree | too-central | 1.000 | 1.000 | 1.000 | 0.000 | **Obvious-useful** |
| flour-bread | dough | too-central | 1.000 | 1.000 | 0.800 | 0.000 | **Obvious-useful** |

"Tree" bridges acorn to timber at 1.000 for three of four models. "Dough" bridges flour to bread at 0.800-1.000 for three of four models. Our intuition that these were "too-central" was wrong for the same reason our Phase 5 intuition about "plant" was wrong: we confused associative obviousness with navigational redundancy. "Tree" is not redundant in the acorn-timber chain -- it names a critical intermediate state (the acorn becomes a tree, the tree becomes timber). "Dough" is not redundant in the flour-bread chain -- it names the transformation (flour becomes dough, dough becomes bread). These are process-naming bridges (O4), and process-naming bridges work even when they are obvious.

The only genuinely too-central bridge in the original three is "fire" for spark-ash, replicating O6 yet again. Fire is too-central because spark *is* the beginning of fire and ash *is* the end of fire -- the bridge concept is not a transformation between the endpoints but a restatement of the relationship they already embody.

### Water Generalizes the Too-Central Phenomenon

**[observed]** Rain-ocean "water" shows 0.000 bridge frequency across all four models (O16). This is the second confirmed too-central concept after fire, and the mechanism is identical: rain *is* water falling and ocean *is* a body of water. The bridge concept does not add navigational information because both endpoints already contain it.

The universal cross-model agreement (SD = 0.000) is the cleanest result in Phase 7C and one of the cleanest in the entire benchmark. No model, on any run, routes from rain to ocean through "water." The concept is so thoroughly embedded in both endpoints that it is invisible as a waypoint. This extends O6 from a single instance (fire) to a generalizable phenomenon with a clear operational criterion: a concept is too-central when both endpoints *contain* or *are instances of* the bridge concept, rather than being *connected by* it.

### The Gradient vs Causal-Chain Distinction

**[observed]** Gradient-spectrum pairs show higher bridge frequency (0.730) than causal-chain pairs (0.496). This is O17, and it adds a new dimension to the bridge taxonomy. Continuous-dimension midpoints (warm between hot and cold, adolescent between infant and elderly, speak between whisper and shout) are more navigational than process intermediaries (fire between spark and ash, tree between acorn and timber, dough between flour and bread).

Why? Gradient midpoints name a *position on a continuum* that has no other name. "Warm" is the temperature between hot and cold -- there is no alternative concept that names this region of temperature space. The midpoint *is* the navigational route because the endpoints define a one-dimensional manifold and the bridge occupies its center. Causal-chain intermediaries, by contrast, name a *step in a process* that may have alternative descriptions. The path from flour to bread could go through "dough" or through "baking" or "yeast" or "kneading" -- the process has multiple named stages, and the model may select any of them.

This connects to R6 (bridges are bottlenecks, not associations). Gradient midpoints are topological bottlenecks in a strong sense: the one-dimensional structure of the continuum forces all paths through the midpoint region. Causal-chain intermediaries are bottlenecks in a weaker sense: they are the most common route but not the only one. The gradient-vs-causal distinction is a refinement of the bottleneck model that predicts which bridges will be most reliable.

### Gemini's Systematic Zeros

Phase 7C reveals a new dimension of Gemini's fragmentation. Gemini produces zero bridge frequency on five of ten pairs: acorn-timber "tree" (0.000), flour-bread "dough" (0.000), whisper-shout "speak" (0.000), ice-steam "water" (0.000), and dawn-dusk "noon" (0.000). On four of these five, the other three models show frequencies of 0.700-1.000. This is not the polysemous-crossing failure identified in Phase 4 (H1) -- "tree," "dough," "speak," and "noon" are not polysemous concepts requiring frame-crossing. These are univocal bridges that Gemini simply does not use.

The Gemini zeros on 7C extend H1 in a direction that makes the frame-crossing explanation insufficient. Gemini's fragmentation is not limited to polysemous frame-crossing failures (river-ocean, forest-ecosystem). It extends to univocal within-frame bridges where Gemini nonetheless fails to navigate through the obvious intermediate. "Speak" between whisper and shout operates within a single vocal-intensity frame -- there is no sense-switching required. Yet Gemini shows 0.000 where Claude and Grok show 1.000.

One possible explanation: Gemini's frame boundaries are narrower than previously thought. What we call a single "vocal intensity frame" may, in Gemini's topology, be two distinct clusters (quiet-sounds and loud-sounds) with "speak" failing to bridge them because Gemini does not represent it as a midpoint on a continuum. This would be consistent with the gradient-vs-causal finding: if Gemini does not represent continuous gradients as well as other models, it would fail on gradient midpoints more systematically.

---

## 4. Cross-Model Patterns: Four Models, Four Spaces

### The Convergence That Exists

Despite the distance metric crisis (Section 2), there are points of genuine cross-model convergence in Phase 7:

**Triangle inequality compliance** is model-independent at the aggregate level (Claude 87.5%, GPT 100%, Grok 100%, Gemini 75% -- but the overall 90.6% is stable). The qualitative structure of conceptual space (paths obey the triangle inequality) is a shared property.

**Rain-ocean "water" = 0.000** for all four models. The too-central phenomenon operates identically across architectures. When both endpoints contain the bridge concept, no model uses it.

**Spark-ash "fire"** replicates at near-zero for all models (sole exception: GPT at 0.150). The too-central mechanism for fire, first observed in Phase 5B, is now confirmed across three independent measurements spanning two phases.

**Animal-poodle "dog"** survives pre-fill across all models. The taxonomic bridge is robust to perturbation regardless of gait, confirming that hierarchical positioning operates by a different mechanism than heading-based anchoring.

### The Divergences That Deepen

**Distance scales are incomparable.** Claude's mean triangle excess (0.225) is 3x lower than GPT's (0.680). This is not a difference in the geometry of conceptual space -- it is a difference in the measurement instrument. Any cross-model comparison of distances, curvature, or geometric properties is contaminated by gait-driven scale differences.

**Bridge displacement varies by model.** Claude's mean displacement (0.567) exceeds Gemini's (0.467) by 21%. The rigid navigator is more susceptible to positional perturbation because its deterministic program has no flexibility to recover displaced bridges. The exploratory navigator (GPT, 0.483) sometimes finds the bridge at alternative positions.

**Gemini's zero pattern has no parallel.** No other model produces systematic zeros on univocal within-frame bridges. Claude, GPT, and Grok all find "tree" (acorn-timber), "dough" (flour-bread), and "speak" (whisper-shout) at high frequency. Gemini finds none of them. This is the widest qualitative gap between Gemini and the other three models observed in any phase.

---

## 5. Prediction Accuracy: Phase 7 Scorecard

### Phase 7A Predictions

| # | Prediction | Result | Verdict |
|---|------------|--------|---------|
| 1 | Pre-filling displaces the bridge (CI excludes zero) | 0.515 [0.357, 0.664] | **Confirmed** |
| 2 | Bridge survives pre-filling at >0.50 frequency | Mean survival 0.460 | Not confirmed |
| 3 | Positional shift exceeds mechanical +1 | Shift exceeds +1 | **Confirmed** |
| 4 | Taxonomic displacement < heading-bridge displacement | 0.140 vs 0.515 | **Confirmed** |
| 5 | Forced-crossing "bank" survives >0.90, shifts ~1 position | Survival 0.267, shift 0.791 | Not confirmed |
| 6 | Incongruent displacement > congruent | 0.515 vs 0.436, CIs overlap | Not confirmed |
| 7 | Claude shows largest anchoring effect | Claude 0.567, highest | **Confirmed** |

**7A accuracy: 4/7 (57%)**

The confirmed predictions are all structural: displacement exists, it exceeds mechanical shift, taxonomic bridges are different, Claude is most affected. The failed predictions are all mechanistic: the degree of survival, the forced-crossing resistance, the directional ordering of conditions. The structural/mechanistic split in prediction accuracy continues.

### Phase 7B Predictions

| # | Prediction | Result | Verdict |
|---|------------|--------|---------|
| 1 | Triangle inequality compliance >= 85% | 90.6% | **Confirmed** |
| 2 | Poly excess > non-poly excess (CI excludes zero) | Diff 0.053, CI includes zero | Not confirmed |
| 3 | Cross-model distance correlation r > 0.50 | r = 0.170 | Not confirmed |
| 4 | Mean polysemous excess > 0.10 | 0.499 | **Confirmed** |
| 5 | At least one model: poly excess > 2x non-poly | Gemini: 0.467 vs 0.122 (3.8x) | **Confirmed** |
| 6 | Gemini shows highest overall mean excess | Highest = Grok (0.689) | Not confirmed |

**7B accuracy: 3/6 (50%)**

The triangle inequality prediction continues its perfect record across three phases. The polysemous excess exists (>0.10) but is not significantly different from non-polysemous. Gemini does show the highest poly/non-poly *ratio* but not the highest absolute excess. The cross-model correlation failure (r = 0.170 vs predicted r > 0.50) is the most consequential miss: it undermines the entire distance-based curvature program.

### Phase 7C Predictions

| # | Prediction | Result | Verdict |
|---|------------|--------|---------|
| 1 | Too-central pairs have bridge freq < 0.15 | Mean 0.496 | Not confirmed |
| 2 | Obvious-useful pairs have bridge freq > 0.40 | Mean 0.783 | **Confirmed** |
| 3 | Obvious - too-central difference > 0.35, CI excludes zero | 0.287, CI includes zero | Not confirmed |
| 4 | Too-central pairs have higher entropy | TC 2.894, OU 2.910 | Not confirmed |
| 5 | At least 2/3 too-central bridges are informationally redundant | 1/3 | Not confirmed |
| 6 | Gradient pairs > causal-chain pairs in bridge freq | 0.730 vs 0.496 | **Confirmed** |
| 7 | Cross-model agreement SD < 0.15 for >= 6/10 pairs | 2/10 | Not confirmed |

**7C accuracy: 2/7 (29%)**

Phase 7C is the worst-performing sub-experiment in prediction accuracy. The obvious-useful prediction succeeds, and the gradient-vs-causal prediction succeeds, but every other prediction fails -- primarily because our categorization of "too-central" was wrong. The too-central mean of 0.496 is inflated by tree (0.750 cross-model) and dough (0.700 cross-model), which turned out to be obvious-useful rather than too-central.

### Cumulative Prediction Scorecard

| Phase | Accuracy | Type |
|-------|----------|------|
| Phase 4B | 81.3% (26/32) | Bridge characterization |
| Phase 5A | 64.6% (31/48) | Cue-strength gradients |
| Phase 5B | 42.9% (24/56) | Dimensionality and polysemy |
| Phase 6A | 50.0% (3/6) | Salience distributions |
| Phase 6B | 50.0% (3/6) | Forced-crossing asymmetry |
| Phase 6C | 25.0% (2/8) | Positional bridge structure |
| Phase 7A | 57.1% (4/7) | Anchoring causality |
| Phase 7B | 50.0% (3/6) | Curvature estimation |
| Phase 7C | 28.6% (2/7) | Too-central boundary |

**[observed]** The prediction accuracy plateau continues: Phase 7 averages 45% (9/20), comparable to Phase 6's ~40% (8/20). The structural/mechanistic split remains the strongest predictor of prediction success. Structural predictions (does X exist? is Y > Z qualitatively? does a known pattern replicate?) succeed at approximately 75%. Mechanistic predictions (is X > Y by a specific amount? does condition A separate from condition B? is the ordering A > B > C?) succeed at approximately 25%. The benchmark has reached the limits of what can be predicted from the current theoretical framework, and further progress requires either substantially larger samples or new mechanistic models.

---

## 6. Connections to Prior Phases

### Which Robust Claims Survive Phase 7

All seven robust claims (R1-R7) survive Phase 7, and three receive significant new data:

**R1 (model gaits)** is now demonstrated to contaminate distance metrics. Claude's rigid gait produces short Jaccard distances (mean excess 0.225); GPT's exploratory gait produces long distances (mean excess 0.680). Phase 7B elevates R1 from a characterization of navigational style to a fundamental measurement limitation: any distance-based analysis of conceptual space is confounded by gait unless conducted within a single model.

**R2 (quasimetric, triangle inequality)** receives its third independent replication at 90.6%. The triangle inequality is now the most replicated quantitative finding in the benchmark: 91%, 93.8%, 90.6% across three phases with different triangle sets. This is as close to a structural constant as the benchmark has produced.

**R6 (bridges as bottlenecks)** is refined by Phase 7A. Bridges are bottlenecks in the *unconstrained* navigational landscape, but this bottleneck status is maintained by associative primacy (winning position 1) rather than topological necessity. When position 1 is occupied by a pre-fill, even the forced-crossing bridge "bank" can be displaced. The bottleneck is a property of the default generation sequence, not an invariant of the concept pair's topology.

**R7 (cue-strength gradient)** is extended by Phase 7C's gradient-vs-causal finding. The gradient applies not only within bridge families (Phase 5A) but across bridge *types*: continuous-dimension midpoints > causal-chain intermediaries > too-central redundancies.

### Which Observations Are Extended

**O4 (process-naming bridges outperform object-naming bridges)** receives a counterexample that clarifies its scope. "Tree" (acorn-timber) is an object-naming bridge that works at 1.000 for three models. The process/object distinction holds when comparing within the same pair (germination vs plant for seed-garden) but does not hold as a universal rule across pairs. Object-naming bridges can succeed when they name the *intermediate state* in a transformation (acorn becomes tree becomes timber), not just when they name a static category.

**O5 (forced crossings produce highest bridge frequencies)** is qualified by Phase 7A. Under unconstrained conditions, forced crossings remain the highest-frequency bridges. Under pre-fill conditions, forced crossings are as vulnerable as any other bridge type. The "highest frequency" is a property of the unconstrained landscape, not an invariant.

**O6 (fire is too-central)** is replicated and generalized. Fire continues at near-zero (GPT 0.150, all others 0.000). Water for rain-ocean joins fire as a second confirmed too-central concept (O16).

**O12 (early anchoring)** is upgraded from correlational to causal by Phase 7A. Pre-filling position 1 causally displaces bridges, confirming that the Phase 6C positional pattern is not epiphenomenal.

### New Observations from Phase 7

**O15. Pre-filling causally displaces bridge concepts.** [observed] -- Mean displacement 0.515 (CI [0.357, 0.664]). Bridge survival drops from 0.807 to 0.460 under pre-fill. Mechanism is associative primacy, not directional heading. Taxonomic bridges resist (0.140 displacement).

**O16. "Water" for rain-ocean is universally too-central.** [observed] -- 0.000 across all 4 models, SD = 0.000. The cleanest cross-model agreement in the benchmark. Generalizes O6 to a second domain.

**O17. Gradient-spectrum bridges outperform causal-chain bridges.** [observed] -- Gradient 0.730 vs causal-chain 0.496. Continuous-dimension midpoints are more navigational than process intermediaries.

**O18. Navigational distance metrics fail cross-model validity.** [observed] -- Cross-model distance correlation r = 0.170. Models do not agree on conceptual distances. Curvature estimation requires within-model interpretation only.

### New Hypothesis

**H8. Bridge fragility is bimodal.** [hypothesis] -- Some bridges (sadness, dog) survive pre-fill robustly; others (harmony, germination) collapse entirely. The variable appears to be route exclusivity: bridges with no navigational competitors survive; bridges with alternatives collapse. Consistent with R6 but not directly tested as a distribution.

---

## 7. The Bridge Taxonomy, Further Revised

Phase 7 data adds a new dimension to the bridge taxonomy: **perturbation robustness**. The Phase 6 taxonomy organized bridges by frequency, position, and mechanism. Phase 7A adds how bridges respond to displacement:

| Bridge Type | Example | Uncon. Freq | Position | Pre-fill Survival | Robustness |
|-------------|---------|-------------|----------|-------------------|------------|
| Gradient midpoint | warm (hot-cold) | 0.90-1.00 | 1-2 | Not tested (predicted high) | **Robust** (predicted) |
| Exclusive process | sadness (emotion-melancholy) | 0.87-1.00 | 2-3 | High (0.75) | **Robust** |
| Taxonomic | dog (animal-poodle) | 0.88-1.00 | 4-5 | Very high (0.90) | **Robust** |
| Shared process | spectrum (light-color) | 0.67-1.00 | 1-2 | Moderate (0.58) | **Partially robust** |
| Forced crossing | bank (loan-shore) | 0.20-1.00 | 1-4 | Low (0.27) | **Fragile** |
| Competitive process | harmony (music-math) | 0.00-1.00 | 1-3 | Zero (0.00) | **Collapsed** |
| Too-central | fire (spark-ash), water (rain-ocean) | 0.00-0.15 | N/A | N/A | N/A |

The robustness dimension cross-cuts the mechanism dimension in revealing ways. Taxonomic bridges are the most robust because their position is determined by hierarchy, not by heading; they do not need position 1 and therefore are not vulnerable to pre-fill. Gradient midpoints are robust because they have no competitors on their one-dimensional continuum. Competitive process bridges are the most fragile because they depend on winning position 1 against multiple alternatives, and pre-filling eliminates their first-mover advantage.

The forced-crossing bridge type receives a significant downgrade. In Phase 5B, forced crossings were characterized as the most reliable bridges in the benchmark (0.95-1.00 for non-Gemini models). In Phase 7A, they are revealed as fragile under perturbation -- high-frequency when unconstrained but easily displaced when position 1 is occupied. The forced-crossing bottleneck is a statistical regularity of unconstrained navigation, not a structural invariant.

---

## 8. Methodological Reflections

### The Associative Primacy Interpretation

Phase 7A's most important conceptual contribution is the replacement of "directional heading" with "associative primacy" as the mechanism for early anchoring. The difference matters for experimental design. Directional heading would predict that the *content* of the pre-fill matters (congruent vs incongruent vs neutral should produce different effects). Associative primacy predicts that only the *presence* of a pre-fill matters (any concept in position 1 displaces the bridge equally). The data strongly favors associative primacy.

This has implications for the greedy-forward-search hypothesis (H2). In the associative primacy model, the first generated concept is not a "heading" that steers subsequent generation but an "anchor" that constrains subsequent generation through attention/recency mechanisms. The model does not choose a direction and follow it -- it generates a concept, and that concept's associations cascade into the remaining positions. The bridge concept is not navigational infrastructure in the intentional sense (a compass bearing) but in the statistical sense (the most activated associate).

### The Distance Metric Problem Is Not Solvable Within This Framework

Phase 7B's cross-model r = 0.170 is not a failure of sample size or triangle selection. It is a fundamental incompatibility between the Jaccard-based distance metric and the goal of model-independent geometry. The Jaccard distance between two waypoint sets measures how *differently* two paths are navigated, which is jointly determined by the concept pair's semantic distance and the model's navigational gait. Without a way to factor out gait, the distance is uninterpretable as a property of the concept pair alone.

Potential resolutions include: (a) a gait-normalized distance metric that divides raw Jaccard by a model-specific baseline; (b) an embedding-based distance metric derived from the models' internal representations rather than their generated paths; (c) abandoning cross-model geometry entirely and accepting that each model inhabits its own conceptual space. Option (c) is the most honest interpretation of the data, but it limits the generality of any geometric claims.

### Sample Size and Effect Size Calibration

Phase 7A used 10 runs per condition per model per pair for the pre-fill conditions, with 15-25 runs for unconstrained baselines. The primary displacement test had adequate power (CI excludes zero with a comfortable margin). The incongruent-vs-congruent comparison did not reach significance, but this may be a genuine null rather than a power failure -- the point estimate (0.079) is small enough that even 100 runs per cell would likely not reach significance. The effect of pre-fill content on displacement is at most small; the effect of pre-fill *presence* on displacement is large and well-estimated.

Phase 7C used 10-30 runs per pair per model. The too-central vs obvious-useful comparison failed primarily because of miscategorization, not power. With correct categorization (fire and water as too-central; all others as obvious-useful), the gap would be much larger and likely significant. This is a lesson about experimental design: the primary test's power is determined not only by sample size but by the accuracy of the a priori categorization.

### Prediction Failures as Theoretical Leverage

Phase 7 adds four entries to the graveyard, and each one sharpens the theoretical framework:

- Polysemous curvature (G16) fails because curvature is uniform, not localized. The space is globally non-Euclidean, and polysemy does not create geometric singularities.
- Cross-model distance validity (G17) fails because gait contaminates all distance metrics. Geometry is model-relative.
- Too-central as binary category (G18) fails because "too-central" is a narrow phenomenon (fire, water) not a broad category. Most "obvious" concepts function as bridges.
- Forced-crossing bank resists displacement (G19) fails because the bottleneck is maintained by associative primacy, not topological necessity. Displace the primacy mechanism and the bottleneck disappears.

Each failure converts an assumption into a finding, and the findings are more useful than the assumptions would have been.

---

## 9. The Graveyard, Updated

Phase 7 adds four new entries:

**G16. Polysemous vertices create higher curvature than non-polysemous vertices.** Predicted that polysemous concepts would warp local geometry, creating measurably higher triangle excess. Observed: poly 0.499 vs non-poly 0.446, difference 0.053, CI [-0.157, 0.263] includes zero. The space has substantial positive curvature everywhere, but it is not concentrated at polysemous hubs. Killed by Phase 7B.

**G17. Cross-model distance metrics are valid (r > 0.50).** Predicted that navigational Jaccard distances would correlate across models, reflecting a shared underlying geometry. Observed: r = 0.170. Claude's distances are incomparable with GPT's because their gaits produce fundamentally different scales. The distance metric is contaminated by R1 (model gaits). Killed by Phase 7B.

**G18. "Too-central" is a clean binary category separating redundant from useful bridges.** Predicted that concepts rated as too-central (fire, tree, dough) would uniformly show low bridge frequency. Observed: tree at 1.000 for 3/4 models, dough at 0.800-1.000 for 3/4 models. The too-central phenomenon is real but narrow -- only concepts where both endpoints *contain* the bridge (fire for spark-ash, water for rain-ocean) qualify. Most "obvious" concepts function perfectly well as bridges. Killed by Phase 7C.

**G19. Forced-crossing bridge "bank" resists displacement (survival >0.90).** Predicted that the forced-crossing bottleneck would be structurally resistant to pre-fill perturbation because it is the only connection between financial and geographic domains. Observed: survival 0.267, shift 0.791. The forced-crossing bottleneck is maintained by associative primacy, not topological necessity, and is as vulnerable to displacement as non-forced bridges. Killed by Phase 7A.

The cumulative graveyard now contains 19 entries (G1-G19), spanning all seven phases. The graveyard's growth rate has been roughly constant: 2-4 entries per phase. This is healthy -- each phase falsifies specific predictions and converts assumptions into empirical constraints.

---

## 10. Open Questions for Phase 8

Ranked by expected information gain, accounting for Phase 7's revisions.

### 10a. Bridge Fragility Mechanism (Highest Priority)

Phase 7A identified bimodal bridge fragility (H8): some bridges collapse entirely under pre-fill, others survive robustly. The variable appears to be route exclusivity -- whether the bridge has navigational competitors. Design: for 6-8 pairs with known bridges, independently measure the number of alternative waypoints that could substitute for the bridge (from Phase 6A salience data), then correlate with pre-fill survival. If alternative-count predicts survival, route exclusivity is the mechanism.

**Expected yield:** A quantitative predictor of bridge robustness. Would ground H8 in measurable properties of the salience landscape.

### 10b. Gait-Normalized Distance Metric (High Priority)

The cross-model distance validity failure (O18) blocks the curvature program. A gait-normalized metric could rescue it. Design: for each model, compute a baseline distance scale from a reference set of pairs (e.g., the Phase 1 pairs), then normalize all distances by dividing by the model's mean reference distance. Test whether normalized cross-model correlation exceeds r = 0.50.

**Expected yield:** Either a viable cross-model distance metric or a definitive demonstration that model-independent geometry is impossible with path-based measurements.

### 10c. Operational Definition of "Too-Central" (Medium-High Priority)

Phase 7C showed that our intuitive classification of too-central bridges is unreliable. An operational definition is needed. Proposed criterion: a bridge B is too-central for pair A-C if and only if both A and C can be defined as instances/products/states of B (i.e., the relationship is "A is a kind/product of B" AND "C is a kind/product of B"). Test: apply this criterion to 10-15 pairs including the Phase 7C pairs and 5-8 new ones, predict bridge frequency from the criterion, and measure classification accuracy.

**Expected yield:** A pre-registrable operational definition that separates fire/water (too-central) from tree/dough (obvious-useful) without post-hoc rationalization.

### 10d. Gemini's Gradient Blindness (Medium Priority)

Phase 7C's Gemini zeros on univocal within-frame bridges (tree, dough, speak, noon) are unexplained by the frame-crossing hypothesis (H1). Design: test Gemini on 10 gradient-midpoint pairs (continuous dimensions with named midpoints) versus 10 causal-chain pairs, and compare to other models. If Gemini fails specifically on gradients, it suggests that Gemini does not represent continuous semantic dimensions as well as other models.

**Expected yield:** A refined characterization of Gemini's fragmentation that extends beyond polysemous frame-crossing.

### 10e. Temporal Stability Recheck (Medium Priority)

Phases 1-7 now span a substantial collection period. Re-running a subset of Phase 1 pairs would test whether gait characterization (R1) and bridge frequencies (R6, R7) are temporally stable or have drifted with model updates.

**Expected yield:** A temporal robustness estimate for all prior findings.

### 10f. Paper Preparation (Parallel Track)

Seven phases of data now support a narrative arc with three acts: (1) structure (Phases 1-3: navigation is measurably quasimetric, compositional, and model-specific); (2) topology (Phases 4-5: bridges are bottlenecks shaped by navigational salience, not association); (3) mechanism (Phases 6-7: early anchoring via associative primacy, displacement causality, distance metric limitations). The prediction failures at each stage are as informative as the successes: the germination surprise, the forced-crossing asymmetry null, the directional-heading falsification, the distance metric crisis. The core contribution is not a single finding but a methodology for mapping conceptual topology through behavioral probing -- an MRI for the structure of LLM conceptual space.

---

## 11. Summary of Key Findings

1. **Pre-filling position 1 causally displaces bridge concepts.** Mean displacement 0.515 (CI [0.357, 0.664]), bridge survival drops from 0.807 to 0.460 under pre-fill. This is the benchmark's first causal result, upgrading early anchoring (O12) from correlational to causal. **[observed]** (O15.)

2. **The displacement mechanism is primarily associative primacy, with a possible congruence modulation.** Incongruent, congruent, and neutral pre-fills produce displacement in a pattern inconsistent with the directional-heading prediction: neutral (0.536) displaces at least as much as incongruent (0.515), and congruent (0.436) displaces less but with overlapping CIs. Bridge survival rates do show some condition sensitivity (incongruent 0.347, congruent 0.631, neutral 0.403), hinting that congruent pre-fills are less disruptive, but the displacement magnitudes do not cleanly separate. The bridge wins position 1 primarily through first-mover advantage rather than directional steering.

3. **Bridge fragility is bimodal.** Harmony and germination collapse to 0.000 survival under any pre-fill; sadness and dog survive at 0.750+. The variable appears to be route exclusivity: bridges with navigational competitors are fragile; bridges without competitors are robust. **[hypothesis]** (H8.)

4. **The triangle inequality is a structural constant at ~91%.** Three independent measurements (Phase 3B 91%, Phase 4B 93.8%, Phase 7B 90.6%) converge. This is the most replicated quantitative finding in the benchmark. **[robust]** (extends R2.)

5. **Polysemous curvature does not exceed non-polysemous.** Poly excess 0.499 vs non-poly 0.446, difference 0.053, CI includes zero. The space is globally non-Euclidean but curvature is not concentrated at polysemous hubs. **Graveyard: G16.**

6. **Cross-model navigational distances are not comparable.** Correlation r = 0.170 across models. Claude sees short distances (mean excess 0.225); GPT/Grok see long distances (0.680-0.689). Gait differences (R1) contaminate all distance-based metrics. The curvature program requires within-model interpretation only. **[observed]** (O18.)

7. **"Water" for rain-ocean is universally too-central (0.000, all models).** Generalizes O6 (fire) to a second domain. Both cases share the mechanism: both endpoints already contain the bridge concept, making it informationally invisible. **[observed]** (O16.)

8. **The "too-central" category as defined was wrong.** Tree (acorn-timber) and dough (flour-bread) function as reliable bridges (0.800-1.000 for 3/4 models) despite being classified as too-central. The phenomenon is real but narrow: only fire and water qualify. **Graveyard: G18.**

9. **Gradient-spectrum bridges outperform causal-chain bridges.** Gradient pairs 0.730 vs causal-chain 0.496. Continuous-dimension midpoints (warm, adolescent, speak) are more navigational than process intermediaries (fire, tree, dough) because they occupy a topologically mandatory position on a one-dimensional continuum. **[observed]** (O17.)

10. **Forced-crossing "bank" does not resist displacement.** Survival 0.267 under pre-fill, shift 0.791 positions. The forced-crossing bottleneck is maintained by associative primacy, not topological necessity. The highest-frequency unconstrained bridges are not the most robust under perturbation. **Graveyard: G19.**

11. **Gemini shows systematic zeros on univocal within-frame bridges.** Tree, dough, speak, water (ice-steam), noon -- all zero for Gemini, all 0.700-1.000 for other models. This extends H1 beyond polysemous frame-crossing to a broader fragmentation pattern that may involve gradient blindness.

12. **Prediction accuracy stabilizes at ~45%.** Phase 7 hits 9/20 (45%), comparable to Phase 6's ~40%. Structural predictions succeed at ~75%; mechanistic predictions at ~25%. The benchmark has mapped the coarse geometry of conceptual space but cannot yet predict its fine structure.
