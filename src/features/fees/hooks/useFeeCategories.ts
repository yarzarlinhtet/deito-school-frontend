import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  feeCategoryControllerList,
  feeCategoryControllerCreate,
  feeCategoryControllerUpdate,
} from '#/generated/fee-category-controller/fee-category-controller'
import type {
  FeeCategoryRequest,
  UpdateFeeCategoryRequest,
  FeeCategoryResponse,
  FeeCategoryControllerListParams,
} from '#/generated/model'

const QK = 'fee-categories'

export function useFeeCategories(params: FeeCategoryControllerListParams = {}) {
  return useQuery({
    queryKey: [QK, params],
    queryFn: ({ signal }) => feeCategoryControllerList(params, signal),
  })
}

export function useCreateFeeCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: FeeCategoryRequest) => feeCategoryControllerCreate(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Fee category created')
    },
    onError: () => toast.error('Failed to create fee category'),
  })
}

export function useUpdateFeeCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateFeeCategoryRequest }) =>
      feeCategoryControllerUpdate(id, req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Fee category updated')
    },
    onError: () => toast.error('Failed to update fee category'),
  })
}

export function useActivateFeeCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, existing }: { id: string; existing: FeeCategoryResponse }) =>
      feeCategoryControllerUpdate(id, {
        name: existing.name ?? '',
        frequency: existing.frequency as UpdateFeeCategoryRequest['frequency'],
        description: existing.description,
        defaultAmount: existing.defaultAmount,
        status: 'ACTIVE',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Fee category activated')
    },
    onError: () => toast.error('Failed to activate fee category'),
  })
}

export function useDeactivateFeeCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, existing }: { id: string; existing: FeeCategoryResponse }) =>
      feeCategoryControllerUpdate(id, {
        name: existing.name ?? '',
        frequency: existing.frequency as UpdateFeeCategoryRequest['frequency'],
        description: existing.description,
        defaultAmount: existing.defaultAmount,
        status: 'INACTIVE',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Fee category deactivated')
    },
    onError: () => toast.error('Failed to deactivate fee category'),
  })
}
