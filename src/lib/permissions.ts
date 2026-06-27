import type { Permission } from '#/types/permission'

export function hasPermission(
  userPermissions: string[],
  required: Permission
): boolean {
  if (!required) return true
  if (userPermissions.includes(required)) return true

  // Wildcard: ACADEMIC:PROGRAM:* grants any ACADEMIC:PROGRAM action
  const parts = required.split(':')
  for (let i = parts.length - 1; i >= 1; i--) {
    const wildcard = [...parts.slice(0, i), '*'].join(':')
    if (userPermissions.includes(wildcard)) return true
  }

  return false
}

export function hasAllPermissions(
  userPermissions: string[],
  required: Permission[]
): boolean {
  return required.every((p) => hasPermission(userPermissions, p))
}

export function hasAnyPermission(
  userPermissions: string[],
  required: Permission[]
): boolean {
  return required.some((p) => hasPermission(userPermissions, p))
}
