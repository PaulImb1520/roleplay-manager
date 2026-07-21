import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Spinner } from "@workspace/ui/components/spinner"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"

interface ModelCardProps {
  model: string | null
  modelsList: { id: string; name?: string }[]
  modelsLoading: boolean
  modelsManualEntry: boolean
  onModelChange: (v: string | null) => void
}

export function ModelCard({
  model,
  modelsList,
  modelsLoading,
  modelsManualEntry,
  onModelChange,
}: ModelCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Modelo</CardTitle>
        <CardDescription>
          {modelsManualEntry
            ? "Introduce el identificador del modelo manualmente."
            : "Selecciona un modelo de la lista."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          {modelsLoading ? (
            <Field>
              <FieldLabel>Cargando modelos...</FieldLabel>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner /> Consultando al proveedor
              </div>
            </Field>
          ) : modelsManualEntry || modelsList.length === 0 ? (
            <Field>
              <FieldLabel htmlFor="model-input">Identificador del modelo</FieldLabel>
              <Input
                id="model-input"
                value={model ?? ""}
                onChange={(e) => onModelChange(e.target.value || null)}
                placeholder="gpt-4o-mini, llama3:latest, ..."
              />
              {modelsManualEntry ? (
                <FieldDescription>El proveedor no soporta descubrimiento automático.</FieldDescription>
              ) : null}
            </Field>
          ) : (
            <Field>
              <FieldLabel htmlFor="model-select">Modelo</FieldLabel>
              <Select value={model ?? ""} onValueChange={(v) => onModelChange(v || null)}>
                <SelectTrigger id="model-select">
                  <SelectValue placeholder="Selecciona un modelo" />
                </SelectTrigger>
                <SelectContent>
                  {modelsList.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name ?? m.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>{modelsList.length} modelos disponibles.</FieldDescription>
            </Field>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
