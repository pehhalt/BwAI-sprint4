# BwAI — Sprint 4

Coursework for Sprint 4 of the Building with AI course. Three parts, each in its own folder.

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

A single-screen Expo mobile app: roll a die with a button, tap the die to recolour it.
Runs on iOS, Android and the web. See [part3/README.md](./part3/README.md) — note it is
**pinned to Expo SDK 54 on purpose**, because Expo Go on the App Store is pinned there too.
