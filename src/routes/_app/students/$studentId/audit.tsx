import { createFileRoute, useParams } from '@tanstack/react-router'
import { Skeleton } from '#/components/ui/skeleton'
import { StudentAuditTab } from '#/features/students/components/StudentAuditTab'
import { useStudentDetail } from '#/features/students/hooks/useStudents'

export const Route = createFileRoute('/_app/students/$studentId/audit')({
  component: ActivityPage,
})

function ActivityPage() {
  const { studentId } = useParams({ from: '/_app/students/$studentId/audit' })
  const { data: student, isLoading } = useStudentDetail(studentId)

  if (isLoading) return <Skeleton className="h-32 rounded-lg" />
  if (!student) return <p className="text-sm text-muted-foreground">Student not found.</p>

  return <StudentAuditTab student={student} />
}
