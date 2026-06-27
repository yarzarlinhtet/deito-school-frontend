import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppLayout } from '#/layouts/AppLayout'
import { useAuthStore } from '#/stores/authStore'
import { customInstance } from '#/lib/axios'
import { bootstrapFromMeResponse } from '#/lib/bootstrap'
import type { MeResponse } from '#/generated/model'

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    if (typeof window === 'undefined') return

    const { isAuthenticated, accessToken } = useAuthStore.getState()

    if (!isAuthenticated || !accessToken) {
      throw redirect({ to: '/login' })
    }

    try {
      const meData = await customInstance<MeResponse>({ url: '/api/v1/auth/me', method: 'GET' })
      bootstrapFromMeResponse(meData)
    } catch {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})
