export type StudentStatus = 'active' | 'inactive' | 'suspended' | 'graduated' | 'enrolled'
export type Gender = 'male' | 'female' | 'other'
export type AdmissionType = 'new' | 'transfer' | 're-admission'

export interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone?: string
  avatarUrl?: string
  status: StudentStatus
  gender: Gender
  dateOfBirth: string
  nationality?: string
  religion?: string
  nrc?: string
  passportNumber?: string
  countryOfBirth?: string
  medicalNotes?: string
  // Academic
  academicYearId?: string
  academicYearName?: string
  intakeId?: string
  majorId?: string
  majorName?: string
  className?: string
  sectionName?: string
  admissionDate?: string
  admissionType?: AdmissionType
  feeCategoryId?: string
  feeCategoryName?: string
  // Contact
  residentialAddress?: Address
  homeCountryAddress?: Address
  // Relations
  father?: GuardianInfo
  mother?: GuardianInfo
  emergencyContacts?: EmergencyContact[]
  createdAt: string
  updatedAt: string
}

export interface Address {
  line1: string
  line2?: string
  township?: string
  city: string
  state?: string
  postalCode?: string
  country: string
}

export interface GuardianInfo {
  fullName: string
  nrc?: string
  occupation?: string
  employer?: string
  phone: string
  email?: string
}

export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  altPhone?: string
  email?: string
  bestTimeToCall?: string
}

export interface StudentListParams {
  page?: number
  pageSize?: number
  search?: string
  studentId?: string
  className?: string
  academicYearId?: string
  status?: StudentStatus | ''
}

export interface PaginatedStudents {
  data: Student[]
  total: number
  page: number
  pageSize: number
}

// Finance sub-types used in student profile
export interface StudentFinanceSummary {
  totalBilled: number
  totalPaid: number
  outstanding: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  feeTemplateName?: string
  feeCategoryName?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  feeType: string
  issueDate: string
  dueDate: string
  amount: number
  status: 'draft' | 'pending' | 'paid' | 'overdue'
  paidDate?: string
}

export interface LedgerEntry {
  id: string
  date: string
  type: 'invoice' | 'payment' | 'adjustment' | 'discount'
  reference: string
  description: string
  debit?: number
  credit?: number
  balance: number
}

export interface StudentDocument {
  id: string
  label: string
  fileName?: string
  fileSize?: string
  uploadDate?: string
  status: 'pending' | 'uploaded' | 'verified'
  required: boolean
}

export interface VisaInfo {
  type: string
  number: string
  passportNumber?: string
  country: string
  issueDate: string
  expiryDate: string
  daysUntilExpiry?: number
}
