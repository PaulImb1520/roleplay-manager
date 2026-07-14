# 03 - Roadmap

# Roadmap de Desarrollo

Este documento describe las fases de desarrollo previstas para la primera versión del proyecto.

Cada fase tiene como objetivo añadir una capacidad funcional al sistema y dejar la aplicación en un estado estable antes de continuar con la siguiente.

El orden de las fases podrá modificarse si durante el desarrollo se identifica una alternativa que simplifique la arquitectura o mejore la experiencia del usuario, siempre que respete los principios definidos en la documentación del proyecto.

---

# Fase 0 — Fundamentos

## Objetivo

Preparar la base técnica y organizativa del proyecto.

## Objetivos

* Configurar el monorepo.
* Configurar el backend.
* Configurar la base de datos.
* Configurar la arquitectura base.
* Definir la documentación inicial.
* Preparar el entorno de desarrollo.

## Resultado esperado

El proyecto cuenta con una estructura sólida sobre la que comenzar el desarrollo de funcionalidades.

---

# Fase 1 — Gestión de personajes

## Objetivo

Permitir que el usuario cree y administre personajes.

## Objetivos

* Crear personajes.
* Editar personajes.
* Eliminar personajes.
* Gestionar la información general del personaje.
* Gestionar instrucciones para la IA.
* Gestionar personalidad, apariencia y contexto inicial.

## Resultado esperado

El usuario puede crear personajes completamente configurables que posteriormente podrán utilizarse en conversaciones.

---

# Fase 2 — Conversaciones

## Objetivo

Implementar el sistema de conversaciones persistentes.

## Objetivos

* Crear conversaciones.
* Guardar mensajes.
* Recuperar conversaciones.
* Historial persistente.
* Streaming de respuestas.
* Gestión del ciclo de vida de una conversación.

## Resultado esperado

El usuario puede mantener conversaciones persistentes con un personaje.

---

# Fase 3 — Proveedores de IA

## Objetivo

Desacoplar la aplicación de cualquier proveedor específico de modelos.

## Objetivos

* Diseñar la interfaz común para proveedores.
* Implementar el primer proveedor de IA local.
* Permitir seleccionar el proveedor disponible.
* Gestionar errores y estados de conexión.

## Resultado esperado

La aplicación puede comunicarse con modelos de IA sin depender de una implementación concreta.

---

# Fase 4 — Construcción del contexto

## Objetivo

Construir automáticamente el contexto enviado al modelo.

## Objetivos

* Implementar el Prompt Builder.
* Incorporar la tarjeta del personaje.
* Incorporar la conversación reciente.
* Definir el orden y composición del contexto.
* Permitir inspeccionar el contexto generado.

## Resultado esperado

Cada petición enviada al modelo se construye de forma consistente y transparente.

---

# Fase 5 — Memoria dinámica

## Objetivo

Mantener una base de conocimiento activa sobre la historia.

## Objetivos

* Crear memorias dinámicas.
* Actualizar memorias existentes.
* Eliminar memorias obsoletas.
* Clasificar memorias por actor.
* Asignar prioridades.
* Permitir revisión y edición por parte del usuario.

## Resultado esperado

La historia conserva los hechos importantes sin depender únicamente del historial de mensajes.

---

# Fase 6 — Resúmenes

## Objetivo

Reducir el tamaño del contexto manteniendo la continuidad narrativa.

## Objetivos

* Generar resúmenes periódicos.
* Almacenar el historial de resúmenes.
* Incorporar el resumen más reciente al contexto.
* Permitir revisar los resúmenes generados.

## Resultado esperado

Las conversaciones pueden continuar durante largos periodos sin depender del historial completo.

---

# Fase 7 — Herramientas de inspección

## Objetivo

Dar al usuario control total sobre la información utilizada por el sistema.

## Objetivos

* Visualizar la memoria dinámica.
* Editar memorias.
* Eliminar memorias.
* Visualizar resúmenes.
* Inspeccionar el contexto enviado al modelo.
* Mostrar información de depuración cuando sea necesario.

## Resultado esperado

El usuario comprende y controla completamente el funcionamiento interno del sistema.

---

# Fase 8 — Pulido de la versión 1.0

## Objetivo

Preparar una primera versión estable.

## Objetivos

* Mejorar rendimiento.
* Corregir errores.
* Refinar la experiencia de usuario.
* Optimizar la gestión del contexto.
* Mejorar la documentación.
* Revisar la arquitectura.

## Resultado esperado

La aplicación ofrece una experiencia estable, coherente y preparada para evolucionar en futuras versiones.

---

# Evolución futura

Las siguientes capacidades quedan fuera del alcance de la versión 1.0, pero la arquitectura deberá facilitar su incorporación en futuras iteraciones.

* Recuperación selectiva de contexto.
* Escenarios persistentes.
* Sistemas avanzados de relaciones.
* Importación y exportación de personajes.
* Plugins.
* Sincronización opcional.
* API pública.
* Nuevos proveedores de IA.
* Herramientas avanzadas de escritura.
* Funcionalidades colaborativas.
