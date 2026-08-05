import type { CharacterCard } from "./character-card.entity"

export interface CharacterVersionProps {
  id: string
  characterId: string
  name: string
  subtitle: string | null
  profileImageAssetId?: string | null
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
    if (!props.description.trim()) throw new Error("Description is required")
    if (!props.greeting.trim()) throw new Error("Greeting is required")
    if (props.cards.some((c) => !c.title.trim() || !c.content.trim())) {
      throw new Error("Cards must have non-empty title and content")
    }
    return new CharacterVersion({
      ...props,
      profileImageAssetId: props.profileImageAssetId ?? null,
    })
  }

  get id(): string { return this.props.id }
  get characterId(): string { return this.props.characterId }
  get name(): string { return this.props.name }
  get subtitle(): string | null { return this.props.subtitle }
  get profileImageAssetId(): string | null { return this.props.profileImageAssetId ?? null }
  get description(): string { return this.props.description }
  get instructions(): string | null { return this.props.instructions }
  get greeting(): string { return this.props.greeting }
  get versionNumber(): number { return this.props.versionNumber }
  get createdAt(): Date { return this.props.createdAt }
  get cards(): CharacterCard[] { return this.props.cards }
}
