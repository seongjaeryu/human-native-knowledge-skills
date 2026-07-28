<!-- ai-instruction: instantiate at the topic root as interview.md when a Level 2
     interview concludes with depth: full-topic (lightweight goals record their mode in
     the session card frontmatter instead — no interview.md is created for them). Resolve
     every placeholder from the CONFIRMED Level 2 answers; delete every ai-instruction
     comment. Enum values (frozen): {{DELIVERABLE}} = specification | implementation |
     research | hotfix; {{MODE}} = confirm-each-change | confirm-spec-changes-only |
     autonomous-with-report; {{ARCHIVE}} = card-per-milestone | card-per-goal;
     {{CONFIRMED_DATE}} = YYYY-MM-DD of the latest confirmation. -->
<!-- ai-instruction: single-domain mode — delete the `domain:` line. -->
<!-- ai-instruction: `depth` is full-topic by construction (this file exists only at that
     depth), and the frozen consistency rule then forces
     `visuals: node-graph-and-flowchart`; keep both lines exactly as written. -->
<!-- ai-instruction: `related` — add the topic's specification id
     (artifact-{{TOPIC_FOLDER_NAME}}) once ai-spec.md exists. -->
---
id: interview-{{TOPIC_FOLDER_NAME}}
type: interview
status: active
version: 1
related: []
domain: {{DOMAIN_NAME}}
topic: {{TOPIC_FOLDER_NAME}}
goal: "{{GOAL_ONE_LINE}}"
deliverable: {{DELIVERABLE}}
mode: {{MODE}}
depth: full-topic
visuals: node-graph-and-flowchart
archive: {{ARCHIVE}}
confirmed: {{CONFIRMED_DATE}}
summary: "Level 2 interview record: {{GOAL_ONE_LINE}}"
---

# Level 2 Interview — {{TOPIC_FOLDER_NAME}}

The recorded way of working for this topic's current goal. Work on this topic
obeys the `mode` above; changing the mode or the goal goes through a proposed
interview update — never silently.

| Question | Confirmed answer | Source |
| --- | --- | --- |
| Q1 — goal and deliverable | {{GOAL_ONE_LINE}} — {{DELIVERABLE}} | {{ANSWER_SOURCE}} |
| Q2 — autonomy mode | {{MODE}} | {{ANSWER_SOURCE}} |
| Q3 — documentation depth | full-topic | {{ANSWER_SOURCE}} |
| Q4 — visuals | node-graph-and-flowchart | forced by depth: full-topic |
| Q5 — archive granularity | {{ARCHIVE}} | {{ANSWER_SOURCE}} |

<!-- ai-instruction: Source cell values name where each answer came from: "profile
     default", "restored from <session card id>", or "confirmed deviation". -->
<!-- ai-instruction: UPDATE HISTORY — do not add the section at version 1. On every later
     confirmed change (new goal, mode change): update the frontmatter answers and
     `confirmed`, increment `version`, and append to an append-only `## Update History`
     section (newest entry last), one entry per confirmed change: date, changed answers
     as before → after, and a relative link to the session card that decided it. -->
