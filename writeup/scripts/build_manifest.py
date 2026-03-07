#!/usr/bin/env python3
"""
Build the unified paper manifest from analysis JSON files.

Reads all 26 analysis JSONs from results/analysis/ and produces a single
writeup/data/paper_manifest.json containing pre-extracted data for every
figure and table in the paper.

Usage:
    python writeup/scripts/build_manifest.py
"""

import json
import sys
from collections import defaultdict
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
ANALYSIS_DIR = PROJECT_ROOT / "results" / "analysis"
DATA_DIR = PROJECT_ROOT / "writeup" / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
MANIFEST_PATH = DATA_DIR / "paper_manifest.json"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_json(filename: str) -> dict:
    """Load a JSON file from the analysis directory."""
    path = ANALYSIS_DIR / filename
    if not path.exists():
        print(f"  WARNING: {filename} not found, skipping")
        return {}
    with open(path, "r") as f:
        return json.load(f)


def safe_mean(values: list) -> float | None:
    """Compute mean of a list, returning None for empty lists."""
    nums = [v for v in values if v is not None]
    if not nums:
        return None
    return sum(nums) / len(nums)


def is_control_pair(pair_id: str) -> bool:
    """Return True if pair_id is a control condition."""
    return pair_id.startswith("control-")


def is_experimental_pair(pair_id: str) -> bool:
    """Return True if pair_id is an experimental (non-control) condition."""
    return not is_control_pair(pair_id)


def pair_category(pair_id: str) -> str:
    """Extract the category prefix from a pair_id."""
    # e.g. "antonym-hot-cold" -> "antonym"
    # e.g. "control-identity-apple" -> "control-identity"
    # e.g. "control-random-flamingo-calculus" -> "control-random"
    # e.g. "control-nonsense-xkplm-qrvzt" -> "control-nonsense"
    if pair_id.startswith("control-identity"):
        return "control-identity"
    if pair_id.startswith("control-nonsense"):
        return "control-nonsense"
    if pair_id.startswith("control-random"):
        return "control-random"
    return pair_id.split("-")[0]


# ---------------------------------------------------------------------------
# Figure extractors
# ---------------------------------------------------------------------------

def build_fig02_gait_spectrum() -> dict:
    """Mean Jaccard (gait) per model across all 12 models."""
    print("  fig02_gait_spectrum ...")

    result = {}

    # --- Original 4 models from pilot-metrics.json ---
    pilot = load_json("pilot-metrics.json")
    if pilot:
        model_jaccards = defaultdict(list)
        for cm in pilot.get("conditionMetrics", []):
            key = cm["key"]
            if key["waypointCount"] != 5:
                continue
            if key["promptFormat"] != "semantic":
                continue
            pair_id = key["pairId"]
            if is_control_pair(pair_id):
                continue
            model_jaccards[key["model"]].append(cm["avgJaccard"])

        for model_id, vals in model_jaccards.items():
            result[model_id] = {
                "meanGait": safe_mean(vals),
                "pairCount": len(vals),
                "source": "pilot-metrics.json",
            }

    # --- Phase 10A models from 10a-model-generality.json ---
    # The 10a gaitProfiles contain canonical gait values for the original 4
    # models (e.g. Claude 0.578) which are the authoritative reference values
    # cited throughout the paper.  These override the pilot-metrics averages
    # (which include anchor pairs and produce higher numbers).
    gen10a = load_json("10a-model-generality.json")
    if gen10a:
        for gp in gen10a.get("gaitProfiles", []):
            mid = gp["modelId"]
            if gp.get("isNewModel", False):
                result[mid] = {
                    "meanGait": gp["meanIntraModelJaccard"],
                    "gaitCI": gp.get("jaccardCI"),
                    "source": "10a-model-generality.json",
                }
            else:
                # Canonical gait for original 4 -- overrides pilot average
                result[mid] = {
                    "meanGait": gp["meanIntraModelJaccard"],
                    "source": "10a-model-generality.json (canonical)",
                }

    # --- Phase 11A models from 11a-expanded-generality.json ---
    gen11a = load_json("11a-expanded-generality.json")
    if gen11a:
        for gp in gen11a.get("gaitProfiles", []):
            mid = gp["modelId"]
            if gp.get("isNewModel", False):
                result[mid] = {
                    "meanGait": gp["meanIntraModelJaccard"],
                    "gaitCI": gp.get("jaccardCI"),
                    "source": "11a-expanded-generality.json",
                }

    return {"perModel": result}


def build_fig03_gait_stability() -> dict:
    """Per-phase gait for the 4 core models across phases.

    We extract from:
    - pilot-metrics.json (Phase 1, w5 semantic)
    - 10a-model-generality.json (Phase 10A, original model gaits)
    - 11a-expanded-generality.json (Phase 11A, original model gaits)
    """
    print("  fig03_gait_stability ...")

    phases = {}

    # Phase 1 from pilot-metrics
    pilot = load_json("pilot-metrics.json")
    if pilot:
        model_jaccards = defaultdict(list)
        for cm in pilot.get("conditionMetrics", []):
            key = cm["key"]
            if key["waypointCount"] != 5 or key["promptFormat"] != "semantic":
                continue
            if is_control_pair(key["pairId"]):
                continue
            model_jaccards[key["model"]].append(cm["avgJaccard"])
        phase1 = {}
        for mid, vals in model_jaccards.items():
            phase1[mid] = safe_mean(vals)
        phases["phase1"] = phase1

    # Phase 10A from 10a-model-generality (original model gaits carried forward)
    gen10a = load_json("10a-model-generality.json")
    if gen10a:
        phase10a = {}
        for gp in gen10a.get("gaitProfiles", []):
            if not gp.get("isNewModel", False):
                phase10a[gp["modelId"]] = gp["meanIntraModelJaccard"]
        phases["phase10a"] = phase10a

    # Phase 11A
    gen11a = load_json("11a-expanded-generality.json")
    if gen11a:
        phase11a = {}
        for gp in gen11a.get("gaitProfiles", []):
            if not gp.get("isNewModel", False):
                phase11a[gp["modelId"]] = gp["meanIntraModelJaccard"]
        phases["phase11a"] = phase11a

    return {"phases": phases}


def build_fig04_dual_anchor() -> dict:
    """Per-position match rates from positional-convergence.json, grouped by pair category."""
    print("  fig04_dual_anchor ...")

    data = load_json("positional-convergence.json")
    if not data:
        return {}

    # Group by category
    category_positions = defaultdict(lambda: defaultdict(list))
    for pm in data.get("pairModelMetrics", []):
        cat = pair_category(pm["pairId"])
        rates = pm.get("perPositionMatchRate", [])
        for i, r in enumerate(rates):
            category_positions[cat][i].append(r)

    result = {}
    for cat, pos_dict in sorted(category_positions.items()):
        n_positions = max(pos_dict.keys()) + 1
        avg_rates = []
        for i in range(n_positions):
            avg_rates.append(safe_mean(pos_dict.get(i, [])))
        result[cat] = {"perPositionMatchRate": avg_rates}

    return {"byCategory": result}


def build_fig05_asymmetry() -> dict:
    """Asymmetry index values from reversal-metrics.json, ALL pairs including controls."""
    print("  fig05_asymmetry ...")

    data = load_json("reversal-metrics.json")
    if not data:
        return {}

    per_model = defaultdict(list)
    all_values = []
    entries = []

    for pm in data.get("pairModelMetrics", []):
        ai = pm.get("asymmetryIndex")
        if ai is not None:
            per_model[pm["modelId"]].append(ai)
            all_values.append(ai)
            entries.append({
                "pairId": pm["pairId"],
                "modelId": pm["modelId"],
                "asymmetryIndex": ai,
                "asymmetryCI": pm.get("asymmetryIndexCI"),
                "pValue": pm.get("permutationPValue"),
            })

    model_means = {}
    for mid, vals in per_model.items():
        model_means[mid] = safe_mean(vals)

    return {
        "entries": entries,
        "perModelMean": model_means,
        "grandMean": safe_mean(all_values),
    }


def classify_triple(triple_id: str) -> str:
    """Classify a triple as 'hierarchical', 'random', or 'other'.

    Hierarchical: taxonomic/hierarchical bridges (animal-dog-poodle,
    emotion-nostalgia-melancholy, music-harmony-mathematics).
    Random controls: stapler or flamingo bridges (music-stapler-mathematics,
    hot-flamingo-cold).
    Other: everything else (hot-energy-cold, beyonce-justice-erosion,
    bank-river-ocean).
    """
    HIERARCHICAL_IDS = {
        "triple-animal-dog-poodle",
        "triple-emotion-nostalgia-melancholy",
        "triple-music-harmony-mathematics",
    }
    RANDOM_IDS = {
        "triple-music-stapler-mathematics",
        "triple-hot-flamingo-cold",
    }
    if triple_id in HIERARCHICAL_IDS:
        return "hierarchical"
    if triple_id in RANDOM_IDS:
        return "random"
    return "other"


def build_fig06_compositional() -> dict:
    """Transitivity and bridge frequency from transitivity-metrics.json."""
    print("  fig06_compositional ...")

    data = load_json("transitivity-metrics.json")
    if not data:
        return {}

    entries = []
    for tm in data.get("tripleModelMetrics", []):
        tid = tm["tripleId"]
        triple_type = classify_triple(tid)
        entries.append({
            "tripleId": tid,
            "modelId": tm["modelId"],
            "waypointTransitivity": tm.get("waypointTransitivity"),
            "bridgeConceptFrequency": tm.get("bridgeConceptFrequency"),
            "bridgeConceptAppears": tm.get("bridgeConceptAppears"),
            "triangleInequalityHolds": tm.get("triangleInequalityHolds"),
            "triangleSlack": tm.get("triangleSlack"),
            "tripleType": triple_type,
            # Keep isControl for backward compatibility
            "isControl": triple_type == "random",
        })

    return {"entries": entries}


def build_fig07_bridge_taxonomy() -> dict:
    """Bridge taxonomy data from targeted-bridges, cue-strength, and too-central.

    Four panels:
    1. Bottleneck bridges (spectrum, deposit, sentence) from targeted-bridges
    2. Off-axis associations (metaphor, energy) from targeted-bridges
    3. Process vs object (germination vs plant) from cue-strength
    4. Too-central (fire, water) from too-central
    """
    print("  fig07_bridge_taxonomy ...")

    result = {}

    # --- Targeted bridges: split into bottleneck vs off-axis ---
    # Bottleneck: spectrum, deposit (+ other high-frequency bridges)
    # Off-axis: metaphor, chandelier, calendar (associative but not navigational)
    BOTTLENECK_BRIDGES = {"spectrum", "deposit", "forest"}
    OFF_AXIS_BRIDGES = {"metaphor", "chandelier", "calendar", "nostalgia"}
    targeted = load_json("targeted-bridges-metrics.json")
    if targeted:
        bottleneck = []
        off_axis = []
        for tm in targeted.get("tripleModelMetrics", []):
            entry = {
                "tripleId": tm["tripleId"],
                "modelId": tm["modelId"],
                "bridgeConceptFrequency": tm.get("bridgeConceptFrequency"),
                "bridgeConceptAppears": tm.get("bridgeConceptAppears"),
                "waypointTransitivity": tm.get("waypointTransitivity"),
            }
            # Extract bridge name from tripleId: e.g. p4-light-spectrum-color -> spectrum
            parts = tm["tripleId"].split("-")
            bridge_name = parts[2] if len(parts) >= 4 else ""
            entry["bridgeName"] = bridge_name
            if bridge_name in BOTTLENECK_BRIDGES:
                bottleneck.append(entry)
            elif bridge_name in OFF_AXIS_BRIDGES:
                off_axis.append(entry)
            else:
                # Include river as bottleneck (bank-river-ocean)
                bottleneck.append(entry)
        result["bottleneck"] = bottleneck
        result["offAxis"] = off_axis

    # --- Cue strength (process vs object) ---
    cue = load_json("cue-strength-metrics.json")
    if cue:
        cue_entries = []
        for tm in cue.get("tripleModelMetrics", []):
            # Extract bridge name from tripleId: e.g. p5a-seed-germination-garden -> germination
            parts = tm["tripleId"].split("-")
            bridge_name = parts[2] if len(parts) >= 4 else ""
            cue_entries.append({
                "tripleId": tm["tripleId"],
                "modelId": tm["modelId"],
                "bridgeConceptFrequency": tm.get("bridgeConceptFrequency"),
                "bridgeConceptAppears": tm.get("bridgeConceptAppears"),
                "bridgeName": bridge_name,
            })
        result["cueStrength"] = cue_entries

    # --- Too-central ---
    too_central = load_json("too-central-metrics.json")
    if too_central:
        tc_entries = []
        for entry in too_central.get("pairModelBridgeFreqs", []):
            tc_entries.append({
                "pairId": entry["pairId"],
                "modelId": entry["modelId"],
                "category": entry.get("category"),
                "candidateBridge": entry.get("candidateBridge"),
                "bridgeFrequency": entry.get("bridgeFrequency"),
                "bridgeFrequencyCI": entry.get("bridgeFrequencyCI"),
            })
        result["tooCentral"] = tc_entries

    return result


def build_fig08_bridge_positions() -> dict:
    """Bridge positional profiles from positional-metrics.json."""
    print("  fig08_bridge_positions ...")

    data = load_json("positional-metrics.json")
    if not data:
        return {}

    profiles = []
    for p in data.get("profiles", []):
        profiles.append({
            "pairId": p["pairId"],
            "modelId": p["modelId"],
            "knownBridge": p.get("knownBridge"),
            "perPositionBridgeFreq": p.get("perPositionBridgeFreq"),
            "modalPosition": p.get("modalPosition"),
            "modalFrequency": p.get("modalFrequency"),
            "peakDetectionContrast": p.get("peakDetectionContrast"),
        })

    return {"profiles": profiles}


def build_fig09_prefill_displacement() -> dict:
    """Pre-fill displacement data from anchoring-metrics.json."""
    print("  fig09_prefill_displacement ...")

    data = load_json("anchoring-metrics.json")
    if not data:
        return {}

    entries = []
    for pm in data.get("pairModelConditionMetrics", []):
        entries.append({
            "pairId": pm["pairId"],
            "modelId": pm["modelId"],
            "condition": pm["condition"],
            "bridgeFrequency": pm.get("bridgeFrequency"),
            "bridgeFrequencyCI": pm.get("bridgeFrequencyCI"),
            "modalBridgePosition": pm.get("modalBridgePosition"),
            "meanBridgePosition": pm.get("meanBridgePosition"),
        })

    # Compute per-pair displacement: unconstrained vs each other condition
    displacement = defaultdict(lambda: defaultdict(dict))
    for e in entries:
        key = (e["pairId"], e["modelId"])
        displacement[key][e["condition"]] = e["bridgeFrequency"]

    displacement_summary = []
    for (pair_id, model_id), cond_map in displacement.items():
        unconstrained = cond_map.get("unconstrained")
        if unconstrained is None:
            continue
        for cond in ["incongruent", "congruent", "neutral"]:
            bf = cond_map.get(cond)
            if bf is not None:
                displacement_summary.append({
                    "pairId": pair_id,
                    "modelId": model_id,
                    "condition": cond,
                    "unconstrainedBridgeFreq": unconstrained,
                    "conditionBridgeFreq": bf,
                    "delta": bf - unconstrained if unconstrained is not None else None,
                })

    return {
        "entries": entries,
        "displacementSummary": displacement_summary,
    }


def build_fig10_relation_class() -> dict:
    """Relation class survival data from 10b-relation-classes.json."""
    print("  fig10_relation_class ...")

    data = load_json("10b-relation-classes.json")
    if not data:
        return {}

    entries = []
    for sm in data.get("survivalMatrix", []):
        entries.append({
            "pairId": sm["pairId"],
            "modelId": sm["modelId"],
            "condition": sm["condition"],
            "unconstrainedBridgeFreq": sm.get("unconstrainedBridgeFreq"),
            "preFillBridgeFreq": sm.get("preFillBridgeFreq"),
            "survivalRate": sm.get("survivalRate"),
        })

    # Aggregate by condition
    condition_survival = defaultdict(list)
    for e in entries:
        sr = e.get("survivalRate")
        if sr is not None:
            condition_survival[e["condition"]].append(sr)

    condition_means = {}
    for cond, vals in condition_survival.items():
        condition_means[cond] = safe_mean(vals)

    return {
        "entries": entries,
        "conditionMeans": condition_means,
    }


def build_fig11_prediction_accuracy() -> dict:
    """Prediction accuracy per phase -- hardcoded from config.py."""
    print("  fig11_prediction_accuracy ...")

    # Import directly from config rather than duplicating
    sys.path.insert(0, str(PROJECT_ROOT / "writeup" / "scripts"))
    from config import PREDICTION_ACCURACY

    entries = []
    for phase, vals in sorted(PREDICTION_ACCURACY.items()):
        entries.append({
            "phase": phase,
            "confirmed": vals["confirmed"],
            "total": vals["total"],
            "pct": vals["pct"],
        })

    return {"entries": entries}


def build_fig12_gait_asymmetry() -> dict:
    """Combined gait and asymmetry per model for the 12-model scatter.

    Gait comes from fig02 data.
    Asymmetry:
    - Original 4: mean asymmetryIndex from reversal-metrics.json
    - Phase 10A: perModelAsymmetry from 10a-model-generality.json
    - Phase 11A: perModelAsymmetry from 11a-expanded-generality.json
    """
    print("  fig12_gait_asymmetry ...")

    # --- Gait (reuse fig02 logic) ---
    gait_data = build_fig02_gait_spectrum()
    gait_per_model = gait_data.get("perModel", {})

    # --- Asymmetry for original 4 from reversal-metrics ---
    reversal = load_json("reversal-metrics.json")
    asym_per_model = {}
    if reversal:
        model_vals = defaultdict(list)
        for pm in reversal.get("pairModelMetrics", []):
            if is_control_pair(pm["pairId"]):
                continue
            ai = pm.get("asymmetryIndex")
            if ai is not None:
                model_vals[pm["modelId"]].append(ai)
        for mid, vals in model_vals.items():
            asym_per_model[mid] = safe_mean(vals)

    # --- Phase 10A asymmetry ---
    gen10a = load_json("10a-model-generality.json")
    if gen10a:
        for entry in gen10a.get("perModelAsymmetry", []):
            asym_per_model[entry["modelId"]] = entry["meanAsymmetry"]

    # --- Phase 11A asymmetry ---
    gen11a = load_json("11a-expanded-generality.json")
    if gen11a:
        for entry in gen11a.get("perModelAsymmetry", []):
            asym_per_model[entry["modelId"]] = entry["meanAsymmetry"]

    # Combine
    combined = {}
    all_model_ids = set(list(gait_per_model.keys()) + list(asym_per_model.keys()))
    for mid in sorted(all_model_ids):
        combined[mid] = {
            "gait": gait_per_model.get(mid, {}).get("meanGait") if mid in gait_per_model else None,
            "asymmetry": asym_per_model.get(mid),
        }

    return {"perModel": combined}


def build_fig13_scale_effect() -> dict:
    """Bridge frequency per model for scale plot.

    Original 4: mean bridgeConceptFrequency from transitivity-metrics.json
    across hierarchical triples (not random controls).
    Phase 10A/11A: from bridgeFrequencyMatrix in their respective JSONs.
    """
    print("  fig13_scale_effect ...")

    bridge_per_model = {}

    # --- Original 4 from transitivity-metrics.json ---
    trans = load_json("transitivity-metrics.json")
    if trans:
        model_bf = defaultdict(list)
        for tm in trans.get("tripleModelMetrics", []):
            tid = tm["tripleId"]
            # Exclude random controls (stapler, flamingo)
            if "stapler" in tid or "flamingo" in tid:
                continue
            bf = tm.get("bridgeConceptFrequency")
            if bf is not None:
                model_bf[tm["modelId"]].append(bf)
        for mid, vals in model_bf.items():
            bridge_per_model[mid] = {
                "meanBridgeFreq": safe_mean(vals),
                "source": "transitivity-metrics.json",
            }

    # --- Phase 10A models from bridgeFrequencyMatrix ---
    gen10a = load_json("10a-model-generality.json")
    if gen10a:
        model_bf = defaultdict(list)
        for entry in gen10a.get("bridgeFrequencyMatrix", []):
            bf = entry.get("bridgeFrequency")
            if bf is not None:
                model_bf[entry["modelId"]].append(bf)
        for mid, vals in model_bf.items():
            if mid not in bridge_per_model:
                bridge_per_model[mid] = {
                    "meanBridgeFreq": safe_mean(vals),
                    "source": "10a-model-generality.json",
                }

    # --- Phase 11A models from bridgeFrequencyMatrix ---
    gen11a = load_json("11a-expanded-generality.json")
    if gen11a:
        model_bf = defaultdict(list)
        for entry in gen11a.get("bridgeFrequencyMatrix", []):
            bf = entry.get("bridgeFrequency")
            if bf is not None:
                model_bf[entry["modelId"]].append(bf)
        for mid, vals in model_bf.items():
            if mid not in bridge_per_model:
                bridge_per_model[mid] = {
                    "meanBridgeFreq": safe_mean(vals),
                    "source": "11a-expanded-generality.json",
                }

    # Add scale info from config
    sys.path.insert(0, str(PROJECT_ROOT / "writeup" / "scripts"))
    from config import MODEL_SCALE_APPROX

    for mid in bridge_per_model:
        bridge_per_model[mid]["scaleApprox"] = MODEL_SCALE_APPROX.get(mid)

    return {"perModel": bridge_per_model}


def build_fig14_robustness() -> dict:
    """Robustness data from 11c-robustness.json.

    Per-condition gait (intraModelJaccard), bridgeFrequency, and asymmetry.
    """
    print("  fig14_robustness ...")

    data = load_json("11c-robustness.json")
    if not data:
        return {}

    # Cell results (gait and bridge frequency per condition)
    cell_entries = []
    for cr in data.get("cellResults", []):
        cell_entries.append({
            "conditionLabel": cr["conditionLabel"],
            "waypoints": cr["waypoints"],
            "temperature": cr["temperature"],
            "pairId": cr["pairId"],
            "modelId": cr["modelId"],
            "intraModelJaccard": cr.get("intraModelJaccard"),
            "bridgeFrequency": cr.get("bridgeFrequency"),
        })

    # Asymmetry robustness
    asym_entries = []
    for ar in data.get("asymmetryRobustness", []):
        asym_entries.append({
            "modelId": ar["modelId"],
            "conditionLabel": ar["conditionLabel"],
            "pairLabel": ar.get("pairLabel"),
            "asymmetryIndex": ar.get("asymmetryIndex"),
            "asymmetryCI": ar.get("asymmetryCI"),
        })

    # Aggregate per condition
    condition_gait = defaultdict(list)
    condition_bridge = defaultdict(list)
    for cr in data.get("cellResults", []):
        label = cr["conditionLabel"]
        j = cr.get("intraModelJaccard")
        bf = cr.get("bridgeFrequency")
        if j is not None:
            condition_gait[label].append(j)
        if bf is not None:
            condition_bridge[label].append(bf)

    condition_means = {}
    for label in sorted(set(list(condition_gait.keys()) + list(condition_bridge.keys()))):
        condition_means[label] = {
            "meanGait": safe_mean(condition_gait.get(label, [])),
            "meanBridgeFreq": safe_mean(condition_bridge.get(label, [])),
        }

    # Asymmetry aggregated per condition
    condition_asym = defaultdict(list)
    for ar in data.get("asymmetryRobustness", []):
        ai = ar.get("asymmetryIndex")
        if ai is not None:
            condition_asym[ar["conditionLabel"]].append(ai)
    for label, vals in condition_asym.items():
        if label in condition_means:
            condition_means[label]["meanAsymmetry"] = safe_mean(vals)

    # ANOVA interaction
    anova = data.get("anovaInteraction", {})

    # Predictions
    predictions = data.get("predictions", [])

    return {
        "cellEntries": cell_entries,
        "asymmetryEntries": asym_entries,
        "conditionMeans": condition_means,
        "anovaInteraction": anova,
        "predictions": predictions,
        "waypointScaling": data.get("waypointScaling", {}),
    }


# ---------------------------------------------------------------------------
# Table extractors
# ---------------------------------------------------------------------------

def build_table00_claims() -> dict:
    """Hardcoded claims registry: R1-R7, selected O claims."""
    print("  table00_claims ...")

    claims = [
        {
            "id": "R1",
            "claim": "Models have distinct, stable conceptual gaits",
            "tier": "robust",
            "models": "12 models, 11 families",
            "phases": "1-11",
            "statistic": "Claude 0.578, GPT 0.258; 2.2x gap stable across 9,500+ runs",
            "qualification": "Gait rank order not perfectly preserved across protocol conditions (Kendall W = 0.840)",
        },
        {
            "id": "R2",
            "claim": "Conceptual navigation is fundamentally asymmetric (quasimetric)",
            "tier": "robust",
            "models": "12 models",
            "phases": "2, 3B, 10A, 11A, 11C",
            "statistic": "Mean asymmetry 0.811; 87% significant (p < 0.05); triangle inequality holds 91%",
            "qualification": "Detectability resolution-dependent: falls below 0.60 threshold at 5 waypoints",
        },
        {
            "id": "R3",
            "claim": "Polysemy sense differentiation is genuine",
            "tier": "robust",
            "models": "4 original",
            "phases": "1, 2, 5B",
            "statistic": "Cross-pair Jaccard 0.011-0.062 for bank/bat/crane",
            "qualification": None,
        },
        {
            "id": "R4",
            "claim": "Hierarchical paths are compositional",
            "tier": "robust",
            "models": "4 original",
            "phases": "3B, 4, 5",
            "statistic": "4.9x transitivity over random controls (0.175 vs 0.036)",
            "qualification": None,
        },
        {
            "id": "R5",
            "claim": "Controls validate cleanly",
            "tier": "robust",
            "models": "12 models",
            "phases": "1-5, 10A, 11B",
            "statistic": "Nonsense Jaccard 0.062, random bridge freq 0%",
            "qualification": "Weakest robust claim; LLMs find routes between any concepts at 7 waypoints; single-pair validation inadequate",
        },
        {
            "id": "R6",
            "claim": "Bridge concepts are bottlenecks, not associations",
            "tier": "robust",
            "models": "12 models",
            "phases": "3-5, 11A, 11C",
            "statistic": "spectrum 1.00, metaphor 0.00, germination > plant; bridge freq most protocol-robust (>0.97)",
            "qualification": "New-model cohort bridge freq CI includes zero (diff -0.100, CI [-0.286, 0.089])",
        },
        {
            "id": "R7",
            "claim": "Cue-strength gradient exists",
            "tier": "robust",
            "models": "4 original",
            "phases": "5A",
            "statistic": "12/16 family/model combos show monotonic decrease; 3/4 families perfect",
            "qualification": "All failures in biological-growth family",
        },
        {
            "id": "O15",
            "claim": "Prediction accuracy degrades from characterization to mechanism",
            "tier": "observed",
            "models": "4 original",
            "phases": "4-11",
            "statistic": "Phase 4: 81.3%, Phase 5: 42.9%, Phase 9: 20.0%",
            "qualification": "Qualitative predictions succeed (~50%); quantitative predictions fail (~0%)",
        },
        {
            "id": "O25",
            "claim": "Bridge frequency is the most protocol-robust property",
            "tier": "observed",
            "models": "3 (claude, gpt, deepseek)",
            "phases": "11C",
            "statistic": ">0.97 across all waypoint/temperature conditions; ANOVA interaction p=0.886",
            "qualification": "Tested on 3 models only",
        },
        {
            "id": "O30",
            "claim": "Gait rank ordering is largely stable across protocol conditions",
            "tier": "observed",
            "models": "3 (claude, gpt, deepseek)",
            "phases": "11C",
            "statistic": "Kendall W = 0.840",
            "qualification": "GPT and DeepSeek swap in some conditions",
        },
    ]

    return {"claims": claims}


def build_table01_metrics() -> dict:
    """Hardcoded metric definitions."""
    print("  table01_metrics ...")

    metrics = [
        {
            "name": "Gait (Intra-model Jaccard)",
            "symbol": "J_intra",
            "definition": "Mean pairwise Jaccard similarity of waypoint sets across repeated runs of the same model on the same pair",
            "range": "[0, 1]",
            "interpretation": "Higher = more consistent/rigid navigation",
        },
        {
            "name": "Asymmetry Index",
            "symbol": "A",
            "definition": "1 minus the mean cross-direction Jaccard (forward vs reverse waypoint sets)",
            "range": "[0, 1]",
            "interpretation": "Higher = more asymmetric paths; 0 = perfectly symmetric",
        },
        {
            "name": "Bridge Frequency",
            "symbol": "f_bridge",
            "definition": "Fraction of runs in which the predicted bridge concept appears in the waypoint sequence",
            "range": "[0, 1]",
            "interpretation": "Higher = more reliable bottleneck",
        },
        {
            "name": "Waypoint Transitivity",
            "symbol": "T",
            "definition": "Mean Jaccard similarity between the union of A-B and B-C waypoint sets and the A-C waypoint set",
            "range": "[0, 1]",
            "interpretation": "Higher = more compositional (A-C path reuses A-B and B-C concepts)",
        },
        {
            "name": "Positional Profile",
            "symbol": "P(i)",
            "definition": "Bridge frequency at each waypoint position i in the sequence",
            "range": "[0, 1] per position",
            "interpretation": "Reveals where bridges anchor in the navigational sequence",
        },
        {
            "name": "Triangle Inequality Excess",
            "symbol": "E",
            "definition": "d(A,B) + d(B,C) - d(A,C) where d = 1 - Jaccard",
            "range": "(-inf, inf)",
            "interpretation": "Positive = triangle inequality holds; negative = violation",
        },
        {
            "name": "Pre-fill Displacement",
            "symbol": "Delta_f",
            "definition": "Change in bridge frequency when waypoint 1 is pre-filled vs unconstrained",
            "range": "[-1, 1]",
            "interpretation": "Negative = displacement; positive = facilitation",
        },
    ]

    return {"metrics": metrics}


def build_table02_models() -> dict:
    """Model registry from config.py."""
    print("  table02_models ...")

    sys.path.insert(0, str(PROJECT_ROOT / "writeup" / "scripts"))
    from config import MODEL_REGISTRY, MODEL_RUN_COUNTS, MODEL_SCALE_APPROX

    entries = []
    for mid, (display, provider, cohort, scale, color) in MODEL_REGISTRY.items():
        rc = MODEL_RUN_COUNTS.get(mid, {})
        entries.append({
            "id": mid,
            "displayName": display,
            "provider": provider,
            "cohort": cohort,
            "scaleLabel": scale,
            "scaleApprox": MODEL_SCALE_APPROX.get(mid),
            "totalRuns": rc.get("total"),
            "phases": rc.get("phases"),
        })

    return {"models": entries}


def build_table03_phases() -> dict:
    """Hardcoded phase summary."""
    print("  table03_phases ...")

    phases = [
        {"phase": "1",   "name": "Pilot (Conceptual Gait)",      "newRuns": 2480, "keyQuestion": "Do models produce consistent conceptual paths?", "finding": "4 models show distinct, stable gait signatures (Jaccard 0.258-0.578)"},
        {"phase": "2",   "name": "Reversals (Asymmetry)",         "newRuns": 840,  "keyQuestion": "Are A-to-B and B-to-A paths symmetric?",         "finding": "Mean asymmetry 0.811; quasimetric structure established"},
        {"phase": "3",   "name": "Transitivity & Convergence",    "newRuns": 1280, "keyQuestion": "Are hierarchical paths compositional?",           "finding": "4.9x transitivity over controls; triangle inequality holds 91%"},
        {"phase": "4",   "name": "Targeted Bridges",              "newRuns": 1840, "keyQuestion": "Do predicted bridge concepts appear?",            "finding": "Bottleneck bridges reliable; association != navigation (metaphor 0%)"},
        {"phase": "5",   "name": "Cue Strength & Polysemy",       "newRuns": 2240, "keyQuestion": "Does bridge frequency track cue strength?",      "finding": "Monotonic gradient in 12/16 families; forced crossings highest"},
        {"phase": "6",   "name": "Positional Profiles",           "newRuns": 520,  "keyQuestion": "Where do bridges anchor in the sequence?",        "finding": "Early-position bias; peak-detection over fixed-midpoint"},
        {"phase": "7",   "name": "Pre-fill & Curvature",          "newRuns": 2360, "keyQuestion": "Can bridges be displaced by pre-filling?",        "finding": "Pre-fill disrupts bridges; cross-model distance metrics invalid (r=0.17)"},
        {"phase": "8",   "name": "Salience & Normalization",      "newRuns": 1460, "keyQuestion": "Do competitor count or dominance predict fragility?", "finding": "Competitor count irrelevant; gait normalization has zero effect"},
        {"phase": "9",   "name": "Dominance & Facilitation",      "newRuns": 1960, "keyQuestion": "Does dominance ratio predict survival?",          "finding": "Dominance ratio fails; facilitation effect real but unpredictable"},
        {"phase": "10",  "name": "Generality (8 models)",         "newRuns": 1680, "keyQuestion": "Do findings generalize to new architectures?",    "finding": "Gait, asymmetry, bridges replicate across 8 models; relation class matters"},
        {"phase": "11",  "name": "Expanded Generality & Robustness", "newRuns": 2040, "keyQuestion": "12-model replication + protocol robustness?", "finding": "All findings replicate; bridge freq most robust (ANOVA p=0.886)"},
    ]

    return {"phases": phases}


def build_table04_triangle() -> dict:
    """Triangle inequality data from transitivity (3B), targeted-bridges (4B), curvature (7B)."""
    print("  table04_triangle ...")

    result = {}

    # Phase 3B from transitivity-metrics.json
    trans = load_json("transitivity-metrics.json")
    if trans:
        holds = 0
        total = 0
        entries = []
        for tm in trans.get("tripleModelMetrics", []):
            ti = tm.get("triangleInequalityHolds")
            if ti is not None:
                total += 1
                if ti:
                    holds += 1
                entries.append({
                    "tripleId": tm["tripleId"],
                    "modelId": tm["modelId"],
                    "holds": ti,
                    "slack": tm.get("triangleSlack"),
                })
        result["phase3B"] = {
            "holds": holds,
            "total": total,
            "rate": holds / total if total > 0 else None,
            "entries": entries,
        }

    # Phase 4B from targeted-bridges-metrics.json
    targeted = load_json("targeted-bridges-metrics.json")
    if targeted:
        holds = 0
        total = 0
        entries = []
        for tm in targeted.get("tripleModelMetrics", []):
            ti = tm.get("triangleInequalityHolds")
            if ti is not None:
                total += 1
                if ti:
                    holds += 1
                entries.append({
                    "tripleId": tm["tripleId"],
                    "modelId": tm["modelId"],
                    "holds": ti,
                    "slack": tm.get("triangleSlack"),
                })
        result["phase4B"] = {
            "holds": holds,
            "total": total,
            "rate": holds / total if total > 0 else None,
            "entries": entries,
        }

    # Phase 7B from curvature-metrics.json
    curv = load_json("curvature-metrics.json")
    if curv:
        holds = 0
        total = 0
        entries = []
        for tm in curv.get("triangleModelMetrics", []):
            ti = tm.get("triangleInequalityHolds")
            if ti is not None:
                total += 1
                if ti:
                    holds += 1
                entries.append({
                    "triangleId": tm.get("triangleId"),
                    "modelId": tm["modelId"],
                    "holds": ti,
                    "excess": tm.get("excess"),
                })
        result["phase7B"] = {
            "holds": holds,
            "total": total,
            "rate": holds / total if total > 0 else None,
            "entries": entries,
        }

    return result


def build_table05_hypotheses() -> dict:
    """Hardcoded G20-G27 outcomes from GRAVEYARD.md."""
    print("  table05_hypotheses ...")

    hypotheses = [
        {
            "id": "G20",
            "phase": 8,
            "name": "Route Exclusivity Predicts Bridge Fragility",
            "predicted": "Spearman rho < -0.70 (competitor count vs survival)",
            "observed": "rho = 0.116 (opposite direction)",
            "outcome": "dead",
            "resurrected": False,
        },
        {
            "id": "G21",
            "phase": 8,
            "name": "Gemini Gradient Blindness",
            "predicted": "Gemini zeros on >= 5/10 gradient pairs, <= 2/10 causal",
            "observed": "Reversed: 1/10 gradient zeros, 6/10 causal zeros",
            "outcome": "dead",
            "resurrected": False,
        },
        {
            "id": "G22",
            "phase": 8,
            "name": "Gait Normalization Rescues Distance Metrics",
            "predicted": "Cross-model r from ~0.17 to >0.50 after normalization",
            "observed": "r = 0.212 before and after (zero improvement)",
            "outcome": "dead",
            "resurrected": False,
        },
        {
            "id": "G23",
            "phase": 9,
            "name": "Dominance Ratio Predicts Bridge Fragility",
            "predicted": "Spearman rho > 0.50 (dominance ratio vs survival)",
            "observed": "rho = 0.157, CI includes zero",
            "outcome": "dead",
            "resurrected": False,
        },
        {
            "id": "G24",
            "phase": 9,
            "name": "Gemini Transformation-Chain Blindness",
            "predicted": "Gemini transformation mean < 0.30, gradient > 0.45",
            "observed": "Reversed: transformation 0.667, gradient 0.293",
            "outcome": "dead",
            "resurrected": False,
        },
        {
            "id": "G25",
            "phase": 9,
            "name": "Pre-Fill Facilitation Crossover Regression",
            "predicted": "Negative slope CI excluding zero; crossover at 0.40-0.50",
            "observed": "Slope CI [-6.748, 0.723] includes zero; crossover at 0.790",
            "outcome": "partial",
            "resurrected": False,
        },
        {
            "id": "G26",
            "phase": 10,
            "name": "Bridge Bottleneck Generalization to New Models",
            "predicted": "Bridge freq CI would include zero",
            "observed": "4-model cohort diff -0.096, CI [-0.241, 0.064] includes zero",
            "outcome": "resurrected",
            "resurrected": True,
        },
        {
            "id": "G27",
            "phase": 10,
            "name": "Predicted Relation Class Ordering",
            "predicted": "On-axis < unrelated < same-domain in >= 5/8 pairs",
            "observed": "Actual: unrelated (0.388) < on-axis (0.643) ~ same-domain (0.708); 1/8 pairs",
            "outcome": "dead",
            "resurrected": False,
        },
    ]

    return {"hypotheses": hypotheses}


def build_table06_anova() -> dict:
    """ANOVA results from 11c-robustness.json."""
    print("  table06_anova ...")

    data = load_json("11c-robustness.json")
    if not data:
        return {}

    anova = data.get("anovaInteraction", {})

    effects = [
        {
            "effect": "Waypoint Count",
            "fStatistic": anova.get("waypointMainEffect"),
            "pValue": anova.get("waypointMainEffectP"),
            "significant": (anova.get("waypointMainEffectP") or 1.0) < 0.05,
        },
        {
            "effect": "Temperature",
            "fStatistic": anova.get("temperatureMainEffect"),
            "pValue": anova.get("temperatureMainEffectP"),
            "significant": (anova.get("temperatureMainEffectP") or 1.0) < 0.05,
        },
        {
            "effect": "Waypoint x Temperature Interaction",
            "fStatistic": anova.get("interactionEffect"),
            "pValue": anova.get("interactionEffectP"),
            "significant": (anova.get("interactionEffectP") or 1.0) < 0.05,
        },
        {
            "effect": "Model",
            "fStatistic": anova.get("modelMainEffect"),
            "pValue": anova.get("modelMainEffectP"),
            "significant": (anova.get("modelMainEffectP") or 1.0) < 0.05,
        },
    ]

    return {
        "effects": effects,
        "nullInteraction": anova.get("nullInteraction"),
        "predictions": data.get("predictions", []),
    }


def build_table07_control() -> dict:
    """Control revision results from 11b-control-revision.json."""
    print("  table07_control ...")

    data = load_json("11b-control-revision.json")
    if not data:
        return {}

    screening = []
    for sr in data.get("screeningResults", []):
        screening.append({
            "candidateId": sr["candidateId"],
            "modelId": sr["modelId"],
            "topWaypoint": sr.get("topWaypoint"),
            "topFrequency": sr.get("topFrequency"),
            "entropy": sr.get("entropy"),
            "passesFrequencyGate": sr.get("passesFrequencyGate"),
            "passesEntropyGate": sr.get("passesEntropyGate"),
        })

    # Summarize per candidate
    candidate_summary = defaultdict(lambda: {"passCount": 0, "totalModels": 0, "topFreqs": []})
    for sr in data.get("screeningResults", []):
        cid = sr["candidateId"]
        candidate_summary[cid]["totalModels"] += 1
        candidate_summary[cid]["topFreqs"].append(sr.get("topFrequency"))
        if sr.get("passesFrequencyGate") and sr.get("passesEntropyGate"):
            candidate_summary[cid]["passCount"] += 1

    summary = []
    for cid, info in candidate_summary.items():
        summary.append({
            "candidateId": cid,
            "passCount": info["passCount"],
            "totalModels": info["totalModels"],
            "meanTopFrequency": safe_mean(info["topFreqs"]),
        })

    # --- Stapler-monsoon retrospective (panel a) ---
    retrospective = []
    for entry in data.get("staplerMonsoonRetrospective", []):
        retrospective.append({
            "modelId": entry["modelId"],
            "topWaypoint": entry.get("topWaypoint"),
            "topFrequency": entry.get("topFrequency"),
            "entropy": entry.get("entropy"),
            "passesR5": entry.get("passesR5"),
            "cohort": entry.get("cohort"),
        })

    return {
        "screeningResults": screening,
        "candidateSummary": summary,
        "retrospective": retrospective,
    }


# ---------------------------------------------------------------------------
# Main build
# ---------------------------------------------------------------------------

def build_manifest() -> dict:
    """Build the complete paper manifest."""
    manifest = {}

    print("Building figure data...")
    manifest["fig02_gait_spectrum"] = build_fig02_gait_spectrum()
    manifest["fig03_gait_stability"] = build_fig03_gait_stability()
    manifest["fig04_dual_anchor"] = build_fig04_dual_anchor()
    manifest["fig05_asymmetry"] = build_fig05_asymmetry()
    manifest["fig06_compositional"] = build_fig06_compositional()
    manifest["fig07_bridge_taxonomy"] = build_fig07_bridge_taxonomy()
    manifest["fig08_bridge_positions"] = build_fig08_bridge_positions()
    manifest["fig09_prefill_displacement"] = build_fig09_prefill_displacement()
    manifest["fig10_relation_class"] = build_fig10_relation_class()
    manifest["fig11_prediction_accuracy"] = build_fig11_prediction_accuracy()
    manifest["fig12_gait_asymmetry"] = build_fig12_gait_asymmetry()
    manifest["fig13_scale_effect"] = build_fig13_scale_effect()
    manifest["fig14_robustness"] = build_fig14_robustness()

    print("\nBuilding table data...")
    manifest["table00_claims"] = build_table00_claims()
    manifest["table01_metrics"] = build_table01_metrics()
    manifest["table02_models"] = build_table02_models()
    manifest["table03_phases"] = build_table03_phases()
    manifest["table04_triangle"] = build_table04_triangle()
    manifest["table05_hypotheses"] = build_table05_hypotheses()
    manifest["table06_anova"] = build_table06_anova()
    manifest["table07_control"] = build_table07_control()

    return manifest


def main():
    print(f"Building paper manifest from {ANALYSIS_DIR}")
    print(f"Output: {MANIFEST_PATH}\n")

    manifest = build_manifest()

    # Count entries for summary
    fig_count = sum(1 for k in manifest if k.startswith("fig"))
    table_count = sum(1 for k in manifest if k.startswith("table"))

    print(f"\nWriting manifest: {fig_count} figures, {table_count} tables")

    with open(MANIFEST_PATH, "w") as f:
        json.dump(manifest, f, indent=2, default=str)

    # Report file size
    size_kb = MANIFEST_PATH.stat().st_size / 1024
    print(f"Manifest written: {size_kb:.1f} KB")
    print("Done.")


if __name__ == "__main__":
    main()
