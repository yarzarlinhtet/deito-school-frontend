import { useState } from 'react'
import { Link, useMatchRoute } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileText,
  ReceiptText,
  Building2,
  ChevronDown,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { ScrollArea } from '#/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '#/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'
import { useUiStore } from '#/stores/uiStore'
import { useUserStore } from '#/stores/userStore'
import { useAuth } from '#/hooks/useAuth'
import { cn } from '#/lib/utils'

interface NavChild {
  href: string
  label: string
}

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  children?: NavChild[]
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/students',
    label: 'Students',
    icon: Users,
    children: [
      { href: '/students', label: 'All Students' },
      { href: '/students/new', label: 'Enroll Student' },
    ],
  },
  {
    href: '/academic',
    label: 'Academic',
    icon: GraduationCap,
    children: [
      { href: '/academic/programs', label: 'Programs' },
      { href: '/academic/levels', label: 'Program Levels' },
      { href: '/academic/classes', label: 'Classes' },
    ],
  },
  {
    href: '/enrollment',
    label: 'Enrollment',
    icon: BookOpen,
    children: [
      { href: '/enrollment/academic-years', label: 'Academic Years' },
      { href: '/enrollment/intake-batch', label: 'Intake & Batch' },
    ],
  },
  {
    href: '/fees',
    label: 'Fees',
    icon: FileText,
    children: [
      { href: '/fees/categories', label: 'Categories & Templates' },
      { href: '/fees/discounts', label: 'Discounts' },
    ],
  },
  {
    href: '/billing',
    label: 'Billing',
    icon: ReceiptText,
    children: [
      { href: '/billing/fee-mappings', label: 'Fee Template Mapping' },
    ],
  },
  {
    href: '/finance',
    label: 'Finance',
    icon: DollarSign,
  },
  {
    href: '/admin',
    label: 'Administration',
    icon: Building2,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
]

export function AppSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore()
  const { logout } = useAuth()
  const currentUser = useUserStore((s) => s.currentUser)
  const userInfo = currentUser?.user
  const matchRoute = useMatchRoute()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  function isActive(href: string) {
    return !!matchRoute({ to: href as any, fuzzy: true })
  }

  function toggleSection(href: string) {
    setOpenSections((prev) => ({ ...prev, [href]: !prev[href] }))
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200',
        sidebarCollapsed ? 'w-16' : 'w-[260px]'
      )}
    >
      {/* Logo + collapse toggle */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-3">
        {!sidebarCollapsed && (
          <span className="font-bold text-base text-sidebar-foreground truncate flex-1 ml-1">
            Deito School
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'size-8 text-sidebar-foreground hover:bg-sidebar-accent shrink-0',
            sidebarCollapsed && 'mx-auto'
          )}
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 min-h-0 py-3">
        <nav className="space-y-0.5 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon, children }) => {
            const active = isActive(href)
            const sectionOpen = openSections[href] ?? active

            if (!children) {
              const link = (
                <Link
                  key={href}
                  to={href as any}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {!sidebarCollapsed && <span>{label}</span>}
                </Link>
              )

              if (sidebarCollapsed) {
                return (
                  <Tooltip key={href} delayDuration={0}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{label}</TooltipContent>
                  </Tooltip>
                )
              }

              return link
            }

            if (sidebarCollapsed) {
              return (
                <Tooltip key={href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      to={href as any}
                      className={cn(
                        'flex items-center justify-center rounded-md p-2 transition-colors',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                      )}
                    >
                      <Icon className="size-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              )
            }

            return (
              <Collapsible
                key={href}
                open={sectionOpen}
                onOpenChange={() => toggleSection(href)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      'w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left',
                      active
                        ? 'text-primary'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1">{label}</span>
                    <ChevronDown
                      className={cn(
                        'size-3.5 transition-transform text-muted-foreground',
                        sectionOpen && 'rotate-180'
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-7 mt-0.5 space-y-0.5 border-l border-border pl-3">
                    {children.map((child) => {
                      const childActive = isActive(child.href)
                      return (
                        <Link
                          key={child.href}
                          to={child.href as any}
                          className={cn(
                            'block rounded-md px-2 py-1.5 text-sm transition-colors',
                            childActive
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                          )}
                        >
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User info + logout */}
      <div className="border-t border-sidebar-border p-3">
        {sidebarCollapsed ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void logout()}
            className="size-8 mx-auto flex text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">
              {userInfo?.fullName?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {userInfo?.fullName ?? 'User'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {userInfo?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void logout()}
              className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}
