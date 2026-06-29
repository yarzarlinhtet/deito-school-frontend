import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { studentFeeAccountControllerGetByStudentId } from '#/generated/student-fee-account-controller/student-fee-account-controller'
import {
  studentFeeAccountDiscountControllerApply,
  studentFeeAccountDiscountControllerList,
  studentFeeAccountDiscountControllerRemove,
} from '#/generated/student-fee-account-discount-controller/student-fee-account-discount-controller'
import { discountControllerListActive } from '#/generated/discount-controller/discount-controller'
import type { ApplyDiscountRequest } from '#/generated/model'

const QK = 'student-fee-account'
const DQK = 'fee-account-discounts'

export function useStudentFeeAccount(studentId: string) {
  return useQuery({
    queryKey: [QK, studentId],
    queryFn: ({ signal }) =>
      studentFeeAccountControllerGetByStudentId(studentId, signal).then((res) => res[0] ?? null),
    enabled: !!studentId,
  })
}

export function useFeeAccountDiscounts(feeAccountId: string | undefined) {
  return useQuery({
    queryKey: [DQK, feeAccountId],
    queryFn: ({ signal }) => studentFeeAccountDiscountControllerList(feeAccountId!, signal),
    enabled: !!feeAccountId,
  })
}

export function useActiveDiscounts() {
  return useQuery({
    queryKey: ['discounts', 'active'],
    queryFn: ({ signal }) => discountControllerListActive(signal),
  })
}

export function useApplyDiscount(feeAccountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: ApplyDiscountRequest) =>
      studentFeeAccountDiscountControllerApply(feeAccountId, req, { actor: {} }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] })
      qc.invalidateQueries({ queryKey: [DQK, feeAccountId] })
      toast.success('Discount applied')
    },
    onError: () => toast.error('Failed to apply discount'),
  })
}

export function useRemoveDiscount(feeAccountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (discountApplicationId: string) =>
      studentFeeAccountDiscountControllerRemove(feeAccountId, discountApplicationId, { actor: {} }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] })
      qc.invalidateQueries({ queryKey: [DQK, feeAccountId] })
      toast.success('Discount removed')
    },
    onError: () => toast.error('Failed to remove discount'),
  })
}
