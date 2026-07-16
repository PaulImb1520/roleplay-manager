export interface CharacterSummary {
  id: string
  name: string
  subtitle: string | null
  profileImage: string
  versionNumber: number
  createdAt: string
  updatedAt: string
}

export interface CharacterDetail {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  currentVersion: CharacterVersionDTO
  versions: CharacterVersionDTO[]
}

export interface CharacterVersionDTO {
  id: string
  characterId: string
  name: string
  subtitle: string | null
  profileImage: string
  description: string
  instructions: string | null
  greeting: string
  versionNumber: number
  createdAt: string
  cards: CharacterCardDTO[]
}

export interface CharacterCardDTO {
  id: string
  versionId: string
  title: string
  content: string
  position: number
  active: boolean
}

export interface CreateCharacterInput {
  name: string
  subtitle?: string | null
  profileImage: string
  description: string
  instructions?: string | null
  greeting: string
  cards?: CreateCardInput[]
}

export interface CreateCardInput {
  title: string
  content: string
  active?: boolean
}

export interface UpdateCharacterInput {
  name?: string
  subtitle?: string | null
  profileImage?: string
  description?: string
  instructions?: string | null
  greeting?: string
  cards?: UpdateCardInput[]
}

export interface UpdateCardInput {
  id?: string
  title: string
  content: string
  position: number
  active?: boolean
}
