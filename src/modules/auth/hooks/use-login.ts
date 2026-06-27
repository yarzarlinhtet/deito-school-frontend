import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { login as loginFn, platformLogin as platformLoginFn } from '#/generated/auth-controller/auth-controller'
import { customInstance } from '#/lib/axios'
import { useAuthStore } from '#/stores/authStore'
import { bootstrapFromMeResponse } from '#/lib/bootstrap'
import type { LoginRequest, MeResponse, PlatformLoginRequest } from '#/generated/model'

async function fetchMe(): Promise<MeResponse> {
  return customInstance<MeResponse>({ url: '/api/v1/auth/me', method: 'GET' })
}

async function fetchPlatformMe(): Promise<MeResponse> {
  return customInstance<MeResponse>({ url: '/api/v1/auth/platform/me', method: 'GET' })
}

export function useTenantLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (request: LoginRequest) => loginFn(request),
    onSuccess: async (tokens) => {
      useAuthStore.getState().setTokens(tokens)
      const meData = await fetchMe()
      bootstrapFromMeResponse(meData)
      void navigate({ to: '/dashboard' })
    },
  })
}

export function usePlatformLoginMutation() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (request: PlatformLoginRequest) => platformLoginFn(request),
    onSuccess: async (tokens) => {
      useAuthStore.getState().setTokens(tokens)
      const meData = await fetchPlatformMe()
      bootstrapFromMeResponse(meData)
      void navigate({ to: '/platform/dashboard' })
    },
  })
}
