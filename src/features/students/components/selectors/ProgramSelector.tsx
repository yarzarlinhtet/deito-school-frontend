import { useCallback } from 'react'
import { programControllerSearch } from '#/generated/program-controller/program-controller'
import { EntitySelector } from '#/components/shared/entity-selector/EntitySelector'

interface ProgramSelectorProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ProgramSelector({
  value,
  onValueChange,
  placeholder = 'Select program...',
  disabled,
  className,
}: ProgramSelectorProps) {
  const fetchOptions = useCallback(async (query: string) => {
    const res = await programControllerSearch({
      filters: query ? [{ field: 'name', operator: 'CONTAINS', value: query }] : [],
      pagination: { page: 0, size: 50 },
    })
    return (res?.items ?? []).map((p) => ({
      value: p.id!,
      label: p.name ?? p.id!,
      sublabel: p.code,
    }))
  }, [])

  return (
    <EntitySelector
      value={value}
      onValueChange={onValueChange}
      fetchOptions={fetchOptions}
      placeholder={placeholder}
      searchPlaceholder="Search programs..."
      disabled={disabled}
      className={className}
    />
  )
}
