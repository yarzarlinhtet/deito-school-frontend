import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, CalendarDays, CheckCircle2, XCircle } from 'lucide-react'
import { PageContainer } from '#/components/shared/page-layout'
import { PageHeader } from '#/components/shared/page-layout'
import { StatsCard } from '#/components/shared/stats-card'
import { Button } from '#/components/ui/button'
import { AcademicYearTable } from '#/features/enrollment/components/AcademicYearTable'
import { AcademicYearModal } from '#/features/enrollment/components/AcademicYearModal'
import { useAcademicYears } from '#/features/enrollment/hooks/useAcademicYears'

export const Route = createFileRoute('/_app/enrollment/academic-years/')({
  component: AcademicYearsPage,
})

function AcademicYearsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data: all } = useAcademicYears({ size: 100 })

  const total = all?.total ?? 0
  const active = all?.items?.filter((y) => y.status === 'ACTIVE').length ?? 0
  const inactive = all?.items?.filter((y) => y.status === 'INACTIVE').length ?? 0

  return (
    <PageContainer>
      <PageHeader
        title="Academic Years"
        description="Manage academic year configurations and enrollment periods"
        actions={
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="size-4" />
            New Academic Year
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatsCard title="Total Years" value={total} icon={CalendarDays} />
        <StatsCard title="Active" value={active} icon={CheckCircle2} />
        <StatsCard title="Inactive" value={inactive} icon={XCircle} />
      </div>

      <AcademicYearTable />

      <AcademicYearModal open={createOpen} onOpenChange={setCreateOpen} />
    </PageContainer>
  )
}
