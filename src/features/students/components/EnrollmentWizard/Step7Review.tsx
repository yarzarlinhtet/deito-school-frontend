import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import type { WizardState } from '../../hooks/useEnrollWizard'

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">{children}</dl>
      </CardContent>
    </Card>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="grid grid-cols-2 gap-2 py-1.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}

interface Step7ReviewProps {
  state: WizardState
}

export function Step7Review({ state }: Step7ReviewProps) {
  const s1 = state.step1
  const s2 = state.step2
  const s3 = state.step3
  const s4 = state.step4
  const s5 = state.step5

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Review & Submit</h2>
        <p className="text-sm text-muted-foreground">Please verify all information before submitting</p>
      </div>

      {s1 && (
        <ReviewSection title="Personal Information">
          <Field label="Full Name" value={`${s1.firstName} ${s1.lastName}`} />
          <Field label="Date of Birth" value={s1.dateOfBirth} />
          <Field label="Gender" value={s1.gender ? s1.gender.charAt(0).toUpperCase() + s1.gender.slice(1) : undefined} />
          <Field label="Nationality" value={s1.nationality} />
          <Field label="NRC" value={s1.nrc} />
          <Field label="Passport" value={s1.passportNumber} />
        </ReviewSection>
      )}

      {s2 && (
        <ReviewSection title="Contact Information">
          <Field label="Email" value={s2.studentEmail} />
          <Field label="Phone" value={s2.studentPhone} />
          <Field label="City" value={s2.residentialAddress?.city} />
          <Field label="Country" value={s2.residentialAddress?.country} />
        </ReviewSection>
      )}

      {s3 && (
        <ReviewSection title="Parents & Guardian">
          <Field label="Father" value={s3.father?.fullName} />
          <Field label="Father Phone" value={s3.father?.phone} />
          <Field label="Mother" value={s3.mother?.fullName} />
          <Field label="Mother Phone" value={s3.mother?.phone} />
        </ReviewSection>
      )}

      {s4 && (
        <ReviewSection title="Emergency Contact">
          <Field label="Primary Contact" value={s4.primary?.name} />
          <Field label="Relationship" value={s4.primary?.relationship} />
          <Field label="Phone" value={s4.primary?.phone} />
        </ReviewSection>
      )}

      {s5 && (
        <ReviewSection title="Academic Information">
          <Field label="Admission Date" value={s5.admissionDate} />
          <div className="grid grid-cols-2 gap-2 py-1.5">
            <dt className="text-sm text-muted-foreground">Admission Type</dt>
            <dd>
              <Badge variant="secondary" className="capitalize">{s5.admissionType}</Badge>
            </dd>
          </div>
        </ReviewSection>
      )}

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm text-primary font-medium">
          By submitting, you confirm that all information provided is accurate and complete.
        </p>
      </div>
    </div>
  )
}
