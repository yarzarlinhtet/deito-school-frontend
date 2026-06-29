import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  studentEnrollmentControllerListByStudent,
  studentEnrollmentControllerCreate,
  studentEnrollmentControllerUpdate,
} from '#/generated/student-enrollment-controller/student-enrollment-controller'
import type {
  CreateEnrollmentRequest,
  UpdateEnrollmentRequest,
  StudentEnrollmentResponse,
  CreateEnrollmentRequestEnrollmentType,
} from '#/generated/model'
import { getErrorMessage } from '#/lib/errors'

const QK = 'student-enrollments'

export function useStudentEnrollments(studentId: string) {
  return useQuery({
    queryKey: [QK, studentId],
    queryFn: ({ signal }) => studentEnrollmentControllerListByStudent(studentId, signal),
    enabled: !!studentId,
  })
}

export function useCreateEnrollment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateEnrollmentRequest) =>
      studentEnrollmentControllerCreate(req, { actor: {} }),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: [QK, data.studentId] })
      toast.success('Enrollment created')
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to create enrollment')),
  })
}

export function useUpdateEnrollment(studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateEnrollmentRequest }) =>
      studentEnrollmentControllerUpdate(id, req, { actor: {} }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK, studentId] })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to update enrollment')),
  })
}

export function useTransferEnrollment(studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      current,
      newProgramId,
      newProgramLevelId,
      remarks,
    }: {
      current: StudentEnrollmentResponse
      newProgramId: string
      newProgramLevelId: string
      remarks?: string
    }) => {
      await studentEnrollmentControllerUpdate(
        current.id!,
        {
          status: 'TRANSFERRED',
          enrollmentDate: current.enrollmentDate!,
          classId: current.classId || undefined,
          remarks: remarks || undefined,
        },
        { actor: {} },
      )
      return studentEnrollmentControllerCreate(
        {
          studentId: current.studentId!,
          academicYearId: current.academicYearId!,
          intakeId: current.intakeId!,
          batchId: current.batchId!,
          programId: newProgramId,
          programLevelId: newProgramLevelId,
          enrollmentType: (current.enrollmentType ?? 'SELF_ENROLL') as CreateEnrollmentRequestEnrollmentType,
          enrollmentDate: new Date().toISOString().split('T')[0],
          remarks: remarks || undefined,
        },
        { actor: {} },
      )
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK, studentId] })
      toast.success('Program transferred successfully')
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to transfer program')),
  })
}
