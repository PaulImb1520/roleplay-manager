# Send Message

## Objetivo

Permitir al usuario continuar una conversación de roleplay enviando un nuevo mensaje al personaje, generando una respuesta mediante un modelo de inteligencia artificial y actualizando el estado narrativo de la conversación.

Este caso de uso representa el flujo principal de interacción del sistema.

---

## Motivación

Una conversación no consiste únicamente en intercambiar mensajes.

Cada nueva interacción modifica el estado narrativo de la historia y puede afectar a la memoria dinámica, los resúmenes y el contexto utilizado por el modelo.

Por este motivo, enviar un mensaje implica coordinar distintos procesos internos que mantienen la coherencia de la conversación sin que el usuario deba gestionarlos manualmente.

---

## Actores

### Actor principal

* Usuario.

### Actores secundarios

* Modelo de inteligencia artificial.
* Sistema.

---

## Entidades involucradas

* Conversation
* CharacterVersion
* CharacterCard
* Message
* Memory
* Summary

---

## Precondiciones

* La conversación debe existir.
* La conversación no debe estar archivada.
* Debe existir una versión válida del personaje asociada a la conversación.
* Debe existir un proveedor de inferencia disponible.
* El mensaje enviado por el usuario no puede estar vacío.

---

## Flujo principal

1. El usuario escribe un nuevo mensaje y lo envía.

2. El sistema registra el mensaje dentro de la conversación.

3. El sistema construye el contexto utilizando:

   * La versión del personaje.
   * Las tarjetas activas del personaje.
   * El resumen más reciente, si existe.
   * Las memorias dinámicas seleccionadas.
   * Los mensajes recientes definidos por la configuración de la conversación.

4. El sistema envía el contexto al proveedor de inteligencia artificial y la respuesta se transmite al usuario mediante streaming a medida que el modelo la genera.

5. Una vez completada la transmisión, el sistema almacena la respuesta completa como un nuevo mensaje del asistente.

6. Si es la primera interacción del usuario en la conversación (primer mensaje tras el saludo inicial), el sistema ejecuta `GenerateConversationTitle` para proponer un título descriptivo.

7. El sistema evalúa si corresponde generar un nuevo resumen según la configuración de la conversación.

8. Si corresponde, se ejecuta el caso de uso `GenerateSummary`. Una vez completado, el sistema ejecuta `GenerateConversationTitle` para actualizar el título con el nuevo estado narrativo.

9. El sistema solicita al modelo propuestas para crear, modificar o eliminar memorias dinámicas.

10. Si existen propuestas, estas quedan disponibles para que el usuario las revise.

11. La conversación queda lista para continuar.

---

## Flujos alternativos

### Error durante la generación

Si el proveedor de inferencia no consigue generar una respuesta, el mensaje del usuario permanece almacenado y la conversación conserva su estado.

El usuario podrá volver a intentar la generación posteriormente.

---

### Interrupción durante la generación

Si la generación es cancelada por el usuario, únicamente se conservará el mensaje enviado.

No se generarán memorias ni resúmenes.

---

### Proveedor no disponible

Si no existe ningún proveedor configurado o este no puede establecer conexión, el sistema informará el error y no iniciará el proceso de generación.

---

## Reglas de negocio

* El contexto siempre se construye inmediatamente antes de generar una respuesta.
* El modelo nunca recibe el historial completo de la conversación.
* El contexto se construye utilizando exclusivamente las fuentes de información definidas por el sistema.
* El resumen más reciente sustituye a los mensajes históricos que representa.
* Las memorias dinámicas son independientes de los resúmenes.
* Las propuestas de modificación de memorias nunca se aplican automáticamente.
* El usuario mantiene siempre la decisión final sobre cualquier cambio en la memoria dinámica.
* La generación de resúmenes depende exclusivamente de la configuración de la conversación.

---

## Cambios en el dominio

Al finalizar correctamente el caso de uso podrán producirse los siguientes cambios:

* Se crea un nuevo `Message` correspondiente al usuario.
* Se crea un nuevo `Message` correspondiente al asistente.
* Puede generarse un nuevo `Summary`.
* Puede generarse una propuesta de título para la conversación.
* Pueden generarse propuestas de modificación para la memoria dinámica.

Las modificaciones sobre la memoria dinámica no se aplican durante este caso de uso.

---

## Postcondiciones

* El mensaje del usuario queda registrado.
* La respuesta del asistente queda almacenada.
* La conversación mantiene su coherencia narrativa.
* Si corresponde, existe un nuevo resumen.
* Si corresponde, existe una propuesta de título para la conversación.
* Si corresponde, existen nuevas propuestas de actualización para la memoria dinámica.
* La conversación queda preparada para recibir el siguiente mensaje.

---

## Casos de uso relacionados

* PromptContextBuilder
* GenerateCharacterResponse
* GenerateSummary
* GenerateConversationTitle
* ProposeMemoryChanges
* ApplyMemoryChanges
* RegenerateReply
* EditMessage
* RewindConversation

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Generación de imágenes.
* Generación de audio y voces sintéticas.
* Soporte para múltiples personajes dentro de una misma conversación.
* Herramientas (Tools / Function Calling).
* Ejecución de acciones automáticas derivadas de la respuesta del modelo.
* Recuperación selectiva de contexto basada en capítulos o escenas.

Estas funcionalidades no forman parte de la primera versión del proyecto.

