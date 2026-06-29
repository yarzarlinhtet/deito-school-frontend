import { useState } from 'react'
import { Plus, MoreHorizontal, AlertTriangle } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { StatusBadge } from '#/components/shared/status-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import type { StudentVisaResponse } from '#/generated/model'
import { useStudentVisas, useDeleteVisa } from '../hooks/useStudentVisa'
import { VisaModal } from './VisaModal'

const STATUS_MAP: Record<string, string> = {
  ACTIVE: 'active',
  EXPIRED: 'inactive',
  PENDING: 'pending',
  CANCELLED: 'suspended',
}

function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / 86400000)
}

interface StudentVisaTabProps {
  studentId: string
}

export function StudentVisaTab({ studentId }: StudentVisaTabProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<StudentVisaResponse | undefined>()

  const { data: visas, isLoading } = useStudentVisas(studentId)
  const deleteVisa = useDeleteVisa(studentId)

  const activeVisa = (visas ?? []).find((v) => v.status === 'ACTIVE')
  const activeDays = daysUntil(activeVisa?.expiryDate)
  const showExpiry = activeDays !== null && activeDays <= 30

  function openCreate() {
    setEditTarget(undefined)
    setModalOpen(true)
  }

  function openEdit(visa: StudentVisaResponse) {
    setEditTarget(visa)
    setModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-12 rounded-lg border bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showExpiry && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>
            {activeDays! <= 0
              ? 'Active visa has expired. Renewal required.'
              : `Active visa expires in ${activeDays} days. Renewal recommended.`}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {visas?.length ?? 0} visa record{visas?.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="size-4" />
          Add Visa
        </Button>
      </div>

      {!visas?.length ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No visa records on file.
        </p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Visa Number</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Country</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Issue Date</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Expiry Date</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Sponsor</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Status</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visas.map((visa) => {
                const days = daysUntil(visa.expiryDate)
                return (
                  <tr key={visa.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs">{visa.visaNumber ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{visa.countryOfIssue ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{visa.issueDate ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={
                        visa.status === 'ACTIVE' && days !== null && days <= 30
                          ? 'text-warning font-medium text-sm'
                          : 'text-sm text-muted-foreground'
                      }>
                        {visa.expiryDate ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{visa.sponsor ?? '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={STATUS_MAP[visa.status ?? ''] ?? 'inactive'}
                        label={visa.status ?? '—'}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(visa)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => deleteVisa.mutate(visa.id!)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <VisaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        studentId={studentId}
        editTarget={editTarget}
      />

      {/* Visa History */}
      {(visas ?? []).some((v) => v.status !== 'ACTIVE') && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Visa History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Visa Number</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Country</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Expiry</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(visas ?? [])
                  .filter((v) => v.status !== 'ACTIVE')
                  .map((visa) => (
                    <tr key={visa.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{visa.visaNumber ?? '—'}</td>
                      <td className="px-4 py-3 text-sm">{visa.countryOfIssue ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{visa.expiryDate ?? '—'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={STATUS_MAP[visa.status ?? ''] ?? 'inactive'}
                          label={visa.status ?? '—'}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
