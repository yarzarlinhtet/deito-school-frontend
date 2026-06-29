import { useCallback } from 'react'
import { batchControllerSearch } from '#/generated/batch-controller/batch-controller'
import { FilterCriteriaOperator } from '#/generated/model'
import { EntitySelector } from '#/components/shared/entity-selector/EntitySelector'

interface BatchSelectorProps {
  value: string
  onValueChange: (value: string) => void
  intakeId?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function BatchSelector({
  value,
  onValueChange,
  intakeId,
  placeholder = 'Select batch...',
  disabled,
  className,
}: BatchSelectorProps) {
  const fetchOptions = useCallback(async (query: string) => {
    if (!intakeId) return []
    const filters = [
      { field: 'intakeId', operator: FilterCriteriaOperator.EQ, value: intakeId },
      ...(query ? [{ field: 'name', operator: FilterCriteriaOperator.CONTAINS, value: query }] : []),
    ]
    const res = await batchControllerSearch({
      filters,
      pagination: { page: 0, size: 50 },
    })
    return (res?.items ?? []).map((b) => ({
      value: b.id!,
      label: b.name ?? b.id!,
      sublabel: b.code,
    }))
  }, [intakeId])

  return (
    <EntitySelector
      value={value}
      onValueChange={onValueChange}
      fetchOptions={fetchOptions}
      placeholder={placeholder}
      searchPlaceholder="Search batches..."
      disabled={disabled || !intakeId}
      className={className}
    />
  )
}
