# Create Character

## Objetivo

Crear un nuevo personaje junto con su primera versión y preparar todo lo necesario para comenzar una conversación de roleplay.

Este caso de uso representa el punto de entrada principal del sistema.

---

## Motivación

Los personajes son entidades versionadas e inmutables durante una conversación.

Por esta razón, crear un personaje implica generar automáticamente una primera versión que represente su estado inicial.

A partir de esa versión se crea una conversación inicial cuyo primer mensaje corresponde al saludo definido por el usuario.

De esta manera, toda conversación queda asociada permanentemente a una versión específica del personaje, garantizando la coherencia narrativa incluso si el personaje es modificado posteriormente.

---

## Actores

### Actor principal

* Usuario.

### Actores secundarios

Ninguno.

---

## Entidades involucradas

* Character
* CharacterVersion
* CharacterCard
* Conversation
* Message

---

## Precondiciones

El usuario debe proporcionar, como mínimo:

* Nombre del personaje.
* Subtítulo o descripción breve.
* Mensaje inicial (Greeting).
* Imagen de perfil.
* Descripción general.

Opcionalmente podrá proporcionar:

* Instrucciones adicionales para la IA.
* Cualquier cantidad de tarjetas de personaje.

Todas las tarjetas deberán poseer un título y un contenido; también deben ser ordenadas manualmente por importancia mediante un drag & drop.

---

## Flujo principal

1. El usuario completa la información del personaje.

2. El sistema valida que los datos obligatorios sean correctos.

3. El sistema crea la entidad `Character`.

4. El sistema crea automáticamente la primera `CharacterVersion`.

5. Todas las tarjetas definidas por el usuario quedan asociadas a dicha versión respetando el orden establecido.

6. El sistema crea una nueva `Conversation` asociada a la versión recién creada.

7. El mensaje inicial definido por el usuario se registra como el primer mensaje generado por el asistente dentro de la conversación.

8. La conversación queda preparada para recibir el primer mensaje del usuario.

9. El sistema redirige al usuario a la pantalla de conversación.

---

## Flujos alternativos

### Información obligatoria incompleta

Si alguno de los campos obligatorios no ha sido completado, el sistema impedirá la creación del personaje e indicará los campos pendientes.

---

### Tarjetas vacías

Las tarjetas cuyo título o contenido estén vacíos no podrán formar parte de la versión creada.

El usuario deberá corregirlas o eliminarlas antes de continuar.

---

### Error inesperado

Si ocurre un error durante el proceso de creación, ninguna entidad deberá persistirse parcialmente.

La operación deberá comportarse como una transacción atómica.

---

## Reglas de negocio

* Todo personaje debe poseer al menos una versión.
* La primera versión se crea automáticamente.
* Toda conversación pertenece exactamente a una versión del personaje.
* La conversación inicial se crea automáticamente.
* El mensaje inicial pertenece a la conversación, no al personaje.
* Las tarjetas mantienen el orden definido por el usuario.
* Cada tarjeta pertenece exclusivamente a una única versión.
* Las versiones son inmutables una vez creadas.
* El personaje no almacena estado narrativo.

---

## Cambios en el dominio

Al finalizar correctamente el caso de uso existirán las siguientes entidades nuevas:

* Un `Character`.
* Una `CharacterVersion`.
* Cero o más `CharacterCard`.
* Una `Conversation`.
* Un `Message` correspondiente al saludo inicial.

No se modifica ninguna entidad previamente existente.

---

## Postcondiciones

* El personaje queda disponible para futuras conversaciones.
* Existe una primera versión completamente definida.
* Existe una conversación activa asociada a dicha versión.
* El saludo inicial aparece como el primer mensaje de la conversación.
* La conversación está lista para continuar con el primer mensaje del usuario.

---

## Casos de uso relacionados

* CreateCharacterVersion
* UpdateCharacter
* CreateConversation
* SendMessage

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Importación y exportación de personajes.
* Plantillas reutilizables.
* Duplicación de personajes.
* Creación automática mediante asistentes impulsados por IA.
* Asignación de etiquetas o categorías.
* Generación automática de imágenes de perfil mediante IA.

Estas funcionalidades no forman parte de la primera versión del proyecto.
