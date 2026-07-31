<!-- ai-instruction: instantiate at the EXTERNAL tool's expected path (e.g.
     docs/superpowers/plans/<file>.md) — never inside .context/. A compat view
     binds an external tool's hardcoded path to the authoritative document in
     the hnk structure (skill/02 §11). Resolve every placeholder and delete
     every ai-instruction comment. -->
<!-- ai-instruction: frontmatter placeholders (comments are forbidden inside
     the machine-readable subset of skill/03 §3, so all guidance sits here).
     {{VIEW_ID}} is this stub's own id: the `view-` prefix with a kebab-case
     slug (e.g. view-writing-plans-add-auth for
     docs/superpowers/plans/add-auth.md), unique across the project like
     every id (02 §11.2). {{AUTHORITATIVE_ID}} is the authoritative
     document's id — an id, never a path, and never the id of another view
     (verify rejects view-to-view resolution) — reused identically in
     `related`, `resolves_to`, the body link text, and the stale-path
     resolve line. {{AUTHORITATIVE_RELATIVE_PATH}} is the fast path only;
     if it goes stale, {{AUTHORITATIVE_ID}} is what actually resolves the
     pointer via `llm.txt` or `.context/_archive/index.md` — ids survive
     moves, paths don't. {{AUTHORITATIVE_SUMMARY_ONE_LINE}} is the
     authoritative document's one-line summary, pasted inside the double
     quotes; escape `"` as `\"` per 03 §3.2. Keep
     {{AUTHORITATIVE_KEYWORDS}} in sync with the authoritative document's
     key terms — it is the stub's content-search surface. All common
     frontmatter fields are required on views (03 §2.1 sanctions omissions
     only for session cards and indexes); verify checks the grammar and
     `summary` (via parse), `resolves_to` presence and resolution (never
     another view), and body links (02 §11.4) — the remaining common fields
     are your responsibility at instantiation. -->
---
id: {{VIEW_ID}}
type: view
status: active
version: 1
related: [{{AUTHORITATIVE_ID}}]
resolves_to: {{AUTHORITATIVE_ID}}
summary: "Compat view: {{AUTHORITATIVE_SUMMARY_ONE_LINE}}"
---

Authoritative document: [{{AUTHORITATIVE_ID}}]({{AUTHORITATIVE_RELATIVE_PATH}})

If that path is stale, resolve `resolves_to: {{AUTHORITATIVE_ID}}` via
`llm.txt` or `.context/_archive/index.md` — the id survives moves.

Keywords: {{AUTHORITATIVE_KEYWORDS}}
