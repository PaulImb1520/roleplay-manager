import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

interface InstanceFormDialogProps {
  open: boolean
  mode: "create" | "edit"
  initialName: string
  initialUrl: string
  initialApiKey: string
  onClose: () => void
  onSave: (name: string, url: string, apiKey: string) => void
}

export function InstanceFormDialog({
  open,
  mode,
  initialName,
  initialUrl,
  initialApiKey,
  onClose,
  onSave,
}: InstanceFormDialogProps) {
  const [name, setName] = useState(initialName)
  const [url, setUrl] = useState(initialUrl)
  const [apiKey, setApiKey] = useState(initialApiKey)

  useEffect(() => {
    if (!open) return
    setName(initialName)
    setUrl(initialUrl)
    setApiKey(initialApiKey)
  }, [open])

  const title = mode === "create" ? "Nueva instancia OpenAI-compatible" : "Editar instancia"
  const description =
    mode === "create"
      ? "Configura una conexion a un proveedor compatible con OpenAI."
      : "Modifica los datos de la conexion."
  const apiKeyPlaceholder =
    mode === "create" ? "sk-..." : "(dejar vacio para mantener)"
  const saveLabel = mode === "create" ? "Crear instancia" : "Guardar cambios"
  const idPrefix = mode

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`${idPrefix}-name`}>Nombre</FieldLabel>
            <Input
              id={`${idPrefix}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="LM Studio local"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${idPrefix}-url`}>URL base</FieldLabel>
            <Input
              id={`${idPrefix}-url`}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:1234/v1"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${idPrefix}-key`}>API key {mode === "edit" ? "(opcional)" : ""}</FieldLabel>
            <Input
              id={`${idPrefix}-key`}
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={apiKeyPlaceholder}
            />
          </Field>
        </FieldGroup>
        <div className="flex justify-end gap-2">
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={() => onSave(name, url, apiKey)}>{saveLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
