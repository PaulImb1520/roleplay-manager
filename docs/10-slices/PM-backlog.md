# PM Backlog — Post-MVP

Backlog of features deferred past v1.0. Items here are not committed to a
release; they are promoted to a slice (`S11`, `S12`, …) when picked up.

See `S9-plan.md` for the v1.0 polish tasks and the rationale for deferring
these. The dependency graph below reflects which PMs must land together or in
sequence.

Last updated: 2026-08-06

## UI polish

| # | Proposal | Dependencies |
|---|----------|--------------|
| PM.17 | Settings panel responsive redesign: Sheet → DropdownMenu of three dialogs (Historia / Modelo / Personalización). <br>*In progress as S14 — prioritized before PM.5 onwards.* | — |

> **PM.17 (S14) — in progress (2026-08-06):** The chat settings panel grew to three tabs and the
> right-side Sheet breaks text layout on small phone screens. It is being reworked into a
> `DropdownMenu` trigger whose three items (Historia, Modelo, Personalización) each open a
> dedicated responsive `Dialog`. The panel is being fixed first, ahead of the sequential
> PM.5→PM.16 roadmap. See `S14-progress.md`.

## Images & media

| # | Proposal | Dependencies |
|---|----------|--------------|
| PM.1 | Import images and store them in the DB (not just links) for the profile photo. | New column/table, storage |
| PM.2 | Add an image cropper for the profile photo. | PM.1 |
| PM.3 | Image compressor for the background image and square-section cropper. <br>*Deferred — revisit with PM.5 (see note).* | PM.1 |
| PM.4 | Modify the profile image without creating a new character version. <br>*Done as S13 (v1.4.0) — see `S13-progress.md`.* | PM.1 |
| PM.5 | Allow choosing a background image for the chat (default: profile photo), with fit modes (fill, crop, etc.). | PM.1 |

> **PM.3 (compressor) — deferred (2026-08-05):** Not needed for profile photos. Storage is
> filesystem-based (cheap, and the user can re-upload any image at any time), compression
> permanently destroys quality, and there is no background image yet (PM.5). Revisit PM.3
> when PM.5 is picked up: a full-screen background (1920×1080) is much larger than the
> 512×512 avatar, so a compressor and a free-aspect (non-square) cropper make sense there.

## Grouping & navigation

| # | Proposal | Dependencies |
|---|----------|--------------|
| PM.6 | Group conversations by character in a single card. Use a ContextMenu for submenus: create a conversation choosing a version, edit the character, pick an associated conversation (sorted by most recent). "Go to most recent" option. | — |
| PM.7 | Story branches in a single conversation with a visual interface. | — |

## Export / Import

| # | Proposal | Dependencies |
|---|----------|--------------|
| PM.8 | Import a character from a file (drag & drop or file picker). | — |
| PM.9 | Export conversations. | — |
| PM.10 | Export manager: export character definition, specific versions, associated conversations, dynamic memory, summaries, settings. Accessible from the ContextMenu of the character list. | PM.8, PM.9 |

## Multi-language & themes

| # | Proposal | Dependencies |
|---|----------|--------------|
| PM.11 | Multi-language support, default English. | — |
| PM.12 | Predefined color themes. | — |
| PM.13 | Welcome screen that asks for language and theme on first launch. | PM.11, PM.12 |
| PM.14 | Top menubar to pick language and theme. | PM.11, PM.12 |

## New features

| # | Proposal | Dependencies |
|---|----------|--------------|
| PM.15 | User-played characters (name and description, no version required). | — |
| PM.16 | Swipe the message bubble left/right to navigate the regeneration history (mobile). | S9.16 |
