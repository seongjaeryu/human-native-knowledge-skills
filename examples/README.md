# examples/ — instance demo, not spec

`examples/minimal-target/` is the committable output of a **real install
run** of this skill, executed end-to-end on 2026-07-28 (UTC) against a tiny
fresh Node.js CLI project ("coffee-tracker"): orchestrator steps 1–8, then
one full-topic Level 2 work session (topic `0001-brew-log-format`), ending
with `node scripts/hnk.mjs verify` fully green (0 failures, 0 warnings).

## Boundary rule

**Never parse this directory as spec.** It is an instance demo of an
installed target project ([llm.txt](../llm.txt) boundary rule;
[orchestrator.md §5](../orchestrator.md#5-boundary-rules);
[skill/10 §7](../skill/10-environment-integration.md#7-example-not-dependency)).
In particular, never copy the generated Claude Code integration
(`minimal-target/CLAUDE.md`) into a target — it is as stale as its
generation date by design; a real installation generates fresh from the
tool's current documentation.

## Simulated-interview disclosure

The install run was performed by a consuming AI agent
(claude-code@claude-fable-5) following the orchestrator faithfully, but the
**human's interview answers were simulated by the agent** for this
demonstration: the Level 1 and Level 2 "confirmed" answers recorded in
`minimal-target/.context/` (project profile, interview record, session
cards) were proposed and accepted inside the same agent run, not by a live
human. Everything else in the instance is real output of the real toolchain:
the session cards describe work that actually happened in the run, the
`raw_sha256` digests match raws that actually existed on the generating
machine, and the media entry describes its payload honestly (a single-pixel
demo PNG). This disclosure satisfies the honesty rule of
[core/philosophy.md §9](../core/philosophy.md#9-honesty-of-the-record) for
the demo as a whole.

## What generated it

- Skill version: pre-v1, commit `f8f3a88` of this repository (the copied
  `scripts/hnk.mjs` was afterwards synchronized with the repository copy,
  which gained a fix to the visuals-verify path matching found by this run)
  (`hnk_version: "0.0.0-unreleased"` in the instance's project profile —
  no release tag existed yet).
- Git-ignored payloads (raw transcripts, one binary) are not part of the
  committable output; they are represented by
  [minimal-target/IGNORED-PAYLOADS.md](minimal-target/IGNORED-PAYLOADS.md)
  per the gitignore contract.
- The instance's own git history (three feature commits plus install/topic
  commits) belonged to the scratch target and is not reproduced here.

## Expected `verify` output inside this copy

On the generating machine the final `node scripts/hnk.mjs verify` was fully
green (0 failures, 0 warnings). Running it **inside this copy** reports two
failures proposing the `raw-lost` transition plus three warnings (a
content-unreachable warning and two benign "ignored directory missing —
created on first use" advisories) — because the git-ignored raws and the
binary payload genuinely do not exist here. That is the machine-local semantics of verification working
as specified ([skill/08 §12](../skill/08-conversation-archive.md#12-verification-hooks),
[skill/09 §7](../skill/09-visual-assets.md#7-verification) check 3), not a
defect in the instance: the cards' `status: local-only` describes the
machine that ran the install, and this listing plus
[minimal-target/IGNORED-PAYLOADS.md](minimal-target/IGNORED-PAYLOADS.md)
keeps the record understandable without the payloads.
