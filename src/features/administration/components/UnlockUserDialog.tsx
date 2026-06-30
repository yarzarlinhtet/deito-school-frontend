import { Unlock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import type { UserAdminResponse } from '#/generated/model'
import { useUnlockUser } from '../hooks/useUsers'

interface UnlockUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserAdminResponse | null
}

export function UnlockUserDialog({ open, onOpenChange, user }: UnlockUserDialogProps) {
  const unlockUser = useUnlockUser()

  function handleConfirm() {
    if (!user?.id) return
    unlockUser.mutate(
      { userId: user.id },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Unlock className="size-5" />
            Unlock User Account
          </DialogTitle>
          <DialogDescription>
            {user?.fullName
              ? `Restore login access for ${user.fullName}. They will be able to log in again immediately.`
              : 'Restore login access for this user.'}
          </DialogDescription>
        </DialogHeader>

        {user?.lockReason && (
          <div className="rounded-md border bg-muted/40 p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Lock Reason</p>
            <p className="text-sm">{user.lockReason}</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={unlockUser.isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={unlockUser.isPending}>
            {unlockUser.isPending ? 'Unlocking…' : 'Unlock Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
