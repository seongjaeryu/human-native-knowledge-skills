<!-- ai-instruction: session card template — instantiates the frozen card interface of
     skill/08 §4. Instantiate ONCE PER SESSION at .context/_archive/{{SESSION_ID}}.md;
     never copy this file into the target as-is. Two-stage writing (skill/08 §5):
     stage 1 at session start — create as a DRAFT: resolve every frontmatter
     placeholder, keep `ended: null`, leave the body sections empty; stage 2 at
     session end — complete the body, pass the self-sufficiency check, fill `ended`.
     The installation session itself is archived with this template
     (orchestrator.md step 8). Resolve and remove EVERY ai-instruction comment at
     stage-1 instantiation — no such comment may exist in the target, even in a
     draft card; the section guidance lives in skill/08 §4.5-4.6. -->
<!-- ai-instruction: frontmatter placeholders (comments are forbidden inside the
     machine-readable subset of skill/03 §3, so all guidance sits here):
     {{SESSION_ID}} — session-YYYYMMDD-HHMMSS-slug (skill/08 §3): the `started`
       timestamp, UTC, second precision; kebab-case slug, at most five words.
       The id never changes — it names this file, the raw, and the index anchor.
     {{STARTED_UTC}} — ISO-8601 UTC instant (2026-07-29T15:30:42Z); its date-time
       equals the id's timestamp.
     {{AUTHOR_HANDLE}} — the human's handle. {{AGENT_TOOL_AT_MODEL}} — tool@model.
     {{DOMAIN}} / {{TOPIC}} — optional locators (skill/02); DELETE each line when unset.
     {{INTERVIEW_ID}} — id of the governing interview document (skill/07 §7.2);
       DELETE this line in lightweight mode — the `mode` field below is the record.
     {{MODE}} — confirm-each-change | confirm-spec-changes-only |
       autonomous-with-report (skill/07 §4.2); prerecorded at session start.
     visibility — keep `private` unless the human explicitly opts this card's raw
       into upload (`uploadable`); the card itself is always committed (skill/08 §4.3).
     status — `local-only` at creation; transitions (skill/08 §4.4) are applied by
       the upload path or proposed by verify, never freely.
     {{RAW_FIDELITY}} — `captured` (capture path) or `reconstructed` (rule-based
       core). NEVER label a reconstructed raw as captured (skill/08 §4.2).
     ended / raw_remote / raw_sha256 — keep the literal `null` until session end /
       successful upload / first raw snapshot, respectively.
     {{ONE_LINE_SUMMARY}} — one line, inside the double quotes; consumed verbatim
       by the archive index and llm build. No secret values anywhere in this file
       (skill/08 §7). -->
---
id: {{SESSION_ID}}
type: session
started: {{STARTED_UTC}}
ended: null
meta: {author: {{AUTHOR_HANDLE}}, agent: {{AGENT_TOOL_AT_MODEL}}}
domain: {{DOMAIN}}
topic: {{TOPIC}}
interview: {{INTERVIEW_ID}}
mode: {{MODE}}
visibility: private
status: local-only
raw_fidelity: {{RAW_FIDELITY}}
raw_local: .context/_archive/sessions/{{SESSION_ID}}.full.md
raw_remote: null
raw_sha256: null
summary: "{{ONE_LINE_SUMMARY}}"
---

<!-- ai-instruction: body — exactly these five sections, in this order (frozen,
     skill/08 §4.5). Before filling `ended`, verify the self-sufficiency criterion
     of skill/08 §4.6: an nth-degree consumer must understand the decisions, their
     reasons, the before/after, and the affected files from this card alone — the
     raw is git-ignored and possibly never uploaded. A card that fails this check
     stays a draft (`ended: null`). -->

## Goal

<!-- ai-instruction: what this session set out to do, and under which mode — one short paragraph. -->

## Key decisions

<!-- ai-instruction: every decision with its reason — including dictionary rows added (skill/05 §4) and interview outcomes. -->

## Deltas

<!-- ai-instruction: one entry per specification change — reason, affected NODE-IDs, before/after in Mermaid edge syntax (entry shape: skill/06 §2.3); write "None." when no specification changed. -->

## Affected files

<!-- ai-instruction: every file created, changed, or deleted, as a list of paths. -->

## Follow-ups

<!-- ai-instruction: open items handed to the next session, including manual-upload notes from skill/08 §9; write "None." when empty. -->
