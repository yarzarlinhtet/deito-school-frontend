import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import type { StudentDetailResponse } from '#/generated/model'

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="grid grid-cols-2 gap-2 py-1.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium break-words">{value}</dd>
    </div>
  )
}

interface StudentProfileTabProps {
  student: StudentDetailResponse
}

export function StudentProfileTab({ student }: StudentProfileTabProps) {
  const genderLabel = student.gender
    ? student.gender.charAt(0) + student.gender.slice(1).toLowerCase()
    : undefined

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Card 1: Personal Information */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
              <InfoRow label="Full Name" value={student.fullName} />
              <InfoRow label="Date of Birth" value={student.dateOfBirth} />
              <InfoRow label="Gender" value={genderLabel} />
              <InfoRow label="Nationality" value={student.nationality} />
              <InfoRow label="Place of Birth" value={student.placeOfBirth} />
              <InfoRow label="Religion" value={student.religion} />
              <InfoRow label="Passport Number" value={student.passportNumber} />
              <InfoRow label="Passport Expiry" value={student.passportExpiryDate} />
            </dl>
          </CardContent>
        </Card>

        {/* Card 2: Parent / Guardian */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Parent / Guardian</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
              <InfoRow label="Father Name" value={student.fatherName} />
              <InfoRow label="Mother Name" value={student.motherName} />
            </dl>
            {!student.fatherName && !student.motherName && (
              <p className="text-sm text-muted-foreground py-2">No guardian information on file.</p>
            )}
          </CardContent>
        </Card>

        {/* Card 3: Contact Information */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
              <InfoRow label="Email" value={student.email} />
              <InfoRow label="Telephone" value={student.telephoneNumber} />
              <InfoRow label="Current Address" value={student.currentResidentialAddress} />
              <InfoRow label="Permanent Address" value={student.permanentResidentialAddress} />
            </dl>
          </CardContent>
        </Card>

        {/* Card 4: Emergency Contact */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
              <InfoRow label="Contact Name" value={student.emergencyContactName} />
              <InfoRow label="Relationship" value={student.emergencyContactRelationship} />
              <InfoRow label="Phone" value={student.emergencyContactPhone} />
            </dl>
            {!student.emergencyContactName && (
              <p className="text-sm text-muted-foreground py-2">No emergency contact on file.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Optional extra cards */}
      {student.educationBackground && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Education Background</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{student.educationBackground}</p>
          </CardContent>
        </Card>
      )}

      {student.remarks && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{student.remarks}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
