import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { FormDialog } from '#/components/shared/form/FormDialog'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
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
import { LookupSelect } from '#/components/shared/form/LookupSelect'
import { useIntakes } from '../hooks/useIntakes'
import { useCreateBatch, useUpdateBatch } from '../hooks/useBatches'
import type { BatchResponse } from '#/generated/model'

const schema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
    intakeId: z.string().min(1, 'Intake is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    status: z.enum(['UPCOMING', 'ACTIVE', 'CLOSED']),
  })
  .refine((d) => !d.startDate || !d.endDate || d.startDate < d.endDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  })

interface BatchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: BatchResponse
}

export function BatchModal({ open, onOpenChange, editTarget }: BatchModalProps) {
  const isEdit = !!editTarget
  const create = useCreateBatch()
  const update = useUpdateBatch()
  const isPending = create.isPending || update.isPending

  const { data: intakes, isLoading: isLoadingIntakes } = useIntakes({ pagination: { page: 0, size: 100 } })

  const form = useForm({
    defaultValues: {
      name: editTarget?.name ?? '',
      intakeId: editTarget?.intakeId ?? '',
      startDate: editTarget?.startDate ?? '',
      endDate: editTarget?.endDate ?? '',
      status: (editTarget?.status ?? 'UPCOMING') as 'UPCOMING' | 'ACTIVE' | 'CLOSED',
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      if (isEdit) {
        await update.mutateAsync({
          id: editTarget!.id!,
          req: {
            name: value.name,
            startDate: value.startDate,
            endDate: value.endDate,
            status: value.status,
          },
        })
      } else {
        await create.mutateAsync({
          intakeId: value.intakeId,
          name: value.name,
          startDate: value.startDate,
          endDate: value.endDate,
          status: value.status,
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
      title={isEdit ? 'Edit Batch' : 'Create Batch'}
      description={
        isEdit
          ? 'Update the batch details and status.'
          : 'Create a new batch under an existing intake.'
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
              <Label htmlFor="batch-name">Batch Name</Label>
              <Input
                id="batch-name"
                placeholder="e.g. Morning Batch"
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

        {/* Intake */}
        <form.Field name="intakeId">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Intake</Label>
              <LookupSelect
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v)}
                items={intakes?.items}
                isLoading={isLoadingIntakes}
                placeholder="Select intake"
                disabled={isEdit}
              />
              {field.state.meta.errors[0] && (
                <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
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
                  <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
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
                  <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
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
                onValueChange={(v) => field.handleChange(v as 'UPCOMING' | 'ACTIVE' | 'CLOSED')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPCOMING">Upcoming</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              {field.state.meta.errors[0] && (
                <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>
      </div>
    </FormDialog>
  )
}
