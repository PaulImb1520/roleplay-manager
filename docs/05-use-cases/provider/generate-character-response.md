# Generate Character Response

## Objetivo

Generar la siguiente respuesta del personaje utilizando un proveedor de inteligencia artificial a partir de un `PromptContext`.

Este caso de uso abstrae completamente el proveedor de inferencia utilizado, permitiendo que el resto del sistema permanezca independiente de tecnologías como Ollama, LM Studio u otros proveedores futuros.

---

## Motivación

La generación de texto constituye el núcleo de la experiencia de roleplay.

Sin embargo, la lógica del dominio no debe depender de un proveedor concreto ni conocer detalles de su implementación.

Este caso de uso actúa como una capa de abstracción entre el dominio y el motor de inferencia, garantizando que la aplicación pueda cambiar de proveedor sin modificar la lógica de negocio.

---

## Actores

### Actor principal

* Sistema.

### Actores secundarios

* Proveedor de inteligencia artificial.

---

## Entidades involucradas

Ninguna.

---

## Objetos del dominio involucrados

* PromptContext
* GeneratedResponse

---

## Precondiciones

* Debe existir un `PromptContext` válido.
* Debe existir un proveedor de inferencia configurado.
* El proveedor debe encontrarse disponible para procesar la solicitud.

---

## Flujo principal

1. Recibir un `PromptContext`.

2. Obtener la configuración de inferencia asociada a la conversación (modelo, temperatura, límites de generación y demás parámetros).

3. Transformar el `PromptContext` al formato requerido por el proveedor seleccionado.

4. Enviar la solicitud de generación.

5. Esperar la respuesta del proveedor.

6. Normalizar la respuesta recibida.

7. Construir un objeto `GeneratedResponse`.

8. Devolver el resultado al caso de uso solicitante.

---

## Flujos alternativos

### Proveedor no disponible

Si el proveedor no puede establecer conexión, el caso de uso finalizará devolviendo un error controlado.

No se modificará ninguna entidad del dominio.

---

### Error durante la inferencia

Si el proveedor devuelve un error durante la generación, el sistema devolverá una respuesta de error sin alterar el estado de la conversación.

---

### Respuesta incompleta

Si el proveedor devuelve información parcial (por ejemplo, sin métricas de uso), el sistema construirá igualmente un `GeneratedResponse` utilizando únicamente los datos disponibles.

---

## Reglas de negocio

* El dominio nunca depende de un proveedor concreto.
* El `PromptContext` representa la única entrada válida para la generación.
* La respuesta del proveedor siempre debe normalizarse antes de regresar al dominio.
* El mensaje generado constituye el único dato obligatorio del `GeneratedResponse`.
* La información adicional (tokens, tiempos, metadatos, etc.) es opcional y dependerá del proveedor utilizado.
* Este caso de uso no construye el contexto ni modifica el estado de la conversación.

---

## Cambios en el dominio

Este caso de uso no modifica ninguna entidad.

Su única responsabilidad consiste en transformar un `PromptContext` en un `GeneratedResponse`.

---

## Postcondiciones

* Existe un `GeneratedResponse` válido.
* El resultado puede ser utilizado por otros casos de uso para almacenar el mensaje generado, actualizar la conversación o desencadenar procesos posteriores.

---

## Casos de uso relacionados

* BuildPromptContext
* SendMessage
* GenerateSummary
* ProposeMemoryChanges

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Generación mediante streaming.
* Cancelación de generaciones en curso.
* Reintentos automáticos ante errores temporales.
* Balanceo entre múltiples proveedores.
* Selección automática del proveedor según disponibilidad.
* Soporte para herramientas (Tool Calling / Function Calling).
* Generación multimodal (texto, imágenes y audio).

Estas funcionalidades no forman parte de la primera versión del proyecto.
