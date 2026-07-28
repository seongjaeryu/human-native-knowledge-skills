<!-- ai-instruction: instantiate into .context/_global/dictionary.md — the global term
     dictionary, single source of truth for project vocabulary. The rows below are the
     default seed of hnk skill 05 §3.3 plus the hnk registration row of §3.4: they are
     PROPOSALS, not law. During the Level 1 installation interview (question L1-8),
     present every row for the human to CONFIRM, EDIT, or REJECT (bulk confirmation is
     allowed); apply the outcome here. The classic edit: a team whose public API uses
     `auth` moves it from the banned column to registered aliases, with the justification
     written into the definition-and-rules cell. Then append candidate rows found by
     scanning the target, each proposed the same way. When done, record
     dictionary_seeded: true in project-profile.md. Resolve every placeholder and delete
     every ai-instruction comment. -->
<!-- ai-instruction: PROJECT-TYPE GATE — rows whose definition ends with "Seeded only for
     code and mixed project types" (isLoading, spec-node, spec-doc) are DELETED when the
     Level 1 project-type answer is `knowledge`. All other rows seed every project type. -->
<!-- ai-instruction: LOCAL-LANGUAGE COLUMN — when the L1-7 documentation-language answer
     includes a language other than English, PREPEND a "Local name (<language>)" column
     to the table and fill it per row, following the example of hnk skill 05 §3.3
     (e.g. | 인증 | authentication | ... |). Otherwise leave the table as-is. -->
<!-- ai-instruction: {{HNK_SPEC_BASE}} = browsable base URL of the installed hnk release,
     pinned to the hnk_commit recorded in project-profile.md (for example
     https://github.com/seongjaeryu/human-native-knowledge-skills/blob/<hnk_commit>). -->
---
id: dictionary-global
type: dictionary
status: active
version: 1
related: []
summary: "Global term dictionary: canonical full names, registered aliases, and banned abbreviations for {{PROJECT_NAME}}."
---

# Global Dictionary

The shared-vocabulary contract of this project: a term is either the canonical
full name, a registered alias, or it does not appear in output. Domain
dictionaries add terms on top of this scope; conflicts resolve toward this
file unless a domain row explicitly overrides. The AI maintains this table
under the standing orchestrator rules; row changes go through
propose-then-confirm and are recorded in the deciding session's card.

| Term (canonical full name) | Registered aliases | Banned synonyms / abbreviations | Definition and rules |
| --- | --- | --- | --- |
| <a id="device"></a>device | — | `dev`, `dvc`, `deviceInfo` | A physical device connected to the system. |
| <a id="context"></a>context | — | `ctx`, `cntxt` | Application state, and the material a session provides to the AI. |
| <a id="authentication"></a>authentication | — | `auth`, `authn` | The procedure that verifies an identity. If the team's public API uses `auth`, register it as an alias instead — the interview decides. |
| <a id="isLoading"></a>isLoading | — | `isPending`, `waiting`, `loadingState` | Boolean flag: an asynchronous operation is in progress. Seeded only for code and mixed project types. |
| <a id="NODE-ID"></a>NODE-ID | — | — | The unique identifier of a specification diagram node ([04-diagram-first.md]({{HNK_SPEC_BASE}}/skill/04-diagram-first.md)). Seeded for all project types. |
| <a id="spec-node"></a>spec-node | — | — | The `@spec-node` code-comment marker mapping code to a NODE-ID. Seeded only for code and mixed project types. |
| <a id="spec-doc"></a>spec-doc | — | — | The `@spec-doc` code-comment marker pointing at the owning specification document. Seeded only for code and mixed project types. |
| <a id="human-native-knowledge-skills"></a>human-native-knowledge-skills | `hnk` | — | The skill system operating this project's knowledge base. Alias registered because it is unambiguous, heavily used, and appears in file names (`scripts/hnk.mjs`) and command namespaces. |

Row convention: the term cell begins with an inline anchor whose id is the
canonical term verbatim, so semantic pointers can target
`dictionary.md#<term>`. The AI writes these anchors whenever it writes rows.
An alias earns registration only when it is externally imposed or unambiguous
and heavily used — and the reason is written into the definition-and-rules
cell. A row exists only if it helps understanding: a dictionary that defines
every noun is padding, and padding is knowledge debt.
