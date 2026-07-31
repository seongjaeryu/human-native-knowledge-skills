---
id: guide-coexistence-superpowers
type: skill
status: active
version: 1
related: [core-philosophy, skill-02-context-architecture]
summary: "Coexistence recipe for the superpowers plugin (v5.1.0): a CLAUDE.md override redirecting writing-plans and brainstorming output into the hnk topic structure, the artifact mapping to ai-spec.md/plan.md, orientation per §11.3, and an optional hook-enforced strict mode."
---

# Coexisting with superpowers (plan-writing skills)

This guide is the tool-specific recipe promised by
[`02-context-architecture.md` §11.3](../../skill/02-context-architecture.md#113-orientation):
a coexistence pattern for the superpowers plugin (observed at v5.1.0), whose
plan-writing skills hardcode output paths outside the hnk structure.
`writing-plans` saves to
`docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md` (its `SKILL.md`
line 18; line 19 notes "(User preferences for plan location override
this default)"); `brainstorming` saves design docs to
`docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` (lines 29, 111). Left
alone, these fracture an installed hnk structure into two document trees.
superpowers' own `using-superpowers` skill declares an instruction priority
in which user instructions — CLAUDE.md among them — outrank its skills: the
override below is the mechanism superpowers sanctions, not a fight with it.

## 1. The CLAUDE.md override block

Add to the target project's CLAUDE.md (top level, adjust the topic path per
project):

```markdown
## Document placement (overrides any skill's default)

Design docs and plans from any skill — including superpowers
`writing-plans` and `brainstorming` — MUST be saved into the hnk
structure: design content into the active topic's `ai-spec.md`,
execution plans as the active topic's `plan.md` (skill/02 §4.1) —
EXCEPT artifacts recorded as reversed in the topic's `sources.md`
(skill/02 §11.3): those keep their authoritative file at the tool's
own path, and the topic binds them with a pointer row. Do not
create or write into `docs/superpowers/` otherwise; where a legacy
path exists or an external consumer expects one, stand a
compat-view stub there per skill/02 §11
(template: templates/context/view-stub.md).
```

The block defers to recorded reversals, so reversing an artifact needs no
CLAUDE.md edit — record the `sources.md` row per §3 and the block's
exception covers it.

## 2. Artifact mapping

| superpowers artifact | hnk location | Note |
| --- | --- | --- |
| brainstorming design doc (`specs/…-design.md`) | topic `ai-spec.md` | same role: diagrams-first design record |
| writing-plans plan (`plans/….md`) | topic `plan.md` (optional file, [§4.1](../../skill/02-context-architecture.md#41-file-roles)) | one plan per spec version |
| pre-existing `docs/superpowers/` history | stays put; bind with view stubs or a `sources.md` pointer row | see orientation below |

## 3. Orientation

Default per
[`02-context-architecture.md` §11.3](../../skill/02-context-architecture.md#113-orientation):
the authoritative file lives in the hnk topic folder, and a view stub
stands at `docs/superpowers/…`. Reverse it — superpowers keeps the
physical file, the topic's `sources.md` carries a pointer row — when
superpowers re-reads its own history more often than hnk consumers read
the topic; typical while a long superpowers-driven execution is in
flight. Record the choice, and its reason, as a row in `sources.md`.

## 4. Strict mode (optional consumer profile)

The override block in §1 depends on model compliance with CLAUDE.md, same
as any instruction. Projects wanting a guarantee under the *default*
orientation add a Claude Code `PreToolUse` hook (in `settings.json`) that
denies `Write`/`Edit` on `docs/superpowers/**` with a redirect message
naming the hnk path — instantiate any compat-view stub first, since the
hook would otherwise deny the stub write §1 mandates too. Do not enable
this hook under a reversed orientation: it would block the authoritative
write §3 assigns to superpowers. Enforcement of this kind is a consumer
choice, outside what this protocol requires.
