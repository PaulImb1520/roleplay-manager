import type {
  CharacterDetail,
  CharacterSummary,
  CreateCharacterInput,
  UpdateCharacterInput,
} from "@workspace/shared/types/character"

import { apiRequest } from "./client"

export const listCharacters = (): Promise<CharacterSummary[]> =>
  apiRequest("/api/characters")

export const getCharacter = (id: string): Promise<CharacterDetail> =>
  apiRequest(`/api/characters/${id}`)

export const createCharacter = (input: CreateCharacterInput): Promise<CharacterDetail> =>
  apiRequest("/api/characters", {
    method: "POST",
    body: JSON.stringify(input),
  })

export const updateCharacter = (
  id: string,
  input: UpdateCharacterInput,
): Promise<CharacterDetail> =>
  apiRequest(`/api/characters/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })

export const deleteCharacter = (id: string): Promise<void> =>
  apiRequest(`/api/characters/${id}`, { method: "DELETE" })

export const listCharacterVersions = (id: string): Promise<CharacterDetail["versions"]> =>
  apiRequest(`/api/characters/${id}/versions`)
