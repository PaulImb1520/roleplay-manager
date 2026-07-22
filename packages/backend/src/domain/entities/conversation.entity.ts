import type { ConversationStatus } from "@workspace/shared/types/conversation"

export type MemoryProposalMode = "auto" | "manual"

export interface ConversationProps {
  id: string
  versionId: string
  title: string | null
  status: ConversationStatus
  model: string | null
  provider: string | null
  providerInstanceId: string | null
  recentMessageCount: number
  summaryFrequency: number
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  stopSequences: string[]
  memoryProposalMode: MemoryProposalMode
  createdAt: Date
  updatedAt: Date
}

export class Conversation {
  private constructor(private readonly props: ConversationProps) {}

  static create(props: ConversationProps): Conversation {
    return new Conversation(props)
  }

  get id(): string { return this.props.id }
  get versionId(): string { return this.props.versionId }
  get title(): string | null { return this.props.title }
  get status(): ConversationStatus { return this.props.status }
  get model(): string | null { return this.props.model }
  get provider(): string | null { return this.props.provider }
  get providerInstanceId(): string | null { return this.props.providerInstanceId }
  get recentMessageCount(): number { return this.props.recentMessageCount }
  get summaryFrequency(): number { return this.props.summaryFrequency }
  get temperature(): number { return this.props.temperature }
  get maxTokens(): number { return this.props.maxTokens }
  get topP(): number { return this.props.topP }
  get frequencyPenalty(): number { return this.props.frequencyPenalty }
  get presencePenalty(): number { return this.props.presencePenalty }
  get stopSequences(): string[] { return this.props.stopSequences }
  get memoryProposalMode(): MemoryProposalMode { return this.props.memoryProposalMode }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }

  archive(): Conversation {
    if (this.props.status === "archived") {
      return this
    }
    return new Conversation({ ...this.props, status: "archived", updatedAt: new Date() })
  }

  unarchive(): Conversation {
    if (this.props.status === "active") {
      return this
    }
    return new Conversation({ ...this.props, status: "active", updatedAt: new Date() })
  }

  withMemoryProposalMode(mode: MemoryProposalMode): Conversation {
    if (this.props.memoryProposalMode === mode) return this
    return new Conversation({ ...this.props, memoryProposalMode: mode, updatedAt: new Date() })
  }
}
