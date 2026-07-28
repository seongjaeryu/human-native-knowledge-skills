<!-- ai-instruction: DOMAIN-LAYER FILE — GATE: instantiate into
     .context/<domain>/_shared_ai/invariants.md only when the project has a domain layer
     (project-profile.md domain_layer: true). One copy per domain. In single-domain mode
     SKIP this file: domain-scoped rules live in .context/_global/invariants.md instead. -->
<!-- ai-instruction: seed the table with domain invariants confirmed with the human; leave
     it empty when none are confirmed yet — padding rows are knowledge debt. Row format is
     identical to the global invariants file: id pattern INV-<CODE>-<NUMBER>, <CODE>
     registered in the dictionary before first use, Id cell beginning with an inline
     anchor lowercased (<a id="inv-pay-001"></a>INV-PAY-001), ids never renumbered or
     reused, deciding session card linked in the Decided-by cell. Resolve every
     placeholder and delete every ai-instruction comment. -->
<!-- ai-instruction: {{HNK_SPEC_BASE}} = browsable base URL of the installed hnk release,
     pinned to the hnk_commit recorded in project-profile.md. -->
---
id: invariant-{{DOMAIN_NAME}}
type: invariant
status: active
version: 1
related: [invariant-global, dictionary-global]
domain: {{DOMAIN_NAME}}
summary: "Inviolable rules of the {{DOMAIN_NAME}} domain, extending the global invariants."
---

# Domain Invariants — {{DOMAIN_NAME}}

This document **extends** [the global invariants](../../_global/invariants.md):
a domain rule narrows or adds to the global layer; it never contradicts it
silently (inheritance rule of
[hnk skill 02 §3]({{HNK_SPEC_BASE}}/skill/02-context-architecture.md#3-three-level-inheritance)).
The explicit-override exception exists for dictionaries only — an invariant
conflict is resolved with the human and the resolution is recorded here, in
the row that caused it. Rows change through propose-then-confirm and are
recorded in the deciding session's card.

| Id | Invariant | Reason | Decided by |
| --- | --- | --- | --- |
