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
