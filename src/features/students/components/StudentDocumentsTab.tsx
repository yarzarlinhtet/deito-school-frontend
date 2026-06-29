import { FileText } from 'lucide-react'

export function StudentDocumentsTab() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center rounded-lg border border-dashed">
      <FileText className="size-10 text-muted-foreground/40" />
      <div>
        <p className="text-sm font-medium text-muted-foreground">Document management coming soon</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Document uploads will be available in a future update.
        </p>
      </div>
    </div>
  )
}
