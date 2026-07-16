# Propose Memory Changes

## Objetivo

Solicitar al modelo de inteligencia artificial que analice el intercambio más reciente de la conversación y genere propuestas de creación, modificación o eliminación de memorias dinámicas para mantener actualizada la base de hechos relevantes de la historia.

---

## Motivación

Cada nuevo mensaje en la conversación puede introducir información relevante que conviene conservar, modificar hechos previamente establecidos o hacer que ciertas memorias pierdan su utilidad narrativa.

Sin embargo, el modelo no debe modificar directamente la memoria dinámica. El usuario conserva siempre la decisión final sobre cualquier cambio.

Este caso de uso actúa como puente entre la evolución natural de la historia y el control del usuario, generando propuestas que este podrá revisar, aceptar, modificar o descartar posteriormente mediante `ApplyMemoryChanges`.

---

## Actores

### Actor principal

* Sistema.

### Actores secundarios

* Modelo de inteligencia artificial.
* Usuario (como revisor y decisor final de las propuestas).

---

## Entidades involucradas

* Conversation
* Memory

---

## Objetos del dominio involucrados

* MemoryChangeProposal

---

## Precondiciones

* La conversación debe existir.
* La conversación no debe estar archivada.
* Debe existir un proveedor de inferencia disponible.
* Debe haberse completado la generación de la respuesta del asistente para el mensaje actual.
* Si el caso de uso `GenerateSummary` ha sido ejecutado durante este ciclo, debe haberse completado antes de iniciar este caso de uso.

---

## Flujo principal

1. El sistema recibe la solicitud de generar propuestas de modificación de memoria para una conversación específica.

2. Se recuperan todas las memorias activas de la conversación.

3. Se recuperan los mensajes más recientes de la conversación, incluyendo al menos el último mensaje del usuario y la última respuesta del asistente.

4. Si se ha generado un nuevo resumen durante este ciclo, se incluye como información adicional para contextualizar las propuestas.

5. Se construye un contexto de generación compuesto por:

   * Instrucciones del sistema sobre el formato y las reglas de las propuestas.
   * Las memorias activas actuales de la conversación.
   * El intercambio más reciente (mensaje del usuario y respuesta del asistente).
   * El resumen más reciente, si existe.

6. Se envía el contexto al proveedor de inteligencia artificial solicitando sugerencias de cambios sobre la memoria dinámica.

7. El modelo analiza el intercambio y genera una o varias propuestas estructuradas.

8. El sistema interpreta la respuesta del modelo y construye una lista de objetos `MemoryChangeProposal`, cada uno con:

   * Operación (CREATE, UPDATE o DELETE).
   * Actor al que pertenece la memoria.
   * Título.
   * Descripción.
   * Prioridad propuesta.
   * Motivo de la propuesta (opcional).

9. Las propuestas se asocian temporalmente a la conversación, quedando disponibles para que el usuario las revise.

10. El sistema devuelve la lista de propuestas generadas al caso de uso solicitante.

---

## Flujos alternativos

### Sin memorias existentes

Si la conversación no posee ninguna memoria activa, el contexto de generación se enviará omitiendo la sección de memorias actuales.

El modelo podrá proponer la creación de las primeras memorias basándose exclusivamente en el intercambio reciente.

---

### Sin cambios necesarios

Si el modelo determina que el intercambio más reciente no introduce información relevante ni modifica hechos existentes, podrá devolver una lista vacía de propuestas.

No se genera ninguna propuesta ni se modifica el estado de la memoria dinámica.

---

### Propuestas inválidas o malformadas

Si el modelo devuelve propuestas que no pueden ser interpretadas correctamente (formato incorrecto, operación no reconocida, datos incompletos), el sistema descarta individualmente cada propuesta inválida y conserva aquellas que sean correctas.

Si ninguna propuesta puede interpretarse, el sistema devuelve una lista vacía.

---

### Error durante la generación

Si el proveedor de inferencia no consigue generar una respuesta, el sistema no crea ninguna propuesta.

La conversación conserva su estado actual sin modificaciones en la memoria dinámica.

---

### Proveedor no disponible

Si no existe ningún proveedor configurado o este no puede establecer conexión, el caso de uso finaliza sin generar propuestas y sin alterar el estado de la conversación.

---

## Reglas de negocio

* Las propuestas nunca modifican directamente las memorias.
* El usuario tiene siempre la decisión final sobre cualquier cambio en la memoria dinámica.
* Cada propuesta representa una única operación (CREATE, UPDATE o DELETE).
* Varias propuestas pueden referirse a una misma memoria existente.
* El sistema no debe aplicar ninguna propuesta automáticamente durante este caso de uso.
* El motivo de la propuesta es opcional pero recomendado para facilitar la decisión del usuario.
* La prioridad propuesta debe respetar el rango definido por el dominio (1-10).
* El análisis del modelo debe limitarse al intercambio más reciente; no debe reanalizar el historial completo.
* Este caso de uso no modifica ninguna entidad del dominio.

---

## Cambios en el dominio

Este caso de uso no modifica ninguna entidad.

Su única responsabilidad consiste en generar una lista de objetos temporales `MemoryChangeProposal`.

Las memorias activas de la conversación permanecen inalteradas.

---

## Postcondiciones

* Existe una lista de propuestas de modificación de memoria asociada temporalmente a la conversación.
* Las propuestas pueden ser una combinación de CREATE, UPDATE y DELETE.
* La lista puede estar vacía si el modelo no identificó cambios necesarios.
* Las memorias activas de la conversación no han sido modificadas.
* Las propuestas están disponibles para que el usuario las revise y decida su aplicación mediante `ApplyMemoryChanges`.

---

## Casos de uso relacionados

* SendMessage (invoca este caso de uso tras la generación de la respuesta y el resumen).
* GenerateSummary (se ejecuta antes de este caso de uso dentro del flujo de SendMessage).
* ApplyMemoryChanges (caso de uso iniciado por el usuario para aplicar o descartar las propuestas generadas).
* PromptContextBuilder (consume las memorias activas para construir el contexto).
* GenerateCharacterResponse (genera la respuesta del asistente que este caso de uso analiza).

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Detección de conflictos entre memorias con resolución automática propuesta.
* Análisis de relevancia temporal para sugerir eliminación de memorias con baja prioridad mantenida durante varios mensajes.
* Propuestas que abarquen múltiples intercambios en lugar de únicamente el más reciente.
* Creación automática de nuevos actores para la memoria dinámica.
* Consolidación de memorias redundantes o contradictorias.
* Propuestas condicionales que dependan de eventos futuros de la conversación.

Estas funcionalidades no forman parte de la primera versión del proyecto.
