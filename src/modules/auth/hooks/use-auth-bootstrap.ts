import { useEffect, useRef } from 'react'
import { customInstance } from '#/lib/axios'
import { useAuthStore } from '#/stores/authStore'
import { useUserStore } from '#/stores/userStore'
import { bootstrapFromMeResponse } from '#/lib/bootstrap'
import type { MeResponse } from '#/generated/model'

export function useAuthBootstrap() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const currentUser = useUserStore((s) => s.currentUser)
  const isFetchingRef = useRef(false)

  const needsBootstrap = isAuthenticated && !currentUser

  useEffect(() => {
    if (!needsBootstrap || isFetchingRef.current) return

    isFetchingRef.current = true
    customInstance<MeResponse>({ url: '/api/v1/auth/me', method: 'GET' })
      .then((data) => bootstrapFromMeResponse(data))
      .catch(() => {
        // Token may be expired; the axios interceptor handles refresh and logout
      })
      .finally(() => {
        isFetchingRef.current = false
      })
  }, [needsBootstrap])

  return { isBootstrapping: needsBootstrap }
}
