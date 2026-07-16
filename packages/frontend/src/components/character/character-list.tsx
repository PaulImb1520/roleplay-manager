import { useEffect, useState } from "react"
import { PlusIcon } from "lucide-react"

import type { CharacterSummary } from "@workspace/shared/types/character"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"

import { listCharacters } from "@/lib/api/characters"
import { CharacterCard } from "./character-card"

export function CharacterList() {
  const [characters, setCharacters] = useState<CharacterSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const result = await listCharacters()
        setCharacters(result)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mis personajes</h1>
          <p className="text-muted-foreground text-sm">
            {characters.length} personaje{characters.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button render={<a href="/characters/new" />}>
          <PlusIcon />
          Crear personaje
        </Button>
      </header>

      {characters.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Aún no tienes personajes. ¡Crea tu primer personaje para empezar!
          </p>
          <Button render={<a href="/characters/new" />} variant="outline">
              <PlusIcon />
              Crear personaje
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((c) => (
            <CharacterCard key={c.id} character={c} />
          ))}
        </div>
      )}
    </div>
  )
}
