# Conceptual Topology Mapping Benchmark

## What This Is

A novel LLM benchmark that tests whether models have consistent, measurable geometric structure in how they navigate between concepts. Give models two concepts, ask for intermediate waypoints, test path consistency (A→B vs B→A), triangle inequality, transitivity, and cross-model geodesics.

**Key insight:** Existing work studies *static* embedding geometry. To our knowledge, no benchmark systematically evaluates whether models can *navigate* these spaces and whether that navigation is consistent with the geometry.

**Builds on:** [Word convergence game](https://github.com/jamesondh/word-convergence-game) — 575 games across 4 models showing each model navigates conceptual space with a characteristic "gait," concept pairs have measurable basin structure, and cross-model games produce novel convergence points.

## Research

`research.md` — comprehensive literature survey covering embedding geometry, conceptual navigation, compositionality/multi-hop reasoning, consistency/directionality, trajectory dynamics, cognitive science parallels, cross-model comparison, and closest existing benchmarks.

## Stack

- **Runtime:** Bun (TypeScript)
- **LLM API:** OpenRouter (multi-model access)
- **Analysis:** TypeScript for data processing; Python if we need heavier stats/embeddings later
- **Data:** JSON result files (same pattern as word-convergence-game)

## Conventions

- Core engine and library code in `src/` — `index.ts` (CLI + elicitation), `types.ts`, `canonicalize.ts`, `metrics.ts`, `scheduler.ts`
- Concept definitions in `src/data/` — `pairs.ts`, `triples.ts` (Phase 3B), `triples-phase4.ts` (Phase 4), `triples-phase5.ts` (Phase 5)
- Experiment scripts in `experiments/` (batch runners per phase)
- Analysis scripts in `analysis/`
- Results in `results/` (JSON, gitignored)
- Findings in `findings/` (markdown writeups per phase)

## CLI Usage

```bash
# Single elicitation
bun run src/index.ts --model claude --from music --to mathematics --waypoints 5

# Multiple reps
bun run src/index.ts --model gpt --from "Beyoncé" --to erosion --reps 10

# Experiments (use --dry-run to preview)
bun run prompt-selection         # Prompt format selection on holdout pairs
bun run pilot                    # Main pilot experiment on reporting pairs
bun run analyze                  # Analyze pilot results and generate findings
bun run reversals                # Phase 2: reverse elicitation + polysemy supplementary
bun run analyze-reversals        # Analyze reversal results and generate findings
bun run bridge-agreement         # Phase 4A: cross-model bridge agreement analysis (0 API calls)
bun run targeted-bridges         # Phase 4B: targeted bridge topology experiment (~1520 API calls)
bun run analyze-targeted-bridges # Phase 4B: analyze targeted bridge results
bun run phase4                   # Run all Phase 4 in sequence (4A → 4B → analysis)
bun run cue-strength             # Phase 5A: cue-strength gradient experiment (~1680 API calls)
bun run analyze-cue-strength     # Phase 5A: analyze cue-strength results
bun run dimensionality           # Phase 5B: dimensionality probing experiment (~960 API calls)
bun run analyze-dimensionality   # Phase 5B: analyze dimensionality results
bun run convergence-5c           # Phase 5C: triple-anchor convergence experiment (~640 API calls)
bun run analyze-convergence      # Phase 5C: analyze convergence results
bun run phase5                   # Run all Phase 5 in sequence (5A → 5B → 5C)
```

## Models

Four models via OpenRouter: Claude Sonnet 4.6, GPT-5.2, Grok 4.1 Fast, Gemini 3 Flash. Same core models as word-convergence-game rounds 4-5. Model configs in `src/data/pairs.ts`. Requires `OPENROUTER_API_KEY` env var.

## Project Management

- For non-trivial work, start by reading `.planning/STATE.md` and `.planning/ROADMAP.md`.
- For simple tasks (1-2 files, low risk), implement directly without planning ceremony.
- For medium/high-risk work, write `.planning/phases/NN-{name}/SPEC.md` before coding.
- In each task spec, include `Files`, `Docs to update`, `Verify`, and `Done when`.
- After implementation, run verification. For medium/complex work, if no review was performed, ask: "Would you like me to review this with a subagent?"
- At phase wrap-up, update `STATE.md` with a brief completion summary (key changes, verification, issues, follow-ups), then update `ROADMAP.md`.
- Keep `STATE.md` under 150 lines and commit `.planning/` updates with code changes.
- If `STATE.md` exceeds 150 lines, suggest the user compact it.

## Workflow Style

This is an **exploration-first** project. Phases are designed to follow the most interesting signal in the data. The roadmap is a starting direction, not a fixed plan. Each phase's findings determine where we go next — same process as word-convergence-game's 5 rounds.
