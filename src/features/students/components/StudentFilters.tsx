import { FilterBar } from '#/components/shared/filter-bar'
import type { FilterDef } from '#/components/shared/filter-bar'
import type { StudentListParams } from '../types'

const FILTERS: FilterDef[] = [
  { key: 'studentId', label: 'Student ID', type: 'text', placeholder: 'e.g. STU-001' },
  { key: 'search', label: 'Student Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'className', label: 'Class', type: 'text', placeholder: 'e.g. Grade 10' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'enrolled', label: 'Enrolled' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'suspended', label: 'Suspended' },
      { value: 'graduated', label: 'Graduated' },
    ],
  },
]

interface StudentFiltersProps {
  values: StudentListParams
  onChange: (values: StudentListParams) => void
  onApply: () => void
  onReset: () => void
}

export function StudentFilters({
  values,
  onChange,
  onApply,
  onReset,
}: StudentFiltersProps) {
  return (
    <FilterBar
      filters={FILTERS}
      values={values as Record<string, string>}
      onChange={(key, value) => onChange({ ...values, [key]: value, page: 1 })}
      onApply={onApply}
      onReset={onReset}
    />
  )
}
