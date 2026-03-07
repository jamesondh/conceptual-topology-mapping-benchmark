"""
Convenience wrapper for loading the paper manifest.

Provides simple accessor functions for figure and table data.
The manifest is built by build_manifest.py and stored at
writeup/data/paper_manifest.json.

Usage:
    from data_loader import load_manifest, get_figure_data, get_table_data

    manifest = load_manifest()
    fig02 = get_figure_data("fig02_gait_spectrum")
    table02 = get_table_data("table02_models")
"""

import json
from pathlib import Path

# Resolve paths relative to this script's location
_SCRIPT_DIR = Path(__file__).resolve().parent
_PROJECT_ROOT = _SCRIPT_DIR.parent.parent
_MANIFEST_PATH = _PROJECT_ROOT / "writeup" / "data" / "paper_manifest.json"

# Module-level cache so the manifest is loaded at most once per process
_manifest_cache: dict | None = None


def load_manifest(path: Path | str | None = None) -> dict:
    """Load the paper manifest JSON.

    Parameters
    ----------
    path : Path or str, optional
        Override path to the manifest file. Defaults to
        writeup/data/paper_manifest.json relative to project root.

    Returns
    -------
    dict
        The full manifest dictionary keyed by figure/table ID.

    Raises
    ------
    FileNotFoundError
        If the manifest file does not exist. Run build_manifest.py first.
    """
    global _manifest_cache

    resolved = Path(path) if path is not None else _MANIFEST_PATH

    if _manifest_cache is not None and path is None:
        return _manifest_cache

    if not resolved.exists():
        raise FileNotFoundError(
            f"Manifest not found at {resolved}.\n"
            "Run `python writeup/scripts/build_manifest.py` first."
        )

    with open(resolved, "r") as f:
        data = json.load(f)

    if path is None:
        _manifest_cache = data

    return data


def get_figure_data(fig_id: str, manifest: dict | None = None) -> dict:
    """Retrieve data for a specific figure.

    Parameters
    ----------
    fig_id : str
        The figure identifier, e.g. "fig02_gait_spectrum".
        If the "fig" prefix is omitted, it will be added.
    manifest : dict, optional
        Pre-loaded manifest. If None, loads from disk.

    Returns
    -------
    dict
        The figure's pre-extracted data.

    Raises
    ------
    KeyError
        If the figure ID is not found in the manifest.
    """
    if manifest is None:
        manifest = load_manifest()

    # Allow shorthand: "02_gait_spectrum" -> "fig02_gait_spectrum"
    if not fig_id.startswith("fig"):
        fig_id = f"fig{fig_id}"

    if fig_id not in manifest:
        available = [k for k in manifest if k.startswith("fig")]
        raise KeyError(
            f"Figure '{fig_id}' not found. Available figures: {available}"
        )

    return manifest[fig_id]


def get_table_data(table_id: str, manifest: dict | None = None) -> dict:
    """Retrieve data for a specific table.

    Parameters
    ----------
    table_id : str
        The table identifier, e.g. "table02_models".
        If the "table" prefix is omitted, it will be added.
    manifest : dict, optional
        Pre-loaded manifest. If None, loads from disk.

    Returns
    -------
    dict
        The table's pre-extracted data.

    Raises
    ------
    KeyError
        If the table ID is not found in the manifest.
    """
    if manifest is None:
        manifest = load_manifest()

    # Allow shorthand: "02_models" -> "table02_models"
    if not table_id.startswith("table"):
        table_id = f"table{table_id}"

    if table_id not in manifest:
        available = [k for k in manifest if k.startswith("table")]
        raise KeyError(
            f"Table '{table_id}' not found. Available tables: {available}"
        )

    return manifest[table_id]


def list_figures(manifest: dict | None = None) -> list[str]:
    """Return a sorted list of all figure IDs in the manifest."""
    if manifest is None:
        manifest = load_manifest()
    return sorted(k for k in manifest if k.startswith("fig"))


def list_tables(manifest: dict | None = None) -> list[str]:
    """Return a sorted list of all table IDs in the manifest."""
    if manifest is None:
        manifest = load_manifest()
    return sorted(k for k in manifest if k.startswith("table"))
