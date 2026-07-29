import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Spinner } from "@workspace/ui/components/spinner"
import { Separator } from "@workspace/ui/components/separator"

import type {
  ConfigureDefaultProviderInput,
  DefaultProviderConfig,
  ProviderId,
  ProviderModel,
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
  createProviderInstance,
  deleteProviderInstance,
  listProviderInstances,
  updateProviderInstance,
  validateProviderInstance,
} from "@/lib/api/provider-instances"
import { ApiClientError } from "@/lib/api/client"

import { ProviderCard, type CardStatus } from "./provider-card"
import { InstanceFormDialog } from "./instance-form-dialog"
import { useInstanceDialog } from "./use-instance-dialog"

function isError(e: unknown): e is ApiClientError {
  return e instanceof ApiClientError
}

function formatError(e: unknown): string {
  if (isError(e)) return `[${e.code}] ${e.message}`
  if (e instanceof Error) return e.message
  return "Error desconocido"
}

export function ProviderManager() {
  const [registeredIds, setRegisteredIds] = useState<ProviderId[]>([])
  const [defaultConfig, setDefaultConfig] =
    useState<DefaultProviderConfig>({ provider: null, providerInstanceId: null, model: null })

  const [instances, setInstances] = useState<ProviderInstance[]>([])
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null)

  const [ollamaStatus, setOllamaStatus] = useState<CardStatus>("unknown")
  const [ollamaMessage, setOllamaMessage] = useState<string | undefined>(undefined)
  const [ollamaVerifying, setOllamaVerifying] = useState(false)
  const [ollamaModels, setOllamaModels] = useState<ProviderModel[]>([])
  const [ollamaModelsLoading, setOllamaModelsLoading] = useState(false)
  const [ollamaModel, setOllamaModel] = useState("")

  const [openaiStatus, setOpenaiStatus] = useState<CardStatus>("unknown")
  const [openaiMessage, setOpenaiMessage] = useState<string | undefined>(undefined)
  const [openaiVerifying, setOpenaiVerifying] = useState(false)
  const [openaiModels, setOpenaiModels] = useState<ProviderModel[]>([])
  const [openaiModelsLoading, setOpenaiModelsLoading] = useState(false)
  const [openaiModel, setOpenaiModel] = useState("")

  const [saving, setSaving] = useState(false)
  const [forceSaveAvailable, setForceSaveAvailable] = useState(false)

  const dialog = useInstanceDialog()

  const ollamaEnabled = registeredIds.includes("ollama")
  const openaiEnabled = registeredIds.includes("openai-compatible")

  const verifyOllama = useCallback(async () => {
    setOllamaVerifying(true)
    setOllamaStatus("loading")
    setOllamaMessage(undefined)
    setForceSaveAvailable(false)
    try {
      const result = await validateProvider("ollama")
      setOllamaStatus(result.status)
      setOllamaMessage(result.message)
      if (result.status === "available") {
        setOllamaModelsLoading(true)
        try {
          const r = await listProviderModels("ollama")
          setOllamaModels(r.models)
        } catch (e) {
          toast.warning("No se pudieron listar los modelos", {
            description: formatError(e),
          })
          setOllamaModels([])
        } finally {
          setOllamaModelsLoading(false)
        }
        toast.success("Conexión exitosa", { description: "Modelos cargados" })
      } else {
        setForceSaveAvailable(true)
      }
    } catch (e) {
      setOllamaStatus("unavailable")
      setOllamaMessage(formatError(e))
      setForceSaveAvailable(true)
    } finally {
      setOllamaVerifying(false)
    }
  }, [])

  const verifyOpenAIForInstance = useCallback(async (instanceId: string) => {
    setOpenaiVerifying(true)
    setOpenaiStatus("loading")
    setOpenaiMessage(undefined)
    setForceSaveAvailable(false)
    try {
      const result = await validateProviderInstance(instanceId)
      const status: ProviderStatus = result.status
      setOpenaiStatus(status)
      setOpenaiMessage(result.message)
      if (status === "available") {
        setOpenaiModelsLoading(true)
        try {
          const r = await listProviderModels("openai-compatible", instanceId)
          setOpenaiModels(r.models)
        } catch (e) {
          toast.warning("No se pudieron listar los modelos", {
            description: formatError(e),
          })
          setOpenaiModels([])
        } finally {
          setOpenaiModelsLoading(false)
        }
        toast.success("Conexión exitosa", { description: "Modelos cargados" })
      } else {
        setForceSaveAvailable(true)
      }
    } catch (e) {
      setOpenaiStatus("unavailable")
      setOpenaiMessage(formatError(e))
      setForceSaveAvailable(true)
    } finally {
      setOpenaiVerifying(false)
    }
  }, [])

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
        if (def.provider === "openai-compatible" && def.providerInstanceId) {
          setSelectedInstanceId(def.providerInstanceId)
        }
        if (def.model) {
          if (def.provider === "ollama") {
            setOllamaModel(def.model)
            void verifyOllama()
          }
          if (def.provider === "openai-compatible") {
            setOpenaiModel(def.model)
            if (def.providerInstanceId) void verifyOpenAIForInstance(def.providerInstanceId)
          }
        }
      } catch (e) {
        toast.error("No se pudo cargar la configuración inicial", {
          description: formatError(e),
        })
      }
    })()
  }, [verifyOllama, verifyOpenAIForInstance])

  const handleSelectInstance = useCallback((id: string) => {
    if (id === selectedInstanceId) return
    setSelectedInstanceId(id)
    setOpenaiModels([])
    setOpenaiStatus("unknown")
    setOpenaiMessage(undefined)
    void verifyOpenAIForInstance(id)
  }, [selectedInstanceId, verifyOpenAIForInstance])

  const handleCreateInstance = useCallback(
    async (name: string, url: string, apiKey: string) => {
      try {
        const instance = await createProviderInstance({
          kind: "openai-compatible",
          name: name.trim(),
          url: url.trim(),
          apiKey: apiKey.trim() || undefined,
        })
        setInstances((prev) => [...prev, instance])
        setSelectedInstanceId(instance.id)
        dialog.close()
        toast.success("Instancia creada", { description: instance.name })
      } catch (e) {
        toast.error("No se pudo crear la instancia", { description: formatError(e) })
      }
    },
    [dialog]
  )

  const handleUpdateInstance = useCallback(
    async (id: string, name: string, url: string, apiKey: string) => {
      try {
        const updated = await updateProviderInstance(id, {
          name: name.trim() || undefined,
          url: url.trim() || undefined,
          apiKey: apiKey.trim() || undefined,
        })
        setInstances((prev) => prev.map((i) => (i.id === id ? updated : i)))
        dialog.close()
        toast.success("Instancia actualizada")
      } catch (e) {
        toast.error("No se pudo actualizar la instancia", { description: formatError(e) })
      }
    },
    [dialog]
  )

  const handleDeleteInstance = useCallback(
    async (id: string) => {
      try {
        await deleteProviderInstance(id)
        setInstances((prev) => prev.filter((i) => i.id !== id))
        if (selectedInstanceId === id) setSelectedInstanceId(null)
        toast.success("Instancia eliminada")
      } catch (e) {
        toast.error("No se pudo eliminar la instancia", { description: formatError(e) })
      }
    },
    [selectedInstanceId]
  )

  const handleDialogSave = useCallback(
    (name: string, url: string, apiKey: string) => {
      if (dialog.state.mode === "edit" && dialog.state.editingInstance) {
        void handleUpdateInstance(dialog.state.editingInstance.id, name, url, apiKey)
      } else {
        void handleCreateInstance(name, url, apiKey)
      }
    },
    [dialog.state, handleCreateInstance, handleUpdateInstance]
  )

  const selectedInstanceName = useMemo(() => {
    if (!defaultConfig.providerInstanceId) return null
    return instances.find((i) => i.id === defaultConfig.providerInstanceId)?.name ?? null
  }, [defaultConfig.providerInstanceId, instances])

  const ollamaReady = ollamaStatus === "available"
  const openaiReady = openaiStatus === "available" && !!selectedInstanceId
  const ollamaDirty = ollamaModel.trim() !== (defaultConfig.provider === "ollama" ? defaultConfig.model ?? "" : "")
  const openaiDirty =
    openaiModel.trim() !== (defaultConfig.provider === "openai-compatible" ? defaultConfig.model ?? "" : "") ||
    selectedInstanceId !== defaultConfig.providerInstanceId
  const canSaveOllama = ollamaEnabled && ollamaReady && ollamaModel.trim() !== "" && ollamaDirty
  const canSaveOpenAI = openaiEnabled && openaiReady && openaiModel.trim() !== "" && openaiDirty
  const canSave = canSaveOllama || canSaveOpenAI

  const handleSave = useCallback(
    async (force: boolean) => {
      const pickOllama = canSaveOllama
      const provider: ProviderId = pickOllama ? "ollama" : "openai-compatible"
      const model = (pickOllama ? ollamaModel : openaiModel).trim()
      const providerInstanceId = pickOllama ? null : selectedInstanceId
      if (provider === "openai-compatible" && !providerInstanceId) {
        toast.error("Selecciona una instancia antes de guardar")
        return
      }
      setSaving(true)
      const body: ConfigureDefaultProviderInput = {
        provider,
        providerInstanceId,
        model,
        ...(force ? { force: true } : {}),
      }
      try {
        const result = await configureDefaultProvider(body)
        setDefaultConfig(result)
        toast.success("Proveedor por defecto actualizado", {
          description: `${result.provider}${result.providerInstanceId ? " · instancia" : ""} · ${result.model}`,
        })
        setForceSaveAvailable(false)
      } catch (e) {
        if (isError(e) && e.code === "PROVIDER_CONNECTION_FAILED") {
          toast.warning("El proveedor no responde", {
            description:
              "Reintenta cuando esté activo o pulsa 'Guardar de todos modos' para forzar el guardado.",
          })
          setForceSaveAvailable(true)
        } else {
          toast.error("No se pudo guardar el proveedor por defecto", {
            description: formatError(e),
          })
        }
      } finally {
        setSaving(false)
      }
    },
    [canSaveOllama, ollamaModel, openaiModel, selectedInstanceId]
  )

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Proveedor por defecto</h1>
        <p className="text-muted-foreground text-sm">
          Configura qué modelo de IA usará la aplicación por defecto. Los
          proveedores se validan al pulsar Probar.
        </p>
        <CurrentConfigPill
          provider={defaultConfig.provider}
          instanceName={selectedInstanceName}
          model={defaultConfig.model}
        />
      </header>

      {ollamaEnabled ? (
        <ProviderCard
          providerId="ollama"
          status={ollamaStatus}
          statusMessage={ollamaMessage}
          verifying={ollamaVerifying}
          onVerify={() => void verifyOllama()}
          model={ollamaModel}
          models={ollamaModels}
          modelsLoading={ollamaModelsLoading}
          onModelChange={setOllamaModel}
        />
      ) : null}

      {openaiEnabled ? (
        <ProviderCard
          providerId="openai-compatible"
          status={openaiStatus}
          statusMessage={openaiMessage}
          verifying={openaiVerifying}
          onVerify={() => { if (selectedInstanceId) void verifyOpenAIForInstance(selectedInstanceId) }}
          verifyDisabled={!selectedInstanceId}
          model={openaiModel}
          models={openaiModels}
          modelsLoading={openaiModelsLoading}
          onModelChange={setOpenaiModel}
          instances={instances}
          selectedInstanceId={selectedInstanceId}
          onSelectInstance={handleSelectInstance}
          onEditInstance={dialog.openEdit}
          onDeleteInstance={(id) => void handleDeleteInstance(id)}
          onCreateInstance={dialog.openCreate}
        />
      ) : null}

      {canSave || forceSaveAvailable ? (
        <>
          <Separator />
          <div className="flex flex-wrap items-center justify-end gap-2">
            {forceSaveAvailable ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleSave(true)}
                disabled={saving}
              >
                Guardar de todos modos
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={() => void handleSave(false)}
              disabled={!canSave || saving}
            >
              {saving ? <Spinner /> : null}
              Guardar como predeterminado
            </Button>
          </div>
        </>
      ) : null}

      <InstanceFormDialog
        open={dialog.state.open}
        mode={dialog.state.mode}
        initialName={dialog.state.editingInstance?.name ?? ""}
        initialUrl={dialog.state.editingInstance?.url ?? ""}
        initialApiKey=""
        onClose={dialog.close}
        onSave={handleDialogSave}
      />
    </div>
  )
}

function CurrentConfigPill({
  provider,
  instanceName,
  model,
}: {
  provider: ProviderId | null
  instanceName: string | null
  model: string | null
}) {
  if (provider === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline">Sin configurar</Badge>
        <span>Selecciona un proveedor y un modelo abajo, luego pulsa Guardar.</span>
      </div>
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted-foreground">Proveedor actual:</span>
      <Badge variant="secondary">
        {provider === "ollama" ? "Ollama" : instanceName ?? "OpenAI-compatible"}
      </Badge>
      {model ? (
        <code className="bg-muted rounded px-1.5 py-0.5 text-xs">{model}</code>
      ) : (
        <Badge variant="outline">Sin modelo</Badge>
      )}
    </div>
  )
}
