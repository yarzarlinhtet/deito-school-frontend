import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, Users, CheckCircle2, Layers, LayoutGrid, List } from 'lucide-react'
import { PageContainer, PageHeader } from '#/components/shared/page-layout'
import { StatsCard } from '#/components/shared/stats-card'
import { Button } from '#/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { IntakeTable } from '#/features/enrollment/components/IntakeTable'
import { IntakeModal } from '#/features/enrollment/components/IntakeModal'
import { IntakeCard } from '#/features/enrollment/components/IntakeCard'
import { BatchTable } from '#/features/enrollment/components/BatchTable'
import { BatchModal } from '#/features/enrollment/components/BatchModal'
import { BatchCard } from '#/features/enrollment/components/BatchCard'
import { useIntakes } from '#/features/enrollment/hooks/useIntakes'
import { useBatches } from '#/features/enrollment/hooks/useBatches'
import { useAcademicYears } from '#/features/enrollment/hooks/useAcademicYears'
import type { IntakeResponse, BatchResponse } from '#/generated/model'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/_app/enrollment/intake-batch/')({
  component: IntakeBatchPage,
})

type Tab = 'intakes' | 'batches'
type ViewMode = 'card' | 'table'

function IntakeBatchPage() {
  const [activeTab, setActiveTab] = useState<Tab>('intakes')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [createIntakeOpen, setCreateIntakeOpen] = useState(false)
  const [createBatchOpen, setCreateBatchOpen] = useState(false)
  const [editIntake, setEditIntake] = useState<IntakeResponse | null>(null)
  const [editBatch, setEditBatch] = useState<BatchResponse | null>(null)

  // Stats
  const { data: allIntakes } = useIntakes({ pagination: { page: 0, size: 1 } })
  const { data: activeIntakes } = useIntakes({
    filters: [{ field: 'status', operator: 'EQ', value: 'ACTIVE' }],
    pagination: { page: 0, size: 1 },
  })
  const { data: allBatches } = useBatches({ pagination: { page: 0, size: 1 } })
  const { data: activeBatches } = useBatches({
    filters: [{ field: 'status', operator: 'EQ', value: 'ACTIVE' }],
    pagination: { page: 0, size: 1 },
  })

  // Card grid data
  const { data: intakeCards } = useIntakes({ pagination: { page: 0, size: 50 } })
  const { data: batchCards } = useBatches({ pagination: { page: 0, size: 50 } })

  // Lookup maps for labels
  const { data: academicYears } = useAcademicYears({ size: 100 })
  const ayMap = Object.fromEntries(
    (academicYears?.items ?? []).map((ay) => [ay.id, ay.name ?? ay.id])
  )
  const intakeNameMap = Object.fromEntries(
    (intakeCards?.items ?? []).map((i) => [i.id, i.name ?? i.id])
  )

  return (
    <PageContainer>
      <PageHeader
        title="Intake & Batches"
        description="Manage enrollment intakes, capacity allocations, and batch groupings"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCreateBatchOpen(true)} className="gap-2">
              <Plus className="size-4" />
              New Batch
            </Button>
            <Button onClick={() => setCreateIntakeOpen(true)} className="gap-2">
              <Plus className="size-4" />
              New Intake
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Intakes" value={allIntakes?.total ?? 0} icon={Users} />
        <StatsCard title="Active Intakes" value={activeIntakes?.total ?? 0} icon={CheckCircle2} />
        <StatsCard title="Total Batches" value={allBatches?.total ?? 0} icon={Layers} />
        <StatsCard title="Active Batches" value={activeBatches?.total ?? 0} icon={CheckCircle2} />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
        <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
          <TabsList>
            <TabsTrigger value="intakes">Intakes</TabsTrigger>
            <TabsTrigger value="batches">Batches</TabsTrigger>
          </TabsList>

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className={cn('size-8', viewMode === 'card' && 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground')}
              onClick={() => setViewMode('card')}
              title="Card view"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn('size-8', viewMode === 'table' && 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground')}
              onClick={() => setViewMode('table')}
              title="Table view"
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="intakes">
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(intakeCards?.items ?? []).map((intake) => (
                <IntakeCard
                  key={intake.id}
                  intake={intake}
                  academicYearName={intake.academicYearId ? ayMap[intake.academicYearId] : undefined}
                  onEdit={(i) => setEditIntake(i)}
                  onViewBatches={() => setActiveTab('batches')}
                />
              ))}
              {(intakeCards?.items ?? []).length === 0 && (
                <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
                  No intakes found. Create your first intake.
                </p>
              )}
            </div>
          ) : (
            <IntakeTable />
          )}
        </TabsContent>

        <TabsContent value="batches">
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(batchCards?.items ?? []).map((batch) => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  intakeName={batch.intakeId ? intakeNameMap[batch.intakeId] : undefined}
                  onEdit={(b) => setEditBatch(b)}
                />
              ))}
              {(batchCards?.items ?? []).length === 0 && (
                <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
                  No batches found. Create your first batch.
                </p>
              )}
            </div>
          ) : (
            <BatchTable />
          )}
        </TabsContent>
      </Tabs>

      {/* Create modals */}
      <IntakeModal open={createIntakeOpen} onOpenChange={setCreateIntakeOpen} />
      <BatchModal open={createBatchOpen} onOpenChange={setCreateBatchOpen} />

      {/* Edit modals (triggered from cards) */}
      <IntakeModal
        open={!!editIntake}
        onOpenChange={(v) => { if (!v) setEditIntake(null) }}
        editTarget={editIntake ?? undefined}
      />
      <BatchModal
        open={!!editBatch}
        onOpenChange={(v) => { if (!v) setEditBatch(null) }}
        editTarget={editBatch ?? undefined}
      />
    </PageContainer>
  )
}
