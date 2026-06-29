import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  discountControllerSearch,
  discountControllerCreate,
  discountControllerUpdate,
  discountControllerGetById,
} from '#/generated/discount-controller/discount-controller'
import type {
  DiscountRequest,
  UpdateDiscountRequest,
  DiscountResponse,
  SearchRequest,
} from '#/generated/model'

const QK = 'discounts'

export function useDiscounts(searchRequest: SearchRequest = {}) {
  return useQuery({
    queryKey: [QK, searchRequest],
    queryFn: ({ signal }) => discountControllerSearch(searchRequest, signal),
  })
}

export function useDiscountDetail(id: string | null) {
  return useQuery({
    queryKey: [QK, 'detail', id],
    queryFn: ({ signal }) => discountControllerGetById(id!, signal),
    enabled: !!id,
  })
}

export function useCreateDiscount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: DiscountRequest) => discountControllerCreate(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Discount created')
    },
    onError: () => toast.error('Failed to create discount'),
  })
}

export function useUpdateDiscount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateDiscountRequest }) =>
      discountControllerUpdate(id, req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Discount updated')
    },
    onError: () => toast.error('Failed to update discount'),
  })
}

export function useActivateDiscount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, existing }: { id: string; existing: DiscountResponse }) =>
      discountControllerUpdate(id, {
        name: existing.name ?? '',
        discountType: existing.discountType!,
        value: existing.value ?? 0,
        feeCategoryIds: existing.feeCategoryIds ?? [],
        startDate: existing.startDate ?? '',
        endDate: existing.endDate ?? '',
        status: 'ACTIVE' as const,
        description: existing.description,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Discount activated')
    },
    onError: () => toast.error('Failed to activate discount'),
  })
}

export function useDeactivateDiscount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, existing }: { id: string; existing: DiscountResponse }) =>
      discountControllerUpdate(id, {
        name: existing.name ?? '',
        discountType: existing.discountType!,
        value: existing.value ?? 0,
        feeCategoryIds: existing.feeCategoryIds ?? [],
        startDate: existing.startDate ?? '',
        endDate: existing.endDate ?? '',
        status: 'INACTIVE' as const,
        description: existing.description,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Discount deactivated')
    },
    onError: () => toast.error('Failed to deactivate discount'),
  })
}
