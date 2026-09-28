import type { CharacterExport } from "@workspace/shared/types/export"
import {
  EXPORT_KIND,
  EXPORT_SCHEMA_VERSION,
} from "@workspace/shared/types/export"

export type ParseCharacterExportResult =
  | { ok: true; payload: CharacterExport }
  | { ok: false; error: string }

export function parseCharacterExport(text: string): ParseCharacterExportResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: "El archivo no es un JSON válido." }
  }

  if (!data || typeof data !== "object") {
    return { ok: false, error: "El archivo no contiene un objeto JSON válido." }
  }

  const payload = data as Partial<CharacterExport>

  if (payload.kind !== EXPORT_KIND) {
    return {
      ok: false,
      error: "El archivo no es una exportación de personaje compatible.",
    }
  }

  if (payload.schemaVersion !== EXPORT_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Versión de archivo no soportada (${payload.schemaVersion ?? "desconocida"}). Se esperaba ${EXPORT_SCHEMA_VERSION}.`,
    }
  }

  if (!payload.character?.name) {
    return { ok: false, error: "El archivo no incluye el nombre del personaje." }
  }

  if (!payload.definition && (!payload.versions || payload.versions.length === 0)) {
    return {
      ok: false,
      error: "El archivo no contiene la definición del personaje.",
    }
  }

  return { ok: true, payload: payload as CharacterExport }
}
