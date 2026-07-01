import { Search, X } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import type { UserFilterValues } from '../types'

interface UserFiltersProps {
  values: UserFilterValues
  onChange: (values: UserFilterValues) => void
  onApply: () => void
  onReset: () => void
}

export function UserFilters({ values, onChange, onApply, onReset }: UserFiltersProps) {
  const set = (key: keyof UserFilterValues) => (val: string) =>
    onChange({ ...values, [key]: val })

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-9 text-sm"
            placeholder="Search name, email, username…"
            value={values.search}
            onChange={(e) => set('search')(e.target.value)}
          />
        </div>

        {/* <Select value={values.status} onValueChange={set('status')}>
          <SelectTrigger className="h-9 text-sm w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Select value={values.roleId} onValueChange={set('roleId')} disabled={isLoadingRoles}>
          <SelectTrigger className="h-9 text-sm w-[140px]">
            <SelectValue placeholder={isLoadingRoles ? 'Loading…' : 'All Roles'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {(roles ?? []).map((r) => (
              <SelectItem key={r.id} value={r.id!}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}

        <div className="flex gap-2 ml-auto">
          <Button size="sm" className="h-9" onClick={onApply}>
            Apply
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 px-3"
            onClick={onReset}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
