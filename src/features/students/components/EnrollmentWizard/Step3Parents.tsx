import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Separator } from '#/components/ui/separator'
import type { Step3Data } from '../../hooks/useEnrollWizard'

const guardianSchema = z.object({
  fullName: z.string(),
  nrc: z.string(),
  occupation: z.string(),
  employer: z.string(),
  phone: z.string(),
  email: z.string(),
})

const schema = z.object({
  father: guardianSchema,
  mother: guardianSchema,
})

function GuardianFields({ prefix, label, form }: { prefix: 'father' | 'mother'; label: string; form: any }) {
  const fields = ['fullName', 'nrc', 'occupation', 'employer', 'phone', 'email'] as const
  const labels: Record<string, string> = {
    fullName: 'Full Name',
    nrc: 'NRC Number',
    occupation: 'Occupation',
    employer: 'Employer',
    phone: 'Phone Number',
    email: 'Email Address',
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{label}</h3>
      <div className="grid grid-cols-2 gap-4">
        {fields.map((fieldName) => (
          <form.Field key={fieldName} name={`${prefix}.${fieldName}`}>
            {(field: any) => (
              <div className="grid gap-1.5">
                <Label>{labels[fieldName]}</Label>
                <Input
                  type={fieldName === 'email' ? 'email' : fieldName === 'phone' ? 'tel' : 'text'}
                  value={field.state.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
        ))}
      </div>
    </div>
  )
}

interface Step3ParentsProps {
  defaultValues?: Partial<Step3Data>
  onSubmit: (data: Step3Data) => void
  formRef: React.RefObject<{ submit: () => void } | null>
}

export function Step3Parents({ defaultValues, onSubmit, formRef }: Step3ParentsProps) {
  const emptyGuardian = { fullName: '', nrc: '', occupation: '', employer: '', phone: '', email: '' }

  const form = useForm({
    defaultValues: {
      father: defaultValues?.father ?? emptyGuardian,
      mother: defaultValues?.mother ?? emptyGuardian,
    },
    validators: { onSubmit: schema },
    onSubmit: ({ value }) => onSubmit(value as Step3Data),
  })

  if (formRef) {
    (formRef as React.MutableRefObject<{ submit: () => void } | null>).current = {
      submit: () => form.handleSubmit(),
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Parent & Guardian</h2>
        <p className="text-sm text-muted-foreground">Father and mother information</p>
      </div>

      <GuardianFields prefix="father" label="Father" form={form} />
      <Separator />
      <GuardianFields prefix="mother" label="Mother" form={form} />
    </div>
  )
}
