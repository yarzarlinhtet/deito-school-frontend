import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { PhotoUpload } from '#/components/shared/photo-upload'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { RadioGroup, RadioGroupItem } from '#/components/ui/radio-group'
import { Textarea } from '#/components/ui/textarea'
import { Separator } from '#/components/ui/separator'
import type { Step1Data } from '../../hooks/useEnrollWizard'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  nationality: z.string(),
  religion: z.string(),
  nrc: z.string(),
  passportNumber: z.string(),
  countryOfBirth: z.string(),
  medicalNotes: z.string(),
})

interface Step1PersonalProps {
  defaultValues?: Partial<Step1Data>
  onSubmit: (data: Step1Data) => void
  formRef: React.RefObject<{ submit: () => void } | null>
}

export function Step1Personal({ defaultValues, onSubmit, formRef }: Step1PersonalProps) {
  const form = useForm({
    defaultValues: {
      firstName: defaultValues?.firstName ?? '',
      lastName: defaultValues?.lastName ?? '',
      dateOfBirth: defaultValues?.dateOfBirth ?? '',
      gender: (defaultValues?.gender ?? 'male') as 'male' | 'female' | 'other',
      nationality: defaultValues?.nationality ?? '',
      religion: defaultValues?.religion ?? '',
      nrc: defaultValues?.nrc ?? '',
      passportNumber: defaultValues?.passportNumber ?? '',
      countryOfBirth: defaultValues?.countryOfBirth ?? '',
      medicalNotes: defaultValues?.medicalNotes ?? '',
    },
    validators: { onSubmit: schema },
    onSubmit: ({ value }) => {
      onSubmit({ ...value, photoFile: defaultValues?.photoFile })
    },
  })

  // Expose submit to parent via ref
  if (formRef) {
    (formRef as React.MutableRefObject<{ submit: () => void } | null>).current = {
      submit: () => form.handleSubmit(),
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Personal Information</h2>
        <p className="text-sm text-muted-foreground">Student's basic personal details</p>
      </div>

      {/* Photo */}
      <div className="flex justify-center">
        <PhotoUpload
          value={defaultValues?.photoFile ? URL.createObjectURL(defaultValues.photoFile) : undefined}
          onChange={(file) => onSubmit({ ...form.state.values, gender: form.state.values.gender as Step1Data['gender'], photoFile: file })}
          size={96}
        />
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="firstName">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>First Name <span className="text-destructive">*</span></Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="John"
              />
              {field.state.meta.errors[0] && (
                <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="lastName">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Last Name <span className="text-destructive">*</span></Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Doe"
              />
              {field.state.meta.errors[0] && (
                <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="dateOfBirth">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Date of Birth <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors[0] && (
                <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="gender">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Gender</Label>
              <RadioGroup
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as 'male' | 'female' | 'other')}
                className="flex gap-3 pt-1"
              >
                {['male', 'female', 'other'].map((g) => (
                  <div key={g} className="flex items-center gap-1.5">
                    <RadioGroupItem value={g} id={`gender-${g}`} />
                    <Label htmlFor={`gender-${g}`} className="font-normal capitalize cursor-pointer">{g}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="nationality">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Nationality</Label>
              <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g. Myanmar" />
            </div>
          )}
        </form.Field>

        <form.Field name="religion">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Religion</Label>
              <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g. Buddhism" />
            </div>
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="nrc">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>NRC Number</Label>
              <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g. 12/OUKAMA(N)123456" />
            </div>
          )}
        </form.Field>

        <form.Field name="passportNumber">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Passport Number</Label>
              <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g. MM1234567" />
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="countryOfBirth">
        {(field) => (
          <div className="grid gap-1.5">
            <Label>Country of Birth</Label>
            <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g. Myanmar" />
          </div>
        )}
      </form.Field>

      <form.Field name="medicalNotes">
        {(field) => (
          <div className="grid gap-1.5">
            <Label>Medical Notes</Label>
            <Textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Allergies, conditions, or special medical requirements..."
              rows={3}
            />
          </div>
        )}
      </form.Field>
    </div>
  )
}
