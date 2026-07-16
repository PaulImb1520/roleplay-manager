export interface MessageProps {
  id: string
  conversationId: string
  role: "user" | "assistant"
  content: string
  position: number
  alternatives: string[]
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
  get content(): string { return this.props.content }
  get position(): number { return this.props.position }
  get alternatives(): string[] { return this.props.alternatives }
  get createdAt(): Date { return this.props.createdAt }
  get editedAt(): Date | null { return this.props.editedAt }
}
