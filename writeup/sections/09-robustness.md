# 9. Act VI — Robustness: The Benchmark Survives Its Own Tests

The structural claims in Sections 4–8 rest on a specific elicitation protocol: 7 waypoints, temperature 0.7, single-direction prompting. A natural concern is that the findings reflect idiosyncratic interactions between specific models and these specific protocol choices. Phase 11C addressed this directly with a multiverse robustness analysis: 3 models tested across a 2×2 grid of waypoint count (5, 9) and sampling temperature (0.5, 0.9), plus the 7-waypoint/0.7-temperature baseline. Phase 11B addressed a separate vulnerability — the control pair problem — by attempting to find replacement controls. Together, these experiments establish where the benchmark's claims are robust and where they require qualification.

## 9.1 Protocol Independence: Model Identity Drives Structure

The factorial analysis testing gait (intra-model Jaccard) against model identity, waypoint count, temperature, and their interaction produces the cleanest result in the benchmark:

> [TABLE 6: ANOVA Results]

| Factor | η² (SS Proportion) | p-value (approx.) |
|--------|-------------------:|-------------------:|
| Model identity | 0.242 | ≈ 0.001 |
| Waypoint count | 0.008 | ≈ 0.520 |
| Temperature | 0.002 | ≈ 0.743 |
| Waypoint × Temperature | ≈ 0.000 | ≈ 0.886 |

Model identity accounts for 30× more variance than waypoint count and 120× more than temperature. The interaction term is as null as this analysis can produce. For gait, the structural claims are not artifacts of the 7-waypoint, 0.7-temperature protocol. Bridge frequency is similarly stable (Section 9.2). Asymmetry, however, is waypoint-count sensitive (Section 9.4) — the ANOVA result applies to gait specifically, not to all structural metrics uniformly.

**Statistical caveat.** The p-values use a chi-squared approximation to the F-distribution (ignoring denominator degrees of freedom) and treat per-pair cells as independent without repeated-measures modeling. Only 3 models were tested (Claude, GPT, DeepSeek). The effect sizes (η²) are more reliable than the exact p-values. The qualitative conclusion — that model identity dominates while protocol parameters are null — is robust to the approximation, but the analysis should be understood as descriptive/exploratory rather than confirmatory.

**Baseline data limitation.** The 7wp-t0.7 baseline is assembled from prior-phase data (Phases 1, 2, 6A). DeepSeek, added in Phase 11A, has no prior-phase data — its baseline cells are empty. Additionally, reverse-direction data for some pairs is missing from prior phases. Baseline asymmetry and gait values should be interpreted with this limitation in mind; the four new conditions (which have complete data) provide more reliable comparisons.

## 9.2 Bridge Frequency Is the Most Robust Property

Bridge frequency across all conditions:

| Condition | Mean Bridge Frequency | 95% CI |
|-----------|---------------------:|--------|
| 7wp-t0.7 (baseline) | 0.992 | [0.983, 1.000] |
| 5wp-t0.5 | 0.993 | [0.978, 1.000] |
| 5wp-t0.9 | 0.978 | [0.933, 1.000] |
| 9wp-t0.5 | 0.993 | [0.978, 1.000] |
| 9wp-t0.9 | 0.985 | [0.956, 1.000] |

All conditions exceed 0.97. The lowest (5wp-t0.9 at 0.978) — the condition most likely to produce variability, with fewer waypoint slots and higher sampling randomness — is still essentially at ceiling. Bridge bottleneck structure is insensitive to both waypoint count and temperature. "Spectrum" for light→color and "warm" for hot→cold appear as obligatory landmarks regardless of how many total waypoints are available or how much randomness is introduced. "Sadness" for emotion→melancholy is near-obligatory, dipping to 0.933 in one condition (Claude at 9wp-t0.5) and 0.867 in another (GPT at 9wp-t0.9) but never absent.

> [FIGURE 14: Robustness Heatmap] — 5×3 heatmap (conditions × metrics: gait, asymmetry, bridge frequency). Color intensity = metric value. Bridge frequency row is uniformly dark (high). Asymmetry row shows the resolution effect at 5 waypoints.

This result strengthens R6 (bridge bottlenecks) as the benchmark's most protocol-robust claim. The bottleneck phenomenon is not an artifact of long paths or low temperature — it persists even with short paths at high temperature.

## 9.3 Gait Rankings Are Largely Stable

Kendall's W = 0.840 across conditions, confirming that the rank ordering of models by gait consistency is stable under protocol variation. Claude is the most consistent model in every condition. The second and third positions show one swap:

| Condition | Rank Order |
|-----------|-----------|
| 7wp-t0.7 (baseline) | Claude > GPT > DeepSeek |
| 5wp-t0.5 | Claude > DeepSeek > GPT |
| 5wp-t0.9 | Claude > DeepSeek > GPT |
| 9wp-t0.5 | Claude > DeepSeek > GPT |
| 9wp-t0.9 | Claude > DeepSeek > GPT |

The baseline is the outlier, placing GPT above DeepSeek. This likely reflects DeepSeek's sparse baseline data (no prior-phase runs) rather than genuinely lower consistency; under actual elicitation in the four new conditions, DeepSeek shows Jaccard of 0.492–0.597, comfortably above GPT's 0.365–0.477 range. Baseline sparsity may depress the observed concordance, so W = 0.840 is best interpreted conservatively.

Claude's absolute gait values are condition-dependent — 0.794 at 5wp-t0.5 down to 0.624 at 9wp-t0.9. For Claude in this subset, consistency is lower at 9wp-t0.9 than at 5wp-t0.5, but Phase 11C does not show a reliable general main effect of waypoint count or temperature across all models. The rank ordering, however, is preserved: Claude remains the most consistent under all tested conditions, and the relative gaps between models are stable. Gait is a model property that varies in magnitude with protocol but maintains its relative structure.

## 9.4 Asymmetry Is Resolution-Dependent

Mean asymmetry per condition:

| Condition | Mean Asymmetry | > 0.60 Threshold? |
|-----------|---------------:|:-----------------:|
| 7wp-t0.7 (baseline)* | 0.599 | no |
| 5wp-t0.5 | 0.594 | no |
| 5wp-t0.9 | 0.593 | no |
| 9wp-t0.5 | 0.669 | **yes** |
| 9wp-t0.9 | 0.684 | **yes** |

*Baseline mean from 2 valid cells only (Claude and GPT on hot→cold); other cells lack reverse or prior-phase data.

The pattern is consistent: 9-waypoint conditions pass the 0.60 threshold; 5-waypoint conditions fall just short. This is theoretically interpretable — more waypoints provide more positions where directional differences can manifest. At 5 waypoints, the path is too short for the quasimetric property to be reliably detected above the threshold.

Temperature effects on asymmetry are negligible: 5wp-t0.5 (0.594) vs 5wp-t0.9 (0.593); 9wp-t0.5 (0.669) vs 9wp-t0.9 (0.684). This is consistent with the ANOVA finding that temperature has no significant effect on navigational structure.

This finding qualifies R2: the quasimetric property is real — individual model × pair asymmetries are consistently positive at all waypoint counts — but the aggregate asymmetry index is resolution-dependent. The 0.60 threshold is a measurement sensitivity boundary, not a physical boundary. The asymmetry finding from Section 5.1 (mean 0.811 in the Phase 2 cohort at 5 waypoints) was measured with a larger pair set and model cohort; the robustness subset uses only 2 pairs and 3 models, so the lower absolute values reflect the reduced sample as much as any resolution effect.

## 9.5 The Control Pair Problem

The most uncomfortable finding in the robustness analysis concerns the benchmark's control validation. Phase 11B tested 4 replacement control candidates — accordion–stalactite, turmeric–trigonometry, barnacle–sonnet, and magnesium–ballet — across 6 models. The result was decisive: 0 of 24 model–candidate cells passed either the frequency gate (< 0.15) or the entropy gate (> 5.0).

> [TABLE 7: Control Pair Screening]

| Candidate | Max Top Freq | Min Entropy | Passes? |
|-----------|------------:|------------:|:-------:|
| accordion–stalactite | 1.000 | 3.29 | fail |
| turmeric–trigonometry | 1.000 | 3.44 | fail |
| barnacle–sonnet | 1.000 | 3.44 | fail |
| magnesium–ballet | 1.000 | 3.65 | fail |

Each pair reveals a different failure mode. Accordion–stalactite converges on "bellow" (an accordion feature) at 0.60–1.00 frequency across 5 of 6 models. Turmeric–trigonometry shows the most creative routing — Claude goes through "ancient India," GPT through "spice," Gemini through "curcumin," DeepSeek through "angle," Mistral through "golden ratio" — yet each individual model still converges on a single dominant waypoint. Barnacle–sonnet finds ocean/poetry bridges ("shell," "sea shanty," "verse," "meter"). Magnesium–ballet finds movement/grace bridges ("choreography," "swan lake," "grace").

**Retrospective analysis.** Stapler–monsoon itself — the benchmark's original control pair — fails the strict R5 criteria for all 12 models when evaluated under the same gates. Top-waypoint frequencies range from 0.650 (GPT) to 1.000 (Mistral, Cohere, Llama 4 Maverick). The original 4 models show frequencies of 0.650–0.775, which are lower than the newer models but still dramatically above the 0.15 threshold. Under strict criteria, stapler–monsoon has never been a valid control.

**What this reveals.** Across the tested control candidates and stapler–monsoon, models consistently found structured routes, suggesting that truly unstructured single-pair controls are hard to obtain at 7 waypoints. This is not noise — it is a finding about the richness of the associative landscape in trained language models. The models are creative associators: given two concepts and 7 waypoint slots, they construct plausible, structured semantic routes.

**Reframing.** The benchmark's validity does not rest on controls being truly unstructured. It rests on the predictability gap: experimental pairs show bridge frequencies of 0.60–1.00 for specific bridges *predicted from the endpoint relationship* (spectrum for light→color, dog for animal→poodle), while control pairs show comparable frequencies for *unpredicted* concepts. The experimental pairs' structure is theory-derived; the control pairs' structure is ad hoc. The difference is predictability, not presence versus absence of structure.

R5 is retained but qualified as the benchmark's weakest robust claim. The practical implications are threefold: (1) the control limitation should be acknowledged prominently; (2) the evidence base should be framed as relative performance gaps, not absolute control baselines; and (3) future work should explore fundamentally different control designs — multi-pair batteries, entropy-based criteria, or relative consistency ratios rather than single-pair strict-threshold validation.

---

The robustness results establish that the benchmark's core structural claims survive protocol variation, with metric-specific qualifications. For gait, model identity dominates protocol parameters (ANOVA η² = 0.242 for model vs ≈ 0 for protocol factors). Bridge frequency is the most robust property (> 0.97 across all conditions). Gait rank ordering is largely stable (W = 0.840). Asymmetry is real but its detectability is waypoint-count sensitive — a measurement sensitivity finding that qualifies R2 without undermining it. The control pair problem is real and acknowledged: across tested candidates, models consistently find structured routes, and the benchmark's validity rests on the predictability of those routes, not on their absence in controls. Together with the generality results in Section 8, these findings confirm that the benchmark's central claims — characteristic gaits, quasimetric asymmetry, and bottleneck bridge structure — are properties of language models, not properties of a particular experimental protocol.
