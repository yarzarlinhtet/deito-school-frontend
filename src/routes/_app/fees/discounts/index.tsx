import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, Tag, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { PageContainer, PageHeader } from '#/components/shared/page-layout'
import { StatsCard } from '#/components/shared/stats-card'
import { Button } from '#/components/ui/button'
import { DiscountTable } from '#/features/fees/components/DiscountTable'
import { DiscountModal } from '#/features/fees/components/DiscountModal'
import { useDiscounts } from '#/features/fees/hooks/useDiscounts'

export const Route = createFileRoute('/_app/fees/discounts/')({
  component: DiscountsPage,
})

function DiscountsPage() {
  const [createOpen, setCreateOpen] = useState(false)

  const { data: totalStats } = useDiscounts({ pagination: { page: 0, size: 1 } })
  const { data: activeStats } = useDiscounts({
    filters: [{ field: 'status', operator: 'EQ', value: 'ACTIVE' }],
    pagination: { page: 0, size: 1 },
  })
  const { data: inactiveStats } = useDiscounts({
    filters: [{ field: 'status', operator: 'EQ', value: 'INACTIVE' }],
    pagination: { page: 0, size: 1 },
  })
  const { data: expiredStats } = useDiscounts({
    filters: [{ field: 'status', operator: 'EQ', value: 'EXPIRED' }],
    pagination: { page: 0, size: 1 },
  })

  return (
    <PageContainer>
      <PageHeader
        title="Discounts"
        description="Scholarships, concessions, and promotional discounts"
        actions={
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="size-4" />
            New Discount
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Discounts" value={totalStats?.total ?? 0} icon={Tag} />
        <StatsCard title="Active" value={activeStats?.total ?? 0} icon={CheckCircle2} />
        <StatsCard title="Inactive" value={inactiveStats?.total ?? 0} icon={XCircle} />
        <StatsCard title="Expired" value={expiredStats?.total ?? 0} icon={Clock} />
      </div>

      <DiscountTable />

      <DiscountModal open={createOpen} onOpenChange={setCreateOpen} />
    </PageContainer>
  )
}
