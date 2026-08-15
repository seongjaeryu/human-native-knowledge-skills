---
id: session-20260815-160520-bind-superpowers-plan-as-compat
type: session
started: 2026-08-15T16:05:20Z
ended: 2026-08-15T16:07:26Z
meta: {author: seongjaeryu, agent: claude-code@claude-fable-5}
topic: 0001-brew-log-format
mode: confirm-spec-changes-only
visibility: private
status: local-only
raw_fidelity: reconstructed
raw_local: .context/_archive/sessions/session-20260815-160520-bind-superpowers-plan-as-compat.full.md
raw_remote: null
raw_sha256: d61d19a1546b130192df9f1499f944206021e02177421fead343eaf037284373
summary: "Superpowers plan bound as a compat view: CLAUDE.md override block, plan content moved to topic plan.md, view stub instantiated at the legacy path, orientation recorded in sources.md."
---

## Goal

Bind an execution plan that an external plan-writing tool created at
`docs/superpowers/plans/2026-08-01-brew-log-format.md` into the hnk
structure, following the coexistence recipe of `guides/coexistence/`
(superpowers) and skill/02 §11. Confirmation form; mode
`confirm-spec-changes-only` restored from the topic's newest card
([session-20260815-160252-brew-log-format-specification](session-20260815-160252-brew-log-format-specification.md));
depth `lightweight` (deviation — no specification content changes, so this
card is the mode record per skill/07 §7.1), visuals `none`, archive
`card-per-goal`. **Disclosure (core §9):** the plan document was created at
the superpowers path as a *simulated* external-tool artifact for this
demonstration run — no superpowers plugin executed. Everything done with it
afterward is the real recipe run by the real toolchain.

## Key decisions

- **Level 2 answers confirmed** as in Goal. Rejected alternative for depth:
  updating `interview.md` to version 2 (`full-topic` treatment) — it lost
  because this goal changes no specification content; the interview record
  stays reserved for the topic's specification goals, and skill/07 §7.1
  places a lightweight goal's mode record in the session card.
- **Orientation: default** — the authoritative file lives in the hnk topic
  (`plan.md`), the view stub stands at the superpowers path. Decided
  capability-first, frequency-second (skill/02 §11.3): the path's consumers
  are agents and humans, who can follow a stub — no fixed-path tool runtime
  reads it; and hnk consumers read the topic more often than superpowers
  re-reads its plan history (no long superpowers-driven execution in
  flight). Rejected alternative: the reversed orientation (authoritative
  file at the tool's path, pointer row in `sources.md`) — it lost on the
  frequency test. Recorded with its reason as a row in
  [sources.md](../0001-brew-log-format/sources.md#compat-views).
- **CLAUDE.md override block added** (three bullets, per the coexistence
  guide §1) outside the managed `hnk:begin`/`hnk:end` pointer block, which
  was not touched: skill output routes into the topic structure; recorded
  reversals are the exception; `docs/superpowers/` accepts only view stubs
  and recorded-reversal authoritative files.
- **View stub instantiated from `templates/context/view-stub.md`**: id
  `view-writing-plans-brew-log-format`, `resolves_to:
  plan-0001-brew-log-format` (id, not path), body carrying the fast-path
  relative link, the id-resolution fallback line, and the Keywords search
  surface; every placeholder resolved, every ai-instruction comment
  removed. The stub passes the `verify` view scan (resolution by id, no
  view-to-view, live body links).
- **Strict mode not adopted** (guide §4). Rejected alternative: a Claude
  Code `PreToolUse` hook denying writes under `docs/superpowers/**` — it
  lost because this target keeps zero tool-specific wiring, the same reason
  the capture trigger was declined at install.
- **No rejection-harvesting candidates arose (R22)**: the human forbade no
  approach mid-session; the override block is an instruction to future
  skill runs, not an invariant row (it lives in CLAUDE.md, where standing
  preferences belong — skill/02 §3.3 keeps preferences out of invariants).

## Deltas

None. No specification node changed: `ai-spec.md` stays at version 1;
`plan.md` is a support document executing it (skill/02 §4.1).

## Affected files

- CLAUDE.md (document-placement override block appended; pointer block untouched)
- .context/0001-brew-log-format/plan.md (created — authoritative, content moved from the superpowers path)
- docs/superpowers/plans/2026-08-01-brew-log-format.md (plan content replaced by the instantiated compat-view stub)
- .context/0001-brew-log-format/sources.md (Compat views section with the orientation row)
- .context/_archive/sessions/session-20260815-160520-bind-superpowers-plan-as-compat.full.md (this session's raw, git-ignored)
- .context/_archive/index.md, llm.txt (regenerated at session end)

## Follow-ups

- Execute the plan: Task 2's malformed-line decision for NODE-BREW-03
  (skip-and-count versus fail-loudly) is still open — the same open end the
  topic card carries.
- If a long superpowers-driven execution ever starts on this topic,
  re-evaluate the orientation per the frequency test and record any
  reversal as a new `sources.md` row (the CLAUDE.md block already defers to
  recorded reversals).
- Storage remains `none`; all three raws and the registered payload exist
  only on this machine (accepted at install).
