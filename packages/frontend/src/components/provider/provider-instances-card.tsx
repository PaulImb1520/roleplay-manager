import type { ProviderInstance } from "@workspace/shared/types/provider-instance"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react"

interface ProviderInstancesCardProps {
  instances: ProviderInstance[]
  selectedInstanceId: string | null
  onSelectInstance: (id: string) => void
  onEditInstance: (id: string, name: string, url: string) => void
  onDeleteInstance: (id: string) => void
  onCreateNew: () => void
  onVerifyConnection: () => void
}

export function ProviderInstancesCard({
  instances,
  selectedInstanceId,
  onSelectInstance,
  onEditInstance,
  onDeleteInstance,
  onCreateNew,
  onVerifyConnection,
}: ProviderInstancesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instancias OpenAI-compatible</CardTitle>
        <CardDescription>
          Gestiona las instancias de proveedores compatibles con OpenAI.
          Cada instancia tiene su propia URL y API key.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {instances.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay instancias configuradas. Crea una nueva.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {instances.map((inst) => (
              <div
                key={inst.id}
                className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                  selectedInstanceId === inst.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => onSelectInstance(inst.id)}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{inst.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {inst.url || "Sin URL"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditInstance(inst.id, inst.name, inst.url)
                    }}
                  >
                    <PencilIcon className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteInstance(inst.id)
                    }}
                  >
                    <Trash2Icon className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateNew}
        >
          <PlusIcon /> Nueva instancia
        </Button>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onVerifyConnection}
          disabled={!selectedInstanceId}
        >
          Verificar conexion
        </Button>
      </CardFooter>
    </Card>
  )
}
