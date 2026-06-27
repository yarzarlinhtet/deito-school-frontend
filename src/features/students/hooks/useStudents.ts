import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { axiosInstance } from '#/lib/axios'
import type { Student, StudentListParams, PaginatedStudents } from '../types'

const QK = 'students'

export function useStudents(params: StudentListParams = {}) {
  return useQuery({
    queryKey: [QK, 'list', params],
    queryFn: () =>
      axiosInstance
        .get<PaginatedStudents>('/students', { params })
        .then((r) => r.data),
  })
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: [QK, id],
    queryFn: () => axiosInstance.get<Student>(`/students/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useDeactivateStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      axiosInstance.patch(`/students/${id}/deactivate`).then((r) => r.data),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [QK, 'list'] })
      qc.invalidateQueries({ queryKey: [QK, id] })
      toast.success('Student deactivated')
    },
    onError: () => toast.error('Failed to deactivate student'),
  })
}

export function useDeleteStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/students/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, 'list'] })
      toast.success('Student deleted')
    },
    onError: () => toast.error('Failed to delete student'),
  })
}
