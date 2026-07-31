# S9 — Pulido transversal (Plan)

**Estado:** ✅ Completado (v1.0.0 publicado)  
**Inicio:** 2026-07-28  
**Cierre:** 2026-07-31  

## Objetivo

La versión 1.0 cumple los criterios de éxito del MVP con una experiencia estable y pulida. Este slice agrupa correcciones rápidas, mejoras de UX y bugs detectados durante el uso del sistema que no justifican un slice completo pero son necesarios para cerrar la versión.

---

## Tareas de pulido para v1.0

### UX / UI

- [x] **S9.1** — Reemplazar las letras "RM" del SidebarMenu por un logo real de tamaño cuadrado, acorde a los demás íconos del menú.
- [x] **S9.2** — Reemplazar la plantilla de lista vacía de personajes por el componente `Empty` de Shadcn.
- [x] **S9.3** — Añadir animación de "puntos suspensivos" mientras la IA responde, indicando que está generando.
- [x] **S9.4** — Aplicar buffering de streaming para que los mensajes del asistente se muestren de forma más fluida (ej. acumular chunks y renderizar por párrafos completos). *Reemplazado — el buffer provocaba que el texto se almacenara hasta completarse. Se eliminó el buffer, los chunks se renderizan directamente chunk por chunk.*
- [x] **S9.5** — Añadir un selector de versiones en la pantalla de edición/creación de personajes (dropdown o lista para elegir la versión activa).
- [x] **S9.6** — Organizar mejor la pantalla de Proveedores (revisar espaciado, jerarquía visual y agrupación de secciones, mejorar la UX, corregir error de O-llama al entrar a la pantalla y reemplazar select de modelo por Combobox). *Refactorizado: la pantalla ya no auto-valida modelos al cargar. Cada proveedor tiene su propia tarjeta con un botón "Probar conexión" explícito. Se añadió un Combobox a `@workspace/ui` para reemplazar el Select de modelos. Pill en el header muestra el proveedor actual. Botón "Guardar de todos modos" solo aparece tras una verificación fallida. Toaster movido al layout global.*
- [x] **S9.7** — Mantener el estado de la última configuración abierta en el panel de ajustes (SettingsPanel recordar qué tab/accordion estaba abierto).
- [x] **S9.8** — Añadir funcionalidad para que al hacer clic en el Avatar del chat navegue a la pantalla de definición del personaje.
- [x] **S9.9** — Añadir la capacidad de ordenar las tarjetas de personaje con drag & drop.

### Bugs y estados boundary

- [x] **S9.10** — El botón de rebobinar no debe aparecer en el último mensaje.
- [x] **S9.10.5** — El historial de mensajes el regenerar está roto. Los mensajes no están apilados correctamente, el contador no funciona como debería y al avanzar y retroceder con las flechas, un mensaje se vuelve inaccesible.
- [x] **S9.11** — Manejar la recarga de página mientras se está realizando streaming de una respuesta (ej. reintentar, mostrar estado, o preservar el stream in progress). *Decisión: documentar el comportamiento actual sin añadir lógica. La persistencia del mensaje se hace al final del stream en el use case, por lo que recargar mientras hay chunks en vuelo puede dejar la conversación sin el mensaje. El usuario puede regenerar manualmente. La complejidad de un "stream resumible" queda fuera de v1.0.*
- [x] **S9.12** — Añadir retroalimentación de errores al guardar un personaje (ej. validar tarjetas vacías, mostrar errores de campo específicos). *Los errores en línea aparecen solo después de blur o de un intento de envío. El botón de guardar se deshabilita hasta que todos los campos obligatorios estén completos. Se eliminaron los errores rojos permanentes que ocupaban espacio.*

### Input y validación

- [x] **S9.13** — Limitar los campos de ingreso de texto a un rango razonable (2000-3000 caracteres según el campo). *Límites: nombre 80, subtítulo 150, imagen 2048, saludo 500, descripción 2000, instrucciones 2000, título de tarjeta 80, contenido de tarjeta 2500. Contador inline que se vuelve rojo al 90% del límite.*
- [x] **S9.14** — Usar localStorage para almacenar temporalmente el mensaje del usuario que está en el input, preservándolo al cambiar de conversación o recargar. *El draft se persiste por conversationId usando el hook usePersistedValue existente. Se limpia al enviar. La reescritura al rebobinar también persiste.*

### Ordenamiento y listas

- [x] **S9.15** — Ordenar las conversaciones por las más recientes (fecha de última actividad, descendente). *Se añadió lastActivityAt al DTO (último mensaje o updatedAt como fallback). El use case ordena por lastActivityAt descendente antes de devolver la lista.*

### Responsive / Accesibilidad

- [x] **S9.16** — Verificar que el chat sea utilizable desde el navegador del teléfono (responsive design mínimo). *El padding global del AppShell se redujo a p-4 en móvil y p-6 en desktop. El proveedor-manager dejó de tener padding propio (lo hereda del AppShell). Responsive grid (1 col móvil, 2/3 cols escritorio).*

---

## Post-MVP backlog

Las funcionalidades Post-MVP se movieron a [`PM-backlog.md`](./PM-backlog.md). Cuando un PM se promueva a un slice (`S11`, `S12`, …), se documentará ahí con criterios de aceptación y notas de implementación.

---

## Criterios de aceptación de S9

- [x] Todas las tareas S9.1 a S9.16 marcadas como completadas.
- [x] `pnpm check` pasa en todo el workspace.
- [x] No hay regresiones en los slices anteriores (S1–S8).
- [x] La experiencia del usuario es estable y predecible.
- [x] Versión oficial **1.0.0** publicada (tag `v1.0.0`, `CHANGELOG.md`, bump de `package.json`).
