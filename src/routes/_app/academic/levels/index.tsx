import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, Layers, CheckCircle2, XCircle } from 'lucide-react'
import { PageContainer } from '#/components/shared/page-layout'
import { PageHeader } from '#/components/shared/page-layout'
import { StatsCard } from '#/components/shared/stats-card'
import { Button } from '#/components/ui/button'
import { ProgramLevelTable } from '#/features/academic/components/ProgramLevelTable'
import { ProgramLevelModal } from '#/features/academic/components/ProgramLevelModal'
import { useProgramLevels } from '#/features/academic/hooks/useProgramLevels'

export const Route = createFileRoute('/_app/academic/levels/')({
  component: ProgramLevelsPage,
})

function ProgramLevelsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data: all } = useProgramLevels({ pagination: { page: 0, size: 200 } })

  const total = all?.total ?? 0
  const active = all?.items?.filter((l) => l.status === 'ACTIVE').length ?? 0
  const inactive = all?.items?.filter((l) => l.status === 'INACTIVE').length ?? 0

  return (
    <PageContainer>
      <PageHeader
        title="Program Levels"
        description="Manage levels within academic programs"
        actions={
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="size-4" />
            New Level
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatsCard title="Total Levels" value={total} icon={Layers} />
        <StatsCard title="Active" value={active} icon={CheckCircle2} />
        <StatsCard title="Inactive" value={inactive} icon={XCircle} />
      </div>

      <ProgramLevelTable />

      <ProgramLevelModal open={createOpen} onOpenChange={setCreateOpen} />
    </PageContainer>
  )
}
