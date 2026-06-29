import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, BookOpen, CheckCircle2, XCircle } from 'lucide-react'
import { PageContainer } from '#/components/shared/page-layout'
import { PageHeader } from '#/components/shared/page-layout'
import { StatsCard } from '#/components/shared/stats-card'
import { Button } from '#/components/ui/button'
import { ProgramTable } from '#/features/academic/components/ProgramTable'
import { ProgramModal } from '#/features/academic/components/ProgramModal'
import { usePrograms } from '#/features/academic/hooks/usePrograms'

export const Route = createFileRoute('/_app/academic/programs/')({
  component: ProgramsPage,
})

function ProgramsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data: all } = usePrograms({ pagination: { page: 0, size: 200 } })

  const total = all?.total ?? 0
  const active = all?.items?.filter((p) => p.status === 'ACTIVE').length ?? 0
  const inactive = all?.items?.filter((p) => p.status === 'INACTIVE').length ?? 0

  return (
    <PageContainer>
      <PageHeader
        title="Programs"
        description="Manage academic programs and their configurations"
        actions={
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="size-4" />
            New Program
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatsCard title="Total Programs" value={total} icon={BookOpen} />
        <StatsCard title="Active" value={active} icon={CheckCircle2} />
        <StatsCard title="Inactive" value={inactive} icon={XCircle} />
      </div>

      <ProgramTable />

      <ProgramModal open={createOpen} onOpenChange={setCreateOpen} />
    </PageContainer>
  )
}
