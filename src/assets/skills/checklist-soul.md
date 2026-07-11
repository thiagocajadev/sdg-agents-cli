# Checklist Soul: the writing gate that runs before and after

> Operational companion to `writing-soul.md`. The soul holds the rules; this file holds the ritual that makes them fire.
> Load both for: any `docs:` cycle, and any Phase CODE task that writes prose.

---

## Why this file exists

A model writing prose falls back on its training default: polished sentences, balanced rhythm, a closing line that sounds like a verdict. That default survives a single reading of the rules, because reading a rule is not the same as suspending a habit. The soul states what good writing looks like. This checklist forces a stop before the habit runs.

The ritual has two halves. **Recite Part 1 before every file**, once per file, not once per cycle. **Run Part 2 before every checkpoint**.

## Fundamental concepts

| Concept          | What it is                                                                                        |
| :--------------- | :------------------------------------------------------------------------------------------------ |
| **Mental reset** | Naming the training default being suspended, out loud, before the first write                     |
| **Recitation**   | Emitting the checklist as text, item by item, so the gate is auditable                            |
| **Pass**         | One focused re-read of a draft hunting a single class of defect                                   |
| **writing-lint** | The advisory hook that scans Markdown writes against the soul banlists and reports hits to stderr |

---

## Part 1: recite before writing (blocking)

Emit these items before the first `Write` or `Edit` of each file.

### Mental reset

- [ ] **Training default suspended**, and named: impressive prose, balanced rhythm, a closing line that lands. None of it ships.
- [ ] **Audience fixed**: a senior engineer explaining to the colleague at the next desk. Plain sentence, concrete example.
- [ ] **Goal fixed**: understanding on the first pass. Clarity outranks brevity, and clarity outranks elegance.

### Rule passes

Each item is one focused re-read against a section of `writing-soul.md`. Read the section, do not recall it.

- [ ] **Anti-pattern pass** (§ Anti-patterns). Banned openers, banned emphasis, banned jargon, adverbs, metaphor for mechanics, effect closers, filler, binary contrast, false agency, passive voice, vague declaratives, dramatic fragmentation.
- [ ] **Voice pass** (§ Default voice, § How to write). Active sentences, one idea each, conclusion first, no em dash, peer tone.
- [ ] **Structure pass** (§ Default structure for perennial artifacts). Intro paragraph after the H1, concepts table at three or more technical terms, blocks broken before they become walls.

### Checks the soul does not cover

These are procedural, so they live here.

- [ ] **Gloss coverage judged by the reader, not by the term's shape.** A term gets a gloss on first occurrence when it would stop a newcomer, acronym or not. Re-gloss when the term returns far from where it was introduced.
- [ ] **Coined jargon gets described, not shipped.** A phrase invented while writing (`tight pair`, `blank`, `single-line`) is not the reader's vocabulary. Describe the behavior instead.
- [ ] **Translation describes behavior.** Prefer the plain description over the loanword: "write operation" over "mutation", "does not change after assignment" over "immutable".
- [ ] **Link anchors are explicit and ASCII.** A heading that is a link target carries `<a id="ascii-slug"></a>` above it. An anchor generated from accented or renamed heading text breaks on the next edit.
- [ ] **Fenced code blocks stay byte-identical during a prose pass.** A prose revision that edits an example is a scope change, and it gets recorded before it happens.
- [ ] **Good examples dogfood the code style.** An example labeled Good obeys `code-style.md` in full: no logic in the `return`, blank line before the `return`, boolean prefix, no framework abbreviations.

---

## Part 2: validate before the checkpoint (blocking)

### Automated

- [ ] **writing-lint reported no hits** on the files written this cycle. The hook is advisory and exits zero, so a hit is silent unless it is read. Read stderr.
- [ ] **Project gates green**: whatever the repo runs for lint and tests. A prose cycle still touches files the build cares about.

### Manual

The hook matches banlists. The defects below have no banlist, so they need eyes.

- [ ] **Re-read hunting fresh metaphor.** Ask of each new paragraph: does this sentence inform, or does it only sound good? An unseen metaphor is exactly the one no banlist holds.
- [ ] **Re-read hunting the restated point.** The same idea in a second phrasing reads as emphasis while writing and as padding while reading. Keep one phrasing.
- [ ] **Re-read the closers.** The last sentence of a section is where the training default reappears as a verdict. Cut it, and end on the last piece of information.
- [ ] **Backlog updated**: what shipped, what the developer corrected along the way, what stayed open.

---

## Language

Project artifacts ship in English: skills, guides, READMEs, changelogs, commit messages. The developer asks for another language explicitly, per task. Switching language changes the words and nothing else, because every rule in the soul and every pass above applies unchanged.
