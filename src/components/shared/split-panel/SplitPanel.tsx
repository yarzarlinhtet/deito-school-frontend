import type { ReactNode } from 'react'
import { cn } from '#/lib/utils'

interface SplitPanelProps {
  list: ReactNode
  detail: ReactNode
  listWidth?: number
  emptyDetail?: ReactNode
  showDetail?: boolean
  className?: string
}

export function SplitPanel({
  list,
  detail,
  listWidth = 320,
  emptyDetail,
  showDetail = true,
  className,
}: SplitPanelProps) {
  return (
    <div className={cn('flex h-full gap-0 overflow-hidden rounded-lg border bg-card', className)}>
      {/* List panel */}
      <div
        className="shrink-0 flex flex-col border-r overflow-y-auto"
        style={{ width: listWidth }}
      >
        {list}
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-y-auto">
        {showDetail ? detail : (emptyDetail ?? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Select an item to view details
          </div>
        ))}
      </div>
    </div>
  )
}
