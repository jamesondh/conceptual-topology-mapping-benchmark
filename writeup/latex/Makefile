# Makefile for building the Conceptual Topology Mapping Benchmark paper
# Requires: pdflatex, bibtex (TinyTeX installed in ~/.TinyTeX)

PAPER = paper
LATEX = $(HOME)/.local/bin/pdflatex
BIBTEX = $(HOME)/.local/bin/bibtex

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
