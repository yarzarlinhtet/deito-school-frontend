import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { RadioGroup, RadioGroupItem } from '#/components/ui/radio-group'
import { Separator } from '#/components/ui/separator'
import { EntitySelector } from '#/components/shared/entity-selector'
import { axiosInstance } from '#/lib/axios'
import type { Step5Data } from '../../hooks/useEnrollWizard'

const schema = z.object({
  academicYearId: z.string().min(1, 'Academic year is required'),
  intakeId: z.string().min(1, 'Intake is required'),
  majorId: z.string().min(1, 'Major is required'),
  duration: z.string(),
  admissionDate: z.string().min(1, 'Admission date is required'),
  admissionType: z.enum(['new', 'transfer', 're-admission']),
  feeCategoryId: z.string(),
})

interface Step5AcademicProps {
  defaultValues?: Partial<Step5Data>
  onSubmit: (data: Step5Data) => void
  formRef: React.RefObject<{ submit: () => void } | null>
}

export function Step5Academic({ defaultValues, onSubmit, formRef }: Step5AcademicProps) {
  const form = useForm({
    defaultValues: {
      academicYearId: defaultValues?.academicYearId ?? '',
      intakeId: defaultValues?.intakeId ?? '',
      majorId: defaultValues?.majorId ?? '',
      duration: defaultValues?.duration ?? '',
      admissionDate: defaultValues?.admissionDate ?? new Date().toISOString().split('T')[0],
      admissionType: (defaultValues?.admissionType ?? 'new') as 'new' | 'transfer' | 're-admission',
      feeCategoryId: defaultValues?.feeCategoryId ?? '',
    },
    validators: { onSubmit: schema },
    onSubmit: ({ value }) => onSubmit(value as Step5Data),
  })

  if (formRef) {
    (formRef as React.MutableRefObject<{ submit: () => void } | null>).current = {
      submit: () => form.handleSubmit(),
    }
  }

  async function fetchAcademicYears(q: string) {
    const res = await axiosInstance.get('/academic-years', { params: { search: q, pageSize: 20 } })
    return res.data.data.map((ay: any) => ({ value: ay.id, label: ay.name }))
  }

  async function fetchIntakes(q: string) {
    const res = await axiosInstance.get('/intakes', { params: { search: q, pageSize: 20 } })
    return res.data.data.map((i: any) => ({ value: i.id, label: i.name }))
  }

  async function fetchMajors(q: string) {
    const res = await axiosInstance.get('/majors', { params: { search: q, pageSize: 20 } })
    return res.data.data.map((m: any) => ({ value: m.id, label: m.name }))
  }

  async function fetchFeeCategories(q: string) {
    const res = await axiosInstance.get('/fee-categories', { params: { search: q, pageSize: 20 } })
    return res.data.data.map((f: any) => ({ value: f.id, label: f.name }))
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Academic Information</h2>
        <p className="text-sm text-muted-foreground">Enrollment and program details</p>
      </div>

      <div className="grid gap-4">
        <form.Field name="academicYearId">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Academic Year <span className="text-destructive">*</span></Label>
              <EntitySelector value={field.state.value} onValueChange={field.handleChange} fetchOptions={fetchAcademicYears} placeholder="Select academic year..." />
              {field.state.meta.errors[0] && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
            </div>
          )}
        </form.Field>

        <form.Field name="intakeId">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Intake <span className="text-destructive">*</span></Label>
              <EntitySelector value={field.state.value} onValueChange={field.handleChange} fetchOptions={fetchIntakes} placeholder="Select intake..." />
              {field.state.meta.errors[0] && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
            </div>
          )}
        </form.Field>

        <form.Field name="majorId">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Major / Program <span className="text-destructive">*</span></Label>
              <EntitySelector value={field.state.value} onValueChange={field.handleChange} fetchOptions={fetchMajors} placeholder="Select major..." />
              {field.state.meta.errors[0] && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="duration">
            {(field) => (
              <div className="grid gap-1.5">
                <Label>Duration</Label>
                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g. 4 Years" />
              </div>
            )}
          </form.Field>

          <form.Field name="admissionDate">
            {(field) => (
              <div className="grid gap-1.5">
                <Label>Admission Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                {field.state.meta.errors[0] && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
              </div>
            )}
          </form.Field>
        </div>

        <Separator />

        <form.Field name="admissionType">
          {(field) => (
            <div className="grid gap-2">
              <Label>Admission Type</Label>
              <RadioGroup
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as Step5Data['admissionType'])}
                className="flex gap-6"
              >
                {[
                  { value: 'new', label: 'New Student' },
                  { value: 'transfer', label: 'Transfer' },
                  { value: 're-admission', label: 'Re-Admission' },
                ].map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <RadioGroupItem value={opt.value} id={`admtype-${opt.value}`} />
                    <Label htmlFor={`admtype-${opt.value}`} className="font-normal cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </form.Field>

        <form.Field name="feeCategoryId">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Fee Category</Label>
              <EntitySelector value={field.state.value} onValueChange={field.handleChange} fetchOptions={fetchFeeCategories} placeholder="Select fee category..." />
            </div>
          )}
        </form.Field>
      </div>
    </div>
  )
}
