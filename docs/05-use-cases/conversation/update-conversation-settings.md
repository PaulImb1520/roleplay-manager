# Update Conversation Settings

## Objetivo

Permitir al usuario modificar la configuración local de una conversación, incluyendo el modelo, proveedor, parámetros de inferencia y preferencias narrativas que determinan cómo el sistema interactúa con la inteligencia artificial durante esa conversación.

---

## Motivación

Cada conversación posee una configuración independiente que define su comportamiento durante la generación de respuestas.

El usuario puede necesitar ajustar parámetros como el modelo utilizado, la temperatura de generación, la cantidad de mensajes recientes incluidos en el contexto o la frecuencia con la que se generan resúmenes, sin que estos cambios afecten a otras conversaciones.

Estos ajustes permiten adaptar el comportamiento del modelo a las necesidades específicas de cada historia.

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
* La conversación no debe estar archivada.
* Los valores proporcionados deben ser válidos según las reglas definidas para cada parámetro.

---

## Flujo principal

1. El usuario abre el panel de configuración de la conversación.

2. El sistema muestra los valores actuales de todos los parámetros configurables:

   * Modelo utilizado.
   * Proveedor de IA utilizado.
   * Cantidad de mensajes recientes incluidos en el contexto.
   * Frecuencia de generación de resúmenes (umbral de mensajes).
   * Parámetros de inferencia (temperatura, límites de generación, etc.).

3. El usuario modifica los parámetros que desea cambiar.

4. El usuario confirma los cambios.

5. El sistema valida que cada valor se encuentre dentro de los rangos permitidos.

6. El sistema actualiza la configuración local de la conversación con los nuevos valores.

7. El sistema confirma que los cambios han sido aplicados.

8. La nueva configuración se aplica a partir de la siguiente generación de respuesta.

---

## Flujos alternativos

### Valores inválidos

Si alguno de los valores proporcionados no es válido (por ejemplo, una temperatura fuera del rango permitido o una cantidad de mensajes negativa), el sistema rechaza la operación e indica qué parámetros deben corregirse.

---

### Conversación archivada

Si la conversación se encuentra archivada, el sistema impide la modificación de la configuración e informa al usuario de que debe desarchivar la conversación antes de modificarla.

---

### Proveedor no disponible

Si el usuario selecciona un proveedor que no está configurado o no se encuentra disponible, el sistema advierte al usuario antes de guardar los cambios, permitiendo continuar o seleccionar otro proveedor.

La configuración se guarda igualmente, pero el sistema notificará el error al intentar la siguiente generación.

---

### Sin cambios

Si el usuario confirma la edición sin haber realizado ninguna modificación, el sistema finaliza sin aplicar cambios.

---

## Reglas de negocio

* La configuración es local a la conversación y no afecta a otras conversaciones.
* Los cambios en la configuración solo afectan a las generaciones futuras; no modifican mensajes ni respuestas existentes.
* El modelo y proveedor pueden cambiarse en cualquier momento, independientemente del historial de la conversación.
* Los parámetros de inferencia deben respetar los rangos definidos por el sistema y las capacidades del proveedor seleccionado.
* La configuración se conserva al archivar y reactivar la conversación.
* La configuración no se modifica al retroceder la conversación mediante `RewindConversation`.
* La configuración se inicializa con valores por defecto del sistema al crear la conversación.

---

## Cambios en el dominio

Al finalizar correctamente el caso de uso se produce el siguiente cambio:

* Se actualizan los parámetros de configuración local de la `Conversation`.

No se crea ni elimina ninguna entidad. El contenido narrativo de la conversación permanece intacto.

---

## Postcondiciones

* La configuración local de la conversación refleja los nuevos valores.
* Los cambios son efectivos a partir de la siguiente generación de respuesta.
* El resto de la conversación no ha sufrido ninguna modificación.
* Las conversaciones existentes no se ven afectadas.

---

## Casos de uso relacionados

* CreateConversation (inicializa la configuración con valores por defecto).
* SendMessage (utiliza la configuración actual para determinar el comportamiento de la generación).
* PromptContextBuilder (consume la configuración de mensajes recientes y otros parámetros).
* GenerateCharacterResponse (consume la configuración de inferencia).
* GenerateSummary (consume la frecuencia de generación definida en la configuración).
* ArchiveConversation (bloquea la modificación de la configuración mientras la conversación esté archivada).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Plantillas de configuración reutilizables entre conversaciones.
* Configuración avanzada de memoria dinámica (umbrales de prioridad, reglas de eliminación).
* Perfiles de configuración predefinidos (rápido, creativo, equilibrado).
* Validación en tiempo real de la disponibilidad del proveedor y modelo seleccionados.
* Comparación de rendimiento entre diferentes configuraciones.
* Herencia de configuración desde una conversación origen al crear una nueva conversación.
* Restablecimiento de valores por defecto del sistema.

Estas funcionalidades no forman parte de la primera versión del proyecto.
