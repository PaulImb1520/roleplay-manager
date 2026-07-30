import { useCallback, useEffect, useRef, useState } from "react"

function buildStorageKey(key: string, scope: string): string {
  return `${key}:${scope}`
}

function readStorageValue<T>(storageKey: string, defaultValue: T, validate?: (value: unknown) => value is T): T {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw !== null) {
      const parsed = JSON.parse(raw) as unknown
      if (validate ? validate(parsed) : true) {
        return parsed as T
      }
    }
  } catch {
    // localStorage unavailable or corrupt value — stick with default
  }
  return defaultValue
}

export interface UsePersistedValueOptions<T> {
  scope: string
  key: string
  defaultValue: T
  validate?: (value: unknown) => value is T
}

export function usePersistedValue<T>({
  scope,
  key,
  defaultValue,
  validate,
}: UsePersistedValueOptions<T>): [T, React.Dispatch<React.SetStateAction<T>>] {
  const storageKey = buildStorageKey(key, scope)
  const [value, setValue] = useState<T>(defaultValue)
  const validateRef = useRef(validate)

  useEffect(() => {
    validateRef.current = validate
  }, [validate])

  useEffect(() => {
    const stored = readStorageValue(storageKey, defaultValue, validateRef.current)
    if (stored !== value) {
      setValue(stored)
    }
  }, [storageKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const setAndPersist = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (prev: T) => T)(prev) : next
        try {
          localStorage.setItem(storageKey, JSON.stringify(resolved))
        } catch {
          // localStorage unavailable
        }
        return resolved
      })
    },
    [storageKey],
  )

  return [value, setAndPersist]
}
