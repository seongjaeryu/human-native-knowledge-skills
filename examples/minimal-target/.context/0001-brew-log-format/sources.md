---
id: sources-0001-brew-log-format
type: artifact
status: active
version: 1
related: [artifact-0001-brew-log-format]
topic: 0001-brew-log-format
summary: "Collected originals and external references for 0001-brew-log-format."
---

> Type note (audit item D3): this document instantiates `type: artifact` — the nearest frozen type of hnk skill 03 §2.2 — as a support document; the diagram duties owned by `ai-spec.md` do not apply to it.

# Sources — 0001-brew-log-format

Collected requirements, references, and originals for this topic — the raw
material the specification was distilled from, kept so a later reader can
trace every decision back to what prompted it.

## Originals

Observed line produced by the pre-specification CLI (the de-facto format the
specification codifies):

```text
2026-07-30T06:18:51.949Z test 18 36 28
```

The project [README](../../README.md) documents the two entry points and the
defaults (dose 18, yield 36, seconds 28) that the flowchart of the
specification preserves.

## External references

| Reference | Locator | Retrieved | Notes |
| --- | --- | --- | --- |
| coffee-tracker README | ../../README.md | 2026-07-30 | Usage examples the format must keep working. |

## Binary material

Binary files are never stored in the topic folder: register each one with
`node scripts/hnk.mjs visuals add` and reference it here by its media id
anchor into [the media index](../_media/index.md), never by raw path.

Registered for this topic:
[media-20260730-061939-brew-log-sample](../_media/index.md#media-20260730-061939-brew-log-sample)
— demonstration payload exercising the binary registration path (see its
`alt` text for what it is and is not).
