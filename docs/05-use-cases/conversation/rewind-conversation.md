# Rewind Conversation

## Objetivo

Permitir al usuario retroceder la conversación a un punto anterior, eliminando todos los mensajes posteriores y los resúmenes cuyo alcance quede fuera de la nueva línea temporal, para retomar la historia desde ese momento.

---

## Motivación

El desarrollo de una historia de roleplay puede tomar direcciones que el usuario desee corregir o explorar de forma diferente.

En lugar de editar mensajes uno a uno, el usuario puede seleccionar un punto anterior de la conversación y descartar todo lo ocurrido a partir de ahí, manteniendo intacta la historia hasta ese momento.

Esta operación permite reescribir el rumbo narrativo sin perder el trabajo previo ni tener que iniciar una conversación desde cero.

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
* Summary
* MemoryChangeProposal (solo lectura; se descartan las propuestas pendientes)

---

## Precondiciones

* La conversación debe existir.
* La conversación no debe estar archivada.
* La conversación debe contener al menos dos mensajes (el greeting y al menos un mensaje posterior).
* El usuario debe seleccionar un mensaje existente como punto de retroceso.
* Debe existir al menos un mensaje después del punto seleccionado; de lo contrario la operación no tiene efecto.

---

## Flujo principal

1. El usuario selecciona un mensaje dentro de la conversación y solicita retroceder hasta ese punto.

2. El sistema muestra una confirmación indicando la cantidad de mensajes que serán eliminados y las consecuencias asociadas.

3. El usuario confirma la operación.

4. El sistema identifica todos los mensajes cuya posición es posterior al mensaje seleccionado.

5. El sistema elimina dichos mensajes de la conversación.

6. El sistema identifica todos los resúmenes cuyo rango (firstMessage o lastMessage) incluye mensajes que han sido eliminados.

7. El sistema elimina dichos resúmenes.

8. El sistema descarta todas las propuestas de modificación de memoria pendientes, ya que se basaban en un contexto que ya no existe.

9. Las memorias dinámicas existentes se conservan, ya que representan hechos relevantes independientes de la secuencia temporal de los mensajes.

10. El mensaje seleccionado pasa a ser el último mensaje de la conversación.

11. El sistema muestra la conversación en su nuevo estado, lista para continuar desde ese punto.

---

## Flujos alternativos

### Retroceso al primer mensaje

Si el usuario selecciona el saludo inicial como punto de retroceso, la conversación vuelve a su estado original tras la creación.

Todos los mensajes posteriores al greeting se eliminan, junto con todos los resúmenes y propuestas pendientes.

La conversación queda preparada para recibir el primer mensaje del usuario como si acabara de ser creada.

---

### Sin mensajes posteriores

Si el mensaje seleccionado es ya el último de la conversación, el sistema informa de que no existen mensajes posteriores que eliminar y finaliza la operación sin realizar cambios.

---

### Conversación archivada

Si la conversación se encuentra archivada, el sistema impide el retroceso e informa al usuario de que debe desarchivar la conversación antes de modificarla.

---

### Cancelación por parte del usuario

Si el usuario cancela la operación durante la confirmación, no se realiza ningún cambio sobre la conversación.

---

## Reglas de negocio

* Todos los mensajes posteriores al punto seleccionado se eliminan irreversiblemente.
* El mensaje seleccionado como punto de retroceso se conserva y pasa a ser el último mensaje de la conversación.
* Los resúmenes cuyo rango incluya mensajes eliminados se eliminan por completo.
* Los resúmenes cuyo rango esté totalmente contenido dentro de los mensajes conservados permanecen intactos.
* Las propuestas de modificación de memoria pendientes se descartan siempre, independientemente de su estado.
* Las memorias dinámicas activas se conservan íntegramente.
* La configuración local de la conversación no se modifica.
* La relación entre la conversación y la versión del personaje no se modifica.
* Esta operación no puede deshacerse.

---

## Cambios en el dominio

Al finalizar correctamente el caso de uso pueden producirse los siguientes cambios:

* Se eliminan cero o más `Message` de la conversación.
* Se eliminan cero o más `Summary` cuyo alcance incluya mensajes eliminados.
* Se descartan todas las `MemoryChangeProposal` pendientes.

Las memorias dinámicas, la configuración local y la versión del personaje asociada no se modifican.

---

## Postcondiciones

* El mensaje seleccionado es ahora el último mensaje de la conversación.
* No existen mensajes posteriores al punto de retroceso.
* Los resúmenes que describían mensajes ahora eliminados han sido eliminados.
* No existen propuestas de modificación de memoria pendientes.
* Las memorias dinámicas conservan su estado anterior.
* La conversación está lista para continuar desde el nuevo punto final.

---

## Casos de uso relacionados

* SendMessage (permite continuar la conversación desde el nuevo punto).
* EditMessage (alternativa para corregir mensajes individuales sin eliminar los posteriores).
* RegenerateReply (puede ejecutarse tras un retroceso para obtener una nueva respuesta).
* GenerateSummary (puede ser necesario regenerar resúmenes tras el retroceso).
* ApplyMemoryChanges (las propuestas descartadas durante el retroceso deberán generarse de nuevo si siguen siendo relevantes).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Ramificación de historias: crear una nueva conversación a partir del punto de retroceso sin perder la conversación original.
* Historial de retrocesos permitiendo deshacer un retroceso.
* Vista previa del estado de la conversación antes de confirmar el retroceso.
* Conservación selectiva de resúmenes al retroceder.
* Regeneración automática de resúmenes afectados tras el retroceso.
* Retroceso con preservación de ciertos mensajes como referencia.

Estas funcionalidades no forman parte de la primera versión del proyecto.
