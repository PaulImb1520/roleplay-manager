# Entidades

## Character

### Descripción

`Character` representa la identidad permanente de un personaje dentro de la aplicación.

Su responsabilidad no es almacenar la definición completa del personaje, sino actuar como el punto de entrada que agrupa todas las versiones que el usuario haya creado a lo largo del tiempo.

Cada vez que el usuario modifica la definición de un personaje, el sistema genera una nueva versión en lugar de alterar las anteriores. Esto garantiza que las conversaciones existentes permanezcan coherentes y continúen utilizando exactamente la misma información con la que fueron creadas.

Como consecuencia, un `Character` puede tener múltiples versiones activas en el historial, pero cada conversación siempre estará asociada a una única versión específica.

---

### Responsabilidades

* Representar la identidad permanente del personaje.
* Agrupar todas las versiones del personaje.
* Servir como punto de acceso para crear nuevas conversaciones.
* Mantener el historial de versiones sin alterar conversaciones existentes.

---

### No es responsabilidad de Character

`Character` no debe conocer:

* Las conversaciones.
* Los mensajes.
* La memoria dinámica.
* Los resúmenes.
* El contexto enviado al modelo.
* El proveedor de IA utilizado.

Su única responsabilidad consiste en representar la identidad del personaje y organizar sus distintas versiones.

---

## CharacterVersion

### Descripción

`CharacterVersion` representa una instantánea inmutable de la definición completa de un personaje en un momento determinado.

Una versión contiene toda la información necesaria para interpretar al personaje durante una conversación.

Una vez creada, su contenido nunca cambia.

Si el usuario modifica cualquier aspecto del personaje —por ejemplo, el nombre, la descripción, la imagen, el mensaje inicial, las instrucciones o cualquiera de sus tarjetas— el sistema creará automáticamente una nueva versión.

Las conversaciones existentes continuarán utilizando la versión con la que fueron creadas, mientras que las nuevas conversaciones utilizarán la versión más reciente.

Este mecanismo garantiza la coherencia narrativa y evita modificar retrospectivamente historias ya desarrolladas.

---

### Información que define una versión

Una versión puede contener, entre otros elementos:

* Nombre del personaje.
* Subtítulo o descripción breve.
* Imagen de perfil.
* Descripción general.
* Instrucciones para el modelo.
* Greeting (primer mensaje del personaje).
* Colección de tarjetas del personaje.

Esta lista podrá evolucionar en futuras versiones del proyecto siempre que se mantenga el principio de inmutabilidad.

---

### Responsabilidades

* Definir completamente el comportamiento esperado del personaje.
* Servir como base para construir el contexto inicial de una conversación.
* Mantener una definición estable durante toda la vida de una conversación.

---

### No es responsabilidad de CharacterVersion

Una versión no debe conocer:

* El historial de mensajes.
* La memoria dinámica.
* Los resúmenes.
* El estado actual de una conversación.

Toda esa información pertenece a la conversación y evoluciona independientemente de la definición del personaje.

---

## CharacterCard

### Descripción

Una `CharacterCard` representa un bloque modular de información que describe un aspecto específico del personaje.

Las tarjetas permiten dividir la definición del personaje en secciones pequeñas, independientes y fáciles de gestionar.

Cada tarjeta posee un propósito concreto definido por el usuario, como por ejemplo:

* Personalidad.
* Historia.
* Apariencia.
* Gustos.
* Disgustos.
* Miedos.
* Habilidades.
* Reglas de comportamiento.
* Relaciones iniciales.

La aplicación no impone un conjunto fijo de categorías. El usuario puede crear tantas tarjetas como considere necesarias y asignarles el título que desee.

---

### Organización

Cada tarjeta contiene:

* Un título.
* Un contenido.
* Una posición dentro del personaje.
* Un estado (activa o desactivada).

El orden de las tarjetas es significativo.

Las tarjetas situadas en posiciones superiores tendrán mayor prioridad al construir el contexto enviado al modelo.

Las tarjetas desactivadas permanecerán almacenadas, pero no participarán en la construcción del contexto.

Modificar el contenido, el orden o el estado de una tarjeta implica la creación de una nueva versión del personaje.

---

### Responsabilidades

* Describir un único aspecto del personaje.
* Permitir una organización modular de la información.
* Facilitar la edición sin afectar al resto de la definición.

---

### No es responsabilidad de CharacterCard

Una tarjeta no debe:

* Conocer conversaciones.
* Conocer memorias.
* Conocer resúmenes.
* Construir prompts.

Su única función consiste en representar información estructurada sobre el personaje.

---

## Relaciones

Un `Character` posee una o más `CharacterVersion`.

Cada `CharacterVersion` contiene una colección ordenada de `CharacterCard`.

Una conversación siempre se crea utilizando exactamente una `CharacterVersion`.

Una misma versión puede utilizarse para iniciar múltiples conversaciones independientes.

---

## Invariantes

* Un `Character` nunca pierde su historial de versiones.
* Una `CharacterVersion` es completamente inmutable después de su creación.
* Toda conversación referencia exactamente una única versión del personaje.
* Modificar cualquier elemento de una versión genera una nueva versión.
* Cada `CharacterCard` pertenece exclusivamente a una única versión del personaje.
* El orden de las tarjetas forma parte de la definición del personaje.
* Las tarjetas desactivadas no participan en la construcción del contexto, pero permanecen disponibles para futuras versiones.
* El greeting pertenece a la definición de la versión del personaje y determina el inicio de todas las conversaciones creadas a partir de ella.

## Conversation

### Descripción

`Conversation` representa una historia independiente desarrollada entre un usuario y una versión específica de un personaje.

Su responsabilidad consiste en preservar todos los elementos narrativos que surgen durante la interacción, incluyendo mensajes, memoria dinámica, resúmenes y configuraciones propias de la conversación.

Una conversación siempre está asociada a una única `CharacterVersion` y nunca puede cambiar de versión una vez creada.

Las conversaciones no poseen un final explícito. Permanecen disponibles indefinidamente hasta que el usuario decida retomarlas, archivarlas o eliminarlas.

---

### Responsabilidades

* Representar una historia independiente.
* Mantener el historial de mensajes.
* Mantener la memoria dinámica asociada.
* Mantener los resúmenes generados.
* Conservar las configuraciones locales utilizadas durante la conversación.
* Preservar la relación con la versión del personaje utilizada para iniciarla.
* Permitir la reanudación de la historia en cualquier momento.

---

### No es responsabilidad de Conversation

Una conversación no debe:

* Definir la personalidad del personaje.
* Modificar una versión del personaje.
* Construir prompts.
* Comunicarse directamente con modelos de IA.
* Gestionar proveedores de IA.

Estas responsabilidades pertenecen a otros componentes del sistema.

---

### Ciclo de vida

Una conversación se crea a partir de una `CharacterVersion`.

Al momento de su creación, el sistema inserta automáticamente el greeting definido por dicha versión como primer mensaje de la historia.

A partir de ese momento, la conversación evoluciona mediante los intercambios entre el usuario y la inteligencia artificial.

La conversación puede permanecer inactiva durante cualquier periodo de tiempo y reanudarse posteriormente sin perder información.

---

### Configuración local

Cada conversación posee una configuración independiente que define cómo interactúa con el modelo utilizado.

Algunos ejemplos de configuración son:

* Modelo utilizado.
* Proveedor de IA utilizado.
* Cantidad de mensajes recientes incluidos en el contexto.
* Frecuencia de generación de resúmenes.
* Parámetros de inferencia del modelo.

Estas configuraciones forman parte de la conversación y deben preservarse junto con ella.

---

### Título

Una conversación puede poseer un título descriptivo.

Inicialmente puede encontrarse sin título.

El sistema podrá proponer automáticamente un título basado en el contenido de la conversación cuando el usuario haga su primera interacción o cada vez que se genere un resumen.

El usuario podrá aceptar, modificar o reemplazar dicho título en cualquier momento.

---

### Estado

Una conversación puede encontrarse en uno de los siguientes estados:

* Activa.
* Archivada.

Las conversaciones archivadas conservan toda su información y pueden reactivarse posteriormente.

---

### Relaciones

Una conversación pertenece a exactamente una `CharacterVersion`.

Una conversación contiene una secuencia ordenada de `Message`.

Una conversación contiene:

* Memorias dinámicas.
* Resúmenes.
* Configuraciones locales.

Una misma `CharacterVersion` puede utilizarse para crear múltiples conversaciones independientes.

---

### Invariantes

* Toda conversación pertenece a exactamente una `CharacterVersion`.
* Una conversación nunca puede cambiar de versión una vez creada.
* Toda conversación contiene al menos un mensaje.
* El primer mensaje de una conversación corresponde al greeting de la versión utilizada.
* Las configuraciones locales pertenecen a la conversación.
* La memoria dinámica pertenece exclusivamente a una conversación.
* Los resúmenes pertenecen exclusivamente a una conversación.
* Archivar una conversación no modifica su contenido.
* Reactivar una conversación no altera su estado narrativo.

---

### Observaciones futuras

En futuras versiones del proyecto una conversación podría permitir la participación simultánea de múltiples personajes.

Sin embargo, la versión inicial del sistema asume la existencia de un único personaje por conversación y todas las decisiones de diseño actuales se basan en esa premisa.

## Message

### Descripción

`Message` representa un único intercambio textual dentro de una conversación, ya sea generado por el usuario o por el asistente de inteligencia artificial.

Cada mensaje forma parte de la línea canónica de la historia y contribuye al desarrollo narrativo de la conversación.

Los mensajes se organizan secuencialmente y constituyen la fuente principal de la evolución narrativa de la conversación.

---

### Responsabilidades

* Representar el contenido de un intercambio dentro de la conversación.
* Identificar si fue generado por el usuario o por el asistente.
* Mantener su posición dentro de la secuencia cronológica.
* Conservar las versiones alternativas generadas mediante regeneración hasta que el mensaje sea aceptado.

---

### No es responsabilidad de Message

Un mensaje no debe:

* Construir prompts.
* Conocer resúmenes, memorias o propuestas de memoria.
* Decidir su propia posición dentro de la conversación.
* Modificar el estado narrativo de la historia.

---

### Estructura

Cada mensaje está compuesto por los siguientes elementos:

* **id**: identificador único del mensaje.
* **conversationId**: identificador de la conversación a la que pertenece.
* **role**: indica si el mensaje fue escrito por el usuario (`user`) o por el asistente (`assistant`).
* **content**: contenido textual actual del mensaje.
* **position**: número de orden dentro de la secuencia de mensajes de la conversación.
* **createdAt**: fecha y hora de creación original del mensaje.
* **editedAt**: fecha y hora de la última edición, si corresponde.

---

### Regeneración

El usuario puede solicitar la regeneración del último mensaje del asistente cuando no esté satisfecho con la respuesta obtenida.

Cada regeneración sustituye el contenido actual del mensaje por una nueva respuesta generada por la inteligencia artificial. El contenido anterior se conserva en un historial temporal de regeneraciones asociado al mensaje.

Dicho historial se compone de:

* **alternatives**: lista ordenada de contenidos alternativos generados durante regeneraciones previas.

Cuando el usuario envía un nuevo mensaje, el mensaje del asistente se considera aceptado y el historial de regeneraciones se elimina permanentemente, quedando únicamente el contenido canónico definitivo en la línea de la conversación.

---

### Roles

El sistema reconoce dos roles para los mensajes:

* **user**: mensaje escrito directamente por el usuario.
* **assistant**: mensaje generado por la inteligencia artificial como respuesta al usuario.

El primer mensaje de toda conversación corresponde al saludo definido en la versión del personaje y posee el rol `assistant`.

Los mensajes con rol `user` no poseen historial de regeneración.

---

### Relaciones

Todo `Message` pertenece exactamente a una `Conversation`.

Los resúmenes hacen referencia a rangos de mensajes para definir su alcance narrativo.

Las memorias dinámicas extraen hechos relevantes a partir del contenido de los mensajes.

---

### Invariantes

* Todo mensaje pertenece exactamente a una conversación.
* Todo mensaje posee un rol válido (`user` o `assistant`).
* Todo mensaje posee una posición única dentro de su conversación.
* El contenido del mensaje nunca puede estar vacío.
* El primer mensaje de la conversación tiene rol `assistant` y corresponde al greeting de la versión del personaje.
* Solo el último mensaje con rol `assistant` puede poseer un historial de regeneración.
* El historial de regeneración se limpia automáticamente cuando se añade un nuevo mensaje a la conversación.
* La posición de un mensaje no cambia tras su creación.

---

## Memory

### Descripción

`Memory` representa un hecho relevante que la conversación considera importante conservar para mantener la coherencia narrativa a largo plazo.

A diferencia de los mensajes, una memoria no describe la conversación completa, sino únicamente un fragmento concreto de información que puede seguir siendo útil durante la evolución de la historia.

La colección de todas las memorias pertenecientes a una conversación constituye su memoria dinámica.

---

### Responsabilidades

* Representar un hecho relevante de la historia.
* Asociar dicho hecho a un actor específico de la conversación.
* Mantener una prioridad que determine su relevancia narrativa.
* Permitir la edición tanto por parte del usuario como mediante propuestas de la IA.
* Facilitar la construcción del contexto enviado al modelo.

---

### No es responsabilidad de Memory

Una memoria no debe:

* Representar una conversación completa.
* Sustituir al historial de mensajes.
* Sustituir los resúmenes narrativos.
* Construir prompts.
* Decidir cuándo debe utilizarse.

Estas responsabilidades pertenecen a otros componentes del sistema.

---

### Estructura

Cada memoria describe un único hecho mediante los siguientes conceptos:

* Actor al que pertenece.
* Título.
* Descripción.
* Prioridad.

Ejemplos:

* Alice → Ubicación → Biblioteca.
* Alice → Estado emocional → Preocupada.
* {{user}} → Profesión → Herrero.
* Dragón Rojo → Debilidad → Magia de hielo.

Una memoria debe describir un único concepto. Si es necesario representar varios hechos diferentes, deberán almacenarse como memorias independientes.

---

### Actor

Toda memoria pertenece exactamente a un actor de la conversación.

Inicialmente existirán al menos dos actores:

* El personaje principal.
* El usuario.

Sin embargo, durante el desarrollo de la historia podrán aparecer nuevos actores relevantes, como aliados, enemigos o cualquier otro personaje que la IA o el usuario consideren importante recordar.

La creación de nuevos actores no requiere ninguna configuración previa y forma parte de la evolución natural de la conversación.

---

### Prioridad

Toda memoria posee una prioridad comprendida entre 1 y 10.

La prioridad representa la importancia narrativa del hecho y la probabilidad de que sea incluido en el contexto enviado al modelo.

De forma conceptual, la prioridad puede interpretarse como:

* 1–2 → Muy baja.
* 3–4 → Baja.
* 5–6 → Media.
* 7–8 → Alta.
* 9–10 → Crítica.

Esta clasificación sirve como referencia tanto para la IA como para los algoritmos internos del sistema.

---

### Creación y edición

Las memorias pueden ser creadas o modificadas tanto por el usuario como por la inteligencia artificial.

Cuando la IA proponga crear, modificar o eliminar una memoria, el usuario siempre tendrá la decisión final.

El sistema deberá registrar quién creó la memoria y quién realizó su última modificación.

---

### Selección para el contexto

Las memorias no se envían automáticamente al modelo.

Antes de cada generación, el `PromptContextBuilder` seleccionará aquellas memorias que considere más relevantes según criterios como:

* Prioridad.
* Espacio disponible dentro del contexto.
* Estado actual de la conversación.
* Configuración local de la conversación.

De esta forma, la memoria dinámica puede crecer indefinidamente sin saturar la ventana de contexto del modelo.

---

### Conflictos

Pueden existir memorias contradictorias o repetidas.

Cuando esto ocurra, la IA podrá detectar el conflicto y proponer una solución. Por ejemplo, que dos memorias se llamen "Misión" donde ambas describen diferentes misiones por cumplir. La IA puede crear "Misión 1" y "Misión 2" para solventar este problema.

---

### Eliminación

Las memorias nunca desaparecen automáticamente.

El sistema podrá sugerir su eliminación siguiendo reglas configurables definidas para cada conversación.

Un ejemplo de estas reglas consiste en proponer la eliminación de memorias cuya prioridad permanezca por debajo de un determinado umbral durante un número configurable de mensajes.

La eliminación solo se realizará tras la validación del usuario.

---

### Relaciones

Toda `Memory` pertenece exactamente a una `Conversation`.

Cada memoria describe un único hecho asociado a un actor específico de dicha conversación.

El `PromptContextBuilder` utiliza las memorias como una de las principales fuentes de información para construir el contexto enviado al modelo.

---

### Invariantes

* Toda memoria pertenece exactamente a una conversación.
* Toda memoria pertenece exactamente a un actor.
* Cada memoria representa un único hecho.
* Toda memoria posee una prioridad entre 1 y 10.
* La prioridad influye en la probabilidad de formar parte del contexto.
* La IA puede proponer cambios, pero el usuario siempre tiene la decisión final.
* Las memorias no sustituyen ni a los mensajes ni a los resúmenes.
* La colección de memorias de una conversación constituye su memoria dinámica.

---

### Observaciones futuras

En futuras versiones podrán incorporarse mecanismos más avanzados para la gestión automática de memorias, incluyendo detección de relaciones entre actores, consolidación de hechos repetidos, actualización automática de información redundante y algoritmos de recuperación selectiva de contexto.

La versión inicial del sistema prioriza un modelo simple, transparente y completamente supervisado por el usuario.

## Summary

### Descripción

`Summary` representa una síntesis narrativa acumulada de una conversación hasta un momento determinado.

Su objetivo consiste en condensar la historia desarrollada hasta ese punto para reducir la cantidad de mensajes que deben enviarse al modelo durante la construcción del contexto.

A diferencia de las memorias, un resumen describe la evolución general de la historia y no hechos individuales.

---

### Responsabilidades

* Representar el estado narrativo de la conversación hasta un momento concreto.
* Reducir la cantidad de mensajes necesarios para construir el contexto.
* Servir como punto de partida para las siguientes generaciones del modelo.
* Mantener un historial de la evolución narrativa de la conversación.

---

### No es responsabilidad de Summary

Un resumen no debe:

* Sustituir el historial completo de mensajes.
* Sustituir la memoria dinámica.
* Construir prompts.
* Decidir qué memorias utilizar.
* Modificar el contenido de la conversación.

Estas responsabilidades pertenecen a otros componentes del sistema.

---

### Generación

Los resúmenes son generados automáticamente por el sistema cuando la conversación alcanza el umbral de mensajes definido en su configuración.

Por defecto, dicho umbral será de quince mensajes, aunque cada conversación podrá definir su propia frecuencia.

El contenido del resumen será generado por la inteligencia artificial y posteriormente podrá ser revisado y editado por el usuario.

---

### Naturaleza acumulativa

Cada nuevo resumen representa el estado narrativo completo de la historia hasta el momento de su generación.

Sin embargo, los resúmenes no deben crecer indefinidamente.

Durante cada generación, la inteligencia artificial deberá sintetizar la información existente, eliminando detalles que ya no aporten contexto relevante y conservando únicamente aquellos acontecimientos que continúen siendo importantes para el desarrollo de la historia.

De esta manera, el resumen evoluciona junto con la conversación sin aumentar constantemente su tamaño.

---

### Contenido

Un resumen debe incluir únicamente acontecimientos narrativos relevantes.

No debe contener:

* Prompts utilizados por el sistema.
* Explicaciones técnicas.
* Metadatos.
* Instrucciones internas.
* Información proveniente de la memoria dinámica.

Su contenido debe centrarse exclusivamente en describir la evolución de la historia.

---

### Edición

Todos los resúmenes pueden ser editados manualmente por el usuario.

La regeneración automática únicamente estará disponible inmediatamente después de su creación y antes de que la conversación continúe.

Una vez que nuevos mensajes formen parte de la historia, el resumen se considerará consolidado y solo podrá modificarse mediante edición manual.

---

### Historial

Los resúmenes forman un historial cronológico dentro de cada conversación.

Cada resumen representa una fotografía narrativa de la historia en un momento determinado.

Aunque todos permanecen almacenados, únicamente el resumen más reciente será utilizado durante la construcción del contexto.

---

### Alcance

Cada resumen registra explícitamente el rango de mensajes que representa mediante una referencia al primer y último mensaje incluidos durante su generación.

Esto permite conocer con precisión qué parte de la conversación describe cada resumen y facilita su trazabilidad.

---

### Trazabilidad

El sistema conservará información sobre el proceso de generación de cada resumen.

Entre otros datos, podrá registrar:

* Fecha de generación.
* Modelo utilizado.
* Proveedor utilizado.
* Fecha de última edición.

Esta información tiene fines exclusivamente informativos y de auditoría, sin formar parte del contenido narrativo del resumen.

---

### Eliminación

El usuario puede eliminar cualquier resumen.

Si el resumen más reciente desaparece, el sistema utilizará automáticamente el resumen cronológicamente anterior como referencia para construir el contexto.

---

### Relaciones

Todo `Summary` pertenece exactamente a una `Conversation`.

Los resúmenes utilizan los mensajes como fuente de información para representar la evolución de la historia.

El `PromptContextBuilder` emplea únicamente el resumen más reciente durante la construcción del contexto.

Los resúmenes y las memorias dinámicas son conceptos independientes y no se modifican entre sí.

---

### Invariantes

* Todo resumen pertenece exactamente a una conversación.
* Todo resumen representa un rango específico de mensajes.
* Todo resumen describe el estado narrativo de la historia hasta un momento determinado.
* Solo el resumen más reciente participa en la construcción del contexto.
* Los resúmenes son acumulativos, pero no crecientes.
* La memoria dinámica nunca forma parte del contenido del resumen.
* El usuario puede editar cualquier resumen.
* La regeneración automática solo es posible inmediatamente después de la generación del resumen.

---

### Observaciones futuras

En futuras versiones podrán incorporarse estrategias más sofisticadas de compresión narrativa, identificación automática de capítulos, resúmenes jerárquicos o múltiples niveles de abstracción para optimizar conversaciones de muy larga duración.

La primera versión del sistema adopta un modelo lineal y acumulativo, priorizando la simplicidad, la transparencia y el control del usuario.

# Objetos del Dominio (Value Objects)

Además de las entidades principales, el sistema utiliza una serie de objetos de dominio que representan información temporal o estructurada durante la ejecución de los casos de uso.

Estos objetos no poseen identidad propia ni ciclo de vida independiente. Su función consiste en transportar información entre los distintos servicios de aplicación y representar conceptos importantes del dominio sin necesidad de persistirlos como entidades.

---

# PromptContext

## Propósito

Representa el contexto completo que será enviado al proveedor de inteligencia artificial para generar la siguiente respuesta del personaje.

Su construcción corresponde al caso de uso `BuildPromptContext`.

No se almacena en la base de datos.

---

## Responsabilidades

* Reunir toda la información necesaria para la generación.
* Mantener un formato consistente independientemente del proveedor utilizado.
* Respetar el orden establecido por el Prompt Builder.

---

## Componentes

Un `PromptContext` puede estar compuesto por:

* Definición del personaje.
* Tarjetas activas del personaje.
* Resumen más reciente de la conversación.
* Memorias dinámicas seleccionadas.
* Mensajes recientes de la conversación.
* Instrucciones internas del sistema.
* Configuración narrativa de la conversación (si aplica).

---

## Reglas

* Siempre se construye inmediatamente antes de solicitar una respuesta al modelo.
* Nunca se reutiliza entre generaciones.
* Nunca se persiste.
* Debe ser independiente del proveedor de inferencia.
* Debe contener únicamente la información necesaria para la generación actual.

---

# MemoryChangeProposal

## Propósito

Representa una propuesta de modificación sobre la memoria dinámica generada por el modelo de inteligencia artificial.

No modifica directamente el estado del dominio.

Su aplicación depende siempre de la aprobación del usuario.

---

## Responsabilidades

Permitir que la IA sugiera cambios sobre la memoria dinámica sin alterar automáticamente la historia.

---

## Operaciones posibles

Una propuesta puede representar una de las siguientes acciones:

* CREATE
* UPDATE
* DELETE

---

## Información

Cada propuesta puede contener:

* Operación.
* Actor al que pertenece la memoria.
* Título.
* Descripción.
* Prioridad propuesta.
* Motivo de la propuesta (opcional).

---

## Reglas

* Las propuestas nunca modifican directamente las memorias.
* Varias propuestas pueden referirse a una misma memoria.
* El usuario tiene siempre la decisión final.
* Una propuesta puede ser aceptada, modificada o descartada.

---

# GeneratedResponse

## Propósito

Representa el resultado completo devuelto por un proveedor de inteligencia artificial después de procesar un `PromptContext`.

Este objeto encapsula toda la información generada durante una inferencia.

No se almacena directamente como una entidad del dominio.

---

## Responsabilidades

Centralizar el resultado de una generación para que los distintos casos de uso puedan consumirlo sin depender del proveedor utilizado.

---

## Información

Un `GeneratedResponse` puede contener:

* Mensaje generado por el asistente.
* Propuestas de modificación de memoria.
* Información de uso del modelo (tokens de entrada y salida, si está disponible).
* Tiempo empleado en la generación.
* Metadatos específicos del proveedor (opcional).

---

## Reglas

* Debe ser independiente del proveedor utilizado.
* Puede contener información parcial si el proveedor no soporta determinadas métricas.
* El mensaje generado constituye el único dato obligatorio.
* El resto de la información es opcional y dependerá del proveedor conectado.

---

# Consideraciones de diseño

Los objetos del dominio permiten desacoplar la lógica de negocio de los proveedores de inteligencia artificial y de la infraestructura utilizada.

Gracias a ellos, los casos de uso trabajan siempre con estructuras propias del dominio y no con respuestas específicas de Ollama, LM Studio u otros proveedores.

Esto permite sustituir o añadir nuevos proveedores sin modificar la lógica de negocio de la aplicación.
