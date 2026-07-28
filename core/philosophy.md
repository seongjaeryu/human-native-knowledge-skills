---
id: core-philosophy
type: core
status: active
version: 1
related: [core-audit]
summary: "The constitution of hnk: goal, first principle, knowledge-debt definition, and judgment criterion. Everything else derives from this file."
---

# Core Philosophy

This file is the constitution of **human-native-knowledge-skills (`hnk`)**.
Every rule, spec, template, and script in this repository — and in every
project it is installed into — must derive from this file. Derived documents
(`skill/01` through `skill/10`) may cite and apply this file; they must not
restate it. When any two rules conflict, this file decides.

## 1. Goal

> **The accumulation of knowledge that both humans and AI can easily understand.**

Accumulation — not individual outputs — is the goal. Verifying and
understanding a single piece of work matters only because it is the condition
under which knowledge can accumulate instead of decaying into debt.

## 2. First Principle — the two-stage condition of accumulation

Knowledge accumulates only when both of the following hold:

1. **First degree (at production time).** The primary producers — one human
   and one AI working together — must understand *each other* easily. This is
   mutual: the human's intent must reach the AI accurately, and the AI's
   output must be verifiable by the human at the moment it is produced.
2. **Nth degree (at transfer time).** Every later consumer — user 2, user 3,
   and the AI of every later session — must be able to understand what was
   done and why, easily.

The same person in their next session is already an nth-degree consumer:
their context is gone. This is why knowledge debt afflicts even a team of one.

## 3. Problem definition — knowledge debt

By analogy with technical debt:

- **Principal** — AI output that accumulates without first-degree mutual
  understanding: work the human never really verified, decisions that live
  only in a chat log.
- **Interest** — the understanding cost that compounds at every transfer, as
  time passes, as people change, and as sessions change (user 1 → user 2 →
  user 3, and every next AI session).

`hnk` exists to stop the principal from being issued and to stop the interest
from compounding.

## 4. Positioning — human-native completes AI-native

Human-native is not the opposite of AI-native; it is its **necessary
condition**. If humans cannot verify and understand AI output, that output has
no sustainable value — so a workflow is not truly AI-native until it is also
human-native.

## 5. Core metaphor — the restoration of document collaboration

Before AI, collaborating humans already solved this problem: documents flowed
between people, discussion happened around them, and outcomes were distilled
into result documents anyone could pick up later. `hnk` restores that pattern
inside agentic workflows:

| Then (human collaboration)      | Now (`hnk`)                          |
| ------------------------------- | ------------------------------------ |
| documents flowing between people | session raw transcript (`raw`)       |
| the result document             | the **session card**                 |
| the file of meeting minutes     | the archive index                    |

## 6. The actor model — the session

The minimum unit of work is **one session of "one human + one AI"**. The
session card is that session's result document. A team is a set of sessions —
no separate team concept is needed. Every session after the current one,
including the same human's next session, is an nth-degree consumer.

## 7. The AI-native storage process

A refinement of the dual-layer principle, and the process every `hnk`
mechanism follows:

1. **Data is created AI-native, following the rules.** The entity that reads
   the accumulated data as a whole is the AI.
2. **At creation time, it is prepared so a human-friendly form can be
   extracted** (structured metadata, one-line summaries, alt text, indexes).
3. **The AI delivers the human-friendly form through those rules** — on
   demand, when a human needs it.

**The real worker is the AI.** Humans confirm at decision points and consume
when they need to; they do not hand-maintain the data layer.

## 8. Storage/consumption separation

Human-native is a philosophy about the *form* of knowledge, not about the
visibility of its storage. Stored context lives in a hidden folder
(`.context/`) as an affordance: **writes go through the AI and scripts
(propose-then-confirm); reads go through viewers and extractions.** Direct
human edits are not forbidden, but integrity is guarded by verification
tooling, not by hand-care.

## 9. Honesty of the record

A record must never claim more than it is. Reconstructed transcripts must not
be presented as captured ones; a missing binary must still be understandable
through its required text description; a session card must stand on its own —
an nth-degree consumer must be able to understand the decisions, their
reasons, and their effects from the card alone, without access to the raw.

## 10. The judgment criterion

When rules conflict, when a new rule is proposed, or when any artifact is
audited, ask one question:

> **Does this help first-degree mutual understanding, or nth-degree
> understanding? If neither — why does it exist?**

The operational checklist form of this criterion is
[`core/audit.md`](audit.md). It is used both to audit this repository before
every release and to audit target projects.
