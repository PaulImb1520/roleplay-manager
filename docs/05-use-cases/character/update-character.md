# Update Character

## Objetivo

Permitir al usuario modificar la definición de un personaje existente, creando automáticamente una nueva versión que preserve el estado actual de las conversaciones activas y sirva como base para futuras conversaciones.

---

## Motivación

Los personajes no se modifican directamente. En su lugar, cada cambio en la definición de un personaje genera una nueva versión inmutable.

Este mecanismo garantiza que las conversaciones en curso continúen utilizando exactamente la definición del personaje con la que fueron creadas, evitando modificaciones retrospectivas que romperían la coherencia narrativa.

Las conversaciones nuevas utilizarán la versión más reciente, mientras que las existentes permanecerán asociadas a su versión original.

---

## Actores

### Actor principal

* Usuario.

### Actores secundarios

* Sistema.

---

## Entidades involucradas

* Character
* CharacterVersion
* CharacterCard

---

## Precondiciones

* El personaje debe existir.
* El usuario debe proporcionar al menos los mismos campos obligatorios definidos durante la creación (nombre, subtítulo o descripción breve, descripción general, imagen de perfil, saludo inicial).
* Debe existir al menos un cambio respecto a la versión más reciente del personaje; si no hay cambios, la operación no tiene efecto.

---

## Flujo principal

1. El usuario abre el editor del personaje.

2. El sistema carga los datos de la versión más reciente del personaje y los presenta en el formulario de edición. También habrá un selector de versiones por si quiere modificar otra versión que no sea la más reciente.

3. El usuario modifica los campos que desea cambiar. Puede modificar cualquier aspecto de la definición:

   * Nombre del personaje.
   * Subtítulo o descripción breve.
   * Imagen de perfil.
   * Descripción general.
   * Instrucciones para el modelo.
   * Saludo inicial (greeting).
   * Tarjetas del personaje (contenido, orden, título, estado activo o desactivado).
   * Creación o eliminación de tarjetas.

4. El usuario confirma los cambios.

5. El sistema valida que los datos obligatorios sean correctos.

6. El sistema verifica que existan cambios reales respecto a la versión más reciente. Si no los hay, finaliza sin crear una nueva versión.

7. El sistema crea una nueva `CharacterVersion` que contiene la definición completa del personaje con todos los cambios aplicados.

8. Las tarjetas se asocian a la nueva versión respetando el orden y estado definidos por el usuario.

9. La nueva versión se marca como la versión más reciente del personaje.

10. Las conversaciones existentes continúan vinculadas a sus respectivas versiones anteriores sin modificación alguna.

11. El sistema confirma la actualización y redirige al usuario a la pantalla del personaje.

---

## Flujos alternativos

### Sin cambios detectados

Si el usuario confirma la edición sin haber realizado ninguna modificación, el sistema finaliza la operación sin crear una nueva versión ni alterar el historial del personaje.

---

### Datos obligatorios incompletos

Si alguno de los campos obligatorios ha quedado vacío tras la edición, el sistema impide guardar los cambios e indica los campos pendientes.

---

### Personaje eliminado

Si el personaje fue eliminado antes de completar la edición, el sistema informa del error y cancela la operación.

---

### Tarjetas vacías

Las tarjetas cuyo título o contenido estén vacíos no pueden formar parte de la nueva versión. El usuario debe corregirlas o eliminarlas antes de continuar.

---

### Error inesperado

Si ocurre un error durante el proceso de actualización, no debe crearse ninguna versión nueva ni modificarse ninguna entidad existente.

La operación debe comportarse como una transacción atómica.

---

## Reglas de negocio

* Modificar cualquier aspecto del personaje genera una nueva versión.
* La versión anterior permanece inmutable y asociada a sus conversaciones existentes.
* La nueva versión pasa a ser la versión más reciente del personaje.
* Las conversaciones nuevas utilizarán la versión más reciente.
* Las conversaciones existentes no se ven afectadas por la actualización.
* Los campos obligatorios deben cumplir los mismos requisitos que en la creación del personaje.
* Las tarjetas mantienen el orden y estado definidos por el usuario en la nueva versión.
* Las tarjetas eliminadas durante la edición desaparecen únicamente de la nueva versión; las versiones anteriores conservan sus propias tarjetas.
* El saludo inicial de la nueva versión solo afecta a las conversaciones futuras.

---

## Cambios en el dominio

Al finalizar correctamente el caso de uso existirán las siguientes entidades nuevas:

* Una nueva `CharacterVersion` que contiene la definición completa actualizada del personaje.
* Cero o más `CharacterCard` asociadas a la nueva versión.

Si se eliminaron tarjetas durante la edición, dichas tarjetas no existen en la nueva versión, pero permanecen en las versiones anteriores donde fueron creadas.

No se modifica ninguna entidad previamente existente.

---

## Postcondiciones

* El personaje posee una nueva versión en su historial.
* La nueva versión es la versión más reciente del personaje.
* Las conversaciones existentes continúan utilizando sus versiones originales.
* Las futuras conversaciones utilizarán la nueva versión.
* El usuario puede iniciar nuevas conversaciones con la definición actualizada del personaje.

---

## Casos de uso relacionados

* CreateCharacter (crea el personaje y su primera versión).
* CreateCharacterVersion (caso de uso interno que puede ser invocado por este caso de uso).
* UpdateCharacterCard (permite gestionar tarjetas individualmente si se requiere).
* CreateConversation (utiliza la versión más reciente para nuevas conversaciones).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Comparación visual entre versiones antes de guardar los cambios.
* Restauración de una versión anterior como nueva versión actual.
* Edición rápida de campos concretos sin abrir el editor completo.
* Historial de cambios con anotaciones del usuario.
* Validación en tiempo real de campos obligatorios.
* Vista previa del personaje antes de confirmar la actualización.

Estas funcionalidades no forman parte de la primera versión del proyecto.
