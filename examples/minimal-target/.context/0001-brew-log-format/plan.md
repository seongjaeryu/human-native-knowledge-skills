---
id: plan-0001-brew-log-format
type: artifact
status: active
version: 1
related: [artifact-0001-brew-log-format]
topic: 0001-brew-log-format
summary: "Execution plan for specification v1: verify the recorder mapping, decide malformed-line behavior for the reporter, implement and re-verify."
---

> Type note (audit item D3): this document instantiates `type: artifact` — the nearest frozen type of hnk skill 03 §2.2 — as a support document (the optional `plan.md` of skill/02 §4.1); the diagram duties owned by `ai-spec.md` do not apply to it.

# Execution Plan — 0001-brew-log-format

One plan per specification version; this plan executes
[ai-spec.md](ai-spec.md) v1. Its content was moved here from
[docs/superpowers/plans/2026-08-01-brew-log-format.md](../../docs/superpowers/plans/2026-08-01-brew-log-format.md)
(the superpowers `writing-plans` output path), where a compat-view stub now
stands (skill/02 §11); the orientation decision is recorded in
[sources.md](sources.md).

**Goal:** verify the brew-log line format implementation against its
specification (v1) and harden the reporter against malformed lines.

## Task 1 — Verify the recorder against the specification

- Run `node src/tracker.mjs --bean test` and confirm the appended line is
  `ISO-timestamp bean dose yield seconds`, space-separated.
- Confirm defaults (dose 18, yield 36, seconds 28) fill when flags are
  omitted.
- Verification: the observed line matches the format specified for
  NODE-BREW-01.

## Task 2 — Decide malformed-line behavior for the reporter

- Current behavior: a malformed line yields `NaN` fields in the report
  (NODE-BREW-03).
- Decide between skip-and-count (report how many lines were skipped) and
  fail-loudly (non-zero exit naming the offending line number).
- Verification: decision recorded with its reason; reporter behavior
  matches it.

## Task 3 — Implement and re-verify

- Implement the decided behavior in `src/report.mjs` without changing the
  line format (the log itself is append-only per
  [INV-BREW-001](../_global/invariants.md#inv-brew-001)).
- Verification: `node src/report.mjs` on a log containing one malformed
  line behaves as decided; all existing lines still parse.
