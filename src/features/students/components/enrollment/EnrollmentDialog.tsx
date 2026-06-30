import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { AlertCircle, CalendarIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { Textarea } from '#/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'
import { AcademicYearSelector } from '#/features/students/components/selectors/AcademicYearSelector'
import { ProgramSelector } from '#/features/students/components/selectors/ProgramSelector'
import { ProgramLevelSelector } from '#/features/students/components/selectors/ProgramLevelSelector'
import { IntakeSelector } from '#/features/students/components/selectors/IntakeSelector'
import { BatchSelector } from '#/features/students/components/selectors/BatchSelector'
import { ClassSelector } from '#/features/students/components/selectors/ClassSelector'
import type { StudentEnrollmentResponse } from '#/generated/model'
import {
  useCreateEnrollment,
  useUpdateEnrollment,
} from '#/features/students/hooks/useStudentEnrollments'
import type { EnrollmentLookups } from './GraduateDialog'
import { getErrorMessage } from '#/lib/errors'

function resolve(map: Record<string, string>, id?: string | null) {
  return id ? (map[id] ?? '—') : '—'
}

const createSchema = z.object({
  academicYearId: z.string().min(1, 'Academic year is required'),
  programId: z.string().min(1, 'Program is required'),
  programLevelId: z.string().min(1, 'Program level is required'),
  intakeId: z.string().min(1, 'Intake is required'),
  batchId: z.string().min(1, 'Batch is required'),
  classId: z.string(),
  enrollmentType: z.enum(['SELF_ENROLL', 'AGENT']),
  enrollmentDate: z.string().min(1, 'Enrollment date is required'),
  remarks: z.string(),
})

const editSchema = z.object({
  classId: z.string(),
  enrollmentDate: z.string().min(1, 'Enrollment date is required'),
  remarks: z.string(),
})

interface EnrollmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  editTarget?: StudentEnrollmentResponse
  lookups?: EnrollmentLookups
}

export function EnrollmentDialog({
  open,
  onOpenChange,
  studentId,
  editTarget,
  lookups,
}: EnrollmentDialogProps) {
  const isEdit = !!editTarget
  const createMutation = useCreateEnrollment()
  const updateMutation = useUpdateEnrollment(studentId)
  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending

  const [selectedProgramId, setSelectedProgramId] = useState(editTarget?.programId ?? '')
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState(editTarget?.academicYearId ?? '')
  const [selectedIntakeId, setSelectedIntakeId] = useState(editTarget?.intakeId ?? '')
  const [selectedBatchId, setSelectedBatchId] = useState(editTarget?.batchId ?? '')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function handleClose() {
    onOpenChange(false)
    setErrorMessage(null)
  }

  const createForm = useForm({
    defaultValues: {
      academicYearId: editTarget?.academicYearId ?? '',
      programId: editTarget?.programId ?? '',
      programLevelId: editTarget?.programLevelId ?? '',
      intakeId: editTarget?.intakeId ?? '',
      batchId: editTarget?.batchId ?? '',
      classId: editTarget?.classId ?? '',
      enrollmentType: (editTarget?.enrollmentType ?? 'SELF_ENROLL') as 'SELF_ENROLL' | 'AGENT',
      enrollmentDate: editTarget?.enrollmentDate ?? new Date().toISOString().split('T')[0],
      remarks: editTarget?.remarks ?? '',
    },
    validators: { onSubmit: createSchema },
    onSubmit: ({ value }) => {
      createMutation.mutate(
        {
          studentId,
          academicYearId: value.academicYearId,
          programId: value.programId,
          programLevelId: value.programLevelId,
          intakeId: value.intakeId,
          batchId: value.batchId,
          classId: value.classId || undefined,
          enrollmentType: value.enrollmentType,
          enrollmentDate: value.enrollmentDate,
          remarks: value.remarks || undefined,
        },
        {
          onSuccess: () => handleClose(),
          onError: (error) => setErrorMessage(getErrorMessage(error)),
        },
      )
    },
  })

  const editForm = useForm({
    defaultValues: {
      classId: editTarget?.classId ?? '',
      enrollmentDate: editTarget?.enrollmentDate ?? '',
      remarks: editTarget?.remarks ?? '',
    },
    validators: { onSubmit: editSchema },
    onSubmit: ({ value }) => {
      if (!editTarget?.id) return
      updateMutation.mutate(
        {
          id: editTarget.id,
          req: {
            status: editTarget.status as any,
            enrollmentDate: value.enrollmentDate,
            classId: value.classId || undefined,
            remarks: value.remarks || undefined,
          },
        },
        {
          onSuccess: () => handleClose(),
          onError: (error) => setErrorMessage(getErrorMessage(error)),
        },
      )
    },
  })

  function handleSubmit() {
    if (isEdit) {
      void editForm.handleSubmit()
    } else {
      void createForm.handleSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Enrollment' : 'Create Enrollment'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update class, enrollment date, or remarks. To change program, use Transfer.'
              : 'Fill in the enrollment details for this student.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 space-y-4 pr-1">
          {isEdit ? (
            /* ── Edit mode ─────────────────── */
            <>
              {/* Read-only context */}
              {lookups && (
                <div className="rounded-lg border bg-muted/40 p-4 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Current Enrollment</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-muted-foreground">Program</span>
                    <span className="font-medium">{resolve(lookups.programMap, editTarget?.programId)}</span>
                    <span className="text-muted-foreground">Level</span>
                    <span className="font-medium">{resolve(lookups.programLevelMap, editTarget?.programLevelId)}</span>
                    <span className="text-muted-foreground">Academic Year</span>
                    <span className="font-medium">{resolve(lookups.academicYearMap, editTarget?.academicYearId)}</span>
                  </div>
                </div>
              )}

              <editForm.Field name="classId">
                {(f) => (
                  <div>
                    <Label>Class</Label>
                    <Input
                      className="mt-1 font-mono"
                      value={f.state.value}
                      onChange={(e) => f.handleChange(e.target.value)}
                      placeholder="Class ID (optional)"
                    />
                  </div>
                )}
              </editForm.Field>

              <editForm.Field name="enrollmentDate">
                {(f) => (
                  <div>
                    <Label>Enrollment Date <span className="text-destructive">*</span></Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn('mt-1 w-full justify-start text-left font-normal', !f.state.value && 'text-muted-foreground')}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {f.state.value ? format(new Date(f.state.value), 'd MMM yyyy') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown"
                          startMonth={new Date(1900, 0)}
                          endMonth={new Date(new Date().getFullYear() + 10, 11)}
                          selected={f.state.value ? new Date(f.state.value) : undefined}
                          onSelect={(date) => f.handleChange(date ? format(date, 'yyyy-MM-dd') : '')}
                        />
                      </PopoverContent>
                    </Popover>
                    {f.state.meta.errors[0] && (
                      <p className="text-xs text-destructive mt-1">{String(f.state.meta.errors[0])}</p>
                    )}
                  </div>
                )}
              </editForm.Field>

              <editForm.Field name="remarks">
                {(f) => (
                  <div>
                    <Label>Remarks</Label>
                    <Textarea
                      className="mt-1"
                      rows={2}
                      value={f.state.value}
                      onChange={(e) => f.handleChange(e.target.value)}
                      placeholder="Any remarks..."
                    />
                  </div>
                )}
              </editForm.Field>
            </>
          ) : (
            /* ── Create mode ─────────────────── */
            <>
              <div className="grid grid-cols-2 gap-4">
                <createForm.Field name="academicYearId">
                  {(f) => (
                    <div className="col-span-2">
                      <Label>Academic Year <span className="text-destructive">*</span></Label>
                      <AcademicYearSelector
                        value={f.state.value}
                        onValueChange={(v) => {
                          f.handleChange(v)
                          setSelectedAcademicYearId(v)
                          createForm.setFieldValue('intakeId', '')
                          createForm.setFieldValue('batchId', '')
                          createForm.setFieldValue('classId', '')
                          setSelectedIntakeId('')
                          setSelectedBatchId('')
                        }}
                        className="mt-1 w-full"
                      />
                      {f.state.meta.errors[0] && (
                        <p className="text-xs text-destructive mt-1">{String(f.state.meta.errors[0])}</p>
                      )}
                    </div>
                  )}
                </createForm.Field>

                <createForm.Field name="programId">
                  {(f) => (
                    <div>
                      <Label>Program <span className="text-destructive">*</span></Label>
                      <ProgramSelector
                        value={f.state.value}
                        onValueChange={(v) => {
                          f.handleChange(v)
                          setSelectedProgramId(v)
                          createForm.setFieldValue('programLevelId', '')
                        }}
                        className="mt-1 w-full"
                      />
                      {f.state.meta.errors[0] && (
                        <p className="text-xs text-destructive mt-1">{String(f.state.meta.errors[0])}</p>
                      )}
                    </div>
                  )}
                </createForm.Field>

                <createForm.Field name="programLevelId">
                  {(f) => (
                    <div>
                      <Label>Program Level <span className="text-destructive">*</span></Label>
                      <ProgramLevelSelector
                        value={f.state.value}
                        onValueChange={(v) => f.handleChange(v)}
                        programId={selectedProgramId}
                        className="mt-1 w-full"
                      />
                      {f.state.meta.errors[0] && (
                        <p className="text-xs text-destructive mt-1">{String(f.state.meta.errors[0])}</p>
                      )}
                    </div>
                  )}
                </createForm.Field>

                <createForm.Field name="intakeId">
                  {(f) => (
                    <div>
                      <Label>Intake <span className="text-destructive">*</span></Label>
                      <IntakeSelector
                        value={f.state.value}
                        onValueChange={(v) => {
                          f.handleChange(v)
                          setSelectedIntakeId(v)
                          createForm.setFieldValue('batchId', '')
                          setSelectedBatchId('')
                          createForm.setFieldValue('classId', '')
                        }}
                        academicYearId={selectedAcademicYearId}
                        className="mt-1 w-full"
                      />
                      {f.state.meta.errors[0] && (
                        <p className="text-xs text-destructive mt-1">{String(f.state.meta.errors[0])}</p>
                      )}
                    </div>
                  )}
                </createForm.Field>

                <createForm.Field name="batchId">
                  {(f) => (
                    <div>
                      <Label>Batch <span className="text-destructive">*</span></Label>
                      <BatchSelector
                        value={f.state.value}
                        onValueChange={(v) => {
                          f.handleChange(v)
                          setSelectedBatchId(v)
                          createForm.setFieldValue('classId', '')
                        }}
                        intakeId={selectedIntakeId}
                        className="mt-1 w-full"
                      />
                      {f.state.meta.errors[0] && (
                        <p className="text-xs text-destructive mt-1">{String(f.state.meta.errors[0])}</p>
                      )}
                    </div>
                  )}
                </createForm.Field>

                <createForm.Field name="classId">
                  {(f) => (
                    <div>
                      <Label>Class</Label>
                      <ClassSelector
                        value={f.state.value}
                        onValueChange={(v) => f.handleChange(v)}
                        batchId={selectedBatchId}
                        className="mt-1 w-full"
                      />
                    </div>
                  )}
                </createForm.Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <createForm.Field name="enrollmentType">
                  {(f) => (
                    <div>
                      <Label>Enrollment Type <span className="text-destructive">*</span></Label>
                      <Select
                        value={f.state.value}
                        onValueChange={(v) => f.handleChange(v as 'SELF_ENROLL' | 'AGENT')}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SELF_ENROLL">Self Enroll</SelectItem>
                          <SelectItem value="AGENT">Agent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </createForm.Field>

                <createForm.Field name="enrollmentDate">
                  {(f) => (
                    <div>
                      <Label>Enrollment Date <span className="text-destructive">*</span></Label>
                      <Input
                        className="mt-1"
                        type="date"
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                      />
                      {f.state.meta.errors[0] && (
                        <p className="text-xs text-destructive mt-1">{String(f.state.meta.errors[0])}</p>
                      )}
                    </div>
                  )}
                </createForm.Field>
              </div>

              <createForm.Field name="remarks">
                {(f) => (
                  <div>
                    <Label>Remarks</Label>
                    <Textarea
                      className="mt-1"
                      rows={2}
                      value={f.state.value}
                      onChange={(e) => f.handleChange(e.target.value)}
                      placeholder="Any remarks..."
                    />
                  </div>
                )}
              </createForm.Field>
            </>
          )}
        </div>

        {errorMessage && (
          <Alert variant="destructive" className="mt-1">
            <AlertCircle className="size-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Enrollment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
