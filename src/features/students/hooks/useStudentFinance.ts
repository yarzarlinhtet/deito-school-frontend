import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { axiosInstance } from '#/lib/axios'
import type { StudentFinanceSummary, Invoice, LedgerEntry } from '../types'

export function useStudentFinanceSummary(studentId: string) {
  return useQuery({
    queryKey: ['students', studentId, 'finance'],
    queryFn: () =>
      axiosInstance
        .get<StudentFinanceSummary>(`/students/${studentId}/finance-summary`)
        .then((r) => r.data),
    enabled: !!studentId,
  })
}

export function useStudentInvoices(
  studentId: string,
  params: { page?: number; pageSize?: number; status?: string } = {}
) {
  return useQuery({
    queryKey: ['students', studentId, 'invoices', params],
    queryFn: () =>
      axiosInstance
        .get<{ data: Invoice[]; total: number }>(`/students/${studentId}/invoices`, {
          params,
        })
        .then((r) => r.data),
    enabled: !!studentId,
  })
}

export function useStudentLedger(studentId: string) {
  return useQuery({
    queryKey: ['students', studentId, 'ledger'],
    queryFn: () =>
      axiosInstance
        .get<{ data: LedgerEntry[]; runningBalance: number }>(
          `/students/${studentId}/ledger`
        )
        .then((r) => r.data),
    enabled: !!studentId,
  })
}

export function useCollectPayment(studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      invoiceIds: string[]
      amount: number
      paymentMethod: string
      paymentDate: string
      reference?: string
      notes?: string
    }) =>
      axiosInstance
        .post(`/students/${studentId}/payments`, payload)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students', studentId, 'finance'] })
      qc.invalidateQueries({ queryKey: ['students', studentId, 'invoices'] })
      qc.invalidateQueries({ queryKey: ['students', studentId, 'ledger'] })
      toast.success('Payment collected successfully')
    },
    onError: () => toast.error('Failed to collect payment'),
  })
}

export function useGenerateInvoice(studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      feeType: string
      amount: number
      issueDate: string
      dueDate: string
      period?: string
      sendImmediately?: boolean
    }) =>
      axiosInstance.post(`/students/${studentId}/invoices`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students', studentId, 'invoices'] })
      qc.invalidateQueries({ queryKey: ['students', studentId, 'finance'] })
      toast.success('Invoice generated')
    },
    onError: () => toast.error('Failed to generate invoice'),
  })
}
