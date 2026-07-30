---
id: artifact-0001-brew-log-format
type: artifact
status: active
version: 1
frozen_commits: {}
topic: 0001-brew-log-format
related: [invariant-global, dictionary-global, interview-0001-brew-log-format]
summary: "Specification v1 of the brew-log line format: one space-separated line per brew, appended by the recorder and parsed by the reporter."
---

# Brew Log Format — Specification

## Macro node graph

```mermaid
graph TD
    NODE-BREW-01["[NODE-BREW-01] Brew Recorder"] --> NODE-BREW-02["[NODE-BREW-02] Brew Log Store"]
    NODE-BREW-02 --> NODE-BREW-03["[NODE-BREW-03] Brew Reporter"]
```

## Flowcharts

```mermaid
flowchart TD
    START["[NODE-BREW-01] receive CLI arguments"] --> ARGS{"required fields present?"}
    ARGS -- no --> DEF["fill documented defaults (dose 18, yield 36, seconds 28)"]
    ARGS -- yes --> LINE["compose one line: ISO-timestamp bean dose yield seconds"]
    DEF --> LINE
    LINE --> APPEND["append the line to the brew-log — never rewrite"]
    APPEND --> ECHO["echo the recorded line to the caller"]
```

## [NODE-BREW-01] Brew Recorder

Records exactly one brew per invocation. Implemented by `recordBrew` in
`src/tracker.mjs` (the unit carries the `@spec-node` marker back to this
node). It composes one [brew-log](../_global/dictionary.md#brew-log) line —
`ISO-timestamp bean doseGrams yieldGrams seconds`, space-separated, newline
terminated — and appends it, respecting
[INV-BREW-001](../_global/invariants.md#inv-brew-001): the log is
append-only.

## [NODE-BREW-02] Brew Log Store

The [brew-log](../_global/dictionary.md#brew-log) file itself (`brews.log`
in the working directory, git-ignored by the target). This node has **no
implementing code unit** — it is data at rest; its format contract is
enforced by the writer ([NODE-BREW-01](#node-brew-01-brew-recorder)) and the
parser ([NODE-BREW-03](#node-brew-03-brew-reporter)). Stated here so
"unmapped" is never mistaken for "unimplemented". Fields per line, in order:
ISO-8601 timestamp, bean name (no spaces), dose in grams, yield in grams,
extraction seconds.

## [NODE-BREW-03] Brew Reporter

Parses every line of the store and prints the brew count and the average
extraction ratio (yield divided by dose). Implemented by `readBrews` and
`averageRatio` in `src/report.mjs` (both under one `@spec-node` comment
block). A malformed line yields `NaN` fields rather than aborting the
report; tightening this is an open follow-up in the deciding session's card.

## Version History

No pivots yet — version 1 is the live content. Each future pivot appends an
entry in
[the frozen shape](https://github.com/seongjaeryu/human-native-knowledge-skills/blob/03ccacf/skill/06-lifecycle-and-versioning.md#23-version-history-section):
`### vN → vN+1 — <date>` with **reason**, **decided-by** (session card link),
**before**/**after** (NODE-ID edge syntax), and **frozen-as** (the outgoing
version's commit hash).
