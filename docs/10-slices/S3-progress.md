# S3 — Send + Receive Message (completado)

**Estado:** completado en commits anteriores.

## Objetivo
Implementar el caso de uso `SendMessage` con generación de respuesta vía SSE, incluyendo:
- Validación de conversación activa.
- Creación del mensaje del usuario.
- Construcción del contexto con `PromptContextBuilder`.
- Streaming de la respuesta del asistente.
- Persistencia del mensaje del asistente.
- Manejo de errores (proveedor no disponible, error de streaming).

## Decisiones clave
- `SendMessageUseCase` no acepta automáticamente alternatives previas (se añade en S5).
- `Message.create` requiere `alternativesCursor` (añadido en S5).
- `toMessageDTO` incluye `alternativesCursor` (añadido en S5).

## Archivos creados
- `application/use-cases/conversation/send-message.use-case.ts`
- Tests en `send-message.use-case.test.ts`
- PromptContextBuilder + impl
- Provider adapter + registry

## Pendientes (cubiertos en S5)
- Aceptar alternatives del último assistant al enviar nuevo mensaje.
- Incluir `alternativesCursor` en constructor de Message.
