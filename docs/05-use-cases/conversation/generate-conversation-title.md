# Generate Conversation Title

## Objetivo

Generar una propuesta de título descriptivo para una conversación basándose en su contenido narrativo, facilitando al usuario la identificación y organización de sus historias.

---

## Motivación

Una conversación puede comenzar sin título o mantener el título genérico asignado por defecto.

A medida que la historia se desarrolla, el sistema puede analizar el contenido de la conversación —especialmente los mensajes iniciales o los resúmenes narrativos— para proponer un título descriptivo que refleje la temática, los personajes o los acontecimientos principales de la historia.

Este título es una propuesta: el usuario puede aceptarlo, modificarlo o descartarlo, manteniendo siempre el control sobre cómo se identifica cada conversación.

---

## Actores

### Actor principal

* Sistema.

### Actores secundarios

* Modelo de inteligencia artificial.
* Usuario (como revisor y decisor final del título).

---

## Entidades involucradas

* Conversation
* Summary (solo lectura, si existe)

---

## Precondiciones

* La conversación debe existir.
* La conversación debe contener al menos un intercambio completo entre el usuario y el asistente.
* Si la conversación ya posee un título definido manualmente por el usuario, el sistema no debe sobrescribirlo sin confirmación.

---

## Flujo principal

### Generación tras la primera interacción

1. El usuario ha completado su primer intercambio con el asistente (mensaje del usuario + respuesta del asistente).

2. El sistema detecta que la conversación no posee un título personalizado.

3. El sistema recupera los mensajes iniciales de la conversación (saludo del personaje, primer mensaje del usuario y primera respuesta del asistente).

4. El sistema envía dichos mensajes al modelo de inteligencia artificial solicitando un título breve y descriptivo.

5. El modelo genera una propuesta de título.

6. El sistema presenta la propuesta al usuario para que decida si desea aceptarla, modificarla o descartarla.

7. Si el usuario acepta, el título se asigna a la conversación.
8. Si el usuario modifica la propuesta, el título editado se asigna a la conversación.
9. Si el usuario descarta la propuesta, la conversación permanece sin título (o con su título anterior).

---

### Generación tras un nuevo resumen

1. El sistema acaba de generar un nuevo `Summary` para la conversación.

2. El sistema detecta que la conversación no posee un título personalizado definido por el usuario, o que el título actual fue generado automáticamente en una iteración anterior.

3. El sistema recupera el resumen más reciente como fuente principal de información.

4. El sistema envía el resumen al modelo de inteligencia artificial solicitando un título breve y descriptivo que refleje el estado narrativo actual.

5. El modelo genera una propuesta de título actualizada.

6. El sistema reemplaza el título generado anteriormente por la nueva propuesta.

7. Si el usuario había personalizado el título manualmente, el sistema no genera ninguna propuesta ni modifica el título existente.

---

## Flujos alternativos

### Conversación con título personalizado

Si el usuario ha definido manualmente un título para la conversación, el sistema no genera propuestas automáticas ni sustituye el título existente hasta que ocurra un nuevo resumen de la historia.

El usuario puede solicitar explícitamente una sugerencia de título en cualquier momento.

---

### Error durante la generación

Si el proveedor de inferencia no consigue generar una propuesta de título, el sistema no modifica el título actual de la conversación.

---

### Respuesta incoherente

Si el modelo devuelve un título manifiestamente incoherente o vacío, el sistema descarta la respuesta y conserva el título actual sin modificaciones.

---

### Generación manual solicitada por el usuario

El usuario puede solicitar manualmente una sugerencia de título en cualquier momento, independientemente de si la conversación posee o no un título personalizado.

En este caso, el sistema genera una propuesta basada en el contenido actual de la conversación y la presenta al usuario para su revisión, sin aplicarla automáticamente.

---

## Reglas de negocio

* El título generado es siempre una propuesta, nunca un valor aplicado automáticamente sin revisión del usuario.
* Si el usuario ha definido un título manualmente, el sistema no genera propuestas automáticas hasta que se genere un nuevo resumen.
* El título debe ser breve y descriptivo, reflejando el contenido narrativo de la conversación.
* El título no forma parte del contenido narrativo de la conversación y no afecta a la generación de respuestas.
* El usuario puede cambiar el título en cualquier momento, independientemente de su origen.
* Este caso de uso no modifica ninguna entidad del dominio más allá del título de la conversación.

---

## Cambios en el dominio

Al finalizar correctamente el caso de uso puede producirse el siguiente cambio:

* El título de la `Conversation` se actualiza con el valor aceptado por el usuario (ya sea el generado, el modificado o el manual).

No se crea ni elimina ninguna entidad. El contenido narrativo de la conversación permanece intacto.

---

## Postcondiciones

* La conversación posee un título descriptivo (si el usuario aceptó la propuesta).
* La conversación mantiene su título anterior (si el usuario descartó la propuesta).
* El título no afecta al desarrollo narrativo de la conversación.
* La conversación es más fácilmente identificable en los listados del usuario.

---

## Casos de uso relacionados

* SendMessage (tras el primer intercambio se desencadena la generación automática del título).
* GenerateSummary (cada nuevo resumen puede desencadenar una actualización del título automático).
* CreateConversation (la conversación se crea inicialmente sin título).
* UpdateConversationSettings (el usuario puede modificar el título manualmente en cualquier momento).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Generación de títulos basados en géneros narrativos o tono de la historia.
* Subtítulos o descripciones cortas generadas automáticamente.
* Múltiples sugerencias entre las que el usuario puede elegir.
* Personalización del estilo del título (serio, humorístico, épico, etc.).
* Títulos que incluyan nombres de personajes o lugares relevantes de la historia.
* Historial de títulos anteriores.

Estas funcionalidades no forman parte de la primera versión del proyecto.
