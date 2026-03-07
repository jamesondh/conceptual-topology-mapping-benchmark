"""
Shared configuration for paper figure and table generation.
Model registry, color palettes, style constants, and path configuration.
"""

import os
from pathlib import Path

# === Paths ===
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
RESULTS_DIR = PROJECT_ROOT / "results"
ANALYSIS_DIR = RESULTS_DIR / "analysis"
FIGURES_DIR = PROJECT_ROOT / "writeup" / "figures"
TABLES_DIR = PROJECT_ROOT / "writeup" / "tables"
DATA_DIR = PROJECT_ROOT / "writeup" / "data"
FINDINGS_DIR = PROJECT_ROOT / "findings"
PLANNING_DIR = PROJECT_ROOT / ".planning"

# Ensure output directories exist
FIGURES_DIR.mkdir(parents=True, exist_ok=True)
TABLES_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

# === Model Registry ===
# Canonical model registry -- IDs must match src/data/pairs.ts and analysis JSONs exactly.
# Format: id -> (display_name, provider, cohort, approx_scale, color)
MODEL_REGISTRY = {
    "claude":   ("Claude Sonnet 4.6",   "Anthropic",  "original", "frontier", "#7C3AED"),
    "gpt":      ("GPT-5.2",             "OpenAI",     "original", "frontier", "#10B981"),
    "grok":     ("Grok 4.1 Fast",       "xAI",        "original", "frontier", "#3B82F6"),
    "gemini":   ("Gemini 3 Flash",      "Google",     "original", "frontier", "#F59E0B"),
    "minimax":  ("MiniMax M2.5",        "MiniMax",    "phase10",  "frontier", "#EC4899"),
    "kimi":     ("Kimi K2.5",           "Moonshot",   "phase10",  "frontier", "#14B8A6"),
    "qwen":     ("Qwen 3.5 397B-A17B",  "Alibaba",    "phase10",  "frontier", "#EF4444"),
    "llama":    ("Llama 3.1 8B",        "Meta",       "phase10",  "8B",       "#6B7280"),
    "deepseek": ("DeepSeek V3.2",       "DeepSeek",   "phase11",  "frontier", "#8B5CF6"),
    "mistral":  ("Mistral Large 3",     "Mistral",    "phase11",  "frontier", "#F97316"),
    "cohere":   ("Cohere Command A",    "Cohere",     "phase11",  "frontier", "#06B6D4"),
    "llama4":   ("Llama 4 Maverick",    "Meta",       "phase11",  "frontier", "#6366F1"),
}

# Approximate parameter counts for scale plot (Fig 13).
# These are best-effort estimates; most frontier models do not disclose exact counts.
MODEL_SCALE_APPROX = {
    "claude":   200,   # Frontier, ~200B estimated
    "gpt":      300,   # Frontier, ~300B estimated
    "grok":     300,   # Frontier, ~300B estimated
    "gemini":   200,   # Frontier, ~200B estimated (Flash variant)
    "minimax":  200,   # Frontier, ~200B estimated
    "kimi":     200,   # Frontier, ~200B estimated
    "qwen":     397,   # MoE: 397B total, 17B active
    "llama":    8,     # Llama 3.1 8B -- confirmed
    "deepseek": 671,   # MoE: 671B total, estimated
    "mistral":  200,   # Frontier, ~200B estimated
    "cohere":   200,   # Frontier, ~200B estimated
    "llama4":   400,   # MoE: ~400B estimated
}

# Derived convenience dicts
MODEL_COLORS = {k: v[4] for k, v in MODEL_REGISTRY.items()}
MODEL_NAMES = {k: v[0] for k, v in MODEL_REGISTRY.items()}
MODEL_PROVIDERS = {k: v[1] for k, v in MODEL_REGISTRY.items()}
MODEL_COHORTS = {k: v[2] for k, v in MODEL_REGISTRY.items()}

# Canonical model ordering (by gait, high to low)
MODEL_ORDER_BY_GAIT = [
    "mistral", "claude", "deepseek", "llama4", "qwen", "cohere",
    "minimax", "kimi", "gemini", "llama", "grok", "gpt"
]

# Original 4 models (used in phases 1-9)
ORIGINAL_MODELS = ["claude", "gpt", "grok", "gemini"]

# All 12 models
ALL_MODELS = list(MODEL_REGISTRY.keys())

# === Typography ===
FONT_FAMILY = "serif"
FONT_SIZE_TITLE = 12
FONT_SIZE_LABEL = 10
FONT_SIZE_TICK = 8
FONT_SIZE_ANNOTATION = 8

# === Figure Sizing (inches, NeurIPS style) ===
FIG_WIDTH_SINGLE = 3.25
FIG_WIDTH_DOUBLE = 6.75
FIG_HEIGHT_DEFAULT = 3.5
FIG_DPI = 300

# === Prediction accuracy per phase (hardcoded from findings) ===
PREDICTION_ACCURACY = {
    4:  {"confirmed": 13, "total": 16, "pct": 81.3},
    5:  {"confirmed": 6,  "total": 14, "pct": 42.9},
    6:  {"confirmed": 7,  "total": 14, "pct": 50.0},
    7:  {"confirmed": 6,  "total": 14, "pct": 42.9},
    8:  {"confirmed": 6,  "total": 25, "pct": 24.0},
    9:  {"confirmed": 5,  "total": 25, "pct": 20.0},
    10: {"confirmed": 9,  "total": 18, "pct": 50.0},
    11: {"confirmed": 8,  "total": 18, "pct": 44.4},
}

# === Run counts per model (approximate, from STATE.md and phase summaries) ===
MODEL_RUN_COUNTS = {
    "claude":   {"total": 5200, "phases": "1-11"},
    "gpt":      {"total": 5200, "phases": "1-11"},
    "grok":     {"total": 4800, "phases": "1-11"},
    "gemini":   {"total": 4800, "phases": "1-11"},
    "minimax":  {"total": 540,  "phases": "10A-11B"},
    "kimi":     {"total": 540,  "phases": "10A-11B"},
    "qwen":     {"total": 540,  "phases": "10A-11B"},
    "llama":    {"total": 540,  "phases": "10A-11B"},
    "deepseek": {"total": 540,  "phases": "11A-11C"},
    "mistral":  {"total": 360,  "phases": "11A-11B"},
    "cohere":   {"total": 360,  "phases": "11A-11B"},
    "llama4":   {"total": 360,  "phases": "11A-11B"},
}


def setup_matplotlib():
    """Configure matplotlib for publication-quality output."""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    plt.rcParams.update({
        "font.family": FONT_FAMILY,
        "font.size": FONT_SIZE_LABEL,
        "axes.titlesize": FONT_SIZE_TITLE,
        "axes.labelsize": FONT_SIZE_LABEL,
        "xtick.labelsize": FONT_SIZE_TICK,
        "ytick.labelsize": FONT_SIZE_TICK,
        "legend.fontsize": FONT_SIZE_TICK,
        "figure.dpi": FIG_DPI,
        "savefig.dpi": FIG_DPI,
        "savefig.bbox": "tight",
        "savefig.pad_inches": 0.05,
        "axes.spines.top": False,
        "axes.spines.right": False,
        "pdf.fonttype": 42,  # TrueType fonts in PDF (for editability)
        "ps.fonttype": 42,
    })
    return plt
