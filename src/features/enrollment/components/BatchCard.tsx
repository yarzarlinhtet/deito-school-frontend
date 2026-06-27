import { Hash } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { StatusBadge } from '#/components/shared/status-badge'
import type { BatchResponse } from '#/generated/model'

interface BatchCardProps {
  batch: BatchResponse
  intakeName?: string
  onEdit: (batch: BatchResponse) => void
}

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function batchStatusKey(status?: string): string {
  switch (status) {
    case 'ACTIVE': return 'active'
    case 'UPCOMING': return 'pending'
    case 'CLOSED': return 'inactive'
    default: return 'inactive'
  }
}

export function BatchCard({ batch, intakeName, onEdit }: BatchCardProps) {
  return (
    <div className="flex flex-col rounded-lg border bg-background shadow-xs hover:shadow-sm transition-shadow overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b p-4">
        <div className="min-w-0">
          {intakeName && (
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {intakeName}
            </p>
          )}
          <p className="truncate text-base font-extrabold tracking-tight">{batch.name ?? '—'}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDate(batch.startDate)} — {formatDate(batch.endDate)}
          </p>
        </div>
        <StatusBadge status={batchStatusKey(batch.status)} />
      </div>

      <div className="flex flex-1 items-center gap-4 p-4">
        {batch.code && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Hash className="size-3.5 shrink-0" />
            <span className="font-mono text-xs">{batch.code}</span>
          </div>
        )}
      </div>

      <div className="flex justify-end border-t p-3">
        <Button variant="outline" size="sm" onClick={() => onEdit(batch)}>
          Edit
        </Button>
      </div>
    </div>
  )
}
