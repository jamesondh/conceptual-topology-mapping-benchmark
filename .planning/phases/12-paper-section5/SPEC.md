# Phase 12: Paper Section 5 — Act II: Topology

## Goal
Write Section 5 of the paper (`writeup/sections/05-topology.md`), presenting the metric-axiom results that characterize the topology of navigational space. This is Act II — moving from "models have structure" (Section 4) to "that structure has quasimetric geometry."

## Risk Level
Medium-high — 7 subsections spanning Phases 2, 3B, 4, 5, and 6, with important methodological caveats flagged in the outline.

## Files

### Create
- `writeup/sections/05-topology.md` — The full Section 5 draft

### Read (reference)
- `writeup/outline.md` — Section 5 spec (lines 253-333)
- `writeup/sections/02-benchmark.md` — For consistent style
- `writeup/sections/04-structure.md` — For forward-reference consistency
- `findings/02-reversals-analysis.md` — Asymmetry data (R2)
- `findings/03-analysis.md` — Triangle inequality, transitivity (R4)
- `findings/03b-transitivity.md` — Transitivity tables
- `findings/04b-targeted-bridges.md` — Triangle inequality replication (93.8%)
- `findings/05-analysis.md` — Cue-strength, polysemy, fire, bridge types
- `findings/05a-cue-strength.md` — Gradient data tables
- `findings/06a-salience.md` — Non-uniform distributions (O11)
- `findings/06c-positional.md` — Bridge positioning (O12, O13)
- `findings/07b-curvature.md` — Triangle inequality 3rd replication (90.6%)
- `findings/11a-expanded-generality.md` — Asymmetry replication
- `findings/11c-robustness.md` — Asymmetry resolution-dependence
- `findings/CLAIMS.md` — R2, R4, R6, R7, O4, O5, O6, O11, O12, O13

### Update
- `.planning/STATE.md` — Update next steps

## Structure (per outline)

### 5.1 Asymmetry Is Fundamental (R2)
- Mean 0.811 across 84 pair/model combos (Phase 2, 5wp, includes controls)
- Contextualize: controls inflate mean; Phase 11A models 0.673-0.729; Phase 11C resolution-dependent
- 87% significant permutation tests — need multiple comparison caveat
- [FIGURE 5: Asymmetry Distribution]
- Tversky/reversal-curse connection

### 5.2 Triangle Inequality Holds as Structural Constant (R2 component)
- Phase 3B: 91% (29/32), Phase 4B: 93.8% (30/32), Phase 7B: 90.6% (29/32)
- **Critical caveat:** different distance operationalizations for asymmetry vs triangle inequality
- Present as "consistent with" quasimetric, not formally established
- [TABLE 4: Triangle Inequality Replication]

### 5.3 Hierarchical Paths Are Compositional (R4)
- 4.9x transitivity (0.175 vs 0.036, non-overlapping CIs)
- Bridge frequency: dog 15-100%, stapler 0%, flamingo 0%
- [FIGURE 6: Compositional Structure]

### 5.4 Bridge Concepts Are Bottlenecks, Not Associations (R6)
- Spectrum 1.00, metaphor 0.00
- Germination > plant (O4), fire too-central (O6)
- Bank forced crossing (O5)
- [FIGURE 7: Bridge Taxonomy]

### 5.5 Cue-Strength Gradient (R7)
- 12/16 monotonic, all failures in one family
- Three perfect families

### 5.6 Waypoint Distributions Are Non-Uniform (O11)
- 7/8 pairs reject uniformity (Bonferroni-corrected chi-squared)
- Claude entropy 2.59 vs GPT 3.44
- Note: ksTestUniform naming vs actual chi-squared implementation

### 5.7 Bridge Positioning: Early Anchoring, Not Midpoint (O12, O13)
- Modal position 1-2 (0-indexed) for 8/10 pairs
- Peak-detection contrast 0.345 (CI [0.224, 0.459])
- Taxonomic exception (dog at position 4-5)
- Forced-crossing instability (SD 1.71 vs 0.52)
- [FIGURE 8: Bridge Position Profiles]

## Writing Approach
1. Academic style matching Sections 2 and 4
2. Precise numbers from findings files
3. Include figure/table placeholders: [FIGURE 5-8], [TABLE 4]
4. Key caveat: quasimetric claim is "consistent with" not "formally established"
5. Multiple comparison caveat for 87% significance claim
6. Note ksTestUniform naming issue
7. Target ~3,500-4,500 words

## Verify
1. Asymmetry numbers match Phase 2 findings
2. Triangle inequality rates match all three phases
3. Transitivity numbers match Phase 3B
4. Bridge frequencies match Phase 5 findings
5. Positional data matches Phase 6C
6. Run Codex CLI review

## Done When
- `writeup/sections/05-topology.md` exists with complete Section 5 draft
- Codex review completed and fixes applied
- Committed and pushed
