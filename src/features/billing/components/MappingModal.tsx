import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Lightbulb } from 'lucide-react'
import { FormDialog, LookupSelect } from '#/components/shared/form'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  useCreateMapping,
  useUpdateMapping,
  useMappingRecommendations,
} from '../hooks/useMappings'
import { useActivePrograms } from '#/features/academic/hooks/usePrograms'
import { useProgramLevelsByProgram } from '#/features/academic/hooks/useProgramLevels'
import { useFeeTemplatesActive } from '#/features/fees/hooks/useFeeTemplates'
import type { MappingResponse, ProgramLevelSummary } from '#/generated/model'

type MappingStatus = 'ACTIVE' | 'INACTIVE'

const schema = z.object({
  programLevelId: z.string().min(1, 'Program level is required'),
  feeTemplateId: z.string().min(1, 'Fee template is required'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  remarks: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

interface MappingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programId: string
  preselectedLevelId?: string | null
  editTarget?: MappingResponse | null
}

export function MappingModal({
  open,
  onOpenChange,
  programId,
  preselectedLevelId,
  editTarget,
}: MappingModalProps) {
  const isEdit = !!editTarget
  const create = useCreateMapping()
  const update = useUpdateMapping()
  const isPending = create.isPending || update.isPending

  const { data: programs, isLoading: isLoadingPrograms } = useActivePrograms()
  const { data: levels, isLoading: isLoadingLevels } = useProgramLevelsByProgram(programId || null)
  const { data: activeTemplates, isLoading: isLoadingTemplates } = useFeeTemplatesActive()

  const programName = (programs ?? []).find((p) => p.id === programId)?.name

  // Local state to track selected level for the recommendation hook
  const [selectedLevelId, setSelectedLevelId] = useState(
    editTarget?.programLevelId ?? preselectedLevelId ?? '',
  )

  const { data: recommendations } = useMappingRecommendations(
    programId || null,
    selectedLevelId || null,
  )

  const form = useForm({
    defaultValues: {
      programLevelId: editTarget?.programLevelId ?? preselectedLevelId ?? '',
      feeTemplateId: editTarget?.feeTemplateId ?? '',
      effectiveDate: editTarget?.effectiveDate ?? '',
      remarks: editTarget?.remarks ?? '',
      status: (editTarget?.status ?? 'ACTIVE') as MappingStatus,
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      if (isEdit) {
        await update.mutateAsync({
          id: editTarget!.id!,
          req: {
            feeTemplateId: value.feeTemplateId,
            effectiveDate: value.effectiveDate,
            status: value.status,
            remarks: value.remarks || undefined,
          },
        })
      } else {
        await create.mutateAsync({
          programId,
          programLevelId: value.programLevelId,
          feeTemplateId: value.feeTemplateId,
          effectiveDate: value.effectiveDate,
          status: 'ACTIVE' as const,
          remarks: value.remarks || undefined,
        })
      }
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (!open) {
      form.reset()
      setSelectedLevelId('')
    }
  }, [open, form])

  useEffect(() => {
    if (open && !isEdit) {
      const levelId = preselectedLevelId ?? ''
      form.setFieldValue('programLevelId', levelId)
      setSelectedLevelId(levelId)
    }
  }, [open, isEdit, preselectedLevelId, form])

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Mapping' : 'Add Fee Mapping Rule'}
      description={
        isEdit
          ? 'Update fee template assignment for this program level.'
          : 'Assign a fee template to a program level.'
      }
      onSubmit={() => form.handleSubmit()}
      isSubmitting={isPending}
      submitLabel={isEdit ? 'Update' : 'Save Rule'}
    >
      <div className="grid gap-4">
        {/* Program — always read-only */}
        <div className="grid gap-1.5">
          <Label>Program</Label>
          {isLoadingPrograms ? (
            <div className="h-9 animate-pulse rounded-md border bg-muted/50" />
          ) : (
            <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
              {programName ?? '—'}
            </p>
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
                {(levels ?? []).find(
                  (l: ProgramLevelSummary) => l.id === editTarget?.programLevelId,
                )?.name ?? '—'}
              </p>
            )
          ) : (
            <form.Field name="programLevelId">
              {(field) => (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => {
                      field.handleChange(v)
                      setSelectedLevelId(v)
                    }}
                    disabled={!programId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={programId ? 'Select level' : 'Select program first'}
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
                    <p className="text-xs text-destructive">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </>
              )}
            </form.Field>
          )}
        </div>

        {/* Fee Template */}
        <form.Field name="feeTemplateId">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>
                Fee Template <span className="text-destructive">*</span>
              </Label>
              <LookupSelect
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v)}
                items={activeTemplates}
                isLoading={isLoadingTemplates}
                placeholder="Select fee template"
              />
              {field.state.meta.errors[0] && (
                <p className="text-xs text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              )}

              {/* Recommendation chips */}
              {!isEdit &&
                selectedLevelId &&
                (recommendations?.recommendedFeeTemplates ?? []).length > 0 && (
                  <div className="mt-1 rounded-md border bg-muted/30 p-2">
                    <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Lightbulb className="size-3" />
                      Suggested
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {recommendations!.recommendedFeeTemplates!.map((r) => (
                        <Button
                          key={r.feeTemplateId}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => field.handleChange(r.feeTemplateId!)}
                        >
                          {r.feeTemplateName}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </form.Field>

        {/* Effective Date */}
        <form.Field name="effectiveDate">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="mapping-effective-date">
                Effective Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mapping-effective-date"
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

        {/* Remarks */}
        <form.Field name="remarks">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="mapping-remarks">Remarks</Label>
              <Textarea
                id="mapping-remarks"
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
                  onValueChange={(v) => field.handleChange(v as MappingStatus)}
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
