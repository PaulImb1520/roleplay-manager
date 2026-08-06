# S14 — Rediseño responsive del panel de configuración (Sheet → DropdownMenu)

**Estado:** En progreso
**Inicio:** 2026-08-06

## Descripción

El panel de configuración del chat usa un `Sheet` lateral con tres tabs (Historia
/ Modelo / Personalización). Con tres tabs, el `TabsList` deja de caber y el texto
se rompe en pantallas de teléfono pequeñas. Se reemplaza el `Sheet` por un
`DropdownMenu` con las mismas tres opciones; cada opción abre un `Dialog`
dedicado, con espacio suficiente para mostrar su contenido y responsive en todo
momento.

## Decisions

- **Trigger:** se mantiene el mismo botón (solo el ícono de engranaje, icon-only)
  que hoy lanza el `Sheet`; al pulsarlo se abre un `DropdownMenu`.
- **Menú:** tres items — Historia, Modelo, Personalización — que llaman a los
  del `TabsList` actual.
- **Cada opción abre su propio `Dialog`** con el contenido que hoy vive en su tab:
  - **Historia del chat:** `Accordion` con modo de memorias, propuestas,
    resúmenes, auto-degradación y memoria dinámica. Incluye footer
    "Restablecer valores" / "Aplicar cambios" para los campos de resumen
    (`summaryFrequency`, `recentMessageCount`). Las memorias/propuestas/decay
    siguen guardando al vuelo.
  - **Modelo:** `ModelSelector` + `InferenceParamsCard` + footer
    "Restablecer valores" / "Aplicar cambios" (parámetros de inferencia).
  - **Personalización:** `CustomizationTab` (guarda solo, sin footer).
- **Ancho de dialogs:** `max-w-lg` para todos (de momento). Contenido con
  `max-h-[90vh] overflow-y-auto` para pantallas bajas.
- **Persistencia:** se elimina la persistencia de "última pestaña"
  (`settings-tab`). Se conserva la de items abiertos del `Accordion`
  (`settings-accordion`), pero el default pasa de `["mode", "memories"]` a `[]`
  (todo cerrado).
- **Títulos de dialogs alineados al menú:** "Historia del chat", "Modelo" y
  "Personalización".
- **Un solo `onSettingsChanged`** en el parent `SettingsPanel`; cada dialog lo
  llama con el `ConversationDetail` actualizado que devuelve el servidor tras
  guardar. La API pública del componente no cambia.
- **Restablecer es por-dialog:** en Historia restablece los campos de resumen;
  en Modelo restablece los parámetros de inferencia. Ambos pasan por el dialog
  de confirmación cuando hay cambios sin guardar.
- **Nueva primitiva UI:** `DropdownMenu` añadido a `@workspace/ui` (Base UI
  `Menu`, vía shadcn CLI).

## Commits

1. `docs(plan): add S14 plan for settings panel responsive redesign`
2. `feat(ui): add DropdownMenu primitive from shadcn`
3. `refactor(frontend): split SettingsPanel into DropdownMenu + three dialogs`
4. `test(frontend): cover SettingsPanel dropdown menu and dialogs`
5. `release: bump to v1.5.0 and add changelog entry`