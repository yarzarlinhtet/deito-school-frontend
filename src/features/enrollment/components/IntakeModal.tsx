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
import { useAcademicYears } from '../hooks/useAcademicYears'
import { useCreateIntake, useUpdateIntake } from '../hooks/useIntakes'
import type { IntakeResponse } from '#/generated/model'

const schema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
    academicYearId: z.string().min(1, 'Academic year is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    totalCapacity: z.union([z.number().min(1, 'Must be at least 1'), z.undefined()]),
    status: z.enum(['UPCOMING', 'ACTIVE', 'CLOSED']),
  })
  .refine((d) => !d.startDate || !d.endDate || d.startDate < d.endDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  })

interface IntakeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: IntakeResponse
}

export function IntakeModal({ open, onOpenChange, editTarget }: IntakeModalProps) {
  const isEdit = !!editTarget
  const create = useCreateIntake()
  const update = useUpdateIntake()
  const isPending = create.isPending || update.isPending

  const { data: academicYears, isLoading: isLoadingAY } = useAcademicYears({ size: 100 })

  const form = useForm({
    defaultValues: {
      name: editTarget?.name ?? '',
      academicYearId: editTarget?.academicYearId ?? '',
      startDate: editTarget?.startDate ?? '',
      endDate: editTarget?.endDate ?? '',
      totalCapacity: editTarget?.totalCapacity as number | undefined,
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
            totalCapacity: value.totalCapacity,
            status: value.status,
          },
        })
      } else {
        await create.mutateAsync({
          academicYearId: value.academicYearId,
          name: value.name,
          startDate: value.startDate,
          endDate: value.endDate,
          totalCapacity: value.totalCapacity,
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
      title={isEdit ? 'Edit Intake' : 'Create Intake'}
      description={
        isEdit
          ? 'Update the intake details and status.'
          : 'Create a new intake period under an academic year.'
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
              <Label htmlFor="intake-name">Intake Name</Label>
              <Input
                id="intake-name"
                placeholder="e.g. 2026 January Intake"
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

        {/* Academic Year */}
        <form.Field name="academicYearId">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Academic Year</Label>
              <LookupSelect
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v)}
                items={academicYears?.items}
                isLoading={isLoadingAY}
                placeholder="Select academic year"
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
                      startMonth={new Date(1900, 0)}
                      endMonth={new Date(new Date().getFullYear() + 10, 11)}
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
                      startMonth={new Date(1900, 0)}
                      endMonth={new Date(new Date().getFullYear() + 10, 11)}
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

        {/* Total Capacity */}
        <form.Field name="totalCapacity">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="intake-capacity">Total Capacity</Label>
              <Input
                id="intake-capacity"
                type="number"
                min={1}
                placeholder="e.g. 500"
                value={field.state.value ?? ''}
                onChange={(e) => {
                  const v = e.target.valueAsNumber
                  field.handleChange(isNaN(v) ? undefined : v)
                }}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors[0] && (
                <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
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
