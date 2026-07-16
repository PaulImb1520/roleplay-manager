# 00 - Vision

# Visión

## Propósito

Este proyecto tiene como objetivo crear un motor narrativo para personajes de inteligencia artificial que permita mantener conversaciones de roleplay largas, coherentes y persistentes utilizando modelos de lenguaje ejecutados localmente.

La aplicación busca ofrecer una experiencia inmersiva donde el usuario pueda crear, personalizar y desarrollar personajes con total libertad, manteniendo el control sobre toda la información generada durante la conversación.

Más que un simple chat con inteligencia artificial, el proyecto pretende convertirse en una herramienta para construir historias, explorar personajes y desarrollar narrativas de forma natural.

---

# Problema

Los modelos de lenguaje actuales poseen una ventana de contexto limitada. A medida que una conversación se vuelve más extensa, comienzan a olvidar información importante, afectando la coherencia del personaje, las relaciones construidas y los acontecimientos ocurridos durante la historia.

Aunque existen diferentes aplicaciones enfocadas al roleplay, muchas de ellas ofrecen poca transparencia sobre cómo gestionan el contexto, la memoria o la información enviada al modelo. Esto limita la capacidad del usuario para comprender, corregir o personalizar el comportamiento de la inteligencia artificial.

Este proyecto nace con el objetivo de ofrecer una alternativa donde el usuario tenga un control completo sobre el funcionamiento interno del sistema.

---

# Objetivos

La primera versión del proyecto busca demostrar que es posible mantener conversaciones largas y coherentes mediante una arquitectura que combine:

* Personajes completamente configurables.
* Gestión inteligente del contexto.
* Memoria dinámica editable.
* Resúmenes automáticos de la historia.
* Compatibilidad con distintos proveedores de modelos de IA.
* Ejecución completamente local de los datos del usuario, con opción de utilizar proveedores de inferencia locales o remotos.

Cada uno de estos componentes debe trabajar conjuntamente para reducir el impacto de la ventana de contexto de los modelos de lenguaje sin sacrificar la calidad narrativa de la conversación.

---

# Filosofía

El proyecto se construye sobre los siguientes principios.

## Offline First

La aplicación almacena toda la información del usuario localmente: personajes, conversaciones, memorias, resúmenes y configuraciones. Estos datos nunca salen del equipo del usuario sin su consentimiento explícito y permanecen disponibles aunque no haya conexión a Internet.

El proveedor de inferencia, por el contrario, puede ser local o remoto a elección del usuario. La arquitectura no impone un proveedor concreto: el usuario puede ejecutar modelos en su propio equipo (Ollama, LM Studio) o conectar con proveedores en línea (OpenAI, Azure OpenAI, etc.) si dispone de conexión y así lo decide. El sistema funciona completamente aislado con un proveedor local, pero no se cierra al uso de proveedores remotos cuando el usuario lo considere oportuno.

---

## Model Agnostic

El sistema no debe depender de un proveedor específico de inteligencia artificial.

Toda interacción con modelos de lenguaje deberá realizarse mediante una capa de abstracción que permita integrar diferentes proveedores sin modificar el resto de la aplicación.

---

## Transparencia

El usuario siempre debe poder inspeccionar, comprender y modificar la información que el sistema utiliza para construir el contexto enviado al modelo.

La inteligencia artificial no debe comportarse como una caja negra.

---

## Modularidad

Cada módulo del sistema debe tener una única responsabilidad claramente definida.

Las diferentes partes de la aplicación deben evolucionar de forma independiente siempre que sea posible.

---

## Experiencia agradable

La interfaz debe transmitir tranquilidad, creatividad y concentración.

El diseño debe sentirse cercano a una herramienta de escritura o creación narrativa, evitando una apariencia excesivamente técnica o empresarial.

---

# Alcance de la versión 1.0

La primera versión estará enfocada en ofrecer una experiencia sólida alrededor de un único personaje por conversación.

El sistema permitirá gestionar personajes, mantener conversaciones persistentes, construir automáticamente el contexto enviado al modelo mediante memoria dinámica, resúmenes e historial reciente, además de permitir que el usuario inspeccione y modifique toda la información utilizada por la inteligencia artificial.

La prioridad será construir una base estable, extensible y fácil de mantener antes de incorporar funcionalidades más avanzadas.

---

# Lo que este proyecto no pretende ser

Este proyecto no busca reemplazar asistentes conversacionales generales ni competir con plataformas enfocadas en productividad.

Tampoco pretende ofrecer una simulación completa de mundos persistentes o sistemas complejos de juego de rol en su primera versión.

Las funcionalidades avanzadas, como múltiples personajes interactuando simultáneamente, recuperación semántica de contexto, escenarios persistentes, plugins o sincronización en la nube, forman parte de posibles evoluciones futuras, pero no condicionan las decisiones de diseño de la primera versión.

---

# Nuestra definición de éxito

Consideraremos que la primera versión ha cumplido su objetivo cuando un usuario pueda crear un personaje, mantener una conversación extensa con un modelo local y percibir que el personaje conserva su identidad, recuerda los hechos importantes y mantiene una narrativa coherente durante toda la experiencia, sin perder el control sobre la información que el sistema almacena y utiliza.
