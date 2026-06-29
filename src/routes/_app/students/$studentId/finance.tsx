import { createFileRoute } from '@tanstack/react-router'
import { StudentFinanceTab } from '#/features/students/components/StudentFinanceTab'

export const Route = createFileRoute('/_app/students/$studentId/finance')({
  component: FinancePage,
})

function FinancePage() {
  const { studentId } = Route.useParams()
  return <StudentFinanceTab studentId={studentId} />
}
