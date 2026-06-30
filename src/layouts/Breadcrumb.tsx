import { useMatches } from '@tanstack/react-router'
import { Fragment } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'

const LABEL_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  students: 'Students',
  academic: 'Academic',
  finance: 'Finance',
  settings: 'Settings',
  programs: 'Programs',
  classes: 'Classes',
  levels: 'Levels',
  invoices: 'Invoices',
  payments: 'Payments',
  users: 'Users',
  roles: 'Roles',
  'audit-logs': 'Audit Logs',
  'users-access': 'Users & Access',
  'user-list': 'User List',
}

function segmentLabel(segment: string): string {
  return LABEL_MAP[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function AppBreadcrumb() {
  const matches = useMatches()

  // Build crumbs from unique, non-root pathnames
  const crumbs = matches
    .filter((m) => m.pathname !== '/' && m.pathname !== '')
    .reduce<Array<{ label: string; href: string }>>((acc, m) => {
      const segments = m.pathname.split('/').filter(Boolean)
      const label = segmentLabel(segments[segments.length - 1] ?? '')
      if (label && !acc.find((c) => c.href === m.pathname)) {
        acc.push({ label, href: m.pathname })
      }
      return acc
    }, [])

  if (crumbs.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb.href}>
            <BreadcrumbItem>
              {index === crumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < crumbs.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
