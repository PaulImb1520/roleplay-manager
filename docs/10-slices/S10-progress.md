# S10 — Auto-degradación de memorias

**Estado:** pendiente.
**Inicio previsto:** 2026-07-31.

## Objetivo

Añadir un mecanismo programado para eliminar automáticamente memorias dinámicas que hayan perdido relevancia narrativa, liberando espacio en la memoria dinámica sin requerir intervención del usuario ni del asistente.

## Decisiones clave

- **Trigger**: el barrido se ejecuta al final del use case `send-message` (después de persistir la respuesta del asistente). No se introduce una tarea programada externa; basta con barrer tras cada turno.
- **Modo por defecto**: silencioso. El usuario no es interrumpido; las memorias que cumplen el criterio se eliminan sin mostrar un diálogo. Un toggle en el panel de ajustes permite cambiar a modo "manual" (solo se eliminan cuando el usuario pulsa un botón).
- **Reglas configurables** (por conversación, almacenadas en el DTO de configuración):
  - `priorityFloor` (0..1, por defecto `0.3`): prioridad mínima para sobrevivir al barrido. Memorias con `priority < floor` son candidatas.
  - `ageThreshold` (entero, mensajes, por defecto `30`): número de mensajes desde la última actualización de la memoria. Memorias no actualizadas en los últimos N mensajes son candidatas.
  - Ambas condiciones deben cumplirse (AND) para que la memoria se elimine.
- **Alcance**: solo memorias dinámicas (`memoryMode === "auto"` o `"manual"`). No afecta a memorias estáticas del personaje.
- **Sin cambios de schema**: el barrido no requiere columnas nuevas. La prioridad y la fecha de actualización ya están en la tabla de memorias (`priority`, `updatedAt`).
- **Transaccional**: el barrido se ejecuta dentro de una transacción Drizzle. Si falla, la conversación queda como estaba.
- **Límite de borrado por barrido**: como salvaguarda, máximo 100 memorias por barrido. Si hay más candidatas, se eliminan las 100 de menor `priority` y el resto sobrevive hasta el siguiente turno.

## Sub-slices

- **S10.a — Configuración**: añadir `MemoryDecayConfig` (value object) + columna en el JSON de configuración de la conversación. Default: `{ priorityFloor: 0.3, ageThreshold: 30, mode: "silent" }`.
- **S10.b — Use case de barrido**: `DecayConversationMemoryUseCase` que recibe `(conversationId, config)` y devuelve `{ deleted: number }`. Recibe `MemoryRepository` y `ConversationRepository` por puerto.
- **S10.c — Hook en `send-message`**: tras persistir la respuesta, llamar al use case de barrido si la conversación tiene `memoryMode !== "off"`.
- **S10.d — Endpoint manual**: `POST /api/conversations/:id/memory/decay` para el modo "manual". Devuelve `{ deleted: number }`.
- **S10.e — UI de configuración**: nueva sección "Memoria dinámica" en `SettingsPanel` con slider de prioridad (0–1), input numérico de edad, toggle de modo (silent/manual), y botón "Ejecutar limpieza ahora".
- **S10.f — Indicador de última limpieza**: badge en `MemoryViewer` con "Última limpieza: hace N mensajes (X memorias eliminadas)".

## Cambios en schema (Drizzle)

Sin cambios. La tabla `memories` ya tiene `priority` y `updatedAt`; la tabla `conversations` ya tiene `settings` (JSON) donde se guarda la configuración.

## Nuevos endpoints

- `POST /api/conversations/:id/memory/decay` — barrido manual. Body: opcional `{ priorityFloor?, ageThreshold? }` (si se omite, usa la configuración de la conversación). Respuesta: `{ deleted: number }`.

## Cambios frontend

- `lib/api/memories.ts`: añadir `decayConversation(conversationId, overrides?)`.
- `lib/api/conversations.ts`: añadir `updateMemoryDecayConfig(conversationId, config)`.
- `components/settings/memory-settings.tsx` (nuevo): formulario de configuración de barrido.
- `components/settings/settings-panel.tsx`: incluir la nueva sección.
- `components/memory/memory-viewer.tsx`: badge de "última limpieza".
- `lib/stores/memory.store.ts`: acción `runDecay()`.

## Pendientes

- [ ] Decidir si el toggle de modo (silent/manual) se almacena en la conversación o en un setting global. (Decisión provisional: por conversación, igual que `memoryMode`.)
- [ ] Definir el comportamiento cuando el modo es "manual" y el usuario no ha ejecutado la limpieza en N mensajes: ¿se acumula basura? (Decisión provisional: sí, el usuario es responsable. El badge en `MemoryViewer` indica cuántas candidatas hay.)
- [ ] Validar la interacción con el `MemoryViewer`: tras el barrido, refrescar la lista automáticamente.
- [ ] Localización de los strings nuevos (i18n se pospone a PM.11).

## Criterios de aceptación de S10

- [ ] `DecayConversationMemoryUseCase` elimina memorias con `priority < floor` Y `messagesSinceUpdate >= ageThreshold`.
- [ ] El barrido automático se ejecuta al final de `send-message` cuando `memoryMode !== "off"`.
- [ ] El endpoint `POST /api/conversations/:id/memory/decay` funciona y devuelve el conteo correcto.
- [ ] La UI de configuración permite ajustar `priorityFloor` y `ageThreshold`.
- [ ] El badge en `MemoryViewer` muestra la última limpieza y el conteo.
- [ ] Tests: use case del barrido (criterios, casos límite, transaccionalidad).
- [ ] `pnpm check` y `pnpm --filter @workspace/backend test` pasan.
- [ ] Versión bumped a `1.1.0` con entrada en `CHANGELOG.md`.
