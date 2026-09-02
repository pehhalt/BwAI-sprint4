---
name: lab-to-deck
description: Convert course lab, lesson, or assignment text into a Slidev slide deck exported as a PDF. Use whenever someone supplies lab/tutorial/module/course text — pasted or in a file — and asks for slides, a deck, a presentation, or a PDF of the practical tasks.
---

# Lab text → Slidev deck → PDF

Produce a deck someone can actually work from: the tasks, the exact prompts, and the completion criteria — not the prose around them.

## Inputs

Ask only for what is missing.

- **The lab text** — pasted into chat, or a path to a file.
- **Target folder** for the PDF. Default: the current working directory.
- Optional: the part/module title for the cover slide.

Turing College intra pages (`intra.turingcollege.com`) are client-rendered SPAs behind auth. WebFetch and curl return the same empty ~4 KB shell for every path, and subpaths answer 404. **Do not attempt to fetch them** — ask for a paste instead.

## Step 1 — Extract, don't transcribe

**Keep:**
- Every numbered step and its instruction
- `Access:` / precondition lines — compress to one line each
- **Prompts, commands and code verbatim.** Never paraphrase these; they are the operative content
- Selection criteria and checklists
- Reflection questions — these are instructions to the learner, not commentary

**Cut:**
- Rationale, motivation, and encouragement prose
- Explanation of tools that will not actually be used
- Back-references ("as we saw earlier in this lesson")
- Restatements of what a later section already says

Test for a borderline line: **does the reader *do* something with it?** Keep it if yes.

## Step 2 — Deck shape

Default structure — adapt to the source, don't force it:

1. **Cover** — title, one-line summary of the arc, time budget if stated
2. **Overview** — Mermaid flowchart of the stages, including any loop-backs
3. **Context** — idea selection, criteria, worked examples
4. **One slide per Part** — its `Access:` line, its steps, its verbatim prompts
5. **Done When** — completion checklist

If a Part needs more than ~11 lines of rendered body text, split it across two slides rather than shrinking the font.

**When the lab points at material it doesn't include** ("paste the definition from the audit section above", "use the template from the lesson"), the deck has a hole exactly where the learner needs it. Say so, and offer to fill it by parallel construction from whatever sibling the lab *does* spell out. If you write that content, label it on the slide itself — `is <b>not</b> quoted from the lab` — so nobody mistakes your wording for the course's.

An empty bottom third is fine on a working handout. Don't pad slides to fill it.

## Step 3 — Workspace

A scaffold is ~500 MB of `node_modules`. **Reuse an existing deck folder** rather than creating one per lab — but give each lab **its own entry file** under `slides/`. Slidev takes the entry as an argument, so one install serves every deck and no source is ever overwritten.

```bash
ls lab-deck/package.json 2>/dev/null    # reuse the folder if present
ls lab-deck/slides/                     # one .md per lab, kebab-case slug
```

```
lab-deck/
  slides.md                             # one-slide pointer, so `pnpm dev` still works
  slides/
    build-your-own-automation-skill.md
    audit-an-earlier-project-for-compliance.md
```

**Never write over an existing `slides/*.md` or a bare `slides.md` holding a real deck.** Decks get revised weeks later; a lost source means rebuilding from the PDF. Slidev drops a generated `slides/node_modules/.slidev` cache (~28 KB) next to the entry. The scaffold's `.gitignore` lists `node_modules` with no slash, which git matches at any depth, so this is already covered — don't add a rule for it. What the scaffold does *not* cover is the `preview` PNG directory from Step 5; append it.

To scaffold a new one — `create-slidev` is **interactive** and will hang without a TTY, so pipe it an answer:

```bash
printf 'n\n' | pnpm create slidev lab-deck
cd lab-deck && pnpm install
```

It asks "Install and start it now using npm?" even when launched via pnpm. Answer no and run `pnpm install` yourself, or you get an npm lockfile in a pnpm project.

## Step 4 — Writing the entry file

| Rule | Why |
|------|-----|
| **No `v-click`, no animations** | On PDF export each click step becomes its own page — 9 slides silently become 20+ |
| Mermaid `flowchart LR`: `{scale: 0.75}` and short node labels | At default scale a 5-node LR chart runs off the right edge and the last node is cut off entirely |
| A Mermaid edge label sits *on* the next node | Lengthen the label (`\|"if time allows"\|`) — Mermaid sizes the edge to fit it — and drop `scale` a notch to compensate |
| Give every content slide an `Access:` div under the `# heading` | The default theme renders the first paragraph after an `h1` as a muted subtitle. Without the div, your first real sentence silently turns grey |
| Prompts in ` ```text ` fences | Preserves line breaks exactly; no syntax highlighting to mangle them |
| `theme: default` | Cleaner than `seriph` for dense technical content |
| Write the file with the **Write tool**, not a shell heredoc | Apostrophes in the slide text ("this week's report") break a quoted heredoc on Git Bash |

Useful patterns:

```md
<!-- Access line: small, muted, tight under the heading -->
<div class="text-sm opacity-70 -mt-2 mb-4">Access: …</div>

<!-- Reflection block -->
<div class="mt-4 p-3 bg-gray-400 bg-opacity-10 rounded text-sm">
<b>Reflection</b> — …
</div>

<!-- Criteria side by side -->
<div class="grid grid-cols-3 gap-4 mt-8">…</div>
```

Slidev renders Mermaid natively inside slides — no `mmdc`, no PNG export step, no `diagrams/` folder. That is a different pipeline from the `design-doc-mermaid` skill; do not mix them.

## Step 5 — Verify visually — do not skip

A successful build proves **nothing** about layout. Export PNGs and actually look at them:

```bash
pnpm exec slidev export slides/<lab-slug>.md --format png --output preview
```

Read the rendered images. Check every slide for:
- Content clipped at the right or bottom edge
- Diagrams running outside the frame
- Code blocks overflowing their container

Fix and re-export until clean. This step is what catches the Mermaid overflow above.

## Step 6 — Export and clean up

```bash
pnpm exec slidev export slides/<lab-slug>.md --output "<target-folder>/<lab-slug>.pdf"
rm -rf preview
```

Confirm the page count rather than assuming it — a stray `v-click` inflates it silently:

```bash
python -c "
import re,zlib,sys
d=open(sys.argv[1],'rb').read(); n=0
for m in re.finditer(rb'stream\r?\n',d):
    s=m.end(); e=d.find(b'endstream',s)
    try: n+=len(re.findall(rb'/Type\s*/Page\b(?!s)',zlib.decompress(d[s:e])))
    except Exception: pass
print('pages:',n)" "<target-folder>/<lab-slug>.pdf"
```

(A plain `grep /Type/Page` returns 0 — Slidev's PDFs keep the page tree inside compressed object streams.)

If export fails with:

```
Error: The exporting for Slidev is powered by Playwright,
please install it via `npm i -D playwright-chromium`
```

then add it — it is **not** part of the scaffold:

```bash
pnpm add -D playwright-chromium
```

Nothing downloads automatically. Browser binaries live in `~/AppData/Local/ms-playwright/` and are shared across projects, so only the first deck pays for it.

Name the PDF from the lab title in kebab-case, e.g. `lab-build-your-own-automation-skill.pdf`.

## Report back

State the PDF path, the slide count, the deck structure, and **what was cut** — so the omissions are a visible decision rather than a silent one. Name anything you authored rather than extracted, and any material the lab referenced but did not supply.
