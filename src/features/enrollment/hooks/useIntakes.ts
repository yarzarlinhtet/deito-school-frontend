import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  search3,
  create3,
  update3,
} from '#/generated/intake-controller/intake-controller'
import type {
  IntakeRequest,
  UpdateIntakeRequest,
  IntakeResponse,
  SearchRequest,
} from '#/generated/model'

const QK = 'intakes'

export function useIntakes(searchRequest: SearchRequest = {}) {
  return useQuery({
    queryKey: [QK, searchRequest],
    queryFn: ({ signal }) => search3(searchRequest, signal),
  })
}

export function useCreateIntake() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: IntakeRequest) => create3(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Intake created')
    },
    onError: () => toast.error('Failed to create intake'),
  })
}

export function useUpdateIntake() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateIntakeRequest }) =>
      update3(id, req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Intake updated')
    },
    onError: () => toast.error('Failed to update intake'),
  })
}

export function useActivateIntake() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, existing }: { id: string; existing: IntakeResponse }) =>
      update3(id, {
        name: existing.name ?? '',
        startDate: existing.startDate ?? '',
        endDate: existing.endDate ?? '',
        status: 'ACTIVE',
        totalCapacity: existing.totalCapacity,
        remarks: existing.remarks,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Intake activated')
    },
    onError: () => toast.error('Failed to activate intake'),
  })
}
