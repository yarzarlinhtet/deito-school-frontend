import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  programControllerSearch,
  programControllerCreate,
  programControllerUpdate,
  programControllerListActive,
} from '#/generated/program-controller/program-controller'
import type {
  ProgramRequest,
  UpdateProgramRequest,
  ProgramResponse,
  SearchRequest,
} from '#/generated/model'

const QK = 'programs'

export function usePrograms(searchRequest: SearchRequest = {}) {
  return useQuery({
    queryKey: [QK, searchRequest],
    queryFn: ({ signal }) => programControllerSearch(searchRequest, signal),
  })
}

export function useActivePrograms() {
  return useQuery({
    queryKey: [QK, 'active'],
    queryFn: ({ signal }) => programControllerListActive(signal),
  })
}

export function useCreateProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: ProgramRequest) => programControllerCreate(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Program created')
    },
    onError: () => toast.error('Failed to create program'),
  })
}

export function useUpdateProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateProgramRequest }) =>
      programControllerUpdate(id, req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Program updated')
    },
    onError: () => toast.error('Failed to update program'),
  })
}

export function useActivateProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, existing }: { id: string; existing: ProgramResponse }) =>
      programControllerUpdate(id, {
        name: existing.name ?? '',
        description: existing.description,
        displayOrder: existing.displayOrder,
        status: 'ACTIVE',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Program activated')
    },
    onError: () => toast.error('Failed to activate program'),
  })
}

export function useDeactivateProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, existing }: { id: string; existing: ProgramResponse }) =>
      programControllerUpdate(id, {
        name: existing.name ?? '',
        description: existing.description,
        displayOrder: existing.displayOrder,
        status: 'INACTIVE',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Program deactivated')
    },
    onError: () => toast.error('Failed to deactivate program'),
  })
}
