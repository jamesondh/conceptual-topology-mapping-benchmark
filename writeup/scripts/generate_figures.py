#!/usr/bin/env python3
"""
Generate all 15 publication-quality figures for the Conceptual Topology paper.

Outputs both PDF and PNG for each figure to writeup/figures/.
Usage:
    python writeup/scripts/generate_figures.py
"""

import json
import sys
from collections import defaultdict
from pathlib import Path

import numpy as np

# ---------------------------------------------------------------------------
# Project imports
# ---------------------------------------------------------------------------
sys.path.insert(0, str(Path(__file__).resolve().parent))

from config import (
    ALL_MODELS,
    DATA_DIR,
    FIGURES_DIR,
    FIG_DPI,
    FIG_HEIGHT_DEFAULT,
    FIG_WIDTH_DOUBLE,
    FIG_WIDTH_SINGLE,
    FONT_SIZE_ANNOTATION,
    FONT_SIZE_LABEL,
    FONT_SIZE_TICK,
    FONT_SIZE_TITLE,
    MODEL_COLORS,
    MODEL_NAMES,
    MODEL_ORDER_BY_GAIT,
    MODEL_SCALE_APPROX,
    ORIGINAL_MODELS,
    PREDICTION_ACCURACY,
    setup_matplotlib,
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _save(fig, name, plt):
    """Save figure to both PDF and PNG, then close."""
    fig.savefig(FIGURES_DIR / f"{name}.pdf")
    fig.savefig(FIGURES_DIR / f"{name}.png")
    plt.close(fig)


# ===================================================================
# Fig 00 -- "Same Map, Different Routes" (placeholder)
# ===================================================================

def generate_fig00(manifest, plt):
    """Placeholder -- raw elicitation paths are not in the manifest."""
    print("  [SKIP] fig00-same-map-different-routes: "
          "raw path data not available in manifest; "
          "conceptual diagram best done manually or in TikZ.")


# ===================================================================
# Fig 01 -- Benchmark Overview Schematic (placeholder)
# ===================================================================

def generate_fig01(manifest, plt):
    """Placeholder -- best done in TikZ or manual design tool."""
    print("  [SKIP] fig01-benchmark-overview: "
          "schematic/design figure best produced in TikZ or Illustrator.")


# ===================================================================
# Fig 02 -- Gait Spectrum (horizontal bar chart, 12 models)
# ===================================================================

def generate_fig02(manifest, plt):
    data = manifest["fig02_gait_spectrum"]["perModel"]

    # Sort by gait, highest at top
    sorted_models = sorted(data.keys(), key=lambda m: data[m]["meanGait"])
    gaits = [data[m]["meanGait"] for m in sorted_models]
    colors = [MODEL_COLORS.get(m, "#888888") for m in sorted_models]
    labels = [MODEL_NAMES.get(m, m) for m in sorted_models]

    # CIs where available
    ci_lo = []
    ci_hi = []
    for m in sorted_models:
        ci = data[m].get("gaitCI")
        g = data[m]["meanGait"]
        if ci:
            ci_lo.append(g - ci[0])
            ci_hi.append(ci[1] - g)
        else:
            ci_lo.append(0)
            ci_hi.append(0)

    fig, ax = plt.subplots(figsize=(FIG_WIDTH_DOUBLE, FIG_HEIGHT_DEFAULT + 1.0))
    y_pos = np.arange(len(sorted_models))
    ax.barh(y_pos, gaits, color=colors, edgecolor="white", linewidth=0.5,
            xerr=[ci_lo, ci_hi], capsize=2, error_kw={"linewidth": 0.8})
    ax.set_yticks(y_pos)
    ax.set_yticklabels(labels)
    ax.set_xlabel("Mean Intra-Model Jaccard (Gait)")
    ax.set_title("Fig 2. Gait Spectrum Across 12 Models")
    ax.set_xlim(0, 1.0)

    # Annotate highest and lowest
    highest_model = sorted_models[-1]  # top of chart
    lowest_model = sorted_models[0]    # bottom of chart
    ax.annotate(f"{data[highest_model]['meanGait']:.3f}",
                xy=(data[highest_model]["meanGait"], len(sorted_models) - 1),
                xytext=(10, 0), textcoords="offset points",
                fontsize=FONT_SIZE_ANNOTATION, va="center",
                arrowprops=dict(arrowstyle="-", color="grey", lw=0.5))
    ax.annotate(f"{data[lowest_model]['meanGait']:.3f}",
                xy=(data[lowest_model]["meanGait"], 0),
                xytext=(10, 0), textcoords="offset points",
                fontsize=FONT_SIZE_ANNOTATION, va="center",
                arrowprops=dict(arrowstyle="-", color="grey", lw=0.5))

    fig.tight_layout()
    _save(fig, "fig02-gait-spectrum", plt)


# ===================================================================
# Fig 03 -- Gait Stability (line plot, 4 original models over phases)
# ===================================================================

def generate_fig03(manifest, plt):
    data = manifest["fig03_gait_stability"]["phases"]
    phase_labels = list(data.keys())       # phase1, phase10a, phase11a
    phase_display = [p.replace("phase", "P") for p in phase_labels]

    fig, ax = plt.subplots(figsize=(FIG_WIDTH_SINGLE, FIG_HEIGHT_DEFAULT))

    for model in ORIGINAL_MODELS:
        values = [data[phase].get(model) for phase in phase_labels]
        color = MODEL_COLORS.get(model, "#888888")
        ax.plot(phase_display, values, marker="o", label=MODEL_NAMES.get(model, model),
                color=color, linewidth=1.5, markersize=5)

    ax.set_xlabel("Phase")
    ax.set_ylabel("Mean Intra-Model Jaccard (Gait)")
    ax.set_title("Fig 3. Gait Stability Across Phases")
    ax.set_ylim(0, 1.0)
    ax.legend(fontsize=FONT_SIZE_TICK, loc="best", frameon=False)
    fig.tight_layout()
    _save(fig, "fig03-gait-stability", plt)


# ===================================================================
# Fig 04 -- Dual-Anchor U-Shape
# ===================================================================

def generate_fig04(manifest, plt):
    data = manifest["fig04_dual_anchor"]["byCategory"]

    # Paper specifies exactly 4 categories:
    # antonym (main experimental signal) and 3 control conditions
    experimental = ["antonym"]
    controls = ["control-identity", "control-random", "control-nonsense"]

    positions = np.arange(1, 6)

    fig, ax = plt.subplots(figsize=(FIG_WIDTH_DOUBLE, FIG_HEIGHT_DEFAULT))

    # Antonym: solid line, main signal
    if "antonym" in data:
        vals = data["antonym"]["perPositionMatchRate"]
        ax.plot(positions, vals, marker="o", label="Antonym",
                color="#7C3AED", linewidth=2.0, markersize=5)

    # Controls: dashed lines
    control_styles = {
        "control-identity": ("#10B981", "Identity"),
        "control-random": ("#F59E0B", "Random"),
        "control-nonsense": ("#EF4444", "Nonsense"),
    }
    for cat in controls:
        if cat in data:
            color, label = control_styles[cat]
            vals = data[cat]["perPositionMatchRate"]
            ax.plot(positions, vals, marker="s", linestyle="--",
                    label=label, color=color,
                    linewidth=1.0, markersize=3)

    ax.set_xlabel("Waypoint Position")
    ax.set_ylabel("Mirror-Match Rate")
    ax.set_title("Fig 4. Dual-Anchor Mirror Match by Position")
    ax.set_xticks(positions)
    ax.legend(fontsize=FONT_SIZE_TICK, loc="upper left", frameon=False)
    fig.tight_layout()
    _save(fig, "fig04-dual-anchor", plt)


# ===================================================================
# Fig 05 -- Asymmetry Distribution (histogram)
# ===================================================================

def generate_fig05(manifest, plt):
    entries = manifest["fig05_asymmetry"]["entries"]
    grand_mean = manifest["fig05_asymmetry"]["grandMean"]

    asym_vals = [e["asymmetryIndex"] for e in entries]

    fig, ax = plt.subplots(figsize=(FIG_WIDTH_DOUBLE, FIG_HEIGHT_DEFAULT))
    ax.hist(asym_vals, bins=25, color="#7C3AED", edgecolor="white",
            linewidth=0.5, alpha=0.85)
    ax.axvline(grand_mean, color="#EF4444", linestyle="--", linewidth=1.2)
    ax.annotate(f"Grand mean = {grand_mean:.3f}",
                xy=(grand_mean, ax.get_ylim()[1] * 0.92),
                xytext=(15, 0), textcoords="offset points",
                fontsize=FONT_SIZE_ANNOTATION, color="#EF4444",
                arrowprops=dict(arrowstyle="->", color="#EF4444", lw=0.8))
    ax.set_xlabel("Asymmetry Index")
    ax.set_ylabel("Count")
    ax.set_title("Fig 5. Distribution of Directional Asymmetry")
    fig.tight_layout()
    _save(fig, "fig05-asymmetry", plt)


# ===================================================================
# Fig 06 -- Compositional Structure (two-panel bar chart)
# ===================================================================

def generate_fig06(manifest, plt):
    entries = manifest["fig06_compositional"]["entries"]

    # Use tripleType field: "hierarchical" vs "random" only (skip "other")
    hier_trans = [e["waypointTransitivity"] for e in entries
                  if e.get("tripleType") == "hierarchical"]
    rand_trans = [e["waypointTransitivity"] for e in entries
                  if e.get("tripleType") == "random"]

    hier_bridge = [e["bridgeConceptFrequency"] for e in entries
                   if e.get("tripleType") == "hierarchical"]
    rand_bridge = [e["bridgeConceptFrequency"] for e in entries
                   if e.get("tripleType") == "random"]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(FIG_WIDTH_DOUBLE, FIG_HEIGHT_DEFAULT))

    # Left panel: transitivity
    cats = ["Hierarchical", "Random Control"]
    means_t = [np.mean(hier_trans), np.mean(rand_trans)]
    sems_t = [np.std(hier_trans) / np.sqrt(len(hier_trans)),
              np.std(rand_trans) / np.sqrt(len(rand_trans))]
    bars1 = ax1.bar(cats, means_t, yerr=sems_t, color=["#7C3AED", "#999999"],
                    edgecolor="white", capsize=4)
    ax1.set_ylabel("Waypoint Transitivity")
    ax1.set_title("Transitivity")

    # Right panel: bridge frequency
    means_b = [np.mean(hier_bridge), np.mean(rand_bridge)]
    sems_b = [np.std(hier_bridge) / np.sqrt(len(hier_bridge)),
              np.std(rand_bridge) / np.sqrt(len(rand_bridge))]
    bars2 = ax2.bar(cats, means_b, yerr=sems_b, color=["#10B981", "#999999"],
                    edgecolor="white", capsize=4)
    ax2.set_ylabel("Bridge Concept Frequency")
    ax2.set_title("Bridge Frequency")

    fig.suptitle("Fig 6. Compositional Structure: Hierarchical vs. Random",
                 fontsize=FONT_SIZE_TITLE)
    fig.tight_layout(rect=[0, 0, 1, 0.93])
    _save(fig, "fig06-compositional", plt)


# ===================================================================
# Fig 07 -- Bridge Taxonomy (2x2 grid)
# ===================================================================

def generate_fig07(manifest, plt):
    tax = manifest["fig07_bridge_taxonomy"]

    # 4 panels per paper outline:
    # Panel 1 (Bottleneck): spectrum, deposit, sentence frequencies per model
    # Panel 2 (Off-axis): metaphor, energy frequencies per model
    # Panel 3 (Process vs Object): germination vs plant per model
    # Panel 4 (Too-central): fire, water frequencies per model

    fig, axes = plt.subplots(2, 2, figsize=(FIG_WIDTH_DOUBLE, FIG_HEIGHT_DEFAULT * 1.6))

    # --- Panel 1: Bottleneck bridges ---
    ax1 = axes[0, 0]
    # Filter to specific bottleneck bridges: spectrum, deposit, sentence
    # sentence comes from cue-strength (word-sentence-paragraph)
    bottleneck_bridges = {"spectrum", "deposit", "river"}
    bottleneck_data = defaultdict(lambda: defaultdict(list))
    for e in tax.get("bottleneck", []):
        bridge = e.get("bridgeName", "")
        if bridge in bottleneck_bridges:
            bottleneck_data[bridge][e["modelId"]].append(e["bridgeConceptFrequency"])
    # Also add sentence from cue-strength
    for e in tax.get("cueStrength", []):
        if e.get("bridgeName") == "sentence":
            bottleneck_data["sentence"][e["modelId"]].append(e["bridgeConceptFrequency"])

    bridge_names_p1 = sorted(bottleneck_data.keys())
    models_p1 = [m for m in ORIGINAL_MODELS
                 if any(m in bottleneck_data[b] for b in bridge_names_p1)]
    x_p1 = np.arange(len(models_p1))
    width_p1 = 0.8 / max(len(bridge_names_p1), 1)
    colors_p1 = ["#7C3AED", "#10B981", "#F59E0B", "#EF4444"]
    for i, bridge in enumerate(bridge_names_p1):
        vals = [np.mean(bottleneck_data[bridge].get(m, [0])) for m in models_p1]
        ax1.bar(x_p1 + i * width_p1, vals, width_p1, label=bridge.capitalize(),
                color=colors_p1[i % len(colors_p1)], edgecolor="white", linewidth=0.5)
    ax1.set_xticks(x_p1 + width_p1 * (len(bridge_names_p1) - 1) / 2)
    ax1.set_xticklabels([MODEL_NAMES.get(m, m).split()[0] for m in models_p1],
                        fontsize=FONT_SIZE_TICK - 1)
    ax1.set_title("Bottleneck Bridges", fontsize=FONT_SIZE_LABEL)
    ax1.set_ylim(0, 1.05)
    ax1.set_ylabel("Bridge Freq.")
    ax1.legend(fontsize=FONT_SIZE_TICK - 2, frameon=False)

    # --- Panel 2: Off-axis associations ---
    ax2 = axes[0, 1]
    off_axis_bridges = {"metaphor", "chandelier", "calendar"}
    off_axis_data = defaultdict(lambda: defaultdict(list))
    for e in tax.get("offAxis", []):
        bridge = e.get("bridgeName", "")
        if bridge in off_axis_bridges:
            off_axis_data[bridge][e["modelId"]].append(e["bridgeConceptFrequency"])
    # Also check cue-strength for energy-related bridges
    # "energy" from hot-energy-cold is in transitivity, not cue-strength;
    # use what we have from off-axis targeted bridges
    bridge_names_p2 = sorted(off_axis_data.keys())
    models_p2 = [m for m in ORIGINAL_MODELS
                 if any(m in off_axis_data[b] for b in bridge_names_p2)]
    x_p2 = np.arange(len(models_p2))
    width_p2 = 0.8 / max(len(bridge_names_p2), 1)
    for i, bridge in enumerate(bridge_names_p2):
        vals = [np.mean(off_axis_data[bridge].get(m, [0])) for m in models_p2]
        ax2.bar(x_p2 + i * width_p2, vals, width_p2, label=bridge.capitalize(),
                color=colors_p1[i % len(colors_p1)], edgecolor="white", linewidth=0.5)
    ax2.set_xticks(x_p2 + width_p2 * (max(len(bridge_names_p2), 1) - 1) / 2)
    ax2.set_xticklabels([MODEL_NAMES.get(m, m).split()[0] for m in models_p2],
                        fontsize=FONT_SIZE_TICK - 1)
    ax2.set_title("Off-Axis Associations", fontsize=FONT_SIZE_LABEL)
    ax2.set_ylim(0, 1.05)
    ax2.set_ylabel("Bridge Freq.")
    ax2.legend(fontsize=FONT_SIZE_TICK - 2, frameon=False)

    # --- Panel 3: Process vs Object (germination vs plant) ---
    ax3 = axes[1, 0]
    process_bridges = {"germination", "plant"}
    process_data = defaultdict(lambda: defaultdict(list))
    for e in tax.get("cueStrength", []):
        bridge = e.get("bridgeName", "")
        if bridge in process_bridges:
            process_data[bridge][e["modelId"]].append(e["bridgeConceptFrequency"])
    bridge_names_p3 = sorted(process_data.keys())
    models_p3 = [m for m in ORIGINAL_MODELS
                 if any(m in process_data[b] for b in bridge_names_p3)]
    x_p3 = np.arange(len(models_p3))
    width_p3 = 0.8 / max(len(bridge_names_p3), 1)
    for i, bridge in enumerate(bridge_names_p3):
        vals = [np.mean(process_data[bridge].get(m, [0])) for m in models_p3]
        ax3.bar(x_p3 + i * width_p3, vals, width_p3, label=bridge.capitalize(),
                color=colors_p1[i % len(colors_p1)], edgecolor="white", linewidth=0.5)
    ax3.set_xticks(x_p3 + width_p3 * (max(len(bridge_names_p3), 1) - 1) / 2)
    ax3.set_xticklabels([MODEL_NAMES.get(m, m).split()[0] for m in models_p3],
                        fontsize=FONT_SIZE_TICK - 1)
    ax3.set_title("Process vs. Object", fontsize=FONT_SIZE_LABEL)
    ax3.set_ylim(0, 1.05)
    ax3.set_ylabel("Bridge Freq.")
    ax3.legend(fontsize=FONT_SIZE_TICK - 2, frameon=False)

    # --- Panel 4: Too-central (fire, water) ---
    ax4 = axes[1, 1]
    tc_bridges = {"fire", "water"}
    tc_data = defaultdict(lambda: defaultdict(list))
    for e in tax.get("tooCentral", []):
        bridge = e.get("candidateBridge", "")
        if bridge in tc_bridges:
            tc_data[bridge][e["modelId"]].append(e["bridgeFrequency"])
    bridge_names_p4 = sorted(tc_data.keys())
    models_p4 = [m for m in ORIGINAL_MODELS
                 if any(m in tc_data[b] for b in bridge_names_p4)]
    x_p4 = np.arange(len(models_p4))
    width_p4 = 0.8 / max(len(bridge_names_p4), 1)
    for i, bridge in enumerate(bridge_names_p4):
        vals = [np.mean(tc_data[bridge].get(m, [0])) for m in models_p4]
        ax4.bar(x_p4 + i * width_p4, vals, width_p4, label=bridge.capitalize(),
                color=colors_p1[i % len(colors_p1)], edgecolor="white", linewidth=0.5)
    ax4.set_xticks(x_p4 + width_p4 * (max(len(bridge_names_p4), 1) - 1) / 2)
    ax4.set_xticklabels([MODEL_NAMES.get(m, m).split()[0] for m in models_p4],
                        fontsize=FONT_SIZE_TICK - 1)
    ax4.set_title("Too-Central", fontsize=FONT_SIZE_LABEL)
    ax4.set_ylim(0, 1.05)
    ax4.set_ylabel("Bridge Freq.")
    ax4.legend(fontsize=FONT_SIZE_TICK - 2, frameon=False)

    fig.suptitle("Fig 7. Bridge Taxonomy: Frequency by Category",
                 fontsize=FONT_SIZE_TITLE)
    fig.tight_layout(rect=[0, 0, 1, 0.93])
    _save(fig, "fig07-bridge-taxonomy", plt)


# ===================================================================
# Fig 08 -- Bridge Position Profiles (heatmap)
# ===================================================================

def generate_fig08(manifest, plt):
    import matplotlib.colors as mcolors

    profiles = manifest["fig08_bridge_positions"]["profiles"]

    # Group by pair+model; we want each row = pair-model combo
    row_labels = []
    heatmap_data = []
    for p in profiles:
        label = f"{p['pairId'].replace('p6c-','')} ({p['modelId']})"
        row_labels.append(label)
        freqs = p["perPositionBridgeFreq"]
        heatmap_data.append(freqs)

    # Determine max number of positions (should be 7)
    max_pos = max(len(row) for row in heatmap_data)
    # Pad shorter rows
    for i in range(len(heatmap_data)):
        while len(heatmap_data[i]) < max_pos:
            heatmap_data[i].append(0)

    mat = np.array(heatmap_data)

    fig, ax = plt.subplots(figsize=(FIG_WIDTH_DOUBLE, max(FIG_HEIGHT_DEFAULT,
                                                           len(row_labels) * 0.28)))
    cmap = plt.cm.YlOrRd
    im = ax.imshow(mat, aspect="auto", cmap=cmap, vmin=0, vmax=1)

    ax.set_xticks(range(max_pos))
    ax.set_xticklabels([f"Pos {i + 1}" for i in range(max_pos)], fontsize=FONT_SIZE_TICK - 1)
    ax.set_yticks(range(len(row_labels)))
    ax.set_yticklabels(row_labels, fontsize=FONT_SIZE_TICK - 2)
    ax.set_xlabel("Waypoint Position")
    ax.set_title("Fig 8. Bridge Position Profiles", fontsize=FONT_SIZE_TITLE)

    cbar = fig.colorbar(im, ax=ax, fraction=0.03, pad=0.02)
    cbar.set_label("Bridge Frequency")

    fig.tight_layout()
    _save(fig, "fig08-bridge-positions", plt)


# ===================================================================
# Fig 09 -- Pre-Fill Displacement (grouped bar chart)
# ===================================================================

def generate_fig09(manifest, plt):
    entries = manifest["fig09_prefill_displacement"]["entries"]

    # Group by pair+model, show unconstrained vs mean of pre-fill conditions
    pair_model_data = defaultdict(lambda: {"unconstrained": 0, "prefill": []})
    for e in entries:
        key = (e["pairId"], e["modelId"])
        if e["condition"] == "unconstrained":
            pair_model_data[key]["unconstrained"] = e["bridgeFrequency"]
        else:
            pair_model_data[key]["prefill"].append(e["bridgeFrequency"])

    # Aggregate across models for each pair
    pair_agg = defaultdict(lambda: {"unconstrained": [], "prefill_mean": []})
    for (pair_id, model_id), vals in pair_model_data.items():
        pf_mean = np.mean(vals["prefill"]) if vals["prefill"] else 0
        pair_agg[pair_id]["unconstrained"].append(vals["unconstrained"])
        pair_agg[pair_id]["prefill_mean"].append(pf_mean)

    pairs = sorted(pair_agg.keys())
    pair_labels = [p.replace("p7a-", "") for p in pairs]
    unc_means = [np.mean(pair_agg[p]["unconstrained"]) for p in pairs]
    pf_means = [np.mean(pair_agg[p]["prefill_mean"]) for p in pairs]

    x = np.arange(len(pairs))
    width = 0.35

    fig, ax = plt.subplots(figsize=(FIG_WIDTH_DOUBLE, FIG_HEIGHT_DEFAULT))
    ax.bar(x - width / 2, unc_means, width, label="Unconstrained",
           color="#7C3AED", edgecolor="white")
    ax.bar(x + width / 2, pf_means, width, label="Pre-filled (mean)",
           color="#F59E0B", edgecolor="white")

    ax.set_xticks(x)
    ax.set_xticklabels(pair_labels, rotation=25, ha="right",
                       fontsize=FONT_SIZE_TICK - 1)
    ax.set_ylabel("Bridge Frequency")
    ax.set_title("Fig 9. Pre-Fill Displacement Effect")
    ax.legend(fontsize=FONT_SIZE_TICK, frameon=False)
    ax.set_ylim(0, 1.1)
    fig.tight_layout()
    _save(fig, "fig09-prefill-displacement", plt)


# ===================================================================
# Fig 10 -- Relation Class Survival (boxplot)
# ===================================================================

def generate_fig10(manifest, plt):
    entries = manifest["fig10_relation_class"]["entries"]

    # Group survival rates by condition class
    class_vals = defaultdict(list)
    for e in entries:
        sr = e["survivalRate"]
        if sr is not None:
            # Clamp to [0,1] (some > 1 due to denominator rounding)
            class_vals[e["condition"]].append(min(sr, 1.0))

    class_order = ["unrelated", "on-axis", "same-domain"]
    box_data = [class_vals.get(c, []) for c in class_order]
    class_display = [c.replace("-", " ").title() for c in class_order]

    fig, ax = plt.subplots(figsize=(FIG_WIDTH_SINGLE, FIG_HEIGHT_DEFAULT))
    bp = ax.boxplot(box_data, tick_labels=class_display, patch_artist=True,
                    widths=0.5, showfliers=True)

    palette = ["#EF4444", "#F59E0B", "#10B981"]
    for patch, color in zip(bp["boxes"], palette):
        patch.set_facecolor(color)
        patch.set_alpha(0.6)

    ax.set_ylabel("Bridge Survival Rate")
    ax.set_title("Fig 10. Survival by Relation Class")
    ax.annotate("Friedman $p = 0.034$", xy=(0.98, 0.98),
                xycoords="axes fraction", ha="right", va="top",
                fontsize=FONT_SIZE_ANNOTATION,
                bbox=dict(boxstyle="round,pad=0.3", fc="lightyellow",
                          ec="grey", lw=0.5))
    fig.tight_layout()
    _save(fig, "fig10-relation-class", plt)


# ===================================================================
# Fig 11 -- Prediction Accuracy Descent (line plot)
# ===================================================================

def generate_fig11(manifest, plt):
    entries = manifest["fig11_prediction_accuracy"]["entries"]

    phases = [e["phase"] for e in entries]
    pcts = [e["pct"] for e in entries]

    fig, ax = plt.subplots(figsize=(FIG_WIDTH_DOUBLE, FIG_HEIGHT_DEFAULT))
    ax.plot(phases, pcts, marker="o", color="#7C3AED", linewidth=1.8, markersize=6)

    # Reference lines
    for ref, lbl, clr in [(80, "80%", "#10B981"), (50, "50%", "#F59E0B"),
                           (20, "20%", "#EF4444")]:
        ax.axhline(ref, color=clr, linestyle=":", linewidth=0.8, alpha=0.7)
        ax.text(phases[-1] + 0.3, ref, lbl, fontsize=FONT_SIZE_ANNOTATION,
                color=clr, va="center")

    ax.set_xlabel("Phase")
    ax.set_ylabel("Prediction Accuracy (%)")
    ax.set_title("Fig 11. Prediction Accuracy Across Phases")
    ax.set_xticks(phases)
    ax.set_ylim(0, 100)
    fig.tight_layout()
    _save(fig, "fig11-prediction-accuracy", plt)


# ===================================================================
# Fig 12 -- 12-Model Gait & Asymmetry (two-panel)
# ===================================================================

def generate_fig12(manifest, plt):
    data = manifest["fig12_gait_asymmetry"]["perModel"]

    models = MODEL_ORDER_BY_GAIT
    gaits = [data[m]["gait"] for m in models]
    asyms = [data[m]["asymmetry"] for m in models]
    colors = [MODEL_COLORS.get(m, "#888") for m in models]
    labels = [MODEL_NAMES.get(m, m).split()[0] for m in models]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(FIG_WIDTH_DOUBLE, FIG_HEIGHT_DEFAULT + 0.5))

    # Left: gait
    x = np.arange(len(models))
    ax1.bar(x, gaits, color=colors, edgecolor="white", linewidth=0.5)
    ax1.set_xticks(x)
    ax1.set_xticklabels(labels, rotation=45, ha="right", fontsize=FONT_SIZE_TICK - 1)
    ax1.set_ylabel("Mean Gait (Jaccard)")
    ax1.set_title("Gait")
    ax1.set_ylim(0, 1.0)

    # Right: asymmetry
    ax2.bar(x, asyms, color=colors, edgecolor="white", linewidth=0.5)
    ax2.axhline(0.60, color="#EF4444", linestyle="--", linewidth=1.0, label="0.60 threshold")
    ax2.set_xticks(x)
    ax2.set_xticklabels(labels, rotation=45, ha="right", fontsize=FONT_SIZE_TICK - 1)
    ax2.set_ylabel("Mean Asymmetry Index")
    ax2.set_title("Asymmetry")
    ax2.set_ylim(0, 1.0)
    ax2.legend(fontsize=FONT_SIZE_TICK - 1, frameon=False)

    fig.suptitle("Fig 12. Gait and Asymmetry Across 12 Models",
                 fontsize=FONT_SIZE_TITLE)
    fig.tight_layout(rect=[0, 0, 1, 0.93])
    _save(fig, "fig12-gait-asymmetry", plt)


# ===================================================================
# Fig 13 -- Scale Effect (scatterplot)
# ===================================================================

def generate_fig13(manifest, plt):
    data = manifest["fig13_scale_effect"]["perModel"]

    fig, ax = plt.subplots(figsize=(FIG_WIDTH_SINGLE, FIG_HEIGHT_DEFAULT))

    for m, v in data.items():
        scale = v["scaleApprox"]
        bridge = v["meanBridgeFreq"]
        color = MODEL_COLORS.get(m, "#888")
        label_short = MODEL_NAMES.get(m, m).split()[0]
        ax.scatter(scale, bridge, color=color, s=60, zorder=3, edgecolors="white",
                   linewidth=0.5)
        # Label each point
        offset_x, offset_y = 8, 4
        if m == "llama":
            offset_x, offset_y = 8, -12  # special offset for outlier
        ax.annotate(label_short, (scale, bridge),
                    xytext=(offset_x, offset_y), textcoords="offset points",
                    fontsize=FONT_SIZE_ANNOTATION, color=color)

    ax.set_xscale("log")
    ax.set_xlabel("Approximate Model Scale (B params, log)")
    ax.set_ylabel("Mean Bridge Frequency")
    ax.set_title("Fig 13. Scale vs. Bridge Frequency")
    ax.set_ylim(-0.05, 1.05)

    # Highlight Llama 8B outlier
    if "llama" in data:
        llama = data["llama"]
        ax.annotate("Llama 8B\n(outlier)",
                    xy=(llama["scaleApprox"], llama["meanBridgeFreq"]),
                    xytext=(-50, 30), textcoords="offset points",
                    fontsize=FONT_SIZE_ANNOTATION,
                    arrowprops=dict(arrowstyle="->", color="#6B7280", lw=0.8),
                    color="#6B7280",
                    bbox=dict(boxstyle="round,pad=0.2", fc="lightyellow",
                              ec="grey", lw=0.5))

    fig.tight_layout()
    _save(fig, "fig13-scale-effect", plt)


# ===================================================================
# Fig 14 -- Robustness Heatmap (conditions x metrics)
# ===================================================================

def generate_fig14(manifest, plt):
    cell_entries = manifest["fig14_robustness"]["cellEntries"]

    # Aggregate per condition: mean gait (intraModelJaccard) and
    # mean bridgeFrequency (excluding null)
    cond_gait = defaultdict(list)
    cond_bridge = defaultdict(list)

    for e in cell_entries:
        cl = e["conditionLabel"]
        if e["intraModelJaccard"] is not None:
            cond_gait[cl].append(e["intraModelJaccard"])
        if e["bridgeFrequency"] is not None:
            cond_bridge[cl].append(e["bridgeFrequency"])

    # Also get asymmetry data if present
    asym_entries = manifest["fig14_robustness"].get("asymmetryEntries", [])
    cond_asym = defaultdict(list)
    for e in asym_entries:
        cl = e["conditionLabel"]
        if e["asymmetryIndex"] is not None:
            cond_asym[cl].append(e["asymmetryIndex"])

    # Condition ordering
    conditions = sorted(cond_gait.keys(),
                        key=lambda c: (int(c.split("wp")[0]),
                                       float(c.split("t")[1])))

    metric_names = ["Gait (Jaccard)", "Bridge Freq."]
    mat_rows = []
    mat_rows.append([np.mean(cond_gait[c]) for c in conditions])
    mat_rows.append([np.mean(cond_bridge[c]) if cond_bridge[c] else 0
                     for c in conditions])
    if cond_asym:
        metric_names.append("Asymmetry")
        mat_rows.append([np.mean(cond_asym[c]) if cond_asym[c] else 0
                         for c in conditions])

    mat = np.array(mat_rows)

    fig, ax = plt.subplots(figsize=(FIG_WIDTH_DOUBLE, 2.0 + 0.5 * len(metric_names)))
    im = ax.imshow(mat, aspect="auto", cmap=plt.cm.YlGnBu, vmin=0, vmax=1)

    ax.set_xticks(range(len(conditions)))
    ax.set_xticklabels(conditions, fontsize=FONT_SIZE_TICK, rotation=30, ha="right")
    ax.set_yticks(range(len(metric_names)))
    ax.set_yticklabels(metric_names, fontsize=FONT_SIZE_TICK)

    # Annotate cells
    for i in range(len(metric_names)):
        for j in range(len(conditions)):
            val = mat[i, j]
            text_color = "white" if val > 0.6 else "black"
            ax.text(j, i, f"{val:.2f}", ha="center", va="center",
                    fontsize=FONT_SIZE_ANNOTATION, color=text_color)

    ax.set_title("Fig 14. Robustness Across Parameter Conditions",
                 fontsize=FONT_SIZE_TITLE)
    cbar = fig.colorbar(im, ax=ax, fraction=0.04, pad=0.02)
    cbar.set_label("Metric Value")
    fig.tight_layout()
    _save(fig, "fig14-robustness", plt)


# ===================================================================
# Main
# ===================================================================

ALL_GENERATORS = [
    generate_fig00,
    generate_fig01,
    generate_fig02,
    generate_fig03,
    generate_fig04,
    generate_fig05,
    generate_fig06,
    generate_fig07,
    generate_fig08,
    generate_fig09,
    generate_fig10,
    generate_fig11,
    generate_fig12,
    generate_fig13,
    generate_fig14,
]


def main():
    plt = setup_matplotlib()

    manifest_path = DATA_DIR / "paper_manifest.json"
    if not manifest_path.exists():
        print(f"ERROR: manifest not found at {manifest_path}")
        sys.exit(1)

    with open(manifest_path) as f:
        manifest = json.load(f)

    print(f"Loaded manifest with {len(manifest)} figure datasets.")
    print(f"Output directory: {FIGURES_DIR}\n")

    success = 0
    skipped = 0
    failed = 0

    for fig_func in ALL_GENERATORS:
        name = fig_func.__name__
        try:
            fig_func(manifest, plt)
            # Check if it was a skip (no file produced)
            if name in ("generate_fig00", "generate_fig01"):
                skipped += 1
            else:
                success += 1
                print(f"  Generated {name}")
        except Exception as e:
            failed += 1
            print(f"  FAILED {name}: {e}")
            import traceback
            traceback.print_exc()

    print(f"\nDone: {success} generated, {skipped} skipped, {failed} failed.")


if __name__ == "__main__":
    main()
