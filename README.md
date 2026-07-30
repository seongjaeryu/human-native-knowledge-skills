# human-native-knowledge-skills (`hnk`)

> A skill that teaches AI agents to build knowledge systems humans can actually understand.

Install verified end-to-end over the raw GitHub URL — 24 files fetched, zero refetches, final `verify` green ([release history](CHANGELOG.md)). [한국어 README](README.ko.md)

## Quickstart

Paste this to your AI agent:

```text
Analyze https://github.com/seongjaeryu/human-native-knowledge-skills
and apply its context operating system to this project.
Follow orchestrator.md. Start with the Level 1 setup interview.
```

Works with any agent that can fetch URLs and write files — verified end-to-end with Claude Code; the same prompt works in Cursor, Codex, and other URL-capable agents. The setup interview takes under a minute; your agent proposes every answer, you confirm.

**You do exactly two things in this system: answer interviews, and ask questions. Every command is run by the agent — the standing rules remember so you don't have to.**

## Your first ten minutes

The installation itself becomes your first session card — the install session is archived before the agent finishes. One minute after install, ask your agent *"why is the archive set up this way?"* — it answers from the card, not from memory. Three weeks later, a different person's agent answers the same question the same way. And when you — or your successor — return with no agent running, `node scripts/hnk.mjs status` prints the newest decisions and open ends in one terminal command.

## How it works

You know this moment: three weeks after a feature ships, someone asks *"why did we choose X over Y?"* — and the answer died with a chat tab. The agent that made the decision explained it beautifully, once, to one person, in a conversation nobody can find.

`hnk` restores how people solved this before AI: documents flowed between collaborators, and outcomes were distilled into **result documents** anyone could pick up later. Installed into your project, it gives you:

- **Two interviews, both under a minute** — a setup interview at install, a one-line working-mode confirmation before each piece of work. The way of working is agreed and recorded, never assumed.
- **A session archive that answers questions** — every "one human + one AI" session leaves a committed result card (decisions, reasons, deltas, affected files). Raw transcripts stay local and git-ignored, cryptographically linked to their cards. Ask *"what happened with X?"*, run `node scripts/hnk.mjs status` for the ten-second handover (no agent needed), or `report` for a full digest.
- **Specifications that lead with diagrams** — node graphs and flowcharts before prose, stable NODE-IDs mapped to code (or to document sections in non-code projects).
- **Honest records by construction** — reconstructed transcripts are never labeled as captured, every binary asset carries a required text description, and secrets are redacted at write time and scanned before upload.

The problem this solves is **knowledge debt**: the *principal* is every AI output that was never mutually understood at production time; the *interest* is the understanding cost that compounds as time passes and people (and AI sessions) change. The full philosophy lives in [`core/philosophy.md`](core/philosophy.md).

## What a session leaves behind

This is a real card from the demo install (excerpt — full card in [`examples/minimal-target`](examples/minimal-target/.context/_archive/session-20260728-202806-brew-log-format-specification.md)):

```markdown
---
id: session-20260728-202806-brew-log-format-specification
meta: {author: seongjaeryu, agent: claude-code@claude-fable-5}
mode: confirm-spec-changes-only
raw_fidelity: reconstructed
summary: "Topic 0001-brew-log-format created: ai-spec v1 (NODE-BREW-01..03),
  spec-node mapping into both CLI files, INV-BREW-001, wiki synced."
---
## Key decisions
- **Line format codified as observed**: `ISO-timestamp bean dose yield seconds` —
  codifying the de-facto format instead of inventing a new one keeps every
  existing log line valid.
- **INV-BREW-001 added** (append-only brew-log): the log is the project's only
  history, so rewriting it would destroy verifiability.

## Deltas
- **Initial topology established (v1)**
  - after: `NODE-BREW-01[Brew Recorder] --> NODE-BREW-02[Brew Log Store] --> NODE-BREW-03[Brew Reporter]`

## Follow-ups
- NODE-BREW-03 tolerates malformed lines by emitting `NaN`; decide whether the
  reporter should skip-and-count or fail loudly (candidate next goal).
```

A reader with zero context — human or AI — gets the decisions, the reasons, the rejected alternatives, and the open ends. That is the unit of accumulation.

## Proof

This repository applies its own philosophy to itself — every claim below is recorded, not asserted:

- **Real-URL install verified** before tagging v1.0.0: a fresh agent session given only the GitHub URL fetched 24 files (343,410 bytes, zero refetches), confirmed the script and templates byte-identical over the URL path (SHA-256), and completed the install with `verify` at 0 failures / 0 warnings.
- **Three end-to-end installs green**: fresh code project, brownfield (existing `CLAUDE.md` + `docs/`, nothing moved), and a non-code knowledge project.
- **`scripts/hnk.mjs` is one dependency-free file** (Node builtins only) with a 29-test suite, green on Node 18/20/22 in CI.
- **Pre-release self-audit passed** ([`core/audit.md`](core/audit.md)): zero derivation/honesty failures; 538 semantic pointers mechanically checked, all live links resolve.
- **[`examples/minimal-target`](examples/README.md) is the output of a real install run** — including the disclosure of what was simulated (interview answers). We publish what the demo is, not what it pretends to be.

Findings from every verification run — including our own defects — are in [CHANGELOG.md](CHANGELOG.md).

## Vocabulary (the five words worth knowing)

| Term | Meaning |
| --- | --- |
| session card | The committed result document of one "human + AI" session |
| raw | The local, git-ignored transcript a card links to by SHA-256 |
| Living layer | The human-facing current-state docs (`wiki/` or your existing `docs/`) |
| `.context/` | Where stored context lives — written by the agent, read through extractions |
| NODE-ID | The stable identifier tying a diagram node to code or document sections |

## Repository map

| Path | Role |
| --- | --- |
| `core/` | The constitution: goal, first principle, knowledge-debt definition, audit criterion |
| `skill/` | The curriculum AI agents read to learn the system |
| `orchestrator.md` | The 8-step installation state machine |
| `templates/` | Files the AI instantiates into target projects |
| `scripts/hnk.mjs` | Single-file, zero-dependency reference script |
| `guides/` | Harness-independent guidance (viewers, enforcement, storage) |
| `examples/` | A fully instantiated demo target project (instance demo, not spec) |

## Contributing and feedback

Issues and feedback are welcome — this project eats its own philosophy, so tell us where understanding breaks down. Pull requests go through a gate: read [CLAUDE.md](CLAUDE.md) (yes, it is addressed to your agent) and fill the pull-request template completely; specification changes require a version increment with a recorded reason and a passing core-audit. Domain-specific adaptations belong in their own repositories, pointed at this one.

## License

[MIT](LICENSE)
