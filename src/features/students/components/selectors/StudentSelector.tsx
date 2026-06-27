import { EntitySelector } from '#/components/shared/entity-selector'
import { axiosInstance } from '#/lib/axios'
import type { Student } from '../../types'

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
    const res = await axiosInstance.get<{ data: Student[] }>('/students', {
      params: { search: query, pageSize: 20 },
    })
    return res.data.data.map((s) => ({
      value: s.id,
      label: s.fullName,
      sublabel: s.studentId,
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
