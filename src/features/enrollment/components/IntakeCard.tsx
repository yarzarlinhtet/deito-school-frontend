import { Layers, Hash } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { StatusBadge } from '#/components/shared/status-badge'
import type { IntakeResponse } from '#/generated/model'

interface IntakeCardProps {
  intake: IntakeResponse
  academicYearName?: string
  onEdit: (intake: IntakeResponse) => void
  onViewBatches: () => void
}

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function intakeStatusKey(status?: string): string {
  switch (status) {
    case 'ACTIVE': return 'active'
    case 'UPCOMING': return 'pending'
    case 'CLOSED': return 'inactive'
    default: return 'inactive'
  }
}

export function IntakeCard({ intake, academicYearName, onEdit, onViewBatches }: IntakeCardProps) {
  return (
    <div className="flex flex-col rounded-lg border bg-background shadow-xs hover:shadow-sm transition-shadow overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b p-4">
        <div className="min-w-0">
          {academicYearName && (
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {academicYearName}
            </p>
          )}
          <p className="truncate text-base font-extrabold tracking-tight">{intake.name ?? '—'}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDate(intake.startDate)} — {formatDate(intake.endDate)}
          </p>
        </div>
        <StatusBadge status={intakeStatusKey(intake.status)} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          {intake.totalCapacity != null && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Layers className="size-3.5 shrink-0" />
              <span>
                Capacity: <span className="font-medium text-foreground">{intake.totalCapacity.toLocaleString()}</span>
              </span>
            </div>
          )}
          {intake.code && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Hash className="size-3.5 shrink-0" />
              <span className="font-mono text-xs">{intake.code}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-t p-3">
        <Button variant="ghost" size="sm" className="flex-1" onClick={onViewBatches}>
          View Batches
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(intake)}>
          Edit
        </Button>
      </div>
    </div>
  )
}
