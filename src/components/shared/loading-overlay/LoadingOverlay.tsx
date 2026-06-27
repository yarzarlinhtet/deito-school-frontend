import { cn } from '#/lib/utils'

interface LoadingOverlayProps {
  fullScreen?: boolean
  className?: string
  label?: string
}

export function LoadingOverlay({
  fullScreen = false,
  className,
  label = 'Loading...',
}: LoadingOverlayProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'flex items-center justify-center bg-background/70 backdrop-blur-sm z-50',
        fullScreen ? 'fixed inset-0' : 'absolute inset-0 rounded-lg',
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
