import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { PaginationState } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { PageContainer } from '#/components/shared/page-layout/PageContainer'
import { PageHeader } from '#/components/shared/page-layout/PageHeader'
import { PermissionGuard } from '#/components/shared/permission-guard'
import { Button } from '#/components/ui/button'
import { PERMISSIONS } from '#/constants/permissions'
import { UserFilters } from '#/features/administration/components/UserFilters'
import { UserTable } from '#/features/administration/components/UserTable'
import { UserFormDialog } from '#/features/administration/components/UserFormDialog'
import { EMPTY_USER_FILTERS } from '#/features/administration/types'
import type { UserFilterValues } from '#/features/administration/types'

export const Route = createFileRoute('/_app/users-access/user-list/')({
  component: UserListPage,
})

function UserListPage() {
  const [filters, setFilters] = useState<UserFilterValues>(EMPTY_USER_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<UserFilterValues>(EMPTY_USER_FILTERS)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [createOpen, setCreateOpen] = useState(false)

  function handleApply() {
    setAppliedFilters(filters)
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  function handleReset() {
    setFilters(EMPTY_USER_FILTERS)
    setAppliedFilters(EMPTY_USER_FILTERS)
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN.USER.VIEW}>
      <PageContainer>
        <PageHeader
          title="User Administration"
          description="Manage user accounts, roles, and access control."
          actions={
            <PermissionGuard permission={PERMISSIONS.ADMIN.USER.CREATE}>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1.5 size-4" />
                Add User
              </Button>
            </PermissionGuard>
          }
        />

        <div className="space-y-4">
          <UserFilters
            values={filters}
            onChange={setFilters}
            onApply={handleApply}
            onReset={handleReset}
          />

          <UserTable
            appliedFilters={appliedFilters}
            pagination={pagination}
            onPaginationChange={setPagination}
          />
        </div>

        <UserFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      </PageContainer>
    </PermissionGuard>
  )
}
