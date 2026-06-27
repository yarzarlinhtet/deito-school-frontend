export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// Intake & Batch
export interface IntakeBatch {
  id: string
  name: string
  academicYearId: string
  academicYearName: string
  startDate: string
  endDate: string
  capacity: number
  enrolled: number
  status: 'open' | 'closed' | 'upcoming'
}

// Enrollment History
export interface EnrollmentRecord {
  id: string
  studentId: string
  studentName: string
  studentAvatar?: string
  academicYearName: string
  majorName: string
  action: 'enrolled' | 'transferred' | 'graduated' | 'withdrawn' | 're-enrolled'
  date: string
  performedBy: string
  notes?: string
}
