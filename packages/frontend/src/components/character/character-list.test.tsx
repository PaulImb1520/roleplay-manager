import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

import type { CharacterSummary } from "@workspace/shared/types/character"
import type { ConversationSummary } from "@workspace/shared/types/conversation"

import { CharacterList } from "./character-list"

const characters: CharacterSummary[] = [
  {
    id: "char-1",
    name: "Lyra",
    subtitle: null,
    profileImageAssetId: null,
    versionNumber: 2,
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-07-08T10:00:00.000Z",
  },
  {
    id: "char-2",
    name: "Kael",
    subtitle: null,
    profileImageAssetId: null,
    versionNumber: 1,
    createdAt: "2026-07-02T10:00:00.000Z",
    updatedAt: "2026-07-02T10:00:00.000Z",
  },
]

const conversation: ConversationSummary = {
  id: "conv-9",
  characterId: "char-1",
  characterName: "Lyra",
  profileImageAssetId: null,
  title: "La búsqueda",
  messageCount: 8,
  lastActivityAt: "2026-07-09T10:00:00.000Z",
  createdAt: "2026-07-01T10:00:00.000Z",
  updatedAt: "2026-07-09T10:00:00.000Z",
}

const mocks = vi.hoisted(() => ({
  listCharacters: vi.fn(),
  listCharacterVersions: vi.fn(),
  deleteCharacter: vi.fn(),
  listConversations: vi.fn(),
  createConversation: vi.fn(),
}))

vi.mock("@/lib/api/characters", () => ({
  listCharacters: mocks.listCharacters,
  listCharacterVersions: mocks.listCharacterVersions,
  deleteCharacter: mocks.deleteCharacter,
}))

vi.mock("@/lib/api/conversations", () => ({
  listConversations: mocks.listConversations,
  createConversation: mocks.createConversation,
}))

beforeEach(() => {
  mocks.listCharacters.mockReset()
  mocks.listCharacterVersions.mockReset()
  mocks.deleteCharacter.mockReset()
  mocks.listConversations.mockReset()
  mocks.createConversation.mockReset()

  vi.stubGlobal("location", { href: "" })
})

afterEach(() => {
  vi.unstubAllGlobals()
  cleanup()
})

describe("CharacterList", () => {
  it("renderiza una card por personaje con nombre, versión y fechas", async () => {
    mocks.listCharacters.mockResolvedValue(characters)
    mocks.listConversations.mockResolvedValue([])

    render(<CharacterList />)

    expect(await screen.findByText("Lyra")).toBeInTheDocument()
    expect(screen.getByText("Kael")).toBeInTheDocument()
    expect(screen.getByText("v2")).toBeInTheDocument()
    expect(screen.getByText("v1")).toBeInTheDocument()
    expect(screen.getAllByText(/Creado:/)).toHaveLength(2)
  })

  it("al pulsar la imagen navega a la conversación más reciente si existe", async () => {
    mocks.listCharacters.mockResolvedValue([characters[0]])
    mocks.listConversations.mockResolvedValue([conversation])

    render(<CharacterList />)

    fireEvent.click(
      await screen.findByLabelText(
        "Abrir la conversación más reciente con Lyra",
      ),
    )

    expect(mocks.createConversation).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(window.location.href).toBe("/conversations/conv-9"),
    )
  })

  it("al pulsar la imagen sin conversaciones crea una con la versión actual", async () => {
    mocks.listCharacters.mockResolvedValue([characters[1]])
    mocks.listConversations.mockResolvedValue([])
    mocks.createConversation.mockResolvedValue({
      conversation: { id: "conv-new" },
      defaultProviderStatus: "available",
    })

    render(<CharacterList />)

    fireEvent.click(
      await screen.findByLabelText(
        "Abrir la conversación más reciente con Kael",
      ),
    )

    expect(mocks.createConversation).toHaveBeenCalledWith({
      characterId: "char-2",
    })
    await waitFor(() =>
      expect(window.location.href).toBe("/conversations/conv-new"),
    )
  })
})
