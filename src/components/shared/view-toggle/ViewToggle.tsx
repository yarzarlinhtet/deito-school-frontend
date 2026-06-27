import { LayoutList, AlignLeft } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

export type ViewMode = 'table' | 'timeline'

interface ViewToggleProps {
  view: ViewMode
  onChange: (view: ViewMode) => void
  className?: string
}

export function ViewToggle({ view, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn('flex items-center rounded-lg border bg-muted/50 p-0.5', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('table')}
        className={cn(
          'h-7 gap-1.5 px-3 text-xs rounded-md',
          view === 'table' && 'bg-background text-foreground shadow-sm'
        )}
      >
        <LayoutList className="size-3.5" />
        Table
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('timeline')}
        className={cn(
          'h-7 gap-1.5 px-3 text-xs rounded-md',
          view === 'timeline' && 'bg-background text-foreground shadow-sm'
        )}
      >
        <AlignLeft className="size-3.5" />
        Timeline
      </Button>
    </div>
  )
}
