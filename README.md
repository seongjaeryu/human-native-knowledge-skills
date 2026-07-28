# human-native-knowledge-skills (`hnk`)

> A skill that teaches AI agents to build knowledge systems humans can actually understand.

[한국어 README](README.ko.md)

## The problem: knowledge debt

AI does more and more of our work — and stores the results in forms humans cannot properly verify. The person who worked with the AI (user 1) already accrues debt: decisions they never really checked, context that lives only in a chat log. By the time user 2 or user 3 inherits the work, the cost of understanding has compounded. We call this **knowledge debt**: the *principal* is every AI output that was never mutually understood at production time; the *interest* is the understanding cost that compounds as time passes and people (and AI sessions) change.

Before AI, people had a working answer to this. Documents flowed between collaborators, discussion happened around them, and the outcome was distilled into a *result document* that anyone could pick up later. This repository applies that pattern to agentic workflows: **work done by "one human + one AI" is recorded so that any later human — or any later AI — can understand it.**

The goal, in one line: **the accumulation of knowledge that both humans and AI can easily understand.**

## What this repository is

This is not a template you clone. It is a **skill an AI agent consumes by URL**. You point your AI agent at this repository; it reads the philosophy (`core/`), the curriculum (`skill/`), instantiates the templates into your project's `.context/` structure, copies a single zero-dependency script (`scripts/hnk.mjs`), runs a setup interview with you, and from then on operates your project's knowledge system — session archives, visual asset indexes, and pre-work interviews included.

`hnk` is the registered official short name of this project — itself a demonstration of the naming rule it teaches: *abbreviations are banned unless registered in the dictionary.*

## Quickstart

> **Status: v1.0.0 release candidate.** All skill documents, templates, the zero-dependency script, guides, and a real-install demo are complete; the prompt below works once the repository is pushed and the release is tagged.

Paste this to your AI agent (Claude Code, Cursor, or any agent that can fetch URLs and write files):

```text
Analyze https://github.com/seongjaeryu/human-native-knowledge-skills
and apply its context operating system to this project.
Follow orchestrator.md. Start with the Level 1 setup interview.
```

What the installed system gives you, day to day:

- **Two interviews, both under a minute** — a setup interview at install, and a one-line working-mode confirmation before each piece of work. The way of working is always agreed and recorded, never assumed.
- **A session archive that pays for itself** — every "one human + one AI" session leaves a committed result card (decisions, reasons, deltas, affected files); raw transcripts stay local and git-ignored, cryptographically linked to their cards. Ask "what happened with X?" or run `node scripts/hnk.mjs report` for a digest.
- **Specifications that lead with diagrams** — node graphs and flowcharts before prose, with stable NODE-IDs mapped to code (or to document sections in non-code projects).
- **Honest records by construction** — reconstructed transcripts are never labeled as captured, every binary asset carries a required text description, and secrets are redacted at write time and scanned before upload.

## Repository map

| Path | Role |
| --- | --- |
| `core/` | The constitution: goal, first principle, knowledge-debt definition, audit criterion |
| `skill/` | The curriculum AI agents read to learn the system |
| `templates/` | Files the AI instantiates into target projects |
| `scripts/hnk.mjs` | Single-file, zero-dependency reference script (Node builtins only) |
| `guides/` | Harness-independent guidance (viewers, enforcement, storage) |
| `examples/` | A fully instantiated demo target project |

## Feedback

Issues and feedback are welcome — this project eats its own philosophy, so tell us where understanding breaks down.

## License

[MIT](LICENSE)
