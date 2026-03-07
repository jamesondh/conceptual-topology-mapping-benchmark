# State

## Current Phase
Phase 12: Paper Writing — **ALL SECTIONS DRAFTED AND REVIEWED**
- Section 2 (The Benchmark) drafted and reviewed
- Section 4 (Structure: Act I) drafted and reviewed
- Section 5 (Topology: Act II) drafted and reviewed
- Section 6 (Mechanism: Act III) drafted and reviewed
- Section 7 (Limits: Act IV) drafted and reviewed
- Section 8 (Generality: Act V) drafted and reviewed
- Section 9 (Robustness: Act VI) drafted and reviewed
- Section 10 (Discussion) drafted, Codex-reviewed, fixes applied
- Section 11 (Conclusion) drafted, Codex-reviewed, fixes applied
- Section 1 (Introduction) drafted, Codex-reviewed, fixes applied
- Section 3 (Related Work) drafted, Codex-reviewed, fixes applied
- Abstract drafted and reviewed

## Context
- Research survey complete (`research.md`)
- Word convergence game (575 games, 4 models) provides empirical foundation
- Core thesis: no benchmark systematically evaluates whether LLMs can *navigate* conceptual space consistently
- **Phases 1-11 complete. ~21,540 total unique API runs across 12 models from 11 independent training pipelines.**

## Phase 1-4 Summary (Condensed)
- **Models have distinct gaits** (Claude 0.578 vs GPT 0.258). Asymmetry universal (0.811). Dual-anchor paths confirmed. Hierarchical transitivity 0.175 vs random 0.036 (4.9×). Triangle inequality 91%. Bridge frequency model-dependent. Prediction accuracy 81.3%.

## Phase 5-7 Summary (Condensed)
- **Phase 5:** Gradient real (12/16 monotonic). Prediction accuracy 42.9%.
- **Phase 6:** Salience non-uniform. Bridges anchor early (position 1-2).
- **Phase 7:** Pre-filling causally displaces bridges (0.515, CI excludes zero). Gradient > causal-chain (0.730 vs 0.496).

## Phase 8 Summary (Condensed)
- Three hypotheses fail (G20-G22). Single-variable mechanistic models fail. Prediction accuracy 24%.

## Phase 9 Summary (Condensed)
- **3,037 new runs** across dominance/transformation/facilitation pairs. Three mechanistic hypotheses fail (G23-G25). Pre-fill content is secondary modulator. Prediction accuracy 20% — mechanism ceiling confirmed.

## Phase 10 Summary (Condensed)
- **1,680 new runs + 778 reused** across 5 new models and 4 core models. R1/R2 replicate universally. Bridge frequency CI includes zero (structure generalizes). Llama 8B scale effect. R5 fails universally. Prediction accuracy 50%. Capstone finding: structure + content generalize; scale differentiates.

## Key Design Decisions
- Exploration-first workflow — phases follow the most interesting data signal
- Phases 8-10 establish that single-variable models are inadequate (7/8 hypotheses fail at primary test level, 1 resurrected)
- Dead ends tracked in `GRAVEYARD.md` (29 entries G1-G29; G26 resurrected by expanded data)
- All major claims cataloged in `findings/CLAIMS.md` ([robust], [observed], [hypothesis])
- Structure/content/scale hierarchy is the capstone finding: geometric structure is universal, navigational landmarks are shared among large models, scale differentiates

## Phase 11 Summary (Condensed)
- **2,040 new runs + ~340 reused** across 4 new models (11A), 6 screening models (11B), 3 robustness models (11C).
- **Part A — Expanded Generality (720 runs, 4 models):** R1 replicated (gait 0.502-0.747; Mistral record 0.747). R2 replicated (all > 0.60). Bridge freq CI includes zero (0.717 vs 0.817, diff -0.100). Llama scale confirmed (Maverick 0.724 vs 8B 0.200). Control continues to fail. 5/7 predictions confirmed.
- **Part B — Control Revision (240 runs):** All 4 candidates fail (0/24 cells pass). Stapler-monsoon fails R5 for all 12 models. R5 single-pair design inadequate. 1/4 predictions confirmed.
- **Part C — Multiverse Robustness (1,080 runs, 3 models):** ANOVA model identity drives structure (η²=0.242, p≈0.001). Bridge frequency most robust (>0.97 all conditions). Gait rank largely stable (W=0.840, though GPT/DeepSeek swap). Asymmetry waypoint-sensitive. 2/7 predictions confirmed.
- **Combined prediction accuracy: 8/18 (44%).** Observations: O28-O32. Graveyard: G28-G29.

## Figure/Table Generation (Phase 12 Sub-Task)
- Python visualization pipeline built: `writeup/scripts/` (config.py, build_manifest.py, data_loader.py, generate_figures.py, generate_tables.py)
- `paper_manifest.json` preprocesses 26 analysis JSONs into unified data source (236 KB)
- 13 data-driven figures generated (PDF + PNG); Fig 0, 1 deferred as design tasks
- 8 LaTeX tables generated (booktabs style)
- Codex review found 7 issues (4 high, 2 medium, 1 low); all fixed and verified:
  - Fig 5: Now includes all 84 pair/model combos (mean 0.811, matches paper)
  - Fig 6: Correctly separates hierarchical vs random triples (was mixing all types)
  - Table 7(a): Uses 12-model retrospective from 11b data (was using 3-model fig14 data)
  - Fig 7: Correct 4-panel layout (bottleneck/off-axis/process-vs-object/too-central)
  - Fig 4: Filtered to 4 categories, Fig 8: 1-based positions, Table 7: deterministic ties
- Section placeholders replaced with file references in all 8 section files

## Blockers
None

## Next Steps
- Remaining: appendix drafting, LaTeX conversion, citation formatting, target venue selection
