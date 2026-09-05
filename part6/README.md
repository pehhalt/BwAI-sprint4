# Part 6 — Building a CMS and Integrating Payments

**This part has no code of its own.** Everything it teaches was built inside the sprint
project instead, so that the CMS and the payments were exercised once, properly, in a
deployed application rather than twice in a throwaway lab.

**The code lives in a separate repository: https://github.com/pehhalt/overprint-shop**
Live shop: https://overprint-shop.vercel.app · Preview: https://overprint-staging.vercel.app

This file records what the sprint project covers of Part 6, what it does not, and what was
learned that the lesson does not mention.

---

## Why this part was rolled into the sprint project

The sprint project brief ("Ship Your Own Online Shop") asks for the same two halves this
lesson teaches — a CMS with an owner-editable catalogue, and Stripe Checkout confirmed by a
verified webhook. Doing the lab first would have meant building a shop, throwing it away,
and building a second shop three days later.

The decision was to build one shop and hold it to the sprint brief's standard, which is
strictly higher than the lab's: two separated environments instead of one, a deployment
pipeline, and a live URL a reviewer can visit.

---

## Coverage against the lab

| Lab step | Status | Where / what actually happened |
|---|---|---|
| 1. Install Payload agent skills | ✅ Done | `npx skills add payloadcms/skills` — installed `payload` and `cms-migration`, committed to the repo so the version they were built against is recorded |
| 2. Install Stripe agent skills | ✅ Done | `claude plugin install stripe@claude-plugins-official` |
| 3. Scaffold the Payload app | ⚠️ Deviated | See "Finding 1" — `create-payload-app` could not run, and the `website` template was not used |
| 4. Connect a development Supabase project | ✅ Exceeded | Two projects, not one: `overprint-dev` and `overprint-prod`, with `DATABASE_URI` scoped per environment. See "Finding 2" for the connection-string trap |
| 5. Log into the admin panel, create the first user | ✅ Done | Separate admin users for development and production |
| 6. Describe a Products collection | ✅ Done | `name`, `slug`, `price`, `description`, `photo`, `soldOut`; access is "anyone can read, only a logged-in admin can write" — exactly the lab's phrasing, written as a tested unit in `src/access/index.ts` |
| 7. Add products through the admin panel | ✅ Done | Four real products created in the production admin panel |
| — *success check: editing a price changes the site with no redeploy* | ✅ **Proven by timing** | Products were created after the last deployment, with no workflow run in between, and appeared live immediately |
| 8. Add Stripe test keys | ✅ Done | `sk_test_`/`pk_test_` in `.env` and both Vercel environments; verified against Stripe's API returning `livemode: false` |
| 9. Add a hosted Checkout flow | ✅ Done, with a caveat | `POST /shop/checkout`. See "Finding 5" — the lab's flow fails on a current Stripe account |
| 10. Mark orders paid only from the webhook | ✅ Exceeded | `POST /shop/stripe-webhook`, signature-verified over raw bytes, idempotent on replay |
| 11. Test purchase with `4242…`, then decline with `4000…0002` | ✅ Done on **both** environments | Evidence below |

### Evidence for step 11

Production database after the two card runs:

```
#2  PAID     2300 cents   Rambling Men - T-Shirt
    paidAt = 2026-09-06 00:55:13   intent = pi_3UCSUNGqFQLExwlb1LJjzV7o
#3  PENDING  2300 cents   The Chilis - T-Shirt
    paidAt = (null)       intent = (null)
```

Stripe's side: exactly one `checkout.session.completed`, `payment_status=paid`, `livemode=false`.

The declined card produced **no Stripe event at all**, which is why the pending row is the
evidence. An order is created `pending` when checkout starts and only the verified webhook
flips it to `paid` — so a decline leaves a visible row that never became paid, rather than
leaving nothing to show.

---

## Coverage against the learning outcomes

| Outcome | Status |
|---|---|
| Explain what a CMS solves; headless vs traditional | ✅ Understood and acted on — the catalogue is owner-editable with no redeploy, which is the entire claim |
| Describe Payload's concepts well enough to direct an agent | ✅ Collections, fields, admin panel, media uploads and access control were all specified in plain language and built from those descriptions |
| Connect Payload to Supabase through an environment variable, using a development project | ✅ Exceeded — two projects, verified separate by connecting to both |
| Explain hosted Checkout, complete a sandbox purchase, explain why the webhook is the only trustworthy signal | ✅ Done, and enforced in code: the success page has no authority and cannot mark anything paid |
| Describe what changes when switching from sandbox to live | ⬜ **Not yet written** — this is a sprint-project optional task ("a written go-live plan") scheduled for day 3 |

---

## Not covered

- **The `website` template's styled front end.** The lesson suggests `create-payload-app -t
  website` for a ready-made shop front. The sprint project has a hand-built front end
  instead (catalogue, product page, confirmation page). Nothing was lost functionally, but
  the template's blocks/layout system was never exercised.
- **A dedicated cancel page.** Lab step 9 asks for a cancel page for customers who back out.
  Stripe's `cancel_url` points back at the product page instead. That is a reasonable
  product decision, but it is a small gap against the letter of the lab.
- **Prices in pounds.** The lab says "a price in pounds". This shop uses **integer cents in
  EUR**, because storing money as a decimal is a bug with a delay fuse and Stripe expects
  minor units regardless. A deliberate deviation, not an omission.
- **The `cms-migration` skill.** Installed but never used — there was no existing site to
  migrate content from.
- **The go-live plan** (see above), scheduled for day 3.

---

## Findings the lesson does not mention

These cost real time and are the most useful thing this part produced.

### Finding 1 — `create-payload-app` needs a terminal, and fails hard without one

The lesson's Step 3 assumes an interactive terminal. Run inside an agent session with no
TTY, `create-payload-app` crashes rather than degrading to non-interactive defaults. The
scaffold had to be assembled by sparse-cloning Payload's `templates/blank` from GitHub and
hand-converting it from MongoDB to Postgres.

That worked, and an independent review confirmed no MongoDB remnants and a complete
`(payload)` route group — but it is a real obstacle for anyone following this lesson with an
agent rather than by hand.

### Finding 2 — Supabase gives you three connection strings and two of them break Payload

The lesson says to "copy the connection string" and, if unsure, ask the agent. That
under-sells it. Supabase's Connect dialog offers:

| | Port | Result with Payload |
|---|---|---|
| Direct connection | 5432 | Works locally, **fails on Vercel** — it is IPv6-only and Vercel has no IPv6 egress |
| Transaction pooler | 6543 | **Breaks Payload** — no prepared statements, which its Drizzle adapter uses |
| **Session pooler** | 5432 | **Correct** |

Direct and session-pooler strings both use port 5432, so the port alone does not distinguish
them. The reliable test is that the **username contains a dot** (`postgres.<project-ref>`)
and the **host contains `pooler`**.

Selecting Supabase's **Prisma** tab makes this worse: it hands you `DATABASE_URL` (the
transaction pooler) plus `DIRECT_URL`, because Prisma uses different connections for
different jobs. Payload reads `DATABASE_URI` and needs the session pooler for everything.

### Finding 3 — Payload owns `/api`

Payload 3 mounts its REST API at `/api/[...slug]`. Application endpoints must live somewhere
else; this project uses `/shop/checkout` and `/shop/stripe-webhook`. Sharing the `/api`
prefix means relying on Next.js route-precedence between two route groups — not worth the
risk in a payment path.

### Finding 4 — media uploads do not work on Vercel with Payload's defaults

Payload's default upload storage writes to the local filesystem. Vercel's is read-only and
ephemeral, so product photos vanish. The fix is a storage adapter
(`@payloadcms/storage-vercel-blob`) with **`clientUploads: true`**, because Vercel caps
server uploads at 4.5 MB and a product photo will exceed it.

This affects the lesson's own success check: "editing a product's price in the admin panel
changes it on the site" works fine locally with default storage, and the photo half of it
silently breaks once deployed.

### Finding 5 — the lab's Stripe Checkout call now fails on a new account

**This is the finding most likely to block someone following the lesson today.**

Creating a Checkout Session with inline `price_data` — which is what the lab's Step 9
produces — returns HTTP 400 on a current Stripe sandbox:

> *Invalid line_items[0]: the product tax code is missing... Product tax code is required
> for Managed Payments, which is enabled by default on your account.*

Stripe's Managed Payments is now on by default for new accounts. Two fixes were tested
against the live API before changing any code:

```
managed_payments[enabled]=false          -> 200, session created
product_data[tax_code]=txcd_99999999     -> 400, still rejected
```

So the session must pass `managed_payments: { enabled: false }`. The Stripe Node SDK already
types this field, so no cast is needed. Nothing in the lesson, and nothing in most training
data, mentions it.

### Finding 6 — the skills install to `.agents/skills/`, not `.claude/skills/`

The lesson says the Payload skills "land in a `.claude/skills/` folder". They actually land
in `.agents/skills/`, symlinked for Claude Code. Minor, but it matters if you go looking for
them or decide whether to commit them.

---

## What the sprint project adds beyond Part 6

Recorded because the coverage is deliberately asymmetric — the sprint brief demands more
than the lab:

- **Two Supabase projects**, verified separate by connecting to each; distinct Blob stores
  and distinct `PAYLOAD_SECRET` per environment
- **Schema managed by migrations in every environment** (`push: false`), so production's
  schema comes only from committed migrations
- **Orders closed to every HTTP write path** — the webhook is the only writer, through
  Payload's Local API
- **Line items snapshot the product name and unit price at purchase**, so editing a price
  cannot rewrite what a customer was charged
- **Idempotent webhook handling**, since Stripe retries deliveries
- **A compensating action**: if the order write fails after a Stripe session exists, the
  session is expired so it cannot be paid
- **39 tests**, using Stripe's real signing helper and the real database rather than mocks
- **A CI/CD pipeline** where the workflow is the only thing that deploys

---

## Where to look in the code

| Concept | File |
|---|---|
| Collections and fields | `src/collections/Products.ts`, `Media.ts`, `Orders.ts` |
| Access control | `src/access/index.ts` (+ `tests/unit/access.spec.ts`) |
| Payload + Supabase wiring | `src/payload.config.ts` |
| Media uploads on Vercel | the `vercelBlobStorage` plugin block in `src/payload.config.ts` |
| Hosted Checkout | `src/app/(frontend)/shop/checkout/route.ts` |
| The webhook | `src/app/(frontend)/shop/stripe-webhook/route.ts` |
| The success page that decides nothing | `src/app/(frontend)/order/success/page.tsx` |
