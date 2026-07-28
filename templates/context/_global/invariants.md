<!-- ai-instruction: instantiate into .context/_global/invariants.md — the project-wide
     inviolable rules; exactly one invariants document per scope (single source of truth).
     The two table rows below are FORMAT EXAMPLES only: REPLACE them with real project
     invariants during installation (propose candidates from the target scan and the
     Level 1 interview; confirm each with the human). If no invariant is confirmed yet,
     leave the table empty — padding rows are knowledge debt. Resolve every placeholder
     and delete every ai-instruction comment. -->
<!-- ai-instruction: invariant id pattern is INV-<CODE>-<NUMBER> (uppercase code,
     three-digit number, e.g. INV-SEC-001). <CODE> must be registered in dictionary.md
     before first use — the same registration rule as NODE-ID domain codes. Each Id cell
     begins with an inline anchor whose id is the invariant id lowercased
     (<a id="inv-sec-001"></a>), so semantic pointers can target
     invariants.md#inv-sec-001. Never renumber or reuse a retired id. In the Decided-by
     cell, link the session card that decided the invariant once one exists; "—" is legal
     for rows seeded at installation. -->
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
| <a id="inv-sec-001"></a>INV-SEC-001 | Every request that reads or writes user data completes [authentication](dictionary.md#authentication) first. | A single unauthenticated path invalidates every access guarantee the project makes. | — |
| <a id="inv-data-001"></a>INV-DATA-001 | A [device](dictionary.md#device) record is deactivated, never deleted, so historical [context](dictionary.md#context) stays resolvable. | A later reader must be able to resolve every past reference; deletion would break the record. | — |
