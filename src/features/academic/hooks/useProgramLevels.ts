import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  programLevelControllerSearch,
  programLevelControllerCreate,
  programLevelControllerUpdate,
} from '#/generated/program-level-controller/program-level-controller'
import { programControllerListLevels } from '#/generated/program-controller/program-controller'
import type {
  ProgramLevelRequest,
  UpdateProgramLevelRequest,
  ProgramLevelResponse,
  SearchRequest,
} from '#/generated/model'

const QK = 'program-levels'

export function useProgramLevels(searchRequest: SearchRequest = {}) {
  return useQuery({
    queryKey: [QK, searchRequest],
    queryFn: ({ signal }) => programLevelControllerSearch(searchRequest, signal),
  })
}

export function useProgramLevelsByProgram(programId: string | null) {
  return useQuery({
    queryKey: [QK, 'by-program', programId],
    queryFn: ({ signal }) => programControllerListLevels(programId!, signal),
    enabled: !!programId,
  })
}

export function useCreateProgramLevel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: ProgramLevelRequest) => programLevelControllerCreate(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Program level created')
    },
    onError: () => toast.error('Failed to create program level'),
  })
}

export function useUpdateProgramLevel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateProgramLevelRequest }) =>
      programLevelControllerUpdate(id, req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Program level updated')
    },
    onError: () => toast.error('Failed to update program level'),
  })
}

export function useActivateProgramLevel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, existing }: { id: string; existing: ProgramLevelResponse }) =>
      programLevelControllerUpdate(id, {
        name: existing.name ?? '',
        displayOrder: existing.displayOrder,
        status: 'ACTIVE',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Program level activated')
    },
    onError: () => toast.error('Failed to activate program level'),
  })
}

export function useDeactivateProgramLevel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, existing }: { id: string; existing: ProgramLevelResponse }) =>
      programLevelControllerUpdate(id, {
        name: existing.name ?? '',
        displayOrder: existing.displayOrder,
        status: 'INACTIVE',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Program level deactivated')
    },
    onError: () => toast.error('Failed to deactivate program level'),
  })
}
