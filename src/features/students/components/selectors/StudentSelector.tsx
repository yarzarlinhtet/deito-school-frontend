import { EntitySelector } from '#/components/shared/entity-selector'
import { studentControllerSearch } from '#/generated/student-controller/student-controller'

interface StudentSelectorProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function StudentSelector({
  value,
  onValueChange,
  placeholder = 'Search students...',
  className,
}: StudentSelectorProps) {
  async function fetchStudents(query: string) {
    const res = await studentControllerSearch({
      filters: query ? [{ field: 'fullName', operator: 'CONTAINS', value: query }] : [],
      pagination: { page: 0, size: 20 },
    })
    return (res.items ?? []).map((s) => ({
      value: s.id!,
      label: s.fullName ?? '',
      sublabel: s.studentNo,
    }))
  }

  return (
    <EntitySelector
      value={value}
      onValueChange={onValueChange}
      fetchOptions={fetchStudents}
      placeholder={placeholder}
      className={className}
    />
  )
}
