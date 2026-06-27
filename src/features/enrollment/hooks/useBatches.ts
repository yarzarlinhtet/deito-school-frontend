import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  search5,
  create5,
  update5,
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
    queryFn: ({ signal }) => search5(searchRequest, signal),
  })
}

export function useCreateBatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: BatchRequest) => create5(req),
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
      update5(id, req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Batch updated')
    },
    onError: () => toast.error('Failed to update batch'),
  })
}
