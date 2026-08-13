# Image Assets: Optimización y entrega de imágenes

## Objetivo

Optimizar la carga y entrega de imágenes utilizadas por Roleplay Manager sin modificar la arquitectura actual de almacenamiento basada en archivos.

Actualmente existen dos puntos principales donde se muestran imágenes:

1. Imágenes de perfil en la lista de personajes.
2. Imagen de perfil del personaje dentro del encabezado de una conversación.

El objetivo es evitar que el navegador cargue imágenes excesivamente grandes para el tamaño real en el que serán mostradas, especialmente pensando en el futuro acceso remoto desde dispositivos móviles.

---

## Problema

Actualmente los componentes del frontend consumen directamente una URL asociada a un asset.

En la lista de personajes, la imagen se presenta ocupando una parte considerable de cada tarjeta:

```tsx
{imageSrc ? (
  <>
    <div className="absolute inset-0 z-30 aspect-video" />
    <img
      src={imageSrc}
      alt={`${character.name} avatar`}
      className="relative z-20 aspect-video w-full object-cover"
    />
  </>
)}
```

Esta imagen tiene un tamaño visual considerable y, dependiendo de la resolución original del asset, podría estar descargándose una cantidad de información mucho mayor de la necesaria.

En el encabezado del chat, en cambio, el avatar se muestra en un espacio muy pequeño:

```tsx
<header className="flex items-center gap-3 border-b px-4 py-3">
  <a
    href={`/characters/${conv.characterId}`}
    className="block size-8 overflow-hidden rounded-full bg-muted transition-shadow hover:ring-2 hover:ring-primary/50"
    aria-label={`Ir a la definición de ${conv.characterName}`}
  >
    {conv.profileImageAssetId ? (
      <img
        src={getCharacterAssetUrl(
          conv.characterId,
          conv.profileImageAssetId
        )}
        alt={`${conv.characterName} avatar`}
        className="size-full object-cover"
      />
    ) : null}
  </a>
</header>
```

En este caso, descargar una imagen de cientos o miles de píxeles para renderizarla aproximadamente a `32 × 32px` supone un desperdicio de transferencia, decodificación y memoria.

Este problema se vuelve especialmente relevante si en el futuro la aplicación se utiliza mediante un túnel desde un teléfono.

---

## Motivación

El hecho de que Roleplay Manager funcione localmente no elimina los costes asociados a las imágenes.

Cuando la aplicación se ejecuta directamente en la computadora, el navegador debe:

1. Leer/recibir el archivo.
2. Descargarlo desde el servidor local.
3. Decodificarlo.
4. Mantener la imagen en memoria.
5. Renderizarla.

Si el cliente es un teléfono conectado remotamente:

```text
Computer
   │
   │ Image
   ▼
Internet
   │
   ▼
Phone
```

el tamaño del recurso también afecta directamente al ancho de banda y al tiempo necesario para mostrarlo.

Las imágenes responsivas permiten proporcionar varias versiones de un mismo recurso para que el navegador seleccione la más apropiada según el espacio disponible y la densidad de pantalla.

---

# Planteamiento de la solución

La solución no consiste en cambiar el sistema actual de almacenamiento.

Los assets continuarán almacenándose como archivos y la base de datos continuará almacenando únicamente referencias a dichos assets.

La modificación consiste en introducir el concepto de **variantes de un asset**.

En lugar de considerar que un asset tiene únicamente:

```text
Character
   │
   └── profile.webp
```

el sistema podrá generar diferentes representaciones:

```text
Character
   │
   └── Profile Image
          │
          ├── thumbnail
          ├── small
          ├── medium
          └── large
```

Todas las variantes representan la misma imagen original, pero están optimizadas para diferentes contextos de presentación.

---

# Principios

## 1. El asset original y sus variantes son conceptos diferentes

El asset representa la imagen proporcionada por el usuario.

Las variantes representan versiones derivadas optimizadas para su consumo.

El dominio no debe depender de las rutas físicas de los archivos.

---

## 2. El frontend no debe asumir el tamaño original

Los componentes de React no deberían recibir simplemente:

```text
URL de imagen original
```

como única posibilidad.

En su lugar, el sistema debe poder proporcionar información suficiente para seleccionar una variante apropiada.

---

## 3. El tamaño visual determina el tamaño apropiado del recurso

Una imagen que se muestra a `32 × 32px` no debería necesitar la misma representación que una imagen que ocupa `600 × 400px`.

El objetivo no es reducir todas las imágenes a un tamaño arbitrario, sino proporcionar recursos adecuados para los diferentes contextos.

---

## 4. El almacenamiento continúa siendo local

No se introducirá ningún servicio externo de almacenamiento.

La solución debe funcionar completamente con el almacenamiento de archivos existente.

---

# Variantes propuestas

Los tamaños exactos podrán ajustarse después de medir el uso real de la aplicación.

Como punto de partida:

| Variante    | Uso principal           | Tamaño aproximado |
| ----------- | ----------------------- | ----------------: |
| `thumbnail` | Avatares pequeños       |             128px |
| `small`     | Cards pequeñas / móvil  |         320–480px |
| `medium`    | Cards principales       |         640–768px |
| `large`     | Visualizaciones grandes |           1280px+ |

Los valores anteriores representan objetivos de resolución y no necesariamente dimensiones exactas que deban utilizarse en todos los casos.

La resolución final debe considerar también la densidad de píxeles del dispositivo.

---

# Formato

Las variantes optimizadas deberían utilizar un formato moderno apropiado para imágenes web.

WebP puede utilizarse como formato inicial debido a su amplio soporte y capacidad de compresión.

El sistema debe mantener la posibilidad de introducir otros formatos en el futuro sin modificar el modelo de dominio.

---

# Procesamiento de imágenes

Cuando un usuario agregue o sustituya una imagen:

```text
Usuario
   │
   ▼
Upload Asset
   │
   ▼
Validación
   │
   ▼
Procesamiento
   │
   ├── thumbnail
   ├── small
   ├── medium
   └── large
   │
   ▼
Persistencia
```

El procesamiento deberá:

* validar el formato recibido;
* validar las dimensiones;
* generar las variantes necesarias;
* preservar la relación de aspecto;
* evitar generar imágenes innecesariamente grandes;
* registrar las variantes disponibles.

Una biblioteca de procesamiento como Sharp puede utilizarse en el backend para esta tarea. Sharp permite trabajar con redimensionado y generación de formatos como WebP.

---

# API de assets

El backend deberá proporcionar una forma de solicitar el asset en función de su propósito.

En lugar de depender exclusivamente de:

```text
getCharacterAssetUrl(characterId, assetId)
```

se podrá evolucionar hacia una API conceptual como:

```text
getCharacterAssetUrl(
  characterId,
  assetId,
  variant
)
```

Por ejemplo:

```text
getCharacterAssetUrl(
  characterId,
  profileImageAssetId,
  "thumbnail"
)
```

o:

```text
getCharacterAssetUrl(
  characterId,
  profileImageAssetId,
  "medium"
)
```

La implementación concreta de las URLs continúa siendo responsabilidad de la infraestructura.

---

# Lista de personajes

## Contexto

La lista presenta múltiples personajes mediante un grid de cards.

Cada card utiliza una imagen relativamente grande.

Por este motivo, no debería utilizarse la variante de avatar más pequeña.

El componente debería utilizar una variante apropiada para el tamaño de la card.

---

## Estrategia

La imagen deberá:

* utilizar una variante de tamaño apropiado;
* especificar sus dimensiones;
* utilizar `object-cover` para conservar el comportamiento visual actual;
* utilizar `loading="lazy"` cuando la imagen se encuentre fuera del viewport.

El navegador puede utilizar `srcset` y `sizes` para seleccionar entre diferentes recursos cuando existan múltiples variantes. Esta estrategia permite evitar que dispositivos pequeños descarguen una imagen mucho mayor de lo necesario.

Conceptualmente:

```tsx
<img
  src={mediumImage}
  srcSet={`
    ${smallImage} 480w,
    ${mediumImage} 768w,
    ${largeImage} 1280w
  `}
  sizes="..."
  width={...}
  height={...}
  loading="lazy"
  decoding="async"
  alt={`${character.name} avatar`}
/>
```

El valor de `sizes` deberá corresponder al layout real del grid.

No se debe copiar este ejemplo literalmente hasta conocer las dimensiones definitivas del componente.

---

# Avatar del chat

## Contexto

El avatar del personaje aparece dentro de un contenedor:

```text
32 × 32px
```

y se presenta circularmente mediante:

```text
rounded-full
```

En este contexto no tiene sentido descargar una imagen de gran resolución.

---

## Estrategia

El avatar deberá utilizar una variante pequeña específicamente preparada para este propósito.

Por ejemplo:

```tsx
<img
  src={thumbnailImage}
  width={32}
  height={32}
  decoding="async"
  alt={`${conv.characterName} avatar`}
  className="size-full object-cover"
/>
```

No es necesario utilizar `loading="lazy"` si el avatar forma parte del contenido visible inmediatamente al abrir la conversación.

Las recomendaciones actuales de rendimiento web indican que las imágenes fuera del viewport son buenas candidatas para `loading="lazy"`, mientras que las imágenes importantes que aparecen inmediatamente no deberían retrasarse innecesariamente.

---

# Dimensiones explícitas

Siempre que sea posible, los elementos `<img>` deberán conocer sus dimensiones intrínsecas.

Esto permite al navegador reservar el espacio correspondiente antes de que la imagen termine de cargar y evita cambios innecesarios del layout.

Por lo tanto, los componentes deberán evitar depender únicamente de:

```tsx
className="size-full"
```

cuando el sistema pueda conocer las dimensiones de la variante.

---

# Responsabilidad de cada capa

## Dominio

El dominio únicamente debe conocer que existe un asset de imagen.

No debe conocer:

* rutas del sistema de archivos;
* extensiones;
* WebP;
* tamaños físicos;
* nombres de carpetas;
* URLs HTTP.

---

## Aplicación

La capa de aplicación puede solicitar una representación concreta del asset.

Ejemplo conceptual:

```text
GetCharacterImage(
  characterId,
  assetId,
  usage = "card"
)
```

La aplicación puede determinar qué tipo de recurso necesita el caso de uso.

---

## Infraestructura

La infraestructura será responsable de:

* localizar el archivo;
* localizar las variantes;
* generar variantes cuando corresponda;
* construir URLs;
* servir los archivos;
* administrar el almacenamiento físico.

---

## Frontend

El frontend será responsable de:

* seleccionar el componente visual apropiado;
* proporcionar `alt`;
* indicar dimensiones;
* utilizar `loading` según el contexto;
* utilizar `srcset` y `sizes` cuando existan múltiples variantes;
* mantener el diseño visual existente.

---

# Evolución de `ImageStorage`

El sistema actual ya dispone de almacenamiento de imágenes mediante archivos.

No debe reemplazarse.

En su lugar, deberá evolucionar para contemplar variantes.

Conceptualmente:

```text
ImageStorage
    │
    ├── save()
    ├── delete()
    ├── get()
    ├── exists()
    │
    └── getVariant()
```

Una posible implementación sería:

```text
LocalImageStorage
```

que gestione:

```text
assets/
└── characters/
    └── {characterId}/
        └── {assetId}/
            ├── original
            ├── thumbnail.webp
            ├── small.webp
            ├── medium.webp
            └── large.webp
```

La estructura física exacta queda fuera del dominio.

---

# Compatibilidad con el sistema actual

Ahora mismo el sistema no tiene usuarios reales, por lo que no hay que preocuparse por hacer este cambio retrocompatible.

---

# Cache del navegador

El servidor de assets deberá permitir que el navegador reutilice imágenes que ya haya descargado cuando sea seguro hacerlo.

Las variantes generadas son especialmente apropiadas para cachearse porque su contenido no debería cambiar mientras representen la misma versión del asset.

Cuando un usuario sustituya una imagen, deberá generarse un nuevo identificador o mecanismo de versionado (configuraciones locales) para evitar que el navegador continúe utilizando una versión antigua.

---

# Acceso remoto futuro

Esta optimización será especialmente importante cuando Roleplay Manager pueda utilizarse desde dispositivos externos. O exportar las imágenes desde el dispositivo actual hacia otros.

Por ejemplo:

```text
PC
│
├── Express
├── ImageStorage
└── Local AI
      │
      ▼
 Cloudflare Tunnel
      │
      ▼
   Internet
      │
      ▼
   📱 Phone
```

En este escenario, enviar una imagen de escritorio completa a un teléfono puede desperdiciar ancho de banda.

Las variantes responsivas permiten que el navegador seleccione una representación más adecuada para su viewport. Servir imágenes de escritorio a dispositivos móviles puede utilizar varias veces más datos de los necesarios, según el tamaño relativo de la imagen y el dispositivo.

---

# Qué NO hacer

No se debe:

* almacenar imágenes directamente en la base de datos;
* obligar al frontend a utilizar siempre el archivo original;
* generar una variante diferente para cada componente;
* utilizar `loading="lazy"` indiscriminadamente;
* utilizar `fetchpriority="high"` para todas las imágenes;
* depender exclusivamente de CSS para reducir una imagen grande;
* asumir que el tamaño visual de una imagen determina automáticamente el tamaño de archivo descargado.

El CSS:

```css
width: 32px;
height: 32px;
```

no convierte mágicamente una imagen de 4000×4000 en una imagen pequeña.

La optimización debe producir un recurso apropiado antes de que el navegador lo descargue.

---

# Criterios de aceptación

## Assets

* [ ] Los assets continúan almacenándose fuera de la base de datos.
* [ ] Los assets pueden tener múltiples variantes.
* [ ] Las variantes mantienen una referencia al asset original.
* [ ] Las variantes se generan automáticamente para nuevos uploads.

## Lista de personajes

* [ ] Las cards no descargan innecesariamente la imagen original de máxima resolución.
* [ ] Se utiliza una variante apropiada para el tamaño de la card.
* [ ] Las imágenes fuera del viewport pueden cargarse mediante lazy loading.
* [ ] El navegador puede seleccionar una variante apropiada mediante `srcset`/`sizes` cuando corresponda.

## Avatar del chat

* [ ] El avatar utiliza una variante pequeña.
* [ ] El avatar no descarga innecesariamente una imagen de gran resolución.
* [ ] El avatar conoce sus dimensiones.
* [ ] No se aplica lazy loading si forma parte del contenido visible inmediatamente.

## Arquitectura

* [ ] El dominio no conoce rutas físicas de imágenes.
* [ ] El almacenamiento de imágenes continúa siendo una responsabilidad de infraestructura.
* [ ] La generación de variantes está encapsulada.
* [ ] El frontend no necesita conocer dónde se almacenan físicamente los archivos.

## Acceso remoto

* [ ] La solución permite servir variantes optimizadas cuando el cliente está conectado remotamente.
* [ ] El sistema no depende de que el cliente tenga acceso directo al sistema de archivos local.

---

# Fuera del alcance

Esta funcionalidad no incluye por ahora:

* almacenamiento en la nube;
* CDN externo;
* generación de imágenes mediante IA;
* edición avanzada de imágenes;
* compresión manual por parte del usuario;
* gestión de galerías;
* imágenes dentro de mensajes;
* generación de thumbnails para todos los tipos de asset posibles;
* procesamiento bajo demanda mediante un servicio externo.

---

# Futuras extensiones

La arquitectura deberá permitir posteriormente:

* generación de variantes bajo demanda;
* eliminación automática de variantes obsoletas;
* AVIF u otros formatos;
* procesamiento de imágenes de fondo;
* selección de recorte inteligente;
* placeholders de baja resolución;
* cache HTTP avanzada;
* generación de variantes adaptadas específicamente para dispositivos móviles;
* almacenamiento remoto opcional;
* sincronización de assets entre instalaciones.

---

# Resumen

Roleplay Manager ya utiliza almacenamiento de imágenes basado en archivos, por lo que no es necesario modificar este principio.

La optimización debe construirse encima del sistema existente:

```text
              Asset original
                    │
                    ▼
             Image Processor
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    thumbnail     medium      large
        │           │           │
        └───────────┼───────────┘
                    ▼
              ImageStorage
                    │
                    ▼
                 Frontend
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
    Character Card       Chat Avatar
       medium             thumbnail
```

El objetivo no es complicar el sistema de imágenes, sino **hacer que cada componente descargue una representación razonable del recurso que realmente necesita**.

Esta decisión también prepara el proyecto para el acceso remoto futuro sin obligar a rediseñar posteriormente el almacenamiento de assets.
