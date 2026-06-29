import { useState } from 'react'
import { AlertTriangle, AlertCircle } from 'lucide-react'
import { FormDialog } from '#/components/shared/form/FormDialog'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { Alert, AlertDescription } from '#/components/ui/alert'
import type { StudentEnrollmentResponse } from '#/generated/model'
import { useUpdateEnrollment } from '#/features/students/hooks/useStudentEnrollments'
import { getErrorMessage } from '#/lib/errors'

interface WithdrawDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enrollment: StudentEnrollmentResponse
  studentId: string
}

export function WithdrawDialog({
  open,
  onOpenChange,
  enrollment,
  studentId,
}: WithdrawDialogProps) {
  const [reason, setReason] = useState('')
  const [remarks, setRemarks] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const update = useUpdateEnrollment(studentId)

  function handleClose() {
    onOpenChange(false)
    setReason('')
    setRemarks('')
    setFieldError('')
    setErrorMessage(null)
  }

  function handleConfirm() {
    if (!reason.trim()) {
      setFieldError('Reason is required')
      return
    }
    setFieldError('')
    const combined = [reason.trim(), remarks.trim()].filter(Boolean).join(' — ')
    update.mutate(
      {
        id: enrollment.id!,
        req: {
          status: 'WITHDRAWN',
          enrollmentDate: enrollment.enrollmentDate!,
          classId: enrollment.classId || undefined,
          remarks: combined || undefined,
        },
      },
      {
        onSuccess: () => handleClose(),
        onError: (error) => setErrorMessage(getErrorMessage(error)),
      },
    )
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={handleClose}
      title="Withdraw Student"
      description="Mark this enrollment as withdrawn."
      onSubmit={handleConfirm}
      onCancel={handleClose}
      isSubmitting={update.isPending}
      submitLabel="Confirm Withdraw"
    >
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>
            This action will permanently mark the enrollment as <strong>Withdrawn</strong>. This cannot be undone.
          </AlertDescription>
        </Alert>

        <div>
          <Label>
            Reason <span className="text-destructive">*</span>
          </Label>
          <Input
            className="mt-1"
            value={reason}
            onChange={(e) => { setReason(e.target.value); setFieldError('') }}
            placeholder="e.g. Financial difficulties, personal reasons..."
          />
          {fieldError && <p className="text-xs text-destructive mt-1">{fieldError}</p>}
        </div>

        <div>
          <Label>Additional Remarks</Label>
          <Textarea
            className="mt-1"
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Any additional notes..."
          />
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </div>
    </FormDialog>
  )
}
