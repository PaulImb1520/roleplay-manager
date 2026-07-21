# 08 - Workflow

# Metodología de Trabajo (Vertical Slice)

## Propósito

Definir cómo se organiza el desarrollo de la primera versión del proyecto para obtener **entregables tangibles frecuentes** y mantener el sistema en un estado estable y demostrable en todo momento.

Este documento es la fuente de verdad sobre **cómo** se implementa. La separación entre el *qué* (entidades, casos de uso, endpoints) y el *cómo* (este workflow) es deliberada: el *qué* vive en los documentos `04-domain.md`, `05-use-cases/` y `07-technical-architecture.md`; el *cómo* vive aquí.

---

## Motivación

La arquitectura hexagonal del proyecto define capas claras (dominio, aplicación, infraestructura, adaptadores) y el roadmap (`03-roadmap.md`) las organiza en fases horizontales (Fase 1: personajes, Fase 2: conversaciones, etc.). Si se sigue el orden de las fases al pie de la letra se cae fácilmente en un patrón **horizontal** de trabajo: primero se construye toda una capa (p. ej. todo el dominio), luego toda la siguiente (toda la aplicación), luego toda la siguiente (toda la infraestructura).

Ese patrón tiene tres problemas para este proyecto:

* **Sin entregables tangibles durante largos periodos.** El usuario no ve nada funcionando hasta que varias capas encajan, lo que dificulta validar el rumbo.
* **Acumulación de riesgo técnico.** Las decisiones de modelo de datos, contratos de puerto y endpoints se acumulan sin haber sido probadas en conjunto. Cuando por fin se conecta todo, los desajustes afloran de golpe.
* **Falta de feedback temprano sobre las decisiones de UX y arquitectura.** El frontend y el backend evolucionan en paralelo sin converger.

La respuesta es invertir el eje de progreso: en lugar de *una capa a la vez*, se implementa **una funcionalidad a la vez** cruzando **todas las capas** que esa funcionalidad necesita, desde la base de datos hasta la interfaz de usuario.

---

## Definición: slice vertical

Un **slice vertical** (en adelante, **slice**) es una unidad de trabajo autónoma que:

1. Entrega **una única capacidad de producto** observable por el usuario final (una acción, una vista, un comando).
2. Cruza **todas las capas** de la arquitectura necesarias para que esa capacidad funcione de extremo a extremo: esquema de base de datos → entidad de dominio → puerto → repositorio → caso de uso → controller HTTP → ruta REST → cliente de API en el frontend → página o componente de UI → estado local.
3. Deja el sistema en **estado estable y demostrable** al finalizar: el código compila, los tests pasan, el slice anterior sigue funcionando, y el nuevo comportamiento es verificable manualmente.
4. Tiene una **Definición de Terminado** explícita (ver más abajo) que el implementador verifica antes de marcar el slice como completo.

Un slice no es "una capa completa", ni "una fase del roadmap", ni "una tarea técnica aislada" (p. ej. "configurar Drizzle").

### Ejemplo

> **Slice S4 — Enviar un mensaje y obtener respuesta del asistente.**
>
> Capas tocadas:
>
> * Esquema: las tablas `messages`, `conversations` ya existen; se confirma que la inserción del mensaje del asistente en `GenerateCharacterResponse` está soportada.
> * Dominio: entidad `Message` (probablemente ya creada en S2 o S3).
> * Puerto: `MessageRepository` (probablemente ya creado).
> * Caso de uso: `SendMessage` (nuevo), que orquesta `PromptContextBuilder` + `GenerateCharacterResponse`.
> * Adaptador primario: `POST /api/conversations/:id/messages` con validación Zod y respuesta SSE.
> * Adaptador secundario: `OllamaAdapter.generateStreaming` (nuevo, primer adaptador real de proveedor).
> * Frontend: `lib/api/conversations.ts` con `sendMessageStreaming`, `lib/stores/chat.store.ts` con Zustand, `pages/conversations/[id].astro` con el layout de chat, `components/conversation/{chat,message,message-input}.tsx`.
>
> Entregable tangible: el usuario puede escribir un mensaje en una conversación activa y ver la respuesta del asistente aparecer progresivamente en pantalla.

---

## Principios rectores

* **El sistema siempre corre.** Después de cada slice existe al menos un flujo end-to-end funcional.
* **La arquitectura hexagonal no se relaja por conveniencia.** Un slice puede añadir archivos a cualquier capa, pero las reglas de dependencia (dominio no importa infraestructura, casos de uso no importan frameworks, etc.) se mantienen invariantes.
* **Sin slices paralelos.** Un slice se inicia cuando el anterior está completo. Esto simplifica la trazabilidad, evita conflictos de esquema y permite revisar el diff completo de cada capacidad.
* **El test del caso de uso es obligatorio antes de cerrar el slice.** El dominio se valida mockeando puertos; la infraestructura se valida con tests de integración cuando aplique.
* **La documentación de casos de uso se actualiza si el slice revela desviaciones.** Si durante la implementación se descubre que un caso de uso descrito en `05-use-cases/` no era correcto, el doc se corrige en el mismo PR que el código.

---

## Estructura de un slice

Un slice se ejecuta siguiendo un orden interno, de adentro hacia afuera:

```
1.  Esquema (Drizzle schema + migración)
        ↓
2.  Entidad de dominio + invariantes + value objects necesarios
        ↓
3.  Puerto (interface) en el dominio
        ↓
4.  Repositorio Drizzle (adaptador secundario) que implementa el puerto
        ↓
5.  Caso de uso en la capa de aplicación, recibiendo puertos por inyección
        ↓
6.  Test del caso de uso con puertos mockeados
        ↓
7.  Controller + ruta Express + validación Zod (adaptador primario)
        ↓
8.  Cliente de API en el frontend (lib/api/)
        ↓
9.  Componente(s) y/o página Astro (con estado local o Zustand si aplica)
        ↓
10. Verificación manual end-to-end + smoke test del slice anterior
```

Este orden es la **recomendación por defecto**. Puede alterarse solo si el slice es trivial (p. ej. un ajuste puramente de UI) o si existe una dependencia externa que bloquea (p. ej. el usuario aún no ha elegido el proveedor). Cualquier alteración debe justificarse en el mensaje de commit o en una nota del PR.

---

## Definición de Terminado (Definition of Done)

Un slice se considera terminado cuando **todas** las siguientes condiciones se cumplen:

* [ ] El esquema de base de datos está migrado y la nueva tabla/columna/índice está documentada en `07-technical-architecture.md` si no lo estaba.
* [ ] La entidad de dominio implementa sus invariantes en el constructor puro TypeScript (sin Zod, sin Drizzle).
* [ ] El puerto está definido como `interface` en el dominio, no como clase concreta.
* [ ] El repositorio Drizzle implementa el puerto. Las queries Drizzle nunca se filtran a la capa de aplicación.
* [ ] El caso de uso recibe sus puertos por inyección. No instancia dependencias.
* [ ] El test del caso de uso cubre el flujo principal y al menos un flujo alternativo relevante, mockeando los puertos.
* [ ] El controller valida la entrada con Zod y traduce la salida del caso de uso a HTTP. No contiene lógica de negocio.
* [ ] El endpoint REST es verificable mediante `curl` o equivalente y devuelve los códigos HTTP correctos para los errores documentados.
* [ ] El cliente de API en el frontend maneja los códigos de error documentados y los traduce a estados de UI.
* [ ] La página o componente de UI muestra el resultado y permite al usuario disparar la acción descrita por el slice.
* [ ] `pnpm typecheck` pasa en todo el workspace.
* [ ] `pnpm lint` pasa en todo el workspace.
* [ ] Los tests pasan (cuando exista el runner de tests, ver *Pendiente de decisión*).
* [ ] El slice anterior sigue funcionando (regresión manual o automática).
* [ ] Si la documentación de casos de uso necesitó actualizarse, el cambio está en el mismo PR.

---

## Orden de slices propuesto

El orden está pensado para maximizar el feedback temprano: lo que se entrega primero ya muestra la forma final del producto (un personaje conversando con un modelo de IA), aunque sea con funcionalidad mínima.

### S0 — Fundamentos

**Entregable:** el monorepo compila, el backend arranca, la base de datos SQLite se crea y persiste, y existe un endpoint `/api/health` que responde 200.

**Capas tocadas:** esqueleto del paquete `backend` (Express + Drizzle + better-sqlite3 + Zod + uuid + contenedor de DI mínimo), migración inicial con las 8 tablas descritas en `07-technical-architecture.md`, frontend sin cambios funcionales.

**Pendiente de decisión que se cierra en este slice:** runner de tests (ver *Pendiente de decisión*).

### S1 — Configurar el proveedor por defecto

**Entregable:** el usuario puede abrir la página de configuración de proveedores, ver los proveedores registrados con su estado, y seleccionar uno como proveedor por defecto del sistema.

**Capas tocadas:** tabla `settings` (ya existe), `ConfigureDefaultProvider` + `ValidateProviderConnection` + `ListProviderModels`, `ProviderRegistry` con adaptadores de `OllamaAdapter` y `OpenAICompatibleAdapter` (mínimo viable, pueden devolver listas vacías o `manualEntryRequired`), página `settings/providers.astro`.

### S2 — Gestión de personajes

**Entregable:** el usuario puede crear, listar, editar y eliminar personajes. Cada edición genera una nueva `CharacterVersion` sin afectar a conversaciones (aunque no haya conversaciones todavía en este slice).

**Capas tocadas:** entidades `Character`, `CharacterVersion`, `CharacterCard`; puertos y repos; casos de uso `CreateCharacter`, `CreateCharacterVersion`, `UpdateCharacter`, `DeleteCharacter`; endpoints REST asociados; páginas `characters/{index,new,[id],[id]/edit}.astro`; componentes `character-form.tsx`, `character-card.tsx`, `version-history.tsx`.

### S3 — Conversaciones (sin generación)

**Entregable:** el usuario puede crear una conversación a partir de un personaje, ver el listado de conversaciones activas, abrir una conversación, y archivarla o desarchivarla.

**Capas tocadas:** entidades `Conversation` y `Message`; puertos y repos; casos de uso `CreateConversation` (con greeting automático), `ArchiveConversation`; endpoints REST asociados; página `conversations/[id].astro` con vista vacía; componente `message-list.tsx` mínimo.

### S4 — Enviar un mensaje y recibir respuesta

**Entregable:** el usuario puede escribir un mensaje en una conversación activa y ver la respuesta del asistente aparecer progresivamente en pantalla. Sin memoria, sin resumen, sin propuestas.

**Capas tocadas:** casos de uso `SendMessage`, `PromptContextBuilder`, `GenerateCharacterResponse`; `OllamaAdapter.generateStreaming` real; `POST /api/conversations/:id/messages` con SSE; `lib/api/conversations.ts` con `sendMessageStreaming`; `lib/stores/chat.store.ts` (Zustand); componentes `chat.tsx`, `message.tsx`, `message-input.tsx`.

### S5 — Regenerar, editar, retroceder, eliminar

**Entregable:** el usuario puede regenerar la última respuesta del asistente, editar manualmente cualquier mensaje, eliminar un mensaje ya, ya sea suyo o del asistente y retroceder la conversación hasta un mensaje anterior. El historial de regeneraciones se mantiene hasta que el usuario envía un nuevo mensaje.

**Capas tocadas:** casos de uso `RegenerateReply`, `EditMessage`, `RewindConversation`; gestión de `alternatives`; descarte de propuestas `pending` en rewind; componentes `message-actions.tsx` y `rewind-dialog.tsx`.

### S6 — Memoria dinámica

**Entregable:** tras cada respuesta del asistente, el sistema genera propuestas de modificación de memoria. El usuario las ve en un panel, las acepta (con o sin edición), las descarta, o ignora. Además puede crear, editar y eliminar memorias manualmente.

**Capas tocadas:** entidad `MemoryChangeProposal`; puertos y repos; casos de uso `ProposeMemoryChanges`, `ApplyMemoryChanges`, `CreateMemory`, `UpdateMemory`, `DeleteMemory`; componentes `memory-list.tsx`, `proposal-review.tsx`.

### S7 — Resúmenes

**Entregable:** la conversación genera resúmenes automáticamente al alcanzar el umbral de `summaryFrequency`. El usuario puede revisar, editar o eliminar cualquier resumen. Si elimina el más reciente, el siguiente resumen cronológicamente anterior pasa a usarse en el contexto.

**Capas tocadas:** entidad `Summary`; puertos y repos; caso de uso `GenerateSummary`; casos `UpdateSummary`, `DeleteSummary`; componente `summary-viewer.tsx`; integración con `SendMessage` para disparar `GenerateSummary` cuando corresponde.

### S8 — Inspección de contexto y título

**Entregable:** el usuario puede previsualizar el `PromptContext` que se enviará al modelo antes de generar una respuesta. Además, la conversación recibe un título automático tras la primera interacción y tras cada resumen, y puede regenerarse bajo demanda.

**Capas tocadas:** `GET /api/conversations/:id/context`; caso de uso `GenerateConversationTitle` integrado en `SendMessage`; `POST /api/conversations/:id/title`; componente `context-preview.tsx` y `settings-panel.tsx`.

### S9 — Pulido transversal

**Entregable:** la versión 1.0 cumple los criterios de éxito del MVP con una experiencia estable.

**Capas tocadas (transversal):** timeouts de proveedores (configurable en `settings`); manejo unificado de errores en frontend; estados de carga y error consistentes; mensajes claros para el usuario; revisión de accesibilidad básica; optimización de queries Drizzle obvias; revisión de la documentación.

---

## Mapeo con el roadmap horizontal

El `03-roadmap.md` describe el producto en **fases horizontales** (Fase 0 a Fase 8). La metodología vertical no contradice el roadmap, sino que lo descompone en slices que cruzan capas. La siguiente tabla muestra cómo se corresponden:

| Fase del roadmap (`03-roadmap.md`) | Slices que la componen |
|---|---|
| Fase 0 — Fundamentos | S0 |
| Fase 1 — Gestión de personajes | S2 |
| Fase 2 — Conversaciones | S3, S4, S5 |
| Fase 3 — Proveedores de IA | S1 (configuración), transversal en S4/S6/S7/S8 (uso desde casos de uso) |
| Fase 4 — Construcción del contexto | S4 (uso), S8 (inspección) |
| Fase 5 — Memoria dinámica | S6 |
| Fase 6 — Resúmenes | S7 |
| Fase 7 — Herramientas de inspección | S8 |
| Fase 8 — Pulido de la versión 1.0 | S9 |

Esta tabla puede actualizarse si durante el desarrollo se reorganizan los slices.

---

## Anti-patrones a evitar

* **Construir toda la capa de dominio antes de empezar la UI.** El dominio se construye slice a slice, solo lo necesario para la capacidad en curso.
* **Crear todos los repositorios en bloque.** Un repositorio se implementa cuando su caso de uso lo necesita.
* **Migrar todo el esquema antes de cualquier caso de uso.** Las migraciones se generan por slice; usar `db:push` en desarrollo para iterar rápido y `db:generate` + `db:migrate` para commits.
* **Acumular slices "preparativos" sin entrega visible.** Si un slice no produce algo verificable por el usuario, hay que replantearlo o fusionarlo con el siguiente.
* **Saltarse el test del caso de uso.** Un caso de uso sin test es un caso de uso que el siguiente slice romperá sin quejarse.
* **Construir UI antes de tener un endpoint funcional.** El frontend consume el endpoint real desde el primer momento; durante el desarrollo puede usar stubs solo a nivel de cliente si fuera estrictamente necesario, pero el backend debe estar vivo.

---

## Relación con la arquitectura hexagonal

La metodología vertical es **una forma de organizar el trabajo**, no una relajación de la arquitectura. Las reglas hexagonales se mantienen invariantes en todo momento:

* El dominio no importa nunca código de infraestructura ni de aplicación.
* Los casos de uso nunca importan Express, Drizzle ni ningún proveedor de IA.
* Los adaptadores de base de datos implementan interfaces definidas en el dominio.
* Los adaptadores de proveedores implementan el puerto `ProviderPort` del dominio.
* Las dependencias apuntan siempre hacia el dominio, nunca al revés.

La consecuencia práctica es que durante un slice el desarrollador hace **más cambios pequeños en muchos directorios**, en lugar de **un cambio grande en un solo directorio**. El resultado final es el mismo: un sistema coherente, pero construido con menos riesgo y con más checkpoints.

---

## Pendiente de decisión

Las decisiones transversales de tooling (runner de tests, estrategia de migraciones, librería de logging, cliente de OpenAI-compatible) se documentan en [`docs/09-tooling.md`](./09-tooling.md). Si durante la implementación surge una nueva decisión transversal, se añade a ese documento en el mismo PR.

---

## Cómo usar este documento

* Antes de empezar un nuevo slice, leer el `Objetivo` y el `Entregable` del slice correspondiente.
* Seguir la `Estructura de un slice` como guía de orden de trabajo.
* Verificar la `Definición de Terminado` antes de marcar el slice como completo.
* Si durante la implementación se descubre que un slice debe subdividirse o reordenarse, actualizar este documento en el mismo PR.
* El `03-roadmap.md` permanece como visión de producto a alto nivel; este documento es la guía operativa de implementación.