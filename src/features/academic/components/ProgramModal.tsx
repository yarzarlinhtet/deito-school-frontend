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
import { useCreateProgram, useUpdateProgram } from '../hooks/usePrograms'
import type { ProgramResponse } from '#/generated/model'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
  description: z.string(),
  displayOrder: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

interface ProgramModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: ProgramResponse
}

export function ProgramModal({ open, onOpenChange, editTarget }: ProgramModalProps) {
  const isEdit = !!editTarget
  const create = useCreateProgram()
  const update = useUpdateProgram()
  const isPending = create.isPending || update.isPending

  const form = useForm({
    defaultValues: {
      name: editTarget?.name ?? '',
      description: editTarget?.description ?? '',
      displayOrder: editTarget?.displayOrder != null ? String(editTarget.displayOrder) : '',
      status: (editTarget?.status ?? 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const displayOrder = value.displayOrder !== '' ? Number(value.displayOrder) : undefined
      if (isEdit) {
        await update.mutateAsync({
          id: editTarget!.id!,
          req: {
            name: value.name,
            description: value.description || undefined,
            displayOrder,
            status: value.status,
          },
        })
      } else {
        await create.mutateAsync({
          name: value.name,
          description: value.description || undefined,
          displayOrder,
          status: 'ACTIVE',
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
      title={isEdit ? 'Edit Program' : 'New Program'}
      description={
        isEdit ? 'Update program details.' : 'Create a new academic program.'
      }
      onSubmit={() => form.handleSubmit()}
      isSubmitting={isPending}
      submitLabel={isEdit ? 'Update' : 'Create Program'}
    >
      <div className="grid gap-4">
        <form.Field name="name">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="prog-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prog-name"
                placeholder="e.g. Japanese"
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

        <form.Field name="description">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="prog-desc">Description</Label>
              <Textarea
                id="prog-desc"
                rows={3}
                placeholder="Optional description"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="displayOrder">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="prog-order">Display Order</Label>
              <Input
                id="prog-order"
                type="number"
                min={0}
                placeholder="e.g. 1"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

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
