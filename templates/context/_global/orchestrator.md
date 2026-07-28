---
id: orchestrator
type: invariant
status: active
version: 1
related: [project-profile, invariant-global, dictionary-global]
summary: "Standing rules the AI of {{PROJECT_NAME}} reads at every session start: profile and dictionary loading, interviews, autonomy, archiving, Living-layer sync, on-demand consumption, and audit."
---

<!-- ai-instruction: REQUIRED template — every installation instantiates this file at
  .context/_global/orchestrator.md (installation state machine step 4). To instantiate:
  1. Replace {{PROJECT_NAME}} with the target project's name.
  2. Replace {{LIVING_LAYER_PATH}} with the living_layer path recorded in
     project-profile.md (for example wiki/ or docs/).
  3. Replace {{HNK_SPEC_BASE}} with the URL base serving the installed skill version's
     files, pinned to the hnk_commit recorded in project-profile.md — for example
     https://github.com/seongjaeryu/human-native-knowledge-skills/blob/a1b2c3d —
     so every owning-spec link below resolves to the exact installed version.
  4. Resolve every conditional ai-instruction comment below using the
     project-profile.md answers (domain_layer, design_system, git).
  5. Keep the frontmatter related list in sync with the ids of the other
     instantiated global-layer documents; when design_system is true, add
     design-system to the list.
  6. Remove every ai-instruction comment, including this one. The instantiated file
     must pass `node scripts/hnk.mjs verify`. -->

# {{PROJECT_NAME}} — Orchestrator standing rules

This project is operated by
[human-native-knowledge-skills (`hnk`)]({{HNK_SPEC_BASE}}/README.md).
This file is the first thing the AI reads in every session, before any work —
every environment's context entry file points here
([skill/10 §3]({{HNK_SPEC_BASE}}/skill/10-environment-integration.md#3-the-contract)).
The rules below are the zero-dependency floor: they bind the AI itself, not any
tool harness, so they operate even when every automation trigger is absent or
broken. All commands run from the project root.

Frontmatter note, recorded per audit item
[D3]({{HNK_SPEC_BASE}}/core/audit.md#d--derivation-every-rule-earns-its-existence):
the frozen type enum of
[skill/03 §2.2]({{HNK_SPEC_BASE}}/skill/03-okf.md#22-the-type-enum) defines no
orchestrator type, and frozen interfaces are never extended at instantiation.
This document is typed `invariant` because its standing rules are the
project-wide inviolable operating rules.

## The session loop

```mermaid
flowchart TD
    START["session start"] --> LOAD["R1-R2 load profile, invariants, dictionaries"]
    LOAD --> SWEEP["R3 recovery sweep: draft cards, orphan raws"]
    SWEEP --> RESTORE["R4 topic-keyed minimal restore"]
    RESTORE --> MODE["R5-R7 record the mode, create the draft card"]
    MODE --> WORK["R8-R12 work under the recorded autonomy level"]
    WORK -->|milestone| SNAP["R13 snapshot + archive index + llm build"]
    SNAP --> WORK
    WORK -->|pivot| FREEZE["R9 diagram first + R17 version freeze"]
    FREEZE --> WORK
    WORK -->|session end| DONE["R14-R16 complete the card,<br/>sync the Living layer, verify"]
```

## Session start

- **R1 — Load the operating context.** Read
  [project-profile.md](project-profile.md), [invariants.md](invariants.md),
  and the global [dictionary.md](dictionary.md).
  <!-- ai-instruction: keep the next sentence only when domain_layer is true; delete it in single-domain mode. -->
  When working inside a domain, also load that domain's
  `../<domain>/_shared_ai/dictionary.md` and
  `../<domain>/_shared_ai/invariants.md`.
  <!-- ai-instruction: keep the next sentence only when design_system is true; delete it otherwise. -->
  Before any UI work, also load [design-system.md](design-system.md).
  (Owning specs:
  [skill/07 §8]({{HNK_SPEC_BASE}}/skill/07-pre-interview.md#8-standing-orchestrator-rules) R1;
  [skill/05 §4]({{HNK_SPEC_BASE}}/skill/05-dictionary-and-naming.md#4-ai-behavior) rule 1.)
- **R2 — Never re-ask what the profile answers.** If a needed Level 1 answer
  is missing, ask once and append it to the profile. The Level 1 interview
  may be re-run whenever the situation changes; re-runs propose diffs against
  [project-profile.md](project-profile.md) and never overwrite user data.
  ([skill/07 §8]({{HNK_SPEC_BASE}}/skill/07-pre-interview.md#8-standing-orchestrator-rules) R2–R3, R7;
  [skill/02 §10]({{HNK_SPEC_BASE}}/skill/02-context-architecture.md#10-installation-and-existing-assets).)
- **R3 — Recovery sweep.** Check [../_archive/](../_archive/index.md) for
  draft cards (`ended: null`) from past sessions and `../_archive/sessions/`
  for orphan raws with no matching card; propose completing the abandoned
  card or generating one from the orphan raw before new work begins.
  ([skill/08 §5]({{HNK_SPEC_BASE}}/skill/08-conversation-archive.md#5-the-session-lifecycle-two-stage-writing-snapshots-recovery).)
- **R4 — Minimal automatic restore, topic-keyed only.** When the session
  continues an existing topic, read that topic's newest completed card and
  restore only the `mode` and the latest Key decisions — nothing else is
  restored automatically. A lightweight goal without a topic has no
  machine-matchable identity: re-establish its mode through R5.
  ([skill/08 §10]({{HNK_SPEC_BASE}}/skill/08-conversation-archive.md#10-the-consumption-model);
  [skill/07 §7.3]({{HNK_SPEC_BASE}}/skill/07-pre-interview.md#73-multi-session-goals).)

## Before every work goal

- **R5 — Record the mode explicitly; never begin under an implicit mode.**
  Apply the boundary decision tree: work that touches a single file or
  document, with an obvious outcome, no pivot, and no new topic (all four)
  takes the **declaration form** — one line naming the form, the mode, and
  the boundary claim, then proceed. Everything else takes the **confirmation
  form** — a one-line proposal naming all five Level 2 answers (goal and
  deliverable, mode, depth, visuals, archive) and the source of each; expand
  individual questions only on deviation; "use defaults" accepts the whole
  proposal. Doubt resolves to the confirmation form, and a human objection
  converts a declaration to the confirmation form immediately.
  ([skill/07 §5]({{HNK_SPEC_BASE}}/skill/07-pre-interview.md#5-the-two-fulfillment-forms),
  [§6]({{HNK_SPEC_BASE}}/skill/07-pre-interview.md#6-convergence--the-one-line-proposal),
  [§8]({{HNK_SPEC_BASE}}/skill/07-pre-interview.md#8-standing-orchestrator-rules) R4.)
- **R6 — Create the draft session card at session start.** Run
  `node scripts/hnk.mjs archive new --title <title> [--domain <d>] [--topic <t>] --mode <mode>`
  (or write the card directly under this floor): frontmatter complete,
  `mode` prerecorded, `ended: null`. The agreed autonomy level must exist on
  disk while work is underway.
  ([skill/08 §5]({{HNK_SPEC_BASE}}/skill/08-conversation-archive.md#5-the-session-lifecycle-two-stage-writing-snapshots-recovery).)
- **R7 — Obey the recorded autonomy level.** Before working on a topic, read
  its `interview.md` (or restore per R4). When the goal shifts, propose an
  interview update (version increment plus Update History entry) — never
  silently change the mode or the goal.
  ([skill/07 §8]({{HNK_SPEC_BASE}}/skill/07-pre-interview.md#8-standing-orchestrator-rules) R5–R6.)

## During work

- **R8 — Enforce the dictionary.** Silently normalize banned forms to their
  canonical terms in all output and written artifacts; never reject or
  lecture human input. When an unregistered term keeps appearing (guideline:
  three times in a session, or across two sessions on one topic), propose a
  complete dictionary row and wait for confirmation. If the human keeps
  choosing an abbreviation after correction, propose registering it as an
  official alias instead of correcting again.
  ([skill/05 §4]({{HNK_SPEC_BASE}}/skill/05-dictionary-and-naming.md#4-ai-behavior).)
- **R9 — Diagram first, diagram before code.** Specifications lead with
  their diagrams. On any pivot, update the diagrams and NODE-IDs in
  `ai-spec.md` *before* changing any code or document, in every autonomy
  mode; whether the update needs prior confirmation is decided by the
  recorded mode. Record the delta (reason, affected NODE-IDs, before/after
  in Mermaid edge syntax) in the session card's Deltas section.
  ([skill/04 §7]({{HNK_SPEC_BASE}}/skill/04-diagram-first.md#7-diagram-change-control).)
- **R10 — Propose-then-confirm at the recorded level.** Under
  `confirm-each-change`, propose every change. Under
  `confirm-spec-changes-only`, implement freely within the agreed
  specification and propose any pivot or anything that invalidates a
  recorded decision. Under `autonomous-with-report`, act document-first and
  report at milestones; confirm only goal changes and interview updates.
  ([skill/07 §4.2]({{HNK_SPEC_BASE}}/skill/07-pre-interview.md#42-the-autonomy-scale).)
- **R11 — Register binaries before referencing them.** Any visual that is
  not inline Mermaid or a standalone `.svg`/`.mmd` goes through
  `node scripts/hnk.mjs visuals add <file> [--domain <d>] [--topic <t>] --alt <text>`
  — `alt` is required and never empty — before it is referenced anywhere.
  Reference binaries only by their media id anchor into
  [../_media/index.md](../_media/index.md), never by raw path.
  ([skill/09 §2]({{HNK_SPEC_BASE}}/skill/09-visual-assets.md#2-the-format-based-rule),
  [§4.2]({{HNK_SPEC_BASE}}/skill/09-visual-assets.md#42-the-alt-field),
  [§5]({{HNK_SPEC_BASE}}/skill/09-visual-assets.md#5-the-reference-rule).)
- **R12 — Mandatory redaction.** Never transcribe secret values — API keys,
  tokens, passwords, `.env` values, private key blocks — into cards, raws,
  or any artifact: mask them as `[REDACTED:<kind>]` at write time. A
  tool-call summary names the file or variable, never its secret value.
  ([skill/08 §7]({{HNK_SPEC_BASE}}/skill/08-conversation-archive.md#7-mandatory-redaction).)

## Milestones, pivots, and session end

- **R13 — At every milestone:** append the incremental raw snapshot under
  `../_archive/sessions/`, update the card's `raw_sha256`, then run
  `node scripts/hnk.mjs archive index` and `node scripts/hnk.mjs llm build`.
  ([skill/08 §5]({{HNK_SPEC_BASE}}/skill/08-conversation-archive.md#5-the-session-lifecycle-two-stage-writing-snapshots-recovery).)
- **R14 — At session end:** complete the card body — Goal, Key decisions,
  Deltas, Affected files, Follow-ups — and check self-sufficiency before
  filling `ended`: the decisions, their reasons, and their effects must be
  understandable from the card alone, without raw access. Then write the
  final snapshot and run `archive index` and `llm build` again.
  ([skill/08 §4.5–4.6]({{HNK_SPEC_BASE}}/skill/08-conversation-archive.md#45-card-body--frozen-interface),
  [§5]({{HNK_SPEC_BASE}}/skill/08-conversation-archive.md#5-the-session-lifecycle-two-stage-writing-snapshots-recovery).)
- **R15 — Honest fidelity.** Raws you write yourself under this floor are
  `raw_fidelity: reconstructed` — never labeled or described as `captured`,
  in the field, in prose, or in reports. Only `archive capture` output is
  `captured`.
  ([skill/08 §4.2]({{HNK_SPEC_BASE}}/skill/08-conversation-archive.md#42-raw-fidelity-semantics--frozen-interface);
  [skill/10 §3]({{HNK_SPEC_BASE}}/skill/10-environment-integration.md#3-the-contract) clause ③.)
- **R16 — Living-layer sync with History Annotation.** At every milestone or
  session end, update each affected document under
  [{{LIVING_LAYER_PATH}}](../../{{LIVING_LAYER_PATH}}) to describe the
  current architecture only (superseded content is removed, not struck
  through), append one History Annotation entry back-referencing the topic,
  specification version, and deciding session card, then run
  `node scripts/hnk.mjs verify`.
  ([skill/06 §5]({{HNK_SPEC_BASE}}/skill/06-lifecycle-and-versioning.md#5-living-layer-sync-with-history-annotation).)
- **R17 — Version freeze on pivots.** When a pivot is approved at the
  recorded autonomy level: commit the outgoing state, record its short hash
  in `frozen_commits`, bump the specification's `version`, append a Version
  History entry (date, reason, deciding session card link, before/after
  nodes, frozen commit), then rewrite the specification diagrams-first.
  ([skill/06 §2]({{HNK_SPEC_BASE}}/skill/06-lifecycle-and-versioning.md#2-git-native-freeze).)
  <!-- ai-instruction: when project-profile.md records git: false, replace the body of
    R17 with the no-git fallback: on pivot, hard-copy the live ai-spec.md into
    versions/vN/ inside the topic, record it in frozen_copies instead of
    frozen_commits, append the same Version History entry citing the copy path, and
    append the delta to the topic's change-ledger.json — per skill/06 Appendix A
    ({{HNK_SPEC_BASE}}/skill/06-lifecycle-and-versioning.md#appendix-a--no-git-fallback-fallback-only).
    When git is true, delete this comment and keep R17 as written. -->

## On-demand consumption

- **R18 — Query procedure.** When the human asks about past work ("what
  happened with X?", "summarize last week"), search
  [../_archive/index.md](../_archive/index.md), open the matching cards, and
  descend to a raw **only if** the cards cannot answer.
  ([skill/08 §10]({{HNK_SPEC_BASE}}/skill/08-conversation-archive.md#10-the-consumption-model).)
- **R19 — Report.** When the human wants a digest by period, topic, or
  domain, run
  `node scripts/hnk.mjs report [--from <date>] [--to <date>] [--topic <t>] [--domain <d>]`
  and deliver its card digest — the human-friendly extraction is delivered
  on demand, through the rules.
  ([skill/08 §10]({{HNK_SPEC_BASE}}/skill/08-conversation-archive.md#10-the-consumption-model).)

## Audit

- **R20 — Target audit on request.** When the human asks for an audit,
  apply the core checklist at
  [core/audit.md]({{HNK_SPEC_BASE}}/core/audit.md) to this project:
  enumerate the cards, indexes, specifications, and dictionaries in scope;
  apply every applicable item; record each failure as artifact, item id,
  what failed, and proposed fix. The verdict is pass only with zero
  failures on D-items and H-items; N/F-items may carry warnings with
  follow-ups.
