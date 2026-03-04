/**
 * Waypoint extraction and canonicalization pipeline.
 *
 * Handles parsing model responses into ordered waypoint lists, normalizing
 * them for comparison, computing consistency metrics, and embedding-based
 * semantic similarity.
 */

import nlp from "compromise";
import type {
  JaccardResult,
  PositionalOverlap,
  ConsistencyMetrics,
} from "./types.ts";

// ── Waypoint Extraction ──────────────────────────────────────────────

/**
 * Parse a model response to extract waypoints. Handles numbered lists,
 * bullet lists, comma-separated values, JSON arrays, and prose with
 * embedded concepts. Preamble text before the actual list is tolerated.
 *
 * @param rawResponse - The raw model response string.
 * @param expectedCount - The number of waypoints expected (used as a
 *   hint for disambiguation, not a hard constraint).
 * @returns An ordered array of raw waypoint strings.
 */
export function extractWaypoints(
  rawResponse: string,
  expectedCount: number,
): string[] {
  const trimmed = rawResponse.trim();
  if (!trimmed) return [];

  // Strategy 1: Try JSON array parse (possibly embedded in prose)
  const jsonResult = tryJsonArray(trimmed);
  if (jsonResult && jsonResult.length > 0) {
    return jsonResult;
  }

  // Strategy 2: Try numbered list  (e.g. "1. concept" or "1) concept")
  const numberedResult = tryNumberedList(trimmed);
  if (numberedResult && numberedResult.length > 0) {
    return numberedResult;
  }

  // Strategy 3: Try bullet list (e.g. "- concept" or "* concept" or "  concept")
  const bulletResult = tryBulletList(trimmed);
  if (bulletResult && bulletResult.length > 0) {
    return bulletResult;
  }

  // Strategy 4: Try comma-separated (possibly after preamble)
  const commaResult = tryCommaSeparated(trimmed, expectedCount);
  if (commaResult && commaResult.length > 0) {
    return commaResult;
  }

  // Strategy 5: Try arrow-separated (e.g. "A -> B -> C")
  const arrowResult = tryArrowSeparated(trimmed, expectedCount);
  if (arrowResult && arrowResult.length > 0) {
    return arrowResult;
  }

  // Fallback: split on newlines, filter blanks, take non-empty lines
  const lines = trimmed
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length >= expectedCount) {
    return lines.slice(0, expectedCount);
  }

  return lines;
}

/** Try to extract a JSON array from the response. Handles cases where
 *  the array is embedded in surrounding prose. */
function tryJsonArray(text: string): string[] | null {
  // Look for a JSON array anywhere in the text
  const arrayMatch = text.match(/\[[\s\S]*?\]/);
  if (!arrayMatch) return null;

  try {
    const parsed = JSON.parse(arrayMatch[0]);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
        .map((item: unknown) => String(item).trim())
        .filter((s: string) => s.length > 0);
    }
  } catch {
    // Not valid JSON
  }
  return null;
}

/** Try to extract a numbered list. Handles "1. ", "1) ", "1: " prefixes.
 *  Skips preamble lines that do not match the pattern. */
function tryNumberedList(text: string): string[] | null {
  const lines = text.split(/\n/);
  const numberedPattern = /^\s*(\d+)\s*[.):\-]\s+(.+)/;
  const items: string[] = [];

  for (const line of lines) {
    const match = line.match(numberedPattern);
    if (match) {
      const content = match[2].trim();
      if (content.length > 0) {
        items.push(content);
      }
    }
  }

  return items.length >= 2 ? items : null;
}

/** Try to extract a bullet list. Handles "- ", "* ", "  " prefixes. */
function tryBulletList(text: string): string[] | null {
  const lines = text.split(/\n/);
  const bulletPattern = /^\s*[-*\u2022\u2013\u2014]\s+(.+)/;
  const items: string[] = [];

  for (const line of lines) {
    const match = line.match(bulletPattern);
    if (match) {
      const content = match[1].trim();
      if (content.length > 0) {
        items.push(content);
      }
    }
  }

  return items.length >= 2 ? items : null;
}

/** Try to extract comma-separated values.
 *  If the text has preamble, look for the last line or clause that
 *  contains commas and yields roughly the expected number of items. */
function tryCommaSeparated(
  text: string,
  expectedCount: number,
): string[] | null {
  // Try each line (last line first, since preamble comes first)
  const lines = text.split(/\n/).filter((l) => l.trim().length > 0);

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    const parts = line
      .split(/,/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (parts.length >= expectedCount - 1 && parts.length <= expectedCount + 2) {
      return parts;
    }
  }

  // Try the whole text as comma-separated
  const allParts = text
    .split(/,/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (
    allParts.length >= expectedCount - 1 &&
    allParts.length <= expectedCount + 2
  ) {
    return allParts;
  }

  return null;
}

/** Try to extract arrow-separated values (e.g. "A -> B -> C -> D"). */
function tryArrowSeparated(
  text: string,
  expectedCount: number,
): string[] | null {
  // Look for arrow patterns: ->, =>, -->, ==>
  const arrowPattern = /\s*(?:->|=>|-->|==>|->)\s*/;
  const lines = text.split(/\n/).filter((l) => l.trim().length > 0);

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (arrowPattern.test(line)) {
      const parts = line
        .split(arrowPattern)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      if (parts.length >= expectedCount - 1) {
        return parts;
      }
    }
  }

  return null;
}

// ── Canonicalization Pipeline ────────────────────────────────────────

/**
 * Canonicalize a single waypoint string through the full pipeline:
 * 1. Lowercase
 * 2. Strip leading articles/determiners ("the ", "a ", "an ")
 * 3. Lemmatize via compromise NLP
 * 4. Phrase normalization (trim, collapse whitespace, strip trailing punctuation)
 *
 * @param waypoint - A raw waypoint string.
 * @returns The canonicalized waypoint.
 */
export function canonicalize(waypoint: string): string {
  // Step 1: Lowercase
  let result = waypoint.toLowerCase();

  // Step 2: Strip leading articles/determiners
  result = result.replace(/^(the|a|an)\s+/i, "");

  // Step 3: Lemmatize using compromise
  result = lemmatize(result);

  // Step 4: Phrase normalization
  result = result.trim();
  result = result.replace(/\s+/g, " "); // collapse whitespace
  result = result.replace(/[.,;:!?'")\]]+$/, ""); // strip trailing punctuation
  result = result.trim();

  return result;
}

/**
 * Lemmatize a phrase using compromise NLP library.
 * Processes verbs to infinitive form and nouns to singular form.
 */
function lemmatize(text: string): string {
  const doc = nlp(text);

  // Convert verbs to infinitive form ("running" -> "run", "walked" -> "walk")
  doc.verbs().toInfinitive();

  // Convert nouns to singular form ("cities" -> "city", "dogs" -> "dog")
  doc.nouns().toSingular();

  return doc.text("normal");
}

/**
 * Canonicalize an array of waypoints, then deduplicate (preserving order,
 * keeping first occurrence).
 *
 * @param waypoints - An array of raw waypoint strings.
 * @returns An array of canonicalized, deduplicated waypoints.
 */
export function canonicalizeAll(waypoints: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const wp of waypoints) {
    const canonical = canonicalize(wp);
    if (canonical.length === 0) continue;
    if (!seen.has(canonical)) {
      seen.add(canonical);
      result.push(canonical);
    }
  }

  return result;
}

// ── Consistency Metrics ──────────────────────────────────────────────

/**
 * Compute Jaccard similarity between two sets of canonicalized waypoints.
 * J(A, B) = |A intersection B| / |A union B|
 *
 * @param set1 - First set of canonicalized waypoints.
 * @param set2 - Second set of canonicalized waypoints.
 * @returns JaccardResult with similarity score, intersection, and union.
 */
export function computeJaccard(set1: string[], set2: string[]): JaccardResult {
  const a = new Set(set1);
  const b = new Set(set2);

  const intersection: string[] = [];
  for (const item of a) {
    if (b.has(item)) {
      intersection.push(item);
    }
  }

  const unionSet = new Set([...a, ...b]);
  const union = Array.from(unionSet);

  const similarity = union.length === 0 ? 0 : intersection.length / union.length;

  return { similarity, intersection, union };
}

/**
 * Compute positional overlap between two waypoint paths.
 * Measures the fraction of positions where the same waypoint appears
 * in both paths at the same index.
 *
 * @param path1 - First ordered list of canonicalized waypoints.
 * @param path2 - Second ordered list of canonicalized waypoints.
 * @returns PositionalOverlap with match fraction and per-position booleans.
 */
export function computePositionalOverlap(
  path1: string[],
  path2: string[],
): PositionalOverlap {
  const maxLen = Math.max(path1.length, path2.length);
  if (maxLen === 0) {
    return { exactPositionMatch: 0, positionMatches: [] };
  }

  const positionMatches: boolean[] = [];
  let matchCount = 0;

  for (let i = 0; i < maxLen; i++) {
    const match = i < path1.length && i < path2.length && path1[i] === path2[i];
    positionMatches.push(match);
    if (match) matchCount++;
  }

  return {
    exactPositionMatch: matchCount / maxLen,
    positionMatches,
  };
}

/**
 * Compute distributional entropy of waypoint frequencies across multiple runs.
 * Uses Shannon entropy: H = -sum(p_i * log2(p_i)) for each unique waypoint.
 *
 * Higher entropy means more diverse/inconsistent waypoint usage across runs.
 * Lower entropy means the model consistently picks the same waypoints.
 *
 * @param waypointRuns - An array of runs, each run being an array of
 *   canonicalized waypoints.
 * @returns Shannon entropy in bits.
 */
export function computeDistributionalEntropy(
  waypointRuns: string[][],
): number {
  // Count frequency of each waypoint across all runs
  const freqMap = new Map<string, number>();
  let totalCount = 0;

  for (const run of waypointRuns) {
    for (const wp of run) {
      freqMap.set(wp, (freqMap.get(wp) ?? 0) + 1);
      totalCount++;
    }
  }

  if (totalCount === 0) return 0;

  // Compute Shannon entropy
  let entropy = 0;
  for (const count of freqMap.values()) {
    const p = count / totalCount;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }

  return entropy;
}

/**
 * Count waypoint frequencies across repeated paths for salience mapping.
 * Returns a Map from waypoint string to the number of paths it appears in
 * (each waypoint counted at most once per path).
 */
export function countWaypointFrequencies(
  runs: string[][],
): Map<string, number> {
  const freqMap = new Map<string, number>();
  for (const run of runs) {
    const unique = new Set(run);
    for (const wp of unique) {
      freqMap.set(wp, (freqMap.get(wp) ?? 0) + 1);
    }
  }
  return freqMap;
}

// ── Semantic Similarity (Embedding-Based) ────────────────────────────

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const EMBEDDING_MODEL = "openai/text-embedding-3-large";

/**
 * Compute embeddings for a list of texts via OpenRouter's embedding API.
 * Uses the `openai/text-embedding-3-large` model.
 *
 * @param texts - Array of strings to embed.
 * @returns Array of embedding vectors (number[][]).
 * @throws If OPENROUTER_API_KEY is not set or the API call fails.
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY environment variable is required for embedding calls",
    );
  }

  if (texts.length === 0) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000); // 30s timeout

  let response: Response;
  try {
    response = await fetch(`${OPENROUTER_BASE_URL}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: texts,
      }),
      signal: controller.signal,
    });
  } catch (error: unknown) {
    clearTimeout(timeout);
    throw error;
  }
  clearTimeout(timeout);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenRouter embedding API error (${response.status}): ${errorText}`,
    );
  }

  const data = (await response.json()) as {
    data: Array<{ embedding: number[]; index: number }>;
  };

  // Sort by index to maintain input order
  const sorted = data.data.sort((a, b) => a.index - b.index);
  return sorted.map((item) => item.embedding);
}

/**
 * Compute cosine similarity between two vectors.
 * cos(a, b) = (a . b) / (||a|| * ||b||)
 *
 * @param a - First vector.
 * @param b - Second vector.
 * @returns Cosine similarity in range [-1, 1].
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `Vector dimension mismatch: ${a.length} vs ${b.length}`,
    );
  }
  if (a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Compute angular distance between two vectors.
 * angular_distance = arccos(cosine_similarity) / pi
 *
 * NOTE: `1 - cosine_similarity` is NOT a true metric (it violates the
 * triangle inequality). Angular distance `arccos(cos_sim) / pi` IS a
 * proper metric in the mathematical sense -- it satisfies non-negativity,
 * identity of indiscernibles, symmetry, and the triangle inequality.
 * Use angular distance when you need metric-safe distance computations
 * (e.g., for clustering or MDS).
 *
 * @param a - First vector.
 * @param b - Second vector.
 * @returns Angular distance in range [0, 1].
 */
export function angularDistance(a: number[], b: number[]): number {
  const cosSim = cosineSimilarity(a, b);
  // Clamp to [-1, 1] to handle floating-point imprecision
  const clamped = Math.max(-1, Math.min(1, cosSim));
  return Math.acos(clamped) / Math.PI;
}

/**
 * Compute average pairwise semantic similarity between two sets of waypoints.
 * Embeds all waypoints, then computes the mean cosine similarity across
 * all pairs (one from each set).
 *
 * @param waypoints1 - First set of waypoints.
 * @param waypoints2 - Second set of waypoints.
 * @returns Average pairwise cosine similarity.
 */
export async function averageSemanticSimilarity(
  waypoints1: string[],
  waypoints2: string[],
): Promise<number> {
  if (waypoints1.length === 0 || waypoints2.length === 0) return 0;

  // Embed all waypoints in a single batch for efficiency
  const allTexts = [...waypoints1, ...waypoints2];
  const allEmbeddings = await getEmbeddings(allTexts);

  const embeddings1 = allEmbeddings.slice(0, waypoints1.length);
  const embeddings2 = allEmbeddings.slice(waypoints1.length);

  // Compute all pairwise similarities
  let totalSimilarity = 0;
  let pairCount = 0;

  for (const emb1 of embeddings1) {
    for (const emb2 of embeddings2) {
      totalSimilarity += cosineSimilarity(emb1, emb2);
      pairCount++;
    }
  }

  return pairCount > 0 ? totalSimilarity / pairCount : 0;
}

// ── Aggregate Consistency Metrics ────────────────────────────────────

/**
 * Compute all consistency metrics across multiple runs.
 * Jaccard and positional overlap are computed between the first two runs
 * (pairwise). Distributional entropy is computed across all runs.
 * Semantic similarity is computed between the first two runs if possible.
 *
 * @param runs - Array of runs, each run being an array of canonicalized
 *   waypoints. Must contain at least 2 runs.
 * @returns Full ConsistencyMetrics object.
 */
export async function computeConsistencyMetrics(
  runs: string[][],
): Promise<ConsistencyMetrics> {
  if (runs.length < 2) {
    throw new Error("At least 2 runs are required to compute consistency metrics");
  }

  const [run1, run2] = runs;

  // Jaccard similarity (set-based, first two runs)
  const jaccard = computeJaccard(run1, run2);

  // Positional overlap (order-based, first two runs)
  const positionalOverlap = computePositionalOverlap(run1, run2);

  // Distributional entropy (across all runs)
  const distributionalEntropy = computeDistributionalEntropy(runs);

  // Semantic similarity (embedding-based, first two runs)
  // This may fail if OPENROUTER_API_KEY is not set; gracefully degrade.
  let semanticSimilarity: number | undefined;
  try {
    semanticSimilarity = await averageSemanticSimilarity(run1, run2);
  } catch {
    // Embedding call failed (missing API key, network error, etc.)
    // Leave semanticSimilarity as undefined.
  }

  return {
    jaccard,
    positionalOverlap,
    semanticSimilarity,
    distributionalEntropy,
  };
}
