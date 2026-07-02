import { env } from '#/env'

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: { VITE_API_BASE_URL?: string }
  }
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.__RUNTIME_CONFIG__?.VITE_API_BASE_URL || env.VITE_API_BASE_URL
  }
  const processEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
  return processEnv?.VITE_API_BASE_URL || env.VITE_API_BASE_URL
}
