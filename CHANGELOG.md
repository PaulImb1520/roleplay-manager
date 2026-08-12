# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.6.1] - 2026-08-12

### Fixed

- Creating a character no longer starts at version 2. The create flow deferred the profile-image upload to a second `PUT /api/characters/:id` call, which went through `UpdateCharacterUseCase` and created a new version, so every character created with an image ended up at v2. New `PATCH /api/characters/:id/profile-image` (and `UpdateCharacterProfileImageUseCase`) attaches the image to the current version in place, without creating a new version; the frontend uses it during creation.

## [1.6.0] - 2026-08-12

### Added

- Unified character screen (PM.6): characters and their conversations are now grouped in a single card grid. Each card shows a large profile image, the character name, subtitle, current version, creation date, and last activity date.
- Clicking a card image opens the most recent conversation for that character; if there is none, a conversation is created with the current version and the chat is opened.
- Right-clicking a card opens a `ContextMenu` with: "Ir a la más reciente", a "Conversaciones" submenu (sorted by most recent), a "Nueva conversación" submenu where you pick a version (lazy-loaded), "Editar personaje", and "Eliminar personaje" (with confirmation dialog).
- Tests for the new card (rendering, image click, context menu actions, delete dialog) and for the list orchestrator (rendering, navigation, conversation creation).

### Removed

- The `/conversations` page and its sidebar entry are gone; conversations are reached from the character card. `pages/conversations/index.astro`, `conversation-list.tsx`, and `conversation-card.tsx` were deleted.
- The archive conversation feature (front + back): no UI, no `archive`/`unarchive` endpoints, no DB column. `Conversation.status` was removed from the domain entity, shared DTOs, and the `conversations` table (migration `0010_reflective_lord_hawal.sql`). Use cases that previously blocked operations on archived conversations no longer guard on status, and `ArchiveConversationUseCase` (plus its tests) was deleted.
- `ConversationArchivedError` and `ConversationAlreadyActiveError` from the backend error set.

### Changed

- `GET /api/conversations` no longer accepts a `status` query parameter (it returns all conversations).
- The `ConversationStatus` type was removed from `@workspace/shared`; `ConversationSummary` and `ConversationDetail` no longer expose `status`.

## [1.5.0] - 2026-08-06

### Changed

- Chat settings panel rebuilt for small screens: the right-side Sheet with three tabs is replaced by a `DropdownMenu` trigger whose items (Historia, Modelo, Personalización) each open a dedicated responsive `Dialog`. Content is unchanged; only the container changed.
- The "Restablecer valores" / "Aplicar cambios" footer now lives inside the Historia and Modelo dialogs; both are scoped to their own fields (Historia persists `summaryFrequency` / `recentMessageCount`, Modelo persists the inference parameters). Personalización keeps its own save flow.
- The "last opened tab" (`settings-tab`) is no longer persisted.

### Added

- New `DropdownMenu` primitive in `@workspace/ui` (Base UI `Menu`).
- The Historia accordion now remembers only the open items (`settings-accordion`); it defaults to all closed.

## [1.4.0] - 2026-08-06

### Added

- Per-conversation profile image override (PM.4): a new "Personalización" tab in the chat settings panel lets you replace the profile picture for a single conversation without creating a new character version.
- New `POST /api/conversations/:id/customization/profile-image` endpoint (multipart upload, reuses the filesystem asset storage and the 3 MB limit).
- `PATCH /api/conversations/:id/settings` now accepts `customProfileImageAssetId` (set/clear), validating that the referenced asset exists.
- Replacing or clearing the override garbage-collects the previous asset file and row; if the character is deleted (cascade), the effective image falls back to `null` without breaking the UI.
- Drizzle migration `0009_silly_the_hunter.sql` adds `custom_profile_image_asset_id` to `conversations`.
- Tests for the upload use case, the effective-image helper, and the Personalización tab.

### Changed

- DTO field renamed `characterProfileImageAssetId` → `profileImageAssetId` on `ConversationSummary` and `ConversationDetail`; frontend consumers updated accordingly.
- Chat settings now show three tabs: Historia / Modelo / Personalización.

## [1.3.2] - 2026-08-05

### Added

- Square image cropper (PM.2): selecting or dropping an image in the character form now opens a crop dialog. Users can pan and zoom to frame a square profile photo before it is uploaded.
- New `ImageCropperDialog` component (`react-easy-crop` based) with configurable aspect ratio (default `1` = square).
- Canvas-based crop utilities (`getCroppedImg`, `fileToDataUrl`, `blobToFile`) that produce a PNG `File` for the existing upload flow.

### Changed

- The dropzone no longer uploads the raw file directly; it routes the file through the crop dialog first. The rest of the upload flow (immediate upload on edit, deferred upload on create) is unchanged.

## [1.3.1] - 2026-08-05

### Added

- Drag & drop profile image dropzone in the character form (also supports click-to-select). Always visible in the "General" tab for both create and edit.
- New-character flow: the selected file is held in state and uploaded after the character is created, then the character is updated with the new asset id.
- The dropzone is structured so a cropper step (PM.2) can be added later.

### Removed

- The legacy `profileImage: string` (URL/data-URI) field is gone from all DTOs, the `CharacterVersion` entity, the character and conversation surfaces, and the database. `profileImageAssetId` is now the only image reference (offline-first: no external links).
- Dropped `profile_image` column from `character_versions` (migration `0008_superb_spencer_smythe.sql`).
- Removed the URL text input from the character form.

## [1.3.0] - 2026-08-04

### Added

- Profile image upload and storage: users can now upload PNG/JPEG/WEBP/GIF images (up to 3 MB) as profile photos. Files are stored on disk under `./data/characters/<characterId>/` with metadata in a new `character_assets` table.
- New `POST /api/characters/:id/assets` endpoint for multipart file upload (busboy-based).
- New `GET /api/characters/:id/assets/:assetId` endpoint for serving stored images.
- `profileImageAssetId` field on `CharacterVersionDTO`, `CreateCharacterInput`, and `UpdateCharacterInput` — backward compatible (existing URL-based `profileImage` still works).
- Profile image picker in the character form: file input with preview, upload button, and clear button (only shown when editing an existing character).
- Character card, chat header, conversation card, and chat-view surfaces now render the uploaded asset URL when `profileImageAssetId` is present, falling back to the `profileImage` URL.
- Drizzle migration `0007_sour_silverclaw.sql` adds `character_assets` table and `profile_image_asset_id` column to `character_versions`.
- New environment variables: `DATA_DIR` (default `./data`) and `MAX_PROFILE_IMAGE_BYTES` (default 3 MB).
- Backend tests for image validation, filesystem storage, upload/get use cases, and multipart parsing.

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
