import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { FormDialog } from '#/components/shared/form/FormDialog'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { useCreateProgramLevel, useUpdateProgramLevel } from '../hooks/useProgramLevels'
import { useActivePrograms } from '../hooks/usePrograms'
import type { ProgramLevelResponse } from '#/generated/model'

const schema = z.object({
  programId: z.string().min(1, 'Program is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
  displayOrder: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

interface ProgramLevelModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: ProgramLevelResponse
}

export function ProgramLevelModal({ open, onOpenChange, editTarget }: ProgramLevelModalProps) {
  const isEdit = !!editTarget
  const create = useCreateProgramLevel()
  const update = useUpdateProgramLevel()
  const isPending = create.isPending || update.isPending
  const { data: programs, isLoading: isLoadingPrograms } = useActivePrograms()

  const form = useForm({
    defaultValues: {
      programId: editTarget?.programId ?? '',
      name: editTarget?.name ?? '',
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
            displayOrder,
            status: value.status,
          },
        })
      } else {
        await create.mutateAsync({
          programId: value.programId,
          name: value.name,
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

  const programName = isLoadingPrograms ? undefined : (programs ?? []).find((p) => p.id === editTarget?.programId)?.name

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Program Level' : 'New Program Level'}
      description={
        isEdit ? 'Update program level details.' : 'Create a new level under a program.'
      }
      onSubmit={() => form.handleSubmit()}
      isSubmitting={isPending}
      submitLabel={isEdit ? 'Update' : 'Create Level'}
    >
      <div className="grid gap-4">
        {/* Program — select in create, read-only in edit */}
        <div className="grid gap-1.5">
          <Label>
            Program <span className="text-destructive">*</span>
          </Label>
          {isEdit ? (
            isLoadingPrograms ? (
              <div className="h-9 animate-pulse rounded-md border bg-muted/50" />
            ) : (
              <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                {programName ?? '—'}
              </p>
            )
          ) : (
            <form.Field name="programId">
              {(field) => (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {(programs ?? []).map((p) => (
                        <SelectItem key={p.id} value={p.id!}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors[0] && (
                    <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
                  )}
                </>
              )}
            </form.Field>
          )}
        </div>

        <form.Field name="name">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="level-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="level-name"
                placeholder="e.g. N5"
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

        <form.Field name="displayOrder">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="level-order">Level Order</Label>
              <Input
                id="level-order"
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
