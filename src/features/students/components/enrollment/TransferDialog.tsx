import { useState } from 'react'
import { AlertTriangle, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { ProgramSelector } from '#/features/students/components/selectors/ProgramSelector'
import { ProgramLevelSelector } from '#/features/students/components/selectors/ProgramLevelSelector'
import type { StudentEnrollmentResponse } from '#/generated/model'
import { useTransferEnrollment } from '#/features/students/hooks/useStudentEnrollments'
import type { EnrollmentLookups } from './GraduateDialog'
import { getErrorMessage } from '#/lib/errors'

function resolve(map: Record<string, string>, id?: string | null) {
  return id ? (map[id] ?? '—') : '—'
}

interface TransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enrollment: StudentEnrollmentResponse
  studentId: string
  lookups: EnrollmentLookups
}

export function TransferDialog({
  open,
  onOpenChange,
  enrollment,
  studentId,
  lookups,
}: TransferDialogProps) {
  const [newProgramId, setNewProgramId] = useState('')
  const [newProgramLevelId, setNewProgramLevelId] = useState('')
  const [remarks, setRemarks] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const transfer = useTransferEnrollment(studentId)

  function validate() {
    const e: Record<string, string> = {}
    if (!newProgramId) e.programId = 'New program is required'
    if (!newProgramLevelId) e.programLevelId = 'New program level is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  function handleConfirm() {
    if (!validate()) return
    transfer.mutate(
      { current: enrollment, newProgramId, newProgramLevelId, remarks: remarks || undefined },
      {
        onSuccess: () => handleClose(),
        onError: (error) => setErrorMessage(getErrorMessage(error)),
      },
    )
  }

  function handleClose() {
    onOpenChange(false)
    setNewProgramId('')
    setNewProgramLevelId('')
    setRemarks('')
    setErrors({})
    setErrorMessage(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Transfer Program</DialogTitle>
          <DialogDescription>
            Transfer this enrollment to a different program or program level.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current enrollment info */}
          <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Enrollment</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">Program</span>
              <span className="font-medium">{resolve(lookups.programMap, enrollment.programId)}</span>
              <span className="text-muted-foreground">Program Level</span>
              <span className="font-medium">{resolve(lookups.programLevelMap, enrollment.programLevelId)}</span>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="size-4" />
            <AlertDescription>
              Changing Program or Program Level may affect student billing. The backend handles all billing recalculations.
            </AlertDescription>
          </Alert>

          {/* New program selection */}
          <div>
            <Label>
              New Program <span className="text-destructive">*</span>
            </Label>
            <ProgramSelector
              value={newProgramId}
              onValueChange={(v) => {
                setNewProgramId(v)
                setNewProgramLevelId('')
                setErrors((e) => ({ ...e, programId: '' }))
              }}
              placeholder="Select new program..."
              className="mt-1 w-full"
            />
            {errors.programId && (
              <p className="text-xs text-destructive mt-1">{errors.programId}</p>
            )}
          </div>

          <div>
            <Label>
              New Program Level <span className="text-destructive">*</span>
            </Label>
            <ProgramLevelSelector
              value={newProgramLevelId}
              onValueChange={(v) => {
                setNewProgramLevelId(v)
                setErrors((e) => ({ ...e, programLevelId: '' }))
              }}
              programId={newProgramId}
              placeholder="Select program level..."
              className="mt-1 w-full"
            />
            {errors.programLevelId && (
              <p className="text-xs text-destructive mt-1">{errors.programLevelId}</p>
            )}
          </div>

          <div>
            <Label>Remarks</Label>
            <Textarea
              className="mt-1"
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Reason for transfer..."
            />
          </div>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={transfer.isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={transfer.isPending}>
            {transfer.isPending ? 'Transferring...' : 'Confirm Transfer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
