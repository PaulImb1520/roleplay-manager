import { useCallback, useEffect, useState } from "react"
import { Toaster, toast } from "@workspace/ui/components/sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import {
  CheckCircle2Icon,
  RefreshCwIcon,
} from "lucide-react"

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

import { InstanceFormDialog } from "./instance-form-dialog"
import { ProviderInstancesCard } from "./provider-instances-card"
import { DefaultModelCard } from "./default-model-card"

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
    ;(async () => {
      await refreshAllStatuses()
    })()
  }, [registeredIds, refreshAllStatuses])

  useEffect(() => {
    if (!selected) return
    let cancelled = false
    ;(async () => {
      setModelsLoading(true)
      try {
        const result = await listProviderModels(selected, selectedInstanceId ?? undefined)
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
  }, [selected, selectedInstanceId, defaultConfig.provider, defaultConfig.model])

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

  const handleCreateInstance = async (name?: string, url?: string, apiKey?: string) => {
    const finalName = (name ?? instanceFormName).trim()
    const finalUrl = (url ?? instanceFormUrl).trim()
    const finalApiKey = (apiKey ?? instanceFormApiKey).trim() || undefined
    if (import.meta.env.DEV) {
      console.log("[ProviderManager] handleCreateInstance:", { finalName, finalUrl, finalApiKey })
    }
    try {
      const instance = await createProviderInstance({
        kind: "openai-compatible",
        name: finalName,
        url: finalUrl,
        apiKey: finalApiKey,
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

  const handleUpdateInstance = async (name?: string, url?: string, apiKey?: string) => {
    if (!editInstanceId) return
    const finalName = (name ?? instanceFormName).trim() || undefined
    const finalUrl = (url ?? instanceFormUrl).trim() || undefined
    const finalApiKey = (apiKey ?? instanceFormApiKey).trim() || undefined
    if (import.meta.env.DEV) {
      console.log("[ProviderManager] handleUpdateInstance:", { finalName, finalUrl, finalApiKey })
    }
    try {
      const updated = await updateProviderInstance(editInstanceId, {
        name: finalName,
        url: finalUrl,
        apiKey: finalApiKey,
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
        <ProviderInstancesCard
          instances={instances}
          selectedInstanceId={selectedInstanceId}
          onSelectInstance={setSelectedInstanceId}
          onEditInstance={(id, name, url) => {
            setEditInstanceId(id)
            setInstanceFormName(name)
            setInstanceFormUrl(url)
            setInstanceFormApiKey("")
          }}
          onDeleteInstance={handleDeleteInstance}
          onCreateNew={() => {
            setEditInstanceId(null)
            setInstanceFormName("")
            setInstanceFormUrl("")
            setInstanceFormApiKey("")
            setNewInstanceDialogOpen(true)
          }}
          onVerifyConnection={handleVerifyOpenAI}
        />
      ) : null}

      <DefaultModelCard
        models={models}
        modelsLoading={modelsLoading}
        modelInput={modelInput}
        savingDefault={savingDefault}
        onChangeModel={setModelInput}
        onSaveDefault={handleSaveDefault}
      />

      <Card>
        <CardHeader>
          <CardTitle>Configuración actual</CardTitle>
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

      <InstanceFormDialog
        open={newInstanceDialogOpen}
        mode="create"
        initialName={instanceFormName}
        initialUrl={instanceFormUrl}
        initialApiKey={instanceFormApiKey}
        onClose={() => setNewInstanceDialogOpen(false)}
        onSave={(name, url, apiKey) => {
          handleCreateInstance(name, url, apiKey)
        }}
      />

      <InstanceFormDialog
        open={editInstanceId !== null}
        mode="edit"
        initialName={instanceFormName}
        initialUrl={instanceFormUrl}
        initialApiKey={instanceFormApiKey}
        onClose={() => setEditInstanceId(null)}
        onSave={(name, url, apiKey) => {
          handleUpdateInstance(name, url, apiKey)
        }}
      />
    </div>
  )
}
