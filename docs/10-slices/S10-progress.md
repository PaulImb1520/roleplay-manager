# S10 — Auto-degradación de memorias

**Estado:** pendiente (diseño completo, listo para implementar).
**Inicio previsto:** 2026-07-31.

## Objetivo

Añadir un mecanismo programado para eliminar automáticamente memorias dinámicas que hayan perdido relevancia narrativa, liberando espacio en la memoria dinámica sin requerir intervención del usuario ni del asistente.

## Decisiones clave

- **Escala de prioridad**: entero 1..10 (ya existente en la entidad `Memory`). Valor por defecto al crear: 5.
- **Decadencia gradual (computed decay)**: las memorias pierden **-1 de prioridad cada `decaySpeed` turnos** sin ser actualizadas. La prioridad efectiva se **calcula en lectura** (`effectivePriority = max(1, priority - floor(turnsSinceUpdate / decaySpeed))`), no se persiste — evita el problema de que `Memory.update()` refresca `updatedAt` y evita escrituras por turno.
- **Umbral de importancia** (`memoryDecayThreshold`): entero 1..10, por defecto **3**. Las memorias con `effectivePriority <= threshold` se **excluyen del prompt** enviado al modelo. Esta exclusión es una función independiente de la degradación y **permanece activa siempre** (no se puede desactivar; solo se configura el umbral).
- **Modo de degradación por conversación** (`memoryDecayMode`): `"silent" | "manual" | "off"`, por defecto **`"silent"`**. Cada conversación ajusta su configuración localmente.
  - `silent` — el barrido se ejecuta automáticamente al final de `send-message`, sin intervención del usuario. Las memorias por debajo del umbral se eliminan cuando llevan `memoryDecayAgeThreshold` turnos (configurable) sin actualizarse.
  - `manual` — el usuario decide: botón "Ejecutar limpieza" que elimina **todas** las memorias candidatas, o eliminar individualmente las que considere necesarias (borrado individual ya existente).
  - `off` — **degradación desactivada**: no se elimina ninguna memoria automática ni manualmente. La exclusión del prompt (por umbral) sigue activa.
- **Regla de candidatura a eliminación** (AND):
  1. `effectivePriority <= memoryDecayThreshold`.
  2. `turnsSinceUpdate >= memoryDecayAgeThreshold` (por defecto **30** turnos). `turnsSinceUpdate` = número de mensajes posteriores a `memory.updatedAt`.
- **Configuración por conversación** (4 valores):
  - `memoryDecayMode` — `"silent" | "manual" | "off"` (default `"silent"`).
  - `memoryDecayThreshold` — 1..10 (default **3**).
  - `memoryDecayAgeThreshold` — turnos antes de borrar bajo el umbral en modo silencioso (default **30**).
  - `memoryDecaySpeed` — turnos por -1 de prioridad (default **10**). A menor valor, las memorias pierden importancia más rápido y caen antes bajo el umbral; a mayor valor, duran más.
- **Límite por barrido**: máximo 100 memorias eliminadas por ejecución, las de menor prioridad efectiva primero. El resto sobrevive hasta el siguiente turno.
- **Best-effort, idempotente**: el barrido elimina candidatas una a una. Si falla una eliminación, el resto sobrevive hasta el siguiente turno (el barrido es idempotente, sin efectos parciales dañinos).
- **Solo memorias dinámicas**: la degradación no afecta a propuestas de cambio (`memory_change_proposals`) ni a otro recurso.
- **Filtro en todas las rutas de generación**: la exclusión por umbral se aplica en `send-message`, `continue-conversation`, `regenerate-reply` y `generate-summary` (hoy no existe ningún filtro; hay que añadirlo).

## Sub-slices

- **S10.a — Configuración por conversación**: 4 columnas nuevas en `conversations` (`memoryDecayMode`, `memoryDecayThreshold`, `memoryDecayAgeThreshold`, `memoryDecaySpeed`) + campos en la entidad `Conversation` con mutators + defaults en `create-conversation` + mapping en `DrizzleConversationRepository` + DTO/schema de `update-conversation-settings` + route.
- **S10.b — Filtro de prompt por umbral**: `MemoryDecayPolicy` (value object en domain) que calcula la prioridad efectiva y decide exclusión/candidatura. Aplicado en los 4 use cases de generación (send, continue, regenerate, summary).
- **S10.c — Use case de barrido**: `DecayConversationMemoryUseCase` que recibe `(conversationId, manual?)` y devuelve `{ deleted: number }`. Orquesta `ConversationRepository`, `MemoryRepository` (find + delete) y `MessageRepository` (turnos desde la última actualización).
- **S10.d — Hook en `send-message`**: tras el bloque de auto-aplicación de propuestas (después de la línea 359), si `memoryDecayMode === "silent"`, ejecutar el barrido.
- **S10.e — Endpoint manual**: `POST /api/conversations/:id/memory/decay` para modo `manual`. Devuelve `{ deleted: number }`.
- **S10.f — Frontend**: sección "Memoria dinámica" en el panel de ajustes de la conversación (modo silent/manual/off, umbral 1–10, turnos para borrar, turnos por -1 de prioridad) + botón "Ejecutar limpieza ahora" (elimina todas las candidatas) + refresco automático de la lista de memorias tras el barrido + badge de última limpieza en `MemoryViewer`.

## Cambios en schema (Drizzle)

Migración `0006` — columnas nuevas en `conversations`:

```ts
memoryDecayMode: text("memory_decay_mode", { enum: ["silent", "manual", "off"] })
  .notNull()
  .default("silent"),
memoryDecayThreshold: integer("memory_decay_threshold").notNull().default(3),
memoryDecayAgeThreshold: integer("memory_decay_age_threshold").notNull().default(30),
memoryDecaySpeed: integer("memory_decay_speed").notNull().default(10),
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
2. **¿Comportamiento en modo manual?** — El usuario es responsable: botón "Ejecutar limpieza" que elimina todas las candidatas, o borrado individual de las que considere necesarias. **Importante**: la exclusión de memorias bajo el umbral del prompt se mantiene activa en todos los modos; el modo solo controla la *eliminación*, nunca el filtrado.
3. **¿Refresco del MemoryViewer tras el barrido?** — Sí, la lista se refresca automáticamente después de cualquier ejecución del barrido (automática o manual).
4. **¿Toggle para desactivar la degradación?** — Sí: modo `"off"`. Desactiva solo la eliminación; el filtrado del prompt por umbral sigue activo.
5. **¿Umbral por defecto?** — 3: se descartan (del prompt y como candidatas a eliminación) las memorias con importancia ≤ 3. La escala es 1..10 (ya existente).
6. **¿Velocidad de decadencia?** — Configurable: `memoryDecaySpeed` (turnos por -1 de prioridad, default 10). La prioridad efectiva se calcula en lectura.
7. **¿Turnos antes de borrar bajo el umbral en modo silencioso?** — Configurable: `memoryDecayAgeThreshold` (default 30 turnos).
8. **¿i18n de los strings nuevos?** — Se pospone a PM.11 (multi-idioma).

## Criterios de aceptación de S10

- [ ] `DecayConversationMemoryUseCase` elimina memorias con `effectivePriority <= threshold` Y `turnsSinceUpdate >= ageThreshold` (máximo 100 por barrido, menor prioridad efectiva primero).
- [ ] `effectivePriority` se calcula con `max(1, priority - floor(turnsSinceUpdate / decaySpeed))`.
- [ ] El barrido automático se ejecuta al final de `send-message` solo cuando `memoryDecayMode === "silent"`.
- [ ] Modo `"manual"`: solo se elimina vía endpoint/botón (todas las candidatas) o individualmente. Modo `"off"`: nunca se elimina.
- [ ] El filtro de prompt excluye memorias con `effectivePriority <= threshold` en send, continue, regenerate y summary, en todos los modos.
- [ ] El endpoint `POST /api/conversations/:id/memory/decay` devuelve el conteo correcto.
- [ ] La UI permite ajustar modo, umbral (1–10), turnos para borrar (≥ 1) y turnos por -1 de prioridad (≥ 1) por conversación.
- [ ] `MemoryViewer` se refresca automáticamente tras el barrido y muestra la última limpieza.
- [ ] Tests: policy (prioridad efectiva, exclusión, candidatura, límites) y use case del barrido (criterios, límite 100, modos).
- [ ] `pnpm check` y `pnpm --filter @workspace/backend test` pasan.
- [ ] Versión bumped a `1.1.0` con entrada en `CHANGELOG.md`.
