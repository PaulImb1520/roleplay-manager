import type { CharacterVersion } from "../../../../domain/entities/character-version.entity"
import type { Message } from "../../../../domain/entities/message.entity"
import type { PromptContextBuilder } from "../../../../domain/ports/prompt-context-builder"
import type { PromptContext } from "../../../../domain/value-objects/prompt-context"

export class PromptContextBuilderImpl implements PromptContextBuilder {
  async build(params: {
    characterVersion: CharacterVersion
    messages: Message[]
    recentMessageCount: number
  }): Promise<PromptContext> {
    const { characterVersion: cv, messages, recentMessageCount } = params

    const systemParts: string[] = [
      `Eres ${cv.name}. ${cv.description}`,
      "",
      `## Personalidad`,
      `Nombre: ${cv.name}`,
    ]

    if (cv.subtitle) {
      systemParts.push(`Subtítulo: ${cv.subtitle}`)
    }

    if (cv.instructions) {
      systemParts.push("")
      systemParts.push(`## Instrucciones`)
      systemParts.push(cv.instructions)
    }

    const activeCards = cv.cards
      .filter((c) => c.active)
      .sort((a, b) => a.position - b.position)

    if (activeCards.length > 0) {
      systemParts.push("")
      systemParts.push("## Conocimiento")
      systemParts.push(
        "Las siguientes fichas están ordenadas por importancia (la primera es la más relevante). Úsalas para guiar tus respuestas según el contexto."
      )
      for (const card of activeCards) {
        systemParts.push(`[${card.title}]: ${card.content}`)
      }
    }

    systemParts.push("")
    systemParts.push(`## Estilo de respuesta`)
    systemParts.push(
      `Debes responder siempre en el tono y estilo de ${cv.name}, manteniendo la personalidad descrita arriba. Escribe de forma narrativa y detallada, como si estuvieras interpretando al personaje en una historia.`
    )
    systemParts.push("")
    systemParts.push(`Ejemplo del estilo de ${cv.name}:`)
    systemParts.push(`"${cv.greeting}"`)

    const systemPrompt = systemParts.join("\n")

    const recentMessages = messages.slice(-recentMessageCount)

    const contextMessages = recentMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))

    return {
      systemPrompt,
      messages: contextMessages,
    }
  }
}
