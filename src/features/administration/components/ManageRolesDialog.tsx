import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Badge } from '#/components/ui/badge'
import type { UserAdminResponse } from '#/generated/model'
import { useAvailableRoles, useUpdateUserRoles } from '../hooks/useUsers'

interface ManageRolesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserAdminResponse | null
}

export function ManageRolesDialog({ open, onOpenChange, user }: ManageRolesDialogProps) {
  const { data: availableRoles, isLoading } = useAvailableRoles()
  const updateRoles = useUpdateUserRoles()
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    if (open && user) {
      setSelectedIds((user.roles ?? []).map((r) => r.id ?? '').filter(Boolean))
    }
  }, [open, user])

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleSave() {
    if (!user?.id) return
    updateRoles.mutate(
      { userId: user.id, req: { roleIds: selectedIds } },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Roles</DialogTitle>
          <DialogDescription>
            {user?.fullName ? `Assign roles for ${user.fullName}.` : 'Assign roles for this user.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-md border bg-muted/50" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border divide-y max-h-72 overflow-y-auto">
              {(availableRoles ?? []).map((role) => {
                const selected = selectedIds.includes(role.id ?? '')
                return (
                  <div
                    key={role.id}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 cursor-pointer"
                    onClick={() => toggle(role.id ?? '')}
                  >
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggle(role.id ?? '')}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{role.name}</p>
                      {role.description && (
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {selectedIds.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {selectedIds.map((id) => {
                const role = (availableRoles ?? []).find((r) => r.id === id)
                return role ? (
                  <Badge key={id} variant="secondary" className="text-xs">
                    {role.name}
                  </Badge>
                ) : null
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updateRoles.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateRoles.isPending}>
            {updateRoles.isPending ? 'Saving…' : 'Save Roles'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
