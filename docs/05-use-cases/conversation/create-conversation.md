# Create Conversation

## Objetivo

Crear una nueva conversación asociada a una versión específica de un personaje, inicializando todo el estado narrativo necesario para comenzar una historia desde cero.

Cada conversación representa una línea temporal independiente dentro del sistema.

---

## Motivación

Las conversaciones nunca se vinculan directamente a un personaje, sino a una versión concreta del mismo.

Esto garantiza que la definición del personaje permanezca inmutable durante toda la historia, incluso si posteriormente el usuario crea nuevas versiones con cambios en su apariencia, personalidad o comportamiento.

Crear una conversación implica iniciar una nueva historia completamente independiente de cualquier conversación anterior.

---

## Actores

### Actor principal

* Usuario.

### Actores secundarios

* Sistema (cuando el caso de uso es invocado automáticamente desde `CreateCharacter`).

---

## Entidades involucradas

* CharacterVersion
* Conversation
* Message

---

## Precondiciones

Debe existir una `CharacterVersion` válida.

Si la conversación es creada manualmente, el usuario deberá seleccionar la versión del personaje con la que desea iniciar la nueva historia.

La versión seleccionada no podrá modificarse una vez creada la conversación.

---

## Flujo principal

1. El usuario selecciona una versión del personaje o el sistema recibe una versión recién creada.

2. El sistema crea una nueva `Conversation` asociada a dicha versión.

3. Se inicializan las configuraciones propias de la conversación utilizando los valores por defecto del sistema.

4. La conversación comienza sin memorias dinámicas ni resúmenes.

5. El mensaje inicial definido en la versión del personaje se registra como el primer mensaje generado por el asistente.

6. La conversación queda preparada para recibir el primer mensaje del usuario.

7. El sistema muestra la conversación al usuario.

---

## Flujos alternativos

### Versión inexistente

Si la versión seleccionada no existe, la conversación no podrá crearse.

---

### Versión eliminada

Si la versión ya no está disponible, el sistema solicitará seleccionar otra versión válida.

---

### Error inesperado

Si ocurre un error durante la creación, ninguna entidad deberá persistirse parcialmente.

La operación deberá ejecutarse como una transacción atómica.

---

## Reglas de negocio

* Toda conversación pertenece exactamente a una única versión del personaje.
* Una versión puede tener múltiples conversaciones.
* Cada conversación representa una historia completamente independiente.
* Las memorias dinámicas siempre comienzan vacías.
* Los resúmenes siempre comienzan vacíos.
* El primer mensaje de la conversación corresponde al greeting definido por la versión del personaje.
* Las configuraciones de la conversación son locales y no afectan a otras conversaciones.
* Una conversación nunca cambia de versión una vez creada.

---

## Cambios en el dominio

Al finalizar correctamente el caso de uso existirán las siguientes entidades nuevas:

* Una `Conversation`.
* Un `Message` correspondiente al saludo inicial.

No se modifican la `CharacterVersion` ni las tarjetas del personaje.

---

## Postcondiciones

* Existe una nueva conversación asociada a una única versión del personaje.
* La conversación posee su primer mensaje generado por el asistente.
* La memoria dinámica está vacía.
* No existen resúmenes.
* Las configuraciones locales han sido inicializadas.
* La conversación está lista para recibir el primer mensaje del usuario.

---

## Casos de uso relacionados

* CreateCharacter
* CreateCharacterVersion
* SendMessage
* ArchiveConversation
* UpdateConversationSettings

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Creación de conversaciones con múltiples personajes.
* Escenarios reutilizables.
* Plantillas de configuración de conversación.
* Importación de conversaciones.
* Ramificación de historias (crear una nueva conversación a partir de un punto específico de otra conversación).
* Configuraciones heredadas entre conversaciones.

Estas funcionalidades no forman parte de la primera versión del proyecto.