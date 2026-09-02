# Roll a Dice 🎲

A single-screen Expo app: a die you roll with a button and recolour by tapping it.
Built for the "build and preview a small mobile app" lab.

## What it does

- **Roll** — tap the button and the die shakes for 600ms, tumbling through faces before
  settling on a result. A counter underneath tracks how many times you've rolled.
- **Recolour** — tap the die itself to step through white → yellow → red → green → blue
  and back. It stays on whichever colour you leave it on; rolling never resets it.
- Works on iOS, Android and the web from the same code — the die and its pips are plain
  `View`s, so there are no image assets to go missing.

## Running it

You need Node.js, and the [Expo Go](https://expo.dev/go) app on your phone. Phone and
computer must be on the same Wi-Fi network.

```bash
npm install
npx expo start
```

Scan the QR code — with the Camera app on iOS, or from inside Expo Go on Android.

If it won't connect on Windows: set your Wi-Fi network profile to **Private**, allow
Node.js through Windows Defender Firewall, and failing that run `npx expo start --tunnel`
and scan the new code.

## ⚠️ This project is pinned to Expo SDK 54 on purpose

Expo Go on the App Store is pinned to **SDK 54** — Expo stopped publishing current Expo Go
builds to the store. `npx create-expo-app@latest` scaffolds the newest SDK, and because
Expo Go supports only one SDK at a time, the default scaffold fails on device with
*"Project is incompatible with this version of Expo Go."*

**Don't upgrade the SDK unless you also stop using Expo Go.** If you need to rebuild the
scaffold, pin the template explicitly:

```bash
npx create-expo-app@latest . --template expo-template-default@sdk-54
```

`npm view expo-template-default dist-tags` lists the versioned templates available.

## Project structure

The starter template was stripped back, so the whole app is two files:

```
app/
  _layout.tsx   headerless Stack + light status bar
  index.tsx     the entire dice screen
```

## How it works

**Dice faces** — `PIP_GRID` maps each value 1–6 to nine booleans, read left to right and
top to bottom across a 3×3 grid. Each true renders a circular pip; each false renders an
empty cell.

**Roll timing** — `ROLL_MS` is *derived* from its parts (`TILT_MS + WOBBLE_MS ×
WOBBLE_SWINGS + SETTLE_MS`), so the shake animation and the `setTimeout` that lands the
result can't drift apart when you retune it. Keep `WOBBLE_SWINGS` even, or the die settles
from the wrong side.

**Fair vs. lively** — two different random functions on purpose. `differentFace()` drives
the tumble and never repeats the face already showing, so the shake always looks alive.
`fairRoll()` decides the actual result and is a uniform 1–6, so real repeats happen —
because that's what dice do.

**Animation** — Reanimated 4, a shared value driving `rotate` and a press `scale` through
`useAnimatedStyle`. Both are transforms, so they run on the UI thread with no layout pass.
`useReducedMotion()` is respected: with Reduce Motion enabled the shake is skipped and the
result lands immediately.

## Scripts

| Command | Does |
| --- | --- |
| `npx expo start` | Start the dev server (add `-c` to clear the Metro cache) |
| `npm run lint` | ESLint via `expo lint` |
| `npx tsc --noEmit` | Typecheck |

## Notes

- `expo-splash-screen` colours are applied at native build time, so the navy splash may
  not appear in Expo Go. It will be correct in a development or production build.
- On Windows, `EPERM` when renaming `app/` means the Metro dev server has the directory
  open. Stop the server first, or delete files inside the directory rather than renaming it.
