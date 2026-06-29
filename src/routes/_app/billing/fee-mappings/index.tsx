import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '#/components/shared/page-layout'
import { PageHeader } from '#/components/shared/page-layout'
import { FeeMappingPage } from '#/features/billing/components/FeeMappingPage'

export const Route = createFileRoute('/_app/billing/fee-mappings/')({
  component: FeeMappingIndexPage,
})

function FeeMappingIndexPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Fee Template Mapping"
        description="Configure which fee template applies when a student enrolls into a program level."
      />
      <FeeMappingPage />
    </PageContainer>
  )
}
