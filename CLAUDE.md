# Working on this repository — instructions for AI agents

**Boundary first.** If you are here to *consume* the skill — to install it
into a target project — this file is not for you: read [`llm.txt`](llm.txt)
and follow [`orchestrator.md`](orchestrator.md). This file is only for agents
(and their human partners) making changes **to this repository itself**.

## What this repository is to you

Every document here is load-bearing. The skill documents are not prose — they
are instructions that shape agent behavior in every project this skill is
installed into. A wrong sentence here becomes a wrong action in someone
else's repository. Treat specification text with the care you would give
production code.

## Non-negotiable rules

1. **Frozen interfaces stay frozen.** The interfaces marked "Frozen interface"
   in `skill/02, 03, 07, 08, 09, 10` (card fields, identifier schemes, command
   shapes, the frontmatter grammar, the environment contract) change only with
   a `version` increment of the owning document, a recorded reason
   (per `skill/06`), and a passing core-audit. No silent edits, ever.
2. **Derive or delete.** Every rule you add must state which degree of
   understanding it serves (first or nth — [`core/philosophy.md`](core/philosophy.md) §10).
   A rule that serves neither does not belong here, however clever.
3. **Never restate the core.** Cite [`core/philosophy.md`](core/philosophy.md)
   by anchor; restating it is an audit failure (D2 in [`core/audit.md`](core/audit.md)).
4. **Honesty of the record.** No invented metrics, no aspirational claims
   written as facts, no "should work" — this repository's README publishes
   only measured results, and your pull request must too. "It works" is not
   evidence; command output is.
5. **Zero dependency is absolute.** `scripts/hnk.mjs` uses Node builtins only.
   A pull request adding a package dependency will be closed regardless of its
   other merits.
6. **`examples/` is generated, not edited.** It is the output of a real
   install run. To change it, change what generates it and re-run the install;
   hand-edits break the claim the directory exists to make.
7. **Domain adaptations belong elsewhere.** A variant of this skill for a
   specific stack, company, or workflow belongs in its own repository that
   points at this one — not in core. Keeping core small is a feature.

## Before you open a pull request

- Run `node scripts/self-test.mjs` — all tests green, output included in the
  pull request.
- If you touched any skill document: run the core-audit checklist
  ([`core/audit.md`](core/audit.md)) over your change and report the result.
- If you touched `scripts/hnk.mjs`: add or update tests; an untested behavior
  change is an unverified claim (H-items).
- Fill **every** section of the pull-request template. Pull requests with
  blank sections are closed without review — not as rudeness, but because an
  incomplete record is exactly the debt this project exists to prevent.
- Your human partner must have reviewed the diff, and the template asks who
  they are. You are accountable to them; do not let them be embarrassed by
  what you submit.
