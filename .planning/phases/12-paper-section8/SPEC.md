# Section 8: Act V — Generality: Structure Scales Across Architectures

## Scope

Paper Section 8 covering model generality (Phases 10A, 11A). 3 subsections.

## Structure

1. **8.1 Replication Across 12 Models** — R1 (gait 0.258-0.747), R2 (asymmetry all > 0.60). Universal across 11 families.
2. **8.2 The Structure/Content/Scale Hierarchy** — O25. Structure universal, content generalizes for large models (bridge freq CI includes zero), scale differentiates (Llama 8B 0.200 vs Maverick 0.724). Connections to Karkada et al. and PRH.
3. **8.3 Gait Profiles of New Models** — O28. Mistral record 0.747. DeepSeek 0.540, Cohere 0.502, Maverick 0.539. 2.9x range.

## Key Numbers

- Gait range: 0.258 (GPT) to 0.747 (Mistral)
- Asymmetry: all 12 > 0.60
- Bridge freq: new 0.717 vs original 0.817, diff -0.100, CI includes zero
- Llama 8B bridge freq: 0.200
- Llama 4 Maverick bridge freq: 0.724 (11a) / 0.539 gait
- Mistral: 0.747 gait, 0.936 on music-mathematics

## Writing Approach

- ~1,500-2,000 words — relatively short, focused section
- The key claim is structure/content/scale hierarchy
- Connection to theoretical predictions (Karkada, PRH) is important
- Note infrastructure lesson (patient mode)

## Files

- Write: `writeup/sections/08-generality.md`
- Reference: findings/10a-model-generality.md, 11a-expanded-generality.md, 10-analysis.md, 11-analysis.md, CLAIMS.md

## Done When

- Draft written, Codex-reviewed, fixes applied, committed and pushed
