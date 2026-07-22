export interface MessageProps {
  id: string
  conversationId: string
  role: "user" | "assistant"
  content: string
  position: number
  alternatives: string[]
  alternativesCursor: number
  createdAt: Date
  editedAt: Date | null
}

export class Message {
  private constructor(private readonly props: MessageProps) {}

  static create(props: MessageProps): Message {
    if (!props.content.trim()) throw new Error("Message content is required")
    if (!["user", "assistant"].includes(props.role)) throw new Error("Invalid role")
    return new Message(props)
  }

  get id(): string { return this.props.id }
  get conversationId(): string { return this.props.conversationId }
  get role(): "user" | "assistant" { return this.props.role }
  get content(): string { return this.displayContent }
  get position(): number { return this.props.position }
  get alternatives(): string[] { return this.props.alternatives }
  get alternativesCursor(): number { return this.props.alternativesCursor }
  get createdAt(): Date { return this.props.createdAt }
  get editedAt(): Date | null { return this.props.editedAt }

  get totalVersions(): number {
    return 1 + this.props.alternatives.length
  }

  get currentAlternativeIndex(): number {
    return this.props.alternativesCursor
  }

  private get displayContent(): string {
    if (this.props.alternativesCursor === 0) return this.props.content
    return this.props.alternatives[this.props.alternativesCursor - 1]
  }

  cyclePrev(): Message {
    if (this.props.alternativesCursor >= this.props.alternatives.length) return this
    return new Message({
      ...this.props,
      alternativesCursor: this.props.alternativesCursor + 1,
    })
  }

  cycleNext(): Message {
    if (this.props.alternativesCursor <= 0) return this
    return new Message({
      ...this.props,
      alternativesCursor: this.props.alternativesCursor - 1,
    })
  }

  regenerate(newContent: string): Message {
    return new Message({
      ...this.props,
      alternatives: [this.content, ...this.props.alternatives],
      content: newContent,
      alternativesCursor: 0,
      editedAt: null,
    })
  }

  accept(): Message {
    return new Message({
      ...this.props,
      content: this.content,
      alternatives: [],
      alternativesCursor: 0,
    })
  }

  withContent(newContent: string): Message {
    const accepted = this.accept()
    return new Message({
      ...accepted.props,
      content: newContent,
      editedAt: new Date(),
    })
  }
}
