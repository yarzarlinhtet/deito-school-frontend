import { createFileRoute, useParams } from '@tanstack/react-router'
import { Skeleton } from '#/components/ui/skeleton'
import { StudentAcademicTab } from '#/features/students/components/StudentAcademicTab'
import { useStudent } from '#/features/students/hooks/useStudents'

export const Route = createFileRoute('/_app/students/$studentId/academic')({
  component: StudentAcademicPage,
})

function StudentAcademicPage() {
  const { studentId } = useParams({ from: '/_app/students/$studentId/academic' })
  const { data: student, isLoading } = useStudent(studentId)

  if (isLoading) return <Skeleton className="h-64 rounded-lg" />
  if (!student) return <p className="text-sm text-muted-foreground">Student not found.</p>

  return <StudentAcademicTab student={student} />
}
