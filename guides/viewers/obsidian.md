---
id: guide-viewers-obsidian
type: skill
status: active
version: 1
related: [core-philosophy, skill-02-context-architecture, skill-03-okf, skill-04-diagram-first, skill-06-lifecycle-and-versioning, skill-07-pre-interview, skill-08-conversation-archive, skill-09-visual-assets, skill-10-environment-integration]
summary: "Using Obsidian as a bring-your-own viewer over an installed target: vault setup, the honest dot-folder boundary, frontmatter and Mermaid rendering, optional dashboards, and History Annotation navigation."
---

# Viewer Guide — Obsidian

Obsidian is one **bring-your-own viewer** on the read path of
[`02-context-architecture.md` §7](../../skill/02-context-architecture.md#7-storageconsumption-separation-and-the-integrity-net):
writes go through the AI and `scripts/hnk.mjs`; reads go through the Living
layer, viewers, and extractions
([core §8](../../core/philosophy.md#8-storageconsumption-separation)). The
viewer choice is Level 1 question L1-4
([`07-pre-interview.md` §2.1](../../skill/07-pre-interview.md#21-frozen-interface--the-level-1-question-bank)),
recorded in `project-profile.md` — and it is **never a dependency**. This
guide documents stock Obsidian behavior only and ships no configuration, per
the guides boundary of
[`10-environment-integration.md` §7](../../skill/10-environment-integration.md#7-example-not-dependency).
Everything below stays reachable without Obsidian, through the Living layer
and `node scripts/hnk.mjs report`.

## 1. Open the project root as a vault

Use *Open folder as vault* on the **target project root** — not on `wiki/`
alone. The vault then holds the Living layer (`wiki/` or the designated
`docs/`), root-level documents, and topic `visuals/` assets, indexed and
searchable. Two side effects to know:

- Obsidian writes its own state into `.obsidian/` at the vault root. That
  directory is viewer state, not an `hnk` artifact; keeping it out of version
  control is the user's call and sits outside the managed gitignore block of
  [`02-context-architecture.md` §8](../../skill/02-context-architecture.md#8-the-gitignore-contract).
- `hnk` documents use standard relative markdown links — semantic pointers
  per [`03-okf.md` §4](../../skill/03-okf.md#4-semantic-pointers) — which
  Obsidian renders and follows. No wikilink conversion is needed or wanted:
  the AI writes the links; the human reads them.

## 2. The honest boundary: Obsidian hides dot-folders

Stock Obsidian does not index or display dot-folders, so **`.context/` is not
browsable in a plain vault**. That is alignment, not a defect: the Living
layer is the human read surface, and the hidden-ness of `.context/` is an
affordance ([core §8](../../core/philosophy.md#8-storageconsumption-separation);
Living-layer role in
[`02-context-architecture.md` §6](../../skill/02-context-architecture.md#6-the-living-layer)).

| Surface | In a stock vault | Read it instead through |
| --- | --- | --- |
| Living layer (`wiki/` or designated `docs/`) | fully indexed — the primary Obsidian surface | — |
| topic `visuals/` (`.svg`, `.mmd`) | visible | — |
| committed `.context/` documents (specs, cards, indexes, dictionary) | not shown | `node scripts/hnk.mjs report`, the archive and media indexes, `llm.txt`, or any editor of choice |
| git-ignored payloads (`_archive/sessions/`, `_media/files/`) | not shown | descend only when cards cannot answer ([`08-conversation-archive.md` §10](../../skill/08-conversation-archive.md#10-the-consumption-model)) |

Do not paper over this boundary with plugin obligations: no `hnk` rule may
require a plugin for the record to be readable. The committed record is
complete without any viewer — that is the judgment criterion applied
([core §10](../../core/philosophy.md#10-the-judgment-criterion)).

## 3. Frontmatter rendering

Every committed document carries frontmatter in the machine-readable subset
of [`03-okf.md` §3](../../skill/03-okf.md#3-the-machine-readable-subset-grammar).
The subset is strict, valid YAML, so Obsidian parses it and shows it as
Properties: `id`, `type`, `status`, `version`, and `summary` appear as
readable fields, and inline lists (`related: [a, b]`) render as list
properties. Inline flow maps (such as a session card's `meta`) may display as
raw text in the properties panel — harmless: the subset is designed for the
zero-dependency toolchain's round-trip, not for any particular viewer
([`03-okf.md` §3.4](../../skill/03-okf.md#34-rationale)).

## 4. Mermaid rendering

Obsidian renders Mermaid code fences natively in reading view. Living-layer
architecture diagrams — and, when opened by other means, the leading visual
block every `ai-spec.md` must carry
([`04-diagram-first.md` §2](../../skill/04-diagram-first.md#2-the-leading-visual-block-of-ai-specmd))
— display as diagrams, keeping the primary verification surface visual
([`04-diagram-first.md` §1](../../skill/04-diagram-first.md#1-why-diagrams-come-first)).
Standalone `.mmd` files in `visuals/` open as plain text; inline Mermaid is
the preferred form anyway
([`09-visual-assets.md` §2](../../skill/09-visual-assets.md#2-the-format-based-rule)).

## 5. Optional enhancement: dataview-style dashboards

Community plugins in the Dataview style can query frontmatter and build live
tables — all Living-layer pages by `status`, topics by live `version`, pages
whose `summary` matches a term. Ground rules:

- **Optional means optional.** A dashboard is a private extraction. No
  committed document, rule, or workflow may depend on one; the plugin-free
  dashboard is the Living index itself (its Active-topics table, seeded from
  [`templates/living/index.md`](../../templates/living/index.md)) plus
  `node scripts/hnk.mjs report`.
- Such queries work because the data was prepared for extraction — step 2 of
  the AI-native storage process
  ([core §7](../../core/philosophy.md#7-the-ai-native-storage-process)):
  one-line `summary`, enum `status`, integer `version` exist precisely for
  machine consumers like this.
- Never commit plugin output as authority. Committed state is written by the
  AI under rules; a dashboard only mirrors it.

## 6. History Annotation navigation

Every synced Living document ends with an append-only History Annotation
([`06-lifecycle-and-versioning.md` §5](../../skill/06-lifecycle-and-versioning.md#5-living-layer-sync-with-history-annotation)):
date, topic specification and version, deciding session card — as relative
links into `.context/`. In stock Obsidian those link targets sit in an
unindexed dot-folder, so clicking them will not open the files. The honest
navigation procedure:

1. **Read the entry as text.** It is self-sufficient: identifiers carry date
   and slug ([`08-conversation-archive.md` §3](../../skill/08-conversation-archive.md#3-the-identifier-scheme--frozen-interface)),
   and the version number names the exact specification state.
2. **Ask for the extraction.** `node scripts/hnk.mjs report --topic <topic>`
   (or asking the AI) delivers the card digest — the delivery step of
   [core §7](../../core/philosophy.md#7-the-ai-native-storage-process).
3. **Open the file when needed.** In any editor or via git tooling the same
   relative links resolve verbatim.

The split is deliberate: Obsidian is the reading room of the Living layer;
`.context/` is reached through extractions or the tool of your choice.
