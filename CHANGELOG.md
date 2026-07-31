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

### Added

**Compat views, binding external tool structures (`skill/02` version 2 → 3,
`skill/03` version 1 → 2).** The observed problem: agent tooling other than
`hnk` (plan-writing skills, scaffold generators) hardcodes its own output
paths; an installed hnk structure either fractures into two document trees
or, if the tool is resisted, the tool breaks. The mapping principle of
`skill/02` §10 ("audit-existing maps, never moves") answered this only for
documents that exist before installation — nothing covered documents an
external tool keeps creating afterward. The structural fix (`skill/02` §11,
new; `skill/03` §2.2 gains the `view` type, ownership of `resolves_to`
staying with `skill/02` per the existing per-type-field-ownership rule):

- A **compat view** is a committed stub, never a symlink, standing at the
  external tool's expected path: `type: view` frontmatter with an id-only
  `resolves_to` pointer to the authoritative document, which lives in the
  hnk structure by default (reversible per topic, recorded in the topic's
  `sources.md`, per the read-frequency criterion of §11.3). Symlinks were
  measured (2026-07-31, macOS/APFS) and declined: `rg` matches nothing
  behind one without `--follow`, `find` does not descend into a directory
  symlink, and `core.symlinks=false` — the documented Git for Windows
  default — checks a committed symlink out as a plain text file.
- `verify` (`scripts/hnk.mjs`) gains the view-resolution check: a
  region-scoped frontmatter pre-filter (a `type: view` mention inside a code
  fence does not trigger the scan), Living-layer document ids folded into
  the same id-resolution namespace as `.context/` (view stubs excluded from
  that fold so the scan's own id push does not double-register them), a
  two-phase scan so a stub resolving to another view is rejected
  deterministically regardless of file-walk order, and a shared
  `verifyDeadPointers` helper so the compat-view scan and the `.context/`
  document loop enforce the same dead-link rule (`03-okf.md` §4). View ids
  join the existing duplicate-id check.
- New `templates/context/view-stub.md` (instantiation template: guidance
  lives in ai-instruction comments since comments are forbidden inside the
  machine-readable subset; `{{UPPER_SNAKE_CASE}}` placeholder tokens) and
  new `guides/coexistence/superpowers.md` (the tool-specific recipe promised
  by §11.3: superpowers v5.1.0's hardcoded plan/design-doc paths cited by
  file and line, a CLAUDE.md override block, the artifact mapping to
  `ai-spec.md`/`plan.md`, and an optional per-artifact hook-enforced strict
  mode).

Evidence: `scripts/self-test.mjs` gained the
`'verify: compat views resolve by id (02 §11.4)'` test, 12 new subtests
pinning the full contract (valid resolution, unknown id, dead link, missing
summary, code-fence non-trigger, Living-layer target, quoted `type` value,
CRLF stub, view-to-view rejection, duplicate-id interaction, and the stub
living inside the Living layer itself, both directions) — suite 31 → 44,
all green.

Core-audit run over this branch's diff (Task 8, `main...HEAD`): D1–D3 and N2
pass (every added rule states its serving degree; core cited by anchor,
never restated; no rule contradicts another; pointers and the anchors cited
in §11 and the coexistence guide all resolve); H-items pass (§11.1's
symlink claims are dated and measured, the guide's superpowers claims cite
version and line numbers). P-items (`examples/` regeneration, SemVer bump)
are release-cut concerns per the Release rule above, deferred to the next
tag.

## [1.1.0] — 2026-07-30

The community-feedback release: three rounds of external feedback from the
project's first user, each evaluated against the core and adopted in reshaped
form or declined with recorded reasons — the system's own
propose-then-confirm loop, applied to itself.

### Added

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

### Release verification

- **`examples/minimal-target` regenerated by a real install run** at commit
  `03ccacf` with the v1.1.0 templates: invariants carry the `Level` column
  (INV-BREW-001 demonstrates `strict-negative`), the instantiated
  orchestrator carries R21–R22 and the extended R3 sweep, session cards
  exercise the rejected-alternatives rule, and the `status` command was run
  against the instance. Scratch-target final `verify`: 0 failures /
  0 warnings; `verify` inside the committed copy reproduces the disclosed
  2 failures / 3 warnings exactly.
- The media-index template was aligned byte-for-byte with the script's
  canonical empty render (the same fix the archive-index template received
  at v1.0.0 — found by the regeneration run).

### Self-audit — pre-v1.1.0 (2026-07-30)

Core-audit run over the v1.1.0 candidate (emphasis on `v1.0.0..HEAD`:
skill/02 v2, skill/08 v3, templates, `hnk.mjs`, regenerated examples):
verdict **pass** — zero D and zero H failures. 333 semantic pointers
mechanically checked (172 anchors, GitHub anchor algorithm): 3 dead, fixed
before tagging — both READMEs' example-card link (card id changed by the
regeneration) and the example card's media-id link anchored into the archive
index instead of `_media/` (present since v1.0.0, caught by this audit's
anchor pass). `self-test.mjs` 31/31; all 47 repository frontmatter documents
parse under the shipped subset parser. Freshness follow-ups fixed at cut:
`llm.txt` STATUS line, README test count (29 → 31) and audit-number
pinning made release-agnostic, session-card template Key-decisions guidance
updated for the v3 rejected-alternatives rule.

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
