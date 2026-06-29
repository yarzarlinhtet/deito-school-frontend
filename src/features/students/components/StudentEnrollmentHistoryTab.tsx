import { BookOpen } from 'lucide-react'
import { StatusBadge } from '#/components/shared/status-badge'
import { Skeleton } from '#/components/ui/skeleton'
import { useStudentEnrollments } from '../hooks/useStudentEnrollments'

const ENROLLMENT_STATUS_MAP: Record<string, string> = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  COMPLETED: 'completed',
  GRADUATED: 'completed',
  TRANSFERRED: 'info',
  WITHDRAWN: 'inactive',
}

const ENROLLMENT_TYPE_LABEL: Record<string, string> = {
  SELF_ENROLL: 'Self Enroll',
  AGENT: 'Agent',
}

interface StudentEnrollmentHistoryTabProps {
  studentId: string
}

export function StudentEnrollmentHistoryTab({ studentId }: StudentEnrollmentHistoryTabProps) {
  const { data: enrollments, isLoading } = useStudentEnrollments(studentId)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!enrollments?.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center rounded-lg border border-dashed">
        <BookOpen className="size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No enrollment history found.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Enrollment Date</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Type</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Status</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Remarks</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {enrollments.map((enrollment) => (
            <tr key={enrollment.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {enrollment.enrollmentDate ?? '—'}
              </td>
              <td className="px-4 py-3 text-sm">
                {enrollment.enrollmentType
                  ? (ENROLLMENT_TYPE_LABEL[enrollment.enrollmentType] ?? enrollment.enrollmentType)
                  : '—'}
              </td>
              <td className="px-4 py-3">
                {enrollment.status ? (
                  <StatusBadge
                    status={ENROLLMENT_STATUS_MAP[enrollment.status] ?? 'inactive'}
                    label={enrollment.status.charAt(0) + enrollment.status.slice(1).toLowerCase()}
                  />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                {enrollment.remarks ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
