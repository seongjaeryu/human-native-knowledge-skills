# Ignored payloads — listing document

Per the v1 rule that git-ignored artifacts are represented by a listing
document ([skill/02 §8](../../skill/02-context-architecture.md#8-the-gitignore-contract):
"ignored does not mean unintelligible"), this file lists what existed
locally in the install run's target machine but is — by design — absent from
this instance demo. The record remains understandable without these files:
each raw transcript is summarized by its self-sufficient session card, and
the binary is described by its mandatory `alt` text in
[.context/_media/index.md](.context/_media/index.md).

| Local path (in the target) | Bytes | sha256 (first 12) | Represented by |
| --- | --- | --- | --- |
| .context/_archive/sessions/session-20260730-061612-install-hnk-coffee-tracker.full.md | 2898 | 9f10d326aba0 | card [session-20260730-061612-install-hnk-coffee-tracker](.context/_archive/session-20260730-061612-install-hnk-coffee-tracker.md) (`raw_sha256` holds the full digest) |
| .context/_archive/sessions/session-20260730-061851-brew-log-format-specification.full.md | 2247 | 3482d24a8360 | card [session-20260730-061851-brew-log-format-specification](.context/_archive/session-20260730-061851-brew-log-format-specification.md) (`raw_sha256` holds the full digest) |
| .context/_media/files/0001-brew-log-format/brew-log-sample.png | 70 | cb5079190045 | media index entry `media-20260730-061939-brew-log-sample` (its `sha256` field holds the full digest; its `alt` text states honestly that it is a single-pixel demo payload) |

Both raws are `raw_fidelity: reconstructed` and `visibility: private`
(`storage: none` was chosen at install, with the frozen disclosure
acknowledged), so no remote copy exists anywhere.
