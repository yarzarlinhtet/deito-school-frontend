import { useState, useEffect } from 'react'
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'
import {
  MoreHorizontal,
  Pencil,
  Eye,
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
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { useIntakes } from '../hooks/useIntakes'
import { useBatches } from '../hooks/useBatches'
import { BatchModal } from './BatchModal'
import { BatchDetailDialog } from './BatchDetailDialog'
import type { BatchResponse, FilterCriteria } from '#/generated/model'

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function batchStatusKey(status?: string): string {
  switch (status) {
    case 'ACTIVE': return 'active'
    case 'UPCOMING': return 'pending'
    case 'CLOSED': return 'inactive'
    default: return 'inactive'
  }
}

export function BatchTable() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [nameSearch, setNameSearch] = useState('')
  const [debouncedName, setDebouncedName] = useState('')
  const [intakeFilter, setIntakeFilter] = useState('all')
  const [editTarget, setEditTarget] = useState<BatchResponse | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [viewId, setViewId] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedName(nameSearch), 300)
    return () => clearTimeout(t)
  }, [nameSearch])

  const { data: intakes } = useIntakes({ pagination: { page: 0, size: 100 } })

  const filters: FilterCriteria[] = [
    ...(debouncedName
      ? [{ field: 'name', operator: 'CONTAINS' as const, value: debouncedName }]
      : []),
    ...(intakeFilter && intakeFilter !== 'all'
      ? [{ field: 'intakeId', operator: 'EQ' as const, value: intakeFilter }]
      : []),
  ]

  const { data, isLoading, isError } = useBatches({
    filters,
    pagination: { page: pagination.pageIndex, size: pagination.pageSize },
  })

  const columns: ColumnDef<BatchResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Batch Name',
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue<BatchResponse['status']>()
        return <StatusBadge status={batchStatusKey(s)} />
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const batch = row.original
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
                  setEditTarget(batch)
                  setEditOpen(true)
                }}
              >
                <Pencil className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewId(batch.id ?? null)}>
                <Eye className="size-4 mr-2" />
                View
              </DropdownMenuItem>
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
            placeholder="Search batches…"
            className="pl-8"
            value={nameSearch}
            onChange={(e) => {
              setNameSearch(e.target.value)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
          />
        </div>
        <Select
          value={intakeFilter}
          onValueChange={(v) => {
            setIntakeFilter(v)
            setPagination((p) => ({ ...p, pageIndex: 0 }))
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All Intakes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Intakes</SelectItem>
            {intakes?.items?.map((intake) => (
              <SelectItem key={intake.id} value={intake.id!}>
                {intake.name ?? intake.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertTitle>Failed to load batches</AlertTitle>
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

      <BatchModal
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

      <BatchDetailDialog
        open={!!viewId}
        onOpenChange={(v) => { if (!v) setViewId(null) }}
        batchId={viewId}
      />
    </>
  )
}
