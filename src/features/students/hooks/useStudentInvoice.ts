import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  studentInvoiceControllerSearch,
  studentInvoiceControllerGenerateInvoice,
} from '#/generated/student-invoice-controller/student-invoice-controller'
import type { GenerateInvoiceRequest } from '#/generated/model'

const SIQ = 'student-invoices'
const ACTOR = { actor: {} }

export function useStudentInvoices(feeAccountId: string | undefined) {
  return useQuery({
    queryKey: [SIQ, feeAccountId],
    queryFn: ({ signal }) =>
      studentInvoiceControllerSearch(
        {
          filters: [{ field: 'feeAccountId', operator: 'EQ', value: feeAccountId }],
          pagination: { page: 0, size: 200 },
        },
        signal,
      ),
    enabled: !!feeAccountId,
  })
}

export function useGenerateInvoice(feeAccountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: GenerateInvoiceRequest) =>
      studentInvoiceControllerGenerateInvoice(feeAccountId, req, ACTOR),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SIQ, feeAccountId] })
      qc.invalidateQueries({ queryKey: ['student-fee-account'] })
      toast.success('Invoice generated successfully')
    },
    onError: () => toast.error('Failed to generate invoice'),
  })
}
