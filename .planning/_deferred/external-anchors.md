# Deferred: External Anchors (ConceptNet, Human Norms)

Compare LLM waypoint paths against non-LLM ground truth to address self-grounding circularity:

- **ConceptNet shortest paths** — compare LLM waypoints to shortest/low-cost paths in ConceptNet. Use path-quality predictors to filter noisy edges.
- **Small World of Words** — human free association norms as "natural" conceptual paths. Direct comparison: do LLMs navigate like humans?
- **LLM World of Words** — LLM-generated free association norms (Mistral, Llama3, Haiku, 12K+ cues). Already exists, directly comparable.
- **Lexical hierarchy features** — path length, depth changes through WordNet as independent structural signal.

Useful for: calibration subset, detecting when self-grounded geometry drifts, publishability (external validation).
