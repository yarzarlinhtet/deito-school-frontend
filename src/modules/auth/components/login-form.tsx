import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { isAxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { useTenantLogin, usePlatformLoginMutation } from '../hooks/use-login'

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const msg = (error.response?.data as { message?: string } | undefined)?.message
    return msg ?? 'Invalid credentials. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}

function FieldError({ errors }: { errors: (string | undefined)[] }) {
  const msg = errors[0]
  if (!msg) return null
  return <p className="text-xs text-destructive mt-1">{msg}</p>
}

export function LoginForm() {
  const [activeTab, setActiveTab] = useState<'tenant' | 'platform'>('tenant')
  const [tenantApiError, setTenantApiError] = useState<string | null>(null)
  const [platformApiError, setPlatformApiError] = useState<string | null>(null)

  const tenantLogin = useTenantLogin()
  const platformLogin = usePlatformLoginMutation()

  const tenantForm = useForm({
    defaultValues: {
      schoolCode: '',
      email: '',
      password: '',
      rememberMe: false as boolean,
    },
    onSubmit: async ({ value }) => {
      setTenantApiError(null)
      try {
        await tenantLogin.mutateAsync({
          schoolCode: value.schoolCode,
          email: value.email || undefined,
          password: value.password,
        })
      } catch (error) {
        setTenantApiError(extractErrorMessage(error))
      }
    },
  })

  const platformForm = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false as boolean,
    },
    onSubmit: async ({ value }) => {
      setPlatformApiError(null)
      try {
        await platformLogin.mutateAsync({
          email: value.email || undefined,
          password: value.password,
        })
      } catch (error) {
        setPlatformApiError(extractErrorMessage(error))
      }
    },
  })

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as 'tenant' | 'platform')}
    >
      <TabsList className="w-full mb-6">
        <TabsTrigger value="tenant" className="flex-1">
          Tenant Login
        </TabsTrigger>
        <TabsTrigger value="platform" className="flex-1">
          Platform Login
        </TabsTrigger>
      </TabsList>

      {/* ─── Tenant Login ─── */}
      <TabsContent value="tenant" className="mt-0">
        {tenantApiError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{tenantApiError}</AlertDescription>
          </Alert>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            void tenantForm.handleSubmit()
          }}
          className="space-y-4"
        >
          <tenantForm.Field
            name="schoolCode"
            validators={{
              onSubmit: ({ value }) => {
                const result = z.string().min(1, 'School code is required').safeParse(value)
                return result.success ? undefined : result.error.issues[0].message
              },
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor="schoolCode">School Code</Label>
                <Input
                  id="schoolCode"
                  className="mt-1.5"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g. SCH-001"
                  disabled={tenantLogin.isPending}
                  autoComplete="organization"
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </tenantForm.Field>

          <tenantForm.Field
            name="email"
            validators={{
              onSubmit: ({ value }) => {
                const result = z.string().min(1, 'Email is required').email('Invalid email address').safeParse(value)
                return result.success ? undefined : result.error.issues[0].message
              },
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor="tenant-email">Email Address</Label>
                <Input
                  id="tenant-email"
                  type="email"
                  className="mt-1.5"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="you@school.edu"
                  disabled={tenantLogin.isPending}
                  autoComplete="email"
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </tenantForm.Field>

          <tenantForm.Field
            name="password"
            validators={{
              onSubmit: ({ value }) => {
                const result = z.string().min(1, 'Password is required').safeParse(value)
                return result.success ? undefined : result.error.issues[0].message
              },
            }}
          >
            {(field) => (
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="tenant-password">Password</Label>
                  {/* <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot password?
                  </button> */}
                </div>
                <Input
                  id="tenant-password"
                  type="password"
                  className="mt-1.5"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="••••••••"
                  disabled={tenantLogin.isPending}
                  autoComplete="current-password"
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </tenantForm.Field>

          {/* <tenantForm.Field name="rememberMe">
            {(field) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="tenant-rememberMe"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(!!checked)}
                  disabled={tenantLogin.isPending}
                />
                <Label htmlFor="tenant-rememberMe" className="font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>
            )}
          </tenantForm.Field> */}

          <Button
            type="submit"
            className="w-full"
            disabled={tenantLogin.isPending}
          >
            {tenantLogin.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </TabsContent>

      {/* ─── Platform Login ─── */}
      <TabsContent value="platform" className="mt-0">
        {platformApiError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{platformApiError}</AlertDescription>
          </Alert>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            void platformForm.handleSubmit()
          }}
          className="space-y-4"
        >
          <platformForm.Field
            name="email"
            validators={{
              onSubmit: ({ value }) => {
                const result = z.string().min(1, 'Email is required').email('Invalid email address').safeParse(value)
                return result.success ? undefined : result.error.issues[0].message
              },
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor="platform-email">Email Address</Label>
                <Input
                  id="platform-email"
                  type="email"
                  className="mt-1.5"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="admin@deito.platform"
                  disabled={platformLogin.isPending}
                  autoComplete="email"
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </platformForm.Field>

          <platformForm.Field
            name="password"
            validators={{
              onSubmit: ({ value }) => {
                const result = z.string().min(1, 'Password is required').safeParse(value)
                return result.success ? undefined : result.error.issues[0].message
              },
            }}
          >
            {(field) => (
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="platform-password">Password</Label>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="platform-password"
                  type="password"
                  className="mt-1.5"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="••••••••"
                  disabled={platformLogin.isPending}
                  autoComplete="current-password"
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </platformForm.Field>

          <platformForm.Field name="rememberMe">
            {(field) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="platform-rememberMe"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(!!checked)}
                  disabled={platformLogin.isPending}
                />
                <Label htmlFor="platform-rememberMe" className="font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>
            )}
          </platformForm.Field>

          <Button
            type="submit"
            className="w-full"
            disabled={platformLogin.isPending}
          >
            {platformLogin.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}
