import { useState, useMemo } from 'react'
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { ServerTable } from '#/components/shared/data-table/ServerTable'
import type { PaymentResponse } from '#/generated/model'
import { useCurrency } from '#/hooks/useCurrency'
import { useStudentTransactions } from '../hooks/useStudentPayments'

const PAYMENT_METHODS = [
  'CASH',
  'BANK_TRANSFER',
  'ONLINE_PAYMENT',
  'QR_PAYMENT',
  'CHEQUE',
] as const

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  ONLINE_PAYMENT: 'Online Payment',
  QR_PAYMENT: 'QR Payment',
  CHEQUE: 'Cheque',
}

interface TransactionsCardProps {
  feeAccountId: string | undefined
}

export function TransactionsCard({ feeAccountId }: TransactionsCardProps) {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [receiptNo, setReceiptNo] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('all')

  const { currencyCode, formatAmount } = useCurrency()

  const filters = useMemo(
    () => ({ receiptNo: receiptNo || undefined, invoiceNumber: invoiceNumber || undefined, paymentMethod }),
    [receiptNo, invoiceNumber, paymentMethod],
  )

  const { data, isLoading } = useStudentTransactions(feeAccountId, pagination, sorting, filters)

  const items = data?.items ?? []
  const totalCollected = items.reduce((sum, p) => sum + (p.amount ?? 0), 0)
  const lastPayment = items
    .map((p) => p.paymentDate)
    .filter(Boolean)
    .sort()
    .at(-1)

  const columns = useMemo<ColumnDef<PaymentResponse, unknown>[]>(
    () => [
      {
        accessorKey: 'receiptNumber',
        header: 'Receipt No.',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {String(getValue() ?? '—')}
          </span>
        ),
      },
      {
        accessorKey: 'paymentDate',
        header: 'Date',
        cell: ({ getValue }) => {
          const v = getValue() as string | undefined
          return (
            <span className="text-xs">{v ? new Date(v).toLocaleDateString() : '—'}</span>
          )
        },
      },
      {
        accessorKey: 'invoiceNumber',
        header: 'Invoice No.',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {String(getValue() ?? '—')}
          </span>
        ),
      },
      {
        accessorKey: 'paymentMethod',
        header: 'Payment Method',
        cell: ({ getValue }) => {
          const v = getValue() as string | undefined
          return <span className="text-xs">{PAYMENT_METHOD_LABELS[v ?? ''] ?? v ?? '—'}</span>
        },
      },
      {
        accessorKey: 'amount',
        header: () => <div className="text-right">Amount ({currencyCode})</div>,
        cell: ({ getValue }) => (
          <div className="text-right font-mono text-xs font-semibold">
            {formatAmount(getValue() as number)}
          </div>
        ),
      },
      {
        id: 'collectedBy',
        header: 'Collected By',
        cell: ({ row }) => {
          const name = row.original.receivedByName || row.original.receivedBy
          return <span className="text-xs text-muted-foreground">{name ?? '—'}</span>
        },
      },
      {
        accessorKey: 'referenceNumber',
        header: 'Reference No.',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {String(getValue() ?? '—')}
          </span>
        ),
      },
    ],
    [currencyCode, formatAmount],
  )

  function handleFilterChange() {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-3 rounded-lg border bg-muted/40 p-3 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Total Transactions</p>
            <p className="text-sm font-semibold">{data?.total ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Collected ({currencyCode})</p>
            <p className="text-sm font-semibold font-mono text-green-600">
              {formatAmount(totalCollected)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last Payment</p>
            <p className="text-sm font-semibold">
              {lastPayment ? new Date(lastPayment).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search receipt no."
            value={receiptNo}
            onChange={(e) => {
              setReceiptNo(e.target.value)
              handleFilterChange()
            }}
            className="h-8 max-w-[180px] text-xs"
          />
          <Input
            placeholder="Search invoice no."
            value={invoiceNumber}
            onChange={(e) => {
              setInvoiceNumber(e.target.value)
              handleFilterChange()
            }}
            className="h-8 max-w-[180px] text-xs"
          />
          <Select
            value={paymentMethod}
            onValueChange={(v) => {
              setPaymentMethod(v)
              handleFilterChange()
            }}
          >
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ServerTable
          data={items}
          columns={columns}
          isLoading={isLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          rowCount={data?.total ?? 0}
        />
      </CardContent>
    </Card>
  )
}
