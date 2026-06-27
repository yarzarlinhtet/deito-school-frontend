import { create } from 'zustand'
import type { MeResponse } from '#/generated/model'

interface UserState {
  currentUser: MeResponse | null
  setCurrentUser: (data: MeResponse) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()((set) => ({
  currentUser: null,
  setCurrentUser: (data) => set({ currentUser: data }),
  clearUser: () => set({ currentUser: null }),
}))
