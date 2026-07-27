# Handle OOC (Out-of-Character)

## Objetivo

Detectar, procesar y gestionar las meta-instrucciones que el usuario incluye entre delimitadores `//...//` en sus mensajes, permitiendo que el modelo de IA reciba instrucciones fuera del personaje sin romper la inmersión narrativa.

---

## Motivación

Durante una conversación de roleplay, el usuario puede necesitar dar instrucciones al modelo que no forman parte de la narrativa del personaje. Por ejemplo, solicitar la creación de memorias, corregir el rumbo de la historia, o pedir un cambio de tono.

Sin un mecanismo explícito, estas instrucciones se mezclarían con el contenido narrativo, confundiendo al modelo y degradando la calidad del roleplay.

El delimitador `//...//` (out-of-character, OOC) permite al usuario separar claramente las instrucciones técnicas del contenido narrativo, y al sistema gestionarlas de forma adecuada.

---

## Actores

### Actor principal

* Sistema.

### Actores secundarios

* Usuario (genera las meta-instrucciones).
* Modelo de inteligencia artificial (consume las instrucciones).

---

## Entidades involucradas

* Message

---

## Precondiciones

* Debe existir un mensaje del usuario con contenido que contenga uno o varios bloques `//...//`.
* El sistema debe estar configurado para procesar OOC (habilitado por defecto cuando se usa `PromptContextBuilder`).

---

## Flujo principal

1. El sistema recibe un mensaje del usuario.

2. El sistema analiza el contenido del mensaje en busca de bloques delimitados por `//...//`.

3. Si se encuentra OOC en el mensaje:

   a. El contenido OOC se extrae y se conserva para su procesamiento.

   b. El contenido limpio (sin OOC) se utiliza como mensaje del usuario para la construcción del contexto histórico.

4. El sistema incluye una sección en el system prompt explicando al modelo:
   - Que los bloques `//...//` son meta-instrucciones del usuario, no parte del roleplay.
   - Que debe ejecutar las instrucciones contenidas en el OOC (por ejemplo, llamar a herramientas si se solicita).
   - Que no debe responder al OOC en personaje (no narrar que el personaje "asintió" o "leyó la nota").

5. El último mensaje del usuario conserva el OOC intacto en el contexto enviado al modelo, para que este pueda leer y ejecutar las instrucciones.

6. Los mensajes anteriores del usuario tienen su OOC filtrado (solo se envía el contenido limpio), evitando que instrucciones antiguas sigan afectando al modelo.

---

## Flujos alternativos

### Sin OOC en el mensaje

Si el mensaje no contiene bloques `//...//`, se utiliza tal cual sin ningún procesamiento adicional.

---

### Múltiples bloques OOC en un mismo mensaje

Si el mensaje contiene múltiples bloques `//...//`, todos se extraen y se conservan. El contenido limpio resultante elimina todos los delimitadores.

---

### OOC sin instrucciones ejecutables

Si el OOC contiene texto que no corresponde a ninguna instrucción ejecutable (por ejemplo, una nota para el usuario), el modelo lo recibe en el contexto pero no tiene ninguna acción que ejecutar. El bloque se conserva igualmente en el último mensaje.

---

### filterOocFromHistory desactivado

Si la conversación tiene `filterOocFromHistory` desactivado, el OOC no se filtra del historial y el modelo recibe todos los mensajes completos, incluyendo los delimitadores `//...//`.

---

## Reglas de negocio

* El delimitador OOC es `//texto//`. Cualquier texto entre `//` dobles se considera OOC.
* El OOC solo se filtra del historial de mensajes previos al último mensaje del usuario.
* El último mensaje del usuario conserva el OOC intacto para que el modelo lo procese.
* El modelo recibe instrucciones en el system prompt para no responder al OOC en personaje.
* El filtrado de OOC no modifica el contenido persistido del mensaje; solo afecta al contexto enviado al modelo.
* Los mensajes del asistente no se filtran nunca.

---

## Cambios en el dominio

Este caso de uso no modifica ninguna entidad del dominio.

Solo transforma el contenido de los mensajes durante la construcción del contexto.

---

## Postcondiciones

* El contexto enviado al modelo contiene:
  - El historial de mensajes sin OOC en los mensajes previos al último.
  - El último mensaje del usuario con OOC intacto.
  - Instrucciones en el system prompt sobre cómo manejar el OOC.
* Los mensajes persistidos en la base de datos no han sido modificados.

---

## Casos de uso relacionados

* SendMessage (invoca este caso de uso durante la construcción del contexto).
* PromptContextBuilder (implementa el filtrado de OOC como parte de la construcción del contexto).
* RegenerateReply (también aplica filtrado de OOC durante la regeneración).
* ContinueConversation (también aplica filtrado de OOC al continuar).
