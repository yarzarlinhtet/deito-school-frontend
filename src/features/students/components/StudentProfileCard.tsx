import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import { Separator } from '#/components/ui/separator'
import { StatusBadge } from '#/components/shared/status-badge'
import type { StudentDetailResponse } from '#/generated/model'

const STATUS_MAP: Record<string, string> = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  NEW: 'pending',
  GRADUATED: 'completed',
  TRANSFERRED: 'info',
  WITHDRAWN: 'inactive',
}

function getInitials(fullName?: string | null) {
  if (!fullName) return '??'
  return fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

interface StudentProfileCardProps {
  student: StudentDetailResponse
}

export function StudentProfileCard({ student }: StudentProfileCardProps) {
  const status = student.status ?? 'NEW'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 py-2">
        <Avatar className="size-20">
          <AvatarFallback className="text-xl font-semibold">
            {getInitials(student.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-lg font-semibold">{student.fullName ?? '—'}</h2>
          <p className="text-sm text-muted-foreground font-mono">{student.studentNo}</p>
          <div className="mt-2">
            <StatusBadge
              status={STATUS_MAP[status] ?? 'inactive'}
              label={status.charAt(0) + status.slice(1).toLowerCase()}
            />
          </div>
        </div>
      </div>

      <Separator />

      <dl className="grid gap-2 text-sm">
        {student.nationality && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Nationality</dt>
            <dd className="font-medium">{student.nationality}</dd>
          </div>
        )}
        {student.gender && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Gender</dt>
            <dd className="font-medium capitalize">{student.gender.toLowerCase()}</dd>
          </div>
        )}
        {student.createdAt && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Registered</dt>
            <dd className="font-medium text-xs">{new Date(student.createdAt).toLocaleDateString()}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}
