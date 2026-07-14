# Arquitectura Técnica

## Propósito

Definir la estructura del proyecto, la organización de capas, los flujos de datos y las decisiones técnicas que guiarán la implementación de la primera versión, garantizando una arquitectura hexagonal que mantenga el dominio independiente de frameworks, bases de datos y proveedores externos.

---

## Stack tecnológico

| Capa | Tecnología | Rol |
|---|---|---|
| Backend | Express.js | Framework HTTP (adaptador primario) |
| ORM | Drizzle ORM | Adaptador de persistencia |
| Base de datos | SQLite | Almacenamiento local (Offline First) |
| Frontend | Astro + React | SSR con componentes interactivos |
| UI | shadcn/ui | Librería de componentes de interfaz |
| Paquete | pnpm workspaces | Monorepo |

---

## Estructura del monorepo

```
roleplay-manager/
  packages/
    backend/
      src/
        domain/
          entities/
            character.entity.ts
            character-version.entity.ts
            character-card.entity.ts
            conversation.entity.ts
            message.entity.ts
            memory.entity.ts
            summary.entity.ts
          value-objects/
            prompt-context.ts
            generated-response.ts
            inference-config.ts
            memory-change-proposal.ts
          ports/
            character.repository.ts
            conversation.repository.ts
            memory.repository.ts
            summary.repository.ts
            provider.port.ts

        application/
          use-cases/
            character/
              create-character.use-case.ts
              create-character-version.use-case.ts
              update-character.use-case.ts
              delete-character.use-case.ts
            conversation/
              create-conversation.use-case.ts
              send-message.use-case.ts
              regenerate-reply.use-case.ts
              edit-message.use-case.ts
              rewind-conversation.use-case.ts
              archive-conversation.use-case.ts
              update-conversation-settings.use-case.ts
              generate-conversation-title.use-case.ts
            memory/
              propose-memory-changes.use-case.ts
              apply-memory-changes.use-case.ts
            summary/
              generate-summary.use-case.ts
            provider/
              build-prompt-context.use-case.ts
              generate-character-response.use-case.ts

        infrastructure/
          adapters/
            primary/
              routes/
                character.routes.ts
                conversation.routes.ts
                memory.routes.ts
              controllers/
                character.controller.ts
                conversation.controller.ts
                memory.controller.ts
              middlewares/
                error-handler.ts
                validation.ts
            secondary/
              drizzle/
                schema/
                  character.schema.ts
                  conversation.schema.ts
                  memory.schema.ts
                  summary.schema.ts
                repositories/
                  drizzle-character.repository.ts
                  drizzle-conversation.repository.ts
                  drizzle-memory.repository.ts
                  drizzle-summary.repository.ts
              providers/
                ollama.adapter.ts
                openai-compatible.adapter.ts
                provider-registry.ts
          config/
            env.ts
            database.ts
            provider.config.ts
          database/
            migrations/
            index.ts

        containers/
          use-case.container.ts
          repository.container.ts

      drizzle.config.ts
      package.json
      tsconfig.json

    frontend/
      src/
        pages/
          index.astro
          characters/
            index.astro
            [id].astro
            new.astro
            [id]/edit.astro
          conversations/
            [id].astro
        components/
          ui/          (shadcn components)
          character/
            character-form.tsx
            character-card.tsx
            version-history.tsx
          conversation/
            chat.tsx
            message.tsx
            message-input.tsx
            settings-panel.tsx
          memory/
            memory-list.tsx
            proposal-review.tsx
          summary/
            summary-viewer.tsx
        lib/
          api/
            client.ts
            characters.ts
            conversations.ts
            memories.ts
          stores/
            chat.store.ts
        layouts/
          base.astro
          sidebar.astro
        styles/
          globals.css

      astro.config.mjs
      tailwind.config.ts
      components.json
      package.json
      tsconfig.json

    shared/
      src/
        types/
          character.ts
          conversation.ts
          message.ts
          memory.ts
          summary.ts
      package.json
      tsconfig.json

  pnpm-workspace.yaml
  package.json
  turbo.json
```

---

## Arquitectura hexagonal (backend)

La arquitectura sigue el modelo de puertos y adaptadores, organizado en tres capas.

### Capa de dominio

Es el núcleo del sistema. No depende de ninguna tecnología externa.

Contiene:
* **Entidades**: representan los conceptos del dominio con sus invariantes.
* **Value Objects**: objetos inmutables que transportan información entre capas.
* **Puertos (interfaces)**: contratos que la capa de aplicación necesita, implementados por los adaptadores.

Reglas:
* El dominio no importa nada de `infrastructure` ni de `application`.
* Las entidades solo dependen de otras entidades del dominio.
* Los puertos se definen como interfaces TypeScript.

### Capa de aplicación

Contiene los casos de uso. Cada caso de uso:
1. Recibe una solicitud desde un adaptador primario.
2. Coordina las entidades del dominio.
3. Se comunica con el exterior mediante los puertos definidos en el dominio.
4. Devuelve un resultado.

Reglas:
* Los casos de uso dependen del dominio (entidades y puertos), nunca de la infraestructura.
* La inyección de dependencias conecta los casos de uso con sus adaptadores.

### Capa de infraestructura

Contiene las implementaciones concretas de los puertos y los adaptadores de entrada/salida.

* **Adaptadores primarios (driving)**: Express routes y controllers. Traducen peticiones HTTP a llamadas a casos de uso y viceversa.
* **Adaptadores secundarios (driven)**: Repositorios Drizzle, adaptadores de proveedores de IA. Implementan los puertos del dominio.

---

## Flujo de datos end-to-end

### Ejemplo: SendMessage

```
[Frontend]
  Petición POST /api/conversations/:id/messages
       |
[Express Router]
       |
[Controller]  (traduce HTTP → parámetros del caso de uso)
       |
[SendMessage Use Case]  (coordina el flujo)
       |---> [CharacterRepository] (puerto)
       |         └──> [DrizzleCharacterRepository] (SQLite)
       |---> [ConversationRepository] (puerto)
       |         └──> [DrizzleConversationRepository] (SQLite)
       |---> [BuildPromptContext Use Case]
       |---> [ProviderPort] (puerto)
       |         └──> [OllamaAdapter] (API HTTP a Ollama)
       |---> [GenerateSummary Use Case] (si aplica)
       |         └──> [SummaryRepository] (puerto)
       |                  └──> [DrizzleSummaryRepository] (SQLite)
       |---> [ProposeMemoryChanges Use Case]
       |         └──> [MemoryRepository] (puerto)
       |                  └──> [DrizzleMemoryRepository] (SQLite)
       |
[Controller]  (traduce resultado → HTTP response)
       |
[Frontend]
  Recibe respuesta con el mensaje generado
```

---

## Contenedores e inyección de dependencias

El sistema utiliza un mecanismo simple de contenedores (sin librería externa en v1) para ensamblar las dependencias.

```
containers/
  repository.container.ts   → instancia todos los repositorios Drizzle
  use-case.container.ts     → instancia todos los casos de uso con sus dependencias
  provider.container.ts     → registra los adaptadores de proveedores disponibles
```

Cada controlador obtiene los casos de uso que necesita desde el contenedor y los invoca sin conocer sus dependencias internas.

---

## API REST

| Método | Ruta | Caso de uso |
|---|---|---|
| `POST` | `/api/characters` | CreateCharacter |
| `GET` | `/api/characters/:id` | — (consulta) |
| `PUT` | `/api/characters/:id` | UpdateCharacter |
| `DELETE` | `/api/characters/:id` | DeleteCharacter |
| `POST` | `/api/characters/:id/versions` | CreateCharacterVersion |
| `GET` | `/api/characters/:id/versions` | — (consulta) |
| `POST` | `/api/conversations` | CreateConversation |
| `GET` | `/api/conversations/:id` | — (consulta) |
| `POST` | `/api/conversations/:id/messages` | SendMessage |
| `GET` | `/api/conversations/:id/messages` | — (consulta) |
| `PUT` | `/api/conversations/:id/messages/:messageId` | EditMessage |
| `POST` | `/api/conversations/:id/regenerate` | RegenerateReply |
| `POST` | `/api/conversations/:id/rewind` | RewindConversation |
| `PATCH` | `/api/conversations/:id/settings` | UpdateConversationSettings |
| `POST` | `/api/conversations/:id/archive` | ArchiveConversation |
| `POST` | `/api/conversations/:id/unarchive` | ArchiveConversation (reactivar) |
| `GET` | `/api/conversations/:id/memories` | — (consulta) |
| `GET` | `/api/conversations/:id/memories/proposals` | — (consulta) |
| `POST` | `/api/conversations/:id/memories/proposals/:proposalId/apply` | ApplyMemoryChanges |
| `GET` | `/api/conversations/:id/summaries` | — (consulta) |
| `GET` | `/api/providers` | — (lista proveedores disponibles) |

---

## Esquema de base de datos (Drizzle)

### Entidades principales

```typescript
// characters
export const characters = sqliteTable('characters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// character_versions
export const characterVersions = sqliteTable('character_versions', {
  id: text('id').primaryKey(),
  characterId: text('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  subtitle: text('subtitle'),
  profileImage: text('profile_image').notNull(),
  description: text('description').notNull(),
  instructions: text('instructions'),
  greeting: text('greeting').notNull(),
  versionNumber: integer('version_number').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// character_cards
export const characterCards = sqliteTable('character_cards', {
  id: text('id').primaryKey(),
  versionId: text('version_id').notNull().references(() => characterVersions.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  position: integer('position').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
});

// conversations
export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  versionId: text('version_id').notNull().references(() => characterVersions.id),
  title: text('title'),
  status: text('status', { enum: ['active', 'archived'] }).notNull().default('active'),
  model: text('model'),
  provider: text('provider'),
  recentMessageCount: integer('recent_message_count').default(15),
  summaryFrequency: integer('summary_frequency').default(15),
  temperature: real('temperature').default(0.7),
  maxTokens: integer('max_tokens').default(2048),
  topP: real('top_p').default(0.9),
  frequencyPenalty: real('frequency_penalty').default(0),
  presencePenalty: real('presence_penalty').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// messages
export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  position: integer('position').notNull(),
  alternatives: text('alternatives', { mode: 'json' }).$type<string[]>().default('[]'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  editedAt: integer('edited_at', { mode: 'timestamp' }),
});

// memories
export const memories = sqliteTable('memories', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  actor: text('actor').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  priority: integer('priority').notNull().default(5),
  createdBy: text('created_by', { enum: ['user', 'assistant'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// summaries
export const summaries = sqliteTable('summaries', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  firstMessageId: text('first_message_id').notNull().references(() => messages.id),
  lastMessageId: text('last_message_id').notNull().references(() => messages.id),
  model: text('model'),
  provider: text('provider'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  editedAt: integer('edited_at', { mode: 'timestamp' }),
});

// memory_change_proposals (entidad transitoria, podría no persistirse en SQLite)
```

### Relaciones y reglas de integridad

* `character_versions` y `conversations` usan `onDelete: 'cascade'` para garantizar la eliminación en cascada desde `characters`.
* `messages`, `memories` y `summaries` usan `onDelete: 'cascade'` desde `conversations`.
* `character_cards` usa `onDelete: 'cascade'` desde `character_versions`.
* La posición de los mensajes es única por conversación.
* El primer mensaje de cada conversación tiene rol `assistant` y corresponde al greeting de la versión.

---

## Frontend

### Comunicación con el backend

El frontend se comunica con el backend mediante una API client en `lib/api/` que utiliza `fetch` nativo.

```
lib/api/
  client.ts          → instancia base con URL y headers
  characters.ts      → funciones CRUD para personajes
  conversations.ts   → funciones para conversaciones
  messages.ts        → funciones para mensajes
  memories.ts        → funciones para memorias
```

### Streaming

El frontend recibe respuestas en streaming mediante Server-Sent Events (SSE) o fetch con `ReadableStream` cuando el proveedor lo soporta.

El flujo es:
1. El frontend envía el mensaje del usuario.
2. El backend inicia la generación y transmite fragmentos de texto mediante streaming.
3. El frontend muestra los fragmentos en tiempo real en la interfaz de chat.
4. Al completarse, el frontend recibe el mensaje completo y actualiza la UI.

### Estado y reactividad

Para la gestión de estado se utiliza un mecanismo simple basado en stores de Zustand o signals de React, sin librerías externas pesadas en v1.

---

## Decisiones técnicas

### Identificadores

Todos los identificadores de entidades se generan como UUIDs (v7) en la capa de aplicación, no en la base de datos.

### Serialización

La comunicación entre frontend y backend utiliza JSON estándar. Las fechas se transmiten como timestamps UNIX (milisegundos).

### Manejo de errores

El backend define una estructura uniforme de respuesta para errores:

```json
{
  "error": {
    "code": "CHARACTER_NOT_FOUND",
    "message": "El personaje solicitado no existe."
  }
}
```

Los errores se clasifican en:
* **DomainError**: violación de una regla de negocio.
* **NotFoundError**: entidad no encontrada.
* **ValidationError**: datos de entrada inválidos.
* **ProviderError**: error del proveedor de IA.
* **InfrastructureError**: error técnico no clasificado.

### Streaming de proveedores

El adaptador de cada proveedor implementa tanto generación completa como streaming. El caso de uso `GenerateCharacterResponse` delega en el adaptador y, si el proveedor lo soporta, entrega fragmentos al controlador HTTP, que los transmite al frontend mediante SSE.

### Dependencias compartidas

Los tipos compartidos entre frontend y backend (entidades, DTOs, constantes) residen en `packages/shared/src/types/` para evitar duplicación y garantizar consistencia.

---

## Principios arquitectónicos

* El dominio nunca importa código de infraestructura.
* Los casos de uso nunca dependen directamente de Express, Drizzle ni de ningún proveedor de IA.
* Los adaptadores de base de datos implementan interfaces definidas en el dominio.
* Los adaptadores de proveedores implementan el puerto `ProviderPort` definido en el dominio.
* Cada caso de uso se prueba de forma aislada mockeando sus puertos.
* La base de datos puede sustituirse sin modificar el dominio ni los casos de uso.
* Express puede sustituirse por otro framework HTTP sin modificar el dominio ni los casos de uso.
