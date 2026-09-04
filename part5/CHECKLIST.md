# Part 5 checklist — Claude Design and multitasking

Work top to bottom within each task. Tasks 1 and 2 are independent, so Task 2 can
run while `part4` is still blocked. Each phase ends in a commit.

Legend: `[ ]` to do · `[x]` done · `[~]` in progress · `[-]` skipped, with reason ·
`[!]` attempted, but the tool would not do it — kept as a finding

---

## Phase 0 — Ground rules and prerequisites

- [x] **`part4` is off-limits** until the SDK 54 → 57 upgrade is finished and
      confirmed running on the phone. Nothing in Task 1 starts before that.
      *Cleared 2026-09-04 — upgrade done, working, `part4` committed clean.*
- [x] Confirm Claude Design is available on this plan (sidebar entry, or
      `claude.ai/design` loads). *Available. `/design-login` was the gate, not
      the plan tier.*
- [x] `claude --version` — `/design-sync` needs a current CLI. Update with
      `npm update -g @anthropic-ai/claude-code` if the command is unrecognised.
      *2.1.259, current enough.*
- [ ] Record starting usage: `/usage` in Claude Code and Settings → Usage on the
      web. Design work shares the coding allowance, so we want a before/after.
- [ ] Confirm the OpenRouter key from Part 4 is still valid and the spending cap
      is still in place.
- [ ] Locate the OpenAI API key (Task 3 only).
- [ ] Commit: the README and this checklist.

---

## Task 1 — Design a new screen and hand it off

**Unblocked 2026-09-04** — the SDK 54 → 57 upgrade is done and working.

### Phase 1 — Decide the screen (no tooling yet)

- [x] Pick the screen. **Settings** — default tone, clear history, about.
      Richest in components, so it exercises the design system hardest.
      Rejected: an About-only route (too little beyond type) and the History
      empty state (too thin for three distinct layouts).
- [x] **Scope conflict found and resolved deliberately.** `part4/CLAUDE.md` caps
      the app at *"One AI feature, two screens"*. A third screen is an amendment
      to that rule, approved in chat and to be recorded in `CLAUDE.md` itself so
      the next agent does not read it as drift.
- [x] Write the goal / layout / content / audience prompt in full, before opening
      Claude Design. → [`docs/prompts.md`](./docs/prompts.md)
- [x] Note what it must *not* do: no new AI calls, no key handling, and — per
      `CLAUDE.md` — the settings page must never become where the AI disclosure
      lives. Wisdom and History keep their own lines, above their output.
- [x] Scope agreed for touching existing screens: `index.tsx` reads the stored
      default tone on mount, `history.tsx` gives up its Clear button to Settings.
      Minimal and reviewed rather than forbidden.

### Phase 2 — Publish the design system (`/design-sync`)

- [x] `/design-login` first if authentication is stale. **Required, not optional
      — DesignSync refused every read until it was run:** *"DesignSync needs
      design-system authorization."* Nothing, not even listing projects, works
      before this. It is an interactive login, so the user must run it.
- [x] Authorization confirmed working: `list_projects` returns `[]`. No design
      system exists yet, so this is a create rather than an update.
- [x] **`/design-sync` is user-invocation-only.** The agent cannot call it, and
      is explicitly told not to reproduce it by hand: *"Skill design-sync cannot
      be used with Skill tool due to disable-model-invocation… Do not replicate
      this skill's workflow by other means."* The agent may still use the read
      side of the DesignSync tool to verify the result afterwards, which is the
      split used here: the user syncs, the agent checks.
- [x] Run `/design-sync` in `part4`, as its own session with `part4` as the
      working directory. **It refused, correctly.** The predicted failure point
      was the failure point: `/design-sync` is a React→browser converter wanting
      Storybook or a bare component package, and this repo has neither.
- [x] **Recorded verbatim** → [`docs/design-sync-findings.md`](./docs/design-sync-findings.md),
      including the four gaps that would have to be closed and why closing them
      is the wrong trade for this project.
- [-] Option C (codebase converter) — **not available for this repo.** Reason
      documented rather than skipped silently.
- [x] Fall back to **Option B** (*Create here*, upload existing brand material):
      a style guide generated from `constants/theme.ts` plus the two existing
      app screenshots. Tokens still come from the real codebase, carried by hand
      rather than by converter.
  - [x] Generate the style-guide asset from `theme.ts` (agent) →
        [`docs/design-system/style-guide.html`](./docs/design-system/style-guide.html).
        Tokens, measured contrast, component specs read off the two stylesheets,
        and a "known inconsistencies" table so the design system does not
        enshrine existing bugs.
  - [x] Create the design system at `claude.ai/design` and upload it (user —
        browser only). Done, **with a caveat worth recording:** the create flow
        made us pick a preset theme before it would accept anything, so the
        resulting design-system project is called **"Organic"** and its
        `theme.json` carries the preset's tokens — `#f5ead8` ground,
        terracotta `#c67139`, Caprasimo over Figtree — not ours. The style
        guide went into the canvas chat as an attachment instead, which is where
        the real tokens actually came from.
- [x] Verify from this session with `list_projects` / `list_files` / `get_file`
      that the colours, type scale and spacing that arrived actually match
      `theme.ts`. **The designs match exactly; the design system does not, and
      the gap between those two is the finding.** Measured table in
      [`docs/design-log.md`](./docs/design-log.md).

      `list_files` on the canvas project explains why. It holds both:

      | Path | What it is |
      | --- | --- |
      | `_ds/organic-5e1ee6eb…/` | the "Organic" design system, attached |
      | `uploads/style-guide.html` | our Option B style guide |
      | `uploads/wisdom.png`, `uploads/history.png` | the two shipped screens |

      So Organic was not a stray project sitting to one side — it was attached to
      the canvas as its design system, and the uploads sat next to it. **The
      design followed the uploads and ignored the attached design system.** Not
      one hex from Organic's palette appears in any of the three artboards.
      Useful to know which way that precedence runs: uploaded brand material
      beats an attached preset. It also means the "pick a theme" step in the
      create flow is a formality when you are bringing your own tokens — it
      produces a design system that is then overridden.
- [x] Screenshot it. Covered by the token table in `docs/design-log.md`, which is
      measured off the markup rather than off pixels — stronger evidence than a
      screenshot for this particular claim.
- [ ] Commit: sync findings, style guide, screenshots.

### Phase 3 — Three variations

- [x] Attach the design system to the project, then send the Phase 1 prompt with
      an explicit instruction to use the existing tokens. The style guide was
      attached to the chat; see the Phase 2 caveat for why that, and not the
      "Organic" project, is what carried the tokens.
- [x] Ask for **three** layouts in one request — same content in all three, only
      the arrangement differs. Asking for variations beats revising one layout.
      Returned 2a *Labelled sections on the ground*, 2b *Grouped cards*,
      2c *Editorial*.
- [x] Screenshot all three side by side →
      [`docs/screenshots/settings-three-variations.png`](./docs/screenshots/settings-three-variations.png)
- [x] Pick one and **log the rationale in the chat itself** — the course checklist
      asks for it there, not only in a file. Copy it into `docs/design-log.md` too.
      **Picked 2a.** Rationale in the canvas notes under each artboard and in
      [`docs/design-log.md`](./docs/design-log.md).
- [x] Export the canvas so the markup is reviewable outside the browser →
      [`docs/design-system/exports/Grandmas Wisdom App.html`](./docs/design-system/exports/).
      A self-unpacking bundle; the artboard markup carries literal token values,
      which is what makes Phase 5 a build rather than a guess.
- [ ] Commit: variation screenshots and rationale.

### Phase 4 — Refine it, using all four mechanisms

Each of these was meant to be demonstrated at least once. **Most were not.** The
phase is recorded as it happened rather than reshaped to look complete — the
three layouts came back close enough to build from, and the pull to hand off
beat the discipline to refine first.

- [x] **Chat** — one structural change (sections, hierarchy, global spacing or theme).
      The only mechanism actually used, and it did the whole job: the three
      layouts and their arrangement all came out of chat.
- [-] **Inline comment** — not used. Nothing on the canvas needed a change
      narrow enough to be worth aiming at one element.
- [-] **Direct canvas edit** — tried, but on an earlier state of the canvas that
      did not become the final export, so nothing of it survives in
      `docs/design-system/exports/`. Counted as not demonstrated rather than
      claimed on the strength of a memory.
- [-] **Tweak control** — not used, so no control to screenshot.
- [-] **Annotations** — not added to the canvas. The states they were meant to
      carry were written down anyway, before designing, in the table at the end
      of [`docs/prompts.md`](./docs/prompts.md), and all of them are implemented
      in `app/(tabs)/settings.tsx`: radio selected / unselected / pressed, Clear
      history enabled / pressed / disabled-because-empty, and the confirmation
      with both its buttons. So the states were specified and shipped — they just
      travelled in a markdown file rather than in the bundle.
- [-] **Accessibility pass on the canvas** — not run there. Done in code instead
      at build time: `radiogroup` and `radio` roles with `accessibilityState`,
      a combined label per row so a screen reader reads the hint with the option,
      the destructive row exposing `disabled` and carrying a hint that it asks
      before deleting, and every colour pair inherited from `theme.ts`, whose
      contrast was already measured when `textMuted` and `disclosure` were fixed.
      Not equivalent to reviewing the design — a canvas pass would have caught
      reading order and text sizing before they were built, not after.
- [x] Screenshot the finished screen. Nothing was refined after the variations,
      so 2a in
      [`docs/screenshots/settings-three-variations.png`](./docs/screenshots/settings-three-variations.png)
      *is* the finished design. A separate screenshot would show the same pixels.

**What skipping this cost.** The handoff carried structure and tokens and no
behaviour, which is exactly the gap annotations exist to close, and the gap got
closed by hand in `prompts.md` and `CLAUDE.md` instead. Worth knowing before
the next screen: the refinement phase is where a design stops being a picture
and starts being a specification, and going straight from variations to build
means the specification has to be written somewhere else or not at all.

### Phase 5 — Hand off and build

- [x] Share → Claude Code, target **Local agent**. Web session was rejected on
      purpose: it runs against the GitHub remote and cannot drive Expo or reach
      the phone, and device verification is the point of Phase 5.
  - [-] **With custom instructions** — drafted, but they are **not** in the
        generated prompt, so they were given to the agent in-session instead.
        Recorded rather than quietly worked around: the bundle carries structure
        and tokens and carries none of the project's rules.
  - [!] **The artboard could not be selected.** The canvas offered no way to scope
        the share to one artboard, so the handoff points at the whole document and
        the choice is carried by a hand-typed line, `Implement: Use layout 2a`.
        The mechanism meant to carry the selection did not; prose did.
- [x] Save the generated handoff prompt to `docs/handoff-prompt.md` before pasting
      it — evidence, and it makes the "why this beats a screenshot" point concrete.
      → [`docs/handoff-prompt.md`](./docs/handoff-prompt.md), verbatim, with the
      verification that the pointer resolves and that the export matches the live
      canvas byte for byte.
- [x] In `part4`: new branch, e.g. `feat/settings-screen`. Created off `main`
      after the Phase 2–3 docs were committed, so the design record and the
      build sit in separate commits.
- [x] Build it from the bundle. Existing components where one fits; new ones only
      where none does. `app/(tabs)/settings.tsx`, plus `lib/settings.ts` for the
      stored default tone. The radio row was lifted from `index.tsx` unchanged;
      `Tone` moved into `lib/history.ts` so it stops being declared twice.
      Blast radius held to what `CLAUDE.md` agreed: `index.tsx` reads the default
      on mount, `history.tsx` gives up its Clear button.
- [x] Run it on the phone. **Renders correctly on device**, screenshot at
      [`part4/docs/screenshots/settings.PNG`](../part4/docs/screenshots/settings.PNG)
      and now in the part4 README. Compared against the design; three divergences
      written up at the end of [`docs/design-log.md`](./docs/design-log.md). The
      serif title and the small-caps tracking — the two things predicted to
      diverge — both came through fine. **What actually diverged was the fold:**
      the hint lines wrap to two lines on a real device, every radio row grows,
      and About ends up below the fold. Which matters because "2b pushes About
      below the fold" was one of the four arguments for picking 2a. Rationale
      corrected rather than quietly left standing.
- [x] `npx expo lint` clean — exit 0, no findings. `npx tsc --noEmit` also clean.
- [ ] Review before merge (`/code-review`, plus the Task 2 verifier if it is ready
      by then — that is the natural pairing).
- [ ] Merge to `main`.
- [ ] Commit / PR per the usual rule.

### Phase 6 — Close the loop

- [x] Re-run `/design-sync` in `part4` after the merge, so the design system
      reflects the shipped code rather than the design. **It refused again**, as
      predicted, and created nothing: no project, no `.design-sync/config.json`,
      no `DesignSync` call. All four gaps re-checked and still standing — no
      `dist/`, no library entry, no `.storybook/` or `*.stories.*` anywhere, and
      `components/` still holding only `haptic-tab.tsx` and the icon shim.
      **So the loop does not close in either direction on this repo**, and a
      third screen did not move it. That is the finding this step produces; the
      course text presents it as routine.
  - [!] **Confirmed on re-inspection, not independently reproduced.** Stated
        plainly because it changes what the evidence is worth: the second run
        read [`docs/design-sync-findings.md`](./docs/design-sync-findings.md)
        first and honoured the prior decision rather than re-deriving it. It did
        real work on top — re-verified the four gaps against today's repo, found
        the Storybook absence independently, and caught two stale facts — but it
        is a confirmation, not a clean second replication. Claiming the loop was
        tested twice from scratch would overstate it.
  - [x] Findings doc refreshed to match the shipped code, in a separate session
        scoped to that one file. Screen count corrected, the `CLAUDE.md` quote
        updated to the three-screen cap with a note that the argument survives
        the amendment, and the two deferred findings re-triaged.
  - [x] **Pressed-opacity drift resolved** — and the *way* it resolved is the
        interesting part. Nobody fixed it. The `0.6` copy lived on History's
        Clear button, Settings took that button over, and the divergent copy was
        deleted as a side effect. `index.tsx:223` and `settings.tsx:249` now
        agree at `0.85`. Convergence by luck, not by structure — a third copy
        would diverge exactly the same way.
  - [ ] **`<Disclosure />` extraction is now unclaimed rather than deferred.**
        It was held back to avoid widening the Settings task; Settings has
        merged, so that reason has expired. Still defined twice, and still with
        different alignment — `index.tsx:157` centres it (`:247`),
        `history.tsx:50` does not (`:127` pads it instead). Verified, not
        recalled. Out of scope for Part 5, and worth its own change with its own
        review: it touches the line `CLAUDE.md` treats as safety-critical, so
        "always above its content" has to become a structural guarantee rather
        than a convention each future agent remembers.
- [x] Close the loop the way that *is* available: regenerate
      `docs/design-system/style-guide.html` from the shipped code, so the design
      system carries the two things the Settings screen added — the small-caps
      section label and the disabled destructive row. A manual version of the
      same loop, and worth saying out loud that it is manual. Regenerated from
      `theme.ts` plus all three screen stylesheets:
  - Both new components documented with their real values, including why the
    disabled row swaps colour instead of fading, and why the letter spacing is
    `0.84px` rather than `.06em`.
  - Three new colour pairs measured — `danger` on surface 4.90:1, `text` on
    `accentSoft` 11.08:1, `textMuted` on `accentSoft` 5.57:1. **All three pass**,
    so the Settings screen added no new contrast debt.
  - Known inconsistencies re-triaged: pressed-opacity struck as closed *by
    accident*, and three new entries — the twice-defined disclosure line with
    its alignment mismatch, corner radius having no token (14 / 16 / 8 as
    literals), and letter spacing having none either.
- [!] Re-upload the regenerated guide to the design system at `claude.ai/design`
      (user — browser). **The upload succeeded and updated nothing.** There is no
      "upload into this project" path: uploading brand material creates a *new*
      project every time. The guide landed in a third project,
      `Mobile app design scope` (`c1a9feed`), holding an `uploads/` folder and
      nothing else — no `_ds/`, no design-system files. It is a plain
      `PROJECT_TYPE_PROJECT`, which is why `list_projects` does not list it.
- [x] Confirm in Claude Design that anything new — a new component, a new token —
      actually arrived. **Verified by `get_file`: the content arrived complete and
      correct.** Section label with its `0.84px` tracking, the destructive row in
      both states, all three new contrast rows, and the re-triaged inconsistencies
      table — nothing lost or mangled in transit. `settings.PNG` came across too.
      **And none of it reached the design system.**

**So Phase 6 closes on a harder answer than expected: the loop cannot be closed
on this repo by either route, and trying fragments the design system.**

| Route | Outcome |
| --- | --- |
| `/design-sync` → the `Organic` design system | Refuses. Not a browser-renderable component library. Confirmed twice. |
| Browser upload of brand material | Succeeds, but creates a new plain project each time. Not an update mechanism. |

Three projects now exist where one was intended, and **the design system is the
only one of the three that has never held this app's tokens**:

| Project | Type | Holds |
| --- | --- | --- |
| `Organic` (`5e1ee6eb`) | design system | the preset's terracotta tokens, untouched since creation |
| `Grandma's Wisdom mobile app` (`5b8ef819`) | project | the canvas, `Organic` attached and ignored, the **Phase 2** style guide |
| `Mobile app design scope` (`c1a9feed`) | project | the **current** style guide and all three screenshots |

The newest upload is the only place with the shipped tokens, and it is the one
place nothing is attached to. That is not a workflow, it is an accumulation.

- [-] Write the guide into `Organic` directly through the `DesignSync` tool —
      **available and deliberately not done.** `Organic` is writable, so
      `finalize_plan` + `write_files` would work. Phase 2 recorded the skill's own
      instruction that its workflow is reserved for explicit user invocation and
      must not be reproduced by other means; hand-rolling a sync to route around
      a sync that refused is exactly that. It would also be dishonest evidence —
      a design system populated by an agent bypassing the tool is not the round
      trip this exercise is testing.
- [ ] Write the round trip up in the README: what survived the handoff intact,
      what the agent still got wrong, whether the second sync changed anything.

### Task 1 success checklist (from the course text)

- [ ] Design system created in Claude Design from actual codebase components
- [ ] Rendered screen matches app typography, colour and spacing tokens
- [ ] Three layout variations evaluated, selection rationale logged
- [-] Canvas annotations specify visual and state behaviours — **not met.** No
      annotations were added to the canvas. The state behaviours were specified
      in `docs/prompts.md` and implemented, but not by this mechanism and not in
      the bundle. See Phase 4.
- [ ] Claude Code built the feature from the exported handoff bundle
- [ ] Feature verified on a branch and merged
- [ ] `/design-sync` re-run post-merge

---

## Task 2 — Codex CLI on an open model via OpenRouter

**Not blocked. Can start immediately.**

### Phase 1 — Install the CLI

- [ ] `node --version` — needs 18.18 or higher.
- [ ] `npm install -g @openai/codex`. **Not** the `curl -fsSL ... | sh` script;
      that is the macOS/Linux path.
- [ ] `codex --version` to confirm it is on PATH.
- [ ] Note in the README that this is the *standalone CLI*, a different thing from
      the plugin in Task 3. The course text warns about exactly this confusion.

### Phase 2 — Credentials

- [ ] Set `OPENROUTER_API_KEY` as a **user environment variable** on Windows, not
      a shell export — an export dies with the terminal.
- [ ] Open a fresh terminal and confirm the variable is visible there.
- [ ] Confirm the key is nowhere in this repo: a search for `sk-or-` returns
      nothing. The key lives in the environment only.
- [ ] Confirm the OpenRouter spending cap is still set before spending anything.

### Phase 3 — Configure the provider and profile

- [ ] Check whether `~/.codex/config.toml` already exists. If it does, back it up
      and add to it rather than overwriting.
- [ ] Add the `[model_providers.openrouter]` block. This **must** live in the
      user-level config; a project-local config ignores provider definitions.
- [ ] Pick the model slug from the **live OpenRouter model list**, not from the
      course text. Prefer a free-tier slug for the smoke test, then decide whether
      to move to a paid one for the real review.
- [ ] Add the `[profiles.<name>]` block pointing at that slug.
- [ ] Copy the finished config to `docs/codex-config.toml` as evidence, with the
      key referenced by environment variable name only.

### Phase 4 — Smoke test

- [ ] In a small test project, run `codex --profile <name>`.
- [ ] Prompt: "List the primary files in this project." Confirm it answers from
      the real files rather than inventing them.
- [ ] If it errors on the API shape, try `wire_api = "chat"` instead of
      `"responses"`. Record which one actually worked — the course text may be
      wrong here.
- [ ] Record every failure mode hit and its fix. This is the most useful part of
      the write-up.

### Phase 5 — Make it a real verifier

- [ ] Point it at actual Claude Code output — ideally the Task 1 screen — with an
      explicitly adversarial prompt: find what is wrong, unsafe or unfinished, and
      do not approve it.
- [ ] Save its findings to `docs/verifier-findings.md`.
- [ ] Triage each finding: real / not real / misread the codebase. A cross-model
      reviewer earns its place precisely because it is wrong in *different* ways,
      so report both directions honestly.
- [ ] Fix the real ones.

### Task 2 success checklist (from the course text)

- [ ] Standalone Codex CLI installed and authenticated against OpenRouter
- [ ] User-level provider and profile mapped to an open-weight model
- [ ] The independent open-weight agent runs and reads a real project
- [ ] Cross-model verification done: build and adversarial review on different
      model families

---

## Task 3 — `codex-plugin-cc` (optional, doing it)

**Not blocked.** Bills separately through OpenAI.

- [ ] `/plugin marketplace add openai/codex-plugin-cc`
- [ ] `/plugin install codex@openai-codex`
- [ ] `/reload-plugins`
- [ ] `/codex:setup` — verifies local Codex dependencies and authentication.
- [ ] Confirm the OpenAI key is picked up, and note whether it authenticated by
      key or by ChatGPT subscription.
- [ ] Run `/codex:adversarial-review` on the Task 1 changes before merge.
- [ ] Compare the three reviewers — Claude, OpenAI, open-weight — on the same
      diff. Which found what, and did any two agree on something all three should
      have caught? That comparison is the actual value here.
- [ ] Note the desktop-app caveat: there is no `/plugin` command there, plugins
      install from + → Plugins. Do this from the terminal.

---

## Phase F — Finish

- [ ] README updated with what actually happened, including what failed.
- [ ] Every box above either ticked or marked `[-]` with a reason.
- [ ] Screenshots in `docs/screenshots/`, referenced from the README.
- [ ] Closing usage figures recorded against the Phase 0 baseline.
- [ ] Sprint-level `../README.md` given its Part 5 section.
- [ ] Final commit.
