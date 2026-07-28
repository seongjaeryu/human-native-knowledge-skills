---
id: project-profile
type: profile
status: active
version: 1
related: []
project_type: {{PROJECT_TYPE}}
environments: [{{ENVIRONMENTS}}]
stack: "{{STACK}}"
git: {{GIT}}
domain_layer: {{DOMAIN_LAYER}}
design_system: {{DESIGN_SYSTEM}}
viewer: {{VIEWER}}
living_layer: {{LIVING_LAYER_PATH}}
storage: {{STORAGE}}
languages: [{{LANGUAGES}}]
audience: "{{AUDIENCE}}"
dictionary_seeded: {{DICTIONARY_SEEDED}}
hnk_version: "{{HNK_VERSION}}"
hnk_commit: {{HNK_COMMIT}}
defaults: {mode: {{DEFAULT_MODE}}, depth: {{DEFAULT_DEPTH}}}
summary: "{{PROFILE_SUMMARY}}"
---

<!-- ai-instruction: REQUIRED template — instantiated at .context/_global/project-profile.md
  by installation step 3, from the confirmed Level 1 interview answers (skill/07 §2-3).
  This file is USER DATA once instantiated: never overwrite an existing profile;
  Level 1 re-runs propose diffs and append or update only confirmed changes.
  Fill every placeholder from the confirmed answers, keeping the quoting exactly as
  shown (the frontmatter must satisfy the machine-readable subset of skill/03 §3):
    {{PROJECT_NAME}}          target project's name (body heading only)
    {{PROJECT_TYPE}}          code | knowledge | mixed                      (L1-1)
    {{ENVIRONMENTS}}          comma-separated environment names, e.g. claude-code, cursor  (L1-2)
    {{STACK}}                 one-line stack summary — keep the double quotes  (L1-3)
    {{GIT}}                   true | false                                  (L1-3 gate)
    {{DOMAIN_LAYER}}          true | false                                  (L1-3 gate)
    {{DESIGN_SYSTEM}}         true | false — UI surface present             (L1-3 gate)
    {{VIEWER}}                viewer name, or none                          (L1-4)
    {{LIVING_LAYER_PATH}}     path relative to the project root, e.g. wiki/ or docs/  (L1-5)
    {{STORAGE}}               none | r2                                     (L1-6)
    {{LANGUAGES}}             comma-separated language tags, e.g. en, ko    (L1-7)
    {{AUDIENCE}}              one-line audience description — keep the double quotes  (L1-7)
    {{DICTIONARY_SEEDED}}     true once L1-8 landed the rows in dictionary.md
    {{HNK_VERSION}}           installed skill release, e.g. 1.0.0 — keep the double quotes
    {{HNK_COMMIT}}            short commit hash of the installed skill repository
    {{DEFAULT_MODE}}          confirm-each-change | confirm-spec-changes-only | autonomous-with-report
    {{DEFAULT_DEPTH}}         full-topic | lightweight
    {{PROFILE_SUMMARY}}       one line stating the confirmed Level 1 outcome
    {{HNK_SPEC_BASE}}         URL base of the installed skill version's files, pinned to
                              {{HNK_COMMIT}} — same value as in orchestrator.md
    {{L1_*_NOTE}}             one-line reason or note per answer row
    {{DEFAULT_MODE_REASON}} / {{DEFAULT_DEPTH_REASON}}  one-line reason per Level 2 default
  Then resolve the conditional instructions in the body and remove every
  ai-instruction comment, including this one. The instantiated file must pass
  `node scripts/hnk.mjs verify`. -->

# Project Profile — {{PROJECT_NAME}}

The durable record of the Level 1 installation interview
([skill/07 §3]({{HNK_SPEC_BASE}}/skill/07-pre-interview.md#3-the-project-profile)).
A living document of the global layer — never frozen; its history is its git
history. The AI reads it at every session start
([orchestrator.md](orchestrator.md) R1) and never re-asks a question it
already answers. Installed skill: `hnk` {{HNK_VERSION}} at commit
`{{HNK_COMMIT}}` — the upgrade baseline.

## Level 1 answers

On any divergence between this table and the frontmatter, the frontmatter is
the machine authority and the divergence is a defect
([skill/07 §3.2]({{HNK_SPEC_BASE}}/skill/07-pre-interview.md#32-frozen-interface--profile-body-sections)).

| # | Question | Confirmed answer | Reason / notes |
| --- | --- | --- | --- |
| L1-1 | Project type | `{{PROJECT_TYPE}}` | {{L1_1_NOTE}} |
| L1-2 | AI environments in use | {{ENVIRONMENTS}} | {{L1_2_NOTE}} |
| L1-3 | Stack and repository shape | {{STACK}} — git: `{{GIT}}`, domain layer: `{{DOMAIN_LAYER}}`, UI surface: `{{DESIGN_SYSTEM}}` | {{L1_3_NOTE}} |
| L1-4 | Viewer | `{{VIEWER}}` | {{L1_4_NOTE}} |
| L1-5 | Living layer location | `{{LIVING_LAYER_PATH}}` | {{L1_5_NOTE}} |
| L1-6 | Storage backend | `{{STORAGE}}` | {{L1_6_NOTE}} |
| L1-7 | Documentation languages and audience | {{LANGUAGES}} — "{{AUDIENCE}}" | {{L1_7_NOTE}} |
| L1-8 | Dictionary seeding | rows confirmed into [dictionary.md](dictionary.md) | {{L1_8_NOTE}} |

<!-- ai-instruction: notes are one line each — record why the answer was chosen
  (detected and bulk-confirmed, or individually decided). Required specifics:
  - L1-5: state whether an existing directory was designated or wiki/ was created.
  - L1-6: when storage is none, this cell MUST record that the human acknowledged
    the frozen disclosure of skill/07 §2.2: "Raw transcripts and binaries will exist
    only on this machine; if it is lost, only the session cards remain."
  - L1-7: when a language other than English is listed, note that the dictionary's
    local-language column is activated. -->

## Level 2 defaults

Read by the AI when composing the one-line Level 2 proposal
([skill/07 §6]({{HNK_SPEC_BASE}}/skill/07-pre-interview.md#6-convergence--the-one-line-proposal));
these values override the system-wide `mode` and `depth` defaults.

| Default | Value | Reason |
| --- | --- | --- |
| mode | `{{DEFAULT_MODE}}` | {{DEFAULT_MODE_REASON}} |
| depth | `{{DEFAULT_DEPTH}}` | {{DEFAULT_DEPTH_REASON}} |

Project-specific deviations from the defaults-by-deliverable table
([skill/07 §4.3]({{HNK_SPEC_BASE}}/skill/07-pre-interview.md#43-frozen-interface--defaults-by-deliverable-type)):
{{DEFAULTS_DEVIATIONS}}

<!-- ai-instruction: set {{DEFAULTS_DEVIATIONS}} to "none" unless the interview
  confirmed per-deliverable deviations; then list each as one line
  (deliverable: field default → confirmed value — reason). -->

## Environment integration

Owned by
[skill/10 §4.3]({{HNK_SPEC_BASE}}/skill/10-environment-integration.md#43-the-integration-record--frozen-interface):
one row per AI environment, written by integration generation (installation
step 6) and updated on every regeneration. `trigger` is one of `generated` |
`unsupported` | `declined`; environments without a working trigger are covered
by the rule-based floor.

| environment | entry file | trigger | artifacts | generated on | documentation consulted |
| --- | --- | --- | --- | --- | --- |
| {{ENVIRONMENT_NAME}} | {{ENTRY_FILE_PATH}} | {{TRIGGER_STATUS}} | {{ARTIFACT_PATHS}} | {{GENERATED_ON}} | {{DOCUMENTATION_CONSULTED}} |

<!-- ai-instruction: duplicate the placeholder row once per environment listed in
  L1-2. environment uses the tool's full name (Full Naming); entry file is the
  path of the context entry file holding the hnk:begin/hnk:end pointer block;
  artifacts lists every generated integration artifact path for that environment;
  generated on is the date of the last generation or regeneration (YYYY-MM-DD);
  documentation consulted identifies the tool documentation version or page the
  generation read. -->
