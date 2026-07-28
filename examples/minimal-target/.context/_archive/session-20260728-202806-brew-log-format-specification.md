---
id: session-20260728-202806-brew-log-format-specification
type: session
started: 2026-07-28T20:28:06Z
ended: 2026-07-28T20:30:17Z
meta: {author: seongjaeryu, agent: claude-code@claude-fable-5}
topic: 0001-brew-log-format
interview: interview-0001-brew-log-format
mode: confirm-spec-changes-only
visibility: private
status: local-only
raw_fidelity: reconstructed
raw_local: .context/_archive/sessions/session-20260728-202806-brew-log-format-specification.full.md
raw_remote: null
raw_sha256: d87301efb3a5839c7d5438b7b0849b3cf30d0b6191bb4d60ed7dc9d910d40719
summary: "Topic 0001-brew-log-format created: ai-spec v1 (NODE-BREW-01..03), spec-node mapping into both CLI files, INV-BREW-001, first binary registered, wiki synced."
---

## Goal

Define the brew-log line format as a full-topic specification and map the
existing CLI to it, under `confirm-spec-changes-only` as recorded in
[interview.md](../0001-brew-log-format/interview.md) (confirmation form;
proposal cited the install card
[session-20260728-202134-install-hnk-coffee-tracker](session-20260728-202134-install-hnk-coffee-tracker.md)).

## Key decisions

- **Level 2 answers confirmed**: deliverable `specification`, mode
  `confirm-spec-changes-only` (profile default), depth `full-topic` (profile
  default), visuals `node-graph-and-flowchart` (forced by depth), archive
  `card-per-goal` — a confirmed deviation from the `specification` default
  `card-per-milestone`, because this topic hosts a single short goal.
- **Line format codified as observed**: `ISO-timestamp bean dose yield
  seconds`, space-separated — codifying the de-facto format instead of
  inventing a new one keeps every existing log line valid.
- **Three macro nodes**: NODE-BREW-01 Brew Recorder, NODE-BREW-02 Brew Log
  Store, NODE-BREW-03 Brew Reporter. NODE-BREW-02 is data at rest with no
  implementing code unit — stated in the specification so "unmapped" is
  never mistaken for "unimplemented".
- **INV-BREW-001 added** (append-only brew-log): the log is the project's
  only history, so rewriting it would destroy verifiability. Decided here,
  recorded in [invariants.md](../_global/invariants.md#inv-brew-001).
- **Demonstration binary registered honestly**:
  [media-20260728-202909-brew-log-sample](index.md#media-20260728-202909-brew-log-sample)
  is a single-pixel placeholder; its `alt` says exactly that, so the record
  claims no more than it is.
- **No dictionary changes needed**: `brew-log` and the `BREW` NODE-ID domain
  code were already registered at install (L1-8).

## Deltas

- **Initial topology established (v1)** — reason: first specification of
  this topic; codifies the de-facto CLI behavior.
  - nodes: NODE-BREW-01, NODE-BREW-02, NODE-BREW-03
  - before: (none — no specification existed)
  - after: `NODE-BREW-01[Brew Recorder] --> NODE-BREW-02[Brew Log Store] --> NODE-BREW-03[Brew Reporter]`

## Affected files

- .context/0001-brew-log-format/interview.md (created)
- .context/0001-brew-log-format/ai-spec.md (created, version 1)
- .context/0001-brew-log-format/sources.md (created)
- .context/_global/invariants.md (INV-BREW-001 row added)
- .context/_media/index.md (entry media-20260728-202909-brew-log-sample added; payload placed under the git-ignored media payload directory)
- src/tracker.mjs (spec-node comment block for NODE-BREW-01)
- src/report.mjs (spec-node comment block for NODE-BREW-03)
- wiki/index.md (active-topics row + first History Annotation entry)
- .context/_archive/sessions/session-20260728-202806-brew-log-format-specification.full.md (this session's raw, git-ignored)
- .context/_archive/index.md, llm.txt (regenerated at session end)

## Follow-ups

- NODE-BREW-03 tolerates malformed lines by emitting `NaN` fields; decide
  whether the reporter should skip-and-count or fail loudly (candidate next
  goal for this topic).
- Storage remains `none`; the registered payload and both raws exist only on
  this machine (accepted at install).
