import { formatDistanceToNow } from 'date-fns'
import { cn } from '#/lib/utils'

export interface AuditEntry {
  id: string
  action: string
  actor: string
  timestamp: string | Date
  detail?: string
  meta?: Record<string, unknown>
}

interface AuditTimelineProps {
  entries: AuditEntry[]
  className?: string
}

export function AuditTimeline({ entries, className }: AuditTimelineProps) {
  return (
    <ol className={cn('relative border-l border-border ml-3', className)}>
      {entries.map((entry) => (
        <li key={entry.id} className="mb-6 ml-6">
          <span className="absolute -left-1.5 flex size-3 items-center justify-center rounded-full bg-primary ring-4 ring-background" />
          <time className="mb-1 text-xs font-normal text-muted-foreground">
            {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
          </time>
          <h3 className="text-sm font-semibold text-foreground">
            {entry.action}
          </h3>
          <p className="text-xs text-muted-foreground">by {entry.actor}</p>
          {entry.detail && (
            <p className="mt-1 text-xs text-muted-foreground">{entry.detail}</p>
          )}
        </li>
      ))}
    </ol>
  )
}
