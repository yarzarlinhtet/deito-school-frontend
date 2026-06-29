import { useCallback } from 'react'
import { academicYearControllerList } from '#/generated/academic-year-controller/academic-year-controller'
import type { AcademicYearResponse } from '#/generated/model'
import { EntitySelector } from '#/components/shared/entity-selector/EntitySelector'

interface AcademicYearSelectorProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function AcademicYearSelector({
  value,
  onValueChange,
  placeholder = 'Select academic year...',
  disabled,
  className,
}: AcademicYearSelectorProps) {
  const fetchOptions = useCallback(async (query: string) => {
    const res = await academicYearControllerList({ size: 50 })
    const items: AcademicYearResponse[] = res?.items ?? []
    return items
      .filter((y) => !query || y.name?.toLowerCase().includes(query.toLowerCase()))
      .map((y) => ({ value: y.id!, label: y.name ?? y.id! }))
  }, [])

  return (
    <EntitySelector
      value={value}
      onValueChange={onValueChange}
      fetchOptions={fetchOptions}
      placeholder={placeholder}
      searchPlaceholder="Search academic years..."
      disabled={disabled}
      className={className}
    />
  )
}
