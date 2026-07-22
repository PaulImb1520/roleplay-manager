# S4 — Editar personaje + cargar conversación (completado)

**Estado:** completado en commits anteriores.

## Objetivo
- Implementar edición de personaje con detección de cambios y snapshot.
- Cargar conversación existente con mensajes.
- UI de scroll para tarjetas y formulario de personaje.

## Decisiones clave
- `hasChanges()` compara snapshots normalizados (subtitle/instructions null vs undefined).
- Scroll de tarjetas usa `div nativo` con `max-h-96 overflow-y-auto` en lugar de `ScrollArea` de base-ui.
- Botón "Guardar cambios" se deshabilita con `disabled={saving || (isEditing && !dirty)}`.

## Archivos relevantes
- `character-form-utils.ts` (buildSnapshot, hasChanges)
- `use-character-form.ts` (hook del formulario)
- `character-form.tsx` (componente)
- `character-form-utils.test.ts` (24 tests)

## Pendientes (cubiertos en S5)
- Ninguno; S4 queda cerrado.
