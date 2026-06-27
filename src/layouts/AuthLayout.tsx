import { Outlet } from '@tanstack/react-router'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Deito School</h1>
          <p className="text-muted-foreground text-sm mt-1">
            School Management System
          </p>
        </div>
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
