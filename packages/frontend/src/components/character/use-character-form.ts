import { useState } from "react"
import { toast } from "@workspace/ui/components/sonner"
import type {
  CharacterDetail,
  CharacterVersionDTO,
  UpdateCharacterInput,
  CreateCharacterInput,
} from "@workspace/shared/types/character"
import { ApiClientError } from "@/lib/api/client"
import {
  createCharacter,
  updateCharacter,
} from "@/lib/api/characters"
import { createConversation } from "@/lib/api/conversations"
import { buildSnapshot, hasChanges } from "./character-form-utils"

export interface CardEntry {
  id: string
  title: string
  content: string
  active: boolean
}

function emptyCard(): CardEntry {
  return { id: crypto.randomUUID(), title: "", content: "", active: true }
}

export function useCharacterForm(character?: CharacterDetail) {
  const isEditing = !!character
  const version: CharacterVersionDTO | undefined = character?.currentVersion

  const [name, setName] = useState(character?.name ?? "")
  const [subtitle, setSubtitle] = useState(version?.subtitle ?? "")
  const [profileImage, setProfileImage] = useState(version?.profileImage ?? "")
  const [description, setDescription] = useState(version?.description ?? "")
  const [instructions, setInstructions] = useState(version?.instructions ?? "")
  const [greeting, setGreeting] = useState(version?.greeting ?? "")
  const [cards, setCards] = useState<CardEntry[]>(
    () =>
      version?.cards.map((c) => ({
        id: c.id,
        title: c.title,
        content: c.content,
        active: c.active,
      })) ?? [],
  )
  const [versionNumber, setVersionNumber] = useState(version?.versionNumber ?? 1)
  const [activeTab, setActiveTab] = useState("general")
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [lastSnapshot, setLastSnapshot] = useState(() =>
    buildSnapshot(
      character?.name ?? "",
      version?.subtitle,
      version?.profileImage ?? "",
      version?.description ?? "",
      version?.instructions,
      version?.greeting ?? "",
      (version?.cards ?? []).map(c => ({ title: c.title, content: c.content, active: c.active })),
    ),
  )

  const addCard = () => setCards((prev) => [...prev, emptyCard()])

  const removeCard = (idx: number) =>
    setCards((prev) => prev.filter((_, i) => i !== idx))

  const moveCard = (idx: number, direction: "up" | "down") => {
    setCards((prev) => {
      const next = [...prev]
      const target = direction === "up" ? idx - 1 : idx + 1
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  const updateCard = (idx: number, field: keyof CardEntry, value: string | boolean) =>
    setCards((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)),
    )

  const currentSnapshot = buildSnapshot(
    name, subtitle, profileImage, description, instructions, greeting,
    cards.map(c => ({ title: c.title, content: c.content, active: c.active })),
  )
  const dirty = isEditing && hasChanges(currentSnapshot, lastSnapshot)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("El nombre es obligatorio")
      return
    }
    if (!profileImage.trim()) {
      toast.error("La imagen de perfil es obligatoria")
      return
    }
    if (!description.trim()) {
      toast.error("La descripción es obligatoria")
      return
    }
    if (!greeting.trim()) {
      toast.error("El saludo inicial es obligatorio")
      return
    }
    if (cards.some((c) => !c.title.trim() || !c.content.trim())) {
      toast.error("Las tarjetas deben tener título y contenido")
      return
    }

    if (isEditing && !dirty) {
      toast.warning("No hay cambios que guardar")
      return
    }

    setSaving(true)
    try {
      if (isEditing && character) {
        const input: UpdateCharacterInput = {
          name: name.trim() !== character.name ? name.trim() : undefined,
          subtitle: subtitle.trim() || null,
          profileImage: profileImage.trim() !== version?.profileImage ? profileImage.trim() : undefined,
          description: description.trim() !== version?.description ? description.trim() : undefined,
          instructions: instructions.trim() || null,
          greeting: greeting.trim() !== version?.greeting ? greeting.trim() : undefined,
          cards: cards.map((c, i) => ({
            title: c.title,
            content: c.content,
            position: i,
            active: c.active,
          })),
        }
        const result = await updateCharacter(character.id, input)
        setName(result.name)
        setSubtitle(result.currentVersion.subtitle ?? "")
        setProfileImage(result.currentVersion.profileImage)
        setDescription(result.currentVersion.description)
        setInstructions(result.currentVersion.instructions ?? "")
        setGreeting(result.currentVersion.greeting)
        setCards(result.currentVersion.cards.map(c => ({
          id: c.id,
          title: c.title,
          content: c.content,
          active: c.active,
        })))
        setVersionNumber(result.currentVersion.versionNumber)
        setLastSnapshot(buildSnapshot(
          result.name,
          result.currentVersion.subtitle,
          result.currentVersion.profileImage,
          result.currentVersion.description,
          result.currentVersion.instructions,
          result.currentVersion.greeting,
          result.currentVersion.cards.map(c => ({ title: c.title, content: c.content, active: c.active })),
        ))
        toast.success("Personaje actualizado")
      } else {
        const input: CreateCharacterInput = {
          name: name.trim(),
          subtitle: subtitle.trim() || null,
          profileImage: profileImage.trim(),
          description: description.trim(),
          instructions: instructions.trim() || null,
          greeting: greeting.trim(),
          cards: cards
            .filter((c) => c.title.trim() && c.content.trim())
            .map((c) => ({ title: c.title, content: c.content, active: c.active })),
        }
        const result = await createCharacter(input)
        const conv = await createConversation({ characterId: result.id })
        location.href = `/conversations/${conv.id}`
        return
      }
    } catch (e) {
      if (e instanceof ApiClientError) {
        toast.error(`Error: ${e.message}`)
      } else {
        toast.error("Error inesperado al guardar")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!character) return
    setSaving(true)
    try {
      const { deleteCharacter: del } = await import("@/lib/api/characters")
      await del(character.id)
      toast.success("Personaje eliminado")
      location.href = "/"
    } catch (e) {
      if (e instanceof ApiClientError) {
        toast.error(`Error: ${e.message}`)
      } else {
        toast.error("Error inesperado al eliminar")
      }
    } finally {
      setSaving(false)
      setShowDeleteDialog(false)
    }
  }

  const handleStartConversation = async () => {
    if (!character) return
    try {
      const conv = await createConversation({ characterId: character.id })
      location.href = `/conversations/${conv.id}`
    } catch {
      toast.error("Error al crear la conversación")
    }
  }

  return {
    isEditing,
    version,
    name, setName,
    subtitle, setSubtitle,
    profileImage, setProfileImage,
    description, setDescription,
    instructions, setInstructions,
    greeting, setGreeting,
    cards,
    versionNumber,
    activeTab, setActiveTab,
    saving,
    showDeleteDialog, setShowDeleteDialog,
    dirty,
    addCard,
    removeCard,
    moveCard,
    updateCard,
    handleSubmit,
    handleDelete,
    handleStartConversation,
  }
}
