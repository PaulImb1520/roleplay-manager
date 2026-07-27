import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"

interface ChatConfirmDialogsProps {
  confirmDelete: string | null
  confirmRewind: string | null
  affectedSummariesCount: number
  onCloseDelete: () => void
  onCloseRewind: () => void
  onConfirmDelete: () => void
  onConfirmRewind: () => void
}

export function ChatConfirmDialogs({
  confirmDelete,
  confirmRewind,
  affectedSummariesCount,
  onCloseDelete,
  onCloseRewind,
  onConfirmDelete,
  onConfirmRewind,
}: ChatConfirmDialogsProps) {
  return (
    <>
      <Dialog open={confirmDelete !== null} onOpenChange={onCloseDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar mensaje</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este mensaje? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseDelete}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={onConfirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmRewind !== null} onOpenChange={onCloseRewind}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retroceder conversación</DialogTitle>
            <DialogDescription>
              Se eliminarán todos los mensajes posteriores a este punto. Esta acción no se puede deshacer.
            </DialogDescription>
            {affectedSummariesCount > 0 && (
              <p className="text-sm text-muted-foreground">
                También se eliminará{affectedSummariesCount === 1 ? "" : "n"}{" "}
                {affectedSummariesCount} resumen{affectedSummariesCount === 1 ? "" : "es"} cuyo rango queda afectado.
              </p>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseRewind}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={onConfirmRewind}>
              Retroceder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
