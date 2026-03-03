# Deferred: Embedding Distance Validation

Do behavioral paths (waypoints) correlate with embedding-space geometry?

- Compute embedding distances between consecutive waypoints using model embeddings (or a reference model like text-embedding-3-large)
- Test: are waypoint paths approximately geodesic in embedding space? Or do behavioral paths take "detours" that embedding distance can't explain?
- Compare embedding-space distances to behavioral distances (number of waypoints, semantic shift magnitude)

Key tension: Park et al. showed the correct inner product is non-Euclidean. Using cosine similarity may produce artifacts. Angular distance or WMD may be more appropriate.

Also relevant: anisotropy varies by model family (NAACL 2024) — distance geometry differs substantially across models.
