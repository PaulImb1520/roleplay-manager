# Update Memory

## Objetivo

Permitir al usuario modificar manualmente una memoria dinámica existente asociada a una conversación sin necesidad de pasar por el flujo de propuestas de la IA.

---

## Motivación

El usuario tiene control total sobre la memoria dinámica en todo momento. Puede necesitar corregir un hecho mal registrado por la IA, ajustar la prioridad de una memoria o reformular su descripción para reflejar mejor el estado actual de la historia.

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
* La memoria que se desea editar debe existir dentro de la conversación.
* El nuevo contenido debe respetar las invariantes de `Memory` (actor no vacío, título no vacío y único, prioridad entre 1 y 10).

---

## Flujo principal

1. El usuario selecciona una memoria en el panel de memoria dinámica y solicita editarla.

2. El sistema muestra los campos editables: actor, título, descripción, prioridad.

3. El usuario modifica los valores que considere y confirma.

4. El sistema valida las invariantes de `Memory`. Si el título fue modificado, verifica la unicidad dentro de la conversación.

5. El sistema actualiza la memoria y registra `updatedBy = 'user'` junto con la fecha de actualización.

6. El sistema confirma la edición y la memoria modificada queda disponible para la siguiente construcción de contexto.

---

## Flujos alternativos

### Título duplicado

Si el usuario introduce un título ya existente en otra memoria de la misma conversación, el sistema rechaza la operación e informa del conflicto.

---

## Reglas de negocio

* Cualquier campo de la memoria puede ser modificado manualmente.
* La operación queda registrada como `updatedBy = 'user'`.
* La edición manual no genera propuestas ni notificaciones a la IA.
* La edición manual no invalida resúmenes ni mensajes.

---

## Cambios en el dominio

* Se modifica el contenido de una entidad `Memory` existente.

No se crea ni elimina ninguna entidad.

---

## Postcondiciones

* La memoria refleja el nuevo contenido introducido por el usuario.
* La fecha de última actualización de la memoria ha sido actualizada.
* La memoria modificada participa en la siguiente construcción de contexto si su prioridad lo justifica y el espacio disponible lo permite.

---

## Casos de uso relacionados

* CreateMemory (alternativa para crear una memoria nueva manualmente).
* DeleteMemory (alternativa para eliminar una memoria manualmente).
* ProposeMemoryChanges (flujo de modificación propuesta por la IA).
* ApplyMemoryChanges (aplica propuestas aceptadas sobre la memoria dinámica).
* PromptContextBuilder (utiliza las memorias para construir el contexto).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Historial de versiones de la memoria permitiendo consultar y restaurar ediciones anteriores.

Esta funcionalidad no forma parte de la primera versión del proyecto.