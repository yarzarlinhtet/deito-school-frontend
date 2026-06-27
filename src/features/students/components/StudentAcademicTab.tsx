import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import type { Student } from '../types'

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-2 gap-2 py-1.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value || '—'}</dd>
    </div>
  )
}

interface StudentAcademicTabProps {
  student: Student
}

export function StudentAcademicTab({ student }: StudentAcademicTabProps) {
  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Enrollment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border">
            <Field label="Academic Year" value={student.academicYearName} />
            <Field label="Major / Program" value={student.majorName} />
            <div className="grid grid-cols-2 gap-2 py-1.5">
              <dt className="text-sm text-muted-foreground">Class</dt>
              <dd>
                {student.className ? (
                  <Badge variant="outline" className="text-xs">{student.className}</Badge>
                ) : <span className="text-sm font-medium">—</span>}
              </dd>
            </div>
            <Field label="Admission Date" value={student.admissionDate} />
            <div className="grid grid-cols-2 gap-2 py-1.5">
              <dt className="text-sm text-muted-foreground">Admission Type</dt>
              <dd>
                {student.admissionType ? (
                  <Badge variant="secondary" className="text-xs capitalize">{student.admissionType}</Badge>
                ) : <span className="text-sm font-medium">—</span>}
              </dd>
            </div>
            <Field label="Fee Category" value={student.feeCategoryName} />
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
