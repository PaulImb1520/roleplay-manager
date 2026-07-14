# Create Character Version

## Objetivo

Crear una nueva versión inmutable de un personaje a partir de la definición actual proporcionada por el usuario, garantizando que las conversaciones existentes permanezcan asociadas a la versión con la que fueron creadas y que las futuras conversaciones utilicen la definición más reciente.

---

## Motivación

Los personajes son entidades versionadas. Cada vez que el usuario modifica la definición de un personaje —ya sea mediante una edición completa o un cambio puntual— el sistema no altera la versión existente, sino que genera una nueva que contiene el estado actualizado.

Este caso de uso representa el mecanismo mediante el cual se materializa una nueva versión cada vez que la definición del personaje cambia. Es invocado automáticamente como consecuencia de una edición y constituye el núcleo del sistema de versionado del dominio.

Sin este mecanismo, las conversaciones activas perderían la coherencia narrativa al verse afectadas por cambios retrospectivos en la definición del personaje.

---

## Actores

### Actor principal

* Sistema.

### Actores secundarios

* Usuario (como origen de los cambios que desencadenan la creación).

---

## Entidades involucradas

* Character
* CharacterVersion
* CharacterCard

---

## Precondiciones

* El personaje debe existir.
* Debe existir una definición completa y válida del personaje que servirá como contenido de la nueva versión.
* Debe existir al menos un cambio respecto a la versión más reciente del personaje; en caso contrario la operación no tiene efecto.
* Todos los campos obligatorios deben estar completos en la definición proporcionada.

---

## Flujo principal

1. El sistema recibe la solicitud de crear una nueva versión junto con la definición completa y actualizada del personaje.

2. El sistema crea una nueva entidad `CharacterVersion` que contiene toda la información de la definición recibida:

   * Nombre del personaje.
   * Subtítulo o descripción breve.
   * Imagen de perfil.
   * Descripción general.
   * Instrucciones para el modelo.
   * Saludo inicial (greeting).
   * Orden, título y estado de cada tarjeta.

3. Todas las tarjetas definidas se asocian a la nueva versión respetando el orden y estado proporcionados.

4. La nueva versión se marca como la versión más reciente del personaje.

5. Las conversaciones existentes continúan asociadas a sus respectivas versiones anteriores sin modificación alguna.

6. El sistema notifica al caso de uso solicitante que la nueva versión ha sido creada exitosamente.

---

## Flujos alternativos

### Sin cambios respecto a la versión más reciente

Si la definición proporcionada es idéntica a la versión más reciente del personaje, el sistema descarta la operación y notifica que no se ha creado ninguna versión nueva.

No se modifica ninguna entidad.

---

### Definición incompleta

Si la definición proporcionada carece de campos obligatorios, el sistema rechaza la creación e indica los campos pendientes.

---

### Tarjetas con datos incompletos

Si alguna de las tarjetas incluidas en la definición posee título o contenido vacío, dichas tarjetas no se incluyen en la nueva versión. El sistema notifica al caso de uso solicitante para que el usuario decida si desea corregirlas o eliminarlas antes de reintentar la operación.

---

### Error inesperado

Si ocurre un error durante el proceso de creación, no debe crearse ninguna versión nueva ni modificarse ninguna entidad existente.

La operación debe comportarse como una transacción atómica.

---

## Reglas de negocio

* Toda nueva versión es completamente inmutable después de su creación.
* La nueva versión pasa a ser la versión más reciente del personaje.
* Las conversaciones existentes permanecen asociadas a las versiones con las que fueron creadas.
* La versión anterior no se modifica ni se elimina.
* Las tarjetas se copian desde la definición proporcionada; la nueva versión posee su propia colección independiente.
* Una nueva versión solo se crea si existe al menos un cambio respecto a la versión más reciente.
* La versión resultante debe cumplir los mismos requisitos de integridad que una versión creada mediante `CreateCharacter`.

---

## Cambios en el dominio

Al finalizar correctamente el caso de uso existirán las siguientes entidades nuevas:

* Una nueva `CharacterVersion` que contiene la definición completa del personaje.
* Cero o más `CharacterCard` asociadas a la nueva versión.

No se modifica ninguna entidad previamente existente. Las versiones anteriores permanecen intactas en el historial del personaje.

---

## Postcondiciones

* El personaje posee una nueva versión en su historial.
* La nueva versión es la versión más reciente del personaje.
* Las conversaciones existentes continúan utilizando sus versiones originales.
* Las futuras conversaciones utilizarán la nueva versión.

---

## Casos de uso relacionados

* CreateCharacter (crea el personaje y su primera versión automáticamente).
* UpdateCharacter (invoca este caso de uso tras cada edición para materializar los cambios en una nueva versión).
* CreateConversation (utiliza la versión más reciente para nuevas conversaciones).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Descripciones o etiquetas personalizadas para cada versión.
* Restauración de una versión anterior como nueva versión actual.
* Comparación visual entre versiones antes de confirmar los cambios.
* Historial de cambios detallado entre versiones consecutivas.
* Duplicación de versiones entre diferentes personajes.

Estas funcionalidades no forman parte de la primera versión del proyecto.
