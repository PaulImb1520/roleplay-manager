# S1 - Configurar proveedor por defecto

**Estado:** completado. Commit `S1: Configurar proveedor por defecto`.
**Slice:** S1 (ver `docs/08-workflow.md`).
**Entregable:** el usuario puede abrir la pagina de configuracion de proveedores, ver los dos proveedores registrados (`ollama` y `openai-compatible`) con su estado de conexion, seleccionar uno, ver/ingresar un modelo, y guardar la seleccion como proveedor por defecto del sistema. La configuracion persiste en `settings` y sobrevive reinicios.

## Decisiones confirmadas (preguntas del plan)

1. **`ConfigureDefaultProvider` valida pero permite override**: por defecto valida conexion antes de persistir; si la validacion falla, retorna `409 ProviderUnavailable` sin persistir. Si el body trae `force: true`, persiste sin validar. Esto honra tanto el flujo principal de `configure-default-provider.md` (verifica -> persiste) como la regla de `validate-provider-connection.md` (la decision queda en manos del usuario).

2. **`GET /api/providers` solo lista IDs**: devuelve `[{ id: "ollama" }, { id: "openai-compatible" }]`. El frontend dispara en paralelo `GET /api/providers/:id/status` para cada uno al montar la pagina. Mantiene el endpoint de listado instantaneo y los timeouts aislados.

3. **Anadir `openai` SDK en S1**: el SDK expone `client.models.list()` que es justo lo que necesitamos para `listModels`. Evita rework en S4.

4. **Componentes shadcn a anadir (todos)**: `card`, `select`, `toggle-group`, `input`, `label`, `field`, `field-group`, `badge`, `alert`, `separator`, `spinner`, `sonner`.

## Decisiones ya tomadas (de docs y S0)

- Stack: backend hexagonal (puerto + adaptador + caso de uso + controller), Express + Drizzle, Vitest.
- Adaptador Ollama: HTTP nativo con `fetch` contra `GET /api/tags` (`http://localhost:11434` por defecto). No usa SDK.
- Adaptador OpenAI-compatible: SDK oficial `openai` con `baseURL` configurable. En S1 solo `client.models.list()`.
- Persistencia de la config del proveedor por defecto: tabla `settings`, claves `default_provider` y `default_model`.
- Persistencia de la config de OpenAI-compat: tabla `settings`, claves `provider_openai_compatible_url` y `provider_openai_compatible_api_key` (la API key se enmascara en UI; nunca se loguea ni se expone en `/status`).
- S1 NO implementa `generate` ni `generateStreaming` (esos vienen en S4).
- Registry como puerto: `ProviderRegistry` y `ProviderPort` como `interface` en `domain/ports/`. La implementacion (lee `settings` y construye el adaptador) vive en `infrastructure/adapters/secondary/providers/provider-registry.ts`.
- URL de Ollama: env `OLLAMA_BASE_URL` (default `http://localhost:11434`). No se expone en UI en S1.
- URL+API key de OpenAI-compat: si en la UI (obligatorias para que funcione).
- Estado de frontend en S1: `useState`/`useEffect` local del componente React. Zustand se introduce en S4.
- shadcn: `pnpm dlx shadcn@latest add ...` desde cwd `packages/ui/` (estilo `base-nova` ya confirmado en `components.json`).

## Pasos en orden

### Fase 1 - Tipos compartidos

1. `packages/shared/src/types/provider.ts` (nuevo): `ProviderId`, `ProviderStatus`, `ProviderModel`, `DefaultProviderConfig`, DTOs de respuesta HTTP.

### Fase 2 - Backend dominio

2. `packages/backend/src/domain/ports/provider.port.ts` (modificar): reemplazar el stub `unknown` por la interface `ProviderPort` real con `validateConnection()` y `listModels()`, y anadir `ProviderRegistry` como interface.
3. `packages/backend/src/domain/ports/settings.repository.ts` (nuevo): puerto `SettingsRepository` con `get`, `getMany`, `set`.
4. `packages/backend/src/infrastructure/adapters/primary/middlewares/error-handler.ts` (modificar): anadir `ProviderError` (502) y `ProviderTimeoutError` (504) clases, alineadas con la tabla de `07-technical-architecture.md`.

### Fase 3 - Backend infraestructura

5. `packages/backend/src/infrastructure/adapters/secondary/drizzle/repositories/drizzle-settings.repository.ts` (nuevo): implementacion del puerto `SettingsRepository` contra la tabla `settings` (ya migrada en S0).
6. `packages/backend/src/infrastructure/adapters/secondary/providers/ollama.adapter.ts` (nuevo): constructor con `baseUrl`, `validateConnection()` contra `GET /api/tags`, `listModels()` parseando `models[].name`.
7. `packages/backend/src/infrastructure/adapters/secondary/providers/openai-compatible.adapter.ts` (nuevo): usa el SDK `openai` con `baseURL` y `apiKey` configurables; `validateConnection()` y `listModels()` via `client.models.list()`. Si la URL no esta configurada -> el adaptador no se construye (status `unconfigured` en el registry).
8. `packages/backend/src/infrastructure/adapters/secondary/providers/provider-registry.ts` (nuevo): lee `settings` y construye el adaptador pedido on-demand. Devuelve `null` para `"openai-compatible"` si la URL base no esta configurada (-> `unconfigured`).
9. `packages/backend/src/infrastructure/config/env.ts` (modificar): anadir `OLLAMA_BASE_URL` con default `http://localhost:11434`.
10. `packages/backend/package.json` (modificar): anadir dep `openai`.

### Fase 4 - Backend casos de uso

11. `application/use-cases/provider/list-providers.use-case.ts` (nuevo) - devuelve `[{ id, status: "unknown" }]`.
12. `application/use-cases/provider/validate-provider-connection.use-case.ts` (nuevo) - obtiene adaptador, maneja `null` -> `unconfigured`, captura timeout -> `unavailable`.
13. `application/use-cases/provider/list-provider-models.use-case.ts` (nuevo) - obtiene adaptador, llama `listModels()`, maneja errores.
14. `application/use-cases/provider/get-default-provider.use-case.ts` (nuevo) - lee `default_provider` y `default_model` de `SettingsRepository`.
15. `application/use-cases/provider/configure-default-provider.use-case.ts` (nuevo) - valida `providerId` registrado; si `force !== true`, valida conexion y rechaza si falla; persiste las dos settings.

### Fase 5 - Backend tests

16. Test Vitest por cada caso de uso (5 archivos) con puertos mockeados: `list-providers.test.ts`, `validate-provider-connection.test.ts`, `list-provider-models.test.ts`, `get-default-provider.test.ts`, `configure-default-provider.test.ts`. Cubrir: flujo principal + al menos un flujo alternativo (p. ej. `unconfigured`, `unavailable`, `force: true`).

### Fase 6 - Backend controllers + container

17. `infrastructure/adapters/primary/routes/provider.routes.ts` (nuevo): `GET /api/providers`, `GET /api/providers/:id/status`, `GET /api/providers/:id/models`. Validacion Zod de `:id` (enum `["ollama","openai-compatible"]`).
18. `infrastructure/adapters/primary/routes/settings.routes.ts` (nuevo): `GET /api/settings/default-provider`, `PUT /api/settings/default-provider` con validacion Zod de body (`provider` enum, `model` string no vacio, `force` opcional boolean).
19. `infrastructure/adapters/primary/middlewares/error-handler.ts` (modificar): mapear `ProviderError` -> 502, `ProviderTimeoutError` -> 504, sintomas `ProviderUnavailable` (este va como 502 con code `PROVIDER_CONNECTION_FAILED`).
20. `containers/app-container.ts` (modificar): instanciar `DrizzleSettingsRepository`, `ProviderRegistryImpl`, los 5 casos de uso nuevos, exponerlos en el container.
21. `infrastructure/adapters/primary/server.ts` (modificar): montar `/api/providers` y `/api/settings/default-provider`.

### Fase 7 - Frontend

22. Anadir los componentes shadcn (todos) con `pnpm dlx shadcn@latest add ...` desde `packages/ui/`.
23. `packages/frontend/src/lib/api/client.ts` (nuevo): wrapper de `fetch` con baseURL `http://localhost:3001`, headers JSON, y parseo uniforme de errores (`{ error: { code, message } }`).
24. `packages/frontend/src/lib/api/providers.ts` (nuevo): `listProviders()`, `validateProvider(id)`, `listModels(id)`.
25. `packages/frontend/src/lib/api/settings.ts` (nuevo): `getDefaultProvider()`, `configureDefaultProvider({ provider, model, force? })`, `getOpenAICompatibleConfig()`, `setOpenAICompatibleConfig({ url, apiKey })`.
26. `packages/frontend/src/components/provider/provider-manager.tsx` (nuevo): componente React principal con `client:load`. Layout: lista de proveedores con su estado, panel de detalle del seleccionado (URL/API key para openai-compat, selector de modelo o input manual, boton "Verificar", boton "Guardar como predeterminado"). Maneja loading con `Spinner`/`Skeleton`, errores con `Alert`/`sonner`.
27. `packages/frontend/src/pages/settings/providers.astro` (nuevo): pagina Astro que importa `globals.css` + layout base + embebe el `<ProviderManager client:load />`.
28. `packages/frontend/src/layouts/base.astro` (nuevo o reusar `main.astro`): wrapper para todas las paginas con `<html>`, head y `<slot />`. Reusare `main.astro` y le cambiare el titulo dinamico.

### Fase 8 - Verificacion

29. `pnpm install` (por `openai`).
30. No se necesita migracion nueva (la tabla `settings` ya existe). Confirmo con `pnpm --filter @workspace/backend db:generate` que no hay cambios.
31. Arrancar backend y verificar con `curl`:
    - `GET /api/providers` -> `[{ id: "ollama" }, { id: "openai-compatible" }]`
    - `GET /api/providers/ollama/status` -> `{ status: "available" }` si hay Ollama corriendo, sino `unavailable`
    - `GET /api/providers/ollama/models` -> lista de modelos locales
    - `GET /api/settings/default-provider` -> `{ provider: null, model: null }` (sin configurar)
    - `PUT /api/settings/default-provider` con body -> 200 y persiste
32. Arrancar frontend y verificar que `/settings/providers` carga el ProviderManager, lista proveedores, permite verificar/guardar.
33. `pnpm typecheck`, `pnpm lint`, `pnpm --filter @workspace/backend test` (5 tests nuevos).

### Fase 9 - Commit

34. Commit `S1: Configurar proveedor por defecto`.

## Estado de avance (actualizar conforme se completa)

| Paso | Estado | Notas |
|---|---|---|
| 1. Tipos compartidos | pendiente | |
| 2. domain/ports/provider.port.ts | pendiente | |
| 3. domain/ports/settings.repository.ts | pendiente | |
| 4. error-handler ProviderError/ProviderTimeoutError | pendiente | |
| 5. DrizzleSettingsRepository | pendiente | |
| 6. OllamaAdapter | pendiente | |
| 7. OpenAICompatibleAdapter | pendiente | |
| 8. ProviderRegistry | pendiente | |
| 9. env.ts OLLAMA_BASE_URL | pendiente | |
| 10. backend package.json openai | pendiente | |
| 11. list-providers use case | pendiente | |
| 12. validate-provider-connection use case | pendiente | |
| 13. list-provider-models use case | pendiente | |
| 14. get-default-provider use case | pendiente | |
| 15. configure-default-provider use case | pendiente | |
| 16. Tests Vitest (5) | pendiente | |
| 17. provider.routes.ts | pendiente | |
| 18. settings.routes.ts | pendiente | |
| 19. error-handler mapeo HTTP | pendiente | |
| 20. app-container | pendiente | |
| 21. server.ts mount | pendiente | |
| 22. shadcn add (12 componentes) | pendiente | |
| 23. frontend lib/api/client.ts | pendiente | |
| 24. frontend lib/api/providers.ts | pendiente | |
| 25. frontend lib/api/settings.ts | pendiente | |
| 26. components/provider/provider-manager.tsx | pendiente | |
| 27. pages/settings/providers.astro | pendiente | |
| 28. layout base | pendiente | |
| 29. pnpm install | pendiente | |
| 30. verificar migracion sin cambios | pendiente | |
| 31. curl endpoints | pendiente | |
| 32. verificar frontend | pendiente | |
| 33. typecheck/lint/test | pendiente | |
| 34. commit S1 | pendiente | |

## Notas adicionales

- Astro MCP: se usara si surge alguna duda concreta sobre SSR/islands integrando React con Astro.
- shadcn skill: ya cargada. Se consultara en el momento para los patrones exactos.
- CORS: ya configurado en `server.ts` para `http://localhost:4321`.
- Env var `PROVIDER_TIMEOUT_MS` (default 120s) ya en S0 - se usa para los timeouts de fetch del adaptador Ollama y del cliente openai.
