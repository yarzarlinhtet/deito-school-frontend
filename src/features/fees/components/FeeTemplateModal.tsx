import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
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
import { Separator } from '#/components/ui/separator'
import { LookupSelect } from '#/components/shared/form/LookupSelect'
import { useAcademicYears } from '#/features/enrollment/hooks/useAcademicYears'
import { useCreateFeeTemplate, useUpdateFeeTemplate, useFeeTemplateDetail } from '../hooks/useFeeTemplates'
import { FeeItemTable, type FeeItemValue } from './FeeItemTable'
import type { FeeTemplateResponse } from '#/generated/model'

const itemSchema = z.object({
  feeCategoryId: z.string().min(1, 'Category is required'),
  amount: z.string().refine((v) => v !== '' && Number(v) > 0, { message: 'Amount must be > 0' }),
  isRecurring: z.boolean(),
  billingFrequency: z.enum(['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'YEARLY', '']),
  displayOrder: z.string(),
  remarks: z.string(),
})

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Max 200 characters'),
  description: z.string(),
  academicYearId: z.string(),
  isDefault: z.boolean(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']),
  items: z
    .array(itemSchema)
    .min(1, 'At least one fee item is required')
    .refine(
      (items) =>
        new Set(items.map((i) => i.feeCategoryId).filter(Boolean)).size ===
        items.filter((i) => i.feeCategoryId).length,
      { message: 'Duplicate fee categories are not allowed' }
    ),
})

const DEFAULT_ITEM: FeeItemValue = {
  feeCategoryId: '',
  amount: '',
  isRecurring: false,
  billingFrequency: '' as FeeItemValue['billingFrequency'],
  displayOrder: '',
  remarks: '',
}

interface FeeTemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: FeeTemplateResponse
}

export function FeeTemplateModal({ open, onOpenChange, editTarget }: FeeTemplateModalProps) {
  const isEdit = !!editTarget
  const create = useCreateFeeTemplate()
  const update = useUpdateFeeTemplate()
  const isPending = create.isPending || update.isPending

  const { data: academicYears, isLoading: isLoadingAY } = useAcademicYears({ size: 100 })
  const { data: detail } = useFeeTemplateDetail(isEdit ? (editTarget?.id ?? null) : null)

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      academicYearId: '',
      isDefault: false,
      status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
      items: [{ ...DEFAULT_ITEM }] as FeeItemValue[],
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const items = value.items.map((item: FeeItemValue, i: number) => ({
        feeCategoryId: item.feeCategoryId,
        amount: Number(item.amount),
        isRecurring: item.isRecurring,
        billingFrequency: item.billingFrequency !== '' ? (item.billingFrequency as any) : undefined,
        displayOrder: item.displayOrder !== '' ? Number(item.displayOrder) : i,
        remarks: item.remarks || undefined,
      }))

      if (isEdit) {
        await update.mutateAsync({
          id: editTarget!.id!,
          req: {
            name: value.name,
            description: value.description || undefined,
            academicYearId: value.academicYearId || undefined,
            isDefault: value.isDefault,
            status: value.status ?? 'ACTIVE',
            items,
          },
        })
      } else {
        await create.mutateAsync({
          name: value.name,
          description: value.description || undefined,
          academicYearId: value.academicYearId || undefined,
          isDefault: value.isDefault,
          items,
        })
      }
      onOpenChange(false)
    },
  })

  // Pre-populate edit data when detail loads
  useEffect(() => {
    if (isEdit && detail && open) {
      form.setFieldValue('name', detail.name ?? '')
      form.setFieldValue('description', detail.description ?? '')
      form.setFieldValue('academicYearId', detail.academicYearId ?? '')
      form.setFieldValue('isDefault', detail.isDefault ?? false)
      form.setFieldValue('status', (detail.status ?? 'ACTIVE') as any)
      if (detail.items && detail.items.length > 0) {
        form.setFieldValue(
          'items',
          detail.items.map((item) => ({
            feeCategoryId: item.feeCategoryId ?? '',
            amount: item.amount != null ? String(item.amount) : '',
            isRecurring: item.isRecurring ?? false,
            billingFrequency: (item.billingFrequency ?? '') as FeeItemValue['billingFrequency'],
            displayOrder: item.displayOrder != null ? String(item.displayOrder) : '',
            remarks: item.remarks ?? '',
          })) as FeeItemValue[]
        )
      }
    }
  }, [isEdit, detail, open, form])

  useEffect(() => {
    if (!open) form.reset()
  }, [open, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden p-0 sm:max-h-[90vh]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{isEdit ? 'Edit Fee Template' : 'New Fee Template'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update template details and fee items.'
              : 'Create a reusable fee template with individual fee items.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-2">
          <div className="grid gap-5 py-4">
            {/* Name */}
            <form.Field name="name">
              {(field) => (
                <div className="grid gap-1.5">
                  <Label htmlFor="ft-name">
                    Template Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ft-name"
                    placeholder="e.g. 2025–2026 Full Year Template"
                    maxLength={200}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors[0] && (
                    <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Description */}
            <form.Field name="description">
              {(field) => (
                <div className="grid gap-1.5">
                  <Label htmlFor="ft-desc">Description</Label>
                  <Textarea
                    id="ft-desc"
                    rows={2}
                    placeholder="Optional description"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Academic Year */}
              <form.Field name="academicYearId">
                {(field) => (
                  <div className="grid gap-1.5">
                    <Label>Academic Year</Label>
                    <LookupSelect
                      value={field.state.value || '__none__'}
                      onValueChange={(v) => field.handleChange(v === '__none__' ? '' : v)}
                      items={academicYears?.items}
                      isLoading={isLoadingAY}
                      placeholder="Select (optional)"
                      extraItems={<SelectItem value="__none__">None</SelectItem>}
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
                        onValueChange={(v) =>
                          field.handleChange(v as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED')
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>
              )}
            </div>

            {/* Is Default */}
            <form.Field name="isDefault">
              {(field) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="ft-default"
                    checked={!!field.state.value}
                    onCheckedChange={(v) => field.handleChange(!!v)}
                  />
                  <Label htmlFor="ft-default" className="cursor-pointer font-normal">
                    Set as default template for new enrollments
                  </Label>
                </div>
              )}
            </form.Field>

            <Separator />

            {/* Fee Items */}
            <form.Field name="items">
              {(field) => (
                <div className="overflow-x-auto">
                  <FeeItemTable
                    form={form}
                    itemsError={
                      field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined
                    }
                  />
                </div>
              )}
            </form.Field>
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={() => form.handleSubmit()} disabled={isPending}>
            {isPending ? 'Saving…' : isEdit ? 'Update Template' : 'Create Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
