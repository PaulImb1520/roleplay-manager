# Casos de Uso

## Propósito

Los casos de uso describen el comportamiento del sistema desde la perspectiva del dominio.

Cada caso de uso representa una única acción que el sistema es capaz de realizar para cumplir un objetivo de negocio. Su propósito consiste en definir las reglas, responsabilidades y consecuencias de cada operación independientemente de la tecnología utilizada para implementarla.

Los casos de uso no describen interfaces de usuario, rutas HTTP, componentes visuales ni detalles de implementación. Dichos aspectos pertenecen a otras capas de la arquitectura.

---

## Filosofía

Los casos de uso representan la capa de aplicación del sistema.

Su responsabilidad consiste en coordinar las entidades del dominio para cumplir un objetivo específico respetando todas las reglas de negocio previamente definidas.

Cada caso de uso debe responder únicamente a una pregunta:

> **¿Qué quiere conseguir el usuario o el propio sistema?**

No debe responder cómo se implementa internamente dicha operación.

---

## Estructura

Todos los casos de uso deberán seguir la misma estructura para mantener una documentación consistente.

```markdown
# Nombre del caso de uso

## Objetivo

## Motivación

## Actores

## Entidades involucradas

## Precondiciones

## Flujo principal

## Flujos alternativos

## Reglas de negocio

## Cambios en el dominio

## Postcondiciones

## Casos de uso relacionados

## Futuras extensiones
```

---

## Tipos de casos de uso

El sistema distingue dos tipos de casos de uso.

### Casos de uso iniciados por el usuario

Son acciones iniciadas directamente desde la interfaz.

Ejemplos:

* CreateCharacter
* UpdateCharacter
* DeleteCharacter
* CreateConversation
* SendMessage
* RegenerateReply
* EditMessage
* RewindConversation
* ArchiveConversation
* UpdateConversationSettings
* ApplyMemoryChanges

### Casos de uso iniciados por el sistema

Son procesos internos ejecutados automáticamente para mantener el funcionamiento del sistema.

Ejemplos:

* CreateCharacterVersion
* BuildPromptContext
* GenerateCharacterResponse
* GenerateSummary
* ProposeMemoryChanges
* GenerateConversationTitle

Estos casos de uso no poseen una interfaz propia y normalmente son invocados desde otros casos de uso.

---

## Principios

Todos los casos de uso deberán respetar los siguientes principios:

* Cada caso de uso tiene una única responsabilidad.
* Cada caso de uso representa un objetivo completo del negocio.
* Las reglas de negocio pertenecen al dominio, no a la interfaz.
* El usuario mantiene siempre el control sobre las decisiones importantes del sistema.
* La implementación debe poder cambiar sin modificar la definición del caso de uso.
* Los casos de uso deben ser independientes de frameworks, bases de datos y proveedores de IA.

---

## Relación con la arquitectura

Los casos de uso constituyen la capa de aplicación dentro de la arquitectura hexagonal.

Cada uno podrá implementarse como un servicio independiente que coordine las entidades del dominio y los puertos necesarios para completar su objetivo.

La documentación aquí definida representa el contrato funcional que deberá respetar cualquier implementación futura.
