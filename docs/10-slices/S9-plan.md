# S9 — Pulido transversal (Plan)

**Estado:** 🔄 En progreso  
**Inicio:** 2026-07-28  

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
- [ ] **S9.10.5** — El historial de mensajes el regenerar está roto. Los mensajes no están apilados correctamente, el contador no funciona como debería y al avanzar y retroceder con las flechas, un mensaje se vuelve inaccesible.
- [ ] **S9.11** — Manejar la recarga de página mientras se está realizando streaming de una respuesta (ej. reintentar, mostrar estado, o preservar el stream in progress).
- [ ] **S9.12** — Añadir retroalimentación de errores al guardar un personaje (ej. validar tarjetas vacías, mostrar errores de campo específicos).

### Input y validación

- [ ] **S9.13** — Limitar los campos de ingreso de texto a un rango razonable (2000-3000 caracteres según el campo).
- [ ] **S9.14** — Usar localStorage para almacenar temporalmente el mensaje del usuario que está en el input, preservándolo al cambiar de conversación o recargar.

### Ordenamiento y listas

- [ ] **S9.15** — Ordenar las conversaciones por las más recientes (fecha de última actividad, descendente).

### Responsive / Accesibilidad

- [ ] **S9.16** — Verificar que el chat sea utilizable desde el navegador del teléfono (responsive design mínimo).

---

## Tareas para Post-MVP

Las siguientes funcionalidades quedan fuera del alcance de v1.0 pero se registran aquí para planificación futura.

### Imágenes y medios (Post-MVP)

| # | Propuesta | Dependencias |
|---|-----------|-------------|
| PM.1 | Importar imágenes para guardarlas en la BDD (no solo links) para la foto de perfil. | Nueva columna/tabla, storage |
| PM.2 | Añadir recortador de imágenes para la foto de perfil. | PM.1 |
| PM.3 | Compresor de imágenes para la imagen de fondo y recortador para sección cuadrada. | PM.1 |
| PM.4 | Modificar imagen de perfil sin crear una nueva versión del personaje. | PM.1 |
| PM.5 | Permitir elegir imagen de fondo para el chat (por defecto la foto de perfil), con modos de muestreo (rellenar, recortar, etc.). | PM.1 |

### Agrupación y navegación (Post-MVP)

| # | Propuesta | Dependencias |
|---|-----------|-------------|
| PM.6 | Agrupar conversaciones por personaje en una sola card. Usar ContextMenu para submenús: crear conversación eligiendo versión, editar personaje, elegir conversación asociada (ordenada por más reciente). Opción "Ir a la más reciente". | — |
| PM.7 | Ramas de historia en una misma conversación con interfaz visual. | — |

### Exportación / Importación (Post-MVP)

| # | Propuesta | Dependencias |
|---|-----------|-------------|
| PM.8 | Importar personaje desde archivo (drag & drop o buscador de archivos). | — |
| PM.9 | Exportar conversaciones. | — |
| PM.10 | Gestor de exportación: exportar definición del personaje, versiones específicas, conversaciones asociadas, memoria dinámica, resúmenes, configuraciones. Accesible desde ContextMenu de la lista de personajes. | PM.8, PM.9 |

### Multi-idioma y temas (Post-MVP)

| # | Propuesta | Dependencias |
|---|-----------|-------------|
| PM.11 | Soporte multi-idioma, por defecto inglés. | — |
| PM.12 | Temas de colores preestablecidos. | — |
| PM.13 | Pantalla de bienvenida que pregunte idioma y tema en el primer inicio. | PM.11, PM.12 |
| PM.14 | Menubar superior para elegir idioma y tema. | PM.11, PM.12 |

### Nuevas funcionalidades (Post-MVP)

| # | Propuesta | Dependencias |
|---|-----------|-------------|
| PM.15 | Personajes que el usuario representa (nombre y descripción, no requieren versión). | — |
| PM.16 | Navegación de historial de regeneraciones deslizando la burbuja del mensaje hacia los lados (mobile). | S9.16 |

---

## Criterios de aceptación de S9

- [ ] Todas las tareas S9.1 a S9.16 marcadas como completadas.
- [ ] `pnpm check` pasa en todo el workspace.
- [ ] No hay regresiones en los slices anteriores (S1–S8).
- [ ] La experiencia del usuario es estable y predecible.
