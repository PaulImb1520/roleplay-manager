import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import type { MessageRepository } from "../../../domain/ports/message.repository"
import type { ProviderRegistry } from "../../../domain/ports/provider.port"
import type { GetDefaultProviderUseCase } from "../provider/get-default-provider.use-case"
import type { ProviderInstanceRepository } from "../../../domain/ports/provider-instance.repository"
import type { Logger } from "../../../domain/ports/logger.port"
import {
  ConversationNotFoundError,
  ConversationArchivedError,
} from "../../../infrastructure/adapters/primary/middlewares/error-handler"
import type { PromptContext } from "../../../domain/value-objects/prompt-context"

export class GenerateConversationTitleUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly characterRepository: CharacterRepository,
    private readonly providerRegistry: ProviderRegistry,
    private readonly getDefaultProvider: GetDefaultProviderUseCase,
    private readonly providerInstanceRepository: ProviderInstanceRepository,
    private readonly logger: Logger,
  ) {}

  async execute(conversationId: string): Promise<{ title: string }> {
    const conv = await this.conversationRepository.findById(conversationId)
    if (!conv) {
      throw new ConversationNotFoundError(conversationId)
    }
    if (conv.status === "archived") {
      throw new ConversationArchivedError(conversationId)
    }

    const version = await this.characterRepository.findVersionById(conv.versionId)
    if (!version) {
      throw new Error(`Character version '${conv.versionId}' not found.`)
    }

    const messages = await this.messageRepository.findByConversationId(conversationId)
    if (messages.length === 0) {
      throw new Error("Cannot generate title: conversation has no messages.")
    }

    let providerId = conv.provider
    let providerInstanceId = conv.providerInstanceId
    let resolvedModel = conv.model
    if (!providerId) {
      const defaultConfig = await this.getDefaultProvider.execute()
      providerId = defaultConfig.provider
      providerInstanceId = defaultConfig.providerInstanceId
      resolvedModel ??= defaultConfig.model
    }

    let adapter = null
    if (providerInstanceId) {
      const instance = await this.providerInstanceRepository.findById(providerInstanceId)
      if (instance) {
        adapter = this.providerRegistry.createAdapter(instance)
      }
    }
    if (!adapter && providerId) {
      adapter = await this.providerRegistry.getAdapter(providerId as any)
    }
    if (!adapter) {
      throw new Error(`No provider available for conversation '${conversationId}'.`)
    }

    const transcript = messages
      .map((m) => `[${m.role === "user" ? "Usuario" : version.name}]: ${m.content}`)
      .join("\n\n")

    const context: PromptContext = {
      systemPrompt: [
        "Eres un asistente que genera títulos cortos y descriptivos para conversaciones de roleplay.",
        "## Instrucciones",
        "- Genera ÚNICAMENTE el título, sin explicaciones ni formato adicional.",
        "- El título debe tener entre 3 y 8 palabras, en español.",
        "- Debe capturar la esencia de la conversación.",
        "- NO uses puntuación al final.",
        "- NO uses comillas alrededor del título.",
      ].join("\n"),
      messages: [
        {
          role: "user",
          content: `Genera un título corto para esta conversación:\n\n${transcript}`,
        },
      ],
    }

    const model = resolvedModel ?? undefined
    let fullContent = ""

    try {
      for await (const chunk of adapter.generateStreaming(context, {
        model,
        temperature: 0.7,
        maxTokens: 50,
      })) {
        if (chunk.content) {
          fullContent += chunk.content
        }
      }
    } catch (err) {
      this.logger.error("Failed to generate conversation title", err as Error)
      throw new Error("Failed to generate title.")
    }

    const title = fullContent.trim()
    if (!title) {
      throw new Error("Generated title is empty.")
    }

    const updated = conv.withTitle(title, "auto")
    await this.conversationRepository.update(updated)

    return { title }
  }
}
