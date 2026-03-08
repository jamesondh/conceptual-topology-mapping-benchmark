# Makefile for building the Conceptual Topology Mapping Benchmark paper
# Requires: pdflatex, bibtex (from texlive-latex-base + texlive-latex-extra)

PAPER = paper
LATEX = pdflatex
BIBTEX = bibtex

.PHONY: all clean

all: $(PAPER).pdf

$(PAPER).pdf: $(PAPER).tex $(wildcard *.tex) references.bib
	$(LATEX) $(PAPER)
	$(BIBTEX) $(PAPER)
	$(LATEX) $(PAPER)
	$(LATEX) $(PAPER)

clean:
	rm -f $(PAPER).pdf $(PAPER).aux $(PAPER).bbl $(PAPER).blg \
	      $(PAPER).log $(PAPER).out $(PAPER).toc $(PAPER).lof \
	      $(PAPER).lot $(PAPER).nav $(PAPER).snm $(PAPER).vrb \
	      *.aux
