# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.2.0] - 2026-08-04

### Added

- Memory list shows the **effective (decayed) importance** in a color-coded badge: still in the prompt (outline), excluded from the prompt (secondary), or deletion candidate (destructive). Hover shows the stored importance and turns elapsed since the last update.
- Memory list **auto-refreshes after each new message**, so silent-mode sweeps are visible without reopening the panel.
- Shared memory-decay helpers (`@workspace/shared/lib/memory-decay`) used by both backend and frontend, keeping the decay math in a single place.
- Automated tests for the decay flow: policy math, prompt filtering, silent/manual/off sweep integration, and frontend store/display logic.

### Changed

- Decay turns now count only **user messages**; assistant replies no longer wear memories down twice as fast.
- Decay settings inputs in the settings panel stack vertically instead of squeezing into three columns (previously released as a fix).

## [1.1.0] - 2026-07-31

### Added

- S10 — Memory decay (auto-degradation of dynamic memories): memories lose -1 importance every N turns without being updated (configurable per conversation, default 10 turns). Memories whose effective importance falls at or below the threshold (default 3) are excluded from the prompt and become candidates for deletion.
- Per-conversation decay settings: silent/manual/off mode, importance threshold (1-10), turns before deleting below-threshold memories (default 30), and turns per -1 importance.
- Silent mode: automatic sweep after each message. Manual mode: "Run cleanup now" button that deletes all candidates, plus individual memory deletion. Off mode: no deletion, prompt filtering stays active.
- Endpoint `POST /api/conversations/:id/memories/decay` (manual sweep).
- Memory list refreshes automatically after a sweep and shows the last cleanup timestamp and count.

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
