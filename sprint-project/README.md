# Sprint Project — Overprint, a print-on-demand t-shirt shop

**The code is not in this folder.** It lives in its own repository:

> ## https://github.com/pehhalt/overprint-shop
>
> **Live shop:** https://overprint-shop.vercel.app
> **Sandbox preview:** https://overprint-staging.vercel.app

This folder holds the planning artefacts that produced it, and this file explains why the
code is somewhere else.

---

## Why a separate repository

The sprint brief grades the repository history directly:

> *Documentation is complete and accurate: a README.md and a repository history that shows
> the branch-and-pull-request workflow (feature branches, merged PRs into main, and a merge
> into production).*

Two deploy paths are graded alongside it: merging a pull request into `main` deploys a
sandbox preview, and merging `main` into a `production` branch deploys the live site.

Both are far cleaner in a repository that contains only the shop. In this coursework
repository every pull request would sit beside parts 1 through 7, and merging `main` into
`production` would drag all of them along — diluting exactly the history a reviewer is asked
to read. A git submodule was considered and rejected: anyone who clones without
`--recursive` gets an empty folder.

---

## What was built

A small print-on-demand t-shirt shop. The owner signs into an admin panel and manages the
catalogue — name, price, description, mockup photo. A visitor browses, picks a shirt, and
pays through Stripe's hosted Checkout in sandbox. **The order is marked paid only when
Stripe's own signed webhook confirms it.**

The catalogue is the CMS. The shirt sale is the payment. Both halves are load-bearing:
remove the CMS and the owner cannot change a price without a redeploy; remove Stripe and
nothing is sold.

Print-on-demand is the shop's premise, not an integration — no fulfilment provider is
contacted.

---

## Planning artefacts in this folder

| File | What it is |
|---|---|
| [`docs/superpowers/specs/2026-09-04-shop-design.md`](docs/superpowers/specs/2026-09-04-shop-design.md) | The design, written and committed before any code. Includes the decisions taken and, more usefully, the alternatives rejected and why |
| [`docs/superpowers/plans/2026-09-04-shop.md`](docs/superpowers/plans/2026-09-04-shop.md) | The implementation plan: 19 tasks across three days, each with its own verification |

Both are copied into the shop repository too, so it stands alone for a reviewer.

Worth knowing when reading them: the plan was written before anything ran, so its code
blocks are **hypotheses, not authority**. Several turned out wrong — a locale that formatted
money the wrong way, a connection-pool size that deadlocked, a test that could not have
failed. Those corrections are recorded in the design decisions and in the shop repository's
commit history rather than silently patched.

---

## Status

| Day | Scope | State |
|---|---|---|
| 1 | CMS, catalogue, environments, CI/CD pipeline | ✅ Complete — live URL, both deploy paths green |
| 2 | Stripe Checkout, verified webhook, orders | ✅ Complete — both test cards run on both environments |
| 3 | Optional tasks, README, evidence pack | In progress |

---

## Related coursework

- [`../part6`](../part6) — what this project covers of the CMS-and-payments lesson, what it
  does not, and five things that lesson does not warn you about
- [`../part7`](../part7) — the same, for the production-systems lesson
