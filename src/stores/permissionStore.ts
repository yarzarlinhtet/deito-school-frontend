import { create } from 'zustand'
import type { RoleInfo } from '#/generated/model'

interface PermissionState {
  permissions: string[]
  roles: RoleInfo[]
  setPermissions: (permissions: string[], roles: RoleInfo[]) => void
  clearPermissions: () => void
}

export const usePermissionStore = create<PermissionState>()((set) => ({
  permissions: [],
  roles: [],
  setPermissions: (permissions, roles) => set({ permissions, roles }),
  clearPermissions: () => set({ permissions: [], roles: [] }),
}))
