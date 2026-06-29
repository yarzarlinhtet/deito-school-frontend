import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  classControllerSearch,
  classControllerCreate,
  classControllerUpdate,
} from '#/generated/class-controller/class-controller'
import { batchControllerSearch } from '#/generated/batch-controller/batch-controller'
import type {
  CreateClassRequest,
  UpdateClassRequest,
  ClassResponse,
  SearchRequest,
} from '#/generated/model'

const QK = 'classes'
const BATCH_QK = 'batches'

export function useClasses(searchRequest: SearchRequest = {}) {
  return useQuery({
    queryKey: [QK, searchRequest],
    queryFn: ({ signal }) => classControllerSearch(searchRequest, signal),
  })
}

export function useActiveBatches() {
  return useQuery({
    queryKey: [BATCH_QK, 'active'],
    queryFn: ({ signal }) =>
      batchControllerSearch(
        {
          filters: [{ field: 'status', operator: 'EQ', value: 'ACTIVE' }],
          pagination: { page: 0, size: 200 },
        },
        signal,
      ),
  })
}

export function useCreateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateClassRequest) => classControllerCreate(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Class created')
    },
    onError: () => toast.error('Failed to create class'),
  })
}

export function useUpdateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateClassRequest }) =>
      classControllerUpdate(id, req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Class updated')
    },
    onError: () => toast.error('Failed to update class'),
  })
}

export function useActivateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, existing }: { id: string; existing: ClassResponse }) =>
      classControllerUpdate(id, {
        name: existing.name ?? '',
        capacity: existing.capacity ?? 1,
        remarks: existing.remarks,
        status: 'ACTIVE' as const,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Class activated')
    },
    onError: () => toast.error('Failed to activate class'),
  })
}

export function useDeactivateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, existing }: { id: string; existing: ClassResponse }) =>
      classControllerUpdate(id, {
        name: existing.name ?? '',
        capacity: existing.capacity ?? 1,
        remarks: existing.remarks,
        status: 'CLOSED' as const,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Class deactivated')
    },
    onError: () => toast.error('Failed to deactivate class'),
  })
}
