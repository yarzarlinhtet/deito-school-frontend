import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { FormDialog } from '#/components/shared/form/FormDialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import { useGenerateInvoice } from '../../hooks/useStudentFinance'

const schema = z.object({
  feeType: z.string().min(1, 'Fee type is required'),
  amount: z.number({ error: 'Amount must be a positive number' }).positive(),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  period: z.string(),
  sendImmediately: z.boolean(),
})

interface GenerateInvoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
}

export function GenerateInvoiceModal({
  open,
  onOpenChange,
  studentId,
}: GenerateInvoiceModalProps) {
  const generate = useGenerateInvoice(studentId)

  const form = useForm({
    defaultValues: {
      feeType: '',
      amount: 0,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      period: '',
      sendImmediately: false,
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      await generate.mutateAsync(value)
      onOpenChange(false)
      form.reset()
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Generate Invoice"
      onSubmit={() => form.handleSubmit()}
      submitLabel="Generate"
      isSubmitting={generate.isPending}
    >
      <div className="grid gap-4">
        <form.Field name="feeType">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Fee Type</Label>
              <Input
                placeholder="e.g. Tuition Fee"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors[0] && (
                <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="amount">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Amount</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
              />
              {field.state.meta.errors[0] && (
                <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field name="issueDate">
            {(field) => (
              <div className="grid gap-1.5">
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="dueDate">
            {(field) => (
              <div className="grid gap-1.5">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="period">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Invoice Period</Label>
              <Input
                placeholder="e.g. Q1 2025"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="sendImmediately">
          {(field) => (
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Send Immediately</p>
                <p className="text-xs text-muted-foreground">Email invoice to student on generation</p>
              </div>
              <Switch
                checked={field.state.value}
                onCheckedChange={field.handleChange}
              />
            </div>
          )}
        </form.Field>
      </div>
    </FormDialog>
  )
}
