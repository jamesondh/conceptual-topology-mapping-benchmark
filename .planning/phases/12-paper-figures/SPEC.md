# Phase 12: Paper Figures, Tables, and Visualizations

## Goal
Generate all 15 figures and 8 tables specified in the paper outline (`writeup/outline.md`, lines 672-698). Publication-quality visuals suitable for an ML venue (NeurIPS/TMLR style). Most data exists in `results/analysis/` JSON files — no new experiments or API calls needed. A small number of figures require data preprocessing (see Data Provenance Gaps below).

## Risk Level
Medium — touches many data sources across all 11 experimental phases. No code changes to core engine, but creates a new visualization pipeline. Risk is primarily aesthetic/accuracy: every number must match the paper text exactly.

## Technology Choice

**Python + matplotlib/seaborn.** Rationale:
- Publication-quality output with fine-grained control (font sizes, label placement, color palettes)
- Seaborn for statistical plots (violin, heatmap, boxplot)
- LaTeX-compatible PDF/SVG export
- The analysis JSON files are trivially loadable from Python (`json.load`)
- Existing TypeScript analysis scripts are *data computation*; figure generation is a separate concern best handled by the standard academic visualization stack

Alternative considered: TypeScript + D3/Observable — rejected because academic PDF output is weaker and the ecosystem is less mature for static publication figures.

## Output Structure

```
writeup/
  figures/
    fig00-same-map-different-routes.pdf   # Also .png for draft review
    fig01-benchmark-overview.pdf
    fig02-gait-spectrum.pdf
    fig03-gait-stability.pdf
    fig04-dual-anchor-ushape.pdf
    fig05-asymmetry-distribution.pdf
    fig06-compositional-structure.pdf
    fig07-bridge-taxonomy.pdf
    fig08-bridge-positions.pdf
    fig09-prefill-displacement.pdf
    fig10-relation-class-survival.pdf
    fig11-prediction-accuracy.pdf
    fig12-twelve-model-gait-asymmetry.pdf
    fig13-scale-effect.pdf
    fig14-robustness-heatmap.pdf
  tables/
    table00-headline-claims.tex           # LaTeX tabular for inclusion
    table01-metric-definitions.tex
    table02-model-summary.tex
    table03-phase-summary.tex
    table04-triangle-inequality.tex
    table05-hypothesis-outcomes.tex
    table06-anova-results.tex
    table07-control-pair-screening.tex
  scripts/
    generate_figures.py                   # Master script: generates all figures
    generate_tables.py                    # Master script: generates all tables
    config.py                             # Shared: color palettes, model metadata, style constants
    data_loader.py                        # Shared: load analysis JSON, extract metrics
```

## Files

### Create
- `writeup/figures/` — All 15 figure files (PDF + PNG)
- `writeup/tables/` — All 8 table files (LaTeX .tex)
- `writeup/data/paper_manifest.json` — Preprocessed data manifest for all figures/tables
- `writeup/scripts/build_manifest.py` — Preprocessing: extracts/merges data from analysis JSONs into unified manifest
- `writeup/scripts/generate_figures.py` — Master figure generation script (reads from manifest)
- `writeup/scripts/generate_tables.py` — Master table generation script (reads from manifest)
- `writeup/scripts/config.py` — Shared configuration (model registry, colors, style)
- `writeup/scripts/data_loader.py` — Data loading utilities (wraps manifest access)

### Read (reference)
- `writeup/outline.md` — Lines 672-698: Figure/Table index with specifications
- `writeup/sections/*.md` — Figure placeholder descriptions (exact specs for each visual)
- `results/analysis/*.json` — Pre-computed analysis metrics (26 files)
- `findings/CLAIMS.md` — Claim registry for Table 0
- `.planning/GRAVEYARD.md` — G20-G27 for Table 5
- `src/data/pairs.ts` — Model IDs and metadata (MODELS, NEW_MODELS, PHASE11_MODELS)

### Update
- `writeup/sections/*.md` — Replace `[FIGURE N]` / `[TABLE N]` placeholders with `\ref{fig:N}` or actual inclusion commands once generated
- `package.json` — Add `figures` and `tables` script entries
- `.planning/STATE.md` — Update progress
- `.planning/ROADMAP.md` — Mark figure/table generation as in-progress/complete

## Figure Specifications

### Fig 0: "Same Map, Different Routes" (Section 1)
- **Type:** Multi-track path visualization
- **Data:** 2-3 canonical pairs (music-mathematics, love-death recommended), all 12 models, 7 waypoints
- **Layout:** Each pair gets a panel. Within each panel, 12 horizontal rows (one per model), waypoints as labeled nodes connected by lines. Same start/end columns; divergent intermediate columns.
- **Source:** Raw elicitation results from `results/` (need most-representative single run per model per pair, or mode waypoints across 20 runs)
- **Key challenge:** Choosing representative runs. Use medoid selection (actual run with highest average pairwise Jaccard to other runs) rather than modal waypoints per position, since modal reconstruction can synthesize a path that never occurred in any actual run.
- **Color:** Each model gets a consistent color throughout all figures.

### Fig 1: Benchmark Overview Schematic (Section 1)
- **Type:** Conceptual diagram (not data-driven)
- **Layout:** Three-panel: (Left) Elicitation prompt example, (Center) 4-model paths for music-mathematics, (Right) Derived metrics with formulas
- **Note:** This is partially a design task — may benefit from a dedicated drawing tool (Figma, TikZ) rather than pure matplotlib. Draft in matplotlib; finalize in TikZ for LaTeX.

### Fig 2: Gait Spectrum (Section 4.1)
- **Type:** Horizontal bar chart
- **Data:** Mean Jaccard consistency per model across all experimental pairs. 12 models sorted by gait.
- **Source:** `results/analysis/pilot-metrics.json` (core 4), `results/analysis/10a-model-generality.json` (Phase 10 models), `results/analysis/11a-expanded-generality.json` (Phase 11 models)
- **Annotations:** Mistral (highest, 0.747), GPT (lowest, 0.258), error bars (cross-pair SD)
- **Color:** By provider family

### Fig 3: Gait Stability (Section 4.1)
- **Type:** Line plot
- **Data:** Mean Jaccard per phase for core 4 models (Claude, GPT, Grok, Gemini), Phases 1-9
- **Source:** Requires preprocessing — see Data Provenance Gaps. Per-phase gait values must be extracted from individual phase analysis JSONs or re-computed from raw results.
- **Layout:** 4 lines (one per model), x-axis = phase number, y-axis = mean Jaccard

### Fig 4: Dual-Anchor U-Shape (Section 4.3)
- **Type:** Line plot, faceted by category
- **Data:** Mirror-match rate by position (1-5 for 5-waypoint paths), broken by category (antonym, identity, random, nonsense)
- **Source:** `results/analysis/positional-convergence.json`
- **Layout:** 4 lines or 4 small panels, one per category. Overall U-shape visible.

### Fig 5: Asymmetry Distribution (Section 5.1)
- **Type:** Histogram
- **Data:** Directional asymmetry (1 - Jaccard(fwd, rev)) for 84 pair/model combinations (Phase 2, 4 models, 5 waypoints)
- **Source:** `results/analysis/reversal-metrics.json`
- **Annotations:** Vertical line at mean (0.811), annotation for Phase 11C resolution findings

### Fig 6: Compositional Structure (Section 5.3)
- **Type:** Two-panel bar chart
- **Data:** (Left) Transitivity for hierarchical vs random triples. (Right) Bridge frequency for taxonomic vs control bridges.
- **Source:** `results/analysis/transitivity-metrics.json`
- **Annotations:** 4.9x gap label, non-overlapping CIs

### Fig 7: Bridge Taxonomy (Section 5.4)
- **Type:** 2x2 grid of bar charts
- **Data:** Bridge frequency by model for 4 bridge types: bottleneck (spectrum, deposit, sentence), off-axis (metaphor, energy), process vs object (germination vs plant), too-central (fire, water)
- **Source:** `results/analysis/targeted-bridges-metrics.json`, `results/analysis/cue-strength-metrics.json`, `results/analysis/too-central-metrics.json` (Phase 7C)
- **Note:** Outline index says source phases 3-5, but too-central data comes from Phase 7C. Update outline index to say "3-5, 7" for consistency.

### Fig 8: Bridge Position Profiles (Section 5.7)
- **Type:** Heatmap or small multiples
- **Data:** Bridge position distributions for 10 pairs x 4 models
- **Source:** `results/analysis/positional-metrics.json`
- **Color:** Position frequency as heatmap intensity. Early positions highlighted.

### Fig 9: Pre-Fill Displacement (Section 6.1)
- **Type:** Paired/grouped bar chart
- **Data:** Unconstrained vs pre-filled bridge frequency for 8 pairs, grouped by bridge type (heading, taxonomic, forced-crossing)
- **Source:** `results/analysis/anchoring-metrics.json`
- **Error bars:** Cross-model variance

### Fig 10: Relation Class Survival (Section 6.3)
- **Type:** Boxplot or violin plot
- **Data:** Bridge survival by relation class (unrelated, on-axis, same-domain) with Friedman p-value
- **Source:** `results/analysis/10b-relation-classes.json`
- **Annotations:** Friedman p = 0.034, post-hoc correction note

### Fig 11: Prediction Accuracy Descent (Section 7.1)
- **Type:** Line plot with annotation
- **Data:** Prediction accuracy per phase (Phases 4-11): 81.3%, ~50%, ~50%, 42.9%, ~50%, 24%, 20%, 50%, 44%
- **Source:** Requires preprocessing — see Data Provenance Gaps. Prediction counts extracted from each phase's findings file and hardcoded into the manifest.
- **Annotations:** Horizontal reference lines at ~80% (replication), ~50% (structural), ~15% (mechanistic). Annotated descent.

### Fig 12: 12-Model Gait and Asymmetry (Section 8.1)
- **Type:** Two-panel bar chart
- **Data:** (Left) Gait per model, 12 bars sorted. (Right) Asymmetry per model, 12 bars. Horizontal line at 0.60 threshold.
- **Source:** Gait from `pilot-metrics.json` (core 4), `10a-model-generality.json`, `11a-expanded-generality.json`. Asymmetry from `reversal-metrics.json` (core 4), `10a-model-generality.json` (perModelAsymmetry), `11a-expanded-generality.json` (perModelAsymmetry).
- **Overlap with Fig 2:** Fig 2 is gait-only with annotations; Fig 12 is paired gait + asymmetry for the generality argument. Consider whether Fig 2 and Fig 12 can be merged (reviewer efficiency). Flag for Jameson's decision.

### Fig 13: Scale Effect (Section 8.2)
- **Type:** Scatterplot
- **Data:** Bridge frequency (y) vs approximate model scale (x, log axis). Need scale metadata for 12 models.
- **Source:** Bridge frequency from `10a-model-generality.json` and `11a-expanded-generality.json` (new cohorts only). Original 4-model bridge frequencies need extraction from `transitivity-metrics.json` or `targeted-bridges-metrics.json`. Scale metadata hardcoded in `config.py`.
- **Annotations:** Llama 8B outlier labeled. Frontier cluster labeled.
- **Note:** Exact parameter counts are approximate for most models. Use reported/estimated counts with appropriate caveats.

### Fig 14: Robustness Heatmap (Section 9.2)
- **Type:** Heatmap (5 conditions x 3 metrics)
- **Data:** Gait, asymmetry, bridge frequency for each of 5 protocol conditions (7wp/t0.7, 5wp/t0.5, 5wp/t0.9, 9wp/t0.5, 9wp/t0.9)
- **Source:** `results/analysis/11c-robustness.json`
- **Color:** Metric value intensity. Bridge frequency row uniformly high.

## Table Specifications

### Table 0: Headline Claims at a Glance (Section 1)
- **Columns:** Claim ID, Claim, Evidence Tier, Models/Phases, Core Statistic, Key Qualification
- **Rows:** R1-R7, O15, O25, O30 (10 rows)
- **Source:** `findings/CLAIMS.md`
- **Evidence tier convention:** Use `[robust]`, `[observed]`, `[hypothesis]` as defined in CLAIMS.md. R5 is `[robust, qualified]` — "qualified" is a modifier on the robust tier, not a separate tier. Encode this consistently.

### Table 1: Metric Definitions (Section 2.2)
- **Columns:** Metric, Formal Definition, Range, Interpretation
- **Rows:** 7 metrics (gait, asymmetry, bridge frequency, transitivity, positional profile, triangle inequality, pre-fill displacement)
- **Source:** `writeup/sections/02-benchmark.md`, `writeup/outline.md`

### Table 2: Model Summary (Section 2.4)
- **Columns:** Model, Provider, Approx Scale, Total Runs, Phases Included
- **Rows:** 12 models
- **Source:** `src/data/pairs.ts` (model IDs), phase findings (run counts)

### Table 3: Phase Summary (Section 2.5)
- **Columns:** Phase, Name, New Runs, Key Question, Primary Finding
- **Rows:** 11 phases
- **Source:** `.planning/STATE.md`, `.planning/ROADMAP.md`

### Table 4: Triangle Inequality Replication (Section 5.2)
- **Columns:** Phase, N Triangles, % Holding, Mean Excess, 95% CI
- **Rows:** 3 (Phase 3B, 4B, 7B)
- **Source:** `results/analysis/transitivity-metrics.json`, `results/analysis/targeted-bridges-metrics.json`, `results/analysis/curvature-metrics.json`

### Table 5: Hypothesis Outcomes (Section 7.2)
- **Columns:** #, Hypothesis, Phase, Predicted Effect Size, Observed Effect Size, CI, Graveyard Entry, Type
- **Rows:** 8 (G20-G27). Clearly mark G26 as "resurrected" (not falsified). The accurate count is 7 falsified + 1 resurrected.
- **Source:** `.planning/GRAVEYARD.md`, `writeup/outline.md` lines 407-416, individual phase findings for exact effect sizes and CIs

### Table 6: ANOVA Results (Section 9.1)
- **Columns:** Factor, Eta-squared, Approx p-value
- **Rows:** 4 (model identity, waypoint count, temperature, interaction)
- **Source:** `results/analysis/11c-robustness.json`

### Table 7: Control Pair Screening (Section 9.5)
- **Columns:** Control Pair, then per-model sub-columns (Top Waypoint, Top Frequency, Entropy), or transposed
- **Rows:** Stapler-monsoon retrospective (12 models) + 4 new candidates (6 screening models each)
- **Source:** `results/analysis/11b-control-revision.json` — two sub-datasets: `screeningResults` (6 screening models x 4 candidates = 24 rows) and `staplerMonsoonRetrospective` (all 12 models). The screening data only covers 6 models (claude, gpt, grok, gemini, deepseek, mistral), not all 12.
- **Note:** Present as two sub-tables or panels: (a) stapler-monsoon across all 12 models (from retrospective), (b) new candidates across 6 screening models. This honestly represents the data coverage.

## Data Provenance Gaps

Not all figure/table data is available directly from `results/analysis/` JSON files. The following items require preprocessing or manual extraction before plotting. A `writeup/scripts/build_manifest.py` preprocessing step should generate a unified `writeup/data/paper_manifest.json` containing all figure/table data in a single, reproducible location.

| Item | Gap | Resolution |
|------|-----|------------|
| **Fig 3 (Gait Stability)** | Per-phase gait values for core 4 models across Phases 1-9 not available in a single JSON. | Extract from each phase's analysis JSON (`pilot-metrics.json`, `reversal-metrics.json`, etc.) or re-compute from raw results. Add to manifest. |
| **Fig 11 (Prediction Accuracy)** | Prediction accuracy ratios (confirmed/total) per phase are narrative, not in analysis JSONs. | Hardcode from findings files into manifest: Phase 4: 13/16, Phase 5: 6/14, Phase 6: 7/14, Phase 7: 6/14, Phase 8: 6/25, Phase 9: 5/25, Phase 10: 9/18, Phase 11: 8/18. |
| **Fig 12 (Asymmetry panel)** | `pilot-metrics.json` lacks asymmetry. Original 4-model asymmetry in `reversal-metrics.json`; new-cohort asymmetry in `10a`/`11a` JSONs. | Merge from multiple sources in manifest. |
| **Fig 13 (Bridge frequency for original 4)** | `10a` and `11a` JSONs only cover new cohorts. Original-4 bridge frequencies in `transitivity-metrics.json` or `targeted-bridges-metrics.json`. | Extract and merge in manifest. |
| **Table 2 (Total runs per model)** | Run counts per model not aggregated anywhere. | Sum from individual phase analysis JSONs or hardcode from STATE.md summaries. |
| **Table 7 (12-model scope)** | `11b-control-revision.json` screening covers only 6 models. Retrospective covers all 12 for stapler-monsoon only. | Present as two panels (see Table 7 spec). |
| **Scale metadata (Fig 13)** | Approximate parameter counts for 12 models not in any data file. | Hardcode in `config.py` MODEL_REGISTRY with appropriate caveats about approximation. |

## Style Constants (`config.py`)

```python
# Canonical model registry — IDs must match src/data/pairs.ts and analysis JSONs exactly.
# These are the authoritative IDs used throughout results/analysis/*.json.
MODEL_REGISTRY = {
    # id: (display_name, provider, cohort, approx_scale, color)
    "claude":   ("Claude Sonnet 4.6",   "Anthropic",  "original", "frontier", "#7C3AED"),  # Purple
    "gpt":      ("GPT-5.2",             "OpenAI",     "original", "frontier", "#10B981"),  # Green
    "grok":     ("Grok 4.1 Fast",       "xAI",        "original", "frontier", "#3B82F6"),  # Blue
    "gemini":   ("Gemini 3 Flash",      "Google",     "original", "frontier", "#F59E0B"),  # Amber
    "minimax":  ("MiniMax M2.5",        "MiniMax",    "phase10",  "frontier", "#EC4899"),  # Pink
    "kimi":     ("Kimi K2.5",           "Moonshot",   "phase10",  "frontier", "#14B8A6"),  # Teal
    "qwen":     ("Qwen 3.5 397B-A17B",  "Alibaba",    "phase10",  "frontier", "#EF4444"),  # Red
    "llama":    ("Llama 3.1 8B",        "Meta",       "phase10",  "8B",       "#6B7280"),  # Gray
    "deepseek": ("DeepSeek V3.2",       "DeepSeek",   "phase11",  "frontier", "#8B5CF6"),  # Violet
    "mistral":  ("Mistral Large 3",     "Mistral",    "phase11",  "frontier", "#F97316"),  # Orange
    "cohere":   ("Cohere Command A",    "Cohere",     "phase11",  "frontier", "#06B6D4"),  # Cyan
    "llama4":   ("Llama 4 Maverick",    "Meta",       "phase11",  "frontier", "#6366F1"),  # Indigo
}
# Note: GLM 5 (glm) was rate-limited and excluded from analysis. 12 models total, 11 training pipelines.

# Derived convenience dicts
MODEL_COLORS = {k: v[4] for k, v in MODEL_REGISTRY.items()}
MODEL_NAMES = {k: v[0] for k, v in MODEL_REGISTRY.items()}

# Typography
FONT_FAMILY = "serif"       # Or "CMU Serif" for LaTeX compatibility
FONT_SIZE_TITLE = 12
FONT_SIZE_LABEL = 10
FONT_SIZE_TICK = 8
FONT_SIZE_ANNOTATION = 8

# Figure sizing (inches, for single-column and double-column)
FIG_WIDTH_SINGLE = 3.25     # Single-column (NeurIPS)
FIG_WIDTH_DOUBLE = 6.75     # Double-column (NeurIPS)
FIG_DPI = 300               # For PNG export
```

## Implementation Order

1. **`config.py` + `build_manifest.py` + `data_loader.py`** — Shared infrastructure first. Build the paper manifest from 26 analysis JSONs + manual data. Provides accessor functions by figure ID.
2. **Fig 2 (Gait Spectrum)** — Simplest data-driven figure. Validates the pipeline end-to-end.
3. **Fig 5 (Asymmetry Distribution)** — Simple histogram. Tests a different data source.
4. **Fig 14 (Robustness Heatmap)** — Tests seaborn heatmap. Single data source.
5. **Tables 0-7** — Tables are largely manual/semi-manual. LaTeX tabular output.
6. **Fig 3, 4, 6** — Line plots and bar charts from earlier phases.
7. **Fig 7, 8** — Multi-panel and heatmap figures. More complex layout.
8. **Fig 9, 10** — Mechanism figures (paired bars, violin).
9. **Fig 11, 12, 13** — Cross-phase and generality figures.
10. **Fig 0** — Most complex: multi-model path visualization. Save for last since it needs design iteration.
11. **Fig 1** — Schematic. May need TikZ or manual design rather than matplotlib.

## Open Questions for Jameson

1. **Fig 2 vs Fig 12 overlap:** Both show gait bars for 12 models. Merge into one figure with two panels (gait + asymmetry), placed in Section 4.1 with forward reference? Or keep separate for narrative clarity?
2. **Fig 1 approach:** Pure matplotlib, TikZ, or Figma export? Schematics are hard to automate well.
3. **Color palette:** The proposed palette above uses brand-adjacent colors. Prefer a different scheme (e.g., colorblind-safe categorical from ColorBrewer)?
4. **Export format:** PDF primary (for LaTeX), PNG secondary (for draft review). SVG as well?
5. **Table format:** LaTeX `tabular` directly, or `booktabs` style? Any venue-specific template?

## Verify

1. Every number in every figure/table matches the corresponding findings file and paper section text
2. All 15 figures render at publication quality (300 DPI, readable text at printed size)
3. All 8 tables compile in LaTeX without errors
4. Model colors are consistent across all figures
5. Error bars / CIs are included where specified in the outline
6. Run `bun run typecheck` to ensure no regressions to existing code
7. Cross-check Fig 0 modal waypoints against raw results

## Docs to Update

- `writeup/sections/*.md` — Replace `[FIGURE N]` / `[TABLE N]` placeholders with actual file references
- `package.json` — Add `"manifest": "python writeup/scripts/build_manifest.py"`, `"figures": "python writeup/scripts/generate_figures.py"`, and `"tables": "python writeup/scripts/generate_tables.py"` scripts
- `.planning/STATE.md` — Update current phase progress
- `.planning/ROADMAP.md` — Mark figure/table generation status
- `CLAUDE.md` — Add figure/table generation CLI commands

## Done When

- All 15 figures exist as PDF + PNG in `writeup/figures/`
- All 8 tables exist as .tex in `writeup/tables/`
- Generation scripts are reproducible (`python writeup/scripts/generate_figures.py` regenerates all)
- Numbers spot-checked against findings files (at minimum: Fig 2 gait values, Fig 5 mean asymmetry, Fig 14 bridge frequency values, Table 4 triangle percentages)
- Committed and pushed
