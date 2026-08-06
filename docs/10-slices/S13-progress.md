# S13 — PM.4 Override de imagen de perfil por conversación

**Estado:** Completado
**Inicio:** 2026-08-06
**Fin:** 2026-08-06

## Descripción

Permitir cambiar la imagen de perfil del personaje en un chat concreto sin
crear una nueva versión del personaje. El override es local a la conversación
y se guarda como una columna nullable en `conversations`; la lógica de
visualización cae al la imagen del personaje cuando no hay override.

## Decisions

- **Dónde vive el override:** `conversations.custom_profile_image_asset_id`
  (texto nullable). Sin FK: es un puntero blando a `character_assets.id`; si el
  personaje se borra y se cascada, la columna queda obsoleta y la helper de
  imagen efectiva se encarga de la caída.
- **Almacenamiento:** reutiliza `FilesystemCharacterAssetStorage` + tabla
  `character_assets` (el mismo sistema del creador de personajes).
- **Ruta nueva:** `POST /api/conversations/:id/customization/profile-image`
  (multipart), similar a la subida de assets de personaje. Reutiliza
  `parseMultipartBody` y `maxProfileImageBytes`.
- **Ruta existente:** `PATCH /api/conversations/:id/settings` se extiende para
  aceptar `customProfileImageAssetId` (set/clear).
- **Rename de DTO:** `characterProfileImageAssetId` → `profileImageAssetId` en
  `ConversationSummary` y `ConversationDetail`. El campo pasa a significar "la
  imagen a mostrar", no "la imagen del personaje".
- **Helper de imagen efectiva:** en `domain/`, calcula
  `customProfileImageAssetId ?? characterVersion.profileImageAssetId ?? null`.
- **GC en reemplazo:** al reemplazar el override se borra el archivo + fila del
  asset anterior.
- **GC en limpieza:** al pulsar "Quitar imagen personalizada" se borra el
  archivo + fila del asset.
- **UI:** tercer tab "Personalización" en `SettingsPanel` (Historia / Modelo /
  Personalización). `TabsList` pasa de `grid-cols-2` a `grid-cols-3`. Reutiliza
  `ProfileImageInput` (drop → cropper → upload).
- **Flujo de subida:** al soltar un archivo, el cropper devuelve un `File` PNG,
  se sube como asset, y se hace `updateConversationSettings({ customProfileImageAssetId })`. Una sola ida y vuelta, sin botón "Guardar".

## Criterios de aceptación

- [x] El usuario puede abrir el panel de configuración de un chat, ir a
      "Personalización" y subir una nueva imagen de perfil.
- [x] La nueva imagen aparece en el header del chat, en el avatar y en el card
      de conversación sin recargar la página.
- [x] La imagen del personaje en el card de personajes y en otras
      conversaciones no cambia.
- [x] Aparece un botón "Quitar imagen personalizada" cuando hay override; al
      pulsarlo se vuelve a la imagen del personaje.
- [x] Cambiar la imagen crea una fila nueva en `character_assets` pero NO crea
      una versión nueva en `character_versions`.
- [x] Reemplazar el override borra el archivo anterior del disco.
- [x] Limpiar el override borra el archivo del disco.
- [x] Si el personaje es borrado (cascada), la imagen efectiva cae a null sin
      romper la UI.
- [x] Todos los tests pasan: `pnpm check`, backend tests, frontend tests.

## Commits

1. `docs(plan): add S13 plan for per-conversation profile image override`
2. `feat(backend): add customProfileImageAssetId to conversations + upload use case`
3. `feat(backend): extend updateConversationSettings to handle custom profile image with GC`
4. `refactor(backend): expose effective profile image on conversation DTOs`
5. `feat(frontend): add conversation customization API and rename profileImageAssetId`
6. `feat(frontend): add Personalizacion tab to SettingsPanel`
7. `release: bump to v1.4.0 and add changelog entry`