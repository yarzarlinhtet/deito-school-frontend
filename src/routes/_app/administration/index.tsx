import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '#/components/shared/page-layout/PageContainer'
import { PageHeader } from '#/components/shared/page-layout/PageHeader'

export const Route = createFileRoute('/_app/administration/')({
  component: AdministrationPage,
})

function AdministrationPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Administration"
        description="School configuration, user management, and system settings."
      />
    </PageContainer>
  )
}
