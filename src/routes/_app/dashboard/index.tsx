import { createFileRoute } from '@tanstack/react-router'
import { Users, BookOpen, DollarSign, GraduationCap } from 'lucide-react'
import { PageContainer } from '#/components/shared/page-layout/PageContainer'
import { PageHeader } from '#/components/shared/page-layout/PageHeader'
import { StatsCard } from '#/components/shared/stats-card/StatsCard'
import { useUserStore } from '#/stores/userStore'

export const Route = createFileRoute('/_app/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const currentUser = useUserStore((state) => state.currentUser)

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${currentUser?.user?.fullName ?? 'User'}. Here's what's happening today.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value="—"
          icon={Users}
          trend={{ value: 0, label: 'vs last month' }}
        />
        <StatsCard
          title="Active Programs"
          value="—"
          icon={BookOpen}
          trend={{ value: 0, label: 'vs last month' }}
        />
        <StatsCard
          title="Revenue (MTD)"
          value="—"
          icon={DollarSign}
          trend={{ value: 0, label: 'vs last month' }}
        />
        <StatsCard
          title="Enrollments"
          value="—"
          icon={GraduationCap}
          trend={{ value: 0, label: 'vs last month' }}
        />
      </div>
    </PageContainer>
  )
}
