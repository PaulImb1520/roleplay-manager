# List Provider Models

## Objetivo

Obtener la lista de modelos disponibles a través de un proveedor de inferencia registrado, permitiendo al usuario seleccionar un modelo concreto para usarlo como modelo por defecto o como configuración local de una conversación.

---

## Motivación

Los proveedores de inferencia exponen modelos de formas heterogéneas: algunos disponen de un endpoint de descubrimiento (Ollama, OpenAI), mientras que otros requieren que el usuario introduzca manualmente el identificador del modelo (LM Studio en ciertas configuraciones, proveedores auto-alojados sin endpoint de listado).

Para configurar el proveedor por defecto del sistema (`ConfigureDefaultProvider`) o anular el modelo de una conversación concreta, el usuario necesita ver qué modelos están disponibles en el proveedor seleccionado. Este caso de uso cubre esa necesidad de consulta de forma transparente y sin modificar el estado del dominio.

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

* `ProviderPort` (se invoca el método `listModels`)
* `Provider` (estado y metadatos del proveedor consultado)
* `InferenceConfig` (el `model` seleccionado a partir de los resultados formará parte de la configuración de inferencia)

---

## Precondiciones

* El identificador del proveedor debe corresponder a un adaptador registrado en el `ProviderRegistry`.
* La configuración de conexión del proveedor debe estar disponible.

---

## Flujo principal

1. El usuario selecciona un proveedor en el gestor de proveedores.
2. El caso de uso obtiene el adaptador desde el `ProviderRegistry`.
3. El caso de uso invoca el método `listModels` del `ProviderPort`.
4. El adaptador consulta el endpoint de modelos del proveedor (si lo soporta) o devuelve una lista vacía.
5. El caso de uso devuelve al frontend la lista de modelos disponibles, cada uno con su identificador y cualquier metadato opcional (nombre legible, contexto máximo, etc.).
6. El frontend muestra la lista de modelos al usuario, junto con un campo manual para introducir un identificador cuando el proveedor no soporta descubrimiento.

---

## Flujos alternativos

### Proveedor sin descubrimiento de modelos

Si el adaptador detecta que el proveedor no soporta `listModels` (respuesta `501 Not Implemented` o similar declarado por el adaptador), el caso de uso devuelve una lista vacía con un flag `manualEntryRequired = true`, indicando al frontend que debe permitir al usuario introducir manualmente el identificador del modelo.

### Proveedor no disponible

Si la conexión con el proveedor falla durante el listado, el caso de uso devuelve un error controlado (`PROVIDER_CONNECTION_FAILED`) sin devolver modelos. El frontend puede sugerir ejecutar previamente `ValidateProviderConnection`.

### Timeout durante el listado

Si el proveedor no responde dentro del timeout aplicable, el adaptador lanza un `ProviderTimeoutError` y el caso de uso lo traduce en un error controlado `PROVIDER_TIMEOUT` sin modificar estado.

---

## Reglas de negocio

* La consulta nunca modifica el estado del dominio ni persiste nada en `settings`.
* La lista devuelta refleja el estado **en el momento de la consulta**: no se cachea en el caso de uso. La UI puede mantenerla en estado local hasta que el usuario cierre el gestor.
* El Identificador del modelo devuelto es la cadena exacta que debe usarse en el campo `model` de `InferenceConfig`.
* Si el proveedor requiere autenticación y no se ha configurado, el caso de uso devuelve `unconfigured` sin intentar el listado.

---

## Cambios en el dominio

No se modifica ninguna entidad. Únicamente se consulta el `ProviderPort`.

---

## Postcondiciones

* El frontend dispone de la lista de modelos del proveedor seleccionado.
* El usuario puede elegir un modelo de la lista o introducir uno manualmente para continuar con `ConfigureDefaultProvider` o `UpdateConversationSettings`.

---

## Casos de uso relacionados

* `ConfigureDefaultProvider` (invoca este caso de uso para llenar la lista de modelos al seleccionar un proveedor).
* `UpdateConversationSettings` (puede invocarlo si el usuario cambia el modelo de una conversación concreta).
* `ValidateProviderConnection` (puede ejecutarse previamente para evitar listados fallidos).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Metadatos enriquecidos por modelo (contexto máximo, capacidades, costo por token para proveedores remotos).
* Favoritos y alias legibles sobre los identificadores internos.
* Cache con TTL configurable para evitar listados repetidos.
* Descubrimiento periódico en segundo plano.

Estas funcionalidades no forman parte de la primera versión del proyecto.