# Design log — the Settings screen

Phase 3 of [`CHECKLIST.md`](../CHECKLIST.md). Three layouts were requested in a
single message, against the prompt in [`prompts.md`](./prompts.md). Same three
sections and the same copy in all three; only the arrangement differs.

Screenshot: [`screenshots/settings-three-variations.png`](./screenshots/settings-three-variations.png)
Full export: [`design-system/exports/Grandmas Wisdom App.html`](./design-system/exports/)

---

## The three

### 2a — Labelled sections on the ground *(selected)*

Section names as small caps directly on the cream ground. Only the interactive
rows are surfaces: two radio rows and one Clear-history row. About is plain
running text with no container. Confirmation is a centred modal dialog.

### 2b — Grouped cards

Each of the three sections is its own bordered card on the ground, section label
inside the card. Confirmation happens in place, inside the History card, with no
overlay.

### 2c — Editorial

Section heads set in the serif at wisdom size (25px), so the screen reads in the
same voice as the wisdom itself. Only the radio rows keep a surface; Clear
history is bare text under a rule. Confirmation is a bottom sheet.

---

## Why 2a

**It is the only one of the three that does not invent a new visual idea.**
Wisdom and History already put content on the cream ground with a single card
for the thing you interact with. 2a is that pattern with a third section added.
2b introduces card-nesting the app has nowhere else; 2c introduces a serif
heading level between `Type.title` and `Type.body` that no shipped screen uses.
Either would have to be back-ported to the other two screens or left as a
one-off, and a one-off on the third screen of a three-screen app is drift.

**The About text reads as page copy rather than as a control.** In 2b it sits
inside a card, which makes it look like something you can act on. It is the one
part of this screen that is purely there to be read, and 2a is the only layout
that says so.

**It fits.** 2b spends the most vertical space on containers and pushes About
below the fold on a 402×874 frame; the About block is where the AI-labelling and
key-handling explanation lives, so burying it is the wrong trade on this screen
in particular.

**The destructive action stays legible as destructive.** 2c makes Clear history
bare text under a rule, which is quieter than the same action is anywhere else
in the app. Quiet is right for a destructive control up to a point, but 2c goes
past the point where it still reads as a control at all.

### What 2a gives up

- **It scales worst.** If a fourth section ever arrives, 2b's card grouping is
  the layout that survives it. Accepted: `CLAUDE.md` caps this app at three
  screens and this screen at three sections, so the case does not arise.
- **The centred dialog is the most conventional of the three confirmations.**
  2c's bottom sheet is closer to current iOS. Accepted: a centred alert is what
  `Alert.alert` gives for free on both platforms, and this screen is not the
  place to hand-roll a sheet.

## Where the tokens actually came from

The canvas project holds **both** sources: the "Organic" design system attached
at `_ds/organic-5e1ee6eb…/`, and our own material at `uploads/style-guide.html`
alongside `uploads/wisdom.png` and `uploads/history.png`.

The designs followed the uploads. Not one hex from Organic's palette — the
terracotta `#c67139`, the `#f5ead8` ground — appears in any of the three
artboards, and Caprasimo and Figtree appear nowhere. **Uploaded brand material
beats an attached design system.** That is worth knowing before the next project:
the "pick a theme" step in the create flow is a formality when you are bringing
your own tokens, and the design system it produces is then quietly overridden.

## What the variations tell us about the design system

The tokens survived intact. Measured off the 2a markup against
`part4/constants/theme.ts`:

| In the design | Token | Match |
| --- | --- | --- |
| `#FAF4E8` ground | `Palette.background` | exact |
| `#FFFDF8` rows, tab bar | `Palette.surface` | exact |
| `#E7DCC6` borders | `Palette.border` | exact |
| `#3E2F23` body text | `Palette.text` | exact |
| `#6E5B49` labels, hints, counts | `Palette.textMuted` | exact |
| `#6E8B6A` radio fill, active tab | `Palette.accent` | exact |
| `#A85A46` Clear history | `Palette.danger` | exact |
| 34 / 25 / 18 / 17 / 14 px | `Type.title` / `.wisdom` / `.body` / `.label` / `.caption` | exact |
| 10 / 16 / 24 / 36 px gaps | `Spacing.sm` / `.md` / `.lg` / `.xl` | exact |
| radius 14, radio 26 / 13 / 7 | `index.tsx` radio row | exact |

Two things in the design are **not** in `theme.ts` and are therefore decisions,
not inheritance:

1. **`letter-spacing: .06em` on the small-caps section labels.** No token. Either
   add one or hardcode it with a comment.
2. **A serif family for the screen title.** `theme.ts` has `Fonts.serif`, but no
   shipped screen currently uses it for a screen title — Wisdom uses it for the
   wisdom itself. Using it for "Settings" is new.

Neither is a problem. Both are the kind of thing that is invisible in a
screenshot handoff and explicit in a bundle handoff, which is the point the
round trip was meant to demonstrate.

---

# The design against the built screen

Phase 5. Design: 2a in
[`screenshots/settings-three-variations.png`](./screenshots/settings-three-variations.png),
rendered in a 402×874 frame. Built:
[`part4/docs/screenshots/settings.PNG`](../../part4/docs/screenshots/settings.PNG),
photographed on the actual phone with 24 real entries saved.

**Divergence is a finding, not a failure.** Three of them, in descending order
of how much they matter.

## 1. About falls below the fold — and that was an argument for this layout

On the phone, the About section is cut off after its first line. Everything
below it needs a scroll.

This is the uncomfortable one, because *"2b pushes About below the fold"* was
one of the four reasons 2a won. On a real device 2a does it too. The argument
was made against a 402×874 design frame and the frame flattered it.

The screen is a `ScrollView`, so nothing is lost and this is not a compliance
question — the AI-disclosure line lives on Wisdom and History, above their
output, and the About block only explains why it is there. But the honest
version of the Phase 3 rationale is: **2a fits more above the fold than 2b, not
enough to fit everything.** The other three reasons for 2a — no new visual
idea, About reading as page copy, the destructive action staying legible — all
survive contact with the device unchanged.

Not chased. Making About fit would mean tightening the 36px section rhythm the
design specifies, which trades a faithful build for a marginal gain on
reference text nobody reads twice.

## 2. The hint lines wrap, so every radio row is taller than drawn

"Something calm and genuinely useful" is one line in the design and two on the
phone. Same for "Advice, right up until the last word". The design frame was
402pt wide with 24pt padding; the real device is narrower once its own
insets are taken, and `Type.label` at 17 plus `Type.caption` at 14 need more
room than the mock allowed.

This is the direct cause of divergence 1 — two extra text lines is roughly the
About block's worth of vertical space. Worth knowing for the next screen: a
design frame is a guess at a device, and text that fits on one line in the mock
is the first thing to check on hardware.

## 3. The tab bar icons are filled in the app and outlined in the design

The design drew outline icons for all three tabs. The app uses `house.fill` and
`clock.fill`, which predate this work, and the new `slider.horizontal.3` follows
them. Not introduced by this build — but it means the design and the app
disagree about the tab bar, and the design is the one that is wrong.

## What matched exactly

Everything else, and it is worth listing because this is the part a screenshot
handoff would have got wrong:

- `Settings` in the serif at `Type.title`, flush left
- the small-caps section labels in `Palette.textMuted` at `Type.caption`, with
  the letter spacing resolved from the design's `.06em`
- the selected radio row: `Palette.accent` border over `Palette.accentSoft`
  fill, 26/13/7 ring geometry
- the unselected row on `Palette.surface` inside `Palette.border`
- Clear history in `Palette.danger` with the live count beside it, on one
  surface row
- the 36px rhythm between sections, and 10px between the radio rows
