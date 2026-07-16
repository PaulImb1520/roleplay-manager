export interface CharacterProps {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export class Character {
  private constructor(private readonly props: CharacterProps) {}

  static create(props: CharacterProps): Character {
    if (!props.name.trim()) throw new Error("Character name is required")
    return new Character(props)
  }

  get id(): string { return this.props.id }
  get name(): string { return this.props.name }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }

  withName(name: string): Character {
    if (!name.trim()) throw new Error("Character name is required")
    return new Character({ ...this.props, name, updatedAt: new Date() })
  }
}
