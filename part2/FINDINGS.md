# Compliance audit findings — Script Rewriter

Full reports from both subagents, run 1 September 2026 against
`sprint3/sprint-project` (*Script Rewriter*), excluding `node_modules`, `.next`,
and `test-results`.

Agents used: [`gdpr-compliance`](./.claude/agents/gdpr-compliance.md) and
[`eu-ai-act-compliance`](./.claude/agents/eu-ai-act-compliance.md). Both are
read-only; neither modified the repository. File references below are relative
to `sprint3/sprint-project/`.

**Headline:** GDPR returned **4 Critical** findings, all tracing to a small set
of root causes — the app has no privacy policy and no erasure or export path.
The EU AI Act returned **no Critical** findings; the app classifies as limited
risk and its one real gap is that AI provenance is stripped at the export
boundary.

---

# 1. GDPR audit

## Personal data map

| Data | Where collected | Where stored / sent |
|---|---|---|
| Email + password | `app/auth/actions.ts`, `components/SignUpForm.tsx`, `components/LoginForm.tsx` | Supabase Auth (`auth.users`); Supabase sends a confirmation email |
| Session/auth cookies | `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `proxy.ts` | Browser + Supabase |
| Project title, target audience, global instructions (+ `user_id`) | `app/actions/projects.ts` | `public.projects` |
| Section title, free-text `source_text` (≤20,000 chars), page refs | `app/actions/sections.ts`, `lib/validation.ts` | `public.sections` |
| LLM output, section instructions, model name, status | `app/actions/rewrite.ts`, `app/actions/versions.ts` | `public.rewrite_versions` |
| Prompt payload (global instructions, audience, section instructions, full source text) | `lib/prompt.ts` | **OpenRouter** (`lib/openrouter.ts:44`) and onward to the routed model provider |
| All request data, IPs, server logs | Runtime | **Vercel** (`vercel.json`, `README.md:172`) |

Only one outbound third-party call exists (OpenRouter). No analytics SDK, no
tracker, no error-reporting service. Fonts use `next/font/google`, which
self-hosts at build time, so there is no runtime browser call to Google.

## Criteria

| # | Criterion | Result |
|---|---|---|
| 1 | Privacy policy exists and lists every category collected | **FAIL** |
| 2 | Lawful basis named per purpose | **FAIL** |
| 3 | Every outside recipient named | **FAIL** |
| 4 | Retention periods and data-subject rights stated | **FAIL** |
| 5 | User data export route | **FAIL** |
| 6 | Hard account-deletion route (no soft-delete) | **FAIL** (absent, not soft-delete) |
| 7 | No personal data in logs/console | **PASS** |

1. **FAIL.** No policy file, route, or component anywhere; a tree-wide search
   for `privacy|gdpr|retention|consent|lawful basis` returned only hits about
   the "cross-user privacy test" in docs. `app/layout.tsx` and
   `components/SignUpForm.tsx` have no policy link.
2. **FAIL.** Nothing exists to name it in — no document states contract,
   legitimate interest, or consent for the account, storage, or LLM-processing
   purposes.
3. **FAIL.** Supabase, Vercel, and OpenRouter (plus OpenRouter's downstream
   model providers) all receive personal data; none are disclosed to users.
4. **FAIL.** `supabase/migrations/001_initial_schema.sql` has no TTL or purge
   job, and there is no rights or contact text anywhere.
5. **FAIL.** The only export-ish surface is
   `app/projects/[projectId]/preview/page.tsx` + `components/DocumentPreview.tsx`,
   a browser print view of *approved rewrites for one project*. It omits account
   data, source text, drafts, and timestamps, so it does not satisfy Art. 15/20.
6. **FAIL, but missing rather than broken.** `app/auth/actions.ts` exports only
   `signIn`, `signUp`, `signOut`. No soft-delete pattern exists anywhere:
   `deleteProject` (`app/actions/projects.ts:74`) and `deleteSection`
   (`app/actions/sections.ts:82`) are real `.delete()` calls, and every FK uses
   `on delete cascade` — so deleting the `auth.users` row would correctly
   cascade all content. The mechanism is absent, not defective.
7. **PASS.** Zero `console.*` calls in `app`, `components`, `lib`, `e2e`, or
   `proxy.ts`. See Warning 6 for an error string that could reach logs
   indirectly.

## Critical

1. **No privacy policy of any kind.** Whole tree. The app collects email,
   passwords, and up to 20 KB of free-text course material per section and ships
   it to a third-party LLM, with no Art. 13 notice at signup
   (`components/SignUpForm.tsx` has no consent or policy link). Criteria 1–4 all
   fail on this single root cause.
2. **Undisclosed transfer of user content to OpenRouter.** `lib/openrouter.ts:44`
   POSTs the full prompt built in `lib/prompt.ts` to
   `https://openrouter.ai/api/v1/chat/completions`. Users are never told their
   material leaves the app, which provider receives it, or that it may be routed
   to a further sub-processor in a third country.
3. **No way to delete an account or erase a user (Art. 17).**
   `app/auth/actions.ts` has no deletion path, and the app intentionally holds no
   Supabase service-role key (`README.md:120`), so today there is no code path at
   all that can remove an `auth.users` row. A user who signs up cannot get their
   email, password hash, or content erased.
4. **No data export (Art. 15/20).** Nothing in `app/` produces a machine-readable
   copy of a user's account and content.

## Warning

5. **OpenRouter data-retention/training settings undecided and undocumented.**
   The project's own brief requires this
   (`docs/superpowers/specs/2026-07-25-sprint-project-brief.md:87` — retention,
   training toggle, Zero Data Retention), but no README, doc, or code comment
   records the decision. Without ZDR or equivalent, user course material may be
   retained and used for training by an undisclosed processor.
6. **Provider error bodies propagate to the user and can reach server logs.**
   `lib/openrouter.ts:66-68` embeds up to 500 characters of the raw OpenRouter
   response into the thrown `Error`, and `app/actions/rewrite.ts:61-66` returns
   `err.message` straight to the browser. Some provider error shapes echo request
   content; any uncaught variant would be written to Vercel's server log.
7. **No processor documentation (Art. 28/30).** No DPA references, no
   sub-processor list, no record of processing activities for Supabase (DB, auth,
   transactional email), Vercel (hosting, logs), or OpenRouter. Storage region is
   not pinned anywhere in the repo, so international-transfer posture is unknown.
8. **No retention or purge mechanism.** `supabase/migrations/001_initial_schema.sql`
   keeps every `rewrite_versions` row forever, including rejected and superseded
   drafts. Storage limitation (Art. 5(1)(e)) has no implementation.
9. **Third-party personal data inside `source_text` is unmanaged.**
   `lib/validation.ts:13` accepts any 20,000-char string and
   `app/actions/sections.ts` stores it verbatim. Users pasting course material
   containing named students or authors make the operator a controller for that
   data, with no notice, no minimisation guidance, and no way to honour a third
   party's request.

## Suggestion

10. **Add a policy link and short notice at the point of collection** —
    `components/SignUpForm.tsx` and `app/layout.tsx` are the natural anchors.
11. **Real test-user credentials sit in plaintext config.** `.env.local` holds
    `E2E_TEST_EMAIL`, `E2E_TEST_EMAIL_B` and their passwords alongside the live
    `OPENROUTER_API_KEY`. It is correctly covered by `.gitignore` (`.env*`), but
    prefer non-routable synthetic addresses so no real mailbox is tied to a
    checked-out secret file.
12. **Document what already works well, so the policy can be accurate.** RLS is
    enforced on all three tables with per-user `select/insert/update/delete`
    policies; the LLM call is server-only (`import "server-only"` at
    `lib/openrouter.ts:1`) and sends **no user identifier** to OpenRouter (no
    `user` field, no `HTTP-Referer`/`X-Title` header); there are no analytics or
    tracking scripts; deletes are hard deletes with cascading FKs; and
    `next.config.ts` sets a restrictive CSP. These are the facts a compliant
    policy would rest on.
13. **When building erasure**, route it through a server-side admin client
    (`supabase.auth.admin.deleteUser`) held only in server env, so the existing
    `on delete cascade` chain does the rest — do not introduce a `deleted_at`
    flag.
14. **Session cookies are strictly necessary**, so no cookie consent banner is
    required; state that explicitly in the policy rather than adding a banner.

---

# 2. EU AI Act audit

## AI feature inventory

| Feature | Location | Nature |
|---|---|---|
| LLM section rewrite | `lib/openrouter.ts` (`rewriteSection`), invoked by `app/actions/rewrite.ts` | Server-side OpenRouter chat completion, model `anthropic/claude-sonnet-4.5`. Generates course-script text from user-supplied source material. |
| Generated-text storage | `supabase/migrations/001_initial_schema.sql` (`rewrite_versions`) | Persists AI output with a `model` slug and `status` of `draft` / `manually_edited` / `approved` / `rejected`. |
| Generated-text display and editing | `components/RewriteEditor.tsx`, `VersionList.tsx`, `ModelBadge.tsx` | Shows AI output for review, editing, approval. |
| Generated-text export | `components/DocumentPreview.tsx` + `app/projects/[projectId]/preview/page.tsx` | Assembles approved AI text into a printable document; `window.print()` to PDF. |

Confirmed negatives: no chatbot or conversational agent (`CLAUDE.md` explicitly
forbids one; no chat route, message table, or streaming endpoint exists); no
image, audio, or video generation (`package.json` has no such SDK, and the only
outbound `fetch` is the OpenRouter call); no deepfake or media manipulation; no
embeddings, RAG, biometrics, or emotion recognition; no public or
unauthenticated route (`proxy.ts` gates everything).

## Risk classification: limited risk (Article 50 applies)

- **Not prohibited (Art. 5).** No social scoring, subliminal or manipulative
  technique, exploitation of vulnerability, biometric categorisation, or emotion
  inference. The system rewrites the user's own documents on explicit demand.
- **Not high-risk (Art. 6 / Annex III).** The nearest Annex III heading is point
  3, education and vocational training, which covers systems that determine
  admission, evaluate learning outcomes, assess the appropriate level of
  education, or monitor exam behaviour. This app does none of those: it produces
  teaching *material* for the author's own review, and every output passes an
  explicit human approval gate (`approveVersion` in `app/actions/versions.ts`,
  with a DB-enforced one-approved-version-per-section index). It makes no
  automated decision about any person. Authoring aids for instructors fall
  outside Annex III point 3.
- **Limited risk applies** because the system generates synthetic text published
  to the user and exported as a document. Art. 50(2) (machine-readable marking of
  synthetic content) and Art. 50(4) second subparagraph (disclosure where
  AI-generated text is published to inform the public) are the relevant hooks.
  Art. 50(1), chatbot disclosure, does not apply — there is no conversational
  interface.
- **GPAI note.** This app uses a third-party model via OpenRouter; the Chapter V
  general-purpose-model obligations sit with the upstream model provider.

## Article 50 criteria

| # | Criterion | Result |
|---|---|---|
| 1 | Chatbot / AI-assistant disclosure at or before first interaction | **PASS** (not applicable; disclosure adequate anyway) |
| 2 | AI-generated content labelled as artificially generated | **FAIL** |
| 3 | Deepfakes / manipulated media flagged | **PASS** (not applicable) |

1. **PASS.** Checked every route under `app/` and every component in
   `components/`; there is no conversational agent, persona, or human-sounding
   name — `CLAUDE.md` mandates "Do not turn the application into a chatbot" and
   "No chat bubbles". Where the user invokes the model, the interface is
   explicitly labelled: `RewriteEditor.tsx:50` renders the heading "AI rewrite"
   and line 67 the button "Generate rewrite".
2. **FAIL.** In-editor provenance signalling is decent (the "AI rewrite" heading
   and the `ModelBadge` model slug at `RewriteEditor.tsx:89` and
   `VersionList.tsx:37`). But labelling is lost at exactly the point content
   leaves the app: `components/DocumentPreview.tsx:46` renders
   `version.rewritten_text` inside a plain `<article>` with no AI provenance
   notice, and the print stylesheet in `app/globals.css` has only a `.no-print`
   rule — no header, footer, or watermark. The printed or PDF-exported script
   carries no indication it was machine-generated. There is also no
   machine-readable marking anywhere: no C2PA or provenance metadata, no
   watermark, and no marker in the `rewrite_versions` row beyond a `model` string
   that never reaches the exported artefact.
3. **PASS.** Confirmed by dependency review of `package.json` and by grepping
   `app/`, `components/`, and `lib/` for image, audio, video, face, and voice
   APIs: the app handles Markdown and plain text only. `README.md:38-42` confirms
   images are never processed — figures survive only as literal `[FIGURE: ...]`
   text placeholders, and `prompts/system-prompt.md:22` forbids the model from
   pretending to see them.

## Critical

None. No prohibited practice, no high-risk deployment, and no live conversational
AI feature shipping without disclosure.

## Warning

**W1 — Exported and printed documents carry no AI-generated marking.**
`components/DocumentPreview.tsx` (line 46 renders the AI text; lines 28-34 are
the print trigger) and `app/globals.css` (print block defines only `.no-print`).
Approved AI text is assembled into a document a user will hand to learners or
publish as a PDF, with every trace of its AI origin stripped. This is the app's
main Art. 50(4) exposure and should be closed before the **2 December 2026**
AI-content labelling deadline — roughly three months out.

**W2 — No machine-readable marking of synthetic output.** `lib/openrouter.ts`
returns `{ text, model, usage }` and `app/actions/rewrite.ts:68-78` writes it
straight to `rewrite_versions` with no provenance metadata; the schema has no
field for it. Art. 50(2) expects synthetic output to be marked in a
machine-readable, interoperable way (watermark, metadata, provenance record).
Same **2 December 2026** horizon.

**W3 — Human edits silently erase the AI/human boundary.**
`app/actions/versions.ts` (`updateVersionText`, lines 41-45) overwrites
`rewritten_text` in place and flips `status` to `manually_edited`, so a version
can be 1% or 100% human without any record of which. Combined with the free-text
editor at `RewriteEditor.tsx:91-96`, a fully AI-written section and a heavily
human-rewritten one are indistinguishable downstream. Preserving the original AI
text as an immutable row and recording edits separately would fix both this and
the provenance chain.

**W4 — The system prompt actively suppresses self-labelling.**
`prompts/system-prompt.md:26`: "Return only the rewritten course section. Do not
add an editorial report, preface, or explanation of your changes." Sound product
design, but it means no disclosure can arrive via model output — the label must
be added by the application layer. Noted so the W1 fix is not attempted in the
prompt, where the model could inconsistently comply.

## Suggestion

**S1 — Surface AI involvement before generation, not only after.**
`RewriteEditor.tsx:50-68` names the feature "AI rewrite" but says nothing about
what happens to the submitted text. A one-line note near the "Generate rewrite"
button — that the section text and instructions are sent to a third-party model
provider (OpenRouter) and that output should be reviewed for accuracy — makes the
disclosure earlier and more informative, and doubles as GDPR transparency.

**S2 — Make the model badge legible to a non-technical user.**
`components/ModelBadge.tsx` renders the raw slug `anthropic/claude-sonnet-4.5`.
`CLAUDE.md` itself asks to "Show the model slug in readable form". Prefixing it,
e.g. "Generated by AI model: …", converts a technical identifier into an actual
disclosure at negligible cost.

**S3 — Say it in the product-facing docs.** `README.md` is thorough on security
acceptance criteria (lines 148-154) but has no equivalent for AI transparency. A
short section recording where AI is used, how outputs are labelled, and who
reviews them gives the accountability trail an assessor will ask for.

**S4 — Re-audit if the product ever touches learner assessment.** Nothing in the
current code does this, and the human approval gate is a genuine strength. But
the app sits in the education domain, so any future feature that grades, scores,
places, or monitors a learner would pull it into Annex III point 3 and the
high-risk regime.

## Positive observations

The human-in-the-loop design is real, not nominal: no AI output reaches the
preview document without an explicit `approveVersion` call, enforced at the
database level by the `one_approved_rewrite_per_section` unique index. The
`model` slug is stored on every generated row, giving a usable audit trail to
build provenance on. `prompts/system-prompt.md` forbids fabricating facts,
citations, quotations, and notation, and forbids pretending to see figures — a
meaningful accuracy safeguard. All model calls are server-side with no key
exposure, and RLS is enabled on every user-data table.

---

# 3. Reading the two reports together

The audits landed in materially different places, which is the useful result:

- **GDPR failed on documentation, not engineering.** Six of seven criteria fail,
  but the underlying data handling is sound — RLS everywhere, hard deletes with
  cascades, no user identifier sent to the LLM, no trackers, no logging of
  personal data. What is missing is the paperwork layer and two routes (export,
  erasure). The fix is mostly writing, plus one focused feature.
- **The AI Act found no Criticals but a real structural gap.** The app labels AI
  output well inside its own UI and loses that labelling precisely at the export
  boundary, where the content reaches learners. W3 (in-place edits erasing the
  AI/human boundary) is the finding most likely to be missed by a human skim, and
  it is a prerequisite for any honest labelling claim.
- **They overlap on OpenRouter.** GDPR Critical 2 and AI Act S1 point at the same
  line of code from opposite directions — undisclosed transfer of personal data
  out, and undisclosed AI involvement coming back. A single disclosure near the
  "Generate rewrite" button addresses part of both.

## Step 3 candidates (lab: fix the top Critical)

| Candidate | Argument for | Cost |
|---|---|---|
| **Critical 3** — account deletion/erasure | Matches the lab's own worked example; a real code change; `on delete cascade` already does the hard part | Requires introducing a service-role admin client and a server-only secret into an app that deliberately has neither (`README.md:120`) |
| **Critical 1** — privacy policy | Root cause of four failures at once; no security-model change | A document rather than code; less to demonstrate as engineering work |

---

**Both reports are automated first-pass signals, not legal rulings.** They
reflect static reading of the repository only — they cannot see Supabase project
settings, OpenRouter dashboard configuration, Vercel log retention, signed DPAs,
deployment context, provider-versus-deployer status, or how outputs are used in
practice, all of which materially affect the analysis. Neither is a substitute
for review by a qualified lawyer or data protection officer, and that applies
particularly to the "not high-risk" classification and the Art. 50 deadline
assessments.
