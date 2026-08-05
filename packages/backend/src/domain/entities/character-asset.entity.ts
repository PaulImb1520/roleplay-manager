export interface CharacterAssetProps {
  id: string
  characterId: string
  mimeType: string
  sizeBytes: number
  extension: string
  createdAt: Date
}

export class CharacterAsset {
  private constructor(private readonly props: CharacterAssetProps) {}

  static create(props: CharacterAssetProps): CharacterAsset {
    return new CharacterAsset(props)
  }

  static reconstruct(props: CharacterAssetProps): CharacterAsset {
    return new CharacterAsset(props)
  }

  get id(): string { return this.props.id }
  get characterId(): string { return this.props.characterId }
  get mimeType(): string { return this.props.mimeType }
  get sizeBytes(): number { return this.props.sizeBytes }
  get extension(): string { return this.props.extension }
  get createdAt(): Date { return this.props.createdAt }

  get filePath(): string {
    return `${this.id}.${this.extension}`
  }
}
