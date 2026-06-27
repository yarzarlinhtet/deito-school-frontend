import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useAuthStore } from '#/stores/authStore'

export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    if (typeof window === 'undefined') return

    const { isAuthenticated } = useAuthStore.getState()
    if (isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: Outlet,
})
