# Claude Design prompts

Written **before** opening Claude Design, so what we asked for stays separable
from what came back. Approved in chat on 2026-09-04 after a bounded brainstorm.

---

## The screen

A **Settings** screen for [Grandma's Wisdom of the Day](../../part4) — an Expo
app that currently has two screens, Wisdom and History.

### Why this screen needed a decision first

`part4/CLAUDE.md` caps the app at *"One AI feature, two screens"* and tells any
agent to say so rather than build a third. Adding Settings is therefore a
deliberate amendment to that rule, recorded here and in `CLAUDE.md` itself, not
an oversight. Two alternatives that would not have required the amendment — an
About route, and a redesign of the History empty state — were considered and
rejected: the first is nearly all type and would barely exercise the design
system, the second is too thin to yield three genuinely distinct layouts.

---

## The design prompt

Covering the four things the course text asks for: **goal, layout, content,
audience.**

> **Goal.** Give the app a Settings screen that lets someone set the tone they
> get by default, clear what the app has saved about them, and understand that
> the wisdom is machine-written. Someone opening it is usually there for one
> specific thing and leaving again — it is not a screen anybody browses.
>
> **Layout.** One scrolling column, a screen title, then three labelled
> sections in this order:
>
> 1. **Wisdom** — default tone, Wise or Funny, as two radio rows. Reuse the
>    radio pattern the Wisdom screen already uses: an outer ring with an inner
>    dot, a bold label, and a quieter hint line underneath it.
> 2. **History** — a destructive "Clear history" action in the danger colour,
>    with the saved count beside it, disabled when there is nothing saved.
> 3. **About** — a short block of running text.
>
> **Content.**
> - Section Wisdom: "Wise — Something calm and genuinely useful",
>   "Funny — Advice, right up until the last word". These are the exact strings
>   the Wisdom screen already uses; do not reword them.
> - Section History: "Clear history", and beside it either "42 saved" or
>   "Nothing saved yet". Clearing asks for confirmation first.
> - Section About: what the app is; that the wisdom is written by a model and
>   that is why the other two screens are labelled; that this is intended to
>   address the EU AI Act Article 50 transparency duty, phrased as an intention
>   rather than a settled claim; that the API key stays on the server and never
>   reaches the phone.
>
> **Audience.** Someone using a small, warm, deliberately unfashionable app on
> a phone, at arm's length. The type is larger than a typical app on purpose.
> It should feel calm and plain — closer to a printed page than to a control
> panel. No dark mode: this app commits to one warm light palette on purpose.
>
> **Constraints.** Use the attached design system for every colour, size and
> gap. Phone width. The screen renders no AI output, so it carries no
> AI-disclosure line of its own — the About text explains the labelling on the
> other screens, and must not become a substitute for it.

## The variations request

Sent as one message, not three:

> Show me three layouts for this screen. Same three sections and the same
> content in all three — only the arrangement differs. I want to compare them
> side by side, so do not refine one at the expense of the others.

## The accessibility pass

> Review this screen for readability and accessibility. Is any text too small
> or too low-contrast to read comfortably? Does the disabled state of the
> destructive action read as disabled rather than broken? Would a screen reader
> make sense of the order things are in, and of the radio group in particular?
> Tell me what to fix, worst first.

## The states to annotate

These travel with the handoff bundle, so they are written down rather than left
to the implementer to guess:

| Element | States |
| --- | --- |
| Default-tone radio row | selected, unselected, pressed |
| Clear history | enabled, pressed, disabled because nothing is saved |
| Confirmation | the confirm dialog, and what each button does |
