import { Button } from "@workspace/ui/components/button"
import { AlertCircleIcon } from "lucide-react"

export function CharacterNotFound({ error }: { error?: string | null }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
      <AlertCircleIcon className="size-8 text-muted-foreground" />
      <div>
        <h2 className="text-lg font-semibold">Personaje no encontrado</h2>
        {error ? (
          <p className="text-muted-foreground text-sm">{error}</p>
        ) : (
          <p className="text-muted-foreground text-sm">
            El personaje que buscas no existe o ha sido eliminado.
          </p>
        )}
      </div>
      <Button render={<a href="/" />} variant="outline" nativeButton={false}>
        Volver a mis personajes
      </Button>
    </div>
  )
}
