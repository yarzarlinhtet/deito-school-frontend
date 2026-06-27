import type { ReactNode } from 'react'
import { BrandingPanel } from './branding-panel'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <BrandingPanel />
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full" style={{ maxWidth: '480px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
