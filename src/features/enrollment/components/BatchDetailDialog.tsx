import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { StatusBadge } from '#/components/shared/status-badge'
import { getById5 } from '#/generated/batch-controller/batch-controller'

interface BatchDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  batchId: string | null
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

export function BatchDetailDialog({
  open,
  onOpenChange,
  batchId,
}: BatchDetailDialogProps) {
  const { data: batch } = useQuery({
    queryKey: ['batch-detail', batchId],
    queryFn: ({ signal }) => getById5(batchId!, signal),
    enabled: open && !!batchId,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{batch?.name ?? '—'}</DialogTitle>
        </DialogHeader>

        {batch && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Code</dt>
              <dd className="font-medium mt-0.5">{batch.code ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="mt-0.5">
                <StatusBadge status={batchStatusKey(batch.status)} />
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Intake</dt>
              <dd className="font-medium mt-0.5">{batch.intake?.name ?? '—'}</dd>
            </div>
            <div className="col-span-2 border-t pt-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <dt className="text-muted-foreground">Start Date</dt>
                  <dd className="font-medium mt-0.5">{formatDate(batch.startDate)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">End Date</dt>
                  <dd className="font-medium mt-0.5">{formatDate(batch.endDate)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="font-medium mt-0.5">{formatDate(batch.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Last Updated</dt>
                  <dd className="font-medium mt-0.5">{formatDate(batch.updatedAt)}</dd>
                </div>
              </div>
            </div>
          </dl>
        )}
      </DialogContent>
    </Dialog>
  )
}
