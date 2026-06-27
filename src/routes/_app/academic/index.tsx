import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '#/components/shared/page-layout/PageContainer'
import { PageHeader } from '#/components/shared/page-layout/PageHeader'

export const Route = createFileRoute('/_app/academic/')({
  component: AcademicPage,
})

function AcademicPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Academic"
        description="Academic programs, courses, and curriculum management."
      />
    </PageContainer>
  )
}
