import { useCallback } from 'react'
import { intakeControllerSearch } from '#/generated/intake-controller/intake-controller'
import { FilterCriteriaOperator } from '#/generated/model'
import { EntitySelector } from '#/components/shared/entity-selector/EntitySelector'

interface IntakeSelectorProps {
  value: string
  onValueChange: (value: string) => void
  academicYearId?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function IntakeSelector({
  value,
  onValueChange,
  academicYearId,
  placeholder = 'Select intake...',
  disabled,
  className,
}: IntakeSelectorProps) {
  const fetchOptions = useCallback(async (query: string) => {
    if (!academicYearId) return []
    const filters = [
      { field: 'academicYearId', operator: FilterCriteriaOperator.EQ, value: academicYearId },
      ...(query ? [{ field: 'name', operator: FilterCriteriaOperator.CONTAINS, value: query }] : []),
    ]
    const res = await intakeControllerSearch({
      filters,
      pagination: { page: 0, size: 50 },
    })
    return (res?.items ?? []).map((i) => ({
      value: i.id!,
      label: i.name ?? i.id!,
      sublabel: i.code,
    }))
  }, [academicYearId])

  return (
    <EntitySelector
      value={value}
      onValueChange={onValueChange}
      fetchOptions={fetchOptions}
      placeholder={placeholder}
      searchPlaceholder="Search intakes..."
      disabled={disabled || !academicYearId}
      className={className}
    />
  )
}
