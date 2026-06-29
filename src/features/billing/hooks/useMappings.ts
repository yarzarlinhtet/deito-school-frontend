import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  programLevelFeeTemplateMappingControllerSearch,
  programLevelFeeTemplateMappingControllerCreate,
  programLevelFeeTemplateMappingControllerUpdate,
  programLevelFeeTemplateMappingControllerRecommend,
} from '#/generated/program-level-fee-template-mapping-controller/program-level-fee-template-mapping-controller'
import type {
  CreateMappingRequest,
  UpdateMappingRequest,
  MappingResponse,
  SearchRequest,
} from '#/generated/model'

const QK = 'fee-mappings'

export function useMappings(searchRequest: SearchRequest = {}) {
  return useQuery({
    queryKey: [QK, searchRequest],
    queryFn: ({ signal }) => programLevelFeeTemplateMappingControllerSearch(searchRequest, signal),
  })
}

export function useMappingRecommendations(
  programId: string | null,
  programLevelId: string | null,
) {
  return useQuery({
    queryKey: [QK, 'recommendations', programId, programLevelId],
    queryFn: ({ signal }) =>
      programLevelFeeTemplateMappingControllerRecommend({ programId: programId!, programLevelId: programLevelId! }, signal),
    enabled: !!programId && !!programLevelId,
  })
}

export function useCreateMapping() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateMappingRequest) => programLevelFeeTemplateMappingControllerCreate(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Mapping created')
    },
    onError: () => toast.error('Failed to create mapping'),
  })
}

export function useUpdateMapping() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateMappingRequest }) =>
      programLevelFeeTemplateMappingControllerUpdate(id, req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Mapping updated')
    },
    onError: () => toast.error('Failed to update mapping'),
  })
}

export function useActivateMapping() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, existing }: { id: string; existing: MappingResponse }) =>
      programLevelFeeTemplateMappingControllerUpdate(id, {
        feeTemplateId: existing.feeTemplateId ?? '',
        effectiveDate: existing.effectiveDate ?? '',
        status: 'ACTIVE' as const,
        remarks: existing.remarks,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Mapping activated')
    },
    onError: () => toast.error('Failed to activate mapping'),
  })
}

export function useDeactivateMapping() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, existing }: { id: string; existing: MappingResponse }) =>
      programLevelFeeTemplateMappingControllerUpdate(id, {
        feeTemplateId: existing.feeTemplateId ?? '',
        effectiveDate: existing.effectiveDate ?? '',
        status: 'INACTIVE' as const,
        remarks: existing.remarks,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Mapping deactivated')
    },
    onError: () => toast.error('Failed to deactivate mapping'),
  })
}
