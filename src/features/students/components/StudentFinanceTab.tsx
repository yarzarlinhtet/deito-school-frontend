import { useState } from 'react'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { StatsCard } from '#/components/shared/stats-card'
import { ServerTable } from '#/components/shared/data-table'
import { StatusBadge } from '#/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { DollarSign, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  useStudentFinanceSummary,
  useStudentInvoices,
} from '../hooks/useStudentFinance'
import { GenerateInvoiceModal } from './modals/GenerateInvoiceModal'
import type { Invoice } from '../types'

const INVOICE_STATUS_MAP: Record<Invoice['status'], string> = {
  draft: 'inactive',
  pending: 'pending',
  paid: 'active',
  overdue: 'suspended',
}

interface StudentFinanceTabProps {
  studentId: string
}

export function StudentFinanceTab({ studentId }: StudentFinanceTabProps) {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)

  const { data: finance } = useStudentFinanceSummary(studentId)
  const { data: invoices, isLoading: invoicesLoading } = useStudentInvoices(studentId, {
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  })

  const invoiceColumns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'feeType',
      header: 'Fee Type',
    },
    {
      accessorKey: 'issueDate',
      header: 'Issue Date',
      cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ getValue }) => (
        <span className="font-medium tabular-nums">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(getValue<number>())}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue<Invoice['status']>()
        return <StatusBadge status={INVOICE_STATUS_MAP[s]} label={s.charAt(0).toUpperCase() + s.slice(1)} />
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Total Billed"
          value={finance ? `$${finance.totalBilled.toLocaleString()}` : '—'}
          icon={DollarSign}
        />
        <StatsCard
          title="Total Paid"
          value={finance ? `$${finance.totalPaid.toLocaleString()}` : '—'}
          icon={CheckCircle2}
        />
        <StatsCard
          title="Outstanding"
          value={finance ? `$${finance.outstanding.toLocaleString()}` : '—'}
          icon={AlertCircle}
        />
        <StatsCard
          title="Pending Invoices"
          value={finance?.pendingInvoices ?? '—'}
          icon={FileText}
        />
      </div>

      {/* Fee Template */}
      {finance?.feeTemplateName && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Fee Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{finance.feeTemplateName}</p>
                {finance.feeCategoryName && (
                  <p className="text-xs text-muted-foreground">{finance.feeCategoryName}</p>
                )}
              </div>
              <Button variant="outline" size="sm">Change Template</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Invoices</h3>
          <Button size="sm" className="gap-1.5" onClick={() => setInvoiceModalOpen(true)}>
            <Plus className="size-3.5" />
            Generate Invoice
          </Button>
        </div>
        <ServerTable
          data={invoices?.data ?? []}
          columns={invoiceColumns}
          isLoading={invoicesLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
          rowCount={invoices?.total ?? 0}
        />
      </div>

      <GenerateInvoiceModal
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        studentId={studentId}
      />
    </div>
  )
}
