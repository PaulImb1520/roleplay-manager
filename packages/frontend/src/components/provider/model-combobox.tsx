import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@workspace/ui/components/combobox"

import type { ProviderModel } from "@workspace/shared/types/provider"

interface ModelComboboxProps {
  value: string
  models: ProviderModel[]
  disabled?: boolean
  placeholder?: string
  onChange: (value: string) => void
}

export function ModelCombobox({
  value,
  models,
  disabled = false,
  placeholder = "Selecciona un modelo",
  onChange,
}: ModelComboboxProps) {
  return (
    <Combobox
      items={models}
      value={value || null}
      onValueChange={(v) => onChange(v ?? "")}
      inputValue={value}
      onInputValueChange={(v) => {
        if (v !== value) onChange(v)
      }}
    >
      <ComboboxInput
        disabled={disabled}
        placeholder={placeholder}
        className="w-full"
      />
      <ComboboxContent>
        <ComboboxList>
          {(m: ProviderModel) => (
            <ComboboxItem key={m.id} value={m.id}>
              {m.name ?? m.id}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No se encontraron modelos.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  )
}
