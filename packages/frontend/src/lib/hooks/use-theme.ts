import { createContext, useContext } from "react"

import {
  DEFAULT_COLOR_MODE,
  DEFAULT_THEME,
  isColorMode,
  isThemeId,
  type ColorMode,
  type ThemeId,
} from "../themes"

export const THEME_STORAGE_KEY = "theme"
export const MODE_STORAGE_KEY = "color-mode"

export type ResolvedColorMode = "light" | "dark"

export interface ThemeContextValue {
  theme: ThemeId
  mode: ColorMode
  resolvedMode: ResolvedColorMode
  setTheme: (theme: ThemeId) => void
  setMode: (mode: ColorMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function readStoredTheme(): ThemeId {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeId(raw) ? raw : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function readStoredMode(): ColorMode {
  try {
    const raw = localStorage.getItem(MODE_STORAGE_KEY)
    return isColorMode(raw) ? raw : DEFAULT_COLOR_MODE
  } catch {
    return DEFAULT_COLOR_MODE
  }
}

export function systemPrefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
