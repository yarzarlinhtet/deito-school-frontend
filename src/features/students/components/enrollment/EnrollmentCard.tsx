import { useState } from 'react'
import { MoreHorizontal, Pencil, ArrowRightLeft, GraduationCap, UserX } from 'lucide-react'
import { Card, CardContent, CardHeader } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { PermissionGuard } from '#/components/shared/permission-guard'
import { PERMISSIONS } from '#/constants/permissions'
import { EnrollmentDialog } from './EnrollmentDialog'
import { TransferDialog } from './TransferDialog'
import { GraduateDialog } from './GraduateDialog'
import { WithdrawDialog } from './WithdrawDialog'
import type { StudentEnrollmentResponse } from '#/generated/model'
import type { EnrollmentLookups } from './GraduateDialog'

function resolve(map: Record<string, string>, id?: string | null) {
  return id ? (map[id] ?? id) : '—'
}

function statusVariant(status?: string) {
  switch (status) {
    case 'ACTIVE': return 'default'
    case 'GRADUATED': return 'secondary'
    case 'WITHDRAWN': return 'destructive'
    case 'TRANSFERRED': return 'outline'
    case 'SUSPENDED': return 'destructive'
    case 'COMPLETED': return 'secondary'
    default: return 'outline'
  }
}

function enrollmentTypeLabel(type?: string) {
  if (type === 'SELF_ENROLL') return 'Self Enroll'
  if (type === 'AGENT') return 'Agent'
  return type ?? '—'
}

interface EnrollmentCardProps {
  enrollment: StudentEnrollmentResponse
  studentId: string
  lookups: EnrollmentLookups
}

export function EnrollmentCard({ enrollment, studentId, lookups }: EnrollmentCardProps) {
  const isActive = enrollment.status === 'ACTIVE'
  const [editOpen, setEditOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [graduateOpen, setGraduateOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground">Enrollment</span>
              <Badge variant={statusVariant(enrollment.status)}>
                {enrollment.status ?? 'Unknown'}
              </Badge>
            </div>

            {isActive && (
              <PermissionGuard permission={PERMISSIONS.STUDENT.ENROLLMENT.UPDATE}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                      <Pencil className="size-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTransferOpen(true)}>
                      <ArrowRightLeft className="size-4 mr-2" />
                      Transfer Program
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setGraduateOpen(true)}>
                      <GraduationCap className="size-4 mr-2" />
                      Graduate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setWithdrawOpen(true)}
                    >
                      <UserX className="size-4 mr-2" />
                      Withdraw
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </PermissionGuard>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 text-sm">
            <InfoRow label="Academic Year" value={resolve(lookups.academicYearMap, enrollment.academicYearId)} />
            <InfoRow label="Program" value={resolve(lookups.programMap, enrollment.programId)} />
            <InfoRow label="Program Level" value={resolve(lookups.programLevelMap, enrollment.programLevelId)} />
            <InfoRow label="Intake" value={resolve(lookups.intakeMap, enrollment.intakeId)} />
            <InfoRow label="Batch" value={resolve(lookups.batchMap, enrollment.batchId)} />
            <InfoRow label="Class" value={enrollment.classId ? resolve(lookups.classMap, enrollment.classId) : '—'} />
            <InfoRow label="Enrollment Type" value={enrollmentTypeLabel(enrollment.enrollmentType)} />
            <InfoRow
              label="Enrollment Date"
              value={enrollment.enrollmentDate ?? '—'}
            />
            <InfoRow
              label="Created Date"
              value={enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString() : '—'}
            />
          </div>
        </CardContent>
      </Card>

      <EnrollmentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        studentId={studentId}
        editTarget={enrollment}
        lookups={lookups}
      />
      <TransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        enrollment={enrollment}
        studentId={studentId}
        lookups={lookups}
      />
      <GraduateDialog
        open={graduateOpen}
        onOpenChange={setGraduateOpen}
        enrollment={enrollment}
        studentId={studentId}
        lookups={lookups}
      />
      <WithdrawDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        enrollment={enrollment}
        studentId={studentId}
      />
    </>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="font-medium truncate">{value}</p>
    </div>
  )
}
