import { createFileRoute, useParams } from '@tanstack/react-router'
import { Skeleton } from '#/components/ui/skeleton'
import { StudentProfileTab } from '#/features/students/components/StudentProfileTab'
import { useStudentDetail } from '#/features/students/hooks/useStudents'

export const Route = createFileRoute('/_app/students/$studentId/profile')({
  component: StudentProfilePage,
})

function StudentProfilePage() {
  const { studentId } = useParams({ from: '/_app/students/$studentId/profile' })
  const { data: student, isLoading } = useStudentDetail(studentId)

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!student) {
    return <p className="text-sm text-muted-foreground">Student not found.</p>
  }

  return <StudentProfileTab student={student} />
}
