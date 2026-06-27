import { useState } from 'react'
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'
import {
  Star,
  MoreHorizontal,
  Pencil,
  CheckCircle2,
  Eye,
  AlertCircle,
} from 'lucide-react'
import { ServerTable } from '#/components/shared/data-table'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { StatusBadge } from '#/components/shared/status-badge'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'
import {
  useAcademicYears,
  useActivateAcademicYear,
} from '../hooks/useAcademicYears'
import { AcademicYearModal } from './AcademicYearModal'
import { AcademicYearDetailDialog } from './AcademicYearDetailDialog'
import type { AcademicYearResponse } from '#/generated/model'

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function AcademicYearTable() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [editTarget, setEditTarget] = useState<AcademicYearResponse | null>(null)
  const [viewTarget, setViewTarget] = useState<AcademicYearResponse | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const { data, isLoading, isError } = useAcademicYears({
    page: pagination.pageIndex,
    size: pagination.pageSize,
  })

  const activate = useActivateAcademicYear()

  const columns: ColumnDef<AcademicYearResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Academic Year',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name ?? '—'}</span>
          {row.original.isCurrentYear && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Star className="size-3.5 fill-warning text-warning" />
              </TooltipTrigger>
              <TooltipContent>Current Year</TooltipContent>
            </Tooltip>
          )}
        </div>
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
        const s = getValue<AcademicYearResponse['status']>()
        const statusKey = s === 'ACTIVE' ? 'active' : 'inactive'
        return <StatusBadge status={statusKey} />
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ getValue }) => formatDate(getValue<string | undefined>()),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const ay = row.original
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
                  setEditTarget(ay)
                  setEditOpen(true)
                }}
              >
                <Pencil className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewTarget(ay)}>
                <Eye className="size-4 mr-2" />
                View
              </DropdownMenuItem>
              {ay.status === 'INACTIVE' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => activate.mutate({ id: ay.id!, existing: ay })}
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
      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertTitle>Failed to load academic years</AlertTitle>
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

      <AcademicYearModal
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

      <AcademicYearDetailDialog
        open={!!viewTarget}
        onOpenChange={(v) => { if (!v) setViewTarget(null) }}
        year={viewTarget}
      />
    </>
  )
}
