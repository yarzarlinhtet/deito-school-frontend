import { Trash2, Plus } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { LookupSelect } from '#/components/shared/form/LookupSelect'
import { useFeeCategories } from '../hooks/useFeeCategories'

const BILLING_FREQ_OPTIONS = [
  { value: 'ONE_TIME', label: 'One-Time' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
] as const

export interface FeeItemValue {
  feeCategoryId: string
  amount: string
  isRecurring: boolean
  billingFrequency: 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | ''
  displayOrder: string
  remarks: string
}

interface FeeItemTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  itemsError?: string
}

export function FeeItemTable({ form, itemsError }: FeeItemTableProps) {
  const { data: categories, isLoading: isLoadingCategories } = useFeeCategories({ status: 'ACTIVE', size: 200 })
  const catList = categories?.items ?? []

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">
          Fee Items <span className="text-destructive">*</span>
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            form.pushFieldValue('items', {
              feeCategoryId: '',
              amount: '',
              isRecurring: false,
              billingFrequency: '',
              displayOrder: '',
              remarks: '',
            } satisfies FeeItemValue)
          }
        >
          <Plus className="size-3.5" />
          Add Item
        </Button>
      </div>

      {itemsError && (
        <p className="mb-2 text-xs text-destructive">{itemsError}</p>
      )}

      <form.Field name="items" mode="array">
        {(field: any) => {
          const items = (field.state.value ?? []) as FeeItemValue[]

          return (
            <>
              {/* Mobile card layout */}
              <div className="block sm:hidden rounded-md border">
                {items.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No items yet. Click "Add Item" to begin.
                  </p>
                ) : (
                  items.map((_, i) => (
                    <div key={i} className="space-y-2 border-b p-3 last:border-0">
                      {/* Category + Delete */}
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <p className="mb-1 text-xs text-muted-foreground">Category</p>
                          <form.Field name={`items[${i}].feeCategoryId`}>
                            {(f: any) => (
                              <div>
                                <LookupSelect
                                  value={f.state.value as string}
                                  onValueChange={(v) => f.handleChange(v)}
                                  items={catList}
                                  isLoading={isLoadingCategories}
                                  placeholder="Select…"
                                  className="h-8 w-full"
                                />
                                {f.state.meta.errors[0] && (
                                  <p className="mt-0.5 text-xs text-destructive">
                                    {String(f.state.meta.errors[0])}
                                  </p>
                                )}
                              </div>
                            )}
                          </form.Field>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="mt-5 size-8 shrink-0 text-muted-foreground hover:text-destructive"
                          disabled={items.length <= 1}
                          onClick={() => form.removeFieldValue('items', i)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>

                      {/* Amount + Order */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="mb-1 text-xs text-muted-foreground">Amount</p>
                          <form.Field name={`items[${i}].amount`}>
                            {(f: any) => (
                              <div>
                                <Input
                                  type="number"
                                  min={0.01}
                                  step="any"
                                  className="h-8 w-full font-mono"
                                  placeholder="0"
                                  value={f.state.value as string}
                                  onChange={(e) => f.handleChange(e.target.value)}
                                />
                                {f.state.meta.errors[0] && (
                                  <p className="mt-0.5 text-xs text-destructive">
                                    {String(f.state.meta.errors[0])}
                                  </p>
                                )}
                              </div>
                            )}
                          </form.Field>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-muted-foreground">Order</p>
                          <form.Field name={`items[${i}].displayOrder`}>
                            {(f: any) => (
                              <Input
                                type="number"
                                min={0}
                                className="h-8 w-full"
                                placeholder="0"
                                value={f.state.value as string}
                                onChange={(e) => f.handleChange(e.target.value)}
                              />
                            )}
                          </form.Field>
                        </div>
                      </div>

                      {/* Recurring + Frequency */}
                      <div className="flex items-center gap-3">
                        <form.Field name={`items[${i}].isRecurring`}>
                          {(f: any) => (
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={!!f.state.value}
                                onCheckedChange={(checked) => f.handleChange(!!checked)}
                              />
                              <span className="text-sm">Recurring</span>
                            </div>
                          )}
                        </form.Field>
                        <form.Field name={`items[${i}].billingFrequency`}>
                          {(f: any) => {
                            const isRecurring = (items[i] as FeeItemValue).isRecurring
                            return (
                              <Select
                                value={(f.state.value as string) || ''}
                                onValueChange={(v) => f.handleChange(v)}
                                disabled={!isRecurring}
                              >
                                <SelectTrigger className="h-8 flex-1">
                                  <SelectValue placeholder="Frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                  {BILLING_FREQ_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )
                          }}
                        </form.Field>
                      </div>

                      {/* Remarks */}
                      <div>
                        <p className="mb-1 text-xs text-muted-foreground">Remarks</p>
                        <form.Field name={`items[${i}].remarks`}>
                          {(f: any) => (
                            <Input
                              className="h-8 w-full"
                              placeholder="Optional"
                              value={f.state.value as string}
                              onChange={(e) => f.handleChange(e.target.value)}
                            />
                          )}
                        </form.Field>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop table layout */}
              <div className="hidden overflow-x-auto rounded-md border sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Category</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Amount</th>
                      <th className="px-3 py-2 text-center font-medium text-muted-foreground">Recurring</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Frequency</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Order</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Remarks</th>
                      <th className="w-10 px-2 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                          No items yet. Click "Add Item" to begin.
                        </td>
                      </tr>
                    ) : (
                      items.map((_, i) => (
                        <tr key={i} className="border-b last:border-0">
                          {/* Fee Category */}
                          <td className="px-3 py-2">
                            <form.Field name={`items[${i}].feeCategoryId`}>
                              {(f: any) => (
                                <div>
                                  <LookupSelect
                                    value={f.state.value as string}
                                    onValueChange={(v) => f.handleChange(v)}
                                    items={catList}
                                    isLoading={isLoadingCategories}
                                    placeholder="Select…"
                                    className="h-8 w-[140px] min-w-[120px]"
                                  />
                                  {f.state.meta.errors[0] && (
                                    <p className="mt-0.5 text-xs text-destructive">
                                      {String(f.state.meta.errors[0])}
                                    </p>
                                  )}
                                </div>
                              )}
                            </form.Field>
                          </td>

                          {/* Amount */}
                          <td className="px-3 py-2">
                            <form.Field name={`items[${i}].amount`}>
                              {(f: any) => (
                                <div>
                                  <Input
                                    type="number"
                                    min={0.01}
                                    step="any"
                                    className="h-8 w-20 font-mono"
                                    placeholder="0"
                                    value={f.state.value as string}
                                    onChange={(e) => f.handleChange(e.target.value)}
                                  />
                                  {f.state.meta.errors[0] && (
                                    <p className="mt-0.5 text-xs text-destructive">
                                      {String(f.state.meta.errors[0])}
                                    </p>
                                  )}
                                </div>
                              )}
                            </form.Field>
                          </td>

                          {/* Recurring */}
                          <td className="px-3 py-2 text-center">
                            <form.Field name={`items[${i}].isRecurring`}>
                              {(f: any) => (
                                <Checkbox
                                  checked={!!f.state.value}
                                  onCheckedChange={(checked) => f.handleChange(!!checked)}
                                />
                              )}
                            </form.Field>
                          </td>

                          {/* Billing Frequency */}
                          <td className="px-3 py-2">
                            <form.Field name={`items[${i}].billingFrequency`}>
                              {(f: any) => {
                                const isRecurring = (items[i] as FeeItemValue).isRecurring
                                return (
                                  <Select
                                    value={(f.state.value as string) || ''}
                                    onValueChange={(v) => f.handleChange(v)}
                                    disabled={!isRecurring}
                                  >
                                    <SelectTrigger className="h-8 w-[110px]">
                                      <SelectValue placeholder="—" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {BILLING_FREQ_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )
                              }}
                            </form.Field>
                          </td>

                          {/* Display Order */}
                          <td className="px-3 py-2">
                            <form.Field name={`items[${i}].displayOrder`}>
                              {(f: any) => (
                                <Input
                                  type="number"
                                  min={0}
                                  className="h-8 w-14"
                                  placeholder="0"
                                  value={f.state.value as string}
                                  onChange={(e) => f.handleChange(e.target.value)}
                                />
                              )}
                            </form.Field>
                          </td>

                          {/* Remarks */}
                          <td className="px-3 py-2">
                            <form.Field name={`items[${i}].remarks`}>
                              {(f: any) => (
                                <Input
                                  className="h-8"
                                  placeholder="Optional"
                                  value={f.state.value as string}
                                  onChange={(e) => f.handleChange(e.target.value)}
                                />
                              )}
                            </form.Field>
                          </td>

                          {/* Remove */}
                          <td className="px-2 py-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-destructive"
                              disabled={items.length <= 1}
                              onClick={() => form.removeFieldValue('items', i)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )
        }}
      </form.Field>
    </div>
  )
}
