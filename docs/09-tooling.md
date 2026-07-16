# 09 - Tooling

# Decisiones de tooling

## Propósito

Este documento recoge las decisiones transversales de tooling que se aplican a todo el monorepo. Su objetivo es fijar, **antes de empezar S0**, las elecciones que de otro modo quedarían dispersas en el código o en los mensajes de commit.

El documento se actualizará cada vez que se cierre una decisión de infraestructura o se incorpore una nueva. Las decisiones aquí recogidas son la fuente de verdad para el slice S0 y los siguientes.

---

## Resumen ejecutivo

| Decisión | Elección | Confirmada en |
|---|---|---|
| Runner de tests | **Vitest** | S0 |
| Estrategia de migraciones en producción | **`db:migrate` al arrancar el servidor** | S0 |
| Librería de logging | **pino + pino-http + pino-pretty** | S0 |
| Cliente del OpenAI-compatible | **`openai` SDK con `baseURL` configurable** | S1 / S4 |

Las dos primeras (runner de tests, migraciones) son elecciones cerradas. Las dos últimas (logging, OpenAI-compatible) requieren justificación detallada que se desarrolla en las secciones siguientes.

---

## Vitest como runner de tests

**Elección:** Vitest.

**Por qué:**

* Se integra nativamente con Vite, que ya es el motor de bundling del frontend Astro. Misma config, mismo HMR, misma resolución de módulos.
* API similar a Jest (`describe`, `it`, `expect`, `vi.mock`), lo que reduce la fricción si el equipo conoce Jest.
* Soporte de TypeScript de fábrica, sin necesidad de `ts-jest` ni `babel-jest`.
* Ejecución de tests en entorno ESM nativo, alineado con el resto del monorepo (`"type": "module"` en todos los paquetes).
* Watch mode rápido: re-ejecuta solo los tests afectados.
* Ecosistema de mocks robusto (`vi.mock`, `vi.fn`, `vi.spyOn`), suficiente para mockear los puertos del dominio.

**Configuración por paquete:**

* `packages/backend` incluye `vitest.config.ts` con `environment: 'node'` y `globals: false` (imports explícitos de `describe`/`it`/`expect` para mantener la coherencia con el resto del código).
* `packages/shared` no requiere tests en S0, pero la config se puede añadir si surgen tipos complejos que justifiquen tests unitarios.
* `packages/frontend` y `packages/ui` pueden incluir `vitest.config.ts` con `environment: 'jsdom'` cuando se introduzcan tests de componentes en S4 o S9.

**Cobertura mínima esperada:**

* Cada caso de uso tiene al menos un test que cubre el flujo principal con los puertos mockeados (parte de la DoD de slice).
* Los adaptadores secundarios (repositorios Drizzle, adaptadores de proveedor) tienen tests de integración que usan SQLite en memoria o un mock HTTP (`msw`).
* El dominio no requiere tests dedicados salvo invariantes no triviales en entidades; las invariantes quedan implícitamente cubiertas por los tests de los casos de uso.

**Dependencias a añadir en S0:**

```jsonc
// packages/backend/package.json (devDependencies)
{
  "vitest": "^x",
  "@vitest/coverage-v8": "^x"  // opcional, para reporter de cobertura
}
```

---

## Migraciones en producción: `db:migrate` al arrancar

**Elección:** el servidor aplica migraciones pendientes automáticamente al arrancar y aborta el inicio si alguna falla.

**Por qué:**

* Coherente con el principio de *Offline First*: el sistema debe ser autoinstalable y autoiniciable sin intervención manual.
* Reduce la fricción de despliegue: el usuario no necesita recordar ejecutar `pnpm db:migrate` después de actualizar el proyecto.
* Si una migración falla, abortar es más seguro que continuar con un esquema a medias, ya que las queries de los casos de uso fallarían en tiempo de ejecución con errores crípticos.
* Las migraciones Drizzle son idempotentes gracias a la tabla interna `__drizzle_migrations` que Drizzle Kit mantiene. Re-ejecutar el paso de migración al arrancar no rompe nada si no hay cambios pendientes.

**Flujo en producción vs desarrollo:**

* **Desarrollo:** se permite `db:push` (`pnpm --filter backend db:push`) para iterar rápido sobre el esquema sin generar archivos de migración. El flujo de migración con `db:generate` + `db:migrate` se usa cuando el cambio es estable y va a commitearse.
* **Producción:** `db:push` está deshabilitado (no se incluye en el script de producción). El servidor aplica las migraciones al arrancar. Si falla, el proceso sale con código no-cero.

**Tareas en `turbo.json` (a añadir durante S0):**

```jsonc
{
  "db:generate": {
    "cache": false,
    "inputs": ["src/**", "drizzle.config.ts"]
  },
  "db:migrate": {
    "cache": false
  },
  "db:push": {
    "cache": false
  }
}
```

**Comportamiento esperado al arrancar:**

1. El servidor lee la ruta de la base de datos desde `DATABASE_PATH` (con default `./data/roleplay.db`).
2. Aplica las migraciones pendientes usando `drizzle-orm/better-sqlite3/migrator`.
3. Si la aplicación tiene éxito, arranca Express.
4. Si falla, registra el error con `pino` a nivel `error` y termina el proceso con código `1`.

---

## Estrategia de logging

### Qué significa "estrategia de logging"

Una estrategia de logging define **cómo la aplicación registra eventos**: qué librería se usa, qué formato, qué nivel de severidad, qué información se incluye, dónde se persisten los logs, y — críticamente — **qué no se registra nunca**. En una aplicación hexagonal es además importante que el logging no se filtre al dominio: el dominio emite "eventos de log" a través de un puerto, y la infraestructura decide cómo serializarlos.

En esta aplicación la estrategia de logging es especialmente relevante porque:

* El principio de transparencia exige que sepamos en todo momento qué hizo el sistema.
* El dominio y los casos de uso necesitan trazar errores sin acoplarse a una librería concreta.
* El frontend no debe ver contenido de la conversación en los logs (privacidad).
* Los errores de proveedor deben ser diagnosticables a partir de los logs (qué proveedor, qué modelo, qué duración, qué falló).

### Elección: pino + pino-http + pino-pretty

| Pieza | Rol |
|---|---|
| `pino` | Logger base: serialización JSON rápida, child loggers, niveles estándar. |
| `pino-http` | Middleware Express que registra cada request HTTP con método, URL, status, duración y `requestId`. |
| `pino-pretty` | Pretty-printer solo en desarrollo; en producción se omite para mantener JSON puro. |

**Por qué pino y no `console.log` o `winston`:**

* `console.log` no permite niveles ni child loggers; imposible propagar un `requestId` a lo largo de una request.
* `winston` es más lento y su API es más verbosa; pino está optimizado para producción.
* pino es la elección más extendida en el ecosistema Node.js actual para backends con Express.

### Puerto `Logger` en el dominio

El dominio no conoce pino. Define un contrato mínimo:

```typescript
// packages/backend/src/domain/ports/logger.port.ts
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]: unknown;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  child(bindings: LogContext): Logger;
}
```

El método `child` es esencial: permite crear un logger con bindings fijos (p. ej. `requestId`, `conversationId`) que se propagan a cada llamada de log sin repetirlos manualmente.

### Adaptador `PinoLogger`

```typescript
// packages/backend/src/infrastructure/adapters/secondary/logger/pino-logger.adapter.ts
import pino, { type Logger as PinoLoggerType } from "pino";
import type { Logger, LogContext, LogLevel } from
  "../../../domain/ports/logger.port";

export class PinoLogger implements Logger {
  constructor(private readonly logger: PinoLoggerType) {}

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    this.logger[level](context ?? {}, error ?? "", message);
  }

  debug(message: string, context?: LogContext) { this.log("debug", message, context); }
  info (message: string, context?: LogContext) { this.log("info",  message, context); }
  warn (message: string, context?: LogContext) { this.log("warn",  message, context); }
  error(message: string, error?: Error, context?: LogContext) {
    this.log("error", message, context, error);
  }
  child(bindings: LogContext): Logger {
    return new PinoLogger(this.logger.child(bindings));
  }
}
```

El adaptador vive en infraestructura. El dominio y los casos de uso reciben `Logger` por inyección desde el contenedor de DI.

### Qué se registra

| Origen | Nivel | Contexto típico |
|---|---|---|
| Arranque / parada del servidor | `info` | `port`, `env`, `dbPath` |
| Cada request HTTP | `info` | `requestId`, `method`, `url`, `status`, `durationMs` |
| Entrada y salida de un caso de uso | `info` | `requestId`, `useCase`, `conversationId?`, `durationMs` |
| Llamada al proveedor de IA | `info` | `requestId`, `provider`, `model`, `operation`, `durationMs` |
| Error de proveedor | `warn` o `error` | `provider`, `model`, `statusCode`, `errorCode` |
| Violación de regla de dominio | `warn` | `errorCode`, `conversationId?` |
| Error no controlado | `error` | stack trace completo |
| Query Drizzle lenta o fallida | `warn` / `error` | `query`, `durationMs`, `errorCode` |

### Qué **no** se registra

* Contenido de mensajes del usuario o del asistente.
* Contenido de memorias dinámicas.
* Contenido de propuestas de memoria.
* Contenido de resúmenes.
* Claves de API de proveedores remotos.
* URLs de proveedores que contengan tokens en el path.
* Contraseñas o tokens de sesión.

Esta prohibición es parte de la DoD de cualquier slice que toque logs: el contenido narrativo y las credenciales no deben aparecer nunca en stdout, en archivos de log, ni en errores serializados.

### Formato y destino

* **Desarrollo:** JSON pretty-printed a stdout vía `pino-pretty`. El desarrollador ve los logs legibles en la terminal.
* **Producción:** JSON a stdout sin pretty-printer. El proceso de despliegue puede redirigir stdout a un archivo, a un servicio de logs externo, o a `journalctl` según el entorno.

**Configuración por entorno:**

```typescript
// packages/backend/src/infrastructure/config/logger.config.ts
import pino from "pino";

export const buildLogger = () => {
  if (process.env.NODE_ENV === "production") {
    return pino({ level: process.env.LOG_LEVEL ?? "info" });
  }
  return pino({
    level: process.env.LOG_LEVEL ?? "debug",
    transport: { target: "pino-pretty", options: { colorize: true } },
  });
};
```

### Nivel de log configurable

El nivel de log se controla por **variable de entorno** `LOG_LEVEL` (`debug`, `info`, `warn`, `error`). No se persiste en `settings` en v1.0: la idea es que durante el desarrollo el desarrollador suba el nivel, y en producción el operador lo configure mediante el entorno de despliegue.

En el futuro podría añadirse una clave en la tabla `settings` para permitir al usuario cambiar el nivel sin reiniciar, pero no es prioritario para v1.0.

### `requestId` por petición

Cada request HTTP recibe un `requestId` único generado por `pino-http`. El middleware de errores y los casos de uso reciben un `Logger` "hijo" con el `requestId` ya vinculado, de modo que cualquier log emitido durante el procesamiento de la request lleva el mismo identificador.

Esto permite correlación simple en desarrollo: un único `requestId` agrupa todos los logs de un slice concreto de actividad.

### Dependencias a añadir en S0

```jsonc
// packages/backend/package.json (dependencies)
{
  "pino": "^x",
  "pino-http": "^x",
  "pino-pretty": "^x"  // devDependency
}
```

---

## OpenAICompatibleAdapter: cliente y estrategia de traducción

### Qué es y por qué necesita atención especial

El `OpenAICompatibleAdapter` es el adaptador secundario que se conecta a **cualquier proveedor de inferencia que exponga la API de Chat Completions de OpenAI**. Ejemplos: OpenAI, Azure OpenAI, LM Studio, vLLM, Text Generation WebUI, Ollama (vía su endpoint compatible), Together AI, Groq, OpenRouter, etc.

Todos estos proveedores **se anuncian como compatibles con OpenAI**, pero la realidad es que cada uno introduce pequeñas diferencias:

* Algunos exponen `GET /v1/models` (OpenAI, Groq) y otros no (LM Studio por defecto, ciertos proxies).
* Algunos requieren API key, otros no (LM Studio local).
* Algunos soportan streaming, otros no.
* Los formatos de mensaje y los nombres de los parámetros pueden variar sutilmente.
* Las URLs base son heterogéneas: `https://api.openai.com/v1`, `http://localhost:1234/v1`, `http://ollama:11434/v1`, etc.
* Los códigos de error difieren: 401 de uno puede significar credenciales inválidas; 401 de otro puede ser rate limit.

Por eso la estrategia de implementación del adaptador es **progresiva y documentada** según el slice, no monolítica.

### Decisión de cliente: SDK oficial `openai` con `baseURL` configurable

**Por qué no escribir un cliente HTTP propio:**

* El SDK oficial está mantenido por OpenAI, cubre edge cases (reconnect, streaming incremental, JSON streaming parsing), y tiene tipos TypeScript sólidos.
* Reutilizar el SDK para todos los proveedores compatibles reduce la superficie de bugs.
* Permite cambiar de proveedor modificando solo `baseURL` y `apiKey`.

**Configuración base del SDK:**

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: settings.baseUrl,    // ej. "https://api.openai.com/v1"
  apiKey: settings.apiKey ?? "not-required",
  timeout: providerTimeoutMs,   // ver 07-technical-architecture.md
});
```

El timeout se aplica a nivel de cliente para que la request no quede colgada indefinidamente. Si se supera, el SDK lanza un error que el adaptador traduce a `ProviderTimeoutError`.

### Decisiones de comportamiento en v1.0

**1. `listModels`: degradación elegante**

```
GET {baseUrl}/models
├── 200 OK           → devolver lista de modelos
├── 404 / 501 / 5xx  → devolver [] con manualEntryRequired: true
└── 401 / 403        → error PROVIDER_CONNECTION_FAILED
```

Cuando el proveedor no soporta el endpoint de modelos, **nunca se falla en silencio**: el caso de uso `ListProviderModels` recibe una lista vacía con un flag explícito, y el frontend muestra un campo para que el usuario introduzca el identificador manualmente.

**2. `validateConnection`**

```
GET {baseUrl}/models
├── 200 OK           → available
├── 401 / 403        → unavailable (credenciales)
├── timeout          → unavailable (timeout)
└── otros 4xx / 5xx  → unavailable
```

**3. `generate` y `generateStreaming`**

Request body enviado al proveedor:

```json
{
  "model": "<modelId>",
  "messages": [
    { "role": "system", "content": "<contexto completo del PromptContext serializado>" },
    { "role": "user", "content": "<último mensaje del usuario>" }
  ],
  "temperature": 0.7,
  "max_tokens": 2048,
  "top_p": 0.9,
  "frequency_penalty": 0,
  "presence_penalty": 0,
  "stop": [],
  "stream": true   // o false para generate()
}
```

**Estrategia de traducción del `PromptContext` para v1.0:**

* Una única entrada de sistema con la concatenación del contexto completo (definición del personaje, tarjetas, resumen, memorias, instrucciones) en orden de prioridad.
* Los mensajes recientes (`recentMessageCount`) como entradas alternas `user` / `assistant` después del system message.
* El último mensaje del usuario es siempre la última entrada `user`.

Esta estrategia es la más simple y la más compatible con todos los proveedores OpenAI-compatible. Estrategias más elaboradas (múltiples system messages, separación de instrucciones por sección, etc.) se reservan para versiones futuras.

**4. Mapeo de errores**

| Situación | Error del dominio |
|---|---|
| Red caída, DNS, ECONNREFUSED | `PROVIDER_CONNECTION_FAILED` |
| HTTP 401 / 403 | `PROVIDER_CONNECTION_FAILED` (credenciales o acceso) |
| HTTP 404 | `PROVIDER_MODEL_NOT_FOUND` |
| HTTP 429 | `PROVIDER_GENERATION_FAILED` (rate limit; el usuario reintentará) |
| HTTP 5xx | `PROVIDER_GENERATION_FAILED` |
| Timeout del cliente | `PROVIDER_TIMEOUT` |
| Respuesta malformada | `PROVIDER_GENERATION_FAILED` |

**Nunca** se intenta reintento automático: en v1.0 el usuario decide cuándo reintentar (ver `06-provider-architecture.md` y `07-technical-architecture.md`).

### Evolución por slice

* **S1** (configuración): nivel mínimo viable.
  * Acepta `baseURL` y `apiKey` opcional.
  * Implementa `listModels` con la degradación elegante descrita.
  * Implementa `validateConnection`.
  * No implementa `generate` ni `generateStreaming` aún.
* **S4** (envío de mensaje): primer uso real de generación.
  * Implementa `generate` y `generateStreaming` usando el SDK `openai` con `baseURL`.
  * Mapeo de errores completo.
  * Timeout configurable desde `settings.provider_timeout_ms`.
  * El `OllamaAdapter` y el `OpenAICompatibleAdapter` quedan en paridad de funcionalidad.
* **S9** (pulido): particularidades por proveedor.
  * Detección automática de Azure OpenAI vs OpenAI estándar.
  * Documentación de quirks conocidos por proveedor en el README.
  * Si la demanda lo justifica, perfiles por proveedor (`provider_profiles` en `settings`).

### Limitaciones documentadas en v1.0

* **No se soportan extensiones propietarias** (function calling específico, tools, vision). Solo el contrato mínimo de Chat Completions.
* **No se valida el formato de salida** del modelo más allá del primer `choice.message.content`. Las propuestas de memoria y los resúmenes se extraen mediante instrucciones en el system prompt, no mediante structured outputs.
* **Las URLs base con paths no estándar** (p. ej. proxies con prefijo `/api/v1`) deben ser configuradas por el usuario tal cual; el adaptador no las normaliza más allá de asegurar trailing slash y prefijo `http(s)://`.

### Configuración persistida

El adaptador persiste su configuración en la tabla `settings`:

| Clave | Contenido | Notas |
|---|---|---|
| `provider_openai_compatible_url` | URL base (p. ej. `http://localhost:1234/v1`) | obligatoria |
| `provider_openai_compatible_api_key` | API key | opcional |

Estas claves **nunca** se exponen en el endpoint `GET /api/providers/:id/status` ni en los logs. La `apiKey` se enmascara al mostrarla en la UI.

### Dependencias a añadir en S1

```jsonc
// packages/backend/package.json (dependencies)
{
  "openai": "^x"
}
```

---

## Cómo usar este documento

* Antes de empezar S0, leer la sección **Vitest** y la de **migraciones** para confirmar que el setup es el esperado.
* La sección de **logging** se implementa durante S0 junto con el esqueleto del backend.
* La sección de **OpenAI-compatible** se lee antes de empezar S1 y S4.
* Si durante un slice surge una nueva decisión transversal de tooling, añadirla aquí en el mismo PR.

---

## Decisiones diferidas (no son bloqueantes para S0)

* **Logging a archivo vs solo stdout.** En v1.0 el default es stdout. En una iteración futura podría ofrecerse un archivo de log rotativo (`pino-roll` o similar) para diagnóstico offline.
* **Telemetría de uso (peticiones por minuto, latencia p50/p95, etc.).** Fuera del alcance de v1.0. La estructura de logs actual (JSON con `durationMs` por operación) ya permite calcular estas métricas a posteriori.
* **Perfiles de inferencia preconfigurados por proveedor** (p. ej. "creative" vs "precise" para OpenAI). Fuera del alcance de v1.0, mencionado como evolución futura.
* **Trazabilidad distribuida (OpenTelemetry).** No se introduce en v1.0. Si en el futuro se añaden componentes remotos, podría reconsiderarse.