import { createFileRoute, useParams } from '@tanstack/react-router'
import { StudentActivityTab } from '#/features/students/components/StudentActivityTab'

export const Route = createFileRoute('/_app/students/$studentId/activity')({
  component: StudentActivityPage,
})

function StudentActivityPage() {
  const { studentId } = useParams({ from: '/_app/students/$studentId/activity' })
  return <StudentActivityTab studentId={studentId} />
}
