# Edit Message

## Objetivo

Permitir al usuario modificar el contenido de un mensaje existente dentro de una conversación, ya sea propio o generado por el asistente, manteniendo la coherencia narrativa y notificando los efectos secundarios que el cambio pueda provocar sobre resúmenes y propuestas de memoria pendientes.

---

## Motivación

Durante una conversación de roleplay el usuario puede necesitar corregir errores ortográficos, reformular una respuesta del asistente para ajustar el tono narrativo, o modificar información que afecte al desarrollo de la historia.

El principio fundamental del sistema establece que toda información almacenada debe ser editable por el usuario. Los mensajes no son una excepción.

Sin embargo, modificar un mensaje no es una operación aislada. Los resúmenes narrativos pueden quedar desactualizados si el mensaje editado forma parte del rango que describen, y las propuestas de memoria pendientes pueden basarse en información que ha cambiado.

Este caso de uso permite la edición manteniendo la transparencia sobre dichos efectos secundarios, pero sin aplicar cambios automáticos sobre entidades dependientes.

---

## Actores

### Actor principal

* Usuario.

### Actores secundarios

* Sistema.

---

## Entidades involucradas

* Conversation
* Message
* Summary (lectura, no modificación)
* MemoryChangeProposal (lectura, no modificación)

---

## Precondiciones

* La conversación debe existir.
* La conversación no debe estar archivada.
* El mensaje que se desea editar debe existir dentro de la conversación.
* El nuevo contenido del mensaje no puede estar vacío.

---

## Flujo principal

1. El usuario selecciona un mensaje dentro de la conversación y solicita editarlo.

2. El sistema muestra el contenido actual del mensaje en un campo editable.

3. El usuario modifica el contenido y confirma los cambios.

4. El sistema valida que el nuevo contenido no esté vacío.

5. El sistema actualiza el contenido del mensaje con el nuevo texto.

6. El sistema conserva la fecha de edición y la registra como metadato del mensaje.

7. El sistema verifica si el mensaje editado se encuentra dentro del rango del resumen más reciente de la conversación.

8. Si es así, el sistema marca el resumen como potencialmente desactualizado e informa al usuario de que el resumen puede no reflejar con precisión la historia editada.

9. El sistema verifica si existen propuestas de modificación de memoria pendientes que pudieran haberse basado en el mensaje editado.

10. Si existen, el sistema informa al usuario de que las propuestas pendientes podrían no ser coherentes con el mensaje modificado.

11. El sistema confirma que la edición se ha completado y muestra el mensaje actualizado.

---

## Flujos alternativos

### Contenido vacío

Si el usuario intenta guardar un mensaje sin contenido, el sistema rechaza la operación e indica que el mensaje no puede estar vacío.

---

### Mensaje no encontrado

Si el mensaje que se intenta editar ya no existe (por ejemplo, fue eliminado como parte de un retroceso de conversación), el sistema informa del error y cancela la operación.

---

### Conversación archivada

Si la conversación se encuentra archivada, el sistema impide la edición e informa al usuario que debe desarchivar la conversación antes de modificarla.

---

### Edición sin cambios

Si el usuario abre el editor y confirma sin realizar ninguna modificación, el sistema finaliza sin aplicar cambios ni generar notificaciones.

---

### Múltiples resúmenes afectados

Si la conversación posee varios resúmenes cuyo rango incluye el mensaje editado, todos ellos se marcan como potencialmente desactualizados.

---

## Reglas de negocio

* Cualquier mensaje de la conversación puede ser editado, independientemente de si fue generado por el usuario o por el asistente.
* El contenido del mensaje no puede estar vacío tras la edición.
* La edición de un mensaje no modifica su autor, su fecha de creación original ni su posición dentro de la conversación.
* La edición de un mensaje no desencadena una nueva generación de respuesta del asistente.
* El resumen más reciente pasa a considerarse potencialmente desactualizado si el mensaje editado forma parte de su rango.
* Las propuestas de memoria pendientes se notifican como potencialmente incoherentes, pero no se descartan automáticamente.
* Este caso de uso no modifica resúmenes, memorias ni propuestas de memoria.
* El sistema conserva la fecha de la última edición como metadato del mensaje con fines de auditoría.

---

## Cambios en el dominio

Al finalizar correctamente el caso de uso pueden producirse los siguientes cambios:

* Se modifica el contenido de un `Message` existente.
* Se actualiza la fecha de última edición del mensaje.

No se crea ni elimina ninguna entidad.

Los resúmenes, las memorias y las propuestas de memoria permanecen inalterados, aunque algunos puedan quedar marcados como potencialmente desactualizados.

---

## Postcondiciones

* El contenido del mensaje refleja el nuevo texto introducido por el usuario.
* La fecha de última edición del mensaje ha sido actualizada.
* La posición del mensaje dentro de la conversación no ha cambiado.
* El resto de la conversación permanece intacto.
* Si el mensaje editado estaba dentro del rango del resumen más reciente, dicho resumen está marcado como potencialmente desactualizado.
* Si existían propuestas de memoria pendientes, el usuario ha sido informado de la posible incoherencia.

---

## Casos de uso relacionados

* SendMessage (el mensaje que se edita fue creado durante el envío de un mensaje o recepción de una respuesta).
* RewindConversation (alternativa a la edición para modificar el rumbo de la historia).
* RegenerateReply (puede ejecutarse después de editar un mensaje del usuario para obtener una nueva respuesta).
* GenerateSummary (puede ser necesario regenerar el resumen si ha quedado desactualizado tras la edición).
* ApplyMemoryChanges (las propuestas pendientes pueden requerir revisión adicional tras la edición).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Regeneración automática del resumen más reciente cuando un mensaje editado afecte a su rango.
* Historial de versiones del mensaje permitiendo consultar y restaurar ediciones anteriores.
* Notificación proactiva al usuario de todas las consecuencias narrativas de la edición.
* Edición del rol (usuario o asistente) de un mensaje.
* Edición en línea sin recarga de la interfaz.
* Edición masiva o sustitución de texto en múltiples mensajes.

Estas funcionalidades no forman parte de la primera versión del proyecto.
