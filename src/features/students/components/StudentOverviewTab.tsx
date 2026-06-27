import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'
import type { Student } from '../types'

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="grid grid-cols-2 gap-2 py-1.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}

interface StudentOverviewTabProps {
  student: Student
}

export function StudentOverviewTab({ student }: StudentOverviewTabProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Personal Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border">
            <InfoRow label="Full Name" value={student.fullName} />
            <InfoRow label="Date of Birth" value={student.dateOfBirth} />
            <InfoRow label="Gender" value={student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : undefined} />
            <InfoRow label="Nationality" value={student.nationality} />
            <InfoRow label="Religion" value={student.religion} />
            <InfoRow label="NRC" value={student.nrc} />
            <InfoRow label="Passport" value={student.passportNumber} />
            <InfoRow label="Country of Birth" value={student.countryOfBirth} />
          </dl>
          {student.medicalNotes && (
            <>
              <Separator className="my-3" />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Medical Notes</p>
                <p className="text-sm">{student.medicalNotes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Guardian */}
      {(student.father || student.mother) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Parent & Guardian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.father && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Father</p>
                <dl className="divide-y divide-border">
                  <InfoRow label="Full Name" value={student.father.fullName} />
                  <InfoRow label="NRC" value={student.father.nrc} />
                  <InfoRow label="Occupation" value={student.father.occupation} />
                  <InfoRow label="Employer" value={student.father.employer} />
                  <InfoRow label="Phone" value={student.father.phone} />
                  <InfoRow label="Email" value={student.father.email} />
                </dl>
              </div>
            )}
            {student.mother && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Mother</p>
                <dl className="divide-y divide-border">
                  <InfoRow label="Full Name" value={student.mother.fullName} />
                  <InfoRow label="NRC" value={student.mother.nrc} />
                  <InfoRow label="Occupation" value={student.mother.occupation} />
                  <InfoRow label="Phone" value={student.mother.phone} />
                  <InfoRow label="Email" value={student.mother.email} />
                </dl>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contact Info */}
      {student.residentialAddress && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Residential Address</p>
            <dl className="divide-y divide-border">
              <InfoRow label="Line 1" value={student.residentialAddress.line1} />
              <InfoRow label="Line 2" value={student.residentialAddress.line2} />
              <InfoRow label="Township" value={student.residentialAddress.township} />
              <InfoRow label="City" value={student.residentialAddress.city} />
              <InfoRow label="State / Region" value={student.residentialAddress.state} />
              <InfoRow label="Postal Code" value={student.residentialAddress.postalCode} />
              <InfoRow label="Country" value={student.residentialAddress.country} />
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contacts */}
      {student.emergencyContacts && student.emergencyContacts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Emergency Contacts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.emergencyContacts.map((ec, i) => (
              <div key={ec.id}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {i === 0 ? 'Primary' : 'Secondary'}
                </p>
                <dl className="divide-y divide-border">
                  <InfoRow label="Name" value={ec.name} />
                  <InfoRow label="Relationship" value={ec.relationship} />
                  <InfoRow label="Phone" value={ec.phone} />
                  <InfoRow label="Alt Phone" value={ec.altPhone} />
                  <InfoRow label="Email" value={ec.email} />
                  <InfoRow label="Best Time" value={ec.bestTimeToCall} />
                </dl>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
