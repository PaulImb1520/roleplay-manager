import type { ListModelsResult } from "@workspace/shared/types/provider"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Spinner } from "@workspace/ui/components/spinner"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { AlertCircleIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

interface DefaultModelCardProps {
  models: ListModelsResult | null
  modelsLoading: boolean
  modelInput: string
  savingDefault: boolean
  onChangeModel: (value: string) => void
  onSaveDefault: (force: boolean) => void
}

export function DefaultModelCard({
  models,
  modelsLoading,
  modelInput,
  savingDefault,
  onChangeModel,
  onSaveDefault,
}: DefaultModelCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Modelo por defecto</CardTitle>
        <CardDescription>
          Elige un modelo de la lista, o introduce el identificador
          manualmente si el proveedor no soporta descubrimiento.
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
          ) : models?.manualEntryRequired ? (
            <Field>
              <FieldLabel htmlFor="model-input">Identificador del modelo</FieldLabel>
              <Input
                id="model-input"
                value={modelInput}
                onChange={(e) => onChangeModel(e.target.value)}
                placeholder="gpt-4o-mini, llama3:latest, ..."
              />
              <FieldDescription>
                Este proveedor no soporta descubrimiento automático de modelos.
              </FieldDescription>
            </Field>
          ) : models && models.models.length > 0 ? (
            <Field>
              <FieldLabel htmlFor="model-select">Modelo</FieldLabel>
              <Select
                value={modelInput}
                onValueChange={(v) => onChangeModel(v ?? "")}
              >
                <SelectTrigger id="model-select">
                  <SelectValue placeholder="Selecciona un modelo" />
                </SelectTrigger>
                <SelectContent>
                  {models.models.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name ?? m.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                {models.models.length} modelos disponibles.
              </FieldDescription>
            </Field>
          ) : (
            <Field>
              <FieldContent>
                <Alert>
                  <AlertCircleIcon />
                  <AlertTitle>No se pudieron listar los modelos</AlertTitle>
                  <AlertDescription>
                    El proveedor respondio pero no devolvio modelos. Puedes
                    introducir el identificador manualmente abajo.
                  </AlertDescription>
                </Alert>
              </FieldContent>
            </Field>
          )}

          {(models?.manualEntryRequired || (models && models.models.length === 0) || models === null) &&
          !modelsLoading ? (
            <Field>
              <FieldLabel htmlFor="model-manual">
                Identificador del modelo
              </FieldLabel>
              <Input
                id="model-manual"
                value={modelInput}
                onChange={(e) => onChangeModel(e.target.value)}
                placeholder="gpt-4o-mini, llama3:latest, ..."
              />
              <FieldError>
                Necesario para configurar el proveedor por defecto.
              </FieldError>
            </Field>
          ) : null}
        </FieldGroup>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => onSaveDefault(false)}
          disabled={savingDefault}
        >
          {savingDefault ? <Spinner /> : null}
          Guardar como predeterminado
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onSaveDefault(true)}
          disabled={savingDefault}
        >
          Guardar de todos modos (force)
        </Button>
      </CardFooter>
    </Card>
  )
}
