<!-- ai-instruction: TIMING GATE — instantiate at TOPIC CREATION (after a full-topic
     Level 2 interview concludes), never at installation: no topic exists at install
     time and the placeholders below are unresolvable then. -->
<!-- ai-instruction: OPTIONAL FILE — GATE: create safety-rules.md at the topic root only
     when this topic's work needs temporary rules that must hold while the work is
     underway (migration freezes, compatibility constraints, "do not touch X until Y").
     SKIP this file otherwise — most topics never need it. -->
<!-- ai-instruction: these rules are topic-scoped and TEMPORARY. When the topic's work
     completes, set `status: deprecated` (the rules stop binding sessions); if a rule
     should outlive the topic, propose it as a domain or global invariant instead
     (propose-then-confirm). Replace the placeholder row with real rules; resolve every
     placeholder and delete every ai-instruction comment. -->
<!-- ai-instruction: single-domain mode — delete the `domain:` line. -->
---
id: safety-rules-{{TOPIC_FOLDER_NAME}}
type: artifact
status: active
version: 1
related: [artifact-{{TOPIC_FOLDER_NAME}}]
domain: {{DOMAIN_NAME}}
topic: {{TOPIC_FOLDER_NAME}}
summary: "Temporary rules active only while work on {{TOPIC_FOLDER_NAME}} is underway."
---

> Type note (audit item D3): this document instantiates `type: artifact` — the nearest frozen type of hnk skill 03 §2.2 — as a support document; the diagram duties owned by `ai-spec.md` do not apply to it.

# Safety Rules — {{TOPIC_FOLDER_NAME}}

Rules active **only while this topic's work is underway**, binding every
session on this topic in addition to the global and domain invariants. Each
rule states when it is lifted, so no rule outlives its reason silently.

| Rule | Reason | Lifted when |
| --- | --- | --- |
| {{RULE_ONE_LINE}} | {{REASON_ONE_LINE}} | {{LIFT_CONDITION_ONE_LINE}} |
