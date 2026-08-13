# S16 — Ramas de conversación desde un mensaje (PM.7)

**Estado:** Completado
**Inicio:** 2026-08-12
**Fin:** 2026-08-12

## Descripción

PM.7 propone "story branches in a single conversation with a visual
interface". En este slice se entrega la primera parte: la posibilidad de crear
una rama de la conversación desde cualquier mensaje (excepto el primero). Un
clic derecho sobre un mensaje abre su `ContextMenu`; la nueva opción "Crear
rama" (ícono `Split`) crea una conversación nueva que parte desde ese mensaje,
con los mensajes 0..N copiados y la misma configuración local que el chat
origen.

## Decisions

- **Alcance:** se implementa solo la acción "Crear rama". La interfaz visual
  de árbol de ramas (parte restante de PM.7) queda fuera de este slice.
- **Mensajes copiados:** se copian los mensajes `0..position` del mensaje
  elegido (inclusive), conservando `role`, contenido mostrado, `position`,
  `createdAt` y `editedAt`. **No** se copian las alternativas de regeneración:
  la rama parte limpia, solo con el contenido visible actual de cada mensaje
  (`alternatives: []`, `alternativesCursor: 0`).
- **Memorias dinámicas:** se copian **todas** las memorias de la conversación
  origen a la rama, preservando `actor`, `title`, `description`, `priority`,
  `createdBy`, `updatedBy` y sobre todo `createdAt`/`updatedAt` (para que el
  cálculo de auto-degradación siga siendo coherente con la configuración
  heredada).
- **Resúmenes:** se copian solo los resúmenes cuyo rango
  (`firstMessageId`..`lastMessageId`) queda dentro de los mensajes copiados;
  los id de mensaje se **remapean** a los nuevos id de la rama. Resúmenes que
  referencian mensajes fuera de la rama se omiten. Se conservan `content`,
  `model`, `provider`, `createdAt` y `editedAt`.
- **Propuestas pendientes:** no se copian (dato transitorio por conversación).
- **Mensaje prohibido:** no se permite crear rama desde el primer mensaje
  (posición 0). Se valida en el backend (`DomainError
  CANNOT_BRANCH_FROM_FIRST_MESSAGE`) y se oculta la opción en la UI
  (`message.position > 0`), igual que "Eliminar".
- **Configuración heredada:** la rama copia la configuración local del origen:
  `model`, `provider`, `providerInstanceId`, `recentMessageCount`,
  `summaryFrequency`, `temperature`, `maxTokens`, `topP`,
  `frequencyPenalty`, `presencePenalty`, `stopSequences`,
  `memoryProposalMode`, `customProfileImageAssetId` y los parámetros de
  `memoryDecay` (`mode`, `threshold`, `ageThreshold`, `speed`).
- **Título:** la rama nace **sin título** (`title: null`, `titleSource: null`),
  como una conversación nueva; se auto-genera al enviar el primer mensaje.
- **Endpoint:** `POST /api/conversations/:id/branches` con body
  `{ targetMessageId }`. Devuelve el `ConversationDetail` de la rama (201).
  El frontend navega a `/conversations/:ramaId`.
- **Persistencia:** `ConversationRepository.create` + un `MessageRepository.create`
  por mensaje copiado (mismos `createdAt`/`editedAt` originales).

## Criterios de aceptación

- [x] El `ContextMenu` de cada mensaje (excepto el primero) muestra "Crear
      rama" con el ícono `Split`.
- [x] Crear una rama desde el mensaje N genera una conversación nueva con los
      mensajes 0..N copiados.
- [x] La rama hereda la configuración local del chat origen (modelo,
      proveedor, parámetros de inferencia, memoria y custom profile image).
- [x] La rama no conserva las alternativas de regeneración (solo el contenido
      mostrado).
- [x] Las memorias dinámicas del origen se copian a la rama.
- [x] Los resúmenes cuyo rango cae dentro de la rama se copian con sus ids de
      mensaje remapeados; los que quedan fuera se omiten.
- [x] La rama nace sin título.
- [x] El backend rechaza crear una rama desde el primer mensaje.
- [x] Tras crear la rama el frontend navega al nuevo chat.
- [x] Tests: `BranchConversationUseCase` (semántica de copia, herencia de
      settings y errores). Backend (287) y frontend pasan, y `pnpm check` pasa
      (architecture 4/4, typecheck y lint en los 4 paquetes).

## Commits

1. `feat(backend): branch conversation from a message (PM.7)`
2. `feat(frontend): add Crear rama action to message context menu`
3. `test(backend): cover BranchConversationUseCase`
4. `release: bump to v1.7.0 and add changelog entry`
