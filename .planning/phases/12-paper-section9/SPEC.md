# Section 9: Act VI — Robustness

## Goal
Show that the benchmark's claims are not artifacts of specific protocol choices. Final "act" section before Discussion/Conclusion.

## Outline Reference
Lines 491–543 of `writeup/outline.md`

## Structure

### 9.1 Multiverse Robustness Analysis
- Phase 11C design: 3 models (Claude, GPT, DeepSeek) × 2×2 grid (5/9 waypoints × 0.5/0.9 temperature) + 7wp-t0.7 baseline
- ANOVA: model η²=0.242 p≈0.001; waypoint η²=0.008 p≈0.520; temp η²=0.002 p≈0.743; interaction≈0.000
- Statistical caveat: chi-squared approximation, no repeated-measures modeling, effect sizes more reliable than p-values
- Table 6: ANOVA factor results

### 9.2 Bridge Frequency Is the Most Robust Property
- Mean bridge freq > 0.97 all 5 conditions (range 0.978-0.993)
- Figure 14: robustness heatmap (conditions × metrics)

### 9.3 Gait Rankings Are Largely Stable
- Kendall's W = 0.840
- Claude always first; GPT/DeepSeek swap (baseline is the outlier due to sparse DeepSeek data)

### 9.4 Asymmetry Is Resolution-Dependent
- 5wp: 0.593-0.594 (below 0.60); 9wp: 0.669-0.684 (above); baseline 7wp: 0.599
- Measurement sensitivity, not protocol artifact
- Temperature negligible on asymmetry

### 9.5 The Control Pair Problem
- Phase 11B: 4 candidates tested, 0/24 cells pass either gate
- Retrospective: stapler-monsoon fails all 12 models (top freq 0.650-1.000)
- Reframing: validity rests on predictability gap, not presence/absence of structure
- LLMs as creative associators

## Key Numbers
- ANOVA η²: 0.242 (model), 0.008 (waypoint), 0.002 (temp)
- Bridge freq range: 0.978-0.993
- Kendall's W: 0.840
- Asymmetry 5wp: 0.594; 9wp: 0.669-0.684
- Control candidate failure: 0/24 cells pass
- Stapler-monsoon all 12 models: 0.650-1.000

## Claims Referenced
- O30 (ANOVA protocol independence)
- O31 (bridge freq most robust)
- O32 (asymmetry resolution-dependent)
- O29 (control candidates fail)
- R5 qualified
- G28, G29

## Files
- `writeup/sections/09-robustness.md` (new)

## Docs to Update
- `.planning/STATE.md`

## Verify
- All numbers match `11c-robustness.md`, `11b-control-revision.md`, `11-analysis.md`
- ANOVA caveat included
- Control reframing is balanced (acknowledge limitation, explain why validity survives)

## Done When
- Section 9 drafted, Codex-reviewed, fixes applied, committed and pushed
