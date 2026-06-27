import { Upload, X, Check, FileText } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'

export type DocumentStatus = 'pending' | 'uploaded' | 'verified'

interface DocumentUploadItemProps {
  label: string
  required?: boolean
  hint?: string
  status: DocumentStatus
  fileName?: string
  fileSize?: string
  onUpload: (file: File) => void
  onRemove?: () => void
  className?: string
}

const STATUS_CONFIG: Record<DocumentStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-muted text-muted-foreground border-border' },
  uploaded: { label: 'Uploaded', className: 'bg-info/10 text-info border-info/20' },
  verified: { label: 'Verified', className: 'bg-success/10 text-success border-success/20' },
}

export function DocumentUploadItem({
  label,
  required = false,
  hint,
  status,
  fileName,
  fileSize,
  onUpload,
  onRemove,
  className,
}: DocumentUploadItemProps) {
  const config = STATUS_CONFIG[status]

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    e.target.value = ''
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border bg-card px-4 py-3',
        className
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <FileText className="size-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {required && (
            <span className="text-xs text-destructive font-medium">Required</span>
          )}
        </div>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
        {fileName && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {fileName}{fileSize && ` · ${fileSize}`}
          </p>
        )}
      </div>

      <Badge variant="outline" className={cn('text-xs shrink-0', config.className)}>
        {status === 'verified' ? <Check className="size-3 mr-1" /> : null}
        {config.label}
      </Badge>

      <div className="flex items-center gap-1 shrink-0">
        {status === 'pending' ? (
          <label className="cursor-pointer">
            <input type="file" className="hidden" onChange={handleFileChange} />
            <Button variant="outline" size="sm" asChild>
              <span className="gap-1.5">
                <Upload className="size-3.5" />
                Upload
              </span>
            </Button>
          </label>
        ) : (
          <>
            <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={handleFileChange} />
              <Button variant="ghost" size="sm" asChild>
                <span>Replace</span>
              </Button>
            </label>
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="size-8 text-muted-foreground hover:text-destructive"
              >
                <X className="size-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
