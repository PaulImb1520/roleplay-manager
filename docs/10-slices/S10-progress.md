# S10 — Auto-degradación de memorias

**Estado:** pendiente.

## Objetivo

Añadir un mecanismo programado para eliminar automáticamente memorias dinámicas que hayan perdido relevancia narrativa, liberando espacio en la memoria dinámica sin requerir intervención del usuario ni del asistente.

## Decisiones clave

[Diseño pendiente]

## Sub-slices

[Diseño pendiente]

## Cambios en schema (Drizzle)

[Pendiente]

## Nuevos endpoints

[Pendiente]

## Cambios frontend

[Pendiente]

## Pendientes

- Definir las reglas configurables de auto-degradación (umbral de prioridad, número de mensajes sin actualización, etc.).
- Decidir cuándo se ejecuta el barrido (¿al final de `send-message`? ¿tarea programada? ¿bajo demanda?).
- Decidir si requiere confirmación del usuario o se ejecuta silenciosamente (modo auto/manual).
- Diseñar la UI de configuración (parámetros toggleables por conversación).
