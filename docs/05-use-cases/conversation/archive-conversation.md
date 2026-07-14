# Archive Conversation

## Objetivo

Permitir al usuario archivar o reactivar una conversación, cambiando su estado entre `Activa` y `Archivada` sin perder ni modificar ninguno de sus datos narrativos.

---

## Motivación

Las conversaciones no poseen un final explícito y permanecen disponibles indefinidamente.

A medida que el usuario acumula conversaciones, puede resultar útil ocultar aquellas que ya no son activas sin eliminar su contenido, manteniendo la posibilidad de retomarlas en el futuro.

El archivo constituye una operación reversible que permite organizar el listado de conversaciones sin consecuencias narrativas.

---

## Actores

### Actor principal

* Usuario.

### Actores secundarios

* Sistema.

---

## Entidades involucradas

* Conversation

---

## Precondiciones

* La conversación debe existir.
* Para archivar: la conversación debe encontrarse en estado `Activa`.
* Para reactivar: la conversación debe encontrarse en estado `Archivada`.

---

## Flujo principal

### Archivar una conversación

1. El usuario selecciona una conversación activa y solicita archivarla.

2. El sistema muestra una confirmación indicando que la conversación dejará de aparecer en el listado principal, pero conservará toda su información.

3. El usuario confirma la operación.

4. El sistema cambia el estado de la conversación a `Archivada`.

5. La conversación deja de aparecer en el listado principal de conversaciones activas.

6. El sistema confirma que la conversación ha sido archivada.

---

### Reactivar una conversación

1. El usuario accede al listado de conversaciones archivadas y selecciona una conversación para reactivar.

2. El sistema muestra una confirmación indicando que la conversación volverá al listado principal con toda su información intacta.

3. El usuario confirma la operación.

4. El sistema cambia el estado de la conversación a `Activa`.

5. La conversación vuelve a aparecer en el listado principal de conversaciones activas.

6. El sistema confirma que la conversación ha sido reactivada.

---

## Flujos alternativos

### Cancelación por parte del usuario

Si el usuario cancela la operación durante la confirmación, no se realiza ningún cambio sobre el estado de la conversación.

---

### Conversación ya archivada

Si el usuario intenta archivar una conversación que ya se encuentra archivada, el sistema informa de que la conversación ya se encuentra en ese estado y finaliza la operación.

---

### Conversación ya activa

Si el usuario intenta reactivar una conversación que ya se encuentra activa, el sistema informa de que la conversación ya se encuentra en ese estado y finaliza la operación.

---

### Conversación eliminada

Si la conversación fue eliminada antes de completar la operación, el sistema informa del error y cancela la operación.

---

## Reglas de negocio

* Archivar una conversación no modifica su contenido.
* Reactivar una conversación no altera su estado narrativo.
* Una conversación archivada conserva todos sus mensajes, memorias, resúmenes y configuraciones.
* Una conversación archivada no puede modificarse hasta ser reactivada.
* Una conversación archivada puede consultarse en cualquier momento.
* El archivo y la reactivación son operaciones exclusivamente de organización; no tienen impacto en el dominio narrativo.
* El estado de la conversación es independiente de su contenido.

---

## Cambios en el dominio

Al finalizar correctamente el caso de uso se produce el siguiente cambio:

* El estado de la `Conversation` cambia de `Activa` a `Archivada`, o viceversa.

No se crea ni elimina ninguna entidad. El contenido narrativo de la conversación permanece intacto.

---

## Postcondiciones

### Al archivar

* La conversación se encuentra en estado `Archivada`.
* La conversación no aparece en el listado principal de conversaciones activas.
* La conversación está disponible en el listado de conversaciones archivadas.
* Todo el contenido narrativo permanece intacto.
* La conversación no puede modificarse hasta ser reactivada.

### Al reactivar

* La conversación se encuentra en estado `Activa`.
* La conversación vuelve a aparecer en el listado principal de conversaciones activas.
* Todo el contenido narrativo permanece intacto.
* La conversación puede modificarse y continuarse con normalidad.

---

## Casos de uso relacionados

* CreateConversation (toda conversación comienza en estado activo).
* SendMessage (bloqueado mientras la conversación esté archivada).
* EditMessage (bloqueado mientras la conversación esté archivada).
* RewindConversation (bloqueado mientras la conversación esté archivada).
* RegenerateReply (bloqueado mientras la conversación esté archivada).
* ApplyMemoryChanges (bloqueado mientras la conversación esté archivada).
* UpdateConversationSettings (bloqueado mientras la conversación esté archivada).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Archivado automático tras un periodo de inactividad configurable.
* Archivado masivo de múltiples conversaciones.
* Categorías o etiquetas dentro del archivo.
* Búsqueda y filtros dentro de conversaciones archivadas.
* Archivado con expiración programada (eliminación automática tras un periodo).
* Estadísticas de conversaciones archivadas.

Estas funcionalidades no forman parte de la primera versión del proyecto.
