import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Users, UserCheck, UserX, GraduationCap } from 'lucide-react'
import { PageContainer } from '#/components/shared/page-layout'
import { PageHeader } from '#/components/shared/page-layout'
import { StatsCard } from '#/components/shared/stats-card'
import { Button } from '#/components/ui/button'
import { StudentFilters, type StudentFilterValues } from '#/features/students/components/StudentFilters'
import { StudentTable } from '#/features/students/components/StudentTable'
import { useStudents } from '#/features/students/hooks/useStudents'
import type { PaginationState } from '@tanstack/react-table'

export const Route = createFileRoute('/_app/students/')({
  component: StudentsPage,
})

const EMPTY_FILTERS: StudentFilterValues = {
  studentNo: '',
  fullName: '',
  passportNumber: '',
  telephoneNumber: '',
  nationality: '',
  gender: 'all',
  status: 'all',
}

function StudentsPage() {
  const [filters, setFilters] = useState<StudentFilterValues>(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<StudentFilterValues>(EMPTY_FILTERS)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const { data: total } = useStudents({ pagination: { page: 0, size: 1 } })
  const { data: active } = useStudents({
    filters: [{ field: 'status', operator: 'EQ', value: 'ACTIVE' }],
    pagination: { page: 0, size: 1 },
  })
  const { data: suspended } = useStudents({
    filters: [{ field: 'status', operator: 'EQ', value: 'SUSPENDED' }],
    pagination: { page: 0, size: 1 },
  })
  const { data: graduated } = useStudents({
    filters: [{ field: 'status', operator: 'EQ', value: 'GRADUATED' }],
    pagination: { page: 0, size: 1 },
  })

  return (
    <PageContainer>
      <PageHeader
        title="Students"
        description="Manage student records, profiles, and personal information"
        actions={
          <Button asChild className="gap-2">
            <Link to={'/students/new' as any}>
              <Plus className="size-4" />
              Add Student
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Students" value={total?.total ?? 0} icon={Users} />
        <StatsCard title="Active" value={active?.total ?? 0} icon={UserCheck} />
        <StatsCard title="Suspended" value={suspended?.total ?? 0} icon={UserX} />
        <StatsCard title="Graduated" value={graduated?.total ?? 0} icon={GraduationCap} />
      </div>

      <div className="space-y-4">
        <StudentFilters
          values={filters}
          onChange={setFilters}
          onApply={() => {
            setAppliedFilters(filters)
            setPagination((p) => ({ ...p, pageIndex: 0 }))
          }}
          onReset={() => {
            setFilters(EMPTY_FILTERS)
            setAppliedFilters(EMPTY_FILTERS)
          }}
        />

        <StudentTable
          filters={filters}
          appliedFilters={appliedFilters}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </div>
    </PageContainer>
  )
}
