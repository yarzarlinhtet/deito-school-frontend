import { createFileRoute, useParams } from '@tanstack/react-router'
import { StudentAcademicTab } from '#/features/students/components/StudentAcademicTab'

export const Route = createFileRoute('/_app/students/$studentId/enrollment-history')({
  component: AcademicPage,
})

function AcademicPage() {
  const { studentId } = useParams({ from: '/_app/students/$studentId/enrollment-history' })
  return <StudentAcademicTab studentId={studentId} />
}
