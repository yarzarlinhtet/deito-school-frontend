import { useState, useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import type { ColumnDef, PaginationState, SortingState, OnChangeFn } from '@tanstack/react-table'
import { MoreHorizontal, Eye, Pencil, UserX, UserCheck } from 'lucide-react'
import { ServerTable } from '#/components/shared/data-table'
import { StatusBadge } from '#/components/shared/status-badge'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { PermissionGuard } from '#/components/shared/permission-guard'
import { PERMISSIONS } from '#/constants/permissions'
import type { FilterCriteria, SearchRequest, StudentResponse } from '#/generated/model'
import { useStudents, useUpdateStudentStatus } from '../hooks/useStudents'
import type { StudentFilterValues } from './StudentFilters'

const STATUS_MAP: Record<string, string> = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  NEW: 'pending',
  GRADUATED: 'completed',
  TRANSFERRED: 'info',
  WITHDRAWN: 'inactive',
}

function getInitials(fullName?: string | null) {
  if (!fullName) return '??'
  return fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

interface StudentTableProps {
  filters: StudentFilterValues
  appliedFilters: StudentFilterValues
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
}

export function StudentTable({ appliedFilters, pagination, onPaginationChange }: StudentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [debouncedFilters, setDebouncedFilters] = useState(appliedFilters)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDebouncedFilters(appliedFilters), 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [appliedFilters])

  const filterCriteria: FilterCriteria[] = [
    ...(debouncedFilters.studentNo ? [{ field: 'studentNo', operator: 'CONTAINS' as const, value: debouncedFilters.studentNo }] : []),
    ...(debouncedFilters.fullName ? [{ field: 'fullName', operator: 'CONTAINS' as const, value: debouncedFilters.fullName }] : []),
    ...(debouncedFilters.passportNumber ? [{ field: 'passportNumber', operator: 'CONTAINS' as const, value: debouncedFilters.passportNumber }] : []),
    ...(debouncedFilters.telephoneNumber ? [{ field: 'telephoneNumber', operator: 'CONTAINS' as const, value: debouncedFilters.telephoneNumber }] : []),
    ...(debouncedFilters.nationality ? [{ field: 'nationality', operator: 'CONTAINS' as const, value: debouncedFilters.nationality }] : []),
    ...(debouncedFilters.gender && debouncedFilters.gender !== 'all' ? [{ field: 'gender', operator: 'EQ' as const, value: debouncedFilters.gender }] : []),
    ...(debouncedFilters.status && debouncedFilters.status !== 'all' ? [{ field: 'status', operator: 'EQ' as const, value: debouncedFilters.status }] : []),
  ]

  const searchRequest: SearchRequest = {
    filters: filterCriteria,
    pagination: {
      page: pagination.pageIndex,
      size: pagination.pageSize,
    },
  }

  const { data, isLoading } = useStudents(searchRequest)
  const updateStatus = useUpdateStudentStatus()
  const columns: ColumnDef<StudentResponse>[] = [
    {
      accessorKey: 'studentNo',
      header: 'Student No.',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground">{getValue<string>() ?? '—'}</span>
      ),
    },
    {
      id: 'fullName',
      header: 'Full Name',
      cell: ({ row }) => {
        const s = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{getInitials(s.fullName)}</AvatarFallback>
            </Avatar>
            <div>
              <Link
                to="/students/$studentId/profile"
                params={{ studentId: s.id! }}
                className="text-sm font-medium hover:underline text-foreground"
              >
                {s.fullName ?? '—'}
              </Link>
              {s.email && (
                <p className="text-xs text-muted-foreground">{s.email}</p>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'passportNumber',
      header: 'Passport No.',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs">{getValue<string>() ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'telephoneNumber',
      header: 'Telephone',
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{getValue<string>() ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'nationality',
      header: 'Nationality',
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue<string>() ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue<string>() ?? ''
        return (
          <StatusBadge
            status={STATUS_MAP[s] ?? 'inactive'}
            label={s.charAt(0) + s.slice(1).toLowerCase()}
          />
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ getValue }) => {
        const v = getValue<string>()
        return (
          <span className="text-xs text-muted-foreground">
            {v ? new Date(v).toLocaleDateString() : '—'}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const s = row.original
        const isActive = s.status === 'ACTIVE'
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8" asChild>
              <Link to="/students/$studentId/profile" params={{ studentId: s.id! }}>
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
                  <Link to="/students/$studentId/profile" params={{ studentId: s.id! }}>
                    <Eye className="size-4 mr-2" />
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <PermissionGuard permission={PERMISSIONS.STUDENT.PROFILE.UPDATE}>
                  <DropdownMenuItem asChild>
                    <Link to="/students/$studentId/edit" params={{ studentId: s.id! }}>
                      <Pencil className="size-4 mr-2" />
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                </PermissionGuard>
                <DropdownMenuSeparator />
                <PermissionGuard permission={PERMISSIONS.STUDENT.PROFILE.UPDATE}>
                  {isActive ? (
                    <DropdownMenuItem
                      className="text-warning focus:text-warning"
                      onClick={() => updateStatus.mutate({ id: s.id!, status: 'SUSPENDED' })}
                    >
                      <UserX className="size-4 mr-2" />
                      Deactivate
                    </DropdownMenuItem>
                  ) : s.status === 'SUSPENDED' ? (
                    <DropdownMenuItem
                      onClick={() => updateStatus.mutate({ id: s.id!, status: 'ACTIVE' })}
                    >
                      <UserCheck className="size-4 mr-2" />
                      Activate
                    </DropdownMenuItem>
                  ) : null}
                </PermissionGuard>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <ServerTable
      data={data?.items ?? []}
      columns={columns}
      isLoading={isLoading}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      sorting={sorting}
      onSortingChange={setSorting}
      rowCount={data?.total ?? 0}
    />
  )
}
