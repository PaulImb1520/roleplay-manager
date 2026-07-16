# Validate Provider Connection

## Objetivo

Verificar que un proveedor de inferencia registrado en el sistema está accesible y operativo, permitiendo al usuario conocer su estado antes de utilizarlo o configurarlo como proveedor por defecto.

---

## Motivación

El sistema no asume que un proveedor esté siempre disponible: puede estar caído, no haber sido arrancado (Ollama/LM Studio locales), tener la URL mal configurada o no responder por saturación.

Antes de que el usuario intente generar cualquier respuesta, resumen, título o propuesta de memoria, el sistema debe ofrecerle la posibilidad de comprobar explícitamente que el proveedor responde, evitando errores evitables y mejorando la transparencia sobre el estado de los proveedores registrados.

Este caso de uso también es invocado internamente por `ConfigureDefaultProvider` antes de persistir un nuevo proveedor por defecto.

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

* `ProviderPort` (se invoca el método `validateConnection`)
* Estado del proveedor (disponible, no disponible, no configurado)

---

## Precondiciones

* El identificador del proveedor debe corresponder a un adaptador registrado en el `ProviderRegistry`.
* La configuración de conexión del proveedor (URL base, API key si aplica) debe estar disponible.

---

## Flujo principal

1. El usuario abre el gestor de proveedores desde la configuración.
2. El sistema lista los proveedores registrados con su último estado conocido.
3. El usuario selecciona un proveedor y solicita verificar su conexión.
4. El caso de uso obtiene el adaptador correspondiente desde el `ProviderRegistry`.
5. El caso de uso invoca el método `validateConnection` del `ProviderPort`.
6. El adaptador intenta establecer comunicación con el proveedor dentro del timeout configurado.
7. El caso de uso devuelve al frontend el estado resultante: `available` o `unavailable`, junto con un mensaje descriptivo cuando el adaptador pudo determinar la causa (p. ej. conexión rechazada, timeout, credenciales inválidas).
8. El frontend actualiza el indicador de estado del proveedor en la interfaz.

---

## Flujos alternativos

### Proveedor no configurado

Si el proveedor no tiene los datos de conexión necesarios (URL base ausente, API key requerida no proporcionada), el caso de uso devuelve el estado `unconfigured` sin intentar la conexión, evitando consumir un timeout innecesario.

### Timeout durante la verificación

Si el proveedor no responde dentro del timeout aplicable, el adaptador lanza un `ProviderTimeoutError` que el caso de uso captura y traduce al estado `unavailable` sin propagar un error al frontend. La operación no modifica ninguna entidad.

### Error de red

Si la conexión falla por un error de red (conexión rechazada, DNS no resuelto, etc.), el adaptador traduce el error y el caso de uso devuelve `unavailable` con un mensaje informativo.

---

## Reglas de negocio

* La verificación nunca modifica el estado del dominio ni persiste cambios en `settings`.
* El resultado de la verificación es **instantáneo**: no se cachea por el caso de uso. El estado mostrado en la UI es el resultado de la última comprobación; el `ProviderRegistry` puede mantener un estado cacheado que caduque según su propia política, pero el caso de uso siempre emite una verificación fresca cuando se invoca.
* Verificación fallida no impide que el usuario configure el proveedor por defecto; la decisión queda en manos del usuario.
* El timeout aplicable es el definido globalmente en `provider_timeout_ms` (ver `docs/07-technical-architecture.md`).

---

## Cambios en el dominio

No se modifica ninguna entidad ni valor object del dominio. Únicamente se consulta el estado del proveedor mediante el puerto `ProviderPort`.

---

## Postcondiciones

* El frontend refleja el estado actual del proveedor verificado.
* El usuario puede decidir si continuar configurando el proveedor o seleccionar otro.
* `ConfigureDefaultProvider` puede utilizar el resultado como verificación previa antes de persistir el proveedor por defecto.

---

## Casos de uso relacionados

* `ConfigureDefaultProvider` (lo invoca como verificación previa a persistir la configuración).
* `ListProviderModels` (puede sugerir verificar la conexión antes de listar modelos).
* `GenerateCharacterResponse` (maneja internamente los mismos errores de conexión al ejecutar una generación real).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Verificación periódica en segundo plano para mantener actualizado el estado de todos los proveedores registrados.
* Telemetría de disponibilidad histórica por proveedor.
* Notificaciones proactivas al usuario cuando un proveedor previamente disponible pasa a estar inactivo.

Estas funcionalidades no forman parte de la primera versión del proyecto.