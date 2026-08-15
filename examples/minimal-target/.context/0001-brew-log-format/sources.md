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
2026-08-15T16:03:00.076Z test 18 36 28
```

The project [README](../../README.md) documents the two entry points and the
defaults (dose 18, yield 36, seconds 28) that the flowchart of the
specification preserves.

## External references

| Reference | Locator | Retrieved | Notes |
| --- | --- | --- | --- |
| coffee-tracker README | ../../README.md | 2026-08-15 | Usage examples the format must keep working. |

## Compat views

Orientation decisions for external tool paths bound to this topic
(skill/02 §11.3: capability-first, frequency-second; recorded here as the
owning specification requires).

| Artifact | Authoritative document | View stub | Orientation | Reason |
| --- | --- | --- | --- | --- |
| superpowers writing-plans plan (2026-08-01-brew-log-format) | [plan.md](plan.md) | [docs/superpowers/plans/2026-08-01-brew-log-format.md](../../docs/superpowers/plans/2026-08-01-brew-log-format.md) | default — authoritative file in the hnk topic | Capability: the path's consumers are agents and humans, who can follow a stub (no fixed-path tool runtime reads it). Frequency: hnk consumers read the topic more often than superpowers re-reads its plan history — no long superpowers-driven execution is in flight. Decided in [session-20260815-160520-bind-superpowers-plan-as-compat](../_archive/session-20260815-160520-bind-superpowers-plan-as-compat.md). |

## Binary material

Binary files are never stored in the topic folder: register each one with
`node scripts/hnk.mjs visuals add` and reference it here by its media id
anchor into [the media index](../_media/index.md), never by raw path.

Registered for this topic:
[media-20260815-160348-brew-log-sample](../_media/index.md#media-20260815-160348-brew-log-sample)
— demonstration payload exercising the binary registration path (see its
`alt` text for what it is and is not).
