# Get Prompt Context

## Objetivo

Construir y devolver el contexto completo que será enviado al modelo de inteligencia artificial para generar una respuesta, permitiendo al usuario inspeccionarlo antes de que se ejecute la generación.

---

## Motivación

El usuario necesita comprender qué información está siendo utilizada por el sistema para construir cada respuesta. La transparencia del contexto es uno de los objetivos fundamentales del producto.

Este caso de uso permite al usuario previsualizar el `PromptContext` que vería el modelo: el system prompt completo (con la definición del personaje, tarjetas activas, resumen y memorias), la ventana de mensajes recientes, y el mensaje pendiente que el usuario está a punto de enviar (si existe).

---

## Actores

### Actor principal

- Usuario.

### Actores secundarios

- Sistema (recupera y deconstruye el contexto).
- PromptContextBuilder (ensambla el system prompt).

---

## Entidades involucradas

- Conversation
- CharacterVersion
- CharacterCard
- Message
- Summary
- Memory

---

## Precondiciones

- La conversación debe existir y estar activa.
- El personaje asociado a la conversación debe existir.

---

## Flujo principal

1. El usuario solicita previsualizar el contexto de una conversación, opcionalmente incluyendo un mensaje pendiente que aún no ha sido enviado.

2. El sistema recupera la conversación y confirma que existe.

3. El sistema recupera la versión del personaje asociada a la conversación.

4. El sistema recupera las tarjetas activas de la versión del personaje.

5. El sistema recupera los mensajes de la conversación.

6. El sistema recupera el resumen más reciente de la conversación (si existe).

7. El sistema recupera las memorias activas de la conversación.

8. El sistema invoca al `PromptContextBuilder` con todos los elementos anteriores, más el mensaje pendiente opcional, para construir el `PromptContext` completo.

9. El sistema devuelve un `PromptContextDTO` con tres secciones:
   - `systemPrompt`: el system prompt completo que vería el modelo.
   - `messages`: la lista de mensajes (historial reciente + mensaje pendiente, si existe).
   - `metadata`: información de depuración (nombre del personaje, versión, ID del resumen, conteo de memorias, mensajes y caracteres totales).

---

## Flujos alternativos

### Conversación no encontrada

Si la conversación no existe, el sistema devuelve un error indicando que la conversación no fue encontrada.

### Conversación archivada

Si la conversación está archivada, el sistema devuelve un error indicando que no se puede inspeccionar el contexto de una conversación archivada.

### Personaje no encontrado

Si la versión del personaje asociada no existe (p. ej. fue eliminada), el sistema devuelve un error.

---

## Reglas de negocio

- El contexto devuelto es exactamente el mismo que se utilizaría para generar una respuesta en ese instante, incluyendo el mensaje pendiente si se proporcionó.
- Este caso de uso no modifica ninguna entidad del dominio. Es una operación de solo lectura.
- El mensaje pendiente se incluye en la lista de mensajes del DTO pero no se persiste.

---

## Cambios en el dominio

Ninguno. Este caso de uso no produce efectos secundarios sobre el dominio.

---

## Postcondiciones

- El usuario dispone del contexto completo en un formato estructurado que puede inspeccionar.
- Ninguna entidad del dominio ha sido creada, modificada ni eliminada.

---

## Casos de uso relacionados

- `SendMessage` (el contexto que se previsualiza es el mismo que se usará al enviar).
- `PromptContextBuilder` (orquestado internamente para ensamblar el contexto).
- `ContinueConversation` (también se puede previsualizar el contexto antes de continuar).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

- Comparación visual entre el contexto actual y el de una interacción anterior.
- Edición del contexto antes del envío (eliminar mensajes, ajustar system prompt).
- Exportación del contexto a formato legible o a JSON para depuración externa.

Estas funcionalidades no forman parte de la primera versión del proyecto.
