import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { StatusBadge } from '#/components/shared/status-badge'
import type { AcademicYearResponse } from '#/generated/model'

interface AcademicYearDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  year: AcademicYearResponse | null
}

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function AcademicYearDetailDialog({
  open,
  onOpenChange,
  year,
}: AcademicYearDetailDialogProps) {
  if (!year) return null

  const statusKey = year.status === 'ACTIVE' ? 'active' : 'inactive'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{year.name ?? '—'}</DialogTitle>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Start Date</dt>
            <dd className="font-medium mt-0.5">{formatDate(year.startDate)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">End Date</dt>
            <dd className="font-medium mt-0.5">{formatDate(year.endDate)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="mt-0.5">
              <StatusBadge status={statusKey} />
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Current Year</dt>
            <dd className="font-medium mt-0.5">{year.isCurrentYear ? 'Yes' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Created</dt>
            <dd className="font-medium mt-0.5">{formatDate(year.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Last Updated</dt>
            <dd className="font-medium mt-0.5">{formatDate(year.updatedAt)}</dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  )
}
