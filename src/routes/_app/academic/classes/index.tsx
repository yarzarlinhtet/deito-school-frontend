import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, Users, CheckCircle2, XCircle } from 'lucide-react'
import { PageContainer } from '#/components/shared/page-layout'
import { PageHeader } from '#/components/shared/page-layout'
import { StatsCard } from '#/components/shared/stats-card'
import { Button } from '#/components/ui/button'
import { ClassTable } from '#/features/academic/components/ClassTable'
import { ClassModal } from '#/features/academic/components/ClassModal'
import { useClasses } from '#/features/academic/hooks/useClasses'

export const Route = createFileRoute('/_app/academic/classes/')({
  component: ClassesPage,
})

function ClassesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data: all } = useClasses({ pagination: { page: 0, size: 200 } })

  const total = all?.total ?? 0
  const active = all?.items?.filter((c) => c.status === 'ACTIVE').length ?? 0
  const inactive = all?.items?.filter((c) => c.status === 'CLOSED').length ?? 0

  return (
    <PageContainer>
      <PageHeader
        title="Classes"
        description="Manage classes within program levels"
        actions={
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="size-4" />
            New Class
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatsCard title="Total Classes" value={total} icon={Users} />
        <StatsCard title="Active" value={active} icon={CheckCircle2} />
        <StatsCard title="Closed" value={inactive} icon={XCircle} />
      </div>

      <ClassTable />

      <ClassModal open={createOpen} onOpenChange={setCreateOpen} />
    </PageContainer>
  )
}
