# State

## Current Phase
Phase 1: Waypoint elicitation engine + pilot data — **engine complete, ready to run experiments**

## Context
- Research survey complete (`research.md`)
- Word convergence game (575 games, 4 models) provides empirical foundation
- Core thesis: no benchmark systematically evaluates whether LLMs can *navigate* conceptual space consistently

## Phase 1 Implementation Summary

### Engine (`index.ts`)
- OpenRouter API integration with retry logic (3 retries, exponential backoff)
- Provider route extraction, 60s request timeout, generation ID tracking
- Batch runner with configurable concurrency and progress callbacks
- CLI: `bun run index.ts --model X --from A --to B --waypoints N`

### Concept Pairs (`pairs.ts`)
- 36 pairs across 9 categories: anchor (5), hierarchy (4), cross-domain (4), polysemy (6), near-synonym (4), antonym (2), control-identity (2), control-random (7), control-nonsense (2)
- Holdout/reporting split: 15 holdout, 21 reporting
- All pairs have metadata: concreteness axes, relational type, polysemy level, basin info

### Canonicalization (`canonicalize.ts`)
- Multi-strategy waypoint extraction (JSON, numbered, bullet, comma, arrow, fallback)
- Pipeline: lowercase → strip articles → lemmatize (compromise) → normalize → dedupe
- Metrics: Jaccard, positional overlap, distributional entropy, semantic similarity (embeddings)

### Experiments
- `experiments/01-prompt-selection.ts` — 1,200 runs (15 holdout × 4 models × 2 formats × 10 reps)
- `experiments/01-pilot.ts` — 2,480 runs (21 reporting × 4 models × 2 waypoint counts × 10-20 reps), with resume support
- `analysis/01-pilot.ts` — full analysis pipeline with findings report generation

### Codex Review
- 13 findings addressed; critical fixes: format field mismatch, resume result loading, provider route, timeouts, concurrency validation, empty response handling

## Key Design Decisions
- **Exploration-first workflow** — phases follow the most interesting data signal
- **Reuse word-convergence anchor pairs** for cross-experiment comparability
- **Distributional evaluation** — 10-20 reps per pair, compare distributions not single paths
- **Controls from day one** — identity, random, nonsense baselines
- **Holdout split** — prompt format selected on holdout, findings on reporting set
- **OpenRouter for multi-model** — exact model IDs, provider routes, full decoding params

## Blockers
None

## Next Steps
- Set `OPENROUTER_API_KEY` in environment
- Run `bun run prompt-selection` to select prompt format on holdout pairs
- Run `bun run pilot` for main pilot experiment
- Run `bun run analyze` to compute metrics and generate findings
- ConceptNet external anchor comparison (deferred — spec acknowledges this)
