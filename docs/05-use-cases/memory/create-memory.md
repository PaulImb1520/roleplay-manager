# Create Memory

## Objetivo

Permitir al usuario crear manualmente una nueva memoria dinámica asociada a una conversación sin necesidad de pasar por el flujo de propuestas de la IA.

---

## Motivación

El usuario tiene control total sobre la memoria dinámica en todo momento. Puede querer registrar un hecho relevante que la IA no detectó, o anticipar una información clave para el desarrollo narrativo.

---

## Actores

### Actor principal

* Usuario.

### Actores secundarios

* Sistema.

---

## Entidades involucradas

* Conversation
* Memory

---

## Precondiciones

* La conversación debe existir.
* La conversación no debe estar archivada.
* El actor de la memoria no puede estar vacío.
* El título no puede estar vacío ni duplicar un título ya existente en la misma conversación.
* La prioridad debe estar entre 1 y 10.

---

## Flujo principal

1. El usuario abre el panel de memoria dinámica de la conversación y solicita crear una nueva memoria.

2. El sistema presenta un formulario con los campos editables: actor, título, descripción, prioridad.

3. El usuario rellena los datos y confirma.

4. El sistema valida que el título no esté duplicado en la conversación aplicando la política de unicidad `unique(conversationId, title)`. Si la IA hubiera generado memorias con títulos repetidos, el sistema añade un sufijo secuencial visual.

5. El sistema crea la entidad `Memory` con `createdBy = 'user'` y `updatedBy = 'user'`.

6. El sistema almacena la memoria y la deja disponible para la siguiente construcción de contexto.

---

## Flujos alternativos

### Título duplicado

Si el usuario introduce un título ya existente en la conversación, el sistema rechaza la operación e informa del conflicto. El usuario puede modificar el título o dejar que el sistema añada un sufijo secuencial automático.

---

## Reglas de negocio

* Cualquier memoria creada manualmente pertenece exclusivamente a la conversación.
* La prioridad debe estar comprendida entre 1 y 10.
* El actor y el título no pueden estar vacíos.
* La operación queda registrada como `createdBy = 'user'` y `updatedBy = 'user'`.
* La creación manual no genera propuestas ni notificaciones a la IA.

---

## Cambios en el dominio

* Se crea una nueva entidad `Memory`.

No se modifica ninguna otra entidad.

---

## Postcondiciones

* La nueva memoria está disponible en la memoria dinámica de la conversación.
* La memoria participa en la siguiente construcción de contexto si su prioridad lo justifica y el espacio disponible lo permite.

---

## Casos de uso relacionados

* ProposeMemoryChanges (flujo alternativo de creación propuesta por la IA).
* ApplyMemoryChanges (aplica propuestas aceptadas sobre la memoria dinámica).
* PromptContextBuilder (utiliza las memorias para construir el contexto).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Validación semántica de duplicados entre memorias existentes.
* Sugerencias automo-style basadas en el contenido de la conversación.

Estas funcionalidades no forman parte de la primera versión del proyecto.