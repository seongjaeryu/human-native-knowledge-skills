<!-- ai-instruction: DOMAIN-LAYER FILE — GATE: instantiate into
     .context/<domain>/_shared_ai/dictionary.md only when the project has a domain layer
     (project-profile.md domain_layer: true). One copy per domain. In single-domain mode
     SKIP this file: domain terms live in .context/_global/dictionary.md instead. -->
<!-- ai-instruction: seed the table with domain-specific business terms confirmed with the
     human; leave it empty when none are confirmed yet. Row format is identical to the
     global dictionary, including the term-cell inline anchor whose id is the canonical
     term verbatim. A row that redefines, re-aliases, or un-bans a global term is a
     conflict: it resolves toward global UNLESS the row explicitly overrides, with the
     override written into its definition-and-rules cell — for example:
     | <a id="ticket"></a>ticket | — | — | Overrides global: in this domain, `ticket` means a support case, not an event admission. |
     A silent contradiction between scopes is an audit failure. If the local-language
     column was activated in the global dictionary (L1-7), prepend the same column here.
     Resolve every placeholder and delete every ai-instruction comment. -->
<!-- ai-instruction: {{HNK_SPEC_BASE}} = browsable base URL of the installed hnk release,
     pinned to the hnk_commit recorded in project-profile.md. -->
---
id: dictionary-{{DOMAIN_NAME}}
type: dictionary
status: active
version: 1
related: [dictionary-global]
domain: {{DOMAIN_NAME}}
summary: "Domain dictionary of {{DOMAIN_NAME}}: business terms added on top of the global scope."
---

# Domain Dictionary — {{DOMAIN_NAME}}

Terms flow down from [the global dictionary](../../_global/dictionary.md);
this file **adds** domain-specific terms on top of that scope. Conflicts
resolve toward global unless a row explicitly overrides, with the override
written into its definition-and-rules cell (conflict rule of
[hnk skill 05 §3.1]({{HNK_SPEC_BASE}}/skill/05-dictionary-and-naming.md#31-files-and-scope-inheritance)).
Row changes go through propose-then-confirm and are recorded in the deciding
session's card.

| Term (canonical full name) | Registered aliases | Banned synonyms / abbreviations | Definition and rules |
| --- | --- | --- | --- |
