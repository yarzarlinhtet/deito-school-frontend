import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { FormDialog } from '#/components/shared/form'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import type { StudentVisaResponse } from '#/generated/model'
import { useCreateVisa, useUpdateVisa } from '../hooks/useStudentVisa'

const schema = z.object({
  visaNumber: z.string().min(1, 'Visa number is required').max(100),
  passportNumber: z.string().max(100),
  countryOfIssue: z.string().max(100),
  issueDate: z.string(),
  expiryDate: z.string(),
  sponsor: z.string().max(200),
  status: z.enum(['ACTIVE', 'EXPIRED', 'PENDING', 'CANCELLED'] as const),
  remarks: z.string(),
})

interface VisaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  editTarget?: StudentVisaResponse
}

export function VisaModal({ open, onOpenChange, studentId, editTarget }: VisaModalProps) {
  const createVisa = useCreateVisa(studentId)
  const updateVisa = useUpdateVisa(studentId)

  const isEdit = !!editTarget
  const isPending = createVisa.isPending || updateVisa.isPending

  const form = useForm({
    defaultValues: {
      visaNumber: editTarget?.visaNumber ?? '',
      passportNumber: editTarget?.passportNumber ?? '',
      countryOfIssue: editTarget?.countryOfIssue ?? '',
      issueDate: editTarget?.issueDate ?? '',
      expiryDate: editTarget?.expiryDate ?? '',
      sponsor: editTarget?.sponsor ?? '',
      status: (editTarget?.status ?? 'ACTIVE') as 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED',
      remarks: editTarget?.remarks ?? '',
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const req = {
        visaNumber: value.visaNumber,
        passportNumber: value.passportNumber || undefined,
        countryOfIssue: value.countryOfIssue || undefined,
        issueDate: value.issueDate || undefined,
        expiryDate: value.expiryDate || undefined,
        sponsor: value.sponsor || undefined,
        status: value.status,
        remarks: value.remarks || undefined,
      }

      if (isEdit) {
        updateVisa.mutate(
          { visaId: editTarget.id!, req },
          { onSuccess: () => onOpenChange(false) }
        )
      } else {
        createVisa.mutate(req, { onSuccess: () => onOpenChange(false) })
      }
    },
  })

  useEffect(() => {
    if (!open) form.reset()
  }, [open, form])

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Visa Record' : 'Add Visa Record'}
      onSubmit={() => form.handleSubmit()}
      isSubmitting={isPending}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <div className="space-y-4">
        {/* Visa Number + Status */}
        <div className="grid grid-cols-2 gap-3">
          <form.Field name="visaNumber">
            {(f) => (
              <div className="space-y-1">
                <Label>
                  Visa Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                  placeholder="e.g. MYS-2024-F1-8821"
                />
                {f.state.meta.errors[0] && (
                  <p className="text-xs text-destructive">{String(f.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="status">
            {(f) => (
              <div className="space-y-1">
                <Label>
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={f.state.value}
                  onValueChange={(v) => f.handleChange(v as 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
        </div>

        {/* Passport Number + Country */}
        <div className="grid grid-cols-2 gap-3">
          <form.Field name="passportNumber">
            {(f) => (
              <div className="space-y-1">
                <Label>Passport Number</Label>
                <Input
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                  placeholder="e.g. A12345678"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="countryOfIssue">
            {(f) => (
              <div className="space-y-1">
                <Label>Country of Issue</Label>
                <Input
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                  placeholder="e.g. Malaysia"
                />
              </div>
            )}
          </form.Field>
        </div>

        {/* Issue Date + Expiry Date */}
        <div className="grid grid-cols-2 gap-3">
          <form.Field name="issueDate">
            {(f) => (
              <div className="space-y-1">
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="expiryDate">
            {(f) => (
              <div className="space-y-1">
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
        </div>

        {/* Sponsor */}
        <form.Field name="sponsor">
          {(f) => (
            <div className="space-y-1">
              <Label>Sponsor</Label>
              <Input
                value={f.state.value}
                onChange={(e) => f.handleChange(e.target.value)}
                placeholder="e.g. Yangon International School"
              />
            </div>
          )}
        </form.Field>

        {/* Remarks */}
        <form.Field name="remarks">
          {(f) => (
            <div className="space-y-1">
              <Label>Remarks</Label>
              <Textarea
                rows={2}
                value={f.state.value}
                onChange={(e) => f.handleChange(e.target.value)}
                placeholder="Optional notes…"
              />
            </div>
          )}
        </form.Field>
      </div>
    </FormDialog>
  )
}
