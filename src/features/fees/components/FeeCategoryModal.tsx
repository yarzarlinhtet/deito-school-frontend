import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { FormDialog } from '#/components/shared/form/FormDialog'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { useCreateFeeCategory, useUpdateFeeCategory } from '../hooks/useFeeCategories'
import type { FeeCategoryResponse } from '#/generated/model'

const FREQUENCY_OPTIONS = [
  { value: 'ONE_TIME', label: 'One-Time' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'SEMESTER', label: 'Semester' },
  { value: 'YEARLY', label: 'Yearly' },
  { value: 'ANNUAL', label: 'Annual' },
  { value: 'VARIABLE', label: 'Variable' },
] as const

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
  frequency: z.enum(['ONE_TIME', 'VARIABLE', 'MONTHLY', 'YEARLY', 'SEMESTER', 'ANNUAL']),
  description: z.string(),
  defaultAmount: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

interface FeeCategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: FeeCategoryResponse
}

export function FeeCategoryModal({ open, onOpenChange, editTarget }: FeeCategoryModalProps) {
  const isEdit = !!editTarget
  const create = useCreateFeeCategory()
  const update = useUpdateFeeCategory()
  const isPending = create.isPending || update.isPending

  const form = useForm({
    defaultValues: {
      name: editTarget?.name ?? '',
      frequency: (editTarget?.frequency ?? 'ONE_TIME') as typeof FREQUENCY_OPTIONS[number]['value'],
      description: editTarget?.description ?? '',
      defaultAmount: editTarget?.defaultAmount != null ? String(editTarget.defaultAmount) : '',
      status: (editTarget?.status ?? 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const defaultAmount =
        value.defaultAmount !== '' ? Number(value.defaultAmount) : undefined
      if (isEdit) {
        await update.mutateAsync({
          id: editTarget!.id!,
          req: {
            name: value.name,
            frequency: value.frequency as any,
            description: value.description || undefined,
            defaultAmount,
            status: value.status,
          },
        })
      } else {
        await create.mutateAsync({
          name: value.name,
          frequency: value.frequency as any,
          description: value.description || undefined,
          defaultAmount,
        })
      }
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (!open) form.reset()
  }, [open, form])

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Fee Category' : 'New Fee Category'}
      description={
        isEdit
          ? 'Update fee category details and status.'
          : 'Create a new fee category for use in templates.'
      }
      onSubmit={() => form.handleSubmit()}
      isSubmitting={isPending}
      submitLabel={isEdit ? 'Update' : 'Create Category'}
    >
      <div className="grid gap-4">
        {/* Name */}
        <form.Field name="name">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="fc-name">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fc-name"
                placeholder="e.g. Tuition Fee"
                maxLength={100}
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

        {/* Frequency */}
        <form.Field name="frequency">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>
                Frequency <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as typeof field.state.value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="fc-desc">Description</Label>
              <Textarea
                id="fc-desc"
                rows={3}
                placeholder="Optional description"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

        {/* Default Amount */}
        <form.Field name="defaultAmount">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="fc-amount">Default Amount</Label>
              <Input
                id="fc-amount"
                type="number"
                min={0}
                placeholder="e.g. 150000"
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

        {/* Status — edit only */}
        {isEdit && (
          <form.Field name="status">
            {(field) => (
              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(v) => field.handleChange(v as 'ACTIVE' | 'INACTIVE')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
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
