# Section 1: Introduction

## Goal
Motivate the gap between static geometry and navigational geometry. Establish the benchmark asks a fundamentally different question from prior work. Promise exactly what the paper delivers.

## Outline Reference
Lines 22–57 of `writeup/outline.md`

## Structure

### 1.1 The Navigation Gap
- Static geometry is well-characterized (linear directions, polytopes, hyperbolic hierarchies, Karkada et al. 2025 inevitability proof)
- But geometry is not navigation. A map is not a route.
- The question: Do LLMs have consistent, measurable geometric structure in how they *navigate* between concepts?
- Karkada complement: they proved *why* geometry exists; we test *whether it supports behavioral navigation*

### 1.2 Why Navigation Matters
- Cognitive science: Gardenfors 2000, grid cells for conceptual navigation (Constantinescu 2016)
- PRH (Huh et al. 2024): representational alignment ≠ navigational alignment
- Reversal curse (Berglund 2023): reframed as signal revealing structure, not bug. Connection to Tversky 1977 is thematic, not mechanistic.
- Multi-hop reasoning failures: compositionality gap, two-hop curse. Our benchmark generalizes: measures *shape* and *consistency*, not binary pass/fail.

### 1.3 Contributions
6 bulleted contributions:
1. Novel evaluation paradigm (waypoint elicitation)
2. Six robust empirical claims + one qualified (R5), with caveat that R3, R4, R7 untested beyond original 4-model cohort
3. Mechanism ceiling result (7 falsified, 1 resurrected)
4. Cross-architecture generality (12 models, 11 families)
5. Protocol robustness
6. 29 documented dead ends

### 1.4 Paper Structure
One-sentence summary of each section following six-act narrative.

Table 0: Headline Claims at a Glance
Figure 0: "Same Map, Different Routes" — 2-3 canonical pairs, 12 models, same endpoints, divergent paths
Figure 1: Overview schematic (elicitation, paths, metrics)

## Key Numbers
- ~21,540 runs, 12 models, 11 families, 11 phases
- Gait range 0.258-0.747 (2.9x)
- Asymmetry 0.811 (quasimetric)
- 7 robust claims (6 + 1 qualified)
- 7 falsified hypotheses + 1 resurrected
- 29 dead ends

## Files
- `writeup/sections/01-introduction.md` (new)

## Docs to Update
- `.planning/STATE.md`

## Verify
- Promises match what paper delivers
- Navigation gap framing is clear and not overstated
- Contributions list is accurate
- Table 0 and Figure 0/1 placeholders present
- Reversal curse connection stated as thematic, not mechanistic

## Done When
- Section 1 drafted, Codex-reviewed, fixes applied
