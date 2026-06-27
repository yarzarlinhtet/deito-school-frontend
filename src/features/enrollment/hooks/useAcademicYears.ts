import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  list,
  create6,
  update6,
} from '#/generated/academic-year-controller/academic-year-controller'
import type {
  AcademicYearRequest,
  UpdateAcademicYearRequest,
  AcademicYearResponse,
  ListParams,
} from '#/generated/model'

const QK = 'academic-years'

export function useAcademicYears(params: ListParams = {}) {
  return useQuery({
    queryKey: [QK, params],
    queryFn: ({ signal }) => list(params, signal),
  })
}

export function useCreateAcademicYear() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: AcademicYearRequest) => create6(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Academic year created')
    },
    onError: () => toast.error('Failed to create academic year'),
  })
}

export function useUpdateAcademicYear() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateAcademicYearRequest }) =>
      update6(id, req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Academic year updated')
    },
    onError: () => toast.error('Failed to update academic year'),
  })
}

export function useActivateAcademicYear() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, existing }: { id: string; existing: AcademicYearResponse }) =>
      update6(id, {
        name: existing.name ?? '',
        startDate: existing.startDate ?? '',
        endDate: existing.endDate ?? '',
        status: 'ACTIVE',
        isCurrentYear: existing.isCurrentYear,
        description: existing.description,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Academic year activated')
    },
    onError: () => toast.error('Failed to activate academic year'),
  })
}
