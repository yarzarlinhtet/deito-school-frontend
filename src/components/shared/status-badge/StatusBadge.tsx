import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'

type StatusVariant =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'suspended'
  | 'completed'
  | 'failed'
  | string

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-success/10 text-success border-success/20',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-muted text-muted-foreground border-border',
  },
  pending: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  suspended: {
    label: 'Suspended',
    className: 'bg-error/10 text-error border-error/20',
  },
  completed: {
    label: 'Completed',
    className: 'bg-info/10 text-info border-info/20',
  },
  failed: {
    label: 'Failed',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
}

interface StatusBadgeProps {
  status: StatusVariant
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    className: 'bg-muted text-muted-foreground',
  }
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium capitalize', config.className, className)}
    >
      {label ?? config.label}
    </Badge>
  )
}
