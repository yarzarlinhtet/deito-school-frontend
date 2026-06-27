import { create } from 'zustand'
import type { TenantInfo } from '#/generated/model'

interface TenantState {
  tenant: TenantInfo | null
  setTenant: (tenant: TenantInfo | null) => void
  clearTenant: () => void
}

export const useTenantStore = create<TenantState>()((set) => ({
  tenant: null,
  setTenant: (tenant) => set({ tenant }),
  clearTenant: () => set({ tenant: null }),
}))
