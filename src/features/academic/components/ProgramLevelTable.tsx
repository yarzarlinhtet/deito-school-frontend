import { useState, useEffect } from 'react'
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, CheckCircle2, XCircle, AlertCircle, Search } from 'lucide-react'
import { ServerTable } from '#/components/shared/data-table/ServerTable'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { StatusBadge } from '#/components/shared/status-badge/StatusBadge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  useProgramLevels,
  useActivateProgramLevel,
  useDeactivateProgramLevel,
} from '../hooks/useProgramLevels'
import { useActivePrograms } from '../hooks/usePrograms'
import { ProgramLevelModal } from './ProgramLevelModal'
import type { FilterCriteria, ProgramLevelResponse } from '#/generated/model'

export function ProgramLevelTable() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [nameSearch, setNameSearch] = useState('')
  const [debouncedName, setDebouncedName] = useState('')
  const [programFilter, setProgramFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editTarget, setEditTarget] = useState<ProgramLevelResponse | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedName(nameSearch), 300)
    return () => clearTimeout(t)
  }, [nameSearch])

  const { data: programs } = useActivePrograms()

  const filters: FilterCriteria[] = [
    ...(debouncedName
      ? [{ field: 'name', operator: 'CONTAINS' as const, value: debouncedName }]
      : []),
    ...(programFilter !== 'all'
      ? [{ field: 'programId', operator: 'EQ' as const, value: programFilter }]
      : []),
    ...(statusFilter !== 'all'
      ? [{ field: 'status', operator: 'EQ' as const, value: statusFilter }]
      : []),
  ]

  const { data, isLoading, isError } = useProgramLevels({
    filters,
    pagination: { page: pagination.pageIndex, size: pagination.pageSize },
  })

  const activate = useActivateProgramLevel()
  const deactivate = useDeactivateProgramLevel()

  const programMap = Object.fromEntries(
    (programs ?? []).map((p) => [p.id, p.name]),
  )

  const columns: ColumnDef<ProgramLevelResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name ?? '—'}</p>
          {row.original.code && (
            <p className="font-mono text-xs text-muted-foreground">{row.original.code}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'programId',
      header: 'Program',
      cell: ({ getValue }) => (
        <span className="text-sm">
          {programMap[getValue<string | undefined>() ?? ''] ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'displayOrder',
      header: 'Level Order',
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue<number | undefined>() ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue<string | undefined>()
        return <StatusBadge status={s === 'ACTIVE' ? 'active' : 'inactive'} />
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const level = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditTarget(level)}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {level.status === 'INACTIVE' && (
                <DropdownMenuItem
                  onClick={() => activate.mutate({ id: level.id!, existing: level })}
                  disabled={activate.isPending}
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  Activate
                </DropdownMenuItem>
              )}
              {level.status === 'ACTIVE' && (
                <DropdownMenuItem
                  onClick={() => deactivate.mutate({ id: level.id!, existing: level })}
                  disabled={deactivate.isPending}
                  className="text-destructive focus:text-destructive"
                >
                  <XCircle className="mr-2 size-4" />
                  Deactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative w-full sm:min-w-[200px] sm:flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search program levels…"
            className="pl-8"
            value={nameSearch}
            onChange={(e) => {
              setNameSearch(e.target.value)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
          />
        </div>
        <Select
          value={programFilter}
          onValueChange={(v) => {
            setProgramFilter(v)
            setPagination((p) => ({ ...p, pageIndex: 0 }))
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Programs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {(programs ?? []).map((p) => (
              <SelectItem key={p.id} value={p.id!}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v)
            setPagination((p) => ({ ...p, pageIndex: 0 }))
          }}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertTitle>Failed to load program levels</AlertTitle>
          <AlertDescription>Could not connect to the server. Please try again.</AlertDescription>
        </Alert>
      )}

      <div className="overflow-x-auto">
        <ServerTable
          data={data?.items ?? []}
          columns={columns}
          isLoading={isLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          rowCount={data?.total ?? 0}
        />
      </div>

      <ProgramLevelModal
        open={!!editTarget}
        onOpenChange={(v) => { if (!v) setEditTarget(null) }}
        editTarget={editTarget ?? undefined}
      />
    </>
  )
}
