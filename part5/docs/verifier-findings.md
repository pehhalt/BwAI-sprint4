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
