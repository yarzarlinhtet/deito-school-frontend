import { cn } from '#/lib/utils'
import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export function PageContainer({
  children,
  className,
  noPadding = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-screen-2xl',
        !noPadding && 'px-4 py-6 md:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  )
}
