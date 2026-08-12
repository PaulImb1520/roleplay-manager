# PM Backlog — Post-MVP

Backlog of features deferred past v1.0. Items here are not committed to a
release; they are promoted to a slice (`S11`, `S12`, …) when picked up.

See `S9-plan.md` for the v1.0 polish tasks and the rationale for deferring
these. The dependency graph below reflects which PMs must land together or in
sequence.

Last updated: 2026-08-12

## UI polish

| # | Proposal | Dependencies |
|---|----------|--------------|
| PM.17 | Settings panel responsive redesign: Sheet → DropdownMenu of three dialogs (Historia / Modelo / Personalización). <br>*Done as S14 (v1.5.0) — see `S14-progress.md`.* | — |

> **PM.17 (S14) — done (2026-08-12, v1.5.0):** The chat settings panel grew to three tabs and the
> right-side Sheet breaks text layout on small phone screens. It was reworked into a
> `DropdownMenu` trigger whose three items (Historia, Modelo, Personalización) each open a
> dedicated responsive `Dialog` with content-scoped scrolling. PM.5 and PM.3 have been
> deferred (see note below), so the roadmap resumes with the smaller, independent items
> (PM.6 → PM.16). See `S14-progress.md`.

## Images & media

| # | Proposal | Dependencies |
|---|----------|--------------|
| PM.1 | Import images and store them in the DB (not just links) for the profile photo. | New column/table, storage |
| PM.2 | Add an image cropper for the profile photo. | PM.1 |
| PM.3 | Image compressor for the background image and square-section cropper. <br>*Deferred — revisit with PM.5 (see note below).* | PM.1 |
| PM.4 | Modify the profile image without creating a new character version. <br>*Done as S13 (v1.4.0) — see `S13-progress.md`.* | PM.1 |
| PM.5 | Allow choosing a background image for the chat (default: profile photo), with fit modes (fill, crop, etc.). <br>*Deferred — requires a totally new image flow (see note below).* | PM.1 |

> **PM.3 + PM.5 (image flow) — deferred (2026-08-12):** Both form a single, entirely new
> functionality that is too large for the current cycle: image compressors backed by
> external libraries, multiple cropping modes, and croppers for different resolutions
> (e.g. a 1920×1080 background vs the 512×512 avatar). With PM.17 (S14) finished, the
> backlog moves to the smaller, high-value tasks (PM.6 → PM.16) first. When PM.5 is picked
> up, a **new image flow must be defined first** (upload → compress → crop → store → fit
> modes for background and avatar), reusing what S13 built for the profile image but
> designed for arbitrary sizes and aspect ratios.

## Grouping & navigation

| # | Proposal | Dependencies |
|---|----------|--------------|
| PM.6 | Group conversations by character in a single card. Use a ContextMenu for submenus: create a conversation choosing a version, edit the character, pick an associated conversation (sorted by most recent). "Go to most recent" option. <br>*Done as S15 (v1.6.0) — see `S15-progress.md`.* | — |
| PM.7 | Story branches in a single conversation with a visual interface. | — |

> **PM.6 (S15) — done (2026-08-12, v1.6.0):** The separate `/conversations` screen is gone.
> Characters and their conversations now live in a single card grid on the home screen. Each
> card shows the profile image, name, current version, creation date and last activity; a
> click on the image opens the most recent conversation (creating it with the current
> version when none exists), and a right-click opens a `ContextMenu` with "Go to most
> recent", a conversations submenu (sorted by most recent), a "New conversation" submenu
> where you pick a version (lazy-loaded), "Edit character", and "Delete character" (with
> confirmation). The archive-conversation feature was removed entirely (front + back). See
> `S15-progress.md`.

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
