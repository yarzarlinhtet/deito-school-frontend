import { Outlet } from '@tanstack/react-router'
import { AppSidebar } from './Sidebar'
import { AppHeader } from './Header'
import { useUiStore } from '#/stores/uiStore'
import { useAuthBootstrap } from '#/modules/auth/hooks/use-auth-bootstrap'
import { cn } from '#/lib/utils'

export function AppLayout() {
  useAuthBootstrap()
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed)

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-200 min-w-0',
          sidebarCollapsed ? 'ml-16' : 'ml-[260px]'
        )}
      >
        <AppHeader />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
