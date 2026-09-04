# BwAI — Sprint 4

Coursework for Sprint 4 of the Building with AI course. Five parts, each in its own folder.

## [part1](./part1) — Agent skills

Notes on how the globally installed agent skills on this machine were set up, including the
Windows- and editor-specific fixes needed to make them actually run. Includes a Slidev
deck ([`lab-deck`](./part1/lab-deck)) and the generated diagrams.

## [part2](./part2) — Compliance subagents

Two read-only compliance auditors — [`gdpr-compliance`](./part2/.claude/agents/gdpr-compliance.md)
and [`eu-ai-act-compliance`](./part2/.claude/agents/eu-ai-act-compliance.md) — built for the
"audit an earlier project for compliance" lab, with the findings from running them against an
earlier project and notes on reusing them across the whole tree.

## [part3](./part3) — Roll a Dice

A single-screen Expo mobile app: roll a dice with a button, tap the dice to recolour it.
Runs on iOS, Android and the web. See [part3/README.md](./part3/README.md).

**Its SDK note is now out of date.** It says it is pinned to SDK 54 because Expo Go is
pinned there too. Expo Go has since moved to SDK 57 and is not backward compatible, so
part3 no longer opens in it — [part4](./part4) hit exactly this and had to upgrade.
Left as it is: part3 is finished coursework, and the stale claim is a better record of
what was believed at the time than a silent correction would be.

## [part4](./part4) — Grandma's Wisdom of the Day

An Expo app that asks a model for one line of wisdom, in a Wise or Funny tone, and keeps
what it generated. Three screens: Wisdom, History, Settings. The OpenRouter key stays on
a server route and never reaches the phone, and every screen rendering AI output carries
a disclosure line above that output, which an EU AI Act audit had previously caught
sitting where it could be scrolled past. See [part4/README.md](./part4/README.md).

The Settings screen was designed and handed off in part5 rather than written directly.

## [part5](./part5) — Claude Design, and three reviewers

Two graded pieces of work and one optional extra, all documentation and evidence — the
code they produced lives in [part4](./part4).

**Claude Design, round trip.** A Settings screen designed against the app's real tokens,
compared across three layouts, handed off as a bundle rather than a screenshot, built on
a branch and merged. The finding is that the prescribed workflow does not fit this
project: `/design-sync` publishes a design system you already have as a component
library, and does not create one — which is what the exercise is asking you to learn.

**Three independent reviewers on the same code.** Claude Code built it; an open-weight
model (`z-ai/glm-5.2` via OpenRouter) and OpenAI's `gpt-5.6` reviewed it, each from a
different vendor. Fifteen findings, none on more than one list. The only data-loss bug
came from the reviewer asked the least specific question, and the most confident output
came from one that had read nothing at all.

See [part5/README.md](./part5/README.md), and
[part5#using-the-codex-cli-in-later-parts](./part5/README.md#using-the-codex-cli-in-later-parts)
for how to reuse the Codex CLI setup in later sprints.
