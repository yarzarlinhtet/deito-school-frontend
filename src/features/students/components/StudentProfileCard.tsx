import { UserX, Pencil } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import { StatusBadge } from '#/components/shared/status-badge'
import { PermissionGuard } from '#/components/shared/permission-guard'
import { PERMISSIONS } from '#/constants/permissions'
import type { Student } from '../types'

const STATUS_MAP: Record<Student['status'], string> = {
  active: 'active',
  enrolled: 'pending',
  inactive: 'inactive',
  suspended: 'suspended',
  graduated: 'completed',
}

interface StudentProfileCardProps {
  student: Student
  onEdit?: () => void
  onDeactivate?: () => void
}

export function StudentProfileCard({
  student,
  onEdit,
  onDeactivate,
}: StudentProfileCardProps) {
  const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase()

  return (
    <div className="flex flex-col gap-4">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center gap-3 py-2">
        <Avatar className="size-20">
          <AvatarImage src={student.avatarUrl} />
          <AvatarFallback className="text-xl font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-lg font-semibold">{student.fullName}</h2>
          <p className="text-sm text-muted-foreground">{student.studentId}</p>
          <div className="mt-2">
            <StatusBadge
              status={STATUS_MAP[student.status]}
              label={student.status.charAt(0).toUpperCase() + student.status.slice(1)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Meta info */}
      <dl className="grid gap-2 text-sm">
        {student.academicYearName && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Academic Year</dt>
            <dd className="font-medium text-right">{student.academicYearName}</dd>
          </div>
        )}
        {student.majorName && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Major</dt>
            <dd className="font-medium text-right">{student.majorName}</dd>
          </div>
        )}
        {student.className && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Class</dt>
            <dd>
              <Badge variant="outline" className="text-xs">{student.className}</Badge>
            </dd>
          </div>
        )}
        {student.admissionType && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Admission</dt>
            <dd className="font-medium capitalize text-right">{student.admissionType}</dd>
          </div>
        )}
        {student.email && (
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium text-xs break-all">{student.email}</dd>
          </div>
        )}
        {student.phone && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="font-medium">{student.phone}</dd>
          </div>
        )}
        {student.nationality && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Nationality</dt>
            <dd className="font-medium">{student.nationality}</dd>
          </div>
        )}
      </dl>

      <Separator />

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <PermissionGuard permission={PERMISSIONS.STUDENT.PROFILE.UPDATE}>
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={onEdit}>
            <Pencil className="size-3.5" />
            Edit Profile
          </Button>
        </PermissionGuard>
        {student.status === 'active' && (
          <PermissionGuard permission={PERMISSIONS.STUDENT.PROFILE.UPDATE}>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-warning border-warning/30 hover:bg-warning/10"
              onClick={onDeactivate}
            >
              <UserX className="size-3.5" />
              Deactivate
            </Button>
          </PermissionGuard>
        )}
      </div>
    </div>
  )
}
