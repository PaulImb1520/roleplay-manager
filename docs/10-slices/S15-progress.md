# S15 — Pantalla unificada de personajes y conversaciones (PM.6)

**Estado:** Completado
**Inicio:** 2026-08-12
**Fin:** 2026-08-12

## Descripción

El sistema separaba los personajes de sus conversaciones en dos pantallas:
`/` (lista de personajes) y `/conversations` (lista de conversaciones). Se
unifican en una sola pantalla de cards de personajes, donde cada card agrupa
sus conversaciones. La card muestra una imagen grande de portada, el nombre,
la versión más reciente, la fecha de creación y la última actividad. Un clic
en la imagen lleva a la conversación más reciente (o la crea si no existe); el
clic derecho abre un `ContextMenu` con las acciones de PM.6. De paso, se
elimina por completo la funcionalidad de archivar conversaciones (front y
back), que quedaba huérfana sin su pantalla.

## Decisions

- **Cards con imagen:** se sigue el patrón del ejemplo de card con `img`
  (`Card` con `pt-0`, overlay oscuro `bg-black/35`, `object-cover`, y `Badge`
  de versión en `CardAction`). Si el personaje no tiene imagen de perfil se
  muestra un placeholder (`bg-muted` + icono de usuarios).
- **Clic en la imagen:** si el personaje tiene conversaciones, navega a la más
  reciente (`/conversations/:id`). Si no tiene, llama `createConversation` con
  la versión actual y navega al chat resultante (mismo patrón que
  `use-character-form`). Si el proveedor no está disponible, `toast.warning` y
  navega igualmente.
- **Clic derecho → `ContextMenu` (PM.6):**
  - "Ir a la más reciente" (deshabilitado si no hay conversaciones).
  - Submenú "Conversaciones": lista las conversaciones del personaje ordenadas
    por `lastActivityAt` desc; cada item navega a su chat.
  - Submenú "Nueva conversación": lista las versiones (cargadas perezosamente
    vía `listCharacterVersions`, cacheadas en el hook); crear con una versión
    que ya tiene conversación devuelve 409 → `toast.error` y navega a la más
    reciente.
  - "Editar personaje" → `/characters/:id`.
  - "Eliminar personaje" → `Dialog` de confirmación → `deleteCharacter` →
    refresh.
- **Datos:** `useCharacterList` hook nuevo que carga `listCharacters()` +
  `listConversations()` en paralelo, agrupa conversaciones por `characterId` y
  expone la última conversación y la última actividad por personaje. `ContextMenu`
  usa `ContextMenuLabel` envuelto en `ContextMenuGroup` (requisito de Base UI).
- **Eliminación del archivado:** se quita `ConversationStatus`, el getter
  `status`, `archive()`/`unarchive()` del entity, `ConversationArchivedError`,
  `ConversationAlreadyActiveError`, `ArchiveConversationUseCase` (+ tests), los
  guards `status === "archived"` de 12 use cases, los endpoints
  `archive`/`unarchive`, el parámetro `status` de `GET /api/conversations`, y la
  columna `status` de `conversations` (migración `0010_reflective_lord_hawal.sql`).
  En frontend se borran `/conversations`, `conversation-list.tsx`,
  `conversation-card.tsx`, el link del sidebar y las funciones
  `archiveConversation`/`unarchiveConversation`.

## Criterios de aceptación

- [x] La pantalla principal muestra una card por personaje con imagen,
      nombre, versión más reciente, fecha de creación y última actividad.
- [x] Un clic en la imagen abre la conversación más reciente; si no existe,
      se crea una con la versión actual y se abre el chat.
- [x] El clic derecho abre un `ContextMenu` con: Ir a la más reciente,
      submenú de conversaciones (ordenadas por más reciente), submenú de nueva
      conversación eligiendo versión, Editar personaje y Eliminar personaje
      (con confirmación).
- [x] El submenú de conversaciones navega a la conversación seleccionada.
- [x] El submenú de versiones carga las versiones perezosamente y crea la
      conversación con la versión elegida; el caso 409 se maneja con toast.
- [x] Eliminar personaje pide confirmación y refresca la lista.
- [x] `/conversations` y su link del sidebar fueron eliminados.
- [x] La funcionalidad de archivar fue eliminada en front y back (sin UI, sin
      endpoints, sin columna `status` en la DB).
- [x] Tests: backend (277) y frontend (85) pasan, y `pnpm check` pasa
      (architecture 4/4, typecheck y lint en los 4 paquetes).

## Commits

1. `feat(shared): remove ConversationStatus and status fields from DTOs`
2. `refactor(backend): drop archive feature (use cases, routes, schema, migration)`
3. `feat(frontend): unified character screen with image cards and PM.6 context menu`
4. `test(frontend): cover character card and list (PM.6)`
5. `release: bump to v1.6.0 and add changelog entry`
