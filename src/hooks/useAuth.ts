import { useAuthStore } from '#/stores/authStore'
import { useUserStore } from '#/stores/userStore'
import { useNavigate } from '@tanstack/react-router'
import { authControllerLogout as logoutFn } from '#/generated/auth-controller/auth-controller'
import { clearUserContext } from '#/lib/bootstrap'

export function useAuth() {
  const { isAuthenticated, accessToken, logout: storeLogout } = useAuthStore()
  const currentUser = useUserStore((s) => s.currentUser)
  const navigate = useNavigate()

  async function logout() {
    try {
      const refreshToken = useAuthStore.getState().refreshToken
      if (refreshToken) {
        await logoutFn({ refreshToken })
      }
    } catch {
      // Best-effort; always clear local state regardless
    } finally {
      storeLogout()
      clearUserContext()
      await navigate({ to: '/login' })
    }
  }

  return { currentUser, isAuthenticated, accessToken, logout }
}
