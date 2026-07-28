# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Build milestones

This repository was built in stages M0–M6 (bootstrap, core + curriculum
01–06, improvement specifications 07–10 with interface freeze, orchestrator +
templates, scripts, guides, examples + end-to-end verification). Skill
documents reference these stage names when they mark an interface as frozen.

## Release rule

Before every release tag:

1. Run the core-audit (`core/audit.md`) against every rule, spec, and script in this repository — record the result here.
2. Re-run the installation end-to-end and regenerate `examples/` so the demo never drifts from the spec.
3. Record spec changes as `minor`/`major` per SemVer; installed projects track the skill version they were installed from in their `project-profile.md`.

## [Unreleased]

### Added

- M0 bootstrap: LICENSE (MIT), bilingual README, changelog, `llm.txt` skeleton, `.gitignore`.
