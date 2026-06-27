import type { ReactNode } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type FilterFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type ColumnFiltersState,
  type OnChangeFn,
} from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { cn } from '#/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

export interface ServerTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  rowCount: number
  pagination: PaginationState
  onPaginationChange: (
    updater: PaginationState | ((old: PaginationState) => PaginationState)
  ) => void
  sorting?: SortingState
  onSortingChange?: (
    updater: SortingState | ((old: SortingState) => SortingState)
  ) => void
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: (
    updater:
      | ColumnFiltersState
      | ((old: ColumnFiltersState) => ColumnFiltersState)
  ) => void
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  isLoading?: boolean
  className?: string
  toolbar?: ReactNode
}

export function ServerTable<TData>({
  data,
  columns,
  rowCount,
  pagination,
  onPaginationChange,
  sorting = [],
  onSortingChange,
  columnFilters = [],
  onColumnFiltersChange,
  rowSelection,
  onRowSelectionChange,
  isLoading = false,
  className,
  toolbar,
}: ServerTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    rowCount,
    state: { pagination, sorting, columnFilters, rowSelection: rowSelection ?? {} },
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onRowSelectionChange,
    enableRowSelection: !!onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    // Required by @tanstack/match-sorter-utils type augmentation; actual filtering is server-side
    filterFns: {
      fuzzy: ((row, columnId, value, addMeta) => {
        const itemRank = rankItem(row.getValue(columnId), value as string)
        addMeta({ itemRank })
        return itemRank.passed
      }) satisfies FilterFn<TData>,
    },
  })

  const pageCount = table.getPageCount()
  const { pageIndex, pageSize } = pagination

  return (
    <div className={cn('space-y-4', className)}>
      {toolbar && <div>{toolbar}</div>}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/40 hover:bg-muted/40">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {pageIndex + 1} of {pageCount} ({rowCount} total)
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="size-8"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="size-8"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="size-8"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            className="size-8"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
