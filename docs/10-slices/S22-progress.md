# S22 — Temas de color predefinidos (PM.12)

**Estado:** Completado
**Inicio:** 2026-08-12
**Fin:** 2026-08-12

## Descripción

Se introduce un sistema de temas de color con dos ejes independientes:

- **Tema (paleta):** `default` (el actual), `forest` (Bosque, verde) y `ocean`
  (Océano, azul).
- **Modo:** claro, oscuro o sistema.

Los temas se definen como bloques de tokens CSS (`[data-theme="forest"]` y su
variante `[data-theme="forest"].dark`) que **remapean los roles semánticos**
existentes, así que todas las utilidades de Tailwind (`bg-background`,
`text-foreground`, `bg-primary`…) siguen funcionando sin cambios. El modo sigue
siendo la clase `.dark` en `<html>` (ya soportada por `@custom-variant dark`),
que ahora sí se aplica. Un selector en el header permite cambiar tema y modo.

## Decisions

- **Estrategia (opción A):** CSS variables + `data-theme` + clase `.dark`, con
  provider/hook propios. Sin dependencias nuevas y control total; el dark mode
  es por clase, como ya estaba preparado en `globals.css`.
- **Remapear roles, no invertir:** cada tema sobreescribe el set completo de
  tokens (background, card, primary, secondary, muted, accent, border, ring,
  charts y sidebar). Los neutros van tintados por el hue del tema
  (`oklch(… 0.006 150)` para Bosque, `… 250` para Océano) y el dark se compone
  aparte (no es un invert mecánico).
- **Contraste:** `primary` en claro se eligió oscuro (`L≈0.47`) para que el
  texto claro encima pase AA; en oscuro se elige claro (`L≈0.77`) con texto
  oscuro. `muted-foreground` se mantiene ≥4.5:1 sobre el fondo en ambos modos.
- **Anti-FOUC:** script inline en `base.astro` (`<head>`) que lee `localStorage`
  y aplica `data-theme` + `.dark` antes de pintar.
- **Hidratación:** el provider inicializa su estado de forma perezosa
  (`typeof document === "undefined"` → defaults en el servidor) y aplica al
  `<html>` en un efecto idempotente con el script. Los valores dependientes del
  tema solo se renderizan dentro del portal del menú (cerrado en el primer
  render), así que no hay mismatch de hidratación.
- **Persistencia:** `theme` y `color-mode` en `localStorage`; se escribe en los
  setters (no en un efecto) para no pisar los valores guardados al montar.
- **Modo sistema:** se sigue `matchMedia("(prefers-color-scheme: dark)")` y se
  reacciona a sus cambios.
- **Superficies del navegador:** `color-scheme` por modo, `::selection` y
  `caret-color` derivados del `--primary` del tema (craft floor: las superficies
  que no dibujas también llevan el diseño).
- **Selector mínimo (PM.12):** `DropdownMenu` con icono `Palette` en el header
  del `AppShell`, con grupos "Tema" (swatch + radio) y "Modo". PM.14 lo moverá
  al menubar superior.
- **Sonner desacoplado:** `Toaster` recibe `theme` por prop (el `resolvedMode`)
  en vez de `next-themes`, que estaba sin cablear; se elimina la dependencia
  muerta.
- **Split por lint:** `use-theme.ts` (contexto + hook + helpers, sin
  componentes) y `theme-provider.tsx` (solo el componente) para satisfacer
  `react-refresh/only-export-components`; y estado perezoso en vez de
  `setState` en un efecto (`react-hooks/set-state-in-effect`).

## Criterios de aceptación

- [x] Existen 3 temas (default + Bosque + Océano), cada uno con variante clara y
      oscura definida como tokens.
- [x] El modo claro/oscuro/sistema se aplica con la clase `.dark` en `<html>`.
- [x] El tema y el modo se persisten y se recuperan al recargar.
- [x] Sin flash de tema al cargar (script inline).
- [x] Selector en el header para cambiar tema y modo.
- [x] `sonner` sigue el modo resuelto.
- [x] `color-scheme`, `::selection` y `caret-color` se derivan del tema.
- [x] `next-themes` eliminado de `@workspace/ui` (lockfile limpio).
- [x] Tests: registro (ids/labels/validación) y provider (aplicar, persistir,
      sistema, recuperar, valores inválidos). Frontend y `pnpm check` pasan.

## Verificación visual

- El CSS compilado se sirvió desde el dev server con los selectores de los tres
  temas, `color-scheme`, `::selection` y `caret-color` presentes.
- El detector de Impeccable no reportó hallazgos.
- Pendiente: revisión visual humana de los 3 temas × 2 modos (el navegador de
  escritorio no estaba conectado en la sesión).

## Commits

1. `feat(ui): add forest and ocean theme tokens`
2. `feat(frontend): theme provider, registry and anti-flash script`
3. `feat(frontend): theme switcher in the app header`
4. `refactor(ui): decouple sonner from next-themes`
5. `test(frontend): cover theme registry and provider`
6. `docs(backlog): mark PM.12 as done in S22`
7. `release: bump to v1.13.0 and add changelog entry`
