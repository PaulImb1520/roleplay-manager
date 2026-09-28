# S17 — Gestor de exportación de personajes (PM.10 + PM.9)

**Estado:** Completado
**Inicio:** 2026-08-12
**Fin:** 2026-08-12

## Descripción

Se añade un "Gestor de exportación" accesible desde el `ContextMenu` de la
card de personaje. El diálogo muestra un checkbox tree jerárquico con todo lo
exportable de un personaje (definición, imagen de perfil, historial de
versiones, conversaciones y ramas con mensajes/memorias/resúmenes/
configuraciones, y una plantilla de configuración standalone para aplicar a
otro personaje). El backend ensambla la selección y el frontend descarga un
JSON versionado. De paso, **PM.9 (exportar conversaciones)** queda cubierto por
la sección "Conversaciones y ramas".

## Decisions

- **Dónde se ensambla:** el JSON lo construye el backend en un solo viaje.
  Nuevo endpoint `POST /api/characters/:id/exports` con
  `{ sections: ExportSection[], includeProfileImageBase64?: boolean }`, resuelto
  por `ExportCharacterUseCase` (orquesta character, conversation, message,
  memory, summary y asset repos).
- **Formato versionado:** `{ schemaVersion: 1, kind: "character-export",
  exportedAt, character, definition?, profileImage?, versions?, conversations?,
  standaloneSettings? }`. `schemaVersion` + `kind` permiten que un futuro
  módulo de import valide el archivo.
- **Jerarquía estricta (UI + backend):** las secciones hijas no pueden
  exportarse sin su padre. En la UI los hijos de "Conversaciones y ramas"
  quedan **deshabilitados** si el padre está desmarcado; en el backend, si un
  hijo llega sin su padre se lanza
  `DomainError("INVALID_EXPORT_SELECTION")` (defensa en profundidad). La misma
  tabla de dependencias (`EXPORT_SECTION_PARENTS`, en `@workspace/shared`) sirve
  para un futuro import: p. ej. las memorias requieren conversaciones, y las
  conversaciones requieren el personaje.
- **"Ramas" = conversaciones:** las ramas (PM.7) no son una entidad aparte, son
  conversaciones; por eso se exportan dentro de "Conversaciones y ramas".
- **Imagen de perfil:** se incluye como `{ assetId, mimeType, base64? }`. Por
  defecto `includeProfileImageBase64: true` (archivo auto-contenido); el flag
  permite exportar solo la referencia. El tamaño ya está acotado por
  `MAX_PROFILE_IMAGE_BYTES` (3 MB) en la subida.
- **"Solo configuración" (plantilla):** exporta un bloque `ExportSettings`
  (modelo, proveedor, instancia, parámetros de inferencia, memoria) tomado de
  la conversación más reciente del personaje; si no hay conversaciones, usa los
  valores por defecto de creación. **No** incluye
  `customProfileImageAssetId` (esa personalización es por conversación y vive
  bajo "Configuraciones y personalizaciones").
- **Definición vs versiones:** "Definición" exporta la versión **actual**
  (`CharacterVersionDTO`, tarjetas incluidas); "Historial de versiones" exporta
  todas las versiones. Hay solape intencional: definición = snapshot usable,
  versiones = historial completo.
- **UI:** nuevo item "Exportar…" (ícono `Download`) en el `ContextMenu`, entre
  "Editar personaje" y "Eliminar personaje". El diálogo vive dentro del
  `CharacterContextMenu` (igual que el de borrado), así que no hace falta tocar
  `character-card.tsx` ni `character-list.tsx`.
- **Primitiva nueva:** `Checkbox` en `@workspace/ui` (Base UI `Checkbox`), ya
  que no existía.
- **Descarga:** el frontend serializa el JSON y dispara la descarga con
  `Blob` + `URL.createObjectURL` + un ancla temporal
  (`personaje-<slug>-<fecha>.json`).

## Criterios de aceptación

- [x] El `ContextMenu` de la card muestra "Exportar…" con el ícono `Download`.
- [x] El diálogo muestra un checkbox tree jerárquico con: Definición, Imagen de
      perfil, Historial de versiones, Conversaciones y ramas (Mensajes,
      Memorias dinámicas, Resúmenes, Configuraciones y personalizaciones) y
      Solo configuración.
- [x] Todo viene marcado por defecto salvo "Solo configuración".
- [x] Botones "Marcar todo" / "Desmarcar todo".
- [x] Con "Conversaciones y ramas" desmarcado, sus hijos quedan deshabilitados
      y sin marcar.
- [x] El backend valida la jerarquía y rechaza hijos sin padre.
- [x] "Exportar" descarga un JSON versionado con las secciones elegidas.
- [x] Exportar "Solo configuración" produce una plantilla independiente del
      personaje (aplicable a otro).
- [x] La imagen de perfil se incluye en base64 (con opción de omitirla).
- [x] PM.9 (exportar conversaciones) queda cubierto por la sección
      "Conversaciones y ramas".
- [x] Tests: backend (293) y frontend pasan, y `pnpm check` pasa
      (architecture 4/4, typecheck y lint en los 4 paquetes).

## Fuera de alcance

- **Módulo de importación (PM.8):** no se implementa. El formato se diseñó para
  que un import futuro valide la jerarquía (`schemaVersion`, `kind` y la tabla
  `EXPORT_SECTION_PARENTS`).

## Commits

1. `feat(shared): add character export types and hierarchy map`
2. `feat(backend): character export use case and POST /exports endpoint`
3. `feat(ui): add Checkbox primitive`
4. `feat(frontend): export manager dialog with hierarchical checkbox tree`
5. `test(backend): cover ExportCharacterUseCase`
6. `test(frontend): cover export dialog tree and download`
7. `docs(backlog): mark PM.9 and PM.10 as done in S17`
8. `release: bump to v1.8.0 and add changelog entry`
