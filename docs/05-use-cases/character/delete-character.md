# Delete Character

## Objetivo

Eliminar permanentemente un personaje y todos los datos asociados al mismo, incluyendo todas sus versiones, tarjetas, conversaciones, mensajes, memorias, resúmenes y configuraciones.

---

## Motivación

El usuario puede decidir que un personaje ya no es relevante y desea eliminarlo por completo del sistema.

Dado que todas las conversaciones, memorias y resúmenes pertenecen a conversaciones que a su vez pertenecen a versiones del personaje, eliminar un personaje implica eliminar en cascada todos los registros asociados.

Esta operación es irreversible y borra todo rastro del personaje y su historia.

---

## Actores

### Actor principal

* Usuario.

---

## Entidades involucradas

* Character
* CharacterVersion
* CharacterCard
* Conversation
* Message
* Memory
* Summary
* MemoryChangeProposal (pendientes, si las hay)

---

## Precondiciones

* El personaje debe existir.

---

## Flujo principal

1. El usuario accede a la pantalla del personaje y solicita eliminarlo.

2. El sistema muestra una confirmación detallada indicando todos los datos que serán eliminados irreversiblemente:

   * El personaje y todas sus versiones.
   * Todas las tarjetas asociadas a cada versión.
   * Todas las conversaciones asociadas a cualquier versión del personaje.
   * Todos los mensajes de dichas conversaciones.
   * Todas las memorias dinámicas de dichas conversaciones.
   * Todos los resúmenes de dichas conversaciones.
   * Todas las propuestas de memoria pendientes de dichas conversaciones.

3. El usuario confirma explícitamente la eliminación.

4. El sistema elimina todas las propuestas de memoria pendientes de todas las conversaciones asociadas.

5. El sistema elimina todas las memorias dinámicas de todas las conversaciones asociadas.

6. El sistema elimina todos los resúmenes de todas las conversaciones asociadas.

7. El sistema elimina todos los mensajes de todas las conversaciones asociadas.

8. El sistema elimina todas las conversaciones asociadas.

9. El sistema elimina todas las tarjetas de todas las versiones del personaje.

10. El sistema elimina todas las versiones del personaje.

11. El sistema elimina la entidad `Character`.

12. El sistema confirma que el personaje y todos sus datos han sido eliminados.

13. El sistema redirige al usuario al listado de personajes.

---

## Flujos alternativos

### Cancelación por parte del usuario

Si el usuario cancela la operación durante la confirmación, no se elimina ninguna entidad ni se modifica el estado del sistema.

---

### Error durante la eliminación

Si ocurre un error durante el proceso de eliminación, el sistema debe garantizar que ninguna entidad quede eliminada parcialmente.

La operación debe comportarse como una transacción atómica: o se elimina todo o no se elimina nada.

---

## Reglas de negocio

* La eliminación de un personaje es irreversible.
* Eliminar un personaje elimina todas sus versiones.
* Eliminar una versión elimina todas las conversaciones asociadas a ella.
* Eliminar una conversación elimina todos sus mensajes, memorias, resúmenes y propuestas de memoria.
* La operación debe ejecutarse como una transacción atómica.
* Una vez eliminado el personaje, no es posible recuperar ninguno de sus datos.
* Las conversaciones de otros personajes no se ven afectadas.

---

## Cambios en el dominio

Al finalizar correctamente el caso de uso se eliminan las siguientes entidades:

* La entidad `Character`.
* Todas las `CharacterVersion` del personaje.
* Todas las `CharacterCard` de cada versión.
* Todas las `Conversation` asociadas a cualquier versión.
* Todos los `Message` de cada conversación.
* Todas las `Memory` de cada conversación.
* Todos los `Summary` de cada conversación.
* Todas las `MemoryChangeProposal` pendientes de cada conversación.

No se modifica ninguna entidad fuera del ámbito del personaje eliminado.

---

## Postcondiciones

* El personaje ya no existe en el sistema.
* No queda ningún registro asociado al personaje.
* Las conversaciones, mensajes, memorias, resúmenes y configuraciones del personaje han sido eliminados.
* El resto del sistema permanece inalterado.

---

## Casos de uso relacionados

* CreateCharacter (crea el personaje que este caso de uso elimina).
* UpdateCharacter (alternativa a eliminar para conservar el personaje con modificaciones).
* ArchiveConversation (alternativa a eliminar para conservar las conversaciones sin mostrarlas).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Eliminación con confirmación mediante escritura del nombre del personaje.
* Eliminación diferida con papelera de reciclaje y restauración dentro de un periodo.
* Exportación de datos del personaje antes de eliminarlo.
* Eliminación selectiva de conversaciones sin eliminar el personaje completo.
* Historial de personajes eliminados.

Estas funcionalidades no forman parte de la primera versión del proyecto.
