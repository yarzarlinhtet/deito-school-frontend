import { useUserStore } from '#/stores/userStore'
import { usePermissionStore } from '#/stores/permissionStore'
import { useTenantStore } from '#/stores/tenantStore'
import type { MeResponse } from '#/generated/model'

export function bootstrapFromMeResponse(data: MeResponse) {
  useUserStore.getState().setCurrentUser(data)
  usePermissionStore.getState().setPermissions(data.permissions ?? [], data.roles ?? [])
  useTenantStore.getState().setTenant(data.tenant ?? null)
}

export function clearUserContext() {
  useUserStore.getState().clearUser()
  usePermissionStore.getState().clearPermissions()
  useTenantStore.getState().clearTenant()
}
