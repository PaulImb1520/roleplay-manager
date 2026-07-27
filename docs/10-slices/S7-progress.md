# S7 — Resúmenes (Synopsis)

**Estado:** ✅ Completo  
**Inicio:** 2026-07-27  
**Fin:** 2026-07-27  

## Decisiones de diseño

| Aspecto | Decisión |
|---|---|
| **Umbral automático** | Contar mensajes desde `lastMessageId` del último summary; si ≥ `summaryFrequency`, generar |
| **Generación manual** | `POST /conversations/:id/summaries/generate` + botón "Generar resumen ahora" en viewer |
| **PromptContextBuilder** | Incluye `summary` siempre que exista (sección `## Resumen de la conversación`) |
| **`summaryFrequency` mínimo** | 10 (validación Zod en PATCH /settings) |
| **SSE** | Nuevo evento `summary-generated` emitido tras auto-generación |
| **Badge en header** | Contador de resúmenes junto al título del chat |
| **GenerateConversationTitle** | Diferido a S8 |
| **targetMemoryId** | Revertido; se mueve a S10 auto-delete |

## Archivos creados

### Shared
- `packages/shared/src/types/summary.ts` — DTOs (`SummaryDTO`, `UpdateSummaryInput`, `ListSummariesOutput`)

### Backend — Domain
- `packages/backend/src/domain/entities/summary.entity.ts` — entidad con invariantes (`content` no vacío), `withContent()`, `reconstruct()`
- `packages/backend/src/domain/ports/summary.repository.ts` — reemplazado stub por interface (`findById`, `findByConversationId`, `findLatestByConversationId`, `create`, `update`, `deleteById`)

### Backend — Infrastructure
- `packages/backend/src/infrastructure/adapters/secondary/drizzle/repositories/drizzle-summary.repository.ts` — implementación Drizzle

### Backend — Use Cases
- `packages/backend/src/application/use-cases/summary/generate-summary.use-case.ts`
- `packages/backend/src/application/use-cases/summary/update-summary.use-case.ts`
- `packages/backend/src/application/use-cases/summary/delete-summary.use-case.ts`
- `packages/backend/src/application/use-cases/summary/list-summaries.use-case.ts`

### Backend — Tests
- `packages/backend/src/application/use-cases/summary/generate-summary.use-case.test.ts` — 4 tests
- `packages/backend/src/application/use-cases/summary/update-summary.use-case.test.ts` — 3 tests
- `packages/backend/src/application/use-cases/summary/delete-summary.use-case.test.ts` — 3 tests
- `packages/backend/src/application/use-cases/summary/list-summaries.use-case.test.ts` — 2 tests

### Backend — Routes
- `packages/backend/src/infrastructure/adapters/primary/routes/summary.routes.ts` — GET/POST(generate)/PUT/DELETE

### Frontend
- `packages/frontend/src/lib/api/summaries.ts` — API client
- `packages/frontend/src/lib/stores/summary.store.ts` — Zustand store
- `packages/frontend/src/components/summary/summary-viewer.tsx` — componente de visualización/edición/eliminación

## Archivos modificados

- `packages/backend/src/domain/ports/prompt-context-builder.ts` — añadido `summary?: Summary` param
- `packages/backend/src/infrastructure/adapters/secondary/prompt-context-builder/prompt-context-builder.impl.ts` — inyecta resumen en system prompt
- `packages/backend/src/application/use-cases/conversation/send-message.use-case.ts` — inyecta SummaryRepository + GenerateSummary; pasa summary al builder; genera al alcanzar umbral; emite evento `summary-generated`
- `packages/backend/src/application/use-cases/conversation/regenerate-reply.use-case.ts` — mismo cambio
- `packages/backend/src/application/use-cases/conversation/continue-conversation.use-case.ts` — mismo cambio
- `packages/backend/src/containers/app-container.ts` — registro de DrizzleSummaryRepository + 4 use cases
- `packages/backend/src/infrastructure/adapters/primary/server.ts` — montaje de summaryRouter
- `packages/backend/src/infrastructure/adapters/primary/routes/conversation.routes.ts` — `summaryFrequency` ahora `min(10)`; manejo de evento `summary-generated` en SSE
- `packages/frontend/src/lib/api/conversations.ts` — añadido `onSummaryGenerated` a `SendMessageCallbacks`
- `packages/frontend/src/components/conversation/chat.tsx` — badge de resúmenes en header; carga de summaries al iniciar y tras cada interacción
- `packages/frontend/src/components/conversation/settings-panel.tsx` — nuevo `AccordionItem` "Resúmenes" con `SummaryViewer`

## Estado de tests

- **Total backend tests:** 166 (32 test files)
- **Tests nuevos:** 12 (4 use cases)
- **Nuevos test files:** 4
- **Typecheck:** ✅ pasa en todos los paquetes

## Pendiente para S8

- Cadena `GenerateSummary → GenerateConversationTitle`
