# Phase 10: Model Generality and Pre-Fill Relation Classes

## Context

Phase 9 confirmed the benchmark's central discovery: single-variable mechanistic models fail, but the qualitative structural findings (R1-R7) are rock-solid across 9 phases and ~18,000 runs. The warm/fermentation anomaly (Section 1.3 of Phase 9 analysis) revealed that the semantic relationship between pre-fill and bridge — not dominance ratio, not competitor count — is the strongest determinant of bridge survival. Cool (on-axis substitute for warm) destroys it; harvest (same-domain off-axis from fermentation) leaves it intact.

Phase 10 is a wrap-up phase with two goals before paper writing:

**Goal 1: Model generality.** Phases 1-9 used four models (Claude Sonnet 4.6, GPT-5.2, Grok 4.1 Fast, Gemini 3 Flash). The robust claims (R1-R7) depend on this model set. Before the paper, we test whether the core structural findings hold for a broader set of models — including smaller models, Chinese-developed models, and open-source models. This transforms "four models show consistent structure" into "LLMs generally show consistent structure" or reveals model-class boundaries.

**Goal 2: Pre-fill relation classes.** The warm/fermentation anomaly demands a direct test. Phase 9's insight was post-hoc: cool is an on-axis substitute for warm, harvest is same-domain off-axis from fermentation. Phase 10B pre-registers this three-way classification (on-axis substitute, same-domain off-axis, unrelated) and tests it directly on pairs where all three pre-fill types can be constructed.

Phase 10 is designed as two experiments, ordered by priority:

- **Part A** — Model generality (~960 new runs across 5 new models, ~$5-12 depending on model pricing)
- **Part B** — Pre-fill relation classes (~1,010 new runs across 4 original models, ~$3-5)

Total budget: ~1,970 new API runs, ~$8-17.

**Resilience policy for new models:** Some of the 5 new models may be slow, rate-limited, unreliable, or produce unparseable output. Models are evaluated in two stages:

1. **Probe stage:** 3 probe requests per model. Models that fail connectivity (0/3 succeed), parsing (<2/3 parse with the semantic format), or latency (p50 > 60s) are discarded immediately.
2. **Full-run stage:** Models that pass probes proceed to full collection. If a model's error rate during full collection exceeds 30% after retries, or its parse success rate drops below 80% on the full dataset, it is flagged as degraded. Degraded models are still reported in findings but excluded from the primary cohort comparison (they are analyzed separately as case studies).

If a model passes probes with the "direct" prompt format (fallback), it is included but flagged as using a different format. Its data is analyzed alongside semantic-format models for bridge frequency and asymmetry (which are format-independent based on Phase 1's prompt-selection results) but excluded from gait Jaccard comparisons (which are format-sensitive).

The experiment requires at least 3 of 5 new models to produce usable data with the semantic format. If fewer than 3 pass, Part A is underpowered and results should be interpreted as exploratory.

---

## Part A: Model Generality

**Core question:** Do the benchmark's core structural findings (model gaits, asymmetry, bridge bottleneck behavior) generalize beyond the original four models to a diverse set of LLMs?

**Background:** The robust claims most directly testable with waypoint elicitation data are R1 (distinct gaits), R2 (quasimetric asymmetry), R4 (hierarchical compositionality), R5 (clean controls), and R6 (bridge bottleneck behavior). R3 (polysemy sense differentiation) and R7 (cue-strength gradient) require specialized pair sets and multi-level designs not included in this phase — they remain supported by Phases 1-5 on the original 4 models. All tested claims are established on Claude Sonnet 4.6, GPT-5.2, Grok 4.1 Fast, and Gemini 3 Flash — all large frontier models. The paper's claim that "LLMs navigate conceptual space with consistent geometric structure" is only as strong as the model diversity supporting it. Phase 10A extends this to:

1. **MiniMax M2.5** (`minimax/minimax-m2.5`) — Chinese-developed large model
2. **Moonshot Kimi K2.5** (`moonshotai/kimi-k2.5`) — Chinese-developed large model
3. **GLM 5** (`z-ai/glm-5`) — Chinese-developed large model (Zhipu AI)
4. **Qwen 3.5 397B-A17B** (`qwen/qwen3.5-397b-a17b`) — Chinese-developed MoE model (Alibaba)
5. **Llama 3.1 8B Instruct** (`meta-llama/llama-3.1-8b-instruct`) — Small open-source model

This set tests three axes of generality:
- **Lab diversity:** Chinese vs Western-developed models
- **Scale diversity:** 8B parameter model (Llama) vs frontier-scale models
- **Architecture diversity:** MoE (Qwen) vs dense architectures

**Hypothesis (H12):** The structural findings generalize across model families. Specifically:
- All new models produce parseable waypoint paths with at least 80% extraction success rate (prompt format works cross-model).
- New models show distinct gaits (mean intra-model Jaccard varies by model) consistent with R1.
- Asymmetry is present (mean asymmetry > 0.60) for each new model, consistent with R2.
- Bridge bottleneck behavior holds: known strong bridges (spectrum for light-color, leather for hide-shoe, dog for animal-poodle) appear at >0.50 frequency for at least 3/5 new models, consistent with R6.
- The Llama 8B model may show degraded performance (lower bridge frequency, higher variance) due to its smaller scale — this is expected and would establish a scale boundary.

**Primary pre-registered test:** The mean bridge frequency across the 7 non-control forward pairs for the new model cohort (reliable models pooled) is within 0.20 of the original cohort mean (4 original models pooled). 95% bootstrap CI on the cohort difference includes zero (no systematic degradation) OR identifies a directional shift (new models systematically lower/higher). The random control pair (stapler-monsoon) is excluded from the cohort mean because it has no expected bridge and would mechanically deflate both cohorts equally.

### Design

#### Pair Selection: Core Replication Set

Phase 10A uses a focused set of 8 pairs that span the benchmark's key findings. These are pairs with well-established behavior from prior phases, chosen to test each robust claim:

| # | Pair (A → B) | Tests | Expected Bridge | Prior Freq (4-model mean) |
|---|-------------|-------|-----------------|--------------------------|
| 1 | music → mathematics | R6 bridge bottleneck; cross-domain | harmony | 0.550 |
| 2 | light → color | R6 strong bottleneck | spectrum | 0.917 |
| 3 | animal → poodle | R4 hierarchical compositionality | dog | 0.970 |
| 4 | emotion → melancholy | R6 bridge salience | sadness | 0.950 |
| 5 | hot → cold | R2 asymmetry; antonym axis | warm | ~0.800 |
| 6 | hide → shoe | R6 transformation bottleneck | leather | ~0.950 |
| 7 | seed → garden | R6 process-naming; O4 | germination | 0.583 |
| 8 | stapler → monsoon | R5 random control | (none) | 0.000 |

Additionally, reverse directions for pairs 1-4 to test asymmetry (R2):

| # | Pair (B → A) | Tests |
|---|-------------|-------|
| 9 | mathematics → music | R2 asymmetry |
| 10 | color → light | R2 asymmetry |
| 11 | poodle → animal | R2 asymmetry |
| 12 | melancholy → emotion | R2 asymmetry |

#### Run Parameters

- **Prompt format:** Semantic (same as Phases 1-9)
- **Waypoints:** 7 (same as Phases 1-9)
- **Temperature:** 0.7 (same as Phases 1-9)
- **Reps per model per pair:** 15 (sufficient for bridge frequency estimation; SE ~0.13 at freq 0.50)

#### Model Reliability Protocol

For each new model, before running the full experiment:

1. **Connectivity check:** Run 3 probe requests (one per pair from the first 3 pairs). If 0/3 succeed, mark the model as unavailable and skip.
2. **Parse check:** Verify that the model produces numbered-list output that the existing `extractWaypoints` parser can handle. If <50% of probe responses parse, try the "direct" prompt format as fallback. If both fail, mark unparseable and skip.
3. **Latency check:** Record p50 latency for the probes. If p50 > 30 seconds per request, flag as "slow" but continue (adjust concurrency to 1 for that model). If p50 > 60 seconds, discard.

Models that pass all three checks proceed to full data collection. Models that fail are documented in findings with the failure mode.

### Run Budget

| Condition | Pairs | Reps/model | Models | Runs |
|-----------|-------|-----------|--------|------|
| Forward elicitation (pairs 1-8) | 8 | 15 | 5 | 600 |
| Reverse elicitation (pairs 9-12) | 4 | 15 | 5 | 300 |
| Probe requests (3 per model) | 3 | 1 | 5 | 15 |
| **Subtotal** | | | | **915** |

The subtotal above is for ALL 5 models combined. Per model, the cost is 12 pairs × 15 reps = 180 runs, plus 3 probes = 183 runs per model.

After 5% retry buffer: **~960 total runs across all 5 models.** If only 3-4 models pass the reliability protocol, some runs are saved (probes still count but full collection is skipped for failed models). Expected: **~770-960 total runs** depending on model attrition.

**Note:** This is a relatively cheap experiment per model — the value is in model diversity, not volume.

### Analysis Plan

1. **Model reliability report.** For each of the 5 new models, report: connectivity success rate, parse success rate, median latency, error rate. Classify as reliable/slow/unparseable/unavailable.

2. **Gait profile (R1 replication).** For each reliable new model, compute mean intra-model Jaccard across the 8 forward pairs. Compare to the original 4-model gait profiles (Claude 0.578, GPT 0.258, Grok 0.293, Gemini 0.372). Report each new model's position in the gait spectrum. Test whether the Llama 8B model shows the lowest consistency (expected due to smaller scale).

3. **Asymmetry (R2 replication).** For each reliable new model, compute directional asymmetry on the 4 forward-reverse pairs. Report mean asymmetry per model. Test whether mean asymmetry > 0.60 for each new model.

4. **Bridge frequency (R6 replication).** For each of the 8 forward pairs, compute bridge frequency per new model. Report the 8 × N matrix (N = number of reliable models). Test whether known-strong bridges (spectrum, dog, sadness, leather) appear at >0.50 frequency for at least 3/N new models.

5. **Control validation (R5 replication).** For the random control pair (stapler-monsoon), compute waypoint frequency distribution. Test whether any single waypoint exceeds 0.10 frequency. Expectation: no single waypoint dominates, confirming the noise floor is model-independent.

6. **Cohort comparison (primary test).** Pool bridge frequency across all forward pairs for the new model cohort vs. the original model cohort (using prior phase data). Bootstrap CI on the cohort mean difference. If CI includes zero, structural findings generalize. If CI excludes zero, identify whether new models are systematically weaker or stronger.

7. **Three-plus-one structure.** Test whether the three-plus-one pattern (Claude/GPT/Grok cluster, Gemini diverges) extends to an N-cluster structure when new models are added. Compute pairwise Jaccard similarity across all models and report a dendrogram or heatmap.

8. **Scale effect.** If Llama 8B produces usable data, compare its gait profile, bridge frequency, and asymmetry to the other models. Test whether there is a detectable scale threshold below which structural findings degrade.

### Predictions

1. At least 3 of 5 new models pass the reliability protocol (connectivity + parse + latency).
2. All reliable new models show distinct gaits: intra-model Jaccard varies across models, range > 0.15.
3. All reliable new models show asymmetry > 0.60 on the 4 forward-reverse pairs.
4. Spectrum (light-color), dog (animal-poodle), and sadness (emotion-melancholy) each appear at >0.50 frequency for at least 3 of N reliable new models.
5. The random control pair (stapler-monsoon) shows no waypoint above 0.10 frequency for any new model.
6. Cohort mean bridge frequency difference (new - original) is within [-0.20, +0.20] and CI includes zero.
7. Llama 8B (if reliable) shows the lowest mean bridge frequency and highest waypoint entropy among all models, including the original 4.
8. At least 2 of the 4 Chinese-developed models (MiniMax, Kimi, GLM, Qwen) produce usable data and show gait profiles comparable to the original 4 (intra-model Jaccard in the 0.20-0.65 range).

---

## Part B: Pre-Fill Relation Classes

**Core question:** Does the semantic relationship between pre-fill concept and bridge concept — classified as on-axis substitute, same-domain off-axis, or unrelated — predict bridge survival under pre-fill?

**Background:** Phase 9A's warm/fermentation anomaly revealed that the pre-fill's semantic relationship to the bridge is the strongest determinant of survival. Cool (on-axis substitute for warm on the temperature gradient) destroys warm entirely (0.000 survival). Harvest (same-domain off-axis — related to the grape-wine domain but not on the fermentation pathway) leaves fermentation intact (1.017 survival). This was a post-hoc observation. Phase 10B pre-registers the three-way classification and tests it directly.

**Three relation classes:**

1. **On-axis substitute:** The pre-fill could serve as a waypoint on the same navigational path as the bridge — it occupies a position on the same dimension, gradient, or transformation-chain and could *replace* the bridge as an intermediate step between the endpoints. Operational criterion: if you removed the bridge from the path, could the pre-fill serve as a plausible waypoint in the same slot? If yes, it is on-axis. If the bridge is "warm" on the hot-cold temperature axis, an on-axis substitute is "cool" — another position on the same axis that a model could route through instead. If the bridge is "fermentation" on the grape-wine transformation chain, an on-axis substitute is "pressing" — another stage of the same process.
2. **Same-domain off-axis:** The pre-fill is semantically related to the pair's domain but does not lie on the same axis as the bridge. If the bridge is "warm" for hot-cold, a same-domain off-axis concept is "thermometer" — related to temperature but not a position on the gradient. If the bridge is "fermentation" for grape-wine, a same-domain off-axis concept is "harvest" — related to winemaking but not a transformation stage.
3. **Unrelated:** The pre-fill is semantically unrelated to both the bridge and the pair's domain. This matches Phase 7A's "incongruent" condition.

**Hypothesis (H13):** Bridge survival is predicted by the pre-fill relation class:
- **On-axis substitutes** produce the lowest survival (< 0.30), because they provide an alternative position on the same navigational dimension, making the bridge unnecessary.
- **Same-domain off-axis** pre-fills produce moderate-to-high survival (> 0.60), because they prime the relevant domain without displacing the bridge's specific role.
- **Unrelated** pre-fills produce intermediate survival (0.30-0.70), matching Phase 7A's incongruent condition baseline.
- The ordering on-axis < unrelated < same-domain holds across pairs.

**Primary pre-registered test:** A paired test across the three relation classes, blocking on pair (each pair contributes all three conditions). Specifically: for each pair, compute the cross-model mean survival for each relation class, yielding 8 paired triples. Apply a Friedman test (non-parametric blocked comparison) across the three classes. Post-hoc: paired Wilcoxon signed-rank test on on-axis vs same-domain survival (8 paired observations), with bootstrap CI on the paired mean difference excluding zero. This blocking design respects the repeated-measures structure (same pair under all three conditions) and avoids the independence assumption violation of a flat ANOVA.

### Design

#### Pair Selection

We need pairs where (a) the bridge is well-established (prior unconstrained frequency > 0.40), (b) the bridge sits on a clear axis or gradient, and (c) we can construct all three pre-fill types unambiguously. Using pairs from prior phases with verified bridge behavior:

| # | Pair | Bridge | Uncon. Freq | On-Axis Substitute | Same-Domain Off-Axis | Unrelated |
|---|------|--------|-------------|-------------------|---------------------|-----------|
| 1 | hot → cold | warm | ~0.80 | cool | thermometer | algebra |
| 2 | grape → wine | fermentation | ~0.95 | pressing | harvest | velocity |
| 3 | light → color | spectrum | 0.917 | rainbow | brightness | volcano |
| 4 | emotion → melancholy | sadness | 0.950 | grief | mood | concrete |
| 5 | seed → garden | germination | 0.583 | sprouting | soil | equation |
| 6 | hide → shoe | leather | ~0.95 | rawhide | tanning | glacier |
| 7 | iron → bridge | steel | ~0.95 | wrought iron | furnace | melody |
| 8 | log → paper | pulp | ~1.00 | cellulose | sawmill | purple |

**Selection rationale:**
- Pairs 1-2 are the warm/fermentation pair from Phase 9A, now with all three conditions rather than the single pre-fill tested there.
- Pairs 3-5 have extensive prior data from Phases 6A/7A/9C, enabling comparison to prior survival rates.
- Pairs 6-8 are from Phase 9B transformation pairs that showed strong bottleneck bridges (leather, steel, pulp at near-1.00 for all models).

**Pre-fill concept rationale for each pair:**

1. **hot-cold / warm:** Cool = same gradient position (on-axis). Thermometer = measures temperature but isn't a temperature (off-axis). Algebra = unrelated.
2. **grape-wine / fermentation:** Pressing = another step in winemaking (on-axis). Harvest = grape-domain but pre-processing, not on fermentation chain (off-axis). Velocity = unrelated.
3. **light-color / spectrum:** Rainbow = another manifestation of the same light-decomposition phenomenon on the same axis as spectrum (on-axis). Brightness = light property but not on the decomposition axis (off-axis). Volcano = unrelated.
4. **emotion-melancholy / sadness:** Grief = more intense form of sadness on the same emotional axis (on-axis). Mood = emotional domain but not a specific emotion (off-axis). Concrete = unrelated.
5. **seed-garden / germination:** Sprouting = same process at a later stage (on-axis). Soil = gardening domain but not the growth process (off-axis). Equation = unrelated.
6. **hide-shoe / leather:** Rawhide = earlier stage on the same transformation chain (on-axis). Tanning = the process that creates leather but is not a material state (off-axis). Glacier = unrelated.
7. **iron-bridge / steel:** Wrought iron = an alternative refined-iron state on the same metalworking transformation chain (on-axis — models could route through wrought iron instead of steel to reach bridge). Furnace = metallurgy domain but the tool/location, not a material state (off-axis). Melody = unrelated.
8. **log-paper / pulp:** Cellulose = the material that pulp is made of, sitting on the same material-decomposition axis (on-axis — cellulose is what the wood becomes during pulping). Sawmill = paper production domain but the location, not a material state (off-axis). Purple = unrelated.

#### Unconstrained Baselines

Pairs 1-2 have Phase 8B/9A unconstrained data. Pairs 3-5 have Phase 6A unconstrained data. Pairs 6-8 have Phase 9B unconstrained data. All baselines are reused — no new unconstrained runs needed.

**Baseline stability check:** Phase 9 demonstrated that retrospective signals on small samples can collapse prospectively (G23). Before computing survival ratios, verify baseline stability for each pair: compute bootstrap 95% CI on the unconstrained bridge frequency from the reused data. Pairs where the baseline CI width exceeds 0.30 (indicating high uncertainty in the denominator) are flagged. For flagged pairs, the survival ratio is reported with propagated uncertainty (bootstrap CI on the ratio, not just on the numerator). If more than 2 of 8 pairs are flagged, consider collecting supplementary unconstrained runs (10 reps/model) to tighten the baseline, though this is not expected given that most baselines come from 15-40 rep datasets.

#### Experimental Conditions

For each of 8 pairs × 3 conditions × 4 models × 10 reps:

The pre-fill is placed at position 1 (same as Phase 7A/9C). The model produces 6 additional waypoints. Bridge frequency is computed across positions 1-7 (the pre-fill is position 1, so the bridge can appear at positions 2-7).

### Run Budget

| Condition | Pairs | Reps/model | Models | Runs |
|-----------|-------|-----------|--------|------|
| On-axis substitute | 8 | 10 | 4 | 320 |
| Same-domain off-axis | 8 | 10 | 4 | 320 |
| Unrelated | 8 | 10 | 4 | 320 |
| **Subtotal** | | | | **960** |

After 5% retry buffer: **~1,010 new runs.**

Unconstrained baselines: **0 new runs** (all reused from Phases 6A, 8B, 9A, 9B).

### Analysis Plan

1. **Survival rate by relation class.** For each pair × model × condition, compute survival = pre-fill bridge frequency / unconstrained bridge frequency. Report as 8 × 4 × 3 matrix. Aggregate by relation class: mean ± SE for on-axis, same-domain, unrelated.

2. **Relation class effect (primary test).** Friedman test on survival rates across the three relation classes, blocking on pair (each pair contributes all three conditions as cross-model mean survival). Report chi-squared statistic, p-value. Post-hoc pairwise: paired Wilcoxon signed-rank on on-axis vs same-domain, on-axis vs unrelated, same-domain vs unrelated (8 paired observations each), with bootstrap CI on the paired mean difference. This respects the repeated-measures structure and avoids treating observations from the same pair as independent.

3. **Ordering test.** Test whether the ordering on-axis < unrelated < same-domain holds per pair. Count the number of pairs where this ordering is observed (considering cross-model mean). Report proportion.

4. **Warm/fermentation replication.** For pairs 1-2, compare Phase 10B survival rates to Phase 9A survival rates. Phase 9A used "cool" for warm (on-axis) and "harvest" for fermentation (same-domain). Phase 10B uses the same concepts in a controlled three-way design. Do the new survival rates replicate Phase 9A within 0.15?

5. **Per-model analysis.** Report survival rates per model per relation class. Test whether Claude's rigid gait produces stronger on-axis displacement than GPT's flexible gait. Test whether Gemini shows reduced or absent relation-class differentiation (consistent with fragmented topology).

6. **Interaction with bridge strength.** Test whether the relation class effect is modulated by unconstrained bridge frequency. Strong bridges (spectrum 0.917, sadness 0.950, leather ~0.95) may resist even on-axis substitution, while moderate bridges (germination 0.583) may be more vulnerable. Report correlation between unconstrained frequency and on-axis survival.

7. **Comparison to Phase 7A conditions.** Phase 7A used "congruent" / "incongruent" / "neutral" conditions that do not map cleanly onto the Phase 10 three-class taxonomy — a Phase 7A "congruent" pre-fill could be either on-axis or same-domain in Phase 10 terms, depending on the specific concept chosen. Rather than attempting a forced mapping, this analysis asks: does the Phase 10 three-class taxonomy explain more variance in survival than Phase 7A's two-class (congruent vs incongruent) taxonomy? For the 5 overlapping pairs (3-5 from Phase 6A/7A), compute: (a) the within-class variance under Phase 7A's congruent category, and (b) the within-class variance under Phase 10's on-axis and same-domain categories separately. If Phase 10's taxonomy reduces within-class variance (the congruent category was mixing on-axis and same-domain cases with different survival outcomes), this validates the Phase 9A insight.

8. **Effect size.** Compute Cohen's d for on-axis vs same-domain. Report whether the effect is small (0.2), medium (0.5), or large (0.8+).

### Predictions

1. On-axis substitutes produce mean survival < 0.30 (displacement). The on-axis pre-fill provides an alternative navigational route that bypasses the bridge.
2. Same-domain off-axis pre-fills produce mean survival > 0.60 (preservation). The off-axis pre-fill primes the relevant domain without displacing the bridge.
3. Unrelated pre-fills produce mean survival between 0.30-0.70 (intermediate), consistent with Phase 7A's incongruent condition.
4. The ordering on-axis < unrelated < same-domain holds for at least 6 of 8 pairs.
5. Friedman test is significant (p < 0.05). Post-hoc: paired on-axis vs same-domain difference CI excludes zero.
6. Warm (hot-cold) shows on-axis survival < 0.10 (replicating Phase 9A's 0.000) and same-domain survival > 0.50.
7. Fermentation (grape-wine) shows same-domain survival > 0.80 (replicating Phase 9A's 1.017) and on-axis survival < 0.50.
8. Strong bridges (spectrum, sadness, leather, steel, pulp: unconstrained freq > 0.90) show higher on-axis survival than moderate bridges (warm, germination: unconstrained freq < 0.85). Correlation between unconstrained frequency and on-axis survival is positive (rho > 0.40).
9. Claude shows the sharpest relation-class separation (largest on-axis vs same-domain gap), consistent with rigid gait amplifying displacement effects.
10. Gemini shows the weakest relation-class separation, consistent with fragmented topology reducing pre-fill modulation.

---

## Files

| Action | File | Lines |
|--------|------|-------|
| Create | `src/data/pairs-phase10.ts` | ~250 (Phase 10 pair definitions: 8 core pairs for Part A, 8 relation-class pairs for Part B with three pre-fill types each, new model configs) |
| Create | `experiments/10a-model-generality.ts` | ~400 (reliability protocol + batch elicitation for 5 new models across 12 pair directions, with probe/parse/latency checks) |
| Create | `experiments/10b-relation-classes.ts` | ~300 (three-condition pre-fill experiment across 8 pairs × 4 original models) |
| Create | `analysis/10a-model-generality.ts` | ~500 (gait profiles, asymmetry, bridge frequency, control validation, cohort comparison, clustering/dendrogram, scale effect analysis) |
| Create | `analysis/10b-relation-classes.ts` | ~450 (survival by relation class, ANOVA/KW test, ordering test, warm/fermentation replication, per-model analysis, interaction with bridge strength, Phase 7A comparison, effect size) |
| Modify | `src/types.ts` | ~60 (Phase10CorePair, Phase10RelationClassPair, Phase10ModelReliabilityResult, analysis output types) |
| Modify | `src/data/pairs.ts` | ~30 (add NEW_MODELS array with 5 new model configs, keep MODELS unchanged for backward compatibility) |
| Modify | `package.json` | ~8 scripts (model-generality, analyze-model-generality, relation-classes, analyze-relation-classes, phase10) |

## Docs to Update

- `.planning/STATE.md` — Phase 10 summary, key findings, blockers
- `.planning/ROADMAP.md` — Phase 9 completion entry, Phase 10 implementation
- `findings/CLAIMS.md` — Update R1-R7 generality status, add H12/H13 outcome, add new observations from Phase 10
- `findings/10-analysis.md` — Interpretive analysis
- `findings/10a-model-generality.md` — Generated findings (analysis script)
- `findings/10b-relation-classes.md` — Generated findings (analysis script)
- `.planning/GRAVEYARD.md` — Add any new dead ends from Phase 10

## Execution Order

```bash
# Part A — Model reliability probing + data collection (~10-15 min depending on model speed)
bun run model-generality                  # ~960 runs (probes + full elicitation across 5 models, skips failed models)
bun run analyze-model-generality          # Gait profiles, asymmetry, bridge frequency, cohort comparison

# Part B — Pre-fill relation classes (~8-10 min)
bun run relation-classes                  # ~1,010 runs (3 conditions × 8 pairs × 4 models × 10 reps)
bun run analyze-relation-classes          # Friedman test, ordering test, warm/fermentation replication

# Or run everything:
bun run phase10
```

## Implementation Order

1. Add new model configs to `src/data/pairs.ts` (NEW_MODELS array, separate from MODELS for backward compatibility)
2. Add types to `src/types.ts` (Phase10CorePair, Phase10RelationClassPair with onAxis/offAxis/unrelated fields, Phase10ModelReliabilityResult, analysis output types)
3. Create `src/data/pairs-phase10.ts` (8 core pairs for Part A, 8 relation-class pairs for Part B with three pre-fill types)
4. Create and run Part A experiment (reliability probes first, then full elicitation for models that pass)
5. Create and run Part A analysis (gait profiles, asymmetry, bridge frequency, cohort comparison, scale effect)
6. Create and run Part B experiment (three-condition pre-fill, reusing unconstrained baselines)
7. Create and run Part B analysis (ANOVA, ordering, replication, per-model, interaction)
8. Write interpretive analysis (`findings/10-analysis.md`)
9. Update `.planning/STATE.md`, `ROADMAP.md`, `findings/CLAIMS.md`, `.planning/GRAVEYARD.md`
10. Commit

## Totals

- **New files:** 5 (pairs-phase10, 2 experiments, 2 analyses)
- **Modified files:** 3 (types.ts, pairs.ts, package.json)
- **New code:** ~1,990 lines
- **New API runs:** ~1,970 total (Part A: ~960 + Part B: ~1,010)
- **Reused data:**
  - Phase 6A unconstrained landscapes (pairs 3-5 of Part B) — for baseline bridge frequencies
  - Phase 8B/9A unconstrained data (pairs 1-2 of Part B) — for baseline bridge frequencies
  - Phase 9B unconstrained data (pairs 6-8 of Part B) — for baseline bridge frequencies
  - Phase 1-9 gait/asymmetry/bridge data (original 4 models) — for cohort comparison
  - Total reused: ~2,000 existing data points
- **Runtime:** ~15-25 minutes total (Part A limited by slowest new model; Part B similar to prior phases)
- **Cost:** ~$8-17 via OpenRouter (pricing depends heavily on new model rates)

## Verification

### Part A
- Reliability protocol executed for all 5 new models (connectivity, parse, latency checks)
- At least 3 models classified as reliable and fully collected
- Failed/slow/unparseable models documented with failure mode
- 8 forward pairs × reliable models × 15 reps collected
- 4 reverse pairs × reliable models × 15 reps collected
- Gait profiles computed for all reliable new models
- Asymmetry computed for 4 forward-reverse pairs per new model
- Bridge frequency matrix (8 × N) computed and reported
- Control pair (stapler-monsoon) frequency distribution reported
- Cohort comparison with bootstrap CI computed
- Clustering analysis across all models (original + new) produced
- Scale effect analysis (Llama 8B vs others) reported if Llama passes reliability
- `setMetricsSeed(42)` for reproducibility

### Part B
- All 8 pairs × 3 conditions × 4 models × 10 reps collected = 960 runs (+ retry buffer)
- Survival rates computed for all pair × model × condition combinations
- Friedman test computed with chi-squared statistic and p-value
- Post-hoc pairwise comparisons with bootstrap CIs
- Ordering test: count of pairs where on-axis < unrelated < same-domain
- Warm/fermentation comparison to Phase 9A survival rates
- Per-model analysis with relation-class separation per model
- Interaction with bridge strength (correlation between unconstrained freq and on-axis survival)
- Phase 7A condition comparison
- Effect size (Cohen's d) for on-axis vs same-domain

## Done When

- Part A establishes model generality (or its limits):
  - At least 3 new models produce usable data with clear gait profiles, bridge bottleneck behavior, and asymmetry
  - Cohort comparison shows whether structural findings generalize (CI includes zero → generalize) or reveals model-class boundaries (CI excludes zero → boundary identified)
  - If Llama 8B produces usable data, scale effect is characterized (degraded vs. intact structural properties)
  - R1-R7 generality status updated in CLAIMS.md
- Part B establishes pre-fill relation classes as a predictor (or falsifies):
  - Friedman test shows significant relation-class effect (p < 0.05), confirming H13 and providing the first successful multi-variable test in Phases 8-10, OR
  - Friedman test is non-significant, adding G26 to graveyard and confirming that even the warm/fermentation insight was pair-specific rather than generalizable
  - Warm/fermentation replication succeeds (within 0.15 of Phase 9A survival), OR identifies the anomaly as unreliable
  - The three-way classification is compared to Phase 7A's two-way classification and either subsumes it (demonstrating finer-grained predictive power) or proves equivalent (Phase 7A's classification was already sufficient)
- All reliable new models' data archived in results/
- Interpretive analysis connecting both parts to the paper's narrative
- Graveyard and CLAIMS.md updated
- STATE.md and ROADMAP.md updated
