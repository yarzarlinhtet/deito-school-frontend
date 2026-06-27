import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Separator } from '#/components/ui/separator'
import type { Step2Data } from '../../hooks/useEnrollWizard'

const addressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string(),
  township: z.string(),
  city: z.string().min(1, 'City is required'),
  state: z.string(),
  postalCode: z.string(),
  country: z.string().min(1, 'Country is required'),
})

const schema = z.object({
  residentialAddress: addressSchema,
  sameAsResidential: z.boolean(),
  studentEmail: z.string().email('Invalid email'),
  studentPhone: z.string().min(1, 'Phone is required'),
})

interface Step2ContactProps {
  defaultValues?: Partial<Step2Data>
  onSubmit: (data: Step2Data) => void
  formRef: React.RefObject<{ submit: () => void } | null>
}

export function Step2Contact({ defaultValues, onSubmit, formRef }: Step2ContactProps) {
  const form = useForm({
    defaultValues: {
      residentialAddress: defaultValues?.residentialAddress ?? {
        line1: '', line2: '', township: '', city: '', state: '', postalCode: '', country: '',
      },
      sameAsResidential: defaultValues?.sameAsResidential ?? false,
      studentEmail: defaultValues?.studentEmail ?? '',
      studentPhone: defaultValues?.studentPhone ?? '',
    },
    validators: { onSubmit: schema },
    onSubmit: ({ value }) => {
      onSubmit(value as Step2Data)
    },
  })

  if (formRef) {
    (formRef as React.MutableRefObject<{ submit: () => void } | null>).current = {
      submit: () => form.handleSubmit(),
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Contact Information</h2>
        <p className="text-sm text-muted-foreground">Student's residential address and contact details</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Residential Address</h3>
        <div className="grid gap-4">
          <form.Field name="residentialAddress.line1">
            {(field) => (
              <div className="grid gap-1.5">
                <Label>Address Line 1 <span className="text-destructive">*</span></Label>
                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                {field.state.meta.errors[0] && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
              </div>
            )}
          </form.Field>

          <form.Field name="residentialAddress.line2">
            {(field) => (
              <div className="grid gap-1.5">
                <Label>Address Line 2</Label>
                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-3">
            <form.Field name="residentialAddress.township">
              {(field) => (
                <div className="grid gap-1.5">
                  <Label>Township</Label>
                  <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                </div>
              )}
            </form.Field>

            <form.Field name="residentialAddress.city">
              {(field) => (
                <div className="grid gap-1.5">
                  <Label>City <span className="text-destructive">*</span></Label>
                  <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                  {field.state.meta.errors[0] && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <form.Field name="residentialAddress.state">
              {(field) => (
                <div className="grid gap-1.5">
                  <Label>State / Region</Label>
                  <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                </div>
              )}
            </form.Field>

            <form.Field name="residentialAddress.postalCode">
              {(field) => (
                <div className="grid gap-1.5">
                  <Label>Postal Code</Label>
                  <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                </div>
              )}
            </form.Field>

            <form.Field name="residentialAddress.country">
              {(field) => (
                <div className="grid gap-1.5">
                  <Label>Country <span className="text-destructive">*</span></Label>
                  <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                </div>
              )}
            </form.Field>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Student Contact</h3>
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="studentEmail">
            {(field) => (
              <div className="grid gap-1.5">
                <Label>Email Address <span className="text-destructive">*</span></Label>
                <Input type="email" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                {field.state.meta.errors[0] && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
              </div>
            )}
          </form.Field>

          <form.Field name="studentPhone">
            {(field) => (
              <div className="grid gap-1.5">
                <Label>Phone Number <span className="text-destructive">*</span></Label>
                <Input type="tel" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                {field.state.meta.errors[0] && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
              </div>
            )}
          </form.Field>
        </div>
      </div>
    </div>
  )
}
