# 02 - MVP

# Minimum Viable Product (MVP)

## Objetivo

El objetivo de la primera versión es demostrar que es posible mantener conversaciones largas, coherentes y persistentes con personajes de inteligencia artificial utilizando modelos ejecutados localmente, ofreciendo al usuario control total sobre la información que el sistema utiliza para construir el contexto de cada respuesta.

La versión 1.0 prioriza una base sólida, extensible y fácil de mantener sobre la cantidad de funcionalidades.

---

# Experiencia esperada

Al finalizar esta versión, un usuario deberá poder:

* Crear un personaje completamente configurable.
* Iniciar una conversación con dicho personaje utilizando un modelo de IA local.
* Mantener conversaciones largas sin que el personaje pierda su identidad o los hechos importantes de la historia.
* Revisar y editar la memoria dinámica generada por el sistema.
* Consultar los resúmenes de la conversación.
* Continuar conversaciones anteriores sin perder la coherencia narrativa.
* Comprender qué información está siendo enviada al modelo antes de generar una respuesta.

Si estas acciones funcionan de forma estable y natural, el MVP se considerará completado.

---

# Funcionalidades principales

## Gestión de personajes

El usuario podrá:

* Crear personajes.
* Editar personajes.
* Eliminar personajes.
* Configurar instrucciones del personaje.
* Definir personalidad.
* Definir apariencia.
* Definir contexto inicial.

---

## Conversaciones

El usuario podrá:

* Crear conversaciones.
* Continuar conversaciones existentes.
* Consultar el historial completo.
* Recibir respuestas mediante streaming.
* Guardar automáticamente toda la conversación.

---

## Compatibilidad con modelos

La aplicación deberá funcionar mediante una arquitectura basada en proveedores de IA.

La implementación inicial utilizará modelos locales, pero la aplicación no dependerá de un proveedor específico.

El usuario podrá seleccionar el proveedor disponible sin modificar el funcionamiento del resto del sistema.

---

## Construcción del contexto

Antes de cada respuesta, el sistema deberá construir automáticamente el contexto utilizando:

* Tarjeta del personaje.
* Memoria dinámica.
* Resumen más reciente.
* Conversación reciente.
* Mensaje actual del usuario.

La composición del contexto deberá ser completamente transparente para el usuario.

---

## Memoria dinámica

Después de cada interacción, el sistema podrá proponer cambios sobre la memoria dinámica compuesta por hechos relevantes para la historia.

Cada elemento de memoria deberá:

* Tener un nombre específico y único.
* Poder modificarse.
* Poder eliminarse.
* Poder actualizarse.
* Tener una prioridad.
* Permanecer editable por el usuario en todo momento.

La memoria representa conocimiento activo del mundo y de los personajes, no un historial de mensajes.

---

## Resúmenes

El sistema deberá generar automáticamente resúmenes periódicos de la conversación.

Estos resúmenes permitirán reducir el contexto enviado al modelo sin perder la continuidad narrativa.

Los resúmenes anteriores permanecerán almacenados como parte del historial, aunque únicamente el más reciente formará parte del contexto en la versión 1.0.

---

## Transparencia

El usuario podrá inspeccionar:

* El contexto enviado al modelo.
* La memoria dinámica.
* Los resúmenes.
* La configuración del personaje.

La aplicación deberá favorecer la comprensión del funcionamiento interno del sistema.

---

# Criterios de éxito

La versión 1.0 será considerada funcional cuando:

* Las conversaciones puedan extenderse durante largos periodos sin una pérdida significativa de coherencia.
* El personaje mantenga una personalidad consistente.
* Los hechos importantes permanezcan disponibles mediante la memoria dinámica.
* Los resúmenes permitan continuar la conversación sin depender del historial completo.
* El usuario conserve el control sobre toda la información utilizada por el sistema.
* La arquitectura permita añadir nuevas funcionalidades sin requerir una reestructuración importante.

---

# Fuera del alcance

Las siguientes funcionalidades no forman parte de la versión 1.0:

## Narrativa

* Múltiples personajes interactuando simultáneamente.
* Escenarios persistentes.
* Director o narrador controlado por IA.
* Recuperación semántica avanzada de contexto.
* Sistemas complejos de relaciones entre múltiples personajes.

---

## Plataforma

* Sincronización en la nube.
* Cuentas de usuario.
* Trabajo colaborativo.
* API pública.
* Plugins.
* Aplicación móvil.

---

## Gestión de datos

* Importación y exportación de personajes.
* Compartir personajes.
* Versionado de conversaciones.
* Copias de seguridad automáticas.

---

## Inteligencia Artificial

* Uso simultáneo de múltiples modelos.
* Agentes especializados colaborando entre sí.
* Fine-tuning.
* Entrenamiento de modelos.
* Generación de imágenes.

---

# Evolución prevista

El diseño de la versión 1.0 deberá facilitar la incorporación futura de nuevas capacidades sin romper la arquitectura existente.

La prioridad será construir un núcleo estable sobre el que puedan añadirse sistemas más avanzados, como recuperación selectiva de contexto, escenarios persistentes, relaciones complejas, plugins o nuevos proveedores de modelos de inteligencia artificial.
