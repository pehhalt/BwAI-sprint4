# The cross-model verifier

Task 2, Phase 5. An open-weight model, run from a separate terminal through a
separate provider, reviewing code Claude Code wrote.

| | |
| --- | --- |
| Reviewer | `z-ai/glm-5.2` via OpenRouter |
| Runner | standalone Codex CLI `0.153.2` |
| Config | [`codex-config.toml`](./codex-config.toml) |
| Target | the merged Settings work in [`part4`](../../part4) |
| Command | `codex exec --sandbox danger-full-access "<adversarial prompt>"` |
| Cost | ~30k tokens, about 4 cents |

The prompt told it not to approve the code, to assume the author was careless,
to give a file, a line and a concrete failure scenario for each finding, and to
skip praise, style preferences and descriptions of what the code does.

---

## The findings, triaged

Verdicts are ours, after checking each against the code. Two of the five are
real defects, one is a real observation resting on an impossible scenario, one
is not a defect but makes an argument worth keeping, and one is real but
inconsequential.

### 1. Hardcoded hex in a screen — **real, fixed**

`history.tsx:125` had `backgroundColor: '#F5E7E2'` inline. `CLAUDE.md` says
colours come from `constants/theme.ts` with no hardcoded hex in screens.

Correct, and it had been sitting there since Part 4. It is in our own style
guide's *known inconsistencies* table, so we knew — but knowing it and having it
surface in a review are different things, and only one of them gets it fixed.

**Fixed:** promoted to `Palette.dangerSoft`. The token comment records that its
contrast against `danger` is 4.13:1 and still fails AA, because tokenising a
colour does not improve it.

### 2. `aiGenerated` is written and never read — **real observation, impossible scenario**

Accurate: `addEntry` writes `aiGenerated: true`, the type declares it, and
nothing ever reads it. The accessibility label says "AI-generated" unconditionally.

Its reasoning does not hold. The scenario it describes — an entry that is *not*
AI-generated being labelled as if it were — cannot occur, because every write
path in the app goes through `addEntry`, which sets the flag. There is no code
that creates a non-AI entry.

**Not fixed, deliberately.** The field is a marker for consumers of the stored
data, and the API route sets it too. Removing it would change the storage
schema to close a gap that does not exist. Recorded instead.

### 3. The disclosure is conditional on there being entries — **not a defect, good argument**

`history.tsx:48` renders the AI-disclosure line only when `entries.length > 0`.
The reviewer notes `CLAUDE.md` requires it on every screen rendering AI output.

It concedes the point itself: when the list is empty, the screen renders no AI
output, so there is nothing to disclose. That is the correct reading, and the
current behaviour is compliant.

But the second half of its argument is right and worth keeping: **the disclosure
is tied to data rather than to the screen.** It appears and disappears as
`AsyncStorage` state changes, and a guarantee that depends on a list being
non-empty is weaker than one that cannot be bypassed.

**Not fixed** — nothing is currently wrong. It strengthens the case for the
`<Disclosure />` extraction already logged as unclaimed work, and that entry now
has a second, independent argument behind it.

### 4. `doClear` skips the unmount guard the rest of the file uses — **real, fixed**

`settings.tsx:65` called `setSaved` after two awaits with no guard, while the
`useEffect` and `useFocusEffect` above it both guard theirs. The reviewer's
observation that the author "applied the guard selectively" is exactly right,
and it spotted why this path is the risky one: `doClear` runs from an
`Alert.alert` callback, so it can resolve long after the user has navigated away.

Impact is small — React no longer warns, and the set is a no-op. The
inconsistency is the defect.

**Fixed:** a `mounted` ref, since a callback has no cleanup function to hang a
local flag on.

### 5. A failed clear is silent behind a destructive confirmation — **real, fixed**

The sharpest finding, and the one worth the exercise on its own.

Claude's `/code-review` had already found that `doClear` assumed success, and we
fixed it by re-reading the count instead of setting zero. This reviewer read
*that fix* and found its limit: the count is now accurate, but the user who
confirmed a dialog saying **"This removes all 24 sayings. It cannot be undone"**
gets no indication when nothing happened. An unchanged number is not feedback.
Its phrasing: *a silent failure behind a destructive confirmation is worse than
a silent failure behind a normal button.*

**Fixed:** `clearHistory` now returns whether the write succeeded, and `doClear`
raises a dialog when it failed or when entries survive. That needed the
`window.alert` path too, since `Alert.alert` is a no-op on web — the same trap
the confirmation dialog already had to work around.

### Where it found nothing

It explicitly cleared four areas: the server-side key rule, `readDefaultTone`'s
validation of stored input, Settings staying inside the scope `CLAUDE.md`
permits, and the `pickedHere` ref correctly preventing the async default-tone
read from clobbering a user tap. That last one is notable — it is the exact code
written to fix Claude's race finding, and an independent reviewer confirming a
fix is worth as much as one finding a bug.

---

## Claude versus the open model, on the same code

This is the part the exercise exists for.

| | `/code-review` (Claude) | `glm-5.2` (open weight) |
| --- | --- | --- |
| Findings | 5 | 5 |
| Real | 4 | 2 fixed, 1 valid-but-unfixable, 1 argument, 1 impossible |
| Overlap | **none** | **none** |

**They overlapped on nothing.** Not one finding appears on both lists.

Claude found: the async race on the default-tone read, `doClear` assuming
success, a disabled row whose comment contradicted its code and cost contrast,
radios never announced as checkable, and a vestigial style block.

GLM found: a hardcoded hex, a dead field, a data-conditional disclosure, a
missing unmount guard, and no user feedback on a failed destructive action.

**Two of GLM's five are about code Claude's review caused.** The missing unmount
guard and the silent failure both live inside `doClear` — a function that only
looks the way it does because we rewrote it in response to Claude's finding. The
second reviewer's value here was not catching what the first missed in the
original code. It was catching what the first reviewer's *fix* introduced and
left behind.

**Why the lists differ, honestly.** Some of it is model diversity, which is the
premise being tested. But some is scope: `/code-review` reviewed a diff, GLM
reviewed whole files. The hardcoded hex was never in the diff, so Claude was
never going to see it. Attributing all five to a different model family would
overstate the finding — the fair claim is that a different reviewer with a
different frame found a disjoint set, and both parts of that mattered.

**Where the open model was weaker.** Its worst finding (#2) argued from a
scenario the code makes impossible, and #3 talked itself out of its own headline
before finishing the paragraph. Claude's rejected finding was wrong for a
different reason — it lacked context it had no way to have. Neither is a clean
win; both need triage, which is the actual cost of a second reviewer and the
reason this document exists.

---

# Task 3 — the third reviewer

`codex-plugin-cc`, OpenAI's plugin, running `gpt-5.6-sol` on the ChatGPT
subscription. Same code, third opinion.

## The plugin does not work on Windows, and fails as a pass

`/codex:adversarial-review --base 1628c91 --background` returned:

> Verdict: **approve**
>
> No substantive finding can be supported from the lightweight context alone.
> The required read-only repository inspection was blocked by the execution
> policy, so this is not affirmative evidence that the change is safe to ship.

**An `approve` from a reviewer that opened no files.** The disclaimer is
accurate and it sits *below* the verdict, so anyone reading the summary line
concludes a third model signed the code off. Nothing signed anything off.

The cause is the sandbox limitation already recorded against the standalone
CLI, reappearing through the plugin — and the plugin cannot be configured
around it. Every sandbox value in the plugin is a hardcoded literal:

| Location | Value |
| --- | --- |
| `codex-companion.mjs:414` — **the adversarial-review call site** | `"read-only"` |
| `codex-companion.mjs:491` — the task path | `write ? "workspace-write" : "read-only"` |
| `lib/codex.mjs:68, 81, 1012` | `"read-only"` |

No `--sandbox` flag, no config key, no environment override — the only
variables the plugin reads anywhere are `CLAUDE_ENV_FILE`,
`CLAUDE_PROJECT_DIR`, `CODEX_HOME` and `SHELL`. The string
`danger-full-access` does not appear in the plugin at all. Its two reachable
modes are exactly the two that Codex's Windows sandbox rejects.

So on this platform the plugin cannot review a repository, and there is no
supported way to make it. That is Task 3's real result.

## The fallback

Same model and same auth, run directly through the CLI at a sandbox that
works, bypassing only the component shown to be broken:

    Get-Content approach-prompt.txt -Raw | codex exec --sandbox danger-full-access -

It is no longer a test of the plugin — the plugin's answer is already in — but
it does produce the third opinion the comparison needs.

## What it found, triaged

Framed as the plugin frames it: challenge the approach, not hunt defects.

### 1. Non-transactional history — **real bug, fixed**

The only data-loss defect any of the three reviewers found.

`addEntry` is read-modify-write and `clearHistory` is a delete, with nothing
serialising them:

    t0  fetch completes, addEntry reads N entries
    t1  user confirms Clear, removeItem empties storage
    t2  addEntry writes N+1 -- the cleared history is back

Reachable by leaving the confirmation open while a request is in flight. The
window is small; the consequence is a destructive action the user confirmed
being silently undone, which is the kind of bug that is never reproduced and
never believed.

**Fixed:** both mutations now run through one queue in `lib/history.ts`. It
chains off *settled* rather than resolved, so a failed write cannot wedge every
write after it. Reads stay outside the queue — they do not mutate, and a stale
count refreshes on focus.

### 2. Storage collapses "empty" and "broken" — **real, fixed**

The summary undersells this one; the sharp edge is in the detail. `readHistory`
returned `[]` for a genuine empty history, a corrupt record, *and* a store that
would not answer. Settings then showed **"Nothing saved yet" and disabled
Clear** — so a user with corrupt storage was shown the only recovery action,
greyed out.

**Fixed:** `readHistoryState` returns `{ status: 'ready', entries }` or
`{ status: 'unreadable' }`. Settings keeps Clear enabled when the store cannot
be read, labels the row *"Saved wisdom cannot be read"*, and the confirmation
stops claiming a count it cannot verify. `readHistory` is unchanged for the
display path.

### 3. `Tone` is owned by the history module — **real, minor, not fixed**

`Tone` lives in `lib/history.ts` and is imported by settings and the wisdom
screen. History stores a tone; it does not own the concept. Cheap to move, no
behaviour attached, so it is recorded rather than done.

### 4. No single owner for preference state — **valid critique, wrong for this project**

Its headline scenario — change the default, return to Wisdom, see the old value
— is the *specified* behaviour: Settings decides what is checked when the app
opens, the picker decides what this request asks for. Its scaling argument is
sound and `CLAUDE.md` rules out the scale that would make it bite.

### 5. Fire-and-forget preference writes — **acknowledged tradeoff**

`pickTone` sets state then writes without awaiting, deliberately, so the radio
moves under the finger. Its counter is fair: a failed write means the next
launch silently reverts. Left as it is, with the tradeoff now written down in
two places instead of one.

---

# All three reviewers

| | Framing | Findings | Real |
| --- | --- | --- | --- |
| Claude `/code-review` | defects in the diff | 5 | 4 |
| `glm-5.2` open weight | defects in whole files | 5 | 2 fixed, 3 recorded |
| `gpt-5.6` ChatGPT plan | approach and design | 5 | 2 fixed, 3 recorded |

**Fifteen findings. No finding appears on more than one list.**

That is a striking number and it needs its caveat stated rather than buried:
**three different framings were used**, so some of the disjointness is by
construction. Ask three reviewers three different questions and disjoint answers
are not surprising. The fair claim is narrower and still worth having — framing
and model together produced no overlap at all, and the reviewers were wrong in
different directions:

- Claude reviewed a diff, so a hardcoded hex outside it was invisible to it.
- GLM read whole files and found that hex, but argued one finding from a
  scenario the code makes impossible.
- GPT-5.6 was asked about design and found the only bug that loses user data —
  which neither defect-hunting pass caught, because it is invisible in any
  single file and only appears when two operations interleave.

**The most useful pattern across all three.** Two of GLM's findings were about
code Claude's review caused. The worst bug found by anyone came from the
reviewer asked the *least* specific question. And the reviewer that produced the
most confident output — a bare `approve` — had read nothing at all. Confidence
and framing turned out to matter as much as which model was answering.
