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

## The SDK pin (non-negotiable)

- This project is pinned to **Expo SDK 54**. The target iPhone's Expo Go cannot
  load a newer SDK, so an upgrade makes the app unopenable on the only device it
  is meant to run on. Never run `npx expo install --fix`, `expo upgrade`, or
  `expo@latest`. If a package needs a version bump, pin it to the SDK 54
  compatible release instead.

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
- The AI-disclosure line (`Wisdom is AI-generated.`) stays visible next to the
  AI output. It satisfies EU AI Act Article 50; do not move it behind a modal,
  a settings page, or a dismissable banner.
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
