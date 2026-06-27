import { createFileRoute, useParams } from '@tanstack/react-router'
import { StudentVisaTab } from '#/features/students/components/StudentVisaTab'

export const Route = createFileRoute('/_app/students/$studentId/visa')({
  component: StudentVisaPage,
})

function StudentVisaPage() {
  const { studentId } = useParams({ from: '/_app/students/$studentId/visa' })
  return <StudentVisaTab studentId={studentId} />
}
