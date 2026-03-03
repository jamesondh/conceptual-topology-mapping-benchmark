# Phase 1: Waypoint Elicitation Engine + Pilot Data

## Goal
Build the core primitive — prompt a model with two concepts, get back ordered intermediate waypoints — and generate enough pilot data to validate the approach and surface initial patterns.

## Tasks

### 1. Waypoint elicitation engine
- Prompt design: test 2-3 prompt formats and compare output quality
  - Direct: "List N intermediate concepts that form a path from A to B"
  - Step-by-step: "What concept bridges A and B? Now what bridges A and that concept?" (iterative)
  - Semantic: "Imagine walking through conceptual space from A to B. What landmarks do you pass?"
- Support configurable waypoint count (3, 5, 7, 10)
- Multi-model via OpenRouter (same models as word-convergence: Claude, GPT, Grok, Gemini)
- JSON result output with full metadata (model, pair, waypoint count, temperature, prompt format, timestamp)
- CLI interface: `bun run index.ts --model X --from A --to B --waypoints N`

### 2. Concept pair curation
- **Anchor pairs** (from word-convergence, known basin structure):
  - Deep basin: Beyoncé↔erosion ("formation"), Tesla↔mycelium ("network")
  - Moderate basin: shadow↔melody ("echo"), skull↔garden
  - Flat terrain: Kanye West↔lattice
- **New pairs** designed to probe:
  - Hierarchy: animal↔poodle, vehicle↔skateboard (hypernym-hyponym)
  - Abstract bridging: justice↔erosion, time↔crystal
  - Concrete dense neighborhoods: cemetery↔graveyard, forest↔woods (synonym friction test)
  - Cross-domain: music↔mathematics, cooking↔architecture
- ~20-25 pairs total for pilot

### 3. Pilot experiments
- Run each pair across 4 models × 2 waypoint counts (5 and 10) × 5 repetitions = ~800-1000 runs
- Measure:
  - **Intra-model consistency**: how stable are waypoints across repeated runs? (Jaccard similarity, positional overlap)
  - **Waypoint count effect**: do 5-waypoint and 10-waypoint paths share the same structure at different resolutions?
  - **Cross-model comparison**: first look at whether models produce structurally different paths
  - **Prompt format comparison**: which format produces the cleanest, most consistent waypoints?
- Pick best prompt format from results, lock it in for phase 2

### 4. Pilot analysis & findings
- Analysis script computing consistency metrics
- Findings writeup with initial observations
- Decision: what's the most interesting signal to chase in phase 2?

## Files
- `index.ts` — waypoint elicitation engine
- `pairs.ts` — curated concept pair sets
- `experiments/01-pilot.ts` — batch runner for pilot
- `analysis/01-pilot.ts` — analysis script
- `findings/01-pilot.md` — findings writeup
- `results/` — JSON output (gitignored if large)

## Docs to update
- `AGENTS.md` if conventions change
- `STATE.md` with completion summary
- `ROADMAP.md` to advance phase status

## Verify
- Engine runs cleanly across all 4 models
- Results JSON is well-structured and parseable
- Consistency metrics are computable from output
- At least 500 successful runs in pilot dataset

## Done when
- Engine is stable and produces clean waypoint data
- Prompt format is selected based on pilot results
- Initial findings doc exists with observations on consistency, cross-model differences, and waypoint count effects
- Phase 2 direction is informed by data
