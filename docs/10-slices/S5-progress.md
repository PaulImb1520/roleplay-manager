# S5 — Regenerar, Editar, Retroceder, Eliminar, Continuar + Ciclaje de alternativas

**Estado:** completado.

## Objetivo
Implementar las acciones de mensaje faltantes en el chat: regenerar respuesta, editar mensaje, retroceder conversación, eliminar mensaje, continuar conversación, y ciclo de alternativas (navegación entre versiones regeneradas).

## Decisiones clave
- **EditMessage** puro: solo actualiza `content` + `editedAt`, sin regenerar, sin tocar `alternatives`.
- **Rewind** descarta `MemoryChangeProposal` pendientes en el mismo slice.
- **ContinueConversation** es un caso de uso nuevo con endpoint SSE propio (`POST /api/conversations/:id/continue`).
- **Ciclador** con cursor persistido en BD (`alternatives_cursor`). Botones `←`/`→` con indicador `2/3`. La versión mostrada se consolida al enviar o continuar.
- **DeleteMessage** elimina el mensaje y reasigna posiciones. No permite borrar el greeting.
- **Alternatives**: se almacenan en `alternatives[]` como historial cronológico (más reciente primero). El cursor indica qué índice se muestra.

## Cambios en schema
- `messages` tabla: añadido `alternatives_cursor integer DEFAULT 0 NOT NULL`

## Nuevos endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| PATCH | `/api/conversations/:id/messages/:messageId` | Editar mensaje |
| DELETE | `/api/conversations/:id/messages/:messageId` | Eliminar mensaje |
| POST | `/api/conversations/:id/messages/:messageId/regenerate` | Regenerar (SSE) |
| POST | `/api/conversations/:id/rewind` | Retroceder |
| POST | `/api/conversations/:id/continue` | Continuar (SSE) |
| POST | `/api/conversations/:id/messages/:messageId/cycle` | Ciclar alternativa |

## Nuevos archivos backend
- `application/use-cases/conversation/edit-message.use-case.ts`
- `application/use-cases/conversation/delete-message.use-case.ts`
- `application/use-cases/conversation/regenerate-reply.use-case.ts`
- `application/use-cases/conversation/rewind-conversation.use-case.ts`
- `application/use-cases/conversation/continue-conversation.use-case.ts`
- `application/use-cases/conversation/cycle-alternative.use-case.ts`
- `domain/ports/memory-change-proposal.repository.ts`
- `infrastructure/.../drizzle-memory-change-proposal.repository.ts`

## Cambios frontend
- `chat.store.ts`: replaceMessage, removeMessage, truncateAfter, startEditing
- `message.tsx`: botones Editar/Regenerar/Retroceder/Ciclar/Eliminar, editor inline
- `message-input.tsx`: botón Continue (cuando textarea vacío) / Send (cuando hay texto)
- `chat.tsx`: handlers de edición, regeneración, ciclo, rewind-dialog, delete-dialog
- `conversations.ts`: nuevas funciones API + refactor SSE a `streamEventSource`

## Migración
- `0002_add_alternatives_cursor.sql`: nueva columna en `messages`
