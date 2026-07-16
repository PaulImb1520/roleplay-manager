# Delete Summary

## Objetivo

Permitir al usuario eliminar manualmente cualquier resumen existente dentro de una conversación.

---

## Motivación

El usuario tiene control total sobre la información almacenada. Un resumen puede contener inexactitudes graves, describir una historia que el usuario prefiere olvidar o simplemente no aportar valor narrativo que justifique su preservación.

La eliminación manual complementa el flujo de generación automática permitiendo al usuario depurar el historial de resúmenes sin necesidad de regenerar o editar.

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
* El resumen que se desea eliminar debe existir dentro de la conversación.

---

## Flujo principal

1. El usuario abre elvisor de resúmenes de la conversación y selecciona el resumen que desea eliminar.

2. El sistema solicita confirmación.

3. El usuario confirma la operación.

4. El sistema elimina el resumen de la conversación.

5. El sistema confirma la eliminación y actualiza elvisor de resúmenes.

6. Si el resumen eliminado era el más reciente, el sistema utiliza automáticamente el resumen cronológicamente anterior como referencia para la siguiente construcción de contexto.

---

## Flujos alternativos

### Cancelación por parte del usuario

Si el usuario cancela la operación durante la confirmación, no se realiza ningún cambio sobre el historial de resúmenes.

---

### Resumen no encontrado

Si el resumen que se intenta eliminar ya no existe, el sistema informa del error y cancela la operación.

---

## Reglas de negocio

* La eliminación es irreversible.
* La eliminación no elimina los mensajes que el resumen representaba; únicamente elimina la síntesis narrativa.
* Si se elimina el resumen más reciente, el `PromptContextBuilder` utilizará automáticamente el resumen cronológicamente anterior en la siguiente construcción de contexto.
* La eliminación no desencadena ninguna regeneración automática de resúmenes.

---

## Cambios en el dominio

* Se elimina una entidad `Summary` existente.

No se crea ni modifica ninguna otra entidad.

---

## Postcondiciones

* El resumen ya no forma parte del historial de resúmenes de la conversación.
* Si el resumen eliminado era el más reciente, el `PromptContextBuilder` utilizará el resumen cronológicamente anterior en la siguiente construcción de contexto.
* Si no quedan resúmenes en la conversación, el `PromptContextBuilder` omitirá el resumen del contexto y utilizará exclusivamente los mensajes recientes.

---

## Casos de uso relacionados

* GenerateSummary (genera resúmenes automáticos que este caso de uso elimina).
* UpdateSummary (alternativa para modificar un resumen manualmente).
* PromptContextBuilder (consume el resumen más reciente para construir el contexto).
* SendMessage (puede generar un nuevo resumen tras el siguiente envío si la configuración lo justifica).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Baja lógica del resumen permitiendo restaurarlo posteriormente.
* Eliminación masiva de múltiples resúmenes.

Estas funcionalidades no forman parte de la primera versión del proyecto.