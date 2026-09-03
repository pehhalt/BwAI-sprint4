# Build checklist — Grandma's Wisdom of the Day

Work top to bottom. Each phase ends in a commit, so the git history reads as a
build log rather than a pile of "updates".

---

## Phase 0 — Ground rules (before any code)

- [x] Confirm the brief fits one sitting: *"I tap a button, pick Funny or Wise,
      and Grandma gives me one line of wisdom."* Two screens, one AI feature.
- [x] Write `CLAUDE.md` with the server-side-key rule **first**, so every later
      change inherits it.
- [x] Write `.gitignore` including `.env` **before** the key ever exists on disk.
      This ordering is the whole point — a `.env` committed once is in the
      history forever.
- [x] Commit: folded into the scaffold commit.

## Phase 1 — Scaffold and get it on the phone

- [x] Install the Expo agent skills plugin — enabled in `.claude/settings.json`.
- [x] Scaffold: `npx create-expo-app@latest . --template default@sdk-54`.
      **Pinned to SDK 54** — the target iPhone's Expo Go cannot load anything
      newer. (First attempt used `--template default`, which gave SDK 57; the
      folder was wiped and re-scaffolded at 54.) Routes live under `app/(tabs)/`.
- [x] Restore the three docs; delete the template's own `README.md`. Merge our
      rules into the scaffold's `CLAUDE.md`, keeping its `@AGENTS.md` import.
- [x] Fix `.gitignore` — the template ships only `.env*.local`, which does **not**
      match a plain `.env`. Added `.env` and `!.env.example`; verified with
      `git check-ignore -v .env` (matches `part4/.gitignore:36`).
- [x] Set `name` / `slug` / `scheme` in `app.json` off the folder default
      (`part4`) to `Grandma's Wisdom` / `grandmas-wisdom`.
- [x] Add `.env.example`.
- [x] **Starter confirmed on the iPhone via Expo Go**, dev server on port 8082.
- ⚠️ **Standing rule — the SDK follows Expo Go, not the other way round.**
      Expo Go supports only the newest SDK and updates itself. This was pinned
      at 54; Expo Go moved to 57 and the app stopped opening, so it was upgraded
      (see Phase 7). Expect to repeat that when Expo Go next updates.
- [x] Connected first try, no firewall or tunnel workarounds needed. Fix list in `README.md` (network Private →
      Node.js through firewall → `--tunnel` → pin the SDK). Don't fight it;
      tunnel mode is a fine answer.
- [x] **Gate passed: the plain starter runs on the phone.**
- [x] Commit: `Scaffold Grandma's Wisdom Expo app pinned to SDK 54`

## Phase 2 — Server route, key-safe from the first line

- [x] Set `"web": { "output": "server" }` in `app.json` — API routes don't exist
      without it, and the template defaults to `"static"`.
- [x] Create `.env` with `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`.
- [x] Verify `.env` is ignored: confirmed invisible to `git status` with the
      real file present on disk.
- [x] Write `app/api/wisdom+api.ts`:
      - `POST` handler reading `{ tone }` from the body
      - validates `tone` is `"funny"` or `"wise"` — rejects anything else with 400
      - reads the key from `process.env`, returns a clear 500 if it's missing
      - calls `https://openrouter.ai/api/v1/chat/completions`
      - returns `{ wisdom }`, or a clean JSON error
- [x] Test the route without the app. Verified on port 8081: invalid tone → 400,
      malformed body → 400, `wise` → 200, `funny` → 200 and audibly different.
      Confirmed the key appears in neither success nor error responses.
      **Check the port Expo actually printed** — it falls through to 8082 or
      higher whenever 8081 is taken, and a request to the wrong port fails in a
      way that looks exactly like a broken route.
- [x] Commit: `Add OpenRouter API route for wisdom generation`

## Phase 3 — The wisdom screen

- [x] Extend `constants/theme.ts` — cream background, deep brown text, one sage accent,
      18–20px body scale, spacing tokens.
- [x] `app/(tabs)/index.tsx`:
      - Funny / Wise toggle (two large tap targets, clear selected state)
      - "Ask Grandma" button
      - wisdom card, set as a large quote
      - `ActivityIndicator` + "Grandma is thinking…" while the call is in flight
      - button disabled during the call so a double-tap can't fire twice
      - friendly error text on failure — "Grandma couldn't be reached. Try
        again in a moment."
- [x] Add the disclosure line **`Wisdom is AI-generated.`** directly under the
      wisdom card. Always visible.
- [x] Test on the phone: both moods return sensible, distinctly different output.
- [x] Commit: `Add wisdom screen with mood radio buttons and AI disclosure`

## Phase 4 — History screen (optional task)

- [x] `npx expo install @react-native-async-storage/async-storage`
- [x] `lib/history.ts` — read, append, and clear a list of
      `{ id, tone, text, createdAt }`.
- [x] Append to history on every successful generation.
- [x] `app/(tabs)/history.tsx` — `FlatList`, newest first, each row showing the
      wisdom, its mood, and a readable timestamp.
- [x] Empty state: "No wisdom yet. Go ask Grandma."
- [x] **Disclosure on this screen too.** Every surface rendering AI output needs
      its own label, above the output. Missed on the first pass — it went in as
      a `ListFooterComponent`, after up to 100 entries, and an EU AI Act audit
      caught it.
- [x] Rename the template's `explore` tab to `history`: rename
      `app/(tabs)/explore.tsx`, and update the second `<Tabs.Screen>` in
      `app/(tabs)/_layout.tsx` (name, title, icon). Delete `app/modal.tsx` and
      its link if unused.
- [x] Commit: `Add history screen with local persistence`

## Phase 5 — Security verification

- [x] Run `/security-review` in Claude Code. Reported **no qualifying
      vulnerabilities**; verified the key cannot reach the client by import,
      `EXPO_PUBLIC_`, bundler inlining, or response/error echo. Its one nit
      (`in` vs `Object.hasOwn` in the tone check) is fixed.
- [x] Grepped the working tree: no key literal outside `.env`, and the only
      `EXPO_PUBLIC_` mention is a comment forbidding it.
- [x] Scanned the **full git history**, not just the current files — `.env` in
      no commit, no `sk-or-*` in any blob, real key value absent everywhere:
      `git log --all -p -- .env` (must be empty) and
      `git grep -I "sk-or-v1" $(git rev-list --all)` (must find nothing).
- [x] Confirmed the built bundle is clean. `npx expo export -p web`, then
      grepped all 21 files of `dist/client/` (what a phone downloads): the key
      is absent and the string `OPENROUTER` appears zero times. The server
      bundle reads `process.env` at runtime rather than baking the value in.
- [x] Set a **spending cap** on the OpenRouter key or account — **$1 per week**.
      Listed as optional by the brief, but treated as necessary: `/api/wisdom`
      has no auth and the dev server binds every interface, so anyone on the
      same Wi-Fi can spend the credit — and `--tunnel` exposes it publicly. The
      cap is what bounds that. At roughly $0.00018 a call it still allows about
      5,500 taps a week, far past any real use of this app.
- [x] Record the results in `README.md`.
- [x] Commit: `Verify no secrets in bundle or git history`

## Phase 6 — Finish

- [x] Re-read `README.md` against the app as built — fix anything that drifted.
- [x] Full run-through on the phone: both moods, the loading state, an error
      case (dev server stopped mid-call → one plain sentence, no red screen),
      and the history screen after the prompt rewrite and model switch.
- [x] Check the commit log reads as a build log. No "updates", no "fix stuff".
- [x] Fix the prompt so the wisdom reads as a real one-liner. Output had been
      appending an explanation to every line, which is the clearest tell of a
      machine. The prompt caused it, not the model — see `CLAUDE.md`.
- [x] Pick the model by measurement rather than reputation: four models, same
      prompt, three samples per tone. `google/gemini-2.5-flash` won.

---

## Phase 7 — SDK upgrade, forced by Expo Go (4 Sep 2026)

- [x] Expo Go updated on the App Store and now requires **SDK 57**, so the
      SDK 54 build would no longer open. Not a code fault; Expo Go supports only
      the newest SDK and is not backward compatible.
- [x] `npx expo install expo@latest` then `npx expo install --fix` — SDK 57,
      React 19.2.3, React Native 0.86.3.
- [x] Migrate the React Navigation entry points, which SDK 56 moved into
      `expo-router`: `ThemeProvider` in `app/_layout.tsx`, and
      `BottomTabBarButtonProps` / `PlatformPressable` in `components/haptic-tab.tsx`.
- [x] Fix `components/ui/icon-symbol.tsx`: `expo-symbols` widened its `name`
      type to allow a per-platform object, which can no longer key a Record.
- [x] Drop `newArchEnabled` and `android.edgeToEdgeEnabled` from `app.json` —
      both are defaults in SDK 57 and no longer valid keys.
- [x] `expo-doctor` 21/21, `tsc` clean, `expo lint` clean.
- [ ] **YOU: restart the dev server and confirm the app opens in the updated
      Expo Go.** A three-version SDK jump changes the native runtime, so a green
      typecheck proves very little here.

## Post-build reviews

- [x] **Security review** — no qualifying vulnerabilities, re-run over the
      final state including the prompt rewrite and model switch.
- [x] **EU AI Act audit** — limited risk. Found the History disclosure rendered
      after up to 100 entries as a list footer; fixed on both screens.
- [x] **Code review** (high effort) — 11 findings, all fixed. The important two:
      the error handler hid a missing-key setup failure behind a retry message,
      and the WCAG fix had been applied to one label out of five.

Outcomes recorded in `README.md` under "Reviews".

## Review checklist (the graded one)

Tick these only when you have actually watched each one happen.

- [x] The app runs on my phone in Expo Go with one AI feature that calls a model
      through OpenRouter
- [x] I set it up with the mobile workflow: empty folder, Expo agent skills
      plugin, scaffolded with Expo
- [x] The key is never exposed in the app, and I ran a security check with an
      agent that reported no major flaws
- [x] The key lives in a git-ignored `.env` file and appears nowhere in the git
      history
- [x] A short line on screen tells users the output is AI-generated

## Scope guard

If you catch yourself adding any of these, stop — they are not in the brief:

user accounts · a real database · sharing or export · notifications ·
multiple AI features · an in-app model picker · theming controls ·
onboarding screens
