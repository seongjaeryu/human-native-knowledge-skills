# examples/ — instance demo, not spec

`examples/minimal-target/` is the committable output of a **real install
run** of this skill, executed end-to-end on 2026-08-15 (UTC) against a tiny
fresh Node.js CLI project ("coffee-tracker"): orchestrator steps 1–8, then
one full-topic Level 2 work session (topic `0001-brew-log-format`), then one
coexistence session binding an external plan-writing tool's artifact as a
compat view, ending with `node scripts/hnk.mjs verify` fully green
(0 failures, 0 warnings).

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
human. The same disclosure covers the coexistence demonstration: the plan
document at the superpowers `writing-plans` path was created as a
**simulated external-tool artifact** inside the same run — no superpowers
plugin executed — as the binding session's card itself records. Everything
else in the instance is real output of the real toolchain: the session cards
describe work that actually happened in the run, the `raw_sha256` digests
match raws that actually existed on the generating machine, and the media
entry describes its payload honestly (a single-pixel demo PNG). This
disclosure satisfies the honesty rule of
[core/philosophy.md §9](../core/philosophy.md#9-honesty-of-the-record) for
the demo as a whole.

## What generated it

- Skill version: commit `4ea727a` of this repository — the post-v1.1.0
  working tree regenerated for the v1.2.0 release, recorded honestly in the
  instance's project profile as `hnk_version: "1.2.0-unreleased"` (the
  v1.2.0 tag did not exist at generation time). This regeneration reflects
  the v1.2.0 compat-views feature (skill/02 v3, skill/03 v2): the
  coexistence override block in `minimal-target/CLAUDE.md`, the topic's
  optional `plan.md` as the authoritative plan document, a view stub
  instantiated from `templates/context/view-stub.md` standing at the legacy
  superpowers path (`minimal-target/docs/superpowers/plans/`,
  `type: view`, id-only `resolves_to`), the orientation decision recorded
  in the topic's `sources.md`, and `verify`'s view scan passing over the
  stub.
- Git-ignored payloads (three raw transcripts, one binary) are not part of
  the committable output; they are represented by
  [minimal-target/IGNORED-PAYLOADS.md](minimal-target/IGNORED-PAYLOADS.md)
  per the gitignore contract.
- The instance's own git history (an initial baseline commit, the
  install/topic/compat session commits, and the simulated external-tool
  commit) belonged to the scratch target and is not reproduced here.

## Expected `verify` output inside this copy

On the generating machine the final `node scripts/hnk.mjs verify` was fully
green (0 failures, 0 warnings). Running it **inside this copy** reports
three failures proposing the `raw-lost` transition plus three warnings (a
content-unreachable warning and two benign "ignored directory missing —
created on first use" advisories) — because the git-ignored raws and the
binary payload genuinely do not exist here. That is the machine-local semantics of verification working
as specified ([skill/08 §12](../skill/08-conversation-archive.md#12-verification-hooks),
[skill/09 §7](../skill/09-visual-assets.md#7-verification) check 3), not a
defect in the instance: the cards' `status: local-only` describes the
machine that ran the install, and this listing plus
[minimal-target/IGNORED-PAYLOADS.md](minimal-target/IGNORED-PAYLOADS.md)
keeps the record understandable without the payloads. The compat-view scan
itself passes inside the copy: the stub resolves by id to the committed
`plan.md`, contributing no failure or warning.
