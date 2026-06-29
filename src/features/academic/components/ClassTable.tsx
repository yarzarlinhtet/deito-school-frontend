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
  useClasses,
  useActivateClass,
  useDeactivateClass,
} from '../hooks/useClasses'
import { useActivePrograms } from '../hooks/usePrograms'
import { useProgramLevelsByProgram } from '../hooks/useProgramLevels'
import { ClassModal } from './ClassModal'
import type { ClassResponse, FilterCriteria, ProgramLevelSummary } from '#/generated/model'

export function ClassTable() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [nameSearch, setNameSearch] = useState('')
  const [debouncedName, setDebouncedName] = useState('')
  const [programFilter, setProgramFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editTarget, setEditTarget] = useState<ClassResponse | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedName(nameSearch), 300)
    return () => clearTimeout(t)
  }, [nameSearch])

  const { data: programs } = useActivePrograms()
  const { data: levels } = useProgramLevelsByProgram(programFilter !== 'all' ? programFilter : null)

  const filters: FilterCriteria[] = [
    ...(debouncedName
      ? [{ field: 'name', operator: 'CONTAINS' as const, value: debouncedName }]
      : []),
    ...(programFilter !== 'all'
      ? [{ field: 'programId', operator: 'EQ' as const, value: programFilter }]
      : []),
    ...(levelFilter !== 'all'
      ? [{ field: 'programLevelId', operator: 'EQ' as const, value: levelFilter }]
      : []),
    ...(statusFilter !== 'all'
      ? [{ field: 'status', operator: 'EQ' as const, value: statusFilter }]
      : []),
  ]

  const { data, isLoading, isError } = useClasses({
    filters,
    pagination: { page: pagination.pageIndex, size: pagination.pageSize },
  })

  const activate = useActivateClass()
  const deactivate = useDeactivateClass()

  const programMap = Object.fromEntries(
    (programs ?? []).map((p) => [p.id, p.name]),
  )
  const levelMap = Object.fromEntries(
    (levels ?? []).map((l: ProgramLevelSummary) => [l.id, l.name]),
  )

  const columns: ColumnDef<ClassResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Class Name',
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
      accessorKey: 'programLevelId',
      header: 'Level',
      cell: ({ getValue }) => (
        <span className="text-sm">
          {levelMap[getValue<string | undefined>() ?? ''] ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity',
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
        const cls = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditTarget(cls)}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {cls.status === 'CLOSED' && (
                <DropdownMenuItem
                  onClick={() => activate.mutate({ id: cls.id!, existing: cls })}
                  disabled={activate.isPending}
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  Activate
                </DropdownMenuItem>
              )}
              {cls.status === 'ACTIVE' && (
                <DropdownMenuItem
                  onClick={() => deactivate.mutate({ id: cls.id!, existing: cls })}
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
            placeholder="Search classes…"
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
            setLevelFilter('all')
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
          value={levelFilter}
          onValueChange={(v) => {
            setLevelFilter(v)
            setPagination((p) => ({ ...p, pageIndex: 0 }))
          }}
          disabled={programFilter === 'all'}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue
              placeholder={programFilter === 'all' ? 'Select program first' : 'All Levels'}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {(levels ?? []).map((l: ProgramLevelSummary) => (
              <SelectItem key={l.id} value={l.id!}>
                {l.name}
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
          <AlertTitle>Failed to load classes</AlertTitle>
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

      <ClassModal
        open={!!editTarget}
        onOpenChange={(v) => { if (!v) setEditTarget(null) }}
        editTarget={editTarget ?? undefined}
      />
    </>
  )
}
