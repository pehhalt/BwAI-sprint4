@AGENTS.md

# Project rules — Grandma's Wisdom of the Day

## The key rule (non-negotiable)

- The OpenRouter key must stay on the server side. Make all model calls from a
  server route (`app/api/*+api.ts`), never from inside the app. Never hardcode
  the key and never put it behind an `EXPO_PUBLIC_` variable. Keep the `.env`
  file git-ignored.

Anything with an `EXPO_PUBLIC_` prefix is inlined into the JavaScript bundle
that ships to every phone, where it can be read straight back out. A key placed
there can be copied and used to run up charges. If a change would require the
app to hold the key, the change is wrong — move the call to the server route
instead.

## The SDK

- This project runs on **Expo SDK 57**, because that is what the App Store build
  of Expo Go requires.
- **Expo Go only ever supports the newest SDK, and it is not backward
  compatible.** It updates itself, and when it does, an older project stops
  opening. So the SDK is not a preference to be pinned — it tracks whatever Expo
  Go currently needs.
- This project was previously pinned to SDK 54 with a rule saying never to
  upgrade. Expo Go updated to 57 and that rule became the thing breaking the
  app. If Expo Go refuses to open the project again, upgrade rather than
  looking for a way to hold the old version.

## Scope

One AI feature, **three** screens: Wisdom, History, Settings. Do not add user
accounts, a database, sharing, notifications, or a second AI feature. If a
request seems to need one, say so rather than building it.

This rule read *two* screens until 2026-09-04. Settings was added deliberately,
as a Part 5 exercise in designing a screen in Claude Design and building it from
the exported handoff bundle, and the amendment was approved before any code was
written. It is recorded here so the third screen does not read as drift to the
next agent. **The cap is now three.** A fourth screen is a new amendment and
needs the same conversation, not an assumption that the number keeps moving.

### What Settings is allowed to do

- Set the **default tone** (Wise or Funny) that the Wisdom screen starts on.
- **Clear the saved history**, behind a confirmation.
- Carry an **About** block: what the app is, why the other two screens are
  labelled, and that the key stays on the server.

### What Settings must not do

- **No AI calls of its own.** It renders no model output, so it starts no
  requests and touches no key. The server-route rule above is not softened by
  the existence of a settings screen — it has nothing to send.
- **It is not where the AI disclosure lives.** See the disclosure rule below.
  Settings explains the labelling that Wisdom and History carry; it does not
  replace it, and moving the disclosure here would be the exact failure the
  audit already caught once.
- **No theme switch, no dark mode toggle.** `constants/theme.ts` says why this
  app commits to one warm light palette. A settings screen is where that
  decision gets quietly reversed, so it is ruled out here explicitly.

### The agreed blast radius on the existing screens

Adding Settings touches the other two, and that was scoped in advance rather
than left to judgement:

- `app/(tabs)/index.tsx` reads the stored default tone on mount.
- `app/(tabs)/history.tsx` gives up its Clear button to Settings.

Anything beyond those two is out of scope for the Settings work.

### Where the design came from

The screen was designed in Claude Design against this app's real tokens and
built from the exported bundle, not from a screenshot. The prompt, the three
layout variations, the selection rationale and the export live in
`../part5/docs/` — start at `../part5/docs/design-log.md`. If the built screen
and that design disagree, the disagreement is worth recording rather than
silently resolving in either direction.

## Conventions

- TypeScript throughout, Expo Router file-based routing.
- Install packages with `npx expo install`, not `npm install`, so versions stay
  compatible with the SDK.
- Colours, spacing, and type sizes come from `constants/theme.ts` — no hardcoded hex
  values in screens.
- The AI-disclosure line (`Wisdom is AI-generated.`) must appear on **every**
  screen that renders AI output, and must sit **above** that output rather than
  below it. A label placed after its content can be scrolled past unseen; on the
  History screen it once was a list footer, after up to 100 entries, which an
  audit flagged as a failure. Never a `ListFooterComponent`, a modal, a settings
  page, or a dismissable banner. A new screen showing AI output needs its own
  disclosure — this does not carry over automatically. The Settings screen now
  exists and renders no AI output, so it carries no disclosure line of its own;
  that is why "never a settings page" above is a live rule rather than a
  hypothetical one.
- That line is intended to address the EU AI Act Article 50 transparency duty.
  Describe it that way rather than asserting compliance as settled fact; the
  classification depends on deployment context, not on the code alone.
- Commit messages describe what changed and why. Never "updates" or "fix stuff".

## The prompt

The wisdom must be ONE sentence with no explanation after it. A trailing
clause ("...and you'll find joy in the journey") is what makes output read as
machine-written, and it is the failure this prompt was rewritten to stop. If
output starts explaining itself again, tighten the prompt before reaching for a
different model — that is the order that worked.

Tone examples in the prompt do real work; adjectives alone did not move the
model. Do not name specific objects in the guidance, though: an earlier version
listed "bread, rain, shoes, neighbours" as examples of concrete things and the
model parroted them back in most replies.
