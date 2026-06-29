import { useQuery } from '@tanstack/react-query'
import { batchControllerListClasses } from '#/generated/batch-controller/batch-controller'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

interface ClassSelectorProps {
  value: string
  onValueChange: (value: string) => void
  batchId?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ClassSelector({
  value,
  onValueChange,
  batchId,
  placeholder = 'Select class...',
  disabled,
  className,
}: ClassSelectorProps) {
  const { data: classes, isLoading } = useQuery({
    queryKey: ['batch-classes', batchId],
    queryFn: () => batchControllerListClasses(batchId!),
    enabled: !!batchId,
  })

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || !batchId || isLoading}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={isLoading ? 'Loading...' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {(classes ?? []).map((c) => (
          <SelectItem key={c.id} value={c.id!}>
            {c.name ?? c.id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
