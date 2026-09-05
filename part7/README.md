# Part 7 — Building Production Systems

**This part has no code of its own.** Like [part 6](../part6), everything it teaches was
built inside the sprint project instead, so the pipeline was built once, for real, carrying
an application people can visit.

**The code lives in a separate repository: https://github.com/pehhalt/overprint-shop**
Live shop: https://overprint-shop.vercel.app · Preview: https://overprint-staging.vercel.app

This file records what the sprint project covers of Part 7, what it does not, and what was
learned that the lesson does not mention — including one place where the lesson's own
instruction leads you into a failure.

---

## Coverage against the lab

### Part 1 — Set up the deployment pipeline

| Step | Status | What happened |
|---|---|---|
| 1. Ask the agent to build the pipeline | ✅ Done | Three workflows: `ci.yml` on pull requests, `deploy-preview.yml` on push to `main`, `deploy-production.yml` on push to `production` |
| 2. Note org ID and project ID | ✅ Done | Read from `.vercel/project.json` after `vercel link` |
| 3. Create a Vercel token | ✅ Done | **Three failed attempts first. The lesson's instruction here is wrong — see Finding 1** |
| 4. Add the three secrets to GitHub | ✅ Done | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` |
| — production branch exists | ✅ | |
| — workflow files exist | ✅ | three of them |
| — three secrets listed | ✅ | |
| — Vercel auto-deploy off | ✅ | declared in `vercel.json` as `git.deploymentEnabled: false`, so it is visible in the repo rather than hidden in a dashboard |
| *"let the agent rectify the issues; the first runs often fail"* | ✅ **Emphatically** | Five distinct failures before the first green deploy |

### Part 2 — Write production rules into CLAUDE.md

| Step | Status |
|---|---|
| 5. Add a "Production rules" section | ❌ **Not done** — see Gaps |
| 6. Confirm it landed | ❌ Not done |

### Part 3 — Ship a change to the sandbox

| Step | Status |
|---|---|
| 7. Make the change on a feature branch | ✅ Done, seven times (PRs #1–#7) |
| 8. Merge the pull request into `main` | ✅ Done |
| 9. Watch the deployment run | ✅ Done |
| 10. Open the sandbox preview and check | ✅ Done, verified by fetching the deployed pages rather than by eye |

### Part 4 — Promote to production

| Step | Status |
|---|---|
| 11. Open a pull request from `main` into `production` | ⚠️ **Partially** — promotion was a direct merge, not a pull request. See Gaps |
| 12. Merge into production | ✅ Done (by merge, not PR) |
| 13. Watch the production deploy | ✅ Done |
| 14. Confirm the change on the live site | ✅ Done |

---

## Coverage against the learning outcomes

| Outcome | Status |
|---|---|
| Explain what production means and how it changes the stakes | ✅ Acted on rather than merely understood: two separated databases, a guard that refuses to seed production, and a recorded decision that content is edited only in production |
| Describe Vercel's three environments and how variables scope to each | ✅ Exceeded — every variable scoped per environment and verified by reading values back, not by trusting the dashboard |
| Direct the agent to branch, open a PR, check the preview, merge | ✅ Done repeatedly |
| Direct the agent to set up GitHub Actions deploys for both branches | ✅ Done |
| Explain why migrations beat editing a live database, and why databases are separate | ✅ Exceeded — schema is migration-managed in **every** environment, including development |

---

## Gaps

### 1. No "Production rules" block in CLAUDE.md — and two of its rules were broken

Part 2 of the lab asks for a specific block:

> - Never commit directly to main. Make changes on a new branch and open a pull request for me to review.
> - **Never merge a pull request yourself. I will check the preview and merge it.**
> - Never run commands that could delete or overwrite the production database.

That block was never written, and the project's actual workflow violated the middle rule
consistently: **the agent opened and merged all seven pull requests itself**, and merged
`main` into `production` without asking.

That was not accidental — the session ran in an agent-driven mode where a plan was approved
up front and executed — but it is a real divergence from what this lesson teaches, and the
lesson is right about why it matters. The rule exists so that a human sees a change running
before users do.

Two of the three rules *were* honoured in practice despite never being written down: no
commit ever went directly to `main`, and a production-database guard was built into the seed
script specifically to make the third rule enforceable rather than merely intended. When
that guard later blocked the agent from seeding production, it worked exactly as designed.

**To close:** write the block, and adopt the merge rule for the remaining work.

### 2. Production promotion was a merge, not a pull request

Lab step 11 asks for a pull request from `main` into `production`. The project used a direct
`git merge main && git push` on the `production` branch.

The sprint brief only requires that merging `main` into `production` deploys the live site,
which this satisfies, and the merge is visible in the history. But the lab's version is
better: a pull request gives the promotion a reviewable moment, which is the entire reason
for separating the two branches.

**To close:** promote via a pull request from here on.

### 3. Instant rollback never rehearsed

The lesson covers instant rollback as production's undo button. It is listed as an optional
task in the sprint project and has not been done yet — scheduled for day 3.

### 4. The areas the lesson names as "still to learn"

Backups, custom domain, scaling, cost control, observability, and incident response are all
untouched. The lesson frames these as beyond its scope, so this is not a gap against the
lab — but a shop taking real money would need every one of them, and none exist here.

---

## Findings the lesson does not mention

### Finding 1 — the lesson's Vercel token instruction produces a token that cannot authenticate

**This is the most important correction in this document.**

Lab step 3 says:

> *Set the scope to the account or team that owns this project.*

Following that literally produces a **broken token**. In Vercel's current UI, selecting the
team then forces you to pick a specific project, which creates a **project-scoped** token.
Vercel's CLI resolves the *user* before it applies `--scope`, and project- or team-scoped
tokens cannot call `/v2/user`. Every command fails with:

```
Error: Not able to load user because of unexpected error: User not found. (404)
```

That message points nowhere near the cause. The fix is **Full Account** scope — the dropdown
entry that does *not* ask you to select a project. Team targeting comes from `--scope <team>`
in the workflow, not from the token.

Three tokens were created before this was diagnosed.

### Finding 2 — commands that store secrets report success while storing nothing

Four consecutive deploy failures had the same shape: a command reported success and stored
an empty value.

- `gh secret set VERCEL_TOKEN` in a shell with no TTY reads EOF at the prompt and stores an
  **empty string**, exit code 0.
- `vercel env add` with piped stdin silently ignores it, because the CLI detects an agent and
  switches to non-interactive mode. `--value` is the flag that works.
- Neither `gh secret list` nor `vercel env ls` distinguishes an empty value from a real one —
  both show the name and the word "Encrypted" either way.

The reliable check for a GitHub secret is the workflow log: a real secret appears as
`--token=***` (masked), an empty one as a bare `--token=`. For Vercel, pull the values back
and check their length.

**Verify content, not existence.**

### Finding 3 — "Sensitive" Vercel variables are invisible to a prebuilt pipeline

Vercel can store a variable as *sensitive*, and did so by default here. Sensitive values are
deliberately **not returned by `vercel env pull`**.

That is fine for builds running on Vercel, and fatal for the pattern this lesson teaches:
`vercel pull` → `vercel build` → `vercel deploy --prebuilt` runs the build **inside GitHub
Actions**, which therefore receives empty values. The symptom was a migration failing to
resolve a hostname called `base` — a fragment of `supabase.com`, from a connection string
that had become an empty string.

If you build in CI, those variables must be stored `--no-sensitive`. The alternative is to
drop `--prebuilt` and let Vercel build server-side, where sensitive values are available.

### Finding 4 — a CLI-created Vercel project has no framework, and the error does not say so

Creating the project with `vercel project add` rather than by importing the repository means
framework detection never runs. The build then compiles Next.js perfectly and fails with:

```
Error: No Output Directory named "public" found after the Build completed.
```

Fix: declare `"framework": "nextjs"` in `vercel.json`, which also keeps the answer in the
repository rather than a dashboard.

### Finding 5 — a database migration can hang a deploy forever, with no error

Payload's development push mode records a `batch: -1` row. On seeing it, `payload migrate`
**prompts** *"data loss will occur. Would you like to proceed?"* — and a prompt in CI has no
TTY, so the deploy hangs indefinitely rather than failing. Two builds ran twenty minutes
before being cancelled. There is no flag to bypass the prompt.

The fix is also the better practice: turn push mode off in **every** environment, so
development is migration-managed too. That is a stronger version of what this lesson
teaches — the lesson keeps push mode for development, which is precisely what writes the
marker row that causes the hang.

### Finding 6 — a connection pool of 1 is not the safe choice for serverless

Reasoning that a serverless function handles one request at a time, the pool was set to
`max: 1` to protect Supabase's 15-connection ceiling. That is wrong: Payload holds a
connection for its own initialisation and needs a second to run a query. It produced two
failures that looked unrelated — migrations hanging with no error, and every
database-backed page returning **504 in production** while `/admin`, which does not query,
served in 0.75s.

### Finding 7 — Vercel Deployment Protection makes a public site private

Team projects have Deployment Protection on by default. Every URL 302s to Vercel's SSO and
serves `<title>Login – Vercel</title>` — including a URL that should 404, which therefore
returns 200 and makes the app look broken in a confusing way.

The lesson's note that preview URLs are *"private by default, behind your Vercel login"*
describes this and frames it as correct for a sandbox. It is not correct for a production
shop that a reviewer must be able to visit.

### Finding 8 — the lesson's stable-alias tip is not optional here

The lesson mentions, as a tip, asking for a stable Vercel alias because preview URLs change
on every deploy. For this project it was **mandatory**: a Stripe webhook endpoint is
registered against a fixed URL, so without the alias the webhook silently stops arriving
after the next merge, and payments appear to stop working for no visible reason.

The alias is assigned as a step inside `deploy-preview.yml`.

---

## Where the sprint project goes beyond Part 7

- **Two Supabase projects**, where the lesson explicitly permits one on the free tier. The
  sprint brief's evaluation criteria carry no such compromise clause, and the separation was
  verified by connecting to both and observing different data.
- **Migration-managed schema in development too**, not only production.
- **A CI job that asserts an invariant a tool keeps breaking**: `next typegen` re-appends a
  `.gitignore` pattern that would hide the required `.env.example`, so CI asserts the file is
  still tracked. A tool-rewritten config cannot carry that invariant; a check can.
- **A production-database guard** in the seed script that fails closed, refusing to run
  unless the target is provably the development project.
- **39 tests**, with CI running the database-free subset so that no database credential ever
  enters GitHub's secrets.

---

## The honest summary

Part 7's technical content is covered thoroughly and in places exceeded. Its *behavioural*
content — the CLAUDE.md rules, and specifically "never merge a pull request yourself" — is
what this project did not adopt, and it is the gap most worth closing, because that rule is
what keeps a human in the loop before users see a change.

The lesson's own warning applies neatly:

> *Without it, an agent working quickly can push straight to production before you have seen
> the result.*

That caused no harm here, because every deploy was verified afterwards and the two graded
demonstrations were run by hand. But "verified afterwards" is a weaker guarantee than "seen
before", and the difference is exactly what this lesson is about.
