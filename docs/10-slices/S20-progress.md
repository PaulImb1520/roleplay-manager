# S20 — Swipe en las burbujas para navegar alternativas (PM.16)

**Estado:** Completado
**Inicio:** 2026-08-12
**Fin:** 2026-08-12

## Descripción

En móvil se puede deslizar una burbuja del asistente hacia los lados para
navegar su historial de regeneración (las alternativas), igual que hacen los
botones `‹` / `›` del footer, sin necesidad de apuntar a botones pequeños. El
gesto es exclusivamente táctil: en escritorio no cambia nada.

## Decisions

- **Hook propio:** `lib/hooks/use-swipe-navigation.ts` con Pointer Events.
  Devuelve `handlers` (para esparcir en el elemento), `dragging` y `offsetX`.
- **Solo táctil:** el gesto solo se activa con `pointerType === "touch"` (el PM
  dice *mobile*). Con ratón no se interfere con la selección de texto.
- **Bloqueo de eje:** tras ~10px se decide si el gesto es horizontal o vertical.
  Si es vertical se ignora por completo, de modo que el scroll del
  `MessageScroller` sigue funcionando. La burbuja lleva
  `touch-action: pan-y` (el navegador gestiona el scroll vertical y nos cede el
  eje horizontal).
- **Umbral y feedback:** se dispara a partir de 50px. Durante el gesto la
  burbuja sigue el dedo amortiguada (`dx * 0.6`, máx ±72px) con
  `transition: none`; al soltar vuelve a su sitio con una transición de 150ms.
- **Bloqueo direccional:** si no hay alternativa en esa dirección, el
  `onSwipeLeft`/`onSwipeRight` correspondiente es `undefined`; el hook no
  captura el puntero ni mueve la burbuja, así que el gesto "no hace nada" de
  forma visible.
- **Mapeo carrusel:** swipe ← = `onCycleNext` (como la flecha `›`), swipe → =
  `onCyclePrev` (como la flecha `‹`).
- **Activación:** solo mensajes del asistente con `alternatives.length + 1 > 1`,
  y no durante streaming ni edición.
- **Sin cambios en `@workspace/ui`:** el gesto vive en el componente de mensaje
  (`message.tsx`); `Bubble` ya acepta handlers y `style`.
- **Limpieza:** se eliminan `chat-view.tsx` y `message-list.tsx`, que eran
  código muerto (nadie los importaba; la página de conversación usa `Chat`).

## Criterios de aceptación

- [x] Deslizar una burbuja del asistente a la izquierda avanza a la siguiente
      alternativa; a la derecha vuelve a la anterior.
- [x] Los gestos por debajo del umbral o predominantemente verticales no hacen
      nada (el scroll sigue funcionando).
- [x] Los punteros no táctiles (ratón) no activan el gesto.
- [x] Sin alternativa en la dirección del swipe, no hay acción ni feedback.
- [x] El wire-up con las flechas existentes es consistente.
- [x] Código muerto eliminado (`ChatView`, `MessageList`).
- [x] Tests: hook (8 casos) y burbuja (swipe izquierda/derecha, vertical y sin
      alternativas). Frontend y `pnpm check` pasan.

## Commits

1. `feat(frontend): add swipe navigation hook`
2. `feat(frontend): swipe message bubbles to cycle alternatives`
3. `test(frontend): cover swipe navigation`
4. `chore(frontend): remove unused chat view and message list`
5. `docs(backlog): mark PM.16 as done in S20`
6. `release: bump to v1.11.0 and add changelog entry`
