import { createFileRoute, useParams } from '@tanstack/react-router'
import { StudentFinanceTab } from '#/features/students/components/StudentFinanceTab'

export const Route = createFileRoute('/_app/students/$studentId/finance')({
  component: StudentFinancePage,
})

function StudentFinancePage() {
  const { studentId } = useParams({ from: '/_app/students/$studentId/finance' })
  return <StudentFinanceTab studentId={studentId} />
}
