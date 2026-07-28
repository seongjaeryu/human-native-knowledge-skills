---
id: invariant-global
type: invariant
status: active
version: 1
related: [dictionary-global]
summary: "Project-wide inviolable rules; every session, at every autonomy level, must respect them."
---

# Global Invariants

Rules no session may break, at any autonomy level. Domain invariants extend —
never silently contradict — this document. Rows are added and changed through
propose-then-confirm, and every change is recorded in the deciding session's
card.

| Id | Invariant | Reason | Decided by |
| --- | --- | --- | --- |
| <a id="inv-brew-001"></a>INV-BREW-001 | The [brew-log](dictionary.md#brew-log) is append-only: no session may rewrite, reorder, or delete existing lines. | Past brews are the project's only history; a rewritten log cannot be verified by any later reader. | [session-20260728-202806-brew-log-format-specification](../_archive/session-20260728-202806-brew-log-format-specification.md) |
