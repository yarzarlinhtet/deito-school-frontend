import { useState } from 'react'
import {
  AlertTriangle,
  DollarSign,
  FileText,
  Percent,
  Receipt,
  Tag,
  Trash2,
  TrendingDown,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { PermissionGuard } from '#/components/shared/permission-guard'
import { PERMISSIONS } from '#/constants/permissions'
import {
  useActiveDiscounts,
  useApplyDiscount,
  useFeeAccountDiscounts,
  useRemoveDiscount,
  useStudentFeeAccount,
} from '../hooks/useStudentFeeAccount'

const DISCOUNT_TYPE_LABEL: Record<string, string> = {
  PERCENTAGE_DISCOUNT: 'Percentage',
  FIXED_AMOUNT: 'Fixed Amount',
  SCHOLARSHIP: 'Scholarship',
  EARLY_PAYMENT: 'Early Payment',
  SIBLING_DISCOUNT: 'Sibling Discount',
  STAFF_DISCOUNT: 'Staff Discount',
}

function fmt(n?: number | null): string {
  if (n == null) return '—'
  return n.toLocaleString()
}

interface StudentFinanceTabProps {
  studentId: string
}

export function StudentFinanceTab({ studentId }: StudentFinanceTabProps) {
  const [applyOpen, setApplyOpen] = useState(false)
  const [feeItemId, setFeeItemId] = useState('')
  const [discountId, setDiscountId] = useState('')
  const [overrideValue, setOverrideValue] = useState('')
  const [remarks, setRemarks] = useState('')

  const { data: account, isLoading } = useStudentFeeAccount(studentId)
  const { data: discounts = [] } = useFeeAccountDiscounts(account?.id)
  const { data: availableDiscounts = [] } = useActiveDiscounts()
  const applyDiscount = useApplyDiscount(account?.id ?? '')
  const removeDiscount = useRemoveDiscount(account?.id ?? '')

  const feeItemMap = Object.fromEntries(
    (account?.items ?? []).map((item) => [item.id, item.feeCategoryName ?? item.id]),
  )

  const totalPaid = (account?.netAmount ?? 0) - (account?.outstandingBalance ?? 0)

  function openApply() {
    setFeeItemId('')
    setDiscountId('')
    setOverrideValue('')
    setRemarks('')
    setApplyOpen(true)
  }

  function handleApplySubmit() {
    if (!feeItemId || !discountId || !remarks.trim()) return
    applyDiscount.mutate(
      {
        studentFeeItemId: feeItemId,
        discountId,
        overrideValue: overrideValue ? Number(overrideValue) : undefined,
        remarks: remarks.trim(),
      },
      { onSuccess: () => setApplyOpen(false) },
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-lg border bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-48 rounded-lg border bg-muted animate-pulse" />
        <div className="h-48 rounded-lg border bg-muted animate-pulse" />
      </div>
    )
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center rounded-lg border border-dashed">
        <DollarSign className="size-10 text-muted-foreground/40" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">No fee account assigned</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            A fee account is created when the student is enrolled in a programme with a fee template.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding (MMK)
            </CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="size-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {fmt(account.outstandingBalance)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Charges (MMK)
            </CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <FileText className="size-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{fmt(account.totalAmount)}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Paid (MMK)
            </CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <Receipt className="size-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{fmt(totalPaid)}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Discounts (MMK)
            </CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <TrendingDown className="size-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{fmt(account.totalDiscount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Percent className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Fee Breakdown</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Net total:{' '}
                <span className="font-semibold text-foreground">{fmt(account.netAmount)} MMK</span>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!account.items?.length ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground text-center py-8">
              No fee items on this account.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">
                    Fee Category
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground text-xs">
                    Amount (MMK)
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground text-xs">
                    Discount (MMK)
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground text-xs">
                    Final (MMK)
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">
                    Frequency
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...(account.items ?? [])]
                  .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{item.feeCategoryName ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs">
                        {fmt(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-purple-600">
                        {item.discountAmount ? `-${fmt(item.discountAmount)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-semibold">
                        {fmt(item.finalAmount)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {item.billingFrequency ?? '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Discount Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base">Discount Management</CardTitle>
          <PermissionGuard permission={PERMISSIONS.BILLING.DISCOUNT.APPLY}>
            <Button size="sm" onClick={openApply}>
              <Tag className="size-4 mr-1.5" />
              Apply Discount
            </Button>
          </PermissionGuard>
        </CardHeader>
        <CardContent className="p-0">
          {!discounts.length ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground text-center py-8">
              No discounts applied to this account.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">
                    Discount Name
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">
                    Type
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground text-xs">
                    Amount (MMK)
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">
                    Fee Item
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">
                    Applied At
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground text-xs">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {discounts.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{d.discountName ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {DISCOUNT_TYPE_LABEL[d.discountType ?? ''] ?? d.discountType ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-purple-600">
                      {fmt(d.discountAmount)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {feeItemMap[d.feeItemId ?? ''] ?? d.feeItemId ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {d.appliedAt ? new Date(d.appliedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PermissionGuard permission={PERMISSIONS.BILLING.DISCOUNT.UPDATE}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          disabled={removeDiscount.isPending}
                          onClick={() => removeDiscount.mutate(d.id!)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </PermissionGuard>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Invoice Management — placeholder */}
      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base">Invoice Management</CardTitle>
          <Button size="sm" disabled>
            Generate Invoice
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            Invoice management coming soon.
          </p>
        </CardContent>
      </Card> */}

      {/* Payment Collection — placeholder */}
      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-base">Payment Collection</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Record a payment against any outstanding invoice and generate a receipt instantly.
            </p>
          </div>
          <Button disabled>
            <DollarSign className="size-4 mr-1.5" />
            Collect Payment
          </Button>
        </CardHeader>
      </Card> */}

      {/* Installment Plans — placeholder */}
      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base">Installment Plans</CardTitle>
          <Button size="sm" variant="outline" disabled>
            Create Installment Plan
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            Installment plans coming soon.
          </p>
        </CardContent>
      </Card> */}

      {/* Financial Ledger — placeholder */}
      {/* <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Financial Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            Financial ledger coming soon.
          </p>
        </CardContent>
      </Card>*/}

      {/* Billing Timeline — placeholder */}
      {/* <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Billing Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            Billing timeline coming soon.
          </p>
        </CardContent>
      </Card> */} 

      {/* Apply Discount Dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply Discount</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Fee Item *</Label>
              <Select value={feeItemId} onValueChange={setFeeItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee item" />
                </SelectTrigger>
                <SelectContent>
                  {(account.items ?? []).map((item) => (
                    <SelectItem key={item.id} value={item.id!}>
                      {item.feeCategoryName ?? item.id} — {fmt(item.finalAmount)} MMK
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Discount *</Label>
              <Select value={discountId} onValueChange={setDiscountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select discount" />
                </SelectTrigger>
                <SelectContent>
                  {availableDiscounts.map((d) => (
                    <SelectItem key={d.id} value={d.id!}>
                      {d.name} {d.code ? `(${d.code})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Override Value</Label>
              <Input
                type="number"
                placeholder="Leave blank to use configured value"
                value={overrideValue}
                onChange={(e) => setOverrideValue(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Remarks *</Label>
              <Input
                placeholder="e.g. Approved by principal"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setApplyOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!feeItemId || !discountId || !remarks.trim() || applyDiscount.isPending}
              onClick={handleApplySubmit}
            >
              Apply Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
