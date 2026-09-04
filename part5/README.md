# Part 5 — Claude Design and multitasking

Coursework for Sprint 4 / Part 5 of the Turing College "Building with AI" course.

Unlike the earlier parts, this one has no single lab at the end. It covers several
loosely connected topics and hides **two** graded pieces of work in the middle of
a lot of walkthrough. This folder holds the write-up and evidence for those two,
plus one optional extra we chose to do.

The app being designed for is **[Grandma's Wisdom of the Day](../part4)** — the
Expo app built in Part 4. The screen itself is built there, on a branch; this
folder holds the notes, prompts, rationale and screenshots.

---

## The two deliverables

### Task 1 — Design a new screen in Claude Design and hand it off

Round-trip the design workflow on a real codebase:

1. `/design-sync` from `part4` publishes the app's real tokens into Claude Design
2. Design one new, self-contained screen against those tokens
3. Compare three layout variations and log why one won
4. Refine it four ways — chat, inline comment, direct canvas edit, and a Tweak control
5. `Share → Claude Code`, build the screen on a git branch from the handoff bundle
6. Verify, merge
7. `/design-sync` again so the design system matches what was actually shipped

The point is the round trip. A screenshot pasted into a chat makes the agent guess
at margins and hex values; a handoff bundle carries the DOM structure and the
literal tokens, so there is nothing left to infer.

### Task 2 — An independent verifier on an open-weight model

Configure the **standalone Codex CLI** to run an open-weight model through
OpenRouter, then use it to adversarially review code Claude Code wrote.

The reasoning is single-point-of-failure: if your builder and your reviewer are
the same model family from the same vendor, they share blind spots, and an access
change at that vendor takes out both at once. Claude Code builds, an open-weight
model on OpenRouter checks — different family, different provider, weights that
stay downloadable regardless.

We already have an OpenRouter account and key from Part 4, with a spending cap
set, so this reuses that rather than creating a second billing relationship.

---

## Also doing (optional, but we have the key)

### Task 3 — The `codex-plugin-cc` plugin

OpenAI's plugin that exposes `/codex:*` slash commands inside Claude Code —
notably `/codex:adversarial-review`. Originally on the skip list only because it
bills separately through OpenAI; an existing API key removes that objection.

This is *not* the same thing as Task 2. The plugin runs OpenAI's models from
inside Claude Code; Task 2 runs an open-weight model from a separate terminal.
Doing both gives three independent reviewers.

## Skipped on purpose

| Skipped | Why |
| --- | --- |
| The CV walkthrough in Claude Design | A tutorial with no success checklist. Task 1 exercises the same tool on something that matters more. |
| Git worktrees | The text itself says leave them alone at first — one agent per project is the habit worth building. |
| Parallel-session practice as a *deliverable* | It is a working habit, not something with an artefact. We do it while working, we do not document it. |

---

## Constraints and open risks

Things that could derail this, checked early rather than discovered late.

| Risk | Why it matters | Plan |
| --- | --- | --- |
| **`/design-sync` may not accept a React Native codebase** | The docs say it wants JS/TS component libraries — React, Vue, Svelte, JSX. `part4` is Expo Router TSX, but its components are React Native primitives, not DOM. It may parse fine, may warn, may refuse. | Test it in the first five minutes. Fallback: build the design system by hand from `constants/theme.ts` plus screenshots (Option B in the course text). |
| **`part4` is mid-upgrade, SDK 54 → 57** | Touching it now means merge pain with the upgrade. | Nothing runs against `part4` until the upgrade lands and is confirmed on the phone. |
| **Model slug `z-ai/glm-5.2` may not exist** | The course text names several models we cannot verify. A wrong slug fails at the first request. | Pull the live OpenRouter model list and pick from it. Prefer a free-tier slug for the smoke test. |
| **`wire_api = "responses"`** | OpenRouter's API is chat-completions-shaped. The course config may be wrong for it. | If the smoke test errors, try `wire_api = "chat"`. |
| **Windows** | The course gives `curl \| sh` and `export VAR=...`, neither of which is right here. | `npm install -g @openai/codex`, and set the key as a user environment variable rather than a shell export. |
| **Claude Design is beta and needs Pro/Max** | Not available on Free. | Confirm the entry exists in the sidebar before planning around it. |
| **Usage burn** | Design systems and multi-variation requests are token-heavy, and they draw on the same allowance as Claude Code. | Check `Settings → Usage` and `/usage` before and after each design session. Refine rather than regenerate; use Tweaks instead of re-prompting. |

## Cost

| Thing | Who bills |
| --- | --- |
| Claude Design + Claude Code | Existing Claude plan allowance — shared, so design work eats coding budget |
| Open-weight model via OpenRouter (Task 2) | OpenRouter, existing key, spending cap already set |
| `codex-plugin-cc` (Task 3) | OpenAI, separately, on the existing key |

---

## Open decisions

- **Which screen to design.** It has to be self-contained — a settings view,
  a profile page, an empty state, a confirmation screen. The current app has
  Wisdom and History and no third screen. See `CHECKLIST.md`, Phase 1.

## Progress

Work is tracked in **[CHECKLIST.md](./CHECKLIST.md)**.
