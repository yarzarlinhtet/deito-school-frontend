import { Link, useMatchRoute } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { ScrollArea } from '#/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'
import { useUiStore } from '#/stores/uiStore'
import { useUserStore } from '#/stores/userStore'
import { useAuth } from '#/hooks/useAuth'
import { cn } from '#/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { href: '/platform/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/platform/schools', label: 'Schools', icon: Building2 },
  { href: '/platform/users', label: 'Users', icon: Users },
  { href: '/platform/billing', label: 'Billing', icon: CreditCard },
  { href: '/platform/audit', label: 'Audit Logs', icon: ClipboardList },
  { href: '/platform/permissions', label: 'Permissions', icon: ShieldCheck },
  { href: '/platform/settings', label: 'Settings', icon: Settings },
]

export function PlatformSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore()
  const { logout } = useAuth()
  const currentUser = useUserStore((s) => s.currentUser)
  const userInfo = currentUser?.user
  const matchRoute = useMatchRoute()

  function isActive(href: string) {
    return !!matchRoute({ to: href as Parameters<typeof matchRoute>[0]['to'], fuzzy: true })
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
          <div className="flex-1 ml-1">
            <span className="font-bold text-base text-sidebar-foreground">Deito Platform</span>
            <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">Admin Console</span>
          </div>
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
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-0.5 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            const link = (
              <Link
                key={href}
                to={href as Parameters<typeof Link>[0]['to']}
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
                {userInfo?.fullName ?? 'Platform Admin'}
              </p>
              <p className="truncate text-xs text-muted-foreground">{userInfo?.email}</p>
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
