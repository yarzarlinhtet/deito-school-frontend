import { useState, useEffect } from 'react'
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Eye, AlertCircle, Search } from 'lucide-react'
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
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { useFeeTemplates } from '../hooks/useFeeTemplates'
import { FeeTemplateModal } from './FeeTemplateModal'
import { FeeTemplateDetailDrawer } from './FeeTemplateDetailDrawer'
import type { FeeTemplateResponse, FilterCriteria } from '#/generated/model'

function templateStatusKey(status?: string): string {
  switch (status) {
    case 'ACTIVE': return 'active'
    case 'INACTIVE': return 'inactive'
    case 'ARCHIVED': return 'inactive'
    default: return 'inactive'
  }
}

export function FeeTemplateTable() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [nameSearch, setNameSearch] = useState('')
  const [debouncedName, setDebouncedName] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editTarget, setEditTarget] = useState<FeeTemplateResponse | null>(null)
  const [viewId, setViewId] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedName(nameSearch), 300)
    return () => clearTimeout(t)
  }, [nameSearch])

  const filters: FilterCriteria[] = [
    ...(debouncedName
      ? [{ field: 'name', operator: 'CONTAINS' as const, value: debouncedName }]
      : []),
    ...(statusFilter !== 'all'
      ? [{ field: 'status', operator: 'EQ' as const, value: statusFilter }]
      : []),
  ]

  const { data, isLoading, isError } = useFeeTemplates({
    filters,
    pagination: { page: pagination.pageIndex, size: pagination.pageSize },
  })

  const columns: ColumnDef<FeeTemplateResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Template Name',
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue<FeeTemplateResponse['status']>()
        return <StatusBadge status={templateStatusKey(s)} />
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const tmpl = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewId(tmpl.id ?? null)}>
                <Eye className="mr-2 size-4" />
                View Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditTarget(tmpl)}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
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
            placeholder="Search templates…"
            className="pl-8"
            value={nameSearch}
            onChange={(e) => {
              setNameSearch(e.target.value)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
          />
        </div>
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
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertTitle>Failed to load fee templates</AlertTitle>
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

      <FeeTemplateModal
        open={!!editTarget}
        onOpenChange={(v) => { if (!v) setEditTarget(null) }}
        editTarget={editTarget ?? undefined}
      />

      <FeeTemplateDetailDrawer
        open={!!viewId}
        onOpenChange={(v) => { if (!v) setViewId(null) }}
        templateId={viewId}
      />
    </>
  )
}
