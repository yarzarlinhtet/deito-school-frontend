import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '#/components/shared/page-layout/PageContainer'
import { PageHeader } from '#/components/shared/page-layout/PageHeader'

export const Route = createFileRoute('/_app/finance/')({
  component: FinancePage,
})

function FinancePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Finance"
        description="Revenue, collections, outstanding balances, and financial reporting."
      />
    </PageContainer>
  )
}
