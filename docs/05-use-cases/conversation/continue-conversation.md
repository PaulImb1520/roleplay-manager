# Continue Conversation

## Objetivo

Generar una nueva respuesta del asistente sin esperar un mensaje de entrada del usuario, permitiendo que el personaje continúe la conversación de forma autónoma.

---

## Motivación

Durante un roleplay, el usuario puede desear que el personaje tome la iniciativa y continúe la narración sin necesidad de escribir un mensaje explícito. Esto resulta útil para:

- Mantener el flujo narrativo cuando el usuario no sabe qué escribir.
- Estimular al personaje para que desarrolle la escena.
- Explorar direcciones narrativas sin intervención directa del usuario.

---

## Actores

### Actor principal

- Usuario.

### Actores secundarios

- Sistema.
- Modelo de inteligencia artificial.

---

## Entidades involucradas

- Conversation
- Message
- CharacterVersion
- CharacterCard
- Provider

---

## Precondiciones

- La conversación debe existir.
- La conversación no debe estar archivada.
- La conversación debe contener al menos un mensaje (el greeting).
- Debe existir un proveedor de inferencia disponible.

---

## Flujo principal

1. El usuario pulsa el botón "Continuar" en la interfaz de chat (visible solo cuando el campo de texto está vacío).

2. El sistema acepta el último mensaje del asistente si este tiene alternativas pendientes (las consolida como canónicas).

3. El sistema construye el contexto de generación utilizando el estado actual de la conversación.

4. El sistema envía el contexto al proveedor de inteligencia artificial.

5. El modelo genera una nueva respuesta.

6. El sistema guarda la respuesta como un nuevo mensaje del asistente.

7. La interfaz muestra la nueva respuesta al usuario, lista para continuar.

---

## Flujos alternativos

### Error durante la generación

Si el proveedor de inferencia falla durante la generación, el sistema informa del error sin modificar el estado de la conversación.

---

### Proveedor no disponible

Si no existe ningún proveedor configurado, el sistema informa del error.

---

## Reglas de negocio

- Solo puede ejecutarse en conversaciones activas.
- No requiere un mensaje de entrada del usuario.
- Si el último mensaje es del asistente y tiene alternativas, se aceptan implícitamente antes de continuar.
- Genera un nuevo mensaje del asistente al final de la conversación.

---

## Cambios en el dominio

- Se descartan las alternativas del último mensaje del asistente (si las hubiera).
- Se crea un nuevo `Message` con rol `assistant`.

---

## Casos de uso relacionados

- SendMessage (alternativa que requiere entrada del usuario).
- RegenerateReply (modifica el último mensaje en lugar de crear uno nuevo).

---

## Futuras extensiones

- Control de longitud de la respuesta generada.
- Selección de tono o dirección narrativa para la continuación.
