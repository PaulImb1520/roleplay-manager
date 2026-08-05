# S11 — PM.1 Profile image upload & storage

**Estado:** En progreso
**Inicio:** 2026-08-04

## Descripción

Permitir al usuario importar imágenes y almacenarlas en la base de datos (no solo enlaces) para la foto de perfil del personaje.

## Decisions

- **Storage:** Filesystem under `./data/characters/<characterId>/<assetId>.<ext>` + metadata in `character_assets` table.
- **Transport:** multipart/form-data parsed by `busboy`.
- **API:** `POST /api/characters/:id/assets` (upload) + `GET /api/characters/:id/assets/:assetId` (serve binary).
- **Migration:** add `profileImageAssetId` alongside `profileImage` (backward compatible).
- **Limits:** 3 MB default (`MAX_PROFILE_IMAGE_BYTES`), env-overridable. Mimes: png, jpeg, webp, gif.
- **Old asset:** no cleanup (PM.4 territory).

## Criterios de aceptación

- [ ] User can pick a PNG/JPEG/WEBP/GIF up to 3 MB in the character form.
- [ ] File is uploaded to `POST /api/characters/:id/assets` and returns `{ id }`.
- [ ] Asset is written to disk and row exists in `character_assets`.
- [ ] `GET /api/characters/:id/assets/:assetId` returns binary with correct `Content-Type`.
- [ ] Files > 3 MB or disallowed mime rejected (400/413).
- [ ] Path traversal rejected.
- [ ] `profileImageAssetId` flows through create/update DTOs.
- [ ] Surfaces show uploaded image (character card, chat header, conversation cards).
- [ ] Legacy `profileImage: string` still works (no breaking change).
- [ ] All tests pass: `pnpm check`, backend tests, frontend tests.
