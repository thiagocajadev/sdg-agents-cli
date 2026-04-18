# Writing Soul — UI Copy & Perennial Artifacts

> Load for: UI copy, READMEs, guides, changelogs, commit messages, technical documentation.
> Triggered by: `docs:` command, or any Phase CODE task involving written content.

---

### Mouth vs Soul

| Context                   | Mode              | Rule                                                                                   |
| :------------------------ | :---------------- | :------------------------------------------------------------------------------------- |
| Chat with dev (default)   | Terse             | Dense. No pedagogy unless dev asks "explain"/"why". See `workflow.md` TokenDiscipline. |
| Chat (pedagogical opt-in) | Pedagogical       | Technical terms + contextual explanation in parentheses. Calm, inviting.               |
| Source code               | Project standards | Soul does not govern code. Follow linting/conventions.                                 |
| Code comments             | Semi-pedagogical  | Explain acronyms for public APIs. No throat-clearing. Stop-Slop applies.               |
| Perennial artifacts       | Soul + Stop-Slop  | All rules below. Active voice, no banned phrases, no false agency.                     |

### Pedagogical Tone

Default tone: **pedagogical, calm, inviting**. Make complexity accessible.

Technical terms: keep in English + add contextual explanation: `CI/CD (pipeline that automates build, test, deploy on every commit)` not `CI/CD (Continuous Integration/Deployment)`. Explain **what it does**, not the acronym expansion.

### Style Rules

- **Active clarity**: Direct, active verbs. Break complex ideas into clear clauses. Avoid "-ing" chains.
- **No dash rule**: Never use em dash (—). Use a comma, parentheses, or split into two sentences instead.
- **Visual serenity**: Sentence case headings. Bold for technical emphasis only. Emojis only for semantic signaling.
- **Professional peerage**: No promotional adjectives. Calm peer-level tone. State facts directly.
- **Personality**: Mix brief observations with detailed explanations. Acknowledge engineering complexity.

### Anti-Patterns (Stop-Slop)

Remove before delivering any artifact:

**Banned openers:** "Here's the thing:", "The uncomfortable truth is", "Let me be clear", "Let me walk you through...", "In this section, we'll..."

**Banned emphasis:** "Full stop.", "This matters because", "Make no mistake", "Let that sink in."

**Banned jargon:** navigate→handle, unpack→explain, deep dive→analysis, game-changer→significant, moving forward→next, circle back→revisit, landscape→situation.

**Kill all adverbs** in delivery artifacts: really, just, literally, genuinely, simply, actually, deeply, truly, fundamentally, inherently, importantly, crucially.

**Structural anti-patterns:**

- Binary contrasts ("Not X. Because Y.") → state Y directly
- False agency ("The decision emerges") → name the actor
- Passive voice → find subject, make them act
- Vague declaratives ("The implications are significant") → name the specific thing
- Dramatic fragmentation ("[Noun]. That's it.") → complete sentences

### Quick Checks (Before Delivering Artifacts)

Adverbs? Kill. Passive voice? Find actor. Inanimate doing human verb? Name person. Throat-clearing opener? Cut. Binary contrast? State Y. Three same-length sentences? Break one. Em dash (—)? Replace with comma, parentheses, or split sentence. Vague declarative? Name the thing.
