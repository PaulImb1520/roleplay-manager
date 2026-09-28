import { SearchIcon } from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import type { CharacterSortKey } from "@/lib/sort-characters"

const SORT_OPTIONS: { value: CharacterSortKey; label: string }[] = [
  { value: "recency-desc", label: "Más recientes" },
  { value: "recency-asc", label: "Más antiguos" },
  { value: "activity-desc", label: "Última actividad: recientes" },
  { value: "activity-asc", label: "Última actividad: antiguos" },
]

interface CharacterListToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  sort: CharacterSortKey
  onSortChange: (value: CharacterSortKey) => void
  resultCount: number
}

export function CharacterListToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  resultCount,
}: CharacterListToolbarProps) {
  const selectedLabel =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ??
    SORT_OPTIONS[0].label
  const searching = search.trim().length > 0

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar personaje…"
          aria-label="Buscar personaje"
          className="pl-8"
        />
      </div>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        {searching ? (
          <span className="text-muted-foreground text-sm whitespace-nowrap">
            {resultCount} resultado{resultCount !== 1 ? "s" : ""}
          </span>
        ) : null}
        <Select
          value={sort}
          onValueChange={(value) => {
            if (value) {
              onSortChange(value as CharacterSortKey)
            }
          }}
        >
          <SelectTrigger
            className="w-full sm:w-64"
            aria-label="Ordenar por"
          >
            <SelectValue>{selectedLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
