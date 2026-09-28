# S19 — Toolbar de la lista de personajes (PM.18)

**Estado:** Completado
**Inicio:** 2026-08-12
**Fin:** 2026-08-12

## Descripción

Se añade una barra de herramientas debajo del header de la lista de personajes
con una **búsqueda** por nombre/subtítulo y un **Select de orden** (recencia
o última actividad, en ambos sentidos). Además, el grid de cards pasa de un
`grid` uniforme a un **masonry** por columnas CSS, para que las cards de
distinta altura encajen sin huecos.

## Decisions

- **Búsqueda:** filtra por `name` y `subtitle`, case-insensitive y sin acentos
  (`normalize("NFD")` + strip de diacríticos). Se muestra el contador de
  resultados (`N resultado(s)`) solo cuando hay texto, y un estado
  "No hay personajes que coincidan con …" cuando no hay coincidencias. El
  `Empty` de "no tienes personajes" se conserva para la lista vacía real.
- **Opciones de orden** (4):
  1. `recency-desc` — **"Más recientes"** (default): `max(creación, última
     actividad)` desc. Mantiene el comportamiento de S18 (el creado/importado
     queda primero).
  2. `recency-asc` — "Más antiguos".
  3. `activity-desc` — "Última actividad: recientes" (`lastActivityAt` desc,
     con fallback a la fecha de creación si no hay conversaciones).
  4. `activity-asc` — "Última actividad: antiguos".
- **Helper puro:** `lib/sort-characters.ts` (`CharacterSortKey` +
  `sortCharacters`) concentra el orden, sin React. `use-character-list.ts`
  deja de ordenar y devuelve los personajes crudos; la lista aplica el helper
  con el estado del Select. El default reproduce el orden de S18.
- **Masonry:** columnas CSS (`columns-1 sm:columns-2 lg:columns-3`) con
  `mb-4 break-inside-avoid` por card. Sin dependencias nuevas y sin tocar
  `character-card.tsx`. El orden de lectura es por columnas (primera columna
  de arriba a abajo, luego la siguiente), aceptable para un masonry.
- **Toolbar oculta cuando no hay personajes** (el `Empty` ya ofrece el CTA).

## Criterios de aceptación

- [x] La lista muestra una barra debajo del header con búsqueda y Select de
      orden.
- [x] La búsqueda filtra por nombre y subtítulo (case- y acento-insensitive),
      muestra el contador y un estado "sin resultados".
- [x] El Select cambia el orden entre recencia (desc/asc) y última actividad
      (desc/asc), con fallback a creación cuando no hay conversaciones.
- [x] El orden por defecto es "Más recientes" (recencia de S18), por lo que el
      personaje creado/importado sigue quedando primero.
- [x] Las cards se distribuyen en un grid masonry responsive.
- [x] Tests: `sortCharacters` (cada clave y no-mutación) y la lista (búsqueda,
      sin resultados, cambio de orden). Frontend y `pnpm check` pasan.

## Notas

- Se corrigió de paso el backlog: **PM.1** (S11, v1.3.0) y **PM.2** (S12,
  v1.3.2) estaban implementados pero sin marcar como done.

## Commits

1. `docs(backlog): mark PM.1 and PM.2 as done`
2. `feat(frontend): add character sort helper`
3. `feat(frontend): character list toolbar and masonry grid`
4. `test(frontend): cover character list search and sorting`
5. `docs(backlog): mark PM.18 as done in S19`
6. `release: bump to v1.10.0 and add changelog entry`
