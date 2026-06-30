import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  userAdminControllerSearch,
  userAdminControllerCreateUser,
  userAdminControllerUpdateUser,
  userAdminControllerUpdateRoles,
  userAdminControllerLockUser,
  userAdminControllerUnlockUser,
  userAdminControllerResetPassword,
  userAdminControllerAvailableRoles,
} from '#/generated/user-admin-controller/user-admin-controller'
import type {
  SearchRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateRolesRequest,
  LockUserRequest,
  ResetPasswordRequest,
} from '#/generated/model'

const QK = 'admin-users'
const ACTOR = { actor: {} }

export function useUsers(searchRequest: SearchRequest) {
  return useQuery({
    queryKey: [QK, 'list', searchRequest],
    queryFn: ({ signal }) => userAdminControllerSearch(searchRequest, ACTOR, signal),
  })
}

export function useAvailableRoles() {
  return useQuery({
    queryKey: [QK, 'roles'],
    queryFn: ({ signal }) => userAdminControllerAvailableRoles(ACTOR, signal),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateUserRequest) => userAdminControllerCreateUser(req, ACTOR),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, 'list'] })
      toast.success('User created successfully')
    },
    onError: () => toast.error('Failed to create user'),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateUserRequest }) =>
      userAdminControllerUpdateUser(id, req, ACTOR),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, 'list'] })
      toast.success('User updated successfully')
    },
    onError: () => toast.error('Failed to update user'),
  })
}

export function useUpdateUserRoles() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, req }: { userId: string; req: UpdateRolesRequest }) =>
      userAdminControllerUpdateRoles(userId, req, ACTOR),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, 'list'] })
      toast.success('Roles updated successfully')
    },
    onError: () => toast.error('Failed to update roles'),
  })
}

export function useLockUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, req }: { userId: string; req: LockUserRequest }) =>
      userAdminControllerLockUser(userId, req, ACTOR),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, 'list'] })
      toast.success('User locked successfully')
    },
    onError: () => toast.error('Failed to lock user'),
  })
}

export function useUnlockUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      userAdminControllerUnlockUser(userId, ACTOR),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, 'list'] })
      toast.success('User unlocked successfully')
    },
    onError: () => toast.error('Failed to unlock user'),
  })
}

export function useResetUserPassword() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, req }: { userId: string; req: ResetPasswordRequest }) =>
      userAdminControllerResetPassword(userId, req, ACTOR),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, 'list'] })
      toast.success('Password reset successfully')
    },
    onError: () => toast.error('Failed to reset password'),
  })
}
