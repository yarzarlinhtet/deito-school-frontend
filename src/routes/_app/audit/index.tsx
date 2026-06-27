import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '#/components/shared/page-layout/PageContainer'
import { PageHeader } from '#/components/shared/page-layout/PageHeader'

export const Route = createFileRoute('/_app/audit/')({
  component: AuditPage,
})

function AuditPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Audit Logs"
        description="System audit trail and activity history."
      />
    </PageContainer>
  )
}
