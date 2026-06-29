import { createFileRoute } from '@tanstack/react-router'
import { StudentDocumentsTab } from '#/features/students/components/StudentDocumentsTab'

export const Route = createFileRoute('/_app/students/$studentId/documents')({
  component: StudentDocumentsPage,
})

function StudentDocumentsPage() {
  return <StudentDocumentsTab />
}
