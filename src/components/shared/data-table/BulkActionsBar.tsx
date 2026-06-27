import type { LucideIcon } from 'lucide-react'
import { X } from 'lucide-react'
import { Button } from '#/components/ui/button'

export interface BulkAction {
  label: string
  icon?: LucideIcon
  variant?: 'default' | 'outline' | 'destructive' | 'ghost'
  onClick: () => void
}

interface BulkActionsBarProps {
  selectedCount: number
  actions: BulkAction[]
  onClear: () => void
}

export function BulkActionsBar({
  selectedCount,
  actions,
  onClear,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
      <span className="text-sm font-medium text-primary">
        {selectedCount} selected
      </span>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-2">
        {actions.map((action, i) => {
          const Icon = action.icon
          return (
            <Button
              key={i}
              variant={action.variant ?? 'outline'}
              size="sm"
              onClick={action.onClick}
              className="h-7 gap-1.5 text-xs"
            >
              {Icon && <Icon className="size-3.5" />}
              {action.label}
            </Button>
          )
        })}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClear}
        className="ml-auto size-7 text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}
