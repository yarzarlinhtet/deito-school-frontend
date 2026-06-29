import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  studentVisaControllerList,
  studentVisaControllerCreate,
  studentVisaControllerUpdate,
  studentVisaControllerDelete,
} from '#/generated/student-visa-controller/student-visa-controller'
import type { CreateStudentVisaRequest, UpdateStudentVisaRequest } from '#/generated/model'

const QK = 'student-visas'

export function useStudentVisas(studentId: string) {
  return useQuery({
    queryKey: [QK, studentId],
    queryFn: ({ signal }) => studentVisaControllerList(studentId, signal),
    enabled: !!studentId,
  })
}

export function useCreateVisa(studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateStudentVisaRequest) =>
      studentVisaControllerCreate(studentId, req, { actor: {} }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, studentId] })
      toast.success('Visa record created')
    },
    onError: () => toast.error('Failed to create visa record'),
  })
}

export function useUpdateVisa(studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ visaId, req }: { visaId: string; req: UpdateStudentVisaRequest }) =>
      studentVisaControllerUpdate(studentId, visaId, req, { actor: {} }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, studentId] })
      toast.success('Visa record updated')
    },
    onError: () => toast.error('Failed to update visa record'),
  })
}

export function useDeleteVisa(studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (visaId: string) => studentVisaControllerDelete(studentId, visaId, { actor: {} }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, studentId] })
      toast.success('Visa record deleted')
    },
    onError: () => toast.error('Failed to delete visa record'),
  })
}
