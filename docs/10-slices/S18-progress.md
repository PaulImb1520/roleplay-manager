# S18 — Importación de personajes y orden por recencia (PM.8)

**Estado:** Completado
**Inicio:** 2026-08-12
**Fin:** 2026-08-12

## Descripción

Se cierra el ciclo de exportación/importación de S17 con la importación de
personajes (PM.8). Se puede importar de dos formas: arrastrando un JSON sobre
la lista de personajes (aparece un overlay que invita a soltarlo) o con el
botón "Importar personaje" (a la izquierda de "Crear personaje"), que abre un
diálogo con una zona para soltar o elegir el archivo. La importación reconstruye
todo lo que traiga el JSON (personaje, versiones, imagen, conversaciones,
mensajes, memorias y resúmenes) y, al terminar, refresca la lista. Además, la
lista ahora se ordena por **recencia** (`max(fecha de creación, última
actividad)`), de modo que el personaje recién creado/importado o el de
actividad más reciente queda primero.

## Decisions

- **Round-trip completo:** el backend recrea personaje + versiones (con
  tarjetas) + imagen de perfil (base64 → asset nuevo) + conversaciones (con
  mensajes, memorias y resúmenes). Todos los ids se regeneran; las referencias
  se remapean (`versionId` de cada conversación, `firstMessageId`/
  `lastMessageId` de cada resumen).
- **Validación:** se exige `kind: "character-export"` y
  `schemaVersion: 1`, y que el archivo traiga `definition` o `versions` (sin
  versión no hay personaje importable). Si `versions` está presente se prefiere
  sobre `definition` y se persiste todo el historial.
- **Fechas del personaje:** `createdAt`/`updatedAt` del personaje importado son
  **ahora**, para que quede primero en la lista. Las fechas de versiones,
  conversaciones, mensajes, memorias y resúmenes se preservan.
- **Anclaje de conversaciones:** cada conversación se re-ancla a su versión
  importada vía el mapa de ids; si su versión no vino en el archivo, cae a la
  versión actual importada.
- **Imagen de perfil:** se recrea como asset nuevo y se asigna a la versión
  actual. El export solo incluye un asset (el de la versión actual), así que las
  versiones antiguas quedan sin imagen.
- **Alternativas de mensajes:** se preservan (round-trip fiel). El cursor de
  la alternativa mostrada se normaliza a 0 conservando el contenido visible
  exportado.
- **`standaloneSettings` se ignora** en la importación: es una plantilla pensada
  para aplicar a otro personaje existente (flujo futuro).
- **Nombres duplicados permitidos:** se importa siempre con un id nuevo.
- **Límite de body:** se monta un parser JSON de 25 MB **solo** para
  `POST /api/characters/imports` (el global sigue en 1 MB), porque el JSON
  puede incluir la imagen en base64 y conversaciones completas.
- **Validación en dos capas:** el frontend valida con
  `lib/parse-character-export.ts` para dar un error amigable antes de subir; el
  backend vuelve a validar (autoritativo).
- **UI de arrastre:** `CharacterDropOverlay` solo se activa cuando el drag
  contiene archivos (`dataTransfer.types` incluye `Files`) y usa un contador
  de `dragenter`/`dragleave` para no parpadear.
- **Orden por recencia:** `use-character-list.ts` ordena por
  `max(createdAt, lastActivityAt)` desc. Sustituye al orden por defecto del
  backend (creación ascendente).

## Criterios de aceptación

- [x] Arrastrar un JSON sobre la lista muestra un overlay "Suelta el archivo
      aquí para iniciar la importación".
- [x] El botón "Importar personaje" (a la izquierda de "Crear personaje") abre
      un diálogo con zona para soltar o elegir el archivo.
- [x] Un archivo inválido (JSON roto, `kind`/`schemaVersion` incorrectos o sin
      definición) muestra un error claro y no importa nada.
- [x] Un archivo válido recrea el personaje con sus versiones, imagen,
      conversaciones, mensajes, memorias y resúmenes, con ids nuevos y
      referencias remapeadas.
- [x] Tras importar, la lista se refresca y el personaje importado aparece
      primero.
- [x] La lista se ordena por `max(creación, última actividad)` desc.
- [x] Tests: backend (299) y frontend pasan, y `pnpm check` pasa
      (architecture 4/4, typecheck y lint en los 4 paquetes).

## Fuera de alcance

- **Importar configuraciones hacia un personaje existente** (el caso
  `standaloneSettings`): queda como flujo futuro.
- **Resolución de conflictos por nombre:** se permiten duplicados.

## Commits

1. `feat(backend): import character with full round-trip`
2. `feat(frontend): import character dialog and drag & drop overlay`
3. `feat(frontend): sort character list by recency`
4. `test(backend): cover ImportCharacterUseCase`
5. `test(frontend): cover import parsing, dialog, overlay and sorting`
6. `docs(backlog): mark PM.8 as done in S18`
7. `release: bump to v1.9.0 and add changelog entry`
