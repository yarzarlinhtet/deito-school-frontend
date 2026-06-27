import { useState, useEffect } from 'react'
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'
import {
  MoreHorizontal,
  Pencil,
  Eye,
  CheckCircle2,
  AlertCircle,
  Search,
} from 'lucide-react'
import { ServerTable } from '#/components/shared/data-table'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { StatusBadge } from '#/components/shared/status-badge'
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
import { useAcademicYears } from '../hooks/useAcademicYears'
import { useIntakes, useActivateIntake } from '../hooks/useIntakes'
import { IntakeModal } from './IntakeModal'
import { IntakeDetailDialog } from './IntakeDetailDialog'
import type { FilterCriteria, IntakeResponse } from '#/generated/model'

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function intakeStatusKey(status?: string): string {
  switch (status) {
    case 'ACTIVE': return 'active'
    case 'UPCOMING': return 'pending'
    case 'CLOSED': return 'inactive'
    default: return 'inactive'
  }
}

export function IntakeTable() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [nameSearch, setNameSearch] = useState('')
  const [debouncedName, setDebouncedName] = useState('')
  const [academicYearFilter, setAcademicYearFilter] = useState('all')
  const [editTarget, setEditTarget] = useState<IntakeResponse | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [viewTarget, setViewTarget] = useState<IntakeResponse | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedName(nameSearch), 300)
    return () => clearTimeout(t)
  }, [nameSearch])

  const { data: academicYears } = useAcademicYears({ size: 100 })

  const filters: FilterCriteria[] = [
    ...(debouncedName
      ? [{ field: 'name', operator: 'CONTAINS' as const, value: debouncedName }]
      : []),
    ...(academicYearFilter && academicYearFilter !== 'all'
      ? [{ field: 'academicYearId', operator: 'EQ' as const, value: academicYearFilter }]
      : []),
  ]

  const { data, isLoading, isError } = useIntakes({
    filters,
    pagination: { page: pagination.pageIndex, size: pagination.pageSize },
  })

  const activate = useActivateIntake()

  const columns: ColumnDef<IntakeResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Intake Name',
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue<string | undefined>() ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {getValue<string | undefined>() ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ getValue }) => formatDate(getValue<string | undefined>()),
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ getValue }) => formatDate(getValue<string | undefined>()),
    },
    {
      accessorKey: 'totalCapacity',
      header: 'Capacity',
      cell: ({ getValue }) => {
        const v = getValue<number | undefined>()
        return v != null ? v.toLocaleString() : '—'
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue<IntakeResponse['status']>()
        return <StatusBadge status={intakeStatusKey(s)} />
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const intake = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditTarget(intake)
                  setEditOpen(true)
                }}
              >
                <Pencil className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewTarget(intake)}>
                <Eye className="size-4 mr-2" />
                View
              </DropdownMenuItem>
              {intake.status === 'UPCOMING' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => activate.mutate({ id: intake.id!, existing: intake })}
                    disabled={activate.isPending}
                  >
                    <CheckCircle2 className="size-4 mr-2" />
                    Activate
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search intakes…"
            className="pl-8"
            value={nameSearch}
            onChange={(e) => {
              setNameSearch(e.target.value)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
          />
        </div>
        <Select
          value={academicYearFilter}
          onValueChange={(v) => {
            setAcademicYearFilter(v)
            setPagination((p) => ({ ...p, pageIndex: 0 }))
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Academic Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Academic Years</SelectItem>
            {academicYears?.items?.map((ay) => (
              <SelectItem key={ay.id} value={ay.id!}>
                {ay.name ?? ay.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertTitle>Failed to load intakes</AlertTitle>
          <AlertDescription>
            Could not connect to the server. Check your connection or try again.
          </AlertDescription>
        </Alert>
      )}

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

      <IntakeModal
        open={editOpen}
        onOpenChange={(v) => {
          if (!v) {
            setEditOpen(false)
            setEditTarget(null)
          } else {
            setEditOpen(true)
          }
        }}
        editTarget={editTarget ?? undefined}
      />

      <IntakeDetailDialog
        open={!!viewTarget}
        onOpenChange={(v) => { if (!v) setViewTarget(null) }}
        intake={viewTarget}
      />
    </>
  )
}
