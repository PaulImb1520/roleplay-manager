import { v7 as randomUUIDv7 } from "uuid"

import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import type { MemoryRepository } from "../../../domain/ports/memory.repository"
import type { MemoryChangeProposalRepository } from "../../../domain/ports/memory-change-proposal.repository"
import type { ProviderRegistry } from "../../../domain/ports/provider.port"
import type { ProviderInstanceRepository } from "../../../domain/ports/provider-instance.repository"
import type { GetDefaultProviderUseCase } from "../provider/get-default-provider.use-case"
import type { Logger } from "../../../domain/ports/logger.port"
import type { ProviderId } from "@workspace/shared/types/provider"
import type { DefaultProviderConfig } from "@workspace/shared/types/provider"
import type { PromptContext } from "../../../domain/value-objects/prompt-context"
import { MemoryChangeProposal } from "../../../domain/entities/memory-change-proposal.entity"
import type { Memory } from "../../../domain/entities/memory.entity"
import type { Message } from "../../../domain/entities/message.entity"
import type { Conversation } from "../../../domain/entities/conversation.entity"
import type { ProviderPort } from "../../../domain/ports/provider.port"
import type {
  MemoryChangeProposalDTO,
} from "@workspace/shared/types/memory-change-proposal"
import { ConversationNotFoundError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"

export interface ProposeMemoryChangesInput {
  conversationId: string
}

interface RawProposal {
  operation: "CREATE" | "UPDATE" | "DELETE"
  targetMemoryId?: string
  actor: string
  title: string
  description: string
  priority?: number
  reason?: string
}

export class ProposeMemoryChangesUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly characterRepository: CharacterRepository,
    private readonly memoryRepository: MemoryRepository,
    private readonly memoryChangeProposalRepository: MemoryChangeProposalRepository,
    private readonly providerRegistry: ProviderRegistry,
    private readonly providerInstanceRepository: ProviderInstanceRepository,
    private readonly getDefaultProvider: GetDefaultProviderUseCase,
    private readonly logger: Logger,
  ) {}

  async execute(input: ProposeMemoryChangesInput): Promise<MemoryChangeProposalDTO[]> {
    const conversation = await this.conversationRepository.findById(input.conversationId)
    if (!conversation) {
      throw new ConversationNotFoundError(input.conversationId)
    }

    const version = await this.characterRepository.findVersionById(conversation.versionId)
    if (!version) {
      return []
    }

    const messages = await this.conversationRepository.findByIdWithMessages(input.conversationId)
    if (!messages) {
      return []
    }

    const memories = await this.memoryRepository.findByConversationId(input.conversationId)

    const recentMessages = messages.messages.slice(-3)

    const subPrompt = this.buildSubPrompt(version.name, version.description, version.instructions, memories, recentMessages)
    const providerAdapter = await this.resolveProvider(conversation)
    if (!providerAdapter) {
      this.logger.warn("No provider available for memory proposals", { conversationId: input.conversationId })
      return []
    }

    const fullResponse = await this.callLlm(providerAdapter, subPrompt, conversation)
    if (!fullResponse) {
      return []
    }

    const rawProposals = this.parseProposals(fullResponse)
    if (rawProposals.length === 0) {
      return []
    }

    const now = new Date()
    const proposals: MemoryChangeProposal[] = []

    for (const raw of rawProposals) {
      try {
        const proposal = MemoryChangeProposal.create({
          id: randomUUIDv7(),
          conversationId: input.conversationId,
          operation: raw.operation || "CREATE",
          targetMemoryId: raw.targetMemoryId ?? null,
          actor: raw.actor || version.name,
          title: raw.title || "Untitled",
          description: raw.description || "",
          priority: raw.priority ?? 5,
          reason: raw.reason ?? null,
          status: "pending",
          createdAt: now,
          processedAt: null,
          processedBy: "user",
        })
        proposals.push(proposal)
      } catch {
        this.logger.warn("Skipping invalid memory proposal from LLM")
      }
    }

    if (proposals.length > 0) {
      await this.memoryChangeProposalRepository.createMany(proposals)
    }

    return proposals.map(toProposalDTO)
  }

  private buildSubPrompt(
    name: string,
    description: string,
    instructions: string | null,
    memories: Memory[],
    recentMessages: Message[],
  ): PromptContext {
    const parts: string[] = [
      `Eres un asistente de gestión de memoria dinámica para el personaje "${name}". ${description}`,
      "",
      "## Instrucción",
      "Analiza el último intercambio de la conversación y determina si hay hechos nuevos relevantes que deban almacenarse en la memoria dinámica.",
    ]

    if (instructions) {
      parts.push("")
      parts.push(`## Contexto del personaje`)
      parts.push(instructions)
    }

    if (memories.length > 0) {
      parts.push("")
      parts.push("## Memorias activas actuales")
      for (const mem of memories) {
        parts.push(`- [${mem.id}] ${mem.actor} → ${mem.title}: ${mem.description} (prioridad ${mem.priority})`)
      }
    }

    parts.push("")
    parts.push("## Formato de respuesta")
    parts.push("Si hay cambios que proponer, responde ÚNICAMENTE con un bloque JSON delimitado. NO incluyas ningún otro texto:")
    parts.push("")
    parts.push("```memory_proposals")
    parts.push("[")
    parts.push('  { "operation": "CREATE", "actor": "Alice", "title": "Ubicación", "description": "Está en la biblioteca.", "priority": 5, "reason": "Nuevo hecho revelado en la conversación." }')
    parts.push("]")
    parts.push("```")
    parts.push("")
    parts.push("Operaciones: CREATE (nuevo hecho), UPDATE (modificar existente, requiere targetMemoryId), DELETE (eliminar existente, requiere targetMemoryId).")
    parts.push("Prioridad: 1 (baja) a 10 (alta).")
    parts.push("Si no hay cambios que proponer, responde únicamente: ```memory_proposals []```")

    const systemPrompt = parts.join("\n")

    const contextMessages = recentMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))

    return { systemPrompt, messages: contextMessages }
  }

  private async resolveProvider(conversation: Conversation) {
    let providerId = conversation.provider as ProviderId | null
    let providerInstanceId = conversation.providerInstanceId

    if (!providerId) {
      const defaultConfig: DefaultProviderConfig =
        await this.getDefaultProvider.execute()
      providerId = defaultConfig.provider
      providerInstanceId = defaultConfig.providerInstanceId
    }
    if (!providerId) return null

    let adapter = null
    if (providerInstanceId) {
      const instance = await this.providerInstanceRepository.findById(providerInstanceId)
      if (instance) adapter = this.providerRegistry.createAdapter(instance)
    }
    if (!adapter) adapter = await this.providerRegistry.getAdapter(providerId)
    return adapter
  }

  private async callLlm(
    adapter: ProviderPort,
    context: PromptContext,
    conversation: Conversation,
  ): Promise<string | null> {
    try {
      let fullContent = ""
      for await (const chunk of adapter.generateStreaming(context, {
        model: conversation.model ?? undefined,
        temperature: 0.3,
        maxTokens: 1024,
      })) {
        fullContent += chunk.content
      }
      return fullContent
    } catch (error) {
      this.logger.error("Memory proposal LLM call failed", error as Error, {
        conversationId: conversation.id,
      })
      return null
    }
  }

  private parseProposals(fullResponse: string): RawProposal[] {
    const match = fullResponse.match(/```memory_proposals\s*([\s\S]*?)```/)
    if (!match) return []

    try {
      const parsed = JSON.parse(match[1].trim())
      if (!Array.isArray(parsed)) return []
      return parsed.filter((p: unknown) => {
        if (!p || typeof p !== "object") return false
        const r = p as Record<string, unknown>
        return typeof r.operation === "string" && ["CREATE", "UPDATE", "DELETE"].includes(r.operation) && typeof r.actor === "string" && typeof r.title === "string"
      }).map((p: Record<string, unknown>) => ({
        operation: p.operation as "CREATE" | "UPDATE" | "DELETE",
        targetMemoryId: p.targetMemoryId as string | undefined,
        actor: String(p.actor ?? ""),
        title: String(p.title ?? ""),
        description: String(p.description ?? ""),
        priority: typeof p.priority === "number" ? p.priority : 5,
        reason: p.reason as string | undefined,
      }))
    } catch {
      return []
    }
  }
}

function toProposalDTO(p: MemoryChangeProposal): MemoryChangeProposalDTO {
  return {
    id: p.id,
    conversationId: p.conversationId,
    operation: p.operation,
    targetMemoryId: p.targetMemoryId,
    actor: p.actor,
    title: p.title,
    description: p.description,
    priority: p.priority,
    reason: p.reason,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    processedAt: p.processedAt?.toISOString() ?? null,
    processedBy: p.processedBy,
  }
}
