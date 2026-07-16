# Update Summary

## Objetivo

Permitir al usuario editar manualmente el contenido de cualquier resumen existente dentro de una conversación.

---

## Motivación

El usuario tiene control total sobre la información almacenada. Los resúmenes pueden contener inexactitudes generadas por la IA, omitir acontecimientos importantes o describir la historia con un tono que no se ajusta a la intención del usuario.

La edición manual permite al usuario ajustar el contenido del resumen sin necesidad de regenerarlo, manteniendo la continuidad narrativa y respetando el principio de que toda información generada automáticamente debe ser editable.

---

## Actores

### Actor principal

* Usuario.

### Actores secundarios

* Sistema.

---

## Entidades involucradas

* Conversation
* Summary

---

## Precondiciones

* La conversación debe existir.
* La conversación no debe estar archivada.
* El resumen que se desea editar debe existir dentro de la conversación.
* El nuevo contenido del resumen no puede estar vacío.

---

## Flujo principal

1. El usuario abre elvisor de resúmenes de la conversación y selecciona el resumen que desea editar.

2. El sistema muestra el contenido actual del resumen en un campo editable.

3. El usuario modifica el contenido y confirma los cambios.

4. El sistema valida que el nuevo contenido no esté vacío.

5. El sistema actualiza el contenido del resumen y registra la fecha de edición (`editedAt`).

6. El sistema confirma la edición y el resumen actualizado queda disponible para la siguiente construcción de contexto.

---

## Flujos alternativos

### Contenido vacío

Si el usuario intenta guardar un resumen sin contenido, el sistema rechaza la operación e indica que el resumen no puede estar vacío.

---

### Resumen no encontrado

Si el resumen que se intenta editar ya no existe (por ejemplo, fue eliminado), el sistema informa del error y cancela la operación.

---

## Reglas de negocio

* Cualquier resumen puede ser editado manualmente, independientemente de su posición en el historial.
* La edición no modifica la fecha de creación ni el rango de mensajes que el resumen representa (`firstMessageId`, `lastMessageId`).
* La edición no modifica el modelo ni el proveedor registrados durante la generación original.
* La operación no regenera el resumen ni desencadena ningún proceso automático sobre la conversación.

---

## Cambios en el dominio

* Se modifica el contenido de una entidad `Summary` existente.
* Se actualiza la fecha de última edición del resumen.

No se crea ni elimina ninguna entidad.

---

## Postcondiciones

* El resumen refleja el nuevo contenido introducido por el usuario.
* La fecha de última edición del resumen ha sido actualizada.
* El resumen editado participa en la siguiente construcción de contexto si es el más reciente.

---

## Casos de uso relacionados

* GenerateSummary (genera resúmenes automáticos que este caso de uso edita).
* DeleteSummary (alternativa para eliminar un resumen manualmente).
* PromptContextBuilder (utiliza el resumen más reciente para construir el contexto).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Historial de versiones del resumen permitiendo consultar y restaurar ediciones anteriores.
* Marca automática de resúmenes como potencialmente desactualizados cuando los mensajes de su rango son editados.

Estas funcionalidades no forman parte de la primera versión del proyecto.