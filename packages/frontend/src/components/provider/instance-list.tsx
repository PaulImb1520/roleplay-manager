import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { PlusIcon, PencilIcon, Trash2Icon, CheckIcon } from "lucide-react"

import type { ProviderInstance } from "@workspace/shared/types/provider-instance"

interface InstanceListProps {
  instances: ProviderInstance[]
  selectedInstanceId: string | null
  onSelect: (id: string) => void
  onEdit: (instance: ProviderInstance) => void
  onDelete: (id: string) => void
  onCreateNew: () => void
}

export function InstanceList({
  instances,
  selectedInstanceId,
  onSelect,
  onEdit,
  onDelete,
  onCreateNew,
}: InstanceListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Instancias</CardTitle>
        <CardDescription>
          Conexiones a proveedores compatibles con OpenAI.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {instances.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>Sin instancias</EmptyTitle>
              <EmptyDescription>
                Crea una instancia para conectar con un proveedor.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-2">
            {instances.map((inst) => {
              const selected = selectedInstanceId === inst.id
              return (
                <div
                  key={inst.id}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <button
                    type="button"
                    className="flex flex-1 flex-col items-start text-left"
                    onClick={() => onSelect(inst.id)}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {inst.name}
                      {selected ? (
                        <Badge variant="secondary" className="gap-1">
                          <CheckIcon className="size-3" /> Seleccionada
                        </Badge>
                      ) : null}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {inst.url || "Sin URL"}
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => onEdit(inst)}
                      aria-label={`Editar ${inst.name}`}
                    >
                      <PencilIcon className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive"
                      onClick={() => onDelete(inst.id)}
                      aria-label={`Eliminar ${inst.name}`}
                    >
                      <Trash2Icon className="size-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <Button type="button" variant="outline" size="sm" onClick={onCreateNew}>
          <PlusIcon /> Nueva instancia
        </Button>
      </CardContent>
    </Card>
  )
}
