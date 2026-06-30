import { Loader2 } from 'lucide-react'
import { Button } from '#/components/ui/button'

interface SaveBarProps {
  roleName: string
  assignedCount: number
  totalCount: number
  isDirty: boolean
  isPending: boolean
  onSave: () => void
  onDiscard: () => void
}

export function SaveBar({
  roleName,
  assignedCount,
  totalCount,
  isDirty,
  isPending,
  onSave,
  onDiscard,
}: SaveBarProps) {
  return (
    <div className="sticky bottom-0 bg-background border-t border-border px-6 py-3 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-10">
      <p className="text-sm text-muted-foreground">
        Editing <strong className="text-foreground">{roleName}</strong>
        {' · '}
        <strong className="text-foreground">{assignedCount}</strong> of {totalCount} permissions granted
        {isDirty && (
          <span className="ml-2 text-amber-600 font-medium">· Unsaved changes</span>
        )}
      </p>
      <div className="flex gap-2.5">
        <Button variant="ghost" size="sm" onClick={onDiscard} disabled={isPending || !isDirty}>
          Discard Changes
        </Button>
        <Button size="sm" onClick={onSave} disabled={isPending || !isDirty}>
          {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
          Save Permissions
        </Button>
      </div>
    </div>
  )
}
