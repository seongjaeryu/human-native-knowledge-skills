<!-- ai-instruction: OPTIONAL FILE — GATE: instantiate into .context/_global/design-system.md
     only when project-profile.md records design_system: true (Level 1 question L1-3:
     UI surface present). SKIP this file entirely otherwise — do not create an empty copy. -->
<!-- ai-instruction: seed the three sections from the project's existing design material
     (token files, component library, style guides) — propose rows, confirm with the human.
     Replace the placeholder rows with real entries or leave a section's table empty when
     the project has nothing to record there yet. Resolve every placeholder and delete
     every ai-instruction comment. -->
---
id: design-system
type: artifact
status: active
version: 1
related: [dictionary-global]
summary: "Design-system rules for the UI surface of {{PROJECT_NAME}}: tokens, components, accessibility baselines."
---

> Type note (audit item D3): this document instantiates `type: artifact` — the nearest frozen type of hnk skill 03 §2.2 — as a support document; the diagram duties owned by `ai-spec.md` do not apply to it.

# Design System

UI rules for {{PROJECT_NAME}}. Canonical component and token names follow Full
Naming: register them — and any alias — in [the global dictionary](dictionary.md)
before use. This is a living document of the global layer; changes go through
propose-then-confirm and are recorded in the deciding session's card.

## Tokens

| Token | Value | Usage rule |
| --- | --- | --- |
| {{TOKEN_NAME}} | {{TOKEN_VALUE}} | {{TOKEN_USAGE_RULE_ONE_LINE}} |

## Components

| Component (canonical full name) | Source of truth | Usage rule |
| --- | --- | --- |
| {{COMPONENT_NAME}} | {{COMPONENT_CODE_PATH_OR_DESIGN_LOCATOR}} | {{COMPONENT_USAGE_RULE_ONE_LINE}} |

## Accessibility

<!-- ai-instruction: record the project's confirmed accessibility baselines as one rule
     per list item — for example minimum contrast ratio, focus visibility, required
     alternative text for images rendered by the UI. -->
- {{ACCESSIBILITY_BASELINE_RULE}}
