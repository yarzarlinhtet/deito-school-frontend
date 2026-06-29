import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

interface LookupItem {
  id?: string
  name?: string | null
}

interface LookupSelectProps {
  value: string
  onValueChange: (value: string) => void
  items: LookupItem[] | undefined
  isLoading?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Render extra SelectItems before the lookup list (e.g. a "None" option) */
  extraItems?: React.ReactNode
}

export function LookupSelect({
  value,
  onValueChange,
  items,
  isLoading,
  placeholder,
  disabled,
  className,
  extraItems,
}: LookupSelectProps) {
  if (isLoading) {
    return <div className="h-9 animate-pulse rounded-md border bg-muted/50" />
  }
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder ?? 'Select...'} />
      </SelectTrigger>
      <SelectContent>
        {extraItems}
        {(items ?? []).map((item) => (
          <SelectItem key={item.id} value={item.id!}>
            {item.name ?? item.id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
