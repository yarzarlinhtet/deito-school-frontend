import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { useProgramLevelsByProgram } from '#/features/academic/hooks/useProgramLevels'

interface ProgramLevelSelectorProps {
  value: string
  onValueChange: (value: string) => void
  programId?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ProgramLevelSelector({
  value,
  onValueChange,
  programId,
  placeholder = 'Select program level...',
  disabled,
  className,
}: ProgramLevelSelectorProps) {
  const { data: levels, isLoading } = useProgramLevelsByProgram(programId ?? null)

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || !programId || isLoading}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={isLoading ? 'Loading...' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {(levels ?? []).map((level) => (
          <SelectItem key={level.id} value={level.id!}>
            {level.name ?? level.id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
