# Delete Message

## Objetivo

Permitir al usuario eliminar un mensaje individual de la conversación, reordenando las posiciones de los mensajes posteriores para mantener la secuencia contigua.

---

## Motivación

Durante una conversación de roleplay el usuario puede necesitar eliminar un mensaje concreto, ya sea propio o del asistente, sin tener que retroceder toda la conversación hasta ese punto.

---

## Actores

### Actor principal

- Usuario.

### Actores secundarios

- Sistema.

---

## Entidades involucradas

- Conversation
- Message

---

## Precondiciones

- La conversación debe existir.
- La conversación no debe estar archivada.
- El mensaje debe existir dentro de la conversación.
- El mensaje no puede ser el primer mensaje (greeting).

---

## Flujo principal

1. El usuario solicita eliminar un mensaje de la conversación.

2. El sistema muestra un diálogo de confirmación.

3. El usuario confirma la eliminación.

4. El sistema elimina el mensaje de la base de datos.

5. El sistema reasigna la posición de los mensajes posteriores para mantener la secuencia contigua.

6. El sistema confirma la eliminación.

---

## Flujos alternativos

### Mensaje no encontrado

Si el mensaje ya no existe, el sistema informa del error.

---

### Conversación archivada

Si la conversación está archivada, el sistema impide la eliminación.

---

### Greeting

El primer mensaje de la conversación (greeting del personaje) no puede ser eliminado.

---

## Reglas de negocio

- No se puede eliminar el primer mensaje (greeting).
- Tras la eliminación, las posiciones de los mensajes posteriores se reasignan para mantener la secuencia contigua.
- Las propuestas de memoria y resúmenes no se modifican automáticamente.

---

## Casos de uso relacionados

- RewindConversation (alternativa más drástica que elimina todos los mensajes posteriores a un punto).
- EditMessage (alternativa para modificar el contenido sin eliminar el mensaje).
