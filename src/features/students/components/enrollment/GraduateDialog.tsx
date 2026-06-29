import { useState } from 'react'
import { GraduationCap, AlertCircle } from 'lucide-react'
import { FormDialog } from '#/components/shared/form/FormDialog'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { StatusBadge } from '#/components/shared/status-badge'
import type { StudentEnrollmentResponse } from '#/generated/model'
import { useUpdateEnrollment } from '#/features/students/hooks/useStudentEnrollments'
import { getErrorMessage } from '#/lib/errors'

export interface EnrollmentLookups {
  academicYearMap: Record<string, string>
  programMap: Record<string, string>
  programLevelMap: Record<string, string>
  intakeMap: Record<string, string>
  batchMap: Record<string, string>
  classMap: Record<string, string>
}

function resolve(map: Record<string, string>, id?: string | null) {
  return id ? (map[id] ?? id) : '—'
}

interface GraduateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enrollment: StudentEnrollmentResponse
  studentId: string
  lookups: EnrollmentLookups
}

export function GraduateDialog({
  open,
  onOpenChange,
  enrollment,
  studentId,
  lookups,
}: GraduateDialogProps) {
  const [reason, setReason] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const update = useUpdateEnrollment(studentId)

  function handleClose() {
    onOpenChange(false)
    setReason('')
    setErrorMessage(null)
  }

  function handleConfirm() {
    update.mutate(
      {
        id: enrollment.id!,
        req: {
          status: 'GRADUATED',
          enrollmentDate: enrollment.enrollmentDate!,
          classId: enrollment.classId || undefined,
          remarks: reason || undefined,
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
      title="Graduate Student"
      description="Mark this enrollment as graduated."
      onSubmit={handleConfirm}
      onCancel={handleClose}
      isSubmitting={update.isPending}
      submitLabel="Confirm Graduate"
    >
      <div className="space-y-4">
        <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Enrollment Status</span>
            <StatusBadge status="active" label="Active" />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <span className="text-muted-foreground">Academic Year</span>
            <span className="font-medium">{resolve(lookups.academicYearMap, enrollment.academicYearId)}</span>
            <span className="text-muted-foreground">Program</span>
            <span className="font-medium">{resolve(lookups.programMap, enrollment.programId)}</span>
            <span className="text-muted-foreground">Program Level</span>
            <span className="font-medium">{resolve(lookups.programLevelMap, enrollment.programLevelId)}</span>
          </div>
        </div>

        <Alert>
          <GraduationCap className="size-4" />
          <AlertDescription>
            This action will permanently mark the enrollment as <strong>Graduated</strong>. This cannot be undone.
          </AlertDescription>
        </Alert>

        <div>
          <Label>Reason / Notes</Label>
          <Textarea
            className="mt-1"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional reason or graduation notes..."
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
