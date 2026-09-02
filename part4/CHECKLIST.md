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
- [ ] **Never bump the SDK.** `npx expo install --fix` and any upgrade advice
      will try to move this to the latest SDK, which breaks Expo Go on the
      target iPhone. The pin at 54 is a device constraint, not a default.
- [x] Connected first try, no firewall or tunnel workarounds needed. Fix list in `README.md` (network Private →
      Node.js through firewall → `--tunnel` → pin the SDK). Don't fight it;
      tunnel mode is a fine answer.
- [x] **Gate passed: the plain starter runs on the phone.**
- [x] Commit: `Scaffold Grandma's Wisdom Expo app pinned to SDK 54`

## Phase 2 — Server route, key-safe from the first line

- [x] Set `"web": { "output": "server" }` in `app.json` — API routes don't exist
      without it, and the template defaults to `"static"`.
- [ ] Create `.env` with `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`.
- [ ] Verify `.env` is ignored: `git status --short` must not list it, and
      `git check-ignore -v .env` must confirm the rule.
- [ ] Write `app/api/wisdom+api.ts`:
      - `POST` handler reading `{ tone }` from the body
      - validates `tone` is `"funny"` or `"wise"` — rejects anything else with 400
      - reads the key from `process.env`, returns a clear 500 if it's missing
      - calls `https://openrouter.ai/api/v1/chat/completions`
      - returns `{ wisdom }`, or a clean JSON error
- [ ] Test the route without the app. **Check the port Expo actually printed** —
      it falls through to 8082 (or higher) whenever 8081 is taken, and a request
      to the wrong port fails in a way that looks exactly like a broken route:
      `curl -X POST http://localhost:8081/api/wisdom -H "Content-Type: application/json" -d '{"tone":"wise"}'`
- [ ] Commit: `Add OpenRouter API route for wisdom generation`

## Phase 3 — The wisdom screen

- [ ] Extend `constants/theme.ts` — cream background, deep brown text, one sage accent,
      18–20px body scale, spacing tokens.
- [ ] `app/(tabs)/index.tsx`:
      - Funny / Wise toggle (two large tap targets, clear selected state)
      - "Ask Grandma" button
      - wisdom card, set as a large quote
      - `ActivityIndicator` + "Grandma is thinking…" while the call is in flight
      - button disabled during the call so a double-tap can't fire twice
      - friendly error text on failure — "Grandma couldn't hear you — try again"
- [ ] Add the disclosure line **`Wisdom is AI-generated.`** directly under the
      wisdom card. Always visible.
- [ ] Test on the phone: both moods return sensible, distinctly different output.
- [ ] Commit: `Add wisdom screen with mood toggle and AI disclosure`

## Phase 4 — History screen (optional task)

- [ ] `npx expo install @react-native-async-storage/async-storage`
- [ ] `lib/history.ts` — read, append, and clear a list of
      `{ id, tone, text, createdAt }`.
- [ ] Append to history on every successful generation.
- [ ] `app/(tabs)/history.tsx` — `FlatList`, newest first, each row showing the
      wisdom, its mood, and a readable timestamp.
- [ ] Empty state: "No wisdom yet. Go ask Grandma."
- [ ] Rename the template's `explore` tab to `history`: rename
      `app/(tabs)/explore.tsx`, and update the second `<Tabs.Screen>` in
      `app/(tabs)/_layout.tsx` (name, title, icon). Delete `app/modal.tsx` and
      its link if unused.
- [ ] Commit: `Add history screen with local persistence`

## Phase 5 — Security verification

- [ ] Run `/security-review` in Claude Code. Confirm it reports **no major
      flaws** — specifically no key in the bundle and no key in the repo.
- [ ] Grep the working tree for the key prefix and for any secret behind an
      `EXPO_PUBLIC_` name.
- [ ] Scan the **full git history**, not just the current files:
      `git log --all -p -- .env` (must be empty) and
      `git grep -I "sk-or-v1" $(git rev-list --all)` (must find nothing).
- [ ] Confirm the built bundle is clean: `npx expo export -p web`, then grep
      `dist/` for the key. Nothing should match.
- [ ] Set a **spending cap** on the OpenRouter key or account (optional task).
- [ ] Record the results in `README.md`.
- [ ] Commit: `Verify no secrets in bundle or git history`

## Phase 6 — Finish

- [ ] Re-read `README.md` against the app as built — fix anything that drifted.
- [ ] Full run-through on the phone, cold start: both moods, the loading state,
      an error case (stop the dev server mid-call), and the history screen.
- [ ] Check the commit log reads as a build log. No "updates", no "fix stuff".

---

## Review checklist (the graded one)

Tick these only when you have actually watched each one happen.

- [ ] The app runs on my phone in Expo Go with one AI feature that calls a model
      through OpenRouter
- [ ] I set it up with the mobile workflow: empty folder, Expo agent skills
      plugin, scaffolded with Expo
- [ ] The key is never exposed in the app, and I ran a security check with an
      agent that reported no major flaws
- [ ] The key lives in a git-ignored `.env` file and appears nowhere in the git
      history
- [ ] A short line on screen tells users the output is AI-generated

## Scope guard

If you catch yourself adding any of these, stop — they are not in the brief:

user accounts · a real database · sharing or export · notifications ·
multiple AI features · an in-app model picker · theming controls ·
onboarding screens
