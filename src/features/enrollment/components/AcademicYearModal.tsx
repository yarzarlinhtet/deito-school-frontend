import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { FormDialog } from '#/components/shared/form/FormDialog'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Calendar } from '#/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'
import { useCreateAcademicYear, useUpdateAcademicYear } from '../hooks/useAcademicYears'
import type { AcademicYearResponse } from '#/generated/model'

const schema = z
  .object({
    name: z.string().min(1, 'Name is required').max(50, 'Max 50 characters'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    isCurrentYear: z.boolean(),
  })
  .refine((d) => !d.startDate || !d.endDate || d.startDate < d.endDate, {
    message: 'Start date must be before end date',
    path: ['endDate'],
  })

interface AcademicYearModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: AcademicYearResponse
}

export function AcademicYearModal({ open, onOpenChange, editTarget }: AcademicYearModalProps) {
  const create = useCreateAcademicYear()
  const update = useUpdateAcademicYear()
  const isEdit = !!editTarget
  const isPending = create.isPending || update.isPending

  const form = useForm({
    defaultValues: {
      name: editTarget?.name ?? '',
      startDate: editTarget?.startDate ?? '',
      endDate: editTarget?.endDate ?? '',
      status: (editTarget?.status ?? 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
      isCurrentYear: editTarget?.isCurrentYear ?? false,
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const req = {
        name: value.name,
        startDate: value.startDate,
        endDate: value.endDate,
        status: value.status,
        isCurrentYear: value.isCurrentYear,
      }

      if (isEdit) {
        await update.mutateAsync({ id: editTarget!.id!, req })
      } else {
        await create.mutateAsync(req)
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
      title={isEdit ? 'Edit Academic Year' : 'Create Academic Year'}
      description={
        isEdit
          ? 'Update the academic year name, dates, and status.'
          : 'Enter a name and set the date range for the new academic year.'
      }
      onSubmit={() => form.handleSubmit()}
      isSubmitting={isPending}
      submitLabel={isEdit ? 'Update' : 'Create'}
    >
      <div className="grid gap-4">
        {/* Name */}
        <form.Field name="name">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="ay-name">Academic Year Name</Label>
              <Input
                id="ay-name"
                placeholder="e.g. 2025-2026"
                maxLength={50}
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

        {/* Start Date */}
        <form.Field name="startDate">
          {(field) => {
            const selected = field.state.value ? new Date(field.state.value) : undefined
            return (
              <div className="grid gap-1.5">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.state.value && 'text-muted-foreground'
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

        {/* End Date */}
        <form.Field name="endDate">
          {(field) => {
            const selected = field.state.value ? new Date(field.state.value) : undefined
            return (
              <div className="grid gap-1.5">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.state.value && 'text-muted-foreground'
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

        {/* Status */}
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
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
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

        {/* Current year flag */}
        <form.Field name="isCurrentYear">
          {(field) => (
            <div className="flex items-center gap-2">
              <Checkbox
                id="is-current-year"
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked === true)}
              />
              <Label htmlFor="is-current-year" className="font-normal cursor-pointer">
                Set as current academic year
              </Label>
            </div>
          )}
        </form.Field>
      </div>
    </FormDialog>
  )
}
