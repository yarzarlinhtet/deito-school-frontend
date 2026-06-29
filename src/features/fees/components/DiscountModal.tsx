import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { FormDialog } from '#/components/shared/form/FormDialog'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { useCreateDiscount, useUpdateDiscount } from '../hooks/useDiscounts'
import { useFeeCategories } from '../hooks/useFeeCategories'
import type { DiscountResponse } from '#/generated/model'

type DiscountType =
  | 'PERCENTAGE_DISCOUNT'
  | 'FIXED_AMOUNT'
  | 'SCHOLARSHIP'
  | 'EARLY_PAYMENT'
  | 'SIBLING_DISCOUNT'
  | 'STAFF_DISCOUNT'

type DiscountStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED'

const DISCOUNT_TYPE_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: 'PERCENTAGE_DISCOUNT', label: 'Percentage Discount' },
  { value: 'FIXED_AMOUNT', label: 'Fixed Amount' },
  { value: 'SCHOLARSHIP', label: 'Scholarship' },
  { value: 'EARLY_PAYMENT', label: 'Early Payment' },
  { value: 'SIBLING_DISCOUNT', label: 'Sibling Discount' },
  { value: 'STAFF_DISCOUNT', label: 'Staff Discount' },
]

const schema = z
  .object({
    code: z.string().min(1, 'Code is required').max(50, 'Max 50 characters'),
    name: z.string().min(1, 'Name is required').max(200, 'Max 200 characters'),
    discountType: z.enum([
      'PERCENTAGE_DISCOUNT',
      'FIXED_AMOUNT',
      'SCHOLARSHIP',
      'EARLY_PAYMENT',
      'SIBLING_DISCOUNT',
      'STAFF_DISCOUNT',
    ] as const),
    value: z.string().min(1, 'Value is required'),
    feeCategoryIds: z.array(z.string()).min(1, 'Select at least one fee category'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    description: z.string(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED'] as const),
  })
  .refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  })

interface DiscountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: DiscountResponse | null
}

export function DiscountModal({ open, onOpenChange, editTarget }: DiscountModalProps) {
  const isEdit = !!editTarget
  const create = useCreateDiscount()
  const update = useUpdateDiscount()
  const isPending = create.isPending || update.isPending

  const { data: categoriesPage } = useFeeCategories({ status: 'ACTIVE', size: 200 })
  const categories = categoriesPage?.items ?? []

  // Local state for dynamic value suffix (no form.useStore)
  const [selectedType, setSelectedType] = useState<string>(
    editTarget?.discountType ?? '',
  )

  const form = useForm({
    defaultValues: {
      code: editTarget?.code ?? '',
      name: editTarget?.name ?? '',
      discountType: (editTarget?.discountType ?? '') as DiscountType | '',
      value: editTarget?.value != null ? String(editTarget.value) : '',
      feeCategoryIds: editTarget?.feeCategoryIds ?? ([] as string[]),
      startDate: editTarget?.startDate ?? '',
      endDate: editTarget?.endDate ?? '',
      description: editTarget?.description ?? '',
      status: (editTarget?.status ?? 'ACTIVE') as DiscountStatus,
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const numValue = parseFloat(value.value)
      if (isEdit) {
        await update.mutateAsync({
          id: editTarget!.id!,
          req: {
            name: value.name,
            discountType: value.discountType as DiscountType,
            value: numValue,
            feeCategoryIds: value.feeCategoryIds,
            startDate: value.startDate,
            endDate: value.endDate,
            status: value.status,
            description: value.description || undefined,
          },
        })
      } else {
        await create.mutateAsync({
          code: value.code,
          name: value.name,
          discountType: value.discountType as DiscountType,
          value: numValue,
          feeCategoryIds: value.feeCategoryIds,
          startDate: value.startDate,
          endDate: value.endDate,
          status: 'ACTIVE' as const,
          description: value.description || undefined,
        })
      }
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (!open) {
      form.reset()
      setSelectedType(editTarget?.discountType ?? '')
    }
  }, [open, form, editTarget?.discountType])

  const isPercent = selectedType === 'PERCENTAGE_DISCOUNT'

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Discount' : 'New Discount Rule'}
      description={
        isEdit ? 'Update discount details.' : 'Create a new discount rule.'
      }
      onSubmit={() => form.handleSubmit()}
      isSubmitting={isPending}
      submitLabel={isEdit ? 'Update' : 'Create Discount'}
    >
      <div className="grid gap-4">
        {/* Code */}
        <div className="grid gap-1.5">
          <Label htmlFor="disc-code">
            Code <span className="text-destructive">*</span>
          </Label>
          {isEdit ? (
            <p className="rounded-md border bg-muted/40 px-3 py-2 font-mono text-sm">
              {editTarget?.code ?? '—'}
            </p>
          ) : (
            <form.Field name="code">
              {(field) => (
                <>
                  <Input
                    id="disc-code"
                    placeholder="e.g. SCHOLAR-50"
                    maxLength={50}
                    className="font-mono uppercase"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors[0] && (
                    <p className="text-xs text-destructive">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </>
              )}
            </form.Field>
          )}
        </div>

        {/* Name */}
        <form.Field name="name">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="disc-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="disc-name"
                placeholder="e.g. Academic Excellence Scholarship"
                maxLength={200}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors[0] && (
                <p className="text-xs text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Discount Type + Value (2-col) */}
        <div className="grid grid-cols-2 gap-3">
          <form.Field name="discountType">
            {(field) => (
              <div className="grid gap-1.5">
                <Label>
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(v) => {
                    field.handleChange(v as DiscountType)
                    setSelectedType(v)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCOUNT_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
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

          <form.Field name="value">
            {(field) => (
              <div className="grid gap-1.5">
                <Label htmlFor="disc-value">
                  Value <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="disc-value"
                    type="number"
                    min={0}
                    max={isPercent ? 100 : undefined}
                    step="0.01"
                    placeholder={isPercent ? '0–100' : '0.01'}
                    className={isPercent ? 'pr-8' : ''}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {isPercent && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  )}
                </div>
                {field.state.meta.errors[0] && (
                  <p className="text-xs text-destructive">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        {/* Fee Categories — multi-select checkboxes */}
        <form.Field name="feeCategoryIds">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>
                Applies To <span className="text-destructive">*</span>
              </Label>
              <div className="max-h-40 overflow-y-auto rounded-md border p-2">
                {categories.length === 0 ? (
                  <p className="py-2 text-center text-xs text-muted-foreground">
                    No active fee categories found
                  </p>
                ) : (
                  categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={field.state.value.includes(cat.id!)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.handleChange([...field.state.value, cat.id!])
                          } else {
                            field.handleChange(
                              field.state.value.filter((id) => id !== cat.id),
                            )
                          }
                        }}
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))
                )}
              </div>
              {field.state.meta.errors[0] && (
                <p className="text-xs text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Start Date + End Date (2-col) */}
        <div className="grid grid-cols-2 gap-3">
          <form.Field name="startDate">
            {(field) => (
              <div className="grid gap-1.5">
                <Label htmlFor="disc-start">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="disc-start"
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors[0] && (
                  <p className="text-xs text-destructive">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="endDate">
            {(field) => (
              <div className="grid gap-1.5">
                <Label htmlFor="disc-end">
                  End Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="disc-end"
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors[0] && (
                  <p className="text-xs text-destructive">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        {/* Description */}
        <form.Field name="description">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="disc-desc">Description</Label>
              <Textarea
                id="disc-desc"
                rows={2}
                placeholder="Optional description or eligibility criteria"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

        {/* Status — edit only */}
        {isEdit && (
          <form.Field name="status">
            {(field) => (
              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(v) => field.handleChange(v as DiscountStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
        )}
      </div>
    </FormDialog>
  )
}
