import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { StatusBadge } from '#/components/shared/status-badge'
import type { IntakeResponse } from '#/generated/model'

interface IntakeDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  intake: IntakeResponse | null
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

export function IntakeDetailDialog({
  open,
  onOpenChange,
  intake,
}: IntakeDetailDialogProps) {
  if (!intake) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{intake.name ?? '—'}</DialogTitle>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Code</dt>
            <dd className="font-medium mt-0.5">{intake.code ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="mt-0.5">
              <StatusBadge status={intakeStatusKey(intake.status)} />
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Start Date</dt>
            <dd className="font-medium mt-0.5">{formatDate(intake.startDate)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">End Date</dt>
            <dd className="font-medium mt-0.5">{formatDate(intake.endDate)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Total Capacity</dt>
            <dd className="font-medium mt-0.5">
              {intake.totalCapacity != null ? intake.totalCapacity.toLocaleString() : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Created</dt>
            <dd className="font-medium mt-0.5">{formatDate(intake.createdAt)}</dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  )
}
