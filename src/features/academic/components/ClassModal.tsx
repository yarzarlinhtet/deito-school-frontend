import { useEffect, useState } from 'react'
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
import { useCreateClass, useUpdateClass, useActiveBatches } from '../hooks/useClasses'
import { useActivePrograms } from '../hooks/usePrograms'
import { useProgramLevelsByProgram } from '../hooks/useProgramLevels'
import type { ClassResponse, ProgramLevelSummary } from '#/generated/model'

type ClassStatus = 'UPCOMING' | 'ACTIVE' | 'CLOSED'

const schema = z.object({
  programId: z.string().min(1, 'Program is required'),
  programLevelId: z.string().min(1, 'Program level is required'),
  batchId: z.string().min(1, 'Batch is required'),
  name: z.string().min(1, 'Class name is required').max(100, 'Max 100 characters'),
  capacity: z.string().refine((v) => !v || Number(v) >= 1, 'Capacity must be at least 1'),
  remarks: z.string(),
  status: z.enum(['UPCOMING', 'ACTIVE', 'CLOSED']),
})

interface ClassModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: ClassResponse
}

export function ClassModal({ open, onOpenChange, editTarget }: ClassModalProps) {
  const isEdit = !!editTarget
  const create = useCreateClass()
  const update = useUpdateClass()
  const isPending = create.isPending || update.isPending

  const { data: programs, isLoading: isLoadingPrograms } = useActivePrograms()
  const { data: batches, isLoading: isLoadingBatches } = useActiveBatches()

  // Local state for the dependent level dropdown
  const [selectedProgramId, setSelectedProgramId] = useState(editTarget?.programId ?? '')

  const { data: levels, isLoading: isLoadingLevels } = useProgramLevelsByProgram(selectedProgramId || null)

  const form = useForm({
    defaultValues: {
      programId: editTarget?.programId ?? '',
      programLevelId: editTarget?.programLevelId ?? '',
      batchId: editTarget?.batchId ?? '',
      name: editTarget?.name ?? '',
      capacity: editTarget?.capacity != null ? String(editTarget.capacity) : '',
      remarks: editTarget?.remarks ?? '',
      status: (editTarget?.status ?? 'ACTIVE') as ClassStatus,
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const capacity = value.capacity !== '' ? Number(value.capacity) : 1
      if (isEdit) {
        await update.mutateAsync({
          id: editTarget!.id!,
          req: {
            name: value.name,
            capacity,
            remarks: value.remarks || undefined,
            status: value.status as ClassStatus,
          },
        })
      } else {
        await create.mutateAsync({
          programId: value.programId,
          programLevelId: value.programLevelId,
          batchId: value.batchId,
          name: value.name,
          capacity,
          remarks: value.remarks || undefined,
          status: 'ACTIVE' as const,
        })
      }
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (!open) {
      form.reset()
      setSelectedProgramId(editTarget?.programId ?? '')
    }
  }, [open, form, editTarget?.programId])

  const programName = isLoadingPrograms ? undefined : (programs ?? []).find((p) => p.id === editTarget?.programId)?.name
  const levelName = isLoadingLevels ? undefined : (levels ?? []).find((l: ProgramLevelSummary) => l.id === editTarget?.programLevelId)?.name
  const batchName = isLoadingBatches ? undefined : (batches?.items ?? []).find((b) => b.id === editTarget?.batchId)?.name

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Class' : 'New Class'}
      description={
        isEdit ? 'Update class details.' : 'Create a new class under a program level.'
      }
      onSubmit={() => form.handleSubmit()}
      isSubmitting={isPending}
      submitLabel={isEdit ? 'Update' : 'Create Class'}
    >
      <div className="grid gap-4">
        {/* Program */}
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
                    onValueChange={(v) => {
                      field.handleChange(v)
                      setSelectedProgramId(v)
                      form.setFieldValue('programLevelId', '')
                    }}
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

        {/* Program Level */}
        <div className="grid gap-1.5">
          <Label>
            Program Level <span className="text-destructive">*</span>
          </Label>
          {isEdit ? (
            isLoadingLevels ? (
              <div className="h-9 animate-pulse rounded-md border bg-muted/50" />
            ) : (
              <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                {levelName ?? '—'}
              </p>
            )
          ) : (
            <form.Field name="programLevelId">
              {(field) => (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v)}
                    disabled={!selectedProgramId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={selectedProgramId ? 'Select level' : 'Select program first'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(levels ?? []).map((l: ProgramLevelSummary) => (
                        <SelectItem key={l.id} value={l.id!}>
                          {l.name}
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

        {/* Batch */}
        <div className="grid gap-1.5">
          <Label>
            Batch <span className="text-destructive">*</span>
          </Label>
          {isEdit ? (
            isLoadingBatches ? (
              <div className="h-9 animate-pulse rounded-md border bg-muted/50" />
            ) : (
              <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                {batchName ?? '—'}
              </p>
            )
          ) : (
            <form.Field name="batchId">
              {(field) => (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {(batches?.items ?? []).map((b) => (
                        <SelectItem key={b.id} value={b.id!}>
                          {b.name}
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

        {/* Class Name */}
        <form.Field name="name">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="class-name">
                Class Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="class-name"
                placeholder="e.g. Morning Class"
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

        {/* Capacity */}
        <form.Field name="capacity">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="class-capacity">Maximum Capacity</Label>
              <Input
                id="class-capacity"
                type="number"
                min={1}
                placeholder="e.g. 30"
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

        {/* Remarks */}
        <form.Field name="remarks">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="class-remarks">Remarks</Label>
              <Textarea
                id="class-remarks"
                rows={2}
                placeholder="Optional remarks"
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
                  onValueChange={(v) => field.handleChange(v as ClassStatus)}
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
              </div>
            )}
          </form.Field>
        )}
      </div>
    </FormDialog>
  )
}
