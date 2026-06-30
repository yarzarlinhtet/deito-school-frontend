import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'
import type { CreateStudentRequest, UpdateStudentRequest, StudentDetailResponse } from '#/generated/model'

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(200),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'] as const),
  nationality: z.string().min(1, 'Nationality is required').max(100),
  placeOfBirth: z.string().max(200),
  religion: z.string().max(100),
  passportNumber: z.string().min(1, 'Passport number is required').max(100),
  passportExpiryDate: z.string(),
  telephoneNumber: z.string().min(1, 'Telephone is required').max(30),
  email: z.string().refine((v) => !v || z.email().safeParse(v).success, 'Invalid email').max(200),
  currentResidentialAddress: z.string().min(1, 'Current address is required'),
  permanentResidentialAddress: z.string(),
  educationBackground: z.string(),
  fatherName: z.string().max(200),
  motherName: z.string().max(200),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required').max(200),
  emergencyContactRelationship: z.string().max(100),
  emergencyContactPhone: z.string().min(1, 'Emergency contact phone is required').max(30),
  remarks: z.string(),
  status: z.enum(['NEW', 'ACTIVE', 'SUSPENDED', 'GRADUATED', 'TRANSFERRED', 'WITHDRAWN'] as const),
})

interface StudentFormProps {
  mode: 'create' | 'edit'
  defaultValues?: StudentDetailResponse
  onSubmit: (data: CreateStudentRequest | UpdateStudentRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export function StudentForm({ mode, defaultValues, onSubmit, onCancel, isLoading }: StudentFormProps) {
  const form = useForm({
    defaultValues: {
      fullName: defaultValues?.fullName ?? '',
      dateOfBirth: defaultValues?.dateOfBirth ?? '',
      gender: (defaultValues?.gender ?? 'MALE') as 'MALE' | 'FEMALE' | 'OTHER',
      nationality: defaultValues?.nationality ?? '',
      placeOfBirth: defaultValues?.placeOfBirth ?? '',
      religion: defaultValues?.religion ?? '',
      passportNumber: defaultValues?.passportNumber ?? '',
      passportExpiryDate: defaultValues?.passportExpiryDate ?? '',
      telephoneNumber: defaultValues?.telephoneNumber ?? '',
      email: defaultValues?.email ?? '',
      currentResidentialAddress: defaultValues?.currentResidentialAddress ?? '',
      permanentResidentialAddress: defaultValues?.permanentResidentialAddress ?? '',
      educationBackground: defaultValues?.educationBackground ?? '',
      fatherName: defaultValues?.fatherName ?? '',
      motherName: defaultValues?.motherName ?? '',
      emergencyContactName: defaultValues?.emergencyContactName ?? '',
      emergencyContactRelationship: defaultValues?.emergencyContactRelationship ?? '',
      emergencyContactPhone: defaultValues?.emergencyContactPhone ?? '',
      remarks: defaultValues?.remarks ?? '',
      status: (defaultValues?.status ?? 'NEW') as 'NEW' | 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'TRANSFERRED' | 'WITHDRAWN',
    },
    validators: { onSubmit: schema },
    onSubmit: ({ value }) => {
      const base = {
        fullName: value.fullName,
        dateOfBirth: value.dateOfBirth,
        gender: value.gender,
        nationality: value.nationality,
        placeOfBirth: value.placeOfBirth || undefined,
        religion: value.religion || undefined,
        passportNumber: value.passportNumber,
        passportExpiryDate: value.passportExpiryDate || undefined,
        telephoneNumber: value.telephoneNumber,
        email: value.email || undefined,
        currentResidentialAddress: value.currentResidentialAddress,
        permanentResidentialAddress: value.permanentResidentialAddress || undefined,
        educationBackground: value.educationBackground || undefined,
        fatherName: value.fatherName || undefined,
        motherName: value.motherName || undefined,
        emergencyContactName: value.emergencyContactName,
        emergencyContactRelationship: value.emergencyContactRelationship || undefined,
        emergencyContactPhone: value.emergencyContactPhone,
        remarks: value.remarks || undefined,
      }
      if (mode === 'edit') {
        onSubmit({ ...base, status: value.status } as UpdateStudentRequest)
      } else {
        onSubmit(base as CreateStudentRequest)
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-6 pb-24"
    >
      {mode === 'edit' && defaultValues?.studentNo && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Student Number</span>
              <span className="font-mono text-sm font-medium">{defaultValues.studentNo}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form.Field name="fullName">
            {(f) => (
              <div>
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input
                  className="mt-1"
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                  placeholder="e.g. Aung Myat Thu"
                />
                {f.state.meta.errors[0] && (
                  <p className="text-xs text-destructive mt-1">{String(f.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="dateOfBirth">
              {(f) => (
                <div>
                  <Label>Date of Birth <span className="text-destructive">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn('mt-1 w-full justify-start text-left font-normal', !f.state.value && 'text-muted-foreground')}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {f.state.value ? format(new Date(f.state.value), 'd MMM yyyy') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        startMonth={new Date(1900, 0)}
                        endMonth={new Date(new Date().getFullYear() + 10, 11)}
                        selected={f.state.value ? new Date(f.state.value) : undefined}
                        onSelect={(date) => f.handleChange(date ? format(date, 'yyyy-MM-dd') : '')}
                      />
                    </PopoverContent>
                  </Popover>
                  {f.state.meta.errors[0] && (
                    <p className="text-xs text-destructive mt-1">{String(f.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="gender">
              {(f) => (
                <div>
                  <Label>Gender <span className="text-destructive">*</span></Label>
                  <Select
                    value={f.state.value}
                    onValueChange={(v) => f.handleChange(v as 'MALE' | 'FEMALE' | 'OTHER')}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {f.state.meta.errors[0] && (
                    <p className="text-xs text-destructive mt-1">{String(f.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="nationality">
              {(f) => (
                <div>
                  <Label>Nationality <span className="text-destructive">*</span></Label>
                  <Input
                    className="mt-1"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                    placeholder="e.g. Myanmar"
                  />
                  {f.state.meta.errors[0] && (
                    <p className="text-xs text-destructive mt-1">{String(f.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="placeOfBirth">
              {(f) => (
                <div>
                  <Label>Place of Birth</Label>
                  <Input
                    className="mt-1"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                    placeholder="e.g. Yangon"
                  />
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="religion">
            {(f) => (
              <div>
                <Label>Religion</Label>
                <Input
                  className="mt-1"
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                  placeholder="e.g. Buddhist"
                />
              </div>
            )}
          </form.Field>
        </CardContent>
      </Card>

      {/* Passport Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Passport Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="passportNumber">
              {(f) => (
                <div>
                  <Label>Passport Number <span className="text-destructive">*</span></Label>
                  <Input
                    className="mt-1 font-mono"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                    placeholder="e.g. MA123456"
                  />
                  {f.state.meta.errors[0] && (
                    <p className="text-xs text-destructive mt-1">{String(f.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="passportExpiryDate">
              {(f) => (
                <div>
                  <Label>Passport Expiry Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn('mt-1 w-full justify-start text-left font-normal', !f.state.value && 'text-muted-foreground')}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {f.state.value ? format(new Date(f.state.value), 'd MMM yyyy') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        startMonth={new Date(1900, 0)}
                        endMonth={new Date(new Date().getFullYear() + 10, 11)}
                        selected={f.state.value ? new Date(f.state.value) : undefined}
                        onSelect={(date) => f.handleChange(date ? format(date, 'yyyy-MM-dd') : '')}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </form.Field>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="telephoneNumber">
              {(f) => (
                <div>
                  <Label>Telephone <span className="text-destructive">*</span></Label>
                  <Input
                    className="mt-1"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                    placeholder="+95 9 ..."
                  />
                  {f.state.meta.errors[0] && (
                    <p className="text-xs text-destructive mt-1">{String(f.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="email">
              {(f) => (
                <div>
                  <Label>Email Address</Label>
                  <Input
                    className="mt-1"
                    type="email"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                    placeholder="student@example.com"
                  />
                  {f.state.meta.errors[0] && (
                    <p className="text-xs text-destructive mt-1">{String(f.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="currentResidentialAddress">
            {(f) => (
              <div>
                <Label>Current Residential Address <span className="text-destructive">*</span></Label>
                <Textarea
                  className="mt-1"
                  rows={2}
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                  placeholder="Street, Township, City, State…"
                />
                {f.state.meta.errors[0] && (
                  <p className="text-xs text-destructive mt-1">{String(f.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="permanentResidentialAddress">
            {(f) => (
              <div>
                <Label>Permanent Residential Address</Label>
                <Textarea
                  className="mt-1"
                  rows={2}
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                  placeholder="Street, Township, City, State…"
                />
              </div>
            )}
          </form.Field>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Education Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form.Field name="educationBackground">
            {(f) => (
              <div>
                <Label>Education Background</Label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                  placeholder="Previous schools, qualifications…"
                />
              </div>
            )}
          </form.Field>
        </CardContent>
      </Card>

      {/* Guardian Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Guardian Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="fatherName">
              {(f) => (
                <div>
                  <Label>Father Name</Label>
                  <Input
                    className="mt-1"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="motherName">
              {(f) => (
                <div>
                  <Label>Mother Name</Label>
                  <Input
                    className="mt-1"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="emergencyContactName">
            {(f) => (
              <div>
                <Label>Emergency Contact Name <span className="text-destructive">*</span></Label>
                <Input
                  className="mt-1"
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
                {f.state.meta.errors[0] && (
                  <p className="text-xs text-destructive mt-1">{String(f.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="emergencyContactRelationship">
              {(f) => (
                <div>
                  <Label>Relationship</Label>
                  <Input
                    className="mt-1"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                    placeholder="e.g. Father, Mother, Sibling"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="emergencyContactPhone">
              {(f) => (
                <div>
                  <Label>Emergency Phone <span className="text-destructive">*</span></Label>
                  <Input
                    className="mt-1"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                    placeholder="+95 9 ..."
                  />
                  {f.state.meta.errors[0] && (
                    <p className="text-xs text-destructive mt-1">{String(f.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>
          </div>
        </CardContent>
      </Card>

      {/* Additional */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form.Field name="remarks">
            {(f) => (
              <div>
                <Label>Remarks</Label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                  placeholder="Any additional notes…"
                />
              </div>
            )}
          </form.Field>

          {mode === 'edit' && (
            <form.Field name="status">
              {(f) => (
                <div>
                  <Label>Status</Label>
                  <Select
                    value={f.state.value ?? 'NEW'}
                    onValueChange={(v) =>
                      f.handleChange(
                        v as 'NEW' | 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'TRANSFERRED' | 'WITHDRAWN',
                      )
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      <SelectItem value="GRADUATED">Graduated</SelectItem>
                      <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                      <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          )}
        </CardContent>
      </Card>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-10 flex justify-end gap-3 border-t bg-background px-6 py-4 shadow-md">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create Student'}
        </Button>
      </div>
    </form>
  )
}
