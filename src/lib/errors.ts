import { isAxiosError } from 'axios'

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (isAxiosError(error)) {
    const msg = (error.response?.data as { message?: string } | undefined)?.message
    return msg ?? fallback
  }
  return fallback
}
