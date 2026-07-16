import type { CharacterSummary } from "@workspace/shared/types/character"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"

export function CharacterCard({ character }: { character: CharacterSummary }) {
  return (
    <a href={`/characters/${character.id}`} className="block">
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="size-12 overflow-hidden rounded-full bg-muted">
            {character.profileImage ? (
              <img
                src={character.profileImage}
                alt={`${character.name} avatar`}
                className="size-full object-cover"
              />
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">{character.name}</CardTitle>
            {character.subtitle ? (
              <p className="text-muted-foreground text-xs">{character.subtitle}</p>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">v{character.versionNumber}</Badge>
          <span>Creado: {new Date(character.createdAt).toLocaleDateString()}</span>
        </CardContent>
      </Card>
    </a>
  )
}
