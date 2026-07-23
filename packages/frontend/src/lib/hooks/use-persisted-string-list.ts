import { usePersistedValue } from "./use-persisted-value"

export interface UsePersistedStringListOptions {
  scope: string
  key: string
  defaultValue: string[]
  validateItem?: (value: string) => boolean
}

export function usePersistedStringList({
  scope,
  key,
  defaultValue,
  validateItem,
}: UsePersistedStringListOptions) {
  return usePersistedValue<string[]>({
    scope,
    key,
    defaultValue,
    validate: (raw): raw is string[] => {
      if (!Array.isArray(raw)) return false
      if (validateItem) {
        return raw.every((item) => typeof item === "string" && validateItem(item))
      }
      return raw.every((item) => typeof item === "string")
    },
  })
}
