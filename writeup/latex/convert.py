#!/usr/bin/env python3
"""Post-process pandoc-generated .tex files for the paper.

Handles: hypertarget stripping, section numbering, citation conversion
(author-year, title-based, possessive, compound, conference-year),
figure/table insertion, and HTML comment cleanup.
"""

import re
import os
import glob

# ============================================================
# 1. Special citation replacements (applied first, most specific)
# ============================================================
# Each is (regex_pattern, replacement_string)
# Order matters — more specific patterns first to avoid partial matches.

SPECIAL_CITES = [
    # --- Compound citations ---
    (r'\(Nelson\s+et\s+al\.,\s*2004;\s*LLM\s+World\s+of\s+Words,\s*2024[-–]+2025\)',
     r'\\citep{nelson2004university,llmwow2025}'),

    # --- Conference-year patterns ---
    (r'\(Park\s+et\s+al\.,\s*ICML\s+2024\)',
     r'\\citep{park2024linear}'),
    (r'\(Park\s+et\s+al\.,\s*ICLR\s+2025\)',
     r'\\citep{park2025geometry}'),
    (r'TWOHOPFACT\s*\(ACL\s+2024\)',
     r'TWOHOPFACT~\\citep{twohopfact2024}'),
    (r'Joshi\s+et\s+al\.[\s~]*\(NeurIPS\s+2025\)',
     r'\\citet{joshi2025dimensionality}'),
    (r'model\s+stitching\s+experiments[\s~]*\(NeurIPS\s+2025\)',
     r'model stitching experiments~\\citep{modelstitching2025}'),

    # --- Multi-year / multi-venue author patterns ---
    (r'Berglund\s+et\s+al\.[\s~]*\(2023;\s*ICLR\s+2024\)',
     r'\\citet{berglund2024reversal}'),
    (r'Arvanitidis\s+et\s+al\.[\s~]*\(2018,\s*with\s+extensions\s+through\s+2025\)',
     r'\\citet{arvanitidis2018latent}'),

    # --- Possessive author forms ---
    # These must come before standard author-year to avoid partial matching.
    (r"Berglund\s+et\s+al\.\s*\\?'s\s*\(2023\)",
     r"\\citeauthor{berglund2024reversal}'s (\\citeyear{berglund2024reversal})"),
    (r"Tversky\s*\\?'s\s*\(1977\)",
     r"\\citeauthor{tversky1977features}'s (\\citeyear{tversky1977features})"),
    (r"Constantinescu\s+et\s+al\.\s*\\?'s\s*\(2016\)",
     r"\\citeauthor{constantinescu2016grid}'s (\\citeyear{constantinescu2016grid})"),
    (r"Gardenfors\s*\\?'s\s*\(2000\)",
     r"\\citeauthor{gardenfors2000}'s (\\citeyear{gardenfors2000})"),
    (r"G(?:\\\"a|ä)rdenf(?:\\\"o|ö)rs\s*\\?'s\s*\(2000\)",
     r"\\citeauthor{gardenfors2000}'s (\\citeyear{gardenfors2000})"),

    # --- Title-based citations (mostly Related Work section) ---
    (r'HELM\s*\(2025\)',
     r'HELM~\\citep{helm2025}'),
    (r'delta-hyperbolicity\s+and\s+ultrametricity\s*\(2025\)',
     r'delta-hyperbolicity and ultrametricity~\\citep{deltahyperbolicity2025}'),
    (r'Explainable\s+Mapper\s*\(2025\)',
     r'Explainable Mapper~\\citep{explainablemapper2025}'),
    (r'Persistent\s+Topological\s+Features\s*\(2025\)',
     r'Persistent Topological Features~\\citep{persistenttopological2025}'),
    (r'Relation\s+Embedding\s+Chains\s*\(2023\)',
     r'Relation Embedding Chains~\\citep{relationchains2023}'),
    (r'[Tt]he\s+Geometry\s+of\s+Knowledge\s*\(2025\)',
     r'The Geometry of Knowledge~\\citep{geometryknowledge2025}'),
    (r'RiemannInfer\s*\(2026\)',
     r'RiemannInfer~\\citep{riemanninfer2026}'),
    (r'Geometric\s+Reasoner\s*\(2026\)',
     r'Geometric Reasoner~\\citep{geometricreasoner2026}'),
    (r'[Tt]he\s+directional\s+optimization\s+asymmetry\s+literature\s*\(2025\)',
     r'the directional optimization asymmetry literature~\\citep{directionalasymmetry2025}'),
    (r'self-consistency\s+failures\s+in\s+frontier\s+models\s*\(2025\)',
     r'self-consistency failures in frontier models~\\citep{selfconsistency2025}'),
    (r'Trajectory\s+variance\s+in\s+agentic\s+settings\s*\(2025\)',
     r'Trajectory variance in agentic settings~\\citep{trajectoryvariance2025}'),
    (r'[Tt]he\s+two-hop\s+curse\s*\(2025\)',
     r'the two-hop curse~\\citep{twohopcurse2025}'),
    (r'Multi-way\s+alignment\s+work\s*\(2026\)',
     r'Multi-way alignment work~\\citep{multiwayalignment2026}'),
    (r'LLM\s+behavioral\s+fingerprinting\s*\(2025\)',
     r'LLM behavioral fingerprinting~\\citep{behavioralfingerprint2025}'),
    (r'Behavioral\s+failure\s+manifold\s+mapping\s*\(2025\)',
     r'Behavioral failure manifold mapping~\\citep{failuremanifold2025}'),
    (r'LLM\s+World\s+of\s+Words\s*\(2024[-–]+2025\)',
     r'LLM World of Words~\\citep{llmwow2025}'),
]


# ============================================================
# 2. Standard author-year citations
# ============================================================
# (author_text, year) -> bibtex_key
# Spaces in author_text will be replaced with \s+ to handle line wrapping.
# \& in author_text handles pandoc's conversion of & to \&.

CITE_MAP = {
    # Static geometry
    ("Park et al.", "2024"): "park2024linear",
    ("Park et al.", "2025"): "park2025geometry",
    ("Nickel \\& Kiela", "2017"): "nickel2017poincare",
    ("Karkada et al.", "2025"): "karkada2025translation",
    ("Wyss et al.", "2025"): "wyss2025spectral",
    ("Joshi et al.", "2025"): "joshi2025dimensionality",
    # Navigation and interpolation
    ("Arvanitidis et al.", "2018"): "arvanitidis2018latent",
    # Reversal curse and directionality
    ("Berglund et al.", "2023"): "berglund2024reversal",
    ("Berglund et al.", "2024"): "berglund2024reversal",
    ("Barakat et al.", "2026"): "barakat2026hysteresis",
    # Multi-hop reasoning
    ("Press et al.", "2022"): "press2022compositionality",
    ("Press et al.", "2023"): "press2022compositionality",
    # Platonic representation
    ("Huh et al.", "2024"): "huh2024platonic",
    ("Nanda et al.", "2026"): "nanda2026attractors",
    ("Nanda", "2026"): "nanda2026attractors",
    # Cognitive science
    ("Gardenfors", "2000"): "gardenfors2000",
    ("Tolman", "1948"): "tolman1948cognitive",
    ("O'Keefe and Dostrovsky", "1971"): "okeefe1971hippocampus",
    ("Constantinescu et al.", "2016"): "constantinescu2016grid",
    ("Tversky", "1977"): "tversky1977features",
    ("Collins \\& Loftus", "1975"): "collins1975spreading",
    ("Collins and Loftus", "1975"): "collins1975spreading",
    # Word norms and embeddings
    ("Nelson et al.", "2004"): "nelson2004university",
    ("Mikolov et al.", "2013"): "mikolov2013distributed",
    # Statistical methods
    ("Efron \\& Tibshirani", "1993"): "efron1993bootstrap",
    ("Efron and Tibshirani", "1993"): "efron1993bootstrap",
    ("Phipson \\& Smyth", "2010"): "phipson2010permutation",
    ("Phipson and Smyth", "2010"): "phipson2010permutation",
    # Convergence game
    ("Hodge", "2025"): "hodge2025convergence",
}


# ============================================================
# 3. Figure and table maps
# ============================================================

FIGURE_MAP = {
    "fig02-gait-spectrum": (
        "Gait spectrum across 4 original models. Claude (0.578) shows "
        "2.2$\\times$ the consistency of GPT (0.258).",
        "fig:gait-spectrum"
    ),
    "fig03-gait-stability": (
        "Gait stability: per-pair Jaccard across 20 runs shows model-specific consistency.",
        "fig:gait-stability"
    ),
    "fig04-dual-anchor": (
        "Dual-anchor convergence: U-shaped positional profile showing "
        "elevated Jaccard at positions 1 and 7.",
        "fig:dual-anchor"
    ),
    "fig05-asymmetry": (
        "Directional asymmetry across 84 pair/model combinations. "
        "Mean 0.811; 87\\% significant at $p < 0.05$.",
        "fig:asymmetry"
    ),
    "fig06-compositional": (
        "Compositional transitivity: hierarchical triples (0.175) vs.\\ "
        "random controls (0.036), a 4.9$\\times$ gap.",
        "fig:compositional"
    ),
    "fig07-bridge-taxonomy": (
        "Bridge taxonomy: four categories defined by bridge bottleneck, "
        "off-axis failure, process vs.\\ object, and too-central status.",
        "fig:bridge-taxonomy"
    ),
    "fig08-bridge-positions": (
        "Bridge concept positions cluster at positions 1--2, not midpoint. "
        "Forced-crossing bridges show higher positional variability.",
        "fig:bridge-positions"
    ),
    "fig09-prefill-displacement": (
        "Pre-fill displacement: bridge frequency drops from 0.807 "
        "(unconstrained) to 0.460 (pre-fill), CI excludes zero.",
        "fig:prefill"
    ),
    "fig10-relation-class": (
        "Relation class effect on bridge survival: unrelated (0.388) "
        "$<$ on-axis (0.643) $\\approx$ same-domain (0.708).",
        "fig:relation-class"
    ),
    "fig11-prediction-accuracy": (
        "Prediction accuracy trajectory across phases: characterization "
        "(81\\%) $\\to$ mechanism (20--24\\%) $\\to$ generality (44--50\\%).",
        "fig:prediction"
    ),
    "fig12-gait-asymmetry": (
        "Gait and asymmetry across 12 models from 11 independent training pipelines.",
        "fig:gait-asymmetry-12"
    ),
    "fig13-scale-effect": (
        "Scale effect: Llama 4 Maverick (0.724) vs.\\ Llama 3.1 8B (0.200) "
        "bridge frequency, 3.6$\\times$ within-family gap.",
        "fig:scale-effect"
    ),
    "fig14-robustness": (
        "Bridge frequency robustness: $>$0.97 across all "
        "waypoint/temperature conditions.",
        "fig:robustness"
    ),
}

TABLE_MAP = {
    "table00_claims": "tab:claims",
    "table01_metrics": "tab:metrics",
    "table02_models": "tab:models",
    "table03_phases": "tab:phases",
    "table04_triangle": "tab:triangle",
    "table05_hypotheses": "tab:hypotheses",
    "table06_anova": "tab:anova",
    "table07_control": "tab:control",
}


# ============================================================
# Processing functions
# ============================================================

def strip_hypertargets(text):
    """Remove pandoc's \\hypertarget wrappers and their stray closing braces."""
    # Remove \hypertarget{...}{%\n  (opening wrapper)
    text = re.sub(r'\\hypertarget\{[^}]*\}\{%\n', '', text)
    text = re.sub(r'\\hypertarget\{[^}]*\}\{%', '', text)
    # Remove trailing } left after \label{} from hypertarget wrapping
    # Pattern: \label{something}} -> \label{something}
    text = re.sub(r'(\\label\{[^}]*\})\}', r'\1', text)
    return text


def fix_section_numbering(text):
    """Remove hardcoded section numbers that pandoc copies from markdown headings."""
    text = re.sub(r'(\\section\{)\d+\.\s+', r'\1', text)
    text = re.sub(r'(\\subsection\{)\d+\.\d+\s+', r'\1', text)
    text = re.sub(r'(\\subsubsection\{)\d+\.\d+\.\d+\s+', r'\1', text)
    return text


def replace_special_citations(text):
    """Apply specific citation patterns (compound, title-based, possessive, etc.)."""
    for pattern, replacement in SPECIAL_CITES:
        text = re.sub(pattern, replacement, text)
    return text


def replace_standard_citations(text):
    """Replace standard author-year citations with \\citet{} and \\citep{}."""
    # Sort by author name length (longest first) to avoid partial matches
    sorted_cites = sorted(CITE_MAP.items(), key=lambda x: -len(x[0][0]))

    for (author, year), key in sorted_cites:
        # Build flexible regex from author name
        author_re = re.escape(author)
        # Replace spaces with \s+ to handle pandoc line wrapping.
        # Python 3.12 re.escape produces '\ ' (escaped space); older versions don't.
        # Handle both by replacing escaped spaces first, then unescaped.
        author_re = author_re.replace('\\ ', '\\s+')
        author_re = author_re.replace(' ', '\\s+')

        # Textual: "Author et al. (YEAR)" or "Author et al.~(YEAR)" -> \citet{key}
        pattern = author_re + r'[\s~]*\(' + re.escape(year) + r'\)'
        text = re.sub(pattern, lambda m, k=key: '\\citet{' + k + '}', text)

        # Parenthetical: "(Author et al., YEAR)" -> \citep{key}
        pattern2 = r'\(' + author_re + r',?\s*' + re.escape(year) + r'\)'
        text = re.sub(pattern2, lambda m, k=key: '\\citep{' + k + '}', text)

    return text


def replace_figure_comments(text):
    """Replace HTML figure comments with LaTeX figure environments."""
    for fig_key, (caption, label) in FIGURE_MAP.items():
        pattern = re.compile(
            r'<!--\s*See\s+writeup/figures/' + re.escape(fig_key) + r'\.pdf\s*-->'
        )
        repl = (
            '\\begin{figure}[t]\n'
            '\\centering\n'
            '\\includegraphics[width=\\linewidth]{figures/' + fig_key + '.pdf}\n'
            '\\caption{' + caption + '}\n'
            '\\label{' + label + '}\n'
            '\\end{figure}'
        )
        text = pattern.sub(lambda m, r=repl: r, text)
    return text


def replace_table_comments(text):
    """Replace HTML table comments with LaTeX \\input{} commands."""
    for tab_key, label in TABLE_MAP.items():
        pattern = re.compile(
            r'<!--\s*See\s+writeup/tables/' + re.escape(tab_key) + r'\.tex\s*-->'
        )
        repl = '\\input{tables/' + tab_key + '.tex}'
        text = pattern.sub(lambda m, r=repl: r, text)
    return text


def clean_remaining_html_comments(text):
    """Remove any leftover HTML comments."""
    text = re.sub(r'<!--.*?-->', '', text)
    return text


def fix_appendix_titles(text):
    """Strip redundant 'Appendix X: ' prefix from appendix section titles.

    After \\appendix in paper.tex, LaTeX auto-numbers sections A, B, C, etc.
    So '\\section{Appendix A: Title}' becomes 'A Appendix A: Title' — redundant.
    """
    text = re.sub(r'(\\section\{)Appendix\s+[A-F]:\s*', r'\1', text)
    return text


def process_file(filepath, is_appendix=False):
    """Run all post-processing steps on a single .tex file."""
    with open(filepath, 'r') as f:
        text = f.read()

    text = strip_hypertargets(text)
    text = fix_section_numbering(text)
    if is_appendix:
        text = fix_appendix_titles(text)
    # Special citations first (most specific patterns), then standard
    text = replace_special_citations(text)
    text = replace_standard_citations(text)
    text = replace_figure_comments(text)
    text = replace_table_comments(text)
    text = clean_remaining_html_comments(text)

    # Clean up empty lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Remove lone closing braces from hypertarget removal
    text = re.sub(r'^\}\s*$', '', text, flags=re.MULTILINE)

    with open(filepath, 'w') as f:
        f.write(text)

    print(f"  Processed: {filepath}")


def main():
    latex_dir = os.path.dirname(os.path.abspath(__file__))

    section_files = sorted(glob.glob(os.path.join(latex_dir, '0*.tex')) +
                          glob.glob(os.path.join(latex_dir, '1*.tex')))
    print("Processing section files:")
    for f in section_files:
        process_file(f)

    appendix_files = sorted(glob.glob(os.path.join(latex_dir, '[A-F]-*.tex')))
    print("\nProcessing appendix files:")
    for f in appendix_files:
        process_file(f, is_appendix=True)

    print("\nDone!")


if __name__ == '__main__':
    main()
