import { Outlet } from '@tanstack/react-router'
import { PlatformSidebar } from './PlatformSidebar'
import { PlatformHeader } from './PlatformHeader'
import { useUiStore } from '#/stores/uiStore'
import { useAuthBootstrap } from '#/modules/auth/hooks/use-auth-bootstrap'
import { cn } from '#/lib/utils'

export function PlatformLayout() {
  useAuthBootstrap()
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed)

  return (
    <div className="flex min-h-screen bg-background">
      <PlatformSidebar />
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-200 min-w-0',
          sidebarCollapsed ? 'ml-16' : 'ml-[260px]'
        )}
      >
        <PlatformHeader />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
