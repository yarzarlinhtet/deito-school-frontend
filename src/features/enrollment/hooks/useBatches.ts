import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  batchControllerSearch,
  batchControllerCreate,
  batchControllerUpdate,
} from '#/generated/batch-controller/batch-controller'
import type {
  BatchRequest,
  UpdateBatchRequest,
  SearchRequest,
} from '#/generated/model'

const QK = 'batches'

export function useBatches(searchRequest: SearchRequest = {}) {
  return useQuery({
    queryKey: [QK, searchRequest],
    queryFn: ({ signal }) => batchControllerSearch(searchRequest, signal),
  })
}

export function useCreateBatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: BatchRequest) => batchControllerCreate(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Batch created')
    },
    onError: () => toast.error('Failed to create batch'),
  })
}

export function useUpdateBatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateBatchRequest }) =>
      batchControllerUpdate(id, req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Batch updated')
    },
    onError: () => toast.error('Failed to update batch'),
  })
}
