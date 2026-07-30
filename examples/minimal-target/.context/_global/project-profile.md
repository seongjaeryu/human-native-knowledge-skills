---
id: project-profile
type: profile
status: active
version: 1
related: []
project_type: code
environments: [claude-code]
stack: "Node.js CLI, ESM, zero dependencies"
git: true
domain_layer: false
design_system: false
viewer: none
living_layer: wiki/
storage: none
languages: [en]
audience: "future maintainers"
dictionary_seeded: true
hnk_version: "1.1.0-unreleased"
hnk_commit: 03ccacf
defaults: {mode: confirm-spec-changes-only, depth: full-topic}
summary: "Level 1 record: code project, wiki/ created as Living layer, no storage backend, English-only documentation."
---

# Project Profile — coffee-tracker

The durable record of the Level 1 installation interview
([skill/07 §3](https://github.com/seongjaeryu/human-native-knowledge-skills/blob/03ccacf/skill/07-pre-interview.md#3-the-project-profile)).
A living document of the global layer — never frozen; its history is its git
history. The AI reads it at every session start
([orchestrator.md](orchestrator.md) R1) and never re-asks a question it
already answers. Installed skill: `hnk` 1.1.0-unreleased at commit
`03ccacf` — the upgrade baseline.

## Level 1 answers

On any divergence between this table and the frontmatter, the frontmatter is
the machine authority and the divergence is a defect
([skill/07 §3.2](https://github.com/seongjaeryu/human-native-knowledge-skills/blob/03ccacf/skill/07-pre-interview.md#32-frozen-interface--profile-body-sections)).

| # | Question | Confirmed answer | Reason / notes |
| --- | --- | --- | --- |
| L1-1 | Project type | `code` | Detected from the target (Node.js source, package.json, no prose corpus); bulk-confirmed. |
| L1-2 | AI environments in use | claude-code | Named by the human; no environment entry files were detected in the target. |
| L1-3 | Stack and repository shape | Node.js CLI, ESM, zero dependencies — git: `true`, domain layer: `false`, UI surface: `false` | Detected and bulk-confirmed; single small CLI, so single-domain mode; no UI surface. |
| L1-4 | Viewer | `none` | No viewer in use; the Living layer is read directly. |
| L1-5 | Living layer location | `wiki/` | No existing docs/ or equivalent was found, so wiki/ was created from templates/living/. |
| L1-6 | Storage backend | `none` | Human acknowledged the frozen disclosure of skill/07 §2.2: "Raw transcripts and binaries will exist only on this machine; if it is lost, only the session cards remain." |
| L1-7 | Documentation languages and audience | en — "future maintainers" | English only, so the dictionary's local-language column stays inactive. |
| L1-8 | Dictionary seeding | rows confirmed into [dictionary.md](dictionary.md) | Default seed rows bulk-confirmed unchanged; one project term added: brew-log (with `BREW` registered as its NODE-ID domain code). |

## Level 2 defaults

Read by the AI when composing the one-line Level 2 proposal
([skill/07 §6](https://github.com/seongjaeryu/human-native-knowledge-skills/blob/03ccacf/skill/07-pre-interview.md#6-convergence--the-one-line-proposal));
these values override the system-wide `mode` and `depth` defaults.

| Default | Value | Reason |
| --- | --- | --- |
| mode | `confirm-spec-changes-only` | Small solo project; implementation detail churn should not need per-change confirmation. |
| depth | `full-topic` | The point of the install is an accumulating record; full Open Knowledge Format topics by default. |

Project-specific deviations from the defaults-by-deliverable table
([skill/07 §4.3](https://github.com/seongjaeryu/human-native-knowledge-skills/blob/03ccacf/skill/07-pre-interview.md#43-frozen-interface--defaults-by-deliverable-type)):
none

## Environment integration

Owned by
[skill/10 §4.3](https://github.com/seongjaeryu/human-native-knowledge-skills/blob/03ccacf/skill/10-environment-integration.md#43-the-integration-record--frozen-interface):
one row per AI environment, written by integration generation (installation
step 6) and updated on every regeneration. `trigger` is one of `generated` |
`unsupported` | `declined`; environments without a working trigger are covered
by the rule-based floor.

| environment | entry file | trigger | artifacts | generated on | documentation consulted |
| --- | --- | --- | --- | --- | --- |
| Claude Code | CLAUDE.md | declined | CLAUDE.md (pointer block between `hnk:begin`/`hnk:end` markers) | 2026-07-30 | https://code.claude.com/docs/en/memory (consulted at generation time; confirms ./CLAUDE.md is loaded every session; hook automation exists but the human declined wiring it for this target — the rule-based floor covers capture, raws are `reconstructed`) |
