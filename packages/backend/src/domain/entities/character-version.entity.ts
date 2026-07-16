import type { CharacterCard } from "./character-card.entity"

export interface CharacterVersionProps {
  id: string
  characterId: string
  name: string
  subtitle: string | null
  profileImage: string
  description: string
  instructions: string | null
  greeting: string
  versionNumber: number
  createdAt: Date
  cards: CharacterCard[]
}

export class CharacterVersion {
  private constructor(private readonly props: CharacterVersionProps) {}

  static create(props: CharacterVersionProps): CharacterVersion {
    if (!props.name.trim()) throw new Error("Version name is required")
    if (!props.profileImage.trim()) throw new Error("Profile image is required")
    if (!props.description.trim()) throw new Error("Description is required")
    if (!props.greeting.trim()) throw new Error("Greeting is required")
    if (props.cards.some((c) => !c.title.trim() || !c.content.trim())) {
      throw new Error("Cards must have non-empty title and content")
    }
    return new CharacterVersion(props)
  }

  get id(): string { return this.props.id }
  get characterId(): string { return this.props.characterId }
  get name(): string { return this.props.name }
  get subtitle(): string | null { return this.props.subtitle }
  get profileImage(): string { return this.props.profileImage }
  get description(): string { return this.props.description }
  get instructions(): string | null { return this.props.instructions }
  get greeting(): string { return this.props.greeting }
  get versionNumber(): number { return this.props.versionNumber }
  get createdAt(): Date { return this.props.createdAt }
  get cards(): CharacterCard[] { return this.props.cards }
}
