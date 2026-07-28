<!-- ai-instruction: gate — Living layer seed for the CREATE-WIKI path only
     (Level 1 question L1-5; skill/02 §6): instantiate at wiki/index.md when the
     project has no existing human documentation layer. When an existing docs/ (or
     equivalent) is DESIGNATED as the Living layer instead, DO NOT instantiate this
     file — nothing is moved; bind the existing documents into the structure with a
     pointer mapping, add the History Annotation rule of skill/06 §5 to them, and
     record the location in project-profile.md (orchestrator.md step 4;
     audit-existing maps, never moves — skill/02 §10). -->
<!-- ai-instruction: placeholders — {{PROJECT_NAME}}: the target project's name;
     {{LIVING_SUMMARY}}: one line describing what this dashboard currently shows.
     Keep `related` listing the ids of documents this page cites (topic
     specifications as they land; project-profile). Resolve and remove every
     ai-instruction comment. -->
---
id: wiki-index
type: wiki
status: active
version: 1
related: [project-profile]
summary: "{{LIVING_SUMMARY}}"
---

# {{PROJECT_NAME}} — current state

<!-- ai-instruction: this page states the CURRENT state only — `.context/` remembers,
     the Living layer states (skill/06 §5). Standing rule: at every milestone or
     session end, update the body to the live architecture (superseded content is
     removed, never struck through) and append exactly one History Annotation
     entry. -->

## Architecture now

<!-- ai-instruction: one short paragraph plus one Mermaid diagram of the current
     architecture — the live version of the relevant specifications. Seed at install
     from the Level 1 analysis of the target; for knowledge projects, diagram the
     decision flow or document dependency graph instead (skill/04 §5). -->

## Active topics

<!-- ai-instruction: one row per active topic — link the Specification cell to the
     topic's live ai-spec.md (e.g. ../.context/<domain>/0001-topic/ai-spec.md) and
     keep Live version equal to its frontmatter `version`. Seeded with the header
     row only when no topics exist yet; updated at every sync. -->

| Topic | Live version | Specification | State (one line) |
| --- | --- | --- | --- |

## History Annotation

<!-- ai-instruction: APPEND-ONLY — newest entry last, one entry per Living-layer
     sync, in the frozen format of skill/06 §5 (date — topic ai-spec link + version
     — deciding session card link, as relative links), for example:
     - 2026-07-29 — [0001-notification](../.context/sms-system/0001-notification/ai-spec.md) v2
       — decided in [session-20260729-143012-queue-pivot](../.context/_archive/session-20260729-143012-queue-pivot.md)
     Seeded empty at install; the first sync appends the first entry. This section
     is the page's only memory: never rewrite or reorder existing entries. -->
