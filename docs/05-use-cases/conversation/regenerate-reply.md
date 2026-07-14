# Regenerate Reply

## Objetivo

Permitir al usuario solicitar una nueva respuesta del asistente para el último mensaje enviado, sustituyendo el contenido actual de la respuesta por una generación alternativa sin modificar el resto del estado de la conversación.

---

## Motivación

La respuesta generada por la inteligencia artificial puede no ajustarse a las expectativas del usuario en cuanto a tono, dirección narrativa, personalidad del personaje o contenido.

En lugar de editar manualmente la respuesta o retroceder la conversación, el usuario puede solicitar una regeneración que produzca un nuevo mensaje alternativo.

Cada regeneración conserva la versión anterior en un historial temporal asociado al mensaje. Cuando el usuario envía su siguiente mensaje, la versión aceptada se consolida y las alternativas se descartan, manteniendo únicamente la línea canónica definitiva de la conversación.

---

## Actores

### Actor principal

* Usuario.

### Actores secundarios

* Sistema.
* Modelo de inteligencia artificial.

---

## Entidades involucradas

* Conversation
* Message
* CharacterVersion
* CharacterCard
* Memory
* Summary (solo lectura; no se modifica)

---

## Precondiciones

* La conversación debe existir.
* La conversación no debe estar archivada.
* Debe existir al menos un mensaje del usuario seguido de una respuesta del asistente.
* La regeneración solo está disponible para el último mensaje con rol `assistant`.
* Debe existir un proveedor de inferencia disponible.

---

## Flujo principal

1. El usuario solicita regenerar la última respuesta del asistente.

2. El sistema guarda el contenido actual de la respuesta en el historial de regeneraciones del mensaje (`alternatives`), preservando la versión anterior como alternativa disponible.

3. El sistema construye el contexto de generación utilizando el mismo estado de la conversación que en el envío original:

   * La versión del personaje.
   * Las tarjetas activas del personaje.
   * El resumen más reciente, si existe.
   * Las memorias dinámicas seleccionadas.
   * Los mensajes recientes, excluyendo la respuesta que se está regenerando.
   * El último mensaje del usuario, que permanece como la entrada a responder.

4. El sistema envía el contexto al proveedor de inteligencia artificial.

5. El modelo genera una nueva respuesta.

6. El sistema sustituye el contenido del mensaje del asistente por la nueva respuesta generada.

7. El mensaje queda disponible para su revisión por parte del usuario.

8. Las propuestas de modificación de memoria pendientes asociadas a este ciclo se conservan, aunque el sistema notifica al usuario de que pueden no reflejar con precisión la nueva respuesta.

---

## Flujos alternativos

### Múltiples regeneraciones consecutivas

Si el usuario solicita una regeneración cuando ya existe un historial de alternativas, el sistema mueve el contenido actual al inicio de la lista `alternatives` y genera una nueva respuesta.

El historial acumula todas las versiones previas ordenadas de la más reciente a la más antigua.

---

### Error durante la generación

Si el proveedor de inferencia no consigue generar una nueva respuesta, el sistema restaura el contenido anterior desde el historial de regeneraciones.

La conversación conserva su estado anterior sin modificaciones.

---

### Proveedor no disponible

Si no existe ningún proveedor configurado o este no puede establecer conexión, el sistema informa del error y la respuesta actual permanece intacta.

---

### Interrupción por parte del usuario

Si el usuario cancela la regeneración antes de recibir la respuesta, el sistema restaura el contenido anterior y descarta la regeneración incompleta.

---

### Regeneración sobre un mensaje editado

Si el último mensaje del asistente fue previamente editado mediante `EditMessage`, la regeneración sustituye tanto el contenido editado como las alternativas previas.

El contenido editado se conserva en el historial de regeneraciones junto con las versiones generadas por la IA.

---

## Reglas de negocio

* Solo el último mensaje con rol `assistant` puede ser regenerado.
* Cada regeneración sustituye el contenido actual y mueve la versión anterior al historial de regeneraciones.
* El historial de regeneraciones se limpia automáticamente cuando el usuario envía un nuevo mensaje.
* El contexto de generación se construye excluyendo la respuesta que se está regenerando.
* El resumen más reciente no se modifica durante la regeneración.
* Las propuestas de modificación de memoria pendientes no se descartan ni se regeneran automáticamente.
* El mensaje del usuario que originó la respuesta no se modifica.
* La posición del mensaje dentro de la conversación no cambia.
* La regeneración no crea ni elimina mensajes; únicamente modifica el contenido del mensaje del asistente.

---

## Cambios en el dominio

Al finalizar correctamente el caso de uso pueden producirse los siguientes cambios:

* El contenido del último `Message` con rol `assistant` se actualiza con la nueva respuesta.
* El contenido anterior se añade al historial de regeneraciones del mensaje.

No se crea ni elimina ninguna entidad.

Las memorias, resúmenes y propuestas de memoria permanecen inalterados.

---

## Postcondiciones

* El último mensaje del asistente contiene la nueva respuesta generada.
* La versión anterior está disponible en el historial de regeneraciones del mensaje.
* El resto de la conversación permanece intacto.
* La conversación está lista para que el usuario revise la nueva respuesta y decida si continúa o solicita otra regeneración.

---

## Casos de uso relacionados

* SendMessage (crea el mensaje del asistente que este caso de uso regenera).
* EditMessage (alternativa para modificar manualmente la respuesta sin regenerarla).
* RewindConversation (alternativa más drástica que elimina mensajes posteriores).
* BuildPromptContext (invocado internamente para construir el contexto de la regeneración).
* GenerateCharacterResponse (invocado internamente para generar la nueva respuesta).
* GenerateSummary (puede ser necesario regenerar el resumen si la nueva respuesta altera significativamente la narrativa).
* ProposeMemoryChanges (puede ejecutarse después si se desean nuevas propuestas basadas en la respuesta regenerada).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Regeneración de respuestas arbitrarias del historial, no solo la última.
* Regeneración automática del resumen tras una regeneración que altere significativamente la narrativa.
* Regeneración de propuestas de memoria basadas en la nueva respuesta.
* Comparación visual entre versiones alternativas para que el usuario seleccione la preferida.
* Vista previa de la regeneración sin sustituir automáticamente el contenido.
* Historial persistente de regeneraciones permitiendo restaurar versiones anteriores incluso después de aceptadas.

Estas funcionalidades no forman parte de la primera versión del proyecto.
