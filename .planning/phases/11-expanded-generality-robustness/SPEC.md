# Phase 11: Expanded Generality, Control Revision, and Robustness

## Context

Phase 10 established the benchmark's generality result: structural properties AND navigational content generalize across 8 models from 8 providers (~19,500 total runs). But three vulnerabilities remain before the paper:

1. **Model coverage gaps.** Three major model families are entirely absent: DeepSeek, Mistral, and Cohere. These represent independent training pipelines from Chinese, European, and North American labs respectively. A reviewer can reasonably ask: "Does this hold for DeepSeek?" Additionally, the Llama 3.1 8B outlier (O25) raises the question of whether the scale effect is Meta-family-specific or universal. Llama 4 Maverick (400B MoE) would resolve this.

2. **Control pair failure.** The stapler-monsoon control pair fails R5 for ALL non-original models (O27). This is the paper's most reviewable weakness. New control pairs must be designed, screened, and validated.

3. **Protocol sensitivity.** All 10 phases used 7 waypoints, 0.7 temperature, and the "semantic" prompt format. A reviewer can ask: "Is conceptual gait an artifact of your prompt?" Multiverse robustness testing on key claims would preempt this.

Phase 11 is designed as three tightly scoped experiments, run sequentially. Patient mode (300s timeouts) is the default throughout, based on Phase 10A's finding that aggressive timeouts create false negatives.

- **Part A** — Expanded model generality: 4 new models (~720 new runs)
- **Part B** — Control pair revision: screen and validate 4 new control pairs (~640 new runs)
- **Part C** — Multiverse robustness: waypoint count and temperature grid on key claims (~900 new runs)

Total budget: ~2,260 new API runs + ~1,500 reused, ~$10-25.

---

## Part A: Expanded Model Generality

**Core question:** Do R1 (gait), R2 (asymmetry), and bridge bottleneck behavior generalize to DeepSeek, Mistral, Cohere, and a large Llama model? Does the Llama 8B scale effect (O25) persist or resolve at Llama 4 scale?

### New Models

| # | Model | OpenRouter ID | Family | Why |
|---|-------|---------------|--------|-----|
| 1 | DeepSeek V3.2 | `deepseek/deepseek-v3.2` | DeepSeek (Hangzhou) | Completely missing family. Sparse attention architecture, GPT-5-class. Top priority. |
| 2 | Mistral Large 3 | `mistralai/mistral-large-2512` | Mistral (Paris) | Missing family. European-trained, multimodal, distinct training pipeline. |
| 3 | Cohere Command A | `cohere/command-a` | Cohere (Toronto) | Missing family. Enterprise/RAG-oriented training lineage. |
| 4 | Llama 4 Maverick | `meta-llama/llama-4-maverick` | Meta (Menlo Park) | Within-family scale test. 400B MoE. Resolves whether Llama 8B outlier is scale vs family effect. |

**Model selection rationale:**
- **Cross-family priority (80%).** DeepSeek, Mistral, and Cohere add 3 entirely new training pipelines. After Phase 11, the benchmark spans 11 independent families: Anthropic, OpenAI, xAI, Google, MiniMax, Moonshot, Qwen/Alibaba, Meta, DeepSeek, Mistral, Cohere.
- **Within-family control (20%).** Llama 4 Maverick tests the O25 scale hypothesis directly. If Maverick shows bridge frequencies comparable to the original cohort (~0.82), the scale interpretation is confirmed. If it still diverges, Meta's training process produces genuinely different navigational landmarks.

### Pair Selection

Same 12-pair battery as Phase 10A (proven design, enables direct cohort comparison):

| # | Pair (A → B) | Tests | Expected Bridge | Prior Freq |
|---|-------------|-------|-----------------|------------|
| 1 | music → mathematics | R6 bridge bottleneck | harmony | 0.550 |
| 2 | light → color | R6 strong bottleneck | spectrum | 0.917 |
| 3 | animal → poodle | R4 hierarchical compositionality | dog | 0.970 |
| 4 | emotion → melancholy | R6 bridge salience | sadness | 0.950 |
| 5 | hot → cold | R2 asymmetry; antonym | warm | ~0.800 |
| 6 | hide → shoe | R6 transformation bottleneck | leather | ~0.950 |
| 7 | seed → garden | R6 process-naming; O4 | germination | 0.583 |
| 8 | stapler → monsoon | R5 control (known-failing) | (none) | varies |
| 9 | mathematics → music | R2 asymmetry (reverse) | | |
| 10 | color → light | R2 asymmetry (reverse) | | |
| 11 | poodle → animal | R2 asymmetry (reverse) | | |
| 12 | melancholy → emotion | R2 asymmetry (reverse) | | |

Pair 8 (stapler-monsoon) is retained for continuity — we expect it to fail R5 for the new models (consistent with O27). The replacement controls are tested in Part B.

### Run Parameters

- **Prompt format:** Semantic
- **Waypoints:** 7
- **Temperature:** 0.7
- **Reps per model per pair:** 15
- **Patient mode:** ON by default (300s request timeout, 300s latency gate)
- **Probe protocol:** Same two-stage design as Phase 10A (3 probes → full run for passing models)

### Run Budget

| Condition | Pairs | Reps/model | Models | Runs |
|-----------|-------|-----------|--------|------|
| Forward elicitation (pairs 1-8) | 8 | 15 | 4 | 480 |
| Reverse elicitation (pairs 9-12) | 4 | 15 | 4 | 240 |
| Probes | 3 | 1 | 4 | 12 |
| **Subtotal** | | | | **732** |

After retry buffer: **~720 effective runs** (fewer if models fail probes).

### Analysis Plan

1. **Model reliability report.** Connectivity, parse rate, latency per model. Same protocol as 10A.
2. **Gait profile (R1).** Intra-model Jaccard per new model. Position in the 12-model gait spectrum.
3. **Asymmetry (R2).** Directional asymmetry on 4 forward-reverse pairs per model. All > 0.60?
4. **Bridge frequency.** 7 forward pairs × 4 models matrix. Cohort comparison to original 4 and Phase 10A 4.
5. **Llama scale test.** Llama 4 Maverick vs Llama 3.1 8B across all metrics. If Maverick bridge freq is within 0.15 of original cohort, scale hypothesis confirmed.
6. **12-model cross-model similarity matrix.** Pairwise Jaccard across all 12 models. Clustering/dendrogram.
7. **Combined cohort test.** Pool all 8 new models (Phase 10A + 11A) vs original 4. Bootstrap CI on bridge frequency difference. This is the paper's headline generality number.

### Predictions

1. All 4 new models pass the probe reliability gate (patient mode default should prevent Phase 10A-style false negatives).
2. All 4 show distinct gaits (Jaccard in 0.15-0.70 range), replicating R1.
3. All 4 show asymmetry > 0.60, replicating R2.
4. DeepSeek, Mistral, and Cohere show bridge frequencies comparable to the original cohort (mean within 0.20 of 0.817). CI on difference includes zero.
5. Llama 4 Maverick shows bridge frequency > 0.60 (vs Llama 3.1 8B at 0.200), confirming scale effect over family effect.
6. Stapler-monsoon continues to fail R5 for all 4 new models (consistent with O27).
7. DeepSeek V3.2 clusters with Claude/Qwen in the cross-model similarity matrix (high-consistency models).

---

## Part B: Control Pair Revision

**Core question:** Can we design control pairs that pass R5 validation across a diverse model cohort, replacing the failing stapler-monsoon?

### Background

O27 showed that stapler-monsoon has unintended semantic bridges ("paper", "office", "cloud") that many models discover. The original 4 models passed by chance. For the paper, we need controls that validate across all 12 models.

### Design Principles for New Controls

A good control pair should have:
1. **No strong associative chain** between endpoints (no "paper" connecting stapler to monsoon)
2. **Domain separation** — endpoints from maximally unrelated domains
3. **Low imageability overlap** — no shared sensory features that could anchor navigation
4. **No functional relationship** — no common purpose, tool-use, or causal link

### Candidate Control Pairs

| # | Pair (A → B) | Domains | Rationale |
|---|-------------|---------|-----------|
| C1 | turmeric → trigonometry | spice / mathematics | No functional link. No shared sensory features. Domain separation is maximal. |
| C2 | barnacle → sonnet | marine biology / literature | Different kingdoms of experience. Minimal associative overlap. |
| C3 | magnesium → ballet | chemistry / performing arts | Element vs art form. No cultural or functional link. |
| C4 | accordion → stalactite | musical instrument / geology | Concrete-concrete but maximally unrelated domains. |

### Screening Protocol

Each candidate is screened across 6 models (the 4 original + 2 from Phase 10A/11A with highest bridge frequencies, as a stress test):

1. **Run 10 reps per model per pair** (forward direction only).
2. **Compute top-waypoint frequency.** If any single waypoint exceeds 0.15 frequency for any model, the pair fails screening.
3. **Compute Shannon entropy** of waypoint distribution. Must exceed 5.0 for all models (indicating broad spread).
4. **Pass threshold:** Top waypoint < 0.15 across all 6 screening models AND entropy > 5.0. Pairs passing on at least 4/6 models are accepted with a qualification.

### Run Budget

| Condition | Pairs | Reps/model | Models | Runs |
|-----------|-------|-----------|--------|------|
| Control screening | 4 | 10 | 6 | 240 |
| Validation (passing pairs) | ~3 | 15 | 8 | ~360 |
| **Subtotal** | | | | **~600** |

After retry buffer: **~640 total runs.**

Screening phase is fast (~240 runs). Validation runs the passing controls at full 15-rep depth across 8 models (original 4 + 4 new from this phase). If all 4 candidates pass screening, we validate only the best 3 (lowest max top-waypoint frequency).

### Analysis Plan

1. **Screening report.** Per candidate × model: top waypoint, top frequency, entropy. Pass/fail classification.
2. **Validation report.** For passing pairs: full frequency distributions, comparison to stapler-monsoon on the same models.
3. **R5 revision proposal.** Recommend which pairs to adopt as the benchmark's control set. May recommend using 2-3 controls and reporting the distribution of control behavior rather than a single pass/fail.
4. **Retrospective stapler-monsoon analysis.** Why did the original 4 models pass? Analyze their stapler-monsoon waypoint distributions for clues about what makes a model "resist" vs "discover" the paper-office bridge.

### Predictions

1. At least 2 of 4 candidate pairs pass screening (top waypoint < 0.15 across all 6 models).
2. Turmeric-trigonometry and magnesium-ballet are the strongest candidates (maximally abstract-concrete cross-domain pairs).
3. Accordion-stalactite may fail (both are physical objects with strong sensory features — potential shared "cave" or "music" associations).
4. Passing pairs show entropy > 5.0 for all models, confirming genuinely unstructured navigation.

---

## Part C: Multiverse Robustness

**Core question:** Are R1 (gait), R2 (asymmetry), and bridge bottleneck behavior robust to variations in waypoint count and temperature?

### Background

All 10 phases used fixed parameters: 7 waypoints, temperature 0.7, "semantic" prompt format. Phase 1 showed that 5-waypoint paths are genuine coarse-grainings of 10-waypoint paths (O10: 70.5% shared waypoint fraction), but no phase has tested whether the core structural claims survive parameter variation. A reviewer can plausibly argue that "conceptual gait" is an artifact of the specific elicitation protocol.

### Design

A focused 2×2 grid on the most reviewer-salient parameters:

| Parameter | Values | Rationale |
|-----------|--------|-----------|
| Waypoint count | 5, 9 | Bracket the standard 7. Phase 1 tested 5 vs 10; this tests the structural claims, not just path overlap. |
| Temperature | 0.5, 0.9 | Bracket the standard 0.7. Lower temp → more deterministic; higher temp → more creative. If gait is just a temperature artifact, 0.5 should inflate Jaccard and 0.9 should deflate it equally for all models. |

Standard (7 waypoints, 0.7 temp) data is reused from Phases 1-10 — no new runs needed for the baseline condition.

### Pair Selection

Minimal but diagnostic set of 4 pairs, chosen to span the phenomenon:

| # | Pair | Why |
|---|------|-----|
| 1 | light → color | Strongest bottleneck (spectrum ~0.92). Tests whether bridge frequency survives. |
| 2 | hot → cold | Antonym axis with clear gradient bridge (warm). Tests R2 asymmetry. |
| 3 | emotion → melancholy | Bridge with moderate variability (sadness ~0.95). Tests gait. |
| 4 | stapler → monsoon | Control. Tests whether control behavior changes with parameters. |

Plus 2 reverse pairs for asymmetry:

| 5 | cold → hot | R2 asymmetry |
| 6 | melancholy → emotion | R2 asymmetry |

### Models

3 models spanning the gait spectrum:
- **Claude Sonnet 4.6** — Highest gait consistency (0.578)
- **GPT-5.2** — Lowest gait consistency (0.258)
- **DeepSeek V3.2** — New model from Part A (adds generality)

### Run Budget

| Condition | Pairs | Reps | Models | Runs |
|-----------|-------|------|--------|------|
| 5 waypoints, temp 0.5 | 6 | 15 | 3 | 270 |
| 5 waypoints, temp 0.9 | 6 | 15 | 3 | 270 |
| 9 waypoints, temp 0.5 | 6 | 15 | 3 | 270 |
| 9 waypoints, temp 0.9 | 6 | 15 | 3 | 270 |
| **Subtotal** | | | | **1,080** |

After deduplication (if any condition matches existing data) and retry buffer: **~900 new runs.**

Baseline condition (7 waypoints, 0.7 temp) reused from prior phases: ~540 existing runs across these pairs/models.

### Analysis Plan

1. **Gait robustness.** Compute intra-model Jaccard per condition for each model. Plot Jaccard across the 5 conditions (4 new + 1 baseline). If the rank ordering of models' gait consistency is preserved (Claude > GPT regardless of parameters), R1 is robust. If temperature 0.5 equalizes all models' Jaccard, gait is partially a temperature artifact.

2. **Asymmetry robustness.** Compute directional asymmetry for hot-cold and emotion-melancholy under each condition. If asymmetry > 0.60 across all conditions, R2 is robust. Report mean asymmetry × condition matrix.

3. **Bridge frequency robustness.** Compute spectrum and warm bridge frequency under each condition. If bridge frequency remains above 0.50 across all conditions for all models, bridge bottleneck behavior is robust. Report bridge freq × condition × model matrix.

4. **Interaction test.** Two-way ANOVA (waypoint count × temperature) on gait, asymmetry, and bridge frequency. Report main effects and interaction. A null interaction with non-null model main effect confirms that model identity, not protocol, drives the structure.

5. **Waypoint count scaling.** Does the 5wp-to-7wp relationship (O10: 70.5% shared waypoints) extend to 7wp-to-9wp? Compute shared waypoint fraction between 5wp and 9wp conditions.

### Predictions

1. R1 survives: model rank ordering of gait Jaccard is preserved across all 4 conditions (Kendall's W > 0.70 across 5 conditions × 3 models).
2. R2 survives: mean asymmetry > 0.60 for all conditions.
3. Bridge bottleneck survives: spectrum frequency > 0.50 and warm frequency > 0.30 across all conditions and models.
4. Temperature 0.5 increases all models' Jaccard by 0.05-0.15 (more deterministic), but the inter-model gap remains.
5. Temperature 0.9 decreases all models' Jaccard by 0.05-0.15, but does not eliminate the gait phenomenon (all models still > 0.10).
6. 5-waypoint paths show higher bridge frequency than 9-waypoint paths (bridges are more constrained in shorter sequences).
7. Control pair (stapler-monsoon) remains unstructured across all parameter variations.

---

## Files

| Action | File | Lines |
|--------|------|-------|
| Create | `src/data/pairs-phase11.ts` | ~200 (Phase 11 pair definitions: 12 core pairs for Part A, 4 control candidates for Part B, 6 robustness pairs for Part C, new model configs) |
| Create | `experiments/11a-expanded-generality.ts` | ~350 (probe + batch elicitation for 4 new models, patient mode default) |
| Create | `experiments/11b-control-revision.ts` | ~250 (control screening + validation across 6-8 models) |
| Create | `experiments/11c-robustness.ts` | ~300 (2×2 grid: waypoint count × temperature, 3 models, 6 pairs) |
| Create | `analysis/11a-expanded-generality.ts` | ~450 (gait, asymmetry, bridge freq, Llama scale test, 12-model matrix) |
| Create | `analysis/11b-control-revision.ts` | ~200 (screening report, validation, R5 revision proposal) |
| Create | `analysis/11c-robustness.ts` | ~400 (robustness matrices, ANOVA, interaction tests, scaling) |
| Modify | `src/data/pairs.ts` | ~20 (add PHASE11_MODELS array) |
| Modify | `src/types.ts` | ~80 (Phase11 types: control screening, robustness grid, expanded model results) |
| Modify | `package.json` | ~12 scripts |

## Docs to Update

- `.planning/STATE.md` — Phase 11 summary, updated model count, control revision
- `.planning/ROADMAP.md` — Phase 11 completion entry
- `findings/CLAIMS.md` — R1/R2/R5 generality updates, new observations, multiverse robustness qualification
- `findings/11a-expanded-generality.md` — Generated findings
- `findings/11b-control-revision.md` — Generated findings
- `findings/11c-robustness.md` — Generated findings
- `findings/11-analysis.md` — Interpretive analysis
- `.planning/GRAVEYARD.md` — Any new dead ends
- `CLAUDE.md` — Update model list, add Phase 11 CLI commands

## CLI Usage

All experiments support `--patient` (enabled by default in Phase 11) and `--dry-run`.

```bash
# Part A — Expanded model generality (~15-20 min with patient mode)
bun run expanded-generality              # ~720 runs (4 new models × 12 pairs × 15 reps)
bun run analyze-expanded-generality      # 12-model gait/asymmetry/bridge/clustering

# Part B — Control pair revision (~10 min)
bun run control-revision                 # ~640 runs (screening + validation)
bun run analyze-control-revision         # Screening report, R5 revision proposal

# Part C — Multiverse robustness (~15 min)
bun run robustness                       # ~900 runs (2×2 grid × 3 models × 6 pairs)
bun run analyze-robustness               # Robustness matrices, ANOVA, interaction tests

# Or run everything sequentially:
bun run phase11
```

**Running experiments yourself (recommended):**
```bash
# In tmux, patient mode is the default — no need for --patient flag
tmux new -s phase11

# Run all three parts sequentially
bun run phase11

# Or run parts individually to inspect between steps
bun run expanded-generality && bun run analyze-expanded-generality
# ... inspect 11a findings, then continue ...
bun run control-revision && bun run analyze-control-revision
bun run robustness && bun run analyze-robustness
```

## Implementation Order

1. Add PHASE11_MODELS to `src/data/pairs.ts` (4 new model configs)
2. Add Phase 11 types to `src/types.ts`
3. Create `src/data/pairs-phase11.ts` (pair definitions for all three parts)
4. **Part A:** Create experiment → run → create analysis → run analysis → write findings
5. **Part B:** Create experiment → run screening → run validation → create analysis → run analysis → write findings
6. **Part C:** Create experiment → run → create analysis → run analysis → write findings
7. Write interpretive analysis (`findings/11-analysis.md`)
8. Update STATE.md, ROADMAP.md, CLAIMS.md, GRAVEYARD.md, CLAUDE.md
9. Commit

## Totals

- **New files:** 7 (pairs-phase11, 3 experiments, 3 analyses)
- **Modified files:** 4 (types.ts, pairs.ts, package.json, CLAUDE.md)
- **New code:** ~2,230 lines
- **New API runs:** ~2,260 total (Part A: ~720 + Part B: ~640 + Part C: ~900)
- **Reused data:** ~1,500 existing data points (baseline conditions from Phases 1-10)
- **Runtime:** ~40-60 minutes total with patient mode (run in tmux)
- **Cost:** ~$10-25 via OpenRouter

## Verification

### Part A
- All 4 new models probed; reliability classified
- At least 3 pass probe gate (patient mode prevents false negatives)
- 12-pair × passing-models data collected
- Gait, asymmetry, bridge frequency computed per model
- 12-model cross-model similarity matrix produced
- Llama 4 Maverick vs Llama 3.1 8B comparison reported
- Combined 8-model cohort comparison (Phases 10A+11A new vs original 4) with bootstrap CI

### Part B
- 4 candidate controls screened across 6 models
- Pass/fail classification per candidate
- At least 2 candidates pass screening
- Passing candidates validated at full depth across 8 models
- R5 revision recommendation produced
- Retrospective stapler-monsoon analysis completed

### Part C
- 2×2 grid fully collected: 4 conditions × 6 pairs × 3 models × 15 reps
- Gait robustness: model rank ordering preserved?
- Asymmetry robustness: all conditions > 0.60?
- Bridge frequency robustness: all conditions > 0.50?
- ANOVA interaction test reported
- Waypoint count scaling computed

## Done When

- **Part A** confirms generality across 12 models from 11 families (or identifies family-specific boundaries). The paper can claim "tested across N independent training pipelines" where N >= 10.
- **Part B** provides 2-3 validated control pairs that pass R5 across all 12 models. R5 is revised from single-pair pass/fail to a control battery with distributional validation.
- **Part C** demonstrates that R1, R2, and bridge bottleneck behavior survive waypoint count and temperature variation. The paper can state "robust across protocol variations" with specific evidence.
- Combined, these three results close the reviewer vulnerabilities identified in the pre-paper assessment. The empirical program is complete and paper writing can begin.
