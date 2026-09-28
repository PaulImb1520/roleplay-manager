# S21 — Swipe para regenerar al agotar las alternativas (PM.16, mejora)

**Estado:** Completado
**Inicio:** 2026-08-12
**Fin:** 2026-08-12

## Descripción

Mejora del swipe de S20: cuando se desliza en la dirección de **avanzar**
(hacia la alternativa más reciente) y ya no hay más historial en esa dirección,
el gesto pasa a **regenerar** el mensaje. Es un atajo al "Regenerar" del
`ContextMenu` que evita el mantener-presionado en móvil. Así, deslizar a la
izquierda repetidamente va recorriendo las alternativas y, al llegar a la más
reciente, genera una respuesta nueva.

## Decisions

- **Mapeo conservado (S20):** swipe ← = avanzar (`onCycleNext`), swipe → =
  retroceder (`onCyclePrev`).
- **Fallback a regenerar:** `onSwipeLeft` es `onCycleNext` si hay alternativa
  más reciente; si no, es `onRegenerate` cuando el mensaje es el último del
  asistente y no está en streaming/edición. En cualquier otro caso no hay
  acción (y sin acción no hay feedback de arrastre, por el bloqueo direccional
  del hook).
- **Mismos guardas que el `ContextMenu`:** solo se regenera por gesto cuando el
  mensaje es el **último** (`isLastMessage`) y del asistente, igual que la
  opción "Regenerar" existente.
- **Sin alternativas también regenera:** un mensaje recién recibido (1/1)
  responde al swipe ← regenerando directamente, que es el caso de uso del
  atajo.
- **Sin cambios en backend ni en `chat.tsx`:** se reutiliza `onRegenerate`
  (`handleRegenerate` de `useChatStreaming`), que ya se pasa a cada burbuja.

## Criterios de aceptación

- [x] Swipe ← con alternativa más reciente disponible → avanza (no regenera).
- [x] Swipe ← en la alternativa más reciente → regenera.
- [x] Swipe ← en un mensaje sin alternativas que es el último → regenera.
- [x] Swipe ← en un mensaje que no es el último → no regenera.
- [x] Swipe → sigue retrocediendo y nunca regenera.
- [x] Los gestos verticales se siguen ignorando.
- [x] Tests: 6 casos de la burbuja (avance, retroceso, regeneración con/sin
      alternativas, no-último y vertical). Frontend y `pnpm check` pasan.

## Commits

1. `feat(frontend): regenerate the last message when swiping past the newest alternative`
2. `test(frontend): cover swipe to regenerate`
3. `release: bump to v1.12.0 and add changelog entry`
