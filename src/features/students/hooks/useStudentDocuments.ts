import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { axiosInstance } from '#/lib/axios'
import type { StudentDocument, VisaInfo } from '../types'

export function useStudentDocuments(studentId: string) {
  return useQuery({
    queryKey: ['students', studentId, 'documents'],
    queryFn: () =>
      axiosInstance
        .get<StudentDocument[]>(`/students/${studentId}/documents`)
        .then((r) => r.data),
    enabled: !!studentId,
  })
}

export function useUploadDocument(studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ docId, file }: { docId: string; file: File }) => {
      const form = new FormData()
      form.append('file', file)
      form.append('documentId', docId)
      return axiosInstance
        .post(`/students/${studentId}/documents`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students', studentId, 'documents'] })
      toast.success('Document uploaded')
    },
    onError: () => toast.error('Failed to upload document'),
  })
}

export function useStudentVisa(studentId: string) {
  return useQuery({
    queryKey: ['students', studentId, 'visa'],
    queryFn: () =>
      axiosInstance.get<VisaInfo>(`/students/${studentId}/visa`).then((r) => r.data),
    enabled: !!studentId,
  })
}
