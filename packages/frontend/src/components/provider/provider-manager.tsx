/* eslint-disable react-hooks/set-state-in-effect --
   El effect lanza una carga asincrona de modelos al cambiar el proveedor
   seleccionado. El setModelsLoading(true) marca el estado de carga
   inmediato; el setModels(result) se aplica solo si la carga no fue
   cancelada por un cambio de selected. Patron canonico para fetch
   disparado por efecto. */
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
import { AlertCircleIcon, CheckCircle2Icon, RefreshCwIcon } from "lucide-react"

import type {
  ConfigureDefaultProviderInput,
  DefaultProviderConfig,
  ListModelsResult,
  OpenAICompatibleConfig,
  ProviderId,
  ProviderStatus,
} from "@workspace/shared/types/provider"

import {
  configureDefaultProvider,
  getDefaultProvider,
  getOpenAICompatibleConfig,
  setOpenAICompatibleConfig,
} from "@/lib/api/settings"
import {
  listProviders,
  listProviderModels,
  validateProvider,
} from "@/lib/api/providers"
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
    useState<DefaultProviderConfig>({ provider: null, model: null })
  const [selected, setSelected] = useState<ProviderId>("ollama")
  const [models, setModels] = useState<ListModelsResult | null>(null)
  const [modelsLoading, setModelsLoading] = useState(false)
  const [openaiCfg, setOpenaiCfg] = useState<OpenAICompatibleConfig>({
    url: "",
    hasApiKey: false,
  })
  const [openaiUrlInput, setOpenaiUrlInput] = useState("")
  const [openaiKeyInput, setOpenaiKeyInput] = useState("")
  const [modelInput, setModelInput] = useState("")
  const [savingDefault, setSavingDefault] = useState(false)

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
        const [ids, def, oaCfg] = await Promise.all([
          listProviders(),
          getDefaultProvider(),
          getOpenAICompatibleConfig(),
        ])
        setRegisteredIds(ids.map((p) => p.id))
        setDefaultConfig(def)
        setOpenaiCfg(oaCfg)
        setOpenaiUrlInput(oaCfg.url)
        if (def.provider) setSelected(def.provider)
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

  const handleVerify = async () => {
    if (selected === "openai-compatible" && openaiCfg.url === "") {
      toast.error("Guarda primero la configuracion del proveedor", {
        description:
          "La URL base debe estar guardada antes de verificar la conexion.",
      })
      return
    }
    setStatuses((prev) => ({ ...prev, [selected]: "loading" }))
    try {
      const r = await validateProvider(selected)
      setStatuses((prev) => ({ ...prev, [selected]: r.status }))
      if (r.status === "available") {
        toast.success("Conexion exitosa", {
          description: `El proveedor ${selected} esta disponible.`,
        })
      } else {
        toast.warning("Proveedor no disponible", {
          description:
            r.message ??
            `El proveedor ${selected} respondio pero no esta operativo.`,
        })
      }
    } catch (e) {
      setStatuses((prev) => ({ ...prev, [selected]: "unavailable" }))
      toast.error("No se pudo verificar la conexion", {
        description: formatError(e),
      })
    }
  }

  const handleSaveOpenAI = async () => {
    try {
      await setOpenAICompatibleConfig({
        url: openaiUrlInput,
        apiKey: openaiKeyInput === "" ? undefined : openaiKeyInput,
      })
      const fresh = await getOpenAICompatibleConfig()
      setOpenaiCfg(fresh)
      setOpenaiKeyInput("")
      toast.success("Configuracion de OpenAI-compatible guardada")
      void refreshAllStatuses()
    } catch (e) {
      toast.error("No se pudo guardar la configuracion", {
        description: formatError(e),
      })
    }
  }

  const handleSaveDefault = async (force: boolean) => {
    const model = modelInput.trim()
    if (model === "") {
      toast.error("Indica un modelo antes de guardar")
      return
    }
    setSavingDefault(true)
    const body: ConfigureDefaultProviderInput = {
      provider: selected,
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
            <CardTitle>Configuracion del proveedor OpenAI-compatible</CardTitle>
            <CardDescription>
              URL base del proveedor (por ejemplo, http://localhost:1234/v1).
              La API key es opcional: si tu proveedor no requiere
              autenticacion, dejala en blanco.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="openai-url">URL base</FieldLabel>
                <Input
                  id="openai-url"
                  type="url"
                  placeholder="http://localhost:1234/v1"
                  value={openaiUrlInput}
                  onChange={(e) => setOpenaiUrlInput(e.target.value)}
                />
                <FieldDescription>
                  Actual: {openaiCfg.url === "" ? "(no configurada)" : openaiCfg.url}
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="openai-key">API key</FieldLabel>
                <Input
                  id="openai-key"
                  type="password"
                  placeholder={openaiCfg.hasApiKey ? "(dejada, introduce una nueva para cambiarla)" : "sk-..."}
                  value={openaiKeyInput}
                  onChange={(e) => setOpenaiKeyInput(e.target.value)}
                />
                <FieldDescription>
                  {openaiCfg.hasApiKey
                    ? "Ya hay una API key guardada. Introduce una nueva solo si quieres reemplazarla."
                    : "No hay API key guardada."}
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void handleSaveOpenAI()}>
              Guardar configuracion
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleVerify()}
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
              <strong>{defaultConfig.provider}</strong> &middot;{" "}
              <code className="bg-muted rounded px-1 py-0.5 text-xs">
                {defaultConfig.model}
              </code>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
