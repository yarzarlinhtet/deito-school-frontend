import { useState, useEffect, useRef } from 'react'
import type { ColumnDef, PaginationState, OnChangeFn } from '@tanstack/react-table'

import { MoreHorizontal, Pencil, Shield, KeyRound, Lock, Unlock } from 'lucide-react'
import { ServerTable } from '#/components/shared/data-table'
import { StatusBadge } from '#/components/shared/status-badge'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
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
import type { FilterCriteria, SearchRequest, UserAdminResponse } from '#/generated/model'
import { useUsers } from '../hooks/useUsers'
import type { UserFilterValues } from '../types'
import { UserFormDialog } from './UserFormDialog'
import { ManageRolesDialog } from './ManageRolesDialog'
import { ResetPasswordDialog } from './ResetPasswordDialog'
import { LockUserDialog } from './LockUserDialog'
import { UnlockUserDialog } from './UnlockUserDialog'

const STATUS_MAP: Record<string, string> = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
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

function formatLastLogin(val?: string | null) {
  if (!val) return 'Never'
  return new Date(val).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface UserTableProps {
  appliedFilters: UserFilterValues
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
}

export function UserTable({ appliedFilters, pagination, onPaginationChange }: UserTableProps) {
  const [debouncedFilters, setDebouncedFilters] = useState(appliedFilters)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [editTarget, setEditTarget] = useState<UserAdminResponse | null>(null)
  const [rolesTarget, setRolesTarget] = useState<UserAdminResponse | null>(null)
  const [resetTarget, setResetTarget] = useState<UserAdminResponse | null>(null)
  const [lockTarget, setLockTarget] = useState<UserAdminResponse | null>(null)
  const [unlockTarget, setUnlockTarget] = useState<UserAdminResponse | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDebouncedFilters(appliedFilters), 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [appliedFilters])

  const filterCriteria: FilterCriteria[] = [
    ...(debouncedFilters.search
      ? [{ field: 'fullName', operator: 'CONTAINS' as const, value: debouncedFilters.search }]
      : []),
    ...(debouncedFilters.status !== 'all'
      ? [{ field: 'status', operator: 'EQ' as const, value: debouncedFilters.status }]
      : []),
    ...(debouncedFilters.roleId !== 'all'
      ? [{ field: 'roleId', operator: 'EQ' as const, value: debouncedFilters.roleId }]
      : []),
  ]

  const searchRequest: SearchRequest = {
    filters: filterCriteria,
    pagination: {
      page: pagination.pageIndex,
      size: pagination.pageSize,
    },
  }

  const { data, isLoading } = useUsers(searchRequest)

  const columns: ColumnDef<UserAdminResponse, unknown>[] = [
    {
      id: 'user',
      header: 'User',
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {getInitials(u.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{u.fullName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      id: 'username',
      header: 'Username',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">{row.original.username ?? '—'}</span>
      ),
    },
    {
      id: 'roles',
      header: 'Roles',
      cell: ({ row }) => {
        const roles = row.original.roles ?? []
        const chips = roles.slice(0, 2)
        const overflow = roles.length - chips.length
        return (
          <div className="flex flex-wrap gap-1">
            {chips.map((r) => (
              <Badge key={r.id} variant="secondary" className="text-xs">
                {r.name}
              </Badge>
            ))}
            {overflow > 0 && (
              <Badge variant="outline" className="text-xs">
                +{overflow}
              </Badge>
            )}
            {roles.length === 0 && <span className="text-xs text-muted-foreground">No roles</span>}
          </div>
        )
      },
    },
    {
      id: 'accessLevel',
      header: 'Access',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.accessLevel ?? '—'}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const u = row.original
        if (u.accountLocked) {
          return <Badge variant="destructive" className="text-xs">Locked</Badge>
        }
        return (
          <StatusBadge status={STATUS_MAP[u.status ?? ''] ?? 'inactive'} />
        )
      },
    },
    {
      id: 'lastLogin',
      header: 'Last Login',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatLastLogin(row.original.lastLoginAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const u = row.original
        return (
          <PermissionGuard permission={PERMISSIONS.ADMIN.USER.UPDATE}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditTarget(u)}>
                  <Pencil className="mr-2 size-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRolesTarget(u)}>
                  <Shield className="mr-2 size-3.5" />
                  Manage Roles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setResetTarget(u)}>
                  <KeyRound className="mr-2 size-3.5" />
                  Reset Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {u.accountLocked ? (
                  <DropdownMenuItem onClick={() => setUnlockTarget(u)}>
                    <Unlock className="mr-2 size-3.5" />
                    Unlock
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setLockTarget(u)}
                  >
                    <Lock className="mr-2 size-3.5" />
                    Lock
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </PermissionGuard>
        )
      },
    },
  ]

  return (
    <>
      <ServerTable
        columns={columns}
        data={data?.items ?? []}
        rowCount={data?.total ?? 0}
        isLoading={isLoading}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
      />

      <UserFormDialog
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null) }}
        editTarget={editTarget ?? undefined}
      />

      <ManageRolesDialog
        open={!!rolesTarget}
        onOpenChange={(open) => { if (!open) setRolesTarget(null) }}
        user={rolesTarget}
      />

      <ResetPasswordDialog
        open={!!resetTarget}
        onOpenChange={(open) => { if (!open) setResetTarget(null) }}
        user={resetTarget}
      />

      <LockUserDialog
        open={!!lockTarget}
        onOpenChange={(open) => { if (!open) setLockTarget(null) }}
        user={lockTarget}
      />

      <UnlockUserDialog
        open={!!unlockTarget}
        onOpenChange={(open) => { if (!open) setUnlockTarget(null) }}
        user={unlockTarget}
      />
    </>
  )
}
