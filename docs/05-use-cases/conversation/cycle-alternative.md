# Cycle Alternative

## Objetivo

Permitir al usuario navegar entre las versiones alternativas de un mensaje del asistente generadas mediante regeneraciones sucesivas, mostrando el contenido correspondiente a cada versión sin modificar el estado persistido de la conversación.

---

## Motivación

Cuando el usuario solicita regenerar una respuesta del asistente en múltiples ocasiones, cada versión anterior se conserva en el historial de regeneraciones del mensaje.

El caso de uso CycleAlternative permite al usuario navegar visualmente entre estas versiones usando flechas de navegación (anterior/siguiente), con un indicador que muestra la posición actual (ej. "2/3").

La navegación no altera el flujo de la conversación: la versión mostrada se consolida como canónica únicamente cuando el usuario envía un nuevo mensaje o pulsa "Continuar".

---

## Actores

### Actor principal

- Usuario.

### Actores secundarios

- Sistema.

---

## Entidades involucradas

- Message

---

## Precondiciones

- La conversación debe existir.
- La conversación no debe estar archivada.
- El mensaje debe existir.
- El mensaje debe tener al menos una alternativa en su historial.
- Para navegar "atrás": debe haber una alternativa anterior disponible.
- Para navegar "adelante": no debe estar ya en la versión más reciente.

---

## Flujo principal

1. El usuario pulsa el botón de flecha izquierda (anterior) o derecha (siguiente) sobre un mensaje del asistente.

2. El sistema actualiza el cursor de alternativas del mensaje:

   - **Anterior**: incrementa el cursor si no está en la última alternativa disponible.
   - **Siguiente**: decrementa el cursor si no está en la primera posición (versión más reciente).

3. El sistema persiste el cambio en la base de datos.

4. La interfaz muestra el contenido de la versión seleccionada.

5. El indicador de posición se actualiza (ej. "1/3", "2/3", "3/3").

---

## Flujos alternativos

### Sin alternativas disponibles

Si el mensaje no tiene historial de regeneraciones, los botones de navegación no se muestran.

---

### Límite alcanzado

Si el usuario intenta navegar más allá del límite disponible, el botón correspondiente se muestra deshabilitado.

---

## Reglas de negocio

- La navegación entre alternativas no modifica el contenido canónico del mensaje.
- La versión mostrada se consolida como canónica cuando el usuario envía un nuevo mensaje o pulsa "Continuar" (mediante `Message.accept()`).
- El cursor de alternativas se persiste en la base de datos para mantener la posición entre recargas de página.
- Al editar un mensaje con `EditMessage`, las alternativas existentes se conservan pero el cursor se reinicia a 0.

---

## Cambios en el dominio

- Se actualiza `alternativesCursor` del mensaje.
- El contenido de `content` (derivado de `displayContent`) cambia para reflejar la alternativa seleccionada.

---

## Casos de uso relacionados

- RegenerateReply (crea las alternativas que este caso de uso navega).
- SendMessage (consolida la alternativa mostrada como canónica).
- ContinueConversation (consolida la alternativa mostrada como canónica).
