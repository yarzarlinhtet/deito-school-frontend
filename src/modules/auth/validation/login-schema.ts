import { z } from 'zod'

export const tenantLoginSchema = z.object({
  schoolCode: z.string().min(1, 'School code is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
})

export const platformLoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
})

export type TenantLoginValues = z.infer<typeof tenantLoginSchema>
export type PlatformLoginValues = z.infer<typeof platformLoginSchema>
