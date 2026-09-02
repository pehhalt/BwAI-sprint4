# Grandma's Wisdom of the Day

A small Expo Go app with one AI feature: tap a button, pick a mood, and Grandma
hands you a single line of wisdom.

> **The one-sentence brief:** I tap a button, pick Funny or Wise, and Grandma
> gives me one line of wisdom.

Built for Sprint 4 / Part 4 of the Turing College "Building with AI" course. The
AI call runs through [OpenRouter](https://openrouter.ai), and the key never
leaves the server side.

---

## What it does

Two screens, one AI feature.

| Screen | What's on it |
| --- | --- |
| **Wisdom** (`/`) | A Funny / Wise toggle, an "Ask Grandma" button, the wisdom card, and the AI-disclosure line |
| **History** (`/history`) | Every piece of wisdom generated so far, newest first, with its mood and timestamp |

Nothing else. No accounts, no login, no server database.

## How it's wired

```
 phone (Expo Go)                    dev server (your laptop)              OpenRouter
┌────────────────────┐             ┌──────────────────────────┐         ┌──────────┐
│ app/(tabs)/        │  POST       │ app/api/wisdom+api.ts    │  HTTPS  │  chat/   │
│   index.tsx        │ ──────────► │                          │ ──────► │ completi │
│                    │ /api/wisdom │  reads OPENROUTER_API_KEY│         │   ons    │
│  { tone }          │             │  from process.env        │ ◄────── │          │
│                    │ ◄────────── │                          │         └──────────┘
│  { wisdom }        │   JSON      └──────────────────────────┘
└────────────────────┘
```

The key lives in `.env` on the laptop, is read by `process.env` inside the API
route, and is used only there. It is never imported into a component, never
prefixed with `EXPO_PUBLIC_`, and therefore never ends up in the JavaScript
bundle that Expo Go downloads to the phone.

**This means the app only works while `npx expo start` is running.** That is
correct and intended for this project: it is a live preview on your own phone.
Shipping it to other people would mean deploying that API route somewhere, which
is out of scope here.

## Project layout

**Expo SDK 54, pinned deliberately** — that is the newest SDK the target
iPhone's Expo Go can load. Do not upgrade it; a newer SDK makes the app
unopenable on that device.

```
app/
  (tabs)/
    _layout.tsx        tab bar
    index.tsx          the wisdom screen
    history.tsx        the history screen
  api/
    wisdom+api.ts      server route — the ONLY place the key is touched
  _layout.tsx
constants/
  theme.ts             colours, spacing, type scale
lib/
  api.ts               builds the dev-server URL for the phone to call
  history.ts           AsyncStorage read/write helpers
.env                   your key (git-ignored, never committed)
.env.example           the shape of .env, with no real values
app.json               note web.output = "server" — API routes need it
CLAUDE.md              the pinned server-side-key rule
CHECKLIST.md           build + review checklist
```

## Setup

You need [Expo Go](https://expo.dev/go) on your phone and an OpenRouter account
with a few dollars of credit (~$5 is plenty).

```bash
npm install
cp .env.example .env     # then paste your key into .env
npx expo start
```

Scan the QR code with Expo Go (Camera app on iOS, the Expo Go app on Android).
Phone and laptop must be on the same Wi-Fi.

**Watch the port Expo prints.** It uses 8081 by default but falls through to
8082 or higher if something already holds it — a stale Metro process from an
earlier session is the usual culprit, and it can survive closing the terminal.
The app itself doesn't care, but any `curl` test against the API route has to
use the port actually in use.

### Environment variables

`.env`, git-ignored, never committed:

```
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openai/gpt-4o-mini
```

`OPENROUTER_MODEL` is optional — the route falls back to a cheap default. Change
it here to swap models without touching code. Note the deliberate absence of an
`EXPO_PUBLIC_` prefix on either: that prefix would inline the value into the app
bundle, where anyone who installs the app can read it back out.

### If the phone won't connect

From the mobile taster lesson, in order:

1. Set your Wi-Fi network to **Private** in Windows settings.
2. Allow **Node.js** through the Windows Defender firewall (both private and
   public).
3. Fall back to tunnel mode: `npx expo start --tunnel`.
4. Check the SDK. This project is pinned to **SDK 54** because that is what the
   target iPhone's Expo Go supports. If Expo Go says the project is
   incompatible, the pin is wrong for your device, not the app.

If the app loads but the AI call fails on device while `curl` against
`localhost:8081/api/wisdom` works, the relative `fetch('/api/wisdom')` isn't
resolving to the dev server. Build an absolute URL from
`Constants.expoConfig.hostUri` instead.

## Security

The one rule that genuinely matters here: **the OpenRouter key stays off the
phone.**

- The key is read with `process.env.OPENROUTER_API_KEY` inside
  `app/api/wisdom+api.ts` and nowhere else.
- No `EXPO_PUBLIC_` variable holds a secret.
- `.env` is in `.gitignore` from the first commit and appears nowhere in git
  history. Worth knowing: the Expo template ships only `.env*.local`, which does
  **not** match a plain `.env`. That line was added by hand and verified with
  `git check-ignore -v .env`.
- `CLAUDE.md` pins this rule so it survives future changes.

### Verification

An agent security review (Claude Code's `/security-review`) reported **no
qualifying vulnerabilities**, having confirmed the key cannot reach the client
by any path: direct import, `EXPO_PUBLIC_` prefix, bundler inlining, or being
echoed in a response or error. It raised one non-security nit — `in` walking the
prototype chain in the tone check — which is fixed.

Alongside it, these checks were run and all came back clean:

| Check | Result |
| --- | --- |
| `.env` in any commit, full history | Absent |
| `sk-or-*` in any tracked blob, all refs | Absent |
| The real key value across all history | Absent |
| Key in the exported client bundle | Absent — `OPENROUTER` appears 0 times in `dist/client/` |
| Key baked into the server bundle | No — reads `process.env` at runtime |
| `EXPO_PUBLIC_` holding a secret | None |

The bundle check is the one that matters most: `dist/client/` is exactly what a
phone downloads, so a key absent from it is a key that cannot be extracted from
the installed app.

## AI transparency

The app shows this line directly under every piece of wisdom:

> Wisdom is AI-generated.

That is the visible-disclosure side of the **EU AI Act, Article 50** duty to
label AI-generated content. One sentence, always on screen, never behind a
modal or a settings page.

## Optional tasks completed

- **Polished for the phone** — warm calm palette (cream, deep brown, one sage
  accent), 18–20px body text, generous spacing, the wisdom set as a large quote.
- **Loading indicator** — "Grandma is thinking…" with a spinner while the call
  is in flight, so the screen never looks frozen.
- **History screen** — a second screen listing every answer generated so far,
  persisted locally with AsyncStorage.
- **Secret-leak scan** — repo and full git history scanned to confirm the key
  was never committed, plus the exported bundle checked directly. Results in
  the Verification table above.

Outstanding: the **spending cap**. It is set in the OpenRouter dashboard rather
than in this repo, so it is not done until a credit limit exists on the key at
[openrouter.ai/settings/keys](https://openrouter.ai/settings/keys).

Not attempted: the in-app model picker (the model is swappable via `.env`
instead).
