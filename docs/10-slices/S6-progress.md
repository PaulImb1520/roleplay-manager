# S6 — Memoria dinámica con modos Auto/Manual

**Estado:** en progreso (S6.1 activo).

## Objetivo
Implementar memoria dinámica persistente por conversación con dos modos de gestión de propuestas: `auto` (el sistema acepta automáticamente las propuestas del LLM) y `manual` (el usuario revisa y decide cada propuesta). El usuario siempre puede crear/editar/eliminar memorias manualmente, independientemente del modo.

## Decisiones clave
- **memoryProposalMode**: per-conversation, columna en `conversations`, default `auto`.
- **Modo auto**: propuestas generadas por LLM → auto-aceptadas (`processedBy: 'system'`) tras cada mensaje.
- **Modo manual**: propuestas quedan `pending` para que el usuario las revise y decida.
- **Formato de propuestas**: bloque delimitado en la respuesta del LLM: `` ```memory_proposals [...] ``` ``.
- **UI**: 3 secciones en Accordion (multiple) en pestaña "historia" del SettingsPanel.
- **ChoiceCard**: se usa `RadioGroup` (no `Switch`) para el selector auto/manual por ser mutuamente excluyente.
- **Parser tolerante**: si el JSON del bloque está malformado, se descartan propuestas inválidas individualmente; no se aborta el flujo.
- **Props inválidas**: incluso si el LLM genera propuestas inválidas, se persisten como `pending` (con operation 'CREATE' por defecto) para que el usuario las vea en modo manual.

## Sub-slices

### S6.1 — Backend: Data Layer (activo)
Schema, entidades de dominio, puertos (repositorios), implementación Drizzle, tipos compartidos.

**Archivos a crear/modificar:**
- `packages/backend/src/infrastructure/.../schema/conversations.schema.ts` — añadir `memoryProposalMode`
- `packages/backend/src/domain/entities/memory.entity.ts`
- `packages/backend/src/domain/entities/memory-change-proposal.entity.ts`
- `packages/backend/src/domain/ports/memory.repository.ts` — completar interfaz
- `packages/backend/src/domain/ports/memory-change-proposal.repository.ts` — completar interfaz
- `packages/backend/src/infrastructure/.../drizzle-memory.repository.ts`
- `packages/backend/src/infrastructure/.../drizzle-memory-change-proposal.repository.ts`
- `packages/shared/src/types/memory.ts`
- `packages/shared/src/types/memory-change-proposal.ts`
- `packages/shared/src/types/conversation.ts` — añadir `memoryProposalMode`
- `packages/backend/src/domain/entities/conversation.entity.ts` — añadir `memoryProposalMode`

**Migración:** añadir columna `memory_proposal_mode text NOT NULL DEFAULT 'auto'`

### S6.2 — Backend: Business Logic
Casos de uso de memoria, modificación de PromptContextBuilder, integración en SendMessage, controladores y rutas.

**Archivos a crear:**
- `packages/backend/src/application/use-cases/memory/propose-memory-changes.use-case.ts`
- `packages/backend/src/application/use-cases/memory/apply-memory-changes.use-case.ts`
- `packages/backend/src/application/use-cases/memory/apply-all-memory-changes.use-case.ts`
- `packages/backend/src/application/use-cases/memory/create-memory.use-case.ts`
- `packages/backend/src/application/use-cases/memory/update-memory.use-case.ts`
- `packages/backend/src/application/use-cases/memory/delete-memory.use-case.ts`
- `packages/backend/src/application/use-cases/memory/list-memories.use-case.ts`
- `packages/backend/src/application/use-cases/memory/list-proposals.use-case.ts`
- `packages/backend/src/infrastructure/.../memory.routes.ts`

**Archivos a modificar:**
- `packages/backend/src/infrastructure/.../prompt-context-builder.impl.ts` — añadir instrucción del bloque
- `packages/backend/src/application/use-cases/conversation/send-message.use-case.ts` — invocar Propose+Apply según modo
- `packages/backend/src/infrastructure/.../conversation.routes.ts` — añadir `memoryProposalMode` a PATCH settings
- `packages/backend/src/application/di.container.ts` — registrar nuevos casos de uso y repos

### S6.3 — Frontend
Cliente API, store, componentes UI necesarios, componentes de memoria, integración en SettingsPanel.

**Archivos a crear:**
- `packages/frontend/src/lib/api/memories.ts`
- `packages/frontend/src/lib/stores/memory.store.ts`
- `packages/frontend/src/components/memory/memory-mode-card.tsx`
- `packages/frontend/src/components/memory/proposal-list.tsx`
- `packages/frontend/src/components/memory/memory-list.tsx`

**Archivos a modificar:**
- `packages/frontend/src/components/conversation/settings-panel.tsx` — reemplazar Empty por Accordion
- `packages/ui/src/components/` — añadir `radio-group.tsx`, `accordion.tsx`

## Cambios en schema (Drizzle)
- `conversations`: añadir `memoryProposalMode text NOT NULL DEFAULT 'auto'`

## Nuevos endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/conversations/:id/memories` | Listar memorias activas |
| POST | `/api/conversations/:id/memories` | Crear memoria manual |
| PUT | `/api/conversations/:id/memories/:memoryId` | Editar memoria |
| DELETE | `/api/conversations/:id/memories/:memoryId` | Eliminar memoria |
| GET | `/api/conversations/:id/memories/proposals` | Listar propuestas |
| POST | `/api/conversations/:id/memories/proposals/apply` | Aplicar/descartar propuestas selectivamente |
| POST | `/api/conversations/:id/memories/proposals/apply-all` | Aceptar todas las pendientes |

## Cambios frontend
- `memory-mode-card.tsx`: ChoiceCard con RadioGroup auto/manual, conectado a `updateConversationSettings`
- `proposal-list.tsx`: lista de propuestas con acciones Aceptar/Editar/Descartar + "Aceptar todo"
- `memory-list.tsx`: lista de memorias con CRUD (Crear/Editar/Eliminar)
- `settings-panel.tsx`: reemplazar "Próximamente" por Accordion con las 3 secciones

## Pendientes para slices futuros
- **Indicador de propuestas pendientes en botón de Settings**: mostrar badge en el engranaje si hay propuestas sin revisar en modo manual. Se implementará en un slice posterior de UX.
- **Tests unitarios**: los casos de uso de memoria deben tener tests siguiendo el patrón existente. Pendiente para un slice de testing.
- **Parser de bloque memory_proposals más robusto**: si el LLM varía el formato, mejorar el parser. Pendiente para iteración de robustez.
