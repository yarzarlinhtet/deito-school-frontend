import { Search, X } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

export interface StudentFilterValues {
  studentNo: string
  fullName: string
  passportNumber: string
  telephoneNumber: string
  nationality: string
  gender: string
  status: string
}

const EMPTY: StudentFilterValues = {
  studentNo: '',
  fullName: '',
  passportNumber: '',
  telephoneNumber: '',
  nationality: '',
  gender: 'all',
  status: 'all',
}

interface StudentFiltersProps {
  values: StudentFilterValues
  onChange: (values: StudentFilterValues) => void
  onApply: () => void
  onReset: () => void
}

export function StudentFilters({ values, onChange, onApply, onReset }: StudentFiltersProps) {
  const set = (key: keyof StudentFilterValues) => (val: string) =>
    onChange({ ...values, [key]: val })

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-9 text-sm"
            placeholder="Student number…"
            value={values.studentNo}
            onChange={(e) => set('studentNo')(e.target.value)}
          />
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-9 text-sm"
            placeholder="Full name…"
            value={values.fullName}
            onChange={(e) => set('fullName')(e.target.value)}
          />
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-9 text-sm"
            placeholder="Passport number…"
            value={values.passportNumber}
            onChange={(e) => set('passportNumber')(e.target.value)}
          />
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-9 text-sm"
            placeholder="Telephone…"
            value={values.telephoneNumber}
            onChange={(e) => set('telephoneNumber')(e.target.value)}
          />
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-9 text-sm"
            placeholder="Nationality…"
            value={values.nationality}
            onChange={(e) => set('nationality')(e.target.value)}
          />
        </div>
        <Select value={values.gender} onValueChange={set('gender')}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="MALE">Male</SelectItem>
            <SelectItem value="FEMALE">Female</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={values.status} onValueChange={set('status')}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="GRADUATED">Graduated</SelectItem>
            <SelectItem value="TRANSFERRED">Transferred</SelectItem>
            <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button size="sm" className="h-9 flex-1" onClick={onApply}>
            Apply
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 px-3"
            onClick={() => { onChange(EMPTY); onReset() }}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
