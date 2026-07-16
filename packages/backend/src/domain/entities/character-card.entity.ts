export interface CharacterCardProps {
  id: string
  versionId: string
  title: string
  content: string
  position: number
  active: boolean
}

export class CharacterCard {
  private constructor(private readonly props: CharacterCardProps) {}

  static create(props: CharacterCardProps): CharacterCard {
    if (!props.title.trim()) throw new Error("Card title is required")
    if (!props.content.trim()) throw new Error("Card content is required")
    return new CharacterCard(props)
  }

  get id(): string { return this.props.id }
  get versionId(): string { return this.props.versionId }
  get title(): string { return this.props.title }
  get content(): string { return this.props.content }
  get position(): number { return this.props.position }
  get active(): boolean { return this.props.active }
}
