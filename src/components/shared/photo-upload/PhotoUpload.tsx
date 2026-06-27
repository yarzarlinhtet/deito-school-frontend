import { useState, useRef } from 'react'
import { Camera, Upload } from 'lucide-react'
import { cn } from '#/lib/utils'

interface PhotoUploadProps {
  value?: string
  onChange: (file: File) => void
  size?: number
  className?: string
}

export function PhotoUpload({
  value,
  onChange,
  size = 96,
  className,
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(value ?? null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file?.type.startsWith('image/')) handleFile(file)
  }

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{ width: size, height: size }}
        className={cn(
          'relative rounded-full border-2 border-dashed transition-colors overflow-hidden',
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-border bg-muted hover:border-primary/50 hover:bg-muted/80'
        )}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Photo preview"
              className="size-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="size-5 text-white" />
            </div>
          </>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1">
            <Upload className="size-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground text-center leading-tight px-2">
              Click to upload
            </span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <p className="text-xs text-muted-foreground text-center">
        JPG/PNG · min 200×200px
      </p>
    </div>
  )
}
