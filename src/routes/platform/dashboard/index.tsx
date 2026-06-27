import { createFileRoute } from '@tanstack/react-router'
import { Building2, Users, CreditCard, Activity } from 'lucide-react'
import { PageContainer } from '#/components/shared/page-layout/PageContainer'
import { PageHeader } from '#/components/shared/page-layout/PageHeader'
import { StatsCard } from '#/components/shared/stats-card/StatsCard'
import { useUserStore } from '#/stores/userStore'

export const Route = createFileRoute('/platform/dashboard/')({
  component: PlatformDashboardPage,
})

function PlatformDashboardPage() {
  const currentUser = useUserStore((state) => state.currentUser)

  return (
    <PageContainer>
      <PageHeader
        title="Platform Dashboard"
        description={`Welcome, ${currentUser?.user?.fullName ?? 'Admin'}. Platform overview.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Schools"
          value="—"
          icon={Building2}
          trend={{ value: 0, label: 'vs last month' }}
        />
        <StatsCard
          title="Total Users"
          value="—"
          icon={Users}
          trend={{ value: 0, label: 'vs last month' }}
        />
        <StatsCard
          title="Platform Revenue"
          value="—"
          icon={CreditCard}
          trend={{ value: 0, label: 'vs last month' }}
        />
        <StatsCard
          title="Active Sessions"
          value="—"
          icon={Activity}
          trend={{ value: 0, label: 'right now' }}
        />
      </div>
    </PageContainer>
  )
}
