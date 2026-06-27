import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { ColumnDef, PaginationState, SortingState, RowSelectionState, OnChangeFn } from '@tanstack/react-table'
import { MoreHorizontal, Eye, UserX, Trash2, UserCheck } from 'lucide-react'
import { ServerTable } from '#/components/shared/data-table'
import { BulkActionsBar } from '#/components/shared/data-table'
import { StatusBadge } from '#/components/shared/status-badge'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Checkbox } from '#/components/ui/checkbox'
import { PermissionGuard } from '#/components/shared/permission-guard'
import { PERMISSIONS } from '#/constants/permissions'
import { useStudents, useDeactivateStudent, useDeleteStudent } from '../hooks/useStudents'
import type { Student, StudentListParams } from '../types'

interface StudentTableProps {
  filters: StudentListParams
  onPaginationChange: OnChangeFn<PaginationState>
  pagination: PaginationState
}

const STATUS_MAP: Record<Student['status'], string> = {
  active: 'active',
  enrolled: 'pending',
  inactive: 'inactive',
  suspended: 'suspended',
  graduated: 'completed',
}

export function StudentTable({ filters, pagination, onPaginationChange }: StudentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const { data, isLoading } = useStudents({
    ...filters,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  })

  const deactivate = useDeactivateStudent()
  const deleteStudent = useDeleteStudent()

  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k])

  const columns: ColumnDef<Student>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'studentId',
      header: 'Student ID',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground">{getValue<string>()}</span>
      ),
    },
    {
      id: 'name',
      header: 'Student',
      cell: ({ row }) => {
        const s = row.original
        const initials = `${s.firstName[0]}${s.lastName[0]}`.toUpperCase()
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage src={s.avatarUrl} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <Link
                to="/students/$studentId/overview"
                params={{ studentId: s.id }}
                className="text-sm font-medium hover:underline text-foreground"
              >
                {s.fullName}
              </Link>
              <p className="text-xs text-muted-foreground">{s.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'className',
      header: 'Class',
      cell: ({ getValue }) => getValue<string>() ? (
        <Badge variant="outline" className="text-xs">{getValue<string>()}</Badge>
      ) : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: 'guardian',
      header: 'Parent / Guardian',
      cell: ({ row }) => {
        const s = row.original
        const guardian = s.father ?? s.mother
        return guardian ? (
          <div>
            <p className="text-sm">{guardian.fullName}</p>
            <p className="text-xs text-muted-foreground">{guardian.phone}</p>
          </div>
        ) : <span className="text-muted-foreground text-xs">—</span>
      },
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{getValue<string>() || '—'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue<Student['status']>()
        return <StatusBadge status={STATUS_MAP[s]} label={s.charAt(0).toUpperCase() + s.slice(1)} />
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const s = row.original
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8" asChild>
              <Link to="/students/$studentId/overview" params={{ studentId: s.id }}>
                <Eye className="size-4" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/students/$studentId/overview" params={{ studentId: s.id }}>
                    <Eye className="size-4 mr-2" />
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {s.status === 'active' || s.status === 'enrolled' ? (
                  <PermissionGuard permission={PERMISSIONS.STUDENT.PROFILE.UPDATE}>
                    <DropdownMenuItem
                      className="text-warning focus:text-warning"
                      onClick={() => deactivate.mutate(s.id)}
                    >
                      <UserX className="size-4 mr-2" />
                      Deactivate
                    </DropdownMenuItem>
                  </PermissionGuard>
                ) : (
                  <PermissionGuard permission={PERMISSIONS.STUDENT.PROFILE.UPDATE}>
                    <DropdownMenuItem onClick={() => deactivate.mutate(s.id)}>
                      <UserCheck className="size-4 mr-2" />
                      Activate
                    </DropdownMenuItem>
                  </PermissionGuard>
                )}
                <PermissionGuard permission={PERMISSIONS.STUDENT.PROFILE.DELETE}>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => deleteStudent.mutate(s.id)}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </PermissionGuard>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-2">
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClear={() => setRowSelection({})}
        actions={[
          {
            label: 'Export Selected',
            onClick: () => console.log('export', selectedIds),
          },
          {
            label: 'Change Status',
            onClick: () => console.log('change status', selectedIds),
          },
          {
            label: 'Delete Selected',
            variant: 'destructive',
            onClick: () => console.log('delete', selectedIds),
          },
        ]}
      />

      <ServerTable
        data={data?.data ?? []}
        columns={columns}
        isLoading={isLoading}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        sorting={sorting}
        onSortingChange={setSorting}
        rowCount={data?.total ?? 0}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </div>
  )
}
