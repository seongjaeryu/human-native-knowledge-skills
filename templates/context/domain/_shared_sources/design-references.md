<!-- ai-instruction: OPTIONAL DOMAIN-LAYER FILE — GATE: instantiate into
     .context/<domain>/_shared_sources/design-references.md only when the project has a
     domain layer (project-profile.md domain_layer: true) AND this domain has shared
     external design material (typically alongside design_system: true). SKIP otherwise.
     One copy per domain that needs it; other shared originals in _shared_sources/ may
     follow this same pointer-document pattern under their own names. -->
<!-- ai-instruction: this is a POINTER DOCUMENT — external material stays external. Record
     resolvable locators (URLs, design-tool node/frame ids, CDN paths) here; never paste
     binary content. Any downloaded copy is registered with
     `node scripts/hnk.mjs visuals add` and referenced by its media id anchor into the
     media index, never by raw path. Replace placeholder rows with real entries or delete
     them; resolve every placeholder and delete every ai-instruction comment. -->
---
id: design-references-{{DOMAIN_NAME}}
type: artifact
status: active
version: 1
related: []
domain: {{DOMAIN_NAME}}
summary: "Pointer document: external design sources, node ids, and CDN pointers shared by every topic of the {{DOMAIN_NAME}} domain."
---

> Type note (audit item D3): this document instantiates `type: artifact` — the nearest frozen type of hnk skill 03 §2.2 — as a support document; the diagram duties owned by `ai-spec.md` do not apply to it.

# Design References — {{DOMAIN_NAME}}

Shared design pointers for this domain's topics. This file records where
external design material lives; the understanding-carrying record of any
downloaded binary is its entry in [the media index](../../_media/index.md).

## External design sources

| Source | Locator | Node / frame id | Notes |
| --- | --- | --- | --- |
| {{DESIGN_SOURCE_NAME}} | {{DESIGN_SOURCE_URL}} | {{NODE_OR_FRAME_ID}} | {{NOTES_ONE_LINE}} |

## CDN and asset pointers

<!-- ai-instruction: once a pointed-at asset is downloaded and registered, fill the
     "Registered media id" cell with an id-anchored link into the media index, e.g.
     [media-20260729-142001-wireframe](../../_media/index.md#media-20260729-142001-wireframe). -->

| Asset | CDN locator | Registered media id | Notes |
| --- | --- | --- | --- |
| {{ASSET_NAME}} | {{CDN_URL}} | — | {{NOTES_ONE_LINE}} |
