# Delete Memory

## Objetivo

Permitir al usuario eliminar manualmente una memoria dinámica existente asociada a una conversación sin necesidad de pasar por el flujo de propuestas de la IA.

---

## Motivación

El usuario tiene control total sobre la memoria dinámica en todo momento. Puede quererliberar una memoria que ha quedado obsoleta, que la IA registró por error o que ya no aporta valor narrativo a la historia.

La eliminación manual complementa el flujo de propuestas de eliminación que la IA puede sugerir, ofreciendo al usuario una vía directa sin depender de la aprobación de propuestas.

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
* La memoria que se desea eliminar debe existir dentro de la conversación.

---

## Flujo principal

1. El usuario selecciona una memoria en el panel de memoria dinámica y solicita eliminarla.

2. El sistema solicita confirmación.

3. El usuario confirma la operación.

4. El sistema elimina la memoria de la conversación.

5. El sistema confirma la eliminación y actualiza el panel de memoria dinámica.

---

## Flujos alternativos

### Cancelación por parte del usuario

Si el usuario cancela la operación durante la confirmación, no se realiza ningún cambio sobre la memoria dinámica.

---

## Reglas de negocio

* La eliminación es irreversible.
* La eliminación manual no invalida resúmenes ni mensajes.
* La eliminación manual no descarta propuestas de memoria pendientes que pudieran hacer referencia a la memoria eliminada. Si existieran, sus `targetMemoryId` quedan nulos (`onDelete: 'set null'`) y se descartarán automáticamente al procesarse en `ApplyMemoryChanges`.
* La operación no genera propuestas ni notificaciones a la IA.

---

## Cambios en el dominio

* Se elimina una entidad `Memory` existente.

No se crea ni modifica ninguna otra entidad.

---

## Postcondiciones

* La memoria ya no forma parte de la memoria dinámica de la conversación.
* La memoria eliminada no participa en futuras construcciones de contexto.
* Las propuestas de modificación pendientes que referenciaban a la memoria eliminada conservan su `targetMemoryId` nulo y se descartarán al procesarse.

---

## Casos de uso relacionados

* CreateMemory (alternativa para crear una memoria nueva manualmente).
* UpdateMemory (alternativa para modificar una memoria manualmente).
* ProposeMemoryChanges (flujo de eliminación propuesta por la IA).
* ApplyMemoryChanges (descarta automáticamente propuestas que apuntan a memorias inexistentes).
* PromptContextBuilder (utiliza las memorias restantes para construir el contexto).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Baja lógica de la memoria permitiendo restaurarla posteriormente.
* Eliminación masiva de múltiples memorias.

Estas funcionalidades no forman parte de la primera versión del proyecto.