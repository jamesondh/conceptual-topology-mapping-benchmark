# Interpreting Results

How to read the benchmark's metrics — what "good" and "bad" mean here, and why the answer isn't straightforward.

## This Is an MRI, Not an Exam

This benchmark doesn't produce a score. It produces a *map*. You're measuring the geometric structure of how a model navigates conceptual space — not grading it. Saying a model "scored high" is like saying someone's brain scan "scored high." The question is *what's there*, not *how good is it*.

## What the Metrics Tell You

### Layer 1: Task Competence

Can the model do the task at all? If you ask for 5 waypoints between "music" and "mathematics" and the model gives nonsense or can't follow the format, that's genuinely bad. The control pairs (identity, nonsense) catch this. This is the only layer where "higher = better" straightforwardly applies.

### Layer 2: Structural Stability

If you ask the same question 10 times and get wildly different paths each time, the model doesn't have a consistent internal geography — it's generating plausible-sounding words without stable structure underneath. High rep-to-rep consistency means the model has *real conceptual topology* rather than ad hoc generation. Consistency is arguably good... but.

### Layer 3: Directional Structure (Symmetry/Asymmetry)

Does "music -> mathematics" give the same waypoints as "mathematics -> music"? High symmetry means the model treats conceptual distance as a two-way street. Low symmetry means *direction matters* — the path from concrete to abstract might go through different territory than abstract to concrete. That's not a flaw. That's a finding. It may reflect something real about how concepts relate — and it connects directly to the reversal curse literature.

### Layer 4: Cross-Model Topology

Do all four models navigate similar paths? High agreement might mean they've converged on some shared conceptual geography (or just trained on the same internet). Low agreement means each model has its own topology — its own characteristic "gait," as observed in the word convergence game data.

## The Uncomfortable Punchline

A model that performs "perfectly" — totally consistent, perfectly symmetric, always agrees with other models — might be the *least* interesting one. Predictable. A flat, boring conceptual space.

A model with strong consistency but high asymmetry and unique paths compared to other models? That has *character*. Stable structure, but distinctively its own.

## The One Thing That's Genuinely Bad

**Randomness.** If a model's waypoints are noise — low rep-to-rep consistency, no distributional structure — there's no *there* there. The model doesn't have stable conceptual topology, it's just generating plausible words each time. That's the closest thing to a failing grade.

## Summary

The benchmark measures: **does this model have a consistent, structured way of navigating between concepts, and what does that structure look like?** It's a personality test more than an exam.
