import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  studentControllerSearch,
  studentControllerGetById,
  studentControllerCreate,
  studentControllerUpdate,
} from '#/generated/student-controller/student-controller'
import type { SearchRequest, UpdateStudentRequest, CreateStudentRequest } from '#/generated/model'

const QK = 'students'

export function useStudents(searchRequest: SearchRequest = {}) {
  return useQuery({
    queryKey: [QK, 'list', searchRequest],
    queryFn: ({ signal }) => studentControllerSearch(searchRequest, signal),
  })
}

export function useStudentDetail(id: string) {
  return useQuery({
    queryKey: [QK, id],
    queryFn: ({ signal }) => studentControllerGetById(id, signal),
    enabled: !!id,
  })
}

export function useCreateStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateStudentRequest) => studentControllerCreate(req, { actor: {} }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, 'list'] })
      toast.success('Student created successfully')
    },
    onError: () => toast.error('Failed to create student'),
  })
}

export function useUpdateStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateStudentRequest }) =>
      studentControllerUpdate(id, req, { actor: {} }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: [QK, 'list'] })
      qc.invalidateQueries({ queryKey: [QK, id] })
      toast.success('Student updated successfully')
    },
    onError: () => toast.error('Failed to update student'),
  })
}

// Fetches full detail then updates status — avoids needing StudentDetailResponse in caller
export function useUpdateStudentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: UpdateStudentRequest['status']
    }) => {
      const existing = await studentControllerGetById(id)
      return studentControllerUpdate(
        id,
        {
          fullName: existing.fullName ?? '',
          dateOfBirth: existing.dateOfBirth ?? '',
          gender: existing.gender as UpdateStudentRequest['gender'],
          nationality: existing.nationality ?? '',
          placeOfBirth: existing.placeOfBirth,
          religion: existing.religion,
          passportNumber: existing.passportNumber ?? '',
          passportExpiryDate: existing.passportExpiryDate,
          telephoneNumber: existing.telephoneNumber ?? '',
          email: existing.email,
          currentResidentialAddress: existing.currentResidentialAddress ?? '',
          permanentResidentialAddress: existing.permanentResidentialAddress,
          educationBackground: existing.educationBackground,
          fatherName: existing.fatherName,
          motherName: existing.motherName,
          emergencyContactName: existing.emergencyContactName ?? '',
          emergencyContactRelationship: existing.emergencyContactRelationship,
          emergencyContactPhone: existing.emergencyContactPhone ?? '',
          remarks: existing.remarks,
          status,
        },
        { actor: {} }
      )
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: [QK, 'list'] })
      qc.invalidateQueries({ queryKey: [QK, id] })
      toast.success('Student status updated')
    },
    onError: () => toast.error('Failed to update student status'),
  })
}
