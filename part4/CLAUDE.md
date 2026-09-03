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

One AI feature, two screens. Do not add user accounts, a database, sharing,
notifications, or a second AI feature. If a request seems to need one, say so
rather than building it.

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
  disclosure — this does not carry over automatically.
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
