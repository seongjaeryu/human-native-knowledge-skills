# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Build milestones

This repository was built in stages M0–M6 (bootstrap, core + curriculum
01–06, improvement specifications 07–10 with interface freeze, orchestrator +
templates, scripts, guides, examples + end-to-end verification). Skill
documents reference these stage names when they mark an interface as frozen.

## Release rule

Before every release tag:

1. Run the core-audit (`core/audit.md`) against every rule, spec, and script in this repository — record the result here.
2. Re-run the installation end-to-end and regenerate `examples/` so the demo never drifts from the spec.
3. Record spec changes as `minor`/`major` per SemVer; installed projects track the skill version they were installed from in their `project-profile.md`.
4. Write release notes as a record, not a list: for each substantive change, state the observed problem, the structural fix, the quantified evidence (test/audit/verification output), and any mistakes reversed — failures included. A release note that claims more than was measured fails the honesty items of the audit.

## [Unreleased]

### Added — toward v1.1.0

**Rule-collision handling, from the project's first community feedback.**
The observed problem: two same-tier content rules (performance versus
simplicity, say) had no explicit tiebreaker, and in `autonomous-with-report`
mode the agent carried that collision with no human in the loop — a real gap,
correctly diagnosed by an external proposal for `weight` (numeric 0.0–1.0)
and `constraint_level` metadata. The structural fix adopts the proposal in
reshaped form and records why each part was taken or declined
(`skill/02` version 1 → 2, Version History):

- `Level` column on invariant rows — the categorical survivor of
  `constraint_level`, two values only (`strict-negative` | `hard`);
  preferences stay out of invariants by membership rule.
- Explicit four-step resolution order (`skill/02` §3.2): document kind →
  layer → the core §10 criterion → surface a surviving tie to the human and
  record it where it arose.
- Rejection-harvesting standing rule (`skill/02` §3.3, target orchestrator
  R21–R22): an explicit human rejection during work becomes a *proposed*
  invariant or safety-rule row — propose-then-confirm, recorded in the
  session card.
- Declined, with reasons recorded: numeric weights (a score decides a
  collision without explaining it — arithmetic is not understanding, and an
  unmeasured decimal claims precision that does not exist), automatic
  feedback-driven weight drift (the silent rule change audit item F2
  forbids), and threshold-based prompt pruning (a rule recorded as in force
  must actually be loaded).

**Uncarded-work detection, from the same feedback thread's follow-up
(automated extraction architecture).** The observed problem: work committed
outside any carded session escaped the archive with no signal anywhere — a
blind spot in the system's own core promise. The structural fix adopts the
proposal's one mechanical insight (commits as an archive-independent signal)
and declines its engine (`skill/08` version 1 → 2, Version History): `verify`
now warns when commits newer than the newest session card touch no archive
file, and the session-start sweep (orchestrator R3) proposes a retro-card,
honestly labeled `reconstructed`. Declined with reasons recorded: an
unattended sub-agent generating rule files (an unverified second producer —
the exact debt generator this system exists to prevent; silent rule changes
forbidden by audit F2), a Python sample script (Node-builtins-only rule), and
auto-populated weights (declined above). Evidence: self-test 30/30 including
a new git-fixture test for the check.

**Handover strengthening, from the feedback thread's analysis-request round
(four proposals reviewed against the core).** Accepted, reshaped
(`skill/08` version 2 → 3): rejected alternatives became a normative content
rule of Key decisions — "why NOT" stops a later reader from re-proposing a
declined approach — as a rule inside the existing section, not a sixth
mandatory section (empty ceremony sections are padding, and padding is debt);
and a `status` command was added — the ten-second human handover view
(newest card's decisions and open ends plus drafts awaiting recovery),
read-only over existing artifacts (a `LATEST.md` derivative was declined: it
would duplicate the newest card and split the single source of truth).
Declined with reasons: a shipped one-line harness-anchor template
(`skill/10` already freezes the pointer block's four required *elements*
while deliberately not freezing wording — a fixed shipped template is
precisely the rot-prone artifact decision 15 removes, and EC-1 already
verifies the anchor); and a model-change self-check questionnaire (a
self-graded comprehension quiz is rationalization-prone ceremony — the
standing rules are re-read every session by R1 regardless of model, and
misunderstanding surfaces at the first propose-then-confirm gate; the card's
`meta.agent` field already records model changes). Evidence: self-test
31/31 including a new `status` test.

`examples/` regeneration for the template change follows at the v1.1.0
release per the release rule.

## [1.0.0] — 2026-07-30

First release: the complete skill — constitution, curriculum, installation
state machine, templates, the zero-dependency toolchain, guides, and a
real-install demo.

### Release verification

- CI matrix green on Node 18 / 20 / 22 (GitHub Actions run 30472920855).
- **Real-URL install verified** (release gate 3-1): a fresh consuming session
  given only the GitHub URL fetched 24 files (343,410 bytes, zero refetches),
  confirmed `scripts/hnk.mjs`, the gitignore block, and `llm.txt` byte-identical
  over the URL path (sha256), and completed install steps 2–8 on a scratch
  project with final `verify` at 0 failures / 0 warnings; installed structure
  matches `examples/minimal-target` modulo the expected work-session artifacts.
- Three friction items found by that run were fixed before tagging: the
  archive-index template now matches the script's canonical empty render,
  `--help` prints usage, and orchestrator step 8 clarifies the
  `started`-timestamp rule for late-created cards.

### Added

- M0 bootstrap: LICENSE (MIT), bilingual README, changelog, `llm.txt` skeleton, `.gitignore`.
- M1: `core/philosophy.md` + `core/audit.md` (the constitution and its checklist) and curriculum documents `skill/01`–`06`.
- M2: improvement specifications `skill/07`–`10` with the frozen interfaces (session card, identifier schemes, command shapes, machine-subset grammar, environment integration contract). Checkpoint decision: depth token renamed `full-topic`.
- M3: root `orchestrator.md` (8-step installation state machine), the complete `templates/` layer, finalized `llm.txt`.
- M4: `scripts/hnk.mjs` (single-entry, zero-dependency), `scripts/self-test.mjs` (29 tests), Node 18/20/22 CI matrix.
- M5: `guides/` — viewers (Obsidian, Quartz), enforcement (ESLint, generic grep), storage (Cloudflare R2).
- M6: `examples/minimal-target` generated by a real install run; three end-to-end installs verified (fresh code project, brownfield audit-existing, knowledge project); defects found by the runs fixed.

### Self-audit — pre-v1.0.0 (2026-07-29)

Core-audit (`core/audit.md`) run against every rule, specification, template, script, and guide: verdict **pass** — zero D (derivation) and zero H (honesty) failures. 538 semantic pointers mechanically checked (531 live links including 272 anchors): all resolve. `scripts/self-test.mjs` 29/29 green; all repository frontmatter parses under the shipped subset parser; `examples/` confirmed as a disclosed instance demo of a real install run (P2). Follow-ups carried: NODE-ID collision, spec-node mapping, and freeze-hash checks are audit-level (not in `hnk.mjs verify` v1 — now stated in `skill/03/04/06`); pointer verification resolves file targets, anchors are audit-level.
