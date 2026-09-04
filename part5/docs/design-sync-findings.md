# Phase 2 — `/design-sync` against a React Native codebase

**Result: the sync will not run on this repo, and that is the correct outcome.**
Recorded here because "why the documented route does not apply" is a more useful
finding than a silent skip.

Date: 2026-09-04. Target: [`part4`](../../part4), Expo SDK 57, Expo Router.

---

## What we tried, in order

1. **`DesignSync` read call before authorizing** — refused outright:
   *"DesignSync needs design-system authorization. Run `/design-login`…"*
   Authorization is mandatory, not "if stale": not even `list_projects` works
   without it.
2. **`/design-login`** — succeeded. `list_projects` then returned `[]`, so no
   design system existed yet and this would have been a create.
3. **Invoking the skill from the agent** — blocked by design:
   *"Skill design-sync cannot be used with Skill tool due to
   disable-model-invocation… Do not replicate this skill's workflow by other
   means — it is reserved for explicit user invocation."*
   So the split for this phase was: the user runs the sync, the agent verifies
   the result through the tool's read methods.
4. **`/design-sync` run by the user, with `part4` as the working directory** —
   the skill inspected the repo and stopped before creating anything, offering
   to explain what would be required. That explanation is below.

## Why it refuses

`/design-sync` describes itself as pushing *"a React design system to
claude.ai/design… a converter that bundles the real component code (from
Storybook or a bare package)"*. It wants a **browser-renderable component
library**. This app is a React Native phone app with its UI written inline.

| The sync needs | This repo has |
| --- | --- |
| A component library with a public API | UI written inline in two screens |
| A compiled `dist/` bundlable to `window.<global>.*` | No build step — Metro bundles the app, not a library |
| Components that render in a browser DOM | React Native primitives (`View`, `Pressable`, `FlatList`) |
| `styles.css` and token files reachable by `@import` | `StyleSheet.create` objects and a TS `Palette`/`Spacing`/`Type` module |

Four gaps, in increasing order of difficulty:

1. **No shared component layer.** Roughly six to eight extractable components
   exist as duplication across the two screens — card surface, disclosure line,
   screen title, empty state, primary button, radio row, tone pill.
2. **No library build.** A second build target would be needed: a library entry
   re-exporting the components, a bundler emitting a bundlable `dist/`, and
   package exports pointing at it. Metro does not do this; `tsup` or `rollup`
   would have to sit alongside it.
3. **Browser/native mismatch.** Claude Design renders in a browser, where `View`
   and `Pressable` do not exist. The build would have to alias `react-native` to
   `react-native-web` and vendor it in. Plausible, but **unverified** — whether
   the converter copes with an RNW-aliased bundle is unproven, not known-good.
   Worse, `Platform.select` in `constants/theme.ts` would resolve to the *web*
   branch, so the design tool would see web font stacks rather than the iOS
   `ui-serif` the app actually renders. The design system would be subtly wrong
   in exactly the way that is hardest to notice.
4. **Tokens are not CSS.** `Palette`, `Spacing` and `Type` are TypeScript values
   read at runtime by `StyleSheet`. The sync wants CSS custom properties, so a
   generator emitting `--palette-background: #FAF4E8` from `theme.ts` would be
   needed to stop the two drifting.

## Decision

**Do not close those gaps.** Adding a bundler, a web build target, a CSS token
pipeline and a component library to satisfy a design tool is a large amount of
machinery in a project whose `CLAUDE.md` says *"One AI feature, two screens"* —
and the payoff would be mockups built from about seven components that fit on
one screen anyway. The tool should serve the project, not the reverse.

Instead we take **Option B** from the course text — *Create here*, uploading
existing brand material — rather than **Option C**, the codebase converter. The
tokens still come from the real codebase (`constants/theme.ts`); they are
carried across by hand instead of by converter.

The success-checklist item *"design system created in Claude Design from actual
codebase components"* is therefore met by a different documented route, and this
file is the note saying so.

---

## Two things the refusal surfaced that outlive this exercise

Neither is part of the Part 5 deliverable. Both are recorded rather than acted
on, so they are not lost.

- **Pressed-opacity drift.** The pressed state is `0.85` on one screen and `0.6`
  on the other. That is not a design decision, it is two copies that diverged —
  precisely what a shared component prevents. Good candidate for the Task 2
  cross-model verifier to find independently.
- **A `<Disclosure />` component is worth extracting on its own merits.**
  `CLAUDE.md` makes the AI-disclosure line mandatory on every screen rendering
  AI output, above that output, and records a past audit failure about its
  placement. It is currently defined twice, in two screens, with different
  alignment. One component that always renders above its content is a stronger
  guarantee than a convention repeated per screen and remembered by each future
  agent.

  Deferred deliberately: the Settings screen renders no AI output, so it does
  not need `<Disclosure />`, and doing the extraction now would widen a task
  that already amends the project's scope rule once.
