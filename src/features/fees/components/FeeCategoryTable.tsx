import { useState, useEffect } from 'react'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, CheckCircle2, XCircle, AlertCircle, Search } from 'lucide-react'
import { ServerTable } from '#/components/shared/data-table/ServerTable'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { StatusBadge } from '#/components/shared/status-badge/StatusBadge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Badge } from '#/components/ui/badge'
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
  useFeeCategories,
  useActivateFeeCategory,
  useDeactivateFeeCategory,
} from '../hooks/useFeeCategories'
import { useCurrency } from '#/hooks/useCurrency'
import { FeeCategoryModal } from './FeeCategoryModal'
import type { FeeCategoryResponse } from '#/generated/model'
import { cn } from '#/lib/utils'

// 8 color presets cycling by row index
const CHIP_COLORS = [
  'bg-orange-50 text-orange-600 border-orange-200',
  'bg-purple-50 text-purple-700 border-purple-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-pink-50 text-pink-700 border-pink-200',
  'bg-sky-50 text-sky-700 border-sky-200',
  'bg-lime-50 text-lime-700 border-lime-200',
  'bg-slate-50 text-slate-600 border-slate-300',
]

const FREQ_LABELS: Record<string, string> = {
  ONE_TIME: 'One-Time',
  MONTHLY: 'Monthly',
  SEMESTER: 'Semester',
  YEARLY: 'Yearly',
  ANNUAL: 'Annual',
  VARIABLE: 'Variable',
}

export function FeeCategoryTable() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [nameSearch, setNameSearch] = useState('')
  const [debouncedName, setDebouncedName] = useState('')
  const [freqFilter, setFreqFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editTarget, setEditTarget] = useState<FeeCategoryResponse | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedName(nameSearch), 300)
    return () => clearTimeout(t)
  }, [nameSearch])

  const { data, isLoading, isError } = useFeeCategories({
    name: debouncedName || undefined,
    frequency: freqFilter !== 'all' ? freqFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page: pagination.pageIndex,
    size: pagination.pageSize,
  })

  const activate = useActivateFeeCategory()
  const deactivate = useDeactivateFeeCategory()
  const { formatAmount } = useCurrency()

  const columns: ColumnDef<FeeCategoryResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Category Name',
      cell: ({ getValue, row }) => {
        const color = CHIP_COLORS[row.index % CHIP_COLORS.length]
        return (
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
              color
            )}
          >
            {getValue<string | undefined>() ?? '—'}
          </span>
        )
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => (
        <span className="line-clamp-2 max-w-xs text-sm text-muted-foreground">
          {getValue<string | undefined>() ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'frequency',
      header: 'Frequency',
      cell: ({ getValue }) => {
        const freq = getValue<string | undefined>()
        return freq ? (
          <Badge variant="secondary">{FREQ_LABELS[freq] ?? freq}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      accessorKey: 'defaultAmount',
      header: 'Default Amount',
      cell: ({ getValue }) => {
        const v = getValue<number | undefined>()
        return v != null ? (
          <span className="font-mono text-sm">{formatAmount(v)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
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
        const cat = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditTarget(cat)}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {cat.status === 'INACTIVE' && (
                <DropdownMenuItem
                  onClick={() => activate.mutate({ id: cat.id!, existing: cat })}
                  disabled={activate.isPending}
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  Activate
                </DropdownMenuItem>
              )}
              {cat.status === 'ACTIVE' && (
                <DropdownMenuItem
                  onClick={() => deactivate.mutate({ id: cat.id!, existing: cat })}
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
            placeholder="Search categories…"
            className="pl-8"
            value={nameSearch}
            onChange={(e) => {
              setNameSearch(e.target.value)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
          />
        </div>
        <Select
          value={freqFilter}
          onValueChange={(v) => {
            setFreqFilter(v)
            setPagination((p) => ({ ...p, pageIndex: 0 }))
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Frequencies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Frequencies</SelectItem>
            <SelectItem value="ONE_TIME">One-Time</SelectItem>
            <SelectItem value="MONTHLY">Monthly</SelectItem>
            <SelectItem value="SEMESTER">Semester</SelectItem>
            <SelectItem value="YEARLY">Yearly</SelectItem>
            <SelectItem value="ANNUAL">Annual</SelectItem>
            <SelectItem value="VARIABLE">Variable</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v)
            setPagination((p) => ({ ...p, pageIndex: 0 }))
          }}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
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
          <AlertTitle>Failed to load fee categories</AlertTitle>
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
          rowCount={data?.total ?? 0}
        />
      </div>

      <FeeCategoryModal
        open={!!editTarget}
        onOpenChange={(v) => { if (!v) setEditTarget(null) }}
        editTarget={editTarget ?? undefined}
      />
    </>
  )
}
