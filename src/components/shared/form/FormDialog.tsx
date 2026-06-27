import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  onSubmit?: () => void
  onCancel?: () => void
  isSubmitting?: boolean
  submitLabel?: string
  className?: string
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = 'Save',
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="py-2">{children}</div>
        <DialogFooter>
          {footer ?? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  onCancel?.()
                  onOpenChange(false)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={onSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : submitLabel}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
