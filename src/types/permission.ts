// Permission string format: DOMAIN:RESOURCE:ACTION
// Examples: "ACADEMIC:PROGRAM:UPDATE", "FINANCE:PAYMENT:COLLECT"
export type Permission = string

export type PermissionDomain =
  | 'ACADEMIC'
  | 'FINANCE'
  | 'HR'
  | 'STUDENT'
  | 'ADMIN'
  | string
