import { useEffect, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePermission } from '#/hooks/usePermission'
import type { Permission } from '#/types/permission'

interface RouteGuardProps {
  permission: Permission
  children: ReactNode
  redirectTo?: string
}

export function RouteGuard({
  permission,
  children,
  redirectTo = '/dashboard',
}: RouteGuardProps) {
  const allowed = usePermission(permission)
  const navigate = useNavigate()

  useEffect(() => {
    if (!allowed) {
      void navigate({ to: redirectTo })
    }
  }, [allowed, navigate, redirectTo])

  if (!allowed) return null
  return <>{children}</>
}
