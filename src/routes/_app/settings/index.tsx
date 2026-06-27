import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '#/components/shared/page-layout/PageContainer'
import { PageHeader } from '#/components/shared/page-layout/PageHeader'

export const Route = createFileRoute('/_app/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Application preferences and account settings."
      />
    </PageContainer>
  )
}
