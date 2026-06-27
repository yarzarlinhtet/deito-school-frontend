import type { ReactNode } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '#/components/ui/drawer'
import { Button } from '#/components/ui/button'

interface FormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  onSubmit?: () => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function FormDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  onSubmit,
  isSubmitting,
  submitLabel = 'Save',
}: FormDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="right-0 top-0 mt-0 h-screen w-[420px] rounded-none flex flex-col">
        <DrawerHeader className="border-b shrink-0">
          <DrawerTitle>{title}</DrawerTitle>
          {description && (
            <DrawerDescription>{description}</DrawerDescription>
          )}
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        <DrawerFooter className="border-t shrink-0">
          {footer ?? (
            <>
              <Button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Saving...' : submitLabel}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="w-full"
              >
                Cancel
              </Button>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
