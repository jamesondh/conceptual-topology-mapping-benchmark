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
- Concept definitions in `src/data/` — `pairs.ts`, `triples.ts` (Phase 3B), `triples-phase4.ts` (Phase 4), `triples-phase5.ts` (Phase 5), `pairs-phase6.ts` (Phase 6), `pairs-phase7.ts` (Phase 7), `pairs-phase8.ts` (Phase 8), `pairs-phase9.ts` (Phase 9)
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
bun run salience                 # Phase 6A: navigational salience mapping (~1200 API calls)
bun run analyze-salience         # Phase 6A: analyze salience landscapes
bun run forced-crossing          # Phase 6B: forced-crossing asymmetry test (~640 API calls)
bun run analyze-forced-crossing  # Phase 6B: analyze forced-crossing results
bun run positional               # Phase 6C: positional bridge scanning (~480 API calls)
bun run analyze-positional       # Phase 6C: analyze positional bridge results
bun run phase6                   # Run all Phase 6 in sequence (6A → 6B → 6C)
bun run anchoring                # Phase 7A: early-anchoring causal test (~1260 API calls)
bun run analyze-anchoring        # Phase 7A: analyze anchoring results
bun run curvature                # Phase 7B: curvature estimation (~760 API calls)
bun run analyze-curvature        # Phase 7B: analyze curvature results
bun run too-central              # Phase 7C: too-central boundary (~480 API calls)
bun run analyze-too-central      # Phase 7C: analyze too-central results
bun run phase7                   # Run all Phase 7 in sequence (7A → 7B → 7C)
bun run fragility                # Phase 8A: bridge fragility experiment (~1010 API calls)
bun run analyze-fragility        # Phase 8A: analyze fragility results
bun run gradient                 # Phase 8B: Gemini gradient blindness experiment (~1280 API calls)
bun run analyze-gradient         # Phase 8B: analyze gradient results
bun run gait-norm                # Phase 8C: gait-normalized distance experiment (~640 API calls)
bun run analyze-gait-norm        # Phase 8C: analyze gait-normalized distance results
bun run phase8                   # Run all Phase 8 in sequence (8A → 8B → 8C)
bun run dominance                # Phase 9A: bridge dominance ratio experiment (~420 API calls)
bun run analyze-dominance        # Phase 9A: analyze dominance results
bun run transformation           # Phase 9B: transformation-chain blindness experiment (~1260 API calls)
bun run analyze-transformation   # Phase 9B: analyze transformation results
bun run facilitation             # Phase 9C: pre-fill facilitation experiment (~1040 API calls)
bun run analyze-facilitation     # Phase 9C: analyze facilitation results
bun run phase9                   # Run all Phase 9 in sequence (9A → 9B → 9C)
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

## Claim Tagging

All major claims use evidence tiers. When writing findings or analysis docs, tag claims inline:

- **[robust]** — Replicated across multiple phases/models, survived prediction testing. Paper-ready.
- **[observed]** — Directly measured with statistical support, but specific to conditions tested. May not generalize.
- **[hypothesis]** — Explanatory model consistent with data, not directly tested or limited evidence. Could be falsified.

The canonical registry of all claims is `findings/CLAIMS.md`. Update it when a new phase produces or upgrades a claim.

## Graveyard

`.planning/GRAVEYARD.md` tracks dead ends, failed hypotheses, and deprecated approaches. Before designing a new experiment or prediction, check the graveyard to avoid re-treading. Update it when a pre-registered prediction fails or an approach is abandoned.

## Workflow Style

This is an **exploration-first** project. Phases are designed to follow the most interesting signal in the data. The roadmap is a starting direction, not a fixed plan. Each phase's findings determine where we go next — same process as word-convergence-game's 5 rounds.
