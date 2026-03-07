# Section 3: Related Work

## Goal
Position the benchmark against six distinct literatures. Use "Relation to Benchmark" framing throughout. Written after results sections so positioning is precise.

## Outline Reference
Lines 126–191 of `writeup/outline.md`

## Structure

### 3.1 Static Geometry of LLM Representations
- Linear representation hypothesis (Park et al. 2024, 2025)
- Hyperbolic structure (Nickel & Kiela 2017)
- Delta-hyperbolicity and ultrametricity (2025)
- TDA (Explainable Mapper 2025, Persistent Topological Features 2025)
- Spectral semantic attractors (Wyss et al. 2025)
- Intrinsic dimensionality profiles (Joshi et al. NeurIPS 2025)
- **Gap we fill:** All static — we probe navigational consistency

### 3.2 Theoretical Origin of Geometric Structure
- Karkada et al. (2025): translation symmetry → manifold geometry
- Connection: predicts our universality finding; we test dynamic complement

### 3.3 Conceptual Navigation and Interpolation
- Latent space geodesics (Arvanitidis et al. 2018-2025)
- Relation Embedding Chains (2023) — closest precedent for waypoints
- Geometry of Knowledge (2025)
- RiemannInfer (2026), Geometric Reasoner (2026)
- **Gap:** No prior work asks models for waypoints + tests geometric consistency

### 3.4 Consistency, Directionality, and the Reversal Curse
- Reversal curse (Berglund 2023)
- Directional optimization asymmetry (2025)
- Directional hysteresis (Barakat 2026)
- Self-consistency failures (2025)
- Trajectory variance (2025)
- **Reframing:** Asymmetry as data, not failure mode
- **Defensive positioning:** Why this isn't just self-consistency work with geometry gloss

### 3.5 Multi-Hop Reasoning and Compositionality
- Compositionality gap (2022)
- Two-hop curse (2025)
- TWOHOPFACT (ACL 2024)
- **Generalization:** Shape of intermediate sequence, not binary pass/fail
- **Defensive positioning:** Why this isn't CoT elicitation

### 3.6 Cross-Model Comparison and PRH
- PRH (Huh et al. 2024)
- Multi-way alignment (2026)
- Model stitching (NeurIPS 2025)
- LLM behavioral fingerprinting (2025)
- Conversational attractor states (Nanda et al. 2026)
- Behavioral failure manifold mapping (2025)
- **Our test:** Dynamic navigational alignment. Same map, different routes.

### 3.7 Cognitive Science Foundations
- Gardenfors (2000): Conceptual Spaces
- Cognitive maps: Tolman (1948), O'Keefe & Dostrovsky (1971), Constantinescu (2016)
- Tversky (1977): asymmetric similarity
- Spreading activation (Collins & Loftus 1975)
- LLM World of Words (2024-2025)
- **Operationalization:** Gardenfors theorized; neuroscience found mechanisms; we probe computationally

## Files
- `writeup/sections/03-related-work.md` (new)

## Docs to Update
- `.planning/STATE.md`

## Source Data
- `research.md` (comprehensive literature survey)
- `writeup/outline.md` §3

## Verify
- Each subsection has "gap we fill" or "relation to benchmark"
- Defensive positioning for self-consistency and CoT reviewers included
- Citations are accurate to research.md
- No overclaiming (e.g., don't claim we prove quasimetric formally)

## Done When
- Section 3 drafted, Codex-reviewed, fixes applied
