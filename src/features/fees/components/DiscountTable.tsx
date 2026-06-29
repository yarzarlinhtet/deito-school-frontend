import { useState, useEffect } from 'react'
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'
import {
  MoreHorizontal,
  Pencil,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
} from 'lucide-react'
import { cn } from '#/lib/utils'
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
  useDiscounts,
  useActivateDiscount,
  useDeactivateDiscount,
} from '../hooks/useDiscounts'
import { useFeeCategories } from '../hooks/useFeeCategories'
import { DiscountModal } from './DiscountModal'
import type { DiscountResponse, FilterCriteria } from '#/generated/model'

const DISCOUNT_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  PERCENTAGE_DISCOUNT: {
    label: 'Percentage',
    className: 'bg-orange-50 text-orange-600 border-orange-200',
  },
  FIXED_AMOUNT: {
    label: 'Fixed Amount',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  SCHOLARSHIP: {
    label: 'Scholarship',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  EARLY_PAYMENT: {
    label: 'Early Payment',
    className: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  SIBLING_DISCOUNT: {
    label: 'Sibling',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  STAFF_DISCOUNT: {
    label: 'Staff',
    className: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  },
}

export function DiscountTable() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [nameSearch, setNameSearch] = useState('')
  const [debouncedName, setDebouncedName] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editTarget, setEditTarget] = useState<DiscountResponse | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedName(nameSearch), 300)
    return () => clearTimeout(t)
  }, [nameSearch])

  const { data: categoriesPage } = useFeeCategories({ size: 200 })
  const categoryMap = Object.fromEntries(
    (categoriesPage?.items ?? []).map((c) => [c.id, c.name]),
  )

  const filters: FilterCriteria[] = [
    ...(debouncedName
      ? [{ field: 'name', operator: 'CONTAINS' as const, value: debouncedName }]
      : []),
    ...(typeFilter !== 'all'
      ? [{ field: 'discountType', operator: 'EQ' as const, value: typeFilter }]
      : []),
    ...(statusFilter !== 'all'
      ? [{ field: 'status', operator: 'EQ' as const, value: statusFilter }]
      : []),
  ]

  const { data, isLoading, isError } = useDiscounts({
    filters,
    pagination: { page: pagination.pageIndex, size: pagination.pageSize },
  })

  const activate = useActivateDiscount()
  const deactivate = useDeactivateDiscount()

  const columns: ColumnDef<DiscountResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name ?? '—'}</p>
          {row.original.code && (
            <p className="font-mono text-xs text-muted-foreground">{row.original.code}</p>
          )}
          {row.original.description && (
            <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-muted-foreground">
              {row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'discountType',
      header: 'Type',
      cell: ({ getValue }) => {
        const type = getValue<string | undefined>() ?? ''
        const config = DISCOUNT_TYPE_CONFIG[type]
        return config ? (
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
              config.className,
            )}
          >
            {config.label}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      accessorKey: 'value',
      header: 'Value',
      cell: ({ row }) => {
        const { value, discountType } = row.original
        if (value == null) return <span className="text-muted-foreground">—</span>
        const isPercent = discountType === 'PERCENTAGE_DISCOUNT'
        return (
          <span className="text-base font-bold">
            {isPercent ? `${value}%` : value.toLocaleString()}
          </span>
        )
      },
    },
    {
      id: 'appliesTo',
      header: 'Applies To',
      cell: ({ row }) => {
        const ids = row.original.feeCategoryIds ?? []
        const names = ids.map((id) => categoryMap[id] ?? id).filter(Boolean)
        return names.length > 0 ? (
          <span className="text-sm">{names.join(', ')}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      id: 'validPeriod',
      header: 'Valid Period',
      cell: ({ row }) => {
        const { startDate, endDate } = row.original
        if (!startDate && !endDate)
          return <span className="text-muted-foreground">—</span>
        return (
          <span className="text-sm text-muted-foreground">
            {startDate ?? '?'} – {endDate ?? '?'}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue<string | undefined>()
        const variant =
          s === 'ACTIVE' ? 'active' : s === 'INACTIVE' ? 'inactive' : 'expired'
        return (
          <StatusBadge
            status={variant}
            label={s === 'EXPIRED' ? 'Expired' : undefined}
          />
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const disc = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditTarget(disc)}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {disc.status === 'INACTIVE' && (
                <DropdownMenuItem
                  onClick={() => activate.mutate({ id: disc.id!, existing: disc })}
                  disabled={activate.isPending}
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  Activate
                </DropdownMenuItem>
              )}
              {disc.status === 'ACTIVE' && (
                <DropdownMenuItem
                  onClick={() => deactivate.mutate({ id: disc.id!, existing: disc })}
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
            placeholder="Search discounts…"
            className="pl-8"
            value={nameSearch}
            onChange={(e) => {
              setNameSearch(e.target.value)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v)
            setPagination((p) => ({ ...p, pageIndex: 0 }))
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="PERCENTAGE_DISCOUNT">Percentage</SelectItem>
            <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
            <SelectItem value="SCHOLARSHIP">Scholarship</SelectItem>
            <SelectItem value="EARLY_PAYMENT">Early Payment</SelectItem>
            <SelectItem value="SIBLING_DISCOUNT">Sibling</SelectItem>
            <SelectItem value="STAFF_DISCOUNT">Staff</SelectItem>
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
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertTitle>Failed to load discounts</AlertTitle>
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

      <DiscountModal
        open={!!editTarget}
        onOpenChange={(v) => {
          if (!v) setEditTarget(null)
        }}
        editTarget={editTarget}
      />
    </>
  )
}
