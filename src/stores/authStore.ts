import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TokenResponse } from '#/generated/model'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean

  setTokens: (tokens: TokenResponse) => void
  setAccessToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken ?? null,
          refreshToken: tokens.refreshToken ?? null,
          isAuthenticated: true,
        }),

      setAccessToken: (token) => set({ accessToken: token }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'deito-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
