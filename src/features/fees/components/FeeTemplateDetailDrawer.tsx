import { Sheet, SheetContent, SheetHeader, SheetTitle } from '#/components/ui/sheet'
import { StatusBadge } from '#/components/shared/status-badge/StatusBadge'
import { Badge } from '#/components/ui/badge'
import { Separator } from '#/components/ui/separator'
import { useCurrency } from '#/hooks/useCurrency'
import { useFeeTemplateDetail } from '../hooks/useFeeTemplates'
import { useAcademicYears } from '#/features/enrollment/hooks/useAcademicYears'

const BILLING_FREQ_LABELS: Record<string, string> = {
  ONE_TIME: 'One-Time',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
}

function templateStatusKey(status?: string): string {
  switch (status) {
    case 'ACTIVE': return 'active'
    case 'INACTIVE': return 'inactive'
    case 'ARCHIVED': return 'inactive'
    default: return 'inactive'
  }
}

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

interface FeeTemplateDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateId: string | null
}

export function FeeTemplateDetailDrawer({
  open,
  onOpenChange,
  templateId,
}: FeeTemplateDetailDrawerProps) {
  const { formatAmount } = useCurrency()
  const { data: detail, isLoading } = useFeeTemplateDetail(open ? templateId : null)
  const { data: academicYears } = useAcademicYears({ size: 100 })

  const ayMap = Object.fromEntries(
    (academicYears?.items ?? []).map((ay) => [ay.id, ay.name ?? ay.id])
  )

  const totalAmount = detail?.items?.reduce((sum, item) => sum + (item.amount ?? 0), 0) ?? 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-2xl" side="right">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <SheetTitle className="truncate">{detail?.name ?? 'Fee Template'}</SheetTitle>
            {detail?.status && (
              <StatusBadge status={templateStatusKey(detail.status)} />
            )}
          </div>
          {detail?.code && (
            <p className="font-mono text-xs text-muted-foreground">{detail.code}</p>
          )}
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading…</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4">
            {/* General Info */}
            <section className="mb-6 px-6">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                General Information
              </h3>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                {detail?.description && (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Description</dt>
                    <dd className="mt-0.5">{detail.description}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">Academic Year</dt>
                  <dd className="mt-0.5 font-medium">
                    {detail?.academicYearId ? ayMap[detail.academicYearId] ?? detail.academicYearId : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Default Template</dt>
                  <dd className="mt-0.5">
                    {detail?.isDefault ? (
                      <Badge variant="secondary">Yes</Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="mt-0.5">{formatDate(detail?.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Last Updated</dt>
                  <dd className="mt-0.5">{formatDate(detail?.updatedAt)}</dd>
                </div>
              </dl>
            </section>

            <Separator />

            {/* Fee Items */}
            <section className="mt-6 px-6">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Fee Items ({detail?.items?.length ?? 0})
              </h3>

              {(!detail?.items || detail.items.length === 0) ? (
                <p className="text-sm text-muted-foreground">No fee items.</p>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Category</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Amount</th>
                        <th className="px-3 py-2 text-center font-medium text-muted-foreground">Recurring</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Frequency</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.items.map((item, i) => (
                        <tr key={item.id ?? i} className="border-b last:border-0">
                          <td className="px-3 py-2 font-medium">
                            {item.feeCategoryName ?? item.feeCategoryId ?? '—'}
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {formatAmount(item.amount)}
                          </td>
                          <td className="px-3 py-2 text-center text-muted-foreground">
                            {item.isRecurring ? '✓' : '—'}
                          </td>
                          <td className="px-3 py-2">
                            {item.billingFrequency
                              ? BILLING_FREQ_LABELS[item.billingFrequency] ?? item.billingFrequency
                              : '—'}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {item.remarks ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Summary */}
            <section className="mt-6 px-6">
              <Separator className="mb-4" />
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <div className="text-sm text-muted-foreground">
                  Total Amount
                  <span className="ml-2 text-xs">({detail?.items?.length ?? 0} items)</span>
                </div>
                <span className="font-mono text-base font-bold">
                  {formatAmount(totalAmount)}
                </span>
              </div>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
