import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from '#/lib/axios'
import { AuditTimeline, type AuditEntry } from '#/components/shared/audit-timeline'
import { Skeleton } from '#/components/ui/skeleton'

interface StudentActivityTabProps {
  studentId: string
}

export function StudentActivityTab({ studentId }: StudentActivityTabProps) {
  const { data: entries, isLoading } = useQuery({
    queryKey: ['students', studentId, 'activity'],
    queryFn: () =>
      axiosInstance
        .get<AuditEntry[]>(`/students/${studentId}/activity`)
        .then((r) => r.data),
    enabled: !!studentId,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
      </div>
    )
  }

  return (
    <AuditTimeline
      entries={entries ?? []}
      className="max-w-xl"
    />
  )
}
