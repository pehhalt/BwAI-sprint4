# Part 5 — Claude Design and multitasking

Coursework for Sprint 4 / Part 5 of the Turing College "Building with AI" course.

Unlike the earlier parts, this one has no single lab at the end. It covers several
loosely connected topics and hides **two** graded pieces of work in the middle of
a lot of walkthrough. This folder holds the write-up and evidence for those two,
plus one optional extra we chose to do.

The app being designed for is **[Grandma's Wisdom of the Day](../part4)** — the
Expo app built in Part 4. The screen itself is built there; this folder holds the
notes, prompts, rationale and screenshots.

Progress is tracked in **[CHECKLIST.md](./CHECKLIST.md)**.

---

# Task 1 — Design a new screen and hand it off ✅

**Done.** A Settings screen designed in Claude Design against the app's real
tokens, handed off as a bundle rather than a screenshot, built on a branch,
reviewed, verified on a phone, and merged.

| The design (2a of three) | The built screen |
| --- | --- |
| <img src="docs/screenshots/settings-three-variations.png" alt="Three Settings layouts side by side: labelled sections on the ground, grouped cards, and an editorial serif treatment" width="420"> | <img src="docs/screenshots/settings-built.png" alt="The built Settings screen on a phone: WISDOM section with Wise and Funny radio rows, HISTORY with a Clear history row showing 24 saved, and the start of an ABOUT section" width="200"> |

The evidence, in the order it was produced:

| File | What it holds |
| --- | --- |
| [`docs/prompts.md`](./docs/prompts.md) | The goal / layout / content / audience prompt, written **before** opening the tool |
| [`docs/design-sync-findings.md`](./docs/design-sync-findings.md) | Why `/design-sync` refuses this repo, verbatim, twice |
| [`docs/design-system/style-guide.html`](./docs/design-system/style-guide.html) | The design system, extracted by hand from `theme.ts` and the screens |
| [`docs/design-log.md`](./docs/design-log.md) | Three variations, why 2a won, and the design measured against the built screen |
| [`docs/handoff-prompt.md`](./docs/handoff-prompt.md) | The Share → Claude Code prompt, verbatim, and what it did and did not carry |
| [`docs/design-system/exports/`](./docs/design-system/exports/) | The exported canvas, self-unpacking, all three artboards |

## What actually happened

### The documented route does not exist for this repo

`/design-sync` is a React → browser converter. It wants Storybook or a bare
component package that compiles to a bundle a browser can render. This is an
Expo app with its UI written inline in three screens, and it refused — correctly.
Four gaps, in increasing order of difficulty: no shared component layer, no
library build, React Native primitives instead of DOM, and TypeScript token
objects instead of CSS.

Closing them would mean a second bundler, a web build target aliasing
`react-native` to `react-native-web`, and a CSS token generator — and it would
make `Platform.select` in `constants/theme.ts` resolve to the *web* branch, so
the design tool would see web font stacks instead of the iOS `ui-serif` the app
actually renders. The design system would be subtly wrong in exactly the way
that is hardest to notice. We took Option B (upload existing brand material)
instead, and recorded the refusal rather than skipping it silently.

### Uploaded brand material beats an attached design system

The create flow forces you to pick a preset theme before it accepts anything,
which produced a design system called **Organic** — terracotta, Caprasimo over
Figtree, nothing to do with this app. It was attached to the canvas *and
comprehensively ignored*: not one hex from its palette appears in any of the
three artboards. The tokens came from the uploaded style guide sitting beside it.

Worth knowing before the next project. The theme you are forced to choose is a
formality when you are bringing your own tokens, and the design system it creates
is then overridden by the thing you upload next to it.

### The bundle carried structure and tokens, and nothing else

This is the part that justifies the whole exercise, and the part that
disappointed.

**What survived intact.** Every colour, size and gap. Measured off the exported
2a markup against `constants/theme.ts`: `#FAF4E8`, `#FFFDF8`, `#E7DCC6`,
`#3E2F23`, `#6E5B49`, `#6E8B6A`, `#A85A46` — exact. 34 / 25 / 18 / 17 / 14px
type — exact. 10 / 16 / 24 / 36px spacing — exact. Radius 14 and the 26 / 13 / 7
radio geometry — lifted from `index.tsx` and returned unchanged. The copy came
back word for word, including the strings we asked it not to reword. A screenshot
handoff would have made the agent guess at every one of those.

**What did not travel.** The custom instructions were not in the generated
prompt. Reuse the existing components, do not touch Wisdom or History, keep the
key server-side — every one of those had to be restated by hand. The bundle
answers *what does it look like* and says nothing about *what is this codebase
not allowed to do*. `CLAUDE.md` remained the only thing carrying that, which is
why it was extended before the build rather than after.

**The selection did not travel either.** The canvas offered no way to scope the
share to one artboard, so the handoff points at the whole document and the choice
rides on a hand-typed line: `Implement: Use layout 2a.` The mechanism meant to
carry it did not; prose did.

Two things in the design were also *not* inherited from the code and were
therefore decisions rather than transfers: the `.06em` letter spacing on the
section labels (no token exists — it became `0.84px`, because React Native takes
points and cannot track font size), and using `Fonts.serif` for a screen title,
which no shipped screen did before.

### The loop does not close, in either direction

The course text presents the return sync as routine: *"Execute `/design-sync` to
push updated codebase states back to Claude Design."* On this repo, neither route
works — and trying both **fragments** the design system rather than converging it.

| Route | Outcome |
| --- | --- |
| `/design-sync` → the design system | Refuses. Same four gaps. A third screen did not change anything. |
| Browser upload of brand material | Succeeds, and creates a **new project every time**. Not an update mechanism. |

Three projects now exist where one was intended, and the sharpest way to put it
is this: **the design system is the only one of the three that has never held
this app's tokens.**

| Project | Type | Holds |
| --- | --- | --- |
| `Organic` | design system | the preset's terracotta tokens, untouched since creation |
| `Grandma's Wisdom mobile app` | project | the canvas, `Organic` attached and ignored, the *Phase 2* style guide |
| `Mobile app design scope` | project | the *current* style guide and all three screenshots |

The newest upload is the only place with the shipped values and the one place
nothing is attached to. That is not a workflow, it is an accumulation.

The regenerated guide was verified as having arrived complete and correct — the
new section-label and destructive-row components, the three new contrast
measurements, the re-triaged inconsistencies table. It simply arrived somewhere
that nothing reads.

**Not worked around.** Writing the guide into the design system directly through
the `DesignSync` tool would have succeeded — it is writable. It was not done:
the skill records that its workflow is reserved for explicit user invocation and
must not be reproduced by other means, and hand-rolling a sync to route around a
sync that refused is exactly that. A design system populated by an agent
bypassing the tool is not the round trip this exercise is testing.

### Did the second sync change anything?

No, and that is the answer the checklist asked for. It refused again on the same
four gaps, created nothing, and adding a third screen moved none of them.

Recorded as **confirmed on re-inspection, not independently reproduced** — the
second run read the existing findings and honoured the prior decision rather than
re-deriving it. It did real work on top: re-verified the gaps against the current
repo, found the Storybook absence itself, and caught two facts that had gone
stale. But calling that a second test from scratch would overstate the evidence.

It also surfaced two things worth keeping:

- **The pressed-opacity drift closed itself.** `0.85` on one screen and `0.6` on
  the other became one value — not because anyone fixed it, but because the `0.6`
  copy lived on History's Clear button and Settings took that button over. There
  is still no token, so a third copy would diverge the same way. Convergence by
  luck, not by structure.
- **The `<Disclosure />` extraction is now unclaimed rather than deferred.** It
  was held back to avoid widening the Settings task; that reason expired at the
  merge. Still defined twice, still with different alignment.

### What the agent got wrong

Written down because "the build went fine" is not a finding. All of these were
caught by `/code-review` on the branch, before merge:

- **The disabled row faded *and* recoloured**, while the comment above it claimed
  only the colour swap. The two stacked, taking the "Nothing saved yet" line from
  6.35:1 to roughly 3:1 — and that line is the only thing explaining why the row
  is inert. The worst of the five, because the comment asserted the opposite of
  what the code did.
- **Clearing assumed it succeeded.** `clearHistory()` swallows its storage
  failure and resolves either way; the count was set to zero regardless. A failed
  write would have shown "Nothing saved yet" over a History tab still listing
  everything.
- **A race the comment claimed to prevent.** The stored default is read
  asynchronously, so a tap landing first was silently overwritten — precisely the
  failure the comment above it said it was avoiding.
- **`accessibilityState.selected` without `checked`**, so the radio rows were
  never announced as checkable. Copied from the Wisdom screen, where the same bug
  had been sitting unnoticed. Both are fixed now.

One finding was rejected: the review read the cold-start-only default tone as a
defect. It is the specified behaviour — Settings decides what is checked when the
app opens, the picker on the Wisdom screen decides what that request asks for.

### The design matched the build everywhere except the fold

On a phone, the hint lines under Wise and Funny wrap to two lines where the
design showed one, every radio row grows, and the About section ends up below the
fold. Almost certainly a device-width difference: the design frame was 402pt, a
current-generation iPhone, and the test device is older and narrower.

Left alone — the screen scrolls, About is reference text, and narrowing the
design to the smallest phone in circulation would be optimising for the test
device. But it cost an argument: *"2b pushes About below the fold"* was one of
four reasons 2a won, and on hardware 2a does it too. The honest version is that
2a fits more above the fold, not everything. **Any argument resting on what sits
above the fold is an argument that moves with the phone.**

## Where this fell short

- **Phase 4 barely happened.** Of the four refinement mechanisms, only chat was
  used. No inline comments, no Tweak controls, and the one direct canvas edit was
  made on a state that never became the final export. No annotations were added
  to the canvas at all, so the course success item for them is marked not met.
- **That omission has a visible cost.** Annotations are the mechanism that would
  have carried the pressed / disabled / empty states into the bundle. They were
  specified anyway — in `prompts.md`, before designing — and implemented. But
  they travelled in a markdown file rather than in the handoff, which is the
  refinement phase's whole purpose: it is where a design stops being a picture
  and becomes a specification.
- **The usage baseline was never recorded**, so the before/after comparison this
  folder planned cannot be made honestly. Marked as such rather than estimated.

---

# Task 2 — An independent verifier on an open-weight model

**Not started.** Not blocked either.

Configure the **standalone Codex CLI** to run an open-weight model through
OpenRouter, then use it to adversarially review code Claude Code wrote.

The reasoning is single-point-of-failure: if your builder and your reviewer are
the same model family from the same vendor, they share blind spots, and an access
change at that vendor takes out both at once. Claude Code builds, an open-weight
model on OpenRouter checks — different family, different provider, weights that
stay downloadable regardless.

Task 1 has left it a good target: the Settings branch is merged, and the five
findings `/code-review` produced are a benchmark. A second reviewer that finds
none of them tells you something; one that finds a sixth tells you more.

# Task 3 — The `codex-plugin-cc` plugin

**Not started.** Optional, and being done because the key already exists.

OpenAI's plugin exposes `/codex:*` slash commands inside Claude Code — notably
`/codex:adversarial-review`. Not the same thing as Task 2: the plugin runs
OpenAI's models from inside Claude Code, Task 2 runs an open-weight model from a
separate terminal. Doing both gives three independent reviewers on the same diff.

## Skipped on purpose

| Skipped | Why |
| --- | --- |
| The CV walkthrough in Claude Design | A tutorial with no success checklist. Task 1 exercised the same tool on something that mattered more. |
| Git worktrees | The text itself says leave them alone at first — one agent per project is the habit worth building. |
| Parallel-session practice as a *deliverable* | It is a working habit, not something with an artefact. It happened while working — the second `/design-sync` ran in its own session — and is not documented as a deliverable. |

---

## How the risks played out

Predicted at the start, before any tooling was opened. Kept here because the
scoreboard is more useful than the predictions were.

| Risk | Outcome |
| --- | --- |
| `/design-sync` may not accept a React Native codebase | **Happened, exactly as described.** The predicted failure point was the failure point. The fallback named in advance — Option B — is what was used. |
| `part4` is mid-upgrade, SDK 54 → 57 | **Avoided.** Nothing touched `part4` until the upgrade landed and ran on the phone. |
| Claude Design is beta and needs Pro/Max | **Not the real gate.** It was available; the gate was `/design-login`, without which not even listing projects works. |
| Usage burn | **Not measured.** The baseline was never recorded, so this one cannot be answered either way. |
| Model slug `z-ai/glm-5.2` may not exist | Untested — Task 2 has not started. |
| `wire_api = "responses"` | Untested — Task 2 has not started. |
| Windows | Untested for Task 2. Irrelevant to Task 1. |

## Cost

| Thing | Who bills |
| --- | --- |
| Claude Design + Claude Code | Existing Claude plan allowance — shared, so design work eats coding budget |
| Open-weight model via OpenRouter (Task 2) | OpenRouter, existing key, spending cap already set |
| `codex-plugin-cc` (Task 3) | OpenAI, separately, on the existing key |
