#!/usr/bin/env python3
"""
Generate all 8 LaTeX tables for the Conceptual Topology Mapping paper.

Reads data from writeup/data/paper_manifest.json and outputs .tex files
(LaTeX tabular environments) to writeup/tables/.
"""

import json
import sys
import statistics
from pathlib import Path

# Add project root to path for config import
sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import TABLES_DIR, DATA_DIR, MODEL_NAMES


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def escape_latex(text):
    """Escape LaTeX special characters in text content."""
    if text is None:
        return "---"
    text = str(text)
    # Order matters: ampersand first, then others
    text = text.replace("&", "\\&")
    text = text.replace("%", "\\%")
    text = text.replace("#", "\\#")
    text = text.replace("_", "\\_")
    text = text.replace("~", "\\textasciitilde{}")
    text = text.replace("^", "\\textasciicircum{}")
    return text


def write_table(filename, content):
    """Write a .tex file to TABLES_DIR."""
    path = TABLES_DIR / filename
    path.write_text(content, encoding="utf-8")


# ---------------------------------------------------------------------------
# Table 0: Headline Claims at a Glance
# ---------------------------------------------------------------------------

def generate_table00(manifest):
    """Generate Table 0: Headline Claims at a Glance."""
    claims = manifest["table00_claims"]["claims"]

    rows = []
    for c in claims:
        row = (
            f"    {escape_latex(c['id'])} & "
            f"{escape_latex(c['claim'])} & "
            f"{escape_latex(c['tier'])} & "
            f"{escape_latex(c['models'])} & "
            f"{escape_latex(c['statistic'])} & "
            f"{escape_latex(c['qualification'])} \\\\"
        )
        rows.append(row)

    body = "\n".join(rows)

    tex = (
        "\\begin{table}[t]\n"
        "\\centering\n"
        "\\caption{Headline claims at a glance.}\n"
        "\\label{tab:claims}\n"
        "\\small\n"
        "\\begin{tabular}{l p{3.0cm} l l p{4.5cm} p{4.5cm}}\n"
        "\\toprule\n"
        "ID & Claim & Tier & Models/Phases & Core Statistic & Key Qualification \\\\\n"
        "\\midrule\n"
        f"{body}\n"
        "\\bottomrule\n"
        "\\end{tabular}\n"
        "\\end{table}\n"
    )

    write_table("table00_claims.tex", tex)


# ---------------------------------------------------------------------------
# Table 1: Metric Definitions
# ---------------------------------------------------------------------------

def _format_symbol(sym):
    """Format a metric symbol for LaTeX math mode.

    Converts e.g. 'J_intra' -> '$J_{\\text{intra}}$',
    'f_bridge' -> '$f_{\\text{bridge}}$', 'Delta_f' -> '$\\Delta_f$'.
    """
    # Handle special symbols
    sym = sym.replace("Delta", "\\Delta")

    # Convert underscore-separated parts to proper subscripts
    if "_" in sym:
        parts = sym.split("_", 1)
        base = parts[0]
        sub = parts[1]
        # Short single-letter subscripts stay as-is; longer ones get \text{}
        if len(sub) > 1 and not sub.startswith("\\"):
            return f"${base}_{{\\text{{{sub}}}}}$"
        else:
            return f"${base}_{{{sub}}}$"
    return f"${sym}$"


def _format_range(rng):
    """Format a range string for LaTeX math mode."""
    # Replace 'inf' with proper LaTeX infinity (order matters: -inf before inf)
    rng = rng.replace("-inf", "-INFTY_PLACEHOLDER")
    rng = rng.replace("inf", "\\infty")
    rng = rng.replace("-INFTY_PLACEHOLDER", "-\\infty")
    # Handle trailing text like "per position" outside math mode
    if " per " in rng:
        math_part, text_part = rng.split(" per ", 1)
        return f"${math_part}$ per {text_part}"
    return f"${rng}$"


def generate_table01(manifest):
    """Generate Table 1: Metric Definitions."""
    metrics = manifest["table01_metrics"]["metrics"]

    rows = []
    for m in metrics:
        symbol = _format_symbol(m["symbol"])
        range_str = _format_range(m["range"])
        row = (
            f"    {escape_latex(m['name'])} ({symbol}) & "
            f"{escape_latex(m['definition'])} & "
            f"{range_str} & "
            f"{escape_latex(m['interpretation'])} \\\\"
        )
        rows.append(row)

    body = "\n".join(rows)

    tex = (
        "\\begin{table}[t]\n"
        "\\centering\n"
        "\\caption{Metric definitions.}\n"
        "\\label{tab:metrics}\n"
        "\\small\n"
        "\\begin{tabular}{l p{5.0cm} c p{4.0cm}}\n"
        "\\toprule\n"
        "Metric & Formal Definition & Range & Interpretation \\\\\n"
        "\\midrule\n"
        f"{body}\n"
        "\\bottomrule\n"
        "\\end{tabular}\n"
        "\\end{table}\n"
    )

    write_table("table01_metrics.tex", tex)


# ---------------------------------------------------------------------------
# Table 2: Model Summary
# ---------------------------------------------------------------------------

def generate_table02(manifest):
    """Generate Table 2: Model Summary. Sorted by cohort then alphabetically."""
    models = manifest["table02_models"]["models"]

    # Sort by cohort order, then alphabetically by display name
    cohort_order = {"original": 0, "phase10": 1, "phase11": 2}
    models_sorted = sorted(
        models,
        key=lambda m: (cohort_order.get(m["cohort"], 99), m["displayName"])
    )

    rows = []
    prev_cohort = None
    for m in models_sorted:
        # Add a midrule between cohorts
        if prev_cohort is not None and m["cohort"] != prev_cohort:
            rows.append("    \\midrule")
        prev_cohort = m["cohort"]

        scale_str = m["scaleLabel"]
        if m["scaleLabel"] == "frontier":
            scale_str = f"frontier ($\\sim${m['scaleApprox']}B)"
        elif m["scaleLabel"] == "8B":
            scale_str = "8B"

        row = (
            f"    {escape_latex(m['displayName'])} & "
            f"{escape_latex(m['provider'])} & "
            f"{scale_str} & "
            f"{m['totalRuns']:,} & "
            f"{escape_latex(m['phases'])} \\\\"
        )
        rows.append(row)

    body = "\n".join(rows)

    tex = (
        "\\begin{table}[t]\n"
        "\\centering\n"
        "\\caption{Model summary.}\n"
        "\\label{tab:models}\n"
        "\\small\n"
        "\\begin{tabular}{llcrl}\n"
        "\\toprule\n"
        "Model & Provider & Approx.\\ Scale & Total Runs & Phases Included \\\\\n"
        "\\midrule\n"
        f"{body}\n"
        "\\bottomrule\n"
        "\\end{tabular}\n"
        "\\end{table}\n"
    )

    write_table("table02_models.tex", tex)


# ---------------------------------------------------------------------------
# Table 3: Phase Summary
# ---------------------------------------------------------------------------

def generate_table03(manifest):
    """Generate Table 3: Phase Summary. Keep findings concise (max ~60 chars)."""
    phases = manifest["table03_phases"]["phases"]

    rows = []
    for p in phases:
        finding = p["finding"]
        # Truncate if over 60 chars
        if len(finding) > 65:
            finding = finding[:62] + "..."

        row = (
            f"    {escape_latex(p['phase'])} & "
            f"{escape_latex(p['name'])} & "
            f"{p['newRuns']:,} & "
            f"{escape_latex(p['keyQuestion'])} & "
            f"{escape_latex(finding)} \\\\"
        )
        rows.append(row)

    body = "\n".join(rows)

    tex = (
        "\\begin{table}[t]\n"
        "\\centering\n"
        "\\caption{Phase summary.}\n"
        "\\label{tab:phases}\n"
        "\\small\n"
        "\\begin{tabular}{cl r p{4.0cm} p{5.0cm}}\n"
        "\\toprule\n"
        "Phase & Name & New Runs & Key Question & Primary Finding \\\\\n"
        "\\midrule\n"
        f"{body}\n"
        "\\bottomrule\n"
        "\\end{tabular}\n"
        "\\end{table}\n"
    )

    write_table("table03_phases.tex", tex)


# ---------------------------------------------------------------------------
# Table 4: Triangle Inequality Replication
# ---------------------------------------------------------------------------

def generate_table04(manifest):
    """Generate Table 4: Triangle Inequality Replication.

    Compute mean excess and 95% CI from the individual entries for each phase.
    """
    data = manifest["table04_triangle"]

    phase_labels = [
        ("phase3B", "3B"),
        ("phase4B", "4B"),
        ("phase7B", "7B"),
    ]

    rows = []
    for key, label in phase_labels:
        phase_data = data[key]
        n_total = phase_data["total"]
        n_holding = phase_data["holds"]
        pct = phase_data["rate"] * 100

        # The field name varies: phase3B and phase4B use "slack", phase7B uses "excess"
        excesses = []
        for entry in phase_data["entries"]:
            val = entry.get("excess", entry.get("slack"))
            if val is not None:
                excesses.append(val)

        mean_excess = statistics.mean(excesses) if excesses else 0.0
        n = len(excesses)
        if n > 1:
            sd = statistics.stdev(excesses)
            se = sd / (n ** 0.5)
            ci_lo = mean_excess - 1.96 * se
            ci_hi = mean_excess + 1.96 * se
            ci_str = f"[{ci_lo:.3f}, {ci_hi:.3f}]"
        else:
            ci_str = "---"

        row = (
            f"    {label} & "
            f"{n_total} & "
            f"{pct:.1f}\\% & "
            f"{mean_excess:.3f} & "
            f"{ci_str} \\\\"
        )
        rows.append(row)

    body = "\n".join(rows)

    tex = (
        "\\begin{table}[t]\n"
        "\\centering\n"
        "\\caption{Triangle inequality replication across phases.}\n"
        "\\label{tab:triangle}\n"
        "\\small\n"
        "\\begin{tabular}{lcccc}\n"
        "\\toprule\n"
        "Phase & $N$ Triangles & \\% Holding & Mean Excess & 95\\% CI \\\\\n"
        "\\midrule\n"
        f"{body}\n"
        "\\bottomrule\n"
        "\\end{tabular}\n"
        "\\end{table}\n"
    )

    write_table("table04_triangle.tex", tex)


# ---------------------------------------------------------------------------
# Table 5: Hypothesis Outcomes
# ---------------------------------------------------------------------------

def generate_table05(manifest):
    """Generate Table 5: Hypothesis Outcomes (G20-G27)."""
    hypotheses = manifest["table05_hypotheses"]["hypotheses"]

    rows = []
    for h in hypotheses:
        # Mark G26 as "Resurrected" clearly
        outcome_str = h["outcome"]
        if h.get("resurrected"):
            outcome_str = "\\textbf{resurrected}"
        elif outcome_str == "dead":
            outcome_str = "dead"
        elif outcome_str == "partial":
            outcome_str = "partial"

        row = (
            f"    {escape_latex(h['id'])} & "
            f"{escape_latex(h['name'])} & "
            f"{h['phase']} & "
            f"{escape_latex(h['predicted'])} & "
            f"{escape_latex(h['observed'])} & "
            f"{outcome_str} \\\\"
        )
        rows.append(row)

    body = "\n".join(rows)

    tex = (
        "\\begin{table}[t]\n"
        "\\centering\n"
        "\\caption{Hypothesis outcomes.}\n"
        "\\label{tab:hypotheses}\n"
        "\\small\n"
        "\\begin{tabular}{cl c p{3.5cm} p{3.8cm} l}\n"
        "\\toprule\n"
        "\\# & Hypothesis & Phase & Predicted & Observed & Outcome \\\\\n"
        "\\midrule\n"
        f"{body}\n"
        "\\bottomrule\n"
        "\\end{tabular}\n"
        "\\end{table}\n"
    )

    write_table("table05_hypotheses.tex", tex)


# ---------------------------------------------------------------------------
# Table 6: ANOVA Results
# ---------------------------------------------------------------------------

def generate_table06(manifest):
    """Generate Table 6: ANOVA Results for bridge frequency robustness."""
    effects = manifest["table06_anova"]["effects"]

    # Reorder: model identity first, then waypoint, temperature, interaction
    order = {
        "Model": 0,
        "Waypoint Count": 1,
        "Temperature": 2,
        "Waypoint x Temperature Interaction": 3,
    }
    effects_sorted = sorted(effects, key=lambda e: order.get(e["effect"], 99))

    rows = []
    for e in effects_sorted:
        eta_sq = e["fStatistic"]  # stored as eta-squared in the manifest
        p_val = e["pValue"]

        # Format p-value
        if p_val < 0.001:
            p_str = "$< 0.001$"
        else:
            p_str = f"${p_val:.3f}$"

        # Significance marker
        sig_str = "$*$" if e["significant"] else ""

        row = (
            f"    {escape_latex(e['effect'])} & "
            f"${eta_sq:.4f}$ & "
            f"{p_str} {sig_str} \\\\"
        )
        rows.append(row)

    body = "\n".join(rows)

    tex = (
        "\\begin{table}[t]\n"
        "\\centering\n"
        "\\caption{ANOVA results for bridge frequency across protocol conditions.}\n"
        "\\label{tab:anova}\n"
        "\\small\n"
        "\\begin{tabular}{lcc}\n"
        "\\toprule\n"
        "Factor & $\\eta^2$ & Approx.\\ $p$-value \\\\\n"
        "\\midrule\n"
        f"{body}\n"
        "\\bottomrule\n"
        "\\end{tabular}\n"
        "\\end{table}\n"
    )

    write_table("table06_anova.tex", tex)


# ---------------------------------------------------------------------------
# Table 7: Control Pair Screening
# ---------------------------------------------------------------------------

def generate_table07(manifest):
    """Generate Table 7: Control Pair Screening.

    Two sub-tables:
    (a) Stapler-monsoon retrospective across 12 models (from 11b-control-revision.json)
    (b) New candidates across 6 screening models
    """
    t7 = manifest["table07_control"]

    # --- Sub-table (a): stapler-monsoon retrospective ---
    # Use dedicated retrospective data from 11b-control-revision.json
    sm_rows = []
    retrospective = t7.get("retrospective", [])
    if retrospective:
        for entry in retrospective:
            mid = entry["modelId"]
            display = MODEL_NAMES.get(mid, mid)
            top_wp = entry.get("topWaypoint", "---")
            top_freq = entry.get("topFrequency")
            entropy = entry.get("entropy")
            passes_r5 = entry.get("passesR5", False)

            freq_str = f"{top_freq:.3f}" if top_freq is not None else "---"
            entropy_str = f"{entropy:.2f}" if entropy is not None else "---"
            pass_str = "pass" if passes_r5 else "fail"

            sm_rows.append(
                f"    {escape_latex(display)} & "
                f"{escape_latex(top_wp)} & "
                f"{freq_str} & "
                f"{entropy_str} & "
                f"{pass_str} \\\\"
            )

    # --- Sub-table (b): new candidates ---
    candidate_rows = []
    for cs in t7["candidateSummary"]:
        cid = cs["candidateId"]
        # Clean up candidate ID for display
        pair_name = cid.replace("p11b-", "").replace("-", " / ")

        # Get per-model details
        entries = [e for e in t7["screeningResults"] if e["candidateId"] == cid]

        # Find most common top waypoint
        top_wps = [e["topWaypoint"] for e in entries]
        most_common_wp = sorted(set(top_wps), key=lambda x: (-top_wps.count(x), x))[0]

        mean_freq = cs["meanTopFrequency"]
        pass_count = cs["passCount"]
        total = cs["totalModels"]
        status = f"{pass_count}/{total} pass"

        candidate_rows.append(
            f"    {escape_latex(pair_name)} & "
            f"{escape_latex(most_common_wp)} & "
            f"{mean_freq:.2f} & "
            f"{status} \\\\"
        )

    # Build the combined table
    # Panel (a) has 5 columns; panel (b) has 4 columns.  Use 5-column layout.
    part_a = ""
    if sm_rows:
        part_a = (
            "    \\multicolumn{5}{l}"
            "{\\textbf{(a) Stapler--monsoon retrospective (12 models)}} \\\\\n"
            "    \\midrule\n"
            "    Model & Top Waypoint & Top Freq & Entropy & Status \\\\\n"
            "    \\midrule\n"
            + "\n".join(sm_rows) + "\n"
            "    \\midrule\n"
        )

    part_b_header = (
        "    \\multicolumn{5}{l}"
        "{\\textbf{(b) New control-pair candidates (6 screening models)}} \\\\\n"
        "    \\midrule\n"
        "    Pair & Top Waypoint & Mean Top Freq & Status & \\\\\n"
        "    \\midrule\n"
    )

    tex = (
        "\\begin{table}[t]\n"
        "\\centering\n"
        "\\caption{Control pair screening.}\n"
        "\\label{tab:control}\n"
        "\\small\n"
        "\\begin{tabular}{llccc}\n"
        "\\toprule\n"
        f"{part_a}"
        f"{part_b_header}"
        + "\n".join(candidate_rows) + "\n"
        "\\bottomrule\n"
        "\\end{tabular}\n"
        "\\end{table}\n"
    )

    write_table("table07_control.tex", tex)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    """Generate all tables from the paper manifest."""
    manifest_path = DATA_DIR / "paper_manifest.json"
    if not manifest_path.exists():
        print(f"ERROR: Manifest not found at {manifest_path}")
        sys.exit(1)

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    print("Generating tables...")

    table_funcs = [
        generate_table00,
        generate_table01,
        generate_table02,
        generate_table03,
        generate_table04,
        generate_table05,
        generate_table06,
        generate_table07,
    ]

    for table_func in table_funcs:
        try:
            table_func(manifest)
            print(f"  Generated {table_func.__name__}")
        except Exception as e:
            print(f"  FAILED {table_func.__name__}: {e}")
            import traceback
            traceback.print_exc()

    print("Done.")


if __name__ == "__main__":
    main()
