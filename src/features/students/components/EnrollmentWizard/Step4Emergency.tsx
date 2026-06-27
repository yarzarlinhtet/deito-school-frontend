import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Separator } from '#/components/ui/separator'
import type { Step4Data } from '../../hooks/useEnrollWizard'

const contactSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(1, 'Phone is required'),
  altPhone: z.string(),
  email: z.string(),
  bestTimeToCall: z.string(),
})

const schema = z.object({
  primary: contactSchema,
  secondary: contactSchema.partial(),
})

interface Step4EmergencyProps {
  defaultValues?: Partial<Step4Data>
  onSubmit: (data: Step4Data) => void
  formRef: React.RefObject<{ submit: () => void } | null>
}

export function Step4Emergency({ defaultValues, onSubmit, formRef }: Step4EmergencyProps) {
  const empty = { id: crypto.randomUUID(), name: '', relationship: '', phone: '', altPhone: '', email: '', bestTimeToCall: '' }

  const form = useForm({
    defaultValues: {
      primary: defaultValues?.primary ?? empty,
      secondary: defaultValues?.secondary ?? { id: crypto.randomUUID(), name: '', relationship: '', phone: '', altPhone: '', email: '', bestTimeToCall: '' },
    },
    validators: { onSubmit: schema },
    onSubmit: ({ value }) => onSubmit(value as Step4Data),
  })

  if (formRef) {
    (formRef as React.MutableRefObject<{ submit: () => void } | null>).current = {
      submit: () => form.handleSubmit(),
    }
  }

  const FIELDS = [
    { name: 'name', label: 'Full Name', required: true },
    { name: 'relationship', label: 'Relationship', required: true },
    { name: 'phone', label: 'Primary Phone', required: true, type: 'tel' },
    { name: 'altPhone', label: 'Alternative Phone', type: 'tel' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'bestTimeToCall', label: 'Best Time to Call' },
  ] as const

  function ContactSection({ prefix, title }: { prefix: 'primary' | 'secondary'; title: string }) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <form.Field key={f.name} name={`${prefix}.${f.name}`}>
              {(field: any) => (
                <div className="grid gap-1.5">
                  <Label>
                    {f.label}
                    {'required' in f && f.required && prefix === 'primary' && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    type={(f as any).type ?? 'text'}
                    value={field.state.value ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors[0] && (
                    <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Emergency Contacts</h2>
        <p className="text-sm text-muted-foreground">People to contact in case of emergency</p>
      </div>

      <ContactSection prefix="primary" title="Primary Contact" />
      <Separator />
      <ContactSection prefix="secondary" title="Secondary Contact (Optional)" />
    </div>
  )
}
