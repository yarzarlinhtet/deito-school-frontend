import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Progress } from '#/components/ui/progress'
import { useStudentVisa } from '../hooks/useStudentDocuments'

interface StudentVisaTabProps {
  studentId: string
}

export function StudentVisaTab({ studentId }: StudentVisaTabProps) {
  const { data: visa, isLoading } = useStudentVisa(studentId)

  if (isLoading) {
    return <div className="h-48 rounded-lg border bg-muted animate-pulse" />
  }

  if (!visa) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No visa information on file.
      </p>
    )
  }

  const daysUntil = visa.daysUntilExpiry ?? 0
  const isExpiringSoon = daysUntil > 0 && daysUntil <= 30
  const isExpired = daysUntil <= 0

  const expiryDate = new Date(visa.expiryDate)
  const issueDate = new Date(visa.issueDate)
  const totalDays = Math.ceil((expiryDate.getTime() - issueDate.getTime()) / 86400000)
  const remainingPercent = Math.max(0, Math.min(100, (daysUntil / totalDays) * 100))

  return (
    <div className="max-w-xl space-y-4">
      {(isExpiringSoon || isExpired) && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>
            {isExpired
              ? 'Visa has expired. Renewal required.'
              : `Visa expires in ${daysUntil} days. Renewal recommended.`}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Current Visa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="divide-y divide-border">
            {[
              ['Visa Type', visa.type],
              ['Visa Number', visa.number],
              ['Passport Number', visa.passportNumber],
              ['Country', visa.country],
              ['Issue Date', visa.issueDate],
              ['Expiry Date', visa.expiryDate],
            ].map(([label, value]) => value ? (
              <div key={label} className="grid grid-cols-2 gap-2 py-1.5">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="text-sm font-medium">{value}</dd>
              </div>
            ) : null)}
          </dl>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Validity Progress</span>
              <span className={isExpired ? 'text-destructive' : isExpiringSoon ? 'text-warning' : 'text-success'}>
                {isExpired ? 'Expired' : `${daysUntil} days remaining`}
              </span>
            </div>
            <Progress
              value={remainingPercent}
              className={isExpired ? 'bg-destructive/20' : isExpiringSoon ? '[&>div]:bg-warning' : '[&>div]:bg-success'}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
