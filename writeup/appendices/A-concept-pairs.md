# Appendix A: Concept Pair and Triple Inventory

This appendix provides the complete inventory of concept pairs, triples, and phase-specific stimuli used across the benchmark's 11 experimental phases.

## A.1 Core Concept Pairs (Phase 1)

36 pairs across 9 categories, split into holdout (15, used only for prompt selection) and reporting (21, used for all published analyses).

### Anchor Pairs

Known basin structure from the word convergence game experiments.

| ID | From | To | Concreteness | Basin | Depth | Set |
|----|------|----|-------------|-------|-------|-----|
| anchor-beyonce-erosion | Beyonce | erosion | concrete--abstract | formation | deep | reporting |
| anchor-tesla-mycelium | Tesla | mycelium | concrete--concrete | network | deep | reporting |
| anchor-shadow-melody | shadow | melody | concrete--abstract | echo | moderate | holdout |
| anchor-skull-garden | skull | garden | concrete--concrete | --- | moderate | reporting |
| anchor-kanye-lattice | Kanye West | lattice | concrete--abstract | --- | flat | holdout |

### Hierarchy Pairs

Hypernym--hyponym relationships at varying abstraction levels.

| ID | From | To | Concreteness | Set |
|----|------|----|-------------|-----|
| hierarchy-animal-poodle | animal | poodle | concrete--concrete | reporting |
| hierarchy-vehicle-skateboard | vehicle | skateboard | concrete--concrete | holdout |
| hierarchy-emotion-nostalgia | emotion | nostalgia | abstract--abstract | reporting |
| hierarchy-structure-lattice | structure | lattice | abstract--abstract | holdout |

### Cross-Domain Pairs

Concepts from different semantic domains.

| ID | From | To | Concreteness | Set |
|----|------|----|-------------|-----|
| cross-music-mathematics | music | mathematics | abstract--abstract | reporting |
| cross-cooking-architecture | cooking | architecture | concrete--concrete | holdout |
| cross-justice-erosion | justice | erosion | abstract--concrete | reporting |
| cross-time-crystal | time | crystal | abstract--concrete | holdout |

### Polysemy Pairs

Same ambiguous word paired with different targets to steer sense activation.

| ID | From | To | Polysemy Group | Target Sense | Set |
|----|------|----|----------------|-------------|-----|
| polysemy-bank-river | bank | river | bank | geographic | reporting |
| polysemy-bank-mortgage | bank | mortgage | bank | financial | holdout |
| polysemy-bat-cave | bat | cave | bat | animal | holdout |
| polysemy-bat-baseball | bat | baseball | bat | sports | reporting |
| polysemy-crane-construction | crane | construction | crane | machine | reporting |
| polysemy-crane-wetland | crane | wetland | crane | bird | holdout |

### Near-Synonym Pairs

Dense semantic neighborhoods testing navigational friction.

| ID | From | To | Concreteness | Set |
|----|------|----|-------------|-----|
| synonym-cemetery-graveyard | cemetery | graveyard | concrete--concrete | reporting |
| synonym-forest-woods | forest | woods | concrete--concrete | holdout |
| synonym-happy-joyful | happy | joyful | abstract--abstract | reporting |
| synonym-anger-rage | anger | rage | abstract--abstract | holdout |

### Antonym Pairs

Oppositional continua testing axis traversal.

| ID | From | To | Concreteness | Set |
|----|------|----|-------------|-----|
| antonym-hot-cold | hot | cold | concrete--concrete | reporting |
| antonym-order-chaos | order | chaos | abstract--abstract | holdout |

### Control Pairs

| Type | ID | From | To | Set |
|------|-----|------|----|-----|
| Identity | control-identity-apple | apple | apple | reporting |
| Identity | control-identity-justice | justice | justice | holdout |
| Random | control-random-stapler-monsoon | stapler | monsoon | reporting |
| Random | control-random-parliament-cinnamon | parliament | cinnamon | holdout |
| Random | control-random-telescope-jealousy | telescope | jealousy | reporting |
| Random | control-random-shoelace-democracy | shoelace | democracy | reporting |
| Random | control-random-flamingo-calculus | flamingo | calculus | reporting |
| Random | control-random-umbrella-photosynthesis | umbrella | photosynthesis | reporting |
| Random | control-random-origami-gravity | origami | gravity | reporting |
| Nonsense | control-nonsense-xkplm-qrvzt | xkplm | qrvzt | reporting |
| Nonsense | control-nonsense-bwfnj-tlmgk | bwfnj | tlmgk | holdout |

---

## A.2 Phase 3B Triples (Transitive Path Structure)

8 triples testing transitivity, triangle inequality, and bridge frequency. Each triple (A, B, C) requires 6 directional legs; some legs were reused from Phase 1/2 data.

| ID | A | B | C | Type | Target Bridge |
|----|---|---|---|------|---------------|
| triple-animal-dog-poodle | animal | dog | poodle | hierarchical | dog |
| triple-emotion-nostalgia-melancholy | emotion | nostalgia | melancholy | hierarchical | nostalgia |
| triple-music-harmony-mathematics | music | harmony | mathematics | semantic-chain | harmony |
| triple-hot-energy-cold | hot | energy | cold | semantic-chain | energy |
| triple-beyonce-justice-erosion | Beyonce | justice | erosion | existing-pair | justice |
| triple-bank-river-ocean | bank | river | ocean | polysemy-extend | river |
| triple-music-stapler-mathematics | music | stapler | mathematics | random-control | stapler |
| triple-hot-flamingo-cold | hot | flamingo | cold | random-control | flamingo |

---

## A.3 Phase 4 Triples (Cross-Model Bridge Topology)

8 targeted triples testing specific bridge predictions, with focus on Gemini fragmentation.

| ID | A | B | C | Diagnostic Type | Bridge |
|----|---|---|---|----------------|--------|
| p4-bank-river-ocean | bank | river | ocean | polysemy-retest | river |
| p4-bank-deposit-savings | bank | deposit | savings | polysemy-financial | deposit |
| p4-light-spectrum-color | light | spectrum | color | cross-domain-concrete | spectrum |
| p4-emotion-nostalgia-melancholy | emotion | nostalgia | melancholy | abstract-retest | nostalgia |
| p4-language-metaphor-thought | language | metaphor | thought | abstract-bridge | metaphor |
| p4-tree-forest-ecosystem | tree | forest | ecosystem | concrete-hierarchical | forest |
| p4-light-chandelier-color | light | chandelier | color | random-control | chandelier |
| p4-emotion-calendar-melancholy | emotion | calendar | melancholy | random-control | calendar |

---

## A.4 Phase 5 Stimuli (Cue-Strength, Dimensionality, Convergence)

### Part A: Cue-Strength Triples

14 triples across 4 concept families at 3--4 cue levels, plus 2 random controls.

| Family | A | C | Cue Level | B (Bridge) |
|--------|---|---|-----------|------------|
| Physical causation | sun | desert | very-high | heat |
| Physical causation | sun | desert | medium | radiation |
| Physical causation | sun | desert | low | solstice |
| Biological growth | seed | garden | very-high | plant |
| Biological growth | seed | garden | medium | germination |
| Biological growth | seed | garden | low | husk |
| Compositional hierarchy | word | paragraph | very-high | sentence |
| Compositional hierarchy | word | paragraph | medium | clause |
| Compositional hierarchy | word | paragraph | low | syllable |
| Abstract affect | emotion | melancholy | high | sadness |
| Abstract affect | emotion | melancholy | medium | nostalgia |
| Abstract affect | emotion | melancholy | low | apathy |
| Control | sun | desert | --- | umbrella |
| Control | seed | garden | --- | telescope |

### Part B: Dimensionality Triples

14 triples probing polysemous focal concepts across same-axis vs.\ cross-axis configurations.

| Focal Concept | A | C | Axis Pattern | Bridge |
|--------------|---|---|-------------|--------|
| light | photon | color | same-axis (physics) | light |
| light | feather | heavy | same-axis (weight) | light |
| light | candle | darkness | same-axis (illumination) | light |
| light | photon | heavy | cross-axis | light |
| light | candle | color | partial-overlap | light |
| light | prayer | darkness | cross-axis | light |
| bank | loan | savings | same-axis (financial) | bank |
| bank | river | shore | same-axis (geographic) | bank |
| bank | loan | shore | cross-axis | bank |
| fire | spark | ash | same-axis (combustion) | fire |
| fire | ambition | motivation | same-axis (passion) | fire |
| fire | spark | motivation | cross-axis | fire |
| control | photon | color | --- | bicycle |
| control | loan | savings | --- | penguin |

### Part C: Convergence Pairs

8 pairs for W-shape positional convergence testing.

| From | To | Type | Expected Bridge |
|------|----|------|----------------|
| light | color | bridge-present | spectrum |
| bank | savings | bridge-present | deposit |
| animal | poodle | bridge-present | dog |
| tree | ecosystem | bridge-present | forest |
| language | thought | bridge-absent | --- |
| hot | cold | bridge-absent | --- |
| music | mathematics | bridge-variable | harmony |
| telescope | jealousy | no-bridge-control | --- |

---

## A.5 Phase 6 Pairs (Salience, Forced-Crossing, Position)

### Part A: Salience Mapping (8 pairs, 30--40 reps each)

| From | To | Known Bridge | Category |
|------|----|-------------|----------|
| music | mathematics | harmony | bridge-present |
| sun | desert | heat | bridge-present |
| seed | garden | germination | bridge-present |
| light | color | spectrum | bridge-present |
| bank | ocean | river | bridge-present |
| emotion | melancholy | sadness | bridge-present |
| language | thought | --- | bridge-absent |
| hot | cold | --- | bridge-absent |

### Part B: Forced-Crossing Asymmetry (8 pairs)

| From | To | Bridge | Type |
|------|----|--------|------|
| loan | shore | bank | forced-crossing |
| deposit | river | bank | forced-crossing |
| savings | cliff | bank | forced-crossing |
| photon | heavy | light | forced-crossing |
| loan | savings | --- | same-axis comparison |
| river | shore | --- | same-axis comparison |
| sun | desert | --- | same-axis comparison |
| seed | garden | --- | same-axis comparison |

### Part C: Positional Bridge Scanning (10 pairs)

| From | To | Bridge | Expected Position |
|------|----|--------|-------------------|
| light | color | spectrum | middle (3--5) |
| bank | savings | deposit | middle (3--5) |
| animal | poodle | dog | middle (3--5) |
| music | mathematics | harmony | middle (3--5) |
| tree | ecosystem | forest | middle (3--5) |
| loan | shore | bank | middle (3--5) |
| deposit | river | bank | middle (3--5) |
| sun | desert | heat | early (2--3) |
| seed | garden | germination | middle (3--5) |
| emotion | melancholy | sadness | late (4--6) |

---

## A.6 Phase 7 Pairs and Triples (Anchoring, Curvature, Too-Central)

### Part A: Anchoring-Effect Pairs (8 pairs, 3 pre-fill conditions each)

| From | To | Bridge | Incongruent | Congruent | Neutral | Role |
|------|----|--------|-------------|-----------|---------|------|
| music | mathematics | harmony | symmetry | rhythm | element | heading-bridge |
| sun | desert | heat | drought | warmth | element | heading-bridge |
| seed | garden | germination | sprout | growth | element | heading-bridge |
| light | color | spectrum | wavelength | prism | element | heading-bridge |
| bank | ocean | river | estuary | stream | element | heading-bridge |
| emotion | melancholy | sadness | mood | grief | element | heading-bridge |
| loan | shore | bank | interest | credit | element | forced-crossing |
| animal | poodle | dog | mammal | canine | element | taxonomic |

### Part B: Curvature Triangles (8 triangles)

| A | B | C | Vertex Type | Relationship |
|---|---|---|------------|-------------|
| loan | bank | river | polysemous (homonym) | financial/geographic |
| deposit | bank | shore | polysemous (homonym) | financial/geographic |
| photon | light | heavy | polysemous (homonym) | electromagnetic/weight |
| candle | light | feather | polysemous (homonym) | illumination/weight |
| sun | heat | desert | non-polysemous | causal-chain |
| seed | germination | garden | non-polysemous | process-chain |
| music | harmony | mathematics | non-polysemous | cross-domain |
| word | sentence | paragraph | non-polysemous | compositional |

### Part C: Too-Central Pairs (10 pairs)

| From | To | Candidate Bridge | Category |
|------|----|-----------------|----------|
| spark | ash | fire | too-central |
| acorn | timber | tree | too-central |
| flour | bread | dough | too-central |
| hot | cold | warm | obvious-useful |
| infant | elderly | adolescent | obvious-useful |
| whisper | shout | speak | obvious-useful |
| rain | ocean | water | boundary |
| egg | chicken | embryo | boundary |
| ice | steam | water | boundary |
| dawn | dusk | noon | boundary |

---

## A.7 Phase 8 Pairs (Fragility, Gradient, Distance)

### Part A: Bridge Fragility (8 new pairs)

| From | To | Predicted Bridge | Competitor Level | Pre-fill |
|------|----|-----------------|-----------------|----------|
| question | answer | reasoning | low (0--1) | inquiry |
| parent | child | birth | low (0--1) | family |
| cause | effect | mechanism | low (1--2) | reason |
| winter | summer | spring | medium (3--4) | snow |
| student | professor | research | medium (3--5) | university |
| science | art | creativity | high (6--10) | experiment |
| ocean | mountain | landscape | high (6--10) | wave |
| brain | computer | algorithm | high (8--12) | neuron |

### Part B: Gradient vs.\ Causal-Chain Pairs (20 pairs)

**Gradient-midpoint (10):**

| From | To | Bridge | Dimension |
|------|----|--------|-----------|
| whisper | shout | speak | vocal intensity |
| hot | cold | warm | temperature |
| dawn | dusk | noon | time of day |
| infant | elderly | adolescent | life stage |
| crawl | sprint | walk | locomotion speed |
| pond | ocean | lake | water body scale |
| pebble | boulder | rock | stone size |
| drizzle | downpour | rain | precipitation |
| village | metropolis | city | settlement scale |
| murmur | scream | speech | vocal intensity |

**Causal-chain (10):**

| From | To | Bridge | Process |
|------|----|--------|---------|
| grape | wine | fermentation | winemaking |
| ore | jewelry | metal | smelting-crafting |
| caterpillar | butterfly | cocoon | metamorphosis |
| clay | vase | pottery | crafting |
| wool | sweater | yarn | textile |
| milk | cheese | curd | dairy |
| seed | fruit | flower | reproduction |
| sand | glass | heat | manufacturing |
| acorn | timber | tree | growth-harvest |
| flour | bread | dough | baking |

### Part C: Gait-Normalized Distance (16 pairs)

8 reference pairs (short to very-long expected distance) and 8 test pairs spanning the distance range. See Section 7.4 for the finding that cross-model distance normalization produces zero improvement.

---

## A.8 Phase 9--11 Pairs

Phase 9 tested 6 dominance pairs (selected from Phase 8B data), 10 transformation/gradient pairs (retesting Gemini deficit), and 8 facilitation pairs (testing the pre-fill facilitation crossover).

Phase 10A used a 12-pair battery (8 forward + 4 reverse from the core pairs above) across 5 new models. Phase 10B tested 8 pairs under 3 pre-fill relation classes (on-axis, same-domain, unrelated).

Phase 11A reused the same 12-pair battery across 4 additional new models. Phase 11B screened 4 control candidates (accordion--stalactite, turmeric--trigonometry, barnacle--sonnet, magnesium--ballet) across 6 models. Phase 11C tested 6 pairs across a 2$\times$2 waypoint/temperature grid (3 forward pairs: light--color, hot--cold, emotion--melancholy; plus their reverses) on 3 models (Claude, GPT, DeepSeek).

---

## A.9 Model Inventory

| ID | Display Name | Provider | OpenRouter ID | Cohort |
|----|-------------|----------|--------------|--------|
| claude | Claude Sonnet 4.6 | Anthropic | anthropic/claude-sonnet-4.6 | Original |
| gpt | GPT-5.2 | OpenAI | openai/gpt-5.2 | Original |
| grok | Grok 4.1 Fast | xAI | x-ai/grok-4.1-fast | Original |
| gemini | Gemini 3 Flash | Google | google/gemini-3-flash-preview | Original |
| minimax | MiniMax M2.5 | MiniMax | minimax/minimax-m2.5 | Phase 10A |
| kimi | Kimi K2.5 | Moonshot AI | moonshotai/kimi-k2.5 | Phase 10A |
| glm | GLM 5 | Zhipu AI | z-ai/glm-5 | Phase 10A (rate-limited) |
| qwen | Qwen 3.5 397B-A17B | Alibaba Cloud | qwen/qwen3.5-397b-a17b | Phase 10A |
| llama | Llama 3.1 8B Instruct | Meta | meta-llama/llama-3.1-8b-instruct | Phase 10A |
| deepseek | DeepSeek V3.2 | DeepSeek | deepseek/deepseek-v3.2 | Phase 11A |
| mistral | Mistral Large 3 | Mistral AI | mistralai/mistral-large-2512 | Phase 11A |
| cohere | Cohere Command A | Cohere | cohere/command-a | Phase 11A |
| llama4 | Llama 4 Maverick | Meta | meta-llama/llama-4-maverick | Phase 11A |

All models accessed via OpenRouter API. GLM 5 was blocked by upstream rate limiting and excluded from analysis. Llama 3.1 8B Instruct is the sole small-scale model, included to probe scale effects.
