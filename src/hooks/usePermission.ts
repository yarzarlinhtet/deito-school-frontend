import { usePermissionStore } from '#/stores/permissionStore'
import { hasPermission, hasAllPermissions, hasAnyPermission } from '#/lib/permissions'
import type { Permission } from '#/types/permission'

export function usePermission(permission: Permission): boolean {
  const permissions = usePermissionStore((state) => state.permissions)
  return hasPermission(permissions, permission)
}

export function useAllPermissions(permissions: Permission[]): boolean {
  const perms = usePermissionStore((state) => state.permissions)
  return hasAllPermissions(perms, permissions)
}

export function useAnyPermission(permissions: Permission[]): boolean {
  const perms = usePermissionStore((state) => state.permissions)
  return hasAnyPermission(perms, permissions)
}
