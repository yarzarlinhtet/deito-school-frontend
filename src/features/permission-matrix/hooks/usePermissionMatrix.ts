import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  permissionMatrixControllerGetMatrix,
  permissionMatrixControllerReplacePermissions,
} from '#/generated/permission-matrix-controller/permission-matrix-controller'

const QK = 'perm-matrix'
const ACTOR = { actor: {} }

export function useMatrix() {
  return useQuery({
    queryKey: [QK],
    queryFn: ({ signal }) => permissionMatrixControllerGetMatrix(ACTOR, signal),
  })
}

export function useReplacePermissions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      permissionMatrixControllerReplacePermissions(roleId, { permissionIds }, ACTOR),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] })
      toast.success('Permissions saved successfully')
    },
    onError: () => toast.error('Failed to save permissions'),
  })
}
