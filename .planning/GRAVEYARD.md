# Graveyard: Dead Ends, Failed Hypotheses, and Deprecated Approaches

Things we tried that didn't work, and why. Prevents re-treading and provides honest accounting of the benchmark's learning curve. Ordered chronologically by phase.

---

## Phase 1: Polysemy Cross-Pair Jaccard of 0.000 (Artifact)

**What:** Reported "perfect sense differentiation" with cross-pair Jaccard of 0.000 for all three polysemy groups (bank, bat, crane).

**Why it failed:** Holdout pairs had no pilot data — the zero Jaccard was comparing real data against empty sets.

**Resolution:** Phase 2 supplementary runs (120 forward runs across 3 holdout polysemy pairs). Corrected values: 0.011-0.062. Sense differentiation is still genuine and strong, but not literally perfect.

**Lesson:** Always verify denominator. Zero is suspicious.

---

## Phase 2: Monotonic Convergence Prediction

**What:** Predicted that mirror-matching forward position i against reverse position (5-i) would show monotonically increasing overlap from position 1 to 5, based on the starting-point hypothesis (starting concept dominates early waypoints, target influences late waypoints).

**Why it failed:** Got U-shape instead — positions 1 and 5 both elevated (0.102, 0.129), with a valley in the middle (0.057-0.085). Both endpoints act as anchors.

**Resolution:** Replaced starting-point hypothesis with dual-anchor hypothesis. Target concept also influences path from the beginning (especially for polysemous pairs where sense disambiguation requires knowing the target). Starting-point effect is real but attenuated.

**Lesson:** Simple unidirectional models underestimate the influence of the target concept on path construction.

---

## Phase 2: Category Symmetry Predictions (4 of 8 Failed)

**What:** Predicted several categories would show high path symmetry (low asymmetry) between forward and reverse directions.

**Failures:**
- **Antonyms** — predicted high symmetry, observed 0.596 asymmetry. Even the temperature axis has directional landmarks ("tepid" pulls toward the hot end).
- **Near-synonyms** — predicted high symmetry, observed 0.665. Dense neighborhoods constrain differently depending on entry point.
- **Control-random** — predicted symmetric (no inherent directionality), observed 0.908. The *most important* failure: when there's no semantic bridge, the starting point completely determines the trajectory.
- **Control-nonsense** — predicted symmetric, observed 0.986.

**Resolution:** Established that asymmetry is pervasive and structural, not relationship-dependent. The magnitude (0.811 mean) was far higher than anyone would have predicted. Led to quasimetric characterization of conceptual space.

**Lesson:** Asymmetry is the default. Symmetry is the exception, produced only by strong semantic bridges that constrain both directions.

---

## Phase 3: "Energy" as Hot-Cold Bridge

**What:** "Energy" is associated with both "hot" and "cold" and was included in the semantic chain triple type (hot-energy-cold).

**Why it failed:** Near-zero transitivity (0.036 average). "Energy" never appears as a bridge concept. Hot-to-cold paths traverse the experiential temperature gradient (warm, tepid, cool, chilly); hot-to-energy and energy-to-cold paths traverse physics terms (thermodynamics, work, heat).

**Resolution:** Established that the temperature axis and the physics-of-energy axis are parallel non-intersecting conceptual dimensions. Association is not the same as being on-route. This finding was later echoed by the Phase 4 "metaphor" result and the Phase 5 "plant" result.

**Lesson:** Semantic association between a concept and two endpoints does not guarantee that concept lies on the navigational path between them.

---

## Phase 4: "Metaphor" as Language-Thought Bridge

**What:** Predicted bridge frequency of [0.50, 1.00] for Claude, GPT, and Grok on language-metaphor-thought. Rationale: metaphor is arguably the quintessential bridge between language and thought (Lakoff & Johnson's entire research program).

**Why it failed:** 0.00 for ALL four models. Zero. Not one run out of 80 produced "metaphor" as a waypoint. Yet transitivity was high (Claude 0.437) — the paths compose through shared waypoints like "communication," "meaning," "cognition," just not through "metaphor" itself.

**Resolution:** Sharpened the definition of bridge concepts. A bridge must name the *primary axis of connection* between endpoints, not merely be associated with both. "Metaphor" names a specific device; the language-thought connection goes through general functions (meaning, communication, expression). Led to the "association is not navigation" principle.

**Lesson:** The biggest single prediction miss in the benchmark. Intuitive semantic importance (metaphor *should* bridge language and thought) has no predictive power for navigational bridge behavior.

---

## Phase 4: Concrete/Abstract as Gemini's Fragmentation Boundary

**What:** Used concrete vs. abstract distinction to predict Gemini's bridge behavior. Predicted Gemini would succeed on tree-forest-ecosystem (concrete, hierarchical, part-whole) with bridge frequency > 0.40.

**Why it failed:** Gemini observed at 0.10 on tree-forest-ecosystem. The concrete/abstract axis doesn't explain Gemini's fragmentation pattern — bank-deposit-savings (abstract/financial) succeeds at 1.00 while tree-forest-ecosystem (concrete/ecological) fails.

**Resolution:** Replaced with the frame-crossing hypothesis: Gemini succeeds on within-frame bridges (tight cue chains within a single domain) and fails on cross-frame bridges (requiring integration across loosely coupled conceptual clusters). Forest-to-ecosystem requires crossing from the botanical/spatial frame to the ecological/systems frame. This is a scale transition, not an abstractness gradient.

**Lesson:** The concrete/abstract distinction is too coarse. Frame membership and cue-chain tightness are the relevant variables for Gemini's topology.

---

## Phase 5: Gemini Cue-Strength Threshold Hypothesis

**What:** Phase 4's frame-crossing hypothesis predicted that Gemini should have a measurably higher cue-strength threshold than other models — it succeeds on high-cue bridges and fails on low-cue bridges, so there should be a threshold that's shifted rightward.

**Why it failed:** Logistic fit shows Gemini's threshold (1.79) is the *lowest*, not the highest. 95% CI on the difference: [-1.00, 1.07], comfortably including zero. Gemini responds to cue strength at approximately the same sensitivity as other models.

**Resolution:** The quantitative threshold model of frame-crossing is not supported. Gemini's fragmentation is about frame *membership* (which frame does it activate?), not about cue *sensitivity* (how strong does the cue need to be?). The qualitative frame-crossing model survives; the quantitative version does not.

**Lesson:** A correct qualitative model (frame-crossing) can still generate incorrect quantitative predictions (threshold). These should be treated as separate claims.

---

## Phase 5: Intuitive Cue-Strength Ratings (Plant > Germination)

**What:** Rated "plant" as very-high cue strength (4/4) and "germination" as medium (2/4) for the biological-growth family (seed-B-garden). Predicted plant would bridge at near-100% frequency.

**Why it failed:** Complete inversion. Germination outperforms plant in all 4 models: Claude 1.00 vs 0.00, GPT 0.95 vs 0.65, Grok 0.15 vs 0.00, Gemini 1.00 vs 0.00.

**Resolution:** Discovered the distinction between associative strength and navigational salience. "Plant" is strongly associated with both endpoints but is a *neighbor* of both, not a waypoint between them. "Germination" names the *process* that transforms seed into garden — it adds directional information. Process-naming bridges outperform object-naming bridges.

**Lesson:** Human intuition about "which concept is most related" does not predict which concept models route through. Future experiments should calibrate empirically via pilot runs, not via intuitive ratings.

---

## Phase 5: Dimensional Independence Model of Polysemy

**What:** Pre-registered test predicting same-axis bridge frequency would exceed cross-axis by at least 0.40. Rationale: if "bank" has independent financial and geographic dimensions, crossing between them should be harder.

**Why it failed:** Cross-axis mean (0.291) is *higher* than same-axis mean (0.220). Delta is -0.071, wrong direction. 42.9% prediction accuracy — worst in the benchmark. Driven by loan-bank-shore at 0.95-1.00 for non-Gemini models.

**Resolution:** Polysemy doesn't create dimensional walls — it creates **forced crossing points**. When a polysemous concept is the *only* semantic connection between two otherwise unrelated domains (loan and shore share nothing except through "bank"), the bridge becomes obligatory. Same-axis paths have alternatives (loan-to-savings can go through interest, account, credit); cross-axis paths have no alternative that avoids "bank."

**Lesson:** The most reliable bridges are bottlenecks, not associations. Constraint produces reliability. This is probably the single most important mechanistic finding in the benchmark.

---

## Phase 5: "Fire" as Non-Polysemous Control Bridge

**What:** Included "fire" as a control in the dimensionality experiment. Expected reliable same-axis bridging (spark-fire-ash) to establish a baseline for comparing polysemous concepts.

**Why it failed:** Near-zero bridge frequency across all configurations for all models. Sole exception: GPT at 0.15 on spark-fire-ash. Fire is navigable *to* but almost never *through*.

**Resolution:** "Fire" is "too central" — so implied by both endpoints that models skip it entirely. Spark already implies fire; ash already implies fire. Naming fire adds no navigational information. This established "too-central" as a new bridge failure mode, distinct from "off-axis" (metaphor) and "fragmentation" (Gemini).

**Lesson:** The control was uninformative because it didn't bridge at all. Future dimensionality experiments need non-polysemous controls that actually function as bridges (e.g., water for liquid-water-steam).

---

## Phase 5: W-Shape Aggregate Prediction

**What:** Pre-registered test: bridge-present pairs should show higher W-shape contrast (elevated convergence at midpoint) than bridge-absent pairs, aggregated across all models and pairs.

**Why it failed:** Bridge-present mean W-shape contrast: 0.0027 (CI [-0.0787, 0.0797]). Bridge-absent: 0.0050. Difference: -0.0023 (CI [-0.0983, 0.0887]). No signal in aggregate.

**Resolution:** The effect exists but is model-dependent and position-variable. Claude shows 0.52 contrast on music-mathematics (strongest positional signal in the benchmark, P4 = 0.600). Grok shows -0.045 on the same pair despite having the bridge — bridge presence alone isn't sufficient, positional stability is also required. Gemini shows a displaced anchor at P3 = 0.900 on bank-savings, meaning the W-shape test's assumption of midpoint bridging is too rigid.

**What survived:** The restricted version: for models with rigid navigational gaits (Claude) and bridge concepts with fixed positional placement, the bridge creates a genuine third convergence anchor. Phase 6C redesigns the test as peak-detection rather than fixed-position.

**Lesson:** Aggregation can kill real signals when the effect is interaction-dependent (model x pair). Individual-level analysis is essential for positional phenomena.
