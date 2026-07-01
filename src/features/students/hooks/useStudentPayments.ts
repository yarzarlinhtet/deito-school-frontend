import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { PaginationState, SortingState } from '@tanstack/react-table'
import { toast } from 'sonner'
import {
  studentPaymentControllerListByInvoice,
  studentPaymentControllerCollectPayment,
  studentPaymentControllerSearch,
} from '#/generated/student-payment-controller/student-payment-controller'
import type { CollectPaymentRequest, FilterCriteria } from '#/generated/model'
import { FilterCriteriaOperator } from '#/generated/model/filterCriteriaOperator'

const SPQ = 'student-payments'
const ACTOR = { actor: {} }

export function useInvoicePayments(invoiceId: string | undefined) {
  return useQuery({
    queryKey: [SPQ, 'by-invoice', invoiceId],
    queryFn: ({ signal }) => studentPaymentControllerListByInvoice(invoiceId!, signal),
    enabled: !!invoiceId,
  })
}

export function useCollectPayment(invoiceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CollectPaymentRequest) =>
      studentPaymentControllerCollectPayment(invoiceId, req, ACTOR),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SPQ, 'by-invoice', invoiceId] })
      qc.invalidateQueries({ queryKey: [SPQ, 'transactions'] })
      qc.invalidateQueries({ queryKey: ['student-invoices'] })
      qc.invalidateQueries({ queryKey: ['student-fee-account'] })
      toast.success('Payment collected successfully')
    },
    onError: () => toast.error('Failed to collect payment'),
  })
}

interface TransactionFilters {
  receiptNo?: string
  invoiceNumber?: string
  paymentMethod?: string
}

export function useStudentTransactions(
  feeAccountId: string | undefined,
  pagination: PaginationState,
  sorting: SortingState,
  filters: TransactionFilters,
) {
  return useQuery({
    queryKey: [SPQ, 'transactions', feeAccountId, pagination, sorting, filters],
    queryFn: ({ signal }) => {
      const criteria: FilterCriteria[] = [
        { field: 'feeAccountId', operator: FilterCriteriaOperator.EQ, value: feeAccountId! },
        ...(filters.receiptNo
          ? [{ field: 'receiptNumber', operator: FilterCriteriaOperator.CONTAINS, value: filters.receiptNo }]
          : []),
        ...(filters.invoiceNumber
          ? [{ field: 'invoiceNumber', operator: FilterCriteriaOperator.CONTAINS, value: filters.invoiceNumber }]
          : []),
        ...(filters.paymentMethod && filters.paymentMethod !== 'all'
          ? [{ field: 'paymentMethod', operator: FilterCriteriaOperator.EQ, value: filters.paymentMethod }]
          : []),
      ]
      return studentPaymentControllerSearch(
        {
          filters: criteria,
          sorts: sorting.map((s) => ({
            field: s.id,
            direction: s.desc ? ('DESC' as const) : ('ASC' as const),
          })),
          pagination: { page: pagination.pageIndex, size: pagination.pageSize },
        },
        signal,
      )
    },
    enabled: !!feeAccountId,
  })
}
