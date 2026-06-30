import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import type { UserAdminResponse } from '#/generated/model'
import { useLockUser } from '../hooks/useUsers'

interface LockUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserAdminResponse | null
}

export function LockUserDialog({ open, onOpenChange, user }: LockUserDialogProps) {
  const lockUser = useLockUser()
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      setReason('')
      setError('')
    }
  }, [open])

  function handleConfirm() {
    if (!reason.trim()) {
      setError('A reason is required to lock the account')
      return
    }
    if (!user?.id) return
    lockUser.mutate(
      { userId: user.id, req: { reason: reason.trim() } },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            Lock User Account
          </DialogTitle>
          <DialogDescription>
            {user?.fullName
              ? `Lock ${user.fullName}'s account. They will not be able to log in until unlocked.`
              : 'Lock this account. The user will not be able to log in until unlocked.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="grid gap-1.5">
            <Label>
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (e.target.value.trim()) setError('')
              }}
              placeholder="Describe the reason for locking this account…"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={lockUser.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={lockUser.isPending}>
            {lockUser.isPending ? 'Locking…' : 'Lock Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
