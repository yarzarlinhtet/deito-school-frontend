import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Users, UserCheck, GraduationCap } from 'lucide-react'
import { PageContainer } from '#/components/shared/page-layout'
import { PageHeader } from '#/components/shared/page-layout'
import { StatsCard } from '#/components/shared/stats-card'
import { Button } from '#/components/ui/button'
import { StudentFilters } from '#/features/students/components/StudentFilters'
import { StudentTable } from '#/features/students/components/StudentTable'
import { useStudents } from '#/features/students/hooks/useStudents'
import type { StudentListParams } from '#/features/students/types'
import type { PaginationState } from '@tanstack/react-table'

export const Route = createFileRoute('/_app/students/')({
  component: StudentsPage,
})

function StudentsPage() {
  const [filters, setFilters] = useState<StudentListParams>({})
  const [appliedFilters, setAppliedFilters] = useState<StudentListParams>({})
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const { data: statsData } = useStudents({ pageSize: 1 })

  return (
    <PageContainer>
      <PageHeader
        title="Students"
        description="Manage student records, profiles, and enrollment information"
        actions={
          <Button asChild className="gap-2">
            <Link to={'/students/new' as any}>
              <Plus className="size-4" />
              Enroll Student
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Students" value={statsData?.total ?? 0} icon={Users} />
        <StatsCard title="Active" value="—" icon={UserCheck} />
        <StatsCard title="New Admissions" value="—" icon={Plus} />
        <StatsCard title="Graduated" value="—" icon={GraduationCap} />
      </div>

      <div className="space-y-4">
        <StudentFilters
          values={filters}
          onChange={setFilters}
          onApply={() => { setAppliedFilters(filters); setPagination((p) => ({ ...p, pageIndex: 0 })) }}
          onReset={() => { setFilters({}); setAppliedFilters({}) }}
        />

        <StudentTable
          filters={appliedFilters}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </div>
    </PageContainer>
  )
}
