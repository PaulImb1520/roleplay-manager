# Configure Default Provider

## Objetivo

Permitir al usuario seleccionar y modificar el proveedor y modelo por defecto del sistema, que será asignado automáticamente a las nuevas conversaciones cuando no especifiquen uno propio.

---

## Motivación

El sistema no asume ningún proveedor por defecto. Antes de poder generar cualquier respuesta, el usuario debe configurar el proveedor y modelo que el sistema utilizará.

El principio de que los modelos son intercambiables exige que el usuario pueda elegir y cambiar de proveedor en cualquier momento sin necesidad de modificar la lógica de negocio ni las conversaciones existentes.

---

## Actores

### Actor principal

* Usuario.

### Actores secundarios

* Sistema.

---

## Entidades involucradas

* — (no se modifica ninguna entidad del dominio)

---

## Objetos del dominio involucrados

* InferenceConfig (solo lectura; identifica el modelo seleccionado)
* Provider (listado y estado de proveedores disponibles)

---

## Precondiciones

* El usuario debe acceder al gestor de proveedores desde la interfaz.
* El proveedor seleccionado debe estar registrado en el `ProviderRegistry`.
* El modelo seleccionado debe existir en el listado del proveedor o ser un identificador válido.

---

## Flujo principal

1. El usuario abre el gestor de proveedores desde la configuración.

2. El sistema lista los proveedores disponibles con su estado actual (disponible, no disponible, no configurado).

3. El usuario selecciona un proveedor de la lista.

4. El sistema lista los modelos ofrecidos por el proveedor seleccionado, invocando el método `listModels` del adaptador.

5. El usuario selecciona un modelo de la lista o introduce manualmente un identificador si el proveedor no soporta descubrimiento de modelos.

6. El sistema verifica que el proveedor y el modelo son accesibles invocando `validateConnection`.

7. El sistema persiste la selección como configuración global en la tabla `settings` con las claves `default_provider` y `default_model`.

8. El sistema confirma que el proveedor y modelo por defecto han sido establecidos.

---

## Flujos alternativos

### Proveedor no disponible

Si la verificación de conexión falla, el sistema informa al usuario y le permite reintentar o seleccionar un proveedor distinto. La configuración anterior, si existía, se conserva sin modificar.

---

## Reglas de negocio

* La configuración del proveedor por defecto es global y se aplica a todas las nuevas conversaciones.
* Las conversaciones existentes conservan el proveedor y modelo configurados en el momento de su creación, salvo que el usuario los cambie explícitamente mediante `UpdateConversationSettings`.
* Si el usuario no configura ningún proveedor por defecto, el sistema carece de proveedor disponible y devuelve un error controlado (`DEFAULT_PROVIDER_NOT_SET`) al intentar cualquier generación.

---

## Cambios en el dominio

No se modifican entidades del dominio. Únicamente se actualiza la configuración global en la tabla `settings`.

---

## Postcondiciones

* El proveedor y modelo por defecto del sistema están establecidos.
* Las nuevas conversaciones creadas sin especificar proveedor utilizarán automáticamente el configurado.
* El usuario puede modificar o cambiar el proveedor por defecto en cualquier momento repitiendo este caso de uso.

---

## Casos de uso relacionados

* GenerateCharacterResponse (utiliza el proveedor por defecto si la conversación no especifica uno).
* SendMessage (invoca indirectamente al proveedor por defecto).
* CreateConversation (asigna el proveedor por defecto a la nueva conversación si no se especifica).
* UpdateConversationSettings (permite anularlo a nivel conversación).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Configuración de múltiples proveedores disponibles simultáneamente.
* Perfiles de inferencia preconfigurados por proveedor.
* Preferencias por defecto para parámetros como `temperature` o `maxTokens`.

Esta funcionalidad no forma parte de la primera versión del proyecto.