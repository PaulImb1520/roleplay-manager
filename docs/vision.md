# Vision

## Objetivo

Crear una aplicación de escritorio/web enfocada en la gestión de personajes de inteligencia artificial para roleplay.

El proyecto busca ofrecer conversaciones inmersivas, coherentes y persistentes mediante modelos de lenguaje ejecutados localmente, permitiendo al usuario controlar completamente sus datos y la evolución de los personajes.

La aplicación debe sentirse más como una herramienta de escritura y narrativa que como un chatbot tradicional.

---

# Filosofía

El proyecto se basa en cinco principios fundamentales.

## Offline First

Toda la aplicación debe poder funcionar completamente sin conexión a Internet.

El usuario es dueño de sus personajes, conversaciones y memorias.

No debe existir dependencia obligatoria de servicios externos a menos que el usuario decida conectarse a un proveedor en línea.

---

## Model Agnostic

La aplicación no debe depender de un proveedor específico de modelos de IA.

El sistema debe poder trabajar con Ollama, LM Studio, llama.cpp, OpenAI u otros proveedores mediante una interfaz común.

---

## Modularidad

Cada parte del sistema debe tener una única responsabilidad.

La aplicación debe poder crecer sin aumentar el acoplamiento entre módulos.

---

## Transparencia

Toda la información generada por la IA debe poder ser inspeccionada y modificada por el usuario.

El usuario siempre tendrá el control sobre:

- memoria
- resúmenes
- estado del personaje
- instrucciones
- contexto enviado al modelo

---

## Experiencia de usuario

La interfaz debe transmitir calma y creatividad.

Se buscará una estética cozy, moderna y amigable, utilizando colores suaves y componentes reutilizables.

La aplicación debe sentirse como un espacio cómodo para escribir historias, conversar con personajes y desarrollar mundos.

---

# Objetivos principales

- Crear personajes altamente configurables.
- Mantener conversaciones largas con coherencia.
- Gestionar automáticamente memoria y contexto.
- Permitir editar cualquier aspecto del sistema.
- Facilitar la experimentación con diferentes modelos.

---

# Objetivos secundarios

- Escenarios persistentes.
- Múltiples personajes.
- Exportación e importación.
- Plugins.
- API pública.
- Compatibilidad con distintos proveedores de IA.

---

# Criterios de calidad

Antes de añadir nuevas funcionalidades, el proyecto debe mantener:

* código limpio;
* responsabilidades bien separadas;
* documentación actualizada;
* experiencia de usuario consistente;
* facilidad para realizar pruebas y depuración.

La mantenibilidad tendrá prioridad sobre implementar funciones rápidamente.

---

# Lo que NO pretende ser

Este proyecto no busca competir con ChatGPT ni ser un asistente general.

Su propósito principal es facilitar experiencias narrativas y de roleplay mediante modelos locales.

Las decisiones técnicas deben favorecer la flexibilidad, mantenibilidad y privacidad antes que la complejidad innecesaria.