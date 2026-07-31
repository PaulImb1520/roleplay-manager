# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-07-31

### Added

- S1 — Configurar proveedor por defecto (registro de proveedores de IA y configuración inicial).
- S2 — Gestión de personajes + shell de la aplicación (CRUD de personajes, navegación y layout).
- S3 — Envío y recepción de mensajes (streaming SSE, estado de generación).
- S4 — Edición de personajes y carga de conversaciones.
- S5 — Regenerar, editar, retroceder, eliminar, continuar y ciclaje de alternativas de respuesta.
- S6 — Memoria dinámica con modos Auto/Manual.
- S7 — Resúmenes (synopsis) de conversaciones largas.
- S8 — Inspección de contexto (prompt) y títulos de conversación.
- S9 — Pulido transversal para v1.0 (16 tareas de UX, bugs, validación, ordenamiento y responsive).

### Changed

- Licencia del proyecto: AGPL-3.0-or-later.
- Scripts de instalación y arranque para usuarios finales (`scripts/install.*` y `scripts/start.*`).

### Fixed

- Historial de regeneraciones: persistencia del contenido original y contador de versiones (S9.10.5).
- Hydration mismatch en el hook `usePersistedValue` (draft del chat).
- Pantalla de proveedores: error de O-llama al entrar y UX general (S9.6).
