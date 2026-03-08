# Appendix D: Prompt Templates

This appendix documents the exact prompt templates used for waypoint elicitation across the benchmark's 11 phases.

## D.1 Standard Elicitation Prompts

Two prompt formats were developed and evaluated during Phase 1 prompt selection. The semantic format was selected as the primary template based on higher extraction accuracy and more interpretable waypoints on the holdout set.

### Semantic Format (Primary)

```
Imagine walking through conceptual space from "{A}" to "{B}".
What {N} landmarks do you pass along the way?
List only the landmark concepts, one per line, numbered 1 through {N}.
Do not include the starting or ending concepts.
```

### Direct Format (Fallback)

```
List exactly {N} intermediate concepts that form a path from "{A}" to "{B}".
Respond with only the concepts, one per line, numbered 1 through {N}.
Do not include the starting or ending concepts.
```

The direct format was used as a fallback for models that produced unparseable outputs under the semantic prompt, notably during Phase 10A reliability probing of new models.

**Default parameters.** Unless otherwise noted: N = 7 waypoints, temperature = 0.7, 10--20 independent runs per (model, pair, direction) condition. Phases 1--2 used 20 runs; later phases standardized to 10 runs.

## D.2 Pre-Fill Elicitation Prompt

Introduced in Phase 7A for causal intervention experiments. The first waypoint is pre-specified, and the model generates the remaining N-1 waypoints.

```
The first intermediate concept between "{A}" and "{B}" is "{pre-fill}".
List exactly {N-1} more intermediate concepts that continue the path
from "{pre-fill}" to "{B}".
Respond with only the concepts, one per line, numbered 1 through {N-1}.
Do not include "{A}", "{pre-fill}", or "{B}" in your list.
```

With default parameters, N-1 = 6 (the pre-fill occupies position 1, and the model generates positions 2--7).

## D.3 System Prompt

All elicitations used the following system prompt:

```
You are a helpful assistant that provides single-word or short-phrase
responses representing conceptual landmarks.
```

This system prompt was consistent across all models and phases. No chain-of-thought or reasoning instructions were included; the waypoint task is presented as a direct generation task.

## D.4 API Configuration

All models were accessed via the OpenRouter API (`https://openrouter.ai/api/v1/chat/completions`) with the following parameters:

- `max_tokens`: 256
- `temperature`: 0.7 (default; varied in Phase 11C robustness analysis)
- `top_p`: 1.0
- `frequency_penalty`: 0
- `presence_penalty`: 0

Phase 10A introduced a `--patient` CLI flag that extended the request timeout from 60 seconds to 300 seconds, recovering 3 of 5 new models that failed the default timeout on OpenRouter latency.

## D.5 Response Parsing

Model responses were parsed using a multi-strategy extraction pipeline attempting, in order:

1. JSON array extraction
2. Numbered list parsing (e.g., "1. concept")
3. Bullet list parsing (e.g., "- concept")
4. Comma-separated value extraction
5. Arrow-separated extraction (recognizing `->`, `=>`, `-->`, `==>`)
6. Line-by-line fallback

After parsing, responses passed through the canonicalization pipeline (Section 2.3 of the main text): lowercase, article stripping, lemmatization via the compromise NLP library, and phrase normalization.

## D.6 Prompt Variations Across Phases

| Phase | Variation | Reason |
|-------|-----------|--------|
| 1 | Both formats tested on holdout pairs | Prompt format selection |
| 1--6 | Semantic format only | Standard elicitation |
| 7A--10B | Pre-fill variant added | Causal intervention |
| 10A | Direct format fallback for some models | Parse reliability |
| 11C | N varied (5, 7, 9); temperature varied (0.5, 0.7, 0.9) | Robustness analysis |

No other prompt variations were introduced. The consistency of the prompt template across 11 phases is a deliberate design choice supporting cross-phase comparability.
