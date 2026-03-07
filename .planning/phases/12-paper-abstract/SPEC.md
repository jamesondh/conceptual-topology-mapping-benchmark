# Abstract

## Goal
~250 words. Three beats: Gap, Contribution, Findings.

## Outline Reference
Lines 8-17 of `writeup/outline.md`

## Structure

### Beat 1 — Gap
Static geometric structure in LLM representations is well-characterized (linear representation hypothesis, hyperbolic embeddings, polytope structure). But no work tests whether models can *navigate* these spaces consistently — whether the geometry supports reliable behavioral traversal.

### Beat 2 — Contribution
We introduce the Conceptual Topology Mapping Benchmark, a waypoint-elicitation paradigm that probes navigational geometry across ~21,540 API runs, 12 models from 11 independent training pipelines, and 11 experimental phases. Models are given concept pairs (A, B) and asked for intermediate waypoints; the resulting paths are tested against metric axioms, compositional structure, and causal perturbation.

### Beat 3 — Findings
Models exhibit distinct "conceptual gaits" (consistency ranging 0.258-0.747 across 12 models), navigation is fundamentally asymmetric (mean 0.811, consistent with quasimetric structure), bridge concepts are structural bottlenecks (not mere associations), and these properties generalize across architectures while resisting protocol variation. Single-variable mechanistic explanations consistently fail (7 hypotheses falsified, 1 resurrected with additional data), revealing a mechanism ceiling: conceptual navigation has qualitative geometric structure that current tools can characterize but cannot yet explain.

## Key Caveat from Outline
- Do NOT lead with "7 robust claims" — immediately note R5 is qualified
- ~21,540 runs (exact total from per-phase headers)
- Note: 7 falsified + 1 resurrected, not "8 falsified"

## Files
- `writeup/sections/00-abstract.md` (new)

## Done When
- Abstract drafted, Codex-reviewed, fixes applied
