import { Router } from "express"
import { z } from "zod"

import type { CreateCharacterUseCase } from "../../../../application/use-cases/character/create-character.use-case"
import type { GetCharacterUseCase } from "../../../../application/use-cases/character/get-character.use-case"
import type { ListCharactersUseCase } from "../../../../application/use-cases/character/list-characters.use-case"
import type { UpdateCharacterUseCase } from "../../../../application/use-cases/character/update-character.use-case"
import type { DeleteCharacterUseCase } from "../../../../application/use-cases/character/delete-character.use-case"
import type { ListCharacterVersionsUseCase } from "../../../../application/use-cases/character/list-character-versions.use-case"

const CardSchema = z.object({
  title: z.string().min(1, "Card title is required"),
  content: z.string().min(1, "Card content is required"),
  active: z.boolean().optional(),
})

const CreateCharacterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subtitle: z.string().nullable().optional(),
  profileImage: z.string().min(1, "Profile image is required"),
  description: z.string().min(1, "Description is required"),
  instructions: z.string().nullable().optional(),
  greeting: z.string().min(1, "Greeting is required"),
  cards: z.array(CardSchema).optional(),
})

const UpdateCardSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Card title is required"),
  content: z.string().min(1, "Card content is required"),
  position: z.number().int().min(0),
  active: z.boolean().optional(),
})

const UpdateCharacterSchema = z.object({
  name: z.string().min(1).optional(),
  subtitle: z.string().nullable().optional(),
  profileImage: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  instructions: z.string().nullable().optional(),
  greeting: z.string().min(1).optional(),
  cards: z.array(UpdateCardSchema).optional(),
})

export const buildCharacterRouter = (deps: {
  createCharacter: CreateCharacterUseCase
  getCharacter: GetCharacterUseCase
  listCharacters: ListCharactersUseCase
  updateCharacter: UpdateCharacterUseCase
  deleteCharacter: DeleteCharacterUseCase
  listCharacterVersions: ListCharacterVersionsUseCase
}): Router => {
  const router = Router()

  router.post("/characters", async (req, res, next) => {
    try {
      const input = CreateCharacterSchema.parse(req.body)
      const result = await deps.createCharacter.execute(input)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  })

  router.get("/characters", async (_req, res, next) => {
    try {
      const result = await deps.listCharacters.execute()
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  router.get("/characters/:id", async (req, res, next) => {
    try {
      const result = await deps.getCharacter.execute(req.params.id)
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  router.put("/characters/:id", async (req, res, next) => {
    try {
      const input = UpdateCharacterSchema.parse(req.body)
      const result = await deps.updateCharacter.execute(req.params.id, input)
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  router.delete("/characters/:id", async (req, res, next) => {
    try {
      await deps.deleteCharacter.execute(req.params.id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  })

  router.get("/characters/:id/versions", async (req, res, next) => {
    try {
      const result = await deps.listCharacterVersions.execute(req.params.id)
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  return router
}
