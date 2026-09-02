# Reusing the compliance agents in later parts

How to carry [`gdpr-compliance`](./.claude/agents/gdpr-compliance.md) and
[`eu-ai-act-compliance`](./.claude/agents/eu-ai-act-compliance.md) into Sprint 4
Part 3 onward — and why the more valuable moment to run them is **while planning
a project, not after building it**.

Both agents are already published to `~/.claude/agents/`, so they resolve from
any folder in the `BwAI` tree with no setup. Nothing below requires copying
files around.

---

## 1. The lesson from the Script Rewriter audit

The audit in [FINDINGS.md](./FINDINGS.md) is a natural experiment in what
post-hoc compliance costs. Sorting its findings by *when the decision was
actually made* is more instructive than sorting by severity:

| Finding | When the decision got locked in | Cost to fix then | Cost to fix now |
|---|---|---|---|
| No erasure path (Critical 3) | The moment "no service-role key" was chosen as an architecture rule | One line in the architecture notes | New admin client, new server-only secret, revisiting a deliberate security boundary |
| No provenance on AI output (W2) | When `rewrite_versions` was designed | One extra column in the initial migration | A migration, a backfill, and a schema change to a table with live rows |
| In-place edits erase the AI/human boundary (W3) | When `updateVersionText` was written as an overwrite | Writing a new row instead of overwriting | Restructuring version history, with existing data already ambiguous |
| No retention or purge (Warning 8) | When the schema shipped without TTL | A `created_at` index and a purge job in the first migration | Same work, plus deciding what to do about rows already accumulated |
| Undisclosed sub-processor (Critical 2) | When OpenRouter was chosen | A sentence in the README | A sentence in the README |
| No privacy policy (Critical 1) | Never — it was simply never written | A page | A page |

The pattern is clear. **The document-shaped findings cost the same whenever you
do them. The schema- and architecture-shaped ones get dramatically more
expensive after the first migration runs.** W2 and W3 are the sharpest example:
both are trivial as a column and an insert-instead-of-update at design time, and
both are a data-migration problem once real content exists.

So the point of running these agents early is not to be diligent. It is to catch
the four rows in the middle of that table while they are still one line each.

---

## 2. Run them at three moments

### Moment 1 — planning, before any code

This is the highest-value run and the least obvious one, because there is no
code to audit yet. **Point the agents at the spec instead.** Both read
Markdown perfectly well, and a project brief describing auth, storage, and an
LLM call contains everything the rubrics need.

```text
Run the gdpr-compliance subagent against the project brief in
docs/specs/<brief>.md. There is no code yet — audit the design as described.
For each criterion, tell me whether the plan as written would pass or fail, and
what would have to be in the schema or architecture for it to pass.
```

The expected output is not a findings list but a **requirements list**: the
columns, routes, and decisions to build in from the start. Feed those into the
plan before writing code.

Do the same with `eu-ai-act-compliance` if the project has any AI feature, which
in this course it always will. Its risk classification is worth having on record
before you build — it is the difference between "limited risk, add a label" and
"Annex III high-risk, a fundamentally different project."

### Moment 2 — mid-build, at the first schema

Run once more when the initial migration exists but before it has been applied
to anything with real data. This catches provenance and retention gaps at the
last moment they are still free:

```text
Run both compliance subagents on this project. Focus on whether the schema in
supabase/migrations/ supports erasure, export, retention, and AI provenance —
I want to fix it in the migration rather than with a follow-up migration later.
```

### Moment 3 — before shipping to anyone but yourself

The full audit, exactly as run in this part. The trigger is not a date — it is
**the moment a second person can create an account**. That is when the household
exemption stops applying and the whole GDPR rubric becomes live.

---

## 3. Design inputs to carry into every new project

Distilled from the two rubrics, this is what to build in from the start so the
Moment 3 audit is uneventful. Treat it as a planning checklist, not a
post-build one.

**Data layer**

- Every table holding user content has an FK to the user with `on delete cascade`
  — so one delete removes everything, as Script Rewriter already gets right.
- Hard deletes only. No `deleted_at` flag standing in for erasure.
- A retention story per table, even if it is only "kept until the user deletes
  the project" written down somewhere.
- Decide the service-role/admin-client question **at architecture time**, since
  erasure needs it and retrofitting it means revisiting a security boundary.

**AI features**

- Store provenance on the generated row from the first migration: model, prompt
  version, generated-vs-edited state.
- Never overwrite AI output in place. Write a new row, so the AI/human boundary
  survives.
- Carry the AI label to wherever content *leaves* the app — export, print, PDF,
  API. This is where Script Rewriter failed while looking fine in the UI.
- Add the disclosure in the application layer, not the system prompt. A model
  told to output only the rewrite will not reliably self-label.

**Documents**

- A privacy policy naming every outside service *by name* — database host,
  deployment host, LLM provider, analytics. This is the one that fails hardest
  and costs least.
- Record the LLM provider's retention and training settings when you pick the
  provider, while you are already in the dashboard.

**Cheapest single habit:** when you add a third-party service to a project, add
a line naming it to the README in the same commit. Critical 2 in the audit exists
only because that line was never written.

---

## 4. Making it automatic in a new project

Two low-effort ways to stop this depending on remembering:

**Put the constraints in the project's `CLAUDE.md`.** Script Rewriter's own
`CLAUDE.md` is why the AI Act audit passed its chatbot criterion — the file said
"do not turn the application into a chatbot", so the code never did. The same
mechanism works for compliance: a few lines about provenance columns, hard
deletes, and export labelling will shape the code as it is written, which beats
auditing for them afterwards.

**Add a planning-phase step to the project brief template** — one line saying
the compliance agents run against the brief before implementation starts. The
agents are read-only and take about two minutes each.

---

## 5. What these agents cannot tell you

Worth re-reading before trusting a clean report:

- They read the repository **statically**. Supabase project settings, OpenRouter
  dashboard configuration, Vercel log retention, and signed DPAs are all
  invisible to them. A PASS on a code criterion says nothing about the
  configuration behind it.
- They cannot tell provider from deployer, which materially changes AI Act
  obligations.
- The GDPR rubric cascades: one missing privacy policy produced four separate
  Criticals in this audit. Read root causes, not counts.
- A limited-risk classification is a first-pass reading of Annex III, not a legal
  determination. Anything touching hiring, credit, medical, or **learner
  assessment** deserves real advice rather than an agent's verdict.

Both are first-pass signals, not legal rulings, and neither substitutes for a
qualified lawyer or data protection officer before real user data is processed.
