import { AuditTimeline, type AuditEntry } from '#/components/shared/audit-timeline/AuditTimeline'
import type { StudentDetailResponse } from '#/generated/model'

interface StudentAuditTabProps {
  student: StudentDetailResponse
}

export function StudentAuditTab({ student }: StudentAuditTabProps) {
  const entries: AuditEntry[] = []

  if (student.updatedAt && student.updatedAt !== student.createdAt) {
    entries.push({
      id: 'updated',
      action: 'Profile Last Updated',
      actor: 'System',
      timestamp: student.updatedAt,
    })
  }

  if (student.createdAt) {
    entries.push({
      id: 'created',
      action: 'Student Profile Created',
      actor: 'System',
      timestamp: student.createdAt,
      detail: student.studentNo ? `Student number: ${student.studentNo}` : undefined,
    })
  }

  if (!entries.length) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">No audit history available.</p>
    )
  }

  return (
    <div className="max-w-xl">
      <AuditTimeline entries={entries} />
    </div>
  )
}
