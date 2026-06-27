import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '#/components/shared/page-layout/PageContainer'
import { PageHeader } from '#/components/shared/page-layout/PageHeader'

export const Route = createFileRoute('/_app/billing/')({
  component: BillingPage,
})

function BillingPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Billing"
        description="Invoices, fee accounts, and payment schedules."
      />
    </PageContainer>
  )
}
