# S10 — Auto-degradación de memorias

**Estado:** pendiente (diseño completo, listo para implementar).
**Inicio previsto:** 2026-07-31.

## Objetivo

Añadir un mecanismo programado para eliminar automáticamente memorias dinámicas que hayan perdido relevancia narrativa, liberando espacio en la memoria dinámica sin requerir intervención del usuario ni del asistente.

## Decisiones clave

- **Escala de prioridad**: entero 1..10 (ya existente en la entidad `Memory`). Valor por defecto al crear: 5.
- **Umbral de importancia** (`priorityThreshold`): entero 1..10, por defecto **3**. Las memorias con `priority <= threshold` se **excluyen del prompt** enviado al modelo. Esta exclusión es una función independiente de la degradación y **permanece activa siempre** (no se puede desactivar; solo se configura el umbral).
- **Modo de degradación por conversación** (`memoryDecayMode`): `"silent" | "manual" | "off"`, por defecto **`"silent"`**. Cada conversación ajusta su configuración localmente.
  - `silent` — el barrido se ejecuta automáticamente al final de `send-message`, sin intervención del usuario.
  - `manual` — las memorias candidatas solo se eliminan cuando el usuario lo solicita (botón "Ejecutar limpieza" o endpoint).
  - `off` — **degradación desactivada**: no se elimina ninguna memoria automática ni manualmente. La exclusión del prompt (por umbral) sigue activa.
- **Regla de candidatura a eliminación** (AND):
  1. `priority <= priorityThreshold`.
  2. No actualizada en los últimos `ageThreshold` mensajes (por defecto **30**): `updatedAt` anterior al `createdAt` del mensaje N-ésimo más reciente (el mensaje en la posición `totalMessages - ageThreshold`).
- **Sin degradación gradual**: no se baja la prioridad progresivamente; solo se elimina. Evita el problema de que `Memory.update()` refresca `updatedAt` (imposibilitaría calcular la antigüedad).
- **Límite por barrido**: máximo 100 memorias eliminadas por ejecución, las de menor prioridad primero. El resto sobrevive hasta el siguiente turno.
- **Transaccional**: el barrido se ejecuta en una transacción Drizzle. Si falla, la conversación queda intacta.
- **Solo memorias dinámicas**: la degradación no afecta a propuestas de cambio (`memory_change_proposals`) ni a otro recurso.
- **Filtro en todas las rutas de generación**: la exclusión por umbral se aplica en `send-message`, `continue-conversation`, `regenerate-reply` y `generate-summary` (hoy no existe ningún filtro; hay que añadirlo).

## Sub-slices

- **S10.a — Configuración por conversación**: 3 columnas nuevas en `conversations` (`memoryDecayMode`, `memoryDecayThreshold`, `memoryDecayAgeThreshold`) + campos en la entidad `Conversation` con mutators (`withMemoryDecayMode`, `withMemoryDecayThreshold`, `withMemoryDecayAgeThreshold`) + defaults en `create-conversation` + mapping en `DrizzleConversationRepository` + DTO/schema de `update-conversation-settings` + route.
- **S10.b — Filtro de prompt por umbral**: helper de aplicación que filtra `Memory[]` con `priority <= threshold`, aplicado en los 4 use cases de generación (send, continue, regenerate, summary).
- **S10.c — Use case de barrido**: `DecayConversationMemoryUseCase` que recibe `(conversationId, overrides?)` y devuelve `{ deleted: number }`. Orquesta `ConversationRepository`, `MemoryRepository` (find + delete) y `MessageRepository` (para el cutoff de antigüedad).
- **S10.d — Hook en `send-message`**: tras el bloque de auto-aplicación de propuestas (después de la línea 359), si `memoryDecayMode === "silent"`, ejecutar el barrido.
- **S10.e — Endpoint manual**: `POST /api/conversations/:id/memory/decay` para modo `manual`. Devuelve `{ deleted: number }`.
- **S10.f — Frontend**: sección "Memoria dinámica" en el panel de ajustes de la conversación (modo silent/manual/off, umbral 1–10, edad en mensajes) + botón "Ejecutar limpieza ahora" + refresco automático de la lista de memorias tras el barrido + badge de última limpieza en `MemoryViewer`.

## Cambios en schema (Drizzle)

Migración `0006` — columnas nuevas en `conversations`:

```ts
memoryDecayMode: text("memory_decay_mode", { enum: ["silent", "manual", "off"] })
  .notNull()
  .default("silent"),
memoryDecayThreshold: integer("memory_decay_threshold").notNull().default(3),
memoryDecayAgeThreshold: integer("memory_decay_age_threshold").notNull().default(30),
```

## Nuevos endpoints

- `POST /api/conversations/:id/memory/decay` — barrido manual. Respuesta: `{ deleted: number }`. Si el modo es `"off"`, devuelve `{ deleted: 0 }`.
- `PATCH /api/conversations/:id/settings` — se extiende con `memoryDecayMode`, `memoryDecayThreshold`, `memoryDecayAgeThreshold` (opcionales).

## Cambios frontend

- `lib/api/memories.ts`: añadir `decayConversation(conversationId)`.
- `lib/api/conversations.ts`: extender `updateConversationSettings` con los campos nuevos.
- `components/conversation/settings-panel.tsx`: nueva sección "Memoria dinámica" (select de modo, input umbral 1–10, input edad ≥ 1, botón "Ejecutar limpieza ahora").
- `components/memory/memory-viewer.tsx`: refrescar la lista automáticamente tras el barrido + badge "Última limpieza: hace N mensajes (X eliminadas)".
- `lib/stores/memory.store.ts`: acción `runDecay()` que llama a la API y refresca.

## Pendientes resueltos (2026-07-31)

1. **¿Modo silent/manual por conversación o global?** — Por conversación. El modo por defecto es `silent` y cada chat ajusta su configuración localmente (settings panel de la conversación).
2. **¿Comportamiento en modo manual?** — El usuario es responsable de ejecutar la limpieza. **Importante**: la exclusión de memorias con `priority <= threshold` del prompt se mantiene activa en todos los modos; el modo solo controla la *eliminación*, nunca el filtrado.
3. **¿Refresco del MemoryViewer tras el barrido?** — Sí, la lista se refresca automáticamente después de cualquier ejecución del barrido (automática o manual).
4. **¿Toggle para desactivar la degradación?** — Sí: modo `"off"`. Desactiva solo la eliminación; el filtrado del prompt por umbral sigue activo.
5. **¿Umbral por defecto?** — 3: se descartan (del prompt y como candidatas a eliminación) las memorias con importancia ≤ 3. La escala es 1..10 (ya existente).
6. **¿i18n de los strings nuevos?** — Se pospone a PM.11 (multi-idioma).

## Criterios de aceptación de S10

- [ ] `DecayConversationMemoryUseCase` elimina memorias con `priority <= threshold` Y no actualizadas en los últimos `ageThreshold` mensajes (cutoff = createdAt del mensaje N-ésimo más reciente).
- [ ] El barrido automático se ejecuta al final de `send-message` solo cuando `memoryDecayMode === "silent"`.
- [ ] Modo `"manual"`: solo se elimina vía endpoint/botón. Modo `"off"`: nunca se elimina.
- [ ] El filtro de prompt excluye memorias con `priority <= threshold` en send, continue, regenerate y summary, en todos los modos.
- [ ] El endpoint `POST /api/conversations/:id/memory/decay` devuelve el conteo correcto.
- [ ] La UI permite ajustar modo, umbral (1–10) y edad (≥ 1) por conversación.
- [ ] `MemoryViewer` se refresca automáticamente tras el barrido y muestra la última limpieza.
- [ ] Tests: use case del barrido (criterios, límite 100, límites de escala, transaccionalidad).
- [ ] `pnpm check` y `pnpm --filter @workspace/backend test` pasan.
- [ ] Versión bumped a `1.1.0` con entrada en `CHANGELOG.md`.
