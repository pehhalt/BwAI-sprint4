# Sprint 4, Part 2 — GDPR and EU AI Act compliance subagents

This folder holds two read-only compliance auditors built for the "audit an
earlier project for compliance" lab, plus the notes on how they're wired up so
they work across the whole `BwAI` tree rather than just here.

- **Agents:** [`.claude/agents/gdpr-compliance.md`](./.claude/agents/gdpr-compliance.md),
  [`.claude/agents/eu-ai-act-compliance.md`](./.claude/agents/eu-ai-act-compliance.md)
- **Audit target:** `sprint3/sprint-project` — *Script Rewriter*
- **Reports:** [`FINDINGS.md`](./FINDINGS.md) — both audits in full
- **Reuse guide:** [`REUSING-THE-AGENTS.md`](./REUSING-THE-AGENTS.md) — running
  these at planning time in Part 3 onward
- **Code changes:** none — the audits are read-only and Step 3 was skipped
  deliberately (see [Why Step 3 was skipped](#why-step-3-was-skipped))

## What this covers

Two subagents, each a first-pass compliance signal that reports and never edits:

- **`gdpr-compliance`** audits the *data* regime — lawful basis, the
  access/export/erasure rights, consent granularity, retention, sub-processor
  disclosure, and whether the privacy policy matches what the app actually
  collects. Explicitly fails a soft-delete flag used as account deletion.
- **`eu-ai-act-compliance`** audits the *AI system* regime — classifies the risk
  tier (prohibited / high / limited / minimal) and checks the Article 50
  transparency duties: chatbot AI-disclosure, AI-generated-content labelling,
  deepfake flagging.

Both are constrained to `Read, Grep, Glob, Bash` and instructed to return a
findings report grouped as **Critical / Warning / Suggestion**, each finding
naming a location, and each report closing with a not-legal-advice note.

## Why the audit target is Script Rewriter

The lab says to pick *one* regulation based on whether the app has user accounts
or an AI feature. `sprint3/sprint-project` has both, so it gets both audits and
the lab's optional Step 4 comes for free:

- **Personal data:** Supabase sign-up/sign-in, per-user projects behind Row
  Level Security, user-authored source material stored per account.
- **AI feature:** the LLM rewrite through OpenRouter, which the project README
  calls the app's entire reason to exist.

The OpenRouter call is the interesting overlap — user-authored content leaving
our infrastructure to a third-party processor is a GDPR disclosure question, and
the AI-generated output shown back to the user is an Article 50 labelling
question. Same line of code, two different regimes.

## Making the agents reusable across sprints

The lab assumes the agent file sits in the audited project. That conflicts with
wanting one canonical copy that's also the graded artifact for this part, so the
files live here and are published to user level instead.

**Claude Code only discovers subagents in two places:**

| Location | Scope |
| --- | --- |
| `~/.claude/agents/*.md` | every session, every folder |
| `<launch dir>/.claude/agents/*.md` | only when Claude starts in that directory |

Nested `.claude/agents` folders are **ignored**. This is not obvious and cost
some confusion: `sprint3/.claude/agents/` already holds several security
scanners from Sprint 3, and none of them load when Claude is started at the
`BwAI` root. Copying an agent into `sprint3/sprint-project/.claude/agents/`
would have been equally inert for the same reason.

So each file here is linked into `~/.claude/agents/`, giving one source of truth
that resolves from anywhere:

```text
sprint4/part2/.claude/agents/gdpr-compliance.md   <-- edit here (the deliverable)
~/.claude/agents/gdpr-compliance.md               <-- same file on disk
```

### Gotcha: hard links, not symlinks

Symlinks were the intent, but `New-Item -ItemType SymbolicLink` fails without
elevation — Windows restricts `SeCreateSymbolicLinkPrivilege` to administrators
unless Developer Mode is on. NTFS **hard links** need no elevation and were used
instead:

```powershell
New-Item -ItemType HardLink -Path "$env:USERPROFILE\.claude\agents\gdpr-compliance.md" `
         -Target "C:\Projects\TuringCollege\BwAI\sprint4\part2\.claude\agents\gdpr-compliance.md"
```

The tradeoff: a hard link shares file *content*, not file *identity*. An editor
that saves atomically (write temp, rename over the original) silently breaks the
link, leaving a stale copy at user level with no error. Verify with:

```powershell
fsutil hardlink list "C:\Projects\TuringCollege\BwAI\sprint4\part2\.claude\agents\gdpr-compliance.md"
```

Two paths listed means intact; one means broken and the link needs recreating.
Editing through Claude Code is safe. The permanent fix, if it becomes annoying,
is a one-time elevated shell to create real symlinks instead.

Registration is immediate — both agents became available without restarting the
session.

## Running the audit

```text
Run the gdpr-compliance subagent on sprint3/sprint-project and give me the
findings report, grouped as Critical, Warning, and Suggestion.
```

Then the same for `eu-ai-act-compliance`. Lab Step 3 is to fix the top Critical
finding in plain language. If you do it, put the work on a branch so the
submitted Sprint 3 `main` stays untouched — here it was skipped on purpose, so
Sprint 3 is unchanged.

## Status

- [x] Both agent definitions written
- [x] Published to `~/.claude/agents/` via hard link, confirmed with `fsutil`
- [x] Sprint 3 repo left untouched — no commits, working tree unchanged
- [x] GDPR audit run — 4 Critical, 5 Warning, 5 Suggestion ([FINDINGS.md](./FINDINGS.md))
- [x] EU AI Act audit run — 0 Critical, 4 Warning, 4 Suggestion; limited risk ([FINDINGS.md](./FINDINGS.md))
- [—] Top Critical finding fixed on the branch — **deliberately not done**, see below

### Why Step 3 was skipped

Script Rewriter is a personal-use app with no other users, so building an
account-deletion flow would have meant adding a service-role admin client and a
server-only secret to an app that deliberately has neither, to serve exactly one
data subject who already controls the database.

This is not just a time argument. GDPR's household exemption (Art. 2(2)(c))
takes purely personal or household activity outside the Regulation's scope
altogether, and a single-user tool with no professional dimension has a
reasonable claim to it. **That claim ends the moment anyone else signs up** — at
which point Criticals 1–4 in [FINDINGS.md](./FINDINGS.md) all become live, and
erasure and export have to exist before the first real user does.

The findings stay recorded rather than dismissed, because the audit's value here
was diagnostic, not remedial. A `compliance/gdpr-fixes` branch was created for
the fix, never committed to, and deleted once the decision was made — Sprint 3
is back on `main` exactly as submitted.

## Caveat

Both agents are automated first-pass signals, not legal advice. They are useful
for catching the obvious and embarrassing — an undisclosed sub-processor, a
missing deletion route, an unlabelled AI output — and are not a substitute for
review by a qualified lawyer or data protection officer.
