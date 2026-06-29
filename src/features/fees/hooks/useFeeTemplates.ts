import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  feeTemplateControllerSearch,
  feeTemplateControllerCreate,
  feeTemplateControllerUpdate,
  feeTemplateControllerGetById,
  feeTemplateControllerListActive,
} from '#/generated/fee-template-controller/fee-template-controller'
import type {
  CreateFeeTemplateRequest,
  UpdateFeeTemplateRequest,
  SearchRequest,
} from '#/generated/model'

const QK = 'fee-templates'

export function useFeeTemplates(searchRequest: SearchRequest = {}) {
  return useQuery({
    queryKey: [QK, searchRequest],
    queryFn: ({ signal }) => feeTemplateControllerSearch(searchRequest, signal),
  })
}

export function useFeeTemplateDetail(id: string | null) {
  return useQuery({
    queryKey: [QK, 'detail', id],
    queryFn: ({ signal }) => feeTemplateControllerGetById(id!, signal),
    enabled: !!id,
  })
}

export function useFeeTemplatesActive() {
  return useQuery({
    queryKey: [QK, 'active'],
    queryFn: ({ signal }) => feeTemplateControllerListActive(signal),
  })
}

export function useCreateFeeTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateFeeTemplateRequest) => feeTemplateControllerCreate(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Fee template created')
    },
    onError: () => toast.error('Failed to create fee template'),
  })
}

export function useUpdateFeeTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateFeeTemplateRequest }) =>
      feeTemplateControllerUpdate(id, req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Fee template updated')
    },
    onError: () => toast.error('Failed to update fee template'),
  })
}
