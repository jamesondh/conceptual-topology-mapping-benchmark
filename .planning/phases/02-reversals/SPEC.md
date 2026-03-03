# Phase 2: Reversals & Path Consistency

## Goal

Test whether conceptual navigation is symmetric. Run every Phase 1 reporting pair in reverse (B→A), compare against existing forward (A→B) data, and measure directional asymmetry per pair, per model. Also fix Phase 1 data quality issues identified during review and address the parallelism bottleneck (GitHub issue #1).

## Motivation

Phase 1 established that models navigate conceptual space with consistent, model-specific gaits. But all 2,480 runs were unidirectional (A→B). This leaves the most theoretically interesting question unanswered: **is the path from A to B the same as the path from B to A?**

The literature makes specific predictions:
- **Reversal curse** (Berglund et al.): Models trained on "A is B" often fail on "B is A." If this extends to conceptual navigation, we should see systematic forward/reverse asymmetry.
- **Tversky's asymmetric similarity** (cognitive science): Similarity judgments are directionally biased — "North Korea is similar to China" ≠ "China is similar to North Korea." Conceptual paths may exhibit the same asymmetry.
- **Hierarchical asymmetry prediction**: `animal→poodle` (specialization) should differ from `poodle→animal` (generalization). The hyponym→hypernym direction traverses *up* a taxonomy; the reverse traverses *down*. These are structurally different navigational tasks.

The word convergence game already showed direction effects (Tesla→mycelium ≠ mycelium→Tesla), but only for convergence dynamics, not full path structure.

### What each category predicts

| Category | Symmetry prediction | Rationale |
|----------|-------------------|-----------|
| **Antonym** | High symmetry | hot→cold and cold→hot traverse the same axis |
| **Hierarchy** | Asymmetric | Specialization vs generalization are different cognitive operations |
| **Near-synonym** | High symmetry | Dense neighborhood, few options either direction |
| **Cross-domain** | Unknown — the interesting case | Does the bridge metaphor work both ways? |
| **Polysemy** | Asymmetric | bank→river activates geography; river→bank might not activate finance |
| **Anchor** | Asymmetric | Known basin structure may act as attractor in one direction |
| **Controls** | Symmetric | Identity: trivially symmetric. Random: no preferred direction. Nonsense: noise. |

## Tasks

### 0. Fix Phase 1 data quality issues (pre-requisite)

Codex review identified several issues that would corrupt Phase 2 analysis if left unfixed. Address these before running any new experiments.

#### 0a. Polysemy analysis returns false zeros

**Bug:** `computePolysemyComparisons` in `analysis/01-pilot.ts` iterates over polysemy groups (bank, bat, crane), but each group has one reporting pair and one holdout pair. The holdout pair has no pilot data. When one side has an empty set, the function returns Jaccard = 0.000 — which looks like perfect sense differentiation but is actually "no data to compare."

**Fix:** Return `null` / `N/A` when either side of a polysemy comparison has no data. Update the findings report to flag this honestly. The polysemy result needs to be **retracted or reframed** — we can't claim perfect sense differentiation without data for both senses. Phase 2 reverse runs will incidentally provide some of this data (e.g., `river→bank` gives us another sense-steering pair), but the proper fix is to ensure both polysemy pair members are in the same set, or run the missing holdout pairs explicitly.

**Action:** Add a supplementary run: 120 runs (3 holdout polysemy pairs × 4 models × 10 reps, forward direction, 5wp) to properly test sense differentiation. This is cheap (~15 min with improved parallelism) and resolves the most embarrassing artifact in Phase 1.

#### 0b. Extraction count enforcement

**Bug:** `elicit()` in `index.ts` accepts whatever the parser extracts regardless of whether it matches the requested waypoint count. Overlong/underlong extractions are included in all metrics. This inflates entropy and depresses Jaccard, particularly for models that produce verbose responses.

**Fix:** In `elicit()`, after extraction: if `extractedWaypoints.length !== waypointCount`, either:
- **Option A (strict):** Mark as `failureMode: "extraction_count_mismatch"` and exclude from geometry metrics. Re-analyze Phase 1 data to see how many runs this affects.
- **Option B (lenient):** Truncate to first N waypoints if overlong, mark as soft warning. Only fail if underlong.

Recommend **Option B** for extraction + **filter in analysis**: analysis scripts should have a `--strict-extraction` flag that excludes mismatched runs. Report both strict and lenient numbers to quantify the impact.

#### 0c. Positional overlap metric definition mismatch

**Bug:** Code computes exact same-token-at-same-index fraction, but the findings appendix defines it as "shared waypoints in same relative order." These are different metrics.

**Fix:** Rename the existing metric to `exactPositionMatch` (which it already is in the type) and be precise in findings docs. Optionally implement a true relative-order metric (Kendall's tau or LCS-based) as a separate measure.

#### 0d. Waypoint scaling subsequence metric is too loose

**Bug:** The "67.9% subsequence rate" checks whether *any* 5wp run appears as a subsequence in *any* 10wp run. With 10-20 runs per condition, this is easy to satisfy by chance.

**Fix:** Report the metric honestly: "existence test across run pool." Add a stricter metric: compute characteristic (mode) paths for 5wp and 10wp, check subsequence on those. Or report the *fraction of run pairs* where subsequence holds, not just existence.

#### 0e. Atomic file writes

**Bug:** Result writes are non-atomic (direct `writeFile`). Interruption mid-write produces corrupt JSON files. At least one zero-byte artifact already exists in pilot data.

**Fix:** Write to temp file, then `rename()`. This is a one-line change in `runBatch`.

#### 0f. Pair count docs

**Minor:** `pairs.ts` header says "~38 pairs" and "~23 reporting" but actual counts are 36 total / 21 reporting. Update the comments.

### 1. Parallelism improvements (GitHub issue #1)

Phase 1 took many hours with `concurrency: 2`. The engine needs smarter parallelism.

**Design: global scheduler with per-model rate limiting**

Rather than ad-hoc per-batch concurrency, implement a single `Scheduler` class:

```
Scheduler {
  globalConcurrency: number        // max total in-flight requests (default: 8)
  perModelConcurrency: Map<string, number>  // per-model caps (default: 2 each)
  throttleMs: number               // min ms between requests to same model (default: 0)
}
```

**How it works:**
- Experiment scripts submit all requests to the scheduler upfront (the full run manifest)
- Scheduler dispatches requests respecting both global and per-model limits
- On resume, scheduler loads existing results, diffs against manifest, runs only missing items
- Status file updated atomically every N completions

**CLI flags for experiment scripts:**
- `--concurrency <n>` — global cap (default: 8)
- `--model-concurrency <spec>` — e.g., `claude=2,gpt=3,grok=3,gemini=3` (default: 2 each)
- `--throttle <ms>` — per-model delay between requests (default: 0)

**Target:** 2-4x faster than Phase 1 for equivalent run count. With `globalConcurrency=8` and 4 models, we'd have ~2 in-flight per model but 8 total — a 4x improvement over the current sequential-batch approach.

**Implementation notes:**
- The scheduler replaces the sequential batch loop in experiment scripts — batches become logical groupings for output, not execution units
- Resume is deterministic: full manifest is computed at start, existing results are loaded, diff determines what to run
- Status writes use temp-file-then-rename (same atomic pattern as result writes)

### 2. Reverse elicitation experiment

**Protocol:**
- Run all 21 reporting pairs in reverse (swap `from` and `to`)
- Same 4 models, same prompt format (semantic), same temperature (0.7)
- **Waypoint count: 5 only.** Phase 1 showed 5wp paths are reliable coarse-grained representations. Running both counts would double the experiment for marginal signal on the asymmetry question.
- **10 reps per condition**
- **Total: 840 reverse runs** (21 pairs × 4 models × 10 reps) **+ 120 polysemy supplementary runs** (3 holdout polysemy pairs × 4 models × 10 reps, forward direction, 5wp — see Task 0a). **960 runs total.**

**Implementation:**
- New experiment script: `experiments/02-reversals.ts`
- Reuse existing engine, pairs, canonicalization (with fixes from Task 0)
- Generate reversed pairs programmatically from `REPORTING_PAIRS` (swap `from`/`to`, prefix pair ID with `rev-`)
- Output to `results/reversals/`
- Uses new scheduler (Task 1)

### 3. Asymmetry metrics & analysis

New metrics for direction comparison. Implement in a new `metrics.ts` module (keep `canonicalize.ts` focused on extraction/canonicalization).

**Critical: filter forward data to `waypointCount=5` only** when comparing against reverse runs. Phase 1 has both 5wp and 10wp forward data; mixing them in would contaminate the comparison.

#### Distribution-level comparison (primary)

Don't just compare pooled sets — compare the *distributions* of waypoint sets across runs:

**Per-run cross-direction Jaccard:**
- For each forward run × each reverse run of the same pair/model: compute Jaccard
- Report the mean and bootstrap 95% CI of this distribution
- This captures both the central tendency and the uncertainty of the asymmetry estimate

**Permutation test for asymmetry:**
- Null hypothesis: direction doesn't matter (forward and reverse runs are drawn from the same distribution)
- Pool all runs, randomly split into "forward" and "reverse" groups, compute mean cross-group Jaccard
- Repeat 1000x, compare observed cross-direction Jaccard to null distribution
- Report p-value per pair/model

#### Summary metrics

**Asymmetry index:**
- `asymmetry = 1 - mean_cross_direction_Jaccard`
- 0 = perfectly symmetric, 1 = completely asymmetric
- Report with bootstrap CI

**Direction-exclusive waypoints:**
- For each pair/model: characteristic waypoints (>50% frequency) that appear *only* in forward or *only* in reverse
- High direction-exclusivity indicates genuine path asymmetry, not just noise

**Reversal order test:**
- For pairs with high waypoint overlap: compute Spearman's rho between forward and reverse characteristic waypoint orderings
- rho ~ -1: mirror image paths. rho ~ 0: same landmarks, different route. rho ~ +1: same path same order.

**Edit distance:**
- Normalized Levenshtein between characteristic forward and reverse sequences
- Useful for per-pair visualization but secondary to the distributional metrics

### 4. Analysis script

New: `analysis/02-reversals.ts`

**Inputs:**
- Phase 1 forward results from `results/pilot/` — **filtered to `waypointCount=5` only**
- Phase 2 reverse results from `results/reversals/`
- (Optional) Supplementary polysemy results

**Outputs:**
- `results/analysis/reversal-metrics.json` — full metrics data
- `findings/02-reversals.md` — auto-generated findings report

**Analysis pipeline:**
1. Load forward (5wp only) and reverse results, match by pair ID (strip `rev-` prefix)
2. For each pair × model: compute all asymmetry metrics (distribution-level + summary)
3. Aggregate by category — test the predictions table from the motivation section
4. Aggregate by model — do some models show more directional sensitivity than others?
5. Identify outliers — which pairs are most/least symmetric?
6. Run permutation tests, compute bootstrap CIs
7. Cross-reference with word convergence direction findings
8. Generate findings markdown

### 5. Findings writeup

`findings/02-reversals.md` (auto-generated) + `findings/02-reversals-analysis.md` (interpretive).

Key sections:
1. Experiment overview (run counts, conditions, data quality notes)
2. Overall symmetry profile (is navigation generally symmetric or not?)
3. Category-level asymmetry (test predictions table — with statistical support)
4. Per-model direction sensitivity (do rigid navigators show more/less asymmetry?)
5. Individual pair deep dives (most interesting cases)
6. Polysemy sense differentiation (corrected analysis with supplementary data)
7. Connection to reversal curse literature
8. Connection to word convergence direction findings
9. Limitations (acknowledge remaining data quality caveats)
10. Phase 3 recommendations

## Files

- `metrics.ts` — new module for asymmetry metrics, permutation tests, bootstrap CIs
- `experiments/02-reversals.ts` — reverse elicitation batch runner
- `analysis/02-reversals.ts` — analysis script (loads both forward + reverse data)
- `findings/02-reversals.md` — auto-generated findings
- `findings/02-reversals-analysis.md` — interpretive analysis
- `results/reversals/` — JSON output (gitignored)
- `index.ts` — atomic writes, extraction enforcement, scheduler integration
- `canonicalize.ts` — extraction count handling improvements
- `analysis/01-pilot.ts` — polysemy comparison fix, extraction filtering
- `pairs.ts` — comment fixes
- `types.ts` — new types for reversal/asymmetry metrics

## Docs to update

- `AGENTS.md` — add `bun run reversals` and `bun run analyze-reversals` script descriptions
- `STATE.md` — phase transition summary
- `ROADMAP.md` — advance phase status
- `package.json` — add `reversals` and `analyze-reversals` scripts
- `findings/01-pilot-analysis.md` — add errata section noting polysemy and extraction caveats

## Verify

- Atomic writes work (kill mid-batch, verify no corrupt files)
- Extraction enforcement: re-analyze Phase 1 data with strict filtering, report impact
- Polysemy fix: `computePolysemyComparisons` returns null for missing data
- Scheduler: run a small test batch with various concurrency settings, verify identical results
- Reverse pairs generated correctly (from/to swapped, IDs match)
- Resume support: interrupt and restart without data loss or duplicates
- Forward data correctly filtered to 5wp only in reversal analysis
- Asymmetry metrics produce expected values on controls:
  - Identity pairs: asymmetry ~ 0 (apple→apple reversed is still apple→apple)
  - Nonsense pairs: no significant directional effect (permutation test p > 0.05)
  - Antonym pairs: low asymmetry expected
- All 960 runs complete successfully (840 reverse + 120 polysemy supplementary)
- Polysemy sense differentiation is properly tested with real data for both senses
- Bootstrap CIs are computed for all summary metrics
- Findings report is generated with all sections populated

## Done when

- Phase 1 data quality fixes are applied and verified
- Parallelism improvements are implemented and tested (>= 2x Phase 1 speed)
- All 960 runs are complete with clean data (840 reverse + 120 polysemy supplementary)
- Asymmetry metrics are computed for all 21 pairs x 4 models with statistical support
- Category-level predictions from the motivation section are tested with permutation tests
- Findings document exists with interpretive analysis
- Phase 3 direction is informed by the asymmetry data
