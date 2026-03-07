# Phase 12: Paper Section 4 — Act I: Structure

## Goal
Write Section 4 of the paper (`writeup/sections/04-structure.md`), establishing the basic structural findings from Phases 1, 2, and 3A. This is Act I of the paper's six-act narrative — the foundation that everything else builds on.

## Risk Level
Medium — text-heavy, draws on data from 3 phases and cross-references later phases (10A, 11A, 11C) for the gait generality story. No experiments or API calls.

## Files

### Create
- `writeup/sections/04-structure.md` — The full Section 4 draft

### Read (reference)
- `writeup/outline.md` — Section 4 spec (lines 194-251)
- `writeup/sections/02-benchmark.md` — For consistent style and cross-references
- `findings/01-pilot-analysis.md` — Phase 1 gait data, control validation, polysemy, cross-model
- `findings/02-reversals-analysis.md` — Asymmetry data (for narrative context only; Section 5 covers this)
- `findings/03-analysis.md` — Dual-anchor effect, transitivity (for 4.3), compositional structure
- `findings/03a-positional-convergence.md` — U-shape data tables
- `findings/04a-bridge-agreement.md` — Gemini isolation index
- `findings/11a-expanded-generality.md` — Full 12-model gait spectrum
- `findings/11c-robustness.md` — Gait robustness, Kendall's W
- `findings/CLAIMS.md` — R1, R3, O1, O2, O9, O10

### Update
- `.planning/STATE.md` — Update next steps

## Structure (per outline)

### 4.1 Conceptual Gaits Are Distinct and Stable
**Claims:** [robust] R1
- 12 models, 2.9x gait range (Mistral 0.747 to GPT 0.258)
- Core 4 stability across 5+ phases, 9,500+ runs
- Phase 10A: 4 new models in expected range (0.298-0.508)
- Phase 11A: 4 more models extend range (Mistral record)
- Control validation: nonsense Jaccard 0.062
- **[Figure 2: Gait Spectrum]** placeholder
- **[Figure 3: Gait Stability]** placeholder
- Key stat: Claude 0.578 vs GPT 0.258 = 2.2x gap

### 4.2 Paths Are Self-Consistent Within Models
**Claims:** [observed] O9, O10
- No temporal drift: cross-batch Jaccard within 0.05
- 5wp coarse-grains 10wp: 70.5% shared, 67.9% subsequence
- Establishes paths as stable model properties, not transient API artifacts

### 4.3 The Dual-Anchor Effect
**Claims:** [observed] O2
- U-shaped mirror-match convergence: positions 1 and 5 elevated, valley at 2-4
- Overall rates: 0.102, 0.057, 0.065, 0.085, 0.129
- Category signatures: antonym (late convergence), identity (middle domination), random (pure U), nonsense (flat zero)
- Refutes simple starting-point hypothesis; establishes dual-anchor model
- **[Figure 4: Dual-Anchor U-Shape]** placeholder

### 4.4 Three Models Agree, Gemini Diverges
**Claims:** [observed] O1
- Claude-GPT r=0.772, Claude-Grok r=0.768, Grok-Gemini r=0.340
- Gemini isolation index 0.136
- Binary agreement: Claude/GPT/Grok 100%, Gemini pairs 50%
- Forward reference to Section 7.5 (Gemini mystery thread)

### 4.5 Polysemy Sense Differentiation
**Claims:** [robust] R3
- Cross-pair Jaccard 0.011-0.062 (Phase 2 corrected values)
- Three groups: bank, bat, crane
- Target concept determines sense activation and path structure
- Establishes that navigational structure reflects semantic content

## Writing Approach

1. Academic paper style: third person, past tense for methods/observations, present tense for general truths
2. Match Section 2's tone and formatting conventions
3. Use precise numbers from the findings files — no approximations
4. Include figure placeholders: `[FIGURE 2]`, `[FIGURE 3]`, `[FIGURE 4]`
5. Cross-reference Section 2 metrics naturally
6. Forward-reference later sections where the outline flags them (especially Section 5 for quasimetric, Section 7.5 for Gemini)
7. Target ~2,500-3,500 words (results sections are typically shorter than methodology)

## Verify
1. All gait numbers match findings files exactly
2. All asymmetry/convergence numbers match Phase 3A data
3. Cross-model correlation values match Phase 4A
4. Figure placeholders match outline specification
5. Run Codex CLI review on the drafted section

## Done When
- `writeup/sections/04-structure.md` exists with complete Section 4 draft
- Codex review completed and recommended fixes applied
- Committed and pushed
