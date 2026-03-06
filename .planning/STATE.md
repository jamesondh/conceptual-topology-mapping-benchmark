# State

## Current Phase
Phase 11: Expanded Generality, Control Revision, and Robustness — **COMPLETE**

## Context
- Research survey complete (`research.md`)
- Word convergence game (575 games, 4 models) provides empirical foundation
- Core thesis: no benchmark systematically evaluates whether LLMs can *navigate* conceptual space consistently
- **Phases 1-11 complete. ~21,540 total unique API runs across 12 models from 11 families.**

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
- Phases 8-10 establish that single-variable mechanistic models are inadequate (8/8 hypotheses fail at primary test level)
- Dead ends tracked in `GRAVEYARD.md` (29 entries G1-G29; G26 resurrected by expanded data)
- All major claims cataloged in `findings/CLAIMS.md` ([robust], [observed], [hypothesis])
- Structure/content/scale hierarchy is the capstone finding: geometric structure is universal, navigational landmarks are shared among large models, scale differentiates

## Phase 11 Summary (Condensed)
- **2,040 new runs + ~340 reused** across 4 new models (11A), 6 screening models (11B), 3 robustness models (11C).
- **Part A — Expanded Generality (720 runs, 4 models):** R1 replicated (gait 0.502-0.747; Mistral record 0.747). R2 replicated (all > 0.60). Bridge freq CI includes zero (0.717 vs 0.817, diff -0.100). Llama scale confirmed (Maverick 0.724 vs 8B 0.200). Control continues to fail. 5/7 predictions confirmed.
- **Part B — Control Revision (240 runs):** All 4 candidates fail (0/24 cells pass). Stapler-monsoon fails R5 for all 12 models. R5 single-pair design inadequate. 1/4 predictions confirmed.
- **Part C — Multiverse Robustness (1,080 runs, 3 models):** ANOVA model identity drives structure (η²=0.242, p≈0.001). Bridge frequency most robust (>0.97 all conditions). Gait rank largely stable (W=0.840, though GPT/DeepSeek swap). Asymmetry waypoint-sensitive. 2/7 predictions confirmed.
- **Combined prediction accuracy: 8/18 (44%).** Observations: O28-O32. Graveyard: G28-G29.

## Blockers
None

## Next Steps
- **Paper writing** — 11 phases support six-act narrative (structure → topology → mechanism → limits → generality → robustness)
