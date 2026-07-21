import { useCallback, useEffect, useState } from "react"
import { Toaster, toast } from "@workspace/ui/components/sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
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
import { Separator } from "@workspace/ui/components/separator"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  PlusIcon,
  PencilIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@workspace/ui/components/dialog"

import type {
  ConfigureDefaultProviderInput,
  DefaultProviderConfig,
  ListModelsResult,
  ProviderId,
  ProviderStatus,
} from "@workspace/shared/types/provider"
import type { ProviderInstance } from "@workspace/shared/types/provider-instance"

import {
  configureDefaultProvider,
  getDefaultProvider,
} from "@/lib/api/settings"
import {
  listProviders,
  listProviderModels,
  validateProvider,
} from "@/lib/api/providers"
import {
  listProviderInstances,
  createProviderInstance,
  updateProviderInstance,
  deleteProviderInstance,
  validateProviderInstance,
} from "@/lib/api/provider-instances"
import { ApiClientError } from "@/lib/api/client"

type StatusMap = Record<ProviderId, ProviderStatus | "loading">

const STATUS_LABELS: Record<ProviderStatus | "loading", string> = {
  available: "Disponible",
  unavailable: "No disponible",
  unconfigured: "Sin configurar",
  unknown: "Desconocido",
  loading: "Verificando...",
}

const STATUS_VARIANT: Record<
  ProviderStatus | "loading",
  "default" | "secondary" | "destructive" | "outline"
> = {
  available: "default",
  unavailable: "destructive",
  unconfigured: "outline",
  unknown: "secondary",
  loading: "secondary",
}

const isError = (e: unknown): e is ApiClientError => e instanceof ApiClientError

const formatError = (e: unknown): string => {
  if (isError(e)) return `[${e.code}] ${e.message}`
  if (e instanceof Error) return e.message
  return "Error desconocido"
}

export function ProviderManager() {
  const [registeredIds, setRegisteredIds] = useState<ProviderId[]>([])
  const [statuses, setStatuses] = useState<StatusMap>({
    ollama: "unknown",
    "openai-compatible": "unknown",
  })
  const [defaultConfig, setDefaultConfig] =
    useState<DefaultProviderConfig>({ provider: null, providerInstanceId: null, model: null })
  const [selected, setSelected] = useState<ProviderId>("ollama")
  const [models, setModels] = useState<ListModelsResult | null>(null)
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelInput, setModelInput] = useState("")
  const [savingDefault, setSavingDefault] = useState(false)

  const [instances, setInstances] = useState<ProviderInstance[]>([])
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null)

  const [newInstanceDialogOpen, setNewInstanceDialogOpen] = useState(false)
  const [editInstanceId, setEditInstanceId] = useState<string | null>(null)
  const [instanceFormName, setInstanceFormName] = useState("")
  const [instanceFormUrl, setInstanceFormUrl] = useState("")
  const [instanceFormApiKey, setInstanceFormApiKey] = useState("")

  const refreshAllStatuses = useCallback(async () => {
    setStatuses({ ollama: "loading", "openai-compatible": "loading" })
    const settled = await Promise.allSettled(
      registeredIds.map((id) => validateProvider(id)),
    )
    setStatuses((prev) => {
      const next = { ...prev }
      registeredIds.forEach((id, idx) => {
        const r = settled[idx]
        next[id] = r.status === "fulfilled" ? r.value.status : "unavailable"
      })
      return next
    })
  }, [registeredIds])

  useEffect(() => {
    ;(async () => {
      try {
        const [ids, def, insts] = await Promise.all([
          listProviders(),
          getDefaultProvider(),
          listProviderInstances(),
        ])
        setRegisteredIds(ids.map((p) => p.id))
        setDefaultConfig(def)
        setInstances(insts)
        if (def.provider) setSelected(def.provider)
        if (def.provider === "openai-compatible" && def.providerInstanceId) {
          setSelectedInstanceId(def.providerInstanceId)
        }
      } catch (e) {
        toast.error("No se pudo cargar la configuracion inicial", {
          description: formatError(e),
        })
      }
    })()
  }, [])

  useEffect(() => {
    if (registeredIds.length === 0) return
    void refreshAllStatuses()
  }, [registeredIds, refreshAllStatuses])

  useEffect(() => {
    if (!selected) return
    setModelsLoading(true)
    let cancelled = false
    ;(async () => {
      try {
        const result = await listProviderModels(selected)
        if (cancelled) return
        setModels(result)
        if (defaultConfig.provider === selected && defaultConfig.model) {
          setModelInput(defaultConfig.model)
        }
      } catch (e) {
        if (cancelled) return
        toast.error("No se pudo listar los modelos", {
          description: formatError(e),
        })
      } finally {
        if (!cancelled) setModelsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selected, defaultConfig.provider, defaultConfig.model])

  const handleVerifyOpenAI = async () => {
    if (!selectedInstanceId) {
      toast.error("Selecciona una instancia primero")
      return
    }
    try {
      setStatuses((prev) => ({ ...prev, "openai-compatible": "loading" }))
      const result = await validateProviderInstance(selectedInstanceId)
      const s: ProviderStatus = result.status === "available" ? "available" : "unavailable"
      setStatuses((prev) => ({ ...prev, "openai-compatible": s }))
      if (s === "available") {
        toast.success("Conexion exitosa")
      } else {
        toast.warning("Instancia no disponible", { description: result.message })
      }
    } catch (e) {
      setStatuses((prev) => ({ ...prev, "openai-compatible": "unavailable" }))
      toast.error("No se pudo verificar la conexion", { description: formatError(e) })
    }
  }

  const handleSaveDefault = async (force: boolean) => {
    const model = modelInput.trim()
    if (model === "") {
      toast.error("Indica un modelo antes de guardar")
      return
    }
    if (selected === "openai-compatible" && !selectedInstanceId) {
      toast.error("Selecciona una instancia de proveedor")
      return
    }
    setSavingDefault(true)
    const body: ConfigureDefaultProviderInput = {
      provider: selected,
      providerInstanceId: selected === "openai-compatible" ? selectedInstanceId : null,
      model,
      ...(force ? { force: true } : {}),
    }
    try {
      const result = await configureDefaultProvider(body)
      setDefaultConfig(result)
      toast.success("Proveedor por defecto actualizado", {
        description: `${result.provider} - ${result.model}`,
      })
      void refreshAllStatuses()
    } catch (e) {
      if (isError(e) && e.code === "PROVIDER_CONNECTION_FAILED") {
        toast.warning("El proveedor no responde", {
          description:
            "Reintenta cuando este activo o pulsa 'Guardar de todos modos' para forzar el guardado.",
        })
      } else {
        toast.error("No se pudo guardar el proveedor por defecto", {
          description: formatError(e),
        })
      }
    } finally {
      setSavingDefault(false)
    }
  }

  const handleCreateInstance = async () => {
    try {
      const instance = await createProviderInstance({
        kind: "openai-compatible",
        name: instanceFormName.trim(),
        url: instanceFormUrl.trim(),
        apiKey: instanceFormApiKey.trim() || undefined,
      })
      setInstances((prev) => [...prev, instance])
      setNewInstanceDialogOpen(false)
      setInstanceFormName("")
      setInstanceFormUrl("")
      setInstanceFormApiKey("")
      toast.success("Instancia creada", { description: instance.name })
    } catch (e) {
      toast.error("No se pudo crear la instancia", { description: formatError(e) })
    }
  }

  const handleUpdateInstance = async () => {
    if (!editInstanceId) return
    try {
      const updated = await updateProviderInstance(editInstanceId, {
        name: instanceFormName.trim() || undefined,
        url: instanceFormUrl.trim() || undefined,
        apiKey: instanceFormApiKey.trim() || undefined,
      })
      setInstances((prev) => prev.map((i) => (i.id === editInstanceId ? updated : i)))
      setEditInstanceId(null)
      setInstanceFormName("")
      setInstanceFormUrl("")
      setInstanceFormApiKey("")
      toast.success("Instancia actualizada")
    } catch (e) {
      toast.error("No se pudo actualizar la instancia", { description: formatError(e) })
    }
  }

  const handleDeleteInstance = async (id: string) => {
    try {
      await deleteProviderInstance(id)
      setInstances((prev) => prev.filter((i) => i.id !== id))
      if (selectedInstanceId === id) {
        setSelectedInstanceId(null)
      }
      toast.success("Instancia eliminada")
    } catch (e) {
      toast.error("No se pudo eliminar la instancia", { description: formatError(e) })
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <Toaster richColors position="top-right" />

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Proveedor por defecto</h1>
        <p className="text-muted-foreground text-sm">
          Configura que modelo de IA usara la aplicacion por defecto. Los
          proveedores se validan en vivo; puedes guardar aunque fallen si
          confias en que estaran disponibles mas tarde.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Selecciona un proveedor</CardTitle>
          <CardDescription>
            Proveedores registrados: {registeredIds.length === 0 ? "cargando..." : registeredIds.join(", ")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ToggleGroup
            value={[selected as string]}
            onValueChange={(v) => {
              const first = v[0]
              if (first && first !== selected) {
                setSelected(first as ProviderId)
                setModels(null)
                setModelInput("")
              }
            }}
            className="flex flex-wrap items-center gap-2"
          >
            {registeredIds.map((id) => (
              <ToggleGroupItem key={id} value={id} aria-label={id}>
                {id === "ollama" ? "Ollama (local)" : "OpenAI-compatible"}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Separator />

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Estado actual:</span>
            {registeredIds.map((id) => (
              <Badge
                key={id}
                variant={STATUS_VARIANT[statuses[id]]}
                className="gap-1"
              >
                {statuses[id] === "available" ? (
                  <CheckCircle2Icon className="size-3" />
                ) : null}
                {id}: {STATUS_LABELS[statuses[id]]}
              </Badge>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void refreshAllStatuses()}
              disabled={registeredIds.length === 0}
            >
              <RefreshCwIcon />
              Refrescar todos
            </Button>
          </div>
        </CardContent>
      </Card>

      {selected === "openai-compatible" ? (
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
                    onClick={() => setSelectedInstanceId(inst.id)}
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
                          setEditInstanceId(inst.id)
                          setInstanceFormName(inst.name)
                          setInstanceFormUrl(inst.url)
                          setInstanceFormApiKey("")
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
                          handleDeleteInstance(inst.id)
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
              onClick={() => {
                setEditInstanceId(null)
                setInstanceFormName("")
                setInstanceFormUrl("")
                setInstanceFormApiKey("")
                setNewInstanceDialogOpen(true)
              }}
            >
              <PlusIcon /> Nueva instancia
            </Button>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleVerifyOpenAI()}
              disabled={!selectedInstanceId}
            >
              Verificar conexion
            </Button>
          </CardFooter>
        </Card>
      ) : null}

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
                  onChange={(e) => setModelInput(e.target.value)}
                  placeholder="gpt-4o-mini, llama3:latest, ..."
                />
                <FieldDescription>
                  Este proveedor no soporta descubrimiento automatico de modelos.
                </FieldDescription>
              </Field>
            ) : models && models.models.length > 0 ? (
              <Field>
                <FieldLabel htmlFor="model-select">Modelo</FieldLabel>
                <Select
                  value={modelInput}
                  onValueChange={(v) => setModelInput(v ?? "")}
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
                  onChange={(e) => setModelInput(e.target.value)}
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
            onClick={() => void handleSaveDefault(false)}
            disabled={savingDefault}
          >
            {savingDefault ? <Spinner /> : null}
            Guardar como predeterminado
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleSaveDefault(true)}
            disabled={savingDefault}
          >
            Guardar de todos modos (force)
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuracion actual</CardTitle>
        </CardHeader>
        <CardContent>
          {defaultConfig.provider === null ? (
            <p className="text-muted-foreground text-sm">
              Aun no has configurado un proveedor por defecto.
            </p>
          ) : (
            <p className="text-sm">
              <strong>{defaultConfig.provider}</strong>
              {defaultConfig.providerInstanceId ? (
                <> &middot; <span className="text-muted-foreground">instancia: {defaultConfig.providerInstanceId}</span></>
              ) : null}
              &middot;{" "}
              <code className="bg-muted rounded px-1 py-0.5 text-xs">
                {defaultConfig.model}
              </code>
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={newInstanceDialogOpen} onOpenChange={setNewInstanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva instancia OpenAI-compatible</DialogTitle>
            <DialogDescription>
              Configura una conexion a un proveedor compatible con OpenAI.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="inst-name">Nombre</FieldLabel>
              <Input
                id="inst-name"
                value={instanceFormName}
                onChange={(e) => setInstanceFormName(e.target.value)}
                placeholder="LM Studio local"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="inst-url">URL base</FieldLabel>
              <Input
                id="inst-url"
                type="url"
                value={instanceFormUrl}
                onChange={(e) => setInstanceFormUrl(e.target.value)}
                placeholder="http://localhost:1234/v1"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="inst-key">API key (opcional)</FieldLabel>
              <Input
                id="inst-key"
                type="password"
                value={instanceFormApiKey}
                onChange={(e) => setInstanceFormApiKey(e.target.value)}
                placeholder="sk-..."
              />
            </Field>
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleCreateInstance}>Crear instancia</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editInstanceId !== null} onOpenChange={(o) => { if (!o) setEditInstanceId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar instancia</DialogTitle>
            <DialogDescription>
              Modifica los datos de la conexion.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="edit-name">Nombre</FieldLabel>
              <Input
                id="edit-name"
                value={instanceFormName}
                onChange={(e) => setInstanceFormName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-url">URL base</FieldLabel>
              <Input
                id="edit-url"
                type="url"
                value={instanceFormUrl}
                onChange={(e) => setInstanceFormUrl(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-key">API key (dejar vacio para mantener)</FieldLabel>
              <Input
                id="edit-key"
                type="password"
                value={instanceFormApiKey}
                onChange={(e) => setInstanceFormApiKey(e.target.value)}
                placeholder="(dejar vacio para mantener)"
              />
            </Field>
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleUpdateInstance}>Guardar cambios</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
