import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { useStore } from '@tanstack/react-store'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { FormDialog } from '#/components/shared/form/FormDialog'
import { Calendar } from '#/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'
import type { InvoiceResponse } from '#/generated/model'
import { useCurrency } from '#/hooks/useCurrency'
import { useCollectPayment, useInvoicePayments } from '../hooks/useStudentPayments'

type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'ONLINE_PAYMENT' | 'QR_PAYMENT' | 'CHEQUE'

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  ONLINE_PAYMENT: 'Online Payment',
  QR_PAYMENT: 'QR Payment',
  CHEQUE: 'Cheque',
}

const PAYMENT_METHODS = [
  'CASH',
  'BANK_TRANSFER',
  'ONLINE_PAYMENT',
  'QR_PAYMENT',
  'CHEQUE',
] as const

const schema = z.object({
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.enum(PAYMENT_METHODS),
  amount: z.number().gt(0, 'Amount must be greater than 0'),
  referenceNumber: z.string(),
  bankName: z.string(),
  transactionReference: z.string(),
  remarks: z.string(),
})

interface CollectPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: InvoiceResponse | null
}

export function CollectPaymentDialog({ open, onOpenChange, invoice }: CollectPaymentDialogProps) {
  const { currencyCode, formatAmount } = useCurrency()
  const { data: payments = [] } = useInvoicePayments(invoice?.id)
  const collect = useCollectPayment(invoice?.id ?? '')

  const paid = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0)
  const outstanding = (invoice?.totalAmount ?? 0) - paid

  const form = useForm({
    defaultValues: {
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'CASH' as PaymentMethod,
      amount: 0,
      referenceNumber: '',
      bankName: '',
      transactionReference: '',
      remarks: '',
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      if (!invoice?.id) return
      if (value.amount > outstanding) return
      await collect.mutateAsync({
        paymentDate: value.paymentDate,
        paymentMethod: value.paymentMethod,
        amount: value.amount,
        referenceNumber: value.referenceNumber || undefined,
        bankName: value.bankName || undefined,
        transactionReference: value.transactionReference || undefined,
        remarks: value.remarks || undefined,
      })
      onOpenChange(false)
    },
  })

  const paymentMethod = useStore(form.baseStore, (s) => s.values.paymentMethod)
  const currentAmount = useStore(form.baseStore, (s) => s.values.amount)
  const isAmountOverOutstanding = (currentAmount ?? 0) > outstanding && outstanding > 0

  useEffect(() => {
    if (!open) form.reset()
  }, [open, form])

  const showBankName = paymentMethod === 'BANK_TRANSFER' || paymentMethod === 'CHEQUE'
  const showTransactionRef =
    paymentMethod === 'BANK_TRANSFER' ||
    paymentMethod === 'ONLINE_PAYMENT' ||
    paymentMethod === 'CHEQUE'
  const transactionRefLabel = paymentMethod === 'CHEQUE' ? 'Cheque Number' : 'Transaction Reference'

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Collect Payment"
      description={invoice?.invoiceNumber ? `Invoice ${invoice.invoiceNumber}` : undefined}
      onSubmit={() => form.handleSubmit()}
      isSubmitting={collect.isPending}
      submitLabel="Collect Payment"
      className="sm:max-w-lg"
    >
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3 rounded-lg border bg-muted/40 p-3 text-center">
        <div>
          <p className="text-xs text-muted-foreground">Total ({currencyCode})</p>
          <p className="text-sm font-semibold font-mono">{formatAmount(invoice?.totalAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Paid ({currencyCode})</p>
          <p className="text-sm font-semibold font-mono text-green-600">{formatAmount(paid)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Outstanding ({currencyCode})</p>
          <p className="text-sm font-semibold font-mono text-amber-600">{formatAmount(outstanding)}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Payment Date */}
        <form.Field name="paymentDate">
          {(field) => {
            const selected = field.state.value ? new Date(field.state.value) : undefined
            return (
              <div className="grid gap-1.5">
                <Label>
                  Payment Date <span className="text-destructive">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.state.value && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {selected ? format(selected, 'd MMM yyyy') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      startMonth={new Date(1900, 0)}
                      endMonth={new Date(new Date().getFullYear() + 10, 11)}
                      selected={selected}
                      onSelect={(date) =>
                        field.handleChange(date ? format(date, 'yyyy-MM-dd') : '')
                      }
                    />
                  </PopoverContent>
                </Popover>
                {field.state.meta.errors[0] && (
                  <p className="text-xs text-destructive">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )
          }}
        </form.Field>

        {/* Payment Method */}
        <form.Field name="paymentMethod">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>
                Payment Method <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as PaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {PAYMENT_METHOD_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors[0] && (
                <p className="text-xs text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Amount */}
        <form.Field name="amount">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>
                Amount ({currencyCode}) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={0.01}
                step="any"
                placeholder="0"
                value={field.state.value || ''}
                onChange={(e) => {
                  const v = e.target.valueAsNumber
                  field.handleChange(isNaN(v) ? 0 : v)
                }}
                onBlur={field.handleBlur}
                className={isAmountOverOutstanding ? 'border-destructive' : ''}
              />
              {field.state.meta.errors[0] && (
                <p className="text-xs text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
              {isAmountOverOutstanding && (
                <p className="text-xs text-destructive">
                  Cannot exceed outstanding amount ({formatAmount(outstanding)} {currencyCode})
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Reference Number (all methods) */}
        <form.Field name="referenceNumber">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Reference Number</Label>
              <Input
                placeholder="Optional reference"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>

        {/* Bank Name (BANK_TRANSFER, CHEQUE) */}
        {showBankName && (
          <form.Field name="bankName">
            {(field) => (
              <div className="grid gap-1.5">
                <Label>Bank Name</Label>
                <Input
                  placeholder="e.g. KBZ Bank"
                  value={field.state.value ?? ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
        )}

        {/* Transaction Reference / Cheque Number */}
        {showTransactionRef && (
          <form.Field name="transactionReference">
            {(field) => (
              <div className="grid gap-1.5">
                <Label>{transactionRefLabel}</Label>
                <Input
                  placeholder={
                    paymentMethod === 'CHEQUE' ? 'Cheque number' : 'Transaction reference'
                  }
                  value={field.state.value ?? ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
        )}

        {/* Remarks */}
        <form.Field name="remarks">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Remarks</Label>
              <Textarea
                placeholder="Optional remarks"
                rows={2}
                className="resize-none"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="mt-2">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Payment History</p>
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Method</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Amount ({currencyCode})
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Receipt No.
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Collected By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-3 py-2 text-muted-foreground">
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-3 py-2">
                      {PAYMENT_METHOD_LABELS[p.paymentMethod as PaymentMethod] ??
                        p.paymentMethod ??
                        '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">
                      {formatAmount(p.amount)}
                    </td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">
                      {p.receiptNumber ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {p.receivedByName || p.receivedBy || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </FormDialog>
  )
}
