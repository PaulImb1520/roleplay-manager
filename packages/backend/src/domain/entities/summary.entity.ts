export interface SummaryProps {
  id: string
  conversationId: string
  content: string
  firstMessageId: string
  lastMessageId: string
  model: string | null
  provider: string | null
  createdAt: Date
  editedAt: Date | null
}

export class Summary {
  private constructor(private readonly props: SummaryProps) {}

  static create(props: SummaryProps): Summary {
    if (!props.content.trim()) throw new Error("Summary content is required")
    return new Summary(props)
  }

  static reconstruct(props: SummaryProps): Summary {
    return new Summary(props)
  }

  get id(): string { return this.props.id }
  get conversationId(): string { return this.props.conversationId }
  get content(): string { return this.props.content }
  get firstMessageId(): string { return this.props.firstMessageId }
  get lastMessageId(): string { return this.props.lastMessageId }
  get model(): string | null { return this.props.model }
  get provider(): string | null { return this.props.provider }
  get createdAt(): Date { return this.props.createdAt }
  get editedAt(): Date | null { return this.props.editedAt }

  withContent(content: string): Summary {
    if (!content.trim()) throw new Error("Summary content is required")
    return new Summary({
      ...this.props,
      content,
      editedAt: new Date(),
    })
  }
}
