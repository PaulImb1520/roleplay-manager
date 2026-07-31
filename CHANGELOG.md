# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-07-31

### Added

- S1 — Configure default provider (AI provider registry and initial setup).
- S2 — Character management + app shell (character CRUD, navigation, and layout).
- S3 — Send and receive messages (SSE streaming, generation state).
- S4 — Character editing and conversation loading.
- S5 — Regenerate, edit, rewind, delete, continue, and response alternative cycling.
- S6 — Dynamic memory with Auto/Manual modes.
- S7 — Summaries (synopsis) of long conversations.
- S8 — Context (prompt) inspection and conversation titles.
- S9 — Cross-cutting polish for v1.0 (16 tasks: UX, bugs, validation, sorting, responsive).

### Changed

- Project license: AGPL-3.0-or-later.
- Install and startup scripts for end users (`scripts/install.*` and `scripts/start.*`).

### Fixed

- Regeneration history: persistence of the original content and version counter (S9.10.5).
- Hydration mismatch in the `usePersistedValue` hook (chat draft).
- Providers screen: O-llama error on load and general UX (S9.6).
