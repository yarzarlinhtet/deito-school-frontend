import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { Textarea } from '#/components/ui/textarea'
import { cn } from '#/lib/utils'
import type { InvoiceResponse, StudentFeeItemResponse } from '#/generated/model'
import { useCurrency } from '#/hooks/useCurrency'
import { useGenerateInvoice } from '../hooks/useStudentInvoice'

function todayISO(): string {
  return new Date().toISOString().split('T')[0]!
}

interface ItemState {
  selected: boolean
  amount: string
}

interface OpenInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feeAccountId: string
  feeItems: StudentFeeItemResponse[]
  existingInvoices: InvoiceResponse[]
}

export function OpenInvoiceDialog({
  open,
  onOpenChange,
  feeAccountId,
  feeItems,
  existingInvoices,
}: OpenInvoiceDialogProps) {
  const { currencyCode, formatAmount } = useCurrency()
  const generate = useGenerateInvoice(feeAccountId)

  const [invoiceDate, setInvoiceDate] = useState(todayISO)
  const [dueDate, setDueDate] = useState('')
  const [remarks, setRemarks] = useState('')
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>({})

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setInvoiceDate(todayISO())
      setDueDate('')
      setRemarks('')
      const initial: Record<string, ItemState> = {}
      for (const item of feeItems) {
        if (item.id) initial[item.id] = { selected: false, amount: '' }
      }
      setItemStates(initial)
    }
  }, [open, feeItems])

  // Total already invoiced per fee item id
  const totalInvoicedMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const inv of existingInvoices) {
      for (const it of inv.items ?? []) {
        if (it.feeItemId) {
          map[it.feeItemId] = (map[it.feeItemId] ?? 0) + (it.invoiceAmount ?? 0)
        }
      }
    }
    return map
  }, [existingInvoices])

  const sortedItems = [...feeItems].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  )

  function remainingBillable(item: StudentFeeItemResponse): number {
    return Math.max(0, (item.finalAmount ?? 0) - (totalInvoicedMap[item.id ?? ''] ?? 0))
  }

  function toggleItem(id: string, checked: boolean) {
    setItemStates((prev) => ({
      ...prev,
      [id]: { ...prev[id]!, selected: checked, amount: checked ? prev[id]?.amount ?? '' : '' },
    }))
  }

  function setAmount(id: string, val: string) {
    setItemStates((prev) => ({ ...prev, [id]: { ...prev[id]!, amount: val } }))
  }

  const selectedItems = sortedItems.filter((item) => item.id && itemStates[item.id]?.selected)

  const subtotal = selectedItems.reduce((sum, item) => {
    return sum + (parseFloat(itemStates[item.id!]?.amount ?? '') || 0)
  }, 0)

  const itemErrors: Record<string, string> = {}
  let isValid = !!invoiceDate && selectedItems.length > 0

  for (const item of selectedItems) {
    const state = itemStates[item.id!]
    const amount = parseFloat(state?.amount ?? '')
    const remaining = remainingBillable(item)
    if (!state?.amount || isNaN(amount) || amount <= 0) {
      itemErrors[item.id!] = 'Amount must be greater than 0'
      isValid = false
    } else if (amount > remaining) {
      itemErrors[item.id!] = `Cannot exceed remaining billable (${formatAmount(remaining)})`
      isValid = false
    }
  }

  function handleSubmit() {
    if (!isValid) return
    generate.mutate(
      {
        invoiceDate,
        dueDate: dueDate || undefined,
        remarks: remarks.trim() || undefined,
        items: selectedItems.map((item) => ({
          feeItemId: item.id!,
          invoiceAmount: parseFloat(itemStates[item.id!]!.amount),
        })),
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Open Invoice</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-2">
          {/* Date fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Invoice Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !invoiceDate && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {invoiceDate ? format(new Date(invoiceDate), 'd MMM yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    startMonth={new Date(1900, 0)}
                    endMonth={new Date(new Date().getFullYear() + 10, 11)}
                    selected={invoiceDate ? new Date(invoiceDate) : undefined}
                    onSelect={(date) => setInvoiceDate(date ? format(date, 'yyyy-MM-dd') : '')}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !dueDate && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {dueDate ? format(new Date(dueDate), 'd MMM yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    startMonth={new Date(1900, 0)}
                    endMonth={new Date(new Date().getFullYear() + 10, 11)}
                    selected={dueDate ? new Date(dueDate) : undefined}
                    onSelect={(date) => setDueDate(date ? format(date, 'yyyy-MM-dd') : '')}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <Label>Remarks</Label>
            <Textarea
              placeholder="Optional note for this invoice…"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Fee Items table */}
          <div className="space-y-1.5">
            <Label>Fee Items</Label>
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2.5 w-8" />
                    <th className="px-3 py-2.5 text-left font-medium text-muted-foreground text-xs">
                      Fee Category
                    </th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground text-xs">
                      Net Amount
                    </th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground text-xs">
                      Total Invoiced
                    </th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground text-xs">
                      Remaining Billable
                    </th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground text-xs">
                      Invoice Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-sm text-muted-foreground">
                        No fee items available.
                      </td>
                    </tr>
                  ) : (
                    sortedItems.map((item) => {
                      const id = item.id!
                      const state = itemStates[id]
                      const remaining = remainingBillable(item)
                      const totalInvoiced = totalInvoicedMap[id] ?? 0
                      const exhausted = remaining <= 0
                      const isChecked = state?.selected ?? false
                      const error = itemErrors[id]

                      return (
                        <tr
                          key={id}
                          className={exhausted ? 'opacity-50' : 'hover:bg-muted/30 transition-colors'}
                        >
                          <td className="px-3 py-3 text-center">
                            <Checkbox
                              checked={isChecked}
                              disabled={exhausted}
                              onCheckedChange={(checked) => toggleItem(id, !!checked)}
                            />
                          </td>
                          <td className="px-3 py-3 font-medium">
                            {item.feeCategoryName ?? '—'}
                            {exhausted && (
                              <span className="ml-2 text-xs text-muted-foreground">(Fully invoiced)</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right font-mono text-xs">
                            {formatAmount(item.finalAmount)}
                          </td>
                          <td className="px-3 py-3 text-right font-mono text-xs text-muted-foreground">
                            {formatAmount(totalInvoiced)}
                          </td>
                          <td className={`px-3 py-3 text-right font-mono text-xs font-semibold ${remaining > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {formatAmount(remaining)}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <Input
                                type="number"
                                min={0.01}
                                max={remaining}
                                step="any"
                                className="h-8 w-32 text-right text-xs"
                                placeholder="0"
                                disabled={!isChecked || exhausted}
                                value={state?.amount ?? ''}
                                onChange={(e) => setAmount(id, e.target.value)}
                              />
                              {error && isChecked && (
                                <span className="text-[10px] text-destructive max-w-[128px] text-right leading-tight">
                                  {error}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subtotal */}
          {selectedItems.length > 0 && (
            <div className="flex justify-end">
              <p className="text-sm text-muted-foreground">
                Subtotal:{' '}
                <span className="font-semibold text-foreground">{formatAmount(subtotal)} {currencyCode}</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={generate.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || generate.isPending}>
            {generate.isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            Generate Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
