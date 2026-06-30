import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { FormDialog } from '#/components/shared/form/FormDialog'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Checkbox } from '#/components/ui/checkbox'
import { Badge } from '#/components/ui/badge'
import type { UserAdminResponse } from '#/generated/model'
import { useCreateUser, useUpdateUser, useAvailableRoles } from '../hooks/useUsers'

const createSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  username: z.string(),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  telephone: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm password'),
  forceChangeOnLogin: z.boolean(),
  roleIds: z.array(z.string()),
})

const editSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  username: z.string(),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  telephone: z.string(),
})

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: UserAdminResponse
}

export function UserFormDialog({ open, onOpenChange, editTarget }: UserFormDialogProps) {
  const isEdit = !!editTarget
  const create = useCreateUser()
  const update = useUpdateUser()
  const isPending = create.isPending || update.isPending
  const { data: availableRoles } = useAvailableRoles()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const createForm = useForm({
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      telephone: '',
      password: '',
      confirmPassword: '',
      forceChangeOnLogin: true,
      roleIds: [] as string[],
    },
    validators: { onSubmit: createSchema },
    onSubmit: async ({ value }) => {
      if (value.password !== value.confirmPassword) {
        createForm.setFieldMeta('confirmPassword', (prev) => ({
          ...prev,
          errors: ['Passwords do not match'],
          errorMap: { onSubmit: 'Passwords do not match' },
        }))
        return
      }
      await create.mutateAsync({
        fullName: value.fullName,
        username: value.username || undefined,
        email: value.email,
        telephone: value.telephone || undefined,
        password: value.password,
        confirmPassword: value.confirmPassword,
        forceChangeOnLogin: value.forceChangeOnLogin,
        roleIds: value.roleIds.length > 0 ? value.roleIds : undefined,
      })
      onOpenChange(false)
    },
  })

  const editForm = useForm({
    defaultValues: {
      fullName: editTarget?.fullName ?? '',
      username: editTarget?.username ?? '',
      email: editTarget?.email ?? '',
      telephone: editTarget?.telephone ?? '',
    },
    validators: { onSubmit: editSchema },
    onSubmit: async ({ value }) => {
      if (!editTarget?.id) return
      await update.mutateAsync({
        id: editTarget.id,
        req: {
          fullName: value.fullName,
          username: value.username || undefined,
          email: value.email,
          telephone: value.telephone || undefined,
          version: editTarget.version,
        },
      })
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (!open) {
      createForm.reset()
      editForm.reset()
      setShowPassword(false)
      setShowConfirm(false)
    }
  }, [open, createForm, editForm])

  function handleSubmit() {
    if (isEdit) {
      void editForm.handleSubmit()
    } else {
      void createForm.handleSubmit()
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit User' : 'Create User'}
      description={
        isEdit
          ? 'Update user profile details.'
          : 'Create a new user account. Password and roles can be changed later.'
      }
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      submitLabel={isEdit ? 'Save Changes' : 'Create User'}
    >
      <div className="grid gap-4">
        {isEdit ? (
          <>
            <editForm.Field name="fullName">
              {(f) => (
                <div className="grid gap-1.5">
                  <Label>
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                    onBlur={f.handleBlur}
                    placeholder="e.g. Thiri Hlaing"
                  />
                  {f.state.meta.errors[0] && (
                    <p className="text-xs text-destructive">{String(f.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </editForm.Field>

            <div className="grid grid-cols-2 gap-4">
              <editForm.Field name="username">
                {(f) => (
                  <div className="grid gap-1.5">
                    <Label>Username</Label>
                    <Input
                      value={f.state.value}
                      onChange={(e) => f.handleChange(e.target.value)}
                      onBlur={f.handleBlur}
                      placeholder="e.g. thiri.hlaing"
                      className="font-mono"
                    />
                    {f.state.meta.errors[0] && (
                      <p className="text-xs text-destructive">{String(f.state.meta.errors[0])}</p>
                    )}
                  </div>
                )}
              </editForm.Field>

              <editForm.Field name="telephone">
                {(f) => (
                  <div className="grid gap-1.5">
                    <Label>Phone</Label>
                    <Input
                      value={f.state.value}
                      onChange={(e) => f.handleChange(e.target.value)}
                      onBlur={f.handleBlur}
                      placeholder="+95 9 xxx xxx xxx"
                    />
                  </div>
                )}
              </editForm.Field>
            </div>

            <editForm.Field name="email">
              {(f) => (
                <div className="grid gap-1.5">
                  <Label>
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                    onBlur={f.handleBlur}
                    placeholder="user@school.edu"
                  />
                  {f.state.meta.errors[0] && (
                    <p className="text-xs text-destructive">{String(f.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </editForm.Field>
          </>
        ) : (
          <>
            <createForm.Field name="fullName">
              {(f) => (
                <div className="grid gap-1.5">
                  <Label>
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                    onBlur={f.handleBlur}
                    placeholder="e.g. Thiri Hlaing"
                  />
                  {f.state.meta.errors[0] && (
                    <p className="text-xs text-destructive">{String(f.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </createForm.Field>

            <div className="grid grid-cols-2 gap-4">
              <createForm.Field name="username">
                {(f) => (
                  <div className="grid gap-1.5">
                    <Label>Username</Label>
                    <Input
                      value={f.state.value}
                      onChange={(e) => f.handleChange(e.target.value)}
                      onBlur={f.handleBlur}
                      placeholder="e.g. thiri.hlaing"
                      className="font-mono"
                    />
                  </div>
                )}
              </createForm.Field>

              <createForm.Field name="telephone">
                {(f) => (
                  <div className="grid gap-1.5">
                    <Label>Phone</Label>
                    <Input
                      value={f.state.value}
                      onChange={(e) => f.handleChange(e.target.value)}
                      onBlur={f.handleBlur}
                      placeholder="+95 9 xxx xxx xxx"
                    />
                  </div>
                )}
              </createForm.Field>
            </div>

            <createForm.Field name="email">
              {(f) => (
                <div className="grid gap-1.5">
                  <Label>
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                    onBlur={f.handleBlur}
                    placeholder="user@school.edu"
                  />
                  {f.state.meta.errors[0] && (
                    <p className="text-xs text-destructive">{String(f.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </createForm.Field>

            <div className="grid grid-cols-2 gap-4">
              <createForm.Field name="password">
                {(f) => (
                  <div className="grid gap-1.5">
                    <Label>
                      Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                        onBlur={f.handleBlur}
                        placeholder="Min 8 characters"
                        className="pr-9"
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {f.state.meta.errors[0] && (
                      <p className="text-xs text-destructive">{String(f.state.meta.errors[0])}</p>
                    )}
                  </div>
                )}
              </createForm.Field>

              <createForm.Field name="confirmPassword">
                {(f) => (
                  <div className="grid gap-1.5">
                    <Label>
                      Confirm Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        value={f.state.value}
                        onChange={(e) => f.handleChange(e.target.value)}
                        onBlur={f.handleBlur}
                        placeholder="Re-enter password"
                        className="pr-9"
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirm((v) => !v)}
                      >
                        {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {f.state.meta.errors[0] && (
                      <p className="text-xs text-destructive">{String(f.state.meta.errors[0])}</p>
                    )}
                  </div>
                )}
              </createForm.Field>
            </div>

            <createForm.Field name="forceChangeOnLogin">
              {(f) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="force-change"
                    checked={f.state.value}
                    onCheckedChange={(checked) => f.handleChange(!!checked)}
                  />
                  <Label htmlFor="force-change" className="cursor-pointer font-normal">
                    Require password change on first login
                  </Label>
                </div>
              )}
            </createForm.Field>

            {/* Role assignment */}
            {availableRoles && availableRoles.length > 0 && (
              <div className="grid gap-2">
                <Label>Roles</Label>
                <div className="rounded-md border divide-y max-h-48 overflow-y-auto">
                  <createForm.Field name="roleIds">
                    {(f) => (
                      <>
                        {availableRoles.map((role) => {
                          const selected = (f.state.value as string[]).includes(role.id ?? '')
                          return (
                            <div
                              key={role.id}
                              className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 cursor-pointer"
                              onClick={() => {
                                const current = f.state.value as string[]
                                f.handleChange(
                                  selected
                                    ? current.filter((id) => id !== role.id)
                                    : [...current, role.id!]
                                )
                              }}
                            >
                              <Checkbox
                                checked={selected}
                                onCheckedChange={() => {
                                  const current = f.state.value as string[]
                                  f.handleChange(
                                    selected
                                      ? current.filter((id) => id !== role.id)
                                      : [...current, role.id!]
                                  )
                                }}
                              />
                              <div>
                                <p className="text-sm font-medium">{role.name}</p>
                                {role.description && (
                                  <p className="text-xs text-muted-foreground">{role.description}</p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </>
                    )}
                  </createForm.Field>
                </div>
                <createForm.Subscribe selector={(s) => s.values.roleIds}>
                  {(roleIds) =>
                    (roleIds as string[]).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {(roleIds as string[]).map((id) => {
                          const role = availableRoles.find((r) => r.id === id)
                          return role ? (
                            <Badge key={id} variant="secondary" className="text-xs">
                              {role.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    ) : null
                  }
                </createForm.Subscribe>
              </div>
            )}
          </>
        )}
      </div>
    </FormDialog>
  )
}
