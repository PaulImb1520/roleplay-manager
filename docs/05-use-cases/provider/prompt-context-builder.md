# Build Prompt Context

## Objetivo

Construir un `PromptContext` completo y coherente a partir del estado actual de una conversación.

El resultado de este caso de uso representa toda la información que será enviada al proveedor de inteligencia artificial para generar la siguiente respuesta.

---

## Motivación

Los modelos de lenguaje poseen una ventana de contexto limitada.

Por este motivo, el sistema no puede enviar todo el historial de la conversación en cada generación.

En su lugar, debe seleccionar cuidadosamente la información más relevante para mantener la coherencia narrativa utilizando una combinación de definiciones permanentes, resúmenes, memorias dinámicas y mensajes recientes.

---

## Actores

### Actor principal

* Sistema.

---

## Entidades involucradas

* Conversation
* CharacterVersion
* CharacterCard
* Memory
* Summary
* Message

---

## Objetos del dominio involucrados

* PromptContext

---

## Precondiciones

* La conversación debe existir.
* Debe existir una versión del personaje asociada.
* Debe existir un nuevo mensaje del usuario pendiente de responder.

---

## Flujo principal

1. Recuperar la versión del personaje asociada a la conversación.

2. Obtener todas las tarjetas activas del personaje respetando el orden por importancia definido por el usuario.

3. Recuperar el resumen más reciente, si existe.

4. Recuperar las memorias dinámicas activas de la conversación.

5. Seleccionar las memorias más relevantes según su prioridad.

6. Recuperar los mensajes recientes definidos por la configuración de la conversación.

7. Construir un único `PromptContext` siguiendo el orden establecido por el sistema.

8. Devolver el `PromptContext` al caso de uso solicitante.

---

## Flujos alternativos

### Conversación sin resumen

Si todavía no existe ningún resumen, el contexto se construirá únicamente con las definiciones del personaje, las memorias dinámicas y los mensajes recientes.

---

### Conversación sin memorias

Si no existen memorias dinámicas, simplemente se omitirán del contexto.

---

### Primera interacción

Si únicamente existe el greeting del personaje y el primer mensaje del usuario, el contexto contendrá exclusivamente la información disponible.

---

## Reglas de negocio

* La definición del personaje siempre tiene la máxima prioridad.
* Las tarjetas del personaje mantienen el orden definido por el usuario.
* Únicamente se utiliza el resumen más reciente.
* Nunca se utilizan resúmenes anteriores.
* Las memorias dinámicas son independientes del resumen.
* Las memorias con mayor prioridad tienen preferencia para formar parte del contexto.
* Los mensajes históricos representados por el resumen no deben volver a enviarse al modelo.
* El contexto siempre debe construirse inmediatamente antes de cada generación.
* El resultado debe ser independiente del proveedor de inferencia.

---

## Orden del contexto

El `PromptContext` deberá construirse respetando el siguiente orden lógico:

1. Instrucciones internas del sistema.
2. Definición general del personaje.
3. Tarjetas activas del personaje.
4. Resumen más reciente.
5. Memorias dinámicas seleccionadas.
6. Mensajes recientes.
7. Último mensaje enviado por el usuario.

---

## Cambios en el dominio

Este caso de uso no modifica ninguna entidad.

Su única responsabilidad consiste en construir un objeto temporal (`PromptContext`).

---

## Postcondiciones

* Existe un `PromptContext` completamente construido.
* El contexto representa el estado narrativo más reciente de la conversación.
* El resultado está listo para ser enviado al proveedor de inteligencia artificial.

---

## Casos de uso relacionados

* SendMessage
* GenerateCharacterResponse

---

## Futuras extensiones

En versiones posteriores este caso de uso podrá ampliarse para soportar:

* Recuperación selectiva de contexto mediante capítulos.
* Recuperación semántica de recuerdos relevantes.
* Priorización dinámica de memorias mediante algoritmos híbridos.
* Múltiples personajes dentro de una conversación.
* Escenarios reutilizables.
* Compresión automática del contexto para modelos con ventanas reducidas.

Estas funcionalidades no forman parte de la primera versión del proyecto.
