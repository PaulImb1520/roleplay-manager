# 01 - Principles

# Principios del Proyecto

Este documento define los principios fundamentales que guían todas las decisiones de diseño, arquitectura y desarrollo.

Cuando existan varias formas válidas de resolver un problema, siempre se deberá elegir la opción que mejor respete estos principios.

---

# El usuario siempre tiene el control

La inteligencia artificial nunca debe convertirse en la autoridad sobre la historia.

El sistema puede proponer cambios, generar recuerdos, actualizar resúmenes o sugerir modificaciones, pero el usuario siempre tendrá la posibilidad de revisar, editar o eliminar cualquier información almacenada.

La IA propone.

La aplicación valida.

El usuario decide.

---

# Todo debe ser transparente

El usuario debe poder conocer en todo momento qué información está utilizando el modelo para generar una respuesta.

El sistema nunca debe ocultar cómo se construye el contexto.

Siempre que sea posible, el usuario podrá inspeccionar:

* La tarjeta del personaje.
* La memoria dinámica.
* Los resúmenes.
* Los mensajes recientes.
* El contexto final enviado al modelo.

La aplicación no debe comportarse como una caja negra.

---

# Todo debe ser editable

Ninguna información generada automáticamente debe considerarse permanente.

El usuario debe poder modificar, corregir o eliminar cualquier elemento generado por la inteligencia artificial.

Esto incluye:

* Personajes.
* Memorias.
* Resúmenes.
* Configuración.
* Prompts.
* Relaciones.
* Datos narrativos.

La inteligencia artificial debe facilitar la creatividad del usuario, nunca limitarla.

---

# Los modelos son intercambiables

La aplicación no debe depender de un proveedor específico de modelos de lenguaje.

Toda comunicación con una IA debe realizarse mediante una capa de abstracción común.

Cambiar de Ollama a LM Studio, OpenAI o cualquier otro proveedor no debe requerir modificar la lógica de negocio.

---

# El contexto es un recurso limitado

La ventana de contexto de un modelo es un recurso valioso.

Cada dato enviado al modelo debe aportar valor.

No se debe incluir información redundante o irrelevante.

La calidad del contexto tiene prioridad sobre la cantidad.

---

# La memoria representa hechos, no conversaciones

La memoria dinámica no almacena conversaciones completas.

Almacena únicamente hechos relevantes que continúan siendo importantes para el desarrollo de la historia.

Cada elemento de memoria representa conocimiento útil para mantener la coherencia narrativa.

---

# Los resúmenes representan narrativa

Los resúmenes existen para conservar la continuidad de la historia.

No sustituyen la memoria dinámica.

Su objetivo es condensar los acontecimientos recientes sin perder el hilo narrativo.

La memoria y los resúmenes cumplen responsabilidades diferentes y complementarias.

---

# Una única responsabilidad por módulo

Cada módulo del sistema debe tener una responsabilidad claramente definida.

Los módulos deben comunicarse mediante interfaces bien establecidas y evitar dependencias innecesarias.

El bajo acoplamiento y la alta cohesión tienen prioridad sobre soluciones rápidas pero difíciles de mantener.

---

# Arquitectura preparada para evolucionar

Las decisiones técnicas deben facilitar el crecimiento del proyecto.

Antes de añadir complejidad, se debe construir una base sólida y modular.

El sistema debe poder evolucionar sin requerir grandes reescrituras.

Se priorizará una arquitectura extensible antes que una arquitectura sobreingenierizada.

---

# Offline First

La aplicación debe poder funcionar completamente sin conexión a Internet.

Todos los datos pertenecen al usuario.

El acceso a servicios externos debe ser siempre opcional.

---

# Simplicidad antes que automatización

Cuando dos soluciones ofrezcan una experiencia similar, se preferirá aquella que sea más sencilla de comprender, mantener y extender.

La automatización nunca debe introducir complejidad innecesaria.

Las funcionalidades avanzadas deben incorporarse únicamente cuando resuelvan un problema real.

---

# La experiencia del usuario es prioritaria

Las decisiones técnicas deben mejorar la experiencia narrativa.

Una arquitectura elegante no tiene valor si dificulta el uso de la aplicación.

La interfaz debe transmitir tranquilidad, claridad y creatividad.

Cada elemento de la aplicación debe ayudar al usuario a concentrarse en la historia y en sus personajes.

---

# Calidad antes que cantidad

Es preferible ofrecer pocas funcionalidades bien implementadas que muchas funcionalidades incompletas.

Cada nueva característica debe integrarse de forma natural con el resto del sistema y respetar todos los principios definidos en este documento.

---

# Definición de una buena decisión

Una decisión de diseño será considerada correcta cuando:

* Respete la privacidad del usuario.
* Mantenga la modularidad del sistema.
* Sea fácil de mantener y extender.
* Reduzca el acoplamiento entre módulos.
* Favorezca la coherencia narrativa.
* Permita al usuario conservar el control.
* No comprometa la simplicidad del proyecto.
* Prepare la aplicación para futuras evoluciones sin implementarlas prematuramente.
