import { createFileRoute, redirect } from '@tanstack/react-router'
import { PlatformLayout } from '#/layouts/PlatformLayout'
import { useAuthStore } from '#/stores/authStore'
import { useUserStore } from '#/stores/userStore'
import { customInstance } from '#/lib/axios'
import { bootstrapFromMeResponse } from '#/lib/bootstrap'
import type { MeResponse } from '#/generated/model'

export const Route = createFileRoute('/platform')({
  beforeLoad: async () => {
    if (typeof window === 'undefined') return

    const { isAuthenticated, accessToken } = useAuthStore.getState()

    if (!isAuthenticated || !accessToken) {
      throw redirect({ to: '/login' })
    }

    // Ensure user context is loaded
    let currentUser = useUserStore.getState().currentUser
    if (!currentUser) {
      try {
        const meData = await customInstance<MeResponse>({ url: '/api/v1/auth/me', method: 'GET' })
        bootstrapFromMeResponse(meData)
        currentUser = useUserStore.getState().currentUser
      } catch {
        throw redirect({ to: '/login' })
      }
    }

    // AccessLevelGuard: only PLATFORM users may access /platform/* routes
    const accessLevel = currentUser?.access?.accessLevel
    if (accessLevel !== 'PLATFORM') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: PlatformLayout,
})
