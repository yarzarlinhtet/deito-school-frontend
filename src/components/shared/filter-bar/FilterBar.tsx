import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'
import { Search, RotateCcw } from 'lucide-react'

export interface FilterOption {
  value: string
  label: string
}

export interface FilterDef {
  key: string
  label: string
  type: 'text' | 'select' | 'date'
  placeholder?: string
  options?: FilterOption[]
}

interface FilterBarProps {
  filters: FilterDef[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  onApply: () => void
  onReset: () => void
  className?: string
}

export function FilterBar({
  filters,
  values,
  onChange,
  onApply,
  onReset,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4',
        className
      )}
    >
      {filters.map((filter) => (
        <div key={filter.key} className="flex flex-col gap-1.5 min-w-36">
          <Label className="text-xs text-muted-foreground">{filter.label}</Label>
          {filter.type === 'select' ? (
            <Select
              value={values[filter.key] ?? ''}
              onValueChange={(v) => onChange(filter.key, v)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder={filter.placeholder ?? `All ${filter.label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {filter.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : filter.type === 'date' ? (
            <Input
              type="date"
              value={values[filter.key] ?? ''}
              onChange={(e) => onChange(filter.key, e.target.value)}
              className="h-9 text-sm"
            />
          ) : (
            <Input
              type="text"
              value={values[filter.key] ?? ''}
              onChange={(e) => onChange(filter.key, e.target.value)}
              placeholder={filter.placeholder ?? `Search ${filter.label}...`}
              className="h-9 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && onApply()}
            />
          )}
        </div>
      ))}

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="outline" size="sm" onClick={onReset} className="gap-1.5">
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
        <Button size="sm" onClick={onApply} className="gap-1.5">
          <Search className="size-3.5" />
          Apply
        </Button>
      </div>
    </div>
  )
}
