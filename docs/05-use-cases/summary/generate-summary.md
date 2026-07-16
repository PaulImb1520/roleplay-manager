# Generate Summary

## Objetivo

Generar un nuevo resumen narrativo acumulativo de la conversación a partir del resumen anterior (si existe) y los mensajes nuevos, sintetizando la historia completa hasta el momento actual.

---

## Motivación

Las conversaciones de roleplay pueden extenderse durante cientos de mensajes.

Dado que los modelos de lenguaje poseen una ventana de contexto limitada, resulta inviable incluir el historial completo en cada generación.

Los resúmenes resuelven este problema condensando el estado narrativo de la historia en un bloque de texto que el sistema utiliza durante la construcción del contexto en lugar de los mensajes históricos.

Cada nuevo resumen reemplaza al anterior como representación del estado narrativo completo, evolucionando junto con la conversación sin aumentar constantemente su tamaño.

---

## Actores

### Actor principal

* Sistema.

### Actores secundarios

* Modelo de inteligencia artificial (para generar el contenido del resumen).
* Usuario (como revisor y editor del resultado).

---

## Entidades involucradas

* Conversation
* Summary
* Message

---

## Precondiciones

* La conversación debe existir.
* La conversación no debe estar archivada.
* Debe existir un proveedor de inferencia disponible.
* Deben existir mensajes nuevos desde el último resumen (o desde el inicio de la conversación si es el primer resumen) que justifiquen la generación.

---

## Flujo principal

1. El sistema recibe la solicitud de generar un nuevo resumen para una conversación específica.

2. Se recupera la configuración de la conversación para determinar el umbral de generación y otras preferencias relevantes.

3. Se recupera el resumen más reciente de la conversación, si existe.

4. Se recuperan los mensajes nuevos desde el último resumen (o todos los mensajes si es el primer resumen).

5. Se construye un contexto de generación compuesto por:

   * El resumen anterior, si existe.
   * Los mensajes nuevos desde el último resumen.

6. Se envía el contexto al proveedor de inteligencia artificial solicitando una síntesis narrativa.

7. El modelo genera un nuevo resumen que representa el estado narrativo completo de la historia hasta el momento actual, condensando la información del resumen anterior junto con los acontecimientos de los mensajes nuevos.

8. El sistema almacena el nuevo `Summary` asociado a la conversación, registrando:

   * El contenido generado.
   * La referencia al primer y último mensaje incluidos.
   * La fecha de generación.
   * El modelo y proveedor utilizados.

9. El sistema ejecuta `GenerateConversationTitle` para actualizar el título de la conversación basándose en el nuevo resumen.

10. El nuevo resumen queda disponible para su uso en la construcción del contexto de siguientes mensajes.

---

## Flujos alternativos

### Primer resumen de la conversación

Si no existe ningún resumen previo, el contexto de generación contendrá exclusivamente los mensajes iniciales de la conversación (incluyendo el saludo del personaje).

El modelo producirá una síntesis narrativa desde el comienzo de la historia.

---

### Error durante la generación

Si el proveedor de inferencia no consigue generar el resumen, el sistema no crea ningún `Summary` nuevo.

La conversación conserva el resumen anterior como representación narrativa vigente.

---

### Proveedor no disponible

Si no existe ningún proveedor configurado o este no puede establecer conexión, la generación del resumen se omite sin alterar el estado de la conversación.

---

### Respuesta incoherente o vacía

Si el modelo devuelve una respuesta vacía o manifiestamente incoherente, el sistema trata la generación como fallida y no persiste el resumen.

---

## Reglas de negocio

* Cada nuevo resumen representa el estado narrativo completo de la historia hasta el momento de su generación.
* El resumen anterior sirve como base para generar el siguiente, evitando procesar el historial completo desde cero.
* Los resúmenes no deben crecer indefinidamente: la IA debe sintetizar, eliminando detalles que hayan perdido relevancia narrativa.
* Únicamente el resumen más reciente se utiliza durante la construcción del contexto.
* El resumen no debe contener prompts del sistema, explicaciones técnicas, metadatos, instrucciones internas ni información de la memoria dinámica.
* El resumen debe centrarse exclusivamente en acontecimientos narrativos relevantes.
* El contenido del resumen es independiente de la memoria dinámica.
* La generación de un resumen no modifica los mensajes ni el estado narrativo inmediato de la conversación.
* El usuario puede editar manualmente cualquier resumen en cualquier momento.

---

## Cambios en el dominio

Al finalizar correctamente el caso de uso existirán las siguientes entidades nuevas:

* Un nuevo `Summary` asociado a la conversación.
* Puede actualizarse el título de la conversación mediante `GenerateConversationTitle`.

No se modifica ninguna entidad previamente existente. Los resúmenes anteriores permanecen almacenados como parte del historial de la conversación.

---

## Postcondiciones

* Existe un nuevo resumen que representa el estado narrativo completo de la conversación.
* El resumen anterior permanece almacenado en el historial.
* El nuevo resumen está disponible para ser utilizado en la construcción del contexto.
* El nuevo resumen puede ser inspeccionado y editado por el usuario.
* El título de la conversación puede haber sido actualizado para reflejar el nuevo estado narrativo.
* La conversación no ha sufrido ninguna otra modificación.

---

## Casos de uso relacionados

* SendMessage (invoca este caso de uso cuando se alcanza el umbral de mensajes).
* PromptContextBuilder (consume el resumen más reciente para construir el contexto).
* ProposeMemoryChanges (se ejecuta después de este caso de uso dentro del flujo de SendMessage).
* EditMessage (puede provocar la necesidad de regenerar resúmenes).
* RewindConversation (puede provocar la eliminación de resúmenes cuyo alcance quede fuera de la nueva línea temporal).
* GenerateConversationTitle (puede utilizar el resumen más reciente como fuente de información).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Resúmenes jerárquicos con múltiples niveles de abstracción.
* Identificación automática de capítulos o arcos narrativos dentro del resumen.
* Compresión selectiva basada en relevancia semántica.
* Regeneración automática cuando el usuario edite mensajes que afecten al contenido del resumen.
* Resúmenes diferenciados por personaje en conversaciones multipersonaje.
* Exportación de resúmenes como sinopsis independiente de la conversación.

Estas funcionalidades no forman parte de la primera versión del proyecto.
