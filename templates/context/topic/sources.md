<!-- ai-instruction: TIMING GATE — instantiate at TOPIC CREATION (after a full-topic
     Level 2 interview concludes), never at installation: no topic exists at install
     time and the placeholders below are unresolvable then. -->
<!-- ai-instruction: instantiate at the topic root as sources.md — the collected originals
     and the pointer document for external material driving this topic. Fill the sections
     with what actually exists at creation time; replace placeholder rows with real
     entries or delete them. Resolve every placeholder and delete every ai-instruction
     comment. -->
<!-- ai-instruction: single-domain mode — delete the `domain:` line, and shorten the media
     index link below from ../../_media/index.md to ../_media/index.md. -->
---
id: sources-{{TOPIC_FOLDER_NAME}}
type: artifact
status: active
version: 1
related: [artifact-{{TOPIC_FOLDER_NAME}}]
domain: {{DOMAIN_NAME}}
topic: {{TOPIC_FOLDER_NAME}}
summary: "Collected originals and external references for {{TOPIC_FOLDER_NAME}}."
---

> Type note (audit item D3): this document instantiates `type: artifact` — the nearest frozen type of hnk skill 03 §2.2 — as a support document; the diagram duties owned by `ai-spec.md` do not apply to it.

# Sources — {{TOPIC_FOLDER_NAME}}

Collected requirements, references, and originals for this topic — the raw
material the specification was distilled from, kept so a later reader can
trace every decision back to what prompted it.

## Originals

<!-- ai-instruction: paste or summarize collected text originals here — requirements,
     release notes, meeting outcomes, quoted correspondence. Text stays in this file;
     never paste secret values. -->

{{COLLECTED_ORIGINALS}}

## External references

| Reference | Locator | Retrieved | Notes |
| --- | --- | --- | --- |
| {{REFERENCE_NAME}} | {{URL_OR_LOCATOR}} | {{RETRIEVED_DATE}} | {{NOTES_ONE_LINE}} |

## Binary material

Binary files are never stored in the topic folder: register each one with
`node scripts/hnk.mjs visuals add` and reference it here by its media id
anchor into [the media index](../../_media/index.md), never by raw path.
