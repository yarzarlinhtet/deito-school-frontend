import { createFileRoute, useParams } from '@tanstack/react-router'
import { StudentDocumentsTab } from '#/features/students/components/StudentDocumentsTab'

export const Route = createFileRoute('/_app/students/$studentId/documents')({
  component: StudentDocumentsPage,
})

function StudentDocumentsPage() {
  const { studentId } = useParams({ from: '/_app/students/$studentId/documents' })
  return <StudentDocumentsTab studentId={studentId} />
}
