# Deferred: Multi-Agent Waypoint Negotiation

Extension from cross-model convergence games (48% novelty rate). Instead of single-model waypoint elicitation, have models negotiate the path:

- Two models alternate proposing waypoints, building a shared path
- Or: N models each propose paths, then vote/negotiate on consensus
- Chiang et al. (2025) found intrinsic dimensionality drops from ~7.9 to ~0.4 over negotiation rounds — consensus attractors emerge

Questions: Do negotiated paths have different geometric properties than individual-model paths? Do consensus attractors create new basins not present in any single model?

Builds on: word-convergence cross-model findings, Ashery et al. naming game (Science Advances 2025).
